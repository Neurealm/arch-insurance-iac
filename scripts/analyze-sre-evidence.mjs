#!/usr/bin/env node
/**
 * Stage 2 — SRE indirect-dependency and evidence-strength analyzer.
 *
 * Stage 1 classified every SRE capability as `mock` or `static` because no SRE
 * page imports the Supabase client directly. Stage 2 tests that conclusion by
 * following the import graph out of each SRE page (hooks, services, contexts,
 * stores, adapters, fixtures) and recording *why* each page ends up with the
 * evidence strength it has.
 *
 * Usage: node scripts/analyze-sre-evidence.mjs [--check]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const OUT = "src/modules/sre/evidence.generated.ts";
const ROUTE_TABLE = "src/modules/generated/routeTable.ts";
const SRE_PREFIX = "src/pages/prod-twin/";

const resolveSpec = (fromFile, spec) => {
  let base;
  if (spec.startsWith("@/")) base = join("src", spec.slice(2));
  else if (spec.startsWith(".")) base = join(dirname(fromFile), spec);
  else return null;
  base = base.split("\\").join("/");
  const candidates = [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`];
  return candidates.find((c) => existsSync(join(ROOT, c)) && statSync(join(ROOT, c)).isFile()) ?? null;
};

function importsOf(file) {
  const src = readFileSync(join(ROOT, file), "utf8");
  const out = [];
  const re = /from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1] ?? m[2];
    const resolved = resolveSpec(file, spec);
    if (resolved) out.push(resolved);
  }
  return out;
}

/**
 * Platform chrome: shell, auth, tenancy and telemetry that every page inherits.
 * These reach Supabase, but they are *not* evidence that a capability is
 * database backed, so the trace records them separately and does not expand
 * through them.
 */
const CHROME = [
  /^src\/components\/eoc\//,
  /^src\/platform\//,
  /^src\/context\/AuthContext\./,
  /^src\/context\/PersonaContext\./,
  /^src\/hooks\/use-toast\./,
  /^src\/hooks\/use-mobile\./,
  /^src\/hooks\/usePageActivityTracker\./,
  /^src\/hooks\/useUserProfile\./,
  /^src\/hooks\/useTenantScope\./,
  /^src\/integrations\/lovable\//,
  /^src\/lib\//,
];
const isChrome = (f) => CHROME.some((re) => re.test(f));

/**
 * Transitive closure of local imports, excluding shadcn primitives and not
 * expanding through platform chrome.
 */
function closure(entry, limit = 400) {
  const seen = new Set();
  const chrome = new Set();
  const queue = [entry];
  while (queue.length && seen.size < limit) {
    const file = queue.shift();
    for (const dep of importsOf(file)) {
      if (dep.startsWith("src/components/ui/")) continue;
      if (isChrome(dep)) {
        chrome.add(dep);
        continue;
      }
      if (seen.has(dep)) continue;
      seen.add(dep);
      queue.push(dep);
    }
  }
  return { deps: [...seen], chrome: [...chrome] };
}

function routesFor(file) {
  if (!existsSync(join(ROOT, ROUTE_TABLE))) return [];
  const src = readFileSync(join(ROOT, ROUTE_TABLE), "utf8");
  const table = JSON.parse(
    src.slice(src.indexOf("= [", src.indexOf("APPLICATION_ROUTES")) + 2, src.lastIndexOf("]") + 1),
  );
  return table.filter((r) => r.componentFile === file).map((r) => r.path);
}

