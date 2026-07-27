/**
 * Page 4 · Service Portfolio (route `/runops/services`)
 *
 * Presents the service catalog through an SRE reliability and operational
 * readiness lens. All portfolio rows derive from OperationsProvider and are
 * augmented with page-scoped overlays for owner assignments and newly
 * created services (persisted in localStorage). Selecting a service routes
 * to `/runops/services/:serviceId`.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioEnrichmentButton } from "@/platform/cae";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertTriangle, Columns3, Download, GitCompareArrows, LayoutGrid, Plus,
  Rows3, ShieldAlert, TimerReset, UserRound,
} from "lucide-react";
import { useOperations } from "@/runops/state/RunOpsProviders";
import {
  DataGrid, ColumnSelector, SearchInput, EmptyState, ErrorState,
  PermissionDeniedState, StaleDataState, ConnectorUnavailableState,
  StatusIndicator, ReadinessScore, MetricCard,
  type DataGridColumn,
} from "@/runops/components";
import type { BusinessService } from "@/runops/data/scenario";

/* --------------------------------- Types --------------------------------- */

type Health = BusinessService["health"];
type Tier = BusinessService["tier"];
type Env = BusinessService["environment"];

interface OwnerOverlay {
  owner?: string;
  businessOwner?: string;
  ownerAssignedAt?: string;
}

interface CreatedService {
  id: string;
  name: string;
  purpose: string;
  tier: Tier;
  environment: Env;
  region: string;
  owner: string;
  businessOwner: string;
  createdAt: string;
}

interface PortfolioRow {
  id: string;
  name: string;
  purpose: string;
  tier: Tier;
  owner: string;
  businessOwner: string;
  environments: Env[];
  region: string;
  health: Health;
  sloAvailability: number;
  sloLatencyMs: number;
  errorBudgetRemaining: number;
  activeIncidents: number;
  recentChangeRisk: "None" | "Low" | "Medium" | "High";
  runbookCoverage: number;      // 0..1
  workerCoverage: number;       // 0..1
  readinessScore: number;       // 0..100
  dataFreshnessAt: string;
  hasSlo: boolean;
  hasCurrentRunbook: boolean;
  telemetryGap: boolean;
  certificationExpiring: boolean;
  isCreated: boolean;
  technology: string;
  journey: string;
  capability: string;
}

/* -------------------------------- Storage -------------------------------- */

const LS_OWNERS = "runops.portfolio.owners.v1";
const LS_CREATED = "runops.portfolio.created.v1";

type OwnerMap = Record<string, OwnerOverlay>;

function loadOwners(): OwnerMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(LS_OWNERS) ?? "{}") as OwnerMap; } catch { return {}; }
}
function saveOwners(m: OwnerMap): void {
  try { window.localStorage.setItem(LS_OWNERS, JSON.stringify(m)); } catch { /* noop */ }
}
function loadCreated(): CreatedService[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(LS_CREATED) ?? "[]") as CreatedService[]; } catch { return []; }
}
function saveCreated(list: CreatedService[]): void {
  try { window.localStorage.setItem(LS_CREATED, JSON.stringify(list)); } catch { /* noop */ }
}

/* ---------------------- Deterministic enrichment ------------------------- */

// Small stable hash so the same service id always maps to the same synthesized
// values. This is derivation, not fixtures — the base data comes from the
// provider; we only interpret it consistently.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
const TEAM_POOL = ["Platform SRE", "Payments SRE", "Identity SRE", "Storefront SRE", "Data Platform", "Edge Ops"];
const BIZ_POOL = ["VP Commerce", "VP Payments", "VP Identity", "COO Office", "VP Data", "VP Digital"];
const TECH_POOL = ["Node/TS", ".NET", "Java", "Go", "Python", "Kotlin"];
const JOURNEY_POOL = ["Checkout", "Sign-in", "Fulfillment", "Search", "Account", "Support"];
const CAPABILITY_POOL = ["Order Capture", "Payment Authorization", "Identity Verification", "Inventory Sync", "Customer Data", "Notifications"];

function pickFromPool<T>(pool: T[], seed: string, salt: string): T {
  return pool[hash(seed + salt) % pool.length];
}

function synthesizePurpose(name: string): string {
  return `Supports the ${name} value stream with real-time reliability guarantees and change safety.`;
}

