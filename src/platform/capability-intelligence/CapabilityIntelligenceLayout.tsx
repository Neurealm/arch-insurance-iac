import { NavLink, Outlet } from "react-router-dom";
import { CapabilityIntelligenceProvider, useCapabilityIntelligence } from "./CapabilityIntelligenceProvider";
import { LoadingState, ErrorState } from "@/platform/components/States";
import { StatusBadge } from "@/platform/components/StatusBadge";

const TABS = [
  { to: "/platform/capability-intelligence", label: "Overview", end: true },
  { to: "/platform/capability-intelligence/explorer", label: "Capability Explorer" },
  { to: "/platform/capability-intelligence/recommendations", label: "Recommendation Center" },
];

function Header() {
  const { graphHash, loading } = useCapabilityIntelligence();
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Capability Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Read-only architectural health of the Neugain.io platform, derived from the capability graph.
          </p>
        </div>
        {!loading && graphHash && (
          <div className="text-right text-[11px] text-muted-foreground">
            <div>Graph hash</div>
            <div className="font-mono text-foreground">{graphHash}</div>
          </div>
        )}
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="Capability Intelligence sections">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
        <div className="ml-auto flex items-center pb-1">
          <StatusBadge value="read-only" tone="neutral" />
        </div>
      </nav>
    </header>
  );
}

function Body() {
  const { loading, error, reload } = useCapabilityIntelligence();
  if (loading) return <LoadingState label="Analysing capability graph…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return <Outlet />;
}

/** Route group shell for /platform/capability-intelligence. */
export default function CapabilityIntelligenceLayout() {
  return (
    <CapabilityIntelligenceProvider>
      <div className="space-y-6">
        <Header />
        <Body />
      </div>
    </CapabilityIntelligenceProvider>
  );
}
