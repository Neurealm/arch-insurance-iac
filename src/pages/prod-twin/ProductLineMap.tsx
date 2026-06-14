import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, Settings, HelpCircle, Info, Package, ShieldAlert, TrendingUp,
  Activity, Layers, AlertTriangle, ChevronRight, X, Cloud, Database, Server,
  Sparkles, AlertOctagon, CheckCircle2, Circle, ArrowUpRight, Network, Map as MapIcon,
  LayoutGrid, Rows3, Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Line, LineChart } from "recharts";
import { cn } from "@/lib/utils";

/* ---------------- Types & sample data ---------------- */

type Lifecycle =
  | "Invest / Modernize" | "Stabilize & Enhance" | "Shrink / Keep Lights On"
  | "Stabilize / Special Support" | "Migrate / Absorb" | "Invest / Go-Forward"
  | "Sunset / External Hosting";
type Criticality = "High" | "Medium" | "Low";
type SloMaturity = "Not Defined" | "Draft" | "Measured" | "Enforced" | "Error Budget";

type Product = {
  id: string;
  name: string;
  lifecycle: Lifecycle;
  description: string;
  hosting: { label: string; icon: "aws" | "gcp" | "citrix" | "onprem" | "liquid" }[];
  tech: { label: string; icon: "db" | "shards" | "oracle" | "pg" }[];
  criticality: Criticality;
  sloMaturity: SloMaturity;
  health: number;
  owner: string;
  support: string;
  cyber: { label: string; tone: "good" | "warn" | "bad" };
  patch: number;
  edr: boolean;
  identity: string;
  fwSg: string;
  backup: string;
  dr: string;
  vuln: "Low" | "Medium" | "High";
  backlog: string[];
  initiatives: number;
  revenueImpact: string;
  caregiverImpact: string;
  stateSla: string;
  reputation: string;
  phi: string;
  automation: { label: string; detail: string };
  trend: number[];
};

