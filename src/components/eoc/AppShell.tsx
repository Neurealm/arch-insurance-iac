import { ReactNode } from "react";
import { EocSidebar } from "./Sidebar";
import { PersonaProvider } from "@/context/PersonaContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PersonaProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        <EocSidebar />
        {/* Reserve the sidebar width so content never sits underneath the navigation. Adjusts when collapsed. */}
        <div className="flex flex-col min-w-0 min-h-screen pl-[284px] has-[aside[data-collapsed=true]]:pl-[72px] transition-[padding] duration-300 ease-out">
          {children}
        </div>
      </div>
    </PersonaProvider>
  );
}