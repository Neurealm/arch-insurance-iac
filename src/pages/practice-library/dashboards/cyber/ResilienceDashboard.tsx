import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import { ShieldCheck, AlertOctagon, Clock, Activity, Database, Lock, Building2 } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

export default function ResilienceDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={ShieldCheck}
        title="Cyber Resilience, Incident Response & Recovery – Master KPI / SLA Dashboard"
        subtitle="Real-time view of cyber resilience posture, response readiness, and recovery performance" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Resilience Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-violet-50" iconColor="text-violet-600" label="Incidents Responded" value="48" delta="14%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Respond (MTTR)" value="2.6 hrs" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-orange-50" iconColor="text-orange-600" label="Mean Time to Recover (MTTRc)" value="14.2 hrs" delta="21%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Activity} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Recovery Success Rate" value="96.3%" delta="3.1 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Lock} iconBg="bg-rose-50" iconColor="text-rose-600" label="Ransomware Incidents" value="6" delta="25%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Database} iconBg="bg-teal-50" iconColor="text-teal-600" label="Backup Success Rate" value="98.7%" delta="1.8 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(173 80% 40%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Building2} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Business Continuity Score" value="93.4%" delta="4.2 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(243 75% 59%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="Incident Response" tone="bg-indigo-600" score={92} scoreLabel="Excellent"
          metrics={[["Incidents Handled","48","up"],["MTTR (Response)","2.6 hrs","down"],["Containment Success","95.8%","up"],["Escalated to Major","4","down"],["Post-Incident Reviews","46","up"]]}
          trendTitle="Incidents Over Time" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="Response performance improving" />
        <PillarCard index={2} title="Digital Forensics" tone="bg-violet-600" score={90} scoreLabel="Good"
          metrics={[["Forensic Cases","36","up"],["Evidence Collected","112","up"],["Analysis Completed","32","up"],["Avg. TAT (Completion)","3.4 days","down"],["Admissibility Rate","97.2%","up"]]}
          trendTitle="Forensics Cases Over Time" trend={<Sparkline data={up} color="hsl(258 89% 66%)" width={220} height={40} fill />}
          footer="Forensics efficiency strong" />
        <PillarCard index={3} title="Disaster Recovery" tone="bg-teal-600" score={93} scoreLabel="Excellent"
          metrics={[["DR Tests Completed","12","up"],["Success Rate","96.3%","up"],["Critical Systems Tested","38","up"],["RTO Met","94.2%","up"],["RPO Met","95.1%","up"]]}
          trendTitle="DR Test Success Rate" trend={<Sparkline data={up} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="DR readiness on track" />
        <PillarCard index={4} title="Backup Security" tone="bg-orange-500" score={94} scoreLabel="Excellent"
          metrics={[["Backup Success Rate","98.7%","up"],["Backups Completed","3,842","up"],["Backup Failures","52","down"],["Immutable Backups","76.8%","up"],["Backup Encryption","100%","flat"]]}
          trendTitle="Backup Success Rate" trend={<Sparkline data={up} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="Backup posture excellent" />
        <PillarCard index={5} title="Ransomware Resilience" tone="bg-emerald-600" score={91} scoreLabel="Excellent"
          metrics={[["Ransomware Incidents","6","down"],["Attempts Blocked","158","down"],["Endpoints Protected","12,842","up"],["Recovery Success Rate","100%","up"],["Data Restored (TB)","42.6","up"]]}
          trendTitle="Ransomware Attempts" trend={<Sparkline data={down} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="Ransomware resilience strong" />
        <PillarCard index={6} title="Business Continuity" tone="bg-rose-600" score={93} scoreLabel="Excellent"
          metrics={[["BC Plans Active","28","up"],["Plans Tested","12","up"],["Critical Processes Covered","92.6%","up"],["BC Training Completion","89.3%","up"],["Vendor Dependencies","64","down"]]}
          trendTitle="BC Plan Coverage" trend={<Sparkline data={up} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Business continuity improving" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Incidents by Severity (This Month)">
          <div className="flex items-center gap-3">
            <Donut value={100} size={100} stroke={18} color="hsl(217 91% 60%)" label="48" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Critical","6","12.5%","rose"],["High","12","25.0%","orange"],["Medium","20","41.7%","amber"],["Low","10","20.8%","emerald"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▼ 14% fewer incidents vs last month</div>
        </Section>
        <Section title="Recovery Performance (This Month)">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-2">
            <div><div className="text-muted-foreground">MTTR (Response)</div><div className="text-base font-bold">2.6 hrs</div><div className="text-emerald-600">▼ 18%</div></div>
            <div><div className="text-muted-foreground">MTTR (Recovery)</div><div className="text-base font-bold">14.2 hrs</div><div className="text-emerald-600">▼ 21%</div></div>
            <div><div className="text-muted-foreground">Recovery Success</div><div className="text-base font-bold">96.3%</div><div className="text-emerald-600">▲ 3.1 pp</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground">SLA Target ≤ 24 hrs · Recovery Success ≥ 95%</div>
          <Sparkline data={down} width={260} height={50} color="hsl(217 91% 60%)" fill />
        </Section>
        <Section title="Backup Overview">
          <div className="flex items-center gap-3">
            <Donut value={98} size={100} stroke={18} color="hsl(142 71% 45%)" label="3,842" />
            <div className="text-[11px] flex-1 space-y-1">
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Successful</span><span className="font-semibold">3,790 (98.7%)</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"/>Failed</span><span className="font-semibold">52 (1.3%)</span></div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">▲ 1.8 pp improvement vs last month</div>
        </Section>
      </div>

      <BottomCallout insight="Top Recommendations"
        insightBody="Resilience posture strengthening. Recovery SLA performance ahead of target. DR test cadence and immutable backup adoption recommended for next cycle."
        recommendations={["Improve phishing detection coverage","Reduce critical vulnerabilities MTTR","Increase immutable backup coverage","Conduct more frequent DR tests","Enhance vendor risk monitoring"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.42M" rightSub="124 incidents prevented · 248 hrs downtime avoided" />
    </DashboardLayout>
  );
}
