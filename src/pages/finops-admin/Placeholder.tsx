// Placeholder shells for FinOps administration sections scheduled for later
// build prompts. URL state (filters, drawer, selection) is preserved.

import { Link, useLocation } from "react-router-dom";
import { Panel, Btn } from "./parts";

const SPECS: Record<string, { title: string; body: string; items: string[] }> = {
  "cost-policies": {
    title: "Cost Policies",
    body: "Authoring, simulation, versioning and publication of budget guardrails, approval gates, execution risk, commitment, anomaly, minimum-savings, confidence and autonomy policies.",
    items: ["Policy authoring and simulation", "Threshold and scope configuration", "Approval routing and expiry", "Version history and publication"],
  },
  "cloud-accounts": {
    title: "Cloud Accounts",
    body: "Onboarding and health administration for provider accounts, subscriptions, projects, clusters and telemetry sources feeding the cost model.",
    items: ["Connector registration and credentials", "Billing export configuration", "Sync schedule and failure escalation", "Coverage and telemetry diagnostics"],
  },
  "optimization-registry": {
    title: "Optimization Registry",
    body: "Full registry administration: detection method configuration, deduplication, suppression rules, scoring weights and bulk disposition of opportunities.",
    items: ["Detection method configuration", "Deduplication and suppression rules", "Scoring weight administration", "Bulk disposition and batching"],
  },
  "unit-economics": {
    title: "Unit Economics",
    body: "Definition and governance of demand drivers, allocation rules, normalization logic and published unit-cost models per service and application.",
    items: ["Demand driver definition", "Allocation and shared-cost rules", "Seasonality and mix normalization", "Model publication and Finance sign-off"],
  },
  "approval-execution": {
    title: "Approval & Execution",
    body: "Approval queues, delegation, change-window administration, execution channel bindings and in-flight change tracking.",
    items: ["Approval queue and delegation", "Change window and freeze calendar", "Execution channel bindings", "In-flight change and rollback tracking"],
  },
  "savings-validation": {
    title: "Savings Validation",
    body: "Validation rule administration, billing reconciliation, demand normalization, dispute handling and realized-savings publication to Finance.",
    items: ["Validation rule configuration", "Billing reconciliation runs", "Dispute queue and resolution", "Realized savings publication"],
  },
  evaluations: {
    title: "Evaluations",
    body: "Recommendation quality scoring, projected-versus-realized variance analysis, rollback analysis and detection method regression comparison.",
    items: ["Projected vs realized variance", "Detection method regression", "Rollback and rejection analysis", "Confidence recalibration history"],
  },
  "access-security": {
    title: "Access & Security",
    body: "Role administration, execution authority, credential references, just-in-time elevation and audit of privileged cost actions.",
    items: ["Role and permission administration", "Execution authority assignment", "Credential reference and rotation", "Privileged action audit"],
  },
  settings: {
    title: "Settings",
    body: "Tenant defaults for currency, fiscal calendar, amortization treatment, retention, notification routing and administrative roles.",
    items: ["Currency and fiscal calendar", "Amortization and cost view defaults", "Retention and audit settings", "Notification and escalation routing"],
  },
};

export default function FinOpsAdminPlaceholder() {
  const { pathname, search } = useLocation();
  const key = pathname.split("/").pop() ?? "";
  const spec = SPECS[key] ?? { title: "Section", body: "This section is prepared for a subsequent build prompt.", items: [] };

  return (
    <div className="space-y-4">
      <Panel
        title={spec.title}
        subtitle="Prepared for implementation — filters, selection and drawer parameters are preserved across sections."
        actions={<Btn><Link to={{ pathname: "/finops-admin/overview", search }}>Back to Overview</Link></Btn>}
      >
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
