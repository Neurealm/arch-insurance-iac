import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ExternalLink, GitPullRequest, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { resumeServiceNowIntake } from "./servicenowIntakeRequests";
import {
  approveCapability, getCapabilityGap, listCapabilityGaps, listGapEvents, syncCapabilityCi,
  type CapabilityGap, type CiStatus, type GapEvent, type GapStatus,
} from "./capabilityAdmin";

function Panel({ title, right, children, className }: { title: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={cn("rounded-md border border-[#E2E8F0] bg-white", className)}><header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>{right && <div className="ml-auto">{right}</div>}</header><div className="p-3">{children}</div></section>;
}
function Row({ label, value }: { label: string; value: ReactNode }) { return <div className="flex items-start justify-between gap-4 border-b border-[#F1F5F9] py-1.5 text-[12px] last:border-0"><span className="text-slate-500">{label}</span><span className="max-w-[65%] break-words text-right font-medium text-slate-800">{value}</span></div>; }
function title(value: string) { return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function dateTime(value: string | null | undefined) { return value ? new Date(value).toLocaleString() : "Not reported"; }
function shortSha(value: string | null) { return value ? value.slice(0, 12) : "Not reported"; }

const gapClass: Record<GapStatus, string> = {
  open: "border-slate-200 bg-slate-50 text-slate-700", searching_existing: "border-slate-200 bg-slate-50 text-slate-700",
  drafting: "border-blue-200 bg-blue-50 text-blue-700", pr_opened: "border-blue-200 bg-blue-50 text-blue-700",
  ci_running: "border-amber-200 bg-amber-50 text-amber-700", ci_passed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ci_failed: "border-red-200 bg-red-50 text-red-700", ready_for_review: "border-amber-200 bg-amber-50 text-amber-700",
  capability_approved: "border-emerald-200 bg-emerald-50 text-emerald-700", abandoned: "border-slate-200 bg-slate-100 text-slate-600",
};
function GapBadge({ status }: { status: GapStatus }) { return <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", gapClass[status] ?? gapClass.open)}>{title(status)}</span>; }

const ciClass: Record<CiStatus, string> = {
  unknown: "border-slate-200 bg-slate-50 text-slate-600", running: "border-amber-200 bg-amber-50 text-amber-700",
  passed: "border-emerald-200 bg-emerald-50 text-emerald-700", failed: "border-red-200 bg-red-50 text-red-700",
};
function CiBadge({ status }: { status: CiStatus }) { return <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", ciClass[status] ?? ciClass.unknown)}>CI {title(status)}</span>; }

/**
 * Why promotion is or is not available, evaluated against the last *server*
 * observation. This mirrors approve_iac_capability's preconditions so a
 * reviewer is told the reason up front, but it is only a display: the server
 * re-observes GitHub and the SQL function re-checks everything under a lock.
 * A green banner here is never by itself authority to promote.
 */
function promotionReadiness(gap: CapabilityGap, viewerId: string | null) {
  const evidence = gap.ciEvidence as Record<string, unknown>;
  const review = (evidence.review ?? {}) as Record<string, unknown>;
  if (gap.status === "capability_approved") return { tone: "done" as const, label: "Already promoted", detail: "This capability has been approved and its reviewed source is pinned." };
  if (!gap.linkedCapabilityId || !gap.capability) return { tone: "blocked" as const, label: "No draft capability", detail: "No draft capability is linked to this gap yet, so there is nothing to promote." };
  if (!gap.draftPrNumber) return { tone: "blocked" as const, label: "No draft PR", detail: "The drafting agent has not opened a pull request for this gap yet." };
  if (gap.ciStatus !== "passed" || gap.status !== "ci_passed") return { tone: "blocked" as const, label: "CI has not passed", detail: "Synchronize CI and wait for a passing run on the exact head commit before promotion is offered." };
  if (!gap.requestedBy) return { tone: "blocked" as const, label: "No identified requester", detail: "Separation of duties cannot be enforced without an identified requester." };
  if (viewerId && gap.requestedBy === viewerId) return { tone: "blocked" as const, label: "Self-approval is prohibited", detail: "You requested this capability. A different platform administrator must promote it." };
  if (evidence.merged !== true || typeof evidence.mergeSha !== "string") return { tone: "blocked" as const, label: "PR is not merged", detail: "The reviewed pull request must be merged before its commit can be promoted." };
  if (review.state !== "APPROVED" || review.commitId !== gap.ciHeadSha) return { tone: "blocked" as const, label: "No GitHub review of this commit", detail: "An independent GitHub approval of this exact commit is required." };
  if (evidence.promotionReady !== true) return { tone: "blocked" as const, label: "Server withheld promotion", detail: "The server's own evidence check did not mark this observation promotion-ready." };
  return { tone: "ready" as const, label: "Ready for promotion", detail: "Fresh CI, an independent GitHub review and a verified merge are all present for this exact commit." };
}

type StepState = "done" | "active" | "failed" | "pending";

/**
 * Display-only progress strip. Every state is derived from the gap record and
 * its recorded events; this screen never infers progress the server did not
 * write.
 */
function agentSteps(gap: CapabilityGap, events: GapEvent[]) {
  const seen = new Set(events.map((event) => event.eventType));
  const drafted = !!gap.linkedCapabilityId || seen.has("pr_opened");
  const draftFailed = !drafted && (seen.has("draft_validation_failed") || seen.has("drafting_failed") || seen.has("draft_capability_insert_failed"));
  const prOpened = !!gap.draftPrNumber;
  const prFailed = !prOpened && seen.has("pr_open_failed");
  const promoted = gap.status === "capability_approved";
  const evidence = gap.ciEvidence as Record<string, unknown>;
  const review = (evidence.review ?? {}) as Record<string, unknown>;
  const reviewed = evidence.merged === true && review.state === "APPROVED";

  const step = (label: string, detail: string, state: StepState) => ({ label, detail, state });
  return [
    step("Request accepted", "A capability gap was opened from the intake request.", "done"),
    step("Module drafted", draftFailed ? "The generated module was rejected by the policy check." : drafted ? "Terraform files were generated and passed the policy check." : "Waiting for the drafting agent.",
      draftFailed ? "failed" : drafted ? "done" : gap.status === "drafting" ? "active" : "pending"),
    step("Pull request opened", prFailed ? "The pull request could not be opened." : prOpened ? `Draft pull request #${gap.draftPrNumber} is open for review.` : "No pull request yet.",
      prFailed ? "failed" : prOpened ? "done" : drafted ? "active" : "pending"),
    step("Automated checks", gap.ciStatus === "passed" ? "Formatting, validation and policy checks passed on the reviewed commit." : gap.ciStatus === "failed" ? "The automated checks failed on the reviewed commit." : gap.ciStatus === "running" ? "Checks are running." : "Not observed yet.",
      gap.ciStatus === "passed" ? "done" : gap.ciStatus === "failed" ? "failed" : gap.ciStatus === "running" ? "active" : prOpened ? "active" : "pending"),
    step("Reviewed and merged", reviewed ? "An independent reviewer approved this commit and it was merged." : "Awaiting an independent approval and merge of this exact commit.",
      reviewed ? "done" : gap.ciStatus === "passed" ? "active" : "pending"),
    step("Promoted for use", promoted ? "The reviewed commit is pinned and the capability can be used in change packages." : "The capability stays unusable until it is promoted.",
      promoted ? "done" : reviewed ? "active" : "pending"),
  ];
}

const stepTone: Record<StepState, { dot: string; text: string; bar: string }> = {
  done: { dot: "border-emerald-300 bg-emerald-500 text-white", text: "text-slate-800", bar: "bg-emerald-300" },
  active: { dot: "border-[#1B4F91] bg-white text-[#1B4F91] animate-pulse", text: "text-[#1B4F91]", bar: "bg-slate-200" },
  failed: { dot: "border-red-300 bg-red-500 text-white", text: "text-red-700", bar: "bg-slate-200" },
  pending: { dot: "border-slate-200 bg-white text-slate-400", text: "text-slate-400", bar: "bg-slate-200" },
};

function AgentProgress({ gap, events }: { gap: CapabilityGap; events: GapEvent[] }) {
  const steps = agentSteps(gap, events);
  return <Panel title="Drafting agent progress" className="mb-3">
    <ol className="flex flex-col gap-3 md:flex-row md:gap-0">
      {steps.map((item, index) => {
        const tone = stepTone[item.state];
        return <li key={item.label} className="relative flex min-w-0 flex-1 gap-2.5 md:flex-col md:gap-2">
          <div className="flex flex-col items-center md:w-full md:flex-row">
            <span className={cn("z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10.5px] font-semibold", tone.dot)} aria-hidden="true">
              {item.state === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : item.state === "failed" ? <AlertTriangle className="h-3.5 w-3.5" /> : index + 1}
            </span>
            {index < steps.length - 1 && <span className={cn("hidden h-0.5 w-full md:block", tone.bar)} />}
            {index < steps.length - 1 && <span className={cn("w-0.5 flex-1 md:hidden", tone.bar)} />}
          </div>
          <div className="min-w-0 pb-1 md:pr-3">
            <p className={cn("text-[12px] font-semibold", tone.text)}>{item.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{item.detail}</p>
          </div>
        </li>;
      })}
    </ol>
    <p className="mt-2 text-[11px] text-slate-500">Each step reflects what the server recorded. The agent only drafts and opens a pull request; it never plans or applies anything in Azure.</p>
  </Panel>;
}

export default function CapabilityApproval() {
  const { gapId } = useParams<{ gapId: string }>();
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <div className="min-w-0 p-4"><Panel title="Capability promotion"><div className="flex items-start gap-2 py-6 text-[12px] text-slate-700"><ShieldAlert className="mt-0.5 h-4 w-4 text-amber-600" /><div><p className="font-medium text-slate-800">Platform administrator access is required.</p><p className="mt-1 text-slate-600">Promoting a drafted Terraform capability is a governance decision restricted to platform administrators. The server enforces this independently of this screen.</p></div></div></Panel></div>;
  }
  return gapId ? <GapDetail gapId={gapId} /> : <GapQueue />;
}

function GapQueue() {
  const [gaps, setGaps] = useState<CapabilityGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setGaps(await listCapabilityGaps()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load engineering gaps."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const sync = async () => {
    setSyncing(true); setError(null); setNotice(null);
    try { const results = await syncCapabilityCi(); setNotice(`Re-observed GitHub for ${results.length} gap(s). No capability was promoted.`); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to synchronize CI evidence."); }
    finally { setSyncing(false); }
  };

  const open = gaps.filter((gap) => gap.status !== "capability_approved" && gap.status !== "abandoned");

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/resources" className="hover:text-[#1B4F91]">Azure Resources</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Capability Promotion</span></nav>
      <button type="button" onClick={() => void sync()} disabled={syncing} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />{syncing ? "Observing GitHub…" : "Synchronize CI"}</button>
      <button type="button" onClick={() => void load()} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
    </div>
    <header className="mb-4 flex flex-wrap items-start gap-3">
      <div><h1 className="text-[20px] font-semibold text-slate-900">Terraform Capability Promotion</h1><p className="mt-1 max-w-3xl text-[12px] text-slate-600">AI-drafted Terraform modules stay unusable until a platform administrator promotes the exact reviewed commit. Promotion records provenance; it never plans or applies anything in Azure.</p></div>
      <div className="ml-auto rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Requester cannot self-promote</div>
    </header>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {notice && <div className="mb-3 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[12px] text-[#16406f]">{notice}</div>}
    <Panel title="Engineering gaps" right={<span className="text-[11px] text-slate-500">{loading ? "Loading…" : `${open.length} open · ${gaps.length} total`}</span>}>
      <p className="mb-3 text-[11.5px] text-slate-600">CI status is only ever written by the server after it reads GitHub with a read-only token. A green check here reflects the last server observation, not a live browser query.</p>
      {loading
        ? <p className="py-8 text-center text-[12px] text-slate-500">Loading engineering gaps…</p>
        : gaps.length
          ? <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-[12px]"><thead className="border-b border-[#E2E8F0] text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2 font-medium">Action</th><th className="pb-2 font-medium">Draft capability</th><th className="pb-2 font-medium">Pull request</th><th className="pb-2 font-medium">CI</th><th className="pb-2 font-medium">Reviewed commit</th><th className="pb-2 font-medium">Gap status</th><th className="pb-2 font-medium">Updated</th><th className="pb-2" /></tr></thead><tbody>{gaps.map((gap) => <tr key={gap.id} className="border-b border-[#EEF2F6]">
            <td className="py-3"><div className="font-medium text-slate-800">{title(gap.actionType)}</div><div className="mt-0.5 text-[10.5px] text-slate-500">{gap.resourceType}</div></td>
            <td className="py-3">{gap.capability ? <><div className="font-medium text-slate-800">{gap.capability.displayName}</div><div className="mt-0.5 font-mono text-[10.5px] text-slate-500">{gap.capability.lifecycleStatus} · {gap.capability.moduleSource}</div></> : <span className="text-slate-500">Not drafted</span>}</td>
            <td className="py-3">{gap.draftPrUrl ? <a href={gap.draftPrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[#1B4F91] hover:underline"><GitPullRequest className="h-3.5 w-3.5" />#{gap.draftPrNumber}<ExternalLink className="h-3 w-3" /></a> : <span className="text-slate-500">None</span>}</td>
            <td className="py-3"><CiBadge status={gap.ciStatus} /></td>
            <td className="py-3 font-mono text-[10.5px] text-slate-600">{shortSha(gap.ciHeadSha)}</td>
            <td className="py-3"><GapBadge status={gap.status} /></td>
            <td className="py-3 text-[10.5px] text-slate-500">{dateTime(gap.updatedAt)}</td>
            <td className="py-3 text-right"><Link to={`/platform/capabilities/${gap.id}`} className="text-[11.5px] font-medium text-[#1B4F91] hover:underline">Review</Link></td>
          </tr>)}</tbody></table></div>
          : <p className="py-8 text-center text-[12px] text-slate-600">No engineering gaps exist. One is opened automatically when an intake request needs a capability that is not yet approved.</p>}
    </Panel>
  </div>;
}

function GapDetail({ gapId }: { gapId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gap, setGap] = useState<CapabilityGap | null>(null);
  const [events, setEvents] = useState<GapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"sync" | "approve" | "resume" | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const [record, history] = await Promise.all([getCapabilityGap(gapId), listGapEvents(gapId)]); setGap(record); setEvents(history); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load this engineering gap."); }
    finally { setLoading(false); }
  }, [gapId]);
  useEffect(() => { void load(); }, [load]);

  const sync = async () => {
    setBusy("sync"); setError(null); setNotice(null);
    try { await syncCapabilityCi(gapId); setNotice("GitHub was re-observed and the evidence was recorded. No capability was promoted."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to synchronize CI evidence."); }
    finally { setBusy(null); }
  };

  const resumeTickets = async () => {
    setBusy("resume"); setError(null); setNotice(null);
    try {
      const results = await resumeServiceNowIntake();
      const created = results.filter((item) => item.outcome === "package_created").length;
      setNotice(results.length
        ? `Re-analyzed ${results.length} waiting ticket(s); ${created} produced a change package. Nothing was applied in Azure.`
        : "No ticket is waiting on a newly approved capability.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to resume waiting tickets."); }
    finally { setBusy(null); }
  };

  const promote = async () => {
    if (!gap?.ciHeadSha) return;
    setBusy("approve"); setError(null); setNotice(null);
    try {
      // Echo back exactly what this screen displayed. The server refuses if the
      // evidence moved on, so a stale tab can never promote a newer commit.
      const result = await approveCapability({ gapId, expectedHeadSha: gap.ciHeadSha, expectedCiVersion: gap.ciVersion, comment });
      setNotice(result.message); setComment(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Promotion was refused."); await load(); }
    finally { setBusy(null); }
  };

  if (loading) return <div className="min-w-0 p-4"><Panel title="Capability promotion"><p className="py-8 text-center text-[12px] text-slate-500">Loading engineering gap…</p></Panel></div>;
  if (!gap) return <div className="min-w-0 p-4"><Panel title="Capability promotion"><div className="py-8 text-center"><p className="text-[12px] text-slate-600">This engineering gap is not visible to your account.</p><button type="button" onClick={() => navigate("/platform/capabilities")} className="mt-2 text-[12px] font-medium text-[#1B4F91] underline">Back to the queue</button></div></Panel></div>;

  const readiness = promotionReadiness(gap, user?.id ?? null);
  const evidence = gap.ciEvidence as Record<string, unknown>;
  const review = (evidence.review ?? {}) as Record<string, unknown>;
  const context = gap.context;
  const canPromote = readiness.tone === "ready" && comment.trim().length >= 10 && busy === null;

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/platform/capabilities" className="hover:text-[#1B4F91]">Capability Promotion</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">{title(gap.actionType)}</span></nav>
      <button type="button" onClick={() => void sync()} disabled={busy !== null} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", busy === "sync" && "animate-spin")} />{busy === "sync" ? "Observing GitHub…" : "Synchronize CI"}</button>
      <button type="button" onClick={() => void resumeTickets()} disabled={busy !== null} title="Re-analyze tickets that were waiting on this capability" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", busy === "resume" && "animate-spin")} />Resume linked tickets</button>
    </div>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {notice && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{notice}</div>}

    <AgentProgress gap={gap} events={events} />

    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="Engineering gap" right={<GapBadge status={gap.status} />}>
        <Row label="Requested action" value={title(gap.actionType)} />
        <Row label="Resource type" value={gap.resourceType} />
        <Row label="Opened" value={dateTime(gap.createdAt)} />
        <Row label="Ticket" value={String(context.ticketNumber ?? "Not reported")} />
        <Row label="Requested VM count" value={String(context.vmCount ?? context.targetCount ?? "Not reported")} />
        <Row label="Requester" value={gap.requestedBy ? <span className="font-mono text-[10.5px]">{gap.requestedBy.slice(0, 8)}…</span> : "Not identified"} />
      </Panel>

      <Panel title="Draft capability" right={gap.capability ? <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-700">{title(gap.capability.lifecycleStatus)}</span> : undefined}>
        {gap.capability ? <>
          <Row label="Name" value={gap.capability.displayName} />
          <Row label="Module source" value={<span className="font-mono text-[10.5px]">{gap.capability.moduleSource}</span>} />
          <Row label="Execution mode" value={<span className="font-mono text-[10.5px]">{gap.capability.executionMode}</span>} />
          <Row label="Allowed environments" value={gap.capability.allowedEnvironments.join(", ") || "None"} />
          <Row label="Max targets per run" value={String(gap.capability.maxTargetsPerRun)} />
          <Row label="Pinned approved commit" value={<span className="font-mono text-[10.5px]">{shortSha(gap.capability.approvedSourceRevision)}</span>} />
        </> : <p className="py-6 text-center text-[12px] text-slate-600">No draft capability is linked to this gap yet.</p>}
      </Panel>

      <Panel title="Server-observed CI evidence" right={<CiBadge status={gap.ciStatus} />}>
        <Row label="Pull request" value={gap.draftPrUrl ? <a href={gap.draftPrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1B4F91] hover:underline">#{gap.draftPrNumber}<ExternalLink className="h-3 w-3" /></a> : "None"} />
        <Row label="Branch" value={<span className="font-mono text-[10.5px]">{gap.draftBranch ?? "Not reported"}</span>} />
        <Row label="Head commit" value={<span className="font-mono text-[10.5px]">{shortSha(gap.ciHeadSha)}</span>} />
        <Row label="Observed at" value={dateTime(gap.ciObservedAt)} />
        <Row label="Evidence version" value={String(gap.ciVersion)} />
        <Row label="Merged" value={evidence.merged === true ? `Yes · ${String(evidence.mergeSha ?? "").slice(0, 12)}` : "No"} />
        <Row label="GitHub review" value={review.state === "APPROVED" ? `Approved · ${String(review.commitId ?? "").slice(0, 12)}` : "Not approved"} />
        <Row label="Server promotion flag" value={evidence.promotionReady === true ? "Promotion-ready" : "Withheld"} />
      </Panel>

      <Panel title="Promotion decision">
        <div className={cn("mb-3 flex items-start gap-2 rounded-md border px-2.5 py-2 text-[11.5px]", readiness.tone === "ready" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : readiness.tone === "done" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-800")}>
          {readiness.tone === "ready" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          <div><div className="font-semibold">{readiness.label}</div><div className="mt-0.5">{readiness.detail}</div></div>
        </div>
        <label className="block text-[11.5px] font-medium text-slate-700" htmlFor="promotion-comment">Review comment <span className="font-normal text-slate-500">(at least 10 characters, stored in the audit trail)</span></label>
        <textarea id="promotion-comment" value={comment} onChange={(event) => setComment(event.target.value)} rows={3} disabled={readiness.tone !== "ready"} placeholder="What you verified in the drafted module and its CI run." className="mt-1 w-full rounded-md border border-[#E2E8F0] px-2.5 py-2 text-[12px] text-slate-800 disabled:bg-slate-50" />
        <button type="button" onClick={() => void promote()} disabled={!canPromote} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#16406f] disabled:cursor-not-allowed disabled:bg-slate-300">
          <ShieldCheck className="h-3.5 w-3.5" />{busy === "approve" ? "Promoting…" : "Promote the reviewed commit"}
        </button>
        <p className="mt-2 text-[11px] text-slate-500">Promotion pins this exact commit as the capability's approved source. Any ticket waiting on this capability is queued for re-analysis; promotion itself never starts a Terraform plan or apply. Rejecting a draft is done by closing its pull request in GitHub; there is no server-side reject action yet.</p>
      </Panel>
    </div>

    <Panel title="Gap history" className="mt-3" right={<span className="text-[11px] text-slate-500">{events.length} event(s)</span>}>
      {events.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-[12px]"><thead className="border-b border-[#E2E8F0] text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2 font-medium">Event</th><th className="pb-2 font-medium">Recorded</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-[#EEF2F6]"><td className="py-2 font-medium text-slate-800">{title(event.eventType)}</td><td className="py-2 text-[10.5px] text-slate-500">{dateTime(event.createdAt)}</td></tr>)}</tbody></table></div> : <p className="py-6 text-center text-[12px] text-slate-600">No events have been recorded for this gap.</p>}
    </Panel>
  </div>;
}
