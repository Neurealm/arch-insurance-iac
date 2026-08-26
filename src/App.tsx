import { lazy } from "react";
import { LazyRouteBoundary } from "@/components/routing/LazyRouteBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "./pages/auth/Login.tsx";
import Signup from "./pages/auth/Signup.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import PendingApproval from "./pages/auth/PendingApproval.tsx";
import UpdateProfile from "./pages/auth/UpdateProfile.tsx";
import SetInitialPassword from "./pages/auth/SetInitialPassword.tsx";
import CompleteProfile from "./pages/auth/CompleteProfile.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

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

const queryClient = new QueryClient();

/** Maps historical `/agentic-iac-engineering/*` and `/intelligent-iac/*` URLs onto the clean routes. */
function LegacyIacRedirect() {
  const { pathname, search, hash } = useLocation();
  let rest = pathname
    .replace(/^\/agentic-iac-engineering/, "")
    .replace(/^\/intelligent-iac/, "");
  rest = rest
    .replace(/^\/remediation-intelligence/, "/remediation")
    .replace(/^\/change-engineering/, "/changes")
    .replace(/^\/change-review/, "/approvals")
    .replace(/^\/execution-center/, "/execution");
  const target = rest && rest !== "/" ? rest : "/resources";
  return <Navigate to={`${target}${search}${hash}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LazyRouteBoundary>
            <Routes>
              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/set-initial-password" element={<SetInitialPassword />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />

              {/* Infrastructure as Code application (authentication required) */}
              <Route element={<RequireAuth />}>
                <Route element={<IacLayout />}>
                  <Route path="/connections" element={<AzureConnections />} />
                  <Route path="/resources" element={<AzureResources />} />
                  <Route path="/resources/virtual-machines/:vmName" element={<AssetDigitalTwin />} />
                  <Route path="/remediation" element={<RemediationIntelligence />} />
                  <Route path="/remediation/:assetId" element={<RemediationIntelligence />} />
                  <Route path="/changes" element={<ChangeEngineering />} />
                  <Route path="/changes/:assetId" element={<ChangeEngineering />} />
                  <Route path="/approvals" element={<ChangeReviewApproval />} />
                  <Route path="/approvals/:packageId" element={<ChangeReviewApproval />} />
                  <Route path="/execution" element={<ExecutionCenter />} />
                  <Route path="/execution/:packageId" element={<ExecutionCenter />} />
                  <Route path="/validation" element={<ValidationEvidence />} />
                  <Route path="/validation/:packageId" element={<ValidationEvidence />} />
                  <Route path="/platform/deployment-architecture" element={<DeploymentArchitecture />} />
                  <Route path="/platform/integrations" element={<IntegrationsConnectivity />} />
                  <Route path="/platform/access-security" element={<AccessGovernance />} />
                  <Route path="/platform/policies-governance" element={<PoliciesGovernance />} />
                  <Route path="/platform/audit-compliance" element={<PlatformAdminPlaceholder />} />
                  <Route path="/platform/system-settings" element={<SystemSettingsPage />} />
                </Route>
              </Route>


              {/* Legacy prefixes */}
              <Route path="/agentic-iac-engineering/*" element={<LegacyIacRedirect />} />
              <Route path="/intelligent-iac/*" element={<LegacyIacRedirect />} />

              {/* Entry point and everything else */}
              <Route path="/" element={<Navigate to="/resources" replace />} />
              <Route path="*" element={<Navigate to="/resources" replace />} />
            </Routes>
          </LazyRouteBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
