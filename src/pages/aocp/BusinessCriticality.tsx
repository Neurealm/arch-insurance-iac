import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Sparkles, ExternalLink, AlertTriangle, TrendingUp, DollarSign, Users, Shield, Activity, Clock, Zap } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-card border border-border p-4 shadow-sm", className)}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}
function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "violet" }) {
  const cls = { green: "bg-emerald-50 text-emerald-700 border-emerald-200", amber: "bg-amber-50 text-amber-700 border-amber-200", red: "bg-rose-50 text-rose-700 border-rose-200", blue: "bg-blue-50 text-blue-700 border-blue-200", violet: "bg-violet-50 text-violet-700 border-violet-200" }[tone];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold", cls)}>{label}</span>;
}

const navTabs = [
  { label: "Profile", to: "/aocp/claims-processing" },
  { label: "Environments", to: "/aocp/claims-processing/environments" },
  { label: "Criticality", to: "#", active: true },
  { label: "Outcomes", to: "/aocp/claims-processing/outcomes" },
  { label: "Architecture", to: "/enterprise-cloud-twin" },
  { label: "Lifecycle", to: "/aocp/claims-processing/lifecycle" },
  { label: "Admin Model", to: "/aocp/claims-processing/admin" },
];

const outageData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  cost: Math.round(2000000 + Math.sin(i / 2) * 500000 + i * 100000),
}));

const businessServices = [
  { service: "Claims Adjudication",    users: "1,248", daily: "4,200", revenue: "$1.2M", sla: "99.9%", crit: "Critical", tone: "red" as const },
  { service: "Prior Authorization",    users: "842",   daily: "2,100", revenue: "$640K", sla: "99.5%", crit: "High",     tone: "amber" as const },
  { service: "Member Eligibility",     users: "1,100", daily: "8,432", revenue: "$280K", sla: "99.9%", crit: "Critical", tone: "red" as const },
  { service: "Provider Portal",        users: "620",   daily: "1,840", revenue: "$120K", sla: "99.0%", crit: "High",     tone: "amber" as const },
  { service: "Payment Processing",     users: "312",   daily: "980",   revenue: "$2.1M", sla: "99.9%", crit: "Critical", tone: "red" as const },
  { service: "Reporting & Analytics",  users: "248",   daily: "420",   revenue: "—",     sla: "98.0%", crit: "Medium",   tone: "blue" as const },
];

const impactDimensions = [
  { label: "Financial Impact",        score: 95, color: "#ef4444", desc: "$2.1M daily revenue at risk" },
  { label: "Operational Impact",      score: 92, color: "#f97316", desc: "8,432 daily transactions" },
  { label: "Regulatory / Compliance", score: 88, color: "#8b5cf6", desc: "HIPAA, CMS compliance required" },
  { label: "Reputational Impact",     score: 85, color: "#3b82f6", desc: "1,248 active members affected" },
  { label: "Patient / Member Impact", score: 90, color: "#14b8a6", desc: "Care continuity dependency" },
];

const novaItems = [
  { icon: DollarSign, color: "text-rose-500", bg: "bg-rose-50", text: "Payment Processing at $2.1M/day — highest financial exposure. Recommend 4-hour RTO target." },
  { icon: Shield, color: "text-violet-500", bg: "bg-violet-50", text: "HIPAA & CMS regulatory obligations require 99.9% SLA on Claims Adjudication and Member Eligibility." },
  { icon: Users, color: "text-blue-500", bg: "bg-blue-50", text: "1,248 members + 620 providers directly impacted during any outage. Prioritize DR testing." },
];

