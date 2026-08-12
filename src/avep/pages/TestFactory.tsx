import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Code2,
  Cpu,
  Filter,
  FlaskConical,
  GitBranch,
  Layers,
  PlayCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P2.VER.002 — Test, Stimulus, Assertion & Property Factory      */
/* Route: /avep/verification/test-factory                              */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";

type AssetState =
  | "Proposed"
  | "Generated"
  | "Reused"
  | "Modified"
  | "In Review"
  | "Approved"
  | "Blocked"
  | "Validation Required"
  | "Rejected"
  | "Missing";

interface StrategyRow {
  id: string;
  behavior: string;
  risk: "Low" | "Medium" | "High" | "Critical" | "Blocking";
  directed: AssetState;
  random: AssetState;
  negative: AssetState;
  assertion: AssetState;
  formal: AssetState;
  coverage: AssetState;
  priorDefect?: string;
  cost: "Low" | "Medium" | "High";
  confidence: number;
  owner: string;
  review: AssetState;
  category: "Functional" | "Security" | "Reset" | "Performance" | "Timing" | "Boundary";
}

interface KPI {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone?: "ok" | "warn" | "bad" | "info";
}

/* ------------------------------------------------------------------ */

const KPIS_BY_SCENARIO: Record<Scenario, KPI[]> = {
  T0: [
    { key: "map", label: "Objective mapping", value: "100%", detail: "62 of 62 objectives mapped", tone: "ok" },
    { key: "tests", label: "Proposed tests", value: "92", detail: "All categories represented", tone: "ok" },
    { key: "stim", label: "Stimulus constraints", value: "26", detail: "All peer-reviewed", tone: "ok" },
    { key: "asrt", label: "Assertions", value: "18", detail: "All semantics resolved", tone: "ok" },
    { key: "formal", label: "Formal candidates", value: "12", detail: "8 recommended for proof", tone: "ok" },
    { key: "cov", label: "Coverage objectives", value: "47", detail: "All crosses defined", tone: "ok" },
    { key: "defects", label: "Prior-defect reuse", value: "16", detail: "Historical scenarios validated", tone: "ok" },
    { key: "review", label: "Review readiness", value: "100%", detail: "All approvals in place", tone: "ok" },
  ],
  T1: [
    { key: "map", label: "Objective mapping", value: "71%", detail: "44 of 62 objectives mapped", tone: "bad" },
    { key: "tests", label: "Proposed tests", value: "54", detail: "Security & reset thin", tone: "warn" },
    { key: "stim", label: "Stimulus constraints", value: "14", detail: "Boundary sampling low", tone: "warn" },
    { key: "asrt", label: "Assertions", value: "9", detail: "Security asserts missing", tone: "bad" },
    { key: "formal", label: "Formal candidates", value: "4", detail: "No privilege proof", tone: "bad" },
    { key: "cov", label: "Coverage objectives", value: "31", detail: "Crosses undefined", tone: "warn" },
    { key: "defects", label: "Prior-defect reuse", value: "6", detail: "Reuse candidates unlinked", tone: "warn" },
    { key: "review", label: "Review readiness", value: "42%", detail: "Blocking gaps present", tone: "bad" },
  ],
  T2: [
    { key: "map", label: "Objective mapping", value: "87%", detail: "54 of 62 objectives mapped", tone: "info" },
    { key: "tests", label: "Proposed tests", value: "86", detail: "Across eight categories", tone: "info" },
    { key: "stim", label: "Stimulus constraints", value: "24", detail: "6 require peer review", tone: "warn" },
    { key: "asrt", label: "Assertions", value: "18", detail: "3 blocked by unclear semantics", tone: "warn" },
    { key: "formal", label: "Formal candidates", value: "12", detail: "7 recommended for proof", tone: "info" },
    { key: "cov", label: "Coverage objectives", value: "47", detail: "4 missing cross definitions", tone: "warn" },
    { key: "defects", label: "Prior-defect reuse", value: "14", detail: "Historical defects converted", tone: "info" },
    { key: "review", label: "Review readiness", value: "79%", detail: "Verification/formal pending", tone: "warn" },
  ],
  T3: [
    { key: "map", label: "Objective mapping", value: "87%", detail: "54 of 62 mapped", tone: "info" },
    { key: "tests", label: "Proposed tests", value: "86", detail: "1 weak test detected", tone: "warn" },
    { key: "stim", label: "Stimulus constraints", value: "24", detail: "Mutation passes undetected", tone: "bad" },
    { key: "asrt", label: "Assertions", value: "18", detail: "1 false-pass risk open", tone: "bad" },
    { key: "formal", label: "Formal candidates", value: "12", detail: "1 vacuous proof exposed", tone: "warn" },
    { key: "cov", label: "Coverage objectives", value: "47", detail: "Path covered, behavior unproven", tone: "warn" },
    { key: "defects", label: "Prior-defect reuse", value: "14", detail: "Similar mutation history", tone: "info" },
    { key: "review", label: "Review readiness", value: "63%", detail: "Return for revision issued", tone: "bad" },
  ],
};

