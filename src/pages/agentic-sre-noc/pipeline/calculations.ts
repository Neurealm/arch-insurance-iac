/**
 * AIM-002 — Predictive Optical Link Intelligence, pure feature calculations.
 *
 * SYNTHETIC REFERENCE LOGIC. These functions are illustrative engineering
 * approximations used for demonstration only. They are not a Taara formula,
 * not a production model, and not derived from any proprietary system.
 *
 * Every function is pure, deterministic, typed and free of component state.
 * Missing values are represented as `null` and propagate as `null` rather than
 * silently becoming zero.
 */

export type Maybe<T> = T | null | undefined;

/** True when a value is a usable finite number. */
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

/**
 * Normalize a raw signal onto 0..1 against its engineering range.
 * Returns null for missing or invalid inputs (including a degenerate range).
 * Unit: dimensionless.
 */
export function normalizeSignal(value: Maybe<number>, min: number, max: number): number | null {
  if (!isNum(value) || !isNum(min) || !isNum(max) || max <= min) return null;
  return round(clamp((value - min) / (max - min)), 4);
}

/** Weighted blend that ignores missing parts and renormalizes the weights. */
function weightedIndex(parts: { weight: number; value: number | null }[]): number | null {
  const usable = parts.filter((p) => p.value !== null && p.weight > 0);
  if (usable.length === 0) return null;
  const totalWeight = usable.reduce((s, p) => s + p.weight, 0);
  const sum = usable.reduce((s, p) => s + p.weight * (p.value as number), 0);
  return sum / totalWeight;
}

/* ------------------------- atmospheric attenuation ------------------------ */

export interface AtmosphericAttenuationInput {
  /** km */ visibilityKm: Maybe<number>;
  /** 0..1 */ fogProbability: Maybe<number>;
  /** % */ humidityPct: Maybe<number>;
  /** mm per hour */ rainfallMmPerHour: Maybe<number>;
  /** km */ linkDistanceKm: Maybe<number>;
  /** relative product susceptibility, 0.5 to 1.5 */ productFactor?: Maybe<number>;
}

/**
 * Normalized route-level atmospheric attenuation risk between 0 and 1.
 * Unit: dimensionless index.
 */
export function calculateAtmosphericAttenuationIndex(
  input: AtmosphericAttenuationInput,
): number | null {
  const visibility = normalizeSignal(input.visibilityKm, 0, 10);
  const base = weightedIndex([
    { weight: 0.35, value: visibility === null ? null : 1 - visibility },
    { weight: 0.25, value: isNum(input.fogProbability) ? clamp(input.fogProbability) : null },
    { weight: 0.15, value: normalizeSignal(input.humidityPct, 40, 100) },
    { weight: 0.15, value: normalizeSignal(input.rainfallMmPerHour, 0, 25) },
    { weight: 0.1, value: normalizeSignal(input.linkDistanceKm, 0, 5) },
  ]);
  if (base === null) return null;
  const factor = isNum(input.productFactor) ? clamp(input.productFactor, 0.5, 1.5) : 1;
  return round(clamp(base * factor), 2);
}

/* --------------------------- link degradation ---------------------------- */

export interface MarginSample {
  /** minutes since the start of the observation window */ tMinutes: number;
  /** dB */ marginDb: Maybe<number>;
}

/**
 * Rate at which optical link margin is being lost.
 * Unit: dB per hour. Positive means margin is eroding.
 */
export function calculateLinkDegradationRate(samples: MarginSample[]): number | null {
  const usable = (samples ?? []).filter((s) => isNum(s.marginDb) && isNum(s.tMinutes));
  if (usable.length < 2) return null;
  const sorted = [...usable].sort((a, b) => a.tMinutes - b.tMinutes);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const hours = (last.tMinutes - first.tMinutes) / 60;
  if (hours <= 0) return null;
  return round(((first.marginDb as number) - (last.marginDb as number)) / hours, 2);
}

/* ------------------------ visibility to distance -------------------------- */

/**
 * Ratio of forecast visibility to link span. Values below 1 mean the optical
 * path exceeds usable visibility. Unit: dimensionless, capped at 5.
 */
export function calculateVisibilityDistanceRatio(
  visibilityKm: Maybe<number>,
  linkDistanceKm: Maybe<number>,
): number | null {
  if (!isNum(visibilityKm) || !isNum(linkDistanceKm) || linkDistanceKm <= 0 || visibilityKm < 0) return null;
  return round(Math.min(5, visibilityKm / linkDistanceKm), 2);
}

