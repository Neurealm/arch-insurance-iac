import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import { Bot, CheckCircle2, Clock, TrendingUp, Activity, ShoppingBag, Award, Zap } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";

const kpis: KPI[] = [
  { label: "Bots in Marketplace", value: "84", sub: "Cloud-native skills", subColor: "text-emerald-600", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Daily Tasks", value: "12,840", sub: "Automated", subColor: "text-emerald-600", icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Auto-Resolution", value: "86%", sub: "No-touch", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "FTE Hours Saved", value: "4,820", sub: "Last 30 days", subColor: "text-emerald-600", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Bot Success", value: "97.4%", sub: "First-try", subColor: "text-emerald-600", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "New Skills (qtr)", value: "18", sub: "Published", subColor: "text-emerald-600", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Trigger Rate", value: "184/min", sub: "Peak", subColor: "text-emerald-600", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Adoption", value: "92%", sub: "Cloud teams", subColor: "text-emerald-600", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
];
const top = [{b:"Cost-Optimizer-AI",t:1240},{b:"Right-Sizer",t:984},{b:"Tag-Enforcer",t:864},{b:"Patch-Bot",t:742},{b:"DR-Drill-Bot",t:418},{b:"Quota-Boost",t:362}];
const trend = Array.from({length: 14}, (_, i) => ({ d: `D-${13-i}`, t: 9000 + Math.floor(Math.random()*4000), s: 8500 + Math.floor(Math.random()*4000) }));
const wwh = {
  what: ["Marketplace of cloud automation skills","Volume, success rate, hours saved","Top performing bots + adoption"],
  why: ["Cloud scale demands automation as default","Bots compound — every new skill scales","FTE leverage = the business case"],
  how: ["Skills authored in Lovable Cloud + AI Gateway","Marketplace publishing & approval","Telemetry to ROI dashboard"],
};
const outcomes: Outcome[] = [
  { icon: ShoppingBag, color: "text-emerald-600", title: "CATALOG", l1: "84 skills" },
  { icon: Bot, color: "text-emerald-600", title: "VOLUME", l1: "12,840 / day" },
  { icon: CheckCircle2, color: "text-emerald-600", title: "AUTO-RES", l1: "86%" },
  { icon: Clock, color: "text-emerald-600", title: "HOURS SAVED", l1: "4,820 / 30d" },
  { icon: Award, color: "text-emerald-600", title: "QUALITY", l1: "97.4%" },
  { icon: Activity, color: "text-emerald-600", title: "ADOPTION", l1: "92%" },
];

export default function DigitalCoworkerCloud() {
  return (
    <DashShell title="DIGITAL COWORKER –" highlight="CLOUD AUTOMATION MARKETPLACE" subtitle="Bots that run the cloud — published, governed, measured." wwh={wwh} kpis={kpis} outcomes={outcomes}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Daily Bot Tasks (last 14 days)"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><XAxis dataKey="d" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="t" name="Triggered" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="s" name="Successful" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></Section>
          <Section title="Top Bots by Volume"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={top}><XAxis dataKey="b" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="t" fill="hsl(262 83% 58%)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Section>
        </div>
        <div className="space-y-4">
          <Section title="Newly Published Skills"><div className="space-y-2 text-xs">{[{n:"Egress-Sniper",v:"v1.0"},{n:"Spot-Switcher",v:"v1.2"},{n:"Idle-Killer",v:"v2.0"},{n:"Reserved-Plan-AI",v:"v1.4"},{n:"PolicyDrift-Fixer",v:"v3.1"}].map(r => (<div key={r.n} className="flex items-center justify-between"><span className="font-mono text-[11px] text-slate-700">{r.n}</span><span className="font-semibold text-violet-700">{r.v}</span></div>))}</div></Section>
          <Section title="Hours Saved by Domain"><div className="space-y-1.5 text-xs">{[{d:"FinOps",v:"1,820h"},{d:"SRE",v:"1,240h"},{d:"Security",v:"840h"},{d:"Provisioning",v:"620h"},{d:"Compliance",v:"300h"}].map(r => (<div key={r.d} className="flex items-center justify-between"><span className="text-slate-700">{r.d}</span><span className="font-semibold text-emerald-700">{r.v}</span></div>))}</div></Section>
        </div>
      </div>
    </DashShell>
  );
}