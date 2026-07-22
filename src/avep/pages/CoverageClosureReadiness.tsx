import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  Filter,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P3.READINESS.001 — Coverage Closure & Verification Readiness   */
/* Route: /avep/readiness/coverage-closure                             */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";

type GapClass =
  | "Reachable but Untested"
  | "Model Deficiency"
  | "Dead Code"
  | "Legitimate Exclusion"
  | "Specification Ambiguity"
  | "Requires Formal Proof"
  | "Requires New Simulation"
  | "Unknown";

type CoverageType = "Functional" | "Branch" | "Toggle" | "FSM" | "Assertion" | "Requirement" | "Cross" | "Formal";

interface MatrixRow {
  req: string;
  type: CoverageType;
  pct: number;
  gap: string;
  cause: GapClass;
  recommendation: string;
  improvement: string;
  owner: string;
  status: "Proposed" | "Blocked" | "Approved" | "In Review" | "Excluded";
  module: string;
  reachable: "Yes" | "No" | "Partial" | "Unknown";
}

const SCENARIO_META: Record<Scenario, { label: string; closure: number; projected: number; gaps: number; approvals: number }> = {
  T0: { label: "T0 · Early Coverage", closure: 41, projected: 55, gaps: 812, approvals: 0 },
  T1: { label: "T1 · Mid Verification", closure: 78, projected: 89, gaps: 214, approvals: 1 },
  T2: { label: "T2 · Late Verification", closure: 89, projected: 95, gaps: 96, approvals: 2 },
  T3: { label: "T3 · Verification Complete", closure: 94, projected: 97, gaps: 37, approvals: 2 },
};

const KPIS: { key: string; label: string; value: string; detail: string; filter?: CoverageType | "gaps" | "exclusions" | "formal" }[] = [
  { key: "func", label: "Functional Coverage", value: "94%", detail: "cvp / crosses / groups", filter: "Functional" },
  { key: "req",  label: "Requirement Coverage", value: "98%", detail: "REQ → test mapping", filter: "Requirement" },
  { key: "asrt", label: "Assertion Coverage", value: "97%", detail: "SVA hit / proven", filter: "Assertion" },
  { key: "fsm",  label: "FSM Coverage", value: "100%", detail: "States + transitions", filter: "FSM" },
  { key: "cross",label: "Cross Coverage", value: "89%", detail: "Boundary + priv combos", filter: "Cross" },
  { key: "gaps", label: "Remaining Gaps", value: "37", detail: "Across 8 modules", filter: "gaps" },
  { key: "exc",  label: "Exclusions", value: "12", detail: "Awaiting review", filter: "exclusions" },
  { key: "form", label: "Formal Candidates", value: "5", detail: "Proposed properties", filter: "formal" },
];

