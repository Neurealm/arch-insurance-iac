// Deterministic cross-entity search catalog. Reads exclusively from the
// currently selected tenant's OperationsProvider state so no cross-tenant
// records ever surface in the palette. Do not import runtime randomness or
// tenant-agnostic scenario fixtures here.

import type { OperationsState } from "@/runops/state/RunOpsProviders";

export type EntityType =
  | "Service" | "Component" | "Runbook" | "Execution" | "Incident"
  | "Problem" | "Change" | "Digital Worker" | "SLO"
  | "Knowledge" | "Evidence" | "Connector";

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  status?: string;
  service?: string;
  source: string;
  freshness: string;
  route: string;
  keywords: string;
}

export function buildSearchCatalog(ops: OperationsState): SearchResult[] {
  const svcName = (id?: string) =>
    id ? (ops.services.find((s) => s.id === id)?.name ?? id) : undefined;
  const fresh = "5m ago";
  const out: SearchResult[] = [];

  ops.services.forEach((s) => out.push({
    id: s.id, type: "Service", title: s.name, status: s.health, service: s.name,
    source: "service-catalog", freshness: fresh,
    route: `/runops/services/${s.id}`,
    keywords: `${s.name} ${s.tier} ${s.region} ${s.environment} ${s.health}`,
  }));

  ops.components.forEach((c) => out.push({
    id: c.id, type: "Component", title: c.name, status: c.health,
    service: svcName(ops.selectedServiceId),
    source: "topology", freshness: fresh,
    route: `/runops/services/${ops.selectedServiceId}/topology#${c.id}`,
    keywords: `${c.name} ${c.kind} ${c.health}`,
  }));

  ops.runbooks.forEach((r) => out.push({
    id: r.id, type: "Runbook", title: `${r.id} · ${r.title}`, status: r.state,
    service: svcName(r.serviceId), source: "runbook-library", freshness: fresh,
    route: `/runops/runbooks/${r.id}`,
    keywords: `${r.id} ${r.title} ${r.version} ${r.state} ${r.autonomy}`,
  }));

  ops.executions.forEach((e) => out.push({
    id: e.id, type: "Execution", title: `${e.id} · ${e.title}`, status: e.state,
    source: "execution-queue", freshness: fresh,
    route: `/runops/executions/${e.id}`,
    keywords: `${e.id} ${e.title} ${e.state} ${e.runbookId} ${e.incidentId}`,
  }));

  out.push({
    id: ops.incident.id, type: "Incident",
    title: `${ops.incident.id} · ${ops.incident.title}`,
    status: `${ops.incident.severity} · ${ops.incident.state}`,
    service: svcName(ops.incident.serviceId),
    source: "incident-manager", freshness: fresh,
    route: `/runops/incidents/${ops.incident.id}`,
    keywords: `${ops.incident.id} ${ops.incident.title} ${ops.incident.severity}`,
  });

  ops.problems.forEach((p) => out.push({
    id: p.id, type: "Problem", title: `${p.id} · ${p.title}`, status: p.state,
    service: svcName(p.serviceId), source: "problem-mgmt", freshness: fresh,
    route: `/runops/problems/actions#${p.id}`,
    keywords: `${p.id} ${p.title} ${p.state}`,
  }));

  ops.changes.forEach((c) => out.push({
    id: c.id, type: "Change", title: `${c.id} · ${c.title}`, status: c.risk,
    service: svcName(c.serviceId), source: "change-mgmt", freshness: c.deployedAt,
    route: `/runops/governance#${c.id}`,
    keywords: `${c.id} ${c.title} ${c.risk} ${c.deployedAt}`,
  }));

  ops.digitalWorkers.forEach((w) => out.push({
    id: w.id, type: "Digital Worker", title: `${w.id} · ${w.role}`, status: w.status,
    source: "worker-fleet", freshness: fresh,
    route: `/runops/workers/${w.id}/studio`,
    keywords: `${w.id} ${w.name} ${w.role} ${w.autonomy} ${w.status}`,
  }));

  ops.slos.forEach((s) => out.push({
    id: s.id, type: "SLO", title: s.name,
    status: `${s.current}% / ${s.target}%`,
    service: svcName(s.serviceId), source: "slo-registry", freshness: fresh,
    route: `/runops/reliability/slos#${s.id}`,
    keywords: `${s.name} ${s.window} SLO error budget`,
  }));

  ops.knowledgeItems.forEach((k) => out.push({
    id: k.id, type: "Knowledge", title: k.title,
    status: k.kind, service: svcName(k.serviceId),
    source: k.source, freshness: k.freshness,
    route: `/runops/knowledge#${k.id}`,
    keywords: `${k.title} ${k.kind} ${k.snippet}`,
  }));

  ops.evidenceItems.forEach((e) => out.push({
    id: e.id, type: "Evidence", title: e.title, status: e.kind,
    source: e.source, freshness: e.capturedAt,
    route: e.incidentId ? `/runops/incidents/${e.incidentId}/investigate#${e.id}` : "/runops",
    keywords: `${e.id} ${e.title} ${e.kind} ${e.source}`,
  }));

  ops.connectors.forEach((c) => out.push({
    id: c.id, type: "Connector", title: c.name, status: c.status,
    source: c.kind, freshness: c.freshness,
    route: `/runops/integrations#${c.id}`,
    keywords: `${c.name} ${c.kind} ${c.status}`,
  }));

  return out;
}

export function filterResults(catalog: SearchResult[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog.slice(0, 40);
  const tokens = q.split(/\s+/).filter(Boolean);
  return catalog
    .map((r) => {
      const hay = `${r.title} ${r.keywords} ${r.type} ${r.status ?? ""} ${r.service ?? ""}`.toLowerCase();
      const score = tokens.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      return { r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map((x) => x.r);
}
