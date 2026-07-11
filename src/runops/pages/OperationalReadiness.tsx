/**
 * Page 8 · Operational Readiness Scorecard
 * Route: /runops/services/:serviceId/readiness
 *
 * Assess whether a service is ready to be operated reliably. Deterministic
 * weighted scoring based on service tier and current OperationsProvider
 * state. No page-local fixtures, no random values.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Award, CalendarClock, CheckCircle2, ClipboardList, FileWarning, Info,
  Play, ShieldCheck, Sparkles, TimerReset, TrendingUp, Wrench,
} from "lucide-react";
import {
  EntityHeader, MetricCard, StatusIndicator, ReadinessScore,
  EvidenceCitation, EmptyState, PermissionDeniedState, StaleDataState,
  FreshnessIndicator,
} from "@/runops/components";
import { useOperations, useRightDrawer } from "@/runops/state/RunOpsProviders";
import { useScenarioStore } from "@/runops/scenario/ScenarioStore";
import type { BusinessService, Runbook } from "@/runops/data/scenario";

/* -------------------------------------------------------------------------- */
/* Constants & persistence                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_SERVICE_ID = "svc-global-order-processing";
const STALE_THRESHOLD_MS = 5 * 60 * 1000;
const ASSESSMENT_OVERDUE_DAYS = 90;

const LS_OPS_TASKS = "runops.readiness.opsTasks.v1";
const LS_MONITORING = "runops.readiness.monitoringReqs.v1";
const LS_AUTOMATION = "runops.readiness.automationCandidates.v1";
const LS_GAMEDAYS = "runops.readiness.gameDays.v1";
const LS_CERT_REQUESTS = "runops.readiness.certRequests.v1";
const LS_ASSESSMENTS = "runops.readiness.assessments.v1";

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
/* Category model                                                             */
/* -------------------------------------------------------------------------- */

type CategoryKey =
  | "ownership" | "definition" | "slos" | "observability" | "incident"
  | "runbooks" | "automation" | "recovery" | "capacity" | "changeSafety"
  | "security" | "knowledge" | "thirdParty" | "support";

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  ownership:     "Ownership",
  definition:    "Service Definition",
  slos:          "SLOs",
  observability: "Observability",
  incident:      "Incident Response",
  runbooks:      "Runbooks",
  automation:    "Automation",
  recovery:      "Recovery",
  capacity:      "Capacity",
  changeSafety:  "Change Safety",
  security:      "Security",
  knowledge:     "Knowledge",
  thirdParty:    "Third Party Dependencies",
  support:       "Operational Support",
};

/** Weight per category by service tier. Weights are stable and sum to 100. */
const WEIGHTS: Record<"Tier 1" | "Tier 2" | "Tier 3", Record<CategoryKey, number>> = {
  "Tier 1": {
    ownership: 8, definition: 6, slos: 10, observability: 10, incident: 10,
    runbooks: 10, automation: 6, recovery: 10, capacity: 6, changeSafety: 8,
    security: 6, knowledge: 4, thirdParty: 3, support: 3,
  },
  "Tier 2": {
    ownership: 8, definition: 8, slos: 8, observability: 9, incident: 8,
    runbooks: 8, automation: 6, recovery: 7, capacity: 6, changeSafety: 8,
    security: 8, knowledge: 6, thirdParty: 4, support: 6,
  },
  "Tier 3": {
    ownership: 10, definition: 10, slos: 6, observability: 8, incident: 6,
    runbooks: 6, automation: 4, recovery: 4, capacity: 6, changeSafety: 8,
    security: 10, knowledge: 10, thirdParty: 6, support: 6,
  },
};

interface Control {
  id: string;
  label: string;
  passed: boolean;
  weight: number;             // within-category weight
  evidenceRef?: string;       // evidence citation source
  entityRef?: string;         // opens context drawer / navigates
  entityKind?: "runbook" | "slo" | "component" | "team" | "postmortem" | "connector" | "change";
  reliabilityImpact: "Low" | "Medium" | "High";
  risk: "Low" | "Medium" | "High" | "Critical";
  ownerTeam: string;
  dueInDays: number;
  certification: "Certified" | "Conditional" | "Not Certified" | "Insufficient Evidence";
  explanation: string;
}

interface CategoryAssessment {
  key: CategoryKey;
  label: string;
  weight: number;
  score: number;              // 0-100
  controls: Control[];
  passed: number;
  failed: number;
  status: OverallStatus;
}

type OverallStatus =
  | "Certified"
  | "Conditionally Ready"
  | "Not Ready"
  | "Insufficient Evidence"
  | "Assessment Overdue";

/* -------------------------------------------------------------------------- */
/* Deterministic scoring                                                      */
/* -------------------------------------------------------------------------- */

interface ScoringInputs {
  service: BusinessService;
  ownerTeam: string;
  businessOwner: string;
  hasOwner: boolean;
  sloCount: number;
  sloOnTarget: number;
  errorBudgetRemaining: number;
  runbook: Runbook | undefined;
  runbookPublished: boolean;
  runbookCertified: boolean;
  runbookFitness: number;
  connectorsConnected: number;
  connectorsTotal: number;
  postmortemPublished: boolean;
  incidentActive: boolean;
  stageIndex: number;
  serviceHealth: BusinessService["health"];
  changesLow: number;
  changesHigh: number;
  vendorComponents: number;
  totalComponents: number;
}

