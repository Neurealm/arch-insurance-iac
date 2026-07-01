import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon, Wrench, Gauge, Lightbulb, GitBranch, Share2, AlertTriangle, Cpu, Play, Pause, RefreshCw, Plus, Minus, CheckCircle2, X, Sparkles, Droplets, Users, ShieldCheck, TrendingDown, Activity, Gavel, Brain, Scale, Search, Command as CmdIcon, Keyboard, Download, SkipBack, SkipForward, Layers as LayersIcon, Eye, EyeOff, Target as TargetIcon, BookOpen, UserCheck, FlaskConical, MessageSquare, Network,
} from "lucide-react";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Area, AreaChart,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";
import { SeadRail } from "@/components/sead/SeadRail";

/* ============ atoms ============ */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}
function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const s = performance.now();
    const tick = (n: number) => {
      const p = Math.min(1, (n - s) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/* ============ rail ============ */
/* ============ header ============ */
function AppHeader({ onOpenPalette }: any) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Factory Impact Simulator</div>
          <div className="text-[11px] text-slate-400">Live impact analysis of maintaining ETCH-217 Tonight (10:00 PM – 2:00 AM)</div>
        </div>
      </div>
      <div className="flex-1" />
      <button onClick={onOpenPalette}
        className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] flex items-center gap-2 text-[11.5px] text-slate-300">
        <Search className="h-3.5 w-3.5" /> Search areas, actions…
        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-slate-400 flex items-center gap-1">
          <CmdIcon className="h-2.5 w-2.5" />K
        </span>
      </button>
      <div className="text-right leading-tight">
        <div className="text-[12px] text-slate-200 tabular-nums">{date} {time} CT</div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </div>
      </div>
      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">3</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-bold text-white">AO</div>
    </header>
  );
}

/* ============ scenario presets that drive KPIs ============ */
type Scenario = {
  key: "now" | "tonight" | "tomorrow" | "wait7";
  label: string;
  prodDelta: number;       // wafers
  prodPct: number;         // %
  yieldPct: number;        // %
  bottlenecks: number;
  custOnTrack: number;
  custAtRisk: number;
  custLate: number;
  rev: number;             // $M revenue exposure
  rulExt: number;          // days
  overall: "Low" | "Medium" | "High";
};
const SCENARIOS: Record<string, Scenario> = {
  now:      { key: "now",      label: "Maintain Now",      prodDelta: -1850, prodPct: -3.4, yieldPct: -0.05, bottlenecks: 2, custOnTrack: 230, custAtRisk: 4,  custLate: 2, rev: 1.4,  rulExt: 60, overall: "Medium" },
  tonight:  { key: "tonight",  label: "Maintain Tonight",  prodDelta: -320,  prodPct: -0.6, yieldPct: -0.02, bottlenecks: 1, custOnTrack: 236, custAtRisk: 0,  custLate: 0, rev: 0.24, rulExt: 62, overall: "Low" },
  tomorrow: { key: "tomorrow", label: "Maintain Tomorrow", prodDelta: -540,  prodPct: -1.0, yieldPct: -0.03, bottlenecks: 1, custOnTrack: 234, custAtRisk: 2,  custLate: 0, rev: 0.41, rulExt: 58, overall: "Low" },
  wait7:    { key: "wait7",    label: "Wait 7 Days",        prodDelta: -2240, prodPct: -4.1, yieldPct: -0.15, bottlenecks: 3, custOnTrack: 220, custAtRisk: 12, custLate: 4, rev: 5.1,  rulExt: 14, overall: "High" },
};

