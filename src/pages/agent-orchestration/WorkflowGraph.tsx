// Technical execution graph for the selected workflow. Wheel zoom is anchored
// on the cursor via a native non-passive listener; pan is pointer-driven.
// Nodes and edges are inspectable and every control has real behaviour.

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Maximize2, Minus, Plus, Crosshair, RotateCcw, Tag, ShieldCheck, Save, FileCode2, GitBranch } from "lucide-react";
import { GRAPH_EDGES, GRAPH_LEGEND, GRAPH_NODES, type GraphEdge, type GraphNode, type NodeKind } from "./data";
import { RichTip, Btn } from "./parts";

const VIEW_W = 1160;
const VIEW_H = 350;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

const NODE_STYLE: Record<NodeKind, { fill: string; stroke: string; text: string }> = {
  trigger: { fill: "#EEF2F7", stroke: "#94A3B8", text: "#0F172A" },
  automated: { fill: "#EFF6FF", stroke: "#93C5FD", text: "#1E3A8A" },
  agent: { fill: "#E0EAFF", stroke: "#6366F1", text: "#312E81" },
  human: { fill: "#F5F3FF", stroke: "#A78BFA", text: "#4C1D95" },
  approval: { fill: "#FEF3C7", stroke: "#F59E0B", text: "#78350F" },
  tool: { fill: "#DBEAFE", stroke: "#2563EB", text: "#1E3A8A" },
  validation: { fill: "#DCFCE7", stroke: "#22C55E", text: "#14532D" },
  end: { fill: "#ECFDF5", stroke: "#10B981", text: "#065F46" },
};

const LEGEND_SWATCH: Record<string, string> = {
  retryPath: "#2563EB", alternatePath: "#7C3AED", failurePath: "#DC2626",
};

function edgeStroke(kind: GraphEdge["kind"], active: boolean) {
  if (kind === "failure") return active ? "#DC2626" : "#FCA5A5";
  if (kind === "alternate") return active ? "#7C3AED" : "#C4B5FD";
  if (kind === "retry") return active ? "#2563EB" : "#93C5FD";
  return active ? "#0F172A" : "#94A3B8";
}

function path(points: [number, number][]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}

