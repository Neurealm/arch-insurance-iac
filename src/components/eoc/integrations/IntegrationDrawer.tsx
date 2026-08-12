import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, ShieldAlert, Copy, KeyRound,
  Play, ShieldCheck, PowerOff, FileDown, X, Lock, RefreshCcw,
} from "lucide-react";
import { Profile, ValidationStep, IntegrationStatus, profiles } from "./profiles";
import { toast } from "@/hooks/use-toast";

type Section = "overview" | "connection" | "authentication" | "access" | "events" | "agent" | "validation" | "audit";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "connection", label: "Connection" },
  { id: "authentication", label: "Authentication" },
  { id: "access", label: "Access" },
  { id: "events", label: "Events" },
  { id: "agent", label: "Agent Authority" },
  { id: "validation", label: "Validation" },
  { id: "audit", label: "Audit" },
];

const statusChip: Record<IntegrationStatus, string> = {
  "Connected": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-800 border-amber-200",
  "Not Connected": "bg-rose-50 text-rose-800 border-rose-200",
  "Degraded": "bg-orange-50 text-orange-800 border-orange-200",
  "Authentication Failed": "bg-rose-50 text-rose-800 border-rose-200",
  "Permission Failed": "bg-rose-50 text-rose-800 border-rose-200",
  "Validation Required": "bg-sky-50 text-sky-800 border-sky-200",
  "Disabled": "bg-slate-100 text-slate-700 border-slate-200",
};

