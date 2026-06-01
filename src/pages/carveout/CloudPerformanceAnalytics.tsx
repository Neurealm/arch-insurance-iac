import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { Gauge, ShieldCheck, Activity, Clock, Smile, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "Cloud DEX Score", value: "8.6/10", sub: "User experience", subColor: "text-emerald-600", icon: Smile, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "App p95 Latency", value: "184 ms", sub: "Top 50 apps", subColor: "text-emerald-600", icon: Gauge, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Apdex", value: "0.94", sub: "Cloud workloads", subColor: "text-emerald-600", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Reliability", value: "99.97%", sub: "Aggregate uptime", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Error Rate", value: "0.18%", sub: "Trending down", subColor: "text-emerald-600", icon: AlertTriangle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Saturation", value: "62%", sub: "Avg compute", subColor: "text-emerald-600", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Slow Pages", value: "32", sub: "p95 > 1s", subColor: "text-amber-600", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Trace Coverage", value: "96%", sub: "OpenTelemetry", subColor: "text-emerald-600", icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
];
const lat = Array.from({length: 24}, (_, i) => ({ h: `${i}h`, p50: 78 + Math.sin(i/3)*12, p95: 184 + Math.cos(i/4)*22, p99: 312 + Math.sin(i/2)*48 }));
const apps = [{a:"OrderHub",d:9.1},{a:"M365",d:8.8},{a:"PaymentSvc",d:8.6},{a:"PLM",d:7.4},{a:"BI",d:8.2},{a:"VideoOps",d:7.8}];
const wwh = {
  what: ["Cloud experience analytics: latency, errors, saturation","DEX scoring per app, per user","Trace coverage + slow-page hotspots"],
  why: ["Performance is the user's verdict on cloud","Carve-out can't regress experience","Hotspots = revenue + retention impact"],
  how: ["RUM + APM + OTel pipeline","DEX scoring model per persona","SLO-bound performance budgets"],
};
const outcomes: Outcome[] = [
  { icon: Smile, color: "text-emerald-600", title: "EXPERIENCE", l1: "8.6 / 10" },
  { icon: Gauge, color: "text-emerald-600", title: "LATENCY", l1: "184 ms p95" },
  { icon: Activity, color: "text-violet-600", title: "APDEX", l1: "0.94" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "RELIABILITY", l1: "99.97%" },
  { icon: AlertTriangle, color: "text-emerald-600", title: "ERRORS", l1: "0.18%" },
  { icon: Eye, color: "text-emerald-600", title: "OBSERVABILITY", l1: "96% traced" },
];

export default function CloudPerformanceAnalytics() {
  return (
    <DashShell title="CLOUD PERFORMANCE, RELIABILITY &" highlight="EXPERIENCE ANALYTICS" subtitle="What users actually feel — measured, scored, acted on." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="App Latency (24h, ms)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={lat}><XAxis dataKey="h" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} unit="ms" /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="p50" name="p50" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="p95" name="p95" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="p99" name="p99" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></Section>
          <Section title="DEX Score by App"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={apps}><XAxis dataKey="a" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} domain={[0,10]} /><Tooltip /><Bar dataKey="d" fill="hsl(262 83% 58%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Top Slow Pages"><div className="space-y-2 text-xs">{[{p:"/plm/parts/search",v:"2.4s"},{p:"/bi/dashboards/exec",v:"1.8s"},{p:"/orders/history",v:"1.4s"},{p:"/video/library",v:"1.2s"},{p:"/finance/close",v:"1.1s"}].map(r => (<div key={r.p} className="flex items-center justify-between"><span className="font-mono text-[11px] text-slate-700">{r.p}</span><span className="font-semibold text-amber-700">{r.v}</span></div>))}</div></Section>
          <Section title="Reliability Watch"><div className="space-y-1.5 text-xs">{[{a:"PLM error spike",s:"Yellow"},{a:"VideoOps cold-start",s:"Yellow"},{a:"OrderHub stable",s:"Green"},{a:"Auth steady",s:"Green"}].map(r => (<div key={r.a} className="flex items-center justify-between"><span className="text-slate-700">{r.a}</span><span className={`font-semibold ${r.s==="Yellow"?"text-amber-600":"text-emerald-600"}`}>{r.s}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}