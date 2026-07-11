/**
 * Central route table for RunOps Runbooks.
 *
 * Every route in the RunOps foundation is registered here with its title,
 * navigation section, expected entity context, and development status.
 * Sidebar, breadcrumbs, placeholder pages, and the App router all read from
 * this table so metadata stays in one place.
 *
 * All paths are relative to the /runops mount point.
 */

export type NavSection =
  | "Command"
  | "Services"
  | "Runbooks"
  | "Operations"
  | "Incidents"
  | "Digital Workers"
  | "Reliability"
  | "Knowledge"
  | "Analytics"
  | "Governance"
  | "Integrations"
  | "Platform";

export type DevStatus = "Built" | "Scaffolded" | "Planned";

export interface RouteMeta {
  /** react-router path relative to /runops (no leading slash for children). */
  path: string;
  /** Absolute path including /runops mount. */
  absolutePath: string;
  title: string;
  section: NavSection;
  /** Entity context this page expects (service, incident, execution, etc.). */
  entityContext: string;
  status: DevStatus;
  /** True when this is the section's default/landing route. */
  isSectionLanding?: boolean;
  /** True to include in the left sidebar nav. */
  navPrimary?: boolean;
}

const R = (
  path: string,
  section: NavSection,
  title: string,
  entityContext: string,
  status: DevStatus,
  opts: Partial<Pick<RouteMeta, "isSectionLanding" | "navPrimary">> = {},
): RouteMeta => ({
  path,
  absolutePath: path === "" ? "/runops" : `/runops/${path}`,
  section,
  title,
  entityContext,
  status,
  ...opts,
});

