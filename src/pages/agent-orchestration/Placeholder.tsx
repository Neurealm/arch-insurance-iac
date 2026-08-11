// Placeholder shells for Agent Orchestration sections scheduled for later
// build prompts. URL state (filters, drawer, selection) is preserved.

import { Link, useLocation } from "react-router-dom";
import { Panel, Btn } from "./parts";

const SPECS: Record<string, { title: string; body: string; items: string[] }> = {
  workflows: { title: "Workflow Registry", body: "Full registry administration: workflow definition, versioning, promotion, deprecation and per-workflow policy binding.", items: ["Definition and version lifecycle", "Trigger and completion configuration", "Step composition and contracts", "Promotion and deprecation controls"] },
  participants: { title: "Participants & Assignment", body: "Digital coworker participation, assignment strategy, alternates, capability requirements and concurrency limits.", items: ["Participant eligibility and roles", "Assignment strategy and weighting", "Alternate and fallback participants", "Per-agent concurrency ceilings"] },
  state: { title: "State & Recovery", body: "Durable state stores, checkpoint policy, resume behaviour, idempotency, dead-letter triage and replay authorization.", items: ["State store configuration", "Checkpoint and retention policy", "Resume and failover behaviour", "Dead-letter triage and replay"] },
  policies: { title: "Orchestration Policies", body: "Authoring, simulation, versioning and publication of sequencing, approval, retry, fallback, tool, state, role and handoff policies.", items: ["Policy authoring and simulation", "Approval gate configuration", "Retry and timeout schedules", "Conflict detection and resolution"] },
  tools: { title: "Tool Bindings", body: "Governed bindings between orchestration steps and enterprise systems, including privileged gateway configuration.", items: ["Binding registration and modes", "Allowed and blocked operations", "Privileged gateway and approval", "Credential references and rotation"] },
  runs: { title: "Runs & Traces", body: "Run inventory, live execution state, step-level traces, policy decisions and audit export.", items: ["Run inventory and filters", "Step trace and decision record", "Approval and handoff audit", "Trace export and retention"] },
  evaluation: { title: "Evaluation", body: "Workflow scoring, regression comparison across versions, intervention analysis and outcome validation review.", items: ["Version regression comparison", "Intervention analysis", "Outcome validation review", "Score publication and history"] },
  settings: { title: "Settings", body: "Tenant defaults for orchestration behaviour, concurrency, retention, escalation routing and administrative roles.", items: ["Orchestration defaults", "Concurrency and rate control", "Retention and audit settings", "Escalation and notification routing"] },
};

export default function AgentOrchestrationPlaceholder() {
  const { pathname, search } = useLocation();
  const key = pathname.split("/").pop() ?? "";
  const spec = SPECS[key] ?? { title: "Section", body: "This section is prepared for a subsequent build prompt.", items: [] };

  return (
    <div className="space-y-4">
      <Panel title={spec.title} subtitle="Prepared for implementation — filters, selection and drawer parameters are preserved across sections."
        actions={<Btn><Link to={{ pathname: "/agent-orchestration/overview", search }}>Back to Overview</Link></Btn>}>
        <p className="text-[12.5px] leading-relaxed text-slate-700">{spec.body}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {spec.items.map((i) => (
            <li key={i} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700">{i}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
