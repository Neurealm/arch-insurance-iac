// Dashboard-wide filtering.
//
// Filtering here is deliberately *subordinating* rather than destructive: an
// Azure condition that does not touch the customer's deployed services is
// still useful context, so it stays on screen — quietly de-emphasised — while
// everything relevant to the selected view stays fully legible.
//
// Filter state is held above the router outlet and mirrored into
// sessionStorage, so it survives as the customer explores the dashboard.

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { deployments, dependencies, events as seedEvents, regions } from "./data";
import { riskSignals } from "./riskDetail";
import { relatedKeys, useCorrelation } from "./correlation";

/* --------------------------------- model ---------------------------------- */

export type FilterView =
  | "all" | "affecting" | "at-risk" | "advisories" | "incidents" | "maintenance";

export type EnvironmentFilter = "all" | "Production" | "Disaster Recovery" | "Non-production";
export type TimeRange = "24h" | "7d" | "30d" | "90d";

export interface FilterState {
  view: FilterView;
  deployment: string; // "all" | deployment id
  region: string;     // "all" | region id
  environment: EnvironmentFilter;
  timeRange: TimeRange;
}

export const DEFAULT_FILTERS: FilterState = {
  view: "all", deployment: "all", region: "all", environment: "all", timeRange: "24h",
};

export const VIEW_LABELS: Record<FilterView, string> = {
  all: "All",
  affecting: "Affecting Me",
  "at-risk": "At Risk",
  advisories: "Advisories",
  incidents: "Incidents",
  maintenance: "Maintenance",
};

const VIEW_HINTS: Record<FilterView, string> = {
  all: "Everything we track for you, including provider conditions that do not touch your services.",
  affecting: "Only conditions with a real relationship to your deployed services are emphasised. Other cloud conditions stay visible as context, but subordinated.",
  "at-risk": "Objects carrying an elevated probability of future impact. Risk is not the same as current impact.",
  advisories: "Open advisories — we are watching an underlying condition; it is not necessarily reaching your users.",
  incidents: "Events with confirmed impact to your service experience.",
  maintenance: "Planned changes and maintenance that intersect your environment.",
};

export const ENVIRONMENT_LABELS: Record<EnvironmentFilter, string> = {
  all: "All environments",
  Production: "Production",
  "Disaster Recovery": "DR",
  "Non-production": "Test / Development",
};

export const TIME_LABELS: Record<TimeRange, string> = {
  "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days",
};

/** Mock age of each event, used by the time-range control. */
const EVENT_AGE_HOURS: Record<string, number> = {
  "evt-blob-latency": 1.5,
  "evt-api-slow": 0.8,
  "evt-identity-incident": 2.1,
  "evt-cert-rotation": 0,
  "evt-net-jitter": 13,
};
const RANGE_HOURS: Record<TimeRange, number> = { "24h": 24, "7d": 168, "30d": 720, "90d": 2160 };

/* ------------------------------- the context ------------------------------- */

export type Emphasis = "match" | "subordinate";

interface FilterApi {
  filters: FilterState;
  set: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  reset: () => void;
  isDefault: boolean;
  activeCount: number;
  /** Whether an object (by correlation key) matches the current filters. */
  emphasisFor: (key: string) => Emphasis;
  viewHint: string;
}

const Ctx = createContext<FilterApi>({
  filters: DEFAULT_FILTERS,
  set: () => {},
  reset: () => {},
  isDefault: true,
  activeCount: 0,
  emphasisFor: () => "match",
  viewHint: VIEW_HINTS.all,
});

const STORAGE_KEY = "customer-health:filters";

function load(): FilterState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_FILTERS, ...(JSON.parse(raw) as Partial<FilterState>) };
  } catch { /* ignore */ }
  return DEFAULT_FILTERS;
}

/* ------------------------------ match helpers ------------------------------ */

const kindOf = (key: string) => key.split(":")[0];
const idOf = (key: string) => key.split(":").slice(1).join(":");

/** Every key touching a given anchor (the anchor itself plus its relatives). */
const closure = (key: string) => new Set<string>([key, ...relatedKeys(key)]);

/** Does the object relate to at least one of the customer's deployments? */
function touchesADeployment(key: string): boolean {
  if (kindOf(key) === "deployment") return true;
  const ids = new Set(deployments.map((d) => d.id));
  for (const k of relatedKeys(key)) {
    if (kindOf(k) === "deployment" && ids.has(idOf(k))) return true;
  }
  return false;
}

