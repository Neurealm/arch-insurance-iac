import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, Monitor, AlertOctagon, AlertTriangle, ClipboardList, Clock, CheckCircle2 } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function EndpointDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={Monitor}
        title="Endpoint Security & Modern Device Protection – Master KPI / SLA Dashboard"
        subtitle="Real-time view of endpoint security posture, threats, compliance and device protection" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Endpoint Security Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={Monitor} iconBg="bg-blue-50" iconColor="text-blue-600" label="Endpoints Protected" value="48,326" delta="8%" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="Active Threats" value="126" delta="23%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="High Severity Alerts" value="32" delta="27%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ClipboardList} iconBg="bg-violet-50" iconColor="text-violet-600" label="Incidents (This Month)" value="18" delta="25%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Detect" sublabel="(MTTD)" value="18m" delta="20%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Respond" sublabel="(MTTR)" value="42m" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Remediation Success Rate" value="96.4%" delta="3.3 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="EDR / XDR" tone="bg-indigo-600" score={94} scoreLabel="Excellent"
          metrics={[["Sensors Active","47,892","up"],["Detection Coverage","98.7%","up"],["Prevented Attacks","1,842","up"],["XDR Detections","245","up"],["XDR Incidents","76","down"]]}
          trendTitle="Detections Trend (Last 30 Days)" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="XDR detection coverage strong" />
        <PillarCard index={2} title="Antivirus / Anti-malware" tone="bg-violet-600" score={95} scoreLabel="Excellent"
          metrics={[["Malware Blocked","3,842","down"],["Real-time Protection","98.9%","up"],["Scan Coverage","97.4%","up"],["Quarantined Items","1,126","up"],["Signatures Up to Date","99.8%","up"]]}
          trendTitle="Malware Blocked Trend" trend={<Sparkline data={down} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="Malware prevention effective" />
        <PillarCard index={3} title="Mobile Device Security" tone="bg-teal-600" score={91} scoreLabel="Excellent"
          metrics={[["Mobile Devices","6,842","up"],["Threats Blocked","532","down"],["Risky Apps Blocked","312","down"],["Jailbroken / Rooted","24","down"],["Lost / Stolen","18","down"]]}
          trendTitle="Mobile Threats Blocked Trend" trend={<Sparkline data={down} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="Mobile devices well protected" />
        <PillarCard index={4} title="Endpoint Compliance" tone="bg-orange-500" score={93} scoreLabel="Excellent"
          metrics={[["Compliant Endpoints","45,162","up"],["Compliance Rate","93.5%","up"],["Non-compliant","3,164","down"],["Policy Violations","1,248","down"],["Encryption Enabled","96.7%","up"]]}
          trendTitle="Compliance Rate Trend" trend={<Sparkline data={up} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="Compliance rate above target" />
        <PillarCard index={5} title="Device Posture Management" tone="bg-emerald-600" score={91} scoreLabel="Excellent"
          metrics={[["Healthy Devices","44,218","up"],["At Risk Devices","2,364","down"],["Posture Score (Avg)","91/100","up"],["Vulnerable Devices","1,744","down"],["Config Drift","1,032","down"]]}
          trendTitle="Posture Score Trend" trend={<Sparkline data={up} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Posture score improving" />
        <PillarCard index={6} title="Isolation & Remediation" tone="bg-rose-600" score={90} scoreLabel="Good"
          metrics={[["Isolated Endpoints","218","up"],["Auto-Remediated","1,326","up"],["Manual Remediated","492","down"],["Remediation Success","96.1%","up"],["Repeat Incidents","28","down"]]}
          trendTitle="Endpoints Isolated Trend" trend={<Sparkline data={up} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Isolation & remediation effective" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Endpoint Risk Distribution">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(142 71% 45%)" label="48,326" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Low Risk","34,218","70.9%","emerald"],["Medium Risk","9,162","19.0%","amber"],["High Risk","3,946","8.2%","orange"],["Critical Risk","1,000","2.1%","rose"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▼ 16% High/Critical risk endpoints vs last month</div>
        </Section>
        <Section title="Top Threats (This Month)">
          {[["Ransomware Behavior","412","High","18%","down"],["Credential Theft","386","High","12%","down"],["Malware","356","High","8%","down"],["Suspicious Activity","298","Medium","10%","down"],["PUA / Unwanted Software","186","Medium","5%","down"]].map(([t,c,s,r,d]:any)=>(
            <div key={t} className="flex items-center text-xs py-1 border-b last:border-0">
              <span className="flex-1">{t}</span><span className="w-10 text-right font-semibold">{c}</span>
              <span className={`w-14 text-right ${s==="High"?"text-rose-600":"text-amber-600"}`}>{s}</span>
              <span className="w-14 text-right text-emerald-600">▼ {r}</span>
            </div>
          ))}
          <div className="mt-2 text-[10px] text-rose-600">⚠ Ransomware behavior remains top threat</div>
        </Section>
        <Section title="Devices by Platform">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(217 91% 60%)" label="48,326" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Windows","29,812","61.7%","blue"],["macOS","7,842","16.2%","emerald"],["iOS","5,264","10.9%","violet"],["Android","4,286","8.9%","amber"],["Linux","1,122","2.3%","rose"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">Windows remains primary platform</div>
        </Section>
      </div>

      <BottomCallout insight="Endpoint Security Insights (AI)"
        insightBody="12 high-risk devices require immediate attention. Ransomware attempts blocked increased by 18%. 3 devices with outdated AV signatures. Unusual logon patterns detected on 8 devices. USB usage policy violations detected on 24 devices."
        recommendations={["Enforce MFA on all endpoints","Patch critical vulnerabilities on 1,032 devices","Review and remediate high-risk configurations","Restrict USB access on high-risk devices","Enable application control for all Windows devices"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="3,842 threats prevented" rightSub="128 incidents prevented · 18 pts risk score improvement" />
    </DashboardLayout>
  );
}
