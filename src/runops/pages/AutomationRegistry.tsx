/**
 * Page 37 · Toil Discovery, Automation Backlog, and Marketplace
 * Route: /runops/automation
 *
 * Identify repetitive operational work and convert it into reusable
 * automation and digital-worker capabilities. Distinguishes work that
 * should be automated from work that should be eliminated by design or
 * process change. Every mutation emits an audit + domain event via
 * ops.pushNotification and persists to localStorage so cross-screen
 * views (Runbook wizard, Marketplace installs, Analytics benefits,
 * Retirement dependents) reflect state changes on next mount.
 *
 * Persistence (localStorage):
 *   runops.automation.candidates.v1   → Candidate[]
 *   runops.automation.marketplace.v1  → MarketplaceItem[]
 *   runops.automation.benefits.v1     → BenefitRecord[]
 *   runops.automation.retired.v1      → RetiredRecord[]
 *   runops.automation.tasks.v1        → ServiceReadinessTask[] (marketplace install)
 *   runops.runbooks.drafts.v1         → RunbookDraft[]           (Create Runbook)
 *   runops.audit.v1                   → audit log entries
 *   runops.domain.v1                  → domain events
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, BadgeCheck, Ban, Bot, CheckCircle2,
  ClipboardList, Clock, Download, ExternalLink, Filter, GitBranch,
  Layers, Package, Play, PlusCircle, Rocket, Search, Scale,
  ShieldCheck, Sparkles, Store, Timer, TrendingUp, Wrench, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* --------------------------------- Types -------------------------------- */

type CandidateStatus =
  | "New candidate"
  | "Accepted"
  | "Rejected"
  | "In engineering"
  | "Published"
  | "Benefit unverified"
  | "Benefit verified"
  | "Retired";

type Judgment = "None" | "Low" | "Medium" | "High";
type Feasibility = "High" | "Medium" | "Low";
type Risk = "Low" | "Medium" | "High";
type Recommendation = "Automate" | "Eliminate by design" | "Simplify process" | "Insufficient signal";
type Source = "Operator activity" | "Incident recurrence" | "Runbook telemetry" | "User submitted" | "Shift handoff";

interface SavingsBasis {
  hoursPerMonth: number;         // observed hours consumed monthly (records)
  loadedHourlyRateUsd: number;   // fully-loaded operator rate
  automationCoveragePct: number; // 0-1, portion of the manual steps automatable
  confidence: number;            // 0-1, calibrated confidence in the estimate
  sourceRecords: string[];       // stable identifiers, e.g. "INC-10482", "EXE-8841"
  assumptions: string[];         // spelled out
}

interface EvidenceRef {
  kind: "incident" | "execution" | "runbook" | "handoff" | "metric";
  id: string;
  label: string;
}

