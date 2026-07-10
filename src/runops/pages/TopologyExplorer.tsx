/**
 * Page 6 · Topology & Dependency Explorer (route `/runops/services/:serviceId/topology`)
 *
 * Live service topology derived from OperationsProvider. Uses the shared
 * TopologyCanvas. No page-local fixtures.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight, ArrowUpLeft, Download, Layers, Maximize2, RotateCcw,
  Search as SearchIcon, Sparkles, Target, Zap,
} from "lucide-react";
import {
  TopologyCanvas, SearchInput, EmptyState, StaleDataState,
  StatusIndicator, FreshnessIndicator, MetricCard,
  type GraphNode, type GraphEdge,
} from "@/runops/components";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import type { BusinessService, Component } from "@/runops/data/scenario";

const DEFAULT_SERVICE_ID = "svc-global-order-processing";
const STALE_THRESHOLD_MS = 5 * 60 * 1000;
const LARGE_GRAPH_THRESHOLD = 24;

type Overlay = "health" | "latency" | "change" | "incident" | "ownership";
type LayerKey =
  | "service" | "journey" | "application" | "api" | "workload"
  | "database" | "cache" | "queue" | "network" | "identity"
  | "vendor" | "team";

const LAYER_ORDER: LayerKey[] = [
  "team", "service", "journey", "application", "api",
  "workload", "database", "cache", "queue", "network", "identity", "vendor",
];

const LAYER_LABEL: Record<LayerKey, string> = {
  service: "Business service", journey: "Customer journeys", application: "Applications",
  api: "APIs", workload: "Kubernetes workloads", database: "Databases", cache: "Caches",
  queue: "Queues", network: "Network", identity: "Identity", vendor: "External providers",
  team: "Teams",
};

const LAYER_X: Record<LayerKey, number> = {
  team: 0, service: 220, journey: 440, application: 660, api: 660,
  workload: 880, database: 1100, cache: 1100, queue: 1100,
  network: 880, identity: 880, vendor: 1100,
};
const LAYER_Y_OFFSET: Record<LayerKey, number> = {
  team: 0, service: 0, journey: 0, application: 0, api: 200,
  workload: 0, database: 0, cache: 140, queue: 280,
  network: 320, identity: 460, vendor: 400,
};

function componentLayer(kind: Component["kind"]): LayerKey {
  switch (kind) {
    case "api":      return "api";
    case "compute":  return "workload";
    case "database": return "database";
    case "cache":    return "cache";
    case "queue":    return "queue";
    case "network":  return "network";
    case "identity": return "identity";
    case "vendor":   return "vendor";
    default:         return "application";
  }
}

function healthTone(h: string): GraphNode["tone"] {
  switch (h) {
    case "Healthy":           return "healthy";
    case "At Risk":           return "warning";
    case "Degraded":          return "warning";
    case "Severely Degraded":
    case "Unavailable":       return "failure";
    case "Recovering":        return "connected";
    default:                  return "neutral";
  }
}

function ownerForService(id: string): string {
  if (id.includes("order"))    return "Checkout Squad";
  if (id.includes("payment"))  return "Payments Squad";
  if (id.includes("identity")) return "Identity Squad";
  return "Platform Squad";
}

interface TopologyNodeMeta {
  layer: LayerKey;
  refId?: string;       // componentId / serviceId
  owner?: string;
  health?: string;
  latencyMs?: number;
  changeIds?: string[];
  incidentIds?: string[];
}

export default function TopologyExplorer() {
  const params = useParams<{ serviceId: string }>();
  const serviceId = params.serviceId ?? DEFAULT_SERVICE_ID;
  const ops = useOperations();
  const { openDrawer } = useRightDrawer();
  const navigate = useNavigate();

  const service: BusinessService | undefined = ops.services.find((s) => s.id === serviceId);

  const [visibleLayers, setVisibleLayers] = useState<Set<LayerKey>>(new Set(LAYER_ORDER));
  const [overlay, setOverlay] = useState<Overlay>("health");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [direction, setDirection] = useState<"none" | "upstream" | "downstream">("none");
  const [blastRadius, setBlastRadius] = useState<boolean>(false);
  const [simFailed, setSimFailed] = useState<Set<string>>(new Set());
  const [simDialogOpen, setSimDialogOpen] = useState(false);
  const [beforeAfter, setBeforeAfter] = useState<"live" | "before" | "after">("live");
  const [canvasKey, setCanvasKey] = useState(0);

  const dataFreshnessMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
  const stale = dataFreshnessMs > STALE_THRESHOLD_MS;

  /* ------------------------ Derive full topology ------------------------ */

  const { allNodes, allEdges, meta } = useMemo(() => {
    if (!service) return { allNodes: [] as GraphNode[], allEdges: [] as GraphEdge[], meta: new Map<string, TopologyNodeMeta>() };

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const metaMap = new Map<string, TopologyNodeMeta>();

    const owner = ownerForService(service.id);
    const teamId = `team-${owner.replace(/\s+/g, "-").toLowerCase()}`;
    nodes.push({ id: teamId, label: owner, sublabel: "Team" });
    metaMap.set(teamId, { layer: "team", owner });

    // Business service
    nodes.push({ id: service.id, label: service.name, sublabel: service.tier, tone: healthTone(service.health) });
    metaMap.set(service.id, { layer: "service", refId: service.id, owner, health: service.health });
    edges.push({ source: teamId, target: service.id, label: "owns" });

    // Customer journeys
    const journeys = service.id.includes("order")
      ? ["Guest checkout", "Registered checkout", "Post-order status"]
      : service.id.includes("payment")
      ? ["Card authorization", "3DS challenge", "Refund"]
      : ["Sign-in", "MFA challenge", "Token refresh"];
    journeys.forEach((j, i) => {
      const id = `journey-${service.id}-${i}`;
      nodes.push({ id, label: j, sublabel: "Journey", tone: i === 0 && service.health !== "Healthy" ? "warning" : "healthy" });
      metaMap.set(id, { layer: "journey" });
      edges.push({ source: service.id, target: id, label: "delivers" });
    });

    // Applications umbrella
    const appId = `app-${service.id}`;
    nodes.push({ id: appId, label: `${service.name} App`, sublabel: "Application", tone: healthTone(service.health) });
    metaMap.set(appId, { layer: "application", owner });
    edges.push({ source: service.id, target: appId, label: "runs on" });

    // Components
    const serviceComponents = ops.components.filter((c) => service.componentIds.includes(c.id));
    serviceComponents.forEach((c) => {
      nodes.push({
        id: c.id,
        label: c.name,
        sublabel: c.kind,
        tone: healthTone(c.health),
      });
      const layer = componentLayer(c.kind);
      const relatedChange = ops.changes.find((ch) => ch.serviceId === service.id);
      const relatedIncident = ops.incident.serviceId === service.id ? ops.incident.id : undefined;
      metaMap.set(c.id, {
        layer,
        refId: c.id,
        owner,
        health: c.health,
        latencyMs: c.kind === "database" ? 620 : c.kind === "api" ? 340 : 120,
        changeIds: relatedChange ? [relatedChange.id] : [],
        incidentIds: relatedIncident ? [relatedIncident] : [],
      });
    });

    // Wire common component edges
    const idsByKind = new Map<Component["kind"], string[]>();
    serviceComponents.forEach((c) => {
      const list = idsByKind.get(c.kind) ?? [];
      list.push(c.id);
      idsByKind.set(c.kind, list);
    });
    const apis     = idsByKind.get("api")      ?? [];
    const computes = idsByKind.get("compute")  ?? [];
    const dbs      = idsByKind.get("database") ?? [];
    const caches   = idsByKind.get("cache")    ?? [];
    const queues   = idsByKind.get("queue")    ?? [];
    const networks = idsByKind.get("network")  ?? [];
    const identity = idsByKind.get("identity") ?? [];
    const vendors  = idsByKind.get("vendor")   ?? [];

    apis.forEach((a) => edges.push({ source: appId, target: a, label: "exposes" }));
    apis.forEach((a) => computes.forEach((w) => edges.push({ source: a, target: w, label: "invokes" })));
    computes.forEach((w) => dbs.forEach((d) => edges.push({ source: w, target: d, label: "reads/writes" })));
    computes.forEach((w) => caches.forEach((c) => edges.push({ source: w, target: c, label: "caches" })));
    computes.forEach((w) => queues.forEach((q) => edges.push({ source: w, target: q, label: "enqueues" })));
    apis.forEach((a) => networks.forEach((n) => edges.push({ source: n, target: a, label: "ingress", dashed: true })));
    apis.forEach((a) => identity.forEach((i) => edges.push({ source: a, target: i, label: "auth" })));
    computes.forEach((w) => vendors.forEach((v) => edges.push({ source: w, target: v, label: "calls", dashed: true })));

    // Assign layered coordinates
    const perLayerCount = new Map<LayerKey, number>();
    const positioned = nodes.map((n) => {
      const m = metaMap.get(n.id);
      const layer = m?.layer ?? "application";
      const idx = perLayerCount.get(layer) ?? 0;
      perLayerCount.set(layer, idx + 1);
      return { ...n, x: LAYER_X[layer], y: LAYER_Y_OFFSET[layer] + idx * 90 };
    });

    return { allNodes: positioned, allEdges: edges, meta: metaMap };
  }, [service, ops.components, ops.changes, ops.incident]);

  const largeGraphMode = allNodes.length > LARGE_GRAPH_THRESHOLD;

  /* --------------------------- Filtered view ---------------------------- */

  const { filteredNodes, filteredEdges, disconnectedIds, unknownEdges } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const layerOk = (id: string) => {
      const m = meta.get(id);
      return !m || visibleLayers.has(m.layer);
    };
    let nodes = allNodes.filter((n) => layerOk(n.id));
    if (q) nodes = nodes.filter((n) => n.label.toLowerCase().includes(q) || n.sublabel?.toLowerCase().includes(q));

    // Environment / region: demo dataset has one env; simulate filter by dimming if mismatched
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = allEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Apply overlay recoloring & failure sim & before/after
    const styledNodes: GraphNode[] = nodes.map((n) => {
      const m = meta.get(n.id);
      let tone = n.tone;
      if (simFailed.has(n.id)) tone = "failure";
      if (beforeAfter === "before") tone = "healthy";
      if (beforeAfter === "after")  tone = healthTone(service?.health ?? "Healthy");

      if (overlay === "latency") {
        const l = m?.latencyMs ?? 0;
        tone = l > 500 ? "failure" : l > 200 ? "warning" : "healthy";
      } else if (overlay === "change" && m?.changeIds && m.changeIds.length > 0) {
        tone = "warning";
      } else if (overlay === "incident" && m?.incidentIds && m.incidentIds.length > 0) {
        tone = "failure";
      } else if (overlay === "ownership") {
        tone = m?.owner ? "connected" : "neutral";
      }
      return { ...n, tone };
    });

    // Disconnected components (no edges)
    const referenced = new Set<string>();
    edges.forEach((e) => { referenced.add(e.source); referenced.add(e.target); });
    const disc = styledNodes.filter((n) => !referenced.has(n.id)).map((n) => n.id);

    // Unknown dependency edges → dashed with no target metadata; here we treat vendor edges as "external unknown"
    const unk = edges.filter((e) => {
      const t = meta.get(e.target);
      return t?.layer === "vendor";
    }).map((e, i) => e.id ?? `${e.source}->${e.target}-${i}`);

    return { filteredNodes: styledNodes, filteredEdges: edges, disconnectedIds: disc, unknownEdges: unk };
  }, [allNodes, allEdges, meta, visibleLayers, search, overlay, simFailed, beforeAfter, service]);

  /* --------------------------- Highlight sets --------------------------- */

  const { highlightNodes, highlightEdges } = useMemo(() => {
    if (!selectedId) return { highlightNodes: undefined as ReadonlySet<string> | undefined, highlightEdges: undefined as ReadonlySet<string> | undefined };
    const hNodes = new Set<string>([selectedId]);
    const hEdges = new Set<string>();
    const edgeId = (e: GraphEdge, i: number) => e.id ?? `${e.source}->${e.target}-${i}`;

    const walk = (start: string, dir: "up" | "down") => {
      const stack = [start];
      const seen = new Set<string>();
      while (stack.length) {
        const cur = stack.pop()!;
        if (seen.has(cur)) continue;
        seen.add(cur);
        filteredEdges.forEach((e, i) => {
          if (dir === "down" && e.source === cur) {
            hNodes.add(e.target); hEdges.add(edgeId(e, i)); stack.push(e.target);
          }
          if (dir === "up" && e.target === cur) {
            hNodes.add(e.source); hEdges.add(edgeId(e, i)); stack.push(e.source);
          }
        });
      }
    };

    if (direction === "upstream" || blastRadius) walk(selectedId, "up");
    if (direction === "downstream" || blastRadius) walk(selectedId, "down");
    if (direction === "none" && !blastRadius) {
      // Just neighbors
      filteredEdges.forEach((e, i) => {
        if (e.source === selectedId) { hNodes.add(e.target); hEdges.add(edgeId(e, i)); }
        if (e.target === selectedId) { hNodes.add(e.source); hEdges.add(edgeId(e, i)); }
      });
    }
    return { highlightNodes: hNodes, highlightEdges: hEdges };
  }, [selectedId, direction, blastRadius, filteredEdges]);

  /* --------------------------- Handlers --------------------------------- */

  const handleNodeClick = (id: string) => {
    setSelectedId(id);
    const n = filteredNodes.find((x) => x.id === id) ?? allNodes.find((x) => x.id === id);
    const m = meta.get(id);
    if (!n) return;
    openDrawer({
      title: n.label,
      subtitle: `${LAYER_LABEL[m?.layer ?? "application"]}${n.sublabel ? ` · ${n.sublabel}` : ""}`,
      body: <NodeDrawerBody
        node={n} meta={m}
        onOpenTelemetry={() => navigate(`/runops/services/${serviceId}/observability?component=${encodeURIComponent(id)}`)}
        onOpenRunbooks={() => navigate(`/runops/runbooks?service=${encodeURIComponent(serviceId)}&component=${encodeURIComponent(id)}`)}
      />,
    });
  };

  const handleEdgeClick = (edge: GraphEdge) => {
    openDrawer({
      title: `Dependency: ${edge.label ?? "link"}`,
      subtitle: `${edge.source} → ${edge.target}`,
      body: <EdgeDrawerBody edge={edge} meta={meta} />,
    });
  };

  const exportImage = () => {
    // Export an SVG snapshot of the current node set — simple & offline safe.
    const w = 1400, h = 700;
    const parts: string[] = [`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#f8fafc"/>`];
    filteredEdges.forEach((e) => {
      const s = filteredNodes.find((n) => n.id === e.source);
      const t = filteredNodes.find((n) => n.id === e.target);
      if (!s || !t) return;
      parts.push(`<line x1="${(s.x ?? 0) + 80}" y1="${(s.y ?? 0) + 20}" x2="${(t.x ?? 0) + 80}" y2="${(t.y ?? 0) + 20}" stroke="#94a3b8" stroke-width="1" ${e.dashed ? 'stroke-dasharray="4 4"' : ""}/>`);
    });
    filteredNodes.forEach((n) => {
      parts.push(`<g transform="translate(${n.x ?? 0} ${n.y ?? 0})"><rect width="160" height="40" rx="4" fill="white" stroke="#cbd5e1"/><text x="8" y="18" font-size="11" font-family="sans-serif" fill="#0f172a">${escapeXml(n.label)}</text><text x="8" y="32" font-size="9" font-family="sans-serif" fill="#64748b">${escapeXml(n.sublabel ?? "")}</text></g>`);
    });
    parts.push("</svg>");
    const blob = new Blob([parts.join("")], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `topology-${serviceId}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  const resetLayout = () => { setCanvasKey((k) => k + 1); setSelectedId(null); setDirection("none"); setBlastRadius(false); setSimFailed(new Set()); setBeforeAfter("live"); };
  const fitView    = () => setCanvasKey((k) => k + 1);
  const toggleLayer = (l: LayerKey) => setVisibleLayers((prev) => {
    const next = new Set(prev);
    if (next.has(l)) next.delete(l); else next.add(l);
    return next;
  });

  /* --------------------------- States ---------------------------------- */

  if (!service) {
    return <EmptyState title="Service not found" description={`No service exists with id "${serviceId}".`} action={{ label: "Open Service Portfolio", onClick: () => navigate("/runops/services") }} />;
  }

  const partialDiscovery = filteredNodes.length < allNodes.length * 0.6;

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Topology & Dependency Explorer</div>
          <div className="text-sm font-semibold text-slate-900">{service.name}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FreshnessIndicator capturedAt={ops.dataFreshnessAt} ttlSeconds={STALE_THRESHOLD_MS / 1000} />
          <StatusIndicator tone={healthTone(service.health) === "warning" ? "degraded" : healthTone(service.health) === "failure" ? "critical" : "healthy"} label={service.health} />
          <Button size="sm" variant="outline" onClick={() => navigate(`/runops/services/${serviceId}`)}>Back to service</Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-2 border-b border-slate-200 bg-white px-4 py-2 lg:grid-cols-3">
        <div className="flex flex-wrap items-center gap-2">
          <Layers className="h-4 w-4 text-slate-500" aria-hidden />
          {LAYER_ORDER.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLayer(l)}
              className={cn(
                "rounded border px-2 py-0.5 text-[11px]",
                visibleLayers.has(l) ? "border-indigo-300 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-500",
              )}
              aria-pressed={visibleLayers.has(l)}
            >{LAYER_LABEL[l]}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={ops.environment} onValueChange={(v) => ops.setEnvironment(v as typeof ops.environment)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{ops.environmentOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={ops.region} onValueChange={(v) => ops.setRegion(v as typeof ops.region)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{ops.regionOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={overlay} onValueChange={(v) => setOverlay(v as Overlay)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Health overlay</SelectItem>
              <SelectItem value="latency">Latency overlay</SelectItem>
              <SelectItem value="change">Change overlay</SelectItem>
              <SelectItem value="incident">Incident overlay</SelectItem>
              <SelectItem value="ownership">Ownership overlay</SelectItem>
            </SelectContent>
          </Select>
          <Select value={beforeAfter} onValueChange={(v) => setBeforeAfter(v as typeof beforeAfter)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="before">Before CHG-20391</SelectItem>
              <SelectItem value="after">After CHG-20391</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search nodes" className="w-48" ariaLabel="Search topology" />
          <Button size="sm" variant="outline" onClick={fitView}><Maximize2 className="mr-1 h-3.5 w-3.5" />Fit view</Button>
          <Button size="sm" variant="outline" onClick={exportImage}><Download className="mr-1 h-3.5 w-3.5" />Export</Button>
          <Button size="sm" variant="outline" onClick={resetLayout}><RotateCcw className="mr-1 h-3.5 w-3.5" />Reset</Button>
        </div>
      </div>

      {stale && (
        <div className="px-4 pt-3">
          <StaleDataState
            title="Topology data stale"
            description={`Last refresh ${Math.round(dataFreshnessMs / 60000)} minutes ago.`}
            action={{ label: "Refresh", onClick: ops.refreshData }}
          />
        </div>
      )}

      {/* Info strip */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 text-[11px] text-slate-600">
        <span>{filteredNodes.length} nodes / {filteredEdges.length} edges</span>
        {largeGraphMode && <Badge variant="outline">Large graph performance mode</Badge>}
        {partialDiscovery && <Badge variant="outline">Partial discovery — some layers hidden</Badge>}
        {unknownEdges.length > 0 && <Badge variant="outline">{unknownEdges.length} external / unknown deps</Badge>}
        {disconnectedIds.length > 0 && <Badge variant="outline">{disconnectedIds.length} disconnected</Badge>}
      </div>

      <main className="grid flex-1 grid-cols-1 gap-3 p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {filteredNodes.length === 0 ? (
              <EmptyState title="No nodes match the filters" description="Adjust layer filters or the search query." className="m-4" />
            ) : (
              <TopologyCanvas
                key={canvasKey}
                nodes={filteredNodes}
                edges={filteredEdges}
                height={620}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                selectedNodeId={selectedId ?? undefined}
                highlightNodeIds={highlightNodes}
                highlightEdgeIds={highlightEdges}
              />
            )}
          </CardContent>
        </Card>

        {/* Side rail */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Selection tools</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="rounded bg-slate-50 px-2 py-1">
                <div className="text-[10px] uppercase text-slate-500">Selected</div>
                <div className="font-medium text-slate-900">{selectedId ?? "— nothing selected —"}</div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant={direction === "upstream" ? "default" : "outline"} disabled={!selectedId} onClick={() => setDirection((d) => d === "upstream" ? "none" : "upstream")}>
                  <ArrowUpLeft className="mr-1 h-3.5 w-3.5" />Upstream
                </Button>
                <Button size="sm" variant={direction === "downstream" ? "default" : "outline"} disabled={!selectedId} onClick={() => setDirection((d) => d === "downstream" ? "none" : "downstream")}>
                  <ArrowDownRight className="mr-1 h-3.5 w-3.5" />Downstream
                </Button>
                <Button size="sm" variant={blastRadius ? "default" : "outline"} disabled={!selectedId} onClick={() => setBlastRadius((b) => !b)}>
                  <Target className="mr-1 h-3.5 w-3.5" />Blast radius
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" disabled={!selectedId} onClick={() => setSimDialogOpen(true)}>
                  <Zap className="mr-1 h-3.5 w-3.5" />Simulate failure
                </Button>
                {simFailed.size > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setSimFailed(new Set())}>Clear simulation</Button>
                )}
              </div>
              <div className="pt-1 text-[10px] text-slate-500">
                Simulations are local to this view. Promote through DemoController to apply to scenario state.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4" />Blast radius summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {selectedId && (blastRadius || direction !== "none") ? (
                <>
                  <MetricCard label="Impacted nodes" value={String((highlightNodes?.size ?? 1) - 1)} tone="warning" />
                  <div className="max-h-40 overflow-auto rounded border border-slate-200 bg-white p-2">
                    {[...(highlightNodes ?? new Set())].filter((id) => id !== selectedId).map((id) => (
                      <div key={id} className="truncate">{allNodes.find((n) => n.id === id)?.label ?? id}</div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-500">Select a node and press Blast radius to enumerate the impact set.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Legend</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-[11px] text-slate-600">
              <LegendRow color="bg-emerald-500" label="Healthy" />
              <LegendRow color="bg-amber-500"   label="At risk / degraded" />
              <LegendRow color="bg-rose-600"    label="Severely degraded / failure" />
              <LegendRow color="bg-sky-500"     label="Recovering" />
              <LegendRow color="bg-slate-400"   label="Unknown" />
            </CardContent>
          </Card>
        </div>
      </main>

      <SimulateFailureDialog
        open={simDialogOpen}
        onOpenChange={setSimDialogOpen}
        selectedId={selectedId}
        selectedLabel={allNodes.find((n) => n.id === selectedId)?.label}
        onConfirm={(cascade) => {
          if (!selectedId) return;
          const next = new Set(simFailed);
          next.add(selectedId);
          if (cascade) {
            filteredEdges.forEach((e) => { if (e.source === selectedId) next.add(e.target); });
          }
          setSimFailed(next);
          setBlastRadius(true);
          setSimDialogOpen(false);
        }}
      />
    </div>
  );
}

/* -------------------------------- Drawers ------------------------------ */

function NodeDrawerBody({ node, meta, onOpenTelemetry, onOpenRunbooks }: {
  node: GraphNode;
  meta: TopologyNodeMeta | undefined;
  onOpenTelemetry: () => void;
  onOpenRunbooks: () => void;
}) {
  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <KV k="ID" v={node.id} />
        <KV k="Layer" v={meta ? LAYER_LABEL[meta.layer] : "—"} />
        <KV k="Owner" v={meta?.owner ?? "—"} />
        <KV k="Health" v={meta?.health ?? node.sublabel ?? "—"} />
        <KV k="Latency" v={meta?.latencyMs ? `${meta.latencyMs}ms` : "—"} />
        <KV k="Incidents" v={meta?.incidentIds?.join(", ") || "none"} />
        <KV k="Changes"   v={meta?.changeIds?.join(", ")   || "none"} />
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Runbooks</div>
        <div className="rounded border border-slate-200 bg-white p-2 text-slate-700">
          Runbooks applicable to this component appear in the runbook library filtered by service and component.
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onOpenTelemetry}>Open telemetry</Button>
        <Button size="sm" variant="outline" onClick={onOpenRunbooks}>Open runbooks</Button>
      </div>
    </div>
  );
}

function EdgeDrawerBody({ edge, meta }: { edge: GraphEdge; meta: Map<string, TopologyNodeMeta> }) {
  const s = meta.get(edge.source);
  const t = meta.get(edge.target);
  return (
    <div className="space-y-2 text-xs">
      <div className="rounded border border-slate-200 bg-white p-2">
        <div className="font-semibold text-slate-900">{edge.label ?? "dependency"}</div>
        <div className="text-slate-500">
          {edge.source} ({s ? LAYER_LABEL[s.layer] : "unknown"}) → {edge.target} ({t ? LAYER_LABEL[t.layer] : "unknown"})
        </div>
        {edge.dashed && <div className="mt-1 text-amber-700">External or asynchronous — direction inferred from telemetry, not declared config.</div>}
      </div>
      <p className="text-slate-600">
        This dependency indicates the source component <strong>{edge.label ?? "connects to"}</strong> the target.
        Health and latency of the target propagate to the source.
      </p>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-1.5">
      <div className="text-[10px] uppercase text-slate-500">{k}</div>
      <div className="font-medium text-slate-900">{v}</div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return <div className="inline-flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", color)} />{label}</div>;
}

/* --------------------------- Simulation dialog ------------------------- */

function SimulateFailureDialog({ open, onOpenChange, selectedId, selectedLabel, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  selectedId: string | null; selectedLabel?: string;
  onConfirm: (cascade: boolean) => void;
}) {
  const [cascade, setCascade] = useState(true);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulate failure</DialogTitle>
          <DialogDescription>
            Marks the selected node as failed in this view only. Scenario state is unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-xs">
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="text-[10px] uppercase text-slate-500">Target</div>
            <div className="font-medium">{selectedLabel ?? selectedId}</div>
          </div>
          <div className="flex items-center justify-between rounded border border-slate-200 bg-white p-2">
            <Label htmlFor="cascade" className="text-xs">Cascade to direct downstream nodes</Label>
            <Switch id="cascade" checked={cascade} onCheckedChange={setCascade} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onConfirm(cascade)} disabled={!selectedId}>Run simulation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- utils -------------------------------- */

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", '"':"&quot;" }[c] ?? c));
}