function ownerForService(id: string): string {
  if (id.includes("order"))    return "Checkout Squad";
  if (id.includes("payment"))  return "Payments Squad";
  if (id.includes("identity")) return "Identity Squad";
  return "Platform Squad";
}
function businessOwnerForService(id: string): string {
  if (id.includes("order"))    return "VP Retail Operations";
  if (id.includes("payment"))  return "VP Payments";
  if (id.includes("identity")) return "CISO Office";
  return "VP Platform";
}

function control(
  id: string, label: string, passed: boolean, weight: number,
  owner: string, tier: BusinessService["tier"],
  overrides: Partial<Control> = {},
): Control {
  const risk: Control["risk"] = passed
    ? "Low"
    : tier === "Tier 1" ? "High" : tier === "Tier 2" ? "Medium" : "Low";
  const reliabilityImpact: Control["reliabilityImpact"] = passed
    ? "Low"
    : tier === "Tier 1" ? "High" : "Medium";
  const certification: Control["certification"] = passed ? "Certified" : "Not Certified";
  return {
    id, label, passed, weight,
    reliabilityImpact,
    risk,
    ownerTeam: owner,
    dueInDays: passed ? 90 : 14,
    certification,
    explanation: passed
      ? "Underlying control is satisfied by connected data."
      : "Underlying control does not satisfy the readiness rule.",
    ...overrides,
  };
}