export const routes: RouteMeta[] = [
  // Command
  R("",         "Command", "Experience Entry", "Tenant + persona journeys",         "Built"),
  R("command",  "Command", "Command Center",   "Tenant + primary business service", "Built", { isSectionLanding: true, navPrimary: true }),

  // Services
  R("services",                              "Services", "Service Portfolio",            "Reliability + readiness view of the catalog", "Built", { isSectionLanding: true, navPrimary: true }),
  R("services/:serviceId",                   "Services", "Service Detail",               "Selected service",                       "Built"),
  R("services/:serviceId/topology",          "Services", "Service Topology",             "Selected service + components + dependencies", "Built"),
  R("services/:serviceId/observability",     "Services", "Service Observability",        "Selected service + telemetry sources",   "Built"),
  R("services/:serviceId/readiness",         "Services", "Service Readiness",            "Selected service + runbook coverage",    "Built"),

  // Runbooks
  R("runbooks",                              "Runbooks", "Runbook Library",              "All runbooks in tenant",                 "Built", { isSectionLanding: true, navPrimary: true }),
  R("runbooks/new",                          "Runbooks", "New Runbook",                  "Draft runbook",                          "Planned"),
  R("runbooks/fitness",                      "Runbooks", "Runbook Fitness",              "All runbooks + fitness scores",          "Planned"),
  R("runbooks/:runbookId",                   "Runbooks", "Runbook Detail",               "Selected runbook",                       "Built"),
  R("runbooks/:runbookId/designer",          "Runbooks", "Runbook Designer",             "Selected runbook + steps",               "Planned"),
  R("runbooks/:runbookId/steps/:stepId",     "Runbooks", "Runbook Step",                 "Selected runbook + step",                "Planned"),
  R("runbooks/:runbookId/policy",            "Runbooks", "Runbook Policy",               "Selected runbook + autonomy policy",     "Planned"),
  R("runbooks/:runbookId/recovery",          "Runbooks", "Runbook Recovery Paths",       "Selected runbook + rollback branches",   "Planned"),
  R("runbooks/:runbookId/test",              "Runbooks", "Runbook Test Harness",         "Selected runbook + test fixtures",       "Planned"),
  R("runbooks/:runbookId/release",           "Runbooks", "Runbook Release",              "Selected runbook + version history",     "Planned"),
  R("runbooks/:runbookId/triggers",          "Runbooks", "Runbook Triggers",             "Selected runbook + trigger bindings",    "Planned"),
  R("runbooks/:runbookId/launch",            "Runbooks", "Launch Runbook",               "Selected runbook + execution parameters", "Planned"),

  // Operations
  R("operations/queue",                      "Operations", "Operations Queue",           "All active executions and approvals",    "Built",     { isSectionLanding: true, navPrimary: true }),
  R("operations/handoff",                    "Operations", "Shift Handoff",              "Active shift + outstanding work",        "Planned"),
  R("operations/alerts",                     "Operations", "Alerts",                     "All active alerts and correlations",     "Planned"),
  R("approvals",                             "Operations", "Approvals",                  "Pending approvals across executions",    "Planned"),
  R("executions/:executionId",               "Operations", "Execution Detail",           "Selected execution",                     "Planned"),
  R("executions/:executionId/guided",        "Operations", "Guided Execution",           "Selected execution + step guidance",     "Planned"),
  R("executions/:executionId/evidence",      "Operations", "Execution Evidence",         "Selected execution + audit evidence",    "Planned"),

  // Incidents
  R("incidents",                             "Incidents", "Incidents",                   "All incidents in tenant",                "Scaffolded", { isSectionLanding: true, navPrimary: true }),
  R("incidents/:incidentId",                 "Incidents", "Incident Detail",             "Selected incident",                      "Planned"),

  R("incidents/:incidentId/investigate",     "Incidents", "Investigation",               "Selected incident + evidence graph",     "Planned"),
  R("incidents/:incidentId/hypotheses",      "Incidents", "Hypotheses",                  "Selected incident + AI hypotheses",      "Planned"),
  R("incidents/:incidentId/remediations",    "Incidents", "Remediation Options",         "Selected incident + candidate runbooks", "Planned"),
  R("incidents/:incidentId/communications",  "Incidents", "Communications",              "Selected incident + audiences",          "Planned"),
  R("incidents/:incidentId/recovery",        "Incidents", "Recovery Validation",         "Selected incident + validation checks",  "Planned"),
  R("incidents/:incidentId/postmortem",      "Incidents", "Postmortem",                  "Selected incident + postmortem draft",   "Planned"),
  R("problems/actions",                      "Incidents", "Problem Corrective Actions",  "All open corrective actions",            "Planned"),

  // Digital Workers
  R("workers",                               "Digital Workers", "Digital Worker Fleet",     "All digital workers in tenant",         "Scaffolded", { isSectionLanding: true, navPrimary: true }),
  R("workers/:workerId/studio",              "Digital Workers", "Digital Worker Studio",    "Selected worker + capabilities",        "Planned"),
  R("workers/collaboration/:sessionId",      "Digital Workers", "Worker Collaboration",     "Selected multi-worker session",         "Planned"),
  R("automation",                            "Digital Workers", "Automation Registry",      "All automations + autonomy levels",     "Planned"),

  // Reliability
  R("reliability/slos",                      "Reliability", "SLOs & Error Budgets",       "All SLOs across services",              "Scaffolded", { isSectionLanding: true, navPrimary: true }),

  // Knowledge
  R("knowledge",                             "Knowledge", "Knowledge Base",               "Postmortems, known errors, playbooks",  "Scaffolded", { isSectionLanding: true, navPrimary: true }),

  // Analytics
  R("analytics",                             "Analytics", "Reliability Analytics",        "Trend metrics across tenant",           "Scaffolded", { isSectionLanding: true, navPrimary: true }),

  // Governance
  R("governance",                            "Governance", "Governance",                  "Policies, approvals, audit evidence",   "Scaffolded", { isSectionLanding: true, navPrimary: true }),
  R("security/execution",                    "Governance", "Execution Security",          "Least-privilege boundaries for executions", "Planned"),
  R("ai-governance",                         "Governance", "AI Governance",               "AI recommendation policy + guardrails", "Planned"),

  // Integrations
  R("integrations",                          "Integrations", "Integrations",              "Connected providers and adapters",      "Scaffolded", { isSectionLanding: true, navPrimary: true }),
  R("developer",                             "Integrations", "Developer Portal",          "APIs, SDKs, webhooks",                  "Planned"),
  R("supply-chain",                          "Integrations", "Supply Chain",              "Runbook + automation provenance",       "Planned"),

  // Platform
  R("platform",                              "Platform", "Platform Administration",       "Tenant, users, roles, feature flags",   "Scaffolded", { isSectionLanding: true, navPrimary: true }),
];

/** Ordered list of the sections that appear in the left sidebar. */
export const navSections: NavSection[] = [
  "Command", "Services", "Runbooks", "Operations", "Incidents", "Digital Workers",
  "Reliability", "Knowledge", "Analytics", "Governance", "Integrations", "Platform",
];

/** Primary sidebar landing route for a given section. */
export function sectionLanding(section: NavSection): RouteMeta {
  const found = routes.find((r) => r.section === section && r.navPrimary);
  if (!found) throw new Error(`No primary landing for section ${section}`);
  return found;
}
