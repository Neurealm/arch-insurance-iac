import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ShieldCheck,
  AlertTriangle,
  CircleDot,
  Lock,
  FileText,
  GitBranch,
  Layers,
  Play,
  Download,
  ChevronRight,
  X,
  Search,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Activity,
  Filter,
  Fingerprint,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P3.READINESS.002 — Signoff Readiness & Engineering Evidence   */
/* Route: /avep/readiness/signoff                                     */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";
type Recommendation = "Go" | "Conditional Go" | "Hold";

type GateState =
  | "Closed"
  | "Closed with Conditions"
  | "Blocked"
  | "In Review"
  | "Evidence Missing"
  | "Waiver Required"
  | "Not Started"
  | "Stale"
  | "Not Applicable";

interface Gate {
  id: string;
  name: string;
  group: "Engineering Intent" | "Verification Evidence" | "Defect and Risk Control" | "Release Evidence";
  state: GateState;
  criteria: { text: string; met: boolean; evidence: string }[];
  evidence: { id: string; type: string; source: string; baseline: string; ts: string; status: string }[];
  missing: string[];
  dependencies: string[];
  blockers: string[];
  residualRisks: string[];
  owner: string;
  approver: string;
  approvalState: "Approved" | "Pending" | "Approved with Condition" | "Not Started";
  lastEval: string;
  baselineCompat: "Compatible" | "Mismatch" | "Stale";
  impact: "Blocking" | "Conditional" | "Informational";
}

const SCENARIO_META: Record<
  Scenario,
  { label: string; recommendation: Recommendation; closed: number; blocking: number; conditional: number; evidencePct: number }
> = {
  T0: { label: "T0 · Baseline Green", recommendation: "Go", closed: 14, blocking: 0, conditional: 0, evidencePct: 100 },
  T1: { label: "T1 · Evidence Fragmented", recommendation: "Hold", closed: 6, blocking: 3, conditional: 2, evidencePct: 71 },
  T2: { label: "T2 · Readiness Analysis", recommendation: "Conditional Go", closed: 11, blocking: 1, conditional: 2, evidencePct: 94 },
  T3: { label: "T3 · Advancement Approved", recommendation: "Go", closed: 14, blocking: 0, conditional: 0, evidencePct: 100 },
};