export default function BusinessCriticality() {
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
            <span className="font-semibold text-foreground">Business Criticality & Impact</span>
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
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {[
              { label: "Criticality Score", value: "92", unit: "/100", color: "#ef4444", icon: AlertTriangle, sub: "Tier 1 Critical" },
              { label: "Daily Transactions", value: "8,432", color: "#3b82f6", icon: Activity, sub: "↑ 12% vs last month" },
              { label: "Daily Revenue Impact", value: "$2.1M", color: "#10b981", icon: DollarSign, sub: "At risk during outage" },
              { label: "Downstream Systems", value: "24", color: "#8b5cf6", icon: Zap, sub: "Dependent integrations" },
              { label: "Active Users", value: "1,248", color: "#f59e0b", icon: Users, sub: "Members + Providers" },
              { label: "Affected Employees", value: "2,100", color: "#14b8a6", icon: Users, sub: "Internal staff" },
              { label: "RTO Target", value: "4 hrs", color: "#ef4444", icon: Clock, sub: "Production" },
              { label: "RPO Target", value: "1 hr", color: "#ef4444", icon: Clock, sub: "Production" },
            ].map(k => (
              <Card key={k.label} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{k.label}</span>
                </div>
                <div className="text-[20px] font-bold leading-none">{k.value}{k.unit && <span className="text-[12px] text-muted-foreground">{k.unit}</span>}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{k.sub}</div>
              </Card>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Criticality Score */}
            <Card className="xl:col-span-3">
              <SectionTitle>Business Criticality Score</SectionTitle>
              <div className="flex flex-col items-center py-4">
                <div className="relative h-36 w-36">
                  <svg viewBox="0 0 144 144" className="h-full w-full -rotate-90">
                    <circle cx="72" cy="72" r="58" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
                    <circle cx="72" cy="72" r="58" fill="none" stroke="#ef4444" strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 58 * 0.92} ${2 * Math.PI * 58 * 0.08}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[36px] font-bold text-rose-600 leading-none">92</span>
                    <span className="text-[11px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <Badge label="Tier 1 — Business Critical" tone="red" />
                <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                  Highest priority application. Outages directly impact member care and regulatory compliance.
                </p>
              </div>
              <div className="space-y-2 mt-2">
                {impactDimensions.map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[10px] w-28 text-muted-foreground leading-tight">{d.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
                    </div>
                    <span className="text-[10px] font-bold w-6 text-right">{d.score}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Impact by Dimension */}
            <Card className="xl:col-span-5">
              <SectionTitle>Impact by Dimension</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: DollarSign, label: "Financial Impact", val: "$2.1M/day", sub: "Revenue at risk per outage hour", color: "#ef4444", bg: "bg-rose-50" },
                  { icon: Users, label: "Member Impact", val: "1,248", sub: "Active members affected", color: "#3b82f6", bg: "bg-blue-50" },
                  { icon: Activity, label: "Operational Impact", val: "8,432", sub: "Daily transactions blocked", color: "#f97316", bg: "bg-orange-50" },
                  { icon: Shield, label: "Regulatory Impact", val: "High", sub: "HIPAA + CMS obligations", color: "#8b5cf6", bg: "bg-violet-50" },
                  { icon: TrendingUp, label: "Reputational Impact", val: "High", sub: "Provider & member trust at stake", color: "#14b8a6", bg: "bg-teal-50" },
                  { icon: Clock, label: "Recovery Complexity", val: "High", sub: "Multi-system dependencies", color: "#f59e0b", bg: "bg-amber-50" },
                ].map(d => (
                  <div key={d.label} className="rounded-lg border border-border p-3 flex items-start gap-2.5">
                    <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0 mt-0.5", d.bg)}>
                      <d.icon className="h-4 w-4" style={{ color: d.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">{d.label}</div>
                      <div className="text-[15px] font-bold leading-tight">{d.val}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{d.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* NOVA */}
            <Card className="xl:col-span-4 border-violet-200 bg-violet-50/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center"><Sparkles className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
              <p className="text-[11px] text-violet-800 mb-3 leading-relaxed">Criticality insights for <strong>Claims Processing Platform</strong></p>
              <div className="space-y-2 mb-3">
                {novaItems.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-violet-100">
                    <div className={cn("h-6 w-6 rounded-md grid place-items-center shrink-0 mt-0.5", n.bg)}>
                      <n.icon className={cn("h-3 w-3", n.color)} />
                    </div>
                    <p className="text-[11px] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-violet-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-2">Top Risk Actions</div>
                {["Schedule quarterly DR test","Review Payment Processing RTO","Validate HIPAA compliance controls","Update BCP documentation"].map((a, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className="h-4 w-4 rounded-full bg-violet-100 text-violet-600 text-[9px] font-bold grid place-items-center shrink-0">{i + 1}</div>
                    <span className="text-[11px]">{a}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </Card>
          </div>

          {/* Row 3: Outage cost chart + Business services table */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <Card className="xl:col-span-5">
              <SectionTitle>Outage Impact Cost (per Month)</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={outageData}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: any) => [`$${(v / 1000000).toFixed(2)}M`, "Est. Outage Cost"]} />
                  <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} fill="url(#costGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="xl:col-span-7">
              <SectionTitle>Business Services & Revenue Impact</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Service","Active Users","Daily Transactions","Revenue Impact","SLA Target","Criticality"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {businessServices.map(s => (
                      <tr key={s.service} className="border-b border-border hover:bg-accent/40">
                        <td className="py-2 px-3 font-semibold">{s.service}</td>
                        <td className="py-2 px-3">{s.users}</td>
                        <td className="py-2 px-3">{s.daily}</td>
                        <td className="py-2 px-3 font-semibold text-emerald-600">{s.revenue}</td>
                        <td className="py-2 px-3">{s.sla}</td>
                        <td className="py-2 px-3"><Badge label={s.crit} tone={s.tone} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
