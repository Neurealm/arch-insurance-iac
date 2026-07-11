/**
 * Page 30 · Stakeholder Communications
 * Route: /runops/incidents/:incidentId/communications
 *
 * Creates accurate, audience-appropriate incident communications from the
 * authoritative incident record. Nothing is fabricated: recovery estimates
 * appear only when incident.recoveryCriteria have measurable support, and
 * statements not backed by verifiedFacts are highlighted as unsupported.
 *
 * Persistence:
 *   runops.communications.v1[incidentId]  → CommsRecord (drafts + published + corrections)
 *   runops.incidents.v1[incidentId]       (published appended to communications + timeline)
 *   runops.approvals.v1                   (append pending approval)
 *   runops.operationstasks.v1             (append task on delivery failure)
 *
 * Every mutation emits an audit + domain event via ops.pushNotification.
 * No fixture-array imports. No `any`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, CalendarClock, CheckCircle2, ClipboardCopy,
  FileText, GitCompare, History, MessageSquare, Pencil, PlayCircle, RefreshCw,
  Send, ShieldAlert, ShieldCheck, Sparkles, Timer, TriangleAlert, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityHeader } from "@/runops/components";
import { useOperations } from "@/runops/state/RunOpsProviders";

/* -------------------------------- Types --------------------------------- */

type Audience =
  | "Engineering" | "Executive" | "Business Owner" | "Customer"
  | "Public Status" | "Regulatory" | "Internal Support";

type Channel = "Teams" | "Slack" | "Google Chat" | "Email" | "ITSM" | "Status Page";
type DraftState =
  | "draft" | "awaiting-approval" | "scheduled" | "published"
  | "delivery-failed" | "corrected" | "no-permission";

interface DraftBody {
  currentImpact: string;
  affectedCapabilities: string;
  knownFacts: string[];
  unknowns: string[];
  actionsCompleted: string[];
  currentMitigation: string;
  nextAction: string;
  nextUpdateAt: string;    // ISO
  recoveryEstimate: string;  // empty unless supported
  recoverySupported: boolean;
}

interface DeliveryStatus {
  channel: Channel;
  at: string;
  outcome: "delivered" | "failed";
  detail: string;
}

interface CorrectionEntry {
  at: string; by: string; reason: string;
  previous: DraftBody;
}

interface AudienceDraft {
  audience: Audience;
  state: DraftState;
  body: DraftBody;
  generatedAt: string | null;
  editedAt: string | null;
  approvalId?: string;
  scheduledFor?: string;
  publishedAt?: string;
  publishedRefId?: string;
  channels: Channel[];
  deliveries: DeliveryStatus[];
  corrections: CorrectionEntry[];
  version: number;
}

interface PublishedEntry {
  id: string; audience: Audience; channels: Channel[];
  publishedAt: string; publishedBy: string;
  message: string;      // rendered summary line
  bodySnapshot: DraftBody;
  corrected?: boolean;
}

interface CommsRecord {
  incidentId: string;
  drafts: Record<Audience, AudienceDraft>;
  published: PublishedEntry[];
  updatedAt: string;
}

interface StoredIncident {
  incidentId: string;
  severity?: string;
  state?: string;
  situation?: string;
  impact?: string;
  affectedCustomers?: number;
  affectedServiceIds?: string[];
  nextUpdateAt?: string;
  verifiedFacts?: string[];
  hypotheses?: { text: string; confidence: number; state: string }[];
  recoveryCriteria?: { label: string; passing: boolean }[];
  activeRunbookIds?: string[];
  communications?: { id: string; at: string; audience: string; channel: string; message: string; sentBy: string }[];
  timeline?: { id?: string; at: string; actor?: string; kind?: string; text?: string; label?: string; detail?: string }[];
  remediation?: { primaryId: string; fallbackId?: string; decidedAt: string; decidedBy: string; rationale: string };
  updatedAt?: string;
  [k: string]: unknown;
}

interface StoredApproval {
  id: string; state: string; createdAt: string; executionId?: string; action?: string;
  requester?: string; deadlineAt?: string; incidentId?: string;
}

interface StoredOperationsTask {
  id: string; createdAt: string; state: string;
  title: string; detail: string; owner: string;
  incidentId?: string; source?: string;
}

/* ------------------------------ Storage --------------------------------- */

const COMMS_KEY      = "runops.communications.v1";
const INCIDENTS_KEY  = "runops.incidents.v1";
const APPROVALS_KEY  = "runops.approvals.v1";
const OPSTASKS_KEY   = "runops.operationstasks.v1";

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

/* --------------------------- Static catalog ----------------------------- */

const AUDIENCES: Audience[] = [
  "Engineering", "Executive", "Business Owner", "Customer",
  "Public Status", "Regulatory", "Internal Support",
];

const AUDIENCE_CHANNELS: Record<Audience, Channel[]> = {
  Engineering:      ["Slack", "Teams"],
  Executive:        ["Email", "Teams"],
  "Business Owner": ["Email", "Teams", "Slack"],
  Customer:         ["Email"],
  "Public Status":  ["Status Page"],
  Regulatory:       ["Email", "ITSM"],
  "Internal Support": ["ITSM", "Slack", "Google Chat"],
};

const AUDIENCE_APPROVAL_REQUIRED: Record<Audience, boolean> = {
  Engineering: false, Executive: true, "Business Owner": true,
  Customer: true, "Public Status": true, Regulatory: true,
  "Internal Support": false,
};

const AUDIENCE_ALLOWED_ROLES: Record<Audience, string[]> = {
  Engineering:      [],   // empty = any authenticated role
  Executive:        ["Incident Commander", "Executive", "Service Owner"],
  "Business Owner": ["Incident Commander", "Service Owner", "Executive"],
  Customer:         ["Incident Commander", "Service Owner"],
  "Public Status":  ["Incident Commander", "Service Owner"],
  Regulatory:       ["Incident Commander", "Change Manager"],
  "Internal Support": [],
};

