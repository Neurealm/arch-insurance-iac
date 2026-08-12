// Engineering panels layered onto the existing FinOps administration overview:
// recommendation registry with the signature Explain actions, cost anomalies,
// policy conflicts and error states, savings attribution, governance controls,
// policy simulation and the global search palette.
//
// The visual language, panel chrome and drawer interaction are unchanged; this
// file only adds functional depth beneath the existing layout.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Search, AlertTriangle, FlaskConical, ShieldCheck, X } from "lucide-react";
import { Panel, RichTip, KV, SubHead, Bullets, StatePill, Btn, EmptyState, SkeletonPanel } from "./parts";
import {
  RECOMMENDATIONS, SAVINGS_RECORDS, ANOMALIES, CONFLICTS, SYSTEM_ERRORS, SCENARIOS,
  DEDUPLICATION, BASELINE, APPROVAL_POLICY, AUTONOMY_DISPOSITIONS, POLICY_VERSIONS,
  AUDIT, ROLES, can, CAP_REASON, compositeRisk, riskClass,
  type RoleId, type Recommendation,
} from "./engineering";
import { OPPORTUNITIES, POLICIES, ACCOUNTS, CHANNELS, UNIT_ECONOMICS } from "./data";

/* ------------------------------ conflict bar ------------------------------ */

