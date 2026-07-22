/**
 * AVEP Canonical Dataset
 * ----------------------
 * Single source of truth for every page in the AI VLSI Engineering Platform.
 * Every KPI, name, ID, and narrative element on any AVEP page should originate
 * here so the story stays coherent across the ~20 workspaces.
 *
 * Anchor scenario (realistic, engineering-grounded, no AI slop):
 *   Program  : Aegis-240 — next-gen NGFW dataplane ASIC, 5nm, TO-Q4-2026
 *   IP block : DDMAC   — Distributed Descriptor MAC / DMA controller with
 *                        credit-based ring buffer, 512-bit AXI4, 1 GHz target
 *   Headline : REQ-DDMAC-142 — ring producer/consumer pointer invariant on
 *                              wrap boundary under sustained back-pressure
 *   Defect   : DEF-DDMAC-317 — committed_head advances past uncommitted
 *                              descriptor when fetch_inflight is asserted
 *                              across a 64+ cycle back-pressure window
 *   Formal   : P_RING_HEAD_INVARIANT counter-example @ cycle 4832
 *   Fix      : gate committed_head update on !fetch_inflight
 *
 * Values below are realistic ranges for a mature IP entering coverage closure
 * ~6-8 weeks before RTL freeze. Do not swap in aspirational numbers.
 */

// ---------- Program, portfolio, ownership ----------------------------------

export const PROGRAM = {
  id: "PRG-AEGIS-240",
  codename: "Aegis-240",
  product: "NGFW-DP ASIC (dataplane, 5nm)",
  node: "TSMC N5",
  targetFreqGhz: 1.0,
  dieAreaMm2: 148.6,
  tapeoutTarget: "2026-11-14",
  rtlFreezeTarget: "2026-09-04",
  currentPhase: "Phase 2 — Build & Verify (coverage closure)",
  weeksToRtlFreeze: 7,
} as const;

export const IP = {
  id: "IP-DDMAC",
  name: "DDMAC",
  fullName: "Distributed Descriptor MAC / DMA controller",
  bus: "AXI4, 512-bit data, 40-bit address",
  clockDomains: ["core_clk (1.0 GHz)", "axi_clk (800 MHz)", "mgmt_clk (200 MHz)"],
  gateCountK: 412,     // ~412K gates, plausible for a DMA+MAC block
  sramInstances: 6,
  sramTotalKb: 512,
  owner: "Marcus Chen",
} as const;

export const PEOPLE = {
  verificationLead: { id: "priya.nair",   name: "Priya Nair",       role: "Verification Lead" },
  rtlOwner:         { id: "marcus.chen",  name: "Marcus Chen",      role: "RTL Engineer, DDMAC" },
  programManager:   { id: "elena.rodriguez", name: "Elena Rodriguez", role: "Program Manager" },
  signoffOwner:     { id: "david.park",   name: "David Park",       role: "Signoff Owner" },
  architect:        { id: "raj.venkat",   name: "Raj Venkataraman", role: "Lead Architect" },
  formalOwner:      { id: "yuki.tanaka",  name: "Yuki Tanaka",      role: "Formal Verification" },
  cdcOwner:         { id: "anna.schmidt", name: "Anna Schmidt",     role: "CDC / STA" },
  governance:       { id: "leah.osei",    name: "Leah Osei",        role: "Governance Reviewer" },
} as const;

// ---------- Headline requirement / defect / property ----------------------

export const HEADLINE_REQ = {
  id: "REQ-DDMAC-142",
  title:
    "Producer/consumer ring pointer invariant on wrap boundary under sustained back-pressure",
  category: "Functional / data integrity",
  priority: "P0",
  source: "Architecture Spec §4.7.3, DDMAC MAS v2.1",
  rationale:
    "committed_head must not advance past an uncommitted descriptor when the AXI read channel is stalled ≥ 64 cycles across the ring wrap boundary.",
  status: "verifying",
  linkedTests: ["tb_ring_wrap_boundary_edge", "tb_backpressure_soak", "tb_credit_starvation"],
  linkedFormal: "P_RING_HEAD_INVARIANT",
  linkedCoverBins: ["cg_ring_wrap.cross_bp_ge_64", "cg_ring_wrap.cross_bp_ge_128"],
} as const;