/* --------------------------- optical reserve ------------------------------ */

/**
 * Margin still available above the engineering minimum.
 * Unit: dB. Negative means the link is already below required margin.
 */
export function calculateOpticalReserveMargin(
  currentMarginDb: Maybe<number>,
  requiredMarginDb: Maybe<number>,
): number | null {
  if (!isNum(currentMarginDb) || !isNum(requiredMarginDb)) return null;
  return round(currentMarginDb - requiredMarginDb, 2);
}

/* ------------------------ multi-signal correlation ------------------------ */

function pearson(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 2) return null;
  const ma = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const mb = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i += 1) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  if (da === 0 || db === 0) return null;
  return num / Math.sqrt(da * db);
}

/**
 * Mean absolute pairwise correlation across the supplied signal series.
 * Unit: dimensionless, 0 to 1. Series with missing points are dropped.
 */
export function calculateMultiSignalCorrelation(series: Maybe<number>[][]): number | null {
  const clean = (series ?? [])
    .map((s) => (s ?? []).filter(isNum) as number[])
    .filter((s) => s.length >= 2);
  if (clean.length < 2) return null;
  const values: number[] = [];
  for (let i = 0; i < clean.length; i += 1) {
    for (let j = i + 1; j < clean.length; j += 1) {
      const r = pearson(clean[i], clean[j]);
      if (r !== null) values.push(Math.abs(r));
    }
  }
  if (values.length === 0) return null;
  return round(clamp(values.reduce((s, v) => s + v, 0) / values.length), 2);
}

/* ---------------------------- fallback headroom --------------------------- */

/**
 * Share of RF fallback capacity still free.
 * Unit: percent, 0 to 100.
 */
export function calculateFallbackHeadroom(
  fallbackCapacityGbps: Maybe<number>,
  fallbackUsedGbps: Maybe<number>,
): number | null {
  if (!isNum(fallbackCapacityGbps) || fallbackCapacityGbps <= 0) return null;
  const used = isNum(fallbackUsedGbps) ? Math.max(0, fallbackUsedGbps) : null;
  if (used === null) return null;
  return round(clamp(1 - used / fallbackCapacityGbps) * 100, 1);
}

/* --------------------------- service criticality -------------------------- */

export type ServiceTier = "Critical" | "High" | "Standard" | "Best Effort";

export interface ServiceCriticalityInput {
  tier: Maybe<ServiceTier>;
  /** number of customers riding the service */ customerCount: Maybe<number>;
  /** Gbps carried */ capacityGbps: Maybe<number>;
  /** 0..1, how tight the SLO is */ sloTightness: Maybe<number>;
}

const TIER_WEIGHT: Record<ServiceTier, number> = {
  Critical: 1,
  High: 0.75,
  Standard: 0.45,
  "Best Effort": 0.2,
};

/** Blended criticality of the exposed customer service. Unit: 0 to 1. */
export function calculateServiceCriticality(input: ServiceCriticalityInput): number | null {
  const tier = input.tier && input.tier in TIER_WEIGHT ? TIER_WEIGHT[input.tier] : null;
  const value = weightedIndex([
    { weight: 0.45, value: tier },
    { weight: 0.2, value: normalizeSignal(input.customerCount, 0, 500) },
    { weight: 0.2, value: normalizeSignal(input.capacityGbps, 0, 40) },
    { weight: 0.15, value: isNum(input.sloTightness) ? clamp(input.sloTightness) : null },
  ]);
  return value === null ? null : round(clamp(value), 2);
}

/* --------------------------- weather agreement ---------------------------- */

/**
 * Agreement across independent weather sources, where 1 means the sources are
 * identical. Unit: 0 to 1.
 */
export function calculateWeatherAgreement(sourceValues: Maybe<number>[]): number | null {
  const clean = (sourceValues ?? []).filter(isNum) as number[];
  if (clean.length < 2) return null;
  const mean = clean.reduce((s, v) => s + v, 0) / clean.length;
  if (mean === 0) return 1;
  const variance = clean.reduce((s, v) => s + (v - mean) ** 2, 0) / clean.length;
  const cv = Math.sqrt(variance) / Math.abs(mean);
  return round(clamp(1 - cv), 2);
}

/* --------------------------- baseline deviation --------------------------- */

/**
 * Distance from the dynamic baseline. Unit: standard deviations (sigma).
 */
