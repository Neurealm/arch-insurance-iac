import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  platformsByCategory, schedules,
  type AlertRule, type DataClassificationRule, type ScheduleProfile,
  type SourceCategory, type SourceConfiguration,
} from "./data";

/* ------------------------------ Add Source -------------------------------- */

const CATEGORIES: SourceCategory[] = ["Documents", "Tickets", "Chat", "Meetings", "Code", "APIs", "Telemetry", "Other"];
const AUTH_METHODS = ["OAuth", "Service Account", "API Key", "Personal Access Token", "Basic Authentication", "Managed Identity", "Custom Credential"];
const SCOPES = ["Read only", "Metadata only", "Content read", "Attachments", "Historical content", "Deleted items", "Restricted folders"];
const MODES = ["Streaming", "Incremental", "Scheduled", "Batch", "Metadata only", "Permission validation only"];
const FREQUENCIES = ["Real-time", "Every 15 minutes", "Hourly", "Every 6 hours", "Daily", "Weekly", "Cron expression"];
const CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"];

const CREATE_STEPS = [
  "Validating credentials", "Testing permissions", "Registering source",
  "Applying policies", "Creating schedule", "Estimating inventory", "Completed",
];

export interface NewSourceDraft {
  category: SourceCategory;
  platform: string;
  name: string;
  description: string;
  businessOwner: string;
  technicalOwner: string;
  businessUnit: string;
  team: string;
  knowledgeDomain: string;
  environment: string;
  authMethod: string;
  scopes: string[];
  mode: string;
  frequency: string;
  classification: string;
  piiDetection: boolean;
  sensitiveDetection: boolean;
  residency: string;
  retention: string;
  excludedPaths: string;
}

const emptyDraft: NewSourceDraft = {
  category: "Documents", platform: "Confluence", name: "", description: "",
  businessOwner: "Engineering Operations", technicalOwner: "Priya Raman",
  businessUnit: "Technology", team: "Engineering Operations", knowledgeDomain: "Platform",
  environment: "Production", authMethod: "OAuth", scopes: ["Content read"], mode: "Incremental",
  frequency: "Every 15 minutes", classification: "Internal", piiDetection: true,
  sensitiveDetection: true, residency: "US East", retention: "3 years", excludedPaths: "",
};

