import { AppShell } from "@/components/eoc/AppShell";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

/* ---------- Top strategic KPIs ---------- */

type Trend = "up" | "down" | "flat";
type StratKpi = {
  num: string;
  title: string;
  value: string;
  sub: string;
  delta: string;
  trend: Trend;
  color: string; // hsl color for sparkline + accent
  badgeBg: string; // tailwind bg class for number chip
  badgeText: string; // tailwind text class for number chip
};

const stratKpis: StratKpi[] = [
  { num: "01", title: "Business Service Availability", value: "99.982%", sub: "SLA 99.95%", delta: "▲ 0.21% better", trend: "up", color: "hsl(142 71% 45%)", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700" },
  { num: "02", title: "SLA / SLO Attainment", value: "96.4%", sub: "All managed services", delta: "▲ 2.7% better", trend: "up", color: "hsl(217 91% 60%)", badgeBg: "bg-blue-50", badgeText: "text-blue-700" },
  { num: "03", title: "Critical Incident Reduction", value: "47%", sub: "Rolling 30 days", delta: "▼ fewer P1 and P2", trend: "down", color: "hsl(0 84% 60%)", badgeBg: "bg-rose-50", badgeText: "text-rose-700" },
  { num: "04", title: "Mean Time to Restore", value: "31m", sub: "Target under 45m", delta: "▼ 31% faster", trend: "down", color: "hsl(217 91% 60%)", badgeBg: "bg-blue-50", badgeText: "text-blue-700" },
  { num: "05", title: "Change Success Rate", value: "92.1%", sub: "Production changes", delta: "▲ 4.3% better", trend: "up", color: "hsl(173 80% 40%)", badgeBg: "bg-teal-50", badgeText: "text-teal-700" },
  { num: "06", title: "Operational Risk Reduction", value: "18%", sub: "Score 28 of 100", delta: "▼ lower exposure", trend: "down", color: "hsl(25 95% 53%)", badgeBg: "bg-orange-50", badgeText: "text-orange-700" },
  { num: "07", title: "Cyber Exposure Reduction", value: "63%", sub: "Critical exposure", delta: "▲ 23% better", trend: "up", color: "hsl(217 91% 60%)", badgeBg: "bg-blue-50", badgeText: "text-blue-700" },
  { num: "08", title: "Automation Coverage", value: "72%", sub: "Eligible workflows", delta: "▲ 14% better", trend: "up", color: "hsl(258 90% 66%)", badgeBg: "bg-violet-50", badgeText: "text-violet-700" },
  { num: "09", title: "Value Realized", value: "$4.2M", sub: "Cost, risk, productivity", delta: "▲ 23% better", trend: "up", color: "hsl(142 71% 45%)", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700" },
  { num: "10", title: "Experience Score", value: "4.6/5", sub: "Users and owners", delta: "▲ 0.4 better", trend: "up", color: "hsl(217 91% 60%)", badgeBg: "bg-blue-50", badgeText: "text-blue-700" },
];

function spark(seed: number) {
  return Array.from({ length: 20 }, (_, i) => ({
    y: 50 + Math.sin(i / 2 + seed) * 8 + Math.cos(i / 3 + seed * 1.3) * 6 + (i % 5),
  }));
}

function StratCard({ k, i }: { k: StratKpi; i: number }) {
  const data = spark(i);
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", k.badgeBg, k.badgeText)}>{k.num}</span>
        <span className="text-[11px] font-semibold text-foreground leading-tight">{k.title}</span>
      </div>
      <div className="text-[22px] font-bold tracking-tight leading-none mt-1">{k.value}</div>
      <div className="text-[10px] text-muted-foreground">{k.sub}</div>
      <div className="text-[10px] font-medium" style={{ color: k.color }}>{k.delta}</div>
      <div className="h-7 -mx-1 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`ps-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={k.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={k.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke={k.color} strokeWidth={1.6} fill={`url(#ps-${i})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- Domain scorecards ---------- */

type Metric = { label: string; value: string; delta?: string; deltaTone?: "up" | "down" | "neutral" | "healthy" };
type Domain = {
  num: string;
  title: string;
  accent: string; // top bar color
  badgeBg: string;
  badgeText: string;
  bigValue: string;
  bigLabel: string;
  ringColor: string;
  ringPct: number; // 0-100
  metrics: Metric[];
};

const domains: Domain[] = [
  {
    num: "01", title: "RunOps AIOps Agentic Agents",
    accent: "bg-violet-500", badgeBg: "bg-violet-100", badgeText: "text-violet-700",
    bigValue: "92%", bigLabel: "Governed Autonomy Score",
    ringColor: "hsl(258 90% 66%)", ringPct: 92,
    metrics: [
      { label: "Autonomous Resolution Rate", value: "62%", delta: "▲ 12%", deltaTone: "up" },
      { label: "Human Approval Compliance", value: "100%", delta: "✓", deltaTone: "healthy" },
      { label: "Agent Accuracy", value: "94%", delta: "▲ 6%", deltaTone: "up" },
      { label: "Hours Returned", value: "8,450", delta: "YTD", deltaTone: "neutral" },
    ],
  },
  {
    num: "02", title: "Infrastructure and Hybrid Platform Operations",
    accent: "bg-blue-500", badgeBg: "bg-blue-100", badgeText: "text-blue-700",
    bigValue: "99.97%", bigLabel: "Critical Platform Availability",
    ringColor: "hsl(217 91% 60%)", ringPct: 99,
    metrics: [
      { label: "Capacity Risk Avoided", value: "87%", delta: "▲ 21%", deltaTone: "up" },
      { label: "Backup Recovery Assurance", value: "99.6%", delta: "▲ 1.3%", deltaTone: "up" },
      { label: "Configuration Drift", value: "2.1%", delta: "▼ 40%", deltaTone: "down" },
      { label: "Tech Debt Reduction", value: "18%", delta: "YTD", deltaTone: "neutral" },
    ],
  },
  {
    num: "03", title: "Cloud and Multicloud Operations",
    accent: "bg-emerald-500", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700",
    bigValue: "$1.28M", bigLabel: "Optimization Realized",
    ringColor: "hsl(142 71% 45%)", ringPct: 80,
    metrics: [
      { label: "Critical Workload Availability", value: "99.95%", delta: "▲ 0.2%", deltaTone: "up" },
      { label: "Policy Compliance", value: "97%", delta: "▲ 4%", deltaTone: "up" },
      { label: "Waste Reduction", value: "31%", delta: "▲ 9%", deltaTone: "up" },
      { label: "Spend Forecast Accuracy", value: "94%", delta: "▲ 5%", deltaTone: "up" },
    ],
  },
  {
    num: "04", title: "Cybersecurity and Zero Trust Operations",
    accent: "bg-rose-500", badgeBg: "bg-rose-100", badgeText: "text-rose-700",
    bigValue: "63%", bigLabel: "Critical Exposure Reduced",
    ringColor: "hsl(0 84% 60%)", ringPct: 63,
    metrics: [
      { label: "Critical Exposure SLA", value: "92%", delta: "▲ 8%", deltaTone: "up" },
      { label: "Identity Control Coverage", value: "98%", delta: "▲ 3%", deltaTone: "up" },
      { label: "Patch Compliance", value: "96%", delta: "▲ 5%", deltaTone: "up" },
      { label: "Mean Time to Contain", value: "22m", delta: "▼ 18%", deltaTone: "down" },
    ],
  },
  {
    num: "05", title: "Observability and Resilience Engineering",
    accent: "bg-teal-500", badgeBg: "bg-teal-100", badgeText: "text-teal-700",
    bigValue: "96%", bigLabel: "SLO Attainment",
    ringColor: "hsl(173 80% 40%)", ringPct: 96,
    metrics: [
      { label: "Error Budget Remaining", value: "72%", delta: "Healthy", deltaTone: "healthy" },
      { label: "Mean Time to Detect", value: "3m", delta: "▼ 25%", deltaTone: "down" },
      { label: "Incident Correlation Accuracy", value: "92%", delta: "▲ 10%", deltaTone: "up" },
      { label: "Alert Noise Reduction", value: "76%", delta: "▲ 15%", deltaTone: "up" },
    ],
  },
  {
    num: "06", title: "Network and Site Connectivity Operations",
    accent: "bg-orange-500", badgeBg: "bg-orange-100", badgeText: "text-orange-700",
    bigValue: "99.98%", bigLabel: "Site Connectivity Availability",
    ringColor: "hsl(25 95% 53%)", ringPct: 99,
    metrics: [
      { label: "Critical App Path Health", value: "95%", delta: "▲ 6%", deltaTone: "up" },
      { label: "Latency SLA Attainment", value: "97%", delta: "▲ 4%", deltaTone: "up" },
      { label: "Packet Loss", value: "0.02%", delta: "Healthy", deltaTone: "healthy" },
      { label: "Change Success Rate", value: "94%", delta: "▲ 5%", deltaTone: "up" },
    ],
  },
  {
    num: "07", title: "Digital Workplace and EUC Services",
    accent: "bg-sky-500", badgeBg: "bg-sky-100", badgeText: "text-sky-700",
    bigValue: "4.6/5", bigLabel: "Digital Experience Score",
    ringColor: "hsl(199 89% 48%)", ringPct: 92,
    metrics: [
      { label: "Endpoint Compliance", value: "98.7%", delta: "▲ 1.2%", deltaTone: "up" },
      { label: "Provisioning SLA", value: "1.2 days", delta: "▼ 27%", deltaTone: "down" },
      { label: "Collaboration Health", value: "99.9%", delta: "Healthy", deltaTone: "healthy" },
      { label: "Workforce Friction Reduced", value: "27%", delta: "▲ 8%", deltaTone: "up" },
    ],
  },
  {
    num: "08", title: "Data Integration and Interoperability Operations",
    accent: "bg-cyan-500", badgeBg: "bg-cyan-100", badgeText: "text-cyan-700",
    bigValue: "99.3%", bigLabel: "Business Flow Reliability",
    ringColor: "hsl(189 94% 43%)", ringPct: 99,
    metrics: [
      { label: "Data Freshness SLA", value: "98%", delta: "▲ 3%", deltaTone: "up" },
      { label: "Data Quality Score", value: "96%", delta: "▲ 2%", deltaTone: "up" },
      { label: "Interface Success Rate", value: "99.3%", delta: "▲ 1.4%", deltaTone: "up" },
      { label: "Failed Message Recovery", value: "18m", delta: "▼ 25%", deltaTone: "down" },
    ],
  },
  {
    num: "09", title: "IT Service Desk and ITSM Operations",
    accent: "bg-violet-500", badgeBg: "bg-violet-100", badgeText: "text-violet-700",
    bigValue: "96.2%", bigLabel: "Priority SLA Achievement",
    ringColor: "hsl(258 90% 66%)", ringPct: 96,
    metrics: [
      { label: "First Contact Resolution", value: "78%", delta: "▲ 6%", deltaTone: "up" },
      { label: "Mean Time to Resolve", value: "24m", delta: "▼ 18%", deltaTone: "down" },
      { label: "Productivity Restored", value: "12,400 hrs", delta: "YTD", deltaTone: "neutral" },
      { label: "Experience Score", value: "4.6/5", delta: "▲ 0.3", deltaTone: "up" },
    ],
  },
  {
    num: "10", title: "EHR and Clinical Application Operations",
    accent: "bg-orange-500", badgeBg: "bg-orange-100", badgeText: "text-orange-700",
    bigValue: "99.95%", bigLabel: "Clinical System Availability",
    ringColor: "hsl(25 95% 53%)", ringPct: 99,
    metrics: [
      { label: "Clinical Workflow Score", value: "4.4/5", delta: "▲ 0.3", deltaTone: "up" },
      { label: "Orders Success Rate", value: "99.3%", delta: "▲ 1.1%", deltaTone: "up" },
      { label: "Clinical Downtime", value: "12m", delta: "▼ 45%", deltaTone: "down" },
      { label: "Clinician Experience", value: "4.7/5", delta: "▲ 0.5", deltaTone: "up" },
    ],
  },
];

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} stroke="hsl(var(--muted))" strokeWidth="5" fill="none" />
      <circle
        cx="28" cy="28" r={r}
        stroke={color}
        strokeWidth="5" fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 28 28)"
      />
    </svg>
  );
}

