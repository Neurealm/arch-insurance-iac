/**
 * Page 25 · Alert Triage & Event Correlation
 * Route: /runops/operations/alerts
 *
 * Converts raw operational signals into prioritized, actionable situations.
 * - Seeds five canonical alerts (checkout latency, transaction errors, SQL
 *   saturation, queue delay, synthetic checkout failure) into
 *   runops.alerts.v1 the first time the page loads.
 * - Correlates alerts into situation groups (runops.correlationgroups.v1)
 *   and explains WHY each was grouped, plus supporting and contradictory
 *   context.
 * - Prioritises by customer impact + reliability risk, not volume.
 * - Cross-page state: suppressions, diagnostics tasks, correlation rules,
 *   and incident links persist to their own stores. Create Incident links
 *   the canonical group to INC-10482 and navigates to Incident Command.
 * - Every mutation emits ops.pushNotification (audit + domain event).
 * - AI (NOVA) correlation panel exposes evidence, confidence, uncertainty,
 *   and sources.
 *
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowRightLeft, Bell, BellOff, CheckCircle2,
  ExternalLink, Filter, Flag, GitMerge, Link2, ListChecks, Play,
  Radio, RefreshCw, Scissors, Search, ShieldAlert, Siren, Sparkles,
  Split, Tag, Users, Wrench,
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

/* ---------------------------- Types & storage ---------------------------- */

const ALERTS_KEY       = "runops.alerts.v1";
const GROUPS_KEY       = "runops.correlationgroups.v1";
const SUPPRESSIONS_KEY = "runops.suppressions.v1";
const RULES_KEY        = "runops.correlationrules.v1";
const DIAGNOSTICS_KEY  = "runops.diagnostics.v1";
const LINKS_KEY        = "runops.alertincidentlinks.v1";

type Severity = "SEV1" | "SEV2" | "SEV3" | "Info";
type AlertState =
  | "Firing" | "Acknowledged" | "Assigned" | "Suppressed"
  | "Merged" | "Informational" | "Linked" | "Resolved";

interface StoredAlert {
  id: string;
  title: string;
  source: string;                // Datadog, New Relic, Splunk, k6, PagerDuty…
  sourceId: string;              // Original alert id preserved from source
  serviceId: string;
  environment: string;
  region: string;
  severity: Severity;
  firedAt: string;
  metric: string;
  observation: string;
  customerImpact: number;        // 0-100 (business impact)
  reliabilityRisk: number;       // 0-100
  sloBurn: number;               // % of monthly budget/hour
  blastRadius: string;
  knownIssueId?: string | null;
  recommendedRunbookId?: string | null;
  state: AlertState;
  assignee?: string | null;
  suppressReason?: string | null;
  suppressExpiresAt?: string | null;
  mergedIntoGroupId?: string | null;
  informational?: boolean;
  sourceAvailable: boolean;
}

interface StoredGroup {
  id: string;
  title: string;
  alertIds: string[];
  serviceId: string;
  environment: string;
  createdAt: string;
  reason: string;
  supporting: string[];
  contradictory: string[];
  confidence: number;
  incidentId?: string | null;
  uncertain?: boolean;
}

interface StoredSuppression {
  id: string; alertId: string; reason: string;
  suppressedBy: string; suppressedAt: string; expiresAt: string;
}
interface StoredRule {
  id: string; name: string; expression: string;
  createdBy: string; createdAt: string; enabled: boolean;
}
interface StoredDiagnostic {
  id: string; alertId?: string; groupId?: string;
  title: string; createdAt: string; createdBy: string;
  incidentId?: string | null; route: string;
}
interface StoredLink {
  id: string; groupId: string; incidentId: string; linkedAt: string; linkedBy: string;
}

/* -------------------------------- Helpers -------------------------------- */

const nowIso = () => new Date().toISOString();
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch { return []; }
}
function writeList<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)); }

function priorityScore(a: StoredAlert): number {
  const sev = a.severity === "SEV1" ? 40 : a.severity === "SEV2" ? 25 : a.severity === "SEV3" ? 10 : 0;
  return a.customerImpact * 0.6 + a.reliabilityRisk * 0.3 + sev + Math.min(20, a.sloBurn * 2);
}

