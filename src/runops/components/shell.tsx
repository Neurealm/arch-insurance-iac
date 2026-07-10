// Shell components: AppShell, PrimaryNavigation, ContextBar, Breadcrumbs,
// EntityHeader, EntityTabs, PageToolbar, RightContextDrawer,
// ScenarioModeBanner. Layout-only — presentation, no data fetching.

import { cn } from "@/lib/utils";
import { ChevronRight, PanelRightClose } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusIndicator, type StatusIndicatorProps } from "./_types";

export interface AppShellProps {
  sidebar: React.ReactNode;
  topBar?: React.ReactNode;
  drawer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ sidebar, topBar, drawer, children, className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh w-full bg-slate-50 text-slate-900", className)}>
      <div className="hidden md:block">{sidebar}</div>
      <main className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      {drawer}
    </div>
  );
}

/* -------------------------- Primary navigation ------------------------- */

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export function PrimaryNavigation({
  groups, collapsed, className,
}: { groups: NavGroup[]; collapsed?: boolean; className?: string }) {
  return (
    <nav className={cn("flex flex-col gap-4 p-2", className)} aria-label="Primary">
      {groups.map((g) => (
        <div key={g.label}>
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {g.label}
            </div>
          )}
          <ul className="flex flex-col">
            {g.items.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                    isActive && "bg-slate-900 text-white hover:bg-slate-900",
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" aria-hidden />}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------- Context ------------------------------- */

export function ContextBar({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------- Breadcrumbs ----------------------------- */

export interface Crumb { label: string; href?: string }

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-xs text-slate-600", className)}>
      <ol className="flex items-center gap-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href && !isLast ? (
                <NavLink
                  to={c.href}
                  className="rounded px-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {c.label}
                </NavLink>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={cn(isLast && "font-semibold text-slate-900")}>
                  {c.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* --------------------------- Entity header/tabs ------------------------ */

export interface EntityHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: StatusIndicatorProps;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function EntityHeader({ eyebrow, title, subtitle, status, actions, meta, className }: EntityHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2 border-b border-slate-200 bg-white px-4 py-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</div>
          )}
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
            {status && <StatusIndicator {...status} />}
          </div>
          {subtitle && <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {meta && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">{meta}</div>}
    </header>
  );
}

export interface EntityTab { label: string; value: string; badge?: string }

export function EntityTabs({
  tabs, value, onChange, className,
}: { tabs: EntityTab[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div role="tablist" className={cn("flex items-center gap-1 border-b border-slate-200 bg-white px-2", className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
              active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-600 hover:text-slate-900",
            )}
          >
            {t.label}
            {t.badge && (
              <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-600">{t.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- Page toolbar ---------------------------- */

export function PageToolbar({
  left, right, className,
}: { left?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2", className)}>
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}

/* -------------------------- Right context drawer ----------------------- */

export interface RightContextDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function RightContextDrawer({ open, onOpenChange, title, subtitle, children }: RightContextDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] overflow-y-auto sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between text-base">
            <span>{title}</span>
            <Button variant="ghost" size="icon" aria-label="Close drawer" onClick={() => onOpenChange(false)}>
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </SheetTitle>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </SheetHeader>
        <div className="mt-3">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------- Scenario mode banner ----------------------- */

export function ScenarioModeBanner({
  mode, stageLabel, onOpenController, className,
}: { mode: "demo" | "connected"; stageLabel?: string; onOpenController?: () => void; className?: string }) {
  if (mode !== "demo") return null;
  return (
    <div
      role="note"
      aria-label="Simulation mode active"
      className={cn(
        "flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] text-amber-900",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
        <span className="font-semibold uppercase tracking-wide">Simulation</span>
        {stageLabel && <span className="text-amber-800">· {stageLabel}</span>}
      </div>
      {onOpenController && (
        <button
          type="button"
          onClick={onOpenController}
          className="rounded border border-amber-300 bg-white px-2 py-0.5 font-medium text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Open controller
        </button>
      )}
    </div>
  );
}
