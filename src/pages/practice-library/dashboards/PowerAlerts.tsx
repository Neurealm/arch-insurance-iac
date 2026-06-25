import { Link } from "react-router-dom";
import {
  Zap, Bell, RefreshCw, Download, Activity, Map as MapIcon, BarChart3, TrendingUp,
  Gauge, Settings as SettingsIcon, Battery, Power, Cpu, Layers, FileText, PieChart,
  Plug, ChevronLeft, ChevronsUpDown, Calendar, Filter, AlertTriangle, Info,
  Search, X, MoreHorizontal, CheckCircle2, StickyNote, ChevronRight,
  CircleDot, ShieldAlert,
  Brain,
} from "lucide-react";

/* ---------- side rail (matches Power Admin Console / Power Map) ---------- */
const navGroups: { title: string; items: { label: string; icon: any; to?: string; active?: boolean; badge?: number }[] }[] = [
  { title: "Overview", items: [
    { label: "Power Overview", icon: Zap, to: "/practice-library/infrastructure-hybrid-platform/power-admin-console" },
    { label: "Power Map", icon: MapIcon, to: "/practice-library/infrastructure-hybrid-platform/power-map" },
    { label: "Alerts", icon: Bell, badge: 3, active: true },
  ]},
  { title: "Monitoring", items: [
    { label: "Real-time Monitoring", icon: Activity, to: "/practice-library/infrastructure-hybrid-platform/real-time-monitoring" },
    { label: "Historical Analysis", icon: BarChart3, to: "/practice-library/infrastructure-hybrid-platform/historical-analysis" },
    { label: "Forecasting", icon: TrendingUp },
  ]},
  { title: "Management", items: [
    { label: "Capacity Management", icon: Gauge },
    { label: "Power Capping", icon: CircleDot },
    { label: "Workload Optimization", icon: Cpu },
    { label: "Policy Management", icon: Layers },
  ]},
  { title: "Infrastructure", items: [
    { label: "PDUs & UPS", icon: Battery },
    { label: "Generators", icon: Power },
    { label: "Switchgear", icon: Plug },
    { label: "Distribution", icon: Layers },
  ]},
  { title: "Analytics", items: [
    { label: "AI Optimization", icon: Brain, to: "/practice-library/infrastructure-hybrid-platform/ai-optimization" },
  ]},
  { title: "Reporting", items: [
    { label: "Reports", icon: FileText },
    { label: "Cost Analysis", icon: PieChart },
  ]},
  { title: "Settings", items: [
    { label: "Integrations", icon: SettingsIcon },
    { label: "Power Policies", icon: ShieldAlert },
  ]},
];

