import { AppShell } from "@/components/eoc/AppShell";
import {
  BookOpen, Layers, Users, Target, Search, Bell, HelpCircle, Filter,
  LayoutGrid, List, ChevronRight, Monitor, ShieldCheck, Laptop, Network,
  Cloud, Crosshair, ClipboardCheck, Database, Code2, ShieldAlert,
  UserCog, BarChart3, Check, RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  num: string;
  label: string;
  sub: string;
  Icon: typeof BookOpen;
  iconBg: string;
  iconText: string;
  numText: string;
};

const stats: Stat[] = [
  { num: "12", label: "Practice Areas", sub: "End-to-end coverage", Icon: BookOpen, iconBg: "bg-blue-100", iconText: "text-blue-600", numText: "text-blue-600" },
  { num: "72+", label: "Capabilities", sub: "Across all practices", Icon: Layers, iconBg: "bg-emerald-100", iconText: "text-emerald-600", numText: "text-emerald-600" },
  { num: "200+", label: "Processes", sub: "Standardized & repeatable", Icon: Users, iconBg: "bg-violet-100", iconText: "text-violet-600", numText: "text-violet-600" },
  { num: "1", label: "Unified Goal", sub: "Run secure. Run reliable. Run resilient.", Icon: Target, iconBg: "bg-orange-100", iconText: "text-orange-600", numText: "text-orange-600" },
];

type Practice = {
  num: string;
  title: string;
  desc: string;
  Icon: typeof Monitor;
  numBg: string;
  numText: string;
  iconBg: string;
  iconText: string;
};