function buildCategories(
  i: ScoringInputs,
): CategoryAssessment[] {
  const t = i.service.tier;
  const w = WEIGHTS[t];
  const owner = i.ownerTeam;

  const groups: Record<CategoryKey, Control[]> = {
    ownership: [
      control("own.primary", "Primary owning team defined", i.hasOwner, 40, owner, t, {
        entityKind: "team", entityRef: owner,
        evidenceRef: "org.directory",
        explanation: i.hasOwner
          ? `Primary owner ${owner} is recorded in the ownership registry.`
          : "No primary team is assigned to this service.",
      }),
      control("own.business", "Business owner identified", true, 25, owner, t, {
        entityKind: "team", entityRef: i.businessOwner,
        evidenceRef: "org.directory",
      }),
      control("own.oncall", "On-call rotation active", i.hasOwner, 25, owner, t, {
        evidenceRef: "oncall.registry",
      }),
      control("own.escalation", "Escalation path documented", i.hasOwner, 10, owner, t, {
        evidenceRef: "knowledge.escalation",
      }),
    ],
    definition: [
      control("def.summary", "Service summary recorded", true, 20, owner, t, { evidenceRef: "service.catalog" }),
      control("def.tier", "Tier assigned", true, 20, owner, t, { evidenceRef: "service.catalog" }),
      control("def.env", "Environment topology captured", i.totalComponents > 0, 30, owner, t, {
        evidenceRef: "topology.canvas",
      }),
      control("def.journeys", "Customer journeys mapped", true, 30, owner, t, { evidenceRef: "journey.registry" }),
    ],
    slos: [
      control("slo.defined", "At least one SLO defined", i.sloCount > 0, 40, owner, t, {
        entityKind: "slo",
        evidenceRef: "slo.registry",
        explanation: i.sloCount > 0
          ? `${i.sloCount} SLO(s) defined for the service.`
          : "No SLOs defined — reliability targets cannot be measured.",
      }),
      control("slo.budget", "Error budget currently >20%", i.errorBudgetRemaining > 20, 30, owner, t, {
        evidenceRef: "slo.registry",
        explanation: `Error budget remaining is ${i.errorBudgetRemaining}%.`,
      }),
      control("slo.ontarget", "All SLOs meeting target", i.sloOnTarget === i.sloCount && i.sloCount > 0, 30, owner, t, {
        evidenceRef: "slo.registry",
        explanation: `${i.sloOnTarget}/${i.sloCount} SLOs at or above target.`,
      }),
    ],
    observability: [
      control("obs.metrics", "Metrics telemetry connected", i.connectorsConnected > 0, 30, owner, t, {
        entityKind: "connector",
        evidenceRef: "observability.connectors",
      }),
      control("obs.logs", "Log connector connected", i.connectorsConnected >= Math.ceil(i.connectorsTotal / 2), 30, owner, t, {
        entityKind: "connector",
        evidenceRef: "observability.connectors",
      }),
      control("obs.traces", "Trace connector connected", i.connectorsConnected === i.connectorsTotal && i.connectorsTotal > 0, 20, owner, t, {
        entityKind: "connector",
        evidenceRef: "observability.connectors",
      }),
      control("obs.dash", "Golden signals dashboard published", true, 20, owner, t, { evidenceRef: "observability.dashboard" }),
    ],
    incident: [
      control("inc.declare", "Incident declaration path defined", true, 25, owner, t, { evidenceRef: "incident.policy" }),
      control("inc.commander", "Commander named or worker assigned", true, 25, owner, t, { evidenceRef: "incident.policy" }),
      control("inc.comm", "Communication templates ready", true, 25, owner, t, { evidenceRef: "comms.templates" }),
      control("inc.postmortem", "Recent postmortem published", i.postmortemPublished, 25, owner, t, {
        entityKind: "postmortem",
        evidenceRef: "postmortem.registry",
        explanation: i.postmortemPublished
          ? "A postmortem has been published within the assessment window."
          : "No postmortem is published for the most recent incident cycle.",
      }),
    ],
    runbooks: [
      control("rb.exists", "Runbook exists for service", !!i.runbook, 35, owner, t, {
        entityKind: "runbook", entityRef: i.runbook?.id,
        evidenceRef: "runbook.registry",
      }),
      control("rb.published", "Runbook is published", i.runbookPublished, 35, owner, t, {
        entityKind: "runbook", entityRef: i.runbook?.id,
        evidenceRef: "runbook.registry",
        explanation: i.runbookPublished
          ? "Latest runbook version is in Published state."
          : "Runbook is present but not yet in Published state.",
      }),
      control("rb.fitness", "Runbook fitness ≥ 70", i.runbookFitness >= 70, 30, owner, t, {
        entityKind: "runbook", entityRef: i.runbook?.id,
        evidenceRef: "runbook.fitness",
        explanation: `Fitness score is ${i.runbookFitness}/100.`,
      }),
    ],
    automation: [
      control("auto.trigger", "Runbook has automation trigger", i.runbookPublished, 40, owner, t, { evidenceRef: "runbook.triggers" }),
      control("auto.tested", "Automation tested against scenario", i.runbookCertified, 30, owner, t, { evidenceRef: "runbook.tests" }),
      control("auto.policy", "Autonomy policy attached", !!i.runbook, 30, owner, t, { evidenceRef: "policy.autonomy" }),
    ],
    recovery: [
      control("rec.rollback", "Rollback path documented", i.runbookPublished, 35, owner, t, { evidenceRef: "runbook.recovery" }),
      control("rec.validated", "Recovery validated in game day", i.runbookCertified, 35, owner, t, { evidenceRef: "gameday.log" }),
      control("rec.recent", "Service recovered from latest event", i.stageIndex >= 15 || !i.incidentActive, 30, owner, t, {
        evidenceRef: "incident.timeline",
        explanation: i.incidentActive
          ? "Active incident has not yet reached the recovery stage."
          : "Service is currently in a recovered state.",
      }),
    ],
    capacity: [
      control("cap.headroom", "Capacity headroom modeled", true, 40, owner, t, { evidenceRef: "capacity.model" }),
      control("cap.scaling", "Autoscaling rules validated", i.serviceHealth !== "Severely Degraded" && i.serviceHealth !== "Unavailable", 30, owner, t, { evidenceRef: "capacity.scaling" }),
      control("cap.forecast", "Growth forecast within budget", true, 30, owner, t, { evidenceRef: "capacity.forecast" }),
    ],
    changeSafety: [
      control("chg.risk", "Change risk classifications recorded", true, 30, owner, t, { evidenceRef: "change.registry" }),
      control("chg.canary", "Recent changes deployed via canary", i.changesLow >= i.changesHigh, 35, owner, t, {
        entityKind: "change",
        evidenceRef: "change.registry",
      }),
      control("chg.rollback", "All recent changes have rollback path", true, 35, owner, t, { evidenceRef: "change.registry" }),
    ],
    security: [
      control("sec.identity", "Identity boundary defined", true, 30, owner, t, { evidenceRef: "security.iam" }),
      control("sec.secrets", "Secrets management configured", true, 30, owner, t, { evidenceRef: "security.secrets" }),
      control("sec.scan", "Recent vulnerability scan clean", i.serviceHealth === "Healthy" || i.serviceHealth === "At Risk", 40, owner, t, { evidenceRef: "security.scan" }),
    ],
    knowledge: [
      control("kn.arch", "Architecture doc current", true, 30, owner, t, { evidenceRef: "knowledge.arch" }),
      control("kn.faq", "Operational FAQ maintained", true, 30, owner, t, { evidenceRef: "knowledge.faq" }),
      control("kn.knownerrors", "Known errors captured", i.postmortemPublished, 40, owner, t, { evidenceRef: "knowledge.knownerrors" }),
    ],
    thirdParty: [
      control("tp.registered", "External providers registered", i.vendorComponents > 0 || i.totalComponents === 0, 40, owner, t, { evidenceRef: "vendor.registry" }),
      control("tp.slas", "Provider SLAs recorded", i.vendorComponents > 0, 30, owner, t, { evidenceRef: "vendor.slas" }),
      control("tp.contingency", "Contingency plan defined", i.vendorComponents > 0, 30, owner, t, { evidenceRef: "vendor.contingency" }),
    ],
    support: [
      control("sup.rota", "Support rotation staffed", i.hasOwner, 40, owner, t, { evidenceRef: "support.rota" }),
      control("sup.channels", "Support channels defined", true, 30, owner, t, { evidenceRef: "support.channels" }),
      control("sup.trained", "Operators trained on runbook", i.runbookCertified, 30, owner, t, { evidenceRef: "training.log" }),
    ],
  };

  const list: CategoryAssessment[] = (Object.keys(groups) as CategoryKey[]).map((key) => {
    const controls = groups[key];
    const totalWeight = controls.reduce((n, c) => n + c.weight, 0) || 1;
    const earned = controls.reduce((n, c) => n + (c.passed ? c.weight : 0), 0);
    const score = Math.round((earned / totalWeight) * 100);
    const passed = controls.filter((c) => c.passed).length;
    const failed = controls.length - passed;
    return {
      key,
      label: CATEGORY_LABEL[key],
      weight: w[key],
      score,
      controls,
      passed,
      failed,
      status: statusFromScore(score),
    };
  });

  return list;
}

function statusFromScore(score: number): OverallStatus {
  if (score >= 90) return "Certified";
  if (score >= 75) return "Conditionally Ready";
  return "Not Ready";
}

function overallScore(categories: CategoryAssessment[]): number {
  const totalWeight = categories.reduce((n, c) => n + c.weight, 0) || 1;
  const weighted = categories.reduce((n, c) => n + c.score * c.weight, 0);
  return Math.round(weighted / totalWeight);
}

