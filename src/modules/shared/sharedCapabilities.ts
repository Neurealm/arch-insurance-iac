/**
 * Stage 3 — shared capability registry.
 *
 * A shared capability is implementation used by more than one module. Recording
 * it here keeps it out of every module's own capability count and makes the
 * ownership question explicit rather than implicit.
 *
 * Only capabilities with observed implementation appear here. Categories that
 * the framework anticipates but the codebase does not yet contain (notifications
 * fan-out, reporting, workflow execution, operational communications) are
 * deliberately absent — see docs/modules/shared-capability-catalog.md.
 */

import type { SharedCapability } from "../classificationTypes";

export const SHARED_CAPABILITIES: readonly SharedCapability[] = [
  {
    sharedCapabilityId: "shared.operations-console-shell",
    name: "Operations Console Shell (EOC)",
    description:
      "Shell chrome shared by the SRE, coworkers, practice-library and carve-out surfaces: app shell, sidebar, top banner, persona toggle, KPI cards and service map.",
    primaryOwner: "unassigned",
    consumingModules: ["sre", "coworkers", "practice-library", "carve-out"],
    relationship: "consumes",
    sourcePaths: ["src/components/eoc/"],
    routes: [],
    components: [
      "src/components/eoc/AppShell.tsx",
      "src/components/eoc/Sidebar.tsx",
      "src/components/eoc/TopBanner.tsx",
      "src/components/eoc/KpiCard.tsx",
      "src/components/eoc/ServiceMap.tsx",
      "src/components/eoc/PersonaToggle.tsx",
    ],
    services: [],
    apis: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    evidence: [
      "33 import sites from src/pages/prod-twin/ alone",
      "Sidebar hosts navigation groups for several modules, not just SRE",
      "No module manifest declares ownership",
    ],
    evidenceStrength: "client-side-functional",
    status: "contested",
    maturity: "established",
    knownLimitations: [
      "No primary owner agreed — every consuming module registers an ownership conflict",
      "Several widgets in the folder (KpiStrip, IncidentTrend, IncidentsPanel, AIInsightRibbon, DigitalCoworkers) have zero import sites",
    ],
  },
  {
    sharedCapabilityId: "shared.persona-context",
    name: "Persona Context",
    description:
      "Cross-module persona selection (executive, operator, engineer) used to vary page framing.",
    primaryOwner: "unassigned",
    consumingModules: ["sre", "coworkers"],
    relationship: "consumes",
    sourcePaths: ["src/context/PersonaContext.tsx"],
    routes: [],
    components: ["src/components/eoc/PersonaToggle.tsx"],
    services: [],
    apis: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    evidence: [
      "React context with in-memory state only (src/context/PersonaContext.tsx)",
      "Consumed via PersonaToggle in the shared shell",
    ],
    evidenceStrength: "client-side-functional",
    status: "active",
    maturity: "emerging",
    knownLimitations: ["Persona selection is not persisted and resets on reload"],
  },
  {
    sharedCapabilityId: "shared.scenario-state",
    name: "Scenario State",
    description:
      "In-memory scenario/demo state driving the SRE enterprise cloud twin and the RunOps scenario surfaces.",
    primaryOwner: "unassigned",
    consumingModules: ["sre", "runops"],
    relationship: "consumes",
    sourcePaths: ["src/context/ScenarioStateContext.tsx", "src/components/scenario/"],
    routes: ["/enterprise-cloud-twin"],
    components: ["src/components/scenario/DemoScenarioController.tsx"],
    services: [],
    apis: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    evidence: [
      "ScenarioStateProvider wraps /enterprise-cloud-twin in src/App.tsx",
      "RunOps maintains its own ScenarioStore, so the boundary between the two is unresolved",
    ],
    evidenceStrength: "client-side-functional",
    status: "contested",
    maturity: "emerging",
    knownLimitations: [
      "Duplicated concept: src/runops/scenario/ScenarioStore.tsx implements scenario state separately",
      "No persistence",
    ],
  },
  {
    sharedCapabilityId: "shared.guided-investigation",
    name: "Guided Investigation",
    description: "Step-through investigation overlay used from SRE and RunOps screens.",
    primaryOwner: "unassigned",
    consumingModules: ["sre", "runops"],
    relationship: "consumes",
    sourcePaths: ["src/context/GuidedInvestigationContext.tsx", "src/components/investigation/"],
    routes: [],
    components: ["src/components/investigation/GuidedInvestigationMode.tsx"],
    services: [],
    apis: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    evidence: ["Single component plus context; imported from more than one page area"],
    evidenceStrength: "client-side-functional",
    status: "contested",
    maturity: "emerging",
    knownLimitations: ["No persistence; no link to any incident or workflow record"],
  },
  {
    sharedCapabilityId: "shared.evidence-graph",
    name: "Evidence Graph",
    description:
      "Client-side evidence graph rendering relationships between findings, services and signals.",
    primaryOwner: "unassigned",
    consumingModules: ["sre", "runops"],
    relationship: "consumes",
    sourcePaths: ["src/context/EvidenceGraphContext.tsx", "src/components/evidence/"],
    routes: [],
    components: ["src/components/evidence/EvidenceGraphEngine.tsx"],
    services: [],
    apis: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    evidence: ["Context plus one engine component; consumed from more than one page area"],
    evidenceStrength: "client-side-functional",
    status: "contested",
    maturity: "emerging",
    knownLimitations: [
      "Graph is built from in-memory fixtures; not connected to the evidence / evidence_files tables used by the questionnaire surface",
    ],
  },
  {
    sharedCapabilityId: "shared.contextual-audio-enrichment",
    name: "Contextual Audio Enrichment",
    description:
      "Governed narration capability: speech profiles, placements, pronunciation rules, versioned narratives and playback telemetry, embeddable on any page.",
    primaryOwner: "cae",
    consumingModules: ["commercial", "runops", "platform"],
    relationship: "consumes",
    sourcePaths: ["src/platform/cae/"],
    routes: ["/platform/audio"],
    components: [
      "src/platform/cae/components/AudioEnrichmentButton.tsx",
      "src/platform/cae/ContextualAudioProvider.tsx",
    ],
    services: ["audio_resolve_call"],
    apis: ["tts-speak"],
    databaseEntities: [
      "audio_narratives",
      "audio_narrative_versions",
      "audio_placements",
      "audio_playback_events",
      "audio_pronunciation_rules",
      "audio_speech_profiles",
      "audio_variable_definitions",
    ],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: ["audio.*"],
    evidence: [
      "7 audio_* tables and 11 RPC calls observed in src/platform/cae/",
      "Rollout tests cover Commercial and RunOps placements (src/platform/cae/rollout.test.tsx)",
      "Global mount in src/App.tsx",
    ],
    evidenceStrength: "database-backed",
    status: "active",
    maturity: "hardened",
    knownLimitations: [
      "Playback uses the browser SpeechSynthesis API; audio fidelity varies by client",
    ],
  },
  {
    sharedCapabilityId: "shared.commercial-guide",
    name: "Contextual Page Guide",
    description:
      "Drawer-based page walkthrough framework with per-page content and anchored targets. Currently deployed on Commercial pages only, but implemented as a reusable engine.",
    primaryOwner: "commercial",
    consumingModules: ["commercial"],
    relationship: "extends",
    sourcePaths: ["src/features/commercial-guide/"],
    routes: [],
    components: [
      "src/features/commercial-guide/CommercialGuideButton.tsx",
      "src/features/commercial-guide/CommercialGuideEdgeTab.tsx",
    ],
    services: [],
    apis: [],
    databaseEntities: [],
    workflows: [],
    integrations: [],
    agents: [],
    permissions: [],
    evidence: [
      "Reusable walkthrough engine with per-page content modules and a cross-page test suite",
      "Only one consuming module today, so 'shared' is potential rather than realised",
    ],
    evidenceStrength: "client-side-functional",
    status: "proposed",
    maturity: "established",
    knownLimitations: [
      "Naming and folder are Commercial-specific; adopting it elsewhere needs a rename",
      "Single consumer — does not yet meet the strict 'used by more than one module' bar",
    ],
  },
];

export const getSharedCapability = (id: string) =>
  SHARED_CAPABILITIES.find((c) => c.sharedCapabilityId === id);

/** Shared capabilities with no agreed owner — reported as ownership conflicts. */
export const unownedSharedCapabilities = () =>
  SHARED_CAPABILITIES.filter((c) => c.primaryOwner === "unassigned");
