import { useMemo } from "react";
import { BUILDINGS, STATUS_COLOR } from "./buildings";
import { useTwinStore, type LayerId } from "./store";
import {
  Activity,
  Boxes,
  Cpu,
  Droplets,
  Flame,
  Leaf,
  ShieldAlert,
  Sparkles,
  Wrench,
  Zap,
  RotateCcw,
  Maximize2,
  Minus,
  Plus,
} from "lucide-react";

/* ---------- Layer toolbar ---------- */

const LAYERS: { id: LayerId; label: string; icon: any }[] = [
  { id: "production",    label: "Production",    icon: Boxes },
  { id: "equipment",     label: "Equipment Health", icon: Cpu },
  { id: "material",      label: "Material Flow", icon: Activity },
  { id: "utilities",     label: "Utilities",     icon: Droplets },
  { id: "maintenance",   label: "Maintenance",   icon: Wrench },
  { id: "power",         label: "Power",         icon: Zap },
  { id: "thermal",       label: "Thermal",       icon: Flame },
  { id: "environmental", label: "Environmental", icon: Leaf },
  { id: "quality",       label: "Quality",       icon: Sparkles },
  { id: "ai-risk",       label: "AI Risk",       icon: ShieldAlert },
];

export function LayerToolbar() {
  const { layers, toggleLayer, activeLayer, setActiveLayer } = useTwinStore();
  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 rounded-lg border border-white/[0.08] bg-slate-950/70 backdrop-blur-xl p-1.5 shadow-2xl">
      <div className="px-2 pt-1 pb-1 text-[9px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
        Layers
      </div>
      {LAYERS.map((l) => {
        const on = layers[l.id];
        const isActive = activeLayer === l.id;
        return (
          <button
            key={l.id}
            onClick={() => {
              toggleLayer(l.id);
              setActiveLayer(l.id);
            }}
            className={`group flex items-center gap-2 px-2 h-7 rounded-md text-[11px] transition ${
              isActive
                ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/40"
                : on
                ? "bg-white/[0.04] text-slate-200"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            <l.icon className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">{l.label}</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                on ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-slate-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Scene legend ---------- */

const LEGEND: Array<[string, string]> = [
  ["Running", STATUS_COLOR.running],
  ["Idle", STATUS_COLOR.idle],
  ["Maintenance", STATUS_COLOR.maintenance],
  ["Warning", STATUS_COLOR.warning],
  ["Critical", STATUS_COLOR.critical],
  ["Offline", STATUS_COLOR.offline],
];

export function SceneLegend() {
  return (
    <div className="absolute top-3 right-3 z-20 rounded-lg border border-white/[0.08] bg-slate-950/70 backdrop-blur-xl p-2 shadow-2xl">
      <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-1.5 px-1">
        Status
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {LEGEND.map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5 text-[10.5px] text-slate-300">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: c, boxShadow: `0 0 6px ${c}` }}
            />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Camera controls (rotate/zoom/reset/fullscreen placeholder) ---------- */

export function CameraToolbar({ onZoom, onReset, onFullscreen }: { onZoom: (delta: number) => void; onReset: () => void; onFullscreen: () => void }) {
  const Btn = ({ children, onClick, label }: any) => (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="h-8 w-8 grid place-items-center rounded-md bg-slate-950/70 border border-white/[0.08] text-slate-200 hover:bg-sky-500/15 hover:text-sky-200 hover:border-sky-400/40 transition backdrop-blur-xl"
    >
      {children}
    </button>
  );
  return (
    <div className="absolute top-3 right-[180px] z-20 flex flex-col gap-1.5">
      <Btn onClick={() => onZoom(-1)} label="Zoom in"><Plus className="h-3.5 w-3.5" /></Btn>
      <Btn onClick={() => onZoom(1)} label="Zoom out"><Minus className="h-3.5 w-3.5" /></Btn>
      <Btn onClick={onReset} label="Reset view"><RotateCcw className="h-3.5 w-3.5" /></Btn>
      <Btn onClick={onFullscreen} label="Fullscreen"><Maximize2 className="h-3.5 w-3.5" /></Btn>
    </div>
  );
}

/* ---------- MiniMap ---------- */

export function MiniMap({ camPos }: { camPos: { x: number; z: number; rot: number } }) {
  const { selectedId, requestCamera } = useTwinStore();
  // map area: 60 x 80 px representing campus -50..50 x  -36..36
  const W = 180;
  const H = 130;
  const xToPx = (x: number) => ((x + 55) / 110) * W;
  const zToPy = (z: number) => ((z + 40) / 80) * H;

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const worldX = (px / W) * 110 - 55;
    const worldZ = (py / H) * 80 - 40;
    requestCamera([worldX + 30, 38, worldZ + 30], [worldX, 0, worldZ]);
  };

  return (
    <div className="absolute bottom-3 right-3 z-20 rounded-lg border border-white/[0.08] bg-slate-950/80 backdrop-blur-xl p-2 shadow-2xl">
      <div className="flex items-center justify-between mb-1 px-0.5">
        <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Mini Map</div>
        <div className="text-[9px] text-slate-500">Click to fly</div>
      </div>
      <div
        onClick={onClick}
        className="relative cursor-crosshair rounded border border-white/[0.06] overflow-hidden"
        style={{
          width: W,
          height: H,
          background:
            "radial-gradient(ellipse at center, rgba(56,189,248,0.08), transparent 70%), #060b15",
        }}
      >
        {/* campus outline */}
        <div
          className="absolute border border-sky-500/30 rounded-sm"
          style={{ left: xToPx(-55), top: zToPy(-40), width: W, height: H }}
        />
        {/* buildings */}
        {BUILDINGS.map((b) => {
          const isSel = b.id === selectedId;
          return (
            <div
              key={b.id}
              title={b.name}
              className="absolute rounded-[2px]"
              style={{
                left: xToPx(b.x - b.w / 2),
                top: zToPy(b.z - b.d / 2),
                width: Math.max(3, (b.w / 110) * W),
                height: Math.max(3, (b.d / 80) * H),
                background: STATUS_COLOR[b.status],
                opacity: isSel ? 1 : 0.7,
                boxShadow: isSel ? "0 0 8px rgba(56,189,248,0.9)" : undefined,
                outline: isSel ? "1px solid #38bdf8" : undefined,
              }}
            />
          );
        })}
        {/* camera marker */}
        <div
          className="absolute"
          style={{
            left: xToPx(camPos.x) - 6,
            top: zToPy(camPos.z) - 6,
            transform: `rotate(${camPos.rot}rad)`,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon points="6,0 12,12 6,9 0,12" fill="#38bdf8" stroke="#0c4a6e" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- Telemetry overlay (subtle live stream pill) ---------- */

export function TelemetryOverlay() {
  return (
    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-slate-950/70 backdrop-blur-xl px-3 py-1.5 text-[10.5px] text-slate-300 shadow-2xl">
      <span className="flex items-center gap-1.5 text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Twin Stream
      </span>
      <span className="text-slate-500">·</span>
      <span>60 FPS target</span>
      <span className="text-slate-500">·</span>
      <span>WebGL 2 · PBR</span>
      <span className="text-slate-500">·</span>
      <span className="text-sky-300">15 / 1,482 assets loaded</span>
    </div>
  );
}
