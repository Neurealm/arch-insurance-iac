// Agent Orchestration Administration — Overview.
// Composition: KPI band, orchestration control pipeline, workflow registry with
// filters, the technical execution graph, durable state & quality, policy
// families, tool bindings, handoff contracts, approvals, retry/idempotency,
// patterns, concurrency, evaluation, run explanation, simulation, conflicts,
// and the control-plane boundary definition.

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Play } from "lucide-react";
import { toast } from "sonner";
import {
  Panel, KpiCard, InspectDrawer, KV, SubHead, Bullets, StatePill, ScoreText, Btn, RichTip, HelpDot, scoreTone,
} from "./parts";
import { WorkflowGraph } from "./WorkflowGraph";
import { SimulationEngine } from "./SimulationEngine";
import { CreateWorkflowWizard } from "./CreateWorkflowWizard";
import {
  WORKFLOWS, PIPELINE, GRAPH_NODES, GRAPH_EDGES, STATE_METRICS, QUALITY_SCORECARD, STATE_MODEL, STATE_STORES,
  POLICY_FAMILIES, TOOL_BINDINGS, TOOL_MODES, HANDOFFS, APPROVAL_POLICY, RETRY_MODEL, IDEMPOTENCY_MODEL,
  PATTERNS, PLANNING_BOUNDS, CONCURRENCY, PARALLEL_EXAMPLE, EVALUATION_METRICS, EVALUATION_SUMMARY,
  EXPLANATION, CONFIG_ERRORS, CONFLICT, CONTROL_PLANE_DEFINES, CONTROL_PLANE_FLOW, NOT_GOVERNED_HERE,
  SERVICE_CONTRACT, ROLES, DEFINITIONS, FILTER_DEFS, WORKFLOW_TOTAL, DRAFT_TOTAL, COWORKER_TOTAL, POLICY_TOTAL,
  type Health,
} from "./data";

function healthTone(h: Health): "ok" | "warn" | "bad" | "muted" {
  return h === "Healthy" ? "ok" : h === "Degraded" ? "warn" : h === "Error" ? "bad" : "muted";
}