const practices: Practice[] = [
  { num: "01", title: "IT Infrastructure & Operations Management", desc: "Monitoring, capacity, change, asset and configuration management.", Icon: Monitor, numBg: "bg-blue-600", numText: "text-white", iconBg: "bg-blue-50", iconText: "text-blue-600" },
  { num: "02", title: "Security Operations Center (SOC) & Threat Detection", desc: "SIEM, SOAR, threat hunting, incident detection and threat intelligence.", Icon: ShieldCheck, numBg: "bg-blue-600", numText: "text-white", iconBg: "bg-blue-50", iconText: "text-blue-600" },
  { num: "03", title: "Endpoint Security & Modern Device Protection", desc: "EDR/XDR, AV, mobile security, compliance and device posture.", Icon: Laptop, numBg: "bg-teal-500", numText: "text-white", iconBg: "bg-teal-50", iconText: "text-teal-600" },
  { num: "04", title: "Network Security & Zero Trust Segmentation", desc: "Secure networks with zero trust, segmentation and access controls.", Icon: Network, numBg: "bg-emerald-600", numText: "text-white", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  { num: "05", title: "Cloud Security & CNAPP", desc: "Secure cloud and containers across multicloud environments.", Icon: Cloud, numBg: "bg-violet-600", numText: "text-white", iconBg: "bg-violet-50", iconText: "text-violet-600" },
  { num: "06", title: "Vulnerability Management & Exposure Management", desc: "Identify, prioritize and remediate vulnerabilities and exposures.", Icon: Crosshair, numBg: "bg-orange-500", numText: "text-white", iconBg: "bg-orange-50", iconText: "text-orange-600" },
  { num: "07", title: "Governance, Risk & Compliance (GRC)", desc: "Compliance, policy, risk, audit readiness and third-party risk management.", Icon: ClipboardCheck, numBg: "bg-orange-500", numText: "text-white", iconBg: "bg-orange-50", iconText: "text-orange-600" },
  { num: "08", title: "Data Security & Privacy Protection", desc: "Protect data across its lifecycle with privacy and governance.", Icon: Database, numBg: "bg-violet-600", numText: "text-white", iconBg: "bg-violet-50", iconText: "text-violet-600" },
  { num: "09", title: "Application & DevSecOps Security", desc: "Secure applications and pipelines with DevSecOps best practices.", Icon: Code2, numBg: "bg-teal-500", numText: "text-white", iconBg: "bg-teal-50", iconText: "text-teal-600" },
  { num: "10", title: "Cyber Resilience, Incident Response & Recovery", desc: "Respond, recover and build resilience against disruptions and attacks.", Icon: ShieldAlert, numBg: "bg-blue-600", numText: "text-white", iconBg: "bg-blue-50", iconText: "text-blue-600" },
  { num: "11", title: "IT Service Management & Experience", desc: "Deliver reliable services with great user experiences.", Icon: UserCog, numBg: "bg-emerald-600", numText: "text-white", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  { num: "12", title: "RunOps Strategy, Analytics & Continuous Improvement", desc: "Measure, analyze and improve performance continuously.", Icon: BarChart3, numBg: "bg-slate-700", numText: "text-white", iconBg: "bg-slate-100", iconText: "text-slate-700" },
];

const pillars = [
  { title: "One Unified Goal", desc: "Run secure. Run reliable. Run resilient.", Icon: ShieldCheck, color: "text-blue-600" },
  { title: "Secure by Design", desc: "Security embedded in every layer of operations.", Icon: ShieldCheck, color: "text-blue-600" },
  { title: "Reliable by Default", desc: "High availability, performance and operational excellence.", Icon: Check, color: "text-blue-600" },
  { title: "Resilient by Practice", desc: "Prepared for disruptions. Built for recovery.", Icon: RefreshCcw, color: "text-blue-600" },
  { title: "Value Driven", desc: "Aligning technology, people and processes to business outcomes.", Icon: Users, color: "text-blue-600" },
];

function StatCard({ s }: { s: Stat }) {
  const Icon = s.Icon;
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
      <div className={cn("h-14 w-14 rounded-xl grid place-items-center shrink-0", s.iconBg)}>
        <Icon className={cn("h-7 w-7", s.iconText)} />
      </div>
      <div className="min-w-0">
        <div className={cn("text-3xl font-bold leading-none tracking-tight", s.numText)}>{s.num}</div>
        <div className="text-sm font-semibold mt-1.5">{s.label}</div>
        <div className="text-[11px] text-muted-foreground">{s.sub}</div>
      </div>
    </div>
  );
}

function PracticeRow({ p }: { p: Practice }) {
  const Icon = p.Icon;
  return (
    <button className="w-full text-left rounded-xl border border-border bg-card p-3.5 flex items-center gap-3.5 hover:shadow-[var(--shadow-md)] transition-shadow group">
      <div className={cn("h-11 w-11 rounded-lg grid place-items-center shrink-0 text-sm font-bold", p.numBg, p.numText)}>
        {p.num}
      </div>
      <div className={cn("h-11 w-11 rounded-lg grid place-items-center shrink-0", p.iconBg)}>
        <Icon className={cn("h-5 w-5", p.iconText)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold leading-tight">{p.title}</div>
        <div className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{p.desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

export default function TableOfContents() {
  return (
    <AppShell>
      <main className="flex-1 overflow-auto bg-muted/30 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 px-8 pt-6 pb-2">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="relative w-[360px] max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search practices, capabilities…"
                className="w-full h-9 pl-9 pr-12 rounded-full border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘ K</span>
            </div>
            <button className="relative h-9 w-9 rounded-full border border-border bg-card grid place-items-center">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center">3</span>
            </button>
            <button className="h-9 w-9 rounded-full border border-border bg-card grid place-items-center">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Heading */}
          <div className="text-xs font-semibold text-blue-600 mb-1">Practice Library</div>
          <h1 className="text-3xl font-bold tracking-tight">RunOps Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore all RunOps practice areas and capabilities to run secure, reliable and resilient operations.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {stats.map((s) => <StatCard key={s.label} s={s} />)}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mt-6 mb-4">
            <div className="flex items-center gap-3">
              <select className="h-9 rounded-lg border border-border bg-card text-sm px-3">
                <option>All Practice Areas</option>
              </select>
              <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                <button className="h-9 w-9 grid place-items-center bg-muted"><LayoutGrid className="h-4 w-4" /></button>
                <button className="h-9 w-9 grid place-items-center"><List className="h-4 w-4" /></button>
              </div>
            </div>
            <button className="h-9 rounded-full border border-border bg-card text-sm px-4 flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
          </div>

          {/* Practice grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {practices.map((p) => <PracticeRow key={p.num} p={p} />)}
          </div>

          {/* Pillars footer */}
          <div className="mt-5 rounded-xl border border-border bg-card px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {pillars.map((p) => {
              const Icon = p.Icon;
              return (
                <div key={p.title} className="flex items-start gap-2.5">
                  <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", p.color)} />
                  <div>
                    <div className="text-xs font-bold text-blue-600">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </AppShell>
  );
}