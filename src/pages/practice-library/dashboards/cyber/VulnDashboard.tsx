import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, AlertOctagon, AlertTriangle, ShieldAlert, Eye, Layers, Clock, CheckCircle2 } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function VulnDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={ShieldAlert}
        title="Vulnerability Management & Exposure Management – Master KPI / SLA Dashboard"
        subtitle="Real-time view of vulnerabilities, exposures and risk posture" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Vuln Health Score" value="91" unit="/100" delta="7 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="Critical Vulnerabilities" value="124" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="High Risk Vulnerabilities" value="512" delta="15%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Layers} iconBg="bg-violet-50" iconColor="text-violet-600" label="Total Vulnerabilities" value="18,642" delta="12%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Eye} iconBg="bg-blue-50" iconColor="text-blue-600" label="Exposures (Total)" value="2,846" delta="14%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Layers} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Exposed Assets" value="1,248" delta="11%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(243 75% 59%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Remediate" value="18 days" delta="20%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Patch Compliance" value="94.2%" delta="3.6 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="Vulnerability Scanning" tone="bg-violet-600" score={93} scoreLabel="Excellent"
          metrics={[["Assets Scanned","26,842","up"],["Scan Coverage","98.6%","up"],["New Vulnerabilities","1,248","up"],["Resolved Vulns","1,832","up"]]}
          trendTitle="Vulnerabilities Over Time" trend={<Sparkline data={up} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="Scan coverage and results in good health" />
        <PillarCard index={2} title="Patch Governance" tone="bg-blue-600" score={92} scoreLabel="Excellent"
          metrics={[["Missing Critical Patches","124","down"],["Missing High Patches","512","down"],["Patch Compliance","94.2%","up"],["SLA Compliance","96.1%","up"]]}
          trendTitle="Patch Compliance Over Time" trend={<Sparkline data={up} color="hsl(217 91% 60%)" width={220} height={40} fill />}
          footer="Patch compliance improving" />
        <PillarCard index={3} title="Exposure Analysis" tone="bg-teal-600" score={91} scoreLabel="Excellent"
          metrics={[["Active Exposures","2,846","down"],["Exposures Added","412","up"],["Exposures Remediated","682","up"],["Exposure Coverage","97.8%","up"]]}
          trendTitle="Exposures Over Time" trend={<Sparkline data={down} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="Exposure trend improving" />
        <PillarCard index={4} title="Risk Prioritization" tone="bg-orange-500" score={92} scoreLabel="Excellent"
          metrics={[["Critical Risk Items","124","down"],["High Risk Items","512","down"],["Risk Accepted","86","up"],["Risk Reduced","642","up"]]}
          trendTitle="Risk Score Trend" trend={<Sparkline data={down} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="High risk items decreasing" />
        <PillarCard index={5} title="Attack Surface Mgmt (ASM)" tone="bg-emerald-600" score={90} scoreLabel="Good"
          metrics={[["Internet Facing Assets","1,248","down"],["New Assets Discovered","86","down"],["Stale Assets Removed","152","down"],["Asset Coverage","98.2%","up"]]}
          trendTitle="Attack Surface Over Time" trend={<Sparkline data={down} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Attack surface well managed" />
        <PillarCard index={6} title="Continuous Validation" tone="bg-rose-600" score={93} scoreLabel="Excellent"
          metrics={[["Validation Runs","1,842","up"],["Misconfigurations Found","532","down"],["Remediation Verified","612","up"],["Validation Coverage","97.1%","up"]]}
          trendTitle="Validation Success Rate" trend={<Sparkline data={up} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Validation effectiveness strong" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Vulnerabilities by Severity">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(0 84% 60%)" label="18,642" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Critical","124","0.7%","rose"],["High","512","2.8%","orange"],["Medium","6,842","36.8%","amber"],["Low","7,824","42.0%","emerald"],["Info","1,340","7.7%","blue"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-rose-600">⚠ Critical + High 636 (3.5%) ▼ 21% vs last month</div>
        </Section>
        <Section title="Top Vulnerabilities (This Month)">
          {[["CVE-2026-3094","9.8","248","18%","down"],["CVE-2026-21413","9.1","186","15%","down"],["CVE-2026-27956","8.8","162","8%","down"],["CVE-2026-23334","8.6","148","12%","down"],["CVE-2026-50379","8.1","124","5%","down"]].map(([c,s,n,t,d]:any)=>(
            <div key={c} className="flex items-center text-xs py-1 border-b last:border-0">
              <span className="flex-1">{c}</span><span className="w-10 text-right text-rose-600 font-semibold">{s}</span>
              <span className="w-10 text-right font-semibold">{n}</span>
              <span className="w-14 text-right text-emerald-600">▼ {t}</span>
            </div>
          ))}
        </Section>
        <Section title="Vulnerabilities by Asset Type">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(217 91% 60%)" label="18,642" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Servers","6,842","36.7%","blue"],["Workstations","4,872","25.8%","emerald"],["Cloud Assets","4,126","22.1%","orange"],["Network Devices","2,104","11.3%","violet"],["Applications","758","4.1%","amber"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <BottomCallout insight="Top Recommendations"
        insightBody="Risk reduction trending strongly with critical exposure decreasing. Attack surface compression delivering measurable benefits across environments."
        recommendations={["Remediate 124 critical vulnerabilities","Update missing critical patches","Reduce exposed internet facing assets","Remove excessive privileges","Fix high risk misconfigurations"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.42M" rightSub="Risk Reduction · 312 incidents prevented · 1,248 hrs saved" />
    </DashboardLayout>
  );
}
