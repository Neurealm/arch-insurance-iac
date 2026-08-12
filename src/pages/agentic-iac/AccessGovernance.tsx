import { useMemo, useState } from "react";
import {
  AlertTriangle, Check, ChevronRight, Download, FileClock, KeyRound, Play, Plus,
  ShieldCheck, X, Users, Bot, Cpu, Minus, ArrowRight, ScrollText, Beaker,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACTIVITY, AGENTS, AGENT_AUTHORITY_ROWS, AUDIT_FIELDS, AUTHORIZATION_MODEL, AUTHORIZATION_TOKEN,
  BREAK_GLASS_CONTROLS, BREAK_GLASS_FLOW, BREAK_GLASS_REQUEST, BREAK_GLASS_REQUIREMENTS,
  CONFIG_STATE, CP_APPROVALS, DEMO_STORY, DENIED_ACTIONS, ENVIRONMENTS, ENV_AUTHORITY,
  EXPLAINABILITY_ATTRIBUTES, EXPORT_STEPS, GOVERNANCE_SUMMARY, GOVERNANCE_TRACE, HEALTH_FACTORS,
  HUMAN_ROLES, IDENTITY_TYPE_BREAKDOWN, INSIGHTS, OWNERSHIP, POLICIES, POLICY_PRECEDENCE,
  PRINCIPALS, PRINCIPAL_SUMMARY, PRIVILEGED_STATUS, RESOURCE_SCOPE, REVIEW_CATEGORIES,
  REVIEW_LIFECYCLE, RISK_APPROVAL, ROLE_HIERARCHY, RUNNERS, RUNNER_AUTHORITY_ROWS, SCENARIOS,
  SERVICE_IDENTITY_FINDING, SERVICE_IDENTITY_HEALTH, SERVICE_IDENTITY_TYPES, SESSIONS,
  SQL_EBS_GOVERNANCE, TECHNOLOGIES, TECH_AUTHORITY, TIME_BOUNDS, TRACE_STEPS, WORKFLOWS,
  contextForScenario, evaluateAuthorization,
  type AuthorizationContext, type GovernanceScenario, type Decision,
} from "./platform/governanceData";

/* ── primitives ─────────────────────────────────────────────── */

function Panel({ title, right, children, className }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-[#E2E8F0] bg-white", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] px-3.5 py-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{title}</h2>
          {right}
        </header>
      )}
      <div className="p-3.5">{children}</div>
    </section>
  );
}