/* ============ asset + control strip ============ */
function AssetStrip({ playing, setPlaying, speed, setSpeed, compareTo, setCompareTo, onRerun, scenarioObj }: any) {
  const nav = useNavigate();
  const F = ({ label, value, color = "text-slate-100" }: any) => (
    <div className="px-5 py-1.5 border-l border-white/[0.06] first:border-l-0">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-[13px] font-medium tabular-nums mt-0.5 ${color}`}>{value}</div>
    </div>
  );
  return (
    <div className="space-y-3">
      <button onClick={() => nav("/sead/maintenance-decision-simulator")} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to Decision Simulator
      </button>
      <div className="grid grid-cols-12 gap-3">
        <GlassCard className="col-span-12 xl:col-span-8 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Selected Asset</span>
              <div className="h-14 w-20 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center border border-white/10 mt-1">
                <Cpu className="h-7 w-7 text-sky-300/70" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-semibold text-white tracking-tight leading-none">ETCH-217</h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40">Fair</span>
              </div>
              <div className="text-[12px] text-slate-400 mt-1">Metal Etch Chamber | Bay 2</div>
            </div>
            <div className="flex flex-wrap items-center ml-2">
              <F label="Current Status" value="Running" color="text-emerald-300" />
              <F label="Utilization" value="85%" />
              <F label="Health Score" value={<><span className="text-amber-300">72</span><span className="text-slate-500">/100</span></>} />
              <F label="RUL" value={<><span>18 days</span><div className="text-[10px] text-slate-500">(±4 days)</div></>} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 xl:col-span-4 p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Simulation Horizon</div>
            <div className="text-[13.5px] font-medium text-white mt-0.5">7 Days</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPlaying(!playing)} title={playing ? "Pause (P)" : "Play (P)"}
              className={`h-10 w-10 rounded-md grid place-items-center text-white shadow-[0_0_18px_-4px_rgba(56,189,248,0.7)] ${playing ? "bg-sky-500 hover:bg-sky-400" : "bg-white/[0.04] border border-white/[0.06] text-slate-200 hover:bg-white/[0.08]"}`}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}
            </button>
            <button onClick={onRerun} title="Re-run (R)"
              className="h-10 w-10 rounded-md bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-200 hover:bg-white/[0.08]">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Speed</div>
            <button onClick={() => setSpeed(speed === 4 ? 0.5 : speed * 2)}
              className="mt-0.5 h-7 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-[12px] text-slate-200 flex items-center gap-1.5 hover:bg-white/[0.08]">
              {speed}x <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Compare To</div>
            <select value={compareTo} onChange={(e) => setCompareTo(e.target.value)}
              className="mt-0.5 h-7 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-[12px] text-slate-200 hover:bg-white/[0.08] outline-none">
              {Object.values(SCENARIOS).filter((s) => s.key !== scenarioObj.key).map((s) => (
                <option key={s.key} value={s.key} className="bg-[#0b1220]">{s.label}</option>
              ))}
            </select>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============ KPI strip ============ */
function TwinKpi({ icon: Ico, label, value, sub, color, delta }: any) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className={`h-9 w-9 rounded-md grid place-items-center border ${color}`}>
        <Ico className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 truncate">{label}</div>
        <div className="text-[14px] font-semibold text-white tabular-nums leading-tight">{value}</div>
        {sub && <div className="text-[10px] text-slate-400 truncate">{sub}</div>}
        {delta && <div className={`text-[10px] tabular-nums ${delta.startsWith("-") ? "text-emerald-300" : "text-rose-300"}`}>{delta} vs compare</div>}
      </div>
    </div>
  );
}

/* ============ isometric factory SVG ============ */
// Isometric box rendered with proper top/front/side faces.
// (x,y) is the front-bottom-left corner of the box; depth goes back-up-right.
function IsoBox({ x, y, w, h, depth = 14, color, glow, highlight = false }: any) {
  const dx = depth * 0.9;  // back-right offset
  const dy = depth * 0.55; // back-up offset
  const front = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
  const top   = `${x},${y} ${x + w},${y} ${x + w + dx},${y - dy} ${x + dx},${y - dy}`;
  const side  = `${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y + h - dy} ${x + w},${y + h}`;
  return (
    <g style={glow ? { filter: `drop-shadow(0 0 14px ${glow})` } : undefined}>
      <polygon points={top}   fill={color} style={{ filter: highlight ? "brightness(1.55)" : "brightness(1.35)" }} />
      <polygon points={front} fill={color} opacity={highlight ? 0.98 : 0.9} />
      <polygon points={side}  fill={color} opacity={highlight ? 0.78 : 0.62} />
      {/* subtle top edge highlight */}
      <line x1={x} y1={y} x2={x + w} y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
    </g>
  );
}

type LayerKey = "flow" | "wip" | "util" | "bottle" | "utility" | "cust";

// SVG viewBox is 1200 × 560. All anchors live in this coord space so leaders + overlay align.
const VB_W = 1200;
const VB_H = 560;

// Cluster builder: a dense isometric grid of cabinets
function buildCluster(originX: number, originY: number, cols: number, rows: number, cellW = 30, cellH = 22, gapX = 4, gapY = 8) {
  const arr: { id: string; x: number; y: number; w: number; h: number; cx: number; cy: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // iso skew: each row shifts back-up-right
      const sx = originX + c * (cellW + gapX) + r * 10;
      const sy = originY + r * (cellH + gapY) - r * 6;
      arr.push({
        id: `${originX}-${c}-${r}`,
        x: sx, y: sy, w: cellW, h: cellH,
        cx: sx + cellW / 2, cy: sy + cellH / 2,
      });
    }
  }
  return arr;
}

function FactoryTwin({ onOpenDrawer, layers, view, zoom, speed, scrubHour }: any) {
  // --- equipment clusters ---
  const frontEnd = useMemo(() => buildCluster(70,  230, 5, 4), []);
  const assembly = useMemo(() => buildCluster(840, 230, 5, 4), []);
  const middleA  = useMemo(() => buildCluster(420, 230, 3, 2), []);  // small bank above etch
  const middleB  = useMemo(() => buildCluster(420, 360, 3, 2), []);  // small bank below etch
  const backEnd  = useMemo(() => buildCluster(330, 470, 8, 1, 32, 22, 4, 0), []);

  // --- anchors used by leader lines & callouts ---
  // anchor = where the leader meets the equipment (svg coords)
  // card   = where the floating HTML card sits (svg coords; overlay converts to %)
  const ANCHORS = {
    etch217:  { ax: 600, ay: 290, cx: 600, cy: 80,  color: "#f43f5e", layer: "bottle" as LayerKey },
    alt215:   { ax: 180, ay: 295, cx: 240, cy: 200, color: "#22d3ee", layer: "util"   as LayerKey },
    alt220:   { ax: 470, ay: 480, cx: 440, cy: 410, color: "#f59e0b", layer: "util"   as LayerKey },
    wipAsm:   { ax: 920, ay: 290, cx: 820, cy: 200, color: "#a78bfa", layer: "wip"    as LayerKey },
    queue:    { ax: 360, ay: 480, cx: 100, cy: 430, color: "#ec4899", layer: "wip"    as LayerKey },
    utility:  { ax: 720, ay: 470, cx: 740, cy: 420, color: "#14b8a6", layer: "utility" as LayerKey },
    customer: { ax: 1040, ay: 290, cx: 1080, cy: 210, color: "#10b981", layer: "cust" as LayerKey },
  };

  const dur = `${3 / speed}s`;

  // build curved leader (svg coords) anchor → card
  const leader = (a: { ax: number; ay: number; cx: number; cy: number }) => {
    const mx = (a.ax + a.cx) / 2;
    return `M ${a.ax} ${a.ay} C ${mx} ${a.ay}, ${a.cx} ${(a.ay + a.cy) / 2}, ${a.cx} ${a.cy}`;
  };

  const heatColor = (id: string) => {
    let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100;
    if (h > 88) return "#ef4444"; if (h > 70) return "#f59e0b"; if (h > 40) return "#3b82f6"; return "#10b981";
  };

  const renderBank = (bank: any[], baseColor: string, dimmed = false) => bank.map((b) => {
    const c = view === "heatmap" ? heatColor(b.id) : baseColor;
    return <IsoBox key={b.id} x={b.x} y={b.y} w={b.w} h={b.h} depth={view === "2D" ? 0 : 14} color={c} highlight={!dimmed} />;
  });

  // overlay-position helper: svg coords → CSS %
  const pct = (svgX: number, svgY: number) => ({
    left: `${(svgX / VB_W) * 100}%`,
    top:  `${(svgY / VB_H) * 100}%`,
  });

  return (
    <div className="relative w-full h-[560px] rounded-lg overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,_#0e1830_0%,_#06070d_75%)] border border-white/[0.06]">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
        <defs>
          <pattern id="iso-grid" width="34" height="20" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
            <path d="M34 0 L0 0 0 20" fill="none" stroke="rgba(99,179,237,0.08)" strokeWidth="0.6" />
          </pattern>
          <linearGradient id="floor-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stopColor="#0b1426" />
            <stop offset="60%" stopColor="#070c18" />
            <stop offset="100%" stopColor="#04060c" />
          </linearGradient>
          <radialGradient id="hotspot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(244,63,94,0.55)" />
            <stop offset="100%" stopColor="rgba(244,63,94,0)" />
          </radialGradient>
          {/* per-anchor gradients for leader lines */}
          {Object.entries(ANCHORS).map(([k, a]) => (
            <linearGradient key={k} id={`grad-${k}`} x1={a.ax} y1={a.ay} x2={a.cx} y2={a.cy} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={a.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0.35" />
            </linearGradient>
          ))}
        </defs>

        <rect width={VB_W} height={VB_H} fill="url(#floor-fade)" />
        <rect width={VB_W} height={VB_H} fill="url(#iso-grid)" opacity="0.55" />

        {/* floor zone outlines */}
        <g stroke="rgba(148,163,184,0.10)" strokeWidth="0.8" strokeDasharray="3 5" fill="none">
          <rect x="50"  y="210" width="360" height="200" rx="6" />
          <rect x="820" y="210" width="330" height="200" rx="6" />
          <rect x="310" y="455" width="540" height="65"  rx="6" />
        </g>
        <text x="80"  y="200" fill="#94a3b8" fontSize="11" letterSpacing="3" fontWeight="600">FRONT END</text>
        <text x="855" y="200" fill="#94a3b8" fontSize="11" letterSpacing="3" fontWeight="600">ASSEMBLY &amp; TEST</text>
        <text x="540" y="540" fill="#94a3b8" fontSize="11" letterSpacing="3" fontWeight="600">BACK END</text>

        {/* equipment banks */}
        {renderBank(frontEnd, "#2563eb")}
        {renderBank(assembly, "#475569", true)}
        {renderBank(middleA,  "#1e293b", true)}
        {renderBank(middleB,  "#1e293b", true)}
        {renderBank(backEnd,  "#334155", true)}

        {/* central ETCH-217 hotspot */}
        <g onClick={() => onOpenDrawer("etch-217")} style={{ cursor: "pointer" }}>
          <circle cx={ANCHORS.etch217.ax} cy={ANCHORS.etch217.ay + 6} r="60" fill="url(#hotspot-glow)">
            <animate attributeName="r" values="50;72;50" dur={dur} repeatCount="indefinite" />
          </circle>
          <IsoBox x={ANCHORS.etch217.ax - 28} y={ANCHORS.etch217.ay - 10} w={56} h={36} depth={view === "2D" ? 0 : 22} color="#dc2626" glow="rgba(239,68,68,0.75)" highlight />
        </g>

        {/* leader lines: anchor → callout */}
        {Object.entries(ANCHORS).filter(([, a]) => layers.has(a.layer)).map(([k, a]) => (
          <g key={k}>
            <path d={leader(a)} stroke={`url(#grad-${k})`} strokeWidth="1.5" fill="none" opacity="0.55" />
            <path d={leader(a)} stroke={a.color} strokeWidth="1.8" fill="none" strokeDasharray="5 8" opacity="0.9">
              <animate attributeName="stroke-dashoffset" from="0" to="-130" dur={dur} repeatCount="indefinite" />
            </path>
            {/* anchor pip on equipment */}
            <circle cx={a.ax} cy={a.ay} r="3" fill={a.color}>
              <animate attributeName="opacity" values="1;0.3;1" dur={dur} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* time-scrub vertical sweep */}
        <line x1={70 + scrubHour * 14} y1="210" x2={70 + scrubHour * 14} y2="520"
          stroke="rgba(56,189,248,0.4)" strokeWidth="1" strokeDasharray="3 5" />
      </svg>

      {/* HTML callout overlay — positions match SVG anchors */}
      {layers.has("bottle") && (
        <CalloutCard {...pct(ANCHORS.etch217.cx, ANCHORS.etch217.cy)} tone="alert" title="ETCH-217" lines={["Maint. Tonight", "10:00 PM – 2:00 AM"]} arrow="down" onClick={() => onOpenDrawer("etch-217")} />
      )}
      {layers.has("util") && (<>
        <CalloutCard {...pct(ANCHORS.alt215.cx, ANCHORS.alt215.cy)} tone="amber" title="Alt Tool" lines={["ETCH-215", "Load: 68%"]} onClick={() => onOpenDrawer("alt-215")} />
        <CalloutCard {...pct(ANCHORS.alt220.cx, ANCHORS.alt220.cy)} tone="amber" title="Alt Tool" lines={["ETCH-220", "Load: 82%"]} onClick={() => onOpenDrawer("alt-220")} />
      </>)}
      {layers.has("wip") && (<>
        <CalloutCard {...pct(ANCHORS.wipAsm.cx, ANCHORS.wipAsm.cy)} tone="violet" title="WIP Increase" lines={["Assembly", "+18 lots"]} icon={ShieldCheck} onClick={() => onOpenDrawer("wip")} />
        <CalloutCard {...pct(ANCHORS.queue.cx, ANCHORS.queue.cy)} tone="fuchsia" title="Queue Build" lines={["CMP Area", "+12 lots"]} icon={Users} onClick={() => onOpenDrawer("queue")} />
      </>)}
      {layers.has("utility") && (
        <CalloutCard {...pct(ANCHORS.utility.cx, ANCHORS.utility.cy)} tone="sky" title="Utility Impact" lines={["Chilled Water", "+6% (1.2 hrs)"]} icon={Droplets} onClick={() => onOpenDrawer("util")} />
      )}
      {layers.has("cust") && (
        <CalloutCard {...pct(ANCHORS.customer.cx, ANCHORS.customer.cy)} tone="emerald" title="Customer Orders" lines={["On Track", "0 at risk"]} icon={CheckCircle2} onClick={() => onOpenDrawer("cust")} />
      )}

      {/* legend chip */}
      <div className="absolute top-3 left-3 text-[10px] text-slate-400 px-2 py-1 rounded-md bg-black/40 border border-white/[0.06] backdrop-blur">
        View: <span className="text-slate-200 font-medium">{view}</span> · Zoom: <span className="text-slate-200 font-medium">{Math.round(zoom * 100)}%</span> · Speed: <span className="text-slate-200 font-medium">{speed}x</span>
      </div>
    </div>
  );
}


