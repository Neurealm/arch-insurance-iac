import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagsInput } from "./TagsInput";
import { MultiTextInput } from "./MultiTextInput";
import { useUpsertStakeholder } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Stakeholder, Department, Team, Influence } from "@/pages/crm/types";

const NONE = "__none__";

const empty: Partial<Stakeholder> = {
  first_name: "", last_name: "", job_title: "", emails: [], phones: [], linkedin: "",
  influence_level: "Medium", reporting_manager_id: null, status: true, notes: "", tags: [], photo_url: "",
  department_id: null, team_id: null,
};

export function StakeholderSheet({
  open, onOpenChange, companyId, stakeholder, departments, teams, peers,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  stakeholder?: Stakeholder | null;
  departments: Department[];
  teams: Team[];
  peers: Stakeholder[];
}) {
  const [form, setForm] = useState<Partial<Stakeholder>>(empty);
  const upsert = useUpsertStakeholder();

  useEffect(() => {
    if (open) setForm(stakeholder ? { ...stakeholder } : empty);
  }, [open, stakeholder]);

  const set = <K extends keyof Stakeholder>(k: K, v: Stakeholder[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filteredTeams = teams.filter((t) => !form.department_id || t.department_id === form.department_id);

  const submit = async () => {
    if (!form.first_name?.trim() && !form.last_name?.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({ ...form, company_id: companyId, id: stakeholder?.id });
      toast({ title: stakeholder ? "Stakeholder updated" : "Stakeholder added" });
      onOpenChange(false);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{stakeholder ? "Edit Stakeholder" : "Add Stakeholder"}</SheetTitle>
          <SheetDescription>Personal info, role, and engagement details.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *"><Input value={form.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} /></Field>
            <Field label="Last Name *"><Input value={form.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} /></Field>
          </div>
          <Field label="Job Title"><Input value={form.job_title ?? ""} onChange={(e) => set("job_title", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <Select value={form.department_id ?? NONE} onValueChange={(v) => { set("department_id", v === NONE ? null : v); set("team_id", null); }}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Team">
              <Select value={form.team_id ?? NONE} onValueChange={(v) => set("team_id", v === NONE ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {filteredTeams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Emails"><MultiTextInput type="email" value={form.emails ?? []} onChange={(v) => set("emails", v)} placeholder="Add email and press Enter" /></Field>
          <Field label="Phone Numbers"><MultiTextInput value={form.phones ?? []} onChange={(v) => set("phones", v)} placeholder="Add phone and press Enter" /></Field>
          <Field label="LinkedIn"><Input value={form.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Influence Level">
              <Select value={form.influence_level} onValueChange={(v) => set("influence_level", v as Influence)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["High","Medium","Low"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <div className="flex items-center gap-3 h-10">
                <Switch checked={!!form.status} onCheckedChange={(v) => set("status", v)} />
                <span className="text-sm text-muted-foreground">{form.status ? "Active" : "Inactive"}</span>
              </div>
            </Field>
          </div>
          <Field label="Reporting Manager">
            <Select value={form.reporting_manager_id ?? NONE} onValueChange={(v) => set("reporting_manager_id", v === NONE ? null : v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {peers.filter((p) => p.id !== stakeholder?.id).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tags"><TagsInput value={form.tags ?? []} onChange={(t) => set("tags", t)} /></Field>
          <Field label="Notes"><Textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{upsert.isPending ? "Saving..." : "Save"}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}