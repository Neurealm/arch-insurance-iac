import { lazy } from "react";
import { LazyRouteBoundary } from "@/components/routing/LazyRouteBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";

import EnterpriseCertificateManagement from "./pages/enterprise-cert/EnterpriseCertificateManagement.tsx";
import RiskExposureMap from "./pages/enterprise-cert/RiskExposureMap.tsx";
import LifecycleJourney from "./pages/enterprise-cert/LifecycleJourney.tsx";
import DigitalCoworkerWorkforce from "./pages/enterprise-cert/DigitalCoworkerWorkforce.tsx";
import OperationsCenter from "./pages/enterprise-cert/OperationsCenter.tsx";
import AgenticExecutionCenter from "./pages/enterprise-cert/AgenticExecutionCenter.tsx";
import GlobalOperationsMap from "./pages/enterprise-cert/GlobalOperationsMap.tsx";
import BusinessServicesImpactCenter from "./pages/enterprise-cert/BusinessServicesImpactCenter.tsx";
import ReportsExecutiveIntelligence from "./pages/enterprise-cert/ReportsExecutiveIntelligence.tsx";
import CertificateChangeManagementCenter from "./pages/enterprise-cert/CertificateChangeManagementCenter.tsx";
import CertificateIntegrationsHub from "./pages/enterprise-cert/CertificateIntegrationsHub.tsx";
import SecurityPostureCenter from "./pages/enterprise-cert/SecurityPostureCenter.tsx";
import ComplianceCenter from "./pages/enterprise-cert/ComplianceCenter.tsx";
import AuditEvidenceCenter from "./pages/enterprise-cert/AuditEvidenceCenter.tsx";
import PolicyEngine from "./pages/enterprise-cert/PolicyEngine.tsx";
import CtLogsMonitor from "./pages/enterprise-cert/CtLogsMonitor.tsx";

const SeadCommandCenter = lazy(() => import("./pages/sead/CommandCenter.tsx"));
const SeadEquipmentHealth = lazy(() => import("./pages/sead/EquipmentHealthIntelligence.tsx"));
import SeadCrossDomain from "./pages/sead/CrossDomainContextTwin.tsx";
import SeadMaintenanceSim from "./pages/sead/MaintenanceDecisionSimulator.tsx";
import SeadFactoryImpact from "./pages/sead/FactoryImpactSimulator.tsx";
import SeadDecisionCenter from "./pages/sead/AIMaintenanceDecisionCenter.tsx";
import SeadHumanGovernance from "./pages/sead/HumanGovernanceCenter.tsx";
import SeadAIReasoningPlayback from "./pages/sead/AIReasoningPlayback.tsx";
import SeadConfidenceExplorer from "./pages/sead/ConfidenceExplorer.tsx";
import SeadExplainability from "./pages/sead/Explainability.tsx";
import SeadWhatIf from "./pages/sead/WhatIf.tsx";
import SeadKnowledgeGraph from "./pages/sead/KnowledgeGraph.tsx";
import SeadOperationalLearning from "./pages/sead/OperationalLearning.tsx";
import SeadOutcomeTracker from "./pages/sead/OutcomeTracker.tsx";
import SeadMultiAgentCollaboration from "./pages/sead/MultiAgentCollaboration.tsx";
import SeadHumanInTheLoop from "./pages/sead/HumanInTheLoop.tsx";
import SeadEngineeringSandbox from "./pages/sead/EngineeringSandbox.tsx";
import SeadDigitalCoworkerConversation from "./pages/sead/DigitalCoworkerConversation.tsx";
import SeadIotAiArchitecture from "./pages/sead/IotAiArchitecture.tsx";
import SeadSimulationComparison from "./pages/sead/SimulationComparison.tsx";