const PRODUCTS: Product[] = [
  {
    id: "hha", name: "HHA Enterprise", lifecycle: "Invest / Modernize",
    description: "Core go-forward platform for HHAX. Primary system for caregiver, claims, payroll and state operations.",
    hosting: [{ label: "AWS (Ashburn)", icon: "aws" }],
    tech: [{ label: "SQL Server", icon: "db" }, { label: "12 Shards", icon: "shards" }],
    criticality: "High", sloMaturity: "Measured", health: 86,
    owner: "Platform Engineering", support: "HHAX-Owned",
    cyber: { label: "Good", tone: "good" },
    patch: 92, edr: true, identity: "Okta SSO", fwSg: "Restricted",
    backup: "Daily", dr: "Cross-region (Warm)", vuln: "Medium",
    backlog: ["Containerization of web tier", "Infrastructure as Code (Terraform)", "GitHub Actions CI/CD", "Golden AMI standardization", "Database modernization roadmap", "Service ownership model rollout"],
    initiatives: 24,
    revenueImpact: "Revenue critical — primary billing pipeline",
    caregiverImpact: "Direct caregiver workflow blocker if degraded",
    stateSla: "Tied to 14 state contracts (Medicaid)",
    reputation: "Public-facing impact during incidents",
    phi: "PHI/PII heavy — HIPAA regulated",
    automation: { label: "Runbooked", detail: "Strong runbooks, partial automation" },
    trend: [78, 80, 79, 82, 83, 84, 85, 86],
  },
  {
    id: "fuse", name: "Sandata Fuse", lifecycle: "Stabilize & Enhance",
    description: "EVV and visit verification platform. Integrated with shared SRE services.",
    hosting: [{ label: "AWS", icon: "aws" }],
    tech: [{ label: "Oracle Database", icon: "oracle" }],
    criticality: "High", sloMaturity: "Measured", health: 80,
    owner: "Product Engineering", support: "HHAX-Owned",
    cyber: { label: "Good", tone: "good" },
    patch: 88, edr: true, identity: "Okta SSO", fwSg: "Restricted",
    backup: "Daily", dr: "Pilot Light", vuln: "Low",
    backlog: ["Oracle license rationalization", "Move to PostgreSQL Aurora", "Telemetry coverage to 95%"],
    initiatives: 11,
    revenueImpact: "State-mandated EVV revenue dependency",
    caregiverImpact: "Visit capture failures impact pay",
    stateSla: "21st Century Cures Act EVV compliance",
    reputation: "State regulator visibility",
    phi: "PHI moderate",
    automation: { label: "Scripted", detail: "Mix of scripted & runbooked ops" },
    trend: [74, 75, 76, 77, 79, 79, 80, 80],
  },
  {
    id: "sam", name: "SAM", lifecycle: "Shrink / Keep Lights On",
    description: "Legacy claims system with state commitments. Limited investment.",
    hosting: [{ label: "On-Prem (Ashburn)", icon: "onprem" }],
    tech: [{ label: "SQL Server", icon: "db" }],
    criticality: "Medium", sloMaturity: "Draft", health: 62,
    owner: "Platform Engineering", support: "Shared",
    cyber: { label: "Warn", tone: "warn" },
    patch: 71, edr: true, identity: "Active Directory", fwSg: "Legacy ACLs",
    backup: "Weekly", dr: "Cold standby", vuln: "High",
    backlog: ["Decommission roadmap (24mo)", "State customer migration plan", "PCI scope reduction"],
    initiatives: 5,
    revenueImpact: "Declining revenue, state book of business",
    caregiverImpact: "Limited — back-office claims only",
    stateSla: "Two remaining state contracts",
    reputation: "Low external visibility",
    phi: "PHI present but archival",
    automation: { label: "Manual", detail: "Largely manual operations" },
    trend: [65, 64, 64, 63, 62, 62, 62, 62],
  },
  {
    id: "pp", name: "Provider Pro / IDD", lifecycle: "Stabilize / Special Support",
    description: "Thick client platform with Citrix dependency. Payroll, accounting, ERP-like complexity.",
    hosting: [{ label: "Citrix", icon: "citrix" }],
    tech: [{ label: "SQL Server", icon: "db" }],
    criticality: "High", sloMaturity: "Draft", health: 68,
    owner: "Product Engineering", support: "HHAX-Owned",
    cyber: { label: "Warn", tone: "warn" },
    patch: 79, edr: true, identity: "AD + Okta", fwSg: "Citrix gateway",
    backup: "Daily", dr: "Warm", vuln: "Medium",
    backlog: ["Citrix exit strategy", "Web client modernization", "DB consolidation"],
    initiatives: 9,
    revenueImpact: "Stable revenue, IDD provider segment",
    caregiverImpact: "Provider admin workflows",
    stateSla: "Embedded in IDD state programs",
    reputation: "Specialty segment exposure",
    phi: "PHI moderate",
    automation: { label: "Scripted", detail: "Citrix automation in place" },
    trend: [70, 70, 69, 69, 68, 68, 68, 68],
  },
  {
    id: "ank", name: "Ankasan / Self-Direction", lifecycle: "Migrate / Absorb",
    description: "Self-direction and consumer directed services platform. Roadmap to absorption.",
    hosting: [{ label: "GCP", icon: "gcp" }, { label: "AWS", icon: "aws" }],
    tech: [],
    criticality: "Medium", sloMaturity: "Measured", health: 74,
    owner: "Product Engineering", support: "Shared",
    cyber: { label: "Good", tone: "good" },
    patch: 85, edr: true, identity: "Okta SSO", fwSg: "Restricted",
    backup: "Daily", dr: "Cross-region", vuln: "Low",
    backlog: ["Absorb into Pavilio platform", "Data migration tooling", "API parity"],
    initiatives: 7,
    revenueImpact: "Growth segment — self-direction",
    caregiverImpact: "Consumer-directed worker impact",
    stateSla: "5 states active",
    reputation: "Strategic growth narrative",
    phi: "PHI moderate",
    automation: { label: "API Enabled", detail: "API-first, partial IaC" },
    trend: [70, 71, 72, 72, 73, 73, 74, 74],
  },
  {
    id: "pav", name: "Pavilio", lifecycle: "Invest / Go-Forward",
    description: "Next-generation platform targeting future state architecture. Landing zone candidate.",
    hosting: [{ label: "AWS", icon: "aws" }],
    tech: [{ label: "PostgreSQL", icon: "pg" }],
    criticality: "High", sloMaturity: "Draft", health: 78,
    owner: "Platform Engineering", support: "HHAX-Owned",
    cyber: { label: "Good", tone: "good" },
    patch: 95, edr: true, identity: "Okta SSO + MFA", fwSg: "Zero Trust",
    backup: "Continuous", dr: "Multi-region active", vuln: "Low",
    backlog: ["Multi-tenant data model", "Service mesh rollout", "SLO definition wave 1", "GA cutover plan"],
    initiatives: 18,
    revenueImpact: "Future revenue platform",
    caregiverImpact: "Future caregiver experience",
    stateSla: "Greenfield — building compliance",
    reputation: "Bet-the-company narrative",
    phi: "PHI design — privacy by default",
    automation: { label: "AI Assisted", detail: "IaC + AI ops baseline" },
    trend: [72, 73, 74, 75, 76, 77, 77, 78],
  },
  {
    id: "gen", name: "Generations", lifecycle: "Sunset / External Hosting",
    description: "Legacy offering in external hosting. Low investment with transition risk.",
    hosting: [{ label: "Liquid Web", icon: "liquid" }],
    tech: [{ label: "SQL Server", icon: "db" }],
    criticality: "Low", sloMaturity: "Not Defined", health: 45,
    owner: "Platform Engineering", support: "Partner Owned",
    cyber: { label: "Bad", tone: "bad" },
    patch: 58, edr: false, identity: "Local AD",
    fwSg: "Vendor managed", backup: "Vendor weekly",
    dr: "None documented", vuln: "High",
    backlog: ["Customer sunset notices", "Data export tooling", "Contract exit Q4"],
    initiatives: 3,
    revenueImpact: "Sunset cohort — declining",
    caregiverImpact: "Minimal",
    stateSla: "None active",
    reputation: "Reputational risk if breach",
    phi: "PHI archival",
    automation: { label: "Manual", detail: "Vendor-managed manual ops" },
    trend: [50, 49, 48, 47, 47, 46, 46, 45],
  },
];

