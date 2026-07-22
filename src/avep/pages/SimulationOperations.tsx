import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cpu,
  Filter,
  GitBranch,
  GitCommit,
  Layers,
  PlayCircle,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  Timer,
  XCircle,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P2.SIM.001 — Simulation Operations & Regression Intelligence   */
/* Route: /avep/verification/simulation-operations                     */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";

type Classification =
  | "Infrastructure"
  | "Compile"
  | "Testbench"
  | "Checker"
  | "Design"
  | "Assertion"
  | "Timeout"
  | "Intermittent"
  | "Coverage"
  | "Unknown";

type TriageState =
  | "Unclassified"
  | "Infrastructure Rerun"
  | "Testbench Review"
  | "Checker Review"
  | "RTL Design Review"
  | "Formal Review"
  | "Awaiting Clarification"
  | "Targeted Rerun"
  | "Dependent Regression"
  | "Resolved";

interface Cluster {
  id: string;
  title: string;
  classification: Classification;
  severity: "Low" | "Medium" | "High" | "Critical";
  risk: number;
  confidence: number;
  raw: number;
  tests: number;
  seeds: number;
  configs: number;
  firstObserved: string;
  baseline: "New" | "Persistent" | "Resolved" | "Intermittent" | "Known";
  owner: string;
  module?: string;
  requirement?: string;
  commit?: string;
  signature: string;
  action: string;
  triage: TriageState;
}

interface KPI {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone?: "ok" | "warn" | "bad" | "info";
}

/* ------------------------------------------------------------------ */
/* Deterministic data                                                  */
/* ------------------------------------------------------------------ */

const KPIS_BY_SCENARIO: Record<Scenario, KPI[]> = {
  T0: [
    { key: "jobs", label: "Jobs complete", value: "5,040 / 5,040", detail: "100% complete", tone: "ok" },
    { key: "pass", label: "Pass rate", value: "97.8%", detail: "At baseline", tone: "ok" },
    { key: "fail", label: "Raw failures", value: "112", detail: "All known/dup", tone: "ok" },
    { key: "clusters", label: "Failure clusters", value: "8", detail: "0 high-risk", tone: "ok" },
    { key: "new", label: "New failures", value: "0", detail: "None vs baseline", tone: "ok" },
    { key: "flaky", label: "Intermittent", value: "3", detail: "Below threshold", tone: "ok" },
    { key: "infra", label: "Infra aborts", value: "22", detail: "Nominal", tone: "ok" },
    { key: "cpu", label: "Compute", value: "7,910 core-hrs", detail: "Measured", tone: "info" },
  ],
  T1: [
    { key: "jobs", label: "Jobs complete", value: "4,812 / 5,040", detail: "95.5% complete", tone: "info" },
    { key: "pass", label: "Pass rate", value: "91.7%", detail: "Baseline 97.8%", tone: "bad" },
    { key: "fail", label: "Raw failures", value: "398", detail: "Includes duplicates", tone: "warn" },
    { key: "clusters", label: "Failure clusters", value: "37", detail: "4 high, 9 med, 24 low", tone: "warn" },
    { key: "new", label: "New failures", value: "63", detail: "Not in baseline", tone: "bad" },
    { key: "flaky", label: "Intermittent", value: "19", detail: "Seed-sensitive", tone: "warn" },
    { key: "infra", label: "Infra aborts", value: "74", detail: "Controlled rerun", tone: "warn" },
    { key: "cpu", label: "Compute", value: "8,460 core-hrs", detail: "Measured", tone: "info" },
  ],
  T2: [
    { key: "jobs", label: "Jobs complete", value: "4,812 / 5,040", detail: "95.5% complete", tone: "info" },
    { key: "pass", label: "Pass rate", value: "91.7%", detail: "Baseline 97.8%", tone: "warn" },
    { key: "fail", label: "Raw failures", value: "398", detail: "221 duplicates consolidated", tone: "info" },
    { key: "clusters", label: "Failure clusters", value: "37", detail: "4 prioritized", tone: "warn" },
    { key: "new", label: "New failures", value: "63", detail: "4 high-risk isolated", tone: "warn" },
    { key: "flaky", label: "Intermittent", value: "19", detail: "Reproducibility plan drafted", tone: "info" },
    { key: "infra", label: "Infra aborts", value: "74", detail: "Rerun approved", tone: "info" },
    { key: "cpu", label: "Compute", value: "8,460 core-hrs", detail: "Measured", tone: "info" },
  ],
  T3: [
    { key: "jobs", label: "Jobs complete", value: "5,040 / 5,040", detail: "Post-fix rerun complete", tone: "ok" },
    { key: "pass", label: "Pass rate", value: "96.4%", detail: "Approaching baseline", tone: "info" },
    { key: "fail", label: "Raw failures", value: "182", detail: "Primary cluster resolved", tone: "info" },
    { key: "clusters", label: "Failure clusters", value: "11", detail: "1 checker intermittent", tone: "info" },
    { key: "new", label: "New failures", value: "3", detail: "Bounded", tone: "info" },
    { key: "flaky", label: "Intermittent", value: "6", detail: "Checker race isolated", tone: "warn" },
    { key: "infra", label: "Infra aborts", value: "18", detail: "Healthy pool", tone: "ok" },
    { key: "cpu", label: "Compute", value: "13,180 core-hrs", detail: "Post-rerun", tone: "info" },
  ],
};

