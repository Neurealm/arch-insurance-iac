/**
 * Page 27 · Investigation Workspace
 * Route: /runops/incidents/:incidentId/investigate  (canonical INC-10482)
 *
 * A shared, evidence-driven technical investigation environment for humans and
 * digital workers. Pins evidence, promotes verified facts, spawns worker
 * tasks, and creates hypotheses linked to the incident record.
 *
 * Persistence:
 *   runops.investigations.v1[incidentId] → InvestigationRecord
 *   runops.diagnostics.v1               (append worker tasks)
 *   runops.incidents.v1[incidentId]     (mutate verifiedFacts + hypotheses)
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * Digital-worker findings expose conclusion, supporting evidence,
 * contradictory evidence, confidence, uncertainty, next test, and sources.
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, BookmarkPlus, Bot, CheckCircle2,
  ClipboardList, Database, ExternalLink, FileText, GitBranch, GitCompare,
  HandHelping, Handshake, Layers, LineChart, Link2, ListTree, Network,
  Pin, Play, Plus, Search, ShieldCheck, Sparkles, Waypoints,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------- Types --------------------------------- */

type EvidenceKind = "metric" | "log" | "trace" | "change" | "config" | "topology" | "prior" | "known-error";
type NoteState = "note" | "verified";
type WorkerState = "queued" | "running" | "complete" | "failed" | "needs-human";

interface Evidence {
  id: string;
  kind: EvidenceKind;
  title: string;
  detail: string;
  timeWindow: string;
  source: string;
  sourceUrl: string;
  pinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  supports?: string;      // hypothesis id it supports
  contradicts?: string;   // hypothesis id it contradicts
}

interface TelemetryPanel {
  id: string;
  title: string;
  metric: string;
  compareA: string;   // "now"
  compareB: string;   // "last week"
  valueA: string;
  valueB: string;
  delta: string;
  tone: "regressed" | "stable" | "improved";
  source: string;
}

interface LogEntry {
  id: string;
  at: string;
  service: string;
  level: "error" | "warn" | "info";
  message: string;
  correlationId?: string;
}

interface TraceRow {
  id: string;
  operation: string;
  totalMs: number;
  dbMs: number;
  network: number;
  errorClass?: string;
  sampleTraceId: string;
}

interface ChangeEntry {
  id: string;
  at: string;
  title: string;
  actor: string;
  scope: string;
  status: "deployed" | "reverted" | "pending";
}

interface ConfigDiff {
  key: string;
  before: string;
  after: string;
  by: string;
}

interface TopologyEdge {
  from: string;
  to: string;
  edge: "sync" | "async" | "storage";
  saturationPct: number;
}

interface PriorIncident {
  id: string;
  title: string;
  when: string;
  outcome: string;
  similarity: number;
}

interface KnownError {
  id: string;
  title: string;
  match: number;
  workaround: string;
  runbookId: string;
}

interface WorkerTask {
  id: string;
  worker: string;              // DW-DB-03
  component: string;           // checkout-db-01
  question: string;
  state: WorkerState;
  createdAt: string;
  finding?: WorkerFinding;
}

interface WorkerFinding {
  conclusion: string;
  supporting: string[];
  contradictory: string[];
  confidence: number;      // 0-100
  uncertainty: string;
  nextTest: string;
  sources: { label: string; url: string }[];
}

interface Note {
  id: string;
  at: string;
  by: string;
  text: string;
  state: NoteState;
  bookmark?: boolean;
  evidenceIds: string[];
}

interface Query {
  id: string;
  label: string;
  language: "SQL" | "PromQL" | "TraceQL" | "LogQL";
  text: string;
  savedBy: string;
}

interface HandoffTask {
  id: string;
  to: string;
  summary: string;
  createdAt: string;
}

interface InvestigationRecord {
  incidentId: string;
  createdAt: string;
  updatedAt: string;
  queries: Query[];
  activeQueryId: string;
  compareA: string;
  compareB: string;
  telemetry: TelemetryPanel[];
  logs: LogEntry[];
  traces: TraceRow[];
  changes: ChangeEntry[];
  configDiffs: ConfigDiff[];
  topology: TopologyEdge[];
  priors: PriorIncident[];
  knownErrors: KnownError[];
  workers: WorkerTask[];
  evidence: Evidence[];
  notes: Note[];
  handoffs: HandoffTask[];
  sourceUnavailable: string[];   // panel ids currently offline
  stage: number;                 // progression counter 0..3
}

interface IncidentHypothesis {
  id: string;
  text: string;
  confidence: number;
  state: "Proposed" | "Investigating" | "Confirmed" | "Rejected";
  supporting: string[];
  contradictory: string[];
  createdAt: string;
}

interface IncidentRecordShape {
  incidentId: string;
  verifiedFacts: string[];
  hypotheses: IncidentHypothesis[];
  updatedAt: string;
  [k: string]: unknown;
}

interface StoredDiagnostic {
  id: string;
  incidentId?: string;
  alertId?: string;
  worker: string;
  component: string;
  question: string;
  state: string;
  createdAt: string;
}

/* ------------------------------ Storage --------------------------------- */

const INVESTIGATIONS_KEY = "runops.investigations.v1";
const INCIDENTS_KEY      = "runops.incidents.v1";
const DIAGNOSTICS_KEY    = "runops.diagnostics.v1";

function readMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, T>) : {};
  } catch { return {}; }
}
function writeMap<T>(key: string, map: Record<string, T>) {
  localStorage.setItem(key, JSON.stringify(map));
}
function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch { return []; }
}
function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* -------------------------------- Seed ---------------------------------- */

