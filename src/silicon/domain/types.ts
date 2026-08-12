// Prompt 0A — canonical domain types for the Silicon Verification foundation.
// All 16 entity kinds plus supporting shapes. Branded IDs for type-safe routing.

export type Brand<T, B> = T & { readonly __brand: B };

export type TenantId       = Brand<string, "TenantId">;
export type PortfolioId    = Brand<string, "PortfolioId">;
export type ProgramId      = Brand<string, "ProgramId">;
export type IpId           = Brand<string, "IpId">;
export type RequirementId  = Brand<string, "RequirementId">;
export type SpecId         = Brand<string, "SpecId">;
export type ModuleId       = Brand<string, "ModuleId">;
export type InterfaceId    = Brand<string, "InterfaceId">;
export type RegisterId     = Brand<string, "RegisterId">;
export type TestId         = Brand<string, "TestId">;
export type RegressionId   = Brand<string, "RegressionId">;
export type FormalId       = Brand<string, "FormalId">;
export type StaticId       = Brand<string, "StaticId">;
export type DefectId       = Brand<string, "DefectId">;
export type AiAnalysisId   = Brand<string, "AiAnalysisId">;
export type ChangeId       = Brand<string, "ChangeId">;
export type MilestoneId    = Brand<string, "MilestoneId">;
export type SignoffId      = Brand<string, "SignoffId">;
export type PersonId       = Brand<string, "PersonId">;
export type TeamId         = Brand<string, "TeamId">;

export const asId = <T extends string>(s: string): T => s as T;

export type ScenarioId = "baseline-green" | "t2-regression" | "t3-ai-rootcause" | "t4-fix-validated";
export type PersonaId  = "priya-nair" | "chip-architect" | "dv-engineer" | "program-manager" | "signoff-reviewer";

export type EntityKind =
  | "requirement" | "specification" | "module" | "interface" | "register"
  | "test" | "regression" | "formal" | "static" | "defect"
  | "aiAnalysis" | "change" | "milestone" | "signoff"
  | "person" | "team";

export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type StatusColor = "green" | "yellow" | "red" | "gray" | "blue";
export type Confidence = { value: number; band: "low" | "medium" | "high" };
export type SignoffState = "not-started" | "in-review" | "conditional" | "approved" | "blocked";

export interface EvidenceCitation {
  id: string;
  kind: "log" | "waveform" | "trace" | "commit" | "doc" | "regression" | "formal";
  label: string;
  ref?: string;
}

export interface Tenant     { id: TenantId; name: string; }
export interface Portfolio  { id: PortfolioId; tenantId: TenantId; name: string; }
export interface Program    { id: ProgramId; portfolioId: PortfolioId; name: string; tapeoutDate: string; }
export interface Ip         { id: IpId; programId: ProgramId; name: string; description: string; }

export interface Requirement {
  id: RequirementId; ipId: IpId; title: string; category: string;
  priority: Severity; verificationMethod: "sim" | "formal" | "review" | "silicon";
  ownerId: PersonId; status: "draft" | "approved" | "verified" | "waived";
  linkedSpecIds: SpecId[]; linkedTestIds: TestId[];
}

export interface Specification { id: SpecId; ipId: IpId; section: string; title: string; version: string; ownerId: PersonId; }

export interface RtlModule {
  id: ModuleId; ipId: IpId; name: string; parentId?: ModuleId; fileRef: string;
  linesOfCode: number; interfaceIds: InterfaceId[]; ownerId: PersonId;
}

export interface Interface { id: InterfaceId; moduleId: ModuleId; name: string; protocol: string; width: number; }

export type RegisterAccess = "RO" | "RW" | "W1C" | "WO";
export interface Register {
  id: RegisterId; moduleId: ModuleId; name: string; offset: string; access: RegisterAccess;
  resetValue: string; description: string;
}