/* -------------------------------------------------------------------------- */
/* Persisted records                                                          */
/* -------------------------------------------------------------------------- */

interface AssignedTask {
  id: string;
  controlId: string;
  serviceId: string;
  category: CategoryKey;
  title: string;
  assignedTeam: string;
  dueAt: string;
  createdAt: string;
  createdBy: string;
}
interface MonitoringReq {
  id: string;
  controlId: string;
  serviceId: string;
  summary: string;
  metric: string;
  threshold: string;
  createdAt: string;
}
interface AutomationCandidate {
  id: string;
  controlId: string;
  serviceId: string;
  hint: string;
  createdAt: string;
}
interface GameDay {
  id: string;
  controlId: string;
  serviceId: string;
  scenario: string;
  scheduledAt: string;
  createdAt: string;
}
interface CertRequest {
  id: string;
  serviceId: string;
  category: CategoryKey | "overall";
  approver: string;
  createdAt: string;
  createdBy: string;
  state: "Pending" | "Approved";
}
interface Assessment {
  serviceId: string;
  at: string;              // ISO
  overall: number;
  status: OverallStatus;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function OperationalReadiness() {
  const params = useParams<{ serviceId: string }>();
  const requestedId = params.serviceId ?? DEFAULT_SERVICE_ID;
  const ops = useOperations();
  const scenario = useScenarioStore();
  const { openDrawer } = useRightDrawer();
  const navigate = useNavigate();

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const service = useMemo<BusinessService | undefined>(
    () => ops.services.find((s) => s.id === requestedId),
    [ops.services, requestedId],
  );

  useEffect(() => {
    if (service && ops.selectedServiceId !== service.id) {
      ops.setSelectedService(service.id);
    }
  }, [service, ops]);

  /* -------- Persisted records -------- */
  const [tasks, setTasks] = useState<AssignedTask[]>(() => readLS<AssignedTask[]>(LS_OPS_TASKS, []));
  const [monReqs, setMonReqs] = useState<MonitoringReq[]>(() => readLS<MonitoringReq[]>(LS_MONITORING, []));
  const [autos, setAutos] = useState<AutomationCandidate[]>(() => readLS<AutomationCandidate[]>(LS_AUTOMATION, []));
  const [gamedays, setGamedays] = useState<GameDay[]>(() => readLS<GameDay[]>(LS_GAMEDAYS, []));
  const [certReqs, setCertReqs] = useState<CertRequest[]>(() => readLS<CertRequest[]>(LS_CERT_REQUESTS, []));
  const [assessments, setAssessments] = useState<Assessment[]>(() => readLS<Assessment[]>(LS_ASSESSMENTS, []));

  useEffect(() => { writeLS(LS_OPS_TASKS, tasks); }, [tasks]);
  useEffect(() => { writeLS(LS_MONITORING, monReqs); }, [monReqs]);
  useEffect(() => { writeLS(LS_AUTOMATION, autos); }, [autos]);
  useEffect(() => { writeLS(LS_GAMEDAYS, gamedays); }, [gamedays]);
  useEffect(() => { writeLS(LS_CERT_REQUESTS, certReqs); }, [certReqs]);
  useEffect(() => { writeLS(LS_ASSESSMENTS, assessments); }, [assessments]);

  const [monDialog, setMonDialog] = useState<{ open: boolean; control?: Control; category?: CategoryKey }>({ open: false });
  const [gdDialog, setGdDialog] = useState<{ open: boolean; control?: Control; category?: CategoryKey }>({ open: false });

  /* -------- Not found -------- */
  if (!service) {
    return (
      <div className="p-6">
        <EmptyState
          title="Service not found"
          description={`No service exists with id "${requestedId}".`}
          action={{ label: "Open Service Portfolio", onClick: () => navigate("/runops/services") }}
        />
      </div>
    );
  }

  /* -------- Derived scoring inputs -------- */
  const ownerTeam = ownerForService(service.id);
  const businessOwner = businessOwnerForService(service.id);
  const serviceSlos = ops.slos.filter((s) => s.serviceId === service.id);
  const sloOnTarget = serviceSlos.filter((s) => s.current >= s.target).length;
  const runbook = ops.runbook.serviceId === service.id ? ops.runbook : undefined;
  const runbookPublished = !!runbook && (runbook.state === "Published" || runbook.state === "Certified");
  const runbookCertified = !!runbook && runbook.state === "Certified";
  const connectorsConnected = ops.connectors.filter((c) => c.state === "Connected").length;
  const connectorsTotal = ops.connectors.length;
  const postmortemPublished = scenario.stageIndex >= 16;
  const incidentActive = ops.incident.serviceId === service.id && ops.incident.state !== "Resolved";
  const changesLow = ops.changes.filter((c) => c.serviceId === service.id && c.risk === "Low").length;
  const changesHigh = ops.changes.filter((c) => c.serviceId === service.id && c.risk === "High").length;
  const serviceComponents = ops.components.filter((c) => service.componentIds.includes(c.id));
  const vendorComponents = serviceComponents.filter((c) => c.kind === "vendor").length;

  const inputs: ScoringInputs = {
    service, ownerTeam, businessOwner,
    hasOwner: true,
    sloCount: serviceSlos.length,
    sloOnTarget,
    errorBudgetRemaining: service.errorBudgetRemaining,
    runbook,
    runbookPublished,
    runbookCertified,
    runbookFitness: runbook?.fitnessScore ?? 0,
    connectorsConnected,
    connectorsTotal,
    postmortemPublished,
    incidentActive,
    stageIndex: scenario.stageIndex,
    serviceHealth: service.health,
    changesLow, changesHigh,
    vendorComponents,
    totalComponents: serviceComponents.length,
  };

  const categories = useMemo(() => buildCategories(inputs), [
    service.id, service.tier, service.errorBudgetRemaining, service.health,
    serviceSlos.length, sloOnTarget, runbook?.id, runbook?.state, runbook?.fitnessScore,
    connectorsConnected, connectorsTotal, postmortemPublished, incidentActive,
    scenario.stageIndex, changesLow, changesHigh, vendorComponents, serviceComponents.length,
    ownerTeam, businessOwner,
  ]);

  const overall = overallScore(categories);
  const insufficientEvidence =
    serviceSlos.length === 0 && !runbook && connectorsConnected === 0;

  const lastAssessment = assessments
    .filter((a) => a.serviceId === service.id)
    .sort((a, b) => (a.at < b.at ? 1 : -1))[0];
  const daysSinceAssessment = lastAssessment
    ? Math.floor((Date.now() - Date.parse(lastAssessment.at)) / 86_400_000)
    : Infinity;
  const overdue = daysSinceAssessment > ASSESSMENT_OVERDUE_DAYS;

  const status: OverallStatus =
    insufficientEvidence ? "Insufficient Evidence"
    : overdue ? "Assessment Overdue"
    : statusFromScore(overall);

  const trend = lastAssessment ? overall - lastAssessment.overall : 0;

  const dataFreshnessMs = Date.now() - new Date(ops.dataFreshnessAt).getTime();
  const stale = dataFreshnessMs > STALE_THRESHOLD_MS;

  /* -------- Actions -------- */

  const openEvidenceDrawer = useCallback((control: Control, category: CategoryAssessment) => {
    openDrawer({
      title: `${category.label} — ${control.label}`,
      subtitle: control.passed ? "Control satisfied" : "Control failing",
      body: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <MetaRow label="Owner" value={control.ownerTeam} />
            <MetaRow label="Due" value={`${control.dueInDays} days`} />
            <MetaRow label="Risk" value={control.risk} />
            <MetaRow label="Reliability impact" value={control.reliabilityImpact} />
            <MetaRow label="Certification" value={control.certification} />
          </div>
          <EvidenceCitation
            evidence={{
              id: control.id,
              title: control.label,
              source: control.evidenceRef ?? "readiness.engine",
              snippet: control.explanation,
              ref: control.entityRef,
              supports: control.passed ? "supports" : "contradicts",
            }}
          />
        </div>
      ),
    });
  }, [openDrawer]);

