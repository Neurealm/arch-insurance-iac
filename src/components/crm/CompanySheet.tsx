import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagsInput } from "./TagsInput";
import { useUpsertCompany } from "@/hooks/crm/useCompanies";
import { useAllStakeholders } from "@/hooks/crm/useCrmEntities";
import { toast } from "@/hooks/use-toast";
import type { Company, CompanyType, Priority } from "@/pages/crm/types";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Energy", "Education", "Government", "Other"];
const TYPES: CompanyType[] = ["Customer", "Partner", "Vendor", "Prospect"];
const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

const empty: Partial<Company> = {
  name: "", industry: "", company_type: "Customer", website: "", email: "", phone: "",
  address: "", account_owner: "", status: true, priority: "Medium", notes: "", tags: [],
};

export function CompanySheet({
  open, onOpenChange, company,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  company?: Company | null;
}) {
  const [form, setForm] = useState<Partial<Company>>(empty);
  const upsert = useUpsertCompany();
  const { data: stakeholders = [] } = useAllStakeholders();
  const ownerOptions = company
    ? stakeholders.filter((s) => s.company_id === company.id)
    : stakeholders;

  useEffect(() => {
    if (open) setForm(company ? { ...company } : empty);
  }, [open, company]);

  const set = <K extends keyof Company>(k: K, v: Company[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({ ...form, id: company?.id });
      toast({ title: company ? "Company updated" : "Company created" });
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{company ? "Edit Company" : "Add Company"}</SheetTitle>
          <SheetDescription>Capture company details for your CRM.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-4">
          <Field label="Company Name *">
            <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} maxLength={120} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry">
              <Select value={form.industry || undefined} onValueChange={(v) => set("industry", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Company Type">
              <Select value={form.company_type} onValueChange={(v) => set("company_type", v as CompanyType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Website"><Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} /></Field>
            <Field label="Account Owner">
              <Select
                value={form.account_owner || "__none__"}
                onValueChange={(v) => set("account_owner", v === "__none__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={ownerOptions.length ? "Select stakeholder" : "No stakeholders yet"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {ownerOptions.map((s) => {
                    const label = `${s.first_name} ${s.last_name}`.trim() || s.job_title || "Unnamed";
                    return (
                      <SelectItem key={s.id} value={label}>
                        {label}{s.job_title ? ` · ${s.job_title}` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
          </div>
          <Field label="Address">
            <Textarea rows={2} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
          <Field label="Tags">
            <TagsInput value={form.tags ?? []} onChange={(t) => set("tags", t)} />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>
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