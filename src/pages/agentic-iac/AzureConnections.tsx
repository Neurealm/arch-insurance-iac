import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Cloud, KeyRound, Link2, RefreshCw, Server, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { AzureControlPlaneError, azureControlPlaneUrl, getAzureScopes } from "./azureControlPlane";

type State = "checking" | "connected" | "attention";

function valueFrom(scopes: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = scopes[key];
    if (typeof value === "string" && value) return value;
  }
  return "Not reported";
}

export default function AzureConnections() {
  const { user, session, isAdmin, approvalStatus, loading } = useAuth();
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);
  const [scopes, setScopes] = useState<Record<string, unknown>>({});

  const checkConnections = useCallback(async () => {
    if (!session?.access_token) {
      setState("attention");
      setError("Sign in to validate Azure access.");
      return;
    }
    setState("checking");
    setError(null);
    try {
      setScopes(await getAzureScopes());
      setState("connected");
    } catch (reason) {
      setState("attention");
      setError(reason instanceof AzureControlPlaneError ? reason.message : "The Azure control plane could not be reached from this browser.");
    }
  }, [session?.access_token]);

  useEffect(() => { void checkConnections(); }, [checkConnections]);

  const endpointHost = useMemo(() => new URL(azureControlPlaneUrl).host, []);
  const statusLabel = state === "connected" ? "Connected" : state === "checking" ? "Checking" : "Needs attention";
  const statusClass = state === "connected" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : state === "checking" ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Intelligent Infrastructure as Code</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">Connections</h1>
          <p className="mt-1 max-w-2xl text-[13px] text-slate-600">Confirm who is signed in and whether the platform can safely read the Azure pilot environment.</p>
        </div>
        <button type="button" onClick={() => void checkConnections()} disabled={state === "checking"} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={cn("h-3.5 w-3.5", state === "checking" && "animate-spin")} />Check connections</button>
      </div>

      <section className="mt-4 rounded-md border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2"><Link2 className="h-4 w-4 text-[#1B4F91]" /><h2 className="text-[13px] font-semibold text-slate-900">Pilot connection path</h2><StatusPill label={statusLabel} className={statusClass} /></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ConnectionStep icon={UserRound} title="Signed-in user" value={user?.email ?? (loading ? "Loading session" : "Not signed in")} note={user ? `Supabase session active · ${isAdmin ? "Platform administrator" : "Standard platform user"}` : "User authentication is required before Azure can be queried."} state={user ? "connected" : "attention"} />
          <ConnectionStep icon={Server} title="Azure control plane" value={endpointHost} note={state === "connected" ? "Authenticated API check passed." : error ?? "Checking the protected Azure Function App."} state={state} />
          <ConnectionStep icon={Cloud} title="Azure pilot scope" value={valueFrom(scopes, ["resourceGroup", "resource_group", "pilotResourceGroup"])} note={state === "connected" ? `Subscription: ${valueFrom(scopes, ["subscriptionId", "subscription_id", "subscription"])}` : "The Function App uses Managed Identity; Azure credentials are not exposed to the app."} state={state} />
        </div>
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-md border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#1B4F91]" /><h2 className="text-[13px] font-semibold text-slate-900">Current user</h2></div>
          <dl className="mt-3 divide-y divide-slate-100 text-[12px]">
            <Row label="Email" value={user?.email ?? "Not signed in"} />
            <Row label="User ID" value={user?.id ?? "Not available"} mono />
            <Row label="Session" value={session ? "Active" : "Not active"} good={!!session} />
            <Row label="Platform role" value={isAdmin ? "Platform administrator" : "Standard platform user"} />
            <Row label="Approval status" value={approvalStatus ?? "Not set"} />
          </dl>
        </section>

        <section className="rounded-md border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#1B4F91]" /><h2 className="text-[13px] font-semibold text-slate-900">Security boundary</h2></div>
          <div className="mt-3 space-y-2 text-[12px] text-slate-600">
            <p><span className="font-medium text-slate-800">Supabase:</span> identifies the signed-in user and supplies a short-lived access token.</p>
            <p><span className="font-medium text-slate-800">Azure Function App:</span> validates the user token before it returns Azure resources.</p>
            <p><span className="font-medium text-slate-800">Managed Identity:</span> reads Azure resources without putting Azure passwords or keys in this application.</p>
          </div>
        </section>
      </div>

      {error && <section className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><div><span className="font-semibold">Connection check failed.</span> {error}</div></section>}
    </div>
  );
}

function StatusPill({ label, className }: { label: string; className: string }) { return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium ring-1", className)}>{label}</span>; }
function ConnectionStep({ icon: Icon, title, value, note, state }: { icon: typeof Cloud; title: string; value: string; note: string; state: State }) { const good = state === "connected"; return <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#1B4F91]" /><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</span></div><div className="mt-2 break-all text-[12.5px] font-semibold text-slate-900">{value}</div><div className={cn("mt-1 text-[11.5px]", good ? "text-emerald-700" : state === "attention" ? "text-amber-700" : "text-slate-500")}>{note}</div></div>; }
function Row({ label, value, mono = false, good = false }: { label: string; value: string; mono?: boolean; good?: boolean }) { return <div className="flex items-center justify-between gap-4 py-2"><dt className="shrink-0 text-slate-500">{label}</dt><dd className={cn("min-w-0 truncate text-right font-medium", mono && "font-mono text-[11px]", good ? "text-emerald-700" : "text-slate-800")} title={value}>{value}</dd></div>; }
