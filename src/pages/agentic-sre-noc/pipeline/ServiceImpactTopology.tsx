/**
 * AIM-002 — customer and service impact topology.
 *
 * Controlled grid layout with stable node positions. No physics simulation.
 */

import { cn } from "@/lib/utils";
import { impactTopologyEdges, impactTopologyNodes } from "../data/pliPipelineFixtures";

const COLS = 6;
const ROWS = 4;
const W = 660;
const H = 260;
const NODE_W = 96;
const NODE_H = 42;

function position(col: number, row: number) {
  const x = (col + 0.5) * (W / COLS);
  const y = (row + 0.5) * (H / ROWS);
  return { x, y };
}

const EDGE_STYLE: Record<string, { stroke: string; dash?: string }> = {
  primary: { stroke: "#2563eb" },
  fallback: { stroke: "#059669", dash: "5 3" },
  governs: { stroke: "#94a3b8", dash: "2 3" },
};

export function ServiceImpactTopology({
  selectedNodeId, onSelectNode,
}: {
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  const selected = impactTopologyNodes.find((n) => n.id === selectedNodeId) ?? null;
  const upstream = selected ? impactTopologyEdges.filter((e) => e.to === selected.id) : [];
  const downstream = selected ? impactTopologyEdges.filter((e) => e.from === selected.id) : [];

  return (
    <div className="space-y-1.5">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[190px] w-full min-w-[420px]"
          role="img"
          aria-label="Customer and service impact topology for the selected optical link"
          data-testid="impact-topology"
        >
          {impactTopologyEdges.map((e) => {
            const from = impactTopologyNodes.find((n) => n.id === e.from)!;
            const to = impactTopologyNodes.find((n) => n.id === e.to)!;
            const a = position(from.col, from.row);
            const b = position(to.col, to.row);
            const style = EDGE_STYLE[e.kind];
            const active = selected ? e.from === selected.id || e.to === selected.id : false;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={active ? style.stroke : "#cbd5e1"}
                  strokeWidth={active ? 2 : 1.2}
                  strokeDasharray={style.dash}
                />
                <text
                  x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 3}
                  textAnchor="middle" fontSize="8"
                  fill={active ? "#334155" : "#94a3b8"}
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {impactTopologyNodes.map((n) => {
            const { x, y } = position(n.col, n.row);
            const isSelected = selectedNodeId === n.id;
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${n.type}, ${n.name}, health ${n.health}, risk ${n.risk}`}
                aria-pressed={isSelected}
                data-testid={`topology-node-${n.id}`}
                onClick={() => onSelectNode(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectNode(n.id);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <rect
                  x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx="5"
                  fill={isSelected ? "#eff6ff" : "#ffffff"}
                  stroke={isSelected ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text x={x} y={y - 8} textAnchor="middle" fontSize="7.5" fill="#64748b">{n.type}</text>
                <text x={x} y={y + 2} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#0f172a">
                  {n.name.length > 16 ? `${n.name.slice(0, 15)}…` : n.name}
                </text>
                <text x={x} y={y + 13} textAnchor="middle" fontSize="7.5" fill="#475569">{n.health}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Relationship cards, primary presentation on mobile and the accessible alternative everywhere. */}
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:hidden">
        {impactTopologyNodes.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onSelectNode(n.id)}
              aria-pressed={selectedNodeId === n.id}
              data-testid={`topology-card-${n.id}`}
              className={cn(
                "w-full rounded border px-1.5 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                selectedNodeId === n.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              <span className="block text-[9px] uppercase tracking-wide text-slate-500">{n.type}</span>
              <span className="block truncate text-[10.5px] font-medium text-slate-900">{n.name}</span>
              <span className="block text-[9.5px] text-slate-600">{n.health} · Risk {n.risk}</span>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <dl
          data-testid="topology-node-detail"
          className="grid grid-cols-2 gap-x-2 gap-y-0.5 rounded border border-slate-200 bg-slate-50 p-2 text-[9.5px]"
        >
          <div className="col-span-2 text-[10.5px] font-semibold text-slate-900">
            {selected.type}: {selected.name}
          </div>
          {[
            ["Health", selected.health],
            ["Capacity", selected.capacity],
            ["Risk", selected.risk],
            ["Ownership", selected.owner],
            ["Dependency role", selected.role],
            ["Operational impact", selected.risk === "High" ? "Directly exposed to the predicted degradation" : "Indirectly exposed through the service path"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-1">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium text-slate-900">{v}</dd>
            </div>
          ))}
          <div className="col-span-2 text-slate-600">
            Upstream: {upstream.length ? upstream.map((e) => e.from).join(", ") : "none"} · Downstream:{" "}
            {downstream.length ? downstream.map((e) => e.to).join(", ") : "none"}
          </div>
        </dl>
      )}
    </div>
  );
}
