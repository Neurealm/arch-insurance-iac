/**
 * AIM-003 — Chennai scenario, pure What-If calculation functions.
 *
 * SYNTHETIC REFERENCE LOGIC. Every function below is an illustrative
 * engineering approximation created for demonstration purposes. None of it is
 * a Taara formula, a production algorithm, or derived from any proprietary or
 * live model. No network call is made from this module.
 *
 * Design rules:
 * 1. Pure, deterministic, typed, side-effect free.
 * 2. Physical degradation probability, prediction confidence, customer impact,
 *    service criticality, fallback readiness, preventability and approval
 *    requirement are calculated and returned separately, never merged into a
 *    single opaque score.
 * 3. Missing or invalid inputs return `null` (or a clearly degraded result)
 *    rather than silently becoming zero.
 */

export type Maybe<T> = T | null | undefined;

export type RiskClass = "High" | "Moderate" | "Low" | "Unknown";

function isNum(v: Maybe<number>): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

function round(v: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

/** Normalize onto 0..1 against an engineering range; null when unusable. */
function norm(value: Maybe<number>, min: number, max: number): number | null {
  if (!isNum(value) || max <= min) return null;
  return clamp((value - min) / (max - min));
}

/** Weighted blend that skips missing parts and renormalizes the weights. */
function blend(parts: { weight: number; value: number | null }[]): number | null {
  const usable = parts.filter((p) => p.value !== null && p.weight > 0);
  if (usable.length === 0) return null;
  const total = usable.reduce((s, p) => s + p.weight, 0);
  return usable.reduce((s, p) => s + p.weight * (p.value as number), 0) / total;
}

/* ------------------------------ 1. weather ------------------------------- */

export interface WeatherSeverityInput {
  /** km, forecast horizontal visibility */ visibilityKm: Maybe<number>;
  /** 0..1 */ fogProbability: Maybe<number>;
  /** % */ humidityPct: Maybe<number>;
  /** mm per hour */ rainfallMmHr: Maybe<number>;
  /** km per hour */ windKph?: Maybe<number>;
}

/** Normalized atmospheric severity, 0 (clear) to 1 (severe). */
export function calculateWeatherSeverity(input: WeatherSeverityInput): number | null {
  const visibility = norm(input.visibilityKm, 0.2, 12);
  const severity = blend([
    { weight: 0.34, value: visibility === null ? null : 1 - visibility },
    { weight: 0.26, value: isNum(input.fogProbability) ? clamp(input.fogProbability) : null },
    { weight: 0.16, value: norm(input.humidityPct, 45, 100) },
    { weight: 0.16, value: norm(input.rainfallMmHr, 0, 25) },
    { weight: 0.08, value: norm(input.windKph, 0, 70) },
  ]);
  return severity === null ? null : round(clamp(severity), 3);
}

/* ------------------------- 2. optical degradation ------------------------ */

export interface OpticalSeverityInput {
  /** dB, design baseline margin */ linkMarginBaselineDb: Maybe<number>;
  /** dB, current margin */ linkMarginDb: Maybe<number>;
  /** dB, current atmospheric attenuation */ attenuationDb: Maybe<number>;
  /** dB per hour */ degradationRateDbHr: Maybe<number>;
  /** dBm, received optical power */ receivedPowerDbm?: Maybe<number>;
}

/** Normalized optical degradation severity, 0 (healthy) to 1 (critical). */
export function calculateOpticalDegradationSeverity(input: OpticalSeverityInput): number | null {
  const baseline = isNum(input.linkMarginBaselineDb) ? input.linkMarginBaselineDb : null;
  const margin = isNum(input.linkMarginDb) ? input.linkMarginDb : null;
  const deficiency =
    baseline !== null && margin !== null && baseline > 0
      ? clamp((baseline - margin) / baseline)
      : null;
  const severity = blend([
    { weight: 0.38, value: deficiency },
    { weight: 0.24, value: norm(input.attenuationDb, 0, 12) },
    { weight: 0.24, value: norm(input.degradationRateDbHr, 0, 1.2) },
    { weight: 0.14, value: norm(input.receivedPowerDbm, -22, -34) },
  ]);
  return severity === null ? null : round(clamp(severity), 3);
}

/* --------------------------- 3. risk probability -------------------------- */

export interface RiskProbabilityInput extends WeatherSeverityInput, OpticalSeverityInput {
  /** 0..1, similarity to prior confirmed events */ historicalSimilarity?: Maybe<number>;
  /** 0..1, 1 is fully healthy terminals */ terminalHealth?: Maybe<number>;
  /** 0..1, 1 is perfectly stable alignment */ alignmentStability?: Maybe<number>;
}

/**
 * Physical degradation probability, 0..1. This is the likelihood the optical
 * link degrades below its service threshold within the forecast horizon. It is
 * deliberately independent of confidence, customer impact and preventability.
 */
export function calculateRiskProbability(input: RiskProbabilityInput): number | null {
  const weather = calculateWeatherSeverity(input);
  const optical = calculateOpticalDegradationSeverity(input);
  if (weather === null && optical === null) return null;

  const base = blend([
    { weight: 0.46, value: weather },
    { weight: 0.42, value: optical },
    {
      weight: 0.12,
      value: isNum(input.historicalSimilarity) ? clamp(input.historicalSimilarity) : null,
    },
  ]);
  if (base === null) return null;

  // Health adjustments raise risk when terminals or alignment are degraded.
  const terminalAdj = isNum(input.terminalHealth) ? (1 - clamp(input.terminalHealth)) * 0.09 : 0;
  const alignmentAdj = isNum(input.alignmentStability)
    ? (1 - clamp(input.alignmentStability)) * 0.07
    : 0;

  // Mild convex response: compounding weather and optical stress escalates.
  const compounded = base ** 0.86;
  return round(clamp(compounded + terminalAdj + alignmentAdj), 2);
}

/* ------------------------------ 4. penalties ----------------------------- */

/** Confidence penalty, 0 (perfect telemetry) to 1 (unusable). */
export function calculateDataQualityPenalty(dataQualityPct: Maybe<number>): number {
  if (!isNum(dataQualityPct)) return 1;
  const q = clamp(dataQualityPct / 100);
  return round(clamp((1 - q) * 1.4), 3);
}

/** Confidence penalty from disagreeing forecast and telemetry sources. */
export function calculateSourceAgreementPenalty(sourceAgreementPct: Maybe<number>): number {
  if (!isNum(sourceAgreementPct)) return 1;
  const a = clamp(sourceAgreementPct / 100);
  return round(clamp((1 - a) * 1.6), 3);
}

/* ----------------------------- 5. confidence ----------------------------- */

export interface ConfidenceInput {
  /** % */ dataQualityPct: Maybe<number>;
  /** % */ sourceAgreementPct: Maybe<number>;
  /** seconds since last telemetry sample */ telemetryFreshnessSec?: Maybe<number>;
  /** 0..1 */ historicalSupport?: Maybe<number>;
  /** 0..1, agreement between ensemble members */ modelAgreement?: Maybe<number>;
  /** count of required signals that are missing */ missingSignals?: Maybe<number>;
}

/** Prediction confidence as a percentage, 0..99. Never conflated with risk. */
export function calculatePredictionConfidence(input: ConfidenceInput): number {
  const dq = calculateDataQualityPenalty(input.dataQualityPct);
  const sa = calculateSourceAgreementPenalty(input.sourceAgreementPct);
  const freshness = norm(input.telemetryFreshnessSec, 0, 900);
  const support = isNum(input.historicalSupport) ? clamp(input.historicalSupport) : 0.7;
  const agreement = isNum(input.modelAgreement) ? clamp(input.modelAgreement) : 0.85;
  const missing = isNum(input.missingSignals) ? Math.max(0, input.missingSignals) : 0;

  const positive = blend([
    { weight: 0.42, value: agreement },
    { weight: 0.32, value: support },
    { weight: 0.26, value: freshness === null ? 0.6 : 1 - freshness },
  ]);
  const base = positive === null ? 0.6 : positive;
  const value = base * (1 - dq * 0.55) * (1 - sa * 0.5) - missing * 0.04;
  return round(clamp(value, 0, 0.99) * 100, 0);
}

/* --------------------------- 6. time to impact --------------------------- */

export interface TimeToImpactInput {
  /** dB, current link margin */ linkMarginDb: Maybe<number>;
  /** dB, service threshold margin */ thresholdMarginDb?: Maybe<number>;
  /** dB per hour */ degradationRateDbHr: Maybe<number>;
  /** dB, current attenuation already applied */ attenuationDb?: Maybe<number>;
  /** multiplier for forecast worsening, 1 is steady */ forecastAcceleration?: Maybe<number>;
}

/**
 * Estimated minutes until the link crosses its service threshold.
 * Returns null when the rate is non-positive (no predicted crossing) or when
 * inputs are missing.
 */
export function estimateTimeToImpact(input: TimeToImpactInput): number | null {
  if (!isNum(input.linkMarginDb) || !isNum(input.degradationRateDbHr)) return null;
  const threshold = isNum(input.thresholdMarginDb) ? input.thresholdMarginDb : 1;
  const acceleration = isNum(input.forecastAcceleration)
    ? clamp(input.forecastAcceleration, 0.25, 3)
    : 1;
  const rate = input.degradationRateDbHr * acceleration;
  if (rate <= 0) return null;
  const reserve = input.linkMarginDb - threshold;
  if (reserve <= 0) return 0;
  const hours = reserve / rate;
  return Math.round(clamp(hours, 0, 72) * 60);
}

/** Format minutes as an operational ETA label. */
export function formatEta(minutes: number | null): string {
  if (minutes === null) return "No crossing predicted";
  if (minutes <= 0) return "Threshold reached";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/* ------------------------------- 7. classes ------------------------------ */

/** Risk class from the physical degradation probability. */
export function classifyRisk(probability: Maybe<number>): RiskClass {
  if (!isNum(probability)) return "Unknown";
  if (probability >= 0.8) return "High";
  if (probability >= 0.5) return "Moderate";
  return "Low";
}

/* ------------------------------ 8. exposure ------------------------------ */

export interface CapacityExposureResult {
  /** Gbps at risk before any protective action. */ exposedGbps: number;
  /** Gbps still exposed after fallback absorbs traffic. */ residualGbps: number;
  /** % of link capacity exposed. */ exposedPct: number;
}

/** Capacity exposed by the predicted degradation. */
export function calculateCapacityExposure(
  capacityGbps: Maybe<number>,
  riskProbability: Maybe<number>,
  fallbackReadinessScore: Maybe<number> = 0,
): CapacityExposureResult {
  const capacity = isNum(capacityGbps) ? Math.max(0, capacityGbps) : 0;
  const p = isNum(riskProbability) ? clamp(riskProbability) : 0;
  const fallback = isNum(fallbackReadinessScore) ? clamp(fallbackReadinessScore) : 0;
  const exposed = p >= 0.5 ? capacity : round(capacity * p * 2, 1);
  const residual = round(exposed * (1 - fallback), 1);
  return {
    exposedGbps: round(exposed, 1),
    residualGbps: residual,
    exposedPct: capacity > 0 ? round((exposed / capacity) * 100, 0) : 0,
  };
}

export interface CustomerExposureResult {
  servicesExposed: number;
  criticalServicesExposed: number;
  /** 0..1 blast radius indicator. */ blastRadius: number;
}

/** Customer-service exposure, kept separate from capacity and criticality. */
export function calculateCustomerExposure(
  serviceCount: Maybe<number>,
  riskProbability: Maybe<number>,
  serviceCriticality: "Critical" | "High" | "Standard" | "Low" = "Standard",
): CustomerExposureResult {
  const count = isNum(serviceCount) ? Math.max(0, Math.round(serviceCount)) : 0;
  const p = isNum(riskProbability) ? clamp(riskProbability) : 0;
  const exposed = p >= 0.5 ? count : Math.round(count * p * 2);
  const criticalFactor = serviceCriticality === "Critical" ? 1 : serviceCriticality === "High" ? 0.6 : 0.2;
  return {
    servicesExposed: exposed,
    criticalServicesExposed: Math.round(exposed * criticalFactor),
    blastRadius: round(clamp(exposed / 8) * (0.6 + criticalFactor * 0.4), 2),
  };
}

/* -------------------------- 9. fallback readiness ------------------------- */

export type FallbackState = "Ready" | "Degraded" | "Insufficient" | "Unavailable";

export interface FallbackInput {
  available: boolean;
  /** % spare capacity on the fallback path */ headroomPct: Maybe<number>;
  /** ms */ latencyMs?: Maybe<number>;
  /** % */ packetLossPct?: Maybe<number>;
  /** hours since last validation */ validationAgeHours?: Maybe<number>;
}

export interface FallbackReadiness {
  /** 0..1 */ score: number;
  state: FallbackState;
  reason: string;
}

/** Fallback readiness, independent of risk and preventability. */
export function calculateFallbackReadiness(input: FallbackInput): FallbackReadiness {
  if (!input.available) {
    return { score: 0, state: "Unavailable", reason: "No fallback path is provisioned for this link." };
  }
  const headroom = norm(input.headroomPct, 0, 60);
  const latency = norm(input.latencyMs, 60, 5);
  const loss = norm(input.packetLossPct, 2, 0);
  const validation = norm(input.validationAgeHours, 72, 0);
  const score = blend([
    { weight: 0.44, value: headroom },
    { weight: 0.2, value: latency },
    { weight: 0.2, value: loss },
    { weight: 0.16, value: validation },
  ]);
  const s = score === null ? 0 : round(clamp(score), 2);
  const headroomPct = isNum(input.headroomPct) ? input.headroomPct : 0;
  if (headroomPct < 15 || s < 0.35) {
    return { score: s, state: "Insufficient", reason: "Fallback headroom cannot absorb the exposed capacity." };
  }
  if (s < 0.62) {
    return { score: s, state: "Degraded", reason: "Fallback is usable but validation or quality is marginal." };
  }
  return { score: s, state: "Ready", reason: "Fallback is validated with sufficient headroom and quality." };
}

/* ---------------------------- 10. preventability -------------------------- */

export interface PreventabilityInput {
  etaMinutes: number | null;
  fallbackScore: Maybe<number>;
  riskProbability: Maybe<number>;
  /** minutes needed to execute the protective action */ actionLeadTimeMinutes?: Maybe<number>;
}

export interface Preventability {
  /** 0..1 */ score: number;
  preventable: boolean;
  reason: string;
}

/** Whether customer impact can still be prevented in the available window. */
export function calculatePreventability(input: PreventabilityInput): Preventability {
  const lead = isNum(input.actionLeadTimeMinutes) ? Math.max(1, input.actionLeadTimeMinutes) : 15;
  const fallback = isNum(input.fallbackScore) ? clamp(input.fallbackScore) : 0;
  if (input.etaMinutes === null) {
    return { score: round(fallback, 2), preventable: fallback >= 0.5, reason: "No threshold crossing is predicted." };
  }
  if (input.etaMinutes <= lead) {
    return { score: round(fallback * 0.25, 2), preventable: false, reason: "Insufficient lead time to act before impact." };
  }
  const window = clamp((input.etaMinutes - lead) / 240);
  const score = round(clamp(window * 0.55 + fallback * 0.45), 2);
  return {
    score,
    preventable: score >= 0.5 && fallback >= 0.35,
    reason:
      score >= 0.5 && fallback >= 0.35
        ? "Sufficient lead time and fallback capacity to protect the service."
        : "Lead time or fallback capacity is not sufficient to guarantee protection.",
  };
}

/* --------------------------- 11. action ranking --------------------------- */

export interface ActionRankingInput {
  riskClass: RiskClass;
  etaMinutes: number | null;
  serviceCriticality: "Critical" | "High" | "Standard" | "Low";
  fallback: FallbackReadiness;
  preventability: Preventability;
  confidencePct: number;
}

export interface RankedAction {
  /** Matches an AIM-002 pipeline action id where one exists. */ id: string;
  name: string;
  /** 0..1 suitability */ score: number;
  approvalRequired: boolean;
  reversibility: "Fully reversible" | "Reversible with validation" | "Difficult to reverse";
  rationale: string;
}

const ACTION_LIBRARY: Array<{
  id: string;
  name: string;
  reversibility: RankedAction["reversibility"];
  base: number;
}> = [
  { id: "move-priority", name: "Move Priority Traffic", reversibility: "Fully reversible", base: 0.5 },
  { id: "prepare-fallback", name: "Prepare Fallback", reversibility: "Fully reversible", base: 0.45 },
  { id: "move-all", name: "Move All Traffic", reversibility: "Reversible with validation", base: 0.3 },
  { id: "increase-monitoring", name: "Increase Monitoring Frequency", reversibility: "Fully reversible", base: 0.4 },
  { id: "monitor", name: "Monitor Closely", reversibility: "Fully reversible", base: 0.38 },
  { id: "restrict-changes", name: "Restrict Planned Changes", reversibility: "Fully reversible", base: 0.3 },
  { id: "dispatch", name: "Dispatch Field Service", reversibility: "Difficult to reverse", base: 0.18 },
];

/**
 * Ranks the synthetic action library against risk class, lead time, service
 * criticality, fallback readiness, preventability and the approval policy.
 */
export function rankRecommendedActions(input: ActionRankingInput): RankedAction[] {
  const high = input.riskClass === "High";
  const moderate = input.riskClass === "Moderate";
  const urgent = input.etaMinutes !== null && input.etaMinutes <= 120;
  const critical = input.serviceCriticality === "Critical" || input.serviceCriticality === "High";
  const fallbackOk = input.fallback.state === "Ready";
  const fallbackWeak = input.fallback.state === "Insufficient" || input.fallback.state === "Unavailable";

  const scored = ACTION_LIBRARY.map((a) => {
    let score = a.base;
    switch (a.id) {
      case "move-priority":
        score += (high ? 0.34 : moderate ? 0.1 : -0.2) + (fallbackOk ? 0.16 : -0.3) + (critical ? 0.1 : 0);
        break;
      case "prepare-fallback":
        score += (high || moderate ? 0.24 : 0) + (fallbackOk ? 0.06 : 0.14) + (urgent ? -0.06 : 0.04);
        break;
      case "move-all":
        score += (high && urgent ? 0.22 : -0.12) + (fallbackOk ? 0.08 : -0.35);
        break;
      case "increase-monitoring":
        score += (moderate ? 0.24 : high ? 0.02 : 0.14) + (fallbackWeak ? 0.12 : 0);
        break;
      case "monitor":
        score += input.riskClass === "Low" ? 0.36 : moderate ? 0.12 : -0.14;
        break;
      case "restrict-changes":
        score += (high ? 0.16 : 0.04) + (critical ? 0.06 : 0);
        break;
      case "dispatch":
        score += fallbackWeak && high ? 0.3 : -0.08;
        break;
      default:
        break;
    }
    score += (input.confidencePct / 100 - 0.7) * 0.2;
    score += (input.preventability.preventable ? 0.08 : -0.08);
    return {
      id: a.id,
      name: a.name,
      reversibility: a.reversibility,
      score: round(clamp(score), 2),
      approvalRequired:
        (a.id === "move-priority" || a.id === "move-all" || a.id === "dispatch") &&
        (critical || high),
      rationale: buildRationale(a.id, input),
    };
  });

  return scored.sort((x, y) => y.score - x.score || x.id.localeCompare(y.id));
}

function buildRationale(id: string, input: ActionRankingInput): string {
  const eta = formatEta(input.etaMinutes);
  switch (id) {
    case "move-priority":
      return `${input.riskClass} risk with ${eta} of lead time and ${input.fallback.state.toLowerCase()} fallback; priority traffic can be protected reversibly.`;
    case "prepare-fallback":
      return `Pre-staging the fallback path preserves optionality without customer-visible change. Fallback is ${input.fallback.state.toLowerCase()}.`;
    case "move-all":
      return `Full traffic migration is only justified when risk is high, lead time is short and fallback is ready.`;
    case "increase-monitoring":
      return `Sampling frequency increase narrows uncertainty while ${input.confidencePct}% confidence is maintained.`;
    case "monitor":
      return `Current ${input.riskClass.toLowerCase()} risk does not justify traffic change; continued observation is proportionate.`;
    case "restrict-changes":
      return `Freezing planned changes removes compounding risk during the predicted degradation window.`;
    default:
      return `Field intervention is considered when fallback capacity cannot protect the service.`;
  }
}

/* --------------------------- composite evaluation ------------------------- */

export interface LinkEvaluationInput
  extends RiskProbabilityInput,
    ConfidenceInput,
    Omit<TimeToImpactInput, "linkMarginDb" | "degradationRateDbHr" | "attenuationDb"> {
  capacityGbps: Maybe<number>;
  customerServiceCount: Maybe<number>;
  serviceCriticality: "Critical" | "High" | "Standard" | "Low";
  fallback: FallbackInput;
  actionLeadTimeMinutes?: Maybe<number>;
}

export interface LinkEvaluation {
  riskProbability: number | null;
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
  recommendedAction: RankedAction | null;
  approvalRequired: boolean;
}

/**
 * Composite evaluation used by the selected-link summary, the map styling and
 * the What-If panel. Each component value stays individually inspectable.
 */
export function evaluateLink(input: LinkEvaluationInput): LinkEvaluation {
  const riskProbability = calculateRiskProbability(input);
  const riskClass = classifyRisk(riskProbability);
  const confidencePct = calculatePredictionConfidence(input);
  const etaMinutes = estimateTimeToImpact({
    linkMarginDb: input.linkMarginDb,
    thresholdMarginDb: input.thresholdMarginDb,
    degradationRateDbHr: input.degradationRateDbHr,
    attenuationDb: input.attenuationDb,
    forecastAcceleration: input.forecastAcceleration,
  });
  const fallback = calculateFallbackReadiness(input.fallback);
  const capacity = calculateCapacityExposure(input.capacityGbps, riskProbability, fallback.score);
  const customer = calculateCustomerExposure(
    input.customerServiceCount,
    riskProbability,
    input.serviceCriticality,
  );
  const preventability = calculatePreventability({
    etaMinutes,
    fallbackScore: fallback.score,
    riskProbability,
    actionLeadTimeMinutes: input.actionLeadTimeMinutes,
  });
  const actions = rankRecommendedActions({
    riskClass,
    etaMinutes,
    serviceCriticality: input.serviceCriticality,
    fallback,
    preventability,
    confidencePct,
  });
  const recommendedAction = actions[0] ?? null;
  return {
    riskProbability,
    riskClass,
    confidencePct,
    etaMinutes,
    etaLabel: formatEta(etaMinutes),
    weatherSeverity: calculateWeatherSeverity(input),
    opticalSeverity: calculateOpticalDegradationSeverity(input),
    capacity,
    customer,
    fallback,
    preventability,
    actions,
    recommendedAction,
    approvalRequired: recommendedAction?.approvalRequired ?? false,
  };
}
