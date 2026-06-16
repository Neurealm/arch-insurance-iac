import { useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Network, X, Sparkles, AlertOctagon, ChevronRight, ChevronLeft, ShieldCheck,
  GitBranch, Activity, Database, Clock, Cpu, DollarSign, AlertTriangle,
  CheckCircle2, FileBarChart2, Download, ArrowRight, Layers, Eye, EyeOff,
  PlayCircle, Workflow, Lightbulb,
} from "lucide-react";
import { useEvidenceGraph } from "@/context/EvidenceGraphContext";
import {
  type EvidenceGraph, type EvidenceNode, type EvidenceEdge,
  type EvidenceGraphMode, EVIDENCE_MODES,
  type RootCauseHypothesis, type EvidenceStatus,
  NODE_STATUS_STYLE, categoryAccent,
} from "@/data/evidenceGraphData";

/* ================================================================== */
/* SHARED BITS                                                         */
/* ================================================================== */
function Glass({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-slate-200/70 bg-white/85 backdrop-blur-sm shadow-[0_4px_18px_-12px_rgba(15,23,42,0.18)]",
      className,
    )}>
      {children}
    </div>
  );
}

function Pill({ children, tone = "slate", className }: { children: React.ReactNode; tone?: "violet"|"rose"|"amber"|"emerald"|"indigo"|"slate"|"teal"; className?: string }) {
  const map: Record<string,string> = {
    violet:  "bg-violet-50 text-violet-700 border-violet-200",
    rose:    "bg-rose-50 text-rose-700 border-rose-200",
    amber:   "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indigo:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    teal:    "bg-teal-50 text-teal-700 border-teal-200",
    slate:   "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", map[tone], className)}>
      {children}
    </span>
  );
}

function ConfidenceBar({ value, color = "violet" }: { value: number; color?: "violet"|"rose"|"emerald"|"amber"|"sky" }) {
  const gradient: Record<string,string> = {
    violet:  "from-violet-400 to-indigo-500",
    rose:    "from-rose-400 to-rose-600",
    emerald: "from-emerald-400 to-emerald-600",
    amber:   "from-amber-400 to-amber-600",
    sky:     "from-sky-400 to-sky-600",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", gradient[color])}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function SourceBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
      {name}
    </span>
  );
}

