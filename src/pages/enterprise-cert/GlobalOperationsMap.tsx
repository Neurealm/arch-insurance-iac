import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, BookCheck, Bot, Briefcase, Building2, Cog, FileSearch, FileText, GitBranch,
  Globe, HelpCircle, LayoutDashboard, Package, Plug, RefreshCw, ScrollText, Scale, Search,
  ServerCog, ShieldAlert, ShieldCheck, UserCog, Sparkles, X, ChevronRight, MapPin, AlertTriangle,
  Users, DollarSign, Shield, Zap, Filter, Layers, TrendingUp, Wifi, CheckCircle2,
} from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, Line as MapLine } from "react-simple-maps";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ============== SIDEBAR ==============
const navSections = [
  { label: "Command Center", items: [
    { id: "ops", label: "Operations Overview", icon: LayoutDashboard, to: "/enterprise-certificate-management" },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert, to: "/enterprise-certificate-management/risk-exposure" },
    { id: "map", label: "Global Map", icon: Globe, to: "/enterprise-certificate-management/global-map", active: true },
    { id: "life", label: "Lifecycle", icon: Activity, to: "/enterprise-certificate-management/lifecycle" },
    { id: "biz", label: "Business Services", icon: Briefcase, to: "/enterprise-certificate-management/business-services" },
    { id: "rep", label: "Reports", icon: FileText, to: "/enterprise-certificate-management/reports" },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch, to: "/enterprise-certificate-management/change-manager" },
    { id: "int", label: "Integrations", icon: Plug, to: "/enterprise-certificate-management/integrations" },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck },
    { id: "com", label: "Compliance Center", icon: BookCheck },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch },
    { id: "pol", label: "Policy Engine", icon: Scale },
    { id: "ct", label: "CT Logs Monitor", icon: ScrollText },
  ]},
  { label: "Administration", items: [
    { id: "inv", label: "Inventory", icon: Package },
    { id: "iss", label: "Issuers & CAs", icon: Building2 },
    { id: "acc", label: "Account Management", icon: UserCog },
    { id: "sys", label: "System Settings", icon: Cog },
  ]},
];

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }}
      className="w-[240px] shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col"
    >
      <div className="px-5 pt-5 pb-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center text-white text-xs font-bold">n</div>
        <div className="leading-tight">
          <div className="text-[11px] text-slate-500 font-medium">neurealm</div>
          <div className="text-base font-bold text-slate-900 -mt-0.5">RunOps</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {navSections.map((s) => (
          <div key={s.label} className="mt-4">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="mt-1 space-y-0.5">
              {s.items.map((it: any) => {
                const inner = (<><it.icon className="h-4 w-4" /><span>{it.label}</span></>);
                const cls = cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-blue-700 font-semibold hover:bg-blue-50"
                );
                return it.to
                  ? <Link key={it.id} to={it.to} className={cls}>{inner}</Link>
                  : <button key={it.id} className={cls}>{inner}</button>;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Global Health</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">98.7%</span>
          <span className="text-xs opacity-80">Compliance</span>
        </div>
        <div className="text-xs opacity-90">5 regions · 12 coworkers</div>
      </div>
    </motion.aside>
  );
}

// ============== HEADER ==============
function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 font-medium">Enterprise Certificate Management</div>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold text-slate-900 truncate">Global Certificate Operations Map</h1>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input placeholder="Search regions, services, certs" className="pl-8 pr-3 h-8 w-72 text-[12px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-300 outline-none" />
        </div>
        <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><Bell className="h-4 w-4 text-slate-600" /></button>
        <button className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
      </div>
    </header>
  );
}

// ============== COUNTER ==============
function useCountUp(target: number, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Kpi({ label, value, prefix = "", suffix = "", decimals = 0, accent = "blue", icon: Icon, delay = 0 }: any) {
  const n = useCountUp(value);
  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  const accents: Record<string, string> = {
    blue: "from-blue-500 to-sky-400 text-blue-600 bg-blue-50",
    emerald: "from-emerald-500 to-teal-400 text-emerald-600 bg-emerald-50",
    violet: "from-violet-500 to-purple-400 text-violet-600 bg-violet-50",
    amber: "from-amber-500 to-orange-400 text-amber-600 bg-amber-50",
    rose: "from-rose-500 to-red-400 text-rose-600 bg-rose-50",
  };
  const a = accents[accent];
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="relative bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", a.split(" ").slice(0, 2).join(" "))} />
      <div className="flex items-start justify-between">
        <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        {Icon && <div className={cn("h-7 w-7 grid place-items-center rounded-lg", a.split(" ").slice(2).join(" "))}><Icon className="h-3.5 w-3.5" /></div>}
      </div>
      <div className="mt-1.5 text-[22px] font-bold text-slate-900 tabular-nums leading-tight">{prefix}{display}{suffix}</div>
    </motion.div>
  );
}