import NotFound from "./pages/NotFound.tsx";
import { SiliconLayout } from "./silicon/shell/SiliconLayout";
import FoundationStatus from "./silicon/pages/FoundationStatus";
import { AvepLayout } from "./avep/shell/AvepLayout";
import { ModulePlaceholder } from "./avep/pages/ModulePlaceholder";
import { ProgramWorkspace } from "./avep/pages/ProgramWorkspace";
import RequirementsIntakeWorkspace from "./avep/pages/RequirementsIntakeWorkspace";
import RequirementsQualityWorkspace from "./avep/pages/RequirementsQualityWorkspace";
import EngineeringTraceabilityWorkspace from "./avep/pages/EngineeringTraceabilityWorkspace";
import LogicalArchitectureWorkspace from "./avep/pages/LogicalArchitectureWorkspace";
import EngineeringSpecVerificationWorkspace from "./avep/pages/EngineeringSpecVerificationWorkspace";
import RtlGenerationStudio from "./avep/pages/RtlGenerationStudio";
import RtlChangeImpactAnalysis from "./avep/pages/RtlChangeImpactAnalysis";
import VerificationEnvironmentBuilder from "./avep/pages/VerificationEnvironmentBuilder";
import TestFactory from "./avep/pages/TestFactory";
import SimulationOperations from "./avep/pages/SimulationOperations";
import FailureDiagnosis from "./avep/pages/FailureDiagnosis";
import CoverageClosureReadiness from "./avep/pages/CoverageClosureReadiness";
import SignoffReadiness from "./avep/pages/SignoffReadiness";
import ReleasePackage from "./avep/pages/ReleasePackage";
import AiGovernanceValue from "./avep/pages/AiGovernanceValue";
import PhysicalDesignIntake from "./avep/pages/PhysicalDesignIntake";
import EndToEndStory from "./avep/pages/EndToEndStory";
import Overview from "./avep/pages/Overview";
import { AVEP_NAV } from "./avep/shell/navigation";
import NeurealmAgenticAI from "./pages/neurealm-agentic-ai/NeurealmAgenticAI.tsx";
import PlatformLayout from "./platform/shell/PlatformLayout";
import PlatformHome from "./platform/pages/PlatformHome";
import PlatformMembers from "./platform/pages/MemberAdmin";
import PlatformRoles from "./platform/pages/RoleAdmin";
import PlatformAudit from "./platform/pages/AuditExplorer";
import PlatformTenantSettings from "./platform/pages/TenantSettings";
import AcceptInvitation from "./platform/pages/AcceptInvitation";
import PlatformProfile from "./platform/pages/Profile";
import PlatformTestHub from "./platform/pages/TestHub";
import { PermissionRoute } from "./components/auth/PermissionRoute";
import Landing from "./pages/Landing.tsx";
import Login from "./pages/auth/Login.tsx";
import CyberMasterDashboard from "./pages/practice-library/dashboards/cyber/CyberMasterDashboard.tsx";
import IamDashboard from "./pages/practice-library/dashboards/cyber/IamDashboard.tsx";
import SocDashboard from "./pages/practice-library/dashboards/cyber/SocDashboard.tsx";
import EndpointCyberDashboard from "./pages/practice-library/dashboards/cyber/EndpointDashboard.tsx";
import CnappDashboard from "./pages/practice-library/dashboards/cyber/CnappDashboard.tsx";
import VulnDashboard from "./pages/practice-library/dashboards/cyber/VulnDashboard.tsx";
import GrcDashboard from "./pages/practice-library/dashboards/cyber/GrcDashboard.tsx";
import DlpDashboard from "./pages/practice-library/dashboards/cyber/DlpDashboard.tsx";
import DevSecOpsDashboard from "./pages/practice-library/dashboards/cyber/DevSecOpsDashboard.tsx";
import ResilienceDashboard from "./pages/practice-library/dashboards/cyber/ResilienceDashboard.tsx";
import Signup from "./pages/auth/Signup.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import TechnologyTaxonomyPage from "./pages/admin/technology-taxonomy/TechnologyTaxonomyPage.tsx";
import TechnologyProfilePage from "./pages/admin/technology-taxonomy/TechnologyProfilePage.tsx";
import DomainsPage from "./pages/admin/technology-taxonomy/domains/DomainsPage.tsx";
import DomainProfilePage from "./pages/admin/technology-taxonomy/domains/DomainProfilePage.tsx";
import Coworkers from "./pages/Coworkers.tsx";
import CoworkersNetwork from "./pages/CoworkersNetwork.tsx";
import CoworkersSRE from "./pages/CoworkersSRE.tsx";
import CoworkersIAM from "./pages/CoworkersIAM.tsx";
import CoworkersVuln from "./pages/CoworkersVuln.tsx";
import VulnZeroDayDashboard from "./pages/coworkers/vuln/VulnZeroDayDashboard.tsx";
import PrivilegedAccessDashboard from "./pages/coworkers/iam/PrivilegedAccessDashboard.tsx";
import ReleaseDeploymentRollout from "./pages/coworkers/sre/ReleaseDeploymentRollout.tsx";
import SloSlaSliMonitoring from "./pages/coworkers/sre/SloSlaSliMonitoring.tsx";
import CoworkersInfra from "./pages/CoworkersInfra.tsx";
import CitrixPlatformDigitalCoworkers from "./pages/coworkers/CitrixPlatformDigitalCoworkers.tsx";
import CoworkersApplicationSupport from "./pages/CoworkersApplicationSupport.tsx";
import HadoopHealthPrecheckAgent from "./pages/coworkers/appsupport/HadoopHealthPrecheckAgent.tsx";
import IntegrationMonitoringAgent from "./pages/coworkers/appsupport/IntegrationMonitoringAgent.tsx";
import EtlPipelineTraceCoworker from "./pages/coworkers/appsupport/EtlPipelineTraceCoworker.tsx";