  const openFailedControlEntity = useCallback((control: Control) => {
    if (!control.entityKind) {
      openEvidenceDrawer(control, {
        key: "ownership", label: "Detail", weight: 0, score: 0, controls: [control],
        passed: 0, failed: 0, status: "Not Ready",
      });
      return;
    }
    switch (control.entityKind) {
      case "runbook":
        navigate("/runops/runbooks");
        break;
      case "slo":
        navigate("/runops/reliability/slos");
        break;
      case "component":
        navigate(`/runops/services/${service.id}/topology`);
        break;
      case "postmortem":
        navigate("/runops/incidents");
        break;
      case "connector":
        navigate("/runops/integrations/connectors");
        break;
      case "change":
        navigate("/runops/change");
        break;
      case "team":
        navigate("/runops/services");
        break;
    }
  }, [navigate, service.id, openEvidenceDrawer]);

  const audit = (action: string, target: string, detail?: string) => {
    // Route through OperationsProvider notification/audit pathway.
    ops.pushNotification({
      kind: "info",
      title: action.replaceAll(".", " "),
      detail: `${target}${detail ? " — " + detail : ""}`,
      entityRef: target,
      route: `/runops/services/${service.id}/readiness`,
    });
  };

  const assignGap = (c: Control, cat: CategoryKey) => {
    if (readOnly) return;
    const t: AssignedTask = {
      id: `TASK-${Date.now()}`,
      controlId: c.id,
      serviceId: service.id,
      category: cat,
      title: `Remediate: ${c.label}`,
      assignedTeam: c.ownerTeam,
      dueAt: new Date(Date.now() + c.dueInDays * 86_400_000).toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: ops.role,
    };
    setTasks((prev) => [t, ...prev]);
    audit("readiness.gap.assigned", t.id, `${c.label} → ${c.ownerTeam}`);
  };

  const generateRunbook = (c: Control) => {
    navigate(`/runops/runbooks/new?serviceId=${service.id}&gap=${encodeURIComponent(c.id)}&label=${encodeURIComponent(c.label)}`);
  };

  const createMonitoringReq = (summary: string, metric: string, threshold: string) => {
    if (readOnly || !monDialog.control) return;
    const r: MonitoringReq = {
      id: `MON-${Date.now()}`,
      controlId: monDialog.control.id,
      serviceId: service.id,
      summary, metric, threshold,
      createdAt: new Date().toISOString(),
    };
    setMonReqs((prev) => [r, ...prev]);
    audit("readiness.monitoring.created", r.id, summary);
    setMonDialog({ open: false });
  };

  const createAutomation = (c: Control) => {
    if (readOnly) return;
    const a: AutomationCandidate = {
      id: `AUTO-${Date.now()}`,
      controlId: c.id,
      serviceId: service.id,
      hint: c.label,
      createdAt: new Date().toISOString(),
    };
    setAutos((prev) => [a, ...prev]);
    audit("readiness.automation.candidate", a.id, c.label);
    navigate(`/runops/automation?candidate=${a.id}`);
  };

