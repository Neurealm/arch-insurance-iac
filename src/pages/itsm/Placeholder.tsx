import { AppShell } from "@/components/eoc/AppShell";
import { Construction } from "lucide-react";

export default function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
            <Construction className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Dashboard coming soon.
        </div>
      </main>
    </AppShell>
  );
}