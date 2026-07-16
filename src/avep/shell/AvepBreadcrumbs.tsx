import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { AVEP_NAV } from "./navigation";

export function AvepBreadcrumbs() {
  const { pathname } = useLocation();
  const match = AVEP_NAV.find((n) => n.path === pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5"
      style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-subtle))" }}
    >
      <Link to="/avep" className="flex items-center gap-1 hover:underline" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
        <Home className="h-3.5 w-3.5" /> AVEP
      </Link>
      {match && match.path !== "/avep" && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{match.group}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span style={{ color: "hsl(var(--avep-foreground))", fontWeight: 600 }}>{match.label}</span>
        </>
      )}
    </nav>
  );
}

export function AvepPageTitle() {
  const { pathname } = useLocation();
  const match = AVEP_NAV.find((n) => n.path === pathname);
  const title = match?.label ?? "Overview";
  return (
    <h1
      style={{
        fontSize: "var(--avep-text-2xl)",
        fontWeight: 600,
        letterSpacing: "var(--avep-tracking-tight)",
        color: "hsl(var(--avep-foreground))",
      }}
    >
      {title}
    </h1>
  );
}
