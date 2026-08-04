/**
 * Stage 3.5.4.3 — Remediation Workspace provider.
 *
 * Local, route-scoped state for the Simulation and Change Planning workspace.
 *
 * Guarantees carried over from the engines this provider drives:
 *  - Read-only. Nothing here mutates the canonical graph, the registries, the
 *    manifests, the routes or any repository file. No patch is ever applied.
 *  - Deterministic. Identical selections produce identical simulations and
 *    identical plans; there is no clock, randomness, network or LLM involved.
 *  - Engines execute only in response to an explicit user action, never during
 *    render, and always off the commit path so the UI can paint a busy state.
 *
 * The provider deliberately does NOT create its own graph analysis: it reuses
 * the process-wide simulation engine (which memoizes its baseline snapshot) and
 * builds a change-plan engine on top of that same instance.
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
import { useSearchParams } from "react-router-dom";
import {
  getSimulationEngine,
  type AlternativeComparison,
  type ChangeProposal,
  type ParameterBinding,
  type ProposalConflict,
  type SimulationResult,
  type ValidationResult,
} from "@/modules/graph/simulation/index";
import {
  createChangePlanEngine,
  type ChangePlan,
  type DriftReport,
  type GraphChangePlanEngine,
} from "@/modules/graph/change-plan/index";
import type { IntelligenceRecommendation } from "@/modules/graph/intelligence/index";
import {
  resolveRecommendationSelection,
  type RecommendationSelection,
} from "./remediation/recommendationSelection";

/** URL contract for selecting the recommendation under remediation. */
export const RECOMMENDATION_PARAM = "recommendation";


/* -------------------------------------------------------------- workflow */

export const REMEDIATION_STAGES = [
  "recommendation",
  "proposal",
  "simulation",
  "alternatives",
  "change-plan",
] as const;

export type RemediationStage = (typeof REMEDIATION_STAGES)[number];

export const REMEDIATION_STAGE_LABELS: Readonly<Record<RemediationStage, string>> = {
  recommendation: "1. Recommendation",
  proposal: "2. Proposal",
  simulation: "3. Simulation",
  alternatives: "4. Alternatives",
  "change-plan": "5. Change plan",
};

export type StageState = "locked" | "available" | "complete";

/* ------------------------------------------------------------ engine box */

interface Engines {
  simulation: ReturnType<typeof getSimulationEngine>;
  plan: GraphChangePlanEngine;
}

let engineCache: Engines | null = null;

/** Lazily builds the engine pair once per browser session. */
export function getRemediationEngines(): Engines {
  if (engineCache) return engineCache;
  const simulation = getSimulationEngine();
  engineCache = {
    simulation,
    // The plan engine defaults to the unpopulated capability graph, whose hash
    // differs from the populated graph every other Capability Intelligence
    // surface reports. Bind it explicitly to the simulation engine's own graph
    // so plan lineage, drift detection and the displayed canonical hash all
    // refer to the same baseline.
    plan: createChangePlanEngine({
      simulationEngine: simulation,
      graph: simulation.canonicalGraph,
    }),
  };
  return engineCache;
}

/** Test hook: drops the memoized engine pair. */
export function __resetRemediationEngines(): void {
  engineCache = null;
}

/* ------------------------------------------------------------ value type */

export interface RemediationWorkspaceValue {
  /** Recommendation currently under remediation, or null. */
  recommendation: IntelligenceRecommendation | null;
  /** Proposals generated for that recommendation, deterministically ordered. */
  proposals: readonly ChangeProposal[];
  /** Proposal the operator is working with, after any parameter bindings. */
  proposal: ChangeProposal | null;
  /** Bindings supplied for the selected proposal. */
  bindings: ParameterBinding;
  /** Required parameters that still have no value. */
  unresolvedParameters: readonly string[];
  /** Static validation of the bound proposal. Recomputed on every binding. */
  validation: ValidationResult | null;
  /** Conflicts detected across the generated proposal set. */
  conflicts: readonly ProposalConflict[];
  /** Sibling proposals that are mutually exclusive with the selection. */
  alternatives: readonly ChangeProposal[];
  /** Result of the last executed simulation, if any. */
  simulation: SimulationResult | null;
  /** Result of the last executed alternative comparison, if any. */
  comparison: AlternativeComparison | null;
  /** Planned change specification derived from the simulation, if built. */
  plan: ChangePlan | null;
  /** Drift of the built plan against the current canonical graph. */
  drift: DriftReport | null;
  /**
   * True when the inputs changed after a result was produced. The result is
   * kept on screen — the engine is never rerun implicitly — but the operator
   * is told it no longer describes the current selection.
   */
  simulationStale: boolean;
  comparisonStale: boolean;
  planStale: boolean;