function deltaClass(t?: Metric["deltaTone"]) {
  switch (t) {
    case "up": return "text-emerald-600";
    case "down": return "text-emerald-600"; // a "down" arrow on a bad metric is still good
    case "healthy": return "text-emerald-600";
    default: return "text-muted-foreground";
  }
}

function DomainCard({ d }: { d: Domain }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className={cn("h-1", d.accent)} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", d.badgeBg, d.badgeText)}>{d.num}</span>
          <h3 className="text-[13px] font-semibold leading-tight">{d.title}</h3>
        </div>
        <div className="flex items-center justify-between gap-3 bg-muted/30 rounded-lg px-3 py-2">
          <div className="min-w-0">
            <div className="text-[22px] font-bold tracking-tight leading-none">{d.bigValue}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{d.bigLabel}</div>
          </div>
          <Ring pct={d.ringPct} color={d.ringColor} />
        </div>
        <div className="space-y-1.5 pt-1">
          {d.metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between text-[11.5px]">
              <span className="text-muted-foreground truncate pr-2">{m.label}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-semibold tabular-nums">{m.value}</span>
                {m.delta && (
                  <span className={cn("text-[10.5px] font-medium", deltaClass(m.deltaTone))}>{m.delta}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function PracticeLibrary() {
  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 overflow-auto animate-fade-in bg-muted/30">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-5">
            <div className="text-2xl font-bold tracking-tight text-indigo border-b-2 border-indigo pb-1">
              neuGAIN
            </div>
            <div>
              <h1 className="text-[26px] font-bold tracking-tight leading-tight">RunOps Executive Dashboard</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                C Suite MSP view, service outcomes, risk reduction, automation value
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs font-medium border border-border rounded-full px-3 py-1.5 bg-card hover:bg-muted">
              Monthly Executive View
            </button>
            <button className="text-xs font-medium border border-border rounded-full px-3 py-1.5 bg-card hover:bg-muted">
              Filters
            </button>
          </div>
        </header>

        {/* Strategic KPI section */}
        <section className="rounded-2xl border border-border bg-card p-4 mb-5">
          <h2 className="text-sm font-bold text-indigo">Strategic KPI and SLA Overview</h2>
          <p className="text-[11px] text-muted-foreground mb-3">
            The measures a C Suite buyer uses to judge MSP performance, business protection, value, experience, and modernization momentum
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10 gap-2.5">
            {stratKpis.map((k, i) => <StratCard key={k.num} k={k} i={i} />)}
          </div>
        </section>

        {/* Domain scorecards */}
        <section className="mb-4">
          <h2 className="text-base font-bold">RunOps Tech Domain KPI and SLA Scorecards</h2>
          <p className="text-[11px] text-muted-foreground mb-3">
            Each card shows executive health, the primary SLA or KPI, and the outcome measures that matter most to service consumers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {domains.map((d) => <DomainCard key={d.num} d={d} />)}
          </div>
        </section>

        {/* Footer signal */}
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs flex items-start justify-between gap-4">
          <div>
            <span className="font-bold text-indigo">Executive Signal </span>
            <span className="text-muted-foreground">
              Dashboard is organized around service health, risk, experience, value and governed automation, not ticket queues or infrastructure noise
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
            Illustrative KPI values for NeuGAIN landing page design
          </span>
        </div>
      </main>
    </AppShell>
  );
}