import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Clipboard, FileInput, RefreshCw, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, listAzureVirtualMachines, type AzureVirtualMachine } from "./azureControlPlane";
import { saveVmChangePackage } from "./changePackages";
import { analyzeServiceNowRequest, buildClarificationNote, intakeActionLabels, requiredFieldsForAction, type ActionSelection } from "./servicenowTriage";
import { listServiceNowIntakeRequests, submitDemoServiceNowTicket, type ServiceNowIntakeRequest } from "./servicenowIntakeRequests";

function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-slate-200 bg-white", className)}><header className="flex min-h-11 items-center justify-between border-b border-slate-200 px-4"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-800">{title}</h2>{action}</header><div className="p-4">{children}</div></section>;
}

function Check({ label, detail, state }: { label: string; detail: string; state: "pass" | "missing" | "attention" }) {
  const color = state === "pass" ? "text-emerald-700" : state === "missing" ? "text-red-700" : "text-amber-700";
  return <div className="flex items-start gap-2 border-b border-slate-100 py-2 last:border-0"><span className="mt-0.5">{state === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className={cn("h-4 w-4", state === "missing" ? "text-red-600" : "text-amber-600")} />}</span><div><p className={cn("text-sm font-medium", color)}>{label}</p><p className="text-xs text-slate-500">{detail}</p></div></div>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="text-sm font-medium text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-sm" /></label>;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0"><span className="text-slate-500">{label}</span><span className="max-w-[65%] text-right font-medium text-slate-800">{value || "Not reported"}</span></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>{value || "Not reported"}</p></div>;
}

