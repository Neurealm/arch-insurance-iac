import DashboardLayout from "./_layout";
import { PageHeader, Section, Donut, Sparkline, MiniBars, Progress, Row, Stars, Pill } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { HeartPulse, Activity, Clock, AlertTriangle, Smile, Timer, Settings, DollarSign } from "lucide-react";

const up = [10,11,12,13,14,15,16,17];
const down = [20,19,18,17,16,15,14,13];

export default function EhrDashboard() {
  return (
    <DashboardLayout>
      <PageHeader title="EHR & Clinical Application Operations" subtitle="Executive Summary Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <ExecKpiCard Icon={HeartPulse} iconBg="bg-violet-50" iconColor="text-violet-600" label="EHR Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Donut value={92} size={48} stroke={6} color="hsl(258 89% 66%)" />} target="Excellent" />
        <ExecKpiCard Icon={Activity} label="EHR Availability" value="99.91%" delta="0.12 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Target: ≥ 99.90%" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Restore (MTTR)" value="28m" delta="20%" deltaDir="down" visual={<Sparkline data={down} color="hsl(217 91% 60%)" />} target="Target: ≤ 30m" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-violet-50" iconColor="text-violet-600" label="Clinical Incidents (P1 / P2)" value="16" delta="23%" deltaDir="down" visual={<MiniBars data={[5,4,3,2,3,2,1,2]} color="hsl(258 89% 66%)" />} target="Target: < 20" />
        <ExecKpiCard Icon={Smile} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Provider Satisfaction (CSAT)" value="4.6/5" delta="0.3" deltaDir="up" visual={<Stars value={4.6} />} target="Target: ≥ 4.5" />
        <ExecKpiCard Icon={Timer} iconBg="bg-orange-50" iconColor="text-orange-600" label="Avg. Patient Chart Load Time" value="2.1s" delta="0.4s" deltaDir="down" visual={<Sparkline data={down} color="hsl(25 95% 53%)" />} target="Target: ≤ 3s" />
        <ExecKpiCard Icon={Settings} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Change Success Rate" value="97.2%" delta="2.1 pp" deltaDir="up" visual={<Progress value={97} color="hsl(142 71% 45%)" />} target="Target: ≥ 95%" />
        <ExecKpiCard Icon={DollarSign} iconBg="bg-violet-50" iconColor="text-violet-600" label="Cost to Serve (per Provider)" value="$46.28" delta="8%" deltaDir="down" visual={<Sparkline data={down} color="hsl(258 89% 66%)" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Section title="Application Availability" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={98} size={90} stroke={14} color="hsl(258 89% 66%)" label="98.3%" /><div className="text-[10px] text-muted-foreground">Overall Availability</div></div>
          {[["EHR Core","99.94%","violet"],["Orders & Results","99.90%","amber"],["CPOE","99.85%","emerald"],["Medication Mgmt.","99.72%","amber"],["Clinical Documentation","99.68%","blue"],["Patient Portal","98.11%","violet"]].map(([n,v,c]:any)=>(
            <div key={n} className="flex items-center justify-between text-xs py-1 border-b last:border-0"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{n}</div><span className="font-semibold">{v}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ All critical EHR applications meeting availability target</div>
        </Section>
        <Section title="Clinical Workflow Performance" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="text-[10px] text-muted-foreground mb-2 grid grid-cols-3"><span>Metric</span><span className="text-right">This Month</span><span className="text-right">vs Last</span></div>
          {[["Chart Completion (24 hrs)","92.4%","▲ 3.2 pp"],["Orders Signed (24 hrs)","94.1%","▲ 2.8 pp"],["Results Acknowledged (4 hrs)","91.6%","▲ 1.9 pp"],["Medication Scans (On-time)","96.8%","▲ 2.6 pp"],["Message Response (24 hrs)","90.3%","▲ 2.1 pp"]].map(([l,v,d]:any)=>(
            <div key={l} className="grid grid-cols-3 text-xs py-1 border-b last:border-0"><span className="truncate">{l}</span><span className="text-right font-semibold">{v}</span><span className="text-right text-emerald-600">{d}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ All key clinical workflows improving</div>
        </Section>
        <Section title="Incident Management" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3">
            <Donut value={70} size={80} stroke={10} color="hsl(0 84% 60%)" />
            <div className="space-y-1 text-xs flex-1">
              {[["P1 - Critical","9","12%","rose"],["P2 - High","15","19%","orange"],["P3 - Medium","28","36%","amber"],["P4 - Low","20","26%","blue"],["P5 - Info","6","8%","violet"]].map(([l,n,p,c]:any)=>(
                <div key={l} className="flex items-center justify-between"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{l}</div><div className="flex gap-3"><span className="font-semibold">{n}</span><span className="text-muted-foreground w-8 text-right">{p}</span></div></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2"><div className="text-2xl font-bold">78</div><div className="text-[10px] text-muted-foreground">Total Incidents</div></div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ P1/P2 incidents down 25% vs last month</div>
        </Section>
        <Section title="Change & Release Success" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={97} size={70} stroke={10} color="hsl(142 71% 45%)" label="97.2%" /><div className="text-[10px] text-muted-foreground">Change Success Rate · ▲ 2.1 pp</div></div>
          {[["Standard Changes","98.6%"],["Normal Changes","96.7%"],["Major Changes","94.1%"],["Emergency Changes","92.3%"]].map(([l,v])=>(<Row key={l} label={l} right={<span className="font-semibold">{v}</span>} />))}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Section title="EHR Performance" action={<a className="text-xs text-blue-600">View details</a>}>
          {[["Patient Chart Open","2.1s","▼ 0.3s"],["Order Entry","1.6s","▼ 0.2s"],["Results Review","1.9s","▼ 0.3s"],["Medication Admin","1.8s","▼ 0.2s"],["Clinical Documentation","2.3s","▼ 0.4s"]].map(([l,v,d]:any)=>(
            <div key={l} className="grid grid-cols-3 text-xs py-1.5 border-b last:border-0"><span className="truncate">{l}</span><span className="text-right font-semibold">{v}</span><span className="text-right text-emerald-600">{d}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ All response times within target</div>
        </Section>
        <Section title="Interface & Integration Health" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="flex items-center gap-3 mb-3"><Donut value={92} size={70} stroke={10} color="hsl(258 89% 66%)" label="92.5%" /><div className="text-[10px] text-muted-foreground">Overall Interface Success<br/>▲ 1.8 pp</div></div>
          {[["ADT (Patient Events)","99.1%","emerald"],["Orders Interface","97.8%","emerald"],["Results Interface","96.3%","emerald"],["ePrescribing","95.4%","emerald"],["Billing Interface","90.2%","amber"]].map(([n,v,c]:any)=>(
            <div key={n} className="flex items-center justify-between text-xs py-1 border-b last:border-0"><div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full bg-${c}-500`} />{n}</div><span className="font-semibold">{v}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-amber-600">⚠ 2 interfaces below target - monitoring</div>
        </Section>
        <Section title="Data Quality & Integrity" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-4 gap-1 text-center text-xs mb-3">
            <div><div className="text-[9px] text-muted-foreground">Patient Demographics</div><div className="font-bold">99.2%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Allergy Data</div><div className="font-bold">97.6%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Medication Data</div><div className="font-bold">98.4%</div></div>
            <div><div className="text-[9px] text-muted-foreground">Clinical Timeliness</div><div className="font-bold">95.8%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1">Top Data Quality Issues</div>
          {[["Missing Allergies","124","violet"],["Duplicate Patients","87","violet"],["Incomplete Medications","56","orange"],["Invalid Phone Numbers","34","orange"]].map(([n,v,c]:any)=>(
            <div key={n} className="flex items-center gap-2 text-xs mb-1"><span className="w-32 truncate">{n}</span><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className={`h-full bg-${c}-500`} style={{width: `${Math.min(100,parseInt(v)/2)}%`}} /></div><span className="w-8 text-right font-semibold">{v}</span></div>
          ))}
          <div className="mt-2 text-[11px] text-emerald-600">✓ Overall data quality improving</div>
        </Section>
        <Section title="Compliance & Security" action={<a className="text-xs text-blue-600">View details</a>}>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">HIPAA Compliance</div><div className="text-lg font-bold">100%</div><div className="text-[9px] text-muted-foreground">▲ 0% vs last month</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Access Review Completed</div><div className="text-lg font-bold">98.7%</div><div className="text-emerald-600 text-[9px]">▲ 2.1 pp</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Privileged Access Compliance</div><div className="text-lg font-bold">99.1%</div><div className="text-emerald-600 text-[9px]">▲ 1.3 pp</div></div>
            <div className="rounded bg-muted/40 p-2"><div className="text-[10px] text-muted-foreground">Security Incidents</div><div className="text-lg font-bold">3</div><div className="text-emerald-600 text-[9px]">▼ 25%</div></div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600">✓ No critical security findings</div>
        </Section>
      </div>

      <BottomCallout
        insight="AI / AIOps Insights"
        insightBody="42 anomalies detected, 31 auto-resolved incidents, 32% MTTR improvement, 186 hrs time saved MTD. AI predictions helped prevent 6 potential P1 incidents this month."
        recommendations={["Optimize database performance for Clinical Documentation module","Address peak-time slowness in Patient Chart Open transactions","Reduce alert noise for orders interface failures","Standardize change windows to reduce clinical impact","Review slow queries impacting results delivery performance"]}
        rightTitle="Operational Value Realized"
        rightValue="$1.76M"
        rightSub="Total Value · ▲ 24% vs last month"
      />
    </DashboardLayout>
  );
}