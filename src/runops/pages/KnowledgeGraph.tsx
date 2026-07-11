/**
 * Page 40 · Knowledge Graph & Operational Search
 * Route: /runops/knowledge
 *
 * Connected, access-aware operational memory across services, components,
 * runbooks, incidents, postmortems, problems, known errors, changes,
 * executions, evidence, SLOs, people, digital workers, and connectors.
 *
 * Search runs in two modes:
 *  - keyword: substring/tag over titles, refs, tags, snippets.
 *  - semantic: a deterministic BM25-lite scorer + synonym expansion so the
 *    UI can prove why a hit ranked as "Strong" without a live embedding call.
 *
 * Every hit carries: sourceRef, freshness, confidence, validator, sources[],
 * contradictions[], accessScope. Restricted rows are shown as gated stubs.
 * AI-generated items never auto-promote to "validated".
 *
 * Persistence (localStorage):
 *   runops.knowledge.items.v1       → KnowledgeItem[]
 *   runops.knowledge.reviews.v1     → ReviewRequest[]
 *   runops.knowledge.gaps.v1        → Gap[]
 *   runops.knowledge.contradict.v1  → Contradiction[]
 *   runops.novavalidated.v1         → cross-screen validated pool for Ask NOVA
 *   runops.knownerrors.v1           → cross-screen alert-triage
 *   runops.operations.tasks.v1      → cross-screen gap tasks
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowUpRight, BadgeCheck, Ban, Book, CheckCircle2,
  ClipboardList, Clock, Database, ExternalLink, Filter, FileSearch, GitCompare,
  Layers, LinkIcon, Lock, Network, Search, ShieldAlert, ShieldCheck, Sparkles,
  Timer, TrendingDown, Users, XCircle,
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

type EntityKind =
  | "service" | "component" | "runbook" | "incident" | "postmortem"
  | "problem" | "known-error" | "change" | "execution" | "evidence"
  | "slo" | "person" | "digital-worker" | "connector";

type SearchMode = "semantic" | "keyword";

type AccessScope = "public" | "internal" | "restricted:security" | "restricted:pii";

type Validation = "Validated" | "Provisional" | "AI draft" | "Contradicted" | "Obsolete";

interface KnowledgeItem {
  id: string;               // KN-####
  kind: EntityKind;
  title: string;
  refs: string[];           // e.g. ["INC-10482", "PM-10482"]
  snippet: string;
  tags: string[];
  serviceIds: string[];
  sourceRef: string;        // e.g. "runops.postmortems.v1#PM-10482"
  sources: string[];        // supporting docs
  freshnessAt: string;      // ISO
  confidence: number;       // 0..1
  validation: Validation;
  validatedBy?: string;     // e.g. "sre-lead@contoso"
  validatedAt?: string;
  aiGenerated: boolean;
  accessScope: AccessScope;
  relatedIds: string[];     // KN ids
  contradictsIds: string[]; // KN ids that conflict with this
  createdAt: string;
}

interface ReviewRequest {
  id: string;               // RV-####
  itemId: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  state: "Open" | "Assigned" | "Complete";
  assignedTo?: string;
}

interface Gap {
  id: string;               // GAP-####
  query: string;
  detectedAt: string;
  note: string;
  taskRef?: string;         // operations.tasks id
}

interface Contradiction {
  id: string;
  aId: string;
  bId: string;
  note: string;
  detectedAt: string;
}

type TabKey = "search" | "graph" | "contradictions" | "gaps" | "review";
type DialogKey =
  | null
  | { kind: "preview"; itemId: string }
  | { kind: "compare"; aId: string; bId: string }
  | { kind: "flag-stale"; itemId: string }
  | { kind: "request-review"; itemId: string }
  | { kind: "promote"; itemId: string }
  | { kind: "create"; }
  | { kind: "link-runbook"; itemId: string }
  | { kind: "link-known-error"; itemId: string }
  | { kind: "mark-obsolete"; itemId: string };

/* -------------------------------- Storage ------------------------------- */

const K_KEY = "runops.knowledge.items.v1";
const R_KEY = "runops.knowledge.reviews.v1";
const G_KEY = "runops.knowledge.gaps.v1";
const C_KEY = "runops.knowledge.contradict.v1";
const NOVA_KEY = "runops.novavalidated.v1";
const KE_KEY = "runops.knownerrors.v1";
const OPS_KEY = "runops.operations.tasks.v1";

const readList = <T,>(k: string): T[] => {
  try { const raw = localStorage.getItem(k); if (!raw) return []; const v = JSON.parse(raw); return Array.isArray(v) ? (v as T[]) : []; } catch { return []; }
};
const writeList = <T,>(k: string, v: T[]): void => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* --------------------------------- Seed --------------------------------- */

