import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { Factory, GitBranch, CheckCircle2, Activity, Rocket, ShieldCheck, AlertTriangle, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "Builds / Day", value: "184", sub: "Pipeline volume", subColor: "text-emerald-600", icon: Factory, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Build Success", value: "97.8%", sub: "First-try", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Deploy Success", value: "96.2%", sub: "Rollback safe", subColor: "text-emerald-600", icon: Rocket, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Validate Pass", value: "94%", sub: "Smoke + perf", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg Cycle", value: "42 min", sub: "Build → live", subColor: "text-emerald-600", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "IaC Reuse", value: "88%", sub: "Module catalog", subColor: "text-emerald-600", icon: GitBranch, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Failed Builds", value: "12", sub: "Last 24h", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Coverage", value: "100%", sub: "All waves wired", subColor: "text-emerald-600", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
];
const trend = Array.from({length: 14}, (_, i) => ({ d: `D-${13-i}`, ok: 160 + Math.floor(Math.random()*30), fail: 4 + Math.floor(Math.random()*8) }));
const stage = [{s:"Plan",t:6},{s:"Build",t:14},{s:"Test",t:11},{s:"Deploy",t:7},{s:"Validate",t:4}];
const wwh = {
  what: ["Industrialized factory: build, deploy, validate","Pipeline volume + success rates","Cycle time + IaC reuse"],
  why: ["Manual migration doesn't scale","Repeatable = cheap and safe","Failures must surface fast"],
  how: ["GitHub Actions / Azure DevOps","Terraform module catalog","Synthetic + performance gates"],
};
const outcomes: Outcome[] = [
  { icon: Factory, color: "text-emerald-600", title: "VOLUME", l1: "184 / day" },
  { icon: CheckCircle2, color: "text-emerald-600", title: "QUALITY", l1: "97.8% builds" },
  { icon: Rocket, color: "text-emerald-600", title: "DEPLOY", l1: "96.2% safe" },
  { icon: Activity, color: "text-violet-600", title: "CYCLE", l1: "42 min" },
  { icon: GitBranch, color: "text-emerald-600", title: "REUSE", l1: "88% IaC" },
  { icon: AlertTriangle, color: "text-amber-600", title: "FAILURES", l1: "12 / 24h" },
];

export default function CloudMigrationFactory() {
  return (
    <DashShell title="CLOUD MIGRATION" highlight="FACTORY (BUILD, DEPLOY, VALIDATE)" subtitle="The assembly line of the cloud journey — repeatable, observable, fast." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Pipeline Volume (last 14 days)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><XAxis dataKey="d" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="ok" name="Success" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="fail" name="Failed" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></Section>
          <Section title="Stage Cycle Time (min, p50)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={stage}><XAxis dataKey="s" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="t" fill="hsl(217 91% 60%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Top Failing Modules"><div className="space-y-2 text-xs">{[{m:"tf-vpc-multi-az v3.2",f:"4 fails"},{m:"helm-svc-ingress",f:"3 fails"},{m:"sql-bicep-elastic",f:"2 fails"},{m:"k8s-secret-mount",f:"2 fails"}].map(r => (<div key={r.m} className="flex items-center justify-between"><span className="font-mono text-[11px] text-slate-700">{r.m}</span><span className="font-semibold text-amber-700">{r.f}</span></div>))}</div></Section>
          <Section title="Validation Gates"><div className="space-y-1.5 text-xs">{[{g:"Smoke tests",v:"99%"},{g:"Perf SLO",v:"94%"},{g:"Security scan",v:"100%"},{g:"Cost guardrail",v:"97%"},{g:"Tag policy",v:"96%"}].map(r => (<div key={r.g} className="flex items-center justify-between"><span className="text-slate-700">{r.g}</span><span className="font-semibold text-emerald-700">{r.v}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}