function CalloutCard({ top, left, tone, title, lines, icon: Ico, onClick, arrow }: any) {
  const palette: Record<string, string> = {
    alert: "border-rose-500/40 bg-rose-500/[0.08] text-rose-100 shadow-[0_0_24px_-8px_rgba(244,63,94,0.7)]",
    amber: "border-amber-500/40 bg-amber-500/[0.08] text-amber-100",
    violet: "border-violet-500/40 bg-violet-500/[0.08] text-violet-100",
    sky: "border-sky-500/40 bg-sky-500/[0.08] text-sky-100",
    emerald: "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-100",
    fuchsia: "border-fuchsia-500/40 bg-fuchsia-500/[0.08] text-fuchsia-100",
  };
  const dotColor: Record<string, string> = {
    alert: "bg-rose-400", amber: "bg-amber-400", violet: "bg-violet-400",
    sky: "bg-sky-400", emerald: "bg-emerald-400", fuchsia: "bg-fuchsia-400",
  };
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} style={{ top, left, transform: "translate(-50%, -50%)" }}
      className={`absolute min-w-[150px] text-left rounded-md border backdrop-blur-md px-2.5 py-1.5 hover:scale-[1.03] transition-transform z-10 ${palette[tone]}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        {Ico ? <Ico className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${dotColor[tone]} animate-pulse`} />}
        <span className="text-[11px] font-semibold tracking-tight">{title}</span>
      </div>
      {lines.map((l: string, i: number) => (
        <div key={i} className={`text-[10.5px] ${i === 0 ? "font-medium" : "text-slate-300"}`}>{l}</div>
      ))}
      {arrow === "down" && (
        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-500/60" />
      )}
    </motion.button>
  );
}

