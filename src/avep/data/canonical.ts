/**
 * AVEP Canonical Dataset
 * ----------------------
 * Single source of truth for every page in the AI VLSI Engineering Platform.
 * Values here are derived from what already exists across the AVEP page set,
 * normalized into one coherent scenario so cross-page references reconcile.
 *
 * Anchor scenario (real, engineering-grounded):
 *   IP        : DDMAC descriptor engine (descriptor validator + ring manager,
 *               AXI4 dataplane, credit-based descriptor ring).
 *   Baseline  : rtl_3.2.18 on branch feature/descriptor-ring-fix off release/2.4.
 *   Headline  : REQ-DDMAC-142 — reject descriptors whose payload length
 *               EXCEEDS the configured max_transfer_length (equal is legal).
 *   Defect    : DEF-DV-219 — inclusive comparison (>=) in
 *               ddmac_descriptor_validator.sv:157 rejected the legal
 *               boundary case (length == max). Historical DEF-DV-181 was an
 *               analogous boundary defect in Queue Manager IP, lesson carried
 *               forward.
 *   Formal    : p_max_legal_length_accepted / p_length_boundary counter-
 *               example on JasperGold BMC.
 *   Fix       : change `>=` to `>` and add directed boundary-cross coverage;
 *               regression + formal both clean at run 4471.
 *   Open item : REQ-DDMAC-143 error-timing assertion — 2-cycle deassertion
 *               semantics ambiguous, spec clarification pending.
 *
 * Numbers reflect a block ~6-8 weeks from RTL freeze, closing coverage.
 */

// ---------- Program, IP, ownership ----------------------------------------

export const PROGRAM = {
  id: "PRG-DDMAC-3.2",
  codename: "DDMAC 3.2",
  product: "Dataplane ASIC (descriptor engine subsystem)",
  node: "TSMC N5",
  targetFreqGhz: 1.0,
  dieAreaMm2: 148.6,
  tapeoutTarget: "2026-11-14",
  rtlFreezeTarget: "2026-09-04",
  currentPhase: "Phase 2 — Build & Verify (coverage closure)",
  weeksToRtlFreeze: 7,
  baseline: "REQ-BL-DDMAC-3.2",
} as const;

export const IP = {
  id: "IP-DDMAC",
  name: "DDMAC",
  fullName: "Descriptor Engine (validator + ring manager, AXI4 dataplane)",
  bus: "AXI4, 512-bit data, 40-bit address",
  clockDomains: ["core_clk (1.0 GHz)", "axi_clk (800 MHz)", "mgmt_clk (200 MHz)"],
  gateCountK: 412,
  sramInstances: 6,
  sramTotalKb: 512,
  anchorRtlFile: "rtl/ddmac_descriptor_validator.sv",
  anchorLine: 157,
  ipVersion: "3.2.18",
} as const;

export const PEOPLE = {
  verificationLead: { id: "sofia.rodriguez", name: "Sofia Rodriguez", role: "Verification Lead" },
  rtlOwner:         { id: "maya.chen",       name: "Maya Chen",       role: "RTL Design Lead" },
  formalOwner:      { id: "daniel.kim",      name: "Daniel Kim",      role: "Formal Verification" },
  architect:        { id: "arun.patel",      name: "Arun Patel",      role: "IP Architect" },
  programManager:   { id: "priya.shah",      name: "Priya Shah",      role: "Program Director" },
  releaseManager:   { id: "marcus.lee",      name: "Marcus Lee",      role: "Release & Config Manager" },
  cdcOwner:         { id: "aisha.rahman",    name: "Aisha Rahman",    role: "CDC / STA" },
  governance:       { id: "jordan.kim",      name: "Jordan Kim",      role: "AI Engineering Lead" },
} as const;

// ---------- Headline requirement / defect / property ----------------------

