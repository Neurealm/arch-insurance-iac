import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useTeams, useDepartments, useStakeholders, useDeleteTeam } from "@/hooks/crm/useCrmEntities";
import { TeamSheet } from "@/components/crm/TeamSheet";
import { OrgHierarchy } from "@/components/crm/OrgHierarchy";
import { toast } from "@/hooks/use-toast";
import type { Team, Company } from "../types";

export function TeamsTab({ companyId, company }: { companyId: string; company: Company }) {
  const { data: teams = [] } = useTeams(companyId);
  const { data: departments = [] } = useDepartments(companyId);
  const { data: stakeholders = [] } = useStakeholders(companyId);
  const del = useDeleteTeam();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);

  const dMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments]);
  const sMap = useMemo(() => Object.fromEntries(stakeholders.map((s) => [s.id, `${s.first_name} ${s.last_name}`])), [stakeholders]);

  const grouped = useMemo(() => {
    const m = new Map<string, Team[]>();
    teams.forEach((t) => {
      const k = t.department_id ?? "__none__";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    });
    return m;
  }, [teams]);

  const onDelete = async (t: Team) => {
    try { await del.mutateAsync(t.id); toast({ title: "Team deleted" }); }
    catch (e: unknown) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Teams</h3>
        <Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Add Team</Button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="h-10 w-10 mx-auto text-indigo mb-2" />
          <p className="text-sm text-muted-foreground">No teams yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([deptId, list]) => (
            <div key={deptId} className="rounded-lg border bg-card p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                {deptId === "__none__" ? "Unassigned" : dMap[deptId] ?? "Unknown"}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((t) => (
                  <div key={t.id} className="rounded-md border p-3 group bg-background">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2"><Users className="h-4 w-4 text-indigo" />{t.name}</div>
                        {t.lead_stakeholder_id && <div className="text-xs text-muted-foreground mt-0.5">Lead: {sMap[t.lead_stakeholder_id]}</div>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(t)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-2">{t.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <OrgHierarchy company={company} departments={departments} teams={teams} stakeholders={stakeholders} />

      <TeamSheet open={open} onOpenChange={setOpen} companyId={companyId} team={editing} departments={departments} stakeholders={stakeholders} />
    </div>
  );
}