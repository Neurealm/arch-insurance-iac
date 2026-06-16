/**
 * Convenience re-exports so consumers can import hypothesis types and
 * the curated hypothesis ranking without pulling the entire graph module.
 */
export {
  type RootCauseHypothesis,
  PAYMENT_LATENCY_GRAPH,
  getEvidenceGraphForScenario,
} from "./evidenceGraphData";

import { PAYMENT_LATENCY_GRAPH } from "./evidenceGraphData";

export const PAYMENT_LATENCY_HYPOTHESES = PAYMENT_LATENCY_GRAPH.hypotheses;