const stepIcon = (s: ValidationStep["status"]) => {
  switch (s) {
    case "Passed": return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "Failed": return <XCircle className="h-4 w-4 text-rose-600" />;
    case "Warning": return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "Running": return <RefreshCcw className="h-4 w-4 text-sky-600 animate-spin" />;
    default: return <Clock className="h-4 w-4 text-slate-400" />;
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
  profileKey: string | null;
  onStatusChange?: (key: string, next: IntegrationStatus) => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function IntegrationDrawer({ open, onClose, profileKey, onStatusChange, triggerRef }: Props) {
  const seed = profileKey ? profiles[profileKey] : null;
  const [section, setSection] = useState<Section>("overview");
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(seed);
  const [runningSteps, setRunningSteps] = useState<ValidationStep[] | null>(null);
  const firstFieldRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && seed) {
      setProfile(seed);
      setSection("overview");
      setDirty(false);
      setRunningSteps(null);
      setTimeout(() => firstFieldRef.current?.focus(), 40);
    }
  }, [open, seed]);

  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else finalizeClose();
  };
  const finalizeClose = () => {
    setConfirmClose(false);
    onClose();
    setTimeout(() => triggerRef?.current?.focus(), 30);
  };

  const runTestConnection = () => {
    if (!profile) return;
    const seq = profile.validation.map((s) => ({ ...s, status: "Pending" as const }));
    setRunningSteps(seq);
    profile.validation.forEach((step, i) => {
      setTimeout(() => {
        setRunningSteps((cur) => {
          if (!cur) return cur;
          const copy = [...cur];
          copy[i] = { ...copy[i], status: "Running" };
          return copy;
        });
      }, 250 * i);
      setTimeout(() => {
        setRunningSteps((cur) => {
          if (!cur) return cur;
          const copy = [...cur];
          copy[i] = step;
          return copy;
        });
        if (i === profile.validation.length - 1) {
          const anyFailed = profile.validation.some((s) => s.status === "Failed");
          const next: IntegrationStatus = anyFailed ? "Permission Failed" : "Connected";
          onStatusChange?.(profile.key, next);
          toast({ title: `Test complete — ${next}`, description: `${profile.validation.length} steps executed for ${profile.app}.` });
        }
      }, 250 * i + 400);
    });
  };

  const shownSteps = runningSteps ?? profile?.validation ?? [];

  const initials = useMemo(() => (profile?.app.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase(), [profile]);

  if (!profile) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) requestClose(); }}>
        <SheetContent
          side="right"
          className="w-full sm:w-[720px] sm:max-w-[720px] p-0 bg-white flex flex-col"
          onEscapeKeyDown={(e) => { e.preventDefault(); requestClose(); }}
        >
          {/* Sticky header */}
          <SheetHeader className="border-b border-slate-200 px-5 py-3 shrink-0 space-y-0">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-lg bg-slate-900 text-white grid place-items-center text-xs font-bold shrink-0">{initials}</div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-[15px] leading-tight text-slate-900 truncate">{profile.app}</SheetTitle>
                <div className="mt-0.5 text-[11px] text-slate-500 truncate">{profile.category} · {profile.profileName}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusChip[profile.status])}>{profile.status}</span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">{profile.environment}</span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">Last validated {profile.lastValidatedAt}</span>
                </div>
              </div>
              <button
                ref={firstFieldRef}
                type="button"
                onClick={requestClose}
                aria-label="Close drawer"
                className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          {/* Body: sidebar + content */}
          <div className="flex flex-1 min-h-0">
            <nav aria-label="Profile sections" className="hidden sm:block w-44 shrink-0 border-r border-slate-200 bg-slate-50/60 p-2 overflow-y-auto">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "w-full text-left rounded px-2.5 py-1.5 text-[12px] font-medium transition",
                    section === s.id ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-white",
                  )}
                >{s.label}</button>
              ))}
            </nav>
            <div className="flex sm:hidden overflow-x-auto border-b border-slate-200">
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => setSection(s.id)} className={cn("px-3 py-2 text-xs whitespace-nowrap", section === s.id ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold" : "text-slate-600")}>{s.label}</button>
              ))}
            </div>

            <main className="flex-1 overflow-y-auto px-5 py-4">
              {section === "overview" && <Overview profile={profile} onDirty={() => setDirty(true)} />}
              {section === "connection" && <Groups groups={profile.connectionGroups} />}
              {section === "authentication" && <Groups groups={profile.authenticationGroups} auth />}
              {section === "access" && <Scopes profile={profile} />}
              {section === "events" && <Events profile={profile} />}
              {section === "agent" && <Agent profile={profile} />}
              {section === "validation" && <Validation profile={profile} steps={shownSteps} onRun={runTestConnection} />}
              {section === "audit" && <Audit profile={profile} />}
            </main>
          </div>

          {/* Sticky action footer */}
          <div className="border-t border-slate-200 bg-white px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <ActionBtn icon={Play} onClick={runTestConnection} tone="indigo">Test Connection</ActionBtn>
              <ActionBtn icon={ShieldCheck} onClick={() => toast({ title: "Permissions validated", description: `${profile.scopes.filter(s=>s.granted).length}/${profile.scopes.length} granted · ${profile.scopes.filter(s=>s.requested && !s.granted).length} missing.` })}>Validate Permissions</ActionBtn>
              <ActionBtn icon={KeyRound} onClick={() => toast({ title: "Replace credential", description: "Secure credential handler opened." })}>Replace Credential</ActionBtn>
              <ActionBtn icon={Copy} onClick={() => toast({ title: "Profile duplicated", description: `${profile.profileName}-copy created as draft.` })}>Duplicate</ActionBtn>
              <ActionBtn icon={PowerOff} onClick={() => { onStatusChange?.(profile.key, "Disabled"); toast({ title: "Profile disabled" }); }}>Disable</ActionBtn>
              <ActionBtn icon={FileDown} onClick={() => toast({ title: "Sanitized configuration exported", description: "Secrets replaced with references." })}>Export</ActionBtn>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { setDirty(false); toast({ title: "Draft saved", description: "Status set to In Progress. Connection is not yet marked Connected." }); onStatusChange?.(profile.key, "In Progress"); }} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Save Draft</button>
              <button onClick={() => { setDirty(false); toast({ title: "Profile saved", description: "Schema validated. Run Test Connection to update status." }); }} className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Save Profile</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved profile changes. Closing now will lose them.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={finalizeClose} className="bg-rose-600 hover:bg-rose-700">Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ActionBtn({ icon: Icon, children, onClick, tone }: { icon: any; children: React.ReactNode; onClick?: () => void; tone?: "indigo" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-semibold border",
        tone === "indigo" ? "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

/* ------------------------------- Sections ------------------------------- */

function Overview({ profile, onDirty }: { profile: Profile; onDirty: () => void }) {
  const rows: [string, string][] = [
    ["Profile name", profile.profileName],
    ["Application", profile.app],
    ["Connector type", profile.connectorType],
    ["Environment", profile.environment],
    ["Business owner", profile.businessOwner],
    ["Technical owner", profile.technicalOwner],
    ["Support group", profile.supportGroup],
    ["Data classification", profile.dataClassification],
    ["Connection direction", profile.direction],
    ["Agent operating mode", profile.agentMode],
    ["Connector version", profile.connectorVersion],
    ["Connector health", profile.status],
    ["Last successful connection", profile.lastSuccessfulAt],
    ["Last credential validation", profile.lastValidatedAt],
    ["Created", `${profile.createdBy} · ${profile.createdAt}`],
    ["Last modified", `${profile.modifiedBy} · ${profile.modifiedAt}`],
  ];
  return (
    <div className="space-y-4">
      <SectionHeader title="Overview" hint="Non-secret profile metadata." />
      <p className="text-[12px] leading-relaxed text-slate-600 bg-slate-50 border border-slate-200 rounded p-3">{profile.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 py-1 border-b border-dashed border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 shrink-0">{k}</span>
            <span className="text-[12px] text-slate-900 text-right break-all">{v}</span>
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-[12px] text-slate-700">
        <input type="checkbox" defaultChecked={profile.status !== "Disabled"} onChange={onDirty} className="accent-indigo-600" />
        Enabled
      </label>
    </div>
  );
}

function Groups({ groups, auth }: { groups: Profile["connectionGroups"]; auth?: boolean }) {
  if (!groups.length) return <Empty>No fields for this section on this connector.</Empty>;
  return (
    <div className="space-y-5">
      <SectionHeader title={auth ? "Authentication" : "Connection"} hint={auth ? "Machine identity + secret references. Stored values are not returned." : "Product-specific connection interfaces and endpoints."} />
      {groups.map((g) => (
        <div key={g.title} className="rounded border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[12px] font-semibold text-slate-900">{g.title}</div>
            {g.hint && <div className="text-[11px] text-slate-600 mt-0.5">{g.hint}</div>}
          </div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {g.fields.map((f) => (
              <div key={f.label} className="min-w-0">
                <div className="text-[10.5px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  {f.secret && <Lock className="h-3 w-3" aria-hidden />}
                  {f.label}
                </div>
                <div className={cn(
                  "mt-0.5 text-[12px] break-all",
                  f.mono || f.secret ? "font-mono" : "",
                  f.secret ? "text-slate-500" : "text-slate-900",
                )}>
                  {f.secret ? (f.masked || "Stored securely") : (f.value ?? "—")}
                </div>
                {f.hint && <div className="text-[10.5px] text-slate-500 mt-0.5">{f.hint}</div>}
                {f.secret && (
                  <div className="mt-1 flex gap-1.5">
                    <button className="text-[10.5px] font-semibold text-indigo-700 hover:underline">Replace</button>
                    <span className="text-slate-300">·</span>
                    <button className="text-[10.5px] font-semibold text-rose-700 hover:underline">Remove</button>
                    <span className="text-slate-300">·</span>
                    <button className="text-[10.5px] font-semibold text-slate-700 hover:underline">Validate</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Scopes({ profile }: { profile: Profile }) {
  const missing = profile.scopes.filter((s) => s.requested && !s.granted).length;
  const excessive = profile.scopes.filter((s) => s.granted && !s.requested).length;
  return (
    <div className="space-y-3">
      <SectionHeader title="Access — Authorization scopes" hint="Authentication success does not imply authorization." />
      <div className="flex flex-wrap gap-2 text-[11px]">
        <Pill>{profile.scopes.filter((s) => s.granted).length} granted</Pill>
        <Pill tone={missing > 0 ? "rose" : "slate"}>{missing} missing</Pill>
        <Pill tone={excessive > 0 ? "amber" : "slate"}>{excessive} excessive</Pill>
        <Pill tone="rose">{profile.scopes.filter((s) => s.risk === "high").length} high-risk</Pill>
      </div>
      {profile.scopesNote && <div className="text-[11px] text-slate-600 bg-amber-50 border border-amber-200 rounded p-2 flex gap-2"><AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />{profile.scopesNote}</div>}
      <div className="rounded border border-slate-200 divide-y divide-slate-200">
        {profile.scopes.map((s) => (
          <div key={s.name} className="px-3 py-2 flex items-start gap-3">
            <div className="mt-0.5">
              {s.granted ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : s.requested ? <XCircle className="h-4 w-4 text-rose-600" /> : <Clock className="h-4 w-4 text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[12px] text-slate-900 break-all">{s.name}</span>
                {s.risk === "high" && <span className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800"><ShieldAlert className="h-3 w-3" /> High risk</span>}
                {s.risk === "warn" && <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Write</span>}
              </div>
              {s.boundary && <div className="text-[11px] text-slate-600 mt-0.5">Boundary: <span className="font-mono">{s.boundary}</span></div>}
            </div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wide shrink-0">
              {s.granted ? <span className="text-emerald-700">Granted</span> : s.requested ? <span className="text-rose-700">Missing</span> : <span className="text-slate-500">Not requested</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Events({ profile }: { profile: Profile }) {
  if (!profile.events.length) return <Empty>This connector does not use event ingestion or webhooks.</Empty>;
  return (
    <div className="space-y-3">
      <SectionHeader title="Event ingestion & webhooks" hint="Distinct from API credentials. Test event delivery separately." />
      {profile.eventNotes?.map((n, i) => <div key={i} className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded p-2">{n}</div>)}
      <div className="rounded border border-slate-200 divide-y divide-slate-200">
        {profile.events.map((e, i) => (
          <div key={i} className="px-3 py-2 grid grid-cols-12 items-center gap-2">
            <div className="col-span-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Interface</div>
              <div className="text-[12px] text-slate-900">{e.interface}</div>
            </div>
            <div className="col-span-5 min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Event / cursor</div>
              <div className="font-mono text-[11.5px] text-slate-900 break-all">{e.eventType}</div>
              {e.callback && <div className="font-mono text-[10.5px] text-slate-500 break-all">→ {e.callback}</div>}
            </div>
            <div className="col-span-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Last</div>
              <div className="text-[11px] text-slate-700">{e.lastEventAt ?? "—"}</div>
            </div>
            <div className="col-span-2 text-right">
              <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", e.lastStatus === "OK" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : e.lastStatus === "Failed" ? "bg-rose-50 text-rose-800 border-rose-200" : e.lastStatus === "Retrying" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200")}>{e.lastStatus ?? (e.enabled ? "Idle" : "Off")}</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => toast({ title: "Test event delivered", description: "Synthetic event fired through the configured interface." })} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Test Event Delivery</button>
    </div>
  );
}

function Agent({ profile }: { profile: Profile }) {
  const a = profile.agentAuthority;
  return (
    <div className="space-y-4">
      <SectionHeader title="Agent operating authority" hint="Possession of an API credential is not authorization for autonomous execution." />
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        {(["Observe","Recommend","Execute with Approval","Autonomous Execute"] as const).map((m) => (
          <label key={m} className={cn("flex items-start gap-2 rounded border p-2 cursor-pointer", profile.agentMode === m ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white")}>
            <input type="radio" name="mode" defaultChecked={profile.agentMode === m} className="mt-0.5 accent-indigo-600" />
            <div>
              <div className="font-semibold text-slate-900">{m}</div>
              <div className="text-[11px] text-slate-600">
                {m === "Observe" && "Read data only."}
                {m === "Recommend" && "Read data and create proposed actions."}
                {m === "Execute with Approval" && "Perform approved actions using a separate execution identity."}
                {m === "Autonomous Execute" && "Perform allowlisted, reversible actions within policy thresholds."}
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="rounded border border-slate-200 divide-y divide-slate-200">
        {[
          ["Execution credential", a.executionCredential],
          ["Resource boundary", a.resourceBoundary],
          ["Approval policy", a.approvalPolicy],
          ["Max actions / hour", String(a.maxActionsPerHour)],
          ["Change window", a.changeWindow],
          ["Rollback method", a.rollbackMethod],
          ["Post-action validation", a.postActionValidation],
        ].map(([k, v]) => (
          <div key={k} className="px-3 py-1.5 flex items-center justify-between text-[12px]">
            <span className="text-slate-500">{k}</span>
            <span className="text-slate-900 text-right">{v}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded border border-emerald-200 bg-emerald-50/40 p-2">
          <div className="text-[10.5px] font-semibold uppercase text-emerald-800">Allowed actions</div>
          <ul className="mt-1 space-y-0.5 font-mono text-[11.5px] text-slate-800">
            {a.allowedActions.length ? a.allowedActions.map((x) => <li key={x}>+ {x}</li>) : <li className="text-slate-500">— none —</li>}
          </ul>
        </div>
        <div className="rounded border border-rose-200 bg-rose-50/40 p-2">
          <div className="text-[10.5px] font-semibold uppercase text-rose-800">Prohibited actions</div>
          <ul className="mt-1 space-y-0.5 font-mono text-[11.5px] text-slate-800">
            {a.prohibitedActions.map((x) => <li key={x}>− {x}</li>)}
          </ul>
        </div>
      </div>
      <button onClick={() => toast({ title: "Emergency disable armed", description: "Agent authority immediately downgraded to Observe." })} className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">Emergency Disable</button>
    </div>
  );
}

function Validation({ profile, steps, onRun }: { profile: Profile; steps: ValidationStep[]; onRun: () => void }) {
  const failed = steps.filter((s) => s.status === "Failed").length;
  const warned = steps.filter((s) => s.status === "Warning").length;
  return (
    <div className="space-y-3">
      <SectionHeader title="Test Connection results" hint="Authentication, authorization, endpoint, and data-access failures are separated." />
      <div className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 p-2 text-[11px]">
        <div className="flex flex-wrap gap-2">
          <Pill tone="slate">Endpoint reached</Pill>
          <Pill tone="emerald">TLS 1.3</Pill>
          <Pill tone={failed ? "rose" : "emerald"}>{failed ? "Authorization failures" : "Authorization OK"}</Pill>
          <Pill tone={warned ? "amber" : "slate"}>{warned} warnings</Pill>
          <Pill tone="slate">Correlation corr_{Math.random().toString(16).slice(2, 8)}</Pill>
        </div>
        <button onClick={onRun} className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"><Play className="h-3 w-3" /> Run</button>
      </div>
      <ol className="rounded border border-slate-200 divide-y divide-slate-200">
        {steps.map((s, i) => (
          <li key={i} className="px-3 py-2 flex items-start gap-2">
            {stepIcon(s.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-slate-900">{s.label}</span>
                {s.latencyMs && <span className="font-mono text-[10.5px] text-slate-500">{s.latencyMs}ms</span>}
              </div>
              {s.detail && <div className="text-[11px] text-slate-600 mt-0.5 font-mono break-all">{s.detail}</div>}
            </div>
            <span className={cn("text-[10.5px] font-semibold uppercase tracking-wide shrink-0",
              s.status === "Passed" && "text-emerald-700",
              s.status === "Failed" && "text-rose-700",
              s.status === "Warning" && "text-amber-700",
              s.status === "Running" && "text-sky-700",
              s.status === "Pending" && "text-slate-500",
            )}>{s.status}</span>
          </li>
        ))}
      </ol>
      <div className="text-[10.5px] text-slate-500">Validated {profile.lastValidatedAt} · No secrets are revealed in test output.</div>
    </div>
  );
}

function Audit({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-3">
      <SectionHeader title="Audit history" hint="Immutable timeline. Every action carries actor, result, and correlation." />
      <ol className="rounded border border-slate-200 divide-y divide-slate-200">
        {profile.audit.map((a, i) => (
          <li key={i} className="px-3 py-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-[10.5px] text-slate-500">{a.ts}</span>
              <span className="text-[12px] font-semibold text-slate-900">{a.action}</span>
              <span className={cn("rounded border px-1.5 py-0 text-[10px] font-semibold", a.result === "OK" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : a.result === "Failed" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200")}>{a.result}</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">by <span className="font-mono">{a.actor}</span>{a.correlation ? <> · corr <span className="font-mono">{a.correlation}</span></> : null}{a.approval ? <> · approval <span className="font-mono">{a.approval}</span></> : null}</div>
            {a.changed?.length ? <div className="mt-0.5 text-[11px] text-slate-600">changed: <span className="font-mono">{a.changed.join(", ")}</span></div> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------- Helpers -------------------------------- */

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
      {hint && <p className="text-[11px] text-slate-600 mt-0.5">{hint}</p>}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] text-slate-500 border border-dashed border-slate-200 rounded p-4 text-center">{children}</div>;
}
function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "rose" | "amber" | "emerald" }) {
  const cls = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", cls)}>{children}</span>;
}