/* ============ layers panel ============ */
const LAYER_DEFS: { key: LayerKey; label: string; color: string }[] = [
  { key: "flow", label: "Material Flow", color: "text-violet-300" },
  { key: "wip", label: "WIP / Queues", color: "text-fuchsia-300" },
  { key: "util", label: "Tool Utilization", color: "text-amber-300" },
  { key: "bottle", label: "Bottlenecks", color: "text-rose-300" },
  { key: "utility", label: "Utilities", color: "text-sky-300" },
  { key: "cust", label: "Customer Commitments", color: "text-emerald-300" },
];

function LayersPanel({ layers, toggle, allOn, allOff }: any) {
  return (
    <div className="space-y-3">
      <GlassCard className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12px] font-semibold text-white">Impact Layers</div>
          <div className="flex items-center gap-1">
            <button onClick={allOn} title="Show all" className="h-6 w-6 grid place-items-center rounded text-slate-400 hover:text-white hover:bg-white/[0.05]"><Eye className="h-3 w-3" /></button>
            <button onClick={allOff} title="Hide all" className="h-6 w-6 grid place-items-center rounded text-slate-400 hover:text-white hover:bg-white/[0.05]"><EyeOff className="h-3 w-3" /></button>
          </div>
        </div>
        <div className="space-y-1.5">
          {LAYER_DEFS.map((l) => (
            <label key={l.key} className="flex items-center gap-2 text-[11.5px] text-slate-200 hover:bg-white/[0.03] rounded px-1.5 py-1 cursor-pointer">
              <input type="checkbox" checked={layers.has(l.key)} onChange={() => toggle(l.key)} className="accent-sky-400 h-3 w-3" />
              <Activity className={`h-3 w-3 ${l.color}`} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-3">
        <div className="text-[12px] font-semibold text-white mb-2">Legend</div>
        <div className="space-y-1 text-[11px] text-slate-300">
          {[
            ["bg-violet-400", "Increase / Build"],
            ["bg-fuchsia-400", "Decrease / Reduce"],
            ["bg-slate-400", "No Change"],
            ["bg-amber-400", "At Risk"],
            ["bg-emerald-400", "Improvement"],
          ].map(([c, label]) => (
            <div key={label as string} className="flex items-center gap-2"><span className={`h-0.5 w-6 rounded ${c}`} />{label}</div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ============ right impact summary ============ */
const SUMMARY = [
  { label: "Material Flow", sub: "Minor re-route to ETCH-220", val: "Low", tone: "text-emerald-300", color: "#10b981", seed: 1 },
  { label: "WIP / Queues", sub: "Max queue increase in CMP Area\n+12 lots (6% ↑)", val: "Low", tone: "text-emerald-300", color: "#a78bfa", seed: 2 },
  { label: "Tool Utilization", sub: "Max alt tool load\n82% (ETCH-220)", val: "Medium", tone: "text-amber-300", color: "#f59e0b", seed: 3 },
  { label: "Bottlenecks", sub: "1 bottleneck period\n(vs 2 with Maintain Now)", val: "Low", tone: "text-emerald-300", color: "#f43f5e", seed: 4 },
  { label: "Utilities", sub: "Chilled Water\n+6% (1.2 hrs)", val: "Low", tone: "text-emerald-300", color: "#38bdf8", seed: 5 },
  { label: "Customer Commitments", sub: "All commitments\nOn Track", val: "Positive", tone: "text-emerald-300", color: "#10b981", seed: 6 },
];
function MiniSpark({ color, seed }: any) {
  const data = Array.from({ length: 18 }, (_, i) => {
    const s = ((seed * 9301 + i * 49297) % 233280) / 233280;
    return { i, y: 50 + (s - 0.5) * 30 + i * 0.6 };
  });
  return (
    <div className="h-6 w-16">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`mg-${color}-${seed}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.4} fill={`url(#mg-${color}-${seed})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function ImpactSummary({ onOpen, compareLabel }: any) {
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-3">Impact Summary <span className="text-slate-500 font-normal">(vs {compareLabel})</span></div>
      <div className="space-y-2">
        {SUMMARY.map((s) => (
          <button key={s.label} onClick={() => onOpen(s.label)}
            className="w-full text-left flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] rounded px-1">
            <MiniSpark color={s.color} seed={s.seed} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{s.label}</div>
              <div className="text-[10.5px] text-slate-400 leading-tight whitespace-pre-line">{s.sub}</div>
            </div>
            <span className={`text-[13px] font-bold ${s.tone}`}>{s.val}</span>
          </button>
        ))}
      </div>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3">View Detailed Impact Report →</button>
    </GlassCard>
  );
}

/* ============ bottom row ============ */
function ProductionScheduleChart({ scrubHour }: any) {
  const data = useMemo(() => ["May 23","May 24","May 25","May 26","May 27","May 28","May 29"].map((d, i) => {
    const seed = (i + 1) * 7919;
    return {
      d,
      OnPlan: 55 + ((seed >> 2) % 11),
      Change: 4 + ((seed >> 4) % 5),
      Risk: 1 + ((seed >> 6) % 4),
    };
  }), []);
  const scrubIdx = Math.min(6, Math.floor(scrubHour / 24));
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-1">Production Schedule Impact <span className="text-slate-500 font-normal">(7 Days)</span></div>
      <div className="flex items-center gap-4 text-[10.5px] text-slate-400 mb-1">
        <span>Wafers</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-400" /> On Plan</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-sky-400" /> Change</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-400" /> Risk</span>
        </span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer>
          <BarChart data={data} stackOffset="sign" margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="d" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}K`} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="OnPlan" stackId="a" fill="#10b981" />
            <Bar dataKey="Change" stackId="a" fill="#38bdf8" />
            <Bar dataKey="Risk" stackId="a" fill="#f43f5e" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-slate-500 mt-1">Scrub cursor on day <span className="text-sky-300 tabular-nums">{data[scrubIdx].d}</span></div>
    </GlassCard>
  );
}
const AREAS = [
  { area: "CMP Area Queue", impact: "+12 lots", duration: "6 hrs", sev: "Low", tone: "bg-violet-400" },
  { area: "ETCH-220 (Alt Tool)", impact: "82% load", duration: "4 hrs", sev: "Medium", tone: "bg-amber-400" },
  { area: "Assembly WIP", impact: "+18 lots", duration: "8 hrs", sev: "Low", tone: "bg-violet-400" },
  { area: "Chilled Water", impact: "+6%", duration: "1.2 hrs", sev: "Low", tone: "bg-violet-400" },
  { area: "Back End Test", impact: "+5 lots", duration: "2 hrs", sev: "Low", tone: "bg-violet-400" },
];
function AreasTable({ onOpen, query }: any) {
  const rows = useMemo(() => AREAS.filter((a) => a.area.toLowerCase().includes((query || "").toLowerCase())), [query]);
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-3">Top Affected Areas {query && <span className="text-slate-500 font-normal">· filter "{query}"</span>}</div>
      <table className="w-full text-[11.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-500 text-left">
            <th className="pb-2">Area</th><th className="pb-2">Impact</th><th className="pb-2">Duration</th><th className="pb-2">Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.area} onClick={() => onOpen(a.area)} className="border-t border-white/[0.04] hover:bg-white/[0.03] cursor-pointer">
              <td className="py-2 text-slate-200 font-medium">{a.area}</td>
              <td className="py-2 text-slate-300 tabular-nums">{a.impact}</td>
              <td className="py-2 text-slate-300 tabular-nums">{a.duration}</td>
              <td className="py-2"><span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${a.tone}`} /><span className="text-slate-200">{a.sev}</span></span></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} className="py-3 text-center text-slate-500 text-[11px]">No areas match filter</td></tr>}
        </tbody>
      </table>
    </GlassCard>
  );
}
function CustomerDonut({ s }: { s: Scenario }) {
  const total = useCountUp(s.custOnTrack + s.custAtRisk + s.custLate);
  const totalNum = s.custOnTrack + s.custAtRisk + s.custLate;
  const C = 2 * Math.PI * 48;
  const okFrac = s.custOnTrack / totalNum;
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-2">Customer Commitment Impact</div>
      <div className="flex items-center gap-4">
        <div className="relative h-[160px] w-[160px]">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="48" stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
            <circle cx="60" cy="60" r="48" stroke="#10b981" strokeWidth="14" fill="none"
              strokeDasharray={`${C * okFrac} ${C}`} strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.6))" }} />
            <circle cx="60" cy="60" r="48" stroke="#f59e0b" strokeWidth="14" fill="none"
              strokeDasharray={`${C * (s.custAtRisk / totalNum)} ${C}`}
              strokeDashoffset={-C * okFrac} />
            <circle cx="60" cy="60" r="48" stroke="#f43f5e" strokeWidth="14" fill="none"
              strokeDasharray={`${C * (s.custLate / totalNum)} ${C}`}
              strokeDashoffset={-C * (okFrac + s.custAtRisk / totalNum)} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[28px] font-bold text-white tabular-nums">{total.toFixed(0)}</div>
              <div className="text-[10px] text-slate-400">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-[11.5px]">
          <Row dot="bg-emerald-400" label="On Track" v={s.custOnTrack} pct={`(${Math.round(okFrac * 100)}%)`} />
          <Row dot="bg-amber-400" label="At Risk" v={s.custAtRisk} pct={`(${Math.round((s.custAtRisk/totalNum)*100)}%)`} />
          <Row dot="bg-rose-400" label="Late" v={s.custLate} pct={`(${Math.round((s.custLate/totalNum)*100)}%)`} />
        </div>
      </div>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-2">View Orders →</button>
    </GlassCard>
  );
}
function Row({ dot, label, v, pct }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-slate-200 flex-1">{label}</span>
      <span className="text-white font-semibold tabular-nums">{v}</span>
      <span className="text-slate-500 tabular-nums">{pct}</span>
    </div>
  );
}
function KeyTakeaway({ s }: { s: Scenario }) {
  const tone = s.overall === "Low" ? "emerald" : s.overall === "Medium" ? "amber" : "rose";
  const cls: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  };
  return (
    <GlassCard className="p-4">
      <div className="text-[12px] font-semibold text-white mb-2">Key Takeaway</div>
      <div className={`rounded-md border px-3 py-2 flex items-center gap-2 mb-3 ${cls[tone]}`}>
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-[12.5px] font-semibold">{s.overall} Overall Impact</span>
      </div>
      <p className="text-[12px] text-slate-300 leading-snug">Scenario <span className="text-white font-medium">{s.label}</span> projects {s.prodDelta} wafers ({s.prodPct}%) and ${s.rev.toFixed(2)}M revenue exposure.</p>
      <p className="text-[12px] text-slate-300 leading-snug mt-2">{s.custAtRisk === 0 ? "All customer commitments remain on track." : `${s.custAtRisk} commitments at risk · ${s.custLate} late.`}</p>
      <p className="text-[12px] text-slate-300 leading-snug mt-2">RUL extension after PM: <span className="text-white">+{s.rulExt} days</span>.</p>
      <button className="text-[11px] text-sky-300 hover:text-sky-200 mt-3">View AI Recommendation →</button>
    </GlassCard>
  );
}

