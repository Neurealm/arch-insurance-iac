import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity, AlertTriangle, Check, ChevronDown, ChevronRight, Cloud, Database, Download,
  FileText, Lock, MonitorCog, ShieldCheck, Timer, X, Play, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, Pill, KeyValue, ReviewDrawer, ReviewModal, RadialScore, type Tone } from "./review/parts";
import {
  AUTOMATION_OUTCOME, CLOSURE_SEQUENCE, DOMAINS, DURATIONS, EVIDENCE_TABS, EVIDENCE_TAB_CONTENT,
  INTEGRITY_ROWS, INTENDED_OUTCOME, ORIGINAL_CONDITION, OUTCOME_ROWS, SCENARIOS, SERVICE_ROWS,
  TESTS, TIMELINE, TRACE, TWIN_ROWS, VAL_PACKAGE, VERIFICATION_SEQUENCE,
  type OutcomeRow, type ValTest, type ValidationScenario, type Verdict,
} from "./validation/data";

type Phase = "pending" | "validating" | "verified" | "closing" | "closed";

const DOMAIN_ICON: Record<string, typeof Database> = {
  "SQL Server": Database, AWS: Cloud, Windows: MonitorCog, Application: Activity,
};

function Verd({ v }: { v: Verdict }) {
  return <Pill tone={v === "PASS" ? "ok" : v === "WARN" ? "warn" : "bad"}>{v}</Pill>;
}