const CLUSTERS: Cluster[] = [
  { id: "FC-031", title: "Descriptor maximum-length boundary regression", classification: "Design",         severity: "High",     risk: 92, confidence: 91, raw: 41, tests: 6, seeds: 18, configs: 3, firstObserved: "02:14",  baseline: "New",          owner: "Maya Chen",       module: "ddmac_descriptor_validator", requirement: "REQ-DDMAC-142", commit: "a8c31f7", signature: "DESC_REJECT_AT_MAX",       action: "Targeted rerun after bounded RTL correction", triage: "RTL Design Review" },
  { id: "FC-028", title: "Error response timing assertion failure",       classification: "Assertion",      severity: "High",     risk: 88, confidence: 62, raw: 29, tests: 5, seeds: 14, configs: 2, firstObserved: "02:26",  baseline: "Intermittent", owner: "Arun Patel",     module: "ddmac_error_capture",        requirement: "REQ-DDMAC-143", commit: "a8c31f7", signature: "ERR_LATENCY_2C_VIOLATION",  action: "Clarify timing origin before broad rerun", triage: "Awaiting Clarification" },
  { id: "FC-014", title: "Simulation worker terminated during waveform flush", classification: "Infrastructure", severity: "Medium", risk: 41, confidence: 96, raw: 31, tests: 21, seeds: 31, configs: 4, firstObserved: "01:52",  baseline: "Known",        owner: "Marcus Lee",     signature: "WORKER_SIGTERM_WAVE_FLUSH",  action: "Rerun on healthy pool",                     triage: "Infrastructure Rerun" },
  { id: "FC-019", title: "Scoreboard timeout under out-of-order completion", classification: "Checker",       severity: "High",     risk: 84, confidence: 78, raw: 22, tests: 4, seeds: 12, configs: 2, firstObserved: "03:08",  baseline: "New",          owner: "Aisha Rahman",   module: "ddmac_scoreboard",           requirement: "REQ-DDMAC-145",                     signature: "SB_TIMEOUT_OOO_CMPL",       action: "Review ordering assumptions; run checker mutation", triage: "Checker Review" },
  { id: "FC-007", title: "APB security write failure",                    classification: "Design",         severity: "High",     risk: 87, confidence: 90, raw: 17, tests: 4, seeds: 10, configs: 2, firstObserved: "02:41",  baseline: "New",          owner: "Priya Shah",     module: "apb_csr_priv_gate",          requirement: "REQ-SEC-088",   commit: "a8c31f7", signature: "APB_UNPRIV_WRITE_ACCEPT",   action: "Security and RTL owner triage",             triage: "RTL Design Review" },
  { id: "FC-002", title: "License checkout timeout",                     classification: "Infrastructure", severity: "Low",      risk: 18, confidence: 97, raw: 18, tests: 15, seeds: 18, configs: 5, firstObserved: "01:11",  baseline: "Known",        owner: "Marcus Lee",     signature: "LIC_CHECKOUT_TIMEOUT",       action: "Controlled rerun, no engineering triage", triage: "Infrastructure Rerun" },
  { id: "FC-011", title: "Compile-cache invalidation on parameter set",    classification: "Compile",        severity: "Medium",   risk: 35, confidence: 88, raw: 14, tests: 14, seeds: 14, configs: 1, firstObserved: "00:48",  baseline: "New",          owner: "Marcus Lee",     signature: "CACHE_MISS_ELAB_HASH",       action: "Invalidate stale compile cache",          triage: "Infrastructure Rerun" },
  { id: "FC-022", title: "UVM sequencer deadlock on backpressure",        classification: "Testbench",      severity: "Medium",   risk: 58, confidence: 74, raw: 12, tests: 3, seeds: 8, configs: 1, firstObserved: "03:22",  baseline: "New",          owner: "Aisha Rahman",   module: "ddmac_desc_agent",           requirement: "REQ-DDMAC-148",                     signature: "SEQ_DEADLOCK_BP",            action: "Review sequencer arbitration",             triage: "Testbench Review" },
  { id: "FC-034", title: "Reset during reject leaves committed_head stale", classification: "Design",        severity: "Critical", risk: 94, confidence: 82, raw: 9,  tests: 3, seeds: 6, configs: 1, firstObserved: "03:44",  baseline: "New",          owner: "Maya Chen",       module: "ddmac_ring_mgr",             requirement: "ARCH-RESET-017", commit: "a8c31f7", signature: "RESET_HEAD_STALE",           action: "RTL correction and reset property review", triage: "RTL Design Review" },
  { id: "FC-005", title: "Simulator watchdog timeout at seed 0x7F",       classification: "Timeout",        severity: "Medium",   risk: 52, confidence: 71, raw: 11, tests: 2, seeds: 5, configs: 2, firstObserved: "02:03",  baseline: "Persistent",   owner: "Sofia Rodriguez", module: "ddmac_desc_agent",                                                       signature: "SIM_WATCHDOG_TO",           action: "Extend watchdog and rerun with waveform", triage: "Testbench Review" },
  { id: "FC-025", title: "Coverage merge dropped functional bins",        classification: "Coverage",       severity: "Low",      risk: 22, confidence: 84, raw: 8,  tests: 8, seeds: 8, configs: 3, firstObserved: "04:02",  baseline: "New",          owner: "Marcus Lee",     signature: "COV_MERGE_DROP_BINS",        action: "Re-run merge with retention policy", triage: "Infrastructure Rerun" },
  { id: "FC-030", title: "Descriptor sequence tag non-monotonic",         classification: "Assertion",      severity: "High",     risk: 79, confidence: 76, raw: 7,  tests: 2, seeds: 4, configs: 1, firstObserved: "03:12",  baseline: "New",          owner: "Arun Patel",     module: "ddmac_ring_mgr",             requirement: "REQ-DDMAC-151",                     signature: "SEQ_TAG_NONMONO",            action: "Formal proof recommended",                 triage: "Formal Review" },
  { id: "FC-018", title: "APB register write >3 APB cycles",              classification: "Assertion",      severity: "Low",      risk: 24, confidence: 92, raw: 6,  tests: 6, seeds: 6, configs: 2, firstObserved: "02:59",  baseline: "Known",        owner: "Maya Chen",       module: "apb_csr",                    requirement: "REQ-DDMAC-149",                     signature: "APB_WRITE_LATENCY",          action: "Known waiver — confirm still applicable", triage: "Resolved" },
  { id: "FC-009", title: "Test artifact upload failure",                   classification: "Infrastructure", severity: "Low",      risk: 15, confidence: 95, raw: 5,  tests: 5, seeds: 5, configs: 3, firstObserved: "03:31",  baseline: "Known",        owner: "Marcus Lee",     signature: "ARTIFACT_UPLOAD_5xx",        action: "Rerun on healthy artifact store",        triage: "Infrastructure Rerun" },
  { id: "FC-041", title: "Descriptor error code mismatch on simultaneous errors", classification: "Design", severity: "High", risk: 81, confidence: 73, raw: 4, tests: 2, seeds: 3, configs: 1, firstObserved: "03:55", baseline: "New",          owner: "Maya Chen",       module: "ddmac_error_capture",        requirement: "REQ-DDMAC-155",                     signature: "ERR_CODE_MISMATCH",          action: "RTL owner review; add directed test",   triage: "RTL Design Review" },
];

const CLASSIFICATION_COLORS: Record<Classification, string> = {
  Infrastructure: "hsl(var(--avep-foreground-muted))",
  Compile:        "hsl(var(--avep-warning))",
  Testbench:      "hsl(var(--avep-primary))",
  Checker:        "hsl(var(--avep-primary))",
  Design:         "hsl(var(--avep-danger))",
  Assertion:      "hsl(var(--avep-warning))",
  Timeout:        "hsl(var(--avep-warning))",
  Intermittent:   "hsl(var(--avep-warning))",
  Coverage:       "hsl(var(--avep-foreground-muted))",
  Unknown:        "hsl(var(--avep-foreground-subtle))",
};

const TIMELINE_EVENTS = [
  { t: "00:00", label: "Compile & elaboration start",    tone: "info" as const },
  { t: "00:42", label: "Compile cache miss (FC-011)",    tone: "warn" as const },
  { t: "01:11", label: "License saturation 93%",          tone: "warn" as const },
  { t: "01:52", label: "simfarm-west-03 worker loss",     tone: "bad"  as const },
  { t: "02:14", label: "First FC-031 boundary failure",   tone: "bad"  as const },
  { t: "02:26", label: "FC-028 timing assertion spike",   tone: "bad"  as const },
  { t: "02:41", label: "FC-007 APB security failure",     tone: "bad"  as const },
  { t: "03:08", label: "FC-019 scoreboard timeout",       tone: "bad"  as const },
  { t: "03:44", label: "FC-034 reset/head stale",         tone: "bad"  as const },
  { t: "04:02", label: "Coverage merge delayed 24 min",   tone: "warn" as const },
  { t: "04:38", label: "Failure classification complete", tone: "info" as const },
];

const BASELINE_DELTA = [
  { test: "test_desc_length_at_max",       cfg: "cfg_a", seed: "0x0010", base: "Pass", curr: "Fail", cluster: "FC-031", conf: 91, owner: "Maya Chen",       action: "RTL bounded correction" },
  { test: "test_desc_length_above_max",    cfg: "cfg_a", seed: "0x0020", base: "Pass", curr: "Fail", cluster: "FC-031", conf: 88, owner: "Maya Chen",       action: "RTL bounded correction" },
  { test: "test_desc_error_timing",         cfg: "cfg_b", seed: "0x1004", base: "Pass", curr: "Fail", cluster: "FC-028", conf: 62, owner: "Arun Patel",       action: "Clarify requirement" },
  { test: "test_apb_protected_write",      cfg: "cfg_a", seed: "0x6008", base: "Pass", curr: "Fail", cluster: "FC-007", conf: 90, owner: "Priya Shah",       action: "Security triage" },
  { test: "test_out_of_order_completion",  cfg: "cfg_c", seed: "0x4200", base: "Pass", curr: "Fail", cluster: "FC-019", conf: 78, owner: "Aisha Rahman",     action: "Checker review" },
  { test: "test_reset_during_reject",      cfg: "cfg_a", seed: "0x301A", base: "Pass", curr: "Fail", cluster: "FC-034", conf: 82, owner: "Maya Chen",       action: "RTL + reset property review" },
  { test: "test_desc_dual_error_priority", cfg: "cfg_a", seed: "0x203F", base: "Fail", curr: "Fail", cluster: "FC-041", conf: 73, owner: "Maya Chen",       action: "Persistent — RTL review" },
  { test: "test_desc_length_below_max",    cfg: "cfg_a", seed: "0x0001", base: "Fail", curr: "Pass", cluster: "—",       conf: 99, owner: "Sofia Rodriguez", action: "Resolved" },
  { test: "test_interrupt_latency",         cfg: "cfg_b", seed: "0x5001", base: "Pass", curr: "Abort", cluster: "FC-014", conf: 96, owner: "Marcus Lee",     action: "Infra rerun" },
  { test: "test_sustained_descriptor_rate", cfg: "cfg_d", seed: "0x7000", base: "n/a",  curr: "n/a",  cluster: "—",       conf: 0,  owner: "Marcus Lee",     action: "Configuration changed — not comparable" },
];

