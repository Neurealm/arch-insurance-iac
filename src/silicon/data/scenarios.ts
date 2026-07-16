import type { ScenarioId, AnyEntity, Defect, RegressionResult, CoverageSummary, FormalProperty, AiAnalysis, SignoffGate } from "@/silicon/domain/types";

// Overlay engine. Pages MUST NOT compute scenario math themselves — they read
// through the repository, which applies overlays in one place.

export interface ScenarioDescriptor {
  id: ScenarioId; label: string; description: string; tone: "green" | "amber" | "red" | "blue";
}

export const SCENARIOS: readonly ScenarioDescriptor[] = [
  { id: "baseline-green",  label: "Baseline Green",         description: "Program is on track. All P0 tests pass, formal proven, sign-off criteria trend positive.", tone: "green" },
  { id: "t2-regression",   label: "Regression Degradation", description: "Nightly regression regresses on ring wrap; failure cluster surfaces.",                    tone: "amber" },
  { id: "t3-ai-rootcause", label: "AI-Assisted Root Cause", description: "AI analysis links cluster to committed_head update; recommendation pending review.",     tone: "blue"  },
  { id: "t4-fix-validated",label: "Fix Validated",          description: "Change merged, follow-up regression clean, formal now proven.",                          tone: "green" },
];

const clone = <T>(v: T): T => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/** Apply the active scenario to a single entity. */
export function applyScenario(entity: AnyEntity, scenario: ScenarioId): AnyEntity {
  if (scenario === "baseline-green") {
    // Force clean baseline: everything green.
    if (entity.kind === "defect") return { ...clone(entity), state: (entity as Defect).state === "closed" ? "closed" : "closed", severity: "low" } as AnyEntity;
    if (entity.kind === "regression") {
      const r = clone(entity as { kind: "regression" } & RegressionResult);
      r.totals = { total: r.totals.total, pass: r.totals.total, fail: 0, abort: 0, notRun: 0 };
      r.failureClusters = [];
      r.infraAborts = 0;
      return r as AnyEntity;
    }
    if (entity.kind === "formal") {
      const f = clone(entity as { kind: "formal" } & FormalProperty);
      if (f.status === "failed" || f.status === "inconclusive") f.status = "proven";
      return f as AnyEntity;
    }
    if (entity.kind === "signoff") {
      const s = clone(entity as { kind: "signoff" } & SignoffGate);
      s.criteria = s.criteria.map(c => ({ ...c, passing: true }));
      s.state = "approved";
      return s as AnyEntity;
    }
    return entity;
  }

  if (scenario === "t2-regression" || scenario === "t3-ai-rootcause") {
    // Canonical seeds already represent the regression window — return as-is.
    return entity;
  }

  if (scenario === "t4-fix-validated") {
    if (entity.kind === "defect" && (entity as Defect).id === ("DEF-DDMAC-101" as unknown as Defect["id"])) {
      return { ...clone(entity), state: "verify" } as AnyEntity;
    }
    if (entity.kind === "regression") {
      const r = clone(entity as { kind: "regression" } & RegressionResult);
      if (r.name.startsWith("nightly")) {
        r.totals = { ...r.totals, fail: Math.max(0, r.totals.fail - 7), pass: r.totals.pass + 7 };
        r.failureClusters = r.failureClusters.filter(c => c.id !== "fc-ring-boundary");
      }
      return r as AnyEntity;
    }
    if (entity.kind === "formal") {
      const f = clone(entity as { kind: "formal" } & FormalProperty);
      if (f.name === "ring_wrap_committed_head_ok") f.status = "proven";
      return f as AnyEntity;
    }
    if (entity.kind === "aiAnalysis") {
      const a = clone(entity as { kind: "aiAnalysis" } & AiAnalysis);
      a.approvalStatus = "approved";
      return a as AnyEntity;
    }
    return entity;
  }

  return entity;
}

/** Overlay-adjust a coverage summary. */
export function applyCoverageScenario(cov: CoverageSummary, scenario: ScenarioId): CoverageSummary {
  const c = clone(cov);
  if (scenario === "baseline-green")   { c.percent = 91.2; }
  if (scenario === "t2-regression")    { c.percent = 87.1; }
  if (scenario === "t3-ai-rootcause")  { c.percent = 87.4; }
  if (scenario === "t4-fix-validated") { c.percent = 90.6; }
  return c;
}
