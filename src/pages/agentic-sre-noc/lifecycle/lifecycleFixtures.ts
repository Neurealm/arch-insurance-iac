/**
 * AIM-005 — synthetic model-lifecycle fixtures.
 *
 * These records extend the existing PLI fixture set. They reuse the canonical
 * active model version v2.4.1 and describe a single synthetic Taara-aligned
 * demonstration lineage. No real training run or deployment is represented.
 */

import type {
  BacktestAnnotation,
  BacktestEvent,
  BacktestSeries,
  ClassBalanceRecord,
  DataQualityRecord,
  DriftMetric,
  ExplainabilityValidationRecord,
  GovernanceNote,
  ModelApproval,
  ModelEvidenceRecord,
  ModelGovernanceRecord,
  ModelLifecycleActivity,
  ModelLimitation,
  ModelReleaseGate,
  ModelVersion,
  ModelVersionTimelineEvent,
  SamplingStrategyRecord,
  TrainingCoverageRecord,
  TrainingDataset,
  TrainingDatasetComposition,
  TrainingProvenanceRecord,
  ValidationResult,
  ValidationSegment,
  ValidationSplit,
  ValidationSummaryMetric,
  LifecycleTab,
} from "./lifecycleTypes";

export const lifecycleTabs: readonly LifecycleTab[] = [
  "Training Data",
  "Validation",
  "Backtesting",
  "Explainability",
  "Drift",
  "Governance",
] as const;

export const SYNTHETIC_NOTICE =
  "Synthetic governance state. Approvals, reviews and deployments below are demonstration records only.";

/* ------------------------------ training data ----------------------------- */

export const trainingDataset: TrainingDataset = {
  id: "pli-train-2026-06",
  version: "PLI-TRAIN-2026.06",
  label: "Predictive Optical Link Intelligence training corpus",
  totalSamples: 1_200_000,
  totalSamplesLabel: "1.2 million",
  windowStart: "2024-01-01",
  windowEnd: "2026-06-30",
  windowLabel: "January 2024 through June 2026",
  qualityScorePct: 96.8,
  lineageStatus: "Complete",
  priorVersion: "PLI-TRAIN-2026.01",
};

export const trainingComposition: TrainingDatasetComposition[] = [
  { key: "optical", label: "Optical Signals", sharePct: 42, priorSharePct: 40, samples: 504_000, color: "#2563eb", description: "Link margin, received power, attenuation, beam lock and reacquisition telemetry." },
  { key: "weather", label: "Weather Data", sharePct: 28, priorSharePct: 27, samples: 336_000, color: "#0891b2", description: "Visibility, fog probability, humidity, rainfall and wind observations and forecasts." },
  { key: "network", label: "Network Data", sharePct: 16, priorSharePct: 18, samples: 192_000, color: "#7c3aed", description: "Throughput, latency, packet loss, route health and fallback capacity." },
  { key: "events", label: "Historical Events", sharePct: 9, priorSharePct: 10, samples: 108_000, color: "#d97706", description: "Labelled degradation, protection and outage events with confirmed outcomes." },
  { key: "service", label: "Service and Context Data", sharePct: 5, priorSharePct: 5, samples: 60_000, color: "#059669", description: "Customer-service mapping, criticality, site type and firmware cohort context." },
];

export const trainingCoverage: TrainingCoverageRecord[] = [
  { dimension: "Regions", key: "south-asia", label: "South Asia", sharePct: 27, samples: 324_000, estateSharePct: 26 },
  { dimension: "Regions", key: "southeast-asia", label: "Southeast Asia", sharePct: 18, samples: 216_000, estateSharePct: 17 },
  { dimension: "Regions", key: "africa", label: "Africa", sharePct: 17, samples: 204_000, estateSharePct: 19 },
  { dimension: "Regions", key: "europe", label: "Europe", sharePct: 14, samples: 168_000, estateSharePct: 14 },
  { dimension: "Regions", key: "north-america", label: "North America", sharePct: 13, samples: 156_000, estateSharePct: 13 },
  { dimension: "Regions", key: "south-america", label: "South America", sharePct: 11, samples: 132_000, estateSharePct: 11 },

  { dimension: "Products", key: "lightbridge", label: "Lightbridge", sharePct: 48, samples: 576_000, estateSharePct: 46 },
  { dimension: "Products", key: "lightbridge-pro", label: "Lightbridge Pro", sharePct: 37, samples: 444_000, estateSharePct: 36 },
  { dimension: "Products", key: "beam", label: "Beam", sharePct: 15, samples: 180_000, estateSharePct: 18 },

  { dimension: "Link distances", key: "0-2km", label: "Under 2 km", sharePct: 22, samples: 264_000, estateSharePct: 21 },
  { dimension: "Link distances", key: "2-5km", label: "2 to 5 km", sharePct: 34, samples: 408_000, estateSharePct: 33 },
  { dimension: "Link distances", key: "5-10km", label: "5 to 10 km", sharePct: 29, samples: 348_000, estateSharePct: 30 },
  { dimension: "Link distances", key: "10km", label: "Over 10 km", sharePct: 15, samples: 180_000, estateSharePct: 16 },

  { dimension: "Environmental conditions", key: "clear", label: "Clear", sharePct: 41, samples: 492_000, estateSharePct: 44 },
  { dimension: "Environmental conditions", key: "fog", label: "Fog and haze", sharePct: 21, samples: 252_000, estateSharePct: 18 },
  { dimension: "Environmental conditions", key: "rain", label: "Rain", sharePct: 19, samples: 228_000, estateSharePct: 18 },
  { dimension: "Environmental conditions", key: "dust", label: "Dust and particulate", sharePct: 11, samples: 132_000, estateSharePct: 12 },
  { dimension: "Environmental conditions", key: "wind", label: "High wind", sharePct: 8, samples: 96_000, estateSharePct: 8 },

  { dimension: "Customer-service types", key: "enterprise", label: "Enterprise access", sharePct: 34, samples: 408_000, estateSharePct: 33 },
  { dimension: "Customer-service types", key: "backhaul", label: "Metro backhaul", sharePct: 39, samples: 468_000, estateSharePct: 39 },
  { dimension: "Customer-service types", key: "carrier", label: "Carrier transit", sharePct: 18, samples: 216_000, estateSharePct: 19 },
  { dimension: "Customer-service types", key: "public", label: "Public connectivity", sharePct: 9, samples: 108_000, estateSharePct: 9 },

  { dimension: "Risk classes", key: "normal", label: "Normal", sharePct: 72, samples: 864_000, estateSharePct: 83 },
  { dimension: "Risk classes", key: "watch", label: "Watch", sharePct: 16, samples: 192_000, estateSharePct: 11 },
  { dimension: "Risk classes", key: "moderate", label: "Moderate Risk", sharePct: 7, samples: 84_000, estateSharePct: 4 },
  { dimension: "Risk classes", key: "high", label: "High Risk", sharePct: 4, samples: 48_000, estateSharePct: 1.6 },
  { dimension: "Risk classes", key: "impact", label: "Customer Impact", sharePct: 1, samples: 12_000, estateSharePct: 0.4 },

  { dimension: "Incident severities", key: "sev1", label: "Severity 1", sharePct: 3, samples: 36_000, estateSharePct: 2 },
  { dimension: "Incident severities", key: "sev2", label: "Severity 2", sharePct: 9, samples: 108_000, estateSharePct: 7 },
  { dimension: "Incident severities", key: "sev3", label: "Severity 3", sharePct: 24, samples: 288_000, estateSharePct: 22 },
  { dimension: "Incident severities", key: "sev4", label: "Severity 4 and informational", sharePct: 64, samples: 768_000, estateSharePct: 69 },

  { dimension: "Fallback configurations", key: "dual", label: "Dual optical path", sharePct: 31, samples: 372_000, estateSharePct: 30 },
  { dimension: "Fallback configurations", key: "rf", label: "RF fallback", sharePct: 26, samples: 312_000, estateSharePct: 25 },
  { dimension: "Fallback configurations", key: "fiber", label: "Fiber fallback", sharePct: 22, samples: 264_000, estateSharePct: 23 },
  { dimension: "Fallback configurations", key: "none", label: "No fallback", sharePct: 21, samples: 252_000, estateSharePct: 22 },

  { dimension: "Firmware cohorts", key: "fw-8", label: "Firmware 8.x", sharePct: 46, samples: 552_000, estateSharePct: 42 },
  { dimension: "Firmware cohorts", key: "fw-9", label: "Firmware 9.x", sharePct: 38, samples: 456_000, estateSharePct: 39 },
  { dimension: "Firmware cohorts", key: "fw-10", label: "Firmware 10.x", sharePct: 16, samples: 192_000, estateSharePct: 19 },

  { dimension: "Site types", key: "rooftop", label: "Rooftop", sharePct: 44, samples: 528_000, estateSharePct: 43 },
  { dimension: "Site types", key: "tower", label: "Tower", sharePct: 29, samples: 348_000, estateSharePct: 29 },
  { dimension: "Site types", key: "mast", label: "Mast and pole", sharePct: 17, samples: 204_000, estateSharePct: 18 },
  { dimension: "Site types", key: "ground", label: "Ground enclosure", sharePct: 10, samples: 120_000, estateSharePct: 10 },
];

export const coverageDimensions = [
  "Regions",
  "Products",
  "Link distances",
  "Environmental conditions",
  "Customer-service types",
  "Risk classes",
  "Incident severities",
  "Fallback configurations",
  "Firmware cohorts",
  "Site types",
] as const;