// ============== DATA ==============
type Region = {
  id: string; label: string; coords: [number, number]; certs: number; apps: number; services: number;
  risk: number; incidents: number; coworkers: number; compliance: number; revenue: number; customers: number;
  automation: number; renewals: number;
};

const REGIONS: Region[] = [
  { id: "na", label: "North America", coords: [-100, 40], certs: 17500, apps: 500, services: 210, risk: 72, incidents: 2, coworkers: 5, compliance: 97.9, revenue: 9.2, customers: 17000, automation: 84, renewals: 142 },
  { id: "eu", label: "Europe", coords: [10, 50], certs: 9400, apps: 260, services: 120, risk: 38, incidents: 1, coworkers: 3, compliance: 99.3, revenue: 1.8, customers: 6200, automation: 88, renewals: 71 },
  { id: "ap", label: "APAC", coords: [115, 30], certs: 8700, apps: 240, services: 95, risk: 41, incidents: 1, coworkers: 2, compliance: 98.4, revenue: 0.9, customers: 3400, automation: 80, renewals: 48 },
  { id: "sa", label: "South America", coords: [-58, -15], certs: 3000, apps: 110, services: 40, risk: 18, incidents: 0, coworkers: 1, compliance: 99.6, revenue: 0.3, customers: 900, automation: 76, renewals: 14 },
  { id: "mea", label: "Middle East & Africa", coords: [35, 15], certs: 3400, apps: 90, services: 35, risk: 22, incidents: 0, coworkers: 1, compliance: 99.1, revenue: 0.2, customers: 500, automation: 72, renewals: 12 },
];

const DEP_LINES: Array<{ from: [number, number]; to: [number, number] }> = [
  { from: [-100, 40], to: [10, 50] },
  { from: [10, 50], to: [115, 30] },
  { from: [-100, 40], to: [115, 30] },
  { from: [-100, 40], to: [-58, -15] },
  { from: [10, 50], to: [35, 15] },
];

const ACTIVITY_FEED = [
  { ts: "09:14:22", region: "NA", type: "Renewal", label: "TLS cert renewed · payments-api.acme.io", tone: "emerald" },
  { ts: "09:14:08", region: "EU", type: "Compliance", label: "PCI evidence sealed · checkout-eu", tone: "blue" },
  { ts: "09:13:51", region: "AP", type: "Deployment", label: "Cert pushed to load balancer · apac-edge-04", tone: "violet" },
  { ts: "09:13:33", region: "NA", type: "Escalation", label: "Owner unreachable · cms-legacy.acme.io", tone: "amber" },
  { ts: "09:12:59", region: "NA", type: "Security", label: "Unauthorized issuance flagged · investigating", tone: "rose" },
  { ts: "09:12:40", region: "EU", type: "Validation", label: "Chain validated · gdpr-services.eu", tone: "emerald" },
  { ts: "09:12:18", region: "AP", type: "Discovery", label: "37 shadow certs discovered · apac-vnet-02", tone: "blue" },
];

const QUEUE = [
  { id: "renewals", label: "Renewals", count: 287, icon: RefreshCw, tone: "blue" },
  { id: "ownership", label: "Ownership Issues", count: 73, icon: Users, tone: "amber" },
  { id: "deployments", label: "Deployments", count: 49, icon: Zap, tone: "violet" },
  { id: "validation", label: "Validation Failures", count: 12, icon: AlertTriangle, tone: "rose" },
  { id: "security", label: "Security Events", count: 4, icon: Shield, tone: "rose" },
  { id: "escalations", label: "Escalations", count: 18, icon: TrendingUp, tone: "amber" },
];

const COMPLIANCE_FW = ["PCI", "SOC2", "NIST", "ISO27001", "HIPAA"];

const HEALTH = (r: Region) => r.risk >= 60 ? "red" : r.risk >= 40 ? "orange" : r.risk >= 25 ? "yellow" : "green";
const HEALTH_COLOR: Record<string, string> = { red: "#ef4444", orange: "#f97316", yellow: "#f59e0b", green: "#10b981" };

