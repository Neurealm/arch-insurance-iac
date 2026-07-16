import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { Activity, AlertTriangle, CheckCircle2, Zap, ShieldCheck, Clock, Bot, TrendingDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "Active Incidents", value: "6", sub: "P1: 0 · P2: 2", subColor: "text-emerald-600", icon: AlertTriangle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "MTTR", value: "42 min", sub: "P1+P2 30d", subColor: "text-emerald-600", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Auto-Remediated", value: "78%", sub: "Last 24h", subColor: "text-emerald-600", icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "SLO Burn", value: "0.8%", sub: "Healthy", subColor: "text-emerald-600", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Uptime (30d)", value: "99.97%", sub: "All-up", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Change Vol", value: "184", sub: "Last 24h", subColor: "text-emerald-600", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Change Success", value: "98.4%", sub: "First-try", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "On-Call Pages", value: "12", sub: "Last 24h · -42% wow", subColor: "text-emerald-600", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
];
const inc = Array.from({length: 14}, (_, i) => ({ d: `D-${13-i}`, p1: Math.floor(Math.random()*2), p2: 1 + Math.floor(Math.random()*4), p3: 4 + Math.floor(Math.random()*8) }));
const slo = [{s:"OrderHub",b:0.4},{s:"PaymentSvc",b:1.2},{s:"BI-API",b:0.8},{s:"PLM",b:2.1},{s:"Auth",b:0.2},{s:"VideoOps",b:1.6}];
const wwh = {
  what: ["Live ops command center for the cloud estate","Incidents, SLOs, change, on-call","Auto-remediation telemetry"],
  why: ["Cloud ops at carve-out scale needs one pane of glass","Auto-remediation is the only way to keep up","Burn budgets prevent silent regressions"],
  how: ["Datadog / Grafana / PagerDuty pipelines","SRE error-budget policy","Bot-driven auto-remediation"],
};
const outcomes: Outcome[] = [
  { icon: AlertTriangle, color: "text-emerald-600", title: "INCIDENTS", l1: "0 P1 active" },
  { icon: Clock, color: "text-emerald-600", title: "MTTR", l1: "42 min" },
  { icon: Bot, color: "text-violet-600", title: "AUTO-FIX", l1: "78%" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "UPTIME", l1: "99.97%" },
  { icon: CheckCircle2, color: "text-emerald-600", title: "CHANGE", l1: "98.4% ok" },
  { icon: TrendingDown, color: "text-emerald-600", title: "BURN", l1: "0.8%" },
];

export default function CloudOperations() {
  return (
    <DashShell title="CLOUD OPERATIONS" highlight="COMMAND CENTER (LIVE OPS)" subtitle="Live ops view of every workload, every region — with bots in the loop." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Incidents (last 14 days)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={inc}><XAxis dataKey="d" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="p1" name="P1" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="p2" name="P2" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="p3" name="P3" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></Section>
          <Section title="SLO Burn Rate by Service (% of budget)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={slo}><XAxis dataKey="s" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} unit="%" /><Tooltip /><Bar dataKey="b" fill="hsl(217 91% 60%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Live Activity Feed"><div className="space-y-2 text-xs">{[{t:"2m",a:"Bot scaled OrderHub +4 pods",s:"Green"},{t:"6m",a:"P3 closed: BI-API 5xx",s:"Green"},{t:"12m",a:"Change deployed: PaymentSvc 4.2.1",s:"Green"},{t:"24m",a:"P2 ack: PLM latency",s:"Yellow"},{t:"38m",a:"Auto-rollback: VideoOps canary",s:"Green"}].map(x => (<div key={x.t} className="flex items-center justify-between"><span className="text-slate-700">{x.t} · {x.a}</span><span className={`font-semibold ${x.s==="Yellow"?"text-amber-600":"text-emerald-600"}`}>{x.s}</span></div>))}</div></Section>
          <Section title="Top Auto-Remediations (24h)"><div className="space-y-1.5 text-xs">{[{r:"Pod auto-restart",v:248},{r:"HPA scale event",v:184},{r:"Disk cleanup",v:96},{r:"Cert auto-rotate",v:42},{r:"Failover canary",v:18}].map(r => (<div key={r.r} className="flex items-center justify-between"><span className="text-slate-700">{r.r}</span><span className="font-semibold text-violet-700">{r.v}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}