import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Code2,
  Cpu,
  Database,
  FileCode2,
  FileText,
  FlaskConical,
  GitBranch,
  Layers,
  Network,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P2.VER.001 — Verification Environment Builder                  */
/* Route: /avep/verification/environment-builder                       */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";

interface KPI {
  label: string;
  value: string;
  detail: string;
  tone?: "ok" | "warn" | "bad" | "info";
}

interface Component {
  name: string;
  type: string;
  source: string;
  origin: "Generated" | "Reused" | "Human";
  owner: string;
  compile: "Pass" | "Warn" | "Fail";
  unit: "Pass" | "Pending" | "Fail" | "n/a";
  checker: "Validated" | "Pending" | "Blocked" | "n/a";
  review: "Approved" | "Pending" | "Conditional" | "Return";
  findings: number;
  approval: "Approved" | "Pending" | "Blocked" | "Conditional";
}

interface MutationRow {
  scenario: string;
  category: "known-good" | "defective";
  expected: string;
  actual: string;
  result: "Validated" | "False Pass" | "Not Executed" | "Pending";
  owner: string;
}

/* ------------------------------------------------------------------ */
/* Deterministic data                                                  */
/* ------------------------------------------------------------------ */

const KPI_BY_SCENARIO: Record<Scenario, KPI[]> = {
  T0: [
    { label: "Source readiness", value: "100%", detail: "All sources approved", tone: "ok" },
    { label: "Generated components", value: "42", detail: "All classes present", tone: "ok" },
    { label: "Source traceability", value: "100%", detail: "211 of 211 mapped", tone: "ok" },
    { label: "Compile status", value: "Pass", detail: "No warnings", tone: "ok" },
    { label: "Checker validation", value: "24 of 24", detail: "All mutations pass", tone: "ok" },
    { label: "False-pass risk", value: "None", detail: "No open defects", tone: "ok" },
    { label: "Regression readiness", value: "Approved", detail: "Smoke + broad", tone: "ok" },
    { label: "Remaining effort", value: "0 days", detail: "Environment approved", tone: "ok" },
  ],
  T1: [
    { label: "Source readiness", value: "72%", detail: "3 clarifications open", tone: "warn" },
    { label: "Generated components", value: "31", detail: "Scoreboard missing", tone: "bad" },
    { label: "Source traceability", value: "64%", detail: "Predictor disconnected", tone: "bad" },
    { label: "Compile status", value: "Fail", detail: "4 elaboration errors", tone: "bad" },
    { label: "Checker validation", value: "6 of 24", detail: "Coverage incomplete", tone: "bad" },
    { label: "False-pass risk", value: "Unknown", detail: "Cannot assess", tone: "warn" },
    { label: "Regression readiness", value: "Blocked", detail: "Compile blocking", tone: "bad" },
    { label: "Remaining effort", value: "14 days", detail: "Structural gaps", tone: "warn" },
  ],
  T2: [
    { label: "Source readiness", value: "94%", detail: "One timing clarification unresolved", tone: "warn" },
    { label: "Generated components", value: "42", detail: "Agents, checkers, coverage, RAL", tone: "info" },
    { label: "Source traceability", value: "91%", detail: "192 of 211 mapped", tone: "info" },
    { label: "Compile status", value: "Pass", detail: "Two advisory warnings", tone: "ok" },
    { label: "Checker validation", value: "17 of 24", detail: "7 of 14 defective detected", tone: "warn" },
    { label: "False-pass risk", value: "Elevated", detail: "Two behaviors undetected", tone: "bad" },
    { label: "Regression readiness", value: "Conditional", detail: "Smoke ready, broad blocked", tone: "warn" },
    { label: "Remaining effort", value: "6.5 days", detail: "Range 5 to 9", tone: "info" },
  ],
  T3: [
    { label: "Source readiness", value: "94%", detail: "Ambiguity re-opened", tone: "warn" },
    { label: "Generated components", value: "42", detail: "Full stack", tone: "info" },
    { label: "Source traceability", value: "91%", detail: "Ordering contract disputed", tone: "warn" },
    { label: "Compile status", value: "Pass", detail: "Smoke tests pass", tone: "ok" },
    { label: "Checker validation", value: "13 of 24", detail: "Mutation exposed regression", tone: "bad" },
    { label: "False-pass risk", value: "High", detail: "3 false passes confirmed", tone: "bad" },
    { label: "Regression readiness", value: "Blocked", detail: "Defect DEF-DV-4412 open", tone: "bad" },
    { label: "Remaining effort", value: "9 days", detail: "Reference model rework", tone: "warn" },
  ],
};

const SOURCE_TREE = [
  {
    label: "Verification Intent",
    icon: ClipboardList,
    items: [
      "VPLAN DDMAC 3.2 — 62 objectives",
      "Functional / Security / Performance objectives",
      "Reset / Error / Boundary objectives",
      "Approved test plan (TP-DDMAC-3.2)",
    ],
  },
  {
    label: "Interfaces",
    icon: Network,
    items: [
      "AXI4 master — v2.1 approved",
      "APB configuration — v1.3 approved",
      "Descriptor input — v0.9 conditional",
      "Error and interrupt — v1.0",
      "Clock and reset — v1.0",
    ],
  },
  {
    label: "Registers (RAL)",
    icon: Database,
    items: ["DDMAC_CFG", "MAX_XFER_LEN", "DESC_STATUS", "ERR_STATUS", "INT_ENABLE", "INT_STATUS"],
  },
  {
    label: "Architecture & RTL",
    icon: Cpu,
    items: [
      "ddmac_top",
      "ddmac_control",
      "ddmac_descriptor_validator",
      "ddmac_error_capture",
      "ddmac_interrupt_logic",
      "ddmac_apb_regs",
    ],
  },
  {
    label: "Methodology",
    icon: ShieldCheck,
    items: [
      "UVM 1.2 + factory registration",
      "Config DB / analysis ports",
      "Sequence layering + RAL",
      "Coverage & logging standards",
      "Checker mutation requirements",
    ],
  },
];

