/**
 * Interactive service topology canvas for the Global Optical Service Topology
 * page. Pure presentation: nodes, edges, pan, zoom and selection only.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  healthGlyph, healthStroke, type TopoEdge, type TopoGraph, type TopoNode, type TopologyHealth,
} from "../data/topologyFixtures";

const VIEW_W = 210;
const VIEW_H = 104;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const NODE_W = 22;
const NODE_H = 11;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface TopologyCanvasProps {
  graph: TopoGraph;
  visibleNodeIds: Set<string>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  highlighted: Set<string>;
  healthOverrides: Record<string, TopologyHealth>;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  showOwnership: boolean;
  fullScreen: boolean;
  onToggleFullScreen: () => void;
}

export function TopologyCanvas({
  graph, visibleNodeIds, selectedNodeId, selectedEdgeId, highlighted, healthOverrides,
  onSelectNode, onSelectEdge, showOwnership, fullScreen, onToggleFullScreen,
}: TopologyCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = useMemo(() => graph.nodes.filter((n) => visibleNodeIds.has(n.id)), [graph.nodes, visibleNodeIds]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const edges = useMemo(
    () => graph.edges.filter((e) => byId.has(e.from) && byId.has(e.to)),
    [graph.edges, byId],
  );

  const healthOf = useCallback(
    (n: TopoNode) => healthOverrides[n.id] ?? n.health,
    [healthOverrides],
  );

  const reset = useCallback(() => { setZoom(1); setOffset({ x: 0, y: 0 }); }, []);

  const zoomBy = useCallback((factor: number, px?: number, py?: number) => {
    setZoom((z) => {
      const next = clamp(z * factor, MIN_ZOOM, MAX_ZOOM);
      const k = next / z;
      const ax = px ?? VIEW_W / 2;
      const ay = py ?? VIEW_H / 2;
      setOffset((o) => ({ x: ax - (ax - o.x) * k, y: ay - (ay - o.y) * k }));
      return next;
    });
  }, []);

  const wheelRef = useRef((e: WheelEvent) => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const px = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const py = ((e.clientY - rect.top) / rect.height) * VIEW_H;
    zoomBy(Math.exp(-dy * 0.0015), px, py);
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); wheelRef.current(e); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /** Centres the selected node in the viewport. */
  const centerSelected = useCallback(() => {
    const n = graph.nodes.find((x) => x.id === selectedNodeId);
    if (!n) return;
    setOffset({ x: VIEW_W / 2 - n.x * zoom, y: VIEW_H / 2 - n.y * zoom });
  }, [graph.nodes, selectedNodeId, zoom]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("[data-topo-hit]")) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.x) / rect.width) * VIEW_W;
    const dy = ((e.clientY - drag.y) / rect.height) * VIEW_H;
    setOffset({ x: clamp(drag.ox + dx, -VIEW_W * 2, VIEW_W * 2), y: clamp(drag.oy + dy, -VIEW_H * 2, VIEW_H * 2) });
  };
  const endDrag = () => setDrag(null);

  const isDim = (id: string) => highlighted.size > 0 && !highlighted.has(id);

  const edgePoints = (e: TopoEdge) => {
    const a = byId.get(e.from)!;
    const b = byId.get(e.to)!;
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
        fullScreen ? "h-[78vh]" : "h-[520px]",
      )}
    >
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
        <CanvasButton label="Zoom in" onClick={() => zoomBy(1.25)}><Plus className="h-3.5 w-3.5" /></CanvasButton>
        <CanvasButton label="Zoom out" onClick={() => zoomBy(1 / 1.25)}><Minus className="h-3.5 w-3.5" /></CanvasButton>
        <CanvasButton label="Fit to view" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /></CanvasButton>
        <CanvasButton label="Center selected object" onClick={centerSelected}><Crosshair className="h-3.5 w-3.5" /></CanvasButton>
        <CanvasButton label={fullScreen ? "Exit full screen topology" : "Full screen topology"} onClick={onToggleFullScreen}><Maximize2 className="h-3.5 w-3.5" /></CanvasButton>
      </div>

      <div
        ref={wrapRef}
        className={cn("h-full w-full", drag ? "cursor-grabbing" : "cursor-grab")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        style={{ touchAction: "none" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="application"
          aria-label="Interactive service topology canvas"
        >
          <defs>
            <pattern id="topo-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width={VIEW_W} height={VIEW_H} fill="url(#topo-grid)" />

          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            {edges.map((e) => {
              const { x1, y1, x2, y2 } = edgePoints(e);
              const stroke = healthStroke[e.health];
              const active = selectedEdgeId === e.id;
              const dim = isDim(e.from) && isDim(e.to);
              return (
                <g key={e.id} opacity={dim ? 0.18 : 1}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={stroke}
                    strokeWidth={active ? 1.1 : 0.5}
                    strokeDasharray={e.alternate ? "1.6 1.2" : e.context ? "0.6 0.9" : undefined}
                  />
                  <line
                    data-topo-hit
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="transparent"
                    strokeWidth={2.4}
                    className="cursor-pointer"
                    onClick={(ev) => { ev.stopPropagation(); onSelectEdge(e.id); }}
                    onMouseEnter={() => setHovered(e.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <title>{`${e.relationship} — ${e.health}, ${e.owner}, validated ${e.lastValidated}`}</title>
                  </line>
                  {(active || hovered === e.id || zoom > 1.9) && (
                    <text
                      x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 0.8}
                      textAnchor="middle"
                      fontSize={1.8}
                      fill="#475569"
                      className="pointer-events-none select-none"
                    >
                      {e.relationship}
                    </text>
                  )}
                </g>
              );
            })}

            {nodes.map((n) => {
              const health = healthOf(n);
              const stroke = healthStroke[health];
              const selected = selectedNodeId === n.id;
              const dim = isDim(n.id);
              return (
                <g
                  key={n.id}
                  data-topo-hit
                  transform={`translate(${n.x - NODE_W / 2} ${n.y - NODE_H / 2})`}
                  opacity={dim ? 0.22 : 1}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.label}, ${n.kind}, ${health}`}
                  aria-pressed={selected}
                  onClick={(ev) => { ev.stopPropagation(); onSelectNode(n.id); }}
                  onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onSelectNode(n.id); } }}
                >
                  <title>{`${n.label} — ${n.kind}. Health ${health}. Risk ${n.risk}. Owner ${n.owner}. ${n.state}`}</title>
                  <rect
                    width={NODE_W} height={NODE_H} rx={1.6}
                    fill="#ffffff"
                    stroke={selected ? "#4f46e5" : stroke}
                    strokeWidth={selected ? 0.9 : 0.45}
                    strokeDasharray={health === "Telemetry stale" || health === "Ownership unclear" ? "1.2 0.8" : undefined}
                  />
                  <rect width={1.2} height={NODE_H} rx={0.6} fill={stroke} />
                  <text x={2.4} y={3.6} fontSize={1.7} fill="#64748b" className="select-none">{n.kind}</text>
                  <text x={2.4} y={6.4} fontSize={2.2} fontWeight={600} fill="#0f172a" className="select-none">
                    {n.label.length > 26 ? `${n.label.slice(0, 25)}…` : n.label}
                  </text>
                  <text x={2.4} y={9} fontSize={1.7} fill="#475569" className="select-none">
                    {healthGlyph[health]} {health}
                  </text>
                  {showOwnership && (
                    <text x={NODE_W - 0.8} y={9} fontSize={1.6} textAnchor="end" fill="#7c3aed" className="select-none">
                      {n.owner}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-2 rounded border border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-600">
        {nodes.length} objects · {edges.length} relationships · zoom {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}

function CanvasButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