// ============== MAP ==============
function GlobalMap({ onSelect, onDouble, filter }: { onSelect: (r: Region) => void; onDouble: (r: Region) => void; filter: string | null }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold text-slate-700">
        <Layers className="h-3 w-3 text-blue-600" /> Risk + Activity Overlay
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
        <Wifi className="h-3 w-3 animate-pulse" /> Streaming · 1.2s latency
      </div>
      {filter && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1 text-[11px] font-semibold">
          <Filter className="h-3 w-3" /> Filter: {filter}
        </div>
      )}
      <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 190 }} style={{ width: "100%", height: "100%" }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((g) => (
              <Geography
                key={g.rsmKey} geography={g}
                fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#dbeafe", outline: "none", cursor: "pointer" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Dependency arcs */}
        {DEP_LINES.map((l, i) => (
          <MapLine
            key={i} from={l.from} to={l.to}
            stroke="#3b82f6" strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray="4 4"
          />
        ))}

        {/* Region markers */}
        {REGIONS.map((r, i) => {
          const health = HEALTH(r);
          const color = HEALTH_COLOR[health];
          return (
            <Marker key={r.id} coordinates={r.coords}
              onClick={() => onSelect(r)}
              onDoubleClick={() => onDouble(r)}
            >
              {/* halo */}
              <motion.circle
                r={32} fill={color} fillOpacity={0.15}
                animate={{ r: [28, 40, 28], opacity: [0.25, 0.05, 0.25] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.25 }}
              />
              <motion.circle
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                r={20} fill={color} fillOpacity={0.92} stroke="white" strokeWidth={2}
                style={{ cursor: "pointer", filter: "drop-shadow(0 4px 8px rgba(15,23,42,0.2))" }}
              />
              <text textAnchor="middle" y={4} style={{ fontSize: 10, fontWeight: 800, fill: "white", pointerEvents: "none" }}>
                {(r.certs / 1000).toFixed(1)}K
              </text>
              <text textAnchor="middle" y={36} style={{ fontSize: 10.5, fontWeight: 700, fill: "#0f172a", pointerEvents: "none" }}>
                {r.label}
              </text>
              <text textAnchor="middle" y={48} style={{ fontSize: 9, fontWeight: 600, fill: "#64748b", pointerEvents: "none" }}>
                Risk {r.risk} · {r.incidents} incidents
              </text>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 text-[10.5px] flex items-center gap-3">
        <span className="font-bold text-slate-600 uppercase tracking-wider">Risk</span>
        {[
          { c: "#10b981", l: "Healthy" }, { c: "#f59e0b", l: "Moderate" },
          { c: "#f97316", l: "Elevated" }, { c: "#ef4444", l: "Critical" },
        ].map((x) => (
          <span key={x.l} className="inline-flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.c }} /> {x.l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============== CONTEXT PANEL ==============
function RegionPanel({ region, deep, onClose }: { region: Region | null; deep: boolean; onClose: () => void }) {
  return (
    <Sheet open={!!region} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 overflow-y-auto">
        {region && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{deep ? "Regional Operations Center" : "Region Detail"}</div>
                  <SheetTitle className="text-[20px] font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" /> {region.label}
                  </SheetTitle>
                  <div className="text-[12px] text-slate-500 mt-0.5">{region.certs.toLocaleString()} certificates · {region.coworkers} digital coworkers active</div>
                </div>
                <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"><X className="h-4 w-4" /></button>
              </div>
            </SheetHeader>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { l: "Certificates", v: region.certs.toLocaleString() },
                  { l: "Applications", v: region.apps },
                  { l: "Services", v: region.services },
                  { l: "Incidents", v: region.incidents, tone: region.incidents > 0 ? "rose" : "emerald" },
                  { l: "Risk Score", v: region.risk, tone: region.risk >= 60 ? "rose" : region.risk >= 30 ? "amber" : "emerald" },
                  { l: "Compliance", v: `${region.compliance}%`, tone: "emerald" },
                  { l: "Renewals", v: region.renewals },
                  { l: "Automation", v: `${region.automation}%` },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                    <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-semibold">{s.l}</div>
                    <div className={cn("text-[15px] font-bold mt-0.5", s.tone === "rose" ? "text-rose-600" : s.tone === "amber" ? "text-amber-600" : s.tone === "emerald" ? "text-emerald-600" : "text-slate-900")}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-gradient-to-br from-blue-50 to-white">
                <div className="text-[11px] uppercase tracking-wider text-blue-700 font-bold">Executive Summary</div>
                <p className="text-[12.5px] text-slate-700 mt-1.5 leading-relaxed">
                  {region.label} is operating at <b>{region.compliance}%</b> compliance with <b>{region.coworkers}</b> digital coworkers actively managing
                  {" "}{region.renewals} pending renewals across {region.services} business services. Estimated revenue exposure is{" "}
                  <b>${region.revenue.toFixed(1)}M</b> protecting <b>{region.customers.toLocaleString()}</b> customers.
                </p>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Business Impact</div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <div className="text-[10px] text-emerald-700 font-bold uppercase">Revenue Protected</div>
                    <div className="text-[17px] font-bold text-slate-900 mt-0.5">${region.revenue.toFixed(1)}M</div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                    <div className="text-[10px] text-blue-700 font-bold uppercase">Customers</div>
                    <div className="text-[17px] font-bold text-slate-900 mt-0.5">{region.customers.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3">
                    <div className="text-[10px] text-violet-700 font-bold uppercase">Critical Services</div>
                    <div className="text-[17px] font-bold text-slate-900 mt-0.5">{Math.round(region.services * 0.15)}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Compliance by Framework</div>
                <div className="space-y-1.5">
                  {COMPLIANCE_FW.map((f, i) => {
                    const pct = Math.max(92, Math.min(100, region.compliance - 1 + i));
                    return (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-20 text-[11.5px] font-semibold text-slate-700">{f}</div>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 * i }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                        </div>
                        <div className="w-12 text-right text-[11px] font-bold text-emerald-600">{pct.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Dependencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {["DigiCert", "Let's Encrypt", "Sectigo", "AWS Cloud", "Azure", "GCP", "Cloudflare CDN", "F5 LBs"].map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                      <ChevronRight className="h-3 w-3 text-slate-400" /> {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">Recommended Actions</div>
                <ul className="space-y-1.5">
                  {[
                    "Pre-stage renewals for 7 high-criticality certs expiring within 14 days",
                    "Resolve 3 unmapped ownership records via CMDB reconciliation",
                    "Validate failover chain for top revenue service in this region",
                  ].map((a) => (
                    <li key={a} className="flex items-start gap-2 text-[12.5px] text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              </div>

              {deep && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-blue-700 font-bold">Regional Operations Workspace</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["Operational Queues", "Digital Coworkers", "Active Incidents", "Renewals", "Business Services", "Applications", "Dependencies", "Revenue Impact"].map((t) => (
                      <button key={t} className="text-[12px] font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 rounded-lg px-3 py-2 text-left">{t} →</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ============== MAIN ==============
export default function GlobalOperationsMap() {
  const [region, setRegion] = useState<Region | null>(null);
  const [deep, setDeep] = useState(false);
  const [queueFilter, setQueueFilter] = useState<string | null>(null);

  const totalCerts = useMemo(() => REGIONS.reduce((a, r) => a + r.certs, 0), []);
  const totalRevenue = useMemo(() => REGIONS.reduce((a, r) => a + r.revenue, 0), []);
  const totalCustomers = useMemo(() => REGIONS.reduce((a, r) => a + r.customers, 0), []);
  const totalCoworkers = useMemo(() => REGIONS.reduce((a, r) => a + r.coworkers, 0) + 1, []);

  const byRegionBar = REGIONS.map((r) => ({ name: r.label.split(" ")[0], certs: r.certs, risk: r.risk * 100 }));
  const incidentsBar = REGIONS.map((r) => ({ name: r.label.split(" ")[0], incidents: r.incidents }));
  const radar = REGIONS.map((r) => ({ subject: r.label.split(" ")[0], Compliance: r.compliance, Automation: r.automation }));
  const utilPie = [
    { name: "Discovery", value: 32, color: "#3b82f6" },
    { name: "Risk", value: 22, color: "#8b5cf6" },
    { name: "Renewal", value: 18, color: "#10b981" },
    { name: "Deployment", value: 14, color: "#f59e0b" },
    { name: "Compliance", value: 9, color: "#06b6d4" },
    { name: "Security", value: 5, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-6 space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <Kpi label="Total Certificates" value={totalCerts} icon={Shield} accent="blue" delay={0.05} />
            <Kpi label="Managed" value={34800} icon={CheckCircle2} accent="emerald" delay={0.1} />
            <Kpi label="Expiring 30d" value={1150} icon={RefreshCw} accent="amber" delay={0.15} />
            <Kpi label="Critical Risk" value={380} icon={AlertTriangle} accent="rose" delay={0.2} />
            <Kpi label="Compliance" value={98.7} suffix="%" decimals={1} icon={BookCheck} accent="emerald" delay={0.25} />
            <Kpi label="Coworkers Active" value={totalCoworkers} icon={Bot} accent="violet" delay={0.3} />
            <Kpi label="Revenue Protected" value={totalRevenue} prefix="$" suffix="M" decimals={1} icon={DollarSign} accent="emerald" delay={0.35} />
            <Kpi label="Customers Protected" value={totalCustomers} icon={Users} accent="blue" delay={0.4} />
          </div>

          {/* Map + side rail */}
          <div className="grid grid-cols-12 gap-4">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-12 xl:col-span-8 h-[560px]">
              <GlobalMap onSelect={(r) => { setRegion(r); setDeep(false); }} onDouble={(r) => { setRegion(r); setDeep(true); }} filter={queueFilter} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-span-12 xl:col-span-4 flex flex-col gap-4">
              {/* Live activity */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Live Activity</div>
                    <div className="text-[13.5px] font-bold text-slate-900">Global Operations Stream</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  <AnimatePresence initial>
                    {ACTIVITY_FEED.map((a, i) => {
                      const toneCls: Record<string, string> = {
                        emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
                        blue: "bg-blue-50 border-blue-200 text-blue-700",
                        violet: "bg-violet-50 border-violet-200 text-violet-700",
                        amber: "bg-amber-50 border-amber-200 text-amber-700",
                        rose: "bg-rose-50 border-rose-200 text-rose-700",
                      };
                      return (
                        <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.06 }}
                          className="flex items-start gap-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 px-2.5 py-2">
                          <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">{a.ts}</div>
                          <span className={cn("text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", toneCls[a.tone])}>{a.region} · {a.type}</span>
                          <div className="text-[12px] text-slate-700 flex-1">{a.label}</div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Operational queues */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="text-[13.5px] font-bold text-slate-900">Operational Queues</div>
                  {queueFilter && <button onClick={() => setQueueFilter(null)} className="text-[10.5px] font-semibold text-blue-600">Clear filter</button>}
                </div>
                <div className="grid grid-cols-3 gap-2 p-3">
                  {QUEUE.map((q) => {
                    const toneCls: Record<string, string> = {
                      blue: "text-blue-600 bg-blue-50", violet: "text-violet-600 bg-violet-50",
                      amber: "text-amber-600 bg-amber-50", rose: "text-rose-600 bg-rose-50",
                    };
                    const active = queueFilter === q.label;
                    return (
                      <button key={q.id} onClick={() => setQueueFilter(active ? null : q.label)}
                        className={cn("rounded-lg border p-2.5 text-left transition-all hover:shadow-sm", active ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-200")}>
                        <div className="flex items-center justify-between">
                          <div className={cn("h-6 w-6 grid place-items-center rounded", toneCls[q.tone])}><q.icon className="h-3 w-3" /></div>
                          <div className="text-[15px] font-bold text-slate-900 tabular-nums">{q.count}</div>
                        </div>
                        <div className="text-[10.5px] font-semibold text-slate-600 mt-1 leading-tight">{q.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Analytics row */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Executive Analytics</div>
              <div className="text-[14px] font-bold text-slate-900">Certificates & Risk by Region</div>
              <div className="h-[230px] mt-2">
                <ResponsiveContainer>
                  <BarChart data={byRegionBar} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip />
                    <Bar dataKey="certs" fill="#3b82f6" radius={[6, 6, 0, 0]} animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Posture</div>
              <div className="text-[14px] font-bold text-slate-900">Compliance & Automation by Region</div>
              <div className="h-[230px] mt-2">
                <ResponsiveContainer>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <PolarRadiusAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[60, 100]} />
                    <Radar name="Compliance" dataKey="Compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                    <Radar name="Automation" dataKey="Automation" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Workforce</div>
              <div className="text-[14px] font-bold text-slate-900">Digital Coworker Utilization</div>
              <div className="h-[230px] mt-2 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={utilPie} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2} animationDuration={900}>
                      {utilPie.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">12</div>
                    <div className="text-[10px] text-slate-500">Active</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {utilPie.map((u) => (
                  <div key={u.name} className="flex items-center gap-1 text-[10.5px] text-slate-600">
                    <span className="h-2 w-2 rounded-sm" style={{ background: u.color }} /> {u.name} {u.value}%
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Incidents bar full width */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">Incidents</div>
                <div className="text-[14px] font-bold text-slate-900">Active Incidents by Region</div>
              </div>
              <div className="text-[11px] text-slate-500">Last 24h · auto-routed to digital coworkers</div>
            </div>
            <div className="h-[180px] mt-2">
              <ResponsiveContainer>
                <BarChart data={incidentsBar} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} width={110} />
                  <RTooltip />
                  <Bar dataKey="incidents" fill="#ef4444" radius={[0, 6, 6, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </main>
      </div>

      <RegionPanel region={region} deep={deep} onClose={() => setRegion(null)} />
    </div>
  );
}
