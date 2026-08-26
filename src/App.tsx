import { lazy } from "react";
import { LazyRouteBoundary } from "@/components/routing/LazyRouteBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";

const EnterpriseCertificateManagement = lazy(() => import("./pages/enterprise-cert/EnterpriseCertificateManagement.tsx"));
const RiskExposureMap = lazy(() => import("./pages/enterprise-cert/RiskExposureMap.tsx"));
const LifecycleJourney = lazy(() => import("./pages/enterprise-cert/LifecycleJourney.tsx"));
const DigitalCoworkerWorkforce = lazy(() => import("./pages/enterprise-cert/DigitalCoworkerWorkforce.tsx"));
const OperationsCenter = lazy(() => import("./pages/enterprise-cert/OperationsCenter.tsx"));
const AgenticExecutionCenter = lazy(() => import("./pages/enterprise-cert/AgenticExecutionCenter.tsx"));
const GlobalOperationsMap = lazy(() => import("./pages/enterprise-cert/GlobalOperationsMap.tsx"));
const BusinessServicesImpactCenter = lazy(() => import("./pages/enterprise-cert/BusinessServicesImpactCenter.tsx"));
const ReportsExecutiveIntelligence = lazy(() => import("./pages/enterprise-cert/ReportsExecutiveIntelligence.tsx"));
const CertificateChangeManagementCenter = lazy(() => import("./pages/enterprise-cert/CertificateChangeManagementCenter.tsx"));
const CertificateIntegrationsHub = lazy(() => import("./pages/enterprise-cert/CertificateIntegrationsHub.tsx"));
const SecurityPostureCenter = lazy(() => import("./pages/enterprise-cert/SecurityPostureCenter.tsx"));
const ComplianceCenter = lazy(() => import("./pages/enterprise-cert/ComplianceCenter.tsx"));
const AuditEvidenceCenter = lazy(() => import("./pages/enterprise-cert/AuditEvidenceCenter.tsx"));
const PolicyEngine = lazy(() => import("./pages/enterprise-cert/PolicyEngine.tsx"));
const CtLogsMonitor = lazy(() => import("./pages/enterprise-cert/CtLogsMonitor.tsx"));

const SeadCommandCenter = lazy(() => import("./pages/sead/CommandCenter.tsx"));
const SeadEquipmentHealth = lazy(() => import("./pages/sead/EquipmentHealthIntelligence.tsx"));
const SeadCrossDomain = lazy(() => import("./pages/sead/CrossDomainContextTwin.tsx"));
const SeadMaintenanceSim = lazy(() => import("./pages/sead/MaintenanceDecisionSimulator.tsx"));
const SeadFactoryImpact = lazy(() => import("./pages/sead/FactoryImpactSimulator.tsx"));
const SeadDecisionCenter = lazy(() => import("./pages/sead/AIMaintenanceDecisionCenter.tsx"));
const SeadHumanGovernance = lazy(() => import("./pages/sead/HumanGovernanceCenter.tsx"));
const SeadAIReasoningPlayback = lazy(() => import("./pages/sead/AIReasoningPlayback.tsx"));
const SeadConfidenceExplorer = lazy(() => import("./pages/sead/ConfidenceExplorer.tsx"));
const SeadExplainability = lazy(() => import("./pages/sead/Explainability.tsx"));
const SeadWhatIf = lazy(() => import("./pages/sead/WhatIf.tsx"));
const SeadKnowledgeGraph = lazy(() => import("./pages/sead/KnowledgeGraph.tsx"));
const SeadOperationalLearning = lazy(() => import("./pages/sead/OperationalLearning.tsx"));
const SeadOutcomeTracker = lazy(() => import("./pages/sead/OutcomeTracker.tsx"));
const SeadMultiAgentCollaboration = lazy(() => import("./pages/sead/MultiAgentCollaboration.tsx"));
const SeadHumanInTheLoop = lazy(() => import("./pages/sead/HumanInTheLoop.tsx"));
const SeadEngineeringSandbox = lazy(() => import("./pages/sead/EngineeringSandbox.tsx"));
const SeadDigitalCoworkerConversation = lazy(() => import("./pages/sead/DigitalCoworkerConversation.tsx"));
const SeadIotAiArchitecture = lazy(() => import("./pages/sead/IotAiArchitecture.tsx"));
const SeadSimulationComparison = lazy(() => import("./pages/sead/SimulationComparison.tsx"));

import NotFound from "./pages/NotFound.tsx";
import { SiliconLayout } from "./silicon/shell/SiliconLayout";
const FoundationStatus = lazy(() => import("./silicon/pages/FoundationStatus"));
import { AvepLayout } from "./avep/shell/AvepLayout";
import { ModulePlaceholder } from "./avep/pages/ModulePlaceholder";
import { ProgramWorkspace } from "./avep/pages/ProgramWorkspace";
const RequirementsIntakeWorkspace = lazy(() => import("./avep/pages/RequirementsIntakeWorkspace"));
const RequirementsQualityWorkspace = lazy(() => import("./avep/pages/RequirementsQualityWorkspace"));
const EngineeringTraceabilityWorkspace = lazy(() => import("./avep/pages/EngineeringTraceabilityWorkspace"));
const LogicalArchitectureWorkspace = lazy(() => import("./avep/pages/LogicalArchitectureWorkspace"));
const EngineeringSpecVerificationWorkspace = lazy(() => import("./avep/pages/EngineeringSpecVerificationWorkspace"));
const RtlGenerationStudio = lazy(() => import("./avep/pages/RtlGenerationStudio"));
const RtlChangeImpactAnalysis = lazy(() => import("./avep/pages/RtlChangeImpactAnalysis"));
const VerificationEnvironmentBuilder = lazy(() => import("./avep/pages/VerificationEnvironmentBuilder"));
const TestFactory = lazy(() => import("./avep/pages/TestFactory"));
const SimulationOperations = lazy(() => import("./avep/pages/SimulationOperations"));
const FailureDiagnosis = lazy(() => import("./avep/pages/FailureDiagnosis"));
const CoverageClosureReadiness = lazy(() => import("./avep/pages/CoverageClosureReadiness"));
const SignoffReadiness = lazy(() => import("./avep/pages/SignoffReadiness"));
const ReleasePackage = lazy(() => import("./avep/pages/ReleasePackage"));
const AiGovernanceValue = lazy(() => import("./avep/pages/AiGovernanceValue"));
const PhysicalDesignIntake = lazy(() => import("./avep/pages/PhysicalDesignIntake"));
const EndToEndStory = lazy(() => import("./avep/pages/EndToEndStory"));
const Overview = lazy(() => import("./avep/pages/Overview"));
import { AVEP_NAV } from "./avep/shell/navigation";
const NeurealmAgenticAI = lazy(() => import("./pages/neurealm-agentic-ai/NeurealmAgenticAI.tsx"));
const PlatformLayout = lazy(() => import("./platform/shell/PlatformLayout"));
const PlatformHome = lazy(() => import("./platform/pages/PlatformHome"));
const PlatformMembers = lazy(() => import("./platform/pages/MemberAdmin"));
const PlatformRoles = lazy(() => import("./platform/pages/RoleAdmin"));
const PlatformAudit = lazy(() => import("./platform/pages/AuditExplorer"));
const PlatformTenantSettings = lazy(() => import("./platform/pages/TenantSettings"));
const AcceptInvitation = lazy(() => import("./platform/pages/AcceptInvitation"));
const PlatformProfile = lazy(() => import("./platform/pages/Profile"));
const PlatformTestHub = lazy(() => import("./platform/pages/TestHub"));
const PlatformModuleRegistry = lazy(() => import("./platform/pages/ModuleRegistryDiagnostics"));
import { capabilityIntelligenceRoutes } from "./platform/capability-intelligence/routes";

const CaeNarrativeLibrary = lazy(() => import("./platform/cae/admin/NarrativeLibrary"));
const CaeNarrativeDetail = lazy(() => import("./platform/cae/admin/NarrativeDetail"));
const CaeNarrativeEditor = lazy(() => import("./platform/cae/admin/NarrativeEditor"));
const CaeSpeechProfileManager = lazy(() => import("./platform/cae/admin/SpeechProfileManager"));
const CaePlacementMap = lazy(() => import("./platform/cae/admin/PlacementMap"));
const CaePronunciationDictionary = lazy(() => import("./platform/cae/admin/PronunciationDictionary"));
const CaeAudioAnalytics = lazy(() => import("./platform/cae/admin/AudioAnalytics"));
const CommercialLayout = lazy(() => import("./commercial/shell/CommercialLayout"));
const CommercialOverview = lazy(() => import("./commercial/pages/CommercialOverview"));
const CommercialProgram = lazy(() => import("./commercial/pages/CommercialProgram"));
const CommercialProgramTimeline = lazy(() => import("./commercial/pages/CommercialProgramTimeline"));
const CommercialStaffingResources = lazy(() => import("./commercial/pages/CommercialStaffingResources"));

const CommercialScenarios = lazy(() => import("./commercial/pages/CommercialScenarios"));
const CommercialPortfolio = lazy(() => import("./commercial/pages/CommercialPortfolio"));
const CommercialSources = lazy(() => import("./commercial/pages/CommercialSources"));
const CommercialRevenue = lazy(() => import("./commercial/pages/CommercialRevenue"));
const CommercialPnl = lazy(() => import("./commercial/pages/CommercialPnl"));
const CommercialCash = lazy(() => import("./commercial/pages/CommercialCash"));
const CommercialAssumptions = lazy(() => import("./commercial/pages/CommercialAssumptions"));
const CommercialAssumptionChangeSet = lazy(() => import("./commercial/pages/CommercialAssumptionChangeSet"));
const CommercialCompare = lazy(() => import("./commercial/pages/CommercialCompare"));
const CommercialCompareDetail = lazy(() => import("./commercial/pages/CommercialCompareDetail"));
const CommercialSensitivity = lazy(() => import("./commercial/pages/CommercialSensitivity"));
const CommercialSensitivityDetail = lazy(() => import("./commercial/pages/CommercialSensitivityDetail"));
const CommercialRelease = lazy(() => import("./commercial/pages/CommercialRelease"));
const CommercialReleaseDetail = lazy(() => import("./commercial/pages/CommercialReleaseDetail"));

const CommercialNeurealmGovernance = lazy(() => import("./commercial/pages/CommercialNeurealmGovernance"));



import { PermissionRoute, PlatformAdminRoute } from "./components/auth/PermissionRoute";
const Landing = lazy(() => import("./pages/Landing.tsx"));
import Login from "./pages/auth/Login.tsx";
const CyberMasterDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/CyberMasterDashboard.tsx"));
const IamDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/IamDashboard.tsx"));
const SocDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/SocDashboard.tsx"));
const EndpointCyberDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/EndpointDashboard.tsx"));
const CnappDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/CnappDashboard.tsx"));
const VulnDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/VulnDashboard.tsx"));
const GrcDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/GrcDashboard.tsx"));
const DlpDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/DlpDashboard.tsx"));
const DevSecOpsDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/DevSecOpsDashboard.tsx"));
const ResilienceDashboard = lazy(() => import("./pages/practice-library/dashboards/cyber/ResilienceDashboard.tsx"));
import Signup from "./pages/auth/Signup.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { GuidanceAgentProvider } from "./components/guidance/GuidanceAgentProvider.tsx";
import { ContextualAudioRoot } from "./platform/cae/ContextualAudioErrorBoundary.tsx";
const CaeComponentFixture = lazy(() => import("./platform/cae/dev/CaeComponentFixture.tsx"));
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
const TechnologyTaxonomyPage = lazy(() => import("./pages/admin/technology-taxonomy/TechnologyTaxonomyPage.tsx"));
const TechnologyProfilePage = lazy(() => import("./pages/admin/technology-taxonomy/TechnologyProfilePage.tsx"));
const DomainsPage = lazy(() => import("./pages/admin/technology-taxonomy/domains/DomainsPage.tsx"));
const DomainProfilePage = lazy(() => import("./pages/admin/technology-taxonomy/domains/DomainProfilePage.tsx"));
const Coworkers = lazy(() => import("./pages/Coworkers.tsx"));
const CoworkersNetwork = lazy(() => import("./pages/CoworkersNetwork.tsx"));
const CoworkersSRE = lazy(() => import("./pages/CoworkersSRE.tsx"));
const CoworkersIAM = lazy(() => import("./pages/CoworkersIAM.tsx"));
const CoworkersVuln = lazy(() => import("./pages/CoworkersVuln.tsx"));
const VulnZeroDayDashboard = lazy(() => import("./pages/coworkers/vuln/VulnZeroDayDashboard.tsx"));
const PrivilegedAccessDashboard = lazy(() => import("./pages/coworkers/iam/PrivilegedAccessDashboard.tsx"));
const ReleaseDeploymentRollout = lazy(() => import("./pages/coworkers/sre/ReleaseDeploymentRollout.tsx"));
const SloSlaSliMonitoring = lazy(() => import("./pages/coworkers/sre/SloSlaSliMonitoring.tsx"));
const CoworkersInfra = lazy(() => import("./pages/CoworkersInfra.tsx"));
const CitrixPlatformDigitalCoworkers = lazy(() => import("./pages/coworkers/CitrixPlatformDigitalCoworkers.tsx"));
const CoworkersApplicationSupport = lazy(() => import("./pages/CoworkersApplicationSupport.tsx"));
const HadoopHealthPrecheckAgent = lazy(() => import("./pages/coworkers/appsupport/HadoopHealthPrecheckAgent.tsx"));
const IntegrationMonitoringAgent = lazy(() => import("./pages/coworkers/appsupport/IntegrationMonitoringAgent.tsx"));
const EtlPipelineTraceCoworker = lazy(() => import("./pages/coworkers/appsupport/EtlPipelineTraceCoworker.tsx"));
const ExperienceFeedback = lazy(() => import("./pages/ExperienceFeedback.tsx"));