function Rail() {
  return (
    <aside className="w-60 shrink-0 bg-[#0b1220] border-r border-slate-800 text-slate-300 flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-slate-800">
        <div className="h-7 w-7 rounded-full border-2 border-blue-500 grid place-items-center text-blue-400 text-xs font-bold">R</div>
        <div className="font-semibold text-white">RunOps</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 text-xs">
        {navGroups.map((g) => (
          <div key={g.title} className="mb-2">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-slate-500">{g.title}</div>
            {g.items.map((it) => {
              const Icon = it.icon;
              const inner = (
                <div className={`mx-2 px-3 py-2 rounded flex items-center gap-2 cursor-pointer ${it.active ? "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/40" : "hover:bg-slate-800/60"}`}>
                  <Icon className="h-3.5 w-3.5" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && <span className="text-[10px] bg-rose-500 text-white rounded-full px-1.5">{it.badge}</span>}
                </div>
              );
              return it.to ? <Link key={it.label} to={it.to}>{inner}</Link> : <div key={it.label}>{inner}</div>;
            })}
          </div>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
        <ChevronLeft className="h-3.5 w-3.5" /> Collapse
      </div>
    </aside>
  );
}

/* ---------- KPI tiles ---------- */
function StatTile({ icon: Icon, iconClass, label, labelClass, value, subLabel, ackLabel, dim }: any) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md grid place-items-center ${iconClass}`}><Icon className="h-5 w-5" /></div>
      <div className="flex-1">
        <div className={`text-xs font-medium ${labelClass}`}>{label}</div>
        <div className="text-3xl font-bold text-white tabular-nums leading-tight">{value}</div>
        <div className="text-[11px] text-slate-400">{subLabel}</div>
      </div>
      <div className="text-right text-[11px] text-slate-400 self-stretch flex flex-col justify-end">
        {dim && <div className="text-slate-500">{dim}</div>}
        {ackLabel && <div>{ackLabel}</div>}
      </div>
    </div>
  );
}

/* ---------- alert badges ---------- */
function SeverityBadge({ s }: { s: "Critical" | "Warning" | "Informational" }) {
  const map = {
    Critical: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    Warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    Informational: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  } as const;
  return <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${map[s]}`}>{s}</span>;
}
function StatusBadge({ s }: { s: "Open" | "Acknowledged" }) {
  const map = {
    Open: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    Acknowledged: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  } as const;
  return <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${map[s]}`}>{s}</span>;
}

/* ---------- data ---------- */
type Sev = "Critical" | "Warning" | "Informational";
type St = "Open" | "Acknowledged";
const alerts: {
  sev: Sev; title: string; sub: string; titleColor: string;
  source: string; sourceSub: string; resource: string; resourceSub: string;
  status: St; ago: string; ts: string; ackBy?: string; ackTs?: string;
}[] = [
  { sev: "Critical", title: "PDU-2A Overload Warning", sub: "Load: 95% (28.5 kW / 30 kW)", titleColor: "text-rose-400", source: "PDU-2A", sourceSub: "Rack Row A", resource: "PDU", resourceSub: "192.168.1.22", status: "Open", ago: "2m ago", ts: "May 20, 2024 10:24 AM" },
  { sev: "Critical", title: "UPS-1 Runtime Below Threshold", sub: "Runtime: 4.2 min (Threshold: 5 min)", titleColor: "text-rose-400", source: "UPS-1", sourceSub: "Electrical Room", resource: "UPS", resourceSub: "192.168.1.10", status: "Open", ago: "7m ago", ts: "May 20, 2024 10:19 AM" },
  { sev: "Warning", title: "High PUE Detected", sub: "PUE: 1.62 (Threshold: 1.50)", titleColor: "text-amber-400", source: "Data Hall A", sourceSub: "", resource: "PUE Sensor", resourceSub: "—", status: "Open", ago: "15m ago", ts: "May 20, 2024 10:11 AM" },
  { sev: "Warning", title: "CRAC-2 Supply Air Temp High", sub: "Temp: 29.1°C (Threshold: 27°C)", titleColor: "text-amber-400", source: "CRAC-2", sourceSub: "Data Hall A", resource: "CRAC", resourceSub: "192.168.1.45", status: "Open", ago: "18m ago", ts: "May 20, 2024 10:08 AM" },
  { sev: "Warning", title: "Generator-1 Fuel Level Low", sub: "Fuel Level: 22% (Threshold: 25%)", titleColor: "text-amber-400", source: "Generator-1", sourceSub: "Generator Yard", resource: "Generator", resourceSub: "192.168.1.60", status: "Acknowledged", ago: "25m ago", ts: "May 20, 2024 10:01 AM", ackBy: "john.doe", ackTs: "10:05 AM" },
  { sev: "Informational", title: "PDU-3B Load Normalized", sub: "Load: 72% (21.6 kW / 30 kW)", titleColor: "text-sky-300", source: "PDU-3B", sourceSub: "Rack Row B", resource: "PDU", resourceSub: "192.168.1.32", status: "Open", ago: "32m ago", ts: "May 20, 2024 09:54 AM" },
  { sev: "Informational", title: "Utility Power Restored", sub: "Source: Dominion Energy", titleColor: "text-sky-300", source: "Utility Feed A", sourceSub: "Main Switchgear", resource: "Utility", resourceSub: "—", status: "Acknowledged", ago: "45m ago", ts: "May 20, 2024 09:41 AM", ackBy: "sarah.liu", ackTs: "09:42 AM" },
  { sev: "Informational", title: "Battery Test Completed", sub: "Result: Passed", titleColor: "text-slate-200", source: "UPS-2", sourceSub: "Electrical Room", resource: "UPS", resourceSub: "192.168.1.11", status: "Acknowledged", ago: "1h 2m ago", ts: "May 20, 2024 09:24 AM", ackBy: "system", ackTs: "09:24 AM" },
];

/* ---------- detail trend mini chart ---------- */
function TrendChart() {
  const data = [62, 64, 63, 65, 66, 64, 65, 67, 68, 70, 72, 71, 73, 75, 77, 80, 82, 85, 88, 90, 92, 93, 94, 95];
  const w = 280, h = 130, pad = 22;
  const max = 100;
  const xStep = (w - pad - 8) / (data.length - 1);
  const y = (v: number) => 10 + (h - 30) * (1 - v / max);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${pad + i * xStep},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 20, 40, 60, 80, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - 4} y1={y(g)} y2={y(g)} stroke="#1f2937" strokeWidth={0.5} />
          <text x={2} y={y(g) + 3} fontSize={8} fill="#64748b">{g}%</text>
        </g>
      ))}
      <line x1={pad} x2={w - 4} y1={y(90)} y2={y(90)} stroke="#ef4444" strokeWidth={0.6} strokeDasharray="3 3" />
      <path d={d} fill="none" stroke="#ef4444" strokeWidth={1.6} />
      <circle cx={pad + (data.length - 1) * xStep} cy={y(95)} r={3} fill="#ef4444" />
      <text x={w - 24} y={y(95) - 6} fontSize={9} fill="#fca5a5" fontWeight={700}>95%</text>
      <text x={pad} y={h - 4} fontSize={8} fill="#64748b">09:30</text>
      <text x={pad + 60} y={h - 4} fontSize={8} fill="#64748b">09:45</text>
      <text x={pad + 120} y={h - 4} fontSize={8} fill="#64748b">10:00</text>
      <text x={pad + 180} y={h - 4} fontSize={8} fill="#64748b">10:15</text>
      <text x={pad + 230} y={h - 4} fontSize={8} fill="#64748b">10:30</text>
      <text x={4} y={14} fontSize={9} fill="#94a3b8">% Load</text>
    </svg>
  );
}

/* ---------- page ---------- */
export default function PowerAlerts() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-200 flex">
      <Rail />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-slate-800 flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Alerts</h1>
            <p className="text-xs text-slate-400">Real-time alerts and notifications for data center power infrastructure</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <button className="relative h-8 w-8 grid place-items-center border border-blue-500/60 bg-blue-600/15 rounded">
              <Bell className="h-4 w-4 text-blue-300" />
              <span className="absolute -top-1 -right-1 text-[10px] bg-rose-500 text-white rounded-full px-1">3</span>
            </button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200">DC1 - Ashburn <ChevronsUpDown className="h-3 w-3" /></button>
            <button className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200"><Calendar className="h-3 w-3" /> Last 15 minutes</button>
            <button className="h-8 w-8 grid place-items-center border border-slate-700 rounded"><RefreshCw className="h-4 w-4 text-slate-300" /></button>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
          </div>
        </header>

        <div className="p-6 space-y-4">
          {/* KPI strip */}
          <div className="grid grid-cols-5 gap-3">
            <StatTile icon={AlertTriangle} iconClass="bg-rose-500/15 text-rose-400" label="Critical" labelClass="text-rose-300" value="2" subLabel="Open" ackLabel="2 Acknowledged" />
            <StatTile icon={AlertTriangle} iconClass="bg-amber-500/15 text-amber-400" label="Warning" labelClass="text-amber-300" value="7" subLabel="Open" ackLabel="3 Acknowledged" />
            <StatTile icon={Info} iconClass="bg-sky-500/15 text-sky-400" label="Informational" labelClass="text-sky-300" value="12" subLabel="Open" ackLabel="5 Acknowledged" />
            <StatTile icon={Bell} iconClass="bg-slate-700/40 text-slate-300" label="Total Alerts" labelClass="text-slate-300" value="21" subLabel="Open" ackLabel="10 Acknowledged" dim="18 Acknowledged" />
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">MTTA</div>
                <div className="text-2xl font-bold text-white tabular-nums">8m 32s</div>
                <div className="text-[11px] text-slate-500">Past 7 days</div>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <div className="text-xs text-slate-400">MTTR</div>
                <div className="text-2xl font-bold text-white tabular-nums">34m 18s</div>
                <div className="text-[11px] text-slate-500">Past 7 days</div>
              </div>
            </div>
          </div>

          {/* Table + Detail */}
          <div className="grid grid-cols-[1fr_360px] gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40">
              {/* tabs */}
              <div className="flex items-center gap-6 px-4 pt-3 border-b border-slate-800 text-xs">
                <button className="pb-2 text-blue-300 border-b-2 border-blue-400 font-semibold">All Alerts (21)</button>
                <button className="pb-2 text-slate-400 hover:text-slate-200">Open (21)</button>
                <button className="pb-2 text-slate-400 hover:text-slate-200">Acknowledged (10)</button>
                <button className="pb-2 text-slate-400 hover:text-slate-200">Resolved</button>
              </div>

              {/* filters */}
              <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-800 text-xs">
                <div className="relative flex-1 min-w-[180px] max-w-[260px]">
                  <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="w-full pl-7 pr-2 py-1.5 rounded border border-slate-700 bg-slate-950/60 text-slate-200 placeholder:text-slate-500" placeholder="Search alerts..." />
                </div>
                {["Severity: All", "Type: All", "Status: Open", "Source: All"].map((l) => (
                  <button key={l} className="border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200">{l} <ChevronsUpDown className="h-3 w-3" /></button>
                ))}
                <button className="ml-auto border border-slate-700 rounded px-2 py-1.5 flex items-center gap-1 text-slate-200"><Filter className="h-3 w-3" /> Filters</button>
              </div>

              {/* table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      {["Severity","Alert","Source","Resource","Status","Triggered","Ack By","Actions"].map((h) => (
                        <th key={h} className="text-left font-medium px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {alerts.map((a, i) => (
                      <tr key={i} className={`${i === 0 ? "bg-blue-600/5" : ""} hover:bg-slate-800/30`}>
                        <td className="px-3 py-3 align-top"><SeverityBadge s={a.sev} /></td>
                        <td className="px-3 py-3 align-top">
                          <div className={`font-medium ${a.titleColor}`}>{a.title}</div>
                          <div className="text-[11px] text-slate-400">{a.sub}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="text-slate-200">{a.source}</div>
                          <div className="text-[11px] text-slate-500">{a.sourceSub}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="text-slate-200">{a.resource}</div>
                          <div className="text-[11px] text-slate-500">{a.resourceSub}</div>
                        </td>
                        <td className="px-3 py-3 align-top"><StatusBadge s={a.status} /></td>
                        <td className="px-3 py-3 align-top">
                          <div className="text-slate-200">{a.ago}</div>
                          <div className="text-[11px] text-slate-500">{a.ts}</div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          {a.ackBy ? (
                            <>
                              <div className="text-slate-200">{a.ackBy}</div>
                              <div className="text-[11px] text-slate-500">{a.ackTs}</div>
                            </>
                          ) : <span className="text-slate-500">—</span>}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <button className="h-7 w-7 grid place-items-center border border-slate-700 rounded text-slate-400 hover:text-slate-200"><MoreHorizontal className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div className="flex items-center justify-between p-3 border-t border-slate-800 text-xs text-slate-400">
                <span>Showing 1 to {alerts.length} of 21 alerts</span>
                <div className="flex items-center gap-1">
                  <button className="h-7 w-7 grid place-items-center border border-slate-700 rounded"><ChevronLeft className="h-3 w-3" /></button>
                  <button className="h-7 w-7 grid place-items-center border border-blue-500/50 bg-blue-600/15 text-blue-300 rounded">1</button>
                  <button className="h-7 w-7 grid place-items-center border border-slate-700 rounded"><ChevronRight className="h-3 w-3" /></button>
                </div>
              </div>
            </div>

            {/* detail panel */}
            <aside className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">Alert Details</div>
                <button className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <SeverityBadge s="Critical" />
                <span className="text-slate-500">ID: ALT-2024-05-20-1024</span>
              </div>
              <div>
                <div className="text-base font-bold text-white">PDU-2A Overload Warning</div>
                <div className="text-xs text-slate-400">Load: 95% (28.5 kW / 30 kW)</div>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  ["Source", "PDU-2A (Rack Row A)"],
                  ["Resource Type", "PDU"],
                  ["IP Address", "192.168.1.22"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-slate-200">{v}</span></div>
                ))}
                <div className="flex justify-between"><span className="text-slate-400">Severity</span><span className="text-rose-400 font-semibold">Critical</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-rose-400 font-semibold">Open</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Triggered</span><span className="text-slate-200">May 20, 2024 10:24 AM (2m ago)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-slate-200">2m</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ack By</span><span className="text-slate-500">—</span></div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-white mb-1">Description</div>
                <p className="text-xs text-slate-400">The power load on PDU-2A has exceeded 90% of capacity and is currently at 95%.</p>
              </div>

              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
                <div className="flex justify-between"><span className="text-slate-400">Threshold</span><span className="text-slate-200">&gt; 90% for 5 minutes</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Current Value</span><span className="text-rose-300">28.5 kW (95%)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Threshold Value</span><span className="text-slate-200">27.0 kW (90%)</span></div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-white mb-2">Recent Trend</div>
                <TrendChart />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-white mb-2">Actions</div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Acknowledge</button>
                  <button className="px-3 py-1.5 border border-slate-700 rounded text-xs flex items-center gap-1 text-slate-200"><StickyNote className="h-3 w-3" /> Add Note</button>
                  <button className="px-3 py-1.5 border border-slate-700 rounded text-xs flex items-center gap-1 text-slate-200">More Actions <ChevronsUpDown className="h-3 w-3" /></button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
