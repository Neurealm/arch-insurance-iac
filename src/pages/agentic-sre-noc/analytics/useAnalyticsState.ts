/**
 * AIM-004 — analytics state.
 *
 * Single source of truth for every analytics selection on the Predictive
 * Optical Link Intelligence page. Selected link and What-If state stay owned by
 * the earlier stages and are passed in.
 */

import * as React from "react";
import {
  DEFAULT_ANALYTICS_LINK_ID, DEFAULT_HIGH_RISK_COLUMNS, getKpiAction, PRIMARY_METRIC_KEY,
  type HighRiskColumnKey,
} from "./analyticsFixtures";
import type { RiskClassName } from "./analyticsTypes";

export interface AnalyticsState {
  metricKey: string;
  selectMetric: (key: string) => void;
  technicalVisible: boolean;
  setTechnicalVisible: (v: boolean) => void;
  comparePrior: boolean;
  setComparePrior: (v: boolean) => void;
  trendMetricKey: string;
  setTrendMetricKey: (v: string) => void;

  factorKey: string | null;
  selectFactor: (key: string | null) => void;
  factorScope: "global" | "selected";
  setFactorScope: (v: "global" | "selected") => void;
  factorSort: "desc" | "asc";
  setFactorSort: (v: "desc" | "asc") => void;
  showConfidenceIntervals: boolean;
  setShowConfidenceIntervals: (v: boolean) => void;

  waterfallMode: "contribution" | "raw";
  setWaterfallMode: (v: "contribution" | "raw") => void;

  horizonHours: number;
  setHorizonHours: (v: number) => void;
  horizonSeriesKey: string;
  setHorizonSeriesKey: (v: string) => void;
  confidenceThresholdPct: number;
  setConfidenceThresholdPct: (v: number) => void;

  region: string;
  setRegion: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  riskClass: RiskClassName | "All";
  setRiskClass: (v: RiskClassName | "All") => void;
  modelVersion: string;
  setModelVersion: (v: string) => void;
  timePeriod: string;
  setTimePeriod: (v: string) => void;

  search: string;
  setSearch: (v: string) => void;
  visibleColumns: HighRiskColumnKey[];
  toggleColumn: (key: HighRiskColumnKey) => void;
  pinnedLinkIds: string[];
  togglePinned: (id: string) => void;
  groupBy: "none" | "riskClass" | "region" | "primaryDriver" | "fallbackReadiness";
  setGroupBy: (v: AnalyticsState["groupBy"]) => void;

  kpiKey: string | null;
  selectKpi: (key: string) => void;
  resetKpi: () => void;

  announcement: string;
  announce: (message: string) => void;

  clearFilters: () => void;
}

const DEFAULTS = {
  region: "All regions",
  product: "All products",
  riskClass: "All" as RiskClassName | "All",
  modelVersion: "v2.4.1",
  timePeriod: "Last 90 days",
  horizonHours: 6,
  confidenceThresholdPct: 85,
};

