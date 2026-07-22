import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Code2,
  Cpu,
  FileText,
  Filter,
  GitCommit,
  Layers,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P2.DEBUG.001 — Waveform Intelligence and Failure Diagnosis     */
/* Route: /avep/verification/failure-diagnosis                         */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";

interface Hypothesis {
  rank: number;
  title: string;
  classification: string;
  confidence: number;
  support: string[];
  contradict: string[];
  missing: string[];
  artifacts: string[];
  nextTest: string;
  owner: string;
  review: "Pending" | "Under Review" | "Confirmed" | "Rejected";
}

interface EvidenceRow {
  type: string;
  state: "Complete" | "Partial" | "Missing";
  note: string;
}

interface TimelineEvent {
  cycle: number;
  source: string;
  event: string;
  expected: string;
  observed: string;
  confidence: number;
  divergence: "None" | "First" | "Propagated" | "Symptom";
}

interface LogEntry {
  cycle: number;
  source: string;
  severity: "INFO" | "WARN" | "ERROR" | "FATAL";
  text: string;
}

const SCENARIO_META: Record<Scenario, { label: string; state: string; confidence: number; approvals: number }> = {
  T0: { label: "T0 · Baseline Green", state: "Not Required", confidence: 0, approvals: 0 },
  T1: { label: "T1 · Regression Failure", state: "Triage Pending", confidence: 0, approvals: 0 },
  T2: { label: "T2 · AI-Assisted Root Cause", state: "In Review", confidence: 89, approvals: 2 },
  T3: { label: "T3 · Fix Validated", state: "Correction Validated", confidence: 97, approvals: 5 },
};

const SIGNALS = [
  "clk",
  "rst_n",
  "desc_valid",
  "desc_ready",
  "desc_length",
  "max_transfer_length",
  "length_error",
  "privilege_error",
  "desc_accept",
  "desc_error",
  "error_code",
  "interrupt_req",
  "state_q",
  "state_d",
];

const WAVE_MARKERS = [
  { cycle: 18439, label: "Handshake begins", kind: "info" as const },
  { cycle: 18440, label: "Descriptor sampled", kind: "info" as const },
  { cycle: 18441, label: "length_error asserts (first divergence)", kind: "divergence" as const },
  { cycle: 18442, label: "State → REJECT", kind: "propagated" as const },
  { cycle: 18443, label: "desc_error asserted", kind: "propagated" as const },
  { cycle: 18444, label: "Scoreboard mismatch", kind: "symptom" as const },
];

const HYPOTHESES: Hypothesis[] = [
  {
    rank: 1,
    title: "Inclusive boundary comparison rejects legal descriptors",
    classification: "RTL design defect",
    confidence: 89,
    support: [
      "Candidate uses `>=`, baseline uses `>`",
      "All failing seeds exercise exact boundary length",
      "Below-max descriptors pass, above-max fail correctly",
      "Formal counterexample reproduces on seed 348921",
      "DEF-DV-173 shows 93% signature similarity",
      "Commit a8c31f7 aligns with regression start",
    ],
    contradict: ["Two failures contain simultaneous privilege violations"],
    missing: ["Complete waveforms for 7 cluster jobs"],
    artifacts: ["ddmac_descriptor_validator.sv:157", "REQ-DDMAC-142", "p_max_legal_length_accepted"],
    nextTest: "Directed length == max + regression targeted set",
    owner: "Maya Chen",
    review: "Under Review",
  },
  {
    rank: 2,
    title: "Reference model and DUT use inconsistent maximum-length semantics",
    classification: "Testbench / model inconsistency",
    confidence: 61,
    support: ["Reference model expects ACCEPT at boundary"],
    contradict: [
      "REQ-DDMAC-142 supports reference-model interpretation",
      "Independent formal check confirms requirement reading",
    ],
    missing: ["Independent source mapping for reference model"],
    artifacts: ["ddmac_ref_model.sv", "REQ-DDMAC-142"],
    nextTest: "Cross-check reference model against requirement source",
    owner: "Aisha Rahman",
    review: "Pending",
  },
  {
    rank: 3,
    title: "Error-priority behavior creates misleading primary symptom",
    classification: "Specification / architecture ambiguity",
    confidence: 47,
    support: ["Some failures contain simultaneous privilege and length violations"],
    contradict: ["Pure boundary failures reproduce without privilege violation"],
    missing: ["Error-priority clarification in REQ-DDMAC-143"],
    artifacts: ["REQ-DDMAC-143", "arch_ddmac_error_model.md"],
    nextTest: "Split dual-error subset into FC-031b",
    owner: "Arun Patel",
    review: "Pending",
  },
  {
    rank: 4,
    title: "Monitor sampling captures stale descriptor length",
    classification: "Testbench defect",
    confidence: 22,
    support: ["Prior monitor sampling ambiguity noted in DEF-DV-158"],
    contradict: ["desc_length stable across full handshake window in seed 348921"],
    missing: [],
    artifacts: ["ddmac_monitor.sv:88"],
    nextTest: "Retain as secondary validation item",
    owner: "Aisha Rahman",
    review: "Pending",
  },
];

const TIMELINE: TimelineEvent[] = [
  { cycle: 18438, source: "Sequence", event: "gen_descriptor(len=4096)", expected: "Legal boundary", observed: "Issued", confidence: 100, divergence: "None" },
  { cycle: 18439, source: "Driver", event: "desc_valid ↑", expected: "Handshake begin", observed: "Match", confidence: 100, divergence: "None" },
  { cycle: 18440, source: "Monitor", event: "descriptor observed len=4096 max=4096", expected: "Capture", observed: "Match", confidence: 100, divergence: "None" },
  { cycle: 18440, source: "Ref Model", event: "predict=ACCEPT", expected: "ACCEPT", observed: "ACCEPT", confidence: 100, divergence: "None" },
  { cycle: 18441, source: "RTL", event: "length_error ← (len >= max)", expected: "0", observed: "1", confidence: 96, divergence: "First" },
  { cycle: 18441, source: "Assertion", event: "p_max_legal_length_accepted", expected: "Hold", observed: "Fail", confidence: 100, divergence: "Propagated" },
  { cycle: 18442, source: "RTL", event: "state_d = REJECT", expected: "ACCEPT", observed: "REJECT", confidence: 100, divergence: "Propagated" },
  { cycle: 18443, source: "RTL", event: "desc_error ↑ code=ERR_LENGTH", expected: "Not asserted", observed: "Asserted", confidence: 100, divergence: "Propagated" },
  { cycle: 18443, source: "RTL", event: "interrupt_req ↑", expected: "Low", observed: "High", confidence: 100, divergence: "Propagated" },
  { cycle: 18444, source: "Scoreboard", event: "expected=ACCEPT actual=REJECT", expected: "Match", observed: "Mismatch", confidence: 100, divergence: "Symptom" },
  { cycle: 18445, source: "Coverage", event: "bin cvp_len_at_max hit (fail)", expected: "Hit / pass", observed: "Hit / fail", confidence: 100, divergence: "Symptom" },
];