const UVM_LAYERS: Array<{ layer: string; nodes: string[]; tone: string }> = [
  {
    layer: "Test Layer",
    tone: "border-indigo-300 bg-indigo-50",
    nodes: [
      "ddmac_base_test",
      "ddmac_smoke_test",
      "ddmac_error_test",
      "ddmac_reset_test",
      "ddmac_security_test",
      "ddmac_performance_test",
    ],
  },
  {
    layer: "Environment Layer",
    tone: "border-sky-300 bg-sky-50",
    nodes: [
      "ddmac_env",
      "ddmac_env_config",
      "ddmac_virtual_sequencer",
      "ddmac_scoreboard",
      "ddmac_reference_model",
      "ddmac_coverage_collector",
      "ddmac_reg_predictor",
    ],
  },
  {
    layer: "Agents",
    tone: "border-emerald-300 bg-emerald-50",
    nodes: [
      "Descriptor Agent (active)",
      "APB Agent (active)",
      "AXI Agent (passive + response)",
      "Error/IRQ Agent (passive)",
      "Clock/Reset Monitor (passive)",
    ],
  },
  {
    layer: "DUT Interfaces",
    tone: "border-slate-300 bg-slate-50",
    nodes: [
      "desc_if",
      "apb_if",
      "axi_if",
      "err_int_if",
      "clk_rst_if",
    ],
  },
];

const OWNERS = [
  "Sofia Rodriguez",
  "Daniel Kim",
  "Aisha Rahman",
  "Maya Chen",
  "Marcus Lee",
  "Arun Patel",
  "Priya Nair",
  "Ben Cohen",
];

function buildComponents(): Component[] {
  const rows: Component[] = [];
  const push = (c: Partial<Component> & { name: string; type: string }) =>
    rows.push({
      source: "VOBJ-DDMAC-021",
      origin: "Generated",
      owner: OWNERS[rows.length % OWNERS.length],
      compile: "Pass",
      unit: "Pass",
      checker: "Validated",
      review: "Approved",
      findings: 0,
      approval: "Approved",
      ...c,
    } as Component);

  // Agents
  push({ name: "ddmac_desc_agent", type: "Agent", source: "IF/desc_if" });
  push({ name: "ddmac_apb_agent", type: "Agent", source: "IF/apb_if" });
  push({ name: "ddmac_axi_agent", type: "Agent (passive)", source: "IF/axi_if" });
  push({ name: "ddmac_err_int_agent", type: "Agent (passive)", source: "IF/err_int_if" });
  // Drivers
  push({ name: "ddmac_desc_driver", type: "Driver", source: "TP-DDMAC-3.2" });
  push({ name: "ddmac_apb_driver", type: "Driver", source: "RAL/APB" });
  // Sequencers
  push({ name: "ddmac_desc_sequencer", type: "Sequencer", source: "VPLAN §4.2" });
  push({ name: "ddmac_apb_sequencer", type: "Sequencer", source: "VPLAN §4.3" });
  push({ name: "ddmac_virtual_sequencer", type: "Virtual Sequencer", source: "VPLAN §5" });
  // Monitors
  push({
    name: "ddmac_desc_monitor",
    type: "Monitor",
    source: "IF/desc_if",
    checker: "Blocked",
    review: "Return",
    findings: 1,
    approval: "Blocked",
    unit: "Pending",
  });
  push({ name: "ddmac_apb_monitor", type: "Monitor", source: "IF/apb_if" });
  push({ name: "ddmac_axi_monitor", type: "Monitor", source: "IF/axi_if" });
  push({ name: "ddmac_err_int_monitor", type: "Monitor", source: "IF/err_int_if" });
  push({ name: "ddmac_clk_rst_monitor", type: "Monitor", source: "IF/clk_rst_if" });
  // Scoreboard + reference
  push({
    name: "ddmac_scoreboard",
    type: "Scoreboard",
    source: "VOBJ-DDMAC-021,033",
    checker: "Blocked",
    review: "Return",
    findings: 1,
    approval: "Blocked",
    unit: "Pending",
  });
  push({ name: "ddmac_secondary_scoreboard", type: "Scoreboard", source: "VOBJ-DDMAC-041" });
  push({ name: "ddmac_reference_model", type: "Reference Model", source: "ARCH §7.2", checker: "Pending", review: "Conditional", approval: "Conditional", findings: 1 });
  push({ name: "ddmac_predictor", type: "Predictor", source: "RAL/DDMAC" });
  push({ name: "ddmac_reg_predictor", type: "RAL Predictor", source: "RAL/DDMAC", origin: "Reused" });
  // Assertions
  push({ name: "asrt_desc_valid_ready", type: "Assertion (SVA)", source: "IF/desc_if" });
  push({ name: "asrt_axi_wr_resp", type: "Assertion (SVA)", source: "IF/axi_if" });
  push({ name: "asrt_apb_setup_access", type: "Assertion (SVA)", source: "IF/apb_if" });
  push({ name: "asrt_int_pulse_width", type: "Assertion (SVA)", source: "IF/err_int_if" });
  push({ name: "asrt_reset_deassert", type: "Assertion (SVA)", source: "IF/clk_rst_if" });
  push({ name: "asrt_desc_length_bound", type: "Assertion (SVA)", source: "REQ-DDMAC-142", checker: "Pending", review: "Pending", approval: "Pending", findings: 0 });
  push({ name: "asrt_privilege_enforce", type: "Assertion (SVA)", source: "REQ-DDMAC-201" });
  push({ name: "asrt_error_code_map", type: "Assertion (SVA)", source: "REQ-DDMAC-188" });
  // Coverage
  push({ name: "ddmac_functional_cov", type: "Functional Coverage", source: "VPLAN §6" });
  push({ name: "ddmac_length_cov", type: "Coverpoint", source: "REQ-DDMAC-142" });
  push({ name: "ddmac_priv_cross_cov", type: "Cross Coverage", source: "REQ-DDMAC-201" });
  push({ name: "ddmac_err_cov", type: "Coverpoint", source: "REQ-DDMAC-188" });
  push({ name: "ddmac_reset_cov", type: "Coverpoint", source: "VOBJ-DDMAC-050", checker: "Pending", approval: "Pending", review: "Pending" });
  push({ name: "ddmac_perf_cov", type: "Coverpoint", source: "VOBJ-DDMAC-062" });
  push({ name: "ddmac_security_cov", type: "Cross Coverage", source: "VOBJ-DDMAC-071", checker: "Pending", approval: "Pending", review: "Pending", findings: 0 });
  // RAL
  push({ name: "ddmac_ral_block", type: "RAL Block", source: "RAL/DDMAC", origin: "Reused" });
  push({ name: "ddmac_ral_adapter", type: "RAL Adapter", source: "RAL/DDMAC", origin: "Reused" });
  // Build / regression / tests
  push({ name: "compile_manifest.f", type: "Build Script", source: "Methodology", origin: "Human" });
  push({ name: "regression.yaml", type: "Regression Manifest", source: "Methodology", origin: "Human" });
  push({ name: "run.sh", type: "Runner", source: "Methodology", origin: "Human" });
  push({ name: "ddmac_smoke_test", type: "Test", source: "VOBJ-DDMAC-001" });
  push({ name: "ddmac_error_test", type: "Test", source: "VOBJ-DDMAC-021" });
  push({ name: "ddmac_reset_test", type: "Test", source: "VOBJ-DDMAC-050" });
  push({ name: "ddmac_security_test", type: "Test", source: "VOBJ-DDMAC-071", checker: "Pending", approval: "Pending", review: "Pending" });
  push({ name: "ddmac_performance_test", type: "Test", source: "VOBJ-DDMAC-062" });

  return rows;
}

