import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row } from "@/components/practice-library/widgets";
import { ExecKpiCard, ExecSummaryCard, BottomCallout } from "@/components/practice-library/exec";
import { ShieldCheck, Target, Clock, AlertTriangle, Gauge, DollarSign, Database, Server, HardDrive, Network as NetIcon, Cpu, MemoryStick, CheckCircle2, CircleDot, KeyRound, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const trendUp = [10,11,10,12,13,14,15,14,16,17,18,19,20];
const trendDown = [22,20,21,19,18,17,16,17,15,14,13,12];
const bars = [3,5,2,4,6,3,5,4,2,3];

export default function InfraDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Infrastructure & Hybrid Platform Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-3 mb-6">
        <div className="lg:col-span-1"><ExecSummaryCard Icon={Target} title="Executive Summary" body="Reliable, resilient and efficient platforms that power your business services." /></div>
        <ExecKpiCard Icon={ShieldCheck} label="Platform Availability" value="99.982%" delta="0.18 pp" deltaDir="up" visual={<Sparkline data={trendUp} color="hsl(142 71% 45%)" fill />} target="SLA Target: ≥ 99.95%" />
        <ExecKpiCard Icon={Target} iconBg="bg-violet-50" iconColor="text-violet-600" label="SLO Achievement" value="96.4%" delta="2.7 pp" deltaDir="up" visual={<Progress value={96} color="hsl(258 89% 66%)" />} target="SLO Target: ≥ 95%" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to" sublabel="Restore (MTTR)" value="31m" delta="28%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={trendDown} color="hsl(217 91% 60%)" />} target="Target: ≤ 45m" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600" label="Critical Incidents" sublabel="(30D)" value="7" delta="36%" deltaDir="down" deltaTone="positive" visual={<MiniBars data={bars} color="hsl(0 84% 60%)" />} target="Target: < 10" />
        <Link to="/enterprise-certificate-management" className="rounded-2xl bg-white border border-blue-200 p-3 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between mb-1.5 relative">
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-blue-50 grid place-items-center"><KeyRound className="h-3.5 w-3.5 text-blue-600" /></div>
              <span className="text-[11px] font-semibold text-slate-700">Certificates</span>
            </div>
            <ExternalLink className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-[10px] text-muted-foreground">Managed Coverage</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">91.5%</div>
          <Progress value={91.5} color="hsl(217 91% 60%)" />
          <div className="flex items-center justify-between mt-1.5 text-[9px]">
            <span className="text-muted-foreground">250,847 total</span>
            <span className="text-amber-600 font-semibold">1,487 exp 7d</span>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1 group-hover:underline">Open Admin Console →</div>
        </Link>
        <ExecKpiCard Icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Infrastructure Cost" sublabel="Efficiency" value="+18.6%" delta="4.2 pp" deltaDir="up" visual={<Sparkline data={trendUp} color="hsl(142 71% 45%)" />} target="vs Last Month" />
        <ExecKpiCard Icon={Database} iconBg="bg-violet-50" iconColor="text-violet-600" label="Backup Success Rate" value="97.3%" delta="1.6 pp" deltaDir="up" visual={<Progress value={97} color="hsl(258 89% 66%)" />} target="Target: ≥ 95%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Section title="Platform Health Overview" action={<a className="text-xs text-blue-600 font-medium">View inventory</a>}>
          <div className="text-xs text-muted-foreground mb-3">Health by Platform</div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Donut value={92} size={110} stroke={14} color="hsl(142 71% 45%)" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] text-muted-foreground">Overall Health Score</div>
                <div className="text-2xl font-bold">92</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Good</div>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-xs">
              {[["Compute","93%","2%","bg-blue-500"],["Storage","91%","1%","bg-orange-500"],["Network","94%","2%","bg-emerald-500"],["Virtualization","92%","1%","bg-amber-500"],["Databases","90%","—","bg-violet-500"]].map(([n,v,d,c]) => (
                <div key={n} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${c}`} />{n}</div>
                  <div className="flex items-center gap-2"><span className="font-semibold">{v}</span><span className="text-emerald-600">▲ {d}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />All platforms healthy</div>
        </Section>

        <Section title="Infrastructure Reliability (SRE Metrics)" action={<a className="text-xs text-blue-600 font-medium">View SLOs</a>}>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[["Availability (SLO)","99.982%","0.18 pp","up"],["MTTD (Detect)","3m","25%","down"],["MTTR (Restore)","31m","28%","down"],["Change Failure Rate","2.1%","0.6 pp","down"]].map(([l,v,d,dir]) => (
              <div key={l as string}>
                <div className="text-[10px] text-muted-foreground mb-1">{l}</div>
                <div className="text-base font-bold">{v}</div>
                <div className={`text-[10px] font-semibold ${dir === 'down' ? 'text-emerald-600' : 'text-emerald-600'}`}>▼ {d}</div>
              </div>
            ))}
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground mb-1">Error Budget</div>
              <Donut value={68} size={50} stroke={6} color="hsl(258 89% 66%)" label="68%" />
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">On Track</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-indigo-50/60 p-2.5 text-xs">
            <div className="font-semibold text-indigo-700 mb-0.5">Reliability Insight</div>
            <p className="text-[11px] text-muted-foreground">Your error budget is healthy. Systems are operating well within SLO targets.</p>
          </div>
        </Section>

        <Section title="Capacity & Performance" action={<a className="text-xs text-blue-600 font-medium">View details</a>}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground mb-2">Resource Utilization (Avg.)</div>
              {[["CPU","54%",Cpu,"bg-blue-500"],["Memory","61%",MemoryStick,"bg-violet-500"],["Storage","58%",HardDrive,"bg-orange-500"],["Network I/O","47%",NetIcon,"bg-emerald-500"]].map(([n,v,I,c]: any) => (
                <div key={n} className="flex items-center gap-2 mb-1.5">
                  <I className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] w-16">{n}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full ${c}`} style={{width: v}} /></div>
                  <span className="text-[11px] font-semibold w-8 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-2">Capacity Risk Forecast</div>
              <Sparkline data={[25,30,35,42,50,58,65]} width={140} height={80} color="hsl(217 91% 60%)" fill />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1"><span>Now</span><span>30D</span><span>60D</span><span>90D</span></div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />No capacity risks in next 90 days</div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Operational Excellence">
          <Row label="Change Success Rate" right={<span className="font-semibold">96.8% <span className="text-emerald-600 text-[10px]">▲ 2.4 pp</span></span>} />
          <Row label="Automation Coverage" right={<span className="font-semibold">72% <span className="text-emerald-600 text-[10px]">▲ 6 pp</span></span>} />
          <Row label="Infra Drift Reduction" right={<span className="font-semibold">81% <span className="text-emerald-600 text-[10px]">▲ 7 pp</span></span>} />
          <Row label="Patch Compliance" right={<span className="font-semibold">98.1% <span className="text-emerald-600 text-[10px]">▲ 1.9 pp</span></span>} />
          <div className="mt-3 rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-700">Strong operational execution</div>
        </Section>
        <Section title="Protection & Resilience">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div><div className="text-[10px] text-muted-foreground">Backup Success</div><Donut value={99} size={60} stroke={8} color="hsl(142 71% 45%)" label="99.6%" /><div className="text-[9px] text-muted-foreground mt-1">SLA: ≥ 99%</div></div>
            <div><div className="text-[10px] text-muted-foreground">DR Readiness</div><Donut value={94} size={60} stroke={8} color="hsl(217 91% 60%)" label="94%" /><div className="text-[9px] text-muted-foreground mt-1">Target: ≥ 90%</div></div>
          </div>
          <div className="mt-3"><div className="text-[10px] text-muted-foreground mb-1">RPO / RTO Compliance</div><Sparkline data={trendUp} width={220} height={36} color="hsl(142 71% 45%)" fill /></div>
        </Section>
        <Section title="Risk & Compliance Posture">
          <div className="flex items-center gap-3">
            <Donut value={28} size={80} stroke={10} color="hsl(25 95% 53%)" />
            <div>
              <div className="text-2xl font-bold">28</div>
              <div className="text-[10px] text-amber-600 font-semibold">Low Risk</div>
              <div className="text-[10px] text-emerald-600 mt-1">▼ 12 pts</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {[["Unpatched Vulnerabilities","Medium","amber"],["End of Life Systems","Low","emerald"],["Storage Capacity","Low","emerald"]].map(([l,v,c]: any) => (
              <div key={l} className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">{l}</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold bg-${c}-50 text-${c}-700`}>{v}</span></div>
            ))}
          </div>
        </Section>
        <Section title="Business Impact">
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-[10px] text-muted-foreground">Business Services Supported</div><div className="flex items-center gap-2 mt-1"><Server className="h-5 w-5 text-blue-600" /><div><div className="text-xl font-bold">48</div><div className="text-[9px] text-muted-foreground">Mission Critical</div></div></div></div>
            <div className="text-center"><div className="text-[10px] text-muted-foreground">Availability</div><Donut value={99} size={60} stroke={8} color="hsl(142 71% 45%)" label="99.97%" /></div>
          </div>
          <div className="mt-3"><div className="text-[10px] text-muted-foreground mb-1">Impact Avoided (30D)</div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="rounded bg-muted/40 p-1.5"><div className="text-sm font-bold">7</div><div className="text-[9px] text-muted-foreground">Incidents Prevented</div></div>
              <div className="rounded bg-muted/40 p-1.5"><div className="text-sm font-bold">$1.28M</div><div className="text-[9px] text-muted-foreground">Business Impact Avoided</div></div>
              <div className="rounded bg-muted/40 p-1.5"><div className="text-sm font-bold">4,326</div><div className="text-[9px] text-muted-foreground">Users Impacted Avoided</div></div>
            </div>
          </div>
        </Section>
      </div>

      <BottomCallout
        insight="Executive Insight"
        insightBody="Platform reliability and efficiency continue to improve. Automation and drift reduction are driving stability and lower risk."
        recommendations={["Plan storage refresh for systems trending toward future capacity threshold.","Continue increasing automation coverage toward 80%+."]}
        rightTitle="View All Insights"
        rightValue=""
      />
    </DashboardLayout>
  );
}