// Prompt 0E — repository. Single source of truth used by every page & component.
// Pages MUST NOT import canonical files directly.

import { useMemo } from "react";
import { tenants, portfolios, programs, ips } from "@/silicon/data/canonical/hierarchy";
import { modules, interfaces, registers } from "@/silicon/data/canonical/modules";
import { requirements } from "@/silicon/data/canonical/requirements";
import { specifications } from "@/silicon/data/canonical/specs";
import { tests, regressions, coverage } from "@/silicon/data/canonical/tests";
import { formalProperties, staticFindings, defects } from "@/silicon/data/canonical/verification";
import { aiAnalyses, changes, milestones, signoffs } from "@/silicon/data/canonical/program";
import { people, teams } from "@/silicon/data/canonical/people";
import { applyScenario, applyCoverageScenario, SCENARIOS } from "@/silicon/data/scenarios";
import type { ScenarioId, AnyEntity, EntityKind, ActiveFilters, Person, Team } from "@/silicon/domain/types";
import { useSiliconStore } from "@/silicon/state/SiliconStore";

const bundleAll = () => ({
  tenants, portfolios, programs, ips,
  modules, interfaces, registers, requirements, specifications,
  tests, regressions, formalProperties, staticFindings, defects,
  aiAnalyses, changes, milestones, signoffs, people, teams, coverage,
});

const kindOfCollection: Record<string, EntityKind> = {
  requirements: "requirement", specifications: "specification", modules: "module",
  interfaces: "interface", registers: "register", tests: "test",
  regressions: "regression", formalProperties: "formal", staticFindings: "static",
  defects: "defect", aiAnalyses: "aiAnalysis", changes: "change",
  milestones: "milestone", signoffs: "signoff", people: "person", teams: "team",
};

// Cache per-scenario overlays so re-renders don't reallocate.
const overlayCache = new Map<ScenarioId, ReturnType<typeof buildOverlay>>();

function buildOverlay(scenario: ScenarioId) {
  const raw = bundleAll();
  const overlaid: Record<string, any[]> = {};
  for (const [key, arr] of Object.entries(raw)) {
    const kind = kindOfCollection[key];
    if (!kind || !Array.isArray(arr)) continue;
    overlaid[key] = arr.map((entity: any) => applyScenario({ kind, ...entity } as AnyEntity, scenario) as any);
  }
  return {
    ...raw,
    ...overlaid,
    coverage: applyCoverageScenario(raw.coverage, scenario),
  };
}

export function getOverlay(scenario: ScenarioId) {
  let cached = overlayCache.get(scenario);
  if (!cached) { cached = buildOverlay(scenario); overlayCache.set(scenario, cached); }
  return cached;
}

/* ---------- filter helpers ---------- */

const asArr = (v?: string | string[]) => (v == null ? [] : Array.isArray(v) ? v : [v]);
function matches(entity: any, filters: ActiveFilters): boolean {
  const status = asArr(filters.status);
  if (status.length && entity.state && !status.includes(entity.state)) return false;
  const severity = asArr(filters.severity);
  if (severity.length && entity.severity && !severity.includes(entity.severity)) return false;
  const owner = asArr(filters.owner);
  if (owner.length && entity.ownerId && !owner.includes(entity.ownerId)) return false;
  const mod = asArr(filters.module);
  if (mod.length && entity.moduleId && !mod.includes(entity.moduleId)) return false;
  const vm = asArr(filters.verificationMethod);
  if (vm.length && entity.verificationMethod && !vm.includes(entity.verificationMethod)) return false;
  const rc = asArr(filters.requirementCategory);
  if (rc.length && entity.category && !rc.includes(entity.category)) return false;
  const so = asArr(filters.signoffState);
  if (so.length && entity.state && !so.includes(entity.state)) return false;
  return true;
}

/* ---------- public API ---------- */