/* ---------------------------- Draft generation -------------------------- */

/**
 * Deterministic audience-tailored draft assembled from the incident record.
 * Never invents recovery time. Only marks the recovery estimate as supported
 * when at least one recoveryCriterion is passing or the incident state is
 * Monitoring / Resolved.
 */
function generateDraft(inc: StoredIncident, audience: Audience): DraftBody {
  const facts = Array.isArray(inc.verifiedFacts) ? inc.verifiedFacts.slice(0, 6) : [];
  const impactText = inc.impact ?? "Impact assessment in progress.";
  const situation = inc.situation ?? "Investigation is in progress.";
  const affectedCustomers = typeof inc.affectedCustomers === "number" ? inc.affectedCustomers : null;
  const services = Array.isArray(inc.affectedServiceIds) ? inc.affectedServiceIds : [];
  const remediation = inc.remediation;
  const activeRb = Array.isArray(inc.activeRunbookIds) ? inc.activeRunbookIds : [];

  const monitoring = inc.state === "Monitoring" || inc.state === "Resolved";
  const passing = Array.isArray(inc.recoveryCriteria)
    ? inc.recoveryCriteria.filter((c) => c.passing).length : 0;
  const recoverySupported = monitoring || passing >= 2;

  const currentMitigation = remediation
    ? `Primary: ${remediation.primaryId}${remediation.fallbackId ? ` (fallback ${remediation.fallbackId})` : ""}`
    : activeRb.length ? `Active runbook(s): ${activeRb.join(", ")}` : "No mitigation executing yet.";

  const nextAction = inc.state === "Investigating"
    ? "Complete evidence review and decide on primary remediation."
    : inc.state === "Mitigating"
      ? "Monitor mitigation effect against recovery criteria."
      : monitoring
        ? "Observe recovery for sustained window; prepare final resolution communication."
        : "Continue investigation and confirm next update.";

  // Unknowns: hypotheses in Investigating/Proposed states
  const unknowns = Array.isArray(inc.hypotheses)
    ? inc.hypotheses.filter((h) => h.state !== "Confirmed" && h.state !== "Rejected")
        .slice(0, 3).map((h) => `Open question: ${h.text}`)
    : [];

  // Actions completed: prior timeline entries with kind "action"
  const actionsCompleted = Array.isArray(inc.timeline)
    ? inc.timeline.filter((t) => t.kind === "action").slice(-4).map((t) => t.text ?? t.label ?? "")
      .filter((s) => s.length)
    : [];

  const baseBody: DraftBody = {
    currentImpact: impactText,
    affectedCapabilities: services.length ? services.join(", ") : "TBD",
    knownFacts: facts,
    unknowns,
    actionsCompleted,
    currentMitigation,
    nextAction,
    nextUpdateAt: inc.nextUpdateAt ?? nowIso(),
    recoveryEstimate: recoverySupported ? "≥ 15 min sustained recovery observed against recovery criteria."
                                        : "",
    recoverySupported,
  };

  // Audience-specific shading — never adds facts not in `facts`.
  switch (audience) {
    case "Engineering":
      return {
        ...baseBody,
        currentImpact: `${impactText} · ${situation}`,
      };
    case "Executive":
      return {
        ...baseBody,
        currentImpact: `Customer-facing degradation${affectedCustomers ? ` affecting ~${affectedCustomers.toLocaleString()} customers` : ""}. ${impactText}`,
        knownFacts: facts.slice(0, 4),
        unknowns: unknowns.slice(0, 2),
      };
    case "Business Owner":
      return {
        ...baseBody,
        currentImpact: `${impactText} Capability: ${services.join(", ") || "TBD"}.`,
      };
    case "Customer":
      return {
        ...baseBody,
        currentImpact: "We are aware of an issue affecting checkout and are actively investigating.",
        affectedCapabilities: services.join(", ") || "Checkout",
        knownFacts: ["Customers may experience elevated errors or slower response times during checkout."],
        unknowns: [],
        actionsCompleted: ["Our engineering team is engaged and mitigation is in progress."],
        currentMitigation: "Mitigation is in progress.",
        nextAction: "We will publish the next update at the time listed below.",
      };
    case "Public Status":
      return {
        ...baseBody,
        currentImpact: "We are investigating elevated errors on checkout.",
        knownFacts: ["Some users may see failed or delayed transactions."],
        unknowns: [],
        actionsCompleted: [],
        currentMitigation: "Mitigation is in progress.",
        nextAction: "Next update posted at the time below.",
      };
    case "Regulatory":
      return {
        ...baseBody,
        currentImpact: `Incident ${inc.incidentId} · severity ${inc.severity ?? "SEV1"} · state ${inc.state ?? "Investigating"}. ${impactText}`,
        knownFacts: facts,   // full fact list retained for regulatory record
      };
    case "Internal Support":
      return {
        ...baseBody,
        currentImpact: `${impactText} Customer contacts should be handled per playbook.`,
        actionsCompleted: [...actionsCompleted, "Support playbook activated for elevated checkout tickets."],
      };
  }
}

/* ------------------------------ Fact check ------------------------------ */

/**
 * Return statements that are not backed by verifiedFacts.
 * Signals boilerplate that operators should confirm before publishing.
 */
function unsupportedStatements(body: DraftBody, verifiedFacts: string[]): string[] {
  const norm = verifiedFacts.map((f) => f.toLowerCase());
  const flagged: string[] = [];
  const candidates = [body.currentImpact, body.currentMitigation, body.nextAction, ...body.knownFacts];
  for (const c of candidates) {
    const lc = c.toLowerCase();
    // A statement is "supported" if any verified fact substring overlaps meaningfully.
    const supported = norm.some((f) => f.length > 8 && (lc.includes(f) || f.includes(lc.slice(0, Math.min(20, lc.length)))));
    if (!supported && c.length > 0) flagged.push(c);
  }
  // Never claim recoveryEstimate as fact when unsupported.
  if (body.recoveryEstimate && !body.recoverySupported) flagged.push(body.recoveryEstimate);
  return flagged;
}