function seedInvestigation(incidentId: string, serviceId: string): InvestigationRecord {
  const now = new Date();
  const iso = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

  const evidenceSeed: Evidence[] = [
    {
      id: rid("EV"), kind: "metric",
      title: "SQL pool utilization saturated at 98%",
      detail: "checkout-db-01 primary pool crossed 95% at 10:07 CT and held above 96% since.",
      timeWindow: "10:04 – now", source: "Datadog",
      sourceUrl: "https://datadog.example/dashboard/checkout-db-01",
      pinned: false,
    },
    {
      id: rid("EV"), kind: "trace",
      title: "Database wait time is the dominant contributor",
      detail: "Checkout POST /order p95 breakdown: 2410ms db-wait / 190ms app / 90ms net.",
      timeWindow: "10:07 – now", source: "Tempo",
      sourceUrl: "https://tempo.example/trace/checkout-order",
      pinned: false,
    },
    {
      id: rid("EV"), kind: "change",
      title: "CHG-20391 modified pool sizing at 10:04 CT",
      detail: "Index migration + pool_max_size 40→20 shipped to prod on service " + serviceId + ".",
      timeWindow: "09:58 – 10:04", source: "Change Mgmt",
      sourceUrl: "https://changes.example/CHG-20391",
      pinned: false,
    },
    {
      id: rid("EV"), kind: "log",
      title: "DB_TIMEOUT dominates checkout error class",
      detail: "81% of checkout error logs since 10:07 CT carry error_class=DB_TIMEOUT.",
      timeWindow: "10:07 – now", source: "Splunk",
      sourceUrl: "https://splunk.example/search?q=checkout+DB_TIMEOUT",
      pinned: false,
    },
    {
      id: rid("EV"), kind: "config",
      title: "checkout.pool_max_size decreased 40 → 20",
      detail: "Config diff applied by CHG-20391 without accompanying load review.",
      timeWindow: "10:04", source: "Config Store",
      sourceUrl: "https://config.example/checkout/diff/CHG-20391",
      pinned: false,
    },
    {
      id: rid("EV"), kind: "prior",
      title: "INC-9812 · pool sizing regression (2025-11)",
      detail: "Same failure mode after a pool_max_size reduction; resolved by revert.",
      timeWindow: "2025-11-14", source: "Incident archive",
      sourceUrl: "https://incidents.example/INC-9812",
      pinned: false,
    },
  ];

  const record: InvestigationRecord = {
    incidentId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    queries: [
      { id: rid("Q"), label: "Checkout p95 vs last week", language: "PromQL",
        text: 'histogram_quantile(0.95, rate(http_req_duration_seconds_bucket{service="checkout"}[5m]))',
        savedBy: "sre@neurealm" },
      { id: rid("Q"), label: "DB wait time by query", language: "TraceQL",
        text: 'trace {service="checkout"} | histogram_over_time(dbWaitMs, 5m)',
        savedBy: "sre@neurealm" },
      { id: rid("Q"), label: "DB_TIMEOUT log volume",  language: "LogQL",
        text: '{service="checkout"} |= "DB_TIMEOUT" | rate(5m)',
        savedBy: "sre@neurealm" },
    ],
    activeQueryId: "",
    compareA: "now (last 30m)",
    compareB: "last week same window",
    telemetry: [
      { id: rid("TP"), title: "Checkout p95 latency",       metric: "http_req_duration p95",
        compareA: "now", compareB: "last week",
        valueA: "2.8s", valueB: "420ms", delta: "+567%", tone: "regressed", source: "Datadog" },
      { id: rid("TP"), title: "Transaction success rate",   metric: "success_ratio",
        compareA: "now", compareB: "last week",
        valueA: "91.4%", valueB: "99.7%", delta: "-8.3pp", tone: "regressed", source: "Datadog" },
      { id: rid("TP"), title: "SQL pool utilization",       metric: "pool_util",
        compareA: "now", compareB: "last week",
        valueA: "98%", valueB: "62%", delta: "+36pp", tone: "regressed", source: "New Relic" },
      { id: rid("TP"), title: "Order queue delay",          metric: "kafka_consumer_lag",
        compareA: "now", compareB: "last week",
        valueA: "38s",  valueB: "6s",   delta: "+533%", tone: "regressed", source: "Confluent" },
    ],
    logs: [
      { id: rid("LG"), at: iso(28), service: "checkout-api",   level: "error", message: "OrderService.createOrder failed: DB_TIMEOUT after 30000ms", correlationId: "cid-a12" },
      { id: rid("LG"), at: iso(26), service: "checkout-api",   level: "error", message: "pool acquire timeout (waiters=42 max=20)", correlationId: "cid-a13" },
      { id: rid("LG"), at: iso(22), service: "checkout-api",   level: "warn",  message: "circuit breaker HALF_OPEN → OPEN on downstream=sql-primary" },
      { id: rid("LG"), at: iso(18), service: "order-processor",level: "warn",  message: "consumer lag rising for topic=order-events partition=7" },
      { id: rid("LG"), at: iso(12), service: "checkout-api",   level: "error", message: "DB_TIMEOUT rate 4.7% (SLO 0.5%)" },
    ],
    traces: [
      { id: rid("TR"), operation: "POST /order",   totalMs: 2810, dbMs: 2410, network: 90,  errorClass: "DB_TIMEOUT", sampleTraceId: "trace-9f12" },
      { id: rid("TR"), operation: "POST /payment", totalMs: 1420, dbMs: 1180, network: 45,  errorClass: "DB_TIMEOUT", sampleTraceId: "trace-9f13" },
      { id: rid("TR"), operation: "GET  /cart",    totalMs: 320,  dbMs: 210,  network: 30,  sampleTraceId: "trace-9f14" },
    ],
    changes: [
      { id: "CHG-20391", at: iso(46), title: "Reduce checkout pool_max_size 40 → 20 + add compound index", actor: "release-bot", scope: "checkout-api / checkout-db-01", status: "deployed" },
      { id: "CHG-20388", at: iso(180), title: "Rotate Kafka consumer group offsets", actor: "sre@neurealm", scope: "order-processor", status: "deployed" },
      { id: "CHG-20379", at: iso(1440), title: "Upgrade Node runtime 20.10 → 20.12", actor: "release-bot", scope: "checkout-api", status: "deployed" },
    ],
    configDiffs: [
      { key: "checkout.pool_max_size", before: "40", after: "20", by: "CHG-20391" },
      { key: "checkout.query_timeout", before: "30s", after: "30s", by: "unchanged" },
      { key: "checkout.circuit_breaker.threshold", before: "0.05", after: "0.05", by: "unchanged" },
    ],
    topology: [
      { from: "checkout-api",    to: "checkout-db-01", edge: "sync",    saturationPct: 98 },
      { from: "checkout-api",    to: "payment-svc",   edge: "sync",    saturationPct: 42 },
      { from: "checkout-api",    to: "order-events",  edge: "async",   saturationPct: 61 },
      { from: "order-processor", to: "order-events",  edge: "async",   saturationPct: 73 },
    ],
    priors: [
      { id: "INC-9812", title: "Pool sizing regression on checkout", when: "2025-11-14", outcome: "Reverted CHG-19844 · fixed in 22m", similarity: 92 },
      { id: "INC-9540", title: "Kafka broker restart cascaded to checkout", when: "2025-09-02", outcome: "Kafka scale-out · fixed in 41m", similarity: 47 },
    ],
    knownErrors: [
      { id: "KE-118", title: "Undersized primary pool under peak load", match: 89, workaround: "Increase pool_max_size or revert change", runbookId: "RB-0042" },
      { id: "KE-207", title: "Consumer lag from broker restart",       match: 32, workaround: "Restart consumer group",              runbookId: "RB-0031" },
    ],
    workers: [
      {
        id: rid("DW"), worker: "DW-DB-03", component: "checkout-db-01",
        question: "Confirm dominant wait class on the primary.",
        state: "complete", createdAt: iso(20),
        finding: {
          conclusion: "Database wait time is the dominant contributor for checkout traffic since 10:07 CT.",
          supporting: [
            "Trace breakdown shows 2410ms db-wait out of 2810ms p95",
            "sql-primary saturation at 98% pool utilization",
            "DB_TIMEOUT dominates checkout error class (81%)",
          ],
          contradictory: [
            "Application pod CPU remains within normal range on all replicas",
          ],
          confidence: 84,
          uncertainty: "Cannot yet rule out contention from an unrelated batch job on the same primary.",
          nextTest: "Compare pg_stat_activity waiters vs. batch job schedule for the last hour.",
          sources: [
            { label: "Tempo · POST /order breakdown", url: "https://tempo.example/trace/checkout-order" },
            { label: "New Relic · sql-primary pool",   url: "https://newrelic.example/checkout-db-01" },
            { label: "Splunk · DB_TIMEOUT rate",       url: "https://splunk.example/search?q=DB_TIMEOUT" },
          ],
        },
      },
      {
        id: rid("DW"), worker: "DW-CHANGE-05", component: "CHG-20391",
        question: "Which recent change most plausibly explains the onset?",
        state: "running", createdAt: iso(15),
      },
    ],
    evidence: evidenceSeed,
    notes: [
      { id: rid("NT"), at: iso(30), by: "sre@neurealm", text: "Latency onset at 10:07 CT lines up with pool util curve.", state: "note", evidenceIds: [] },
    ],
    handoffs: [],
    sourceUnavailable: [],
    stage: 0,
  };
  return record;
}

