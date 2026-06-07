import { AppShell } from "@/components/eoc/AppShell";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Sparkles, ExternalLink, Users, Settings, Zap, CheckCircle2, Clock, AlertTriangle, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl bg-card border border-border p-4 shadow-sm", className)}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}
function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "blue" | "slate" | "violet" }) {
  const cls = { green: "bg-emerald-50 text-emerald-700 border-emerald-200", amber: "bg-amber-50 text-amber-700 border-amber-200", red: "bg-rose-50 text-rose-700 border-rose-200", blue: "bg-blue-50 text-blue-700 border-blue-200", slate: "bg-slate-50 text-slate-600 border-slate-200", violet: "bg-violet-50 text-violet-700 border-violet-200" }[tone];
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold", cls)}>{label}</span>;
}

const navTabs = [
  { label: "Profile", to: "/aocp/claims-processing" },
  { label: "Environments", to: "/aocp/claims-processing/environments" },
  { label: "Criticality", to: "/aocp/claims-processing/criticality" },
  { label: "Outcomes", to: "/aocp/claims-processing/outcomes" },
  { label: "Architecture", to: "/aocp/claims-processing/architecture" },
  { label: "Lifecycle", to: "/aocp/claims-processing/lifecycle" },
  { label: "Admin Model", to: "#", active: true },
];

const tasks = [
  { id: "TSK-001", name: "User Access Provisioning",       category: "IAM",          frequency: "Daily",    effort: "2 hrs",  automation: "Yes", owner: "IAM Team",    status: "Automated", tone: "green" as const },
  { id: "TSK-002", name: "PA Rule Engine Config Management", category: "Config",      frequency: "Weekly",   effort: "4 hrs",  automation: "Yes", owner: "App Admin",   status: "Automated", tone: "green" as const },
  { id: "TSK-003", name: "Claims Batch Job Monitoring",    category: "Operations",   frequency: "Daily",    effort: "1.5 hrs",automation: "Yes", owner: "SRE Team",    status: "Automated", tone: "green" as const },
  { id: "TSK-004", name: "Environment Health Check",       category: "Infra",        frequency: "Daily",    effort: "1 hr",   automation: "Yes", owner: "Infra Team",  status: "Automated", tone: "green" as const },
  { id: "TSK-005", name: "License Compliance Audit",       category: "Governance",   frequency: "Monthly",  effort: "8 hrs",  automation: "No",  owner: "App Admin",   status: "Manual",    tone: "amber" as const },
  { id: "TSK-006", name: "Role Review & Recertification",  category: "IAM",          frequency: "Quarterly",effort: "16 hrs", automation: "No",  owner: "Security",    status: "Manual",    tone: "amber" as const },
  { id: "TSK-007", name: "Patch Management — App Layer",   category: "Security",     frequency: "Monthly",  effort: "6 hrs",  automation: "Partial", owner: "SRE",    status: "Partial",   tone: "blue" as const },
  { id: "TSK-008", name: "Configuration Change Management",category: "Config",       frequency: "Ad-hoc",   effort: "3 hrs",  automation: "No",  owner: "App Admin",   status: "Manual",    tone: "amber" as const },
  { id: "TSK-009", name: "Vendor Tool Configuration",      category: "Integration",  frequency: "Monthly",  effort: "4 hrs",  automation: "No",  owner: "Int. Team",   status: "Manual",    tone: "amber" as const },
  { id: "TSK-010", name: "Backup Verification",            category: "DR",           frequency: "Weekly",   effort: "1 hr",   automation: "Yes", owner: "Infra Team",  status: "Automated", tone: "green" as const },
];

const admins = [
  { initials: "TW", name: "Tyler Wang",     role: "Technical Owner",   access: "Full Admin",  envs: "All",       bg: "bg-emerald-500" },
  { initials: "PJ", name: "Priya Joshi",   role: "Request Manager",   access: "App Admin",   envs: "All",       bg: "bg-blue-500" },
  { initials: "MK", name: "Michael Kim",   role: "Support Lead",      access: "Ops Admin",   envs: "Non-Prod",  bg: "bg-violet-500" },
  { initials: "AR", name: "Ana Rodriguez", role: "IAM Admin",         access: "IAM Admin",   envs: "All",       bg: "bg-rose-500" },
  { initials: "DS", name: "Dev Sharma",    role: "Config Manager",    access: "Config Admin", envs: "Non-Prod", bg: "bg-amber-500" },
  { initials: "LK", name: "Lisa Ko",       role: "Security Admin",    access: "Security",    envs: "All",       bg: "bg-indigo-500" },
];

