import { createContext, useContext, type ReactNode } from "react";

/**
 * True when a page is rendered inside a module-specific shell (which already
 * provides its own left navigation), so `AppShell` should skip the global
 * EOC sidebar and render content only.
 */
const ModuleShellContext = createContext(false);

export function ModuleShellProvider({ children }: { children: ReactNode }) {
  return <ModuleShellContext.Provider value={true}>{children}</ModuleShellContext.Provider>;
}

export function useInModuleShell() {
  return useContext(ModuleShellContext);
}
