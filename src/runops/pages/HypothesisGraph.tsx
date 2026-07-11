/**
 * Page 28 · Hypothesis & Causal Graph
 * Route: /runops/incidents/:incidentId/hypotheses  (canonical INC-10482)
 *
 * Structures incident reasoning as a hypothesis list + causal graph without
 * prematurely claiming root cause.
 *
 * Persistence:
 *   runops.hypothesisgraph.v1[incidentId] → HypothesisGraphRecord
 *   runops.incidents.v1[incidentId]       (mirrors hypotheses list + verified facts)
 *   runops.diagnostics.v1                 (append diagnostic-test tasks)
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * Confidence is recalculated deterministically from explicit evidence
 * weights — never randomised — and every change records why.
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight, Beaker, CheckCircle2, ChevronRight, GitBranch, GitCompare,
  GitMerge, History, LineChart, Link2, Play, Plus, Search, ShieldAlert,
  ShieldCheck, Sparkles, Swords, Target, TriangleAlert, User, Zap,
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

type HypothesisState = "Proposed" | "Investigating" | "Confirmed" | "Rejected";
type CausalRole = "trigger" | "contributing" | "affected";
type EvidenceStrength = "weak" | "moderate" | "strong";
type EdgeKind = "causes" | "contributes-to" | "correlates-with";

interface EvidenceLink {
  id: string;
  hypothesisId: string;
  polarity: "supports" | "contradicts";
  weight: EvidenceStrength;   // +/- 20, 40, 60
  text: string;
  source: string;
  sourceUrl: string;
  addedAt: string;
  addedBy: string;
  stale?: boolean;
}

interface CausalNode {
  id: string;
  hypothesisId?: string;    // null → factor-only node
  label: string;
  role: CausalRole;
  affectedDependency?: string;
}

interface CausalEdge {
  id: string;
  from: string;   // node id
  to: string;     // node id
  kind: EdgeKind;
  rationale: string;
}

interface ConfidenceEntry {
  at: string;
  value: number;
  reason: string;
}

interface HypothesisRecord {
  id: string;
  text: string;
  state: HypothesisState;
  investigator?: string;
  createdAt: string;
  createdBy: string;
  confidence: number;             // derived, cached
  confidenceHistory: ConfidenceEntry[];
  triggerVsCause: "trigger" | "cause" | "unclear";
  contributingFactors: string[];
  affectedDependencies: string[];
  unresolvedQuestions: string[];
  recommendedTests: string[];
  rejectionRationale?: string;
  mergedInto?: string;
}

interface DiagnosticTest {
  id: string;
  hypothesisId: string;
  question: string;
  requestedBy: string;
  createdAt: string;
  state: "requested" | "in-progress" | "complete";
}

interface HypothesisGraphRecord {
  incidentId: string;
  hypotheses: HypothesisRecord[];
  evidence: EvidenceLink[];
  nodes: CausalNode[];
  edges: CausalEdge[];
  tests: DiagnosticTest[];
  updatedAt: string;
}

interface IncidentRecordShape {
  incidentId: string;
  verifiedFacts?: string[];
  hypotheses?: {
    id: string; text: string; confidence: number; state: HypothesisState;
    supporting: string[]; contradictory: string[]; createdAt: string;
  }[];
  updatedAt?: string;
  [k: string]: unknown;
}

interface StoredDiagnostic {
  id: string;
  incidentId?: string;
  worker?: string;
  component?: string;
  question: string;
  state: string;
  createdAt: string;
}

/* ------------------------------ Storage --------------------------------- */

const GRAPH_KEY       = "runops.hypothesisgraph.v1";
const INCIDENTS_KEY   = "runops.incidents.v1";
const DIAGNOSTICS_KEY = "runops.diagnostics.v1";

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

/* ------------------------------ Confidence ------------------------------ */

const WEIGHT: Record<EvidenceStrength, number> = { weak: 20, moderate: 40, strong: 60 };

/**
 * Deterministic confidence: 50 baseline + Σ supports − Σ contradicts,
 * clamped to [0, 100]. Stale evidence contributes at half weight.
 */
