import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { ShieldCheck, Globe, Activity, Clock, AlertTriangle, RefreshCw, Database, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "DR-Ready Apps", value: "92%", sub: "Tier 0+1", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg RPO", value: "48 sec", sub: "Tier 0", subColor: "text-emerald-600", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg RTO", value: "8 min", sub: "Tier 0", subColor: "text-emerald-600", icon: RefreshCw, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Active Regions", value: "6", sub: "Multi-region pairs", subColor: "text-emerald-600", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Failover Tests", value: "84", sub: "Last 90 days", subColor: "text-emerald-600", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Test Pass Rate", value: "96%", sub: "Last 90 days", subColor: "text-emerald-600", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Replication Lag", value: "1.4 sec", sub: "p95", subColor: "text-emerald-600", icon: Database, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Open Risks", value: "3", sub: "Yellow", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
];
const tier = [{t:"Tier 0",rto:8,rpo:0.8},{t:"Tier 1",rto:32,rpo:5},{t:"Tier 2",rto:120,rpo:30},{t:"Tier 3",rto:480,rpo:240}];
const pairs = [
  { p: "us-east ↔ us-west", v: 96, fill: "hsl(142 71% 45%)" },
  { p: "eu-west ↔ eu-north", v: 92, fill: "hsl(217 91% 60%)" },
  { p: "ap-se ↔ ap-ne", v: 88, fill: "hsl(38 92% 50%)" },
  { p: "us-c ↔ us-w-2", v: 81, fill: "hsl(262 83% 58%)" },
];
const wwh = {
  what: ["DR posture for every tier in every region","RTO/RPO measured, not assumed","Failover test cadence + pass rate"],
  why: ["Carve-out DR can't be theoretical","Boards demand evidence","Regulators require it"],
  how: ["Synthetic + chaos failover tests","Replication telemetry + lag SLOs","Quarterly board attestation"],
};
const outcomes: Outcome[] = [
  { icon: ShieldCheck, color: "text-emerald-600", title: "READINESS", l1: "92% Tier 0+1" },
  { icon: Clock, color: "text-emerald-600", title: "RPO", l1: "48 sec" },
  { icon: RefreshCw, color: "text-emerald-600", title: "RTO", l1: "8 min" },
  { icon: Activity, color: "text-emerald-600", title: "TESTING", l1: "84 / 90d" },
  { icon: Target, color: "text-emerald-600", title: "PASS", l1: "96%" },
  { icon: AlertTriangle, color: "text-amber-600", title: "RISK", l1: "3 watch" },
];

export default function MultiRegionDR() {
  return (
    <DashShell title="MULTI-REGION RESILIENCY &" highlight="DISASTER RECOVERY CONTROL LAYER" subtitle="Fail safely, fail fast, fail tested — every tier, every region." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="RTO / RPO by Tier (minutes)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={tier}><XAxis dataKey="t" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="rto" name="RTO (min)" fill="hsl(217 91% 60%)" radius={[4,4,0,0]} /><Bar dataKey="rpo" name="RPO (min)" fill="hsl(142 71% 45%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
          <Section title="Recent Failover Tests"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200"><tr><th className="text-left py-2 px-2">Test</th><th className="text-left py-2 px-2">Pair</th><th className="text-right py-2 px-2">Result</th><th className="text-right py-2 px-2">Time</th></tr></thead><tbody>{[{t:"OrderHub failover",p:"us-east ↔ us-west",r:"Pass",ti:"6m 12s"},{t:"PaymentSvc",p:"eu-west ↔ eu-north",r:"Pass",ti:"4m 48s"},{t:"BI-Cubes",p:"ap-se ↔ ap-ne",r:"Partial",ti:"18m"},{t:"Auth-Edge",p:"us-c ↔ us-w-2",r:"Pass",ti:"3m 22s"}].map(x => (<tr key={x.t} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2 px-2 font-medium text-slate-900">{x.t}</td><td className="py-2 px-2 text-slate-700">{x.p}</td><td className={`py-2 px-2 text-right font-semibold ${x.r==="Pass"?"text-emerald-700":"text-amber-700"}`}>{x.r}</td><td className="py-2 px-2 text-right text-slate-700">{x.ti}</td></tr>))}</tbody></table></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Region Pair Health (%)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="20%" outerRadius="100%" data={pairs}><RadialBar background dataKey="v" /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} layout="vertical" align="right" verticalAlign="middle" formatter={(_, e: any) => `${e?.payload?.p}: ${e?.payload?.v}%`} /></RadialBarChart></ResponsiveContainer></div></Section>
          <Section title="Open Risks"><div className="space-y-2 text-xs">{[{r:"BI-Cubes partial last test",s:"Yellow"},{r:"Tier 2 RPO budget tight",s:"Yellow"},{r:"Mainframe DR runbook gap",s:"Yellow"}].map(x => (<div key={x.r} className="flex items-center justify-between"><span className="text-slate-700">{x.r}</span><span className="font-semibold text-amber-600">{x.s}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}