/* ----------------------------- Page component ---------------------------- */

const TIER_OPTIONS: Tier[] = ["Tier 1", "Tier 2", "Tier 3"];
const ENV_OPTIONS: Env[] = ["Production", "Staging", "Development"];
const HEALTH_OPTIONS: Health[] = ["Healthy", "At Risk", "Degraded", "Severely Degraded", "Unavailable"];

export default function ServicePortfolio() {
  const ops = useOperations();
  const navigate = useNavigate();

  const [owners, setOwners] = useState<OwnerMap>(() => loadOwners());
  const [created, setCreated] = useState<CreatedService[]>(() => loadCreated());
  useEffect(() => saveOwners(owners), [owners]);
  useEffect(() => saveCreated(created), [created]);

  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [fTier, setFTier] = useState<"all" | Tier>("all");
  const [fHealth, setFHealth] = useState<"all" | Health>("all");
  const [fEnv, setFEnv] = useState<"all" | Env>("all");
  const [fOwner, setFOwner] = useState<"all" | string>("all");
  const [fSlo, setFSlo] = useState<"all" | "hasSlo" | "noSlo">("all");
  const [fReadiness, setFReadiness] = useState<"all" | "lt50" | "50to80" | "gte80">("all");
  const [fIncident, setFIncident] = useState<"all" | "active" | "clear">("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [ownerDrawer, setOwnerDrawer] = useState<PortfolioRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<PortfolioRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readOnly = ops.role === "Read Only User" || ops.role === "Auditor";

  const connectorsDown = useMemo(
    () => ops.connectors.filter((c) => c.status !== "Healthy").length,
    [ops.connectors],
  );
  const stale = useMemo(
    () => Date.now() - new Date(ops.dataFreshnessAt).getTime() > 5 * 60_000,
    [ops.dataFreshnessAt],
  );

  /* ----- Build portfolio rows from provider + overlays ----- */

  const rows = useMemo<PortfolioRow[]>(() => {
    const activeIncidentByService = new Set<string>();
    if (ops.incident.state !== "Resolved" && ops.incident.state !== "Closed") {
      activeIncidentByService.add(ops.incident.serviceId);
    }
    const changeRiskByService: Record<string, PortfolioRow["recentChangeRisk"]> = {};
    for (const c of ops.changes) {
      const cur = changeRiskByService[c.serviceId];
      const rank = (r: PortfolioRow["recentChangeRisk"]): number =>
        r === "High" ? 3 : r === "Medium" ? 2 : r === "Low" ? 1 : 0;
      if (!cur || rank(c.risk as PortfolioRow["recentChangeRisk"]) > rank(cur)) {
        changeRiskByService[c.serviceId] = c.risk as PortfolioRow["recentChangeRisk"];
      }
    }
    const runbookByService = new Set<string>([ops.runbook.serviceId]);
    const sloByService = new Set<string>(ops.slos.map((s) => s.serviceId));

    const base: PortfolioRow[] = ops.services.map((s) => {
      const overlay = owners[s.id] ?? {};
      const owner = overlay.owner ?? pickFromPool(TEAM_POOL, s.id, "team");
      const businessOwner = overlay.businessOwner ?? pickFromPool(BIZ_POOL, s.id, "biz");
      const hasRunbook = runbookByService.has(s.id);
      const hasSlo = sloByService.has(s.id);
      const runbookCoverage = hasRunbook ? 0.7 + (hash(s.id) % 30) / 100 : 0;
      const workerCoverage = 0.4 + (hash(s.id + "w") % 55) / 100;
      const telemetryGap = (hash(s.id + "t") % 5) === 0;
      const certificationExpiring = (hash(s.id + "c") % 4) === 0;
      const readiness = Math.round(
        (hasSlo ? 25 : 5) +
        runbookCoverage * 30 +
        workerCoverage * 20 +
        (telemetryGap ? 0 : 15) +
        (certificationExpiring ? 0 : 10),
      );
      const envs: Env[] = ["Production", "Staging", "Development"].slice(
        0, 1 + (hash(s.id + "e") % 3),
      ) as Env[];
      return {
        id: s.id,
        name: s.name,
        purpose: synthesizePurpose(s.name),
        tier: s.tier,
        owner,
        businessOwner,
        environments: envs,
        region: s.region,
        health: s.health,
        sloAvailability: s.sloAvailability,
        sloLatencyMs: s.sloLatencyMs,
        errorBudgetRemaining: s.errorBudgetRemaining,
        activeIncidents: activeIncidentByService.has(s.id) ? 1 : 0,
        recentChangeRisk: changeRiskByService[s.id] ?? "None",
        runbookCoverage,
        workerCoverage,
        readinessScore: Math.min(100, readiness),
        dataFreshnessAt: ops.dataFreshnessAt,
        hasSlo,
        hasCurrentRunbook: hasRunbook,
        telemetryGap,
        certificationExpiring,
        isCreated: false,
        technology: pickFromPool(TECH_POOL, s.id, "tech"),
        journey: pickFromPool(JOURNEY_POOL, s.id, "j"),
        capability: pickFromPool(CAPABILITY_POOL, s.id, "cap"),
      };
    });

    const extras: PortfolioRow[] = created.map((c) => ({
      id: c.id,
      name: c.name,
      purpose: c.purpose,
      tier: c.tier,
      owner: owners[c.id]?.owner ?? c.owner,
      businessOwner: owners[c.id]?.businessOwner ?? c.businessOwner,
      environments: [c.environment],
      region: c.region,
      health: "Healthy",
      sloAvailability: 0,
      sloLatencyMs: 0,
      errorBudgetRemaining: 100,
      activeIncidents: 0,
      recentChangeRisk: "None",
      runbookCoverage: 0,
      workerCoverage: 0,
      readinessScore: 15,
      dataFreshnessAt: c.createdAt,
      hasSlo: false,
      hasCurrentRunbook: false,
      telemetryGap: true,
      certificationExpiring: false,
      isCreated: true,
      technology: pickFromPool(TECH_POOL, c.id, "tech"),
      journey: pickFromPool(JOURNEY_POOL, c.id, "j"),
      capability: pickFromPool(CAPABILITY_POOL, c.id, "cap"),
    }));

    return [...base, ...extras];
  }, [ops.services, ops.incident, ops.changes, ops.runbook, ops.slos, ops.dataFreshnessAt, owners, created]);

  /* ----- Summary metrics ----- */

  const summary = useMemo(() => ({
    tier1: rows.filter((r) => r.tier === "Tier 1").length,
    orphaned: rows.filter((r) => r.owner === "Unassigned" || r.owner === "").length,
    withoutSlo: rows.filter((r) => !r.hasSlo).length,
    withoutRunbook: rows.filter((r) => !r.hasCurrentRunbook).length,
    telemetryGap: rows.filter((r) => r.telemetryGap).length,
    expiringCert: rows.filter((r) => r.certificationExpiring).length,
  }), [rows]);

  /* ----- Filtering ----- */

  const ownerOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.owner))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (fTier !== "all" && r.tier !== fTier) return false;
      if (fHealth !== "all" && r.health !== fHealth) return false;
      if (fEnv !== "all" && !r.environments.includes(fEnv)) return false;
      if (fOwner !== "all" && r.owner !== fOwner) return false;
      if (fSlo === "hasSlo" && !r.hasSlo) return false;
      if (fSlo === "noSlo" && r.hasSlo) return false;
      if (fReadiness === "lt50" && r.readinessScore >= 50) return false;
      if (fReadiness === "50to80" && (r.readinessScore < 50 || r.readinessScore >= 80)) return false;
      if (fReadiness === "gte80" && r.readinessScore < 80) return false;
      if (fIncident === "active" && r.activeIncidents === 0) return false;
      if (fIncident === "clear" && r.activeIncidents > 0) return false;
      if (!q) return true;
      const hay = `${r.name} ${r.id} ${r.owner} ${r.businessOwner} ${r.technology} ${r.journey} ${r.capability} ${r.purpose}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, fTier, fHealth, fEnv, fOwner, fSlo, fReadiness, fIncident]);

  /* ----- Mutations ----- */

  const guarded = (fn: () => void) => {
    if (readOnly) { setError("Your role has read-only access to the service portfolio."); return; }
    try { fn(); setError(null); } catch (e) { setError(e instanceof Error ? e.message : "Mutation failed"); }
  };

  const assignOwner = (row: PortfolioRow, owner: string, businessOwner: string) => guarded(() => {
    if (!owner.trim()) throw new Error("Owner team is required.");
    setOwners((prev) => ({ ...prev, [row.id]: { owner, businessOwner, ownerAssignedAt: new Date().toISOString() } }));
    ops.pushNotification({
      kind: "info", title: `Owner assigned · ${row.name}`,
      detail: `${owner} · ${businessOwner}`, entityRef: row.id,
      route: `/runops/services/${row.id}`,
    });
  });

  const createService = (payload: Omit<CreatedService, "id" | "createdAt">) => guarded(() => {
    if (!payload.name.trim()) throw new Error("Service name is required.");
    if (!payload.owner.trim()) throw new Error("Owner team is required.");
    if (!payload.purpose.trim()) throw new Error("Business purpose is required.");
    const id = `svc-${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${(hash(payload.name) % 999).toString().padStart(3, "0")}`;
    if (rows.some((r) => r.id === id)) throw new Error("A service with a similar name already exists.");
    const rec: CreatedService = { ...payload, id, createdAt: new Date().toISOString() };
    setCreated((prev) => [...prev, rec]);
    ops.pushNotification({
      kind: "info", title: `Service created · ${rec.name}`,
      detail: `${rec.tier} · ${rec.owner}`, entityRef: id,
      route: `/runops/services/${id}`,
    });
  });

  /* ----- Export ----- */

  const exportCsv = () => {
    const headers = ["id","name","tier","owner","businessOwner","environments","region","health","sloAvailability","errorBudget","activeIncidents","recentChangeRisk","runbookCoverage","workerCoverage","readinessScore"];
    const csv = [headers.join(",")].concat(
      filtered.map((r) => [
        r.id, JSON.stringify(r.name), r.tier, r.owner, r.businessOwner,
        r.environments.join("|"), r.region, r.health, r.sloAvailability,
        r.errorBudgetRemaining, r.activeIncidents, r.recentChangeRisk,
        Math.round(r.runbookCoverage * 100), Math.round(r.workerCoverage * 100),
        r.readinessScore,
      ].join(",")),
    ).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "service-portfolio.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ----- Grid columns ----- */

  const columns: DataGridColumn<PortfolioRow>[] = [
    { key: "name", header: "Service", sort: (r) => r.name,
      accessor: (r) => (
        <button className="text-left" onClick={() => navigate(`/runops/services/${r.id}`)}>
          <div className="font-medium text-slate-900 hover:underline">{r.name}</div>
          <div className="text-[10.5px] text-slate-500">{r.id}{r.isCreated && " · new"}</div>
        </button>
      ) },
    { key: "purpose", header: "Purpose", sort: (r) => r.purpose,
      accessor: (r) => <span className="text-slate-600 line-clamp-2 text-[11.5px]">{r.purpose}</span> },
    { key: "tier", header: "Tier", width: "70px", sort: (r) => r.tier,
      accessor: (r) => <TierBadge tier={r.tier} /> },
    { key: "owner", header: "Owner", sort: (r) => r.owner,
      accessor: (r) => (
        <button className="text-slate-700 hover:underline" onClick={() => setOwnerDrawer(r)}>{r.owner}</button>
      ) },
    { key: "businessOwner", header: "Business Owner", sort: (r) => r.businessOwner,
      accessor: (r) => <span className="text-slate-600">{r.businessOwner}</span> },
    { key: "env", header: "Env", width: "120px", sort: (r) => r.environments.join(","),
      accessor: (r) => <span className="text-[11px] text-slate-600">{r.environments.join(", ")}</span> },
    { key: "health", header: "Health", width: "120px", sort: (r) => r.health,
      accessor: (r) => <HealthChip value={r.health} /> },
    { key: "slo", header: "SLO", width: "110px", sort: (r) => r.sloAvailability,
      accessor: (r) => r.hasSlo
        ? <span className="text-slate-700">{r.sloAvailability.toFixed(2)}% · {r.sloLatencyMs}ms</span>
        : <span className="text-amber-700">No SLO</span> },
    { key: "budget", header: "Budget", width: "80px", sort: (r) => r.errorBudgetRemaining,
      accessor: (r) => <BudgetChip pct={r.errorBudgetRemaining} /> },
    { key: "incidents", header: "Active INC", width: "90px", sort: (r) => r.activeIncidents,
      accessor: (r) => r.activeIncidents > 0
        ? <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-800"><ShieldAlert className="h-3 w-3" />{r.activeIncidents}</span>
        : <span className="text-slate-500">0</span> },
    { key: "chgRisk", header: "Change Risk", width: "100px", sort: (r) => r.recentChangeRisk,
      accessor: (r) => <span className="text-[11px] text-slate-700">{r.recentChangeRisk}</span> },
    { key: "runbook", header: "Runbooks", width: "90px", sort: (r) => r.runbookCoverage,
      accessor: (r) => <CoverageBar pct={Math.round(r.runbookCoverage * 100)} /> },
    { key: "workers", header: "Workers", width: "90px", sort: (r) => r.workerCoverage,
      accessor: (r) => <CoverageBar pct={Math.round(r.workerCoverage * 100)} /> },
    { key: "readiness", header: "Readiness", width: "90px", sort: (r) => r.readinessScore,
      accessor: (r) => <ReadinessScore score={r.readinessScore} label="" /> },
    { key: "fresh", header: "Fresh", width: "90px", sort: (r) => r.dataFreshnessAt,
      accessor: (r) => <span className="text-[11px] text-slate-500">{formatRel(r.dataFreshnessAt)}</span> },
  ];
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    () => new Set(columns.map((c) => c.key).filter((k) => !["purpose","businessOwner","env","chgRisk","fresh"].includes(k))),
  );

  /* ----- Render ----- */

  return (
    <div className="mx-auto max-w-[1600px] p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Services</div>
          <h1 className="mt-0.5 text-[22px] font-semibold text-slate-900">Service Portfolio</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
            Reliability and operational readiness view of the service catalog. Rank services by
            tier, incidents, SLO coverage, error budget, runbook coverage, worker coverage, and
            readiness score.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AudioEnrichmentButton
            callId="CAE.RUNOPS.SERVICE_HEALTH.001"
            placementId="CAE.PLACE.RUNOPS.SERVICES.HEALTH"
          />
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[11px]">Role: {ops.role}</Badge>
          <div className="inline-flex overflow-hidden rounded-md border border-slate-200">
            <button aria-pressed={view === "table"} onClick={() => setView("table")}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11.5px] ${view === "table" ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}>
              <Rows3 className="h-3 w-3" /> Table
            </button>
            <button aria-pressed={view === "cards"} onClick={() => setView("cards")}
              className={`inline-flex items-center gap-1 px-2 py-1 text-[11.5px] ${view === "cards" ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}>
              <LayoutGrid className="h-3 w-3" /> Cards
            </button>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={ops.refreshData}>
            <TimerReset className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" className="h-8 text-[12px]" disabled={readOnly} onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Service
          </Button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Tier 1 services" value={summary.tier1} tone="neutral" />
        <MetricCard label="Orphaned" value={summary.orphaned} tone={summary.orphaned > 0 ? "warning" : "healthy"} />
        <MetricCard label="Without SLOs" value={summary.withoutSlo} tone={summary.withoutSlo > 0 ? "warning" : "healthy"} />
        <MetricCard label="Without runbooks" value={summary.withoutRunbook} tone={summary.withoutRunbook > 0 ? "warning" : "healthy"} />
        <MetricCard label="Telemetry gaps" value={summary.telemetryGap} tone={summary.telemetryGap > 0 ? "at-risk" : "healthy"} />
        <MetricCard label="Expiring certifications" value={summary.expiringCert} tone={summary.expiringCert > 0 ? "at-risk" : "healthy"} />
      </div>

      {/* Banners */}
      {stale && (
        <div className="mb-3">
          <StaleDataState title="Portfolio data may be stale" description="Refresh to pull the latest snapshot from OperationsProvider."
            action={{ label: "Refresh", onClick: ops.refreshData }} />
        </div>
      )}
      {connectorsDown > 0 && (
        <div className="mb-3">
          <ConnectorUnavailableState title={`${connectorsDown} connector${connectorsDown === 1 ? "" : "s"} unavailable`}
            description="Some service telemetry may be missing. Health and readiness reflect the last known snapshot." />
        </div>
      )}
      {readOnly && (
        <div className="mb-3">
          <PermissionDeniedState title={`Role ${ops.role} is read-only`}
            description="Switch to an operator role to assign owners, create services, or export the catalog." />
        </div>
      )}
      {error && (
        <div className="mb-3">
          <ErrorState title="Portfolio action failed" description={error}
            action={{ label: "Dismiss", onClick: () => setError(null) }} />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-3 border-slate-200">
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <SearchInput value={search} onChange={setSearch}
            placeholder="Search service, component, owner, technology, journey, capability"
            className="w-80" />
          <FilterSelect label="Tier" value={fTier} onChange={(v) => setFTier(v as typeof fTier)}
            options={[["all","All tiers"], ...TIER_OPTIONS.map((t) => [t, t] as [string, string])]} />
          <FilterSelect label="Health" value={fHealth} onChange={(v) => setFHealth(v as typeof fHealth)}
            options={[["all","All health"], ...HEALTH_OPTIONS.map((t) => [t, t] as [string, string])]} />
          <FilterSelect label="Env" value={fEnv} onChange={(v) => setFEnv(v as typeof fEnv)}
            options={[["all","All envs"], ...ENV_OPTIONS.map((t) => [t, t] as [string, string])]} />
          <FilterSelect label="Owner" value={fOwner} onChange={setFOwner}
            options={[["all","All owners"], ...ownerOptions.map((o) => [o, o] as [string, string])]} />
          <FilterSelect label="SLO" value={fSlo} onChange={(v) => setFSlo(v as typeof fSlo)}
            options={[["all","Any SLO state"],["hasSlo","Has SLO"],["noSlo","Missing SLO"]]} />
          <FilterSelect label="Readiness" value={fReadiness} onChange={(v) => setFReadiness(v as typeof fReadiness)}
            options={[["all","Any readiness"],["lt50","< 50"],["50to80","50–80"],["gte80","≥ 80"]]} />
          <FilterSelect label="Incidents" value={fIncident} onChange={(v) => setFIncident(v as typeof fIncident)}
            options={[["all","Any"],["active","Active"],["clear","Clear"]]} />
          <div className="ml-auto flex items-center gap-1">
            <ColumnSelector columns={columns.map((c) => ({ key: c.key, header: c.header }))}
              visible={visibleCols} onChange={setVisibleCols} />
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]" onClick={exportCsv}>
              <Download className="mr-1 h-3 w-3" /> Export
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[11.5px]"
              disabled={selectedIds.size < 2 || selectedIds.size > 4}
              onClick={() => setCompareOpen(true)}>
              <GitCompareArrows className="mr-1 h-3 w-3" /> Compare ({selectedIds.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState title="No services match" description="Adjust filters or clear the search to see the full catalog." />
      ) : view === "table" ? (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <DataGrid<PortfolioRow>
              rows={filtered}
              columns={columns}
              visibleColumns={visibleCols}
              getRowId={(r) => r.id}
              selection={{ selected: selectedIds, onChange: setSelectedIds }}
              caption="Service portfolio"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <ServiceCard key={r.id} row={r}
              selected={selectedIds.has(r.id)}
              onSelect={(checked) => {
                const next = new Set(selectedIds);
                if (checked) next.add(r.id); else next.delete(r.id);
                setSelectedIds(next);
              }}
              onOpen={() => navigate(`/runops/services/${r.id}`)}
              onOwner={() => setOwnerDrawer(r)}
              onAssign={() => setAssignOpen(r)}
              disabled={readOnly}
            />
          ))}
        </div>
      )}

      {/* Owner drawer */}
      <Sheet open={!!ownerDrawer} onOpenChange={(o) => !o && setOwnerDrawer(null)}>
        <SheetContent className="w-[420px]">
          {ownerDrawer && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[15px]">{ownerDrawer.owner}</SheetTitle>
                <SheetDescription>
                  Owning team for <span className="font-medium text-slate-800">{ownerDrawer.name}</span>
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-[12.5px]">
                <KV k="Service" v={ownerDrawer.name} />
                <KV k="Tier" v={ownerDrawer.tier} />
                <KV k="Business owner" v={ownerDrawer.businessOwner} />
                <KV k="Technology" v={ownerDrawer.technology} />
                <KV k="Journey" v={ownerDrawer.journey} />
                <KV k="Capability" v={ownerDrawer.capability} />
                <KV k="Environments" v={ownerDrawer.environments.join(", ")} />
                <KV k="Region" v={ownerDrawer.region} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setAssignOpen(ownerDrawer); setOwnerDrawer(null); }} disabled={readOnly}>
                  <UserRound className="mr-1 h-3 w-3" /> Reassign owner
                </Button>
                <Button size="sm" onClick={() => { navigate(`/runops/services/${ownerDrawer.id}`); setOwnerDrawer(null); }}>
                  Open service
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Compare drawer */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent className="w-[720px] max-w-full">
          <SheetHeader>
            <SheetTitle className="text-[15px]">Compare services</SheetTitle>
            <SheetDescription>Up to four services side by side.</SheetDescription>
          </SheetHeader>
          <CompareTable rows={filtered.filter((r) => selectedIds.has(r.id)).slice(0, 4)} />
        </SheetContent>
      </Sheet>

      {/* Assign owner dialog */}
      <AssignOwnerDialog row={assignOpen} onClose={() => setAssignOpen(null)}
        onSubmit={(owner, biz) => { if (assignOpen) assignOwner(assignOpen, owner, biz); setAssignOpen(null); }} />

      {/* Create service dialog */}
      <CreateServiceDialog open={createOpen} onClose={() => setCreateOpen(false)}
        onSubmit={(p) => { createService(p); setCreateOpen(false); }} />
    </div>
  );
}

