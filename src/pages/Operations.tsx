import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/eoc/UserMenu";
import {
  Activity, Bell, Bot, ShieldCheck, MessageSquare, Maximize2, HelpCircle, History,
  Database, UserX, Gauge, Cpu, FileWarning, Filter, MoreHorizontal, Plus, Check,
  AlertCircle, Building2, Server, Globe, CreditCard, Lock, Network,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, LineChart, Line } from "recharts";

/* ---------- helpers ---------- */
const spark = (seed: number, n = 28) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: 50 + Math.sin(i / 2 + seed) * 14 + ((seed * 13 + i * 7) % 19),
  }));

function MiniSpark({ data, color }: { data: any[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={1.6} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TelemetrySpark({ data, color }: { data: any[]; color: string }) {
  const id = `g-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---------- KPI strip ---------- */
const kpis = [
  { label: "Open Alerts", value: "183", sub: "↑ 23 from last 15m", icon: Bell, color: "hsl(var(--status-critical))", tone: "critical" },
  { label: "Active Incidents", value: "12", sub: "↑ 2 from last 15m", icon: AlertCircle, color: "hsl(var(--status-warning))", tone: "warning" },
  { label: "Critical Incidents", value: "3", sub: "No change", icon: ShieldCheck, color: "hsl(var(--status-critical))", tone: "critical" },
  { label: "MTTR (7d)", value: "42m", sub: "↓ 18% vs last 7d", icon: Gauge, color: "hsl(var(--status-healthy))", tone: "healthy" },
  { label: "Recommendations", value: "24", sub: "12 Pending", icon: Cpu, color: "hsl(var(--ai))", tone: "ai" },
  { label: "Actions in Progress", value: "18", sub: "6 Automated", icon: Activity, color: "hsl(var(--indigo))", tone: "indigo" },
  { label: "Vendor Tickets", value: "37", sub: "5 Awaiting Vendor", icon: FileWarning, color: "hsl(var(--status-info))", tone: "info" },
];

const toneIconBg: Record<string, string> = {
  critical: "bg-status-critical-soft text-status-critical",
  warning: "bg-status-warning-soft text-status-warning",
  healthy: "bg-status-healthy-soft text-status-healthy",
  ai: "bg-ai-soft text-ai",
  indigo: "bg-accent text-indigo",
  info: "bg-status-info-soft text-status-info",
};

function KpiTile({ k, idx }: { k: typeof kpis[number]; idx: number }) {
  const Icon = k.icon;
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-2 shadow-[var(--shadow-sm)] card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 rounded-lg grid place-items-center ${toneIconBg[k.tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">{k.label}</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-3xl font-bold tracking-tight leading-none">{k.value}</div>
          <div className={`text-[10px] mt-1 font-medium ${
            k.sub.startsWith("↑") ? "text-status-critical" :
            k.sub.startsWith("↓") ? "text-status-healthy" : "text-muted-foreground"
          }`}>{k.sub}</div>
        </div>
        <div className="w-20"><MiniSpark data={spark(idx + 1)} color={k.color} /></div>
      </div>
    </div>
  );
}

/* ---------- Alert Queue ---------- */
const alerts = [
  { sev: "Critical", icon: AlertCircle, title: "Database Connection Failure", src: "Payment Service · AWS us-east-1", age: "2m ago" },
  { sev: "High", icon: UserX, title: "Multiple Failed Logins Detected", src: "Okta · Corporate SSO", age: "3m ago" },
  { sev: "High", icon: Activity, title: "APM Latency Threshold Breach", src: "Checkout Service · Datadog", age: "4m ago" },
  { sev: "Medium", icon: Cpu, title: "Elevated CPU Usage", src: "Web Tier · Azure VM Scale Set", age: "5m ago" },
  { sev: "Medium", icon: ShieldCheck, title: "Certificate Expiring Soon", src: "api.partnerbank.com · 7 days", age: "8m ago" },
];
const sevBadge: Record<string, string> = {
  Critical: "bg-status-critical text-white",
  High: "bg-status-warning text-white",
  Medium: "bg-status-info-soft text-status-info",
  Low: "bg-secondary text-muted-foreground",
};
const sevIcon: Record<string, string> = {
  Critical: "bg-status-critical-soft text-status-critical",
  High: "bg-status-warning-soft text-status-warning",
  Medium: "bg-status-info-soft text-status-info",
  Low: "bg-secondary text-muted-foreground",
};

function AlertQueue() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold">Alert Queue</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">View:</span>
          <button className="px-2 py-1 rounded-md border border-border font-medium">All Alerts ▾</button>
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"><Filter className="h-3.5 w-3.5 text-muted-foreground" /></button>
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-3 border-b border-border pb-2">
        {[
          { l: "All", n: 183, active: true },
          { l: "Critical", n: 23, color: "text-status-critical" },
          { l: "High", n: 67, color: "text-status-warning" },
          { l: "Medium", n: 68, color: "text-status-info" },
          { l: "Low", n: 25, color: "text-muted-foreground" },
        ].map((t) => (
          <button key={t.l} className={`px-2.5 py-1 rounded-md ${t.active ? "bg-indigo text-indigo-foreground" : "hover:bg-secondary"}`}>
            {t.l} <span className={`ml-1 ${t.active ? "" : t.color}`}>{t.n}</span>
          </button>
        ))}
      </div>
      <ul className="space-y-1.5">
        {alerts.map((a, i) => {
          const Icon = a.icon;
          return (
            <li key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/60 transition-colors">
              <span className={`h-7 w-7 rounded-md grid place-items-center ${sevIcon[a.sev]}`}><Icon className="h-3.5 w-3.5" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{a.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">{a.src}</div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sevBadge[a.sev]}`}>{a.sev}</span>
              <span className="text-[10px] text-muted-foreground w-12 text-right">{a.age}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 pt-2 border-t border-border">
        <button className="text-xs text-indigo font-semibold hover:underline">View All Alerts →</button>
      </div>
    </div>
  );
}

/* ---------- Correlation Map ---------- */
function CorrelationMap() {
  const nodes = [
    { id: "web", label: "Web App", icon: Globe, x: 50, y: 12, status: "healthy" },
    { id: "api", label: "API Gateway", icon: Network, x: 88, y: 38, status: "healthy" },
    { id: "db", label: "Customer DB", icon: Database, x: 80, y: 78, status: "healthy" },
    { id: "pay", label: "Payment Service", icon: CreditCard, x: 50, y: 92, status: "critical" },
    { id: "auth", label: "Auth Service", icon: Lock, x: 12, y: 60, status: "healthy" },
    { id: "mob", label: "Mobile App", icon: Server, x: 12, y: 30, status: "healthy" },
    { id: "third", label: "3rd Party Payment Gateway", icon: Building2, x: 50, y: 75, status: "warning" },
  ];
  const center = { x: 50, y: 50 };
  const statusColor: Record<string, string> = {
    healthy: "hsl(var(--status-healthy))",
    warning: "hsl(var(--status-warning))",
    critical: "hsl(var(--status-critical))",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Correlation Map</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">View:</span>
          <button className="px-2 py-1 rounded-md border border-border font-medium">Business Services ▾</button>
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"><Maximize2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </div>
      <div className="flex gap-3 text-[10px] mb-1">
        {[
          { l: "Critical", c: "bg-status-critical" },
          { l: "High", c: "bg-status-warning" },
          { l: "Medium", c: "bg-status-info" },
          { l: "Healthy", c: "bg-status-healthy" },
          { l: "Unknown", c: "bg-muted-foreground" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${x.c}`} /> <span className="text-muted-foreground">{x.l}</span>
          </div>
        ))}
      </div>
      <div className="relative w-full h-[340px] rounded-xl bg-gradient-to-br from-secondary/40 to-background overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {nodes.map((n) => (
            <line
              key={n.id}
              x1={center.x} y1={center.y} x2={n.x} y2={n.y}
              stroke={statusColor[n.status]}
              strokeWidth="0.25"
              strokeDasharray="1 1"
              opacity="0.55"
            />
          ))}
        </svg>

        {/* center hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo to-ai grid place-items-center text-white shadow-[var(--shadow-md)]">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="text-[10px] font-bold mt-1">Digital Banking</div>
          <div className="text-[9px] text-muted-foreground">Platform</div>
        </div>

        {nodes.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div
                className="h-9 w-9 rounded-xl bg-card border-2 grid place-items-center shadow-[var(--shadow-sm)]"
                style={{ borderColor: statusColor[n.status], color: statusColor[n.status] }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[9px] font-semibold mt-1 whitespace-nowrap">{n.label}</div>
            </div>
          );
        })}

        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <button className="h-6 w-6 rounded bg-card border border-border text-xs font-bold">+</button>
          <button className="h-6 w-6 rounded bg-card border border-border text-xs font-bold">−</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- AI Recommendations ---------- */
const recs = [
  { sev: "Critical", title: "Restart RDS instance for Payment Service", desc: "High connection failure rate detected. Restarting may restore connectivity.", impact: "High", conf: "92%", run: "DB-RST-001" },
  { sev: "High", title: "Block suspicious IP addresses", desc: "Multiple failed login attempts from 3 IPs.", impact: "Low", conf: "89%", run: "SEC-IPS-002" },
  { sev: "High", title: "Scale out Web Tier", desc: "CPU usage > 85% for 10m on 3 instances.", impact: "Medium", conf: "85%", run: "SCALE-WEB-001" },
];

function AIRecommendations() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold">AI Recommendations</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ai-soft text-ai">⚡ 24</span>
        </div>
        <span className="text-[10px] font-semibold text-status-warning bg-status-warning-soft px-2 py-0.5 rounded">12 Pending</span>
      </div>
      <div className="space-y-2.5">
        {recs.map((r, i) => (
          <div key={i} className="border border-border rounded-xl p-3 hover:border-ai/40 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sevBadge[r.sev]}`}>{r.sev}</span>
              <span className="text-xs font-bold flex-1 truncate">{r.title}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mb-2">{r.desc}</p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
              <span>Impact: <span className="font-semibold text-foreground">{r.impact}</span></span>
              <span>Confidence: <span className="font-semibold text-foreground">{r.conf}</span></span>
              <span>Runbook: <span className="font-semibold text-indigo">{r.run}</span></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <button className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-status-healthy-soft text-status-healthy hover:bg-status-healthy hover:text-white transition-colors flex items-center gap-1">
                  <Check className="h-3 w-3" /> Accept
                </button>
                <button className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-status-critical-soft text-status-critical hover:bg-status-critical hover:text-white transition-colors">
                  Reject
                </button>
              </div>
              <button className="text-[10px] text-indigo font-semibold hover:underline">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Live Telemetry ---------- */
const telemetry = [
  { label: "CPU Utilization", value: "75%", color: "hsl(var(--status-warning))" },
  { label: "Memory Utilization", value: "68%", color: "hsl(45 90% 55%)" },
  { label: "Error Rate", value: "2.8%", color: "hsl(var(--status-critical))" },
  { label: "Request Rate", value: "1.2k rps", color: "hsl(var(--status-info))" },
  { label: "Latency (p95)", value: "620 ms", color: "hsl(var(--ai))" },
];

function LiveTelemetry() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">Live Telemetry</h3>
        <span className="text-[10px] text-muted-foreground">Last 15 minutes</span>
      </div>
      <div className="space-y-3">
        {telemetry.map((t, i) => (
          <div key={t.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground">{t.label}</span>
              <span className="text-base font-bold" style={{ color: t.color }}>{t.value}</span>
            </div>
            <TelemetrySpark data={spark(20 + i)} color={t.color} />
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs text-indigo font-semibold hover:underline">View Full Telemetry →</button>
    </div>
  );
}

/* ---------- Active Incidents ---------- */
const incidents = [
  { id: "INC-10432", title: "Payment Service Connection Errors", sev: "Critical", age: "18m", svc: "Payment Service", owner: "Alex R.", initials: "AR" },
  { id: "INC-10428", title: "SSO Authentication Issues", sev: "High", age: "32m", svc: "Corporate SSO", owner: "Priya S.", initials: "PS" },
  { id: "INC-10421", title: "Checkout Errors Increased", sev: "High", age: "45m", svc: "Checkout Service", owner: "Miguel T.", initials: "MT" },
  { id: "INC-10415", title: "High Database Latency", sev: "Medium", age: "1h 12m", svc: "Customer DB", owner: "Sarah K.", initials: "SK" },
  { id: "INC-10410", title: "API Timeouts", sev: "Medium", age: "2h 05m", svc: "API Gateway", owner: "James L.", initials: "JL" },
];

function ActiveIncidents() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold">Active Incidents</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-status-critical-soft text-status-critical">12 Open</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="text-left font-semibold py-1.5">ID / Title</th>
              <th className="text-left font-semibold">Severity</th>
              <th className="text-left font-semibold">Age</th>
              <th className="text-left font-semibold">Impacted Service</th>
              <th className="text-left font-semibold">Owner</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="py-2">
                  <div className="text-[10px] font-bold text-status-critical">{i.id}</div>
                  <div className="text-xs font-medium truncate max-w-[180px]">{i.title}</div>
                </td>
                <td><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sevBadge[i.sev]}`}>{i.sev}</span></td>
                <td className="text-muted-foreground">{i.age}</td>
                <td className="text-foreground">{i.svc}</td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[8px] font-bold">{i.initials}</div>
                    <span className="text-[11px]">{i.owner}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button className="text-xs text-indigo font-semibold hover:underline">View All Incidents →</button>
        <Button size="sm" variant="outline" className="h-7 text-xs"><Plus className="h-3 w-3" /> Create Incident</Button>
      </div>
    </div>
  );
}

/* ---------- Orchestrations ---------- */
const orchestrations = [
  { name: "Restart RDS - Payment Service", status: "Running", pct: 60, by: "Auto (Coworker)" },
  { name: "Block Malicious IPs", status: "Running", pct: 40, by: "Auto (Coworker)" },
  { name: "Scale Out Web Tier", status: "Running", pct: 20, by: "Auto (Coworker)" },
  { name: "Collect Diagnostics Bundle", status: "Completed", pct: 100, by: "Operator" },
  { name: "Notify Stakeholders", status: "Completed", pct: 100, by: "Operator" },
];

function Orchestrations() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold">Orchestrations</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent text-indigo">18 In Progress</span>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="text-left font-semibold py-1.5">Name</th>
            <th className="text-left font-semibold">Status</th>
            <th className="text-left font-semibold">Progress</th>
            <th className="text-left font-semibold">Triggered By</th>
          </tr>
        </thead>
        <tbody>
          {orchestrations.map((o) => (
            <tr key={o.name} className="border-b border-border last:border-0">
              <td className="py-2 text-xs font-medium">{o.name}</td>
              <td>
                <span className={`text-[10px] font-semibold ${o.status === "Running" ? "text-status-info" : "text-status-healthy"}`}>
                  {o.status === "Completed" && "✓ "}{o.status}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[80px]">
                    <div
                      className={`h-full ${o.status === "Completed" ? "bg-status-healthy" : "bg-indigo"}`}
                      style={{ width: `${o.pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">{o.pct}%</span>
                </div>
              </td>
              <td className="text-[10px] text-muted-foreground">{o.by}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-3 text-xs text-indigo font-semibold hover:underline">View All Orchestrations →</button>
    </div>
  );
}

/* ---------- Vendor Tickets ---------- */
const vendorTickets = [
  { id: "VDR-6891", vendor: "AWS RDS Connectivity Iss...", sub: "AWS", sev: "Critical", status: "Open", age: "15m" },
  { id: "VDR-6887", vendor: "Datadog Ingestion Delay", sub: "Datadog", sev: "High", status: "In Progress", age: "45m" },
  { id: "VDR-6883", vendor: "Okta SSO Errors", sub: "Okta", sev: "High", status: "Open", age: "1h" },
  { id: "VDR-6879", vendor: "CloudFront 5xx Errors", sub: "AWS", sev: "Medium", status: "Waiting", age: "2h" },
  { id: "VDR-6872", vendor: "CrowdStrike Sensor Offline", sub: "CrowdStrike", sev: "Medium", status: "Open", age: "3h" },
];

function VendorTickets() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold">Vendor Tickets</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-status-info-soft text-status-info">37 Open</span>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="text-left font-semibold py-1.5">Ticket ID</th>
            <th className="text-left font-semibold">Vendor</th>
            <th className="text-left font-semibold">Severity</th>
            <th className="text-left font-semibold">Status</th>
            <th className="text-left font-semibold">Age</th>
          </tr>
        </thead>
        <tbody>
          {vendorTickets.map((v) => (
            <tr key={v.id} className="border-b border-border last:border-0">
              <td className="py-2 text-[10px] font-bold text-status-critical">{v.id}</td>
              <td>
                <div className="text-xs font-medium truncate max-w-[140px]">{v.vendor}</div>
                <div className="text-[10px] text-muted-foreground">{v.sub}</div>
              </td>
              <td><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sevBadge[v.sev]}`}>{v.sev}</span></td>
              <td className="text-[10px] text-muted-foreground">{v.status}</td>
              <td className="text-[10px] text-muted-foreground">{v.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-between">
        <button className="text-xs text-indigo font-semibold hover:underline">View All Vendor Tickets →</button>
        <Button size="sm" variant="outline" className="h-7 text-xs"><Plus className="h-3 w-3" /> Create Vendor Ticket</Button>
      </div>
    </div>
  );
}

/* ---------- Recent Activity ---------- */
const activity = [
  { time: "2m", title: "Alert acknowledged", desc: "Database Connection Failure", who: "by Jane Smith", color: "text-status-warning" },
  { time: "3m", title: "Recommendation accepted", desc: "Restart RDS Instance", who: "by Jane Smith", color: "text-ai" },
  { time: "5m", title: "Runbook started", desc: "DB-RST-001", who: "by Digital Coworker", color: "text-indigo" },
  { time: "7m", title: "Incident updated", desc: "INC-10432", who: "by Alex Rogers", color: "text-status-info" },
];

function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">Recent Activity</h3>
      </div>
      <ul className="space-y-3">
        {activity.map((a, i) => (
          <li key={i} className="flex gap-3">
            <div className="text-[10px] font-bold text-muted-foreground w-7 shrink-0 pt-0.5">{a.time}</div>
            <div className="relative pl-3 border-l border-border flex-1">
              <span className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-current ${a.color}`} />
              <div className="text-xs font-semibold">{a.title}</div>
              <div className="text-[11px] text-foreground">{a.desc}</div>
              <div className="text-[10px] text-muted-foreground">{a.who}</div>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-3 text-xs text-indigo font-semibold hover:underline">View Activity Feed →</button>
    </div>
  );
}

/* ---------- Footer Bar ---------- */
function FooterBar() {
  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-3 flex items-center justify-between gap-6 flex-wrap">
      <FooterStat icon={Bot} label="Coworker Mode" value="Autonomous with Guardrails" tone="indigo" />
      <FooterStat icon={Activity} label="Current Focus" value="Stabilizing Payment Service connectivity" tone="warning" />
      <FooterStat icon={Gauge} label="Next Review" value="In 15m" tone="info" />
      <FooterStat icon={ShieldCheck} label="Auto-Remediation" value="Enabled" tone="healthy" />
      <Button className="bg-indigo hover:bg-indigo/90 text-indigo-foreground font-semibold ml-auto">
        <MessageSquare className="h-4 w-4" /> Open War Room
      </Button>
    </div>
  );
}
function FooterStat({ icon: Icon, label, value, tone }: any) {
  const map: Record<string, string> = {
    indigo: "bg-accent text-indigo",
    warning: "bg-status-warning-soft text-status-warning",
    info: "bg-status-info-soft text-status-info",
    healthy: "bg-status-healthy-soft text-status-healthy",
  };
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-8 w-8 rounded-lg grid place-items-center ${map[tone]}`}><Icon className="h-4 w-4" /></span>
      <div className="leading-tight">
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
        <div className="text-xs font-bold">{value}</div>
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function HeaderPill({ icon: Icon, label, value, tone }: any) {
  const map: Record<string, string> = {
    healthy: "bg-status-healthy-soft text-status-healthy",
    indigo: "bg-accent text-indigo",
    muted: "bg-secondary text-muted-foreground",
  };
  const dot: Record<string, string> = {
    healthy: "bg-status-healthy",
    indigo: "bg-indigo",
    muted: "bg-muted-foreground",
  };
  return (
    <div className="flex items-center gap-2.5 px-3 h-10 rounded-xl border border-border bg-card">
      <span className={`h-7 w-7 rounded-md grid place-items-center ${map[tone]}`}><Icon className="h-3.5 w-3.5" /></span>
      <div className="leading-tight">
        <div className="text-[10px] text-muted-foreground font-semibold">{label}</div>
        <div className="text-xs font-bold flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />
          {value}
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
const Operations = () => {
  return (
    <AppShell>
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Operations Console</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time command center for your digital coworker</p>
          </div>
          <div className="flex items-center gap-2">
            <HeaderPill icon={ShieldCheck} label="System Health" value="Healthy" tone="healthy" />
            <HeaderPill icon={Bot} label="Coworker Status" value="Active" tone="indigo" />
            <HeaderPill icon={Activity} label="Environment" value="Production" tone="muted" />
            <Button className="bg-indigo hover:bg-indigo/90 text-indigo-foreground font-semibold h-10">
              <MessageSquare className="h-4 w-4" /> Ask Coworker
            </Button>
            <button className="h-10 w-10 rounded-full grid place-items-center hover:bg-secondary"><HelpCircle className="h-4 w-4 text-muted-foreground" /></button>
            <button className="h-10 w-10 rounded-full grid place-items-center hover:bg-secondary relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1.5 h-4 w-4 rounded-full bg-status-critical text-white text-[9px] font-bold grid place-items-center">7</span>
            </button>
            <button className="h-10 w-10 rounded-full grid place-items-center hover:bg-secondary"><History className="h-4 w-4 text-muted-foreground" /></button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <UserMenu />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs justify-end">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-status-healthy font-semibold">
            <span className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" /> Live Mode
          </div>
          <button className="px-2.5 py-1 rounded-md border border-border font-medium">Last 15 minutes ▾</button>
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"><Activity className="h-3.5 w-3.5 text-muted-foreground" /></button>
          <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"><Maximize2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
        </div>
      </header>

      <main className="flex-1 px-6 py-5 space-y-5 animate-fade-in bg-background">
        {/* KPI strip — 7 tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {kpis.map((k, i) => <KpiTile key={k.label} k={k} idx={i} />)}
        </div>

        {/* Row 1: Alerts | Map | Recommendations | Telemetry */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-3"><AlertQueue /></div>
          <div className="xl:col-span-4"><CorrelationMap /></div>
          <div className="xl:col-span-3"><AIRecommendations /></div>
          <div className="xl:col-span-2"><LiveTelemetry /></div>
        </div>

        {/* Row 2: Incidents | Orchestrations | Vendor Tickets | Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-3"><ActiveIncidents /></div>
          <div className="xl:col-span-3"><Orchestrations /></div>
          <div className="xl:col-span-3"><VendorTickets /></div>
          <div className="xl:col-span-3"><RecentActivity /></div>
        </div>

        <FooterBar />
      </main>
    </AppShell>
  );
};

export default Operations;
