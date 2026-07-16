import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { DollarSign, TrendingDown, Award, Activity, FileText, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "Annual Cloud Spend", value: "$48.2M", sub: "Run-rate", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Savings Identified", value: "$8.6M", sub: "vs prior year", subColor: "text-emerald-600", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Realized Savings", value: "$4.2M", sub: "YTD", subColor: "text-emerald-600", icon: Award, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Commitment Coverage", value: "84%", sub: "RIs / SPs / CUDs", subColor: "text-emerald-600", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Tagging Compliance", value: "96%", sub: "Showback-ready", subColor: "text-emerald-600", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Right-Sized (MTD)", value: "612", sub: "Workloads", subColor: "text-emerald-600", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Idle / Waste", value: "$420K", sub: "Detected · auto-fix", subColor: "text-amber-600", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Value Realization", value: "$12.8M", sub: "Cumulative", subColor: "text-emerald-600", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
];
const spend = [{c:"Compute",v:18.4},{c:"Storage",v:8.2},{c:"Database",v:6.8},{c:"Network",v:5.4},{c:"AI / ML",v:4.2},{c:"Other",v:5.2}];
const trend = Array.from({length: 12}, (_, i) => ({ m: ["J","F","M","A","M","J","J","A","S","O","N","D"][i], spend: 4.0 + i*0.04, saved: 0.1 + i*0.04 }));
const sav = [
  { name: "Right-sizing", value: 2.4, color: "hsl(217 91% 60%)" },
  { name: "Commitments", value: 2.8, color: "hsl(142 71% 45%)" },
  { name: "Idle removal", value: 1.4, color: "hsl(262 83% 58%)" },
  { name: "Tier optimization", value: 1.2, color: "hsl(38 92% 50%)" },
  { name: "Egress fixes", value: 0.8, color: "hsl(0 84% 60%)" },
];
const showback = [
  { bu: "Sales", spend: "$8.6M", trend: "↓ 6%" },
  { bu: "Manufacturing", spend: "$12.4M", trend: "→ flat" },
  { bu: "Finance", spend: "$5.2M", trend: "↓ 4%" },
  { bu: "R&D", spend: "$11.8M", trend: "↑ 14%" },
  { bu: "Corporate", spend: "$4.8M", trend: "↓ 2%" },
  { bu: "Supply Chain", spend: "$5.4M", trend: "↓ 3%" },
];
const wwh = {
  what: ["Cloud FinOps view of every dollar","Realized vs identified savings","BU showback + commitment coverage"],
  why: ["Carve-out is the once-in-a-decade cost reset","Cloud spend without FinOps = silent leak","Value realization proves the program works"],
  how: ["CSP billing + utilization in unified bus","AI-driven recommendations","Monthly FinOps board review"],
};
const outcomes: Outcome[] = [
  { icon: DollarSign, color: "text-emerald-600", title: "VALUE", l1: "$4.2M realized" },
  { icon: TrendingDown, color: "text-emerald-600", title: "OPTIMIZE", l1: "$8.6M identified" },
  { icon: Target, color: "text-emerald-600", title: "COMMITMENTS", l1: "84% covered" },
  { icon: FileText, color: "text-emerald-600", title: "GOVERNANCE", l1: "96% tagged" },
  { icon: Activity, color: "text-emerald-600", title: "EFFICIENCY", l1: "612 right-sized" },
  { icon: TrendingUp, color: "text-emerald-600", title: "REALIZATION", l1: "$12.8M cum." },
];

export default function CloudFinOps() {
  return (
    <DashShell title="CLOUD FINOPS, COST OPTIMIZATION &" highlight="VALUE REALIZATION DASHBOARD" subtitle="Every cloud dollar accounted for — and turned into outcomes." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Spend by Category ($M, annual)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={spend}><XAxis dataKey="c" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} unit="M" /><Tooltip /><Bar dataKey="v" fill="hsl(217 91% 60%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
          <Section title="Spend & Savings Trend ($M, 12 months)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><XAxis dataKey="m" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} unit="M" /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="spend" name="Run-rate" stroke="hsl(217 91% 60%)" strokeWidth={2} /><Line type="monotone" dataKey="saved" name="Monthly savings" stroke="hsl(142 71% 45%)" strokeWidth={2} /></LineChart></ResponsiveContainer></div></Section>
          <Section title="Showback by BU"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200"><tr><th className="text-left py-2 px-2">Business Unit</th><th className="text-right py-2 px-2">Annual Spend</th><th className="text-right py-2 px-2">Trend</th></tr></thead><tbody>{showback.map(s => (<tr key={s.bu} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-2 px-2 font-medium text-slate-900">{s.bu}</td><td className="py-2 px-2 text-right text-slate-700">{s.spend}</td><td className="py-2 px-2 text-right font-semibold text-slate-900">{s.trend}</td></tr>))}</tbody></table></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Savings Sources ($M)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sav} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>{sav.map(d => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toFixed(1)}M`} /></PieChart></ResponsiveContainer></div>
            <div className="grid grid-cols-1 gap-1 text-[11px]">{sav.map(d => (<div key={d.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: d.color }} /><span className="text-slate-700">{d.name}</span><span className="ml-auto font-semibold">${d.value.toFixed(1)}M</span></div>))}</div>
          </Section>
          <Section title="Idle / Waste Pipeline"><div className="space-y-2 text-xs">{[{r:"Unattached EBS volumes",a:"$148K"},{r:"Idle GPU instances",a:"$96K"},{r:"Old snapshots",a:"$72K"},{r:"Over-provisioned RDS",a:"$68K"},{r:"Stale load balancers",a:"$36K"}].map(r => (<div key={r.r} className="flex items-center justify-between"><span className="text-slate-700">{r.r}</span><span className="font-semibold text-amber-700">{r.a}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}