const COMPONENTS_BASE = buildComponents();

const MUTATIONS_BY_SCENARIO: Record<Scenario, MutationRow[]> = {
  T0: [
    { scenario: "Valid descriptor accepted", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Aisha Rahman" },
    { scenario: "Maximum legal length", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Aisha Rahman" },
    { scenario: "Oversized descriptor accepted", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Daniel Kim" },
    { scenario: "Privilege violation accepted", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Daniel Kim" },
    { scenario: "Missing completion", category: "defective", expected: "Timeout failure", actual: "Fail", result: "Validated", owner: "Sofia Rodriguez" },
    { scenario: "Out-of-order completion", category: "defective", expected: "Fail or reorder", actual: "Fail", result: "Validated", owner: "Sofia Rodriguez" },
    { scenario: "Monitor samples early", category: "defective", expected: "Env failure", actual: "Fail", result: "Validated", owner: "Maya Chen" },
    { scenario: "Duplicate completion", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Sofia Rodriguez" },
  ],
  T1: [
    { scenario: "Valid descriptor accepted", category: "known-good", expected: "Pass", actual: "Compile error", result: "Not Executed", owner: "Aisha Rahman" },
    { scenario: "Maximum legal length", category: "known-good", expected: "Pass", actual: "Compile error", result: "Not Executed", owner: "Aisha Rahman" },
    { scenario: "Oversized descriptor accepted", category: "defective", expected: "Fail", actual: "Compile error", result: "Not Executed", owner: "Daniel Kim" },
    { scenario: "Missing completion", category: "defective", expected: "Timeout failure", actual: "Compile error", result: "Not Executed", owner: "Sofia Rodriguez" },
  ],
  T2: [
    { scenario: "Valid descriptor accepted", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Aisha Rahman" },
    { scenario: "Maximum legal length", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Aisha Rahman" },
    { scenario: "Legal privileged request", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Marcus Lee" },
    { scenario: "Register readback match", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Marcus Lee" },
    { scenario: "Reset clears pending state", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Priya Nair" },
    { scenario: "Oversized descriptor accepted", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Daniel Kim" },
    { scenario: "Privilege violation accepted", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Daniel Kim" },
    { scenario: "Missing completion", category: "defective", expected: "Timeout failure", actual: "Fail", result: "Validated", owner: "Sofia Rodriguez" },
    { scenario: "Incorrect error code", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Ben Cohen" },
    { scenario: "Out-of-order completion", category: "defective", expected: "Fail or reorder", actual: "Pass", result: "False Pass", owner: "Sofia Rodriguez" },
    { scenario: "Monitor samples early", category: "defective", expected: "Env failure", actual: "Pass", result: "False Pass", owner: "Maya Chen" },
    { scenario: "Duplicate completion", category: "defective", expected: "Fail", actual: "Pending", result: "Not Executed", owner: "Sofia Rodriguez" },
    { scenario: "Register update omitted", category: "defective", expected: "Fail", actual: "Pending", result: "Not Executed", owner: "Marcus Lee" },
    { scenario: "Illegal state transition", category: "defective", expected: "Fail", actual: "Pending", result: "Not Executed", owner: "Arun Patel" },
  ],
  T3: [
    { scenario: "Valid descriptor accepted", category: "known-good", expected: "Pass", actual: "Pass", result: "Validated", owner: "Aisha Rahman" },
    { scenario: "Oversized descriptor accepted", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Daniel Kim" },
    { scenario: "Out-of-order completion", category: "defective", expected: "Fail", actual: "Pass", result: "False Pass", owner: "Sofia Rodriguez" },
    { scenario: "Monitor samples early", category: "defective", expected: "Env failure", actual: "Pass", result: "False Pass", owner: "Maya Chen" },
    { scenario: "Reference model error timing", category: "defective", expected: "Fail", actual: "Pass", result: "False Pass", owner: "Arun Patel" },
    { scenario: "Duplicate completion", category: "defective", expected: "Fail", actual: "Fail", result: "Validated", owner: "Sofia Rodriguez" },
  ],
};

const REVIEWERS = [
  { role: "Verification Lead", owner: "Sofia Rodriguez", state: "Pending" },
  { role: "UVM Architect", owner: "Daniel Kim", state: "Approved with conditions" },
  { role: "Peer Verification Reviewer", owner: "Aisha Rahman", state: "Pending" },
  { role: "RTL Design Lead", owner: "Maya Chen", state: "Pending" },
  { role: "Register Model Owner", owner: "Marcus Lee", state: "Approved" },
  { role: "Formal Lead", owner: "Arun Patel", state: "Pending" },
];

const READINESS = [
  { cat: "Source readiness", state: "Conditional Pass", tone: "warn" },
  { cat: "Architecture completeness", state: "Pass", tone: "ok" },
  { cat: "Compile and elaboration", state: "Pass", tone: "ok" },
  { cat: "Checker trust", state: "Blocked", tone: "bad" },
  { cat: "Assertions", state: "Conditional", tone: "warn" },
  { cat: "Coverage", state: "Conditional Pass", tone: "warn" },
  { cat: "Regression infrastructure", state: "Smoke Pass, Broad Blocked", tone: "warn" },
];

const SV_SNIPPET = `class ddmac_desc_monitor extends uvm_monitor;
  \`uvm_component_utils(ddmac_desc_monitor)

  virtual desc_if vif;
  uvm_analysis_port#(ddmac_desc_item) ap;

  // TODO(REVIEW): sampling contract ambiguous.
  // desc_valid && desc_ready  vs.  desc_valid rising edge.
  task run_phase(uvm_phase phase);
    ddmac_desc_item tr;
    forever begin
      @(posedge vif.clk);
      if (vif.desc_valid && vif.desc_ready) begin
        tr = ddmac_desc_item::type_id::create("tr");
        tr.payload_length = vif.desc_length;
        tr.priv           = vif.desc_priv;
        tr.opcode         = vif.desc_opcode;
        ap.write(tr);
      end
    end
  endtask
endclass`;

const SCOREBOARD_SNIPPET = `class ddmac_scoreboard extends uvm_scoreboard;
  \`uvm_component_utils(ddmac_scoreboard)

  uvm_tlm_analysis_fifo#(ddmac_desc_item) exp_fifo;
  uvm_tlm_analysis_fifo#(ddmac_desc_item) obs_fifo;

  // WARNING: sequential FIFO match assumes in-order completion.
  // AXI response ordering permits out-of-order across IDs.
  task run_phase(uvm_phase phase);
    ddmac_desc_item e, o;
    forever begin
      exp_fifo.get(e);
      obs_fifo.get(o);
      if (!e.compare(o))
        \`uvm_error("SB_MISMATCH", $sformatf("exp=%p act=%p", e, o))
    end
  endtask
endclass`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const toneClass = (t?: string) =>
  t === "ok"
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : t === "warn"
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : t === "bad"
    ? "text-rose-700 bg-rose-50 border-rose-200"
    : "text-slate-700 bg-slate-50 border-slate-200";

const stateBadge = (s: string) => {
  const map: Record<string, string> = {
    Pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Warn: "bg-amber-50 text-amber-700 border-amber-200",
    Conditional: "bg-amber-50 text-amber-700 border-amber-200",
    Pending: "bg-slate-50 text-slate-700 border-slate-200",
    "n/a": "bg-slate-50 text-slate-500 border-slate-200",
    Fail: "bg-rose-50 text-rose-700 border-rose-200",
    Blocked: "bg-rose-50 text-rose-700 border-rose-200",
    Return: "bg-rose-50 text-rose-700 border-rose-200",
    "False Pass": "bg-rose-50 text-rose-700 border-rose-200",
    "Not Executed": "bg-slate-50 text-slate-600 border-slate-200",
  };
  return map[s] ?? "bg-slate-50 text-slate-700 border-slate-200";
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function VerificationEnvironmentBuilder() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [tab, setTab] = useState<
    "components" | "scoreboard" | "refmodel" | "assertions" | "coverage" | "ral" | "build" | "mapping" | "log"
  >("components");
  const [componentFilter, setComponentFilter] = useState("");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [audit, setAudit] = useState<Array<{ ts: string; msg: string }>>([
    { ts: "10:02:14", msg: "Environment dv_env_2.4_candidate generated from approved sources" },
    { ts: "10:04:07", msg: "Compile passed with 2 advisory warnings" },
    { ts: "10:11:33", msg: "Checker mutation run initiated (14 defective, 10 known-good)" },
    { ts: "10:14:21", msg: "False pass detected: out-of-order completion (scoreboard ordering)" },
    { ts: "10:14:22", msg: "False pass detected: monitor samples early (sampling contract)" },
    { ts: "10:15:00", msg: "Broad-regression approval held pending checker resolution" },
  ]);
  const [walkStep, setWalkStep] = useState(0);
  const [walkOpen, setWalkOpen] = useState(false);

  const kpis = KPI_BY_SCENARIO[scenario];
  const mutations = MUTATIONS_BY_SCENARIO[scenario];

  const components = useMemo(() => {
    if (scenario === "T0") {
      return COMPONENTS_BASE.map((c) => ({ ...c, checker: "Validated" as const, approval: "Approved" as const, review: "Approved" as const, findings: 0 }));
    }
    if (scenario === "T1") {
      return COMPONENTS_BASE.slice(0, 31).map((c, i) =>
        i < 4 ? { ...c, compile: "Fail" as const, checker: "Blocked" as const, approval: "Blocked" as const } : c,
      );
    }
    if (scenario === "T3") {
      return COMPONENTS_BASE.map((c) =>
        c.name === "ddmac_reference_model"
          ? { ...c, checker: "Blocked" as const, approval: "Blocked" as const, review: "Return" as const, findings: 2 }
          : c,
      );
    }
    return COMPONENTS_BASE;
  }, [scenario]);

  const filtered = components.filter(
    (c) => !componentFilter || c.name.includes(componentFilter) || c.type.toLowerCase().includes(componentFilter.toLowerCase()),
  );

  const blockingCount = scenario === "T0" ? 0 : scenario === "T1" ? 4 : scenario === "T3" ? 3 : 2;
  const approvals = scenario === "T0" ? 6 : 2;
  const structural = scenario === "T0" ? 100 : scenario === "T1" ? 61 : 88;
  const trust = scenario === "T0" ? 100 : scenario === "T1" ? 25 : scenario === "T3" ? 54 : 71;
  const broadEnabled = blockingCount === 0 && trust === 100;

  const pushAudit = (msg: string) => {
    const d = new Date();
    const ts = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    setAudit((prev) => [{ ts, msg }, ...prev].slice(0, 40));
  };

  const walkSteps = [
    { t: "Confirm approved verification intent", d: "VPLAN DDMAC 3.2 is approved with 62 objectives. One descriptor timing clarification remains open." },
    { t: "Review generated UVM architecture", d: "Test, Environment, Agent, DUT interface layers are present. Passive AXI agent with response model." },
    { t: "Inspect source-to-component traceability", d: "192 of 211 sources map cleanly. Predictor path and error-timing paths require confirmation." },
    { t: "Review monitor and scoreboard assumptions", d: "Monitor sampling and scoreboard ordering are flagged for reviewer confirmation." },
    { t: "Run checker mutation testing", d: "14 defective + 10 known-good scenarios. 17 of 24 pass." },
    { t: "Expose false-pass risk", d: "Out-of-order completion and early monitor sampling create silent false passes." },
    { t: "Compare smoke vs broad regression", d: "Smoke is unblocked. Broad regression remains disabled until checker trust is restored." },
    { t: "Show human review and approval", d: "Verification Lead retains authority. AI provides evidence only." },
  ];

  return (
    <div className="min-h-full pb-28 text-slate-800">
      {/* Context strip */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[11px] text-slate-600">
          <span>Program: <b className="text-slate-900">StrataShield SPS SoC</b></span>
          <span>IP: <b className="text-slate-900">DDMAC Packet Movement Engine</b></span>
          <span>Rev: <b className="text-slate-900">DDMAC 3.2</b></span>
          <span>Branch: <b className="text-slate-900">feature/ddmac_descriptor_guard</b></span>
          <span>RTL: <b className="text-slate-900">rtl_baseline_3.2.18_candidate</b></span>
          <span>DV: <b className="text-slate-900">dv_env_2.4_candidate</b></span>
          <span>Milestone: <b className="text-slate-900">M4 DV Entry</b></span>
          <span className="ml-auto flex items-center gap-2">
            <label className="text-slate-500">Scenario</label>
            <select
              value={scenario}
              onChange={(e) => {
                const v = e.target.value as Scenario;
                setScenario(v);
                pushAudit(`Scenario switched to ${v}`);
              }}
              className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono"
            >
              <option value="T0">T0 — Approved</option>
              <option value="T1">T1 — Incomplete</option>
              <option value="T2">T2 — AI-Generated</option>
              <option value="T3">T3 — Checker Defect</option>
            </select>
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Verification Environment Builder</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Generate a traceable UVM architecture and reviewable verification scaffolding from approved verification intent,
            interfaces, registers, architecture, and RTL structure.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full border px-2 py-0.5 ${toneClass("warn")}`}>Environment: In Review</span>
            <span className={`rounded-full border px-2 py-0.5 ${toneClass("info")}`}>Structural {structural}%</span>
            <span className={`rounded-full border px-2 py-0.5 ${toneClass(trust >= 90 ? "ok" : trust >= 65 ? "warn" : "bad")}`}>Checker trust {trust}%</span>
            <span className={`rounded-full border px-2 py-0.5 ${toneClass(blockingCount === 0 ? "ok" : "bad")}`}>
              Blocking: {blockingCount}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setWalkOpen(true);
            setWalkStep(0);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <Sparkles className="h-3.5 w-3.5" /> Start Verification Environment Walkthrough
        </button>
      </div>

      {/* Recommendation banner */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <div className="font-medium text-amber-900">
            Recommendation: Approve limited smoke testing only. Resolve scoreboard ordering and monitor sampling risks
            before broad regression.
          </div>
          <div className="mt-0.5 text-xs text-amber-800">
            AI evidence is decision support. Approval authority remains with the Verification Lead and required reviewers.
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-lg border p-3 ${toneClass(k.tone)}`}>
            <div className="text-[10px] uppercase tracking-wide opacity-70">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
            <div className="mt-1 text-[11px] leading-tight opacity-80">{k.detail}</div>
          </div>
        ))}
      </div>

      {/* Main 4-region workspace */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* 1. Source context */}
        <aside className="xl:col-span-3 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FileText className="h-4 w-4 text-slate-500" /> Verification Source Context
            </div>
            <span className="text-[10px] font-mono text-slate-500">approved sources</span>
          </div>
          <div className="max-h-[560px] overflow-auto p-2 text-xs">
            {SOURCE_TREE.map((g) => (
              <div key={g.label} className="mb-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
                  <g.icon className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">{g.label}</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {g.items.map((it) => (
                    <li
                      key={it}
                      onClick={() => {
                        setSelectedNode(it);
                        pushAudit(`Source selected: ${it}`);
                      }}
                      className="flex cursor-pointer items-center justify-between gap-2 px-2 py-1.5 font-mono text-[11px] hover:bg-indigo-50"
                    >
                      <span className="truncate">{it}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* 2. Canvas + assets */}
        <section className="xl:col-span-6 space-y-4">
          {/* Canvas */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Layers className="h-4 w-4 text-slate-500" /> UVM Architecture Canvas
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Zoom · Pan · Filter</span>
              </div>
            </div>
            <div className="space-y-2 p-3">
              {UVM_LAYERS.map((L) => (
                <div key={L.layer} className={`rounded-lg border p-2 ${L.tone}`}>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    {L.layer}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {L.nodes.map((n) => {
                      const highlighted =
                        selectedNode &&
                        (n.toLowerCase().includes("desc") && selectedNode.toLowerCase().includes("desc"));
                      const risky = n.includes("scoreboard") || n.includes("desc_monitor") || n.includes("reference_model");
                      return (
                        <button
                          key={n}
                          onClick={() => {
                            setSelectedNode(n);
                            pushAudit(`Canvas node inspected: ${n}`);
                          }}
                          className={`rounded border px-2 py-1 font-mono text-[11px] transition ${
                            highlighted
                              ? "border-indigo-500 bg-white shadow-sm"
                              : risky
                              ? "border-rose-300 bg-white text-rose-800 hover:border-rose-400"
                              : "border-slate-300 bg-white hover:border-indigo-400"
                          }`}
                        >
                          {n}
                          {risky && <span className="ml-1 text-rose-500">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Blocking finding
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> Selected trace
                </span>
                <span>Passive AXI agent · Response model attached</span>
              </div>
            </div>
          </div>

          {/* Assets tabs */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-2 py-1.5 text-xs">
              {(
                [
                  ["components", "UVM Components"],
                  ["scoreboard", "Scoreboard"],
                  ["refmodel", "Reference Model"],
                  ["assertions", "Assertions"],
                  ["coverage", "Coverage"],
                  ["ral", "RAL Integration"],
                  ["build", "Build & Regression"],
                  ["mapping", "Source Mapping"],
                  ["log", "Generation Log"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`rounded px-2 py-1 ${
                    tab === k ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="p-3">
              {tab === "components" && (
                <>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        value={componentFilter}
                        onChange={(e) => setComponentFilter(e.target.value)}
                        placeholder="Filter 42 components…"
                        className="w-full rounded border border-slate-300 py-1 pl-7 pr-2 text-xs"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">{filtered.length} shown</span>
                  </div>
                  <div className="max-h-[420px] overflow-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-2 py-1.5">Component</th>
                          <th className="px-2 py-1.5">Type</th>
                          <th className="px-2 py-1.5">Source</th>
                          <th className="px-2 py-1.5">Origin</th>
                          <th className="px-2 py-1.5">Compile</th>
                          <th className="px-2 py-1.5">Unit</th>
                          <th className="px-2 py-1.5">Checker</th>
                          <th className="px-2 py-1.5">Review</th>
                          <th className="px-2 py-1.5">Approval</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((c) => (
                          <tr
                            key={c.name}
                            onClick={() => setSelectedNode(c.name)}
                            className="cursor-pointer border-t border-slate-100 hover:bg-indigo-50/40"
                          >
                            <td className="px-2 py-1.5 font-mono">{c.name}</td>
                            <td className="px-2 py-1.5">{c.type}</td>
                            <td className="px-2 py-1.5 font-mono text-slate-500">{c.source}</td>
                            <td className="px-2 py-1.5">{c.origin}</td>
                            <td className="px-2 py-1.5">
                              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${stateBadge(c.compile)}`}>
                                {c.compile}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${stateBadge(c.unit)}`}>
                                {c.unit}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${stateBadge(c.checker)}`}>
                                {c.checker}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${stateBadge(c.review)}`}>
                                {c.review}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${stateBadge(c.approval)}`}>
                                {c.approval}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {tab === "scoreboard" && (
                <CodeBlock title="dv/scoreboard/ddmac_scoreboard.sv" code={SCOREBOARD_SNIPPET} warn="Sequential FIFO match — out-of-order permitted per AXI. Reviewer confirmation required." />
              )}
              {tab === "refmodel" && (
                <CodeBlock
                  title="dv/reference_model/ddmac_reference_model.sv"
                  code={`class ddmac_reference_model extends uvm_component;
  \`uvm_component_utils(ddmac_reference_model)

  // Predicts DUT-visible completion + error responses from
  // approved architecture spec (ARCH §7.2).
  function ddmac_desc_item predict(ddmac_desc_item req);
    ddmac_desc_item rsp = ddmac_desc_item::type_id::create("rsp");
    if (req.payload_length > MAX_XFER_LEN) begin
      rsp.err_code = ERR_LEN_EXCEEDED;
      rsp.status   = STATUS_FAIL;
    end else if (!req.priv && req.opcode inside {OP_PRIV_READ, OP_PRIV_WRITE}) begin
      rsp.err_code = ERR_PRIV;
      rsp.status   = STATUS_FAIL;
    end else begin
      rsp.status = STATUS_OK;
    end
    return rsp;
  endfunction
endclass`}
                  warn="Error-timing interpretation may share ambiguity with RTL. Independent formal cross-check recommended."
                />
              )}
              {tab === "assertions" && (
                <CodeBlock
                  title="dv/assertions/desc_if_assertions.sv"
                  code={`// Interface-level SVA for descriptor handshake
property p_desc_valid_stable;
  @(posedge clk) disable iff (!rst_n)
    desc_valid && !desc_ready |=> desc_valid;
endproperty
asrt_desc_valid_stable: assert property (p_desc_valid_stable)
  else \`uvm_error("A_DESC_STABLE", "desc_valid dropped before ready")

property p_desc_length_bound;
  @(posedge clk) desc_valid |-> desc_length <= MAX_XFER_LEN;
endproperty
asrt_desc_length_bound: assert property (p_desc_length_bound);`}
                />
              )}
              {tab === "coverage" && (
                <CodeBlock
                  title="dv/coverage/ddmac_functional_cov.sv"
                  code={`covergroup cg_desc_length @(posedge clk iff desc_valid);
  cp_length: coverpoint desc_length {
    bins zero        = {0};
    bins small       = {[1:63]};
    bins mid         = {[64:1023]};
    bins at_max      = {MAX_XFER_LEN};
    illegal_bins ovf = {[MAX_XFER_LEN+1:$]};
  }
  cp_priv: coverpoint desc_priv { bins u = {0}; bins p = {1}; }
  cx_length_priv: cross cp_length, cp_priv;
endgroup`}
                />
              )}
              {tab === "ral" && (
                <CodeBlock
                  title="dv/ral/ddmac_ral_block.sv"
                  code={`class ddmac_ral_block extends uvm_reg_block;
  rand ddmac_cfg_reg          DDMAC_CFG;
  rand max_xfer_len_reg       MAX_XFER_LEN;
  rand desc_status_reg        DESC_STATUS;
  rand err_status_reg         ERR_STATUS;
  rand int_enable_reg         INT_ENABLE;
  rand int_status_reg         INT_STATUS;
  // predictor wired via ddmac_reg_predictor
endclass`}
                />
              )}
              {tab === "build" && (
                <CodeBlock
                  title="dv/scripts/regression.yaml"
                  code={`baseline: dv_env_2.4_candidate
rtl_baseline: rtl_baseline_3.2.18_candidate
seed_policy: random-24
groups:
  smoke:
    tests: [ddmac_smoke_test]
    seeds: 4
  broad:
    tests:
      - ddmac_error_test
      - ddmac_reset_test
      - ddmac_security_test
      - ddmac_performance_test
    seeds: 128
    gates:
      - checker_trust: 100
      - blocking_findings: 0`}
                  warn="Broad regression gate blocks execution while checker trust < 100 or blocking findings > 0."
                />
              )}
              {tab === "mapping" && (
                <div className="text-[11px] font-mono">
                  <div className="mb-2 text-[10px] uppercase tracking-wide text-slate-500">Traceability example</div>
                  <div className="flex flex-wrap items-center gap-1 leading-relaxed">
                    {[
                      "REQ-DDMAC-142",
                      "VOBJ-DDMAC-021",
                      "TP-DESC-BOUNDARY-004",
                      "ddmac_desc_item.payload_length",
                      "ddmac_desc_driver",
                      "ddmac_desc_monitor",
                      "ddmac_reference_model",
                      "ddmac_scoreboard",
                      "cp_length.at_max",
                      "test_desc_length_max",
                    ].map((n, i, arr) => (
                      <span key={n} className="flex items-center gap-1">
                        <span className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5">{n}</span>
                        {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400" />}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-[10px] uppercase tracking-wide text-slate-500">Relationship states</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {["Direct", "Inferred", "Confirmed", "Missing", "Conflicting", "Pending", "Validated", "Blocked"].map(
                      (s) => (
                        <span key={s} className="rounded border border-slate-200 bg-white px-1.5 py-0.5">
                          {s}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
              {tab === "log" && (
                <div className="max-h-[360px] overflow-auto rounded border border-slate-200 bg-slate-950 p-2 font-mono text-[11px] text-emerald-200">
                  {audit.map((a, i) => (
                    <div key={i}>
                      <span className="text-slate-500">[{a.ts}]</span> {a.msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checker Validation Lab */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FlaskConical className="h-4 w-4 text-slate-500" /> Checker Validation Laboratory
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pushAudit("Ran all required mutations")}
                  className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] text-indigo-700 hover:bg-indigo-100"
                >
                  <PlayCircle className="h-3 w-3" /> Run all mutations
                </button>
                <button
                  onClick={() => pushAudit("Filed defect DEF-DV-4412 (scoreboard ordering)")}
                  className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100"
                >
                  <ShieldAlert className="h-3 w-3" /> File defect
                </button>
              </div>
            </div>
            <div className="max-h-[320px] overflow-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5">Scenario</th>
                    <th className="px-2 py-1.5">Category</th>
                    <th className="px-2 py-1.5">Expected</th>
                    <th className="px-2 py-1.5">Actual</th>
                    <th className="px-2 py-1.5">Result</th>
                    <th className="px-2 py-1.5">Owner</th>
                    <th className="px-2 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {mutations.map((m) => (
                    <tr key={m.scenario} className="border-t border-slate-100">
                      <td className="px-2 py-1.5">{m.scenario}</td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] ${
                            m.category === "known-good"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {m.category}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 font-mono text-slate-500">{m.expected}</td>
                      <td className="px-2 py-1.5 font-mono text-slate-700">{m.actual}</td>
                      <td className="px-2 py-1.5">
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] ${stateBadge(m.result)}`}>
                          {m.result}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">{m.owner}</td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => pushAudit(`Re-run mutation: ${m.scenario}`)}
                          className="text-indigo-600 hover:underline"
                        >
                          Run
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. AI Evidence rail */}
        <aside className="xl:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold text-slate-800">
              <Sparkles className="h-4 w-4 text-indigo-500" /> AI Verification Evidence
            </div>
            <div className="space-y-3 p-3 text-[12px]">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Recommendation</div>
                <div className="mt-0.5 font-medium text-amber-800">Limited smoke testing only</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Reasoning</div>
                <p className="mt-0.5 text-slate-700">
                  Environment compiles and contains stimulus, observation, prediction, checking, coverage, RAL, and
                  regression layers. Two checker-trust failures block broad regression.
                </p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Structural completeness</div>
                <ul className="mt-1 space-y-0.5 text-slate-700">
                  <li className="flex justify-between"><span>Agents</span><b className="font-mono">4 / 4</b></li>
                  <li className="flex justify-between"><span>Monitors</span><b className="font-mono">5 / 5</b></li>
                  <li className="flex justify-between"><span>Scoreboards</span><b className="font-mono">2 / 2</b></li>
                  <li className="flex justify-between"><span>Reference models</span><b className="font-mono">2 / 2</b></li>
                  <li className="flex justify-between"><span>Assertions</span><b className="font-mono">8 / 10</b></li>
                  <li className="flex justify-between"><span>Coverage collectors</span><b className="font-mono">7 / 8</b></li>
                  <li className="flex justify-between"><span>Build scripts</span><b>Complete</b></li>
                  <li className="flex justify-between"><span>Regression manifest</span><b>Complete</b></li>
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Blocking checker risks</div>
                <ol className="mt-1 list-decimal space-y-1 pl-4 text-slate-700">
                  <li>Out-of-order defective behavior passes current scoreboard.</li>
                  <li>One-cycle-early monitor sampling is not detected.</li>
                  <li>Reference model and RTL may share the same ambiguous error-timing interpretation.</li>
                </ol>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Required actions</div>
                <ul className="mt-1 space-y-0.5 text-slate-700">
                  <li>• Confirm ordering contract</li>
                  <li>• Resolve monitor sampling semantics</li>
                  <li>• Add independent checker mutations</li>
                  <li>• Add duplicate and missing transaction checks</li>
                  <li>• Complete reset and security coverage</li>
                  <li>• Hold broad-regression approval</li>
                </ul>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
                Confidence and recommendations are decision support, not proof. Human reviewers retain approval authority.
              </div>
            </div>
          </div>

          {/* Readiness scorecard */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-slate-500" /> Readiness Scorecard
            </div>
            <ul className="divide-y divide-slate-100 text-[12px]">
              {READINESS.map((r) => (
                <li key={r.cat} className="flex items-center justify-between px-3 py-1.5">
                  <span>{r.cat}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] ${toneClass(r.tone)}`}>{r.state}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-3 text-[11px] text-slate-600">
              <div className="mb-1 font-semibold text-slate-700">Currently allowed</div>
              <div>Compile & elaboration · Component unit tests · Smoke testing · Checker mutation testing</div>
              <div className="mt-2 mb-1 font-semibold text-slate-700">Currently prohibited</div>
              <div>Broad dependent regression · Coverage closure claims · Verification readiness approval · Signoff evidence</div>
            </div>
          </div>

          {/* Reviewers */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold text-slate-800">
              <GitBranch className="h-4 w-4 text-slate-500" /> Review & Approval
            </div>
            <ul className="divide-y divide-slate-100 text-[12px]">
              {REVIEWERS.map((r) => (
                <li key={r.role} className="flex items-center justify-between px-3 py-1.5">
                  <div>
                    <div className="font-medium text-slate-800">{r.role}</div>
                    <div className="text-[11px] text-slate-500">{r.owner}</div>
                  </div>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${
                      r.state.startsWith("Approved") ? stateBadge("Approved") : stateBadge("Pending")
                    }`}
                  >
                    {r.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Component Inventory summary + Traceability */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Code2 className="h-4 w-4 text-slate-500" /> Selected node
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              {selectedNode ?? "— select any node, source, or component —"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-3 text-[12px]">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Purpose</div>
              <p className="mt-0.5 text-slate-700">
                {selectedNode?.includes("scoreboard")
                  ? "End-to-end transactional check comparing predicted vs observed descriptor completions."
                  : selectedNode?.includes("monitor")
                  ? "Passive observation of interface traffic, publishing analysis transactions."
                  : "Interactive workspace node. Select a component or source to inspect its metadata, mapping, findings, and audit history."}
              </p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Findings</div>
              <ul className="mt-1 space-y-1 text-slate-700">
                <li className="flex items-start gap-1"><AlertTriangle className="mt-0.5 h-3 w-3 text-rose-500" /> Scoreboard ordering — out-of-order responses match incorrectly.</li>
                <li className="flex items-start gap-1"><AlertTriangle className="mt-0.5 h-3 w-3 text-rose-500" /> Monitor sampling — early sample not detected by mutation.</li>
                <li className="flex items-start gap-1"><AlertTriangle className="mt-0.5 h-3 w-3 text-amber-500" /> Reference model shares error-timing ambiguity with RTL.</li>
              </ul>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Referenced snippet</div>
              <CodeBlock title="dv/agents/descriptor/ddmac_desc_monitor.sv" code={SV_SNIPPET} compact />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold text-slate-800">
            <Activity className="h-4 w-4 text-slate-500" /> Audit Log
          </div>
          <div className="max-h-[340px] overflow-auto p-2 text-[11px] font-mono">
            {audit.map((a, i) => (
              <div key={i} className="border-b border-slate-100 py-1">
                <span className="text-slate-500">[{a.ts}]</span> <span className="text-slate-700">{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-6 py-2 text-xs">
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-600">
            <span>Env: <b className="text-amber-700">In Review</b></span>
            <span>Structural: <b className="text-slate-900">{structural}%</b></span>
            <span>Checker trust: <b className={trust >= 90 ? "text-emerald-700" : trust >= 65 ? "text-amber-700" : "text-rose-700"}>{trust}%</b></span>
            <span>Blocking: <b className={blockingCount === 0 ? "text-emerald-700" : "text-rose-700"}>{blockingCount}</b></span>
            <span>Approvals: <b className="text-slate-900">{approvals} of 6</b></span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-1">
            <ActionBtn icon={FileText} label="Request Clarification" onClick={() => pushAudit("Clarification requested on descriptor sampling contract")} />
            <ActionBtn icon={Wrench} label="Modify Environment" onClick={() => pushAudit("Environment modification opened")} />
            <ActionBtn icon={FlaskConical} label="Run Checker Validation" onClick={() => pushAudit("Checker validation batch queued")} tone="indigo" />
            <ActionBtn icon={RefreshCw} label="Return for Revision" onClick={() => pushAudit("Returned for revision to authoring team")} />
            <ActionBtn icon={CheckCircle2} label="Approve Smoke Testing" onClick={() => pushAudit("Smoke testing approved by Verification Lead")} tone="emerald" />
            <ActionBtn
              icon={broadEnabled ? CheckCircle2 : Ban}
              label="Approve Broad Regression"
              disabled={!broadEnabled}
              onClick={() => pushAudit("Broad regression approved")}
              tone="emerald"
            />
            <ActionBtn icon={FileCode2} label="Export Review Package" onClick={() => pushAudit("Review package exported (simulated)")} />
          </div>
        </div>
      </div>

      {/* Walkthrough overlay */}
      {walkOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/30 p-6">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-indigo-500" /> Verification Environment Walkthrough — Step {walkStep + 1} of {walkSteps.length}
              </div>
              <button onClick={() => setWalkOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm font-medium text-slate-900">{walkSteps[walkStep].t}</div>
            <p className="mt-1 text-sm text-slate-600">{walkSteps[walkStep].d}</p>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setWalkStep((s) => Math.max(0, s - 1))}
                disabled={walkStep === 0}
                className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                Back
              </button>
              <div className="flex gap-1">
                {walkSteps.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${i === walkStep ? "bg-indigo-500" : "bg-slate-200"}`}
                  />
                ))}
              </div>
              {walkStep < walkSteps.length - 1 ? (
                <button
                  onClick={() => setWalkStep((s) => s + 1)}
                  className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setWalkOpen(false)}
                  className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "emerald" | "indigo";
}) {
  const base =
    "inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition";
  const cls = disabled
    ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
    : tone === "emerald"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    : tone === "indigo"
    ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function CodeBlock({
  title,
  code,
  warn,
  compact,
}: {
  title: string;
  code: string;
  warn?: string;
  compact?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
        <span>{title}</span>
        <span className="text-[10px] text-slate-400">SystemVerilog</span>
      </div>
      <pre
        className={`overflow-auto bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-100 ${
          compact ? "max-h-56" : "max-h-80"
        }`}
      >
        {code.split("\n").map((line, i) => (
          <div key={i} className="flex">
            <span className="w-8 select-none text-right pr-2 text-slate-500">{i + 1}</span>
            <span className="whitespace-pre">{line}</span>
          </div>
        ))}
      </pre>
      {warn && (
        <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{warn}</span>
        </div>
      )}
    </div>
  );
}