export const HEADLINE_DEFECT = {
  id: "DEF-DDMAC-317",
  title: "committed_head advances during fetch_inflight on ring wrap boundary",
  severity: "critical",
  state: "root-caused, fix in review",
  discoveredBy: "nightly_regression, run 4471",
  discoveredAt: "2026-07-14T15:24:11Z",
  requirementId: "REQ-DDMAC-142",
  moduleId: "rtl/ring_manager.sv",
  failingCycle: 4832,
  reproSeed: "0x7a3f2911",
  waveWindow: "cycles 4780-4880",
  proposedFix:
    "gate committed_head <= producer_head_q update on !fetch_inflight in ring_manager.sv:412",
  reviewer: PEOPLE.rtlOwner.id,
} as const;

// ---------- Modules ---------------------------------------------------------

export const MODULES = [
  { id: "ddmac_top",       parent: null,          gatesK: 412, owner: "marcus.chen" },
  { id: "ring_manager",    parent: "ddmac_top",   gatesK:  38, owner: "marcus.chen" },
  { id: "descriptor_fetch",parent: "ddmac_top",   gatesK:  52, owner: "marcus.chen" },
  { id: "axi_master",      parent: "ddmac_top",   gatesK:  74, owner: "sam.iyer"    },
  { id: "credit_ctl",      parent: "ddmac_top",   gatesK:  19, owner: "marcus.chen" },
  { id: "mac_pipe",        parent: "ddmac_top",   gatesK: 168, owner: "raj.venkat"  },
  { id: "csr_block",       parent: "ddmac_top",   gatesK:  22, owner: "anna.schmidt"},
  { id: "err_agg",         parent: "ddmac_top",   gatesK:  11, owner: "priya.nair"  },
  { id: "sram_ctl",        parent: "ddmac_top",   gatesK:  28, owner: "marcus.chen" },
] as const;

// ---------- Requirements register (small, realistic slice) ------------------

export const REQUIREMENTS = [
  { id: "REQ-DDMAC-142", title: HEADLINE_REQ.title, category: "Data integrity", priority: "P0", status: "verifying" },
  { id: "REQ-DDMAC-118", title: "AXI read channel back-pressure recovery ≤ 32 cycles from stall release", category: "Performance", priority: "P1", status: "passed" },
  { id: "REQ-DDMAC-131", title: "Descriptor cache line eviction preserves partial-write ordering", category: "Data integrity", priority: "P0", status: "passed" },
  { id: "REQ-DDMAC-154", title: "Credit counter saturation on link partner reset without over-issue", category: "Functional", priority: "P1", status: "verifying" },
  { id: "REQ-DDMAC-160", title: "SBR (secondary bus reset) drains inflight descriptors within 4 µs", category: "Reset / init", priority: "P1", status: "verifying" },
  { id: "REQ-DDMAC-171", title: "ECC single-bit error on descriptor RAM auto-corrects without pipeline stall", category: "RAS", priority: "P1", status: "passed" },
  { id: "REQ-DDMAC-188", title: "core_clk ↔ axi_clk CDC handshake meets 3-flop synchronizer + gray-code invariant", category: "CDC", priority: "P0", status: "passed" },
  { id: "REQ-DDMAC-201", title: "Power-gating exit restores CSR shadow state deterministically", category: "Power", priority: "P2", status: "planned" },
] as const;

// ---------- Regression / coverage / KPIs -----------------------------------
// Realistic ranges for a block ~7 weeks from RTL freeze, closing coverage.

export const REGRESSION = {
  suite: "nightly_regression",
  run:   4471,
  runAt: "2026-07-14T02:14:00Z",
  totalTests: 8412,
  pass:  8237,
  fail:    128,
  abort:    47,
  passRatePct: 97.9,
  wallClockH: 6.4,
  computeCoreH: 1180,
  simulator: "Synopsys VCS 2025.06-SP1",
  seed: "0x7a3f2911",
  failureClusters: [
    { id: "fc-ring-boundary", label: "ring wrap boundary race",       count: 41, defectId: "DEF-DDMAC-317" },
    { id: "fc-credit-underflow", label: "credit_ctl underflow on SBR",count:  9, defectId: "DEF-DDMAC-322" },
    { id: "fc-scoreboard-drift", label: "TB scoreboard drift (flake)",count: 12, defectId: null },
  ],
} as const;

export const COVERAGE = {
  functionalPct: 94.6,
  codeLinePct:   96.1,
  codeToggle:    91.2,
  fsmPct:        97.4,
  branchPct:     93.8,
  gate:          95.0,          // closure threshold
  updatedAt:     "2026-07-14T04:00:00Z",
  binsTotal:     3184,
  binsHit:       3013,
  binsHoles:      171,
  criticalHoles: [
    { bin: "cg_ring_wrap.cross_bp_ge_64",  hits: 0, priority: "P0", owner: "priya.nair" },
    { bin: "cg_ring_wrap.cross_bp_ge_128", hits: 0, priority: "P0", owner: "priya.nair" },
    { bin: "cg_credit.underflow_sbr",       hits: 2, priority: "P1", owner: "marcus.chen" },
    { bin: "cg_ecc.dbe_axi_master",         hits: 0, priority: "P1", owner: "raj.venkat"  },
  ],
} as const;

