/**
 * Stage 3 — candidate module discovery.
 *
 * A candidate module is proposed only where several independent signals agree:
 * a route grouping, a source grouping, a navigation grouping and — where it
 * exists — real database, workflow, integration or agent usage.
 *
 * A navigation heading on its own is never sufficient. Readiness is computed
 * from the evidence, not asserted.
 */

import { APPLICATION_ROUTES } from "./generated/routeTable";
import { IMPLEMENTATION_INVENTORY, NAVIGATION_ENTRIES } from "./generated/implementationInventory";
import { DOMAIN_SIGNALS } from "./generated/domainSignals";
import { getModules } from "./registry";
import { PLATFORM_CAPABILITIES } from "./platform/platformCapabilities";
import { SHARED_CAPABILITIES } from "./shared/sharedCapabilities";
import type { ConfidenceLevel } from "./types";
import type { CandidateModule, CandidateReadiness, DomainSignal } from "./classificationTypes";

interface CandidateSeed {
  id: string;
  name: string;
  businessPurpose: string;
  /** Source path patterns; must mirror scripts/scan-domain-signals.mjs. */
  sourcePatterns: readonly RegExp[];
  /** Declared route prefixes, used for route grouping. */
  routePrefixes: readonly string[];
  majorCapabilities: readonly string[];
  boundaryRisks: readonly string[];
  /** Set when a human decision is required regardless of the evidence. */
  forceReview?: CandidateReadiness;
}

