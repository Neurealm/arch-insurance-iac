import { asId, Test, TestId, IpId, PersonId, RequirementId, RegressionResult, RegressionId, CoverageSummary, CoverageBin, ModuleId, FailureCluster } from "@/silicon/domain/types";

const IP = asId<IpId>("ip-ddmac-240");
const T = (s: string) => asId<TestId>(s);
const R = (s: string) => asId<RequirementId>(s);

export const tests: Test[] = [
  { id: T("test-ring-wrap-01"),          ipId: IP, name: "ring_wrap_basic",           suite: "smoke",      ownerId: asId<PersonId>("person-marco-rossi"), lastStatus: "pass", lastRunAt: "2026-07-14T15:20:00Z", requirementIds: [R("REQ-DDMAC-001")] },
  { id: T("test-ring-wrap-02"),          ipId: IP, name: "ring_wrap_stress",          suite: "regression", ownerId: asId<PersonId>("person-marco-rossi"), lastStatus: "pass", lastRunAt: "2026-07-14T14:12:00Z", requirementIds: [R("REQ-DDMAC-001")] },
  { id: T("test-ring-wrap-boundary-01"), ipId: IP, name: "ring_wrap_boundary_edge",   suite: "regression", ownerId: asId<PersonId>("person-priya-nair"),  lastStatus: "fail", lastRunAt: "2026-07-14T15:25:00Z", requirementIds: [R("REQ-DDMAC-011")] },
  { id: T("test-cmpl-thresh-01"),        ipId: IP, name: "cmpl_threshold_sweep",      suite: "regression", ownerId: asId<PersonId>("person-kai-zhou"),    lastStatus: "pass", lastRunAt: "2026-07-14T14:55:00Z", requirementIds: [R("REQ-DDMAC-002")] },
  { id: T("test-axi-bp-01"),             ipId: IP, name: "axi_back_pressure_max",     suite: "regression", ownerId: asId<PersonId>("person-kai-zhou"),    lastStatus: "pass", lastRunAt: "2026-07-14T15:01:00Z", requirementIds: [R("REQ-DDMAC-004")] },
  { id: T("test-reset-01"),              ipId: IP, name: "reset_readiness_32c",       suite: "smoke",      ownerId: asId<PersonId>("person-marco-rossi"), lastStatus: "pass", lastRunAt: "2026-07-14T15:22:00Z", requirementIds: [R("REQ-DDMAC-006")] },
  { id: T("test-mac-tx-01"),             ipId: IP, name: "mac_tx_phy_handshake",      suite: "regression", ownerId: asId<PersonId>("person-kai-zhou"),    lastStatus: "pass", lastRunAt: "2026-07-14T13:44:00Z", requirementIds: [R("REQ-DDMAC-009")] },
  { id: T("test-mac-rx-01"),             ipId: IP, name: "mac_rx_frame_len_err",      suite: "regression", ownerId: asId<PersonId>("person-marco-rossi"), lastStatus: "pass", lastRunAt: "2026-07-14T13:12:00Z", requirementIds: [R("REQ-DDMAC-010")] },
  { id: T("test-irq-coalesce-01"),       ipId: IP, name: "irq_coalesce_hitcount",     suite: "regression", ownerId: asId<PersonId>("person-kai-zhou"),    lastStatus: "abort", lastRunAt: "2026-07-14T15:15:00Z", requirementIds: [] },
  { id: T("test-perf-64b-01"),           ipId: IP, name: "perf_64b_line_rate",        suite: "perf",       ownerId: asId<PersonId>("person-kai-zhou"),    lastStatus: "pass", lastRunAt: "2026-07-14T12:00:00Z", requirementIds: [] },
];

const clusters: FailureCluster[] = [
  { id: "fc-ring-boundary", label: "ring_wrap boundary desync", count: 7, likelyModuleId: asId<ModuleId>("mod-ring-mgr"), hint: "committed_head lags producer by 1 on wrap." },
  { id: "fc-irq-underflow", label: "irq_coalesce_hit underflow", count: 3, likelyModuleId: asId<ModuleId>("mod-irq"),      hint: "hit counter decrements before mask update." },
];

export const regressions: RegressionResult[] = [
  { id: asId<RegressionId>("regr-nightly-2026-07-14"), ipId: IP, name: "nightly-2026-07-14", startedAt: "2026-07-14T02:00:00Z", durationMinutes: 214, totals: { total: 812, pass: 786, fail: 12, abort: 8, notRun: 6 }, infraAborts: 5, failureClusters: clusters },
  { id: asId<RegressionId>("regr-smoke-2026-07-14"),   ipId: IP, name: "smoke-2026-07-14",   startedAt: "2026-07-14T15:00:00Z", durationMinutes: 22,  totals: { total: 42,  pass: 42,  fail: 0,  abort: 0,  notRun: 0 }, infraAborts: 0, failureClusters: [] },
  { id: asId<RegressionId>("regr-perf-2026-07-13"),    ipId: IP, name: "perf-2026-07-13",    startedAt: "2026-07-13T21:00:00Z", durationMinutes: 96,  totals: { total: 60,  pass: 58,  fail: 1,  abort: 1,  notRun: 0 }, infraAborts: 1, failureClusters: [] },
];

const bins: CoverageBin[] = [
  { id: "cov-line",       label: "Line",       hits: 92_400, goal: 100_000, kind: "line" },
  { id: "cov-toggle",     label: "Toggle",     hits: 46_800, goal:  55_000, kind: "toggle" },
  { id: "cov-fsm",        label: "FSM",        hits:    142, goal:    160, kind: "fsm" },
  { id: "cov-functional", label: "Functional", hits:    980, goal:  1_200, kind: "functional" },
];
export const coverage: CoverageSummary = { ipId: IP, percent: 88.4, threshold: 90, bins, updatedAt: "2026-07-14T15:10:00Z" };