/* lifecycle styling */
const lifecycleTone: Record<Lifecycle, string> = {
  "Invest / Modernize": "bg-blue-50 text-blue-700 border-blue-200",
  "Stabilize & Enhance": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Shrink / Keep Lights On": "bg-amber-50 text-amber-700 border-amber-200",
  "Stabilize / Special Support": "bg-violet-50 text-violet-700 border-violet-200",
  "Migrate / Absorb": "bg-sky-50 text-sky-700 border-sky-200",
  "Invest / Go-Forward": "bg-teal-50 text-teal-700 border-teal-200",
  "Sunset / External Hosting": "bg-rose-50 text-rose-700 border-rose-200",
};

const critTone: Record<Criticality, string> = {
  High: "text-rose-600", Medium: "text-amber-600", Low: "text-emerald-600",
};
const critDot: Record<Criticality, string> = {
  High: "bg-rose-500", Medium: "bg-amber-500", Low: "bg-emerald-500",
};
const healthRing = (h: number) => h >= 80 ? "text-emerald-600" : h >= 65 ? "text-amber-600" : "text-rose-600";

function HostingIcon({ k }: { k: string }) {
  const cls = "h-3.5 w-3.5";
  switch (k) {
    case "aws": return <span className="text-orange-500 text-[10px] font-bold">aws</span>;
    case "gcp": return <Cloud className={cn(cls, "text-sky-500")} />;
    case "citrix": return <Circle className={cn(cls, "text-blue-500")} />;
    case "onprem": return <Server className={cn(cls, "text-slate-500")} />;
    case "liquid": return <Cloud className={cn(cls, "text-cyan-500")} />;
    case "oracle": return <Circle className={cn(cls, "text-red-500")} />;
    case "pg": return <Database className={cn(cls, "text-indigo-500")} />;
    case "shards": return <Layers className={cn(cls, "text-slate-500")} />;
    case "db":
    default: return <Database className={cn(cls, "text-slate-500")} />;
  }
}