const LOGS: LogEntry[] = [
  { cycle: 18439, source: "DDMAC_DRIVER", severity: "INFO", text: "desc_valid asserted, awaiting ready" },
  { cycle: 18440, source: "DDMAC_MONITOR", severity: "INFO", text: "descriptor observed, len=4096 max=4096" },
  { cycle: 18441, source: "DDMAC_REFERENCE", severity: "INFO", text: "expected=ACCEPT" },
  { cycle: 18441, source: "ASSERT_DESC_MAX_LEGAL", severity: "ERROR", text: "property p_max_legal_length_accepted failed" },
  { cycle: 18443, source: "DDMAC_MONITOR", severity: "WARN", text: "observed desc_error=1 code=ERR_LENGTH" },
  { cycle: 18444, source: "DDMAC_SCOREBOARD", severity: "ERROR", text: "mismatch expected=ACCEPT actual=REJECT" },
  { cycle: 18445, source: "DDMAC_COVERAGE", severity: "INFO", text: "cvp_len_at_max hit=1 pass=0" },
];

const EVIDENCE: EvidenceRow[] = [
  { type: "Failing waveform", state: "Complete", note: "seed 348921, cycles 18435..18460" },
  { type: "Passing baseline waveform", state: "Complete", note: "rtl_baseline_3.2.17 · seed 348921" },
  { type: "Simulation log", state: "Complete", note: "compressed 2.1 MB" },
  { type: "Assertion evidence", state: "Complete", note: "1 failure, 0 vacuous" },
  { type: "RTL diff", state: "Complete", note: "commit a8c31f7 · 1 file · +1 / −1" },
  { type: "Requirement mapping", state: "Complete", note: "REQ-DDMAC-142, 143" },
  { type: "Formal counterexample", state: "Complete", note: "aligned with seed 348921" },
  { type: "Prior defect", state: "Complete", note: "DEF-DV-173 · 93% similarity" },
  { type: "Dual-error waveforms", state: "Partial", note: "3 of 7 waveforms captured" },
  { type: "Checker ordering evidence", state: "Partial", note: "1 scoreboard-ordering condition unexplored" },
  { type: "Error-timing clarification", state: "Missing", note: "REQ-DDMAC-143 origin unresolved" },
];

const AUTHORITIES = [
  { role: "RTL Design Lead", owner: "Maya Chen", status: "Confirmed", responsibility: "Confirm RTL root cause and correction" },
  { role: "Verification Lead", owner: "Sofia Rodriguez", status: "Confirmed", responsibility: "Confirm failure interpretation and validation" },
  { role: "Formal Lead", owner: "Daniel Kim", status: "Pending", responsibility: "Review property and counterexample evidence" },
  { role: "IP Architect", owner: "Arun Patel", status: "Pending", responsibility: "Confirm requirement and architecture semantics" },
  { role: "UVM Architect", owner: "Aisha Rahman", status: "Pending", responsibility: "Exclude checker or monitor root cause" },
  { role: "Security Engineer", owner: "Priya Shah", status: "Pending", responsibility: "Review dual-error and privilege implications" },
];

const KPIS = [
  { key: "sources", label: "Evidence sources", value: "11", detail: "Test, waveform, log, assertion, RTL, spec, req, commit, formal, defect, baseline" },
  { key: "failures", label: "Correlated failures", value: "41", detail: "6 tests · 18 seeds" },
  { key: "divergence", label: "First divergence", value: "Cycle 18,442", detail: "3 cycles before scoreboard mismatch" },
  { key: "hypotheses", label: "Ranked hypotheses", value: "4", detail: "1 leading · 2 plausible · 1 low" },
  { key: "confidence", label: "Leading confidence", value: "89%", detail: "Evidence strength — not proof" },
  { key: "contradict", label: "Contradicting evidence", value: "3", detail: "Reviewer attention required" },
  { key: "proposal", label: "Proposed correction", value: "2 RTL lines", detail: "No automatic modification" },
  { key: "validation", label: "Validation scope", value: "146 jobs", detail: "Targeted + dependent checks" },
];

const TABS = [
  "RTL Source",
  "Testbench",
  "Logs",
  "Assertions",
  "Transactions",
  "Specification",
  "Requirements",
  "Commit Diff",
  "Formal",
  "Prior Defects",
] as const;
type TabKey = (typeof TABS)[number];

/* ------------------------------------------------------------------ */