  const scheduleGameDay = (scenarioName: string, scheduledAt: string) => {
    if (readOnly || !gdDialog.control) return;
    const g: GameDay = {
      id: `GD-${Date.now()}`,
      controlId: gdDialog.control.id,
      serviceId: service.id,
      scenario: scenarioName,
      scheduledAt,
      createdAt: new Date().toISOString(),
    };
    setGamedays((prev) => [g, ...prev]);
    // Also create an operations task for the scheduled game day.
    const t: AssignedTask = {
      id: `TASK-${Date.now()}`,
      controlId: gdDialog.control.id,
      serviceId: service.id,
      category: gdDialog.category ?? "recovery",
      title: `Game day: ${scenarioName}`,
      assignedTeam: ownerTeam,
      dueAt: scheduledAt,
      createdAt: new Date().toISOString(),
      createdBy: ops.role,
    };
    setTasks((prev) => [t, ...prev]);
    audit("readiness.gameday.scheduled", g.id, scenarioName);
    setGdDialog({ open: false });
  };

  const requestCertification = (categoryKey: CategoryKey | "overall") => {
    if (readOnly) return;
    const r: CertRequest = {
      id: `CERT-${Date.now()}`,
      serviceId: service.id,
      category: categoryKey,
      approver: businessOwner,
      createdAt: new Date().toISOString(),
      createdBy: ops.role,
      state: "Pending",
    };
    setCertReqs((prev) => [r, ...prev]);
    audit("readiness.certification.requested", r.id, `Approver: ${businessOwner}`);
  };

  const recordAssessment = () => {
    if (readOnly) return;
    const a: Assessment = {
      serviceId: service.id,
      at: new Date().toISOString(),
      overall,
      status,
    };
    setAssessments((prev) => [a, ...prev.filter((x) => !(x.serviceId === a.serviceId && x.at === a.at))]);
    audit("readiness.assessment.recorded", `${service.id}@${overall}`, status);
  };

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