const seedItems = (): KnowledgeItem[] => {
  const t = Date.now();
  const days = (n: number) => new Date(t - n * 864e5).toISOString();
  const base: KnowledgeItem[] = [
    {
      id: "KN-1001", kind: "postmortem", title: "PM-10482 · Checkout latency root cause: SQL plan regression",
      refs: ["INC-10482", "PM-10482", "CHG-20391"],
      snippet: "Order service p95 regressed to 3.4s after CHG-20391 deployed a stats-refresh job that invalidated the query plan for hot cart-summary reads. Recurrence recorded 3× in 60d. Corrective actions: query-plan comparison precheck + stronger customer-journey validation.",
      tags: ["checkout", "latency", "sql", "plan-regression"],
      serviceIds: ["checkout-api", "order-db"],
      sourceRef: "runops.postmortems.v1#PM-10482",
      sources: ["Postmortem PM-10482", "Datadog trace #a7b12", "Slack #incident-10482"],
      freshnessAt: days(4), confidence: 0.92,
      validation: "Validated", validatedBy: "sre-lead@contoso", validatedAt: days(3),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1002", "KN-1004", "KN-1010"], contradictsIds: ["KN-1003"], createdAt: days(5),
    },
    {
      id: "KN-1002", kind: "known-error", title: "KE-441 · SQL connection pool saturation on order-db (v14)",
      refs: ["KE-441", "INC-10482", "INC-10221"],
      snippet: "Pool exhaustion under peak checkout load; symptoms include HikariCP 30s wait timeouts and 5xx bursts. Workaround: raise pool by +25 with cooldown. Permanent fix tracked in CHG-20450.",
      tags: ["order-db", "sql", "connection-pool", "saturation"],
      serviceIds: ["order-db", "checkout-api"],
      sourceRef: "runops.knownerrors.v1#KE-441",
      sources: ["Known error KE-441", "INC-10482 telemetry", "DB team wiki"],
      freshnessAt: days(2), confidence: 0.88,
      validation: "Validated", validatedBy: "db-owner@contoso", validatedAt: days(2),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1001", "KN-1005"], contradictsIds: [], createdAt: days(30),
    },
    {
      id: "KN-1003", kind: "evidence", title: "Old wiki note: 'Checkout latency caused by CDN cache miss'",
      refs: ["WIKI-778"],
      snippet: "Circa 2024 note attributing checkout latency to CDN cache misses. Contradicted by PM-10482 which shows CDN hit ratio was 98.7% during the incident.",
      tags: ["checkout", "latency", "cdn"],
      serviceIds: ["checkout-api"],
      sourceRef: "runops.evidence.v1#WIKI-778",
      sources: ["Legacy wiki export"],
      freshnessAt: days(410), confidence: 0.35,
      validation: "Contradicted",
      aiGenerated: false, accessScope: "internal",
      relatedIds: [], contradictsIds: ["KN-1001"], createdAt: days(410),
    },
    {
      id: "KN-1004", kind: "runbook", title: "RB-3121 · Checkout latency remediation",
      refs: ["RB-3121"],
      snippet: "Restart hot pool, refresh materialized cart summary, verify journey completion. Two proposals open on RB-3121: plan-comparison precheck + journey validation.",
      tags: ["runbook", "checkout", "remediation"],
      serviceIds: ["checkout-api"],
      sourceRef: "runops.runbooks.v1#RB-3121",
      sources: ["Runbook RB-3121 v14"],
      freshnessAt: days(28), confidence: 0.86,
      validation: "Validated", validatedBy: "sre-lead@contoso", validatedAt: days(28),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1001", "KN-1002"], contradictsIds: [], createdAt: days(120),
    },
    {
      id: "KN-1005", kind: "change", title: "CHG-20391 · Stats-refresh job deploy on order-db",
      refs: ["CHG-20391"],
      snippet: "Change that triggered plan invalidation on cart-summary reads. Rollback executed via RB-3055. Post-change validation missed the plan-shape comparison.",
      tags: ["change", "sql", "order-db"],
      serviceIds: ["order-db"],
      sourceRef: "runops.changes.v1#CHG-20391",
      sources: ["Change CHG-20391 record", "Runbook RB-3055 execution log"],
      freshnessAt: days(35), confidence: 0.9,
      validation: "Validated", validatedBy: "change-manager@contoso", validatedAt: days(34),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1001"], contradictsIds: [], createdAt: days(36),
    },
    {
      id: "KN-1006", kind: "incident", title: "INC-10482 · Global order processing p95 breach",
      refs: ["INC-10482"],
      snippet: "SEV-2 · 47min. Customer journey completion dropped to 82%. Resolved via RB-3121. Recurrence pattern flagged; see PM-10482.",
      tags: ["incident", "checkout", "sev2"],
      serviceIds: ["checkout-api", "order-db"],
      sourceRef: "runops.incidents.v1#INC-10482",
      sources: ["Incident record INC-10482", "Comms channel #incident-10482"],
      freshnessAt: days(4), confidence: 0.94,
      validation: "Validated", validatedBy: "incident-commander@contoso", validatedAt: days(3),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1001", "KN-1002", "KN-1004"], contradictsIds: [], createdAt: days(5),
    },
    {
      id: "KN-1007", kind: "person", title: "Alex Chen · Order DB owner",
      refs: ["USER-alex-chen"],
      snippet: "Owner of order-db and its runbooks. Rotation lead for DB SRE. Preferred contact for query-plan questions.",
      tags: ["expert", "order-db"],
      serviceIds: ["order-db"],
      sourceRef: "runops.services.owners.v1#alex-chen",
      sources: ["Ownership registry"],
      freshnessAt: days(10), confidence: 0.9,
      validation: "Validated", validatedBy: "hr-sync@contoso", validatedAt: days(10),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1002", "KN-1005"], contradictsIds: [], createdAt: days(120),
    },
    {
      id: "KN-1008", kind: "digital-worker", title: "DW-SRE-Application · Application SRE worker",
      refs: ["DW-SRE-Application"],
      snippet: "Investigates application-tier symptoms; contributes to collaboration sessions on checkout incidents.",
      tags: ["digital-worker", "sre", "checkout"],
      serviceIds: ["checkout-api"],
      sourceRef: "runops.digitalworkers.v1#DW-SRE-Application",
      sources: ["Digital worker catalog"],
      freshnessAt: days(7), confidence: 0.85,
      validation: "Validated", validatedBy: "worker-ops@contoso", validatedAt: days(7),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1001", "KN-1006"], contradictsIds: [], createdAt: days(60),
    },
    {
      id: "KN-1009", kind: "slo", title: "SLO-9001 · Checkout availability 99.95%",
      refs: ["SLO-9001"],
      snippet: "Budget consumed 62% MTD; INC-10482 burned 34%. Linked runbook RB-3121. Policy: change freeze at burn ≥6×.",
      tags: ["slo", "checkout", "availability"],
      serviceIds: ["checkout-api"],
      sourceRef: "runops.slos.v1#SLO-9001",
      sources: ["SLO configuration", "Burn history"],
      freshnessAt: days(1), confidence: 0.9,
      validation: "Validated", validatedBy: "sre-lead@contoso", validatedAt: days(1),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1001", "KN-1004"], contradictsIds: [], createdAt: days(200),
    },
    {
      id: "KN-1010", kind: "problem", title: "Query plan regression pattern on cart-summary reads",
      refs: ["PB-8811"],
      snippet: "AI-drafted synthesis of 3 checkout incidents. Common cause: cart-summary plan flips to nested-loop after stats refresh. Draft — expert review pending.",
      tags: ["problem", "sql", "plan-regression"],
      serviceIds: ["order-db"],
      sourceRef: "runops.problems.v1#PB-8811",
      sources: ["INC-10482", "INC-9812", "INC-9455"],
      freshnessAt: days(2), confidence: 0.62,
      validation: "AI draft",
      aiGenerated: true, accessScope: "internal",
      relatedIds: ["KN-1001", "KN-1005"], contradictsIds: [], createdAt: days(2),
    },
    {
      id: "KN-1011", kind: "evidence", title: "Security incident evidence bundle (restricted)",
      refs: ["EV-7220"],
      snippet: "",
      tags: ["security", "restricted"],
      serviceIds: ["identity-svc"],
      sourceRef: "runops.evidence.v1#EV-7220",
      sources: ["Security team"],
      freshnessAt: days(9), confidence: 0.8,
      validation: "Validated", validatedBy: "security-lead@contoso", validatedAt: days(9),
      aiGenerated: false, accessScope: "restricted:security",
      relatedIds: [], contradictsIds: [], createdAt: days(9),
    },
    {
      id: "KN-1012", kind: "connector", title: "Datadog connector · trace/log source",
      refs: ["CON-DDG"],
      snippet: "Primary source for checkout-api traces and logs. Latency: 4s ingest. Rate limits documented in Connectors page.",
      tags: ["connector", "datadog"],
      serviceIds: [],
      sourceRef: "runops.connectors.v1#datadog",
      sources: ["Connectors catalog"],
      freshnessAt: days(1), confidence: 0.95,
      validation: "Validated", validatedBy: "platform-ops@contoso", validatedAt: days(1),
      aiGenerated: false, accessScope: "internal",
      relatedIds: [], contradictsIds: [], createdAt: days(300),
    },
    {
      id: "KN-1013", kind: "component", title: "cart-summary read path (order-db)",
      refs: ["CMP-cart-summary"],
      snippet: "Hot read path from checkout-api into order-db. Uses composite index idx_cart_customer_time. Sensitive to plan changes on stats refresh.",
      tags: ["component", "order-db", "hot-path"],
      serviceIds: ["order-db", "checkout-api"],
      sourceRef: "runops.components.v1#cart-summary",
      sources: ["Service catalog"],
      freshnessAt: days(18), confidence: 0.86,
      validation: "Validated", validatedBy: "db-owner@contoso", validatedAt: days(18),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1002", "KN-1010"], contradictsIds: [], createdAt: days(300),
    },
    {
      id: "KN-1014", kind: "execution", title: "EXEC-55231 · RB-3121 run resolving INC-10482",
      refs: ["EXEC-55231"],
      snippet: "6/6 steps green. Manual override on step 4 (pool bump). Evidence bundle complete. Duration 8m14s.",
      tags: ["execution", "runbook", "checkout"],
      serviceIds: ["checkout-api"],
      sourceRef: "runops.executions.v1#EXEC-55231",
      sources: ["Execution log", "Evidence bundle"],
      freshnessAt: days(4), confidence: 0.9,
      validation: "Validated", validatedBy: "sre-engineer@contoso", validatedAt: days(4),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1004", "KN-1006"], contradictsIds: [], createdAt: days(4),
    },
    {
      id: "KN-1015", kind: "service", title: "checkout-api",
      refs: ["SVC-checkout-api"],
      snippet: "Front-door for Global Order Processing. Owner: team-checkout-sre. SLOs: availability 99.95%, checkout latency p95 < 800ms.",
      tags: ["service", "checkout"],
      serviceIds: ["checkout-api"],
      sourceRef: "runops.services.v1#checkout-api",
      sources: ["Service registry"],
      freshnessAt: days(6), confidence: 0.92,
      validation: "Validated", validatedBy: "service-owner@contoso", validatedAt: days(6),
      aiGenerated: false, accessScope: "internal",
      relatedIds: ["KN-1004", "KN-1009", "KN-1013"], contradictsIds: [], createdAt: days(500),
    },
  ];
  return base;
};

