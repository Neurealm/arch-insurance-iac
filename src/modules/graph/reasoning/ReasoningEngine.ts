/**
 * Stage 3.5.3.2 — Enterprise Graph Reasoning and Analysis Engine.
 *
 * A thin, deterministic facade over the Stage 3.5.3.1 query engine. It owns no
 * graph state, performs no mutation, and contains no LLM, embedding or
 * statistical inference. Every method returns the standard reasoning envelope
 * with structured evidence, derived confidence and deterministic
 * recommendations.
 */

import type { GraphQueryEngine } from "../query/index";
import { getQueryEngine } from "../query/index";
import type {
  BottleneckRecord,
  CircularDependencyRecord,
  CoverageGapRecord,
  CriticalNodeRecord,
  CriticalityOptions,
  DependencyChainRecord,
  ImpactOptions,
  LineageRecord,
  OwnershipRecord,
  ReasoningOptions,
  ReasoningResult,
  SinglePointOfFailureRecord,
  TraceabilityRecord,
} from "./ReasoningTypes";
import { REASONING_GENERATOR } from "./ReasoningTypes";
import { analyzeDependencyChains, analyzeImpact, type ImpactAnalysisResult } from "./ImpactAnalysis";
import {
  analyzeBottlenecks,
  analyzeCriticalNodes,
  analyzeSinglePointsOfFailure,
} from "./CriticalityAnalysis";
import { analyzeOwnershipPropagation } from "./OwnershipAnalysis";
import { analyzeCoverageGaps } from "./CoverageAnalysis";
import { analyzeCircularDependencies } from "./CycleAnalysis";
import { analyzeCapabilityLineage, analyzeRouteTraceability } from "./LineageAnalysis";

export interface ReasoningEngineInput {
  /** Defaults to the process-wide query engine over the populated graph. */
  queryEngine?: GraphQueryEngine;
}

export class GraphReasoningEngine {
  readonly generator = REASONING_GENERATOR;
  private readonly engine: GraphQueryEngine;

  constructor(input: ReasoningEngineInput = {}) {
    this.engine = input.queryEngine ?? getQueryEngine();
  }

  /** The underlying read-only query engine; exposed for composition. */
  get query(): GraphQueryEngine {
    return this.engine;
  }

  get graphMetadata() {
    return this.engine.graphMetadata;
  }

  /* ------------------------------------------------------------ impact */

  downstreamImpact(nodeId: string, options: ImpactOptions = {}): ImpactAnalysisResult {
    return analyzeImpact(this.engine, nodeId, { ...options, direction: "downstream" });
  }

  upstreamImpact(nodeId: string, options: ImpactOptions = {}): ImpactAnalysisResult {
    return analyzeImpact(this.engine, nodeId, { ...options, direction: "upstream" });
  }

  impact(nodeId: string, options: ImpactOptions = {}): ImpactAnalysisResult {
    return analyzeImpact(this.engine, nodeId, options);
  }

  dependencyChains(nodeId: string, options: ImpactOptions = {}): ReasoningResult<DependencyChainRecord> {
    return analyzeDependencyChains(this.engine, nodeId, options);
  }

  /* ------------------------------------------------------- criticality */

  criticalNodes(options: CriticalityOptions = {}): ReasoningResult<CriticalNodeRecord> {
    return analyzeCriticalNodes(this.engine, options);
  }

  bottlenecks(options: CriticalityOptions = {}): ReasoningResult<BottleneckRecord> {
    return analyzeBottlenecks(this.engine, options);
  }

  singlePointsOfFailure(options: CriticalityOptions = {}): ReasoningResult<SinglePointOfFailureRecord> {
    return analyzeSinglePointsOfFailure(this.engine, options);
  }

  /* --------------------------------------------------------- ownership */

  ownershipPropagation(options: ReasoningOptions = {}): ReasoningResult<OwnershipRecord> {
    return analyzeOwnershipPropagation(this.engine, options);
  }

  /* ---------------------------------------------------------- coverage */

  coverageGaps(options: ReasoningOptions = {}): ReasoningResult<CoverageGapRecord> {
    return analyzeCoverageGaps(this.engine, options);
  }

  /* ------------------------------------------------------------ cycles */

  circularDependencies(options: ReasoningOptions = {}): ReasoningResult<CircularDependencyRecord> {
    return analyzeCircularDependencies(this.engine, options);
  }

  /* ----------------------------------------------------------- lineage */

  capabilityLineage(nodeId: string, options: ReasoningOptions = {}): ReasoningResult<LineageRecord> {
    return analyzeCapabilityLineage(this.engine, nodeId, options);
  }

  routeTraceability(options: ReasoningOptions = {}): ReasoningResult<TraceabilityRecord> {
    return analyzeRouteTraceability(this.engine, options);
  }
}

let cached: GraphReasoningEngine | null = null;

/** Process-wide reasoning engine over the populated graph. */
export const getReasoningEngine = (): GraphReasoningEngine => (cached ??= new GraphReasoningEngine());

/** Test hook: clears the cached reasoning engine. */
export const __resetReasoningEngineCache = (): void => {
  cached = null;
};

export const createReasoningEngine = (input: ReasoningEngineInput = {}): GraphReasoningEngine =>
  new GraphReasoningEngine(input);
