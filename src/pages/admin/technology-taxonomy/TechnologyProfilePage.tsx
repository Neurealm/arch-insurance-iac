import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  useTechnology, useUpsertTechnology, useAuditLog,
} from "@/hooks/etdm/useTechnologies";
import {
  ETDM_CATEGORIES, ETDM_TECH_TYPES, ETDM_LIFECYCLE_STATUSES, ETDM_CRITICALITIES,
  ETDM_MATURITIES, ETDM_APPROVAL_STATUSES, ETDM_VISIBILITIES, ETDM_MASTER_DOMAINS,
  ETDM_DEPLOYMENT_MODELS, ETDM_CLOUD_PROVIDERS, ETDM_HYPERVISORS, ETDM_PRACTICES, slugify,
} from "@/lib/etdm/constants";

type Mode = "view" | "edit" | "new";

type Field =
  | { key: string; label: string; type: "text" | "textarea" | "url" | "number" | "date" }
  | { key: string; label: string; type: "select"; options: readonly string[] }
  | { key: string; label: string; type: "multi"; options: readonly string[] }
  | { key: string; label: string; type: "tags" }
  | { key: string; label: string; type: "boolean" };

const SECTIONS: { key: string; label: string; fields: Field[] }[] = [
  {
    key: "identity", label: "Identity",
    fields: [
      { key: "technology_name", label: "Technology Name *", type: "text" },
      { key: "short_name", label: "Short Name", type: "text" },
      { key: "slug", label: "Slug *", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: ETDM_CATEGORIES },
      { key: "technology_type", label: "Technology Type", type: "select", options: ETDM_TECH_TYPES },
      { key: "vendor_name", label: "Vendor", type: "text" },
      { key: "product_family", label: "Product Family", type: "text" },
      { key: "product_name", label: "Product Name", type: "text" },
      { key: "version", label: "Version", type: "text" },
      { key: "edition", label: "Edition", type: "text" },
      { key: "lifecycle_status", label: "Lifecycle Status", type: "select", options: ETDM_LIFECYCLE_STATUSES },
      { key: "technology_icon_url", label: "Technology Icon URL", type: "url" },
      { key: "banner_image_url", label: "Banner Image URL", type: "url" },
      { key: "color_theme", label: "Color Theme", type: "text" },
      { key: "tags", label: "Tags", type: "tags" },
    ],
  },
  {
    key: "classification", label: "Classification & Ownership",
    fields: [
      { key: "technology_tower", label: "Technology Tower", type: "text" },
      { key: "primary_domain", label: "Primary Domain", type: "select", options: ETDM_MASTER_DOMAINS },
      { key: "secondary_domains", label: "Secondary Domains", type: "multi", options: ETDM_MASTER_DOMAINS },
      { key: "support_group", label: "Support Group", type: "text" },
      { key: "escalation_group", label: "Escalation Group", type: "text" },
    ],
  },
  {
    key: "vendor", label: "Vendor & Lifecycle",
    fields: [
      { key: "product_website_url", label: "Product Website URL", type: "url" },
      { key: "documentation_url", label: "Documentation URL", type: "url" },
      { key: "support_url", label: "Support URL", type: "url" },
      { key: "community_url", label: "Community URL", type: "url" },
      { key: "licensing_model", label: "Licensing Model", type: "text" },
      { key: "support_contract_reference", label: "Support Contract Reference", type: "text" },
      { key: "general_availability_date", label: "General Availability Date", type: "date" },
      { key: "end_of_sale_date", label: "End of Sale Date", type: "date" },
      { key: "end_of_mainstream_support_date", label: "End of Mainstream Support Date", type: "date" },
      { key: "end_of_extended_support_date", label: "End of Extended Support Date", type: "date" },
      { key: "end_of_life_date", label: "End of Life Date", type: "date" },
      { key: "upgrade_path", label: "Upgrade Path", type: "text" },
      { key: "lifecycle_notes", label: "Lifecycle Notes", type: "textarea" },
    ],
  },
  {
    key: "business", label: "Business Context",
    fields: [
      { key: "business_purpose", label: "Business Purpose", type: "textarea" },
      { key: "business_criticality", label: "Business Criticality", type: "select", options: ETDM_CRITICALITIES },
      { key: "typical_deployment_size", label: "Typical Deployment Size", type: "text" },
      { key: "business_impact_if_unavailable", label: "Business Impact if Unavailable", type: "textarea" },
      { key: "strategic_importance", label: "Strategic Importance", type: "text" },
      { key: "business_outcome_summary", label: "Business Outcome Summary", type: "textarea" },
    ],
  },
  {
    key: "technical", label: "Technical Profile",
    fields: [
      { key: "deployment_models", label: "Deployment Models", type: "multi", options: ETDM_DEPLOYMENT_MODELS },
      { key: "supported_cloud_providers", label: "Supported Cloud Providers", type: "multi", options: ETDM_CLOUD_PROVIDERS },
      { key: "supported_hypervisors", label: "Supported Hypervisors", type: "multi", options: ETDM_HYPERVISORS },
      { key: "api_available", label: "API Available", type: "boolean" },
      { key: "rest_api_available", label: "REST API Available", type: "boolean" },
      { key: "graphql_available", label: "GraphQL Available", type: "boolean" },
      { key: "sdk_available", label: "SDK Available", type: "boolean" },
      { key: "cli_available", label: "CLI Available", type: "boolean" },
      { key: "powershell_available", label: "PowerShell Available", type: "boolean" },
      { key: "webhooks_available", label: "Webhooks Available", type: "boolean" },
      { key: "agent_required", label: "Agent Required", type: "boolean" },
      { key: "agentless_supported", label: "Agentless Supported", type: "boolean" },
      { key: "high_availability_supported", label: "High Availability", type: "boolean" },
      { key: "clustering_supported", label: "Clustering", type: "boolean" },
      { key: "disaster_recovery_supported", label: "Disaster Recovery", type: "boolean" },
      { key: "backup_supported", label: "Backup", type: "boolean" },
      { key: "multi_region_supported", label: "Multi-region", type: "boolean" },
      { key: "scalability_model", label: "Scalability Model", type: "text" },
      { key: "technical_prerequisites", label: "Technical Prerequisites", type: "textarea" },
      { key: "technical_limitations", label: "Technical Limitations", type: "textarea" },
    ],
  },
  {
    key: "security", label: "Security & Compliance",
    fields: [
      { key: "authorization_model", label: "Authorization Model", type: "text" },
      { key: "mfa_supported", label: "MFA Supported", type: "boolean" },
      { key: "rbac_supported", label: "RBAC Supported", type: "boolean" },
      { key: "encryption_at_rest", label: "Encryption at Rest", type: "boolean" },
      { key: "encryption_in_transit", label: "Encryption in Transit", type: "boolean" },
      { key: "audit_logging_supported", label: "Audit Logging", type: "boolean" },
      { key: "data_classification", label: "Data Classification", type: "text" },
      { key: "data_residency_requirements", label: "Data Residency Requirements", type: "text" },
      { key: "known_security_considerations", label: "Known Security Considerations", type: "textarea" },
    ],
  },
  {
    key: "automation", label: "Automation & AI",
    fields: [
      { key: "automation_ready", label: "Automation Ready", type: "boolean" },
      { key: "ai_ready", label: "AI Ready", type: "boolean" },
      { key: "infrastructure_as_code_supported", label: "IaC Supported", type: "boolean" },
      { key: "digital_coworkers_available", label: "Digital Coworkers Available", type: "boolean" },
      { key: "automations_available", label: "Automations Available", type: "boolean" },
      { key: "runbooks_available", label: "Runbooks Available", type: "boolean" },
      { key: "sop_library_available", label: "SOP Library Available", type: "boolean" },
      { key: "knowledge_articles_available", label: "Knowledge Articles Available", type: "boolean" },
      { key: "ai_playbooks_available", label: "AI Playbooks Available", type: "boolean" },
      { key: "automation_opportunity_summary", label: "Automation Opportunity Summary", type: "textarea" },
      { key: "ai_opportunity_summary", label: "AI Opportunity Summary", type: "textarea" },
    ],
  },
  {
    key: "maturity", label: "Maturity & Readiness",
    fields: [
      { key: "technology_maturity", label: "Technology Maturity", type: "select", options: ETDM_MATURITIES },
      { key: "operational_maturity_score", label: "Operational Maturity (0–100)", type: "number" },
      { key: "automation_maturity_score", label: "Automation Maturity (0–100)", type: "number" },
      { key: "ai_maturity_score", label: "AI Maturity (0–100)", type: "number" },
      { key: "security_maturity_score", label: "Security Maturity (0–100)", type: "number" },
      { key: "documentation_completeness_percentage", label: "Documentation Completeness %", type: "number" },
      { key: "support_readiness_score", label: "Support Readiness (0–100)", type: "number" },
      { key: "digital_twin_readiness_score", label: "Digital Twin Readiness (0–100)", type: "number" },
      { key: "overall_maturity_notes", label: "Overall Maturity Notes", type: "textarea" },
      { key: "last_assessment_date", label: "Last Assessment Date", type: "date" },
    ],
  },
  {
    key: "governance", label: "Governance",
    fields: [
      { key: "approval_status", label: "Approval Status", type: "select", options: ETDM_APPROVAL_STATUSES },
      { key: "visibility", label: "Visibility", type: "select", options: ETDM_VISIBILITIES },
      { key: "tenant_scope", label: "Tenant Scope", type: "text" },
      { key: "effective_date", label: "Effective Date", type: "date" },
      { key: "review_date", label: "Review Date", type: "date" },
      { key: "expiration_date", label: "Expiration Date", type: "date" },
      { key: "governance_notes", label: "Governance Notes", type: "textarea" },
      { key: "source_of_record", label: "Source of Record", type: "text" },
      { key: "external_reference_id", label: "External Reference ID", type: "text" },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Form = Record<string, any>;

const EMPTY: Form = {
  technology_name: "",
  slug: "",
  approval_status: "Draft",
  visibility: "Internal Restricted",
  is_active: false,
  tags: [] as string[],
  secondary_domains: [] as string[],
  deployment_models: [] as string[],
  supported_cloud_providers: [] as string[],
  supported_hypervisors: [] as string[],
};

export default function TechnologyProfilePage() {
  const { technologyId } = useParams<{ technologyId?: string }>();
  const location = useLocation();
  const nav = useNavigate();
  const isNew = !technologyId;
  const initialMode: Mode = isNew ? "new" : location.pathname.endsWith("/edit") ? "edit" : "view";
  const [mode, setMode] = useState<Mode>(initialMode);

  const { data, isLoading } = useTechnology(technologyId);
  const upsert = useUpsertTechnology();
  const { data: auditLog } = useAuditLog(technologyId);

  const [form, setForm] = useState<Form>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({ ...EMPTY, ...data });
      setDirty(false);
      setSlugTouched(true);
    } else if (isNew) {
      setForm(EMPTY);
      setDirty(false);
      setSlugTouched(false);
    }
  }, [data, isNew]);

  // Unsaved changes warning
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty && mode !== "view") { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty, mode]);

  // Auto-slug from name until user edits slug
  useEffect(() => {
    if (mode === "view") return;
    if (!slugTouched && form.technology_name) {
      setForm((f) => ({ ...f, slug: slugify(String(f.technology_name)) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.technology_name, slugTouched]);

  const setField = (k: string, v: unknown) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
    if (k === "slug") setSlugTouched(true);
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.technology_name?.trim()) e.technology_name = "Technology name is required.";
    if (!form.slug?.trim()) e.slug = "Slug is required.";
    for (const s of SECTIONS) for (const f of s.fields) {
      if (f.type === "number") {
        const v = form[f.key];
        if (v !== null && v !== undefined && v !== "" && (Number(v) < 0 || Number(v) > 100)) {
          e[f.key] = "Must be between 0 and 100.";
        }
      }
      if (f.type === "url") {
        const v = form[f.key];
        if (v && typeof v === "string" && v.trim()) {
          try { new URL(v); } catch { e[f.key] = "Must be a valid URL."; }
        }
      }
    }
    return e;
  }, [form]);

  const readonly = mode === "view";

  const submit = async (closeAfter: boolean) => {
    if (Object.keys(errors).length) {
      toast.error("Please fix validation errors before saving.");
      return;
    }
    const payload: Form = { ...form };
    // Coerce empty strings to null for typed columns
    for (const s of SECTIONS) for (const f of s.fields) {
      if (payload[f.key] === "") payload[f.key] = null;
      if (f.type === "number" && payload[f.key] != null && payload[f.key] !== "") {
        payload[f.key] = Number(payload[f.key]);
      }
    }
    try {
      const res = await upsert.mutateAsync({ ...payload, id: isNew ? undefined : technologyId });
      toast.success(isNew ? "Technology created" : "Technology saved");
      setDirty(false);
      if (closeAfter) nav("/admin/technology-taxonomy");
      else if (isNew) nav(`/admin/technology-taxonomy/technologies/${res.id}/edit`);
      else setMode("view");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return <AppShell><div className="p-10 text-center text-muted-foreground">Loading…</div></AppShell>;
  }

  if (!isNew && !data) {
    return (
      <AppShell>
        <div className="p-10 max-w-xl mx-auto text-center">
          <h1 className="text-xl font-semibold">Technology not found</h1>
          <Button className="mt-4" onClick={() => nav("/admin/technology-taxonomy")}>Back to list</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              if (dirty && !confirm("Discard unsaved changes?")) return;
              nav("/admin/technology-taxonomy");
            }}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <h1 className="text-xl font-semibold">
              {isNew ? "New Technology" : form.technology_name || "Technology"}
            </h1>
            {!isNew && (
              <>
                <Badge variant="outline">{form.approval_status}</Badge>
                <Badge variant="outline" className={form.is_active ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : ""}>
                  {form.is_active ? "Active" : "Inactive"}
                </Badge>
                {form.is_deleted && <Badge variant="destructive">Deleted</Badge>}
              </>
            )}
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
                  if (isNew) nav("/admin/technology-taxonomy");
                  else { setForm({ ...EMPTY, ...data }); setDirty(false); setMode("view"); }
                }}>
                  <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="identity">
          <TabsList className="flex-wrap h-auto justify-start">
            {SECTIONS.map((s) => <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>)}
            {!isNew && <TabsTrigger value="__system">System</TabsTrigger>}
            {!isNew && <TabsTrigger value="__history">History</TabsTrigger>}
          </TabsList>

          {SECTIONS.map((s) => (
            <TabsContent key={s.key} value={s.key}>
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {s.fields.map((f) => (
                    <FieldRenderer
                      key={f.key}
                      field={f}
                      value={form[f.key]}
                      onChange={(v) => setField(f.key, v)}
                      readonly={readonly}
                      error={errors[f.key]}
                    />
                  ))}
                </div>
                {s.key === "identity" && (
                  <>
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
                  </>
                )}
              </Card>
            </TabsContent>
          ))}

          {!isNew && (
            <TabsContent value="__system">
              <Card className="p-6 grid grid-cols-2 gap-4 text-sm">
                <ReadOnly label="Record ID" value={form.id} />
                <ReadOnly label="Created By" value={form.created_by} />
                <ReadOnly label="Created" value={form.created_at ? new Date(form.created_at).toLocaleString() : ""} />
                <ReadOnly label="Modified By" value={form.updated_by} />
                <ReadOnly label="Modified" value={form.updated_at ? new Date(form.updated_at).toLocaleString() : ""} />
                <ReadOnly label="Published Version" value={String(form.published_version ?? "")} />
                <ReadOnly label="Cloned From" value={form.cloned_from_technology_id} />
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

function ReadOnly({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-xs break-all">{value ? String(value) : "—"}</div>
    </div>
  );
}

function FieldRenderer({
  field, value, onChange, readonly, error,
}: {
  field: Field; value: unknown; onChange: (v: unknown) => void; readonly: boolean; error?: string;
}) {
  const id = `f-${field.key}`;
  const shared = "min-h-[36px]";
  const disp = (v: unknown) => v == null || v === "" ? "—" : String(v);

  return (
    <div>
      <Label htmlFor={id} className="text-xs">{field.label}</Label>

      {field.type === "text" || field.type === "url" ? (
        readonly ? <div className={shared}>{disp(value)}</div> : (
          <Input
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
          />
        )
      ) : field.type === "textarea" ? (
        readonly ? <div className={shared + " whitespace-pre-wrap"}>{disp(value)}</div> : (
          <Textarea id={id} rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        )
      ) : field.type === "number" ? (
        readonly ? <div className={shared}>{disp(value)}</div> : (
          <Input id={id} type="number" min={0} max={100}
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            aria-invalid={!!error}
          />
        )
      ) : field.type === "date" ? (
        readonly ? <div className={shared}>{disp(value)}</div> : (
          <Input id={id} type="date" value={(value as string)?.slice(0, 10) ?? ""} onChange={(e) => onChange(e.target.value || null)} />
        )
      ) : field.type === "select" ? (
        readonly ? <div className={shared}>{disp(value)}</div> : (
          <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v || null)}>
            <SelectTrigger id={id}><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {field.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        )
      ) : field.type === "boolean" ? (
        <div className="flex items-center gap-2 h-9">
          <Switch id={id} checked={!!value} disabled={readonly} onCheckedChange={(v) => onChange(v)} />
        </div>
      ) : field.type === "multi" ? (
        <MultiSelect
          options={field.options}
          value={(value as string[]) ?? []}
          onChange={onChange}
          disabled={readonly}
        />
      ) : field.type === "tags" ? (
        <TagInput
          value={(value as string[]) ?? []}
          onChange={onChange}
          disabled={readonly}
        />
      ) : null}

      {error && <div className="text-xs text-destructive mt-1">{error}</div>}
    </div>
  );
}

function MultiSelect({ options, value, onChange, disabled }: {
  options: readonly string[]; value: string[]; onChange: (v: unknown) => void; disabled?: boolean;
}) {
  if (disabled) return <div className="min-h-[36px]">{value.length ? value.join(", ") : "—"}</div>;
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter((x) => x !== o));
    else onChange([...value, o]);
  };
  return (
    <div className="flex flex-wrap gap-1 min-h-[36px] items-start">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => toggle(o)}
          className={
            "text-xs px-2 py-1 rounded border transition-colors " +
            (value.includes(o)
              ? "bg-indigo text-white border-indigo"
              : "bg-background text-foreground border-border hover:bg-muted")
          }
        >{o}</button>
      ))}
    </div>
  );
}

function TagInput({ value, onChange, disabled }: {
  value: string[]; onChange: (v: unknown) => void; disabled?: boolean;
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
