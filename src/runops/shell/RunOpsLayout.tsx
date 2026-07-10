import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoAiProvider, DemoOperationsProvider, RightDrawerProvider } from "@/runops/state/RunOpsProviders";
import { ScenarioStoreProvider } from "@/runops/scenario/ScenarioStore";
import { RunOpsSidebar } from "@/runops/shell/RunOpsSidebar";
import { RunOpsTopBar } from "@/runops/shell/RunOpsTopBar";
import { RunOpsRightDrawer } from "@/runops/shell/RunOpsRightDrawer";
import { RunOpsErrorBoundary } from "@/runops/shell/RunOpsErrorBoundary";
import { DemoControllerDrawer } from "@/runops/shell/DemoControllerDrawer";
import { CommandPalette, CommandPaletteProvider } from "@/runops/shell/CommandPalette";
import { AskNovaPanel, AskNovaProvider } from "@/runops/shell/AskNovaPanel";


function Shell() {
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

