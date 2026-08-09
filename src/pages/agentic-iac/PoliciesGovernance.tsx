import { useMemo, useState } from "react";
import {
  Scale, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, X,
  FileText, Layers, GitBranch, Gauge, Workflow, ClipboardCheck, LineChart,
  FlaskConical, History, ChevronRight, Play, Download, BookOpen, Plus, Code2, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  POLICIES, POLICY_TOTALS, COVERAGE_BY_DOMAIN, COVERAGE_MATRIX, POLICY_CATEGORIES,
  ENFORCEMENT_SUMMARY, POLICY_SETS, POLICY_PRECEDENCE, CONFLICT_EXAMPLE, RISK_LEVELS,
  RISK_FACTORS, CP_RISK_EXPLAIN, APPROVAL_RULES, VALIDATION_RULES, SQL_EBS_VALIDATION,
  ENFORCEMENT_POINTS, ENFORCEMENT_PIPELINE, RUNTIME_SAFETY_RULES, EFFECTIVENESS,
  CHANGE_HISTORY, PROHIBITED_EXAMPLES, EVALUATION_EXAMPLE, EXPORT_STEPS,
  DEFAULT_SIM, SIM_ACTIONS, SIM_ENVIRONMENTS, SIM_SIZES, runSimulation,
  type Policy, type SimInput, type SimResult,
} from "./platform/policyData";

/* ───────────────────────── primitives ───────────────────────── */

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

function Metric({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: "ok" | "warn" | "bad" }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-3">
      <div className="text-[10.5px] uppercase tracking-[0.06em] text-slate-500">{label}</div>
      <div className={cn("mt-1 text-[22px] font-semibold leading-none",
        tone === "ok" ? "text-emerald-600" : tone === "bad" ? "text-rose-600" : tone === "warn" ? "text-amber-600" : "text-slate-900")}>{value}</div>
      {sub && <div className="mt-1 text-[10.5px] text-slate-500">{sub}</div>}
    </div>
  );
}

