import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  useDomain, useUpsertDomain, useMasterDomains, useTechnologyOptions,
  useDomainAuditLog, useDomains,
  ETDM_DOMAIN_APPROVAL, ETDM_DOMAIN_CRITICALITY, ETDM_DOMAIN_LIFECYCLE,
  type Domain,
} from "@/hooks/etdm/useDomains";
import {
  ApprovalBadge, CriticalityBadge, LifecycleBadge,
} from "@/components/etdm/DomainBadges";
import { slugify } from "@/lib/etdm/constants";

type Mode = "view" | "edit" | "new";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Form = Record<string, any>;

const EMPTY: Form = {
  technology_id: "",
  master_domain_id: "",
  domain_display_name: "",
  short_name: "",
  slug: "",
  description: "",
  display_order: 0,
  tags: [] as string[],
  scope_summary: "",
  business_purpose: "",
  business_criticality: "Standard",
  lifecycle_status: "Active",
  approval_status: "Draft",
  is_active: false,
  effective_date: "",
  review_date: "",
  expiration_date: "",
  governance_notes: "",
  source_of_record: "",
  external_reference_id: "",
};

export default function DomainProfilePage() {
  const { domainId } = useParams<{ domainId?: string }>();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const location = useLocation();
  const isNew = !domainId;
  const initialMode: Mode = isNew ? "new" : location.pathname.endsWith("/edit") ? "edit" : "view";
  const [mode, setMode] = useState<Mode>(initialMode);

  const { data, isLoading } = useDomain(domainId);
  const upsert = useUpsertDomain();
  const { data: masters } = useMasterDomains();
  const { data: techs } = useTechnologyOptions();
  const { data: auditLog } = useDomainAuditLog(domainId);

  const [form, setForm] = useState<Form>({
    ...EMPTY,
    technology_id: sp.get("technology_id") ?? "",
  });
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({ ...EMPTY, ...data });
      setDirty(false);
      setSlugTouched(true);
    } else if (isNew) {
      const preTech = sp.get("technology_id") ?? "";
      setForm({ ...EMPTY, technology_id: preTech });
      setDirty(false);
      setSlugTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isNew]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty && mode !== "view") { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty, mode]);

  // Auto-slug from display name until user edits the slug
  useEffect(() => {
    if (mode === "view") return;
    if (!slugTouched && form.domain_display_name) {
      setForm((f) => ({ ...f, slug: slugify(String(f.domain_display_name)) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.domain_display_name, slugTouched]);

  const setField = (k: string, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
    if (k === "slug") setSlugTouched(true);
  };

  // Look up peers under the same Technology to warn on duplicate display names
  const { data: peerData } = useDomains({
    technology_id: form.technology_id || undefined,
    page: 0, pageSize: 100,
  });
  const duplicateNameWarning = useMemo(() => {
    if (!form.domain_display_name?.trim() || !form.technology_id) return null;
    const other = (peerData?.rows ?? []).find(
      (r) =>
        r.id !== domainId &&
        !r.is_deleted &&
        r.domain_display_name.trim().toLowerCase() === String(form.domain_display_name).trim().toLowerCase(),
    );
    return other ? `Another Domain under this Technology already uses this display name (${other.domain_display_name}).` : null;
  }, [peerData, form.domain_display_name, form.technology_id, domainId]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.technology_id) e.technology_id = "Parent Technology is required.";
    if (!form.master_domain_id) e.master_domain_id = "Master Domain is required.";
    if (!form.domain_display_name?.trim()) e.domain_display_name = "Display Name is required.";
    if (!form.slug?.trim()) e.slug = "Slug is required.";
    if (!form.business_criticality) e.business_criticality = "Business Criticality is required.";
    if (!form.lifecycle_status) e.lifecycle_status = "Lifecycle Status is required.";
    if (!form.approval_status) e.approval_status = "Approval Status is required.";
    return e;
  }, [form]);

  const readonly = mode === "view";

  const submit = async (closeAfter: boolean) => {
    if (Object.keys(errors).length) {
      toast.error("Please fix validation errors before saving.");
      return;
    }
    const payload: Form = { ...form };
    for (const k of [
      "short_name","description","scope_summary","business_purpose","governance_notes",
      "source_of_record","external_reference_id","effective_date","review_date","expiration_date",
    ]) {
      if (payload[k] === "") payload[k] = null;
    }
    if (payload.display_order === "" || payload.display_order == null) payload.display_order = 0;
    else payload.display_order = Number(payload.display_order);
    try {
      const res = await upsert.mutateAsync({ ...payload, id: isNew ? undefined : domainId });
      toast.success(isNew ? "Domain created" : "Domain saved");
      setDirty(false);
      if (closeAfter) {
        if (form.technology_id) nav(`/admin/technology-taxonomy/technologies/${form.technology_id}`);
        else nav("/admin/technology-taxonomy/domains");
      } else if (isNew) {
        nav(`/admin/technology-taxonomy/domains/${res.id}/edit`);
      } else {
        setMode("view");
      }
    } catch (e) {
      // Convert well-known constraint failures into friendlier text.
      const raw = e instanceof Error ? e.message : "Save failed";
      let msg = raw;
      if (/etdm_domains_uq_tech_master/.test(raw)) {
        msg = "Another Domain under this Technology is already using this Master Domain.";
      } else if (/etdm_domains_uq_tech_slug/.test(raw)) {
        msg = "Another Domain under this Technology is already using this slug.";
      }
      toast.error(`Save failed: ${msg}`);
    }
  };

  if (isLoading) {
    return <AppShell><div className="p-10 text-center text-muted-foreground">Loading…</div></AppShell>;
  }

  if (!isNew && !data) {
    return (
      <AppShell>
        <div className="p-10 max-w-xl mx-auto text-center">
          <h1 className="text-xl font-semibold">Domain not found</h1>
          <Button className="mt-4" onClick={() => nav("/admin/technology-taxonomy/domains")}>Back to list</Button>
        </div>
      </AppShell>
    );
  }

  const parentTechName =
    (data?.technology?.technology_name) ??
    (techs?.find((t) => t.id === form.technology_id)?.technology_name) ??
    "—";
  const parentTechId = data?.technology?.id ?? form.technology_id ?? "";
  const masterName =
    data?.master_domain?.name ??
    masters?.find((m) => m.id === form.master_domain_id)?.name ??
    "—";

  return (
    <AppShell>
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => {
              if (dirty && !confirm("Discard unsaved changes?")) return;
              if (parentTechId) nav(`/admin/technology-taxonomy/technologies/${parentTechId}`);
              else nav("/admin/technology-taxonomy/domains");
            }}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{masterName}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold truncate">
                  {isNew ? "New Domain" : form.domain_display_name || "Domain"}
                </h1>
                <LifecycleBadge value={form.lifecycle_status} />
                <ApprovalBadge value={form.approval_status} />
                <CriticalityBadge value={form.business_criticality} />
              </div>
              {parentTechId && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Parent Technology:{" "}
                  <Link className="hover:underline text-indigo" to={`/admin/technology-taxonomy/technologies/${parentTechId}`}>
                    {parentTechName}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {readonly && !isNew && !form.is_deleted && (
              <Button size="sm" onClick={() => setMode("edit")}>Edit</Button>
            )}
            {!readonly && (
              <>
                <Button size="sm" variant="outline" onClick={() => submit(false)} disabled={upsert.isPending}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                </Button>
                <Button size="sm" onClick={() => submit(true)} disabled={upsert.isPending}>Save & Close</Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  if (dirty && !confirm("Discard unsaved changes?")) return;
                  if (isNew) {
                    if (parentTechId) nav(`/admin/technology-taxonomy/technologies/${parentTechId}`);
                    else nav("/admin/technology-taxonomy/domains");
                  } else { setForm({ ...EMPTY, ...data }); setDirty(false); setMode("view"); }
                }}>
                  <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="identity">
          <TabsList className="flex-wrap h-auto justify-start">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            {!isNew && <TabsTrigger value="__system">Metadata</TabsTrigger>}
            {!isNew && <TabsTrigger value="__history">History</TabsTrigger>}
          </TabsList>

          <TabsContent value="identity">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldSelect
                  label="Parent Technology *"
                  value={form.technology_id}
                  onChange={(v) => setField("technology_id", v)}
                  options={(techs ?? []).map((t) => ({ value: t.id, label: t.technology_name }))}
                  readonly={readonly || !isNew /* parent cannot be changed after create */}
                  error={errors.technology_id}
                  help={!isNew ? "Parent Technology is fixed after creation." : undefined}
                />
                <FieldSelect
                  label="Master Domain *"
                  value={form.master_domain_id}
                  onChange={(v) => setField("master_domain_id", v)}
                  options={(masters ?? []).map((m) => ({ value: m.id, label: m.name }))}
                  readonly={readonly}
                  error={errors.master_domain_id}
                />
                <FieldText
                  label="Domain Display Name *"
                  value={form.domain_display_name}
                  onChange={(v) => setField("domain_display_name", v)}
                  readonly={readonly}
                  error={errors.domain_display_name}
                  help={duplicateNameWarning ?? undefined}
                />
                <FieldText
                  label="Short Name"
                  value={form.short_name}
                  onChange={(v) => setField("short_name", v)}
                  readonly={readonly}
                />
                <FieldText
                  label="Slug *"
                  value={form.slug}
                  onChange={(v) => setField("slug", v)}
                  readonly={readonly}
                  error={errors.slug}
                />
                <FieldNumber
                  label="Display Order"
                  value={form.display_order}
                  onChange={(v) => setField("display_order", v)}
                  readonly={readonly}
                />
                <div className="md:col-span-2">
                  <FieldTextarea
                    label="Description"
                    value={form.description}
                    onChange={(v) => setField("description", v)}
                    readonly={readonly}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Tags</Label>
                  <TagInput value={form.tags ?? []} onChange={(v) => setField("tags", v)} disabled={readonly} />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <FieldTextarea
                    label="Scope Summary"
                    value={form.scope_summary}
                    onChange={(v) => setField("scope_summary", v)}
                    readonly={readonly}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldTextarea
                    label="Business Purpose"
                    value={form.business_purpose}
                    onChange={(v) => setField("business_purpose", v)}
                    readonly={readonly}
                  />
                </div>
                <FieldSelect
                  label="Business Criticality *"
                  value={form.business_criticality}
                  onChange={(v) => setField("business_criticality", v)}
                  options={ETDM_DOMAIN_CRITICALITY.map((v) => ({ value: v, label: v }))}
                  readonly={readonly}
                  error={errors.business_criticality}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="governance">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldSelect
                  label="Lifecycle Status *"
                  value={form.lifecycle_status}
                  onChange={(v) => setField("lifecycle_status", v)}
                  options={ETDM_DOMAIN_LIFECYCLE.map((v) => ({ value: v, label: v }))}
                  readonly={readonly}
                  error={errors.lifecycle_status}
                />
                <FieldSelect
                  label="Approval Status *"
                  value={form.approval_status}
                  onChange={(v) => setField("approval_status", v)}
                  options={ETDM_DOMAIN_APPROVAL.map((v) => ({ value: v, label: v }))}
                  readonly={readonly}
                  error={errors.approval_status}
                />
                <FieldDate label="Effective Date" value={form.effective_date} onChange={(v) => setField("effective_date", v)} readonly={readonly} />
                <FieldDate label="Review Date" value={form.review_date} onChange={(v) => setField("review_date", v)} readonly={readonly} />
                <FieldDate label="Expiration Date" value={form.expiration_date} onChange={(v) => setField("expiration_date", v)} readonly={readonly} />
                <FieldText label="Source of Record" value={form.source_of_record} onChange={(v) => setField("source_of_record", v)} readonly={readonly} />
                <FieldText label="External Reference ID" value={form.external_reference_id} onChange={(v) => setField("external_reference_id", v)} readonly={readonly} />
                <div className="md:col-span-2">
                  <FieldTextarea
                    label="Governance Notes"
                    value={form.governance_notes}
                    onChange={(v) => setField("governance_notes", v)}
                    readonly={readonly}
                  />
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={!!form.is_active}
                  disabled={readonly}
                  onCheckedChange={(v) => setField("is_active", v)}
                />
                <Label htmlFor="is_active">Active</Label>
                <span className="text-xs text-muted-foreground">Inactive records remain stored with full history.</span>
              </div>
            </Card>
          </TabsContent>

          {!isNew && (
            <TabsContent value="__system">
              <Card className="p-6 grid grid-cols-2 gap-4 text-sm">
                <ReadOnly label="Record ID" value={form.id} />
                <ReadOnly label="Created By" value={form.created_by} />
                <ReadOnly label="Created" value={form.created_at ? new Date(form.created_at).toLocaleString() : ""} />
                <ReadOnly label="Modified By" value={form.updated_by} />
                <ReadOnly label="Modified" value={form.updated_at ? new Date(form.updated_at).toLocaleString() : ""} />
                <ReadOnly label="Published Version" value={String(form.published_version ?? "")} />
                <ReadOnly label="Cloned From Domain" value={form.cloned_from_domain_id} />
                <ReadOnly label="Deleted" value={form.is_deleted ? "Yes" : "No"} />
                <ReadOnly label="Deleted By" value={form.deleted_by} />
                <ReadOnly label="Deleted At" value={form.deleted_at ? new Date(form.deleted_at).toLocaleString() : ""} />
              </Card>
            </TabsContent>
          )}

          {!isNew && (
            <TabsContent value="__history">
              <Card className="p-6">
                {!auditLog?.length && <div className="text-sm text-muted-foreground">No history yet.</div>}
                <ul className="space-y-3">
                  {auditLog?.map((e) => (
                    <li key={e.id as string} className="border-l-2 border-indigo/40 pl-3">
                      <div className="text-sm font-medium">{e.action as string}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(e.changed_at as string).toLocaleString()} · {String(e.changed_by ?? "system")}
                      </div>
                      {Array.isArray(e.changed_fields) && (e.changed_fields as string[]).length > 0 && (
                        <div className="text-xs mt-1 text-muted-foreground">
                          Changed: {(e.changed_fields as string[]).slice(0, 12).join(", ")}
                          {(e.changed_fields as string[]).length > 12 && "…"}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
}

/* -------------------- Small field renderers -------------------- */

function ReadOnly({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-xs break-all">{value ? String(value) : "—"}</div>
    </div>
  );
}

function FieldText({
  label, value, onChange, readonly, error, help,
}: { label: string; value: unknown; onChange: (v: string) => void; readonly?: boolean; error?: string; help?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {readonly
        ? <div className="min-h-[36px]">{value ? String(value) : "—"}</div>
        : <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />}
      {error && <div className="text-xs text-destructive mt-1">{error}</div>}
      {!error && help && <div className="text-xs text-amber-600 mt-1">{help}</div>}
    </div>
  );
}

function FieldTextarea({
  label, value, onChange, readonly,
}: { label: string; value: unknown; onChange: (v: string) => void; readonly?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {readonly
        ? <div className="min-h-[36px] whitespace-pre-wrap">{value ? String(value) : "—"}</div>
        : <Textarea rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function FieldNumber({
  label, value, onChange, readonly,
}: { label: string; value: unknown; onChange: (v: number | string) => void; readonly?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {readonly
        ? <div className="min-h-[36px]">{value == null || value === "" ? "—" : String(value)}</div>
        : <Input type="number" value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />}
    </div>
  );
}

function FieldDate({
  label, value, onChange, readonly,
}: { label: string; value: unknown; onChange: (v: string) => void; readonly?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {readonly
        ? <div className="min-h-[36px]">{value ? String(value).slice(0, 10) : "—"}</div>
        : <Input type="date" value={(value as string)?.slice(0, 10) ?? ""} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function FieldSelect({
  label, value, onChange, options, readonly, error, help,
}: {
  label: string; value: unknown; onChange: (v: string) => void;
  options: { value: string; label: string }[]; readonly?: boolean; error?: string; help?: string;
}) {
  const currentLabel = options.find((o) => o.value === value)?.label ?? "";
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {readonly
        ? <div className="min-h-[36px]">{currentLabel || "—"}</div>
        : (
          <Select value={(value as string) || ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      {error && <div className="text-xs text-destructive mt-1">{error}</div>}
      {!error && help && <div className="text-xs text-muted-foreground mt-1">{help}</div>}
    </div>
  );
}

function TagInput({ value, onChange, disabled }: {
  value: string[]; onChange: (v: string[]) => void; disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  if (disabled) return <div className="min-h-[36px]">{value.length ? value.join(", ") : "—"}</div>;
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap gap-1 items-center border rounded-md px-2 py-1.5 bg-background">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 text-xs bg-muted rounded px-1.5 py-0.5">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder="Add tag…"
      />
    </div>
  );
}

// unused import guard: Domain type re-exported not necessary
export type { Domain };
