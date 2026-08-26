import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ChevronDown, ChevronRight, CheckCircle2, RefreshCw, MoreVertical,
  ShieldCheck, Ban, Info, ArrowRight, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DependencyMap } from "./remediation/DependencyMap";
import { TechnicalEvidenceDrawer } from "./remediation/TechnicalEvidenceDrawer";
import {
  ASSET, AGENTS, AUTOMATION_AUTHORITY, CONDITIONS_EVALUATED, EVIDENCE_SOURCES,
  PLAN_PHASES, REFRESH_STEPS, REMEDIATION_OPTIONS, SCENARIOS, SCENARIO_DATA,
  WHY_THIS_APPROACH, type ScenarioKey,
} from "./remediation/data";

/* ---------------- primitives ---------------- */

function Panel({
  title, right, children, className,
}: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col rounded-md border border-[#E2E8F0] bg-white", className)}>
      <header className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</h2>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </header>
      <div className="flex-1 p-3">{children}</div>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "critical" | "warn" | "ok" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px] text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span
        className={cn(
          "text-right font-medium text-slate-800",
          tone === "critical" && "text-red-600",
          tone === "warn" && "text-amber-600",
          tone === "ok" && "text-emerald-600",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Collapse({ title, subtitle, children, defaultOpen = false }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-md border border-[#E2E8F0] bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">{title}</span>
        {subtitle && <span className="ml-auto text-[11px] text-slate-500">{subtitle}</span>}
      </button>
      {open && <div className="border-t border-[#E2E8F0] p-3">{children}</div>}
    </section>
  );
}

const RISK_TONE: Record<string, string> = {
  Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
  High: "text-red-700 bg-red-50 border-red-200",
};

const REC_TONE: Record<string, string> = {
  primary: "text-[#1B4F91] bg-[#EFF4FB] border-[#CFE0F3]",
  required: "text-slate-700 bg-slate-100 border-slate-200",
  recommended: "text-emerald-700 bg-emerald-50 border-emerald-200",
  warning: "text-amber-700 bg-amber-50 border-amber-200",
  prohibited: "text-red-700 bg-red-50 border-red-200",
};

/* ---------------- page ---------------- */

export default function RemediationIntelligence() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<ScenarioKey>("backup-failure");
  const [lastUpdated, setLastUpdated] = useState("2 min ago");
  const [refreshLog, setRefreshLog] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [intentPrepared, setIntentPrepared] = useState(false);

  const d = useMemo(() => SCENARIO_DATA[scenario], [scenario]);

  useEffect(() => {
    setIntentPrepared(false);
  }, [scenario]);

  useEffect(() => {
    if (!refreshing) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setRefreshLog(REFRESH_STEPS.slice(0, i));
      if (i >= REFRESH_STEPS.length) {
        clearInterval(t);
        setRefreshing(false);
        setLastUpdated("Just now");
        setTimeout(() => setRefreshLog([]), 1200);
      }
    }, 420);
    return () => clearInterval(t);
  }, [refreshing]);

  const bannerTone =
    d.banner.tone === "critical"
      ? "border-red-300 bg-red-50"
      : d.banner.tone === "high"
        ? "border-amber-300 bg-amber-50/70"
        : "border-emerald-200 bg-emerald-50/60";

  return (
    <div className="min-w-0 p-4">
      {/* Breadcrumb + utilities */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <span>Assets</span>
          <span>/</span>
          <span>SQL Servers</span>
          <span>/</span>
          <span>SQL-PROD-07</span>
          <span>/</span>
          <span className="font-medium text-slate-800">Remediation Intelligence</span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
            Demo Scenario
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as ScenarioKey)}
              className="h-7 rounded-md border border-[#E2E8F0] bg-white px-2 text-[11.5px] text-slate-700 outline-none"
            >
              {SCENARIOS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
          <span className="text-[11.5px] text-slate-500">Last Updated: {lastUpdated}</span>
          <button
            type="button"
            onClick={() => { setRefreshLog([]); setRefreshing(true); }}
            disabled={refreshing}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh Analysis
          </button>
          <button type="button" aria-label="More actions" className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {refreshLog.length > 0 && (
        <div className="mb-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11.5px] text-slate-600">
          {refreshLog.map((s) => <div key={s}>{s}</div>)}
        </div>
      )}

      {/* Risk banner */}
      <section className={cn("mb-3 flex flex-wrap items-center gap-4 rounded-md border px-4 py-3", bannerTone)}>
        <AlertTriangle className={cn("h-7 w-7 shrink-0", d.banner.tone === "stable" ? "text-emerald-600" : "text-red-600")} aria-hidden />
        <div className="min-w-[260px] flex-1">
          <div className={cn("text-[11px] font-semibold uppercase tracking-wider", d.banner.tone === "stable" ? "text-emerald-700" : "text-red-700")}>
            {d.banner.status}
          </div>
          <h1 className="text-[16px] font-semibold text-slate-900">{d.banner.headline}</h1>
          <p className="text-[12px] text-slate-600">{d.banner.secondary}</p>
        </div>
        <dl className="flex flex-wrap items-start gap-x-6 gap-y-2">
          {[
            { k: "Risk Score", v: `${d.banner.riskScore} / 100`, s: d.banner.classification },
            { k: "Time to Exhaustion", v: d.banner.timeToExhaustion, s: d.banner.tone === "stable" ? "Stable" : "Critical" },
            { k: "Log Utilization", v: d.banner.logUtilization, s: d.banner.tone === "stable" ? "Normal" : "Critical" },
            { k: "DB State", v: d.banner.dbState, s: "" },
            { k: "Availability", v: d.banner.availability, s: `Service impact: ${d.banner.serviceImpact}` },
          ].map((m) => (
            <div key={m.k} className="min-w-[100px]">
              <dt className="text-[10.5px] uppercase tracking-wide text-slate-500">{m.k}</dt>
              <dd className="text-[15px] font-semibold text-slate-900">{m.v}</dd>
              {m.s && <div className="text-[10.5px] text-slate-500">{m.s}</div>}
            </div>
          ))}
        </dl>
      </section>

      {/* Primary workspace */}
      <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_minmax(0,1.25fr)]">
        {/* LEFT */}
        <Panel title="SQL Transaction Log Condition">
          <div className="mb-2 flex items-center gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2">
            <Cpu className="h-4 w-4 text-[#1B4F91]" />
            <div>
              <div className="text-[12px] font-semibold text-slate-800">{ASSET.server}</div>
              <div className="text-[11px] text-slate-500">{ASSET.database}</div>
            </div>
            <span className="ml-auto rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-medium text-emerald-700">
              ONLINE
            </span>
          </div>

          <Row label="Recovery Model" value={ASSET.recoveryModel} />
          <Row label="Log Reuse Wait" value={<span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-red-700">{d.sql.logReuseWait}</span>} />
          <Row label="Last Successful Log Backup" value={d.sql.lastLogBackup} tone="critical" />
          <Row label="Log File" value={<span className="font-mono text-[10.5px]">{ASSET.logFile}</span>} />
          <Row label="Current Log Size" value={d.sql.currentLogSize} />
          <Row label="Filesystem Capacity" value={ASSET.filesystemCapacity} />
          <Row label="Free" value={d.sql.freeGb} tone="warn" />
          <Row label="Growth Rate" value={d.sql.growthRate} />
          <Row label="Forecasted Exhaustion" value={d.sql.forecastExhaustion} tone="critical" />
          <Row label="Autogrowth" value="Enabled (10%, 500 GB max)" />
          <Row label="VLF Count" value={<>{d.sql.vlfCount} <span className="ml-1 rounded border border-amber-200 bg-amber-50 px-1 text-[10px] text-amber-700">{d.sql.vlfHealth}</span></>} />
          <Row label="Write Rate" value={d.sql.writeRate} />
          <Row label="Checkpoint Age" value={d.sql.checkpointAge} />
          <Row label="Active Transactions" value={d.sql.activeTransactions} />
          <Row label="Longest Running Transaction" value={d.sql.longestTransaction} />

          <div className="mt-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
            <div className="flex items-baseline justify-between text-[11.5px]">
              <span className="text-slate-500">Filesystem utilization</span>
              <span className="text-[15px] font-semibold text-slate-900">{d.sql.usedPct}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn("h-full rounded-full", d.sql.usedPct >= 90 ? "bg-red-500" : d.sql.usedPct >= 75 ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${d.sql.usedPct}%` }}
              />
            </div>
            <div className="mt-1 text-[10.5px] text-slate-500">{d.sql.currentLogSize} / 488 GB usable</div>
          </div>

          <button
            type="button"
            onClick={() => setEvidenceOpen(true)}
            className="mt-3 w-full rounded-md border border-[#E2E8F0] bg-white py-1.5 text-[11.5px] font-medium text-[#1B4F91] hover:bg-slate-50"
          >
            View Technical Evidence
          </button>
        </Panel>

        {/* CENTER */}
        <div className="flex flex-col gap-3">
          <Panel
            title="Root Cause Analysis"
            right={<span className="rounded border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10.5px] font-medium text-teal-700">AI Analysis Complete</span>}
          >
            <div className="rounded-md border border-[#E2E8F0] p-2.5">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> Primary Cause
              </div>
              <p className="mt-1 text-[12px] font-medium text-slate-800">{d.rootCause.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">{d.rootCause.detail}</p>
              <ul className="mt-1.5 space-y-0.5 text-[11.5px] text-slate-600">
                {d.rootCause.observed.map((o) => <li key={o} className="font-mono text-[11px]">{o}</li>)}
              </ul>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Analysis Confidence</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${d.rootCause.confidence}%` }} />
                </div>
                <span className="text-[11px] font-medium text-slate-700">{d.rootCause.confidence}%</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[12px] font-semibold text-slate-800">Contributing Conditions</div>
              <dl className="mt-1">
                {d.contributing.map((c) => <Row key={c.label} label={c.label} value={c.value} />)}
              </dl>
            </div>

            <div className="mt-3">
              <div className="text-[12px] font-semibold text-slate-800">Conditions Evaluated</div>
              <ul className="mt-1 divide-y divide-[#E2E8F0] rounded-md border border-[#E2E8F0]">
                {CONDITIONS_EVALUATED.map((c) => (
                  <li key={c.code} className="flex items-center justify-between gap-2 px-2.5 py-1 text-[11px]">
                    <span className="font-mono text-slate-700">{c.code}</span>
                    <span className={cn(
                      c.state === "detected" ? "font-medium text-red-600" : c.state === "secondary" ? "text-amber-600" : "text-slate-500",
                    )}>
                      {c.result}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
              <div className="text-[12px] font-semibold text-slate-800">What This Means</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">
                The immediate risk is not simply that the SQL log file is large. The database currently cannot reuse
                inactive transaction log space because the transaction-log backup process has not completed
                successfully. If the condition continues, the log will continue growing until the filesystem reaches
                capacity.
              </p>
              <ul className="mt-1.5 grid gap-0.5 text-[11.5px] text-slate-600 sm:grid-cols-2">
                {["Database writes fail", "Transactions fail", "Application errors increase", "Database availability can be affected", "Order processing may be disrupted"].map((x) => (
                  <li key={x} className="flex items-start gap-1.5"><Info className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />{x}</li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title="Risk & Impact Assessment">
            <div className="grid gap-3 sm:grid-cols-2">
              <dl>
                <Row label="Business Criticality" value={ASSET.criticality} />
                <Row label="Database Role" value={ASSET.role} />
                <Row label="Application" value={ASSET.application} />
                <Row label="Transactions / Minute" value="3,450" />
                <Row label="Services / Users Exposed" value="~1,250" />
                <Row label="Potential Impact Window" value="< 60 minutes" />
                <Row label="Current Customer Impact" value="None" tone="ok" />
                <Row label="Database Availability" value="Healthy" tone="ok" />
                <Row label="Data Loss Risk" value="Low" tone="ok" />
                <Row label="Service Disruption Risk if Unresolved" value="High" tone="critical" />
              </dl>
              <div className="rounded-md border border-[#E2E8F0] p-2.5">
                <div className="text-[11.5px] font-medium text-slate-700">Risk Matrix</div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {["#DCFCE7", "#FEF9C3", "#FEE2E2", "#DCFCE7", "#FEF9C3", "#FEE2E2", "#FEF9C3", "#FEE2E2", "#EF4444"].map((c, i) => (
                    <div key={i} className="h-7 rounded" style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>Low</span><span>Medium</span><span>High</span></div>
                <dl className="mt-2">
                  <Row label="Likelihood" value="High" tone="critical" />
                  <Row label="Impact" value="High" tone="critical" />
                  <Row label="Overall" value={`High (${d.banner.riskScore}/100)`} tone="critical" />
                </dl>
              </div>
            </div>
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3">
          <Panel title="Infrastructure Dependency Map" right={<span className="text-[11px] text-slate-500">12 relationships resolved</span>}>
            <DependencyMap />
          </Panel>

          <Panel title="Recommended Remediation Plan">
            <div className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] p-2.5">
              <div className="text-[12px] font-semibold text-[#1B4F91]">AI Recommendation</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-700">{d.recommendationNote}</p>
            </div>

            <div className="mt-3 space-y-2">
              {PLAN_PHASES.map((p) => (
                <div key={p.title} className="rounded-md border border-[#E2E8F0] p-2.5">
                  <div className="text-[11.5px] font-semibold text-slate-800">{p.title}</div>
                  <ol className="mt-1 space-y-0.5 text-[11.5px] text-slate-600">
                    {p.steps.map((s, i) => (
                      <li key={s} className="flex gap-1.5">
                        <span className="text-slate-400">{i + 1}.</span>{s}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="text-[12px] font-semibold text-slate-800">Why This Approach</div>
              <ul className="mt-1 space-y-0.5">
                {WHY_THIS_APPROACH.map((w) => (
                  <li key={w} className="flex items-start gap-1.5 text-[11.5px] text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{w}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setIntentPrepared(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1B4F91] px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-[#173F75]"
            >
              Engineer Recommended Remediation <ArrowRight className="h-4 w-4" />
            </button>

            {intentPrepared && (
              <div className="mt-3 rounded-md border border-[#CFE0F3] bg-[#F8FAFC] p-2.5">
                <div className="text-[12px] font-semibold text-slate-800">Remediation intent prepared.</div>
                <dl className="mt-1">
                  <Row label="Target" value="SQL-PROD-07 / OrdersDB" />
                  <Row label="Strategy" value={d.decisionTrace.final} />
                  <Row label="Actions" value="5" />
                  <Row label="Infrastructure Mutation" value="EBS 500 GB → 750 GB" />
                  <Row label="Expected Downtime" value="None" tone="ok" />
                  <Row label="Approval" value="Required for infrastructure mutation" tone="warn" />
                  <Row label="Next Stage" value="Change Engineering Workspace" />
                </dl>
                <button
                  type="button"
                  onClick={() => navigate("/changes/sql-prod-07")}
                  className="mt-2 w-full rounded-md border border-[#1B4F91] bg-white py-1.5 text-[11.5px] font-semibold text-[#1B4F91] hover:bg-[#EFF4FB]"
                >
                  Continue to Change Engineering
                </button>
                <p className="mt-1.5 text-[10.5px] text-slate-500">No change is executed from this screen.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Remediation options */}
      <Panel className="mt-3" title="Remediation Options Evaluated" right={<span className="text-[11px] text-slate-500">7 strategies evaluated · 2 rejected</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[11.5px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-wide text-slate-500">
                <th className="py-1.5 pr-2 font-medium">Priority</th>
                <th className="py-1.5 pr-2 font-medium">Action</th>
                <th className="py-1.5 pr-2 font-medium">Purpose</th>
                <th className="py-1.5 pr-2 font-medium">Expected Service Impact</th>
                <th className="py-1.5 pr-2 font-medium">Automation</th>
                <th className="py-1.5 pr-2 font-medium">Risk</th>
                <th className="py-1.5 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {REMEDIATION_OPTIONS.map((o) => (
                <tr key={o.priority} className="align-top hover:bg-slate-50" title={o.note}>
                  <td className="py-2 pr-2 text-slate-500">{o.priority}</td>
                  <td className="py-2 pr-2 font-medium text-slate-800">
                    <span className="inline-flex items-center gap-1.5">
                      {o.tone === "prohibited" && <Ban className="h-3.5 w-3.5 text-red-600" />}
                      {o.action}
                    </span>
                  </td>
                  <td className="max-w-[300px] py-2 pr-2 text-slate-600">{o.purpose}</td>
                  <td className="py-2 pr-2 text-slate-600">{o.impact}</td>
                  <td className="py-2 pr-2 text-slate-600">{o.automation}</td>
                  <td className="py-2 pr-2">
                    <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium", RISK_TONE[o.risk])}>{o.risk}</span>
                  </td>
                  <td className="py-2">
                    <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-medium", REC_TONE[o.tone])}>{o.recommendation}</span>
                    {o.note && <div className="mt-0.5 max-w-[240px] text-[10.5px] text-slate-500">{o.note}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10.5px] text-slate-500">
          EBS modification is performed online. No instance restart required. All actions execute only after approval and during a permitted change window.
        </p>
      </Panel>

      {/* Lower expandables */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Collapse title="Agentic Analysis" subtitle="6 specialized infrastructure agents">
          <div className="grid gap-2 sm:grid-cols-2">
            {AGENTS.map((a) => (
              <div key={a.name} className="rounded-md border border-[#E2E8F0] p-2.5">
                <div className="text-[11.5px] font-semibold text-slate-800">{a.name}</div>
                <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                  {a.inputs.map((i) => <li key={i}>· {i}</li>)}
                </ul>
                <div className="mt-1.5 rounded border border-[#CFE0F3] bg-[#EFF4FB] px-2 py-1 text-[11px] text-[#1B4F91]">
                  {a.result}
                </div>
                {a.meta && <div className="mt-1 text-[10.5px] text-slate-500">{a.meta}</div>}
              </div>
            ))}
          </div>
        </Collapse>

        <div className="flex flex-col gap-3">
          <Collapse title="Evidence & Data Sources" subtitle="11 sources connected">
            <ul className="grid gap-1 sm:grid-cols-2">
              {EVIDENCE_SOURCES.map((s) => (
                <li key={s} className="flex items-center gap-2 rounded border border-[#E2E8F0] px-2 py-1 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">{s}</span>
                  <span className="ml-auto text-[10px] text-slate-500">&lt; 5 min · High</span>
                </li>
              ))}
            </ul>
          </Collapse>

          <Collapse title="Decision Trace" subtitle={`Confidence ${d.decisionTrace.confidence}%`} defaultOpen>
            <div className="space-y-2 text-[11.5px]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Observed</div>
                <ul className="mt-0.5 space-y-0.5 text-slate-700">{d.decisionTrace.observed.map((o) => <li key={o}>· {o}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Inference</div>
                <ul className="mt-0.5 space-y-0.5 text-slate-700">{d.decisionTrace.inferences.map((o) => <li key={o}>· {o}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Decision</div>
                <ul className="mt-0.5 space-y-0.5 text-slate-700">{d.decisionTrace.decisions.map((o) => <li key={o}>· {o}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rejected</div>
                <ul className="mt-0.5 space-y-0.5 text-slate-700">
                  {d.decisionTrace.rejected.map((r) => (
                    <li key={r.label}><span className="font-medium">{r.label}</span> — <span className="text-slate-600">{r.reason}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1.5">
                <span className="font-semibold text-[#1B4F91]">Final Recommendation: </span>
                <span className="text-slate-700">{d.decisionTrace.final} · Confidence {d.decisionTrace.confidence}%</span>
              </div>
            </div>
          </Collapse>

          <Panel title="Automation Authority">
            <ul className="divide-y divide-[#E2E8F0] rounded-md border border-[#E2E8F0]">
              {AUTOMATION_AUTHORITY.map((a) => (
                <li key={a.capability} className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11.5px]">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />{a.capability}
                  </span>
                  <span className={cn(
                    "rounded border px-1.5 py-0.5 text-[10.5px] font-medium",
                    a.tone === "auto" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    a.tone === "policy" && "border-[#CFE0F3] bg-[#EFF4FB] text-[#1B4F91]",
                    a.tone === "human" && "border-amber-200 bg-amber-50 text-amber-700",
                    a.tone === "prohibited" && "border-red-200 bg-red-50 text-red-700",
                  )}>
                    {a.authority}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <TechnicalEvidenceDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
    </div>
  );
}
