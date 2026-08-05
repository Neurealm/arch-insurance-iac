/**
 * End-to-end customer service route visualization.
 *
 * Node and edge topology for a single customer service. Presentation only —
 * all data is injected from ../data/cshFixtures.
 */

import { cn } from "@/lib/utils";
import type { RouteEdge, RouteNode, ServiceRoute } from "../data/cshFixtures";

const healthColor: Record<RouteNode["health"], string> = {
  Healthy: "#059669",
  "At risk": "#d97706",
  Degraded: "#ea580c",
  Unavailable: "#e11d48",
};

const transportColor: Record<RouteEdge["transport"], string> = {
  "Primary optical": "#059669",
  "Alternate optical": "#7c3aed",
  "RF fallback": "#0284c7",
  "Fiber backup": "#0f766e",
  "Ethernet handoff": "#94a3b8",
};

const laneOffset: Record<RouteEdge["transport"], number> = {
  "Primary optical": 0,
  "Alternate optical": -7,
  "RF fallback": 7,
  "Fiber backup": 12,
  "Ethernet handoff": 0,
};

/** Fixture coordinates use y = 50; the canvas is short and wide, so shift up. */
const Y_SHIFT = -37;

interface Props {
  route: ServiceRoute;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
}

export function ServiceRouteGraph({ route, selectedNodeId, selectedEdgeId, onSelectNode, onSelectEdge }: Props) {
  const nodeById = (id: string) => route.nodes.find((n) => n.id === id)!;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 100 30"
        className="h-[280px] w-full min-w-[900px]"
        role="img"
        aria-label="End to end customer service route with nodes and transport paths"
      >
        <g transform={`translate(0 ${Y_SHIFT})`}>
        {route.edges.map((e) => {
          const a = nodeById(e.from);
          const b = nodeById(e.to);
          const off = laneOffset[e.transport];
          const active = e.id === route.activeEdgeId;
          const sel = e.id === selectedEdgeId;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 + off;
          const d = off === 0
            ? `M${a.x},${a.y} L${b.x},${b.y}`
            : `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
          return (
            <g
              key={e.id}
              role="button"
              tabIndex={0}
              aria-label={`${e.transport} path, ${e.state}, ${e.throughput} of ${e.maxCapacity}`}
              onClick={() => onSelectEdge(e.id)}
              onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onSelectEdge(e.id); } }}
              className="cursor-pointer"
            >
              <path d={d} fill="none" stroke="transparent" strokeWidth={3.4} />
              <path
                d={d}
                fill="none"
                stroke={transportColor[e.transport]}
                strokeWidth={sel ? 1.5 : active ? 1.1 : 0.6}
                strokeDasharray={e.state === "Active" ? undefined : "1.4 1"}
                opacity={e.state === "Active" ? 0.95 : 0.6}
              />
              {off !== 0 && (
                <text x={mx} y={my + (off > 0 ? 2.6 : -1.4)} textAnchor="middle" fontSize={1.5} fill="#475569">
                  {e.transport} · {e.state}
                </text>
              )}
              <title>{`${e.transport} · ${e.state} · ${e.throughput} of ${e.maxCapacity} · ${e.latency}`}</title>
            </g>
          );
        })}

        </g>
        <g transform={`translate(0 ${Y_SHIFT})`}>
        {route.nodes.map((n) => {
          const sel = n.id === selectedNodeId;
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-label={`${n.name}, ${n.type}, health ${n.health}`}
              onClick={() => onSelectNode(n.id)}
              onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onSelectNode(n.id); } }}
              className="cursor-pointer"
            >
              <rect
                x={n.x - 6} y={n.y - 3.4} width={12} height={7} rx={1}
                fill="#ffffff"
                stroke={sel ? "#4f46e5" : "#cbd5e1"}
                strokeWidth={sel ? 0.7 : 0.3}
              />
              <circle cx={n.x} cy={n.y - 1.6} r={0.7} fill={healthColor[n.health]} />
              <text x={n.x} y={n.y + 0.7} textAnchor="middle" fontSize={1.3} fill="#0f172a">
                {n.type}
              </text>
              <text x={n.x} y={n.y + 2.7} textAnchor="middle" fontSize={1.1} fill="#64748b">
                {n.capacity}
              </text>
              <text x={n.x} y={n.y - 4.6} textAnchor="middle" fontSize={1.25} fill="#334155">
                {n.name.length > 22 ? `${n.name.slice(0, 21)}…` : n.name}
              </text>
              <title>{`${n.name} · ${n.owner} · ${n.health} · ${n.latency}`}</title>
            </g>
          );
        })}
        </g>
      </svg>

      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-slate-600">
        {(Object.keys(transportColor) as RouteEdge["transport"][]).map((t) => (
          <li key={t} className="flex items-center gap-1">
            <span className={cn("h-1.5 w-3 rounded")} style={{ backgroundColor: transportColor[t] }} aria-hidden />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