function Drawer({ open, title, subtitle, onClose, children, wide }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <button aria-label="Close" onClick={onClose} className="flex-1 bg-slate-900/25" />
      <aside className={cn("flex h-full flex-col border-l border-[#E2E8F0] bg-white shadow-xl", wide ? "w-[720px]" : "w-[520px]")}>
        <header className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-3.5">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close panel" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
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

function RuleCard({ index, when, then, effect }: { index: string | number; when: string[]; then: string; effect: string }) {
  const tone = effect === "deny" ? "bad" : effect === "approval" ? "warn" : effect === "halt" ? "bad" : effect === "warn" ? "warn" : "ok";
  return (
    <div className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-700">Rule {index}</span>
        <Pill tone={tone as never}>{effect.toUpperCase()}</Pill>
      </div>
      <div className="text-[11.5px] text-slate-600">
        <span className="font-semibold text-slate-500">IF</span>{" "}
        {when.map((w, i) => (
          <span key={w}>
            <span className="text-slate-800">{w}</span>
            {i < when.length - 1 && <span className="font-semibold text-slate-500"> AND </span>}
          </span>
        ))}
      </div>
      <div className="mt-1 text-[11.5px] text-slate-600">
        <span className="font-semibold text-slate-500">THEN</span> <span className="text-slate-800">{then}</span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "library", label: "Policy Library", icon: FileText },
  { id: "sets", label: "Policy Sets", icon: Layers },
  { id: "risk", label: "Risk Classification", icon: Gauge },
  { id: "enforcement", label: "Enforcement Rules", icon: Workflow },
  { id: "approval", label: "Approval Rules", icon: ClipboardCheck },
  { id: "validation", label: "Validation Rules", icon: ShieldCheck },
  { id: "insights", label: "Policy Insights", icon: LineChart },
  { id: "simulation", label: "Policy Simulation", icon: FlaskConical },
  { id: "history", label: "Change History", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ───────────────────────── page ───────────────────────── */

export default function PoliciesGovernance() {
  const [tab, setTab] = useState<TabId>("library");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [showLogic, setShowLogic] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [setDetail, setSetDetail] = useState<(typeof POLICY_SETS)[number] | null>(null);
  const [riskDetail, setRiskDetail] = useState<(typeof RISK_LEVELS)[number] | null>(null);
  const [approvalDetail, setApprovalDetail] = useState<(typeof APPROVAL_RULES)[number] | null>(null);
  const [enforcementDetail, setEnforcementDetail] = useState<(typeof ENFORCEMENT_POINTS)[number] | null>(null);
  const [conflictRun, setConflictRun] = useState(false);
  const [exportStep, setExportStep] = useState<number | null>(null);

  const [sim, setSim] = useState<SimInput>(DEFAULT_SIM);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [envFilter, setEnvFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => POLICIES.filter((p) =>
      (typeFilter === "All" || p.type === typeFilter) &&
      (envFilter === "All" || p.appliesTo.includes(envFilter)) &&
      (search.trim() === "" || `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()))),
    [typeFilter, envFilter, search],
  );

  function runExport() {
    setExportStep(0);
    EXPORT_STEPS.forEach((_, i) => setTimeout(() => setExportStep(i), i * 260));
    setTimeout(() => setExportStep(null), EXPORT_STEPS.length * 260 + 1600);
  }

  const decisionTone = (d: SimResult["decision"]) => (d === "allow" ? "ok" : d === "deny" ? "bad" : "warn");
  const decisionLabel = (d: SimResult["decision"]) => (d === "allow" ? "ALLOW" : d === "deny" ? "DENY" : "APPROVAL REQUIRED");

  return (
    <div className="px-5 py-4">
      {/* header */}
      <nav className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
        <span>Platform Administration</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">Policies &amp; Governance</span>
      </nav>

      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[21px] font-semibold tracking-tight text-slate-900">Policies &amp; Governance</h1>
            <Pill tone="ok">Customer Hosted</Pill>
          </div>
          <p className="mt-1 max-w-[880px] text-[12.5px] text-slate-600">
            Define and manage the policies that control what Intelligent IaC can observe, recommend, engineer, approve, execute, and validate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
            <BookOpen className="h-3.5 w-3.5" /> Policy Guide
          </button>
          <button onClick={() => setCreateOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-medium text-white hover:bg-[#173F74]">
            <Plus className="h-3.5 w-3.5" /> Create Policy
          </button>
        </div>
      </div>

      {/* principle banner */}
      <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#CFE0F3] bg-[#EFF4FB] px-4 py-2.5">
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4F91]" />
        <div className="text-[12px] text-slate-700">
          <span className="font-semibold text-[#1B4F91]">Policy defines the boundary of autonomy.</span>{" "}
          The platform does not decide its own authority. Policy determines what can be observed, diagnosed, engineered,
          executed autonomously, approved, validated, retained as evidence — and what is prohibited outright.
        </div>
      </div>

      {/* tabs */}
      <div className="mt-3 flex flex-wrap gap-1 rounded-lg border border-[#E2E8F0] bg-white p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors",
                active ? "bg-[#EFF4FB] font-medium text-[#1B4F91] ring-1 ring-inset ring-[#CFE0F3]" : "text-slate-600 hover:bg-slate-50")}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="min-w-0 space-y-3">
          {/* summary metrics */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Metric label="Total Policies" value={POLICY_TOTALS.totalPolicies} sub="Active" />
            <Metric label="Policy Sets" value={POLICY_TOTALS.policySets} sub="Published" />
            <Metric label="Critical / High Rules" value={POLICY_TOTALS.criticalHighRules} sub="Enforced" />
            <Metric label="Approval Workflows" value={POLICY_TOTALS.approvalWorkflows} sub="Active" />
            <Metric label="Violations (24h)" value={POLICY_TOTALS.violations24h} sub="No active violations" tone="ok" />
            <Metric label="Policy Conflicts" value={POLICY_TOTALS.conflicts} sub="None detected" tone="ok" />
            <Metric label="Governance Health" value={`${POLICY_TOTALS.governanceHealth}%`} sub="Excellent" tone="ok" />
          </div>

          {tab === "library" && (
            <>
              <Panel
                title={`Policy Library (${filtered.length} of ${POLICIES.length} shown · ${POLICY_TOTALS.totalPolicies} total)`}
                action={
                  <div className="flex items-center gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search policies"
                      className="h-7 w-40 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 text-[11.5px] outline-none focus:bg-white" />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-7 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700">
                      <option>All</option>
                      {POLICY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} className="h-7 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700">
                      <option>All</option>
                      <option>Production</option>
                      <option>Non-Production</option>
                    </select>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-[11.5px]">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                        <th className="py-2 pr-3 font-medium">Policy Name</th>
                        <th className="py-2 pr-3 font-medium">Type</th>
                        <th className="py-2 pr-3 font-medium">Applies To</th>
                        <th className="py-2 pr-3 font-medium">Description</th>
                        <th className="py-2 pr-3 font-medium">Risk Coverage</th>
                        <th className="py-2 pr-3 font-medium">Version</th>
                        <th className="py-2 pr-3 font-medium">Status</th>
                        <th className="py-2 pr-3 font-medium">Last Updated</th>
                        <th className="py-2 pr-3 font-medium">Owner</th>
                        <th className="py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-[#FBFCFE]">
                          <td className="py-2 pr-3 font-medium text-slate-800">{p.name}</td>
                          <td className="py-2 pr-3 text-slate-600">{p.type}</td>
                          <td className="py-2 pr-3 text-slate-600">{p.appliesTo}</td>
                          <td className="max-w-[300px] py-2 pr-3 text-slate-600">{p.description}</td>
                          <td className="py-2 pr-3 text-slate-600">{p.riskCoverage}</td>
                          <td className="py-2 pr-3 tabular-nums text-slate-600">{p.version}</td>
                          <td className="py-2 pr-3"><Pill tone="ok"><CheckCircle2 className="h-3 w-3" />{p.status}</Pill></td>
                          <td className="py-2 pr-3 text-slate-600">{p.lastUpdated}</td>
                          <td className="py-2 pr-3 text-slate-600">{p.owner}</td>
                          <td className="py-2">
                            <button onClick={() => { setPolicy(p); setShowLogic(false); }} className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[11px] text-[#1B4F91] hover:bg-[#EFF4FB]">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <Panel title="Policy Precedence">
                  <ol className="space-y-1">
                    {POLICY_PRECEDENCE.map((p, i) => (
                      <li key={p} className="flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px] text-slate-700">
                        <span className="grid h-5 w-5 place-items-center rounded bg-[#EFF4FB] text-[10px] font-semibold text-[#1B4F91]">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-[11.5px] text-slate-700">
                    <div className="font-semibold text-rose-700">A lower-priority ALLOW cannot override a higher-priority DENY.</div>
                    <div className="mt-1.5 space-y-0.5">
                      <div>Human approval: <span className="font-medium">Present</span></div>
                      <div>Destructive Action Policy: <span className="font-medium text-rose-700">DENY</span></div>
                      <div className="pt-1">Final decision: <span className="font-semibold text-rose-700">DENY</span></div>
                    </div>
                  </div>
                </Panel>

                <Panel title="Policy Conflict Detection" action={<Pill tone="ok">Current conflicts: 0</Pill>}>
                  <div className="space-y-1.5 text-[11.5px]">
                    <Field label="Policy A" value={CONFLICT_EXAMPLE.policyA} />
                    <Field label="Policy B" value={CONFLICT_EXAMPLE.policyB} />
                    <Field label="Target" value={CONFLICT_EXAMPLE.target} />
                  </div>
                  <button onClick={() => setConflictRun(true)} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
                    <Play className="h-3.5 w-3.5" /> Simulate Conflict
                  </button>
                  {conflictRun && (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11.5px] text-slate-700">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> Conflict {CONFLICT_EXAMPLE.conflict}</div>
                      <div className="mt-1">Resolution: {CONFLICT_EXAMPLE.resolution}</div>
                      <div className="mt-1 font-semibold text-rose-700">Final: {CONFLICT_EXAMPLE.final}</div>
                    </div>
                  )}
                </Panel>
              </div>

              <Panel title="Prohibited by Default — Destructive Action Policy v2.1">
                <div className="flex flex-wrap gap-2">
                  {PROHIBITED_EXAMPLES.map((e) => (
                    <span key={e} className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11.5px] text-rose-700">
                      <XCircle className="h-3.5 w-3.5" /> {e}
                    </span>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {tab === "sets" && (
            <Panel title={`Policy Sets (${POLICY_SETS.length})`}>
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {POLICY_SETS.map((s) => (
                  <button key={s.id} onClick={() => setSetDetail(s)} className="rounded-lg border border-[#E2E8F0] bg-[#FBFCFE] p-3 text-left hover:border-[#CFE0F3] hover:bg-[#F7FAFE]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-semibold text-slate-800">{s.name}</span>
                      <Pill tone={s.status === "Active" ? "ok" : "neutral"}>{s.status}</Pill>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600">
                      <div>Policies: <span className="font-medium text-slate-800">{s.policies.length}</span></div>
                      <div>Version: <span className="font-medium text-slate-800">{s.version}</span></div>
                      <div>Environment: <span className="font-medium text-slate-800">{s.environment}</span></div>
                      <div>Technology: <span className="font-medium text-slate-800">{s.technology}</span></div>
                      <div>Published: <span className="font-medium text-slate-800">{s.lastPublished}</span></div>
                      <div>Owner: <span className="font-medium text-slate-800">{s.owner}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {tab === "risk" && (
            <>
              <Panel title="Risk Classification Model">
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-5">
                  {RISK_LEVELS.map((r) => (
                    <button key={r.id} onClick={() => setRiskDetail(r)} className="rounded-lg border border-[#E2E8F0] bg-[#FBFCFE] p-3 text-left hover:bg-[#F7FAFE]">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                        <span className="text-[12.5px] font-semibold text-slate-800">{r.label}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-600">{r.description}</p>
                      <div className="mt-2 text-[10.5px] font-medium text-[#1B4F91]">{r.authority}</div>
                    </button>
                  ))}
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
                <Panel title="Risk Classification Factors">
                  <div className="flex flex-wrap gap-1.5">
                    {RISK_FACTORS.map((f) => (
                      <span key={f} className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2 py-1 text-[11px] text-slate-700">{f}</span>
                    ))}
                  </div>
                </Panel>

                <Panel title="Risk Explainability — CP-2026-01842">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                    <div>
                      {CP_RISK_EXPLAIN.inputs.map((i) => <Field key={i.label} label={i.label} value={i.value} />)}
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="text-[10.5px] uppercase tracking-[0.06em] text-amber-700">Result</div>
                      <div className="text-[18px] font-semibold text-amber-700">{CP_RISK_EXPLAIN.result}</div>
                      <div className="mt-1 text-[11.5px] text-slate-700">Score: <span className="font-semibold">{CP_RISK_EXPLAIN.score} / 100</span></div>
                      <div className="text-[11.5px] text-slate-700">Confidence: <span className="font-semibold">{CP_RISK_EXPLAIN.confidence}%</span></div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] p-3">
                      <div className="text-[11px] font-semibold text-slate-700">Why it is not Low</div>
                      <ul className="mt-1.5 space-y-1 text-[11.5px] text-slate-600">
                        {CP_RISK_EXPLAIN.notLow.map((x) => <li key={x} className="flex gap-1.5"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />{x}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] p-3">
                      <div className="text-[11px] font-semibold text-slate-700">Why it is not High</div>
                      <ul className="mt-1.5 space-y-1 text-[11.5px] text-slate-600">
                        {CP_RISK_EXPLAIN.notHigh.map((x) => <li key={x} className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />{x}</li>)}
                      </ul>
                    </div>
                  </div>
                </Panel>
              </div>
            </>
          )}

          {tab === "enforcement" && (
            <>
              <Panel title="Policy Enforcement Pipeline">
                <div className="flex flex-wrap items-center gap-1.5">
                  {ENFORCEMENT_PIPELINE.map((s, i) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1 text-[11px] font-medium text-[#1B4F91]">{s}</span>
                      {i < ENFORCEMENT_PIPELINE.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] text-slate-600">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Policy evaluation occurs multiple times across the lifecycle. It is not only a pre-execution check.
                </p>
              </Panel>

              <Panel title="Enforcement Points">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                      <th className="py-2 pr-3 font-medium">Enforcement Point</th>
                      <th className="py-2 pr-3 font-medium">Policies Evaluated</th>
                      <th className="py-2 pr-3 font-medium">Decision Type</th>
                      <th className="py-2 pr-3 font-medium">Failure Behavior</th>
                      <th className="py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {ENFORCEMENT_POINTS.map((e) => (
                      <tr key={e.point} className="border-b border-slate-100 last:border-0 hover:bg-[#FBFCFE]">
                        <td className="py-2 pr-3 font-medium text-slate-800">{e.point}</td>
                        <td className="py-2 pr-3 text-slate-600">{e.policiesEvaluated.join(", ")}</td>
                        <td className="py-2 pr-3 text-slate-600">{e.decisionType}</td>
                        <td className="py-2 pr-3 text-slate-600">{e.failureBehavior}</td>
                        <td className="py-2">
                          <button onClick={() => setEnforcementDetail(e)} className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[11px] text-[#1B4F91] hover:bg-[#EFF4FB]">Detail</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="Runtime Safety Rules — aligned with Execution Center">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {RUNTIME_SAFETY_RULES.map((r, i) => (
                    <RuleCard key={r.when} index={i + 1} when={[r.when]} then={r.then} effect={r.effect} />
                  ))}
                </div>
              </Panel>
            </>
          )}

          {tab === "approval" && (
            <>
              <Panel title="Approval Rules">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                      <th className="py-2 pr-3 font-medium">Workflow</th>
                      <th className="py-2 pr-3 font-medium">Environment</th>
                      <th className="py-2 pr-3 font-medium">Risk</th>
                      <th className="py-2 pr-3 font-medium">Required Approvers</th>
                      <th className="py-2 pr-3 font-medium">SLA</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {APPROVAL_RULES.map((a) => (
                      <tr key={a.workflow} className="border-b border-slate-100 last:border-0 hover:bg-[#FBFCFE]">
                        <td className="py-2 pr-3 font-medium text-slate-800">{a.workflow}</td>
                        <td className="py-2 pr-3 text-slate-600">{a.environment}</td>
                        <td className="py-2 pr-3 text-slate-600">{a.risk}</td>
                        <td className="py-2 pr-3 text-slate-600">{a.approvers}</td>
                        <td className="py-2 pr-3 text-slate-600">{a.sla}</td>
                        <td className="py-2 pr-3"><Pill tone="ok">{a.status}</Pill></td>
                        <td className="py-2">
                          <button onClick={() => setApprovalDetail(a)} className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[11px] text-[#1B4F91] hover:bg-[#EFF4FB]">Detail</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="Production Medium Risk — Applied to CP-2026-01842">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <SectionLabel>Required Approvers (sequential)</SectionLabel>
                    {["Change Manager", "Database SME", "Infrastructure Owner"].map((r, i) => (
                      <div key={r} className="flex items-center gap-2 border-b border-slate-100 py-1.5 text-[12px] last:border-0">
                        <span className="grid h-5 w-5 place-items-center rounded bg-[#EFF4FB] text-[10px] font-semibold text-[#1B4F91]">{i + 1}</span>
                        <span className="text-slate-800">{r}</span>
                        <Pill tone="ok"><CheckCircle2 className="h-3 w-3" />Approved</Pill>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Field label="Self Approval" value="No" />
                    <Field label="Sequential" value="Yes" />
                    <Field label="SLA" value="4 hours" />
                    <Field label="Authorization" value="Generated after final approval" />
                    <Field label="Authorization ID" value="EXEC-AUTH-01842" />
                    <Field label="Used By" value="CP-2026-01842" />
                  </div>
                </div>
              </Panel>
            </>
          )}

          {tab === "validation" && (
            <>
              <Panel title="Validation Rules">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                      <th className="py-2 pr-3 font-medium">Category</th>
                      <th className="py-2 pr-3 font-medium">Environment</th>
                      <th className="py-2 pr-3 font-medium">Risk Threshold</th>
                      <th className="py-2 pr-3 font-medium">Mandatory</th>
                      <th className="py-2 pr-3 font-medium">Minimum Tests</th>
                      <th className="py-2 font-medium">Failure Behavior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VALIDATION_RULES.map((v) => (
                      <tr key={v.category} className="border-b border-slate-100 last:border-0 hover:bg-[#FBFCFE]">
                        <td className="py-2 pr-3 font-medium text-slate-800">{v.category}</td>
                        <td className="py-2 pr-3 text-slate-600">{v.environment}</td>
                        <td className="py-2 pr-3 text-slate-600">{v.riskThreshold}</td>
                        <td className="py-2 pr-3">{v.mandatory ? <Pill tone="ok">Mandatory</Pill> : <Pill>Optional</Pill>}</td>
                        <td className="py-2 pr-3 tabular-nums text-slate-600">{v.minimumTests}</td>
                        <td className="py-2 text-slate-600">{v.failureBehavior}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="SQL / EBS Validation Policy — CP-2026-01842">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {SQL_EBS_VALIDATION.map((s) => <Metric key={s.label} label={s.label} value={s.value} />)}
                  <Metric label="Total" value={21} sub="Required pass 21 / 21" tone="ok" />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-[11.5px] text-slate-700">
                    <span className="font-semibold text-rose-700">Critical test failure</span> — blocks closure.
                  </div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11.5px] text-slate-700">
                    <span className="font-semibold text-amber-700">Application failure</span> — change is not complete.
                  </div>
                </div>
              </Panel>
            </>
          )}

          {tab === "insights" && (
            <>
              <Panel title="Policy Effectiveness (Last 30 Days)">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Metric label="Total Evaluations" value={EFFECTIVENESS.totalEvaluations.toLocaleString()} />
                  <Metric label="Allowed" value={`${EFFECTIVENESS.allowed.toLocaleString()} (88%)`} tone="ok" />
                  <Metric label="Approval Required" value={`${EFFECTIVENESS.approvalRequired} (10%)`} tone="warn" />
                  <Metric label="Denied" value={`${EFFECTIVENESS.denied} (2%)`} tone="bad" />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <SectionLabel>Top Deny Reasons</SectionLabel>
                    {EFFECTIVENESS.topDenyReasons.map((r) => (
                      <div key={r.reason} className="mb-1.5">
                        <div className="flex justify-between text-[11.5px] text-slate-700"><span>{r.reason}</span><span className="tabular-nums">{r.count} ({r.pct}%)</span></div>
                        <div className="mt-0.5 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-rose-400" style={{ width: `${r.pct}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <SectionLabel>Most Evaluated Policies</SectionLabel>
                    {EFFECTIVENESS.mostEvaluated.map((m) => <Field key={m.policy} label={m.policy} value={m.count.toLocaleString()} />)}
                  </div>
                </div>
              </Panel>

              <Panel title="Policy Evaluation Example" action={<Pill tone="ok">ALLOW</Pill>}>
                {EVALUATION_EXAMPLE.map((e) => <Field key={e.label} label={e.label} value={e.value} />)}
                <button onClick={() => setTab("simulation")} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-[#1B4F91] hover:bg-[#EFF4FB]">
                  Run Policy Simulation <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Panel>
            </>
          )}

          {tab === "simulation" && (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[330px_minmax(0,1fr)]">
              <Panel title="Simulation Inputs">
                <div className="space-y-2.5 text-[11.5px]">
                  <label className="block">
                    <span className="text-slate-500">Environment</span>
                    <select value={sim.environment} onChange={(e) => setSim({ ...sim, environment: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">
                      {SIM_ENVIRONMENTS.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-slate-500">Action</span>
                    <select value={sim.action} onChange={(e) => setSim({ ...sim, action: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">
                      {SIM_ACTIONS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-slate-500">Technology</span>
                    <input value={sim.technology} onChange={(e) => setSim({ ...sim, technology: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]" />
                  </label>
                  <label className="block">
                    <span className="text-slate-500">Asset / Target</span>
                    <input value={sim.asset} onChange={(e) => setSim({ ...sim, asset: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] font-mono" />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-slate-500">Current State</span>
                      <input value={sim.currentState} onChange={(e) => setSim({ ...sim, currentState: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]" />
                    </label>
                    <label className="block">
                      <span className="text-slate-500">Requested State</span>
                      <select value={sim.requestedState} onChange={(e) => setSim({ ...sim, requestedState: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">
                        {SIM_SIZES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-slate-500">Business Criticality</span>
                    <select value={sim.criticality} onChange={(e) => setSim({ ...sim, criticality: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">
                      <option>Tier 1</option><option>Tier 2</option><option>Tier 3</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-slate-500">Change Package</span>
                    <select value={sim.packageId} onChange={(e) => setSim({ ...sim, packageId: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">
                      <option>CP-2026-01842 v1.0</option><option>None</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-slate-500">Role / Identity</span>
                    <input value={sim.role} onChange={(e) => setSim({ ...sim, role: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]" />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-slate-500">Approvals</span>
                      <select value={sim.approvals} onChange={(e) => setSim({ ...sim, approvals: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">
                        <option>3 / 3</option><option>2 / 3</option><option>0 / 3</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-slate-500">Validation</span>
                      <input value={sim.validation} onChange={(e) => setSim({ ...sim, validation: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-slate-500">Recovery</span>
                    <input value={sim.recovery} onChange={(e) => setSim({ ...sim, recovery: e.target.value })} className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]" />
                  </label>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setSimResult(runSimulation(sim))} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-medium text-white hover:bg-[#173F74]">
                      <Play className="h-3.5 w-3.5" /> Run Policy Simulation
                    </button>
                    <button onClick={() => { setSim(DEFAULT_SIM); setSimResult(null); }} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">Reset</button>
                  </div>
                </div>
              </Panel>

              <div className="space-y-3">
                <Panel title="Simulation Result">
                  {!simResult ? (
                    <p className="text-[12px] text-slate-500">Configure the scenario and run the simulation. The default scenario is CP-2026-01842 (Production EBS expansion, 500 GB → 750 GB).</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={cn("rounded-md px-3 py-2 text-[16px] font-semibold ring-1 ring-inset",
                          simResult.decision === "allow" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : simResult.decision === "deny" ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-amber-50 text-amber-700 ring-amber-200")}>
                          {decisionLabel(simResult.decision)}
                        </div>
                        <Pill tone={decisionTone(simResult.decision) as never}>Risk: {simResult.risk.toUpperCase()}</Pill>
                        <Pill>Policies evaluated: {simResult.policiesEvaluated}</Pill>
                        <Pill tone="ok">Passed: {simResult.passed}</Pill>
                        {simResult.policy && <Pill tone="info">{simResult.policy}</Pill>}
                      </div>
                      <p className="mt-3 text-[12px] text-slate-700">{simResult.reason}</p>
                      <div className="mt-3">{simResult.detail.map((d) => <Field key={d.label} label={d.label} value={d.value} />)}</div>
                      {simResult.requiredApprovers && (
                        <>
                          <SectionLabel>Required Approvers</SectionLabel>
                          <div className="flex flex-wrap gap-1.5">{simResult.requiredApprovers.map((a) => <Pill key={a} tone="warn">{a}</Pill>)}</div>
                        </>
                      )}
                      {simResult.requiredValidation && (
                        <>
                          <SectionLabel>Required Validation</SectionLabel>
                          <div className="flex flex-wrap gap-1.5">{simResult.requiredValidation.map((a) => <Pill key={a} tone="info">{a}</Pill>)}</div>
                        </>
                      )}
                    </>
                  )}
                </Panel>

                <Panel title="Preset Scenarios">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {[
                      { label: "Approved change (CP-2026-01842)", desc: "Production EBS 500 → 750 GB, 3/3 approvals", input: DEFAULT_SIM },
                      { label: "Parameter violation", desc: "Requested 1 TB exceeds approved package", input: { ...DEFAULT_SIM, requestedState: "1 TB" } },
                      { label: "Destructive action", desc: "Delete production EBS volume", input: { ...DEFAULT_SIM, action: "Delete EBS Volume" } },
                      { label: "Non-production change", desc: "Restart Windows service in Non-Production", input: { ...DEFAULT_SIM, environment: "Non-Production", action: "Restart Windows Service", asset: "WIN-DEV-04", technology: "Windows" } },
                      { label: "Firewall rule", desc: "Add production allow rule (High risk)", input: { ...DEFAULT_SIM, action: "Add Production Allow Rule", technology: "Firewall", asset: "fw-prod-edge-01" } },
                      { label: "Policy conflict", desc: "Restart Tier 1 production VM", input: { ...DEFAULT_SIM, action: "Restart Tier 1 Production VM", asset: "VM-PROD-TIER1-02" } },
                    ].map((s) => (
                      <button key={s.label} onClick={() => { setSim(s.input as SimInput); setSimResult(runSimulation(s.input as SimInput)); }}
                        className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] p-2.5 text-left hover:bg-[#F7FAFE]">
                        <div className="text-[12px] font-medium text-slate-800">{s.label}</div>
                        <div className="text-[11px] text-slate-500">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {tab === "history" && (
            <Panel title="Policy Change History">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-[0.05em] text-slate-500">
                    <th className="py-2 pr-3 font-medium">ID</th>
                    <th className="py-2 pr-3 font-medium">Policy</th>
                    <th className="py-2 pr-3 font-medium">Version</th>
                    <th className="py-2 pr-3 font-medium">Changed By</th>
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Reason</th>
                    <th className="py-2 font-medium">Change Record</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANGE_HISTORY.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-[#FBFCFE]">
                      <td className="py-2 pr-3 font-mono text-slate-700">{c.id}</td>
                      <td className="py-2 pr-3 font-medium text-slate-800">{c.policy}</td>
                      <td className="py-2 pr-3 tabular-nums text-slate-600">{c.from} → {c.to}</td>
                      <td className="py-2 pr-3 text-slate-600">{c.actor}</td>
                      <td className="py-2 pr-3 tabular-nums text-slate-600">{c.date}</td>
                      <td className="py-2 pr-3 text-slate-600">{c.reason}</td>
                      <td className="py-2 font-mono text-slate-600">{c.approval}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>

        {/* right rail */}
        <aside className="space-y-3">
          <Panel title="Policy Coverage by Domain">
            {COVERAGE_BY_DOMAIN.map((d) => (
              <div key={d.domain} className="mb-2 last:mb-0">
                <div className="flex justify-between text-[11.5px] text-slate-700"><span>{d.domain}</span><span className="tabular-nums font-medium">{d.count}</span></div>
                <div className="mt-0.5 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#1B4F91]" style={{ width: `${(d.count / 12) * 100}%` }} /></div>
              </div>
            ))}
            <button onClick={() => setMatrixOpen(true)} className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-[#E2E8F0] text-[12px] font-medium text-[#1B4F91] hover:bg-[#EFF4FB]">
              View Coverage Matrix <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </Panel>

          <Panel title="Policy Enforcement Summary">
            {ENFORCEMENT_SUMMARY.map((e) => (
              <div key={e.label} className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 text-[11.5px] last:border-0">
                <span className="text-slate-600">{e.label}</span>
                <span className={cn("font-medium",
                  e.tone === "ok" ? "text-emerald-600" : e.tone === "warn" ? "text-amber-600" : e.tone === "bad" ? "text-rose-600" : "text-[#1B4F91]")}>{e.value}</span>
              </div>
            ))}
            <p className="mt-2 text-[10.5px] text-slate-500">Consistent with Access &amp; Governance authority model.</p>
          </Panel>

          <Panel title="Quick Actions">
            <div className="space-y-1.5">
              {[
                { label: "Create Policy", icon: Plus, onClick: () => setCreateOpen(true) },
                { label: "Create Policy Set", icon: Layers, onClick: () => setCreateOpen(true) },
                { label: "Simulate Policy", icon: FlaskConical, onClick: () => setTab("simulation") },
                { label: "View Approval Workflows", icon: ClipboardCheck, onClick: () => setTab("approval") },
                { label: "View Policy Violations", icon: ShieldAlert, onClick: () => setTab("insights") },
                { label: "Export Policy Report", icon: Download, onClick: runExport },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} onClick={a.onClick} className="flex h-8 w-full items-center gap-2 rounded-md border border-[#E2E8F0] px-2.5 text-[12px] text-slate-700 hover:bg-slate-50">
                    <Icon className="h-3.5 w-3.5 text-slate-500" /> {a.label}
                  </button>
                );
              })}
            </div>
            {exportStep !== null && (
              <div className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-2 text-[11px] text-[#1B4F91]">
                {EXPORT_STEPS[exportStep]}
              </div>
            )}
          </Panel>

          <Panel title="Governance Health">
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-emerald-500 text-[15px] font-semibold text-emerald-600">98%</div>
              <ul className="space-y-0.5 text-[11px] text-slate-600">
                <li>Policy coverage</li><li>Conflict-free evaluation</li><li>Approval adherence</li><li>Validation completeness</li><li>Evidence integrity</li>
              </ul>
            </div>
          </Panel>
        </aside>
      </div>

      {/* ── drawers ── */}
      <Drawer open={!!policy} title={policy?.name ?? ""} subtitle={policy ? `${policy.type} · v${policy.version} · ${policy.status}` : ""} onClose={() => setPolicy(null)} wide>
        {policy && (
          <>
            <p className="text-[12px] text-slate-700">{policy.description}</p>

            <SectionLabel>Ownership &amp; Lifecycle</SectionLabel>
            <Field label="Owner" value={policy.owner} />
            <Field label="Business Owner" value={policy.businessOwner} />
            <Field label="Security Owner" value={policy.securityOwner} />
            <Field label="Effective Date" value={policy.effectiveDate} />
            <Field label="Review Date" value={policy.reviewDate} />
            <Field label="Version" value={policy.version} />
            <Field label="Status" value={<Pill tone="ok">{policy.status}</Pill>} />

            <SectionLabel>Scope</SectionLabel>
            <Field label="Environment Scope" value={policy.environmentScope} />
            <Field label="Technology Scope" value={policy.technologyScope} />
            <Field label="Risk Scope" value={policy.riskScope} />
            <Field label="Enforcement Points" value={policy.enforcementPoint.join(", ")} />
            <Field label="Dependencies" value={policy.dependencies.length ? policy.dependencies.join(", ") : "None"} />

            <SectionLabel>Rules</SectionLabel>
            <div className="space-y-2">
              {policy.rules.map((r, i) => <RuleCard key={r.id} index={i + 1} when={r.when} then={r.then} effect={r.effect} />)}
            </div>
            <button onClick={() => setShowLogic((s) => !s)} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-[#1B4F91] hover:bg-[#EFF4FB]">
              <Code2 className="h-3.5 w-3.5" /> {showLogic ? "Hide Policy Logic" : "View Policy Logic"}
            </button>
            {showLogic && (
              <pre className="mt-2 overflow-x-auto rounded-md border border-[#E2E8F0] bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">{policy.logic}</pre>
            )}

            <SectionLabel>Requirements</SectionLabel>
            <Field label="Approval" value={policy.approvalRequirements.length ? policy.approvalRequirements.join(" · ") : "None"} />
            <Field label="Validation" value={policy.validationRequirements.length ? policy.validationRequirements.join(" · ") : "None"} />
            <Field label="Evidence" value={policy.evidenceRequirements.length ? policy.evidenceRequirements.join(" · ") : "None"} />
            <Field label="Exceptions" value={policy.exceptions.length ? policy.exceptions.join(" · ") : "None"} />

            <SectionLabel>Operational State</SectionLabel>
            <Field label="Last Evaluated" value={policy.lastEvaluated} />
            <Field label="Evaluation Count" value={policy.evaluationCount.toLocaleString()} />
            <Field label="Violations" value={<span className={policy.violations ? "text-rose-600" : "text-emerald-600"}>{policy.violations}</span>} />

            <SectionLabel>Change History</SectionLabel>
            {CHANGE_HISTORY.filter((c) => c.policy === policy.name).length === 0
              ? <p className="text-[11.5px] text-slate-500">No changes in the current retention window.</p>
              : CHANGE_HISTORY.filter((c) => c.policy === policy.name).map((c) => (
                <div key={c.id} className="border-b border-slate-100 py-1.5 text-[11.5px] last:border-0">
                  <div className="flex justify-between"><span className="font-medium text-slate-800">{c.from} → {c.to}</span><span className="text-slate-500">{c.date}</span></div>
                  <div className="text-slate-600">{c.reason} · {c.actor} · {c.approval}</div>
                </div>
              ))}
          </>
        )}
      </Drawer>

      <Drawer open={matrixOpen} title="Policy Coverage Matrix" subtitle="Technology domain × policy category" onClose={() => setMatrixOpen(false)} wide>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-left text-[10px] uppercase tracking-[0.05em] text-slate-500">
              <th className="py-2 pr-2 font-medium">Domain</th>
              {POLICY_CATEGORIES.map((c) => <th key={c} className="py-2 pr-2 text-center font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.entries(COVERAGE_MATRIX).map(([domain, row]) => (
              <tr key={domain} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-2 font-medium text-slate-800">{domain}</td>
                {POLICY_CATEGORIES.map((c) => (
                  <td key={c} className="py-2 pr-2 text-center">
                    <span className={cn("inline-grid h-6 w-6 place-items-center rounded text-[10.5px] font-medium",
                      row[c] ? "bg-[#EFF4FB] text-[#1B4F91]" : "bg-slate-50 text-slate-300")}>{row[c] ?? 0}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Drawer>

      <Drawer open={!!setDetail} title={setDetail?.name ?? ""} subtitle={setDetail ? `Policy Set · v${setDetail.version} · ${setDetail.environment}` : ""} onClose={() => setSetDetail(null)}>
        {setDetail && (
          <>
            <Field label="Policies" value={setDetail.policies.length} />
            <Field label="Environment" value={setDetail.environment} />
            <Field label="Technology" value={setDetail.technology} />
            <Field label="Version" value={setDetail.version} />
            <Field label="Status" value={<Pill tone="ok">{setDetail.status}</Pill>} />
            <Field label="Last Published" value={setDetail.lastPublished} />
            <Field label="Owner" value={setDetail.owner} />
            <SectionLabel>Included Policies</SectionLabel>
            <ul className="space-y-1">
              {setDetail.policies.map((p) => (
                <li key={p} className="flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px] text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#1B4F91]" /> {p}
                </li>
              ))}
            </ul>
          </>
        )}
      </Drawer>

      <Drawer open={!!riskDetail} title={riskDetail ? `${riskDetail.label} Risk` : ""} subtitle={riskDetail?.authority} onClose={() => setRiskDetail(null)}>
        {riskDetail && (
          <>
            <p className="text-[12px] text-slate-700">{riskDetail.description}</p>
            <SectionLabel>Examples</SectionLabel>
            <ul className="space-y-1">
              {riskDetail.examples.map((e) => <li key={e} className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px] text-slate-700">{e}</li>)}
            </ul>
            <SectionLabel>Authority</SectionLabel>
            <Field label="Automation Authority" value={riskDetail.authority} />
            <Field label="Governing Policy" value="Risk Classification Policy v4.0" />
          </>
        )}
      </Drawer>

      <Drawer open={!!approvalDetail} title={approvalDetail?.workflow ?? ""} subtitle="Approval workflow definition" onClose={() => setApprovalDetail(null)}>
        {approvalDetail && (
          <>
            <Field label="Environment" value={approvalDetail.environment} />
            <Field label="Risk" value={approvalDetail.risk} />
            <Field label="SLA" value={approvalDetail.sla} />
            <Field label="Sequential" value={approvalDetail.sequential ? "Yes" : "No"} />
            <Field label="Self Approval" value={approvalDetail.selfApproval ? "Allowed" : "No"} />
            {approvalDetail.usedBy && <Field label="Used By" value={approvalDetail.usedBy} />}
            <SectionLabel>Required Approvers</SectionLabel>
            {approvalDetail.approverList.map((a, i) => (
              <div key={a} className="flex items-center gap-2 border-b border-slate-100 py-1.5 text-[12px] last:border-0">
                <span className="grid h-5 w-5 place-items-center rounded bg-[#EFF4FB] text-[10px] font-semibold text-[#1B4F91]">{i + 1}</span>{a}
              </div>
            ))}
          </>
        )}
      </Drawer>

      <Drawer open={!!enforcementDetail} title={enforcementDetail?.point ?? ""} subtitle="Enforcement point" onClose={() => setEnforcementDetail(null)}>
        {enforcementDetail && (
          <>
            <Field label="Decision Type" value={enforcementDetail.decisionType} />
            <Field label="Failure Behavior" value={enforcementDetail.failureBehavior} />
            <SectionLabel>Policies Evaluated</SectionLabel>
            <ul className="space-y-1">
              {enforcementDetail.policiesEvaluated.map((p) => (
                <li key={p} className="rounded-md border border-[#E2E8F0] bg-[#FBFCFE] px-2.5 py-1.5 text-[11.5px] text-slate-700">{p}</li>
              ))}
            </ul>
          </>
        )}
      </Drawer>

      <Drawer open={guideOpen} title="Policy Guide" subtitle="How policy governs Intelligent IaC" onClose={() => setGuideOpen(false)}>
        <div className="space-y-3 text-[12px] text-slate-700">
          <p><span className="font-semibold">Policy defines the boundary of autonomy.</span> The platform never grants itself authority; every capability is derived from a published policy set.</p>
          <div>
            <SectionLabel>Evaluation order</SectionLabel>
            <ol className="list-decimal space-y-0.5 pl-5 text-[11.5px]">{POLICY_PRECEDENCE.map((p) => <li key={p}>{p}</li>)}</ol>
          </div>
          <div>
            <SectionLabel>Key rules</SectionLabel>
            <ul className="list-disc space-y-1 pl-5 text-[11.5px]">
              <li>A lower-priority ALLOW cannot override a higher-priority DENY.</li>
              <li>Human approval cannot override a standard prohibition.</li>
              <li>Execution is bound to the approved package parameters.</li>
              <li>Approved packages are immutable; edits invalidate authorization.</li>
              <li>Policy is evaluated repeatedly, not only before execution.</li>
              <li>Discovery can be enabled independently of production execution.</li>
            </ul>
          </div>
          <div>
            <SectionLabel>Versioning &amp; testing</SectionLabel>
            <p className="text-[11.5px]">Every policy is versioned, reviewed on a fixed cycle and testable in Policy Simulation before publishing. Publishing a policy set records a change record in Change History.</p>
          </div>
        </div>
      </Drawer>

      <Drawer open={createOpen} title="Create Policy" subtitle="Draft a new policy for review" onClose={() => setCreateOpen(false)}>
        <div className="space-y-2.5 text-[11.5px]">
          <label className="block"><span className="text-slate-500">Policy Name</span><input placeholder="e.g. Kubernetes Execution Policy" className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] px-2 text-[12px]" /></label>
          <label className="block"><span className="text-slate-500">Type</span>
            <select className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]">{POLICY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="block"><span className="text-slate-500">Applies To</span>
            <select className="mt-1 h-8 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px]"><option>Production</option><option>Non-Production</option><option>All Environments</option></select>
          </label>
          <label className="block"><span className="text-slate-500">Description</span><textarea rows={3} className="mt-1 w-full rounded-md border border-[#E2E8F0] px-2 py-1.5 text-[12px]" /></label>
          <div className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] p-2.5 text-[11px] text-[#1B4F91]">
            New policies are created as Draft and must pass Policy Simulation and governance review before publication.
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setCreateOpen(false)} className="h-8 flex-1 rounded-md bg-[#1B4F91] text-[12px] font-medium text-white hover:bg-[#173F74]">Save as Draft</button>
            <button onClick={() => setCreateOpen(false)} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] text-slate-700 hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
