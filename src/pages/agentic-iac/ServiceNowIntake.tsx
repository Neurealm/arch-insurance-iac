import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileInput, MessageSquarePlus, PenLine, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { listServiceNowIntakeRequests, resumeServiceNowIntake, submitDemoServiceNowTicket, type ServiceNowIntakeRequest } from "./servicenowIntakeRequests";
import { changeHandoffPath } from "./change/ticketPrefill";

function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-slate-200 bg-white", className)}><header className="flex min-h-11 items-center justify-between border-b border-slate-200 px-4"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-800">{title}</h2>{action}</header><div className="p-4">{children}</div></section>;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0"><span className="text-slate-500">{label}</span><span className="max-w-[68%] text-right font-medium text-slate-800">{value || "Not reported"}</span></div>;
}

function valueList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// Colour the outcome, not the transport. The previous version returned emerald
// for every status it did not name, so a request parked on an engineering gap
// -- and one that had not been analysed at all -- both rendered as success.
function statusClass(status: string) {
  if (status === "received" || status === "analyzing") return "border-slate-200 bg-slate-50 text-slate-600";
  if (status === "needs_clarification") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "engineering_gap_opened") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (status === "comment_failed" || status === "failed") return "border-red-200 bg-red-50 text-red-700";
  if (status === "demo_comment_generated") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default function ServiceNowIntake() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceNowIntakeRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("requestId"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submittingNotes, setSubmittingNotes] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRequests(await listServiceNowIntakeRequests()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load ServiceNow intake requests."); }
    finally { setLoading(false); }
  }, []);

  const resume = useCallback(async (intakeRequestId?: string) => {
    setResuming(true); setError(null); setNotice(null);
    try {
      const results = await resumeServiceNowIntake(intakeRequestId);
      const created = results.filter((item) => item.outcome === "package_created").length;
      setNotice(results.length
        ? `Re-analyzed ${results.length} ticket(s); ${created} produced a change package. Nothing was applied in Azure.`
        : "No ticket was waiting on a newly approved capability.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to resume."); }
    finally { setResuming(false); }
  }, [load]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const requestId = searchParams.get("requestId"); if (requestId) setSelectedId(requestId); }, [searchParams]);

  // Revising a ticket produces a new analysis row rather than overwriting the
  // old one, which keeps every answer the requester gave. Number them so the
  // queue reads as one ticket over time instead of duplicates.
  const revisions = useMemo(() => {
    const byTicket = new Map<string, string[]>();
    [...requests].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
      .forEach((request) => {
        const list = byTicket.get(request.ticketNumber) ?? [];
        list.push(request.id);
        byTicket.set(request.ticketNumber, list);
      });
    const index = new Map<string, { position: number; total: number }>();
    byTicket.forEach((ids) => ids.forEach((id, position) => index.set(id, { position: position + 1, total: ids.length })));
    return index;
  }, [requests]);

  const selected = useMemo(() => requests.find((request) => request.id === selectedId) ?? null, [requests, selectedId]);
  const analysis = selected?.llmAnalysis ?? {};
  const validation = (analysis.validation && typeof analysis.validation === "object" ? analysis.validation : {}) as Record<string, unknown>;
  const extractedFields = analysis.extractedFields && typeof analysis.extractedFields === "object" ? analysis.extractedFields as Record<string, unknown> : {};
  // validate() returns this list as `missing`, not `missingFields`. Reading the
  // wrong key made this always undefined, so the console silently fell back to
  // the raw model list and dropped every server-computed requirement -- showing
  // the requester a shorter list than the one written onto their ticket.
  const missing = valueList(validation.missing ?? analysis.missingFields);
  const conflicts = valueList(validation.conflicts ?? analysis.conflicts);
  const analyzed = typeof analysis.action === "string" && analysis.action.length > 0;
  const onGap = selected?.status === "engineering_gap_opened" || Boolean(validation.readyForGap);
  const target = validation.target && typeof validation.target === "object" ? validation.target as Record<string, unknown> : {};
  const azure = selected?.azureObservation ?? {};
  const azureVms = Array.isArray(azure.vms) ? azure.vms : [];
  const questions = valueList(validation.questions);
  const canAddNotes = Boolean(selected) && selected?.requestedByUserId === user?.id;
  // Sends the reviewer to the form that matches the action, carrying the ticket
  // so the fields arrive prefilled instead of being retyped.
  const handoff = changeHandoffPath(
    selected?.id ?? "",
    typeof analysis.action === "string" ? analysis.action : null,
    typeof analysis.targetVmName === "string" ? analysis.targetVmName : null,
  );

  // Answering in place: the note is appended to the original ticket text and
  // resubmitted under the same ticket number, so it lands as a new revision the
  // agent re-analyses instead of a separate request.
  const submitNotes = async () => {
    if (!selected || notes.trim().length < 5) { setError("Add at least a short note before submitting."); return; }
    setSubmittingNotes(true); setError(null); setNotice(null);
    try {
      const payload = selected.ticketPayload ?? {};
      const previous = typeof payload.description === "string" ? payload.description : "";
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      // The questions this ticket has already been asked, and every answer given
      // so far, travel with the resubmission. Without them the next analysis has
      // no memory of the exchange and asks for the same things again.
      const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
      const validation = (selected.llmAnalysis?.validation ?? {}) as Record<string, unknown>;
      const askedNow = strings(validation.questions);
      const result = await submitDemoServiceNowTicket({
        ...payload,
        number: selected.ticketNumber,
        sys_id: `demo-${crypto.randomUUID()}`,
        description: `${previous}\n\nAdditional notes (${stamp} UTC): ${notes.trim()}`.trim(),
        prior_questions: [...new Set([...strings(payload.prior_questions), ...askedNow])],
        clarification_answers: [...strings(payload.clarification_answers), `${stamp} UTC: ${notes.trim()}`],
      });

      setNotes("");
      setNotice("Your notes were added to the ticket and the agent re-analyzed it.");
      await load();
      setSelectedId(result.requestId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit your notes."); }
    finally { setSubmittingNotes(false); }
  };


  return <main className="mx-auto max-w-[1500px] space-y-4 px-3 py-5 md:px-5">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-slate-500">Infrastructure as Code <span className="mx-1">/</span> ServiceNow Intake</p><div className="mt-1 flex items-center gap-3"><h1 className="text-2xl font-semibold text-slate-900">ServiceNow Intake &amp; Agent Analysis</h1><span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">LLM triage queue</span></div><p className="mt-2 max-w-3xl text-sm text-slate-600">Review submitted change requests after the platform agent has analyzed them. Open a ticket to see intent, confidence, live Azure evidence, missing information, and the next governed step.</p></div><div className="flex flex-wrap gap-2"><Link to="/demo-change-request" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white"><FileInput className="h-4 w-4" />Create demo request</Link><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh queue</button><button onClick={() => void resume()} disabled={resuming} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50" title="Re-analyze every ticket whose capability has since been approved"><RefreshCw className={cn("h-4 w-4", resuming && "animate-spin")} />Resume waiting tickets</button></div></header>
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><Sparkles className="mr-2 inline h-4 w-4" /><b>How to use this screen:</b> create a ticket in the separate Demo Change Request tab, then return here to review the real Gemini analysis. A real ServiceNow webhook will populate this same queue when connected.</div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,.9fr)]"><Panel title="Submitted change requests" action={<span className="text-xs text-slate-500">{requests.length} visible</span>}>{loading ? <p className="py-10 text-center text-sm text-slate-500">Loading intake queue…</p> : requests.length === 0 ? <div className="py-10 text-center"><p className="text-sm text-slate-600">No change request tickets have been submitted yet.</p><Link to="/demo-change-request" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline">Create the first demo request <ArrowRight className="h-4 w-4" /></Link></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-slate-200 uppercase tracking-wide text-slate-500"><tr><th className="pb-2">Ticket</th><th className="pb-2">Requester / service</th><th className="pb-2">Detected action</th><th className="pb-2">Status</th><th className="pb-2">Confidence</th><th className="pb-2" /></tr></thead><tbody>{requests.map((request) => { const requestAnalysis = request.llmAnalysis; const normalized = request.normalizedRequest; return <tr key={request.id} className={cn("border-b border-slate-100 last:border-0", selectedId === request.id && "bg-blue-50/50")}><td className="py-3 font-mono font-semibold text-slate-800">{request.ticketNumber}<div className="mt-0.5 font-sans text-[10px] font-normal text-slate-500">{new Date(request.receivedAt).toLocaleString()}{(revisions.get(request.id)?.total ?? 1) > 1 && <span className="ml-1.5 rounded border border-slate-200 bg-slate-50 px-1 py-px text-slate-600">revision {revisions.get(request.id)?.position} of {revisions.get(request.id)?.total}</span>}</div></td><td className="py-3"><div className="font-medium text-slate-800">{String(normalized.requester ?? "Requester not reported")}</div><div className="mt-0.5 text-slate-500">{String(normalized.application ?? "Service not reported")}</div></td><td className="py-3 text-slate-700">{String(requestAnalysis.action ?? "Awaiting analysis").replace(/_/g, " ")}</td><td className="py-3"><span className={cn("rounded-full border px-2 py-0.5 font-semibold capitalize", statusClass(request.status))}>{statusLabel(request.status)}</span></td><td className="py-3">{typeof requestAnalysis.confidence === "number" ? `${requestAnalysis.confidence}%` : "—"}</td><td className="py-3 text-right"><button onClick={() => setSelectedId(request.id)} className="font-semibold text-blue-700 underline">Open</button></td></tr>; })}</tbody></table></div>}</Panel>
      <div className="space-y-4">{selected ? <><Panel title={`Ticket ${selected.ticketNumber}`} action={<span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize", statusClass(selected.status))}>{statusLabel(selected.status)}</span>}><Row label="Requester" value={String(selected.normalizedRequest.requester ?? "")} /><Row label="Application / service" value={String(selected.normalizedRequest.application ?? "")} /><Row label="Environment" value={String(selected.normalizedRequest.environment ?? "")} /><Row label="Detected action" value={String(analysis.action ?? "Not analyzed").replace(/_/g, " ")} /><Row label="Agent confidence" value={typeof analysis.confidence === "number" ? `${analysis.confidence}%` : "—"} /><Row label="Agent summary" value={String(analysis.summary ?? "Not reported")} /></Panel><Panel title="What the agent found"><Row label="Azure target" value={String(analysis.targetVmName ?? target.name ?? "Not matched")} /><Row label="Azure inventory" value={`${azure.state ?? "Not reported"} · ${azureVms.length} VM(s)`} />{Object.keys(extractedFields).length > 0 && <div className="mt-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Extracted request fields</p><div className="rounded-lg bg-slate-50 p-3">{Object.entries(extractedFields).map(([key, value]) => <Row key={key} label={key.replace(/([A-Z])/g, " $1")} value={String(value)} />)}</div></div>}<div className="mt-3 space-y-2">{!analyzed ? <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><Clock className="h-4 w-4 shrink-0" />This ticket has not been analyzed yet.</div> : missing.length ? <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /><span><b>Missing information:</b> {missing.join(", ")}</span></div> : <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" />All required intake information is present.</div>}{conflicts.map((conflict) => <div key={conflict} className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"><AlertTriangle className="h-4 w-4 shrink-0" />{conflict}</div>)}</div></Panel>{selected.clarificationNote && <Panel title="Generated customer-visible comment" action={selected.requestedByUserId === user?.id
        ? <Link to={`/demo-change-request?reviseFrom=${encodeURIComponent(selected.id)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"><PenLine className="h-3.5 w-3.5" />Answer and resubmit</Link>
        : <span className="text-[11px] text-slate-500">Only the requester can revise this ticket</span>}><pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">{selected.clarificationNote}</pre><p className="mt-2 text-[11px] text-slate-500">In demo mode this comment is stored and displayed here. With the real connector it will be written to ServiceNow’s <code>comments</code> field.</p></Panel>}<Panel title="Add notes to this ticket">{canAddNotes ? <div>{questions.length > 0 && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><b>The agent asked for:</b><ul className="mt-1 list-disc space-y-1 pl-5">{questions.map((question) => <li key={question}>{question}</li>)}</ul></div>}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Add the missing details, the maintenance window, or any extra context for this ticket." className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p className="text-[11px] text-slate-500">Your notes are appended to the original ticket text and re-analyzed by the agent. Nothing is changed in Azure.</p><button onClick={() => void submitNotes()} disabled={submittingNotes || notes.trim().length < 5} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><MessageSquarePlus className="h-3.5 w-3.5" />{submittingNotes ? "Submitting notes…" : "Submit notes"}</button></div></div> : <p className="text-sm text-slate-600">Only the person who submitted this ticket can add notes to it.</p>}</Panel><Panel title="Next governed step"><p className="text-sm text-slate-600">{!analyzed ? "The platform agent has not analyzed this ticket yet." : onGap ? "The platform has no approved capability for this request yet, so an engineering gap was opened. A module is drafted, tested and approved by a human before the request can resume — it is not waiting on the requester." : validation.ready ? "The request passed intake checks and can move into Change Engineering for human review." : "The request needs clarification before it can move into Change Engineering."}</p>{onGap && <button onClick={() => void resume(selected.id)} disabled={resuming} className="mt-3 mr-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className={cn("h-3.5 w-3.5", resuming && "animate-spin")} />Resume this ticket</button>}{onGap && <Link to="/platform/capabilities" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline">Track capability engineering <ArrowRight className="h-4 w-4" /></Link>}{selected.changePackageId && <Link to={handoff.path} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline">{handoff.label} <ArrowRight className="h-4 w-4" /></Link>}</Panel></> : <Panel title="Open a ticket"><div className="py-12 text-center"><Clock className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm text-slate-600">Select a submitted ticket to review the agent’s analysis.</p><Link to="/demo-change-request" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline">Create a demo change request <ArrowRight className="h-4 w-4" /></Link></div></Panel>}</div>
    </div>
  </main>;
}
