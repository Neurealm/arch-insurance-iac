import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, Boxes, AlertOctagon, AlertTriangle, Clock, Activity, Key, ClipboardCheck } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function DevSecOpsDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={Boxes}
        title="Application & DevSecOps Security – Master KPI / SLA Dashboard"
        subtitle="Real-time view of application security posture, DevSecOps adoption and risk" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="AppSec Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={Boxes} iconBg="bg-blue-50" iconColor="text-blue-600" label="Applications in Scope" value="248" delta="12%" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="High / Critical Vulnerabilities" value="342" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="Critical Open Issues" value="76" delta="22%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Remediate" sublabel="(MTTR)" value="6.2 days" delta="20%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-600" label="Pipeline Success Rate" value="96.3%" delta="2.5 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Key} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Secrets Exposed" value="128" delta="23%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(142 71% 45%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ClipboardCheck} iconBg="bg-teal-50" iconColor="text-teal-600" label="Policy Compliance" value="94.1%" delta="3.1 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(173 80% 40%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="SAST / DAST" tone="bg-indigo-600" score={92} scoreLabel="Excellent"
          metrics={[["SAST Scans","1,248","up"],["DAST Scans","486","up"],["High/Critical Findings","214","down"],["Findings Fixed","1,842","up"],["False Positive Rate","6.2%","down"]]}
          trendTitle="Findings Over Time" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="Scan coverage and quality improving" />
        <PillarCard index={2} title="Software Supply Chain Security" tone="bg-violet-600" score={90} scoreLabel="Good"
          metrics={[["High Risk Dependencies","124","down"],["Outdated Dependencies","842","down"],["License Violations","36","down"],["Signed Artifacts","98.1%","up"],["Provenance Verified","94.2%","up"]]}
          trendTitle="Risky Dependencies Over Time" trend={<Sparkline data={down} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="Supply chain risk reducing" />
        <PillarCard index={3} title="API Security" tone="bg-teal-600" score={91} scoreLabel="Excellent"
          metrics={[["APIs Discovered","1,352","up"],["High Risk APIs","96","down"],["API Threats Blocked","1,248","down"],["Auth Failures","2,312","down"],["Schema Violations","84","down"]]}
          trendTitle="API Threats Over Time" trend={<Sparkline data={down} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="API posture strengthening" />
        <PillarCard index={4} title="Secure SDLC" tone="bg-orange-500" score={93} scoreLabel="Excellent"
          metrics={[["SDLC Coverage","96.0%","up"],["Security Gate Pass Rate","95.2%","up"],["Training Completion","92.8%","up"],["Security Reviews","248","up"],["Threat Models Created","86","up"]]}
          trendTitle="Security Gate Pass Rate" trend={<Sparkline data={up} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="SDLC practices maturing" />
        <PillarCard index={5} title="IaC Scanning" tone="bg-emerald-600" score={90} scoreLabel="Good"
          metrics={[["IaC Scans","1,092","up"],["Misconfigurations","342","down"],["High Risk Issues","86","down"],["Drift Detected","124","down"],["Remediation Rate","91.4%","up"]]}
          trendTitle="Misconfigurations Over Time" trend={<Sparkline data={down} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Infrastructure as code more secure" />
        <PillarCard index={6} title="Secrets Management" tone="bg-rose-600" score={92} scoreLabel="Excellent"
          metrics={[["Secrets Scanned","2.84M","up"],["Secrets Found","128","down"],["High Risk Secrets","36","down"],["Secrets Remediated","1,248","up"],["Rotation Compliance","93.6%","up"]]}
          trendTitle="Secrets Exposed Over Time" trend={<Sparkline data={down} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Secrets exposure decreasing" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Vulnerabilities by Severity">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(0 84% 60%)" label="342" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Critical","76","22.2%","rose"],["High","166","48.5%","orange"],["Medium","72","21.1%","amber"],["Low","28","8.2%","emerald"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▼ 18% fewer high/critical vs last month</div>
        </Section>
        <Section title="Top Vulnerable Applications">
          {[["Customer Portal","64","20%","down"],["Mobile App","48","25%","down"],["Payment Gateway","42","12%","down"],["Partner Portal","38","11%","down"],["Analytics API","32","15%","down"]].map(([a,c,t,d]:any)=>(
            <div key={a} className="flex items-center text-xs py-1.5 border-b last:border-0">
              <span className="flex-1">{a}</span><span className="w-10 text-right font-semibold">{c}</span>
              <span className={`w-14 text-right ${d==="down"?"text-emerald-600":"text-rose-600"}`}>▼ {t}</span>
            </div>
          ))}
        </Section>
        <Section title="Pipeline Security Overview">
          <div className="flex items-center gap-3">
            <Donut value={96} size={100} stroke={18} color="hsl(142 71% 45%)" label="96.3%" />
            <div className="text-[11px] flex-1 space-y-1">
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Successful</span><span className="font-semibold">1,248 (96.3%)</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"/>Failed</span><span className="font-semibold">48 (3.1%)</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"/>Blocked</span><span className="font-semibold">12 (0.6%)</span></div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▲ 2.5 pp improvement vs last month</div>
        </Section>
      </div>

      <BottomCallout insight="Top Recommendations"
        insightBody="DevSecOps metrics trending positively. Attack surface and supply chain risk improving. Continued investment in SDLC and IaC controls recommended."
        recommendations={["Remediate 76 critical vulnerabilities","Update high risk dependencies","Fix API auth and schema issues","Remove hard-coded secrets","Enforce IaC security policies"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.42M" rightSub="1,842 vulnerabilities prevented · 1,248 hrs saved" />
    </DashboardLayout>
  );
}
