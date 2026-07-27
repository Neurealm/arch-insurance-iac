import { createContext } from "react";

/**
 * Contextual Audio Enrichment — deployment control.
 *
 * The project has no central feature flag service, so CAE follows the existing
 * Vite environment convention used elsewhere in the app (`import.meta.env`),
 * with a local override for support and QA sessions.
 *
 * Resolution order:
 *   1. `localStorage["cae:enabled"]` — "true" / "false" (support + QA override)
 *   2. `VITE_CAE_ENABLED` — "false" disables the capability for a deployment
 *   3. enabled (default)
 *
 * When disabled: the global provider mounts an inert controller, audio
 * affordances render nothing, and no narration requests are issued.
 */

export const CAE_FLAG_STORAGE_KEY = "cae:enabled";

function readOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CAE_FLAG_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  } catch {
    return null;
  }
}

function readEnv(): boolean {
  const raw = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_CAE_ENABLED;
  return String(raw ?? "true").toLowerCase() !== "false";
}

/** True when Contextual Audio Enrichment is active for this deployment/session. */
export function isContextualAudioEnabled(): boolean {
  return readOverride() ?? readEnv();
}

/** Hook form for components. The flag is read per render; it is a cheap sync read. */
export function useContextualAudioEnabled(): boolean {
  return isContextualAudioEnabled();
}

/**
 * Set to true by the global error boundary after an audio fault. The provider
 * reads it and degrades to an inert controller for the rest of the session.
 * Declared here (a dependency-free module) to avoid a provider/boundary cycle.
 */
export const CaeFaultContext = createContext(false);