import VmwareCapacityContention from "./pages/coworkers/infra/VmwareCapacityContention.tsx";
import ServerProvisioningDeprovisioning from "./pages/coworkers/infra/ServerProvisioningDeprovisioning.tsx";
import HostFailureEarlyWarning from "./pages/coworkers/infra/HostFailureEarlyWarning.tsx";
import ActiveDirectoryHealthReplication from "./pages/coworkers/infra/ActiveDirectoryHealthReplication.tsx";
import PatchComplianceFailureRemediation from "./pages/coworkers/infra/PatchComplianceFailureRemediation.tsx";
import TimeDriftKerberosIntegrity from "./pages/coworkers/infra/TimeDriftKerberosIntegrity.tsx";
import TransactionLogDiskPressure from "./pages/coworkers/infra/TransactionLogDiskPressure.tsx";
import ThirdPartyDependencyHealth from "./pages/coworkers/infra/ThirdPartyDependencyHealth.tsx";
import FirewallRuleOptimizer from "./pages/coworkers/network/FirewallRuleOptimizer.tsx";
import ZeroTouchPolicyImplementation from "./pages/coworkers/network/ZeroTouchPolicyImplementation.tsx";
import ZeroTouchS2SVPNImplementation from "./pages/coworkers/network/ZeroTouchS2SVPNImplementation.tsx";
import CoworkersCarveOut from "./pages/CoworkersCarveOut.tsx";
import HealthcarePayer from "./pages/coworkers/HealthcarePayer.tsx";
import PriorAuthorization from "./pages/coworkers/healthcare/PriorAuthorization.tsx";
import StarsHedis from "./pages/coworkers/healthcare/StarsHedis.tsx";
import MemberRenewal from "./pages/coworkers/healthcare/MemberRenewal.tsx";
import DsnpLtc from "./pages/coworkers/healthcare/DsnpLtc.tsx";
import BehavioralHealth from "./pages/coworkers/healthcare/BehavioralHealth.tsx";
import MedicationAdherence from "./pages/coworkers/healthcare/MedicationAdherence.tsx";
import PediatricChw from "./pages/coworkers/healthcare/PediatricChw.tsx";
import ChronicDisease from "./pages/coworkers/healthcare/ChronicDisease.tsx";
import ProviderExperience from "./pages/coworkers/healthcare/ProviderExperience.tsx";
import RiskAdjustment from "./pages/coworkers/healthcare/RiskAdjustment.tsx";
import AiModelGovernance from "./pages/coworkers/healthcare/AiModelGovernance.tsx";
import ClaimsExceptionAppeals from "./pages/coworkers/healthcare/ClaimsExceptionAppeals.tsx";
import HealthEquity from "./pages/coworkers/healthcare/HealthEquity.tsx";
import FhirCmsApi from "./pages/coworkers/healthcare/FhirCmsApi.tsx";
import HieIntegration from "./pages/coworkers/healthcare/HieIntegration.tsx";
import ProviderPortalAvaility from "./pages/coworkers/healthcare/ProviderPortalAvaility.tsx";
import EdiClearinghouse from "./pages/coworkers/healthcare/EdiClearinghouse.tsx";
import PaConfigGovernance from "./pages/coworkers/healthcare/PaConfigGovernance.tsx";
import DataQualityIdentity from "./pages/coworkers/healthcare/DataQualityIdentity.tsx";
import MajorIncidentBusinessImpact from "./pages/coworkers/healthcare/MajorIncidentBusinessImpact.tsx";
import VendorSaasRisk from "./pages/coworkers/healthcare/VendorSaasRisk.tsx";
import IdentityOauthGovernance from "./pages/coworkers/healthcare/IdentityOauthGovernance.tsx";
import EsccOverview from "./pages/carveout/EsccOverview.tsx";
import EsccSolutionDesign from "./pages/carveout/EsccSolutionDesign.tsx";
import EsccDashboard from "./pages/carveout/EsccDashboard.tsx";
import EucOverview from "./pages/carveout/EucOverview.tsx";
import EucSolutionDesign from "./pages/carveout/EucSolutionDesign.tsx";
import EucDashboard from "./pages/carveout/EucDashboard.tsx";
import SdtOverview from "./pages/carveout/SdtOverview.tsx";
import SdtSolutionDesign from "./pages/carveout/SdtSolutionDesign.tsx";
import SdtDashboard from "./pages/carveout/SdtDashboard.tsx";
import ShxOverview from "./pages/carveout/ShxOverview.tsx";
import ShxSolutionDesign from "./pages/carveout/ShxSolutionDesign.tsx";
import ShxDashboard from "./pages/carveout/ShxDashboard.tsx";
import AdsOverview from "./pages/carveout/AdsOverview.tsx";
import AdsSolutionDesign from "./pages/carveout/AdsSolutionDesign.tsx";
import AdsDashboard from "./pages/carveout/AdsDashboard.tsx";
import IocOverview from "./pages/carveout/IocOverview.tsx";
import IocSolutionDesign from "./pages/carveout/IocSolutionDesign.tsx";
import IocDashboard from "./pages/carveout/IocDashboard.tsx";
import NccOverview from "./pages/carveout/NccOverview.tsx";
import NccSolutionDesign from "./pages/carveout/NccSolutionDesign.tsx";
import NccDashboard from "./pages/carveout/NccDashboard.tsx";
import IatOverview from "./pages/carveout/IatOverview.tsx";
import IatSolutionDesign from "./pages/carveout/IatSolutionDesign.tsx";
import IatDashboard from "./pages/carveout/IatDashboard.tsx";
import CmmOverview from "./pages/carveout/CmmOverview.tsx";
import CmmSolutionDesign from "./pages/carveout/CmmSolutionDesign.tsx";
import CmmDashboard from "./pages/carveout/CmmDashboard.tsx";
import DeployCoworker from "./pages/DeployCoworker.tsx";

