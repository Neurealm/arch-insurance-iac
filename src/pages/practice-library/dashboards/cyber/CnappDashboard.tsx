import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, Cloud, AlertOctagon, AlertTriangle, Clock, Settings, ShieldAlert } from "lucide-react";

const up = [40, 45, 50, 52, 55, 58, 60, 62, 65, 68, 70, 74];
const down = [74, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function CnappDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={Cloud}
        title="Cloud Security & CNAPP – Master KPI / SLA Dashboard"
        subtitle="Real-time view of cloud security posture, workload protection and multicloud governance" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Cloud Security Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={Cloud} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Cloud Accounts" value="28" delta="2" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="Critical Risk Findings" value="124" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="High Risk Findings" value="512" delta="15%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Detect" sublabel="(MTTD)" value="18m" delta="22%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Respond" sublabel="(MTTR)" value="42m" delta="17%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Policy Compliance" value="94.1%" delta="3.2 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Settings} iconBg="bg-violet-50" iconColor="text-violet-600" label="Open Misconfigurations" value="1,248" delta="12%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="CSPM" subtitle="Cloud Security Posture Mgmt" tone="bg-indigo-600" score={93} scoreLabel="Excellent"
          metrics={[["Resources Scanned","218K","up"],["Misconfigurations","842","down"],["High Risk Resources","124","down"],["Public Resources","486","down"],["Policy Compliance","94.3%","up"]]}
          trendTitle="Misconfigurations Over Time" trend={<Sparkline data={down} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="Posture improving across all accounts" />
        <PillarCard index={2} title="CWPP" subtitle="Cloud Workload Protection" tone="bg-violet-600" score={91} scoreLabel="Excellent"
          metrics={[["Workloads Protected","12,842","up"],["Threats Detected","842","down"],["Critical Alerts","86","down"],["Runtime Incidents","112","down"],["Agent Coverage","98.6%","up"]]}
          trendTitle="Threats Detected Over Time" trend={<Sparkline data={down} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="Workload protection strong" />
        <PillarCard index={3} title="CIEM" subtitle="Entitlement Mgmt" tone="bg-teal-600" score={92} scoreLabel="Excellent"
          metrics={[["Identities Analyzed","18,245","up"],["Excessive Permissions","512","down"],["High Risk Identities","124","down"],["Unused Access","1,248","down"],["Entitlement Changes","342","up"]]}
          trendTitle="Excessive Permissions Trend" trend={<Sparkline data={down} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="Over-privileged access reduced" />
        <PillarCard index={4} title="Kubernetes Security" subtitle="K8s Security Posture" tone="bg-orange-500" score={90} scoreLabel="Good"
          metrics={[["Clusters Scanned","46","up"],["Workloads Protected","4,521","up"],["Misconfigurations","324","down"],["Image Vulnerabilities","217","down"],["Runtime Alerts","86","down"]]}
          trendTitle="K8s Misconfigurations Trend" trend={<Sparkline data={down} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="K8s security posture improving" />
        <PillarCard index={5} title="Container Security" subtitle="Container & Image Security" tone="bg-emerald-600" score={91} scoreLabel="Excellent"
          metrics={[["Images Scanned","68,421","up"],["Vulnerable Images","542","down"],["Critical Vulnerabilities","86","down"],["Runtime Violations","112","down"],["Image Compliance","95.2%","up"]]}
          trendTitle="Vulnerabilities Over Time" trend={<Sparkline data={down} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Container risk decreasing" />
        <PillarCard index={6} title="Multicloud Governance" subtitle="Security & Governance" tone="bg-rose-600" score={92} scoreLabel="Excellent"
          metrics={[["Cloud Accounts","28","up"],["Regions Monitored","92","up"],["Policy Coverage","94.1%","up"],["Cross-Account Issues","342","down"],["Data Locations","1,248","up"]]}
          trendTitle="Compliance by Cloud Provider" trend={<Sparkline data={up} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Strong multicloud governance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Risk Overview (This Month)">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(0 84% 60%)" label="1,836" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Critical","124","6.8%","rose"],["High","512","27.9%","orange"],["Medium","842","45.9%","amber"],["Low","358","19.5%","emerald"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-amber-600">⚠ 15% increase in critical risks vs last month</div>
        </Section>
        <Section title="Risks by Cloud Provider">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(217 91% 60%)" label="1,836" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["AWS","842","45.9%","orange"],["Azure","612","33.3%","blue"],["GCP","256","13.9%","emerald"],["Oracle","86","4.7%","rose"],["Other","40","2.2%","violet"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
        </Section>
        <Section title="Alerts by Severity (This Month)">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(258 89% 66%)" label="1,542" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Critical","124","8.0%","rose"],["High","512","33.2%","orange"],["Medium","578","37.5%","amber"],["Low","328","21.3%","emerald"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <BottomCallout insight="Top Recommendations"
        insightBody="Multicloud risk distribution skewed toward AWS public exposure. Container vulnerabilities trending down. Critical access patterns warrant immediate remediation."
        recommendations={["Remediate 124 critical misconfigurations","Restrict public access to 486 resources","Remove excessive permissions for 512 identities","Patch 86 vulnerable container images","Enable MFA for 412 privileged identities"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.42M" rightSub="Risk Exposure Reduced · 42% Alerts Reduced · 1,248 hrs saved" />
    </DashboardLayout>
  );
}
