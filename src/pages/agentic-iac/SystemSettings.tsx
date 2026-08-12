import { useMemo, useState } from "react";
import {
  ChevronRight, X, Save, BookOpen, Activity, Gauge, ShieldCheck, ShieldAlert, AlertTriangle,
  CheckCircle2, XCircle, Download, RefreshCw, Play, History, Server, Boxes, FlaskConical,
  Bell, Cpu, Wrench, Info, Undo2, GitCompare, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BASE_SETTINGS, CATEGORIES, PLATFORM_INFO, healthRows, overallHealth, capabilityImpact,
  HEALTH_SCENARIOS, DIAGNOSTICS, LICENSE_USAGE, USAGE_BY_CAPABILITY, RELEASE_INFO,
  UPDATE_CHECK_STEPS, UPDATE_WORKFLOW, SAVE_STEPS, PRECEDENCE, INHERITANCE_CHAIN,
  ENVIRONMENTS, ENV_OVERRIDES, SQL_EBS_CONFIG, STAGE_TRACE, CONFIG_SCENARIOS, SCHEDULES,
  FEATURES, READINESS, READINESS_OUTSTANDING, PILOT_READINESS, RUNNERS, CHANGE_LOG_SEED,
  CONFIG_SNAPSHOT, DEMO_STORY, sensitivityOf,
  type Category, type SettingValue, type SystemSetting, type SystemHealthScenario, type ConfigurationScenario,
} from "./platform/settingsData";

/* ── primitives ── */

function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-[#E2E8F0] bg-white", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-600">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

function Pill({ tone = "neutral", children }: { tone?: "ok" | "warn" | "bad" | "info" | "neutral"; children: React.ReactNode }) {
  const tones = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warn: "bg-amber-50 text-amber-700 ring-amber-200",
    bad: "bg-rose-50 text-rose-700 ring-rose-200",
    info: "bg-[#EFF4FB] text-[#1B4F91] ring-[#CFE0F3]",
    neutral: "bg-slate-50 text-slate-600 ring-slate-200",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}

function Drawer({ open, title, subtitle, onClose, children, wide }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <button aria-label="Close" onClick={onClose} className="flex-1 bg-slate-900/25" />
      <aside className={cn("flex h-full flex-col border-l border-[#E2E8F0] bg-white shadow-xl", wide ? "w-[720px]" : "w-[540px]")}>
        <header className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-3.5">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close panel" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-4">
      <div className="w-full max-w-[560px] rounded-lg border border-[#E2E8F0] bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
          <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-1.5 text-[12px] last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-4 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-500 first:mt-0">{children}</div>;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-[#1B4F91]" : "bg-slate-300", disabled && "cursor-not-allowed opacity-50")}>
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", checked ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

const TAB_ICONS: Record<Category, typeof Gauge> = {
  General: Gauge, "Security & Compliance": ShieldCheck, "Execution & Runners": Play,
  "Data & Storage": Boxes, Notifications: Bell, "AI & Model": Cpu,
  "Discovery & Inventory": Activity, "Validation & Evidence": ClipboardIcon(), Integrations: Server, Maintenance: Wrench,
};
function ClipboardIcon() { return ShieldCheck; }

/* ── page ── */