export const FORMAL = {
  propertiesTotal: 94,
  proved: 87,
  covered: 4,
  failed: 1,
  running: 2,
  soloRuntimeH: 42.1,
  headlineProperty: {
    name: "P_RING_HEAD_INVARIANT",
    module: "ring_manager",
    status: "failed",
    counterExampleCycle: 4832,
    depth: 128,
    engine: "JasperGold BMC",
  },
} as const;

export const CDC = {
  scheme: "3-flop synchronizer + gray-code pointer crossings",
  crossingsTotal: 214,
  proven: 214,
  waived: 0,
  violations: 0,
  tool: "Synopsys SpyGlass CDC 2025.03",
} as const;

export const LINT = {
  tool: "Synopsys SpyGlass Lint",
  errors: 0,
  warnings: 3,           // waived, documented
  waivedWarnings: 3,
  waiverOwner: "marcus.chen",
} as const;

export const STA_POWER = {
  targetFreqGhz: 1.0,
  wnsPs: -12,            // slightly negative, being closed
  tnsPs: -84,
  worstPathThrough: "ring_manager → axi_master → descriptor_fetch",
  dynamicPowerMw: 1420,
  leakageMw: 187,
  status: "in-closure",
} as const;

// ---------- Sign-off gates -------------------------------------------------

export const SIGNOFF_GATES = [
  { id: "G-REQ",     name: "Requirements closure",       state: "green",  owner: "elena.rodriguez",
    criteria: "All P0/P1 requirements linked to passing tests or proved properties." },
  { id: "G-FUNC",    name: "Functional coverage ≥ 95%",   state: "yellow", owner: "priya.nair",
    criteria: "Functional coverage ≥ 95% with zero P0 holes." },
  { id: "G-CODE",    name: "Code coverage (line/branch/FSM ≥ 90%)", state: "green", owner: "priya.nair",
    criteria: "Line ≥ 95%, branch ≥ 90%, FSM ≥ 95%." },
  { id: "G-FORMAL",  name: "Formal property closure",     state: "yellow", owner: "yuki.tanaka",
    criteria: "All P0 properties proved or bounded-proof depth ≥ 128 with waiver." },
  { id: "G-CDC",     name: "CDC clean",                   state: "green",  owner: "anna.schmidt",
    criteria: "All crossings synchronized; zero unwaived violations." },
  { id: "G-LINT",    name: "Lint clean",                  state: "green",  owner: "marcus.chen",
    criteria: "Zero errors; warnings waived with justification." },
  { id: "G-STA",     name: "STA @ 1.0 GHz",               state: "yellow", owner: "anna.schmidt",
    criteria: "WNS ≥ 0 ps at signoff corner (ss_0p72v_125c)." },
  { id: "G-PWR",     name: "Power within budget",         state: "yellow", owner: "raj.venkat",
    criteria: "Dynamic ≤ 1.6 W, leakage ≤ 0.25 W at typ corner." },
  { id: "G-RAS",     name: "RAS / ECC coverage",          state: "green",  owner: "raj.venkat",
    criteria: "ECC injection tests pass; DBE reported through err_agg." },
  { id: "G-DOC",     name: "Documentation & release package", state: "yellow", owner: "elena.rodriguez",
    criteria: "MAS, IAS, test plan, coverage report, waivers, release notes." },
] as const;

// ---------- Milestones -----------------------------------------------------

export const MILESTONES = [
  { id: "MS-SPEC-FROZEN",   name: "Micro-arch spec frozen",         date: "2026-04-30", status: "done" },
  { id: "MS-RTL-V1",         name: "RTL v1.0 (feature-complete)",    date: "2026-06-01", status: "done" },
  { id: "MS-COV-90",         name: "Functional coverage ≥ 90%",      date: "2026-06-28", status: "done" },
  { id: "MS-COV-95",         name: "Functional coverage ≥ 95%",      date: "2026-07-25", status: "at-risk" },
  { id: "MS-FORMAL-CLEAN",   name: "Formal P0 properties proved",    date: "2026-07-30", status: "at-risk" },
  { id: "MS-RTL-FREEZE",     name: "RTL freeze",                     date: "2026-09-04", status: "planned" },
  { id: "MS-PD-INTAKE",      name: "Physical-design intake",         date: "2026-09-11", status: "planned" },
  { id: "MS-TAPEOUT",        name: "Tape-out",                       date: "2026-11-14", status: "planned" },
] as const;

