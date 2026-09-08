import { lazy } from "react";
import { LazyRouteBoundary } from "@/components/routing/LazyRouteBoundary";
import { RequireAuth } from "@/components/routing/RequireAuth";
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
const ServiceNowIntake = lazy(() => import("./pages/agentic-iac/ServiceNowIntake.tsx"));
// Kept reachable but hidden from navigation: tickets are raised from the intake screen.
const DemoChangeRequest = lazy(() => import("./pages/agentic-iac/DemoChangeRequest.tsx"));
const ChangeEngineering = lazy(() => import("./pages/agentic-iac/ChangeEngineering.tsx"));
const ProvisionVms = lazy(() => import("./pages/agentic-iac/change/ProvisionVms.tsx"));
const ChangeReviewApproval = lazy(() => import("./pages/agentic-iac/ChangeReviewApproval.tsx"));
const ExecutionCenter = lazy(() => import("./pages/agentic-iac/ExecutionCenter.tsx"));
const ValidationEvidence = lazy(() => import("./pages/agentic-iac/ValidationEvidence.tsx"));
const CapabilityApproval = lazy(() => import("./pages/agentic-iac/CapabilityApproval.tsx"));

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
  const target = rest && rest !== "/" ? rest : "/servicenow-intake";
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
                  <Route path="/servicenow-intake" element={<ServiceNowIntake />} />
                  <Route path="/demo-change-request" element={<DemoChangeRequest />} />
                  <Route path="/changes" element={<ChangeEngineering />} />
                  <Route path="/changes/provision-vms" element={<ProvisionVms />} />
                  <Route path="/changes/virtual-machines/:vmName" element={<ChangeEngineering />} />
                  <Route path="/changes/:assetId" element={<Navigate to="/changes" replace />} />
                  <Route path="/approvals" element={<ChangeReviewApproval />} />
                  <Route path="/approvals/:packageId" element={<ChangeReviewApproval />} />
                  <Route path="/execution" element={<ExecutionCenter />} />
                  <Route path="/execution/:packageId" element={<ExecutionCenter />} />
                  <Route path="/validation" element={<ValidationEvidence />} />
                  <Route path="/validation/:packageId" element={<ValidationEvidence />} />
                  <Route path="/platform/capabilities" element={<CapabilityApproval />} />
                  <Route path="/platform/capabilities/:gapId" element={<CapabilityApproval />} />
                </Route>
              </Route>


              {/* Legacy prefixes */}
              <Route path="/agentic-iac-engineering/*" element={<LegacyIacRedirect />} />
              <Route path="/intelligent-iac/*" element={<LegacyIacRedirect />} />

              {/* Entry point and everything else */}
              <Route path="/" element={<Navigate to="/servicenow-intake" replace />} />
              <Route path="*" element={<Navigate to="/servicenow-intake" replace />} />
            </Routes>
          </LazyRouteBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