const STRATEGY_ROWS: StrategyRow[] = [
  { id: "REQ-DDMAC-142", behavior: "Maximum transfer length rejection", risk: "High",     directed: "Approved", random: "Generated", negative: "Generated", assertion: "In Review", formal: "Generated", coverage: "Generated", priorDefect: "DEF-DV-173", cost: "Low",    confidence: 97, owner: "Sofia Rodriguez", review: "In Review", category: "Boundary" },
  { id: "REQ-DDMAC-143", behavior: "Error response timing (2-cycle)", risk: "Blocking",   directed: "Blocked",  random: "Blocked",   negative: "Blocked",   assertion: "Blocked",   formal: "Blocked",   coverage: "Proposed",  priorDefect: "DEF-DV-219", cost: "Medium", confidence: 41, owner: "Daniel Kim",     review: "Blocked",   category: "Timing" },
  { id: "REQ-SEC-088",   behavior: "Privileged register write enforcement", risk: "Critical", directed: "Approved", random: "In Review", negative: "Generated", assertion: "In Review", formal: "Generated", coverage: "Generated", priorDefect: "DEF-SEC-041", cost: "Medium", confidence: 95, owner: "Priya Shah",     review: "In Review", category: "Security" },
  { id: "ARCH-RESET-017",behavior: "Reset during descriptor validation", risk: "High",     directed: "Approved", random: "Generated", negative: "Generated", assertion: "Generated", formal: "Generated", coverage: "Generated", cost: "Medium", confidence: 88, owner: "Maya Chen",       review: "In Review", category: "Reset" },
  { id: "PERF-DDMAC-004",behavior: "Sustained throughput under legal traffic", risk: "Medium", directed: "Approved", random: "Generated", negative: "Missing",   assertion: "Missing",   formal: "Missing",   coverage: "Generated", cost: "High",   confidence: 84, owner: "Marcus Lee",     review: "In Review", category: "Performance" },
  { id: "REQ-DDMAC-144", behavior: "Accept and reject mutually exclusive", risk: "High",     directed: "Approved", random: "Generated", negative: "Generated", assertion: "Approved",  formal: "Approved",  coverage: "Approved",  cost: "Low",    confidence: 99, owner: "Sofia Rodriguez", review: "Approved",  category: "Functional" },
  { id: "REQ-DDMAC-145", behavior: "Descriptor completion neither lost nor duplicated", risk: "Critical", directed: "Approved", random: "Generated", negative: "Generated", assertion: "In Review", formal: "In Review", coverage: "Generated", cost: "Medium", confidence: 91, owner: "Daniel Kim", review: "In Review", category: "Functional" },
  { id: "REQ-DDMAC-146", behavior: "Back-to-back invalid descriptors", risk: "Medium",   directed: "Approved", random: "Generated", negative: "Generated", assertion: "Generated", formal: "Missing",   coverage: "Generated", cost: "Low",    confidence: 92, owner: "Sofia Rodriguez", review: "In Review", category: "Functional" },
  { id: "REQ-DDMAC-147", behavior: "Interrupt latency bound", risk: "Medium",   directed: "Approved", random: "Generated", negative: "Missing",   assertion: "In Review", formal: "Missing",   coverage: "Generated", cost: "Low",    confidence: 82, owner: "Marcus Lee",     review: "In Review", category: "Timing" },
  { id: "REQ-SEC-089",   behavior: "Register access permission crossing", risk: "Critical", directed: "Generated", random: "Generated", negative: "Generated", assertion: "In Review", formal: "In Review", coverage: "Generated", priorDefect: "DEF-SEC-041", cost: "Medium", confidence: 90, owner: "Priya Shah", review: "In Review", category: "Security" },
  { id: "REQ-DDMAC-148", behavior: "Backpressure tolerance (256 cycles)", risk: "Medium",   directed: "Approved", random: "Generated", negative: "Generated", assertion: "Approved",  formal: "Missing",   coverage: "Generated", cost: "Medium", confidence: 87, owner: "Maya Chen", review: "Approved", category: "Functional" },
  { id: "REQ-DDMAC-149", behavior: "APB register write completes ≤3 cycles", risk: "Low", directed: "Approved", random: "Missing",   negative: "Missing",   assertion: "Approved",  formal: "Approved",  coverage: "Approved",  cost: "Low",    confidence: 98, owner: "Maya Chen",       review: "Approved",  category: "Timing" },
  { id: "REQ-DDMAC-150", behavior: "IRQ_MASK reset default all-masked", risk: "Low",       directed: "Approved", random: "Missing",   negative: "Missing",   assertion: "Approved",  formal: "Approved",  coverage: "Approved",  cost: "Low",    confidence: 99, owner: "Sofia Rodriguez", review: "Approved",  category: "Reset" },
  { id: "REQ-DDMAC-151", behavior: "Descriptor sequence tag monotonic", risk: "High",     directed: "Approved", random: "Generated", negative: "Generated", assertion: "In Review", formal: "In Review", coverage: "Generated", cost: "Medium", confidence: 86, owner: "Daniel Kim", review: "In Review", category: "Functional" },
  { id: "REQ-DDMAC-152", behavior: "wr_rsp_pending bounded by outstanding", risk: "Critical", directed: "Approved", random: "Generated", negative: "Generated", assertion: "Approved",  formal: "Approved",  coverage: "Approved",  cost: "Low",    confidence: 96, owner: "Daniel Kim", review: "Approved",  category: "Functional" },
  { id: "REQ-DDMAC-153", behavior: "Simultaneous error priority", risk: "High",       directed: "Generated", random: "Modified",  negative: "Generated", assertion: "In Review", formal: "Missing",   coverage: "Generated", cost: "Medium", confidence: 76, owner: "Sofia Rodriguez", review: "Validation Required", category: "Functional" },
  { id: "ARCH-CDC-004",  behavior: "Completion valid CDC synchronization", risk: "Critical", directed: "Generated", random: "Generated", negative: "Generated", assertion: "In Review", formal: "In Review", coverage: "Generated", cost: "High",   confidence: 78, owner: "Daniel Kim",     review: "In Review",  category: "Functional" },
  { id: "PERF-DDMAC-005",behavior: "64B line-rate throughput", risk: "Medium",       directed: "Approved", random: "Generated", negative: "Missing",   assertion: "Missing",   formal: "Missing",   coverage: "Generated", cost: "High",   confidence: 80, owner: "Marcus Lee", review: "In Review", category: "Performance" },
  { id: "REQ-SEC-090",   behavior: "Noninterference across privileged state", risk: "Critical", directed: "Generated", random: "Generated", negative: "Generated", assertion: "In Review", formal: "In Review", coverage: "Proposed", cost: "Medium", confidence: 88, owner: "Priya Shah", review: "In Review", category: "Security" },
  { id: "REQ-DDMAC-154", behavior: "State returns to IDLE after reset", risk: "High",     directed: "Approved", random: "Generated", negative: "Generated", assertion: "Approved",  formal: "Approved",  coverage: "Generated", cost: "Low",    confidence: 97, owner: "Maya Chen", review: "Approved", category: "Reset" },
  { id: "REQ-DDMAC-155", behavior: "Error code matches detected condition", risk: "Medium", directed: "Generated", random: "Generated", negative: "Generated", assertion: "In Review", formal: "In Review", coverage: "Generated", cost: "Medium", confidence: 84, owner: "Sofia Rodriguez", review: "In Review", category: "Functional" },
];

const TEST_CATEGORIES = ["Directed", "Constrained Random", "Negative", "Reset", "Error Injection", "Boundary", "Performance", "Security"] as const;

const GENERATED_TESTS = [
  { name: "test_desc_length_below_max", cat: "Directed",           req: "REQ-DDMAC-142", seed: "0x0001..0x0003", runtime: "3m", cov: "length.below", owner: "Sofia Rodriguez", state: "Approved" },
  { name: "test_desc_length_at_max",    cat: "Boundary",           req: "REQ-DDMAC-142", seed: "0x0010",         runtime: "3m", cov: "length.equal", owner: "Sofia Rodriguez", state: "Approved" },
  { name: "test_desc_length_above_max", cat: "Negative",           req: "REQ-DDMAC-142", seed: "0x0020",         runtime: "3m", cov: "length.above,result.reject", owner: "Sofia Rodriguez", state: "In Review" },
  { name: "test_desc_privilege_violation", cat: "Security",        req: "REQ-SEC-088",   seed: "0x1000..0x100F", runtime: "12m", cov: "priv.cross.result", owner: "Priya Shah", state: "In Review" },
  { name: "test_desc_dual_error_priority", cat: "Error Injection", req: "REQ-DDMAC-153", seed: "0x2000..0x20FF", runtime: "22m", cov: "err.simultaneous", owner: "Sofia Rodriguez", state: "Validation Required" },
  { name: "test_reset_during_validate", cat: "Reset",              req: "ARCH-RESET-017", seed: "0x3000..0x300F", runtime: "8m", cov: "reset.state.cross", owner: "Maya Chen", state: "In Review" },
  { name: "test_reset_during_reject",   cat: "Reset",              req: "ARCH-RESET-017", seed: "0x3010..0x301F", runtime: "8m", cov: "reset.reject", owner: "Maya Chen", state: "In Review" },
  { name: "test_back_to_back_invalid_desc", cat: "Constrained Random", req: "REQ-DDMAC-146", seed: "0x4000..0x40FF", runtime: "48m", cov: "b2b.invalid", owner: "Sofia Rodriguez", state: "In Review" },
  { name: "test_interrupt_latency",     cat: "Directed",           req: "REQ-DDMAC-147", seed: "0x5000..0x5010", runtime: "6m", cov: "int.latency", owner: "Marcus Lee", state: "In Review" },
  { name: "test_apb_protected_write",   cat: "Negative",           req: "REQ-SEC-088",   seed: "0x6000..0x6020", runtime: "9m", cov: "apb.protected", owner: "Priya Shah", state: "In Review" },
  { name: "test_sustained_descriptor_rate", cat: "Performance",    req: "PERF-DDMAC-004", seed: "0x7000..0x7003", runtime: "6h", cov: "perf.rate", owner: "Marcus Lee", state: "Proposed" },
  { name: "test_random_boundary_weighting", cat: "Constrained Random", req: "REQ-DDMAC-142", seed: "0x8000..0x80FF", runtime: "14h", cov: "length.weighted", owner: "Sofia Rodriguez", state: "Proposed" },
];

