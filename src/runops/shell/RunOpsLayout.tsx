import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DemoAiProvider, DemoOperationsProvider, RightDrawerProvider,
  useOperations,
} from "@/runops/state/RunOpsProviders";
import { ScenarioStoreProvider } from "@/runops/scenario/ScenarioStore";
import { RunOpsSidebar } from "@/runops/shell/RunOpsSidebar";
import { RunOpsTopBar } from "@/runops/shell/RunOpsTopBar";
import { RunOpsRightDrawer } from "@/runops/shell/RunOpsRightDrawer";
import { RunOpsErrorBoundary } from "@/runops/shell/RunOpsErrorBoundary";
import { DemoControllerDrawer } from "@/runops/shell/DemoControllerDrawer";
import { CommandPalette, CommandPaletteProvider } from "@/runops/shell/CommandPalette";
import { AskNovaPanel, AskNovaProvider } from "@/runops/shell/AskNovaPanel";

/**
 * Redirects the current URL to a safe section landing when a tenant switch
 * leaves the path pointing at an entity id that does not exist in the new
 * tenant's bundle (e.g. `/runops/runbooks/RB-CT-004` under Meridian).
 * Prevents dangling entity-detail pages from silently falling back to the
 * bundle's first record.
 */
function useTenantRouteEqualizer() {
  const location = useLocation();
  const navigate = useNavigate();
  const ops = useOperations();

  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith("/runops/")) return;

    const check = (
      prefix: string,
      collection: readonly { id: string }[],
      landing: string,
    ) => {
      const m = new RegExp(`^${prefix}([^/]+)`).exec(path);
      if (!m) return false;
      const id = decodeURIComponent(m[1]);
      if (id.includes(":")) return false;
      if (collection.some((x) => x.id === id)) return false;
      navigate(landing, { replace: true });
      return true;
    };

    if (check("/runops/services/", ops.services, "/runops/services")) return;
    if (check("/runops/runbooks/", ops.runbooks, "/runops/runbooks")) return;
    if (check("/runops/executions/", ops.executions, "/runops/operations/queue")) return;
    if (check("/runops/incidents/",
      [ops.incident, ...(ops.incident ? [] : [])],
      "/runops/incidents")) return;
    if (check("/runops/workers/", ops.digitalWorkers, "/runops/workers")) return;
  }, [ops.tenant.id, location.pathname, navigate,
      ops.services, ops.runbooks, ops.executions, ops.incident, ops.digitalWorkers]);
}



function Shell() {
  useTenantRouteEqualizer();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reset the mobile drawer on breakpoint change
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => setMobileOpen(false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <RunOpsSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile drawer sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <RunOpsSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      <main className={cn("flex min-w-0 flex-1 flex-col")}>
        {/* Mobile top strip with hamburger */}
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="grid h-8 w-8 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-[13px] font-semibold">RunOps</div>
        </div>

        <RunOpsTopBar />

        <div className="min-w-0 flex-1">
          <RunOpsErrorBoundary>
            <Outlet />
          </RunOpsErrorBoundary>
        </div>
      </main>

      <RunOpsRightDrawer />
      <DemoControllerDrawer />
      <AskNovaPanel />
      <CommandPalette />
    </div>
  );
}

export default function RunOpsLayout() {
  return (
    <DemoOperationsProvider>
      <DemoAiProvider>
        <RightDrawerProvider>
          <ScenarioStoreProvider>
            <AskNovaProvider>
              <CommandPaletteProvider>
                <Shell />
              </CommandPaletteProvider>
            </AskNovaProvider>
          </ScenarioStoreProvider>
        </RightDrawerProvider>
      </DemoAiProvider>
    </DemoOperationsProvider>
  );
}

