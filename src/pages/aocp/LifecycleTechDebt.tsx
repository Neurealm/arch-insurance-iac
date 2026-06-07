import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Sparkles, ExternalLink, AlertTriangle, Clock, TrendingUp, Code2, Database, Server, Shield, GitBranch, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-card border border-border p-4 shadow-sm", className)}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}
function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "slate" }) {
  const cls = { green: "bg-emerald-50 text-emerald-700 border-emerald-200", amber: "bg-amber-50 text-amber-700 border-amber-200", red: "bg-rose-50 text-rose-700 border-rose-200", blue: "bg-blue-50 text-blue-700 border-blue-200", slate: "bg-slate-50 text-slate-600 border-slate-200" }[tone];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold", cls)}>{label}</span>;
}

const navTabs = [
  { label: "Profile", to: "/aocp/claims-processing" },
  { label: "Environments", to: "/aocp/claims-processing/environments" },
  { label: "Criticality", to: "/aocp/claims-processing/criticality" },
  { label: "Outcomes", to: "/aocp/claims-processing/outcomes" },
  { label: "Architecture", to: "/aocp/claims-processing/architecture" },
  { label: "Lifecycle", to: "#", active: true },
  { label: "Admin Model", to: "/aocp/claims-processing/admin" },
];

const debtByCategory = [
  { cat: "Security", score: 42, color: "#ef4444" },
  { cat: "Performance", score: 28, color: "#f97316" },
  { cat: "Architecture", score: 35, color: "#8b5cf6" },
  { cat: "Code Quality", score: 22, color: "#3b82f6" },
  { cat: "Dependencies", score: 31, color: "#f59e0b" },
  { cat: "Testing", score: 18, color: "#14b8a6" },
];

const debtTrend = [
  { q: "Q1 24", debt: 180 }, { q: "Q2 24", debt: 165 }, { q: "Q3 24", debt: 172 },
  { q: "Q4 24", debt: 158 }, { q: "Q1 25", debt: 148 }, { q: "Q2 25", debt: 140 },
  { q: "Q3 25", debt: 132 }, { q: "Q4 25", debt: 125 }, { q: "Q1 26", debt: 118 },
  { q: "Q2 26", debt: 112 },
];

const debtItems = [
  { id: "TD-001", area: "Security",      item: "Oracle 12c in Training env — EoS in 3 months",     effort: "High",   impact: "High",   status: "Open",       tone: "red" as const,   age: "142 days" },
  { id: "TD-002", area: "Architecture",  item: "Monolithic claims adjudication module — refactor needed", effort: "High", impact: "High", status: "Planned",  tone: "amber" as const, age: "289 days" },
  { id: "TD-003", area: "Dependencies",  item: "Spring Boot 2.7 → 3.x migration pending",          effort: "Medium", impact: "High",   status: "In Progress",tone: "blue" as const,  age: "68 days"  },
  { id: "TD-004", area: "Performance",   item: "Missing DB indexes on Claims_History table",        effort: "Low",    impact: "Medium", status: "Open",       tone: "amber" as const, age: "34 days"  },
  { id: "TD-005", area: "Testing",       item: "Code coverage at 68% — target 80%",               effort: "Medium", impact: "Medium", status: "Open",       tone: "amber" as const, age: "180 days" },
  { id: "TD-006", area: "Code Quality",  item: "4 deprecated API endpoints still in use",          effort: "Low",    impact: "Low",    status: "Planned",    tone: "slate" as const, age: "92 days"  },
  { id: "TD-007", area: "Security",      item: "3 critical CVEs unpatched > 30 days",              effort: "Medium", impact: "High",   status: "Open",       tone: "red" as const,   age: "38 days"  },
  { id: "TD-008", area: "Architecture",  item: "Synchronous EDI integration — needs async refactor", effort: "High", impact: "Medium", status: "Planned",   tone: "amber" as const, age: "210 days" },
];