function KV({ rows, cols = 1 }: { rows: { label: string; value: React.ReactNode }[]; cols?: number }) {
  return (
    <dl className={cn("grid gap-x-4 gap-y-1.5 text-[11.5px]", cols === 2 ? "sm:grid-cols-2" : "")}>
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[minmax(110px,190px)_1fr] gap-x-3">
          <dt className="text-slate-500">{r.label}</dt>
          <dd className="font-medium text-slate-800">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Yes() { return <span className="inline-flex items-center gap-1 text-emerald-700"><Check className="h-3 w-3" />Yes</span>; }
function No() { return <span className="inline-flex items-center gap-1 text-rose-700"><X className="h-3 w-3" />No</span>; }
function Cond() { return <span className="inline-flex items-center gap-1 text-amber-700"><Minus className="h-3 w-3" />Where applicable</span>; }

function DecisionPill({ d }: { d: Decision }) {
  const map: Record<Decision, [string, string]> = {
    allow: ["ALLOW", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    approval_required: ["APPROVAL REQUIRED", "bg-amber-50 text-amber-800 ring-amber-200"],
    deny: ["DENY", "bg-rose-50 text-rose-700 ring-rose-200"],
  };
  const [l, c] = map[d];
  return <span className={cn("inline-flex rounded px-2 py-0.5 text-[10.5px] font-bold ring-1 ring-inset", c)}>{l}</span>;
}

function Drawer({ open, title, subtitle, onClose, children, wide }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div className={cn("flex h-full w-full flex-col bg-white shadow-xl", wide ? "max-w-[1000px]" : "max-w-[640px]")} onClick={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-3">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

const TABS = ["Overview", "Identities & Roles", "Policies", "Approval Governance", "Authorization & Delegation", "Secrets & Credentials", "Session Management", "Governance Insights"] as const;

/* ── page ───────────────────────────────────────────────────── */

export default function AccessGovernance() {
  const [tab, setTab] = useState<string>("Overview");
  const [scenario, setScenario] = useState<GovernanceScenario>("normal");
  const [environment, setEnvironment] = useState<string>("Production");
  const [technology, setTechnology] = useState<string>("AWS");
  const [authorityRole, setAuthorityRole] = useState<string>("Infrastructure Engineer");
  const [ownershipMode, setOwnershipMode] = useState(false);
  const [sqlEbsMode, setSqlEbsMode] = useState(false);
  const [story, setStory] = useState(-1);
  const [traceStep, setTraceStep] = useState(-1);
  const [showTrace, setShowTrace] = useState(false);
  const [revokedSessions, setRevokedSessions] = useState<string[]>([]);
  const [disabledIdentities, setDisabledIdentities] = useState<string[]>([]);
  const [approvalRevoked, setApprovalRevoked] = useState(false);
  const [exportStep, setExportStep] = useState(-1);
  const [drawer, setDrawer] = useState<null | "export" | "policyTest" | "createRole" | "createIdentity" | "workflow" | "breakGlass" | "insight" | "policy" | "reviews" | "sessions" | "workflows">(null);
  const [activeInsight, setActiveInsight] = useState(INSIGHTS[0]);
  const [activePolicy, setActivePolicy] = useState(POLICIES[0]);
  const [selectedPrincipalType, setSelectedPrincipalType] = useState<string>("All");
  const [decisionFilter, setDecisionFilter] = useState<string>("All");

  const [testCtx, setTestCtx] = useState<AuthorizationContext>({
    principal: "Infrastructure Engineer", environment: "Production", technology: "AWS",
    action: "Modify EBS", target: "vol-0a81f2c4e7b9d1234", risk: "medium",
    packageId: "None", approvalState: "none", secretAvailable: true,
  });
  const [testResult, setTestResult] = useState<ReturnType<typeof evaluateAuthorization> | null>(null);

  const scenarioDef = SCENARIOS.find((s) => s.id === scenario)!;
  const liveCtx = useMemo(() => contextForScenario(scenario), [scenario]);
  const liveResult = useMemo(() => evaluateAuthorization(liveCtx), [liveCtx]);

  const authHealth = scenarioDef.authorizationHealth - disabledIdentities.length * 2 - (approvalRevoked ? 3 : 0);
  const deniedCount = DENIED_ACTIONS.length + scenarioDef.deniedDelta;
  const sqlEbsReady = scenarioDef.sqlEbsReady && !approvalRevoked && disabledIdentities.length === 0;

  const filteredPrincipals = PRINCIPALS.filter((p) => selectedPrincipalType === "All" || p.type === selectedPrincipalType);
  const filteredActivity = ACTIVITY.filter((a) => decisionFilter === "All" || a.decision === decisionFilter);

  function runExport() { setDrawer("export"); setExportStep(0); EXPORT_STEPS.forEach((_, i) => setTimeout(() => setExportStep(i), 400 * (i + 1))); }

  function applyStory(step: number) {
    setStory(step);
    if (step === 0) { setTab("Overview"); setScenario("normal"); }
    if (step === 1) { setTab("Identities & Roles"); setSelectedPrincipalType("All"); }
    if (step === 2) { setTab("Identities & Roles"); setSelectedPrincipalType("service_identity"); }
    if (step === 3) { setTab("Overview"); }
    if (step === 4) { setTab("Approval Governance"); }
    if (step === 5) { setTab("Authorization & Delegation"); }
    if (step === 6) { setTab("Secrets & Credentials"); }
    if (step === 7) { setTab("Authorization & Delegation"); setScenario("runner_scope_violation"); }
    if (step === 8) { setTab("Secrets & Credentials"); setScenario("break_glass"); }
    if (step === 9) { setTab("Governance Insights"); setScenario("normal"); }
  }

  const govChain = SQL_EBS_GOVERNANCE.map((g) => ({
    ...g,
    ok: !scenarioDef.failingGovernanceKeys.includes(g.key) && !(approvalRevoked && g.key === "auth"),
  }));

  return (
    <div className="px-5 py-4">
      <nav className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span>Platform Administration</span><ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">Access &amp; Governance</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-slate-900">Access &amp; Governance</h1>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">Customer Hosted</span>
          </div>
          <p className="mt-0.5 text-[12.5px] text-slate-600">Manage identities, roles, permissions, and governance controls for Intelligent IaC.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={scenario} onChange={(e) => setScenario(e.target.value as GovernanceScenario)} aria-label="Governance scenario" className="h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] font-medium text-slate-700">
            {SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button onClick={() => setSqlEbsMode(!sqlEbsMode)} aria-pressed={sqlEbsMode} className={cn("h-8 rounded-md border px-2.5 text-[12px] font-medium", sqlEbsMode ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]" : "border-[#E2E8F0] bg-white text-slate-700")}>Show SQL/EBS Governance</button>
          <button onClick={() => setOwnershipMode(!ownershipMode)} aria-pressed={ownershipMode} className={cn("h-8 rounded-md border px-2.5 text-[12px] font-medium", ownershipMode ? "border-[#1B4F91] bg-[#EFF4FB] text-[#1B4F91]" : "border-[#E2E8F0] bg-white text-slate-700")}>Show Ownership</button>
          <button onClick={() => applyStory(0)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"><Play className="h-3.5 w-3.5" />Demo Story</button>
        </div>
      </div>

      {story >= 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#CFE0F3] bg-[#EFF4FB] px-3.5 py-2.5">
          <span className="rounded bg-[#1B4F91] px-1.5 py-0.5 text-[10px] font-semibold text-white">STEP {story + 1} / {DEMO_STORY.length}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-slate-900">{DEMO_STORY[story].title}</div>
            <div className="text-[11.5px] text-slate-700">{DEMO_STORY[story].message}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button disabled={story === 0} onClick={() => applyStory(story - 1)} className="h-7 rounded border border-[#CFE0F3] bg-white px-2 text-[11.5px] disabled:opacity-40">Previous</button>
            <button disabled={story === DEMO_STORY.length - 1} onClick={() => applyStory(story + 1)} className="h-7 rounded bg-[#1B4F91] px-2.5 text-[11.5px] font-semibold text-white disabled:opacity-40">Next</button>
            <button onClick={() => setStory(-1)} className="h-7 rounded border border-[#CFE0F3] bg-white px-2 text-[11.5px] text-slate-600">Exit Story</button>
          </div>
        </div>
      )}

      {scenarioDef.headline && (
        <div className={cn("mt-3 rounded-lg border px-3.5 py-2.5", scenarioDef.severity === "critical" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50")}>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", scenarioDef.severity === "critical" ? "text-rose-600" : "text-amber-600")} />
            <div className="min-w-0 flex-1">
              <div className={cn("text-[12px] font-bold tracking-wide", scenarioDef.severity === "critical" ? "text-rose-800" : "text-amber-800")}>{scenarioDef.headline}</div>
              <div className="text-[11.5px] text-slate-700">{scenarioDef.reason}</div>
              <div className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {scenarioDef.detail.map((d) => (
                  <div key={d.label} className="flex justify-between gap-3 text-[11px]"><span className="text-slate-600">{d.label}</span><span className="font-semibold text-slate-800">{d.value}</span></div>
                ))}
              </div>
              {scenarioDef.degraded.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {scenarioDef.degraded.map((d) => (
                    <span key={d.label} className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", d.tone === "ok" ? "bg-emerald-100 text-emerald-800" : d.tone === "warn" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800")}>{d.label}: {d.value}</span>
                  ))}
                </div>
              )}
              {scenarioDef.recommended && <div className="mt-1.5 text-[11px] text-slate-700"><span className="font-semibold">Recommended: </span>{scenarioDef.recommended}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_288px]">
        <div className="min-w-0 space-y-3">
          {/* tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("border-b-2 px-3 py-2 text-[12px]", tab === t ? "border-[#1B4F91] font-semibold text-[#1B4F91]" : "border-transparent text-slate-600 hover:text-slate-900")}>{t}</button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                {[
                  { l: "Total Users", v: 86, s: "Active" },
                  { l: "Roles", v: HUMAN_ROLES.length, s: "Configured" },
                  { l: "Service Identities", v: 17, s: "Active" },
                  { l: "Policies", v: POLICIES.length, s: "Active" },
                  { l: "Approval Workflows", v: WORKFLOWS.length, s: "Active" },
                  { l: "Authorization Health", v: `${authHealth}%`, s: authHealth >= 95 ? "Excellent" : "Attention required", tone: authHealth >= 95 ? "text-emerald-600" : "text-amber-600" },
                ].map((c) => (
                  <div key={c.l} className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5">
                    <div className="text-[10.5px] text-slate-500">{c.l}</div>
                    <div className={cn("mt-0.5 text-[22px] font-bold leading-tight", c.tone ?? "text-slate-900")}>{c.v}</div>
                    <div className="text-[10.5px] text-slate-500">{c.s}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
                <Panel title="Identity Type Overview">
                  <div className="flex items-center gap-4">
                    <div className="relative grid h-[96px] w-[96px] place-items-center rounded-full"
                      style={{ background: `conic-gradient(#16a34a 0 72%, #db2777 72% 86%, #0ea5e9 86% 95%, #1B4F91 95% 100%)` }}>
                      <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white text-center">
                        <div><div className="text-[16px] font-bold text-slate-900">120</div><div className="text-[9px] text-slate-500">Identities</div></div>
                      </div>
                    </div>
                    <ul className="space-y-1 text-[11.5px]">
                      {IDENTITY_TYPE_BREAKDOWN.map((i) => (
                        <li key={i.label} className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
                          {i.label} <span className="text-slate-500">{i.value} ({i.pct}%)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>

                <Panel title="Authorization Model" right={<button onClick={() => setTab("Authorization & Delegation")} className="text-[11px] font-medium text-[#1B4F91] hover:underline">View Authorization Matrix →</button>}>
                  <div className="flex flex-wrap items-start gap-1">
                    {AUTHORIZATION_MODEL.map((m, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <div className="w-[110px] text-center">
                          <div className={cn("mx-auto grid h-8 w-8 place-items-center rounded-full border",
                            m.state === "enabled" ? "border-emerald-200 bg-emerald-50 text-emerald-600" : m.state === "approval" ? "border-amber-200 bg-amber-50 text-amber-600" : "border-rose-200 bg-rose-50 text-rose-600")}>
                            {m.state === "enabled" ? <Check className="h-4 w-4" /> : m.state === "approval" ? <AlertTriangle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-slate-800">{m.stage}</div>
                          <div className="text-[10px] text-slate-500">{m.sub}</div>
                          <div className={cn("mt-0.5 text-[10px] font-semibold", m.state === "enabled" ? "text-emerald-600" : m.state === "approval" ? "text-amber-600" : "text-rose-600")}>
                            {m.state === "enabled" ? "Enabled" : m.state === "approval" ? "Approval Required" : "Disabled"}
                          </div>
                        </div>
                        {idx < AUTHORIZATION_MODEL.length - 1 && <ArrowRight className="mt-3 h-3.5 w-3.5 shrink-0 text-slate-300" />}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 border-t border-[#EEF2F6] pt-2 text-[11px] text-slate-600">Authorization at each step is controlled by policy, environment, and risk classification.</p>
                </Panel>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
                <Panel title="Principal Access Summary" right={<button onClick={() => setTab("Identities & Roles")} className="text-[11px] font-medium text-[#1B4F91] hover:underline">View All Principals →</button>}>
                  <table className="w-full text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Principal Type", "Count", "Examples", "Default Access", "Authentication", "Last Access", "Status"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {PRINCIPAL_SUMMARY.map((p) => (
                        <tr key={p.type} className="border-b border-[#EEF2F6]">
                          <td className="py-1.5 pr-3 font-medium text-slate-800">{p.type}</td>
                          <td className="py-1.5 pr-3 font-mono text-slate-700">{p.count}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.examples}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.defaultAccess}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.authentication}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.lastAccess}</td>
                          <td className="py-1.5 pr-3 text-emerald-600">● {p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>

                <Panel title="Privileged Access Status">
                  <div className="space-y-1.5 text-[11.5px]">
                    {PRIVILEGED_STATUS.map((p) => (
                      <div key={p.label} className="flex items-center justify-between border-b border-[#EEF2F6] pb-1">
                        <span className="text-slate-700">{p.label}</span>
                        <span className={cn("font-mono font-semibold", p.value === 0 ? "text-emerald-600" : "text-slate-800")}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTab("Secrets & Credentials")} className="mt-2 text-[11px] font-medium text-[#1B4F91] hover:underline">View PAM Integration →</button>
                </Panel>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <Panel title="Role Hierarchy Overview">
                  <ul className="space-y-1 text-[11.5px]">
                    {ROLE_HIERARCHY.map((r) => (
                      <li key={r.name} className="flex items-center justify-between" style={{ paddingLeft: r.depth * 14 }}>
                        <span className="flex items-center gap-1.5 text-slate-700"><Users className="h-3.5 w-3.5 text-slate-400" />{r.name}</span>
                        <span className="rounded bg-slate-100 px-1.5 text-[10.5px] font-semibold text-slate-700">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="Policy Enforcement Overview">
                  <ul className="space-y-1 text-[11.5px]">
                    {POLICIES.slice(0, 8).map((p) => (
                      <li key={p.id} className="flex items-center justify-between">
                        <button onClick={() => { setActivePolicy(p); setDrawer("policy"); }} className="truncate text-left text-slate-700 hover:text-[#1B4F91] hover:underline">{p.name}</button>
                        <span className="text-emerald-600">Active</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setTab("Policies")} className="mt-2 text-[11px] font-medium text-[#1B4F91] hover:underline">View All Policies →</button>
                </Panel>
                <Panel title="Session & Access Activity (Last 24h)">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[["Total Sessions", 212], ["Successful Logins", 198], ["Failed Logins", 14], ["Elevated Sessions", 4]].map(([l, v]) => (
                      <div key={l as string}><div className="text-[16px] font-bold text-slate-900">{v as number}</div><div className="text-[9.5px] text-slate-500">{l as string}</div></div>
                    ))}
                  </div>
                  <table className="mt-2 w-full text-[10.5px]">
                    <tbody>
                      {ACTIVITY.slice(0, 5).map((a, i) => (
                        <tr key={i} className="border-t border-[#EEF2F6]">
                          <td className="py-1 pr-2 font-mono text-slate-500">{a.time}</td>
                          <td className="py-1 pr-2 text-slate-700">{a.principal}</td>
                          <td className="py-1 pr-2 text-slate-600">{a.action}</td>
                          <td className={cn("py-1 text-right font-semibold", a.decision === "Success" ? "text-emerald-600" : "text-rose-600")}>{a.decision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => setTab("Governance Insights")} className="mt-2 text-[11px] font-medium text-[#1B4F91] hover:underline">View Full Activity Log →</button>
                </Panel>
              </div>
            </>
          )}

          {/* ── Identities & Roles ── */}
          {tab === "Identities & Roles" && (
            <>
              <Panel title="Principals" right={
                <div className="flex gap-1.5">
                  {["All", "human", "service_identity", "runner", "federated"].map((t) => (
                    <button key={t} onClick={() => setSelectedPrincipalType(t)} className={cn("h-6 rounded px-2 text-[10.5px] font-medium capitalize", selectedPrincipalType === t ? "bg-[#1B4F91] text-white" : "bg-slate-100 text-slate-700")}>{t.replace("_", " ")}</button>
                  ))}
                </div>
              }>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Principal", "Type", "Roles", "Authentication", "Technology", "Environment", "Owner", "Last Access", "Status"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredPrincipals.map((p) => (
                        <tr key={p.id} className="border-b border-[#EEF2F6]">
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] font-medium text-slate-800">
                            {p.name}
                            {disabledIdentities.includes(p.id) && <span className="ml-1 rounded bg-rose-50 px-1 text-[9px] font-semibold text-rose-700">DISABLED</span>}
                          </td>
                          <td className="py-1.5 pr-3 capitalize text-slate-600">{p.type.replace("_", " ")}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.roles.join(", ")}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.authentication}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.technology ?? "—"}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.environment ?? "—"}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.owner}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-500">{p.lastAccess}</td>
                          <td className="py-1.5 pr-3">
                            <span className={cn("font-semibold", p.status === "active" ? "text-emerald-600" : p.status === "review" ? "text-amber-600" : "text-slate-500")}>{p.status}</span>
                            {p.type === "service_identity" && (
                              <button
                                onClick={() => setDisabledIdentities((d) => d.includes(p.id) ? d.filter((x) => x !== p.id) : [...d, p.id])}
                                className="ml-2 rounded border border-[#E2E8F0] px-1.5 text-[10px] text-slate-600 hover:bg-slate-50"
                              >{disabledIdentities.includes(p.id) ? "Enable" : "Disable"}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {disabledIdentities.length > 0 && (
                  <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                    <b>Identity disabled.</b> SQL Execution: Blocked · SQL Discovery: Still available via sql-prod-read · Change Engineering: Available · Production SQL Action: Unavailable.
                  </div>
                )}
              </Panel>

              <Panel title="Human Authority">
                <div className="grid gap-2 md:grid-cols-2">
                  {HUMAN_ROLES.map((r) => (
                    <div key={r.id} className="rounded border border-[#EEF2F6] p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-slate-900">{r.name}</span>
                        <span className="rounded bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-600">{r.members} members</span>
                      </div>
                      <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-700">Can</div>
                      <ul className="text-[11px] text-slate-700">{r.can.map((c) => <li key={c} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{c}</li>)}</ul>
                      <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-rose-700">Cannot</div>
                      <ul className="text-[11px] text-slate-700">{r.cannot.map((c) => <li key={c} className="flex gap-1.5"><X className="mt-0.5 h-3 w-3 shrink-0 text-rose-600" />{c}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </Panel>

              <div className="grid gap-3 lg:grid-cols-2">
                <Panel title="Environment-Specific Authority" right={
                  <select value={environment} onChange={(e) => setEnvironment(e.target.value)} aria-label="Environment" className="h-7 rounded border border-[#E2E8F0] px-1.5 text-[11px]">
                    {ENVIRONMENTS.map((e) => <option key={e}>{e}</option>)}
                  </select>
                }>
                  <KV rows={[
                    { label: "Generate", value: ENV_AUTHORITY[environment].generate },
                    { label: "Execute", value: ENV_AUTHORITY[environment].execute },
                    { label: "Approval", value: ENV_AUTHORITY[environment].approval },
                  ]} />
                  <p className="mt-2 text-[11px] text-slate-600">Progressive governance: authority narrows as the environment approaches production.</p>
                </Panel>

                <Panel title="Technology-Specific Authority" right={
                  <div className="flex gap-1.5">
                    <select value={authorityRole} onChange={(e) => setAuthorityRole(e.target.value)} aria-label="Role" className="h-7 rounded border border-[#E2E8F0] px-1.5 text-[11px]">
                      {Object.keys(TECH_AUTHORITY).map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <select value={technology} onChange={(e) => setTechnology(e.target.value)} aria-label="Technology" className="h-7 rounded border border-[#E2E8F0] px-1.5 text-[11px]">
                      {TECHNOLOGIES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                }>
                  <div className="mb-2 rounded border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5 text-[11.5px]">
                    <b>{authorityRole}</b> · {technology}: <b>{TECH_AUTHORITY[authorityRole][technology]}</b>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    {TECHNOLOGIES.map((t) => (
                      <div key={t} className="flex justify-between gap-2"><span className="text-slate-600">{t}</span><span className="font-medium text-slate-800">{TECH_AUTHORITY[authorityRole][t]}</span></div>
                    ))}
                  </div>
                </Panel>
              </div>

              <Panel title="Service Identity Health" right={<button onClick={() => setDrawer("createIdentity")} className="inline-flex h-7 items-center gap-1 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700"><Plus className="h-3 w-3" />Create Service Identity</button>}>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {SERVICE_IDENTITY_HEALTH.map((s) => (
                    <div key={s.label} className="rounded border border-[#EEF2F6] bg-[#F8FAFC] px-2 py-1.5 text-center">
                      <div className="text-[18px] font-bold text-slate-900">{s.value}</div><div className="text-[10px] text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2.5">
                  <div className="text-[11.5px] font-semibold text-amber-900">Finding — {SERVICE_IDENTITY_FINDING.identity}</div>
                  <KV rows={[
                    { label: "Issue", value: SERVICE_IDENTITY_FINDING.issue },
                    { label: "Current", value: SERVICE_IDENTITY_FINDING.current },
                    { label: "Required", value: SERVICE_IDENTITY_FINDING.required },
                    { label: "Recommendation", value: SERVICE_IDENTITY_FINDING.recommendation },
                  ]} />
                  <button className="mt-2 h-7 rounded bg-[#1B4F91] px-2.5 text-[11px] font-semibold text-white">Create Remediation</button>
                  <p className="mt-1 text-[10.5px] text-amber-800">No automatic permission change is performed.</p>
                </div>
              </Panel>

              <Panel title="Runner Identity Review">
                <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {RUNNERS.map((r) => (
                    <div key={r.name} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-slate-700">{r.name}</span>
                      <span className={cn("font-semibold", r.status === "Healthy" ? "text-emerald-600" : "text-amber-600")} title={r.reason}>{r.status}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[10.5px] text-slate-500">Network Runner: credential rotation due in 5 days.</p>
              </Panel>
            </>
          )}

          {/* ── Policies ── */}
          {tab === "Policies" && (
            <>
              <Panel title="Access Policy Library" right={<button onClick={() => setDrawer("policyTest")} className="inline-flex h-7 items-center gap-1 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700"><Beaker className="h-3 w-3" />Test Policy</button>}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Name", "Version", "Status", "Scope", "Last Updated", "Owner"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {POLICIES.map((p) => (
                        <tr key={p.id} onClick={() => { setActivePolicy(p); setDrawer("policy"); }} className="cursor-pointer border-b border-[#EEF2F6] hover:bg-slate-50">
                          <td className="py-1.5 pr-3 font-medium text-slate-800">{p.name}</td>
                          <td className="py-1.5 pr-3 font-mono text-slate-600">{p.version}</td>
                          <td className="py-1.5 pr-3 capitalize text-emerald-600">{p.status}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.scope}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{p.lastReview}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{p.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Policy Precedence">
                <div className="flex flex-wrap items-center gap-2">
                  {POLICY_PRECEDENCE.map((p, idx) => (
                    <div key={p.level} className="flex items-center gap-2">
                      <div className={cn("rounded border px-2.5 py-1.5 text-[11.5px]", idx === 0 ? "border-rose-200 bg-rose-50 text-rose-800" : idx === 1 ? "border-[#E2E8F0] bg-[#F8FAFC] text-slate-800" : "border-amber-200 bg-amber-50 text-amber-800")}>
                        <div className="font-semibold">{p.level}</div><div className="text-[10.5px] opacity-80">{p.note}</div>
                      </div>
                      {idx < POLICY_PRECEDENCE.length - 1 && <span className="text-[10px] font-semibold text-slate-400">overrides</span>}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-600">
                  Even if a Change Manager approves a SQL restart, a Tier 1 SQL restart marked prohibited for this package results in <b>DENY</b>. Human approval must not override an explicit technical prohibition unless a separate emergency policy exists.
                </p>
              </Panel>
            </>
          )}

          {/* ── Approval Governance ── */}
          {tab === "Approval Governance" && (
            <>
              <Panel title="Approval Workflows" right={<button onClick={() => setDrawer("workflow")} className="inline-flex h-7 items-center gap-1 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700"><Plus className="h-3 w-3" />Configure Workflow</button>}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Workflow", "Environment", "Risk", "Required Roles", "Order", "Max Age", "Self Approval", "Emergency Override"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {WORKFLOWS.map((w) => (
                        <tr key={w.id} className="border-b border-[#EEF2F6]">
                          <td className="py-1.5 pr-3 font-medium text-slate-800">{w.name}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{w.environment}</td>
                          <td className="py-1.5 pr-3 capitalize text-slate-600">{w.riskLevels.join(", ")}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{w.requiredRoles.join(", ") || "—"}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{w.approvalOrder}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{w.maxApprovalAge}</td>
                          <td className="py-1.5 pr-3 font-semibold text-rose-600">No</td>
                          <td className="py-1.5 pr-3 text-slate-600">{w.emergencyOverride}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="CP-2026-01842 Approval Chain" right={
                approvalRevoked
                  ? <button onClick={() => setApprovalRevoked(false)} className="h-7 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700">Restore Authorization</button>
                  : <button onClick={() => setApprovalRevoked(true)} className="h-7 rounded border border-rose-200 bg-rose-50 px-2 text-[11px] font-semibold text-rose-700">Revoke Authorization</button>
              }>
                <table className="w-full text-[11.5px]">
                  <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                    {["Required Role", "Approver", "Independent", "State", "Time"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {CP_APPROVALS.map((a) => (
                      <tr key={a.role} className="border-b border-[#EEF2F6]">
                        <td className="py-1.5 pr-3 font-medium text-slate-800">{a.role}</td>
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{a.approver}</td>
                        <td className="py-1.5 pr-3 text-emerald-600">Yes</td>
                        <td className="py-1.5 pr-3 text-emerald-600">{a.state}</td>
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{a.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {approvalRevoked ? (
                  <div className="mt-2 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-800">
                    <b>EXEC-AUTH state: Revoked.</b> Package: Still Immutable · Execution: Blocked · Reapproval: Required.
                    <div className="mt-1 text-[11px] text-slate-700">Completed execution cannot be undone by revoking historical approval. Use the remediation / recovery workflow instead.</div>
                  </div>
                ) : (
                  <div className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-800">
                    3 / 3 independent approvals satisfied · <b>EXEC-AUTH-01842</b> issued by Policy + Approval Service.
                  </div>
                )}
              </Panel>

              <Panel title="Package Modification After Approval">
                <KV rows={[
                  { label: "Approved Package", value: "v1.0" },
                  { label: "Attempted Change", value: "EBS target size 750 GB → 1 TB" },
                  { label: "Package Signature", value: <span className="font-semibold text-rose-700">INVALIDATED</span> },
                  { label: "Authorization", value: "EXEC-AUTH-01842" },
                  { label: "Authorization State", value: <span className="font-semibold text-rose-700">REVOKED</span> },
                  { label: "New Package Version", value: "v1.1 Draft" },
                  { label: "Required", value: "Re-engineering validation · Policy reevaluation · New approval · New authorization" },
                ]} />
                <button onClick={() => setScenario("package_modified")} className="mt-2 h-7 rounded border border-[#E2E8F0] px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Simulate Package Modification</button>
              </Panel>
            </>
          )}

          {/* ── Authorization & Delegation ── */}
          {tab === "Authorization & Delegation" && (
            <>
              <Panel title="Why Was This Allowed or Denied?" right={<button onClick={() => setShowTrace(!showTrace)} className="h-7 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700">{showTrace ? "Hide" : "View"} Policy Decision Trace</button>}>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                  <div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px] lg:grid-cols-3">
                      {EXPLAINABILITY_ATTRIBUTES.map((a) => {
                        const map: Record<string, string> = {
                          Principal: liveCtx.principal, Role: "Execution Runner", Environment: liveCtx.environment,
                          Technology: liveCtx.technology, Resource: liveCtx.target, Action: liveCtx.action,
                          "Risk Classification": liveCtx.risk, Package: liveCtx.packageId ?? "None",
                          "Package Version": liveCtx.packageVersion ?? "—", Authorization: liveCtx.authorizationId ?? "None",
                          "Approval State": liveCtx.approvalState ?? "none", "Session State": "Scoped",
                          "Credential State": liveCtx.secretAvailable === false ? "Unavailable" : "JIT issued",
                          "Policy Version": "Package-Bound Execution v3.4", "Time Window": "12:40 – 1:40 PM",
                          "Resource Scope": "Tag: ManagedBy=IntelligentIaC",
                          "Requested Parameters": `${liveCtx.requestedSizeGb} GB (approved ${liveCtx.approvedSizeGb} GB)`,
                          "Runtime Safety State": liveResult.decision === "allow" ? "Continue" : "Halt",
                        };
                        return <div key={a} className="flex justify-between gap-2"><span className="text-slate-500">{a}</span><span className="text-right font-medium text-slate-800">{map[a]}</span></div>;
                      })}
                    </div>
                  </div>
                  <div className="rounded border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Decision</div>
                    <DecisionPill d={liveResult.decision} />
                    <p className="mt-2 text-[11px] text-slate-700">{liveResult.reason}</p>
                    <p className="mt-2 text-[10.5px] text-slate-500">Infrastructure API Called: <b>{liveResult.decision === "allow" ? "Yes (approved package only)" : "No"}</b></p>
                  </div>
                </div>
                {showTrace && (
                  <div className="mt-3 grid gap-x-4 gap-y-0.5 border-t border-[#EEF2F6] pt-2 text-[11px] sm:grid-cols-2">
                    {liveResult.trace.map((t, i) => (
                      <div key={t.step} className="flex justify-between gap-2">
                        <span className="text-slate-600"><span className="mr-1.5 font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>{t.step}</span>
                        <span className={cn("font-semibold", t.state === "PASS" ? "text-emerald-600" : t.state === "FAIL" ? "text-rose-600" : "text-slate-400")}>{t.state}</span>
                      </div>
                    ))}
                    <p className="col-span-full mt-1 text-[10.5px] text-slate-500">The final decision cannot contradict a failed mandatory control. Evaluation order: {TRACE_STEPS.length} controls.</p>
                  </div>
                )}
              </Panel>

              <div className="grid gap-3 lg:grid-cols-2">
                <Panel title="Agent Authority">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-[10.5px]">
                      <thead><tr className="border-b border-[#E2E8F0] text-left text-slate-500">
                        <th className="py-1.5 pr-2 font-semibold">Authority</th>
                        {AGENTS.map((a) => <th key={a.name} className="py-1.5 pr-1 font-semibold" title={a.name}><span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" />{a.name.replace(" Agent", "")}</span></th>)}
                      </tr></thead>
                      <tbody>
                        {AGENT_AUTHORITY_ROWS.map((row) => (
                          <tr key={row} className="border-b border-[#EEF2F6]">
                            <td className="py-1 pr-2 text-slate-700">{row}</td>
                            {AGENTS.map((a) => (
                              <td key={a.name} className="py-1 pr-1">
                                {row === "May Generate Code" ? (a.code ? <Yes /> : <Cond />)
                                  : row.startsWith("May Read") || row === "May Generate Recommendation" ? <Yes /> : <No />}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 rounded bg-[#F8FAFC] px-2 py-1.5 text-[11px] text-slate-700">AI reasoning is not production authority. Agents hold no credentials, cannot assume production roles, and cannot create their own authorization.</p>
                </Panel>

                <Panel title="Runner Authority">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-[10.5px]">
                      <thead><tr className="border-b border-[#E2E8F0] text-left text-slate-500">
                        <th className="py-1.5 pr-2 font-semibold">Authority</th>
                        {RUNNERS.map((r) => <th key={r.name} className="py-1.5 pr-1 font-semibold"><span className="inline-flex items-center gap-1"><Cpu className="h-3 w-3" />{r.name.replace(" Runner", "")}</span></th>)}
                      </tr></thead>
                      <tbody>
                        {RUNNER_AUTHORITY_ROWS.map((row, idx) => (
                          <tr key={row} className="border-b border-[#EEF2F6]">
                            <td className="py-1 pr-2 text-slate-700">{row}</td>
                            {RUNNERS.map((r) => <td key={r.name} className="py-1 pr-1">{idx < 4 ? <Yes /> : <No />}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 rounded bg-[#F8FAFC] px-2 py-1.5 text-[11px] text-slate-700">Runners execute the approved package and nothing else. They cannot change the target, expand parameters, skip a gate, or grant themselves authority.</p>
                </Panel>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <Panel title="Resource-Level Authority">
                  <div className="mb-1 font-mono text-[11px] text-slate-700">{RESOURCE_SCOPE.identity}</div>
                  <KV rows={RESOURCE_SCOPE.rows.map((r) => ({ label: r.label, value: r.value }))} />
                  <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-700">Allowed Actions</div>
                  <ul className="text-[11px] text-slate-700">{RESOURCE_SCOPE.allowed.map((a) => <li key={a} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{a}</li>)}</ul>
                  <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-rose-700">Explicitly Excluded</div>
                  <ul className="text-[11px] text-slate-700">{RESOURCE_SCOPE.excluded.map((a) => <li key={a} className="flex gap-1.5"><X className="mt-0.5 h-3 w-3 shrink-0 text-rose-600" />{a}</li>)}</ul>
                  <p className="mt-2 text-[11px] text-slate-600">{RESOURCE_SCOPE.expansion}</p>
                </Panel>

                <Panel title="Parameter-Level Authority" right={
                  <button onClick={() => setScenario(scenario === "runner_scope_violation" ? "normal" : "runner_scope_violation")} className="h-7 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700">
                    {scenario === "runner_scope_violation" ? "Request 750 GB" : "Request 1 TB"}
                  </button>
                }>
                  <KV rows={[
                    { label: "Action", value: "ModifyVolume" },
                    { label: "Target", value: "vol-0a81f2c4e7b9d1234" },
                    { label: "Current", value: "500 GB" },
                    { label: "Approved", value: "750 GB" },
                    { label: "Maximum Authorized", value: "750 GB" },
                    { label: "Requested", value: `${liveCtx.requestedSizeGb} GB` },
                  ]} />
                  <div className="mt-2 flex items-center gap-2">
                    <DecisionPill d={liveResult.decision} />
                    <span className="text-[11px] text-slate-600">{liveResult.reason}</span>
                  </div>
                  <div className="mt-3 border-t border-[#EEF2F6] pt-2">
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Time-Bound Authority</div>
                    <KV rows={TIME_BOUNDS.map((t) => ({ label: t.label, value: t.value }))} />
                  </div>
                </Panel>
              </div>

              <Panel title="Approval Token Model">
                <KV cols={2} rows={[
                  { label: "Authorization", value: AUTHORIZATION_TOKEN.id },
                  { label: "Package", value: AUTHORIZATION_TOKEN.packageId },
                  { label: "Version", value: AUTHORIZATION_TOKEN.version },
                  { label: "Environment", value: AUTHORIZATION_TOKEN.environment },
                  { label: "Issued By", value: AUTHORIZATION_TOKEN.issuedBy },
                  { label: "Target Scope", value: AUTHORIZATION_TOKEN.targetScope },
                  { label: "Allowed Operations", value: AUTHORIZATION_TOKEN.allowedOperations },
                  { label: "Expiration", value: AUTHORIZATION_TOKEN.expiration },
                  { label: "Reusable", value: AUTHORIZATION_TOKEN.reusable },
                  { label: "Transferable", value: AUTHORIZATION_TOKEN.transferable },
                  { label: "Package Mutation", value: AUTHORIZATION_TOKEN.packageMutation },
                  { label: "State", value: approvalRevoked ? "Revoked" : AUTHORIZATION_TOKEN.state },
                ]} />
              </Panel>
            </>
          )}

          {/* ── Secrets & Credentials ── */}
          {tab === "Secrets & Credentials" && (
            <>
              <div className="grid gap-3 lg:grid-cols-3">
                {[
                  { l: "Standing Agent Production Credentials", v: 0 },
                  { l: "Secrets in Model Context", v: 0 },
                  { l: "Standing Privileged Sessions", v: 0 },
                ].map((c) => (
                  <div key={c.l} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="text-[10.5px] text-emerald-800">{c.l}</div>
                    <div className="text-[24px] font-bold text-emerald-700">{c.v}</div>
                  </div>
                ))}
              </div>

              <Panel title="Credential Aliases" right={<span className="text-[10.5px] text-slate-500">Secret values are never displayed</span>}>
                <table className="w-full text-[11.5px]">
                  <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                    {["Session", "Principal", "Credential Alias", "Source", "Issued", "Expires"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {SESSIONS.map((s) => (
                      <tr key={s.id} className="border-b border-[#EEF2F6]">
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{s.id}</td>
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{s.principal}</td>
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{s.credentialAlias}</td>
                        <td className="py-1.5 pr-3 text-slate-600">Customer PAM / STS</td>
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{s.start}</td>
                        <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{s.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="Break-Glass Access" right={<button onClick={() => { setScenario("break_glass"); setDrawer("breakGlass"); }} className="h-7 rounded border border-amber-200 bg-amber-50 px-2 text-[11px] font-semibold text-amber-800">Simulate Emergency Request</button>}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Break-Glass Controls</div>
                    <KV rows={BREAK_GLASS_CONTROLS.map((b) => ({ label: b.label, value: b.value }))} />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Governed Emergency Path</div>
                    <ol className="space-y-0.5 text-[11px] text-slate-700">
                      {BREAK_GLASS_FLOW.map((f, i) => (
                        <li key={f} className="flex gap-1.5"><span className="font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>{f}</li>
                      ))}
                    </ol>
                    <p className="mt-2 text-[11px] text-slate-600">Break-glass does not bypass audit or governance. Approval, recording and post-event review remain mandatory.</p>
                  </div>
                </div>
              </Panel>
            </>
          )}

          {/* ── Session Management ── */}
          {tab === "Session Management" && (
            <>
              <Panel title="Privileged Sessions">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Session", "Principal", "Technology", "Target", "Start", "End", "Duration", "Recorded", "State", ""].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {SESSIONS.map((s) => {
                        const revoked = revokedSessions.includes(s.id);
                        return (
                          <tr key={s.id} className="border-b border-[#EEF2F6]">
                            <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{s.id}</td>
                            <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{s.principal}</td>
                            <td className="py-1.5 pr-3 text-slate-600">{s.technology}</td>
                            <td className="py-1.5 pr-3 text-slate-600">{s.target}</td>
                            <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{s.start}</td>
                            <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{s.end}</td>
                            <td className="py-1.5 pr-3 text-slate-600">{s.duration}</td>
                            <td className="py-1.5 pr-3 text-emerald-600">Yes</td>
                            <td className={cn("py-1.5 pr-3 font-semibold", revoked ? "text-rose-600" : "text-slate-700")}>{revoked ? "Revoked" : s.state}</td>
                            <td className="py-1.5 pr-3">
                              {!revoked && <button onClick={() => setRevokedSessions((r) => [...r, s.id])} className="rounded border border-[#E2E8F0] px-1.5 text-[10px] text-slate-600 hover:bg-slate-50">Revoke</button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {revokedSessions.length > 0 && (
                  <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                    <b>Session revoked.</b> Credential invalidated · Runner stopped before next action where possible · Audit event created.
                    <div className="mt-1 text-slate-700">An external transaction already in progress may require separate recovery handling — not all infrastructure operations can stop instantly.</div>
                  </div>
                )}
              </Panel>

              <Panel title="Auditability">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-4">
                  {AUDIT_FIELDS.map((f) => <div key={f} className="flex gap-1.5 text-slate-700"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{f}</div>)}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">No secret values are captured. This data feeds the Audit &amp; Compliance workspace.</p>
              </Panel>
            </>
          )}

          {/* ── Governance Insights ── */}
          {tab === "Governance Insights" && (
            <>
              <Panel title="Governance Insights">
                <div className="grid gap-1.5 md:grid-cols-2">
                  {INSIGHTS.map((i) => (
                    <button key={i.id} onClick={() => { setActiveInsight(i); setDrawer("insight"); }} className="rounded border border-[#EEF2F6] px-2.5 py-1.5 text-left hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11.5px] font-medium text-slate-800">{i.finding}</span>
                        <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase", i.severity === "high" ? "bg-rose-50 text-rose-700" : i.severity === "medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>{i.severity}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500">{i.principal} · {i.disposition}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10.5px] text-slate-500">These are observations, not accusations. No identity permissions are automatically remediated.</p>
              </Panel>

              <Panel title={`Denied Actions — Last 24h: ${deniedCount}`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Time", "Principal", "Action", "Target", "Decision", "Policy", "Infrastructure API Called"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {DENIED_ACTIONS.map((d) => (
                        <tr key={d.id} className="border-b border-[#EEF2F6]">
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{d.time}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{d.principal}</td>
                          <td className="py-1.5 pr-3 text-slate-700">{d.action}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{d.target}</td>
                          <td className="py-1.5 pr-3 font-semibold text-rose-600">{d.decision}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{d.policy}</td>
                          <td className="py-1.5 pr-3 font-semibold text-emerald-600">No</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Access Activity" right={
                <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} aria-label="Decision filter" className="h-7 rounded border border-[#E2E8F0] px-1.5 text-[11px]">
                  {["All", "Success", "Denied"].map((d) => <option key={d}>{d}</option>)}
                </select>
              }>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-[11.5px]">
                    <thead><tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase text-slate-500">
                      {["Time", "Principal", "Type", "Action", "Target", "Environment", "Technology", "Risk", "Package", "Decision"].map((h) => <th key={h} className="py-1.5 pr-3 font-semibold">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredActivity.map((a, i) => (
                        <tr key={i} className="border-b border-[#EEF2F6]">
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{a.time}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-700">{a.principal}</td>
                          <td className="py-1.5 pr-3 capitalize text-slate-600">{a.principalType.replace("_", " ")}</td>
                          <td className="py-1.5 pr-3 text-slate-700">{a.action}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{a.target}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{a.environment}</td>
                          <td className="py-1.5 pr-3 text-slate-600">{a.technology}</td>
                          <td className="py-1.5 pr-3 capitalize text-slate-600">{a.risk}</td>
                          <td className="py-1.5 pr-3 font-mono text-[10.5px] text-slate-600">{a.packageId}</td>
                          <td className={cn("py-1.5 pr-3 font-semibold", a.decision === "Success" ? "text-emerald-600" : "text-rose-600")}>{a.decision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Access Review Workflow" right={<button onClick={() => setDrawer("reviews")} className="h-7 rounded border border-[#E2E8F0] px-2 text-[11px] font-semibold text-slate-700">View Access Reviews</button>}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {REVIEW_LIFECYCLE.map((s, i) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <span className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[11px] text-slate-700">{s}</span>
                      {i < REVIEW_LIFECYCLE.length - 1 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                  {REVIEW_CATEGORIES.map((c) => (
                    <div key={c.label} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
                      <span className="text-slate-700">{c.label}</span>
                      <span className={cn("font-semibold", c.count ? "text-amber-600" : "text-emerald-600")}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {/* SQL/EBS governance chain */}
          {sqlEbsMode && (
            <Panel title="SQL/EBS Governance Chain — CP-2026-01842" right={
              <span className={cn("rounded px-2 py-0.5 text-[10.5px] font-bold", sqlEbsReady ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>
                {sqlEbsReady ? "GOVERNANCE CHAIN VERIFIED" : "NOT READY"}
              </span>
            }>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {govChain.map((g) => (
                  <div key={g.key} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
                    <span className="text-slate-700">{g.label}</span>
                    <span className={cn("font-semibold", g.ok ? "text-emerald-600" : "text-rose-600")}>{g.ok ? g.value : "BLOCKED"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-[#EEF2F6] pt-2">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Trace SQL/EBS Governance</span>
                  <button onClick={() => setTraceStep(Math.max(0, traceStep - 1))} className="h-6 rounded border border-[#E2E8F0] px-2 text-[10.5px]">Previous</button>
                  <button onClick={() => setTraceStep(Math.min(GOVERNANCE_TRACE.length - 1, traceStep + 1))} className="h-6 rounded bg-[#1B4F91] px-2 text-[10.5px] font-semibold text-white">Next</button>
                  <button onClick={() => { let i = 0; const id = setInterval(() => { setTraceStep(i); i++; if (i >= GOVERNANCE_TRACE.length) clearInterval(id); }, 700); }} className="h-6 rounded border border-[#E2E8F0] px-2 text-[10.5px]">Play</button>
                  <button onClick={() => setTraceStep(-1)} className="h-6 rounded border border-[#E2E8F0] px-2 text-[10.5px]">Reset</button>
                  {traceStep >= 0 && <span className="text-[10.5px] text-slate-500">Step {traceStep + 1} of {GOVERNANCE_TRACE.length}</span>}
                </div>
                <ol className="space-y-0.5 text-[11px]">
                  {GOVERNANCE_TRACE.map((t, i) => (
                    <li key={t} className={cn("flex gap-1.5 rounded px-1.5 py-0.5", i === traceStep ? "bg-[#EFF4FB] font-medium text-slate-900" : i < traceStep ? "text-slate-500" : "text-slate-700")}>
                      <span className="font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>{t}
                    </li>
                  ))}
                </ol>
              </div>
            </Panel>
          )}

          {ownershipMode && (
            <Panel title="Customer Ownership">
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {OWNERSHIP.map((o) => (
                  <div key={o.label} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
                    <span className="text-slate-700">{o.label}</span>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", o.value.includes("PLATFORM") ? "bg-[#EFF4FB] text-[#1B4F91]" : "bg-slate-100 text-slate-700")}>{o.value}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* right rail */}
        <aside className="space-y-3">
          <Panel title="Access Governance Summary">
            <ul className="space-y-1 text-[11.5px]">
              {GOVERNANCE_SUMMARY.map((g) => (
                <li key={g} className="flex items-center justify-between"><span className="text-slate-700">{g}</span><span className="inline-flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" />Enabled</span></li>
              ))}
              <li className="flex items-center justify-between"><span className="text-slate-700">Access Reviews</span><span className="text-[#1B4F91]">Scheduled</span></li>
            </ul>
          </Panel>

          <Panel title="Risk & Approval Overview">
            <ul className="space-y-1 text-[11.5px]">
              {RISK_APPROVAL.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-2">
                  <span className="text-slate-700">{r.label}</span>
                  <span className={cn("font-medium", r.tone === "ok" ? "text-emerald-600" : r.tone === "warn" ? "text-amber-600" : r.tone === "bad" ? "text-rose-600" : "text-[#1B4F91]")}>{r.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Authorization Health">
            <div className="flex items-center gap-3">
              <div className="relative grid h-[80px] w-[80px] place-items-center rounded-full" style={{ background: `conic-gradient(${authHealth >= 95 ? "#16a34a" : "#d97706"} 0 ${authHealth}%, #E2E8F0 ${authHealth}% 100%)` }}>
                <div className="grid h-[60px] w-[60px] place-items-center rounded-full bg-white"><span className="text-[15px] font-bold text-slate-900">{authHealth}%</span></div>
              </div>
              <ul className="space-y-0.5 text-[10.5px] text-slate-600">
                {HEALTH_FACTORS.slice(0, 6).map((h) => <li key={h}>{h}</li>)}
                <li className="text-slate-400">+{HEALTH_FACTORS.length - 6} more factors</li>
              </ul>
            </div>
          </Panel>

          <Panel title="Quick Actions">
            <div className="space-y-1.5">
              {[
                { l: "Create Role", icon: Plus, fn: () => setDrawer("createRole") },
                { l: "Create Service Identity", icon: Plus, fn: () => setDrawer("createIdentity") },
                { l: "View Access Reviews", icon: ScrollText, fn: () => setDrawer("reviews") },
                { l: "View Approval Workflows", icon: FileClock, fn: () => setTab("Approval Governance") },
                { l: "View Privileged Sessions", icon: KeyRound, fn: () => setTab("Session Management") },
                { l: "Test Authorization Policy", icon: Beaker, fn: () => setDrawer("policyTest") },
                { l: "Trace SQL/EBS Authorization", icon: ShieldCheck, fn: () => { setSqlEbsMode(true); setTraceStep(0); } },
                { l: "Export Access Report", icon: Download, fn: runExport },
              ].map((a) => (
                <button key={a.l} onClick={a.fn} className="flex h-8 w-full items-center gap-2 rounded border border-[#E2E8F0] bg-white px-2.5 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50">
                  <a.icon className="h-3.5 w-3.5 text-[#1B4F91]" />{a.l}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Governance Configuration State">
            <ul className="space-y-1 text-[11.5px]">
              {CONFIG_STATE.map((c) => (
                <li key={c.label} className="flex items-center justify-between"><span className="text-slate-700">{c.label}</span><span className="font-medium text-emerald-600">{c.value}</span></li>
              ))}
            </ul>
            <button onClick={() => setScenario("normal")} className="mt-2 h-7 w-full rounded border border-[#E2E8F0] text-[11px] font-medium text-slate-700 hover:bg-slate-50">Return to Normal Operations</button>
          </Panel>

          <Panel title="Related">
            <div className="space-y-1 text-[11.5px]">
              <a href="/intelligent-iac/platform/integrations" className="block text-[#1B4F91] hover:underline">Integrations &amp; Connectivity</a>
              <a href="/intelligent-iac/platform/policies-governance" className="block text-[#1B4F91] hover:underline">Policies &amp; Governance</a>
              <a href="/intelligent-iac/platform/deployment-architecture" className="block text-[#1B4F91] hover:underline">Customer Deployment Architecture</a>
            </div>
          </Panel>
        </aside>
      </div>

      {/* ── drawers ── */}

      <Drawer open={drawer === "policy"} title={activePolicy.name} subtitle={`Version ${activePolicy.version} · ${activePolicy.status}`} onClose={() => setDrawer(null)}>
        <KV rows={[
          { label: "Scope", value: activePolicy.scope },
          { label: "Business Owner", value: activePolicy.businessOwner },
          { label: "Technical Owner", value: activePolicy.owner },
          { label: "Security Owner", value: activePolicy.securityOwner },
          { label: "Review Frequency", value: activePolicy.reviewFrequency },
          { label: "Last Review", value: activePolicy.lastReview },
          { label: "Next Review", value: activePolicy.nextReview },
        ]} />
        <div className="mt-3 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Rules</div>
        <ul className="text-[11.5px] text-slate-700">{activePolicy.rules.map((r) => <li key={r} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{r}</li>)}</ul>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[["Evaluations 24h", activePolicy.evaluations24h], ["Allowed", activePolicy.allowed], ["Denied", activePolicy.denied], ["Policy Errors", activePolicy.errors]].map(([l, v]) => (
            <div key={l as string} className="rounded border border-[#EEF2F6] bg-[#F8FAFC] py-1.5">
              <div className="text-[16px] font-bold text-slate-900">{v as number}</div><div className="text-[10px] text-slate-500">{l as string}</div>
            </div>
          ))}
        </div>
      </Drawer>

      <Drawer open={drawer === "policyTest"} title="Test Authorization Policy" subtitle="Deterministic local evaluation — no external systems are contacted." onClose={() => setDrawer(null)}>
        <div className="grid gap-2 sm:grid-cols-2 text-[11.5px]">
          {([
            ["principal", "Principal / Role"], ["environment", "Environment"], ["technology", "Technology"],
            ["action", "Action"], ["target", "Resource"], ["packageId", "Package"],
          ] as const).map(([k, l]) => (
            <label key={k} className="block">
              <span className="font-medium text-slate-700">{l}</span>
              <input value={(testCtx as never as Record<string, string>)[k] ?? ""} onChange={(e) => setTestCtx({ ...testCtx, [k]: e.target.value })} className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2 outline-none" />
            </label>
          ))}
          <label className="block">
            <span className="font-medium text-slate-700">Risk</span>
            <select value={testCtx.risk} onChange={(e) => setTestCtx({ ...testCtx, risk: e.target.value as never })} className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2">
              {["low", "medium", "high", "critical"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-medium text-slate-700">Approval</span>
            <select value={testCtx.approvalState} onChange={(e) => setTestCtx({ ...testCtx, approvalState: e.target.value as never })} className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2">
              {["none", "incomplete", "satisfied"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!testCtx.prohibited} onChange={(e) => setTestCtx({ ...testCtx, prohibited: e.target.checked })} />Action explicitly prohibited</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={testCtx.secretAvailable === false} onChange={(e) => setTestCtx({ ...testCtx, secretAvailable: !e.target.checked })} />Credential authority unavailable</label>
        </div>
        <button onClick={() => setTestResult(evaluateAuthorization({ ...testCtx, authorizationId: testCtx.approvalState === "satisfied" ? "EXEC-AUTH-TEST" : undefined }))} className="mt-3 h-8 rounded bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white">Run Evaluation</button>
        {testResult && (
          <div className="mt-3 rounded border border-[#E2E8F0] p-3">
            <DecisionPill d={testResult.decision} />
            <p className="mt-1.5 text-[11.5px] text-slate-700">{testResult.reason}</p>
            <div className="mt-2 grid gap-x-4 gap-y-0.5 text-[11px] sm:grid-cols-2">
              {testResult.trace.map((t) => (
                <div key={t.step} className="flex justify-between gap-2">
                  <span className="text-slate-600">{t.step}</span>
                  <span className={cn("font-semibold", t.state === "PASS" ? "text-emerald-600" : t.state === "FAIL" ? "text-rose-600" : "text-slate-400")}>{t.state}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      <Drawer open={drawer === "createRole"} title="Create Role" subtitle="Mock configuration — no directory objects are created." onClose={() => setDrawer(null)}>
        <div className="space-y-3 text-[11.5px]">
          {["Role Name", "Purpose", "Environment Scope", "Technology Scope"].map((f) => (
            <label key={f} className="block"><span className="font-medium text-slate-700">{f}</span><input className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2" /></label>
          ))}
          <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">Self-approval is not configurable. Roles cannot be granted both authorship and approval authority for the same production package.</div>
          <button onClick={() => setDrawer(null)} className="h-8 rounded bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white">Save Role</button>
        </div>
      </Drawer>

      <Drawer open={drawer === "createIdentity"} title="Create Service Identity" subtitle="Mock wizard — no cloud identity is created." onClose={() => setDrawer(null)}>
        <div className="space-y-3 text-[11.5px]">
          {["Identity Name", "Purpose", "Technology", "Environment"].map((f) => (
            <label key={f} className="block"><span className="font-medium text-slate-700">{f}</span><input className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2" /></label>
          ))}
          <label className="block"><span className="font-medium text-slate-700">Identity Type</span>
            <select className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2">{SERVICE_IDENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          {["Resource Scope", "Permission Scope", "Credential Source", "Session Duration", "Owner"].map((f) => (
            <label key={f} className="block"><span className="font-medium text-slate-700">{f}</span><input className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2" /></label>
          ))}
          <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">Production execution identities should be narrowly scoped and separated from discovery identities.</div>
          <button onClick={() => setDrawer(null)} className="h-8 rounded bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white">Review &amp; Save</button>
        </div>
      </Drawer>

      <Drawer open={drawer === "workflow"} title="Approval Workflow Configuration" subtitle="Simple structured configuration — not a full workflow editor." onClose={() => setDrawer(null)}>
        <div className="space-y-3 text-[11.5px]">
          {["Workflow Name", "Risk Range", "Required Roles", "Approval Order", "Maximum Approval Age", "Escalation"].map((f) => (
            <label key={f} className="block"><span className="font-medium text-slate-700">{f}</span><input className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2" /></label>
          ))}
          <label className="block"><span className="font-medium text-slate-700">Environment</span>
            <select className="mt-1 h-8 w-full rounded border border-[#E2E8F0] px-2">{ENVIRONMENTS.map((e) => <option key={e}>{e}</option>)}</select>
          </label>
          <KV rows={[{ label: "Self Approval Allowed", value: <span className="font-semibold text-rose-700">No</span> }, { label: "Emergency Override", value: "Policy controlled" }]} />
          <button onClick={() => setDrawer(null)} className="h-8 rounded bg-[#1B4F91] px-3 text-[11.5px] font-semibold text-white">Save Workflow</button>
        </div>
      </Drawer>

      <Drawer open={drawer === "breakGlass"} title="Emergency Access Request" subtitle="Break-glass is a governed path, not a bypass." onClose={() => setDrawer(null)}>
        <KV rows={BREAK_GLASS_REQUEST.map((b) => ({ label: b.label, value: b.value }))} />
        <div className="mt-3 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Required</div>
        <ul className="text-[11.5px] text-slate-700">{BREAK_GLASS_REQUIREMENTS.map((r) => <li key={r} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />{r}</li>)}</ul>
        <div className="mt-3 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Flow</div>
        <ol className="space-y-0.5 text-[11px] text-slate-700">{BREAK_GLASS_FLOW.map((f, i) => <li key={f}><span className="mr-1.5 font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>{f}</li>)}</ol>
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2.5">
          <div className="text-[11.5px] font-bold text-amber-900">EMERGENCY ACCESS AUTHORIZED</div>
          <KV rows={[
            { label: "Standing Emergency Credential", value: "NO" },
            { label: "General Administrator Access", value: "NO" },
            { label: "Session Scope", value: "Restricted" },
            { label: "Session Recording", value: "Enabled" },
            { label: "Post-Event Review", value: "Required" },
          ]} />
        </div>
      </Drawer>

      <Drawer open={drawer === "insight"} title={activeInsight.finding} subtitle={`${activeInsight.id} · ${activeInsight.severity} severity`} onClose={() => setDrawer(null)}>
        <KV rows={[
          { label: "Evidence", value: activeInsight.evidence },
          { label: "Affected Principal", value: activeInsight.principal },
          { label: "Affected Capability", value: activeInsight.capability },
          { label: "Risk", value: activeInsight.risk },
          { label: "Recommended Action", value: activeInsight.recommended },
          { label: "Policy", value: activeInsight.policy },
          { label: "Owner", value: activeInsight.owner },
          { label: "Due Date", value: activeInsight.due },
          { label: "Disposition", value: activeInsight.disposition },
        ]} />
        <p className="mt-3 text-[11px] text-slate-500">Findings are observations. Identity permissions are never automatically remediated.</p>
      </Drawer>

      <Drawer open={drawer === "reviews"} title="Access Reviews" subtitle="Review lifecycle and current findings." onClose={() => setDrawer(null)}>
        <ol className="space-y-1 text-[11.5px] text-slate-700">
          {REVIEW_LIFECYCLE.map((s, i) => <li key={s}><span className="mr-1.5 font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>{s}</li>)}
        </ol>
        <div className="mt-3 space-y-1.5">
          {REVIEW_CATEGORIES.map((c) => (
            <div key={c.label} className="flex items-center justify-between rounded border border-[#EEF2F6] px-2.5 py-1.5 text-[11.5px]">
              <span className="text-slate-700">{c.label}</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("font-semibold", c.count ? "text-amber-600" : "text-emerald-600")}>{c.count}</span>
                {c.count > 0 && ["Revoke", "Retain", "Modify"].map((a) => <button key={a} className="rounded border border-[#E2E8F0] px-1.5 text-[10px] text-slate-600 hover:bg-slate-50">{a}</button>)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">
          Stale AWS execution identity detected — policy response for this demo: <b>block new production execution until identity reviewed</b>. Digital Twin: unaffected · Engineering: unaffected.
        </div>
      </Drawer>

      <Drawer open={drawer === "export"} title="Export Access Report" subtitle="Simulated report compilation." onClose={() => setDrawer(null)}>
        <ol className="space-y-1.5 text-[11.5px]">
          {EXPORT_STEPS.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2", i <= exportStep ? "text-slate-800" : "text-slate-400")}>
              {i <= exportStep ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />}{s}
            </li>
          ))}
        </ol>
      </Drawer>
    </div>
  );
}
