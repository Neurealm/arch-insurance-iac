/**
 * Stage 3.5.4.1 — Capability Intelligence provider.
 *
 * Loads the populated capability graph and runs the Stage 3.5.3.3 intelligence
 * engine exactly once per browser session, memoizes the result at module scope,
 * and exposes typed read-only hooks. No component ever executes an engine.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getQueryEngine, type GraphQueryEngine, type QueryGraphMetadata } from "@/modules/graph/query/index";
import { getIntelligenceEngine } from "@/modules/graph/intelligence/index";
import type { IntelligenceResult } from "@/modules/graph/intelligence/index";
import { graphStatistics } from "@/modules/graph/statistics";
import type { GraphStatistics } from "@/modules/graph/populationTypes";

export interface CapabilityIntelligenceSnapshot {
  queryEngine: GraphQueryEngine;
  intelligence: IntelligenceResult;
  statistics: GraphStatistics;
  graph: QueryGraphMetadata;
  /** Milliseconds the one-off analysis took. */
  analysisDurationMs: number;
  /** Deterministic marker of when this browser session computed the snapshot. */
  computedAt: string;
}

export interface CapabilityIntelligenceValue {
  loading: boolean;
  error: unknown;
  snapshot: CapabilityIntelligenceSnapshot | null;
  /** Convenience accessors — null while loading or on error. */
  queryEngine: GraphQueryEngine | null;
  intelligence: IntelligenceResult | null;
  statistics: GraphStatistics | null;
  graph: QueryGraphMetadata | null;
  graphHash: string | null;
  reload: () => void;
}

/* ---------------------------------------------------------------- caching */

let snapshotCache: CapabilityIntelligenceSnapshot | null = null;
let snapshotError: unknown = null;
/** Counts how many times the engines actually executed — asserted in tests. */
let computeCount = 0;

const nowMs = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now());

/** Executes the engines at most once per session. Synchronous and deterministic. */
export function computeCapabilityIntelligence(): CapabilityIntelligenceSnapshot {
  if (snapshotCache) return snapshotCache;
  const started = nowMs();
  const queryEngine = getQueryEngine();
  const intelligence = getIntelligenceEngine().analyzeGraph();
  const statistics = graphStatistics();
  computeCount += 1;
  snapshotCache = {
    queryEngine,
    intelligence,
    statistics,
    graph: intelligence.graph,
    analysisDurationMs: Math.round(nowMs() - started),
    computedAt: new Date().toISOString(),
  };
  return snapshotCache;
}

/** Test hook: clears the memoized snapshot and the compute counter. */
export function __resetCapabilityIntelligenceCache(): void {
  snapshotCache = null;
  snapshotError = null;
  computeCount = 0;
}

/** Test hook: number of times the engines executed this session. */
export function __capabilityIntelligenceComputeCount(): number {
  return computeCount;
}

/* --------------------------------------------------------------- context */

const Ctx = createContext<CapabilityIntelligenceValue | null>(null);

export function CapabilityIntelligenceProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<CapabilityIntelligenceSnapshot | null>(() => snapshotCache);
  const [error, setError] = useState<unknown>(() => snapshotError);
  const [loading, setLoading] = useState(() => !snapshotCache && !snapshotError);
  const [nonce, setNonce] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (snapshotCache) {
      setSnapshot(snapshotCache);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Defer off the render/commit path so the loading state paints first and
    // the analysis never blocks the initial route transition.
    const handle = setTimeout(() => {
      try {
        const next = computeCapabilityIntelligence();
        snapshotError = null;
        if (!mounted.current) return;
        setSnapshot(next);
        setError(null);
      } catch (err) {
        snapshotError = err;
        if (!mounted.current) return;
        setError(err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    }, 0);
    return () => clearTimeout(handle);
  }, [nonce]);

  const reload = useCallback(() => {
    __resetCapabilityIntelligenceCache();
    setSnapshot(null);
    setError(null);
    setNonce((n) => n + 1);
  }, []);

  const value = useMemo<CapabilityIntelligenceValue>(
    () => ({
      loading,
      error,
      snapshot,
      queryEngine: snapshot?.queryEngine ?? null,
      intelligence: snapshot?.intelligence ?? null,
      statistics: snapshot?.statistics ?? null,
      graph: snapshot?.graph ?? null,
      graphHash: snapshot?.graph.contentHash ?? null,
      reload,
    }),
    [loading, error, snapshot, reload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCapabilityIntelligence(): CapabilityIntelligenceValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCapabilityIntelligence must be used inside <CapabilityIntelligenceProvider>");
  }
  return ctx;
}

/** Convenience hook for screens that need the query engine only. */
export function useGraphQueryEngine(): GraphQueryEngine | null {
  return useCapabilityIntelligence().queryEngine;
}
