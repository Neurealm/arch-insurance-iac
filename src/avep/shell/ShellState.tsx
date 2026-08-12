import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * AVEP Shell state — scenario / persona / program / tenant selectors,
 * sidebar collapse, and command-palette visibility.
 * No business data; foundation only.
 */

export const AVEP_SCENARIOS = [
  { id: "baseline",    label: "Baseline" },
  { id: "ai-assisted", label: "AI-Assisted" },
  { id: "regression",  label: "Regression Sweep" },
  { id: "signoff",     label: "Signoff Freeze" },
] as const;

export const AVEP_PERSONAS = [
  { id: "verification-lead", label: "Verification Lead" },
  { id: "rtl-engineer",      label: "RTL Engineer" },
  { id: "program-manager",   label: "Program Manager" },
  { id: "signoff-owner",     label: "Signoff Owner" },
  { id: "governance",        label: "Governance Reviewer" },
] as const;

export const AVEP_PROGRAMS = [
  { id: "project-aegis", label: "Project Aegis" },
] as const;

export const AVEP_TENANTS = [
  { id: "panw-eng-demo", label: "Palo Alto Networks Engineering Demo" },
] as const;

export type AvepScenarioId = typeof AVEP_SCENARIOS[number]["id"];
export type AvepPersonaId  = typeof AVEP_PERSONAS[number]["id"];
export type AvepProgramId  = typeof AVEP_PROGRAMS[number]["id"];
export type AvepTenantId   = typeof AVEP_TENANTS[number]["id"];

interface AvepShellState {
  scenarioId: AvepScenarioId;
  personaId: AvepPersonaId;
  programId: AvepProgramId;
  tenantId: AvepTenantId;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  setScenarioId: (id: AvepScenarioId) => void;
  setPersonaId: (id: AvepPersonaId) => void;
  setProgramId: (id: AvepProgramId) => void;
  setTenantId: (id: AvepTenantId) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
}

const AvepShellContext = createContext<AvepShellState | null>(null);

export function AvepShellProvider({ children }: { children: ReactNode }) {
  const [scenarioId, setScenarioId] = useState<AvepScenarioId>("baseline");
  const [personaId, setPersonaId] = useState<AvepPersonaId>("verification-lead");
  const [programId, setProgramId] = useState<AvepProgramId>("project-aegis");
  const [tenantId, setTenantId] = useState<AvepTenantId>("panw-eng-demo");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);

  // Cmd/Ctrl+K opens command palette. Esc handled inside palette component.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<AvepShellState>(
    () => ({
      scenarioId, personaId, programId, tenantId,
      sidebarCollapsed, commandOpen,
      setScenarioId, setPersonaId, setProgramId, setTenantId,
      toggleSidebar, setCommandOpen,
    }),
    [scenarioId, personaId, programId, tenantId, sidebarCollapsed, commandOpen, toggleSidebar],
  );

  return <AvepShellContext.Provider value={value}>{children}</AvepShellContext.Provider>;
}

export function useAvepShell(): AvepShellState {
  const ctx = useContext(AvepShellContext);
  if (!ctx) throw new Error("useAvepShell must be used inside <AvepShellProvider>");
  return ctx;
}