const INTERMITTENT = [
  { test: "test_desc_error_timing",        rate: "8 / 50",  pass: 42, fail: 8,  corr: "Config cfg_b",     conf: 62, klass: "Requirement ambiguity" },
  { test: "test_reset_during_reject",      rate: "4 / 20",  pass: 16, fail: 4,  corr: "Node west-03",     conf: 71, klass: "Infrastructure instability" },
  { test: "test_out_of_order_completion",  rate: "6 / 15",  pass: 9,  fail: 6,  corr: "Commit a8c31f7",   conf: 78, klass: "Non-deterministic checker" },
  { test: "test_desc_dual_error_priority", rate: "3 / 25",  pass: 22, fail: 3,  corr: "Time-of-day peak", conf: 58, klass: "Race in testbench" },
  { test: "test_sequence_tag_monotonic",   rate: "2 / 12",  pass: 10, fail: 2,  corr: "Seed 0x8F range",  conf: 66, klass: "Seed-sensitive legal" },
];

const INFRA_POOLS = [
  { pool: "simfarm-west-01", workers: "128 / 128", queue: 42, licenses: "412 / 480", health: "OK",       tone: "ok"   as const },
  { pool: "simfarm-west-02", workers: "126 / 128", queue: 51, licenses: "448 / 480", health: "OK",       tone: "ok"   as const },
  { pool: "simfarm-west-03", workers: "116 / 128", queue: 89, licenses: "465 / 480", health: "Degraded", tone: "bad"  as const },
  { pool: "simfarm-east-01", workers: "128 / 128", queue: 36, licenses: "410 / 480", health: "OK",       tone: "ok"   as const },
];

const INFRA_ISSUES = [
  { text: "simfarm-west-03: 12 workers unavailable",       tone: "bad"  as const },
  { text: "Simulator license saturation at 93%",           tone: "warn" as const },
  { text: "Artifact upload latency elevated (p95 4.2s)",   tone: "warn" as const },
  { text: "Coverage merge delayed by 24 minutes",          tone: "warn" as const },
  { text: "Scheduler retried 74 jobs after node loss",     tone: "info" as const },
];

const RERUN_SCOPES = [
  { scope: "Infrastructure rerun", jobs: "74",    coreHrs: "180",    coverage: "Infrastructure only",       rec: "Required"    },
  { scope: "Targeted rerun",       jobs: "146",   coreHrs: "520",    coverage: "Four primary clusters",     rec: "Required"    },
  { scope: "Dependent regression", jobs: "1,860", coreHrs: "4,900",  coverage: "Affected dependency cone",  rec: "Recommended" },
  { scope: "Full IP regression",   jobs: "5,040", coreHrs: "13,600", coverage: "Broadest",                  rec: "Conditional" },
];

const TRIAGE_COLUMNS: TriageState[] = [
  "Unclassified",
  "Infrastructure Rerun",
  "Testbench Review",
  "Checker Review",
  "RTL Design Review",
  "Formal Review",
  "Awaiting Clarification",
  "Targeted Rerun",
  "Dependent Regression",
  "Resolved",
];

const APPROVERS = [
  { role: "Verification Lead",   owner: "Sofia Rodriguez", state: "Approved" as const,  scope: "Infrastructure rerun" },
  { role: "Regression Lead",     owner: "Daniel Kim",      state: "Pending"  as const,  scope: "Targeted rerun" },
  { role: "RTL Design Lead",     owner: "Maya Chen",       state: "Pending"  as const,  scope: "Design cluster owners" },
  { role: "UVM Architect",       owner: "Aisha Rahman",    state: "Pending"  as const,  scope: "Checker & testbench" },
  { role: "Formal Lead",         owner: "Arun Patel",      state: "Pending"  as const,  scope: "Assertion failures" },
  { role: "Infrastructure Lead", owner: "Marcus Lee",      state: "Approved" as const,  scope: "Pool health + reruns" },
  { role: "Security Engineer",   owner: "Priya Shah",      state: "Pending"  as const,  scope: "Security clusters" },
];

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

function toneColor(tone?: "ok" | "warn" | "bad" | "info") {
  switch (tone) {
    case "ok":   return "hsl(var(--avep-success))";
    case "warn": return "hsl(var(--avep-warning))";
    case "bad":  return "hsl(var(--avep-danger))";
    case "info":
    default:     return "hsl(var(--avep-primary))";
  }
}

function SeverityChip({ s }: { s: Cluster["severity"] }) {
  const map: Record<Cluster["severity"], { fg: string; bg: string }> = {
    Low:      { fg: "hsl(var(--avep-success))", bg: "hsl(var(--avep-success) / 0.10)" },
    Medium:   { fg: "hsl(var(--avep-warning))", bg: "hsl(var(--avep-warning) / 0.10)" },
    High:     { fg: "hsl(var(--avep-danger))",  bg: "hsl(var(--avep-danger) / 0.10)"  },
    Critical: { fg: "hsl(var(--avep-danger))",  bg: "hsl(var(--avep-danger) / 0.18)"  },
  };
  const c = map[s];
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5"
      style={{ color: c.fg, background: c.bg, fontSize: "var(--avep-text-2xs)", fontWeight: 700, letterSpacing: "var(--avep-tracking-wide)" }}>
      {s.toUpperCase()}
    </span>
  );
}

function ClassChip({ c }: { c: Classification }) {
  const color = CLASSIFICATION_COLORS[c];
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5"
      style={{ color, background: `${color.replace(")", " / 0.10)")}`, fontSize: "var(--avep-text-2xs)", fontWeight: 600, border: `1px solid ${color.replace(")", " / 0.30)")}` }}>
      {c}
    </span>
  );
}