/* ============ drawer ============ */
function IntelligenceDrawer({ open, id, onClose }: any) {
  const [tab, setTab] = useState("Executive Summary");
  const tabs = ["Executive Summary", "Operational", "Engineering", "AI Reasoning", "Telemetry", "Historical"];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <motion.aside initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[460px] bg-[#0a0f1c] border-l border-white/[0.08] z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.08]">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Impact Drawer</div>
                <div className="text-[13px] font-semibold text-white">{id ?? "Detail"}</div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-white/[0.06] grid place-items-center"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="flex items-center gap-1 px-3 border-b border-white/[0.06] overflow-x-auto">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-2.5 py-2 text-[11px] whitespace-nowrap border-b-2 transition ${
                    tab === t ? "text-sky-300 border-sky-400" : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 text-[12px] text-slate-300 space-y-3">
              {tab === "Executive Summary" && (
                <>
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 p-3">
                    <div className="flex items-center gap-2 text-emerald-300 text-[12px] font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Low factory-wide impact
                    </div>
                    <p className="mt-1 text-slate-200">Simulation confirms minor re-route to ETCH-220 absorbs queued lots; revenue and customer commitments unaffected.</p>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li>Production: -320 wafers (-0.6%)</li>
                    <li>Yield: -0.02% (-2.1K good die)</li>
                    <li>Revenue exposure: -$0.24M</li>
                    <li>RUL extension after PM: +62 days</li>
                  </ul>
                </>
              )}
              {tab === "Operational" && (
                <ul className="space-y-2 list-disc pl-4">
                  <li>AMHS reroutes 12 FOUPs to ETCH-220 / ETCH-215</li>
                  <li>CMP queue peak +12 lots, drains within 6h</li>
                  <li>Assembly WIP +18 lots, buffered</li>
                  <li>Shift B fully staffed (2 senior techs)</li>
                </ul>
              )}
              {tab === "Engineering" && (
                <ul className="space-y-2 list-disc pl-4">
                  <li>Discrete-event sim · 10K Monte Carlo trials</li>
                  <li>FactoryWorks MES + AMHS routing in scope</li>
                  <li>SECS/GEM event stream verified healthy</li>
                  <li>SPC: no Western Electric violations forecast</li>
                  <li>APC run-to-run controllers in nominal range</li>
                </ul>
              )}
              {tab === "AI Reasoning" && (
                <p>Optimization maximizes expected business value with customer-commitment and engineering-freeze constraints. Counterfactual: deferring PM 7 days flips bottleneck count 1 → 2 and raises revenue exposure 5×.</p>
              )}
              {tab === "Telemetry" && (
                <ul className="space-y-1.5">
                  <li>Chamber Pressure σ — 0.084 mT</li>
                  <li>He Leak — 1.8e-6 sccs</li>
                  <li>RF Reflected — 4.2% variance</li>
                </ul>
              )}
              {tab === "Historical" && (
                <ul className="space-y-1.5">
                  <li>ETCH-203 · 2026-11 — analogous PM tonight window, prevented 18h unplanned downtime</li>
                  <li>ETCH-211 · 2026-02 — deferred PM, caused 22h unplanned downtime</li>
                </ul>
              )}
            </div>
            <div className="border-t border-white/[0.08] p-3 flex items-center gap-2">
              <button className="flex-1 h-9 rounded-md bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-[12px] font-semibold">Approve Maintenance</button>
              <button className="h-9 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">Escalate</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============ command palette ============ */
function CommandPalette({ open, onClose, actions }: any) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); else setQ(""); }, [open]);
  const filtered = useMemo(() => actions.filter((a: any) => a.label.toLowerCase().includes(q.toLowerCase())), [q, actions]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm grid place-items-start pt-[14vh]">
          <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[560px] max-w-[92vw] rounded-xl border border-white/[0.08] bg-[#0c1024]/95 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 h-11 border-b border-white/[0.06]">
              <Search className="h-4 w-4 text-slate-400" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to area or run an action…"
                className="flex-1 bg-transparent outline-none text-[13px] text-white placeholder:text-slate-500" />
              <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">Esc</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto py-1">
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-[12px] text-slate-500">No matches</div>}
              {filtered.map((a: any) => (
                <button key={a.label} onClick={() => { a.run(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/[0.05] text-left">
                  <a.icon className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-[12.5px] text-slate-200 flex-1">{a.label}</span>
                  {a.hint && <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">{a.hint}</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ page ============ */
export default function FactoryImpactSimulator() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [view, setView] = useState<"3D" | "2D" | "Flow" | "Heatmap">("3D");
  const [zoom, setZoom] = useState(1);
  const [scenario] = useState<keyof typeof SCENARIOS>("tonight");
  const [compareTo, setCompareTo] = useState<keyof typeof SCENARIOS>("now");
  const [scrubHour, setScrubHour] = useState(0); // 0..168 (7 days)
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(["flow", "wip", "util", "bottle", "utility", "cust"]));
  const [drawer, setDrawer] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hkOpen, setHkOpen] = useState(false);
  const [areaQuery, setAreaQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [rerunning, setRerunning] = useState(false);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const openDrawer = (id: string) => setDrawer({ open: true, id });
  const scenarioObj = SCENARIOS[scenario];
  const compareObj = SCENARIOS[compareTo];

  // scrubber tick
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setScrubHour((h) => (h + 1) % 169), Math.max(120, 600 / speed));
    return () => clearInterval(t);
  }, [playing, speed]);

  const toggleLayer = (k: LayerKey) => setLayers((prev) => {
    const next = new Set(prev); next.has(k) ? next.delete(k) : next.add(k); return next;
  });
  const allOn = () => setLayers(new Set(LAYER_DEFS.map((l) => l.key)));
  const allOff = () => setLayers(new Set());

  const rerun = () => { setRerunning(true); setTimeout(() => { setRerunning(false); flash("Simulation refreshed"); }, 1200); };

  const exportCSV = useCallback(() => {
    const header = ["Section", "Metric", "Value"];
    const rows: any[] = [
      ["Scenario", "Selected", scenarioObj.label],
      ["Scenario", "Compare To", compareObj.label],
      ["KPI", "Production Δ", `${scenarioObj.prodDelta} wafers (${scenarioObj.prodPct}%)`],
      ["KPI", "Yield Δ", `${scenarioObj.yieldPct}%`],
      ["KPI", "Bottlenecks", scenarioObj.bottlenecks],
      ["KPI", "Customer On Track", scenarioObj.custOnTrack],
      ["KPI", "Customer At Risk", scenarioObj.custAtRisk],
      ["KPI", "Revenue Exposure ($M)", scenarioObj.rev],
      ["KPI", "RUL Extension (days)", scenarioObj.rulExt],
      ...AREAS.map((a) => ["Area", a.area, `${a.impact} · ${a.duration} · ${a.sev}`]),
    ];
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "factory-impact.csv"; a.click();
    URL.revokeObjectURL(url);
    flash("Exported CSV");
  }, [scenarioObj, compareObj]);

  // hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setHkOpen(false); setDrawer({ open: false, id: null }); return; }
      if (e.key === "?") { setHkOpen((v) => !v); return; }
      if (e.key.toLowerCase() === "p") { setPlaying((v) => !v); return; }
      if (e.key.toLowerCase() === "s") { setSpeed((s) => (s === 4 ? 0.5 : s * 2)); return; }
      if (e.key.toLowerCase() === "r") { rerun(); return; }
      if (e.key.toLowerCase() === "e") { exportCSV(); return; }
      if (e.key === "+" || e.key === "=") { setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2))); return; }
      if (e.key === "-" || e.key === "_") { setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2))); return; }
      if (["1","2","3","4"].includes(e.key)) { setView((["3D","2D","Flow","Heatmap"] as const)[+e.key - 1]); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exportCSV]);

  const paletteActions = [
    { label: "Play / Pause simulation", icon: playing ? Pause : Play, hint: "P", run: () => setPlaying((v) => !v) },
    { label: "Cycle speed", icon: SkipForward, hint: "S", run: () => setSpeed((s) => (s === 4 ? 0.5 : s * 2)) },
    { label: "Re-run simulation", icon: RefreshCw, hint: "R", run: rerun },
    { label: "Export CSV report", icon: Download, hint: "E", run: exportCSV },
    { label: "Zoom in", icon: Plus, hint: "+", run: () => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2))) },
    { label: "Zoom out", icon: Minus, hint: "-", run: () => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2))) },
    { label: "Reset view", icon: RefreshCw, run: () => { setZoom(1); setView("3D"); allOn(); flash("View reset"); } },
    ...(["3D","2D","Flow","Heatmap"] as const).map((v, i) => ({ label: `View · ${v}`, icon: LayersIcon, hint: String(i+1), run: () => setView(v) })),
    { label: "Show all layers", icon: Eye, run: allOn },
    { label: "Hide all layers", icon: EyeOff, run: allOff },
    ...AREAS.map((a) => ({ label: `Open · ${a.area}`, icon: AlertTriangle, run: () => openDrawer(a.area) })),
    { label: "Open ETCH-217 chamber drawer", icon: Cpu, run: () => openDrawer("etch-217") },
  ];

  // KPI deltas vs compareObj
  const dlt = (a: number, b: number, unit = "") => `${(a - b > 0 ? "+" : "")}${(a - b).toFixed(unit === "%" ? 2 : 0)}${unit}`;

  return (
    <AppShell>
      <div className="min-h-screen bg-[#06080f] text-slate-200">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.05),_transparent_55%)]" />
        </div>

        <AppHeader onOpenPalette={() => setPaletteOpen(true)} />

        <div className="flex">
          <SeadRail />
          <main className="flex-1 min-w-0 px-5 py-4 space-y-4">
            <AssetStrip playing={playing} setPlaying={setPlaying} speed={speed} setSpeed={setSpeed}
              compareTo={compareTo} setCompareTo={setCompareTo} onRerun={rerun} scenarioObj={scenarioObj} />

            {/* sticky action bar */}
            <div className="sticky top-2 z-30">
              <GlassCard className="px-3 py-2 flex items-center gap-2 flex-wrap">
                <button onClick={rerun} disabled={rerunning}
                  className="h-8 px-3 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-200 text-[11.5px] font-medium flex items-center gap-1.5 hover:bg-sky-500/25 disabled:opacity-60">
                  <motion.span animate={{ rotate: rerunning ? 360 : 0 }} transition={{ repeat: rerunning ? Infinity : 0, duration: 0.9, ease: "linear" }}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </motion.span>
                  {rerunning ? "Re-running…" : "Re-run"}
                </button>
                <button onClick={exportCSV}
                  className="h-8 px-3 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-200 text-[11.5px] flex items-center gap-1.5 hover:bg-white/[0.08]">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <div className="h-6 w-px bg-white/[0.08]" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1">View</span>
                  {(["3D","2D","Flow","Heatmap"] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)}
                      className={`h-7 px-2 rounded-md text-[11px] border transition ${view === v ? "bg-sky-500/15 border-sky-400/30 text-sky-200" : "bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]"}`}>{v}</button>
                  ))}
                </div>
                <div className="h-6 w-px bg-white/[0.08]" />
                <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))}
                  className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.08]"><Minus className="h-3 w-3" /></button>
                <span className="text-[11px] text-slate-300 tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
                  className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.08]"><Plus className="h-3 w-3" /></button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <span className="text-slate-400">Hour</span>
                  <input type="range" min={0} max={168} value={scrubHour} onChange={(e) => setScrubHour(+e.target.value)}
                    className="w-48 accent-sky-400 h-1" />
                  <span className="tabular-nums text-slate-200 w-12">{scrubHour}h</span>
                  <button onClick={() => setScrubHour(0)} className="h-7 w-7 rounded-md bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.08]"><SkipBack className="h-3 w-3" /></button>
                </div>
                <button onClick={() => setHkOpen((v) => !v)} title="Shortcuts"
                  className="h-8 w-8 rounded-md bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:bg-white/[0.06]">
                  <Keyboard className="h-3.5 w-3.5" />
                </button>
              </GlassCard>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <GlassCard className="col-span-12 xl:col-span-9 p-4">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="text-[14px] font-semibold text-white">Factory Impact Overview <span className="text-slate-500 text-[11px] font-normal ml-1">ⓘ</span></div>
                    <div className="text-[11px] text-slate-400">Visualizing ripple effects across production, materials, tools and resources · vs <span className="text-slate-300">{compareObj.label}</span></div>
                  </div>
                  <div className="flex items-center gap-5 flex-wrap">
                    <TwinKpi icon={TrendingDown} label="Total Production Impact" value={`${scenarioObj.prodDelta} wafers`} sub={`(${scenarioObj.prodPct}%)`} color="border-rose-500/40 bg-rose-500/[0.08] text-rose-300" delta={dlt(scenarioObj.prodDelta, compareObj.prodDelta)} />
                    <TwinKpi icon={ShieldCheck} label="Total Yield Impact" value={`${scenarioObj.yieldPct}%`} sub={`(${(scenarioObj.yieldPct*1000).toFixed(1)}K good die)`} color="border-sky-500/40 bg-sky-500/[0.08] text-sky-300" delta={dlt(scenarioObj.yieldPct, compareObj.yieldPct, "%")} />
                    <TwinKpi icon={AlertTriangle} label="Critical Bottlenecks" value={scenarioObj.bottlenecks} sub={`(vs ${compareObj.bottlenecks} with ${compareObj.label})`} color="border-amber-500/40 bg-amber-500/[0.08] text-amber-300" />
                    <TwinKpi icon={Users} label="Customer Commitments" value={scenarioObj.custAtRisk === 0 ? "On Track" : `${scenarioObj.custAtRisk} at risk`} sub={scenarioObj.custLate > 0 ? `${scenarioObj.custLate} late` : "No late orders"} color="border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300" />
                    <TwinKpi icon={Sparkles} label="Overall Factory Impact" value={scenarioObj.overall} color="border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-300" />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-3 xl:col-span-2">
                    <LayersPanel layers={layers} toggle={toggleLayer} allOn={allOn} allOff={allOff} />
                  </div>
                  <div className="col-span-12 md:col-span-9 xl:col-span-10">
                    <FactoryTwin onOpenDrawer={openDrawer} layers={layers} view={view} zoom={zoom} speed={speed} scrubHour={scrubHour} />

                    {/* live event ticker */}
                    <div className="mt-2 h-7 overflow-hidden rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center px-3 text-[11px] text-slate-300">
                      <span className="text-emerald-300 mr-3 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE</span>
                      <div className="overflow-hidden whitespace-nowrap flex-1">
                        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28 / speed, repeat: Infinity, ease: "linear" }} className="inline-block whitespace-nowrap">
                          <span className="mx-4">10:24 · ETCH-220 load 78% → 82%</span>
                          <span className="mx-4">10:21 · CMP queue +3 lots</span>
                          <span className="mx-4">10:19 · Chilled water demand +1.4%</span>
                          <span className="mx-4">10:14 · AMHS rerouted FOUP 8821 to ETCH-215</span>
                          <span className="mx-4">10:08 · No customer commitments at risk</span>
                          <span className="mx-4">10:24 · ETCH-220 load 78% → 82%</span>
                          <span className="mx-4">10:21 · CMP queue +3 lots</span>
                          <span className="mx-4">10:19 · Chilled water demand +1.4%</span>
                          <span className="mx-4">10:14 · AMHS rerouted FOUP 8821 to ETCH-215</span>
                          <span className="mx-4">10:08 · No customer commitments at risk</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="col-span-12 xl:col-span-3">
                <ImpactSummary onOpen={openDrawer} compareLabel={compareObj.label} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 lg:col-span-4"><ProductionScheduleChart scrubHour={scrubHour} /></div>
              <div className="col-span-12 lg:col-span-3">
                <div className="mb-2 flex items-center gap-2">
                  <Search className="h-3 w-3 text-slate-500" />
                  <input value={areaQuery} onChange={(e) => setAreaQuery(e.target.value)} placeholder="Filter areas…"
                    className="flex-1 h-7 px-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-200 outline-none focus:border-sky-400/30" />
                </div>
                <AreasTable onOpen={openDrawer} query={areaQuery} />
              </div>
              <div className="col-span-12 lg:col-span-3"><CustomerDonut s={scenarioObj} /></div>
              <div className="col-span-12 lg:col-span-2"><KeyTakeaway s={scenarioObj} /></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Digital Twin streaming · MES · AMHS · FactoryWorks · APC · SECS/GEM · EDA
              </span>
              <span>Texas Instruments · DFW Fab · Factory Impact Simulator v1.1</span>
            </div>
          </main>
        </div>

        <IntelligenceDrawer open={drawer.open} id={drawer.id} onClose={() => setDrawer({ open: false, id: null })} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />

        {/* hotkey panel */}
        <AnimatePresence>
          {hkOpen && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="fixed bottom-4 right-4 z-40 w-[280px] rounded-xl border border-white/[0.08] bg-[#0c1024]/95 backdrop-blur-xl p-3 shadow-2xl">
              <div className="text-[12px] font-semibold text-white mb-2 flex items-center gap-1.5"><Keyboard className="h-3.5 w-3.5" /> Shortcuts</div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {[
                  ["⌘/Ctrl K", "Command palette"],
                  ["P", "Play / pause"],
                  ["S", "Cycle speed"],
                  ["R", "Re-run simulation"],
                  ["E", "Export CSV"],
                  ["+ / -", "Zoom in / out"],
                  ["1-4", "View · 3D / 2D / Flow / Heatmap"],
                  ["?", "Toggle this panel"],
                  ["Esc", "Close overlays"],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between">
                    <span className="text-slate-400">{v}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-300">{k}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#0c1024]/95 border border-white/[0.08] text-[12px] text-slate-100 shadow-2xl flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