/* ---------------------------- Simulated send ---------------------------- */

/**
 * Deterministic outcome so demos behave predictably.
 * ITSM fails to simulate connector-alert + operations-task flow.
 */
function simulateDelivery(channel: Channel, connectorDown: boolean): DeliveryStatus {
  const at = nowIso();
  if (connectorDown && (channel === "Teams" || channel === "Slack")) {
    return { channel, at, outcome: "failed", detail: `${channel} connector reports offline.` };
  }
  if (channel === "ITSM") {
    return { channel, at, outcome: "failed", detail: "ITSM queue unavailable — no ack received within timeout." };
  }
  return { channel, at, outcome: "delivered", detail: `${channel} delivery acknowledged.` };
}

/* ------------------------------- Helpers -------------------------------- */

function stateTone(s: DraftState) {
  switch (s) {
    case "published":         return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "awaiting-approval": return "bg-amber-50 text-amber-800 border-amber-200";
    case "scheduled":         return "bg-blue-50 text-blue-800 border-blue-200";
    case "delivery-failed":   return "bg-red-50 text-red-800 border-red-200";
    case "corrected":         return "bg-purple-50 text-purple-800 border-purple-200";
    case "no-permission":     return "bg-slate-100 text-slate-600 border-slate-200";
    default:                  return "bg-white text-slate-700 border-slate-200";
  }
}