export type TestStatus = "pass" | "fail" | "abort" | "not-run";
export interface Test {
  id: TestId; ipId: IpId; name: string; suite: string; ownerId: PersonId;
  lastStatus: TestStatus; lastRunAt: string; requirementIds: RequirementId[];
}

export interface RegressionResult {
  id: RegressionId; ipId: IpId; name: string; startedAt: string; durationMinutes: number;
  totals: { total: number; pass: number; fail: number; abort: number; notRun: number };
  infraAborts: number; failureClusters: FailureCluster[];
}
export interface FailureCluster {
  id: string; label: string; count: number; likelyModuleId?: ModuleId; hint: string;
}

export interface CoverageBin { id: string; label: string; hits: number; goal: number; kind: "line" | "toggle" | "fsm" | "functional"; }
export interface CoverageSummary { ipId: IpId; percent: number; threshold: number; bins: CoverageBin[]; updatedAt: string; }

export type FormalStatus = "proven" | "failed" | "inconclusive" | "vacuous" | "not-run";
export interface FormalProperty { id: FormalId; moduleId: ModuleId; name: string; status: FormalStatus; runtimeSec: number; }

export interface StaticFinding {
  id: StaticId; moduleId: ModuleId; rule: string; severity: Severity; line: number; message: string;
  state: "open" | "waived" | "fixed";
}

export interface Defect {
  id: DefectId; ipId: IpId; title: string; severity: Severity; state: "new" | "triaged" | "in-progress" | "verify" | "closed";
  ownerId: PersonId; moduleId?: ModuleId; linkedTestIds: TestId[]; createdAt: string;
}

export interface AiAnalysis {
  id: AiAnalysisId; targetKind: EntityKind; targetId: string;
  trigger: string; facts: string[]; evidence: EvidenceCitation[];
  inference: string; alternatives: string[]; confidence: Confidence;
  recommendation: string; expectedEffect: string; risk: string;
  humanReviewerId?: PersonId; approvalStatus: "pending" | "approved" | "denied";
  createdAt: string;
}

export interface EngineeringChange {
  id: ChangeId; ipId: IpId; title: string; author: PersonId; createdAt: string;
  filesChanged: number; linesAdded: number; linesRemoved: number;
  impactedModuleIds: ModuleId[]; state: "draft" | "review" | "approved" | "merged" | "rejected";
}

export interface Milestone { id: MilestoneId; programId: ProgramId; name: string; targetDate: string; status: StatusColor; }
export interface SignoffGate {
  id: SignoffId; programId: ProgramId; name: string; state: SignoffState;
  criteria: { label: string; passing: boolean }[]; ownerId: PersonId;
}

export interface Person { id: PersonId; name: string; role: string; teamId: TeamId; email: string; }
export interface Team   { id: TeamId; name: string; charter: string; }

export type AnyEntity =
  | ({ kind: "requirement" } & Requirement) | ({ kind: "specification" } & Specification)
  | ({ kind: "module" } & RtlModule) | ({ kind: "interface" } & Interface)
  | ({ kind: "register" } & Register) | ({ kind: "test" } & Test)
  | ({ kind: "regression" } & RegressionResult) | ({ kind: "formal" } & FormalProperty)
  | ({ kind: "static" } & StaticFinding) | ({ kind: "defect" } & Defect)
  | ({ kind: "aiAnalysis" } & AiAnalysis) | ({ kind: "change" } & EngineeringChange)
  | ({ kind: "milestone" } & Milestone) | ({ kind: "signoff" } & SignoffGate)
  | ({ kind: "person" } & Person) | ({ kind: "team" } & Team);

export type FilterKey =
  | "scenario" | "time" | "status" | "severity" | "owner" | "team"
  | "requirementCategory" | "module" | "verificationMethod" | "regression"
  | "defect" | "milestone" | "source" | "confidence" | "signoffState";

export type ActiveFilters = Partial<Record<FilterKey, string | string[]>>;
