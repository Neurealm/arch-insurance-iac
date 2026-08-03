/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced by `node scripts/analyze-sre-evidence.mjs`.
 * Indirect dependency tracing and evidence strength for every routed SRE page.
 */

import type { EvidenceRecord } from "../routeTypes";

export const SRE_PAGE_EVIDENCE: readonly EvidenceRecord[] = [
 {
  "ref": "src/pages/prod-twin/AWSResilienceArchitectureTwin.tsx",
  "route": "/aws-resilience-architecture-twin",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state",
   "local-fixture"
  ],
  "tracedDependencies": [
   "src/data/sreTwinData.ts"
  ],
  "interactive": true,
  "evidence": [
   "Static fixture imports: src/data/sreTwinData.ts",
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/AcquisitionOnboardingFactory.tsx",
  "route": "/acquisition-onboarding-factory",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/AiCoworkerControlRoom.tsx",
  "route": "/ai-coworker-control-room",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/AutomationMarketplace.tsx",
  "route": "/automation-marketplace",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/CyberResilienceOverlay.tsx",
  "route": "/cyber-resilience-overlay",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/DeliveryOrgTwin.tsx",
  "route": "/delivery-org-twin",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/EngagementManagerTwin.tsx",
  "route": "/engagement-manager-twin",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/EnterpriseCloudTwin.tsx",
  "route": "/enterprise-cloud-twin",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state",
   "local-fixture"
  ],
  "tracedDependencies": [
   "src/context/EvidenceGraphContext.tsx",
   "src/context/GuidedInvestigationContext.tsx",
   "src/context/ScenarioStateContext.tsx",
   "src/data/demoScenarios.ts",
   "src/data/evidenceGraphData.ts",
   "src/data/guidedInvestigations.ts"
  ],
  "interactive": true,
  "evidence": [
   "Shared React context (client state): src/context/ScenarioStateContext.tsx, src/context/GuidedInvestigationContext.tsx, src/context/EvidenceGraphContext.tsx",
   "Static fixture imports: src/data/demoScenarios.ts, src/data/guidedInvestigations.ts, src/data/evidenceGraphData.ts",
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ExecutiveServiceOwnerTwin.tsx",
  "route": "/executive-service-owner-twin",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/FinOpsOperationsConsole.tsx",
  "route": "/reliability-foundations/finops/operations-console",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/FunctionalOrgChart.tsx",
  "route": "/reliability-foundations/team-topologies/functional-org-chart",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)"
  ],
  "platformChrome": [],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/FutureStateReliabilityOrg.tsx",
  "route": "/reliability-foundations/team-topologies/future-state-org",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/GoldenWorkflowMap.tsx",
  "route": "/golden-workflow-map",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/GoogleSre.tsx",
  "route": "/reliability-foundations/google-sre",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/HowToAchieveGoogleSre.tsx",
  "route": "/reliability-foundations/google-sre/how-to-achieve",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/HowToBuildPlatformEngineering.tsx",
  "route": "/reliability-foundations/platform-engineering/how-to-build",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)"
  ],
  "platformChrome": [],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/HybridCloudWorkbench.tsx",
  "route": "/hybrid-cloud-workbench",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/InteractiveDemoCenter.tsx",
  "route": "/interactive-demo-center",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/MeasuringSuccess.tsx",
  "route": "/measuring-success",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ModernizationFactory.tsx",
  "route": "/modernization-factory",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ModernizationRoadmap.tsx",
  "route": "/modernization-roadmap",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ModernizationRoadmapV2.tsx",
  "route": "/modernization-roadmap-v2",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/OperationalFrictionIndex.tsx",
  "route": "/operational-friction-index",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state",
   "local-fixture"
  ],
  "tracedDependencies": [
   "src/pages/prod-twin/frictionPanelData.ts"
  ],
  "interactive": true,
  "evidence": [
   "Static fixture imports: src/pages/prod-twin/frictionPanelData.ts",
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/PlatformAsAProduct.tsx",
  "route": "/reliability-foundations/platform-engineering/capability-model",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)"
  ],
  "platformChrome": [],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/PlatformEngineeringDesignPrinciples.tsx",
  "route": "/reliability-foundations/platform-engineering/design-principles",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)"
  ],
  "platformChrome": [],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/PlatformEngineeringFactory.tsx",
  "route": "/platform-engineering-factory",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ProdResilienceTwin.tsx",
  "route": "/prod-resilience-twin",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ProductLineMap.tsx",
  "route": "/product-line-map",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ProductReliabilityAnatomy.tsx",
  "route": "/product-reliability-anatomy",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ProductionTopology.tsx",
  "route": "/production-topology",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ReliabilityFoundations.tsx",
  "route": "/reliability-foundations",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/SignalIntelligence.tsx",
  "route": "/signal-intelligence",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/SreOperatingModel.tsx",
  "route": "/sre-operating-model",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/TeamTopologies.tsx",
  "route": "/reliability-foundations/team-topologies",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/TransformationJourney.tsx",
  "route": "/transformation-journey",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/TransitionDualRun.tsx",
  "route": "/transition-dual-run",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 },
 {
  "ref": "src/pages/prod-twin/ValueCreationBoard.tsx",
  "route": "/value-creation-board",
  "evidenceStrength": "client-side-functional",
  "dataBacking": [
   "client-generated-state"
  ],
  "tracedDependencies": [],
  "interactive": true,
  "evidence": [
   "Local React state or event handlers present (client-side behaviour only)",
   "Platform chrome inherited (not capability evidence): src/components/eoc/AppShell.tsx, src/lib/utils.ts"
  ],
  "platformChrome": [
   "src/components/eoc/AppShell.tsx",
   "src/lib/utils.ts"
  ],
  "confidence": "high"
 }
] as const;