const ASSERTIONS = [
  {
    id: "asrt-01",
    name: "p_invalid_descriptor_not_accepted",
    req: "REQ-DDMAC-142",
    code: `property p_invalid_descriptor_not_accepted;
  @(posedge clk) disable iff (!rst_n)
    invalid_descriptor |-> !desc_accept;
endproperty`,
    risk: "Vacuity risk if invalid_descriptor never asserted in bench",
    state: "In Review",
  },
  {
    id: "asrt-02",
    name: "p_accept_reject_mutually_exclusive",
    req: "REQ-DDMAC-144",
    code: `property p_accept_reject_mutually_exclusive;
  @(posedge clk) disable iff (!rst_n)
    !(desc_accept && desc_error);
endproperty`,
    risk: "Safe. Reviewed by verification lead.",
    state: "Approved",
  },
  {
    id: "asrt-03",
    name: "p_unauthorized_write_blocked",
    req: "REQ-SEC-088",
    code: `property p_unauthorized_write_blocked;
  @(posedge clk) disable iff (!rst_n)
    protected_write && !priv_mode |=> $stable(protected_reg);
endproperty`,
    risk: "Shares implementation assumption on priv_mode timing.",
    state: "In Review",
  },
  {
    id: "asrt-04",
    name: "p_error_response_within_2",
    req: "REQ-DDMAC-143",
    code: `property p_error_response_within_2;
  @(posedge clk) disable iff (!rst_n)
    invalid_descriptor |-> ##[1:2] desc_error;
endproperty`,
    risk: "Blocked: origin of 'detection' event ambiguous.",
    state: "Blocked",
  },
];

const FORMAL_CANDIDATES = [
  { name: "Invalid descriptor never accepted",   intent: "Safety",     complexity: "Low",    status: "Approved",  owner: "Daniel Kim" },
  { name: "Accept and reject mutually exclusive", intent: "Safety",    complexity: "Low",    status: "Approved",  owner: "Daniel Kim" },
  { name: "Unauthorized write never updates protected state", intent: "Security safety", complexity: "Medium", status: "In Review", owner: "Priya Shah" },
  { name: "Reset eventually returns FSM to IDLE", intent: "Liveness",  complexity: "Medium", status: "In Review", owner: "Daniel Kim" },
  { name: "Accepted descriptor eventually completes or errors", intent: "Liveness", complexity: "High", status: "In Review", owner: "Daniel Kim" },
  { name: "Error code matches detected condition", intent: "Safety",   complexity: "Medium", status: "In Review", owner: "Sofia Rodriguez" },
  { name: "Descriptor completion neither lost nor duplicated", intent: "Safety", complexity: "High", status: "In Review", owner: "Daniel Kim" },
  { name: "Error response timing lower bound",     intent: "Safety",   complexity: "n/a",    status: "Blocked",   owner: "Daniel Kim" },
];

const COVERPOINTS = [
  { name: "cp_length",           bins: "below / equal / above",       state: "Measured" as const },
  { name: "cp_priv_mode",        bins: "user / priv",                  state: "Measured" as const },
  { name: "cp_desc_result",      bins: "accept / reject / error",      state: "Measured" as const },
  { name: "cp_error_code",       bins: "len / priv / cdc / other",     state: "Predicted" as const },
  { name: "cp_state_transition", bins: "24 arcs",                       state: "Predicted" as const },
  { name: "cp_reset_by_state",   bins: "6 states × reset",             state: "Predicted" as const },
  { name: "cp_backpressure",     bins: "0..256 in 8 bins",              state: "Predicted" as const },
  { name: "cross length_x_result",  bins: "3 × 3",                       state: "Measured" as const },
  { name: "cross priv_x_access_x_result", bins: "2 × 4 × 3",             state: "Predicted" as const },
  { name: "cross reset_state_x_recovery", bins: "6 × 3",                 state: "Missing" as const },
  { name: "cross error_x_int_behavior",   bins: "4 × 2",                 state: "Missing" as const },
  { name: "cross backpressure_x_latency", bins: "8 × 4",                 state: "Missing" as const },
];

const PRIOR_DEFECTS = [
  {
    id: "DEF-DV-173",
    title: "Boundary value incorrectly rejected",
    assets: ["test_desc_length_at_max", "boundary-weighted random constraint", "length × result cross", "formal acceptance property"],
    reuse: "Validated",
  },
  {
    id: "DEF-DV-219",
    title: "Error response delayed after invalid descriptor",
    assets: ["test_error_response_within_2", "error-latency assertion (blocked)", "error injection scenario", "timing coverage bin"],
    reuse: "Partially Blocked",
  },
  {
    id: "DEF-SEC-041",
    title: "Unauthorized protected register write accepted",
    assets: ["test_apb_protected_write", "priv random sequence", "p_unauthorized_write_blocked", "noninterference formal candidate"],
    reuse: "In Review",
  },
];

const EXECUTION_SUITES = [
  { suite: "Smoke",              tests: "12",           seeds: "1..3",   runtime: "18 min",   status: "Ready" },
  { suite: "Boundary",           tests: "10",           seeds: "5",      runtime: "45 min",   status: "Ready" },
  { suite: "Security",           tests: "8",            seeds: "10",     runtime: "2.1 hrs",  status: "Review" },
  { suite: "Reset & Error",      tests: "15",           seeds: "10",     runtime: "3.4 hrs",  status: "Conditional" },
  { suite: "Constrained Random", tests: "18",           seeds: "100",    runtime: "14 hrs",   status: "Proposed" },
  { suite: "Performance",        tests: "5",            seeds: "3",      runtime: "6 hrs",    status: "Proposed" },
  { suite: "Formal Targeted",    tests: "7 properties", seeds: "n/a",    runtime: "9 core-hrs", status: "Review" },
];

const APPROVERS = [
  { role: "Verification Lead",    owner: "Sofia Rodriguez", state: "Approved" as const },
  { role: "Formal Lead",          owner: "Daniel Kim",       state: "Pending"  as const },
  { role: "RTL Design Lead",      owner: "Maya Chen",        state: "Approved" as const },
  { role: "IP Architect",         owner: "Arun Patel",       state: "Pending"  as const },
  { role: "Security Engineer",    owner: "Priya Shah",       state: "Pending"  as const },
  { role: "Performance Engineer", owner: "Marcus Lee",       state: "Pending"  as const },
];

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

function toneColor(tone?: KPI["tone"]) {
  switch (tone) {
    case "ok":   return "hsl(var(--avep-success))";
    case "warn": return "hsl(var(--avep-warning))";
    case "bad":  return "hsl(var(--avep-danger))";
    case "info":
    default:     return "hsl(var(--avep-primary))";
  }
}