function StatePill({ state }: { state: string }) {
  const styles: Record<string, { bg: string; fg: string; border: string }> = {
    Approved:      { bg: "hsl(var(--avep-success) / 0.10)", fg: "hsl(var(--avep-success))", border: "hsl(var(--avep-success) / 0.35)" },
    Pending:       { bg: "hsl(var(--avep-primary) / 0.10)", fg: "hsl(var(--avep-primary))", border: "hsl(var(--avep-primary) / 0.35)" },
    Blocked:       { bg: "hsl(var(--avep-danger) / 0.10)",  fg: "hsl(var(--avep-danger))",  border: "hsl(var(--avep-danger) / 0.35)"  },
    New:           { bg: "hsl(var(--avep-danger) / 0.10)",  fg: "hsl(var(--avep-danger))",  border: "hsl(var(--avep-danger) / 0.35)"  },
    Persistent:    { bg: "hsl(var(--avep-warning) / 0.10)", fg: "hsl(var(--avep-warning))", border: "hsl(var(--avep-warning) / 0.35)" },
    Intermittent:  { bg: "hsl(var(--avep-warning) / 0.10)", fg: "hsl(var(--avep-warning))", border: "hsl(var(--avep-warning) / 0.35)" },
    Known:         { bg: "hsl(var(--avep-foreground) / 0.05)", fg: "hsl(var(--avep-foreground-muted))", border: "hsl(var(--avep-border))" },
    Resolved:      { bg: "hsl(var(--avep-success) / 0.10)", fg: "hsl(var(--avep-success))", border: "hsl(var(--avep-success) / 0.35)" },
  };
  const s = styles[state] ?? { bg: "transparent", fg: "hsl(var(--avep-foreground-muted))", border: "hsl(var(--avep-border))" };
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
      style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}`, fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
      {state}
    </span>
  );
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-lg border ${className}`}
      style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, right }: { icon: any; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 h-7 w-7 rounded flex items-center justify-center"
          style={{ background: "hsl(var(--avep-primary) / 0.10)", color: "hsl(var(--avep-primary))" }}>
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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SimulationOperations() {
  const [scenario, setScenario] = useState<Scenario>("T1");
  const [filter, setFilter] = useState<"all" | "high" | "new" | "infra" | "flaky">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("FC-031");
  const [detailTab, setDetailTab] = useState<string>("Summary");
  const [rerunScope, setRerunScope] = useState<"infra" | "targeted" | "dependent" | "full">("dependent");
  const [walkOpen, setWalkOpen] = useState(false);
  const [walkStep, setWalkStep] = useState(0);

  const kpis = KPIS_BY_SCENARIO[scenario];

  const clusters = useMemo(() => {
    let c = CLUSTERS;
    if (filter === "high")  c = c.filter((x) => x.severity === "High" || x.severity === "Critical");
    if (filter === "new")   c = c.filter((x) => x.baseline === "New");
    if (filter === "infra") c = c.filter((x) => x.classification === "Infrastructure");
    if (filter === "flaky") c = c.filter((x) => x.baseline === "Intermittent" || x.classification === "Intermittent");
    if (search.trim()) {
      const q = search.toLowerCase();
      c = c.filter((x) => x.id.toLowerCase().includes(q) || x.title.toLowerCase().includes(q) || x.signature.toLowerCase().includes(q));
    }
    return c;
  }, [filter, search]);

  const sel = CLUSTERS.find((c) => c.id === selected) ?? CLUSTERS[0];

  const walkSteps = [
    "Review run context and the degraded 91.7% pass rate against the accepted baseline.",
    "Separate 398 raw failures into 37 unique clusters — duplicates consolidated.",
    "Identify 74 infrastructure-only failures eligible for controlled rerun without engineering triage.",
    "Inspect FC-031, a new design failure cluster on the descriptor boundary path.",
    "Compare the failing test against the accepted baseline result.",
    "Review logs, waveform, assertion, and commit evidence in the cluster detail.",
    "Identify an intermittent checker issue (FC-019 scoreboard timeout).",
    "Compare rerun scopes: infrastructure, targeted, dependent, and full IP regression.",
    "Verification-lead authorization is required before broader reruns proceed.",
    "Broader signoff remains a separate gate — regression completion is not signoff.",
  ];

  return (
    <div className="min-h-full" style={{ background: "hsl(var(--avep-surface-canvas))", fontFamily: "var(--avep-font-sans)", color: "hsl(var(--avep-foreground))" }}>
      {/* ---------- Context strip ---------- */}
      <div className="border-b px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-1"
        style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontSize: "var(--avep-text-xs)" }}>
        <ContextItem label="Program"  value="StrataShield Secure Processing SoC" />
        <ContextItem label="IP"       value="DDMAC Packet Movement Engine" />
        <ContextItem label="Revision" value="DDMAC 3.2" mono />
        <ContextItem label="RTL"      value="rtl_baseline_3.2.18_candidate" mono />
        <ContextItem label="DV Env"   value="dv_env_2.4_candidate" mono />
        <ContextItem label="Suite"    value="DDMAC_NIGHTLY_FULL" mono />
        <ContextItem label="Run"      value="REG-2026-07-21-0042" mono />
        <ContextItem label="Branch"   value="feature/ddmac_descriptor_guard" mono />
        <ContextItem label="Milestone" value="M4 DV Entry" />
        <ContextItem label="Role"     value="Verification Lead" />
      </div>

      {/* ---------- Header ---------- */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>
              AVEP.P2.SIM.001 · PHASE 2 · BUILD AND VERIFY · EXECUTE SIMULATIONS & REGRESSIONS
            </div>
            <h1 className="mt-1 font-semibold" style={{ fontSize: "var(--avep-text-2xl)", letterSpacing: "-0.01em" }}>
              Simulation Operations &amp; Regression Intelligence
            </h1>
            <p className="mt-1 max-w-2xl" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
              Orchestrate simulation execution, separate infrastructure from engineering failures, cluster duplicate signatures, identify new and intermittent failures, and recommend proportionate rerun scope. AVEP correlates; verification leadership decides.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "hsl(var(--avep-border))" }}>
              {(["T0","T1","T2","T3"] as Scenario[]).map((s) => {
                const active = s === scenario;
                return (
                  <button key={s} onClick={() => setScenario(s)}
                    className="px-2 py-1 rounded"
                    style={{
                      background: active ? "hsl(var(--avep-primary))" : "transparent",
                      color: active ? "hsl(var(--avep-primary-foreground))" : "hsl(var(--avep-foreground-muted))",
                      fontSize: "var(--avep-text-xs)", fontWeight: 600,
                    }}
                    title={s === "T0" ? "Baseline Green" : s === "T1" ? "Regression Degradation" : s === "T2" ? "AI-Assisted Triage" : "Fix Validated"}>
                    {s}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setWalkOpen(true); setWalkStep(0); }}
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5"
              style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>
              <PlayCircle className="h-3.5 w-3.5" /> Start Walkthrough
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md border px-3.5 py-2.5 flex items-start gap-3"
          style={{ borderColor: "hsl(var(--avep-warning) / 0.35)", background: "hsl(var(--avep-warning) / 0.06)" }}>
          <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: "hsl(var(--avep-warning))" }} />
          <div style={{ fontSize: "var(--avep-text-sm)" }}>
            <span className="font-semibold">Recommendation:</span>{" "}
            Triage four high-risk engineering clusters, rerun 31 infrastructure-aborted jobs on a healthy pool, then execute a dependent regression across the affected dependency cone.
            <span className="ml-2" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>AI classification is advisory and must be confirmed by engineering evidence.</span>
          </div>
        </div>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {kpis.map((k) => (
            <button key={k.key}
              onClick={() =>
                setFilter(
                  k.key === "new" ? "new" :
                  k.key === "infra" ? "infra" :
                  k.key === "flaky" ? "flaky" :
                  k.key === "clusters" ? "high" :
                  "all"
                )
              }
              className="text-left rounded-lg border p-3 transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}>
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>{k.label.toUpperCase()}</div>
              <div className="mt-0.5 font-semibold" style={{ fontSize: "var(--avep-text-xl)", color: toneColor(k.tone) }}>{k.value}</div>
              <div className="mt-0.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{k.detail}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Run overview + Timeline ---------- */}
      <div className="px-6 grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-5">
          <SectionTitle icon={GitCommit} title="Regression Run Overview" subtitle="Suite · dispatch · scheduler · approvals" />
          <div className="p-4 grid grid-cols-2 gap-3">
            <Meta label="Suite" value="DDMAC_NIGHTLY_FULL" mono />
            <Meta label="Run ID" value="REG-2026-07-21-0042" mono />
            <Meta label="Trigger" value="Nightly · post-commit" />
            <Meta label="Commit" value="a8c31f7 · descriptor_guard" mono />
            <Meta label="Simulator" value="vcs-2025.06-SP1" mono />
            <Meta label="Scheduler" value="lsf-lava-9" mono />
            <Meta label="Compute pool" value="simfarm-west-* (4 pools)" mono />
            <Meta label="Jobs / seeds" value="5,040 / 12,600" mono />
            <Meta label="Coverage" value="Enabled · UCDB merge on completion" />
            <Meta label="Artifact policy" value="Preserve waveforms on high-risk failures" />
            <Meta label="Owner" value="Sofia Rodriguez" />
            <Meta label="Duration (elapsed)" value="4h 42m · running" mono />
          </div>
          <div className="px-4 pb-3 flex flex-wrap gap-1.5" style={{ fontSize: "var(--avep-text-2xs)" }}>
            {["Pause Dispatch", "Resume Dispatch", "Cancel Pending", "Rerun Infra Jobs", "Compare Baseline", "Export Manifest", "Open CI", "Open Compute"].map((a) => (
              <button key={a} className="rounded border px-2 py-1"
                style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontWeight: 600 }}>
                {a}
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 xl:col-span-7">
          <SectionTitle icon={Activity} title="Execution Timeline" subtitle="Compile · dispatch · execution · coverage · classification · triage" />
          <div className="p-4">
            <div className="relative h-24 rounded border" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))" }}>
              {/* concurrency curve */}
              <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="conc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="hsl(var(--avep-primary))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(var(--avep-primary))" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d="M0,80 L20,60 L60,55 L100,40 L140,30 L200,28 L260,32 L320,38 L380,48 L440,62 L500,70 L500,100 L0,100 Z"
                  fill="url(#conc)" />
                <path d="M0,80 L20,60 L60,55 L100,40 L140,30 L200,28 L260,32 L320,38 L380,48 L440,62 L500,70"
                  fill="none" stroke="hsl(var(--avep-primary))" strokeWidth="1.5" />
              </svg>
              {/* event markers */}
              {TIMELINE_EVENTS.map((e, i) => {
                const x = (i / (TIMELINE_EVENTS.length - 1)) * 100;
                return (
                  <div key={e.t}
                    className="absolute -translate-x-1/2 top-1 flex flex-col items-center"
                    style={{ left: `${x}%` }} title={`${e.t} · ${e.label}`}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor(e.tone) }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              {TIMELINE_EVENTS.map((e) => (
                <div key={e.t} className="inline-flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: toneColor(e.tone) }} />
                  <span style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))" }}>{e.t}</span>
                  <span>{e.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2" style={{ fontSize: "var(--avep-text-2xs)" }}>
              <Meta label="Peak concurrency" value="482 workers" mono />
              <Meta label="Queue depth (p95)" value="218 jobs" mono />
              <Meta label="Aborted jobs" value="74 (infra)" mono />
              <Meta label="Compute utilization" value="87.4%" mono />
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Cluster workspace + AI evidence ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-8">
          <SectionTitle
            icon={Layers}
            title="Failure Cluster Workspace"
            subtitle="Correlated signatures grouped from raw failures — click a row to open evidence"
            right={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cluster / signature…"
                    className="pl-7 pr-2 py-1 rounded border w-56 outline-none"
                    style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))", fontSize: "var(--avep-text-xs)" }} />
                </div>
                <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "high", label: "High risk" },
                    { id: "new", label: "New" },
                    { id: "infra", label: "Infra" },
                    { id: "flaky", label: "Flaky" },
                  ].map((f) => {
                    const active = filter === f.id;
                    return (
                      <button key={f.id} onClick={() => setFilter(f.id as any)}
                        className="px-2 py-1 rounded inline-flex items-center gap-1"
                        style={{
                          background: active ? "hsl(var(--avep-primary))" : "transparent",
                          color: active ? "hsl(var(--avep-primary-foreground))" : "hsl(var(--avep-foreground-muted))",
                          fontSize: "var(--avep-text-2xs)", fontWeight: 600,
                        }}>
                        <Filter className="h-3 w-3" /> {f.label}
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
                  {["Cluster", "Title", "Class", "Sev", "Risk", "Conf", "Raw", "Tests", "Seeds", "Baseline", "Owner", "Signature", "Action"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clusters.map((c) => {
                  const active = c.id === selected;
                  return (
                    <tr key={c.id} onClick={() => setSelected(c.id)}
                      className="cursor-pointer"
                      style={{ background: active ? "hsl(var(--avep-primary) / 0.06)" : "transparent" }}>
                      <td className="px-2 py-1.5 border-b whitespace-nowrap" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground))" }}>{c.id}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{c.title}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><ClassChip c={c.classification} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><SeverityChip s={c.severity} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{c.risk}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{c.confidence}%</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{c.raw}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{c.tests}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{c.seeds}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={c.baseline} /></td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{c.owner}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>{c.signature}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", color: "hsl(var(--avep-foreground-muted))" }}>{c.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
            <span>{clusters.length} clusters · 398 raw failures · 221 consolidated as duplicates</span>
            <button className="inline-flex items-center gap-1 rounded border px-2 py-1"
              style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", fontWeight: 600 }}>
              Export Triage Package <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        <Card className="col-span-12 xl:col-span-4">
          <SectionTitle icon={Sparkles} title="AI Regression Evidence" subtitle="Structured reasoning · advisory only" />
          <div className="p-4 space-y-3" style={{ fontSize: "var(--avep-text-xs)" }}>
            <div className="rounded-md border p-2.5" style={{ borderColor: "hsl(var(--avep-warning) / 0.35)", background: "hsl(var(--avep-warning) / 0.06)" }}>
              <div className="font-semibold" style={{ color: "hsl(var(--avep-warning))" }}>Execute controlled triage and dependent rerun</div>
              <div className="mt-0.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                398 raw failures reduce to 37 clusters. 74 are infrastructure; 221 duplicate signatures. Four newly introduced engineering clusters carry most of the risk.
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>HIGHEST-RISK CLUSTERS</div>
              <ol className="space-y-0.5 list-decimal pl-4">
                <li><span style={{ fontFamily: "var(--avep-font-mono)" }}>FC-031</span> Descriptor max-length regression</li>
                <li><span style={{ fontFamily: "var(--avep-font-mono)" }}>FC-028</span> Error response timing failure</li>
                <li><span style={{ fontFamily: "var(--avep-font-mono)" }}>FC-019</span> Scoreboard ordering timeout</li>
                <li><span style={{ fontFamily: "var(--avep-font-mono)" }}>FC-007</span> Unauthorized APB write failure</li>
              </ol>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>CLASSIFICATION CONFIDENCE</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ["Infrastructure", 96], ["Testbench/Checker", 89],
                  ["Design", 91], ["Intermittent", 78], ["Unknown", 54],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex items-center justify-between rounded border px-2 py-1" style={{ borderColor: "hsl(var(--avep-border))" }}>
                    <span>{l}</span>
                    <span style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600 }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>UNCERTAINTY</div>
              <ul className="space-y-0.5 list-disc pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                <li>11 failures lack sufficient artifacts.</li>
                <li>7 tests changed configuration from baseline.</li>
                <li>5 failures may share a checker defect.</li>
                <li>3 clusters require waveform review.</li>
                <li>1 requirement ambiguity blocks classification.</li>
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>RECOMMENDED ACTIONS</div>
              <ul className="space-y-0.5 list-disc pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                <li>Rerun infrastructure-aborted jobs.</li>
                <li>Hold broad rerun until checker ordering review.</li>
                <li>Execute targeted boundary and security tests.</li>
                <li>Preserve waveforms and transaction traces on high-risk failures.</li>
                <li>Clarify error timing requirement.</li>
                <li>Escalate four clusters to verification leadership.</li>
              </ul>
            </div>

            <div className="rounded border px-2 py-1.5" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              AI classification is advisory and must be confirmed by engineering evidence. AI cannot approve rerun scope or close defects.
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Cluster detail workspace ---------- */}
      <div className="px-6 mt-4">
        <Card>
          <SectionTitle
            icon={AlertTriangle}
            title={`Cluster Detail · ${sel.id}`}
            subtitle={sel.title}
            right={
              <div className="flex items-center gap-2">
                <SeverityChip s={sel.severity} />
                <ClassChip c={sel.classification} />
                <StatePill state={sel.baseline} />
              </div>
            }
          />
          <div className="px-3 pt-2 flex flex-wrap gap-1 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
            {["Summary", "Signature Evidence", "Tests & Seeds", "Logs", "Waveforms", "Assertions", "Source & Commit", "Requirement Traceability", "Historical Runs", "Rerun Plan", "Triage History"].map((t) => {
              const active = detailTab === t;
              return (
                <button key={t} onClick={() => setDetailTab(t)}
                  className="px-2.5 py-1 rounded-t border border-b-0"
                  style={{
                    background: active ? "hsl(var(--avep-surface))" : "transparent",
                    borderColor: active ? "hsl(var(--avep-border))" : "transparent",
                    color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                    fontSize: "var(--avep-text-xs)", fontWeight: 600, marginBottom: -1,
                  }}>
                  {t}
                </button>
              );
            })}
          </div>

          <div className="p-4" style={{ fontSize: "var(--avep-text-xs)" }}>
            {detailTab === "Summary" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Meta label="Classification" value={sel.classification} />
                <Meta label="Severity" value={sel.severity} />
                <Meta label="Risk / Confidence" value={`${sel.risk} · ${sel.confidence}%`} mono />
                <Meta label="Raw failures" value={String(sel.raw)} mono />
                <Meta label="Tests × Seeds × Configs" value={`${sel.tests} × ${sel.seeds} × ${sel.configs}`} mono />
                <Meta label="First observed" value={sel.firstObserved} mono />
                <Meta label="Module" value={sel.module ?? "—"} mono />
                <Meta label="Requirement" value={sel.requirement ?? "—"} mono />
                <Meta label="Commit" value={sel.commit ?? "—"} mono />
                <Meta label="Baseline" value={sel.baseline} />
                <Meta label="Owner" value={sel.owner} />
                <Meta label="Recommendation" value={sel.action} />
              </div>
            )}

            {detailTab === "Signature Evidence" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded border p-3" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))" }}>
                  <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>NORMALIZED SIGNATURE</div>
                  <pre className="mt-1" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{`hash        : 0x${sel.id.replace("FC-", "").padStart(8, "a")}
signature   : ${sel.signature}
assertion   : p_invalid_descriptor_not_accepted
hierarchy   : tb.dut.${sel.module ?? "u_desc_guard"}
signal      : desc_accept
transaction : txn_id=0x0142
sim exit    : 129
phase       : run_phase
tokens      : REJECT_MISS, MAX_LEN, TXN_0142
duplicates  : ${sel.raw - sel.tests}`}</pre>
                </div>
                <div>
                  <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>WHY CLUSTERED</div>
                  <ul className="mt-1 space-y-0.5 list-disc pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                    <li>Same assertion identity across failures.</li>
                    <li>Same RTL hierarchy path.</li>
                    <li>Same transaction signature window.</li>
                    <li>Same commit relationship (a8c31f7).</li>
                    <li>Same waveform symptom near boundary.</li>
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5" style={{ fontSize: "var(--avep-text-2xs)" }}>
                    {["Merge Clusters", "Split Cluster", "Reclassify", "Add Evidence", "Reject AI Correlation", "Assign Owner"].map((a) => (
                      <button key={a} className="rounded border px-2 py-1"
                        style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontWeight: 600 }}>{a}</button>
                    ))}
                  </div>
                  <div className="mt-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                    All actions are audited. Duplicate clustering does not prove common root cause.
                  </div>
                </div>
              </div>
            )}

            {detailTab === "Tests & Seeds" && (
              <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
                <thead style={{ color: "hsl(var(--avep-foreground-subtle))", background: "hsl(var(--avep-surface-canvas))" }}>
                  <tr>{["Test", "Seed", "Cfg", "Result", "Duration", "Retries", "Baseline", "Intermittency", "Artifacts", "Owner"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[
                    ["test_desc_length_at_max",    "0x0010", "cfg_a", "Fail",  "42s",  "0", "Pass", "0.02", "wave+log", sel.owner],
                    ["test_desc_length_above_max", "0x0020", "cfg_a", "Fail",  "38s",  "0", "Pass", "0.00", "wave+log", sel.owner],
                    ["test_random_boundary_weighting", "0x8007", "cfg_a", "Fail", "6m",   "0", "Pass", "0.12", "log",     sel.owner],
                    ["test_desc_length_below_max", "0x0001", "cfg_a", "Pass",  "38s",  "0", "Pass", "0.00", "log",     sel.owner],
                    ["test_desc_length_at_max",    "0x0011", "cfg_b", "Fail",  "44s",  "1", "Pass", "0.08", "wave+log", sel.owner],
                    ["test_desc_length_at_max",    "0x0012", "cfg_c", "Fail",  "41s",  "0", "n/a",  "0.05", "log",     sel.owner],
                  ].map((r) => (
                    <tr key={`${r[0]}-${r[1]}-${r[2]}`}>
                      {r.map((c, i) => (
                        <td key={i} className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: i === 0 || i === 1 || i === 2 || i === 7 ? "var(--avep-font-mono)" : undefined }}>
                          {i === 3 ? <StatePill state={c === "Pass" ? "Resolved" : "New"} /> : c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {detailTab === "Logs" && (
              <pre className="rounded border p-3 overflow-x-auto" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))", fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)", lineHeight: 1.6 }}>{`[  0.000ns] UVM_INFO tb: run_phase started (seed=0x0010)
[ 42.400ns] UVM_INFO drv: send_length(max_len)              // boundary
[ 43.200ns] UVM_ERROR mon: desc_accept=0, desc_error=1      // <-- first divergence
[ 43.200ns] ASSERT   p_invalid_descriptor_not_accepted FAIL
                    tb.dut.u_desc_guard : line 412
[ 43.200ns] UVM_INFO sb : txn_id=0x0142 expected=ACCEPT got=REJECT
[ 44.000ns] UVM_INFO drv: send_length(max_len+1)            // illegal
[ 44.800ns] UVM_INFO mon: desc_accept=0, desc_error=1        // OK
[ 45.600ns] UVM_INFO tb : run_phase completed
[ 45.600ns] EXIT 129`}</pre>
            )}

            {detailTab === "Waveforms" && (
              <div>
                <div className="rounded border p-3" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))" }}>
                  <svg viewBox="0 0 800 220" className="w-full h-56">
                    {["clk", "rst_n", "desc_valid", "desc_ready", "payload_len", "priv_mode", "desc_accept", "desc_error", "err_code", "state"].map((sig, i) => {
                      const y = 15 + i * 20;
                      return (
                        <g key={sig}>
                          <text x="0" y={y + 4} fill="hsl(var(--avep-foreground-muted))" fontSize="9" fontFamily="var(--avep-font-mono)">{sig}</text>
                          <line x1="80" y1={y} x2="800" y2={y} stroke="hsl(var(--avep-border))" strokeWidth="0.5" />
                        </g>
                      );
                    })}
                    {/* clock */}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <path key={i} d={`M${80 + i * 24},15 h12 v-8 h12 v8`} fill="none" stroke="hsl(var(--avep-primary))" strokeWidth="1" />
                    ))}
                    {/* rst_n */}
                    <path d="M80,35 h40 v-8 h680" fill="none" stroke="hsl(var(--avep-foreground))" strokeWidth="1" />
                    {/* desc_valid */}
                    <path d="M80,55 h200 v-8 h120 v8 h240 v-8 h160" fill="none" stroke="hsl(var(--avep-primary))" strokeWidth="1" />
                    {/* desc_ready */}
                    <path d="M80,75 h220 v-8 h100 v8 h260 v-8 h140" fill="none" stroke="hsl(var(--avep-primary))" strokeWidth="1" />
                    {/* payload_len (bus) */}
                    <path d="M80,95 l8,-8 h140 l8,8 l-8,-8 M244,95 l-8,-8 h140 l-8,8" fill="none" stroke="hsl(var(--avep-foreground))" strokeWidth="1" />
                    <text x="150" y="90" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-foreground))">0x03FF</text>
                    <text x="310" y="90" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-danger))">0x0400</text>
                    {/* priv_mode */}
                    <path d="M80,115 h720" fill="none" stroke="hsl(var(--avep-foreground))" strokeWidth="1" />
                    {/* desc_accept — bug window */}
                    <rect x="300" y="128" width="120" height="10" fill="hsl(var(--avep-danger) / 0.20)" />
                    <path d="M80,135 h220 v-8 h0 v8 h500" fill="none" stroke="hsl(var(--avep-foreground))" strokeWidth="1" />
                    {/* desc_error */}
                    <path d="M80,155 h300 v-8 h40 v8 h380" fill="none" stroke="hsl(var(--avep-danger))" strokeWidth="1.2" />
                    {/* err_code */}
                    <text x="310" y="170" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-danger))">ERR=LEN_OVR</text>
                    {/* state */}
                    <text x="90" y="200" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-foreground))">IDLE</text>
                    <text x="210" y="200" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-foreground))">VALIDATE</text>
                    <text x="380" y="200" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-danger))">REJECT*</text>
                    <text x="540" y="200" fontSize="8" fontFamily="var(--avep-font-mono)" fill="hsl(var(--avep-foreground))">IDLE</text>
                    {/* failure marker */}
                    <line x1="360" y1="10" x2="360" y2="215" stroke="hsl(var(--avep-danger))" strokeWidth="0.5" strokeDasharray="2 2" />
                    <text x="362" y="12" fontSize="8" fill="hsl(var(--avep-danger))">failure window</text>
                  </svg>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5" style={{ fontSize: "var(--avep-text-2xs)" }}>
                  {["Zoom", "Pan", "Sync Markers", "Baseline Overlay", "Good-run Compare", "Open RTL", "Open Requirement"].map((a) => (
                    <button key={a} className="rounded border px-2 py-1"
                      style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontWeight: 600 }}>{a}</button>
                  ))}
                </div>
              </div>
            )}

            {detailTab === "Assertions" && (
              <div className="rounded border p-3" style={{ borderColor: "hsl(var(--avep-border))" }}>
                <div className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)" }}>p_invalid_descriptor_not_accepted</div>
                <pre className="mt-1" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)", lineHeight: 1.5 }}>{`property p_invalid_descriptor_not_accepted;
  @(posedge clk) disable iff (!rst_n)
    invalid_descriptor |-> !desc_accept;
