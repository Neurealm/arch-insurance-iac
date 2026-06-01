import DashboardLayout from "../_layout";
import { Section, Donut, Sparkline, MiniBars, Progress, Pill, Kpi } from "@/components/practice-library/widgets";
import { ExecKpiCard, BottomCallout } from "@/components/practice-library/exec";
import { CyberHeader } from "./_shared";
import { ShieldCheck, Star, AlertOctagon, AlertTriangle, Clock, ClipboardCheck, Database, Bell, Layers, PlayCircle, Bot } from "lucide-react";

const up = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 76];
const down = [76, 70, 65, 60, 55, 52, 50, 48, 45, 42, 40, 38];

function PillarBlock({
  index, title, tone, sub, score, scoreLabel, kpis, risks, actions, trend,
}: {
  index: number; title: string; tone: string; sub: string;
  score: number; scoreLabel: string;
  kpis: Array<[string, string, "up" | "down" | "flat"]>;
  risks: Array<[string, "High" | "Medium" | "Low"]>;
  actions: string[];
  trend: { title: string; node: React.ReactNode };
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className={`${tone} px-4 py-2.5 text-white`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <div className="text-sm font-bold uppercase tracking-wide">{title}</div>
        </div>
        <div className="text-[10px] opacity-90">{sub}</div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Pillar Health Score</div>
            <div className="flex items-center gap-2">
              <Donut value={score} size={56} stroke={8} color={score >= 90 ? "hsl(142 71% 45%)" : score >= 80 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)"} label={`${score}`} />
              <div>
                <div className="text-xs font-semibold">{scoreLabel}</div>
                <div className="text-[10px] text-muted-foreground">/100</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Key KPIs</div>
            <div className="space-y-1 text-[11px]">
              {kpis.map(([k, v, d]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground truncate pr-1">{k}</span>
                  <span className="font-semibold flex items-center gap-1">{v}{d === "up" && <span className="text-emerald-600">▲</span>}{d === "down" && <span className="text-rose-600">▼</span>}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-3">
          <div className="text-[10px] text-muted-foreground mb-1">{trend.title}</div>
          {trend.node}
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">Top Risks</div>
            {risks.map(([r, t]) => (
              <div key={r} className="flex items-center justify-between py-0.5">
                <span className="truncate pr-1">• {r}</span>
                <Pill tone={t === "High" ? "warn" : t === "Medium" ? "neutral" : "ok"}>{t}</Pill>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">Key Actions</div>
            {actions.map(a => (<div key={a} className="py-0.5">• {a}</div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CyberMasterDashboard() {
  return (
    <DashboardLayout>
      <CyberHeader Icon={ShieldCheck}
        title="Cybersecurity Practice – Master KPI / SLA Dashboard"
        subtitle="Real-time view of security operations, risk posture and resilience" />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        <ExecKpiCard Icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Overall Security" sublabel="Health Score" value="88" unit="/100" delta="6 pts" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="Good · vs last month" />
        <ExecKpiCard Icon={Star} iconBg="bg-blue-50" iconColor="text-blue-600" label="SLA Achievement" value="96.3%" delta="2.1 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(217 91% 60%)" fill />} target="Target: ≥ 95%" />
        <ExecKpiCard Icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600" label="Security Incidents" value="124" delta="18%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(0 84% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={AlertTriangle} iconBg="bg-orange-50" iconColor="text-orange-600" label="Critical Incidents" value="7" delta="22%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(25 95% 53%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-violet-50" iconColor="text-violet-600" label="Mean Time to Detect" sublabel="(MTTD)" value="18m" delta="20%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(258 89% 66%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600" label="Mean Time to Respond" sublabel="(MTTR)" value="62m" delta="15%" deltaDir="down" deltaTone="positive" visual={<Sparkline data={down} color="hsl(217 91% 60%)" fill />} target="vs last month" />
        <ExecKpiCard Icon={ClipboardCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Compliance Score" value="93.7%" delta="3.4 pp" deltaDir="up" visual={<Sparkline data={up} color="hsl(142 71% 45%)" fill />} target="vs last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <PillarBlock index={1} title="Identity & Trust" tone="bg-indigo-600" sub="IAM · Zero Trust · PAM" score={86} scoreLabel="Good"
          kpis={[["MFA Adoption","98.1%","up"],["Privileged Accounts","1,124","down"],["Access Reviews On-time","96.5%","up"],["Zero Trust Coverage","78.6%","up"]]}
          risks={[["Excessive standing privileges","High"],["Inactive user accounts","Medium"],["MFA not enabled for legacy apps","Medium"]]}
          actions={["Reduce privileged accounts","Enforce MFA for all users","Increase Zero Trust coverage"]}
          trend={{ title: "Trend (Last 30 Days)", node: (
            <div className="flex items-center gap-2">
              <Sparkline data={[80,82,84,85,87,88,90,92,94,96,97,98]} color="hsl(243 75% 59%)" fill width={140} height={36} />
              <div className="text-[9px] space-y-0.5">
                <div className="flex items-center gap-1"><span className="h-1.5 w-2 rounded-sm bg-indigo-500"/>MFA Adoption</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-2 rounded-sm bg-violet-400"/>ZT Coverage</div>
              </div>
            </div>
          ) }} />
        <PillarBlock index={2} title="Detection & Protection" tone="bg-blue-600" sub="SOC · Endpoint · Network · Cloud" score={90} scoreLabel="Excellent"
          kpis={[["Detection Coverage","96.2%","up"],["Alert Triage (SLA)","93.4%","up"],["Threats Blocked","18,642","up"],["False Positive Rate","3.2%","down"]]}
          risks={[["Phishing threats increasing","High"],["Unpatched exploitable assets","Medium"],["Cloud misconfigurations","Medium"]]}
          actions={["Harden email security controls","Improve asset patching","Reduce cloud misconfigurations"]}
          trend={{ title: "Threats Blocked (Last 30 Days)", node: (
            <MiniBars data={[42,55,38,61,72,48,66,80,58,74,90,68,55,82,76,64,88,72,60,95,78]} color="hsl(217 91% 60%)" width={180} height={40} />
          ) }} />
        <PillarBlock index={3} title="Governance & Risk" tone="bg-emerald-600" sub="GRC · Data Security · Vulnerability Mgmt" score={84} scoreLabel="Good"
          kpis={[["Open Critical Risks","42","down"],["Vulnerability Remediation (SLA)","92.6%","up"],["Risk Acceptance (On-time)","95.1%","up"],["Policy Compliance","94.0%","up"]]}
          risks={[["Unremediated critical vulnerabilities","High"],["Shadow data exposure","High"],["Third-party risk exposure","Medium"]]}
          actions={["Remediate critical vulnerabilities","Encrypt sensitive data at rest","Strengthen vendor assessments"]}
          trend={{ title: "Vulnerabilities by Severity", node: (
            <div className="flex items-center gap-2">
              <Donut value={88} size={56} stroke={10} color="hsl(0 84% 60%)" label="1,342" />
              <div className="text-[9px] space-y-0.5">
                <div className="flex items-center gap-1"><span className="h-1.5 w-2 rounded-sm bg-rose-500"/>Critical · 162</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-2 rounded-sm bg-orange-500"/>High · 348</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-2 rounded-sm bg-amber-400"/>Medium · 542</div>
                <div className="flex items-center gap-1"><span className="h-1.5 w-2 rounded-sm bg-emerald-500"/>Low · 290</div>
              </div>
            </div>
          ) }} />
        <PillarBlock index={4} title="Resilience & Recovery" tone="bg-orange-500" sub="IR · DR · Cyber Recovery · DevSecOps" score={82} scoreLabel="Good"
          kpis={[["Incident Response (SLA)","92.4%","up"],["MTTR · Major Incidents","1h 42m","down"],["Backup Window (SLA)","99.1%","up"],["DR RPO Compliance","96.2%","up"]]}
          risks={[["Incomplete recovery tests","High"],["Backup immutability gaps","Medium"],["Secrets in code repositories","Medium"]]}
          actions={["Execute full DR tests","Improve backup immutability","Increase DevSecOps coverage"]}
          trend={{ title: "DR Test Success Trend", node: (
            <Sparkline data={[78,80,82,81,84,86,85,88,90,92,94,95]} color="hsl(25 95% 53%)" fill width={180} height={40} />
          ) }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Section title="Cross-Practice Overview">
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-muted-foreground">Security Health by Pillar</div>
            {[["Identity & Trust",86,"indigo"],["Detection & Protection",90,"blue"],["Governance & Risk",84,"emerald"],["Resilience & Recovery",82,"orange"]].map(([n,v,col]:any)=>(
              <div key={n} className="text-xs">
                <div className="flex justify-between mb-0.5"><span>{n}</span><span className="font-semibold">{v}</span></div>
                <Progress value={v} color={col === "indigo" ? "hsl(243 75% 59%)" : col === "blue" ? "hsl(217 91% 60%)" : col === "emerald" ? "hsl(142 71% 45%)" : "hsl(25 95% 53%)"} />
              </div>
            ))}
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground mb-1 mt-2">Pillar Trend (Last 90 Days)</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <div className="flex items-center gap-1"><Sparkline data={[60,64,68,72,76,80,82,84,86]} color="hsl(243 75% 59%)" width={70} height={20} /><span>Identity</span></div>
                <div className="flex items-center gap-1"><Sparkline data={[70,72,75,78,82,85,88,89,90]} color="hsl(217 91% 60%)" width={70} height={20} /><span>Detection</span></div>
                <div className="flex items-center gap-1"><Sparkline data={[68,70,72,75,78,80,82,83,84]} color="hsl(142 71% 45%)" width={70} height={20} /><span>Governance</span></div>
                <div className="flex items-center gap-1"><Sparkline data={[65,68,70,73,76,78,80,81,82]} color="hsl(25 95% 53%)" width={70} height={20} /><span>Resilience</span></div>
              </div>
            </div>
          </div>
        </Section>
        <Section title="Top Security Incidents (This Period)">
          {[["Ransomware Attempt Blocked","Critical","Detection & Protection","Resolved","1h 12m"],["Privileged Account Compromise","High","Identity & Trust","Resolved","2h 05m"],["Data Exfiltration Attempt","High","Detection & Protection","Resolved","1h 48m"],["Misconfigured S3 Bucket","Medium","Governance & Risk","Resolved","3h 20m"],["Phishing – Credential Harvest","Medium","Identity & Trust","Resolved","45m"]].map(([i,s,p,st,m]:any)=>(
            <div key={i} className="text-[11px] py-1 border-b last:border-0 grid grid-cols-12 gap-1">
              <span className="col-span-5 truncate">{i}</span>
              <span className={`col-span-2 ${s==="Critical"?"text-rose-600":s==="High"?"text-orange-600":"text-amber-600"}`}>{s}</span>
              <span className="col-span-3 text-muted-foreground truncate">{p}</span>
              <span className="col-span-1 text-emerald-600">{st}</span>
              <span className="col-span-1 text-right font-semibold">{m}</span>
            </div>
          ))}
        </Section>
        <Section title="Top Risk Heat Map">
          <div className="text-[10px] text-muted-foreground mb-2">Likelihood × Impact</div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 25 }).map((_, i) => {
              const palette = ["bg-emerald-500", "bg-emerald-400", "bg-amber-300", "bg-orange-400", "bg-rose-500"];
              const row = Math.floor(i / 5);
              const col = i % 5;
              const intensity = Math.max(row, col);
              return <div key={i} className={`${palette[intensity]} h-7 rounded-sm opacity-80`} />;
            })}
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"/>Unremediated Critical Vulnerabilities</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500"/>Excessive Privileged Access</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"/>Third-party Risk Exposure</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Data Exposure (Shadow / Open)</div>
          </div>
        </Section>
      </div>

      <BottomCallout insight="AI / Security Operations Insights"
        insightBody="Anomalies detected: 56. Threats prevented: 1,248. False positive reduction: 28%. Cybersecurity practice trending positive across all four pillars; resilience requires continued investment in DR tests and DevSecOps coverage."
        recommendations={["Remediate 162 critical vulnerabilities","Implement phishing-resistant MFA for all users","Reduce mean time to detect to < 15 minutes","Improve cloud posture and entitlement hygiene","Increase SOC automation coverage"]}
        rightTitle="Operational Value Realized (This Period)" rightValue="$3.24M" rightSub="Total Risk Exposure Reduced · ▲ 18% vs last month" />

      <Section title="Cybersecurity Operational KPIs" className="mt-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Kpi Icon={Database} iconBg="bg-blue-50" iconColor="text-blue-600" label="Log Ingestion" sublabel="(GB / Day)" value="2,346" delta="12%" deltaDir="up" deltaTone="positive" />
          <Kpi Icon={Bell} iconBg="bg-rose-50" iconColor="text-rose-600" label="Security Alerts" sublabel="(Per Day)" value="3,892" delta="8%" deltaDir="down" deltaTone="positive" />
          <Kpi Icon={Layers} iconBg="bg-violet-50" iconColor="text-violet-600" label="Use Cases Active" value="112" delta="9%" deltaDir="up" deltaTone="positive" />
          <Kpi Icon={PlayCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Playbooks Executed" value="78" delta="16%" deltaDir="up" deltaTone="positive" />
          <Kpi Icon={Bot} iconBg="bg-amber-50" iconColor="text-amber-600" label="Automation Rate" value="62%" delta="7 pp" deltaDir="up" deltaTone="positive" />
        </div>
      </Section>
    </DashboardLayout>
  );
}
