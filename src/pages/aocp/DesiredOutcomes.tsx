import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Sparkles, ExternalLink, TrendingUp, DollarSign, Zap, Shield, Users, Activity, CheckCircle2, Circle } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { cn } from "@/lib/utils";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-card border border-border p-4 shadow-sm", className)}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}

const navTabs = [
  { label: "Profile", to: "/aocp/claims-processing" },
  { label: "Environments", to: "/aocp/claims-processing/environments" },
  { label: "Criticality", to: "/aocp/claims-processing/criticality" },
  { label: "Outcomes", to: "#", active: true },
  { label: "Architecture", to: "/aocp/claims-processing/architecture" },
  { label: "Lifecycle", to: "/aocp/claims-processing/lifecycle" },
  { label: "Admin Model", to: "/aocp/claims-processing/admin" },
];

const outcomes = [
  {
    key: "cost",
    icon: DollarSign,
    label: "Cost Optimization",
    current: 62,
    target: 85,
    priority: "High",
    color: "#10b981",
    bg: "bg-emerald-50",
    goals: [
      "Reduce operational cost by 20% in 12 months",
      "Automate 40% of manual tasks",
      "Consolidate 3 redundant tooling licenses",
    ],
    kpis: [["Cost Reduction MTD","8%"],["Automation Rate","83%"],["License Savings","$42K"]],
  },
  {
    key: "ops",
    icon: Activity,
    label: "Operational Excellence",
    current: 74,
    target: 90,
    priority: "High",
    color: "#3b82f6",
    bg: "bg-blue-50",
    goals: [
      "Achieve 99.9% uptime on all Tier 1 services",
      "Reduce MTTR from 4.2hrs to under 2hrs",
      "Zero P1 incidents from known issues",
    ],
    kpis: [["Uptime (30d)","99.7%"],["MTTR","4.2 hrs"],["P1 Incidents (MTD)","2"]],
  },
  {
    key: "ai",
    icon: Zap,
    label: "AI & Intelligence",
    current: 48,
    target: 80,
    priority: "Medium",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    goals: [
      "Deploy 3 Digital Coworkers for Tier 1 processes",
      "80% of repetitive tasks automated by AI",
      "NOVA AI recommendation adoption > 70%",
    ],
    kpis: [["Digital Coworkers Active","2"],["AI Automation","48%"],["NOVA Adoption","54%"]],
  },
  {
    key: "resilience",
    icon: Shield,
    label: "Resilience & Availability",
    current: 80,
    target: 95,
    priority: "High",
    color: "#ef4444",
    bg: "bg-rose-50",
    goals: [
      "RTO < 4 hrs, RPO < 1 hr for production",
      "DR test every quarter",
      "100% backup compliance across all environments",
    ],
    kpis: [["RTO Current","6 hrs"],["Backup Compliance","94%"],["DR Last Tested","Mar 2026"]],
  },
  {
    key: "ux",
    icon: Users,
    label: "User Experience",
    current: 70,
    target: 88,
    priority: "Medium",
    color: "#f59e0b",
    bg: "bg-amber-50",
    goals: [
      "CSAT > 4.5/5 across all user segments",
      "Self-service resolution > 60%",
      "Mean Time to Respond (portal) < 2 hrs",
    ],
    kpis: [["CSAT","4.4/5"],["Self-Service Rate","54%"],["Portal Response","2.8 hrs"]],
  },
  {
    key: "compliance",
    icon: CheckCircle2,
    label: "Compliance & Security",
    current: 88,
    target: 100,
    priority: "Critical",
    color: "#6366f1",
    bg: "bg-indigo-50",
    goals: [
      "100% HIPAA compliance across all data flows",
      "Zero critical security vulnerabilities unresolved > 30 days",
      "Annual SOC 2 Type II audit pass",
    ],
    kpis: [["HIPAA Compliance","88%"],["Critical Vulns >30d","3"],["SOC 2 Status","In Progress"]],
  },
];

const radarData = outcomes.map(o => ({ subject: o.label.split(" ")[0], current: o.current, target: o.target }));

const practiceMap = [
  { outcome: "Cost Optimization",        practice: "RunOps Practice", linked: true },
  { outcome: "Operational Excellence",   practice: "ITSM Operations", linked: true },
  { outcome: "AI & Intelligence",        practice: "Digital Coworkers", linked: true },
  { outcome: "Resilience & Availability",practice: "Cyber Security Practice", linked: true },
  { outcome: "User Experience",          practice: "Customer Success", linked: false },
  { outcome: "Compliance & Security",    practice: "Cyber Security Practice", linked: true },
];

