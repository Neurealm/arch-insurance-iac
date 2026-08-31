import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, FileInput, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, listAzureVirtualMachines, type AzureVirtualMachine } from "./azureControlPlane";
import { saveVmChangePackage, type ChangePackageStatus } from "./changePackages";

type IntakeAction = "start_vm" | "restart_vm" | "resize_vm" | "increase_os_disk" | "configure_backup" | "enable_monitoring" | "assess_patches";
type CheckState = "pass" | "missing" | "attention";

const ACTIONS: Array<{ value: IntakeAction; label: string }> = [
  { value: "start_vm", label: "Start Azure VM" },
  { value: "restart_vm", label: "Restart Azure VM" },
  { value: "resize_vm", label: "Change VM size" },
  { value: "increase_os_disk", label: "Increase OS disk capacity" },
  { value: "configure_backup", label: "Configure Azure Backup" },
  { value: "enable_monitoring", label: "Enable Azure Monitor / VM Insights" },
  { value: "assess_patches", label: "Run patch assessment" },
];

function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border border-slate-200 bg-white", className)}><header className="flex min-h-11 items-center justify-between border-b border-slate-200 px-4"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-800">{title}</h2>{action}</header><div className="p-4">{children}</div></section>;
}

function Check({ label, detail, state }: { label: string; detail: string; state: CheckState }) {
  const color = state === "pass" ? "text-emerald-700" : state === "missing" ? "text-red-700" : "text-amber-700";
  return <div className="flex items-start gap-2 border-b border-slate-100 py-2 last:border-0"><span className="mt-0.5">{state === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className={cn("h-4 w-4", state === "missing" ? "text-red-600" : "text-amber-600")} />}</span><div><p className={cn("text-sm font-medium", color)}>{label}</p><p className="text-xs text-slate-500">{detail}</p></div></div>;
}

function newPackageNumber() { return `VM-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`; }