const SEEDS: readonly CandidateSeed[] = [
  {
    id: "commercial",
    name: "Commercial Digital Twin",
    businessPurpose:
      "Model, govern and release the commercial case for a deal: volumes, revenue, cost, P&L, cash, scenarios, sensitivity and model activation.",
    sourcePatterns: [/^src\/commercial\//, /^src\/features\/commercial-guide\//],
    routePrefixes: ["/commercial"],
    majorCapabilities: [
      "Scenario and portfolio management",
      "Revenue, P&L and cash engines",
      "Governed assumption editing",
      "Scenario comparison and sensitivity analysis",
      "Model release and activation lineage",
      "Program and staffing timelines",
      "Contextual page guide",
    ],
    boundaryRisks: [
      "src/features/commercial-guide/ sits outside src/commercial/ and is registered as a shared capability",
      "Four parameterised detail routes are intentionally absent from navigation",
    ],
  },
  {
    id: "runops",
    name: "S.E.A.D. RunOps",
    businessPurpose:
      "Operate a customer estate: service portfolio, digital twins, topology, shift handover and AI-assisted operations.",
    sourcePatterns: [/^src\/runops\//],
    routePrefixes: ["/runops"],
    majorCapabilities: [
      "Service portfolio and service digital twins",
      "Topology exploration",
      "Shift handover",
      "Ask Nova assistance",
      "Tenant profile management",
    ],
    boundaryRisks: [
      "Route family is generated at runtime, so part of the boundary cannot be statically resolved",
      "Duplicates shared scenario-state and investigation concepts with its own implementations",
      "No database usage observed: the entire surface is client-side",
    ],
  },
  {
    id: "avep",
    name: "AI VLSI Engineering Platform",
    businessPurpose:
      "Represent the silicon engineering lifecycle: requirements, specification, RTL, verification, coverage closure, sign-off and release packaging.",
    sourcePatterns: [/^src\/avep\//, /^src\/silicon\//],
    routePrefixes: ["/avep", "/ai-vlsi-engineering"],
    majorCapabilities: [
      "Engineering context and program view",
      "Design and RTL generation surfaces",
      "Verification factory and failure diagnosis",
      "Readiness, sign-off and release packaging",
      "AI value governance",
    ],
    boundaryRisks: [
      "Implementation is split across two source roots (src/avep and src/silicon)",
      "Routes are generated from a navigation manifest, producing one unresolvable route family",
      "No database usage observed: canonical data is a static fixture",
    ],
  },
  {
    id: "cae",
    name: "Contextual Audio Enrichment",
    businessPurpose:
      "Provide governed, versioned narration across the product, with speech profiles, placements, pronunciation rules and playback analytics.",
    sourcePatterns: [/^src\/platform\/cae\//],
    routePrefixes: ["/platform/audio"],
    majorCapabilities: [
      "Narrative authoring and versioning",
      "Approval, publishing and retirement lifecycle",
      "Placement and profile administration",
      "Dynamic variable resolution",
      "Playback analytics",
    ],
    boundaryRisks: [
      "Lives under src/platform/, so it reads as platform-owned while behaving as a shared capability with its own lifecycle",
    ],
    forceReview: "requires-product-owner-review",
  },
  {
    id: "practice-library",
    name: "Practice Library",
    businessPurpose: "Reference library of delivery practices, patterns and playbooks.",
    sourcePatterns: [/^src\/pages\/practice-library\//],
    routePrefixes: ["/practice-library"],
    majorCapabilities: ["Practice catalogue", "Practice detail pages"],
    boundaryRisks: ["No database usage; entirely static content"],
  },
  {
    id: "coworkers",
    name: "Digital Coworkers",
    businessPurpose:
      "Catalogue and control surfaces for digital coworkers across SRE, infrastructure, IAM, vulnerability management and service desk domains.",
    sourcePatterns: [/^src\/pages\/coworkers\//, /^src\/pages\/Coworkers/, /^src\/components\/coworkers\//],
    routePrefixes: ["/coworkers"],
    majorCapabilities: [
      "Coworker catalogue by domain",
      "Coworker network view",
      "Domain control rooms",
    ],
    boundaryRisks: [
      "Overlaps conceptually with the SRE module's AI Coworker Control Room",
      "Pages exist both under src/pages/coworkers/ and as flat src/pages/Coworkers*.tsx files",
      "Named agents are catalogue content; no agent runtime exists",
    ],
  },
  {
    id: "sre-data-orchestration",
    name: "SRE Data Orchestration Twin",
    businessPurpose: "Represent data pipelines and orchestration supporting reliability operations.",
    sourcePatterns: [/^src\/pages\/data-orchestration-twin\//],
    routePrefixes: ["/data-orchestration-twin"],
    majorCapabilities: ["Orchestration topology", "Pipeline detail views"],
    boundaryRisks: [
      "Appears under the SRE navigation group but is implemented as an independent nested route tree",
      "Ownership relative to the registered SRE module is undecided",
    ],
    forceReview: "requires-product-owner-review",
  },
  {
    id: "agentic-ai-studio",
    name: "Agentic AI Architecture Studio",
    businessPurpose:
      "Design-time studio for agentic AI architectures: readiness assessment, resource estimation and integration design.",
    sourcePatterns: [/^src\/pages\/neurealm-agentic-ai\//],
    routePrefixes: ["/neurealm-agentic-ai"],
    majorCapabilities: ["Readiness assessment", "Resource estimation", "Integration design"],
    boundaryRisks: [
      "Sits inside the Digital Coworkers navigation group, so its boundary against `coworkers` is unclear",
      "No agent execution runtime; the studio is a design surface",
    ],
  },
  {
    id: "carve-out",
    name: "Carve-Out Command Centers",
    businessPurpose:
      "Day-1 separation command centres for cloud, infrastructure and end-user computing during a carve-out.",
    sourcePatterns: [/^src\/pages\/carve-out\//, /^src\/data\/carveout/, /^src\/components\/carveout\//],
    routePrefixes: ["/carve-out"],
    majorCapabilities: [
      "Cloud transformation command centre",
      "Infrastructure separation command centre",
      "Workforce readiness command centre",
    ],
    boundaryRisks: [
      "~70 deep routes reached only through a dynamic /carve-out/:group/:slug route",
      "Content is driven from a single static data file",
    ],
  },
  {
    id: "questionnaires",
    name: "Questionnaires and Evidence Collection",
    businessPurpose:
      "Author, distribute and collect questionnaire responses with evidence attachments, including public share links.",
    sourcePatterns: [/questionnaire/i],
    routePrefixes: ["/questionnaires"],
    majorCapabilities: [
      "Questionnaire authoring",
      "Response collection and scoring",
      "Evidence attachment",
      "Public share links",
    ],
    boundaryRisks: [
      "Implementation is spread across src/pages, src/components and src/hooks with no single root",
      "Shares the evidence / evidence_files tables with other surfaces",
    ],
  },
  {
    id: "crm",
    name: "Customer and Stakeholder Management",
    businessPurpose:
      "Company, stakeholder and engagement records supporting tenant onboarding and account management.",
    sourcePatterns: [/^src\/(pages|components|hooks)\/crm\//],
    routePrefixes: ["/crm"],
    majorCapabilities: ["Company records", "Stakeholder register", "Promotion to tenant"],
    boundaryRisks: [
      "Overlaps platform tenant administration (promote-to-tenant writes tenant data)",
      "Touches 19 tables, several of which belong to other domains",
    ],
  },
  {
    id: "etdm",
    name: "Enterprise Technology Domain Model",
    businessPurpose:
      "Maintain the technology taxonomy: domains, technologies and their audited change history.",
    sourcePatterns: [/etdm/i],
    routePrefixes: ["/admin/technology-taxonomy"],
    majorCapabilities: ["Domain administration", "Technology administration", "Auto-build domains"],
    boundaryRisks: [
      "Routes live under /admin, which reads as platform administration",
      "Maintains its own audit table instead of the platform audit stream",
    ],
  },
  {
    id: "itsm",
    name: "IT Service Desk and ITSM",
    businessPurpose:
      "Service-desk operations surfaces including automated ticket categorization for a service desk manager.",
    sourcePatterns: [/^src\/pages\/itsm\//],
    routePrefixes: ["/itsm"],
    majorCapabilities: ["Service desk coworker catalogue", "Auto ticket categorization operations"],
    boundaryRisks: [
      "Reached from the Digital Coworkers surface; boundary against `coworkers` undecided",
      "No ITSM system integration exists",
    ],
  },
];

const matchesCluster = (ref: string, patterns: readonly RegExp[]) =>
  patterns.some((p) => p.test(ref));

const signalFor = (id: string): DomainSignal | undefined =>
  DOMAIN_SIGNALS.find((s) => s.clusterId === id);

function readiness(
  seed: CandidateSeed,
  metrics: CandidateModule["metrics"],
  routes: readonly string[],
  risks: readonly string[],
): { readiness: CandidateReadiness; confidence: ConfidenceLevel } {
  if (metrics.routeCount === 0 && metrics.fileCount < 3) {
    return { readiness: "insufficient-evidence", confidence: "low" };
  }
  if (seed.forceReview) {
    return { readiness: seed.forceReview, confidence: "medium" };
  }
  const prefixed = routes.every((r) => seed.routePrefixes.some((p) => r.startsWith(p)));
  const multipleSourceRoots = seed.sourcePatterns.length > 1;

  if (!prefixed || multipleSourceRoots) {
    return { readiness: "requires-architecture-cleanup", confidence: "medium" };
  }
  if (metrics.routeCount >= 3 && metrics.fileCount >= 10 && metrics.navigationCount > 0) {
    return {
      readiness: risks.length > 2 ? "register-with-warnings" : "ready-to-register",
      confidence: metrics.supabaseFileCount > 0 ? "high" : "medium",
    };
  }
  return { readiness: "register-with-warnings", confidence: "medium" };
}

export function discoverCandidateModules(): readonly CandidateModule[] {
  const registered = new Set(getModules().map((m) => m.identity.moduleId));
  const sharedPaths = SHARED_CAPABILITIES.flatMap((c) => c.sourcePaths);
  const platformPaths = PLATFORM_CAPABILITIES.flatMap((c) => c.sourcePaths);

  return SEEDS.filter((s) => !registered.has(s.id)).map((seed) => {
    const files = IMPLEMENTATION_INVENTORY.filter(
      (i) =>
        matchesCluster(i.ref, seed.sourcePatterns) &&
        !platformPaths.some((p) => i.ref.startsWith(p) && !matchesCluster(p, seed.sourcePatterns)),
    );
    const routes = APPLICATION_ROUTES.filter(
      (r) =>
        (r.componentFile && matchesCluster(r.componentFile, seed.sourcePatterns)) ||
        seed.routePrefixes.some((p) => r.path === p || r.path.startsWith(`${p}/`)),
    ).map((r) => r.path);
    const uniqueRoutes = [...new Set(routes)].sort();
    const nav = NAVIGATION_ENTRIES.filter((n) =>
      uniqueRoutes.includes(n.to) || seed.routePrefixes.some((p) => n.to.startsWith(p)),
    );
    const signal = signalFor(seed.id);

    const metrics = {
      routeCount: uniqueRoutes.length,
      fileCount: files.length,
      navigationCount: nav.length,
      supabaseFileCount: signal?.supabaseFileCount ?? 0,
    };

    const evidence = [
      `${metrics.fileCount} implementation files in the source cluster`,
      `${metrics.routeCount} routes registered in src/App.tsx`,
      `${metrics.navigationCount} navigation entries target the route family`,
      signal && signal.databaseEntities.length
        ? `${signal.databaseEntities.length} database entities: ${signal.databaseEntities.slice(0, 6).join(", ")}${signal.databaseEntities.length > 6 ? "…" : ""}`
        : "No database entities observed",
      signal && signal.edgeFunctions.length
        ? `Edge functions: ${signal.edgeFunctions.join(", ")}`
        : "No edge functions observed",
      signal && signal.rpcFunctions.length
        ? `${signal.rpcFunctions.length} RPC functions invoked`
        : "No RPC usage observed",
    ];

    const risks = [
      ...seed.boundaryRisks,
      ...(metrics.navigationCount === 0
        ? ["No navigation entry targets this route family — reachability is unverified"]
        : []),
    ];

    const { readiness: r, confidence } = readiness(seed, metrics, uniqueRoutes, risks);

    return {
      proposedModuleId: seed.id,
      proposedName: seed.name,
      businessPurpose: seed.businessPurpose,
      routeBoundaries: uniqueRoutes,
      sourceBoundaries: seed.sourcePatterns.map((p) => p.source),
      navigationBoundaries: nav.map((n) => n.navId ?? n.to),
      majorCapabilities: seed.majorCapabilities,
      databaseEntities: signal?.databaseEntities ?? [],
      workflows: signal?.workflowRefs ?? [],
      integrations: signal?.integrationRefs ?? [],
      aiAgents: signal?.agentRefs ?? [],
      sharedDependencies: SHARED_CAPABILITIES.filter((c) =>
        c.consumingModules.includes(seed.id),
      ).map((c) => c.sharedCapabilityId),
      platformDependencies: PLATFORM_CAPABILITIES.filter((c) =>
        c.consumingModules.includes(seed.id),
      ).map((c) => c.platformCapabilityId),
      confidence,
      evidence: [
        ...evidence,
        ...(sharedPaths.some((p) => files.some((f) => f.ref.startsWith(p)))
          ? ["Cluster overlaps a registered shared capability; overlapping files stay shared"]
          : []),
      ],
      boundaryRisks: risks,
      readiness: r,
      metrics,
    };
  });
}

export const candidateById = (id: string) =>
  discoverCandidateModules().find((c) => c.proposedModuleId === id);
