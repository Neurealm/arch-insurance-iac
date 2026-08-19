// Contextual cross-highlighting.
//
// The dashboard renders the same underlying reality in several places: an
// event, the dependency it originates in, the Azure region it lives in, the
// customer deployments exposed to it and the forward-looking risk it feeds.
// Hovering any one of those objects should quietly reveal the others so the
// customer can read EVENT → DEPENDENCY → REGION → MY DEPLOYMENT → MY IMPACT
// without navigating anywhere.
//
// Emphasis is deliberately subtle: a soft ring plus a slight de-emphasis of
// unrelated objects. No motion, no pulsing, no attention-grabbing animation.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CorrelationKind = "deployment" | "dependency" | "region" | "event" | "risk";

/** Canonical key for a correlatable object, e.g. `deployment:d-west`. */
export const ckey = (kind: CorrelationKind, id: string) => `${kind}:${id}`;

/* ------------------------------- the graph -------------------------------- */

/**
 * Declared edges. Each entry lists the objects an anchor is related to; the
 * graph is symmetrised below so hovering either end reveals the other.
 */
const EDGES: Record<string, string[]> = {
  // ── Deployments ────────────────────────────────────────────────────────
  "deployment:d-east": [
    "region:r-east", "dependency:dep-your", "dependency:dep-layer", "dependency:dep-compute",
    "event:evt-api-slow", "risk:risk-compute", "risk:risk-overall",
  ],
  "deployment:d-west": [
    "region:r-west", "dependency:dep-your", "dependency:dep-storage", "dependency:dep-azure",
    "dependency:dep-region", "event:evt-blob-latency", "risk:risk-storage", "risk:risk-regional",
    "risk:risk-overall",
  ],
  "deployment:d-dr": [
    "region:r-central", "dependency:dep-your", "dependency:dep-network",
    "event:evt-net-jitter", "risk:risk-network",
  ],
  "deployment:d-eu": [
    "region:r-eu", "dependency:dep-your", "dependency:dep-layer", "dependency:dep-azure",
    "event:evt-identity-incident", "risk:risk-overall",
  ],
  "deployment:d-stg": ["region:r-east", "dependency:dep-your", "dependency:dep-compute"],

  // ── Events ─────────────────────────────────────────────────────────────
  "event:evt-blob-latency": [
    "dependency:dep-storage", "dependency:dep-region", "region:r-west",
    "deployment:d-west", "risk:risk-storage", "risk:risk-regional",
  ],
  "event:evt-api-slow": [
    "dependency:dep-compute", "dependency:dep-layer", "region:r-east",
    "deployment:d-east", "risk:risk-compute",
  ],
  "event:evt-identity-incident": [
    "dependency:dep-azure", "dependency:dep-layer", "region:r-eu",
    "deployment:d-eu", "risk:risk-overall",
  ],
  "event:evt-cert-rotation": [
    "dependency:dep-layer", "deployment:d-east", "deployment:d-west", "deployment:d-eu",
    "region:r-east", "region:r-west", "region:r-eu",
  ],
  "event:evt-net-jitter": [
    "dependency:dep-network", "region:r-central", "deployment:d-dr", "risk:risk-network",
  ],

  // ── Dependencies ───────────────────────────────────────────────────────
  "dependency:dep-storage": ["region:r-west", "risk:risk-storage"],
  "dependency:dep-compute": ["region:r-east", "risk:risk-compute"],
  "dependency:dep-network": ["region:r-central", "risk:risk-network"],
  "dependency:dep-azure": ["region:r-west", "region:r-eu", "risk:risk-overall"],
  "dependency:dep-region": ["region:r-west", "risk:risk-regional"],
  "dependency:dep-layer": ["region:r-east", "region:r-eu"],
  "dependency:dep-your": [],

  // ── Risk signals ───────────────────────────────────────────────────────
  "risk:risk-regional": ["region:r-west"],
  "risk:risk-overall": [
    "risk:risk-storage", "risk:risk-compute", "risk:risk-network", "risk:risk-regional",
  ],
};

const GRAPH: Record<string, Set<string>> = (() => {
  const g: Record<string, Set<string>> = {};
  const add = (a: string, b: string) => {
    (g[a] ??= new Set()).add(b);
  };
  for (const [anchor, rels] of Object.entries(EDGES)) {
    g[anchor] ??= new Set();
    for (const r of rels) {
      add(anchor, r);
      add(r, anchor);
    }
  }
  return g;
})();

/** Objects related to `key`, excluding itself. */
export function relatedKeys(key: string | null): Set<string> {
  if (!key) return new Set();
  return GRAPH[key] ?? new Set();
}

/* ------------------------------- the context ------------------------------ */

export type CorrelationState = "idle" | "active" | "related" | "muted";

interface CorrelationApi {
  activeKey: string | null;
  setActive: (key: string | null) => void;
  stateOf: (key: string) => CorrelationState;
}

const Ctx = createContext<CorrelationApi>({
  activeKey: null,
  setActive: () => {},
  stateOf: () => "idle",
});

export function CorrelationProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const related = useMemo(() => relatedKeys(activeKey), [activeKey]);

  const stateOf = useCallback(
    (key: string): CorrelationState => {
      if (!activeKey) return "idle";
      if (key === activeKey) return "active";
      if (related.has(key)) return "related";
      return "muted";
    },
    [activeKey, related],
  );

  const value = useMemo<CorrelationApi>(
    () => ({ activeKey, setActive: setActiveKey, stateOf }),
    [activeKey, stateOf],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Wire an object into the cross-highlight graph.
 * Returns the visual state plus the pointer/keyboard handlers to spread.
 */
export function useCorrelation(key?: string) {
  const { setActive, stateOf } = useContext(Ctx);
  const state: CorrelationState = key ? stateOf(key) : "idle";
  const bind = key
    ? {
        onMouseEnter: () => setActive(key),
        onMouseLeave: () => setActive(null),
        onFocus: () => setActive(key),
        onBlur: () => setActive(null),
      }
    : {};
  return { state, bind, className: correlationClass(state) };
}

export function useCorrelationActive() {
  return useContext(Ctx).activeKey;
}

/** Subtle emphasis tokens — a soft ring for relatives, gentle fade for the rest. */
export function correlationClass(state: CorrelationState, className?: string) {
  return cn(
    "transition-[opacity,box-shadow,background-color] duration-200 ease-out",
    state === "active" && "ring-2 ring-sky-400/70 ring-offset-1 ring-offset-white",
    state === "related" && "ring-2 ring-sky-300/70 ring-offset-1 ring-offset-white bg-sky-50/50",
    state === "muted" && "opacity-45 saturate-[0.6]",
    className,
  );
}
