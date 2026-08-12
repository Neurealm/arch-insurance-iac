// Canonical left-rail navigation shared by every neugain.io administration plane.
// Each plane renders the same ordered set of peer links; the active plane is
// omitted from the peer list because it is rendered as the expanded branch.

import {
  Users, Database, Cpu, Workflow, Bot, Wallet, FileSearch, Settings,
} from "lucide-react";

export type AdminPlaneId =
  | "iam" | "context" | "models" | "orchestration" | "coworkers" | "finops";

export type RailItem = { id: string; label: string; icon: any; to: string };

/** Ordered peer navigation shown at the top of every administration rail. */
export const ADMIN_PLANES: RailItem[] = [
  { id: "iam", label: "Identity & Access", icon: Users, to: "/iam-admin/overview" },
  { id: "context", label: "Context / Evidence Layer", icon: Database, to: "/context-evidence/overview" },
  { id: "models", label: "Models & Routing", icon: Cpu, to: "/models-routing/overview" },
  { id: "orchestration", label: "Agent Orchestration", icon: Workflow, to: "/agent-orchestration/overview" },
  { id: "coworkers", label: "Agents & Coworkers", icon: Bot, to: "/iam-admin/digital-coworkers" },
  { id: "finops", label: "AI Cost Management", icon: Wallet, to: "/finops-admin/overview" },
];


/**
 * Peer planes rendered above the active plane's expanded branch.
 * `active` is removed so a plane never links to itself in the peer list.
 */
export function railTop(active: AdminPlaneId): RailItem[] {
  return ADMIN_PLANES.filter((p) => p.id !== active);
}

/** Cross-cutting links rendered below the active plane's branch. */
export function railBottom(opts: { auditTo: string; settingsTo: string }): RailItem[] {
  return [
    { id: "workflows", label: "Workflows", icon: Workflow, to: "/agent-orchestration/workflows" },
    { id: "audit", label: "Audit & Compliance", icon: FileSearch, to: opts.auditTo },
    { id: "settings", label: "Settings", icon: Settings, to: opts.settingsTo },
  ];
}
