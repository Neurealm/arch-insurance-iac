import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline, Progress, Pill } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader, PillarCard } from "./_shared";
import {
  ShieldCheck, UserCheck, ClipboardCheck, ShieldAlert, Fingerprint, KeyRound,
  AlertTriangle, AlertOctagon,
} from "lucide-react";

const up = [40, 45, 48, 50, 52, 55, 58, 60, 62, 64, 66, 70];
const down = [70, 64, 60, 55, 50, 48, 45, 42, 40, 38, 36, 34];
const flat = [50, 52, 51, 53, 52, 54, 53, 55, 54, 56, 55, 57];

export default function IamDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader
        Icon={UserCheck}
        title="Identity & Access Management (IAM) – Master KPI / SLA Dashboard"
        subtitle="Real-time view of identity security, access controls and user experience"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="IAM Health Score" value="92" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Excellent · vs last month" />
        <ExecKpiCard Icon={UserCheck} iconBg="bg-blue-50" iconColor="text-blue-600" label="User Provisioning" sublabel="(SLA)" value="97.6%" delta="2.4 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="Target: ≥ 95%" />
        <ExecKpiCard Icon={ClipboardCheck} iconBg="bg-violet-50" iconColor="text-violet-600" label="Access Review" sublabel="Completion" value="94.1%" delta="4.1 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(258 89% 66%)" fill />} target="Target: ≥ 90%" />
        <ExecKpiCard Icon={ShieldAlert} iconBg="bg-rose-50" iconColor="text-rose-600" label="Privileged Access" sublabel="Incidents" value="5" delta="38%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Fingerprint} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="MFA Adoption" value="91.3%" delta="6.3 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Target: ≥ 85%" />
        <ExecKpiCard Icon={KeyRound} iconBg="bg-blue-50" iconColor="text-blue-600" label="SSO Adoption" value="88.7%" delta="5.7 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="Target: ≥ 85%" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="High Risk Sign-Ins" sublabel="Blocked" value="1,246" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-amber-50" iconColor="text-amber-600" label="Identity-Related" sublabel="Incidents" value="12" delta="25%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(38 92% 50%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <PillarCard index={1} title="Identity Governance" tone="bg-indigo-600" score={90} scoreLabel="Excellent"
          metrics={[["Access Reviews (On-time)", "94.1%", "up"], ["Orphan Accounts", "128", "down"], ["Stale Accounts (>90d)", "342", "down"], ["Policy Violations", "76", "down"]]}
          trendTitle="Trend (Last 30 Days)" trend={<Sparkline data={up} color="hsl(243 75% 59%)" width={220} height={40} fill />}
          footer="All governance controls within target" />
        <PillarCard index={2} title="Privileged Access Mgmt (PAM)" tone="bg-blue-600" score={93} scoreLabel="Excellent"
          metrics={[["Privileged Accounts", "1,124", "flat"], ["Active Sessions", "182", "up"], ["Just-in-Time (JIT)", "78.6%", "up"], ["PAM Violations", "5", "down"]]}
          trendTitle="Trend (Last 30 Days)" trend={<Sparkline data={up} color="hsl(217 91% 60%)" width={220} height={40} fill />}
          footer="Privileged access well controlled" />
        <PillarCard index={3} title="MFA / Passwordless" tone="bg-teal-600" score={91} scoreLabel="Excellent"
          metrics={[["MFA Adoption", "91.3%", "up"], ["Passwordless Users", "28.4%", "up"], ["MFA Challenges", "146,821", "up"], ["MFA Fatigue Rate", "0.27%", "down"]]}
          trendTitle="Trend (Last 30 Days)" trend={<Sparkline data={up} color="hsl(173 80% 40%)" width={220} height={40} fill />}
          footer="MFA adoption on track" />
        <PillarCard index={4} title="Conditional Access" tone="bg-orange-500" score={88} scoreLabel="Good"
          metrics={[["CA Policy Coverage", "92.2%", "up"], ["Compliant Sign-ins", "97.8%", "up"], ["Blocked Sign-ins", "6,843", "down"], ["Policy Gaps", "12", "down"]]}
          trendTitle="Trend (Last 30 Days)" trend={<Sparkline data={flat} color="hsl(25 95% 53%)" width={220} height={40} fill />}
          footer="Conditional access effective" />
        <PillarCard index={5} title="Federation / SSO" tone="bg-emerald-600" score={89} scoreLabel="Good"
          metrics={[["SSO Adoption", "88.7%", "up"], ["SSO Success Rate", "99.2%", "up"], ["Applications (SSO)", "146", "up"], ["Failed SSO Attempts", "1,246", "down"]]}
          trendTitle="Trend (Last 30 Days)" trend={<Sparkline data={up} color="hsl(142 71% 45%)" width={220} height={40} fill />}
          footer="SSO performance optimal" />
        <PillarCard index={6} title="Zero Trust Identity Controls" tone="bg-rose-600" score={91} scoreLabel="Excellent"
          metrics={[["ZT Policies Enforced", "94.3%", "up"], ["Device Compliance", "93.6%", "up"], ["Risky Sign-ins Blocked", "1,842", "down"], ["Trust Score (Avg)", "87/100", "up"]]}
          trendTitle="Trend (Last 30 Days)" trend={<Sparkline data={up} color="hsl(0 72% 51%)" width={220} height={40} fill />}
          footer="Zero trust posture strong" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
        <Section title="User & Access Overview">
          <div className="flex items-center gap-3">
            <Donut value={100} size={90} stroke={16} color="hsl(217 91% 60%)" />
            <div className="text-[11px] flex-1 space-y-1">
              {[["Employees","29,812","61.7%","blue"],["Contractors","7,842","16.2%","violet"],["Partners","6,842","14.1%","emerald"],["Service Accounts","2,876","5.9%","amber"],["Others","984","2.1%","rose"]].map(([n,c,p,col]:any)=>(
                <div key={n} className="flex justify-between"><span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full bg-${col}-500`}/>{n}</span><span className="font-semibold">{c} <span className="text-muted-foreground">({p})</span></span></div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2 text-[10px] text-emerald-600">✓ User directory healthy</div>
        </Section>
        <Section title="Access Request Performance (SLA)">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-2">
            <div><div className="text-muted-foreground">New Requests</div><div className="text-base font-bold">5,842</div><div className="text-emerald-600">▲ 12%</div></div>
            <div><div className="text-muted-foreground">Approved</div><div className="text-base font-bold">5,102</div><div className="text-emerald-600">▲ 19%</div></div>
            <div><div className="text-muted-foreground">Rejected</div><div className="text-base font-bold">412</div><div className="text-rose-600">▼ 8%</div></div>
          </div>
          <div className="text-[10px] text-muted-foreground">Avg. Time to Approve</div>
          <div className="text-lg font-bold">6.3 hrs <span className="text-[10px] text-emerald-600">▼ 10%</span></div>
          <Sparkline data={down} width={260} height={50} color="hsl(217 91% 60%)" fill />
        </Section>
        <Section title="Top Access Risks">
          {[["Excessive Privileges","532","18%","up"],["Dormant Privileged Accts","342","12%","up"],["Shared Accounts","218","15%","up"],["MFA Not Enforced","176","9%","up"],["Untrusted / Non-Compliant","156","6%","up"]].map(([r,c,t,d]:any)=>(
            <div key={r} className="flex items-center justify-between py-1 text-xs border-b last:border-0">
              <span>{r}</span><span className="font-semibold">{c} <span className={d==="up"?"text-rose-600":"text-emerald-600"}>▲ {t}</span></span>
            </div>
          ))}
          <div className="mt-2 text-[10px] text-amber-600">⚠ Review high-risk access</div>
        </Section>
        <Section title="Authentication Events">
          <div className="flex items-center gap-3">
            <Donut value={87} size={90} stroke={16} color="hsl(142 71% 45%)" label="1.24M" />
            <div className="text-[11px] flex-1 space-y-1">
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Success</span><span className="font-semibold">1.08M (87.1%)</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"/>MFA</span><span className="font-semibold">146.8K (11.8%)</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"/>Failed</span><span className="font-semibold">13.2K (1.1%)</span></div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600">✓ Auth success rate 98.9%</div>
        </Section>
      </div>

      <BottomCallout
        insight="Identity Security Insights"
        insightBody="Great job! Orphan accounts and stale accounts reduced by 22% and 17% respectively this month. MFA adoption climbed across executive and engineering personas, lowering risky sign-ins by 18%."
        recommendations={["Enforce MFA for remaining high-risk users","Reduce excessive privileges for contractors","Review and disable dormant privileged accounts","Close 12 conditional access policy gaps"]}
        rightTitle="Operational Value Realized (This Period)"
        rightValue="$2.84M"
        rightSub="Risk Exposure Reduced · ▲ 18% vs last month"
      />
    </DashboardLayout>
  );
}