function computeConfidence(hypId: string, evidence: EvidenceLink[]): number {
  let score = 50;
  for (const e of evidence) {
    if (e.hypothesisId !== hypId) continue;
    const w = WEIGHT[e.weight] * (e.stale ? 0.5 : 1);
    score += e.polarity === "supports" ? w : -w;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

/* -------------------------------- Seed ---------------------------------- */

function seedGraph(incidentId: string): HypothesisGraphRecord {
  const now = new Date();
  const iso = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

  const HDB   = "HY-DB";
  const HPOOL = "HY-POOL";
  const HK8S  = "HY-K8S";
  const HNET  = "HY-NET";
  const HIDP  = "HY-IDP";

  const evidence: EvidenceLink[] = [
    // Database query plan regression
    { id: rid("EL"), hypothesisId: HDB, polarity: "supports", weight: "strong",
      text: "Trace breakdown: 2410ms db-wait of 2810ms p95 on POST /order.",
      source: "Tempo", sourceUrl: "https://tempo.example/trace/checkout-order",
      addedAt: iso(30), addedBy: "DW-DB-03" },
    { id: rid("EL"), hypothesisId: HDB, polarity: "supports", weight: "strong",
      text: "CHG-20391 deployed 10:04 CT — pool_max_size 40 → 20 and new compound index.",
      source: "Change Mgmt", sourceUrl: "https://changes.example/CHG-20391",
      addedAt: iso(28), addedBy: "DW-CHANGE-05" },
    { id: rid("EL"), hypothesisId: HDB, polarity: "supports", weight: "moderate",
      text: "Similar failure mode in INC-9812 after pool_max_size reduction.",
      source: "Incident archive", sourceUrl: "https://incidents.example/INC-9812",
      addedAt: iso(22), addedBy: "DW-KNOW-07" },
    { id: rid("EL"), hypothesisId: HDB, polarity: "contradicts", weight: "weak",
      text: "Application pod CPU is within normal range on all replicas.",
      source: "Datadog", sourceUrl: "https://datadog.example/checkout-cpu",
      addedAt: iso(20), addedBy: "sre@neurealm" },
    // Application connection pool
    { id: rid("EL"), hypothesisId: HPOOL, polarity: "supports", weight: "moderate",
      text: "pool acquire timeout observed (waiters=42 max=20).",
      source: "Splunk", sourceUrl: "https://splunk.example/search?q=pool+acquire",
      addedAt: iso(18), addedBy: "sre@neurealm" },
    { id: rid("EL"), hypothesisId: HPOOL, polarity: "contradicts", weight: "moderate",
      text: "Pool limits were unchanged before CHG-20391 without similar symptoms.",
      source: "Config Store", sourceUrl: "https://config.example/checkout",
      addedAt: iso(16), addedBy: "DW-CHANGE-05" },
    // K8s pod saturation
    { id: rid("EL"), hypothesisId: HK8S, polarity: "supports", weight: "weak",
      text: "Some replicas briefly hit 78% memory during the window.",
      source: "New Relic", sourceUrl: "https://newrelic.example/checkout-pods",
      addedAt: iso(14), addedBy: "DW-K8S-02" },
    { id: rid("EL"), hypothesisId: HK8S, polarity: "contradicts", weight: "strong",
      text: "No HPA scale events and pod CPU stayed below 55% throughout.",
      source: "Datadog", sourceUrl: "https://datadog.example/checkout-hpa",
      addedAt: iso(12), addedBy: "DW-K8S-02", stale: false },
    // Network ingress
    { id: rid("EL"), hypothesisId: HNET, polarity: "contradicts", weight: "strong",
      text: "Ingress p99 held at 42ms; edge health checks green.",
      source: "Cloudflare", sourceUrl: "https://cf.example/checkout-ingress",
      addedAt: iso(10), addedBy: "DW-NET-02" },
    // IdP delay
    { id: rid("EL"), hypothesisId: HIDP, polarity: "contradicts", weight: "moderate",
      text: "IdP /token p95 unchanged; login funnel unaffected.",
      source: "IdP dashboard", sourceUrl: "https://idp.example/metrics",
      addedAt: iso(8), addedBy: "DW-SEC-04" },
    { id: rid("EL"), hypothesisId: HIDP, polarity: "supports", weight: "weak",
      text: "Elevated 401s on a small subset of checkout callbacks — likely coincident.",
      source: "Splunk", sourceUrl: "https://splunk.example/search?q=checkout+401",
      addedAt: iso(6), addedBy: "sre@neurealm", stale: true },
  ];

  const seedHyp = (id: string, text: string, state: HypothesisState, extra: Partial<HypothesisRecord>): HypothesisRecord => {
    const confidence = computeConfidence(id, evidence);
    return {
      id, text, state,
      investigator: extra.investigator,
      createdAt: extra.createdAt ?? iso(40),
      createdBy: extra.createdBy ?? "DW-RCA-08",
      confidence,
      confidenceHistory: [
        { at: extra.createdAt ?? iso(40), value: 50, reason: "Baseline on creation" },
        { at: iso(30), value: confidence, reason: "Recomputed from initial evidence weights" },
      ],
      triggerVsCause: extra.triggerVsCause ?? "unclear",
      contributingFactors: extra.contributingFactors ?? [],
      affectedDependencies: extra.affectedDependencies ?? [],
      unresolvedQuestions: extra.unresolvedQuestions ?? [],
      recommendedTests: extra.recommendedTests ?? [],
    };
  };

  const hypotheses: HypothesisRecord[] = [
    seedHyp(HDB, "Database query plan regression after CHG-20391 index deployment saturates the primary pool.", "Investigating", {
      triggerVsCause: "cause",
      contributingFactors: ["Reduced pool_max_size", "Concurrent seasonal traffic peak"],
      affectedDependencies: ["checkout-db-01", "checkout-api", "order-processor"],
      unresolvedQuestions: [
        "Can we reproduce the query plan diff on a shadow replica?",
        "Is any unrelated batch job contending on the same primary?",
      ],
      recommendedTests: [
        "Explain-analyze the two dominant checkout queries against the pre-change plan",
        "Compare pg_stat_activity waiters vs. scheduled batch window",
      ],
    }),
    seedHyp(HPOOL, "Application connection pool ceiling is too low for peak traffic independent of the query plan.", "Proposed", {
      triggerVsCause: "cause",
      contributingFactors: ["Client-side concurrency spikes"],
      affectedDependencies: ["checkout-api"],
      unresolvedQuestions: ["Would raising pool_max_size back to 40 restore health without reverting the index?"],
      recommendedTests: ["Canary raise pool_max_size to 30 for 5 minutes"],
    }),
    seedHyp(HK8S, "Kubernetes pod saturation on checkout-api replicas caused elevated latency.", "Proposed", {
      triggerVsCause: "unclear",
      affectedDependencies: ["checkout-api"],
      recommendedTests: ["Compare pod CPU throttling metrics against the baseline window"],
    }),
    seedHyp(HNET, "Network ingress latency between edge and origin degraded checkout requests.", "Rejected", {
      rejectionRationale: "Ingress p99 was flat and edge health checks green throughout the window.",
      triggerVsCause: "unclear",
    }),
    seedHyp(HIDP, "External identity provider delay slowed checkout callbacks.", "Rejected", {
      rejectionRationale: "IdP /token p95 unchanged; the small 401 uptick is stale and unrelated.",
      triggerVsCause: "unclear",
    }),
  ];

  const nodes: CausalNode[] = [
    { id: "N-CHG",      label: "CHG-20391 deployed",                    role: "trigger" },
    { id: "N-PLAN",     hypothesisId: HDB,   label: "Query plan regression",      role: "contributing" },
    { id: "N-POOL",     hypothesisId: HPOOL, label: "Pool ceiling too low",       role: "contributing" },
    { id: "N-SATUR",    label: "Primary pool saturation",               role: "contributing", affectedDependency: "checkout-db-01" },
    { id: "N-CHECKOUT", label: "Checkout latency + error spike",        role: "affected",     affectedDependency: "checkout-api" },
    { id: "N-K8S",      hypothesisId: HK8S,  label: "K8s pod saturation",         role: "contributing", affectedDependency: "checkout-api" },
    { id: "N-NET",      hypothesisId: HNET,  label: "Network ingress latency",    role: "contributing" },
    { id: "N-IDP",      hypothesisId: HIDP,  label: "IdP delay",                  role: "contributing" },
  ];

  const edges: CausalEdge[] = [
    { id: rid("ED"), from: "N-CHG",   to: "N-PLAN",     kind: "causes",         rationale: "Change deployed a new compound index and reduced pool sizing." },
    { id: rid("ED"), from: "N-PLAN",  to: "N-SATUR",    kind: "causes",         rationale: "Longer waits per query concentrate active connections." },
    { id: rid("ED"), from: "N-POOL",  to: "N-SATUR",    kind: "contributes-to", rationale: "Lower ceiling amplifies saturation risk." },
    { id: rid("ED"), from: "N-SATUR", to: "N-CHECKOUT", kind: "causes",         rationale: "Pool saturation propagates as timeouts to checkout traffic." },
    { id: rid("ED"), from: "N-K8S",   to: "N-CHECKOUT", kind: "correlates-with", rationale: "Observed briefly but not conclusively causal." },
  ];

  return {
    incidentId,
    hypotheses,
    evidence,
    nodes,
    edges,
    tests: [],
    updatedAt: nowIso(),
  };
}

/* --------------------------- Small helpers ------------------------------ */

function stateTone(s: HypothesisState) {
  switch (s) {
    case "Confirmed":     return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Investigating": return "bg-amber-50 text-amber-800 border-amber-200";
    case "Rejected":      return "bg-slate-100 text-slate-600 border-slate-200";
    default:              return "bg-blue-50 text-blue-700 border-blue-200";
  }
}
function roleTone(r: CausalRole) {
  switch (r) {
    case "trigger":      return "bg-red-50 text-red-700 border-red-200";
    case "contributing": return "bg-amber-50 text-amber-800 border-amber-200";
    case "affected":     return "bg-slate-50 text-slate-700 border-slate-200";
  }
}
function weightLabel(w: EvidenceStrength) {
  return `${w} (±${WEIGHT[w]})`;
}

/* -------------------------------- Page ---------------------------------- */

export default function HypothesisGraph() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [record, setRecord] = useState<HypothesisGraphRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "graph" | "history">("overview");
  const [dialog, setDialog] = useState<
    | null | "create" | "evidence" | "contradict" | "merge" | "reject"
    | "test" | "assign" | "connect" | "trigger" | "contributing"
  >(null);
  const [search, setSearch] = useState("");

  // Dialog local state
  const [newText, setNewText] = useState("");
  const [newTrigCause, setNewTrigCause] = useState<HypothesisRecord["triggerVsCause"]>("unclear");
  const [evText, setEvText] = useState("");
  const [evSource, setEvSource] = useState("Datadog");
  const [evWeight, setEvWeight] = useState<EvidenceStrength>("moderate");
  const [mergeInto, setMergeInto] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [testQuestion, setTestQuestion] = useState("");
  const [assignee, setAssignee] = useState("DW-DB-03");
  const [connFrom, setConnFrom] = useState("");
  const [connTo, setConnTo] = useState("");
  const [connKind, setConnKind] = useState<EdgeKind>("causes");
  const [connWhy, setConnWhy] = useState("");
  const [factorText, setFactorText] = useState("");

  /* --------------------------- Load / seed ---------------------------- */
  useEffect(() => {
    const map = readMap<HypothesisGraphRecord>(GRAPH_KEY);
    if (map[incidentId]) {
      setRecord(map[incidentId]);
      setSelectedId((prev) => prev ?? map[incidentId].hypotheses[0]?.id ?? null);
    } else {
      const rec = seedGraph(incidentId);
      map[incidentId] = rec;
      writeMap(GRAPH_KEY, map);
      setRecord(rec);
      setSelectedId(rec.hypotheses[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({
        kind, title, detail, entityRef: incidentId,
        route: `/runops/incidents/${incidentId}/hypotheses`,
      });
    },
    [ops, incidentId],
  );

  const mirrorToIncident = useCallback((rec: HypothesisGraphRecord) => {
    const map = readMap<IncidentRecordShape>(INCIDENTS_KEY);
    const inc = map[incidentId];
    if (!inc) return;
    map[incidentId] = {
      ...inc,
      hypotheses: rec.hypotheses.map((h) => ({
        id: h.id, text: h.text, confidence: h.confidence, state: h.state,
        supporting: rec.evidence.filter((e) => e.hypothesisId === h.id && e.polarity === "supports").map((e) => e.text),
        contradictory: rec.evidence.filter((e) => e.hypothesisId === h.id && e.polarity === "contradicts").map((e) => e.text),
        createdAt: h.createdAt,
      })),
      updatedAt: nowIso(),
    };
    writeMap(INCIDENTS_KEY, map);
  }, [incidentId]);

  const persist = useCallback((next: HypothesisGraphRecord, reason?: string) => {
    // Recompute confidences and append history for anything that changed.
    const hypotheses = next.hypotheses.map((h) => {
      const c = computeConfidence(h.id, next.evidence);
      if (c === h.confidence) return h;
      return {
        ...h,
        confidence: c,
        confidenceHistory: [...h.confidenceHistory, { at: nowIso(), value: c, reason: reason ?? "Evidence weights changed" }],
      };
    });
    const patched: HypothesisGraphRecord = { ...next, hypotheses, updatedAt: nowIso() };
    const map = readMap<HypothesisGraphRecord>(GRAPH_KEY);
    map[patched.incidentId] = patched;
    writeMap(GRAPH_KEY, map);
    setRecord(patched);
    mirrorToIncident(patched);
  }, [mirrorToIncident]);

  /* --------------------------- Derived views -------------------------- */

  const ranked = useMemo(() => {
    if (!record) return [] as HypothesisRecord[];
    const filter = (h: HypothesisRecord) =>
      !search.trim() || `${h.text} ${h.id}`.toLowerCase().includes(search.trim().toLowerCase());
    // Rejected go last but preserved
    return [...record.hypotheses]
      .filter(filter)
      .sort((a, b) => {
        const rejA = a.state === "Rejected" ? 1 : 0;
        const rejB = b.state === "Rejected" ? 1 : 0;
        if (rejA !== rejB) return rejA - rejB;
        return b.confidence - a.confidence;
      });
  }, [record, search]);

  const selected = useMemo(
    () => record?.hypotheses.find((h) => h.id === selectedId) ?? null,
    [record, selectedId],
  );
  const selectedEvidence = useMemo(
    () => record?.evidence.filter((e) => e.hypothesisId === selectedId) ?? [],
    [record, selectedId],
  );

  const unresolvedContradictions = useMemo(() => {
    if (!record) return [] as EvidenceLink[];
    return record.evidence.filter((e) => e.polarity === "contradicts" && !e.stale);
  }, [record]);

  const topConfidence = record ? Math.max(0, ...record.hypotheses.filter((h) => h.state !== "Rejected").map((h) => h.confidence)) : 0;
  const dominant = record?.hypotheses.find((h) => h.confidence === topConfidence && h.state !== "Rejected");
  const anyConfirmed = record?.hypotheses.some((h) => h.state === "Confirmed");
  const earlyUncertainty = topConfidence < 60 && !anyConfirmed;

  /* ------------------------------ Actions ----------------------------- */

  const createHypothesis = () => {
    if (!record || !canWrite || !newText.trim()) return;
    const id = rid("HY");
    const h: HypothesisRecord = {
      id, text: newText.trim(), state: "Proposed",
      investigator: undefined,
      createdAt: nowIso(), createdBy: ops.role,
      confidence: 50,
      confidenceHistory: [{ at: nowIso(), value: 50, reason: "Baseline on creation" }],
      triggerVsCause: newTrigCause,
      contributingFactors: [],
      affectedDependencies: [],
      unresolvedQuestions: [],
      recommendedTests: [],
    };
    persist({ ...record, hypotheses: [h, ...record.hypotheses] }, "Hypothesis created");
    audit("Hypothesis created", h.text);
    setSelectedId(id);
    setDialog(null); setNewText("");
  };

  const addEvidence = (polarity: "supports" | "contradicts") => {
    if (!record || !canWrite || !selected || !evText.trim()) return;
    const link: EvidenceLink = {
      id: rid("EL"),
      hypothesisId: selected.id,
      polarity,
      weight: evWeight,
      text: evText.trim(),
      source: evSource,
      sourceUrl: `https://source.example/${evSource.toLowerCase()}`,
      addedAt: nowIso(),
      addedBy: ops.role,
    };
    persist(
      { ...record, evidence: [link, ...record.evidence] },
      `${polarity === "supports" ? "Supporting" : "Contradictory"} evidence added (${evWeight} · ${evSource})`,
    );
    audit(polarity === "supports" ? "Evidence added" : "Contradiction added", `${selected.id} · ${evText.trim()}`);
    setDialog(null); setEvText("");
  };

  const promote = (id: string) => {
    if (!record || !canWrite) return;
    const hyp = record.hypotheses.find((h) => h.id === id);
    if (!hyp) return;
    const hypotheses = record.hypotheses.map((h) => h.id === id ? { ...h, state: "Confirmed" as HypothesisState } : h);
    persist({ ...record, hypotheses }, "Hypothesis promoted to Confirmed");
    audit("Hypothesis promoted", `${id} · ${hyp.text}`, "warning");

    // Cross-store: mirror as verified fact on incident
    const map = readMap<IncidentRecordShape>(INCIDENTS_KEY);
    const inc = map[incidentId];
    if (inc) {
      const fact = `Root cause candidate: ${hyp.text}`;
      const facts = inc.verifiedFacts ?? [];
      if (!facts.includes(fact)) {
        map[incidentId] = { ...inc, verifiedFacts: [...facts, fact], updatedAt: nowIso() };
        writeMap(INCIDENTS_KEY, map);
      }
    }
  };

  const challenge = (id: string) => {
    if (!record || !canWrite) return;
    const hypotheses = record.hypotheses.map((h) => h.id === id ? { ...h, state: "Investigating" as HypothesisState } : h);
    persist({ ...record, hypotheses }, "Hypothesis challenged — moved to Investigating");
    audit("Hypothesis challenged", id);
  };

  const reject = () => {
    if (!record || !canWrite || !selected || !rejectReason.trim()) return;
    const hypotheses = record.hypotheses.map((h) =>
      h.id === selected.id ? { ...h, state: "Rejected" as HypothesisState, rejectionRationale: rejectReason.trim() } : h,
    );
    persist({ ...record, hypotheses }, `Rejected: ${rejectReason.trim()}`);
    audit("Hypothesis rejected", `${selected.id} · ${rejectReason.trim()}`);
    setDialog(null); setRejectReason("");
  };

  const merge = () => {
    if (!record || !canWrite || !selected || !mergeInto || mergeInto === selected.id) return;
    // Move evidence + record mergedInto
    const evidence = record.evidence.map((e) => e.hypothesisId === selected.id ? { ...e, hypothesisId: mergeInto } : e);
    const hypotheses = record.hypotheses.map((h) =>
      h.id === selected.id ? { ...h, state: "Rejected" as HypothesisState, mergedInto: mergeInto, rejectionRationale: `Merged into ${mergeInto}` } : h,
    );
    persist({ ...record, evidence, hypotheses }, `Merged into ${mergeInto}`);
    audit("Hypothesis merged", `${selected.id} → ${mergeInto}`);
    setDialog(null); setSelectedId(mergeInto);
  };

  const requestTest = () => {
    if (!record || !canWrite || !selected || !testQuestion.trim()) return;
    const t: DiagnosticTest = {
      id: rid("DT"),
      hypothesisId: selected.id,
      question: testQuestion.trim(),
      requestedBy: ops.role,
      createdAt: nowIso(),
      state: "requested",
    };
    persist({ ...record, tests: [t, ...record.tests] }, `Diagnostic test requested: ${testQuestion.trim()}`);
    // Also append into diagnostics store so Investigation Workspace picks it up
    const list = readList<StoredDiagnostic>(DIAGNOSTICS_KEY);
    list.unshift({
      id: t.id, incidentId, worker: assignee, component: selected.id,
      question: t.question, state: "queued", createdAt: t.createdAt,
    });
    writeList(DIAGNOSTICS_KEY, list);
    audit("Diagnostic test requested", `${selected.id} · ${t.question}`);
    setDialog(null); setTestQuestion("");
  };

  const assignInvestigator = () => {
    if (!record || !canWrite || !selected || !assignee) return;
    const hypotheses = record.hypotheses.map((h) => h.id === selected.id ? { ...h, investigator: assignee } : h);
    persist({ ...record, hypotheses }, `Investigator assigned: ${assignee}`);
    audit("Investigator assigned", `${selected.id} → ${assignee}`);
    setDialog(null);
  };

  const connectEdge = () => {
    if (!record || !canWrite || !connFrom || !connTo || connFrom === connTo || !connWhy.trim()) return;
    const edge: CausalEdge = { id: rid("ED"), from: connFrom, to: connTo, kind: connKind, rationale: connWhy.trim() };
    persist({ ...record, edges: [edge, ...record.edges] }, `Causal edge added ${connFrom}→${connTo} (${connKind})`);
    audit("Causal edge added", `${connFrom} → ${connTo} · ${connKind}`);
    setDialog(null); setConnWhy("");
  };

  const markRole = (nodeId: string, role: CausalRole) => {
    if (!record || !canWrite) return;
    const nodes = record.nodes.map((n) => n.id === nodeId ? { ...n, role } : n);
    persist({ ...record, nodes }, `Node ${nodeId} marked ${role}`);
    audit(role === "trigger" ? "Trigger marked" : "Contributing factor marked", nodeId);
  };

  const addFactor = () => {
    if (!record || !canWrite || !selected || !factorText.trim()) return;
    const hypotheses = record.hypotheses.map((h) =>
      h.id === selected.id ? { ...h, contributingFactors: [factorText.trim(), ...h.contributingFactors] } : h,
    );
    persist({ ...record, hypotheses }, `Contributing factor noted: ${factorText.trim()}`);
    audit("Contributing factor added", `${selected.id} · ${factorText.trim()}`);
    setDialog(null); setFactorText("");
  };

  const toggleStale = (linkId: string) => {
    if (!record || !canWrite) return;
    const evidence = record.evidence.map((e) => e.id === linkId ? { ...e, stale: !e.stale } : e);
    persist({ ...record, evidence }, "Evidence staleness toggled");
    audit("Evidence marked", `${linkId} staleness toggled`);
  };

  const openRemediationCompare = () => {
    audit("Opened remediation comparison", `top hypothesis ${dominant?.id ?? "n/a"}`);
    navigate(`/runops/incidents/${incidentId}/remediations`);
  };

  /* --------------------------- Loading state -------------------------- */

  if (!record) {
    return (
      <div className="flex flex-col">
        <EntityHeader title="Hypothesis & Causal Graph" subtitle="Loading reasoning…" />
        <div className="p-6 text-sm text-slate-600">Preparing hypothesis graph for {incidentId}…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <EntityHeader
        eyebrow={`Incident ${incidentId}`}
        title="Hypothesis & Causal Graph"
        subtitle="Evidence-weighted reasoning · confidence derived from explicit weights, not chance"
        status={{
          tone: anyConfirmed ? "success" : earlyUncertainty ? "at-risk" : dominant ? "warning" : "neutral",
          label: anyConfirmed ? "Dominant hypothesis confirmed"
               : dominant && topConfidence >= 75 ? `Dominant candidate · ${dominant.id}`
               : earlyUncertainty ? "Early uncertainty · no root cause confirmed"
               : "No root cause confirmed",
        }}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge variant="outline" className="border-slate-300">Role · {ops.role}</Badge>
            <Badge variant="outline" className="border-slate-300">Service · {ops.selectedServiceId}</Badge>
            <Badge variant="outline" className="border-slate-300">Scenario · {ops.stages[ops.stageIndex]?.label ?? "—"}</Badge>
            <Badge variant="outline" className="border-slate-300">Hypotheses · {record.hypotheses.length}</Badge>
            {unresolvedContradictions.length > 0 && (
              <Badge className="bg-red-50 text-red-700 border-red-200">
                {unresolvedContradictions.length} unresolved contradiction{unresolvedContradictions.length === 1 ? "" : "s"}
              </Badge>
            )}
            {!canWrite && <Badge className="bg-amber-100 text-amber-900 border-amber-300">Read-only role — mutations disabled</Badge>}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setDialog("connect")} disabled={!canWrite} aria-label="Connect causal relationship">
              <Link2 className="mr-1.5 h-4 w-4" /> Connect nodes
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDialog("create")} disabled={!canWrite} aria-label="Create hypothesis">
              <Plus className="mr-1.5 h-4 w-4" /> Create hypothesis
            </Button>
            <Button size="sm" onClick={openRemediationCompare} aria-label="Open remediation comparison">
              <GitCompare className="mr-1.5 h-4 w-4" /> Open remediation comparison
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
        <TabsList className="mx-3 mt-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="graph">Causal graph</TabsTrigger>
          <TabsTrigger value="history">Confidence history</TabsTrigger>
        </TabsList>

        {/* Overview: ranked list + detail */}
        <TabsContent value="overview" className="p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            {/* Ranked list */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hypotheses" className="h-8" aria-label="Search hypotheses" />
              </div>
              <ul className="space-y-2" role="listbox" aria-label="Hypothesis list">
                {ranked.map((h) => {
                  const active = h.id === selectedId;
                  return (
                    <li key={h.id}>
                      <button
                        role="option"
                        aria-selected={active}
                        onClick={() => setSelectedId(h.id)}
                        className={cn(
                          "block w-full rounded border p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                          active ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50",
                          h.state === "Rejected" && "opacity-70",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-500">{h.id}</span>
                          <Badge variant="outline" className={cn("border-slate-300 text-[10px]", stateTone(h.state))}>{h.state}</Badge>
                        </div>
                        <div className="mt-1 text-sm text-slate-900">{h.text}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
                            <div
                              className={cn("h-2",
                                h.state === "Rejected" ? "bg-slate-400" :
                                h.confidence >= 75 ? "bg-emerald-500" :
                                h.confidence >= 50 ? "bg-amber-500" : "bg-slate-400")}
                              style={{ width: `${h.confidence}%` }}
                              aria-label={`confidence ${h.confidence}%`}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-semibold text-slate-700">{h.confidence}%</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
                {ranked.length === 0 && (
                  <li className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-600">
                    No hypotheses match the current filter.
                  </li>
                )}
              </ul>
            </div>

            {/* Detail */}
            <div className="space-y-3">
              {!selected ? (
                <Card><CardContent className="p-6 text-sm text-slate-600">Select a hypothesis to see evidence, confidence, and recommended tests.</CardContent></Card>
              ) : (
                <>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase text-slate-500">{selected.id} · {selected.state}</div>
                          <div className="text-base font-semibold text-slate-900">{selected.text}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <Badge variant="outline" className="border-slate-300">
                              {selected.triggerVsCause === "trigger" ? "Trigger" :
                               selected.triggerVsCause === "cause"   ? "Cause"   : "Trigger vs cause unclear"}
                            </Badge>
                            <span>Investigator: {selected.investigator ?? "unassigned"}</span>
                            <span>·</span>
                            <span>Confidence: {selected.confidence}%</span>
                          </div>
                          {selected.state === "Rejected" && selected.rejectionRationale && (
                            <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
                              <span className="font-semibold">Preserved rationale — </span>{selected.rejectionRationale}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDialog("evidence")} disabled={!canWrite}>
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Add evidence
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDialog("contradict")} disabled={!canWrite}>
                            <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Add contradiction
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => challenge(selected.id)} disabled={!canWrite || selected.state === "Rejected"}>
                            <Swords className="mr-1 h-3.5 w-3.5" /> Challenge
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDialog("merge")} disabled={!canWrite || selected.state === "Rejected"}>
                            <GitMerge className="mr-1 h-3.5 w-3.5" /> Merge
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDialog("reject")} disabled={!canWrite || selected.state === "Rejected"}>
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => promote(selected.id)} disabled={!canWrite || selected.state === "Rejected"}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Promote
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <Card>
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">Supporting evidence</div>
                          <Badge variant="outline" className="border-slate-300">{selectedEvidence.filter((e) => e.polarity === "supports").length}</Badge>
                        </div>
                        <ul className="space-y-2">
                          {selectedEvidence.filter((e) => e.polarity === "supports").map((e) => (
                            <li key={e.id} className={cn("rounded border p-2 text-xs", e.stale ? "border-slate-200 bg-slate-50 opacity-70" : "border-emerald-200 bg-emerald-50")}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-800">{e.text}</span>
                                <Badge variant="outline" className="border-emerald-300 text-[10px] text-emerald-800">+{WEIGHT[e.weight] * (e.stale ? 0.5 : 1)}</Badge>
                              </div>
                              <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-600">
                                <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">{e.source}</a>
                                <Button size="sm" variant="ghost" onClick={() => toggleStale(e.id)} disabled={!canWrite}>
                                  {e.stale ? "Mark fresh" : "Mark stale"}
                                </Button>
                              </div>
                            </li>
                          ))}
                          {selectedEvidence.filter((e) => e.polarity === "supports").length === 0 && (
                            <li className="text-xs text-slate-500">No supporting evidence yet.</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">Contradictory evidence</div>
                          <Badge variant="outline" className="border-slate-300">{selectedEvidence.filter((e) => e.polarity === "contradicts").length}</Badge>
                        </div>
                        <ul className="space-y-2">
                          {selectedEvidence.filter((e) => e.polarity === "contradicts").map((e) => (
                            <li key={e.id} className={cn("rounded border p-2 text-xs", e.stale ? "border-slate-200 bg-slate-50 opacity-70" : "border-red-200 bg-red-50")}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-800">{e.text}</span>
                                <Badge variant="outline" className="border-red-300 text-[10px] text-red-800">−{WEIGHT[e.weight] * (e.stale ? 0.5 : 1)}</Badge>
                              </div>
                              <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-600">
                                <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">{e.source}</a>
                                <Button size="sm" variant="ghost" onClick={() => toggleStale(e.id)} disabled={!canWrite}>
                                  {e.stale ? "Mark fresh" : "Mark stale"}
                                </Button>
                              </div>
                            </li>
                          ))}
                          {selectedEvidence.filter((e) => e.polarity === "contradicts").length === 0 && (
                            <li className="text-xs text-slate-500">No contradictions recorded.</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    <Card>
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Zap className="h-4 w-4 text-slate-500" /> Contributing factors
                        </div>
                        {selected.contributingFactors.length === 0 ? (
                          <div className="text-xs text-slate-500">None recorded.</div>
                        ) : (
                          <ul className="list-disc pl-4 text-xs text-slate-800 space-y-1">
                            {selected.contributingFactors.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        )}
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => setDialog("contributing")} disabled={!canWrite}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add factor
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Target className="h-4 w-4 text-slate-500" /> Affected dependencies
                        </div>
                        {selected.affectedDependencies.length === 0 ? (
                          <div className="text-xs text-slate-500">None recorded.</div>
                        ) : (
                          <ul className="text-xs text-slate-800 space-y-1">
                            {selected.affectedDependencies.map((d) => (
                              <li key={d}><Badge variant="outline" className="border-slate-300">{d}</Badge></li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <TriangleAlert className="h-4 w-4 text-slate-500" /> Unresolved questions
                        </div>
                        {selected.unresolvedQuestions.length === 0 ? (
                          <div className="text-xs text-slate-500">All questions answered.</div>
                        ) : (
                          <ul className="list-disc pl-4 text-xs text-slate-800 space-y-1">
                            {selected.unresolvedQuestions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Beaker className="h-4 w-4 text-slate-500" /> Recommended tests
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDialog("assign")} disabled={!canWrite}>
                            <User className="mr-1 h-3.5 w-3.5" /> Assign investigator
                          </Button>
                          <Button size="sm" onClick={() => setDialog("test")} disabled={!canWrite}>
                            <Beaker className="mr-1 h-3.5 w-3.5" /> Request diagnostic test
                          </Button>
                        </div>
                      </div>
                      {selected.recommendedTests.length === 0 && record.tests.filter((t) => t.hypothesisId === selected.id).length === 0 ? (
                        <div className="text-xs text-slate-500">No tests recorded yet.</div>
                      ) : (
                        <ul className="space-y-1 text-xs text-slate-800">
                          {selected.recommendedTests.map((t, i) => (
                            <li key={`r-${i}`} className="rounded border border-slate-200 bg-white p-2">
                              <Badge variant="outline" className="mr-2 border-slate-300 text-[10px]">Recommended</Badge>{t}
                            </li>
                          ))}
                          {record.tests.filter((t) => t.hypothesisId === selected.id).map((t) => (
                            <li key={t.id} className="rounded border border-indigo-200 bg-indigo-50 p-2">
                              <Badge variant="outline" className="mr-2 border-indigo-300 text-[10px] text-indigo-800">Requested</Badge>
                              {t.question}
                              <span className="ml-2 text-[11px] text-slate-500">· {new Date(t.createdAt).toLocaleTimeString()}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Causal graph */}
        <TabsContent value="graph" className="p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <GitBranch className="h-4 w-4 text-slate-500" /> Interactive causal graph
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setDialog("connect")} disabled={!canWrite}>
                    <Link2 className="mr-1 h-3.5 w-3.5" /> Connect nodes
                  </Button>
                </div>
                {/* Node grid */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {record.nodes.map((n) => {
                    const outgoing = record.edges.filter((e) => e.from === n.id);
                    const linkedH = n.hypothesisId ? record.hypotheses.find((h) => h.id === n.hypothesisId) : null;
                    return (
                      <div key={n.id} className={cn("rounded border p-2 text-xs", roleTone(n.role))}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-900">{n.label}</div>
                          <Badge variant="outline" className="border-slate-300 text-[10px]">
                            {n.role}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-600">{n.id}{n.affectedDependency ? ` · ${n.affectedDependency}` : ""}</div>
                        {linkedH && (
                          <button
                            className="mt-1 text-[11px] text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                            onClick={() => { setSelectedId(linkedH.id); setTab("overview"); }}
                          >
                            View hypothesis {linkedH.id} · {linkedH.confidence}%
                          </button>
                        )}
                        {outgoing.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-[11px] text-slate-700">
                            {outgoing.map((e) => (
                              <li key={e.id} className="flex items-start gap-1">
                                <ChevronRight className="h-3 w-3 shrink-0 text-slate-500" />
                                <span>
                                  <span className="font-medium">{e.kind}</span> → {record.nodes.find((x) => x.id === e.to)?.label ?? e.to}
                                  <span className="block text-slate-500">{e.rationale}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" disabled={!canWrite} onClick={() => markRole(n.id, "trigger")}>Mark trigger</Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" disabled={!canWrite} onClick={() => markRole(n.id, "contributing")}>Mark contributing</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldAlert className="h-4 w-4 text-slate-500" /> Unresolved contradictions
                </div>
                {unresolvedContradictions.length === 0 ? (
                  <div className="text-xs text-slate-500">None outstanding.</div>
                ) : (
                  <ul className="space-y-2">
                    {unresolvedContradictions.map((e) => {
                      const h = record.hypotheses.find((x) => x.id === e.hypothesisId);
                      return (
                        <li key={e.id} className="rounded border border-red-200 bg-red-50 p-2 text-xs text-slate-800">
                          <div className="font-medium">{h?.id ?? "?"} · {h?.text}</div>
                          <div className="mt-0.5">{e.text}</div>
                          <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline text-[11px]">{e.source}</a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Confidence history */}
        <TabsContent value="history" className="p-3">
          <div className="space-y-3">
            {record.hypotheses.map((h) => (
              <Card key={h.id}>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase text-slate-500">{h.id} · {h.state}</div>
                      <div className="text-sm text-slate-900">{h.text}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <History className="h-4 w-4 text-slate-500" />
                      Current {h.confidence}%
                    </div>
                  </div>
                  <ol className="space-y-1 border-l-2 border-slate-200 pl-3">
                    {h.confidenceHistory.map((c, i) => (
                      <li key={i} className="relative text-xs text-slate-800">
                        <span className="absolute -left-[7px] top-1 h-2 w-2 rounded-full bg-slate-400" />
                        <span className="font-semibold">{c.value}%</span>
                        <span className="text-slate-500"> · {new Date(c.at).toLocaleTimeString()}</span>
                        <div className="text-slate-700">{c.reason}</div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ Dialogs ------------------------------ */}

      <Dialog open={dialog === "create"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create hypothesis</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Textarea rows={3} value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Hypothesis statement" aria-label="Hypothesis" />
            <Select value={newTrigCause} onValueChange={(v) => setNewTrigCause(v as HypothesisRecord["triggerVsCause"])}>
              <SelectTrigger aria-label="Trigger vs cause"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trigger">Trigger (initiates)</SelectItem>
                <SelectItem value="cause">Cause (mechanism)</SelectItem>
                <SelectItem value="unclear">Trigger vs cause unclear</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-slate-500">Baseline confidence is 50% — recomputed only from explicit evidence weights.</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createHypothesis} disabled={!newText.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "evidence" || dialog === "contradict"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog === "contradict" ? "Add contradictory evidence" : "Add supporting evidence"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Textarea rows={3} value={evText} onChange={(e) => setEvText(e.target.value)} placeholder="Evidence text" aria-label="Evidence text" />
            <div className="grid gap-2 md:grid-cols-2">
              <Select value={evSource} onValueChange={setEvSource}>
                <SelectTrigger aria-label="Source"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Datadog">Datadog</SelectItem>
                  <SelectItem value="New Relic">New Relic</SelectItem>
                  <SelectItem value="Splunk">Splunk</SelectItem>
                  <SelectItem value="Tempo">Tempo</SelectItem>
                  <SelectItem value="Change Mgmt">Change Mgmt</SelectItem>
                  <SelectItem value="Config Store">Config Store</SelectItem>
                  <SelectItem value="Incident archive">Incident archive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={evWeight} onValueChange={(v) => setEvWeight(v as EvidenceStrength)}>
                <SelectTrigger aria-label="Weight"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">{weightLabel("weak")}</SelectItem>
                  <SelectItem value="moderate">{weightLabel("moderate")}</SelectItem>
                  <SelectItem value="strong">{weightLabel("strong")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-slate-500">Confidence updates deterministically from explicit weights only.</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => addEvidence(dialog === "contradict" ? "contradicts" : "supports")} disabled={!evText.trim()}>
              {dialog === "contradict" ? "Add contradiction" : "Add evidence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "merge"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Merge hypothesis</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-xs text-slate-600">Move evidence from {selected?.id} into another hypothesis. The source is preserved and marked rejected with rationale.</div>
            <Select value={mergeInto} onValueChange={setMergeInto}>
              <SelectTrigger aria-label="Merge target"><SelectValue placeholder="Choose target hypothesis" /></SelectTrigger>
              <SelectContent>
                {record.hypotheses.filter((h) => h.id !== selected?.id && h.state !== "Rejected").map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.id} · {h.text.slice(0, 60)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={merge} disabled={!mergeInto}>Merge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "reject"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject hypothesis</DialogTitle></DialogHeader>
          <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Why is this rejected? Rationale is preserved." aria-label="Rejection rationale" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={reject} disabled={!rejectReason.trim()}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "test"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request diagnostic test</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Textarea rows={3} value={testQuestion} onChange={(e) => setTestQuestion(e.target.value)} placeholder="What should the test determine?" aria-label="Test question" />
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger aria-label="Assignee"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DW-DB-03">DW-DB-03 (Database)</SelectItem>
                <SelectItem value="DW-CHANGE-05">DW-CHANGE-05 (Change)</SelectItem>
                <SelectItem value="DW-RCA-08">DW-RCA-08 (RCA)</SelectItem>
                <SelectItem value="DW-NET-02">DW-NET-02 (Network)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-slate-500">A matching task is created in the Investigation Workspace.</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={requestTest} disabled={!testQuestion.trim()}>Request test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "assign"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign investigator</DialogTitle></DialogHeader>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger aria-label="Investigator"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DW-DB-03">DW-DB-03 (Database)</SelectItem>
              <SelectItem value="DW-CHANGE-05">DW-CHANGE-05 (Change)</SelectItem>
              <SelectItem value="DW-RCA-08">DW-RCA-08 (RCA)</SelectItem>
              <SelectItem value="Priya Raman">Priya Raman</SelectItem>
              <SelectItem value="Maya Chen">Maya Chen</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={assignInvestigator}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "connect"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect causal relationship</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <Select value={connFrom} onValueChange={setConnFrom}>
                <SelectTrigger aria-label="From node"><SelectValue placeholder="From" /></SelectTrigger>
                <SelectContent>
                  {record.nodes.map((n) => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={connTo} onValueChange={setConnTo}>
                <SelectTrigger aria-label="To node"><SelectValue placeholder="To" /></SelectTrigger>
                <SelectContent>
                  {record.nodes.map((n) => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Select value={connKind} onValueChange={(v) => setConnKind(v as EdgeKind)}>
              <SelectTrigger aria-label="Relationship"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="causes">causes</SelectItem>
                <SelectItem value="contributes-to">contributes-to</SelectItem>
                <SelectItem value="correlates-with">correlates-with</SelectItem>
              </SelectContent>
            </Select>
            <Textarea rows={2} value={connWhy} onChange={(e) => setConnWhy(e.target.value)} placeholder="Rationale (required)" aria-label="Rationale" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={connectEdge} disabled={!connFrom || !connTo || connFrom === connTo || !connWhy.trim()}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "contributing"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add contributing factor</DialogTitle></DialogHeader>
          <Textarea rows={2} value={factorText} onChange={(e) => setFactorText(e.target.value)} placeholder="Contributing factor" aria-label="Contributing factor" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={addFactor} disabled={!factorText.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
