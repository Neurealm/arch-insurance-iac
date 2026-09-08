import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, FileInput, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, listAzureVirtualMachines, type AzureVirtualMachine } from "./azureControlPlane";
import { listServiceNowIntakeRequests, submitDemoServiceNowTicket } from "./servicenowIntakeRequests";

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return <label className="text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-red-600">*</span>}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></label>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white"><header className="border-b border-slate-200 px-5 py-3"><h2 className="text-xs font-semibold uppercase tracking-wide text-slate-800">{title}</h2></header><div className="p-5">{children}</div></section>;
}

const text = (value: unknown) => typeof value === "string" ? value : "";

export default function DemoChangeRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reviseFrom = searchParams.get("reviseFrom");
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [vmId, setVmId] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [requester, setRequester] = useState("");
  const [application, setApplication] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [description, setDescription] = useState("");
  const [maintenanceWindow, setMaintenanceWindow] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [applicationOwner, setApplicationOwner] = useState("");
  const [rollbackPlan, setRollbackPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outstanding, setOutstanding] = useState<string[]>([]);
  const [revisingTicket, setRevisingTicket] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setVms(await listAzureVirtualMachines()); }
    catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the connected Azure VM inventory."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Reopening a ticket the agent asked questions about. The original answers are
  // replayed into the form so the requester edits their submission rather than
  // retyping it, and the outstanding questions sit above the description they
  // need to change.
  useEffect(() => {
    if (!reviseFrom) return;
    let cancelled = false;
    void (async () => {
      try {
        const requests = await listServiceNowIntakeRequests();
        const original = requests.find((item) => item.id === reviseFrom);
        if (!original || cancelled) return;
        const payload = original.ticketPayload;
        setTicketNumber(text(payload.number) || original.ticketNumber);
        setRequester(text(payload.requester));
        setApplication(text(payload.application));
        if (text(payload.environment)) setEnvironment(text(payload.environment));
        setDescription(text(payload.description));
        setMaintenanceWindow(text(payload.maintenance_window));
        setBusinessImpact(text(payload.business_impact));
        setApplicationOwner(text(payload.application_owner));
        setRollbackPlan(text(payload.rollback_plan));
        setRevisingTicket(original.ticketNumber);
        const validation = original.llmAnalysis.validation as Record<string, unknown> | undefined;
        const questions = Array.isArray(validation?.questions) ? validation.questions : [];
        setOutstanding(questions.filter((item): item is string => typeof item === "string"));
      } catch { /* a failed prefill still leaves a usable blank form */ }
    })();
    return () => { cancelled = true; };
  }, [reviseFrom]);

  const selectedVm = vms.find((vm) => vm.id === vmId);

  const submit = async () => {
    if (!requester.trim() || !application.trim() || description.trim().length < 10) {
      setError("Requester, application/service, and a description of at least 10 characters are required.");
      return;
    }
    setSubmitting(true); setError(null);
    const number = ticketNumber.trim() || `DEMO-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const targetPrefix = selectedVm ? `Target Azure VM: ${selectedVm.name} (${selectedVm.id}). ` : "";
    try {
      const result = await submitDemoServiceNowTicket({ number, sys_id: `demo-${crypto.randomUUID()}`, requester: requester.trim(), application: application.trim(), environment, description: `${targetPrefix}${description.trim()}`, maintenance_window: maintenanceWindow.trim(), business_impact: businessImpact.trim(), application_owner: applicationOwner.trim(), rollback_plan: rollbackPlan.trim() });
      navigate(`/servicenow-intake?requestId=${encodeURIComponent(result.requestId)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to submit the demo change request."); }
    finally { setSubmitting(false); }
  };

  return <main className="mx-auto max-w-[1180px] space-y-5 px-4 py-6 md:px-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-slate-500">Infrastructure as Code <span className="mx-1">/</span> Demo Change Request</p><div className="mt-1 flex items-center gap-3"><h1 className="text-2xl font-semibold text-slate-900">Create a Demo Change Request</h1><span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">ServiceNow simulator</span></div><p className="mt-2 max-w-3xl text-sm text-slate-600">Submit a ticket on behalf of ServiceNow. The next screen will show the platform agent analyzing it and deciding whether clarification or engineering handoff is required.</p></div><Link to="/servicenow-intake" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Open intake queue <ArrowRight className="h-4 w-4" /></Link></header>
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><FileInput className="mr-2 inline h-4 w-4" /><b>What is simulated:</b> ServiceNow submission and external comment write-back. <b>What is real:</b> Gemini analysis, live Azure enrichment, validation, audit storage, and governed package creation.</div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    {revisingTicket && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertTriangle className="mr-2 inline h-4 w-4" /><b>Revising {revisingTicket}.</b> Your original answers are below. Update them to cover what the agent asked for, then resubmit — it will be analyzed again.{outstanding.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">{outstanding.map((question) => <li key={question}>{question}</li>)}</ul>}</div>}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]"><div className="space-y-5">
      <Panel title="1. Ticket details"><div className="grid gap-4 md:grid-cols-2"><Field label="Demo ticket number" value={ticketNumber} onChange={setTicketNumber} placeholder="Leave blank to generate automatically" /><Field label="Requester" value={requester} onChange={setRequester} placeholder="Name or email" required /><Field label="Application / service" value={application} onChange={setApplication} placeholder="Business service name" required /><label className="text-sm font-medium text-slate-700">Environment<select value={environment} onChange={(event) => setEnvironment(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"><option>Production</option><option>Pre-Production</option><option>Development</option></select></label></div><label className="mt-4 block text-sm font-medium text-slate-700">What change is being requested?<span className="ml-1 text-red-600">*</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Example: Please restart iac-pilot-vm01 during the Sunday 02:00–02:30 UTC window because the application owner needs to apply a kernel update. Expected interruption is five minutes." className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></label></Panel>
      <Panel title="2. Optional Azure target"><p className="mb-3 text-xs text-slate-500">Selecting a VM lets the agent verify the request against live Azure state. Leave it blank to demonstrate that the agent asks for the target.</p>{loading ? <p className="text-sm text-slate-500">Loading live Azure VMs…</p> : <select value={vmId} onChange={(event) => setVmId(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"><option value="">Do not select a VM</option>{vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.name} · {vm.resourceGroup} · {vm.location}</option>)}</select>}{selectedVm && <div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wide text-slate-500">Power state</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVm.powerState}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wide text-slate-500">VM size</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVm.vmSize}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wide text-slate-500">Operating system</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVm.osType}</p></div></div>}</Panel>
      <Panel title="3. Change context"><div className="grid gap-4 md:grid-cols-2"><Field label="Maintenance window" value={maintenanceWindow} onChange={setMaintenanceWindow} placeholder="Date, time, and timezone" /><Field label="Application owner" value={applicationOwner} onChange={setApplicationOwner} placeholder="Owner or team" /></div><label className="mt-4 block text-sm font-medium text-slate-700">Expected business impact<textarea value={businessImpact} onChange={(event) => setBusinessImpact(event.target.value)} rows={3} placeholder="Who is affected and what interruption is acceptable?" className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm" /></label><label className="mt-4 block text-sm font-medium text-slate-700">Rollback plan<textarea value={rollbackPlan} onChange={(event) => setRollbackPlan(event.target.value)} rows={3} placeholder="What should the operator verify or do if the change is unsuccessful?" className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm" /></label></Panel>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500"><b className="text-slate-700">Next:</b> send this ServiceNow-shaped payload to the real intake agent.</p><button onClick={() => void submit()} disabled={submitting || loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Send className="h-4 w-4" />{submitting ? "Sending to Gemini…" : "Submit change request"}<ArrowRight className="h-4 w-4" /></button></div>
    </div><aside className="space-y-5"><Panel title="Demo sequence"><ol className="space-y-3 text-sm text-slate-700"><li><b className="mr-2 text-blue-700">1</b>Submit the ticket here.</li><li><b className="mr-2 text-blue-700">2</b>Open it in the ServiceNow Intake queue.</li><li><b className="mr-2 text-blue-700">3</b>Show Gemini’s classification and confidence.</li><li><b className="mr-2 text-blue-700">4</b>Review missing information or conflicts.</li><li><b className="mr-2 text-blue-700">5</b>Hand complete requests to Change Engineering.</li></ol></Panel><Panel title="Governance boundary"><ShieldCheck className="h-5 w-5 text-blue-700" /><p className="mt-2 text-xs leading-5 text-slate-600">Submitting or analyzing a ticket never starts, stops, or modifies an Azure VM. Any infrastructure action remains behind the existing human approval and execution workflow.</p></Panel><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 disabled:opacity-50"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh Azure inventory</button></aside></div>
  </main>;
}
