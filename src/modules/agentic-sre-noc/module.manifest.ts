/**
 * Agentic SRE NOC module manifest.
 *
 * Scope: the "Agentic SRE NOC" module shell mounted at /agentic-sre-noc and
 * implemented under `src/pages/agentic-sre-noc/`.
 *
 * Evidence discipline: at this stage the module contains only the shell,
 * routes and empty pages. No Supabase client, service, API, workflow,
 * integration, agent or automation action is referenced, so none are declared
 * and no capability is marked "implemented".
 */

import { MODULE_MANIFEST_SCHEMA_VERSION, type ModuleManifest } from "../types";

const P = "src/pages/agentic-sre-noc";

export const manifest: ModuleManifest = {
  schemaVersion: MODULE_MANIFEST_SCHEMA_VERSION,
  identity: {
    moduleId: "agentic-sre-noc",
    name: "Agentic SRE NOC",
    description:
      "Agentic network operations centre surface within the SRE experience: operations centre, service health, topology, predictive risk, incident operations, agentic action and reliability value routes.",
    moduleVersion: "0.1.0",
    status: "prototype",
    businessDomain: "Site Reliability Engineering",
    productOwner: "unassigned",
    technicalOwner: "unassigned",
    identificationConfidence: "high",
  },

  boundaries: {
    sourcePaths: [P],
    routePrefixes: ["/agentic-sre-noc"],
    routes: [
      "/agentic-sre-noc",
      "/agentic-sre-noc/customer-service-health",
      "/agentic-sre-noc/service-topology",
      "/agentic-sre-noc/predictive-link-risk",
      "/agentic-sre-noc/situation-room",
      "/agentic-sre-noc/investigation",
      "/agentic-sre-noc/approvals",
      "/agentic-sre-noc/recovery",
      "/agentic-sre-noc/slo-error-budget",
      "/agentic-sre-noc/executive-value",
    ],
    navigationIds: ["agentic-sre-noc"],
    pageIds: [`${P}/NocLayout.tsx`, `${P}/NocPage.tsx`, `${P}/pages.ts`],
    componentRefs: [],
    serviceRefs: [],
    apiPrefixes: [],
    databaseEntities: [],
    workflowIds: [],
    integrationIds: [],
    aiAgentIds: [],
    automationActionIds: [],
    dashboardIds: [],
    reportIds: [],
    permissionIds: [],
  },

  capabilities: [
    {
      capabilityId: "agentic-sre-noc.module-shell",
      name: "Agentic SRE NOC Module Shell",
      description:
        "Module shell, navigation registry and ten addressable empty pages for the Agentic SRE NOC experience.",
      domain: "Site Reliability Engineering",
      subdomain: "Network Operations",
      businessPurpose:
        "Establish the navigation and routing foundation for agentic network operations content delivered in later stages.",
      primaryPersona: "SRE Practice Lead",
      secondaryPersonas: ["NOC Operator", "Client Executive"],
      implementationStatus: "static",
      relatedPages: [`${P}/NocLayout.tsx`, `${P}/NocPage.tsx`],
      relatedRoutes: ["/agentic-sre-noc"],
      relatedComponents: [],
      relatedServices: [],
      relatedWorkflows: [],
      relatedEntities: [],
      relatedApis: [],
      relatedIntegrations: [],
      relatedAgents: [],
      relatedAutomationActions: [],
      evidenceHints: [
        "src/App.tsx route /agentic-sre-noc",
        "Sidebar nav key agentic-sre-noc",
        `${P}/pages.ts navigation registry`,
      ],
      dependencies: [],
      knownLimitations: ["Shell only; pages contain no content at this stage."],
    },
  ],

  sharedOwnership: [],
  sharedDependencies: [],
  platformDependencies: [],

  exclusions: {
    sourcePaths: ["src/pages/prod-twin", "src/pages/data-orchestration-twin"],
    routes: ["/prod-resilience-twin", "/data-orchestration-twin"],
    components: [],
    capabilities: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    reason:
      "Site Resilience Engineering and SRE Data Orchestration are separate modules and are unchanged by this module.",
  },

  unableToVerify: [],
};

export default manifest;