export default function FailureDiagnosis() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [tab, setTab] = useState<TabKey>("RTL Source");
  const [selectedEvent, setSelectedEvent] = useState<number>(4);
  const [cursor, setCursor] = useState<number>(18441);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showPassingSeed, setShowPassingSeed] = useState(false);
  const [walkStep, setWalkStep] = useState<number | null>(null);
  const [logFilter, setLogFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | LogEntry["severity"]>("ALL");

  const meta = SCENARIO_META[scenario];
  const isT0 = scenario === "T0";
  const isT3 = scenario === "T3";

  const filteredLogs = useMemo(
    () =>
      LOGS.filter(
        (l) =>
          (severityFilter === "ALL" || l.severity === severityFilter) &&
          (logFilter === "" ||
            l.text.toLowerCase().includes(logFilter.toLowerCase()) ||
            l.source.toLowerCase().includes(logFilter.toLowerCase())),
      ),
    [logFilter, severityFilter],
  );

  const evidenceCompleteness = useMemo(() => {
    const w = { Complete: 1, Partial: 0.5, Missing: 0 } as const;
    return Math.round((EVIDENCE.reduce((s, e) => s + w[e.state], 0) / EVIDENCE.length) * 100);
  }, []);

  const walkthrough = [
    "Select the regression failure cluster (FC-031).",
    "Review the failing test, seed, and baseline result.",
    "Synchronize waveform, logs, and assertions.",
    "Identify the first meaningful divergence (cycle 18,441).",
    "Trace the symptom back to the RTL expression.",
    "Review requirement REQ-DDMAC-142 and commit a8c31f7.",
    "Compare ranked hypotheses and alternatives.",
    "Review contradicting and missing evidence.",
    "Inspect the bounded proposed correction (2 lines).",
    "Review required validation (static, sim, formal, regression).",
    "Confirm qualified human approval authority.",
    "Verify that AI does not commit the change.",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Context strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
          <ContextChip label="Program" value="StrataShield Secure Processing SoC" />
          <ContextChip label="IP" value="DDMAC 3.2" />
          <ContextChip label="RTL" value="rtl_baseline_3.2.18_candidate" />
          <ContextChip label="DV" value="dv_env_2.4_candidate" />
          <ContextChip label="Run" value="REG-2026-07-21-0042" />
          <ContextChip label="Cluster" value="FC-031" accent />
          <ContextChip label="Test" value="test_desc_length_at_max" />
          <ContextChip label="Seed" value="348921" />
          <ContextChip label="Branch" value="feature/ddmac_descriptor_guard" />
          <ContextChip label="Commit" value="a8c31f7" />
          <ContextChip label="Role" value="Verification Lead" />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Scenario</span>
            <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
              {(Object.keys(SCENARIO_META) as Scenario[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    scenario === s ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setWalkStep(walkStep === null ? 0 : null)}
              className="text-xs font-medium px-2.5 py-1 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              {walkStep === null ? "Start Walkthrough" : "Exit Walkthrough"}
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              <span>Phase 2 · Build and Verify</span>
              <ChevronRight className="w-3 h-3" />
              <span>Diagnose and Remediate Failures</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600">AVEP.P2.DEBUG.001</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Waveform Intelligence and Failure Diagnosis</h1>
            <p className="mt-1 max-w-4xl text-sm text-slate-600">
              Correlate simulation evidence, identify the first meaningful divergence, rank root-cause hypotheses, and propose a bounded correction with required validation.
              AI provides evidence and inference. Qualified human reviewers own root cause and remediation.
            </p>
          </div>
          <div className="flex flex-col items-end text-xs">
            <span className="uppercase tracking-wide text-slate-500">Diagnosis state</span>
            <span className={`font-mono font-medium mt-0.5 ${isT3 ? "text-emerald-700" : isT0 ? "text-slate-500" : "text-amber-700"}`}>{meta.state}</span>
            <span className="mt-1 text-slate-500">Leading confidence <span className="font-mono text-slate-900">{meta.confidence}%</span></span>
          </div>
        </div>

        {/* KPI grid */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {KPIS.map((k) => (
            <button
              key={k.key}
              className="text-left rounded-md border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 p-3 transition"
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{k.label}</div>
              <div className="mt-1 font-mono text-lg font-semibold text-slate-900">{k.value}</div>
              <div className="mt-0.5 text-[11px] text-slate-500 leading-snug">{k.detail}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left: Failure Context Panel */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <FailureContextPanel isT0={isT0} isT3={isT3} />
          <RankedHypotheses list={HYPOTHESES} isT3={isT3} />
        </aside>

        {/* Center: waveform + timeline + tabs */}
        <section className="col-span-12 xl:col-span-6 space-y-4">
          <Card
            title="Synchronized Waveform Viewer"
            subtitle={`Cursor @ cycle ${cursor.toLocaleString()} · seed 348921`}
            icon={<Activity className="w-4 h-4 text-indigo-600" />}
            right={
              <div className="flex items-center gap-2 text-xs">
                <Toggle label="Baseline overlay" on={showBaseline} onChange={setShowBaseline} />
                <Toggle label="Passing seed" on={showPassingSeed} onChange={setShowPassingSeed} />
                <button className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Save view</button>
                <button className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">Export</button>
              </div>
            }
          >
            <Waveform cursor={cursor} onCursor={setCursor} baseline={showBaseline} passing={showPassingSeed} />
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              {WAVE_MARKERS.map((m) => (
                <button
                  key={m.cycle}
                  onClick={() => setCursor(m.cycle)}
                  className={`px-2 py-1 rounded border font-mono ${
                    cursor === m.cycle
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                      : m.kind === "divergence"
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : m.kind === "propagated"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : m.kind === "symptom"
                      ? "bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {m.cycle} · {m.label}
                </button>
              ))}
            </div>
          </Card>

          <Card
            title="Evidence Timeline"
            subtitle="Synchronized events from stimulus, RTL, checkers, and coverage"
            icon={<Timer className="w-4 h-4 text-indigo-600" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="text-[10px] uppercase text-slate-500">
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-1.5 pr-2">Cycle</th>
                    <th className="pr-2">Source</th>
                    <th className="pr-2">Event</th>
                    <th className="pr-2">Expected</th>
                    <th className="pr-2">Observed</th>
                    <th className="pr-2">Δ</th>
                    <th className="pr-2">Conf</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMELINE.map((e, i) => {
                    const active = i === selectedEvent;
                    const divColor =
                      e.divergence === "First"
                        ? "bg-rose-100 text-rose-800"
                        : e.divergence === "Propagated"
                        ? "bg-amber-100 text-amber-800"
                        : e.divergence === "Symptom"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-emerald-50 text-emerald-700";
                    return (
                      <tr
                        key={i}
                        onClick={() => {
                          setSelectedEvent(i);
                          setCursor(e.cycle);
                        }}
                        className={`cursor-pointer border-b border-slate-100 ${active ? "bg-indigo-50/60" : "hover:bg-slate-50"}`}
                      >
                        <td className="py-1.5 pr-2 text-slate-700">{e.cycle.toLocaleString()}</td>
                        <td className="pr-2 text-slate-600">{e.source}</td>
                        <td className="pr-2 text-slate-900">{e.event}</td>
                        <td className="pr-2 text-slate-600">{e.expected}</td>
                        <td className={`pr-2 ${e.observed !== e.expected && e.divergence !== "None" ? "text-rose-700" : "text-slate-700"}`}>
                          {e.observed}
                        </td>
                        <td className="pr-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${divColor}`}>{e.divergence}</span>
                        </td>
                        <td className="pr-2 text-slate-500">{e.confidence}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card
            title="Source, Log, and Assertion Workspace"
            icon={<Code2 className="w-4 h-4 text-indigo-600" />}
            subtitle="Click cells to open requirements, commits, tests, and properties"
          >
            <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-3">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-2.5 py-1.5 text-xs font-medium -mb-px border-b-2 ${
                    tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <TabBody
              tab={tab}
              logFilter={logFilter}
              setLogFilter={setLogFilter}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              filteredLogs={filteredLogs}
              onCursor={setCursor}
            />
          </Card>

          <FirstDivergence />
          <ProposedCorrection />
          <ValidationPlan />
        </section>

        {/* Right: AI evidence + evidence scorecard + defect + authorities */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <AiEvidencePanel />
          <EvidenceScorecard rows={EVIDENCE} completeness={evidenceCompleteness} />
          <DefectPanel />
          <AuthoritiesPanel rows={AUTHORITIES} isT3={isT3} />
        </aside>
      </div>

      {/* Decision bar */}
      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Metric label="Diagnosis state" value={meta.state} />
          <Metric label="Leading confidence" value={`${meta.confidence}%`} mono />
          <Metric label="Root cause confirmed" value={isT3 ? "Yes" : "No"} tone={isT3 ? "ok" : "warn"} />
          <Metric label="Proposed correction" value={isT3 ? "Validated" : "Review only"} />
          <Metric label="Blocking ambiguity" value={isT3 ? "0" : "1"} tone={isT3 ? "ok" : "warn"} />
          <Metric label="Evidence completeness" value={`${evidenceCompleteness}%`} mono />
          <Metric label="Approvals" value={`${meta.approvals} / 6`} mono />
          <div className="ml-auto flex flex-wrap gap-2">
            <ActionBtn>Request Evidence</ActionBtn>
            <ActionBtn>Add Hypothesis</ActionBtn>
            <ActionBtn>Split Cluster</ActionBtn>
            <ActionBtn>Review Proposed Correction</ActionBtn>
            <ActionBtn>Export Evidence Package</ActionBtn>
            <ActionBtn variant="primary" disabled={!isT3}>Confirm Root Cause</ActionBtn>
            <ActionBtn variant="primary" disabled={!isT3}>Approve Controlled Validation</ActionBtn>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          AI evidence is advisory. AVEP does not modify RTL, close defects, or approve waivers. Correction approval authorizes controlled validation only — not baseline acceptance.
        </p>
      </div>

      {/* Walkthrough overlay */}
      {walkStep !== null && (
        <div className="fixed inset-0 z-40 bg-slate-900/30 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Failure Diagnosis Walkthrough — Step {walkStep + 1} of {walkthrough.length}
              </div>
              <button onClick={() => setWalkStep(null)} className="text-slate-500 hover:text-slate-900 text-xs">Close</button>
            </div>
            <div className="px-4 py-4 text-sm text-slate-700">{walkthrough[walkStep]}</div>
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setWalkStep(Math.max(0, walkStep - 1))}
                className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                disabled={walkStep === 0}
              >
                Previous
              </button>
              <div className="flex gap-1">
                {walkthrough.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === walkStep ? "bg-indigo-600" : "bg-slate-200"}`} />
                ))}
              </div>
              <button
                onClick={() => (walkStep === walkthrough.length - 1 ? setWalkStep(null) : setWalkStep(walkStep + 1))}
                className="text-xs px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {walkStep === walkthrough.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ContextChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`font-mono ${accent ? "text-indigo-700" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{title}</div>
            {subtitle && <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`px-2 py-1 rounded border text-[11px] ${
        on ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

function FailureContextPanel({ isT0, isT3 }: { isT0: boolean; isT3: boolean }) {
  const rows: [string, string][] = [
    ["Cluster", "FC-031"],
    ["Title", "Descriptor max-length boundary regression"],
    ["Test", "test_desc_length_at_max"],
    ["Seed", "348921"],
    ["Config", "cfg_max_transfer=4096, priv=user"],
    ["Simulator", "Xcelium 24.03"],
    ["Run", "REG-2026-07-21-0042"],
    ["Failure @", "sim 184,420 ns · cycle 18,442"],
    ["Baseline", isT0 ? "Passed" : "Passed"],
    ["Current", isT0 ? "Passed" : isT3 ? "Passed (validated)" : "Failed"],
    ["Assertion", "p_max_legal_length_accepted"],
    ["Signature", "len_ge_max_rejects_legal_boundary"],
    ["Module", "ddmac_descriptor_validator"],
    ["Suspect commit", "a8c31f7"],
    ["Requirement", "REQ-DDMAC-142"],
    ["Prior defect", "DEF-DV-173 (93% sim)"],
    ["Owners", "Maya Chen · Sofia Rodriguez"],
    ["Triage", isT3 ? "Resolved (pending closure)" : "RTL Design Review"],
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-600" />
        <div className="text-sm font-semibold text-slate-900">Failure Context</div>
      </div>
      <dl className="p-3 text-xs font-mono divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 py-1.5">
            <dt className="w-28 shrink-0 text-slate-500 uppercase text-[10px] tracking-wide pt-0.5">{k}</dt>
            <dd className="text-slate-900 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="p-3 pt-0 flex flex-wrap gap-1.5">
        {[
          "Compare passing seed",
          "Compare baseline",
          "Open cluster",
          "Open defect",
          "Change Impact",
          "Export package",
        ].map((a) => (
          <button key={a} className="text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50">
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function Waveform({
  cursor,
  onCursor,
  baseline,
  passing,
}: {
  cursor: number;
  onCursor: (c: number) => void;
  baseline: boolean;
  passing: boolean;
}) {
  const START = 18435;
  const END = 18450;
  const W = 720;
  const H = 26 * SIGNALS.length + 24;
  const rowH = 26;
  const cycles = END - START;
  const x = (c: number) => 90 + ((c - START) / cycles) * (W - 100);

  // Deterministic waveform values per signal per cycle
  const values: Record<string, (c: number) => number | string> = {
    clk: (c) => (c % 2 === 0 ? 1 : 0),
    rst_n: () => 1,
    desc_valid: (c) => (c >= 18439 && c <= 18442 ? 1 : 0),
    desc_ready: (c) => (c >= 18440 && c <= 18442 ? 1 : 0),
    desc_length: (c) => (c >= 18440 ? "4096" : "----"),
    max_transfer_length: () => "4096",
    length_error: (c) => (c >= 18441 && c <= 18444 ? 1 : 0),
    privilege_error: () => 0,
    desc_accept: () => 0,
    desc_error: (c) => (c >= 18443 && c <= 18446 ? 1 : 0),
    error_code: (c) => (c >= 18443 ? "ERR_LEN" : "----"),
    interrupt_req: (c) => (c >= 18443 && c <= 18447 ? 1 : 0),
    state_q: (c) => (c < 18442 ? "IDLE" : c < 18446 ? "REJECT" : "IDLE"),
    state_d: (c) => (c < 18441 ? "IDLE" : c < 18445 ? "REJECT" : "IDLE"),
  };

  return (
    <div className="rounded border border-slate-200 bg-slate-50 overflow-hidden">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block font-mono">
        {/* cycle grid */}
        {Array.from({ length: cycles + 1 }, (_, i) => START + i).map((c) => (
          <line key={c} x1={x(c)} x2={x(c)} y1={16} y2={H - 4} stroke="#e2e8f0" strokeWidth={c % 5 === 0 ? 1 : 0.5} />
        ))}
        {/* cycle labels */}
        {Array.from({ length: cycles + 1 }, (_, i) => START + i).map((c) =>
          c % 2 === 0 ? (
            <text key={c} x={x(c)} y={12} fontSize={8} textAnchor="middle" fill="#64748b">
              {c}
            </text>
          ) : null,
        )}
        {/* signals */}
        {SIGNALS.map((sig, idx) => {
          const y0 = 20 + idx * rowH;
          const mid = y0 + rowH / 2;
          const isState = sig.startsWith("state") || sig === "error_code" || sig === "desc_length" || sig === "max_transfer_length";
          return (
            <g key={sig}>
              <text x={6} y={mid + 3} fontSize={9} fill="#334155">
                {sig}
              </text>
              <line x1={90} x2={W - 10} y1={y0 + rowH - 2} y2={y0 + rowH - 2} stroke="#f1f5f9" />
              {Array.from({ length: cycles }, (_, i) => START + i).map((c) => {
                const v = values[sig](c);
                const nx = x(c);
                const nxNext = x(c + 1);
                if (isState) {
                  return (
                    <g key={c}>
                      <rect x={nx} y={y0 + 4} width={nxNext - nx - 1} height={rowH - 10} fill={c === cursor ? "#e0e7ff" : "#ffffff"} stroke="#cbd5e1" />
                      <text x={(nx + nxNext) / 2} y={mid + 3} fontSize={8} fill="#0f172a" textAnchor="middle">
                        {String(v)}
                      </text>
                    </g>
                  );
                }
                const high = v === 1;
                const y = high ? y0 + 6 : y0 + rowH - 8;
                return (
                  <line
                    key={c}
                    x1={nx}
                    x2={nxNext}
                    y1={y}
                    y2={y}
                    stroke={sig === "length_error" && c >= 18441 && c <= 18444 ? "#e11d48" : "#0f172a"}
                    strokeWidth={1.4}
                  />
                );
              })}
              {baseline && sig === "length_error" && (
                <line x1={x(START)} x2={x(END)} y1={y0 + rowH - 8} y2={y0 + rowH - 8} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.2} />
              )}
              {passing && sig === "desc_accept" && (
                <line x1={x(18441)} x2={x(18445)} y1={y0 + 6} y2={y0 + 6} stroke="#0ea5e9" strokeDasharray="2 2" strokeWidth={1.2} />
              )}
            </g>
          );
        })}
        {/* markers */}
        {WAVE_MARKERS.map((m) => (
          <line
            key={m.cycle}
            x1={x(m.cycle)}
            x2={x(m.cycle)}
            y1={16}
            y2={H - 4}
            stroke={m.kind === "divergence" ? "#e11d48" : m.kind === "propagated" ? "#f59e0b" : m.kind === "symptom" ? "#64748b" : "#94a3b8"}
            strokeDasharray="2 3"
          />
        ))}
        {/* cursor */}
        <line x1={x(cursor)} x2={x(cursor)} y1={16} y2={H - 4} stroke="#4f46e5" strokeWidth={1.5} />
        {/* click capture */}
        <rect
          x={90}
          y={16}
          width={W - 100}
          height={H - 20}
          fill="transparent"
          onClick={(e) => {
            const rect = (e.target as SVGRectElement).getBoundingClientRect();
            const rel = e.clientX - rect.left;
            const c = Math.round(START + (rel / rect.width) * cycles);
            onCursor(Math.max(START, Math.min(END, c)));
          }}
          style={{ cursor: "crosshair" }}
        />
      </svg>
      <div className="px-3 py-1.5 border-t border-slate-200 bg-white text-[11px] font-mono flex items-center gap-3 flex-wrap">
        <span className="text-slate-500">Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-900" /> candidate</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500" /> baseline overlay</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-sky-500" /> passing seed</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500" /> first divergence</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500" /> propagated</span>
        <span className="ml-auto text-slate-500">Cycles {START}..{END}</span>
      </div>
    </div>
  );
}

function TabBody(props: {
  tab: TabKey;
  logFilter: string;
  setLogFilter: (v: string) => void;
  severityFilter: "ALL" | LogEntry["severity"];
  setSeverityFilter: (v: "ALL" | LogEntry["severity"]) => void;
  filteredLogs: LogEntry[];
  onCursor: (c: number) => void;
}) {
  const { tab, logFilter, setLogFilter, severityFilter, setSeverityFilter, filteredLogs, onCursor } = props;

  if (tab === "RTL Source") {
    return (
      <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
        <SourceBlock
          title="Accepted baseline · rtl_baseline_3.2.17"
          path="ddmac_descriptor_validator.sv:212"
          lines={[
            "// REQ-DDMAC-142: reject only when length exceeds max",
            "assign length_error =",
            "    desc_valid &&",
            "    (desc_length > max_transfer_length);",
          ]}
          highlight={2}
          tone="ok"
        />
        <SourceBlock
          title="Suspect candidate · commit a8c31f7"
          path="ddmac_descriptor_validator.sv:157"
          lines={[
            "// REQ-DDMAC-142",
            "assign length_error =",
            "    desc_valid &&",
            "    (desc_length >= max_transfer_length); // ← inclusive, off by boundary",
          ]}
          highlight={3}
          tone="bad"
        />
        <div className="md:col-span-2 flex flex-wrap gap-1.5 text-[11px]">
          <MetaChip>Requirement: REQ-DDMAC-142</MetaChip>
          <MetaChip>Commit: a8c31f7</MetaChip>
          <MetaChip>Affected tests: 6</MetaChip>
          <MetaChip>Property: p_max_legal_length_accepted</MetaChip>
          <MetaChip>Coverage: cvp_len_at_max</MetaChip>
          <MetaChip tone="warn">Prior defect similarity: 93% (DEF-DV-173)</MetaChip>
        </div>
        <p className="md:col-span-2 text-[11px] text-slate-500">
          Source is read-only. AVEP does not automatically modify RTL. Use “Review Proposed Correction” to open a bounded change for qualified review.
        </p>
      </div>
    );
  }

  if (tab === "Testbench") {
    return (
      <div className="text-xs font-mono space-y-3">
        <SourceBlock
          title="Sequence · ddmac_boundary_seq.sv"
          path="tb/ddmac_boundary_seq.sv:58"
          lines={[
            "desc.payload_length = cfg.max_transfer_length; // exact boundary",
            "desc.priv_mode      = USER;",
            "start_item(desc); finish_item(desc);",
          ]}
          highlight={0}
        />
        <SourceBlock
          title="Reference model · expected acceptance"
          path="tb/ddmac_ref_model.sv:141"
          lines={[
            "if (desc.payload_length <= cfg.max_transfer_length)",
            "    predict = ACCEPT; // REQ-DDMAC-142 interpretation",
            "else",
            "    predict = REJECT;",
          ]}
          highlight={1}
          tone="ok"
        />
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
          Shared-assumption check: reference model and RTL both read <span className="font-mono">cfg.max_transfer_length</span> — independent source mapping should be confirmed to exclude common-mode failure.
        </div>
      </div>
    );
  }

  if (tab === "Logs") {
    return (
      <div className="text-xs">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-white">
            <Search className="w-3 h-3 text-slate-500" />
            <input
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              placeholder="Search text or source"
              className="text-xs outline-none w-52"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            {(["ALL", "INFO", "WARN", "ERROR", "FATAL"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                  severityFilter === s ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded border border-slate-200 bg-slate-950 text-slate-100 font-mono text-[11px] p-3 overflow-x-auto">
          {filteredLogs.map((l, i) => (
            <div
              key={i}
              onClick={() => onCursor(l.cycle)}
              className={`flex gap-2 cursor-pointer py-0.5 border-l-2 pl-2 ${
                l.severity === "ERROR" || l.severity === "FATAL"
                  ? "border-rose-500"
                  : l.severity === "WARN"
                  ? "border-amber-400"
                  : "border-slate-700"
              } hover:bg-slate-800`}
            >
              <span className="text-slate-400 w-14">{l.cycle}</span>
              <span
                className={`w-14 ${
                  l.severity === "ERROR" || l.severity === "FATAL"
                    ? "text-rose-400"
                    : l.severity === "WARN"
                    ? "text-amber-300"
                    : "text-emerald-300"
                }`}
              >
                {l.severity}
              </span>
              <span className="text-sky-300 w-40">{l.source}</span>
              <span>{l.text}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && <div className="text-slate-500">No entries match the current filters.</div>}
        </div>
      </div>
    );
  }

  if (tab === "Assertions") {
    return (
      <div className="text-xs space-y-3">
        <SourceBlock
          title="p_max_legal_length_accepted (SVA)"
          path="assertions/ddmac_assertions.sv:74"
          lines={[
            "property p_max_legal_length_accepted;",
            "  @(posedge clk) disable iff (!rst_n)",
            "    desc_valid && desc_ready &&",
            "    desc_length == max_transfer_length",
            "    |-> ##[1:2] desc_accept;",
            "endproperty",
            "assert_max_legal: assert property (p_max_legal_length_accepted);",
          ]}
        />
        <table className="w-full font-mono">
          <thead className="text-[10px] uppercase text-slate-500">
            <tr className="text-left border-b border-slate-200">
              <th className="py-1">ID</th><th>Req</th><th>Sim</th><th>Formal</th><th>Vacuity</th><th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["a_max_legal", "REQ-DDMAC-142", "Fail@18441", "CEX found", "OK", "Daniel Kim"],
              ["a_above_max_rejected", "REQ-DDMAC-142", "Pass", "Proven", "OK", "Daniel Kim"],
              ["a_error_timing_2c", "REQ-DDMAC-143", "Blocked", "Blocked", "Ambiguous spec", "Arun Patel"],
              ["a_accept_reject_exclusive", "REQ-DDMAC-142", "Pass", "Proven", "OK", "Daniel Kim"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-slate-100">
                {r.map((c, i) => (
                  <td key={i} className={`py-1 ${i === 2 && c.includes("Fail") ? "text-rose-700" : i === 4 && c !== "OK" ? "text-amber-700" : "text-slate-700"}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "Transactions") {
    return (
      <div className="text-xs font-mono overflow-x-auto">
        <table className="w-full">
          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
            <tr className="text-left">
              <th className="py-1">TID</th><th>Addr</th><th>Len</th><th>Priv</th><th>Cfg</th><th>Driver</th><th>Monitor</th><th>Ref</th><th>Actual</th><th>SB</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["T-0417", "0x1000_A000", "4096", "USER", "max=4096", "18439", "18440", "ACCEPT", "REJECT", "Mismatch"],
              ["T-0418", "0x1000_B000", "2048", "USER", "max=4096", "18492", "18493", "ACCEPT", "ACCEPT", "Match"],
              ["T-0419", "0x1000_C000", "4097", "USER", "max=4096", "18540", "18541", "REJECT", "REJECT", "Match"],
              ["T-0420", "0x1000_D000", "4096", "SUPER", "max=4096", "18601", "18602", "ACCEPT", "REJECT", "Mismatch (dual-error)"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-slate-100">
                {r.map((c, i) => (
                  <td key={i} className={`py-1 ${i === 9 && c.includes("Mismatch") ? "text-rose-700" : "text-slate-800"}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "Specification") {
    return (
      <div className="text-xs space-y-2">
        <p className="text-slate-700"><span className="font-semibold text-slate-900">Section 4.7.2 — Descriptor Validation.</span> The descriptor engine shall accept descriptors whose payload length is less than or equal to the configured maximum transfer length. Descriptors exceeding this value shall be rejected and reported through the descriptor error interface.</p>
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
          Section 4.7.4 — Error timing: the spec text (“within a small number of cycles”) is unresolved. Formal cannot bind <span className="font-mono">a_error_timing_2c</span> until this is clarified.
        </div>
      </div>
    );
  }

  if (tab === "Requirements") {
    return (
      <div className="text-xs space-y-3">
        <ReqBlock id="REQ-DDMAC-142" text="The descriptor engine shall reject descriptors whose payload length exceeds the configured maximum transfer length." notes={["Equal to maximum is legal", "Greater than maximum is illegal"]} />
        <ReqBlock id="REQ-DDMAC-143" text="The descriptor engine shall assert desc_error within two cycles following detection of an invalid descriptor." notes={["Timing origin unresolved — blocking ambiguity"]} tone="warn" />
      </div>
    );
  }

  if (tab === "Commit Diff") {
    return (
      <div className="text-xs font-mono space-y-2">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <MetaChip>a8c31f7</MetaChip>
          <MetaChip>Maya Chen</MetaChip>
          <MetaChip>2026-07-19 14:22</MetaChip>
          <MetaChip>PR #4183</MetaChip>
          <MetaChip>ddmac_descriptor_validator.sv</MetaChip>
          <MetaChip tone="warn">Regression start REG-2026-07-21-0042</MetaChip>
        </div>
        <pre className="rounded bg-slate-950 text-slate-100 p-3 overflow-x-auto text-[11px] leading-relaxed">
{`  // REQ-DDMAC-142
  assign length_error =
      desc_valid &&
`}<span className="text-rose-400">{`-     (desc_length >  max_transfer_length);`}</span>{"\n"}
<span className="text-emerald-300">{`+     (desc_length >= max_transfer_length);`}</span>
        </pre>
        <p className="text-[11px] text-slate-500">Semantic summary: strictly-greater comparison changed to inclusive. Reviewer comment references “tightening boundary” — not aligned with REQ-DDMAC-142.</p>
      </div>
    );
  }

  if (tab === "Formal") {
    return (
      <div className="text-xs space-y-2">
        <table className="w-full font-mono">
          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
            <tr className="text-left"><th className="py-1">Property</th><th>Baseline</th><th>Candidate</th><th>CEX</th><th>Owner</th></tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100"><td className="py-1">p_max_legal_length_accepted</td><td className="text-emerald-700">Proven</td><td className="text-rose-700">CEX</td><td>seed 348921</td><td>Daniel Kim</td></tr>
            <tr className="border-b border-slate-100"><td className="py-1">p_above_max_rejected</td><td className="text-emerald-700">Proven</td><td className="text-emerald-700">Proven</td><td>—</td><td>Daniel Kim</td></tr>
            <tr className="border-b border-slate-100"><td className="py-1">p_accept_reject_exclusive</td><td className="text-emerald-700">Proven</td><td className="text-emerald-700">Proven</td><td>—</td><td>Daniel Kim</td></tr>
            <tr><td className="py-1">p_error_timing_2c</td><td className="text-slate-500">Blocked</td><td className="text-slate-500">Blocked</td><td>—</td><td>Arun Patel</td></tr>
          </tbody>
        </table>
        <p className="text-[11px] text-slate-500">Cone-of-influence for the failing property is bounded to the descriptor validator; approved assumptions constrain reset and configuration stability.</p>
      </div>
    );
  }

  // Prior Defects
  return (
    <div className="text-xs space-y-2">
      <div className="rounded border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-slate-900">DEF-DV-173 · Boundary value incorrectly rejected</div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Similarity 93%</span>
        </div>
        <p className="mt-1 text-slate-600">Prior correction changed an inclusive rejection comparison to an exclusive comparison in the fragment aligner module.</p>
        <div className="mt-2 text-[11px] text-slate-500">Reusable lesson: always co-test length below, equal, and above configured boundaries.</div>
      </div>
    </div>
  );
}

function SourceBlock({
  title,
  path,
  lines,
  highlight,
  tone,
}: {
  title: string;
  path: string;
  lines: string[];
  highlight?: number;
  tone?: "ok" | "bad";
}) {
  return (
    <div className="rounded border border-slate-200 overflow-hidden">
      <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-800">{title}</div>
        <div className="text-[10px] font-mono text-slate-500">{path}</div>
      </div>
      <pre className="text-[11px] leading-relaxed bg-white overflow-x-auto">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`px-3 py-0.5 font-mono ${
              i === highlight
                ? tone === "ok"
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-rose-50 text-rose-900"
                : "text-slate-800"
            }`}
          >
            <span className="text-slate-400 mr-3 select-none">{String(i + 1).padStart(2, "0")}</span>
            {l}
          </div>
        ))}
      </pre>
    </div>
  );
}

function ReqBlock({ id, text, notes, tone }: { id: string; text: string; notes: string[]; tone?: "warn" }) {
  return (
    <div className={`rounded border p-3 ${tone === "warn" ? "border-amber-200 bg-amber-50/50" : "border-slate-200"}`}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-white">{id}</span>
        {tone === "warn" && <span className="text-[10px] text-amber-700 uppercase tracking-wide">Ambiguous</span>}
      </div>
      <p className="mt-1 text-slate-800">{text}</p>
      <ul className="mt-1 list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
        {notes.map((n) => <li key={n}>{n}</li>)}
      </ul>
    </div>
  );
}

function MetaChip({ children, tone }: { children: React.ReactNode; tone?: "warn" }) {
  return (
    <span
      className={`px-2 py-0.5 rounded border font-mono ${
        tone === "warn"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}

function RankedHypotheses({ list, isT3 }: { list: Hypothesis[]; isT3: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Ranked Root-Cause Hypotheses</div>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">Advisory · not proof</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {list.map((h) => {
          const state = isT3 && h.rank === 1 ? "Confirmed" : h.review;
          return (
            <li key={h.rank} className="p-3">
              <div className="flex items-start gap-2">
                <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${h.rank === 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                  H{h.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">{h.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500 flex flex-wrap gap-x-2">
                    <span>{h.classification}</span>
                    <span>·</span>
                    <span className={h.confidence >= 80 ? "text-indigo-700" : h.confidence >= 50 ? "text-slate-700" : "text-slate-500"}>
                      Conf {h.confidence}%
                    </span>
                    <span>·</span>
                    <span>Owner {h.owner}</span>
                  </div>
                  <ConfBar value={h.confidence} />
                  <details className="mt-2 text-[11px]">
                    <summary className="cursor-pointer text-indigo-700 hover:underline">Evidence</summary>
                    <div className="mt-1 space-y-1 text-slate-700">
                      <EvidenceList label="Supports" items={h.support} tone="ok" />
                      <EvidenceList label="Contradicts" items={h.contradict} tone="bad" />
                      {h.missing.length > 0 && <EvidenceList label="Missing" items={h.missing} tone="warn" />}
                      <div><span className="font-semibold">Next test:</span> {h.nextTest}</div>
                    </div>
                  </details>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        state === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : state === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : state === "Under Review"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {state}
                    </span>
                    <div className="flex gap-1">
                      <button className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-50">Confirm</button>
                      <button className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-50">Reject</button>
                      <button className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-50">Reorder</button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EvidenceList({ label, items, tone }: { label: string; items: string[]; tone: "ok" | "bad" | "warn" }) {
  const dot = tone === "ok" ? "bg-emerald-500" : tone === "bad" ? "bg-rose-500" : "bg-amber-500";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <ul className="mt-0.5 space-y-0.5">
        {items.map((s) => (
          <li key={s} className="flex gap-1.5"><span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />{s}</li>
        ))}
      </ul>
    </div>
  );
}

function ConfBar({ value }: { value: number }) {
  return (
    <div className="mt-1 h-1.5 w-full rounded bg-slate-100 overflow-hidden">
      <div
        style={{ width: `${value}%` }}
        className={`h-full ${value >= 80 ? "bg-indigo-600" : value >= 50 ? "bg-indigo-400" : "bg-slate-400"}`}
      />
    </div>
  );
}

function AiEvidencePanel() {
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 shadow-sm">
      <div className="px-4 py-3 border-b border-indigo-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-700" />
        <div className="text-sm font-semibold text-slate-900">AI Diagnosis Evidence</div>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-indigo-700">Advisory</span>
      </div>
      <div className="p-4 text-xs text-slate-800 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Leading hypothesis</div>
          <div className="font-semibold text-slate-900">Inclusive comparison introduced a boundary defect</div>
          <div className="mt-1 text-slate-600">
            The candidate RTL rejects descriptors whose length equals the configured maximum. The requirement states that only values exceeding the maximum must be rejected. First divergence occurs at <span className="font-mono">length_error</span>, three cycles before the scoreboard mismatch.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-emerald-700">Supports</div>
            <ul className="mt-0.5 space-y-0.5 text-[11px]">
              {[
                "Candidate `>=`, baseline `>`",
                "All failing seeds hit exact boundary",
                "Below-max passes, above-max rejects",
                "Formal CEX matches seed 348921",
                "Prior defect DEF-DV-173 (93%)",
                "Commit timing aligns with regression",
              ].map((s) => <li key={s} className="flex gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />{s}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-rose-700">Contradicts / incomplete</div>
            <ul className="mt-0.5 space-y-0.5 text-[11px]">
              {[
                "2 failures include privilege violations",
                "Error timing (REQ 143) unresolved",
                "7 dual-error waveforms partial",
                "Checker ordering condition unexplored",
              ].map((s) => <li key={s} className="flex gap-1"><Ban className="w-3 h-3 text-rose-600 mt-0.5 shrink-0" />{s}</li>)}
            </ul>
          </div>
        </div>
        <div className="rounded border border-indigo-200 bg-white p-2 text-[11px] text-slate-700">
          <span className="font-semibold">Recommendation.</span> Confirm boundary comparison as primary root cause, split dual-error cases into a secondary cluster, clarify error-timing semantics, and review the bounded operator correction.
        </div>
        <p className="text-[11px] text-slate-500 italic">
          Confidence reflects correlation strength and evidence completeness. It is not root-cause approval.
        </p>
      </div>
    </div>
  );
}

function EvidenceScorecard({ rows, completeness }: { rows: EvidenceRow[]; completeness: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Evidence Quality</div>
        <span className="ml-auto text-xs font-mono text-slate-700">{completeness}%</span>
      </div>
      <ul className="divide-y divide-slate-100 text-xs">
        {rows.map((r) => (
          <li key={r.type} className="px-4 py-1.5 flex items-center gap-2">
            <span
              className={`w-16 shrink-0 text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded text-center ${
                r.state === "Complete"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : r.state === "Partial"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {r.state}
            </span>
            <div className="min-w-0">
              <div className="text-slate-900 truncate">{r.type}</div>
              <div className="text-[10px] font-mono text-slate-500 truncate">{r.note}</div>
            </div>
          </li>
        ))}
      </ul>
      <p className="px-4 py-2 border-t border-slate-100 text-[11px] text-slate-500">
        Missing evidence reduces leading confidence and may block root-cause confirmation.
      </p>
    </div>
  );
}

function DefectPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-rose-600" />
        <div className="text-sm font-semibold text-slate-900">Defect Lifecycle</div>
        <span className="ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">DEF-DV-219</span>
      </div>
      <dl className="p-3 text-xs font-mono divide-y divide-slate-100">
        {[
          ["State", "Under Investigation"],
          ["Severity", "High"],
          ["Cluster", "FC-031"],
          ["Requirement", "REQ-DDMAC-142"],
          ["Suspect commit", "a8c31f7"],
          ["Root cause", "Pending confirmation"],
          ["Proposed correction", "In review"],
          ["Validation", "Not started"],
          ["Owner", "Maya Chen"],
          ["Verification owner", "Sofia Rodriguez"],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-3 py-1.5">
            <dt className="w-32 text-[10px] uppercase tracking-wide text-slate-500 pt-0.5">{k}</dt>
            <dd className="text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="p-3 pt-0 flex flex-wrap gap-1.5">
        {["Update evidence", "Add hypothesis", "Add correction", "Add validation plan", "Return for investigation"].map((a) => (
          <button key={a} className="text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50">{a}</button>
        ))}
      </div>
      <p className="px-3 pb-3 text-[11px] text-slate-500">
        Defect closure is not permitted until validation evidence exists and qualified reviewers approve closure.
      </p>
    </div>
  );
}

function AuthoritiesPanel({ rows, isT3 }: { rows: typeof AUTHORITIES; isT3: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Human Review Authority</div>
      </div>
      <ul className="divide-y divide-slate-100 text-xs">
        {rows.map((r) => {
          const status = isT3 ? "Confirmed" : r.status;
          return (
            <li key={r.role} className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{r.role}</div>
                <span
                  className={`text-[10px] uppercase tracking-wide font-mono px-1.5 py-0.5 rounded ${
                    status === "Confirmed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {status}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-600">{r.owner}</div>
              <div className="text-[11px] text-slate-500">{r.responsibility}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FirstDivergence() {
  const stages = [
    { label: "Requirement", value: "REQ-DDMAC-142", ok: true },
    { label: "Configuration", value: "max=4096", ok: true },
    { label: "Transaction", value: "len=4096", ok: true },
    { label: "RTL expression", value: "len >= max", ok: false, tag: "Root condition" },
    { label: "State transition", value: "IDLE → REJECT", ok: false, tag: "Propagated" },
    { label: "Assertion", value: "p_max_legal fails", ok: false, tag: "Propagated" },
    { label: "Scoreboard", value: "Mismatch", ok: false, tag: "Visible symptom" },
  ];
  return (
    <Card
      title="First-Divergence Analysis"
      subtitle="Trace from root condition to visible symptom — the scoreboard mismatch is not the root cause"
      icon={<Zap className="w-4 h-4 text-indigo-600" />}
    >
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Expected path</div>
          <div className="mt-1 text-slate-700 font-mono">Descriptor sampled → boundary comparison legal → ACCEPT → completion</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-rose-700 font-semibold">Observed path</div>
          <div className="mt-1 text-slate-700 font-mono">Descriptor sampled → length_error asserts → REJECT → error interrupt</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1">
            <div
              className={`px-2 py-1 rounded border text-[11px] font-mono ${
                s.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : s.tag === "Root condition"
                  ? "border-rose-300 bg-rose-50 text-rose-800 font-semibold"
                  : s.tag === "Visible symptom"
                  ? "border-slate-300 bg-slate-100 text-slate-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <div>{s.label}</div>
              <div className="text-[10px] text-slate-600">{s.value}</div>
              {s.tag && <div className="text-[9px] uppercase mt-0.5">{s.tag}</div>}
            </div>
            {i < stages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProposedCorrection() {
  return (
    <Card
      title="Proposed Bounded Correction"
      subtitle="Review only — AVEP does not modify or commit RTL"
      icon={<GitCommit className="w-4 h-4 text-indigo-600" />}
      right={<span className="text-[10px] uppercase tracking-wide text-amber-700">Not applied</span>}
    >
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <SourceBlock
          title="Current (candidate)"
          path="ddmac_descriptor_validator.sv:157"
          lines={[
            "assign length_error =",
            "    desc_valid &&",
            "    (desc_length >= max_transfer_length);",
          ]}
          highlight={2}
          tone="bad"
        />
        <SourceBlock
          title="Proposed (bounded)"
          path="ddmac_descriptor_validator.sv:157"
          lines={[
            "assign length_error =",
            "    desc_valid &&",
            "    (desc_length >  max_transfer_length);",
          ]}
          highlight={2}
          tone="ok"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
        <Info label="Requirement basis" value="REQ-DDMAC-142" />
        <Info label="Assumptions" value="max_transfer_length stable during handshake" />
        <Info label="Expected effect" value="Restore acceptance at exact boundary" />
        <Info label="Affected modules" value="ddmac_descriptor_validator" />
        <Info label="Affected tests" value="42 targeted · 412 dependent" />
        <Info label="Affected properties" value="p_max_legal_length_accepted" />
        <Info label="Reviewers required" value="RTL, DV, Formal, Architect" />
        <Info label="Risk / confidence" value="Low · 89%" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionBtn>Open in Change Impact Analysis</ActionBtn>
        <ActionBtn>Request RTL Owner Review</ActionBtn>
        <ActionBtn>Modify Proposal</ActionBtn>
        <ActionBtn>Reject Proposal</ActionBtn>
        <ActionBtn variant="primary">Approve for Controlled Validation</ActionBtn>
      </div>
      <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
        This proposal has not been applied to the repository. Approval authorizes controlled implementation and validation only — not baseline acceptance or defect closure.
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-slate-900">{value}</div>
    </div>
  );
}

function ValidationPlan() {
  const groups = [
    {
      title: "Static & Structural",
      items: ["Compile & elaboration", "RTL lint (bounded scope)", "Synthesis readiness check", "Width / signedness delta", "Comparison semantics review"],
    },
    {
      title: "Directed Simulation",
      items: [
        "length = 0",
        "length < max",
        "length == max",
        "length > max",
        "length == max + 1",
        "Consecutive boundary descriptors",
        "Length + privilege error concurrency",
        "Reset during boundary validation",
      ],
    },
    {
      title: "Constrained Random",
      items: ["Weighted boundary values", "Random register config", "Privilege combinations", "Backpressure combinations", "Error concurrency"],
    },
    {
      title: "Assertions & Formal",
      items: [
        "p_max_legal_length_accepted (equal-to-max)",
        "p_above_max_rejected",
        "p_accept_reject_exclusive",
        "p_error_code_matches_condition",
        "Formal CEX no longer reproduces",
      ],
    },
  ];
  const regression = [
    { label: "Targeted rerun", value: "42 tests · 126 jobs", hours: "~1.4 h" },
    { label: "Checker validation", value: "8 mutation scenarios", hours: "~0.6 h" },
    { label: "Dependent regression", value: "412 tests · 1,860 jobs", hours: "~22 h" },
    { label: "Full IP regression", value: "Conditional", hours: "Only on unexpected dependent failures" },
  ];
  return (
    <Card
      title="Recommended Validation Plan"
      subtitle="Proportionate scope. All future values are estimates."
      icon={<PlayCircle className="w-4 h-4 text-indigo-600" />}
    >
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        {groups.map((g) => (
          <div key={g.title} className="rounded border border-slate-200 p-3">
            <div className="text-[11px] font-semibold text-slate-900">{g.title}</div>
            <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-700">
              {g.items.map((i) => (
                <li key={i} className="flex gap-1"><ChevronRight className="w-3 h-3 text-slate-400 mt-0.5" />{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
            <tr className="text-left"><th className="py-1">Regression scope</th><th>Volume</th><th>Estimated runtime</th></tr>
          </thead>
          <tbody>
            {regression.map((r) => (
              <tr key={r.label} className="border-b border-slate-100">
                <td className="py-1 text-slate-900">{r.label}</td>
                <td className="text-slate-700">{r.value}</td>
                <td className="text-slate-600">{r.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Regression completion is not signoff. Coverage closure and formal proof status are tracked separately.
      </p>
    </Card>
  );
}

function Metric({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: "ok" | "warn" }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span
        className={`${mono ? "font-mono" : "font-semibold"} text-sm ${
          tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ActionBtn({
  children,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  variant?: "primary";
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`text-xs px-3 py-1.5 rounded border font-medium ${
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
          : variant === "primary"
          ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

// unused imports guard
void [Cpu, FileText, ShieldCheck, RefreshCw];