/* ---------------- Component ---------------- */

type DrawerKind = "product" | "kpi" | "insight" | null;

export default function ProductLineMap() {
  const [selected, setSelected] = useState<Product | null>(PRODUCTS[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerKind, setDrawerKind] = useState<DrawerKind>("product");
  const [kpiContext, setKpiContext] = useState<{ title: string; body: string } | null>(null);
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState("All");
  const [criticality, setCriticality] = useState("All");
  const [hosting, setHosting] = useState("All");
  const [owner, setOwner] = useState("All");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => PRODUCTS.filter(p => {
    if (search && !(`${p.name} ${p.description} ${p.owner} ${p.hosting.map(h => h.label).join(" ")} ${p.tech.map(t => t.label).join(" ")}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (lifecycle !== "All" && !p.lifecycle.toLowerCase().includes(lifecycle.toLowerCase())) return false;
    if (criticality !== "All" && p.criticality !== criticality) return false;
    if (hosting !== "All" && !p.hosting.some(h => h.label.toLowerCase().includes(hosting.toLowerCase()))) return false;
    if (owner !== "All" && p.owner !== owner) return false;
    return true;
  }), [search, lifecycle, criticality, hosting, owner]);

  const openProduct = (p: Product) => { setSelected(p); setDrawerKind("product"); setDrawerOpen(true); };
  const openKpi = (title: string, body: string) => { setKpiContext({ title, body }); setDrawerKind("kpi"); setDrawerOpen(true); };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col bg-slate-50/60 min-h-screen">
        {/* Top utility bar */}
        <div className="h-14 border-b bg-white px-6 flex items-center gap-4 sticky top-0 z-20">
          <div className="font-semibold text-slate-800">HHAX Production Resilience Operating System</div>
          <div className="flex-1 max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, owners, technologies, hosting…"
              className="pl-9 h-9 bg-slate-50 border-slate-200" />
          </div>
          <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-rose-500 text-white text-[10px] rounded-full grid place-items-center font-semibold">12</span>
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100"><Settings className="h-4 w-4 text-slate-600" /></button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center text-white text-xs font-bold">JS</div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Center workspace */}
          <main className={cn("flex-1 overflow-auto p-6 transition-all", drawerOpen ? "pr-6" : "")}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                Digital Twin <ChevronRight className="h-3 w-3" /> Site Resilience Engineering
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-2xl font-semibold text-slate-900">HHAX Product Line Map</h1>
                <TooltipProvider><Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                  <TooltipContent>Authoritative operating model for HHAX product portfolio governance</TooltipContent>
                </Tooltip></TooltipProvider>
              </div>
              <p className="text-sm text-slate-600 mt-1">Digital twin view of HHAX product families, hosting footprint, and operating posture.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              {[
                { id: "fam", icon: <Package className="h-4 w-4 text-blue-600" />, label: "Total Product Families", value: "7", sub: "Active", body: "7 product families currently in the active portfolio inventory." },
                { id: "crit", icon: <ShieldAlert className="h-4 w-4 text-rose-600" />, label: "Business Criticality", value: "3", sub: "High / 7 Total", body: "3 products are classified High criticality — revenue, caregiver, or state SLA sensitive." },
                { id: "mod", icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, label: "Modernization Progress", value: "48%", sub: "+6% vs last month", body: "Weighted modernization completion across the portfolio with month-over-month delta." },
                { id: "hlt", icon: <Activity className="h-4 w-4 text-sky-600" />, label: "Operating Health", value: "82", suffix: "/100", sub: "+5 pts vs last month", body: "Portfolio operating health composite — SLOs, incident rate, change failure rate." },
                { id: "debt", icon: <Layers className="h-4 w-4 text-amber-600" />, label: "Technical Debt", value: "$78.4M", sub: "Est. Remediation", body: "Estimated total cost to remediate identified technical debt across the portfolio." },
                { id: "risk", icon: <AlertTriangle className="h-4 w-4 text-rose-600" />, label: "At Risk / High Risk", value: "4", sub: "Products", body: "4 products carry elevated operational, cyber, or compliance risk." },
              ].map(k => (
                <button key={k.id} onClick={() => openKpi(k.label, k.body)}
                  className="text-left bg-white border rounded-xl p-3 hover:shadow-md hover:border-blue-300 transition group">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 grid place-items-center group-hover:bg-blue-50">{k.icon}</div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">{k.label}</div>
                  <div className="text-xl font-semibold text-slate-900 leading-tight">
                    {k.value}<span className="text-xs text-slate-400 font-normal">{k.suffix ?? ""}</span>
                  </div>
                  <div className={cn("text-[11px] mt-0.5", k.sub.includes("+") ? "text-emerald-600" : "text-slate-500")}>
                    {k.id === "crit" ? <><span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 mr-1 align-middle" />{k.sub}</> : k.sub}
                  </div>
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <div className="bg-white border rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="pl-8 h-8 text-sm" />
              </div>
              {[
                { label: "Lifecycle", val: lifecycle, set: setLifecycle, opts: ["All", "Invest", "Modernize", "Stabilize", "Shrink", "Migrate", "Sunset"] },
                { label: "Criticality", val: criticality, set: setCriticality, opts: ["All", "High", "Medium", "Low"] },
                { label: "Hosting", val: hosting, set: setHosting, opts: ["All", "AWS", "GCP", "Citrix", "On-Prem", "Liquid Web"] },
                { label: "Owner", val: owner, set: setOwner, opts: ["All", "Platform Engineering", "Product Engineering"] },
              ].map(f => (
                <Select key={f.label} value={f.val} onValueChange={f.set}>
                  <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder={f.label}>{f.label}: {f.val}</SelectValue></SelectTrigger>
                  <SelectContent>{f.opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              ))}
              <div className="ml-auto flex items-center gap-1 border rounded-md p-0.5">
                <button onClick={() => setView("grid")} className={cn("h-7 w-7 grid place-items-center rounded", view === "grid" ? "bg-slate-100" : "")}>
                  <LayoutGrid className="h-3.5 w-3.5 text-slate-600" />
                </button>
                <button onClick={() => setView("table")} className={cn("h-7 w-7 grid place-items-center rounded", view === "table" ? "bg-slate-100" : "")}>
                  <Rows3 className="h-3.5 w-3.5 text-slate-600" />
                </button>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-blue-200 text-blue-700">
                <Network className="h-3.5 w-3.5" /> Map View
              </Button>
            </div>

            {/* Product family map */}
            {view === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} active={selected?.id === p.id} onClick={() => openProduct(p)} />
                ))}
              </div>
            ) : (
              <ProductTable products={filtered} onSelect={openProduct} activeId={selected?.id} />
            )}

            {/* Executive Insights */}
            <div className="mt-6 bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-slate-800 text-sm">Executive Insights</div>
                <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">View All Insights <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <InsightCard icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-600" />} title="Top Risks" value="4" sub="Products at risk"
                  series={[3, 4, 2, 5, 4, 6, 4, 3, 4]} tone="rose"
                  onClick={() => openKpi("Top Risks", "Risk register: SAM (High vuln), Generations (no DR), Provider Pro (Citrix exit), HHA (DB modernization).")} />
                <InsightCard icon={<Sparkles className="h-3.5 w-3.5 text-emerald-600" />} title="Top Opportunities" value="6" sub="High impact items"
                  series={[2, 3, 4, 4, 5, 5, 6, 6, 6]} tone="emerald"
                  onClick={() => openKpi("Top Opportunities", "Modernization opportunities: Pavilio GA, Ankasan absorb, HHA containerization, Citrix exit, IaC rollout, golden image.")} />
                <InsightCard icon={<Activity className="h-3.5 w-3.5 text-blue-600" />} title="Automation Progress" value="41%" sub="+7% vs last month"
                  series={[28, 30, 32, 34, 36, 38, 40, 41]} tone="blue"
                  onClick={() => openKpi("Automation Progress", "Weighted automation coverage across runbooks, IaC and AI-assisted ops.")} />
                <InsightCard icon={<TrendingUp className="h-3.5 w-3.5 text-violet-600" />} title="Modernization Progress" value="48%" sub="+6% vs last month"
                  series={[35, 38, 40, 42, 44, 45, 47, 48]} tone="violet"
                  onClick={() => openKpi("Modernization Progress", "Weighted modernization completion across the portfolio.")} />
                <InsightCard icon={<CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />} title="Operating Health Trend" value="82" sub="+5 pts vs last month"
                  series={[74, 76, 77, 78, 79, 80, 81, 82]} tone="teal"
                  onClick={() => openKpi("Operating Health Trend", "Portfolio operating health composite trend over the past 8 months.")} />
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Last updated: Jun 14, 2026 8:30 AM ET</span>
              <span className="flex items-center gap-1">Source: HHAX Digital Twin <Info className="h-3 w-3" /></span>
            </div>
          </main>

          {/* Right detail drawer */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen} modal={false}>
            <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto">
              {drawerKind === "product" && selected && <ProductDrawer product={selected} />}
              {drawerKind === "kpi" && kpiContext && (
                <div className="p-6">
                  <SheetHeader><SheetTitle>{kpiContext.title}</SheetTitle></SheetHeader>
                  <p className="text-sm text-slate-600 mt-4">{kpiContext.body}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {PRODUCTS.slice(0, 4).map(p => (
                      <button key={p.id} onClick={() => openProduct(p)}
                        className="text-left text-xs p-2 rounded-md border hover:bg-slate-50">
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-slate-500">Health {p.health} · {p.criticality}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------------- Sub-components ---------------- */

function ProductCard({ product: p, active, onClick }: { product: Product; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn(
        "text-left bg-white border rounded-xl p-4 transition-all group",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-400 hover:ring-2 hover:ring-blue-100",
        active && "border-blue-500 ring-2 ring-blue-100 shadow-md",
      )}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-slate-900">{p.name}</div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium border", lifecycleTone[p.lifecycle])}>
            {p.lifecycle}
          </Badge>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2 min-h-[32px]">{p.description}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-600">
        {p.hosting.map((h, i) => (
          <span key={i} className="flex items-center gap-1"><HostingIcon k={h.icon} />{h.label}</span>
        ))}
        {p.tech.map((t, i) => (
          <span key={i} className="flex items-center gap-1"><HostingIcon k={t.icon} />{t.label}</span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="text-slate-500 mb-0.5">Criticality</div>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", critDot[p.criticality])} />
            <span className={cn("font-medium", critTone[p.criticality])}>{p.criticality}</span>
          </div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">SLO Maturity</div>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full",
              p.sloMaturity === "Measured" ? "bg-emerald-500" :
              p.sloMaturity === "Draft" ? "bg-sky-500" :
              p.sloMaturity === "Enforced" ? "bg-blue-500" : "bg-slate-300")} />
            <span className="font-medium text-slate-700">{p.sloMaturity}</span>
          </div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">Health Score</div>
          <div className="flex items-center gap-1.5">
            <span className={cn("font-semibold", healthRing(p.health))}>{p.health}</span>
            <HealthRing value={p.health} />
          </div>
        </div>
      </div>
    </button>
  );
}

function HealthRing({ value }: { value: number }) {
  const color = value >= 80 ? "#059669" : value >= 65 ? "#d97706" : "#dc2626";
  const r = 7, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="-mr-0.5">
      <circle cx="9" cy="9" r={r} stroke="#e5e7eb" strokeWidth="2" fill="none" />
      <circle cx="9" cy="9" r={r} stroke={color} strokeWidth="2" fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 9 9)" />
    </svg>
  );
}

function InsightCard({ icon, title, value, sub, series, tone, onClick }:
  { icon: React.ReactNode; title: string; value: string; sub: string; series: number[]; tone: "rose" | "emerald" | "blue" | "violet" | "teal"; onClick: () => void }) {
  const stroke = { rose: "#e11d48", emerald: "#059669", blue: "#2563eb", violet: "#7c3aed", teal: "#0d9488" }[tone];
  const data = series.map((v, i) => ({ i, v }));
  return (
    <button onClick={onClick} className="text-left p-3 rounded-lg border hover:border-blue-300 hover:bg-slate-50 transition">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">{icon}{title}</div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-slate-900">{value}</div>
          <div className={cn("text-[10px]", sub.includes("+") ? "text-emerald-600" : "text-slate-500")}>{sub}</div>
        </div>
        <div className="h-8 w-20">
          <ResponsiveContainer>
            {tone === "rose" || tone === "emerald" ? (
              <BarChart data={data}><Bar dataKey="v" fill={stroke} radius={1} /></BarChart>
            ) : (
              <LineChart data={data}><Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} dot={false} /></LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </button>
  );
}

function ProductTable({ products, onSelect, activeId }: { products: Product[]; onSelect: (p: Product) => void; activeId?: string }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
          <tr>
            {["Product", "Lifecycle", "Hosting", "Criticality", "SLO Maturity", "Health", "Owner"].map(h => (
              <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} onClick={() => onSelect(p)}
              className={cn("border-t hover:bg-slate-50 cursor-pointer", activeId === p.id && "bg-blue-50/40")}>
              <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
              <td className="px-3 py-2"><Badge variant="outline" className={cn("text-[10px] border", lifecycleTone[p.lifecycle])}>{p.lifecycle}</Badge></td>
              <td className="px-3 py-2 text-xs text-slate-600">{p.hosting.map(h => h.label).join(", ")}</td>
              <td className={cn("px-3 py-2 text-xs font-medium", critTone[p.criticality])}>{p.criticality}</td>
              <td className="px-3 py-2 text-xs text-slate-600">{p.sloMaturity}</td>
              <td className={cn("px-3 py-2 text-xs font-semibold", healthRing(p.health))}>{p.health}</td>
              <td className="px-3 py-2 text-xs text-slate-600">{p.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductDrawer({ product: p }: { product: Product }) {
  const trend = p.trend.map((v, i) => ({ i, v }));
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">{p.name}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] border", lifecycleTone[p.lifecycle])}>{p.lifecycle}</Badge>
            <Badge variant="outline" className={cn("text-[10px] border",
              p.criticality === "High" ? "bg-rose-50 text-rose-700 border-rose-200" :
              p.criticality === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
              "bg-emerald-50 text-emerald-700 border-emerald-200")}>{p.criticality} Criticality</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          {["overview", "architecture", "dependencies", "cyber", "modernization", "ownership"].map(t => (
            <TabsTrigger key={t} value={t}
              className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-3 py-2 text-xs">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-3">
          <DrawerRow icon={<ShieldAlert className="h-4 w-4 text-slate-500" />} label="Business Criticality">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", critDot[p.criticality])} />
              <span className={cn("font-medium text-sm", critTone[p.criticality])}>{p.criticality}</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              {p.revenueImpact}. {p.caregiverImpact}. {p.stateSla}. {p.reputation}. {p.phi}.
            </div>
          </DrawerRow>
          <DrawerRow icon={<Cloud className="h-4 w-4 text-slate-500" />} label="Hosting Posture">
            {p.hosting.map((h, i) => <div key={i} className="text-sm text-slate-800">{h.label}</div>)}
            {p.tech.map((t, i) => <div key={i} className="text-xs text-slate-600">{t.label}</div>)}
          </DrawerRow>
          <DrawerRow icon={<Package className="h-4 w-4 text-slate-500" />} label="Lifecycle Tag">
            <Badge variant="outline" className={cn("text-[10px] border", lifecycleTone[p.lifecycle])}>{p.lifecycle}</Badge>
          </DrawerRow>
          <DrawerRow icon={<Activity className="h-4 w-4 text-slate-500" />} label="Current Support Posture">
            <div className="text-sm text-slate-800">{p.support}</div>
            <div className="text-xs text-slate-500">Supported by shared SRE</div>
          </DrawerRow>
          <DrawerRow icon={<TrendingUp className="h-4 w-4 text-slate-500" />} label="SLO Maturity">
            <div className="text-sm text-slate-800">{p.sloMaturity}</div>
            <div className="text-xs text-slate-500">3 SLOs defined and monitored</div>
          </DrawerRow>
          <DrawerRow icon={<Sparkles className="h-4 w-4 text-slate-500" />} label="Automation Readiness">
            <div className="text-sm text-slate-800">{p.automation.label}</div>
            <div className="text-xs text-slate-500">{p.automation.detail}</div>
          </DrawerRow>
          <DrawerRow icon={<CheckCircle2 className="h-4 w-4 text-slate-500" />} label="Cyber Posture">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn("h-1.5 w-1.5 rounded-full",
                p.cyber.tone === "good" ? "bg-emerald-500" : p.cyber.tone === "warn" ? "bg-amber-500" : "bg-rose-500")} />
              <span className={cn("text-sm font-medium",
                p.cyber.tone === "good" ? "text-emerald-700" : p.cyber.tone === "warn" ? "text-amber-700" : "text-rose-700")}>
                {p.cyber.tone === "good" ? "Good" : p.cyber.tone === "warn" ? "Warn" : "At Risk"}
              </span>
            </div>
            <ul className="text-xs text-slate-600 space-y-0.5">
              <li>Patch: {p.patch}% current</li>
              <li>EDR: {p.edr ? "Enabled" : "Missing"}</li>
              <li>Identity: {p.identity}</li>
              <li>FW/SG: {p.fwSg}</li>
              <li>Backup: {p.backup}</li>
              <li>DR: {p.dr}</li>
              <li>Vuln Exposure: <span className={cn(
                p.vuln === "High" ? "text-rose-600" : p.vuln === "Medium" ? "text-amber-600" : "text-emerald-600")}>{p.vuln}</span></li>
            </ul>
          </DrawerRow>
          <DrawerRow icon={<Layers className="h-4 w-4 text-slate-500" />} label="Modernization Backlog">
            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
              {p.backlog.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">{p.initiatives} Initiatives</span>
              <button className="text-blue-600 hover:underline">View Backlog</button>
            </div>
          </DrawerRow>
        </TabsContent>

        <TabsContent value="architecture" className="mt-4">
          <div className="text-xs text-slate-500 mb-2">8-month health trend</div>
          <div className="h-32 mb-4">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            {p.hosting.map((h, i) => <div key={i} className="p-2 border rounded-md flex items-center gap-2"><HostingIcon k={h.icon} /><span className="font-medium">{h.label}</span></div>)}
            {p.tech.map((t, i) => <div key={i} className="p-2 border rounded-md flex items-center gap-2"><HostingIcon k={t.icon} /><span className="font-medium">{t.label}</span></div>)}
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4 space-y-2">
          {["Okta SSO", "Shared SRE Toolchain", "Snowflake DW", "Datadog Telemetry", "GitHub Enterprise"].map(d => (
            <div key={d} className="p-2 border rounded-md text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <span className="font-medium text-slate-800">{d}</span>
              <Badge variant="outline" className="text-[10px]">Healthy</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="cyber" className="mt-4 space-y-2 text-xs">
          {[
            ["Patch Compliance", `${p.patch}%`], ["EDR", p.edr ? "Enabled" : "Missing"],
            ["Identity Controls", p.identity], ["Firewall / SG", p.fwSg],
            ["Backup", p.backup], ["DR", p.dr], ["Vulnerability Exposure", p.vuln],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-slate-600">{k}</span><span className="font-medium text-slate-800">{v as string}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="modernization" className="mt-4">
          <ul className="text-xs text-slate-700 space-y-2">
            {p.backlog.map((b, i) => (
              <li key={i} className="p-2 border rounded-md flex items-start gap-2 hover:bg-slate-50">
                <Circle className="h-3 w-3 mt-0.5 text-blue-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="ownership" className="mt-4 space-y-2 text-xs">
          {[["Service Owner", p.owner], ["Support Posture", p.support], ["On-Call Rotation", "24x7 — Pager Tier 1"], ["Architecture Council", "Reviewed Q1 2026"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-slate-600">{k}</span><span className="font-medium text-slate-800">{v}</span>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Button className="w-full mt-5 bg-blue-600 hover:bg-blue-700">View Full Details</Button>
    </div>
  );
}

function DrawerRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2 border-b last:border-0">
      <div className="flex items-start gap-2 text-xs text-slate-600 font-medium pt-0.5">{icon}{label}</div>
      <div>{children}</div>
    </div>
  );
}
