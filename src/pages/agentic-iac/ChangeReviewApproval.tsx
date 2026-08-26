/**
 * Screen 04 — Change Review & Approval.
 *
 * The formal human-governance boundary between Change Engineering and
 * Production Execution. Everything here is local, mock and non-executing.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Download,
  FileText, Loader2, PlayCircle, ShieldCheck, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KeyValue, Panel, Pill, RadialScore, ReviewDrawer, ReviewModal, type Tone,
} from "./review/parts";
import * as D from "./review/data";

type PackageState = "ready" | "approved" | "changes" | "rejected";

type DrawerState = { title: string; subtitle?: string; body: React.ReactNode } | null;

const AUTHORITY_TONE: Record<D.AuthorityLevel, Tone> = {
  Autonomous: "ok",
  "Policy Approved": "info",
  "Human Approval Required": "warn",
  Prohibited: "bad",
};

export default function ChangeReviewApproval() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const pkgId = packageId ?? D.PACKAGE_ID;

  const [state, setState] = useState<PackageState>("ready");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState(D.initialHistory);
  const [decision, setDecision] = useState<{ reason: string; comment: string } | null>(null);
  const [exporting, setExporting] = useState<"idle" | "working" | "done">("idle");

  const created = useMemo(
    () => new Date().toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
    [],
  );
  const [approvedAt, setApprovedAt] = useState<string | null>(null);

  const approved = state === "approved";
  const version = approved ? "1.0" : "0.9 Draft";

  function openDrawer(title: string, subtitle: string | undefined, body: React.ReactNode) {
    setDrawer({ title, subtitle, body });
  }

  function runApproval() {
    setApproveOpen(false);
    setProgress(0);
    D.approvalSteps.forEach((_, i) => {
      window.setTimeout(() => setProgress(i + 1), 550 * (i + 1));
    });
    window.setTimeout(() => {
      const ts = new Date().toLocaleString();
      setProgress(null);
      setApprovedAt(ts);
      setApprovals(Object.fromEntries(D.approvers.map((a) => [a.id, true])));
      setState("approved");
      setHistory((h) => [...h, { event: "Approved for Execution", actor: "Jane Smith (Demo User)", when: ts, comment: `Authorization ${D.EXEC_AUTH_TOKEN} issued. Package locked.`, version: "1.0" }]);
    }, 550 * (D.approvalSteps.length + 1));
  }

  function submitChanges(reason: string, comment: string) {
    setChangesOpen(false);
    setState("changes");
    setDecision({ reason, comment });
    setHistory((h) => [...h, { event: "Changes Requested", actor: "Jane Smith (Demo User)", when: new Date().toLocaleString(), comment: `${reason} — ${comment || "No detail provided."}`, version: "0.9" }]);
  }

  function submitReject(reason: string, comment: string) {
    setRejectOpen(false);
    setState("rejected");
    setDecision({ reason, comment });
    setHistory((h) => [...h, { event: "Rejected", actor: "Jane Smith (Demo User)", when: new Date().toLocaleString(), comment: `${reason} — ${comment || "No detail provided."}`, version: "0.9" }]);
  }

  const statusBadge =
    state === "approved" ? <Pill tone="ok">APPROVED FOR EXECUTION</Pill>
    : state === "changes" ? <Pill tone="warn">Changes Requested</Pill>
    : state === "rejected" ? <Pill tone="bad">Rejected</Pill>
    : <Pill tone="ok">Ready for Approval</Pill>;

  return (
    <div className="mx-auto max-w-[1680px] px-4 py-3">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-[11.5px] text-slate-500">
        <span>Assets</span><ChevronRight className="h-3 w-3" />
        <span>SQL Servers</span><ChevronRight className="h-3 w-3" />
        <span>SQL-PROD-07</span><ChevronRight className="h-3 w-3" />
        <Link className="text-[#1B4F91] hover:underline" to="/remediation/sql-prod-07">Remediation Intelligence</Link><ChevronRight className="h-3 w-3" />
        <Link className="text-[#1B4F91] hover:underline" to="/changes/sql-prod-07">Change Engineering</Link><ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">Change Review &amp; Approval</span>
      </nav>

      {/* Header */}
      <header className="mt-2 flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[21px] font-semibold tracking-tight text-slate-900">Change Review &amp; Approval</h1>
            {statusBadge}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-slate-800">
            <span className="font-medium">Change Package</span>
            <span className="font-mono text-[13px]">{pkgId}</span>
            <Pill tone={approved ? "ok" : "neutral"}>{approved ? "Immutable v1.0" : "Draft"}</Pill>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Requested by: Intelligent IaC System &nbsp;•&nbsp; Created: {created} &nbsp;•&nbsp; Last Updated: 2 min ago
            &nbsp;•&nbsp; Change Type: Production Infrastructure Remediation &nbsp;•&nbsp; Priority: High
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setExporting("working"); window.setTimeout(() => setExporting("done"), 1200); }}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            {exporting === "working" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {exporting === "done" ? "Review Report Generated" : "Export Review Report"}
          </button>
          <button
            onClick={() => openDrawer("Full Change Package", `${pkgId} — 12 engineered artifacts`, <FullPackageBody />)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" /> View Full Change Package
          </button>
          {approved ? (
            <button
              onClick={() => navigate(`/execution/${pkgId}`)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-[12px] font-semibold text-white hover:bg-emerald-700"
            >
              <ArrowRight className="h-3.5 w-3.5" /> Proceed to Execution Center
            </button>
          ) : (
            <button
              disabled={state === "rejected"}
              onClick={() => setApproveOpen(true)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold text-white",
                state === "rejected" ? "cursor-not-allowed bg-slate-300" : "bg-[#1B4F91] hover:bg-[#173F76]",
              )}
            >
              <PlayCircle className="h-3.5 w-3.5" /> Approve for Execution
            </button>
          )}
        </div>
      </header>

      {state === "changes" && decision && (
        <Banner tone="warn" title="Package returned to engineering">
          {decision.reason} — {decision.comment || "No detail provided."} Package contents are preserved.
          <Link className="ml-2 underline" to="/changes/sql-prod-07">Return to Change Engineering</Link>
        </Banner>
      )}
      {state === "rejected" && decision && (
        <Banner tone="bad" title="Change rejected">
          {decision.reason} — {decision.comment || "No detail provided."} Execution authorization: None.
        </Banner>
      )}
      {approved && (
        <Banner tone="ok" title="Approved for execution">
          Package {pkgId} v1.0 approved by Jane Smith (Demo User) at {approvedAt}. Authorization {D.EXEC_AUTH_TOKEN}. Package state: Immutable.
        </Banner>
      )}

      {/* Executive summary */}
      <section className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#E2E8F0] md:grid-cols-3 xl:grid-cols-6">
        <SummaryCell label="Target">
          <div className="font-medium text-slate-900">{D.summary.target}</div>
          <div className="text-slate-500">{D.summary.targetSub}</div>
        </SummaryCell>
        <SummaryCell label="Business Service">
          <div className="font-medium text-slate-900">{D.summary.businessService}</div>
          <div className="mt-0.5"><Pill tone="warn">{D.summary.tier}</Pill></div>
          <div className="mt-0.5 text-slate-500">{D.summary.throughput}</div>
        </SummaryCell>
        <SummaryCell label="Objective"><p className="text-slate-700">{D.summary.objective}</p></SummaryCell>
        <SummaryCell label="Proposed Actions">
          <ul className="space-y-0.5">
            {D.summary.proposedActions.map((a) => (
              <li key={a} className="flex gap-1.5 text-slate-700"><CheckCircle2 className="mt-[2px] h-3 w-3 shrink-0 text-emerald-600" />{a}</li>
            ))}
          </ul>
        </SummaryCell>
        <SummaryCell label="Expected Outcome">
          <ul className="space-y-0.5 text-slate-700">{D.summary.expectedOutcome.map((o) => <li key={o}>• {o}</li>)}</ul>
        </SummaryCell>
        <SummaryCell label="Expected Downtime">
          <div className="text-[20px] font-semibold text-emerald-700">{D.summary.downtime}</div>
          <div className="text-slate-500">{D.summary.downtimeSub}</div>
        </SummaryCell>
      </section>

      {/* Main grid */}
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Readiness */}
            <Panel title="Production Readiness">
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-center">
                  <RadialScore value={96} label="Production Ready" />
                  <div className="mt-1 text-[11.5px] text-slate-600">
                    Confidence: <span className="font-medium text-slate-800">High</span> · Risk:{" "}
                    <span className="font-medium text-amber-700">Low / Moderate</span>
                  </div>
                </div>
                <ul className="min-w-[260px] flex-1">
                  {D.readinessLines.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={() => openDrawer(`Readiness evidence — ${l.label}`, "Inspect the underlying check", <EvidenceTable rows={l.evidence} />)}
                        className="flex w-full items-center gap-2 border-b border-slate-100 py-1 text-left last:border-0 hover:bg-slate-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="text-[11.5px] text-slate-600">{l.label}</span>
                        <span className="ml-auto text-[11.5px] font-medium text-slate-800">{l.value}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            {/* IaC diff */}
            <Panel
              title="IaC Diff Summary"
              actions={
                <button
                  onClick={() => openDrawer("Full Terraform Plan", "Inherited from Change Engineering", <pre className="whitespace-pre-wrap rounded-md bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-100">{D.terraformPlan}</pre>)}
                  className="text-[11.5px] font-medium text-[#1B4F91] hover:underline"
                >
                  View Full Terraform Plan
                </button>
              }
            >
              <div className="flex items-center gap-6">
                <Stat value="0" label="To Add" tone="text-emerald-600" />
                <Stat value="1" label="To Change" tone="text-amber-600" />
                <Stat value="0" label="To Destroy" tone="text-rose-600" />
                <div className="ml-auto text-[11px] text-slate-500">Technology: Terraform</div>
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-[#E2E8F0]">
                <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 font-mono text-[11px] text-slate-700">
                  aws_ebs_volume.sql_prod_07_log
                </div>
                <div className="font-mono text-[11.5px]">
                  <div className="bg-rose-50 px-2 py-1 text-rose-700">- size = 500</div>
                  <div className="bg-emerald-50 px-2 py-1 text-emerald-700">+ size = 750</div>
                  {D.diffUnchanged.map((u) => (
                    <div key={u.key} className="px-2 py-0.5 text-slate-500">&nbsp;&nbsp;{u.key} = {u.value}</div>
                  ))}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4">
                {D.diffFacts.map((f) => <KeyValue key={f.label} label={f.label} value={f.value} />)}
              </div>
            </Panel>
          </div>

          {/* Cross-platform */}
          <Panel title="Cross-Platform Change Summary">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-wide text-slate-500">
                  <th className="py-1 font-medium">Domain</th><th className="font-medium">Actions</th>
                  <th className="font-medium">Technology</th><th className="font-medium">Artifacts</th>
                  <th className="font-medium">Tests</th><th className="font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {D.domainRows.map((r) => (
                  <tr
                    key={r.domain}
                    onClick={() => openDrawer(`${r.domain} — domain detail`, `${r.technology} · ${r.tests} tests`, <BulletList items={r.detail} />)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-1.5 font-medium text-slate-800">{r.domain}</td>
                    <td>{r.actions}</td><td className="text-slate-600">{r.technology}</td>
                    <td>{r.artifacts}</td><td>{r.tests}</td>
                    <td><Pill tone="ok">{r.risk}</Pill></td>
                  </tr>
                ))}
                <tr className="font-medium text-slate-800">
                  <td className="py-1.5">TOTAL</td><td>8</td><td>—</td><td>12</td><td>21</td><td />
                </tr>
              </tbody>
            </table>
          </Panel>

          {/* Risk */}
          <Panel title="Risk & Impact Assessment">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                {D.riskLines.map((r) => <KeyValue key={r.label} label={r.label} value={r.value} />)}
                <div className="mt-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">Overall Risk Score</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-semibold text-slate-900">32</span>
                    <span className="text-[11.5px] text-slate-500">/ 100</span>
                    <Pill tone="warn" className="ml-auto">Low / Moderate</Pill>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: "32%" }} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-md border border-rose-200 bg-rose-50/60 p-2">
                  <div className="text-[11.5px] font-semibold text-rose-800">If Change Is Not Performed</div>
                  <ul className="mt-1 space-y-0.5 text-[11.5px] text-rose-900/80">{D.ifNotPerformed.map((i) => <li key={i}>• {i}</li>)}</ul>
                </div>
                <div className="rounded-md border border-[#E2E8F0] p-2">
                  <div className="text-[11.5px] font-semibold text-slate-800">If Change Is Performed — primary risks &amp; mitigations</div>
                  <ul className="mt-1 space-y-1">
                    {D.ifPerformed.map((r) => (
                      <li key={r.risk} className="grid gap-0.5 border-b border-slate-100 pb-1 last:border-0 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-2">
                        <span className="text-[11.5px] font-medium text-slate-700">{r.risk}</span>
                        <span className="text-[11.5px] text-slate-600">{r.mitigation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Panel>

          {/* Prereqs + gates */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Panel title="Prerequisites & Gates">
              <ul>
                {D.prerequisites.map((p) => (
                  <li key={p.label}>
                    <button
                      onClick={() => openDrawer(`Prerequisite — ${p.label}`, "Evidence detail", <EvidenceTable rows={{ check: p.label, observed: p.observed, expected: p.expected, source: p.source, timestamp: p.timestamp, confidence: p.confidence }} />)}
                      className="flex w-full items-center gap-2 border-b border-slate-100 py-1 text-left last:border-0 hover:bg-slate-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span className="text-[11.5px] text-slate-700">{p.label}</span>
                      <span className="ml-auto text-[11.5px] font-medium text-emerald-700">{p.status}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Execution Gates">
              <ol className="space-y-1.5">
                {D.gates.map((g, i) => (
                  <li key={g.stage}>
                    <button
                      onClick={() => openDrawer(`Gate — ${g.stage}`, g.authority, (
                        <div className="space-y-2">
                          <div><div className="text-[11px] uppercase text-slate-500">Gate condition</div><p>{g.gate}</p></div>
                          <div><div className="text-[11px] uppercase text-slate-500">Failure behavior</div><p>{g.onFailure}</p></div>
                          <div><div className="text-[11px] uppercase text-slate-500">Authority</div><p>{g.authority}</p></div>
                        </div>
                      ))}
                      className="w-full rounded-md border border-[#E2E8F0] p-2 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-100 text-[9.5px] font-semibold text-slate-600">{i + 1}</span>
                        <span className="text-[11.5px] font-semibold tracking-wide text-slate-800">{g.stage}</span>
                        <Pill tone={g.authority.startsWith("Human") ? "warn" : g.authority === "Policy Approved" ? "info" : "ok"} className="ml-auto">
                          {g.authority}
                        </Pill>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600">Gate: {g.gate}</p>
                      <p className="text-[11px] text-slate-500">If failed: {g.onFailure}</p>
                    </button>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>

          {/* Recovery */}
          <Panel title="Recovery & Compensating Strategy">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {D.recovery.map((r) => (
                <button
                  key={r.title}
                  onClick={() => openDrawer(`Recovery — ${r.title}`, `Reversible: ${r.reversible}`, (
                    <div className="space-y-2">{r.note && <p className="rounded-md bg-amber-50 p-2 text-amber-800">{r.note}</p>}<BulletList items={r.detail} /></div>
                  ))}
                  className="rounded-md border border-[#E2E8F0] p-2 text-left hover:bg-slate-50"
                >
                  <div className="text-[12px] font-semibold text-slate-800">{r.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Reversible: {r.reversible}</div>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">{r.detail.slice(0, 3).map((d) => <li key={d}>• {d}</li>)}</ul>
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-3">
              {D.recoveryFacts.map((f) => <KeyValue key={f.label} label={f.label} value={f.value} />)}
            </div>
          </Panel>

          {/* Evidence */}
          <Panel title="Evidence & Justification">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {D.evidenceBlocks.map((e) => (
                <button
                  key={e.title}
                  onClick={() => openDrawer(`Evidence — ${e.title}`, e.sources.join(" · "), (
                    <div className="space-y-2"><BulletList items={e.evidence} />
                      <div><div className="text-[11px] uppercase text-slate-500">Sources</div><p>{e.sources.join(", ")}</p></div>
                      {e.confidence && <div><div className="text-[11px] uppercase text-slate-500">Confidence</div><p>{e.confidence}</p></div>}
                    </div>
                  ))}
                  className="rounded-md border border-[#E2E8F0] p-2 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#1B4F91]" />
                    <span className="text-[12px] font-semibold text-slate-800">{e.title}</span>
                    {e.confidence && <Pill tone="ok" className="ml-auto">{e.confidence}</Pill>}
                  </div>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">{e.evidence.map((x) => <li key={x}>• {x}</li>)}</ul>
                  <div className="mt-1 text-[10.5px] text-slate-500">Sources: {e.sources.join(", ")}</div>
                </button>
              ))}
            </div>
          </Panel>

          {/* Policy + blast radius */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Panel
              title="Policy Decision"
              actions={
                <button
                  onClick={() => openDrawer("Policy Evaluation", D.POLICY_NAME, (
                    <ul className="space-y-1">
                      {D.policyControls.map((c) => (
                        <li key={c.control} className="flex items-center justify-between gap-3 border-b border-slate-100 py-1">
                          <span>{c.control}</span><Pill tone={c.status === "Prohibited" ? "bad" : c.status === "Required" ? "warn" : "ok"}>{c.status}</Pill>
                        </li>
                      ))}
                    </ul>
                  ))}
                  className="text-[11.5px] font-medium text-[#1B4F91] hover:underline"
                >
                  View Policy Evaluation
                </button>
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="ok">Compliant</Pill>
                <span className="font-mono text-[11px] text-slate-600">{D.POLICY_NAME}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-6">
                <KeyValue label="Controls Evaluated" value="18" />
                <KeyValue label="Passed" value="18" />
                <KeyValue label="Exceptions" value="0" />
                <KeyValue label="Policy Violations" value="0" />
              </div>
              <ul className="mt-2 space-y-0.5">
                {D.policyControls.map((c) => (
                  <li key={c.control} className="flex items-center justify-between gap-3 border-b border-slate-100 py-1 text-[11.5px] last:border-0">
                    <span className="text-slate-700">{c.control}</span>
                    <Pill tone={c.status === "Prohibited" ? "bad" : c.status === "Required" ? "warn" : "ok"}>{c.status}</Pill>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel
              title="Blast Radius"
              actions={
                <button
                  onClick={() => openDrawer("Dependency Evidence", "Derived from the asset relationship graph", (
                    <div className="space-y-2">
                      <BulletList items={D.blastChain} />
                      <div className="grid grid-cols-1 gap-x-6">{D.blastFacts.map((f) => <KeyValue key={f.label} label={f.label} value={f.value} />)}</div>
                    </div>
                  ))}
                  className="text-[11.5px] font-medium text-[#1B4F91] hover:underline"
                >
                  View Dependency Evidence
                </button>
              }
            >
              <ol className="space-y-1">
                {D.blastChain.map((n, i) => (
                  <li key={n} className="flex items-center gap-2" style={{ paddingLeft: i * 12 }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1B4F91]" />
                    <span className="text-[11.5px] text-slate-700">{n}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {D.blastFacts.map((f) => <KeyValue key={f.label} label={f.label} value={f.value} />)}
              </div>
            </Panel>
          </div>

          {/* Before / after */}
          <Panel title="Intended State Change">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left text-[10.5px] uppercase tracking-wide text-slate-500">
                  <th className="py-1 font-medium">Attribute</th>
                  <th className="font-medium">Before</th>
                  <th className="font-medium">Expected State (after execution)</th>
                </tr>
              </thead>
              <tbody>
                {D.beforeAfter.map((r) => (
                  <tr key={r.label} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 text-slate-700">{r.label}</td>
                    <td className="text-slate-600">{r.before}</td>
                    <td className="font-medium text-slate-900">{r.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-[11px] text-slate-500">
              The right-hand column is the expected state. It is not yet achieved and is not a guarantee.
            </p>
          </Panel>

          {/* Expandables */}
          <Expandable title="Why Approval Is Required" defaultOpen>
            <p>
              The platform has autonomously observed, diagnosed, recommended and engineered the remediation.
              However, this package modifies production infrastructure supporting a Tier 1 business service.
              Production policy therefore requires explicit human authorization before AWS EBS and Windows
              filesystem mutations can occur.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <KeyValue label="AI Recommendation" value="Approve" />
              <KeyValue label="Confidence" value="96%" />
              <KeyValue label="Policy Recommendation" value="Approve with human authorization" />
              <KeyValue label="Blocking Issues" value="0" />
              <KeyValue label="Warnings" value="0 critical" />
              <KeyValue label="Human Decision" value={approved ? "Approved" : state === "rejected" ? "Rejected" : state === "changes" ? "Changes requested" : "Pending"} />
            </div>
          </Expandable>

          <Expandable title="Approval & Decision History">
            <ol className="space-y-1.5">
              {history.map((h, i) => (
                <li key={`${h.event}-${i}`} className="rounded-md border border-[#E2E8F0] p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-800">{h.event}</span>
                    <Pill tone="neutral">v{h.version}</Pill>
                    <span className="ml-auto text-[11px] text-slate-500">{h.when}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">{h.actor} — {h.comment}</div>
                </li>
              ))}
            </ol>
          </Expandable>

          <Expandable title="Change Package Integrity">
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <KeyValue label="Package" value={pkgId} mono />
              <KeyValue label="Version" value={version} />
              <KeyValue label="Artifacts" value="12" />
              <KeyValue label="Manifest" value="Valid" />
              <KeyValue label="Artifact Validation" value="Passed" />
              <KeyValue label="Dependencies" value="Resolved" />
              <KeyValue label="Policy" value="Passed" />
              <KeyValue label="Test Plan" value="Valid" />
              <KeyValue label="Recovery Plan" value="Valid" />
              <KeyValue label="Checksum" value={D.PACKAGE_CHECKSUM} mono />
              <KeyValue label="Signature" value={approved ? "Valid" : "Pending"} />
              <KeyValue label="State" value={approved ? "Immutable" : "Mutable draft"} />
              <KeyValue label="Execution Authorization" value={approved ? D.EXEC_AUTH_TOKEN : "None"} mono />
            </div>
          </Expandable>
        </div>

        {/* Right rail */}
        <aside className="space-y-3">
          <Panel title="Approval Required">
            <p className="text-[11.5px] text-slate-600">
              This package includes production infrastructure mutations requiring human authorization.
            </p>
            <ul className="mt-2 space-y-1.5">
              {D.approvers.map((a) => {
                const done = approvals[a.id];
                return (
                  <li key={a.id} className="flex items-center gap-2 rounded-md border border-[#E2E8F0] p-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#EFF4FB] text-[10.5px] font-semibold text-[#1B4F91]">{a.initials}</span>
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium text-slate-800">{a.name}</div>
                      <div className="truncate text-[10.5px] text-slate-500">{a.role}</div>
                    </div>
                    <div className="ml-auto">
                      {done ? <Pill tone="ok">Approved</Pill> : state === "rejected" ? <Pill tone="bad">Void</Pill> : (
                        <button
                          onClick={() => setApprovals((p) => ({ ...p, [a.id]: true }))}
                          className="rounded-md border border-[#E2E8F0] px-2 py-0.5 text-[10.5px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Pending — sign
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 text-[10.5px] text-slate-500">
              Demo mode: the current user may satisfy all approval roles sequentially.
            </p>
            <div className="mt-1"><span className="text-[11px] text-slate-500">Approval Policy: </span>
              <button onClick={() => openDrawer("Policy Evaluation", D.POLICY_NAME, <BulletList items={D.policyControls.map((c) => `${c.control} — ${c.status}`)} />)} className="text-[11px] text-[#1B4F91] hover:underline">
                {D.POLICY_NAME}
              </button>
            </div>
          </Panel>

          <Panel title="Automation Authority">
            <ul>
              {D.authority.map((a) => (
                <li key={a.capability}>
                  <button
                    onClick={() => openDrawer(`Automation authority — ${a.capability}`, a.level, (
                      <div className="space-y-2">
                        <p>Capability <strong>{a.capability}</strong> is governed at level <strong>{a.level}</strong> for package {pkgId}.</p>
                        {a.note && <p className="text-slate-600">{a.note}</p>}
                        <p className="text-slate-600">Authority is derived from {D.POLICY_NAME} and the criticality of the target business service.</p>
                      </div>
                    ))}
                    className="flex w-full items-center gap-2 border-b border-slate-100 py-1 text-left last:border-0 hover:bg-slate-50"
                  >
                    <span className="text-[11.5px] text-slate-700">{a.capability}</span>
                    <Pill tone={AUTHORITY_TONE[a.level]} className="ml-auto shrink-0">{a.level}</Pill>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Approval Actions">
            <div className="space-y-2">
              {approved ? (
                <button
                  onClick={() => navigate(`/execution/${pkgId}`)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 text-[12.5px] font-semibold text-white hover:bg-emerald-700"
                >
                  <ArrowRight className="h-4 w-4" /> Proceed to Execution Center
                </button>
              ) : (
                <button
                  disabled={state === "rejected"}
                  onClick={() => setApproveOpen(true)}
                  className={cn(
                    "flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-[12.5px] font-semibold text-white",
                    state === "rejected" ? "cursor-not-allowed bg-slate-300" : "bg-emerald-600 hover:bg-emerald-700",
                  )}
                >
                  <PlayCircle className="h-4 w-4" /> Approve for Execution
                </button>
              )}
              <button
                disabled={approved}
                onClick={() => setChangesOpen(true)}
                className="h-9 w-full rounded-md border border-[#CFE0F3] bg-white text-[12.5px] font-medium text-[#1B4F91] hover:bg-[#F5F9FF] disabled:opacity-50"
              >
                Request Engineering Changes
              </button>
              <button
                disabled={approved}
                onClick={() => setRejectOpen(true)}
                className="h-9 w-full rounded-md border border-rose-200 bg-white text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                Reject Change
              </button>
              <Link
                to="/changes/sql-prod-07"
                className="flex h-9 w-full items-center justify-center rounded-md border border-[#E2E8F0] bg-white text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Return to Change Engineering
              </Link>
            </div>
          </Panel>
        </aside>
      </div>

      {/* Drill-down drawer */}
      <ReviewDrawer open={drawer !== null} title={drawer?.title ?? ""} subtitle={drawer?.subtitle} onClose={() => setDrawer(null)}>
        {drawer?.body}
      </ReviewDrawer>

      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} onApprove={runApproval} pkgId={pkgId} />
      <ChangesModal open={changesOpen} onClose={() => setChangesOpen(false)} onSubmit={submitChanges} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onSubmit={submitReject} />

      {progress !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-4">
          <div className="w-full max-w-[420px] rounded-lg border border-[#E2E8F0] bg-white p-4">
            <h2 className="text-[13.5px] font-semibold text-slate-900">Approving production change</h2>
            <ol className="mt-2 space-y-1.5">
              {D.approvalSteps.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-[12px]">
                  {i < progress ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : i === progress ? <Loader2 className="h-4 w-4 animate-spin text-[#1B4F91]" />
                    : <span className="h-4 w-4 rounded-full border border-slate-200" />}
                  <span className={i <= progress ? "text-slate-800" : "text-slate-400"}>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function SummaryCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-3 text-[11.5px]">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="text-center">
      <div className={cn("text-[20px] font-semibold", tone)}>{value}</div>
      <div className="text-[10.5px] text-slate-500">{label}</div>
    </div>
  );
}

function Banner({ tone, title, children }: { tone: Tone; title: string; children: React.ReactNode }) {
  const style = tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-900"
    : "border-rose-200 bg-rose-50 text-rose-900";
  const Icon = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : XCircle;
  return (
    <div className={cn("mt-3 flex items-start gap-2 rounded-lg border p-2.5 text-[11.5px]", style)}>
      <Icon className="mt-[1px] h-4 w-4 shrink-0" />
      <div><div className="font-semibold">{title}</div><div>{children}</div></div>
    </div>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return <ul className="space-y-1">{items.map((i) => <li key={i} className="flex gap-1.5"><span className="text-slate-400">•</span><span>{i}</span></li>)}</ul>;
}

function EvidenceTable({ rows }: { rows: { check: string; observed: string; expected: string; source: string; timestamp: string; confidence: string } }) {
  return (
    <div>
      <KeyValue label="Check" value={rows.check} />
      <KeyValue label="Observed value" value={rows.observed} />
      <KeyValue label="Expected value" value={rows.expected} />
      <KeyValue label="Source" value={rows.source} />
      <KeyValue label="Timestamp" value={rows.timestamp} />
      <KeyValue label="Confidence" value={rows.confidence} />
    </div>
  );
}

function FullPackageBody() {
  return (
    <div className="space-y-3">
      <p>Package {D.PACKAGE_ID} contains 12 engineered artifacts inherited from the Change Engineering workspace.</p>
      <BulletList items={[
        "Terraform plan — aws_ebs_volume.sql_prod_07_log",
        "Terraform apply manifest",
        "EBS modification watcher",
        "T-SQL transaction log backup script",
        "Log reuse validation query",
        "DBCC SQLPERF logspace probe",
        "SQL rollback / diagnostics notes",
        "PowerShell filesystem extension script",
        "Windows filesystem verification script",
        "Application synthetic transaction definition",
        "Validation plan — 21 tests",
        "Recovery and compensating action plan",
      ]} />
      <div className="grid grid-cols-1 gap-x-6">
        <KeyValue label="Manifest" value="Valid" />
        <KeyValue label="Checksum" value={D.PACKAGE_CHECKSUM} mono />
      </div>
    </div>
  );
}

function Expandable({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">{title}</h3>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-[#E2E8F0] p-3 text-[11.5px] text-slate-700">{children}</div>}
    </section>
  );
}

/* ---------- modals ---------- */

function ApproveModal({ open, onClose, onApprove, pkgId }: { open: boolean; onClose: () => void; onApprove: () => void; pkgId: string }) {
  const [checks, setChecks] = useState([false, false, false]);
  const all = checks.every(Boolean);
  const labels = [
    "I reviewed the proposed infrastructure changes.",
    "I reviewed the validation and recovery strategy.",
    "I authorize execution of this production change package.",
  ];
  return (
    <ReviewModal
      open={open}
      title="Approve Production Change"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            disabled={!all}
            onClick={onApprove}
            className={cn("h-8 rounded-md px-3 text-[12px] font-semibold text-white", all ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300")}
          >
            Approve Package
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <KeyValue label="Package" value={pkgId} mono />
        <KeyValue label="Target" value="SQL-PROD-07 / OrdersDB" />
        <KeyValue label="Environment" value="Production" />
        <KeyValue label="Infrastructure Mutation" value="AWS EBS 500 GB → 750 GB" />
        <KeyValue label="Expected Downtime" value="None expected" />
        <KeyValue label="Risk" value="Low / Moderate" />
        <KeyValue label="Validation Tests" value="21" />
        <KeyValue label="Recovery" value="Compensating strategy available" />
      </div>
      <ul className="mt-3 space-y-1.5">
        {labels.map((l, i) => (
          <li key={l}>
            <label className="flex items-start gap-2 rounded-md border border-[#E2E8F0] p-2 text-[12px]">
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={(e) => setChecks((c) => c.map((v, idx) => (idx === i ? e.target.checked : v)))}
                className="mt-[2px]"
              />
              <span>{l}</span>
            </label>
          </li>
        ))}
      </ul>
    </ReviewModal>
  );
}

function ChangesModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (reason: string, comment: string) => void }) {
  const [reason, setReason] = useState(D.changeRequestReasons[0]);
  const [comment, setComment] = useState("");
  return (
    <ReviewModal
      open={open}
      title="Request Engineering Changes"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => onSubmit(reason, comment)} className="h-8 rounded-md bg-[#1B4F91] px-3 text-[12px] font-semibold text-white hover:bg-[#173F76]">
            Return Package to Engineering
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-1.5">
        {D.changeRequestReasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn("rounded-md border px-2 py-1.5 text-left text-[11.5px]", reason === r ? "border-[#1B4F91] bg-[#EFF4FB] font-medium text-[#1B4F91]" : "border-[#E2E8F0] text-slate-700 hover:bg-slate-50")}
          >
            {r}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="text-[11.5px] text-slate-600">Describe the required engineering change</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border border-[#E2E8F0] p-2 text-[12px] outline-none focus:border-[#1B4F91]/40"
        />
      </label>
      <p className="mt-1 text-[11px] text-slate-500">Package contents are preserved and remain available to engineering.</p>
    </ReviewModal>
  );
}

function RejectModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (reason: string, comment: string) => void }) {
  const [reason, setReason] = useState(D.rejectReasons[0]);
  const [comment, setComment] = useState("");
  const [confirm, setConfirm] = useState(false);
  const ready = confirm && comment.trim().length > 0;
  return (
    <ReviewModal
      open={open}
      title="Reject Change"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="h-8 rounded-md border border-[#E2E8F0] px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            disabled={!ready}
            onClick={() => onSubmit(reason, comment)}
            className={cn("h-8 rounded-md px-3 text-[12px] font-semibold text-white", ready ? "bg-rose-600 hover:bg-rose-700" : "cursor-not-allowed bg-slate-300")}
          >
            Reject Change
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-1.5">
        {D.rejectReasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn("rounded-md border px-2 py-1.5 text-left text-[11.5px]", reason === r ? "border-rose-300 bg-rose-50 font-medium text-rose-700" : "border-[#E2E8F0] text-slate-700 hover:bg-slate-50")}
          >
            {r}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="text-[11.5px] text-slate-600">Comment (required)</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-[#E2E8F0] p-2 text-[12px] outline-none focus:border-rose-300" />
      </label>
      <label className="mt-2 flex items-start gap-2 text-[12px]">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-[2px]" />
        <span>I confirm this production change package is rejected and no execution authorization will be issued.</span>
      </label>
    </ReviewModal>
  );
}