function stateStyle(s: AssetState | string): { bg: string; fg: string; border: string; icon: JSX.Element | null } {
  const base = "hsl(var(--avep-border))";
  switch (s) {
    case "Approved":
      return { bg: "hsl(var(--avep-success) / 0.10)", fg: "hsl(var(--avep-success))", border: "hsl(var(--avep-success) / 0.35)", icon: <CheckCircle2 className="h-3 w-3" /> };
    case "In Review":
      return { bg: "hsl(var(--avep-primary) / 0.10)", fg: "hsl(var(--avep-primary))", border: "hsl(var(--avep-primary) / 0.35)", icon: <ClipboardList className="h-3 w-3" /> };
    case "Blocked":
      return { bg: "hsl(var(--avep-danger) / 0.10)", fg: "hsl(var(--avep-danger))", border: "hsl(var(--avep-danger) / 0.35)", icon: <Ban className="h-3 w-3" /> };
    case "Missing":
      return { bg: "hsl(var(--avep-warning) / 0.10)", fg: "hsl(var(--avep-warning))", border: "hsl(var(--avep-warning) / 0.35)", icon: <AlertTriangle className="h-3 w-3" /> };
    case "Validation Required":
      return { bg: "hsl(var(--avep-warning) / 0.10)", fg: "hsl(var(--avep-warning))", border: "hsl(var(--avep-warning) / 0.35)", icon: <AlertTriangle className="h-3 w-3" /> };
    case "Generated":
      return { bg: "hsl(var(--avep-primary) / 0.06)", fg: "hsl(var(--avep-primary))", border: base, icon: <Sparkles className="h-3 w-3" /> };
    case "Proposed":
      return { bg: "hsl(var(--avep-foreground) / 0.04)", fg: "hsl(var(--avep-foreground-muted))", border: base, icon: null };
    case "Reused":
      return { bg: "hsl(var(--avep-accent) / 0.10)", fg: "hsl(var(--avep-accent-foreground, var(--avep-primary)))", border: base, icon: <GitBranch className="h-3 w-3" /> };
    case "Modified":
      return { bg: "hsl(var(--avep-warning) / 0.08)", fg: "hsl(var(--avep-warning))", border: base, icon: null };
    case "Rejected":
      return { bg: "hsl(var(--avep-danger) / 0.10)", fg: "hsl(var(--avep-danger))", border: base, icon: <XCircle className="h-3 w-3" /> };
    default:
      return { bg: "transparent", fg: "hsl(var(--avep-foreground-muted))", border: base, icon: null };
  }
}

function StatePill({ state }: { state: AssetState | string }) {
  const s = stateStyle(state);
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        fontSize: "var(--avep-text-2xs)",
        fontWeight: 600,
        letterSpacing: "var(--avep-tracking-wide)",
      }}
    >
      {s.icon}
      {state}
    </span>
  );
}