  busy: null | "proposals" | "simulation" | "alternatives" | "plan";
  error: unknown;
  /** The action that failed, so the UI can offer a scoped retry. */
  failedAction: null | "proposals" | "simulation" | "alternatives" | "plan";
  retry: () => void;
  /** Canonical graph hash observed by the engines. Never changes. */
  canonicalGraphHash: string;
  /** How the current recommendation was chosen. */
  selectionSource: RecommendationSelection["source"];
  /** Set when the URL named a recommendation that does not exist. */
  unknownRecommendationParam: string | null;
  /** Per-stage availability used to drive the progressive disclosure UI. */
  stageStates: Readonly<Record<RemediationStage, StageState>>;
  /** Furthest stage the operator may open. */
  activeStage: RemediationStage;
  /** Politely announced workspace events (simulation complete, failures…). */
  announcement: string;

  selectRecommendation: (recommendation: IntelligenceRecommendation | null) => void;
  selectProposal: (proposalId: string) => void;
  setBinding: (name: string, value: string) => void;
  clearBindings: () => void;
  runSimulation: () => void;
  runAlternativeComparison: () => void;
  buildChangePlan: () => void;
  reset: () => void;
}

const Ctx = createContext<RemediationWorkspaceValue | null>(null);

/* -------------------------------------------------------------- provider */