function matchesView(key: string, view: FilterView): boolean {
  if (view === "all") return true;
  const kind = kindOf(key);
  const id = idOf(key);

  if (view === "affecting") {
    if (kind === "region") return regions.find((r) => r.id === id)?.hasDeployment ?? false;
    if (kind === "risk") return (riskSignals.find((r) => r.id === id)?.affectedDeployments?.length ?? 0) > 0;
    return touchesADeployment(key);
  }

  if (view === "at-risk") {
    if (kind === "risk") return true;
    if (kind === "deployment") {
      const d = deployments.find((x) => x.id === id);
      return !!d && ((d.advisoryCount ?? 0) > 0 || d.status !== "healthy");
    }
    if (kind === "dependency") {
      const dep = dependencies.find((x) => x.id === id);
      return !!dep && dep.status !== "healthy";
    }
    if (kind === "region") {
      const r = regions.find((x) => x.id === id);
      return !!r && (r.infraStatus !== "healthy" || r.serviceStatus !== "healthy");
    }
    if (kind === "event") {
      const e = seedEvents.find((x) => x.id === id);
      return (e?.ranking?.potentialImpact ?? 0) >= 1;
    }
    return false;
  }

  // Classification-driven views resolve through whichever event(s) an object touches.
  const wanted =
    view === "advisories" ? ["Advisory"] :
    view === "incidents" ? ["Incident", "Degradation"] :
    ["Maintenance"];

  const eventMatches = (evId: string) => {
    const e = seedEvents.find((x) => x.id === evId);
    return !!e && wanted.includes(e.kind);
  };

  if (kind === "event") return eventMatches(id);
  for (const k of relatedKeys(key)) {
    if (kindOf(k) === "event" && eventMatches(idOf(k))) return true;
  }
  return false;
}

function matchesFacets(key: string, f: FilterState): boolean {
  const kind = kindOf(key);
  const id = idOf(key);
  const own = closure(key);

  if (f.deployment !== "all" && !own.has(`deployment:${f.deployment}`)) return false;
  if (f.region !== "all" && !own.has(`region:${f.region}`)) return false;

  if (f.environment !== "all") {
    const envDeployments = deployments.filter((d) => d.environment === f.environment).map((d) => d.id);
    const hit = envDeployments.some((dId) => own.has(`deployment:${dId}`));
    if (!hit) return false;
  }

  if (kind === "event") {
    const age = EVENT_AGE_HOURS[id];
    if (age !== undefined && age > RANGE_HOURS[f.timeRange]) return false;
  }
  return true;
}

/* -------------------------------- provider -------------------------------- */

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(load);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); } catch { /* ignore */ }
  }, [filters]);

  const set = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const emphasisFor = useCallback(
    (key: string): Emphasis =>
      matchesView(key, filters.view) && matchesFacets(key, filters) ? "match" : "subordinate",
    [filters],
  );

  const activeCount =
    (filters.view !== "all" ? 1 : 0) +
    (filters.deployment !== "all" ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    (filters.environment !== "all" ? 1 : 0) +
    (filters.timeRange !== "24h" ? 1 : 0);

  const value = useMemo<FilterApi>(
    () => ({
      filters, set, reset,
      isDefault: activeCount === 0,
      activeCount,
      emphasisFor,
      viewHint: VIEW_HINTS[filters.view],
    }),
    [filters, set, reset, activeCount, emphasisFor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters() {
  return useContext(Ctx);
}

/** Subordinated objects stay readable — they are context, not noise. */
export function emphasisClass(e: Emphasis) {
  return e === "subordinate" ? "opacity-55 saturate-[0.55]" : "";
}

/**
 * Single hook every correlatable object uses: cross-highlight handlers plus
 * the current filter emphasis, resolved into one className.
 */
export function useObjectHighlight(key?: string) {
  const { bind, state, className: corrClass } = useCorrelation(key);
  const { emphasisFor } = useFilters();
  const emphasis: Emphasis = key ? emphasisFor(key) : "match";
  // A hovered/related object is never dimmed by the filter at the same time.
  const filterClass = state === "idle" && emphasis === "subordinate" ? emphasisClass(emphasis) : "";
  return { bind, state, emphasis, className: cn(corrClass, filterClass) };
}
