import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react";
import { useStakeholders, useDepartments, useTeams, useDeleteStakeholder } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Stakeholder } from "../types";

export function StakeholdersTab({ companyId }: { companyId: string }) {
  const { data: stakeholders = [] } = useStakeholders(companyId);
  const { data: departments = [] } = useDepartments(companyId);
  const { data: teams = [] } = useTeams(companyId);
  const del = useDeleteStakeholder();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const dMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments]);
  const tMap = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t.name])), [teams]);

  const filtered = stakeholders.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [s.first_name, s.last_name, s.job_title, ...(s.emails ?? [])].join(" ").toLowerCase().includes(q);
  });

  const onDelete = async (s: Stakeholder) => {
    try { await del.mutateAsync(s.id); toast({ title: "Stakeholder deleted" }); }
    catch (e: unknown) { toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-3 p-4 border-b flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stakeholders..." className="pl-9" />
        </div>
        <Button className="gap-2" onClick={() => navigate(`/crm/companies/${companyId}/stakeholders/new`)}>
          <Plus className="h-4 w-4" />Add Stakeholder
        </Button>
      </div>

      {stakeholders.length === 0 ? (
        <div className="p-12 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-accent flex items-center justify-center mb-3">
            <UserPlus className="h-6 w-6 text-indigo" />
          </div>
          <h3 className="font-semibold">No stakeholders yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Add the first stakeholder for this company.</p>
          <Button className="mt-4 gap-2" onClick={() => navigate(`/crm/companies/${companyId}/stakeholders/new`)}><Plus className="h-4 w-4" />Add Stakeholder</Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Influence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                <TableCell className="text-muted-foreground">{s.job_title || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{s.department_id ? dMap[s.department_id] : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{s.team_id ? tMap[s.team_id] : "—"}</TableCell>
                <TableCell className="text-xs">{s.emails?.[0] || "—"}</TableCell>
                <TableCell className="text-xs">{s.phones?.[0] || "—"}</TableCell>
                <TableCell><Badge variant="outline">{s.influence_level}</Badge></TableCell>
                <TableCell><Badge variant={s.status ? "default" : "secondary"}>{s.status ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/crm/companies/${companyId}/stakeholders/${s.id}`)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(s)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

    </div>
  );
}