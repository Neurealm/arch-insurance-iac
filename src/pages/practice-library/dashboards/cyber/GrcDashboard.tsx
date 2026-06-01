import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, ClipboardCheck, AlertOctagon, ClipboardList, Activity, Users, FileCheck, ShieldAlert } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function GrcDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={ShieldCheck}
        title="Governance, Risk & Compliance (GRC) – Master KPI / SLA Dashboard"
        subtitle="Real-time view of GRC posture, compliance status and risk performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Overall GRC Score" value="91" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={ClipboardCheck} iconBg="bg-blue-50" iconColor="text-blue-600" label="Compliance Coverage" value="94.2%" delta="3.6 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="High Risk Findings" value="128" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ClipboardList} iconBg="bg-orange-50" iconColor="text-orange-600" label="Open Audit Items" value="156" delta="14%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Activity} iconBg="bg-violet-50" iconColor="text-violet-600" label="Control Effectiveness" value="92.1%" delta="2.8 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={FileCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Policies Active" value="342" delta="12" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Users} iconBg="bg-violet-50" iconColor="text-violet-600" label="Third-Party Risks High" value="42" delta="16%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ShieldAlert} iconBg="bg-teal-50" iconColor="text-teal-600" label="Audit Readiness" value="93.4%" delta="4.2 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(173 80% 40%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="Regulatory Compliance" tone="bg-indigo-600" score={93} scoreLabel="Excellent"
          metrics={[["Frameworks in Scope","12","up"],["Requirements Total","1,248","up"],["Requirements Met","1,175","up"],["Requirements Overdue","73","down"],["Compliance Coverage","94.2%","up"]]}
          trendTitle="Compliance Coverage Trend" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="Compliance coverage improving" />
        <PillarCard index={2} title="Policy Management" tone="bg-violet-600" score={92} scoreLabel="Excellent"
          metrics={[["Policies Total","342","up"],["Policies Active","318","up"],["Policies Under Review","18","down"],["Policies Expired","6","down"],["Review Compliance","93.6%","up"]]}
          trendTitle="Policy Trend" trend={<Sparkline data={up} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="Policy hygiene strong" />
        <PillarCard index={3} title="Risk Management" tone="bg-teal-600" score={91} scoreLabel="Excellent"
          metrics={[["Risks Identified","486","up"],["High Risks","128","down"],["Medium Risks","236","down"],["Low Risks","122","down"],["Risk Treatment Rate","89.7%","up"]]}
          trendTitle="Risk Trend" trend={<Sparkline data={down} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="Risk levels under control" />
        <PillarCard index={4} title="Audit Readiness" tone="bg-orange-500" score={93} scoreLabel="Excellent"
          metrics={[["Audits Scheduled","18","up"],["Audits in Progress","5","up"],["Open Audit Items","156","down"],["Overdue Items","28","down"],["Audit Readiness","93.4%","up"]]}
          trendTitle="Audit Readiness Trend" trend={<Sparkline data={up} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="On track for audit readiness" />
        <PillarCard index={5} title="Control Mapping" tone="bg-emerald-600" score={92} scoreLabel="Excellent"
          metrics={[["Controls Total","1,024","up"],["Controls Implemented","942","up"],["Controls Effective","861","up"],["Testing in Progress","54","up"],["Control Effectiveness","92.1%","up"]]}
          trendTitle="Control Effectiveness Trend" trend={<Sparkline data={up} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Control effectiveness improving" />
        <PillarCard index={6} title="Third-Party Risk" tone="bg-rose-600" score={88} scoreLabel="Good"
          metrics={[["Vendors Assessed","248","up"],["High Risk Vendors","42","down"],["Inherent Risk Score","3.2/5","down"],["Overdue Assessments","15","down"],["Assessment Coverage","90.3%","up"]]}
          trendTitle="Third-Party Risk Score Trend" trend={<Sparkline data={down} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Monitor third-party risks" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Compliance by Framework">
          <div className="flex items-center gap-3">
            <Donut value={94} size={100} stroke={18} color="hsl(217 91% 60%)" label="94.2%" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["NIST CSF","96.8%","blue"],["ISO 27001","94.1%","emerald"],["SOC 2 Type II","93.0%","violet"],["PCI DSS","92.5%","orange"],["HIPAA","91.7%","rose"],["Other","89.2%","amber"]].map(([n,c,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c}</span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▲ 3.6 pp vs last month</div>
        </Section>
        <Section title="Requirements Status">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(142 71% 45%)" label="1,248" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Met","1,175","94.1%","emerald"],["Partially Met","42","3.4%","amber"],["Not Met","24","1.9%","rose"],["Not Applicable","7","0.6%","blue"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▲ 2.8 pp improvement vs last month</div>
        </Section>
        <Section title="Top Risk Categories">
          {[["Data Security","4.2","up"],["Access Management","4.0","up"],["Third-Party Risk","3.8","up"],["Technology & Infrastructure","3.5","flat"],["Compliance & Legal","3.1","down"],["Operations","2.9","down"]].map(([c,s,t]:any)=>(
            <div key={c} className="flex items-center text-xs py-1.5 border-b last:border-0">
              <span className="flex-1">{c}</span>
              <span className="w-10 text-right font-semibold">{s}</span>
              <span className={`w-6 text-right ${t==="up"?"text-rose-600":t==="down"?"text-emerald-600":"text-muted-foreground"}`}>{t==="up"?"▲":t==="down"?"▼":"—"}</span>
            </div>
          ))}
        </Section>
      </div>

      <BottomCallout insight="Top Recommendations"
        insightBody="GRC posture trending up. Critical compliance gaps closing. Third-party residual risk requires continued monitoring."
        recommendations={["Close 28 overdue audit items","Remediate 14 high-risk access findings","Update policies pending review","Improve control testing coverage","Strengthen third-party risk assessments"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.42M" rightSub="Risk Reduction · $1.26M Audit Cost Avoidance · 1,248 hrs efficiency" />
    </DashboardLayout>
  );
}