const novaItems = [
  { icon: Zap, color: "text-violet-500", bg: "bg-violet-50", text: "83% task automation rate — 4 remaining manual tasks are candidates for Digital Coworker automation" },
  { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", text: "Role Review task is 90 days overdue — schedule Q2 recertification immediately" },
  { icon: Users, color: "text-blue-500", bg: "bg-blue-50", text: "6 admins managing 68 programs — consider consolidating config management responsibilities" },
];

export default function AdminModel() {
  const navigate = useNavigate();
  const automated = tasks.filter(t => t.status === "Automated").length;
  const manual = tasks.filter(t => t.status === "Manual").length;

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b border-border bg-card px-6 h-14 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate("/crm")}>CRM</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="cursor-pointer hover:text-foreground">Claims Processing Platform</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Application Administration Model</span>
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
              { label: "Programs Managed", value: "68", color: "#3b82f6", icon: LayoutGrid },
              { label: "Admin Users", value: "6", color: "#10b981", icon: Users },
              { label: "Roles Configured", value: "21", color: "#8b5cf6", icon: Settings },
              { label: "Task Automation", value: "83%", color: "#10b981", icon: Zap },
              { label: "Automated Tasks", value: String(automated), color: "#10b981", icon: CheckCircle2 },
              { label: "Manual Tasks", value: String(manual), color: "#f59e0b", icon: Clock },
              { label: "Total Admin Tasks", value: String(tasks.length), color: "#6366f1", icon: LayoutGrid },
              { label: "Avg Task Frequency", value: "Daily", color: "#14b8a6", icon: Clock },
            ].map(k => (
              <Card key={k.label} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                    <k.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground leading-tight">{k.label}</span>
                </div>
                <div className="text-[20px] font-bold">{k.value}</div>
              </Card>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Admin users */}
            <Card className="xl:col-span-4">
              <SectionTitle>Application Administrators</SectionTitle>
              <div className="space-y-2">
                {admins.map(a => (
                  <div key={a.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-accent/40">
                    <div className={cn("h-9 w-9 rounded-full text-white grid place-items-center text-[12px] font-bold shrink-0", a.bg)}>{a.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.role}</div>
                    </div>
                    <div className="text-right">
                      <Badge label={a.access} tone="blue" />
                      <div className="text-[10px] text-muted-foreground mt-1">{a.envs}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Automation breakdown */}
            <Card className="xl:col-span-4">
              <SectionTitle>Automation Breakdown</SectionTitle>
              <div className="flex items-center justify-center my-4">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                    <circle cx="64" cy="64" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="14" />
                    <circle cx="64" cy="64" r="52" fill="none" stroke="#10b981" strokeWidth="14"
                      strokeDasharray={`${2 * Math.PI * 52 * 0.83} ${2 * Math.PI * 52 * 0.17}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[28px] font-bold text-emerald-600 leading-none">83%</span>
                    <span className="text-[10px] text-muted-foreground">Automated</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Fully Automated", count: automated, color: "#10b981", pct: `${Math.round(automated / tasks.length * 100)}%` },
                  { label: "Partially Automated", count: 1, color: "#3b82f6", pct: "10%" },
                  { label: "Manual", count: manual, color: "#f59e0b", pct: `${Math.round(manual / tasks.length * 100)}%` },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[11px] flex-1">{d.label}</span>
                    <span className="text-[11px] font-bold">{d.count} tasks</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{d.pct}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">By Category</div>
                {["IAM","Config","Operations","Security","Integration","DR","Governance"].map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat);
                  const autoCount = catTasks.filter(t => t.status === "Automated").length;
                  return catTasks.length > 0 ? (
                    <div key={cat} className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] w-24 text-muted-foreground">{cat}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(autoCount / catTasks.length * 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold w-8 text-right">{autoCount}/{catTasks.length}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>

            {/* NOVA */}
            <Card className="xl:col-span-4 border-violet-200 bg-violet-50/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center"><Sparkles className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-bold text-violet-700">NOVA Digital Coworker</span>
              </div>
              <p className="text-[11px] text-violet-800 mb-3 leading-relaxed">Admin insights for <strong>Claims Processing Platform</strong></p>
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
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-2">Top Automation Candidates</div>
                {tasks.filter(t => t.status === "Manual").map(t => (
                  <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-violet-100 last:border-0">
                    <Zap className="h-3 w-3 text-violet-400 shrink-0" />
                    <span className="text-[11px] flex-1">{t.name}</span>
                    <Badge label={t.frequency} tone="slate" />
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
                <Bot className="h-3.5 w-3.5" /> Ask NOVA a Question
              </button>
            </Card>
          </div>

          {/* Task catalog */}
          <Card>
            <SectionTitle>Application Admin Task Catalog</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border">
                    {["ID","Task","Category","Frequency","Est. Effort","Automation","Owner","Status"].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id} className="border-b border-border hover:bg-accent/40">
                      <td className="py-2 px-3 font-mono text-muted-foreground">{t.id}</td>
                      <td className="py-2 px-3 font-semibold">{t.name}</td>
                      <td className="py-2 px-3"><Badge label={t.category} tone="slate" /></td>
                      <td className="py-2 px-3 text-muted-foreground">{t.frequency}</td>
                      <td className="py-2 px-3 text-muted-foreground">{t.effort}</td>
                      <td className="py-2 px-3"><Badge label={t.automation} tone={t.automation === "Yes" ? "green" : t.automation === "Partial" ? "blue" : "amber"} /></td>
                      <td className="py-2 px-3 text-muted-foreground">{t.owner}</td>
                      <td className="py-2 px-3"><Badge label={t.status} tone={t.tone} /></td>
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
