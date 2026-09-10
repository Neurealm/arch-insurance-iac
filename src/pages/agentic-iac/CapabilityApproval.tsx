import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, GitPullRequest, Play, Radio, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { resumeServiceNowIntake } from "./servicenowIntakeRequests";
import {
  approveCapability, getCapabilityGap, listCapabilityGaps, listGapEvents, repairCapabilityCi, startCapabilityDraft, syncCapabilityCi,
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
  const repairStarted = gap.remediationAttempts > 0;
  const repairFailed = gap.remediationStatus === "exhausted";
  const repairActive = ["running", "waiting_ci", "failed"].includes(gap.remediationStatus) && !repairFailed;

  const step = (label: string, detail: string, state: StepState) => ({ label, detail, state });
  return [
    step("Request accepted", "A capability gap was opened from the intake request.", "done"),
    step("Module drafted", draftFailed ? "The generated module was rejected by the policy check." : drafted ? "Terraform files were generated and passed the policy check." : "Waiting for the drafting agent.",
      draftFailed ? "failed" : drafted ? "done" : gap.status === "drafting" ? "active" : "pending"),
    step("Pull request opened", prFailed ? "The pull request could not be opened." : prOpened ? `Draft pull request #${gap.draftPrNumber} is open for review.` : "No pull request yet.",
      prFailed ? "failed" : prOpened ? "done" : drafted ? "active" : "pending"),
    step("Automated checks", gap.ciStatus === "passed" ? "Formatting, validation and policy checks passed on the reviewed commit." : gap.ciStatus === "failed" ? "The automated checks failed on the reviewed commit." : gap.ciStatus === "running" ? "Checks are running." : "Not observed yet.",
      gap.ciStatus === "passed" ? "done" : gap.ciStatus === "failed" ? "failed" : gap.ciStatus === "running" ? "active" : prOpened ? "active" : "pending"),
    step("Automated repair", gap.remediationStatus === "succeeded" ? `CI passed after ${gap.remediationAttempts} repair attempt(s).` : repairFailed ? "The three-attempt repair limit was reached; a human must inspect the PR." : gap.remediationStatus === "running" ? `Attempt ${gap.remediationAttempts} is reading the failure and validating a correction.` : gap.remediationStatus === "waiting_ci" ? `Attempt ${gap.remediationAttempts} pushed a correction; waiting for CI.` : repairStarted ? `Attempt ${gap.remediationAttempts} did not produce a passing correction; another bounded attempt may run.` : "Starts only if synchronized CI reports a failure.",
      gap.remediationStatus === "succeeded" ? "done" : repairFailed ? "failed" : repairActive ? "active" : gap.ciStatus === "passed" ? "done" : "pending"),
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

function eventDetail(event: GapEvent) {
  const detail = event.detail;
  if (event.eventType === "ci_observed") {
    const evidence = detail.evidence && typeof detail.evidence === "object" && !Array.isArray(detail.evidence)
      ? detail.evidence as Record<string, unknown> : {};
    const status = typeof evidence.status === "string" ? title(evidence.status) : "Unknown";
    const reason = typeof evidence.reason === "string" ? evidence.reason.trim() : "";
    return reason ? `CI ${status}: ${reason}` : `CI ${status}.`;
  }
  if (typeof detail.message === "string" && detail.message) return detail.message;
  if (typeof detail.prUrl === "string" && detail.prUrl) return detail.prUrl;
  if (Array.isArray(detail.problems) && detail.problems.length) return detail.problems.map(String).join(" ");
  const parts = [
    typeof detail.moduleName === "string" ? `Module: ${detail.moduleName}` : "",
    typeof detail.branch === "string" ? `Branch: ${detail.branch}` : "",
    detail.prNumber ? `PR #${String(detail.prNumber)}` : "",
    detail.attempt ? `Attempt ${String(detail.attempt)} of 3` : "",
    typeof detail.newHeadSha === "string" ? `Commit ${detail.newHeadSha.slice(0, 12)}` : "",
  ].filter(Boolean);
  return parts.join(" · ") || "Recorded by the platform.";
}

function eventLabel(eventType: string) {
  return ({
    drafting_queued: "Draft request queued",
    draft_generation_started: "Generating Terraform",
    draft_generation_completed: "Terraform draft generated",
    draft_policy_validation_started: "Checking draft policy",
    draft_policy_validation_passed: "Draft policy passed",
    draft_validation_failed: "Draft policy rejected",
    draft_capability_registered: "Draft capability registered",
    draft_capability_insert_failed: "Capability registration failed",
    pull_request_opening: "Opening pull request",
    pr_opened: "Pull request opened",
    pr_open_failed: "Pull request failed",
    drafting_failed: "Drafting failed",
    ci_observed: "CI status observed",
    ci_remediation_started: "Repair attempt started",
    ci_remediation_committed: "Repair commit pushed",
    ci_remediation_validation_failed: "Repair rejected by policy",
    ci_remediation_failed: "Repair attempt failed",
    ci_remediation_exhausted: "Repair limit reached",
    capability_approved: "Capability promoted",
  } as Record<string, string>)[eventType] ?? title(eventType);
}

function AgentProgress({ gap, events }: { gap: CapabilityGap; events: GapEvent[] }) {
  const steps = agentSteps(gap, events);
  const active = gap.status === "drafting" || gap.remediationStatus === "running" || gap.remediationStatus === "waiting_ci";
  return <Panel title="Live drafting activity" className="mb-3" right={<span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600")}><Radio className={cn("h-3 w-3", active && "animate-pulse")} />{active ? "Live" : "Server recorded"}</span>}>
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
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500"><Clock3 className="h-3.5 w-3.5" />Activity log</div>
      {events.length ? <ol className="space-y-2">{events.slice(0, 8).map((event) => <li key={event.id} className="rounded border border-slate-100 bg-slate-50 px-2.5 py-2"><div className="flex items-start justify-between gap-3"><span className="font-medium text-slate-800">{eventLabel(event.eventType)}</span><time className="shrink-0 text-[10.5px] text-slate-500">{dateTime(event.createdAt)}</time></div><p className="mt-0.5 break-words text-[11px] text-slate-600">{eventDetail(event)}</p></li>)}</ol> : <p className="text-[11.5px] text-slate-600">No server activity has been recorded. Start the drafting agent to create a live run.</p>}
    </div>
    <p className="mt-3 text-[11px] text-slate-500">Activity refreshes every 4 seconds. While CI watch is active, GitHub is synchronized every 10 seconds. The agents may only update the draft PR; they never merge, promote, plan, apply, or change Azure.</p>
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
      <nav className="text-[12px] text-slate-500"><Link to="/servicenow-intake" className="hover:text-[#1B4F91]">ServiceNow Intake</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Capability Promotion</span></nav>
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
  const [busy, setBusy] = useState<"draft" | "sync" | "repair" | "approve" | "resume" | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draftConfirmationOpen, setDraftConfirmationOpen] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<number | null>(null);
  const [watchingCi, setWatchingCi] = useState(false);
  const [nextCiCheckAt, setNextCiCheckAt] = useState<number | null>(null);
  const watchGeneration = useRef(0);

  const load = useCallback(async (background = false) => {
    if (!background) { setLoading(true); setError(null); }
    try { const [record, history] = await Promise.all([getCapabilityGap(gapId), listGapEvents(gapId)]); setGap(record); setEvents(history); }
    catch (cause) { if (!background) setError(cause instanceof Error ? cause.message : "Unable to load this engineering gap."); }
    finally { if (!background) setLoading(false); setLastLiveUpdate(Date.now()); }
  }, [gapId]);
  useEffect(() => {
    void load();
    const poll = window.setInterval(() => { void load(true); }, 4_000);
    return () => window.clearInterval(poll);
  }, [load]);

  const runCiCycle = useCallback(async () => {
    setBusy("sync"); setError(null); setNotice(null);
    try {
      const [observation] = await syncCapabilityCi(gapId);
      if (!observation) throw new Error("The server did not return CI evidence for this gap.");
      await load(true);
      if (observation.evidence.status === "passed") {
        setNotice("CI passed for the current draft head. Automatic repair stopped; no capability was promoted.");
        return false;
      }
      if (observation.evidence.status !== "failed") {
        const reason = typeof observation.evidence.reason === "string" ? observation.evidence.reason.trim() : "";
        setNotice(reason
          ? `CI is not yet actionable: ${reason} The watcher will check GitHub again in 10 seconds.`
          : "CI has not reached a pass/fail result. The watcher will check GitHub again in 10 seconds.");
        return true;
      }
      const failedHead = observation.evidence.headSha;
      if (!failedHead) throw new Error("Failed CI did not identify an exact commit to repair.");
      setBusy("repair");
      const repaired = await repairCapabilityCi({ gapId, expectedHeadSha: failedHead, expectedCiVersion: observation.ciVersion });
      await load(true);
      if (repaired.outcome === "committed") {
        setNotice(`Repair attempt ${repaired.attempt} pushed commit ${repaired.newHeadSha?.slice(0, 12)}. Waiting 10 seconds for CI.`);
        return true;
      }
      if (repaired.remediationStatus === "exhausted" || repaired.outcome === "exhausted") {
        setNotice("The repair agent reached its three-attempt limit. Automatic watching stopped for human review.");
        return false;
      }
      setNotice(`Repair attempt ${repaired.attempt} was not accepted: ${repaired.summary} The watcher will try again, within the three-attempt limit.`);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to synchronize or repair CI.");
      return false;
    } finally { setBusy(null); }
  }, [gapId, load]);

  const startCiWatch = async () => {
    const generation = ++watchGeneration.current;
    setWatchingCi(false); setNextCiCheckAt(null);
    const keepWatching = await runCiCycle();
    if (generation === watchGeneration.current && keepWatching) setWatchingCi(true);
  };
  const stopCiWatch = () => {
    watchGeneration.current += 1;
    setWatchingCi(false); setNextCiCheckAt(null);
    setNotice("Automatic CI watching stopped. No merge, promotion, plan, or apply was performed.");
  };
  useEffect(() => {
    if (!watchingCi) return;
    const generation = watchGeneration.current;
    let timer = 0;
    let cancelled = false;
    const schedule = () => {
      const next = Date.now() + 10_000;
      setNextCiCheckAt(next);
      timer = window.setTimeout(async () => {
        if (cancelled || generation !== watchGeneration.current) return;
        const keepWatching = await runCiCycle();
        if (!cancelled && generation === watchGeneration.current && keepWatching) schedule();
        else if (!cancelled) { setWatchingCi(false); setNextCiCheckAt(null); }
      }, 10_000);
    };
    schedule();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [watchingCi, runCiCycle]);

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

  const startDraft = async () => {
    setDraftConfirmationOpen(false); setBusy("draft"); setError(null); setNotice(null);
    try {
      const result = await startCapabilityDraft(gapId);
      setNotice(result.prUrl ? `Draft pull request created: ${result.prUrl}` : result.message);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The drafting agent could not start."); await load(); }
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
  const canStartDraft = !gap.capability && ["open", "drafting"].includes(gap.status) && busy === null;

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/platform/capabilities" className="hover:text-[#1B4F91]">Capability Promotion</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">{title(gap.actionType)}</span></nav>
      <button type="button" onClick={() => void startCiWatch()} disabled={busy !== null || watchingCi} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", (busy === "sync" || busy === "repair" || watchingCi) && "animate-spin")} />{busy === "repair" ? "Repairing CI…" : busy === "sync" ? "Observing GitHub…" : watchingCi ? "Watching CI…" : "Synchronize CI"}</button>
      {watchingCi && <button type="button" onClick={stopCiWatch} className="inline-flex h-8 items-center rounded-md border border-red-200 bg-white px-2.5 text-[12px] font-medium text-red-700 hover:bg-red-50">Stop CI watch</button>}
      <button type="button" onClick={() => void resumeTickets()} disabled={busy !== null} title="Re-analyze tickets that were waiting on this capability" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", busy === "resume" && "animate-spin")} />Resume linked tickets</button>
    </div>
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {notice && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{notice}</div>}

    <div className="mb-1 text-right text-[10.5px] text-slate-500">Live view {lastLiveUpdate ? `updated ${new Date(lastLiveUpdate).toLocaleTimeString()}` : "connecting…"}{watchingCi && nextCiCheckAt ? ` · next CI check ${new Date(nextCiCheckAt).toLocaleTimeString()}` : ""}</div>
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
        </> : <div className="py-4 text-center"><p className="text-[12px] text-slate-600">No draft capability is linked to this gap yet.</p><button type="button" onClick={() => setDraftConfirmationOpen(true)} disabled={!canStartDraft} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#16406f] disabled:cursor-not-allowed disabled:bg-slate-300"><Play className="h-3.5 w-3.5" />Start drafting agent</button><p className="mt-2 text-[10.5px] text-slate-500">Creates a governed Terraform draft pull request only. It cannot plan, apply, or change Azure.</p></div>}
      </Panel>

      <Panel title="Server-observed CI evidence" right={<CiBadge status={gap.ciStatus} />}>
        <Row label="Pull request" value={gap.draftPrUrl ? <a href={gap.draftPrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#1B4F91] hover:underline">#{gap.draftPrNumber}<ExternalLink className="h-3 w-3" /></a> : "None"} />
        <Row label="Branch" value={<span className="font-mono text-[10.5px]">{gap.draftBranch ?? "Not reported"}</span>} />
        <Row label="Head commit" value={<span className="font-mono text-[10.5px]">{shortSha(gap.ciHeadSha)}</span>} />
        <Row label="Observed at" value={dateTime(gap.ciObservedAt)} />
        <Row label="Evidence version" value={String(gap.ciVersion)} />
        <Row label="CI observation" value={typeof evidence.reason === "string" && evidence.reason.trim() ? evidence.reason : "No server reason was recorded."} />
        <Row label="Merged" value={evidence.merged === true ? `Yes · ${String(evidence.mergeSha ?? "").slice(0, 12)}` : "No"} />
        <Row label="GitHub review" value={review.state === "APPROVED" ? `Approved · ${String(review.commitId ?? "").slice(0, 12)}` : "Not approved"} />
        <Row label="Server promotion flag" value={evidence.promotionReady === true ? "Promotion-ready" : "Withheld"} />
        <Row label="Repair agent" value={title(gap.remediationStatus)} />
        <Row label="Repair attempts" value={`${gap.remediationAttempts} / 3`} />
        <Row label="Repair head" value={<span className="font-mono text-[10.5px]">{shortSha(gap.remediationHeadSha)}</span>} />
        <Row label="Repair updated" value={dateTime(gap.remediationUpdatedAt)} />
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

    {draftConfirmationOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="draft-confirmation-title"><div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl"><h2 id="draft-confirmation-title" className="text-base font-semibold text-slate-900">Start the drafting agent?</h2><p className="mt-2 text-[12px] leading-relaxed text-slate-600">The agent will generate the restricted OS-disk Terraform module and may open a GitHub pull request. It will not create an HCP Terraform plan, apply infrastructure, or change Azure.</p><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setDraftConfirmationOpen(false)} className="h-8 rounded-md border border-slate-200 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" onClick={() => void startDraft()} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#16406f]"><Play className="h-3.5 w-3.5" />Create draft PR</button></div></div></div>}

    <Panel title="Gap history" className="mt-3" right={<span className="text-[11px] text-slate-500">{events.length} event(s)</span>}>
      {events.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-[12px]"><thead className="border-b border-[#E2E8F0] text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="pb-2 font-medium">Event</th><th className="pb-2 font-medium">Recorded</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-[#EEF2F6]"><td className="py-2 font-medium text-slate-800">{title(event.eventType)}</td><td className="py-2 text-[10.5px] text-slate-500">{dateTime(event.createdAt)}</td></tr>)}</tbody></table></div> : <p className="py-6 text-center text-[12px] text-slate-600">No events have been recorded for this gap.</p>}
    </Panel>
  </div>;
}