const MATRIX: MatrixRow[] = [
  { req: "REQ DDMAC 142", type: "Cross",      pct: 96, gap: "Boundary equal-to-max transition",       cause: "Requires New Simulation",   recommendation: "Generate targeted boundary test",         improvement: "+1.8%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "ddmac_descriptor_validator", reachable: "Yes" },
  { req: "REQ DDMAC 143", type: "Functional", pct: 91, gap: "Error timing 2-cycle bin",                cause: "Specification Ambiguity",    recommendation: "Hold until architecture clarification",   improvement: "Unknown", owner: "Arun Patel",      status: "Blocked",   module: "ddmac_error_ctrl",           reachable: "Unknown" },
  { req: "REQ DDMAC 144", type: "Branch",     pct: 97, gap: "priv_mode==DEBUG branch",                 cause: "Legitimate Exclusion",       recommendation: "Approve exclusion (debug tie-off)",       improvement: "0%",     owner: "Priya Shah",       status: "In Review", module: "ddmac_priv_gate",            reachable: "No" },
  { req: "REQ DDMAC 145", type: "Toggle",     pct: 99, gap: "cfg_reserved[7] toggles",                 cause: "Dead Code",                  recommendation: "Confirm tie-off; propose exclusion",      improvement: "0%",     owner: "Maya Chen",        status: "Proposed",  module: "ddmac_cfg_regs",             reachable: "No" },
  { req: "REQ DDMAC 146", type: "FSM",        pct: 100,gap: "—",                                       cause: "Reachable but Untested",     recommendation: "None",                                     improvement: "0%",     owner: "Maya Chen",        status: "Approved",  module: "ddmac_ctrl_fsm",             reachable: "Yes" },
  { req: "REQ DDMAC 147", type: "Cross",      pct: 88, gap: "backpressure × boundary length",          cause: "Requires New Simulation",   recommendation: "Random burst with weighted boundaries",   improvement: "+1.2%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "ddmac_arb",                  reachable: "Yes" },
  { req: "REQ DDMAC 148", type: "Assertion",  pct: 95, gap: "a_desc_error_priority",                   cause: "Requires Formal Proof",      recommendation: "Bind formal property",                     improvement: "+1.0%",  owner: "Daniel Kim",       status: "Proposed",  module: "ddmac_error_ctrl",           reachable: "Yes" },
  { req: "REQ SEC 088",   type: "Cross",      pct: 93, gap: "priv × reset interaction",                cause: "Requires New Simulation",   recommendation: "Randomized privilege plus reset sequence", improvement: "+2.4%",  owner: "Priya Shah",       status: "Proposed",  module: "ddmac_reset_ctrl",           reachable: "Yes" },
  { req: "REQ SEC 089",   type: "Functional", pct: 92, gap: "Security recovery path",                  cause: "Requires Formal Proof",      recommendation: "Formal proof of recovery invariant",       improvement: "+1.1%",  owner: "Daniel Kim",       status: "Proposed",  module: "ddmac_sec_recovery",         reachable: "Yes" },
  { req: "REQ SEC 090",   type: "Branch",     pct: 90, gap: "priv escalation branch",                  cause: "Model Deficiency",           recommendation: "Fix reference model priv table",           improvement: "+2.0%",  owner: "Aisha Rahman",     status: "In Review", module: "tb/sec_ref_model",           reachable: "Yes" },
  { req: "REQ DMA 201",   type: "FSM",        pct: 100,gap: "—",                                       cause: "Reachable but Untested",     recommendation: "None",                                     improvement: "0%",     owner: "Maya Chen",        status: "Approved",  module: "dma_engine",                 reachable: "Yes" },
  { req: "REQ DMA 202",   type: "Cross",      pct: 87, gap: "wr × rd concurrency at max burst",        cause: "Requires New Simulation",   recommendation: "Weighted concurrency scenario",            improvement: "+1.6%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "dma_engine",                 reachable: "Yes" },
  { req: "REQ DMA 203",   type: "Toggle",     pct: 98, gap: "burst_len[3:2] pairs",                    cause: "Requires New Simulation",   recommendation: "Directed toggle set",                      improvement: "+0.4%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "dma_engine",                 reachable: "Yes" },
  { req: "REQ DMA 204",   type: "Branch",     pct: 96, gap: "ecc_error early branch",                  cause: "Legitimate Exclusion",       recommendation: "Approve exclusion (ECC disabled in cfg)",  improvement: "0%",     owner: "Priya Shah",       status: "In Review", module: "dma_engine",                 reachable: "No" },
  { req: "REQ INT 311",   type: "Functional", pct: 94, gap: "Interrupt coalescing at boundary",         cause: "Requires New Simulation",   recommendation: "Directed coalescing scenario",             improvement: "+1.3%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "int_ctrl",                   reachable: "Yes" },
  { req: "REQ INT 312",   type: "Cross",      pct: 90, gap: "int × mask race",                          cause: "Requires Formal Proof",      recommendation: "Bind formal race property",                 improvement: "+0.9%",  owner: "Daniel Kim",       status: "Proposed",  module: "int_ctrl",                   reachable: "Yes" },
  { req: "REQ INT 313",   type: "Assertion",  pct: 98, gap: "a_int_pulse_width",                        cause: "Reachable but Untested",     recommendation: "Directed pulse coverage",                   improvement: "+0.3%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "int_ctrl",                   reachable: "Yes" },
  { req: "REQ CLK 401",   type: "FSM",        pct: 100,gap: "—",                                       cause: "Reachable but Untested",     recommendation: "None",                                     improvement: "0%",     owner: "Maya Chen",        status: "Approved",  module: "clk_ctrl",                   reachable: "Yes" },
  { req: "REQ CLK 402",   type: "Toggle",     pct: 92, gap: "clk_div ratios 7/9/11",                    cause: "Requires New Simulation",   recommendation: "Directed div-ratio sweep",                 improvement: "+0.8%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "clk_ctrl",                   reachable: "Yes" },
  { req: "REQ RST 501",   type: "Cross",      pct: 85, gap: "reset × in-flight desc",                   cause: "Requires New Simulation",   recommendation: "Random reset injection",                    improvement: "+2.1%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "ddmac_reset_ctrl",           reachable: "Yes" },
  { req: "REQ RST 502",   type: "Assertion",  pct: 96, gap: "a_reset_convergence",                      cause: "Requires Formal Proof",      recommendation: "Prove reset convergence invariant",         improvement: "+0.7%",  owner: "Daniel Kim",       status: "Proposed",  module: "ddmac_reset_ctrl",           reachable: "Yes" },
  { req: "REQ DBG 601",   type: "Branch",     pct: 88, gap: "debug capture branch",                     cause: "Dead Code",                  recommendation: "Confirm tie-off; propose exclusion",       improvement: "0%",     owner: "Maya Chen",        status: "Proposed",  module: "dbg_capture",                reachable: "No" },
  { req: "REQ DBG 602",   type: "Toggle",     pct: 91, gap: "dbg_trace_id[15:12]",                      cause: "Legitimate Exclusion",       recommendation: "Exclude (unused in production cfg)",       improvement: "0%",     owner: "Priya Shah",       status: "In Review", module: "dbg_capture",                reachable: "No" },
  { req: "REQ PWR 701",   type: "FSM",        pct: 100,gap: "—",                                       cause: "Reachable but Untested",     recommendation: "None",                                     improvement: "0%",     owner: "Maya Chen",        status: "Approved",  module: "pwr_ctrl",                   reachable: "Yes" },
  { req: "REQ PWR 702",   type: "Cross",      pct: 86, gap: "retention × wake",                         cause: "Requires New Simulation",   recommendation: "Retention/wake random scenario",           improvement: "+1.4%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "pwr_ctrl",                   reachable: "Yes" },
  { req: "REQ ECC 801",   type: "Functional", pct: 95, gap: "SEC/DED corner",                           cause: "Requires New Simulation",   recommendation: "Directed ECC injection",                    improvement: "+0.9%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "ecc_engine",                 reachable: "Yes" },
  { req: "REQ ECC 802",   type: "Branch",     pct: 94, gap: "double-bit escalation",                    cause: "Requires Formal Proof",      recommendation: "Formal escalation proof",                   improvement: "+0.6%",  owner: "Daniel Kim",       status: "Proposed",  module: "ecc_engine",                 reachable: "Yes" },
  { req: "REQ AXI 901",   type: "Cross",      pct: 92, gap: "id × outstanding",                          cause: "Requires New Simulation",   recommendation: "Random ID/outstanding sweep",               improvement: "+1.5%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "axi_shim",                   reachable: "Yes" },
  { req: "REQ AXI 902",   type: "Assertion",  pct: 100,gap: "—",                                       cause: "Reachable but Untested",     recommendation: "None",                                     improvement: "0%",     owner: "Daniel Kim",       status: "Approved",  module: "axi_shim",                   reachable: "Yes" },
  { req: "REQ APB 921",   type: "Toggle",     pct: 99, gap: "psel wide inactivity",                     cause: "Legitimate Exclusion",       recommendation: "Exclude (arch guarantee)",                  improvement: "0%",     owner: "Priya Shah",       status: "In Review", module: "apb_shim",                   reachable: "No" },
  { req: "REQ MON 951",   type: "Functional", pct: 93, gap: "monitor sampling boundary",                 cause: "Model Deficiency",           recommendation: "Update monitor sampling window",            improvement: "+1.7%",  owner: "Aisha Rahman",     status: "In Review", module: "tb/ddmac_monitor",           reachable: "Yes" },
  { req: "REQ MON 952",   type: "Assertion",  pct: 96, gap: "a_sb_order",                                cause: "Model Deficiency",           recommendation: "Scoreboard ordering fix",                    improvement: "+0.5%",  owner: "Aisha Rahman",     status: "In Review", module: "tb/ddmac_sb",                reachable: "Yes" },
  { req: "REQ SIG 971",   type: "Cross",      pct: 91, gap: "signing × replay",                         cause: "Requires Formal Proof",      recommendation: "Formal replay-freedom proof",                improvement: "+0.8%",  owner: "Daniel Kim",       status: "Proposed",  module: "sec_sig",                    reachable: "Yes" },
  { req: "REQ FLT 981",   type: "Functional", pct: 89, gap: "fault concurrency",                        cause: "Requires New Simulation",   recommendation: "Fault concurrency scenario",                  improvement: "+1.3%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "flt_ctrl",                   reachable: "Yes" },
  { req: "REQ FLT 982",   type: "Branch",     pct: 90, gap: "fatal recovery branch",                    cause: "Specification Ambiguity",    recommendation: "Clarify recovery semantics",                  improvement: "Unknown", owner: "Arun Patel",      status: "Blocked",   module: "flt_ctrl",                   reachable: "Unknown" },
  { req: "REQ TRC 991",   type: "Toggle",     pct: 97, gap: "trace_len[5:4]",                           cause: "Requires New Simulation",   recommendation: "Directed toggle set",                          improvement: "+0.4%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "trace_unit",                 reachable: "Yes" },
  { req: "REQ TRC 992",   type: "Assertion",  pct: 98, gap: "a_trace_no_drop",                          cause: "Reachable but Untested",     recommendation: "Directed high-load scenario",                  improvement: "+0.3%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "trace_unit",                 reachable: "Yes" },
  { req: "REQ QOS 999",   type: "Cross",      pct: 87, gap: "qos × arb priority",                       cause: "Requires New Simulation",   recommendation: "Weighted QoS scenario",                        improvement: "+1.9%",  owner: "Sofia Rodriguez", status: "Proposed",  module: "qos_ctrl",                   reachable: "Yes" },
];

const GAP_CLASSES: { key: GapClass; reason: string; evidence: string; confidence: number; reviewer: string }[] = [
  { key: "Reachable but Untested",    reason: "Bin lies on a live path but no stimulus has exercised it.",     evidence: "Reachability analysis, waveform traces on adjacent bins.", confidence: 92, reviewer: "Verification Lead" },
  { key: "Model Deficiency",          reason: "Reference model or scoreboard cannot observe the behavior.",    evidence: "Monitor sampling window, scoreboard ordering trace.",       confidence: 84, reviewer: "UVM Architect" },
  { key: "Dead Code",                 reason: "Structurally unreachable RTL under current configuration.",     evidence: "Formal reachability, tie-off cross-check.",                 confidence: 88, reviewer: "RTL Lead" },
  { key: "Legitimate Exclusion",      reason: "Bin excluded by architectural guarantee or config invariant.",  evidence: "Architecture note, exclusion rationale.",                   confidence: 90, reviewer: "IP Architect" },
  { key: "Specification Ambiguity",   reason: "Requirement text is not precise enough to bind a checker.",     evidence: "Requirements quality finding, open clarification.",         confidence: 71, reviewer: "IP Architect" },
  { key: "Requires Formal Proof",     reason: "Coverage bin is best closed by formal property, not sim.",      evidence: "Cone of influence bounded; property candidate available.",  confidence: 86, reviewer: "Formal Lead" },
  { key: "Requires New Simulation",   reason: "Directed or constrained-random stimulus can reach the bin.",    evidence: "Reachability positive; stimulus recipe identified.",        confidence: 89, reviewer: "Verification Lead" },
  { key: "Unknown",                   reason: "Automated classification could not converge.",                  evidence: "Manual triage required.",                                    confidence: 30, reviewer: "Verification Lead" },
];

const HEAT_TYPES: CoverageType[] = ["Functional", "Branch", "Toggle", "FSM", "Assertion", "Requirement", "Cross", "Formal"];

const FORMAL_CANDIDATES = [
  { id: "p_max_legal_length_accepted",  reason: "Boundary comparison correctness",         difficulty: "Low",    depth: "8 cycles",  owner: "Daniel Kim", status: "Proposed" },
  { id: "p_illegal_desc_rejected",      reason: "Negative-space closure of REQ DDMAC 142", difficulty: "Low",    depth: "10 cycles", owner: "Daniel Kim", status: "Proposed" },
  { id: "p_accept_reject_exclusive",    reason: "Response mutual exclusion",               difficulty: "Medium", depth: "16 cycles", owner: "Daniel Kim", status: "In Review" },
  { id: "p_reset_convergence",          reason: "Convergence after asynchronous reset",    difficulty: "Medium", depth: "24 cycles", owner: "Daniel Kim", status: "Proposed" },
  { id: "p_priv_protection_invariant",  reason: "Privilege escalation safety",             difficulty: "High",   depth: "32 cycles", owner: "Priya Shah", status: "Proposed" },
];

const EXCLUSIONS = [
  { bin: "cvp_priv_debug",        reason: "Debug tie-off in production cfg", evidence: "arch_note_priv_v3.md",        reviewer: "IP Architect",     status: "In Review", expires: "2026-Q4" },
  { bin: "br_ecc_early",          reason: "ECC disabled in this config",     evidence: "cfg_matrix_ddmac.yaml",       reviewer: "Verification Lead", status: "In Review", expires: "2026-Q4" },
  { bin: "cvp_reserved_bits",     reason: "Tie-off; no software surface",    evidence: "cfg_reserved_lint.log",       reviewer: "RTL Lead",         status: "Proposed",  expires: "Perm." },
  { bin: "cvp_debug_trace_ids",   reason: "Unused in production trace map",  evidence: "trace_map_prod.md",           reviewer: "IP Architect",     status: "In Review", expires: "2026-Q4" },
  { bin: "cvp_apb_wide_idle",     reason: "Architectural guarantee",         evidence: "apb_shim_arch.md",            reviewer: "IP Architect",     status: "Approved",  expires: "Perm." },
  { bin: "cvp_dbg_capture_br",    reason: "Not enabled in silicon config",   evidence: "silicon_cfg.yaml",            reviewer: "RTL Lead",         status: "Proposed",  expires: "2026-Q4" },
  { bin: "cvp_scan_shift",        reason: "Scan-only, DFT signoff domain",   evidence: "dft_scope.md",                reviewer: "Verification Lead", status: "Approved",  expires: "Perm." },
  { bin: "cvp_bist_wrap",         reason: "MBIST wrapper — separate signoff",evidence: "mbist_signoff_plan.md",       reviewer: "Verification Lead", status: "Approved",  expires: "Perm." },
  { bin: "cvp_test_hooks",        reason: "Test-only hooks",                 evidence: "test_hook_list.md",           reviewer: "RTL Lead",         status: "Approved",  expires: "Perm." },
  { bin: "cvp_int_legacy",        reason: "Legacy int line, tied-off",       evidence: "int_map.md",                  reviewer: "IP Architect",     status: "In Review", expires: "2026-Q4" },
  { bin: "cvp_pwr_retention_edge",reason: "Guarded by pwr controller",       evidence: "pwr_ctrl_arch.md",            reviewer: "IP Architect",     status: "Proposed",  expires: "2026-Q4" },
  { bin: "cvp_qos_super",         reason: "Super-user QoS not in this SKU",  evidence: "sku_matrix.yaml",             reviewer: "IP Architect",     status: "In Review", expires: "2026-Q4" },
];

const PRIOR_DEFECTS = [
  { id: "DEF DV 173", title: "Boundary defect (inclusive/exclusive)", similarity: 93, gap: "cvp_len_at_max",    tests: 6, assertions: 2 },
  { id: "DEF DV 158", title: "Reset sequencing",                       similarity: 74, gap: "cvp_reset_inflight", tests: 4, assertions: 1 },
  { id: "DEF DV 141", title: "Security privilege escalation",           similarity: 66, gap: "cvp_priv_escalate",  tests: 3, assertions: 2 },
  { id: "DEF DV 129", title: "Interrupt coalescing timing",             similarity: 58, gap: "cvp_int_coalesce",   tests: 2, assertions: 1 },
];

const AUTHORITIES = [
  { role: "Verification Lead", owner: "Sofia Rodriguez", status: "Confirmed" },
  { role: "Formal Lead",       owner: "Daniel Kim",      status: "Confirmed" },
  { role: "RTL Lead",          owner: "Maya Chen",       status: "Pending" },
  { role: "IP Architect",      owner: "Arun Patel",      status: "Pending" },
  { role: "Security Engineer", owner: "Priya Shah",      status: "Pending" },
];

/* ------------------------------------------------------------------ */

export default function CoverageClosureReadiness() {
  const [scenario, setScenario] = useState<Scenario>("T3");
  const [filterType, setFilterType] = useState<CoverageType | "ALL">("ALL");
  const [filterCause, setFilterCause] = useState<GapClass | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [option, setOption] = useState<"A" | "B" | "C" | "D">("D");
  const [drawer, setDrawer] = useState<{ req: string; type: CoverageType } | null>(null);
  const [walk, setWalk] = useState<number | null>(null);

  const meta = SCENARIO_META[scenario];

  const filtered = useMemo(
    () =>
      MATRIX.filter(
        (r) =>
          (filterType === "ALL" || r.type === filterType) &&
          (filterCause === "ALL" || r.cause === filterCause) &&
          (search === "" ||
            r.req.toLowerCase().includes(search.toLowerCase()) ||
            r.module.toLowerCase().includes(search.toLowerCase()) ||
            r.gap.toLowerCase().includes(search.toLowerCase())),
      ),
    [filterType, filterCause, search],
  );

  const walkthrough = [
    "Review overall coverage closure (94%).",
    "Inspect the 37 remaining gaps in the matrix.",
    "Understand why each gap exists via classification.",
    "Compare verification strategies in the Improvement Planner.",
    "Review the 5 recommended formal candidates.",
    "Review proposed exclusions and required reviewers.",
    "Navigate the traceability graph from requirement to approval.",
    "Confirm qualified human approval — AVEP does not advance signoff.",
  ];

  const drawerRow = drawer ? MATRIX.find((r) => r.req === drawer.req && r.type === drawer.type) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Context strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
          <Chip label="Program" value="StrataShield Secure Processing SoC" />
          <Chip label="IP" value="DDMAC 3.2" />
          <Chip label="RTL" value="rtl_baseline_3.2.18_candidate" />
          <Chip label="DV" value="dv_env_2.4_candidate" />
          <Chip label="Milestone" value="M5 · Coverage Closure" accent />
          <Chip label="Role" value="Verification Lead" />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Scenario</span>
            <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
              {(Object.keys(SCENARIO_META) as Scenario[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    scenario === s ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setWalk(walk === null ? 0 : null)}
              className="text-xs font-medium px-2.5 py-1 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              {walk === null ? "Start Walkthrough" : "Exit Walkthrough"}
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              <span>Phase 3 · Prove Readiness and Authorize Advancement</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600">AVEP.P3.READINESS.001</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Coverage Closure & Verification Readiness</h1>
            <p className="mt-1 max-w-4xl text-sm text-slate-600">
              Explain remaining coverage gaps, identify meaningful verification opportunities, recommend targeted verification, and prepare engineering evidence for signoff readiness. AVEP assists engineers with classification and evidence. Human engineering leadership approves exclusions and readiness.
            </p>
          </div>
          <div className="flex flex-col items-end text-xs">
            <span className="uppercase tracking-wide text-slate-500">Readiness</span>
            <span className={`font-mono font-medium mt-0.5 ${scenario === "T3" ? "text-amber-700" : "text-slate-600"}`}>
              {scenario === "T3" ? "Conditional" : scenario === "T0" ? "Not Started" : "In Progress"}
            </span>
            <span className="mt-1 text-slate-500">Closure <span className="font-mono text-slate-900">{meta.closure}%</span> · projected <span className="font-mono text-slate-900">{meta.projected}%</span></span>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {KPIS.map((k) => {
            const active =
              (k.filter && k.filter !== "gaps" && k.filter !== "exclusions" && k.filter !== "formal" && k.filter === filterType) ||
              (k.filter === "gaps" && filterCause !== "ALL");
            return (
              <button
                key={k.key}
                onClick={() => {
                  if (!k.filter) return;
                  if (k.filter === "gaps" || k.filter === "exclusions" || k.filter === "formal") return;
                  setFilterType(filterType === k.filter ? "ALL" : k.filter);
                }}
                className={`text-left rounded-md border p-3 transition ${
                  active ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{k.label}</div>
                <div className="mt-1 font-mono text-lg font-semibold text-slate-900">{k.value}</div>
                <div className="mt-0.5 text-[11px] text-slate-500 leading-snug">{k.detail}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main grid */}
      <div className="px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left column */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <GapClassificationPanel value={filterCause} onChange={setFilterCause} />
          <FormalCandidatesPanel />
          <PriorDefectsPanel />
        </aside>

        {/* Center */}
        <section className="col-span-12 xl:col-span-6 space-y-4">
          <Card
            title="Coverage Analysis Matrix"
            subtitle={`${filtered.length} of ${MATRIX.length} rows · click a row to open the coverage drawer`}
            icon={<Target className="w-4 h-4 text-indigo-600" />}
            right={
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-white">
                  <Search className="w-3 h-3 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search REQ, module, gap"
                    className="text-xs outline-none w-44"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as CoverageType | "ALL")}
                    className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white"
                  >
                    <option value="ALL">All types</option>
                    {HEAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead className="text-[10px] uppercase text-slate-500 sticky top-0 bg-white">
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-1.5 pr-2">Requirement</th>
                    <th className="pr-2">Type</th>
                    <th className="pr-2">%</th>
                    <th className="pr-2">Gap</th>
                    <th className="pr-2">Cause</th>
                    <th className="pr-2">Recommendation</th>
                    <th className="pr-2">Δ</th>
                    <th className="pr-2">Owner</th>
                    <th className="pr-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={i}
                      onClick={() => setDrawer({ req: r.req, type: r.type })}
                      className="cursor-pointer border-b border-slate-100 hover:bg-indigo-50/40"
                    >
                      <td className="py-1.5 pr-2 text-slate-900">{r.req}</td>
                      <td className="pr-2 text-slate-600">{r.type}</td>
                      <td className={`pr-2 ${r.pct >= 95 ? "text-emerald-700" : r.pct >= 90 ? "text-slate-800" : "text-amber-700"}`}>{r.pct}%</td>
                      <td className="pr-2 text-slate-800 truncate max-w-[180px]">{r.gap}</td>
                      <td className="pr-2"><CauseTag cause={r.cause} /></td>
                      <td className="pr-2 text-slate-700 truncate max-w-[220px]">{r.recommendation}</td>
                      <td className="pr-2 text-slate-600">{r.improvement}</td>
                      <td className="pr-2 text-slate-600">{r.owner.split(" ")[0]}</td>
                      <td className="pr-2"><StatusTag s={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Heatmap onCell={(req, type) => setDrawer({ req, type })} />
          <ImprovementPlanner option={option} onOption={setOption} />
          <TraceabilityGraph />
        </section>

        {/* Right column */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <AiEvidencePanel />
          <ExclusionsPanel />
          <AuthoritiesPanel />
        </aside>
      </div>

      {/* Decision bar */}
      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Metric label="Coverage closure" value={`${meta.closure}%`} mono />
          <Metric label="Projected" value={`${meta.projected}%`} mono />
          <Metric label="Remaining gaps" value={String(meta.gaps)} mono />
          <Metric label="Required approvals" value="5" mono />
          <Metric label="Completed" value={`${meta.approvals}`} mono tone={meta.approvals >= 5 ? "ok" : "warn"} />
          <Metric label="Readiness" value={scenario === "T3" ? "Conditional" : "In Progress"} tone="warn" />
          <div className="ml-auto flex flex-wrap gap-2">
            <ActionBtn>Generate Tests</ActionBtn>
            <ActionBtn>Approve Exclusions</ActionBtn>
            <ActionBtn>Approve Formal Scope</ActionBtn>
            <ActionBtn>Export Evidence</ActionBtn>
            <ActionBtn variant="primary" disabled>Advance to Signoff Readiness</ActionBtn>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          AI provides classification and recommendation. Exclusions, remaining risk, and advancement require qualified human approval. Coverage percentage is not readiness.
        </p>
      </div>

      {/* Drawer */}
      {drawerRow && <CoverageDrawer row={drawerRow} onClose={() => setDrawer(null)} />}

      {/* Walkthrough */}
      {walk !== null && (
        <div className="fixed inset-0 z-40 bg-slate-900/30 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Coverage Closure Walkthrough — Step {walk + 1} of {walkthrough.length}
              </div>
              <button onClick={() => setWalk(null)} className="text-slate-500 hover:text-slate-900 text-xs">Close</button>
            </div>
            <div className="px-4 py-4 text-sm text-slate-700">{walkthrough[walk]}</div>
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                disabled={walk === 0}
                onClick={() => setWalk(Math.max(0, walk - 1))}
                className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {walkthrough.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === walk ? "bg-indigo-600" : "bg-slate-200"}`} />
                ))}
              </div>
              <button
                onClick={() => (walk === walkthrough.length - 1 ? setWalk(null) : setWalk(walk + 1))}
                className="text-xs px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {walk === walkthrough.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Chip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`font-mono ${accent ? "text-indigo-700" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{title}</div>
            {subtitle && <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CauseTag({ cause }: { cause: GapClass }) {
  const map: Record<GapClass, string> = {
    "Reachable but Untested":  "bg-amber-50 text-amber-800 border-amber-200",
    "Model Deficiency":        "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
    "Dead Code":               "bg-slate-100 text-slate-700 border-slate-200",
    "Legitimate Exclusion":    "bg-emerald-50 text-emerald-800 border-emerald-200",
    "Specification Ambiguity": "bg-rose-50 text-rose-800 border-rose-200",
    "Requires Formal Proof":   "bg-indigo-50 text-indigo-800 border-indigo-200",
    "Requires New Simulation": "bg-sky-50 text-sky-800 border-sky-200",
    "Unknown":                 "bg-slate-100 text-slate-700 border-slate-200",
  };
  return <span className={`px-1.5 py-0.5 rounded border text-[10px] whitespace-nowrap ${map[cause]}`}>{cause}</span>;
}

function StatusTag({ s }: { s: MatrixRow["status"] }) {
  const map: Record<MatrixRow["status"], string> = {
    Proposed:  "bg-sky-50 text-sky-800 border-sky-200",
    Blocked:   "bg-rose-50 text-rose-800 border-rose-200",
    Approved:  "bg-emerald-50 text-emerald-800 border-emerald-200",
    "In Review": "bg-amber-50 text-amber-800 border-amber-200",
    Excluded:  "bg-slate-100 text-slate-700 border-slate-200",
  };
  return <span className={`px-1.5 py-0.5 rounded border text-[10px] whitespace-nowrap ${map[s]}`}>{s}</span>;
}

function GapClassificationPanel({ value, onChange }: { value: GapClass | "ALL"; onChange: (g: GapClass | "ALL") => void }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    MATRIX.forEach((r) => (c[r.cause] = (c[r.cause] || 0) + 1));
    return c;
  }, []);
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Gap Classification</div>
        <button
          onClick={() => onChange("ALL")}
          className={`ml-auto text-[10px] px-1.5 py-0.5 rounded border ${value === "ALL" ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          All
        </button>
      </div>
      <ul className="divide-y divide-slate-100 text-xs">
        {GAP_CLASSES.map((g) => {
          const active = value === g.key;
          return (
            <li key={g.key}>
              <button
                onClick={() => onChange(active ? "ALL" : g.key)}
                className={`w-full text-left px-3 py-2 ${active ? "bg-indigo-50/60" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <CauseTag cause={g.key} />
                  <span className="ml-auto font-mono text-[11px] text-slate-500">{counts[g.key] || 0}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-600">{g.reason}</div>
                <div className="mt-0.5 text-[10px] text-slate-500 flex flex-wrap gap-x-2">
                  <span>Evidence: {g.evidence}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                  <span>Reviewer <span className="text-slate-800">{g.reviewer}</span></span>
                  <span>·</span>
                  <span>Confidence <span className="font-mono text-slate-800">{g.confidence}%</span></span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FormalCandidatesPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Formal Candidates</div>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">Advisory</span>
      </div>
      <ul className="divide-y divide-slate-100 text-xs">
        {FORMAL_CANDIDATES.map((c) => (
          <li key={c.id} className="px-3 py-2">
            <div className="font-mono text-[11px] text-slate-900">{c.id}</div>
            <div className="text-[11px] text-slate-600">{c.reason}</div>
            <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-slate-500">
              <span>Difficulty <span className="text-slate-800">{c.difficulty}</span></span>
              <span>·</span>
              <span>Depth <span className="font-mono text-slate-800">{c.depth}</span></span>
              <span>·</span>
              <span>Owner <span className="text-slate-800">{c.owner}</span></span>
              <span>·</span>
              <span className={c.status === "Proposed" ? "text-sky-700" : "text-amber-700"}>{c.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriorDefectsPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Historical Learning</div>
      </div>
      <ul className="divide-y divide-slate-100 text-xs">
        {PRIOR_DEFECTS.map((d) => (
          <li key={d.id} className="px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-900">{d.id}</span>
              <span
                className={`ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                  d.similarity >= 80 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {d.similarity}%
              </span>
            </div>
            <div className="text-[11px] text-slate-700">{d.title}</div>
            <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
              gap {d.gap} · reusable {d.tests} tests · {d.assertions} assertions
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Heatmap({ onCell }: { onCell: (req: string, type: CoverageType) => void }) {
  const reqs = useMemo(() => Array.from(new Set(MATRIX.map((r) => r.req))), []);
  const cell = (req: string, type: CoverageType) => {
    const row = MATRIX.find((r) => r.req === req && r.type === type);
    if (!row) return null;
    return row;
  };
  const color = (pct: number, missing: boolean) => {
    if (missing) return "bg-slate-100 text-slate-400";
    if (pct >= 98) return "bg-emerald-500 text-white";
    if (pct >= 94) return "bg-emerald-300 text-emerald-950";
    if (pct >= 90) return "bg-amber-300 text-amber-950";
    if (pct >= 80) return "bg-orange-400 text-white";
    return "bg-rose-500 text-white";
  };
  return (
    <Card
      title="Coverage Heatmap"
      subtitle="Rows: requirements · Columns: coverage categories. Click any cell for detail."
      icon={<Zap className="w-4 h-4 text-indigo-600" />}
      right={
        <div className="flex items-center gap-1 text-[10px]">
          {[
            ["≥98", "bg-emerald-500"],
            ["≥94", "bg-emerald-300"],
            ["≥90", "bg-amber-300"],
            ["≥80", "bg-orange-400"],
            ["<80", "bg-rose-500"],
            ["n/a", "bg-slate-200"],
          ].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${c}`} />
              <span className="text-slate-600">{l}</span>
            </span>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="text-[11px] font-mono border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left text-slate-500 uppercase text-[10px] font-medium">Requirement</th>
              {HEAT_TYPES.map((t) => (
                <th key={t} className="px-1 text-slate-500 uppercase text-[10px] font-medium">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reqs.map((req) => (
              <tr key={req}>
                <td className="text-slate-800 pr-2">{req}</td>
                {HEAT_TYPES.map((t) => {
                  const c = cell(req, t);
                  return (
                    <td key={t} className="p-0">
                      <button
                        onClick={() => c && onCell(req, t)}
                        title={c ? `${req} · ${t} · ${c.pct}%` : "no data"}
                        className={`w-10 h-6 rounded text-[10px] font-mono ${color(c?.pct ?? -1, !c)} hover:ring-2 hover:ring-indigo-300`}
                      >
                        {c ? `${c.pct}` : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ImprovementPlanner({ option, onOption }: { option: "A" | "B" | "C" | "D"; onOption: (o: "A" | "B" | "C" | "D") => void }) {
  const options = [
    { id: "A" as const, label: "Targeted Directed", scope: "8 tests",           runtime: "2 h",  improvement: "+2.0%", compute: "48 core-h", note: "Grounded in classified gaps." },
    { id: "B" as const, label: "Targeted Random",   scope: "150 seeds",         runtime: "5 h",  improvement: "+2.5%", compute: "220 core-h", note: "Weighted boundary + concurrency." },
    { id: "C" as const, label: "Formal Proof",      scope: "5 properties",       runtime: "3 core-h", improvement: "+1.0%", compute: "3 core-h",  note: "Best-fit for invariants and safety." },
    { id: "D" as const, label: "Combined",          scope: "Directed + Random + Formal", runtime: "9 h", improvement: "+3.8%", compute: "271 core-h", note: "Recommended path to 97% projected closure." },
  ];
  return (
    <Card
      title="Coverage Improvement Planner"
      subtitle="Predicted improvement — not measured. Select a strategy to preview."
      icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {options.map((o) => {
          const active = option === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onOption(o.id)}
              className={`text-left rounded border p-3 transition ${
                active ? "border-indigo-400 bg-indigo-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Option {o.id}</div>
                <span className="text-[10px] font-mono text-indigo-700">{o.improvement}</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{o.label}</div>
              <div className="mt-1 text-[11px] font-mono text-slate-700">{o.scope}</div>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">Runtime {o.runtime} · Compute {o.compute}</div>
              <div className="mt-1 text-[11px] text-slate-600 leading-snug">{o.note}</div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded border border-indigo-200 bg-indigo-50/40 p-2 text-[11px] text-slate-700">
        <span className="font-semibold">Selected: Option {option}.</span> Predicted current 94% → projected <span className="font-mono">{option === "A" ? "96.0%" : option === "B" ? "96.5%" : option === "C" ? "95.0%" : "97.8%"}</span>. Predicted improvement is an estimate and is not a substitute for measured coverage.
      </div>
    </Card>
  );
}

function TraceabilityGraph() {
  const nodes = [
    { x: 40,  y: 40,  label: "Requirement", sub: "REQ DDMAC 142" },
    { x: 200, y: 40,  label: "Test",        sub: "test_desc_length_at_max" },
    { x: 360, y: 40,  label: "Assertion",   sub: "p_max_legal_length_accepted" },
    { x: 520, y: 40,  label: "Coverage Bin", sub: "cvp_len_at_max" },
    { x: 680, y: 40,  label: "Formal",      sub: "p_max_legal_length_accepted" },
    { x: 360, y: 130, label: "Regression",  sub: "REG-2026-07-21-0042" },
    { x: 520, y: 130, label: "Approval",    sub: "Verification Lead" },
  ];
  const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 5], [5, 6], [4, 6]];
  return (
    <Card
      title="Requirement → Approval Traceability"
      subtitle="Interactive path from requirement to human approval"
      icon={<ClipboardList className="w-4 h-4 text-indigo-600" />}
    >
      <div className="overflow-x-auto">
        <svg viewBox="0 0 760 200" className="w-full h-[200px]">
          {edges.map(([a, b], i) => (
            <line key={i} x1={nodes[a].x + 60} y1={nodes[a].y + 20} x2={nodes[b].x + 20} y2={nodes[b].y + 20} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#arrow)" />
          ))}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
            </marker>
          </defs>
          {nodes.map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={n.y} width={140} height={40} rx={6} fill="#ffffff" stroke="#c7d2fe" />
              <text x={n.x + 8} y={n.y + 14} fontSize={10} fill="#4338ca" fontWeight={600}>{n.label}</text>
              <text x={n.x + 8} y={n.y + 30} fontSize={9} fill="#334155" fontFamily="monospace">{n.sub}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
        {["Zoom", "Expand", "Collapse", "Filter", "Export"].map((a) => (
          <button key={a} className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50">{a}</button>
        ))}
      </div>
    </Card>
  );
}

function AiEvidencePanel() {
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 shadow-sm">
      <div className="px-4 py-3 border-b border-indigo-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-700" />
        <div className="text-sm font-semibold text-slate-900">AI Readiness Evidence</div>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-indigo-700">Advisory</span>
      </div>
      <div className="p-4 text-xs text-slate-800 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Recommendation</div>
          <div className="text-slate-800">
            Coverage is sufficient for targeted closure activities. Eight additional simulations and five formal proofs are expected to eliminate most remaining engineering risk.
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-rose-700">Highest-risk gaps</div>
          <ul className="mt-0.5 space-y-0.5 text-[11px] font-mono">
            <li>· Boundary transition (REQ DDMAC 142)</li>
            <li>· Privilege × reset (REQ SEC 088)</li>
            <li>· Concurrent error handling (REQ DDMAC 148)</li>
            <li>· Error timing (REQ DDMAC 143 · blocked)</li>
            <li>· Security recovery (REQ SEC 089)</li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Expected coverage improvement</div>
          <div className="mt-1 flex items-center gap-3">
            <div className="font-mono text-slate-900">Current 94%</div>
            <div className="text-slate-400">→</div>
            <div className="font-mono text-indigo-700">Projected 97%</div>
          </div>
          <div className="mt-1 h-2 rounded bg-slate-100 overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: "94%" }} />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 italic">Predicted — not measured.</div>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          AVEP does not approve exclusions, close coverage, or advance signoff. Qualified engineering leadership retains authority.
        </p>
      </div>
    </div>
  );
}

function ExclusionsPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Proposed Exclusions</div>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">Verification Lead only</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        <table className="w-full text-[11px] font-mono">
          <thead className="text-[10px] uppercase text-slate-500 sticky top-0 bg-white">
            <tr className="text-left border-b border-slate-200">
              <th className="py-1 px-3">Bin</th>
              <th>Reason</th>
              <th>Reviewer</th>
              <th>Status</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {EXCLUSIONS.map((e) => (
              <tr key={e.bin} className="border-b border-slate-100">
                <td className="px-3 py-1 text-slate-900">{e.bin}</td>
                <td className="text-slate-700">{e.reason}</td>
                <td className="text-slate-600">{e.reviewer.split(" ")[0]}</td>
                <td>
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] ${
                      e.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : e.status === "In Review"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="text-slate-600">{e.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-slate-100">
        {["Approve", "Reject", "Request evidence"].map((a) => (
          <button key={a} className="text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50">{a}</button>
        ))}
      </div>
    </div>
  );
}

function AuthoritiesPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600" />
        <div className="text-sm font-semibold text-slate-900">Human Review</div>
      </div>
      <ul className="divide-y divide-slate-100 text-xs">
        {AUTHORITIES.map((r) => (
          <li key={r.role} className="px-4 py-2 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">{r.role}</div>
              <div className="text-[11px] font-mono text-slate-600">{r.owner}</div>
            </div>
            <span
              className={`text-[10px] uppercase tracking-wide font-mono px-1.5 py-0.5 rounded ${
                r.status === "Confirmed"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoverageDrawer({ row, onClose }: { row: MatrixRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button className="flex-1 bg-slate-900/20" onClick={onClose} aria-label="Close" />
      <div className="w-full max-w-md bg-white border-l border-slate-200 shadow-xl overflow-y-auto">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.req}</div>
            <div className="text-[11px] text-slate-500 font-mono">{row.type} · {row.module}</div>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-900"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <Info label="Current" value={`${row.pct}%`} />
            <Info label="Reachability" value={row.reachable} />
            <Info label="Cause" value={row.cause} />
            <Info label="Status" value={row.status} />
            <Info label="Owner" value={row.owner} />
            <Info label="Predicted Δ" value={row.improvement} />
          </div>
          <Section title="Gap">
            <p className="text-slate-700">{row.gap}</p>
          </Section>
          <Section title="Requirement text">
            <p className="text-slate-700">Ref: {row.req}. Full text is available in the Requirements Workspace. Ambiguity findings flow into the Requirements Review Quality Workspace.</p>
          </Section>
          <Section title="Recommendation">
            <p className="text-slate-700">{row.recommendation}</p>
          </Section>
          <Section title="Covered / uncovered bins">
            <ul className="font-mono text-[11px] space-y-0.5">
              <li>· cvp_{row.req.toLowerCase().replace(/\s+/g, "_")}_below_max — <span className="text-emerald-700">covered</span></li>
              <li>· cvp_{row.req.toLowerCase().replace(/\s+/g, "_")}_at_max — <span className={row.pct >= 95 ? "text-emerald-700" : "text-rose-700"}>{row.pct >= 95 ? "covered" : "uncovered"}</span></li>
              <li>· cvp_{row.req.toLowerCase().replace(/\s+/g, "_")}_above_max — <span className="text-emerald-700">covered</span></li>
            </ul>
          </Section>
          <Section title="Historical trend">
            <div className="flex items-end gap-1 h-16">
              {[62, 71, 78, 84, 88, 91, row.pct].map((v, i) => (
                <div key={i} className="flex-1 bg-indigo-200 rounded-t" style={{ height: `${v}%` }} title={`W${i + 1}: ${v}%`} />
              ))}
            </div>
          </Section>
          <Section title="Actions">
            <div className="flex flex-wrap gap-1.5">
              {["Generate test", "Recommend formal", "Propose exclusion", "Request clarification"].map((a) => (
                <button key={a} className="text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50">{a}</button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{title}</div>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-slate-900">{value}</div>
    </div>
  );
}

function Metric({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: "ok" | "warn" }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`${mono ? "font-mono" : "font-semibold"} text-sm ${tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function ActionBtn({ children, variant, disabled }: { children: React.ReactNode; variant?: "primary"; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={`text-xs px-3 py-1.5 rounded border font-medium ${
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
          : variant === "primary"
          ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