/* ================================================================== */
/* TOP RIBBON                                                          */
/* ================================================================== */
function EvidenceRibbon({ graph, onClose }: { graph: EvidenceGraph; onClose: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/70 bg-gradient-to-r from-white via-violet-50/40 to-sky-50/50 px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
          <Network className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Evidence Graph · Root Cause Engine</div>
          <div className="text-[14px] font-semibold text-slate-900">{graph.title}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone="slate"><AlertOctagon className="h-3 w-3" />{graph.incidentId}</Pill>
        <Pill tone="violet"><Sparkles className="h-3 w-3" />Probable: {graph.probableRootCause}</Pill>
        <Pill tone="emerald"><ShieldCheck className="h-3 w-3" />Confidence {graph.confidence}%</Pill>
        <Pill tone={graph.risk === "High" ? "rose" : graph.risk === "Medium" ? "amber" : "emerald"}>
          <AlertTriangle className="h-3 w-3" />Risk {graph.risk}
        </Pill>
        <Pill tone="slate"><Layers className="h-3 w-3" />{graph.nodes.length} evidence items</Pill>
        <Pill tone="slate"><GitBranch className="h-3 w-3" />{graph.hypotheses.length} hypotheses</Pill>
      </div>
      <button onClick={onClose} className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ================================================================== */
/* CANVAS (SVG causal graph)                                           */
/* ================================================================== */
function EvidenceGraphCanvas({
  graph, mode, selectedNodeId, onSelectNode, onSelectEdge,
}: {
  graph: EvidenceGraph;
  mode: EvidenceGraphMode;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
}) {
  const [hideExcluded, setHideExcluded] = useState(false);

  const showNode = (n: EvidenceNode) => {
    if (mode === "blast") return n.status !== "excluded";
    if (hideExcluded) return n.status !== "excluded";
    return true;
  };
  const showEdge = (e: EvidenceEdge) => {
    if (mode === "causal") return e.isPrimaryPath || e.status === "excluded" ? e.isPrimaryPath : true;
    return true;
  };

  const visibleNodes = graph.nodes.filter(showNode);
  const visibleEdges = graph.edges.filter(e =>
    showEdge(e) &&
    visibleNodes.some(n => n.id === e.sourceNodeId) &&
    visibleNodes.some(n => n.id === e.targetNodeId)
  );

  const isRelated = (nid: string) => {
    if (!selectedNodeId) return true;
    if (nid === selectedNodeId) return true;
    return graph.edges.some(e =>
      (e.sourceNodeId === selectedNodeId && e.targetNodeId === nid) ||
      (e.targetNodeId === selectedNodeId && e.sourceNodeId === nid)
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50/60 to-violet-50/30">
      {/* atmospheric */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]">
          <defs>
            <pattern id="eg-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eg-grid)" />
        </svg>
      </div>

      {/* Controls */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1">
        <button
          onClick={() => setHideExcluded(v => !v)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[10.5px] text-slate-600 hover:bg-white"
        >
          {hideExcluded ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {hideExcluded ? "Show excluded" : "Hide excluded"}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-white/85 px-2 py-1 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />Primary cause</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Critical</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Warning</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" />NOVA</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Excluded</span>
      </div>

      {/* Edges SVG layer */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker id="eg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="rgba(100,116,139,0.7)" />
          </marker>
          <marker id="eg-arrow-primary" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="rgb(124,58,237)" />
          </marker>
        </defs>
        {visibleEdges.map(e => {
          const s = graph.nodes.find(n => n.id === e.sourceNodeId)!;
          const t = graph.nodes.find(n => n.id === e.targetNodeId)!;
          const primary = e.isPrimaryPath;
          const excluded = e.status === "excluded";
          const muted = !!selectedNodeId && !(selectedNodeId === e.sourceNodeId || selectedNodeId === e.targetNodeId);
          const mx = (s.x + t.x) / 2;
          const my = (s.y + t.y) / 2 - 6; // gentle curve
          const stroke = excluded ? "rgba(148,163,184,0.5)" : primary ? "rgb(124,58,237)" : "rgba(100,116,139,0.6)";
          return (
            <g key={e.id} onClick={(ev) => { ev.stopPropagation(); onSelectEdge(e.id); }} style={{ cursor: "pointer", opacity: muted ? 0.18 : 1, transition: "opacity 400ms" }}>
              <path
                d={`M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                fill="none"
                stroke={stroke}
                strokeWidth={primary ? 0.55 : 0.32}
                strokeDasharray={excluded ? "0.8 0.8" : undefined}
                markerEnd={primary ? "url(#eg-arrow-primary)" : "url(#eg-arrow)"}
                className={cn(primary && "[stroke-dashoffset:0] animate-[evflow_3.5s_linear_infinite]")}
              />
            </g>
          );
        })}
        <style>{`@keyframes evflow { from { stroke-dasharray: 1.2 1.6; stroke-dashoffset: 6 } to { stroke-dasharray: 1.2 1.6; stroke-dashoffset: 0 } }`}</style>
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0">
        {visibleNodes.map(n => {
          const sel = selectedNodeId === n.id;
          const related = isRelated(n.id);
          const style = NODE_STATUS_STYLE[n.status];
          return (
            <button
              key={n.id}
              onClick={(e) => { e.stopPropagation(); onSelectNode(n.id); }}
              style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)" }}
              className={cn(
                "group absolute z-10 max-w-[180px] rounded-xl border bg-white/95 px-2 py-1.5 text-left shadow-sm transition-all duration-300",
                "hover:-translate-y-[3px] hover:shadow-md",
                style.bg, "border-slate-200/80",
                sel && "ring-2 ring-violet-400 -translate-y-[3px] shadow-md",
                !related && "opacity-40 saturate-50",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", style.text)}>
                  {n.category}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-slate-800 leading-tight">{n.label}</div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[9.5px] text-slate-500">
                <span className="tabular-nums">{n.timestamp}</span>
                <span className="tabular-nums font-medium text-slate-600">{n.confidence}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* NODE DRAWER (right side detail)                                     */
/* ================================================================== */
function EvidenceNodeDrawer({ graph, node }: { graph: EvidenceGraph; node: EvidenceNode | null }) {
  if (!node) {
    return (
      <Glass className="p-4 text-[12px] text-slate-500">
        <div className="flex items-center gap-2 text-slate-700">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          <span className="font-medium">Select an evidence node</span>
        </div>
        <p className="mt-2">
          Click any node on the canvas to inspect its source, baseline, change, related telemetry,
          and contribution to the probable root cause.
        </p>
      </Glass>
    );
  }
  const style = NODE_STATUS_STYLE[node.status];
  const relatedEdges = graph.edges.filter(e => e.sourceNodeId === node.id || e.targetNodeId === node.id);
  return (
    <Glass className="flex h-full flex-col overflow-hidden">
      <div className={cn("flex items-start gap-2 border-b border-slate-200/70 p-3", style.bg)}>
        <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", style.dot)} />
        <div className="min-w-0 flex-1">
          <div className={cn("text-[10px] font-semibold uppercase tracking-wide", style.text)}>{node.type}</div>
          <div className="text-[13px] font-semibold text-slate-900 leading-tight">{node.label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Pill tone="slate">{node.timestamp}</Pill>
            <Pill tone="violet"><ShieldCheck className="h-3 w-3" />{node.confidence}%</Pill>
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", categoryAccent(node.category))}>{node.category}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3 text-[12px]">
          {(node.baseline || node.actual || node.change) && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-slate-50 p-2">
                <div className="text-[10px] uppercase text-slate-500">Baseline</div>
                <div className="font-semibold tabular-nums text-slate-800">{node.baseline ?? "—"}</div>
              </div>
              <div className="rounded-md bg-rose-50 p-2">
                <div className="text-[10px] uppercase text-rose-500">Actual</div>
                <div className="font-semibold tabular-nums text-rose-700">{node.actual ?? "—"}</div>
              </div>
              <div className="rounded-md bg-amber-50 p-2">
                <div className="text-[10px] uppercase text-amber-500">Change</div>
                <div className="font-semibold tabular-nums text-amber-700">{node.change ?? "—"}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500">Description</div>
            <p className="mt-1 text-slate-700">{node.description}</p>
          </div>

          {node.interpretation && (
            <div className="rounded-md border border-violet-200 bg-violet-50/60 p-2">
              <div className="text-[10px] uppercase font-semibold text-violet-600">NOVA interpretation</div>
              <p className="mt-1 text-violet-900">{node.interpretation}</p>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500">Source</div>
            <div className="mt-1 flex flex-wrap gap-1">
              <SourceBadge name={node.source} />
              {node.relatedObjectId && <Pill tone="slate"><Workflow className="h-3 w-3" />{node.relatedObjectType}: {node.relatedObjectId}</Pill>}
              {node.owner && <Pill tone="slate">Owner · {node.owner}</Pill>}
              {node.severity && <Pill tone={node.severity === "Critical" ? "rose" : node.severity === "High" ? "amber" : "slate"}>Severity {node.severity}</Pill>}
            </div>
          </div>

          {relatedEdges.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Relationships</div>
              <div className="mt-1 space-y-1">
                {relatedEdges.map(e => {
                  const other = e.sourceNodeId === node.id
                    ? graph.nodes.find(n => n.id === e.targetNodeId)
                    : graph.nodes.find(n => n.id === e.sourceNodeId);
                  const direction = e.sourceNodeId === node.id ? "→" : "←";
                  return (
                    <div key={e.id} className="rounded-md border border-slate-200 bg-white p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-700">
                          <span className="font-medium">{e.relationshipType}</span> {direction} <span className="text-slate-500">{other?.label}</span>
                        </div>
                        <Pill tone="slate">{e.confidence}%</Pill>
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-slate-500">{e.evidenceReason} · lag {e.lagMinutes}m</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {["Show in Digital Twin","Show Timeline Event","Show Related Trace","Show Related Metric","Ask NOVA","Add to RCA","Export Evidence"].map(a => (
              <Button key={a} size="sm" variant="outline" className="h-7 justify-start text-[10.5px]">
                <ArrowRight className="mr-1 h-3 w-3" />{a}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </Glass>
  );
}

/* ================================================================== */
/* HYPOTHESIS COMPARISON                                               */
/* ================================================================== */
function HypothesisCard({ h, selected, onClick }: { h: RootCauseHypothesis; selected: boolean; onClick: () => void }) {
  const tone = h.status === "Selected" ? "violet" : h.confidence >= 40 ? "amber" : "slate";
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow",
        h.status === "Selected" ? "border-violet-300 ring-1 ring-violet-200 bg-gradient-to-br from-violet-50/70 to-white" : "border-slate-200",
        selected && "ring-2 ring-violet-400",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[13px] font-semibold text-slate-900">{h.name}</div>
            <Pill tone={tone}>{h.status}</Pill>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-600 leading-snug">{h.summary}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-slate-500">Confidence</div>
          <div className={cn("text-lg font-semibold tabular-nums", h.status === "Selected" ? "text-violet-700" : "text-slate-700")}>{h.confidence}%</div>
        </div>
      </div>
      <div className="mt-2"><ConfidenceBar value={h.confidence} color={h.status === "Selected" ? "violet" : h.confidence >= 40 ? "amber" : "sky"} /></div>
      <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
        <Pill tone="emerald"><CheckCircle2 className="h-3 w-3" />{h.supportingEvidenceNodeIds.length} supporting</Pill>
        <Pill tone="rose"><AlertTriangle className="h-3 w-3" />{h.contradictingEvidenceNodeIds.length} contradicting</Pill>
        <Pill tone="slate">Action · {h.recommendedAction}</Pill>
        <Pill tone={h.risk === "High" ? "rose" : h.risk === "Medium" ? "amber" : "emerald"}>Risk {h.risk}</Pill>
      </div>
    </button>
  );
}

function HypothesisPanel({ graph, selectedHypothesisId, onSelect }: { graph: EvidenceGraph; selectedHypothesisId: string | null; onSelect: (id: string) => void }) {
  const ranked = [...graph.hypotheses].sort((a,b) => b.confidence - a.confidence);
  return (
    <div className="grid grid-cols-1 gap-2">
      {ranked.map(h => (
        <HypothesisCard key={h.id} h={h} selected={selectedHypothesisId === h.id} onClick={() => onSelect(h.id)} />
      ))}
    </div>
  );
}

/* ================================================================== */
/* WHY / WHY NOT                                                       */
/* ================================================================== */
function WhyWhyNot({ graph }: { graph: EvidenceGraph }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/70 to-white p-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-violet-800">
          <CheckCircle2 className="h-4 w-4" /> Why this hypothesis is selected
        </div>
        <ul className="mt-2 space-y-1 text-[11.5px] text-slate-700">
          {graph.whyWhyNot.selected.map((t,i) => (
            <li key={i} className="flex gap-2"><span className="mt-1 h-1 w-1 rounded-full bg-violet-500" />{t}</li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {graph.whyWhyNot.alternatives.map(alt => {
          const h = graph.hypotheses.find(x => x.id === alt.hypothesisId);
          if (!h) return null;
          return (
            <div key={alt.hypothesisId} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-semibold text-slate-800">{h.name}</div>
                <Pill tone="slate">Confidence {h.confidence}%</Pill>
              </div>
              <ul className="mt-1.5 space-y-1 text-[11.5px] text-slate-600">
                {alt.bullets.map((b,i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1 h-1 w-1 rounded-full bg-slate-400" />{b}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* TIMELINE CORRELATION                                                */
/* ================================================================== */
function TimelineCorrelation({ graph }: { graph: EvidenceGraph }) {
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="text-[11px] font-semibold text-slate-700">Before vs After deployment v2.14.7</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          {[
            { k: "Payment P95",    b: "228 ms", a: "912 ms" },
            { k: "Aurora CPU",     b: "44%",    a: "91%" },
            { k: "Error rate",     b: "0.08%",  a: "2.7%" },
          ].map(r => (
            <div key={r.k} className="rounded-md border border-slate-200 bg-slate-50/60 p-2">
              <div className="text-[10px] uppercase text-slate-500">{r.k}</div>
              <div className="flex items-center gap-1">
                <span className="text-slate-600 tabular-nums">{r.b}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-rose-600 tabular-nums">{r.a}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative">
          <div className="absolute left-0 right-0 top-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="flex items-start gap-2 overflow-x-auto pb-1">
            {graph.timelineCorrelation.map((e, i) => (
              <div key={i} className="relative shrink-0 w-[150px]">
                <div className={cn("mx-auto h-2.5 w-2.5 rounded-full ring-4 ring-white", e.isPrimary ? "bg-violet-500" : "bg-slate-400")} />
                <div className="mt-1 text-center text-[10px] text-slate-500 tabular-nums">{e.time}</div>
                <div className={cn("mt-1 rounded-md border p-1.5 text-[10.5px]", e.isPrimary ? "border-violet-200 bg-violet-50/60" : "border-slate-200 bg-white")}>
                  <div className="text-[9.5px] uppercase tracking-wide text-slate-400">{e.eventType}</div>
                  <div className="text-slate-800 leading-tight">{e.affectedObject}</div>
                  {(e.metricBefore || e.metricAfter) && (
                    <div className="mt-0.5 text-[10px] text-slate-500 tabular-nums">{e.metricBefore} → <span className="text-slate-700">{e.metricAfter}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* BLAST RADIUS                                                        */
/* ================================================================== */
function BlastRadiusPanel({ graph }: { graph: EvidenceGraph }) {
  const groups: { layer: string; items: typeof graph.blastRadius }[] = [
    { layer: "Business",       items: graph.blastRadius.filter(b => b.layer === "Business") },
    { layer: "Transaction",    items: graph.blastRadius.filter(b => b.layer === "Transaction") },
    { layer: "Application",    items: graph.blastRadius.filter(b => b.layer === "Application") },
    { layer: "Infrastructure", items: graph.blastRadius.filter(b => b.layer === "Infrastructure") },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {groups.map(g => (
        <div key={g.layer} className="rounded-xl border border-slate-200 bg-white p-2.5">
          <div className="text-[10px] uppercase font-semibold text-slate-500">{g.layer}</div>
          <div className="mt-1.5 space-y-1">
            {g.items.map(i => {
              const s = NODE_STATUS_STYLE[i.status as EvidenceStatus];
              return (
                <div key={i.id} className={cn("flex items-start gap-2 rounded-md border p-1.5", s.bg, "border-slate-200/70")}>
                  <span className={cn("mt-1 h-2 w-2 rounded-full", s.dot)} />
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium text-slate-800 leading-tight">{i.name}</div>
                    <div className="text-[10px] text-slate-500">{i.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/* RECOMMENDATION                                                      */
/* ================================================================== */
function RecommendationPanel({ graph }: { graph: EvidenceGraph }) {
  const primary = graph.recommendedActions.find(r => r.isPrimary)!;
  const alts = graph.recommendedActions.filter(r => !r.isPrimary);
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/70 to-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-semibold text-violet-600">Recommended action</div>
            <div className="text-[13px] font-semibold text-slate-900">{primary.title}</div>
            <p className="mt-1 text-[11.5px] text-slate-600">{primary.rationale}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-slate-500">Confidence</div>
            <div className="text-lg font-semibold text-violet-700 tabular-nums">{primary.confidence}%</div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
          {[
            ["Recovery", primary.expectedRecovery],
            ["Risk", primary.risk],
            ["Approval", primary.approvalRequired ? "Required" : "Auto"],
            ["P95 after", primary.expectedP95],
            ["Errors after", primary.expectedErrorRate],
            ["Aurora CPU after", primary.expectedSaturation],
            ["Hourly cost", primary.expectedHourlyCost],
            ["Rollback", primary.rollbackPath],
            ["Runbook", primary.runbook],
          ].map(([k,v]) => (
            <div key={k as string} className="rounded-md bg-white border border-slate-200 p-1.5">
              <div className="text-[9.5px] uppercase text-slate-500">{k}</div>
              <div className="font-medium tabular-nums text-slate-800">{v}</div>
            </div>
          ))}
        </div>
        {primary.emergencyChange && (
          <div className="mt-2 text-[11px] text-slate-600">Emergency change: <span className="font-medium text-slate-800">{primary.emergencyChange}</span></div>
        )}
        <div className="mt-2 flex gap-1.5">
          <Button size="sm" className="h-7 text-[11px]">Request Approval</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">View Runbook</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]">Add to RCA</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {alts.map(a => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[12px] font-semibold text-slate-800">{a.title}</div>
                <p className="mt-0.5 text-[11px] text-slate-500">{a.rationale}</p>
              </div>
              <div className="text-right">
                <Pill tone="slate">Confidence {a.confidence}%</Pill>
              </div>
            </div>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5 text-[10.5px]">
              <div><span className="text-slate-500">Recovery </span><span className="text-slate-800">{a.expectedRecovery}</span></div>
              <div><span className="text-slate-500">P95 </span><span className="text-slate-800">{a.expectedP95}</span></div>
              <div><span className="text-slate-500">Cost </span><span className="text-slate-800">{a.expectedHourlyCost}</span></div>
              <div><span className="text-slate-500">Risk </span><span className="text-slate-800">{a.risk}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* CONFIDENCE / COMPLETENESS / SOURCES                                 */
/* ================================================================== */
function RightInsightsColumn({ graph }: { graph: EvidenceGraph }) {
  return (
    <div className="space-y-2">
      <Glass className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase font-semibold text-slate-500">Confidence model</div>
          <Pill tone="violet"><ShieldCheck className="h-3 w-3" />{graph.confidence}% overall</Pill>
        </div>
        <div className="mt-2 space-y-1.5">
          {graph.confidenceBreakdown.map(c => (
            <div key={c.label}>
              <div className="flex items-center justify-between text-[10.5px] text-slate-600">
                <span>{c.label}</span>
                <span className="tabular-nums text-slate-800">{c.value}%</span>
              </div>
              <ConfidenceBar value={c.value} color={c.value >= 90 ? "emerald" : c.value >= 75 ? "violet" : "amber"} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10.5px] text-slate-500">
          NOVA confidence is high because timing, dependency path, metric anomalies, traces, and SLO impact
          converge on the same affected component.
        </p>
      </Glass>

      <Glass className="p-3">
        <div className="text-[10px] uppercase font-semibold text-slate-500">Evidence completeness</div>
        <div className="mt-1 text-[18px] font-semibold text-slate-900 tabular-nums">{graph.completeness.overall}%</div>
        <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10.5px]">
          {[
            ["Telemetry",   graph.completeness.telemetryCoverage],
            ["Traces",      graph.completeness.traceCoverage],
            ["Changes",     graph.completeness.changeCoverage],
            ["Dependency",  graph.completeness.dependencyConfidence],
            ["Freshness",   graph.completeness.sourceFreshness],
            ["Ownership",   graph.completeness.ownershipCoverage],
            ["SLO",         graph.completeness.sloCoverage],
          ].map(([k,v]) => (
            <div key={k as string} className="flex items-center justify-between rounded bg-slate-50 px-1.5 py-0.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-medium tabular-nums text-slate-800">{v}%</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] uppercase font-semibold text-slate-500">Gaps</div>
        <ul className="mt-1 space-y-0.5 text-[10.5px] text-slate-600">
          {graph.completeness.gaps.map((g,i) => <li key={i} className="flex gap-1.5"><span className="mt-1 h-1 w-1 rounded-full bg-amber-500" />{g}</li>)}
        </ul>
      </Glass>

      <Glass className="p-3">
        <div className="text-[10px] uppercase font-semibold text-slate-500">Source systems</div>
        <div className="mt-1.5 grid grid-cols-1 gap-1">
          {graph.sourceSystems.slice(0, 8).map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10.5px]">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="text-slate-700">{s.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="tabular-nums">{s.coverage}%</span>
                <span>· {s.freshness}</span>
              </div>
            </div>
          ))}
        </div>
      </Glass>

      <Glass className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase font-semibold text-slate-500">Excluded signals</div>
          <Pill tone="slate">{graph.excludedSignals.length}</Pill>
        </div>
        <div className="mt-1.5 space-y-1">
          {graph.excludedSignals.slice(0, 6).map(e => (
            <div key={e.id} className="rounded-md border border-slate-200 bg-slate-50/60 p-1.5 text-[10.5px]">
              <div className="font-medium text-slate-700">{e.label}</div>
              <div className="text-slate-500">{e.reason} · {e.source}</div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/* ================================================================== */
/* ROOT CAUSE SUMMARY CARD (exported, used standalone too)             */
/* ================================================================== */
export function RootCauseSummaryCard({ graph, onOpen }: { graph: EvidenceGraph; onOpen?: () => void }) {
  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-white via-violet-50/40 to-sky-50/40 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 text-white"><Network className="h-3.5 w-3.5" /></span>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-violet-600 font-semibold">Evidence Available</div>
            <div className="text-[12.5px] font-semibold text-slate-900">Root cause confidence {graph.confidence}%</div>
          </div>
        </div>
        {onOpen && (
          <Button size="sm" className="h-7 text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" onClick={onOpen}>
            <Network className="mr-1 h-3 w-3" />Open Evidence Graph
          </Button>
        )}
      </div>
      <p className="mt-1.5 text-[11.5px] text-slate-600 leading-snug">{graph.summary}</p>
    </div>
  );
}

/* ================================================================== */
/* EXPORT EVIDENCE PACKAGE                                             */
/* ================================================================== */
function ExportEvidencePackage({ graph }: { graph: EvidenceGraph }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setOpen(o => !o)}>
        <Download className="mr-1 h-3 w-3" />Export Evidence Package
      </Button>
      {open && (
        <div className="absolute right-3 top-12 z-30 w-[360px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-slate-900">Evidence package preview</div>
            <button onClick={() => setOpen(false)}><X className="h-3.5 w-3.5 text-slate-400" /></button>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-slate-600">
            <div><span className="text-slate-400">Incident · </span>{graph.incidentId}</div>
            <div><span className="text-slate-400">Scenario · </span>{graph.scenarioId}</div>
            <div><span className="text-slate-400">Probable root cause · </span>{graph.probableRootCause}</div>
            <div><span className="text-slate-400">Confidence · </span>{graph.confidence}%</div>
            <div><span className="text-slate-400">Evidence items · </span>{graph.nodes.length}</div>
            <div><span className="text-slate-400">Hypotheses considered · </span>{graph.hypotheses.length}</div>
            <div><span className="text-slate-400">Source systems · </span>{graph.sourceSystems.length}</div>
            <div><span className="text-slate-400">Generated · </span>{graph.generatedAt}</div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <Button size="sm" className="h-7 text-[11px]">Attach to ServiceNow</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]">Download JSON</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]">Send to PagerDuty</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]">Add to RCA</Button>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================== */
/* MAIN PANEL                                                          */
/* ================================================================== */
export function EvidenceGraphEngine() {
  const ctx = useEvidenceGraph();
  const { open, closeGraph, graph, mode, setMode, selectedNodeId, setSelectedNodeId, setSelectedEdgeId, selectedHypothesisId, setSelectedHypothesisId } = ctx;

  const selectedNode = useMemo<EvidenceNode | null>(
    () => (graph && selectedNodeId ? graph.nodes.find(n => n.id === selectedNodeId) ?? null : null),
    [graph, selectedNodeId],
  );

  if (!graph) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) closeGraph(); }}>
      <SheetContent side="right" className="w-[min(1180px,100vw)] max-w-none p-0 bg-gradient-to-br from-[#F7F9FC] via-white to-[#F2F4FB] overflow-hidden">
        <div className="flex h-full flex-col">
          <EvidenceRibbon graph={graph} onClose={closeGraph} />

          {/* Tab bar + actions */}
          <div className="relative flex items-center gap-2 border-b border-slate-200/70 bg-white/70 px-4 py-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as EvidenceGraphMode)} className="flex-1">
              <TabsList className="h-8 bg-slate-100/70">
                {EVIDENCE_MODES.map(m => (
                  <TabsTrigger key={m.id} value={m.id} className="text-[11.5px] data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    {m.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-[11px]"><PlayCircle className="mr-1 h-3 w-3" />Focus Primary Chain</Button>
              <Button size="sm" variant="outline" className="h-7 text-[11px]"><FileBarChart2 className="mr-1 h-3 w-3" />Add to RCA</Button>
              <ExportEvidencePackage graph={graph} />
            </div>
          </div>

          {/* BODY */}
          <div className="grid flex-1 grid-cols-12 gap-3 overflow-hidden p-3">
            {/* CENTER — content per mode */}
            <div className="col-span-8 flex h-full min-h-0 flex-col gap-3">
              <Tabs value={mode} className="flex-1 flex flex-col min-h-0">
                <TabsContent value="causal" className="m-0 flex-1 min-h-0">
                  <EvidenceGraphCanvas
                    graph={graph}
                    mode="causal"
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => { setSelectedNodeId(id); setSelectedEdgeId(null); }}
                    onSelectEdge={setSelectedEdgeId}
                  />
                </TabsContent>
                <TabsContent value="hypotheses" className="m-0 flex-1 overflow-auto">
                  <HypothesisPanel graph={graph} selectedHypothesisId={selectedHypothesisId} onSelect={setSelectedHypothesisId} />
                  <div className="mt-3 text-[11px] uppercase font-semibold text-slate-500">Why · Why not</div>
                  <div className="mt-1.5"><WhyWhyNot graph={graph} /></div>
                </TabsContent>
                <TabsContent value="timeline" className="m-0 flex-1 overflow-auto">
                  <TimelineCorrelation graph={graph} />
                </TabsContent>
                <TabsContent value="blast" className="m-0 flex-1 overflow-auto">
                  <BlastRadiusPanel graph={graph} />
                </TabsContent>
                <TabsContent value="recommendation" className="m-0 flex-1 overflow-auto">
                  <RecommendationPanel graph={graph} />
                </TabsContent>
              </Tabs>

              {/* Bottom timeline strip when not already viewing the timeline tab */}
              {mode !== "timeline" && (
                <Glass className="p-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Timeline correlation</div>
                    <button onClick={() => setMode("timeline")} className="text-[10.5px] text-violet-600 hover:underline inline-flex items-center gap-1">
                      Expand <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
                    {graph.timelineCorrelation.map((e, i) => (
                      <div key={i} className="flex shrink-0 items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", e.isPrimary ? "bg-violet-500" : "bg-slate-300")} />
                        <span className="text-[10px] tabular-nums text-slate-500">{e.time}</span>
                        <span className="text-[10.5px] text-slate-700 truncate max-w-[160px]">{e.affectedObject}</span>
                        {i < graph.timelineCorrelation.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                      </div>
                    ))}
                  </div>
                </Glass>
              )}
            </div>

            {/* RIGHT — detail/insights */}
            <div className="col-span-4 flex h-full min-h-0 flex-col gap-2 overflow-auto">
              {mode === "causal" && <EvidenceNodeDrawer graph={graph} node={selectedNode} />}
              <RightInsightsColumn graph={graph} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ================================================================== */
/* LAUNCHERS                                                           */
/* ================================================================== */
export function EvidenceGraphLauncher({
  variant = "default",
  mode,
  nodeId,
  label,
  className,
}: {
  variant?: "default" | "compact" | "pill" | "inline";
  mode?: EvidenceGraphMode;
  nodeId?: string;
  label?: string;
  className?: string;
}) {
  const { openGraph, graph } = useEvidenceGraph();
  if (!graph) return null;
  const txt = label ?? "View Evidence Graph";

  if (variant === "compact") {
    return (
      <button
        onClick={() => openGraph({ mode, nodeId })}
        className={cn("inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100 transition", className)}
      >
        <Network className="h-3 w-3" />{txt}
      </button>
    );
  }
  if (variant === "pill") {
    return (
      <button
        onClick={() => openGraph({ mode, nodeId })}
        className={cn("inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-50", className)}
      >
        <Network className="h-3 w-3 text-violet-500" />{txt}
      </button>
    );
  }
  if (variant === "inline") {
    return (
      <button onClick={() => openGraph({ mode, nodeId })} className={cn("text-[11px] text-violet-600 hover:underline inline-flex items-center gap-1", className)}>
        <Network className="h-3 w-3" />{txt}
      </button>
    );
  }
  return (
    <Button
      size="sm"
      onClick={() => openGraph({ mode, nodeId })}
      className={cn("h-8 text-[11.5px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white", className)}
    >
      <Network className="mr-1 h-3.5 w-3.5" />{txt}
    </Button>
  );
}

/** A compact indicator that sits next to other launchers (e.g. inside Guided Investigation banner). */
export function EvidenceGraphAvailableIndicator() {
  const { graph, openGraph } = useEvidenceGraph();
  if (!graph) return null;
  return (
    <button
      onClick={() => openGraph()}
      className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-2 py-1 text-[10.5px] text-violet-700 hover:from-violet-100 hover:to-indigo-100"
      title="Evidence Graph available"
    >
      <Network className="h-3 w-3" />
      Evidence · {graph.confidence}% · {graph.nodes.length} items
    </button>
  );
}