export const HEADLINE_REQ = {
  id: "REQ-DDMAC-142",
  title:
    "Reject descriptors whose payload length exceeds configured max_transfer_length",
  category: "Functional / data integrity",
  priority: "P0",
  source: "DDMAC MAS §4.7.3, Architecture Spec v3.2",
  rationale:
    "Comparison is strictly greater-than. A payload equal to the configured maximum is legal and must not be rejected.",
  status: "verifying",
  linkedTests: ["test_desc_len_boundary_017", "test_desc_len_max_soak", "test_desc_len_random"],
  linkedFormal: "p_max_legal_length_accepted",
  linkedCoverBins: ["cg_len_boundary.cross_at_max", "cg_len_boundary.cross_max_minus_1"],
} as const;

export const AMBIGUOUS_REQ = {
  id: "REQ-DDMAC-143",
  title: "Assert desc_error within two cycles of invalid-descriptor detection",
  status: "spec-clarification-pending",
  ambiguity:
    "Two-cycle window origin is not defined: from detection register update, or from descriptor arrival at the validator boundary. Downstream physical-design intake requires clarification before timing-constraint freeze.",
} as const;

export const HEADLINE_DEFECT = {
  id: "DEF-DV-219",
  title:
    "Inclusive comparison in ddmac_descriptor_validator rejects legal max-length descriptor",
  severity: "high",
  state: "Fix validated, closure approval pending",
  discoveredBy: "nightly_regression, run 4471",
  discoveredAt: "2026-07-14T15:24:11Z",
  requirementId: "REQ-DDMAC-142",
  moduleFile: "rtl/ddmac_descriptor_validator.sv",
  faultLine: 157,
  failingCycle: 18441,
  reproSeed: "0xA3F2C118",
  waveWindow: "cycles 18400-18480",
  rootCause:
    "Comparison operator was written as `length >= max_transfer_length` instead of `length > max_transfer_length`. The boundary case length == max was incorrectly rejected.",
  correction:
    "Change comparison to strictly greater-than; add cg_len_boundary cross-coverage on {max-1, max, max+1}; add directed test test_desc_len_boundary_017.",
  validation:
    "10k-seed nightly + directed boundary regression clean; formal p_max_legal_length_accepted proven.",
  cluster: "Boundary comparison",
  owner: PEOPLE.rtlOwner.id,
  closureAuthority: "RTL Design Lead",
  historicalAnalog: "DEF-DV-181 (Queue Manager IP, 2025) — analogous inclusive-boundary defect; lesson not carried forward to DDMAC at spec time.",
} as const;

// ---------- Modules ---------------------------------------------------------

export const MODULES = [
  { id: "ddmac_top",                 parent: null,          gatesK: 412, owner: "maya.chen" },
  { id: "ddmac_descriptor_validator",parent: "ddmac_top",   gatesK:  42, owner: "maya.chen" },
  { id: "ddmac_ref_model",           parent: "dv_env",      gatesK:   0, owner: "sofia.rodriguez", note: "UVM reference model" },
  { id: "ddmac_ring_mgr",            parent: "ddmac_top",   gatesK:  38, owner: "maya.chen" },
  { id: "ddmac_descriptor_fetch",    parent: "ddmac_top",   gatesK:  52, owner: "maya.chen" },
  { id: "ddmac_axi_master",          parent: "ddmac_top",   gatesK:  74, owner: "arun.patel" },
  { id: "ddmac_credit_ctl",          parent: "ddmac_top",   gatesK:  19, owner: "maya.chen" },
  { id: "ddmac_error_capture",       parent: "ddmac_top",   gatesK:  16, owner: "sofia.rodriguez" },
  { id: "ddmac_interrupt_logic",     parent: "ddmac_top",   gatesK:  12, owner: "sofia.rodriguez" },
  { id: "ddmac_csr_block",           parent: "ddmac_top",   gatesK:  22, owner: "aisha.rahman" },
  { id: "ddmac_descriptor_guard",    parent: "ddmac_top",   gatesK:   8, owner: "maya.chen", note: "Added in 3.2.15 for boundary check" },
  { id: "ddmac_sram_ctl",            parent: "ddmac_top",   gatesK:  28, owner: "maya.chen" },
] as const;

// ---------- Requirements register (realistic slice matching page IDs) ------