export function AddSourceDialog({ open, onOpenChange, onCreated }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (source: NewSourceDraft) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<NewSourceDraft>(emptyDraft);
  const [creating, setCreating] = useState(-1);

  useEffect(() => {
    if (!open) { setStep(0); setDraft(emptyDraft); setCreating(-1); }
  }, [open]);

  useEffect(() => {
    if (creating < 0 || creating >= CREATE_STEPS.length - 1) return;
    const t = window.setTimeout(() => setCreating((c) => c + 1), 500);
    return () => window.clearTimeout(t);
  }, [creating]);

  const set = <K extends keyof NewSourceDraft>(k: K, v: NewSourceDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const titles = [
    "Source Category", "Platform", "Source Identity", "Authentication", "Authorization Scope",
    "Discovery Mode", "Schedule", "Data Governance", "Review", "Create Source",
  ];
  const canNext = step !== 2 || draft.name.trim().length > 0;

  const start = () => { setStep(9); setCreating(0); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Add Source — Step {Math.min(step + 1, 10)} of 10: {titles[step]}</DialogTitle>
          <DialogDescription className="text-[12px]">Register a new enterprise source into the discovery configuration.</DialogDescription>
        </DialogHeader>
        <Progress value={((step + 1) / 10) * 100} className="h-1.5" />

        <div className="space-y-3 py-1 text-[12.5px]">
          {step === 0 && (
            <ChoiceGrid options={CATEGORIES} value={draft.category} onChange={(v) => { set("category", v as SourceCategory); set("platform", platformsByCategory[v as SourceCategory][0]); }} />
          )}
          {step === 1 && <ChoiceGrid options={platformsByCategory[draft.category]} value={draft.platform} onChange={(v) => set("platform", v)} />}
          {step === 2 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Source Name" required><Input value={draft.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-[12px]" /></Field>
              <Field label="Business Owner"><Input value={draft.businessOwner} onChange={(e) => set("businessOwner", e.target.value)} className="h-8 text-[12px]" /></Field>
              <Field label="Technical Owner"><Input value={draft.technicalOwner} onChange={(e) => set("technicalOwner", e.target.value)} className="h-8 text-[12px]" /></Field>
              <Field label="Business Unit"><Input value={draft.businessUnit} onChange={(e) => set("businessUnit", e.target.value)} className="h-8 text-[12px]" /></Field>
              <Field label="Team"><Input value={draft.team} onChange={(e) => set("team", e.target.value)} className="h-8 text-[12px]" /></Field>
              <Field label="Knowledge Domain"><Input value={draft.knowledgeDomain} onChange={(e) => set("knowledgeDomain", e.target.value)} className="h-8 text-[12px]" /></Field>
              <Field label="Environment"><Input value={draft.environment} onChange={(e) => set("environment", e.target.value)} className="h-8 text-[12px]" /></Field>
              <div className="sm:col-span-2">
                <Field label="Description"><Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} className="min-h-[60px] text-[12px]" /></Field>
              </div>
            </div>
          )}
          {step === 3 && (
            <>
              <ChoiceGrid options={AUTH_METHODS} value={draft.authMethod} onChange={(v) => set("authMethod", v)} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label={draft.authMethod === "API Key" ? "Key reference" : "Client / principal"}><Input placeholder="vault://ecf/credential-ref" className="h-8 text-[12px]" /></Field>
                <Field label="Scope endpoint"><Input placeholder="https://enterprise.example.com" className="h-8 text-[12px]" /></Field>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => toast.success("Credential reference validated (simulated)")}>Validate Credential</Button>
              <p className="text-[11px] text-slate-500">Credentials are referenced, never stored in this demonstration environment.</p>
            </>
          )}
          {step === 4 && (
            <div className="grid gap-1 sm:grid-cols-2">
              {SCOPES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-[12px] text-slate-700">
                  <Checkbox
                    checked={draft.scopes.includes(s)} aria-label={s}
                    onCheckedChange={(v) => set("scopes", v ? [...draft.scopes, s] : draft.scopes.filter((x) => x !== s))}
                    className="h-3.5 w-3.5"
                  />
                  {s}
                </label>
              ))}
              <div className="sm:col-span-2">
                <Field label="Path selector"><Input placeholder="/spaces/engineering/**" className="h-8 text-[12px]" /></Field>
              </div>
            </div>
          )}
          {step === 5 && <ChoiceGrid options={MODES} value={draft.mode} onChange={(v) => set("mode", v)} />}
          {step === 6 && (
            <>
              <ChoiceGrid options={FREQUENCIES} value={draft.frequency} onChange={(v) => set("frequency", v)} />
              {draft.frequency === "Cron expression" && (
                <Field label="Cron expression"><Input defaultValue="0 */6 * * *" className="h-8 text-[12px]" /></Field>
              )}
              <p className="text-[11px] text-slate-500">Existing profiles: {schedules.map((s) => s.name).join(", ")}</p>
            </>
          )}
          {step === 7 && (
            <div className="space-y-2">
              <Field label="Access classification"><ChoiceGrid options={CLASSIFICATIONS} value={draft.classification} onChange={(v) => set("classification", v)} /></Field>
              <label className="flex items-center gap-2 text-[12px]"><Checkbox checked={draft.piiDetection} onCheckedChange={(v) => set("piiDetection", !!v)} aria-label="PII detection" className="h-3.5 w-3.5" /> PII detection</label>
              <label className="flex items-center gap-2 text-[12px]"><Checkbox checked={draft.sensitiveDetection} onCheckedChange={(v) => set("sensitiveDetection", !!v)} aria-label="Sensitive content detection" className="h-3.5 w-3.5" /> Sensitive content detection</label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Data residency"><Input value={draft.residency} onChange={(e) => set("residency", e.target.value)} className="h-8 text-[12px]" /></Field>
                <Field label="Retention policy"><Input value={draft.retention} onChange={(e) => set("retention", e.target.value)} className="h-8 text-[12px]" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Excluded paths and content types"><Input value={draft.excludedPaths} onChange={(e) => set("excludedPaths", e.target.value)} placeholder="/archive/**, *.zip" className="h-8 text-[12px]" /></Field>
                </div>
              </div>
            </div>
          )}
          {step === 8 && (
            <div className="space-y-2">
              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {([
                  ["Category", draft.category], ["Platform", draft.platform], ["Name", draft.name || "—"],
                  ["Business owner", draft.businessOwner], ["Technical owner", draft.technicalOwner],
                  ["Authentication", draft.authMethod], ["Scope", draft.scopes.join(", ")],
                  ["Discovery mode", draft.mode], ["Schedule", draft.frequency],
                  ["Classification", draft.classification], ["Residency", draft.residency], ["Retention", draft.retention],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1">
                    <dt className="text-[11.5px] text-slate-500">{k}</dt>
                    <dd className="text-[12px] font-medium text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11.5px] text-slate-700">
                Estimated source size 42 GB · Estimated artifacts 18,400 · Estimated initial discovery 38 minutes
              </div>
              {draft.classification === "Highly Restricted" && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
                  Policy conflict: Highly Restricted sources require compliance approval before discovery begins.
                </div>
              )}
              {draft.scopes.includes("Restricted folders") && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
                  Permission warning: restricted folder access requires a security-reviewed permission template.
                </div>
              )}
            </div>
          )}
          {step === 9 && (
            <div className="space-y-2">
              <Progress value={((creating + 1) / CREATE_STEPS.length) * 100} className="h-1.5" />
              <ul className="space-y-1" aria-live="polite">
                {CREATE_STEPS.map((s, i) => (
                  <li key={s} className={cn("text-[12px]", i <= creating ? "text-slate-800" : "text-slate-400")}>
                    {i < creating ? "✓ " : i === creating ? "• " : "  "}{s}
                  </li>
                ))}
              </ul>
              {creating === CREATE_STEPS.length - 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" className="h-7 text-[11px]" onClick={() => { onCreated(draft); onOpenChange(false); }}>View Source</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onCreated(draft); toast.success("Initial discovery started"); onOpenChange(false); }}>Run Initial Discovery</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onCreated(draft); setDraft(emptyDraft); setStep(0); setCreating(-1); }}>Add Another Source</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { onCreated(draft); onOpenChange(false); }}>Close</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {step < 9 && (
          <DialogFooter className="gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-[12px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 8 ? (
              <Button size="sm" className="h-8 text-[12px]" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button size="sm" className="h-8 text-[12px]" onClick={start}>Create Source</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChoiceGrid({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
          className={cn(
            "rounded-md border px-2.5 py-2 text-left text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            value === o ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  const id = `f-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="grid gap-1">
      <Label htmlFor={id} className="text-[11px] text-slate-600">{label}{required && <span className="text-red-500"> *</span>}</Label>
      <div id={id}>{children}</div>
    </div>
  );
}

/* ----------------------------- New Schedule ------------------------------- */

export function NewScheduleDialog({ open, onOpenChange, onCreate }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreate: (s: ScheduleProfile) => void;
}) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("Every hour");
  useEffect(() => { if (!open) { setName(""); setFrequency("Every hour"); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[16px]">New Schedule</DialogTitle>
          <DialogDescription className="text-[12px]">Create a reusable discovery cadence.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2 text-[12px]">
          <Field label="Schedule name" required><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Frequency"><Input value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Timezone"><Input defaultValue="America/New_York" className="h-8 text-[12px]" /></Field>
          <Field label="Start date"><Input type="date" defaultValue="2025-05-13" className="h-8 text-[12px]" /></Field>
          <Field label="Start time"><Input type="time" defaultValue="02:00" className="h-8 text-[12px]" /></Field>
          <Field label="Recurrence"><Input defaultValue="Daily" className="h-8 text-[12px]" /></Field>
          <Field label="Sources"><Input defaultValue="12" className="h-8 text-[12px]" /></Field>
          <Field label="Categories"><Input defaultValue="Documents, Meetings" className="h-8 text-[12px]" /></Field>
          <Field label="Failure retry policy"><Input defaultValue="2 retries, 5 min backoff" className="h-8 text-[12px]" /></Field>
          <Field label="Maximum duration"><Input defaultValue="45 min" className="h-8 text-[12px]" /></Field>
          <Field label="Notification rules"><Input defaultValue="Discovery Job Failures" className="h-8 text-[12px]" /></Field>
          <Field label="Conflict detection"><Input defaultValue="Warn on overlap" className="h-8 text-[12px]" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!name.trim()}
            onClick={() => {
              onCreate({
                id: `sch-${Date.now()}`, name, frequency, timezone: "America/New_York", nextRun: "2:00 AM",
                sources: 12, status: "Active", owner: "Alex Valencia", lastUpdated: "today",
                retryPolicy: "2 retries", maximumDuration: "45 min", notificationRuleIds: ["alr-jobs"],
              });
              onOpenChange(false);
            }}
          >
            Save and Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- New Classification --------------------------- */

export function NewClassificationDialog({ open, onOpenChange, onCreate }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreate: (r: DataClassificationRule) => void;
}) {
  const [name, setName] = useState("");
  useEffect(() => { if (!open) setName(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[16px]">New Classification Rule</DialogTitle>
          <DialogDescription className="text-[12px]">Detect and govern sensitive content before ingestion.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2 text-[12px]">
          <Field label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Description"><Input defaultValue="Regulated content classification" className="h-8 text-[12px]" /></Field>
          <Field label="Detection criteria"><Input defaultValue="Keyword and pattern match" className="h-8 text-[12px]" /></Field>
          <Field label="Keywords"><Input defaultValue="regulated, PHI" className="h-8 text-[12px]" /></Field>
          <Field label="Patterns"><Input defaultValue="[0-9]{16}" className="h-8 text-[12px]" /></Field>
          <Field label="Source categories"><Input defaultValue="Documents, APIs" className="h-8 text-[12px]" /></Field>
          <Field label="Knowledge domains"><Input defaultValue="Security" className="h-8 text-[12px]" /></Field>
          <Field label="Access requirements"><Input defaultValue="Compliance approval" className="h-8 text-[12px]" /></Field>
          <Field label="Retention policy"><Input defaultValue="7 years regulated" className="h-8 text-[12px]" /></Field>
          <Field label="Data residency"><Input defaultValue="In-country" className="h-8 text-[12px]" /></Field>
          <Field label="Approval owner"><Input defaultValue="Alex Valencia" className="h-8 text-[12px]" /></Field>
          <Field label="Review cadence"><Input defaultValue="Quarterly" className="h-8 text-[12px]" /></Field>
          <div className="sm:col-span-2">
            <Field label="Actions when detected"><Input defaultValue="Tag, Restrict, Notify, Require review, Quarantine" className="h-8 text-[12px]" /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!name.trim()}
            onClick={() => {
              onCreate({
                id: `cls-${Date.now()}`, name: name as DataClassificationRule["name"],
                description: "Regulated content classification", sources: 0, status: "Active",
                owner: "Alex Valencia", retention: "7 years regulated", reviewDate: "2025-12-01",
                detectionCriteria: "Keyword and pattern match", keywords: ["regulated"], patterns: ["[0-9]{16}"],
                sourceCategories: ["Documents"], knowledgeDomains: ["Security"], accessRequirements: "Compliance approval",
                dataResidency: "In-country", reviewCadence: "Quarterly", actions: ["Tag", "Restrict"],
              });
              onOpenChange(false);
            }}
          >
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ New Alert --------------------------------- */

export function NewAlertDialog({ open, onOpenChange, onCreate }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreate: (r: AlertRule) => void;
}) {
  const [name, setName] = useState("");
  useEffect(() => { if (!open) setName(""); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[16px]">New Alert Rule</DialogTitle>
          <DialogDescription className="text-[12px]">Notify the right owners when discovery behavior changes.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2 text-[12px]">
          <Field label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Event type"><Input defaultValue="Job failure" className="h-8 text-[12px]" /></Field>
          <Field label="Severity"><Input defaultValue="Warning" className="h-8 text-[12px]" /></Field>
          <Field label="Threshold"><Input defaultValue="1 occurrence" className="h-8 text-[12px]" /></Field>
          <Field label="Sources"><Input defaultValue="All" className="h-8 text-[12px]" /></Field>
          <Field label="Categories"><Input defaultValue="All" className="h-8 text-[12px]" /></Field>
          <Field label="Teams"><Input defaultValue="Platform Engineering" className="h-8 text-[12px]" /></Field>
          <Field label="Recipients"><Input defaultValue="Admins" className="h-8 text-[12px]" /></Field>
          <Field label="Delivery channels"><Input defaultValue="In app, Email" className="h-8 text-[12px]" /></Field>
          <Field label="Escalation delay"><Input defaultValue="15 min" className="h-8 text-[12px]" /></Field>
          <Field label="Repeat frequency"><Input defaultValue="Hourly" className="h-8 text-[12px]" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!name.trim()}
            onClick={() => {
              onCreate({
                id: `alr-${Date.now()}`, name, eventType: "Job failure", severity: "Warning",
                threshold: "1 occurrence", sources: "All", categories: "All", teams: "Platform Engineering",
                recipients: "Admins", deliveryChannels: ["In app", "Email"], escalationDelay: "15 min",
                repeatFrequency: "Hourly", enabled: true,
              });
              onOpenChange(false);
            }}
          >
            Create Alert Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- Save Changes -------------------------------- */

export interface PendingChange {
  id: string;
  objectType: string;
  object: string;
  previous: string;
  next: string;
  affectedSources: number;
  impact: string;
  highRisk?: boolean;
}

export function SaveChangesDialog({ open, onOpenChange, changes, onSave, onDiscard }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  changes: PendingChange[];
  onSave: (mode: "draft" | "activate", reason: string) => void;
  onDiscard: () => void;
}) {
  const [reason, setReason] = useState("");
  const [approved, setApproved] = useState(false);
  const highRisk = useMemo(() => changes.some((c) => c.highRisk), [changes]);
  useEffect(() => { if (!open) { setReason(""); setApproved(false); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Review Configuration Changes</DialogTitle>
          <DialogDescription className="text-[12px]">{changes.length} modified configuration objects.</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[11.5px]">
            <caption className="sr-only">Pending configuration changes</caption>
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="pb-1.5">Object</th>
                <th scope="col" className="pb-1.5 pl-3">Original</th>
                <th scope="col" className="pb-1.5 pl-3">Proposed</th>
                <th scope="col" className="pb-1.5 pl-3">Affected sources</th>
                <th scope="col" className="pb-1.5 pl-3">Impact</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-1.5 font-medium text-slate-900">{c.object}<span className="block text-[10.5px] text-slate-500">{c.objectType}</span></td>
                  <td className="py-1.5 pl-3">{c.previous}</td>
                  <td className="py-1.5 pl-3">{c.next}</td>
                  <td className="py-1.5 pl-3">{c.affectedSources}</td>
                  <td className="py-1.5 pl-3">{c.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {highRisk && (
          <label className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
            <Checkbox checked={approved} onCheckedChange={(v) => setApproved(!!v)} aria-label="Simulated approval" className="mt-0.5 h-3.5 w-3.5" />
            <span>High risk change detected. Simulated approval from Alex Valencia is required before activation.</span>
          </label>
        )}
        <div className="grid gap-1">
          <Label htmlFor="change-reason" className="text-[11px] text-slate-600">Change reason (optional)</Label>
          <Textarea id="change-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[56px] text-[12px]" />
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => { onDiscard(); onOpenChange(false); }}>Discard Changes</Button>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => { onSave("draft", reason); onOpenChange(false); }}>Save as Draft</Button>
          <Button size="sm" className="h-8 text-[12px]" disabled={highRisk && !approved} onClick={() => { onSave("activate", reason); onOpenChange(false); }}>Save and Activate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Export ------------------------------------ */

const FORMATS = ["JSON", "YAML", "CSV", "PDF Summary", "Presentation Snapshot"];
const SCOPES_EXPORT = ["Current filtered configuration", "Selected sources", "Policies only", "Schedules only", "Access configuration only", "Full configuration"];
const INCLUDES = ["Include metadata", "Include audit history", "Include policies", "Include schedules", "Include access mappings", "Include alerts"];

export function ExportConfigurationDialog({ open, onOpenChange, sources }: {
  open: boolean; onOpenChange: (v: boolean) => void; sources: SourceConfiguration[];
}) {
  const [format, setFormat] = useState("JSON");
  const [scope, setScope] = useState(SCOPES_EXPORT[0]);
  const [includes, setIncludes] = useState<string[]>(["Include metadata", "Include policies"]);
  const [progress, setProgress] = useState(-1);

  useEffect(() => { if (!open) setProgress(-1); }, [open]);
  useEffect(() => {
    if (progress < 0 || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, p + 25)), 220);
    return () => window.clearTimeout(t);
  }, [progress]);

  const run = () => {
    setProgress(0);
    const payload = { format, scope, includes, generatedAt: new Date().toISOString(), sources };
    let content = JSON.stringify(payload, null, 2);
    let ext = "json";
    if (format === "CSV") {
      ext = "csv";
      content = ["Source Name,Category,Platform,Owner,Status,Access,Discovery Mode,Schedule",
        ...sources.map((s) => [s.name, s.category, s.platform, s.businessOwner, s.status, s.access, s.discoveryMode, s.scheduleLabel].join(","))].join("\n");
    } else if (format === "YAML") {
      ext = "yaml";
      content = `scope: ${scope}\nsources:\n${sources.map((s) => `  - name: ${s.name}\n    platform: ${s.platform}\n    status: ${s.status}`).join("\n")}`;
    }
    if (format === "JSON" || format === "CSV" || format === "YAML") {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `discovery-configuration.${ext}`; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`${format} export generated`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Export Configuration</DialogTitle>
          <DialogDescription className="text-[12px]">Generate a portable copy of the current discovery configuration.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-[12px]">
          <div>
            <div className="mb-1 text-[11px] font-medium text-slate-600">Format</div>
            <ChoiceGrid options={FORMATS} value={format} onChange={setFormat} />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-medium text-slate-600">Scope</div>
            <ChoiceGrid options={SCOPES_EXPORT} value={scope} onChange={setScope} />
          </div>
          <div className="grid gap-1 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-[11.5px] text-slate-400">
              <Checkbox checked={false} disabled aria-label="Include secrets, unavailable" className="h-3.5 w-3.5" /> Include secrets (unavailable)
            </label>
            {INCLUDES.map((i) => (
              <label key={i} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <Checkbox
                  checked={includes.includes(i)} aria-label={i}
                  onCheckedChange={(v) => setIncludes((cur) => (v ? [...cur, i] : cur.filter((x) => x !== i)))}
                  className="h-3.5 w-3.5"
                />
                {i}
              </label>
            ))}
          </div>
          {progress >= 0 && (
            <div aria-live="polite">
              <Progress value={progress} className="h-1.5" />
              <p className="mt-1 text-[11px] text-slate-500">{progress >= 100 ? "Export complete." : "Generating export…"}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Close</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={run}>Generate Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