// ---------- Timeline scenarios (T0..T3) ------------------------------------
// These drive the "scenario" selector used across the End-to-End Story and
// several workspaces. Values here are what pages should show at each T.

export const SCENARIOS = {
  T0: { id: "T0", label: "Baseline (2026-07-01)", passRatePct: 96.4, funcCovPct: 91.8, openP0: 0, headlineDefect: null,
        note: "Before DEF-DDMAC-317 surfaced. Coverage climb on schedule." },
  T1: { id: "T1", label: "Defect surfaced (2026-07-14)", passRatePct: 97.9, funcCovPct: 94.6, openP0: 1, headlineDefect: HEADLINE_DEFECT.id,
        note: "Nightly run 4471 clusters 41 fails on ring wrap boundary. AI flags RC hypothesis." },
  T2: { id: "T2", label: "Root cause confirmed (2026-07-16)", passRatePct: 97.9, funcCovPct: 94.6, openP0: 1, headlineDefect: HEADLINE_DEFECT.id,
        note: "Formal P_RING_HEAD_INVARIANT counter-example @ cycle 4832 confirms hypothesis." },
  T3: { id: "T3", label: "Fix validated (2026-07-20)", passRatePct: 99.4, funcCovPct: 95.3, openP0: 0, headlineDefect: null,
        note: "Fix merged. Directed regression + formal re-run clean. Coverage crosses 95% gate." },
} as const;

export type ScenarioKey = keyof typeof SCENARIOS;

// ---------- AI reasoning artifact (used by governance / diagnosis pages) ---

export const AI_ANALYSIS = {
  id: "ai-ring-boundary-rc",
  trigger: `Failure cluster ${REGRESSION.failureClusters[0].id} on ${REGRESSION.suite} run ${REGRESSION.run}`,
  facts: [
    "41/128 failures share signature: mismatch on consumer_head vs scoreboard.expected at wrap boundary.",
    "All failing seeds exhibit fetch_inflight=1 for ≥ 64 cycles preceding the mismatch.",
    "cg_ring_wrap.cross_bp_ge_64 was hit for the first time by these seeds.",
  ],
  hypothesis:
    "committed_head is updated on every posedge clk regardless of fetch_inflight, allowing the consumer pointer to advance past a descriptor whose payload has not yet been written back.",
  confidence: 0.86,
  band: "high" as const,
  evidence: [
    "waveform: cycles 4820-4840, ring_manager.committed_head advances while fetch_inflight=1",
    "code: rtl/ring_manager.sv:412 (unconditional register update)",
    "spec: DDMAC MAS §4.7.3 requires update only when descriptor commit is complete",
  ],
  recommendation:
    "Gate committed_head update on !fetch_inflight. Add directed test tb_ring_wrap_boundary_edge with bp_window ∈ {64, 96, 128}.",
  humanReviewer: PEOPLE.verificationLead.id,
  approvalStatus: "approved" as const,
} as const;

// ---------- Small helpers --------------------------------------------------

export const KPI_TILES = [
  { label: "Functional coverage", value: `${COVERAGE.functionalPct}%`, target: `${COVERAGE.gate}%`, tone: "yellow" as const },
  { label: "Pass rate (nightly)",  value: `${REGRESSION.passRatePct}%`, target: "≥ 99%",             tone: "yellow" as const },
  { label: "Open P0 defects",      value: "1",                          target: "0",                  tone: "red"    as const },
  { label: "Formal P0 open",       value: `${FORMAL.failed}`,           target: "0",                  tone: "yellow" as const },
  { label: "WNS @ 1.0 GHz",        value: `${STA_POWER.wnsPs} ps`,      target: "≥ 0 ps",             tone: "yellow" as const },
  { label: "Weeks to RTL freeze",  value: `${PROGRAM.weeksToRtlFreeze}`,target: "≥ 6",                tone: "green"  as const },
] as const;

export const CANONICAL = {
  PROGRAM, IP, PEOPLE, HEADLINE_REQ, HEADLINE_DEFECT, MODULES, REQUIREMENTS,
  REGRESSION, COVERAGE, FORMAL, CDC, LINT, STA_POWER, SIGNOFF_GATES,
  MILESTONES, SCENARIOS, AI_ANALYSIS, KPI_TILES,
} as const;

export default CANONICAL;
