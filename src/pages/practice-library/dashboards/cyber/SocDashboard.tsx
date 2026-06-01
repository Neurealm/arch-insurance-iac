import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline, Pill } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, Bell, AlertOctagon, Eye, Clock, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

const up = [40, 45, 50, 52, 55, 58, 60, 62, 65, 68, 70, 74];
const down = [74, 70, 65, 60, 55, 50, 48, 45, 42, 40, 38, 36];

export default function SocDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={Eye}
        title="Security Operations Center (SOC) & Threat Detection – Master KPI / SLA Dashboard"
        subtitle="Real-time view of threats, detections and response performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="SOC Health Score" value="91" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={Bell} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Alerts" value="58,642" delta="12%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="High / Critical Alerts" value="1,842" delta="15%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Detect" sublabel="(MTTD)" value="18m" delta="28%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Respond" sublabel="(MTTR)" value="42m" delta="20%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ShieldAlert} iconBg="bg-orange-50" iconColor="text-orange-600" label="Mean Time to Contain" sublabel="(MTTC)" value="1h 26m" delta="19%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Incidents Resolved" value="312" delta="14%" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={XCircle} iconBg="bg-rose-50" iconColor="text-rose-600" label="False Positive Rate" value="3.2%" delta="0.8 pp" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="SIEM" tone="bg-violet-600" score={92} scoreLabel="Excellent"
          metrics={[["Log Sources", "1,248", "up"],["EPS (Events/Sec)", "28,543", "up"],["Events Analyzed", "74.2B", "up"],["Correlation Rules", "1,126", "up"],["Retention (Days)", "365", "flat"]]}
          trendTitle="Events Ingested Trend (EPS)" trend={<Sparkline data={up} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="SIEM ingestion and health optimal" />
        <PillarCard index={2} title="SOAR" tone="bg-blue-600" score={89} scoreLabel="Good"
          metrics={[["Automated Playbooks", "78", "up"],["Actions Executed", "4,128", "up"],["Automation Rate", "62%", "up"],["Playbook Success", "94.3%", "up"],["Manual Interventions", "156", "down"]]}
          trendTitle="Automation Rate Trend (%)" trend={<Sparkline data={up} color="hsl(217 91% 60%)" width={220} height={40} fill />}
          footer="Automation driving efficiency" />
        <PillarCard index={3} title="Threat Hunting" tone="bg-teal-600" score={85} scoreLabel="Good"
          metrics={[["Hunting Queries", "246", "up"],["Threats Found", "37", "up"],["True Positive Rate", "68%", "up"],["Hunting Coverage", "74%", "up"],["High Value Findings", "12", "up"]]}
          trendTitle="High Value Findings Trend" trend={<Sparkline data={up} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="Hunting uncovering hidden threats" />
        <PillarCard index={4} title="Incident Detection" tone="bg-orange-500" score={90} scoreLabel="Excellent"
          metrics={[["Detections Generated", "2,945", "up"],["Confirmed Incidents", "312", "up"],["Detection Accuracy", "96.8%", "up"],["Critical Detections", "142", "down"],["Coverage (Use Cases)", "91%", "up"]]}
          trendTitle="Detections Over Time" trend={<Sparkline data={up} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="Detection accuracy excellent" />
        <PillarCard index={5} title="Security Analytics" tone="bg-indigo-600" score={88} scoreLabel="Good"
          metrics={[["Analytics Rules", "1,356", "up"],["Rule Firing Rate", "18.7%", "down"],["UEBA Alerts", "412", "up"],["Risk Score Alerts", "1,126", "up"],["Coverage Score", "87%", "up"]]}
          trendTitle="Risk Score Alerts Trend" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="Analytics coverage strong" />
        <PillarCard index={6} title="Threat Intelligence" tone="bg-rose-600" score={87} scoreLabel="Good"
          metrics={[["Intel Feeds", "86", "up"],["IOCs Processed", "1.4M", "up"],["Matches Found", "5,612", "up"],["Enrichment Rate", "94.1%", "up"],["Context Accuracy", "92.7%", "up"]]}
          trendTitle="Intel Matches Trend" trend={<Sparkline data={up} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Threat intel correlation effective" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Alerts by Severity">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(0 84% 60%)" label="58,642" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Critical","1,842","3.1%","rose"],["High","7,126","12.1%","orange"],["Medium","18,752","32.0%","amber"],["Low","22,812","38.9%","emerald"],["Informational","10,110","17.2%","blue"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-rose-600">⚠ High/Critical alerts 8,968 (15.3%) ▼ 15% vs last month</div>
        </Section>
        <Section title="Incidents by Status">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(217 91% 60%)" label="312" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["New","42","13.5%","blue"],["In Progress","68","21.8%","violet"],["Contained","94","30.1%","amber"],["Eradication","56","17.9%","orange"],["Closed","52","16.7%","emerald"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">MTTR (This Month) <span className="font-semibold text-foreground">42m</span> <span className="text-emerald-600">▼ 20%</span></div>
        </Section>
        <Section title="Top Incident Categories (This Month)">
          {[["Malware","104","33.3%","12%","down"],["Credential Access","68","21.8%","8%","down"],["Initial Access","54","17.3%","6%","down"],["Lateral Movement","38","12.2%","5%","down"],["Data Exfiltration","22","7.1%","10%","down"],["Persistence","14","4.5%","8%","up"],["Other","12","3.8%","2%","down"]].map(([c,n,p,t,d]:any)=>(
            <div key={c} className="flex items-center text-xs py-1 border-b last:border-0">
              <span className="flex-1">{c}</span><span className="w-10 text-right font-semibold">{n}</span>
              <span className="w-14 text-right text-muted-foreground">{p}</span>
              <span className={`w-14 text-right ${d==="down"?"text-emerald-600":"text-rose-600"}`}>{d==="down"?"▼":"▲"} {t}</span>
            </div>
          ))}
        </Section>
      </div>

      <BottomCallout insight="SOC Operational Insights"
        insightBody="SLA performance improving across all SOC operations. Threat intel correlation enhancing detection coverage. Analyst capacity freed by 1,248 hours via automation."
        recommendations={["Investigate and tune noisy rules to reduce false positives","Expand hunting coverage for lateral movement techniques","Strengthen detection for identity-based threats","Increase automation for repetitive Tier 1 triage"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.62M" rightSub="Risk Exposure Reduced · ▲ 18% vs last month" />
    </DashboardLayout>
  );
}
