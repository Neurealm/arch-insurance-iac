import type { Department, Team, Stakeholder, Company } from "@/pages/crm/types";
import { Building2, Users, UserCircle2, Crown } from "lucide-react";

export function OrgHierarchy({
  company, departments, teams, stakeholders,
}: {
  company: Company;
  departments: Department[];
  teams: Team[];
  stakeholders: Stakeholder[];
}) {
  const teamsByDept = (deptId: string) => teams.filter((t) => t.department_id === deptId);
  const stakeholdersByTeam = (teamId: string) => stakeholders.filter((s) => s.team_id === teamId);
  const headsByDept = (deptId: string) => stakeholders.filter((s) => s.department_id === deptId && !s.team_id);
  const unassigned = stakeholders.filter((s) => !s.department_id);

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo" />Organization Hierarchy</h3>
      <div className="flex flex-col items-center w-full">
        <Node icon={<Building2 className="h-4 w-4" />} label={company.name} tone="company" />
        {departments.length > 0 && <Trunk />}
        <div className="flex items-start justify-center gap-6 flex-wrap w-full">
          {departments.map((d) => {
            const heads = headsByDept(d.id);
            const deptTeams = teamsByDept(d.id);
            return (
              <div key={d.id} className="flex flex-col items-center min-w-[180px]">
                <DeptCard name={d.name} heads={heads} />
                {deptTeams.length > 0 && (
                  <>
                    <Trunk />
                    <div className="flex items-start justify-center gap-3 flex-wrap">
                      {deptTeams.map((t) => (
                        <div key={t.id} className="flex flex-col items-center">
                          <Node icon={<Users className="h-3 w-3" />} label={t.name} tone="team" />
                          {stakeholdersByTeam(t.id).length > 0 && (
                            <>
                              <div className="h-2 w-px bg-border" />
                              <div className="flex flex-col items-center gap-1">
                                {stakeholdersByTeam(t.id).map((s) => (
                                  <Person key={s.id} name={`${s.first_name} ${s.last_name}`} role={s.job_title} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {unassigned.length > 0 && (
          <div className="mt-8 w-full">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Unassigned</div>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((s) => <Person key={s.id} name={`${s.first_name} ${s.last_name}`} role={s.job_title} />)}
            </div>
          </div>
        )}
        {departments.length === 0 && stakeholders.length === 0 && (
          <div className="text-sm text-muted-foreground py-6">Add departments and stakeholders to see the hierarchy.</div>
        )}
      </div>
    </div>
  );
}

function DeptCard({ name, heads }: { name: string; heads: Stakeholder[] }) {
  return (
    <div className="rounded-lg border border-indigo/20 bg-accent/60 px-3 py-2 shadow-sm min-w-[160px] text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo">
        <Users className="h-4 w-4" />
        <span>{name}</span>
      </div>
      {heads.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-indigo/10 space-y-0.5">
          {heads.map((h) => (
            <div key={h.id} className="flex items-center justify-center gap-1.5 text-xs">
              <Crown className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="font-medium">{`${h.first_name} ${h.last_name}`.trim()}</span>
              {h.job_title && <span className="text-muted-foreground">· {h.job_title}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const tones = {
  company: "bg-indigo text-indigo-foreground border-indigo",
  department: "bg-accent text-indigo border-indigo/20",
  team: "bg-secondary text-foreground border-border",
} as const;

function Node({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: keyof typeof tones }) {
  return (
    <div className={`px-3 py-1.5 rounded-md border text-sm font-medium flex items-center gap-2 shadow-sm ${tones[tone]}`}>
      {icon}{label}
    </div>
  );
}

function Trunk() {
  return <div className="h-4 w-px bg-border" />;
}

function Person({ name, role }: { name: string; role: string }) {
  return (
    <div className="px-2.5 py-1 rounded border bg-background text-xs flex items-center gap-1.5">
      <UserCircle2 className="h-3 w-3 text-muted-foreground" />
      <span className="font-medium">{name.trim() || "Unnamed"}</span>
      {role && <span className="text-muted-foreground">· {role}</span>}
    </div>
  );
}