export function RemediationWorkspaceProvider({
  recommendations = [],
  children,
}: {
  /** Canonical recommendation set from the Capability Intelligence provider. */
  recommendations?: readonly IntelligenceRecommendation[];
  children: ReactNode;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get(RECOMMENDATION_PARAM);

  // The selection is derived from the URL, never mirrored into state, so
  // refresh, Back and Forward all resolve through exactly the same policy.
  const selection = useMemo(
    () => resolveRecommendationSelection(recommendations, rawParam),
    [recommendations, rawParam],
  );
  const recommendation = selection.recommendation;
  const unknownRecommendationParam =
    selection.source === "parameter" ? null : selection.unknownParameter;

  const [proposals, setProposals] = useState<readonly ChangeProposal[]>([]);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [bindings, setBindings] = useState<ParameterBinding>({});
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<AlternativeComparison | null>(null);
  const [plan, setPlan] = useState<ChangePlan | null>(null);
  const [drift, setDrift] = useState<DriftReport | null>(null);
  const [stale, setStale] = useState({ simulation: false, comparison: false, plan: false });
  const [conflicts, setConflicts] = useState<readonly ProposalConflict[]>([]);
  const [busy, setBusy] = useState<RemediationWorkspaceValue["busy"]>(null);
  const [error, setError] = useState<unknown>(null);
  const [failedAction, setFailedAction] =
    useState<RemediationWorkspaceValue["failedAction"]>(null);
  const [announcement, setAnnouncement] = useState("");


  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Runs an engine call off the commit path so the busy state paints first. */
  const defer = useCallback(
    (kind: NonNullable<RemediationWorkspaceValue["busy"]>, work: () => void) => {
      setBusy(kind);
      setError(null);
      setFailedAction(null);
      const handle = setTimeout(() => {
        try {
          work();
        } catch (err) {
          if (!mounted.current) return;
          setError(err);
          setFailedAction(kind);
          setAnnouncement(`${kind} failed. ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
          if (mounted.current) setBusy(null);
        }
      }, 0);
      return () => clearTimeout(handle);
    },
    [],
  );


  const canonicalGraphHash = useMemo(() => getRemediationEngines().simulation.canonicalGraphHash, []);

  const selected = useMemo(
    () => proposals.find((p) => p.id === proposalId) ?? null,
    [proposals, proposalId],
  );

  /** The selection with the operator's parameter bindings applied. */
  const bound = useMemo(() => {
    if (!selected) return null;
    if (Object.keys(bindings).length === 0) return selected;
    try {
      return getRemediationEngines().simulation.bind(selected, bindings);
    } catch {
      return selected;
    }
  }, [selected, bindings]);

  const validation = useMemo(() => {
    if (!bound) return null;
    try {
      return getRemediationEngines().simulation.validate(bound);
    } catch {
      return null;
    }
  }, [bound]);

  const unresolvedParameters = useMemo(
    () => (bound ? getRemediationEngines().simulation.unresolvedParameters(bound) : []),
    [bound],
  );

  const alternatives = useMemo(() => {
    if (!selected) return [];
    const ids = new Set(selected.alternativeProposalIds);
    return proposals.filter((p) => p.id === selected.id || ids.has(p.id));
  }, [proposals, selected]);

  /* -------------------------------------------------------------- actions */

  /** Drops every downstream result. Used when the subject itself changes. */
  const resetDownstream = useCallback(() => {
    setSimulation(null);
    setComparison(null);
    setPlan(null);
    setDrift(null);
    setStale({ simulation: false, comparison: false, plan: false });
  }, []);

  /**
   * Marks existing results as no longer describing the current inputs. The
   * engines are never rerun implicitly — the operator decides when to spend
   * the work again.
   */
  const markStale = useCallback(() => {
    setStale((prev) => ({
      simulation: prev.simulation || simulation !== null,
      comparison: prev.comparison || comparison !== null,
      plan: prev.plan || plan !== null,
    }));
  }, [simulation, comparison, plan]);

  /** Generates the proposals for a recommendation. Explicitly invoked only. */
  const generateProposals = useCallback(
    (subject: IntelligenceRecommendation) => {
      defer("proposals", () => {
        const engine = getRemediationEngines().simulation;
        const generated = engine.generateProposalFromRecommendation(subject);
        if (!mounted.current) return;
        setProposals(generated);
        setConflicts(engine.inspectConflicts(generated));
        // Auto-select when the recommendation yields exactly one proposal:
        // there is no decision to make and the operator would only click once.
        if (generated.length === 1) setProposalId(generated[0].id);
      });
    },
    [defer],
  );

  /**
   * Selecting a recommendation writes the canonical id to the URL. The
   * selection itself is derived from the URL, so refresh, Back and Forward
   * all reproduce the same workspace.
   */
  const selectRecommendation = useCallback(
    (next: IntelligenceRecommendation | null) => {
      setSearchParams(
        (params) => {
          const updated = new URLSearchParams(params);
          if (next) updated.set(RECOMMENDATION_PARAM, next.id);
          else updated.delete(RECOMMENDATION_PARAM);
          return updated;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  // The recommendation is URL-derived, so this effect fires exactly once per
  // distinct selection (deep link, picker click, Back/Forward), never on an
  // ordinary re-render. Every piece of dependent local state is cleared first.
  const generatedFor = useRef<string | null>(null);
  useEffect(() => {
    const id = recommendation?.id ?? null;
    if (generatedFor.current === id) return;
    generatedFor.current = id;
    setProposals([]);
    setProposalId(null);
    setBindings({});
    setConflicts([]);
    setError(null);
    setFailedAction(null);
    resetDownstream();
    if (recommendation) generateProposals(recommendation);
  }, [recommendation, generateProposals, resetDownstream]);

  const selectProposal = useCallback(
    (id: string) => {
      setProposalId(id);
      setBindings({});
      resetDownstream();
    },
    [resetDownstream],
  );

  const setBinding = useCallback(
    (name: string, value: string) => {
      setBindings((prev) => {
        if (!value) {
          const { [name]: _dropped, ...rest } = prev;
          return rest;
        }
        return { ...prev, [name]: value };
      });
      markStale();
    },
    [markStale],
  );

  const clearBindings = useCallback(() => {
    setBindings({});
    markStale();
  }, [markStale]);

  const runSimulation = useCallback(() => {
    if (!selected) return;
    defer("simulation", () => {
      const engine = getRemediationEngines().simulation;
      const result = engine.simulateProposal(selected, { parameters: { [selected.id]: bindings } });
      if (!mounted.current) return;
      setSimulation(result);
      setPlan(null);
      setDrift(null);
      setStale({ simulation: false, comparison: false, plan: false });
      setAnnouncement(
        `Simulation complete. Band ${result.score.band}, score ${result.score.score}, ` +
          `${result.regressions.length} regression${result.regressions.length === 1 ? "" : "s"}.`,
      );
    });
  }, [defer, selected, bindings]);

  const runAlternativeComparison = useCallback(() => {
    if (alternatives.length === 0) return;
    defer("alternatives", () => {
      const engine = getRemediationEngines().simulation;
      const result = engine.compareAlternatives(alternatives, {
        parameters: selected ? { [selected.id]: bindings } : {},
      });
      if (!mounted.current) return;
      setComparison(result);
      setStale((prev) => ({ ...prev, comparison: false }));
      setAnnouncement(`Alternative comparison complete. Verdict: ${result.verdict}.`);
    });
  }, [defer, alternatives, selected, bindings]);

  const buildChangePlan = useCallback(() => {
    if (!simulation) return;
    defer("plan", () => {
      const engines = getRemediationEngines();
      const built = engines.plan.buildPlanFromSimulation(simulation);
      const driftReport = engines.plan.detectDrift(built);
      if (!mounted.current) return;
      setPlan(built);
      setDrift(driftReport);
      setStale((prev) => ({ ...prev, plan: false }));
      setAnnouncement(
        `Change plan preview generated. Status ${built.status}, ${built.steps.length} steps, ` +
          `${built.blockers.length} blocker${built.blockers.length === 1 ? "" : "s"}.`,
      );
    });
  }, [defer, simulation]);

  /** Re-runs the action that failed, without changing any selection. */
  const retry = useCallback(() => {
    switch (failedAction) {
      case "proposals":
        if (recommendation) generateProposals(recommendation);
        return;
      case "simulation":
        runSimulation();
        return;
      case "alternatives":
        runAlternativeComparison();
        return;
      case "plan":
        buildChangePlan();
        return;
      default:
        setError(null);
    }
  }, [
    failedAction,
    recommendation,
    generateProposals,
    runSimulation,
    runAlternativeComparison,
    buildChangePlan,
  ]);

  const reset = useCallback(() => {
    setProposals([]);
    setProposalId(null);
    setBindings({});
    setConflicts([]);
    setError(null);
    setFailedAction(null);
    setAnnouncement("");
    resetDownstream();
    generatedFor.current = null;
    selectRecommendation(null);
  }, [resetDownstream, selectRecommendation]);

  /* -------------------------------------------------------- stage gating */

  const stageStates = useMemo<Readonly<Record<RemediationStage, StageState>>>(() => {
    const hasRecommendation = recommendation !== null;
    const hasProposal = selected !== null;
    const hasSimulation = simulation !== null && !stale.simulation;
    return {
      recommendation: hasRecommendation ? "complete" : "available",
      proposal: !hasRecommendation ? "locked" : hasProposal ? "complete" : "available",
      simulation: !hasProposal ? "locked" : hasSimulation ? "complete" : "available",
      alternatives: !hasProposal ? "locked" : comparison ? "complete" : "available",
      "change-plan": !hasSimulation ? "locked" : plan ? "complete" : "available",
    };
  }, [recommendation, selected, simulation, comparison, plan, stale.simulation]);


  const activeStage = useMemo<RemediationStage>(() => {
    if (plan) return "change-plan";
    if (simulation) return "change-plan";
    if (selected) return "simulation";
    if (recommendation) return "proposal";
    return "recommendation";
  }, [recommendation, selected, simulation, plan]);

  const value = useMemo<RemediationWorkspaceValue>(
    () => ({
      recommendation,
      proposals,
      proposal: bound,
      bindings,
      unresolvedParameters,
      validation,
      conflicts,
      alternatives,
      simulation,
      comparison,
      plan,
      drift,
      busy,
      error,
      canonicalGraphHash,
      stageStates,
      activeStage,
      selectRecommendation,
      selectProposal,
      setBinding,
      clearBindings,
      runSimulation,
      runAlternativeComparison,
      buildChangePlan,
      reset,
    }),
    [
      recommendation,
      proposals,
      bound,
      bindings,
      unresolvedParameters,
      validation,
      conflicts,
      alternatives,
      simulation,
      comparison,
      plan,
      drift,
      busy,
      error,
      canonicalGraphHash,
      stageStates,
      activeStage,
      selectRecommendation,
      selectProposal,
      setBinding,
      clearBindings,
      runSimulation,
      runAlternativeComparison,
      buildChangePlan,
      reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRemediationWorkspace(): RemediationWorkspaceValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useRemediationWorkspace must be used inside <RemediationWorkspaceProvider>");
  }
  return ctx;
}