const VmwareCapacityContention = lazy(() => import("./pages/coworkers/infra/VmwareCapacityContention.tsx"));
const ServerProvisioningDeprovisioning = lazy(() => import("./pages/coworkers/infra/ServerProvisioningDeprovisioning.tsx"));
const HostFailureEarlyWarning = lazy(() => import("./pages/coworkers/infra/HostFailureEarlyWarning.tsx"));
const ActiveDirectoryHealthReplication = lazy(() => import("./pages/coworkers/infra/ActiveDirectoryHealthReplication.tsx"));
const PatchComplianceFailureRemediation = lazy(() => import("./pages/coworkers/infra/PatchComplianceFailureRemediation.tsx"));
const TimeDriftKerberosIntegrity = lazy(() => import("./pages/coworkers/infra/TimeDriftKerberosIntegrity.tsx"));
const TransactionLogDiskPressure = lazy(() => import("./pages/coworkers/infra/TransactionLogDiskPressure.tsx"));
const ThirdPartyDependencyHealth = lazy(() => import("./pages/coworkers/infra/ThirdPartyDependencyHealth.tsx"));
const FirewallRuleOptimizer = lazy(() => import("./pages/coworkers/network/FirewallRuleOptimizer.tsx"));
const ZeroTouchPolicyImplementation = lazy(() => import("./pages/coworkers/network/ZeroTouchPolicyImplementation.tsx"));
const ZeroTouchS2SVPNImplementation = lazy(() => import("./pages/coworkers/network/ZeroTouchS2SVPNImplementation.tsx"));
const CoworkersCarveOut = lazy(() => import("./pages/CoworkersCarveOut.tsx"));
const HealthcarePayer = lazy(() => import("./pages/coworkers/HealthcarePayer.tsx"));
const PriorAuthorization = lazy(() => import("./pages/coworkers/healthcare/PriorAuthorization.tsx"));
const StarsHedis = lazy(() => import("./pages/coworkers/healthcare/StarsHedis.tsx"));
const MemberRenewal = lazy(() => import("./pages/coworkers/healthcare/MemberRenewal.tsx"));
const DsnpLtc = lazy(() => import("./pages/coworkers/healthcare/DsnpLtc.tsx"));
const BehavioralHealth = lazy(() => import("./pages/coworkers/healthcare/BehavioralHealth.tsx"));
const MedicationAdherence = lazy(() => import("./pages/coworkers/healthcare/MedicationAdherence.tsx"));
const PediatricChw = lazy(() => import("./pages/coworkers/healthcare/PediatricChw.tsx"));
const ChronicDisease = lazy(() => import("./pages/coworkers/healthcare/ChronicDisease.tsx"));
const ProviderExperience = lazy(() => import("./pages/coworkers/healthcare/ProviderExperience.tsx"));
const RiskAdjustment = lazy(() => import("./pages/coworkers/healthcare/RiskAdjustment.tsx"));
const AiModelGovernance = lazy(() => import("./pages/coworkers/healthcare/AiModelGovernance.tsx"));
const ClaimsExceptionAppeals = lazy(() => import("./pages/coworkers/healthcare/ClaimsExceptionAppeals.tsx"));
const HealthEquity = lazy(() => import("./pages/coworkers/healthcare/HealthEquity.tsx"));
const FhirCmsApi = lazy(() => import("./pages/coworkers/healthcare/FhirCmsApi.tsx"));
const HieIntegration = lazy(() => import("./pages/coworkers/healthcare/HieIntegration.tsx"));
const ProviderPortalAvaility = lazy(() => import("./pages/coworkers/healthcare/ProviderPortalAvaility.tsx"));
const EdiClearinghouse = lazy(() => import("./pages/coworkers/healthcare/EdiClearinghouse.tsx"));
const PaConfigGovernance = lazy(() => import("./pages/coworkers/healthcare/PaConfigGovernance.tsx"));
const DataQualityIdentity = lazy(() => import("./pages/coworkers/healthcare/DataQualityIdentity.tsx"));
const MajorIncidentBusinessImpact = lazy(() => import("./pages/coworkers/healthcare/MajorIncidentBusinessImpact.tsx"));
const VendorSaasRisk = lazy(() => import("./pages/coworkers/healthcare/VendorSaasRisk.tsx"));
const IdentityOauthGovernance = lazy(() => import("./pages/coworkers/healthcare/IdentityOauthGovernance.tsx"));
const EsccOverview = lazy(() => import("./pages/carveout/EsccOverview.tsx"));
const EsccSolutionDesign = lazy(() => import("./pages/carveout/EsccSolutionDesign.tsx"));
const EsccDashboard = lazy(() => import("./pages/carveout/EsccDashboard.tsx"));
const EucOverview = lazy(() => import("./pages/carveout/EucOverview.tsx"));
const EucSolutionDesign = lazy(() => import("./pages/carveout/EucSolutionDesign.tsx"));
const EucDashboard = lazy(() => import("./pages/carveout/EucDashboard.tsx"));
const SdtOverview = lazy(() => import("./pages/carveout/SdtOverview.tsx"));
const SdtSolutionDesign = lazy(() => import("./pages/carveout/SdtSolutionDesign.tsx"));
const SdtDashboard = lazy(() => import("./pages/carveout/SdtDashboard.tsx"));
const ShxOverview = lazy(() => import("./pages/carveout/ShxOverview.tsx"));
const ShxSolutionDesign = lazy(() => import("./pages/carveout/ShxSolutionDesign.tsx"));
const ShxDashboard = lazy(() => import("./pages/carveout/ShxDashboard.tsx"));
const AdsOverview = lazy(() => import("./pages/carveout/AdsOverview.tsx"));
const AdsSolutionDesign = lazy(() => import("./pages/carveout/AdsSolutionDesign.tsx"));
const AdsDashboard = lazy(() => import("./pages/carveout/AdsDashboard.tsx"));
const IocOverview = lazy(() => import("./pages/carveout/IocOverview.tsx"));
const IocSolutionDesign = lazy(() => import("./pages/carveout/IocSolutionDesign.tsx"));
const IocDashboard = lazy(() => import("./pages/carveout/IocDashboard.tsx"));
const NccOverview = lazy(() => import("./pages/carveout/NccOverview.tsx"));
const NccSolutionDesign = lazy(() => import("./pages/carveout/NccSolutionDesign.tsx"));
const NccDashboard = lazy(() => import("./pages/carveout/NccDashboard.tsx"));
const IatOverview = lazy(() => import("./pages/carveout/IatOverview.tsx"));
const IatSolutionDesign = lazy(() => import("./pages/carveout/IatSolutionDesign.tsx"));
const IatDashboard = lazy(() => import("./pages/carveout/IatDashboard.tsx"));
const CmmOverview = lazy(() => import("./pages/carveout/CmmOverview.tsx"));
const CmmSolutionDesign = lazy(() => import("./pages/carveout/CmmSolutionDesign.tsx"));
const CmmDashboard = lazy(() => import("./pages/carveout/CmmDashboard.tsx"));
const DeployCoworker = lazy(() => import("./pages/DeployCoworker.tsx"));

const Incidents = lazy(() => import("./pages/Incidents.tsx"));
const Alerts = lazy(() => import("./pages/Alerts.tsx"));
const ChangeManagement = lazy(() => import("./pages/ChangeManagement.tsx"));
const NeuGAIN = lazy(() => import("./pages/NeuGAIN.tsx"));
const CarveOut = lazy(() => import("./pages/CarveOut.tsx"));
const CarveOutPage = lazy(() => import("./pages/CarveOutPage.tsx"));
const WorkforceReadiness = lazy(() => import("./pages/carveout/WorkforceReadiness.tsx"));
const DeviceProvisioningFactory = lazy(() => import("./pages/carveout/DeviceProvisioningFactory.tsx"));
const GoldenImage = lazy(() => import("./pages/carveout/GoldenImage.tsx"));
const PersonaAssignment = lazy(() => import("./pages/carveout/PersonaAssignment.tsx"));
const IdentityCutover = lazy(() => import("./pages/carveout/IdentityCutover.tsx"));
const VdiContinuity = lazy(() => import("./pages/carveout/VdiContinuity.tsx"));
const GlobalLogistics = lazy(() => import("./pages/carveout/GlobalLogistics.tsx"));
const EndpointHealth = lazy(() => import("./pages/carveout/EndpointHealth.tsx"));
const DigitalCoworkerEuc = lazy(() => import("./pages/carveout/DigitalCoworkerEuc.tsx"));
const SelfServiceSupport = lazy(() => import("./pages/carveout/SelfServiceSupport.tsx"));
const AssetLifecycle = lazy(() => import("./pages/carveout/AssetLifecycle.tsx"));
const NetworkSeparationCommand = lazy(() => import("./pages/carveout/NetworkSeparationCommand.tsx"));
const NetworkTopology = lazy(() => import("./pages/carveout/NetworkTopology.tsx"));
const SiteConnectivity = lazy(() => import("./pages/carveout/SiteConnectivity.tsx"));
const WanSdwan = lazy(() => import("./pages/carveout/WanSdwan.tsx"));
const DcCloudFabric = lazy(() => import("./pages/carveout/DcCloudFabric.tsx"));
const FirewallZeroTrust = lazy(() => import("./pages/carveout/FirewallZeroTrust.tsx"));
const NetworkProvisioningFactory = lazy(() => import("./pages/carveout/NetworkProvisioningFactory.tsx"));
const FieldNetworkDeployment = lazy(() => import("./pages/carveout/FieldNetworkDeployment.tsx"));
const NocOperations = lazy(() => import("./pages/carveout/NocOperations.tsx"));
const NetworkExperience = lazy(() => import("./pages/carveout/NetworkExperience.tsx"));
const DigitalCoworkerNetwork = lazy(() => import("./pages/carveout/DigitalCoworkerNetwork.tsx"));
const NetworkCostOptimization = lazy(() => import("./pages/carveout/NetworkCostOptimization.tsx"));
const InfraSeparationCommand = lazy(() => import("./pages/carveout/InfraSeparationCommand.tsx"));
const InfraTopology = lazy(() => import("./pages/carveout/InfraTopology.tsx"));
const EnvCarveOut = lazy(() => import("./pages/carveout/EnvCarveOut.tsx"));
const ServerStorageFactory = lazy(() => import("./pages/carveout/ServerStorageFactory.tsx"));
const StorageDataReadiness = lazy(() => import("./pages/carveout/StorageDataReadiness.tsx"));
const HybridPlacement = lazy(() => import("./pages/carveout/HybridPlacement.tsx"));
const DcExitMigration = lazy(() => import("./pages/carveout/DcExitMigration.tsx"));
const FieldInfraDeployment = lazy(() => import("./pages/carveout/FieldInfraDeployment.tsx"));
const InfraOperations = lazy(() => import("./pages/carveout/InfraOperations.tsx"));
const WorkloadPerformance = lazy(() => import("./pages/carveout/WorkloadPerformance.tsx"));
const DigitalCoworkerInfra = lazy(() => import("./pages/carveout/DigitalCoworkerInfra.tsx"));
const InfraFinOps = lazy(() => import("./pages/carveout/InfraFinOps.tsx"));
const CloudTransformation = lazy(() => import("./pages/carveout/CloudTransformation.tsx"));
const LandingZone = lazy(() => import("./pages/carveout/LandingZone.tsx"));
const AppPortfolioRationalization = lazy(() => import("./pages/carveout/AppPortfolioRationalization.tsx"));
const MigrationWavePlanning = lazy(() => import("./pages/carveout/MigrationWavePlanning.tsx"));
const HybridCloudFabric = lazy(() => import("./pages/carveout/HybridCloudFabric.tsx"));
const MultiRegionDR = lazy(() => import("./pages/carveout/MultiRegionDR.tsx"));
const CloudMigrationFactory = lazy(() => import("./pages/carveout/CloudMigrationFactory.tsx"));
const CloudSecurityCspm = lazy(() => import("./pages/carveout/CloudSecurityCspm.tsx"));
const CloudOperations = lazy(() => import("./pages/carveout/CloudOperations.tsx"));
const CloudPerformanceAnalytics = lazy(() => import("./pages/carveout/CloudPerformanceAnalytics.tsx"));
const DigitalCoworkerCloud = lazy(() => import("./pages/carveout/DigitalCoworkerCloud.tsx"));
const CloudFinOps = lazy(() => import("./pages/carveout/CloudFinOps.tsx"));
const AssuranceCommand = lazy(() => import("./pages/assurance/AssuranceCommand.tsx"));
const WorkflowDetail = lazy(() => import("./pages/assurance/WorkflowDetail.tsx"));
const LiveExecution = lazy(() => import("./pages/assurance/LiveExecution.tsx"));
const Itsm = lazy(() => import("./pages/itsm/Itsm.tsx"));
const ExecBizOps = lazy(() => import("./pages/itsm/ExecBizOps.tsx"));
const ExecutiveCommandCenter = lazy(() => import("./pages/itsm/ExecutiveCommandCenter.tsx"));
const ItsmCustomerExperience = lazy(() => import("./pages/itsm/CustomerExperience.tsx"));
const ItsmSlaSloErrorBudget = lazy(() => import("./pages/itsm/SlaSloErrorBudget.tsx"));
const ItsmRiskExposure = lazy(() => import("./pages/itsm/RiskExposure.tsx"));
const ItsmBusinessServices = lazy(() => import("./pages/itsm/BusinessServices.tsx"));
const AutoTicketCategorization = lazy(() => import("./pages/itsm/AutoTicketCategorization.tsx"));
const AtcIncidentConsole = lazy(() => import("./pages/itsm/atc/IncidentConsole.tsx"));
const AtcTicketQueue = lazy(() => import("./pages/itsm/atc/TicketQueue.tsx"));
const AtcMyTeam = lazy(() => import("./pages/itsm/atc/MyTeam.tsx"));
const AtcSlaKpis = lazy(() => import("./pages/itsm/atc/SlaKpis.tsx"));
const AtcKnowledgeBase = lazy(() => import("./pages/itsm/atc/KnowledgeBase.tsx"));
const AtcReports = lazy(() => import("./pages/itsm/atc/Reports.tsx"));
const AtcAutoConfig = lazy(() => import("./pages/itsm/atc/AutoConfig.tsx"));
const AtcMajorIncidents = lazy(() => import("./pages/itsm/atc/MajorIncidents.tsx"));
const AtcEscalations = lazy(() => import("./pages/itsm/atc/Escalations.tsx"));
const AtcChangeCalendar = lazy(() => import("./pages/itsm/atc/ChangeCalendar.tsx"));
const AtcOnCallSchedule = lazy(() => import("./pages/itsm/atc/OnCallSchedule.tsx"));
const AtcBusinessServices = lazy(() => import("./pages/itsm/atc/BusinessServices.tsx"));
const AtcAssignments = lazy(() => import("./pages/itsm/atc/Assignments.tsx"));
const AtcCategorizationRules = lazy(() => import("./pages/itsm/atc/CategorizationRules.tsx"));
const AtcIntegrations = lazy(() => import("./pages/itsm/atc/Integrations.tsx"));

