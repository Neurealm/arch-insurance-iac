#!/usr/bin/env node
/**
 * Stage 3 — domain-signal scanner.
 *
 * Extracts *observed* domain facts per source cluster so that candidate-module
 * discovery and the shared/platform capability registries are backed by real
 * implementation rather than by folder names:
 *
 *   - Supabase tables read or written (`.from("table")`)
 *   - RPC functions invoked (`.rpc("fn")`)
 *   - Edge functions invoked (`.functions.invoke("name")`) and declared
 *   - Agent / workflow / integration references
 *
 * Output: src/modules/generated/domainSignals.ts (committed, no build step).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "src/modules/generated/domainSignals.ts";

/**
 * Source clusters. A cluster is a *candidate* boundary, not a decision: it is
 * the coarsest grouping the repository layout can justify.
 */
const CLUSTERS = [
  ["sre", [/^src\/pages\/prod-twin\//, /^src\/components\/sre-twin\//]],
  ["sre-data-orchestration", [/^src\/pages\/data-orchestration-twin\//]],
  ["commercial", [/^src\/commercial\//, /^src\/features\/commercial-guide\//]],
  ["runops", [/^src\/runops\//]],
  ["avep", [/^src\/avep\//, /^src\/silicon\//]],
  ["cae", [/^src\/platform\/cae\//]],
  ["platform", [/^src\/platform\//, /^src\/integrations\//, /^src\/components\/auth\//]],
  ["practice-library", [/^src\/pages\/practice-library\//]],
  ["coworkers", [/^src\/pages\/coworkers\//, /^src\/pages\/Coworkers/]],
  ["agentic-ai-studio", [/^src\/pages\/neurealm-agentic-ai\//]],
  ["carve-out", [/^src\/pages\/carve-out\//, /^src\/data\/carveout/]],
  ["questionnaires", [/questionnaire/i]],
  ["crm", [/^src\/(pages|components|hooks)\/crm\//]],
  ["etdm", [/etdm/i]],
  ["itsm", [/^src\/pages\/itsm\//]],
  ["edge-functions", [/^supabase\/functions\//]],
];

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "generated"]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(join(ROOT, dir))) {
    if (SKIP_DIRS.has(entry)) continue;
    const rel = `${dir}/${entry}`;
    const st = statSync(join(ROOT, rel));
    if (st.isDirectory()) walk(rel, acc);
    else if (/\.(ts|tsx)$/.test(rel) && !/\.test\.tsx?$/.test(rel)) acc.push(rel);
  }
  return acc;
}

const clusterOf = (ref) => CLUSTERS.find(([, pats]) => pats.some((p) => p.test(ref)))?.[0] ?? null;

const collect = (src, re) => [...src.matchAll(re)].map((m) => m[1]).filter(Boolean);

function build() {
  const files = [...walk("src"), ...(existsSync(join(ROOT, "supabase/functions")) ? walk("supabase/functions") : [])];
  /** @type {Map<string, {tables:Set<string>,rpcs:Set<string>,edgeFunctions:Set<string>,agentRefs:Set<string>,workflowRefs:Set<string>,integrationRefs:Set<string>,files:number,supabaseFiles:number}>} */
  const byCluster = new Map();

  const ensure = (id) => {
    if (!byCluster.has(id)) {
      byCluster.set(id, {
        tables: new Set(),
        rpcs: new Set(),
        edgeFunctions: new Set(),
        agentRefs: new Set(),
        workflowRefs: new Set(),
        integrationRefs: new Set(),
        files: 0,
        supabaseFiles: 0,
      });
    }
    return byCluster.get(id);
  };

  for (const file of files) {
    const id = clusterOf(file);
    if (!id) continue;
    const src = readFileSync(join(ROOT, file), "utf8");
    const c = ensure(id);
    c.files += 1;

    const tables = collect(src, /\.from\(\s*["']([a-zA-Z0-9_]+)["']/g);
    const rpcs = collect(src, /\.rpc\(\s*["']([a-zA-Z0-9_]+)["']/g);
    const invoked = collect(src, /functions\.invoke\(\s*["']([a-zA-Z0-9_-]+)["']/g);
    tables.forEach((t) => c.tables.add(t));
    rpcs.forEach((r) => c.rpcs.add(r));
    invoked.forEach((f) => c.edgeFunctions.add(f));
    if (file.startsWith("supabase/functions/")) {
      const name = file.split("/")[2];
      if (name && name !== "_shared") c.edgeFunctions.add(name);
    }
    if (tables.length || rpcs.length || invoked.length) c.supabaseFiles += 1;

    // Agents / workflows / integrations are only recorded when a concrete
    // identifier is present; a prose mention of "agent" is not a signal.
    collect(src, /agent(?:Id|_id)\s*[:=]\s*["']([a-zA-Z0-9_.-]+)["']/g).forEach((a) => c.agentRefs.add(a));
    collect(src, /\.from\(\s*["'](tenant_agent_assignments|[a-z0-9_]*agents?)["']/g).forEach((a) =>
      c.agentRefs.add(`table:${a}`),
    );
    collect(src, /workflow(?:Id|_id)\s*[:=]\s*["']([a-zA-Z0-9_.-]+)["']/g).forEach((w) => c.workflowRefs.add(w));
    collect(src, /\.from\(\s*["']([a-z0-9_]*integrations?)["']/g).forEach((i) =>
      c.integrationRefs.add(`table:${i}`),
    );
  }

  return [...byCluster.entries()]
    .map(([clusterId, v]) => ({
      clusterId,
      fileCount: v.files,
      supabaseFileCount: v.supabaseFiles,
      databaseEntities: [...v.tables].sort(),
      rpcFunctions: [...v.rpcs].sort(),
      edgeFunctions: [...v.edgeFunctions].sort(),
      agentRefs: [...v.agentRefs].sort(),
      workflowRefs: [...v.workflowRefs].sort(),
      integrationRefs: [...v.integrationRefs].sort(),
    }))
    .sort((a, b) => a.clusterId.localeCompare(b.clusterId));
}

const signals = build();
const out = `/**
 * GENERATED by scripts/scan-domain-signals.mjs — do not edit by hand.
 *
 * Observed domain signals per source cluster. Absence of a signal means the
 * scanner found no evidence, never that a capability was judged unimportant.
 */

import type { DomainSignal } from "../classificationTypes";

export const DOMAIN_SIGNALS: readonly DomainSignal[] = ${JSON.stringify(signals, null, 1)} as const;
`;
writeFileSync(join(ROOT, OUT), out);
console.log(`Wrote ${OUT} (${signals.length} clusters).`);
