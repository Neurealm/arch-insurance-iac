import { createContext, useContext, useMemo, type ReactNode } from "react";
import "./tokens.css";

/**
 * AVEP — AI VLSI Engineering Platform
 * Centralized theme provider. Every AVEP surface must be rendered
 * inside <AvepThemeProvider> so design tokens resolve correctly.
 *
 * Dark mode is intentionally disabled for AVEP (bright engineering UI).
 */

export const AVEP_IDENTITY = {
  applicationName: "AI VLSI Engineering Platform",
  shortName: "AVEP",
  tenant: "Palo Alto Networks Engineering Demo",
  program: "Project Aegis",
  primaryIp: "DDMAC 2.4",
} as const;

export type AvepIdentity = typeof AVEP_IDENTITY;

const AvepThemeContext = createContext<AvepIdentity>(AVEP_IDENTITY);

export function useAvepTheme(): AvepIdentity {
  return useContext(AvepThemeContext);
}

interface AvepThemeProviderProps {
  children: ReactNode;
  className?: string;
}

export function AvepThemeProvider({ children, className }: AvepThemeProviderProps) {
  const value = useMemo(() => AVEP_IDENTITY, []);
  return (
    <AvepThemeContext.Provider value={value}>
      <div
        className={["avep-root", className].filter(Boolean).join(" ")}
        data-avep-app={AVEP_IDENTITY.shortName}
      >
        {children}
      </div>
    </AvepThemeContext.Provider>
  );
}
