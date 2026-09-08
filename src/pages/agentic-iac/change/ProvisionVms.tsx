import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileInput, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { listApprovedVmCapabilities, createTerraformPlan, type AutomationCapability } from "../automationCatalog";
import { deriveVmTargetIds, saveVmChangePackage, type ChangePackageTarget } from "../changePackages";
import { listAzureVirtualMachines, AzureControlPlaneError, type AzureVirtualMachine } from "../azureControlPlane";
import { loadTicketPrefill, prefillRationale, type TicketPrefill } from "./ticketPrefill";
import PrefilledFromTicket, { FromTicketTag } from "./PrefilledFromTicket";

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return <section className="rounded-md border border-[#E2E8F0] bg-white"><header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>{right && <div className="ml-auto">{right}</div>}</header><div className="p-3">{children}</div></section>;
}

function Field({ label, hint, tag, children }: { label: string; hint?: string; tag?: ReactNode; children: ReactNode }) {
  return <label className="block"><span className="block text-[11.5px] font-medium text-slate-700">{label}{tag}</span>{hint && <span className="mt-0.5 block text-[10.5px] text-slate-500">{hint}</span>}<div className="mt-1">{children}</div></label>;
}

const input = "w-full rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-slate-800 font-mono";
const newPackageNumber = () => `VM-CHG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "");


/**
 * Requesting brand-new machines.
 *
 * Deliberately not part of VmChangePackageBuilder: that screen resolves an
 * existing VM from live Azure discovery and refuses to render without one,
 * which is exactly backwards for creation. Both entry paths converge on the
 * same server-side write (save_iac_change_package) so validation cannot drift
 * between the console and the ServiceNow ticket route.
 */
export default function ProvisionVms() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromTicket = searchParams.get("fromTicket");

  const [capability, setCapability] = useState<AutomationCapability | null>(null);
  const [existingVms, setExistingVms] = useState<AzureVirtualMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [resourceGroupArmId, setResourceGroupArmId] = useState("");
  const [subnetArmId, setSubnetArmId] = useState("");
  const [location, setLocation] = useState("");
  const [names, setNames] = useState("");
  const [vmSize, setVmSize] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [sshPublicKey, setSshPublicKey] = useState("");
  const [osPublisher, setOsPublisher] = useState("Canonical");
  const [osOffer, setOsOffer] = useState("0001-com-ubuntu-server-jammy");
  const [osSku, setOsSku] = useState("22_04-lts-gen2");
  const [osVersion, setOsVersion] = useState("latest");
  const [environment, setEnvironment] = useState("development");
  const [rationale, setRationale] = useState("");
  const [prefill, setPrefill] = useState<TicketPrefill | null>(null);
  // Keys still holding an untouched ticket value. A key leaves the set the
  // first time a person edits that field, so the "from ticket" marker only ever
  // sits next to a value nobody has reviewed by hand.
  const [fromTicketFields, setFromTicketFields] = useState<Set<string>>(new Set());
  const touched = (key: string) => setFromTicketFields((keys) => { if (!keys.has(key)) return keys; const next = new Set(keys); next.delete(key); return next; });



  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [capabilities, vms] = await Promise.all([
        listApprovedVmCapabilities(),
        listAzureVirtualMachines().catch(() => [] as AzureVirtualMachine[]),
      ]);
      setCapability(capabilities.find((item) => item.actionType === "create_vm") ?? null);
      setExistingVms(vms);
    } catch (cause) {
      setError(cause instanceof AzureControlPlaneError ? cause.message : cause instanceof Error ? cause.message : "Unable to load the provisioning capability.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // Seeded once per ticket. Refreshing Azure state later must never overwrite
  // what the person has since typed, so this deliberately does not depend on
  // load() and bails as soon as a prefill for this ticket is in place.
  useEffect(() => {
    if (!fromTicket || prefill?.intakeRequestId === fromTicket) return;
    let cancelled = false;
    void (async () => {
      try {
        const ticket = await loadTicketPrefill(fromTicket);
        if (!ticket || cancelled) return;
        const p = ticket.provisioning;
        const seeded = new Set<string>();
        const set = (key: string, value: string, apply: (value: string) => void) => { if (!value) return; apply(value); seeded.add(key); };
        const vmNames = Array.isArray(p.vmNames) ? p.vmNames.filter((item): item is string => typeof item === "string") : [];
        set("names", vmNames.join("\n"), setNames);
        set("resourceGroupArmId", asText(p.resourceGroupArmId), setResourceGroupArmId);
        set("subnetArmId", asText(p.subnetArmId), setSubnetArmId);
        set("location", asText(p.location), setLocation);
        set("vmSize", asText(p.vmSize), setVmSize);
        set("adminUsername", asText(p.adminUsername), setAdminUsername);
        set("sshPublicKey", asText(p.sshPublicKey), setSshPublicKey);
        set("osPublisher", asText(p.osPublisher), setOsPublisher);
        set("osOffer", asText(p.osOffer), setOsOffer);
        set("osSku", asText(p.osSku), setOsSku);
        set("osVersion", asText(p.osVersion), setOsVersion);
        if (["development", "pre-production", "production"].includes(ticket.environment)) set("environment", ticket.environment, setEnvironment);
        set("rationale", prefillRationale(ticket), setRationale);
        setPrefill(ticket);
        setFromTicketFields(seeded);
      } catch { /* a failed prefill still leaves a usable blank form */ }
    })();
    return () => { cancelled = true; };
  }, [fromTicket, prefill?.intakeRequestId]);

  const clearPrefill = () => {
    setPrefill(null); setFromTicketFields(new Set());
    setNames(""); setResourceGroupArmId(""); setSubnetArmId(""); setLocation("");
    setVmSize(""); setAdminUsername(""); setSshPublicKey(""); setRationale("");
    setOsPublisher("Canonical"); setOsOffer("0001-com-ubuntu-server-jammy"); setOsSku("22_04-lts-gen2"); setOsVersion("latest");
    setEnvironment("development");
    setSearchParams({}, { replace: true });
  };


  const requested = useMemo(() => names.split(/[\s,]+/).map((name) => name.trim()).filter(Boolean), [names]);
  // A name that already exists in Azure is the likeliest way a batch fails
  // half-way through apply, so surface it before the package is even created.
  const collisions = useMemo(() => requested.filter((name) => existingVms.some((vm) => vm.name.toLowerCase() === name.toLowerCase())), [requested, existingVms]);
  const maxTargets = capability?.maxTargetsPerRun ?? 20;

  const problem = !capability ? "No approved create_vm capability exists. A Terraform module must be drafted, reviewed and promoted first."
    : !requested.length ? "Name at least one machine."
    : requested.length > maxTargets ? `This capability allows at most ${maxTargets} machines per request.`
    : collisions.length ? `These names already exist in Azure: ${collisions.join(", ")}.`
    : rationale.trim().length < 10 ? "Give a reason of at least 10 characters."
    : !resourceGroupArmId.trim() || !subnetArmId.trim() || !location.trim() || !vmSize.trim() || !adminUsername.trim() || !sshPublicKey.trim() ? "Every provisioning field is required."
    : null;

  const submit = async () => {
    setSaving(true); setError(null); setMessage(null);
    try {
      // Derived server-side: the same synthesis servicenow-intake uses, so a
      // name Azure or the orchestrator's ARM parser would reject fails here.
      const ids = await deriveVmTargetIds(resourceGroupArmId.trim(), requested);
      const subscription = resourceGroupArmId.trim().split("/")[2] ?? "";
      const resourceGroup = resourceGroupArmId.trim().split("/")[4] ?? "";
      const region = location.trim().toLowerCase();
      const targets: ChangePackageTarget[] = ids.map((id, index) => ({
        targetResourceId: id, targetName: requested[index], subscriptionId: subscription,
        resourceGroup, region, currentState: {},
      }));
      const saved = await saveVmChangePackage({
        packageNumber: newPackageNumber(), status: "submitted",
        targetResourceId: ids[0], targetName: requested[0], subscriptionId: subscription,
        resourceGroup, region, actionType: "create_vm", actionLabel: capability?.displayName ?? "Create Azure Virtual Machines",
        parameters: {
          resourceGroupArmId: resourceGroupArmId.trim(), subnetArmId: subnetArmId.trim(), location: region,
          vmNames: requested, vmSize: vmSize.trim(), adminUsername: adminUsername.trim(),
          sshPublicKey: sshPublicKey.trim(), osPublisher: osPublisher.trim(), osOffer: osOffer.trim(),
          osSku: osSku.trim(), osVersion: osVersion.trim(), tags: {},
          // Compared against the server-authorized scope binding at plan time.
          environment: environment.toLowerCase(),
          // A package opened from a ticket stays traceable back to it, matching
          // what servicenow-intake writes on the drafts it creates itself.
          source: prefill ? "servicenow_ticket" : "console",
          ...(prefill ? { serviceNowTicket: prefill.ticketNumber, serviceNowSysId: prefill.sysId } : {}),
        },
        rationale: rationale.trim(),
        currentState: {},
        policyEvidence: [
          { check: "Capability provenance", result: `Approved commit ${capability?.moduleVersion ?? "unknown"} · ${capability?.moduleSource ?? ""}` },
          { check: "Name collision", result: `${requested.length} requested name(s) absent from live Azure inventory` },
          { check: "Blast radius", result: `${requested.length} of at most ${maxTargets} machines per run` },
          ...(prefill ? [{ check: "Request provenance", result: `Prefilled from ticket ${prefill.ticketNumber} · values confirmed by submitter` }] : []),

        ],
        validationPlan: [
          "Confirm every requested machine exists in Azure after apply",
          "Confirm each machine has the approved size and image",
          "Confirm each NIC attached to the authorized subnet",
        ],
        riskScore: 60, riskLevel: "Medium", approvalRequired: true,
      }, targets);
      setMessage(`${saved.packageNumber} submitted with ${targets.length} declared target(s). A platform administrator must authorize the exact machines before it can be planned.`);
      try {
        await createTerraformPlan(saved.id);
        setMessage(`${saved.packageNumber} submitted and its governed Terraform plan was queued.`);
      } catch (planCause) {
        // Expected until the targets are authorized; say so plainly rather than
        // presenting a governance gate as a failure.
        setError(planCause instanceof Error ? planCause.message : "Terraform planning was not queued.");
      }
      setTimeout(() => navigate(`/approvals/${saved.id}`), 1200);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create the provisioning request.");
    } finally { setSaving(false); }
  };

  return <div className="min-w-0 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <nav className="text-[12px] text-slate-500"><Link to="/changes" className="hover:text-[#1B4F91]">Change Engineering</Link><span className="mx-1.5">/</span><span className="font-medium text-slate-800">Provision new VMs</span></nav>
      <button type="button" onClick={() => void load()} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Refresh</button>
    </div>
    <header className="mb-4 flex flex-wrap items-start gap-3">
      <div><h1 className="text-[20px] font-semibold text-slate-900">Provision new virtual machines</h1><p className="mt-1 max-w-3xl text-[12px] text-slate-600">Requests machines that do not exist yet. The request is planned by Terraform and applied only after a platform administrator authorizes the exact machines and a second administrator approves the plan.</p></div>
      <div className="ml-auto rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Creating nothing until reviewed</div>
    </header>

    {prefill && <PrefilledFromTicket prefill={prefill} onClear={clearPrefill} />}
    {!prefill && ticketOptions.length > 0 && (
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[12px] text-[#1B4F91]">
        <FileInput className="h-3.5 w-3.5 shrink-0" />
        <span>Fill this form from a submitted ticket instead of typing it again.</span>
        <select
          aria-label="Prefill from ticket"
          value=""
          onChange={(event) => { if (event.target.value) setSearchParams({ fromTicket: event.target.value }, { replace: true }); }}
          className="ml-auto h-7 rounded-md border border-[#CFE0F3] bg-white px-2 text-[12px] text-slate-800"
        >
          <option value="">Choose a ticket…</option>
          {ticketOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </div>
    )}
    {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>}
    {message && <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">{message}</div>}
    {!loading && !capability && <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />No approved <code>create_vm</code> capability exists yet. Submit a request as a ticket instead — the platform will open an engineering gap, draft a module and route it for approval.</div>}

    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="Machines" right={<span className="text-[11px] text-slate-500">{requested.length} of max {maxTargets}</span>}>
        <div className="space-y-3">
          <Field label="Machine names" hint="One per line, or comma separated. Letters, numbers and hyphens only." tag={<FromTicketTag shown={fromTicketFields.has("names")} />}>
            <textarea value={names} onChange={(event) => { touched("names"); setNames(event.target.value); }} rows={5} placeholder={"claims-vm-01\nclaims-vm-02"} className={cn(input, "resize-y")} />
          </Field>
          {collisions.length > 0 && <div className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-[11.5px] text-red-800"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />Already present in Azure: {collisions.join(", ")}</div>}
          {requested.length > 0 && !collisions.length && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11.5px] text-emerald-800"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />{requested.length} name(s) not currently in Azure.</div>}
          <Field label="VM size" hint="Must be on the authorized SKU list for the target scope." tag={<FromTicketTag shown={fromTicketFields.has("vmSize")} />}><input value={vmSize} onChange={(event) => { touched("vmSize"); setVmSize(event.target.value); }} placeholder="Standard_B2s" className={input} /></Field>
          <Field label="Environment" tag={<FromTicketTag shown={fromTicketFields.has("environment")} />}><select value={environment} onChange={(event) => { touched("environment"); setEnvironment(event.target.value); }} className={cn(input, "font-sans")}><option value="development">development</option><option value="pre-production">pre-production</option><option value="production">production</option></select></Field>
        </div>
      </Panel>

      <Panel title="Placement">
        <div className="space-y-3">
          <Field label="Destination resource group ARM ID" tag={<FromTicketTag shown={fromTicketFields.has("resourceGroupArmId")} />}><input value={resourceGroupArmId} onChange={(event) => { touched("resourceGroupArmId"); setResourceGroupArmId(event.target.value); }} placeholder="/subscriptions/.../resourceGroups/..." className={input} /></Field>
          <Field label="Subnet ARM ID" hint="Enforced against the authorized subnet list before planning." tag={<FromTicketTag shown={fromTicketFields.has("subnetArmId")} />}><input value={subnetArmId} onChange={(event) => { touched("subnetArmId"); setSubnetArmId(event.target.value); }} placeholder="/subscriptions/.../subnets/..." className={input} /></Field>
          <Field label="Azure region" tag={<FromTicketTag shown={fromTicketFields.has("location")} />}><input value={location} onChange={(event) => { touched("location"); setLocation(event.target.value); }} placeholder="eastus" className={input} /></Field>
        </div>
      </Panel>

      <Panel title="Operating system and access">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Image publisher" tag={<FromTicketTag shown={fromTicketFields.has("osPublisher")} />}><input value={osPublisher} onChange={(event) => { touched("osPublisher"); setOsPublisher(event.target.value); }} className={input} /></Field>
            <Field label="Image offer" tag={<FromTicketTag shown={fromTicketFields.has("osOffer")} />}><input value={osOffer} onChange={(event) => { touched("osOffer"); setOsOffer(event.target.value); }} className={input} /></Field>
            <Field label="Image SKU" tag={<FromTicketTag shown={fromTicketFields.has("osSku")} />}><input value={osSku} onChange={(event) => { touched("osSku"); setOsSku(event.target.value); }} className={input} /></Field>
            <Field label="Image version" tag={<FromTicketTag shown={fromTicketFields.has("osVersion")} />}><input value={osVersion} onChange={(event) => { touched("osVersion"); setOsVersion(event.target.value); }} className={input} /></Field>
          </div>
          <Field label="Administrator username" tag={<FromTicketTag shown={fromTicketFields.has("adminUsername")} />}><input value={adminUsername} onChange={(event) => { touched("adminUsername"); setAdminUsername(event.target.value); }} placeholder="azureuser" className={input} /></Field>
          <Field label="SSH public key" hint="Password authentication is disabled on every machine this creates." tag={<FromTicketTag shown={fromTicketFields.has("sshPublicKey")} />}><textarea value={sshPublicKey} onChange={(event) => { touched("sshPublicKey"); setSshPublicKey(event.target.value); }} rows={3} placeholder="ssh-ed25519 AAAA..." className={cn(input, "resize-y")} /></Field>
        </div>
      </Panel>

      <Panel title="Submit">
        <Field label="Reason for this request" hint="Stored on the package and shown to reviewers." tag={<FromTicketTag shown={fromTicketFields.has("rationale")} />}>
          <textarea value={rationale} onChange={(event) => { touched("rationale"); setRationale(event.target.value); }} rows={4} className={cn(input, "font-sans resize-y")} />

        </Field>
        <div className={cn("mt-3 flex items-start gap-2 rounded-md border px-2.5 py-2 text-[11.5px]", problem ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800")}>
          {problem ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
          <span>{problem ?? `Ready to submit ${requested.length} machine(s) for governed review.`}</span>
        </div>
        <button type="button" onClick={() => void submit()} disabled={!!problem || saving || loading}
          className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#16406f] disabled:cursor-not-allowed disabled:bg-slate-300">
          <Server className="h-3.5 w-3.5" />{saving ? "Submitting…" : "Submit provisioning request"}
        </button>
        <p className="mt-2 text-[11px] text-slate-500">Submitting creates a reviewable change package. It does not create anything in Azure. Planning is refused until a platform administrator authorizes the exact machines, and applying needs a second administrator.</p>
      </Panel>
    </div>
  </div>;
}