/* ------------------------------ Sub-components -------------------------- */

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10.5px] uppercase tracking-wide text-slate-500">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 w-[130px] text-[11.5px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v} className="text-[11.5px]">{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  const tone = tier === "Tier 1" ? "bg-red-50 text-red-800 border-red-200"
    : tier === "Tier 2" ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10.5px] font-semibold ${tone}`}>{tier}</span>;
}

function HealthChip({ value }: { value: Health }) {
  const tone: "healthy" | "at-risk" | "warning" | "critical" | "neutral" =
    value === "Healthy" ? "healthy"
    : value === "At Risk" ? "at-risk"
    : value === "Degraded" ? "warning"
    : value === "Severely Degraded" ? "critical"
    : value === "Unavailable" ? "critical" : "neutral";
  return <StatusIndicator tone={tone} label={value} />;
}

function BudgetChip({ pct }: { pct: number }) {
  const tone = pct < 20 ? "text-red-700" : pct < 50 ? "text-amber-700" : "text-emerald-700";
  return <span className={`text-[11.5px] font-medium ${tone}`}>{pct}%</span>;
}

function CoverageBar({ pct }: { pct: number }) {
  const tone = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10.5px] text-slate-600">{pct}%</span>
    </div>
  );
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-1.5">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{k}</span>
      <span className="text-right text-slate-800">{v}</span>
    </div>
  );
}

function formatRel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.round(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function ServiceCard({ row, selected, onSelect, onOpen, onOwner, onAssign, disabled }: {
  row: PortfolioRow; selected: boolean; onSelect: (v: boolean) => void;
  onOpen: () => void; onOwner: () => void; onAssign: () => void; disabled: boolean;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <TierBadge tier={row.tier} />
            <HealthChip value={row.health} />
            {row.activeIncidents > 0 && (
              <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-red-800">
                <ShieldAlert className="h-3 w-3" />Active INC
              </span>
            )}
          </div>
          <CardTitle className="mt-1 text-[14px]">
            <button className="hover:underline" onClick={onOpen}>{row.name}</button>
          </CardTitle>
          <div className="text-[11px] text-slate-500">{row.id}</div>
        </div>
        <Checkbox checked={selected} onCheckedChange={(v) => onSelect(!!v)} aria-label={`Select ${row.name}`} />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-[11.5px] text-slate-600 line-clamp-2">{row.purpose}</p>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <KV k="Owner" v={<button className="hover:underline" onClick={onOwner}>{row.owner}</button>} />
          <KV k="Business" v={row.businessOwner} />
          <KV k="Envs" v={row.environments.join(", ")} />
          <KV k="Region" v={row.region} />
          <KV k="SLO" v={row.hasSlo ? `${row.sloAvailability.toFixed(2)}%` : <span className="text-amber-700">Missing</span>} />
          <KV k="Budget" v={<BudgetChip pct={row.errorBudgetRemaining} />} />
          <KV k="Runbooks" v={<CoverageBar pct={Math.round(row.runbookCoverage * 100)} />} />
          <KV k="Workers" v={<CoverageBar pct={Math.round(row.workerCoverage * 100)} />} />
        </div>
        <div className="flex items-center justify-between pt-1">
          <ReadinessScore score={row.readinessScore} label="Readiness" />
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAssign} disabled={disabled}>
              <UserRound className="mr-1 h-3 w-3" /> Assign
            </Button>
            <Button size="sm" className="h-7 text-[11px]" onClick={onOpen}>Open</Button>
          </div>
        </div>
        {(row.telemetryGap || row.certificationExpiring) && (
          <div className="flex items-center gap-1 pt-1 text-[10.5px] text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            {row.telemetryGap && "Telemetry gap"}
            {row.telemetryGap && row.certificationExpiring && " · "}
            {row.certificationExpiring && "Cert expiring"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompareTable({ rows }: { rows: PortfolioRow[] }) {
  if (rows.length < 2) {
    return <EmptyState title="Pick 2–4 services" description="Select services in the table or cards to compare." />;
  }
  const specs: [string, (r: PortfolioRow) => ReactNode][] = [
    ["Tier", (r) => <TierBadge tier={r.tier} />],
    ["Health", (r) => <HealthChip value={r.health} />],
    ["Owner", (r) => r.owner],
    ["Business owner", (r) => r.businessOwner],
    ["Environments", (r) => r.environments.join(", ")],
    ["Region", (r) => r.region],
    ["SLO availability", (r) => r.hasSlo ? `${r.sloAvailability.toFixed(2)}%` : "—"],
    ["Latency target", (r) => r.hasSlo ? `${r.sloLatencyMs}ms` : "—"],
    ["Error budget", (r) => <BudgetChip pct={r.errorBudgetRemaining} />],
    ["Active incidents", (r) => r.activeIncidents],
    ["Recent change risk", (r) => r.recentChangeRisk],
    ["Runbook coverage", (r) => <CoverageBar pct={Math.round(r.runbookCoverage * 100)} />],
    ["Worker coverage", (r) => <CoverageBar pct={Math.round(r.workerCoverage * 100)} />],
    ["Readiness", (r) => <ReadinessScore score={r.readinessScore} label="" />],
  ];
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-[12px]">
        <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-2 py-2">Attribute</th>
            {rows.map((r) => <th key={r.id} className="px-2 py-2">{r.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {specs.map(([label, fn]) => (
            <tr key={label} className="border-t border-slate-100">
              <td className="px-2 py-1.5 text-slate-500">{label}</td>
              {rows.map((r) => <td key={r.id} className="px-2 py-1.5 text-slate-800">{fn(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignOwnerDialog({ row, onClose, onSubmit }: {
  row: PortfolioRow | null; onClose: () => void; onSubmit: (owner: string, biz: string) => void;
}) {
  const [owner, setOwner] = useState("");
  const [biz, setBiz] = useState("");
  useEffect(() => { if (row) { setOwner(row.owner); setBiz(row.businessOwner); } }, [row]);
  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign owner</DialogTitle>
          <DialogDescription>{row?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="own">Owner team</Label>
            <Input id="own" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Platform SRE" />
          </div>
          <div>
            <Label htmlFor="biz">Business owner</Label>
            <Input id="biz" value={biz} onChange={(e) => setBiz(e.target.value)} placeholder="VP Commerce" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(owner, biz)}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateServiceDialog({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void; onSubmit: (p: Omit<CreatedService, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tier, setTier] = useState<Tier>("Tier 3");
  const [environment, setEnvironment] = useState<Env>("Production");
  const [region, setRegion] = useState("US Central");
  const [owner, setOwner] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const valid = name.trim() && purpose.trim() && owner.trim();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create service</DialogTitle>
          <DialogDescription>Adds a new service and creates readiness tasks.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label htmlFor="n">Name*</Label>
            <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="p">Business purpose*</Label>
            <Textarea id="p" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div>
            <Label>Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{TIER_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Environment</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as Env)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{ENV_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="r">Region</Label>
            <Input id="r" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="o">Owner team*</Label>
            <Input id="o" value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="bo">Business owner</Label>
            <Input id="bo" value={businessOwner} onChange={(e) => setBusinessOwner(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={() => onSubmit({ name, purpose, tier, environment, region, owner, businessOwner })}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