const StakeholderRegister = lazy(() => import("./pages/settings/StakeholderRegister.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const AuthOrchestration = lazy(() => import("./pages/AuthOrchestration.tsx"));
const Questionnaires = lazy(() => import("./pages/Questionnaires.tsx"));
const UserManagement = lazy(() => import("./pages/settings/UserManagement.tsx"));
const GuidanceInsights = lazy(() => import("./pages/settings/GuidanceInsights.tsx"));
const ChangePassword = lazy(() => import("./pages/settings/ChangePassword.tsx"));
import PendingApproval from "./pages/auth/PendingApproval.tsx";
import UpdateProfile from "./pages/auth/UpdateProfile.tsx";
import SetInitialPassword from "./pages/auth/SetInitialPassword.tsx";
import CompleteProfile from "./pages/auth/CompleteProfile.tsx";
const OrganizationLayout = lazy(() => import("./pages/settings/organization/OrganizationLayout.tsx"));
const EntityListPage = lazy(() => import("./pages/settings/organization/EntityListPage.tsx"));
const EntityDetailPage = lazy(() => import("./pages/settings/organization/EntityDetailPage.tsx"));
const HierarchyView = lazy(() => import("./pages/settings/organization/HierarchyView.tsx"));
const CompaniesList = lazy(() => import("./pages/crm/CompaniesList.tsx"));
const CompanyWorkspace = lazy(() => import("./pages/crm/CompanyWorkspace.tsx"));
const StakeholderFormPage = lazy(() => import("./pages/crm/StakeholderFormPage.tsx"));
const PracticeLibrary = lazy(() => import("./pages/PracticeLibrary.tsx"));
const TableOfContents = lazy(() => import("./pages/practice-library/TableOfContents.tsx"));
const PracticePlaceholder = lazy(() => import("./pages/practice-library/PracticePlaceholder.tsx"));
import { Navigate } from "react-router-dom";
const ItsmDashboard = lazy(() => import("./pages/practice-library/dashboards/ItsmDashboard.tsx"));
const EucPracticeDashboard = lazy(() => import("./pages/practice-library/dashboards/EucDashboard.tsx"));
const InfraDashboard = lazy(() => import("./pages/practice-library/dashboards/InfraDashboard.tsx"));
const PowerAdminConsole = lazy(() => import("./pages/practice-library/dashboards/PowerAdminConsole.tsx"));
const PowerMap = lazy(() => import("./pages/practice-library/dashboards/PowerMap.tsx"));
const PowerAlerts = lazy(() => import("./pages/practice-library/dashboards/PowerAlerts.tsx"));
const AiOptimization = lazy(() => import("./pages/practice-library/dashboards/AiOptimization.tsx"));
const HistoricalAnalysis = lazy(() => import("./pages/practice-library/dashboards/HistoricalAnalysis.tsx"));
const Forecasting = lazy(() => import("./pages/practice-library/dashboards/Forecasting.tsx"));
const CapacityManagement = lazy(() => import("./pages/practice-library/dashboards/CapacityManagement.tsx"));
const PowerCapping = lazy(() => import("./pages/practice-library/dashboards/PowerCapping.tsx"));
const RealTimeMonitoring = lazy(() => import("./pages/practice-library/dashboards/RealTimeMonitoring.tsx"));
const NetworkDashboard = lazy(() => import("./pages/practice-library/dashboards/NetworkDashboard.tsx"));
const CloudDashboard = lazy(() => import("./pages/practice-library/dashboards/CloudDashboard.tsx"));
const ApplicationDashboard = lazy(() => import("./pages/practice-library/dashboards/ApplicationDashboard.tsx"));
const DataDashboard = lazy(() => import("./pages/practice-library/dashboards/DataDashboard.tsx"));
const SqlTransactionLogJobReliability = lazy(() => import("./pages/practice-library/dashboards/data/SqlTransactionLogJobReliability.tsx"));
const SreDashboard = lazy(() => import("./pages/practice-library/dashboards/SreDashboard.tsx"));
const EhrDashboard = lazy(() => import("./pages/practice-library/dashboards/EhrDashboard.tsx"));
const WorkforceDashboard = lazy(() => import("./pages/practice-library/dashboards/WorkforceDashboard.tsx"));
const ProdResilienceTwin = lazy(() => import("./pages/prod-twin/ProdResilienceTwin.tsx"));
const DataOrchLayout = lazy(() => import("./pages/data-orchestration-twin/DataOrchLayout.tsx"));
const FinOpsLayout = lazy(() => import("./pages/agentic-finops/FinOpsLayout.tsx"));
const FinOpsOverview = lazy(() => import("./pages/agentic-finops/workspaces/FinOpsOverview.tsx"));
const ResourceRightsizingWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/ResourceRightsizingWorkspace.tsx"));
const IdleOrphanedResourcesWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/IdleOrphanedResourcesWorkspace.tsx"));
const CommitmentOptimizationWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/CommitmentOptimizationWorkspace.tsx"));
const ElasticitySchedulingWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/ElasticitySchedulingWorkspace.tsx"));
const StorageDataLifecycleWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/StorageDataLifecycleWorkspace.tsx"));
const NetworkDataMovementWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/NetworkDataMovementWorkspace.tsx"));
const PlatformArchitectureEfficiencyWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/PlatformArchitectureEfficiencyWorkspace.tsx"));
const KubernetesEconomicsWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/KubernetesEconomicsWorkspace.tsx"));
const GovernanceRealizationWorkspace = lazy(() => import("./pages/agentic-finops/workspaces/GovernanceRealizationWorkspace.tsx"));
const EcfLayout = lazy(() => import("./pages/enterprise-cognitive-fabric/EcfLayout.tsx"));
const EcfLanding = lazy(() => import("./pages/enterprise-cognitive-fabric/EcfLanding.tsx"));
const EcfPage = lazy(() => import("./pages/enterprise-cognitive-fabric/EcfPage.tsx"));
const EnterpriseCommandCenter = lazy(() => import("./pages/enterprise-cognitive-fabric/EnterpriseCommandCenter.tsx"));
const EnterpriseSourceDiscovery = lazy(() => import("./pages/enterprise-cognitive-fabric/EnterpriseSourceDiscovery.tsx"));
const DiscoveryScaffold = lazy(() => import("./pages/enterprise-cognitive-fabric/DiscoveryScaffold.tsx"));
const DiscoveryConfiguration = lazy(() => import("./pages/enterprise-cognitive-fabric/DiscoveryConfiguration.tsx"));
const DiscoveryPipeline = lazy(() => import("./pages/enterprise-cognitive-fabric/DiscoveryPipeline.tsx"));
const DiscoveryRegistry = lazy(() => import("./pages/enterprise-cognitive-fabric/DiscoveryRegistry.tsx"));
const DiscoveryConnectorHealth = lazy(() => import("./pages/enterprise-cognitive-fabric/DiscoveryConnectorHealth.tsx"));
const ArtifactIngestion = lazy(() => import("./pages/enterprise-cognitive-fabric/ArtifactIngestion.tsx"));
const ArtifactNormalization = lazy(() => import("./pages/enterprise-cognitive-fabric/ArtifactNormalization.tsx"));
const BusinessConditionScaffold = lazy(() => import("./pages/enterprise-cognitive-fabric/BusinessConditionScaffold.tsx"));
const BusinessConditionExtraction = lazy(() => import("./pages/enterprise-cognitive-fabric/BusinessConditionExtraction.tsx"));
const TeamPersonaConstruction = lazy(() => import("./pages/enterprise-cognitive-fabric/TeamPersonaConstruction.tsx"));
const TeamPersonaLibrary = lazy(() => import("./pages/enterprise-cognitive-fabric/TeamPersonaLibrary.tsx"));
const CloudFinOpsAttributeStore = lazy(() => import("./pages/enterprise-cognitive-fabric/finops-attribute-store/CloudFinOpsAttributeStore"));
const PersonaStudioScaffold = lazy(() => import("./pages/enterprise-cognitive-fabric/PersonaStudioScaffold.tsx"));
const PersonaValidation = lazy(() => import("./pages/enterprise-cognitive-fabric/PersonaValidation.tsx"));
const EnterpriseCognitiveMemory = lazy(() => import("./pages/enterprise-cognitive-fabric/EnterpriseCognitiveMemory.tsx"));
const CognitiveIntake = lazy(() => import("./pages/enterprise-cognitive-fabric/CognitiveIntake.tsx"));
const CognitiveReadinessAssessment = lazy(() => import("./pages/enterprise-cognitive-fabric/CognitiveReadinessAssessment.tsx"));

const PersonaImpactAnalysis = lazy(() => import("./pages/enterprise-cognitive-fabric/PersonaImpactAnalysis.tsx"));
const CrossTeamImpactAnalysis = lazy(() => import("./pages/enterprise-cognitive-fabric/CrossTeamImpactAnalysis.tsx"));
const DecisionIntelligence = lazy(() => import("./pages/enterprise-cognitive-fabric/DecisionIntelligence.tsx"));
const OrganizationalLearning = lazy(() => import("./pages/enterprise-cognitive-fabric/OrganizationalLearning.tsx"));
const EnterpriseCognitiveHealth = lazy(() => import("./pages/enterprise-cognitive-fabric/EnterpriseCognitiveHealth.tsx"));


const DataOrchPage = lazy(() => import("./pages/data-orchestration-twin/DataOrchPage.tsx"));
const DataOrchExecutiveControlPlane = lazy(() => import("./pages/data-orchestration-twin/ExecutiveControlPlane.tsx"));
const UseCaseToDataContractMapper = lazy(() => import("./pages/data-orchestration-twin/UseCaseToDataContractMapper.tsx"));
const SiteResilienceCoworker = lazy(() => import("./pages/data-orchestration-twin/SiteResilienceCoworker.tsx"));
const LogSourceInventoryAndScopeRegistry = lazy(() => import("./pages/data-orchestration-twin/LogSourceInventoryAndScopeRegistry.tsx"));
const DataDogLogProfile = lazy(() => import("./pages/data-orchestration-twin/DataDogLogProfile.tsx"));
const CyberThreatIntelligenceAndIocAnalysis = lazy(() => import("./pages/data-orchestration-twin/CyberThreatIntelligenceAndIocAnalysis.tsx"));
const DataPlacementDecisionEngine = lazy(() => import("./pages/data-orchestration-twin/DataPlacementDecisionEngine.tsx"));
const PlacementScenarioModeler = lazy(() => import("./pages/data-orchestration-twin/PlacementScenarioModeler.tsx"));
const NoDuplicationStrategyAndRetentionPolicy = lazy(() => import("./pages/data-orchestration-twin/NoDuplicationStrategyAndRetentionPolicy.tsx"));
const NoDuplicationScenarioModeler = lazy(() => import("./pages/data-orchestration-twin/NoDuplicationScenarioModeler.tsx"));
const OptionsAndTradeoffMatrix = lazy(() => import("./pages/data-orchestration-twin/OptionsAndTradeoffMatrix.tsx"));
const ConnectorAccessGovernanceRegistry = lazy(() => import("./pages/data-orchestration-twin/ConnectorAccessGovernanceRegistry.tsx"));
const ConnectionMethodProfile = lazy(() => import("./pages/data-orchestration-twin/ConnectionMethodProfile.tsx"));
const FetchOrchestrationScheduler = lazy(() => import("./pages/data-orchestration-twin/FetchOrchestrationScheduler.tsx"));
const ScheduleBuilder = lazy(() => import("./pages/data-orchestration-twin/ScheduleBuilder.tsx"));
const SourceOnboardingFactory = lazy(() => import("./pages/data-orchestration-twin/SourceOnboardingFactory.tsx"));
const AssistedSchemaDiscoveryAndFieldMapping = lazy(() => import("./pages/data-orchestration-twin/AssistedSchemaDiscoveryAndFieldMapping.tsx"));
const SchemaDriftAndExceptionWorkbench = lazy(() => import("./pages/data-orchestration-twin/SchemaDriftAndExceptionWorkbench.tsx"));
const LogHygieneCompletenessAndStandardizationConsole = lazy(() => import("./pages/data-orchestration-twin/LogHygieneCompletenessAndStandardizationConsole.tsx"));
const HydrationAndEnrichmentMethodSelector = lazy(() => import("./pages/data-orchestration-twin/HydrationAndEnrichmentMethodSelector.tsx"));
const HydratedRecordBuilder = lazy(() => import("./pages/data-orchestration-twin/HydratedRecordBuilder.tsx"));
const DataLineageAndTraceabilityView = lazy(() => import("./pages/data-orchestration-twin/DataLineageAndTraceabilityView.tsx"));
const CanonicalOperationalDataModel = lazy(() => import("./pages/data-orchestration-twin/CanonicalOperationalDataModel.tsx"));
const RelationshipKeyAndGraphProjectionBuilder = lazy(() => import("./pages/data-orchestration-twin/RelationshipKeyAndGraphProjectionBuilder.tsx"));
const QueryReadinessAndConfidenceScorecard = lazy(() => import("./pages/data-orchestration-twin/QueryReadinessAndConfidenceScorecard.tsx"));
const PerformanceLatencyAndFreshnessLab = lazy(() => import("./pages/data-orchestration-twin/PerformanceLatencyAndFreshnessLab.tsx"));
const ContextGraphAndAgenticQueryHandoffLayer = lazy(() => import("./pages/data-orchestration-twin/ContextGraphAndAgenticQueryHandoffLayer.tsx"));
const DataGapRegisterAndEngineeringBacklog = lazy(() => import("./pages/data-orchestration-twin/DataGapRegisterAndEngineeringBacklog.tsx"));
const SowExecutionPlanAndAcceptanceDashboard = lazy(() => import("./pages/data-orchestration-twin/SowExecutionPlanAndAcceptanceDashboard.tsx"));
const MeasuringSuccess = lazy(() => import("./pages/prod-twin/MeasuringSuccess.tsx"));

const ProductLineMap = lazy(() => import("./pages/prod-twin/ProductLineMap.tsx"));
const GoldenWorkflowMap = lazy(() => import("./pages/prod-twin/GoldenWorkflowMap.tsx"));
const ProductionTopology = lazy(() => import("./pages/prod-twin/ProductionTopology.tsx"));
const SreOperatingModel = lazy(() => import("./pages/prod-twin/SreOperatingModel.tsx"));
const SignalIntelligence = lazy(() => import("./pages/prod-twin/SignalIntelligence.tsx"));
const EnterpriseCloudTwin = lazy(() => import("./pages/prod-twin/EnterpriseCloudTwin.tsx"));
const AWSResilienceArchitectureTwin = lazy(() => import("./pages/prod-twin/AWSResilienceArchitectureTwin.tsx"));
import { ScenarioStateProvider } from "./context/ScenarioStateContext.tsx";
const PlatformEngineeringFactory = lazy(() => import("./pages/prod-twin/PlatformEngineeringFactory.tsx"));
const HybridCloudWorkbench = lazy(() => import("./pages/prod-twin/HybridCloudWorkbench.tsx"));
const AutomationMarketplace = lazy(() => import("./pages/prod-twin/AutomationMarketplace.tsx"));
const ModernizationFactory = lazy(() => import("./pages/prod-twin/ModernizationFactory.tsx"));
const CyberResilienceOverlay = lazy(() => import("./pages/prod-twin/CyberResilienceOverlay.tsx"));
const AiCoworkerControlRoom = lazy(() => import("./pages/prod-twin/AiCoworkerControlRoom.tsx"));
const TransitionDualRun = lazy(() => import("./pages/prod-twin/TransitionDualRun.tsx"));
const AcquisitionOnboardingFactory = lazy(() => import("./pages/prod-twin/AcquisitionOnboardingFactory.tsx"));
const ValueCreationBoard = lazy(() => import("./pages/prod-twin/ValueCreationBoard.tsx"));
const ModernizationRoadmap = lazy(() => import("./pages/prod-twin/ModernizationRoadmap.tsx"));
const InteractiveDemoCenter = lazy(() => import("./pages/prod-twin/InteractiveDemoCenter.tsx"));
const ModernizationRoadmapV2 = lazy(() => import("./pages/prod-twin/ModernizationRoadmapV2.tsx"));
const ExecutiveServiceOwnerTwin = lazy(() => import("./pages/prod-twin/ExecutiveServiceOwnerTwin.tsx"));
const DeliveryOrgTwin = lazy(() => import("./pages/prod-twin/DeliveryOrgTwin.tsx"));
const EngagementManagerTwin = lazy(() => import("./pages/prod-twin/EngagementManagerTwin.tsx"));
const OperationalFrictionIndex = lazy(() => import("./pages/prod-twin/OperationalFrictionIndex.tsx"));
const ReliabilityFoundations = lazy(() => import("./pages/prod-twin/ReliabilityFoundations.tsx"));
const GoogleSre = lazy(() => import("./pages/prod-twin/GoogleSre.tsx"));
const HowToAchieveGoogleSre = lazy(() => import("./pages/prod-twin/HowToAchieveGoogleSre.tsx"));
const TeamTopologies = lazy(() => import("./pages/prod-twin/TeamTopologies.tsx"));
const FutureStateReliabilityOrg = lazy(() => import("./pages/prod-twin/FutureStateReliabilityOrg.tsx"));
const FunctionalOrgChart = lazy(() => import("./pages/prod-twin/FunctionalOrgChart.tsx"));
const PlatformEngineeringDesignPrinciples = lazy(() => import("./pages/prod-twin/PlatformEngineeringDesignPrinciples.tsx"));
const HowToBuildPlatformEngineering = lazy(() => import("./pages/prod-twin/HowToBuildPlatformEngineering.tsx"));
const PlatformAsAProduct = lazy(() => import("./pages/prod-twin/PlatformAsAProduct.tsx"));
const FinOpsOperationsConsole = lazy(() => import("./pages/prod-twin/FinOpsOperationsConsole.tsx"));
const ProductReliabilityAnatomy = lazy(() => import("./pages/prod-twin/ProductReliabilityAnatomy.tsx"));
const TransformationJourney = lazy(() => import("./pages/prod-twin/TransformationJourney.tsx"));
const CustomerSelectionDemo = lazy(() => import("./pages/crm-demo/CustomerSelectionDemo.tsx"));
const EngagementProfileDemo = lazy(() => import("./pages/crm-demo/EngagementProfileDemo.tsx"));
const StakeholderMapDemo = lazy(() => import("./pages/crm-demo/StakeholderMapDemo.tsx"));
const DiscoveryLibraryDemo = lazy(() => import("./pages/crm-demo/DiscoveryLibraryDemo.tsx"));
const DiscoveryConfidenceDemo = lazy(() => import("./pages/crm-demo/DiscoveryConfidenceDemo.tsx"));
import PublicQuestionnaire from "./pages/PublicQuestionnaire.tsx";
const RunOpsLayout = lazy(() => import("./runops/shell/RunOpsLayout.tsx"));
const SreLayout = lazy(() => import("./pages/prod-twin/SreLayout.tsx"));
const NocLayout = lazy(() => import("./pages/agentic-sre-noc/NocLayout.tsx"));
const NocPage = lazy(() => import("./pages/agentic-sre-noc/NocPage.tsx"));
const GlobalOpticalOperationsCenter = lazy(() => import("./pages/agentic-sre-noc/GlobalOpticalOperationsCenter.tsx"));
const TraditionalNocOperationsCenter = lazy(() => import("./pages/operations/traditional-noc/GlobalOpticalOperationsCenter.tsx"));
const CustomerServiceHealthExplorer = lazy(() => import("./pages/agentic-sre-noc/CustomerServiceHealthExplorer.tsx"));
const GlobalLinkHealthTwin = lazy(() => import("./pages/agentic-sre-noc/GlobalLinkHealthTwin.tsx"));
const GlobalOpticalServiceTopology = lazy(() => import("./pages/agentic-sre-noc/GlobalOpticalServiceTopology.tsx"));
const PredictiveLinkRiskCenter = lazy(() => import("./pages/agentic-sre-noc/PredictiveLinkRiskCenter.tsx"));
const ActiveSituationRoom = lazy(() => import("./pages/agentic-sre-noc/ActiveSituationRoom.tsx"));
const AgenticInvestigationWorkspace = lazy(() => import("./pages/agentic-sre-noc/AgenticInvestigationWorkspace.tsx"));
const HumanApprovalActionCenter = lazy(() => import("./pages/agentic-sre-noc/HumanApprovalActionCenter.tsx"));
const AutonomousRecoveryMonitor = lazy(() => import("./pages/agentic-sre-noc/AutonomousRecoveryMonitor.tsx"));
const GlhtProductionArchitecture = lazy(() => import("./pages/agentic-sre-noc/ProductionArchitecture.tsx"));
const PredictiveOpticalLinkIntelligence = lazy(() => import("./pages/agentic-sre-noc/PredictiveOpticalLinkIntelligence.tsx"));
const IacLayout = lazy(() => import("./pages/agentic-iac/IacLayout.tsx"));
const AzureConnections = lazy(() => import("./pages/agentic-iac/AzureConnections.tsx"));
const AzureResources = lazy(() => import("./pages/agentic-iac/AzureResources.tsx"));
const AssetDigitalTwin = lazy(() => import("./pages/agentic-iac/AssetDigitalTwin.tsx"));
const RemediationIntelligence = lazy(() => import("./pages/agentic-iac/RemediationIntelligence.tsx"));
const ChangeEngineering = lazy(() => import("./pages/agentic-iac/ChangeEngineering.tsx"));
const ChangeReviewApproval = lazy(() => import("./pages/agentic-iac/ChangeReviewApproval.tsx"));
const ExecutionCenter = lazy(() => import("./pages/agentic-iac/ExecutionCenter.tsx"));
const ValidationEvidence = lazy(() => import("./pages/agentic-iac/ValidationEvidence.tsx"));
const DeploymentArchitecture = lazy(() => import("./pages/agentic-iac/DeploymentArchitecture.tsx"));
const PlatformAdminPlaceholder = lazy(() => import("./pages/agentic-iac/PlatformAdminPlaceholder.tsx"));
const IntegrationsConnectivity = lazy(() => import("./pages/agentic-iac/IntegrationsConnectivity.tsx"));
const AccessGovernance = lazy(() => import("./pages/agentic-iac/AccessGovernance.tsx"));
const PoliciesGovernance = lazy(() => import("./pages/agentic-iac/PoliciesGovernance.tsx"));
const SystemSettingsPage = lazy(() => import("./pages/agentic-iac/SystemSettings.tsx"));
const ContextEvidenceLayout = lazy(() => import("./pages/context-evidence/ContextEvidenceLayout.tsx"));
const ContextEvidenceOverview = lazy(() => import("./pages/context-evidence/Overview.tsx"));
const ContextEvidencePlaceholder = lazy(() => import("./pages/context-evidence/Placeholder.tsx"));
const ModelsRoutingLayout = lazy(() => import("./pages/models-routing/ModelsRoutingLayout.tsx"));
const ModelsRoutingOverview = lazy(() => import("./pages/models-routing/Overview.tsx"));
const ModelsRoutingPlaceholder = lazy(() => import("./pages/models-routing/Placeholder.tsx"));
const AgentOrchestrationLayout = lazy(() => import("./pages/agent-orchestration/AgentOrchestrationLayout.tsx"));
const AgentOrchestrationOverview = lazy(() => import("./pages/agent-orchestration/Overview.tsx"));
const AgentOrchestrationPlaceholder = lazy(() => import("./pages/agent-orchestration/Placeholder.tsx"));
const IamAdminLayout = lazy(() => import("./pages/iam-admin/IamAdminLayout.tsx"));
const IamAdminOverview = lazy(() => import("./pages/iam-admin/Overview.tsx"));
const IamAdminPlaceholder = lazy(() => import("./pages/iam-admin/Placeholder.tsx"));
const FinOpsAdminLayout = lazy(() => import("./pages/finops-admin/FinOpsAdminLayout.tsx"));
const FinOpsAdminOverview = lazy(() => import("./pages/finops-admin/Overview.tsx"));
const FinOpsAdminPlaceholder = lazy(() => import("./pages/finops-admin/Placeholder.tsx"));
const CustomerHealthLayout = lazy(() => import("./pages/customer-health/CustomerHealthLayout.tsx"));
const CustomerHealthOverview = lazy(() => import("./pages/customer-health/Overview.tsx"));
const CustomerHealthDeployments = lazy(() => import("./pages/customer-health/Deployments.tsx"));
const CustomerHealthEvents = lazy(() => import("./pages/customer-health/Events.tsx"));
const CustomerHealthRegions = lazy(() => import("./pages/customer-health/Regions.tsx"));
const CustomerHealthDependencies = lazy(() => import("./pages/customer-health/Dependencies.tsx"));
const CustomerHealthSlos = lazy(() => import("./pages/customer-health/Slos.tsx"));
const CustomerHealthReports = lazy(() => import("./pages/customer-health/Reports.tsx"));
const CustomerHealthAlerts = lazy(() => import("./pages/customer-health/Alerts.tsx"));
const CustomerHealthSettings = lazy(() => import("./pages/customer-health/Settings.tsx"));
const DcfLayout = lazy(() => import("./pages/direct-commerce/DcfLayout.tsx"));
const DcfOverview = lazy(() => import("./pages/direct-commerce/Overview.tsx"));
const DcfOrders = lazy(() => import("./pages/direct-commerce/Orders.tsx"));
const DcfEntitlements = lazy(() => import("./pages/direct-commerce/Entitlements.tsx"));
const DcfLifterFulfillment = lazy(() => import("./pages/direct-commerce/LifterFulfillment.tsx"));
const DcfProvisioning = lazy(() => import("./pages/direct-commerce/Provisioning.tsx"));
const DcfReconciliation = lazy(() => import("./pages/direct-commerce/Reconciliation.tsx"));
const DcfCustomerTimeline = lazy(() => import("./pages/direct-commerce/CustomerTimeline.tsx"));
const DcfCatalog = lazy(() => import("./pages/direct-commerce/Catalog.tsx"));
const DcfIntegrations = lazy(() => import("./pages/direct-commerce/Integrations.tsx"));
const DcfWorkflowOverview = lazy(() => import("./pages/direct-commerce/WorkflowOverview.tsx"));



import SreAgenticNocLayout, { sreNocNav } from "./pages/operations/sre-agentic-noc/SreAgenticNocLayout.tsx";
const SreAgenticOpticalOperationsCenter = lazy(() => import("./pages/operations/sre-agentic-noc/SreAgenticOpticalOperationsCenter.tsx"));
const SreAgenticNocPlaceholder = lazy(() => import("./pages/operations/sre-agentic-noc/SreAgenticNocPlaceholder.tsx"));
const RunOpsCommand = lazy(() => import("./runops/pages/Command.tsx"));
const RunOpsExperienceEntry = lazy(() => import("./runops/pages/ExperienceEntry.tsx"));
const RunOpsPlaceholder = lazy(() => import("./runops/pages/RunOpsPlaceholder.tsx"));
const RunOpsNotFound = lazy(() => import("./runops/pages/RunOpsNotFound.tsx"));
const RunOpsDesignSystem = lazy(() => import("./runops/pages/DesignSystem.tsx"));
const RunOpsOperationsQueue = lazy(() => import("./runops/pages/OperationsQueue.tsx"));
const RunOpsServicePortfolio = lazy(() => import("./runops/pages/ServicePortfolio.tsx"));
const RunOpsServiceDigitalTwin = lazy(() => import("./runops/pages/ServiceDigitalTwin.tsx"));
const RunOpsTopologyExplorer = lazy(() => import("./runops/pages/TopologyExplorer.tsx"));
const RunOpsObservabilityExplorer = lazy(() => import("./runops/pages/ObservabilityExplorer.tsx"));
const RunOpsOperationalReadiness = lazy(() => import("./runops/pages/OperationalReadiness.tsx"));
const RunOpsRunbookLibrary = lazy(() => import("./runops/pages/RunbookLibrary.tsx"));
const RunOpsRunbookDetail = lazy(() => import("./runops/pages/RunbookDetail.tsx"));
const RunOpsRunbookObjectBuilder = lazy(() => import("./runops/pages/RunbookObjectBuilder.tsx"));
import { AwsCotsDigitalTwinPage } from "./runops/features/aws-cots-twin";
const RunOpsRunbookNew = lazy(() => import("./runops/pages/RunbookNew.tsx"));
const RunOpsRunbookDesigner = lazy(() => import("./runops/pages/RunbookDesigner.tsx"));
const RunOpsRunbookStepBuilder = lazy(() => import("./runops/pages/RunbookStepBuilder.tsx"));
const RunOpsRunbookPolicyDesigner = lazy(() => import("./runops/pages/RunbookPolicyDesigner.tsx"));
const RunOpsRunbookRecoveryDesigner = lazy(() => import("./runops/pages/RunbookRecoveryDesigner.tsx"));
const RunOpsRunbookTestLab = lazy(() => import("./runops/pages/RunbookTestLab.tsx"));
const RunOpsRunbookRelease = lazy(() => import("./runops/pages/RunbookRelease.tsx"));
const RunOpsRunbookTriggers = lazy(() => import("./runops/pages/RunbookTriggers.tsx"));
const RunOpsRunbookLaunchCenter = lazy(() => import("./runops/pages/RunbookLaunchCenter.tsx"));
const RunOpsGuidedExecution = lazy(() => import("./runops/pages/GuidedExecution.tsx"));
const RunOpsAutonomousExecutionMonitor = lazy(() => import("./runops/pages/AutonomousExecutionMonitor.tsx"));
const RunOpsApprovalCenter = lazy(() => import("./runops/pages/ApprovalCenter.tsx"));
const RunOpsEvidenceReplay = lazy(() => import("./runops/pages/EvidenceReplay.tsx"));
const RunOpsShiftHandoff = lazy(() => import("./runops/pages/ShiftHandoff.tsx"));
const RunOpsAlertTriage = lazy(() => import("./runops/pages/AlertTriage.tsx"));
const RunOpsIncidentCommand = lazy(() => import("./runops/pages/IncidentCommand.tsx"));
const RunOpsInvestigationWorkspace = lazy(() => import("./runops/pages/InvestigationWorkspace.tsx"));
const RunOpsHypothesisGraph = lazy(() => import("./runops/pages/HypothesisGraph.tsx"));
const RunOpsRemediationComparison = lazy(() => import("./runops/pages/RemediationComparison.tsx"));
const RunOpsStakeholderCommunications = lazy(() => import("./runops/pages/StakeholderCommunications.tsx"));
const RunOpsRecoveryValidation = lazy(() => import("./runops/pages/RecoveryValidation.tsx"));
const RunOpsPostmortem = lazy(() => import("./runops/pages/Postmortem.tsx"));
const RunOpsProblemActions = lazy(() => import("./runops/pages/ProblemActions.tsx"));
const RunOpsDigitalWorkerCatalog = lazy(() => import("./runops/pages/DigitalWorkerCatalog.tsx"));
const RunOpsDigitalWorkerStudio = lazy(() => import("./runops/pages/DigitalWorkerStudio.tsx"));
const RunOpsMultiAgentCollaboration = lazy(() => import("./runops/pages/MultiAgentCollaboration.tsx"));
const RunOpsAutomationRegistry = lazy(() => import("./runops/pages/AutomationRegistry.tsx"));
const RunOpsSloCenter = lazy(() => import("./runops/pages/SloCenter.tsx"));
const RunOpsRunbookFitness = lazy(() => import("./runops/pages/RunbookFitness.tsx"));
const RunOpsKnowledgeGraph = lazy(() => import("./runops/pages/KnowledgeGraph.tsx"));
const RunOpsAnalytics = lazy(() => import("./runops/pages/ReliabilityValueAnalytics.tsx"));
const RunOpsGovernance = lazy(() => import("./runops/pages/GovernanceCenter.tsx"));
const RunOpsExecutionSecurity = lazy(() => import("./runops/pages/ExecutionSecurity.tsx"));
const RunOpsAIGovernance = lazy(() => import("./runops/pages/AIGovernance.tsx"));
const RunOpsIntegrationHub = lazy(() => import("./runops/pages/IntegrationHub.tsx"));
const RunOpsDeveloperPortal = lazy(() => import("./runops/pages/DeveloperPortal.tsx"));
const RunOpsSupplyChain = lazy(() => import("./runops/pages/SupplyChain.tsx"));
const RunOpsPlatformHealth = lazy(() => import("./runops/pages/PlatformHealth.tsx"));
const RunOpsTenantProfileManager = lazy(() => import("./runops/pages/TenantProfileManager.tsx"));
import { routes as runopsRoutes } from "./runops/shell/routes.ts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <GuidanceAgentProvider>
        <ContextualAudioRoot>
        <LazyRouteBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/q/:token" element={<PublicQuestionnaire />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/no-access" element={<Navigate to="/app" replace />} />
          <Route path="/profile" element={<UpdateProfile />} />
          <Route path="/set-password" element={<ProtectedRoute><SetInitialPassword /></ProtectedRoute>} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
          <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/runops" element={<ProtectedRoute><RunOpsLayout /></ProtectedRoute>}>
            <Route index element={<RunOpsExperienceEntry />} />
            <Route path="command" element={<RunOpsCommand />} />
            <Route path="design-system" element={<RunOpsDesignSystem />} />
            <Route path="operations/queue" element={<RunOpsOperationsQueue />} />
            <Route path="services" element={<RunOpsServicePortfolio />} />
            <Route path="services/:serviceId" element={<RunOpsServiceDigitalTwin />} />
            <Route path="services/:serviceId/topology" element={<RunOpsTopologyExplorer />} />
            <Route path="services/:serviceId/observability" element={<RunOpsObservabilityExplorer />} />
            <Route path="services/:serviceId/readiness" element={<RunOpsOperationalReadiness />} />
            <Route path="aws-cots-digital-twin" element={<AwsCotsDigitalTwinPage />} />
            <Route path="runbooks" element={<RunOpsRunbookLibrary />} />
            <Route path="runbooks/new" element={<RunOpsRunbookNew />} />
            <Route path="runbooks/:runbookId" element={<RunOpsRunbookDetail />} />
            <Route path="runbooks/:runbookId/builder" element={<RunOpsRunbookObjectBuilder />} />
            <Route path="runbooks/:runbookId/designer" element={<RunOpsRunbookDesigner />} />
            <Route path="runbooks/:runbookId/steps/:stepId" element={<RunOpsRunbookStepBuilder />} />
            <Route path="runbooks/:runbookId/policy" element={<RunOpsRunbookPolicyDesigner />} />
            <Route path="runbooks/:runbookId/recovery" element={<RunOpsRunbookRecoveryDesigner />} />
            <Route path="runbooks/:runbookId/test" element={<RunOpsRunbookTestLab />} />
            <Route path="runbooks/:runbookId/release" element={<RunOpsRunbookRelease />} />
            <Route path="runbooks/:runbookId/triggers" element={<RunOpsRunbookTriggers />} />
            <Route path="runbooks/:runbookId/launch" element={<RunOpsRunbookLaunchCenter />} />
            <Route path="executions/:executionId/guided" element={<RunOpsGuidedExecution />} />
            <Route path="executions/:executionId/evidence" element={<RunOpsEvidenceReplay />} />
            <Route path="executions/:executionId" element={<RunOpsAutonomousExecutionMonitor />} />
            <Route path="approvals" element={<RunOpsApprovalCenter />} />
            <Route path="operations/handoff" element={<RunOpsShiftHandoff />} />
            <Route path="operations/alerts" element={<RunOpsAlertTriage />} />
            <Route path="incidents/:incidentId" element={<RunOpsIncidentCommand />} />
            <Route path="incidents/:incidentId/investigate" element={<RunOpsInvestigationWorkspace />} />
            <Route path="incidents/:incidentId/hypotheses" element={<RunOpsHypothesisGraph />} />
            <Route path="incidents/:incidentId/remediations" element={<RunOpsRemediationComparison />} />
            <Route path="incidents/:incidentId/communications" element={<RunOpsStakeholderCommunications />} />
            <Route path="incidents/:incidentId/recovery" element={<RunOpsRecoveryValidation />} />
            <Route path="incidents/:incidentId/postmortem" element={<RunOpsPostmortem />} />
            <Route path="problems/actions" element={<RunOpsProblemActions />} />
            <Route path="workers" element={<RunOpsDigitalWorkerCatalog />} />
            <Route path="workers/:workerId/studio" element={<RunOpsDigitalWorkerStudio />} />
            <Route path="workers/collaboration/:sessionId" element={<RunOpsMultiAgentCollaboration />} />
            <Route path="automation" element={<RunOpsAutomationRegistry />} />
            <Route path="reliability/slos" element={<RunOpsSloCenter />} />
            <Route path="runbooks/fitness" element={<RunOpsRunbookFitness />} />
            <Route path="knowledge" element={<RunOpsKnowledgeGraph />} />
            <Route path="analytics" element={<RunOpsAnalytics />} />
            <Route path="governance" element={<RunOpsGovernance />} />
            <Route path="security/execution" element={<RunOpsExecutionSecurity />} />
            <Route path="ai-governance" element={<RunOpsAIGovernance />} />
            <Route path="integrations" element={<RunOpsIntegrationHub />} />
            <Route path="developer" element={<RunOpsDeveloperPortal />} />
            <Route path="supply-chain" element={<RunOpsSupplyChain />} />
            <Route path="platform" element={<RunOpsPlatformHealth />} />
            <Route path="platform/tenant-profiles" element={<RunOpsTenantProfileManager />} />
            {runopsRoutes
              .filter((r) => r.path !== "" && r.path !== "command" && r.path !== "operations/queue" && r.path !== "services" && r.path !== "services/:serviceId" && r.path !== "services/:serviceId/topology" && r.path !== "services/:serviceId/observability" && r.path !== "services/:serviceId/readiness" && r.path !== "runbooks" && r.path !== "runbooks/new" && r.path !== "runbooks/fitness" && r.path !== "runbooks/:runbookId" && r.path !== "runbooks/:runbookId/designer" && r.path !== "runbooks/:runbookId/steps/:stepId" && r.path !== "runbooks/:runbookId/policy" && r.path !== "runbooks/:runbookId/recovery" && r.path !== "runbooks/:runbookId/test" && r.path !== "runbooks/:runbookId/release" && r.path !== "runbooks/:runbookId/triggers" && r.path !== "runbooks/:runbookId/launch" && r.path !== "executions/:executionId/guided" && r.path !== "executions/:executionId/evidence" && r.path !== "executions/:executionId" && r.path !== "approvals" && r.path !== "operations/handoff" && r.path !== "operations/alerts" && r.path !== "incidents/:incidentId" && r.path !== "incidents/:incidentId/investigate" && r.path !== "incidents/:incidentId/hypotheses" && r.path !== "incidents/:incidentId/remediations" && r.path !== "incidents/:incidentId/communications" && r.path !== "incidents/:incidentId/recovery" && r.path !== "incidents/:incidentId/postmortem" && r.path !== "problems/actions" && r.path !== "workers" && r.path !== "workers/:workerId/studio" && r.path !== "workers/collaboration/:sessionId" && r.path !== "automation" && r.path !== "reliability/slos" && r.path !== "knowledge" && r.path !== "analytics" && r.path !== "governance" && r.path !== "security/execution" && r.path !== "ai-governance" && r.path !== "integrations" && r.path !== "developer" && r.path !== "supply-chain" && r.path !== "platform" && r.path !== "platform/tenant-profiles")
              .map((r) => (
                <Route key={r.path} path={r.path} element={<RunOpsPlaceholder />} />
              ))}
            <Route path="*" element={<RunOpsNotFound />} />
          </Route>
          <Route path="/sead/command-center" element={<ProtectedRoute><SeadCommandCenter /></ProtectedRoute>} />
          <Route path="/sead/equipment-health-intelligence" element={<ProtectedRoute><SeadEquipmentHealth /></ProtectedRoute>} />
          <Route path="/sead/equipment-health-intelligence/:equipmentId" element={<ProtectedRoute><SeadEquipmentHealth /></ProtectedRoute>} />
          <Route path="/sead/cross-domain-context-twin" element={<ProtectedRoute><SeadCrossDomain /></ProtectedRoute>} />
          <Route path="/sead/maintenance-decision-simulator" element={<ProtectedRoute><SeadMaintenanceSim /></ProtectedRoute>} />
          <Route path="/sead/factory-impact-simulator" element={<ProtectedRoute><SeadFactoryImpact /></ProtectedRoute>} />
          <Route path="/sead/ai-maintenance-decision-center" element={<ProtectedRoute><SeadDecisionCenter /></ProtectedRoute>} />
          <Route path="/sead/human-governance-center" element={<ProtectedRoute><SeadHumanGovernance /></ProtectedRoute>} />
          <Route path="/sead/ai-reasoning-playback" element={<ProtectedRoute><SeadAIReasoningPlayback /></ProtectedRoute>} />
          <Route path="/sead/confidence-explorer" element={<ProtectedRoute><SeadConfidenceExplorer /></ProtectedRoute>} />
          <Route path="/sead/explainability" element={<ProtectedRoute><SeadExplainability /></ProtectedRoute>} />
          <Route path="/sead/what-if" element={<ProtectedRoute><SeadWhatIf /></ProtectedRoute>} />
          <Route path="/sead/knowledge-graph" element={<ProtectedRoute><SeadKnowledgeGraph /></ProtectedRoute>} />
          <Route path="/sead/operational-learning" element={<ProtectedRoute><SeadOperationalLearning /></ProtectedRoute>} />
          <Route path="/sead/outcome-tracker" element={<ProtectedRoute><SeadOutcomeTracker /></ProtectedRoute>} />
          <Route path="/sead/multi-agent-collaboration" element={<ProtectedRoute><SeadMultiAgentCollaboration /></ProtectedRoute>} />
          <Route path="/sead/human-in-the-loop" element={<ProtectedRoute><SeadHumanInTheLoop /></ProtectedRoute>} />
          <Route path="/sead/engineering-sandbox" element={<ProtectedRoute><SeadEngineeringSandbox /></ProtectedRoute>} />
          <Route path="/sead/digital-coworker-conversation" element={<ProtectedRoute><SeadDigitalCoworkerConversation /></ProtectedRoute>} />
          <Route path="/sead/iot-ai-architecture" element={<ProtectedRoute><SeadIotAiArchitecture /></ProtectedRoute>} />
          <Route path="/sead/simulation-comparison" element={<ProtectedRoute><SeadSimulationComparison /></ProtectedRoute>} />


          

          <Route path="/coworkers" element={<Coworkers />} />
          <Route path="/experience-feedback" element={<ExperienceFeedback />} />
          <Route path="/coworkers/network-connectivity-engineering" element={<CoworkersNetwork />} />
          <Route path="/coworkers/site-reliability-engineering" element={<CoworkersSRE />} />
          <Route path="/coworkers/identity-access-management" element={<CoworkersIAM />} />
          <Route path="/coworkers/identity-access-management/privileged-access" element={<PrivilegedAccessDashboard />} />
          <Route path="/coworkers/vulnerability-management" element={<CoworkersVuln />} />
          <Route path="/coworkers/vulnerability-management/zero-day-response" element={<VulnZeroDayDashboard />} />
          <Route path="/coworkers/site-reliability-engineering/release-deployment-rollout" element={<ReleaseDeploymentRollout />} />
          <Route path="/coworkers/site-reliability-engineering/slo-sla-sli-monitoring" element={<SloSlaSliMonitoring />} />
          <Route path="/coworkers/infrastructure-automation" element={<CoworkersInfra />} />
          <Route path="/coworkers/citrix-platform-digital-coworkers" element={<CitrixPlatformDigitalCoworkers />} />

          <Route path="/coworkers/application-support" element={<CoworkersApplicationSupport />} />
          <Route path="/coworkers/application-support/hadoop-health-precheck-agent" element={<HadoopHealthPrecheckAgent />} />
          <Route path="/coworkers/application-support/integration-monitoring-agent" element={<IntegrationMonitoringAgent />} />
          <Route path="/coworkers/application-support/etl-pipeline-trace-coworker" element={<EtlPipelineTraceCoworker />} />
          <Route path="/coworkers/infrastructure-automation/vmware-capacity-contention" element={<VmwareCapacityContention />} />
          <Route path="/coworkers/infrastructure-automation/server-provisioning-deprovisioning" element={<ServerProvisioningDeprovisioning />} />
          <Route path="/coworkers/infrastructure-automation/host-failure-early-warning" element={<HostFailureEarlyWarning />} />
          <Route path="/coworkers/infrastructure-automation/active-directory-health-replication" element={<ActiveDirectoryHealthReplication />} />
          <Route path="/coworkers/infrastructure-automation/patch-compliance-failure-remediation" element={<PatchComplianceFailureRemediation />} />
          <Route path="/coworkers/infrastructure-automation/time-drift-kerberos-integrity" element={<TimeDriftKerberosIntegrity />} />
          <Route path="/coworkers/infrastructure-automation/transaction-log-disk-pressure" element={<TransactionLogDiskPressure />} />
          <Route path="/coworkers/infrastructure-automation/third-party-dependency-health" element={<ThirdPartyDependencyHealth />} />
          <Route path="/coworkers/network-connectivity-engineering/firewall-rule-optimizer" element={<FirewallRuleOptimizer />} />
          <Route path="/coworkers/network-connectivity-engineering/zero-touch-policy-implementation" element={<ZeroTouchPolicyImplementation />} />
          <Route path="/coworkers/network-connectivity-engineering/zero-touch-s2s-vpn-implementation" element={<ZeroTouchS2SVPNImplementation />} />
          
          <Route path="/coworkers/it-carve-out-and-separation" element={<CoworkersCarveOut />} />
          <Route path="/coworkers/healthcare-payer" element={<HealthcarePayer />} />
          <Route path="/coworkers/healthcare-payer/prior-authorization" element={<PriorAuthorization />} />
          <Route path="/coworkers/healthcare-payer/stars-hedis-qarr" element={<StarsHedis />} />
          <Route path="/coworkers/healthcare-payer/member-renewal" element={<MemberRenewal />} />
          <Route path="/coworkers/healthcare-payer/dsnp-long-term-care" element={<DsnpLtc />} />
          <Route path="/coworkers/healthcare-payer/behavioral-health-transition" element={<BehavioralHealth />} />
          <Route path="/coworkers/healthcare-payer/medication-adherence" element={<MedicationAdherence />} />
          <Route path="/coworkers/healthcare-payer/pediatric-chw-screening" element={<PediatricChw />} />
          <Route path="/coworkers/healthcare-payer/chronic-disease" element={<ChronicDisease />} />
          <Route path="/coworkers/healthcare-payer/provider-experience" element={<ProviderExperience />} />
          <Route path="/coworkers/healthcare-payer/risk-adjustment" element={<RiskAdjustment />} />
          <Route path="/coworkers/healthcare-payer/claims-exception-appeals" element={<ClaimsExceptionAppeals />} />
          <Route path="/coworkers/healthcare-payer/health-equity" element={<HealthEquity />} />
          <Route path="/coworkers/healthcare-payer/fhir-cms-api" element={<FhirCmsApi />} />
          <Route path="/coworkers/healthcare-payer/hie-integration" element={<HieIntegration />} />
          <Route path="/coworkers/healthcare-payer/provider-portal-availity" element={<ProviderPortalAvaility />} />
          <Route path="/coworkers/healthcare-payer/edi-clearinghouse" element={<EdiClearinghouse />} />
          <Route path="/coworkers/healthcare-payer/pa-config-governance" element={<PaConfigGovernance />} />
          <Route path="/coworkers/healthcare-payer/data-quality-identity" element={<DataQualityIdentity />} />
          <Route path="/coworkers/healthcare-payer/major-incident-business-impact" element={<MajorIncidentBusinessImpact />} />
          <Route path="/coworkers/healthcare-payer/vendor-saas-risk" element={<VendorSaasRisk />} />
          <Route path="/coworkers/healthcare-payer/identity-oauth-governance" element={<IdentityOauthGovernance />} />
          <Route path="/coworkers/healthcare-payer/ai-model-governance" element={<AiModelGovernance />} />
          <Route path="/coworkers/it-carve-out-and-separation/escc/overview" element={<EsccOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/escc/solution-design" element={<EsccSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/escc/operational-dashboard" element={<EsccDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/euc/overview" element={<EucOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/euc/solution-design" element={<EucSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/euc/operational-dashboard" element={<EucDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/sdt/overview" element={<SdtOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/sdt/solution-design" element={<SdtSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/sdt/operational-dashboard" element={<SdtDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/shx/overview" element={<ShxOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/shx/solution-design" element={<ShxSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/shx/operational-dashboard" element={<ShxDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/ads/overview" element={<AdsOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/ads/solution-design" element={<AdsSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/ads/operational-dashboard" element={<AdsDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/ioc/overview" element={<IocOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/ioc/solution-design" element={<IocSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/ioc/operational-dashboard" element={<IocDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/ncc/overview" element={<NccOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/ncc/solution-design" element={<NccSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/ncc/operational-dashboard" element={<NccDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/iat/overview" element={<IatOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/iat/solution-design" element={<IatSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/iat/operational-dashboard" element={<IatDashboard />} />
          <Route path="/coworkers/it-carve-out-and-separation/cmm/overview" element={<CmmOverview />} />
          <Route path="/coworkers/it-carve-out-and-separation/cmm/solution-design" element={<CmmSolutionDesign />} />
          <Route path="/coworkers/it-carve-out-and-separation/cmm/operational-dashboard" element={<CmmDashboard />} />
          <Route path="/coworkers/deploy" element={<DeployCoworker />} />
          
          <Route path="/operational-friction-index" element={<OperationalFrictionIndex />} />
          <Route path="/reliability-foundations" element={<ReliabilityFoundations />} />
          <Route path="/reliability-foundations/google-sre" element={<GoogleSre />} />
         <Route path="/reliability-foundations/google-sre/how-to-achieve" element={<HowToAchieveGoogleSre />} />
         <Route path="/reliability-foundations/team-topologies" element={<TeamTopologies />} />
        <Route path="/reliability-foundations/team-topologies/future-state-org" element={<FutureStateReliabilityOrg />} />
        <Route path="/reliability-foundations/team-topologies/functional-org-chart" element={<FunctionalOrgChart />} />
        <Route path="/reliability-foundations/platform-engineering/design-principles" element={<PlatformEngineeringDesignPrinciples />} />
        <Route path="/reliability-foundations/platform-engineering/how-to-build" element={<HowToBuildPlatformEngineering />} />
       <Route path="/reliability-foundations/platform-engineering/capability-model" element={<PlatformAsAProduct />} />
       <Route path="/reliability-foundations/finops/operations-console" element={<FinOpsOperationsConsole />} />
          <Route path="/product-reliability-anatomy" element={<ProductReliabilityAnatomy />} />
          <Route path="/transformation-journey" element={<TransformationJourney />} />
          <Route path="/product-reliability-transformation-index" element={<OperationalFrictionIndex />} />
          <Route path="/agentic-finops" element={<FinOpsLayout />}>
            <Route index element={<FinOpsOverview />} />
            <Route path="overview" element={<FinOpsOverview />} />
            <Route path="resource-rightsizing" element={<ResourceRightsizingWorkspace />} />
            <Route path="idle-orphaned-resources" element={<IdleOrphanedResourcesWorkspace />} />
            <Route path="commitment-optimization" element={<CommitmentOptimizationWorkspace />} />
            <Route path="elasticity-scheduling" element={<ElasticitySchedulingWorkspace />} />
            <Route path="storage-data-lifecycle" element={<StorageDataLifecycleWorkspace />} />
            <Route path="network-data-movement" element={<NetworkDataMovementWorkspace />} />
            <Route path="platform-architecture-efficiency" element={<PlatformArchitectureEfficiencyWorkspace />} />
            <Route path="kubernetes-economics" element={<KubernetesEconomicsWorkspace />} />
            <Route path="governance-realization" element={<GovernanceRealizationWorkspace />} />
          </Route>
          <Route path="/data-orchestration-twin" element={<DataOrchLayout />}>
            <Route index element={<DataOrchExecutiveControlPlane />} />
            <Route path="executive-control-plane" element={<DataOrchExecutiveControlPlane />} />
            <Route path="use-case-to-data-contract-mapper" element={<UseCaseToDataContractMapper />} />
            <Route path="log-source-inventory-and-scope-registry" element={<LogSourceInventoryAndScopeRegistry />} />
            <Route path="log-source-inventory-and-scope-registry/datadog-log-profile" element={<DataDogLogProfile />} />
            <Route path="log-source-inventory-and-scope-registry/:slug/cyber-threat-intelligence" element={<CyberThreatIntelligenceAndIocAnalysis />} />
            <Route path="data-placement-and-economics-decision-engine" element={<DataPlacementDecisionEngine />} />
            <Route path="data-placement-and-economics-decision-engine/scenario/:slug" element={<PlacementScenarioModeler />} />
            <Route path="no-duplication-strategy-and-retention-policy" element={<NoDuplicationStrategyAndRetentionPolicy />} />
            <Route path="no-duplication-strategy-and-retention-policy/scenario/:slug" element={<NoDuplicationScenarioModeler />} />
            <Route path="options-and-tradeoff-matrix" element={<OptionsAndTradeoffMatrix />} />
            <Route path="connector-access-and-governance-registry" element={<ConnectorAccessGovernanceRegistry />} />
            <Route path="connector-access-and-governance-registry/method/:slug" element={<ConnectionMethodProfile />} />
            <Route path="fetch-orchestration-scheduler" element={<FetchOrchestrationScheduler />} />
            <Route path="fetch-orchestration-scheduler/schedule-builder/:slug" element={<ScheduleBuilder />} />
            <Route path="source-onboarding-factory" element={<SourceOnboardingFactory />} />
            <Route path="assisted-schema-discovery-and-field-mapping" element={<AssistedSchemaDiscoveryAndFieldMapping />} />
            <Route path="schema-drift-and-exception-workbench" element={<SchemaDriftAndExceptionWorkbench />} />
            <Route path="log-hygiene-completeness-and-standardization-console" element={<LogHygieneCompletenessAndStandardizationConsole />} />
            <Route path="hydration-and-enrichment-method-selector" element={<HydrationAndEnrichmentMethodSelector />} />
            <Route path="hydrated-record-builder" element={<HydratedRecordBuilder />} />
            <Route path="data-lineage-and-traceability-view" element={<DataLineageAndTraceabilityView />} />
            <Route path="canonical-operational-data-model" element={<CanonicalOperationalDataModel />} />
            <Route path="relationship-key-and-graph-projection-builder" element={<RelationshipKeyAndGraphProjectionBuilder />} />
            <Route path="query-readiness-and-confidence-scorecard" element={<QueryReadinessAndConfidenceScorecard />} />
            <Route path="performance-latency-and-freshness-lab" element={<PerformanceLatencyAndFreshnessLab />} />
            <Route path="context-graph-and-agentic-query-handoff-layer" element={<ContextGraphAndAgenticQueryHandoffLayer />} />
            <Route path="data-gap-register-and-engineering-backlog" element={<DataGapRegisterAndEngineeringBacklog />} />
            <Route path="sow-execution-plan-and-acceptance-dashboard" element={<SowExecutionPlanAndAcceptanceDashboard />} />
            <Route path=":slug" element={<DataOrchPage />} />
          </Route>
          <Route path="/enterprise-cognitive-fabric" element={<EcfLayout />}>
            <Route index element={<EcfLanding />} />
            <Route path="command-center" element={<EnterpriseCommandCenter />} />
            <Route path="enterprise-overview" element={<EnterpriseCommandCenter />} />
            <Route path="enterprise-source-discovery" element={<EnterpriseSourceDiscovery />} />
            <Route path="discovery/source-discovery" element={<EnterpriseSourceDiscovery />} />
            <Route path="discovery/ingestion-normalization" element={<DiscoveryScaffold />} />
            <Route path="discovery/configuration" element={<DiscoveryConfiguration />} />
            <Route path="discovery/discovery-configuration" element={<DiscoveryConfiguration />} />
            <Route path="discovery-configuration" element={<DiscoveryConfiguration />} />

            <Route path="discovery/pipelines" element={<DiscoveryPipeline />} />
            <Route path="discovery/pipeline" element={<DiscoveryPipeline />} />

            <Route path="discovery/source-registry" element={<DiscoveryRegistry />} />
            <Route path="discovery/registry" element={<DiscoveryRegistry />} />
            <Route path="discovery/connector-health" element={<DiscoveryConnectorHealth />} />
            <Route path="discovery/artifact-ingestion" element={<ArtifactIngestion />} />
            <Route path="artifact-ingestion" element={<ArtifactIngestion />} />
            <Route path="discovery/artifact-normalization" element={<ArtifactNormalization />} />
            <Route path="artifact-normalization" element={<ArtifactNormalization />} />
            <Route path="discovery/business-condition-extraction" element={<BusinessConditionExtraction />} />
            <Route path="business-condition-extraction" element={<BusinessConditionExtraction />} />
            <Route path="persona-studio/team-persona-construction" element={<TeamPersonaConstruction />} />
            <Route path="team-persona-construction" element={<TeamPersonaConstruction />} />
            <Route path="persona-studio/team-persona-library" element={<TeamPersonaLibrary />} />
            <Route path="team-persona-library" element={<TeamPersonaLibrary />} />
            <Route path="modeling-memory/cloud-finops-attribute-store" element={<CloudFinOpsAttributeStore />} />
            <Route path="persona-studio/cloud-finops-attribute-store" element={<CloudFinOpsAttributeStore />} />
            <Route path="persona-studio/persona-validation" element={<PersonaValidation />} />
            <Route path="persona-validation" element={<PersonaValidation />} />
            <Route path="cognitive-memory/enterprise-cognitive-memory" element={<EnterpriseCognitiveMemory />} />
            <Route path="enterprise-cognitive-memory" element={<EnterpriseCognitiveMemory />} />
            <Route path="persona-studio/persona-version-history" element={<PersonaStudioScaffold title="Persona Version History" purpose="Version lineage, change summaries, and approval history for Team Personas." />} />
            <Route path="evaluation/cognitive-intake" element={<CognitiveIntake />} />
            <Route path="cognitive-intake" element={<CognitiveIntake />} />
            <Route path="evaluation/cognitive-readiness-assessment" element={<CognitiveReadinessAssessment />} />
            <Route path="cognitive-readiness-assessment" element={<CognitiveReadinessAssessment />} />

            <Route path="evaluation/persona-impact-analysis" element={<PersonaImpactAnalysis />} />
            <Route path="persona-impact-analysis" element={<PersonaImpactAnalysis />} />
            <Route path="evaluation/cross-team-impact-matrix" element={<CrossTeamImpactAnalysis />} />
            <Route path="evaluation/cross-team-impact-analysis" element={<CrossTeamImpactAnalysis />} />
            <Route path="cross-team-impact-matrix" element={<CrossTeamImpactAnalysis />} />
            <Route path="evaluation/decision-intelligence" element={<DecisionIntelligence />} />
            <Route path="decision-intelligence" element={<DecisionIntelligence />} />
            <Route path="learning/organizational-learning" element={<OrganizationalLearning />} />
            <Route path="organizational-learning" element={<OrganizationalLearning />} />
            <Route path="health/enterprise-cognitive-health" element={<EnterpriseCognitiveHealth />} />
            <Route path="enterprise-cognitive-health" element={<EnterpriseCognitiveHealth />} />

            <Route path=":slug" element={<EcfPage />} />
          </Route>
          <Route path="/measuring-success" element={<MeasuringSuccess />} />
          
          <Route path="/executive-service-owner-twin" element={<ExecutiveServiceOwnerTwin />} />
          <Route path="/delivery-org-twin" element={<DeliveryOrgTwin />} />
          <Route path="/engagement-manager-twin" element={<EngagementManagerTwin />} />
          <Route element={<NocLayout />}>
            <Route path="/operations/traditional-noc/global-optical-operations" element={<TraditionalNocOperationsCenter />} />
          </Route>
          <Route element={<SreAgenticNocLayout />}>
            <Route path="/operations/sre-agentic-noc" element={<SreAgenticOpticalOperationsCenter />} />
            <Route path="/operations/sre-agentic-noc/global-optical-operations" element={<SreAgenticOpticalOperationsCenter />} />
            {sreNocNav
              .filter((item) => item.to !== "/operations/sre-agentic-noc/global-optical-operations")
              .map((item) => (
                <Route key={item.to} path={item.to} element={<SreAgenticNocPlaceholder />} />
              ))}
          </Route>
          <Route path="/agentic-sre-noc" element={<NocLayout />}>

            <Route index element={<GlobalOpticalOperationsCenter />} />
            <Route path="customer-service-health" element={<CustomerServiceHealthExplorer />} />
            <Route path="global-link-health-twin" element={<GlobalLinkHealthTwin />} />
            <Route path="global-link-health-twin/production-architecture" element={<GlhtProductionArchitecture />} />
            <Route path="global-link-health-twin/predictive-optical-link-intelligence" element={<PredictiveOpticalLinkIntelligence />} />
            <Route path="service-topology" element={<GlobalOpticalServiceTopology />} />
            <Route path="predictive-link-risk" element={<PredictiveLinkRiskCenter />} />
            <Route path="situation-room" element={<ActiveSituationRoom />} />
            <Route path="investigation" element={<AgenticInvestigationWorkspace />} />
            <Route path="approvals" element={<HumanApprovalActionCenter />} />
            <Route path="recovery" element={<AutonomousRecoveryMonitor />} />
            <Route path="slo-error-budget" element={<NocPage slug="slo-error-budget" />} />
            <Route path="executive-value" element={<NocPage slug="executive-value" />} />
          </Route>
          <Route path="/agentic-iac-engineering" element={<IacLayout />}>
            <Route index element={<AzureConnections />} />
            <Route path="connections" element={<AzureConnections />} />
            <Route path="resources" element={<AzureResources />} />
            <Route path="resources/virtual-machines/:vmName" element={<AssetDigitalTwin />} />
            <Route path="remediation-intelligence" element={<RemediationIntelligence />} />
            <Route path="remediation-intelligence/:assetId" element={<RemediationIntelligence />} />
            <Route path="change-engineering" element={<ChangeEngineering />} />
            <Route path="change-engineering/:assetId" element={<ChangeEngineering />} />
            <Route path="change-review" element={<ChangeReviewApproval />} />
            <Route path="change-review/:packageId" element={<ChangeReviewApproval />} />
            <Route path="execution-center" element={<ExecutionCenter />} />
            <Route path="execution-center/:packageId" element={<ExecutionCenter />} />
          </Route>
          <Route path="/context-evidence" element={<ContextEvidenceLayout />}>
            <Route index element={<Navigate to="/context-evidence/overview" replace />} />
            <Route path="overview" element={<ContextEvidenceOverview />} />
            <Route path="sources" element={<ContextEvidencePlaceholder />} />
            <Route path="data-model" element={<ContextEvidencePlaceholder />} />
            <Route path="indexing" element={<ContextEvidencePlaceholder />} />
            <Route path="policies" element={<ContextEvidencePlaceholder />} />
            <Route path="quality" element={<ContextEvidencePlaceholder />} />
            <Route path="access" element={<ContextEvidencePlaceholder />} />
            <Route path="settings" element={<ContextEvidencePlaceholder />} />
          </Route>
          <Route path="/models-routing" element={<ModelsRoutingLayout />}>
            <Route index element={<Navigate to="/models-routing/overview" replace />} />
            <Route path="overview" element={<ModelsRoutingOverview />} />
            <Route path="models" element={<ModelsRoutingPlaceholder />} />
            <Route path="providers" element={<ModelsRoutingPlaceholder />} />
            <Route path="policies" element={<ModelsRoutingPlaceholder />} />
            <Route path="guardrails" element={<ModelsRoutingPlaceholder />} />
            <Route path="evaluations" element={<ModelsRoutingPlaceholder />} />
            <Route path="cost" element={<ModelsRoutingPlaceholder />} />
            <Route path="access" element={<ModelsRoutingPlaceholder />} />
            <Route path="settings" element={<ModelsRoutingPlaceholder />} />
          </Route>

          <Route path="/agent-orchestration" element={<AgentOrchestrationLayout />}>
            <Route index element={<Navigate to="/agent-orchestration/overview" replace />} />
            <Route path="overview" element={<AgentOrchestrationOverview />} />
            <Route path="workflows" element={<AgentOrchestrationPlaceholder />} />
            <Route path="participants" element={<AgentOrchestrationPlaceholder />} />
            <Route path="state" element={<AgentOrchestrationPlaceholder />} />
            <Route path="policies" element={<AgentOrchestrationPlaceholder />} />
            <Route path="tools" element={<AgentOrchestrationPlaceholder />} />
            <Route path="runs" element={<AgentOrchestrationPlaceholder />} />
            <Route path="evaluation" element={<AgentOrchestrationPlaceholder />} />
            <Route path="settings" element={<AgentOrchestrationPlaceholder />} />
          </Route>

          <Route path="/iam-admin" element={<IamAdminLayout />}>
            <Route index element={<Navigate to="/iam-admin/overview" replace />} />
            <Route path="overview" element={<IamAdminOverview />} />
            <Route path="identities" element={<IamAdminPlaceholder />} />
            <Route path="digital-coworkers" element={<IamAdminPlaceholder />} />
            <Route path="roles" element={<IamAdminPlaceholder />} />
            <Route path="policies" element={<IamAdminPlaceholder />} />
            <Route path="delegation" element={<IamAdminPlaceholder />} />
            <Route path="credentials" element={<IamAdminPlaceholder />} />
            <Route path="reviews" element={<IamAdminPlaceholder />} />
            <Route path="audit" element={<IamAdminPlaceholder />} />
            <Route path="settings" element={<IamAdminPlaceholder />} />
          </Route>

          <Route path="/finops-admin" element={<FinOpsAdminLayout />}>
            <Route index element={<Navigate to="/finops-admin/overview" replace />} />
            <Route path="overview" element={<FinOpsAdminOverview />} />
            <Route path="cost-policies" element={<FinOpsAdminPlaceholder />} />
            <Route path="cloud-accounts" element={<FinOpsAdminPlaceholder />} />
            <Route path="optimization-registry" element={<FinOpsAdminPlaceholder />} />
            <Route path="unit-economics" element={<FinOpsAdminPlaceholder />} />
            <Route path="approval-execution" element={<FinOpsAdminPlaceholder />} />
            <Route path="savings-validation" element={<FinOpsAdminPlaceholder />} />
            <Route path="evaluations" element={<FinOpsAdminPlaceholder />} />
            <Route path="access-security" element={<FinOpsAdminPlaceholder />} />
            <Route path="settings" element={<FinOpsAdminPlaceholder />} />
          </Route>


          <Route path="/intelligent-iac" element={<IacLayout />}>
            <Route index element={<AzureConnections />} />
            <Route path="connections" element={<AzureConnections />} />
            <Route path="resources" element={<AzureResources />} />
            <Route path="resources/virtual-machines/:vmName" element={<AssetDigitalTwin />} />
            <Route path="remediation-intelligence" element={<RemediationIntelligence />} />
            <Route path="remediation-intelligence/:assetId" element={<RemediationIntelligence />} />
            <Route path="change-engineering" element={<ChangeEngineering />} />
            <Route path="change-engineering/:assetId" element={<ChangeEngineering />} />
            <Route path="change-review" element={<ChangeReviewApproval />} />
            <Route path="change-review/:packageId" element={<ChangeReviewApproval />} />
            <Route path="execution" element={<ExecutionCenter />} />
            <Route path="execution/:packageId" element={<ExecutionCenter />} />
            <Route path="validation/:packageId" element={<ValidationEvidence />} />
            <Route path="validation" element={<ValidationEvidence />} />
            <Route path="platform/deployment-architecture" element={<DeploymentArchitecture />} />
            <Route path="platform/integrations" element={<IntegrationsConnectivity />} />
            <Route path="platform/access-security" element={<AccessGovernance />} />
            <Route path="platform/policies-governance" element={<PoliciesGovernance />} />
            <Route path="platform/audit-compliance" element={<PlatformAdminPlaceholder />} />
            <Route path="platform/system-settings" element={<SystemSettingsPage />} />

          </Route>



          <Route path="/customer-health" element={<CustomerHealthLayout />}>
            <Route index element={<CustomerHealthOverview />} />
            <Route path="deployments" element={<CustomerHealthDeployments />} />
            <Route path="events" element={<CustomerHealthEvents />} />
            <Route path="regions" element={<CustomerHealthRegions />} />
            <Route path="dependencies" element={<CustomerHealthDependencies />} />
            <Route path="slos" element={<CustomerHealthSlos />} />
            <Route path="reports" element={<CustomerHealthReports />} />
            <Route path="alerts" element={<CustomerHealthAlerts />} />
            <Route path="settings" element={<CustomerHealthSettings />} />
          </Route>

          <Route path="/direct-commerce" element={<DcfLayout />}>
            <Route index element={<DcfOverview />} />
            <Route path="orders" element={<DcfOrders />} />
            <Route path="entitlements" element={<DcfEntitlements />} />
            <Route path="lifter-fulfillment" element={<DcfLifterFulfillment />} />
            <Route path="provisioning" element={<DcfProvisioning />} />
            <Route path="reconciliation" element={<DcfReconciliation />} />
            <Route path="timeline" element={<DcfCustomerTimeline />} />
            <Route path="catalog" element={<DcfCatalog />} />
            <Route path="integrations" element={<DcfIntegrations />} />
          </Route>
          <Route path="/direct-commerce/workflow-overview" element={<DcfWorkflowOverview />} />


          <Route element={<SreLayout />}>

            <Route path="/prod-resilience-twin" element={<ProdResilienceTwin />} />
            <Route path="/product-line-map" element={<ProductLineMap />} />
            <Route path="/golden-workflow-map" element={<GoldenWorkflowMap />} />
            <Route path="/production-topology" element={<ProductionTopology />} />
            <Route path="/sre-operating-model" element={<SreOperatingModel />} />
            <Route path="/signal-intelligence" element={<SignalIntelligence />} />
            <Route path="/enterprise-cloud-twin" element={<ScenarioStateProvider><EnterpriseCloudTwin /></ScenarioStateProvider>} />
            <Route path="/aws-resilience-architecture-twin" element={<AWSResilienceArchitectureTwin />} />
            <Route path="/platform-engineering-factory" element={<PlatformEngineeringFactory />} />
            <Route path="/hybrid-cloud-workbench" element={<HybridCloudWorkbench />} />
            <Route path="/automation-marketplace" element={<AutomationMarketplace />} />
            <Route path="/modernization-factory" element={<ModernizationFactory />} />
            <Route path="/cyber-resilience-overlay" element={<CyberResilienceOverlay />} />
            <Route path="/ai-coworker-control-room" element={<AiCoworkerControlRoom />} />
            <Route path="/transition-dual-run" element={<TransitionDualRun />} />
            <Route path="/acquisition-onboarding-factory" element={<AcquisitionOnboardingFactory />} />
            <Route path="/value-creation-board" element={<ValueCreationBoard />} />
            <Route path="/modernization-roadmap" element={<ModernizationRoadmap />} />
            <Route path="/interactive-demo-center" element={<InteractiveDemoCenter />} />
            <Route path="/modernization-roadmap-v2" element={<ModernizationRoadmapV2 />} />
          </Route>
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/change" element={<ChangeManagement />} />
          <Route path="/neugain" element={<NeuGAIN />} />
          <Route path="/carve-out" element={<CarveOut />} />
          <Route path="/carve-out/euc/workforce-readiness-command-center-day-1-view" element={<WorkforceReadiness />} />
          <Route path="/carve-out/euc/device-provisioning-factory-global-view" element={<DeviceProvisioningFactory />} />
          <Route path="/carve-out/euc/golden-image-and-configuration-control-plane" element={<GoldenImage />} />
          <Route path="/carve-out/euc/persona-based-device-assignment-engine" element={<PersonaAssignment />} />
          <Route path="/carve-out/euc/identity-and-access-cutover-dashboard" element={<IdentityCutover />} />
          <Route path="/carve-out/euc/vdi-and-day-1-continuity-layer" element={<VdiContinuity />} />
          <Route path="/carve-out/euc/global-logistics-and-field-services-orchestration" element={<GlobalLogistics />} />
          <Route path="/carve-out/euc/endpoint-health-and-experience-monitoring" element={<EndpointHealth />} />
          <Route path="/carve-out/euc/digital-coworker-euc-automation-console" element={<DigitalCoworkerEuc />} />
          <Route path="/carve-out/euc/self-service-and-agentic-support-experience" element={<SelfServiceSupport />} />
          <Route path="/carve-out/euc/asset-lifecycle-and-financial-optimization" element={<AssetLifecycle />} />
          <Route path="/carve-out/network/global-network-separation-command-center-day-1-view" element={<NetworkSeparationCommand />} />
          <Route path="/carve-out/network/network-topology-and-architecture-control-plane" element={<NetworkTopology />} />
          <Route path="/carve-out/network/site-connectivity-readiness-dashboard" element={<SiteConnectivity />} />
          <Route path="/carve-out/network/wan-sd-wan-orchestration-console" element={<WanSdwan />} />
          <Route path="/carve-out/network/data-center-and-cloud-connectivity-fabric" element={<DcCloudFabric />} />
          <Route path="/carve-out/network/firewall-security-and-zero-trust-control-layer" element={<FirewallZeroTrust />} />
          <Route path="/carve-out/network/network-provisioning-and-build-factory" element={<NetworkProvisioningFactory />} />
          <Route path="/carve-out/network/field-network-deployment-orchestration" element={<FieldNetworkDeployment />} />
          <Route path="/carve-out/network/noc-operations-command-center-live-ops" element={<NocOperations />} />
          <Route path="/carve-out/network/network-experience-and-performance-analytics" element={<NetworkExperience />} />
          <Route path="/carve-out/network/digital-coworker-network-automation-console" element={<DigitalCoworkerNetwork />} />
          <Route path="/carve-out/network/network-cost-and-vendor-optimization-dashboard" element={<NetworkCostOptimization />} />
          <Route path="/carve-out/infra/infrastructure-separation-command-center-day-1-view" element={<InfraSeparationCommand />} />
          <Route path="/carve-out/infra/data-center-topology-and-dependency-mapping-control-plane" element={<InfraTopology />} />
          <Route path="/carve-out/infra/environment-carve-out-and-replication-tracker" element={<EnvCarveOut />} />
          <Route path="/carve-out/infra/server-provisioning-and-build-factory-compute-layer" element={<ServerStorageFactory />} />
          <Route path="/carve-out/infra/storage-and-data-platform-readiness-dashboard" element={<StorageDataReadiness />} />
          <Route path="/carve-out/infra/hybrid-infrastructure-placement-decision-engine-on-prem-vs-cloud" element={<HybridPlacement />} />
          <Route path="/carve-out/infra/data-center-exit-and-migration-orchestration-console" element={<DcExitMigration />} />
          <Route path="/carve-out/infra/field-infrastructure-deployment-and-rack-integration-tracker" element={<FieldInfraDeployment />} />
          <Route path="/carve-out/infra/infrastructure-operations-command-center-live-ops" element={<InfraOperations />} />
          <Route path="/carve-out/infra/workload-performance-and-capacity-analytics" element={<WorkloadPerformance />} />
          <Route path="/carve-out/infra/digital-coworker-infrastructure-automation-console" element={<DigitalCoworkerInfra />} />
          <Route path="/carve-out/infra/infrastructure-cost-capacity-and-optimization-finops-for-infra" element={<InfraFinOps />} />
          <Route path="/carve-out/cloud/cloud-transformation-command-center-day-1-and-future-state-view" element={<CloudTransformation />} />
          <Route path="/carve-out/cloud/cloud-architecture-and-landing-zone-control-plane" element={<LandingZone />} />
          <Route path="/carve-out/cloud/application-portfolio-rationalization-and-migration-decision-engine" element={<AppPortfolioRationalization />} />
          <Route path="/carve-out/cloud/migration-wave-planning-and-execution-orchestration-console" element={<MigrationWavePlanning />} />
          <Route path="/carve-out/cloud/hybrid-cloud-connectivity-and-integration-fabric" element={<HybridCloudFabric />} />
          <Route path="/carve-out/cloud/multi-region-resiliency-and-disaster-recovery-control-layer" element={<MultiRegionDR />} />
          <Route path="/carve-out/cloud/cloud-migration-factory-build-deploy-validate" element={<CloudMigrationFactory />} />
          <Route path="/carve-out/cloud/cloud-security-and-governance-cspm-policy-control-plane" element={<CloudSecurityCspm />} />
          <Route path="/carve-out/cloud/cloud-operations-command-center-live-ops" element={<CloudOperations />} />
          <Route path="/carve-out/cloud/cloud-performance-reliability-and-experience-analytics" element={<CloudPerformanceAnalytics />} />
          <Route path="/carve-out/cloud/digital-coworker-cloud-automation-marketplace" element={<DigitalCoworkerCloud />} />
          <Route path="/carve-out/cloud/cloud-finops-cost-optimization-and-value-realization-dashboard" element={<CloudFinOps />} />
          <Route path="/carve-out/:group/:slug" element={<CarveOutPage />} />
          <Route path="/assurance" element={<AssuranceCommand />} />
          <Route path="/assurance/workflow-detail" element={<WorkflowDetail />} />
          <Route path="/assurance/execute" element={<LiveExecution />} />
          <Route path="/itsm" element={<Itsm />} />
          <Route path="/itsm/auto-ticket-categorization" element={<AutoTicketCategorization />} />
          <Route path="/itsm/auto-ticket-categorization/incident-console" element={<AtcIncidentConsole />} />
          <Route path="/itsm/auto-ticket-categorization/ticket-queue" element={<AtcTicketQueue />} />
          <Route path="/itsm/auto-ticket-categorization/my-team" element={<AtcMyTeam />} />
          <Route path="/itsm/auto-ticket-categorization/sla-kpis" element={<AtcSlaKpis />} />
          <Route path="/itsm/auto-ticket-categorization/knowledge-base" element={<AtcKnowledgeBase />} />
          <Route path="/itsm/auto-ticket-categorization/reports" element={<AtcReports />} />
          <Route path="/itsm/auto-ticket-categorization/auto" element={<AtcAutoConfig />} />
          <Route path="/itsm/auto-ticket-categorization/major-incidents" element={<AtcMajorIncidents />} />
          <Route path="/itsm/auto-ticket-categorization/escalations" element={<AtcEscalations />} />
          <Route path="/itsm/auto-ticket-categorization/change-calendar" element={<AtcChangeCalendar />} />
          <Route path="/itsm/auto-ticket-categorization/on-call-schedule" element={<AtcOnCallSchedule />} />
          <Route path="/itsm/auto-ticket-categorization/business-services" element={<AtcBusinessServices />} />
          <Route path="/itsm/auto-ticket-categorization/assignments" element={<AtcAssignments />} />
          <Route path="/itsm/auto-ticket-categorization/categorization-rules" element={<AtcCategorizationRules />} />
          <Route path="/itsm/auto-ticket-categorization/integrations" element={<AtcIntegrations />} />
          <Route path="/itsm/exec-biz-ops" element={<ExecBizOps />} />
          <Route path="/itsm/exec-biz-ops/executive-command-center" element={<ExecutiveCommandCenter />} />
          <Route path="/itsm/exec-biz-ops/business-services" element={<ItsmBusinessServices />} />
          <Route path="/itsm/exec-biz-ops/customer-experience" element={<ItsmCustomerExperience />} />
          <Route path="/itsm/exec-biz-ops/sla-slo-error-budget" element={<ItsmSlaSloErrorBudget />} />
          <Route path="/itsm/exec-biz-ops/risk-exposure" element={<ItsmRiskExposure />} />

          <Route path="/crm" element={<ProtectedRoute><CompaniesList /></ProtectedRoute>} />
          <Route path="/crm/companies/:companyId" element={<ProtectedRoute><CompanyWorkspace /></ProtectedRoute>} />
          <Route path="/crm/companies/:companyId/stakeholders/new" element={<ProtectedRoute><StakeholderFormPage /></ProtectedRoute>} />
          <Route path="/crm/companies/:companyId/stakeholders/:stakeholderId" element={<ProtectedRoute><StakeholderFormPage /></ProtectedRoute>} />
          <Route path="/practice-library" element={<PracticeLibrary />} />
          <Route path="/practice-library/table-of-contents" element={<TableOfContents />} />
          <Route path="/practice-library/it-service-desk-itsm" element={<ItsmDashboard />} />
          <Route path="/practice-library/digital-workplace-euc" element={<EucPracticeDashboard />} />
          <Route path="/practice-library/infrastructure-hybrid-platform" element={<InfraDashboard />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/power-admin-console" element={<PowerAdminConsole />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/power-map" element={<PowerMap />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/power-alerts" element={<PowerAlerts />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/ai-optimization" element={<AiOptimization />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/historical-analysis" element={<HistoricalAnalysis />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/forecasting" element={<Forecasting />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/real-time-monitoring" element={<RealTimeMonitoring />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/capacity-management" element={<CapacityManagement />} />
          <Route path="/practice-library/infrastructure-hybrid-platform/power-capping" element={<PowerCapping />} />
          <Route path="/enterprise-certificate-management" element={<EnterpriseCertificateManagement />} />
          <Route path="/enterprise-certificate-management/risk-exposure" element={<RiskExposureMap />} />
          <Route path="/enterprise-certificate-management/lifecycle" element={<LifecycleJourney />} />
          <Route path="/enterprise-certificate-management/digital-coworkers" element={<DigitalCoworkerWorkforce />} />
          <Route path="/enterprise-certificate-management/operations-center" element={<OperationsCenter />} />
          <Route path="/enterprise-certificate-management/agentic-execution" element={<AgenticExecutionCenter />} />
          <Route path="/enterprise-certificate-management/global-map" element={<GlobalOperationsMap />} />
          <Route path="/enterprise-certificate-management/business-services" element={<BusinessServicesImpactCenter />} />
          <Route path="/enterprise-certificate-management/reports" element={<ReportsExecutiveIntelligence />} />
          <Route path="/enterprise-certificate-management/change-manager" element={<CertificateChangeManagementCenter />} />
          <Route path="/enterprise-certificate-management/integrations" element={<CertificateIntegrationsHub />} />
          <Route path="/enterprise-certificate-management/security-posture" element={<SecurityPostureCenter />} />
          <Route path="/enterprise-certificate-management/compliance-center" element={<ComplianceCenter />} />
          <Route path="/enterprise-certificate-management/audit-evidence" element={<AuditEvidenceCenter />} />
          <Route path="/enterprise-certificate-management/policy-engine" element={<PolicyEngine />} />
          <Route path="/enterprise-certificate-management/ct-logs-monitor" element={<CtLogsMonitor />} />
          <Route path="/practice-library/network-connectivity" element={<NetworkDashboard />} />
          <Route path="/practice-library/cloud-multicloud" element={<CloudDashboard />} />
          <Route path="/practice-library/application-product-support" element={<ApplicationDashboard />} />
          <Route path="/practice-library/data-integration-interoperability" element={<DataDashboard />} />
          <Route path="/practice-library/data-integration-interoperability/sql-transaction-log-job-reliability" element={<SqlTransactionLogJobReliability />} />
          <Route path="/practice-library/observability-resilience-sre" element={<SreDashboard />} />
          <Route path="/practice-library/ehr-clinical-application" element={<EhrDashboard />} />
          <Route path="/practice-library/digital-workforce" element={<WorkforceDashboard />} />
          <Route path="/practice-library/cyber-security" element={<CyberMasterDashboard />} />
          <Route path="/practice-library/cyber-security/iam" element={<IamDashboard />} />
          <Route path="/practice-library/cyber-security/soc-threat-detection" element={<SocDashboard />} />
          <Route path="/practice-library/cyber-security/endpoint-edr-xdr" element={<EndpointCyberDashboard />} />
          <Route path="/practice-library/cyber-security/cloud-cnapp" element={<CnappDashboard />} />
          <Route path="/practice-library/cyber-security/vulnerability-exposure" element={<VulnDashboard />} />
          <Route path="/practice-library/cyber-security/grc" element={<GrcDashboard />} />
          <Route path="/practice-library/cyber-security/data-privacy-dlp" element={<DlpDashboard />} />
          <Route path="/practice-library/cyber-security/devsecops" element={<DevSecOpsDashboard />} />
          <Route path="/practice-library/cyber-security/resilience-ir" element={<ResilienceDashboard />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/auth-orchestration" element={<AuthOrchestration />} />
          <Route path="/data-orchestration-twin/site-resilience-detect-and-isolate-network-issue" element={<SiteResilienceCoworker />} />
          <Route path="/questionnaires" element={<ProtectedRoute><Questionnaires /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy" element={<ProtectedRoute requireAdmin><TechnologyTaxonomyPage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/technologies/new" element={<ProtectedRoute requireAdmin><TechnologyProfilePage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/technologies/:technologyId" element={<ProtectedRoute requireAdmin><TechnologyProfilePage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/technologies/:technologyId/edit" element={<ProtectedRoute requireAdmin><TechnologyProfilePage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/domains" element={<ProtectedRoute requireAdmin><DomainsPage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/domains/new" element={<ProtectedRoute requireAdmin><DomainProfilePage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/domains/:domainId" element={<ProtectedRoute requireAdmin><DomainProfilePage /></ProtectedRoute>} />
          <Route path="/admin/technology-taxonomy/domains/:domainId/edit" element={<ProtectedRoute requireAdmin><DomainProfilePage /></ProtectedRoute>} />
          <Route path="/settings/approvals" element={<Navigate to="/settings/user-management" replace />} />
          <Route path="/settings/user-management" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
          <Route path="/settings/guidance-insights" element={<ProtectedRoute requireAdmin><GuidanceInsights /></ProtectedRoute>} />
          <Route path="/settings/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/settings/organization" element={<ProtectedRoute requireAdmin><OrganizationLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="business-units" replace />} />
            <Route path="hierarchy" element={<HierarchyView />} />
            <Route path=":levelSlug" element={<EntityListPage />} />
            <Route path=":levelSlug/:id" element={<EntityDetailPage />} />
          </Route>
          <Route path="/crm-demo" element={<CustomerSelectionDemo />} />
          <Route path="/crm-demo/engagement" element={<EngagementProfileDemo />} />
          <Route path="/crm-demo/stakeholders" element={<StakeholderMapDemo />} />
          <Route path="/crm-demo/discovery" element={<DiscoveryLibraryDemo />} />
          <Route path="/crm-demo/confidence" element={<DiscoveryConfidenceDemo />} />
          <Route path="/settings/stakeholder-register" element={<Navigate to="/crm" replace />} />
          <Route path="/settings/stakeholder-register-legacy" element={<ProtectedRoute><StakeholderRegister /></ProtectedRoute>} />
          <Route path="/silicon" element={<SiliconLayout />}>
            <Route index element={<FoundationStatus />} />
          </Route>
          <Route path="/avep" element={<AvepLayout />}>
            <Route index element={<Navigate to="/avep/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="program" element={<ProgramWorkspace />} />
            <Route path="context/engineering-context" element={<ProgramWorkspace />} />
            <Route path="requirements" element={<RequirementsIntakeWorkspace />} />
            <Route path="requirements-review" element={<RequirementsQualityWorkspace />} />
            <Route path="specification" element={<EngineeringTraceabilityWorkspace />} />
            <Route path="architecture" element={<LogicalArchitectureWorkspace />} />
            <Route path="rtl" element={<EngineeringSpecVerificationWorkspace />} />
            <Route path="design/rtl-generation" element={<RtlGenerationStudio />} />
            <Route path="design/change-impact" element={<RtlChangeImpactAnalysis />} />
            <Route path="verification/environment-builder" element={<VerificationEnvironmentBuilder />} />
            <Route path="verification/test-factory" element={<TestFactory />} />
            <Route path="verification/simulation-operations" element={<SimulationOperations />} />
            <Route path="verification/failure-diagnosis" element={<FailureDiagnosis />} />
            <Route path="readiness/coverage-closure" element={<CoverageClosureReadiness />} />
            <Route path="readiness/signoff" element={<SignoffReadiness />} />
            <Route path="readiness/release-package" element={<ReleasePackage />} />
            <Route path="governance/ai-value" element={<AiGovernanceValue />} />
            <Route path="readiness/physical-design-intake" element={<PhysicalDesignIntake />} />
            <Route path="demo/end-to-end-story" element={<EndToEndStory />} />
            {AVEP_NAV.filter((n) => !["/avep", "/avep/overview", "/avep/program", "/avep/requirements", "/avep/requirements-review", "/avep/specification", "/avep/architecture", "/avep/rtl", "/avep/design/rtl-generation", "/avep/design/change-impact", "/avep/verification/environment-builder", "/avep/verification/test-factory", "/avep/verification/simulation-operations", "/avep/verification/failure-diagnosis", "/avep/readiness/coverage-closure", "/avep/readiness/signoff", "/avep/readiness/release-package", "/avep/governance/ai-value", "/avep/readiness/physical-design-intake", "/avep/demo/end-to-end-story"].includes(n.path)).map((n) => (
              <Route key={n.id} path={n.path.replace(/^\/avep\//, "")} element={<ModulePlaceholder />} />
            ))}
          </Route>
          <Route path="/neurealm-agentic-ai" element={<NeurealmAgenticAI />} />
          <Route path="/invitations/:token" element={<AcceptInvitation />} />
          <Route path="/platform" element={<PlatformLayout />}>
            <Route index element={<PermissionRoute permission="tenant.view"><PlatformHome /></PermissionRoute>} />
            <Route path="members" element={<PermissionRoute permission="members.view"><PlatformMembers /></PermissionRoute>} />
            <Route path="roles" element={<PermissionRoute permission="roles.view"><PlatformRoles /></PermissionRoute>} />
            <Route path="audit" element={<PermissionRoute permission="audit.view"><PlatformAudit /></PermissionRoute>} />
            <Route path="settings" element={<PermissionRoute permission="tenant.view"><PlatformTenantSettings /></PermissionRoute>} />
            <Route path="profile" element={<PlatformProfile />} />
            <Route path="test-hub" element={<PlatformTestHub />} />
            <Route path="modules" element={<PlatformModuleRegistry />} />
            {capabilityIntelligenceRoutes}

            <Route path="audio" element={<PermissionRoute permission="audio.view"><CaeNarrativeLibrary /></PermissionRoute>} />
            <Route path="audio/narratives/new" element={<PermissionRoute permission="audio.narrative.author"><CaeNarrativeEditor /></PermissionRoute>} />
            <Route path="audio/narratives/:narrativeId" element={<PermissionRoute permission="audio.view"><CaeNarrativeDetail /></PermissionRoute>} />
            <Route path="audio/narratives/:narrativeId/edit" element={<PermissionRoute permission="audio.narrative.author"><CaeNarrativeEditor /></PermissionRoute>} />
            <Route path="audio/profiles" element={<PermissionRoute permission="audio.view"><CaeSpeechProfileManager /></PermissionRoute>} />
            <Route path="audio/placements" element={<PermissionRoute permission="audio.view"><CaePlacementMap /></PermissionRoute>} />
            <Route path="audio/pronunciation" element={<PermissionRoute permission="audio.view"><CaePronunciationDictionary /></PermissionRoute>} />
            <Route path="audio/analytics" element={<PermissionRoute permission="audio.analytics.view"><CaeAudioAnalytics /></PermissionRoute>} />
          </Route>
          <Route path="/commercial" element={<CommercialLayout />}>
            <Route index element={<PermissionRoute permission="commercial.view"><CommercialOverview /></PermissionRoute>} />
            <Route path="program" element={<PermissionRoute permission="commercial.view"><CommercialProgram /></PermissionRoute>} />
            <Route path="program-timeline" element={<PermissionRoute permission="commercial.view"><CommercialProgramTimeline /></PermissionRoute>} />
            <Route path="staffing-resources" element={<PermissionRoute permission="commercial.view"><CommercialStaffingResources /></PermissionRoute>} />
            <Route path="neurealm-governance" element={<PermissionRoute permission="commercial.view"><CommercialNeurealmGovernance /></PermissionRoute>} />

            <Route path="scenarios" element={<PermissionRoute permission="commercial.view"><CommercialScenarios /></PermissionRoute>} />
            <Route path="portfolio" element={<PermissionRoute permission="commercial.view"><CommercialPortfolio /></PermissionRoute>} />
            <Route path="sources" element={<PermissionRoute permission="commercial.view"><CommercialSources /></PermissionRoute>} />
            <Route path="model/revenue" element={<PermissionRoute permission="commercial.view"><CommercialRevenue /></PermissionRoute>} />
            <Route path="model/pnl" element={<PermissionRoute permission="commercial.view"><CommercialPnl /></PermissionRoute>} />
            <Route path="model/cash" element={<PermissionRoute permission="commercial.view"><CommercialCash /></PermissionRoute>} />
            <Route path="model/assumptions" element={<PermissionRoute permission="commercial.view"><CommercialAssumptions /></PermissionRoute>} />
            <Route path="model/assumptions/change-sets/:id" element={<PermissionRoute permission="commercial.view"><CommercialAssumptionChangeSet /></PermissionRoute>} />
            <Route path="model/compare" element={<PermissionRoute permission="commercial.view"><CommercialCompare /></PermissionRoute>} />
            <Route path="model/compare/:id" element={<PermissionRoute permission="commercial.view"><CommercialCompareDetail /></PermissionRoute>} />
            <Route path="model/sensitivity" element={<PermissionRoute permission="commercial.view"><CommercialSensitivity /></PermissionRoute>} />
            <Route path="model/sensitivity/:id" element={<PermissionRoute permission="commercial.view"><CommercialSensitivityDetail /></PermissionRoute>} />
            <Route path="model/release" element={<PermissionRoute permission="commercial.view"><CommercialRelease /></PermissionRoute>} />
            <Route path="model/release/:versionId" element={<PermissionRoute permission="commercial.view"><CommercialReleaseDetail /></PermissionRoute>} />
            




          </Route>
          {/* Internal CAE component fixture — development builds only, never in navigation */}
          {import.meta.env.DEV && (
            <Route path="/_dev/cae-components" element={<CaeComponentFixture />} />
          )}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </LazyRouteBoundary>
        </ContextualAudioRoot>
        </GuidanceAgentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
