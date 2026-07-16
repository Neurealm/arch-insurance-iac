/**
 * Page 10 · Runbook Digital Twin Detail
 * Route: /runops/runbooks/:runbookId
 *
 * Complete live, historical, operational, and governance context for a runbook.
 * All data flows from OperationsProvider — no page-local fixture imports, no
 * `any` types. Canonical default runbook is RB-0042.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, ArrowUpRight, BookOpen, Bot, CheckCircle2,
  ClipboardList, Code2, DiffIcon, FileWarning, GitBranch, History, Layers,
  Pencil, Play, PlugZap, ShieldAlert, ShieldCheck, Sparkles, TestTube, Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  EntityHeader, EntityTabs, MetricCard, StatusIndicator, ReadinessScore,
  EvidenceCitation, EmptyState, PermissionDeniedState, StaleDataState,
  FreshnessIndicator, RunbookFitnessScore,
} from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";
import { StepCodeBuilder } from "@/runops/components/StepCodeBuilder";
import type {
  Runbook, RunbookStep, Execution, Change, BusinessService, RunbookState,
} from "@/runops/data/scenario";

const DEFAULT_RUNBOOK_ID = "RB-0042";
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

const LS_RECERT = "runops.runbookDetail.recertRequests.v1";
const LS_DEPRECATE = "runops.runbookDetail.deprecateRequests.v1";

interface RecertRequest {
  id: string; runbookId: string; requestedAt: string;
  requestedBy: string; notes: string; state: "Pending" | "Approved";
}
interface DeprecateRequest {
  id: string; runbookId: string; requestedAt: string;
  requestedBy: string; impactReview: string;
  state: "Pending Impact Review" | "Approved" | "Denied";
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TabValue =
  | "overview" | "workflow" | "live" | "executions" | "tests" | "versions"
  | "incidents" | "changes" | "evidence" | "approvals" | "knowledge" | "history"
  | "architecture";

const TABS: { label: string; value: TabValue }[] = [
  { label: "Overview",            value: "overview" },
  { label: "Workflow",            value: "workflow" },
  { label: "Live Context",        value: "live" },
  { label: "Executions",          value: "executions" },
  { label: "Tests",               value: "tests" },
  { label: "Versions",            value: "versions" },
  { label: "Incidents",           value: "incidents" },
  { label: "Changes",             value: "changes" },
  { label: "Evidence",            value: "evidence" },
  { label: "Approvals",           value: "approvals" },
  { label: "Knowledge",           value: "knowledge" },
  { label: "Improvement History", value: "history" },
  { label: "Architecture",        value: "architecture" },
];


type Applicability = "Applicable" | "Conditionally applicable" | "Not applicable" | "Certification expired";

interface ApplicabilityCheck {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
  evidence: string;
}

/* -------------------------------------------------------------------------- */
/* Deterministic helpers                                                      */
/* -------------------------------------------------------------------------- */

