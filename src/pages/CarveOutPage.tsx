import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { findCarveOutPage } from "@/data/carveout";
import { ChevronRight } from "lucide-react";

export default function CarveOutPage() {
  const { group: groupKey, slug } = useParams();
  const found = findCarveOutPage(groupKey, slug);

  if (!found) {
    return (
      <AppShell>
        <main className="flex-1 px-8 py-6">
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            Page not found in carve-out config.
          </div>
        </main>
      </AppShell>
    );
  }

  const { group, child } = found;
  const Icon = group.icon;

  return (
    <AppShell>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to="/carve-out" className="hover:text-foreground">Carve-Out</Link>
          <ChevronRight className="h-3 w-3" />
          <span>{group.title}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{child.title}</span>
        </nav>

        {/* Full-width header */}
        <div className="w-full flex items-center gap-4 mb-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="h-12 w-12 rounded-xl bg-navy text-white grid place-items-center shadow-[var(--shadow-md)] shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{child.title}</h1>
            <p className="text-sm text-muted-foreground">
              Detailed view coming soon — update with reference image.
            </p>
          </div>
        </div>

        {/* TODO: replace with reference design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card shadow-[var(--shadow-sm)] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold tracking-tight">Card {i + 1}</h3>
              </div>
              <div className="p-5">
                <div className="h-32 rounded-lg border border-dashed border-border bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
