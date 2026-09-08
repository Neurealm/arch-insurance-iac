import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, RefreshCw, Send, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, listAzureVirtualMachines, type AzureVirtualMachine } from "../azureControlPlane";
import { getVmChangePackage, listChangePackageTargets, saveVmChangePackage, type ChangePackageTarget, type VmChangePackage } from "../changePackages";
import { createTerraformPlan } from "../automationCatalog";
import { listServiceNowIntakeRequests, type ServiceNowIntakeRequest } from "../servicenowIntakeRequests";
import { StatusBadge } from "./TicketPackageQueue";

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-md border border-[#E2E8F0] bg-white">
    <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>{right && <div className="ml-auto">{right}</div>}</header>
    <div className="p-3">{children}</div>
  </section>;
}

function Row({ label, value, fromTicket }: { label: string; value: React.ReactNode; fromTicket?: boolean }) {
  return <div className="flex items-start justify-between gap-4 border-b border-dashed border-[#E2E8F0] py-1.5 text-[12px] last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-medium text-slate-800">{value}{fromTicket && <span className="ml-1.5 rounded-full border border-[#CFE0F3] bg-[#EFF4FB] px-1.5 py-0.5 text-[10px] font-medium text-[#1B4F91]">from ticket</span>}</span>
  </div>;
}

type Check = { label: string; pass: boolean; detail: string };