import Incidents from "./pages/Incidents.tsx";
import Alerts from "./pages/Alerts.tsx";
import ChangeManagement from "./pages/ChangeManagement.tsx";
import NeuGAIN from "./pages/NeuGAIN.tsx";
import CarveOut from "./pages/CarveOut.tsx";
import CarveOutPage from "./pages/CarveOutPage.tsx";
import WorkforceReadiness from "./pages/carveout/WorkforceReadiness.tsx";
import DeviceProvisioningFactory from "./pages/carveout/DeviceProvisioningFactory.tsx";
import GoldenImage from "./pages/carveout/GoldenImage.tsx";
import PersonaAssignment from "./pages/carveout/PersonaAssignment.tsx";
import IdentityCutover from "./pages/carveout/IdentityCutover.tsx";
import VdiContinuity from "./pages/carveout/VdiContinuity.tsx";
import GlobalLogistics from "./pages/carveout/GlobalLogistics.tsx";
import EndpointHealth from "./pages/carveout/EndpointHealth.tsx";
import DigitalCoworkerEuc from "./pages/carveout/DigitalCoworkerEuc.tsx";
import SelfServiceSupport from "./pages/carveout/SelfServiceSupport.tsx";
import AssetLifecycle from "./pages/carveout/AssetLifecycle.tsx";
import NetworkSeparationCommand from "./pages/carveout/NetworkSeparationCommand.tsx";
import NetworkTopology from "./pages/carveout/NetworkTopology.tsx";
import SiteConnectivity from "./pages/carveout/SiteConnectivity.tsx";
import WanSdwan from "./pages/carveout/WanSdwan.tsx";
import DcCloudFabric from "./pages/carveout/DcCloudFabric.tsx";
import FirewallZeroTrust from "./pages/carveout/FirewallZeroTrust.tsx";
import NetworkProvisioningFactory from "./pages/carveout/NetworkProvisioningFactory.tsx";
import FieldNetworkDeployment from "./pages/carveout/FieldNetworkDeployment.tsx";
import NocOperations from "./pages/carveout/NocOperations.tsx";
import NetworkExperience from "./pages/carveout/NetworkExperience.tsx";
import DigitalCoworkerNetwork from "./pages/carveout/DigitalCoworkerNetwork.tsx";
import NetworkCostOptimization from "./pages/carveout/NetworkCostOptimization.tsx";
import InfraSeparationCommand from "./pages/carveout/InfraSeparationCommand.tsx";
import InfraTopology from "./pages/carveout/InfraTopology.tsx";
import EnvCarveOut from "./pages/carveout/EnvCarveOut.tsx";
import ServerStorageFactory from "./pages/carveout/ServerStorageFactory.tsx";
import StorageDataReadiness from "./pages/carveout/StorageDataReadiness.tsx";
import HybridPlacement from "./pages/carveout/HybridPlacement.tsx";
import DcExitMigration from "./pages/carveout/DcExitMigration.tsx";
import FieldInfraDeployment from "./pages/carveout/FieldInfraDeployment.tsx";
import InfraOperations from "./pages/carveout/InfraOperations.tsx";
import WorkloadPerformance from "./pages/carveout/WorkloadPerformance.tsx";
import DigitalCoworkerInfra from "./pages/carveout/DigitalCoworkerInfra.tsx";
import InfraFinOps from "./pages/carveout/InfraFinOps.tsx";
import CloudTransformation from "./pages/carveout/CloudTransformation.tsx";
import LandingZone from "./pages/carveout/LandingZone.tsx";
import AppPortfolioRationalization from "./pages/carveout/AppPortfolioRationalization.tsx";
import MigrationWavePlanning from "./pages/carveout/MigrationWavePlanning.tsx";
import HybridCloudFabric from "./pages/carveout/HybridCloudFabric.tsx";
import MultiRegionDR from "./pages/carveout/MultiRegionDR.tsx";
import CloudMigrationFactory from "./pages/carveout/CloudMigrationFactory.tsx";
import CloudSecurityCspm from "./pages/carveout/CloudSecurityCspm.tsx";
import CloudOperations from "./pages/carveout/CloudOperations.tsx";
import CloudPerformanceAnalytics from "./pages/carveout/CloudPerformanceAnalytics.tsx";
import DigitalCoworkerCloud from "./pages/carveout/DigitalCoworkerCloud.tsx";
import CloudFinOps from "./pages/carveout/CloudFinOps.tsx";
import AssuranceCommand from "./pages/assurance/AssuranceCommand.tsx";
import WorkflowDetail from "./pages/assurance/WorkflowDetail.tsx";
import LiveExecution from "./pages/assurance/LiveExecution.tsx";
import StakeholderRegister from "./pages/settings/StakeholderRegister.tsx";
import Settings from "./pages/Settings.tsx";
import AuthOrchestration from "./pages/AuthOrchestration.tsx";
import Questionnaires from "./pages/Questionnaires.tsx";
import UserManagement from "./pages/settings/UserManagement.tsx";
import ChangePassword from "./pages/settings/ChangePassword.tsx";
import PendingApproval from "./pages/auth/PendingApproval.tsx";
import UpdateProfile from "./pages/auth/UpdateProfile.tsx";
import SetInitialPassword from "./pages/auth/SetInitialPassword.tsx";
import CompleteProfile from "./pages/auth/CompleteProfile.tsx";
import OrganizationLayout from "./pages/settings/organization/OrganizationLayout.tsx";
import EntityListPage from "./pages/settings/organization/EntityListPage.tsx";
import EntityDetailPage from "./pages/settings/organization/EntityDetailPage.tsx";
import HierarchyView from "./pages/settings/organization/HierarchyView.tsx";
import CompaniesList from "./pages/crm/CompaniesList.tsx";
import CompanyWorkspace from "./pages/crm/CompanyWorkspace.tsx";
import StakeholderFormPage from "./pages/crm/StakeholderFormPage.tsx";
import PracticeLibrary from "./pages/PracticeLibrary.tsx";
import TableOfContents from "./pages/practice-library/TableOfContents.tsx";
import PracticePlaceholder from "./pages/practice-library/PracticePlaceholder.tsx";
import { Navigate } from "react-router-dom";
import ItsmDashboard from "./pages/practice-library/dashboards/ItsmDashboard.tsx";
import EucPracticeDashboard from "./pages/practice-library/dashboards/EucDashboard.tsx";
import InfraDashboard from "./pages/practice-library/dashboards/InfraDashboard.tsx";
import PowerAdminConsole from "./pages/practice-library/dashboards/PowerAdminConsole.tsx";
import PowerMap from "./pages/practice-library/dashboards/PowerMap.tsx";
import PowerAlerts from "./pages/practice-library/dashboards/PowerAlerts.tsx";
import AiOptimization from "./pages/practice-library/dashboards/AiOptimization.tsx";
import HistoricalAnalysis from "./pages/practice-library/dashboards/HistoricalAnalysis.tsx";
import Forecasting from "./pages/practice-library/dashboards/Forecasting.tsx";
import CapacityManagement from "./pages/practice-library/dashboards/CapacityManagement.tsx";
import PowerCapping from "./pages/practice-library/dashboards/PowerCapping.tsx";
import RealTimeMonitoring from "./pages/practice-library/dashboards/RealTimeMonitoring.tsx";
import NetworkDashboard from "./pages/practice-library/dashboards/NetworkDashboard.tsx";
import CloudDashboard from "./pages/practice-library/dashboards/CloudDashboard.tsx";
import ApplicationDashboard from "./pages/practice-library/dashboards/ApplicationDashboard.tsx";
import DataDashboard from "./pages/practice-library/dashboards/DataDashboard.tsx";
import SqlTransactionLogJobReliability from "./pages/practice-library/dashboards/data/SqlTransactionLogJobReliability.tsx";
import SreDashboard from "./pages/practice-library/dashboards/SreDashboard.tsx";
import EhrDashboard from "./pages/practice-library/dashboards/EhrDashboard.tsx";
import WorkforceDashboard from "./pages/practice-library/dashboards/WorkforceDashboard.tsx";
import ProdResilienceTwin from "./pages/prod-twin/ProdResilienceTwin.tsx";
import DataOrchLayout from "./pages/data-orchestration-twin/DataOrchLayout.tsx";
import DataOrchPage from "./pages/data-orchestration-twin/DataOrchPage.tsx";
import DataOrchExecutiveControlPlane from "./pages/data-orchestration-twin/ExecutiveControlPlane.tsx";
import UseCaseToDataContractMapper from "./pages/data-orchestration-twin/UseCaseToDataContractMapper.tsx";
import SiteResilienceCoworker from "./pages/data-orchestration-twin/SiteResilienceCoworker.tsx";
import LogSourceInventoryAndScopeRegistry from "./pages/data-orchestration-twin/LogSourceInventoryAndScopeRegistry.tsx";
const DataDogLogProfile = lazy(() => import("./pages/data-orchestration-twin/DataDogLogProfile.tsx"));
import CyberThreatIntelligenceAndIocAnalysis from "./pages/data-orchestration-twin/CyberThreatIntelligenceAndIocAnalysis.tsx";
import DataPlacementDecisionEngine from "./pages/data-orchestration-twin/DataPlacementDecisionEngine.tsx";
import PlacementScenarioModeler from "./pages/data-orchestration-twin/PlacementScenarioModeler.tsx";
import NoDuplicationStrategyAndRetentionPolicy from "./pages/data-orchestration-twin/NoDuplicationStrategyAndRetentionPolicy.tsx";
import NoDuplicationScenarioModeler from "./pages/data-orchestration-twin/NoDuplicationScenarioModeler.tsx";
import OptionsAndTradeoffMatrix from "./pages/data-orchestration-twin/OptionsAndTradeoffMatrix.tsx";
import ConnectorAccessGovernanceRegistry from "./pages/data-orchestration-twin/ConnectorAccessGovernanceRegistry.tsx";
import ConnectionMethodProfile from "./pages/data-orchestration-twin/ConnectionMethodProfile.tsx";
import FetchOrchestrationScheduler from "./pages/data-orchestration-twin/FetchOrchestrationScheduler.tsx";
const ScheduleBuilder = lazy(() => import("./pages/data-orchestration-twin/ScheduleBuilder.tsx"));
import SourceOnboardingFactory from "./pages/data-orchestration-twin/SourceOnboardingFactory.tsx";
import AssistedSchemaDiscoveryAndFieldMapping from "./pages/data-orchestration-twin/AssistedSchemaDiscoveryAndFieldMapping.tsx";
import SchemaDriftAndExceptionWorkbench from "./pages/data-orchestration-twin/SchemaDriftAndExceptionWorkbench.tsx";
import LogHygieneCompletenessAndStandardizationConsole from "./pages/data-orchestration-twin/LogHygieneCompletenessAndStandardizationConsole.tsx";
import HydrationAndEnrichmentMethodSelector from "./pages/data-orchestration-twin/HydrationAndEnrichmentMethodSelector.tsx";
import HydratedRecordBuilder from "./pages/data-orchestration-twin/HydratedRecordBuilder.tsx";
import DataLineageAndTraceabilityView from "./pages/data-orchestration-twin/DataLineageAndTraceabilityView.tsx";
import CanonicalOperationalDataModel from "./pages/data-orchestration-twin/CanonicalOperationalDataModel.tsx";
import RelationshipKeyAndGraphProjectionBuilder from "./pages/data-orchestration-twin/RelationshipKeyAndGraphProjectionBuilder.tsx";
import QueryReadinessAndConfidenceScorecard from "./pages/data-orchestration-twin/QueryReadinessAndConfidenceScorecard.tsx";
import PerformanceLatencyAndFreshnessLab from "./pages/data-orchestration-twin/PerformanceLatencyAndFreshnessLab.tsx";
import ContextGraphAndAgenticQueryHandoffLayer from "./pages/data-orchestration-twin/ContextGraphAndAgenticQueryHandoffLayer.tsx";
import DataGapRegisterAndEngineeringBacklog from "./pages/data-orchestration-twin/DataGapRegisterAndEngineeringBacklog.tsx";
import SowExecutionPlanAndAcceptanceDashboard from "./pages/data-orchestration-twin/SowExecutionPlanAndAcceptanceDashboard.tsx";
import MeasuringSuccess from "./pages/prod-twin/MeasuringSuccess.tsx";

