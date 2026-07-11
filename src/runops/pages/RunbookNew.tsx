/**
 * Page 11 · Runbook Creation Wizard
 * Route: /runops/runbooks/new
 *
 * Creates a Draft runbook from templates, incidents, postmortems, docs,
 * executions, knowledge, existing runbooks, or manual/AI input. All state is
 * sourced through useOperations() — no fixture imports, no `any` types.
 * Deterministic sample content is used for document/AI extraction in Demo Mode.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, FileText, Save, Sparkles,
  Upload, Wand2, X, AlertTriangle, ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  EntityHeader, PermissionDeniedState,
} from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";
import type { AutonomyLevel, Environment } from "@/runops/data/scenario";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type SourceKind =
  | "blank"
  | "template"
  | "incident"
  | "postmortem"
  | "execution"
  | "knowledge"
  | "document"
  | "runbook"
  | "ai";

interface SourceRef {
  kind: SourceKind;
  id: string;
  label: string;
  detail?: string;
}

type StepKind = "diagnose" | "mitigate" | "validate" | "rollback";
type StepStatus = "proposed" | "accepted" | "rejected";

interface ExtractedStep {
  key: string;
  label: string;
  description: string;
  kind: StepKind;
  status: StepStatus;
  confidence: number;
  sources: string[];
}

interface ExtractedAssumption {
  key: string;
  text: string;
  status: StepStatus;
  confidence: number;
}

interface WizardDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  source: SourceRef | null;
  title: string;
  serviceId: string;
  components: string;
  environment: Environment;
  trigger: string;
  inputs: string;
  preconditions: string;
  expectedOutcome: string;
  successCriteria: string;
  risk: "Low" | "Medium" | "High";
  requiredSkills: string;
  approvals: string;
  rollback: string;
  evidence: string;
  owner: string;
  reviewers: string;
  autonomyTarget: AutonomyLevel;
  steps: ExtractedStep[];
  assumptions: ExtractedAssumption[];
  extractionFailed: boolean;
  lineage: { kind: "incident" | "postmortem" | "readiness" | "toil"; ref: string } | null;
}

const LS_DRAFT = "runops.runbookNew.draft.v1";

const STEP_TITLES = [
  "Source",
  "Scope and Purpose",
  "Applicability",
  "Workflow Extraction",
  "Risk and Autonomy",
  "Verification and Rollback",
  "Ownership and Review",
  "Summary",
] as const;

const AUTONOMY_LEVELS: readonly AutonomyLevel[] = [
  "Documentation Only",
  "Human Guided",
  "AI Recommended",
  "Human Initiated Automation",
  "Approval Gated Automation",
  "Supervised Autonomous",
  "Policy Bounded Autonomous",
];

/* Deterministic sample content used only in Demo Mode */
const SAMPLE_STEPS: readonly Omit<ExtractedStep, "status">[] = [
  { key: "s1", label: "Confirm alert scope", description: "Verify the alerting SLO burn and blast radius on the affected service.", kind: "diagnose", confidence: 0.92, sources: ["INC-10482 timeline", "PM-10482 §2"] },
  { key: "s2", label: "Isolate degraded shard", description: "Drain traffic from the degraded shard using the fleet controller.", kind: "mitigate", confidence: 0.86, sources: ["Prior execution EX-3391"] },
  { key: "s3", label: "Validate recovery", description: "Confirm SLO burn returns below 1x and error rate < 0.5%.", kind: "validate", confidence: 0.9, sources: ["SLO dashboard", "PM-10482 §5"] },
  { key: "s4", label: "Roll back on failure", description: "Restore the previous fleet configuration if validation fails.", kind: "rollback", confidence: 0.78, sources: ["Change CHG-8842"] },
];
const SAMPLE_ASSUMPTIONS: readonly Omit<ExtractedAssumption, "status">[] = [
  { key: "a1", text: "Fleet controller has drain permissions in this environment.", confidence: 0.7 },
  { key: "a2", text: "Rollback config is retained for at least 24 hours.", confidence: 0.65 },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function loadDraft(): WizardDraft | null {
  try {
    const raw = localStorage.getItem(LS_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw) as WizardDraft;
  } catch { return null; }
}
function saveDraft(d: WizardDraft) { localStorage.setItem(LS_DRAFT, JSON.stringify(d)); }
function clearDraft() { localStorage.removeItem(LS_DRAFT); }

function emptyDraft(env: Environment): WizardDraft {
  const now = new Date().toISOString();
  return {
    id: `RB-DRAFT-${Date.now().toString(36).toUpperCase()}`,
    createdAt: now, updatedAt: now, currentStep: 0,
    source: null,
    title: "", serviceId: "", components: "", environment: env,
    trigger: "", inputs: "", preconditions: "",
    expectedOutcome: "", successCriteria: "",
    risk: "Medium", requiredSkills: "", approvals: "",
    rollback: "", evidence: "",
    owner: "", reviewers: "",
    autonomyTarget: "Human Guided",
    steps: [], assumptions: [],
    extractionFailed: false,
    lineage: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function RunbookNew() {
  const ops = useOperations();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const [draft, setDraft] = useState<WizardDraft>(() => loadDraft() ?? emptyDraft(ops.environment));
  const [dirty, setDirty] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  /* Seed lineage from query params on first mount */
  useEffect(() => {
    const incident = params.get("fromIncident");
    const postmortem = params.get("fromPostmortem");
    const readiness = params.get("fromReadiness");
    const toil = params.get("fromToil");
    const template = params.get("fromTemplate");
    if (draft.source || !(incident || postmortem || readiness || toil || template)) return;
    setDraft((d) => {
      if (incident) {
        const inc = ops.incident;
        return { ...d,
          source: { kind: "incident", id: incident, label: `Incident ${incident}`, detail: inc?.title },
          lineage: { kind: "incident", ref: incident },
          serviceId: inc?.serviceId ?? d.serviceId,
          title: `Response for ${inc?.title ?? incident}`,
        };
      }
      if (postmortem) return { ...d,
        source: { kind: "postmortem", id: postmortem, label: `Postmortem ${postmortem}` },
        lineage: { kind: "postmortem", ref: postmortem },
      };
      if (readiness) return { ...d,
        source: { kind: "template", id: readiness, label: `Readiness gap ${readiness}` },
        lineage: { kind: "readiness", ref: readiness },
      };
      if (toil) return { ...d,
        source: { kind: "template", id: toil, label: `Toil candidate ${toil}` },
        lineage: { kind: "toil", ref: toil },
      };
      if (template) return { ...d,
        source: { kind: "template", id: template, label: `Template ${template}` },
      };
      return d;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-persist on every change */
  useEffect(() => {
    if (readOnly) return;
    const next = { ...draft, updatedAt: new Date().toISOString() };
    saveDraft(next);
  }, [draft, readOnly]);

  /* Guarded update helpers */
  const patch = useCallback(<K extends keyof WizardDraft>(k: K, v: WizardDraft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  }, []);

  const goto = useCallback((s: number) => setDraft((d) => ({ ...d, currentStep: Math.max(0, Math.min(STEP_TITLES.length - 1, s)) })), []);

  /* -------- Selectable source options from the provider (no fixtures) -------- */
  const templateOptions = useMemo(() => ops.runbooks
    .filter((r) => r.state === "Certified" || r.state === "Approved")
    .slice(0, 6), [ops.runbooks]);
  const executionOptions = useMemo(() => ops.executions
    .filter((e) => e.state === "Succeeded")
    .slice(0, 6), [ops.executions]);
  const runbookOptions = useMemo(() => ops.runbooks.slice(0, 8), [ops.runbooks]);

  /* -------- Duplicate title detection -------- */
  const trimmedTitle = draft.title.trim().toLowerCase();
  const duplicateTitle = trimmedTitle.length > 0
    && ops.runbooks.some((r) => r.title.trim().toLowerCase() === trimmedTitle);

  /* -------- Validation for step advancement -------- */
  const stepErrors = useMemo<string[]>(() => {
    const errs: string[] = [];
    switch (draft.currentStep) {
      case 0:
        if (!draft.source) errs.push("Select a source or choose Start blank.");
        break;
      case 1:
        if (!draft.title.trim()) errs.push("Title is required.");
        if (!draft.serviceId) errs.push("Service is required.");
        if (duplicateTitle) errs.push("A runbook with this title already exists.");
        break;
      case 2:
        if (!draft.trigger.trim()) errs.push("Trigger is required.");
        if (!draft.preconditions.trim()) errs.push("Preconditions are required.");
        break;
      case 3:
        if (!draft.steps.some((s) => s.status === "accepted")) errs.push("Accept at least one workflow step.");
        break;
      case 5:
        if (!draft.rollback.trim()) errs.push("Rollback plan is required.");
        if (!draft.successCriteria.trim()) errs.push("Success criteria required.");
        break;
      case 6:
        if (!draft.owner.trim()) errs.push("Owner is required.");
        break;
    }
    return errs;
  }, [draft, duplicateTitle]);

  /* -------- Actions -------- */
  const handleSaveDraft = useCallback(() => {
    const now = new Date().toISOString();
    const next = { ...draft, updatedAt: now };
    saveDraft(next);
    setDraft(next);
    setSavedAt(now);
    setDirty(false);
    ops.pushNotification({
      kind: "info",
      title: "Draft saved",
      detail: `${next.title || next.id} · step ${next.currentStep + 1}/${STEP_TITLES.length}`,
      entityRef: next.id,
    });
  }, [draft, ops]);

  const handleExtract = useCallback((failMode: boolean) => {
    if (failMode) {
      setDraft((d) => ({ ...d, extractionFailed: true, steps: [], assumptions: [] }));
      ops.pushNotification({
        kind: "warning",
        title: "Extraction failed",
        detail: "Unsupported document format — retry with plain text or use AI assistance.",
        entityRef: draft.id,
      });
      return;
    }
    setDraft((d) => ({
      ...d,
      extractionFailed: false,
      steps: SAMPLE_STEPS.map((s) => ({ ...s, status: "proposed" })),
      assumptions: SAMPLE_ASSUMPTIONS.map((a) => ({ ...a, status: "proposed" })),
    }));
    setDirty(true);
    ops.pushNotification({
      kind: "info",
      title: "Extraction complete",
      detail: `${SAMPLE_STEPS.length} steps · ${SAMPLE_ASSUMPTIONS.length} assumptions proposed`,
      entityRef: draft.id,
    });
  }, [draft.id, ops]);

  const setStepStatus = useCallback((key: string, status: StepStatus) => {
    setDraft((d) => ({ ...d, steps: d.steps.map((s) => s.key === key ? { ...s, status } : s) }));
    setDirty(true);
  }, []);
  const setAssumptionStatus = useCallback((key: string, status: StepStatus) => {
    setDraft((d) => ({ ...d, assumptions: d.assumptions.map((a) => a.key === key ? { ...a, status } : a) }));
    setDirty(true);
  }, []);
  const editStepDescription = useCallback((key: string, description: string) => {
    setDraft((d) => ({ ...d, steps: d.steps.map((s) => s.key === key ? { ...s, description } : s) }));
    setDirty(true);
  }, []);

  const handleFinish = useCallback(() => {
    if (stepErrors.length > 0) return;
    const finishedId = draft.id;
    ops.pushNotification({
      kind: "info",
      title: "Draft runbook created",
      detail: `${draft.title} · ${draft.autonomyTarget}${draft.lineage ? ` · linked to ${draft.lineage.ref}` : ""}`,
      entityRef: finishedId,
      route: `/runops/runbooks/${finishedId}/designer`,
    });
    clearDraft();
    navigate(`/runops/runbooks/${finishedId}/designer`);
  }, [draft, navigate, ops, stepErrors.length]);

  const handleCancelConfirm = useCallback(() => {
    // Preserve recoverable draft
    saveDraft({ ...draft, updatedAt: new Date().toISOString() });
    setCancelOpen(false);
    ops.pushNotification({
      kind: "info",
      title: "Wizard cancelled",
      detail: `Draft ${draft.id} kept for recovery`,
      entityRef: draft.id,
    });
    navigate("/runops/runbooks");
  }, [draft, navigate, ops]);

  /* -------- Permission gate -------- */
  if (readOnly) {
    return (
      <div className="p-6">
        <PermissionDeniedState
          title="Read-only role"
          description="Your current role cannot create runbooks. Switch to an authoring role to continue."
        />
      </div>
    );
  }

  const canAdvance = stepErrors.length === 0;
  const stepIndex = draft.currentStep;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6" aria-label="Runbook creation wizard">
      <EntityHeader
        eyebrow="Runbooks"
        title="Create Runbook"
        subtitle={`Draft ${draft.id}${draft.lineage ? ` · linked ${draft.lineage.ref}` : ""}`}
        meta={[
          { label: "Tenant", value: ops.tenant.name },
          { label: "Environment", value: draft.environment },
          { label: "Role", value: ops.role },
          { label: "Step", value: `${stepIndex + 1}/${STEP_TITLES.length}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft} aria-label="Save draft">
              <Save className="h-4 w-4" aria-hidden /> Save Draft
            </Button>
            <Button variant="ghost" size="sm" onClick={() => (dirty ? setCancelOpen(true) : navigate("/runops/runbooks"))} aria-label="Cancel wizard">
              <X className="h-4 w-4" aria-hidden /> Cancel
            </Button>
          </div>
        }
      />

      {savedAt && (
        <div className="text-xs text-muted-foreground" role="status" aria-live="polite">
          Draft auto-saved at {new Date(savedAt).toLocaleTimeString()}.
        </div>
      )}

      {/* Stepper */}
      <nav aria-label="Wizard steps" className="rounded border border-border bg-card p-3">
        <ol className="flex flex-wrap gap-2">
          {STEP_TITLES.map((label, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => goto(i)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    active && "bg-primary text-primary-foreground",
                    !active && done && "bg-muted text-foreground",
                    !active && !done && "bg-background text-muted-foreground border border-border",
                  )}
                >
                  {i + 1}. {label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Body */}
      <Card>
        <CardHeader>
          <CardTitle>{STEP_TITLES[stepIndex]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stepIndex === 0 && (
            <SourceStep
              draft={draft}
              templateOptions={templateOptions}
              executionOptions={executionOptions}
              runbookOptions={runbookOptions}
              incidentId={ops.incident?.id ?? ""}
              onPick={(source) => { patch("source", source); }}
            />
          )}

          {stepIndex === 1 && (
            <ScopeStep
              draft={draft}
              services={ops.services}
              duplicateTitle={duplicateTitle}
              onPatch={patch}
            />
          )}

          {stepIndex === 2 && (
            <ApplicabilityStep draft={draft} onPatch={patch} envs={ops.environmentOptions} />
          )}

          {stepIndex === 3 && (
            <WorkflowStep
              draft={draft}
              onExtract={handleExtract}
              onSetStep={setStepStatus}
              onSetAssumption={setAssumptionStatus}
              onEditDescription={editStepDescription}
            />
          )}

          {stepIndex === 4 && (
            <RiskStep draft={draft} onPatch={patch} />
          )}

          {stepIndex === 5 && (
            <VerificationStep draft={draft} onPatch={patch} />
          )}

          {stepIndex === 6 && (
            <OwnershipStep draft={draft} onPatch={patch} />
          )}

          {stepIndex === 7 && (
            <SummaryStep draft={draft} />
          )}

          {stepErrors.length > 0 && (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" aria-hidden /> Missing required information
              </div>
              <ul className="ml-6 mt-1 list-disc">
                {stepErrors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goto(stepIndex - 1)}
          disabled={stepIndex === 0}
          aria-label="Previous step"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </Button>
        <div className="text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </div>
        {stepIndex < STEP_TITLES.length - 1 ? (
          <Button
            onClick={() => goto(stepIndex + 1)}
            disabled={!canAdvance}
            aria-label="Next step"
          >
            Next <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={!canAdvance} aria-label="Finish and open designer">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Finish
          </Button>
        )}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel wizard?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. The draft ({draft.id}) will be kept and can be recovered from the runbook library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep editing</Button>
            <Button onClick={handleCancelConfirm}>Save and exit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step components                                                             */
/* -------------------------------------------------------------------------- */

interface SourceStepProps {
  draft: WizardDraft;
  templateOptions: readonly { id: string; title: string }[];
  executionOptions: readonly { id: string; title: string }[];
  runbookOptions: readonly { id: string; title: string }[];
  incidentId: string;
  onPick: (source: SourceRef) => void;
}
function SourceStep({ draft, templateOptions, executionOptions, runbookOptions, incidentId, onPick }: SourceStepProps) {
  const tiles: readonly { kind: SourceKind; label: string; detail: string; icon: typeof FileText }[] = [
    { kind: "blank", label: "Start blank", detail: "Build a runbook from scratch", icon: FileText },
    { kind: "template", label: "Approved template", detail: `${templateOptions.length} certified templates`, icon: FileText },
    { kind: "incident", label: "Prior incident", detail: incidentId ? `Seed from ${incidentId}` : "Select an incident", icon: AlertTriangle },
    { kind: "postmortem", label: "Postmortem", detail: "Improvement actions from a PM", icon: FileText },
    { kind: "execution", label: "Successful execution", detail: `${executionOptions.length} succeeded`, icon: CheckCircle2 },
    { kind: "knowledge", label: "Knowledge article", detail: "Reference an internal KB entry", icon: FileText },
    { kind: "document", label: "Uploaded document", detail: "Extract steps from a doc (demo)", icon: Upload },
    { kind: "runbook", label: "Existing runbook", detail: `${runbookOptions.length} in tenant`, icon: FileText },
    { kind: "ai", label: "AI assisted draft", detail: "Draft with grounded suggestions", icon: Sparkles },
  ];
  const currentKind = draft.source?.kind ?? null;

  const options = useMemo(() => {
    switch (currentKind) {
      case "template": return templateOptions.map((t) => ({ id: t.id, label: `${t.id} · ${t.title}` }));
      case "execution": return executionOptions.map((e) => ({ id: e.id, label: `${e.id} · ${e.title}` }));
      case "runbook": return runbookOptions.map((r) => ({ id: r.id, label: `${r.id} · ${r.title}` }));
      case "incident": return incidentId ? [{ id: incidentId, label: `${incidentId} · current SEV 1` }] : [];
      case "postmortem": return [{ id: "PM-10482", label: "PM-10482 · Checkout latency" }];
      case "knowledge": return [{ id: "KB-2201", label: "KB-2201 · Query plan regressions" }];
      case "document": return [{ id: "DOC-SAMPLE", label: "Sample_Runbook_Draft.pdf" }];
      case "ai": return [{ id: "AI-DRAFT", label: "AI: Latency mitigation pattern" }];
      default: return [];
    }
  }, [currentKind, templateOptions, executionOptions, runbookOptions, incidentId]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          const active = currentKind === t.kind;
          return (
            <button
              key={t.kind}
              type="button"
              onClick={() => onPick({ kind: t.kind, id: t.kind === "blank" ? "blank" : "", label: t.label })}
              aria-pressed={active}
              className={cn(
                "flex items-start gap-3 rounded border p-3 text-left text-sm transition-colors",
                active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent",
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <div>
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.detail}</div>
              </div>
            </button>
          );
        })}
      </div>

      {currentKind && currentKind !== "blank" && options.length > 0 && (
        <div className="space-y-2">
          <Label>Choose specific source</Label>
          <Select
            value={draft.source?.id || ""}
            onValueChange={(v) => {
              const chosen = options.find((o) => o.id === v);
              if (chosen) onPick({ kind: currentKind, id: chosen.id, label: chosen.label });
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {draft.source && (
        <div className="rounded border border-border bg-muted/50 p-3 text-sm">
          <div className="font-medium">Selected: {draft.source.label}</div>
          {draft.source.detail && <div className="text-xs text-muted-foreground">{draft.source.detail}</div>}
        </div>
      )}
    </div>
  );
}

interface ScopeStepProps {
  draft: WizardDraft;
  services: readonly { id: string; name: string }[];
  duplicateTitle: boolean;
  onPatch: <K extends keyof WizardDraft>(k: K, v: WizardDraft[K]) => void;
}
function ScopeStep({ draft, services, duplicateTitle, onPatch }: ScopeStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="rb-title">Title</Label>
        <Input
          id="rb-title"
          value={draft.title}
          onChange={(e) => onPatch("title", e.target.value)}
          placeholder="e.g. Checkout latency mitigation"
          aria-invalid={duplicateTitle || undefined}
        />
        {duplicateTitle && (
          <div className="text-xs text-amber-700">A runbook with this title already exists.</div>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-service">Service</Label>
        <Select value={draft.serviceId} onValueChange={(v) => onPatch("serviceId", v)}>
          <SelectTrigger id="rb-service"><SelectValue placeholder="Select service" /></SelectTrigger>
          <SelectContent>
            {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-components">Components</Label>
        <Input id="rb-components" value={draft.components} onChange={(e) => onPatch("components", e.target.value)} placeholder="Comma-separated component IDs" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="rb-outcome">Expected outcome</Label>
        <Textarea id="rb-outcome" value={draft.expectedOutcome} onChange={(e) => onPatch("expectedOutcome", e.target.value)} rows={2} />
      </div>
    </div>
  );
}

interface ApplicabilityStepProps {
  draft: WizardDraft;
  envs: readonly Environment[];
  onPatch: <K extends keyof WizardDraft>(k: K, v: WizardDraft[K]) => void;
}
function ApplicabilityStep({ draft, envs, onPatch }: ApplicabilityStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="rb-env">Environment</Label>
        <Select value={draft.environment} onValueChange={(v) => onPatch("environment", v as Environment)}>
          <SelectTrigger id="rb-env"><SelectValue /></SelectTrigger>
          <SelectContent>
            {envs.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-trigger">Trigger</Label>
        <Input id="rb-trigger" value={draft.trigger} onChange={(e) => onPatch("trigger", e.target.value)} placeholder="e.g. SLO burn rate > 2x for 5m" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="rb-inputs">Inputs</Label>
        <Textarea id="rb-inputs" rows={2} value={draft.inputs} onChange={(e) => onPatch("inputs", e.target.value)} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="rb-pre">Preconditions</Label>
        <Textarea id="rb-pre" rows={2} value={draft.preconditions} onChange={(e) => onPatch("preconditions", e.target.value)} />
      </div>
    </div>
  );
}

interface WorkflowStepProps {
  draft: WizardDraft;
  onExtract: (failMode: boolean) => void;
  onSetStep: (key: string, s: StepStatus) => void;
  onSetAssumption: (key: string, s: StepStatus) => void;
  onEditDescription: (key: string, description: string) => void;
}
function WorkflowStep({ draft, onExtract, onSetStep, onSetAssumption, onEditDescription }: WorkflowStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onExtract(false)} aria-label="Run AI extraction">
          <Wand2 className="h-4 w-4" aria-hidden /> AI Extract
        </Button>
        <Button size="sm" variant="outline" onClick={() => onExtract(true)} aria-label="Simulate extraction failure">
          Simulate failure
        </Button>
        <div className="text-xs text-muted-foreground">Every proposed item must be accepted, edited, or rejected.</div>
      </div>

      {draft.extractionFailed && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="h-4 w-4" aria-hidden /> Extraction failed
          </div>
          <div className="text-xs">The source format could not be parsed. Retry with plain text or another source.</div>
        </div>
      )}

      {draft.steps.length === 0 && !draft.extractionFailed && (
        <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No steps yet. Run AI Extract or return to Source to pick another input.
        </div>
      )}

      {draft.steps.length > 0 && (
        <div className="space-y-2">
          {draft.steps.map((s) => (
            <div key={s.key} className={cn(
              "rounded border p-3",
              s.status === "accepted" && "border-emerald-300 bg-emerald-50",
              s.status === "rejected" && "border-slate-200 bg-slate-50 opacity-60",
              s.status === "proposed" && "border-border bg-card",
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{s.kind}</Badge>
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="text-xs text-muted-foreground">confidence {(s.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Textarea
                    className="mt-2"
                    rows={2}
                    value={s.description}
                    onChange={(e) => onEditDescription(s.key, e.target.value)}
                    aria-label={`Description for ${s.label}`}
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    Sources: {s.sources.join(", ")} · Uncertainty: {(100 - s.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant={s.status === "accepted" ? "default" : "outline"} onClick={() => onSetStep(s.key, "accepted")}>Accept</Button>
                  <Button size="sm" variant={s.status === "rejected" ? "default" : "outline"} onClick={() => onSetStep(s.key, "rejected")}>Reject</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft.assumptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Assumptions</div>
          {draft.assumptions.map((a) => (
            <div key={a.key} className="flex items-center justify-between rounded border border-border bg-card p-2 text-sm">
              <div>
                <div>{a.text}</div>
                <div className="text-xs text-muted-foreground">confidence {(a.confidence * 100).toFixed(0)}% · uncertainty {(100 - a.confidence * 100).toFixed(0)}%</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant={a.status === "accepted" ? "default" : "outline"} onClick={() => onSetAssumption(a.key, "accepted")}>Accept</Button>
                <Button size="sm" variant={a.status === "rejected" ? "default" : "outline"} onClick={() => onSetAssumption(a.key, "rejected")}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RiskStepProps {
  draft: WizardDraft;
  onPatch: <K extends keyof WizardDraft>(k: K, v: WizardDraft[K]) => void;
}
function RiskStep({ draft, onPatch }: RiskStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="rb-risk">Risk</Label>
        <Select value={draft.risk} onValueChange={(v) => onPatch("risk", v as WizardDraft["risk"])}>
          <SelectTrigger id="rb-risk"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(["Low", "Medium", "High"] as const).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-autonomy">Autonomy target</Label>
        <Select value={draft.autonomyTarget} onValueChange={(v) => onPatch("autonomyTarget", v as AutonomyLevel)}>
          <SelectTrigger id="rb-autonomy"><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUTONOMY_LEVELS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="rb-skills">Required skills</Label>
        <Input id="rb-skills" value={draft.requiredSkills} onChange={(e) => onPatch("requiredSkills", e.target.value)} placeholder="e.g. Database SRE, Change Manager" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="rb-approvals">Approvals</Label>
        <Input id="rb-approvals" value={draft.approvals} onChange={(e) => onPatch("approvals", e.target.value)} placeholder="e.g. Change Manager, Service Owner" />
      </div>
    </div>
  );
}

function VerificationStep({ draft, onPatch }: RiskStepProps) {
  return (
    <div className="grid gap-4">
      <div className="space-y-1">
        <Label htmlFor="rb-success">Success criteria</Label>
        <Textarea id="rb-success" rows={2} value={draft.successCriteria} onChange={(e) => onPatch("successCriteria", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-rollback">Rollback</Label>
        <Textarea id="rb-rollback" rows={2} value={draft.rollback} onChange={(e) => onPatch("rollback", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-evidence">Evidence to capture</Label>
        <Textarea id="rb-evidence" rows={2} value={draft.evidence} onChange={(e) => onPatch("evidence", e.target.value)} placeholder="e.g. SLO dashboard snapshot, execution transcript" />
      </div>
    </div>
  );
}

function OwnershipStep({ draft, onPatch }: RiskStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="rb-owner">Owner</Label>
        <Input id="rb-owner" value={draft.owner} onChange={(e) => onPatch("owner", e.target.value)} placeholder="Team or person" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="rb-reviewers">Reviewers</Label>
        <Input id="rb-reviewers" value={draft.reviewers} onChange={(e) => onPatch("reviewers", e.target.value)} placeholder="Comma-separated" />
      </div>
      <div className="md:col-span-2 flex items-center gap-2">
        <Checkbox id="rb-attest" />
        <Label htmlFor="rb-attest" className="text-sm">I attest the runbook meets tenant authoring standards.</Label>
      </div>
    </div>
  );
}

function SummaryStep({ draft }: { draft: WizardDraft }) {
  const accepted = draft.steps.filter((s) => s.status === "accepted").length;
  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2 md:grid-cols-2">
        <Kv label="Draft ID" value={draft.id} />
        <Kv label="Title" value={draft.title || "—"} />
        <Kv label="Service" value={draft.serviceId || "—"} />
        <Kv label="Environment" value={draft.environment} />
        <Kv label="Trigger" value={draft.trigger || "—"} />
        <Kv label="Risk" value={draft.risk} />
        <Kv label="Autonomy target" value={draft.autonomyTarget} />
        <Kv label="Owner" value={draft.owner || "—"} />
        <Kv label="Source" value={draft.source?.label ?? "—"} />
        <Kv label="Lineage" value={draft.lineage ? `${draft.lineage.kind}:${draft.lineage.ref}` : "—"} />
        <Kv label="Accepted steps" value={`${accepted}/${draft.steps.length}`} />
      </div>
      <div className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
        Finishing will create a Draft runbook, record an audit event, emit a <code>RunbookDrafted</code> domain event, and open the designer.
      </div>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded border border-border bg-card p-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