export default function PackageReview() {
  const { packageNumber } = useParams<{ packageNumber: string }>();
  const [pkg, setPkg] = useState<VmChangePackage | null>(null);
  const [targets, setTargets] = useState<ChangePackageTarget[]>([]);
  const [ticket, setTicket] = useState<ServiceNowIntakeRequest | null>(null);
  const [vms, setVms] = useState<AzureVirtualMachine[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [rationale, setRationale] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!packageNumber) return;
    setLoading(true); setError(null);
    try {
      const found = await getVmChangePackage(packageNumber);
      setPkg(found);
      if (!found) return;
      setRationale(found.rationale ?? "");
      const [targetRows, requests] = await Promise.all([listChangePackageTargets(found.id), listServiceNowIntakeRequests()]);
      setTargets(targetRows);
      setTicket(requests.find((request) => request.changePackageId === found.id) ?? null);
      try { setVms(await listAzureVirtualMachines()); setInventoryError(null); }
      catch (cause) { setInventoryError(cause instanceof AzureControlPlaneError ? cause.message : "Azure inventory could not be read for the target check."); }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load this change package.");
    } finally { setLoading(false); }
  }, [packageNumber]);
  useEffect(() => { void load(); }, [load]);

  const isCreate = pkg?.actionType === "create_vm";

  const checks = useMemo<Check[]>(() => {
    if (!pkg) return [];
    const result: Check[] = [];
    const known = new Set(vms.map((vm) => vm.name.toLowerCase()));
    if (inventoryError) {
      result.push({ label: "Target machine check", pass: false, detail: inventoryError });
    } else if (isCreate) {
      const clashes = targets.filter((target) => known.has(target.targetName.toLowerCase())).map((target) => target.targetName);
      result.push({ label: "Requested names are free", pass: clashes.length === 0, detail: clashes.length ? `Already present in Azure: ${clashes.join(", ")}` : `${targets.length} name${targets.length === 1 ? "" : "s"} available in ${pkg.resourceGroup}` });
    } else {
      const missing = targets.filter((target) => !known.has(target.targetName.toLowerCase())).map((target) => target.targetName);
      result.push({ label: "Target machines exist", pass: missing.length === 0, detail: missing.length ? `Not found in the connected Azure scope: ${missing.join(", ")}` : targets.map((target) => target.targetName).join(", ") });
    }
    result.push({ label: "Resource group and region", pass: !!pkg.resourceGroup && !!pkg.region, detail: `${pkg.resourceGroup || "not set"} · ${pkg.region || "not set"}` });
    result.push({ label: "Declared targets", pass: targets.length > 0, detail: targets.length ? `${targets.length} resource${targets.length === 1 ? "" : "s"} declared` : "The package declares no target resources" });
    result.push({ label: "Reason recorded", pass: rationale.trim().length >= 10, detail: rationale.trim().length >= 10 ? "Business reason carried from the ticket" : "Add a reason of at least 10 characters" });
    for (const evidence of (pkg.policyEvidence as Check[]) ?? []) {
      if (evidence && typeof evidence === "object" && "label" in evidence) result.push({ label: String(evidence.label), pass: !!evidence.pass, detail: String(evidence.detail ?? "") });
    }
    return result;
  }, [inventoryError, isCreate, pkg, rationale, targets, vms]);

  const canSubmit = !!pkg && (pkg.status === "draft" || pkg.status === "changes_requested") && checks.every((check) => check.pass);

  const submit = async () => {
    if (!pkg) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      const saved = await saveVmChangePackage({
        packageNumber: pkg.packageNumber, status: "submitted", targetResourceId: pkg.targetResourceId, targetName: pkg.targetName,
        subscriptionId: pkg.subscriptionId, resourceGroup: pkg.resourceGroup, region: pkg.region, actionType: pkg.actionType,
        actionLabel: pkg.actionLabel, parameters: pkg.parameters, rationale: rationale.trim(), currentState: pkg.currentState,
        policyEvidence: pkg.policyEvidence, validationPlan: pkg.validationPlan, riskScore: pkg.riskScore, riskLevel: pkg.riskLevel,
        approvalRequired: true,
      }, targets, pkg.id);
      setPkg(saved);
      try {
        await createTerraformPlan(saved.id);
        setMessage(`${saved.packageNumber} was submitted for approval and its Terraform plan was queued. No Azure change has been made.`);
      } catch (planCause) {
        setMessage(`${saved.packageNumber} was submitted for approval.`);
        setError(planCause instanceof Error ? `Terraform planning was not queued: ${planCause.message}` : "Terraform planning was not queued.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit this package for approval.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-4 text-[13px] text-slate-600">Loading the drafted change package…</div>;
  if (!pkg) return <div className="p-4"><Panel title="Change package"><p className="text-[13px] text-slate-600">No change package was found for {packageNumber}.</p><Link to="/changes" className="mt-3 inline-block text-[12px] font-medium text-[#1B4F91] underline">Back to Change Engineering</Link></Panel></div>;

  const parameters = Object.entries(pkg.parameters as Record<string, unknown>).filter(([, value]) => value !== null && value !== "" && !Array.isArray(value) && typeof value !== "object");

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <Link to="/changes" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-[#1B4F91]"><ArrowLeft className="h-3.5 w-3.5" />Change Engineering</Link>
      <button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
    </div>

    <header className="mb-3 flex flex-wrap items-start gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2"><h1 className="text-[20px] font-semibold text-slate-900">{pkg.packageNumber}</h1><StatusBadge status={pkg.status} /></div>
        <p className="mt-1 text-[12.5px] text-slate-600">Drafted automatically from {ticket ? `ServiceNow ${ticket.ticketNumber}` : "an unlinked request"}. Review it and submit for approval.</p>
      </div>
      <div className="ml-auto rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] font-medium text-[#1B4F91]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />No Azure action happens on this screen</div>
    </header>

    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {message && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{message}</div>}

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="space-y-3">
        <Panel title="1. Source ticket">
          {ticket ? <div>
            <Row label="Ticket" value={ticket.ticketNumber} />
            <Row label="Requester" value={text(ticket.normalizedRequest.requester) || "Not recorded"} />
            <Row label="Environment" value={text(ticket.normalizedRequest.environment) || "Not recorded"} />
            <p className="mt-2 whitespace-pre-wrap rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 text-[11.5px] text-slate-700">{text(ticket.llmAnalysis.summary) || text(ticket.normalizedRequest.description) || "No description recorded."}</p>
            {ticket.clarificationNote && <p className="mt-2 whitespace-pre-wrap text-[11.5px] text-slate-600">{ticket.clarificationNote}</p>}
          </div> : <p className="text-[12px] text-slate-600">This package is not linked to a ServiceNow request.</p>}
        </Panel>

        <Panel title="2. What will change" right={<span className="text-[11px] text-slate-500">{targets.length} target{targets.length === 1 ? "" : "s"}</span>}>
          <Row label="Action" value={pkg.actionLabel} fromTicket={!!ticket} />
          <Row label="Resource group" value={pkg.resourceGroup} fromTicket={!!ticket} />
          <Row label="Region" value={pkg.region} fromTicket={!!ticket} />
          {parameters.map(([key, value]) => <Row key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())} value={String(value)} fromTicket={!!ticket} />)}
          <div className="mt-2 overflow-hidden rounded-md border border-[#E2E8F0]">
            <table className="w-full text-left text-[11.5px]">
              <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500"><tr><th className="px-2.5 py-1.5 font-medium">Machine</th><th className="px-2.5 py-1.5 font-medium">Resource group</th><th className="px-2.5 py-1.5 font-medium">Region</th></tr></thead>
              <tbody>{targets.map((target) => <tr key={target.targetResourceId} className="border-t border-[#E2E8F0]"><td className="px-2.5 py-1.5 font-medium text-slate-800">{target.targetName}</td><td className="px-2.5 py-1.5 text-slate-600">{target.resourceGroup}</td><td className="px-2.5 py-1.5 text-slate-600">{target.region}</td></tr>)}</tbody>
            </table>
          </div>
        </Panel>

        <Panel title="4. Reason and window">
          <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} rows={4} disabled={pkg.status !== "draft" && pkg.status !== "changes_requested"} className="w-full rounded-md border border-[#CBD5E1] px-2.5 py-2 text-[12px] outline-none focus:border-[#1B4F91] focus:ring-1 focus:ring-[#CFE0F3] disabled:bg-slate-50 disabled:text-slate-500" placeholder="Why this change is needed and when it should run." />
          <p className="mt-1 text-[11px] text-slate-500">Carried from the ticket. Edits are saved with the package when you submit it.</p>
        </Panel>
      </div>

      <div className="space-y-3">
        <Panel title="3. Scope checks">
          <ul className="space-y-2">{checks.map((check) => <li key={check.label} className="flex items-start gap-2 text-[11.5px]">
            {check.pass ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />}
            <span><span className={cn("font-medium", check.pass ? "text-slate-800" : "text-red-800")}>{check.label}</span><span className="block text-slate-500">{check.detail}</span></span>
          </li>)}</ul>
        </Panel>

        <Panel title="5. Next step">
          {pkg.status === "draft" || pkg.status === "changes_requested" ? <>
            <button type="button" onClick={() => void submit()} disabled={!canSubmit || saving} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12.5px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Send className="h-3.5 w-3.5" />{saving ? "Submitting…" : "Submit for approval"}</button>
            {!canSubmit && <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />Every scope check must pass before this can be submitted.</p>}
            <Link to="/servicenow-intake" className="mt-2 block text-center text-[11.5px] font-medium text-[#1B4F91] underline">Return to intake for clarification</Link>
          </> : <p className="text-[12px] text-slate-600">This package has moved on to review. Follow it in <Link to="/approvals" className="font-medium text-[#1B4F91] underline">Change Review &amp; Approval</Link>.</p>}
          <p className="mt-3 text-[11px] text-slate-500">Approval and execution happen on later screens, and every deletion stays blocked at apply.</p>
        </Panel>

        <Panel title="Risk">
          <Row label="Risk level" value={pkg.riskLevel} />
          <Row label="Risk score" value={String(pkg.riskScore)} />
          <Row label="Created" value={new Date(pkg.createdAt).toLocaleString()} />
        </Panel>
      </div>
    </div>
  </div>;
}