interface Candidate {
  id: string;                    // AUT-####
  title: string;
  description: string;
  source: Source;
  frequency: string;             // e.g. "3.4x / week"
  hoursConsumedMonthly: number;  // recorded
  manualSteps: number;
  judgmentRequired: Judgment;
  feasibility: Feasibility;
  risk: Risk;
  expectedSloImpact: string;     // e.g. "+0.4pp availability on checkout-api"
  incidentRecurrence: number;    // count over trailing 90d
  savings: SavingsBasis;
  ownerName: string | null;
  ownerTeam: string | null;
  status: CandidateStatus;
  recommendation: Recommendation;
  rejectionReason: string | null;
  linkedRunbookId: string | null;
  linkedWorkerId: string | null;
  linkedComponentId: string | null;
  publishedMarketplaceId: string | null;
  evidence: EvidenceRef[];
  services: string[];
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceItem {
  id: string;                    // MP-####
  title: string;
  summary: string;
  kind: "Runbook" | "Digital Worker" | "Reusable Component" | "Golden Path";
  version: string;
  publisher: string;
  autonomy: "L0" | "L1" | "L2" | "L3";
  ratingCalibrated: number;      // 0-1 evaluated success weighted by evals
  installs: number;
  installedForServices: string[];
  candidateId: string | null;
  createdAt: string;
}

interface BenefitRecord {
  id: string;                    // BEN-####
  candidateId: string;
  observedHoursSavedMonthly: number | null;   // null until measured
  observedSloDelta: string | null;
  observedIncidentReduction: number | null;
  measurementWindowDays: number;
  status: "Unverified" | "Verified" | "Regression";
  method: string;
  sourceRecords: string[];
  updatedAt: string;
}

interface RetiredRecord {
  id: string;                    // RET-####
  candidateId: string;
  retiredAt: string;
  reason: string;
  dependentRunbookIds: string[];
  dependentServices: string[];
}

/* --------------------------- Storage helpers ---------------------------- */

const CAND_KEY   = "runops.automation.candidates.v1";
const MP_KEY     = "runops.automation.marketplace.v1";
const BEN_KEY    = "runops.automation.benefits.v1";
const RET_KEY    = "runops.automation.retired.v1";
const TASKS_KEY  = "runops.automation.tasks.v1";
const DRAFT_KEY  = "runops.runbooks.drafts.v1";

function readList<T>(k: string): T[] {
  try { const v = JSON.parse(localStorage.getItem(k) ?? "[]"); return Array.isArray(v) ? (v as T[]) : []; }
  catch { return []; }
}
function writeList<T>(k: string, v: T[]) { localStorage.setItem(k, JSON.stringify(v)); }

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${(Math.floor(Math.random() * 9000) + 1000).toString()}`;
const inDays = (d: number): string => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString(); };

/* --------------------------- Savings calc ------------------------------- */

function monthlyUsdSavings(b: SavingsBasis): number {
  // Not fabricated: hours × rate × coverage × confidence. All operands are
  // required and visible in the drawer alongside sourceRecords and assumptions.
  return b.hoursPerMonth * b.loadedHourlyRateUsd * b.automationCoveragePct * b.confidence;
}
function usd(n: number): string { return `$${Math.round(n).toLocaleString()}`; }
function pct(n: number): string { return `${Math.round(n * 100)}%`; }

/* --------------------------- Recommendation logic ----------------------- */

function classify(c: Candidate): Recommendation {
  // Judgment high + risk high → eliminate/simplify rather than automate.
  if (c.judgmentRequired === "High" && c.feasibility !== "High") return "Eliminate by design";
  if (c.manualSteps <= 2 && c.hoursConsumedMonthly < 2) return "Simplify process";
  if (c.savings.confidence < 0.5) return "Insufficient signal";
  return "Automate";
}

/* --------------------------- Seeds -------------------------------------- */

function seedCandidates(): Candidate[] {
  const now = nowIso();
  const base = (r: Partial<Candidate> & Pick<Candidate,
    "id" | "title" | "description" | "source" | "frequency" | "hoursConsumedMonthly" |
    "manualSteps" | "judgmentRequired" | "feasibility" | "risk" | "expectedSloImpact" |
    "incidentRecurrence" | "savings" | "status" | "services">): Candidate => ({
    ownerName: null,
    ownerTeam: null,
    recommendation: "Automate",
    rejectionReason: null,
    linkedRunbookId: null,
    linkedWorkerId: null,
    linkedComponentId: null,
    publishedMarketplaceId: null,
    evidence: [],
    createdAt: now,
    updatedAt: now,
    ...r,
  });

  const canonical = base({
    id: "AUT-1042",
    title: "Automate database connection saturation investigation and controlled remediation",
    description:
      "Repeated operator activity: query pg_stat_activity, correlate with checkout-api p95, drain idle connections, and stage read failover. Basis for INC-10482.",
    source: "Incident recurrence",
    frequency: "1.8x / week",
    hoursConsumedMonthly: 9.2,
    manualSteps: 11,
    judgmentRequired: "Medium",
    feasibility: "High",
    risk: "Medium",
    expectedSloImpact: "+0.6pp availability on checkout-api; -8m MTTR",
    incidentRecurrence: 5,
    savings: {
      hoursPerMonth: 9.2,
      loadedHourlyRateUsd: 145,
      automationCoveragePct: 0.72,   // controlled remediation still requires approval
      confidence: 0.78,              // calibrated from prior similar runbooks
      sourceRecords: ["INC-10482", "INC-10399", "INC-10310", "EXE-8841", "OP-QUEUE-2214"],
      assumptions: [
        "Investigation is fully automatable; remediation requires approval (L2).",
        "Loaded rate uses tenant compensation model (SRE III, US).",
        "Coverage excludes tenant-specific escalation branches.",
        "Confidence reflects trailing 6-month acceptance of similar recommendations (0.74) adjusted for INC-10482 lessons.",
      ],
    },
    status: "New candidate",
    services: ["checkout-api", "orders-api"],
    evidence: [
      { kind: "incident",  id: "INC-10482", label: "Checkout DB saturation (Sev-2)" },
      { kind: "incident",  id: "INC-10399", label: "Recurring pool exhaustion" },
      { kind: "execution", id: "EXE-8841",  label: "Manual mitigation walk-through" },
      { kind: "handoff",   id: "SH-2044",   label: "Weekly shift handoff notes" },
      { kind: "metric",    id: "MTR-9912",  label: "connections.in_use p99" },
    ],
  });

  return [
    canonical,
    base({
      id: "AUT-1043",
      title: "Auto-open ticket for expired TLS certificate warnings",
      description: "Operators triage the same synthetic monitor each week and open a ticket. Ticket creation is the automatable step.",
      source: "Operator activity",
      frequency: "2x / week",
      hoursConsumedMonthly: 3.1,
      manualSteps: 4,
      judgmentRequired: "Low",
      feasibility: "High",
      risk: "Low",
      expectedSloImpact: "Prevents 1-2 cert-related outages per quarter",
      incidentRecurrence: 2,
      savings: {
        hoursPerMonth: 3.1, loadedHourlyRateUsd: 145, automationCoveragePct: 0.9, confidence: 0.82,
        sourceRecords: ["OP-QUEUE-1990", "OP-QUEUE-2001", "OP-QUEUE-2088"],
        assumptions: ["Runbook already exists; only ticket creation is manual."],
      },
      status: "In engineering",
      services: ["edge-gateway"],
      ownerName: "Priya S.", ownerTeam: "Platform Reliability",
      linkedRunbookId: "RB-0044",
      evidence: [{ kind: "runbook", id: "RB-0044", label: "TLS Expiry Guard" }],
    }),
    base({
      id: "AUT-1044",
      title: "Reset flaky staging test data nightly",
      description: "Requires human judgement on which fixtures to preserve; better solved by design change.",
      source: "Runbook telemetry",
      frequency: "Daily",
      hoursConsumedMonthly: 6.4,
      manualSteps: 8,
      judgmentRequired: "High",
      feasibility: "Medium",
      risk: "Medium",
      expectedSloImpact: "No prod SLO impact",
      incidentRecurrence: 0,
      savings: {
        hoursPerMonth: 6.4, loadedHourlyRateUsd: 120, automationCoveragePct: 0.4, confidence: 0.55,
        sourceRecords: ["EXE-7712", "EXE-7789"],
        assumptions: ["Root cause is fixture design; recommend elimination not automation."],
      },
      status: "New candidate",
      services: ["orders-api"],
      recommendation: "Eliminate by design",
      evidence: [{ kind: "execution", id: "EXE-7712", label: "Fixture reset run" }],
    }),
    base({
      id: "AUT-1045",
      title: "Publish weekly reliability digest",
      description: "Runbook already published from a prior candidate; benefit still needs measurement window.",
      source: "User submitted",
      frequency: "Weekly",
      hoursConsumedMonthly: 2.0,
      manualSteps: 5,
      judgmentRequired: "Low",
      feasibility: "High",
      risk: "Low",
      expectedSloImpact: "Improves stakeholder trust signal (qualitative)",
      incidentRecurrence: 0,
      savings: {
        hoursPerMonth: 2.0, loadedHourlyRateUsd: 145, automationCoveragePct: 0.95, confidence: 0.7,
        sourceRecords: ["OP-QUEUE-2100"],
        assumptions: ["Excludes qualitative benefit."],
      },
      status: "Published",
      services: ["platform"],
      ownerName: "Dana K.", ownerTeam: "Incident Response",
      linkedRunbookId: "RB-0055",
      publishedMarketplaceId: "MP-3011",
      evidence: [{ kind: "runbook", id: "RB-0055", label: "Weekly Reliability Digest" }],
    }),
    base({
      id: "AUT-1046",
      title: "Rotate stale feature flag on payments-api",
      description: "One-off cleanup; not a recurring toil pattern.",
      source: "Operator activity",
      frequency: "1x / quarter",
      hoursConsumedMonthly: 0.3,
      manualSteps: 3,
      judgmentRequired: "Medium",
      feasibility: "High",
      risk: "Low",
      expectedSloImpact: "None",
      incidentRecurrence: 0,
      savings: {
        hoursPerMonth: 0.3, loadedHourlyRateUsd: 145, automationCoveragePct: 0.8, confidence: 0.4,
        sourceRecords: ["OP-QUEUE-1877"],
        assumptions: ["Frequency too low to justify automation cost."],
      },
      status: "Rejected",
      services: ["payments-api"],
      rejectionReason: "Insufficient recurrence to justify build cost.",
      evidence: [{ kind: "handoff", id: "SH-1990", label: "Handoff mention" }],
    }),
    base({
      id: "AUT-1047",
      title: "Nightly cache warm for orders-api regional failover",
      description: "Consistently measured benefit after 30-day window.",
      source: "Runbook telemetry",
      frequency: "Nightly",
      hoursConsumedMonthly: 5.2,
      manualSteps: 6,
      judgmentRequired: "Low",
      feasibility: "High",
      risk: "Low",
      expectedSloImpact: "+0.3pp availability on orders-api during regional failover",
      incidentRecurrence: 1,
      savings: {
        hoursPerMonth: 5.2, loadedHourlyRateUsd: 145, automationCoveragePct: 0.9, confidence: 0.86,
        sourceRecords: ["EXE-8600", "EXE-8611", "EXE-8622"],
        assumptions: ["Coverage measured across last 3 executions."],
      },
      status: "Benefit verified",
      services: ["orders-api"],
      ownerName: "Marco T.", ownerTeam: "Change Management",
      linkedRunbookId: "RB-0060",
      publishedMarketplaceId: "MP-3020",
      evidence: [{ kind: "execution", id: "EXE-8600", label: "Cache warm run" }],
    }),
    base({
      id: "AUT-1048",
      title: "Auto-scale prometheus write replicas at ingestion spikes",
      description: "Superseded by managed autoscaler; retire prior automation.",
      source: "Shift handoff",
      frequency: "Occasional",
      hoursConsumedMonthly: 1.2,
      manualSteps: 4,
      judgmentRequired: "Low",
      feasibility: "High",
      risk: "Low",
      expectedSloImpact: "Neutral",
      incidentRecurrence: 0,
      savings: {
        hoursPerMonth: 1.2, loadedHourlyRateUsd: 145, automationCoveragePct: 0.9, confidence: 0.75,
        sourceRecords: ["OP-QUEUE-2050"],
        assumptions: ["Replaced by platform capability."],
      },
      status: "Retired",
      services: ["platform"],
      ownerName: "Priya S.", ownerTeam: "Platform Reliability",
      linkedRunbookId: "RB-0037",
      evidence: [{ kind: "runbook", id: "RB-0037", label: "Prom Write Scaler" }],
    }),
  ];
}

function seedMarketplace(): MarketplaceItem[] {
  return [
    {
      id: "MP-3011", title: "Weekly Reliability Digest",
      summary: "Publishes evidence-linked digest per service. Bring-your-own comms channel.",
      kind: "Runbook", version: "1.2.0", publisher: "NOVA Platform",
      autonomy: "L1", ratingCalibrated: 0.86, installs: 14,
      installedForServices: ["checkout-api", "orders-api"], candidateId: "AUT-1045",
      createdAt: inDays(-42),
    },
    {
      id: "MP-3020", title: "Orders Cache Warm — Golden Path",
      summary: "Nightly cache warm with regional readiness gates. Ships with rollback probe.",
      kind: "Golden Path", version: "2.0.1", publisher: "NOVA Platform",
      autonomy: "L2", ratingCalibrated: 0.91, installs: 8,
      installedForServices: ["orders-api"], candidateId: "AUT-1047",
      createdAt: inDays(-30),
    },
    {
      id: "MP-3030", title: "DB Connection Diagnoser",
      summary: "Investigation-only worker. Correlates pool metrics with request p95.",
      kind: "Digital Worker", version: "0.9.0", publisher: "NOVA Platform",
      autonomy: "L1", ratingCalibrated: 0.74, installs: 3,
      installedForServices: [], candidateId: null,
      createdAt: inDays(-10),
    },
    {
      id: "MP-3040", title: "Approval-Gated Rollback Component",
      summary: "Reusable rollback step with policy-required approval and evidence pinning.",
      kind: "Reusable Component", version: "1.4.2", publisher: "NOVA Platform",
      autonomy: "L2", ratingCalibrated: 0.88, installs: 21,
      installedForServices: ["checkout-api", "payments-api", "orders-api"], candidateId: null,
      createdAt: inDays(-75),
    },
  ];
}

function seedBenefits(): BenefitRecord[] {
  return [
    {
      id: "BEN-7001", candidateId: "AUT-1045",
      observedHoursSavedMonthly: null,
      observedSloDelta: null, observedIncidentReduction: null,
      measurementWindowDays: 14,
      status: "Unverified",
      method: "Comparing baseline weekly hours to post-publish operator survey; 30-day window required.",
      sourceRecords: ["OP-QUEUE-2100", "OP-QUEUE-2166"],
      updatedAt: inDays(-4),
    },
    {
      id: "BEN-7002", candidateId: "AUT-1047",
      observedHoursSavedMonthly: 4.6,
      observedSloDelta: "+0.28pp availability",
      observedIncidentReduction: 1,
      measurementWindowDays: 30,
      status: "Verified",
      method: "Compared trailing 30-day operator activity + SLO windows against pre-publish baseline.",
      sourceRecords: ["EXE-8600", "EXE-8611", "EXE-8622", "SLO-orders-api-availability"],
      updatedAt: inDays(-2),
    },
  ];
}

function seedRetired(): RetiredRecord[] {
  return [
    {
      id: "RET-4001", candidateId: "AUT-1048",
      retiredAt: inDays(-5),
      reason: "Replaced by managed autoscaler; residual manual work eliminated.",
      dependentRunbookIds: ["RB-0037"],
      dependentServices: ["platform"],
    },
  ];
}

/* --------------------------- Tone helpers ------------------------------- */

function statusTone(s: CandidateStatus): string {
  switch (s) {
    case "New candidate":      return "bg-slate-50 text-slate-800 border-slate-200";
    case "Accepted":           return "bg-sky-50 text-sky-800 border-sky-200";
    case "Rejected":           return "bg-rose-50 text-rose-800 border-rose-200";
    case "In engineering":     return "bg-blue-50 text-blue-800 border-blue-200";
    case "Published":          return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Benefit unverified": return "bg-amber-50 text-amber-800 border-amber-200";
    case "Benefit verified":   return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "Retired":            return "bg-slate-100 text-slate-600 border-slate-300";
  }
}
function riskTone(r: Risk): string {
  return r === "High" ? "bg-rose-50 text-rose-800 border-rose-200"
       : r === "Medium" ? "bg-amber-50 text-amber-800 border-amber-200"
       : "bg-emerald-50 text-emerald-800 border-emerald-200";
}
function recTone(r: Recommendation): string {
  switch (r) {
    case "Automate":            return "bg-sky-50 text-sky-800 border-sky-200";
    case "Eliminate by design": return "bg-violet-50 text-violet-800 border-violet-200";
    case "Simplify process":    return "bg-amber-50 text-amber-800 border-amber-200";
    case "Insufficient signal": return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

/* -------------------------------- Page ---------------------------------- */

type TabKey =
  | "toil"
  | "candidates"
  | "backlog"
  | "golden"
  | "marketplace"
  | "benefits"
  | "retired";

type DialogKey =
  | null
  | "accept"
  | "reject"
  | "assign"
  | "runbook"
  | "worker"
  | "component"
  | "publish"
  | "install"
  | "compare"
  | "benefit"
  | "retire"
  | "detail";

export default function AutomationRegistry() {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>([]);
  const [benefits, setBenefits] = useState<BenefitRecord[]>([]);
  const [retired, setRetired] = useState<RetiredRecord[]>([]);
  const [tab, setTab] = useState<TabKey>("toil");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | Source>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CandidateStatus>("all");
  const [feasFilter, setFeasFilter] = useState<"all" | Feasibility>("all");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [target, setTarget] = useState<string>("");
  const [compareSel, setCompareSel] = useState<string[]>([]);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [connectorDown, setConnectorDown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* ---------------------------- Load / seed --------------------------- */
  useEffect(() => {
    try {
      let cs = readList<Candidate>(CAND_KEY);
      if (cs.length === 0) { cs = seedCandidates(); writeList(CAND_KEY, cs); }
      // Re-classify on load (drives recommendation column)
      cs = cs.map((c) => ({ ...c, recommendation: c.rejectionReason ? c.recommendation : classify(c) }));
      setCandidates(cs);

      let mp = readList<MarketplaceItem>(MP_KEY);
      if (mp.length === 0) { mp = seedMarketplace(); writeList(MP_KEY, mp); }
      setMarketplace(mp);

      let bn = readList<BenefitRecord>(BEN_KEY);
      if (bn.length === 0) { bn = seedBenefits(); writeList(BEN_KEY, bn); }
      setBenefits(bn);

      let rt = readList<RetiredRecord>(RET_KEY);
      if (rt.length === 0) { rt = seedRetired(); writeList(RET_KEY, rt); }
      setRetired(rt);

      setLoading(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load automation registry.");
      setLoading(false);
    }
  }, []);

  /* ----------------------------- Helpers ------------------------------ */

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({
      kind, title, detail,
      entityRef: entityRef ?? "automation.registry",
      route: "/runops/automation",
    });
  }, [ops]);

  const persistCandidates = useCallback((next: Candidate[]) => {
    writeList(CAND_KEY, next);
    setCandidates(next);
  }, []);
  const persistMarketplace = useCallback((next: MarketplaceItem[]) => {
    writeList(MP_KEY, next);
    setMarketplace(next);
  }, []);
  const persistBenefits = useCallback((next: BenefitRecord[]) => {
    writeList(BEN_KEY, next);
    setBenefits(next);
  }, []);
  const persistRetired = useCallback((next: RetiredRecord[]) => {
    writeList(RET_KEY, next);
    setRetired(next);
  }, []);

  const updateCandidate = useCallback((id: string, patch: Partial<Candidate>) => {
    const next = candidates.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c));
    persistCandidates(next);
    return next.find((c) => c.id === id) ?? null;
  }, [candidates, persistCandidates]);

  /* ---------------------- Filters and derived views -------------------- */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (feasFilter !== "all" && c.feasibility !== feasFilter) return false;
      if (q &&
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q) &&
        !c.id.toLowerCase().includes(q) &&
        !c.services.join(" ").toLowerCase().includes(q)
      ) return false;
      return true;
    });
  }, [candidates, query, sourceFilter, statusFilter, feasFilter]);

  const toilOnly = useMemo(() =>
    filtered.filter((c) => c.status === "New candidate" || c.status === "Rejected"),
  [filtered]);

  const acceptedOrLater = useMemo(() =>
    filtered.filter((c) =>
      c.status === "Accepted" || c.status === "In engineering" ||
      c.status === "Published" || c.status === "Benefit unverified" ||
      c.status === "Benefit verified"),
  [filtered]);

  const backlog = useMemo(() =>
    filtered.filter((c) => c.status === "Accepted" || c.status === "In engineering"),
  [filtered]);

  const golden = useMemo(() =>
    marketplace.filter((m) => m.kind === "Golden Path"),
  [marketplace]);

  const retiredView = useMemo(() =>
    filtered.filter((c) => c.status === "Retired"),
  [filtered]);

  /* --------------------------- Metrics --------------------------------- */

  const metrics = useMemo(() => {
    const totalHours = candidates.reduce((a, c) => a + c.hoursConsumedMonthly, 0);
    const potentialSavings = candidates
      .filter((c) => c.status !== "Rejected" && c.status !== "Retired" && c.recommendation === "Automate")
      .reduce((a, c) => a + monthlyUsdSavings(c.savings), 0);
    const verified = benefits.filter((b) => b.status === "Verified");
    const verifiedHours = verified.reduce((a, b) => a + (b.observedHoursSavedMonthly ?? 0), 0);
    const published = candidates.filter((c) => c.status === "Published" || c.status === "Benefit verified" || c.status === "Benefit unverified").length;
    const inEngineering = candidates.filter((c) => c.status === "In engineering").length;
    return { totalHours, potentialSavings, verifiedHours, published, inEngineering };
  }, [candidates, benefits]);

  /* --------------------------- Actions -------------------------------- */

  const openDialog = (k: DialogKey, id: string = "") => { setTarget(id); setInp({}); setDialog(k); };
  const closeDialog = () => { setDialog(null); setTarget(""); setInp({}); };

  const doAccept = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    updateCandidate(c.id, { status: "Accepted", ownerName: inp.owner || c.ownerName, ownerTeam: inp.team || c.ownerTeam });
    audit("Candidate accepted", `${c.id} moved to Accepted; recommendation: ${c.recommendation}.`, "info", c.id);
    closeDialog();
  };

  const doReject = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    if (!(inp.reason ?? "").trim()) return;
    updateCandidate(c.id, { status: "Rejected", rejectionReason: inp.reason });
    audit("Candidate rejected", `${c.id} rejected: ${inp.reason}.`, "warning", c.id);
    closeDialog();
  };

  const doAssign = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    if (!(inp.owner ?? "").trim()) return;
    updateCandidate(c.id, { ownerName: inp.owner, ownerTeam: inp.team || c.ownerTeam });
    audit("Owner assigned", `${c.id} → ${inp.owner}${inp.team ? ` (${inp.team})` : ""}.`, "info", c.id);
    closeDialog();
  };

  const doCreateRunbook = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    const rbId = rid("RB");
    const drafts = readList<{ id: string; title: string; source: string; candidateId: string; createdAt: string }>(DRAFT_KEY);
    drafts.unshift({ id: rbId, title: `Runbook: ${c.title}`, source: "automation.candidate", candidateId: c.id, createdAt: nowIso() });
    writeList(DRAFT_KEY, drafts);
    updateCandidate(c.id, { status: "In engineering", linkedRunbookId: rbId });
    audit("Runbook draft created", `${rbId} created from ${c.id}; opening wizard with candidate context.`, "info", c.id);
    closeDialog();
    navigate(`/runops/runbooks/new?candidate=${c.id}&draft=${rbId}`);
  };

  const doCreateWorkerTask = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    const wId = rid("DW");
    updateCandidate(c.id, { status: "In engineering", linkedWorkerId: wId });
    audit("Digital worker task drafted", `${wId} scoped from ${c.id}.`, "info", c.id);
    closeDialog();
  };

  const doCreateComponent = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    const cId = rid("CMP");
    updateCandidate(c.id, { status: "In engineering", linkedComponentId: cId });
    audit("Reusable component drafted", `${cId} from ${c.id}.`, "info", c.id);
    closeDialog();
  };

  const doPublish = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    if (connectorDown) return;
    // Least-privilege: cannot publish unless owner assigned + engineering complete
    if (!c.ownerName || (c.status !== "In engineering" && c.status !== "Accepted")) return;
    const mpId = rid("MP");
    const item: MarketplaceItem = {
      id: mpId, title: c.title, summary: c.description,
      kind: c.linkedWorkerId ? "Digital Worker" : c.linkedComponentId ? "Reusable Component" : "Runbook",
      version: "1.0.0", publisher: `${c.ownerTeam ?? "Owner"} · ${c.ownerName ?? "Owner"}`,
      autonomy: "L1", ratingCalibrated: c.savings.confidence, installs: 0,
      installedForServices: [], candidateId: c.id, createdAt: nowIso(),
    };
    persistMarketplace([item, ...marketplace]);
    updateCandidate(c.id, { status: "Published", publishedMarketplaceId: mpId });
    const bn: BenefitRecord = {
      id: rid("BEN"), candidateId: c.id,
      observedHoursSavedMonthly: null, observedSloDelta: null, observedIncidentReduction: null,
      measurementWindowDays: 30, status: "Unverified",
      method: "Awaiting 30-day post-publish measurement window before verification.",
      sourceRecords: c.savings.sourceRecords, updatedAt: nowIso(),
    };
    persistBenefits([bn, ...benefits]);
    audit("Automation published", `${c.id} published as ${mpId}; benefit tracking created (${bn.id}).`, "info", c.id);
    closeDialog();
  };

  const doInstall = () => {
    const m = marketplace.find((x) => x.id === target); if (!m) return;
    const svc = inp.service || (ops.selectedService?.id ?? "checkout-api");
    if (!m.installedForServices.includes(svc)) {
      const next = marketplace.map((x) => x.id === m.id
        ? { ...x, installs: x.installs + 1, installedForServices: [...x.installedForServices, svc] }
        : x);
      persistMarketplace(next);
    }
    // Cross-screen: create service readiness + ownership tasks
    const tasks = readList<{ id: string; svc: string; title: string; source: string; createdAt: string }>(TASKS_KEY);
    tasks.unshift(
      { id: rid("TASK"), svc, title: `Readiness check for ${m.title}`, source: m.id, createdAt: nowIso() },
      { id: rid("TASK"), svc, title: `Confirm owner for ${m.title}`,   source: m.id, createdAt: nowIso() },
    );
    writeList(TASKS_KEY, tasks);
    audit("Marketplace install", `${m.id} installed for ${svc}; readiness + ownership tasks created.`, "info", m.id);
    closeDialog();
  };

  const doTrackBenefit = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    const existing = benefits.find((b) => b.candidateId === c.id);
    const hours = Number(inp.hours);
    const status: BenefitRecord["status"] = inp.status === "Verified" ? "Verified" : inp.status === "Regression" ? "Regression" : "Unverified";
    const rec: BenefitRecord = existing
      ? { ...existing, observedHoursSavedMonthly: Number.isFinite(hours) ? hours : existing.observedHoursSavedMonthly, observedSloDelta: inp.slo || existing.observedSloDelta, status, updatedAt: nowIso() }
      : {
          id: rid("BEN"), candidateId: c.id,
          observedHoursSavedMonthly: Number.isFinite(hours) ? hours : null,
          observedSloDelta: inp.slo || null, observedIncidentReduction: null,
          measurementWindowDays: 30, status, method: inp.method || "Manual measurement",
          sourceRecords: c.savings.sourceRecords, updatedAt: nowIso(),
        };
    const next = existing ? benefits.map((b) => b.id === existing.id ? rec : b) : [rec, ...benefits];
    persistBenefits(next);
    updateCandidate(c.id, { status: status === "Verified" ? "Benefit verified" : "Benefit unverified" });
    audit("Benefit tracked", `${c.id} benefit ${status}${Number.isFinite(hours) ? ` (${hours}h/mo)` : ""}.`, "info", c.id);
    closeDialog();
  };

  const doRetire = () => {
    const c = candidates.find((x) => x.id === target); if (!c) return;
    // Identify dependents (linked runbook + services from candidate)
    const dependents: string[] = c.linkedRunbookId ? [c.linkedRunbookId] : [];
    const rec: RetiredRecord = {
      id: rid("RET"), candidateId: c.id, retiredAt: nowIso(),
      reason: inp.reason || "Retired without stated reason (recorded for audit).",
      dependentRunbookIds: dependents, dependentServices: c.services,
    };
    persistRetired([rec, ...retired]);
    updateCandidate(c.id, { status: "Retired" });
    audit("Automation retired", `${c.id} retired; dependents: ${[...dependents, ...c.services].join(", ") || "none"}.`, "warning", c.id);
    closeDialog();
  };

  const toggleCompare = (id: string) => {
    setCompareSel((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s);
  };

  /* -------------------------- Render helpers --------------------------- */

  const CandRow = (c: Candidate, showCompare = false) => {
    const savings = monthlyUsdSavings(c.savings);
    return (
      <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50/60">
        <td className="px-3 py-2 align-top">
          <div className="flex items-start gap-2">
            {showCompare && (
              <input
                type="checkbox"
                aria-label={`Compare ${c.id}`}
                checked={compareSel.includes(c.id)}
                onChange={() => toggleCompare(c.id)}
                className="mt-1"
              />
            )}
            <div>
              <button
                className="text-left font-medium text-slate-900 hover:underline"
                onClick={() => openDialog("detail", c.id)}
              >
                {c.title}
              </button>
              <div className="text-xs text-slate-500 mt-0.5">{c.id} · {c.services.join(", ") || "—"}</div>
            </div>
          </div>
        </td>
        <td className="px-3 py-2 align-top text-sm text-slate-700">{c.source}</td>
        <td className="px-3 py-2 align-top text-sm text-slate-700">{c.frequency}</td>
        <td className="px-3 py-2 align-top text-sm text-slate-700 tabular-nums">{c.hoursConsumedMonthly.toFixed(1)}h</td>
        <td className="px-3 py-2 align-top"><Badge variant="outline" className={cn("text-xs", riskTone(c.risk))}>{c.risk}</Badge></td>
        <td className="px-3 py-2 align-top text-sm text-slate-700">{c.feasibility}</td>
        <td className="px-3 py-2 align-top"><Badge variant="outline" className={cn("text-xs", recTone(c.recommendation))}>{c.recommendation}</Badge></td>
        <td className="px-3 py-2 align-top tabular-nums text-sm text-slate-900">{usd(savings)}<div className="text-[10px] text-slate-500">/mo · conf {pct(c.savings.confidence)}</div></td>
        <td className="px-3 py-2 align-top"><Badge variant="outline" className={cn("text-xs", statusTone(c.status))}>{c.status}</Badge></td>
        <td className="px-3 py-2 align-top text-right whitespace-nowrap">
          <Button size="sm" variant="ghost" onClick={() => openDialog("detail", c.id)} aria-label={`Open ${c.id}`}>
            Open <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </td>
      </tr>
    );
  };

  const Table = ({ rows, showCompare = false, empty }: { rows: Candidate[]; showCompare?: boolean; empty: string }) => (
    <div className="overflow-x-auto border rounded-md bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Candidate</th>
            <th className="px-3 py-2 text-left font-medium">Source</th>
            <th className="px-3 py-2 text-left font-medium">Frequency</th>
            <th className="px-3 py-2 text-left font-medium">Hours/mo</th>
            <th className="px-3 py-2 text-left font-medium">Risk</th>
            <th className="px-3 py-2 text-left font-medium">Feasibility</th>
            <th className="px-3 py-2 text-left font-medium">Recommendation</th>
            <th className="px-3 py-2 text-left font-medium">Est. savings</th>
            <th className="px-3 py-2 text-left font-medium">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={10} className="px-3 py-8 text-center text-sm text-slate-500">{empty}</td></tr>
            : rows.map((c) => CandRow(c, showCompare))}
        </tbody>
      </table>
    </div>
  );

  const targetCandidate = candidates.find((c) => c.id === target) ?? null;
  const targetMarketplace = marketplace.find((m) => m.id === target) ?? null;

  /* ------------------------------- UI --------------------------------- */

  if (loading) {
    return (
      <div className="p-6">
        <EntityHeader title="Toil Discovery, Automation Backlog & Marketplace" subtitle="Loading automation registry…" />
        <div className="mt-6 text-sm text-slate-500 flex items-center gap-2"><Timer className="h-4 w-4 animate-pulse" /> Loading…</div>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="p-6">
        <EntityHeader title="Toil Discovery, Automation Backlog & Marketplace" subtitle="Failed to load" />
        <Card className="mt-6 border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <div>
              <div className="font-medium">Could not load automation registry.</div>
              <div className="text-rose-700/80 mt-1">{loadError}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EntityHeader
        title="Toil Discovery, Automation Backlog & Marketplace"
        subtitle="Move observed toil into governed, reusable operational capabilities."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{candidates.length} candidates</Badge>
            <Badge variant="outline">{metrics.inEngineering} in engineering</Badge>
            <Badge variant="outline">{metrics.published} published</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm" variant="outline"
              onClick={() => setConnectorDown((v) => !v)}
              aria-pressed={connectorDown}
              title="Simulate marketplace connector state"
            >
              {connectorDown ? "Connector: Down" : "Connector: OK"}
            </Button>
            <Button
              size="sm" variant="outline"
              disabled={!canWrite || compareSel.length < 2}
              onClick={() => openDialog("compare")}
              aria-label="Compare alternatives"
            >
              <Scale className="h-4 w-4 mr-1" /> Compare ({compareSel.length})
            </Button>
            <Button
              size="sm"
              disabled={!canWrite}
              onClick={() => {
                const c: Candidate = {
                  id: rid("AUT"),
                  title: "New candidate — describe observed toil",
                  description: "",
                  source: "User submitted",
                  frequency: "TBD",
                  hoursConsumedMonthly: 0,
                  manualSteps: 0,
                  judgmentRequired: "Low",
                  feasibility: "Medium",
                  risk: "Low",
                  expectedSloImpact: "TBD",
                  incidentRecurrence: 0,
                  savings: { hoursPerMonth: 0, loadedHourlyRateUsd: 145, automationCoveragePct: 0, confidence: 0, sourceRecords: [], assumptions: ["Requires source records before savings are computed."] },
                  ownerName: null, ownerTeam: null,
                  status: "New candidate",
                  recommendation: "Insufficient signal",
                  rejectionReason: null, linkedRunbookId: null, linkedWorkerId: null, linkedComponentId: null,
                  publishedMarketplaceId: null, evidence: [], services: [],
                  createdAt: nowIso(), updatedAt: nowIso(),
                };
                persistCandidates([c, ...candidates]);
                audit("Candidate submitted", `${c.id} submitted for review.`, "info", c.id);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> New candidate
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            You have <strong className="mx-1">read-only</strong> access. Mutations are disabled.
          </CardContent>
        </Card>
      )}
      {connectorDown && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-3 text-sm text-rose-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Marketplace connector is <strong className="mx-1">unavailable</strong>. Publishing and installs are blocked.
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <MetricCard icon={<Clock className="h-4 w-4" />} label="Observed toil / mo" value={`${metrics.totalHours.toFixed(1)}h`} sub="Sum of hours consumed across candidates" />
        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Potential savings / mo" value={usd(metrics.potentialSavings)} sub="Automate-recommended · not fabricated" />
        <MetricCard icon={<BadgeCheck className="h-4 w-4" />} label="Verified hours saved" value={`${metrics.verifiedHours.toFixed(1)}h`} sub="From benefit realization" />
        <MetricCard icon={<Rocket className="h-4 w-4" />} label="Published" value={`${metrics.published}`} sub="Live in marketplace" />
        <MetricCard icon={<Wrench className="h-4 w-4" />} label="In engineering" value={`${metrics.inEngineering}`} sub="Backlog under active build" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2 top-2.5 text-slate-400" />
          <Input
            className="pl-8 w-64"
            placeholder="Search title, service, id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search candidates"
          />
        </div>
        <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as "all" | Source)}>
          <SelectTrigger className="w-44" aria-label="Filter by source"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="Operator activity">Operator activity</SelectItem>
            <SelectItem value="Incident recurrence">Incident recurrence</SelectItem>
            <SelectItem value="Runbook telemetry">Runbook telemetry</SelectItem>
            <SelectItem value="User submitted">User submitted</SelectItem>
            <SelectItem value="Shift handoff">Shift handoff</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | CandidateStatus)}>
          <SelectTrigger className="w-44" aria-label="Filter by status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(["New candidate","Accepted","Rejected","In engineering","Published","Benefit unverified","Benefit verified","Retired"] as CandidateStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={feasFilter} onValueChange={(v) => setFeasFilter(v as "all" | Feasibility)}>
          <SelectTrigger className="w-40" aria-label="Filter by feasibility"><SelectValue placeholder="Feasibility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any feasibility</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-slate-500 ml-2 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5" /> {filtered.length} match
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="toil"><Search className="h-3.5 w-3.5 mr-1" />Toil Discovery</TabsTrigger>
          <TabsTrigger value="candidates"><Sparkles className="h-3.5 w-3.5 mr-1" />Automation Candidates</TabsTrigger>
          <TabsTrigger value="backlog"><ClipboardList className="h-3.5 w-3.5 mr-1" />Backlog</TabsTrigger>
          <TabsTrigger value="golden"><GitBranch className="h-3.5 w-3.5 mr-1" />Golden Paths</TabsTrigger>
          <TabsTrigger value="marketplace"><Store className="h-3.5 w-3.5 mr-1" />Marketplace</TabsTrigger>
          <TabsTrigger value="benefits"><BadgeCheck className="h-3.5 w-3.5 mr-1" />Benefits</TabsTrigger>
          <TabsTrigger value="retired"><Ban className="h-3.5 w-3.5 mr-1" />Retired</TabsTrigger>
        </TabsList>

        <TabsContent value="toil" className="mt-4 space-y-3">
          <Card><CardContent className="p-3 text-sm text-slate-700 flex items-start gap-2">
            <Layers className="h-4 w-4 mt-0.5 text-slate-500" />
            <div>Toil Discovery groups observed repetitive work. Not every item should be automated — some are better <em>eliminated by design</em> or <em>simplified</em>.
              Recommendations are computed from judgment, feasibility, and calibrated confidence in observed savings.</div>
          </CardContent></Card>
          <Table rows={toilOnly} showCompare empty="No new toil candidates." />
        </TabsContent>

        <TabsContent value="candidates" className="mt-4">
          <Table rows={filtered} showCompare empty="No candidates match the current filters." />
        </TabsContent>

        <TabsContent value="backlog" className="mt-4">
          <Table rows={backlog} empty="No accepted work in the backlog." />
        </TabsContent>

        <TabsContent value="golden" className="mt-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {golden.length === 0
              ? <Card><CardContent className="p-6 text-sm text-slate-500">No golden paths published yet.</CardContent></Card>
              : golden.map((g) => <MarketplaceCard key={g.id} m={g} onInstall={() => openDialog("install", g.id)} canWrite={canWrite} connectorDown={connectorDown} />)}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-4">
          {marketplace.length === 0
            ? <Card><CardContent className="p-6 text-sm text-slate-500">Marketplace is empty.</CardContent></Card>
            : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {marketplace.map((m) => (
                  <MarketplaceCard key={m.id} m={m} onInstall={() => openDialog("install", m.id)} canWrite={canWrite} connectorDown={connectorDown} />
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value="benefits" className="mt-4">
          <BenefitsPanel
            benefits={benefits}
            candidates={candidates}
            onTrack={(id) => openDialog("benefit", id)}
            canWrite={canWrite}
          />
        </TabsContent>

        <TabsContent value="retired" className="mt-4 space-y-3">
          <RetiredPanel retired={retired} candidates={candidates} />
          <Table rows={retiredView} empty="No retired candidates in view." />
        </TabsContent>
      </Tabs>

      {/* --------------------------- Detail dialog --------------------------- */}
      <Dialog open={dialog === "detail"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{targetCandidate?.title ?? "Candidate"}</DialogTitle></DialogHeader>
          {targetCandidate && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn(statusTone(targetCandidate.status))}>{targetCandidate.status}</Badge>
                <Badge variant="outline" className={cn(recTone(targetCandidate.recommendation))}>{targetCandidate.recommendation}</Badge>
                <Badge variant="outline" className={cn(riskTone(targetCandidate.risk))}>Risk: {targetCandidate.risk}</Badge>
                <Badge variant="outline">Feasibility: {targetCandidate.feasibility}</Badge>
                <Badge variant="outline">Judgment: {targetCandidate.judgmentRequired}</Badge>
              </div>
              <p className="text-slate-700">{targetCandidate.description || "No description."}</p>

              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Source">{targetCandidate.source}</Field>
                <Field label="Frequency">{targetCandidate.frequency}</Field>
                <Field label="Hours consumed / month">{targetCandidate.hoursConsumedMonthly.toFixed(1)}h</Field>
                <Field label="Manual steps">{targetCandidate.manualSteps}</Field>
                <Field label="Expected SLO impact">{targetCandidate.expectedSloImpact}</Field>
                <Field label="Incident recurrence (90d)">{targetCandidate.incidentRecurrence}</Field>
                <Field label="Services">{targetCandidate.services.join(", ") || "—"}</Field>
                <Field label="Owner">{targetCandidate.ownerName ? `${targetCandidate.ownerName}${targetCandidate.ownerTeam ? ` · ${targetCandidate.ownerTeam}` : ""}` : "Unassigned"}</Field>
              </div>

              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Sparkles className="h-4 w-4 text-sky-600" /> AI recommendation
                  </div>
                  <div className="text-sm">
                    <strong>{targetCandidate.recommendation}</strong>{" "}
                    · confidence <strong>{pct(targetCandidate.savings.confidence)}</strong>
                    {" "}· uncertainty <strong>{pct(Math.max(0, 1 - targetCandidate.savings.confidence))}</strong>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600 mb-1">Assumptions</div>
                    <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                      {targetCandidate.savings.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600 mb-1">Source records</div>
                    <div className="flex flex-wrap gap-1">
                      {targetCandidate.savings.sourceRecords.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600 mb-1">Evidence</div>
                    <div className="space-y-1">
                      {targetCandidate.evidence.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 text-xs text-slate-700">
                          <Badge variant="outline" className="text-[10px]">{e.kind}</Badge>
                          <span className="tabular-nums">{e.id}</span>
                          <span className="text-slate-500">{e.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm bg-slate-50 rounded-md p-2 border">
                    <div className="text-xs text-slate-600 mb-1">Savings calculation</div>
                    <code className="text-xs text-slate-700 whitespace-pre-wrap block">
                      {targetCandidate.savings.hoursPerMonth}h × {usd(targetCandidate.savings.loadedHourlyRateUsd)}/h × {pct(targetCandidate.savings.automationCoveragePct)} coverage × {pct(targetCandidate.savings.confidence)} confidence
                      {"\n"}= <strong>{usd(monthlyUsdSavings(targetCandidate.savings))} / month</strong>
                    </code>
                  </div>
                </CardContent>
              </Card>

              {targetCandidate.rejectionReason && (
                <Card className="border-rose-200 bg-rose-50">
                  <CardContent className="p-3 text-sm text-rose-900">
                    <strong>Rejected:</strong> {targetCandidate.rejectionReason}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate || targetCandidate.status === "Rejected" || targetCandidate.status === "Retired"} onClick={() => { setDialog("accept"); }}>Accept</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate || targetCandidate.status === "Rejected"} onClick={() => { setDialog("reject"); }}>Reject</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate} onClick={() => { setDialog("assign"); }}>Assign owner</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate || targetCandidate.recommendation !== "Automate"} onClick={() => { setDialog("runbook"); }}>Create runbook</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate || targetCandidate.recommendation !== "Automate"} onClick={() => { setDialog("worker"); }}>Digital worker task</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate} onClick={() => { setDialog("component"); }}>Reusable component</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || connectorDown || !targetCandidate || !targetCandidate.ownerName || !(targetCandidate.status === "In engineering" || targetCandidate.status === "Accepted")} onClick={() => { setDialog("publish"); }}>Publish</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate || (targetCandidate.status !== "Published" && targetCandidate.status !== "Benefit unverified" && targetCandidate.status !== "Benefit verified")} onClick={() => { setDialog("benefit"); }}>Track benefit</Button>
              <Button variant="outline" size="sm" disabled={!canWrite || !targetCandidate || targetCandidate.status === "Retired"} onClick={() => { setDialog("retire"); }}>Retire</Button>
              {targetCandidate?.linkedRunbookId && (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/runops/runbooks/${targetCandidate.linkedRunbookId}`)}>
                  Open runbook <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept dialog */}
      <Dialog open={dialog === "accept"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Accept candidate</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Moves <strong>{target}</strong> into the backlog. You can optionally assign an owner now.</p>
            <label className="block text-xs text-slate-600">Owner (optional)</label>
            <Input value={inp.owner ?? ""} onChange={(e) => setInp({ ...inp, owner: e.target.value })} placeholder="Owner name" />
            <label className="block text-xs text-slate-600">Team (optional)</label>
            <Input value={inp.team ?? ""} onChange={(e) => setInp({ ...inp, team: e.target.value })} placeholder="Team" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button onClick={doAccept}><CheckCircle2 className="h-4 w-4 mr-1" />Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={dialog === "reject"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject candidate</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Reason is required for audit.</p>
            <Textarea rows={4} value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} placeholder="Why is this not viable now?" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" disabled={!(inp.reason ?? "").trim()} onClick={doReject}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={dialog === "assign"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign owner</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <Input value={inp.owner ?? ""} onChange={(e) => setInp({ ...inp, owner: e.target.value })} placeholder="Owner name" />
            <Input value={inp.team ?? ""} onChange={(e) => setInp({ ...inp, team: e.target.value })} placeholder="Team" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={!(inp.owner ?? "").trim()} onClick={doAssign}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Runbook / worker / component dialogs */}
      <SimpleConfirm open={dialog === "runbook"} onClose={closeDialog}
        title="Create runbook from candidate"
        body={<>This opens the runbook wizard with candidate <strong>{target}</strong> as context (title, steps, evidence, services).</>}
        confirm="Open wizard" onConfirm={doCreateRunbook} icon={<Play className="h-4 w-4 mr-1" />} />
      <SimpleConfirm open={dialog === "worker"} onClose={closeDialog}
        title="Draft digital-worker task"
        body={<>Creates a scoped digital-worker task from <strong>{target}</strong>. Configure tools + evaluations in the studio.</>}
        confirm="Draft task" onConfirm={doCreateWorkerTask} icon={<Bot className="h-4 w-4 mr-1" />} />
      <SimpleConfirm open={dialog === "component"} onClose={closeDialog}
        title="Create reusable component"
        body={<>Extracts the deterministic portion of <strong>{target}</strong> as a reusable step component.</>}
        confirm="Create component" onConfirm={doCreateComponent} icon={<Package className="h-4 w-4 mr-1" />} />

      {/* Publish dialog */}
      <Dialog open={dialog === "publish"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish to marketplace</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Publishes <strong>{target}</strong> and creates a benefit-tracking record (unverified for 30 days).</p>
            {connectorDown && <div className="text-rose-800 bg-rose-50 border border-rose-200 rounded p-2 text-xs">Connector unavailable — cannot publish.</div>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={connectorDown} onClick={doPublish}><Rocket className="h-4 w-4 mr-1" />Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Install dialog */}
      <Dialog open={dialog === "install"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Install {targetMarketplace?.title ?? "item"}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Creates service readiness + ownership tasks. Configure the target service below.</p>
            <label className="block text-xs text-slate-600">Target service</label>
            <Input
              value={inp.service ?? (ops.selectedService?.id ?? "checkout-api")}
              onChange={(e) => setInp({ ...inp, service: e.target.value })}
              placeholder="service id"
            />
            {connectorDown && <div className="text-rose-800 bg-rose-50 border border-rose-200 rounded p-2 text-xs">Connector unavailable — cannot install.</div>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button disabled={connectorDown} onClick={doInstall}>Install</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Benefit dialog */}
      <Dialog open={dialog === "benefit"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Track benefit</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <label className="block text-xs text-slate-600">Observed hours saved / month</label>
            <Input type="number" value={inp.hours ?? ""} onChange={(e) => setInp({ ...inp, hours: e.target.value })} placeholder="e.g., 4.6" />
            <label className="block text-xs text-slate-600">Observed SLO delta</label>
            <Input value={inp.slo ?? ""} onChange={(e) => setInp({ ...inp, slo: e.target.value })} placeholder="+0.3pp availability" />
            <label className="block text-xs text-slate-600">Method</label>
            <Textarea rows={3} value={inp.method ?? ""} onChange={(e) => setInp({ ...inp, method: e.target.value })} placeholder="How was this measured? Source records?" />
            <label className="block text-xs text-slate-600">Status</label>
            <Select value={inp.status ?? "Unverified"} onValueChange={(v) => setInp({ ...inp, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Unverified">Unverified</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Regression">Regression</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button onClick={doTrackBenefit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retire dialog */}
      <Dialog open={dialog === "retire"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>Retire automation</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>History is preserved. Dependent runbooks and services are listed below.</p>
            <ul className="list-disc pl-5 text-xs text-slate-700">
              {targetCandidate?.linkedRunbookId && <li>Runbook: {targetCandidate.linkedRunbookId}</li>}
              {(targetCandidate?.services ?? []).map((s) => <li key={s}>Service: {s}</li>)}
            </ul>
            <Textarea rows={3} value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} placeholder="Why is this being retired?" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={doRetire}>Retire</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare dialog */}
      <Dialog open={dialog === "compare"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Compare alternatives</DialogTitle></DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left">Attribute</th>
                  {compareSel.map((id) => <th key={id} className="px-2 py-2 text-left">{id}</th>)}
                </tr>
              </thead>
              <tbody>
                {(["title","source","frequency","hoursConsumedMonthly","manualSteps","judgmentRequired","feasibility","risk","incidentRecurrence","recommendation"] as const).map((k) => (
                  <tr key={k} className="border-b last:border-b-0">
                    <td className="px-2 py-1 font-medium text-slate-700">{k}</td>
                    {compareSel.map((id) => {
                      const c = candidates.find((x) => x.id === id);
                      const v = c ? c[k] : "";
                      return <td key={id} className="px-2 py-1 text-slate-700">{String(v ?? "—")}</td>;
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="px-2 py-1 font-medium text-slate-700">est. savings/mo</td>
                  {compareSel.map((id) => {
                    const c = candidates.find((x) => x.id === id);
                    return <td key={id} className="px-2 py-1 text-slate-700 tabular-nums">{c ? usd(monthlyUsdSavings(c.savings)) : "—"}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setCompareSel([]); closeDialog(); }}>Clear</Button>
            <Button variant="outline" onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Sub-components ----------------------------- */

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div>
        <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">{value}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}

function SimpleConfirm({
  open, onClose, title, body, confirm, onConfirm, icon,
}: {
  open: boolean; onClose: () => void; title: string;
  body: React.ReactNode; confirm: string; onConfirm: () => void; icon?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="text-sm text-slate-700">{body}</div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>{icon}{confirm}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MarketplaceCard({
  m, onInstall, canWrite, connectorDown,
}: {
  m: MarketplaceItem; onInstall: () => void; canWrite: boolean; connectorDown: boolean;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium text-slate-900">{m.title}</div>
            <div className="text-xs text-slate-500">{m.id} · {m.kind} · v{m.version}</div>
          </div>
          <Badge variant="outline" className="text-xs">{m.autonomy}</Badge>
        </div>
        <p className="text-xs text-slate-700">{m.summary}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <Badge variant="outline">Rating (calibrated) {Math.round(m.ratingCalibrated * 100)}%</Badge>
          <Badge variant="outline">{m.installs} installs</Badge>
          {m.installedForServices.slice(0, 3).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
        </div>
        <div className="text-[11px] text-slate-500">Publisher: {m.publisher}</div>
        <div className="flex justify-end pt-1">
          <Button size="sm" disabled={!canWrite || connectorDown} onClick={onInstall}>
            <Download className="h-3.5 w-3.5 mr-1" /> Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BenefitsPanel({
  benefits, candidates, onTrack, canWrite,
}: {
  benefits: BenefitRecord[]; candidates: Candidate[];
  onTrack: (id: string) => void; canWrite: boolean;
}) {
  if (benefits.length === 0) {
    return <Card><CardContent className="p-6 text-sm text-slate-500">No benefit tracking yet. Publish a candidate to start a 30-day measurement window.</CardContent></Card>;
  }
  return (
    <div className="overflow-x-auto border rounded-md bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">Candidate</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Hours saved / mo (observed)</th>
            <th className="px-3 py-2 text-left">SLO delta</th>
            <th className="px-3 py-2 text-left">Window</th>
            <th className="px-3 py-2 text-left">Sources</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {benefits.map((b) => {
            const c = candidates.find((x) => x.id === b.candidateId);
            return (
              <tr key={b.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900">{c?.title ?? b.candidateId}</div>
                  <div className="text-xs text-slate-500">{b.candidateId}</div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className={cn("text-xs",
                    b.status === "Verified" ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : b.status === "Regression" ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-amber-50 text-amber-800 border-amber-200")}
                  >{b.status}</Badge>
                </td>
                <td className="px-3 py-2 tabular-nums">{b.observedHoursSavedMonthly ?? "—"}</td>
                <td className="px-3 py-2">{b.observedSloDelta ?? "—"}</td>
                <td className="px-3 py-2">{b.measurementWindowDays}d</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {b.sourceRecords.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => onTrack(b.candidateId)}>
                    Update
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RetiredPanel({ retired, candidates }: { retired: RetiredRecord[]; candidates: Candidate[] }) {
  if (retired.length === 0) {
    return <Card><CardContent className="p-4 text-sm text-slate-500">No retirements recorded.</CardContent></Card>;
  }
  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="text-xs font-medium text-slate-600">Retirement ledger</div>
        <ul className="space-y-2">
          {retired.map((r) => {
            const c = candidates.find((x) => x.id === r.candidateId);
            return (
              <li key={r.id} className="text-sm">
                <div className="font-medium text-slate-900">{c?.title ?? r.candidateId}</div>
                <div className="text-xs text-slate-500">{r.candidateId} · retired {new Date(r.retiredAt).toLocaleDateString()}</div>
                <div className="text-xs text-slate-700 mt-0.5">{r.reason}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.dependentRunbookIds.map((rb) => <Badge key={rb} variant="outline" className="text-[10px]">Runbook: {rb}</Badge>)}
                  {r.dependentServices.map((s) => <Badge key={s} variant="outline" className="text-[10px]">Service: {s}</Badge>)}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