function newPackageNumber() {
  return `VM-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export default function ServiceNowIntake() {
  const navigate = useNavigate();
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [requests, setRequests] = useState<ServiceNowIntakeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceNowIntakeRequest | null>(null);
  const [vmId, setVmId] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [requester, setRequester] = useState("");
  const [application, setApplication] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [actionSelection, setActionSelection] = useState<ActionSelection>("auto");
  const [description, setDescription] = useState("");
  const [maintenanceWindow, setMaintenanceWindow] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [applicationOwner, setApplicationOwner] = useState("");
  const [rollbackPlan, setRollbackPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzed, setAnalyzed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [queueLoading, setQueueLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setVms(await listAzureVirtualMachines()); }
    catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the connected Azure VM inventory."); }
    finally { setLoading(false); }
  }, []);

  const loadRequests = useCallback(async () => {
    setQueueLoading(true);
    try { setRequests(await listServiceNowIntakeRequests()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load ServiceNow intake requests."); }
    finally { setQueueLoading(false); }
  }, []);

  useEffect(() => { void load(); void loadRequests(); }, [load, loadRequests]);

  const selectedVm = useMemo(() => vms.find((vm) => vm.id === vmId), [vmId, vms]);
  const triage = useMemo(() => analyzeServiceNowRequest({ ticketNumber, requester, application, environment, actionSelection, description, maintenanceWindow, businessImpact, applicationOwner, rollbackPlan, selectedVm, vms }), [actionSelection, application, applicationOwner, businessImpact, description, environment, maintenanceWindow, requester, rollbackPlan, selectedVm, ticketNumber, vms]);
  const clarificationNote = useMemo(() => buildClarificationNote(ticketNumber.trim(), triage), [ticketNumber, triage]);
  const actionRequirements = useMemo(() => requiredFieldsForAction(triage.action), [triage.action]);
  const ready = analyzed && triage.readyForEngineering;

  const analyze = () => { setAnalyzed(true); setMessage(null); setError(null); };

  const submitDemo = async () => {
    if (!description.trim()) return;
    setSubmittingDemo(true); setError(null); setMessage(null);
    const demoNumber = ticketNumber.trim() || `DEMO-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const targetPrefix = selectedVm ? `Target Azure VM: ${selectedVm.name} (${selectedVm.id}). ` : "";
    try {
      const result = await submitDemoServiceNowTicket({ number: demoNumber, sys_id: `demo-${crypto.randomUUID()}`, requester: requester.trim(), application: application.trim(), environment, description: `${targetPrefix}${description.trim()}`, maintenance_window: maintenanceWindow.trim(), business_impact: businessImpact.trim(), application_owner: applicationOwner.trim(), rollback_plan: rollbackPlan.trim() });
      setTicketNumber(demoNumber); setAnalyzed(true); setMessage(`${demoNumber} was submitted to the live Gemini intake agent in demo mode. ${result.readyForEngineering ? "It is ready for engineering." : "A clarification is required."}`);
      await loadRequests();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit the demo ServiceNow ticket."); }
    finally { setSubmittingDemo(false); }
  };

  const copyClarification = async () => {
    try { await navigator.clipboard.writeText(clarificationNote); setMessage("Clarification note copied. Paste it into the ServiceNow ticket after reviewing it."); }
    catch { setError("The browser did not allow clipboard access. Select and copy the clarification note manually."); }
  };

  const createDraft = async () => {
    if (!ready || !selectedVm) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      const saved = await saveVmChangePackage({
        packageNumber: newPackageNumber(), status: "draft", targetResourceId: selectedVm.id, targetName: selectedVm.name,
        subscriptionId: selectedVm.subscriptionId, resourceGroup: selectedVm.resourceGroup, region: selectedVm.location,
        actionType: triage.action, actionLabel: triage.actionLabel,
        parameters: { source: "servicenow_intake", serviceNowTicket: ticketNumber.trim(), requester: requester.trim(), environment, application: application.trim() || null, triageConfidence: triage.confidence, triageReasoning: triage.reasoning },
        rationale: `ServiceNow ${ticketNumber.trim()} requested by ${requester.trim()}: ${description.trim()} Business impact: ${businessImpact.trim()}. Maintenance window: ${maintenanceWindow.trim()}. Rollback plan: ${rollbackPlan.trim()}.`,
        currentState: { powerState: selectedVm.powerState, provisioningState: selectedVm.provisioningState, vmSize: selectedVm.vmSize, osType: selectedVm.osType, serviceNowTicket: ticketNumber.trim() },
        policyEvidence: [{ check: "ServiceNow intake completeness", result: "passed" }, { check: "Request classification", result: `${triage.actionLabel} · ${triage.confidence}% confidence` }, { check: "Azure target enrichment", result: `${selectedVm.name} found in live inventory` }],
        validationPlan: ["Reconcile target VM with Azure before approval", "Validate action-specific post-change state", "Review current Azure operations evidence"],
        riskScore: triage.action === "restart_vm" ? 35 : 25, riskLevel: "Low", approvalRequired: true,
      });
      setMessage(`${saved.packageNumber} was created as a draft. No Azure action was performed.`);
      window.setTimeout(() => navigate(`/changes/virtual-machines/${encodeURIComponent(selectedVm.name)}?resourceId=${encodeURIComponent(selectedVm.id)}`), 800);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create the governed VM draft."); }
    finally { setSaving(false); }
  };

  return <main className="mx-auto max-w-[1500px] space-y-4 px-3 py-5 md:px-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500">Infrastructure as Code <span className="mx-1">/</span> ServiceNow Intake</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">ServiceNow Intake &amp; Request Triage</h1><p className="mt-1 max-w-3xl text-sm text-slate-600">Receive a change request, classify its intent, enrich technical facts from Azure, and return a precise clarification request or a governed handoff to Change Engineering.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh Azure inventory</button></div>
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><FileInput className="mr-2 inline h-4 w-4" /><b>ServiceNow webhook receiver: implemented; credentials pending.</b> Configure the outbound webhook and server-side secrets to process tickets automatically. This page remains the authenticated review and replay surface.</div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}{message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_410px]"><div className="space-y-4">
      <Panel title="1. Demo ServiceNow ticket submission" action={<span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Demo transport</span>}><p className="mb-3 text-xs text-slate-500">Submit a ServiceNow-shaped ticket to the real Gemini intake function. ServiceNow transport and comment write-back are simulated; analysis, Azure enrichment, validation, and audit storage are real.</p><div className="grid gap-3 md:grid-cols-2"><Field label="ServiceNow ticket number" value={ticketNumber} onChange={setTicketNumber} placeholder="Leave blank to generate DEMO-CHG…" /><Field label="Requester" value={requester} onChange={setRequester} placeholder="Name or email" /><Field label="Application / service" value={application} onChange={setApplication} placeholder="Business service name" /><label className="text-sm font-medium text-slate-700">Environment<select value={environment} onChange={(event) => setEnvironment(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-sm"><option>Production</option><option>Pre-Production</option><option>Development</option></select></label></div><label className="mt-3 block text-sm font-medium text-slate-700">Requested action<select value={actionSelection} onChange={(event) => { setActionSelection(event.target.value as ActionSelection); setAnalyzed(false); }} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-sm"><option value="auto">Let Gemini classify from description</option>{Object.entries(intakeActionLabels).filter(([value]) => !["unknown", "create_vm"].includes(value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="mt-3 block text-sm font-medium text-slate-700">Request description<textarea value={description} onChange={(event) => { setDescription(event.target.value); setAnalyzed(false); }} rows={5} placeholder="Example: Please restart iac-pilot-vm01 during the Sunday 02:00–02:30 UTC window because the application owner needs to apply a kernel update. Expected interruption is five minutes." className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm" /></label><div className="flex flex-wrap gap-2"><button onClick={analyze} disabled={!description.trim()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" />Preview local checks</button><button onClick={() => void submitDemo()} disabled={!description.trim() || submittingDemo} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><FileInput className="h-4 w-4" />{submittingDemo ? "Submitting to Gemini…" : "Submit demo ticket to intake agent"}</button></div></Panel>
      <Panel title="2. Change context"><div className="grid gap-3 md:grid-cols-2"><Field label="Maintenance window" value={maintenanceWindow} onChange={(value) => { setMaintenanceWindow(value); setAnalyzed(false); }} placeholder="Date, time, and timezone" /><Field label="Application owner" value={applicationOwner} onChange={(value) => { setApplicationOwner(value); setAnalyzed(false); }} placeholder="Owner or team" /></div><label className="mt-3 block text-sm font-medium text-slate-700">Expected business impact<textarea value={businessImpact} onChange={(event) => { setBusinessImpact(event.target.value); setAnalyzed(false); }} rows={3} placeholder="Who is affected and what interruption is acceptable?" className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm" /></label><label className="mt-3 block text-sm font-medium text-slate-700">Rollback plan<textarea value={rollbackPlan} onChange={(event) => { setRollbackPlan(event.target.value); setAnalyzed(false); }} rows={3} placeholder="What should the operator verify or do if the change is unsuccessful?" className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm" /></label></Panel>
      <Panel title="3. Azure enrichment" action={<span className="text-xs text-slate-500">Live connected inventory</span>}>{loading ? <p className="py-4 text-sm text-slate-500">Loading Azure VMs…</p> : <select value={vmId} onChange={(event) => { setVmId(event.target.value); setAnalyzed(false); }} className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm"><option value="">Confirm a target VM</option>{vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.name} · {vm.resourceGroup} · {vm.location}</option>)}</select>}{selectedVm && <div className="mt-3 grid gap-2 sm:grid-cols-3"><Fact label="Power state" value={selectedVm.powerState} /><Fact label="VM size" value={selectedVm.vmSize} /><Fact label="Operating system" value={selectedVm.osType} /></div>}</Panel>
      <Panel title="4. Submitted intake tickets" action={<button onClick={() => void loadRequests()} disabled={queueLoading} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 disabled:opacity-50"><Clock className="h-3.5 w-3.5" />Refresh queue</button>}>{queueLoading ? <p className="py-4 text-sm text-slate-500">Loading intake queue…</p> : requests.length === 0 ? <p className="py-4 text-sm text-slate-500">No submitted tickets are visible for this account yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="border-b border-slate-200 uppercase tracking-wide text-slate-500"><tr><th className="pb-2">Ticket</th><th className="pb-2">Request</th><th className="pb-2">Status</th><th className="pb-2">Confidence</th><th className="pb-2">Updated</th><th className="pb-2" /></tr></thead><tbody>{requests.map((request) => { const analysis = request.llmAnalysis; const normalized = request.normalizedRequest; return <tr key={request.id} className="border-b border-slate-100 last:border-0"><td className="py-2 font-mono font-semibold text-slate-800">{request.ticketNumber}</td><td className="max-w-[270px] truncate py-2 text-slate-700" title={String(normalized.description ?? "")}>{String(normalized.description ?? "No description")}</td><td className="py-2"><span className={cn("rounded-full border px-2 py-0.5 font-semibold", request.status === "demo_comment_generated" ? "border-blue-200 bg-blue-50 text-blue-700" : request.status === "needs_clarification" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>{request.status.replace(/_/g, " ")}</span></td><td className="py-2">{typeof analysis.confidence === "number" ? `${analysis.confidence}%` : "—"}</td><td className="py-2 text-slate-500">{new Date(request.updatedAt).toLocaleString()}</td><td className="py-2 text-right"><button onClick={() => setSelectedRequest(request)} className="font-semibold text-blue-700 underline">Open</button></td></tr>; })}</tbody></table></div>}</Panel>
    </div><div className="space-y-4">
      <Panel title="Agent analysis" action={analyzed ? <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", triage.readyForEngineering ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{triage.readyForEngineering ? "Ready for engineering" : "Clarification required"}</span> : <span className="text-xs text-slate-500">Awaiting analysis</span>}><Row label="Detected request type" value={analyzed ? triage.actionLabel : "Not analyzed"} /><Row label="Agent confidence" value={analyzed ? `${triage.confidence}% · ${triage.confidenceLabel}` : "—"} /><Row label="Extracted target" value={triage.extractedTarget || "Not found in request"} /><p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{analyzed ? triage.reasoning : "Run local preview or submit a demo ticket to classify the request and check action-specific requirements."}</p></Panel>
      {selectedRequest && <Panel title={`Opened ticket · ${selectedRequest.ticketNumber}`} action={<button onClick={() => setSelectedRequest(null)} className="text-xs font-semibold text-blue-700 underline">Close</button>}><Row label="Status" value={selectedRequest.status.replace(/_/g, " ")} /><Row label="Detected action" value={String(selectedRequest.llmAnalysis.action ?? "Not analyzed")} /><Row label="Confidence" value={typeof selectedRequest.llmAnalysis.confidence === "number" ? `${selectedRequest.llmAnalysis.confidence}%` : "—"} /><Row label="Change package" value={selectedRequest.changePackageId || "Not created"} />{selectedRequest.clarificationNote && <div className="mt-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generated customer-visible comment</p><pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">{selectedRequest.clarificationNote}</pre></div>}</Panel>}
      {analyzed && <Panel title="Readiness checks"><Check label="Required information" detail={triage.missing.length ? `${triage.missing.length} item(s) missing: ${triage.missing.join(", ")}.` : "All required information is present."} state={triage.missing.length ? "missing" : "pass"} /><Check label="Azure target" detail={selectedVm ? `${selectedVm.name} is confirmed in the latest Azure inventory.` : "Select and confirm the target VM before handoff."} state={selectedVm || triage.action === "create_vm" ? "pass" : "missing"} />{triage.conflicts.map((conflict) => <Check key={conflict} label="Validation attention" detail={conflict} state="attention" />)}</Panel>}
      {analyzed && !triage.readyForEngineering && <Panel title="Clarification note"><p className="text-xs text-slate-500">Review this generated note, then paste it into the ServiceNow ticket. Posting is disabled until the real connector is configured.</p><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">{clarificationNote}</pre><button onClick={() => void copyClarification()} className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><Clipboard className="h-3.5 w-3.5" />Copy clarification note</button></Panel>}
      {analyzed && <Panel title="Action-specific checklist"><p className="mb-2 text-xs text-slate-500">The triage policy requires these facts for <b>{triage.actionLabel}</b>:</p><ul className="space-y-1 text-xs text-slate-700">{actionRequirements.map((requirement) => <li key={requirement} className="flex gap-2"><span className="text-slate-400">•</span>{requirement}</li>)}</ul></Panel>}
      <Panel title="Governed handoff"><p className="text-sm text-slate-600">Only a complete, supported request can become a draft package. Approval and execution remain separate human-governed steps.</p><button onClick={() => void createDraft()} disabled={!ready || saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><ShieldCheck className="h-4 w-4" />{saving ? "Creating governed draft…" : "Create draft & continue to Change Engineering"}<ArrowRight className="h-4 w-4" /></button><Link to="/changes" className="mt-3 block text-center text-sm font-medium text-blue-700 underline">Open Change Engineering</Link></Panel>
    </div></div>
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">The webhook agent classifies, extracts, validates, and writes customer-visible ServiceNow comments when configured. It cannot approve or execute Azure changes; complete requests still enter the governed Change Review and Execution workflow.</p>
  </main>;
}
