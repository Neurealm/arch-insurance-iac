import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, Progress, Row, Pill } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { Cloud, DollarSign, Percent, ShieldCheck, Trash2, Rocket, ShieldAlert, Leaf, CheckCircle2 } from "lucide-react";

const up = [10,12,11,13,14,15,16,17,18,19,20,21];
const down = [22,20,19,18,17,16,15,14,13,12,11,10];

export default function CloudDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Cloud & Multicloud Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
        <ExecKpiCard Icon={Cloud} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Cloud Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Donut value={92} size={48} stroke={6} color="hsl(142 71% 45%)" />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Cloud Spend" sublabel="Optimization" value="$4.2M" delta="18%" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Savings (Annualized) · vs last month" />
        <ExecKpiCard Icon={Percent} iconBg="bg-violet-50" iconColor="text-violet-600" label="Cost" sublabel="Optimization Rate" value="31%" delta="6 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" />} target="of Total Spend · Target ≥ 25%" />
        <ExecKpiCard Icon={Cloud} iconBg="bg-blue-50" iconColor="text-blue-600" label="Cloud Availability" value="99.982%" visual={<Sparkline data={up} color="hsl(217 91% 60%)" />} target="SLA Target: ≥ 99.95%" />
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-violet-50" iconColor="text-violet-600" label="Security &" sublabel="Compliance Score" value="88" unit="/100" delta="7 pts" deltaDir="up" visual={<Progress value={88} color="hsl(258 89% 66%)" />} />
        <ExecKpiCard Icon={Trash2} iconBg="bg-orange-50" iconColor="text-orange-600" label="Resource Waste" sublabel="Reduction" value="23%" delta="5 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(25 95% 53%)" />} target="Waste Eliminated · vs last month" />
        <ExecKpiCard Icon={Rocket} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Deployment" sublabel="Success" value="96.4%" visual={<Sparkline data={up} color="hsl(142 71% 45%)" />} target="Target: ≥ 95%" />
        <ExecKpiCard Icon={ShieldAlert} iconBg="bg-rose-50" iconColor="text-rose-600" label="Carbon" sublabel="Efficiency" value="Low" visual={<Progress value={25} color="hsl(142 71% 45%)" />} target="Risk Level · vs Last Month: Low" />
        <ExecKpiCard Icon={Leaf} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Carbon" sublabel="Efficiency" value="0.42" delta="12%" deltaDir="down" visual={<Sparkline data={down} color="hsl(142 71% 45%)" fill />} target="kg CO₂e / $ Spent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Cloud Spend Overview" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-4">
            <Donut value={100} size={110} stroke={20} color="hsl(217 91% 60%)" />
            <div className="space-y-1.5 text-xs flex-1">
              {[["AWS","48%","$6.5M","blue"],["Azure","28%","$3.8M","orange"],["GCP","14%","$1.9M","emerald"],["Others","6%","$0.8M","violet"],["SaaS","4%","$0.6M","cyan"]].map(([n,p,v,c]:any) => (
                <div key={n} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{n}</div><div className="flex gap-3"><span className="font-semibold w-10">{p}</span><span className="text-muted-foreground w-12 text-right">{v}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">$13.6M</div><div className="text-[10px] text-muted-foreground">Total Spend</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">▼ 8% vs last month ($14.8M)</div>
        </Section>
        <Section title="Multicloud Health Overview" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["AWS","93","99.97%","2","Low"],["Azure","90","99.98%","1","Low"],["GCP","91","99.95%","1","Low"],["Oracle Cloud","86","99.90%","3","Low"],["SaaS Apps","92","99.99%","0","None"]].map(([n,s,sla,c,t]:any) => (
            <div key={n} className="flex items-center gap-2 py-1.5 text-xs border-b last:border-0">
              <span className="w-20 font-medium">{n}</span>
              <span className="font-semibold w-10">{s}<span className="text-[9px] text-muted-foreground">/100</span></span>
              <span className="text-emerald-600 w-14">{sla}</span>
              <span className="text-muted-foreground w-6 text-right">{c}</span>
              <Pill tone={t === "None" ? "neutral" : "ok"}>{t}</Pill>
            </div>
          ))}
        </Section>
        <Section title="Cloud Cost Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center justify-between mb-2">
            <div><div className="text-[10px] text-muted-foreground">Spend Trend (Total)</div><div className="text-xl font-bold">$13.6M <span className="text-[10px] text-emerald-600">▼ 8%</span></div></div>
          </div>
          <Sparkline data={[14,13.8,14.2,13.5,13.9,13.6]} width={260} height={50} color="hsl(217 91% 60%)" fill />
          <div className="mt-3 text-[10px] text-muted-foreground mb-1">Top Cost Drivers · % of Spend</div>
          {[["Compute","42%","blue"],["Storage","17%","violet"],["Databases","12%","emerald"],["Networking","9%","orange"],["Data Transfer","6%","red"],["Others","14%","gray"]].map(([n,p,c]:any) => (
            <div key={n} className="flex items-center gap-2 text-xs mb-1"><span className="w-20">{n}</span><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full bg-${c}-500`} style={{width:p}} /></div><span className="w-10 text-right font-semibold">{p}</span></div>
          ))}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Compute Optimization" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div><div className="text-[10px] text-muted-foreground">Rightsizing Opportunities</div><div className="text-lg font-bold">$1.2M</div><div className="text-[9px] text-muted-foreground">Potential Savings</div></div>
            <div><div className="text-[10px] text-muted-foreground">Underutilized Resources</div><div className="text-lg font-bold">312</div><div className="text-[9px] text-muted-foreground">Instances</div></div>
            <div><Donut value={78} size={48} stroke={6} color="hsl(258 89% 66%)" label="78%" /><div className="text-[9px] mt-1">Reserved Instance</div></div>
          </div>
          <div className="text-[11px] text-emerald-600">▲ 6 pp vs last month</div>
        </Section>
        <Section title="Container & Kubernetes Health" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-[10px] text-muted-foreground">Clusters</div><div className="text-2xl font-bold">42</div><div className="text-[10px]">40 <span className="text-emerald-600">95%</span></div></div>
            <Donut value={95} size={60} stroke={8} color="hsl(142 71% 45%)" label="95%" />
          </div>
          <div className="mt-3 space-y-1.5">
            <Row label="Cluster Reliability (SLO)" right={<span className="font-semibold">99.2%</span>} />
            <Row label="Pod Success Rate" right={<span className="font-semibold">98.6%</span>} />
            <Row label="Node Health" right={<span className="font-semibold">96.7%</span>} />
            <Row label="Image Vulnerabilities" right={<span className="font-semibold">12 <span className="text-emerald-600 text-[10px]">▼ 20%</span></span>} />
          </div>
        </Section>
        <Section title="Security & Compliance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3">
            <Donut value={94} size={70} stroke={10} color="hsl(142 71% 45%)" label="94%" />
            <div><div className="text-[10px] text-muted-foreground">Compliance Posture</div><div className="text-[10px] text-emerald-600">▲ 6 pp vs last month</div></div>
          </div>
          {[["CIS Benchmark","Compliant","ok"],["Encryption Coverage","98%","ok"],["IAM Best Practices","92%","ok"],["Public Exposure","3","warn"],["High Risk Findings","7","warn"]].map(([l,v,t]:any) => (
            <Row key={l} label={l} right={<Pill tone={t}>{v}</Pill>} />
          ))}
        </Section>
        <Section title="Cloud Governance" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["Policy Compliance","97%"],["Tagging Compliance","90%"],["Cost Anomaly Detection","98%"],["Account Governance","92%"]].map(([l,v]) => (
            <div key={l} className="flex items-center gap-2 text-xs mb-2"><span className="w-32">{l}</span><Progress value={parseInt(v)} color="hsl(142 71% 45%)" /><span className="w-10 text-right font-semibold">{v}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ All critical governance policies active</div>
        </Section>
      </div>

      <BottomCallout
        insight="AI / AIOps Insights"
        insightBody="Predicted spend spike for development workloads in 7 days. Automatically stopped 146 idle resources (saved $28K). Detected and remediated 5 misconfigured storage buckets. Rightsizing actions taken: 87 instances this month."
        recommendations={["Increase Reserved Instance coverage to 85%+","Optimize underutilized databases (save ~$320K)","Implement lifecycle policies for cold storage","Consolidate dev/test environments"]}
        rightTitle="Operational Value Realized (This Period)"
        rightValue="$4.2M"
        rightSub="Total Value · ▲ 18% vs last month"
      />
    </DashboardLayout>
  );
}