import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BASE_COUNTERS, STAGE_ORDER, transactions as seedTransactions,
  type ExceptionCategory, type StageId, type Txn,
} from "./wfData";

export type TimeRange = "1h" | "24h" | "7d" | "30d";

export const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: "1h", label: "Last Hour" },
  { id: "24h", label: "Last 24 Hours" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
];

/** Volume scaling per time range so the period selector visibly changes data. */
const RANGE_FACTOR: Record<TimeRange, number> = { "1h": 0.09, "24h": 1, "7d": 6.4, "30d": 26.1 };

export type DrawerState =
  | { kind: "txn"; id: string }
  | { kind: "system"; id: string }
  | { kind: "system-chain" }
  | { kind: "recommendations" }
  | { kind: "reconciliation" }
  | { kind: "architecture" }
  | null;

export interface Filters {
  customer: string;
  region: string;
  sku: string;
  stage: StageId | null;
  exceptionCategory: ExceptionCategory | null;
  exceptionStage: StageId | null;
  riskOnly: boolean;
  lifecycle: "healthy" | "warning" | "critical" | null;
}

const EMPTY_FILTERS: Filters = {
  customer: "All", region: "All", sku: "All",
  stage: null, exceptionCategory: null, exceptionStage: null, riskOnly: false, lifecycle: null,
};

export function isException(t: Txn) {
  return Boolean(t.exception);
}

