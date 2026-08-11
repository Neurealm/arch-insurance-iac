// Placeholder containers for Context / Evidence Layer sections scheduled for
// subsequent build prompts. They preserve URL state and explain what will be
// administered here.

import { useLocation } from "react-router-dom";
import { Panel, Btn, EmptyState } from "./parts";
import { Link } from "react-router-dom";

const SPECS: Record<string, { title: string; body: string; items: string[] }> = {
  sources: { title: "Sources & Connectors", body: "Full connector lifecycle administration: registration, credentials, scope, scheduling, discovery and decommissioning.", items: ["Connector inventory and lifecycle", "Credential and rotation management", "Ingestion scheduling and checkpoints", "Discovery scope and exclusions"] },
  "data-model": { title: "Data Model & Schemas", body: "Canonical schema registry, source-to-canonical mappings, entity definitions and versioned schema evolution.", items: ["Canonical schema registry", "Source → canonical mapping editor", "Entity and relationship definitions", "Schema version and conflict resolution"] },
  indexing: { title: "Indexing & Storage", body: "Index topology, embedding model pinning, replication, optimization windows and storage budgets.", items: ["Vector, graph, keyword, relational and temporal indexes", "Embedding model and reindex policy", "Replication and retention", "Optimization scheduling"] },
  policies: { title: "Policies & Governance", body: "Authoring and enforcement of access, classification, retention, masking, usage, eligibility, provenance and freshness policies.", items: ["Policy authoring and simulation", "Enforcement pipeline", "Approval workflow", "Policy conflict detection"] },
  quality: { title: "Quality & Lineage", body: "Quality rules, dimension weighting, exception queues and end-to-end evidence lineage inspection.", items: ["Quality rule configuration", "Dimension weighting", "Exception triage", "Lineage graph explorer"] },
  access: { title: "Access & Security", body: "Administrative roles, entitlement mapping, service identities and evidence-level permission tracing.", items: ["Role and permission model", "Service identities", "Entitlement trace", "Break-glass and JIT access"] },
  settings: { title: "Settings", body: "Tenant defaults for context assembly, token budgets, retrieval mix and platform behaviour.", items: ["Assembly defaults", "Token budget and cost controls", "Retriever mix", "Notification and escalation routing"] },
};

export default function ContextEvidencePlaceholder() {
  const { pathname, search } = useLocation();
  const key = pathname.split("/").pop() ?? "";
  const spec = SPECS[key] ?? { title: "Section", body: "This section is prepared for a subsequent build prompt.", items: [] };

  return (
    <div className="space-y-4">
      <Panel title={spec.title} subtitle="Prepared for implementation — URL state, filters and drawer parameters are preserved across sections."
        actions={<Btn><Link to={{ pathname: "/context-evidence/overview", search }}>Back to Overview</Link></Btn>}>
        <p className="text-[12.5px] leading-relaxed text-slate-700">{spec.body}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {spec.items.map((i) => (
            <li key={i} className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-[12px] text-slate-700">{i}</li>
          ))}
        </ul>
        <div className="mt-3">
          <EmptyState title={`${spec.title} configuration not yet published`}
            body="The tenant evidence plane is fully configured on the Overview section. This administration surface will expose the same objects with full editing controls."
            cta="Inspect on Overview" />
        </div>
      </Panel>
    </div>
  );
}