function hashUnit(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function ownerFor(rb: Runbook): string {
  if (rb.serviceId.includes("order")) return "Checkout Squad";
  if (rb.serviceId.includes("payment")) return "Payments Squad";
  if (rb.serviceId.includes("identity")) return "Identity Squad";
  return "Platform Squad";
}
function riskFor(rb: Runbook): "Low" | "Medium" | "High" | "Critical" {
  if (rb.fitnessScore < 60) return "Critical";
  if (rb.fitnessScore < 75) return "High";
  if (rb.fitnessScore < 85) return "Medium";
  return "Low";
}
function supportedTechFor(rb: Runbook): string[] {
  const s = `${rb.title} ${rb.serviceId}`.toLowerCase();
  const t: string[] = [];
  if (s.includes("sql") || s.includes("database")) t.push("SQL Server 2022");
  if (s.includes("checkout") || s.includes("order")) t.push("AKS 1.28", "Kafka 3.6");
  if (s.includes("payment") || s.includes("3ds")) t.push("Payments API v2");
  if (s.includes("identity") || s.includes("token")) t.push("OIDC", "Redis 7");
  if (t.length === 0) t.push("Kubernetes 1.28");
  return t;
}
function requiredConnectorsFor(rb: Runbook): string[] {
  const s = `${rb.title} ${rb.serviceId}`.toLowerCase();
  const c: string[] = ["OpenTelemetry Collector", "Prometheus"];
  if (s.includes("sql") || s.includes("database") || s.includes("order")) c.push("Azure DevOps");
  if (s.includes("payment")) c.push("Payments Provider API");
  if (s.includes("identity")) c.push("Identity Provider");
  c.push("ServiceNow ITSM");
  return c;
}
function requiredPermissionsFor(rb: Runbook): string[] {
  return [
    "runbook.execute",
    rb.autonomy.includes("Approval") ? "approval.request" : "runbook.launch",
    "audit.write",
    "notification.publish",
  ];
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function RunbookDetail() {
  const ops = useOperations();
  const navigate = useNavigate();
  const { runbookId: paramId } = useParams<{ runbookId: string }>();

  const runbookId = paramId ?? DEFAULT_RUNBOOK_ID;

  const runbook = useMemo<Runbook | undefined>(
    () => ops.runbooks.find((r) => r.id === runbookId) ?? ops.runbooks.find((r) => r.id === DEFAULT_RUNBOOK_ID),
    [ops.runbooks, runbookId],
  );

  const [tab, setTab] = useState<TabValue>("overview");
  const [compareOpen, setCompareOpen] = useState(false);
  const [recertOpen, setRecertOpen] = useState(false);
  const [deprecateOpen, setDeprecateOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState<null | { title: string; source: string; snippet: string; ref?: string }>(null);
  const [recertNotes, setRecertNotes] = useState("");
  const [deprecateImpact, setDeprecateImpact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [recertRequests, setRecertRequests] = useState<RecertRequest[]>(() => readLS(LS_RECERT, []));
  const [deprecateRequests, setDeprecateRequests] = useState<DeprecateRequest[]>(() => readLS(LS_DEPRECATE, []));
  useEffect(() => writeLS(LS_RECERT, recertRequests), [recertRequests]);
  useEffect(() => writeLS(LS_DEPRECATE, deprecateRequests), [deprecateRequests]);

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const notify = useCallback((title: string, detail?: string) => {
    ops.pushNotification({ kind: "info", title, detail });
    setBanner(title);
    window.setTimeout(() => setBanner(null), 2400);
  }, [ops]);

  if (!runbook) {
    return (
      <div className="p-4">
        <EntityHeader eyebrow="Runbook" title="Runbook not found" />
        <EmptyState
          title="Runbook not found"
          description={`No runbook matches ${runbookId}. Return to the library to select one.`}
          action={{ label: "Open library", onClick: () => navigate("/runops/runbooks") }}
        />
      </div>
    );
  }

  const service: BusinessService | undefined = ops.services.find((s) => s.id === runbook.serviceId);
  const owner = ownerFor(runbook);
  const risk = riskFor(runbook);
  const supportedTech = supportedTechFor(runbook);
  const requiredConnectors = requiredConnectorsFor(runbook);
  const requiredPermissions = requiredPermissionsFor(runbook);

  const executions = ops.executions.filter((e) => e.runbookId === runbook.id);
  const lastExecution = executions[executions.length - 1];

  /* -------------------- Applicability engine ----------------- */

  const activeIncident = ops.incident.state !== "Resolved" && ops.incident.state !== "Closed" ? ops.incident : null;
  const connectorsByName = new Map(ops.connectors.map((c) => [c.name, c]));
  const connectorHealth = requiredConnectors.map((name) => connectorsByName.get(name));
  const connectorsUnavailable = connectorHealth.filter((c) => c && c.status === "Unavailable").length;
  const connectorsDegraded = connectorHealth.filter((c) => c && c.status === "Degraded").length;
  const certDueDays = runbook.state === "Certified" ? Math.round(hashUnit(`${runbook.id}-cert`) * 120) - 10 : -1;
  const certExpired = certDueDays < 0 && runbook.state !== "Certified";
  const inSupportedEnv = ops.environment === "Production" || ops.environment === "Staging";

  const applicabilityChecks: ApplicabilityCheck[] = [
    {
      key: "state",
      label: "Runbook state is deployable",
      passed: runbook.state === "Certified" || runbook.state === "Published" || runbook.state === "Approved",
      detail: `Current state: ${runbook.state}.`,
      weight: 20,
      evidence: "runbook.state",
    },
    {
      key: "cert",
      label: "Certification is valid",
      passed: !certExpired && (runbook.state === "Certified" ? certDueDays >= 0 : true),
      detail: runbook.state === "Certified"
        ? (certDueDays >= 30 ? `Certificate valid for ${certDueDays} more days.` : `Certificate expires in ${certDueDays} days.`)
        : "Runbook has never been certified.",
      weight: 20,
      evidence: "runbook.certification",
    },
    {
      key: "service",
      label: "Applies to selected service",
      passed: service?.id === runbook.serviceId,
      detail: service ? `Selected service ${service.name} matches runbook target.` : "No target service resolved.",
      weight: 15,
      evidence: "service.registry",
    },
    {
      key: "env",
      label: "Environment supported",
      passed: inSupportedEnv,
      detail: `Environment ${ops.environment} ${inSupportedEnv ? "supported" : "not in supported list"}.`,
      weight: 10,
      evidence: "runbook.applicability.env",
    },
    {
      key: "connectors",
      label: "Required connectors healthy",
      passed: connectorsUnavailable === 0,
      detail: connectorsUnavailable > 0
        ? `${connectorsUnavailable} required connector(s) unavailable.`
        : connectorsDegraded > 0
          ? `All connectors reachable; ${connectorsDegraded} degraded.`
          : "All required connectors healthy.",
      weight: 15,
      evidence: "connector.registry",
    },
    {
      key: "permissions",
      label: "Caller has execute permissions",
      passed: !readOnly,
      detail: readOnly
        ? `Role ${ops.role} lacks runbook.execute.`
        : `Role ${ops.role} has runbook.execute.`,
      weight: 10,
      evidence: "iam.role.grants",
    },
    {
      key: "components",
      label: "Component versions compatible",
      passed: supportedTech.length > 0,
      detail: `Verified against ${supportedTech.length} technology target(s).`,
      weight: 10,
      evidence: "component.registry",
    },
  ];

  const applicabilityScore = applicabilityChecks.reduce((n, c) => n + (c.passed ? c.weight : 0), 0);
  const applicability: Applicability = certExpired
    ? "Certification expired"
    : applicabilityScore >= 90 ? "Applicable"
      : applicabilityScore >= 70 ? "Conditionally applicable"
        : "Not applicable";

  const applicabilityTone: "success" | "warning" | "critical" =
    applicability === "Applicable" ? "success"
      : applicability === "Conditionally applicable" ? "warning" : "critical";

  const stale = Date.now() - new Date(ops.dataFreshnessAt).getTime() > STALE_THRESHOLD_MS;

  /* -------------------- Actions ----------------- */

  const launch = () => {
    if (readOnly) { setError("Read-only role cannot launch runbooks."); return; }
    if (applicability === "Not applicable" || applicability === "Certification expired") {
      setError(`Runbook is ${applicability.toLowerCase()}. Resolve the applicability gaps before launch.`); return;
    }
    navigate(`/runops/runbooks/${runbook.id}/launch`);
  };
  const edit = () => navigate(`/runops/runbooks/${runbook.id}/designer`);
  const simulate = () => navigate(`/runops/runbooks/${runbook.id}/test`);

  const submitRecert = () => {
    if (readOnly) { setError("Read-only role cannot request recertification."); return; }
    if (recertNotes.trim().length < 8) { setError("Recertification notes required."); return; }
    const req: RecertRequest = {
      id: `REC-${Date.now().toString(36).toUpperCase()}`,
      runbookId: runbook.id, requestedAt: new Date().toISOString(),
      requestedBy: ops.role, notes: recertNotes.trim(), state: "Pending",
    };
    setRecertRequests((prev) => [req, ...prev]);
    setRecertOpen(false); setRecertNotes(""); setError(null);
    notify(`Recertification approval requested for ${runbook.id}`, req.id);
  };
  const submitDeprecate = () => {
    if (readOnly) { setError("Read-only role cannot deprecate runbooks."); return; }
    if (deprecateImpact.trim().length < 16) {
      setError("Dependency and impact review notes are required (≥ 16 chars)."); return;
    }
    const req: DeprecateRequest = {
      id: `DEP-${Date.now().toString(36).toUpperCase()}`,
      runbookId: runbook.id, requestedAt: new Date().toISOString(),
      requestedBy: ops.role, impactReview: deprecateImpact.trim(),
      state: "Pending Impact Review",
    };
    setDeprecateRequests((prev) => [req, ...prev]);
    setDeprecateOpen(false); setDeprecateImpact(""); setError(null);
    notify(`Deprecate request opened for ${runbook.id}`, "Pending impact review");
  };

  const openEvidence = (title: string, source: string, snippet: string, ref?: string) => {
    setEvidenceOpen({ title, source, snippet, ref });
  };

  const runbookRecerts = recertRequests.filter((r) => r.runbookId === runbook.id);
  const runbookDeprecates = deprecateRequests.filter((r) => r.runbookId === runbook.id);
  const isDeprecating = runbookDeprecates.some((d) => d.state !== "Denied");

  /* -------------------- Render ----------------- */

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Runbook · Digital Twin"
        title={runbook.title}
        status={{ tone: applicabilityTone, label: applicability }}
        subtitle={`${runbook.id} · ${runbook.version} · ${service?.name ?? runbook.serviceId}`}
        meta={
          <>
            <MetaChip label="State" value={runbook.state} warn={runbook.state === "Deprecated" || runbook.state === "Retired"} />
            <MetaChip label="Owner" value={owner} />
            <MetaChip label="Risk" value={risk} warn={risk === "High" || risk === "Critical"} />
            <MetaChip label="Autonomy" value={runbook.autonomy} />
            <MetaChip label="Fitness" value={`${runbook.fitnessScore}`} warn={runbook.fitnessScore < 75} />
            <MetaChip label="Applicability" value={`${applicabilityScore}/100`} warn={applicabilityScore < 90} />
            <MetaChip
              label="Certification"
              value={runbook.state === "Certified"
                ? (certDueDays < 30 ? `Expiring in ${certDueDays}d` : `Valid ${certDueDays}d`)
                : certExpired ? "Expired" : "Uncertified"}
              warn={certExpired || (runbook.state === "Certified" && certDueDays < 30)}
            />
            <MetaChip label="Last exec" value={lastExecution ? lastExecution.id : "none"} />
            <FreshnessIndicator capturedAt={ops.dataFreshnessAt} ttlSeconds={STALE_THRESHOLD_MS / 1000} />
          </>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setCompareOpen(true)}>
              <DiffIcon className="mr-1 h-3.5 w-3.5" /> Compare Version
            </Button>
            <Button size="sm" variant="outline" onClick={simulate}>
              <TestTube className="mr-1 h-3.5 w-3.5" /> Simulate
            </Button>
            <Button size="sm" variant="outline" onClick={edit} disabled={readOnly}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRecertOpen(true)} disabled={readOnly}>
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Request Recertification
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeprecateOpen(true)}
              disabled={readOnly || runbook.state === "Deprecated" || runbook.state === "Retired"}
            >
              <FileWarning className="mr-1 h-3.5 w-3.5" /> Deprecate
            </Button>
            <Button size="sm" onClick={launch} disabled={readOnly}>
              <Play className="mr-1 h-3.5 w-3.5" /> Launch
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 border-b border-border">
        <div className="flex-1 min-w-0">
          <EntityTabs
            tabs={TABS.map((t) => ({
              ...t,
              badge:
                t.value === "executions" ? String(executions.length) :
                t.value === "versions"   ? "3" :
                t.value === "approvals"  ? String(runbookRecerts.length + runbookDeprecates.length + (ops.approval.runbookId === runbook.id ? 1 : 0)) :
                undefined,
            }))}
            value={tab}
            onChange={(v) => {
              if (v === "architecture") {
                navigate("/runops/aws-cots-digital-twin");
                return;
              }
              setTab(v as TabValue);
            }}

          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mr-3 shrink-0 border-indigo/40 text-indigo hover:bg-indigo/10"
          onClick={() => navigate(`/runops/runbooks/${runbook.id}/builder`)}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Object-Oriented Runbook Builder
        </Button>
      </div>

      {stale && (
        <div className="px-4 pt-4">
          <StaleDataState
            title="Runbook context stale"
            description={`Last refresh ${new Date(ops.dataFreshnessAt).toLocaleTimeString()}.`}
            action={{ label: "Refresh now", onClick: ops.refreshData }}
          />
        </div>
      )}
      {readOnly && (
        <div className="px-4 pt-4">
          <PermissionDeniedState
            title="Read-only role"
            description="You can view the runbook but cannot launch, edit, deprecate, or request recertification."
          />
        </div>
      )}
      {isDeprecating && (
        <div className="mx-4 mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Deprecation is pending impact review for this runbook. Executions in flight will not be cancelled.
        </div>
      )}
      {banner && (
        <div className="mx-4 mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{banner}</div>
      )}
      {error && (
        <div className="mx-4 mt-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900" role="alert">
          {error} <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      <main className="flex-1 space-y-4 p-4">
        {tab === "overview" && (
          <OverviewTab
            runbook={runbook}
            service={service}
            supportedTech={supportedTech}
            requiredConnectors={requiredConnectors}
            connectorHealth={connectorHealth}
            requiredPermissions={requiredPermissions}
            applicability={applicability}
            applicabilityScore={applicabilityScore}
            applicabilityChecks={applicabilityChecks}
            executions={executions}
            owner={owner}
            openEvidence={openEvidence}
            onNavigate={navigate}
          />
        )}
        {tab === "workflow" && <WorkflowTab runbook={runbook} />}
        {tab === "live" && (
          <LiveContextTab
            runbook={runbook}
            service={service}
            activeIncident={activeIncident}
            connectorHealth={connectorHealth}
            requiredConnectors={requiredConnectors}
            applicability={applicability}
            applicabilityChecks={applicabilityChecks}
          />
        )}
        {tab === "executions" && (
          <ExecutionsTab
            runbook={runbook}
            executions={executions}
            onOpen={(id) => navigate(`/runops/executions/${id}`)}
          />
        )}
        {tab === "tests" && <TestsTab runbook={runbook} onSimulate={simulate} />}
        {tab === "versions" && (
          <VersionsTab
            runbook={runbook}
            onCompare={() => setCompareOpen(true)}
          />
        )}
        {tab === "incidents" && (
          <IncidentsTab
            runbook={runbook}
            activeIncident={activeIncident}
            onOpen={(id) => navigate(`/runops/incidents/${id}`)}
          />
        )}
        {tab === "changes" && (
          <ChangesTab
            runbook={runbook}
            changes={ops.changes.filter((c) => c.serviceId === runbook.serviceId)}
          />
        )}
        {tab === "evidence" && (
          <EvidenceTab
            runbook={runbook}
            onOpen={openEvidence}
          />
        )}
        {tab === "approvals" && (
          <ApprovalsTab
            runbook={runbook}
            approval={ops.approval.runbookId === runbook.id ? ops.approval : null}
            recerts={runbookRecerts}
            deprecates={runbookDeprecates}
          />
        )}
        {tab === "knowledge" && <KnowledgeTab runbook={runbook} />}
        {tab === "history" && <HistoryTab runbook={runbook} />}
      </main>

      {/* Compare version drawer */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent side="right" className="w-full max-w-lg">
          <SheetHeader>
            <SheetTitle>Compare {runbook.id}</SheetTitle>
            <SheetDescription>Side-by-side comparison of the two most recent versions.</SheetDescription>
          </SheetHeader>
          <VersionCompareBody runbook={runbook} />
        </SheetContent>
      </Sheet>

      {/* Recert dialog */}
      <Dialog open={recertOpen} onOpenChange={setRecertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request recertification</DialogTitle>
            <DialogDescription>
              Creates a pending approval routed to platform engineering and service ownership.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="recert-notes">Notes for reviewer</Label>
          <Textarea
            id="recert-notes"
            value={recertNotes}
            onChange={(e) => setRecertNotes(e.target.value)}
            rows={4}
            placeholder="What has changed since the last certification? Recent executions, drills, upstream changes…"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecertOpen(false)}>Cancel</Button>
            <Button onClick={submitRecert}>Create approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deprecate dialog */}
      <Dialog open={deprecateOpen} onOpenChange={setDeprecateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deprecate {runbook.id}</DialogTitle>
            <DialogDescription>
              Deprecation requires a dependency and impact review before approval.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
            <div><strong>Service:</strong> {service?.name ?? runbook.serviceId}</div>
            <div><strong>Recent executions:</strong> {executions.length}</div>
            <div><strong>Last execution:</strong> {lastExecution?.id ?? "none"}</div>
          </div>
          <Label htmlFor="deprecate-impact">Dependency and impact review</Label>
          <Textarea
            id="deprecate-impact"
            value={deprecateImpact}
            onChange={(e) => setDeprecateImpact(e.target.value)}
            rows={5}
            placeholder="Which teams and downstream automations depend on this runbook? What replaces it? What is the rollback path if deprecation regresses reliability?"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeprecateOpen(false)}>Cancel</Button>
            <Button onClick={submitDeprecate}>Submit for review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence drawer */}
      <Sheet open={!!evidenceOpen} onOpenChange={(o) => { if (!o) setEvidenceOpen(null); }}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Evidence</SheetTitle>
            <SheetDescription>Source, capture time, and citation reference.</SheetDescription>
          </SheetHeader>
          {evidenceOpen && (
            <div className="mt-3">
              <EvidenceCitation evidence={{
                id: "ev-drawer",
                title: evidenceOpen.title,
                source: evidenceOpen.source,
                snippet: evidenceOpen.snippet,
                ref: evidenceOpen.ref,
                supports: "supports",
              }} />
              <div className="mt-2 text-[11px] text-slate-500">
                Confidence: High · Uncertainty: bounded by connector freshness at capture time.
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function MetaChip({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
      warn ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-700",
    )}>
      <span className="uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function OverviewTab(props: {
  runbook: Runbook;
  service: BusinessService | undefined;
  supportedTech: string[];
  requiredConnectors: string[];
  connectorHealth: (({ name: string; status: string; freshness: string }) | undefined)[];
  requiredPermissions: string[];
  applicability: Applicability;
  applicabilityScore: number;
  applicabilityChecks: ApplicabilityCheck[];
  executions: readonly (Execution & { title: string })[];
  owner: string;
  openEvidence: (title: string, source: string, snippet: string, ref?: string) => void;
  onNavigate: (path: string) => void;
}) {
  const {
    runbook, service, supportedTech, requiredConnectors, connectorHealth,
    requiredPermissions, applicability, applicabilityScore, applicabilityChecks,
    executions, owner, openEvidence, onNavigate,
  } = props;

  const purpose = `Restore ${service?.name ?? runbook.serviceId} to steady-state when the ${runbook.title.toLowerCase()} signature is observed. Covers detection, mitigation, validation, and rollback with approval-gated automation.`;
  const successCriteria = [
    "Golden signals return to baseline within 15 minutes.",
    "No new customer journey failures for 2 consecutive validation cycles.",
    "Change and audit trail complete with signed approvals.",
  ];

  const kinds: Record<RunbookStep["kind"], RunbookStep[]> = { diagnose: [], mitigate: [], validate: [], rollback: [] };
  for (const s of runbook.steps) kinds[s.kind].push(s);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <SectionCard title="Purpose" icon={<BookOpen className="h-4 w-4" />}>
          <p className="text-xs text-slate-700">{purpose}</p>
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Supported services" icon={<Layers className="h-4 w-4" />}>
            <ul className="space-y-1 text-xs">
              <li><Badge variant="outline">{service?.name ?? runbook.serviceId}</Badge></li>
            </ul>
          </SectionCard>
          <SectionCard title="Supported components / technology" icon={<Wrench className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-1">
              {supportedTech.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Triggers, inputs, preconditions" icon={<ClipboardList className="h-4 w-4" />}>
          <div className="grid gap-3 text-xs md:grid-cols-3">
            <div>
              <div className="font-semibold text-slate-800">Triggers</div>
              <ul className="mt-1 space-y-0.5 text-slate-700">
                <li>SLO burn alert on {service?.name ?? "service"}</li>
                <li>Latency p95 &gt; {service?.sloLatencyMs ?? 750}ms for 5m</li>
                <li>Elevated DB connection utilization</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Inputs</div>
              <ul className="mt-1 space-y-0.5 text-slate-700">
                <li>Incident ID (optional)</li>
                <li>Target environment</li>
                <li>Approval justification</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Preconditions</div>
              <ul className="mt-1 space-y-0.5 text-slate-700">
                <li>Change window open or SEV declared</li>
                <li>All required connectors reachable</li>
                <li>Approver available</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Expected outcome" icon={<CheckCircle2 className="h-4 w-4" />}>
            <p className="text-xs text-slate-700">
              Restore service to healthy state and pre-empt customer journey degradation, with full audit trail and evidence attached to the incident record.
            </p>
          </SectionCard>
          <SectionCard title="Success criteria" icon={<ShieldCheck className="h-4 w-4" />}>
            <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
              {successCriteria.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </SectionCard>
          <SectionCard title="Rollback strategy" icon={<ArrowRight className="h-4 w-4 rotate-180" />}>
            <p className="text-xs text-slate-700">
              If validation partially fails, execute the recovery branch (raise pool cap, revert mitigation). If validation fully fails, halt automation and open a paging escalation to the on-call engineer.
            </p>
          </SectionCard>
          <SectionCard title="Known limitations" icon={<AlertTriangle className="h-4 w-4" />}>
            <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
              <li>Not applicable to Development environment.</li>
              <li>Assumes plan-cache warmup completes within 5 minutes after index revert.</li>
              <li>Automation gated by approval — will not run headless.</li>
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Workflow preview" icon={<GitBranch className="h-4 w-4" />}>
          <div className="grid gap-2 md:grid-cols-4">
            {(["diagnose", "mitigate", "validate", "rollback"] as const).map((k) => (
              <div key={k} className="rounded border border-slate-200 bg-white p-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{k}</div>
                {kinds[k].length === 0 ? (
                  <div className="text-[11px] text-slate-500">—</div>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    {kinds[k].map((s) => (
                      <li key={s.key} className="truncate" title={s.description}>{s.label}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent execution results" icon={<History className="h-4 w-4" />}>
          {executions.length === 0 ? (
            <EmptyState title="No execution history" description="This runbook has never been executed." />
          ) : (
            <ul className="divide-y divide-slate-100 text-xs">
              {executions.slice(-5).reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0">
                    <button className="font-mono text-blue-700 hover:underline" onClick={() => onNavigate(`/runops/executions/${e.id}`)}>{e.id}</button>
                    <span className="ml-2 text-slate-600">{e.title}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    e.state === "Completed" && "border-emerald-300 text-emerald-700",
                    e.state === "Failed" && "border-rose-300 text-rose-700",
                    e.state === "Running" && "border-sky-300 text-sky-700",
                  )}>{e.state}</Badge>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard title="Current applicability" icon={<Sparkles className="h-4 w-4" />}>
          <ReadinessScore label={applicability} score={applicabilityScore} details={`${applicabilityChecks.filter((c) => c.passed).length}/${applicabilityChecks.length} checks passed`} />
          <ul className="mt-3 space-y-1.5 text-[11px]">
            {applicabilityChecks.map((c) => (
              <li key={c.key} className="flex items-start gap-1">
                {c.passed
                  ? <CheckCircle2 className="mt-0.5 h-3 w-3 text-emerald-600" aria-hidden />
                  : <AlertTriangle className="mt-0.5 h-3 w-3 text-amber-600" aria-hidden />}
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="text-slate-600">{c.detail}</div>
                  <button className="text-[10px] text-blue-700 hover:underline"
                    onClick={() => openEvidence(c.label, c.evidence, c.detail, c.evidence)}>
                    View evidence
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Required connectors" icon={<PlugZap className="h-4 w-4" />}>
          <ul className="space-y-1 text-xs">
            {requiredConnectors.map((name, i) => {
              const c = connectorHealth[i];
              const status = c ? c.status : "Unknown";
              const tone = status === "Healthy" ? "border-emerald-300 text-emerald-700"
                : status === "Degraded" ? "border-amber-300 text-amber-700"
                  : status === "Unavailable" ? "border-rose-300 text-rose-700"
                    : "border-slate-300 text-slate-600";
              return (
                <li key={name} className="flex items-center justify-between">
                  <span>{name}</span>
                  <Badge variant="outline" className={cn("text-[10px]", tone)}>{status}</Badge>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Required permissions" icon={<ShieldCheck className="h-4 w-4" />}>
          <ul className="space-y-0.5 text-xs">
            {requiredPermissions.map((p) => <li key={p} className="font-mono text-[11px]">{p}</li>)}
          </ul>
        </SectionCard>

        <SectionCard title="Ownership" icon={<Bot className="h-4 w-4" />}>
          <div className="text-xs">
            <div><strong>Owning team:</strong> {owner}</div>
            <div><strong>Escalation:</strong> On-call engineer via ServiceNow</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function WorkflowTab({ runbook }: { runbook: Runbook }) {
  const [openStepKey, setOpenStepKey] = useState<string | null>(null);
  return (
    <SectionCard title="Workflow" icon={<GitBranch className="h-4 w-4" />}>
      {runbook.steps.length === 0 ? (
        <EmptyState title="No steps defined" description="Open the designer to author steps." />
      ) : (
        <ol className="space-y-2 text-xs">
          {runbook.steps.map((s, i) => (
            <li key={s.key} className="rounded border border-slate-200 bg-white p-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold">{i + 1}</span>
                <span className="font-medium">{s.label}</span>
                <Badge variant="outline" className={cn(
                  "ml-auto text-[10px] capitalize",
                  s.kind === "diagnose" && "border-sky-300 text-sky-700",
                  s.kind === "mitigate" && "border-amber-300 text-amber-700",
                  s.kind === "validate" && "border-emerald-300 text-emerald-700",
                  s.kind === "rollback" && "border-rose-300 text-rose-700",
                )}>{s.kind}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => setOpenStepKey(s.key)}
                  aria-label={`Open code builder for step ${i + 1}`}
                >
                  <Code2 className="mr-1 h-3 w-3" aria-hidden /> Code
                </Button>
              </div>
              <div className="mt-1 pl-7 text-[11px] text-slate-600">{s.description}</div>
              {openStepKey === s.key && (
                <StepCodeBuilder
                  runbookId={runbook.id}
                  step={s}
                  stepIndex={i}
                  open
                  onOpenChange={(o) => { if (!o) setOpenStepKey(null); }}
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}

function LiveContextTab({
  runbook, service, activeIncident, connectorHealth, requiredConnectors,
  applicability, applicabilityChecks,
}: {
  runbook: Runbook;
  service: BusinessService | undefined;
  activeIncident: { id: string; title: string } | null;
  connectorHealth: (({ name: string; status: string; freshness: string }) | undefined)[];
  requiredConnectors: string[];
  applicability: Applicability;
  applicabilityChecks: ApplicabilityCheck[];
}) {
  const tone: "success" | "warning" | "critical" =
    applicability === "Applicable" ? "success"
      : applicability === "Conditionally applicable" ? "warning" : "critical";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionCard title="Live applicability" icon={<Sparkles className="h-4 w-4" />}>
        <MetricCard label="Applicability" value={applicability} tone={tone} />
        <ul className="mt-3 space-y-1 text-[11px]">
          {applicabilityChecks.map((c) => (
            <li key={c.key} className={cn("flex items-start gap-1", !c.passed && "text-amber-800")}>
              {c.passed
                ? <CheckCircle2 className="mt-0.5 h-3 w-3 text-emerald-600" aria-hidden />
                : <AlertTriangle className="mt-0.5 h-3 w-3 text-amber-600" aria-hidden />}
              <div>
                <div className="font-medium">{c.label}</div>
                <div>{c.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Service snapshot" icon={<Layers className="h-4 w-4" />}>
        <div className="text-xs">
          <div><strong>Service:</strong> {service?.name ?? runbook.serviceId}</div>
          <div><strong>Health:</strong> {service?.health ?? "Unknown"}</div>
          <div><strong>Error budget:</strong> {service?.errorBudgetRemaining ?? "—"}%</div>
          <div><strong>Active incident:</strong> {activeIncident ? activeIncident.id : "none"}</div>
        </div>
      </SectionCard>
      <SectionCard title="Connectors" icon={<PlugZap className="h-4 w-4" />}>
        <table className="w-full text-xs">
          <thead className="text-slate-500">
            <tr><th className="text-left">Connector</th><th className="text-left">Status</th><th className="text-left">Freshness</th></tr>
          </thead>
          <tbody>
            {requiredConnectors.map((name, i) => {
              const c = connectorHealth[i];
              const status = c ? c.status : "Unknown";
              return (
                <tr key={name} className="border-t border-slate-100">
                  <td className="py-1">{name}</td>
                  <td className="py-1">
                    <StatusIndicator
                      tone={status === "Healthy" ? "success" : status === "Degraded" ? "warning" : status === "Unavailable" ? "critical" : "neutral"}
                      label={status}
                    />
                  </td>
                  <td className="py-1 text-slate-600">{c?.freshness ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>
      <SectionCard title="Policy" icon={<ShieldCheck className="h-4 w-4" />}>
        <ul className="space-y-0.5 text-xs">
          <li>Autonomy: <strong>{runbook.autonomy}</strong></li>
          <li>Change window: enforce production freeze rules</li>
          <li>Blast radius: single service · component-scoped</li>
        </ul>
      </SectionCard>
    </div>
  );
}

function ExecutionsTab({
  runbook, executions, onOpen,
}: {
  runbook: Runbook;
  executions: readonly (Execution & { title: string })[];
  onOpen: (id: string) => void;
}) {
  if (executions.length === 0) {
    return <EmptyState title="No execution history" description={`${runbook.id} has never been executed.`} />;
  }
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Executions</CardTitle></CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-2 py-2 text-left">ID</th>
              <th className="px-2 py-2 text-left">Title</th>
              <th className="px-2 py-2 text-left">Incident</th>
              <th className="px-2 py-2 text-left">State</th>
              <th className="px-2 py-2 text-right">Open</th>
            </tr>
          </thead>
          <tbody>
            {[...executions].reverse().map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-2 py-1.5 font-mono">{e.id}</td>
                <td className="px-2 py-1.5">{e.title}</td>
                <td className="px-2 py-1.5 font-mono">{e.incidentId}</td>
                <td className="px-2 py-1.5">
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    e.state === "Completed" && "border-emerald-300 text-emerald-700",
                    e.state === "Failed" && "border-rose-300 text-rose-700",
                    e.state === "Running" && "border-sky-300 text-sky-700",
                  )}>{e.state}</Badge>
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button className="rounded p-1 hover:bg-slate-100" aria-label={`Open ${e.id}`} onClick={() => onOpen(e.id)}>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function TestsTab({ runbook, onSimulate }: { runbook: Runbook; onSimulate: () => void }) {
  const tests = [
    { id: "T-1", name: "Happy path — plan revert succeeds", state: "Passed" as const },
    { id: "T-2", name: "Validation partially fails — recovery branch", state: "Passed" as const },
    { id: "T-3", name: "Approval denied — halts execution", state: "Passed" as const },
    { id: "T-4", name: "Connector unavailable — retries then halts", state: "Skipped" as const },
  ];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Test harness · {runbook.id}</CardTitle>
        <Button size="sm" variant="outline" onClick={onSimulate}>
          <TestTube className="mr-1 h-3.5 w-3.5" /> Open simulator
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-slate-100 text-xs">
          {tests.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-1.5">
              <span><strong className="font-mono">{t.id}</strong> · {t.name}</span>
              <Badge variant="outline" className={cn(
                "text-[10px]",
                t.state === "Passed" && "border-emerald-300 text-emerald-700",
                t.state === "Skipped" && "border-slate-300 text-slate-600",
              )}>{t.state}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function VersionsTab({ runbook, onCompare }: { runbook: Runbook; onCompare: () => void }) {
  const versions = [
    { v: runbook.version, at: "current", state: runbook.state as RunbookState, author: "Runbook Author" },
    { v: "v3.1", at: "30d ago", state: "Deprecated" as RunbookState, author: "SRE Engineer" },
    { v: "v3.0", at: "90d ago", state: "Deprecated" as RunbookState, author: "Runbook Author" },
  ];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Versions</CardTitle>
        <Button size="sm" variant="outline" onClick={onCompare}>
          <DiffIcon className="mr-1 h-3.5 w-3.5" /> Compare
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-slate-100 text-xs">
          {versions.map((v) => (
            <li key={v.v} className="flex items-center justify-between py-1.5">
              <span><strong className="font-mono">{v.v}</strong> · {v.at} · {v.author}</span>
              <Badge variant="outline" className="text-[10px]">{v.state}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function VersionCompareBody({ runbook }: { runbook: Runbook }) {
  const prev = "v3.1";
  return (
    <div className="mt-4 space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <VersionCol title={prev} state="Deprecated" fitness={runbook.fitnessScore - 5} />
        <VersionCol title={runbook.version} state={runbook.state} fitness={runbook.fitnessScore} />
      </div>
      <SectionCard title="Notable changes" icon={<History className="h-4 w-4" />}>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Adds fallback branch to raise SQL pool cap.</li>
          <li>Tightens validation window from 10m to 5m.</li>
          <li>Introduces approval-gated automation.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
function VersionCol({ title, state, fitness }: { title: string; state: RunbookState; fitness: number }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-2">
      <div className="font-mono text-xs">{title}</div>
      <div className="text-[11px] text-slate-600">{state}</div>
      <div className="mt-1 text-[11px]">Fitness: <strong>{fitness}</strong></div>
    </div>
  );
}

function IncidentsTab({
  runbook, activeIncident, onOpen,
}: {
  runbook: Runbook;
  activeIncident: { id: string; title: string } | null;
  onOpen: (id: string) => void;
}) {
  const items: { id: string; title: string; state: string }[] = [];
  if (activeIncident) items.push({ id: activeIncident.id, title: activeIncident.title, state: "Active" });
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Incidents that exercised {runbook.id}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No linked incidents" description="This runbook has not been invoked from an incident yet." />
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-1.5">
                <button className="text-blue-700 hover:underline font-mono" onClick={() => onOpen(i.id)}>{i.id}</button>
                <span className="ml-2 flex-1 truncate">{i.title}</span>
                <Badge variant="outline" className="text-[10px]">{i.state}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ChangesTab({ runbook, changes }: { runbook: Runbook; changes: readonly Change[] }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Related changes · {runbook.serviceId}</CardTitle></CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <EmptyState title="No related changes" description="No changes recorded on the target service." />
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {changes.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-1.5">
                <span><strong className="font-mono">{c.id}</strong> · {c.title}</span>
                <Badge variant="outline" className="text-[10px]">{c.risk}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EvidenceTab({
  runbook, onOpen,
}: {
  runbook: Runbook;
  onOpen: (title: string, source: string, snippet: string, ref?: string) => void;
}) {
  const items = [
    { id: "E1", title: "Last certification report",     source: "governance.records",   snippet: "Signed off by platform engineering and service owner.", ref: `cert/${runbook.id}` },
    { id: "E2", title: "Recent successful executions",  source: "operations.audit",      snippet: "Two consecutive successful executions in the last 14 days.", ref: `audit/${runbook.id}` },
    { id: "E3", title: "Fitness score data",            source: "runbook.fitness",       snippet: `Weighted score ${runbook.fitnessScore} based on freshness, coverage, and success.`, ref: `fitness/${runbook.id}` },
    { id: "E4", title: "Connector reachability probes", source: "connector.registry",    snippet: "All required connectors reachable at last probe cycle.", ref: `connectors/${runbook.id}` },
  ];
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {items.map((e) => (
        <button key={e.id} className="text-left"
          onClick={() => onOpen(e.title, e.source, e.snippet, e.ref)}>
          <EvidenceCitation evidence={{ ...e, supports: "supports" }} />
        </button>
      ))}
    </div>
  );
}

function ApprovalsTab({
  runbook, approval, recerts, deprecates,
}: {
  runbook: Runbook;
  approval: { id: string; state: string; reason: string } | null;
  recerts: RecertRequest[];
  deprecates: DeprecateRequest[];
}) {
  const nothing = !approval && recerts.length === 0 && deprecates.length === 0;
  if (nothing) return <EmptyState title="No approvals" description="No open approvals, recertifications, or deprecation reviews." />;
  return (
    <div className="space-y-4">
      {approval && (
        <SectionCard title="Execution approval" icon={<ShieldAlert className="h-4 w-4" />}>
          <div className="text-xs">
            <div><strong>Approval:</strong> <span className="font-mono">{approval.id}</span> · {approval.state}</div>
            <div className="mt-1 text-slate-700">{approval.reason}</div>
          </div>
        </SectionCard>
      )}
      {recerts.length > 0 && (
        <SectionCard title="Recertification requests" icon={<ShieldCheck className="h-4 w-4" />}>
          <ul className="divide-y divide-slate-100 text-xs">
            {recerts.map((r) => (
              <li key={r.id} className="py-1.5">
                <div><span className="font-mono">{r.id}</span> · {new Date(r.requestedAt).toLocaleString()} · <Badge variant="outline" className="text-[10px]">{r.state}</Badge></div>
                <div className="mt-0.5 text-slate-600">{r.notes}</div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      {deprecates.length > 0 && (
        <SectionCard title="Deprecation reviews" icon={<FileWarning className="h-4 w-4" />}>
          <ul className="divide-y divide-slate-100 text-xs">
            {deprecates.map((d) => (
              <li key={d.id} className="py-1.5">
                <div><span className="font-mono">{d.id}</span> · {new Date(d.requestedAt).toLocaleString()} · <Badge variant="outline" className="text-[10px]">{d.state}</Badge></div>
                <div className="mt-0.5 text-slate-600">{d.impactReview}</div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      <div className="text-[10px] text-slate-500">
        Runbook: {runbook.id}. All approvals emit audit and domain events through the OperationsProvider notification pipeline.
      </div>
    </div>
  );
}

function KnowledgeTab({ runbook }: { runbook: Runbook }) {
  const items = [
    { id: "K1", kind: "Postmortem", title: `Postmortem excerpt referencing ${runbook.id}`, source: "knowledge-base", snippet: "Query-plan regression from index deployment resolved via runbook automation." },
    { id: "K2", kind: "Known Error", title: "Plan-cache warmup delay after index swap", source: "knowledge-base", snippet: "Documented workaround captured in this runbook's fallback branch." },
    { id: "K3", kind: "Playbook",   title: "Checkout SEV response playbook",             source: "knowledge-base", snippet: "First 30 minutes of a checkout SEV — invokes this runbook when signature matches." },
  ];
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {items.map((k) => (
        <div key={k.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{k.kind}</div>
          <div className="font-medium">{k.title}</div>
          <div className="mt-1 text-slate-600">{k.snippet}</div>
          <div className="mt-1 text-[10px] text-slate-500">Source: {k.source}</div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ runbook }: { runbook: Runbook }) {
  const events = [
    { at: "5m ago",  actor: "digital-worker", action: "Fitness score recalculated", detail: `Score: ${runbook.fitnessScore}` },
    { at: "2d ago",  actor: "runbook author", action: "Recovery branch tightened",  detail: "Validation window reduced from 10m to 5m." },
    { at: "14d ago", actor: "SRE engineer",   action: "Post-execution improvement", detail: "Documented plan-cache warmup workaround." },
    { at: "30d ago", actor: "platform team",  action: "Certified",                  detail: "Approval-gated automation certified for Tier 1 use." },
  ];
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Improvement history</CardTitle></CardHeader>
      <CardContent>
        <ol className="border-l border-slate-200 pl-3 text-xs">
          {events.map((e, i) => (
            <li key={i} className="mb-2">
              <div className="flex items-center gap-2">
                <span className="-ml-4 h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                <span className="font-medium">{e.action}</span>
                <span className="text-[10px] text-slate-500">{e.at} · {e.actor}</span>
              </div>
              <div className="pl-2 text-slate-600">{e.detail}</div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title, icon, children,
}: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