export const classBalance: ClassBalanceRecord[] = [
  { key: "normal", label: "Normal", naturalPct: 83, trainingPct: 72, technique: "Down-sampled with stratified retention" },
  { key: "watch", label: "Watch", naturalPct: 11, trainingPct: 16, technique: "Mild oversampling" },
  { key: "moderate", label: "Moderate Risk", naturalPct: 4, trainingPct: 7, technique: "Weighted loss" },
  { key: "high", label: "High Risk", naturalPct: 1.6, trainingPct: 4, technique: "Rare-event oversampling" },
  { key: "impact", label: "Customer Impact", naturalPct: 0.4, trainingPct: 1, technique: "Rare-event preservation with hard negatives" },
];

export const samplingStrategies: SamplingStrategyRecord[] = [
  { key: "weighted-loss", label: "Weighted loss", detail: "Customer-impact class weighted 12x against the normal class." },
  { key: "stratified", label: "Stratified sampling", detail: "Every region, product and risk class retains a minimum sample floor." },
  { key: "region-split", label: "Region-aware splits", detail: "Validation regions are held out whole to expose regional generalisation." },
  { key: "time-holdout", label: "Time-based holdout", detail: "Final holdout is strictly later than every training sample." },
  { key: "rare-event", label: "Rare-event preservation", detail: "No customer-impact event is dropped by sampling." },
  { key: "hard-negative", label: "Hard-negative sampling", detail: "Near-miss conditions that did not degrade are retained to control false positives." },
  { key: "no-leakage", label: "No leakage across related incidents", detail: "Incident families stay on one side of the split." },
  { key: "temporal-weighting", label: "Temporal weighting", detail: "Recent seasons weighted 1.4x to track current atmospheric behaviour." },
  { key: "regional-weighting", label: "Regional weighting", detail: "Under-represented regions weighted up to their estate share." },
  { key: "product-weighting", label: "Product weighting", detail: "Beam weighted up to offset its smaller deployed base." },
  { key: "holdout-exclusion", label: "Holdout exclusions", detail: "Holdout links and their peers are excluded from training entirely." },
];

export const classBalanceRationale =
  "The model must learn rare degradation events without overstating their frequency in production. Sampling amplifies rare classes for learnability while calibration is measured against the natural event distribution.";

export const dataQuality: DataQualityRecord[] = [
  { key: "missing", label: "Missing values", affectedPct: 1.7, treatment: "Imputed", note: "Forward-filled within a 10 minute window, otherwise excluded." },
  { key: "stale", label: "Stale telemetry", affectedPct: 0.8, treatment: "Down-weighted", note: "Samples older than the polling interval carry reduced weight." },
  { key: "outliers", label: "Outliers", affectedPct: 0.5, treatment: "Retained with quality feature", note: "Physically plausible extremes are kept and flagged as a feature." },
  { key: "duplicates", label: "Duplicate events", affectedPct: 0.3, treatment: "Excluded", note: "De-duplicated on link, driver and event window." },
  { key: "time-alignment", label: "Time-alignment errors", affectedPct: 0.4, treatment: "Imputed", note: "Re-aligned to the optical telemetry clock." },
  { key: "source-conflicts", label: "Source conflicts", affectedPct: 0.6, treatment: "Flagged", note: "Weather-source disagreement resolved by confidence ranking." },
  { key: "invalid-units", label: "Invalid units", affectedPct: 0.2, treatment: "Excluded", note: "Unit-check failures are removed before feature engineering." },
  { key: "topology", label: "Incomplete service topology", affectedPct: 0.9, treatment: "Down-weighted", note: "Impact features degrade gracefully when topology is partial." },
  { key: "outcomes", label: "Incomplete outcome labels", affectedPct: 1.1, treatment: "Excluded", note: "Events without confirmed outcomes are not used as labels." },
  { key: "low-confidence", label: "Low-confidence labels", affectedPct: 0.7, treatment: "Retained with quality feature", note: "Label confidence is exposed to the loss function." },
];

export const trainingProvenance: TrainingProvenanceRecord[] = [
  { id: "prov-optical", source: "Optical terminal telemetry", owner: "Optical Engineering", collectionPeriod: "Jan 2024 – Jun 2026", schemaVersion: "opt-telemetry-4.2", transformationVersion: "xform-2026.06", qualityResult: "98.4% complete", lineageStatus: "Complete", approvalStatus: "Approved", retention: "36 months", region: "Global" },
  { id: "prov-weather", source: "Atmospheric observation and forecast feed", owner: "Weather Intelligence", collectionPeriod: "Jan 2024 – Jun 2026", schemaVersion: "wx-obs-3.1", transformationVersion: "xform-2026.06", qualityResult: "96.1% complete", lineageStatus: "Complete", approvalStatus: "Approved", retention: "24 months", region: "Global" },
  { id: "prov-network", source: "Network performance collectors", owner: "Network Engineering", collectionPeriod: "Jan 2024 – Jun 2026", schemaVersion: "net-perf-2.7", transformationVersion: "xform-2026.06", qualityResult: "97.8% complete", lineageStatus: "Complete", approvalStatus: "Approved", retention: "18 months", region: "Global" },
  { id: "prov-incidents", source: "Incident and outcome records", owner: "SRE Operations", collectionPeriod: "Jan 2024 – Jun 2026", schemaVersion: "inc-2.0", transformationVersion: "xform-2026.06", qualityResult: "94.6% labelled", lineageStatus: "Complete", approvalStatus: "Conditional", retention: "60 months", region: "Global" },
  { id: "prov-service", source: "Customer service topology", owner: "Service Assurance", collectionPeriod: "Jan 2024 – Jun 2026", schemaVersion: "svc-topo-1.9", transformationVersion: "xform-2026.06", qualityResult: "92.3% complete", lineageStatus: "Partial", approvalStatus: "Conditional", retention: "24 months", region: "Global" },
  { id: "prov-firmware", source: "Firmware and site registry", owner: "Platform Engineering", collectionPeriod: "Jan 2024 – Jun 2026", schemaVersion: "fw-reg-1.4", transformationVersion: "xform-2026.06", qualityResult: "99.1% complete", lineageStatus: "Complete", approvalStatus: "Approved", retention: "36 months", region: "Global" },
];

/* -------------------------------- validation ------------------------------ */

export const validationSummary: ValidationSummaryMetric[] = [
  { key: "accuracy", label: "Operational Prediction Accuracy", value: 94.1, unit: "%", target: 92, higherIsBetter: true, description: "Share of predictions confirmed by observed link behaviour." },
  { key: "preventive", label: "Correct Preventive Action Rate", value: 93.2, unit: "%", target: 90, higherIsBetter: true, description: "Preventive actions that matched the correct protective decision." },
  { key: "impact-recall", label: "Customer-Impact Events Predicted", value: 91.8, unit: "%", target: 90, higherIsBetter: true, description: "Customer-impacting degradations predicted before impact." },
  { key: "protection", label: "Service Protection Effectiveness", value: 92.5, unit: "%", target: 88, higherIsBetter: true, description: "Predicted events where customer service was protected." },
  { key: "false-positive", label: "False Positive Rate", value: 2.8, unit: "%", target: 4, higherIsBetter: false, description: "Predicted degradations that did not occur." },
  { key: "lead-time-error", label: "Mean Lead-Time Error", value: 28, unit: "min", target: 45, higherIsBetter: false, description: "Mean absolute error between predicted and observed onset." },
  { key: "coverage", label: "Model Coverage", value: 98.6, unit: "%", target: 95, higherIsBetter: true, description: "Links with a complete feature vector available for prediction." },
  { key: "calibration", label: "Calibration Error", value: 1.9, unit: "%", target: 3, higherIsBetter: false, description: "Difference between predicted probability and observed frequency." },
];

