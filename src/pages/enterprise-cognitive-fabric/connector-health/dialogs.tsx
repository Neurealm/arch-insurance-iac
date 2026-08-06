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
import { connectorsToCsv, download } from "./panels";
import {
  buildDiagnostic, categories, connectorById, connectors, diagnosticDepths, diagnosticPhases,
  diagnosticScopes, diagnosticTestTypes, makeConnector,
  type ConnectorCategory, type ConnectorDiagnostic, type ConnectorHealthRecord,
} from "./data";

/* --------------------------------- helpers -------------------------------- */

function ChoiceGrid({ options, value, onChange, cols = 3 }: {
  options: readonly string[]; value: string; onChange: (v: string) => void; cols?: number;
}) {
  return (
    <div className={cn("grid gap-1.5", cols === 2 ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
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

function MultiGrid({ options, value, onChange, cols = 3 }: {
  options: readonly string[]; value: string[]; onChange: (v: string[]) => void; cols?: number;
}) {
  return (
    <div className={cn("grid gap-1.5", cols === 2 ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o} type="button" aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-left text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              on ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50",
            )}
          >
            <Checkbox checked={on} className="pointer-events-none h-3.5 w-3.5" tabIndex={-1} />
            {o}
          </button>
        );
      })}
    </div>
  );
}

function StepHeader({ step, total, title, description }: { step: number; total: number; title: string; description: string }) {
  return (
    <div className="space-y-1.5">
      <Progress value={((step + 1) / total) * 100} className="h-1" aria-label={`Step ${step + 1} of ${total}`} />
      <p className="text-[10.5px] uppercase tracking-wide text-slate-500">Step {step + 1} of {total}</p>
      <p className="text-[13px] font-semibold text-slate-900">{title}</p>
      <p className="text-[11.5px] text-slate-600">{description}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11.5px] text-slate-700">{label}</Label>
      {children}
      {hint && <p className="text-[10.5px] text-slate-500">{hint}</p>}
    </div>
  );
}

const Summary = ({ rows }: { rows: [string, string][] }) => (
  <dl className="rounded-md border border-slate-200 bg-slate-50 p-2">
    {rows.map(([k, v]) => (
      <div key={k} className="flex items-start justify-between gap-3 border-b border-slate-200 py-0.5 last:border-0">
        <dt className="text-[11px] text-slate-500">{k}</dt>
        <dd className="text-right text-[11.5px] font-medium text-slate-800">{v || "—"}</dd>
      </div>
    ))}
  </dl>
);

/* ----------------------------- Run Diagnostics ---------------------------- */