export function useRepository() {
  const scenario = useSiliconStore(s => s.selectedScenarioId);
  const filters  = useSiliconStore(s => s.activeFilters);

  return useMemo(() => {
    const o = getOverlay(scenario);
    const collect = <T,>(coll: T[]) => (coll as any[]).filter(x => matches(x, filters)) as T[];

    return {
      scenario,
      scenarios: SCENARIOS,
      raw: o,
      // Hierarchy
      tenants: o.tenants,
      portfolios: o.portfolios,
      programs: o.programs,
      ips: o.ips,
      // Filtered collections
      requirements:    collect(o.requirements),
      specifications:  collect(o.specifications),
      modules:         collect(o.modules),
      interfaces:      collect(o.interfaces),
      registers:       collect(o.registers),
      tests:           collect(o.tests),
      regressions:     collect(o.regressions),
      formalProperties:collect(o.formalProperties),
      staticFindings:  collect(o.staticFindings),
      defects:         collect(o.defects),
      aiAnalyses:      o.aiAnalyses,
      changes:         o.changes,
      milestones:      o.milestones,
      signoffs:        o.signoffs,
      people:          o.people as Person[],
      teams:           o.teams as Team[],
      coverage:        o.coverage,

      getEntity(kind: EntityKind, id: string): AnyEntity | undefined {
        const collectionByKind: Record<EntityKind, any[]> = {
          requirement: o.requirements, specification: o.specifications, module: o.modules,
          interface: o.interfaces, register: o.registers, test: o.tests,
          regression: o.regressions, formal: o.formalProperties, static: o.staticFindings,
          defect: o.defects, aiAnalysis: o.aiAnalyses, change: o.changes,
          milestone: o.milestones, signoff: o.signoffs, person: o.people, team: o.teams,
        };
        const hit = collectionByKind[kind]?.find((x: any) => x.id === id);
        return hit ? ({ kind, ...hit } as AnyEntity) : undefined;
      },

      // Local search index — flat list, ready for filtering.
      searchIndex(): { kind: EntityKind; id: string; label: string; hint?: string }[] {
        const idx: { kind: EntityKind; id: string; label: string; hint?: string }[] = [];
        const push = (kind: EntityKind, arr: any[], get: (x: any) => { label: string; hint?: string }) => {
          for (const x of arr) { const { label, hint } = get(x); idx.push({ kind, id: x.id, label, hint }); }
        };
        push("requirement",   o.requirements,   x => ({ label: `${x.id} — ${x.title}`, hint: x.category }));
        push("specification", o.specifications, x => ({ label: `§${x.section} ${x.title}`, hint: `v${x.version}` }));
        push("module",        o.modules,        x => ({ label: x.name, hint: x.fileRef }));
        push("interface",     o.interfaces,     x => ({ label: x.name, hint: `${x.protocol} ${x.width}b` }));
        push("register",      o.registers,      x => ({ label: x.name, hint: `${x.offset} ${x.access}` }));
        push("test",          o.tests,          x => ({ label: x.name, hint: x.suite }));
        push("regression",    o.regressions,    x => ({ label: x.name, hint: `pass ${x.totals.pass}/${x.totals.total}` }));
        push("formal",        o.formalProperties, x => ({ label: x.name, hint: x.status }));
        push("static",        o.staticFindings, x => ({ label: `${x.rule} @ line ${x.line}`, hint: x.severity }));
        push("defect",        o.defects,        x => ({ label: `${x.id} — ${x.title}`, hint: x.state }));
        push("aiAnalysis",    o.aiAnalyses,     x => ({ label: `AI: ${x.targetId}`, hint: `conf ${(x.confidence.value*100).toFixed(0)}%` }));
        push("change",        o.changes,        x => ({ label: x.title, hint: x.state }));
        push("milestone",     o.milestones,     x => ({ label: x.name, hint: x.targetDate }));
        push("signoff",       o.signoffs,       x => ({ label: x.name, hint: x.state }));
        push("person",        o.people,         x => ({ label: x.name, hint: x.role }));
        push("team",          o.teams,          x => ({ label: x.name, hint: x.charter }));
        return idx;
      },
    };
  }, [scenario, filters]);
}
