/**
 * AIM-003 — Chennai scenario model adapter.
 *
 * Bridges the fixture records and the What-If control values onto the pure
 * calculation functions. A per-link calibration offset is applied so that the
 * published fixture headline values (for example CHN-MBL-041 at 0.94 risk,
 * 94% confidence and 342 minutes to impact) are reproduced exactly at
 * baseline, while every What-If change is computed live from the pure
 * functions. Synthetic reference logic only.
 */

import {
  calculateCapacityExposure, calculateCustomerExposure, calculateFallbackReadiness,
  calculateOpticalDegradationSeverity, calculatePredictionConfidence, calculatePreventability,
  calculateRiskProbability, calculateWeatherSeverity, classifyRisk, estimateTimeToImpact,
  formatEta, rankRecommendedActions,
  type CapacityExposureResult, type CustomerExposureResult, type FallbackReadiness,
  type Preventability, type RankedAction, type RiskClass,
} from "./chennaiCalculations";
import { baselineWhatIf, type ChennaiLink, type WhatIfValues } from "./chennaiFixtures";

export interface ChennaiPrediction {
  linkId: string;
  riskProbability: number;
  riskClass: RiskClass;
  confidencePct: number;
  etaMinutes: number | null;
  etaLabel: string;
  weatherSeverity: number | null;
  opticalSeverity: number | null;
  capacity: CapacityExposureResult;
  customer: CustomerExposureResult;
  fallback: FallbackReadiness;
  preventability: Preventability;
  actions: RankedAction[];
  recommendedAction: RankedAction;
  approvalRequired: boolean;
  aboveConfidenceThreshold: boolean;
}

