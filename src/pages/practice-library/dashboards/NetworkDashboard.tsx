import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row, Pill } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { ShieldCheck, Gauge, BarChart3, Activity, AlertTriangle, Share2, DollarSign, Users, Building2, CheckCircle2 } from "lucide-react";

const up = [10,12,11,13,14,15,16,17,18,17,19,20];
const down = [22,20,19,21,18,17,16,15,14,13,12,11];
const bars = [6,5,4,3,4,3,2,3,2,2];

export default function NetworkDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Network & Connectivity Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <ExecKpiCard Icon={ShieldCheck} label="Network Availability" value="99.93%" delta="0.12 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="SLA Target: ≥ 99.90%" />
        <ExecKpiCard Icon={Gauge} iconBg="bg-violet-50" iconColor="text-violet-600" label="Network Performance" sublabel="(User Experience Score)" value="4.6/5" delta="0.3" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" />} target="SLA Target: ≥ 4.0" />
        <ExecKpiCard Icon={BarChart3} iconBg="bg-blue-50" iconColor="text-blue-600" label="Critical Path" sublabel="Availability" value="100%" delta="0 pp" deltaDir="up" deltaTone="neutral" visual={<Sparkline data={[100,100,99,100,100,100]} color="hsl(217 91% 60%)" />} target="SLA Target: 100%" />
        <ExecKpiCard Icon={Activity} iconBg="bg-rose-50" iconColor="text-rose-600" label="Mean Time to" sublabel="Restore (MTTR)" value="18m" delta="22%" deltaDir="down" visual={<Sparkline data={down} color="hsl(0 84% 60%)" />} target="Target: ≤ 30m" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-amber-50" iconColor="text-amber-600" label="Network Incidents" sublabel="(High Impact)" value="5" delta="38%" deltaDir="down" visual={<MiniBars data={bars} color="hsl(38 92% 50%)" />} />
        <ExecKpiCard Icon={Share2} iconBg="bg-cyan-50" iconColor="text-cyan-600" label="Packet Loss" sublabel="(Global Avg.)" value="0.08%" delta="53%" deltaDir="down" visual={<Sparkline data={down} color="hsl(187 71% 45%)" />} target="Target: < 0.2%" />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Cost Efficiency" sublabel="(Network)" value="+15.7%" delta="3.4 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs Last Month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Network Health Overview" action={<a className="text-xs text-blue-600">View map</a>}>
          <div className="flex items-center gap-4">
            <Donut value={81} size={90} stroke={12} color="hsl(142 71% 45%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Healthy","102","81%","emerald"],["Degraded","16","13%","amber"],["At Risk","6","5%","orange"],["Down","2","1%","rose"],["Maintenance","—","0%","gray"]].map(([l,n,p,c]: any) => (
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-center"><div className="text-3xl font-bold">126</div><div className="text-[10px] text-muted-foreground">Total Sites</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ No site outages in the last 30 days</div>
        </Section>
        <Section title="Application Performance (Network)" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="text-[10px] text-muted-foreground mb-2">Top Applications · Score (Avg.)</div>
          {[["Microsoft 365","4.7"],["Epic","4.6"],["Salesforce","4.5"],["SAP","4.2"],["Workday","4.3"]].map(([n,v]) => (
            <div key={n} className="flex items-center justify-between text-xs mb-1.5"><span>{n}</span><div className="flex items-center gap-2"><Progress value={Number(v)*20} color="hsl(142 71% 45%)" /><span className="font-semibold w-8 text-right">{v}/5</span></div></div>
          ))}
        </Section>
        <Section title="WAN & SD-WAN Performance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={92} size={70} stroke={10} color="hsl(217 91% 60%)" />
            <div><div className="text-[10px] text-muted-foreground">WAN Health Score</div><div className="text-2xl font-bold">92<span className="text-xs text-muted-foreground">/100</span></div><div className="text-[10px] text-emerald-600">▲ 6 pts</div></div>
          </div>
          <div className="mt-3 space-y-1">
            <Row label="Jitter (Avg.)" right={<span className="font-semibold">12 ms <span className="text-emerald-600 text-[10px]">▼ 20%</span></span>} />
            <Row label="Latency (Avg.)" right={<span className="font-semibold">28 ms <span className="text-emerald-600 text-[10px]">▼ 18%</span></span>} />
            <Row label="Packet Loss" right={<span className="font-semibold">0.08% <span className="text-emerald-600 text-[10px]">▼ 47%</span></span>} />
            <Row label="Path Optimization" right={<span className="font-semibold">89% <span className="text-emerald-600 text-[10px]">▲ 9%</span></span>} />
          </div>
        </Section>
        <Section title="Wireless Experience" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3">
            <Donut value={92} size={70} stroke={10} color="hsl(258 89% 66%)" />
            <div><div className="text-[10px] text-muted-foreground">Wireless Score</div><div className="text-2xl font-bold">4.6<span className="text-xs text-muted-foreground">/5</span></div><div className="text-[10px] text-emerald-600">▲ 0.3</div></div>
          </div>
          <Row label="Successful Connections" right={<span className="font-semibold">98.3% <span className="text-emerald-600 text-[10px]">▲ 1.2 pp</span></span>} />
          <Row label="Roaming Experience" right={<span className="font-semibold">4.5/5 <span className="text-emerald-600 text-[10px]">▲ 0.3</span></span>} />
          <Row label="Coverage" right={<span className="font-semibold">96.7% <span className="text-emerald-600 text-[10px]">▲ 1.6 pp</span></span>} />
          <Row label="Client Health" right={<span className="font-semibold">98.1% <span className="text-emerald-600 text-[10px]">▲ 1.1 pp</span></span>} />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Incident Overview" action={<a className="text-xs text-blue-600">View all</a>}>
          <div className="flex items-center gap-3">
            <Donut value={68} size={80} stroke={10} color="hsl(0 84% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Critical","3","9%","rose"],["High","7","22%","orange"],["Medium","15","47%","amber"],["Low","7","22%","blue"]].map(([l,n,p,c]:any) => (
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-3xl font-bold">32</div><div className="text-[10px] text-muted-foreground">Total</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">▼ 36% fewer incidents vs last month</div>
        </Section>
        <Section title="Change & Deployment Success" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={97} size={80} stroke={10} color="hsl(217 91% 60%)" label="97.1%" />
            <div className="text-xs"><div className="text-muted-foreground">Change Success Rate</div><div className="text-[10px] text-emerald-600 mt-1">▲ 2.3 pp</div></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-center">
            <div className="rounded bg-muted/40 p-2"><div className="text-lg font-bold">86</div><div className="text-[10px] text-muted-foreground">Changes This Period</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-lg font-bold">2</div><div className="text-[10px] text-muted-foreground">Failed Changes</div><div className="text-[10px] text-emerald-600">▼ 60%</div></div>
          </div>
        </Section>
        <Section title="Security Posture (Network)" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3">
            <Donut value={86} size={70} stroke={10} color="hsl(142 71% 45%)" />
            <div><div className="text-[10px] text-muted-foreground">Network Security Score</div><div className="text-2xl font-bold">86<span className="text-xs text-muted-foreground">/100</span></div><div className="text-[10px] text-emerald-600">▲ 8 pts</div></div>
          </div>
          <Row label="DDoS Protection" right={<Pill tone="ok">Protected</Pill>} />
          <Row label="Firewall Health" right={<Pill tone="ok">Healthy</Pill>} />
          <Row label="Intrusion Events" right={<span className="font-semibold">12 <span className="text-emerald-600 text-[10px]">▼ 40%</span></span>} />
          <Row label="Vulnerabilities" right={<span className="font-semibold">2 <span className="text-emerald-600 text-[10px]">▼ 33%</span></span>} />
        </Section>
        <Section title="Business Impact" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["Users Impacted","0","100%",Users],["Sites Impacted","0","100%",Building2],["Revenue Impacted","$0","100%",DollarSign]].map(([l,v,d,I]: any) => (
            <div key={l} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div className="flex items-center gap-2"><I className="h-4 w-4 text-muted-foreground" /><div><div className="text-xs font-medium">{l}</div><div className="text-[9px] text-muted-foreground">(High Impact)</div></div></div>
              <div className="text-right"><div className="text-base font-bold">{v}</div><div className="text-[10px] text-emerald-600">▼ {d}</div></div>
            </div>
          ))}
        </Section>
      </div>

      <BottomCallout
        insight="Key Insight"
        insightBody="Network performance and reliability are strong across the enterprise. SD-WAN optimization and proactive issue resolution continue to improve user experience and reduce risk."
        recommendations={["Monitor bandwidth growth at 3 sites approaching capacity threshold","Consider additional path diversity for critical locations","Continue SD-WAN policy tuning for Microsoft 365 optimization"]}
        rightTitle="Operational Value This Period"
        rightValue="$312K"
        rightSub="Estimated Value Delivered"
      />
    </DashboardLayout>
  );
}