export function calculateBaselineDeviation(
  value: Maybe<number>,
  baselineMean: Maybe<number>,
  baselineStdDev: Maybe<number>,
): number | null {
  if (!isNum(value) || !isNum(baselineMean) || !isNum(baselineStdDev) || baselineStdDev <= 0) return null;
  return round((value - baselineMean) / baselineStdDev, 2);
}

/* ------------------------ recent change proximity ------------------------- */

export type ProximityBand = "High" | "Medium" | "Low";

export interface ProximityResult {
  /** 0..1, higher means a change landed very recently */ score: number;
  band: ProximityBand;
}

/**
 * How close the prediction sits to a recent network change.
 * Unit: hours in, dimensionless score out.
 */
export function calculateRecentChangeProximity(hoursSinceChange: Maybe<number>): ProximityResult | null {
  if (!isNum(hoursSinceChange) || hoursSinceChange < 0) return null;
  const score = round(clamp(1 - hoursSinceChange / 72), 2);
  const band: ProximityBand = score >= 0.66 ? "High" : score >= 0.33 ? "Medium" : "Low";
  return { score, band };
}

/* -------------------------- historical similarity ------------------------- */

/**
 * Cosine similarity between the current condition vector and the closest
 * historical event vector. Unit: 0 to 1.
 */
export function calculateHistoricalSimilarity(
  current: Maybe<number>[],
  historical: Maybe<number>[],
): number | null {
  const a = (current ?? []).filter(isNum) as number[];
  const b = (historical ?? []).filter(isNum) as number[];
  const n = Math.min(a.length, b.length);
  if (n === 0) return null;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }
  if (na === 0 || nb === 0) return null;
  return round(clamp(dot / (Math.sqrt(na) * Math.sqrt(nb))), 2);
}

/* ----------------------------- sensor quality ----------------------------- */

export interface SensorQualityInput {
  expectedSamples: Maybe<number>;
  receivedSamples: Maybe<number>;
  invalidSamples?: Maybe<number>;
  /** seconds since the newest sample */ staleSeconds?: Maybe<number>;
}

/**
 * Telemetry trustworthiness combining completeness, validity and freshness.
 * Unit: 0 to 1.
 */
export function calculateSensorQuality(input: SensorQualityInput): number | null {
  if (!isNum(input.expectedSamples) || input.expectedSamples <= 0) return null;
  if (!isNum(input.receivedSamples) || input.receivedSamples < 0) return null;
  const completeness = clamp(input.receivedSamples / input.expectedSamples);
  const invalid = isNum(input.invalidSamples) ? Math.max(0, input.invalidSamples) : 0;
  const validity = clamp(1 - invalid / Math.max(1, input.receivedSamples));
  const freshness = isNum(input.staleSeconds) ? clamp(1 - input.staleSeconds / 900) : 1;
  return round(clamp(completeness * 0.5 + validity * 0.3 + freshness * 0.2), 2);
}

/* ---------------------- threshold tradeoff (demo only) -------------------- */

export interface ThresholdOutcome {
  highRiskLinks: number;
  recommendations: number;
  approvalRecommendations: number;
  precisionPct: number;
  recallPct: number;
  falsePositivePct: number;
  selectedLinkClass: "High" | "Medium" | "Low";
}

/**
 * Synthetic tradeoff curve for the demonstration confidence threshold.
 * Not a measured production value.
 */
export function calculateThresholdOutcome(
  thresholdPct: number,
  selectedLinkProbability: number,
  modelledLinks = 8721,
): ThresholdOutcome {
  const t = clamp(thresholdPct, 50, 99) / 100;
  const highRiskLinks = Math.max(1, Math.round(modelledLinks * 0.0125 * (1 - t) ** 1.35 * 10));
  const recommendations = Math.max(1, Math.round(highRiskLinks * 0.62));
  return {
    highRiskLinks,
    recommendations,
    approvalRecommendations: Math.max(1, Math.round(recommendations * 0.35)),
    precisionPct: round(clamp(0.62 + t * 0.36) * 100, 1),
    recallPct: round(clamp(0.99 - t * 0.42) * 100, 1),
    falsePositivePct: round(clamp(0.22 - t * 0.2, 0.004, 1) * 100, 1),
    selectedLinkClass:
      selectedLinkProbability >= t ? "High" : selectedLinkProbability >= t - 0.15 ? "Medium" : "Low",
  };
}
