import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Inbox, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { listVmChangePackages, type ChangePackageStatus, type VmChangePackage } from "../changePackages";
import { listServiceNowIntakeRequests, type ServiceNowIntakeRequest } from "../servicenowIntakeRequests";

/** Human wording for every package state this queue can show. */
export const STATUS_LABEL: Record<ChangePackageStatus, string> = {
  draft: "Draft awaiting review",
  submitted: "Submitted for approval",
  approved: "Approved",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  executing: "Executing",
  executed: "Executed",
  execution_failed: "Execution failed",
};

const STATUS_TONE: Record<ChangePackageStatus, string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-800",
  submitted: "border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  changes_requested: "border-amber-200 bg-amber-50 text-amber-800",
  rejected: "border-red-200 bg-red-50 text-red-700",
  executing: "border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]",
  executed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  execution_failed: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: ChangePackageStatus }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium", STATUS_TONE[status] ?? "border-slate-200 bg-slate-50 text-slate-600")}>{STATUS_LABEL[status] ?? status}</span>;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Tickets that were accepted but never produced a drafted package. */
function blockedReason(request: ServiceNowIntakeRequest) {
  if (request.status === "engineering_gap_opened") return { reason: "No approved Terraform capability exists for this request yet.", to: "/platform/capabilities", label: "Open Capability Promotion" };
  if (request.status === "needs_clarification") return { reason: request.clarificationNote?.split("\n")[0] ?? "The request still needs clarification before a package can be drafted.", to: "/servicenow-intake", label: "Open ServiceNow Intake" };
  return null;
}

export default function TicketPackageQueue() {
  const [packages, setPackages] = useState<VmChangePackage[]>([]);
  const [requests, setRequests] = useState<ServiceNowIntakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [packageRows, requestRows] = await Promise.all([listVmChangePackages(), listServiceNowIntakeRequests()]);
      setPackages(packageRows); setRequests(requestRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load drafted change packages.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const ticketByPackageId = useMemo(() => {
    const index = new Map<string, ServiceNowIntakeRequest>();
    for (const request of requests) if (request.changePackageId) index.set(request.changePackageId, request);
    return index;
  }, [requests]);

  const needsReview = packages.filter((item) => item.status === "draft" || item.status === "changes_requested");
  const inFlight = packages.filter((item) => item.status !== "draft" && item.status !== "changes_requested");
  const blocked = requests.filter((request) => !request.changePackageId && blockedReason(request));

  const card = (item: VmChangePackage) => {
    const ticket = ticketByPackageId.get(item.id);
    const requester = ticket ? text(ticket.normalizedRequest.requester) : "";
    const targetCount = Number((item.parameters as Record<string, unknown>).vmCount ?? 0);
    return <Link key={item.id} to={`/changes/package/${encodeURIComponent(item.packageNumber)}`} className="flex items-start gap-3 rounded-md border border-[#E2E8F0] bg-white px-3 py-2.5 hover:border-[#CFE0F3] hover:bg-[#F8FAFC]">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#EFF4FB] text-[#1B4F91]"><FileText className="h-3.5 w-3.5" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-slate-900">{ticket ? ticket.ticketNumber : "No linked ticket"}</span>
          <span className="text-[11.5px] text-slate-500">{item.packageNumber}</span>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-1 text-[12px] text-slate-700">{item.actionLabel} · {item.targetName}{targetCount > 1 ? ` and ${targetCount - 1} more` : ""}</div>
        <div className="mt-0.5 text-[11.5px] text-slate-500">{item.resourceGroup} · {item.region}{requester ? ` · requested by ${requester}` : ""}</div>
        {item.rationale && <p className="mt-1 line-clamp-2 text-[11.5px] text-slate-600">{item.rationale}</p>}
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
    </Link>;
  };

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/servicenow-intake" className="hover:text-[#1B4F91]">ServiceNow Intake</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Change Engineering</span></nav>
      <button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh</button>
    </div>

    <header className="mb-4 flex flex-wrap items-start gap-3">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900">Change packages from tickets</h1>
        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-slate-600">Each accepted ServiceNow request is drafted into a change package automatically. Review the drafted package and submit it for approval; nothing is applied to Azure from this screen.</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] font-medium text-[#1B4F91]"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />Human approval required for every change</div>
    </header>

    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}

    <section className="mb-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Needs your review</h2>
      {loading && !packages.length && <div className="rounded-md border border-[#E2E8F0] bg-white px-3 py-4 text-[12px] text-slate-600">Loading drafted packages…</div>}
      {!loading && !needsReview.length && <div className="flex items-start gap-2 rounded-md border border-dashed border-[#CBD5E1] bg-white px-3 py-4 text-[12px] text-slate-600"><Inbox className="mt-0.5 h-4 w-4 text-slate-400" />No drafted packages are waiting. A package appears here as soon as an accepted ServiceNow request is analysed.</div>}
      <div className="space-y-2">{needsReview.map(card)}</div>
    </section>

    {blocked.length > 0 && <section className="mb-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Accepted tickets with no package yet</h2>
      <div className="space-y-2">{blocked.map((request) => {
        const info = blockedReason(request)!;
        return <div key={request.id} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="text-[12.5px] font-semibold text-amber-900">{request.ticketNumber}</div>
          <p className="mt-0.5 text-[11.5px] text-amber-900">{info.reason}</p>
          <Link to={info.to} className="mt-1 inline-block text-[11.5px] font-medium text-[#1B4F91] underline">{info.label}</Link>
        </div>;
      })}</div>
    </section>}

    {inFlight.length > 0 && <section className="mb-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Submitted and beyond</h2>
      <div className="space-y-2">{inFlight.map(card)}</div>
    </section>}

    <Link to="/changes/without-ticket" className="inline-flex items-center gap-2 rounded-md border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
      <Wrench className="h-3.5 w-3.5 text-slate-500" />Start a package without a ticket
    </Link>
  </div>;
}