const GATES_T2: Gate[] = [
  {
    id: "G01",
    name: "Requirements approved",
    group: "Engineering Intent",
    state: "Closed",
    criteria: [
      { text: "All shall-level requirements reviewed", met: true, evidence: "REQ-REVIEW-2026.07.12" },
      { text: "Traceability to architecture complete", met: true, evidence: "TRACE-DDMAC-3.2-A" },
    ],
    evidence: [
      { id: "REQ-REVIEW-2026.07.12", type: "Review record", source: "Requirements", baseline: "REQ 3.2", ts: "2026-07-12", status: "Current" },
    ],
    missing: [],
    dependencies: [],
    blockers: [],
    residualRisks: [],
    owner: "Arun Patel",
    approver: "Arun Patel",
    approvalState: "Approved",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Informational",
  },
  {
    id: "G02",
    name: "Architecture and interfaces approved",
    group: "Engineering Intent",
    state: "Closed",
    criteria: [
      { text: "Micro-architecture spec approved", met: true, evidence: "ARCH-DDMAC-3.2" },
      { text: "Interface contracts frozen", met: true, evidence: "IF-DDMAC-CTRL / IF-DDMAC-DATA" },
    ],
    evidence: [
      { id: "ARCH-DDMAC-3.2", type: "Specification", source: "Architecture", baseline: "ARCH 3.2", ts: "2026-07-08", status: "Current" },
    ],
    missing: [],
    dependencies: ["G01"],
    blockers: [],
    residualRisks: [],
    owner: "Arun Patel",
    approver: "Arun Patel",
    approvalState: "Approved",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Informational",
  },
  {
    id: "G03",
    name: "RTL baseline accepted",
    group: "Engineering Intent",
    state: "Closed",
    criteria: [
      { text: "Baseline hash matches candidate", met: true, evidence: "rtl_baseline_3.2.18_candidate" },
      { text: "Design review recorded", met: true, evidence: "DR-DDMAC-3.2-018" },
    ],
    evidence: [
      { id: "DR-DDMAC-3.2-018", type: "Design review", source: "RTL", baseline: "rtl 3.2.18", ts: "2026-07-19", status: "Current" },
    ],
    missing: [],
    dependencies: ["G02"],
    blockers: [],
    residualRisks: [],
    owner: "Maya Chen",
    approver: "Maya Chen",
    approvalState: "Approved with Condition",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Informational",
  },
  {
    id: "G04",
    name: "Static analysis dispositioned",
    group: "Verification Evidence",
    state: "Blocked",
    criteria: [
      { text: "Lint clean or waived", met: true, evidence: "static_run_2026.07.21.04" },
      { text: "CDC clean or waived", met: true, evidence: "WVR CDC 019" },
      { text: "RDC clean or waived", met: false, evidence: "RDC-000422 unresolved" },
    ],
    evidence: [
      { id: "static_run_2026.07.21.04", type: "Static run", source: "Lint/CDC/RDC", baseline: "rtl 3.2.18", ts: "2026-07-21 04:12", status: "Current" },
    ],
    missing: ["Synchronized reset deassertion evidence"],
    dependencies: ["G03"],
    blockers: ["BLK-003"],
    residualRisks: [],
    owner: "Aisha Rahman",
    approver: "Aisha Rahman",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Blocking",
  },
  {
    id: "G05",
    name: "Formal verification complete",
    group: "Verification Evidence",
    state: "Closed with Conditions",
    criteria: [
      { text: "All required properties resolved", met: true, evidence: "34 of 36 proven, 2 bounded" },
      { text: "Assumptions reviewed", met: true, evidence: "WVR FORMAL 006" },
    ],
    evidence: [
      { id: "formal_run_2026.07.21.09", type: "Formal run", source: "Formal", baseline: "rtl 3.2.18", ts: "2026-07-21 09:31", status: "Current" },
    ],
    missing: [],
    dependencies: ["G03", "G04"],
    blockers: [],
    residualRisks: ["RSK-001", "RSK-004"],
    owner: "Daniel Kim",
    approver: "Daniel Kim",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Conditional",
  },
  {
    id: "G06",
    name: "Simulation and regression complete",
    group: "Verification Evidence",
    state: "Closed",
    criteria: [
      { text: "Dependent regression passing", met: true, evidence: "REG-2026-07-21-0051" },
      { text: "Zero unexplained failures", met: true, evidence: "Triage complete" },
    ],
    evidence: [
      { id: "REG-2026-07-21-0051", type: "Regression", source: "Simulation", baseline: "dv 2.4", ts: "2026-07-21 06:44", status: "Current" },
    ],
    missing: [],
    dependencies: ["G03"],
    blockers: [],
    residualRisks: [],
    owner: "Sofia Rodriguez",
    approver: "Sofia Rodriguez",
    approvalState: "Approved",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Informational",
  },
  {
    id: "G07",
    name: "Coverage closure complete",
    group: "Verification Evidence",
    state: "Closed with Conditions",
    criteria: [
      { text: "Functional coverage ≥ 97%", met: true, evidence: "97.1%" },
      { text: "Gaps dispositioned", met: true, evidence: "WVR COV 014" },
    ],
    evidence: [
      { id: "COV-DDMAC-3.2-017", type: "Coverage snapshot", source: "Coverage", baseline: "dv 2.4", ts: "2026-07-21 05:12", status: "Current" },
    ],
    missing: [],
    dependencies: ["G06"],
    blockers: [],
    residualRisks: ["RSK-003"],
    owner: "Sofia Rodriguez",
    approver: "Sofia Rodriguez",
    approvalState: "Approved",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Conditional",
  },
  {
    id: "G08",
    name: "Checker trust established",
    group: "Verification Evidence",
    state: "Closed",
    criteria: [
      { text: "Scoreboard self-check verified", met: true, evidence: "CHK-TRUST-018" },
      { text: "Assertion density adequate", met: true, evidence: "412 SVA active" },
    ],
    evidence: [
      { id: "CHK-TRUST-018", type: "Trust report", source: "DV", baseline: "dv 2.4", ts: "2026-07-20", status: "Current" },
    ],
    missing: [],
    dependencies: ["G06"],
    blockers: [],
    residualRisks: ["RSK-002"],
    owner: "Sofia Rodriguez",
    approver: "Sofia Rodriguez",
    approvalState: "Approved",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Informational",
  },
  {
    id: "G09",
    name: "Material defects dispositioned",
    group: "Defect and Risk Control",
    state: "In Review",
    criteria: [
      { text: "All high-severity defects closed or accepted", met: false, evidence: "DEF-RTL-224 open" },
      { text: "Validation evidence attached to closures", met: true, evidence: "DEF-DV-219 validated" },
    ],
    evidence: [],
    missing: ["Closure evidence for DEF-RTL-224"],
    dependencies: ["G04", "G05"],
    blockers: ["BLK-003"],
    residualRisks: [],
    owner: "Maya Chen",
    approver: "Maya Chen",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Conditional",
  },
  {
    id: "G10",
    name: "Waivers approved",
    group: "Defect and Risk Control",
    state: "In Review",
    criteria: [
      { text: "All active waivers have current evidence", met: true, evidence: "8 active" },
      { text: "All waivers approved by authorized role", met: false, evidence: "2 pending" },
    ],
    evidence: [],
    missing: ["Final approval on WVR FORMAL 006, WVR COV 014"],
    dependencies: ["G05", "G07"],
    blockers: [],
    residualRisks: ["RSK-004"],
    owner: "Daniel Kim",
    approver: "Marcus Lee",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Conditional",
  },
  {
    id: "G11",
    name: "Residual risks accepted",
    group: "Defect and Risk Control",
    state: "In Review",
    criteria: [
      { text: "Every risk has an accountable owner", met: true, evidence: "6 of 6 owned" },
      { text: "Every risk explicitly accepted", met: false, evidence: "2 pending" },
    ],
    evidence: [],
    missing: ["Explicit acceptance on RSK-001, RSK-004"],
    dependencies: ["G09", "G10"],
    blockers: [],
    residualRisks: ["RSK-001", "RSK-002", "RSK-003", "RSK-004", "RSK-005", "RSK-006"],
    owner: "Marcus Lee",
    approver: "Marcus Lee",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Conditional",
  },
  {
    id: "G12",
    name: "Documentation synchronized",
    group: "Release Evidence",
    state: "Evidence Missing",
    criteria: [
      { text: "Register descriptions updated", met: false, evidence: "Draft" },
      { text: "Known limitations recorded", met: false, evidence: "Missing timing assumption" },
      { text: "Waiver appendix current", met: false, evidence: "Draft" },
    ],
    evidence: [
      { id: "TRM-DDMAC-3.2", type: "Technical reference", source: "Docs", baseline: "3.2 draft", ts: "2026-07-18", status: "Draft" },
    ],
    missing: ["Register description update", "Known limitation entry", "Waiver appendix", "Evidence manifest update"],
    dependencies: ["G03", "G10"],
    blockers: [],
    residualRisks: ["RSK-005"],
    owner: "Priya Shah",
    approver: "Marcus Lee",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Stale",
    impact: "Conditional",
  },
  {
    id: "G13",
    name: "Evidence package complete",
    group: "Release Evidence",
    state: "In Review",
    criteria: [
      { text: "All required artifacts attached", met: false, evidence: "94%" },
      { text: "Manifest signed", met: false, evidence: "Pending" },
    ],
    evidence: [],
    missing: ["Evidence manifest final signature"],
    dependencies: ["G04", "G05", "G06", "G07", "G09", "G10", "G12"],
    blockers: [],
    residualRisks: [],
    owner: "Marcus Lee",
    approver: "Marcus Lee",
    approvalState: "Pending",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Conditional",
  },
  {
    id: "G14",
    name: "Reproducibility demonstrated",
    group: "Release Evidence",
    state: "Closed",
    criteria: [
      { text: "All required runs reproduce", met: true, evidence: "12 of 12" },
      { text: "Tool and image hashes recorded", met: true, evidence: "REPRO-2026.07.21" },
    ],
    evidence: [
      { id: "REPRO-2026.07.21", type: "Reproducibility manifest", source: "Compute", baseline: "compute-img 4.9", ts: "2026-07-21", status: "Current" },
    ],
    missing: [],
    dependencies: ["G06"],
    blockers: [],
    residualRisks: ["RSK-006"],
    owner: "Marcus Lee",
    approver: "Marcus Lee",
    approvalState: "Approved",
    lastEval: "2026-07-21 14:02",
    baselineCompat: "Compatible",
    impact: "Informational",
  },
];

/* ---------- Evidence Reconciliation Matrix ---------- */

interface MatrixRow {
  id: string;
  requirement: string;
  arch: string;
  rtl: string;
  static_: string;
  formal: string;
  regression: string;
  coverage: string;
  defect: string;
  waiver: string;
  docs: string;
  approval: string;
  repro: string;
  gate: string;
  state: GateState;
}