import ProductLineMap from "./pages/prod-twin/ProductLineMap.tsx";
import GoldenWorkflowMap from "./pages/prod-twin/GoldenWorkflowMap.tsx";
import ProductionTopology from "./pages/prod-twin/ProductionTopology.tsx";
import SreOperatingModel from "./pages/prod-twin/SreOperatingModel.tsx";
import SignalIntelligence from "./pages/prod-twin/SignalIntelligence.tsx";
import EnterpriseCloudTwin from "./pages/prod-twin/EnterpriseCloudTwin.tsx";
const AWSResilienceArchitectureTwin = lazy(() => import("./pages/prod-twin/AWSResilienceArchitectureTwin.tsx"));
import { ScenarioStateProvider } from "./context/ScenarioStateContext.tsx";
import PlatformEngineeringFactory from "./pages/prod-twin/PlatformEngineeringFactory.tsx";
import HybridCloudWorkbench from "./pages/prod-twin/HybridCloudWorkbench.tsx";
import AutomationMarketplace from "./pages/prod-twin/AutomationMarketplace.tsx";
import ModernizationFactory from "./pages/prod-twin/ModernizationFactory.tsx";
import CyberResilienceOverlay from "./pages/prod-twin/CyberResilienceOverlay.tsx";
import AiCoworkerControlRoom from "./pages/prod-twin/AiCoworkerControlRoom.tsx";
import TransitionDualRun from "./pages/prod-twin/TransitionDualRun.tsx";
import AcquisitionOnboardingFactory from "./pages/prod-twin/AcquisitionOnboardingFactory.tsx";
import ValueCreationBoard from "./pages/prod-twin/ValueCreationBoard.tsx";
import ModernizationRoadmap from "./pages/prod-twin/ModernizationRoadmap.tsx";
import InteractiveDemoCenter from "./pages/prod-twin/InteractiveDemoCenter.tsx";
import ModernizationRoadmapV2 from "./pages/prod-twin/ModernizationRoadmapV2.tsx";
import ExecutiveServiceOwnerTwin from "./pages/prod-twin/ExecutiveServiceOwnerTwin.tsx";
import DeliveryOrgTwin from "./pages/prod-twin/DeliveryOrgTwin.tsx";
import EngagementManagerTwin from "./pages/prod-twin/EngagementManagerTwin.tsx";
import OperationalFrictionIndex from "./pages/prod-twin/OperationalFrictionIndex.tsx";
import ReliabilityFoundations from "./pages/prod-twin/ReliabilityFoundations.tsx";
import GoogleSre from "./pages/prod-twin/GoogleSre.tsx";
import HowToAchieveGoogleSre from "./pages/prod-twin/HowToAchieveGoogleSre.tsx";
import TeamTopologies from "./pages/prod-twin/TeamTopologies.tsx";
import FutureStateReliabilityOrg from "./pages/prod-twin/FutureStateReliabilityOrg.tsx";
import FunctionalOrgChart from "./pages/prod-twin/FunctionalOrgChart.tsx";
import PlatformEngineeringDesignPrinciples from "./pages/prod-twin/PlatformEngineeringDesignPrinciples.tsx";
import HowToBuildPlatformEngineering from "./pages/prod-twin/HowToBuildPlatformEngineering.tsx";
import PlatformAsAProduct from "./pages/prod-twin/PlatformAsAProduct.tsx";
import FinOpsOperationsConsole from "./pages/prod-twin/FinOpsOperationsConsole.tsx";
import ProductReliabilityAnatomy from "./pages/prod-twin/ProductReliabilityAnatomy.tsx";
import TransformationJourney from "./pages/prod-twin/TransformationJourney.tsx";
import CustomerSelectionDemo from "./pages/crm-demo/CustomerSelectionDemo.tsx";
import EngagementProfileDemo from "./pages/crm-demo/EngagementProfileDemo.tsx";
import StakeholderMapDemo from "./pages/crm-demo/StakeholderMapDemo.tsx";
import DiscoveryLibraryDemo from "./pages/crm-demo/DiscoveryLibraryDemo.tsx";
import DiscoveryConfidenceDemo from "./pages/crm-demo/DiscoveryConfidenceDemo.tsx";
import PublicQuestionnaire from "./pages/PublicQuestionnaire.tsx";
import RunOpsLayout from "./runops/shell/RunOpsLayout.tsx";
import RunOpsCommand from "./runops/pages/Command.tsx";
import RunOpsExperienceEntry from "./runops/pages/ExperienceEntry.tsx";
import RunOpsPlaceholder from "./runops/pages/RunOpsPlaceholder.tsx";
import RunOpsNotFound from "./runops/pages/RunOpsNotFound.tsx";
import RunOpsDesignSystem from "./runops/pages/DesignSystem.tsx";
import RunOpsOperationsQueue from "./runops/pages/OperationsQueue.tsx";
import RunOpsServicePortfolio from "./runops/pages/ServicePortfolio.tsx";
import RunOpsServiceDigitalTwin from "./runops/pages/ServiceDigitalTwin.tsx";
import RunOpsTopologyExplorer from "./runops/pages/TopologyExplorer.tsx";
import RunOpsObservabilityExplorer from "./runops/pages/ObservabilityExplorer.tsx";
import RunOpsOperationalReadiness from "./runops/pages/OperationalReadiness.tsx";
import RunOpsRunbookLibrary from "./runops/pages/RunbookLibrary.tsx";
import RunOpsRunbookDetail from "./runops/pages/RunbookDetail.tsx";
import RunOpsRunbookObjectBuilder from "./runops/pages/RunbookObjectBuilder.tsx";
import { AwsCotsDigitalTwinPage } from "./runops/features/aws-cots-twin";
import RunOpsRunbookNew from "./runops/pages/RunbookNew.tsx";
import RunOpsRunbookDesigner from "./runops/pages/RunbookDesigner.tsx";
import RunOpsRunbookStepBuilder from "./runops/pages/RunbookStepBuilder.tsx";
import RunOpsRunbookPolicyDesigner from "./runops/pages/RunbookPolicyDesigner.tsx";
import RunOpsRunbookRecoveryDesigner from "./runops/pages/RunbookRecoveryDesigner.tsx";
import RunOpsRunbookTestLab from "./runops/pages/RunbookTestLab.tsx";
import RunOpsRunbookRelease from "./runops/pages/RunbookRelease.tsx";
import RunOpsRunbookTriggers from "./runops/pages/RunbookTriggers.tsx";
import RunOpsRunbookLaunchCenter from "./runops/pages/RunbookLaunchCenter.tsx";
import RunOpsGuidedExecution from "./runops/pages/GuidedExecution.tsx";
import RunOpsAutonomousExecutionMonitor from "./runops/pages/AutonomousExecutionMonitor.tsx";
import RunOpsApprovalCenter from "./runops/pages/ApprovalCenter.tsx";
import RunOpsEvidenceReplay from "./runops/pages/EvidenceReplay.tsx";
import RunOpsShiftHandoff from "./runops/pages/ShiftHandoff.tsx";
import RunOpsAlertTriage from "./runops/pages/AlertTriage.tsx";
import RunOpsIncidentCommand from "./runops/pages/IncidentCommand.tsx";
import RunOpsInvestigationWorkspace from "./runops/pages/InvestigationWorkspace.tsx";
import RunOpsHypothesisGraph from "./runops/pages/HypothesisGraph.tsx";
import RunOpsRemediationComparison from "./runops/pages/RemediationComparison.tsx";
import RunOpsStakeholderCommunications from "./runops/pages/StakeholderCommunications.tsx";
import RunOpsRecoveryValidation from "./runops/pages/RecoveryValidation.tsx";
import RunOpsPostmortem from "./runops/pages/Postmortem.tsx";
import RunOpsProblemActions from "./runops/pages/ProblemActions.tsx";
import RunOpsDigitalWorkerCatalog from "./runops/pages/DigitalWorkerCatalog.tsx";
import RunOpsDigitalWorkerStudio from "./runops/pages/DigitalWorkerStudio.tsx";
import RunOpsMultiAgentCollaboration from "./runops/pages/MultiAgentCollaboration.tsx";
import RunOpsAutomationRegistry from "./runops/pages/AutomationRegistry.tsx";
import RunOpsSloCenter from "./runops/pages/SloCenter.tsx";
import RunOpsRunbookFitness from "./runops/pages/RunbookFitness.tsx";
import RunOpsKnowledgeGraph from "./runops/pages/KnowledgeGraph.tsx";
import RunOpsAnalytics from "./runops/pages/ReliabilityValueAnalytics.tsx";
import RunOpsGovernance from "./runops/pages/GovernanceCenter.tsx";
import RunOpsExecutionSecurity from "./runops/pages/ExecutionSecurity.tsx";
import RunOpsAIGovernance from "./runops/pages/AIGovernance.tsx";
import RunOpsIntegrationHub from "./runops/pages/IntegrationHub.tsx";
import RunOpsDeveloperPortal from "./runops/pages/DeveloperPortal.tsx";
import RunOpsSupplyChain from "./runops/pages/SupplyChain.tsx";
import RunOpsPlatformHealth from "./runops/pages/PlatformHealth.tsx";
import RunOpsTenantProfileManager from "./runops/pages/TenantProfileManager.tsx";
import { routes as runopsRoutes } from "./runops/shell/routes.ts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
          <Route path="/prod-resilience-twin" element={<ProdResilienceTwin />} />
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
          <Route path="/measuring-success" element={<MeasuringSuccess />} />
          
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
          <Route path="/executive-service-owner-twin" element={<ExecutiveServiceOwnerTwin />} />
          <Route path="/delivery-org-twin" element={<DeliveryOrgTwin />} />
          <Route path="/engagement-manager-twin" element={<EngagementManagerTwin />} />
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
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </LazyRouteBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