export default function SystemSettings() {
  const [tab, setTab] = useState<Category>("General");
  const [environment, setEnvironment] = useState("Global");
  const [healthScenario, setHealthScenario] = useState<SystemHealthScenario>("healthy");
  const [configScenario, setConfigScenario] = useState<ConfigurationScenario>("production_baseline");
  const [settings, setSettings] = useState<SystemSetting[]>(BASE_SETTINGS);
  const [unsaved, setUnsaved] = useState<Record<string, SettingValue>>({});
  const [changeLog, setChangeLog] = useState(CHANGE_LOG_SEED);

  const [diagOpen, setDiagOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [sqlTraceOpen, setSqlTraceOpen] = useState(false);
  const [precedenceOpen, setPrecedenceOpen] = useState(false);
  const [capabilityOpen, setCapabilityOpen] = useState(false);
  const [featureDrawer, setFeatureDrawer] = useState<(typeof FEATURES)[number] | null>(null);
  const [blocked, setBlocked] = useState<{ title: string; reason: string; policy?: string } | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saveStep, setSaveStep] = useState<number | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [updateStep, setUpdateStep] = useState<number | null>(null);
  const [updateResult, setUpdateResult] = useState<string | null>(null);
  const [notifResult, setNotifResult] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [stage, setStage] = useState(STAGE_TRACE[0].stage);

  const health = healthRows(healthScenario);
  const overall = overallHealth(healthScenario);
  const impacts = capabilityImpact(healthScenario);
  const executionActive = healthScenario === "healthy";

  const effective = useMemo(
    () => settings.map((x) => (x.id in unsaved ? { ...x, value: unsaved[x.id] } : x)),
    [settings, unsaved],
  );
  const dirty = Object.keys(unsaved);
  const changedSettings = effective.filter((x) => dirty.includes(x.id));
  const securityCount = changedSettings.filter((x) => x.sensitive).length;
  const execCount = changedSettings.filter((x) => x.executionSensitive).length;

  function setValue(setting: SystemSetting, value: SettingValue) {
    if (setting.policyControlled && (value === true) && setting.id === "beh.destructive") {
      setBlocked({ title: "POLICY OVERRIDE PREVENTED", reason: "A system default cannot weaken enforced governance policy. Destructive actions remain prohibited.", policy: "Destructive-Action-v2.1 · Effective behavior: Prohibited" });
      return;
    }
    if (setting.policyControlled && value === false) {
      setBlocked({ title: "POLICY OVERRIDE PREVENTED", reason: `${setting.name} is required by an enforced governance policy and cannot be disabled from platform defaults.`, policy: setting.policyRef });
      return;
    }
    setUnsaved((u) => ({ ...u, [setting.id]: value }));
  }

  function disableFeature(f: (typeof FEATURES)[number]) {
    if (f.dependents.length) {
      setBlocked({ title: "DEPENDENCY WARNING", reason: `${f.name} is required by: ${f.dependents.join(", ")}. Disable dependent capabilities first.` });
      return;
    }
    setBlocked({ title: "CHANGE BLOCKED", reason: `${f.name} cannot be disabled in the current configuration.` });
  }

  function attemptDisableValidationEngine() {
    if (executionActive) {
      setBlocked({ title: "CHANGE BLOCKED", reason: "Validation Engine is required by an active execution package (CP-2026-01842). Schedule the change after active workflows complete, or cancel." });
      return;
    }
    setBlocked({ title: "CHANGE ALLOWED", reason: "No active production execution. The change can be scheduled." });
  }

  function runSave() {
    if (!dirty.length) return;
    setSaveBanner(null);
    setSaveStep(0);
    SAVE_STEPS.forEach((_, i) => setTimeout(() => setSaveStep(i), i * 240));
    setTimeout(() => {
      setSaveStep(null);
      if (securityCount || execCount) setReviewOpen(true);
      else applySettings("Routine configuration update");
    }, SAVE_STEPS.length * 240 + 200);
  }

  function applySettings(why: string) {
    const entries = changedSettings.map((x) => ({
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actor: "jane.smith", section: x.category, setting: x.name,
      prev: String(settings.find((s) => s.id === x.id)?.value), next: String(x.value),
      reason: why, status: "Applied", sensitivity: sensitivityOf(x),
      evidence: `CFG-EV-00${319 + Math.floor(Math.random() * 40)}`,
    }));
    setSettings((prev) => prev.map((x) => (x.id in unsaved ? { ...x, value: unsaved[x.id] } : x)));
    setChangeLog((l) => [...entries, ...l]);
    setUnsaved({});
    setReviewOpen(false);
    setReason("");
    setSaveBanner(`Applied ${entries.length} setting change${entries.length === 1 ? "" : "s"}. Configuration events recorded.`);
    setTimeout(() => setSaveBanner(null), 5000);
  }

  function applyConfigScenario(id: ConfigurationScenario) {
    const sc = CONFIG_SCENARIOS.find((x) => x.id === id)!;
    setConfigScenario(id);
    if (id === "production_baseline") { setSettings(BASE_SETTINGS); setUnsaved({}); return; }
    setSettings((prev) => prev.map((x) => {
      const c = sc.changes.find((y) => y.id === x.id);
      return c ? { ...x, value: c.value } : x;
    }));
    setUnsaved({});
  }

  function checkUpdates() {
    setUpdateResult(null);
    setUpdateStep(0);
    UPDATE_CHECK_STEPS.forEach((_, i) => setTimeout(() => setUpdateStep(i), i * 320));
    setTimeout(() => { setUpdateStep(null); setUpdateResult("Platform is current. Version 1.0.0 (Build 2026.08.09.1)."); }, UPDATE_CHECK_STEPS.length * 320 + 300);
  }

  function sendTestNotification() {
    setNotifResult(["Notification queued"]);
    setTimeout(() => setNotifResult((r) => [...r, "Notification delivered (simulated)"]), 900);
  }

  function runTest(label: string) {
    setTestResult(`${label}: running...`);
    setTimeout(() => setTestResult(`${label}: completed successfully (simulated).`), 1000);
    setTimeout(() => setTestResult(null), 5000);
  }

  const grouped = useMemo(() => {
    const rows = effective.filter((x) => x.category === tab);
    const map = new Map<string, SystemSetting[]>();
    rows.forEach((r) => { map.set(r.section, [...(map.get(r.section) ?? []), r]); });
    return [...map.entries()];
  }, [effective, tab]);

  const scenarioBanner = CONFIG_SCENARIOS.find((s) => s.id === configScenario)?.banner;

  function renderControl(x: SystemSetting) {
    const changed = dirty.includes(x.id);
    const locked = x.policyControlled;
    return (
      <div key={x.id} className={cn("flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0", changed && "bg-[#FFFBEB]")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-slate-800">
            {x.name}
            {x.sensitive && <Pill tone="warn">Security sensitive</Pill>}
            {x.executionSensitive && <Pill tone="bad">Execution sensitive</Pill>}
            {locked && <Pill tone="info"><ShieldCheck className="h-3 w-3" />Policy controlled</Pill>}
            {environment !== "Global" && <Pill>{changed ? "Overridden" : "Inherited"}</Pill>}
            {changed && <Pill tone="warn">Unsaved</Pill>}
          </div>
          {x.description && <p className="mt-0.5 text-[11px] text-slate-500">{x.description}</p>}
          {locked && x.policyRef && <p className="mt-0.5 text-[10.5px] text-[#1B4F91]">Enforced by {x.policyRef}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {typeof x.value === "boolean" ? (
            <Toggle checked={x.value} onChange={(v) => setValue(x, v)} />
          ) : x.options ? (
            <select value={String(x.value)} onChange={(e) => setValue(x, e.target.value)}
              className="h-8 min-w-[190px] rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-800">
              {x.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : typeof x.value === "number" ? (
            <div className="flex items-center gap-1.5">
              <input type="number" value={x.value} onChange={(e) => setValue(x, Number(e.target.value))}
                className="h-8 w-24 rounded-md border border-[#E2E8F0] px-2 text-[12px] text-slate-800" />
              {x.unit && <span className="text-[11px] text-slate-500">{x.unit}</span>}
            </div>
          ) : (
            <input value={String(x.value)} onChange={(e) => setValue(x, e.target.value)}
              className="h-8 w-[220px] rounded-md border border-[#E2E8F0] px-2 text-[12px] text-slate-800" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <nav className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span>Platform Administration</span><ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">System Settings</span>
      </nav>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[21px] font-semibold tracking-tight text-slate-900">System Settings</h1>
            <Pill tone="ok">Customer Hosted</Pill>
            {scenarioBanner && <Pill tone="info">{scenarioBanner}</Pill>}
          </div>
          <p className="mt-1 max-w-[900px] text-[12.5px] text-slate-600">
            Configure platform behavior, global defaults, integrations, scheduling, retention, and operational preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)} aria-label="Environment scope"
            className="h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-700">
            {ENVIRONMENTS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <select value={configScenario} onChange={(e) => applyConfigScenario(e.target.value as ConfigurationScenario)} aria-label="Demo configuration scenario"
            className="h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] text-slate-700">
            {CONFIG_SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={() => setStoryStep(0)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <Play className="h-3.5 w-3.5" /> Demo Story
          </button>
          <button onClick={() => setGuideOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <BookOpen className="h-3.5 w-3.5" /> System Guide
          </button>
          <button onClick={runSave} disabled={!dirty.length}
            className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-white", dirty.length ? "bg-[#1B4F91] hover:bg-[#173F74]" : "cursor-not-allowed bg-slate-300")}>
            <Save className="h-3.5 w-3.5" /> Save Changes{dirty.length ? ` (${dirty.length})` : ""}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#CFE0F3] bg-[#EFF4FB] px-4 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4F91]" />
        <div className="text-[12px] text-slate-700">
          <span className="font-semibold text-[#1B4F91]">Customer configures the platform. Policy defines the boundary. Execution operates inside that boundary.</span>{" "}
          System Settings define platform defaults; Policies &amp; Governance define enforceable limits. A default cannot weaken a policy prohibition.
        </div>
      </div>

      {(dirty.length > 0 || saveBanner) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-slate-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            {saveBanner ?? `${dirty.length} unsaved change${dirty.length === 1 ? "" : "s"} · ${securityCount} security sensitive · ${execCount} execution sensitive`}
          </div>
          {dirty.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => setDiffOpen(true)} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[11.5px] text-slate-700 hover:bg-slate-50"><GitCompare className="h-3.5 w-3.5" /> Review Changes</button>
              <button onClick={() => setUnsaved({})} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[11.5px] text-slate-700 hover:bg-slate-50"><Undo2 className="h-3.5 w-3.5" /> Discard</button>
            </div>
          )}
        </div>
      )}

      {saveStep !== null && (
        <div className="mt-3 rounded-lg border border-[#CFE0F3] bg-[#EFF4FB] px-4 py-2 text-[12px] text-[#1B4F91]">{SAVE_STEPS[saveStep]}</div>
      )}

      {/* tabs */}
      <div className="mt-3 flex flex-wrap gap-1 rounded-lg border border-[#E2E8F0] bg-white p-1">
        {CATEGORIES.map((c) => {
          const Icon = TAB_ICONS[c];
          const active = tab === c;
          return (
            <button key={c} onClick={() => setTab(c)}
              className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors",
                active ? "bg-[#EFF4FB] font-medium text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]" : "text-slate-600 hover:bg-slate-50")}>
              <Icon className="h-3.5 w-3.5" /> {c}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          {tab === "General" && (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
              <Panel title="Platform Information">
                {PLATFORM_INFO.map((p) => <Field key={p.label} label={p.label} value={p.value} />)}
                <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11.5px] text-emerald-700">
                  Platform Health — All Systems Operational
                </div>
              </Panel>
              <div className="space-y-3">
                {grouped.map(([section, rows]) => (
                  <Panel key={section} title={section}>{rows.map(renderControl)}</Panel>
                ))}
              </div>
            </div>
          )}

          {tab !== "General" && grouped.map(([section, rows]) => (
            <Panel key={section} title={section}>{rows.map(renderControl)}</Panel>
          ))}

          {tab === "Execution & Runners" && (
            <>
              <Panel title="Runner Inventory" action={<button onClick={() => runTest("Runner health test")} className="h-7 rounded-md border border-[#E2E8F0] px-2.5 text-[11.5px] text-[#1B4F91] hover:bg-[#EFF4FB]">Test Runners</button>}>
                <table className="w-full text-[11.5px]">
                  <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                    <th className="py-2 pr-3 font-medium">Runner Pool</th><th className="py-2 pr-3 font-medium">Online</th>
                    <th className="py-2 pr-3 font-medium">Allowed Operations</th><th className="py-2 font-medium">Can Modify Package</th>
                  </tr></thead>
                  <tbody>
                    {RUNNERS.map((r) => {
                      const off = healthScenario === "runner_failure" && r.name.startsWith("Terraform");
                      return (
                        <tr key={r.name} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-3 font-medium text-slate-800">{r.name}</td>
                          <td className="py-2 pr-3">{off ? <Pill tone="bad">0 / {r.total} Online</Pill> : <Pill tone="ok">{r.online} / {r.total} Online</Pill>}</td>
                          <td className="py-2 pr-3 text-slate-600">{r.scope}</td>
                          <td className="py-2"><Pill tone="bad">No</Pill></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {testResult && <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">{testResult}</div>}
              </Panel>
              <Panel title="Configuration Safety">
                <p className="text-[12px] text-slate-700">A configuration change may not undermine an active production transaction.</p>
                <button onClick={attemptDisableValidationEngine} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">
                  <ShieldAlert className="h-3.5 w-3.5" /> Attempt: Disable Validation Engine
                </button>
              </Panel>
            </>
          )}

          {tab === "Notifications" && (
            <Panel title="Send Test Notification">
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-[11.5px]"><span className="text-slate-500">Channel</span>
                  <select className="mt-1 block h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]"><option>Collaboration (Teams)</option><option>Email</option><option>ITSM</option><option>Webhook</option></select>
                </label>
                <label className="text-[11.5px]"><span className="text-slate-500">Severity</span>
                  <select className="mt-1 block h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]"><option>Informational</option><option>Warning</option><option>Critical</option></select>
                </label>
                <label className="text-[11.5px]"><span className="text-slate-500">Target</span>
                  <input defaultValue="#iac-operations" className="mt-1 block h-8 rounded-md border border-[#E2E8F0] px-2 text-[12px]" />
                </label>
                <button onClick={sendTestNotification} className="h-8 rounded-md bg-[#1B4F91] px-3 text-[12px] font-medium text-white hover:bg-[#173F74]">Send Test Notification</button>
              </div>
              {notifResult.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {notifResult.map((n) => <li key={n} className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">{n}</li>)}
                </ul>
              )}
            </Panel>
          )}

          {tab === "AI & Model" && (
            <>
              <Panel title="AI Trust Boundary" action={<button onClick={() => runTest("Model endpoint test")} className="h-7 rounded-md border border-[#E2E8F0] px-2.5 text-[11.5px] text-[#1B4F91] hover:bg-[#EFF4FB]">Test Endpoint</button>}>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {[
                    { l: "Production Credentials", v: "Never held by the model" },
                    { l: "Execution Authority", v: "None — runners execute approved packages" },
                    { l: "Secrets in Context", v: "Excluded" },
                  ].map((x) => (
                    <div key={x.l} className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] p-3">
                      <div className="text-[10.5px] uppercase tracking-[0.06em] text-slate-500">{x.l}</div>
                      <div className="mt-1 text-[12px] font-medium text-slate-800">{x.v}</div>
                    </div>
                  ))}
                </div>
                {testResult && <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">{testResult}</div>}
              </Panel>
              <Panel title="AI Endpoint Unavailable — Impact">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {[
                    ["Digital Twin", "Available"], ["Discovery", "Available"], ["Existing Change Packages", "Available"],
                    ["New Remediation Intelligence", "Unavailable"], ["New Change Engineering", "Unavailable"],
                    ["Approved Execution", "Available only if policy allows"], ["Validation", "Available"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-slate-700">{k}</span>
                      <Pill tone={v === "Unavailable" ? "bad" : v.startsWith("Available only") ? "warn" : "ok"}>{v}</Pill>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setHealthScenario("ai_failure"); setCapabilityOpen(true); }} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">
                  <FlaskConical className="h-3.5 w-3.5" /> Simulate AI Endpoint Failure
                </button>
              </Panel>
            </>
          )}

          {tab === "Maintenance" && (
            <>
              <Panel title="Platform Release" action={<button onClick={checkUpdates} className="h-7 rounded-md border border-[#E2E8F0] px-2.5 text-[11.5px] text-[#1B4F91] hover:bg-[#EFF4FB]">Check for Updates</button>}>
                {RELEASE_INFO.map((r) => <Field key={r.label} label={r.label} value={r.value} />)}
                {updateStep !== null && <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">{UPDATE_CHECK_STEPS[updateStep]}</div>}
                {updateResult && <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11.5px] text-emerald-700">{updateResult}</div>}
              </Panel>
              <Panel title="Platform Update Workflow">
                <div className="flex flex-wrap items-center gap-1.5">
                  {UPDATE_WORKFLOW.map((s, i) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1 text-[11px] font-medium text-[#1B4F91]">{s}</span>
                      {i < UPDATE_WORKFLOW.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    </span>
                  ))}
                </div>
              </Panel>
              <Panel title="Configuration Management">
                <div className="flex flex-wrap gap-2">
                  {["Export Configuration", "Compare Configuration", "Import Configuration", "Restore Previous Configuration"].map((a) => (
                    <button key={a} onClick={() => runTest(a)} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">{a}</button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-x-6 md:grid-cols-2">
                  {CONFIG_SNAPSHOT.map((c) => <Field key={c.label} label={c.label} value={c.value} />)}
                </div>
                {testResult && <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">{testResult}</div>}
              </Panel>
              <Panel title="Operational Schedule">
                <table className="w-full text-[11.5px]">
                  <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                    <th className="py-2 pr-3 font-medium">Task</th><th className="py-2 pr-3 font-medium">Schedule</th>
                    <th className="py-2 pr-3 font-medium">Last Run</th><th className="py-2 pr-3 font-medium">Next Run</th>
                    <th className="py-2 pr-3 font-medium">Status</th><th className="py-2 font-medium">Owner</th>
                  </tr></thead>
                  <tbody>
                    {SCHEDULES.map((s) => (
                      <tr key={s.task} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-3 font-medium text-slate-800">{s.task}</td>
                        <td className="py-2 pr-3 text-slate-600">{s.schedule}</td>
                        <td className="py-2 pr-3 text-slate-600">{s.last}</td>
                        <td className="py-2 pr-3 text-slate-600">{s.next}</td>
                        <td className="py-2 pr-3"><Pill tone="ok">{s.status}</Pill></td>
                        <td className="py-2 text-slate-600">{s.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </>
          )}

          {/* always-present sections */}
          <Panel title="Feature Management">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6">
              {FEATURES.map((f) => (
                <div key={f.id} className="rounded-lg border border-[#E2E8F0] bg-[#FBFCFE] p-3 text-center">
                  <div className="text-[12px] font-semibold text-slate-800">{f.name}</div>
                  <p className="mt-1 text-[10.5px] text-slate-500">{f.description}</p>
                  <div className="mt-2">{f.enabled ? <Pill tone="ok">Enabled</Pill> : <Pill tone="warn">Beta</Pill>}</div>
                  <div className="mt-2 flex justify-center gap-2">
                    <button onClick={() => setFeatureDrawer(f)} className="text-[11px] font-medium text-[#1B4F91] hover:underline">Configure</button>
                    {f.enabled && <button onClick={() => disableFeature(f)} className="text-[11px] text-slate-500 hover:underline">Disable</button>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Configuration Trace by Workflow Stage" action={
            <button onClick={() => setSqlTraceOpen(true)} className="h-7 rounded-md bg-[#1B4F91] px-2.5 text-[11.5px] font-medium text-white hover:bg-[#173F74]">
              Show Settings Behind SQL/EBS Use Case
            </button>
          }>
            <div className="flex flex-wrap gap-1.5">
              {STAGE_TRACE.map((s) => (
                <button key={s.stage} onClick={() => setStage(s.stage)}
                  className={cn("rounded-md px-2.5 py-1 text-[11.5px]", stage === s.stage ? "bg-[#EFF4FB] font-medium text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]" : "border border-[#E2E8F0] text-slate-600 hover:bg-slate-50")}>
                  {s.stage}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-x-6 md:grid-cols-2">
              {STAGE_TRACE.find((s) => s.stage === stage)!.settings.map((x) => <Field key={x.label} label={x.label} value={x.value} />)}
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Panel title="Configuration Precedence" action={
              <button onClick={() => setPrecedenceOpen((p) => !p)} className="text-[11.5px] text-[#1B4F91] hover:underline">{precedenceOpen ? "Collapse" : "Expand"}</button>
            }>
              <ol className="space-y-1">
                {PRECEDENCE.map((p, i) => (
                  <li key={p} className="flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px] text-slate-700">
                    <span className="grid h-5 w-5 place-items-center rounded bg-[#EFF4FB] text-[10px] font-semibold text-[#1B4F91]">{i + 1}</span>{p}
                  </li>
                ))}
              </ol>
              {precedenceOpen && (
                <p className="mt-2 text-[11.5px] text-slate-600">
                  System Settings define defaults. Policies define enforceable boundaries. A default can never override a policy prohibition.
                </p>
              )}
            </Panel>

            <Panel title="Settings Inheritance">
              <div className="space-y-1">
                {INHERITANCE_CHAIN.map((c, i) => (
                  <div key={c.level} className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px]">
                    <span className="text-slate-600">{i + 1}. {c.level}</span>
                    <span className="font-medium text-slate-800">{c.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11.5px] text-emerald-700">
                Final effective configuration: CP-2026-01842 validation definition (21 tests)
              </div>
              <SectionLabel>Environment Overrides</SectionLabel>
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-[#E2E8F0] text-left text-[10px] uppercase text-slate-500">
                  <th className="py-1.5 pr-2 font-medium">Setting</th><th className="py-1.5 pr-2 font-medium">Global</th>
                  <th className="py-1.5 pr-2 font-medium">Production</th><th className="py-1.5 font-medium">Non-Production</th>
                </tr></thead>
                <tbody>
                  {ENV_OVERRIDES.map((e) => (
                    <tr key={e.setting} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 pr-2 text-slate-700">{e.setting}</td>
                      <td className="py-1.5 pr-2 text-slate-600">{e.global} <Pill>Default</Pill></td>
                      <td className="py-1.5 pr-2 text-slate-600">{e.production} <Pill tone="warn">Overridden</Pill></td>
                      <td className="py-1.5 text-slate-600">{e.nonprod} <Pill tone="info">Inherited</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          <Panel title="Settings Change History" action={
            <button onClick={() => setHistoryOpen(true)} className="text-[11.5px] text-[#1B4F91] hover:underline">View All</button>
          }>
            <table className="w-full text-[11.5px]">
              <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                <th className="py-2 pr-3 font-medium">Time</th><th className="py-2 pr-3 font-medium">Administrator</th>
                <th className="py-2 pr-3 font-medium">Section</th><th className="py-2 pr-3 font-medium">Setting</th>
                <th className="py-2 pr-3 font-medium">Change</th><th className="py-2 pr-3 font-medium">Reason</th>
                <th className="py-2 pr-3 font-medium">Sensitivity</th><th className="py-2 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {changeLog.slice(0, 6).map((c, i) => (
                  <tr key={`${c.evidence}-${i}`} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 tabular-nums text-slate-600">{c.time}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.actor}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.section}</td>
                    <td className="py-2 pr-3 font-medium text-slate-800">{c.setting}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.prev} → {c.next}</td>
                    <td className="py-2 pr-3 text-slate-600">{c.reason}</td>
                    <td className="py-2 pr-3">{c.sensitivity === "Security Sensitive" ? <Pill tone="warn">{c.sensitivity}</Pill> : <Pill>{c.sensitivity}</Pill>}</td>
                    <td className="py-2"><Pill tone="ok">{c.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        {/* right rail */}
        <aside className="space-y-3">
          <Panel title="System Health" action={
            <select value={healthScenario} onChange={(e) => setHealthScenario(e.target.value as SystemHealthScenario)} aria-label="Health scenario"
              className="h-7 max-w-[150px] rounded-md border border-[#E2E8F0] bg-white px-1.5 text-[11px] text-slate-700">
              {HEALTH_SCENARIOS.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
            </select>
          }>
            {health.map((h) => (
              <div key={h.label} className="flex items-center justify-between border-b border-slate-100 py-1.5 text-[11.5px] last:border-0">
                <span className="text-slate-600">{h.label}</span>
                <span className={cn("flex items-center gap-1 font-medium",
                  h.state === "healthy" ? "text-emerald-600" : h.state === "warning" ? "text-amber-600" : h.state === "degraded" ? "text-amber-600" : "text-rose-600")}>
                  {h.state === "healthy" ? <CheckCircle2 className="h-3.5 w-3.5" /> : h.state === "failed" ? <XCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {h.value}
                </span>
              </div>
            ))}
            <div className={cn("mt-2 rounded-md px-2.5 py-2 text-center text-[11.5px] font-semibold ring-1 ring-inset",
              overall.tone === "ok" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : overall.tone === "warn" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200")}>
              {overall.label}
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setDiagOpen(true)} className="h-8 flex-1 rounded-md border border-[#E2E8F0] text-[11.5px] font-medium text-[#1B4F91] hover:bg-[#EFF4FB]">View System Diagnostics</button>
              <button onClick={() => setCapabilityOpen(true)} className="h-8 flex-1 rounded-md border border-[#E2E8F0] text-[11.5px] font-medium text-[#1B4F91] hover:bg-[#EFF4FB]">Capability Impact</button>
            </div>
          </Panel>

          <Panel title="License & Usage">
            {LICENSE_USAGE.map((l) => <Field key={l.label} label={l.label} value={l.value} />)}
            <button onClick={() => setUsageOpen(true)} className="mt-2 h-8 w-full rounded-md border border-[#E2E8F0] text-[11.5px] font-medium text-[#1B4F91] hover:bg-[#EFF4FB]">View Usage Report</button>
          </Panel>

          <Panel title="System Configuration Readiness">
            {READINESS.map((r) => (
              <div key={r.area} className="mb-1.5 last:mb-0">
                <div className="flex justify-between text-[11.5px] text-slate-700"><span>{r.area}</span><span className="tabular-nums font-medium">{r.pct}%</span></div>
                <div className="mt-0.5 h-1.5 rounded-full bg-slate-100"><div className={cn("h-1.5 rounded-full", r.pct === 100 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${r.pct}%` }} /></div>
              </div>
            ))}
            <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#1B4F91]">Overall: 97%</div>
            <SectionLabel>Outstanding</SectionLabel>
            <ul className="space-y-1 text-[11px] text-slate-600">
              {READINESS_OUTSTANDING.map((o) => <li key={o} className="flex gap-1.5"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />{o}</li>)}
            </ul>
            <p className="mt-1.5 text-[10.5px] text-slate-500">These do not block AWS/SQL pilot readiness.</p>
          </Panel>

          <Panel title="SQL/EBS Pilot Readiness">
            <div className="grid grid-cols-2 gap-1">
              {PILOT_READINESS.map((p) => (
                <div key={p} className="flex items-center gap-1 text-[11px] text-slate-700"><CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />{p}</div>
              ))}
            </div>
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-center text-[11.5px] font-semibold text-emerald-700">READY FOR GOVERNED PILOT</div>
          </Panel>

          <Panel title="Permissions">
            <Field label="Current User" value="Platform Administrator" />
            <Field label="Permissions" value="Configuration Write" />
            <Field label="Sensitive Changes" value="Review Required" />
            <Field label="Security Settings" value="Security Administrator" />
          </Panel>

          <Panel title="Quick Actions">
            <div className="space-y-1.5">
              {[
                { label: "View System Diagnostics", icon: Activity, onClick: () => setDiagOpen(true) },
                { label: "Run Connector Tests", icon: RefreshCw, onClick: () => runTest("Connector tests") },
                { label: "Test Runners", icon: Server, onClick: () => runTest("Runner health test") },
                { label: "Run Evidence Integrity", icon: ShieldCheck, onClick: () => runTest("Evidence integrity check") },
                { label: "View Backup History", icon: History, onClick: () => runTest("Backup history") },
                { label: "Check Updates", icon: RefreshCw, onClick: () => { setTab("Maintenance"); checkUpdates(); } },
                { label: "Export Configuration", icon: Download, onClick: () => runTest("Export Configuration") },
                { label: "Review Unsaved Changes", icon: GitCompare, onClick: () => setDiffOpen(true) },
                { label: "Show SQL/EBS Configuration", icon: Layers, onClick: () => setSqlTraceOpen(true) },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={a.onClick} className="flex h-8 w-full items-center gap-2 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50">
                    <Icon className="h-3.5 w-3.5 text-slate-500" /> {a.label}
                  </button>
                );
              })}
            </div>
          </Panel>
        </aside>
      </div>

      {/* demo story */}
      {storyStep !== null && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[560px] -translate-x-1/2 rounded-lg border border-[#CFE0F3] bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#1B4F91]">Demo Story — Step {storyStep + 1} of {DEMO_STORY.length}</span>
            <button onClick={() => setStoryStep(null)} className="text-[11.5px] text-slate-500 hover:underline">Exit Story</button>
          </div>
          <div className="mt-1.5 text-[13px] font-semibold text-slate-900">{DEMO_STORY[storyStep].title}</div>
          <p className="mt-0.5 text-[12px] text-slate-600">{DEMO_STORY[storyStep].body}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button disabled={storyStep === 0} onClick={() => setStoryStep((s) => Math.max(0, (s ?? 0) - 1))}
              className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 disabled:opacity-40">Previous</button>
            <button onClick={() => {
              const next = Math.min(DEMO_STORY.length - 1, (storyStep ?? 0) + 1);
              setStoryStep(next);
              const st = DEMO_STORY[next];
              setTab(st.tab);
              if (st.health) setHealthScenario(st.health);
              if (st.title === "SQL/EBS Configuration") setSqlTraceOpen(true);
            }} className="h-8 rounded-md bg-[#1B4F91] px-3 text-[12px] font-medium text-white hover:bg-[#173F74]">Next</button>
          </div>
        </div>
      )}

      {/* drawers */}
      <Drawer open={diagOpen} title="System Diagnostics" subtitle="Simulated component state — no live infrastructure checks" onClose={() => setDiagOpen(false)} wide>
        <table className="w-full text-[11.5px]">
          <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
            <th className="py-2 pr-2 font-medium">Component</th><th className="py-2 pr-2 font-medium">Version</th>
            <th className="py-2 pr-2 font-medium">State</th><th className="py-2 pr-2 font-medium">Latency</th>
            <th className="py-2 pr-2 font-medium">Last Check</th><th className="py-2 font-medium">Dependency</th>
          </tr></thead>
          <tbody>
            {DIAGNOSTICS.map((d) => (
              <tr key={d.component} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-2 font-medium text-slate-800">{d.component}</td>
                <td className="py-2 pr-2 text-slate-600">{d.version}</td>
                <td className="py-2 pr-2"><Pill tone="ok">{d.state}</Pill></td>
                <td className="py-2 pr-2 text-slate-600">{d.latency}</td>
                <td className="py-2 pr-2 text-slate-600">{d.lastCheck}</td>
                <td className="py-2 text-slate-600">{d.dependency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Drawer>

      <Drawer open={capabilityOpen} title="Capability Impact" subtitle={HEALTH_SCENARIOS.find((h) => h.id === healthScenario)?.label} onClose={() => setCapabilityOpen(false)}>
        {impacts.map((i) => (
          <div key={i.capability} className="border-b border-slate-100 py-2 last:border-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-800">{i.capability}</span>
              <Pill tone={i.state === "Available" ? "ok" : i.state === "Degraded" ? "warn" : "bad"}>{i.state}</Pill>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">{i.reason}</p>
          </div>
        ))}
      </Drawer>

      <Drawer open={usageOpen} title="Usage Report" subtitle="Simulated platform usage — no billing calculations" onClose={() => setUsageOpen(false)}>
        {USAGE_BY_CAPABILITY.map((u) => (
          <div key={u.capability} className="flex items-center justify-between border-b border-slate-100 py-2 text-[12px] last:border-0">
            <span className="text-slate-700">{u.capability}</span>
            <span className="flex items-center gap-2"><span className="font-medium text-slate-800">{u.count}</span><Pill tone="ok">{u.trend}</Pill></span>
          </div>
        ))}
      </Drawer>

      <Drawer open={diffOpen} title="Review Configuration Changes" subtitle={`${changedSettings.length} pending change(s)`} onClose={() => setDiffOpen(false)}>
        {changedSettings.length === 0 ? (
          <p className="text-[12px] text-slate-500">No unsaved changes.</p>
        ) : changedSettings.map((x) => {
          const prev = settings.find((s) => s.id === x.id)!;
          const sev = sensitivityOf(x);
          return (
            <div key={x.id} className="border-b border-slate-100 py-2 last:border-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-800">{x.category} · {x.name}</span>
                <Pill tone={sev === "Security Sensitive" ? "warn" : sev === "Execution Sensitive" ? "bad" : "neutral"}>{sev}</Pill>
              </div>
              <div className="mt-0.5 text-[11.5px] text-slate-600">{String(prev.value)} → <span className="font-medium text-slate-800">{String(x.value)}</span></div>
            </div>
          );
        })}
      </Drawer>

      <Drawer open={historyOpen} title="Configuration Change History" subtitle="Every applied setting creates a configuration event" onClose={() => setHistoryOpen(false)} wide>
        {changeLog.map((c, i) => (
          <div key={`${c.evidence}-${i}`} className="border-b border-slate-100 py-2 last:border-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-800">{c.section} · {c.setting}</span>
              <span className="text-[11px] text-slate-500">{c.time} · {c.actor}</span>
            </div>
            <div className="mt-0.5 text-[11.5px] text-slate-600">{c.prev} → {c.next} · {c.reason}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Pill tone="ok">{c.status}</Pill>
              <Pill tone={c.sensitivity === "Security Sensitive" ? "warn" : "neutral"}>{c.sensitivity}</Pill>
              <Pill tone="info">Evidence {c.evidence}</Pill>
              <button onClick={() => runTest(`Restore previous value for ${c.setting}`)} className="text-[11px] text-[#1B4F91] hover:underline">Restore Previous Value</button>
            </div>
          </div>
        ))}
        {testResult && <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px] text-[#1B4F91]">{testResult}</div>}
      </Drawer>

      <Drawer open={sqlTraceOpen} title="Settings Behind the SQL/EBS Use Case" subtitle="Configuration that enabled CP-2026-01842" onClose={() => setSqlTraceOpen(false)}>
        {SQL_EBS_CONFIG.map((c) => <Field key={c.label} label={c.label} value={c.value} />)}
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[12px] font-semibold text-emerald-700">
          USE CASE PLATFORM CONFIGURATION READY
        </div>
      </Drawer>

      <Drawer open={!!featureDrawer} title={featureDrawer ? `${featureDrawer.name} Settings` : ""} subtitle="Focused feature configuration" onClose={() => setFeatureDrawer(null)}>
        {featureDrawer && (
          <>
            <Field label="Enabled" value={featureDrawer.enabled ? "Yes" : "No"} />
            <Field label="Description" value={featureDrawer.description} />
            <Field label="Dependent Capabilities" value={featureDrawer.dependents.join(", ") || "None"} />
            {featureDrawer.id === "engineering" && (
              <>
                <SectionLabel>Change Engineering Defaults</SectionLabel>
                <Field label="Preferred IaC" value="Terraform" />
                <Field label="Generate API Equivalent" value="Yes" />
                <Field label="Require Git" value="Yes" />
                <Field label="Require Recovery" value="Yes" />
                <Field label="Validation Template" value="Standard" />
                <SectionLabel>Action Library</SectionLabel>
                <Field label="Auto-Update" value="Disabled" />
                <Field label="New Vendor Actions" value="Require Review" />
                <Field label="New Actions Default" value="Engineering Only" />
                <Field label="Production Eligibility" value="Explicit Approval Required" />
                <Field label="Version Pinning" value="Enabled" />
              </>
            )}
          </>
        )}
      </Drawer>

      <Drawer open={guideOpen} title="System Guide" subtitle="How platform configuration relates to governance" onClose={() => setGuideOpen(false)}>
        <div className="space-y-3 text-[12px] text-slate-700">
          <p>This is a customer-hosted deployment. The control plane, execution runners, operational data and evidence remain inside the customer environment.</p>
          <div>
            <SectionLabel>What the customer configures</SectionLabel>
            <p className="text-[11.5px]">Discovery, AI inference, engineering defaults, execution behavior, validation, evidence, retention, runners, integrations, notifications, maintenance and updates.</p>
          </div>
          <div>
            <SectionLabel>What constrains those defaults</SectionLabel>
            <p className="text-[11.5px]">Security prohibitions, governance policy, authorization, package boundaries, validation requirements and evidence requirements.</p>
          </div>
          <div className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] p-3 text-[11.5px] text-[#1B4F91]">
            Customer configures the platform · Policy defines the boundary · Execution operates inside that boundary.
          </div>
        </div>
      </Drawer>

      {/* modals */}
      <Modal open={!!blocked} title={blocked?.title ?? ""} onClose={() => setBlocked(null)}>
        <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 p-3 text-[12px] text-slate-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div>
            <div className="font-semibold text-rose-700">{blocked?.title}</div>
            <p className="mt-1">{blocked?.reason}</p>
            {blocked?.policy && <p className="mt-1 text-[11.5px] text-slate-600">{blocked.policy}</p>}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {blocked?.title === "CHANGE BLOCKED" && (
            <button onClick={() => { setBlocked(null); setTestResult("Change scheduled after active workflows complete."); }}
              className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">Schedule After Active Workflows Complete</button>
          )}
          <button onClick={() => setBlocked(null)} className="h-8 rounded-md bg-[#1B4F91] px-3 text-[12px] font-medium text-white hover:bg-[#173F74]">Close</button>
        </div>
      </Modal>

      <Modal open={reviewOpen} title="Administrative Review Required" onClose={() => setReviewOpen(false)}>
        <div className="grid grid-cols-2 gap-x-6 text-[12px]">
          <Field label="Settings Changed" value={changedSettings.length} />
          <Field label="Security Sensitive" value={securityCount} />
          <Field label="Execution Sensitive" value={execCount} />
          <Field label="Requires Administrative Review" value="Yes" />
        </div>
        <label className="mt-3 block text-[11.5px]">
          <span className="text-slate-500">Change Reason (required)</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            className="mt-1 w-full rounded-md border border-[#E2E8F0] px-2 py-1.5 text-[12px]" placeholder="Describe why this change is required" />
        </label>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => setReviewOpen(false)} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={reason.trim().length < 5} onClick={() => applySettings(reason.trim())}
            className={cn("h-8 rounded-md px-3 text-[12px] font-medium text-white", reason.trim().length >= 5 ? "bg-[#1B4F91] hover:bg-[#173F74]" : "cursor-not-allowed bg-slate-300")}>
            Apply Settings
          </button>
        </div>
      </Modal>
    </div>
  );
}