export default function ServiceNowIntake() {
  const navigate = useNavigate();
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [vmId, setVmId] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [requester, setRequester] = useState("");
  const [application, setApplication] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [action, setAction] = useState<IntakeAction>("start_vm");
  const [description, setDescription] = useState("");
  const [maintenanceWindow, setMaintenanceWindow] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [applicationOwner, setApplicationOwner] = useState("");
  const [rollbackPlan, setRollbackPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => { setLoading(true); setError(null); try { setVms(await listAzureVirtualMachines()); } catch (cause) { setError(cause instanceof AzureControlPlaneError ? cause.message : "Unable to load the connected Azure VM inventory."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const selectedVm = useMemo(() => vms.find((vm) => vm.id === vmId), [vmId, vms]);
  const actionLabel = ACTIONS.find((item) => item.value === action)?.label ?? action;
  const required = useMemo(() => [
    ["ServiceNow ticket number", ticketNumber.trim().length > 0],
    ["Requester", requester.trim().length > 0],
    ["Request description", description.trim().length >= 10],
    ["Target VM", !!selectedVm],
    ["Maintenance window", maintenanceWindow.trim().length > 0],
    ["Business impact", businessImpact.trim().length > 0],
    ["Application owner", applicationOwner.trim().length > 0],
    ["Rollback plan", rollbackPlan.trim().length >= 10],
  ] as Array<[string, boolean]>, [applicationOwner, businessImpact, description, maintenanceWindow, rollbackPlan, requester, selectedVm, ticketNumber]);
  const missing = required.filter(([, complete]) => !complete).map(([label]) => label);
  const conflict = selectedVm && action === "start_vm" && /running/i.test(selectedVm.powerState) ? "The selected VM is already running; a start request may be unnecessary." : selectedVm && action === "restart_vm" && !/running/i.test(selectedVm.powerState) ? "Restart requires a running VM; confirm the requested state or choose Start Azure VM." : null;
  const ready = missing.length === 0 && !conflict;

  const createDraft = async () => {
    if (!ready || !selectedVm) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      const saved = await saveVmChangePackage({ packageNumber: newPackageNumber(), status: "draft" as ChangePackageStatus, targetResourceId: selectedVm.id, targetName: selectedVm.name, subscriptionId: selectedVm.subscriptionId, resourceGroup: selectedVm.resourceGroup, region: selectedVm.location, actionType: action, actionLabel, parameters: { source: "servicenow_intake", serviceNowTicket: ticketNumber.trim(), environment, application: application.trim() || null }, rationale: `ServiceNow ${ticketNumber.trim()} requested by ${requester.trim()}: ${description.trim()} Business impact: ${businessImpact.trim()}. Maintenance window: ${maintenanceWindow.trim()}. Rollback plan: ${rollbackPlan.trim()}.`, currentState: { powerState: selectedVm.powerState, provisioningState: selectedVm.provisioningState, vmSize: selectedVm.vmSize, osType: selectedVm.osType, serviceNowTicket: ticketNumber.trim() }, policyEvidence: [{ check: "ServiceNow intake completeness", result: "passed" }], validationPlan: ["Reconcile target VM with Azure before approval", "Validate action-specific post-change state", "Review current Azure operations evidence"], riskScore: action === "restart_vm" ? 35 : 25, riskLevel: "Low", approvalRequired: true });
      setMessage(`${saved.packageNumber} was created as a draft. No Azure action was performed.`);
      window.setTimeout(() => navigate(`/changes/virtual-machines/${encodeURIComponent(selectedVm.name)}?resourceId=${encodeURIComponent(selectedVm.id)}`), 800);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create the governed VM draft."); } finally { setSaving(false); }
  };

  return <main className="mx-auto max-w-[1500px] space-y-4 px-3 py-5 md:px-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500">Infrastructure as Code <span className="mx-1">/</span> ServiceNow Intake</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">ServiceNow Intake &amp; Request Triage</h1><p className="mt-1 text-sm text-slate-600">Capture a request, enrich it with live Azure VM data, and hand off a complete request to governed Change Engineering.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />Refresh Azure inventory</button></div><div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><FileInput className="mr-2 inline h-4 w-4" /><b>ServiceNow connector status: Not configured.</b> This pilot supports structured intake and Azure enrichment. It does not pretend to read or write ServiceNow until a connector is configured.</div>{error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}{message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}<div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_380px]"><div className="space-y-4"><Panel title="1. Request details"><div className="grid gap-3 md:grid-cols-2"><Field label="ServiceNow ticket number" value={ticketNumber} onChange={setTicketNumber} placeholder="For example: CHG0012345" /><Field label="Requester" value={requester} onChange={setRequester} placeholder="Name or email" /><Field label="Application / service" value={application} onChange={setApplication} placeholder="Business service name" /><label className="text-sm font-medium text-slate-700">Environment<select value={environment} onChange={(event) => setEnvironment(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-sm"><option>Production</option><option>Pre-Production</option><option>Development</option></select></label></div><label className="mt-3 block text-sm font-medium text-slate-700">Requested action<select value={action} onChange={(event) => setAction(event.target.value as IntakeAction)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-sm">{ACTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="mt-3 block text-sm font-medium text-slate-700">Request description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Describe what should change, why it is needed, and the expected result." className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm" /></label></Panel><Panel title="2. Change context"><div className="grid gap-3 md:grid-cols-2"><Field label="Maintenance window" value={maintenanceWindow} onChange={setMaintenanceWindow} placeholder="Date, time, and timezone" /><Field label="Application owner" value={applicationOwner} onChange={setApplicationOwner} placeholder="Owner or team" /></div><label className="mt-3 block text-sm font-medium text-slate-700">Expected business impact<textarea value={businessImpact} onChange={(event) => setBusinessImpact(event.target.value)} rows={3} placeholder="Who is affected and what interruption is acceptable?" className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm" /></label><label className="mt-3 block text-sm font-medium text-slate-700">Rollback plan<textarea value={rollbackPlan} onChange={(event) => setRollbackPlan(event.target.value)} rows={3} placeholder="What should the operator verify or do if the change is unsuccessful?" className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm" /></label></Panel><Panel title="3. Target Azure VM" action={<span className="text-xs text-slate-500">Live connected inventory</span>}>{loading ? <p className="py-4 text-sm text-slate-500">Loading Azure VMs…</p> : <select value={vmId} onChange={(event) => setVmId(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm"><option value="">Select a target VM</option>{vms.map((vm) => <option key={vm.id} value={vm.id}>{vm.name} · {vm.resourceGroup} · {vm.location}</option>)}</select>}{selectedVm && <div className="mt-3 grid gap-2 sm:grid-cols-3"><Fact label="Power state" value={selectedVm.powerState} /><Fact label="VM size" value={selectedVm.vmSize} /><Fact label="Operating system" value={selectedVm.osType} /></div>}</Panel></div><div className="space-y-4"><Panel title="Readiness assessment" action={<span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>{ready ? "Ready for engineering" : "Needs information"}</span>}><Check label="Required request fields" detail={missing.length ? `${missing.length} field(s) still required: ${missing.join(", ")}.` : "All intake fields are complete."} state={missing.length ? "missing" : "pass"} /><Check label="Target VM" detail={selectedVm ? `${selectedVm.name} is present in the latest Azure inventory.` : "Select a VM from the connected Azure inventory."} state={selectedVm ? "pass" : "missing"} />{conflict && <Check label="Request / Azure state conflict" detail={conflict} state="attention" />}{!conflict && selectedVm && <Check label="Request / Azure state" detail="No obvious conflict found. The reviewer will recheck Azure before approval." state="pass" />}</Panel><Panel title="Detected request"><Row label="Request type" value={actionLabel} /><Row label="Classification" value="Operator-selected · deterministic pilot" /><Row label="Target" value={selectedVm?.name || "Not selected"} /><Row label="Source" value="Manual intake (ServiceNow connector pending)" /></Panel><Panel title="Handoff controls"><p className="text-sm text-slate-600">When all required information is present, create a durable draft package and continue in Change Engineering. Approval and execution remain separate governed steps.</p><button onClick={() => void createDraft()} disabled={!ready || saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><ShieldCheck className="h-4 w-4" />{saving ? "Creating governed draft…" : "Create draft & continue to Change Engineering"}<ArrowRight className="h-4 w-4" /></button><Link to="/changes" className="mt-3 block text-center text-sm font-medium text-blue-700 underline">Open Change Engineering</Link></Panel></div></div><p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">This intake page classifies and enriches requests only. It cannot approve, execute, or write a clarification back to ServiceNow until the real ServiceNow integration and credentials are configured.</p></main>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="text-sm font-medium text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 text-sm" /></label>; }
function Row({ label, value }: { label: string; value: ReactNode }) { return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0"><span className="text-slate-500">{label}</span><span className="max-w-[62%] text-right font-medium text-slate-800">{value || "Not reported"}</span></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>{value || "Not reported"}</p></div>; }