export const REQUIREMENTS = [
  { id: "REQ-DDMAC-142", title: HEADLINE_REQ.title, category: "Data integrity", priority: "P0", status: "verifying" },
  { id: "REQ-DDMAC-143", title: AMBIGUOUS_REQ.title, category: "Error handling", priority: "P0", status: "spec-clarification" },
  { id: "REQ-DDMAC-144", title: "Descriptor validator accepts multi-buffer descriptors up to 8 fragments", category: "Functional", priority: "P1", status: "passed" },
  { id: "REQ-DDMAC-145", title: "Error-capture register latches first fault; subsequent faults counted", category: "RAS", priority: "P1", status: "passed" },
  { id: "REQ-DDMAC-148", title: "Interrupt aggregation asserts within 3 cycles of first captured error", category: "Functional", priority: "P1", status: "passed" },
  { id: "REQ-DDMAC-155", title: "Ring wrap boundary preserves ordering under back-pressure ≥ 64 cycles", category: "Data integrity", priority: "P0", status: "passed" },
  { id: "REQ-DDMAC-170", title: "SBR (secondary bus reset) drains inflight descriptors within 4 µs", category: "Reset / init", priority: "P1", status: "verifying" },
  { id: "REQ-SEC-088",   title: "CSR access from non-secure master returns bus error, no side effect", category: "Security", priority: "P0", status: "passed" },
  { id: "REQ-SEC-089",   title: "Descriptor payload must not cross secure/non-secure boundary", category: "Security", priority: "P0", status: "passed" },
  { id: "REQ-SEC-090",   title: "Debug halt does not expose descriptor payload contents", category: "Security", priority: "P1", status: "passed" },
] as const;

// ---------- Regression / coverage / KPIs -----------------------------------

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
  seed: "0xA3F2C118",
  failureClusters: [
    { id: "fc-boundary-comparison", label: "descriptor length boundary (== max)", count: 41, defectId: "DEF-DV-219" },
    { id: "fc-credit-underflow",    label: "credit_ctl underflow on SBR",         count:  9, defectId: null },
    { id: "fc-scoreboard-drift",    label: "TB scoreboard ordering flake",        count: 12, defectId: null },
  ],
} as const;

export const COVERAGE = {
  functionalPct: 94.6,
  codeLinePct:   96.1,
  codeToggle:    91.2,
  fsmPct:        97.4,
  branchPct:     93.8,
  gate:          95.0,
  updatedAt:     "2026-07-14T04:00:00Z",
  binsTotal:     3184,
  binsHit:       3013,
  binsHoles:      171,
  criticalHoles: [
    { bin: "cg_len_boundary.cross_at_max",       hits: 0, priority: "P0", owner: "sofia.rodriguez" },
    { bin: "cg_len_boundary.cross_max_minus_1",  hits: 0, priority: "P0", owner: "sofia.rodriguez" },
    { bin: "cg_credit.underflow_sbr",            hits: 2, priority: "P1", owner: "maya.chen" },
    { bin: "cg_ecc.dbe_axi_master",              hits: 0, priority: "P1", owner: "arun.patel" },
  ],
} as const;