export default function AgentOrchestrationOverview() {
  const [params, setParams] = useSearchParams();
  const drawer = params.get("drawer") ?? "";
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [wizard, setWizard] = useState(false);

  const open = (key: string) => { const p = new URLSearchParams(params); p.set("drawer", key); setParams(p, { replace: false }); };
  const close = () => { const p = new URLSearchParams(params); p.delete("drawer"); setParams(p, { replace: true }); };
  const [kind, id] = drawer.split(":");

  const rows = useMemo(() => WORKFLOWS.filter((w) => {
    const q = query.trim().toLowerCase();
    if (q && !(w.name + w.domain + w.owner + w.trigger).toLowerCase().includes(q)) return false;
    if (filters.domain && w.domain !== filters.domain) return false;
    if (filters.pattern && w.pattern !== filters.pattern) return false;
    if (filters.status && w.status !== filters.status) return false;
    if (filters.trigger && w.trigger !== filters.trigger) return false;
    if (filters.risk && w.risk !== filters.risk) return false;
    if (filters.approval && (filters.approval === "Yes") !== w.approvalRequired) return false;
    if (filters.tool && !w.tools.includes(filters.tool)) return false;
    if (filters.coworker && !w.coworkers.includes(filters.coworker)) return false;
    if (filters.owner && w.owner !== filters.owner) return false;
    return true;
  }), [filters, query]);

  const wf = WORKFLOWS.find((w) => w.id === id);
  const stage = PIPELINE.find((s) => s.id === id);
  const pol = POLICY_FAMILIES.find((p) => p.id === id);
  const tool = TOOL_BINDINGS.find((t) => t.id === id);
  const ho = HANDOFFS.find((h) => h.id === id);
  const node = GRAPH_NODES.find((n) => n.id === id);
  const edge = GRAPH_EDGES.find((e) => e.id === id);
  const sm = STATE_METRICS.find((s) => s.id === id);
  const qs = QUALITY_SCORECARD.find((s) => s.id === id);
  const err = CONFIG_ERRORS.find((e) => e.id === id);
  const store = STATE_STORES.find((s) => s.id === id);

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="space-y-4">
      {/* KPI band */}
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Workflows" value={`${WORKFLOWS.filter((w) => w.status !== "Draft").length} active`} secondary={`${DRAFT_TOTAL} drafts · ${WORKFLOW_TOTAL} defined`}
          help="Workflow" tip={{ term: "Active Workflows", definition: "Versioned execution graphs currently eligible to accept runs in this tenant.", rows: [["Defined", `${WORKFLOW_TOTAL}`], ["Draft", `${DRAFT_TOTAL}`], ["Deprecated", "1"]] }}
          onClick={() => open("kpi:workflows")} selected={drawer === "kpi:workflows"} />
        <KpiCard label="Participating Digital Coworkers" value={`${COWORKER_TOTAL}`} secondary="Across 7 published workflows"
          tip={{ term: "Participating Digital Coworkers", definition: "Distinct coworkers assigned to at least one step of an active workflow.", rows: [["Primary assignments", "31"], ["Alternate assignments", "12"], ["At concurrency limit (24h)", "3"]] }}
          onClick={() => open("kpi:coworkers")} selected={drawer === "kpi:coworkers"} />
        <KpiCard label="Orchestration Policies" value={`${POLICY_TOTAL}`} secondary="9 families · 1 pending update"
          tip={{ term: "Orchestration Policies", definition: "Rules governing sequencing, approvals, retries, fallback, tools, state, roles and handoffs.", rows: [["Families", "9"], ["Pending update", "1"], ["Compliance", "99.4%"]] }}
          onClick={() => open("kpi:policies")} selected={drawer === "kpi:policies"} />
        <KpiCard label="Runs in Flight" value="128" secondary="41 underwriting · 27 incident · 60 other" change="Peak 214 today"
          tip={{ term: "Runs in Flight", definition: "Orchestration runs currently active, held at an approval gate, or awaiting retry.", rows: [["Executing", "94"], ["Held at approval", "22"], ["Awaiting retry", "12"]] }}
          onClick={() => open("kpi:runs")} selected={drawer === "kpi:runs"} />
      </div>

      {/* Pipeline */}
      <Panel title="Orchestration Control Pipeline" help="Orchestration"
        subtitle="Every run advances through these stages. Each stage is independently configurable and independently enforced."
        actions={<Btn onClick={() => open("stage:trigger")}>Inspect first stage</Btn>}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PIPELINE.map((s, i) => (
            <RichTip key={s.id} as="div" className="min-w-[168px] flex-1"
              tip={{ term: `${s.index}. ${s.name}`, definition: s.purpose, rows: [["Inputs", s.inputs.slice(0, 2).join(", ")], ["Outputs", s.outputs.slice(0, 2).join(", ")], ["Health", s.health]] }}>
              <button onClick={() => open(`stage:${s.id}`)}
                className={cn("h-full w-full rounded-md border px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:shadow-sm",
                  drawer === `stage:${s.id}` ? "border-blue-400 bg-blue-50/50" : "border-slate-200 bg-white hover:border-slate-300")}>
                <div className="flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-800 text-[9px] font-semibold text-white">{s.index}</span>
                  <span className="text-[12px] font-semibold text-slate-800">{s.name}</span>
                </div>
                <div className="mt-1 text-[11.5px] text-slate-700">{s.headline}</div>
                <div className="text-[10.5px] text-slate-500">{s.sub}</div>
                <div className="mt-1.5 text-[10.5px] font-medium text-blue-700">Configure →</div>
              </button>
            </RichTip>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Stage {PIPELINE.length} completes only when the configured outcome validation passes; otherwise the run escalates rather than closing silently.
        </p>
      </Panel>

      {/* Registry */}
      <Panel title="Workflow Registry" help="Workflow"
        subtitle="Versioned orchestration definitions available to this tenant. Every row is inspectable and configurable."
        actions={<Btn variant="primary" onClick={() => setWizard(true)}>Create Workflow</Btn>}>
        <div className="flex flex-wrap items-center gap-1.5">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search workflows…"
            aria-label="Search workflows"
            className="h-8 w-[210px] rounded-md border border-slate-200 px-2.5 text-[12px] outline-none focus:border-blue-400" />
          {FILTER_DEFS.map((f) => (
            <select key={f.id} aria-label={f.label} value={filters[f.id] ?? ""}
              onChange={(e) => setFilters((s) => ({ ...s, [f.id]: e.target.value }))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11.5px] text-slate-700">
              <option value="">{f.label}</option>
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          {(activeFilters.length > 0 || query) && (
            <Btn variant="ghost" onClick={() => { setFilters({}); setQuery(""); }}>Clear all</Btn>
          )}
          <span className="ml-auto text-[11.5px] text-slate-500">{rows.length} of {WORKFLOWS.length} workflows</span>
        </div>

        <div className="mt-2.5 overflow-x-auto">
          <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
                {["Workflow", "Domain", "Trigger", "Steps", "Orchestrator", "Human Gates", "Version", "Success", "Status", ""].map((h) => (
                  <th key={h} className="border-b border-slate-200 py-1.5 pr-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="group cursor-pointer hover:bg-slate-50" onClick={() => open(`workflow:${w.id}`)}>
                  <td className="border-b border-slate-100 py-2 pr-3">
                    <div className="text-[12.5px] font-medium text-slate-800">{w.name}</div>
                    <div className="text-[11px] text-slate-500">{w.owner} · {w.environment}</div>
                  </td>
                  <td className="border-b border-slate-100 py-2 pr-3 text-[12px] text-slate-600">{w.domain}</td>
                  <td className="border-b border-slate-100 py-2 pr-3 text-[12px] text-slate-600">{w.trigger}</td>
                  <td className="border-b border-slate-100 py-2 pr-3 text-[12px] tabular-nums text-slate-600">{w.steps}</td>
                  <td className="border-b border-slate-100 py-2 pr-3 text-[12px] text-slate-600">{w.orchestrator}</td>
                  <td className="border-b border-slate-100 py-2 pr-3 text-[12px] tabular-nums text-slate-600">{w.gates}</td>
                  <td className="border-b border-slate-100 py-2 pr-3 font-mono text-[11.5px] text-slate-600">{w.version}</td>
                  <td className="border-b border-slate-100 py-2 pr-3 text-[12px]"><ScoreText value={w.success} suffix="%" /></td>
                  <td className="border-b border-slate-100 py-2 pr-3"><StatePill tone={healthTone(w.status)} label={w.status} /></td>
                  <td className="border-b border-slate-100 py-2 pr-2 text-right text-[11.5px] font-medium text-blue-700 opacity-0 group-hover:opacity-100">Inspect →</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-[13px] font-medium text-slate-700">No workflows match the current filters</div>
              <p className="mt-1 text-[11.5px] text-slate-500">Adjust or clear the filters to see the full registry.</p>
              <Btn className="mt-2" onClick={() => { setFilters({}); setQuery(""); }}>Clear filters</Btn>
            </div>
          )}
        </div>
      </Panel>

      {/* Graph */}
      <Panel title="Selected Workflow Graph: Incident Investigation &amp; Remediation" help="Branch"
        subtitle="Technical execution graph — nodes are workflow steps with input and output contracts, edges are policy-evaluated transitions."
        actions={<Btn onClick={() => open("workflow:wf-incident")}>Open workflow configuration</Btn>}>
        <WorkflowGraph onNode={(n) => open(`node:${n}`)} onEdge={(e) => open(`edge:${e}`)} selectedNode={kind === "node" ? id : undefined} />
      </Panel>

      {/* State & quality */}
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel title="Durable Execution State" help="Durable State"
          subtitle="Workflow state is coordination data — what has executed, what is pending, what may resume. Long-lived business memory is governed by the Context / Evidence Layer.">
          <div className="grid gap-2 sm:grid-cols-3">
            {STATE_METRICS.map((m) => (
              <RichTip key={m.id} as="div" tip={{ term: m.label, definition: m.definition, rows: [["Target", m.target], ["Current", m.current], ["Gap", m.gap]], why: m.why }}>
                <button onClick={() => open(`state:${m.id}`)}
                  className="h-full w-full rounded-md border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
                  <div className="text-[11px] text-slate-500">{m.label}</div>
                  <div className="mt-0.5 text-[14px] font-semibold text-slate-900">{m.value}</div>
                </button>
              </RichTip>
            ))}
          </div>

          <SubHead>Live run state — {STATE_MODEL[0][1]}</SubHead>
          <KV rows={STATE_MODEL} />

          <SubHead>State stores</SubHead>
          <div className="grid gap-2 sm:grid-cols-2">
            {STATE_STORES.map((s) => (
              <button key={s.id} onClick={() => open(`store:${s.id}`)}
                className="rounded-md border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
                <div className="text-[12px] font-medium text-slate-800">{s.name}</div>
                <div className="text-[11px] text-slate-600">{s.role}</div>
                <div className="text-[10.5px] text-slate-500">{s.durability} · retention {s.retention} · {s.workflows} workflows</div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Orchestration Quality Scorecard" help="Recovery"
          subtitle="Measured behaviour of coordination itself, independent of model or agent quality.">
          <div className="space-y-2">
            {QUALITY_SCORECARD.map((q) => (
              <button key={q.id} onClick={() => open(`quality:${q.id}`)} className="w-full text-left">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] text-slate-700">{q.label}</span>
                  <span className="ml-auto text-[12px] font-semibold tabular-nums text-slate-900"><ScoreText value={q.value} suffix="%" /></span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn("h-full rounded-full",
                    scoreTone(q.value) === "ok" ? "bg-emerald-500" : scoreTone(q.value) === "warn" ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${q.value}%` }} />
                </div>
                <div className="mt-0.5 text-[10.5px] text-slate-500">Target {q.target} · {q.exceptions}</div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* Policies + tools */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Orchestration Policy Families" help="Approval Gate"
          subtitle="Policies are evaluated by the orchestration engine, not by the agents they govern.">
          <div className="space-y-1.5">
            {POLICY_FAMILIES.map((p) => (
              <button key={p.id} onClick={() => open(`policy:${p.id}`)}
                className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-slate-800">{p.category}</div>
                  <div className="truncate text-[11px] text-slate-500">{p.governs}</div>
                </div>
                <span className="shrink-0 text-[11.5px] tabular-nums text-slate-600">{p.count}</span>
                <StatePill tone={p.tone} label={p.status} />
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Tool Bindings" help="Tool Binding"
          subtitle="Governed associations between orchestration steps and enterprise systems. Privileged execution is enforced at the gateway, never inside an agent.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.08em] text-slate-500">
                  {["Tool", "Invocation Mode", "Workflows", "Health", "Privileged"].map((h) => (
                    <th key={h} className="border-b border-slate-200 py-1.5 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOOL_BINDINGS.map((t) => (
                  <tr key={t.id} className="cursor-pointer hover:bg-slate-50" onClick={() => open(`tool:${t.id}`)}>
                    <td className="border-b border-slate-100 py-1.5 pr-3 text-[12px] font-medium text-slate-800">{t.name}</td>
                    <td className="border-b border-slate-100 py-1.5 pr-3">
                      <RichTip tip={{ term: t.mode, definition: TOOL_MODES[t.mode] ?? "Governed invocation mode." }}>
                        <span className="text-[11.5px] text-slate-600 underline decoration-dotted underline-offset-2">{t.mode}</span>
                      </RichTip>
                    </td>
                    <td className="border-b border-slate-100 py-1.5 pr-3 text-[12px] tabular-nums text-slate-600">{t.workflows}</td>
                    <td className="border-b border-slate-100 py-1.5 pr-3"><StatePill tone={healthTone(t.health)} label={t.health} /></td>
                    <td className="border-b border-slate-100 py-1.5 pr-2 text-[11.5px] text-slate-600">{t.privileged ? "Yes — approval gated" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Handoffs + approval */}
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Handoff Contracts" help="Handoff"
          subtitle="Work transfers only when the declared conditions hold and the receiving participant accepts the input contract.">
          <div className="space-y-1.5">
            {HANDOFFS.map((h) => (
              <button key={h.id} onClick={() => open(`handoff:${h.id}`)}
                className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12.5px] font-medium text-slate-800">{h.source}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-[12.5px] font-medium text-slate-800">{h.destination}</span>
                  <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] text-slate-600">{h.kind}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-600">
                  Conditions: {h.conditions.join(" · ")} — otherwise {h.otherwise}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Approval Gate Configuration" help="Approval Gate" subtitle={`${APPROVAL_POLICY.id} — ${APPROVAL_POLICY.name}`}>
          <KV rows={[
            ["Approval type", APPROVAL_POLICY.type],
            ["Required role", APPROVAL_POLICY.role],
            ["Alternate approver", APPROVAL_POLICY.alternate],
            ["Response SLA", APPROVAL_POLICY.sla],
            ["Timeout behaviour", APPROVAL_POLICY.timeout],
            ["Decisions available", APPROVAL_POLICY.decisions.join(" · ")],
          ]} />
          <SubHead>Information presented to the approver</SubHead>
          <Bullets items={APPROVAL_POLICY.inputs} />
          <SubHead>Recorded decision</SubHead>
          <KV rows={APPROVAL_POLICY.audit} />
        </Panel>
      </div>

      {/* Retry / idempotency */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Failure, Retry & Recovery" help="Recovery" subtitle={`Applied to ${RETRY_MODEL.step}`}>
          <KV rows={[
            ["Maximum retries", RETRY_MODEL.maxRetries],
            ["Backoff schedule", RETRY_MODEL.backoff],
            ["Retryable errors", RETRY_MODEL.retryable.join(" · ")],
            ["Non-retryable errors", RETRY_MODEL.nonRetryable.join(" · ")],
            ["Alternate agent", RETRY_MODEL.alternateAgent],
            ["Alternate tool", RETRY_MODEL.alternateTool],
            ["Resume behaviour", RETRY_MODEL.resume],
            ["Dead letter queue", RETRY_MODEL.dlq],
            ["Escalation", RETRY_MODEL.escalation],
            ["Termination", RETRY_MODEL.termination],
          ]} />
          <p className="mt-2 text-[11px] text-slate-500">{RETRY_MODEL.note}</p>
        </Panel>

        <Panel title="Idempotency & Duplicate Protection" help="Idempotency">
          <KV rows={[
            ["Idempotency key", IDEMPOTENCY_MODEL.key],
            ["Duplicate window", IDEMPOTENCY_MODEL.window],
            ["Replay protection", IDEMPOTENCY_MODEL.replay],
            ["Side-effect class", IDEMPOTENCY_MODEL.sideEffect],
            ["Execution lock", IDEMPOTENCY_MODEL.lock],
            ["Correlation ID", IDEMPOTENCY_MODEL.correlation],
          ]} />
          <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[11.5px] leading-relaxed text-amber-900">{IDEMPOTENCY_MODEL.why}</p>
          </div>
        </Panel>
      </div>

      {/* Patterns + concurrency */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Workflow Patterns & Planning Bounds" help="Planning Bounds"
          subtitle="Dynamic planning is permitted, but only inside declared bounds so agents cannot create uncontrolled execution paths.">
          <div className="space-y-1.5">
            {PATTERNS.map((p) => (
              <div key={p.id} className="rounded-md border border-slate-200 px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-medium text-slate-800">{p.name}</span>
                  <span className="ml-auto text-[10.5px] text-slate-500">{p.freedom}</span>
                </div>
                <div className="text-[11px] text-slate-600">{p.detail} Example: {p.example}.</div>
              </div>
            ))}
          </div>
          <SubHead>Planning bounds</SubHead>
          <KV rows={PLANNING_BOUNDS} />
        </Panel>

        <Panel title="Concurrency, Parallelism & Rate Control" help="Concurrency">
          <KV rows={CONCURRENCY} />
          <SubHead>Parallel execution example</SubHead>
          <KV rows={[
            ["Workflow", PARALLEL_EXAMPLE.name],
            ["Parallel branches", PARALLEL_EXAMPLE.branches.join(" · ")],
            ["Join semantics", PARALLEL_EXAMPLE.join],
            ["Join timeout", PARALLEL_EXAMPLE.timeout],
            ["Continue condition", PARALLEL_EXAMPLE.continueIf],
          ]} />
        </Panel>
      </div>

      {/* Evaluation + explanation */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Panel title="Orchestration Evaluation" help="Completion Policy"
          subtitle={`${EVALUATION_SUMMARY.workflow} · ${EVALUATION_SUMMARY.sample} · scored ${EVALUATION_SUMMARY.date}`}>
          <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {EVALUATION_METRICS.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-b border-slate-100 py-1">
                <span className="text-[11.5px] text-slate-600">{k}</span>
                <span className="text-[12px] font-medium tabular-nums text-slate-900">{v}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Why This Run Behaved This Way" help="Orchestration"
          subtitle={`${EXPLANATION.run} · ${EXPLANATION.workflow} · ${EXPLANATION.version} · ${EXPLANATION.correlation}`}
          actions={<Btn onClick={() => toast.success("Execution trace exported", { description: `${EXPLANATION.run} — 12 steps, policy decisions and evidence references included.` })}>Export trace</Btn>}>
          <ol className="space-y-1">
            {EXPLANATION.steps.map((s) => (
              <li key={s.n} className={cn("flex gap-2 rounded-md border-l-[3px] bg-slate-50/60 px-2.5 py-1.5",
                s.tone === "warn" ? "border-l-amber-500" : "border-l-emerald-500")}>
                <span className="text-[11px] tabular-nums text-slate-500">{s.n}</span>
                <div className="min-w-0">
                  <div className="text-[12px] text-slate-800">{s.title}</div>
                  <div className="text-[11px] text-slate-500">{s.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <SimulationEngine />

      {/* Conflicts */}
      <Panel title="Configuration Conflicts & Errors" help="Recovery"
        subtitle="Detected inconsistencies that would produce unsafe or stalled execution. Each entry explains what failed, why it matters, and the corrective action.">
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <div className="text-[12.5px] font-semibold text-amber-900">{CONFLICT.title} — {CONFLICT.workflow}</div>
            <p className="text-[11.5px] text-amber-900">{CONFLICT.issue}</p>
            <p className="text-[11.5px] text-amber-800">Impact: {CONFLICT.impact}</p>
            <p className="text-[11.5px] text-amber-800">Recommended: {CONFLICT.recommended}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1.5">
          {CONFIG_ERRORS.map((e) => (
            <button key={e.id} onClick={() => open(`error:${e.id}`)}
              className="flex w-full items-start gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
              <StatePill tone={e.severity === "warn" ? "warn" : "muted"} label={e.severity === "warn" ? "Warning" : "Info"} />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-slate-800">{e.title}</div>
                <div className="text-[11px] text-slate-500">{e.workflow} — {e.failed}</div>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      {/* Boundary */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="What This Control Plane Governs" help="Orchestration">
          <Bullets items={CONTROL_PLANE_DEFINES} />
          <SubHead>Configuration to execution flow</SubHead>
          <div className="flex flex-wrap items-center gap-1.5">
            {CONTROL_PLANE_FLOW.map((f, i) => (
              <span key={f} className="flex items-center gap-1.5">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11.5px] text-slate-700">{f}</span>
                {i < CONTROL_PLANE_FLOW.length - 1 && <span className="text-slate-400">→</span>}
              </span>
            ))}
          </div>
          <SubHead>Not governed here</SubHead>
          <KV rows={NOT_GOVERNED_HERE} />
        </Panel>

        <Panel title="Service Contract, Roles & Definitions" help="Workflow">
          <SubHead>What orchestration guarantees</SubHead>
          <KV rows={SERVICE_CONTRACT} />
          <SubHead>Administrative roles</SubHead>
          <KV rows={ROLES} />
          <SubHead>Definitions</SubHead>
          <KV rows={DEFINITIONS} />
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 pb-4 text-[11px] text-slate-500">
        <Info className="h-3.5 w-3.5" /> Configuration changes take effect for new runs only. Runs already in flight complete under the workflow version they started with.
      </p>

      <CreateWorkflowWizard open={wizard} onClose={() => setWizard(false)}
        onPublished={(n, mode) => toast.success(mode === "Activate" ? "Workflow activated." : `Workflow saved as ${mode}.`, { description: n })} />

      {/* ------------------------------- Drawers ------------------------------ */}

      <InspectDrawer open={!!wf} onClose={close} objectType="Orchestration Workflow" name={wf?.name ?? ""}
        status={wf?.status} statusTone={wf ? (healthTone(wf.status) === "bad" ? "bad" : healthTone(wf.status) === "warn" ? "warn" : "ok") : "ok"}
        tabs={wf ? [
          { id: "def", label: "Definition", content: (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{wf.description}</p>
              <SubHead>Definition</SubHead>
              <KV rows={[["Domain", wf.domain], ["Owner", wf.owner], ["Version", wf.version], ["Published", wf.published],
                ["Orchestrator", wf.orchestrator], ["Pattern", wf.pattern], ["Environment", wf.environment],
                ["Risk class", wf.risk], ["Approval required", wf.approvalRequired ? "Yes" : "No"], ["Active runs", `${wf.activeRuns}`]]} />
              <SubHead>Trigger</SubHead>
              <KV rows={[["Event class", wf.triggerDetail.eventClass], ["Source", wf.triggerDetail.source],
                ["Filters", wf.triggerDetail.filters], ["Deduplication", wf.triggerDetail.dedup], ["Correlation key", wf.triggerDetail.correlation]]} />
              <SubHead>Step composition</SubHead>
              <KV rows={wf.stepMix} />
            </div>) },
          { id: "cfg", label: "Configuration", content: (
            <div>
              <KV rows={[["Maximum runtime", wf.config.maxRuntime], ["State store", wf.config.stateStore],
                ["Retry policy", wf.config.retry], ["Fallback", wf.config.fallback], ["Last updated", wf.config.updated]]} />
              <SubHead>Execution sequence</SubHead>
              <ol className="space-y-1">
                {wf.configSteps.map((s, i) => (
                  <li key={s.title} className="rounded-md border border-slate-200 px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-slate-100 text-[9.5px] font-semibold text-slate-600">{i + 1}</span>
                      <span className="text-[12px] font-medium text-slate-800">{s.title}</span>
                      <span className="ml-auto text-[10.5px] text-slate-500">{s.status}</span>
                    </div>
                    <div className="pl-6 text-[11px] text-slate-600">{s.detail}</div>
                  </li>
                ))}
              </ol>
              <SubHead>Human gates</SubHead>
              {wf.gateDetail.length === 0 ? <p className="text-[11.5px] text-slate-500">No human approval gates configured.</p> : (
                <KV rows={wf.gateDetail.map((g) => [g.name, `${g.roles} · SLA ${g.sla} · fallback: ${g.fallback}`] as [string, string])} />
              )}
              <SubHead>Applied policies</SubHead>
              <KV rows={wf.policies} />
            </div>) },
          { id: "part", label: "Participants", content: (
            <div>
              <SubHead>Digital coworkers</SubHead>
              <Bullets items={wf.coworkers} />
              <SubHead>Tool bindings</SubHead>
              <Bullets items={wf.tools} />
              <SubHead>Usage</SubHead>
              <KV rows={wf.usage} />
            </div>) },
          { id: "runs", label: "Runs & Status", content: (
            <div>
              <KV rows={wf.runStats} />
              <SubHead>Status detail</SubHead>
              <p className="text-[12px] text-slate-700">{wf.statusDetail.health}</p>
              {wf.statusDetail.warnings.length > 0 && (<><SubHead>Warnings</SubHead><Bullets items={wf.statusDetail.warnings} /></>)}
              {wf.statusDetail.conflicts.length > 0 && (<><SubHead>Conflicts</SubHead><Bullets items={wf.statusDetail.conflicts} /></>)}
              <SubHead>Last evaluation</SubHead>
              <p className="text-[12px] text-slate-700">{wf.statusDetail.evaluation}</p>
            </div>) },
          { id: "hist", label: "History", content: (
            <div>
              <SubHead>Change history</SubHead>
              <KV rows={wf.history} />
              <SubHead>Versions</SubHead>
              <KV rows={wf.versions.map((v) => [`${v.v} — ${v.state}`, v.note] as [string, string])} />
              <div className="mt-3 flex gap-2">
                <Btn variant="primary" onClick={() => toast.success("Workflow simulation queued", { description: `${wf.name} — no production tools will be executed.` })}>
                  <Play className="h-3.5 w-3.5" />Simulate workflow
                </Btn>
                <Btn onClick={() => toast.info("New draft version created", { description: `${wf.name} — draft based on ${wf.version}.` })}>Create draft version</Btn>
              </div>
            </div>) },
        ] : []} />

      <InspectDrawer open={!!stage} onClose={close} objectType="Pipeline Stage" name={stage ? `${stage.index}. ${stage.name}` : ""}
        status={stage?.health.split("—")[0].trim()} statusTone="ok"
        tabs={stage ? [
          { id: "purpose", label: "Purpose", content: (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{stage.purpose}</p>
              <SubHead>{stage.componentsLabel}</SubHead>
              <Bullets items={stage.components} />
              <SubHead>{stage.controlsLabel}</SubHead>
              <Bullets items={stage.controls} />
            </div>) },
          { id: "logic", label: "Logic", content: (
            <div>
              <SubHead>Inputs</SubHead><Bullets items={stage.inputs} />
              <SubHead>Outputs</SubHead><Bullets items={stage.outputs} />
              <SubHead>Evaluation logic</SubHead>
              <pre className="overflow-x-auto rounded-md bg-slate-900 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-100">{stage.logic.join("\n")}</pre>
            </div>) },
          { id: "cfg", label: "Configuration", content: (
            <div>
              <KV rows={stage.configuration} />
              <SubHead>Policies applied</SubHead><Bullets items={stage.policies} />
              <SubHead>Dependencies</SubHead><Bullets items={stage.dependencies} />
            </div>) },
          { id: "usage", label: "Usage & History", content: (
            <div>
              <p className="text-[12px] text-slate-700">{stage.health}</p>
              <SubHead>Usage</SubHead><KV rows={stage.usage} />
              <SubHead>Recent changes</SubHead><KV rows={stage.changes} />
            </div>) },
        ] : []} />

      <InspectDrawer open={!!pol} onClose={close} objectType="Policy Family" name={pol?.category ?? ""} status={pol?.status} statusTone={pol?.tone ?? "ok"}
        tabs={pol ? [
          { id: "gov", label: "Governs", content: (
            <div>
              <p className="text-[12px] leading-relaxed text-slate-700">{pol.governs}</p>
              <SubHead>Active policies ({pol.count})</SubHead><Bullets items={pol.examples} />
              <SubHead>Enforcement</SubHead>
              <p className="text-[12px] text-slate-700">{pol.enforcement}</p>
              <SubHead>Evaluated conditions</SubHead>
              <div className="flex flex-wrap gap-1">
                {pol.conditions.map((c) => <code key={c} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10.5px] text-slate-700">{c}</code>)}
              </div>
            </div>) },
          { id: "hist", label: "History", content: <KV rows={pol.history} /> },
        ] : []} />

      <InspectDrawer open={!!tool} onClose={close} objectType="Tool Binding" name={tool?.name ?? ""} status={tool?.health} statusTone={tool ? (healthTone(tool.health) === "bad" ? "bad" : healthTone(tool.health) === "warn" ? "warn" : "ok") : "ok"}
        tabs={tool ? [
          { id: "binding", label: "Binding", content: (
            <div>
              <KV rows={[["Binding ID", tool.bindingId], ["Invocation mode", tool.mode], ["Mode meaning", TOOL_MODES[tool.mode] ?? "—"],
                ["Environment", tool.environment], ["Gateway", tool.gateway], ["Authentication", tool.auth],
                ["Credential", tool.credential], ["Owner", tool.owner], ["Risk class", tool.riskClass],
                ["Privileged", tool.privileged ? "Yes" : "No"], ["Approval", tool.approval], ["Last sync", tool.sync]]} />
            </div>) },
          { id: "ops", label: "Operations", content: (
            <div>
              <SubHead>Allowed operations</SubHead><Bullets items={tool.allowed} />
              <SubHead>Blocked operations</SubHead><Bullets items={tool.blocked} />
              <SubHead>Policy constraints</SubHead><Bullets items={tool.policy} />
            </div>) },
          { id: "usage", label: "Usage & History", content: (
            <div>
              <SubHead>Used by workflows ({tool.workflows})</SubHead><Bullets items={tool.usedBy} />
              <SubHead>Change history</SubHead><KV rows={tool.history} />
            </div>) },
        ] : []} />

      <InspectDrawer open={!!ho} onClose={close} objectType="Handoff Contract" name={ho ? `${ho.source} → ${ho.destination}` : ""} status={ho?.kind} statusTone="ok"
        tabs={ho ? [
          { id: "contract", label: "Contract", content: (
            <div>
              <KV rows={[["Reason", ho.reason], ["Authorization", ho.authorization], ["Input contract", ho.inputContract],
                ["Output contract", ho.outputContract], ["Timeout", ho.timeout], ["Escalation", ho.escalation],
                ["Rejection path", ho.rejection], ["Carried state", ho.carriedState], ["Context refresh", ho.contextRefresh]]} />
              <SubHead>Conditions required</SubHead><Bullets items={ho.conditions} />
              <SubHead>Otherwise</SubHead>
              <p className="text-[12px] text-slate-700">{ho.otherwise}</p>
            </div>) },
        ] : []} />

      <InspectDrawer open={!!node} onClose={close} objectType="Workflow Step" name={node?.label ?? ""} status={node?.nodeId} statusTone="ok"
        tabs={node ? [
          { id: "step", label: "Step", content: (
            <div>
              <KV rows={[["Node ID", node.nodeId], ["Participant", node.participant], ["Timeout", node.timeout],
                ["Retry policy", node.retry], ["Policy applied", node.policy], ["Execution authority", node.authority],
                ["State checkpoint", node.checkpoint]]} />
              <SubHead>Input schema</SubHead><Bullets items={node.inputSchema} />
              <SubHead>Output schema</SubHead><Bullets items={node.outputSchema} />
            </div>) },
        ] : []} />

      <InspectDrawer open={!!edge} onClose={close} objectType="Transition Rule" name={edge?.label || "Transition"} status={edge?.kind} statusTone="ok"
        tabs={edge ? [{ id: "t", label: "Rule", content: (
          <KV rows={[["Rule", edge.rule], ["Condition", edge.condition], ["Priority", edge.priority], ["Fallback", edge.fallback], ["Threshold", edge.threshold]]} />
        ) }] : []} />

      <InspectDrawer open={!!sm} onClose={close} objectType="State Metric" name={sm?.label ?? ""} status={sm?.value} statusTone="ok"
        tabs={sm ? [{ id: "m", label: "Measurement", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{sm.definition}</p>
            <SubHead>Measurement</SubHead>
            <KV rows={[["Target", sm.target], ["Current", sm.current], ["Gap", sm.gap]]} />
            <SubHead>Why it matters</SubHead>
            <p className="text-[11.5px] leading-relaxed text-slate-700">{sm.why}</p>
          </div>) }] : []} />

      <InspectDrawer open={!!qs} onClose={close} objectType="Quality Metric" name={qs?.label ?? ""} status={qs ? `${qs.value}%` : ""} statusTone={qs ? scoreTone(qs.value) : "ok"}
        tabs={qs ? [{ id: "m", label: "Measurement", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{qs.definition}</p>
            <KV rows={[["Target", qs.target], ["Current", `${qs.value}%`], ["Largest contributors", qs.contributors], ["Exceptions", qs.exceptions]]} />
          </div>) }] : []} />

      <InspectDrawer open={!!store} onClose={close} objectType="State Store" name={store?.name ?? ""} status={store?.durability} statusTone="ok"
        tabs={store ? [{ id: "s", label: "Configuration", content: (
          <KV rows={[["Role", store.role], ["Durability", store.durability], ["Retention", store.retention], ["Workflows using it", `${store.workflows}`]]} />
        ) }] : []} />

      <InspectDrawer open={!!err} onClose={close} objectType="Configuration Finding" name={err?.title ?? ""} status={err?.severity === "warn" ? "Warning" : "Informational"} statusTone={err?.severity === "warn" ? "warn" : "ok"}
        tabs={err ? [{ id: "f", label: "Finding", content: (
          <div>
            <KV rows={[["Workflow", err.workflow], ["What failed", err.failed], ["Why it matters", err.why], ["Corrective action", err.action]]} />
            <Btn className="mt-3" variant="primary" onClick={() => { toast.success("Remediation task created", { description: `${err.title} — assigned to the workflow owner.` }); close(); }}>
              Create remediation task
            </Btn>
          </div>) }] : []} />

      <InspectDrawer open={kind === "kpi"} onClose={close} objectType="Tenant Metric" name={
        id === "workflows" ? "Active Workflows" : id === "coworkers" ? "Participating Digital Coworkers" : id === "policies" ? "Orchestration Policies" : "Runs in Flight"}
        tabs={[{ id: "d", label: "Detail", content: (
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">
              {id === "workflows" && "Versioned orchestration definitions eligible to accept runs. Drafts and deprecated versions remain inspectable but cannot be triggered."}
              {id === "coworkers" && "Digital coworkers assigned as primary or alternate participants across active workflow steps. Assignment eligibility is evaluated at runtime against role, domain, capability and concurrency."}
              {id === "policies" && "Tenant orchestration policies grouped into nine families. Policies are evaluated by the orchestration engine on every transition, gate and tool invocation."}
              {id === "runs" && "Runs currently executing, held at an approval gate, or waiting on a retry timer. Held runs retain their durable state and execution locks."}
            </p>
            <SubHead>Breakdown</SubHead>
            <KV rows={
              id === "workflows" ? [["Published", `${WORKFLOWS.filter((w) => w.status !== "Draft").length}`], ["Draft", `${DRAFT_TOTAL}`], ["Total defined", `${WORKFLOW_TOTAL}`]] :
              id === "coworkers" ? [["Primary assignments", `${COWORKER_TOTAL}`], ["Alternate assignments", "12"], ["At concurrency limit (24h)", "3"]] :
              id === "policies" ? [["Total policies", `${POLICY_TOTAL}`], ["Families", "9"], ["Pending update", "1"], ["Compliance", "99.4%"]] :
              [["Executing", "94"], ["Held at approval", "22"], ["Awaiting retry", "12"], ["Peak today", "214"]]} />
          </div>) }]} />
    </div>
  );
}