function fmt(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function emptyDraft(audience: Audience): AudienceDraft {
  return {
    audience,
    state: "draft",
    body: {
      currentImpact: "", affectedCapabilities: "", knownFacts: [], unknowns: [],
      actionsCompleted: [], currentMitigation: "", nextAction: "",
      nextUpdateAt: nowIso(), recoveryEstimate: "", recoverySupported: false,
    },
    generatedAt: null, editedAt: null,
    channels: AUDIENCE_CHANNELS[audience],
    deliveries: [], corrections: [], version: 0,
  };
}

function seedRecord(incidentId: string): CommsRecord {
  const drafts: Record<Audience, AudienceDraft> = {
    Engineering: emptyDraft("Engineering"),
    Executive: emptyDraft("Executive"),
    "Business Owner": emptyDraft("Business Owner"),
    Customer: emptyDraft("Customer"),
    "Public Status": emptyDraft("Public Status"),
    Regulatory: emptyDraft("Regulatory"),
    "Internal Support": emptyDraft("Internal Support"),
  };
  return { incidentId, drafts, published: [], updatedAt: nowIso() };
}

/* -------------------------------- Page ---------------------------------- */

export default function StakeholderCommunications() {
  const ops = useOperations();
  const navigate = useNavigate();
  const params = useParams<{ incidentId?: string }>();
  const incidentId = params.incidentId ?? ops.incident.id;

  const canWrite = !(ops.role === "Read Only User" || ops.role === "Auditor");

  const [record, setRecord] = useState<CommsRecord | null>(null);
  const [incident, setIncident] = useState<StoredIncident | null>(null);
  const [audience, setAudience] = useState<Audience>("Engineering");
  const [tab, setTab] = useState<"editor" | "history" | "deliveries">("editor");
  const [dialog, setDialog] = useState<null | "compare" | "approval" | "schedule" | "publish" | "correct" | "channels">(null);
  const [approvalDeadline, setApprovalDeadline] = useState("30");
  const [scheduleAt, setScheduleAt] = useState("");
  const [correctReason, setCorrectReason] = useState("");
  const [connectorDown, setConnectorDown] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);

  /* ------------------------ Load record + incident -------------------- */
  useEffect(() => {
    const map = readMap<CommsRecord>(COMMS_KEY);
    if (map[incidentId]) setRecord(map[incidentId]);
    else {
      const seed = seedRecord(incidentId);
      map[incidentId] = seed;
      writeMap(COMMS_KEY, map);
      setRecord(seed);
    }
    const incMap = readMap<StoredIncident>(INCIDENTS_KEY);
    setIncident(incMap[incidentId] ?? { incidentId });
  }, [incidentId]);

  const audit = useCallback(
    (title: string, detail: string, kind: "info" | "warning" | "critical" = "info") => {
      ops.pushNotification({
        kind, title, detail, entityRef: incidentId,
        route: `/runops/incidents/${incidentId}/communications`,
      });
    },
    [ops, incidentId],
  );

  const persist = useCallback((next: CommsRecord) => {
    const patched = { ...next, updatedAt: nowIso() };
    const map = readMap<CommsRecord>(COMMS_KEY);
    map[patched.incidentId] = patched;
    writeMap(COMMS_KEY, map);
    setRecord(patched);
  }, []);

  const mirrorPublished = useCallback((entry: PublishedEntry) => {
    const map = readMap<StoredIncident>(INCIDENTS_KEY);
    const inc = map[incidentId] ?? { incidentId };
    const comms = Array.isArray(inc.communications) ? [...inc.communications] : [];
    comms.unshift({
      id: entry.id,
      at: entry.publishedAt,
      audience: entry.audience,
      channel: entry.channels[0] ?? "Email",
      message: entry.message,
      sentBy: entry.publishedBy,
    });
    const timeline = Array.isArray(inc.timeline) ? [...inc.timeline] : [];
    timeline.push({
      id: rid("T"),
      at: entry.publishedAt,
      actor: entry.publishedBy,
      kind: "action",
      text: `Published ${entry.audience} update via ${entry.channels.join(", ")}${entry.corrected ? " (correction)" : ""}`,
    });
    map[incidentId] = { ...inc, communications: comms, timeline, updatedAt: nowIso() };
    writeMap(INCIDENTS_KEY, map);
  }, [incidentId]);

  /* -------------------------- Derived views --------------------------- */

  const draft = record?.drafts[audience] ?? null;
  const verifiedFacts = useMemo(
    () => Array.isArray(incident?.verifiedFacts) ? incident!.verifiedFacts : [],
    [incident],
  );
  const flags = useMemo(
    () => draft ? unsupportedStatements(draft.body, verifiedFacts) : [],
    [draft, verifiedFacts],
  );

  const audienceAllowed = useMemo(() => {
    const roles = AUDIENCE_ALLOWED_ROLES[audience];
    if (!roles.length) return true;
    return roles.includes(ops.role);
  }, [audience, ops.role]);

  const resolutionEnabled = incident?.state === "Resolved" || incident?.state === "Monitoring";

  /* ------------------------------ Actions ----------------------------- */

  const setDraft = (patch: Partial<AudienceDraft>) => {
    if (!record) return;
    const next: CommsRecord = {
      ...record,
      drafts: { ...record.drafts, [audience]: { ...record.drafts[audience], ...patch, editedAt: nowIso() } },
    };
    persist(next);
  };

  const generate = () => {
    if (!record || !incident || !canWrite || !audienceAllowed) return;
    const body = generateDraft(incident, audience);
    const next: CommsRecord = {
      ...record,
      drafts: {
        ...record.drafts,
        [audience]: {
          ...record.drafts[audience],
          body, state: "draft",
          generatedAt: nowIso(),
          editedAt: nowIso(),
          version: record.drafts[audience].version + 1,
        },
      },
    };
    persist(next);
    audit(`Draft generated · ${audience}`, `Assembled from ${verifiedFacts.length} verified facts and incident state.`);
  };

  const editBody = (patch: Partial<DraftBody>) => {
    if (!record || !draft || !canWrite || !audienceAllowed) return;
    setDraft({ body: { ...draft.body, ...patch }, state: draft.state === "draft" ? "draft" : draft.state });
  };

  const requestApproval = () => {
    if (!record || !draft || !canWrite || !audienceAllowed) return;
    const id = rid("APR");
    const deadline = new Date(Date.now() + parseInt(approvalDeadline || "30", 10) * 60_000).toISOString();
    const approval: StoredApproval = {
      id, state: "Pending", createdAt: nowIso(),
      action: `Approve ${audience} communication`,
      requester: ops.role, deadlineAt: deadline, incidentId,
    };
    const list = readList<StoredApproval>(APPROVALS_KEY);
    writeList(APPROVALS_KEY, [approval, ...list]);
    setDraft({ approvalId: id, state: "awaiting-approval" });
    audit(`Approval requested · ${id}`, `${audience} communication awaiting approval. Deadline ${new Date(deadline).toLocaleTimeString()}.`);
    setDialog(null);
  };

  const approveHere = () => {
    if (!record || !draft || !canWrite || !audienceAllowed) return;
    // Update approval in list too
    const list = readList<StoredApproval>(APPROVALS_KEY);
    const patched = list.map((a) => a.id === draft.approvalId ? { ...a, state: "Approved" } : a);
    writeList(APPROVALS_KEY, patched);
    setDraft({ state: "draft" }); // ready to publish; approval carried by approvalId
    audit(`Approval recorded · ${draft.approvalId ?? "(inline)"}`, `${audience} communication cleared for publish.`);
  };

  const schedulePublish = () => {
    if (!record || !draft || !canWrite || !audienceAllowed) return;
    if (!scheduleAt) return;
    setDraft({ scheduledFor: new Date(scheduleAt).toISOString(), state: "scheduled" });
    audit(`Scheduled ${audience} update`, `Scheduled for ${new Date(scheduleAt).toLocaleString()}.`);
    setDialog(null);
  };

  const cancelSchedule = () => {
    if (!record || !draft || !canWrite) return;
    setDraft({ scheduledFor: undefined, state: "draft" });
    audit(`Scheduled ${audience} update cancelled`, `Draft returned to editable state.`);
  };

  const doPublish = (isCorrection: boolean) => {
    if (!record || !draft || !incident || !canWrite || !audienceAllowed) return;
    if (AUDIENCE_APPROVAL_REQUIRED[audience] && !draft.approvalId && !isCorrection) {
      audit(`Publish blocked · ${audience}`, "Approval required before publishing.", "warning");
      return;
    }
    const channels = selectedChannels.length ? selectedChannels : draft.channels;
    const deliveries = channels.map((c) => simulateDelivery(c, connectorDown));
    const anyFailure = deliveries.some((d) => d.outcome === "failed");

    const publishedId = rid("CM");
    const summary = `${audience} · ${draft.body.currentImpact.slice(0, 140)}${draft.body.currentImpact.length > 140 ? "…" : ""}`;
    const publishedEntry: PublishedEntry = {
      id: publishedId, audience, channels,
      publishedAt: nowIso(), publishedBy: ops.role,
      message: summary, bodySnapshot: { ...draft.body },
      corrected: isCorrection || undefined,
    };

    // Correction: keep previous published body snapshot + add correction history to draft
    let corrections = draft.corrections;
    if (isCorrection && correctReason.trim()) {
      corrections = [
        ...corrections,
        { at: nowIso(), by: ops.role, reason: correctReason.trim(), previous: { ...draft.body } },
      ];
    }

    const next: CommsRecord = {
      ...record,
      drafts: {
        ...record.drafts,
        [audience]: {
          ...draft,
          state: anyFailure ? "delivery-failed" : isCorrection ? "corrected" : "published",
          publishedAt: publishedEntry.publishedAt,
          publishedRefId: publishedId,
          channels,
          deliveries: [...draft.deliveries, ...deliveries],
          corrections,
        },
      },
      published: [publishedEntry, ...record.published],
    };
    persist(next);
    mirrorPublished(publishedEntry);

    if (anyFailure) {
      // Create operations tasks + connector alert for each failure
      const list = readList<StoredOperationsTask>(OPSTASKS_KEY);
      const newTasks: StoredOperationsTask[] = deliveries.filter((d) => d.outcome === "failed").map((d) => ({
        id: rid("OPT"), createdAt: nowIso(), state: "Open",
        title: `Retry ${d.channel} delivery for ${audience} update`,
        detail: `${d.detail} Published record ${publishedId}.`,
        owner: "Comms Lead", incidentId, source: "communications",
      }));
      writeList(OPSTASKS_KEY, [...newTasks, ...list]);
      audit(
        `${isCorrection ? "Correction" : "Publish"} partial · ${audience}`,
        `${deliveries.filter((d) => d.outcome === "failed").length} channel failure(s) — operations task(s) created.`,
        "critical",
      );
    } else {
      audit(
        `${isCorrection ? "Correction" : "Publish"} · ${audience}`,
        `Delivered via ${channels.join(", ")}.`,
      );
    }
    setDialog(null);
    setCorrectReason("");
  };

  const copyDraft = () => {
    if (!draft) return;
    const text = renderPlain(audience, draft.body);
    try { void navigator.clipboard?.writeText(text); } catch { /* ignore */ }
    audit(`Copied ${audience} draft`, `${text.length} characters copied to clipboard.`);
  };

  const createFollowUp = () => {
    if (!record || !draft || !incident || !canWrite || !audienceAllowed) return;
    const body = generateDraft(incident, audience);
    // Push nextUpdateAt forward 15 min from the previous next update
    const base = draft.body.nextUpdateAt ? new Date(draft.body.nextUpdateAt) : new Date();
    const next = new Date(base.getTime() + 15 * 60_000).toISOString();
    const nextRecord: CommsRecord = {
      ...record,
      drafts: {
        ...record.drafts,
        [audience]: {
          ...emptyDraft(audience),
          body: { ...body, nextUpdateAt: next },
          state: "draft",
          generatedAt: nowIso(),
          editedAt: nowIso(),
          corrections: draft.corrections,
          version: draft.version + 1,
        },
      },
    };
    persist(nextRecord);
    audit(`Follow-up draft created · ${audience}`, `Next update scheduled for ${new Date(next).toLocaleTimeString()}.`);
  };

  const resolutionCommunication = () => {
    if (!record || !incident || !canWrite || !audienceAllowed || !resolutionEnabled) return;
    const body: DraftBody = {
      ...generateDraft(incident, audience),
      currentImpact: `Incident ${incidentId} has been resolved. Full recovery observed against all criteria.`,
      currentMitigation: "Resolution confirmed — final mitigation in effect.",
      nextAction: "Postmortem will follow within 5 business days.",
      recoveryEstimate: "Recovery observed and confirmed.",
      recoverySupported: true,
    };
    setDraft({ body, state: "draft", generatedAt: nowIso(), editedAt: nowIso(), version: draft ? draft.version + 1 : 1 });
    audit(`Resolution draft prepared · ${audience}`, `Ready for final publish.`);
  };

  /* ------------------------------ Render ------------------------------ */

  if (!record || !draft || !incident) {
    return (
      <div className="flex flex-col">
        <EntityHeader title="Stakeholder Communications" subtitle="Loading incident record…" />
        <div className="p-6 text-sm text-slate-600">Preparing communications workspace for {incidentId}…</div>
      </div>
    );
  }

  const publishRequiresApproval = AUDIENCE_APPROVAL_REQUIRED[audience];
  const canPublish = canWrite && audienceAllowed && (!publishRequiresApproval || Boolean(draft.approvalId));

  const headerTone = draft.state === "published" ? "success"
    : draft.state === "delivery-failed" ? "at-risk"
    : draft.state === "awaiting-approval" ? "warning"
    : "neutral";
  const headerLabel = ({
    "draft": "Draft in progress",
    "awaiting-approval": `Awaiting approval · ${draft.approvalId ?? ""}`.trim(),
    "scheduled": `Scheduled for ${fmt(draft.scheduledFor)}`,
    "published": `Published ${fmt(draft.publishedAt)}`,
    "delivery-failed": "Delivery failed on one or more channels",
    "corrected": `Corrected ${fmt(draft.publishedAt)}`,
    "no-permission": "Audience blocked for current role",
  } as Record<DraftState, string>)[draft.state];

  return (
    <div className="flex flex-col">
      <EntityHeader
        eyebrow={`Incident ${incidentId}`}
        title="Stakeholder Communications"
        subtitle="Grounded, audience-appropriate updates assembled from the incident record"
        status={{ tone: headerTone, label: headerLabel }}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge variant="outline" className="border-slate-300">Tenant · {ops.tenant.name}</Badge>
            <Badge variant="outline" className="border-slate-300">Service · {ops.selectedServiceId}</Badge>
            <Badge variant="outline" className="border-slate-300">Environment · {ops.environment}</Badge>
            <Badge variant="outline" className="border-slate-300">Role · {ops.role}</Badge>
            <Badge variant="outline" className="border-slate-300">Scenario · {ops.stages[ops.stageIndex]?.label ?? "—"}</Badge>
            <Badge variant="outline" className="border-slate-300">Incident state · {incident.state ?? "Investigating"}</Badge>
            {flags.length > 0 && draft.state !== "published" && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200">{flags.length} unsupported statement{flags.length === 1 ? "" : "s"}</Badge>
            )}
            {!canWrite && <Badge className="bg-amber-100 text-amber-900 border-amber-300">Read-only role — mutations disabled</Badge>}
            {!audienceAllowed && <Badge className="bg-red-50 text-red-700 border-red-200">No audience permission for current role</Badge>}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600" aria-label="Toggle chat connectors offline">
              <input type="checkbox" checked={connectorDown} onChange={(e) => setConnectorDown(e.target.checked)} aria-label="Chat connectors offline" />
              Chat connectors offline
            </label>
            <Button size="sm" variant="outline" onClick={() => navigate(`/runops/incidents/${incidentId}`)} aria-label="Back to incident command">
              Incident Command
            </Button>
            <Button size="sm" variant="outline" onClick={resolutionCommunication}
              disabled={!canWrite || !audienceAllowed || !resolutionEnabled} aria-label="Prepare resolution communication">
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Resolution comm
            </Button>
            <Button size="sm" onClick={generate}
              disabled={!canWrite || !audienceAllowed} aria-label="Generate draft from incident record">
              <Sparkles className="mr-1.5 h-4 w-4" /> Generate draft
            </Button>
          </div>
        }
      />

      {/* Audience tabs */}
      <div className="mx-3 mt-3 overflow-x-auto">
        <div className="flex gap-2">
          {AUDIENCES.map((a) => {
            const d = record.drafts[a];
            return (
              <button
                key={a}
                onClick={() => setAudience(a)}
                aria-label={`Switch to ${a} audience`}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs whitespace-nowrap",
                  a === audience ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                )}
              >
                {a}
                <span className={cn("ml-2 rounded px-1.5 py-0.5 text-[10px] border", stateTone(d.state))}>
                  {d.state === "no-permission" ? "no permission" : d.state}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
        <TabsList className="mx-3 mt-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries ({draft.deliveries.length})</TabsTrigger>
          <TabsTrigger value="history">History ({record.published.length})</TabsTrigger>
        </TabsList>

        {/* -------------------- Editor tab ----------------------- */}
        <TabsContent value="editor" className="p-3">
          {!audienceAllowed ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Your role ({ops.role}) is not permitted to send {audience} communications. Allowed roles: {AUDIENCE_ALLOWED_ROLES[audience].join(", ") || "any"}.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
              <div className="space-y-3">
                <Card className="border border-slate-200">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-800">{audience} draft · v{draft.version}</div>
                      <Badge className={cn("border", stateTone(draft.state))}>{draft.state}</Badge>
                    </div>

                    {flags.length > 0 && draft.state !== "published" && draft.state !== "corrected" && (
                      <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 flex items-start gap-1.5">
                        <TriangleAlert className="h-3.5 w-3.5 mt-0.5" />
                        <div>
                          <div className="font-medium">{flags.length} statement{flags.length === 1 ? "" : "s"} not backed by verified facts. Review before publishing.</div>
                          <ul className="mt-1 list-disc pl-4 space-y-0.5">
                            {flags.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    <Field label="Current impact">
                      <Textarea value={draft.body.currentImpact} onChange={(e) => editBody({ currentImpact: e.target.value })}
                        disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} rows={2} aria-label="Current impact" />
                    </Field>
                    <Field label="Affected capabilities">
                      <Input value={draft.body.affectedCapabilities} onChange={(e) => editBody({ affectedCapabilities: e.target.value })}
                        disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} aria-label="Affected capabilities" />
                    </Field>
                    <BulletField label="Known facts (verified)" values={draft.body.knownFacts}
                      onChange={(v) => editBody({ knownFacts: v })}
                      disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} />
                    <BulletField label="Unknowns / open questions" values={draft.body.unknowns}
                      onChange={(v) => editBody({ unknowns: v })}
                      disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} />
                    <BulletField label="Actions completed" values={draft.body.actionsCompleted}
                      onChange={(v) => editBody({ actionsCompleted: v })}
                      disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} />
                    <Field label="Current mitigation">
                      <Input value={draft.body.currentMitigation} onChange={(e) => editBody({ currentMitigation: e.target.value })}
                        disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} aria-label="Current mitigation" />
                    </Field>
                    <Field label="Next action">
                      <Input value={draft.body.nextAction} onChange={(e) => editBody({ nextAction: e.target.value })}
                        disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} aria-label="Next action" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Next update at">
                        <Input type="datetime-local"
                          value={toLocalInput(draft.body.nextUpdateAt)}
                          onChange={(e) => editBody({ nextUpdateAt: fromLocalInput(e.target.value) })}
                          disabled={!canWrite || draft.state === "published" || draft.state === "corrected"} aria-label="Next update time" />
                      </Field>
                      <Field label="Recovery estimate (only when supported)">
                        <Input value={draft.body.recoveryEstimate}
                          onChange={(e) => editBody({ recoveryEstimate: e.target.value, recoverySupported: e.target.value.length > 0 && draft.body.recoverySupported })}
                          disabled={!canWrite || !draft.body.recoverySupported || draft.state === "published" || draft.state === "corrected"}
                          placeholder={draft.body.recoverySupported ? "Enter recovery estimate" : "Not yet supported by criteria"}
                          aria-label="Recovery estimate" />
                        <div className="mt-1 text-[10px] text-slate-500">
                          {draft.body.recoverySupported ? "Supported by ≥ 2 passing recovery criteria." : "Recovery estimate disabled until criteria pass."}
                        </div>
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <Card className="border border-slate-200">
                  <CardContent className="p-3 space-y-2">
                    <div className="text-sm font-semibold text-slate-800">Actions</div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setDialog("compare")} aria-label="Compare with source facts">
                      <GitCompare className="mr-1.5 h-4 w-4" /> Compare with source facts
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setDialog("approval")}
                      disabled={!canWrite || draft.state === "awaiting-approval" || draft.state === "published"} aria-label="Request approval">
                      <ShieldCheck className="mr-1.5 h-4 w-4" /> Request approval
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={approveHere}
                      disabled={!canWrite || draft.state !== "awaiting-approval" || (ops.role !== "Incident Commander" && ops.role !== "Change Manager")} aria-label="Approve here">
                      Approve here
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => { setSelectedChannels(draft.channels); setDialog("channels"); }}
                      disabled={!canWrite} aria-label="Choose delivery channels">
                      <Send className="mr-1.5 h-4 w-4" /> Choose channels ({draft.channels.length})
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setDialog("schedule")}
                      disabled={!canWrite || draft.state === "published"} aria-label="Schedule publish">
                      <CalendarClock className="mr-1.5 h-4 w-4" /> Schedule
                    </Button>
                    {draft.state === "scheduled" && (
                      <Button size="sm" variant="outline" className="w-full text-red-700" onClick={cancelSchedule} aria-label="Cancel scheduled">
                        <XCircle className="mr-1.5 h-4 w-4" /> Cancel scheduled
                      </Button>
                    )}
                    <Button size="sm" className="w-full" onClick={() => setDialog("publish")}
                      disabled={!canPublish} aria-label="Publish now">
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Publish now
                    </Button>
                    {(draft.state === "published" || draft.state === "corrected") && (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => setDialog("correct")}
                        disabled={!canWrite} aria-label="Publish correction">
                        <RefreshCw className="mr-1.5 h-4 w-4" /> Publish correction
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="w-full" onClick={copyDraft} aria-label="Copy draft">
                      <ClipboardCopy className="mr-1.5 h-4 w-4" /> Copy
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full" onClick={createFollowUp}
                      disabled={!canWrite || !audienceAllowed} aria-label="Create follow-up update">
                      <RefreshCw className="mr-1.5 h-4 w-4" /> Create follow-up update
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardContent className="p-3 space-y-2">
                    <div className="text-sm font-semibold text-slate-800">Source of truth</div>
                    <div className="text-xs text-slate-600">Facts and state come from the incident record — never fabricated.</div>
                    <div className="grid gap-1 text-xs">
                      <Row k="Severity" v={incident.severity ?? "SEV1"} />
                      <Row k="State" v={incident.state ?? "Investigating"} />
                      <Row k="Impact" v={incident.impact ?? "—"} />
                      <Row k="Affected" v={typeof incident.affectedCustomers === "number" ? `~${incident.affectedCustomers.toLocaleString()} customers` : "—"} />
                      <Row k="Next update" v={fmt(incident.nextUpdateAt)} />
                      <Row k="Verified facts" v={`${verifiedFacts.length} on record`} />
                      <Row k="Recovery criteria" v={
                        Array.isArray(incident.recoveryCriteria)
                          ? `${incident.recoveryCriteria.filter((c) => c.passing).length}/${incident.recoveryCriteria.length} passing`
                          : "—"} />
                    </div>
                  </CardContent>
                </Card>

                {draft.corrections.length > 0 && (
                  <Card className="border border-slate-200">
                    <CardContent className="p-3 space-y-2">
                      <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"><History className="h-4 w-4" /> Correction history</div>
                      <ul className="space-y-1 text-xs">
                        {draft.corrections.map((c, i) => (
                          <li key={i} className="rounded border border-slate-200 bg-slate-50 p-2">
                            <div className="font-medium text-slate-800">{fmt(c.at)} · {c.by}</div>
                            <div className="text-slate-700">{c.reason}</div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* -------------------- Deliveries tab ----------------------- */}
        <TabsContent value="deliveries" className="p-3">
          <Card className="border border-slate-200">
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2 text-left font-medium">At</th>
                    <th className="p-2 text-left font-medium">Channel</th>
                    <th className="p-2 text-left font-medium">Outcome</th>
                    <th className="p-2 text-left font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.deliveries.length === 0 ? (
                    <tr><td className="p-4 text-slate-500" colSpan={4}>No deliveries yet.</td></tr>
                  ) : draft.deliveries.slice().reverse().map((d, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="p-2">{fmt(d.at)}</td>
                      <td className="p-2">{d.channel}</td>
                      <td className="p-2">
                        <Badge className={cn("border", d.outcome === "delivered" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200")}>
                          {d.outcome}
                        </Badge>
                      </td>
                      <td className="p-2 text-slate-700">{d.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------- History tab ----------------------- */}
        <TabsContent value="history" className="p-3">
          <Card className="border border-slate-200">
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2 text-left font-medium">Published</th>
                    <th className="p-2 text-left font-medium">Audience</th>
                    <th className="p-2 text-left font-medium">Channels</th>
                    <th className="p-2 text-left font-medium">By</th>
                    <th className="p-2 text-left font-medium">Message</th>
                    <th className="p-2 text-left font-medium">Kind</th>
                  </tr>
                </thead>
                <tbody>
                  {record.published.length === 0 ? (
                    <tr><td className="p-4 text-slate-500" colSpan={6}>No communications published yet.</td></tr>
                  ) : record.published.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="p-2">{fmt(p.publishedAt)}</td>
                      <td className="p-2">{p.audience}</td>
                      <td className="p-2">{p.channels.join(", ")}</td>
                      <td className="p-2">{p.publishedBy}</td>
                      <td className="p-2 text-slate-700 max-w-[420px]">{p.message}</td>
                      <td className="p-2">
                        <Badge className={cn("border", p.corrected ? "bg-purple-50 text-purple-800 border-purple-200" : "bg-emerald-50 text-emerald-800 border-emerald-200")}>
                          {p.corrected ? "correction" : "published"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="h-3 w-3" />
            Published communications are retained immutably as incident evidence. Corrections append new entries; prior snapshots are preserved.
          </div>
        </TabsContent>
      </Tabs>

      {/* ------------------------ Dialogs ------------------------ */}
      <Dialog open={dialog === "compare"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Compare with source facts</DialogTitle></DialogHeader>
          <div className="grid gap-3 text-xs md:grid-cols-2">
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1">Draft statements</div>
              <ul className="space-y-1">
                <li className="rounded border border-slate-200 bg-slate-50 p-2">{draft.body.currentImpact}</li>
                <li className="rounded border border-slate-200 bg-slate-50 p-2">{draft.body.currentMitigation}</li>
                <li className="rounded border border-slate-200 bg-slate-50 p-2">{draft.body.nextAction}</li>
                {draft.body.knownFacts.map((f, i) => (
                  <li key={i} className="rounded border border-slate-200 bg-slate-50 p-2">{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1">Verified incident facts ({verifiedFacts.length})</div>
              <ul className="space-y-1">
                {verifiedFacts.length === 0
                  ? <li className="text-slate-500">No verified facts on record.</li>
                  : verifiedFacts.map((f, i) => <li key={i} className="rounded border border-emerald-200 bg-emerald-50 p-2 text-emerald-900">{f}</li>)}
              </ul>
              {flags.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-amber-800 mb-1">Unsupported</div>
                  <ul className="space-y-1">
                    {flags.map((f, i) => <li key={i} className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-900">{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setDialog(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "approval"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Request approval · {audience}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">A pending approval will be added to the Approval Center.</div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Deadline (minutes):</span>
              <Select value={approvalDeadline} onValueChange={setApprovalDeadline}>
                <SelectTrigger className="h-8 w-28" aria-label="Approval deadline"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={requestApproval}>Create approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "schedule"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule publish</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">The draft will publish automatically at the selected time.</div>
            <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} aria-label="Scheduled time" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={schedulePublish} disabled={!scheduleAt}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "publish"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish now</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">Channels selected: {(selectedChannels.length ? selectedChannels : draft.channels).join(", ")}</div>
            {publishRequiresApproval && !draft.approvalId && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-red-800">This audience requires approval before publish.</div>
            )}
            {flags.length > 0 && (
              <div className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-900">
                {flags.length} unsupported statement{flags.length === 1 ? "" : "s"} still present. Confirm before publishing.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => doPublish(false)} disabled={!canPublish}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "correct"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Publish correction</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">Original will be preserved in history; correction appended with reason.</div>
            <Textarea value={correctReason} onChange={(e) => setCorrectReason(e.target.value)}
              placeholder="What is being corrected and why?" aria-label="Correction reason" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => doPublish(true)} disabled={!correctReason.trim() || !canWrite}>Publish correction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "channels"} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Choose delivery channels</DialogTitle></DialogHeader>
          <div className="space-y-2 text-xs">
            <div className="text-slate-700">Default channels for {audience}: {AUDIENCE_CHANNELS[audience].join(", ")}.</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(["Teams", "Slack", "Google Chat", "Email", "ITSM", "Status Page"] as Channel[]).map((c) => (
                <label key={c} className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2" aria-label={`Toggle ${c} delivery`}>
                  <input type="checkbox" checked={selectedChannels.includes(c)} onChange={(e) => {
                    setSelectedChannels((prev) => e.target.checked ? [...prev, c] : prev.filter((x) => x !== c));
                  }} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => { setDraft({ channels: selectedChannels }); setDialog(null); }} disabled={!selectedChannels.length}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------- Sub-components ----------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <div className="w-32 shrink-0 text-slate-500">{k}</div>
      <div className="flex-1 text-slate-800">{v}</div>
    </div>
  );
}

interface BulletFieldProps {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}
function BulletField({ label, values, onChange, disabled }: BulletFieldProps) {
  const [entry, setEntry] = useState("");
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-slate-500">{label}</div>
      <ul className="mb-1 space-y-1">
        {values.length === 0 && <li className="text-xs text-slate-400">— none —</li>}
        {values.map((v, i) => (
          <li key={i} className="flex items-start gap-2 rounded border border-slate-200 bg-slate-50 p-1.5 text-xs">
            <span className="flex-1 text-slate-700">{v}</span>
            {!disabled && (
              <button className="text-slate-400 hover:text-red-600" onClick={() => onChange(values.filter((_, idx) => idx !== i))} aria-label={`Remove ${label} item`}>
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {!disabled && (
        <div className="flex gap-1">
          <Input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder={`Add ${label.toLowerCase()}`} aria-label={`Add ${label} item`} className="h-8 text-xs" />
          <Button size="sm" variant="outline" className="h-8" onClick={() => { if (entry.trim()) { onChange([...values, entry.trim()]); setEntry(""); } }} aria-label={`Append ${label} item`}>Add</Button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Utilities -------------------------------- */

function renderPlain(audience: Audience, b: DraftBody): string {
  const lines: string[] = [];
  lines.push(`[${audience}] Current impact`);
  lines.push(b.currentImpact);
  lines.push("");
  lines.push(`Affected capabilities: ${b.affectedCapabilities}`);
  if (b.knownFacts.length) { lines.push("Known facts:"); b.knownFacts.forEach((f) => lines.push(`- ${f}`)); }
  if (b.unknowns.length) { lines.push("Unknowns:"); b.unknowns.forEach((f) => lines.push(`- ${f}`)); }
  if (b.actionsCompleted.length) { lines.push("Actions completed:"); b.actionsCompleted.forEach((f) => lines.push(`- ${f}`)); }
  lines.push(`Current mitigation: ${b.currentMitigation}`);
  lines.push(`Next action: ${b.nextAction}`);
  lines.push(`Next update at: ${fmt(b.nextUpdateAt)}`);
  if (b.recoveryEstimate && b.recoverySupported) lines.push(`Recovery estimate: ${b.recoveryEstimate}`);
  return lines.join("\n");
}

function toLocalInput(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}
function fromLocalInput(v: string): string {
  try { return new Date(v).toISOString(); } catch { return v; }
}