export function RunDiagnosticsDialog({ open, onOpenChange, selectedIds, onComplete }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedIds: string[];
  onComplete: (d: ConnectorDiagnostic) => void;
}) {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState(selectedIds.length ? "Selected Connectors" : "All Connectors");
  const [category, setCategory] = useState<string>("Documents");
  const [tests, setTests] = useState<string[]>(["Network Connectivity", "Authentication", "Authorization", "Latency", "Metadata Retrieval"]);
  const [depth, setDepth] = useState("Standard Diagnostics");
  const [safety, setSafety] = useState(true);
  const [phase, setPhase] = useState(0);
  const total = 5;

  useEffect(() => {
    if (!open) { setStep(0); setPhase(0); }
  }, [open]);

  useEffect(() => {
    if (step !== 3) return;
    if (phase >= diagnosticPhases.length - 1) {
      const t = setTimeout(() => setStep(4), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase((p) => p + 1), 420);
    return () => clearTimeout(t);
  }, [step, phase]);

  const targets = useMemo(() => {
    if (scope === "Selected Connectors") return selectedIds.length ? selectedIds : connectors.slice(0, 3).map((c) => c.id);
    if (scope === "Connector Category") return connectors.filter((c) => c.category === category).map((c) => c.id);
    return connectors.map((c) => c.id);
  }, [scope, selectedIds, category]);

  const finish = () => {
    const d = buildDiagnostic(targets, scope, depth, tests);
    onComplete(d);
    onOpenChange(false);
    toast.success("Diagnostics complete", { description: `${d.testsPassed} passed, ${d.testsWarning} warnings, ${d.testsFailed} failed.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Run Connector Diagnostics</DialogTitle>
          <DialogDescription className="text-[12px]">
            Read-only validation of connectivity, security, permissions, performance, and synchronization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {step === 0 && (
            <>
              <StepHeader step={0} total={total} title="Select diagnostic scope" description="Choose which connectors are included in this diagnostic run." />
              <ChoiceGrid options={diagnosticScopes} value={scope} onChange={setScope} />
              {scope === "Connector Category" && (
                <Field label="Connector category">
                  <ChoiceGrid options={categories} value={category} onChange={setCategory} />
                </Field>
              )}
              <p className="text-[11.5px] text-slate-600">{targets.length} connector{targets.length === 1 ? "" : "s"} will be tested.</p>
            </>
          )}

          {step === 1 && (
            <>
              <StepHeader step={1} total={total} title="Select tests" description="Each test is a read-only probe. No content is written to the source platform." />
              <MultiGrid options={diagnosticTestTypes} value={tests} onChange={setTests} />
              <p className="text-[11.5px] text-slate-600">{tests.length} tests selected.</p>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader step={2} total={total} title="Confirm depth and safety" description="Deeper diagnostics take longer and issue more probe requests against the source platform." />
              <ChoiceGrid options={diagnosticDepths} value={depth} onChange={setDepth} cols={2} />
              <label className="flex items-start gap-2 rounded-md border border-slate-200 p-2 text-[11.5px] text-slate-700">
                <Checkbox checked={safety} onCheckedChange={(v) => setSafety(Boolean(v))} className="mt-0.5 h-3.5 w-3.5" />
                <span>
                  I confirm this diagnostic is read-only, will not modify source content, and may consume rate-limit capacity on the target platform.
                </span>
              </label>
              <Summary rows={[
                ["Scope", scope],
                ["Connectors", String(targets.length)],
                ["Tests", String(tests.length)],
                ["Depth", depth],
                ["Estimated duration", `${Math.max(1, Math.round((targets.length * tests.length) / 20))} min`],
              ]} />
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader step={3} total={total} title="Running diagnostics" description="Live progress by phase. You can leave this dialog open until it completes." />
              <Progress value={((phase + 1) / diagnosticPhases.length) * 100} className="h-2" />
              <ol className="space-y-0.5">
                {diagnosticPhases.map((p, i) => (
                  <li key={p} className={cn("flex items-center justify-between text-[11.5px]", i <= phase ? "text-slate-800" : "text-slate-400")}>
                    <span>{p}</span>
                    <span>{i < phase ? "Complete" : i === phase ? "In progress" : "Pending"}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader step={4} total={total} title="Diagnostics complete" description="Review the summary, then open the full results to inspect every test." />
              <Summary rows={[
                ["Connectors tested", String(targets.length)],
                ["Tests executed", String(Math.min(6, targets.length) * tests.length)],
                ["Depth", depth],
                ["Scope", scope],
              ]} />
              <p className="text-[11.5px] text-slate-600">
                Full results, per-test evidence, and recommended actions open in the diagnostics panel.
              </p>
            </>
          )}
        </div>

        <DialogFooter className="gap-1.5">
          {step > 0 && step !== 3 && step !== 4 && (
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step < 2 && (
            <Button size="sm" className="h-8 text-[12px]" disabled={step === 1 && tests.length === 0} onClick={() => setStep(step + 1)}>Continue</Button>
          )}
          {step === 2 && (
            <Button size="sm" className="h-8 text-[12px]" disabled={!safety} onClick={() => { setPhase(0); setStep(3); }}>Run diagnostics</Button>
          )}
          {step === 4 && <Button size="sm" className="h-8 text-[12px]" onClick={finish}>View results</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Add Connector ----------------------------- */

const AUTH_METHODS = ["OAuth 2.0", "Service Account", "API Key", "Certificate", "Token", "Managed Identity"];
const CLASSIFICATIONS = ["Internal", "Confidential", "Restricted", "Highly Restricted"];
const RESIDENCY = ["United States", "European Union", "United Kingdom", "Asia Pacific", "Global"];
const ENVIRONMENTS = ["Production", "Staging", "Development"];
const REGIONS = ["North America", "Europe", "Asia Pacific", "Global"];
const SCOPES = ["Read Only", "Read and Metadata", "Read, Metadata, Attachments", "Metadata Only"];

export function AddConnectorDialog({ open, onOpenChange, nextIndex, onCreated }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nextIndex: number;
  onCreated: (c: ConnectorHealthRecord) => void;
}) {
  const total = 10;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", description: "", category: "Documents" as ConnectorCategory, platform: "",
    environment: "Production", region: "North America", businessUnit: "Technology",
    owner: "", technicalOwner: "", securityOwner: "",
    authenticationMethod: "OAuth 2.0", permissionScope: "Read Only",
    accessClassification: "Internal", dataResidency: "United States",
    schedule: "Every 15 minutes", freshnessTarget: "15 minutes", availabilityTarget: "99.9",
    latencyTarget: "500", errorThreshold: "1", alertProfile: "Standard Operations",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => { if (!open) { setStep(0); setValidated(false); setValidating(false); } }, [open]);

  const canContinue =
    step === 0 ? form.name.trim().length > 2 && form.platform.trim().length > 1
      : step === 3 ? form.owner.trim().length > 2
        : step === 8 ? validated
          : true;

  const runValidation = () => {
    setValidating(true);
    setTimeout(() => { setValidating(false); setValidated(true); }, 900);
  };

  const submit = () => {
    const c = makeConnector({ ...form, index: nextIndex });
    onCreated(c);
    onOpenChange(false);
    toast.success("Connector registered", { description: `${c.name} added as ${c.id}. First discovery cycle scheduled.` });
  };

  const steps: { title: string; description: string; body: React.ReactNode }[] = [
    {
      title: "Connector identity",
      description: "Name the connector and identify the platform it will read from.",
      body: (
        <div className="space-y-2">
          <Field label="Connector name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Confluence Product Space" className="h-8 text-[12px]" /></Field>
          <Field label="Platform"><Input value={form.platform} onChange={(e) => set("platform", e.target.value)} placeholder="Atlassian Confluence Cloud" className="h-8 text-[12px]" /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="text-[12px]" placeholder="What organizational knowledge does this connector make discoverable?" /></Field>
        </div>
      ),
    },
    {
      title: "Connector category",
      description: "Category determines default tests, freshness expectations, and dependency mapping.",
      body: <ChoiceGrid options={categories} value={form.category} onChange={(v) => set("category", v)} />,
    },
    {
      title: "Environment and residency",
      description: "Where the connector runs and where the data it reads is allowed to reside.",
      body: (
        <div className="space-y-2">
          <Field label="Environment"><ChoiceGrid options={ENVIRONMENTS} value={form.environment} onChange={(v) => set("environment", v)} /></Field>
          <Field label="Region"><ChoiceGrid options={REGIONS} value={form.region} onChange={(v) => set("region", v)} /></Field>
          <Field label="Data residency"><ChoiceGrid options={RESIDENCY} value={form.dataResidency} onChange={(v) => set("dataResidency", v)} /></Field>
        </div>
      ),
    },
    {
      title: "Ownership",
      description: "Accountable owners for operations, engineering, and security review.",
      body: (
        <div className="space-y-2">
          <Field label="Business owner"><Input value={form.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Knowledge Operations" className="h-8 text-[12px]" /></Field>
          <Field label="Technical owner"><Input value={form.technicalOwner} onChange={(e) => set("technicalOwner", e.target.value)} placeholder="Platform Engineering" className="h-8 text-[12px]" /></Field>
          <Field label="Security owner"><Input value={form.securityOwner} onChange={(e) => set("securityOwner", e.target.value)} placeholder="Information Security" className="h-8 text-[12px]" /></Field>
          <Field label="Business unit"><Input value={form.businessUnit} onChange={(e) => set("businessUnit", e.target.value)} className="h-8 text-[12px]" /></Field>
        </div>
      ),
    },
    {
      title: "Authentication method",
      description: "Only credential metadata is retained. Secrets are never displayed or stored in this workspace.",
      body: (
        <div className="space-y-2">
          <ChoiceGrid options={AUTH_METHODS} value={form.authenticationMethod} onChange={(v) => set("authenticationMethod", v)} />
          <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
            Credential values are entered in the secure credential service. This workflow records the method, owner, and rotation policy only.
          </p>
        </div>
      ),
    },
    {
      title: "Permission scope",
      description: "Request the narrowest scope that satisfies the discovery objective.",
      body: (
        <div className="space-y-2">
          <ChoiceGrid options={SCOPES} value={form.permissionScope} onChange={(v) => set("permissionScope", v)} cols={2} />
          <Field label="Access classification"><ChoiceGrid options={CLASSIFICATIONS} value={form.accessClassification} onChange={(v) => set("accessClassification", v)} cols={2} /></Field>
        </div>
      ),
    },
    {
      title: "Discovery schedule",
      description: "How often the connector polls the source platform for new and changed artifacts.",
      body: (
        <div className="space-y-2">
          <ChoiceGrid
            options={["Every 5 minutes", "Every 15 minutes", "Every 30 minutes", "Hourly", "Every 6 hours", "Daily"]}
            value={form.schedule} onChange={(v) => set("schedule", v)}
          />
          <Field label="Freshness target" hint="Maximum acceptable age of discovered evidence before the source is marked stale.">
            <Input value={form.freshnessTarget} onChange={(e) => set("freshnessTarget", e.target.value)} className="h-8 text-[12px]" />
          </Field>
        </div>
      ),
    },
    {
      title: "Health targets",
      description: "Thresholds that determine when this connector is reported as warning or degraded.",
      body: (
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="Availability target %"><Input value={form.availabilityTarget} onChange={(e) => set("availabilityTarget", e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Latency target ms"><Input value={form.latencyTarget} onChange={(e) => set("latencyTarget", e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Error threshold %"><Input value={form.errorThreshold} onChange={(e) => set("errorThreshold", e.target.value)} className="h-8 text-[12px]" /></Field>
        </div>
      ),
    },
    {
      title: "Alert routing",
      description: "Who is notified when this connector breaches a threshold.",
      body: (
        <ChoiceGrid
          options={["Standard Operations", "Critical Path", "Security Review", "Silent Monitoring"]}
          value={form.alertProfile} onChange={(v) => set("alertProfile", v)} cols={2}
        />
      ),
    },
    {
      title: "Validate connection",
      description: "Run a read-only validation before the connector is registered.",
      body: (
        <div className="space-y-2">
          <Button size="sm" className="h-8 text-[12px]" onClick={runValidation} disabled={validating}>
            {validating ? "Validating…" : validated ? "Revalidate connection" : "Validate connection"}
          </Button>
          {validating && <Progress value={60} className="h-1.5" />}
          {validated && (
            <ul className="space-y-0.5 text-[11.5px] text-emerald-700">
              {["Network connectivity confirmed", "TLS handshake succeeded", "Authentication accepted", "Permission scope matches request", "Metadata retrieval succeeded"].map((t) => (
                <li key={t}>✓ {t}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      title: "Review and register",
      description: "Confirm the connector definition before it is added to the fabric.",
      body: (
        <Summary rows={[
          ["Name", form.name], ["Platform", form.platform], ["Category", form.category],
          ["Environment", form.environment], ["Region", form.region], ["Residency", form.dataResidency],
          ["Business owner", form.owner], ["Technical owner", form.technicalOwner], ["Security owner", form.securityOwner],
          ["Authentication", form.authenticationMethod], ["Permission scope", form.permissionScope],
          ["Classification", form.accessClassification], ["Schedule", form.schedule],
          ["Freshness target", form.freshnessTarget], ["Alert profile", form.alertProfile],
        ]} />
      ),
    },
  ];

  const s = steps[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Add Connector</DialogTitle>
          <DialogDescription className="text-[12px]">Register a new source platform connector in the Enterprise Cognitive Fabric.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <StepHeader step={step} total={total + 1} title={s.title} description={s.description} />
          {s.body}
        </div>
        <DialogFooter className="gap-1.5">
          {step > 0 && <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step < total
            ? <Button size="sm" className="h-8 text-[12px]" disabled={!canContinue} onClick={() => setStep(step + 1)}>Continue</Button>
            : <Button size="sm" className="h-8 text-[12px]" onClick={submit}>Register connector</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- Reauthorize ------------------------------ */

export function ReauthorizeDialog({ connector, onOpenChange, onConfirm }: {
  connector: ConnectorHealthRecord | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [ack, setAck] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => { setStep(0); setAck(false); setRunning(false); }, [connector?.id]);
  if (!connector) return null;

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onConfirm(connector.id);
      onOpenChange(false);
      toast.success("Connector reauthorized", { description: `${connector.name} authentication restored. Queued work will resume on the next cycle.` });
    }, 1100);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Reauthorize {connector.name}</DialogTitle>
          <DialogDescription className="text-[12px]">Re-establish the authentication grant using the approved credential metadata.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {step === 0 && (
            <>
              <StepHeader step={0} total={3} title="Review current state" description="Confirm what is currently failing before reauthorizing." />
              <Summary rows={[
                ["Authentication method", connector.authenticationMethod],
                ["Authentication status", connector.authenticationStatus],
                ["Credential age", connector.credentialAge],
                ["Credential expiration", connector.credentialExpiration],
                ["Failed attempts", String(connector.failedAuthAttempts)],
                ["Affected sources", String(connector.sourceIds.length)],
              ]} />
            </>
          )}
          {step === 1 && (
            <>
              <StepHeader step={1} total={3} title="Confirm impact" description="Reauthorizing resumes evidence collection and re-queues held artifacts." />
              <ul className="list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-700">
                <li>{connector.sourceIds.length} registered sources resume discovery.</li>
                <li>{connector.artifactsInFlight.toLocaleString("en-US")} held artifacts re-enter the pipeline.</li>
                <li>Downstream evaluations refresh on the next scheduled run.</li>
                <li>No source content is modified by this action.</li>
              </ul>
              <label className="flex items-start gap-2 rounded-md border border-slate-200 p-2 text-[11.5px] text-slate-700">
                <Checkbox checked={ack} onCheckedChange={(v) => setAck(Boolean(v))} className="mt-0.5 h-3.5 w-3.5" />
                <span>I confirm the credential owner approved this reauthorization.</span>
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <StepHeader step={2} total={3} title="Reauthorizing" description="Exchanging the grant and validating permission scope." />
              <Progress value={running ? 70 : 100} className="h-2" />
            </>
          )}
        </div>
        <DialogFooter className="gap-1.5">
          {step > 0 && step < 2 && <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step === 0 && <Button size="sm" className="h-8 text-[12px]" onClick={() => setStep(1)}>Continue</Button>}
          {step === 1 && <Button size="sm" className="h-8 text-[12px]" disabled={!ack} onClick={() => { setStep(2); run(); }}>Reauthorize</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Rotate Credential ---------------------------- */

export function RotateCredentialDialog({ connector, onOpenChange, onConfirm }: {
  connector: ConnectorHealthRecord | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: string) => void;
}) {
  const [ack, setAck] = useState(false);
  useEffect(() => setAck(false), [connector?.id]);
  if (!connector) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Rotate simulated credential</DialogTitle>
          <DialogDescription className="text-[12px]">
            Simulated rotation for {connector.name}. No real secret is generated, displayed, or stored.
          </DialogDescription>
        </DialogHeader>
        <Summary rows={[
          ["Credential type", connector.credentialType],
          ["Current age", connector.credentialAge],
          ["Current expiration", connector.credentialExpiration],
          ["Last rotation", connector.lastCredentialRotation],
          ["Next scheduled rotation", connector.nextCredentialRotation],
          ["New expiration after rotation", "in 90 days"],
        ]} />
        <label className="flex items-start gap-2 rounded-md border border-slate-200 p-2 text-[11.5px] text-slate-700">
          <Checkbox checked={ack} onCheckedChange={(v) => setAck(Boolean(v))} className="mt-0.5 h-3.5 w-3.5" />
          <span>I understand this records a rotation event in the governance log and resets the credential age metadata.</span>
        </label>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!ack}
            onClick={() => {
              onConfirm(connector.id);
              onOpenChange(false);
              toast.success("Credential rotated", { description: `${connector.name} credential age reset. Next rotation scheduled in 90 days.` });
            }}
          >
            Rotate credential
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Pause / Resume ----------------------------- */

export function PauseResumeDialog({ connector, mode, onOpenChange, onConfirm }: {
  connector: ConnectorHealthRecord | null;
  mode: "Pause" | "Resume";
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: string, mode: "Pause" | "Resume") => void;
}) {
  if (!connector) return null;
  const pausing = mode === "Pause";
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{mode} {connector.name}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {pausing
              ? "Pausing stops new intake. Work already in flight drains before the connector goes idle."
              : "Resuming restarts intake and replays the held synchronization cursor."}
          </DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-0.5 pl-4 text-[11.5px] text-slate-700">
          <li>{connector.sourceIds.length} registered sources affected.</li>
          <li>{connector.artifactsInFlight.toLocaleString("en-US")} artifacts currently in flight.</li>
          <li>{pausing ? "Source freshness will begin to degrade after the freshness target elapses." : "Freshness recovers once the backlog clears."}</li>
          <li>{pausing ? "Open alerts remain visible while paused." : "Suppressed alerts are re-enabled."}</li>
        </ul>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]"
            onClick={() => {
              onConfirm(connector.id, mode);
              onOpenChange(false);
              toast.success(`Connector ${pausing ? "paused" : "resumed"}`, { description: `${connector.name} is now ${pausing ? "draining and paused" : "collecting evidence again"}.` });
            }}
          >
            {mode} connector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Create Incident ---------------------------- */

export function CreateIncidentDialog({ connector, onOpenChange, onCreate }: {
  connector: ConnectorHealthRecord | null;
  onOpenChange: (v: boolean) => void;
  onCreate: (payload: { connectorId: string; summary: string; severity: string; priority: string; resolverGroup: string; description: string }) => void;
}) {
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState("High");
  const [priority, setPriority] = useState("P2");
  const [group, setGroup] = useState("Platform Engineering");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!connector) return;
    setSummary(`${connector.name} — ${connector.healthSummary.split(".")[0]}`);
    setDescription(`${connector.name} (${connector.id}) is reporting ${connector.healthStatus.toLowerCase()} status. ${connector.businessImpact}`);
    setSeverity(connector.healthStatus === "Degraded" ? "Critical" : "High");
  }, [connector?.id]);

  if (!connector) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Create incident</DialogTitle>
          <DialogDescription className="text-[12px]">Raise a simulated incident record for {connector.name}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Field label="Summary"><Input value={summary} onChange={(e) => setSummary(e.target.value)} className="h-8 text-[12px]" /></Field>
          <Field label="Severity"><ChoiceGrid options={["Critical", "High", "Medium", "Low"]} value={severity} onChange={setSeverity} /></Field>
          <Field label="Priority"><ChoiceGrid options={["P1", "P2", "P3", "P4"]} value={priority} onChange={setPriority} /></Field>
          <Field label="Resolver group"><ChoiceGrid options={["Platform Engineering", "Information Security", "Knowledge Operations", "Integration Engineering"]} value={group} onChange={setGroup} cols={2} /></Field>
          <Field label="Description"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="text-[12px]" /></Field>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={summary.trim().length < 4}
            onClick={() => {
              onCreate({ connectorId: connector.id, summary, severity, priority, resolverGroup: group, description });
              onOpenChange(false);
            }}
          >
            Create incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- Bulk action ------------------------------ */

export function BulkActionDialog({ action, ids, onOpenChange, onConfirm }: {
  action: string | null;
  ids: string[];
  onOpenChange: (v: boolean) => void;
  onConfirm: (action: string, ids: string[]) => void;
}) {
  const [owner, setOwner] = useState("Knowledge Operations");
  if (!action) return null;
  const rows = ids.map((id) => connectorById[id]).filter(Boolean);
  const sources = rows.reduce((a, c) => a + c.sourceIds.length, 0);
  const personas = rows.reduce((a, c) => a + c.personaIds.length, 0);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{action}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Applies to {ids.length} selected connector{ids.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>
        <Summary rows={[
          ["Connectors", String(ids.length)],
          ["Sources affected", String(sources)],
          ["Personas affected", String(personas)],
          ["Reversible", action === "Pause" || action === "Resume" ? "Yes" : "Yes, no source content is modified"],
        ]} />
        {action === "Assign Owner" && (
          <Field label="New owner"><Input value={owner} onChange={(e) => setOwner(e.target.value)} className="h-8 text-[12px]" /></Field>
        )}
        <ul className="max-h-40 space-y-0.5 overflow-y-auto text-[11.5px] text-slate-700">
          {rows.map((c) => <li key={c.id}>{c.name} — {c.healthStatus}</li>)}
        </ul>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]"
            onClick={() => {
              onConfirm(action, ids);
              onOpenChange(false);
              toast.success(`${action} applied`, { description: `${ids.length} connector${ids.length === 1 ? "" : "s"} updated.` });
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Export --------------------------------- */

export function ExportDialog({ open, onOpenChange, rows, selectedIds }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: ConnectorHealthRecord[];
  selectedIds: string[];
}) {
  const [scope, setScope] = useState("Current view");
  const [format, setFormat] = useState("CSV");
  const [sections, setSections] = useState<string[]>(["Health", "Authentication", "Performance", "Dependencies"]);

  const data = scope === "Selected connectors" && selectedIds.length
    ? rows.filter((r) => selectedIds.includes(r.id))
    : scope === "All connectors" ? connectors : rows;

  const run = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "CSV") download(`connector-health-${stamp}.csv`, connectorsToCsv(data), "text/csv");
    else download(`connector-health-${stamp}.json`, JSON.stringify({ generated: stamp, sections, connectors: data }, null, 2), "application/json");
    onOpenChange(false);
    toast.success("Export ready", { description: `${data.length} connectors exported as ${format}.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Export connector health</DialogTitle>
          <DialogDescription className="text-[12px]">Generate a connector health report for governance and review.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Field label="Scope"><ChoiceGrid options={["Current view", "Selected connectors", "All connectors"]} value={scope} onChange={setScope} /></Field>
          <Field label="Format"><ChoiceGrid options={["CSV", "JSON"]} value={format} onChange={setFormat} cols={2} /></Field>
          <Field label="Sections"><MultiGrid options={["Health", "Authentication", "Authorization", "Performance", "Errors", "Dependencies"]} value={sections} onChange={setSections} /></Field>
          <p className="text-[11.5px] text-slate-600">{data.length} connector records will be included.</p>
        </div>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={run}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