endproperty`}</pre>
                <div className="mt-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                  Assertion fired at 43.2ns on seed 0x0010. Antecedent held (payload_len &gt; max_transfer_length); consequent violated (desc_accept=1). Same identity across 41 raw failures.
                </div>
              </div>
            )}

            {detailTab === "Source & Commit" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Meta label="Suspected commit" value="a8c31f7 · Maya Chen · 2026-07-20" mono />
                <Meta label="Pull request" value="PR #4421 · descriptor_guard: max-len path" />
                <Meta label="Files changed" value="rtl/ddmac_descriptor_validator.sv (+34/-11), rtl/ddmac_error_capture.sv (+8/-2)" mono />
                <Meta label="Semantic diff" value="Boundary comparison changed from >= to >" />
                <Meta label="Suspected line" value="rtl/ddmac_descriptor_validator.sv:412" mono />
                <Meta label="Prior baseline behavior" value="Pass across 5,040 jobs on rtl_baseline_3.2.17" />
                <Meta label="Change-impact link" value="AVEP.P2.RTL.002 · CIA-2026-0074" mono />
              </div>
            )}

            {detailTab === "Requirement Traceability" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Meta label="Requirement" value={sel.requirement ?? "—"} mono />
                <Meta label="VPLAN section" value="§4.2 Descriptor Guard" />
                <Meta label="Test plan objectives" value="OBJ-142-A · OBJ-142-B · OBJ-142-C" mono />
                <Meta label="Coverage bins" value="length.below · length.equal · length.above" mono />
                <Meta label="Formal candidate" value="Invalid descriptor never accepted (Approved)" />
                <Meta label="Prior defect" value="DEF-DV-173" mono />
              </div>
            )}

            {detailTab === "Historical Runs" && (
              <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
                <thead style={{ color: "hsl(var(--avep-foreground-subtle))" }}>
                  <tr>{["Run", "Date", "Rev", "Result", "Failures", "Note"].map((h) => (
                    <th key={h} className="text-left font-semibold py-1" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[
                    ["REG-2026-07-21-0042", "07-21", "3.2.18-cand", "Fail (41)", "41", "Current run"],
                    ["REG-2026-07-20-0037", "07-20", "3.2.17",     "Pass",       "0",  "Accepted baseline"],
                    ["REG-2026-07-19-0033", "07-19", "3.2.17-rc2", "Pass",       "0",  "—"],
                    ["REG-2026-07-15-0021", "07-15", "3.2.16",     "Pass",       "0",  "—"],
                  ].map((r) => (
                    <tr key={r[0] as string}>
                      {r.map((c, i) => (
                        <td key={i} className="py-1 pr-4" style={{ fontFamily: i <= 2 ? "var(--avep-font-mono)" : undefined }}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {detailTab === "Rerun Plan" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { k: "infra",     t: "A · Infrastructure rerun", d: "License / node / artifact aborts", j: "74 jobs · 180 core-hrs" },
                  { k: "targeted",  t: "B · Targeted engineering",  d: "Selected tests, seeds, configs",   j: "146 jobs · 520 core-hrs" },
                  { k: "dependent", t: "C · Dependent regression",  d: "Affected dependency cone",         j: "1,860 jobs · 4,900 core-hrs" },
                  { k: "full",      t: "D · Full IP regression",     d: "Only when impact scope unclear",   j: "5,040 jobs · 13,600 core-hrs" },
                ].map((o) => {
                  const active = rerunScope === (o.k as any);
                  return (
                    <button key={o.k} onClick={() => setRerunScope(o.k as any)}
                      className="text-left rounded border p-3"
                      style={{ borderColor: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))", background: active ? "hsl(var(--avep-primary) / 0.06)" : "hsl(var(--avep-surface))" }}>
                      <div className="font-semibold">{o.t}</div>
                      <div style={{ color: "hsl(var(--avep-foreground-muted))" }}>{o.d}</div>
                      <div className="mt-1" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-2xs)" }}>{o.j}</div>
                    </button>
                  );
                })}
                <div className="md:col-span-4" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                  Costs are estimated. Rerun approval remains with Regression and Verification leadership.
                </div>
              </div>
            )}

            {detailTab === "Triage History" && (
              <ol className="space-y-1.5 list-decimal pl-4" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Cluster formed</span> · AVEP · 02:14 · 41 raw failures correlated by signature</li>
                <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Classified</span> · AVEP · 02:16 · Design · confidence 91%</li>
                <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Assigned</span> · Sofia Rodriguez · 02:22 · owner Maya Chen</li>
                <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Moved</span> · to RTL Design Review · 02:24</li>
                <li><span style={{ color: "hsl(var(--avep-foreground))" }}>Pending</span> · targeted rerun approval by Regression Lead</li>
              </ol>
            )}
          </div>
        </Card>
      </div>

      {/* ---------- Baseline comparison ---------- */}
      <div className="px-6 mt-4">
        <Card>
          <SectionTitle icon={GitBranch} title="Baseline Comparison" subtitle="REG-2026-07-21-0042 · vs · REG-2026-07-20-0037 (accepted baseline)" />
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-12 lg:col-span-4 border-r" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <div className="p-3 grid grid-cols-2 gap-3" style={{ fontSize: "var(--avep-text-xs)" }}>
                <Meta label="Pass rate" value="91.7% vs 97.8%" mono />
                <Meta label="Jobs" value="4,812 / 5,040 vs 5,040" mono />
                <Meta label="New failing" value="63" mono />
                <Meta label="Newly passing" value="4" mono />
                <Meta label="Persistent failing" value="12" mono />
                <Meta label="Intermittent" value="19" mono />
                <Meta label="Infrastructure-only" value="74" mono />
                <Meta label="Not comparable" value="7 (cfg changed)" mono />
                <Meta label="Runtime" value="4h 42m vs 4h 08m" mono />
                <Meta label="Compute" value="8,460 vs 7,910 core-hrs" mono />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 overflow-x-auto">
              <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
                <thead style={{ color: "hsl(var(--avep-foreground-subtle))", background: "hsl(var(--avep-surface-canvas))" }}>
                  <tr>{["Test", "Cfg", "Seed", "Baseline", "Current", "Cluster", "Conf", "Owner", "Action"].map((h) => (
                    <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {BASELINE_DELTA.map((r) => (
                    <tr key={`${r.test}-${r.seed}`}>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.test}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.cfg}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.seed}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.base}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", color: r.curr === "Fail" || r.curr === "Abort" ? "hsl(var(--avep-danger))" : r.curr === "Pass" ? "hsl(var(--avep-success))" : undefined, fontWeight: 600 }}>{r.curr}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.cluster}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.conf}%</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.owner}</td>
                      <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", color: "hsl(var(--avep-foreground-muted))" }}>{r.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Triage board ---------- */}
      <div className="px-6 mt-4">
        <Card>
          <SectionTitle icon={ClipboardList} title="Failure Classification & Triage Board" subtitle="Move clusters between lanes — every transition is audited" />
          <div className="p-3 overflow-x-auto">
            <div className="flex gap-3 min-w-max">
              {TRIAGE_COLUMNS.map((col) => {
                const cards = CLUSTERS.filter((c) => c.triage === col);
                return (
                  <div key={col} className="w-56 rounded border" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-canvas))" }}>
                    <div className="px-2.5 py-1.5 border-b flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))" }}>
                      <span className="font-semibold" style={{ fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{col.toUpperCase()}</span>
                      <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", fontFamily: "var(--avep-font-mono)" }}>{cards.length}</span>
                    </div>
                    <div className="p-2 space-y-1.5 min-h-[80px]">
                      {cards.map((c) => (
                        <button key={c.id} onClick={() => setSelected(c.id)}
                          className="w-full text-left rounded border p-2"
                          style={{ borderColor: c.id === selected ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}>
                          <div className="flex items-center justify-between">
                            <span style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600, fontSize: "var(--avep-text-2xs)" }}>{c.id}</span>
                            <SeverityChip s={c.severity} />
                          </div>
                          <div className="mt-0.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{c.title}</div>
                          <div className="mt-1 flex items-center justify-between" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                            <span>{c.owner}</span>
                            <span style={{ fontFamily: "var(--avep-font-mono)" }}>{c.raw}× / {c.tests}t</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Intermittency + Infrastructure health ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7">
          <SectionTitle icon={RefreshCw} title="Intermittency Analysis" subtitle="Flaky and seed-sensitive tests · classification is advisory" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ color: "hsl(var(--avep-foreground-subtle))", background: "hsl(var(--avep-surface-canvas))" }}>
                <tr>{["Test", "Failure rate", "Pass", "Fail", "Correlation", "Conf", "Classification"].map((h) => (
                  <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
                ))}</tr>
              </thead>
              <tbody>
                {INTERMITTENT.map((r) => (
                  <tr key={r.test}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.test}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.rate}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.pass}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-danger))" }}>{r.fail}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.corr}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{r.conf}%</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{r.klass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)" }}>
            {["Generate Reproducibility Plan", "Compare Seeds", "Compare Nodes", "Compare Commits"].map((a) => (
              <button key={a} className="rounded border px-2 py-1"
                style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontWeight: 600 }}>{a}</button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <SectionTitle icon={Server} title="Infrastructure Health" subtitle="Compute · licenses · scheduler · artifact store" />
          <div className="p-3 space-y-2">
            {INFRA_POOLS.map((p) => (
              <div key={p.pool} className="rounded border p-2 flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))" }}>
                <div>
                  <div style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600, fontSize: "var(--avep-text-xs)" }}>{p.pool}</div>
                  <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>Workers {p.workers} · Queue {p.queue} · Licenses {p.licenses}</div>
                </div>
                <span className="inline-flex items-center rounded px-1.5 py-0.5"
                  style={{ color: toneColor(p.tone), background: `${toneColor(p.tone).replace(")", " / 0.10)")}`, fontSize: "var(--avep-text-2xs)", fontWeight: 700 }}>
                  {p.health.toUpperCase()}
                </span>
              </div>
            ))}
            <div className="mt-2">
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", letterSpacing: "var(--avep-tracking-wide)" }}>OPEN INFRASTRUCTURE ISSUES</div>
              <ul className="mt-1 space-y-0.5 list-disc pl-4" style={{ fontSize: "var(--avep-text-xs)" }}>
                {INFRA_ISSUES.map((i) => (
                  <li key={i.text} style={{ color: toneColor(i.tone) }}>{i.text}</li>
                ))}
              </ul>
              <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                Infrastructure failures remain separate from design and verification failures.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ---------- Rerun planner + Approvers ---------- */}
      <div className="px-6 mt-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7">
          <SectionTitle icon={Zap} title="Rerun Recommendation Engine" subtitle="Compare infrastructure · targeted · dependent · full scopes" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ color: "hsl(var(--avep-foreground-subtle))", background: "hsl(var(--avep-surface-canvas))" }}>
                <tr>{["Scope", "Jobs", "Core-hrs (est.)", "Risk coverage", "Recommendation"].map((h) => (
                  <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
                ))}</tr>
              </thead>
              <tbody>
                {RERUN_SCOPES.map((s) => (
                  <tr key={s.scope}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontWeight: 600 }}>{s.scope}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{s.jobs}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontFamily: "var(--avep-font-mono)" }}>{s.coreHrs}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{s.coverage}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
                      <StatePill state={s.rec === "Required" ? "New" : s.rec === "Recommended" ? "Pending" : "Known"} />
                      <span className="ml-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{s.rec}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t grid grid-cols-2 md:grid-cols-4 gap-3" style={{ borderColor: "hsl(var(--avep-border))" }}>
            <Meta label="Current recommendation" value="Dependent regression" />
            <Meta label="Tests / jobs" value="412 / 1,860" mono />
            <Meta label="Estimated wall-clock" value="11.5 hours" mono />
            <Meta label="Artifact policy" value="Preserve waveforms on high-risk" />
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <SectionTitle icon={ShieldAlert} title="Human Review & Approval" subtitle="AI cannot approve rerun scope or close defects" />
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
              <thead style={{ color: "hsl(var(--avep-foreground-subtle))", background: "hsl(var(--avep-surface-canvas))" }}>
                <tr>{["Role", "Owner", "Scope", "State"].map((h) => (
                  <th key={h} className="text-left font-semibold px-2 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", letterSpacing: "var(--avep-tracking-wide)" }}>{h.toUpperCase()}</th>
                ))}</tr>
              </thead>
              <tbody>
                {APPROVERS.map((a) => (
                  <tr key={a.role}>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{a.role}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>{a.owner}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))", color: "hsl(var(--avep-foreground-muted))" }}>{a.scope}</td>
                    <td className="px-2 py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}><StatePill state={a.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
            Regression readiness is separate from coverage closure and signoff. Broader signoff gates remain visible in Coverage Closure and Signoff Readiness.
          </div>
        </Card>
      </div>

      {/* ---------- spacer + decision bar ---------- */}
      <div className="h-24" />
      <div
        className="fixed bottom-0 left-0 right-0 border-t px-6 py-2.5 z-30 flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", boxShadow: "0 -4px 12px -8px hsl(var(--avep-foreground) / 0.10)" }}>
        <BarStat label="Run" value="Degraded" danger />
        <BarStat label="Raw failures" value="398" mono />
        <BarStat label="Clusters" value="37" mono />
        <BarStat label="High-risk" value="4" mono danger />
        <BarStat label="Infra reruns" value="31 sel." mono />
        <BarStat label="Eng reruns" value="146 sel." mono />
        <BarStat label="Approvals" value="1 / 4" mono />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <BarBtn>Rerun Infrastructure Failures</BarBtn>
          <BarBtn>Create Triage Package</BarBtn>
          <BarBtn>Assign Clusters</BarBtn>
          <BarBtn tone="primary">Approve Targeted Rerun</BarBtn>
          <BarBtn tone="primary" disabled title="Regression Lead approval pending">Approve Dependent Regression</BarBtn>
          <BarBtn disabled title="Only used when impact scope is uncertain">Approve Full Regression</BarBtn>
          <BarBtn>Export Evidence</BarBtn>
        </div>
      </div>

      {/* ---------- Walkthrough overlay ---------- */}
      {walkOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 p-4" onClick={() => setWalkOpen(false)}>
          <div className="max-w-lg w-full rounded-lg border shadow-lg"
            style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <div className="font-semibold" style={{ fontSize: "var(--avep-text-md)" }}>Regression Intelligence Walkthrough</div>
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>Step {walkStep + 1} of {walkSteps.length}</div>
            </div>
            <div className="p-4" style={{ fontSize: "var(--avep-text-sm)" }}>{walkSteps[walkStep]}</div>
            <div className="px-4 py-2.5 border-t flex justify-between" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <button onClick={() => setWalkOpen(false)} className="px-2.5 py-1 rounded border"
                style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}>Close</button>
              <div className="flex gap-1.5">
                <button disabled={walkStep === 0} onClick={() => setWalkStep((s) => Math.max(0, s - 1))}
                  className="px-2.5 py-1 rounded border disabled:opacity-40"
                  style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}>Previous</button>
                {walkStep < walkSteps.length - 1 ? (
                  <button onClick={() => setWalkStep((s) => s + 1)} className="px-2.5 py-1 rounded"
                    style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>Next</button>
                ) : (
                  <button onClick={() => setWalkOpen(false)} className="px-2.5 py-1 rounded"
                    style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>Finish</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
}: { children: React.ReactNode; tone?: "ghost" | "primary"; disabled?: boolean; title?: string }) {
  const styles: React.CSSProperties = tone === "primary"
    ? { background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", borderColor: "hsl(var(--avep-primary))" }
    : { background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", borderColor: "hsl(var(--avep-border))" };
  return (
    <button title={title} disabled={disabled}
      className="px-2.5 py-1.5 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ ...styles, fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>
      {children}
    </button>
  );
}