export function WorkflowGraph({
  onNode, onEdge, selectedNode,
}: { onNode: (id: string) => void; onEdge: (id: string) => void; selectedNode?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  const [labels, setLabels] = useState(true);
  const [boundaries, setBoundaries] = useState(false);
  const [checkpoints, setCheckpoints] = useState(false);
  const [contracts, setContracts] = useState(false);
  const [alternates, setAlternates] = useState(true);
  const [full, setFull] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const wheelRef = useRef((e: WheelEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const { zoom: z, offset: o } = stateRef.current;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * Math.exp(-dy * 0.0015)));
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const k = next / z;
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
    setZoom(next);
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); wheelRef.current(e); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomAt = useCallback((factor: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const { zoom: z, offset: o } = stateRef.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor));
    const px = el.clientWidth / 2, py = el.clientHeight / 2, k = next / z;
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
    setZoom(next);
  }, []);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const k = Math.min(el.clientWidth / VIEW_W, (el.clientHeight - 8) / VIEW_H);
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, k)));
    setOffset({ x: (el.clientWidth - VIEW_W * k) / 2, y: 4 });
  }, []);

  useEffect(() => { fit(); }, [fit, full]);

  const reset = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) });
  };
  const endDrag = () => { drag.current = null; };

  const visibleEdges = GRAPH_EDGES.filter((e) => alternates || e.kind !== "alternate");

  const body = (
    <div className={cn("flex flex-col gap-2", full && "h-full")}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Btn onClick={fit}><Crosshair className="h-3.5 w-3.5" />Fit</Btn>
        <Btn onClick={() => zoomAt(1 / 1.2)}><Minus className="h-3.5 w-3.5" /></Btn>
        <span className="w-12 text-center text-[11.5px] tabular-nums text-slate-600">{Math.round(zoom * 100)}%</span>
        <Btn onClick={() => zoomAt(1.2)}><Plus className="h-3.5 w-3.5" /></Btn>
        <Btn onClick={reset}><RotateCcw className="h-3.5 w-3.5" />Reset</Btn>
        <Btn onClick={() => setFull((v) => !v)}><Maximize2 className="h-3.5 w-3.5" />{full ? "Exit full screen" : "Full screen"}</Btn>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <Toggle on={labels} onClick={() => setLabels((v) => !v)} icon={Tag}>Labels</Toggle>
        <Toggle on={boundaries} onClick={() => setBoundaries((v) => !v)} icon={ShieldCheck}>Policy boundaries</Toggle>
        <Toggle on={checkpoints} onClick={() => setCheckpoints((v) => !v)} icon={Save}>State checkpoints</Toggle>
        <Toggle on={contracts} onClick={() => setContracts((v) => !v)} icon={FileCode2}>Execution contracts</Toggle>
        <Toggle on={alternates} onClick={() => setAlternates((v) => !v)} icon={GitBranch}>Alternate paths</Toggle>
      </div>

      {/* Canvas */}
      <div ref={wrapRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag}
        className={cn("relative overflow-hidden rounded-md border border-slate-200 bg-[linear-gradient(#F1F5F9_1px,transparent_1px),linear-gradient(90deg,#F1F5F9_1px,transparent_1px)] bg-[length:24px_24px]",
          full ? "flex-1" : "h-[380px]")}
        style={{ touchAction: "none", cursor: drag.current ? "grabbing" : "grab" }}>
        <svg width="100%" height="100%" role="img" aria-label="Incident Investigation and Remediation execution graph">
          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            {boundaries && (
              <>
                <rect x={548} y={30} width={380} height={200} rx={8} fill="rgba(245,158,11,0.06)" stroke="#F59E0B" strokeDasharray="4 3" />
                <text x={558} y={24} fontSize={9.5} fill="#B45309" fontWeight={600}>PRODUCTION EXECUTION POLICY BOUNDARY — approval + privileged gateway</text>
                <rect x={12} y={130} width={520} height={190} rx={8} fill="rgba(37,99,235,0.05)" stroke="#60A5FA" strokeDasharray="4 3" />
                <text x={22} y={126} fontSize={9.5} fill="#1D4ED8" fontWeight={600}>ANALYSIS BOUNDARY — no execution authority</text>
              </>
            )}

            {/* Edges */}
            {visibleEdges.map((e) => {
              const active = hoverEdge === e.id;
              const dash = e.kind === "retry" ? (active ? "5 3" : "3 4") : e.kind === "alternate" ? "6 4" : e.kind === "failure" ? "2 3" : undefined;
              return (
                <g key={e.id} onMouseEnter={() => setHoverEdge(e.id)} onMouseLeave={() => setHoverEdge(null)}
                  onClick={(ev) => { ev.stopPropagation(); onEdge(e.id); }} style={{ cursor: "pointer" }}>
                  <path d={path(e.points)} fill="none" stroke="transparent" strokeWidth={12} />
                  <path d={path(e.points)} fill="none" stroke={edgeStroke(e.kind, active)} strokeWidth={active ? 2.2 : 1.4}
                    strokeDasharray={dash} markerEnd={`url(#arrow-${e.kind}${active ? "-a" : ""})`} />
                  {labels && e.label && (
                    <text x={e.points[Math.floor(e.points.length / 2)][0]} y={e.points[Math.floor(e.points.length / 2)][1] - 6}
                      fontSize={9} fill={edgeStroke(e.kind, true)} textAnchor="middle" fontWeight={500}>{e.label}</text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {GRAPH_NODES.map((n) => {
              const s = NODE_STYLE[n.kind];
              const active = hoverNode === n.id || selectedNode === n.id;
              return (
                <g key={n.id} onMouseEnter={() => setHoverNode(n.id)} onMouseLeave={() => setHoverNode(null)}
                  onClick={(ev) => { ev.stopPropagation(); onNode(n.id); }}
                  tabIndex={0} role="button" aria-label={`${n.label} — ${n.nodeId}`}
                  onKeyDown={(ev) => { if (ev.key === "Enter") onNode(n.id); }} style={{ cursor: "pointer", outline: "none" }}>
                  <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={6} fill={s.fill} stroke={active ? s.text : s.stroke}
                    strokeWidth={active ? 2 : 1.2} />
                  <text x={n.x + 9} y={n.y + 19} fontSize={11} fontWeight={600} fill={s.text}>{n.label}</text>
                  <text x={n.x + 9} y={n.y + 33} fontSize={9.5} fill={s.text} opacity={0.75}>{n.sub}</text>
                  {checkpoints && n.checkpoint !== "None" && (
                    <>
                      <circle cx={n.x + n.w - 8} cy={n.y + 8} r={5} fill="#0F766E" />
                      <text x={n.x + n.w - 8} y={n.y + 11.5} fontSize={7} fill="#fff" textAnchor="middle" fontWeight={700}>C</text>
                    </>
                  )}
                  {contracts && (
                    <text x={n.x} y={n.y + n.h + 11} fontSize={8.5} fill="#475569">
                      in {n.inputSchema.length} · out {n.outputSchema.length} · {n.timeout.split(" ")[0]} · retry {n.retry.split(" ")[0]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          <defs>
            {(["success", "alternate", "retry", "failure"] as const).map((k) => (
              <marker key={k} id={`arrow-${k}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L8 4 L0 8 z" fill={edgeStroke(k, false)} />
              </marker>
            ))}
            {(["success", "alternate", "retry", "failure"] as const).map((k) => (
              <marker key={`${k}-a`} id={`arrow-${k}-a`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L8 4 L0 8 z" fill={edgeStroke(k, true)} />
              </marker>
            ))}
          </defs>
        </svg>

        {/* Hover cards */}
        {hoverNode && <NodeHover node={GRAPH_NODES.find((n) => n.id === hoverNode)!} />}
        {hoverEdge && !hoverNode && <EdgeHover edge={GRAPH_EDGES.find((e) => e.id === hoverEdge)!} />}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {GRAPH_LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10.5px] text-slate-600">
            {l.kind in NODE_STYLE ? (
              <span className="h-2.5 w-4 rounded-sm border" style={{ background: NODE_STYLE[l.kind as NodeKind].fill, borderColor: NODE_STYLE[l.kind as NodeKind].stroke }} />
            ) : (
              <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: LEGEND_SWATCH[l.kind] }} />
            )}
            {l.label}
          </span>
        ))}
        <span className="ml-auto text-[10.5px] text-slate-400">Scroll to zoom · drag to pan · click any node or edge to inspect</span>
      </div>
    </div>
  );

  if (!full) return body;

  return (
    <div className="fixed inset-0 z-[65] flex flex-col gap-2 bg-white p-4">
      <div className="text-[15px] font-semibold text-slate-900">Selected Workflow Graph: Incident Investigation &amp; Remediation</div>
      {body}
    </div>
  );
}

function Toggle({ on, onClick, icon: Icon, children }: { on: boolean; onClick: () => void; icon: any; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] transition-colors",
        on ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
      <Icon className="h-3.5 w-3.5" />{children}
    </button>
  );
}

function NodeHover({ node }: { node: GraphNode }) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 w-[330px] rounded-md border border-slate-200 bg-white/97 p-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-slate-900">{node.label}</span>
        <span className="font-mono text-[10px] text-slate-500">{node.nodeId}</span>
      </div>
      <dl className="mt-1 grid grid-cols-[92px_1fr] gap-x-2 gap-y-0.5 text-[10.5px]">
        {([["Type", node.kind === "agent" ? "Digital Coworker" : node.kind === "tool" ? "Tool Execution" : node.kind === "approval" ? "Approval Gate" : node.kind === "human" ? "Human Step" : node.kind === "validation" ? "Validation Step" : node.kind === "end" ? "End State" : "Automated Step"],
          ["Participant", node.participant], ["Input schema", node.inputSchema.slice(0, 3).join(", ")],
          ["Output schema", node.outputSchema.slice(0, 3).join(", ")], ["Timeout", node.timeout], ["Retry", node.retry],
          ["Policy", node.policy], ["Authority", node.authority], ["Checkpoint", node.checkpoint]] as [string, string][]).map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="text-slate-700">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function EdgeHover({ edge }: { edge: GraphEdge }) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 w-[330px] rounded-md border border-slate-200 bg-white/97 p-2.5 shadow-lg">
      <div className="text-[12px] font-semibold text-slate-900">Transition rule</div>
      <dl className="mt-1 grid grid-cols-[86px_1fr] gap-x-2 gap-y-0.5 text-[10.5px]">
        {([["Rule", edge.rule], ["Condition", edge.condition], ["Priority", edge.priority], ["Fallback", edge.fallback], ["Threshold", edge.threshold]] as [string, string][]).map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="text-slate-700">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

export { RichTip };
