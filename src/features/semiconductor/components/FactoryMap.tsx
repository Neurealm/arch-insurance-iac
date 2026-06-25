import { motion } from "framer-motion";
import { useScenario } from "../state/ScenarioContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Bay = {
  id: string;
  label: string;
  x: number; y: number; w: number; h: number;
  status: "ok" | "warn" | "crit";
  tools: number;
};

const BAYS: Bay[] = [
  { id: "incoming", label: "Incoming Material", x: 20, y: 20, w: 120, h: 60, status: "ok", tools: 12 },
  { id: "diffusion", label: "Diffusion / Thermal", x: 160, y: 20, w: 130, h: 60, status: "ok", tools: 42 },
  { id: "implant", label: "Ion Implant", x: 310, y: 20, w: 110, h: 60, status: "ok", tools: 18 },
  { id: "depo", label: "Thin Film Deposition", x: 440, y: 20, w: 140, h: 60, status: "ok", tools: 58 },
  { id: "litho", label: "Photolithography", x: 600, y: 20, w: 140, h: 60, status: "warn", tools: 72 },
  { id: "etch", label: "Dry / Wet Etch", x: 20, y: 100, w: 150, h: 60, status: "ok", tools: 64 },
  { id: "cmp", label: "CMP", x: 190, y: 100, w: 100, h: 60, status: "ok", tools: 28 },
  { id: "clean", label: "Wet Clean", x: 310, y: 100, w: 110, h: 60, status: "ok", tools: 32 },
  { id: "metro", label: "Metrology & Inspection", x: 440, y: 100, w: 160, h: 60, status: "crit", tools: 104 },
  { id: "amhs", label: "AMHS / Bay 3 Route", x: 620, y: 100, w: 120, h: 60, status: "warn", tools: 76 },
  { id: "util", label: "Facilities & Utilities", x: 20, y: 180, w: 360, h: 50, status: "warn", tools: 0 },
  { id: "eng", label: "Engineering Support", x: 400, y: 180, w: 340, h: 50, status: "ok", tools: 0 },
];

const statusColor: Record<Bay["status"], { fill: string; stroke: string; dot: string }> = {
  ok: { fill: "#ecfdf5", stroke: "#86efac", dot: "#10b981" },
  warn: { fill: "#fffbeb", stroke: "#fcd34d", dot: "#f59e0b" },
  crit: { fill: "#fef2f2", stroke: "#fca5a5", dot: "#ef4444" },
};

export function FactoryMap({ onSelectBay }: { onSelectBay?: (b: Bay) => void }) {
  const { scenarioId, appliedCandidate } = useScenario();
  const [overlay, setOverlay] = useState<"flow" | "queue" | "amhs" | "vision" | "util">("flow");
  const [hover, setHover] = useState<string | null>(null);
  const easeWarn = appliedCandidate === "balanced";

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-sm font-semibold">North Texas Reference Fab 01 — Live Layout</div>
          <div className="text-[11px] text-muted-foreground">640,000 sq ft · 9 production bays · 418 tools · 76 AMHS vehicles · synthetic</div>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          {([
            ["flow", "Flow"],
            ["queue", "Queue Risk"],
            ["amhs", "AMHS"],
            ["vision", "Vision"],
            ["util", "Utilities"],
          ] as const).map(([k, l]) => (
            <button key={k} onClick={() => setOverlay(k)}
              className={cn("px-2 py-1 rounded border", overlay === k ? "bg-indigo text-white border-indigo" : "border-border bg-background hover:bg-accent")}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-[linear-gradient(135deg,#f8fafc,#eef2ff)]">
        <svg viewBox="0 0 760 250" className="w-full h-[360px]">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="rail" x1="0" x2="1">
              <stop offset="0" stopColor="#94a3b8" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          <rect width="760" height="250" fill="url(#grid)" />

          {/* AMHS rails */}
          <path d="M0 92 H760" stroke="url(#rail)" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />
          <path d="M0 172 H760" stroke="url(#rail)" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />

          {BAYS.map((b) => {
            const c = statusColor[easeWarn && b.status === "crit" ? "warn" : easeWarn && b.status === "warn" && (b.id === "amhs" || b.id === "litho") ? "ok" : b.status];
            const queueIntensity = overlay === "queue" ? (b.status === "crit" ? 1 : b.status === "warn" ? 0.5 : 0.1) : 0;
            return (
              <g key={b.id}
                onMouseEnter={() => setHover(b.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectBay?.(b)}
                style={{ cursor: "pointer" }}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={c.fill} stroke={c.stroke} strokeWidth={hover === b.id ? 2 : 1} />
                <text x={b.x + 8} y={b.y + 18} fontSize="10" fill="#0f172a" fontWeight={600}>{b.label}</text>
                {b.tools > 0 && <text x={b.x + 8} y={b.y + 32} fontSize="9" fill="#475569">{b.tools} tools</text>}
                <circle cx={b.x + b.w - 10} cy={b.y + 10} r="3.5" fill={c.dot}>
                  {b.status !== "ok" && (
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
                  )}
                </circle>
                {queueIntensity > 0 && (
                  <rect x={b.x} y={b.y + b.h - 6} width={b.w * queueIntensity} height={4} fill="#ef4444" opacity={0.55} />
                )}
              </g>
            );
          })}

          {/* Animated FOUPs */}
          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={`f-${i}-${scenarioId}-${appliedCandidate ?? "n"}`}
              r={4} fill="#3b82f6"
              initial={{ cx: 0, cy: 92 }}
              animate={{ cx: [0, 760], cy: 92 }}
              transition={{ duration: 12 + i * 2, repeat: Infinity, delay: i * 2, ease: "linear" }}
            />
          ))}
          {[0, 1].map((i) => (
            <motion.circle
              key={`g-${i}-${scenarioId}-${appliedCandidate ?? "n"}`}
              r={4} fill={overlay === "amhs" ? "#f59e0b" : "#0ea5e9"}
              initial={{ cx: 760, cy: 172 }}
              animate={{ cx: [760, 0], cy: 172 }}
              transition={{ duration: 14 + i * 3, repeat: Infinity, delay: i * 3, ease: "linear" }}
            />
          ))}

          {/* Utility flow */}
          {overlay === "util" && (
            <g>
              <path d="M20 230 H740" stroke="#0891b2" strokeWidth="2" fill="none" />
              {[0, 1, 2].map((i) => (
                <motion.circle key={`u-${i}`} r={3} fill="#06b6d4"
                  initial={{ cx: 20, cy: 230 }}
                  animate={{ cx: [20, 740] }}
                  transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: "linear" }}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
