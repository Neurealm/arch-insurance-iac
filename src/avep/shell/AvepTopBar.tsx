import { Search, Bell, HelpCircle, Command as CmdIcon } from "lucide-react";
import {
  AVEP_SCENARIOS, AVEP_PERSONAS, AVEP_PROGRAMS, AVEP_TENANTS,
  useAvepShell,
} from "./ShellState";
import { AVEP_IDENTITY } from "../theme";

const selectStyle: React.CSSProperties = {
  background: "hsl(var(--avep-surface-muted))",
  border: "1px solid hsl(var(--avep-border))",
  color: "hsl(var(--avep-foreground))",
  fontSize: "var(--avep-text-xs)",
  borderRadius: "var(--avep-radius-sm)",
  padding: "4px 8px",
  height: 28,
};

const iconBtnStyle: React.CSSProperties = {
  height: 32, width: 32,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "var(--avep-radius-sm)",
  color: "hsl(var(--avep-foreground-muted))",
};

export function AvepTopBar() {
  const s = useAvepShell();

  return (
    <header
      className="h-14 shrink-0 border-b flex items-center gap-3 px-4"
      style={{
        borderColor: "hsl(var(--avep-border))",
        background: "hsl(var(--avep-surface))",
      }}
      role="banner"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold truncate" style={{ fontSize: "var(--avep-text-md)" }}>
          {AVEP_IDENTITY.applicationName}
        </span>
        <span
          className="px-1.5 py-0.5 rounded"
          style={{
            fontSize: "var(--avep-text-2xs)",
            background: "hsl(var(--avep-accent-soft))",
            color: "hsl(var(--avep-accent))",
            fontWeight: 600,
            letterSpacing: "var(--avep-tracking-wide)",
          }}
        >
          {AVEP_IDENTITY.primaryIp}
        </span>
      </div>

      <button
        type="button"
        onClick={() => s.setCommandOpen(true)}
        className="ml-4 flex-1 max-w-xl flex items-center gap-2 h-8 px-2.5 rounded-md hover:opacity-90 transition-opacity text-left"
        style={{
          background: "hsl(var(--avep-surface-muted))",
          border: "1px solid hsl(var(--avep-border))",
          color: "hsl(var(--avep-foreground-subtle))",
          fontSize: "var(--avep-text-sm)",
        }}
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Search entities, modules, tests…</span>
        <span
          className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded"
          style={{
            background: "hsl(var(--avep-surface))",
            border: "1px solid hsl(var(--avep-border))",
            fontSize: "var(--avep-text-2xs)",
            color: "hsl(var(--avep-foreground-muted))",
          }}
        >
          <CmdIcon className="h-3 w-3" /> K
        </span>
      </button>

      <div className="hidden lg:flex items-center gap-2 ml-auto">
        <select style={selectStyle} value={s.tenantId} onChange={(e) => s.setTenantId(e.target.value as never)} aria-label="Tenant">
          {AVEP_TENANTS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select style={selectStyle} value={s.programId} onChange={(e) => s.setProgramId(e.target.value as never)} aria-label="Program">
          {AVEP_PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select style={selectStyle} value={s.scenarioId} onChange={(e) => s.setScenarioId(e.target.value as never)} aria-label="Scenario">
          {AVEP_SCENARIOS.map((sc) => <option key={sc.id} value={sc.id}>{sc.label}</option>)}
        </select>
        <select style={selectStyle} value={s.personaId} onChange={(e) => s.setPersonaId(e.target.value as never)} aria-label="Persona">
          {AVEP_PERSONAS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <button type="button" style={iconBtnStyle} aria-label="Notifications" className="hover:bg-black/[0.04]">
          <Bell className="h-4 w-4" />
        </button>
        <button type="button" style={iconBtnStyle} aria-label="Help" className="hover:bg-black/[0.04]">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
