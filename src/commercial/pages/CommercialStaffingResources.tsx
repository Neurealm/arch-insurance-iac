import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StaffingHeader } from "@/commercial/staffing/StaffingHeader";
import { StaffingSummaryCards } from "@/commercial/staffing/StaffingSummaryCards";
import { StaffingForecastChart } from "@/commercial/staffing/StaffingForecastChart";
import { OperationalPhaseCards } from "@/commercial/staffing/OperationalPhaseCards";
import { FunctionalAllocationChart } from "@/commercial/staffing/FunctionalAllocationChart";
import { ResourceHealthPanel } from "@/commercial/staffing/ResourceHealthPanel";
import { RoleStaffingTable } from "@/commercial/staffing/RoleStaffingTable";
import { CriticalRoleCoverage } from "@/commercial/staffing/CriticalRoleCoverage";
import { ResourcePipeline } from "@/commercial/staffing/ResourcePipeline";
import { OperatingStructureCards } from "@/commercial/staffing/OperatingStructureCards";
import { CapacityGapTable } from "@/commercial/staffing/CapacityGapTable";
import { ResourceRiskTable } from "@/commercial/staffing/ResourceRiskTable";
import { ExecutiveStaffingAttention } from "@/commercial/staffing/ExecutiveStaffingAttention";
import { StaffingPrototypeNotice } from "@/commercial/staffing/StaffingPrototypeNotice";
import {
  StaffingFilters,
  StaffingFilterChips,
  countActiveFilters,
} from "@/commercial/staffing/StaffingFilters";
import {
  CAPACITY_GAPS,
  CRITICAL_ROLES,
  EMPTY_STAFFING_FILTERS,
  FUNCTION_LABELS,
  PIPELINE_ITEMS,
  PIPELINE_STAGES,
  RESOURCE_RISKS,
  ROLE_TOTALS,
  STAFFING_ROLES,
  STAFFING_SUMMARY,
  fte,
  scenarioFactor,
  type CapacityGap,
  type CriticalRole,
  type PhaseKey,
  type ResourcePipelineItem,
  type ResourceRisk,
  type ScenarioKey,
  type StaffingFilterState,
  type StaffingRole,
} from "@/data/staffingResourcesMockData";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function CommercialStaffingResources() {
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [filters, setFilters] = useState<StaffingFilterState>({ ...EMPTY_STAFFING_FILTERS });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const [roles, setRoles] = useState<StaffingRole[]>(STAFFING_ROLES);
  const [criticalRoles, setCriticalRoles] = useState<CriticalRole[]>(CRITICAL_ROLES);
  const [pipeline, setPipeline] = useState<ResourcePipelineItem[]>(PIPELINE_ITEMS);
  const [risks, setRisks] = useState<ResourceRisk[]>(RESOURCE_RISKS);

  const factor = scenarioFactor(scenario);
  const activePhases = filters.phases;

  const markDirty = (message: string) => {
    setDirty(true);
    toast.success(message);
  };

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (filters.search && !`${r.role} ${r.owner} ${r.skills.join(" ")}`.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.functions.length && !filters.functions.includes(r.functionKey)) return false;
      if (filters.structures.length && !filters.structures.includes(r.structure)) return false;
      if (filters.statuses.length && !filters.statuses.includes(r.status)) return false;
      if (filters.resourceTypes.length && !filters.resourceTypes.includes(r.resourceType)) return false;
      if (filters.locationModels.length && !filters.locationModels.includes(r.locationModel)) return false;
      if (filters.utilizationMin > 0 && r.utilization < filters.utilizationMin) return false;
      if (filters.openOnly && r.open <= 0) return false;
      if (filters.atRiskOnly && r.status !== "At Risk") return false;
      if (filters.phases.length) {
        const has = filters.phases.some((p) => r[p] > 0);
        if (!has) return false;
      }
      return true;
    });
  }, [roles, filters]);

  const totals = useMemo(() => {
    if (filteredRoles.length === roles.length) return ROLE_TOTALS;
    const sum = (fn: (r: StaffingRole) => number) => filteredRoles.reduce((a, r) => a + fn(r), 0);
    const filled = sum((r) => r.filled);
    const planned = sum((r) => r.totalPlanned);
    return {
      day0: fte(sum((r) => r.day0)),
      day1: fte(sum((r) => r.day1)),
      day2: fte(sum((r) => r.day2)),
      totalPlanned: fte(planned),
      filled: fte(filled),
      open: sum((r) => r.open),
      utilization: planned ? Math.round((filled / planned) * 100) : 0,
    };
  }, [filteredRoles, roles.length]);

  const visibleCritical = useMemo(
    () =>
      criticalRoles.filter((c) => {
        if (filters.phases.length && !filters.phases.includes(c.phase)) return false;
        if (filters.openOnly && c.status === "Filled") return false;
        return true;
      }),
    [criticalRoles, filters.phases, filters.openOnly],
  );

  const gaps = useMemo(
    () => (filters.gapsOnly ? CAPACITY_GAPS.filter((g) => g.gap > 0) : CAPACITY_GAPS),
    [filters.gapsOnly],
  );

  const activeFilterCount = countActiveFilters(filters);

  const resetAll = () => {
    setRoles(STAFFING_ROLES);
    setCriticalRoles(CRITICAL_ROLES);
    setPipeline(PIPELINE_ITEMS);
    setRisks(RESOURCE_RISKS);
    setFilters({ ...EMPTY_STAFFING_FILTERS });
    setScenario("base");
    setSelectedCard(null);
    setDirty(false);
    toast.success("Staffing view reset to the baseline mock data.");
  };

  return (
    <div className="space-y-6 pb-10">
      <StaffingHeader
        scenario={scenario}
        onScenarioChange={(s) => {
          setScenario(s);
          toast.success("Scenario applied to the staffing forecast.");
        }}
        onExport={(option) => toast.success(`${option} is not available in this prototype.`)}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
        onReset={resetAll}
        onNotifications={() => toast.success("6 staffing items require executive attention.")}
        notificationCount={6}
        hasLocalChanges={dirty}
      />

      <StaffingFilterChips filters={filters} onChange={setFilters} />

      <StaffingSummaryCards
        cards={STAFFING_SUMMARY}
        selectedId={selectedCard}
        onSelect={(card) => setSelectedCard((prev) => (prev === card.id ? null : card.id))}
      />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <RoleStaffingTable
          roles={filteredRoles}
          totals={totals}
          factor={factor}
          search={filters.search}
          onSearchChange={(v) => setFilters((f) => ({ ...f, search: v }))}
          openOnly={filters.openOnly}
          onToggleOpenOnly={() => setFilters((f) => ({ ...f, openOnly: !f.openOnly }))}
          overallocatedOnly={filters.utilizationMin >= 95}
          onToggleOverallocated={() =>
            setFilters((f) => ({ ...f, utilizationMin: f.utilizationMin >= 95 ? 0 : 95 }))
          }
          onUpdateRole={(id, patch, message) => {
            setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
            markDirty(message);
          }}
          onAddRole={() => {
            const id = `r-local-${roles.length + 1}`;
            setRoles((prev) => [
              ...prev,
              {
                ...STAFFING_ROLES[0],
                id,
                role: `New Planned Role ${prev.length + 1}`,
                filled: 0,
                open: 1,
                totalPlanned: 1,
                day0: 0,
                day1: 1,
                day2: 1,
                utilization: 0,
                status: "Attention Required",
                notes: "Locally added planning placeholder.",
              },
            ]);
            markDirty("Planned role added locally.");
          }}
        />
        <div className="space-y-6">
          <FunctionalAllocationChart
            factor={factor}
            onFilterFunction={(key) => {
              setFilters((f) => ({ ...f, functions: [key] }));
              toast.success(`Plan filtered to ${FUNCTION_LABELS[key] ?? key}.`);
            }}
          />
          <ResourceHealthPanel onViewRisks={() => scrollTo("resource-risks")} />
        </div>
      </div>

      <OperationalPhaseCards
        factor={factor}
        activePhases={activePhases}
        onToggle={(phase: PhaseKey) =>
          setFilters((f) => ({
            ...f,
            phases: f.phases.includes(phase) ? f.phases.filter((p) => p !== phase) : [...f.phases, phase],
          }))
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <StaffingForecastChart
          factor={factor}
          scenario={scenario}
          activePhases={activePhases}
          onSegmentSelect={(functionKey, phase) =>
            setFilters((f) => ({
              ...f,
              functions: [functionKey],
              phases: [phase],
            }))
          }
        />
        <div className="space-y-6">
          <CriticalRoleCoverage
            roles={visibleCritical}
            onUpdate={(id, patch, message) => {
              setCriticalRoles((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
              markDirty(message);
            }}
          />
          <ResourcePipeline
            items={pipeline}
            onAdvance={(id) => {
              setPipeline((prev) =>
                prev.map((p) => {
                  if (p.id !== id) return p;
                  const next = Math.min(PIPELINE_STAGES.indexOf(p.stage) + 1, PIPELINE_STAGES.length - 1);
                  return { ...p, stage: PIPELINE_STAGES[next] };
                }),
              );
              markDirty("Pipeline stage advanced locally.");
            }}
            onAddCandidate={() => {
              setPipeline((prev) => [
                ...prev,
                {
                  id: `pi-local-${prev.length + 1}`,
                  name: "Unnamed Candidate",
                  source: "New Hire",
                  role: "Automation Engineer",
                  stage: PIPELINE_STAGES[0],
                  expectedStart: "October 1, 2026",
                },
              ]);
              markDirty("Mock candidate added locally.");
            }}
          />
        </div>
      </div>

      <OperatingStructureCards
        factor={factor}
        onFilterStructure={(name) => {
          setFilters((f) => ({ ...f, structures: [name] }));
          toast.success(`Plan filtered to ${name}.`);
        }}
      />

      <CapacityGapTable
        gaps={gaps}
        onAction={(gap, action) => markDirty(`${action} recorded locally for ${gap.area}.`)}
      />

      <ResourceRiskTable
        risks={risks}
        onUpdate={(id, patch, message) => {
          setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
          markDirty(message);
        }}
        onAdd={() => {
          setRisks((prev) => [
            ...prev,
            {
              id: `rr-local-${prev.length + 1}`,
              title: "Locally captured staffing risk",
              severity: "Medium",
              owner: "PMO",
              impact: "Impact to be assessed",
              mitigation: "Mitigation to be agreed",
              status: "Open",
            },
          ]);
          markDirty("Resource risk added locally.");
        }}
      />

      <ExecutiveStaffingAttention
        onViewGaps={() => setFilters((f) => ({ ...f, gapsOnly: true }))}
        onOpenPositions={() => setFilters((f) => ({ ...f, openOnly: true }))}
        onReviewRisks={() => scrollTo("resource-risks")}
      />

      <StaffingPrototypeNotice />

      <StaffingFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={setFilters}
        scenario={scenario}
        onScenarioChange={setScenario}
      />
    </div>
  );
}
