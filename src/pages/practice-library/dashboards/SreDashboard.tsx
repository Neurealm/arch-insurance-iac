import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row, Stars } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { ShieldCheck, Activity, Search, Wrench, AlertTriangle, Zap, DollarSign } from "lucide-react";

const up = [10,11,12,13,14,15,16,17];
const down = [20,19,18,17,16,15,14,13];

export default function SreDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Observability & Resilience Engineering (SRE)" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-violet-50" iconColor="text-violet-600" label="SRE Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Donut value={92} size={48} stroke={6} color="hsl(258 89% 66%)" />} target="Excellent" />
        <ExecKpiCard Icon={Activity} label="Service Availability" value="99.95%" delta="0.08 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="SLO Target: ≥ 99.90%" />
        <ExecKpiCard Icon={Search} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Detect (MTTD)" value="2.8m" delta="18%" deltaDir="down" visual={<Sparkline data={down} color="hsl(217 91% 60%)" />} target="Target: ≤ 5m" />
        <ExecKpiCard Icon={Wrench} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Resolve (MTTR)" value="18m" delta="22%" deltaDir="down" visual={<Sparkline data={down} color="hsl(258 89% 66%)" />} target="Target: ≤ 30m" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="Change Failure Rate" value="3.2%" delta="0.8 pp" deltaDir="down" visual={<MiniBars data={[4,3,5,2,3,2,3]} color="hsl(25 95% 53%)" />} target="Target: ≤ 5%" />
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Reliability (SLO) Attainment" value="97.6%" delta="2.6 pp" deltaDir="up" visual={<Progress value={97} color="hsl(142 71% 45%)" />} target="Target: ≥ 95%" />
        <ExecKpiCard Icon={Zap} iconBg="bg-cyan-50" iconColor="text-cyan-600" label="Resiliency Score" value="4.7/5" delta="0.3" deltaDir="up" visual={<Stars value={4.7} />} />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-rose-50" iconColor="text-rose-600" label="Cost of Outages (Business Impact)" value="$327K" delta="24%" deltaDir="down" visual={<Sparkline data={down} color="hsl(0 84% 60%)" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Service Health Overview" action={<a className="text-xs text-blue-600">View all services</a>}>
          <div className="flex items-center gap-3">
            <Donut value={74} size={80} stroke={10} color="hsl(142 71% 45%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Healthy","109","74%","emerald"],["Degraded","23","16%","amber"],["At Risk","10","7%","orange"],["Down","6","4%","rose"],["Unknown","0","0%","gray"]].map(([l,n,p,c]:any)=>(
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">148</div><div className="text-[10px] text-muted-foreground">Total Services</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ 85% of services are healthy</div>
        </Section>
        <Section title="SLO / SLA Performance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={97} size={70} stroke={10} color="hsl(142 71% 45%)" label="97.6%" /><div className="text-[10px] text-muted-foreground">Overall SLO Attainment<br/>Target: ≥ 95% · ▲ 2.6 pp</div></div>
          {[["Meeting","312","79%","emerald"],["Warning","56","14%","amber"],["Breaching","18","5%","rose"],["No Data","10","2%","gray"]].map(([l,n,p,c]:any)=>(
            <div key={l} className="flex items-center justify-between text-xs py-1"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
          ))}
        </Section>
        <Section title="Alerts & Noise Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div><div className="text-[10px] text-muted-foreground">Alerts Fired</div><div className="text-lg font-bold">12,842</div><div className="text-emerald-600 text-[10px]">▼ 22%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Actionable Alerts</div><div className="text-lg font-bold">1,248</div><div className="text-emerald-600 text-[10px]">▼ 28%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Noise Reduction</div><div className="text-lg font-bold">68%</div><div className="text-emerald-600 text-[10px]">▲ 12 pp</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Alert Volume Over Time</div>
          <Sparkline data={[15,14,13,12,11,10,11,10,9]} width={220} height={50} color="hsl(258 89% 66%)" fill />
          <div className="mt-2 text-[11px] text-emerald-600">✓ Alert noise well controlled</div>
        </Section>
        <Section title="Incident Impact" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={75} size={80} stroke={10} color="hsl(0 84% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Sev 1 - Critical","5","12%","rose"],["Sev 2 - High","11","26%","orange"],["Sev 3 - Medium","16","38%","amber"],["Sev 4 - Low","8","19%","blue"],["Sev 5 - Info","2","5%","violet"]].map(([l,n,p,c]:any)=>(
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">42</div><div className="text-[10px] text-muted-foreground">Total Incidents</div></div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Error Budget Status" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["Checkout Service","72%","emerald"],["Payment Service","48%","amber"],["User Profile Service","35%","orange"],["Recommendation Service","22%","rose"],["Search Service","81%","emerald"]].map(([n,v,c]:any)=>(
            <div key={n} className="text-xs mb-2"><div className="flex justify-between mb-0.5"><span>{n}</span><span className="font-semibold">{v}</span></div><div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full bg-${c}-500`} style={{width:v}} /></div></div>
          ))}
          <div className="mt-2 text-[11px] text-amber-600">⚠ 2 services &lt; 30% error budget remaining</div>
        </Section>
        <Section title="Dependency Health" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["Payment Gateway","92","up"],["Auth Service","90","up"],["Inventory Service","78","flat"],["Recommendation Service","65","down"],["Email Service","65","down"],["Logging Service","94","up"]].map(([n,s,t]:any)=>(
            <div key={n} className="flex items-center justify-between text-xs py-1 border-b last:border-0"><span>{n}</span><div className="flex items-center gap-2"><span className="font-semibold">{s}</span><Sparkline data={t === 'down' ? down : up} width={40} height={16} color={t === 'down' ? 'hsl(0 84% 60%)' : 'hsl(142 71% 45%)'} /></div></div>
          ))}
          <div className="mt-2 text-[11px] text-amber-600">⚠ 2 dependencies unhealthy</div>
        </Section>
        <Section title="Deployment Excellence" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-4 gap-2 text-center mb-3 text-xs">
            <div><div className="text-[9px] text-muted-foreground">Deployment Frequency</div><div className="font-bold">245/week</div><div className="text-emerald-600 text-[9px]">▲ 15%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Lead Time</div><div className="font-bold">2.1h</div><div className="text-emerald-600 text-[9px]">▼ 18%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Change Failure</div><div className="font-bold">3.2%</div><div className="text-emerald-600 text-[9px]">▼ 0.8 pp</div></div>
            <div><div className="text-[9px] text-muted-foreground">MTTR (Change)</div><div className="font-bold">26m</div><div className="text-emerald-600 text-[9px]">▼ 21%</div></div>
          </div>
          <Sparkline data={up} width={220} height={50} color="hsl(258 89% 66%)" fill />
          <div className="mt-2 text-[11px] text-emerald-600">✓ Elite performance across DORA metrics</div>
        </Section>
        <Section title="Infrastructure & Capacity" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["CPU","62%","blue"],["Memory","68%","violet"],["Disk","55%","orange"],["Network","41%","emerald"]].map(([n,v,c]:any)=>(
            <div key={n} className="flex items-center gap-2 text-xs mb-1.5"><span className="w-14">{n}</span><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full bg-${c}-500`} style={{width:v}} /></div><span className="w-10 text-right font-semibold">{v}</span></div>
          ))}
          <div className="mt-2 flex items-center gap-3"><Donut value={31} size={60} stroke={8} color="hsl(142 71% 45%)" label="31%" /><div className="text-[10px] text-muted-foreground">Capacity Headroom · Healthy</div></div>
        </Section>
      </div>

      <BottomCallout
        insight="AI / AIOps Insights"
        insightBody="56 anomalies detected, 14 predicted incidents, 122 auto-resolved, 42% MTTR improvement."
        recommendations={["Optimize error budgets for 2 services at risk","Reduce mean time to detect for payment flows","Address top noisy alerts from infrastructure tier","Increase test coverage to further reduce change failures","Right-size memory allocation in recommendation service"]}
        rightTitle="Operational Value Realized"
        rightValue="$1.86M"
        rightSub="Total Value · ▲ 23% vs last month"
      />
    </DashboardLayout>
  );
}