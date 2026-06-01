import { AppShell } from "@/components/eoc/AppShell";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="bg-slate-50/60 min-h-full p-4 md:p-6">{children}</div>
    </AppShell>
  );
}