/* -------------------------------- Search -------------------------------- */

const SYNONYMS: Record<string, string[]> = {
  latency: ["slow", "p95", "p99", "response", "time"],
  saturation: ["exhaustion", "full", "pool", "backpressure"],
  regression: ["degrad", "worse", "regress"],
  connection: ["pool", "conn", "hikari"],
  checkout: ["cart", "order"],
  incident: ["outage", "sev"],
  runbook: ["playbook", "procedure"],
  plan: ["query-plan", "explain"],
};

const tokenize = (s: string): string[] =>
  s.toLowerCase().replace(/[^\w\-]/g, " ").split(/\s+/).filter((t) => t.length > 1);

const expandTerms = (terms: string[]): string[] => {
  const set = new Set(terms);
  for (const t of terms) {
    const syns = SYNONYMS[t];
    if (syns) syns.forEach((s) => set.add(s));
  }
  return Array.from(set);
};

interface Scored { item: KnowledgeItem; score: number; hits: string[]; }

const scoreItem = (item: KnowledgeItem, terms: string[], mode: SearchMode): Scored => {
  const haystack = [
    item.title, item.snippet, item.tags.join(" "),
    item.refs.join(" "), item.serviceIds.join(" "),
    item.sourceRef, item.kind,
  ].join(" ").toLowerCase();
  const use = mode === "semantic" ? expandTerms(terms) : terms;
  let score = 0;
  const hits: string[] = [];
  for (const t of use) {
    if (!t) continue;
    const occ = (haystack.match(new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g")) ?? []).length;
    if (occ > 0) {
      const weight = mode === "semantic" && !terms.includes(t) ? 0.5 : 1.0;
      score += occ * weight * (item.confidence + 0.4);
      hits.push(t);
    }
    // exact ref boost
    if (item.refs.some((r) => r.toLowerCase() === t)) { score += 8; hits.push(`ref:${t}`); }
  }
  // Freshness penalty (>180d halves)
  const ageDays = (Date.now() - new Date(item.freshnessAt).getTime()) / 864e5;
  if (ageDays > 180) score *= 0.5;
  else if (ageDays > 60) score *= 0.85;
  // Validation adjustment
  if (item.validation === "Contradicted") score *= 0.6;
  if (item.validation === "AI draft") score *= 0.8;
  if (item.validation === "Obsolete") score *= 0.3;
  return { item, score: Math.round(score * 10) / 10, hits };
};

/* --------------------------------- UI ---------------------------------- */

const kindLabel: Record<EntityKind, string> = {
  service: "Service", component: "Component", runbook: "Runbook", incident: "Incident",
  postmortem: "Postmortem", problem: "Problem", "known-error": "Known error", change: "Change",
  execution: "Execution", evidence: "Evidence", slo: "SLO", person: "Person",
  "digital-worker": "Digital worker", connector: "Connector",
};

const kindIcon: Record<EntityKind, React.ReactNode> = {
  service: <Layers className="h-3.5 w-3.5" />, component: <Layers className="h-3.5 w-3.5" />,
  runbook: <Book className="h-3.5 w-3.5" />, incident: <AlertTriangle className="h-3.5 w-3.5" />,
  postmortem: <FileSearch className="h-3.5 w-3.5" />, problem: <Search className="h-3.5 w-3.5" />,
  "known-error": <ShieldAlert className="h-3.5 w-3.5" />, change: <Activity className="h-3.5 w-3.5" />,
  execution: <ClipboardList className="h-3.5 w-3.5" />, evidence: <Database className="h-3.5 w-3.5" />,
  slo: <BadgeCheck className="h-3.5 w-3.5" />, person: <Users className="h-3.5 w-3.5" />,
  "digital-worker": <Sparkles className="h-3.5 w-3.5" />, connector: <Network className="h-3.5 w-3.5" />,
};

const validationTone = (v: Validation): string => {
  switch (v) {
    case "Validated":     return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Provisional":   return "bg-sky-50 text-sky-800 border-sky-200";
    case "AI draft":      return "bg-violet-50 text-violet-800 border-violet-200";
    case "Contradicted":  return "bg-rose-50 text-rose-800 border-rose-200";
    case "Obsolete":      return "bg-slate-100 text-slate-700 border-slate-300";
  }
};

const ageLabel = (iso: string): { text: string; stale: boolean } => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return { text: d <= 0 ? "today" : `${d}d ago`, stale: d > 180 };
};

/* -------------------------------- Page --------------------------------- */

export default function KnowledgeGraph(): JSX.Element {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);

  const [tab, setTab] = useState<TabKey>("search");
  const [query, setQuery] = useState("checkout latency");
  const [mode, setMode] = useState<SearchMode>("semantic");
  const [kindFilter, setKindFilter] = useState<"all" | EntityKind>("all");
  const [validationFilter, setValidationFilter] = useState<"all" | Validation>("all");
  const [freshnessFilter, setFreshnessFilter] = useState<"any" | "fresh" | "stale">("any");
  const [selectedId, setSelectedId] = useState<string | null>("KN-1001");
  const [dialog, setDialog] = useState<DialogKey>(null);
  const [inp, setInp] = useState<Record<string, string>>({});
  const [connectorDown, setConnectorDown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let it = readList<KnowledgeItem>(K_KEY); if (it.length === 0) { it = seedItems(); writeList(K_KEY, it); } setItems(it);
      setReviews(readList<ReviewRequest>(R_KEY));
      setGaps(readList<Gap>(G_KEY));
      let cs = readList<Contradiction>(C_KEY);
      if (cs.length === 0) {
        cs = [{ id: rid("CT"), aId: "KN-1001", bId: "KN-1003", note: "PM-10482 attributes to SQL plan regression; WIKI-778 attributes to CDN cache miss.", detectedAt: nowIso() }];
        writeList(C_KEY, cs);
      }
      setContradictions(cs);
      setLoading(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load knowledge.");
      setLoading(false);
    }
  }, []);

  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string) => {
    ops.pushNotification({ kind, title, detail, entityRef: entityRef ?? "knowledge", route: "/runops/knowledge" });
  }, [ops]);

  const persistItems = useCallback((next: KnowledgeItem[]) => { writeList(K_KEY, next); setItems(next); }, []);
  const persistReviews = useCallback((next: ReviewRequest[]) => { writeList(R_KEY, next); setReviews(next); }, []);
  const persistGaps = useCallback((next: Gap[]) => { writeList(G_KEY, next); setGaps(next); }, []);

  const canRead = useCallback((it: KnowledgeItem): boolean => {
    if (it.accessScope === "public" || it.accessScope === "internal") return true;
    if (it.accessScope === "restricted:security") return ops.role === "Incident Commander" || ops.role === "Platform Engineer";
    if (it.accessScope === "restricted:pii") return ops.role === "Incident Commander";
    return false;
  }, [ops.role]);

  const results = useMemo<Scored[]>(() => {
    const q = query.trim();
    if (!q) return [];
    const terms = tokenize(q);
    const scored = items
      .map((it) => scoreItem(it, terms, mode))
      .filter((s) => s.score > 0);
    return scored
      .filter((s) => kindFilter === "all" || s.item.kind === kindFilter)
      .filter((s) => validationFilter === "all" || s.item.validation === validationFilter)
      .filter((s) => {
        if (freshnessFilter === "any") return true;
        const stale = ageLabel(s.item.freshnessAt).stale;
        return freshnessFilter === "stale" ? stale : !stale;
      })
      .sort((a, b) => b.score - a.score);
  }, [items, query, mode, kindFilter, validationFilter, freshnessFilter]);

  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId]);

  const openDialog = (d: Exclude<DialogKey, null>) => { setInp({}); setDialog(d); };
  const closeDialog = () => { setDialog(null); setInp({}); };

  /* ------------------------------- Actions ---------------------------- */

  const doFlagStale = () => {
    if (!dialog || dialog.kind !== "flag-stale") return;
    persistItems(items.map((i) => i.id === dialog.itemId
      ? { ...i, validation: i.validation === "Validated" ? "Provisional" : i.validation, freshnessAt: new Date(Date.now() - 365 * 864e5).toISOString() }
      : i));
    audit("Knowledge flagged stale", `${dialog.itemId} · ${inp.reason || "flagged"}`, "warning", dialog.itemId);
    closeDialog();
  };

  const doRequestReview = () => {
    if (!dialog || dialog.kind !== "request-review") return;
    const rv: ReviewRequest = {
      id: rid("RV"), itemId: dialog.itemId, reason: inp.reason || "Expert review requested",
      requestedBy: ops.role, requestedAt: nowIso(), state: "Open", assignedTo: inp.assignedTo,
    };
    persistReviews([rv, ...reviews]);
    audit("Expert review requested", `${rv.id} on ${dialog.itemId}`, "info", dialog.itemId);
    closeDialog();
  };

  const doPromote = () => {
    if (!dialog || dialog.kind !== "promote") return;
    const validator = (inp.validator || "").trim();
    if (!validator) return;
    const target = items.find((i) => i.id === dialog.itemId);
    if (!target) return;
    if (target.aiGenerated && target.validation !== "Validated" && ops.role !== "Incident Commander" && ops.role !== "Platform Engineer" && ops.role !== "SRE Engineer") {
      audit("Promotion blocked", `AI-drafted item ${target.id} needs expert (SRE/Platform/IC) validator.`, "warning", target.id);
      return;
    }
    persistItems(items.map((i) => i.id === target.id
      ? { ...i, validation: "Validated" as Validation, validatedBy: validator, validatedAt: nowIso() }
      : i));
    // Cross-screen: publish to Ask NOVA validated pool
    const nova = readList<{ id: string; itemId: string; title: string; validator: string; at: string }>(NOVA_KEY);
    nova.unshift({ id: rid("NV"), itemId: target.id, title: target.title, validator, at: nowIso() });
    writeList(NOVA_KEY, nova);
    audit("Knowledge validated", `${target.id} promoted by ${validator}. Available to Ask NOVA & digital workers.`, "info", target.id);
    closeDialog();
  };

  const doCreate = () => {
    if (!dialog || dialog.kind !== "create") return;
    const title = (inp.title || "").trim();
    if (!title) return;
    const item: KnowledgeItem = {
      id: rid("KN"), kind: (inp.kind as EntityKind) || "evidence",
      title, refs: (inp.refs || "").split(",").map((x) => x.trim()).filter(Boolean),
      snippet: inp.snippet || "",
      tags: (inp.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
      serviceIds: (inp.services || "").split(",").map((x) => x.trim()).filter(Boolean),
      sourceRef: (inp.sourceRef || "manual").trim(),
      sources: (inp.sources || "Author-created").split("\n").map((x) => x.trim()).filter(Boolean),
      freshnessAt: nowIso(), confidence: 0.6,
      validation: "Provisional", aiGenerated: false, accessScope: "internal",
      relatedIds: [], contradictsIds: [], createdAt: nowIso(),
    };
    persistItems([item, ...items]);
    audit("Knowledge item created", `${item.id} · ${item.title}`, "info", item.id);
    closeDialog();
  };

  const doLinkRunbook = () => {
    if (!dialog || dialog.kind !== "link-runbook") return;
    const rb = (inp.runbookId || "").trim();
    if (!rb) return;
    persistItems(items.map((i) => i.id === dialog.itemId
      ? { ...i, refs: Array.from(new Set([...i.refs, rb])), relatedIds: i.relatedIds }
      : i));
    audit("Knowledge linked to runbook", `${dialog.itemId} → ${rb}. Appears in Runbook Detail.`, "info", dialog.itemId);
    closeDialog();
  };

  const doLinkKnownError = () => {
    if (!dialog || dialog.kind !== "link-known-error") return;
    const ke = (inp.knownErrorId || "").trim();
    if (!ke) return;
    persistItems(items.map((i) => i.id === dialog.itemId
      ? { ...i, refs: Array.from(new Set([...i.refs, ke])) }
      : i));
    // Cross-screen: known errors pool → Alert Triage
    const list = readList<{ id: string; itemId: string; knownErrorId: string; at: string }>(KE_KEY);
    list.unshift({ id: rid("KE"), itemId: dialog.itemId, knownErrorId: ke, at: nowIso() });
    writeList(KE_KEY, list);
    audit("Known-error link created", `${dialog.itemId} ↔ ${ke}. Visible in Alert Triage.`, "info", dialog.itemId);
    closeDialog();
  };

  const doMarkObsolete = () => {
    if (!dialog || dialog.kind !== "mark-obsolete") return;
    persistItems(items.map((i) => i.id === dialog.itemId
      ? { ...i, validation: "Obsolete" as Validation, validatedBy: ops.role, validatedAt: nowIso() }
      : i));
    audit("Marked obsolete", `${dialog.itemId} marked obsolete by ${ops.role}.`, "warning", dialog.itemId);
    closeDialog();
  };

  const declareGap = () => {
    const q = query.trim(); if (!q) return;
    const gap: Gap = { id: rid("GAP"), query: q, detectedAt: nowIso(), note: "No result — task created." };
    // Cross-screen: operations task
    const ops_tasks = readList<{ id: string; kind: string; title: string; source: string; createdAt: string }>(OPS_KEY);
    const taskId = rid("OPT");
    ops_tasks.unshift({ id: taskId, kind: "knowledge.gap", title: `Fill knowledge gap: ${q}`, source: "runops.knowledge", createdAt: nowIso() });
    writeList(OPS_KEY, ops_tasks);
    gap.taskRef = taskId;
    persistGaps([gap, ...gaps]);
    audit("Knowledge gap logged", `Task ${taskId} created for "${q}".`, "warning", taskId);
  };

  const toggleConnector = () => setConnectorDown((v) => !v);

  /* --------------------------------- UI --------------------------------- */

  if (loading) return (
    <div className="p-6"><EntityHeader title="Knowledge Graph & Operational Search" subtitle="Loading…" />
      <div className="mt-6 text-sm text-slate-500 flex items-center gap-2"><Timer className="h-4 w-4 animate-pulse" /> Loading…</div>
    </div>
  );
  if (loadError) return (
    <div className="p-6"><EntityHeader title="Knowledge Graph & Operational Search" subtitle="Failed to load" />
      <Card className="mt-6 border-rose-200 bg-rose-50"><CardContent className="p-4 text-sm text-rose-800 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5" /><div><div className="font-medium">Could not load knowledge.</div><div className="text-rose-700/80 mt-1">{loadError}</div></div>
      </CardContent></Card>
    </div>
  );

  const canonicalSearches = ["checkout latency", "SQL connection saturation", "INC-10482", "CHG-20391", "query plan regression"];
  const strongMatch = results.length > 0 && results[0].score >= 8;

  return (
    <div className="p-6 space-y-6">
      <EntityHeader
        title="Knowledge Graph & Operational Search"
        subtitle="Access-aware operational memory · every hit carries source, freshness, confidence, and validator."
        meta={
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{items.length} knowledge items</Badge>
            <Badge variant="outline" className={cn(validationTone("Contradicted"))}>{contradictions.length} contradictions</Badge>
            <Badge variant="outline" className={cn(validationTone("AI draft"))}>{items.filter((i) => i.validation === "AI draft").length} AI drafts</Badge>
            <Badge variant="outline">{reviews.filter((r) => r.state !== "Complete").length} in review</Badge>
            <Badge variant="outline">{gaps.length} gaps</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" aria-pressed={connectorDown} onClick={toggleConnector}>
              {connectorDown ? "Search: Down" : "Search: OK"}
            </Button>
            <Button size="sm" disabled={!canWrite} onClick={() => openDialog({ kind: "create" })}>
              <Sparkles className="h-4 w-4 mr-1" />Create knowledge
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> You have <strong className="mx-1">read-only</strong> access. Mutations disabled.
          </CardContent>
        </Card>
      )}
      {connectorDown && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-3 text-sm text-rose-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Semantic search connector <strong className="mx-1">unavailable</strong>. Results are keyword-only until it recovers.
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="search"><Search className="h-3.5 w-3.5 mr-1" />Search & preview</TabsTrigger>
          <TabsTrigger value="graph"><Network className="h-3.5 w-3.5 mr-1" />Relationship graph</TabsTrigger>
          <TabsTrigger value="contradictions"><GitCompare className="h-3.5 w-3.5 mr-1" />Contradictions</TabsTrigger>
          <TabsTrigger value="gaps"><TrendingDown className="h-3.5 w-3.5 mr-1" />Gaps</TabsTrigger>
          <TabsTrigger value="review"><ClipboardList className="h-3.5 w-3.5 mr-1" />Expert review</TabsTrigger>
        </TabsList>

        {/* Search --------------------------------------------------------- */}
        <TabsContent value="search" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-3 space-y-3">
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input aria-label="Search operational knowledge" placeholder="Search error, symptom, log text, service, or question…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
                </div>
                <Select value={mode} onValueChange={(v) => setMode(v as SearchMode)}>
                  <SelectTrigger className="w-40" aria-label="Mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semantic</SelectItem>
                    <SelectItem value="keyword">Keyword</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="text-xs text-slate-500 mr-1 flex items-center gap-1"><Filter className="h-3 w-3" />Filters</div>
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
                  <SelectTrigger className="w-40" aria-label="Kind"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All kinds</SelectItem>
                    {(Object.keys(kindLabel) as EntityKind[]).map((k) => (
                      <SelectItem key={k} value={k}>{kindLabel[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={validationFilter} onValueChange={(v) => setValidationFilter(v as typeof validationFilter)}>
                  <SelectTrigger className="w-44" aria-label="Validation"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All validations</SelectItem>
                    <SelectItem value="Validated">Validated</SelectItem>
                    <SelectItem value="Provisional">Provisional</SelectItem>
                    <SelectItem value="AI draft">AI draft</SelectItem>
                    <SelectItem value="Contradicted">Contradicted</SelectItem>
                    <SelectItem value="Obsolete">Obsolete</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={freshnessFilter} onValueChange={(v) => setFreshnessFilter(v as typeof freshnessFilter)}>
                  <SelectTrigger className="w-36" aria-label="Freshness"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any age</SelectItem>
                    <SelectItem value="fresh">Fresh (≤180d)</SelectItem>
                    <SelectItem value="stale">Stale (&gt;180d)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-slate-500">Canonical:</div>
                {canonicalSearches.map((q) => (
                  <Button key={q} size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setQuery(q)}>{q}</Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 text-xs">
            {results.length > 0 && strongMatch && <Badge variant="outline" className={cn(validationTone("Validated"))}>Strong match</Badge>}
            {results.length > 0 && !strongMatch && <Badge variant="outline" className={cn(validationTone("Provisional"))}>Weak match</Badge>}
            {results.length === 0 && query.trim() !== "" && <Badge variant="outline" className={cn(validationTone("Obsolete"))}>No result</Badge>}
            {results.some((s) => s.item.validation === "Contradicted" || s.item.contradictsIds.length > 0) &&
              <Badge variant="outline" className={cn(validationTone("Contradicted"))}>Conflicting sources</Badge>}
            {results.some((s) => ageLabel(s.item.freshnessAt).stale) &&
              <Badge variant="outline" className={cn(validationTone("Obsolete"))}>Stale knowledge</Badge>}
            {reviews.some((r) => r.state === "Open") && <Badge variant="outline" className={cn(validationTone("AI draft"))}>Review pending</Badge>}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Results */}
            <div className="lg:col-span-2 space-y-2">
              {query.trim() === "" ? (
                <Card><CardContent className="p-6 text-sm text-slate-500">Type a query above. Every hit shows source, freshness, confidence, and validator.</CardContent></Card>
              ) : results.length === 0 ? (
                <Card>
                  <CardContent className="p-6 space-y-3">
                    <div className="text-sm text-slate-700">No matching knowledge for <span className="font-medium">"{query}"</span>.</div>
                    <div className="text-xs text-slate-500">This is treated as a knowledge gap. Log it to create an operations task.</div>
                    <Button size="sm" disabled={!canWrite} onClick={declareGap}><ClipboardList className="h-4 w-4 mr-1" />Log gap → task</Button>
                  </CardContent>
                </Card>
              ) : results.map((s) => {
                const restricted = !canRead(s.item);
                return (
                  <Card key={s.item.id} className={cn(selectedId === s.item.id ? "border-slate-900" : "")}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 text-slate-500">{kindIcon[s.item.kind]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <button className="text-left font-medium text-slate-900 hover:underline" onClick={() => setSelectedId(s.item.id)}>
                              {s.item.title}
                            </button>
                            <Badge variant="outline" className="text-xs">{kindLabel[s.item.kind]}</Badge>
                            <Badge variant="outline" className={cn("text-xs", validationTone(s.item.validation))}>{s.item.validation}</Badge>
                            {s.item.aiGenerated && <Badge variant="outline" className="text-xs bg-violet-50 text-violet-800 border-violet-200">AI</Badge>}
                            {restricted && <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300"><Lock className="h-3 w-3 mr-1 inline" />Restricted</Badge>}
                            {ageLabel(s.item.freshnessAt).stale && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">stale</Badge>}
                            {s.item.contradictsIds.length > 0 && <Badge variant="outline" className={cn("text-xs", validationTone("Contradicted"))}>contradicted</Badge>}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {s.item.id} · {s.item.refs.join(" · ") || "no refs"} · score {s.score}
                            {s.hits.length > 0 && <span> · matched: {s.hits.slice(0, 4).join(", ")}{s.hits.length > 4 ? "…" : ""}</span>}
                          </div>
                          <div className="text-sm text-slate-800 mt-1 line-clamp-2">
                            {restricted ? <span className="italic text-slate-500">Snippet hidden — you do not have access to this source ({s.item.accessScope}).</span> : s.item.snippet}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-2">
                            <span><FileSearch className="h-3 w-3 inline mr-0.5" />{s.item.sourceRef}</span>
                            <span>· freshness: {ageLabel(s.item.freshnessAt).text}</span>
                            <span>· confidence: {Math.round(s.item.confidence * 100)}%</span>
                            <span>· validated by: {s.item.validatedBy ?? "—"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedId(s.item.id)}>
                            Preview
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setTab("graph")}>
                            Graph <Network className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Preview panel */}
            <div>
              {!selected ? (
                <Card><CardContent className="p-6 text-sm text-slate-500">Select a result to preview its source.</CardContent></Card>
              ) : (() => {
                const restricted = !canRead(selected);
                return (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">{kindIcon[selected.kind]} {kindLabel[selected.kind]} · {selected.id}</div>
                          <div className="text-base font-semibold text-slate-900">{selected.title}</div>
                        </div>
                        <Badge variant="outline" className={cn("text-xs", validationTone(selected.validation))}>{selected.validation}</Badge>
                      </div>

                      {restricted ? (
                        <div className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 flex items-start gap-2">
                          <Lock className="h-4 w-4 mt-0.5" />
                          <div>
                            <div className="font-medium">Source restricted</div>
                            <div className="text-xs text-slate-600 mt-1">Scope: <span className="font-mono">{selected.accessScope}</span>. Request access via your role owner.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-800">{selected.snippet}</div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md border p-2"><div className="text-slate-500">Freshness</div><div className={cn(ageLabel(selected.freshnessAt).stale ? "text-amber-800" : "text-slate-800")}>{ageLabel(selected.freshnessAt).text}</div></div>
                        <div className="rounded-md border p-2"><div className="text-slate-500">Confidence</div><div className="tabular-nums">{Math.round(selected.confidence * 100)}%</div></div>
                        <div className="rounded-md border p-2"><div className="text-slate-500">Validator</div><div>{selected.validatedBy ?? "—"}</div></div>
                        <div className="rounded-md border p-2"><div className="text-slate-500">Access</div><div className="font-mono text-[11px]">{selected.accessScope}</div></div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-slate-600 mb-1">Sources</div>
                        <ul className="text-xs list-disc pl-4 text-slate-700 space-y-0.5">
                          {selected.sources.map((s) => <li key={s}>{s}</li>)}
                        </ul>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">{selected.sourceRef}</div>
                      </div>

                      {selected.contradictsIds.length > 0 && (
                        <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-900">
                          <div className="font-medium flex items-center gap-1"><GitCompare className="h-3.5 w-3.5" /> Contradicts</div>
                          <div>{selected.contradictsIds.join(", ")}</div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "flag-stale", itemId: selected.id })}><Clock className="h-4 w-4 mr-1" />Flag stale</Button>
                        <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "request-review", itemId: selected.id })}><Users className="h-4 w-4 mr-1" />Request review</Button>
                        <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "promote", itemId: selected.id })}><BadgeCheck className="h-4 w-4 mr-1" />Promote validated</Button>
                        <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "link-runbook", itemId: selected.id })}><LinkIcon className="h-4 w-4 mr-1" />Link runbook</Button>
                        <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "link-known-error", itemId: selected.id })}><ShieldAlert className="h-4 w-4 mr-1" />Link known error</Button>
                        <Button size="sm" variant="outline" disabled={!canWrite} onClick={() => openDialog({ kind: "mark-obsolete", itemId: selected.id })}><Ban className="h-4 w-4 mr-1" />Mark obsolete</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        </TabsContent>

        {/* Graph ----------------------------------------------------------- */}
        <TabsContent value="graph" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 mb-2">Relationship graph for <span className="font-medium text-slate-800">{selected?.title ?? "—"}</span>. Nodes are knowledge items; edges are declared relationships or contradictions.</div>
              {!selected ? (
                <div className="text-sm text-slate-500">Select an item first.</div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md border p-3 bg-white">
                    <div className="text-xs text-slate-500">Center</div>
                    <div className="font-medium">{selected.title}</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-600">Related</div>
                      {selected.relatedIds.length === 0 ? (
                        <div className="text-xs text-slate-500">No related items.</div>
                      ) : selected.relatedIds.map((id) => {
                        const it = items.find((x) => x.id === id);
                        if (!it) return null;
                        return (
                          <button key={id} className="w-full text-left border rounded-md p-2 hover:bg-slate-50" onClick={() => { setSelectedId(id); setTab("search"); }}>
                            <div className="text-xs text-slate-500">{kindLabel[it.kind]} · {it.id}</div>
                            <div className="text-sm">{it.title}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-600">Contradicts</div>
                      {selected.contradictsIds.length === 0 ? (
                        <div className="text-xs text-slate-500">No contradictions.</div>
                      ) : selected.contradictsIds.map((id) => {
                        const it = items.find((x) => x.id === id);
                        if (!it) return null;
                        return (
                          <div key={id} className="border rounded-md p-2 bg-rose-50 border-rose-200">
                            <div className="text-xs text-rose-700">{kindLabel[it.kind]} · {it.id}</div>
                            <div className="text-sm text-rose-900">{it.title}</div>
                            <Button size="sm" variant="ghost" onClick={() => openDialog({ kind: "compare", aId: selected.id, bId: id })}>
                              <GitCompare className="h-3.5 w-3.5 mr-1" />Compare
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contradictions -------------------------------------------------- */}
        <TabsContent value="contradictions" className="mt-4 space-y-2">
          {contradictions.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">No contradictions detected.</CardContent></Card>
          ) : contradictions.map((c) => {
            const a = items.find((i) => i.id === c.aId);
            const b = items.find((i) => i.id === c.bId);
            if (!a || !b) return null;
            return (
              <Card key={c.id}><CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">{c.id} · detected {new Date(c.detectedAt).toLocaleDateString()}</div>
                    <div className="text-sm font-medium text-slate-900">{a.title} <span className="text-rose-700">↔</span> {b.title}</div>
                    <div className="text-xs text-slate-700 mt-1">{c.note}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openDialog({ kind: "compare", aId: a.id, bId: b.id })}><GitCompare className="h-3.5 w-3.5 mr-1" />Compare</Button>
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>

        {/* Gaps ------------------------------------------------------------ */}
        <TabsContent value="gaps" className="mt-4 space-y-2">
          {gaps.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">No knowledge gaps logged. When a search returns no results, log a gap to create an operations task.</CardContent></Card>
          ) : gaps.map((g) => (
            <Card key={g.id}><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">"{g.query}"</div>
                  <div className="text-xs text-slate-500">{g.id} · {new Date(g.detectedAt).toLocaleString()}{g.taskRef ? ` · task ${g.taskRef}` : ""}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate("/runops/operations/queue")}>Open queue <ExternalLink className="h-3.5 w-3.5 ml-1" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>

        {/* Review ---------------------------------------------------------- */}
        <TabsContent value="review" className="mt-4 space-y-2">
          {reviews.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-slate-500">Expert review queue empty.</CardContent></Card>
          ) : reviews.map((r) => {
            const it = items.find((i) => i.id === r.itemId);
            return (
              <Card key={r.id}><CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{it?.title ?? r.itemId}</div>
                    <div className="text-xs text-slate-500">{r.id} · requested by {r.requestedBy} · {new Date(r.requestedAt).toLocaleDateString()}{r.assignedTo ? ` · assigned ${r.assignedTo}` : ""}</div>
                    <div className="text-xs text-slate-700 mt-1">{r.reason}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{r.state}</Badge>
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Dialogs -------------------------------------------------------- */}
      <Dialog open={dialog?.kind === "flag-stale"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Flag stale content</DialogTitle></DialogHeader>
          <Textarea placeholder="Why is this stale?" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button disabled={!canWrite} onClick={doFlagStale}>Flag</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "request-review"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Request expert review</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Assign to (email or team ref, optional)" value={inp.assignedTo ?? ""} onChange={(e) => setInp({ ...inp, assignedTo: e.target.value })} />
            <Textarea placeholder="Reason" value={inp.reason ?? ""} onChange={(e) => setInp({ ...inp, reason: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button disabled={!canWrite} onClick={doRequestReview}>Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "promote"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Promote to validated</DialogTitle></DialogHeader>
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
            AI-drafted items require an SRE / Platform Engineer / Incident Commander validator. Promotion publishes to Ask NOVA and digital-worker corpora.
          </div>
          <Input placeholder="Validator identity (email)" value={inp.validator ?? ""} onChange={(e) => setInp({ ...inp, validator: e.target.value })} />
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button disabled={!canWrite} onClick={doPromote}>Promote</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "create"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create knowledge item</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Title" value={inp.title ?? ""} onChange={(e) => setInp({ ...inp, title: e.target.value })} />
            <Select value={inp.kind ?? "evidence"} onValueChange={(v) => setInp({ ...inp, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(kindLabel) as EntityKind[]).map((k) => <SelectItem key={k} value={k}>{kindLabel[k]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Refs (comma-separated, e.g. INC-10482)" value={inp.refs ?? ""} onChange={(e) => setInp({ ...inp, refs: e.target.value })} />
            <Input placeholder="Tags (comma-separated)" value={inp.tags ?? ""} onChange={(e) => setInp({ ...inp, tags: e.target.value })} />
            <Input placeholder="Service IDs (comma-separated)" value={inp.services ?? ""} onChange={(e) => setInp({ ...inp, services: e.target.value })} />
            <Input placeholder="Source ref (required)" value={inp.sourceRef ?? ""} onChange={(e) => setInp({ ...inp, sourceRef: e.target.value })} />
            <Textarea placeholder="Sources (one per line)" value={inp.sources ?? ""} onChange={(e) => setInp({ ...inp, sources: e.target.value })} />
            <Textarea placeholder="Snippet" value={inp.snippet ?? ""} onChange={(e) => setInp({ ...inp, snippet: e.target.value })} />
          </div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button disabled={!canWrite} onClick={doCreate}>Create (Provisional)</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "link-runbook"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Link to runbook</DialogTitle></DialogHeader>
          <Input placeholder="Runbook ID (e.g. RB-3121)" value={inp.runbookId ?? ""} onChange={(e) => setInp({ ...inp, runbookId: e.target.value })} />
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button disabled={!canWrite} onClick={doLinkRunbook}>Link</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "link-known-error"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Link to known error</DialogTitle></DialogHeader>
          <Input placeholder="Known error ID (e.g. KE-441)" value={inp.knownErrorId ?? ""} onChange={(e) => setInp({ ...inp, knownErrorId: e.target.value })} />
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button disabled={!canWrite} onClick={doLinkKnownError}>Link</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "mark-obsolete"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent><DialogHeader><DialogTitle>Mark obsolete</DialogTitle></DialogHeader>
          <div className="text-xs text-slate-600">Removes this item from active search results. Historical audit remains.</div>
          <DialogFooter><Button variant="ghost" onClick={closeDialog}>Cancel</Button><Button variant="destructive" disabled={!canWrite} onClick={doMarkObsolete}>Mark obsolete</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog?.kind === "compare"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Compare sources</DialogTitle></DialogHeader>
          {(() => {
            if (dialog?.kind !== "compare") return null;
            const a = items.find((i) => i.id === dialog.aId);
            const b = items.find((i) => i.id === dialog.bId);
            if (!a || !b) return <div className="text-sm text-slate-500">Not found.</div>;
            return (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {[a, b].map((x, idx) => (
                  <div key={x.id} className={cn("rounded-md border p-3", idx === 0 ? "bg-slate-50" : "bg-rose-50 border-rose-200")}>
                    <div className="text-xs text-slate-500">{kindLabel[x.kind]} · {x.id}</div>
                    <div className="font-medium">{x.title}</div>
                    <div className="text-sm text-slate-800 mt-1">{canRead(x) ? x.snippet : <span className="italic text-slate-500">Restricted</span>}</div>
                    <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                      <div>Source: <span className="font-mono">{x.sourceRef}</span></div>
                      <div>Freshness: {ageLabel(x.freshnessAt).text}</div>
                      <div>Confidence: {Math.round(x.confidence * 100)}%</div>
                      <div>Validated by: {x.validatedBy ?? "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          <DialogFooter><Button onClick={closeDialog}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
