import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { ShieldCheck, Lock, AlertTriangle, Eye, FileCheck, Activity, Target, Bug } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "CSPM Score", value: "94/100", sub: "All CSPs", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Critical Findings", value: "8", sub: "Open · auto-routing", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Policy Coverage", value: "98%", sub: "Workloads in scope", subColor: "text-emerald-600", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Mean Fix Time", value: "4h 12m", sub: "Critical findings", subColor: "text-emerald-600", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Encryption", value: "100%", sub: "At-rest, in-transit", subColor: "text-emerald-600", icon: Lock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Public Exposure", value: "0", sub: "Sensitive workloads", subColor: "text-emerald-600", icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "CIS Benchmark", value: "96%", sub: "Pass rate", subColor: "text-emerald-600", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Vulns Patched", value: "1,284", sub: "Last 30 days", subColor: "text-emerald-600", icon: Bug, color: "text-blue-600", bg: "bg-blue-50" },
];
const sev = [
  { name: "Critical", value: 8, color: "hsl(0 84% 60%)" },
  { name: "High", value: 32, color: "hsl(38 92% 50%)" },
  { name: "Medium", value: 148, color: "hsl(217 91% 60%)" },
  { name: "Low", value: 412, color: "hsl(142 71% 45%)" },
];
const dom = [{d:"IAM",v:24},{d:"Network",v:18},{d:"Data",v:14},{d:"Compute",v:11},{d:"Logging",v:6},{d:"Container",v:9}];
const wwh = {
  what: ["CSPM posture across AWS, Azure, GCP","Findings by severity, domain, fix time","Encryption + exposure + benchmark coverage"],
  why: ["Carve-out brings new accounts and new risk","Misconfig is the #1 cloud breach vector","Boards demand audit-ready posture"],
  how: ["Wiz / Prisma / Defender feeds into CSPM bus","Auto-route to owner via ServiceNow","SLO-bound remediation"],
};
const outcomes: Outcome[] = [
  { icon: ShieldCheck, color: "text-emerald-600", title: "POSTURE", l1: "94 / 100" },
  { icon: AlertTriangle, color: "text-amber-600", title: "CRITICAL", l1: "8 open" },
  { icon: Activity, color: "text-emerald-600", title: "FIX TIME", l1: "4h 12m" },
  { icon: Lock, color: "text-emerald-600", title: "ENCRYPTION", l1: "100%" },
  { icon: Target, color: "text-emerald-600", title: "BENCHMARK", l1: "96% CIS" },
  { icon: Bug, color: "text-emerald-600", title: "PATCHED", l1: "1,284 / 30d" },
];

export default function CloudSecurityCspm() {
  return (
    <DashShell title="CLOUD SECURITY & GOVERNANCE" highlight="(CSPM / POLICY CONTROL PLANE)" subtitle="Cloud security as a control plane — every account, every workload, every policy." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Findings by Domain"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={dom}><XAxis dataKey="d" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="v" fill="hsl(217 91% 60%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
          <Section title="Critical Findings (sample)"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200"><tr><th className="text-left py-2 px-2">Finding</th><th className="text-left py-2 px-2">Account</th><th className="text-left py-2 px-2">Owner</th><th className="text-right py-2 px-2">Age</th></tr></thead><tbody>{[{f:"S3 bucket public ACL",a:"acct-mfg-prod-188",o:"Mfg Plat",ag:"2h"},{f:"NSG 0.0.0.0/0 :22",a:"sub-fin-np-074",o:"Fin Plat",ag:"4h"},{f:"KMS key unrotated 400d",a:"acct-rd-sbx-052",o:"R&D Plat",ag:"1d"},{f:"IAM user w/ admin",a:"sub-corp-prod-019",o:"Corp Plat",ag:"6h"}].map(r => (<tr key={r.f} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2 px-2 font-medium text-slate-900">{r.f}</td><td className="py-2 px-2 font-mono text-[11px] text-slate-700">{r.a}</td><td className="py-2 px-2 text-slate-700">{r.o}</td><td className="py-2 px-2 text-right text-amber-700 font-semibold">{r.ag}</td></tr>))}</tbody></table></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Findings by Severity"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sev} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>{sev.map(d => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">{sev.map(d => (<div key={d.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: d.color }} /><span className="text-slate-700">{d.name}</span><span className="ml-auto font-semibold">{d.value}</span></div>))}</div>
          </Section>
          <Section title="Compliance Frameworks"><div className="space-y-1.5 text-xs">{[{g:"CIS",v:"96%"},{g:"NIST 800-53",v:"94%"},{g:"PCI-DSS",v:"98%"},{g:"ISO 27001",v:"95%"},{g:"SOC 2",v:"97%"}].map(r => (<div key={r.g} className="flex items-center justify-between"><span className="text-slate-700">{r.g}</span><span className="font-semibold text-emerald-700">{r.v}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}