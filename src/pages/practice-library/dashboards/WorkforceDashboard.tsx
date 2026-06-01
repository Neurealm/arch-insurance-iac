import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row, Stars } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { Database, Monitor, Clock, Headphones, Smile, Phone, Settings, DollarSign, ShoppingCart } from "lucide-react";

const up = [10,11,12,13,14,15,16,17];
const down = [20,19,18,17,16,15,14,13];

export default function WorkforceDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Digital Workforce Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <ExecKpiCard Icon={Database} label="Digital Workforce Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Donut value={92} size={48} stroke={6} color="hsl(142 71% 45%)" />} target="Excellent" />
        <ExecKpiCard Icon={Monitor} iconBg="bg-violet-50" iconColor="text-violet-600" label="Device Availability" value="98.7%" delta="1.8 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" fill />} target="Target: ≥ 97%" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Resolve (MTTR)" value="27m" delta="15%" deltaDir="down" visual={<Sparkline data={down} color="hsl(217 91% 60%)" />} target="Target: ≤ 30m" />
        <ExecKpiCard Icon={Headphones} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Service Desk CSAT" value="4.6/5" delta="0.2 pts" deltaDir="up" visual={<Stars value={4.6} />} target="Target: ≥ 4.5" />
        <ExecKpiCard Icon={Smile} iconBg="bg-cyan-50" iconColor="text-cyan-600" label="Employee Digital Experience Score" value="4.3/5" delta="0.4 pts" deltaDir="up" visual={<Stars value={4.3} />} target="Target: ≥ 4.2" />
        <ExecKpiCard Icon={Phone} iconBg="bg-orange-50" iconColor="text-orange-600" label="First Contact Resolution (FCR)" value="78.3%" delta="3.6 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(25 95% 53%)" />} target="Target: ≥ 75%" />
        <ExecKpiCard Icon={Settings} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Automation Coverage" value="62%" delta="4 pp" deltaDir="up" visual={<Progress value={62} color="hsl(142 71% 45%)" />} target="Target: ≥ 60%" />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-violet-50" iconColor="text-violet-600" label="Cost to Serve (per User / Month)" value="$12.48" delta="6%" deltaDir="down" visual={<Sparkline data={down} color="hsl(258 89% 66%)" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Device & Platform Overview" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={72} size={80} stroke={10} color="hsl(217 91% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Windows","72.1%","30,851","blue"],["macOS","12.4%","5,312","emerald"],["iOS","6.1%","2,612","violet"],["Android","5.3%","2,270","orange"],["Others","4.1%","1,771","gray"]].map(([n,p,c,clr]:any)=>(
                <div key={n} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${clr}-500`} />{n}</div><div className="flex gap-3"><span className="font-semibold">{p}</span><span className="text-muted-foreground w-12 text-right">{c}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">42,816</div><div className="text-[10px] text-muted-foreground">Total Devices</div></div>
          <div className="mt-2 flex justify-between text-[11px]"><span className="text-emerald-600">✓ 97.8% devices healthy</span><span className="text-emerald-600">▼ 1.2 pp vs last month</span></div>
        </Section>
        <Section title="Service Desk Performance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
            <div><div className="text-[9px] text-muted-foreground">Total Tickets</div><div className="font-bold">18,642</div><div className="text-emerald-600 text-[9px]">▼ 12%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Resolved</div><div className="font-bold">17,289</div><div className="text-emerald-600 text-[9px]">▲ 11%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Backlog</div><div className="font-bold">1,353</div><div className="text-emerald-600 text-[9px]">▼ 18%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Backlog &gt; 7d</div><div className="font-bold">142</div><div className="text-emerald-600 text-[9px]">▼ 22%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Tickets Trend (This Period)</div>
          <Sparkline data={[14,13,15,14,13,14,12,13,12]} width={220} height={50} color="hsl(217 91% 60%)" fill />
          <div className="mt-2 text-[11px] text-emerald-600">✓ Backlog healthy and trending down</div>
        </Section>
        <Section title="Incident Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={75} size={80} stroke={10} color="hsl(0 84% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Critical","12","6%","rose"],["High","32","17%","orange"],["Medium","76","41%","amber"],["Low","48","26%","blue"],["Informational","18","10%","violet"]].map(([l,n,p,c]:any)=>(
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">186</div><div className="text-[10px] text-muted-foreground">Total Incidents</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">▼ 20% fewer high/critical incidents vs last month</div>
        </Section>
        <Section title="Employee Experience" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center justify-between mb-2"><div className="text-[10px] text-muted-foreground">DEX Score Trend</div><span className="text-base font-bold">4.3/5</span></div>
          <Sparkline data={up} width={220} height={50} color="hsl(258 89% 66%)" fill />
          <div className="mt-3 text-[10px] text-muted-foreground mb-1">Top Experience Drivers (Impact on Score)</div>
          {[["Device Performance","0.92"],["Network Quality","0.78"],["Application Performance","0.74"],["Support Experience","0.68"],["Collaboration Tools","0.61"]].map(([n,v])=>(
            <div key={n} className="flex items-center gap-2 text-xs mb-1"><span className="w-32 truncate">{n}</span><Progress value={parseFloat(v)*100} color="hsl(258 89% 66%)" /><span className="w-10 text-right font-semibold">{v}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ Digital experience improving across all drivers</div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Request & Fulfillment" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-2 mb-3"><ShoppingCart className="h-8 w-8 text-blue-600" /><div><div className="text-2xl font-bold">5,892</div><div className="text-[10px] text-muted-foreground">Requests</div></div></div>
          {[["Access Requests","1,842","▼ 9%"],["Software Requests","1,621","▼ 8%"],["Hardware Requests","1,443","▼ 14%"],["Other Requests","986","▼ 12%"]].map(([l,v,d]:any)=>(
            <div key={l} className="grid grid-cols-3 text-xs py-1 border-b last:border-0"><span>{l}</span><span className="text-right font-semibold">{v}</span><span className="text-right text-emerald-600">{d}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ All request types trending down</div>
        </Section>
        <Section title="Asset & Lifecycle Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
            <div><div className="text-[10px] text-muted-foreground">Compliant Devices</div><div className="font-bold">40,851</div><div className="text-[9px]">95.4%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Out of Compliance</div><div className="font-bold">1,965</div><div className="text-[9px]">4.6%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Retirement (This Month)</div><div className="font-bold">428</div><div className="text-emerald-600 text-[9px]">▼ 8%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Lifecycle Status</div>
          <div className="flex h-3 rounded overflow-hidden text-[9px] text-white font-semibold">
            <div className="bg-blue-500 flex items-center justify-center" style={{width:'85%'}}>In Use</div>
            <div className="bg-amber-500 flex items-center justify-center" style={{width:'5%'}}>Tr</div>
            <div className="bg-orange-500 flex items-center justify-center" style={{width:'4%'}}>Rp</div>
            <div className="bg-gray-400 flex items-center justify-center" style={{width:'6%'}}>Rt</div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ Compliance within target (≥ 95%)</div>
        </Section>
        <Section title="Performance & Reliability" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["Device Performance Score","4.4/5","0.3 pts"],["Application Reliability","99.2%","0.6 pp"],["Login Success Rate","98.9%","1.1 pp"],["VPN Success Rate","97.6%","1.4 pp"]].map(([l,v,d]:any)=>(
            <Row key={l} label={l} right={<span className="font-semibold">{v} <span className="text-emerald-600 text-[10px]">▲ {d}</span></span>} />
          ))}
          <Sparkline data={up} width={220} height={50} color="hsl(258 89% 66%)" fill />
          <div className="mt-2 text-[11px] text-emerald-600">✓ Reliability metrics meeting or exceeding targets</div>
        </Section>
        <Section title="Cost & Productivity Impact" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Total Cost</div><div className="text-base font-bold">$533,221</div><div className="text-emerald-600 text-[9px]">▼ 5.6%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Users Supported</div><div className="text-base font-bold">42,816</div><div className="text-emerald-600 text-[9px]">▲ 3%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Cost per User/Month</div><div className="text-base font-bold">$12.48</div><div className="text-emerald-600 text-[9px]">▼ 6%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Automation Savings</div><div className="text-base font-bold">2,380 hrs</div><div className="text-emerald-600 text-[9px]">▲ 14%</div></div>
          </div>
          <div className="mt-2 rounded bg-indigo-50/60 p-2 text-[10px] text-indigo-700">★ Cost to serve decreasing while productivity improves</div>
        </Section>
      </div>

      <BottomCallout
        insight="AI / AIOps Insights"
        insightBody="56 anomalies detected, 1,487 auto-resolved tickets, 91% prediction accuracy, 1,236 hrs time saved MTD. AI insights prevented 7 incidents and reduced MTTR by 18%."
        recommendations={["Upgrade 312 devices nearing end of support","Address recurring Outlook crashes on macOS","Optimize VPN performance for APAC region","Increase automation for password reset requests","Standardize software versions to reduce incidents"]}
        rightTitle="Operational Value Realized"
        rightValue="$1.76M"
        rightSub="Total Value · ▲ 24% vs last month"
      />
    </DashboardLayout>
  );
}