function RiskChip({ risk }: { risk: StrategyRow["risk"] }) {
  const map: Record<StrategyRow["risk"], { fg: string; bg: string }> = {
    Low:      { fg: "hsl(var(--avep-success))", bg: "hsl(var(--avep-success) / 0.10)" },
    Medium:   { fg: "hsl(var(--avep-warning))", bg: "hsl(var(--avep-warning) / 0.10)" },
    High:     { fg: "hsl(var(--avep-danger))",  bg: "hsl(var(--avep-danger) / 0.08)"  },
    Critical: { fg: "hsl(var(--avep-danger))",  bg: "hsl(var(--avep-danger) / 0.14)"  },
    Blocking: { fg: "hsl(var(--avep-danger))",  bg: "hsl(var(--avep-danger) / 0.18)"  },
  };
  const c = map[risk];
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5"
      style={{ color: c.fg, background: c.bg, fontSize: "var(--avep-text-2xs)", fontWeight: 700, letterSpacing: "var(--avep-tracking-wide)" }}
    >
      {risk.toUpperCase()}
    </span>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-lg border ${className}`}
      style={{
        background: "hsl(var(--avep-surface))",
        borderColor: "hsl(var(--avep-border))",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, right }: { icon: any; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 h-7 w-7 rounded flex items-center justify-center"
          style={{ background: "hsl(var(--avep-primary) / 0.10)", color: "hsl(var(--avep-primary))" }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-semibold" style={{ fontSize: "var(--avep-text-md)" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>{subtitle}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function TestFactory() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [selected, setSelected] = useState<string>("REQ-DDMAC-142");
  const [testTab, setTestTab] = useState<(typeof TEST_CATEGORIES)[number]>("Directed");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [walkStep, setWalkStep] = useState<number>(0);
  const [walkOpen, setWalkOpen] = useState<boolean>(false);

  // Weighted stimulus
  const [wBoundary, setWBoundary] = useState(40);
  const [wPriv, setWPriv]         = useState(20);
  const [wReset, setWReset]       = useState(15);
  const [wSimErr, setWSimErr]     = useState(10);
  const [wNominal, setWNominal]   = useState(15);
  const total = wBoundary + wPriv + wReset + wSimErr + wNominal;

  const kpis = KPIS_BY_SCENARIO[scenario];

  const rows = useMemo(() => {
    let r = STRATEGY_ROWS;
    if (filter === "missing") r = r.filter((x) => [x.directed, x.random, x.negative, x.assertion, x.formal, x.coverage].some((v) => v === "Missing"));
    else if (filter === "formal") r = r.filter((x) => x.formal !== "Missing" && x.formal !== "Blocked");
    else if (filter === "blocking") r = r.filter((x) => x.review === "Blocked" || x.risk === "Blocking");
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.id.toLowerCase().includes(q) || x.behavior.toLowerCase().includes(q));
    }
    return r;
  }, [filter, search]);

  const sel = STRATEGY_ROWS.find((r) => r.id === selected) ?? STRATEGY_ROWS[0];
  const testsForCat = GENERATED_TESTS.filter((t) => t.cat === testTab);

  const walkSteps = [
    { anchor: "matrix",   text: "Select an approved requirement in the Verification Strategy Matrix." },
    { anchor: "detail",   text: "Review the recommended techniques and reasoning." },
    { anchor: "tests",    text: "Inspect the directed and constrained-random stimulus." },
    { anchor: "assert",   text: "Review assertion and formal property candidates." },
    { anchor: "matrix",   text: "REQ-DDMAC-143 shows a blocking timing ambiguity." },
    { anchor: "defects",  text: "Prior defects are converted into reusable scenarios." },
    { anchor: "cov",      text: "Coverage contribution — predicted, not measured." },
    { anchor: "exec",     text: "Compare minimal, proportionate, and expanded execution scopes." },
    { anchor: "ai",       text: "AI exposes a false-pass risk; the test is returned for revision." },
    { anchor: "approve",  text: "Verification and formal leads retain approval authority." },
  ];

  return (
    <div
      className="min-h-full"
      style={{
        background: "hsl(var(--avep-surface-canvas))",
        fontFamily: "var(--avep-font-sans)",
        color: "hsl(var(--avep-foreground))",
      }}
    >
      {/* ---------- Context strip ---------- */}
      <div
        className="border-b px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-1"
        style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontSize: "var(--avep-text-xs)" }}
      >
        <ContextItem label="Program"  value="StrataShield Secure Processing SoC" />
        <ContextItem label="IP"       value="DDMAC Packet Movement Engine" />
        <ContextItem label="Revision" value="DDMAC 3.2" mono />
        <ContextItem label="RTL"      value="rtl_baseline_3.2.18_candidate" mono />
        <ContextItem label="DV Env"   value="dv_env_2.4_candidate" mono />
        <ContextItem label="VPLAN"    value="VPLAN DDMAC 3.2" mono />
        <ContextItem label="TPLAN"    value="TPLAN DDMAC 3.2" mono />
        <ContextItem label="Branch"   value="feature/ddmac_descriptor_guard" mono />
        <ContextItem label="Milestone" value="M4 DV Entry" />
        <ContextItem label="Role"     value="Verification Lead" />
      </div>

      {/* ---------- Header ---------- */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>
              AVEP.P2.VER.002 · PHASE 2 · BUILD AND VERIFY · CREATE TESTS, STIMULUS, ASSERTIONS & PROPERTIES
            </div>
            <h1 className="mt-1 font-semibold" style={{ fontSize: "var(--avep-text-2xl)", letterSpacing: "-0.01em" }}>
              Test, Stimulus, Assertion & Property Factory
            </h1>
            <p className="mt-1 max-w-2xl" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
              Generate traceable verification assets from approved requirements, architecture, interfaces, risk patterns, prior defects, and coverage objectives. AVEP proposes; verification and formal leads decide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "hsl(var(--avep-border))" }}>
              {(["T0", "T1", "T2", "T3"] as Scenario[]).map((s) => {
                const active = s === scenario;
                return (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className="px-2 py-1 rounded"
                    style={{
                      background: active ? "hsl(var(--avep-primary))" : "transparent",
                      color: active ? "hsl(var(--avep-primary-foreground))" : "hsl(var(--avep-foreground-muted))",
                      fontSize: "var(--avep-text-xs)",
                      fontWeight: 600,
                    }}
                    title={
                      s === "T0" ? "Strategy Approved" :
                      s === "T1" ? "Verification Gaps" :
                      s === "T2" ? "AI-Generated Strategy" :
                                   "Weak Test Detected"
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setWalkOpen(true); setWalkStep(0); }}
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5"
              style={{
                borderColor: "hsl(var(--avep-border))",
                background: "hsl(var(--avep-surface))",
                fontSize: "var(--avep-text-xs)",
                fontWeight: 600,
              }}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Start Walkthrough
            </button>
          </div>
        </div>

        {/* Recommendation banner */}
        <div
          className="mt-4 rounded-md border px-3.5 py-2.5 flex items-start gap-3"
          style={{
            borderColor: "hsl(var(--avep-warning) / 0.35)",
            background: "hsl(var(--avep-warning) / 0.06)",
          }}
        >
          <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: "hsl(var(--avep-warning))" }} />
          <div style={{ fontSize: "var(--avep-text-sm)" }}>
            <span className="font-semibold">Recommendation:</span>{" "}
            Approve low-risk directed and boundary tests. Hold timing-sensitive properties and security scenarios pending clarification of REQ-DDMAC-143 and formal-lead review of security assertions.
            <span className="ml-2" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>
              AI recommendation is advisory, not proof.
            </span>
          </div>
        </div>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {kpis.map((k) => {
            const active = filter === k.key;
            return (
              <button
                key={k.key}
                onClick={() =>
                  setFilter(
                    k.key === "asrt" ? "all" :
                    k.key === "formal" ? "formal" :
                    k.key === "review" ? "blocking" :
                    k.key === "cov" ? "missing" :
                    "all"
                  )
                }
                className="text-left rounded-lg border p-3 transition-colors hover:bg-black/[0.02]"
                style={{
                  borderColor: active ? toneColor(k.tone) : "hsl(var(--avep-border))",
                  background: "hsl(var(--avep-surface))",
                }}
              >
                <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>
                  {k.label.toUpperCase()}
                </div>
                <div className="mt-0.5 font-semibold" style={{ fontSize: "var(--avep-text-xl)", color: toneColor(k.tone) }}>
                  {k.value}
                </div>
                <div className="mt-0.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                  {k.detail}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Matrix + Detail ---------- */}
      <div className="px-6 grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-8" style={{ scrollMarginTop: 80 }}>
          <div id="matrix" />
          <SectionTitle
            icon={Layers}
            title="Verification Strategy Matrix"
            subtitle="One row per requirement or verification objective. Cells show the state of each proposed verification asset."
            right={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search requirement…"
                    className="pl-7 pr-2 py-1 rounded border w-52 outline-none"
                    style={{
                      borderColor: "hsl(var(--avep-border))",
                      background: "hsl(var(--avep-surface-canvas))",
                      fontSize: "var(--avep-text-xs)",
                    }}
                  />
                </div>
                <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "missing", label: "Missing" },
                    { id: "formal", label: "Formal" },
                    { id: "blocking", label: "Blocking" },
                  ].map((f) => {
                    const active = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className="px-2 py-1 rounded inline-flex items-center gap-1"
                        style={{
                          background: active ? "hsl(var(--avep-primary))" : "transparent",
                          color: active ? "hsl(var(--avep-primary-foreground))" : "hsl(var(--avep-foreground-muted))",
                          fontSize: "var(--avep-text-2xs)",
                          fontWeight: 600,
                        }}
                      >
                        <Filter className="h-3 w-3" />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ background: "hsl(var(--avep-surface-canvas))", color: "hsl(var(--avep-foreground-subtle))" }}>
                <tr>
                  {["Requirement", "Behavior", "Risk", "Dir", "Rand", "Neg", "Asrt", "Formal", "Cov", "Prior", "Cost", "Conf", "Owner", "Review"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const active = r.id === selected;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: active ? "hsl(var(--avep-primary) / 0.06)" : "transparent",
                      }}
                    >
                      <td className="px-2 py-1.5 border-b whitespace-nowrap" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground))" }}>
                        {r.id}
                      </td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.behavior}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><RiskChip risk={r.risk} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.directed} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.random} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.negative} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.assertion} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.formal} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.coverage} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>{r.priorDefect ?? "—"}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.cost}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.confidence}%</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.owner}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={r.review} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
            <span>{rows.length} rows shown · click a row to open strategy detail</span>
            <button
              className="inline-flex items-center gap-1 rounded border px-2 py-1"
              style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}
            >
              Export Review Package <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        {/* ---------- AI Evidence rail ---------- */}
        <Card className="col-span-12 xl:col-span-4" style={{ scrollMarginTop: 80 }}>
          <div id="ai" />
          <SectionTitle icon={Sparkles} title="AI Verification Evidence" subtitle="Structured reasoning · advisory only" />
          <div className="p-4 space-y-3" style={{ fontSize: "var(--avep-text-xs)" }}>
            <div className="rounded-md border p-2.5" style={{ borderColor: "hsl(var(--avep-warning) / 0.35)", background: "hsl(var(--avep-warning) / 0.06)" }}>
              <div className="font-semibold" style={{ color: "hsl(var(--avep-warning))" }}>Approve with conditions</div>
              <div className="mt-0.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                Functional and boundary objectives have appropriate assets. Two timing-sensitive items are blocked by ambiguous intent; security properties require formal-lead review.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>
                STRATEGY COMPLETENESS
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  ["Directed", 28], ["Random", 18], ["Negative", 12], ["Reset", 8],
                  ["Err-Inj", 7], ["Perf", 5], ["Security", 8], ["Boundary", 10],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded border px-1.5 py-1" style={{ borderColor: "hsl(var(--avep-border))" }}>
                    <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{l}</div>
                    <div className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>
                HIGHEST RISKS
              </div>
              <ol className="space-y-1 list-decimal pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                <li>Error timing property lacks an approved starting event.</li>
                <li>Reference stimulus excludes one simultaneous-error combination.</li>
                <li>Security assertion shares an implementation assumption.</li>
                <li>Four coverage crosses are not mapped to executable stimulus.</li>
                <li>Two formal properties may pass vacuously.</li>
              </ol>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>
                RECOMMENDED ACTIONS
              </div>
              <ul className="space-y-1 list-disc pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                <li>Clarify timing semantics with architecture lead.</li>
                <li>Add simultaneous-error constraint to random suite.</li>
                <li>Review formal assumptions independently.</li>
                <li>Add stimulus for missing coverage crosses.</li>
                <li>Add vacuity checks to security assertions.</li>
                <li>Confirm proof-versus-simulation strategy.</li>
              </ul>
            </div>

            <div className="rounded border px-2 py-1.5" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              AI confidence is advisory, not proof. Verification and formal leads confirm that each asset exercises the intended behavior.
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Strategy Detail tabs ---------- */}
      <div className="px-6 mt-4">
        <div id="detail" />
        <StrategyDetail row={sel} />
      </div>

      {/* ---------- Generated tests workspace ---------- */}
      <div className="px-6 mt-4">
        <Card>
          <div id="tests" />
          <SectionTitle icon={Code2} title="Generated Tests Workspace" subtitle="Traceable stimulus organized by verification technique" />
          <div className="px-3 pt-2 flex flex-wrap gap-1 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
            {TEST_CATEGORIES.map((c) => {
              const active = testTab === c;
              return (
                <button
                  key={c}
                  onClick={() => setTestTab(c)}
                  className="px-2.5 py-1 rounded-t border border-b-0"
                  style={{
                    background: active ? "hsl(var(--avep-surface))" : "transparent",
                    borderColor: active ? "hsl(var(--avep-border))" : "transparent",
                    color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                    fontSize: "var(--avep-text-xs)",
                    fontWeight: 600,
                    marginBottom: -1,
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-7 overflow-x-auto border-r" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
                <thead style={{ background: "hsl(var(--avep-surface-canvas))", color: "hsl(var(--avep-foreground-subtle))" }}>
                  <tr>
                    {["Test", "Requirement", "Seed", "Runtime", "Coverage", "Owner", "State"].map((h) => (
                      <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {testsForCat.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                        No tests generated for this category yet — see gaps in the matrix.
                      </td>
                    </tr>
                  )}
                  {testsForCat.map((t) => (
                    <tr key={t.name}>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{t.name}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>{t.req}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{t.seed}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{t.runtime}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>{t.cov}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{t.owner}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={t.state} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-span-12 lg:col-span-5 p-3">
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>
                REPRESENTATIVE SEQUENCE · SYSTEMVERILOG
              </div>
              <pre
                className="mt-1 rounded border p-2.5 overflow-x-auto"
                style={{
                  borderColor: "hsl(var(--avep-border))",
                  background: "hsl(var(--avep-surface-canvas))",
                  fontFamily: "var(--avep-font-mono)",
                  fontSize: "var(--avep-text-xs)",
                  lineHeight: 1.5,
                }}
              >{`class ddmac_boundary_seq extends uvm_sequence #(ddmac_desc_item);
    rand bit [15:0] max_len;

    task body();
        send_length(max_len - 1);   // legal
        send_length(max_len);       // boundary
        send_length(max_len + 1);   // illegal → expect reject
    endtask
endclass`}</pre>
              <div className="mt-2 grid grid-cols-2 gap-2" style={{ fontSize: "var(--avep-text-2xs)" }}>
                <Meta label="Linked requirement" value="REQ-DDMAC-142" mono />
                <Meta label="Coverage bins" value="length.below, .equal, .above" mono />
                <Meta label="Expected checker" value="scoreboard.result_matches_len" mono />
                <Meta label="Prior defect" value="DEF-DV-173" mono />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Stimulus & Constraint Designer ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7">
          <SectionTitle icon={Cpu} title="Stimulus & Constraint Designer" subtitle="Weighted distribution of predicted contribution — not measured coverage" />
          <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3" style={{ fontSize: "var(--avep-text-xs)" }}>
            <Weight label="Near max-transfer boundary" value={wBoundary} onChange={setWBoundary} />
            <Weight label="Privilege violations" value={wPriv} onChange={setWPriv} />
            <Weight label="Reset interaction" value={wReset} onChange={setWReset} />
            <Weight label="Simultaneous errors" value={wSimErr} onChange={setWSimErr} />
            <Weight label="Nominal traffic" value={wNominal} onChange={setWNominal} />
            <div className="rounded border p-2" style={{ borderColor: total === 100 ? "hsl(var(--avep-success) / 0.4)" : "hsl(var(--avep-warning) / 0.4)", background: total === 100 ? "hsl(var(--avep-success) / 0.06)" : "hsl(var(--avep-warning) / 0.06)" }}>
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>WEIGHT TOTAL</div>
              <div className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)" }}>{total}%</div>
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                {total === 100 ? "Distribution balanced." : "Adjust weights to sum to 100%."}
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 flex flex-wrap gap-2" style={{ fontSize: "var(--avep-text-2xs)" }}>
            <Finding tone="warn" text="Bias under-samples simultaneous-error combinations (recommend ≥15%)." />
            <Finding tone="bad"  text="Unreachable bin detected: privileged writes with mask=0 excluded by ordering constraint." />
            <Finding tone="info" text="Reproducible seed strategy: base 0x1B7 · derive per suite." />
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <SectionTitle icon={ShieldCheck} title="Constraint Variables" />
          <div className="p-3" style={{ fontSize: "var(--avep-text-xs)" }}>
            <div className="grid grid-cols-2 gap-2" style={{ fontFamily: "var(--avep-font-mono)" }}>
              {[
                "payload_length", "privileged_request",
                "interrupt_enable", "reset_offset",
                "descriptor_gap", "backpressure_cycles",
                "error_injection_mode", "register_access_type",
              ].map((v) => (
                <div key={v} className="rounded border px-2 py-1" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))" }}>{v}</div>
              ))}
            </div>
            <div className="mt-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              Legal / illegal ranges, cross-variable constraints, sequence ordering, concurrency, and backpressure controls are configured per variable.
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Assertion & Formal Studio ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7">
          <div id="assert" />
          <SectionTitle icon={ShieldAlert} title="Assertion Candidates" subtitle="SystemVerilog Assertions · reviewed by verification and formal leads" />
          <div className="p-3 space-y-3">
            {ASSERTIONS.map((a) => (
              <div key={a.id} className="rounded border" style={{ borderColor: "hsl(var(--avep-border))" }}>
                <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-sm)" }}>{a.name}</span>
                    <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>· {a.req}</span>
                  </div>
                  <StatePill state={a.state} />
                </div>
                <pre className="p-3 overflow-x-auto" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)", lineHeight: 1.5, background: "hsl(var(--avep-surface-canvas))" }}>{a.code}</pre>
                <div className="px-3 py-1.5 border-t" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                  <span className="font-semibold" style={{ color: "hsl(var(--avep-foreground))" }}>Risk:</span> {a.risk}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <SectionTitle icon={BadgeCheck} title="Formal Property Candidates" subtitle="Proof intent, complexity, and reviewer authority" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ background: "hsl(var(--avep-surface-canvas))", color: "hsl(var(--avep-foreground-subtle))" }}>
                <tr>
                  {["Property", "Intent", "Complexity", "Owner", "Status"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FORMAL_CANDIDATES.map((f) => (
                  <tr key={f.name}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{f.name}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{f.intent}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{f.complexity}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{f.owner}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
            Formal candidacy does not imply proof. Assumptions and abstractions must be independently reviewed.
          </div>
        </Card>
      </div>

      {/* ---------- Coverage + Prior defects ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7">
          <div id="cov" />
          <SectionTitle icon={Target} title="Coverage Strategy" subtitle="Measured vs. predicted coverage — never conflated" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ background: "hsl(var(--avep-surface-canvas))", color: "hsl(var(--avep-foreground-subtle))" }}>
                <tr>
                  {["Coverpoint / Cross", "Bins", "State"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COVERPOINTS.map((c) => (
                  <tr key={c.name}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{c.name}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", color: "hsl(var(--avep-foreground-muted))" }}>{c.bins}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
                      <StatePill state={c.state === "Measured" ? "Approved" : c.state === "Predicted" ? "Generated" : "Missing"} />
                      <span className="ml-2" style={{ color: "hsl(var(--avep-foreground-muted))", fontSize: "var(--avep-text-2xs)" }}>{c.state}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
            Predicted contribution is an estimate produced from stimulus intent. It does not represent achieved coverage.
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <div id="defects" />
          <SectionTitle icon={AlertTriangle} title="Historical Defect Intelligence" subtitle="Prior defects converted into reusable scenarios" />
          <div className="p-3 space-y-3">
            {PRIOR_DEFECTS.map((d) => (
              <div key={d.id} className="rounded border p-2.5" style={{ borderColor: "hsl(var(--avep-border))" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)" }}>{d.id}</span>
                    <span style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>· {d.title}</span>
                  </div>
                  <StatePill state={d.reuse === "Validated" ? "Approved" : d.reuse === "Partially Blocked" ? "Blocked" : "In Review"} />
                </div>
                <ul className="mt-1.5 space-y-0.5 pl-4 list-disc" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                  {d.assets.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- Execution planning + Approvers ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7">
          <div id="exec" />
          <SectionTitle icon={PlayCircle} title="Execution Planning" subtitle="Minimal · proportionate · expanded scope comparison" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ background: "hsl(var(--avep-surface-canvas))", color: "hsl(var(--avep-foreground-subtle))" }}>
                <tr>
                  {["Suite", "Tests", "Seeds", "Estimated Runtime", "Status"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXECUTION_SUITES.map((s) => (
                  <tr key={s.suite}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{s.suite}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{s.tests}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{s.seeds}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{s.runtime}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
                      <StatePill state={s.status === "Ready" ? "Approved" : s.status === "Review" ? "In Review" : s.status === "Conditional" ? "Validation Required" : "Proposed"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t flex flex-wrap gap-3" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            <span>Simulator hours (est.): <b style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))" }}>26.0</b></span>
            <span>Formal compute (est.): <b style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))" }}>9 core-hrs</b></span>
            <span>Coverage DB growth: <b style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))" }}>≈ 1.4 GB</b></span>
            <span>Licenses: <b style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))" }}>sim×24, fml×2</b></span>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <div id="approve" />
          <SectionTitle icon={ShieldCheck} title="Human Review & Approval" subtitle="Required authorities · AI is never the approver" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ background: "hsl(var(--avep-surface-canvas))", color: "hsl(var(--avep-foreground-subtle))" }}>
                <tr>
                  {["Role", "Owner", "State"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {APPROVERS.map((a) => (
                  <tr key={a.role}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{a.role}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{a.owner}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
                      <StatePill state={a.state === "Approved" ? "Approved" : "In Review"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ---------- Persistent decision bar ---------- */}
      <div className="h-24" />
      <div
        className="fixed bottom-0 left-0 right-0 border-t px-6 py-2.5 z-30 flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{
          background: "hsl(var(--avep-surface))",
          borderColor: "hsl(var(--avep-border))",
          boxShadow: "0 -4px 12px -8px hsl(var(--avep-foreground) / 0.10)",
        }}
      >
        <BarStat label="Strategy" value="In Review" />
        <BarStat label="Objectives" value="87%" mono />
        <BarStat label="Assets approved" value="49 / 86" mono />
        <BarStat label="Assertions" value="11 / 18" mono />
        <BarStat label="Formal approved" value="4 / 12" mono />
        <BarStat label="Blocking" value="2" mono danger />
        <BarStat label="Approvals" value="2 / 6" mono />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <BarBtn tone="ghost">Request Clarification</BarBtn>
          <BarBtn tone="ghost">Generate Missing Assets</BarBtn>
          <BarBtn tone="ghost">Modify Strategy</BarBtn>
          <BarBtn tone="ghost">Run Precheck</BarBtn>
          <BarBtn tone="warn">Return for Revision</BarBtn>
          <BarBtn tone="primary" disabled title="2 blocking findings">Approve Selected Assets</BarBtn>
          <BarBtn tone="primary" disabled title="Formal & Security approvals pending">Approve Execution Plan</BarBtn>
          <BarBtn tone="ghost">Export Evidence</BarBtn>
        </div>
      </div>

      {/* ---------- Walkthrough overlay ---------- */}
      {walkOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 p-4" onClick={() => setWalkOpen(false)}>
          <div
            className="max-w-lg w-full rounded-lg border shadow-lg"
            style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <div className="font-semibold" style={{ fontSize: "var(--avep-text-md)" }}>Verification Strategy Walkthrough</div>
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>Step {walkStep + 1} of {walkSteps.length}</div>
            </div>
            <div className="p-4" style={{ fontSize: "var(--avep-text-sm)" }}>
              {walkSteps[walkStep].text}
            </div>
            <div className="px-4 py-2.5 border-t flex justify-between" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <button
                onClick={() => setWalkOpen(false)}
                className="px-2.5 py-1 rounded border"
                style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}
              >
                Close
              </button>
              <div className="flex gap-1.5">
                <button
                  disabled={walkStep === 0}
                  onClick={() => setWalkStep((s) => Math.max(0, s - 1))}
                  className="px-2.5 py-1 rounded border disabled:opacity-40"
                  style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}
                >
                  Previous
                </button>
                {walkStep < walkSteps.length - 1 ? (
                  <button
                    onClick={() => setWalkStep((s) => s + 1)}
                    className="px-2.5 py-1 rounded"
                    style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setWalkOpen(false)}
                    className="px-2.5 py-1 rounded"
                    style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Strategy detail                                                     */
/* ------------------------------------------------------------------ */

const DETAIL_TABS = [
  "Engineering Intent",
  "Verification Reasoning",
  "Generated Tests",
  "Stimulus & Constraints",
  "Assertions",
  "Formal Properties",
  "Coverage",
  "Defect Intelligence",
  "Execution Plan",
  "Review History",
] as const;

function StrategyDetail({ row }: { row: StrategyRow }) {
  const [tab, setTab] = useState<(typeof DETAIL_TABS)[number]>("Engineering Intent");

  return (
    <Card>
      <SectionTitle
        icon={FlaskConical}
        title={`Strategy Detail · ${row.id}`}
        subtitle={row.behavior}
        right={
          <div className="flex items-center gap-2">
            <RiskChip risk={row.risk} />
            <StatePill state={row.review} />
          </div>
        }
      />
      <div className="px-3 pt-2 flex flex-wrap gap-1 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
        {DETAIL_TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-2.5 py-1 rounded-t border border-b-0"
              style={{
                background: active ? "hsl(var(--avep-surface))" : "transparent",
                borderColor: active ? "hsl(var(--avep-border))" : "transparent",
                color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                fontSize: "var(--avep-text-xs)",
                fontWeight: 600,
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="p-4" style={{ fontSize: "var(--avep-text-xs)" }}>
        {tab === "Engineering Intent" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Meta label="Source requirement" value={row.id} mono />
            <Meta label="Source document" value="VPLAN DDMAC 3.2 · §4.2 Descriptor Guard" />
            <Meta label="Requirement type" value={row.category} />
            <Meta label="Approval status" value="Requirement Approved" />
            <Meta label="Architecture link" value="ARCH-DDMAC-042 · Descriptor Guard FSM" mono />
            <Meta label="Interfaces" value="axi_desc, apb_csr" mono />
            <Meta label="Registers" value="DDMAC.CTRL, DDMAC.STATUS" mono />
            <Meta label="RTL modules" value="u_desc_guard, u_len_check" mono />
            <Meta label="Objective" value="Prove behavior across boundary and error paths" />
            <Meta label="Open assumptions" value={row.risk === "Blocking" ? "Detection origin unresolved" : "None blocking"} />
          </div>
        )}

        {tab === "Verification Reasoning" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ReasonBlock title="Behavior to demonstrate" items={["Boundary values correctly classified", "Error paths asserted", "Ordering preserved"]} />
            <ReasonBlock title="Failure modes" items={["Boundary rejection", "Delayed error", "Overrun accepted"]} />
            <ReasonBlock title="Observability points" items={["desc_accept", "desc_error", "cmpl_valid"]} mono />
            <ReasonBlock title="Controllability needs" items={["Force max_len", "Inject invalid descriptor", "Backpressure axi_desc"]} />
            <ReasonBlock title="Concurrency risks" items={["Reset during validate", "Simultaneous errors"]} />
            <ReasonBlock title="Why formal was selected" items={["Boundary and mutual-exclusion are safety properties", "Small cone of influence"]} />
            <ReasonBlock title="Why not selected" items={["Sustained throughput is measurement, not proof", "Backpressure ≤128 checked via simulation"]} />
            <ReasonBlock title="Uncertainty" items={row.risk === "Blocking" ? ["Detection origin ambiguity blocks liveness"] : ["Vacuity risk on wide antecedent"]} />
            <ReasonBlock title="Required human decisions" items={["Confirm boundary policy", "Approve checker mapping"]} />
          </div>
        )}

        {tab === "Generated Tests" && <MiniTable rows={GENERATED_TESTS.filter((t) => t.req === row.id).slice(0, 6)} />}

        {tab === "Stimulus & Constraints" && (
          <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>
            Constraint weights and variable ranges are governed in the Stimulus &amp; Constraint Designer below the matrix. Predicted contribution updates when weights change; measured coverage is produced only after simulation.
          </div>
        )}

        {tab === "Assertions" && <MiniAssertions rows={ASSERTIONS.filter((a) => a.req === row.id)} />}

        {tab === "Formal Properties" && (
          <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>
            Formal candidacy for this behavior appears in the Formal Property Candidates panel. Property acceptance requires independent review of assumptions and abstraction.
          </div>
        )}

        {tab === "Coverage" && (
          <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>
            Coverpoints and crosses linked to this requirement are visible in the Coverage Strategy panel. Predicted contribution is not measured coverage.
          </div>
        )}

        {tab === "Defect Intelligence" && (
          row.priorDefect
            ? <Meta label="Linked prior defect" value={row.priorDefect} mono />
            : <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>No prior defects linked. Similarity search returned no matches above 0.72.</div>
        )}

        {tab === "Execution Plan" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Meta label="Estimated cost" value={row.cost} />
            <Meta label="Confidence (advisory)" value={`${row.confidence}%`} mono />
            <Meta label="Recommended suite" value={row.category === "Performance" ? "Performance" : row.category === "Security" ? "Security" : "Boundary + Random"} />
          </div>
        )}

        {tab === "Review History" && (
          <ol className="space-y-1.5 list-decimal pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
            <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Generated</span> · AVEP · 2026-07-18</li>
            <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Reviewed</span> · Sofia Rodriguez · 2026-07-19 · "Boundary policy aligned with VPLAN §4.2"</li>
            <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Return for revision</span> · Daniel Kim · 2026-07-20 · "Vacuity risk on wide antecedent"</li>
            <li><span style={{ color: "hsl(var(--avep-foreground))" }}>In Review</span> · pending Formal Lead</li>
          </ol>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function ContextItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>{label.toUpperCase()}</span>
      <span style={{ fontFamily: mono ? "var(--avep-font-mono)" : undefined, color: "hsl(var(--avep-foreground))", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: mono ? "var(--avep-font-mono)" : undefined, fontSize: "var(--avep-text-xs)" }}>{value}</div>
    </div>
  );
}

function Weight({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div style={{ fontSize: "var(--avep-text-xs)" }}>{label}</div>
        <div style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>{value}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={60}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-current"
        style={{ color: "hsl(var(--avep-primary))" }}
      />
    </div>
  );
}

function Finding({ tone, text }: { tone: "ok" | "warn" | "bad" | "info"; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border px-2 py-1"
      style={{
        borderColor: `${toneColor(tone)} / 0.35`,
        background: `${toneColor(tone)}`,
        color: "white",
      }}
    >
      <AlertTriangle className="h-3 w-3" />
      <span style={{ fontSize: "var(--avep-text-2xs)" }}>{text}</span>
    </span>
  );
}

function BarStat({ label, value, mono, danger }: { label: string; value: string; mono?: boolean; danger?: boolean }) {
  return (
    <div className="leading-tight">
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, fontFamily: mono ? "var(--avep-font-mono)" : undefined, color: danger ? "hsl(var(--avep-danger))" : undefined }}>{value}</div>
    </div>
  );
}

function BarBtn({
  children, tone = "ghost", disabled, title,
}: { children: React.ReactNode; tone?: "ghost" | "warn" | "primary"; disabled?: boolean; title?: string }) {
  const styles: React.CSSProperties =
    tone === "primary"
      ? { background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", borderColor: "hsl(var(--avep-primary))" }
      : tone === "warn"
      ? { background: "hsl(var(--avep-warning) / 0.10)", color: "hsl(var(--avep-warning))", borderColor: "hsl(var(--avep-warning) / 0.4)" }
      : { background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", borderColor: "hsl(var(--avep-border))" };
  return (
    <button
      title={title}
      disabled={disabled}
      className="px-2.5 py-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ ...styles, fontSize: "var(--avep-text-xs)", fontWeight: 600 }}
    >
      {children}
    </button>
  );
}

function ReasonBlock({ title, items, mono }: { title: string; items: string[]; mono?: boolean }) {
  return (
    <div className="rounded border p-2.5" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))" }}>
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>{title.toUpperCase()}</div>
      <ul className="mt-1 space-y-0.5 pl-4 list-disc" style={{ fontSize: "var(--avep-text-xs)", fontFamily: mono ? "var(--avep-font-mono)" : undefined }}>
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

function MiniTable({ rows }: { rows: typeof GENERATED_TESTS }) {
  if (rows.length === 0) return <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>No tests linked to this requirement yet.</div>;
  return (
    <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
      <thead style={{ color: "hsl(var(--avep-foreground-subtle))" }}>
        <tr>
          {["Test", "Category", "Seed", "Runtime", "State"].map((h) => (
            <th key={h} className="text-left font-semibold py-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td className="py-1" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.name}</td>
            <td className="py-1">{r.cat}</td>
            <td className="py-1" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.seed}</td>
            <td className="py-1">{r.runtime}</td>
            <td className="py-1"><StatePill state={r.state} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MiniAssertions({ rows }: { rows: typeof ASSERTIONS }) {
  if (rows.length === 0) return <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>No assertions currently linked to this requirement.</div>;
  return (
    <div className="space-y-2">
      {rows.map((a) => (
        <div key={a.id} className="rounded border p-2" style={{ borderColor: "hsl(var(--avep-border))" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600 }}>{a.name}</span>
            <StatePill state={a.state} />
          </div>
          <pre className="mt-1 overflow-x-auto" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-2xs)" }}>{a.code}</pre>
        </div>
      ))}
    </div>
  );
}
