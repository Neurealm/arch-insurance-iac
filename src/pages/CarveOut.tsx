import { AppShell } from "@/components/eoc/AppShell";
import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { carveOutGroups } from "@/data/carveout";

export default function CarveOut() {
  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)]">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IT Carve-Out & Separation Operating Model</h1>
            <p className="text-sm text-muted-foreground">Operating model, governance, and execution playbook for IT separation programs.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carveOutGroups.map((g) => {
            const Icon = g.icon;
            const first = g.children[0];
            return (
              <Link
                key={g.key}
                to={`/carve-out/${g.key}/${first.slug}`}
                className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-navy text-white grid place-items-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">{g.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {g.children.length} dashboards
                    </p>
                    <span className="inline-block mt-3 text-xs font-medium text-navy group-hover:underline">
                      Open first dashboard →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