export const validationSegments: ValidationSegment[] = [
  { id: "seg-south-asia", dimension: "Region", label: "South Asia", samples: 96_400, accuracyPct: 95.0, falsePositivePct: 2.4, missedEventPct: 3.1, meanWarningMinutes: 354, calibrationErrorPct: 1.6, critical: true },
  { id: "seg-southeast-asia", dimension: "Region", label: "Southeast Asia", samples: 64_200, accuracyPct: 94.2, falsePositivePct: 2.9, missedEventPct: 3.6, meanWarningMinutes: 341, calibrationErrorPct: 1.8, critical: true },
  { id: "seg-africa", dimension: "Region", label: "Africa", samples: 58_900, accuracyPct: 92.8, falsePositivePct: 3.5, missedEventPct: 4.4, meanWarningMinutes: 311, calibrationErrorPct: 2.4, critical: true },
  { id: "seg-europe", dimension: "Region", label: "Europe", samples: 48_100, accuracyPct: 95.6, falsePositivePct: 2.1, missedEventPct: 2.7, meanWarningMinutes: 366, calibrationErrorPct: 1.4, critical: false },
  { id: "seg-north-america", dimension: "Region", label: "North America", samples: 44_800, accuracyPct: 95.1, falsePositivePct: 2.3, missedEventPct: 2.9, meanWarningMinutes: 372, calibrationErrorPct: 1.5, critical: false },
  { id: "seg-south-america", dimension: "Region", label: "South America", samples: 38_600, accuracyPct: 93.4, falsePositivePct: 3.1, missedEventPct: 3.9, meanWarningMinutes: 328, calibrationErrorPct: 2.1, critical: false },

  { id: "seg-lightbridge", dimension: "Product", label: "Lightbridge", samples: 168_300, accuracyPct: 94.8, falsePositivePct: 2.5, missedEventPct: 3.2, meanWarningMinutes: 358, calibrationErrorPct: 1.7, critical: true },
  { id: "seg-lightbridge-pro", dimension: "Product", label: "Lightbridge Pro", samples: 129_700, accuracyPct: 95.3, falsePositivePct: 2.2, missedEventPct: 2.8, meanWarningMinutes: 369, calibrationErrorPct: 1.5, critical: true },
  { id: "seg-beam", dimension: "Product", label: "Beam", samples: 52_600, accuracyPct: 89.6, falsePositivePct: 4.8, missedEventPct: 6.2, meanWarningMinutes: 259, calibrationErrorPct: 3.4, critical: false },

  { id: "seg-h2", dimension: "Forecast horizon", label: "2 hours", samples: 88_000, accuracyPct: 96.4, falsePositivePct: 1.9, missedEventPct: 2.2, meanWarningMinutes: 118, calibrationErrorPct: 1.2, critical: false },
  { id: "seg-h6", dimension: "Forecast horizon", label: "6 hours", samples: 92_400, accuracyPct: 94.6, falsePositivePct: 2.6, missedEventPct: 3.1, meanWarningMinutes: 331, calibrationErrorPct: 1.7, critical: true },
  { id: "seg-h12", dimension: "Forecast horizon", label: "12 hours", samples: 84_100, accuracyPct: 92.7, falsePositivePct: 3.4, missedEventPct: 4.2, meanWarningMinutes: 604, calibrationErrorPct: 2.3, critical: false },
  { id: "seg-h24", dimension: "Forecast horizon", label: "24 hours", samples: 76_200, accuracyPct: 90.4, falsePositivePct: 4.2, missedEventPct: 5.6, meanWarningMinutes: 1_142, calibrationErrorPct: 3.1, critical: false },

  { id: "seg-dist-short", dimension: "Link distance", label: "Under 2 km", samples: 66_300, accuracyPct: 96.1, falsePositivePct: 2.0, missedEventPct: 2.4, meanWarningMinutes: 372, calibrationErrorPct: 1.3, critical: false },
  { id: "seg-dist-mid", dimension: "Link distance", label: "2 to 5 km", samples: 102_400, accuracyPct: 94.7, falsePositivePct: 2.6, missedEventPct: 3.2, meanWarningMinutes: 349, calibrationErrorPct: 1.7, critical: false },
  { id: "seg-dist-long", dimension: "Link distance", label: "5 to 10 km", samples: 88_700, accuracyPct: 93.1, falsePositivePct: 3.2, missedEventPct: 4.1, meanWarningMinutes: 318, calibrationErrorPct: 2.2, critical: false },
  { id: "seg-dist-xlong", dimension: "Link distance", label: "Over 10 km", samples: 43_200, accuracyPct: 91.2, falsePositivePct: 4.1, missedEventPct: 5.3, meanWarningMinutes: 286, calibrationErrorPct: 2.9, critical: false },

  { id: "seg-fog", dimension: "Weather driver", label: "Fog and haze", samples: 61_800, accuracyPct: 95.4, falsePositivePct: 2.2, missedEventPct: 2.9, meanWarningMinutes: 384, calibrationErrorPct: 1.5, critical: true },
  { id: "seg-rain", dimension: "Weather driver", label: "Rain", samples: 56_400, accuracyPct: 93.8, falsePositivePct: 3.0, missedEventPct: 3.7, meanWarningMinutes: 296, calibrationErrorPct: 2.0, critical: false },
  { id: "seg-dust", dimension: "Weather driver", label: "Dust and particulate", samples: 28_900, accuracyPct: 91.4, falsePositivePct: 4.0, missedEventPct: 5.1, meanWarningMinutes: 268, calibrationErrorPct: 2.8, critical: false },
  { id: "seg-wind", dimension: "Weather driver", label: "High wind", samples: 18_600, accuracyPct: 90.8, falsePositivePct: 4.3, missedEventPct: 5.4, meanWarningMinutes: 241, calibrationErrorPct: 3.0, critical: false },

  { id: "seg-risk-high", dimension: "Risk class", label: "High Risk", samples: 12_400, accuracyPct: 93.6, falsePositivePct: 3.2, missedEventPct: 4.0, meanWarningMinutes: 302, calibrationErrorPct: 2.2, critical: true },
  { id: "seg-risk-impact", dimension: "Risk class", label: "Customer Impact", samples: 3_100, accuracyPct: 91.8, falsePositivePct: 3.8, missedEventPct: 5.0, meanWarningMinutes: 288, calibrationErrorPct: 2.6, critical: true },

  { id: "seg-crit-high", dimension: "Customer-service criticality", label: "Business critical", samples: 71_200, accuracyPct: 95.2, falsePositivePct: 2.3, missedEventPct: 2.9, meanWarningMinutes: 361, calibrationErrorPct: 1.6, critical: true },
  { id: "seg-crit-standard", dimension: "Customer-service criticality", label: "Standard", samples: 94_600, accuracyPct: 93.9, falsePositivePct: 2.8, missedEventPct: 3.4, meanWarningMinutes: 344, calibrationErrorPct: 1.9, critical: false },

  { id: "seg-fallback-dual", dimension: "Fallback configuration", label: "Dual optical path", samples: 58_400, accuracyPct: 95.0, falsePositivePct: 2.4, missedEventPct: 3.0, meanWarningMinutes: 357, calibrationErrorPct: 1.6, critical: false },
  { id: "seg-fallback-none", dimension: "Fallback configuration", label: "No fallback", samples: 41_900, accuracyPct: 93.2, falsePositivePct: 3.1, missedEventPct: 3.8, meanWarningMinutes: 332, calibrationErrorPct: 2.1, critical: true },

  { id: "seg-fw8", dimension: "Firmware cohort", label: "Firmware 8.x", samples: 84_500, accuracyPct: 94.9, falsePositivePct: 2.4, missedEventPct: 3.0, meanWarningMinutes: 356, calibrationErrorPct: 1.6, critical: false },
  { id: "seg-fw10", dimension: "Firmware cohort", label: "Firmware 10.x", samples: 1_800, accuracyPct: 90.1, falsePositivePct: 4.6, missedEventPct: 5.8, meanWarningMinutes: 262, calibrationErrorPct: 3.2, critical: false },

  { id: "seg-dq-high", dimension: "Data-quality band", label: "High quality inputs", samples: 188_400, accuracyPct: 95.6, falsePositivePct: 2.1, missedEventPct: 2.6, meanWarningMinutes: 368, calibrationErrorPct: 1.4, critical: false },
  { id: "seg-dq-low", dimension: "Data-quality band", label: "Degraded inputs", samples: 22_700, accuracyPct: 88.4, falsePositivePct: 5.2, missedEventPct: 6.9, meanWarningMinutes: 224, calibrationErrorPct: 3.9, critical: false },
];

export const validationSplits: ValidationSplit[] = [
  { key: "Training", label: "Training", window: "Jan 2024 – Dec 2025", samples: 864_000, sharePct: 72 },
  { key: "Validation", label: "Validation", window: "Jan 2026 – Apr 2026", samples: 216_000, sharePct: 18 },
  { key: "Final Holdout", label: "Final Holdout", window: "May 2026 – Jun 2026", samples: 120_000, sharePct: 10 },
];

export const holdoutRules = [
  "Time-based holdout, no training sample is later than any holdout sample",
  "Region-aware separation, holdout regions are evaluated whole",
  "Incident-family isolation, related incidents stay on one side of the split",
  "No leakage from future telemetry into engineered features",
  "No link-level leakage where a link appears in both sides",
  "Product-cohort holdout for Beam and Firmware 10.x",
  "Rare-event preservation, every customer-impact event is retained",
];

export const validationResult: ValidationResult = {
  version: "v2.4.1",
  summary: validationSummary,
  segments: validationSegments,
  splits: validationSplits,
  holdoutRules,
};

export const validationViews = [
  "Holdout Performance",
  "Cross-Region Validation",
  "Cross-Product Validation",
  "Rare-Event Validation",
  "Calibration",
  "Error Distribution",
  "Threshold Tradeoff",
  "Customer-Impact Validation",
  "Lead-Time Validation",
] as const;

export type ValidationView = (typeof validationViews)[number];