export function ConflictBanner({ openDrawer }: { openDrawer: (id: string) => void }) {
  const blocking = CONFLICTS.filter((c) => c.severity === "bad");
  const active = SYSTEM_ERRORS.filter((e) => e.state === "Active").length;
  return (
    <div className="space-y-2">
      {CONFLICTS.map((c) => (
        <div key={c.id}
          className={cn("flex flex-wrap items-start gap-x-3 gap-y-1.5 rounded-lg border px-3 py-2",
            c.severity === "bad" ? "border-red-200 bg-red-50/70" : "border-amber-200 bg-amber-50/70")}>
          <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", c.severity === "bad" ? "text-red-600" : "text-amber-600")} />
          <div className="min-w-[280px] flex-1">
            <div className={cn("text-[12.5px] font-semibold", c.severity === "bad" ? "text-red-900" : "text-amber-900")}>{c.object}</div>
            <div className="text-[11.5px] text-slate-700"><span className="font-medium">Conflict: </span>{c.conflict}</div>
            <div className="text-[11.5px] text-slate-700"><span className="font-medium">Impact: </span>{c.impact}</div>
          </div>
          <Btn onClick={() => openDrawer(`conflict:${c.id}`)}>{c.cta}</Btn>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11.5px] text-slate-600">
        <span>{blocking.length} blocking conflict · {active} active platform degradation states affecting detection, execution or validation.</span>
        <div className="flex-1" />
        <button onClick={() => openDrawer("errors:all")} className="font-medium text-blue-700 hover:underline">Inspect platform states</button>
      </div>
    </div>
  );
}

/* -------------------------- recommendation registry ------------------------ */

export function RecommendationPanel({
  role, drawer, openDrawer, loading,
}: { role: RoleId; drawer: string; openDrawer: (id: string) => void; loading?: boolean }) {
  const [only, setOnly] = useState<"all" | "open" | "rejected" | "realized">("all");
  const rows = useMemo(() => RECOMMENDATIONS.filter((r) =>
    only === "all" ? true
      : only === "rejected" ? r.state === "Rejected"
      : only === "realized" ? ["Executed", "Realized"].includes(r.state)
      : !["Rejected", "Realized"].includes(r.state)), [only]);

  return (
    <Panel
      title="Recommendation Engineering Registry"
      subtitle="Individual engineered recommendations with their evidence, confidence decomposition, execution risk, autonomy disposition and savings provenance."
      actions={
        <>
          {(["all", "open", "rejected", "realized"] as const).map((k) => (
            <Btn key={k} onClick={() => setOnly(k)} className={cn(only === k && "border-blue-400 bg-blue-50 text-blue-800")}>
              {k === "all" ? "All" : k === "open" ? "Open" : k === "rejected" ? "Not optimized" : "Executed"}
            </Btn>
          ))}
        </>
      }
      bodyClassName="p-0"
    >
      {loading ? <div className="p-4"><SkeletonPanel rows={5} /></div>
        : rows.length === 0 ? <div className="p-4"><EmptyState title="No recommendations in this view" body="No engineered recommendation matches the selected lifecycle filter." cta="Show all" onCta={() => setOnly("all")} /></div>
        : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">Recommendation</th>
                <th className="px-3 py-2 font-medium">Resource / Application</th>
                <th className="px-3 py-2 font-medium">Change</th>
                <th className="px-3 py-2 text-right font-medium">Savings</th>
                <th className="px-3 py-2 text-right font-medium">Confidence</th>
                <th className="px-3 py-2 font-medium">Risk</th>
                <th className="px-3 py-2 font-medium">Autonomy</th>
                <th className="px-3 py-2 font-medium">Lifecycle</th>
                <th className="px-3 py-2 text-right font-medium">Explain</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => <RecRow key={r.id} r={r} role={role} drawer={drawer} openDrawer={openDrawer} />)}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-t border-slate-200 px-3 py-2 text-[11.5px] text-slate-600">
        Explain Recommendation shows the full sequence: evidence, analysis, candidate actions, risk, policy, selection. Explain Rejection
        shows why the platform chose not to optimize.
      </div>
    </Panel>
  );
}

function RecRow({ r, role, drawer, openDrawer }: { r: Recommendation; role: RoleId; drawer: string; openDrawer: (id: string) => void }) {
  const risk = compositeRisk(r.riskDimensions);
  const rejected = r.state === "Rejected";
  const approveAllowed = can(role, "approve");
  return (
    <tr onClick={() => openDrawer(`rec:${r.id}`)}
      className={cn("h-12 cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40", drawer === `rec:${r.id}` && "bg-blue-50/60")}>
      <td className="px-3">
        <div className="font-medium text-slate-900">{r.id}</div>
        <div className="text-[10.5px] text-slate-500">{r.condition}</div>
      </td>
      <td className="px-3">
        <div className="font-mono text-[11px] text-slate-700">{r.resource}</div>
        <div className="text-[10.5px] text-slate-500">{r.application} · {r.environment}</div>
      </td>
      <td className="px-3 text-slate-700">{r.current} → {r.recommended}</td>
      <td className="px-3 text-right">
        <RichTip tip={{
          term: "Potential savings", definition: "Policy-eligible monthly savings before risk adjustment and validation.",
          rows: [["Current value", `$${r.savingsMonthly.toLocaleString()}/mo`], ["Target", "≥ $250/mo minimum savings policy"],
            ["How calculated", "Effective rate delta between current and recommended configuration"], ["Realized to date", r.savingsRecordId ? SAVINGS_RECORDS.find((s) => s.id === r.savingsRecordId)?.realized ?? "—" : "Not realized"]],
          why: "Projected savings must never be reported as realized savings; realization requires execution and two validation gates.",
        }}>
          <span className="font-semibold tabular-nums text-slate-900">${r.savingsMonthly.toLocaleString()}/mo</span>
        </RichTip>
      </td>
      <td className="px-3 text-right">
        <RichTip tip={{
          term: "Opportunity confidence",
          definition: "Confidence that the identified optimization and projected outcome are sufficiently supported by current technical and financial evidence.",
          rows: r.confidenceComponents.slice(0, 6).map((c) => [c.label, String(c.score)] as [string, string]),
          why: "Confidence below the tenant threshold routes the candidate to investigation instead of approval.",
        }}>
          <span className={cn("font-medium tabular-nums", r.confidence >= 88 ? "text-emerald-700" : r.confidence >= 75 ? "text-amber-700" : "text-rose-700")}>{r.confidence}</span>
        </RichTip>
      </td>
      <td className="px-3">
        <RichTip tip={{
          term: "Execution risk", definition: "Weighted composite of eight execution risk dimensions, scored independently of confidence.",
          rows: r.riskDimensions.slice(0, 6).map((d) => [d.label, String(d.score)] as [string, string]),
          why: "Risk determines approval routing and whether autonomous execution is permitted at all.",
        }}>
          <StatePill tone={risk < 30 ? "ok" : risk < 55 ? "warn" : "bad"} label={`${risk} · ${riskClass(risk)}`} />
        </RichTip>
      </td>
      <td className="px-3">
        <RichTip tip={{
          term: "Autonomy disposition", definition: AUTONOMY_DISPOSITIONS.find((a) => a.label === r.autonomy)?.detail ?? "",
          rows: [["Current", r.autonomy], ["Approval required", r.approvalRequired ? "Yes" : "No"], ["Reason", r.approvalReason]],
          why: "Every recommendation carries exactly one disposition so the execution boundary is never ambiguous.",
        }}>
          <span className="text-[11.5px] text-slate-700">{r.autonomy}</span>
        </RichTip>
      </td>
      <td className="px-3">
        <StatePill tone={rejected ? "bad" : r.state === "Realized" || r.state === "Executed" ? "ok" : "warn"} label={r.state} />
      </td>
      <td className="px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap justify-end gap-1.5">
          <button onClick={() => openDrawer(`rec:${r.id}`)} className="text-[11.5px] font-medium text-blue-700 hover:underline">
            {rejected ? "Explain Rejection" : "Explain Recommendation"}
          </button>
          {r.savingsRecordId && (
            <button onClick={() => openDrawer(`svg:${r.savingsRecordId}`)} className="text-[11.5px] font-medium text-blue-700 hover:underline">Explain Savings</button>
          )}
          {rejected ? (
            <button onClick={() => toast.info("Re-evaluation queued", { description: `${r.id} will be re-scored once the evidence gap clears.` })}
              className="text-[11.5px] font-medium text-slate-700 hover:underline">Re-evaluate</button>
          ) : (
            <button
              disabled={!approveAllowed}
              title={approveAllowed ? undefined : CAP_REASON.approve}
              onClick={() => toast.success("Decision recorded", { description: `Approval captured for ${r.id} with actor, timestamp, evidence reviewed and policy version.` })}
              className={cn("text-[11.5px] font-medium", approveAllowed ? "text-slate-700 hover:underline" : "cursor-not-allowed text-slate-400")}>
              Approve
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* -------------------------------- anomalies -------------------------------- */

export function AnomalyPanel({ drawer, openDrawer }: { drawer: string; openDrawer: (id: string) => void }) {
  return (
    <Panel title="Cost Anomaly Detection"
      subtitle="A deviation from expectation is an anomaly, not automatically waste. Each requires drivers, evidence and owner confirmation before classification."
      bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Anomaly</th>
              <th className="px-3 py-2 font-medium">Scope</th>
              <th className="px-3 py-2 text-right font-medium">Observed</th>
              <th className="px-3 py-2 text-right font-medium">Expected</th>
              <th className="px-3 py-2 text-right font-medium">Variance</th>
              <th className="px-3 py-2 text-right font-medium">Confidence</th>
              <th className="px-3 py-2 font-medium">Classification</th>
            </tr>
          </thead>
          <tbody>
            {ANOMALIES.map((a) => (
              <RichTip key={a.id} as="tr"
                className={cn("cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40", drawer === `anom:${a.id}` && "bg-blue-50/60")}
                tip={{
                  term: `${a.type} — ${a.id}`, definition: "Deviation between observed spend or unit cost and the modelled expectation for this scope.",
                  rows: [["Observed", a.observed], ["Expected", a.expected], ["Variance", a.variance], ["Top driver", a.drivers[0]], ["Confidence", `${a.confidence}/100`]],
                  why: "Classifying every anomaly as waste destroys trust; deliberate architecture change looks identical in billing data.",
                }}>
                <td className="px-3 py-1.5 font-medium text-slate-900" onClick={() => openDrawer(`anom:${a.id}`)}>{a.type}<div className="font-mono text-[10.5px] text-slate-400">{a.id}</div></td>
                <td className="px-3 text-slate-700" onClick={() => openDrawer(`anom:${a.id}`)}>{a.scope}</td>
                <td className="px-3 text-right tabular-nums text-slate-800" onClick={() => openDrawer(`anom:${a.id}`)}>{a.observed}</td>
                <td className="px-3 text-right tabular-nums text-slate-600" onClick={() => openDrawer(`anom:${a.id}`)}>{a.expected}</td>
                <td className="px-3 text-right font-medium tabular-nums text-rose-700" onClick={() => openDrawer(`anom:${a.id}`)}>{a.variance}</td>
                <td className="px-3 text-right tabular-nums text-slate-800" onClick={() => openDrawer(`anom:${a.id}`)}>{a.confidence}</td>
                <td className="px-3" onClick={() => openDrawer(`anom:${a.id}`)}>
                  <StatePill tone={a.classification.startsWith("Actionable") ? "warn" : a.classification.startsWith("Likely") ? "warn" : "muted"} label={a.classification} />
                </td>
              </RichTip>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* --------------------- attribution + governance controls ------------------- */

export function GovernancePanels({ role, openDrawer }: { role: RoleId; openDrawer: (id: string) => void }) {
  const editBaseline = can(role, "edit_baseline");
  return (
    <div className="grid gap-4 2xl:grid-cols-[1fr_1fr]">
      <Panel title="Savings Attribution & Deduplication"
        subtitle="Overlapping recommendations are reconciled before any figure reaches Finance."
        actions={<Btn onClick={() => openDrawer("dedup:all")}>Explain Attribution</Btn>}
        bodyClassName="p-3">
        <div className="rounded-md border border-amber-200 bg-amber-50/70 px-2.5 py-2">
          <div className="text-[12px] font-semibold text-amber-900">Overlapping savings detected — {DEDUPLICATION.scope}</div>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-700">{DEDUPLICATION.rule}</p>
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
          {[["Naive sum", DEDUPLICATION.naive, "text-slate-400 line-through"], ["Overlap removed", DEDUPLICATION.overlap, "text-amber-700"], ["Adjusted total", DEDUPLICATION.adjusted, "text-emerald-700"]].map(([l, v, c]) => (
            <div key={l} className="rounded-md border border-slate-200 px-2.5 py-1.5">
              <div className="text-[11px] text-slate-500">{l}</div>
              <div className={cn("mt-0.5 text-[16px] font-semibold tabular-nums", c)}>{v}</div>
            </div>
          ))}
        </div>
        <SubHead>Affected recommendations</SubHead>
        <KV rows={DEDUPLICATION.overlapping.map((o) => [`${o.rec} · ${o.type}`, `${o.claimed} claimed → ${o.incremental} incremental (${o.attribution})`] as [string, string])} />
      </Panel>

      <Panel title="Governance Controls"
        subtitle="Baseline rules, approval routing, autonomy dispositions, policy versioning, access model and the audit trail."
        bodyClassName="p-3">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {[
            { k: "baseline:v6", t: "Savings Baseline", v: BASELINE.summary, s: "v6 active" },
            { k: "approvalpolicy:v7", t: "Approval Policy", v: `${APPROVAL_POLICY.approvers.join(" + ")} · ${APPROVAL_POLICY.queue.filter((q) => q.state === "Pending").length} decisions pending`, s: APPROVAL_POLICY.version },
            { k: "autonomy:all", t: "Autonomy Policy", v: "Six dispositions from Observe Only to Prohibited; visible on every recommendation.", s: "6 dispositions" },
            { k: "idem:all", t: "Idempotency & Replay", v: "Key, execution lock, 60-minute duplicate window, replay blocked by default.", s: "Enforced" },
            { k: "versions:rightsizing", t: "Policy Versioning", v: `${POLICY_VERSIONS.filter((v) => v.state === "Draft").length} draft · v11 active · compare, clone, promote, rollback, deprecate.`, s: "v11 / v12" },
            { k: "roles:all", t: "Role-Based Access", v: `${ROLES.length} roles; unavailable actions stay visible and explain why.`, s: ROLES.find((r) => r.id === role)?.label ?? "" },
            { k: "audit:all", t: "Audit Trail", v: `${AUDIT.length} recent events with actor, object, policy version, old and new value, reason and ticket.`, s: "Complete" },
            { k: "errors:all", t: "Error & Degradation States", v: `${SYSTEM_ERRORS.filter((e) => e.state === "Active").length} active states currently constraining detection or execution.`, s: "Monitored" },
          ].map((c) => (
            <button key={c.k} onClick={() => openDrawer(c.k)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left transition-all hover:-translate-y-px hover:border-slate-300 hover:shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-900">{c.t}</span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] text-slate-600">{c.s}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{c.v}</p>
              <span className="mt-1 block text-[11px] font-medium text-blue-700">Inspect →</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Btn disabled={!editBaseline} title={editBaseline ? undefined : CAP_REASON.edit_baseline}
            onClick={() => toast.success("Baseline opened for edit", { description: "Changes are versioned and recorded in the audit trail." })}>
            <ShieldCheck className="h-3.5 w-3.5" /> Edit baseline rules
          </Btn>
          {!editBaseline && <span className="text-[11px] text-slate-500">{CAP_REASON.edit_baseline}</span>}
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------- policy simulator ---------------------------- */

export function PolicySimulator({ role, open, onClose }: { role: RoleId; open: boolean; onClose: () => void }) {
  const [scenario, setScenario] = useState(SCENARIOS[0].id);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<typeof SCENARIOS[number] | null>(SCENARIOS[0]);
  const allowed = can(role, "simulate");

  useEffect(() => { if (open) { setResult(SCENARIOS.find((s) => s.id === scenario) ?? null); } }, [open, scenario]);
  if (!open) return null;

  const run = () => {
    if (!allowed) return;
    setRunning(true); setResult(null);
    window.setTimeout(() => {
      setResult(SCENARIOS.find((s) => s.id === scenario) ?? null);
      setRunning(false);
      toast.success("Simulation complete", { description: "No cloud modification was performed. Simulation evaluates policy only." });
    }, 550);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Test policy"
        className="relative flex max-h-[86vh] w-full max-w-[880px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Policy Simulation</div>
            <div className="text-[16px] font-semibold text-slate-900">Test Policy — Resource Rightsizing v11</div>
            <p className="mt-0.5 text-[11.5px] text-slate-500">Evaluates detection, evidence, scoring, governance and execution eligibility. No real execution is performed.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>

        <div className="grid flex-1 gap-0 overflow-hidden md:grid-cols-[260px_1fr]">
          <div className="overflow-y-auto border-r border-slate-200 p-2">
            {SCENARIOS.map((s) => (
              <button key={s.id} onClick={() => setScenario(s.id)}
                className={cn("mb-1 block w-full rounded-md border px-2.5 py-1.5 text-left text-[12px] transition-colors",
                  scenario === s.id ? "border-blue-400 bg-blue-50/60 font-medium text-blue-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto p-4">
            <div className="mb-3 flex items-center gap-2">
              <Btn variant="primary" onClick={run} disabled={!allowed || running} title={allowed ? undefined : CAP_REASON.simulate}>
                <FlaskConical className="h-3.5 w-3.5" /> {running ? "Simulating…" : "Run simulation"}
              </Btn>
              {!allowed && <span className="text-[11px] text-slate-500">{CAP_REASON.simulate}</span>}
            </div>
            {running ? <SkeletonPanel rows={6} /> : result ? (
              <div>
                <StatePill tone={result.outcome === "Blocked" ? "bad" : result.outcome === "Approval Required" ? "warn" : result.outcome === "Suppressed" ? "muted" : "ok"} label={`Outcome: ${result.outcome}`} />
                <SubHead>Simulation output</SubHead>
                <KV rows={[
                  ["Evidence loaded", result.evidence], ["Recommendation", result.recommendation],
                  ["Confidence", `${result.confidence} / 100`], ["Risk", `${result.risk} / 100 (${riskClass(result.risk)})`],
                  ["Policy evaluation", result.policy], ["Approval required", result.approval],
                  ["Execution eligibility", result.execution], ["Expected savings", result.savings],
                  ["Validation approach", result.validation],
                ]} />
                <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                  Simulation never contacts an execution channel. It replays the policy chain against synthetic conditions so an
                  administrator can see the governance outcome before publishing a policy version.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------ global search ------------------------------ */

interface Hit { group: string; label: string; sub: string; key: string }

export function GlobalSearch({ open, onOpen, onClose, openDrawer }: {
  open: boolean; onOpen: () => void; onClose: () => void; openDrawer: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !open) { e.preventDefault(); onOpen(); }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onOpen, onClose]);

  const hits = useMemo<Hit[]>(() => {
    const n = q.trim().toLowerCase();
    const all: Hit[] = [
      ...OPPORTUNITIES.map((o) => ({ group: "Opportunities", label: `${o.type} — ${o.scope}`, sub: `${o.id} · $${o.savings.toLocaleString()}/mo`, key: `opp:${o.id}` })),
      ...RECOMMENDATIONS.map((r) => ({ group: "Recommendations", label: `${r.id} — ${r.resource}`, sub: `${r.current} → ${r.recommended} · ${r.state}`, key: `rec:${r.id}` })),
      ...POLICIES.map((p) => ({ group: "Policies", label: p.family, sub: `${p.active} active · ${p.enforcement}`, key: `pol:${p.id}` })),
      ...ACCOUNTS.map((a) => ({ group: "Accounts", label: a.provider, sub: `${a.accounts} · ${a.spend}`, key: `acc:${a.id}` })),
      ...UNIT_ECONOMICS.map((u) => ({ group: "Applications", label: u.service, sub: `${u.spend} · ${u.costPerUnit} per ${u.unit}`, key: `unit:${u.id}` })),
      ...RECOMMENDATIONS.map((r) => ({ group: "Resources", label: r.resource, sub: `${r.application} · ${r.environment}`, key: `rec:${r.id}` })),
      ...SAVINGS_RECORDS.map((s) => ({ group: "Savings", label: s.id, sub: `${s.application} · realized ${s.realized}`, key: `svg:${s.id}` })),
      ...CHANNELS.map((c) => ({ group: "Execution", label: c.system, sub: `${c.mode} · ${c.health}`, key: `ch:${c.id}` })),
    ];
    if (!n) return all.slice(0, 12);
    return all.filter((h) => `${h.label} ${h.sub} ${h.group}`.toLowerCase().includes(n)).slice(0, 40);
  }, [q]);

  const groups = useMemo(() => {
    const m = new Map<string, Hit[]>();
    hits.forEach((h) => m.set(h.group, [...(m.get(h.group) ?? []), h]));
    return [...m.entries()];
  }, [hits]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-start justify-center p-4 pt-[10vh]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Global search"
        className="relative flex max-h-[70vh] w-full max-w-[680px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search opportunities, policies, cloud accounts, applications, resources, savings records…"
            className="h-8 flex-1 bg-transparent text-[13px] outline-none" aria-label="Global search" />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] text-slate-500">esc</kbd>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {groups.length === 0 ? (
            <EmptyState title="No matches" body="Nothing in the tenant FinOps plane matches this term. Try a resource name, recommendation ID or application." />
          ) : groups.map(([g, items]) => (
            <div key={g} className="mb-2">
              <div className="px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{g}</div>
              {items.map((h) => (
                <button key={`${g}-${h.key}-${h.label}`} onClick={() => { openDrawer(h.key); onClose(); }}
                  className="block w-full rounded px-1.5 py-1 text-left hover:bg-blue-50/60">
                  <div className="text-[12px] font-medium text-slate-900">{h.label}</div>
                  <div className="text-[11px] text-slate-500">{h.sub}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