/* ------------------------------- Helpers -------------------------------- */

function toneClass(t: "regressed" | "stable" | "improved") {
  if (t === "regressed") return "bg-red-50 text-red-700 border-red-200";
  if (t === "improved")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function kindLabel(k: EvidenceKind) {
  switch (k) {
    case "metric": return "Metric";
    case "log":    return "Log";
    case "trace":  return "Trace";
    case "change": return "Change";
    case "config": return "Config";
    case "topology": return "Topology";
    case "prior":  return "Prior";
    case "known-error": return "Known error";
  }
}

/* --------------------------------- Page --------------------------------- */

export default function InvestigationWorkspace() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [record, setRecord] = useState<InvestigationRecord | null>(null);
  const [tab, setTab] = useState<
    "signals" | "changes" | "topology" | "priors" | "workers" | "evidence" | "notes"
  >("signals");
  const [dialog, setDialog] = useState<
    null | "query" | "hypothesis" | "worker" | "note" | "handoff" | "specialist" | "compare"
  >(null);
  const [selectedQuery, setSelectedQuery] = useState<string>("");
  const [queryLabel, setQueryLabel] = useState("");
  const [queryLanguage, setQueryLanguage] = useState<Query["language"]>("PromQL");
  const [queryText, setQueryText] = useState("");
  const [hypText, setHypText] = useState("");
  const [hypConfidence, setHypConfidence] = useState(60);
  const [workerName, setWorkerName] = useState("DW-DB-03");
  const [workerComponent, setWorkerComponent] = useState("checkout-db-01");
  const [workerQuestion, setWorkerQuestion] = useState("");
  const [noteText, setNoteText] = useState("");
  const [handoffTo, setHandoffTo] = useState("Priya Raman");
  const [handoffSummary, setHandoffSummary] = useState("");
  const [specialistRole, setSpecialistRole] = useState("Database SME");
  const [specialistNeed, setSpecialistNeed] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [searchEvidence, setSearchEvidence] = useState("");

  /* --------------------------- Load / seed ---------------------------- */
  useEffect(() => {
    const map = readMap<InvestigationRecord>(INVESTIGATIONS_KEY);
    if (map[incidentId]) {
      setRecord(map[incidentId]);
      setCompareA(map[incidentId].compareA);
      setCompareB(map[incidentId].compareB);
    } else {
      const rec = seedInvestigation(incidentId, ops.selectedServiceId);
      map[incidentId] = rec;
      writeMap(INVESTIGATIONS_KEY, map);
      setRecord(rec);
      setCompareA(rec.compareA);
      setCompareB(rec.compareB);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({
        kind, title, detail, entityRef: incidentId,
        route: `/runops/incidents/${incidentId}/investigate`,
      });
    },
    [ops, incidentId],
  );

  const persist = useCallback((next: InvestigationRecord) => {
    const map = readMap<InvestigationRecord>(INVESTIGATIONS_KEY);
    map[next.incidentId] = { ...next, updatedAt: nowIso() };
    writeMap(INVESTIGATIONS_KEY, map);
    setRecord(map[next.incidentId]);
  }, []);

  /* --------------------------- Cross-store IO ------------------------- */

  const appendVerifiedFactToIncident = useCallback((fact: string) => {
    const map = readMap<IncidentRecordShape>(INCIDENTS_KEY);
    const inc = map[incidentId];
    if (!inc) return;
    if (inc.verifiedFacts?.includes(fact)) return;
    map[incidentId] = { ...inc, verifiedFacts: [...(inc.verifiedFacts ?? []), fact], updatedAt: nowIso() };
    writeMap(INCIDENTS_KEY, map);
  }, [incidentId]);

  const appendHypothesisToIncident = useCallback((hy: IncidentHypothesis) => {
    const map = readMap<IncidentRecordShape>(INCIDENTS_KEY);
    const inc = map[incidentId];
    if (!inc) return;
    map[incidentId] = {
      ...inc,
      hypotheses: [hy, ...(inc.hypotheses ?? [])],
      updatedAt: nowIso(),
    };
    writeMap(INCIDENTS_KEY, map);
  }, [incidentId]);

  const appendDiagnostic = useCallback((task: WorkerTask) => {
    const list = readList<StoredDiagnostic>(DIAGNOSTICS_KEY);
    list.unshift({
      id: task.id,
      incidentId,
      worker: task.worker,
      component: task.component,
      question: task.question,
      state: task.state,
      createdAt: task.createdAt,
    });
    writeList(DIAGNOSTICS_KEY, list);
  }, [incidentId]);

  /* ------------------------------ Actions ----------------------------- */

  const runQuery = (queryId: string) => {
    if (!record) return;
    setSelectedQuery(queryId);
    const q = record.queries.find((x) => x.id === queryId);
    if (q) audit("Diagnostic query executed", `${q.label} · ${q.language}`);
  };

  const createQuery = () => {
    if (!record || !canWrite || !queryLabel.trim() || !queryText.trim()) return;
    const q: Query = { id: rid("Q"), label: queryLabel.trim(), language: queryLanguage, text: queryText.trim(), savedBy: ops.role };
    persist({ ...record, queries: [q, ...record.queries] });
    audit("Diagnostic query created", `${q.label}`);
    setDialog(null); setQueryLabel(""); setQueryText("");
  };

  const applyCompare = () => {
    if (!record || !canWrite) return;
    persist({ ...record, compareA: compareA || record.compareA, compareB: compareB || record.compareB });
    audit("Time windows compared", `${compareA} vs ${compareB}`);
    setDialog(null);
  };

  const togglePin = (id: string) => {
    if (!record || !canWrite) return;
    const ev = record.evidence.map((e) =>
      e.id === id
        ? e.pinned
          ? { ...e, pinned: false, pinnedAt: undefined, pinnedBy: undefined }
          : { ...e, pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role }
        : e,
    );
    const target = record.evidence.find((e) => e.id === id);
    persist({ ...record, evidence: ev, stage: Math.min(3, record.stage + (target && !target.pinned ? 1 : 0)) });
    if (target) audit(target.pinned ? "Evidence unpinned" : "Evidence pinned", target.title);
  };

  const createHypothesis = () => {
    if (!record || !canWrite || !hypText.trim()) return;
    const pinned = record.evidence.filter((e) => e.pinned);
    const hy: IncidentHypothesis = {
      id: rid("HY"),
      text: hypText.trim(),
      confidence: Math.max(0, Math.min(100, hypConfidence)),
      state: "Proposed",
      supporting: pinned.map((e) => `${kindLabel(e.kind)} · ${e.title}`),
      contradictory: [],
      createdAt: nowIso(),
    };
    appendHypothesisToIncident(hy);
    audit("Hypothesis created", hy.text, "warning");
    setDialog(null); setHypText(""); setHypConfidence(60);
  };

  const assignWorker = () => {
    if (!record || !canWrite || !workerQuestion.trim()) return;
    const task: WorkerTask = {
      id: rid("DW"), worker: workerName, component: workerComponent,
      question: workerQuestion.trim(), state: "queued", createdAt: nowIso(),
    };
    persist({ ...record, workers: [task, ...record.workers] });
    appendDiagnostic(task);
    audit("Digital worker task created", `${task.worker} · ${task.component}`);
    setDialog(null); setWorkerQuestion("");
  };

  const advanceWorker = (id: string) => {
    if (!record || !canWrite) return;
    const workers = record.workers.map((w) => {
      if (w.id !== id) return w;
      if (w.state === "queued")   return { ...w, state: "running" as WorkerState };
      if (w.state === "running")  return {
        ...w, state: "complete" as WorkerState,
        finding: w.finding ?? {
          conclusion: `CHG-20391 correlates with checkout-db-01 saturation onset within 3 minutes.`,
          supporting: [
            "CHG-20391 deployed 10:04 CT; saturation crossed 95% at 10:07 CT",
            "Config diff reduces pool_max_size 40 → 20 without accompanying load review",
            "Prior incident INC-9812 shows the same failure mode after a similar reduction",
          ],
          contradictory: [
            "CHG-20388 also touched adjacent infra but scoped to Kafka only",
          ],
          confidence: 78,
          uncertainty: "Cannot fully separate index migration from pool sizing without a revert experiment.",
          nextTest: "Stage a shadow revert on canary and re-check pool wait time.",
          sources: [
            { label: "CHG-20391 record",  url: "https://changes.example/CHG-20391" },
            { label: "Prior INC-9812",    url: "https://incidents.example/INC-9812" },
          ],
        },
      };
      return w;
    });
    persist({ ...record, workers, stage: Math.min(3, record.stage + 1) });
    audit("Digital worker advanced", workers.find((w) => w.id === id)?.state ?? "");
  };

  const failWorker = (id: string) => {
    if (!record || !canWrite) return;
    const workers = record.workers.map((w) => w.id === id ? { ...w, state: "failed" as WorkerState } : w);
    persist({ ...record, workers });
    audit("Digital worker failed", record.workers.find((w) => w.id === id)?.question ?? "", "warning");
  };

  const promoteNote = (id: string) => {
    if (!record || !canWrite) return;
    const note = record.notes.find((n) => n.id === id);
    if (!note) return;
    const notes = record.notes.map((n) => n.id === id ? { ...n, state: "verified" as NoteState } : n);
    persist({ ...record, notes });
    appendVerifiedFactToIncident(note.text);
    audit("Note promoted to verified fact", note.text);
  };

  const addNote = () => {
    if (!record || !canWrite || !noteText.trim()) return;
    const pinned = record.evidence.filter((e) => e.pinned).map((e) => e.id);
    const note: Note = { id: rid("NT"), at: nowIso(), by: ops.role, text: noteText.trim(), state: "note", evidenceIds: pinned };
    persist({ ...record, notes: [note, ...record.notes] });
    audit("Investigation note added", note.text);
    setDialog(null); setNoteText("");
  };

  const toggleBookmark = (id: string) => {
    if (!record || !canWrite) return;
    const notes = record.notes.map((n) => n.id === id ? { ...n, bookmark: !n.bookmark } : n);
    persist({ ...record, notes });
    audit("Bookmark toggled", record.notes.find((n) => n.id === id)?.text ?? "");
  };

  const createHandoff = () => {
    if (!record || !canWrite || !handoffSummary.trim()) return;
    const h: HandoffTask = { id: rid("HO"), to: handoffTo, summary: handoffSummary.trim(), createdAt: nowIso() };
    persist({ ...record, handoffs: [h, ...record.handoffs] });
    audit("Investigation handed off", `${handoffTo} · ${h.summary}`);
    setDialog(null); setHandoffSummary("");
  };

  const requestSpecialist = () => {
    if (!record || !canWrite || !specialistNeed.trim()) return;
    audit("Specialist requested", `${specialistRole} · ${specialistNeed.trim()}`, "warning");
    setDialog(null); setSpecialistNeed("");
  };

  const toggleSource = (id: string) => {
    if (!record || !canWrite) return;
    const off = record.sourceUnavailable.includes(id);
    const next = off
      ? record.sourceUnavailable.filter((x) => x !== id)
      : [...record.sourceUnavailable, id];
    persist({ ...record, sourceUnavailable: next });
    audit(off ? "Source restored" : "Source marked unavailable", id, off ? "info" : "warning");
  };

  const openRemediation = () => {
    audit("Opened remediation with selected evidence", `${record?.evidence.filter((e) => e.pinned).length ?? 0} pinned`);
    navigate(`/runops/incidents/${incidentId}/remediations`);
  };

  /* --------------------------- Loading state -------------------------- */

  if (!record) {
    return (
      <div className="flex flex-col">
        <EntityHeader title="Investigation Workspace" subtitle="Loading investigation…" />
        <div className="p-6 text-sm text-slate-600">Preparing investigation for {incidentId}…</div>
      </div>
    );
  }

  const pinned = record.evidence.filter((e) => e.pinned);
  const filteredEvidence = record.evidence.filter((e) =>
    !searchEvidence.trim() ||
    (`${e.title} ${e.detail} ${e.source} ${kindLabel(e.kind)}`.toLowerCase().includes(searchEvidence.trim().toLowerCase())),
  );
  const stageLabel = ["Signals gathered", "Hot path narrowed", "Root cause candidate", "Ready for remediation"][record.stage] ?? "Signals gathered";

  return (
    <div className="flex flex-col">
      <EntityHeader
        eyebrow={`Incident ${incidentId}`}
        title="Investigation Workspace"
        subtitle={`Shared, evidence-driven investigation · service ${ops.selectedServiceId} · ${ops.environment}`}
        status={{ tone: record.stage >= 2 ? "warning" : "neutral", label: stageLabel }}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge variant="outline" className="border-slate-300">Role · {ops.role}</Badge>
            <Badge variant="outline" className="border-slate-300">Scenario · {ops.stages[ops.stageIndex]?.label ?? "—"}</Badge>
            <Badge variant="outline" className="border-slate-300">Pinned evidence · {pinned.length}</Badge>
            <Badge variant="outline" className="border-slate-300">Workers · {record.workers.length}</Badge>
            <Badge variant="outline" className="border-slate-300">Notes · {record.notes.length}</Badge>
            {!canWrite && <Badge className="bg-amber-100 text-amber-900 border-amber-300">Read-only role — mutations disabled</Badge>}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setDialog("compare")} disabled={!canWrite} aria-label="Compare time windows">
              <GitCompare className="mr-1.5 h-4 w-4" /> Compare windows
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("worker")} disabled={!canWrite} aria-label="Assign digital worker">
              <Bot className="mr-1.5 h-4 w-4" /> Assign worker
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("specialist")} disabled={!canWrite} aria-label="Request human specialist">
              <HandHelping className="mr-1.5 h-4 w-4" /> Request specialist
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("handoff")} disabled={!canWrite} aria-label="Hand off investigation">
              <Handshake className="mr-1.5 h-4 w-4" /> Hand off
            </Button>
            <Button size="sm" onClick={() => setDialog("hypothesis")} disabled={!canWrite} aria-label="Create hypothesis">
              <Sparkles className="mr-1.5 h-4 w-4" /> Create hypothesis
            </Button>
            <Button size="sm" variant="outline" onClick={openRemediation}>
              <Play className="mr-1.5 h-4 w-4" /> Open remediation
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      {/* Query / evidence summary bar */}
      <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Search className="h-4 w-4 text-slate-500" /> Investigation query
              </div>
              <Button size="sm" variant="outline" onClick={() => setDialog("query")} disabled={!canWrite}>
                <Plus className="mr-1.5 h-4 w-4" /> Create query
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedQuery} onValueChange={(v) => setSelectedQuery(v)}>
                <SelectTrigger className="h-8 w-[280px] text-xs" aria-label="Saved diagnostic query">
                  <SelectValue placeholder="Choose a saved diagnostic query" />
                </SelectTrigger>
                <SelectContent>
                  {record.queries.map((q) => (
                    <SelectItem key={q.id} value={q.id}>{q.label} · {q.language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => selectedQuery && runQuery(selectedQuery)} disabled={!canWrite || !selectedQuery}>
                <Play className="mr-1.5 h-4 w-4" /> Run
              </Button>
              <span className="text-xs text-slate-500">Compare {record.compareA} ↔ {record.compareB}</span>
            </div>
            {selectedQuery && (
              <div className="mt-2 rounded border border-slate-200 bg-white p-2 font-mono text-[11px] text-slate-800">
                {record.queries.find((q) => q.id === selectedQuery)?.text}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Pin className="h-4 w-4 text-slate-500" /> Pinned evidence · {pinned.length}
            </div>
            {pinned.length === 0 ? (
              <div className="text-xs text-slate-500">No evidence pinned yet — pin from any panel to shape a hypothesis.</div>
            ) : (
              <ul className="space-y-1">
                {pinned.slice(0, 4).map((e) => (
                  <li key={e.id} className="truncate text-xs text-slate-700">
                    <Badge variant="outline" className="mr-1 border-slate-300 text-[10px]">{kindLabel(e.kind)}</Badge>
                    {e.title}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
        <TabsList className="mx-3 mt-3">
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="changes">Changes & Config</TabsTrigger>
          <TabsTrigger value="topology">Topology</TabsTrigger>
          <TabsTrigger value="priors">Priors & Known errors</TabsTrigger>
          <TabsTrigger value="workers">Digital workers</TabsTrigger>
          <TabsTrigger value="evidence">Evidence collection</TabsTrigger>
          <TabsTrigger value="notes">Notes & bookmarks</TabsTrigger>
        </TabsList>

        {/* Signals: telemetry + logs + traces */}
        <TabsContent value="signals" className="p-3">
          <div className="grid gap-3 lg:grid-cols-2">
            {record.telemetry.map((t) => {
              const offline = record.sourceUnavailable.includes(t.id);
              return (
                <Card key={t.id}>
                  <CardContent className="p-3">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-500">{t.metric} · {t.source}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleSource(t.id)} disabled={!canWrite} aria-label="Toggle source availability">
                          {offline ? "Restore source" : "Mark unavailable"}
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          disabled={!canWrite}
                          onClick={() => {
                            const ev: Evidence = {
                              id: rid("EV"), kind: "metric",
                              title: `${t.title} — ${t.delta}`,
                              detail: `${t.compareA}=${t.valueA}, ${t.compareB}=${t.valueB} (${t.delta})`,
                              timeWindow: `${t.compareA} vs ${t.compareB}`,
                              source: t.source, sourceUrl: `https://source.example/${t.id.toLowerCase()}`,
                              pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                            };
                            persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                            audit("Evidence pinned from panel", t.title);
                          }}
                        >
                          <Pin className="mr-1.5 h-4 w-4" /> Pin
                        </Button>
                      </div>
                    </div>
                    {offline ? (
                      <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                        Source unavailable — cached values shown, comparison degraded.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded border border-slate-200 bg-white p-2">
                          <div className="text-[10px] uppercase text-slate-500">{t.compareA}</div>
                          <div className="text-lg font-semibold text-slate-900">{t.valueA}</div>
                        </div>
                        <div className="rounded border border-slate-200 bg-white p-2">
                          <div className="text-[10px] uppercase text-slate-500">{t.compareB}</div>
                          <div className="text-lg font-semibold text-slate-900">{t.valueB}</div>
                        </div>
                        <div className={cn("rounded border p-2", toneClass(t.tone))}>
                          <div className="text-[10px] uppercase">Delta</div>
                          <div className="text-lg font-semibold">{t.delta}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-500" /> Logs
                </div>
                <ul className="space-y-1">
                  {record.logs.map((l) => (
                    <li key={l.id} className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-white p-2 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "border-slate-300 text-[10px]",
                            l.level === "error" ? "text-red-700 border-red-200 bg-red-50" :
                            l.level === "warn"  ? "text-amber-800 border-amber-200 bg-amber-50" :
                            "text-slate-700",
                          )}>{l.level}</Badge>
                          <span className="text-slate-500">{new Date(l.at).toLocaleTimeString()}</span>
                          <span className="font-medium text-slate-800">{l.service}</span>
                        </div>
                        <div className="mt-0.5 truncate text-slate-700">{l.message}</div>
                      </div>
                      <Button
                        size="sm" variant="ghost" disabled={!canWrite}
                        onClick={() => {
                          const ev: Evidence = {
                            id: rid("EV"), kind: "log", title: l.message,
                            detail: `${l.service} · ${l.level} · ${new Date(l.at).toLocaleTimeString()}`,
                            timeWindow: new Date(l.at).toLocaleTimeString(),
                            source: "Splunk", sourceUrl: `https://splunk.example/log/${l.id}`,
                            pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                          };
                          persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                          audit("Evidence pinned from log", l.message);
                        }}
                      ><Pin className="h-4 w-4" /></Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Waypoints className="h-4 w-4 text-slate-500" /> Traces
                </div>
                <table className="w-full text-xs">
                  <thead className="text-left text-[10px] uppercase text-slate-500">
                    <tr><th className="p-1">Operation</th><th className="p-1">Total</th><th className="p-1">DB wait</th><th className="p-1">Class</th><th className="p-1"></th></tr>
                  </thead>
                  <tbody>
                    {record.traces.map((tr) => (
                      <tr key={tr.id} className="border-t border-slate-100">
                        <td className="p-1 font-medium text-slate-800">{tr.operation}</td>
                        <td className="p-1">{tr.totalMs}ms</td>
                        <td className="p-1 font-semibold text-red-700">{tr.dbMs}ms</td>
                        <td className="p-1">{tr.errorClass ?? "—"}</td>
                        <td className="p-1 text-right">
                          <Button
                            size="sm" variant="ghost" disabled={!canWrite}
                            onClick={() => {
                              const ev: Evidence = {
                                id: rid("EV"), kind: "trace",
                                title: `${tr.operation} · db-wait ${tr.dbMs}ms of ${tr.totalMs}ms`,
                                detail: tr.errorClass ? `Error class ${tr.errorClass}` : "",
                                timeWindow: "current window",
                                source: "Tempo", sourceUrl: `https://tempo.example/trace/${tr.sampleTraceId}`,
                                pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                              };
                              persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                              audit("Evidence pinned from trace", tr.operation);
                            }}
                          ><Pin className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Changes & config diff */}
        <TabsContent value="changes" className="p-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <GitBranch className="h-4 w-4 text-slate-500" /> Recent changes
                </div>
                <ul className="space-y-2">
                  {record.changes.map((c) => (
                    <li key={c.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-slate-900">{c.id} · {c.title}</div>
                        <Badge variant="outline" className="border-slate-300 text-[10px]">{c.status}</Badge>
                      </div>
                      <div className="mt-0.5 text-slate-600">{c.scope} · {c.actor} · {new Date(c.at).toLocaleString()}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => window.open(`https://changes.example/${c.id}`, "_blank")}>
                          <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open change
                        </Button>
                        <Button
                          size="sm" variant="outline" disabled={!canWrite}
                          onClick={() => {
                            const ev: Evidence = {
                              id: rid("EV"), kind: "change", title: `${c.id} · ${c.title}`,
                              detail: c.scope, timeWindow: new Date(c.at).toLocaleString(),
                              source: "Change Mgmt", sourceUrl: `https://changes.example/${c.id}`,
                              pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                            };
                            persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                            audit("Evidence pinned from change", c.id);
                          }}
                        >
                          <Pin className="mr-1 h-3.5 w-3.5" /> Pin
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Layers className="h-4 w-4 text-slate-500" /> Configuration comparison
                </div>
                <table className="w-full text-xs">
                  <thead className="text-left text-[10px] uppercase text-slate-500">
                    <tr><th className="p-1">Key</th><th className="p-1">Before</th><th className="p-1">After</th><th className="p-1">By</th></tr>
                  </thead>
                  <tbody>
                    {record.configDiffs.map((d) => (
                      <tr key={d.key} className="border-t border-slate-100">
                        <td className="p-1 font-medium text-slate-800">{d.key}</td>
                        <td className="p-1">{d.before}</td>
                        <td className={cn("p-1", d.before !== d.after && "font-semibold text-red-700")}>{d.after}</td>
                        <td className="p-1 text-slate-600">{d.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Topology */}
        <TabsContent value="topology" className="p-3">
          <Card>
            <CardContent className="p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Network className="h-4 w-4 text-slate-500" /> Topology context — dependency saturation
              </div>
              <ul className="space-y-2">
                {record.topology.map((e, i) => (
                  <li key={`${e.from}-${e.to}-${i}`} className="rounded border border-slate-200 bg-white p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-800">{e.from} → {e.to}</div>
                      <Badge variant="outline" className="border-slate-300 text-[10px]">{e.edge}</Badge>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded bg-slate-100">
                      <div
                        className={cn("h-2", e.saturationPct >= 90 ? "bg-red-500" : e.saturationPct >= 70 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${Math.min(100, e.saturationPct)}%` }}
                        aria-label={`saturation ${e.saturationPct}%`}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{e.saturationPct}% saturation</span>
                      <Button
                        size="sm" variant="ghost" disabled={!canWrite}
                        onClick={() => {
                          const ev: Evidence = {
                            id: rid("EV"), kind: "topology",
                            title: `${e.from} → ${e.to} · ${e.saturationPct}% saturated`,
                            detail: `Edge type ${e.edge}`, timeWindow: "current",
                            source: "Topology", sourceUrl: "https://topo.example",
                            pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                          };
                          persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                          audit("Evidence pinned from topology", `${e.from} → ${e.to}`);
                        }}
                      ><Pin className="h-4 w-4" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Priors & known errors */}
        <TabsContent value="priors" className="p-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ListTree className="h-4 w-4 text-slate-500" /> Prior incidents
                </div>
                <ul className="space-y-2">
                  {record.priors.map((p) => (
                    <li key={p.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900">{p.id} · {p.title}</div>
                        <Badge variant="outline" className="border-slate-300 text-[10px]">{p.similarity}% similar</Badge>
                      </div>
                      <div className="mt-0.5 text-slate-600">{p.when} · {p.outcome}</div>
                      <div className="mt-1 flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => window.open(`https://incidents.example/${p.id}`, "_blank")}>
                          <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open similar incident
                        </Button>
                        <Button
                          size="sm" variant="outline" disabled={!canWrite}
                          onClick={() => {
                            const ev: Evidence = {
                              id: rid("EV"), kind: "prior", title: `${p.id} · ${p.title}`,
                              detail: p.outcome, timeWindow: p.when,
                              source: "Incident archive", sourceUrl: `https://incidents.example/${p.id}`,
                              pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                            };
                            persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                            audit("Evidence pinned from prior", p.id);
                          }}
                        >
                          <Pin className="mr-1 h-3.5 w-3.5" /> Pin
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <AlertTriangle className="h-4 w-4 text-slate-500" /> Known errors
                </div>
                <ul className="space-y-2">
                  {record.knownErrors.map((k) => (
                    <li key={k.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900">{k.id} · {k.title}</div>
                        <Badge variant="outline" className="border-slate-300 text-[10px]">{k.match}% match</Badge>
                      </div>
                      <div className="mt-0.5 text-slate-600">Workaround: {k.workaround}</div>
                      <div className="mt-1 flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/runops/runbooks/${k.runbookId}`)}>
                          <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open runbook {k.runbookId}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Digital workers */}
        <TabsContent value="workers" className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Digital-worker findings expose conclusion, supporting + contradictory evidence, confidence, uncertainty, next test, and sources.
            </div>
            <Button size="sm" onClick={() => setDialog("worker")} disabled={!canWrite}>
              <Bot className="mr-1.5 h-4 w-4" /> Assign worker
            </Button>
          </div>
          <ul className="space-y-3">
            {record.workers.map((w) => (
              <li key={w.id}>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {w.worker} · <span className="font-normal text-slate-600">{w.component}</span>
                        </div>
                        <div className="text-xs text-slate-700">{w.question}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "border-slate-300 text-[10px]",
                          w.state === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          w.state === "failed"   ? "bg-red-50 text-red-700 border-red-200" :
                          w.state === "running"  ? "bg-amber-50 text-amber-800 border-amber-200" :
                          "bg-slate-50 text-slate-700",
                        )}>{w.state}</Badge>
                        {w.state !== "complete" && w.state !== "failed" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => advanceWorker(w.id)} disabled={!canWrite}>
                              Advance
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => failWorker(w.id)} disabled={!canWrite}>
                              Mark failed
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {w.finding && (
                      <div className="mt-3 grid gap-2 rounded border border-indigo-200 bg-indigo-50 p-2 text-xs md:grid-cols-2">
                        <div className="md:col-span-2">
                          <div className="text-[10px] font-semibold uppercase text-indigo-700">Conclusion</div>
                          <div className="text-slate-800">{w.finding.conclusion}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-emerald-700">Supporting evidence</div>
                          <ul className="list-disc pl-4 text-slate-800">
                            {w.finding.supporting.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-red-700">Contradictory evidence</div>
                          <ul className="list-disc pl-4 text-slate-800">
                            {w.finding.contradictory.length === 0
                              ? <li className="text-slate-500 list-none">None identified.</li>
                              : w.finding.contradictory.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-slate-700">Confidence</div>
                          <div className="text-slate-800">{w.finding.confidence}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-slate-700">Uncertainty</div>
                          <div className="text-slate-800">{w.finding.uncertainty}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-[10px] font-semibold uppercase text-slate-700">Next recommended test</div>
                          <div className="text-slate-800">{w.finding.nextTest}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-[10px] font-semibold uppercase text-slate-700">Sources</div>
                          <ul className="list-disc pl-4">
                            {w.finding.sources.map((s, i) => (
                              <li key={i}>
                                <a href={s.url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">{s.label}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2">
                          <Button
                            size="sm" variant="outline" disabled={!canWrite}
                            onClick={() => {
                              const ev: Evidence = {
                                id: rid("EV"), kind: w.component.startsWith("CHG") ? "change" : "metric",
                                title: w.finding!.conclusion,
                                detail: `Confidence ${w.finding!.confidence}% · ${w.worker}`,
                                timeWindow: "current window",
                                source: w.worker,
                                sourceUrl: w.finding!.sources[0]?.url ?? "https://source.example",
                                pinned: true, pinnedAt: nowIso(), pinnedBy: ops.role,
                              };
                              persist({ ...record, evidence: [ev, ...record.evidence], stage: Math.min(3, record.stage + 1) });
                              audit("Evidence pinned from worker finding", w.worker);
                            }}
                          >
                            <Pin className="mr-1.5 h-4 w-4" /> Pin conclusion as evidence
                          </Button>
                        </div>
                      </div>
                    )}
                    {w.state === "failed" && (
                      <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                        Worker failed — request a human specialist or reassign.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </TabsContent>

        {/* Evidence collection */}
        <TabsContent value="evidence" className="p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Input
                value={searchEvidence}
                onChange={(e) => setSearchEvidence(e.target.value)}
                placeholder="Search evidence"
                className="h-8 w-[240px]"
                aria-label="Search evidence"
              />
              <span className="text-xs text-slate-500">{filteredEvidence.length} of {record.evidence.length}</span>
            </div>
          </div>
          {filteredEvidence.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
              No evidence collected yet. Pin from any panel or worker finding to start.
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredEvidence.map((e) => (
                <li key={e.id} className={cn(
                  "rounded border p-2 text-xs",
                  e.pinned ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white",
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-300 text-[10px]">{kindLabel(e.kind)}</Badge>
                        <span className="font-medium text-slate-900">{e.title}</span>
                      </div>
                      <div className="mt-0.5 text-slate-700">{e.detail}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {e.timeWindow} · <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">{e.source}</a>
                        {e.pinnedBy && <> · pinned by {e.pinnedBy}</>}
                      </div>
                    </div>
                    <Button size="sm" variant={e.pinned ? "default" : "outline"} onClick={() => togglePin(e.id)} disabled={!canWrite}>
                      <Pin className="mr-1 h-3.5 w-3.5" /> {e.pinned ? "Unpin" : "Pin"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Notes & bookmarks */}
        <TabsContent value="notes" className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-slate-600">Notes stay private to the investigation until promoted to verified fact.</div>
            <Button size="sm" onClick={() => setDialog("note")} disabled={!canWrite}>
              <Plus className="mr-1.5 h-4 w-4" /> Add note
            </Button>
          </div>
          {record.notes.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
              No notes yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {record.notes.map((n) => (
                <li key={n.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "border-slate-300 text-[10px]",
                          n.state === "verified" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}>{n.state === "verified" ? "Verified fact" : "Note"}</Badge>
                        {n.bookmark && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">Bookmark</Badge>}
                        <span className="text-slate-500">{new Date(n.at).toLocaleTimeString()} · {n.by}</span>
                      </div>
                      <div className="mt-0.5 text-slate-800">{n.text}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toggleBookmark(n.id)} disabled={!canWrite} aria-label="Toggle bookmark">
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                      {n.state === "note" && (
                        <Button size="sm" variant="outline" onClick={() => promoteNote(n.id)} disabled={!canWrite}>
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Promote to verified
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {record.handoffs.length > 0 && (
            <Card className="mt-4">
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Handshake className="h-4 w-4 text-slate-500" /> Handoffs
                </div>
                <ul className="space-y-1">
                  {record.handoffs.map((h) => (
                    <li key={h.id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                      <div className="font-medium text-slate-800">→ {h.to}</div>
                      <div className="text-slate-700">{h.summary}</div>
                      <div className="text-[11px] text-slate-500">{new Date(h.createdAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* -------------------- Dialogs -------------------- */}
      <Dialog open={dialog === "query"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create diagnostic query</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Label" value={queryLabel} onChange={(e) => setQueryLabel(e.target.value)} aria-label="Query label" />
            <Select value={queryLanguage} onValueChange={(v) => setQueryLanguage(v as Query["language"])}>
              <SelectTrigger aria-label="Query language"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PromQL">PromQL</SelectItem>
                <SelectItem value="TraceQL">TraceQL</SelectItem>
                <SelectItem value="LogQL">LogQL</SelectItem>
                <SelectItem value="SQL">SQL</SelectItem>
              </SelectContent>
            </Select>
            <Textarea rows={5} placeholder="Query text" value={queryText} onChange={(e) => setQueryText(e.target.value)} aria-label="Query text" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createQuery} disabled={!queryLabel.trim() || !queryText.trim()}>Save query</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "compare"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compare time windows</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={compareA} onChange={(e) => setCompareA(e.target.value)} placeholder="Window A" aria-label="Window A" />
            <Input value={compareB} onChange={(e) => setCompareB(e.target.value)} placeholder="Window B" aria-label="Window B" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={applyCompare}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "hypothesis"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create hypothesis</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Textarea rows={3} placeholder="Hypothesis statement" value={hypText} onChange={(e) => setHypText(e.target.value)} aria-label="Hypothesis" />
            <div>
              <label className="text-xs text-slate-600">Confidence: {hypConfidence}%</label>
              <input type="range" min={0} max={100} value={hypConfidence} onChange={(e) => setHypConfidence(Number(e.target.value))} className="w-full" aria-label="Confidence" />
            </div>
            <div className="text-xs text-slate-500">
              {pinned.length === 0
                ? "No pinned evidence — hypothesis will be created without linked evidence."
                : `${pinned.length} pinned evidence item(s) will attach as supporting evidence.`}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createHypothesis} disabled={!hypText.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "worker"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign component investigation to a digital worker</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Select value={workerName} onValueChange={setWorkerName}>
              <SelectTrigger aria-label="Digital worker"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DW-DB-03">DW-DB-03 (Database)</SelectItem>
                <SelectItem value="DW-CHANGE-05">DW-CHANGE-05 (Change)</SelectItem>
                <SelectItem value="DW-RCA-08">DW-RCA-08 (RCA)</SelectItem>
                <SelectItem value="DW-NET-02">DW-NET-02 (Network)</SelectItem>
                <SelectItem value="DW-KNOW-07">DW-KNOW-07 (Knowledge)</SelectItem>
              </SelectContent>
            </Select>
            <Input value={workerComponent} onChange={(e) => setWorkerComponent(e.target.value)} placeholder="Component" aria-label="Component" />
            <Textarea rows={3} placeholder="Investigation question" value={workerQuestion} onChange={(e) => setWorkerQuestion(e.target.value)} aria-label="Question" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={assignWorker} disabled={!workerQuestion.trim()}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "note"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add investigation note</DialogTitle></DialogHeader>
          <Textarea rows={4} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Note" aria-label="Note" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={addNote} disabled={!noteText.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "handoff"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hand off investigation task</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={handoffTo} onChange={(e) => setHandoffTo(e.target.value)} placeholder="Recipient" aria-label="Recipient" />
            <Textarea rows={3} value={handoffSummary} onChange={(e) => setHandoffSummary(e.target.value)} placeholder="Handoff summary" aria-label="Handoff summary" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createHandoff} disabled={!handoffSummary.trim()}>Hand off</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "specialist"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request human specialist</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Select value={specialistRole} onValueChange={setSpecialistRole}>
              <SelectTrigger aria-label="Specialist role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Database SME">Database SME</SelectItem>
                <SelectItem value="Network SME">Network SME</SelectItem>
                <SelectItem value="Application SME">Application SME</SelectItem>
                <SelectItem value="Security SME">Security SME</SelectItem>
              </SelectContent>
            </Select>
            <Textarea rows={3} value={specialistNeed} onChange={(e) => setSpecialistNeed(e.target.value)} placeholder="What do you need from the specialist?" aria-label="Specialist need" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={requestSpecialist} disabled={!specialistNeed.trim()}>Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
