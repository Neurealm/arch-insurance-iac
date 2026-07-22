import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AvepThemeProvider } from "../theme";
import { AvepShellProvider } from "./ShellState";
import { AvepSidebar } from "./AvepSidebar";
import { AvepTopBar } from "./AvepTopBar";
import { AvepFooter } from "./AvepFooter";
import { AvepBreadcrumbs, AvepPageTitle } from "./AvepBreadcrumbs";
import { AvepCommandPalette } from "./AvepCommandPalette";

export function AvepLayout() {
  return (
    <AvepThemeProvider>
      <AvepShellProvider>
        <div className="h-screen w-full flex flex-col" style={{ background: "hsl(var(--avep-bg))" }}>
          <AvepTopBar />
          <div className="flex-1 flex min-h-0">
            <AvepSidebar />
            <main
              className="flex-1 flex flex-col min-w-0 overflow-hidden"
              role="main"
              aria-label="AVEP main content"
            >
              <div className="flex-1 overflow-auto px-6 py-6">
                <Outlet />
              </div>
            </main>
          </div>
          <AvepFooter />
          <AvepCommandPalette />
          <Toaster position="bottom-right" richColors closeButton />
        </div>
      </AvepShellProvider>
    </AvepThemeProvider>
  );
}