function YesNo({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 py-1 last:border-0">
      <span className="text-[11.5px] text-slate-600">{label}</span>
      <span className="ml-auto flex items-center gap-1.5">
        {good ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
        <span className={cn("text-[11.5px] font-semibold", good ? "text-emerald-700" : "text-rose-700")}>{value}</span>
      </span>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">{children}</pre>;
}

export default function ValidationEvidence() {
  const { packageId } = useParams();
  const pkgId = packageId ?? VAL_PACKAGE.packageId;

  const [scenario, setScenario] = useState<ValidationScenario>("success");
  const [phase, setPhase] = useState<Phase>("pending");
  const [log, setLog] = useState<string[]>([]);
  const [testDrawer, setTestDrawer] = useState<ValTest | null>(null);
  const [rowDrawer, setRowDrawer] = useState<OutcomeRow | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evTab, setEvTab] = useState<string>("Summary");
  const [closeModal, setCloseModal] = useState(false);
  const [closeAck, setCloseAck] = useState(false);
  const [traceOpen, setTraceOpen] = useState(true);
  const [closedAt, setClosedAt] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  /* ---------------- scenario-driven results ---------------- */
  const tests = useMemo<ValTest[]>(() => TESTS.map((x) => {
    if (scenario === "sql_failure" && x.id === "SQL-VAL-003")
      return { ...x, observed: "LOG_BACKUP", result: "FAIL" as Verdict, raw: "log_reuse_wait_desc = LOG_BACKUP", confidence: 99 };
    if (scenario === "sql_failure" && x.id === "SQL-VAL-004")
      return { ...x, observed: "No", result: "FAIL" as Verdict, raw: "Log Space Used (%) = 94.8" };
    if (scenario === "drift" && x.id === "AWS-VAL-005")
      return { ...x, observed: "Out-of-band modification detected", result: "FAIL" as Verdict, raw: "CloudTrail ModifyVolume by iam:ops-oncall at 12:55 — not in approved package" };
    if (scenario === "app_regression" && x.id === "APP-VAL-004")
      return { ...x, observed: "Outside baseline", result: "FAIL" as Verdict, raw: "tps 2,981 (-13.6%) · err 1.42% · p95 812 ms" };
    if (scenario === "app_regression" && x.id === "APP-VAL-003")
      return { ...x, observed: "FAIL", result: "FAIL" as Verdict, raw: "synthetic order timed out after 5,000 ms" };
    return x;
  }), [scenario]);

  const failed = tests.filter((x) => x.result !== "PASS");
  const passedCount = tests.length - failed.length;
  const evidenceComplete = scenario !== "evidence_incomplete";
  const verified = phase === "verified" || phase === "closing" || phase === "closed";
  const outcomeVerified = failed.length === 0 && evidenceComplete;
  const confidence = !verified ? VAL_PACKAGE.confidence : outcomeVerified ? 98 : failed.length ? 42 : 61;

  const outcomeRows = useMemo<OutcomeRow[]>(() => OUTCOME_ROWS.map((r) => {
    if (scenario === "sql_failure" && r.id === "OV-01") return { ...r, actual: "LOG_BACKUP", result: "FAIL" as Verdict };
    if (scenario === "sql_failure" && r.id === "OV-02") return { ...r, actual: "94%", result: "FAIL" as Verdict };
    if (scenario === "app_regression" && r.id === "OV-08") return { ...r, actual: "FAIL", result: "FAIL" as Verdict };
    if (scenario === "app_regression" && r.id === "OV-09") return { ...r, actual: "Degraded", result: "FAIL" as Verdict };
    return r;
  }), [scenario]);

  const serviceRows = useMemo(() => scenario === "app_regression"
    ? [
        { m: "Transactions / minute", before: "3,450", after: "2,981", delta: "-13.6%", good: false },
        { m: "Error Rate", before: "0.12%", after: "1.42%", delta: "+1.30%", good: false },
        { m: "P95 Latency", before: "235 ms", after: "812 ms", delta: "+577 ms", good: false },
        { m: "Health", before: "Healthy", after: "Degraded", delta: "—", good: false },
        { m: "Synthetic Order", before: "PASS", after: "FAIL", delta: "—", good: false },
        { m: "Database Connectivity", before: "Healthy", after: "Healthy", delta: "—", good: true },
        { m: "Critical Alerts", before: "0", after: "2", delta: "+2", good: false },
      ]
    : SERVICE_ROWS, [scenario]);

  const statusLabel = phase === "pending" ? "FINAL VALIDATION REQUIRED"
    : phase === "validating" ? "VALIDATING"
    : phase === "closing" ? "CLOSING"
    : phase === "closed" ? "VERIFIED & CLOSED"
    : outcomeVerified ? "VERIFIED" : "VALIDATION FAILED";
  const statusTone: Tone = phase === "pending" ? "warn" : phase === "validating" || phase === "closing" ? "info"
    : outcomeVerified ? "ok" : "bad";

  const runSequence = (steps: string[], done: () => void) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLog([]);
    steps.forEach((s, i) => {
      timers.current.push(window.setTimeout(() => setLog((l) => [...l, s]), 260 * (i + 1)));
    });
    timers.current.push(window.setTimeout(done, 260 * (steps.length + 1)));
  };

  const runVerification = () => {
    setPhase("validating");
    runSequence(VERIFICATION_SEQUENCE, () => setPhase("verified"));
  };

  const runClosure = () => {
    setCloseModal(false);
    setPhase("closing");
    runSequence(CLOSURE_SEQUENCE, () => {
      setClosedAt(new Date().toLocaleString());
      setPhase("closed");
    });
  };

  const closureCriteria: [string, boolean][] = [
    ["Operational problem resolved", !failed.some((f) => f.domain === "SQL Server")],
    ["Infrastructure state validated", !failed.some((f) => f.domain === "AWS" || f.domain === "Windows")],
    ["Business service healthy", !failed.some((f) => f.domain === "Application")],
    ["Evidence captured", evidenceComplete],
    ["Policy requirements satisfied", scenario !== "drift"],
    ["Digital Twin reconciled", true],
  ];
  const canClose = verified && outcomeVerified && phase !== "closed";

  /* ---------------- render ---------------- */
  return (
    <div className="min-w-0 px-4 py-4">
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-slate-500">
        {["Assets", "SQL Servers", "SQL-PROD-07", "Remediation Intelligence", "Change Engineering", "Change Review & Approval", "Execution Center"].map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className="hover:text-slate-700">{c}</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
          </span>
        ))}
        <span className="font-medium text-slate-700">Validation &amp; Evidence</span>
      </nav>

      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">Validation &amp; Evidence</h1>
            <Pill tone={statusTone}>{statusLabel}</Pill>
          </div>
          <p className="mt-0.5 text-[12.5px] text-slate-600">Outcome Verification &amp; Change Closure</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
            Validation Scenario
            <select
              value={scenario}
              disabled={phase !== "pending"}
              onChange={(ev) => setScenario(ev.target.value as ValidationScenario)}
              className="h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700 disabled:opacity-50"
            >
              {SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <button
            onClick={() => window.print()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> Export Evidence Report
          </button>
          <button
            onClick={() => { setEvTab("Summary"); setEvidenceOpen(true); }}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" /> View Evidence Package
          </button>
          {phase === "closed" ? (
            <Link to="/resources" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#173f75]">
              <Database className="h-3.5 w-3.5" /> View Updated Digital Twin
            </Link>
          ) : verified ? (
            <button
              onClick={() => { setCloseAck(false); setCloseModal(true); }}
              disabled={!canClose}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-700 px-3 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Verify &amp; Close Change
            </button>
          ) : (
            <button
              onClick={runVerification}
              disabled={phase === "validating"}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#173f75] disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" /> Run Final Verification
            </button>
          )}
        </div>
      </header>

      {/* Header metrics */}
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 md:grid-cols-4 xl:grid-cols-7">
        <KeyValue label="Change Package" value={<span className="font-mono">{pkgId}</span>} />
        <KeyValue label="Version" value={`${VAL_PACKAGE.packageVersion} · ${VAL_PACKAGE.state}`} />
        <KeyValue label="Authorization" value={<span className="font-mono">{VAL_PACKAGE.authorization}</span>} />
        <KeyValue label="Execution Status" value={VAL_PACKAGE.executionStatus} />
        <KeyValue label="Execution Duration" value={VAL_PACKAGE.executionDuration} />
        <KeyValue label="Validated By" value={`${VAL_PACKAGE.validatedBy} ${VAL_PACKAGE.engineVersion}`} />
        <KeyValue label="Confidence" value={`${confidence}%`} />
      </div>

      {/* Verification / closure console */}
      {(phase === "validating" || phase === "closing" || log.length > 0) && phase !== "closed" && (
        <section className="mt-3 rounded-lg border border-[#E2E8F0] bg-white p-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
            {phase === "closing" ? "Closure Sequence" : "Final Verification Sequence"}
          </div>
          <Code>{log.join("\n") || "Starting..."}</Code>
        </section>
      )}

      {phase === "pending" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            Execution completed successfully across all 8 stages, but the change is <strong>not</strong> closed.
            Terraform, AWS API, PowerShell and workflow success are not sufficient — the intended outcome must be
            independently validated. Run final verification to evaluate the observed outcome.
            <div className="mt-1 text-[11.5px] text-amber-700">Scenario: {SCENARIOS.find((s) => s.id === scenario)?.note}</div>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------------- MAIN COLUMN ---------------- */}
        <div className="min-w-0 space-y-3">
          {/* Three-state outcome model */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Panel title="Original Condition · Before">
              <div className="text-[12px] font-semibold text-slate-900">{VAL_PACKAGE.target}</div>
              <div className="text-[11px] text-slate-500">Detected {ORIGINAL_CONDITION.detected}</div>
              <div className="mt-2">
                {ORIGINAL_CONDITION.rows.map(([k, v]) => <KeyValue key={k} label={k} value={v} />)}
              </div>
              <p className="mt-2 rounded-md bg-rose-50 p-2 text-[11.5px] text-rose-800">
                <strong>Root cause:</strong> {ORIGINAL_CONDITION.rootCause}
              </p>
            </Panel>

            <Panel title="Intended Outcome · Target">
              <ul className="space-y-1.5">
                {INTENDED_OUTCOME.map((i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />{i}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Observed Outcome · Actual">
              {!verified ? (
                <p className="text-[11.5px] text-slate-500">
                  Observed outcome is not asserted until final verification completes. Run final verification to
                  collect current SQL, AWS, Windows and application state.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {outcomeRows.map((r) => (
                    <li key={r.id} className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                      {r.result === "PASS"
                        ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        : <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />}
                      <span title={r.id === "OV-01" ? "No current condition is preventing transaction-log reuse." : r.detail}>
                        {r.measure}: <strong className={r.result === "PASS" ? "text-slate-900" : "text-rose-700"}>{r.actual}</strong>
                      </span>
                    </li>
                  ))}
                  <li className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                    {scenario === "drift"
                      ? <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                      : <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                    Unexpected side effects: <strong>{scenario === "drift" ? "Drift detected" : "None Detected"}</strong>
                  </li>
                </ul>
              )}
            </Panel>
          </div>

          {/* Outcome verification summary */}
          <Panel title="Outcome Verification Summary" actions={<span className="text-[11px] text-slate-500">Rows are clickable</span>}>
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                    <th className="py-1.5 pr-3 font-semibold">Measure</th>
                    <th className="py-1.5 pr-3 font-semibold">Before</th>
                    <th className="py-1.5 pr-3 font-semibold">Intended</th>
                    <th className="py-1.5 pr-3 font-semibold">Actual</th>
                    <th className="py-1.5 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomeRows.map((r) => (
                    <tr key={r.id} onClick={() => setRowDrawer(r)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-1.5 pr-3 font-medium text-slate-800">{r.measure}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{r.before}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{r.intended}</td>
                      <td className="py-1.5 pr-3 font-medium text-slate-900">{verified ? r.actual : "—"}</td>
                      <td className="py-1.5">{verified ? <Verd v={r.result} /> : <Pill>PENDING</Pill>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Validation results */}
          <Panel
            title="Validation Results"
            actions={<Pill tone={!verified ? "neutral" : failed.length ? "bad" : "ok"}>
              {verified ? `${passedCount} / ${tests.length} PASSED` : `${tests.length} TESTS PENDING`}
            </Pill>}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {DOMAINS.map((d) => {
                const list = tests.filter((x) => x.domain === d);
                const pass = list.filter((x) => x.result === "PASS").length;
                const Icon = DOMAIN_ICON[d];
                return (
                  <div key={d} className="rounded-md border border-[#E2E8F0]">
                    <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-2.5 py-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[11.5px] font-semibold text-slate-800">{d} Validation</span>
                      <span className="ml-auto">
                        {verified
                          ? <Pill tone={pass === list.length ? "ok" : "bad"}>{pass} / {list.length} Passed</Pill>
                          : <Pill>{list.length} Pending</Pill>}
                      </span>
                    </div>
                    <ul>
                      {list.map((x) => (
                        <li key={x.id}>
                          <button
                            onClick={() => setTestDrawer(x)}
                            className="flex w-full items-center gap-2 border-b border-slate-100 px-2.5 py-1.5 text-left last:border-0 hover:bg-slate-50"
                          >
                            {verified
                              ? (x.result === "PASS"
                                ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                : <X className="h-3.5 w-3.5 shrink-0 text-rose-600" />)
                              : <Timer className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
                            <span className="text-[11.5px] text-slate-700">{x.name}</span>
                            <span className="ml-auto font-mono text-[10.5px] text-slate-400">{x.id}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {verified && (
              <div className={cn("mt-3 rounded-md px-3 py-2 text-center text-[13px] font-semibold text-white",
                failed.length ? "bg-rose-600" : "bg-emerald-700")}>
                {failed.length ? `${failed.length} VALIDATION FAILURE${failed.length > 1 ? "S" : ""} — CHANGE CANNOT BE CLOSED` : "21 / 21 PASSED · 100%"}
              </div>
            )}
          </Panel>

          {/* Digital twin reconciliation */}
          <Panel title="Digital Twin Reconciliation" actions={
            <Link to="/resources" className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
              View Updated Digital Twin
            </Link>
          }>
            <div className="mb-2 text-[11.5px] text-slate-600">Asset: <strong className="text-slate-900">SQL-PROD-07</strong></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                    <th className="py-1.5 pr-3 font-semibold">Attribute</th>
                    <th className="py-1.5 pr-3 font-semibold">Previous State</th>
                    <th className="py-1.5 pr-3 font-semibold">Current State</th>
                    <th className="py-1.5 pr-3 font-semibold">Change</th>
                    <th className="py-1.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {TWIN_ROWS.map((r) => (
                    <tr key={r.attr} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-medium text-slate-800">{r.attr}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{r.prev}</td>
                      <td className="py-1.5 pr-3 font-medium text-slate-900">{verified ? r.cur : "—"}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{verified ? r.change : "—"}</td>
                      <td className="py-1.5">{verified ? <Pill tone={r.status === "Updated" ? "info" : "ok"}>{r.status}</Pill> : <Pill>Pending</Pill>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-x-6 md:grid-cols-3">
              <KeyValue label="Last Reconciled" value={verified ? "May 13, 2026 12:59 PM" : "—"} />
              <KeyValue label="Source" value="Execution Evidence + Current Discovery" />
              <KeyValue label="Configuration Confidence" value={verified ? "99%" : "—"} />
            </div>
          </Panel>

          {/* Business service verification */}
          <Panel title="Business Service Verification" actions={<Pill tone={scenario === "app_regression" && verified ? "bad" : "ok"}>Order Processing Service</Pill>}>
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
                    <th className="py-1.5 pr-3 font-semibold">Measure</th>
                    <th className="py-1.5 pr-3 font-semibold">Before</th>
                    <th className="py-1.5 pr-3 font-semibold">After</th>
                    <th className="py-1.5 font-semibold">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRows.map((r) => (
                    <tr key={r.m} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-medium text-slate-800">{r.m}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{r.before}</td>
                      <td className={cn("py-1.5 pr-3 font-medium", r.good ? "text-slate-900" : "text-rose-700")}>{verified ? r.after : "—"}</td>
                      <td className={cn("py-1.5", r.good ? "text-emerald-700" : "text-rose-700")}>{verified ? r.delta : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={cn("mt-2 rounded-md p-2 text-[11.5px]",
              scenario === "app_regression" && verified ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800")}>
              {scenario === "app_regression" && verified
                ? "Material business-service degradation detected. Infrastructure state is correct but the outcome is not acceptable."
                : "No material degradation detected. The infrastructure change is validated through the business-service lens."}
            </p>
          </Panel>

          {/* Traceability */}
          <Panel title="End-to-End Traceability" actions={
            <button onClick={() => setTraceOpen((v) => !v)} className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900">
              {traceOpen ? "Collapse" : "Expand"} <ChevronDown className={cn("h-3.5 w-3.5 transition", !traceOpen && "-rotate-90")} />
            </button>
          }>
            {traceOpen && (
              <ol className="space-y-1">
                {TRACE.map((s, i) => {
                  const inner = (
                    <div className="flex items-center gap-2 rounded-md border border-[#E2E8F0] px-2.5 py-1.5 hover:bg-slate-50">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">{i + 1}</span>
                      <span className="text-[11.5px] font-medium text-slate-800">{s.k}</span>
                      <span className="ml-auto text-[11.5px] text-slate-600">{s.v}</span>
                      {s.to && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                  );
                  return (
                    <li key={s.k}>
                      {s.to ? <Link to={s.to}>{inner}</Link> : inner}
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>

          {/* Timeline + automation */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Panel title="Remediation Timeline">
              <ul className="space-y-1">
                {TIMELINE.map(([k, v]) => (
                  <li key={k} className="flex items-center gap-2 border-b border-slate-100 py-1 last:border-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11.5px] text-slate-700">{k}</span>
                    <span className="ml-auto font-mono text-[11px] text-slate-600">{v}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 py-1">
                  {phase === "closed" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Timer className="h-3.5 w-3.5 text-slate-300" />}
                  <span className="text-[11.5px] text-slate-700">Change Closed</span>
                  <span className="ml-auto font-mono text-[11px] text-slate-600">{closedAt ?? "Pending"}</span>
                </li>
              </ul>
              <div className="mt-2 border-t border-slate-100 pt-2">
                {DURATIONS.map(([k, v]) => <KeyValue key={k} label={k} value={v} />)}
                <KeyValue label="Hands-on-Keyboard Infrastructure Administration" value="0 min" />
                <p className="mt-1 text-[11px] text-slate-500">
                  No engineer manually logged into AWS, Windows or SQL consoles to perform infrastructure
                  administration. Human approval time is governance, not hands-on-keyboard administration.
                </p>
              </div>
            </Panel>

            <Panel title="Automation Outcome">
              {AUTOMATION_OUTCOME.map(([k, v]) => <KeyValue key={k} label={k} value={v} />)}
            </Panel>
          </div>

          {/* Evidence integrity */}
          <Panel title="Evidence Integrity" actions={
            <Pill tone={evidenceComplete ? "ok" : "bad"}>{evidenceComplete ? "VERIFIED" : "INCOMPLETE"}</Pill>
          }>
            <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
              {INTEGRITY_ROWS.map(([k, v]) => (
                <KeyValue key={k} label={k}
                  value={!evidenceComplete && (k === "Evidence Chain" || k === "Post-State Snapshot")
                    ? <span className="text-rose-700">Missing</span> : v} />
              ))}
            </div>
            <div className="mt-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Evidence Hash</div>
              <div className="mt-1 break-all font-mono text-[11px] text-slate-700">{VAL_PACKAGE.evidenceHash}</div>
            </div>
            {!evidenceComplete && (
              <p className="mt-2 rounded-md bg-rose-50 p-2 text-[11.5px] text-rose-800">
                Evidence chain cannot be sealed. Post-state snapshot and chain continuity are missing — the change
                cannot be closed until evidence is complete.
              </p>
            )}
          </Panel>
        </div>

        {/* ---------------- RIGHT RAIL ---------------- */}
        <aside className="space-y-3">
          <Panel title="Outcome Assessment">
            <YesNo label="Root Cause Corrected" value={verified ? (failed.some((f) => f.domain === "SQL Server") ? "NO" : "YES") : "PENDING"} good={verified && !failed.some((f) => f.domain === "SQL Server")} />
            <YesNo label="Capacity Risk Mitigated" value={verified ? (scenario === "sql_failure" ? "NO" : "YES") : "PENDING"} good={verified && scenario !== "sql_failure"} />
            <YesNo label="Infrastructure Desired State Achieved" value={verified ? (scenario === "drift" ? "NO" : "YES") : "PENDING"} good={verified && scenario !== "drift"} />
            <YesNo label="Database Health Preserved" value={verified ? "YES" : "PENDING"} good={verified} />
            <YesNo label="Business Service Health Preserved" value={verified ? (scenario === "app_regression" ? "NO" : "YES") : "PENDING"} good={verified && scenario !== "app_regression"} />
            <YesNo label="Unexpected Side Effects Detected" value={verified ? (scenario === "drift" ? "YES" : "NO") : "PENDING"} good={verified && scenario !== "drift"} />
            <YesNo label="Policy Violations" value="0" good />
            <YesNo label="Material Downtime Detected" value="NO" good />
            <YesNo label="Validation Coverage" value="100%" good />

            <div className="mt-3 flex items-center gap-3">
              <RadialScore value={confidence} label="confidence" />
              <div className={cn("flex-1 rounded-md p-2 text-center text-[12px] font-semibold text-white",
                !verified ? "bg-slate-400" : outcomeVerified ? "bg-emerald-700" : "bg-rose-600")}>
                {!verified ? "PENDING VALIDATION" : outcomeVerified ? "REMEDIATION VERIFIED" : "REMEDIATION NOT VERIFIED"}
              </div>
            </div>
          </Panel>

          <Panel title="Change Evidence Record" actions={
            <button onClick={() => { setEvTab("Summary"); setEvidenceOpen(true); }} className="rounded-md border border-[#E2E8F0] px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
              View Package
            </button>
          }>
            <KeyValue label="Evidence ID" value={VAL_PACKAGE.evidenceId} mono />
            <KeyValue label="Linked Change Package" value={pkgId} mono />
            <KeyValue label="Authorization" value={VAL_PACKAGE.authorization} mono />
            <KeyValue label="Package Version" value={`${VAL_PACKAGE.packageVersion} (Immutable)`} />
            <KeyValue label="Execution Events" value={String(VAL_PACKAGE.executionEvents)} />
            <KeyValue label="Validation Tests" value={verified ? `${passedCount} / ${tests.length} Passed` : `${tests.length} Pending`} />
            <KeyValue label="Policy Violations" value="0" />
            <KeyValue label="Approval Evidence" value="Complete" />
            <KeyValue label="Pre-State Snapshot" value="Captured" />
            <KeyValue label="Post-State Snapshot" value={evidenceComplete ? "Captured" : "Missing"} />
            <KeyValue label="Execution Log" value="Captured" />
            <KeyValue label="Validation Evidence" value={verified ? "Captured" : "Pending"} />
            <KeyValue label="Digital Twin Reconciliation" value={verified ? "Complete" : "Pending"} />
            <KeyValue label="Evidence Integrity" value={evidenceComplete ? "Verified" : "Incomplete"} />
            <KeyValue label="Evidence Package" value={VAL_PACKAGE.evidencePackage} mono />
            <KeyValue label="Recorded" value={verified ? "May 13, 2026 12:59 PM" : "—"} />
          </Panel>

          <Panel title="Change Closure">
            <KeyValue label="Status" value={
              phase === "closed" ? "Verified & Closed"
                : !verified ? "Pending Validation"
                : outcomeVerified ? "Ready to Close" : "Closure Blocked"
            } />
            <div className="mt-2 space-y-0.5">
              {closureCriteria.map(([k, ok]) => (
                <YesNo key={k} label={k} value={!verified ? "Pending" : ok ? "Passed" : "Failed"} good={verified && ok} />
              ))}
            </div>
            {phase === "closed" ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-[12.5px] font-semibold text-white">
                  <Lock className="h-4 w-4" /> VERIFIED &amp; CLOSED
                </div>
                <KeyValue label="Change Package" value={pkgId} mono />
                <KeyValue label="Evidence" value={VAL_PACKAGE.evidenceId} mono />
                <KeyValue label="Final Status" value="Verified & Closed" />
                <KeyValue label="Closed By" value="Jane Smith / Intelligent IaC" />
                <KeyValue label="Closed At" value={closedAt ?? ""} />
                <KeyValue label="Outcome" value="Successful" />
                <KeyValue label="Digital Twin" value="Updated" />
                <KeyValue label="Evidence" value="Immutable" />
                <div className="flex flex-col gap-2 pt-1">
                  <Link to="/resources" className="inline-flex h-8 items-center justify-center rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#173f75]">
                    View Updated Digital Twin
                  </Link>
                  <button onClick={() => { setEvTab("Summary"); setEvidenceOpen(true); }} className="h-8 rounded-md border border-[#E2E8F0] bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50">
                    View Evidence Package
                  </button>
                  <Link to={`/approvals/${pkgId}`} className="inline-flex h-8 items-center justify-center rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">
                    View Change History
                  </Link>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setCloseAck(false); setCloseModal(true); }}
                disabled={!canClose}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-emerald-700 px-3 text-[12.5px] font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShieldCheck className="h-4 w-4" /> Verify &amp; Close Change
              </button>
            )}
            {verified && !outcomeVerified && (
              <p className="mt-2 rounded-md bg-rose-50 p-2 text-[11.5px] text-rose-800">
                Execution completed, but the intended outcome was not independently validated. Closure is blocked.
              </p>
            )}
          </Panel>
        </aside>
      </div>

      {/* Outcome row drawer */}
      <ReviewDrawer open={!!rowDrawer} onClose={() => setRowDrawer(null)} title={rowDrawer?.measure ?? ""} subtitle={`${rowDrawer?.id} · outcome evidence`}>
        {rowDrawer && (
          <div className="space-y-2">
            <KeyValue label="Before (Detected)" value={rowDrawer.before} />
            <KeyValue label="Intended Outcome" value={rowDrawer.intended} />
            <KeyValue label="Actual (Observed)" value={verified ? rowDrawer.actual : "Pending verification"} />
            <KeyValue label="Result" value={verified ? rowDrawer.result : "PENDING"} />
            <KeyValue label="Evidence Source" value={rowDrawer.source} />
            <p className="rounded-md bg-slate-50 p-2 text-[11.5px] text-slate-700">{rowDrawer.detail}</p>
          </div>
        )}
      </ReviewDrawer>

      {/* Test drawer */}
      <ReviewDrawer open={!!testDrawer} onClose={() => setTestDrawer(null)} title={testDrawer?.name ?? ""} subtitle={`${testDrawer?.id} · ${testDrawer?.domain}`}>
        {testDrawer && (
          <div className="space-y-2">
            <KeyValue label="Test ID" value={testDrawer.id} mono />
            <KeyValue label="Test Name" value={testDrawer.name} />
            <KeyValue label="Technology Domain" value={testDrawer.domain} />
            <KeyValue label="Execution Method" value={testDrawer.method} />
            <KeyValue label="Expected State" value={testDrawer.expected} />
            <KeyValue label="Observed State" value={verified ? testDrawer.observed : "Pending"} />
            <KeyValue label="Result" value={verified ? testDrawer.result : "PENDING"} />
            <KeyValue label="Evidence Source" value={testDrawer.source} />
            <KeyValue label="Timestamp" value={testDrawer.timestamp} />
            <KeyValue label="Duration" value={testDrawer.duration} />
            <KeyValue label="Confidence" value={`${testDrawer.confidence}%`} />
            <KeyValue label="Related Execution Event" value={testDrawer.event} mono />
            <KeyValue label="Related Asset" value={testDrawer.asset} />
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Raw Evidence</div>
              <Code>{testDrawer.raw}</Code>
            </div>
          </div>
        )}
      </ReviewDrawer>

      {/* Evidence package */}
      <ReviewDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} title={`Evidence Package · ${VAL_PACKAGE.evidenceId}`} subtitle={VAL_PACKAGE.evidencePackage}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {EVIDENCE_TABS.map((t) => (
            <button key={t} onClick={() => setEvTab(t)}
              className={cn("rounded-md px-2 py-1 text-[11px] font-medium",
                evTab === t ? "bg-[#1B4F91] text-white" : "border border-[#E2E8F0] text-slate-600 hover:bg-slate-50")}>
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          {(EVIDENCE_TAB_CONTENT[evTab] ?? []).map(([k, v]) => <KeyValue key={k} label={k} value={v} />)}
        </div>
      </ReviewDrawer>

      {/* Close modal */}
      <ReviewModal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="Verify & Close Production Change"
        footer={
          <>
            <button onClick={() => setCloseModal(false)} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={runClosure} disabled={!closeAck}
              className="h-8 rounded-md bg-emerald-700 px-3 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-40">
              Close Change
            </button>
          </>
        }
      >
        <div className="space-y-2">
          <KeyValue label="Change" value={pkgId} mono />
          <KeyValue label="Evidence" value={VAL_PACKAGE.evidenceId} mono />
          <KeyValue label="Target" value={VAL_PACKAGE.target} />
          <KeyValue label="Outcome" value="Remediation Verified" />
          <KeyValue label="Validation" value={`${passedCount} / ${tests.length} Passed`} />
          <KeyValue label="Confidence" value={`${confidence}%`} />
          <KeyValue label="Business Service" value="Healthy" />
          <KeyValue label="Material Downtime" value="None Detected" />
          <label className="mt-2 flex items-start gap-2 rounded-md bg-slate-50 p-2 text-[11.5px] text-slate-700">
            <input type="checkbox" checked={closeAck} onChange={(e) => setCloseAck(e.target.checked)} className="mt-0.5" />
            I confirm the evidence supports successful completion of this production change.
          </label>
        </div>
      </ReviewModal>
    </div>
  );
}
