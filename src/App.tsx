import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
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
import NoAccess from "./pages/auth/NoAccess.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import { TenantAccessGuard } from "./components/auth/TenantAccessGuard.tsx";
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
import Operations from "./pages/Operations.tsx";
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
import Itsm from "./pages/itsm/Itsm.tsx";
import ExecBizOps from "./pages/itsm/ExecBizOps.tsx";
import ExecutiveCommandCenter from "./pages/itsm/ExecutiveCommandCenter.tsx";
import Placeholder from "./pages/itsm/Placeholder.tsx";
import CustomerExperience from "./pages/itsm/CustomerExperience.tsx";
import SlaSloErrorBudget from "./pages/itsm/SlaSloErrorBudget.tsx";
import RiskExposure from "./pages/itsm/RiskExposure.tsx";
import BusinessServices from "./pages/itsm/BusinessServices.tsx";
import StakeholderRegister from "./pages/settings/StakeholderRegister.tsx";
import Settings from "./pages/Settings.tsx";
import Questionnaires from "./pages/Questionnaires.tsx";
import UserApprovals from "./pages/settings/UserApprovals.tsx";
import PendingApproval from "./pages/auth/PendingApproval.tsx";
import UpdateProfile from "./pages/auth/UpdateProfile.tsx";
import OrganizationLayout from "./pages/settings/organization/OrganizationLayout.tsx";
import EntityListPage from "./pages/settings/organization/EntityListPage.tsx";
import EntityDetailPage from "./pages/settings/organization/EntityDetailPage.tsx";
import HierarchyView from "./pages/settings/organization/HierarchyView.tsx";
import CompaniesList from "./pages/crm/CompaniesList.tsx";
import CompanyWorkspace from "./pages/crm/CompanyWorkspace.tsx";
import StakeholderFormPage from "./pages/crm/StakeholderFormPage.tsx";
import CrmTenantsPage from "./pages/crm/CrmTenantsPage.tsx";
import TenantSettingsPage from "./pages/crm/TenantSettingsPage.tsx";
import TenantPreviewPage from "./pages/crm/TenantPreviewPage.tsx";
import TenantAuthPage from "./pages/TenantAuthPage.tsx";
import TenantWorkspacePage from "./pages/TenantWorkspacePage.tsx";
import PracticeLibrary from "./pages/PracticeLibrary.tsx";
import TableOfContents from "./pages/practice-library/TableOfContents.tsx";
import PracticePlaceholder from "./pages/practice-library/PracticePlaceholder.tsx";
import { Navigate } from "react-router-dom";
import ItsmDashboard from "./pages/practice-library/dashboards/ItsmDashboard.tsx";
import EucPracticeDashboard from "./pages/practice-library/dashboards/EucDashboard.tsx";
import InfraDashboard from "./pages/practice-library/dashboards/InfraDashboard.tsx";
import NetworkDashboard from "./pages/practice-library/dashboards/NetworkDashboard.tsx";
import CloudDashboard from "./pages/practice-library/dashboards/CloudDashboard.tsx";
import ApplicationDashboard from "./pages/practice-library/dashboards/ApplicationDashboard.tsx";
import DataDashboard from "./pages/practice-library/dashboards/DataDashboard.tsx";
import SreDashboard from "./pages/practice-library/dashboards/SreDashboard.tsx";
import EhrDashboard from "./pages/practice-library/dashboards/EhrDashboard.tsx";
import WorkforceDashboard from "./pages/practice-library/dashboards/WorkforceDashboard.tsx";
import ApplicationProfile from "./pages/aocp/ApplicationProfile.tsx";
import EnvironmentModel from "./pages/aocp/EnvironmentModel.tsx";
import BusinessCriticality from "./pages/aocp/BusinessCriticality.tsx";
import DesiredOutcomes from "./pages/aocp/DesiredOutcomes.tsx";
import LifecycleTechDebt from "./pages/aocp/LifecycleTechDebt.tsx";
import AdminModel from "./pages/aocp/AdminModel.tsx";
import AocpPlaceholder from "./pages/aocp/AocpPlaceholder.tsx";
import ProdResilienceTwin from "./pages/prod-twin/ProdResilienceTwin.tsx";
import MeasuringSuccess from "./pages/prod-twin/MeasuringSuccess.tsx";
import HowReliabilityOperates from "./pages/prod-twin/HowReliabilityOperates.tsx";
import ProductLineMap from "./pages/prod-twin/ProductLineMap.tsx";
import GoldenWorkflowMap from "./pages/prod-twin/GoldenWorkflowMap.tsx";
import ProductionTopology from "./pages/prod-twin/ProductionTopology.tsx";
import SreOperatingModel from "./pages/prod-twin/SreOperatingModel.tsx";
import SignalIntelligence from "./pages/prod-twin/SignalIntelligence.tsx";
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
import ProductReliabilityAnatomy from "./pages/prod-twin/ProductReliabilityAnatomy.tsx";
import TransformationJourney from "./pages/prod-twin/TransformationJourney.tsx";
import CustomerSelectionDemo from "./pages/crm-demo/CustomerSelectionDemo.tsx";
import EngagementProfileDemo from "./pages/crm-demo/EngagementProfileDemo.tsx";
import StakeholderMapDemo from "./pages/crm-demo/StakeholderMapDemo.tsx";
import DiscoveryLibraryDemo from "./pages/crm-demo/DiscoveryLibraryDemo.tsx";
import DiscoveryConfidenceDemo from "./pages/crm-demo/DiscoveryConfidenceDemo.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <TenantAccessGuard>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/no-access" element={<NoAccess />} />
          <Route path="/profile" element={<UpdateProfile />} />
          <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
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
          <Route path="/operations" element={<Operations />} />
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
          <Route path="/product-reliability-anatomy" element={<ProductReliabilityAnatomy />} />
          <Route path="/transformation-journey" element={<TransformationJourney />} />
          <Route path="/product-reliability-transformation-index" element={<OperationalFrictionIndex />} />
          <Route path="/prod-resilience-twin" element={<ProdResilienceTwin />} />
          <Route path="/measuring-success" element={<MeasuringSuccess />} />
          <Route path="/how-reliability-operates" element={<HowReliabilityOperates />} />
          <Route path="/product-line-map" element={<ProductLineMap />} />
          <Route path="/golden-workflow-map" element={<GoldenWorkflowMap />} />
          <Route path="/production-topology" element={<ProductionTopology />} />
          <Route path="/sre-operating-model" element={<SreOperatingModel />} />
          <Route path="/signal-intelligence" element={<SignalIntelligence />} />
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
          <Route path="/itsm" element={<Itsm />} />
          <Route path="/itsm/exec-biz-ops" element={<ExecBizOps />} />
          <Route path="/itsm/exec-biz-ops/executive-command-center" element={<ExecutiveCommandCenter />} />
          <Route path="/itsm/exec-biz-ops/business-services" element={<BusinessServices />} />
          <Route path="/itsm/exec-biz-ops/customer-experience" element={<CustomerExperience />} />
          <Route path="/itsm/exec-biz-ops/sla-slo-error-budget" element={<SlaSloErrorBudget />} />
          <Route path="/itsm/exec-biz-ops/risk-exposure" element={<RiskExposure />} />
          <Route path="/crm" element={<ProtectedRoute><CompaniesList /></ProtectedRoute>} />
          <Route path="/crm/tenants" element={<ProtectedRoute><CrmTenantsPage /></ProtectedRoute>} />
          <Route path="/crm/tenants/:tenantId/settings" element={<ProtectedRoute requireAdmin><TenantSettingsPage /></ProtectedRoute>} />
          <Route path="/crm/tenants/:tenantId/preview" element={<ProtectedRoute requireAdmin><TenantPreviewPage /></ProtectedRoute>} />
          <Route path="/crm/companies/:companyId" element={<ProtectedRoute><CompanyWorkspace /></ProtectedRoute>} />
          <Route path="/crm/companies/:companyId/stakeholders/new" element={<ProtectedRoute><StakeholderFormPage /></ProtectedRoute>} />
          <Route path="/crm/companies/:companyId/stakeholders/:stakeholderId" element={<ProtectedRoute><StakeholderFormPage /></ProtectedRoute>} />
          <Route path="/t/:slug/auth" element={<TenantAuthPage />} />
          <Route path="/t/:slug" element={<TenantWorkspacePage />} />
          <Route path="/practice-library" element={<PracticeLibrary />} />
          <Route path="/practice-library/table-of-contents" element={<TableOfContents />} />
          <Route path="/practice-library/it-service-desk-itsm" element={<ItsmDashboard />} />
          <Route path="/practice-library/digital-workplace-euc" element={<EucPracticeDashboard />} />
          <Route path="/practice-library/infrastructure-hybrid-platform" element={<InfraDashboard />} />
          <Route path="/practice-library/network-connectivity" element={<NetworkDashboard />} />
          <Route path="/practice-library/cloud-multicloud" element={<CloudDashboard />} />
          <Route path="/practice-library/application-product-support" element={<ApplicationDashboard />} />
          <Route path="/practice-library/data-integration-interoperability" element={<DataDashboard />} />
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
          <Route path="/settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
          <Route path="/questionnaires" element={<ProtectedRoute><Questionnaires /></ProtectedRoute>} />
          <Route path="/settings/approvals" element={<ProtectedRoute requireAdmin><UserApprovals /></ProtectedRoute>} />
          <Route path="/settings/organization" element={<ProtectedRoute requireAdmin><OrganizationLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="business-units" replace />} />
            <Route path="hierarchy" element={<HierarchyView />} />
            <Route path=":levelSlug" element={<EntityListPage />} />
            <Route path=":levelSlug/:id" element={<EntityDetailPage />} />
          </Route>
          {/* AOCP — Application Intelligence */}
          <Route path="/aocp/:appId" element={<ApplicationProfile />} />
          <Route path="/aocp/:appId/environments" element={<EnvironmentModel />} />
          <Route path="/aocp/:appId/criticality" element={<BusinessCriticality />} />
          <Route path="/aocp/:appId/outcomes" element={<DesiredOutcomes />} />
          <Route path="/aocp/:appId/lifecycle" element={<LifecycleTechDebt />} />
          <Route path="/aocp/:appId/admin" element={<AdminModel />} />
          {/* AOCP — Placeholders (coming soon) */}
          <Route path="/aocp/:appId/hosting" element={<AocpPlaceholder title="Hosting Platform" />} />
          <Route path="/aocp/:appId/compute" element={<AocpPlaceholder title="Compute Services" />} />
          <Route path="/aocp/:appId/storage" element={<AocpPlaceholder title="Storage & Data Services" />} />
          <Route path="/aocp/:appId/databases" element={<AocpPlaceholder title="Database Services" />} />
          <Route path="/aocp/:appId/network" element={<AocpPlaceholder title="Network & Edge Services" />} />
          <Route path="/aocp/:appId/config-drift" element={<AocpPlaceholder title="Configuration & Drift Management" />} />
          <Route path="/aocp/:appId/tasks" element={<AocpPlaceholder title="Operational Task Inventory" />} />
          <Route path="/aocp/:appId/support-scope" element={<AocpPlaceholder title="Support Scope L1–L4" />} />
          <Route path="/aocp/:appId/workload" element={<AocpPlaceholder title="Workload Profile" />} />
          <Route path="/aocp/:appId/service-catalog" element={<AocpPlaceholder title="Service Catalog & Request Model" />} />
          <Route path="/aocp/:appId/escalation" element={<AocpPlaceholder title="Escalation & On-Call" />} />
          <Route path="/aocp/:appId/automation-catalog" element={<AocpPlaceholder title="Automation Catalog" />} />
          <Route path="/aocp/:appId/automation-heatmap" element={<AocpPlaceholder title="Automation Opportunity Heatmap" />} />
          <Route path="/aocp/:appId/auto-remediation" element={<AocpPlaceholder title="Auto Remediation Center" />} />
          <Route path="/aocp/:appId/coworker-catalog" element={<AocpPlaceholder title="Digital Coworker Catalog" />} />
          <Route path="/aocp/:appId/agentic-workflows" element={<AocpPlaceholder title="Agentic Workflow Library" />} />
          <Route path="/aocp/:appId/raci" element={<AocpPlaceholder title="Human, Automation & Digital Coworker RACI" />} />
          <Route path="/aocp/:appId/agentic-governance" element={<AocpPlaceholder title="Agentic Governance, Guardrails & Audit" />} />
          <Route path="/aocp/:appId/automation-roi" element={<AocpPlaceholder title="Automation Value & ROI" />} />
          <Route path="/aocp/:appId/maturity" element={<AocpPlaceholder title="AOCP Maturity Model" />} />
          <Route path="/aocp/:appId/cost-model" element={<AocpPlaceholder title="Internal Cost Model" />} />
          <Route path="/aocp/:appId/pricing" element={<AocpPlaceholder title="Customer Pricing" />} />
          <Route path="/aocp/:appId/scenarios" element={<AocpPlaceholder title="Scenario Modeling" />} />
          <Route path="/aocp/:appId/runops-model" element={<AocpPlaceholder title="Final RunOps Support Model" />} />
          <Route path="/crm-demo" element={<CustomerSelectionDemo />} />
          <Route path="/crm-demo/engagement" element={<EngagementProfileDemo />} />
          <Route path="/crm-demo/stakeholders" element={<StakeholderMapDemo />} />
          <Route path="/crm-demo/discovery" element={<DiscoveryLibraryDemo />} />
          <Route path="/crm-demo/confidence" element={<DiscoveryConfidenceDemo />} />
          <Route path="/settings/stakeholder-register" element={<Navigate to="/crm" replace />} />
          <Route path="/settings/stakeholder-register-legacy" element={<ProtectedRoute><StakeholderRegister /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </TenantAccessGuard>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
