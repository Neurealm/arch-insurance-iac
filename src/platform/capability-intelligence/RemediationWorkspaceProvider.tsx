/**
 * Stage 3.5.4.3 / 3.5.4.3.1 — Remediation Workspace provider.
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
 * Stage 3.5.4.3.1 closes the last two gaps in that third guarantee: proposal
 * generation and proposal validation are now explicitly invoked, and every
 * engine-invoking action re-checks its own eligibility gate before it runs, so
 * a stale render or a programmatic call cannot reach an engine it is not
 * allowed to.
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
import {
  BLOCKERS_CLEARED_ANNOUNCEMENT,
  evaluateAlternativeEligibility,
  evaluateChangePlanEligibility,
  evaluateComparisonEligibility,
  evaluateSimulationEligibility,
  summarizeWorkflowBlocker,
  MAX_COMPARISON_ALTERNATIVES,
  type AlternativeEligibility,
  type EligibilityVerdict,
} from "./remediation/eligibility";

/** URL contract for selecting the recommendation under remediation. */
export const RECOMMENDATION_PARAM = "recommendation";

/* -------------------------------------------------------------- workflow */

export const REMEDIATION_STAGES = [
  "recommendation",
  "proposals",
  "parameters",
  "validation",
  "simulation",
  "alternatives",
  "change-plan",
] as const;

export type RemediationStage = (typeof REMEDIATION_STAGES)[number];

export const REMEDIATION_STAGE_LABELS: Readonly<Record<RemediationStage, string>> = {
  recommendation: "1. Recommendation",
  proposals: "2. Generate proposals",
  parameters: "3. Resolve parameters",
  validation: "4. Validate proposal",
  simulation: "5. Run simulation",
  alternatives: "6. Compare outcomes",
  "change-plan": "7. Review change plan",
};

export type StageState = "locked" | "available" | "blocked" | "stale" | "complete";

/** Lifecycle of the proposal set for the selected recommendation. */
export type ProposalStatus =
  | "not-generated"
  | "generating"
  | "generated"
  | "empty"
  | "failed";

/** Lifecycle of the validation of the selected proposal. */
export type ValidationStatus =
  | "not-validated"
  | "validating"
  | "validated"
  | "stale"
  | "failed";

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

/**
 * Test hook: installs a stand-in engine pair so gating, failure and retry paths
 * can be driven without the real 1,291-node graph. Never called by the app.
 */
export function __setRemediationEngines(engines: Engines): void {
  engineCache = engines;
}

/* ------------------------------------------------------------ value type */

export interface RemediationWorkspaceValue {
  /** Recommendation currently under remediation, or null. */
  recommendation: IntelligenceRecommendation | null;
  /** Proposals generated for that recommendation, deterministically ordered. */
  proposals: readonly ChangeProposal[];
  /** Lifecycle of the proposal set. Generation is never automatic. */
  proposalStatus: ProposalStatus;
  /** Proposal the operator is working with, after any parameter bindings. */
  proposal: ChangeProposal | null;
  /** Bindings supplied for the selected proposal. */
  bindings: ParameterBinding;
  /** Required parameters that still have no value. */
  unresolvedParameters: readonly string[];
  /** Engine validation of the bound proposal. Explicitly invoked only. */
  validation: ValidationResult | null;
  /** Lifecycle of that validation, including staleness. */
  validationStatus: ValidationStatus;
  /** Conflicts detected across the generated proposal set. */
  conflicts: readonly ProposalConflict[];
  /** Sibling proposals that are mutually exclusive with the selection. */
  alternatives: readonly ChangeProposal[];
  /** Per-alternative comparison eligibility, once assessed. */
  alternativeEligibility: readonly AlternativeEligibility[];
  /** True once the operator has explicitly assessed the alternatives. */
  alternativesAssessed: boolean;
  /** Alternatives ticked for comparison (2–4). */
  selectedAlternativeIds: readonly string[];
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

