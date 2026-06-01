import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, Database, AlertOctagon, Lock, Eye, FileText, KeyRound, ClipboardCheck } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function DlpDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={Lock}
        title="Data Security & Privacy Protection (DLP) – Master KPI / SLA Dashboard"
        subtitle="Real-time view of data protection posture, DLP enforcement and privacy compliance" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Data Security Score" value="91" unit="/100" delta="5 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={Database} iconBg="bg-blue-50" iconColor="text-blue-600" label="Data Assets Classified" value="42,318" delta="9%" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="DLP Policy Violations" value="1,842" delta="16%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Eye} iconBg="bg-orange-50" iconColor="text-orange-600" label="Sensitive Data Exposure" value="86" delta="24%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Lock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Encryption Coverage" value="97.8%" delta="2.4 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={KeyRound} iconBg="bg-blue-50" iconColor="text-blue-600" label="Privileged Data Access" value="3,124" delta="11%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="Risky access · vs last month" />
        <ExecKpiCard Icon={ClipboardCheck} iconBg="bg-teal-50" iconColor="text-teal-600" label="Privacy Compliance" value="94.6%" delta="3.2 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(173 80% 40%)" fill />} target="GDPR / CCPA · vs last month" />
        <ExecKpiCard Icon={FileText} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="DSAR Fulfillment SLA" value="98.2%" delta="1.6 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(243 75% 59%)" fill />} target="Target ≥ 95%" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="Data Discovery & Classification" tone="bg-indigo-600" score={92} scoreLabel="Excellent"
          metrics={[["Assets Scanned","218K","up"],["Classified Assets","42,318","up"],["Unclassified","1,842","down"],["Sensitive Records","8.4M","up"],["Coverage","94.3%","up"]]}
          trendTitle="Classification Coverage" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="Discovery & classification healthy" />
        <PillarCard index={2} title="DLP Enforcement" tone="bg-violet-600" score={90} scoreLabel="Good"
          metrics={[["Policies Active","318","up"],["Violations Blocked","1,842","down"],["Email Channel","612","down"],["Endpoint Channel","842","down"],["Cloud / SaaS Channel","388","down"]]}
          trendTitle="DLP Violations Over Time" trend={<Sparkline data={down} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="DLP enforcement effective" />
        <PillarCard index={3} title="Encryption & Key Mgmt" tone="bg-teal-600" score={93} scoreLabel="Excellent"
          metrics={[["Encryption Coverage","97.8%","up"],["Keys Managed","12,842","up"],["Key Rotation Compliance","94.6%","up"],["Unencrypted Assets","412","down"],["HSM Backed Keys","86.2%","up"]]}
          trendTitle="Encryption Coverage Trend" trend={<Sparkline data={up} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="Encryption posture strong" />
        <PillarCard index={4} title="Privacy & Compliance" tone="bg-orange-500" score={92} scoreLabel="Excellent"
          metrics={[["GDPR Compliance","95.1%","up"],["CCPA Compliance","94.3%","up"],["HIPAA Compliance","92.8%","up"],["DSAR Requests","248","up"],["DSAR SLA","98.2%","up"]]}
          trendTitle="Privacy Compliance Trend" trend={<Sparkline data={up} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="Privacy compliance improving" />
        <PillarCard index={5} title="Insider Risk & DAG" tone="bg-emerald-600" score={89} scoreLabel="Good"
          metrics={[["High Risk Users","124","down"],["Risky Activities","842","down"],["Data Exfiltration Attempts","48","down"],["Excessive Access","532","down"],["Sensitive Shares","1,124","down"]]}
          trendTitle="Insider Risk Trend" trend={<Sparkline data={down} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Insider risk decreasing" />
        <PillarCard index={6} title="Data Protection (CASB / SSE)" tone="bg-rose-600" score={91} scoreLabel="Excellent"
          metrics={[["SaaS Apps Monitored","248","up"],["Sanctioned Apps","186","up"],["Shadow IT Detected","62","down"],["Risky Uploads Blocked","1,248","down"],["Sessions Inspected","2.84M","up"]]}
          trendTitle="Risky Uploads Blocked" trend={<Sparkline data={down} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Cloud data protection strong" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="DLP Violations by Channel">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(0 84% 60%)" label="1,842" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Endpoint","842","45.7%","blue"],["Email","612","33.2%","violet"],["Cloud / SaaS","248","13.5%","emerald"],["Network","98","5.3%","amber"],["Other","42","2.3%","rose"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▼ 16% violations vs last month</div>
        </Section>
        <Section title="Sensitive Data by Type">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(217 91% 60%)" label="8.4M" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["PII","3.2M","38.1%","blue"],["PHI","1.8M","21.4%","emerald"],["PCI","1.2M","14.3%","orange"],["Confidential","1.5M","17.9%","violet"],["IP / Source Code","0.7M","8.3%","rose"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
        </Section>
        <Section title="Top Data Risk Categories">
          {[["Cloud Storage Exposure","High","18%","up"],["Unencrypted Databases","High","12%","down"],["Email Data Leakage","Medium","9%","down"],["Excessive Access","Medium","11%","down"],["Shadow SaaS","Low","6%","down"]].map(([c,s,t,d]:any)=>(
            <div key={c} className="flex items-center text-xs py-1.5 border-b last:border-0">
              <span className="flex-1">{c}</span>
              <span className={`w-14 text-right ${s==="High"?"text-rose-600":s==="Medium"?"text-amber-600":"text-emerald-600"}`}>{s}</span>
              <span className={`w-14 text-right ${d==="down"?"text-emerald-600":"text-rose-600"}`}>{d==="down"?"▼":"▲"} {t}</span>
            </div>
          ))}
        </Section>
      </div>

      <BottomCallout insight="Top Recommendations"
        insightBody="Data exposure trending down across all channels. Encryption coverage improvement and DLP policy tuning recommended for next cycle. Insider risk patterns stable."
        recommendations={["Remediate 86 sensitive data exposures","Encrypt remaining 412 unencrypted assets","Reduce excessive access for 532 users","Tune DLP rules to reduce false positives","Block 62 shadow IT applications"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$2.96M" rightSub="Data Breach Risk Reduced · 1,842 violations blocked" />
    </DashboardLayout>
  );
}
