import { ReactNode } from "react";
import { EocSidebar } from "./Sidebar";
import { PersonaProvider } from "@/context/PersonaContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PersonaProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        <EocSidebar />
        {/* Reserve the full sidebar width so page content never sits underneath the expanded navigation. */}
        <div className="flex flex-col min-w-0 min-h-screen pl-[284px]">{children}</div>
      </div>
    </PersonaProvider>
  );
}