function analyze(file) {
  const src = readFileSync(join(ROOT, file), "utf8");
  const { deps, chrome } = closure(file);
  const all = [file, ...deps];
  const text = all.map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n");

  const backing = new Set();
  const evidence = [];
  const traced = [];

  const supabaseDeps = deps.filter((d) => /integrations\/supabase/.test(d));
  const supabaseUse = /supabase\s*\.\s*(from|rpc|functions|auth|storage)\b/.test(text);
  if (supabaseDeps.length || supabaseUse) {
    backing.add("supabase");
    evidence.push(`Supabase reached indirectly via ${supabaseDeps.join(", ") || "a transitive dependency"}`);
    traced.push(...supabaseDeps);
  }
  const edgeCalls = [...text.matchAll(/functions\s*\.\s*invoke\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
  if (edgeCalls.length) {
    backing.add("edge-function");
    evidence.push(`Edge function invocation(s): ${[...new Set(edgeCalls)].join(", ")}`);
  }
  if (/\bfetch\(|axios\./.test(text)) {
    backing.add("internal-api");
    evidence.push("Direct HTTP call detected in the page or one of its dependencies");
  }
  const hookDeps = deps.filter((d) => /\/hooks?\//.test(d) || /\/use[A-Z][A-Za-z0-9]*\.tsx?$/.test(d));
  const contextDeps = deps.filter((d) => /\/context\//.test(d) || /Context\.tsx?$/.test(d));
  const serviceDeps = deps.filter((d) => /\/(services?|providers?)\//.test(d));
  if (contextDeps.length) {
    backing.add("client-generated-state");
    evidence.push(`Shared React context (client state): ${contextDeps.join(", ")}`);
    traced.push(...contextDeps);
  }
  if (hookDeps.length || serviceDeps.length) {
    backing.add("shared-service");
    evidence.push(
      `Shared hook/service imports: ${[...hookDeps, ...serviceDeps].slice(0, 6).join(", ")}`,
    );
    traced.push(...hookDeps, ...serviceDeps);
  }
  const fixtureDeps = deps.filter((d) => /\/data\//.test(d) || /Data\.tsx?$/.test(d) || /frictionPanelData/.test(d));
  if (fixtureDeps.length) {
    backing.add("local-fixture");
    evidence.push(`Static fixture imports: ${fixtureDeps.join(", ")}`);
    traced.push(...fixtureDeps);
  }
  const interactive = /useState|useReducer|onClick|onChange/.test(src);
  if (interactive) {
    backing.add("client-generated-state");
    evidence.push("Local React state or event handlers present (client-side behaviour only)");
  }
  if (chrome.length) {
    evidence.push(
      `Platform chrome inherited (not capability evidence): ${chrome.slice(0, 6).join(", ")}`,
    );
  }
  if (backing.size === 0) {
    backing.add("hard-coded-static");
    evidence.push("No imports beyond presentation primitives; content is literal JSX");
  }

  let strength;
  if (backing.has("supabase")) strength = "database-backed";
  else if (backing.has("edge-function")) strength = "api-backed";
  else if (backing.has("internal-api")) strength = "api-backed";
  else if (backing.has("shared-service")) strength = "shared-service-backed";
  else if (backing.has("client-generated-state")) strength = "client-side-functional";
  else if (backing.has("local-fixture")) strength = "static-data";
  else strength = "visual-only";

  const routes = routesFor(file);
  return {
    ref: file,
    route: routes[0] ?? null,
    evidenceStrength: strength,
    dataBacking: [...backing].sort(),
    tracedDependencies: [...new Set(traced)].sort(),
    interactive,
    evidence,
    platformChrome: chrome.sort(),
    confidence: routes.length ? "high" : "medium",
  };
}

function build() {
  const files = readFileSync(join(ROOT, ROUTE_TABLE), "utf8");
  const table = JSON.parse(
    files.slice(files.indexOf("= [", files.indexOf("APPLICATION_ROUTES")) + 2, files.lastIndexOf("]") + 1),
  );
  const pages = [
    ...new Set(
      table
        .map((r) => r.componentFile)
        .filter((f) => f && f.startsWith(SRE_PREFIX)),
    ),
  ].sort();
  return pages.map(analyze);
}

function render(records) {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced by \`node scripts/analyze-sre-evidence.mjs\`.
 * Indirect dependency tracing and evidence strength for every routed SRE page.
 */

import type { EvidenceRecord } from "../routeTypes";

export const SRE_PAGE_EVIDENCE: readonly EvidenceRecord[] = ${JSON.stringify(records, null, 1)} as const;
`;
}

const records = build();
if (process.argv.includes("--check")) {
  const current = existsSync(join(ROOT, OUT)) ? readFileSync(join(ROOT, OUT), "utf8") : "";
  if (current !== render(records)) {
    console.error("SRE evidence data is stale. Run: node scripts/analyze-sre-evidence.mjs");
    process.exit(1);
  }
  console.log(`SRE evidence up to date (${records.length} pages).`);
} else {
  mkdirSync(dirname(join(ROOT, OUT)), { recursive: true });
  writeFileSync(join(ROOT, OUT), render(records));
  console.log(`Wrote ${OUT} (${records.length} pages).`);
}
