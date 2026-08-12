// Placeholder shells for the LLM + Model Routing sections scheduled for
// subsequent build prompts. URL state (filters, drawer, sorting) is preserved.

import { Link, useLocation } from "react-router-dom";
import { Panel, Btn, EmptyState } from "./parts";

const SPECS: Record<string, { title: string; body: string; items: string[] }> = {
  models: { title: "Model Registry", body: "Full registry administration: deployment registration, tenant eligibility, capability declarations, versioning and retirement.", items: ["Deployment inventory and lifecycle", "Tenant context and cost caps", "Capability and modality declarations", "Version promotion and retirement"] },
  providers: { title: "Providers & Credentials", body: "Provider onboarding, authentication, network route, quota management and credential rotation.", items: ["Provider registration and gateways", "Vault credential references and rotation", "Regional deployment mapping", "Quota thresholds and alerts"] },
  policies: { title: "Routing Policies", body: "Authoring, simulation, versioning and publication of routing policies and scoring strategies.", items: ["Policy authoring and simulation", "Composite score weighting", "Fallback chain definition", "Conflict detection and resolution"] },
  guardrails: { title: "Safety & Guardrails", body: "Pre- and post-invocation control configuration, thresholds, interventions and exception review.", items: ["Guardrail configuration", "Threshold tuning", "Intervention review queue", "Per-domain overrides"] },
  evaluations: { title: "Evaluations", body: "Evaluation suites, golden datasets, human review, regression tracking and score publication.", items: ["Suite and dataset management", "Human review workflow", "Regression gates", "Score publication and history"] },
  cost: { title: "Cost & Performance", body: "Budgets, cost ceilings, token policies, latency objectives and spend analytics.", items: ["Budget and ceiling configuration", "Token and output limits", "Latency objectives", "Spend analytics and forecasting"] },
  access: { title: "Access & Security", body: "Administrative roles, entitlement mapping, service identities and configuration audit.", items: ["Role and permission model", "Service identities", "Entitlement trace", "Configuration audit ledger"] },
  settings: { title: "Settings", body: "Tenant defaults for routing behaviour, decision caching, telemetry and escalation.", items: ["Routing defaults", "Decision cache behaviour", "Telemetry and retention", "Notification and escalation routing"] },
};

export default function ModelsRoutingPlaceholder() {
  const { pathname, search } = useLocation();
  const key = pathname.split("/").pop() ?? "";
  const spec = SPECS[key] ?? { title: "Section", body: "This section is prepared for a subsequent build prompt.", items: [] };

  return (
    <div className="space-y-4">
      <Panel title={spec.title} subtitle="Prepared for implementation — filters, selection and drawer parameters are preserved across sections."
        actions={<Btn><Link to={{ pathname: "/models-routing/overview", search }}>Back to Overview</Link></Btn>}>
        <p className="text-[12.5px] leading-relaxed text-slate-700">{spec.body}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {spec.items.map((i) => (
            <li key={i} className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-[12px] text-slate-700">{i}</li>
          ))}
        </ul>
        <div className="mt-3">
          <EmptyState title={`${spec.title} configuration not yet published`}
            body="The tenant model control plane is fully inspectable on the Overview section. This administration surface will expose the same objects with full editing controls." />
        </div>
      </Panel>
    </div>
  );
}
