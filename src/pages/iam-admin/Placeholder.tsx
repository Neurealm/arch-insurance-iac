// Placeholder shells for IAM administration sections scheduled for later build
// prompts. URL state (filters, drawer, selection) is preserved.

import { Link, useLocation } from "react-router-dom";
import { Panel, Btn } from "./parts";

const SPECS: Record<string, { title: string; body: string; items: string[] }> = {
  identities: {
    title: "Identities",
    body: "Unified inventory of digital coworkers, human users, service accounts, workload identities and API clients with lifecycle state, ownership and posture.",
    items: ["Lifecycle state administration", "Owner resolution and attestation", "Bulk suspension and reinstatement", "Identity merge and deprecation"],
  },
  "digital-coworkers": {
    title: "Digital Coworkers",
    body: "Registration and governance of non-human coworker identities including trust mechanism, role assignment, data domain scope, tool authority and autonomy boundaries.",
    items: ["Coworker registration and approval", "Role and domain scope assignment", "Tool and model capability entitlement", "Autonomy ceiling configuration"],
  },
  roles: {
    title: "Roles & Permissions",
    body: "Role authoring, permission composition, explicit deny sets, classification ceilings, session controls, version comparison and effective permission calculation.",
    items: ["Role authoring and cloning", "Granular permission composition", "Effective permission calculation", "Version comparison and rollback"],
  },
  policies: {
    title: "Access Policies",
    body: "Authoring, simulation, priority resolution, conflict detection, versioning and publication of attribute-based access policies evaluated at execution time.",
    items: ["Policy authoring and simulation", "Condition and attribute configuration", "Conflict detection and priority", "Publication and rollback"],
  },
  delegation: {
    title: "Delegation & JIT",
    body: "Administration of delegated authority, just-in-time privilege requests, approval routing, bounded duration and automatic revocation at expiry.",
    items: ["Delegation grant administration", "JIT request and approval routing", "Duration and scope ceilings", "Automatic expiry and revocation audit"],
  },
  credentials: {
    title: "Credentials & Sessions",
    body: "Credential posture across federation, workload identity, certificates and persistent secrets, with rotation policy, session controls and revocation.",
    items: ["Credential method inventory", "Rotation policy and overdue tracking", "Session ceiling and replay protection", "Immediate revocation controls"],
  },
  reviews: {
    title: "Access Reviews",
    body: "Recertification campaign administration, reviewer assignment, decision capture with reason, exception handling and evidence retention.",
    items: ["Campaign creation and scheduling", "Reviewer assignment and reminders", "Decision capture and reasons", "Exception expiry and re-review"],
  },
  audit: {
    title: "Audit & Evidence",
    body: "Retained authorization decisions, delegation records, policy changes, credential events and review outcomes with correlation to workflow execution.",
    items: ["Decision record search and export", "Correlation to workflow execution", "Retention policy administration", "Evidence packaging for audit"],
  },
  settings: {
    title: "Settings",
    body: "Tenant defaults for trust mechanisms, session ceilings, review cadence, posture weighting, notification routing and administrative roles.",
    items: ["Default trust and session policy", "Posture weighting configuration", "Review cadence defaults", "Administrative role assignment"],
  },
};

export default function IamAdminPlaceholder() {
  const { pathname, search } = useLocation();
  const key = pathname.split("/").pop() ?? "";
  const spec = SPECS[key] ?? { title: "Section", body: "This section is prepared for a subsequent build prompt.", items: [] };

  return (
    <div className="space-y-4">
      <Panel
        title={spec.title}
        subtitle="Prepared for implementation — filters, selection and drawer parameters are preserved across sections."
        actions={<Btn><Link to={{ pathname: "/iam-admin/overview", search }}>Back to Overview</Link></Btn>}
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
