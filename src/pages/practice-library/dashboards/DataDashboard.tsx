import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { Database, Target, Clock, AlertTriangle, Share2, ShieldCheck, Settings, DollarSign, Server } from "lucide-react";

const up = [10,11,12,13,14,15,16];
const down = [20,19,18,17,16,15,14];

export default function DataDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="Data, Integration & Interoperability Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <ExecKpiCard Icon={Database} label="Data & Integration Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Donut value={92} size={48} stroke={6} color="hsl(142 71% 45%)" />} target="Excellent" />
        <ExecKpiCard Icon={Target} iconBg="bg-violet-50" iconColor="text-violet-600" label="SLA Achievement" value="97.2%" delta="2.4 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" />} target="SLA Target: ≥ 95%" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Restore (MTTR)" value="32m" delta="18%" deltaDir="down" visual={<Sparkline data={down} color="hsl(217 91% 60%)" />} target="Target: ≤ 45m" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600" label="Integration Failures" value="23" delta="35%" deltaDir="down" visual={<MiniBars data={[5,4,3,5,2,3,2]} color="hsl(0 84% 60%)" />} target="Target: < 50" />
        <ExecKpiCard Icon={Share2} iconBg="bg-cyan-50" iconColor="text-cyan-600" label="Interface Success Rate" value="98.6%" delta="1.6 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(187 71% 45%)" />} target="Target: ≥ 97%" />
        <ExecKpiCard Icon={Database} iconBg="bg-orange-50" iconColor="text-orange-600" label="Data Quality Score" value="96.1%" delta="1.8 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(25 95% 53%)" />} target="Target: ≥ 97%" />
        <ExecKpiCard Icon={Settings} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Automation Coverage" value="68%" delta="5 pp" deltaDir="up" visual={<Progress value={68} color="hsl(142 71% 45%)" />} target="Target: ≥ 60%" />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-violet-50" iconColor="text-violet-600" label="Cost to Process (per 1K Records)" value="$1.28" delta="12%" deltaDir="down" visual={<Sparkline data={down} color="hsl(258 89% 66%)" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Integration & Interface Landscape" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={100} size={90} stroke={14} color="hsl(258 89% 66%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Real-time APIs","162","32%","violet"],["Batch Integrations","188","37%","blue"],["File / EDI","92","18%","emerald"],["Database Links","46","9%","orange"],["Streaming / Events","24","5%","cyan"]].map(([n,v,p,c]:any)=>(
                <div key={n} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{n}</div><div className="flex gap-3"><span className="font-semibold">{v}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">512</div><div className="text-[10px] text-muted-foreground">Total Interfaces</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ 98% of critical interfaces are healthy</div>
        </Section>
        <Section title="Data Pipeline Reliability" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-4 gap-1 text-center mb-3">
            <div><div className="text-[9px] text-muted-foreground">Pipelines</div><div className="text-base font-bold">286</div></div>
            <div><div className="text-[9px] text-muted-foreground">Healthy</div><div className="text-base font-bold text-emerald-600">273</div><div className="text-[9px]">95.5%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Degraded</div><div className="text-base font-bold text-amber-600">8</div><div className="text-[9px]">2.8%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Down</div><div className="text-base font-bold text-rose-600">5</div><div className="text-[9px]">1.7%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Pipeline Success Rate (Last 30 Days)</div>
          <div className="text-lg font-bold">98.3%</div>
          <Sparkline data={[97,98,97,98,98,99,98,99,98]} width={220} height={40} color="hsl(142 71% 45%)" fill />
          <div className="mt-2 text-[11px] text-emerald-600">✓ 5 pipelines down (▼ 3 vs last month)</div>
        </Section>
        <Section title="Data Quality & Governance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={96} size={70} stroke={10} color="hsl(258 89% 66%)" label="96.1%" /><div className="text-[10px] text-muted-foreground">Overall Data Quality<br/>Target: ≥ 95%</div></div>
          {[["Accuracy","97.3%"],["Completeness","95.8%"],["Consistency","95.2%"],["Timeliness","96.6%"],["Validity","96.0%"]].map(([l,v])=>(<Row key={l} label={l} right={<span className="font-semibold">{v}</span>} />))}
        </Section>
        <Section title="Data Volume & Throughput" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-[10px] text-muted-foreground">Data Processed</div><div className="text-xl font-bold">2.48 TB</div><div className="text-[10px] text-emerald-600">▲ 21% vs last month</div><Sparkline data={up} width={120} height={32} color="hsl(187 71% 45%)" fill /></div>
            <div><div className="text-[10px] text-muted-foreground">Throughput (Records/min)</div><Donut value={100} size={60} stroke={8} color="hsl(187 71% 45%)" label="48.6K" /><div className="text-[10px] text-muted-foreground mt-1">Target: ≥ 40K · ▲ 21%</div></div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ Peak throughput 52.1K records/min on May 30</div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="Incident & Error Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={70} size={80} stroke={10} color="hsl(0 84% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["Critical","5","8%","rose"],["High","12","20%","orange"],["Medium","26","43%","amber"],["Low","18","29%","blue"]].map(([l,n,p,c]:any)=>(
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">61</div><div className="text-[10px] text-muted-foreground">Total Incidents</div></div>
          <div className="grid grid-cols-3 gap-1 mt-3 text-center text-xs">
            <div><div className="text-[9px] text-muted-foreground">MTTR</div><div className="font-bold">32m</div><div className="text-[9px] text-emerald-600">▼ 18%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Reopened</div><div className="font-bold">8</div><div className="text-[9px] text-emerald-600">▼ 27%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Error Rate</div><div className="font-bold">0.21%</div><div className="text-[9px] text-emerald-600">▼ 31%</div></div>
          </div>
        </Section>
        <Section title="Change & Deployment Success" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={97} size={70} stroke={10} color="hsl(142 71% 45%)" label="97.6%" /><div className="text-[10px] text-muted-foreground">Change Success Rate<br/>▲ 2.6 pp</div></div>
          {[["Data Pipeline","98.6%"],["Interface / API","97.1%"],["Mapping / Transform","96.2%"],["Data Quality Rules","98.7%"]].map(([l,v])=>(<Row key={l} label={l} right={<span className="font-semibold">{v}</span>} />))}
        </Section>
        <Section title="Master Data & Reference Data" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
            <div><div className="text-[10px] text-muted-foreground">MDM Health</div><div className="text-lg font-bold">91<span className="text-[10px]">/100</span></div></div>
            <div><div className="text-[10px] text-muted-foreground">Golden Records</div><div className="text-lg font-bold">96.4%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Duplicate Rate</div><div className="text-lg font-bold">0.72%</div><div className="text-[9px] text-emerald-600">▼ 15%</div></div>
            <div><div className="text-[10px] text-muted-foreground">Reference Data</div><div className="text-lg font-bold">98.8%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Top Domains by Data Quality</div>
          {[["Customer","97.2%"],["Product","96.5%"],["Provider","95.8%"],["Location","94.7%"]].map(([n,v])=>(
            <div key={n} className="flex items-center gap-2 text-xs mb-1"><span className="w-16">{n}</span><Progress value={parseFloat(v)} color="hsl(258 89% 66%)" /><span className="w-10 text-right font-semibold">{v}</span></div>
          ))}
        </Section>
        <Section title="Business Impact" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Reports & Analytics</div><div className="text-lg font-bold">1,248</div><div className="text-emerald-600 text-[9px]">▲ 19%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Data Services Consumed</div><div className="text-lg font-bold">568</div><div className="text-emerald-600 text-[9px]">▲ 16%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Cost Avoidance</div><div className="text-lg font-bold">$1.72M</div><div className="text-emerald-600 text-[9px]">▲ 23%</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Users Supported</div><div className="text-lg font-bold">24,630</div><div className="text-emerald-600 text-[9px]">▲ 12%</div></div>
          </div>
          <div className="mt-2 rounded bg-indigo-50/60 p-2 text-[10px] text-indigo-700">★ Reliable, trusted data powering business outcomes</div>
        </Section>
      </div>

      <BottomCallout
        insight="AI / AIOps Insights"
        insightBody="34 anomalies detected, 27 auto-resolved issues, 93% volume forecast accuracy, 186 hrs time saved MTD."
        recommendations={["Optimize 12 high-volume data pipelines for better performance","Standardize error handling for 8 failing interfaces","Improve data quality rules for Product and Provider domains","Expand API observability for real-time interfaces"]}
        rightTitle="Operational Value Realized"
        rightValue="$2.36M"
        rightSub="Estimated Value · ▲ 21% vs last month"
      />
    </DashboardLayout>
  );
}