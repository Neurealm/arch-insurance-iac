import { useMemo } from "react";
import { useStakeholders, useDepartments, useTeams } from "@/hooks/crm/useCrmEntities";
import { Users, Award, Shield, GitBranch, Building2, Bot, Sparkles, ArrowRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stakeholder } from "../types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>;
}

const INFLUENCE_META = {
  High: { label: "High Influence", color: "#ef4444", bg: "bg-rose-50", border: "border-rose-200", icon: Award, badge: "rose" },
  Medium: { label: "Medium Influence", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", icon: Shield, badge: "amber" },
  Low: { label: "Low Influence", color: "#3b82f6", bg: "bg-blue-50", border: "border-blue-200", icon: User, badge: "blue" },
} as const;

function StakeholderCard({ s, departmentName, teamName }: { s: Stakeholder; departmentName?: string; teamName?: string }) {
  const meta = INFLUENCE_META[s.influence_level] ?? INFLUENCE_META.Low;
  const initials = `${s.first_name.charAt(0)}${s.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className={cn("rounded-xl border p-3 bg-white hover:shadow-md transition-shadow", meta.border)}>
      <div className="flex items-start gap-2.5">
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: `${meta.color}1a`, color: meta.color }}>
          {s.photo_url
            ? <img src={s.photo_url} alt={initials} className="h-9 w-9 rounded-full object-cover" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] font-bold truncate">{s.first_name} {s.last_name}</span>
            {!s.status && <span className="text-[9px] text-muted-foreground">(Inactive)</span>}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">{s.job_title || "—"}</div>
          {departmentName && (
            <div className="flex items-center gap-1 mt-1">
              <Building2 className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">{departmentName}</span>
            </div>
          )}
          {teamName && (
            <div className="flex items-center gap-1">
              <Users className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">{teamName}</span>
            </div>
          )}
          {s.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {s.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StakeholderMapTab({ companyId }: { companyId: string }) {
  const { data: stakeholders = [] } = useStakeholders(companyId);
  const { data: departments = [] } = useDepartments(companyId);
  const { data: teams = [] } = useTeams(companyId);

  const dMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments]);
  const tMap = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t.name])), [teams]);

  const highInfluence = stakeholders.filter((s) => s.influence_level === "High");
  const medInfluence = stakeholders.filter((s) => s.influence_level === "Medium");
  const lowInfluence = stakeholders.filter((s) => s.influence_level === "Low");

  const byDepartment = useMemo(() => {
    const map: Record<string, Stakeholder[]> = { Unassigned: [] };
    departments.forEach((d) => { map[d.name] = []; });
    stakeholders.forEach((s) => {
      const dName = s.department_id ? (dMap[s.department_id] ?? "Unassigned") : "Unassigned";
      if (!map[dName]) map[dName] = [];
      map[dName].push(s);
    });
    return Object.entries(map).filter(([, arr]) => arr.length > 0);
  }, [stakeholders, departments, dMap]);

  // Build reporting chains
  const reportingMap = useMemo(() => {
    const m: Record<string, Stakeholder[]> = {};
    stakeholders.forEach((s) => {
      if (s.reporting_manager_id) {
        if (!m[s.reporting_manager_id]) m[s.reporting_manager_id] = [];
        m[s.reporting_manager_id].push(s);
      }
    });
    return m;
  }, [stakeholders]);

  const topLevelStakeholders = stakeholders.filter((s) => !s.reporting_manager_id);

  const novaInsights = useMemo(() => {
    const msgs = [];
    if (highInfluence.length === 0) msgs.push({ icon: Award, color: "text-rose-500", bg: "bg-rose-50", text: "No high-influence stakeholders mapped yet. Identify and add C-suite or decision-makers." });
    else msgs.push({ icon: Award, color: "text-rose-500", bg: "bg-rose-50", text: `${highInfluence.length} high-influence stakeholder${highInfluence.length > 1 ? "s" : ""} identified. Ensure regular executive alignment.` });

    if (departments.length === 0) msgs.push({ icon: Building2, color: "text-amber-500", bg: "bg-amber-50", text: "No departments mapped — add departments to improve stakeholder governance view." });
    else msgs.push({ icon: Building2, color: "text-amber-500", bg: "bg-amber-50", text: `Coverage spans ${departments.length} department${departments.length > 1 ? "s" : ""}. ${byDepartment.filter(([, arr]) => arr.length === 0).length > 0 ? "Some departments have no stakeholders assigned." : "All departments have stakeholder coverage."}` });

    const unmapped = stakeholders.filter((s) => !s.department_id).length;
    if (unmapped > 0) msgs.push({ icon: Users, color: "text-violet-500", bg: "bg-violet-50", text: `${unmapped} stakeholder${unmapped > 1 ? "s" : ""} not assigned to any department. Assign them for better governance tracking.` });
    else msgs.push({ icon: Users, color: "text-violet-500", bg: "bg-violet-50", text: `All ${stakeholders.length} stakeholders are assigned to departments. Governance map is complete.` });

    return msgs.slice(0, 3);
  }, [highInfluence, departments, byDepartment, stakeholders]);

  if (stakeholders.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <h3 className="font-semibold text-lg mb-1">No stakeholders mapped</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Add stakeholders in the Stakeholders tab to visualize the governance map here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Stakeholders", value: stakeholders.length, color: "#3b82f6", icon: Users },
          { label: "High Influence", value: highInfluence.length, color: "#ef4444", icon: Award },
          { label: "Departments", value: departments.length, color: "#10b981", icon: Building2 },
          { label: "Teams", value: teams.length, color: "#8b5cf6", icon: GitBranch },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>
                <k.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{k.label}</span>
            </div>
            <div className="text-[26px] font-bold leading-none">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Influence Tiers + NOVA */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Influence matrix */}
        <div className="xl:col-span-8 space-y-4">
          {([
            { level: "High" as const, items: highInfluence },
            { level: "Medium" as const, items: medInfluence },
            { level: "Low" as const, items: lowInfluence },
          ]).filter(({ items }) => items.length > 0).map(({ level, items }) => {
            const meta = INFLUENCE_META[level];
            return (
              <div key={level} className={cn("rounded-xl border p-4", meta.border, meta.bg)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-md grid place-items-center shrink-0" style={{ background: `${meta.color}1a`, color: meta.color }}>
                    <meta.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="text-[11px] text-muted-foreground">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map((s) => (
                    <StakeholderCard
                      key={s.id}
                      s={s}
                      departmentName={s.department_id ? dMap[s.department_id] : undefined}
                      teamName={s.team_id ? tMap[s.team_id] : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: NOVA + Dept breakdown */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* NOVA */}
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-violet-600 text-white grid place-items-center shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-[12px] font-bold text-violet-700">NOVA Governance Insights</span>
            </div>
            <div className="space-y-2">
              {novaInsights.map((n, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-violet-100">
                  <div className={cn("h-5 w-5 rounded-md grid place-items-center shrink-0 mt-0.5", n.bg)}>
                    <n.icon className={cn("h-2.5 w-2.5", n.color)} />
                  </div>
                  <p className="text-[11px] leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700">
              <Bot className="h-3.5 w-3.5" /> Ask NOVA
            </button>
          </div>

          {/* Department Breakdown */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <SectionTitle>Department Coverage</SectionTitle>
            <div className="space-y-2">
              {byDepartment.map(([dept, members]) => (
                <div key={dept} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[12px] font-medium truncate">{dept}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(members.length / stakeholders.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground w-4 text-right">{members.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reporting Chain */}
      {topLevelStakeholders.length > 0 && Object.keys(reportingMap).length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <SectionTitle>Reporting Chain</SectionTitle>
          <div className="space-y-3">
            {topLevelStakeholders.slice(0, 5).map((manager) => {
              const reports = reportingMap[manager.id] ?? [];
              return (
                <div key={manager.id} className="flex flex-wrap items-start gap-2">
                  {/* Manager */}
                  <div className="flex items-center gap-2 rounded-lg border bg-rose-50 border-rose-200 px-3 py-2 min-w-[160px]">
                    <div className="h-6 w-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                      {manager.first_name.charAt(0)}{manager.last_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold truncate">{manager.first_name} {manager.last_name}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{manager.job_title}</div>
                    </div>
                  </div>
                  {reports.length > 0 && (
                    <>
                      <div className="flex items-center self-center"><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /></div>
                      <div className="flex flex-wrap gap-2">
                        {reports.map((r) => (
                          <div key={r.id} className="flex items-center gap-1.5 rounded-lg border bg-blue-50 border-blue-200 px-2 py-1.5">
                            <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {r.first_name.charAt(0)}{r.last_name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold">{r.first_name} {r.last_name}</div>
                              <div className="text-[9px] text-muted-foreground">{r.job_title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