export const FORMAL = {
  propertiesTotal: 94,
  proved: 87,
  covered: 4,
  failed: 1,           // p_max_legal_length_accepted CEX (before fix); post-fix clean
  running: 2,
  soloRuntimeH: 42.1,
  tool: "Cadence JasperGold 2025.03",
  headlineProperty: {
    name: "p_max_legal_length_accepted",
    module: "ddmac_descriptor_validator",
    status: "cex-then-proven-post-fix",
    counterExampleCycle: 18441,
    depth: 128,
    engine: "JasperGold BMC",
  },
  blockedProperty: {
    name: "p_desc_error_2cycle",
    module: "ddmac_error_capture",
    status: "blocked-spec-ambiguity",
    requirementId: "REQ-DDMAC-143",
    reason: "Two-cycle deassertion window origin not defined in spec.",
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
  warnings: 3,
  waivedWarnings: 3,
  waiverOwner: PEOPLE.rtlOwner.id,
} as const;

// ---------- Physical-design intake data (was missing per audit) ------------

export const STA_POWER_AREA = {
  targetFreqGhz: 1.0,
  ssCorner: "ss_0p72v_125c",
  wnsPs: -12,
  tnsPs: -84,
  worstPathThrough: "ddmac_descriptor_validator → ddmac_ring_mgr → ddmac_axi_master",
  dynamicPowerMw: 1420,
  leakagePowerMw: 187,
  powerBudgetMw: 1600,
  areaEstimateMm2: 4.82,   // DDMAC block area contribution
  areaBudgetMm2: 5.10,
  gateCountK: 412,
  utilizationTarget: 0.72,
  status: "in-closure",
  owner: PEOPLE.cdcOwner.id,
} as const;

// ---------- Sign-off gates -------------------------------------------------

export const SIGNOFF_GATES = [
  { id: "G-REQ",     name: "Requirements closure",                    state: "green",  owner: "priya.shah",
    criteria: "All P0/P1 requirements linked to passing tests or proved properties." },
  { id: "G-FUNC",    name: "Functional coverage ≥ 95%",                state: "yellow", owner: "sofia.rodriguez",
    criteria: "Functional coverage ≥ 95% with zero P0 holes." },
  { id: "G-CODE",    name: "Code coverage (line/branch/FSM)",          state: "green",  owner: "sofia.rodriguez",
    criteria: "Line ≥ 95%, branch ≥ 90%, FSM ≥ 95%." },
  { id: "G-FORMAL",  name: "Formal property closure",                  state: "yellow", owner: "daniel.kim",
    criteria: "All P0 properties proved; p_desc_error_2cycle blocked pending REQ-DDMAC-143 clarification." },
  { id: "G-CDC",     name: "CDC clean",                                state: "green",  owner: "aisha.rahman",
    criteria: "All crossings synchronized; zero unwaived violations." },
  { id: "G-LINT",    name: "Lint clean",                               state: "green",  owner: "maya.chen",
    criteria: "Zero errors; warnings waived with justification." },
  { id: "G-STA",     name: "STA @ 1.0 GHz (ss_0p72v_125c)",             state: "yellow", owner: "aisha.rahman",
    criteria: "WNS ≥ 0 ps at signoff corner (currently −12 ps, closing)." },
  { id: "G-PWR",     name: "Power within budget (≤ 1.6 W dyn)",        state: "yellow", owner: "arun.patel",
    criteria: "Dynamic ≤ 1.6 W, leakage ≤ 0.25 W at typ corner." },
  { id: "G-DEF",     name: "Material defects dispositioned",           state: "yellow", owner: "maya.chen",
    criteria: "DEF-DV-219 fix validated, closure approval pending from RTL Design Lead." },
  { id: "G-DOC",     name: "Documentation & release package",          state: "yellow", owner: "priya.shah",
    criteria: "MAS, IAS, test plan, coverage report, waivers, release notes." },
] as const;

// ---------- Milestones -----------------------------------------------------

export const MILESTONES = [
  { id: "MS-SPEC-FROZEN",  name: "Micro-arch spec frozen",         date: "2026-04-30", status: "done" },
  { id: "MS-RTL-V1",        name: "RTL v1.0 (feature-complete)",    date: "2026-06-01", status: "done" },
  { id: "MS-COV-90",        name: "Functional coverage ≥ 90%",      date: "2026-06-28", status: "done" },
  { id: "MS-COV-95",        name: "Functional coverage ≥ 95%",      date: "2026-07-25", status: "at-risk" },
  { id: "MS-FORMAL-CLEAN",  name: "Formal P0 properties proved",    date: "2026-07-30", status: "at-risk" },
  { id: "MS-RTL-FREEZE",    name: "RTL freeze",                     date: "2026-09-04", status: "planned" },
  { id: "MS-PD-INTAKE",     name: "Physical-design intake",         date: "2026-09-11", status: "planned" },
  { id: "MS-TAPEOUT",       name: "Tape-out",                       date: "2026-11-14", status: "planned" },
] as const;

// ---------- Timeline scenarios (T0..T3) ------------------------------------

export const SCENARIOS = {
  T0: { id: "T0", label: "Baseline (2026-07-01)",         date: "2026-07-01", passRatePct: 96.4, funcCovPct: 91.8, openP0: 0, headlineDefect: null,
        note: "Before DEF-DV-219 surfaced. Coverage climb on schedule." },
  T1: { id: "T1", label: "Defect surfaced (2026-07-14)",   date: "2026-07-14", passRatePct: 97.9, funcCovPct: 94.6, openP0: 1, headlineDefect: HEADLINE_DEFECT.id,
        note: "Nightly run 4471 clusters 41 fails on descriptor length boundary. AI proposes root-cause hypothesis." },
  T2: { id: "T2", label: "Root cause confirmed (2026-07-16)", date: "2026-07-16", passRatePct: 97.9, funcCovPct: 94.6, openP0: 1, headlineDefect: HEADLINE_DEFECT.id,
        note: "Formal p_max_legal_length_accepted counter-example @ cycle 18441 confirms hypothesis. Fix drafted." },
  T3: { id: "T3", label: "Fix validated (2026-07-20)",     date: "2026-07-20", passRatePct: 99.4, funcCovPct: 95.3, openP0: 0, headlineDefect: null,
        note: "Fix merged (feature/descriptor-ring-fix @ a8c31f7). Regression + formal clean. Coverage crosses 95% gate." },
} as const;

export type ScenarioKey = keyof typeof SCENARIOS;

// ---------- AI reasoning artifact -----------------------------------------

export const AI_ANALYSIS = {
  id: "aia-104",
  trigger: `Failure cluster fc-boundary-comparison on ${REGRESSION.suite} run ${REGRESSION.run}`,
  facts: [
    "41 of 128 failures share signature: scoreboard.expected == ACCEPT, DUT emitted REJECT.",
    "All failing seeds exercise descriptor length == max_transfer_length exactly.",
    "cg_len_boundary.cross_at_max hit 0 times prior to this run.",
  ],
  hypothesis:
    "ddmac_descriptor_validator.sv:157 uses `length >= max_transfer_length` where the requirement is strict `>`. Boundary case length == max is a legal descriptor and must not be rejected.",
  confidence: 0.86,
  band: "high" as const,
  evidence: [
    "waveform: cycles 18420-18460, len_reject asserted while length == max_transfer_length",
    "code: rtl/ddmac_descriptor_validator.sv:157 (comparison operator)",
    "spec: DDMAC MAS §4.7.3 — 'exceeds' is strictly greater-than",
    "historical: DEF-DV-181 (2025, Queue Manager IP) — analogous inclusive-boundary defect",
  ],
  recommendation:
    "Change operator from `>=` to `>`. Add cg_len_boundary cross-coverage on {max−1, max, max+1}. Add directed test test_desc_len_boundary_017.",
  humanReviewer: PEOPLE.verificationLead.id,
  approvalStatus: "approved" as const,
} as const;

// ---------- KPI tiles ------------------------------------------------------

export const KPI_TILES = [
  { label: "Functional coverage", value: `${COVERAGE.functionalPct}%`, target: `${COVERAGE.gate}%`, tone: "yellow" as const },
  { label: "Pass rate (nightly)",  value: `${REGRESSION.passRatePct}%`, target: "≥ 99%",             tone: "yellow" as const },
  { label: "Open P0 defects",      value: "1",                          target: "0",                  tone: "red"    as const },
  { label: "Formal P0 open",       value: "1",                          target: "0",                  tone: "yellow" as const },
  { label: "WNS @ 1.0 GHz",        value: `${STA_POWER_AREA.wnsPs} ps`,  target: "≥ 0 ps",             tone: "yellow" as const },
  { label: "Weeks to RTL freeze",  value: `${PROGRAM.weeksToRtlFreeze}`, target: "≥ 6",                tone: "green"  as const },
] as const;

// ---------- Backwards-compat alias ----------------------------------------

export const STA_POWER = STA_POWER_AREA;

export const CANONICAL = {
  PROGRAM, IP, PEOPLE, HEADLINE_REQ, AMBIGUOUS_REQ, HEADLINE_DEFECT, MODULES,
  REQUIREMENTS, REGRESSION, COVERAGE, FORMAL, CDC, LINT, STA_POWER_AREA,
  STA_POWER, SIGNOFF_GATES, MILESTONES, SCENARIOS, AI_ANALYSIS, KPI_TILES,
} as const;

export default CANONICAL;
