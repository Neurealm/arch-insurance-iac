/**
 * Agentic SRE NOC — module page registry.
 *
 * Single source of truth for the module's routes, titles and navigation
 * grouping. The layout, router and page shell all read from this table.
 */

export interface NocPageMeta {
  /** Route slug relative to /agentic-sre-noc (empty string = landing route). */
  slug: string;
  title: string;
  group: string;
}

export const nocGroups = [
  "Overview",
  "Operational Intelligence",
  "Incident Operations",
  "Agentic Action",
  "Reliability and Value",
] as const;

export const nocPages: NocPageMeta[] = [
  { slug: "", title: "Global Optical Operations Center", group: "Overview" },
  { slug: "customer-service-health", title: "Customer Service Health Explorer", group: "Overview" },
  { slug: "service-topology", title: "Global Optical Service Topology", group: "Operational Intelligence" },
  { slug: "predictive-link-risk", title: "Predictive Link Risk Center", group: "Operational Intelligence" },
  { slug: "situation-room", title: "Active Situation Room", group: "Incident Operations" },
  { slug: "investigation", title: "Agentic Investigation Workspace", group: "Incident Operations" },
  { slug: "approvals", title: "Human Approval and Action Center", group: "Agentic Action" },
  { slug: "recovery", title: "Autonomous Recovery Monitor", group: "Agentic Action" },
  { slug: "slo-error-budget", title: "SLO and Error Budget Command Center", group: "Reliability and Value" },
  { slug: "executive-value", title: "Executive Reliability and Value Brief", group: "Reliability and Value" },
];

export const NOC_BASE = "/agentic-sre-noc";

export const nocPath = (slug: string) => (slug ? `${NOC_BASE}/${slug}` : NOC_BASE);