interface Calibration {
  risk: number;
  confidence: number;
  eta: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round2 = (v: number) => Math.round(v * 100) / 100;

function rawCore(link: ChennaiLink, v: WhatIfValues) {
  const risk = calculateRiskProbability({
    visibilityKm: v.visibilityKm,
    fogProbability: v.fogProbability / 100,
    humidityPct: v.humidityPct,
    rainfallMmHr: v.rainfallMmHr,
    windKph: v.windKph,
    linkMarginBaselineDb: v.linkMarginBaselineDb,
    linkMarginDb: v.linkMarginDb,
    attenuationDb: v.attenuationDb,
    degradationRateDbHr: v.degradationRateDbHr,
    receivedPowerDbm: link.receivedPowerDbm,
    historicalSimilarity: link.historicalSimilarity,
    terminalHealth: link.terminalHealthScore,
    alignmentStability: link.alignmentStability,
  });
  const confidence = calculatePredictionConfidence({
    dataQualityPct: v.dataQualityPct,
    sourceAgreementPct: v.sourceAgreementPct,
    telemetryFreshnessSec: 30,
    historicalSupport: link.historicalSimilarity,
    modelAgreement: 0.9,
    missingSignals: 0,
  });
  const eta = estimateTimeToImpact({
    linkMarginDb: v.linkMarginDb,
    thresholdMarginDb: link.thresholdMarginDb,
    degradationRateDbHr: v.degradationRateDbHr,
    attenuationDb: v.attenuationDb,
    forecastAcceleration: 1,
  });
  return { risk, confidence, eta };
}

const calibrationCache = new Map<string, Calibration>();

/** Offset between the pure model at baseline and the published fixture value. */
export function calibrationFor(link: ChennaiLink): Calibration {
  const cached = calibrationCache.get(link.id);
  if (cached) return cached;
  const base = rawCore(link, baselineWhatIf(link));
  const cal: Calibration = {
    risk: link.riskScore - (base.risk ?? 0),
    confidence: link.confidencePct - base.confidence,
    eta: base.eta === null ? 0 : link.predictedImpactMinutes - base.eta,
  };
  calibrationCache.set(link.id, cal);
  return cal;
}

/**
 * Evaluate a Chennai link. Omit `values` for the published fixture baseline.
 * Throws nothing: invalid input degrades to a low-confidence Unknown result.
 */
export function evaluateChennaiLink(link: ChennaiLink, values?: WhatIfValues): ChennaiPrediction {
  const v = values ?? baselineWhatIf(link);
  const cal = calibrationFor(link);
  const raw = rawCore(link, v);

  const riskProbability = round2(clamp((raw.risk ?? 0) + cal.risk, 0, 0.99));
  const confidencePct = Math.round(clamp(raw.confidence + cal.confidence, 0, 99));
  const etaMinutes = raw.eta === null ? null : Math.max(0, Math.round(raw.eta + cal.eta));

  const riskClass = classifyRisk(riskProbability);
  const fallback = calculateFallbackReadiness({
    available: link.fallbackReady,
    headroomPct: v.fallbackHeadroomPct,
    latencyMs: link.fallbackLatencyMs,
    packetLossPct: link.fallbackPacketLossPct,
    validationAgeHours: link.fallbackValidationAgeHours,
  });
  const capacity = calculateCapacityExposure(link.capacityGbps, riskProbability, fallback.score);
  const customer = calculateCustomerExposure(
    link.customerServiceCount, riskProbability, v.serviceCriticality,
  );
  const preventability = calculatePreventability({
    etaMinutes, fallbackScore: fallback.score, riskProbability, actionLeadTimeMinutes: 15,
  });
  const actions = rankRecommendedActions({
    riskClass, etaMinutes, serviceCriticality: v.serviceCriticality, fallback,
    preventability, confidencePct,
  });
  const recommendedAction = actions[0];

  return {
    linkId: link.id,
    riskProbability,
    riskClass,
    confidencePct,
    etaMinutes,
    etaLabel: formatEta(etaMinutes),
    weatherSeverity: calculateWeatherSeverity({
      visibilityKm: v.visibilityKm, fogProbability: v.fogProbability / 100,
      humidityPct: v.humidityPct, rainfallMmHr: v.rainfallMmHr, windKph: v.windKph,
    }),
    opticalSeverity: calculateOpticalDegradationSeverity({
      linkMarginBaselineDb: v.linkMarginBaselineDb, linkMarginDb: v.linkMarginDb,
      attenuationDb: v.attenuationDb, degradationRateDbHr: v.degradationRateDbHr,
      receivedPowerDbm: link.receivedPowerDbm,
    }),
    capacity,
    customer,
    fallback,
    preventability,
    actions,
    recommendedAction,
    approvalRequired: recommendedAction?.approvalRequired ?? false,
    aboveConfidenceThreshold: confidencePct >= v.confidenceThresholdPct,
  };
}

/** Applies a What-If preset patch on top of the link baseline. */
export function applyPatch(base: WhatIfValues, patch: Partial<WhatIfValues>): WhatIfValues {
  return { ...base, ...patch };
}

export interface WhatIfComparison {
  key: string;
  label: string;
  current: string;
  proposed: string;
  delta: string;
  /** Direction of the change from an operational point of view. */
  tone: "better" | "worse" | "same";
  /** 0..1 normalized values for the compact comparison chart. */
  currentPct: number;
  proposedPct: number;
}

const pct = (v: number) => `${Math.round(v)}%`;

export function comparePredictions(
  current: ChennaiPrediction,
  proposed: ChennaiPrediction,
): WhatIfComparison[] {
  const etaNum = (p: ChennaiPrediction) => (p.etaMinutes === null ? 1440 : p.etaMinutes);
  const rows: WhatIfComparison[] = [
    {
      key: "risk", label: "Risk probability",
      current: current.riskProbability.toFixed(2), proposed: proposed.riskProbability.toFixed(2),
      delta: signed(proposed.riskProbability - current.riskProbability, 2),
      tone: tone(current.riskProbability, proposed.riskProbability, false),
      currentPct: current.riskProbability * 100, proposedPct: proposed.riskProbability * 100,
    },
    {
      key: "confidence", label: "Confidence",
      current: pct(current.confidencePct), proposed: pct(proposed.confidencePct),
      delta: signed(proposed.confidencePct - current.confidencePct, 0),
      tone: tone(current.confidencePct, proposed.confidencePct, true),
      currentPct: current.confidencePct, proposedPct: proposed.confidencePct,
    },
    {
      key: "eta", label: "ETA to impact",
      current: current.etaLabel, proposed: proposed.etaLabel,
      delta: signed(etaNum(proposed) - etaNum(current), 0, " min"),
      tone: tone(etaNum(current), etaNum(proposed), true),
      currentPct: Math.min(100, (etaNum(current) / 1440) * 100),
      proposedPct: Math.min(100, (etaNum(proposed) / 1440) * 100),
    },
    {
      key: "capacity", label: "Capacity exposure",
      current: `${current.capacity.exposedGbps} Gbps`, proposed: `${proposed.capacity.exposedGbps} Gbps`,
      delta: signed(proposed.capacity.exposedGbps - current.capacity.exposedGbps, 1, " Gbps"),
      tone: tone(current.capacity.exposedGbps, proposed.capacity.exposedGbps, false),
      currentPct: current.capacity.exposedPct, proposedPct: proposed.capacity.exposedPct,
    },
    {
      key: "fallback", label: "Fallback headroom",
      current: `${Math.round(current.fallback.score * 100)}%`,
      proposed: `${Math.round(proposed.fallback.score * 100)}%`,
      delta: signed((proposed.fallback.score - current.fallback.score) * 100, 0, "%"),
      tone: tone(current.fallback.score, proposed.fallback.score, true),
      currentPct: current.fallback.score * 100, proposedPct: proposed.fallback.score * 100,
    },
    {
      key: "preventability", label: "Preventability",
      current: `${Math.round(current.preventability.score * 100)}%`,
      proposed: `${Math.round(proposed.preventability.score * 100)}%`,
      delta: signed((proposed.preventability.score - current.preventability.score) * 100, 0, "%"),
      tone: tone(current.preventability.score, proposed.preventability.score, true),
      currentPct: current.preventability.score * 100, proposedPct: proposed.preventability.score * 100,
    },
  ];
  return rows;
}

function signed(delta: number, dp: number, suffix = ""): string {
  const rounded = Number(delta.toFixed(dp));
  if (rounded === 0) return `No change${suffix ? "" : ""}`;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(dp)}${suffix}`;
}

function tone(current: number, proposed: number, higherIsBetter: boolean): WhatIfComparison["tone"] {
  if (Math.abs(proposed - current) < 1e-9) return "same";
  const better = higherIsBetter ? proposed > current : proposed < current;
  return better ? "better" : "worse";
}

/** Plain-language explanation of what changed and why. */
export function explainChange(
  current: ChennaiPrediction,
  proposed: ChennaiPrediction,
): string {
  const parts: string[] = [];
  const dr = proposed.riskProbability - current.riskProbability;
  if (Math.abs(dr) >= 0.01) {
    parts.push(
      `Risk probability moved ${dr > 0 ? "up" : "down"} ${Math.abs(dr).toFixed(2)} to ${proposed.riskProbability.toFixed(2)} (${proposed.riskClass.toLowerCase()} risk), driven by the revised atmospheric and optical inputs.`,
    );
  }
  const dc = proposed.confidencePct - current.confidencePct;
  if (Math.abs(dc) >= 1) {
    parts.push(
      `Confidence moved ${dc > 0 ? "up" : "down"} ${Math.abs(dc)} points to ${proposed.confidencePct}% because data quality and source agreement changed.`,
    );
  }
  if (proposed.etaLabel !== current.etaLabel) {
    parts.push(`ETA to impact changed from ${current.etaLabel} to ${proposed.etaLabel}.`);
  }
  if (proposed.fallback.state !== current.fallback.state) {
    parts.push(`Fallback readiness changed from ${current.fallback.state} to ${proposed.fallback.state}. ${proposed.fallback.reason}`);
  }
  if (proposed.recommendedAction?.id !== current.recommendedAction?.id) {
    parts.push(
      `Recommended action changed from ${current.recommendedAction?.name} to ${proposed.recommendedAction?.name}. ${proposed.recommendedAction?.rationale}`,
    );
  }
  if (parts.length === 0) return "No material change against the current prediction.";
  return parts.join(" ");
}
