import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row, Stars } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { Monitor, Target, Clock, AlertTriangle, Smile, Lightbulb, Settings, DollarSign } from "lucide-react";

const up = [10,11,12,13,14,15,16,17];
const down = [20,19,18,17,16,15,14,13];

export default function ApplicationDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Application & Product Support Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <ExecKpiCard Icon={Monitor} label="Application Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Donut value={92} size={48} stroke={6} color="hsl(142 71% 45%)" />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={Target} iconBg="bg-violet-50" iconColor="text-violet-600" label="SLA Achievement" value="96.7%" delta="2.1 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" />} target="SLA Target: ≥ 95%" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to" sublabel="Restore (MTTR)" value="31m" delta="22%" deltaDir="down" visual={<Sparkline data={down} color="hsl(217 91% 60%)" />} target="Target: ≤ 45m" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600" label="P1 / P2 Incidents" value="18" delta="28%" deltaDir="down" visual={<MiniBars data={[4,5,3,4,2,3,4,2]} color="hsl(0 84% 60%)" />} target="Target: < 25" />
        <ExecKpiCard Icon={Smile} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="User Satisfaction" sublabel="(CSAT)" value="4.6/5" delta="0.3" deltaDir="up" visual={<Stars value={4.6} />} />
        <ExecKpiCard Icon={Lightbulb} iconBg="bg-amber-50" iconColor="text-amber-600" label="Defect Escape" sublabel="Rate" value="2.1%" delta="0.7 pp" deltaDir="down" visual={<Sparkline data={down} color="hsl(38 92% 50%)" />} target="Target: ≤ 3%" />
        <ExecKpiCard Icon={Settings} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Automation" sublabel="Coverage" value="72%" delta="6 pp" deltaDir="up" visual={<Progress value={72} color="hsl(142 71% 45%)" />} target="Target: ≥ 60%" />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-violet-50" iconColor="text-violet-600" label="Cost to Serve" sublabel="(per Ticket)" value="$18.42" delta="14%" deltaDir="down" visual={<Sparkline data={down} color="hsl(258 89% 66%)" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Incident Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={75} size={80} stroke={10} color="hsl(0 84% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["P1 - Critical","28","7%","rose"],["P2 - High","66","16%","orange"],["P3 - Medium","198","48%","amber"],["P4 - Low","92","22%","blue"],["P5 - Planning","28","7%","gray"]].map(([l,n,p,c]:any) => (
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-3xl font-bold">412</div><div className="text-[10px] text-muted-foreground">Total</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">▼ 32% fewer P1/P2 incidents vs last month</div>
        </Section>
        <Section title="Service Level Performance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={97} size={70} stroke={10} color="hsl(142 71% 45%)" label="96.7%" /><div><div className="text-[10px] text-muted-foreground">SLA Achievement</div><div className="text-[10px]">SLA Target: ≥ 95%</div></div></div>
          {[["CRM Application","98.6"],["ERP Platform","96.1"],["HCM Application","95.4"],["eCommerce Platform","94.2"],["Analytics & Reporting","93.7"]].map(([n,v]) => (
            <div key={n} className="flex items-center gap-2 text-xs mb-1.5"><span className="w-28 truncate">{n}</span><Progress value={Number(v)} color="hsl(142 71% 45%)" /><span className="w-10 text-right font-semibold">{v}%</span></div>
          ))}
        </Section>
        <Section title="Problem Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3">
            <Donut value={70} size={80} stroke={10} color="hsl(258 89% 66%)" />
            <div className="text-center"><div className="text-3xl font-bold">28</div><div className="text-[10px] text-muted-foreground">Problems</div></div>
          </div>
          {[["High Impact","5"],["Moderate Impact","12"],["Low Impact","9"],["Under Review","2"]].map(([l,v]) => (
            <Row key={l} label={l} right={<span className="font-semibold">{v}</span>} />
          ))}
        </Section>
        <Section title="Change & Release Success" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={97} size={70} stroke={10} color="hsl(217 91% 60%)" label="97.3%" /><div className="text-[10px] text-muted-foreground">Change Success Rate · ▲ 2.8 pp</div></div>
          <Row label="Standard Changes" right={<span className="font-semibold">98.1%</span>} />
          <Row label="Normal Changes" right={<span className="font-semibold">95.6%</span>} />
          <Row label="Major Changes" right={<span className="font-semibold">93.8%</span>} />
          <Row label="Emergency Changes" right={<span className="font-semibold">92.0%</span>} />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Application Performance">
          <div className="text-[10px] text-muted-foreground mb-2">Score (Apdex) · Availability</div>
          {[["CRM Application","0.92","99.97%"],["ERP Platform","0.90","99.95%"],["HCM Application","0.89","99.93%"],["eCommerce Platform","0.88","99.91%"],["Analytics & Reporting","0.84","99.80%"]].map(([n,a,av]) => (
            <div key={n} className="flex items-center justify-between text-xs py-1 border-b last:border-0"><span>{n}</span><div className="flex gap-3"><span className="font-semibold">{a}</span><span className="text-muted-foreground">{av}</span></div></div>
          ))}
        </Section>
        <Section title="Ticket Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Received</div><div className="text-lg font-bold">1,248</div><div className="text-rose-600 text-[10px]">▼ 8%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Resolved</div><div className="text-lg font-bold">1,186</div><div className="text-emerald-600 text-[10px]">▲ 12%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Backlog</div><div className="text-lg font-bold">312</div><div className="text-emerald-600 text-[10px]">▼ 15%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Backlog &gt; 7d</div><div className="text-lg font-bold">28</div><div className="text-emerald-600 text-[10px]">▼ 22%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Backlog Aging</div>
          <div className="flex h-3 rounded overflow-hidden text-[9px] text-white font-semibold">
            <div className="bg-emerald-500 flex items-center justify-center" style={{width:'35%'}}>35%</div>
            <div className="bg-amber-500 flex items-center justify-center" style={{width:'40%'}}>40%</div>
            <div className="bg-orange-500 flex items-center justify-center" style={{width:'17%'}}>17%</div>
            <div className="bg-rose-500 flex items-center justify-center" style={{width:'8%'}}>8%</div>
          </div>
        </Section>
        <Section title="Knowledge & Self-Service" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={41} size={70} stroke={10} color="hsl(187 71% 45%)" label="41%" /><div className="text-[10px] text-muted-foreground">Self-Service Resolution<br/>Target: ≥ 40%</div></div>
          {[["Knowledge Articles","3,482"],["Article Views","28,764"],["Article Helpful (%)","87%"],["Knowledge Reuse Rate","62%"]].map(([l,v]) => (
            <Row key={l} label={l} right={<span className="font-semibold">{v}</span>} />
          ))}
        </Section>
        <Section title="Business Impact" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div><div className="text-[10px] text-muted-foreground">Business Services</div><div className="text-lg font-bold">48</div><div className="text-[9px] text-muted-foreground">Mission Critical · 12</div></div>
            <div><div className="text-[10px] text-muted-foreground">Revenue at Risk Avoided</div><div className="text-lg font-bold">$3.2M</div><div className="text-emerald-600 text-[9px]">▲ 24%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Users Supported</div><div className="text-lg font-bold">24,560</div><div className="text-emerald-600 text-[9px]">▲ 6%</div></div>
          </div>
          <div className="mt-2 rounded bg-indigo-50/60 p-2 text-[10px] text-indigo-700">★ Application support enabling reliable business outcomes</div>
        </Section>
      </div>

      <BottomCallout
        insight="AI / AIOps Insights"
        insightBody="156 anomaly detections, 73 auto-resolved incidents, 412 hrs time saved this MTD."
        recommendations={["Investigate recurring P2 incidents in ERP module impacting performance","Expand self-service content for top 10 repeat ticket categories","Optimize batch jobs in HCM to reduce processing delays","Increase automation for user provisioning and access requests"]}
        rightTitle="Operational Value Realized (MTD)"
        rightValue="$2.18M"
        rightSub="Value Delivered · ▲ 21% vs last month"
      />
    </DashboardLayout>
  );
}