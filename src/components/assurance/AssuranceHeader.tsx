import { Bell, History, ChevronRight } from "lucide-react";
import { UserMenu } from "@/components/eoc/UserMenu";

type Crumb = { label: string; current?: boolean };

export function AssuranceHeader({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="bg-card border-b border-border">
      <div className="px-8 pt-5 pb-5 flex items-start gap-6">
        <div className="flex-1 min-w-0">
          {crumbs && crumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs mb-2 min-w-0">
              {crumbs.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                  <span className={c.current ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground cursor-pointer"}>
                    {c.label}
                  </span>
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 mt-1 shrink-0">
          {actions}
          <div className="flex items-center gap-2 px-3 h-11 rounded-xl border border-border bg-card text-xs">
            <span className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
            <span className="font-semibold">All Systems Operational</span>
          </div>
          <button className="relative h-11 w-11 rounded-xl border border-border bg-card grid place-items-center hover:bg-secondary transition">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center text-[10px] font-bold rounded-full bg-status-critical text-white">3</span>
          </button>
          <button className="h-11 w-11 rounded-xl border border-border bg-card grid place-items-center hover:bg-secondary transition">
            <History className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}