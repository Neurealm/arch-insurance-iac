import { ReactNode } from "react";
import { EocSidebar } from "./Sidebar";
import { PersonaProvider } from "@/context/PersonaContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PersonaProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <EocSidebar />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </PersonaProvider>
  );
}