#!/usr/bin/env node
/**
 * Stage 2 — route-table extractor.
 *
 * Parses the real application router (`src/App.tsx`) and emits a declarative
 * route table to `src/modules/generated/routeTable.ts`.
 *
 * The extractor is deliberately conservative: anything it cannot resolve from
 * source (computed paths, mapped route factories, wrapper-only elements) is
 * emitted with `resolution: "unable-to-verify"` rather than guessed.
 *
 * Usage: node scripts/extract-route-table.mjs [--check]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const ROOT = process.cwd();
const APP = "src/App.tsx";
const OUT = "src/modules/generated/routeTable.ts";

/** Components that wrap a page but are not the page itself. */
const WRAPPERS = new Set([
  "ProtectedRoute",
  "PermissionRoute",
  "ScenarioStateProvider",
  "GuidedInvestigationProvider",
  "EvidenceGraphProvider",
  "PersonaProvider",
  "LazyRouteBoundary",
  "Suspense",
]);

/** Layout components — a route whose element is one of these renders children. */
const LAYOUT_HINT = /(Layout|Shell)$/;

function parseImports(src) {
  const map = new Map(); // localName -> { file, lazy }
  const importRe = /import\s+(?:([A-Za-z0-9_$]+)\s*,\s*)?(?:\{([^}]*)\})?\s*(?:([A-Za-z0-9_$]+)\s*)?from\s*["']([^"']+)["'];?/g;
  let m;
  while ((m = importRe.exec(src))) {
    const [, defA, named, defB, spec] = m;
    const def = defA ?? defB;
    if (def) map.set(def, { spec, lazy: false });
    if (named) {
      for (const part of named.split(",")) {
        const name = part.split(" as ").pop().trim();
        if (name) map.set(name, { spec, lazy: false });
      }
    }
  }
  const lazyRe = /const\s+([A-Za-z0-9_$]+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*["']([^"']+)["']\s*\)\s*\)/g;
  while ((m = lazyRe.exec(src))) map.set(m[1], { spec: m[2], lazy: true });
  return map;
}

/** Resolve an import specifier to a repo-relative file path, if it exists. */
function resolveFile(spec) {
  let base;
  if (spec.startsWith("@/")) base = join("src", spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = normalize(join("src", spec));
  else return null; // package import
  const candidates = [base, `${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")];
  for (const c of candidates) {
    if (existsSync(join(ROOT, c))) return c.split("\\").join("/");
  }
  return null;
}

/** Split the raw attribute text of a <Route ...> tag. */
function readTag(src, start) {
  // start points at "<Route"
  let i = start + "<Route".length;
  let depth = 0;
  let quote = null;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === ">" && depth === 0) {
      const selfClosing = src[i - 1] === "/";
      return { attrs: src.slice(start + 6, selfClosing ? i - 1 : i), end: i + 1, selfClosing };
    }
    i++;
  }
  throw new Error("Unterminated <Route> tag");
}

function joinPath(parent, child) {
  if (child === null) return parent; // index route
  if (child.startsWith("/")) return child;
  const base = parent === "/" ? "" : parent.replace(/\/$/, "");
  return `${base}/${child}`.replace(/\/{2,}/g, "/");
}

export function extractRoutes() {
  const src = readFileSync(join(ROOT, APP), "utf8");
  const imports = parseImports(src);
  const routes = [];
  const stack = []; // { path, component }

  let cursor = 0;
  while (true) {
    let nextOpen = src.indexOf("<Route", cursor);
    // "<Routes>" is not a route element.
    while (nextOpen !== -1 && /[A-Za-z0-9_$]/.test(src[nextOpen + 6] ?? "")) {
      nextOpen = src.indexOf("<Route", nextOpen + 6);
    }
    const nextClose = src.indexOf("</Route>", cursor);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen)) {
      stack.pop();
      cursor = nextClose + "</Route>".length;
      continue;
    }
    const { attrs, end, selfClosing } = readTag(src, nextOpen);
    cursor = end;

    const literalPath = /(?:^|\s)path\s*=\s*"([^"]*)"/.exec(attrs);
    const exprPath = /(?:^|\s)path\s*=\s*\{/.test(attrs);
    const isIndex = /(?:^|\s)index(\s|$|=)/.test(attrs);

    const parent = stack.length ? stack[stack.length - 1] : null;
    const parentPath = parent ? parent.path : "";

    const components = [...attrs.matchAll(/<([A-Z][A-Za-z0-9_$]*)/g)].map((x) => x[1]);
    const chain = components.filter((c) => !WRAPPERS.has(c));
    const component = chain.length ? chain[chain.length - 1] : (components.at(-1) ?? null);
    const guards = components.filter((c) => WRAPPERS.has(c));
    const permission = /permission\s*=\s*"([^"]+)"/.exec(attrs)?.[1] ?? null;
    const redirectTo =
      component === "Navigate" ? (/to\s*=\s*"([^"]+)"/.exec(attrs)?.[1] ?? null) : null;

    const imported = component ? imports.get(component) : undefined;
    const componentFile = imported ? resolveFile(imported.spec) : null;

    let path;
    let resolution = "static";
    if (exprPath) {
      path = `${parentPath}/<computed>`;
      resolution = "unable-to-verify";
    } else if (isIndex && !literalPath) {
      path = parentPath || "/";
    } else {
      path = joinPath(parentPath || "", literalPath ? literalPath[1] : "");
    }
    if (path === "") path = "/";

    const isLayout = !selfClosing || (component ? LAYOUT_HINT.test(component) : false);

    routes.push({
      path,
      routeId: null,
      component,
      componentFile,
      lazy: imported?.lazy ?? false,
      parentLayout: parent?.component ?? null,
      parentPath: parent ? parent.path : null,
      isIndex: Boolean(isIndex && !literalPath),
      isLayout: Boolean(!selfClosing),
      isDynamic: path.includes(":") || resolution === "unable-to-verify",
      isCatchAll: path.endsWith("*"),
      guards,
      permission,
      redirectTo,
      resolution,
      declaredIn: APP,
    });

    if (!selfClosing) stack.push({ path, component });
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

function render(routes) {
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced by \`node scripts/extract-route-table.mjs\` from ${APP}.
 * Regenerate after any change to the application router.
 */

import type { ApplicationRoute } from "../routeTypes";

export const ROUTE_TABLE_SOURCE = ${JSON.stringify(APP)} as const;

export const APPLICATION_ROUTES: readonly ApplicationRoute[] = ${JSON.stringify(routes, null, 2)} as const;
`;
}

const routes = extractRoutes();
if (process.argv.includes("--check")) {
  const current = existsSync(join(ROOT, OUT)) ? readFileSync(join(ROOT, OUT), "utf8") : "";
  if (current !== render(routes)) {
    console.error("Route table is stale. Run: node scripts/extract-route-table.mjs");
    process.exit(1);
  }
  console.log(`Route table up to date (${routes.length} routes).`);
} else {
  mkdirSync(dirname(join(ROOT, OUT)), { recursive: true });
  writeFileSync(join(ROOT, OUT), render(routes));
  console.log(`Wrote ${OUT} (${routes.length} routes).`);
}
