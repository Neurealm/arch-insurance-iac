import { ReactNode } from "react";
import { EocSidebar } from "./Sidebar";
import { PersonaProvider } from "@/context/PersonaContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PersonaProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        <EocSidebar />
        {/* Spacer matches the collapsed sidebar width so content never reflows when the sidebar expands. */}
        <div className="flex flex-col min-w-0 min-h-screen pl-[72px]">{children}</div>
      </div>
    </PersonaProvider>
  );
}