function severityTone(s: Severity): string {
  if (s === "SEV1") return "bg-red-100 text-red-800 border-red-300";
  if (s === "SEV2") return "bg-amber-100 text-amber-900 border-amber-300";
  if (s === "SEV3") return "bg-yellow-50 text-yellow-900 border-yellow-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}
function stateTone(s: AlertState): string {
  switch (s) {
    case "Firing":         return "bg-red-50 text-red-700 border-red-200";
    case "Acknowledged":   return "bg-blue-50 text-blue-700 border-blue-200";
    case "Assigned":       return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Suppressed":     return "bg-slate-100 text-slate-500 border-slate-200";
    case "Merged":         return "bg-purple-50 text-purple-700 border-purple-200";
    case "Informational":  return "bg-slate-50 text-slate-500 border-slate-200";
    case "Linked":         return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:               return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/* ------------------------- Canonical alert seed -------------------------- */

interface CanonicalSeedInput {
  serviceId: string;
  environment: string;
  region: string;
}

function canonicalSeed({ serviceId, environment, region }: CanonicalSeedInput): {
  alerts: StoredAlert[]; group: StoredGroup;
} {
  const t = new Date();
  const iso = (mMinutesAgo: number) => new Date(t.getTime() - mMinutesAgo * 60_000).toISOString();

  const alerts: StoredAlert[] = [
    {
      id: "ALT-88231", title: "Checkout latency > 950ms p95",
      source: "Datadog", sourceId: "dd-monitor-14872",
      serviceId, environment, region,
      severity: "SEV1", firedAt: iso(14),
      metric: "http.latency.p95{route=/checkout}",
      observation: "p95 rose from 380ms → 1.14s over 6 minutes",
      customerImpact: 92, reliabilityRisk: 88, sloBurn: 6.4,
      blastRadius: "All checkout users · US Central",
      knownIssueId: "KI-4471",
      recommendedRunbookId: "RB-0042",
      state: "Firing", sourceAvailable: true,
    },
    {
      id: "ALT-88232", title: "Transaction error rate 4.7% (SLO 0.5%)",
      source: "New Relic", sourceId: "nr-alert-9812",
      serviceId, environment, region,
      severity: "SEV1", firedAt: iso(13),
      metric: "checkout.tx.error_rate",
      observation: "Errors dominated by DB_TIMEOUT (81%)",
      customerImpact: 88, reliabilityRisk: 84, sloBurn: 5.9,
      blastRadius: "Order Platform · US Central",
      knownIssueId: "KI-4471",
      recommendedRunbookId: "RB-0042",
      state: "Firing", sourceAvailable: true,
    },
    {
      id: "ALT-88233", title: "SQL connection pool 96% saturation",
      source: "Datadog", sourceId: "dd-monitor-15903",
      serviceId, environment, region,
      severity: "SEV2", firedAt: iso(12),
      metric: "postgres.conn_pool.utilization",
      observation: "Pool util rose from 41% → 96% after 10:12 CT",
      customerImpact: 62, reliabilityRisk: 91, sloBurn: 2.1,
      blastRadius: "checkout-db-01 primary",
      knownIssueId: null,
      recommendedRunbookId: "RB-0042",
      state: "Firing", sourceAvailable: true,
    },
    {
      id: "ALT-88234", title: "Queue delay 42s on order-events",
      source: "Splunk", sourceId: "sp-a-4471",
      serviceId, environment, region,
      severity: "SEV2", firedAt: iso(10),
      metric: "kafka.consumer.lag_ms{topic=order-events}",
      observation: "Consumer lag climbing linearly since 10:12 CT",
      customerImpact: 58, reliabilityRisk: 71, sloBurn: 1.3,
      blastRadius: "Downstream fulfillment pipeline",
      knownIssueId: null,
      recommendedRunbookId: null,
      state: "Firing", sourceAvailable: true,
    },
    {
      id: "ALT-88235", title: "Synthetic checkout journey failing",
      source: "k6 Cloud", sourceId: "k6-check-9911",
      serviceId, environment, region,
      severity: "SEV1", firedAt: iso(9),
      metric: "synthetic.checkout.success",
      observation: "3 of 5 regions failing on POST /checkout/submit",
      customerImpact: 95, reliabilityRisk: 79, sloBurn: 4.2,
      blastRadius: "Public checkout endpoint",
      knownIssueId: "KI-4471",
      recommendedRunbookId: "RB-0042",
      state: "Firing", sourceAvailable: true,
    },
  ];

  const group: StoredGroup = {
    id: "SIT-42019",
    title: "Checkout degradation — DB timeouts propagating",
    alertIds: alerts.map((a) => a.id),
    serviceId, environment, createdAt: nowIso(),
    reason:
      "All five signals reference the checkout critical path with overlapping fire windows " +
      "(±5 minutes) and share the DB_TIMEOUT error class. Connection-pool saturation on " +
      "checkout-db-01 precedes latency + error rise, consistent with a saturation-driven cascade.",
    supporting: [
      "Timing: 4 of 5 alerts fired within a 5-minute window",
      "Topology: all target the checkout call graph (edge → order-svc → checkout-db-01)",
      "Errors: DB_TIMEOUT dominates checkout error class (81%)",
      "Change lineage: CHG-20391 modified connection pool sizing at 10:04 CT",
    ],
    contradictory: [
      "Queue delay could also be explained by an independent Kafka broker restart (not observed)",
      "Synthetic failures are regional; the region skew is milder than the DB signal",
    ],
    confidence: 87,
    incidentId: null,
    uncertain: false,
  };

  return { alerts, group };
}

/* ---------------------------------- Page --------------------------------- */

export default function AlertTriage() {
  const ops = useOperations();
  const navigate = useNavigate();
  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [alerts, setAlerts] = useState<StoredAlert[]>([]);
  const [groups, setGroups] = useState<StoredGroup[]>([]);
  const [suppressions, setSuppressions] = useState<StoredSuppression[]>([]);
  const [rules, setRules] = useState<StoredRule[]>([]);
  const [links, setLinks] = useState<StoredLink[]>([]);

  const [tab, setTab] = useState<"stream" | "situations" | "suppressed" | "rules">("stream");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"priority" | "fired" | "severity">("priority");
  const [dialog, setDialog] = useState<
    null | "assign" | "suppress" | "merge" | "split" | "createIncident"
        | "linkIncident" | "diagnostics" | "runbook" | "rule"
  >(null);
  const [assignee, setAssignee] = useState("");
  const [suppressReason, setSuppressReason] = useState("");
  const [suppressMinutes, setSuppressMinutes] = useState("60");
  const [ruleName, setRuleName] = useState("");
  const [ruleExpr, setRuleExpr] = useState("");
  const [linkIncidentId, setLinkIncidentId] = useState("INC-10482");
  const [refreshedAt, setRefreshedAt] = useState(nowIso());
  const [stormActive, setStormActive] = useState(false);

  /* -------- Load + seed canonical demo state on first visit -------- */
  useEffect(() => {
    let a = readList<StoredAlert>(ALERTS_KEY);
    let g = readList<StoredGroup>(GROUPS_KEY);
    if (a.length === 0) {
      const seed = canonicalSeed({
        serviceId: ops.selectedServiceId,
        environment: ops.environment,
        region: ops.region,
      });
      a = seed.alerts;
      g = [seed.group];
      writeList(ALERTS_KEY, a);
      writeList(GROUPS_KEY, g);
    }
    setAlerts(a);
    setGroups(g);
    setSuppressions(readList<StoredSuppression>(SUPPRESSIONS_KEY));
    setRules(readList<StoredRule>(RULES_KEY));
    setLinks(readList<StoredLink>(LINKS_KEY));
    setSelectedGroupId(g[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------- Derived collections & states ------------------- */
  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = alerts.filter((a) => {
      if (severityFilter !== "all" && a.severity !== severityFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.metric.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });
    return [...list].sort((x, y) => {
      if (sortKey === "priority") return priorityScore(y) - priorityScore(x);
      if (sortKey === "fired") return new Date(y.firedAt).getTime() - new Date(x.firedAt).getTime();
      const order: Severity[] = ["SEV1", "SEV2", "SEV3", "Info"];
      return order.indexOf(x.severity) - order.indexOf(y.severity);
    });
  }, [alerts, severityFilter, search, sortKey]);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.state !== "Suppressed" && a.state !== "Informational" && a.state !== "Merged" && a.state !== "Resolved"),
    [alerts],
  );
  const suppressedAlerts = useMemo(() => alerts.filter((a) => a.state === "Suppressed"), [alerts]);
  const anySourceUnavailable = useMemo(() => alerts.some((a) => !a.sourceAvailable), [alerts]);
  const canonicalGroup = useMemo(() => groups.find((g) => g.id === "SIT-42019") ?? groups[0] ?? null, [groups]);
  const selectedAlert = useMemo(() => alerts.find((a) => a.id === selectedAlertId) ?? null, [alerts, selectedAlertId]);
  const selectedGroup = useMemo(() => groups.find((g) => g.id === selectedGroupId) ?? canonicalGroup, [groups, selectedGroupId, canonicalGroup]);

  /* ----------------------------- Actions -------------------------------- */
  const audit = useCallback((title: string, detail: string, kind: "info" | "warning" | "critical" = "info", entityRef?: string, route?: string) => {
    ops.pushNotification({ kind, title, detail, entityRef, route });
  }, [ops]);

  const persistAlerts = useCallback((next: StoredAlert[]) => { setAlerts(next); writeList(ALERTS_KEY, next); }, []);
  const persistGroups = useCallback((next: StoredGroup[]) => { setGroups(next); writeList(GROUPS_KEY, next); }, []);
  const persistSuppressions = useCallback((next: StoredSuppression[]) => { setSuppressions(next); writeList(SUPPRESSIONS_KEY, next); }, []);
  const persistRules = useCallback((next: StoredRule[]) => { setRules(next); writeList(RULES_KEY, next); }, []);
  const persistLinks = useCallback((next: StoredLink[]) => { setLinks(next); writeList(LINKS_KEY, next); }, []);

  const patchAlert = useCallback((id: string, patch: Partial<StoredAlert>) => {
    persistAlerts(alerts.map((a) => a.id === id ? { ...a, ...patch } : a));
  }, [alerts, persistAlerts]);

  const acknowledge = (a: StoredAlert) => {
    if (!canWrite) return;
    patchAlert(a.id, { state: "Acknowledged" });
    audit("Alert acknowledged", `${a.id} · ${a.title}`, "info", a.id);
  };

  const assign = () => {
    if (!canWrite || !selectedAlert || !assignee.trim()) return;
    patchAlert(selectedAlert.id, { state: "Assigned", assignee: assignee.trim() });
    audit("Alert assigned", `${selectedAlert.id} → ${assignee.trim()}`, "info", selectedAlert.id);
    setDialog(null); setAssignee("");
  };

  const suppress = () => {
    if (!canWrite || !selectedAlert || !suppressReason.trim()) return;
    const minutes = Math.max(1, parseInt(suppressMinutes, 10) || 60);
    const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();
    patchAlert(selectedAlert.id, {
      state: "Suppressed", suppressReason: suppressReason.trim(), suppressExpiresAt: expiresAt,
    });
    const rec: StoredSuppression = {
      id: rid("SUP"), alertId: selectedAlert.id, reason: suppressReason.trim(),
      suppressedBy: ops.role, suppressedAt: nowIso(), expiresAt,
    };
    persistSuppressions([rec, ...suppressions]);
    audit("Alert suppressed", `${selectedAlert.id} · ${suppressReason.trim()} (expires ${new Date(expiresAt).toLocaleTimeString()})`, "warning", selectedAlert.id);
    setDialog(null); setSuppressReason(""); setSuppressMinutes("60");
  };

  const markInformational = (a: StoredAlert) => {
    if (!canWrite) return;
    patchAlert(a.id, { state: "Informational", informational: true });
    audit("Alert marked informational", `${a.id}`, "info", a.id);
  };

  const mergeSelectedIntoCanonical = () => {
    if (!canWrite || !selectedAlert || !canonicalGroup) return;
    if (canonicalGroup.alertIds.includes(selectedAlert.id)) { setDialog(null); return; }
    const nextGroups = groups.map((g) => g.id === canonicalGroup.id
      ? { ...g, alertIds: [...g.alertIds, selectedAlert.id] }
      : g);
    persistGroups(nextGroups);
    patchAlert(selectedAlert.id, { state: "Merged", mergedIntoGroupId: canonicalGroup.id });
    audit("Alerts merged", `${selectedAlert.id} → ${canonicalGroup.id}`, "info", canonicalGroup.id);
    setDialog(null);
  };

  const splitFromGroup = () => {
    if (!canWrite || !selectedAlert || !selectedGroup) return;
    const nextGroups = groups.map((g) => g.id === selectedGroup.id
      ? { ...g, alertIds: g.alertIds.filter((id) => id !== selectedAlert.id), uncertain: true }
      : g);
    persistGroups(nextGroups);
    patchAlert(selectedAlert.id, { state: "Firing", mergedIntoGroupId: null });
    audit("Correlation group split", `${selectedAlert.id} removed from ${selectedGroup.id}`, "warning", selectedGroup.id);
    setDialog(null);
  };

  const createIncidentFromGroup = () => {
    if (!canWrite || !selectedGroup) return;
    const incidentId = "INC-10482";
    const nextGroups = groups.map((g) => g.id === selectedGroup.id
      ? { ...g, incidentId }
      : g);
    persistGroups(nextGroups);
    const nextAlerts = alerts.map((a) => selectedGroup.alertIds.includes(a.id)
      ? { ...a, state: "Linked" as AlertState }
      : a);
    persistAlerts(nextAlerts);
    const link: StoredLink = {
      id: rid("LNK"), groupId: selectedGroup.id, incidentId, linkedAt: nowIso(), linkedBy: ops.role,
    };
    persistLinks([link, ...links]);
    audit("Incident created from correlation", `${incidentId} · ${selectedGroup.id} · ${selectedGroup.alertIds.length} alerts`, "critical", incidentId, `/runops/incidents/${incidentId}`);
    setDialog(null);
    navigate(`/runops/incidents/${incidentId}`);
  };

  const linkGroupToIncident = () => {
    if (!canWrite || !selectedGroup || !linkIncidentId.trim()) return;
    const incidentId = linkIncidentId.trim();
    const nextGroups = groups.map((g) => g.id === selectedGroup.id ? { ...g, incidentId } : g);
    persistGroups(nextGroups);
    const nextAlerts = alerts.map((a) => selectedGroup.alertIds.includes(a.id)
      ? { ...a, state: "Linked" as AlertState } : a);
    persistAlerts(nextAlerts);
    persistLinks([{ id: rid("LNK"), groupId: selectedGroup.id, incidentId, linkedAt: nowIso(), linkedBy: ops.role }, ...links]);
    audit("Correlation linked to incident", `${selectedGroup.id} → ${incidentId}`, "info", incidentId, `/runops/incidents/${incidentId}`);
    setDialog(null);
  };

  const launchDiagnostics = () => {
    if (!canWrite || (!selectedAlert && !selectedGroup)) return;
    const ref = selectedAlert?.id ?? selectedGroup?.id ?? "unknown";
    const route = "/runops/incidents/INC-10482/investigate";
    const diag: StoredDiagnostic = {
      id: rid("DIAG"), alertId: selectedAlert?.id, groupId: selectedGroup?.id,
      title: `Diagnostics from ${ref}`, createdAt: nowIso(), createdBy: ops.role,
      incidentId: selectedGroup?.incidentId ?? "INC-10482", route,
    };
    const existing = readList<StoredDiagnostic>(DIAGNOSTICS_KEY);
    writeList(DIAGNOSTICS_KEY, [diag, ...existing]);
    audit("Diagnostics task created", `${diag.id} · source ${ref}`, "info", ref, route);
    setDialog(null);
    navigate(route);
  };

  const openRecommendedRunbook = () => {
    if (!selectedAlert?.recommendedRunbookId) return;
    audit("Runbook opened from alert", `${selectedAlert.id} → ${selectedAlert.recommendedRunbookId}`, "info", selectedAlert.recommendedRunbookId, `/runops/runbooks/${selectedAlert.recommendedRunbookId}`);
    setDialog(null);
    navigate(`/runops/runbooks/${selectedAlert.recommendedRunbookId}`);
  };

  const createRule = () => {
    if (!canWrite || !ruleName.trim() || !ruleExpr.trim()) return;
    const rec: StoredRule = {
      id: rid("RULE"), name: ruleName.trim(), expression: ruleExpr.trim(),
      createdBy: ops.role, createdAt: nowIso(), enabled: true,
    };
    persistRules([rec, ...rules]);
    audit("Correlation rule created", `${rec.id} · ${rec.name}`, "info", rec.id);
    setRuleName(""); setRuleExpr(""); setDialog(null);
  };

  const toggleStorm = () => {
    setStormActive((s) => !s);
    audit(stormActive ? "Alert storm mode off" : "Alert storm demo active",
      stormActive ? "Volume returned to baseline" : "Simulating high-volume noise for correlation demo", "warning");
  };

  const refresh = () => {
    setRefreshedAt(nowIso());
    ops.refreshData();
    audit("Alerts refreshed", "Streams re-polled", "info");
  };

  const resetSeed = () => {
    if (!canWrite) return;
    const seed = canonicalSeed({
      serviceId: ops.selectedServiceId, environment: ops.environment, region: ops.region,
    });
    persistAlerts(seed.alerts); persistGroups([seed.group]);
    persistSuppressions([]); persistLinks([]);
    setSelectedAlertId(null); setSelectedGroupId(seed.group.id);
    audit("Alert triage reseeded", "Canonical alerts + situation reset", "info");
  };

  /* --------------------------------- UI --------------------------------- */

  const empty = alerts.length === 0;
  const stormLevel = stormActive ? "Alert storm active" : (activeAlerts.length > 12 ? "Alert storm active" : activeAlerts.length === 1 ? "Single critical alert" : "Normal volume");
  const correlationUncertain = !!canonicalGroup?.uncertain || (canonicalGroup?.confidence ?? 100) < 60;

  const bannerBadges: { label: string; tone: string }[] = [];
  if (activeAlerts.length === 0) bannerBadges.push({ label: "No approvals", tone: "bg-slate-100 text-slate-600" });
  if (stormLevel === "Alert storm active") bannerBadges.push({ label: "Alert storm active", tone: "bg-amber-100 text-amber-900" });
  if (stormLevel === "Single critical alert") bannerBadges.push({ label: "Single critical alert", tone: "bg-red-100 text-red-800" });
  if (correlationUncertain) bannerBadges.push({ label: "Correlation uncertain", tone: "bg-amber-100 text-amber-900" });
  if (anySourceUnavailable) bannerBadges.push({ label: "Source unavailable", tone: "bg-red-50 text-red-700" });
  if (suppressions.some((s) => new Date(s.expiresAt).getTime() > Date.now())) bannerBadges.push({ label: "Suppression active", tone: "bg-slate-200 text-slate-700" });

  return (
    <div className="flex flex-col min-h-0">
      <EntityHeader
        eyebrow="Operations"
        title="Alert Triage & Event Correlation"
        subtitle={`Tenant ${ops.tenant.name} · Service ${ops.selectedService.name} · ${ops.environment} · ${ops.region} · Role ${ops.role}`}
        status={{ label: stormLevel, tone: stormLevel === "Alert storm active" || stormLevel === "Single critical alert" ? "danger" : "neutral" }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={refresh} aria-label="Refresh alert streams">
              <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={toggleStorm} aria-label="Toggle alert storm demo">
              <Radio className="mr-1.5 h-4 w-4" /> {stormActive ? "End storm" : "Simulate storm"}
            </Button>
            <Button size="sm" variant="outline" onClick={resetSeed} disabled={!canWrite}>Reset demo</Button>
          </div>
        }
        meta={
          <>
            {bannerBadges.map((b) => (
              <Badge key={b.label} variant="outline" className={cn("text-[10px]", b.tone)}>{b.label}</Badge>
            ))}
            <span className="text-[11px] text-slate-500">Data as of {new Date(refreshedAt).toLocaleTimeString()}</span>
          </>
        }
      />

      <div className="p-4 space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="stream">Alert stream ({activeAlerts.length})</TabsTrigger>
            <TabsTrigger value="situations">Situations ({groups.length})</TabsTrigger>
            <TabsTrigger value="suppressed">Suppressed ({suppressedAlerts.length})</TabsTrigger>
            <TabsTrigger value="rules">Correlation rules ({rules.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stream" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: filter + list */}
              <Card className="lg:col-span-2">
                <CardContent className="p-3 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, metric, source, id" className="pl-8 h-8" aria-label="Search alerts" />
                    </div>
                    <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}>
                      <SelectTrigger className="h-8 w-[130px]" aria-label="Severity filter"><Filter className="mr-1.5 h-4 w-4" /><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All severities</SelectItem>
                        <SelectItem value="SEV1">SEV1</SelectItem>
                        <SelectItem value="SEV2">SEV2</SelectItem>
                        <SelectItem value="SEV3">SEV3</SelectItem>
                        <SelectItem value="Info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as typeof sortKey)}>
                      <SelectTrigger className="h-8 w-[160px]" aria-label="Sort alerts"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Sort: priority</SelectItem>
                        <SelectItem value="fired">Sort: newest</SelectItem>
                        <SelectItem value="severity">Sort: severity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {empty && (
                    <div className="rounded-md border p-8 text-center space-y-1">
                      <Bell className="mx-auto h-8 w-8 text-slate-400" />
                      <div className="font-medium">No active alerts</div>
                      <p className="text-sm text-slate-500">All operational signals are within acceptable ranges.</p>
                    </div>
                  )}

                  {!empty && filteredAlerts.length === 0 && (
                    <div className="text-sm text-slate-500 p-4">No alerts match the current filter.</div>
                  )}

                  <ul className="divide-y">
                    {filteredAlerts.map((a) => {
                      const selected = a.id === selectedAlertId;
                      const p = Math.round(priorityScore(a));
                      return (
                        <li key={a.id}>
                          <button
                            className={cn("w-full text-left px-2 py-2 grid grid-cols-[auto_1fr_auto] gap-2 items-center hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400", selected && "bg-indigo-50")}
                            onClick={() => setSelectedAlertId(a.id)}
                            aria-label={`Open alert ${a.id}`}
                          >
                            <Badge variant="outline" className={cn("text-[10px]", severityTone(a.severity))}>{a.severity}</Badge>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{a.title}</div>
                              <div className="text-xs text-slate-500 truncate">
                                {a.id} · {a.source} · {a.metric} · fired {new Date(a.firedAt).toLocaleTimeString()}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                <Badge variant="outline" className={cn("text-[10px]", stateTone(a.state))}>{a.state}</Badge>
                                <Badge variant="outline" className="text-[10px]">Impact {a.customerImpact}</Badge>
                                <Badge variant="outline" className="text-[10px]">Risk {a.reliabilityRisk}</Badge>
                                <Badge variant="outline" className="text-[10px]">SLO burn {a.sloBurn.toFixed(1)}%/h</Badge>
                                {a.knownIssueId && <Badge variant="outline" className="text-[10px]">Known {a.knownIssueId}</Badge>}
                                {a.recommendedRunbookId && <Badge variant="outline" className="text-[10px]">{a.recommendedRunbookId}</Badge>}
                                {!a.sourceAvailable && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">Source unavailable</Badge>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Priority</div>
                              <div className="text-lg font-semibold">{p}</div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              {/* Right: detail */}
              <Card>
                <CardContent className="p-3 space-y-3">
                  {!selectedAlert && (
                    <div className="text-sm text-slate-500 py-10 text-center">Select an alert to see actions and lineage.</div>
                  )}
                  {selectedAlert && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500">{selectedAlert.id} · {selectedAlert.source}</div>
                        <div className="text-sm font-medium">{selectedAlert.title}</div>
                        <div className="text-xs text-slate-600">{selectedAlert.observation}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <Kv k="Service" v={ops.selectedService.name} />
                        <Kv k="Environment" v={selectedAlert.environment} />
                        <Kv k="Region" v={selectedAlert.region} />
                        <Kv k="Blast radius" v={selectedAlert.blastRadius} />
                        <Kv k="SLO burn" v={`${selectedAlert.sloBurn.toFixed(1)}%/h`} />
                        <Kv k="Source id" v={selectedAlert.sourceId} />
                        <Kv k="Metric" v={selectedAlert.metric} />
                        <Kv k="Assignee" v={selectedAlert.assignee ?? "Unassigned"} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => acknowledge(selectedAlert)} disabled={!canWrite || selectedAlert.state === "Acknowledged"}>
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Acknowledge
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setAssignee(""); setDialog("assign"); }} disabled={!canWrite}>
                          <Users className="mr-1.5 h-4 w-4" /> Assign
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSuppressReason(""); setDialog("suppress"); }} disabled={!canWrite}>
                          <BellOff className="mr-1.5 h-4 w-4" /> Suppress
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDialog("merge")} disabled={!canWrite || !canonicalGroup}>
                          <GitMerge className="mr-1.5 h-4 w-4" /> Merge
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDialog("split")}
                          disabled={!canWrite || !selectedGroup || !selectedGroup.alertIds.includes(selectedAlert.id)}
                          title={!selectedGroup || !selectedGroup.alertIds.includes(selectedAlert.id) ? "Alert is not part of a correlation group" : ""}>
                          <Split className="mr-1.5 h-4 w-4" /> Split correlation
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDialog("diagnostics")} disabled={!canWrite}>
                          <Activity className="mr-1.5 h-4 w-4" /> Launch diagnostics
                        </Button>
                        <Button size="sm" variant="outline" onClick={openRecommendedRunbook}
                          disabled={!selectedAlert.recommendedRunbookId}
                          title={!selectedAlert.recommendedRunbookId ? "No recommended runbook" : ""}>
                          <Play className="mr-1.5 h-4 w-4" /> Open runbook
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => markInformational(selectedAlert)} disabled={!canWrite}>
                          <Tag className="mr-1.5 h-4 w-4" /> Mark informational
                        </Button>
                      </div>

                      {selectedAlert.suppressReason && (
                        <div className="rounded-md border bg-slate-50 p-2 text-xs">
                          <div className="font-medium">Suppression</div>
                          <div>{selectedAlert.suppressReason}</div>
                          <div className="text-slate-500">Expires {new Date(selectedAlert.suppressExpiresAt ?? "").toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="situations" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="text-xs font-medium text-slate-500 uppercase">Situation groups</div>
                  {groups.length === 0 && <div className="text-sm text-slate-500">No correlated situations.</div>}
                  <ul className="divide-y">
                    {groups.map((g) => (
                      <li key={g.id}>
                        <button
                          className={cn("w-full text-left px-2 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400", g.id === selectedGroupId && "bg-indigo-50")}
                          onClick={() => setSelectedGroupId(g.id)}
                          aria-label={`Open situation ${g.id}`}
                        >
                          <div className="text-sm font-medium">{g.title}</div>
                          <div className="text-xs text-slate-500">{g.id} · {g.alertIds.length} alerts · confidence {g.confidence}%</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1">
                            {g.incidentId && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">Linked {g.incidentId}</Badge>}
                            {g.uncertain && <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-900">Uncertain</Badge>}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardContent className="p-4 space-y-3">
                  {!selectedGroup && <div className="text-sm text-slate-500 py-10 text-center">Select a situation.</div>}
                  {selectedGroup && (
                    <>
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500">{selectedGroup.id}</div>
                          <div className="text-base font-semibold">{selectedGroup.title}</div>
                        </div>
                        <div className="ml-auto flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDialog("linkIncident")} disabled={!canWrite}>
                            <Link2 className="mr-1.5 h-4 w-4" /> Link to incident
                          </Button>
                          <Button size="sm" onClick={() => setDialog("createIncident")} disabled={!canWrite}>
                            <Siren className="mr-1.5 h-4 w-4" /> Create incident
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDialog("diagnostics")} disabled={!canWrite}>
                            <Activity className="mr-1.5 h-4 w-4" /> Launch diagnostics
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDialog("rule")} disabled={!canWrite}>
                            <ListChecks className="mr-1.5 h-4 w-4" /> New rule
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-md border p-3 space-y-2">
                          <div className="text-xs font-medium text-slate-500">Why these alerts were correlated</div>
                          <p className="text-sm">{selectedGroup.reason}</p>
                          <div>
                            <div className="text-xs font-medium text-emerald-700">Supporting</div>
                            <ul className="text-xs list-disc pl-4 text-slate-700">
                              {selectedGroup.supporting.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-amber-800">Contradictory</div>
                            <ul className="text-xs list-disc pl-4 text-slate-700">
                              {selectedGroup.contradictory.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="rounded-md border p-3 space-y-2">
                          <div className="text-xs font-medium text-slate-500">NOVA correlation evidence</div>
                          <div className="text-xs">Confidence: <span className="font-medium">{selectedGroup.confidence}%</span></div>
                          <div className="text-xs">Evidence: {selectedGroup.alertIds.length} alerts · {new Set(selectedGroup.alertIds.map((id) => alerts.find((a) => a.id === id)?.source).filter(Boolean)).size} sources</div>
                          <div className="text-xs">Uncertainty: {selectedGroup.contradictory.length} contradictory signal(s){selectedGroup.uncertain ? " · flagged uncertain" : ""}</div>
                          <div className="text-xs">Sources: {Array.from(new Set(selectedGroup.alertIds.map((id) => alerts.find((a) => a.id === id)?.source).filter(Boolean))).join(", ") || "—"}</div>
                          <div className="text-xs text-slate-500">Original alert ids preserved on each signal.</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Alerts in this situation</div>
                        <ul className="divide-y border rounded-md">
                          {selectedGroup.alertIds.map((id) => {
                            const a = alerts.find((x) => x.id === id);
                            if (!a) return null;
                            return (
                              <li key={id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                                <Badge variant="outline" className={cn("text-[10px]", severityTone(a.severity))}>{a.severity}</Badge>
                                <span className="flex-1 truncate">{a.title}</span>
                                <span className="text-xs text-slate-500">{a.source}</span>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedAlertId(a.id); setTab("stream"); }} aria-label={`Open ${a.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {selectedGroup.incidentId && (
                        <div className="rounded-md border bg-emerald-50 p-2 text-xs flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-emerald-700" />
                          Linked to incident <button className="font-medium underline underline-offset-2" onClick={() => navigate(`/runops/incidents/${selectedGroup.incidentId}`)}>{selectedGroup.incidentId}</button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suppressed" className="mt-4">
            <Card><CardContent className="p-3">
              {suppressedAlerts.length === 0 && <div className="text-sm text-slate-500">No active suppressions.</div>}
              <ul className="divide-y">
                {suppressedAlerts.map((a) => {
                  const s = suppressions.find((x) => x.alertId === a.id);
                  return (
                    <li key={a.id} className="py-2 flex items-center gap-2">
                      <BellOff className="h-4 w-4 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{a.title}</div>
                        <div className="text-xs text-slate-500">{a.id} · {a.suppressReason} · expires {a.suppressExpiresAt ? new Date(a.suppressExpiresAt).toLocaleString() : "—"} · by {s?.suppressedBy ?? "—"}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => { patchAlert(a.id, { state: "Firing", suppressReason: null, suppressExpiresAt: null }); audit("Suppression cleared", a.id, "info", a.id); }} disabled={!canWrite}>
                        Clear
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <Card><CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Correlation rules describe how new alerts join situations.</div>
                <Button size="sm" onClick={() => setDialog("rule")} disabled={!canWrite}>
                  <ListChecks className="mr-1.5 h-4 w-4" /> New rule
                </Button>
              </div>
              {rules.length === 0 && <div className="text-sm text-slate-500">No custom correlation rules yet.</div>}
              <ul className="divide-y">
                {rules.map((r) => (
                  <li key={r.id} className="py-2 text-sm">
                    <div className="font-medium">{r.name} <span className="text-xs text-slate-500">· {r.id}</span></div>
                    <div className="text-xs text-slate-600 font-mono">{r.expression}</div>
                    <div className="text-xs text-slate-500">Created {new Date(r.createdAt).toLocaleString()} · by {r.createdBy}</div>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ---------- Dialogs ---------- */}
      <Dialog open={dialog === "assign"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign alert</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-sm">{selectedAlert?.title}</div>
            <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Owner (name or team)" aria-label="Assignee" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={assign} disabled={!canWrite || !assignee.trim()}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "suppress"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suppress alert</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-sm">{selectedAlert?.title}</div>
            <Textarea value={suppressReason} onChange={(e) => setSuppressReason(e.target.value)} placeholder="Reason (required — becomes part of the audit trail)" rows={4} aria-label="Suppression reason" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Expires in</span>
              <Input value={suppressMinutes} onChange={(e) => setSuppressMinutes(e.target.value)} className="w-20 h-8" aria-label="Minutes" />
              <span className="text-xs text-slate-500">minutes</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={suppress} disabled={!canWrite || !suppressReason.trim()}>Suppress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "merge"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Merge into situation {canonicalGroup?.id}</DialogTitle></DialogHeader>
          <div className="text-sm space-y-2">
            <div>Merging preserves the original alert source and id.</div>
            <div>Alert: {selectedAlert?.id} · {selectedAlert?.title}</div>
            <div>Target: {canonicalGroup?.title}</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={mergeSelectedIntoCanonical} disabled={!canWrite || !canonicalGroup}>Merge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "split"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Split correlation</DialogTitle></DialogHeader>
          <div className="text-sm space-y-2">
            <div>Removing an alert from a situation flags the group as uncertain and keeps its original source lineage intact.</div>
            <div>Alert: {selectedAlert?.id}</div>
            <div>Group: {selectedGroup?.id}</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={splitFromGroup} disabled={!canWrite}>Split</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "createIncident"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create incident from situation</DialogTitle></DialogHeader>
          <div className="text-sm space-y-2">
            <div>Creates or updates <span className="font-medium">INC-10482</span> and navigates to Incident Command. The situation, all correlated alerts, and their original sources will be attached.</div>
            <div className="rounded-md border bg-slate-50 p-2 text-xs">
              <div className="font-medium">{selectedGroup?.title}</div>
              <div>{selectedGroup?.id} · {selectedGroup?.alertIds.length} alerts · confidence {selectedGroup?.confidence}%</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createIncidentFromGroup} disabled={!canWrite || !selectedGroup}>Create INC-10482</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "linkIncident"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Link situation to existing incident</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={linkIncidentId} onChange={(e) => setLinkIncidentId(e.target.value)} aria-label="Incident id" placeholder="INC-XXXXX" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={linkGroupToIncident} disabled={!canWrite || !linkIncidentId.trim()}>Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "diagnostics"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Launch diagnostics</DialogTitle></DialogHeader>
          <div className="text-sm">Creates an investigation task in the Investigation Workspace scoped to the selected alert/situation.</div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={launchDiagnostics} disabled={!canWrite}>Launch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rule"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New correlation rule</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="Rule name" aria-label="Rule name" />
            <Textarea value={ruleExpr} onChange={(e) => setRuleExpr(e.target.value)} rows={5}
              placeholder='e.g. service == "checkout" AND fire_within_minutes(5) AND error_class in ("DB_TIMEOUT","POOL_EXHAUSTED")'
              aria-label="Rule expression" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={createRule} disabled={!canWrite || !ruleName.trim() || !ruleExpr.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Small parts ------------------------------ */

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border bg-slate-50 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div>
      <div className="truncate">{v}</div>
    </div>
  );
}