const s = (v: string) => v;
const MATRIX: MatrixRow[] = [
  { id: "REQ-DDMAC-142", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G01", state: "Closed" },
  { id: "REQ-DDMAC-143", requirement: "Approved+CLR", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Conditional", regression: "Passed", coverage: "Exclusion", defect: "—", waiver: "WVR FORMAL 006", docs: "Updated", approval: "Pending FL", repro: "Yes", gate: "G05", state: "Closed with Conditions" },
  { id: "ARCH-RESET-017", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "RDC BLOCK", formal: "Pending", regression: "Targeted OK", coverage: "Closed", defect: "DEF-RTL-224", waiver: "—", docs: "Draft", approval: "Not complete", repro: "Yes", gate: "G04", state: "Blocked" },
  { id: "REQ-DDMAC-144", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G01", state: "Closed" },
  { id: "REQ-DDMAC-145", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "97.1%", defect: "—", waiver: "WVR COV 014", docs: "Sync", approval: "Pending", repro: "Yes", gate: "G07", state: "Closed with Conditions" },
  { id: "REQ-DDMAC-146", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "DEF-DV-219", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G09", state: "In Review" },
  { id: "REQ-DDMAC-147", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Draft", approval: "Pending", repro: "Yes", gate: "G12", state: "Evidence Missing" },
  { id: "REQ-DDMAC-148", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "—", waiver: "WVR LINT 023", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G10", state: "In Review" },
  { id: "REQ-DDMAC-149", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G06", state: "Closed" },
  { id: "REQ-DDMAC-150", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "CDC waived", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "—", waiver: "WVR CDC 019", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G04", state: "Blocked" },
  { id: "REQ-DDMAC-151", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Bounded", regression: "Passed", coverage: "Closed", defect: "—", waiver: "WVR FORMAL 006", docs: "Sync", approval: "Pending", repro: "Yes", gate: "G05", state: "Closed with Conditions" },
  { id: "REQ-DDMAC-152", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "DEF-TB-087", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G09", state: "In Review" },
  { id: "REQ-DDMAC-153", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G14", state: "Closed" },
  { id: "REQ-DDMAC-154", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G08", state: "Closed" },
  { id: "REQ-DDMAC-155", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "DEF-DOC-042", waiver: "—", docs: "Draft", approval: "Pending", repro: "Yes", gate: "G12", state: "Evidence Missing" },
  { id: "REQ-DDMAC-156", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G02", state: "Closed" },
  { id: "REQ-DDMAC-157", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G03", state: "Closed" },
  { id: "REQ-DDMAC-158", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G06", state: "Closed" },
  { id: "REQ-DDMAC-159", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G07", state: "Closed with Conditions" },
  { id: "REQ-DDMAC-160", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G13", state: "In Review" },
  { id: "REQ-DDMAC-161", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G11", state: "In Review" },
  { id: "REQ-DDMAC-162", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G08", state: "Closed" },
  { id: "REQ-DDMAC-163", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G01", state: "Closed" },
  { id: "REQ-DDMAC-164", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G02", state: "Closed" },
  { id: "REQ-DDMAC-165", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G14", state: "Closed" },
  { id: "REQ-DDMAC-166", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G06", state: "Closed" },
  { id: "REQ-DDMAC-167", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G03", state: "Closed" },
  { id: "REQ-DDMAC-168", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G07", state: "Closed with Conditions" },
  { id: "REQ-DDMAC-169", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G05", state: "Closed with Conditions" },
  { id: "REQ-DDMAC-170", requirement: "Approved", arch: "Aligned", rtl: "Implemented", static_: "Clean", formal: "Proven", regression: "Passed", coverage: "Closed", defect: "Closed", waiver: "—", docs: "Sync", approval: "Complete", repro: "Yes", gate: "G13", state: "In Review" },
];
void s;

/* ---------- Defects, Risks, Waivers, Approvals ---------- */

const DEFECTS = [
  { id: "DEF-RTL-224", severity: "High", state: "Open", impact: "Blocking", cause: "Missing synchronized reset deassertion on ddmac_core_clk", correction: "Insert 2-flop reset synchronizer with staged deassertion", validation: "RDC rerun, formal reset property, targeted regression", owner: "Maya Chen" },
  { id: "DEF-DV-219", severity: "High", state: "Validated, closure pending", impact: "Conditional", cause: "Scoreboard ordering ambiguity under back-pressure", correction: "Tightened ordering assertion + scoreboard refactor", validation: "10k-seed regression, dedicated stimulus set", owner: "Sofia Rodriguez" },
  { id: "DEF-DOC-042", severity: "Medium", state: "Open", impact: "Documentation", cause: "Register field encoding not documented in TRM", correction: "Update TRM section 4.7", validation: "Doc review", owner: "Priya Shah" },
  { id: "DEF-TB-087", severity: "Medium", state: "Accepted risk", impact: "Conditional", cause: "Testbench limitation for rare arbitration corner", correction: "Documented limitation; formal coverage substituted", validation: "Formal property + waiver", owner: "Sofia Rodriguez" },
];

const RISKS = [
  { id: "RSK-001", desc: "Error-response timing interpretation", likelihood: "Low", impact: "Medium", mitigation: "Bounded formal proof + monitor", owner: "Daniel Kim", approver: "Marcus Lee", expiration: "2026-09-30", state: "Pending" },
  { id: "RSK-002", desc: "Intermittent scoreboard ordering behavior", likelihood: "Low", impact: "Low", mitigation: "10k-seed regression clean", owner: "Sofia Rodriguez", approver: "Marcus Lee", expiration: "2026-09-30", state: "Accepted" },
  { id: "RSK-003", desc: "Approved functional-coverage exclusion (privilege-reset cross)", likelihood: "Very Low", impact: "Low", mitigation: "Unreachable proven by formal", owner: "Sofia Rodriguez", approver: "Marcus Lee", expiration: "2026-12-31", state: "Accepted" },
  { id: "RSK-004", desc: "Limited formal abstraction on FIFO", likelihood: "Low", impact: "Medium", mitigation: "Regression coverage substitutes", owner: "Daniel Kim", approver: "Marcus Lee", expiration: "2026-09-30", state: "Pending" },
  { id: "RSK-005", desc: "Documentation update pending", likelihood: "Certain", impact: "Low", mitigation: "Owner assigned, due 2026-07-24", owner: "Priya Shah", approver: "Marcus Lee", expiration: "2026-07-24", state: "In Progress" },
  { id: "RSK-006", desc: "Compute reproducibility dependency on image 4.9", likelihood: "Low", impact: "Low", mitigation: "Image pinned in manifest", owner: "Marcus Lee", approver: "Marcus Lee", expiration: "2026-12-31", state: "Accepted" },
];

const WAIVERS = [
  { id: "WVR FORMAL 006", type: "Formal", rule: "Latency assumption bounded", scope: "ddmac_error_path", rationale: "Upper bound proven; unbounded case unreachable via constraint", owner: "Daniel Kim", approver: "Marcus Lee", expiration: "2026-09-30", state: "Pending", warning: null as string | null },
  { id: "WVR COV 014", type: "Coverage", rule: "Unreachable privilege-reset cross", scope: "cov_priv_reset_x", rationale: "Formal proves cross unreachable", owner: "Sofia Rodriguez", approver: "Marcus Lee", expiration: "2026-12-31", state: "Pending", warning: null },
  { id: "WVR LINT 023", type: "Lint", rule: "Reserved debug signal unused", scope: "ddmac_dbg_dft", rationale: "Debug hook reserved for DFT", owner: "Aisha Rahman", approver: "Aisha Rahman", expiration: "2026-12-31", state: "Approved", warning: null },
  { id: "WVR CDC 019", type: "CDC", rule: "Static configuration crossing", scope: "cfg_mode[3:0]", rationale: "Configured before enable; captured by handshake", owner: "Aisha Rahman", approver: "Aisha Rahman", expiration: "2026-12-31", state: "Approved", warning: null },
  { id: "WVR LINT 041", type: "Lint", rule: "Non-blocking assignment in test hook", scope: "ddmac_tb_hook", rationale: "Test-only path", owner: "Aisha Rahman", approver: "Aisha Rahman", expiration: "2026-12-31", state: "Approved", warning: "Scope broader than rationale" },
  { id: "WVR CDC 021", type: "CDC", rule: "Reset synchronizer exception", scope: "ddmac_core_clk", rationale: "Pending resolution of BLK-003", owner: "Aisha Rahman", approver: "Aisha Rahman", expiration: "2026-07-24", state: "Pending", warning: "Missing evidence" },
  { id: "WVR RDC 004", type: "RDC", rule: "Manual review", scope: "ddmac_descriptor_validator", rationale: "Blocked by BLK-003", owner: "Aisha Rahman", approver: "Aisha Rahman", expiration: "2026-07-24", state: "Pending", warning: "Reused waiver from prior revision" },
  { id: "WVR COV 022", type: "Coverage", rule: "Debug bin exclusion", scope: "cov_dbg_bins", rationale: "Debug hooks not in mission mode", owner: "Sofia Rodriguez", approver: "Sofia Rodriguez", expiration: "2026-12-31", state: "Approved", warning: null },
];

const APPROVALS = [
  { role: "RTL Design Lead", owner: "Maya Chen", responsibility: "RTL baseline and defects", state: "Approved with condition" },
  { role: "Verification Lead", owner: "Sofia Rodriguez", responsibility: "Regression and coverage", state: "Approved" },
  { role: "Formal Lead", owner: "Daniel Kim", responsibility: "Formal closure", state: "Pending" },
  { role: "Static Analysis Lead", owner: "Aisha Rahman", responsibility: "Static disposition", state: "Pending" },
  { role: "IP Architect", owner: "Arun Patel", responsibility: "Requirement and architecture alignment", state: "Approved" },
  { role: "Security Engineer", owner: "Priya Shah", responsibility: "Security verification and residual risk", state: "Approved" },
  { role: "Release Authority", owner: "Marcus Lee", responsibility: "Package and advancement decision", state: "Pending" },
];

const DOCS = [
  { name: "Functional specification", version: "3.2.1", state: "Sync", missing: null as string | null },
  { name: "Verification plan", version: "3.2.0", state: "Sync", missing: null },
  { name: "Test plan", version: "3.2.0", state: "Sync", missing: null },
  { name: "DV report", version: "3.2.RC2", state: "Sync", missing: null },
  { name: "Technical reference manual", version: "3.2.RC1", state: "Draft", missing: "Register descriptions" },
  { name: "Register descriptions", version: "3.2.RC1", state: "Draft", missing: "Final field encoding update" },
  { name: "Interface documentation", version: "3.2.0", state: "Sync", missing: null },
  { name: "Known limitations", version: "3.2.RC1", state: "Draft", missing: "Timing assumption entry" },
  { name: "Waiver register", version: "3.2.RC2", state: "Draft", missing: "Final appendix" },
  { name: "Coverage report", version: "3.2.017", state: "Sync", missing: null },
  { name: "Formal report", version: "3.2.09", state: "Sync", missing: null },
  { name: "Static report", version: "2026.07.21.04", state: "Sync", missing: null },
  { name: "Regression manifest", version: "REG-2026-07-21-0051", state: "Sync", missing: null },
  { name: "Release notes", version: "3.2.RC2", state: "Draft", missing: null },
  { name: "Evidence manifest", version: "3.2.RC2", state: "Draft", missing: "Final signature" },
];

const REPRO = [
  { key: "RTL hash", value: "9a72c4f18b0e3d5f" },
  { key: "DV environment hash", value: "d18e37b5c40affe1" },
  { key: "Test/seed manifest", value: "REG-2026-07-21-0051" },
  { key: "Simulator", value: "sim-vendor 2026.06 SP2" },
  { key: "Formal tool profile", value: "formal-profile-ddmac-3.2" },
  { key: "Static rule deck", value: "rules-2026.07.21.04" },
  { key: "Constraints", value: "sdc-ddmac-3.2 (front-end)" },
  { key: "Build scripts", value: "build-manifest@3.2.18" },
  { key: "Environment variables", value: "env-lock 3.2.RC2" },
  { key: "Compute image", value: "compute-img 4.9" },
  { key: "Artifact locations", value: "s3://avep-artifacts/ddmac/3.2.18" },
  { key: "Result hashes", value: "37 recorded / 37 verified" },
];

/* ---------- Small helpers ---------- */

const stateColor: Record<GateState, string> = {
  "Closed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed with Conditions": "bg-amber-50 text-amber-700 border-amber-200",
  "Blocked": "bg-rose-50 text-rose-700 border-rose-200",
  "In Review": "bg-sky-50 text-sky-700 border-sky-200",
  "Evidence Missing": "bg-orange-50 text-orange-700 border-orange-200",
  "Waiver Required": "bg-amber-50 text-amber-700 border-amber-200",
  "Not Started": "bg-neutral-50 text-neutral-600 border-neutral-200",
  "Stale": "bg-amber-50 text-amber-700 border-amber-200",
  "Not Applicable": "bg-neutral-50 text-neutral-500 border-neutral-200",
};

const recColor: Record<Recommendation, string> = {
  "Go": "bg-emerald-600 text-white",
  "Conditional Go": "bg-amber-500 text-white",
  "Hold": "bg-rose-600 text-white",
};

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>;
}

function Section({ title, subtitle, icon: Icon, right, children }: { title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-3">
        <div className="flex items-start gap-3">
          {Icon && <Icon className="mt-0.5 h-4 w-4 text-neutral-500" />}
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>
        {right}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ================================================================== */
/*                             MAIN PAGE                              */
/* ================================================================== */

export default function SignoffReadiness() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [gateTab, setGateTab] = useState<"summary" | "criteria" | "evidence" | "blockers" | "risks" | "waivers" | "deps" | "approvals" | "audit">("summary");
  const [filter, setFilter] = useState<string>("");
  const [walkStep, setWalkStep] = useState(0);
  const [walkOpen, setWalkOpen] = useState(false);

  const meta = SCENARIO_META[scenario];

  const gates = useMemo<Gate[]>(() => {
    if (scenario === "T2") return GATES_T2;
    if (scenario === "T0" || scenario === "T3") {
      return GATES_T2.map((g) => ({ ...g, state: "Closed", missing: [], blockers: [], approvalState: "Approved" as const, impact: "Informational" as const }));
    }
    // T1
    return GATES_T2.map((g, i) => {
      if (i < 6) return { ...g, state: "Blocked" as GateState, impact: "Blocking" as const };
      if (i < 10) return { ...g, state: "Evidence Missing" as GateState, impact: "Conditional" as const };
      return { ...g, state: "Stale" as GateState };
    });
  }, [scenario]);

  const grouped = useMemo(() => {
    const g: Record<string, Gate[]> = {};
    for (const gt of gates) (g[gt.group] ||= []).push(gt);
    return g;
  }, [gates]);

  const filteredMatrix = useMemo(() => {
    if (!filter) return MATRIX;
    const q = filter.toLowerCase();
    return MATRIX.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [filter]);

  const walkSteps = [
    "Review the controlled baselines in the context strip",
    "Inspect the 14-gate readiness model",
    "Open the blocking static-analysis gate G04",
    "Review formal (G05) and coverage (G07) conditional items",
    "Inspect material defects and their validation evidence",
    "Review pending waivers and residual risks",
    "Confirm documentation synchronization gaps",
    "Confirm reproducibility manifest",
    "Trace evidence to the current recommendation",
    "Compare Go, Conditional Go, and Hold rules",
    "Show accountable human approval requirements",
    "Note the physical-design intake boundary",
  ];

  return (
    <div className="min-h-full bg-neutral-50/60">
      {/* Context strip */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-[11px] font-medium text-neutral-600">
          <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Program <span className="ml-1 font-mono text-neutral-900">StrataShield SoC</span></span>
          <span>IP <span className="font-mono text-neutral-900">DDMAC 3.2</span></span>
          <span>RTL <span className="font-mono text-neutral-900">rtl_baseline_3.2.18_candidate</span></span>
          <span>DV <span className="font-mono text-neutral-900">dv_env_2.4_candidate</span></span>
          <span>Static <span className="font-mono text-neutral-900">static_run_2026.07.21.04</span></span>
          <span>Formal <span className="font-mono text-neutral-900">formal_run_2026.07.21.09</span></span>
          <span>Regression <span className="font-mono text-neutral-900">REG-2026-07-21-0051</span></span>
          <span>Coverage <span className="font-mono text-neutral-900">COV-DDMAC-3.2-017</span></span>
          <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> Milestone <span className="font-mono text-neutral-900">M6 Front-End Signoff Review</span></span>
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Role <span className="font-mono text-neutral-900">Signoff Review Chair</span></span>
          <span className="ml-auto flex items-center gap-2">
            <label className="text-neutral-500">Scenario</label>
            <select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)} className="rounded-md border border-neutral-200 bg-white px-2 py-1 font-mono text-[11px]">
              {(Object.keys(SCENARIO_META) as Scenario[]).map((k) => <option key={k} value={k}>{SCENARIO_META[k].label}</option>)}
            </select>
            <button onClick={() => { setWalkOpen(true); setWalkStep(0); }} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50"><Play className="h-3 w-3" /> Start walkthrough</button>
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">AVEP.P3.READINESS.002 · Phase 3 · Determine Signoff Readiness</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">Signoff Readiness &amp; Engineering Evidence</h1>
            <p className="mt-1 text-sm text-neutral-600">Reconcile engineering evidence, expose blockers and residual risks, and explain the exact basis for a Go, Conditional Go, or Hold recommendation.</p>
            <p className="mt-2 text-xs text-neutral-500 max-w-2xl">Front-end readiness only. This workspace does not authorize floorplanning, timing signoff, DRC/LVS, GDS, tapeout, fabrication, packaging, or silicon validation.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`rounded-lg px-4 py-3 ${recColor[meta.recommendation]}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Current recommendation</div>
              <div className="text-lg font-semibold">{meta.recommendation}</div>
              <div className="text-[11px] opacity-90">Human approval required</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-5">
        {[
          { l: "Requirements closure", v: "98.9%", d: "184 of 186 approved" },
          { l: "Regression readiness", v: "97.4%", d: "Dependent regression clean" },
          { l: "Formal closure", v: "96.8%", d: "34/36 properties resolved" },
          { l: "Static readiness", v: "Conditional", d: "1 blocking RDC" },
          { l: "Coverage closure", v: "97.1%", d: "Gaps dispositioned" },
          { l: "Material defects", v: "3", d: "1 high, 2 medium" },
          { l: "Waivers", v: "8", d: "2 pending final approval" },
          { l: "Evidence completeness", v: `${meta.evidencePct}%`, d: "4 artifacts missing" },
          { l: "Reproducibility", v: "100%", d: "Required runs reproducible" },
          { l: "Recommendation", v: meta.recommendation, d: `Closed ${meta.closed}/14` },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-[11px] font-medium text-neutral-500">{k.l}</div>
            <div className="mt-1 text-xl font-semibold text-neutral-900">{k.v}</div>
            <div className="text-[11px] text-neutral-500">{k.d}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 pb-24 xl:grid-cols-3">
        {/* Left column: Gates + dependencies */}
        <div className="space-y-4 xl:col-span-2">
          {/* Readiness Gate Model */}
          <Section
            title="Engineering Readiness Gate Model"
            subtitle="14 gates in 4 groups · select a gate for full evidence"
            icon={ShieldCheck}
            right={<Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">Closed {meta.closed} · Blocking {meta.blocking} · Conditional {meta.conditional}</Pill>}
          >
            <div className="space-y-4">
              {(["Engineering Intent", "Verification Evidence", "Defect and Risk Control", "Release Evidence"] as const).map((grp) => (
                <div key={grp}>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{grp}</div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {(grouped[grp] || []).map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setSelectedGate(g); setGateTab("summary"); }}
                        className="group flex items-start justify-between gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-left transition hover:border-neutral-300 hover:shadow-sm"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-neutral-500">{g.id}</span>
                            <span className="truncate text-sm font-medium text-neutral-900">{g.name}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Pill className={stateColor[g.state]}>{g.state}</Pill>
                            {g.blockers.length > 0 && <Pill className="border-rose-200 bg-rose-50 text-rose-700"><AlertTriangle className="h-3 w-3" /> {g.blockers.length} blocker</Pill>}
                            {g.missing.length > 0 && <Pill className="border-orange-200 bg-orange-50 text-orange-700">{g.missing.length} missing</Pill>}
                            {g.residualRisks.length > 0 && <Pill className="border-amber-200 bg-amber-50 text-amber-700">{g.residualRisks.length} risk</Pill>}
                          </div>
                          <div className="mt-1 text-[11px] text-neutral-500">Owner <span className="font-medium text-neutral-700">{g.owner}</span> · Approver {g.approver}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-300 group-hover:text-neutral-500" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Dependency Graph */}
          <Section title="Gate Dependency View" subtitle="Evidence chain from requirement to recommendation" icon={GitBranch}>
            <DependencyGraph />
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 md:grid-cols-4">
              <div><span className="font-mono">REQ-DDMAC-143</span> → PROP-ERROR-TIMING-023</div>
              <div>→ FORMAL RUN 2026.07.21.09</div>
              <div>→ WVR FORMAL 006 (residual risk)</div>
              <div>→ Formal Lead approval → Gate G05</div>
            </div>
          </Section>

          {/* Evidence Reconciliation Matrix */}
          <Section
            title="Evidence Reconciliation Matrix"
            subtitle={`${filteredMatrix.length} obligations across 13 evidence domains`}
            icon={Layers}
            right={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs">
                  <Search className="h-3 w-3 text-neutral-400" />
                  <input placeholder="Filter…" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40 bg-transparent outline-none" />
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr>
                    {["ID", "Req", "Arch", "RTL", "Static", "Formal", "Regr.", "Coverage", "Defect", "Waiver", "Docs", "Approval", "Repro", "Gate", "State"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((r) => (
                    <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                      <td className="px-2 py-1.5 font-mono text-neutral-800">{r.id}</td>
                      <td className="px-2 py-1.5">{r.requirement}</td>
                      <td className="px-2 py-1.5">{r.arch}</td>
                      <td className="px-2 py-1.5">{r.rtl}</td>
                      <td className={`px-2 py-1.5 ${r.static_.includes("BLOCK") ? "text-rose-700 font-medium" : ""}`}>{r.static_}</td>
                      <td className={`px-2 py-1.5 ${r.formal === "Conditional" || r.formal === "Bounded" ? "text-amber-700" : ""}`}>{r.formal}</td>
                      <td className="px-2 py-1.5">{r.regression}</td>
                      <td className="px-2 py-1.5">{r.coverage}</td>
                      <td className={`px-2 py-1.5 ${r.defect.startsWith("DEF") ? "text-rose-700" : ""}`}>{r.defect}</td>
                      <td className="px-2 py-1.5 font-mono">{r.waiver}</td>
                      <td className={`px-2 py-1.5 ${r.docs === "Draft" ? "text-orange-700" : ""}`}>{r.docs}</td>
                      <td className={`px-2 py-1.5 ${r.approval.includes("Pending") || r.approval.includes("Not") ? "text-amber-700" : ""}`}>{r.approval}</td>
                      <td className="px-2 py-1.5">{r.repro}</td>
                      <td className="px-2 py-1.5 font-mono text-neutral-500">{r.gate}</td>
                      <td className="px-2 py-1.5"><Pill className={stateColor[r.state]}>{r.state}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Blocker */}
          <Section title="Blocker Management" subtitle="1 blocking issue · authorized resolution required" icon={AlertTriangle}>
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-rose-700">BLK-003</div>
                  <div className="text-sm font-semibold text-neutral-900">Reset Deassertion Crossing</div>
                </div>
                <Pill className="border-rose-300 bg-white text-rose-700">Blocking · Escalated</Pill>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] md:grid-cols-4">
                <div><dt className="text-neutral-500">Gate</dt><dd className="font-medium">G04 Static Analysis</dd></div>
                <div><dt className="text-neutral-500">Module</dt><dd className="font-mono">ddmac_descriptor_validator</dd></div>
                <div><dt className="text-neutral-500">Clock domain</dt><dd className="font-mono">ddmac_core_clk</dd></div>
                <div><dt className="text-neutral-500">Finding</dt><dd className="font-mono">RDC-000422</dd></div>
                <div><dt className="text-neutral-500">Defect</dt><dd className="font-mono">DEF-RTL-224</dd></div>
                <div><dt className="text-neutral-500">Owner</dt><dd>Maya Chen</dd></div>
                <div><dt className="text-neutral-500">Due</dt><dd>2026-07-24</dd></div>
                <div><dt className="text-neutral-500">Escalation</dt><dd className="text-rose-700">Active</dd></div>
              </dl>
              <div className="mt-3 text-[11px] text-neutral-700">
                <div><span className="font-medium">Required action</span> — Implement approved synchronized deassertion structure</div>
                <div><span className="font-medium">Required validation</span> — RDC rerun · reset formal property · targeted regression</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Assign owner", "Add evidence", "Request clarification", "Link defect", "Add remediation", "Add validation plan", "Mark ready for review"].map((a) => (
                  <button key={a} className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] hover:bg-neutral-50">{a}</button>
                ))}
                <button className="rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1 text-[11px] text-neutral-400" disabled>Confirm resolution (authorized role)</button>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500 italic">Note: this blocker cannot be resolved based only on an AI recommendation.</p>
            </div>
          </Section>

          {/* Defects */}
          <Section title="Defect Readiness Panel" subtitle="Material defects with readiness impact" icon={CircleDot}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr><th className="px-2 py-2">Defect</th><th className="px-2 py-2">Severity</th><th className="px-2 py-2">State</th><th className="px-2 py-2">Impact</th><th className="px-2 py-2">Root cause</th><th className="px-2 py-2">Correction</th><th className="px-2 py-2">Validation</th><th className="px-2 py-2">Owner</th></tr>
                </thead>
                <tbody>
                  {DEFECTS.map((d) => (
                    <tr key={d.id} className="border-t border-neutral-100">
                      <td className="px-2 py-1.5 font-mono">{d.id}</td>
                      <td className="px-2 py-1.5">{d.severity}</td>
                      <td className="px-2 py-1.5">{d.state}</td>
                      <td className={`px-2 py-1.5 ${d.impact === "Blocking" ? "text-rose-700 font-medium" : ""}`}>{d.impact}</td>
                      <td className="px-2 py-1.5 max-w-xs">{d.cause}</td>
                      <td className="px-2 py-1.5 max-w-xs">{d.correction}</td>
                      <td className="px-2 py-1.5 max-w-xs">{d.validation}</td>
                      <td className="px-2 py-1.5">{d.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-neutral-500 italic">A “fix implemented” state does not equal a closed defect. Validation evidence must be attached separately.</p>
          </Section>

          {/* Waivers */}
          <Section title="Waiver Governance" subtitle="8 active waivers · AI may recommend, only authorized humans approve" icon={Lock}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr><th className="px-2 py-2">ID</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Rule</th><th className="px-2 py-2">Scope</th><th className="px-2 py-2">Rationale</th><th className="px-2 py-2">Owner</th><th className="px-2 py-2">Approver</th><th className="px-2 py-2">Expires</th><th className="px-2 py-2">State</th><th className="px-2 py-2">Warning</th></tr>
                </thead>
                <tbody>
                  {WAIVERS.map((w) => (
                    <tr key={w.id} className="border-t border-neutral-100">
                      <td className="px-2 py-1.5 font-mono">{w.id}</td>
                      <td className="px-2 py-1.5">{w.type}</td>
                      <td className="px-2 py-1.5">{w.rule}</td>
                      <td className="px-2 py-1.5 font-mono text-neutral-600">{w.scope}</td>
                      <td className="px-2 py-1.5 max-w-xs">{w.rationale}</td>
                      <td className="px-2 py-1.5">{w.owner}</td>
                      <td className="px-2 py-1.5">{w.approver}</td>
                      <td className="px-2 py-1.5">{w.expiration}</td>
                      <td className="px-2 py-1.5"><Pill className={w.state === "Approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{w.state}</Pill></td>
                      <td className="px-2 py-1.5 text-amber-700">{w.warning || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Docs */}
          <Section title="Documentation &amp; Package Evidence" subtitle="Synchronization of release artifacts" icon={FileText}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr><th className="px-2 py-2">Artifact</th><th className="px-2 py-2">Version</th><th className="px-2 py-2">State</th><th className="px-2 py-2">Missing content</th></tr>
                </thead>
                <tbody>
                  {DOCS.map((d) => (
                    <tr key={d.name} className="border-t border-neutral-100">
                      <td className="px-2 py-1.5">{d.name}</td>
                      <td className="px-2 py-1.5 font-mono">{d.version}</td>
                      <td className="px-2 py-1.5"><Pill className={d.state === "Sync" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-orange-200 bg-orange-50 text-orange-700"}>{d.state}</Pill></td>
                      <td className="px-2 py-1.5 text-orange-700">{d.missing || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Reproducibility */}
          <Section title="Reproducibility Model" subtitle="Reproducibility: Demonstrated" icon={Fingerprint}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {REPRO.map((r) => (
                <div key={r.key} className="flex items-start justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-[11px]">
                  <span className="text-neutral-500">{r.key}</span>
                  <span className="font-mono text-neutral-900">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {["Compare manifests", "Detect mismatched tools", "Detect stale constraints", "Validate artifact completeness", "Simulate rerun request", "Export reproducibility manifest"].map((a) => (
                <button key={a} className="rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50">{a}</button>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column: Recommendation, risks, approvals */}
        <div className="space-y-4 xl:col-span-1">
          {/* Recommendation Engine */}
          <Section title="Recommendation Engine" subtitle="Derived from visible engineering rules" icon={BadgeCheck}>
            <div className={`rounded-lg p-4 ${recColor[meta.recommendation]}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Current recommendation</div>
              <div className="mt-1 text-xl font-semibold">{meta.recommendation}</div>
              <p className="mt-2 text-[11px] opacity-90">Advance the validated front-end design package into physical-design intake after listed conditions are completed. Not authorized: floorplanning, placement, CTS, routing, physical timing signoff, DRC/LVS, GDS, tapeout, fabrication, packaging, silicon validation.</p>
            </div>
            <div className="mt-3 space-y-3 text-[11px]">
              <div>
                <div className="mb-1 font-semibold text-neutral-700">Closed evidence</div>
                <ul className="space-y-0.5 text-neutral-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Requirements closure complete</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> RTL baseline reviewed</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Dependent regression complete</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Checker validation complete</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Reproducibility confirmed</li>
                </ul>
              </div>
              <div>
                <div className="mb-1 font-semibold text-neutral-700">Blocking condition</div>
                <ul className="text-neutral-600"><li className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-rose-600" /> Reset deassertion path in one clock domain</li></ul>
              </div>
              <div>
                <div className="mb-1 font-semibold text-neutral-700">Conditional items</div>
                <ul className="space-y-0.5 text-neutral-600">
                  <li className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-amber-600" /> Two formal properties on bounded assumptions</li>
                  <li className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-amber-600" /> Documentation missing register/limitation updates</li>
                </ul>
              </div>
              <div>
                <div className="mb-1 font-semibold text-neutral-700">Residual risks</div>
                <ul className="text-neutral-600">
                  <li>· Error-response timing interpretation</li>
                  <li>· Intermittent checker condition</li>
                  <li>· Two exclusions with expirations</li>
                </ul>
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                <div className="font-semibold text-neutral-700">Rule applied</div>
                <p className="text-neutral-600">Conditional Go — no unresolved issue invalidates front-end functionality; remaining conditions are bounded, owned, and dated.</p>
              </div>
            </div>
          </Section>

          {/* Decision rules */}
          <Section title="Decision Rules" icon={Info}>
            <div className="space-y-3 text-[11px]">
              <div><div className="font-semibold text-emerald-700">Go</div><p className="text-neutral-600">No blocking gates · evidence current · defects closed or accepted · waivers approved · risks owned · approvals complete · docs sync · reproducibility demonstrated.</p></div>
              <div><div className="font-semibold text-amber-700">Conditional Go</div><p className="text-neutral-600">No issue invalidates front-end functionality; conditions are bounded, owned, and dated; residual risks explicitly accepted; physical-design intake may begin without misrepresenting readiness.</p></div>
              <div><div className="font-semibold text-rose-700">Hold</div><p className="text-neutral-600">Blocking engineering issue · critical evidence missing/stale · defects lack disposition · waivers unapproved · reproducibility fails · required approvals absent.</p></div>
            </div>
          </Section>

          {/* Residual Risk Register */}
          <Section title="Residual Risk Register" icon={AlertTriangle}>
            <ul className="space-y-2 text-[11px]">
              {RISKS.map((r) => (
                <li key={r.id} className="rounded-md border border-neutral-200 bg-white p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-neutral-700">{r.id}</span>
                    <Pill className={r.state === "Accepted" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{r.state}</Pill>
                  </div>
                  <div className="mt-1 text-neutral-800">{r.desc}</div>
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-neutral-500">
                    <span>Likelihood <span className="text-neutral-800">{r.likelihood}</span></span>
                    <span>Impact <span className="text-neutral-800">{r.impact}</span></span>
                    <span>Owner <span className="text-neutral-800">{r.owner}</span></span>
                    <span>Expires <span className="text-neutral-800">{r.expiration}</span></span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Approvals */}
          <Section title="Approval Checklist" subtitle="Required engineering authorities" icon={User}>
            <ul className="space-y-1.5 text-[11px]">
              {APPROVALS.map((a) => (
                <li key={a.role} className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5">
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-900">{a.role}</div>
                    <div className="truncate text-neutral-500">{a.owner} · {a.responsibility}</div>
                  </div>
                  <Pill className={a.state === "Approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : a.state.startsWith("Approved") ? "border-amber-200 bg-amber-50 text-amber-700" : "border-neutral-200 bg-neutral-50 text-neutral-600"}>{a.state}</Pill>
                </li>
              ))}
            </ul>
          </Section>

          {/* Human Decision Workspace */}
          <Section title="Human Decision Workspace" subtitle="AI is not the signoff authority" icon={Lock}>
            <div className="space-y-2">
              {[
                { rec: "Go", desc: "All required gates closed, evidence complete, residual risk accepted, approvals complete.", enabled: false },
                { rec: "Conditional Go", desc: "Front-end package may advance with bounded, owned, time-limited conditions. Does not authorize tapeout.", enabled: true },
                { rec: "Hold", desc: "One or more blocking conditions prevent advancement.", enabled: true },
              ].map((c) => (
                <div key={c.rec} className={`rounded-lg border p-3 ${c.rec === meta.recommendation ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-neutral-900">{c.rec}</div>
                    {c.rec === meta.recommendation && <Pill className="border-neutral-300 bg-white text-neutral-700">AI recommendation</Pill>}
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-600">{c.desc}</p>
                </div>
              ))}
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                “You are authorizing the validated front-end design package to advance into physical-design intake subject to the listed conditions. This decision does not authorize tapeout, fabrication, packaging, or physical silicon release.”
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Persistent Decision Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${recColor[meta.recommendation]}`}>{meta.recommendation}</span>
            <span className="text-neutral-500">Closed <b className="text-neutral-900">{meta.closed}/14</b></span>
            <span className="text-neutral-500">Blocking <b className="text-neutral-900">{meta.blocking}</b></span>
            <span className="text-neutral-500">Conditional <b className="text-neutral-900">{meta.conditional}</b></span>
            <span className="text-neutral-500">Evidence <b className="text-neutral-900">{meta.evidencePct}%</b></span>
            <span className="text-neutral-500">Defects <b className="text-neutral-900">3</b></span>
            <span className="text-neutral-500">Approvals <b className="text-neutral-900">4/7</b></span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {["Request Evidence", "Review Blockers", "Review Waivers", "Accept Residual Risk"].map((a) => (
              <button key={a} className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 hover:bg-neutral-50">{a}</button>
            ))}
            <button className="rounded-md bg-amber-500 px-2.5 py-1.5 font-medium text-white hover:bg-amber-600">Approve Conditional Go</button>
            <button className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 text-neutral-400" disabled>Approve Go</button>
            <button className="rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-rose-700 hover:bg-rose-50">Place on Hold</button>
            <button className="inline-flex items-center gap-1 rounded-md border border-neutral-900 bg-neutral-900 px-2.5 py-1.5 text-white hover:bg-neutral-800"><Download className="h-3 w-3" /> Export Signoff Package</button>
          </div>
        </div>
      </div>

      {/* Gate detail drawer */}
      {selectedGate && (
        <div className="fixed inset-0 z-40 flex" role="dialog">
          <div className="flex-1 bg-neutral-900/30" onClick={() => setSelectedGate(null)} />
          <div className="w-full max-w-2xl overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
              <div>
                <div className="font-mono text-[11px] text-neutral-500">{selectedGate.id} · {selectedGate.group}</div>
                <h3 className="text-lg font-semibold text-neutral-900">{selectedGate.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Pill className={stateColor[selectedGate.state]}>{selectedGate.state}</Pill>
                  <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">Owner {selectedGate.owner}</Pill>
                  <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">Approver {selectedGate.approver}</Pill>
                  <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">Baseline {selectedGate.baselineCompat}</Pill>
                </div>
              </div>
              <button onClick={() => setSelectedGate(null)} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-1 border-b border-neutral-200 px-3 pt-2 text-[11px]">
              {(["summary", "criteria", "evidence", "blockers", "risks", "waivers", "deps", "approvals", "audit"] as const).map((t) => (
                <button key={t} onClick={() => setGateTab(t)} className={`rounded-t-md px-2.5 py-1.5 capitalize ${gateTab === t ? "border border-b-white bg-white font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-800"}`}>{t}</button>
              ))}
            </div>
            <div className="px-5 py-4 text-[12px] text-neutral-800">
              {gateTab === "summary" && (
                <div className="grid grid-cols-2 gap-3">
                  <Kv k="Readiness impact" v={selectedGate.impact} />
                  <Kv k="Approval state" v={selectedGate.approvalState} />
                  <Kv k="Evidence completeness" v={selectedGate.missing.length === 0 ? "100%" : `${Math.max(50, 100 - selectedGate.missing.length * 12)}%`} />
                  <Kv k="Baseline compatibility" v={selectedGate.baselineCompat} />
                  <Kv k="Last evaluation" v={selectedGate.lastEval} />
                  <Kv k="Dependencies" v={selectedGate.dependencies.join(", ") || "—"} />
                </div>
              )}
              {gateTab === "criteria" && (
                <ul className="space-y-2">
                  {selectedGate.criteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-md border border-neutral-200 p-2">
                      {c.met ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 text-rose-600" />}
                      <div><div className="font-medium">{c.text}</div><div className="font-mono text-[11px] text-neutral-500">{c.evidence}</div></div>
                    </li>
                  ))}
                </ul>
              )}
              {gateTab === "evidence" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[11px]"><thead className="bg-neutral-50 text-left text-neutral-500"><tr><th className="px-2 py-1">ID</th><th className="px-2 py-1">Type</th><th className="px-2 py-1">Source</th><th className="px-2 py-1">Baseline</th><th className="px-2 py-1">Timestamp</th><th className="px-2 py-1">Status</th></tr></thead>
                    <tbody>{selectedGate.evidence.length === 0 ? <tr><td colSpan={6} className="px-2 py-3 text-neutral-500">No evidence attached.</td></tr> : selectedGate.evidence.map((e) => (
                      <tr key={e.id} className="border-t border-neutral-100"><td className="px-2 py-1 font-mono">{e.id}</td><td className="px-2 py-1">{e.type}</td><td className="px-2 py-1">{e.source}</td><td className="px-2 py-1 font-mono">{e.baseline}</td><td className="px-2 py-1">{e.ts}</td><td className="px-2 py-1">{e.status}</td></tr>
                    ))}</tbody></table>
                  {selectedGate.missing.length > 0 && (
                    <div className="mt-3 rounded-md border border-orange-200 bg-orange-50 p-2 text-[11px] text-orange-900">
                      <div className="font-semibold">Missing evidence</div>
                      <ul className="list-disc pl-4">{selectedGate.missing.map((m) => <li key={m}>{m}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
              {gateTab === "blockers" && (
                selectedGate.blockers.length === 0 ? <p className="text-neutral-500">No blockers.</p> : (
                  <ul className="space-y-2">{selectedGate.blockers.map((b) => <li key={b} className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 font-mono text-[11px] text-rose-800">{b}</li>)}</ul>
                )
              )}
              {gateTab === "risks" && (
                selectedGate.residualRisks.length === 0 ? <p className="text-neutral-500">No residual risks.</p> : (
                  <ul className="space-y-2">{selectedGate.residualRisks.map((r) => {
                    const risk = RISKS.find((x) => x.id === r);
                    return <li key={r} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px]"><div className="font-mono">{r}</div><div>{risk?.desc}</div></li>;
                  })}</ul>
                )
              )}
              {gateTab === "waivers" && (
                <p className="text-neutral-500 text-[11px]">Related waivers: {WAIVERS.filter((w) => selectedGate.evidence.some((e) => e.id === w.id) || selectedGate.id === "G05" || selectedGate.id === "G07" || selectedGate.id === "G04").map((w) => w.id).join(", ") || "—"}</p>
              )}
              {gateTab === "deps" && (
                <p>Depends on: <span className="font-mono">{selectedGate.dependencies.join(", ") || "—"}</span></p>
              )}
              {gateTab === "approvals" && (
                <div>
                  <Kv k="Approver" v={selectedGate.approver} />
                  <Kv k="State" v={selectedGate.approvalState} />
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] hover:bg-neutral-50">Request approval</button>
                    <button className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] hover:bg-neutral-50">Return for remediation</button>
                  </div>
                </div>
              )}
              {gateTab === "audit" && (
                <ul className="space-y-1 font-mono text-[11px] text-neutral-600">
                  <li>2026-07-21 14:02 · evaluation · state {selectedGate.state}</li>
                  <li>2026-07-20 09:11 · evidence added · rtl_baseline_3.2.18_candidate</li>
                  <li>2026-07-18 16:22 · owner assigned · {selectedGate.owner}</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough */}
      {walkOpen && (
        <div className="fixed bottom-16 right-6 z-40 w-80 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-neutral-900">Signoff Readiness walkthrough</div>
            <button onClick={() => setWalkOpen(false)} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-2 text-xs text-neutral-500">Step {walkStep + 1} of {walkSteps.length}</div>
          <p className="mt-1 text-sm text-neutral-800">{walkSteps[walkStep]}</p>
          <div className="mt-3 flex justify-between">
            <button disabled={walkStep === 0} onClick={() => setWalkStep((s) => s - 1)} className="rounded-md border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40">Back</button>
            <button onClick={() => setWalkStep((s) => Math.min(walkSteps.length - 1, s + 1))} className="rounded-md bg-neutral-900 px-2 py-1 text-xs text-white">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return <div className="text-[11px]"><div className="text-neutral-500">{k}</div><div className="font-medium text-neutral-900">{v}</div></div>;
}

/* ---------- Dependency graph (SVG) ---------- */
function DependencyGraph() {
  const nodes = [
    { id: "REQ", x: 40, y: 40, label: "REQ-DDMAC-143" },
    { id: "ARCH", x: 40, y: 110, label: "ARCH RESET 017" },
    { id: "RTL", x: 220, y: 75, label: "RTL 3.2.18" },
    { id: "STATIC", x: 380, y: 30, label: "Static · RDC 422" },
    { id: "FORMAL", x: 380, y: 90, label: "Formal · run .09" },
    { id: "REG", x: 380, y: 150, label: "Regression 0051" },
    { id: "COV", x: 540, y: 60, label: "Coverage 017" },
    { id: "DEF", x: 540, y: 130, label: "DEF-RTL-224" },
    { id: "WVR", x: 700, y: 30, label: "WVR FORMAL 006" },
    { id: "RISK", x: 700, y: 100, label: "Residual RSK-001" },
    { id: "APR", x: 700, y: 170, label: "Approvals 4/7" },
    { id: "REC", x: 860, y: 100, label: "Recommendation" },
  ];
  const edges: [string, string, boolean?][] = [
    ["REQ", "RTL"], ["ARCH", "RTL"],
    ["RTL", "STATIC", true], ["RTL", "FORMAL"], ["RTL", "REG"],
    ["STATIC", "DEF", true], ["FORMAL", "WVR"], ["REG", "COV"],
    ["FORMAL", "RISK"], ["WVR", "APR"], ["COV", "APR"], ["DEF", "APR", true],
    ["APR", "REC"], ["RISK", "REC"],
  ];
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 960 210" className="min-w-[720px]">
        {edges.map(([a, b, block], i) => {
          const A = map[a], B = map[b];
          return <line key={i} x1={A.x + 60} y1={A.y + 12} x2={B.x} y2={B.y + 12} stroke={block ? "#e11d48" : "#cbd5e1"} strokeWidth={block ? 2 : 1} strokeDasharray={block ? "0" : "3 3"} />;
        })}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            <rect width="120" height="26" rx="6" fill="#fff" stroke="#d4d4d8" />
            <text x="60" y="17" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, SFMono-Regular" fill="#334155">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