export function useWorkflowState() {
  const [range, setRange] = useState<TimeRange>("24h");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [txns, setTxns] = useState<Txn[]>(seedTransactions);
  const [adjust, setAdjust] = useState<Partial<Record<StageId, { primary: number; secondary: number }>>>({});
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [flowMode, setFlowMode] = useState<"live" | "data" | "exception">("live");
  const [busy, setBusy] = useState<string | null>(null);

  const patch = useCallback((k: keyof Filters, v: Filters[keyof Filters]) => {
    setFilters((f) => ({ ...f, [k]: v } as Filters));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const refresh = useCallback(() => {
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = window.setInterval(() => setLastRefresh(new Date()), 20_000);
    return () => window.clearInterval(t);
  }, [autoRefresh]);

  /* ------------------------------ derived data ----------------------------- */

  const counters = useMemo(() => {
    const f = RANGE_FACTOR[range];
    const out = {} as Record<StageId, { primary: number; secondary: number; avgTime: string; primaryLabel: string; secondaryLabel: string }>;
    for (const s of STAGE_ORDER) {
      const base = BASE_COUNTERS[s];
      const a = adjust[s];
      const primary = Math.round((a ? a.primary : base.primary) * f);
      const secondary = Math.round((a ? a.secondary : base.secondary) * f);
      out[s] = { ...base, primary, secondary };
    }
    return out;
  }, [range, adjust]);

  const successRate = useMemo(() => {
    const received = counters.order.primary || 1;
    return (counters.active.primary / received) * 100;
  }, [counters]);

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (filters.customer !== "All" && t.customer !== filters.customer) return false;
      if (filters.region !== "All" && t.region !== filters.region) return false;
      if (filters.sku !== "All" && t.sku !== filters.sku) return false;
      if (filters.stage && t.stage !== filters.stage) return false;
      if (filters.exceptionCategory && t.exception?.category !== filters.exceptionCategory) return false;
      if (filters.exceptionStage && t.exception?.stage !== filters.exceptionStage) return false;
      if (filters.riskOnly && t.revenueAtRisk <= 0) return false;
      if (filters.lifecycle === "critical" && !(t.exception && t.revenueAtRisk > 0)) return false;
      if (filters.lifecycle === "warning" && !(t.exception && t.revenueAtRisk === 0)) return false;
      if (filters.lifecycle === "healthy" && t.exception) return false;
      return true;
    });
  }, [txns, filters]);

  const exceptions = useMemo(() => txns.filter(isException), [txns]);
  const filteredExceptions = useMemo(() => filtered.filter(isException), [filtered]);

  const revenueAtRisk = useMemo(() => txns.reduce((a, t) => a + t.revenueAtRisk, 0), [txns]);

  const exceptionsByStage = useMemo(() => {
    const m = new Map<StageId, number>();
    exceptions.forEach((t) => m.set(t.exception!.stage, (m.get(t.exception!.stage) ?? 0) + 1));
    return m;
  }, [exceptions]);

  const exceptionsByReason = useMemo(() => {
    const m = new Map<ExceptionCategory, number>();
    exceptions.forEach((t) => m.set(t.exception!.category, (m.get(t.exception!.category) ?? 0) + 1));
    return m;
  }, [exceptions]);

  const reconciliationHealth = useMemo(() => {
    const total = txns.length;
    const mismatched = txns.filter((t) => t.reconciliation.verdict !== "MATCH").length;
    // Weighted against the full period volume, not just the sampled estate.
    const pct = 100 - (mismatched / Math.max(counters.order.primary, total)) * 100 * 0.72;
    return Math.max(90, Math.min(100, pct));
  }, [txns, counters]);

  const systemHealth = useMemo(() => {
    const criticalExceptions = exceptions.filter((t) => t.revenueAtRisk > 0).length;
    if (criticalExceptions >= 6 || successRate < 92) return "Degraded" as const;
    if (criticalExceptions >= 1 && successRate < 97) return "Attention" as const;
    return "Healthy" as const;
  }, [exceptions, successRate]);

  const lifecycle = useMemo(() => {
    const total = counters.order.primary || 1;
    const critical = exceptions.filter((t) => t.revenueAtRisk > 0).length;
    const warning = exceptions.length - critical;
    const criticalPct = Math.max(0, Math.round((critical / total) * 100));
    const warningPct = Math.max(0, Math.round((warning / total) * 100));
    return { healthy: 100 - criticalPct - warningPct, warning: warningPct, critical: criticalPct };
  }, [counters, exceptions]);

  /* ------------------------------ remediation ------------------------------ */

  const advanceStage = useCallback((s: StageId, deltaPrimary: number, deltaSecondary: number) => {
    setAdjust((a) => {
      const cur = a[s] ?? { primary: BASE_COUNTERS[s].primary, secondary: BASE_COUNTERS[s].secondary };
      return { ...a, [s]: { primary: cur.primary + deltaPrimary, secondary: Math.max(0, cur.secondary + deltaSecondary) } };
    });
  }, []);

  const remediate = useCallback(
    (txnId: string, action: string) => {
      const txn = txns.find((t) => t.id === txnId);
      if (!txn || !txn.exception) return;
      setBusy(txnId);
      const stage = txn.exception.stage;
      const stageIdx = STAGE_ORDER.indexOf(stage);
      const nextStage = STAGE_ORDER[Math.min(stageIdx + 1, STAGE_ORDER.length - 1)];
      toast.loading(`${action} initiated…`, { id: txnId });

      window.setTimeout(() => {
        setTxns((prev) =>
          prev.map((t) => {
            if (t.id !== txnId) return t;
            const now = new Date();
            const stamp = now.toISOString().slice(11, 19);
            const events = t.events.map((e) =>
              e.stage === stage ? { ...e, state: "complete" as const, at: stamp, note: `${action} succeeded` } : e,
            ).map((e) => (e.stage === nextStage ? { ...e, state: "inProgress" as const, note: "In progress" } : e));
            return {
              ...t,
              exception: undefined,
              health: "Processing",
              stage: nextStage,
              stalledMinutes: 0,
              revenueAtRisk: 0,
              events,
              reconciliation: { ...t.reconciliation, verdict: "MATCH", lifterEntitlement: "Active" },
            };
          }),
        );
        advanceStage(stage, 1, -1);
        setBusy(null);
        toast.success(`${action} successful — ${txn.customer} advanced to ${nextStage === "active" ? "Active & Monitored" : nextStage}`, { id: txnId });
      }, 1400);
    },
    [txns, advanceStage],
  );

  return {
    range, setRange, filters, patch, resetFilters,
    txns, filtered, exceptions, filteredExceptions,
    counters, successRate, revenueAtRisk, exceptionsByStage, exceptionsByReason,
    reconciliationHealth, systemHealth, lifecycle,
    drawer, setDrawer, autoRefresh, setAutoRefresh, lastRefresh, refresh,
    flowMode, setFlowMode, remediate, busy,
  };
}

export type WorkflowState = ReturnType<typeof useWorkflowState>;