  /** Engine-derived gates. Consulted by the UI and re-checked by the handler. */
  simulationEligibility: EligibilityVerdict;
  comparisonEligibility: EligibilityVerdict;
  planEligibility: EligibilityVerdict;

  busy: null | "proposals" | "validation" | "simulation" | "alternatives" | "plan";
  error: unknown;
  /** The action that failed, so the UI can offer a scoped retry. */
  failedAction: null | "proposals" | "validation" | "simulation" | "alternatives" | "plan";
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
  /** Politely announced completions (simulation complete, plan generated…). */
  announcement: string;
  /** Assertively announced engine failures. Never carries ordinary status. */
  errorAnnouncement: string;
  /** Politely announced blocker summary. Never enumerates every blocker. */
  blockerAnnouncement: string;

  selectRecommendation: (recommendation: IntelligenceRecommendation | null) => void;
  generateProposals: () => void;
  selectProposal: (proposalId: string) => void;
  setBinding: (name: string, value: string) => void;
  clearBindings: () => void;
  validateProposal: () => void;
  assessAlternatives: () => void;
  toggleAlternative: (proposalId: string) => void;
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
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus>("not-generated");
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [bindings, setBindings] = useState<ParameterBinding>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validationStale, setValidationStale] = useState(false);
  const [validationFailed, setValidationFailed] = useState(false);
  const [alternativeValidations, setAlternativeValidations] = useState<
    Readonly<Record<string, ValidationResult>>
  >({});
  const [alternativesAssessed, setAlternativesAssessed] = useState(false);
  const [selectedAlternativeIds, setSelectedAlternativeIds] = useState<readonly string[]>([]);
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
  const [errorAnnouncement, setErrorAnnouncement] = useState("");
  const [blockerAnnouncement, setBlockerAnnouncement] = useState("");

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * Runs an engine call off the commit path so the busy state paints first.
   * Duplicate concurrent invocation is impossible: `defer` refuses while any
   * other engine call is in flight.
   */
  const inFlight = useRef(false);
  const defer = useCallback(
    (kind: NonNullable<RemediationWorkspaceValue["busy"]>, work: () => void) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(kind);
      setError(null);
      setFailedAction(null);
      setErrorAnnouncement("");
      const handle = setTimeout(() => {
        try {
          work();
        } catch (err) {
          if (!mounted.current) return;
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(err);
          setFailedAction(kind);
          setErrorAnnouncement(`${kind} failed. ${message}`);
          if (kind === "proposals") setProposalStatus("failed");
          if (kind === "validation") setValidationFailed(true);
        } finally {
          inFlight.current = false;
          if (mounted.current) setBusy(null);
        }
      }, 0);
      return () => clearTimeout(handle);
    },
    [],
  );

  const canonicalGraphHash = useMemo(
    () => getRemediationEngines().simulation.canonicalGraphHash,
    [],
  );

  const selected = useMemo(
    () => proposals.find((p) => p.id === proposalId) ?? null,
    [proposals, proposalId],
  );

  /**
   * The selection with the operator's parameter bindings applied.
   *
   * `bind` and `unresolvedParameters` are pure, cheap proposal transforms —
   * they perform no graph analysis and produce no verdict — so they may run
   * during render. Validation and generation, which do analyse the graph and
   * do produce verdicts, are explicit actions below.
   */
  const bound = useMemo(() => {
    if (!selected) return null;
    if (Object.keys(bindings).length === 0) return selected;
    try {
      return getRemediationEngines().simulation.bind(selected, bindings);
    } catch {
      return selected;
    }
  }, [selected, bindings]);

  const unresolvedParameters = useMemo(
    () => (bound ? getRemediationEngines().simulation.unresolvedParameters(bound) : []),
    [bound],
  );

  const alternatives = useMemo(() => {
    if (!selected) return [];
    const ids = new Set(selected.alternativeProposalIds);
    return proposals.filter((p) => p.id === selected.id || ids.has(p.id));
  }, [proposals, selected]);

  /* ----------------------------------------------------------- lifecycles */

  const validationStatus = useMemo<ValidationStatus>(() => {
    if (busy === "validation") return "validating";
    if (validationFailed) return "failed";
    if (!validation) return "not-validated";
    if (validationStale) return "stale";
    return "validated";
  }, [busy, validation, validationStale, validationFailed]);

  const alternativeEligibility = useMemo(
    () =>
      alternativesAssessed
        ? evaluateAlternativeEligibility(
            alternatives,
            alternativeValidations,
            conflicts,
            (proposal) => getRemediationEngines().simulation.unresolvedParameters(proposal),
          )
        : [],
    [alternatives, alternativeValidations, alternativesAssessed, conflicts],
  );

  /* ---------------------------------------------------------------- gates */

  const simulationEligibility = useMemo(
    () =>
      evaluateSimulationEligibility({
        proposal: bound,
        validation,
        validationStale,
        unresolvedParameters,
        conflicts,
        busy: busy !== null,
      }),
    [bound, validation, validationStale, unresolvedParameters, conflicts, busy],
  );

  const comparisonEligibility = useMemo(
    () =>
      evaluateComparisonEligibility({
        selectedIds: selectedAlternativeIds,
        eligibility: alternativeEligibility,
        busy: busy !== null,
      }),
    [selectedAlternativeIds, alternativeEligibility, busy],
  );

  const planEligibility = useMemo(
    () =>
      evaluateChangePlanEligibility({
        simulation,
        simulationStale: stale.simulation,
        proposalEligibility: simulationEligibility,
        canonicalGraphHash,
        busy: busy !== null,
      }),
    [simulation, stale.simulation, simulationEligibility, canonicalGraphHash, busy],
  );

  /* -------------------------------------------------------------- actions */

  /** Drops every downstream result. Used when the subject itself changes. */
  const resetDownstream = useCallback(() => {
    setSimulation(null);
    setComparison(null);
    setPlan(null);
    setDrift(null);
    setStale({ simulation: false, comparison: false, plan: false });
    setAlternativeValidations({});
    setAlternativesAssessed(false);
    setSelectedAlternativeIds([]);
  }, []);

  /**
   * Marks existing results as no longer describing the current inputs. The
   * engines are never rerun implicitly — the operator decides when to spend
   * the work again.
   */
  const markStale = useCallback(() => {
    setValidationStale((prev) => prev || validation !== null);
    setAlternativesAssessed(false);
    setStale((prev) => ({
      simulation: prev.simulation || simulation !== null,
      comparison: prev.comparison || comparison !== null,
      plan: prev.plan || plan !== null,
    }));
  }, [validation, simulation, comparison, plan]);

  /** Generates the proposals for the selected recommendation. Explicit only. */
  const generateProposals = useCallback(() => {
    if (!recommendation) return;
    setProposalStatus("generating");
    defer("proposals", () => {
      const engine = getRemediationEngines().simulation;
      const generated = engine.generateProposalFromRecommendation(recommendation);
      const detected = engine.inspectConflicts(generated);
      if (!mounted.current) return;
      setProposals(generated);
      setConflicts(detected);
      setProposalStatus(generated.length === 0 ? "empty" : "generated");
      // Auto-select when the recommendation yields exactly one proposal:
      // there is no decision to make and the operator would only click once.
      // Selecting is not validating — the validation gate still applies.
      if (generated.length === 1) setProposalId(generated[0].id);
      setAnnouncement(
        generated.length === 0
          ? "Proposal generation complete. The remediation policy produced no proposal for this recommendation."
          : `Proposal generation complete. ${generated.length} proposal${
              generated.length === 1 ? "" : "s"
            } generated, ${detected.length} conflict${detected.length === 1 ? "" : "s"} detected.`,
      );
    });
  }, [defer, recommendation]);

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

  const clearValidation = useCallback(() => {
    setValidation(null);
    setValidationStale(false);
    setValidationFailed(false);
  }, []);

  // The recommendation is URL-derived, so this effect fires exactly once per
  // distinct selection (deep link, picker click, Back/Forward), never on an
  // ordinary re-render. It CLEARS dependent state and returns the workflow to
  // the generation stage. It deliberately does not generate anything.
  const clearedFor = useRef<string | null>(null);
  useEffect(() => {
    const id = recommendation?.id ?? null;
    if (clearedFor.current === id) return;
    clearedFor.current = id;
    setProposals([]);
    setProposalStatus("not-generated");
    setProposalId(null);
    setBindings({});
    setConflicts([]);
    setError(null);
    setFailedAction(null);
    setErrorAnnouncement("");
    clearValidation();
    resetDownstream();
  }, [recommendation, resetDownstream, clearValidation]);

  const selectProposal = useCallback(
    (id: string) => {
      setProposalId(id);
      // Bindings are per proposal: the engine's parameter definitions differ
      // between variants, so a value bound for one is not shared with another.
      setBindings({});
      clearValidation();
      resetDownstream();
    },
    [resetDownstream, clearValidation],
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

  /** Explicitly validates the bound proposal. Never invoked automatically. */
  const validateProposal = useCallback(() => {
    if (!bound) return;
    defer("validation", () => {
      const engine = getRemediationEngines().simulation;
      const result = engine.validate(bound);
      if (!mounted.current) return;
      setValidation(result);
      setValidationStale(false);
      setValidationFailed(false);
      setAnnouncement(
        `Validation complete. Outcome ${result.outcome}. ${
          result.executable
            ? "The engine marks this proposal executable."
            : "The engine does not mark this proposal executable, so it cannot be simulated."
        }`,
      );
    });
  }, [defer, bound]);

  /** Explicitly validates every alternative so comparison can be gated. */
  const assessAlternatives = useCallback(() => {
    if (alternatives.length === 0) return;
    defer("validation", () => {
      const engine = getRemediationEngines().simulation;
      const assessed: Record<string, ValidationResult> = {};
      for (const alternative of alternatives) {
        assessed[alternative.id] = engine.validate(alternative);
      }
      if (!mounted.current) return;
      setAlternativeValidations(assessed);
      setAlternativesAssessed(true);
      const eligibleIds = alternatives
        .filter((a) => assessed[a.id]?.executable)
        .map((a) => a.id)
        .slice(0, MAX_COMPARISON_ALTERNATIVES);
      setSelectedAlternativeIds(eligibleIds);
      setAnnouncement(
        `Alternative assessment complete. ${eligibleIds.length} of ${alternatives.length} alternatives are comparable.`,
      );
    });
  }, [defer, alternatives]);

  const toggleAlternative = useCallback((id: string) => {
    setSelectedAlternativeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setStale((prev) => ({ ...prev, comparison: prev.comparison || true }));
  }, []);

  /* --------------------------------------------- gated engine invocations */

  const runSimulation = useCallback(() => {
    // Re-checked here, independently of the button's disabled state, so a
    // stale render or a direct programmatic call cannot bypass the gate.
    const gate = evaluateSimulationEligibility({
      proposal: bound,
      validation,
      validationStale,
      unresolvedParameters,
      conflicts,
      busy: busy !== null,
    });
    if (!gate.eligible) {
      setBlockerAnnouncement(`Simulation blocked. ${gate.reason}`);
      return;
    }
    const proposal = bound;
    if (!proposal) return;
    defer("simulation", () => {
      const engine = getRemediationEngines().simulation;
      const result = engine.simulateProposal(proposal, {
        parameters: { [proposal.id]: bindings },
      });
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
  }, [defer, bound, bindings, validation, validationStale, unresolvedParameters, conflicts, busy]);

  const runAlternativeComparison = useCallback(() => {
    const gate = evaluateComparisonEligibility({
      selectedIds: selectedAlternativeIds,
      eligibility: alternativeEligibility,
      busy: busy !== null,
    });
    if (!gate.eligible) {
      setBlockerAnnouncement(`Alternative comparison blocked. ${gate.reason}`);
      return;
    }
    const chosen = alternatives.filter((a) => selectedAlternativeIds.includes(a.id));
    defer("alternatives", () => {
      const engine = getRemediationEngines().simulation;
      const result = engine.compareAlternatives(chosen, {
        parameters: selected ? { [selected.id]: bindings } : {},
      });
      if (!mounted.current) return;
      setComparison(result);
      setStale((prev) => ({ ...prev, comparison: false }));
      setAnnouncement(`Alternative comparison complete. Verdict: ${result.verdict}.`);
    });
  }, [
    defer,
    alternatives,
    alternativeEligibility,
    selectedAlternativeIds,
    selected,
    bindings,
    busy,
  ]);

  const buildChangePlan = useCallback(() => {
    const gate = evaluateChangePlanEligibility({
      simulation,
      simulationStale: stale.simulation,
      proposalEligibility: evaluateSimulationEligibility({
        proposal: bound,
        validation,
        validationStale,
        unresolvedParameters,
        conflicts,
        busy: busy !== null,
      }),
      canonicalGraphHash,
      busy: busy !== null,
    });
    if (!gate.eligible) {
      setBlockerAnnouncement(`Change plan blocked. ${gate.reason}`);
      return;
    }
    const source = simulation;
    if (!source) return;
    defer("plan", () => {
      const engines = getRemediationEngines();
      const built = engines.plan.buildPlanFromSimulation(source);
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
  }, [
    defer,
    simulation,
    stale.simulation,
    bound,
    validation,
    validationStale,
    unresolvedParameters,
    conflicts,
    canonicalGraphHash,
    busy,
  ]);

  /** Re-runs the action that failed, without changing any selection. */
  const retry = useCallback(() => {
    switch (failedAction) {
      case "proposals":
        generateProposals();
        return;
      case "validation":
        validateProposal();
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
        setErrorAnnouncement("");
    }
  }, [
    failedAction,
    generateProposals,
    validateProposal,
    runSimulation,
    runAlternativeComparison,
    buildChangePlan,
  ]);

  const reset = useCallback(() => {
    setProposals([]);
    setProposalStatus("not-generated");
    setProposalId(null);
    setBindings({});
    setConflicts([]);
    setError(null);
    setFailedAction(null);
    setAnnouncement("");
    setErrorAnnouncement("");
    setBlockerAnnouncement("");
    clearValidation();
    resetDownstream();
    clearedFor.current = null;
    selectRecommendation(null);
  }, [resetDownstream, selectRecommendation, clearValidation]);

  /* ------------------------------------------------- blocker announcement */

  const blockerSummary = useMemo(
    () =>
      summarizeWorkflowBlocker({
        simulationEligibility,
        comparisonEligibility,
        planEligibility,
        plan,
      }),
    [simulationEligibility, comparisonEligibility, planEligibility, plan],
  );

  // Announced only when it CHANGES, so a re-render never repeats a blocker and
  // clearing the last blocker is itself reported.
  const previousBlocker = useRef("");
  useEffect(() => {
    if (blockerSummary === previousBlocker.current) return;
    const hadBlocker = previousBlocker.current !== "";
    previousBlocker.current = blockerSummary;
    if (blockerSummary) setBlockerAnnouncement(blockerSummary);
    else if (hadBlocker) setBlockerAnnouncement(BLOCKERS_CLEARED_ANNOUNCEMENT);
  }, [blockerSummary]);

  /* -------------------------------------------------------- stage gating */

  const stageStates = useMemo<Readonly<Record<RemediationStage, StageState>>>(() => {
    const hasRecommendation = recommendation !== null;
    const hasProposals = proposals.length > 0;
    const hasProposal = selected !== null;
    const parametersResolved = hasProposal && unresolvedParameters.length === 0;
    const validated = validationStatus === "validated";
    const hasSimulation = simulation !== null && !stale.simulation;

    const proposalsState: StageState = !hasRecommendation
      ? "locked"
      : proposalStatus === "failed"
        ? "blocked"
        : hasProposal
          ? "complete"
          : "available";

    const parametersState: StageState = !hasProposals
      ? "locked"
      : !hasProposal
        ? "locked"
        : parametersResolved
          ? "complete"
          : "blocked";

    const validationState: StageState = !hasProposal
      ? "locked"
      : validationStatus === "stale"
        ? "stale"
        : validationStatus === "failed"
          ? "blocked"
          : validated
            ? "complete"
            : "available";

    const simulationState: StageState = !hasProposal
      ? "locked"
      : hasSimulation
        ? "complete"
        : simulationEligibility.eligible
          ? "available"
          : simulation !== null && stale.simulation
            ? "stale"
            : "blocked";

    const alternativesState: StageState = !hasProposal
      ? "locked"
      : comparison
        ? stale.comparison
          ? "stale"
          : "complete"
        : alternatives.length <= 1
          ? "complete"
          : "available";

    const planState: StageState = !hasSimulation
      ? "locked"
      : plan
        ? stale.plan
          ? "stale"
          : "complete"
        : planEligibility.eligible
          ? "available"
          : "blocked";

    return {
      recommendation: hasRecommendation ? "complete" : "available",
      proposals: proposalsState,
      parameters: parametersState,
      validation: validationState,
      simulation: simulationState,
      alternatives: alternativesState,
      "change-plan": planState,
    };
  }, [
    recommendation,
    proposals.length,
    proposalStatus,
    selected,
    unresolvedParameters.length,
    validationStatus,
    simulation,
    stale,
    comparison,
    alternatives.length,
    plan,
    simulationEligibility.eligible,
    planEligibility.eligible,
  ]);

  const activeStage = useMemo<RemediationStage>(() => {
    if (!recommendation) return "recommendation";
    if (proposals.length === 0) return "proposals";
    if (!selected) return "proposals";
    if (unresolvedParameters.length > 0) return "parameters";
    if (validationStatus !== "validated") return "validation";
    if (!simulation || stale.simulation) return "simulation";
    if (plan) return "change-plan";
    return "change-plan";
  }, [
    recommendation,
    proposals.length,
    selected,
    unresolvedParameters.length,
    validationStatus,
    simulation,
    stale.simulation,
    plan,
  ]);

  const value = useMemo<RemediationWorkspaceValue>(
    () => ({
      recommendation,
      proposals,
      proposalStatus,
      proposal: bound,
      bindings,
      unresolvedParameters,
      validation,
      validationStatus,
      conflicts,
      alternatives,
      alternativeEligibility,
      alternativesAssessed,
      selectedAlternativeIds,
      simulation,
      comparison,
      plan,
      drift,
      simulationStale: stale.simulation,
      comparisonStale: stale.comparison,
      planStale: stale.plan,
      simulationEligibility,
      comparisonEligibility,
      planEligibility,
      busy,
      error,
      failedAction,
      retry,
      canonicalGraphHash,
      selectionSource: selection.source,
      unknownRecommendationParam,
      announcement,
      errorAnnouncement,
      blockerAnnouncement,
      stageStates,
      activeStage,
      selectRecommendation,
      generateProposals,
      selectProposal,
      setBinding,
      clearBindings,
      validateProposal,
      assessAlternatives,
      toggleAlternative,
      runSimulation,
      runAlternativeComparison,
      buildChangePlan,
      reset,
    }),
    [
      recommendation,
      proposals,
      proposalStatus,
      bound,
      bindings,
      unresolvedParameters,
      validation,
      validationStatus,
      conflicts,
      alternatives,
      alternativeEligibility,
      alternativesAssessed,
      selectedAlternativeIds,
      simulation,
      comparison,
      plan,
      drift,
      stale,
      simulationEligibility,
      comparisonEligibility,
      planEligibility,
      busy,
      error,
      failedAction,
      retry,
      canonicalGraphHash,
      selection.source,
      unknownRecommendationParam,
      announcement,
      errorAnnouncement,
      blockerAnnouncement,
      stageStates,
      activeStage,
      selectRecommendation,
      generateProposals,
      selectProposal,
      setBinding,
      clearBindings,
      validateProposal,
      assessAlternatives,
      toggleAlternative,
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