export const releaseGates: ModelReleaseGate[] = [
  { id: "gate-accuracy", label: "Operational accuracy above 92%", target: "> 92%", targetValue: 92, actualValue: 94.1, unit: "%", higherIsBetter: true, critical: true, evidence: "Holdout validation report VR-2026-06", reviewer: "Applied ML", reviewDate: "2026-07-02" },
  { id: "gate-fp", label: "False positive rate below 4%", target: "< 4%", targetValue: 4, actualValue: 2.8, unit: "%", higherIsBetter: false, critical: true, evidence: "Holdout validation report VR-2026-06", reviewer: "Applied ML", reviewDate: "2026-07-02" },
  { id: "gate-recall", label: "Customer-impact event recall above 90%", target: "> 90%", targetValue: 90, actualValue: 91.8, unit: "%", higherIsBetter: true, critical: true, evidence: "Rare-event validation set RE-2026-06", reviewer: "SRE Operations", reviewDate: "2026-07-03" },
  { id: "gate-warning", label: "Mean warning time above 4 hours", target: "> 240 min", targetValue: 240, actualValue: 342, unit: "min", higherIsBetter: true, critical: true, evidence: "Lead-time validation LT-2026-06", reviewer: "Optical Engineering", reviewDate: "2026-07-03" },
  { id: "gate-calibration", label: "Calibration error below 3%", target: "< 3%", targetValue: 3, actualValue: 1.9, unit: "%", higherIsBetter: false, critical: false, evidence: "Calibration study CAL-2026-06", reviewer: "Applied ML", reviewDate: "2026-07-02" },
  { id: "gate-region", label: "No failing critical region", target: "0 failing", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Cross-region validation matrix", reviewer: "SRE Operations", reviewDate: "2026-07-04" },
  { id: "gate-product", label: "No failing critical product", target: "0 failing", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Cross-product validation matrix", reviewer: "SRE Operations", reviewDate: "2026-07-04" },
  { id: "gate-explainability", label: "Explainability evidence complete", target: "Complete", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Explainability validation EX-2026-06", reviewer: "Applied ML", reviewDate: "2026-07-05" },
  { id: "gate-security", label: "Security review complete", target: "Complete", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Synthetic platform security review record", reviewer: "Platform Security", reviewDate: "2026-07-06" },
  { id: "gate-rollback", label: "Rollback version available", target: "Available", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Rollback readiness test RB-2026-06", reviewer: "Deployment Engineering", reviewDate: "2026-07-06" },
];

/** Candidate v2.5.0 gates: intentionally shows one soft failure and one review. */
export const candidateReleaseGates: ModelReleaseGate[] = [
  { id: "cand-accuracy", label: "Operational accuracy above 92%", target: "> 92%", targetValue: 92, actualValue: 95.2, unit: "%", higherIsBetter: true, critical: true, evidence: "Candidate holdout report VR-2026-07C", reviewer: "Applied ML", reviewDate: "2026-07-28" },
  { id: "cand-fp", label: "False positive rate below 4%", target: "< 4%", targetValue: 4, actualValue: 2.4, unit: "%", higherIsBetter: false, critical: true, evidence: "Candidate holdout report VR-2026-07C", reviewer: "Applied ML", reviewDate: "2026-07-28" },
  { id: "cand-recall", label: "Customer-impact event recall above 90%", target: "> 90%", targetValue: 90, actualValue: 92.9, unit: "%", higherIsBetter: true, critical: true, evidence: "Candidate rare-event set RE-2026-07C", reviewer: "SRE Operations", reviewDate: "2026-07-29" },
  { id: "cand-warning", label: "Mean warning time above 4 hours", target: "> 240 min", targetValue: 240, actualValue: 366, unit: "min", higherIsBetter: true, critical: true, evidence: "Candidate lead-time study LT-2026-07C", reviewer: "Optical Engineering", reviewDate: "2026-07-29" },
  { id: "cand-calibration", label: "Calibration error below 3%", target: "< 3%", targetValue: 3, actualValue: 2.9, unit: "%", higherIsBetter: false, critical: false, evidence: "Candidate calibration study CAL-2026-07C", reviewer: "Applied ML", reviewDate: "2026-07-28" },
  { id: "cand-region", label: "No failing critical region", target: "0 failing", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Candidate cross-region matrix", reviewer: "SRE Operations", reviewDate: "2026-07-30" },
  { id: "cand-product", label: "No failing critical product", target: "0 failing", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Candidate cross-product matrix", reviewer: "SRE Operations", reviewDate: "2026-07-30" },
  { id: "cand-explainability", label: "Explainability evidence complete", target: "Complete", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Candidate explainability EX-2026-07C", reviewer: "Applied ML", reviewDate: "2026-07-31" },
  { id: "cand-security", label: "Security review complete", target: "Complete", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Synthetic platform security review record", reviewer: "Platform Security", reviewDate: "2026-08-01" },
  { id: "cand-rollback", label: "Rollback version available", target: "Available", targetValue: 1, actualValue: 1, unit: "boolean", higherIsBetter: true, critical: true, evidence: "Candidate rollback test RB-2026-07C", reviewer: "Deployment Engineering", reviewDate: "2026-08-01" },
];

/* ------------------------------- backtesting ------------------------------ */

const backtestMonths = ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026"] as const;

function buildSeries(
  version: string,
  base: { accuracy: number; recall: number; fp: number; warning: number; effectiveness: number },
  step: { accuracy: number; recall: number; fp: number; warning: number; effectiveness: number },
): BacktestSeries {
  return {
    version,
    region: "All regions",
    product: "All products",
    points: backtestMonths.map((month, index) => ({
      month,
      accuracyPct: Number((base.accuracy + step.accuracy * index).toFixed(2)),
      customerImpactRecallPct: Number((base.recall + step.recall * index).toFixed(2)),
      falsePositivePct: Number((base.fp + step.fp * index).toFixed(2)),
      meanWarningMinutes: Math.round(base.warning + step.warning * index),
      preventiveEffectivenessPct: Number((base.effectiveness + step.effectiveness * index).toFixed(2)),
    })),
  };
}

export const backtestSeriesByVersion: Record<string, BacktestSeries> = {
  "v2.3.0": buildSeries("v2.3.0", { accuracy: 89.4, recall: 85.1, fp: 5.2, warning: 254, effectiveness: 82.1 }, { accuracy: 0.18, recall: 0.22, fp: -0.06, warning: 3, effectiveness: 0.24 }),
  "v2.3.5": buildSeries("v2.3.5", { accuracy: 90.8, recall: 86.9, fp: 4.6, warning: 271, effectiveness: 84.6 }, { accuracy: 0.22, recall: 0.26, fp: -0.08, warning: 4, effectiveness: 0.3 }),
  "v2.4.0": buildSeries("v2.4.0", { accuracy: 92.4, recall: 89.2, fp: 3.6, warning: 306, effectiveness: 88.3 }, { accuracy: 0.26, recall: 0.3, fp: -0.1, warning: 5, effectiveness: 0.34 }),
  "v2.4.1": buildSeries("v2.4.1", { accuracy: 93.1, recall: 90.3, fp: 3.2, warning: 322, effectiveness: 90.1 }, { accuracy: 0.24, recall: 0.32, fp: -0.09, warning: 5, effectiveness: 0.36 }),
  "v2.5.0 Candidate": buildSeries("v2.5.0 Candidate", { accuracy: 94.2, recall: 91.6, fp: 2.8, warning: 348, effectiveness: 91.4 }, { accuracy: 0.24, recall: 0.3, fp: -0.08, warning: 5, effectiveness: 0.32 }),
};

export const backtestAnnotations: BacktestAnnotation[] = [
  { id: "ann-retrain", month: "Mar 2026", kind: "Model retraining", summary: "Retrained on the 2026.03 corpus with expanded fog labels." },
  { id: "ann-threshold", month: "Mar 2026", kind: "Threshold change", summary: "Alert threshold moved from 0.78 to 0.80 to reduce false positives." },
  { id: "ann-weather", month: "Apr 2026", kind: "Weather-source outage", summary: "Primary visibility feed unavailable for 14 hours in South Asia." },
  { id: "ann-firmware", month: "Apr 2026", kind: "Firmware cohort addition", summary: "Firmware 10.x cohort entered the estate with limited training support." },
  { id: "ann-dq", month: "May 2026", kind: "Data-quality incident", summary: "Time-alignment defect in one network collector, samples down-weighted." },
  { id: "ann-promotion", month: "Jun 2026", kind: "Model promotion", summary: "v2.4.1 promoted to active after governance review." },
  { id: "ann-rollback", month: "Jun 2026", kind: "Rollback test", summary: "Scheduled rollback rehearsal to v2.4.0 completed in 11 minutes." },
  { id: "ann-regional", month: "Jul 2026", kind: "Major regional event", summary: "Extended coastal fog event across the Chennai metro." },
];

export const backtestEvents: BacktestEvent[] = [
  { id: "bt-1", event: "Chennai metro fog attenuation", region: "South Asia", linkId: "CHN-OLT-014", date: "2026-07-18", driver: "Fog and visibility collapse", predictionScore: 0.91, predictedEta: "05h 40m before onset", actualOutcome: "Degradation observed as predicted", actionTaken: "Preventive reroute to fiber fallback", customerImpact: "None", classification: "Correct Prediction", evidenceQuality: "Complete" },
  { id: "bt-2", event: "Mumbai coastal rain fade", region: "South Asia", linkId: "MUM-OLT-007", date: "2026-07-11", driver: "Rain intensity", predictionScore: 0.84, predictedEta: "04h 05m before onset", actualOutcome: "Degradation observed", actionTaken: "Capacity pre-shift", customerImpact: "None", classification: "Correct Prediction", evidenceQuality: "Complete" },
  { id: "bt-3", event: "Nairobi dust scattering alert", region: "Africa", linkId: "NBO-OLT-022", date: "2026-07-04", driver: "Particulate load", predictionScore: 0.79, predictedEta: "03h 20m before onset", actualOutcome: "No measurable degradation", actionTaken: "Watch only", customerImpact: "None", classification: "False Positive", evidenceQuality: "Complete" },
  { id: "bt-4", event: "Jakarta humidity swing", region: "Southeast Asia", linkId: "JKT-OLT-009", date: "2026-06-27", driver: "Humidity and haze", predictionScore: 0.42, predictedEta: "Not predicted", actualOutcome: "Unexpected degradation", actionTaken: "Reactive protection", customerImpact: "12 services degraded 8 minutes", classification: "Missed Event", evidenceQuality: "Partial" },
  { id: "bt-5", event: "Frankfurt clear-sky baseline", region: "Europe", linkId: "FRA-OLT-003", date: "2026-06-21", driver: "None", predictionScore: 0.06, predictedEta: "No risk predicted", actualOutcome: "Stable", actionTaken: "None", customerImpact: "None", classification: "Correct No-Risk", evidenceQuality: "Complete" },
  { id: "bt-6", event: "Lagos firmware cohort anomaly", region: "Africa", linkId: "LOS-OLT-031", date: "2026-06-14", driver: "Beam lock instability", predictionScore: 0.63, predictedEta: "01h 55m before onset", actualOutcome: "Partial degradation", actionTaken: "Engineering review", customerImpact: "None", classification: "Insufficient Evidence", evidenceQuality: "Missing" },
  { id: "bt-7", event: "São Paulo storm front", region: "South America", linkId: "SAO-OLT-018", date: "2026-06-02", driver: "Rain and wind", predictionScore: 0.88, predictedEta: "04h 45m before onset", actualOutcome: "Degradation observed", actionTaken: "Preventive reroute", customerImpact: "None", classification: "Correct Prediction", evidenceQuality: "Complete" },
  { id: "bt-8", event: "Chicago winter haze", region: "North America", linkId: "ORD-OLT-011", date: "2026-05-24", driver: "Visibility reduction", predictionScore: 0.74, predictedEta: "03h 10m before onset", actualOutcome: "Marginal degradation", actionTaken: "Threshold watch", customerImpact: "None", classification: "Correct Prediction", evidenceQuality: "Complete" },
  { id: "bt-9", event: "Hanoi monsoon burst", region: "Southeast Asia", linkId: "HAN-OLT-005", date: "2026-05-12", driver: "Rain intensity", predictionScore: 0.81, predictedEta: "02h 50m before onset", actualOutcome: "No degradation", actionTaken: "Preventive reroute", customerImpact: "None", classification: "False Positive", evidenceQuality: "Complete" },
  { id: "bt-10", event: "Chennai secondary span", region: "South Asia", linkId: "CHN-OLT-021", date: "2026-05-03", driver: "Fog", predictionScore: 0.93, predictedEta: "06h 10m before onset", actualOutcome: "Degradation observed", actionTaken: "Preventive reroute", customerImpact: "None", classification: "Correct Prediction", evidenceQuality: "Complete" },
];

/* ------------------------------ explainability ---------------------------- */

export const explainabilityRecords: ExplainabilityValidationRecord[] = [
  { id: "ex-1", predictionId: "PRD-88401", linkId: "CHN-OLT-014", primaryFactor: "Visibility to distance ratio", evidenceCompletenessPct: 99, factorStabilityPct: 96, humanAgreement: "Agree", ruleOverride: false, supportingEvidence: ["Visibility forecast collapse", "Historical fog analogue", "Optical margin decline"], contradictingEvidence: [], missingEvidence: [], explanationConfidencePct: 94, explanationLatencyMs: 780 },
  { id: "ex-2", predictionId: "PRD-88407", linkId: "MUM-OLT-007", primaryFactor: "Atmospheric attenuation index", evidenceCompletenessPct: 97, factorStabilityPct: 93, humanAgreement: "Agree", ruleOverride: false, supportingEvidence: ["Rain rate rising", "Received power trend"], contradictingEvidence: ["Fallback capacity healthy"], missingEvidence: [], explanationConfidencePct: 90, explanationLatencyMs: 920 },
  { id: "ex-3", predictionId: "PRD-88422", linkId: "NBO-OLT-022", primaryFactor: "Multi-signal correlation", evidenceCompletenessPct: 91, factorStabilityPct: 84, humanAgreement: "Partial", ruleOverride: false, supportingEvidence: ["Particulate index rising"], contradictingEvidence: ["Optical margin stable", "No historical analogue"], missingEvidence: ["Local visibility sensor"], explanationConfidencePct: 72, explanationLatencyMs: 1_450 },
  { id: "ex-4", predictionId: "PRD-88433", linkId: "JKT-OLT-009", primaryFactor: "Link degradation rate", evidenceCompletenessPct: 88, factorStabilityPct: 79, humanAgreement: "Disagree", ruleOverride: true, supportingEvidence: ["Degradation slope"], contradictingEvidence: ["Weather feed shows clearing"], missingEvidence: ["Humidity profile", "Service topology"], explanationConfidencePct: 61, explanationLatencyMs: 2_310 },
  { id: "ex-5", predictionId: "PRD-88450", linkId: "FRA-OLT-003", primaryFactor: "Optical reserve margin", evidenceCompletenessPct: 100, factorStabilityPct: 98, humanAgreement: "Agree", ruleOverride: false, supportingEvidence: ["Stable margin", "Clear forecast"], contradictingEvidence: [], missingEvidence: [], explanationConfidencePct: 97, explanationLatencyMs: 540 },
  { id: "ex-6", predictionId: "PRD-88462", linkId: "SAO-OLT-018", primaryFactor: "Historical similarity score", evidenceCompletenessPct: 96, factorStabilityPct: 92, humanAgreement: "Agree", ruleOverride: false, supportingEvidence: ["Two matched storm analogues", "Wind loading"], contradictingEvidence: [], missingEvidence: [], explanationConfidencePct: 89, explanationLatencyMs: 1_120 },
  { id: "ex-7", predictionId: "PRD-88474", linkId: "LOS-OLT-031", primaryFactor: "Beam lock stability", evidenceCompletenessPct: 82, factorStabilityPct: 74, humanAgreement: "Partial", ruleOverride: true, supportingEvidence: ["Reacquisition count rising"], contradictingEvidence: ["Weather benign"], missingEvidence: ["Firmware 10.x baseline"], explanationConfidencePct: 58, explanationLatencyMs: 1_980 },
  { id: "ex-8", predictionId: "PRD-88489", linkId: "ORD-OLT-011", primaryFactor: "Visibility to distance ratio", evidenceCompletenessPct: 98, factorStabilityPct: 95, humanAgreement: "Agree", ruleOverride: false, supportingEvidence: ["Visibility trend", "Seasonal analogue"], contradictingEvidence: [], missingEvidence: [], explanationConfidencePct: 92, explanationLatencyMs: 860 },
];

export const explainabilityDimensions = [
  { key: "global-stability", label: "Global feature contribution stability", value: "95.4% rank stability across resamples" },
  { key: "link-consistency", label: "Selected-link contribution consistency", value: "Consistent primary factor across 9 of 10 runs" },
  { key: "similar-event", label: "Similar-event support", value: "88.2% of predictions have at least two analogues" },
  { key: "evidence-completeness", label: "Evidence completeness", value: "98.7% of predictions carry complete evidence" },
  { key: "contradicting", label: "Contradicting evidence", value: "Surfaced on 12.5% of predictions" },
  { key: "confidence", label: "Confidence contributors", value: "Evidence count, analogue strength, data quality" },
  { key: "missing", label: "Missing evidence", value: "Local sensors and firmware baselines are the common gaps" },
  { key: "overrides", label: "Engineering-rule overrides", value: "1.4% of predictions overridden by protection rules" },
  { key: "agreement", label: "Human-review agreement", value: "93.6% agreement with reviewing engineers" },
  { key: "latency", label: "Explanation latency", value: "99.1% of explanations generated within 2 seconds" },
];

export const similarEventSupportPct = 88.2;

/* ---------------------------------- drift --------------------------------- */

const driftMonths = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

function history(values: number[]): { month: string; score: number }[] {
  return driftMonths.map((month, i) => ({ month, score: values[i] ?? values[values.length - 1] ?? 0 }));
}

export const driftMetrics: DriftMetric[] = [
  {
    id: "drift-input", label: "Input Data Drift", category: "Input Data Drift", score: 0.12, threshold: 0.2, trend: "flat",
    scope: "All input feeds", operationalEffect: "No measurable change in prediction quality.",
    recommendedResponse: "Continue scheduled monitoring.", owner: "Applied ML", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 0,
    trainingDistribution: [{ bucket: "Low", sharePct: 52 }, { bucket: "Medium", sharePct: 33 }, { bucket: "High", sharePct: 15 }],
    currentDistribution: [{ bucket: "Low", sharePct: 48 }, { bucket: "Medium", sharePct: 36 }, { bucket: "High", sharePct: 16 }],
    history: history([0.09, 0.1, 0.11, 0.11, 0.12, 0.12]),
  },
  {
    id: "drift-feature", label: "Feature Drift", category: "Feature Drift", score: 0.15, threshold: 0.22, trend: "rising",
    scope: "Atmospheric attenuation index", operationalEffect: "Slightly wider feature spread in coastal regions.",
    recommendedResponse: "Monitor and re-check after the monsoon window.", owner: "Applied ML", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 320,
    trainingDistribution: [{ bucket: "Low", sharePct: 44 }, { bucket: "Medium", sharePct: 38 }, { bucket: "High", sharePct: 18 }],
    currentDistribution: [{ bucket: "Low", sharePct: 39 }, { bucket: "Medium", sharePct: 39 }, { bucket: "High", sharePct: 22 }],
    history: history([0.1, 0.11, 0.12, 0.13, 0.14, 0.15]),
  },
  {
    id: "drift-prediction", label: "Prediction Drift", category: "Prediction Drift", score: 0.11, threshold: 0.2, trend: "flat",
    scope: "Risk score distribution", operationalEffect: "Prediction volume stable against the training baseline.",
    recommendedResponse: "No action.", owner: "SRE Data Science", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 0,
    trainingDistribution: [{ bucket: "Normal", sharePct: 72 }, { bucket: "Watch", sharePct: 16 }, { bucket: "Risk", sharePct: 12 }],
    currentDistribution: [{ bucket: "Normal", sharePct: 70 }, { bucket: "Watch", sharePct: 17 }, { bucket: "Risk", sharePct: 13 }],
    history: history([0.12, 0.12, 0.11, 0.11, 0.11, 0.11]),
  },
  {
    id: "drift-calibration", label: "Calibration Drift", category: "Calibration Drift", score: 0.08, threshold: 0.15, trend: "falling",
    scope: "Probability calibration", operationalEffect: "Predicted probabilities still match observed frequency.",
    recommendedResponse: "No action.", owner: "Applied ML", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 0,
    trainingDistribution: [{ bucket: "0-0.3", sharePct: 60 }, { bucket: "0.3-0.7", sharePct: 27 }, { bucket: "0.7-1", sharePct: 13 }],
    currentDistribution: [{ bucket: "0-0.3", sharePct: 62 }, { bucket: "0.3-0.7", sharePct: 26 }, { bucket: "0.7-1", sharePct: 12 }],
    history: history([0.11, 0.1, 0.1, 0.09, 0.09, 0.08]),
  },
  {
    id: "drift-region", label: "Regional Drift", category: "Regional Drift", score: 0.17, threshold: 0.22, trend: "rising",
    scope: "Africa", operationalEffect: "Regional feature mix moving away from training population.",
    recommendedResponse: "Increase African sampling in the next corpus.", owner: "SRE Data Science", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 210,
    trainingDistribution: [{ bucket: "Coastal", sharePct: 41 }, { bucket: "Inland", sharePct: 44 }, { bucket: "Highland", sharePct: 15 }],
    currentDistribution: [{ bucket: "Coastal", sharePct: 34 }, { bucket: "Inland", sharePct: 47 }, { bucket: "Highland", sharePct: 19 }],
    history: history([0.12, 0.13, 0.14, 0.15, 0.16, 0.17]),
  },
  {
    id: "drift-product", label: "Product Drift", category: "Product Drift", score: 0.31, threshold: 0.25, trend: "rising",
    scope: "Beam", operationalEffect: "Beam predictions carry higher error than the validated envelope.",
    recommendedResponse: "Retrain with expanded Beam sampling before wider Beam rollout.", owner: "Applied ML", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 640,
    trainingDistribution: [{ bucket: "Beam", sharePct: 15 }, { bucket: "Lightbridge", sharePct: 48 }, { bucket: "Lightbridge Pro", sharePct: 37 }],
    currentDistribution: [{ bucket: "Beam", sharePct: 24 }, { bucket: "Lightbridge", sharePct: 44 }, { bucket: "Lightbridge Pro", sharePct: 32 }],
    history: history([0.18, 0.2, 0.23, 0.26, 0.29, 0.31]),
  },
  {
    id: "drift-weather", label: "Weather-Pattern Drift", category: "Weather-Pattern Drift", score: 0.24, threshold: 0.2, trend: "rising",
    scope: "South Asia coastal fog", operationalEffect: "Fog onset is earlier and denser than the training seasons.",
    recommendedResponse: "Refresh weather features and re-validate the fog segment.", owner: "Weather Intelligence", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 480,
    trainingDistribution: [{ bucket: "Clear", sharePct: 44 }, { bucket: "Fog", sharePct: 21 }, { bucket: "Rain", sharePct: 22 }, { bucket: "Other", sharePct: 13 }],
    currentDistribution: [{ bucket: "Clear", sharePct: 36 }, { bucket: "Fog", sharePct: 31 }, { bucket: "Rain", sharePct: 21 }, { bucket: "Other", sharePct: 12 }],
    history: history([0.14, 0.16, 0.19, 0.21, 0.23, 0.24]),
  },
  {
    id: "drift-service", label: "Service-Mix Drift", category: "Service-Mix Drift", score: 0.1, threshold: 0.2, trend: "flat",
    scope: "Customer service mix", operationalEffect: "Impact modelling unaffected.",
    recommendedResponse: "No action.", owner: "Service Assurance", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 0,
    trainingDistribution: [{ bucket: "Enterprise", sharePct: 34 }, { bucket: "Backhaul", sharePct: 39 }, { bucket: "Carrier", sharePct: 18 }, { bucket: "Public", sharePct: 9 }],
    currentDistribution: [{ bucket: "Enterprise", sharePct: 35 }, { bucket: "Backhaul", sharePct: 37 }, { bucket: "Carrier", sharePct: 19 }, { bucket: "Public", sharePct: 9 }],
    history: history([0.1, 0.1, 0.09, 0.1, 0.1, 0.1]),
  },
  {
    id: "drift-firmware", label: "Firmware-Cohort Drift", category: "Firmware-Cohort Drift", score: 0.19, threshold: 0.2, trend: "rising",
    scope: "Firmware 10.x", operationalEffect: "New cohort under-represented in the training corpus.",
    recommendedResponse: "Collect a full season of Firmware 10.x telemetry.", owner: "Platform Engineering", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 260,
    trainingDistribution: [{ bucket: "8.x", sharePct: 46 }, { bucket: "9.x", sharePct: 38 }, { bucket: "10.x", sharePct: 16 }],
    currentDistribution: [{ bucket: "8.x", sharePct: 40 }, { bucket: "9.x", sharePct: 37 }, { bucket: "10.x", sharePct: 23 }],
    history: history([0.12, 0.13, 0.15, 0.16, 0.18, 0.19]),
  },
  {
    id: "drift-quality", label: "Data-Quality Drift", category: "Data-Quality Drift", score: 0.09, threshold: 0.18, trend: "flat",
    scope: "All feeds", operationalEffect: "Input completeness matches the training population.",
    recommendedResponse: "No action.", owner: "Data Engineering", lastEvaluated: "2026-08-04 22:10 UTC",
    blocking: false, evidenceComplete: true, affectedPredictions: 0,
    trainingDistribution: [{ bucket: "Complete", sharePct: 92 }, { bucket: "Partial", sharePct: 6 }, { bucket: "Missing", sharePct: 2 }],
    currentDistribution: [{ bucket: "Complete", sharePct: 91 }, { bucket: "Partial", sharePct: 7 }, { bucket: "Missing", sharePct: 2 }],
    history: history([0.08, 0.09, 0.09, 0.09, 0.09, 0.09]),
  },
];

export const driftSimulations = [
  { key: "weather-pattern", label: "Simulate Weather-Pattern Drift", description: "Fog frequency rises sharply above the training season." },
  { key: "new-product-cohort", label: "Simulate New Product Cohort", description: "Beam deployment doubles ahead of retraining." },
  { key: "sensor-calibration", label: "Simulate Sensor Calibration Change", description: "Optical sensors re-calibrated, shifting input distributions." },
  { key: "regional-data-loss", label: "Simulate Regional Data Loss", description: "One region loses telemetry, leaving incomplete evidence." },
  { key: "model-calibration", label: "Simulate Model Calibration Drift", description: "Predicted probabilities separate from observed frequency." },
] as const;

/* ------------------------------ model versions ---------------------------- */

export const modelVersions: ModelVersion[] = [
  {
    id: "v230", version: "v2.3.0", label: "v2.3.0", status: "Retired", modelType: "Gradient-boosted ensemble with temporal features",
    trainingDataVersion: "PLI-TRAIN-2025.06", featureSetVersion: "fs-3.1", ruleSetVersion: "rules-1.8",
    deploymentStatus: "Retired", runtimeLocation: "Synthetic regional inference tier", trainedOn: "2025-07-04", promotedOn: "2025-07-18",
    accuracyPct: 89.4, meanWarningMinutes: 254, falsePositivePct: 5.2, missedEventPct: 7.9, coveragePct: 94.1, calibrationErrorPct: 4.2,
    regionPerformance: [{ region: "South Asia", accuracyPct: 90.1 }, { region: "Africa", accuracyPct: 86.9 }, { region: "Europe", accuracyPct: 91.2 }],
    productPerformance: [{ product: "Lightbridge", accuracyPct: 90.2 }, { product: "Lightbridge Pro", accuracyPct: 90.6 }, { product: "Beam", accuracyPct: 82.4 }],
    inferenceCostPer1k: 0.42, runtimeLatencyMs: 240,
  },
  {
    id: "v235", version: "v2.3.5", label: "v2.3.5", status: "Superseded", modelType: "Gradient-boosted ensemble with temporal features",
    trainingDataVersion: "PLI-TRAIN-2025.10", featureSetVersion: "fs-3.4", ruleSetVersion: "rules-1.9",
    deploymentStatus: "Superseded", runtimeLocation: "Synthetic regional inference tier", trainedOn: "2025-11-02", promotedOn: "2025-11-20",
    accuracyPct: 90.8, meanWarningMinutes: 271, falsePositivePct: 4.6, missedEventPct: 6.8, coveragePct: 95.4, calibrationErrorPct: 3.6,
    regionPerformance: [{ region: "South Asia", accuracyPct: 91.6 }, { region: "Africa", accuracyPct: 88.4 }, { region: "Europe", accuracyPct: 92.4 }],
    productPerformance: [{ product: "Lightbridge", accuracyPct: 91.5 }, { product: "Lightbridge Pro", accuracyPct: 92.0 }, { product: "Beam", accuracyPct: 84.1 }],
    inferenceCostPer1k: 0.44, runtimeLatencyMs: 236,
  },
  {
    id: "v240", version: "v2.4.0", label: "v2.4.0", status: "Superseded", modelType: "Hybrid ensemble with physical attenuation priors",
    trainingDataVersion: "PLI-TRAIN-2026.01", featureSetVersion: "fs-4.0", ruleSetVersion: "rules-2.1",
    deploymentStatus: "Registered rollback version", runtimeLocation: "Synthetic regional inference tier", trainedOn: "2026-02-08", promotedOn: "2026-02-26",
    accuracyPct: 92.4, meanWarningMinutes: 306, falsePositivePct: 3.6, missedEventPct: 5.4, coveragePct: 97.2, calibrationErrorPct: 2.6,
    regionPerformance: [{ region: "South Asia", accuracyPct: 93.2 }, { region: "Africa", accuracyPct: 90.6 }, { region: "Europe", accuracyPct: 94.0 }],
    productPerformance: [{ product: "Lightbridge", accuracyPct: 93.1 }, { product: "Lightbridge Pro", accuracyPct: 93.6 }, { product: "Beam", accuracyPct: 86.9 }],
    inferenceCostPer1k: 0.47, runtimeLatencyMs: 228,
  },
  {
    id: "v241", version: "v2.4.1", label: "v2.4.1", status: "Active", modelType: "Hybrid ensemble with physical attenuation priors",
    trainingDataVersion: "PLI-TRAIN-2026.06", featureSetVersion: "fs-4.2", ruleSetVersion: "rules-2.3",
    deploymentStatus: "Active in synthetic demonstration runtime", runtimeLocation: "Synthetic regional inference tier", trainedOn: "2026-06-30", promotedOn: "2026-07-08",
    accuracyPct: 94.1, meanWarningMinutes: 342, falsePositivePct: 2.8, missedEventPct: 4.1, coveragePct: 98.6, calibrationErrorPct: 1.9,
    regionPerformance: [{ region: "South Asia", accuracyPct: 95.0 }, { region: "Africa", accuracyPct: 92.8 }, { region: "Europe", accuracyPct: 95.6 }],
    productPerformance: [{ product: "Lightbridge", accuracyPct: 94.8 }, { product: "Lightbridge Pro", accuracyPct: 95.3 }, { product: "Beam", accuracyPct: 89.6 }],
    inferenceCostPer1k: 0.49, runtimeLatencyMs: 221,
  },
  {
    id: "v250c", version: "v2.5.0 Candidate", label: "v2.5.0 Candidate", status: "Candidate", modelType: "Hybrid ensemble with seasonal atmospheric priors",
    trainingDataVersion: "PLI-TRAIN-2026.06", featureSetVersion: "fs-4.5", ruleSetVersion: "rules-2.4",
    deploymentStatus: "Candidate, not deployed", runtimeLocation: "Synthetic validation tier", trainedOn: "2026-07-24", promotedOn: null,
    accuracyPct: 95.2, meanWarningMinutes: 366, falsePositivePct: 2.4, missedEventPct: 3.5, coveragePct: 98.9, calibrationErrorPct: 2.9,
    regionPerformance: [{ region: "South Asia", accuracyPct: 96.1 }, { region: "Africa", accuracyPct: 93.9 }, { region: "Europe", accuracyPct: 96.2 }],
    productPerformance: [{ product: "Lightbridge", accuracyPct: 95.9 }, { product: "Lightbridge Pro", accuracyPct: 96.3 }, { product: "Beam", accuracyPct: 90.4 }],
    inferenceCostPer1k: 0.53, runtimeLatencyMs: 236,
  },
];

export const ACTIVE_VERSION = "v2.4.1";
export const ROLLBACK_VERSION = "v2.4.0";
export const CANDIDATE_VERSION = "v2.5.0 Candidate";

export const modelApprovals: ModelApproval[] = [
  { id: "ap-1", approvalType: "Model promotion", version: "v2.4.1", approver: "Optical Engineering lead", decision: "Approved", conditions: "Monitor Beam segment weekly", timestamp: "2026-07-08 09:20 UTC", evidence: "VR-2026-06, RE-2026-06", changeRecord: "CHG-2026-4471" },
  { id: "ap-2", approvalType: "Security review", version: "v2.4.1", approver: "Platform Security", decision: "Approved", conditions: "None", timestamp: "2026-07-06 15:02 UTC", evidence: "Synthetic security review record", changeRecord: "CHG-2026-4471" },
  { id: "ap-3", approvalType: "Operational readiness", version: "v2.4.1", approver: "SRE Operations", decision: "Conditionally approved", conditions: "Beam predictions remain engineer-reviewed", timestamp: "2026-07-07 11:44 UTC", evidence: "Cross-product validation matrix", changeRecord: "CHG-2026-4471" },
  { id: "ap-4", approvalType: "Model promotion", version: "v2.4.0", approver: "Optical Engineering lead", decision: "Approved", conditions: "None", timestamp: "2026-02-26 10:15 UTC", evidence: "VR-2026-01", changeRecord: "CHG-2026-2210" },
  { id: "ap-5", approvalType: "Candidate validation", version: "v2.5.0 Candidate", approver: "Applied ML", decision: "Pending", conditions: "Awaiting drift resolution on Beam", timestamp: "2026-08-01 08:30 UTC", evidence: "VR-2026-07C", changeRecord: "CHG-2026-5102" },
];

export const governanceRecord: ModelGovernanceRecord = {
  activeVersion: ACTIVE_VERSION,
  rollbackVersion: ROLLBACK_VERSION,
  candidateVersion: CANDIDATE_VERSION,
  status: "Approved and Active",
  owner: "Optical Engineering and SRE Data Science",
  approvalDate: "2026-07-08",
  nextReview: "2026-10-08",
  ownership: [
    { role: "Business owner", name: "Network Services leadership" },
    { role: "Technical owner", name: "Optical Engineering" },
    { role: "Data owner", name: "Data Engineering" },
    { role: "Model owner", name: "SRE Data Science" },
    { role: "Operational approver", name: "SRE Operations" },
    { role: "Security approver", name: "Platform Security" },
    { role: "Deployment owner", name: "Deployment Engineering" },
    { role: "Support owner", name: "Agentic SRE NOC" },
  ],
  securityReview: [
    { item: "Data classification", value: "Internal, network telemetry", status: "Pass" },
    { item: "Access model", value: "Role-based, engineering and SRE only", status: "Pass" },
    { item: "Model endpoint security", value: "Authenticated internal service", status: "Pass" },
    { item: "Secret management", value: "Managed secret store, no inline credentials", status: "Pass" },
    { item: "Audit logging", value: "All inference and governance events logged", status: "Pass" },
    { item: "Dependency review", value: "Reviewed at build time", status: "Conditional Pass" },
    { item: "Supply-chain review", value: "Signed artifacts, pinned versions", status: "Pass" },
    { item: "Vulnerability status", value: "No open critical findings", status: "Pass" },
    { item: "Network controls", value: "Private network path only", status: "Pass" },
    { item: "Incident-response plan", value: "Documented rollback and disable path", status: "Pass" },
  ],
  explainabilityReview: [
    { item: "Evidence completeness", value: "98.7% of predictions", status: "Pass" },
    { item: "Factor stability", value: "95.4% rank stability", status: "Pass" },
    { item: "Human-review agreement", value: "93.6% agreement", status: "Pass" },
    { item: "Limitation disclosure", value: "Documented for Beam and Firmware 10.x", status: "Pass" },
    { item: "Rule overrides", value: "1.4% of predictions", status: "Conditional Pass" },
    { item: "Review status", value: "Complete for v2.4.1", status: "Pass" },
  ],
  operationalReview: [
    { item: "Runbook coverage", value: "Preventive reroute and capacity shift documented", status: "Pass" },
    { item: "Human approval boundary", value: "Customer-impacting actions require engineer approval", status: "Pass" },
    { item: "Alert volume", value: "Within agreed operational load", status: "Pass" },
    { item: "Beam segment", value: "Engineer review required on every Beam action", status: "Conditional Pass" },
    { item: "On-call readiness", value: "Trained across all follow-the-sun regions", status: "Pass" },
  ],
  rollbackReadiness: [
    { item: "Rollback version", value: ROLLBACK_VERSION, ready: true },
    { item: "Artifact available", value: "Signed artifact in the model registry", ready: true },
    { item: "Configuration available", value: "Pinned runtime configuration retained", ready: true },
    { item: "Feature compatibility", value: "fs-4.0 remains supported", ready: true },
    { item: "Data compatibility", value: "PLI-TRAIN-2026.01 lineage retained", ready: true },
    { item: "Last rollback test", value: "2026-06-19, completed in 11 minutes", ready: true },
    { item: "Estimated rollback time", value: "12 minutes", ready: true },
    { item: "Rollback owner", value: "Deployment Engineering", ready: true },
    { item: "Validation plan", value: "Holdout re-run and calibration check", ready: true },
    { item: "Current readiness", value: "Ready", ready: true },
  ],
  retirementConditions: [
    "Sustained operational accuracy below 92% for two consecutive weeks",
    "Unresolved blocking drift beyond the agreed remediation window",
    "Security vulnerability affecting the model runtime or dependencies",
    "Unsupported product cohort entering material production volume",
    "Training lineage no longer available for audit",
    "Repeated missed critical customer-impacting events",
    "Replacement model promoted through full governance",
    "Policy or regulatory change affecting automated decisioning",
  ],
  openRisks: [
    { id: "risk-beam", risk: "Beam product performance below the validated envelope", severity: "Medium", owner: "Applied ML", state: "Mitigated by mandatory engineer review" },
    { id: "risk-fw10", risk: "Firmware 10.x cohort under-represented in training", severity: "Medium", owner: "Platform Engineering", state: "Data collection in progress" },
    { id: "risk-weather", risk: "Coastal fog pattern shifting away from training seasons", severity: "Low", owner: "Weather Intelligence", state: "Monitoring" },
  ],
  requiredActions: [
    { id: "act-beam", action: "Expand Beam sampling in the next training corpus", owner: "Applied ML", due: "2026-09-15" },
    { id: "act-fw10", action: "Collect a full season of Firmware 10.x telemetry", owner: "Platform Engineering", due: "2026-10-01" },
    { id: "act-review", action: "Complete the scheduled quarterly governance review", owner: "SRE Data Science", due: "2026-10-08" },
  ],
};

export const modelTimeline: ModelVersionTimelineEvent[] = [
  { id: "tl-1", at: "2025-07-04", version: "v2.3.0", title: "v2.3.0 trained", detail: "Trained on PLI-TRAIN-2025.06 with 780k samples.", kind: "trained" },
  { id: "tl-2", at: "2025-07-18", version: "v2.3.0", title: "v2.3.0 approved", detail: "Approved with conditions on African regional coverage.", kind: "approved" },
  { id: "tl-3", at: "2025-11-20", version: "v2.3.5", title: "v2.3.5 promoted", detail: "Promoted after false-positive reduction work.", kind: "promoted" },
  { id: "tl-4", at: "2026-02-08", version: "v2.4.0", title: "v2.4.0 retrained", detail: "Retrained with physical attenuation priors.", kind: "trained" },
  { id: "tl-5", at: "2026-06-19", version: "v2.4.0", title: "v2.4.0 rollback-tested", detail: "Rollback rehearsal completed in 11 minutes.", kind: "rollback-test" },
  { id: "tl-6", at: "2026-07-08", version: "v2.4.1", title: "v2.4.1 promoted", detail: "Promoted to active after full governance review.", kind: "promoted" },
  { id: "tl-7", at: "2026-07-24", version: "v2.5.0 Candidate", title: "v2.5.0 Candidate validation started", detail: "Candidate entered validation on the 2026.06 corpus.", kind: "validation" },
  { id: "tl-8", at: "2026-08-04", version: "v2.4.1", title: "Current governance review", detail: "Quarterly review in progress against release gates and drift.", kind: "review" },
];

export const lifecycleActivity: ModelLifecycleActivity[] = [
  { id: "act-1", at: "2026-08-04 22:10 UTC", event: "Drift detected", version: "v2.4.1", actor: "Drift monitor", result: "Beam product drift above threshold", scope: "Beam", evidence: "Drift report DR-2026-08-04", changeRecord: "—", status: "In progress" },
  { id: "act-2", at: "2026-08-01 08:30 UTC", event: "Candidate submitted", version: "v2.5.0 Candidate", actor: "Applied ML", result: "Candidate entered governance review", scope: "Global", evidence: "VR-2026-07C", changeRecord: "CHG-2026-5102", status: "In progress" },
  { id: "act-3", at: "2026-07-31 17:05 UTC", event: "Validation gate passed", version: "v2.5.0 Candidate", actor: "Validation pipeline", result: "9 of 10 gates pass, calibration under review", scope: "Global", evidence: "VR-2026-07C", changeRecord: "CHG-2026-5102", status: "Complete" },
  { id: "act-4", at: "2026-07-28 12:40 UTC", event: "Backtest completed", version: "v2.5.0 Candidate", actor: "Backtest runner", result: "Six-month backtest complete", scope: "Global", evidence: "BT-2026-07C", changeRecord: "—", status: "Complete" },
  { id: "act-5", at: "2026-07-24 06:15 UTC", event: "Model retrained", version: "v2.5.0 Candidate", actor: "Training pipeline", result: "Trained on PLI-TRAIN-2026.06", scope: "Global", evidence: "TR-2026-07C", changeRecord: "—", status: "Complete" },
  { id: "act-6", at: "2026-07-19 09:00 UTC", event: "Threshold changed", version: "v2.4.1", actor: "SRE Operations", result: "Alert threshold set to 0.80", scope: "Global", evidence: "Threshold change record", changeRecord: "CHG-2026-4802", status: "Complete" },
  { id: "act-7", at: "2026-07-14 14:22 UTC", event: "Feature set updated", version: "v2.4.1", actor: "Applied ML", result: "fs-4.2 seasonal features enabled", scope: "Global", evidence: "FS-4.2 change note", changeRecord: "CHG-2026-4650", status: "Complete" },
  { id: "act-8", at: "2026-07-08 09:20 UTC", event: "Version promoted", version: "v2.4.1", actor: "Optical Engineering lead", result: "Promoted to active", scope: "Global", evidence: "VR-2026-06", changeRecord: "CHG-2026-4471", status: "Complete" },
  { id: "act-9", at: "2026-07-06 15:02 UTC", event: "Candidate approved", version: "v2.4.1", actor: "Platform Security", result: "Security review approved", scope: "Global", evidence: "Synthetic security review record", changeRecord: "CHG-2026-4471", status: "Complete" },
  { id: "act-10", at: "2026-06-19 03:40 UTC", event: "Rollback tested", version: "v2.4.0", actor: "Deployment Engineering", result: "Rollback completed in 11 minutes", scope: "Global", evidence: "RB-2026-06", changeRecord: "CHG-2026-4102", status: "Complete" },
  { id: "act-11", at: "2026-05-12 20:11 UTC", event: "Data-source issue detected", version: "v2.4.0", actor: "Data Engineering", result: "Time-alignment defect, samples down-weighted", scope: "Network collectors", evidence: "DQ-2026-05", changeRecord: "CHG-2026-3890", status: "Complete" },
  { id: "act-12", at: "2026-05-02 10:00 UTC", event: "Governance note added", version: "v2.4.0", actor: "SRE Data Science", result: "Quarterly review scheduled", scope: "Global", evidence: "Governance note", changeRecord: "—", status: "Informational" },
];

export const modelLimitations: ModelLimitation[] = [
  { id: "lim-beam", limitation: "Beam predictions are less accurate than Lightbridge", scope: "Beam product", mitigation: "Mandatory engineer review on Beam actions" },
  { id: "lim-fw10", limitation: "Firmware 10.x has limited training support", scope: "Firmware 10.x cohort", mitigation: "Predictions marked low confidence" },
  { id: "lim-degraded", limitation: "Accuracy falls on degraded input quality", scope: "Degraded data-quality band", mitigation: "Quality feature exposed and confidence reduced" },
  { id: "lim-24h", limitation: "24 hour horizon carries higher lead-time error", scope: "24 hour horizon", mitigation: "Preferred operating horizon is 6 hours" },
];

export const modelEvidenceRecords: ModelEvidenceRecord[] = [
  { id: "ev-1", artifact: "Holdout validation report", kind: "Validation", owner: "Applied ML", producedOn: "2026-07-02", status: "Complete", location: "VR-2026-06" },
  { id: "ev-2", artifact: "Rare-event validation set", kind: "Validation", owner: "SRE Operations", producedOn: "2026-07-03", status: "Complete", location: "RE-2026-06" },
  { id: "ev-3", artifact: "Lead-time validation study", kind: "Validation", owner: "Optical Engineering", producedOn: "2026-07-03", status: "Complete", location: "LT-2026-06" },
  { id: "ev-4", artifact: "Explainability validation", kind: "Explainability", owner: "Applied ML", producedOn: "2026-07-05", status: "Complete", location: "EX-2026-06" },
  { id: "ev-5", artifact: "Security review record", kind: "Security", owner: "Platform Security", producedOn: "2026-07-06", status: "Complete", location: "Synthetic record" },
  { id: "ev-6", artifact: "Rollback readiness test", kind: "Operational", owner: "Deployment Engineering", producedOn: "2026-06-19", status: "Complete", location: "RB-2026-06" },
  { id: "ev-7", artifact: "Training lineage manifest", kind: "Data", owner: "Data Engineering", producedOn: "2026-06-30", status: "Complete", location: "PLI-TRAIN-2026.06" },
  { id: "ev-8", artifact: "Candidate calibration study", kind: "Validation", owner: "Applied ML", producedOn: "2026-07-28", status: "Partial", location: "CAL-2026-07C" },
];

export const initialGovernanceNotes: GovernanceNote[] = [
  { id: "note-1", at: "2026-08-02 09:15 UTC", author: "SRE Data Science", note: "Beam drift tracked weekly until the next corpus is built." },
];

export const requiredApprovers = [
  { role: "Optical Engineering lead", granted: true },
  { role: "SRE Operations approver", granted: true },
  { role: "Platform Security approver", granted: true },
  { role: "Deployment Engineering owner", granted: false },
] as const;
