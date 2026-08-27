import { Activity, AlertCircle, CheckCircle2, HardDrive, MemoryStick, Network, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AzureVmOperations } from "./azureControlPlane";

type Props = {
  data: AzureVmOperations | null;
  loading: boolean;
  error: string | null;
};

const stateTone = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
};

function statusTone(state: string) {
  if (["available", "enabled", "protected", "compliant"].includes(state)) return "good";
  if (["updates_available", "not_protected", "disabled"].includes(state)) return "warn";
  return "neutral";
}

function displayState(state: string) {
  return state.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Meter({ label, value }: { label: string; value: number | null }) {
  const tone = value === null ? "bg-slate-300" : value >= 90 ? "bg-red-500" : value >= 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
      <div className="flex items-baseline justify-between gap-2"><span className="text-[11px] text-slate-500">{label}</span><span className="text-[14px] font-semibold text-slate-900">{value === null ? "—" : `${value}%`}</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={cn("h-full rounded-full", tone)} style={{ width: `${value ?? 0}%` }} /></div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, state, details }: { icon: typeof ShieldCheck; label: string; state: string; details: string[] }) {
  const tone = statusTone(state);
  return (
    <div className="rounded-md border border-[#E2E8F0] p-2.5">
      <div className="flex items-center gap-1.5"><Icon className="h-4 w-4 text-[#1B4F91]" /><span className="text-[11.5px] font-semibold text-slate-800">{label}</span><span className={cn("ml-auto rounded border px-1.5 py-0.5 text-[10px] font-medium", stateTone[tone])}>{displayState(state)}</span></div>
      <div className="mt-2 space-y-1 text-[11px] text-slate-600">{details.map((detail) => <div key={detail}>{detail}</div>)}</div>
    </div>
  );
}

function NetworkValue({ label, values }: { label: string; values: string[] }) {
  return <div><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-[11.5px] font-medium text-slate-800">{values.length ? values.join(", ") : "Not reported"}</div></div>;
}

/** Azure-only VM operations data rendered from the protected control-plane API. */
export function VmOperationsOverview({ data, loading, error }: Props) {
  if (loading) return <section className="mt-2 rounded-md border border-[#E2E8F0] bg-white p-3 text-[12px] text-slate-500">Loading VM operations data from Azure…</section>;

  if (!data) return (
    <section className="mt-2 rounded-md border border-[#E2E8F0] bg-white p-3">
      <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" /><h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">VM Operations</h2></div>
      <p className="mt-1.5 text-[12px] text-slate-600">{error ?? "Azure Monitor, Backup, Update Manager, and network topology data are not available for this VM."}</p>
      <p className="mt-1 text-[11px] text-slate-500">This view is read-only and reports only Azure data available for the selected VM.</p>
    </section>
  );

  return (
    <section className="mt-2 rounded-md border border-[#E2E8F0] bg-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] px-3 py-2"><Activity className="h-4 w-4 text-[#1B4F91]" /><h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-700">VM Operations</h2><span className="ml-auto text-[10.5px] text-slate-500">Azure observation {data.observedAt ?? "time not reported"}</span></header>
      <div className="grid gap-3 p-3 xl:grid-cols-[1.1fr_1fr_1.35fr]">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-800"><Activity className="h-3.5 w-3.5 text-[#1B4F91]" />Performance</div>
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1"><Meter label="CPU utilization" value={data.monitoring.cpuPercent} /><Meter label="Memory utilization" value={data.monitoring.memoryPercent} /><Meter label="Disk used" value={data.monitoring.diskUsedPercent} /></div>
          <div className="mt-2 text-[10.5px] text-slate-500">Azure Monitor: {displayState(data.monitoring.state)}</div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-800"><ShieldCheck className="h-3.5 w-3.5 text-[#1B4F91]" />Protection & maintenance</div>
          <div className="space-y-2">
            <StatusCard icon={Activity} label="Boot diagnostics" state={data.bootDiagnostics.state} details={[`Screenshot: ${data.bootDiagnostics.screenshotAvailable ? "available" : "not available"}`, `Console log: ${data.bootDiagnostics.consoleLogAvailable ? "available" : "not available"}`]} />
            <StatusCard icon={HardDrive} label="Azure Backup" state={data.backup.state} details={[`Vault: ${data.backup.vaultName ?? "Not reported"}`, `Last successful backup: ${data.backup.lastSuccessfulBackup ?? "Not reported"}`]} />
            <StatusCard icon={Wrench} label="Patch assessment" state={data.patching.state} details={[data.patching.assessment ?? "No assessment result reported", data.patching.updatesAvailable === null ? "Updates: not reported" : `Updates available: ${data.patching.updatesAvailable}`]} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-800"><Network className="h-3.5 w-3.5 text-[#1B4F91]" />Network topology</div>
          <div className="grid gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 sm:grid-cols-2">
            <NetworkValue label="Network interface" values={data.network.networkInterface ? [data.network.networkInterface] : []} />
            <NetworkValue label="Subnet" values={data.network.subnet ? [data.network.subnet] : []} />
            <NetworkValue label="Private IPs" values={data.network.privateIps} />
            <NetworkValue label="Public IPs" values={data.network.publicIps} />
            <NetworkValue label="Network security groups" values={data.network.networkSecurityGroups} />
            <NetworkValue label="Load balancers" values={data.network.loadBalancers} />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-500"><MemoryStick className="h-3.5 w-3.5" />Topology is read from Azure Resource Manager / Resource Graph.</div>
        </div>
      </div>
    </section>
  );
}