export function useAnalyticsState(selectedLinkId: string = DEFAULT_ANALYTICS_LINK_ID): AnalyticsState {
  const [metricKey, setMetricKey] = React.useState(PRIMARY_METRIC_KEY);
  const [technicalVisible, setTechnicalVisible] = React.useState(false);
  const [comparePrior, setComparePrior] = React.useState(false);
  const [trendMetricKey, setTrendMetricKey] = React.useState("accuracy");

  const [factorKey, setFactorKey] = React.useState<string | null>(null);
  const [factorScope, setFactorScope] = React.useState<"global" | "selected">("selected");
  const [factorSort, setFactorSort] = React.useState<"desc" | "asc">("desc");
  const [showConfidenceIntervals, setShowConfidenceIntervals] = React.useState(false);

  const [waterfallMode, setWaterfallMode] = React.useState<"contribution" | "raw">("contribution");

  const [horizonHours, setHorizonHours] = React.useState(DEFAULTS.horizonHours);
  const [horizonSeriesKey, setHorizonSeriesKey] = React.useState("current");
  const [confidenceThresholdPct, setConfidenceThresholdPctRaw] = React.useState(DEFAULTS.confidenceThresholdPct);

  const [region, setRegion] = React.useState(DEFAULTS.region);
  const [product, setProduct] = React.useState(DEFAULTS.product);
  const [riskClass, setRiskClass] = React.useState<RiskClassName | "All">(DEFAULTS.riskClass);
  const [modelVersion, setModelVersion] = React.useState(DEFAULTS.modelVersion);
  const [timePeriod, setTimePeriod] = React.useState(DEFAULTS.timePeriod);

  const [search, setSearch] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<HighRiskColumnKey[]>(DEFAULT_HIGH_RISK_COLUMNS);
  const [pinnedLinkIds, setPinnedLinkIds] = React.useState<string[]>([]);
  const [groupBy, setGroupBy] = React.useState<AnalyticsState["groupBy"]>("none");

  const [kpiKey, setKpiKey] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  /* The factor selection is scoped to the selected link, so it resets with it. */
  React.useEffect(() => {
    setFactorKey(null);
  }, [selectedLinkId]);

  const announce = React.useCallback((message: string) => setAnnouncement(message), []);

  const selectMetric = React.useCallback((key: string) => {
    setMetricKey(key);
    setTrendMetricKey((prev) => (["accuracy", "preventive", "false-positive", "lead-time-error"].includes(key) ? key : prev));
  }, []);

  const selectFactor = React.useCallback((key: string | null) => {
    setFactorKey((prev) => (prev === key ? null : key));
  }, []);

  const toggleColumn = React.useCallback((key: HighRiskColumnKey) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const togglePinned = React.useCallback((id: string) => {
    setPinnedLinkIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const setConfidenceThresholdPct = React.useCallback((value: number) => {
    setConfidenceThresholdPctRaw(Math.min(99, Math.max(5, Math.round(value))));
  }, []);

  const selectKpi = React.useCallback((key: string) => {
    const action = getKpiAction(key);
    setKpiKey((prev) => (prev === key ? null : key));
    if (!action) return;
    setMetricKey(action.metricKey);
    setRiskClass(action.riskClass === "All" ? "All" : action.riskClass);
    if (action.horizonHours !== null) setHorizonHours(action.horizonHours);
    setAnnouncement(action.summary);
  }, []);

  const resetKpi = React.useCallback(() => {
    setKpiKey(null);
    setRiskClass("All");
    setMetricKey(PRIMARY_METRIC_KEY);
    setAnnouncement("KPI selection reset.");
  }, []);

  const clearFilters = React.useCallback(() => {
    setRegion(DEFAULTS.region);
    setProduct(DEFAULTS.product);
    setRiskClass(DEFAULTS.riskClass);
    setModelVersion(DEFAULTS.modelVersion);
    setTimePeriod(DEFAULTS.timePeriod);
    setHorizonHours(DEFAULTS.horizonHours);
    setSearch("");
    setKpiKey(null);
    setAnnouncement("Analytics filters cleared.");
  }, []);

  return {
    metricKey, selectMetric, technicalVisible, setTechnicalVisible, comparePrior, setComparePrior,
    trendMetricKey, setTrendMetricKey,
    factorKey, selectFactor, factorScope, setFactorScope, factorSort, setFactorSort,
    showConfidenceIntervals, setShowConfidenceIntervals,
    waterfallMode, setWaterfallMode,
    horizonHours, setHorizonHours, horizonSeriesKey, setHorizonSeriesKey,
    confidenceThresholdPct, setConfidenceThresholdPct,
    region, setRegion, product, setProduct, riskClass, setRiskClass, modelVersion, setModelVersion,
    timePeriod, setTimePeriod,
    search, setSearch, visibleColumns, toggleColumn, pinnedLinkIds, togglePinned, groupBy, setGroupBy,
    kpiKey, selectKpi, resetKpi,
    announcement, announce,
    clearFilters,
  };
}
