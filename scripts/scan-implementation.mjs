#!/usr/bin/env node
/**
 * Stage 2 — implementation inventory scanner.
 *
 * Walks the repository and classifies implementation artefacts (pages, hooks,
 * contexts, stores, services, API clients, edge functions, navigation entries)
 * so the module registry can report what is not covered by any manifest.
 *
 * Heuristics only. Nothing is deleted, moved or reassigned; every entry keeps
 * the evidence that produced it so a human can review the recommendation.
 *
 * Usage: node scripts/scan-implementation.mjs [--check]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const OUT = "src/modules/generated/implementationInventory.ts";
const ROUTE_TABLE = "src/modules/generated/routeTable.ts";

const NAV_SOURCES = [
  "src/components/eoc/Sidebar.tsx",
  "src/commercial/shell/CommercialLayout.tsx",
  "src/platform/shell/PlatformLayout.tsx",
  "src/runops/shell/routes.ts",
  "src/avep/shell/navigation.ts",
];

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "src/components/ui"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${entry}`;
    if (SKIP_DIRS.has(rel) || SKIP_DIRS.has(entry)) continue;
    const st = statSync(join(ROOT, rel));
    if (st.isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx)$/.test(rel)) out.push(rel);
  }
  return out;
}

function classify(path, source) {
  if (path.startsWith("supabase/functions/")) return "edge-function";
  if (/\.test\.(ts|tsx)$/.test(path)) return "test";
  if (/\/pages\//.test(path)) return "page";
  if (/\/hooks?\//.test(path) || /\/use[A-Z][A-Za-z0-9]*\.tsx?$/.test(path)) return "hook";
  if (/Context\.tsx?$/.test(path) || /\/context\//.test(path)) return "context-provider";
  if (/Store\.tsx?$/.test(path) || /\/state\//.test(path) || /\/store\.ts$/.test(path)) return "state-store";
  if (/\/providers?\//.test(path) || /Provider\.ts$/.test(path)) return "service";
  if (/\/integrations\//.test(path)) return "api-client";
  if (/\/data\//.test(path) || /Data\.ts$/.test(path) || /canonical/.test(path)) return "static-data";
  if (/\/shell\//.test(path) || /Layout\.tsx$/.test(path)) return "layout";
  if (/\.tsx$/.test(path)) return "component";
  if (/\/lib\//.test(path) || /\/utils?\b/.test(path)) return "utility";
  return source.includes("supabase") ? "service" : "module";
}

function importGraph(files) {
  const importedBy = new Map(files.map((f) => [f, []]));
  const specRe = /from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  for (const file of files) {
    const src = readFileSync(join(ROOT, file), "utf8");
    let m;
    while ((m = specRe.exec(src))) {
      const spec = m[1] ?? m[2];
      if (!spec) continue;
      let base;
      if (spec.startsWith("@/")) base = join("src", spec.slice(2));
      else if (spec.startsWith(".")) base = join(dirname(file), spec);
      else continue;
      base = base.split("\\").join("/");
      const candidates = [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`];
      const hit = candidates.find((c) => existsSync(join(ROOT, c)) && statSync(join(ROOT, c)).isFile());
      if (hit && importedBy.has(hit)) importedBy.get(hit).push(file);
    }
  }
  return importedBy;
}

function routeComponentFiles() {
  if (!existsSync(join(ROOT, ROUTE_TABLE))) return new Set();
  const src = readFileSync(join(ROOT, ROUTE_TABLE), "utf8");
  return new Set([...src.matchAll(/"componentFile":\s*"([^"]+)"/g)].map((m) => m[1]));
}

function navigationEntries() {
  const entries = [];
  for (const file of NAV_SOURCES) {
    if (!existsSync(join(ROOT, file))) continue;
    const src = readFileSync(join(ROOT, file), "utf8");
    const re = /(?:to|path|href)\s*:\s*["'](\/[^"']*)["']/g;
    let m;
    while ((m = re.exec(src))) {
      const before = src.slice(Math.max(0, m.index - 240), m.index);
      const label = [...before.matchAll(/label\s*:\s*["']([^"']+)["']/g)].pop()?.[1] ?? null;
      const key = [...before.matchAll(/key\s*:\s*["']([^"']+)["']/g)].pop()?.[1] ?? null;
      entries.push({ navId: key, label, to: m[1], declaredIn: file });
    }
  }
  return entries.filter((e, i, a) => a.findIndex((x) => x.to === e.to && x.declaredIn === e.declaredIn) === i);
}

/** Internal link targets (`<Link to="/x">`, `navigate("/x")`, `href="/x"`). */
function linkTargets(files) {
  const targets = new Set();
  const re = /(?:to|href)\s*=\s*["'](\/[^"'?#]*)["']|navigate\(\s*["'](\/[^"'?#]*)["']/g;
  for (const file of files) {
    const src = readFileSync(join(ROOT, file), "utf8");
    let m;
    while ((m = re.exec(src))) targets.add(m[1] ?? m[2]);
  }
  return [...targets].sort();
}

function build() {
  const files = [...walk("src"), ...(existsSync(join(ROOT, "supabase/functions")) ? walk("supabase/functions") : [])];
  const importedBy = importGraph(files);
  const routeFiles = routeComponentFiles();

  const items = files
    .filter((f) => !/\.test\.(ts|tsx)$/.test(f))
    .filter((f) => !f.startsWith("src/components/ui/"))
    .map((f) => {
      const src = readFileSync(join(ROOT, f), "utf8");
      const type = classify(f, src);
      const consumers = importedBy.get(f) ?? [];
      const onRoute = routeFiles.has(f);
      const activity = onRoute
        ? "active"
        : consumers.length > 0
          ? "active"
          : type === "edge-function" || f === "src/App.tsx" || f === "src/main.tsx"
            ? "active"
            : "unused";
      return {
        ref: f,
        implementationType: type,
        consumerCount: consumers.length,
        reachableViaRoute: onRoute,
        activity,
        usesSupabase: /integrations\/supabase|supabase\.(from|rpc|functions)/.test(src),
        evidence:
          `${consumers.length} import site(s)` + (onRoute ? "; referenced by application route" : ""),
      };
    })
    .sort((a, b) => a.ref.localeCompare(b.ref));

  return { items, navigation: navigationEntries(), linkTargets: linkTargets(files) };
}

function render({ items, navigation, linkTargets: links }) {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced by \`node scripts/scan-implementation.mjs\`.
 * Heuristic inventory used by the unregistered-implementation report.
 */

import type { InventoryItem, NavigationEntry } from "../routeTypes";

export const IMPLEMENTATION_INVENTORY: readonly InventoryItem[] = ${JSON.stringify(items, null, 1)} as const;

export const NAVIGATION_ENTRIES: readonly NavigationEntry[] = ${JSON.stringify(navigation, null, 1)} as const;

/** Every internal link target found in source — used for reachability checks. */
export const LINK_TARGETS: readonly string[] = ${JSON.stringify(links, null, 1)} as const;
`;
}

const data = build();
if (process.argv.includes("--check")) {
  const current = existsSync(join(ROOT, OUT)) ? readFileSync(join(ROOT, OUT), "utf8") : "";
  if (current !== render(data)) {
    console.error("Implementation inventory is stale. Run: node scripts/scan-implementation.mjs");
    process.exit(1);
  }
  console.log(`Inventory up to date (${data.items.length} items).`);
} else {
  mkdirSync(dirname(join(ROOT, OUT)), { recursive: true });
  writeFileSync(join(ROOT, OUT), render(data));
  console.log(
    `Wrote ${OUT} (${data.items.length} items, ${data.navigation.length} navigation entries).`,
  );
}
export { build };