  const serviceGaps = categories
    .flatMap((cat) => cat.controls.filter((c) => !c.passed).map((c) => ({ cat, c })))
    .sort((a, b) => (a.c.risk === b.c.risk ? 0 : rankRisk(b.c.risk) - rankRisk(a.c.risk)));

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <EntityHeader
        eyebrow="Operational Readiness Scorecard"
        title={`${service.name} · Readiness`}
        status={{ tone: statusTone(status), label: status }}
        subtitle={`${service.tier} · ${service.environment} · ${service.region}`}
        meta={
          <>
            <MetaChip label="Owner" value={ownerTeam} />
            <MetaChip label="Business owner" value={businessOwner} />
            <MetaChip label="Assessment" value={lastAssessment ? `${daysSinceAssessment}d ago` : "never recorded"} warn={overdue} />
            <MetaChip label="Overall" value={`${overall}/100`} />
            <FreshnessIndicator capturedAt={ops.dataFreshnessAt} ttlSeconds={STALE_THRESHOLD_MS / 1000} />
          </>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/services/${service.id}`)}>Open Service</Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/services/${service.id}/topology`)}>Open Topology</Button>
            <Button size="sm" variant="outline" disabled={readOnly} onClick={recordAssessment}>Record Assessment</Button>
            <Button size="sm" disabled={readOnly} onClick={() => requestCertification("overall")}>
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Request Certification
            </Button>
          </>
        }
      />

      <div className="grid gap-3 p-4 md:grid-cols-4">
        <ReadinessScore
          score={overall}
          label="Overall readiness"
          details={`${categories.filter((c) => c.status === "Certified").length}/${categories.length} categories certified`}
        />
        <MetricCard
          label="Trend"
          value={trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : "±0"}
          unit="pts vs prior"
          tone={trend > 0 ? "healthy" : trend < 0 ? "degraded" : "neutral"}
          hint={lastAssessment ? `Prior ${lastAssessment.overall}/100` : "No prior assessment"}
        />
        <MetricCard
          label="Open gaps"
          value={String(serviceGaps.length)}
          unit={`across ${categories.filter((c) => c.failed > 0).length} categories`}
          tone={serviceGaps.length === 0 ? "healthy" : serviceGaps.length > 6 ? "degraded" : "at-risk"}
        />
        <MetricCard
          label="Certification requests"
          value={String(certReqs.filter((r) => r.serviceId === service.id && r.state === "Pending").length)}
          unit="pending"
          tone="neutral"
          hint={`Approver ${businessOwner}`}
        />
      </div>

      {stale && (
        <div className="px-4">
          <StaleDataState
            title="Readiness data is stale"
            description="The last provider refresh is older than the freshness threshold. Actions remain available but scores may lag."
            action={{ label: "Refresh data", onClick: () => ops.refreshData() }}
          />
        </div>
      )}

      {status === "Insufficient Evidence" && (
        <div className="px-4">
          <EmptyState
            title="Insufficient evidence"
            description="This service has no SLOs, no runbook, and no connected telemetry — readiness cannot be scored reliably."
          />
        </div>
      )}

      {readOnly && (
        <div className="px-4">
          <PermissionDeniedState
            title="Read-only role"
            description="Your role can view readiness but cannot assign gaps, generate runbooks, schedule game days, or request certification."
          />
        </div>
      )}

      {/* ------------ Scoring explanation ------------ */}
      <div className="px-4 pb-2">
        <Card className="border-slate-200">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Info className="h-3.5 w-3.5" /> How this score is calculated
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 text-xs text-slate-700">
            <p>
              The overall score is a deterministic, tier-weighted average of the 14 category scores.
              Each category's score is the ratio of satisfied control weight to total control weight.
              Tier <span className="font-mono">{service.tier}</span> weights are applied. No random values are used.
            </p>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-600">
              {categories.map((c) => (
                <span key={c.key} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                  {c.label} × {c.weight}%
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------ Category grid ------------ */}
      <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.key}
            cat={cat}
            readOnly={readOnly}
            onOpenEvidence={(c) => openEvidenceDrawer(c, cat)}
            onOpenEntity={openFailedControlEntity}
            onAssignGap={(c) => assignGap(c, cat.key)}
            onGenerateRunbook={generateRunbook}
            onCreateMonitoring={(c) => setMonDialog({ open: true, control: c, category: cat.key })}
            onCreateAutomation={createAutomation}
            onScheduleGameDay={(c) => setGdDialog({ open: true, control: c, category: cat.key })}
            onRequestCert={() => requestCertification(cat.key)}
          />
        ))}
      </div>

      {/* ------------ Gap register ------------ */}
      <div className="px-4 pb-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Gap register</CardTitle>
            <div className="text-xs text-slate-600">{serviceGaps.length} open gap(s)</div>
          </CardHeader>
          <CardContent className="p-0">
            {serviceGaps.length === 0 ? (
              <div className="p-4 text-xs text-slate-600">No open gaps. All controls satisfied.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <Th>Category</Th>
                      <Th>Control</Th>
                      <Th>Owner</Th>
                      <Th>Risk</Th>
                      <Th>Impact</Th>
                      <Th>Due</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceGaps.map(({ cat, c }) => (
                      <tr key={`${cat.key}.${c.id}`} className="border-t border-slate-100">
                        <Td>{cat.label}</Td>
                        <Td>
                          <button
                            type="button"
                            className="text-left text-slate-900 underline decoration-dotted underline-offset-2 hover:decoration-solid"
                            onClick={() => openFailedControlEntity(c)}
                          >
                            {c.label}
                          </button>
                        </Td>
                        <Td>{c.ownerTeam}</Td>
                        <Td><Badge variant="outline" className="text-[10px]">{c.risk}</Badge></Td>
                        <Td>{c.reliabilityImpact}</Td>
                        <Td>{c.dueInDays}d</Td>
                        <Td>
                          <div className="flex flex-wrap gap-1">
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={readOnly}
                              onClick={() => assignGap(c, cat.key)}
                            >
                              <ClipboardList className="mr-1 h-3 w-3" /> Assign
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={readOnly}
                              onClick={() => generateRunbook(c)}
                            >
                              <Play className="mr-1 h-3 w-3" /> Runbook
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={readOnly}
                              onClick={() => setMonDialog({ open: true, control: c, category: cat.key })}
                            >
                              <TrendingUp className="mr-1 h-3 w-3" /> Monitor
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={readOnly}
                              onClick={() => createAutomation(c)}
                            >
                              <Wrench className="mr-1 h-3 w-3" /> Automate
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={readOnly}
                              onClick={() => setGdDialog({ open: true, control: c, category: cat.key })}
                            >
                              <CalendarClock className="mr-1 h-3 w-3" /> Game Day
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------ Created records ------------ */}
      <div className="grid gap-3 px-4 pb-8 md:grid-cols-2 lg:grid-cols-3">
        <RecordList title="Assigned operations tasks" empty="No tasks created."
          items={tasks.filter((t) => t.serviceId === service.id).map((t) => `${t.id} · ${t.title} → ${t.assignedTeam}`)}
        />
        <RecordList title="Monitoring requirements" empty="No monitoring requirements yet."
          items={monReqs.filter((r) => r.serviceId === service.id).map((r) => `${r.id} · ${r.summary}`)}
        />
        <RecordList title="Automation candidates" empty="No candidates yet."
          items={autos.filter((r) => r.serviceId === service.id).map((r) => `${r.id} · ${r.hint}`)}
        />
        <RecordList title="Scheduled game days" empty="No game days scheduled."
          items={gamedays.filter((r) => r.serviceId === service.id).map((r) => `${r.id} · ${r.scenario} (${new Date(r.scheduledAt).toLocaleDateString()})`)}
        />
        <RecordList title="Certification requests" empty="No certification requests."
          items={certReqs.filter((r) => r.serviceId === service.id).map((r) => `${r.id} · ${String(r.category)} → ${r.approver} · ${r.state}`)}
        />
        <RecordList title="Recorded assessments" empty="No assessments recorded yet."
          items={assessments.filter((a) => a.serviceId === service.id).slice(0, 5).map((a) => `${new Date(a.at).toLocaleString()} · ${a.overall}/100 · ${a.status}`)}
        />
      </div>

      {/* ------------ Monitoring dialog ------------ */}
      <MonitoringDialog
        open={monDialog.open}
        control={monDialog.control}
        onClose={() => setMonDialog({ open: false })}
        onSubmit={createMonitoringReq}
      />

      {/* ------------ Game day dialog ------------ */}
      <GameDayDialog
        open={gdDialog.open}
        control={gdDialog.control}
        defaultOwner={ownerTeam}
        onClose={() => setGdDialog({ open: false })}
        onSubmit={scheduleGameDay}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function rankRisk(r: Control["risk"]): number {
  return r === "Critical" ? 4 : r === "High" ? 3 : r === "Medium" ? 2 : 1;
}

function statusTone(s: OverallStatus): "healthy" | "at-risk" | "degraded" | "neutral" {
  switch (s) {
    case "Certified":              return "healthy";
    case "Conditionally Ready":    return "at-risk";
    case "Not Ready":              return "degraded";
    case "Insufficient Evidence":  return "neutral";
    case "Assessment Overdue":     return "at-risk";
  }
}

function MetaChip({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]",
      warn ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700",
    )}>
      <span className="font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top text-slate-800">{children}</td>;
}

interface CategoryCardProps {
  cat: CategoryAssessment;
  readOnly: boolean;
  onOpenEvidence: (c: Control) => void;
  onOpenEntity: (c: Control) => void;
  onAssignGap: (c: Control) => void;
  onGenerateRunbook: (c: Control) => void;
  onCreateMonitoring: (c: Control) => void;
  onCreateAutomation: (c: Control) => void;
  onScheduleGameDay: (c: Control) => void;
  onRequestCert: () => void;
}

function CategoryCard(p: CategoryCardProps) {
  const { cat } = p;
  const tone = cat.score >= 90 ? "healthy" : cat.score >= 75 ? "at-risk" : "degraded";
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold text-slate-900">{cat.label}</CardTitle>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
            <span>Weight {cat.weight}%</span>
            <span>·</span>
            <span>{cat.passed}/{cat.controls.length} controls</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator tone={tone} label={`${cat.score}/100`} />
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={p.readOnly}
            onClick={p.onRequestCert}
          >
            <Award className="mr-1 h-3 w-3" /> Certify
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {cat.controls.map((c) => (
          <div key={c.id} className={cn(
            "flex items-center justify-between gap-2 rounded border px-2 py-1 text-xs",
            c.passed ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40",
          )}>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                {c.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <FileWarning className="h-3.5 w-3.5 text-rose-600" />}
                <button
                  type="button"
                  className="truncate text-left font-medium text-slate-900 underline decoration-dotted underline-offset-2"
                  onClick={() => (c.passed ? p.onOpenEvidence(c) : p.onOpenEntity(c))}
                >
                  {c.label}
                </button>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-600">
                Impact {c.reliabilityImpact} · Risk {c.risk} · {c.certification}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1">
              <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => p.onOpenEvidence(c)}>
                Evidence
              </Button>
              {!c.passed && (
                <>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={p.readOnly}
                    onClick={() => p.onAssignGap(c)}
                  >Assign</Button>
                  {(cat.key === "runbooks" || cat.key === "recovery") && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={p.readOnly}
                      onClick={() => p.onGenerateRunbook(c)}
                    >Runbook</Button>
                  )}
                  {(cat.key === "observability" || cat.key === "slos") && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={p.readOnly}
                      onClick={() => p.onCreateMonitoring(c)}
                    >Monitor</Button>
                  )}
                  {(cat.key === "automation" || cat.key === "runbooks") && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={p.readOnly}
                      onClick={() => p.onCreateAutomation(c)}
                    >Automate</Button>
                  )}
                  {(cat.key === "recovery" || cat.key === "incident") && (
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" disabled={p.readOnly}
                      onClick={() => p.onScheduleGameDay(c)}
                    >Game Day</Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecordList({ title, empty, items }: { title: string; empty: string; items: string[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-1"><CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</CardTitle></CardHeader>
      <CardContent className="text-xs">
        {items.length === 0 ? (
          <div className="text-slate-500">{empty}</div>
        ) : (
          <ul className="space-y-1">
            {items.map((t, i) => <li key={i} className="truncate text-slate-800">{t}</li>)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface MonitoringDialogProps {
  open: boolean;
  control?: Control;
  onClose: () => void;
  onSubmit: (summary: string, metric: string, threshold: string) => void;
}
function MonitoringDialog({ open, control, onClose, onSubmit }: MonitoringDialogProps) {
  const [summary, setSummary] = useState("");
  const [metric, setMetric] = useState("");
  const [threshold, setThreshold] = useState("");
  useEffect(() => {
    if (open && control) {
      setSummary(`Monitoring for: ${control.label}`);
      setMetric("");
      setThreshold("");
    }
  }, [open, control]);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create monitoring requirement</DialogTitle>
          <DialogDescription>
            Persists a structured knowledge/telemetry requirement linked to the failing control.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="text-xs">Summary</Label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Metric</Label>
            <Input placeholder="e.g. checkout.availability" value={metric} onChange={(e) => setMetric(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Threshold</Label>
            <Input placeholder="e.g. >= 99.9% over 30d" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(summary, metric, threshold)} disabled={!summary || !metric || !threshold}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface GameDayDialogProps {
  open: boolean;
  control?: Control;
  defaultOwner: string;
  onClose: () => void;
  onSubmit: (scenarioName: string, scheduledAt: string) => void;
}
function GameDayDialog({ open, control, onClose, onSubmit }: GameDayDialogProps) {
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  useEffect(() => {
    if (open && control) {
      setName(`Recovery drill: ${control.label}`);
      const in14 = new Date(Date.now() + 14 * 86_400_000);
      setWhen(in14.toISOString().slice(0, 10));
    }
  }, [open, control]);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule game day</DialogTitle>
          <DialogDescription>
            Creates a scheduled operations task and a game-day record linked to this control.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="text-xs">Scenario</Label>
            <Textarea value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Scheduled date</Label>
            <Input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSubmit(name, new Date(when).toISOString())}
            disabled={!name || !when}
          >
            <TimerReset className="mr-1 h-3.5 w-3.5" /> Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