export default function DesiredOutcomes() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b border-border bg-card px-6 h-14 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/crm")}>CRM</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="cursor-pointer hover:text-foreground">Claims Processing Platform</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Desired Outcomes</span>
          </div>
          <div className="flex-1" />
          {[["Customer","Molina Corp"],["Platform","Claims Processing"],["AOCP Phase","Discovery"],["Completeness","72%"],["Last Updated","Jun 5, 2026"]].map(([k,v]) => (
            <div key={k} className="hidden xl:flex flex-col leading-tight border-l border-border pl-4">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</span>
              {v && <span className="text-[12px] font-semibold">{v}</span>}
            </div>
          ))}
          <button className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"><Bot className="h-3.5 w-3.5" /> Ask NOVA</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent"><ExternalLink className="h-3.5 w-3.5" /> Export</button>
        </header>
        <nav className="border-b border-border bg-card px-6 flex gap-1 shrink-0">
          {navTabs.map(t => (
            <button key={t.label} onClick={() => !t.active && navigate(t.to)}
              className={cn("px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-colors", t.active ? "border-violet-600 text-violet-600" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-5 space-y-4 overflow-auto">
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Outcomes", value: "6", color: "#3b82f6", icon: TrendingUp },
              { label: "Critical Priority", value: "1", color: "#ef4444", icon: Shield },
              { label: "High Priority", value: "3", color: "#f97316", icon: Activity },
              { label: "Avg Achievement", value: "70%", color: "#10b981", icon: CheckCircle2 },
            ].map(k => (
              <Card key={k.label} className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                  <k.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[24px] font-bold leading-none">{k.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{k.label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Outcome cards + Radar */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {outcomes.map(o => (
                <Card key={o.key} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0", o.bg)}>
                      <o.icon className="h-4 w-4" style={{ color: o.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold truncate">{o.label}</div>
                      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
                        o.priority === "Critical" ? "bg-rose-100 text-rose-700" :
                        o.priority === "High" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      )}>{o.priority}</span>
                    </div>
                  </div>
                  {/* progress */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-semibold">{o.current}% / {o.target}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                      <div className="h-full rounded-full" style={{ width: `${o.target}%`, background: `${o.color}30` }} />
                      <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${o.current}%`, background: o.color }} />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">{o.target - o.current}pp gap to target</div>
                  </div>
                  {/* goals */}
                  <div className="space-y-1">
                    {o.goals.map((g, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Circle className="h-2 w-2 shrink-0 mt-1" style={{ color: o.color }} />
                        <span className="text-[10px] text-muted-foreground leading-snug">{g}</span>
                      </div>
                    ))}
                  </div>
                  {/* kpis */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border">
                    {o.kpis.map(([l, v]) => (
                      <div key={l} className="text-center">
                        <div className="text-[11px] font-bold">{v}</div>
                        <div className="text-[9px] text-muted-foreground leading-tight">{l}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Radar + NOVA */}
            <div className="xl:col-span-4 flex flex-col gap-4">
              <Card>
                <SectionTitle>Outcome Achievement Radar</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="Target" dataKey="target" stroke="#e2e8f0" fill="#e2e8f0" fillOpacity={0.4} />
                    <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-violet-400 inline-block" /> Current</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-slate-200 inline-block" /> Target</span>
                </div>
              </Card>

              <Card className="border-violet-200 bg-violet-50/40 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center"><Sparkles className="h-3.5 w-3.5" /></div>
                  <span className="text-[12px] font-bold text-violet-700">NOVA Recommendations</span>
                </div>
                <div className="space-y-2 mb-3">
                  {[
                    { text: "AI & Intelligence gap is widest (32pp) — prioritize Digital Coworker deployment", color: "text-violet-500", bg: "bg-violet-50", icon: Zap },
                    { text: "Compliance at 88% — 3 critical vulns need resolution to close gap", color: "text-rose-500", bg: "bg-rose-50", icon: Shield },
                    { text: "Cost Optimization tracking 8% — on path to 20% annual target if automation continues", color: "text-emerald-500", bg: "bg-emerald-50", icon: TrendingUp },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-violet-100">
                      <div className={cn("h-5 w-5 rounded-md grid place-items-center shrink-0 mt-0.5", n.bg)}>
                        <n.icon className={cn("h-2.5 w-2.5", n.color)} />
                      </div>
                      <p className="text-[11px] leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-violet-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-2">Practice Alignment</div>
                  {practiceMap.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1 text-[10px]">
                      <span className="text-muted-foreground truncate">{p.outcome}</span>
                      <span className={cn("font-semibold", p.linked ? "text-emerald-600" : "text-amber-600")}>{p.practice}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                  <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
                </button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