const modernizationOps = [
  { icon: Server,   label: "Container Migration",   desc: "Move remaining on-prem services to EKS", effort: "6 months", value: "High",   color: "#3b82f6" },
  { icon: Database, label: "DB Upgrade — Oracle 19c", desc: "Upgrade Training + SIT to Oracle 19c",  effort: "2 months", value: "High",   color: "#10b981" },
  { icon: Code2,    label: "API Modernization",     desc: "Migrate legacy SOAP APIs to REST/FHIR",   effort: "4 months", value: "Medium", color: "#8b5cf6" },
  { icon: Shield,   label: "Zero Trust Network",    desc: "Implement ZTA across all environments",    effort: "3 months", value: "High",   color: "#ef4444" },
];

const novaItems = [
  { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50", text: "Oracle 12c EoS in 3 months — upgrade Training env to 19c is the highest priority debt item" },
  { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", text: "Tech debt trending down — reduced from 180 to 112 points over 6 quarters. Good progress." },
  { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", text: "Spring Boot 3.x migration in progress — expected completion in 4 weeks. Monitor dependencies." },
];

export default function LifecycleTechDebt() {
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
            <span className="font-semibold text-foreground">Lifecycle & Technical Debt</span>
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
              { label: "Total Debt Items", value: "112", color: "#ef4444", icon: AlertTriangle },
              { label: "Critical / High", value: "6", color: "#f97316", icon: AlertTriangle },
              { label: "In Progress", value: "8", color: "#3b82f6", icon: GitBranch },
              { label: "Debt Score", value: "42", unit: "/100", color: "#f59e0b", icon: TrendingUp },
              { label: "EoS Risks", value: "3", color: "#ef4444", icon: Clock },
              { label: "Modernization Opps", value: "4", color: "#10b981", icon: CheckCircle2 },
              { label: "Automation Eligible", value: "28", color: "#8b5cf6", icon: Code2 },
              { label: "Est. Remediation", value: "$840K", color: "#6366f1", icon: TrendingUp },
            ].map(k => (
              <Card key={k.label} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{k.label}</span>
                </div>
                <div className="text-[20px] font-bold leading-none">{k.value}{k.unit && <span className="text-[11px] text-muted-foreground">{k.unit}</span>}</div>
              </Card>
            ))}
          </div>

          {/* Row 2: Charts + NOVA */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <Card className="xl:col-span-4">
              <SectionTitle>Tech Debt by Category</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={debtByCategory} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="cat" type="category" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="score" radius={4} fill="#8b5cf6">
                    {debtByCategory.map((d, i) => <rect key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="xl:col-span-4">
              <SectionTitle>Tech Debt Trend (10 Quarters)</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={debtTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="q" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="debt" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="xl:col-span-4 border-violet-200 bg-violet-50/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center"><Sparkles className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
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
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-2">Modernization Opportunities</div>
                {modernizationOps.map(m => (
                  <div key={m.label} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-white mb-1.5">
                    <div className="h-6 w-6 rounded-md grid place-items-center shrink-0" style={{ background: `${m.color}1a`, color: m.color }}>
                      <m.icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold truncate">{m.label}</div>
                      <div className="text-[9px] text-muted-foreground">{m.effort} · {m.value} value</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </Card>
          </div>

          {/* Debt register */}
          <Card>
            <SectionTitle>Technical Debt Register</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    {["ID","Area","Debt Item","Effort","Impact","Status","Age"].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {debtItems.map(d => (
                    <tr key={d.id} className="border-b border-border hover:bg-accent/40">
                      <td className="py-2 px-3 font-mono text-muted-foreground">{d.id}</td>
                      <td className="py-2 px-3"><Badge label={d.area} tone="slate" /></td>
                      <td className="py-2 px-3 font-semibold max-w-xs">{d.item}</td>
                      <td className="py-2 px-3"><Badge label={d.effort} tone={d.effort === "High" ? "red" : d.effort === "Medium" ? "amber" : "green"} /></td>
                      <td className="py-2 px-3"><Badge label={d.impact} tone={d.impact === "High" ? "red" : d.impact === "Medium" ? "amber" : "green"} /></td>
                      <td className="py-2 px-3"><Badge label={d.status} tone={d.tone} /></td>
                      <td className="py-2 px-3 text-muted-foreground">{d.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </AppShell>
  );
}
