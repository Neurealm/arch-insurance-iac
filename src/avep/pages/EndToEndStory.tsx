import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw, Download, ExternalLink,
  ChevronRight, CheckCircle2, AlertTriangle, Clock, Sparkles, ShieldCheck,
  FileText, GitBranch, Activity, Layers, FlaskConical, Target, Package,
  Gavel, Users, Cpu, Code2, ClipboardList, BadgeCheck, X, Info, Circle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P4.DEMO.001 — End-to-End Engineering Decision Story            */
/* Route: /avep/demo/end-to-end-story                                  */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";
type Audience = "Executive" | "Engineering Leadership" | "Deep Engineering";
type Persona =
  | "RTL Design Lead"
  | "Verification Lead"
  | "Formal Lead"
  | "IP Architect"
  | "Engineering Executive"
  | "Physical-Design Intake Lead";
type EvidenceState =
  | "Approved" | "Generated" | "Verified" | "Failed" | "Corrected"
  | "Validated" | "Conditional" | "Pending Approval";

interface Chapter {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  question: string;
  evidence: string[];
  aiContribution: string;
  humanAuthority: string;
  keyDecision: string;
  outcome: string;
  deepLink: { label: string; path: string }[];
  narrationExec: string;
  narrationEng: string;
  narrationDeep: string;
  duration: number; // seconds
  keyRecord?: { id: string; text: string };
  codeSample?: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1, code: "CH01", title: "Engineering Intent",
    subtitle: "Define What Must Be Built",
    question: "What controlled engineering intent are we implementing?",
    evidence: ["Program context locked", "Requirement REQ-DDMAC-142 approved", "Clarification queue clear", "Requirement quality 96%"],
    aiContribution: "Extracts, normalizes, and rates requirement quality; drafts clarifications.",
    humanAuthority: "IP Architect approves engineering intent.",
    keyDecision: "Requirement is approved as controlled input to design and verification.",
    outcome: "184 of 186 requirements traced; 2 pending clarification.",
    deepLink: [{ label: "Open Requirements Intake", path: "/avep/requirements" }],
    narrationExec: "AVEP begins with controlled engineering intent, not an isolated AI prompt.",
    narrationEng: "AVEP ingests, normalizes, and rates requirement quality; the IP Architect approves engineering intent as the controlled input.",
    narrationDeep: "REQ-DDMAC-142 enters through the requirements intake pipeline, is normalized into a controlled record, receives an AI quality score of 96%, and is manually approved by the IP Architect before any downstream artifact is generated.",
    duration: 45,
    keyRecord: { id: "REQ-DDMAC-142", text: "The descriptor engine shall reject descriptors whose payload length exceeds the configured maximum transfer length." },
  },
  {
    id: 2, code: "CH02", title: "Traceability & Specification",
    subtitle: "Convert Intent into Connected Engineering Objects",
    question: "Which specification, architecture, register, interface, and verification objects link to this requirement?",
    evidence: ["Spec §4.3.2 linked", "Arch block: Descriptor Validator", "Register MAX_XFER_LEN", "AXI, APB interfaces", "VO-DDMAC-142-A/B/C"],
    aiContribution: "Proposes traceability links; detects orphaned requirements and dead ends.",
    humanAuthority: "Verification Lead confirms verification objectives coverage.",
    keyDecision: "Trace graph accepted with 0 orphans on critical path.",
    outcome: "Every downstream artifact remains linked to the source requirement.",
    deepLink: [{ label: "Open Traceability Workspace", path: "/avep/specification" }],
    narrationExec: "AVEP builds a connected engineering graph so no decision is made in isolation.",
    narrationEng: "REQ-DDMAC-142 links to specification section 4.3.2, the Descriptor Validator architecture block, the MAX_XFER_LEN register, AXI/APB interfaces, and three verification objectives.",
    narrationDeep: "Traceability graph resolves REQ→SPEC§4.3.2→ARCH.DescValidator→REG.MAX_XFER_LEN→IF.AXI/APB→VO-DDMAC-142-{A,B,C}. Zero orphaned objects on the critical path.",
    duration: 50,
  },
  {
    id: 3, code: "CH03", title: "Architecture & Contracts",
    subtitle: "Define Logical Behavior and Boundaries",
    question: "What logical architecture, interfaces, registers, clocks, and resets govern this behavior?",
    evidence: ["Descriptor validation FSM", "AXI4 master + APB slave", "Register model rev 3.2", "CDC domains: aclk/pclk"],
    aiContribution: "Summarizes architecture, cross-checks register model against spec.",
    humanAuthority: "IP Architect owns the architecture contract.",
    keyDecision: "Architecture and interface contracts baselined for design and verification.",
    outcome: "Controlled inputs to RTL and verification construction.",
    deepLink: [{ label: "Open Logical Architecture", path: "/avep/architecture" }],
    narrationExec: "Architecture becomes a controlled contract, not free-form documentation.",
    narrationEng: "The descriptor validation state machine, AXI/APB interfaces, register model, and clock/reset domains are baselined as controlled contracts.",
    narrationDeep: "FSM {IDLE→VALIDATE→ACCEPT|REJECT}, AXI4 master issuing descriptor fetches, APB slave for MAX_XFER_LEN, aclk (400MHz) → pclk (100MHz) CDC on config path.",
    duration: 55,
  },
  {
    id: 4, code: "CH04", title: "RTL Proposal",
    subtitle: "Generate and Review Proposed RTL",
    question: "Does the proposed RTL correctly encode the requirement?",
    evidence: ["Generated RTL delta 42 lines", "Baseline: rtl_baseline_3.2.18", "Requirement annotations attached", "Assumptions declared"],
    aiContribution: "Proposes traceable RTL with inline requirement citations.",
    humanAuthority: "RTL Design Lead accepts, modifies, or rejects the proposal.",
    keyDecision: "RTL delta accepted into review branch. Not yet committed to baseline.",
    outcome: "Traceable RTL proposal ready for change-impact and static checks.",
    deepLink: [{ label: "Open RTL Generation Studio", path: "/avep/design/rtl-generation" }],
    narrationExec: "AVEP proposes traceable RTL, but qualified engineers accept, modify, or reject it.",
    narrationEng: "AVEP proposes a 42-line RTL delta with inline requirement citations. The RTL Design Lead retains authority to accept or reject.",
    narrationDeep: "assign length_error = desc_valid && (desc_length > max_transfer_length); referenced against REQ-DDMAC-142. Note: the initially proposed comparator will be revisited in Chapter 8.",
    duration: 60,
    codeSample: "assign length_error =\n    desc_valid &&\n    (desc_length > max_transfer_length);",
  },
  {
    id: 5, code: "CH05", title: "Change Impact",
    subtitle: "Predict the Engineering Blast Radius",
    question: "What is affected downstream if we accept this RTL change?",
    evidence: ["8 modules touched", "3 interfaces", "1 register", "12 properties", "47 tests", "6 coverage bins", "2 docs", "+4.2K core-hrs compute"],
    aiContribution: "Computes cross-artifact blast radius and proportionate validation scope.",
    humanAuthority: "RTL Lead + Verification Lead approve validation scope.",
    keyDecision: "Proportionate re-run scope agreed.",
    outcome: "A small RTL change can create effects far beyond the changed lines.",
    deepLink: [{ label: "Open Change Impact", path: "/avep/design/change-impact" }],
    narrationExec: "Blast-radius intelligence prevents surprise rework and hidden compute cost.",
    narrationEng: "Change impact spans 8 modules, 12 properties, 47 tests, 6 coverage bins, and about 4.2K core-hours of proportionate compute.",
    narrationDeep: "Impact graph traversal: rtl_baseline_3.2.18 → {ddmac_descriptor_validator, ddmac_length_check, ddmac_axi_master, ...} → 12 SVA properties, 47 tests (34 directed + 13 random), 6 covergroups.",
    duration: 55,
  },
  {
    id: 6, code: "CH06", title: "Verification Construction",
    subtitle: "Build the Verification Strategy",
    question: "Is the verification environment sufficient and trustworthy?",
    evidence: ["UVM env dv_env_2.4", "Drivers/monitors/scoreboards generated", "Reference model reused", "12 assertions", "6 covergroups", "Checker trust: 87%"],
    aiContribution: "Accelerates env construction, cross-checks scoreboard against reference model.",
    humanAuthority: "Verification Lead approves checker trust as a separate gate.",
    keyDecision: "Environment approved for regression with 2 checker refinements tracked.",
    outcome: "AVEP accelerates verification construction while treating checker trust as a separate engineering gate.",
    deepLink: [
      { label: "Open Env Builder", path: "/avep/verification/environment-builder" },
      { label: "Open Test Factory", path: "/avep/verification/test-factory" },
    ],
    narrationExec: "Verification build is compressed, but the trust in the checkers is treated as a separate approval.",
    narrationEng: "UVM environment dv_env_2.4 is generated with driver, monitor, scoreboard, reference model, 12 assertions, and 6 covergroups. Checker trust is separately reviewed.",
    narrationDeep: "dv_env_2.4: uvm_agent(AXI), uvm_agent(APB), scoreboard w/ ref model ddmac_ref_model, 12 SVA (incl. p_length_boundary), 6 covergroups (cg_len_boundary cross max_xfer_len × desc_length).",
    duration: 65,
  },
  {
    id: 7, code: "CH07", title: "Regression Degradation",
    subtitle: "Detect Material Failure",
    question: "Where is the real engineering problem in this regression?",
    evidence: ["Pass rate 94.2% → 71.8%", "398 raw failures", "37 clusters", "Infra: 142 filtered", "4 high-risk clusters"],
    aiContribution: "Deduplicates and clusters failures; separates infra noise from engineering signal.",
    humanAuthority: "Verification Lead prioritizes clusters for triage.",
    keyDecision: "FC-031 elevated as primary engineering failure cluster.",
    outcome: "AVEP converts regression noise into prioritized engineering evidence.",
    deepLink: [{ label: "Open Simulation Operations", path: "/avep/verification/simulation-operations" }],
    narrationExec: "AVEP turns a wall of red failures into a small list of prioritized engineering problems.",
    narrationEng: "REG-2026-07-24-0068 pass rate fell to 71.8%. 398 raw failures cluster into 37 groups; 4 are high risk. FC-031, the descriptor maximum-length boundary cluster, is primary.",
    narrationDeep: "Cluster FC-031: 88 failures, signature test_desc_len_boundary_* seeds {*}, all hit scoreboard mismatch at descriptor.length == max_transfer_length. Infra clusters (LSF timeouts, license) filtered.",
    duration: 60,
  },
  {
    id: 8, code: "CH08", title: "Failure Diagnosis",
    subtitle: "Trace the Symptom to the First Divergence",
    question: "Where does the actual behavior first diverge from the expected behavior?",
    evidence: ["Failing test: test_desc_len_boundary_017", "Seed: 0xA3F2C118", "Assertion p_length_boundary fails", "First divergence: −3 cycles before scoreboard mismatch", "Formal counterexample confirms path", "Prior defect DEF-DV-181 similar"],
    aiContribution: "Correlates test, seed, waveform, log, assertion, RTL, requirement, commit, formal CE, and prior defect. Ranks hypotheses.",
    humanAuthority: "RTL Lead and Verification Lead confirm root cause.",
    keyDecision: "Leading hypothesis: inclusive boundary comparator in length check.",
    outcome: "The scoreboard mismatch is the visible symptom. The first meaningful divergence occurs earlier in the RTL comparison.",
    deepLink: [{ label: "Open Failure Diagnosis", path: "/avep/verification/failure-diagnosis" }],
    narrationExec: "AVEP finds the true origin of the failure, not just its visible symptom.",
    narrationEng: "AVEP correlates the failing test, seed, waveform, assertion, RTL path, requirement, recent commit, formal counterexample, and prior defect. It identifies the first meaningful divergence three cycles before the scoreboard failure. The RTL and verification leads retain root-cause authority.",
    narrationDeep: "First divergence at t=1284ns: length_error deasserted when desc_length == max_transfer_length. Expected per REQ-DDMAC-142: reject when exceeds (>). Actual RTL uses (>=). Formal CE from p_length_boundary confirms. DEF-DV-181 shows analogous boundary defect in Queue Manager IP.",
    duration: 90,
  },
  {
    id: 9, code: "CH09", title: "Controlled Correction",
    subtitle: "Review a Bounded Fix",
    question: "What is the smallest evidence-supported correction, and who approves it?",
    evidence: ["Current: (desc_length >= max_transfer_length)", "Proposed: (desc_length > max_transfer_length)", "Impact re-computed", "2 alternatives rejected", "Validation plan generated"],
    aiContribution: "Proposes the smallest correction and required validation. Does not apply or commit.",
    humanAuthority: "RTL Lead approves; commit remains a human action.",
    keyDecision: "Correction accepted into review branch, pending validation.",
    outcome: "AI proposes the smallest evidence-supported correction but does not apply or commit it.",
    deepLink: [{ label: "Open Change Impact", path: "/avep/design/change-impact" }],
    narrationExec: "AI proposes a bounded correction; humans keep authority to commit.",
    narrationEng: "AVEP proposes replacing (>=) with (>) in the length comparator. It also enumerates two alternatives and explains why they are inferior. The RTL Lead approves the correction; commit remains a human action.",
    narrationDeep: "Diff: -assign length_error = desc_valid && (desc_length >= max_transfer_length); +assign length_error = desc_valid && (desc_length > max_transfer_length); Alternatives (parameterized inclusive/exclusive mode; masking desc_length) rejected: excess surface area, no requirement support.",
    duration: 60,
    codeSample: "- (desc_length >= max_transfer_length)\n+ (desc_length > max_transfer_length)",
  },
  {
    id: 10, code: "CH10", title: "Validation & Closure",
    subtitle: "Prove the Correction and Close Remaining Gaps",
    question: "Does proportionate validation confirm the correction and close residual gaps?",
    evidence: ["Targeted test suite: 34/34 pass", "Formal property proven bounded", "Static rerun clean", "Dependent regression 100%", "Coverage 98.7% → 99.4%"],
    aiContribution: "Assembles proportionate validation scope and reconciles evidence.",
    humanAuthority: "Formal Lead approves property evidence; Verification Lead approves closure.",
    keyDecision: "Validation sufficient; residual conditions logged.",
    outcome: "A passing targeted test is necessary but not sufficient. The change must survive proportionate downstream validation.",
    deepLink: [
      { label: "Open Coverage Closure", path: "/avep/readiness/coverage-closure" },
      { label: "Open Simulation Operations", path: "/avep/verification/simulation-operations" },
    ],
    narrationExec: "The fix is proven proportionate to its blast radius, not just to the failing test.",
    narrationEng: "Targeted tests, a bounded formal property, static rerun, and dependent regression all pass. Coverage advances from 98.7% to 99.4%.",
    narrationDeep: "p_length_boundary proven bounded (depth 24). test_desc_len_boundary_{001..034} all pass. Static: 0 new criticals. Regression REG-2026-07-25-0071 100% on affected tests. Covergroup cg_len_boundary now 100%.",
    duration: 70,
  },
  {
    id: 11, code: "CH11", title: "Signoff Evidence & Package",
    subtitle: "Assemble the Readiness Case",
    question: "Is the front-end evidence sufficient, reconciled, and reproducible?",
    evidence: ["14 readiness gates: 12 closed, 2 conditional", "Defects: 0 blocking", "Waivers: 3 approved", "Package DDMAC_FE_PACKAGE_3.2_RC2 assembled", "Reproducibility hash verified"],
    aiContribution: "Reconciles evidence across sources; assembles package manifest with provenance.",
    humanAuthority: "Release Authority approves the package.",
    keyDecision: "Recommendation: Conditional Go.",
    outcome: "AVEP explains the exact basis for Go, Conditional Go, or Hold.",
    deepLink: [
      { label: "Open Signoff Readiness", path: "/avep/readiness/signoff" },
      { label: "Open Release Package", path: "/avep/readiness/release-package" },
    ],
    narrationExec: "The decision has a clear, reconciled basis, not a slide of green checks.",
    narrationEng: "12 of 14 readiness gates are closed; 2 are conditional. No blocking defects. The package DDMAC_FE_PACKAGE_3.2_RC2 is assembled with verified reproducibility.",
    narrationDeep: "Gates: Engineering Intent (4/4), Verification Evidence (4/4), Defect & Risk (3/4 – 1 conditional on checker refinement), Package & Handoff (1/2 – 1 pending known-limitations ack). Manifest sha256 verified against artifact store.",
    duration: 75,
  },
  {
    id: 12, code: "CH12", title: "Advancement Decision",
    subtitle: "Decide Whether to Enter Physical Design",
    question: "Is the front-end package ready to enter controlled physical-design intake?",
    evidence: ["Validated package present", "3 open conditions", "Residual risks accepted", "Downstream owners assigned", "6 of 8 human approvals complete"],
    aiContribution: "Presents evidence, recommendation, and open conditions.",
    humanAuthority: "Engineering Executive authorizes advancement; Physical-Design Lead accepts handoff.",
    keyDecision: "Conditionally Ready for Physical-Design Intake.",
    outcome: "Front-end readiness authorizes intake, not tapeout, fabrication, or physical signoff.",
    deepLink: [{ label: "Open Physical-Design Intake", path: "/avep/readiness/physical-design-intake" }],
    narrationExec: "Front-end readiness authorizes intake, nothing further.",
    narrationEng: "AVEP recommends Conditionally Ready for physical-design intake with three bounded conditions. Six of eight human approvals are complete.",
    narrationDeep: "Open conditions: (1) error-timing assumption acknowledgment; (2) checker refinement follow-up on p_length_boundary_v2; (3) known-limitations acceptance for descriptor prefetch corner. Pending approvals: Release Authority, Physical-Design Lead.",
    duration: 60,
  },
];

/* ---------- Evidence trail ---------- */
interface TrailNode { id: string; label: string; artifact: string; state: EvidenceState; chapter: number; }
const TRAIL: TrailNode[] = [
  { id: "n1",  label: "REQ-DDMAC-142",           artifact: "Requirement",       state: "Approved",         chapter: 1 },
  { id: "n2",  label: "SPEC §4.3.2",              artifact: "Specification",     state: "Approved",         chapter: 2 },
  { id: "n3",  label: "Descriptor Validator",     artifact: "Architecture",      state: "Approved",         chapter: 3 },
  { id: "n4",  label: "MAX_XFER_LEN",             artifact: "Register",          state: "Approved",         chapter: 3 },
  { id: "n5",  label: "ddmac_descriptor_validator", artifact: "RTL Module",       state: "Corrected",        chapter: 9 },
  { id: "n6",  label: "p_length_boundary",        artifact: "Assertion",         state: "Verified",         chapter: 10 },
  { id: "n7",  label: "test_desc_len_boundary_*", artifact: "Boundary Test",     state: "Verified",         chapter: 10 },
  { id: "n8",  label: "cg_len_boundary",          artifact: "Coverage Bin",      state: "Verified",         chapter: 10 },
  { id: "n9",  label: "FC-031",                    artifact: "Regression Cluster",state: "Failed",           chapter: 7 },
  { id: "n10", label: "DEF-DV-219",                artifact: "Defect",            state: "Corrected",        chapter: 9 },
  { id: "n11", label: "RTL Correction Δ42",        artifact: "Proposed Change",   state: "Validated",        chapter: 9 },
  { id: "n12", label: "Validation Bundle",         artifact: "Validation",        state: "Validated",        chapter: 10 },
  { id: "n13", label: "DV Report",                 artifact: "Report",            state: "Approved",         chapter: 11 },
  { id: "n14", label: "DDMAC_FE_PACKAGE_3.2_RC2",  artifact: "Package Manifest",  state: "Conditional",      chapter: 11 },
  { id: "n15", label: "Intake Condition Register", artifact: "Handoff",           state: "Pending Approval", chapter: 12 },
];

const AUDIENCES: Audience[] = ["Executive", "Engineering Leadership", "Deep Engineering"];
const PERSONAS: Persona[] = [
  "RTL Design Lead", "Verification Lead", "Formal Lead",
  "IP Architect", "Engineering Executive", "Physical-Design Intake Lead",
];

const SCENARIO_META: Record<Scenario, { label: string; decision: string; passRate: string; evComplete: number; approvals: string; note: string; tone: string }> = {
  T0: { label: "Baseline Green",                       decision: "Ready",                              passRate: "99.6%", evComplete: 100, approvals: "8 of 8", note: "Normal controlled lifecycle.",           tone: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  T1: { label: "Regression Degradation",               decision: "Hold",                               passRate: "71.8%", evComplete: 62,  approvals: "3 of 8", note: "Failures uncorrelated; no root cause.", tone: "bg-red-50 border-red-200 text-red-700" },
  T2: { label: "AI-Assisted Engineering Decision",     decision: "Conditionally Ready",                passRate: "94.9%", evComplete: 97,  approvals: "6 of 8", note: "Primary demonstration scenario.",       tone: "bg-amber-50 border-amber-200 text-amber-700" },
  T3: { label: "Fix Validated & Intake Authorized",    decision: "Ready for Physical-Design Intake",  passRate: "99.9%", evComplete: 100, approvals: "8 of 8", note: "Completed governed journey.",           tone: "bg-emerald-50 border-emerald-200 text-emerald-700" },
};

const STATE_STYLES: Record<EvidenceState, string> = {
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Generated: "bg-sky-50 text-sky-700 border-sky-200",
  Verified: "bg-blue-50 text-blue-700 border-blue-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Corrected: "bg-violet-50 text-violet-700 border-violet-200",
  Validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Conditional: "bg-amber-50 text-amber-700 border-amber-200",
  "Pending Approval": "bg-neutral-100 text-neutral-700 border-neutral-300",
};

export default function EndToEndStory() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [audience, setAudience] = useState<Audience>("Engineering Leadership");
  const [persona, setPersona] = useState<Persona>("Verification Lead");
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [narration, setNarration] = useState(true);
  const [showEvidence, setShowEvidence] = useState(true);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [trailNode, setTrailNode] = useState<TrailNode | null>(null);

  const active = CHAPTERS[activeIdx];
  const scenarioData = SCENARIO_META[scenario];

  // autoplay
  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => {
      setCompleted((s) => new Set(s).add(active.id));
      if (activeIdx < CHAPTERS.length - 1) setActiveIdx((i) => i + 1);
      else setAutoplay(false);
    }, Math.max(4500, active.duration * 60)); // scaled
    return () => clearTimeout(t);
  }, [autoplay, activeIdx, active]);

  const totalRemaining = useMemo(
    () => CHAPTERS.slice(activeIdx).reduce((a, c) => a + c.duration, 0),
    [activeIdx]
  );

  const narrationText =
    audience === "Executive" ? active.narrationExec :
    audience === "Engineering Leadership" ? active.narrationEng :
    active.narrationDeep;

  // Persona emphasis — highlight matching chapters
  const personaFocus: Record<Persona, number[]> = {
    "RTL Design Lead": [4, 5, 9],
    "Verification Lead": [6, 7, 8, 10],
    "Formal Lead": [8, 10],
    "IP Architect": [1, 2, 3],
    "Engineering Executive": [11, 12],
    "Physical-Design Intake Lead": [11, 12],
  };
  const focusSet = new Set(personaFocus[persona]);

  const reset = () => {
    setActiveIdx(0);
    setCompleted(new Set());
    setAutoplay(false);
  };

  const exportSummary = () => {
    const payload = {
      program: "StrataShield Secure Processing SoC",
      ip: "DDMAC Packet Movement Engine",
      revision: "DDMAC 3.2",
      scenario, audience, persona,
      decision: scenarioData.decision,
      evidenceCompleteness: scenarioData.evComplete,
      approvals: scenarioData.approvals,
      chaptersCompleted: Array.from(completed),
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `avep-story-${scenario}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Context strip */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] font-mono text-neutral-600">
          <span><span className="text-neutral-400">Program</span> StrataShield Secure Processing SoC</span>
          <span><span className="text-neutral-400">IP</span> DDMAC Packet Movement Engine</span>
          <span><span className="text-neutral-400">Rev</span> DDMAC 3.2</span>
          <span><span className="text-neutral-400">RTL</span> rtl_baseline_3.2.18</span>
          <span><span className="text-neutral-400">DV</span> dv_env_2.4</span>
          <span><span className="text-neutral-400">Regression</span> REG-2026-07-24-0068</span>
          <span><span className="text-neutral-400">Package</span> DDMAC_FE_PACKAGE_3.2_RC2</span>
          <span className="ml-auto text-neutral-500">Context: Controlled</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[11px] font-mono text-neutral-500 tracking-wider">AVEP.P4.DEMO.001 · PHASE 4 — DEMONSTRATION, STORYTELLING & OPTIMIZATION</div>
            <h1 className="text-2xl font-semibold mt-1">End-to-End Engineering Decision Story</h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-3xl">
              Follow one controlled engineering change from requirement intent through RTL, verification, failure diagnosis, closure,
              signoff evidence, and physical-design intake.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAutoplay((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs hover:bg-neutral-800">
              {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {autoplay ? "Pause" : "Start Guided Story"}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 text-xs hover:bg-neutral-50">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button onClick={exportSummary} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 text-xs hover:bg-neutral-50">
              <Download className="h-3.5 w-3.5" /> Export Summary
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
          {[
            { l: "Story Progress", v: `${activeIdx + 1} / 12` },
            { l: "Audience", v: audience },
            { l: "Scenario", v: `${scenario} · ${scenarioData.label}` },
            { l: "Decision", v: scenarioData.decision },
            { l: "Requirements Traced", v: "184 / 186" },
            { l: "Failure Cluster", v: "FC-031" },
            { l: "Evidence Completeness", v: `${scenarioData.evComplete}%` },
            { l: "Human Approvals", v: scenarioData.approvals },
          ].map((k) => (
            <div key={k.l} className="rounded-md border border-neutral-200 bg-white px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-neutral-500">{k.l}</div>
              <div className="text-sm font-medium mt-0.5 truncate">{k.v}</div>
            </div>
          ))}
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <SelectBar label="Audience Mode" value={audience} options={AUDIENCES} onChange={(v) => setAudience(v as Audience)} />
          <SelectBar label="Scenario" value={scenario} options={["T0", "T1", "T2", "T3"] as Scenario[]}
            onChange={(v) => setScenario(v as Scenario)}
            renderOption={(v) => `${v} · ${SCENARIO_META[v as Scenario].label}`} />
          <SelectBar label="Persona" value={persona} options={PERSONAS} onChange={(v) => setPersona(v as Persona)} />
        </div>
        <div className={`mt-2 text-xs rounded-md border px-3 py-1.5 inline-block ${scenarioData.tone}`}>
          Scenario note — {scenarioData.note}
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1600px] mx-auto px-6 pb-6 grid grid-cols-12 gap-4">
        {/* Story Journey */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-4">
            <div className="text-[11px] font-mono text-neutral-500 mb-2">STORY JOURNEY · 12 CHAPTERS</div>
            <ol className="space-y-1">
              {CHAPTERS.map((c, i) => {
                const isActive = i === activeIdx;
                const done = completed.has(c.id);
                const focus = focusSet.has(c.id);
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveIdx(i)}
                      className={`w-full text-left rounded-md border px-2.5 py-2 flex items-start gap-2 transition
                        ${isActive ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white hover:bg-neutral-50"}
                        ${focus && !isActive ? "ring-1 ring-amber-300" : ""}`}
                    >
                      <div className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-mono
                        ${isActive ? "bg-white text-neutral-900" : done ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : c.id}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[10px] font-mono ${isActive ? "text-neutral-300" : "text-neutral-500"}`}>{c.code}</div>
                        <div className="text-xs font-medium leading-tight">{c.title}</div>
                        <div className={`text-[10px] mt-0.5 ${isActive ? "text-neutral-300" : "text-neutral-500"}`}>{c.subtitle}</div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Active Chapter Canvas */}
        <section className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-neutral-500">{active.code} · Chapter {active.id} of 12</div>
                <h2 className="text-lg font-semibold mt-0.5">{active.title}</h2>
                <div className="text-sm text-neutral-600">{active.subtitle}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="h-3.5 w-3.5" /> {active.duration}s
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-md bg-neutral-50 border border-neutral-200 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-0.5">Engineering Question</div>
                <div className="text-sm">{active.question}</div>
              </div>

              {active.keyRecord && (
                <div className="rounded-md border border-neutral-200 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-0.5">Key Record</div>
                  <div className="text-xs font-mono text-neutral-500">{active.keyRecord.id}</div>
                  <div className="text-sm mt-0.5">"{active.keyRecord.text}"</div>
                </div>
              )}

              {active.codeSample && (
                <pre className="text-[12px] font-mono bg-neutral-900 text-neutral-100 rounded-md p-3 overflow-x-auto">
{active.codeSample}
                </pre>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Panel icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />} label="Current Evidence">
                  <ul className="space-y-1 text-sm">
                    {active.evidence.map((e) => (
                      <li key={e} className="flex items-start gap-1.5">
                        <Circle className="h-2 w-2 mt-1.5 shrink-0 fill-neutral-400 text-neutral-400" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel icon={<Sparkles className="h-3.5 w-3.5 text-violet-600" />} label="AI Contribution">
                  <div className="text-sm">{active.aiContribution}</div>
                </Panel>
                <Panel icon={<Users className="h-3.5 w-3.5 text-sky-600" />} label="Human Authority">
                  <div className="text-sm">{active.humanAuthority}</div>
                </Panel>
                <Panel icon={<Gavel className="h-3.5 w-3.5 text-amber-600" />} label="Key Decision">
                  <div className="text-sm">{active.keyDecision}</div>
                </Panel>
              </div>

              <div className="rounded-md border border-neutral-200 px-3 py-2 bg-emerald-50/40">
                <div className="text-[10px] uppercase tracking-wide text-emerald-700 mb-0.5">Outcome</div>
                <div className="text-sm text-neutral-800">{active.outcome}</div>
              </div>

              {narration && (
                <div className="rounded-md border border-neutral-200 px-3 py-2 bg-neutral-50">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-0.5">Presenter Narration · {audience}</div>
                  <div className="text-sm italic text-neutral-700">"{narrationText}"</div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {active.deepLink.map((d) => (
                  <Link key={d.path} to={d.path} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 text-xs hover:bg-neutral-50">
                    <ExternalLink className="h-3.5 w-3.5" /> {d.label}
                  </Link>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                    disabled={activeIdx === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs disabled:opacity-40 hover:bg-neutral-50"
                  >
                    <SkipBack className="h-3.5 w-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => {
                      setCompleted((s) => new Set(s).add(active.id));
                      setActiveIdx((i) => Math.min(CHAPTERS.length - 1, i + 1));
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-900 text-white text-xs hover:bg-neutral-800"
                  >
                    Mark & Next <SkipForward className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome scorecard shown at chapter 12 */}
          {activeIdx === CHAPTERS.length - 1 && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-white">
              <div className="px-5 py-3 border-b border-neutral-200 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <div className="text-sm font-semibold">Outcome Scorecard</div>
                <span className="ml-auto text-[10px] font-mono text-neutral-500">Measured vs. Estimated shown separately</span>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreBlock title="Engineering Outcomes" items={[
                  ["Requirement traceability", "98.9%", "measured"],
                  ["Debug-time improvement", "38%", "estimated"],
                  ["Coverage convergence", "24% faster", "estimated"],
                  ["Compute avoided", "8,700 core-hrs", "estimated"],
                  ["Duplicate triage avoided", "221 jobs", "measured"],
                  ["Doc drift findings", "6", "measured"],
                  ["Evidence completeness", "97%", "measured"],
                  ["Reproducibility", "Demonstrated", "measured"],
                ]} />
                <ScoreBlock title="Governance Outcomes" items={[
                  ["Human approvals preserved", "Yes", "measured"],
                  ["Autonomous code commit", "None", "measured"],
                  ["Autonomous waiver approval", "None", "measured"],
                  ["Autonomous signoff", "None", "measured"],
                  ["AI lineage complete", "Yes", "measured"],
                  ["Reusable lesson created", "Yes", "measured"],
                ]} />
                <ScoreBlock title="Business Outcomes" items={[
                  ["Decision speed", "Improved", "estimated"],
                  ["Avoidable rework", "Reduced", "estimated"],
                  ["Closure predictability", "Improved", "estimated"],
                  ["Compute efficiency", "Improved", "estimated"],
                  ["Advancement evidence", "Improved", "measured"],
                  ["Institutional knowledge", "Reusable", "measured"],
                  ["Handoff risk", "Reduced", "estimated"],
                ]} />
              </div>

              <div className="border-t border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold mb-1">What AVEP Did</div>
                  <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
                    <li>Preserved controlled engineering context</li>
                    <li>Connected requirement intent to implementation and proof</li>
                    <li>Separated infrastructure noise from engineering failures</li>
                    <li>Identified the first divergence</li>
                    <li>Ranked evidence-backed hypotheses</li>
                    <li>Proposed a bounded correction</li>
                    <li>Defined proportionate validation</li>
                    <li>Reconciled signoff evidence</li>
                    <li>Preserved human authority</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1">What AVEP Did Not Do</div>
                  <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
                    <li>Approve requirements</li>
                    <li>Accept RTL autonomously</li>
                    <li>Commit code</li>
                    <li>Approve a waiver</li>
                    <li>Close a defect</li>
                    <li>Approve signoff</li>
                    <li>Authorize tapeout</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-neutral-200 p-5">
                <div className="text-xs font-semibold mb-1">Engineering Learning Closure</div>
                <div className="text-sm text-neutral-700">
                  Lesson — <span className="italic">Verify below, equal to, and above every programmable boundary.</span>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {["Directed sequence", "Random boundary weighting", "Coverage cross", "Formal property", "Code-review checklist", "Requirement-quality check"].map((r) => (
                    <div key={r} className="rounded border border-neutral-200 px-2 py-1.5 bg-neutral-50">{r}</div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  Reused in: DDMAC 3.3 · Queue Manager IP · Packet Buffer IP · Credit Controller IP
                </div>
                <Link to="/avep/governance/ai-value" className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md border border-neutral-300 text-xs hover:bg-neutral-50">
                  <ExternalLink className="h-3.5 w-3.5" /> Open AI Governance & Learning
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Right rail: Evidence Trail + Decision Panel */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          {/* Decision panel */}
          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <div className="text-sm font-semibold">Current Engineering Decision</div>
            </div>
            <div className="p-4">
              <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${scenarioData.tone}`}>
                <AlertTriangle className="h-3.5 w-3.5" /> {scenarioData.decision}
              </div>

              <div className="mt-3 text-[11px] font-mono text-neutral-500">WHY</div>
              <ul className="text-xs text-neutral-700 space-y-1 mt-1 list-disc pl-4">
                <li>Requirements and architecture are approved</li>
                <li>RTL correction is validated</li>
                <li>Static, formal, regression, coverage evidence reconciled</li>
                <li>Package provenance and reproducibility complete</li>
                <li>No blocking front-end defect remains</li>
                <li>Three bounded conditions remain</li>
              </ul>

              <div className="mt-3 text-[11px] font-mono text-neutral-500">OPEN CONDITIONS</div>
              <ul className="text-xs space-y-1 mt-1">
                {["Error-timing assumption acknowledgment", "Checker refinement follow-up", "Known-limitations acceptance"].map((c) => (
                  <li key={c} className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 text-[11px] font-mono text-neutral-500">HUMAN AUTHORITY</div>
              <ul className="text-xs space-y-1 mt-1">
                {[
                  ["RTL Lead", "confirms correction"],
                  ["Verification Lead", "confirms validation"],
                  ["Formal Lead", "approves property evidence"],
                  ["Release Authority", "approves package"],
                  ["Physical-Design Lead", "accepts handoff"],
                  ["Engineering Executive", "authorizes advancement"],
                ].map(([r, a]) => (
                  <li key={r} className="flex items-start gap-1.5">
                    <Users className="h-3 w-3 mt-0.5 text-sky-500 shrink-0" />
                    <span><span className="font-medium">{r}</span> — {a}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 rounded-md bg-neutral-50 border border-neutral-200 px-2.5 py-2">
                <div className="text-[10px] uppercase tracking-wide text-neutral-500">Boundary</div>
                <div className="text-[11px] text-neutral-700 mt-0.5">
                  Does not authorize physical timing signoff, DRC/LVS, GDS release, tapeout, fabrication, packaging, or silicon release.
                </div>
              </div>
            </div>
          </div>

          {/* Evidence trail */}
          {showEvidence && (
            <div className="rounded-lg border border-neutral-200 bg-white">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-neutral-600" />
                <div className="text-sm font-semibold">Evidence Trail</div>
                <button onClick={() => setShowEvidence(false)} className="ml-auto text-neutral-400 hover:text-neutral-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <ol className="p-3 space-y-1 max-h-[540px] overflow-auto">
                {TRAIL.map((n, i) => {
                  const isActive = n.chapter === active.id;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => setTrailNode(n)}
                        className={`w-full text-left rounded-md border px-2.5 py-1.5 flex items-center gap-2 text-xs
                          ${isActive ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                      >
                        <div className="h-4 w-4 rounded-full bg-neutral-100 flex items-center justify-center text-[9px] font-mono text-neutral-600">{i + 1}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-mono truncate">{n.label}</div>
                          <div className="text-[10px] text-neutral-500">{n.artifact}</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATE_STYLES[n.state]}`}>{n.state}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </aside>
      </div>

      {/* Presenter controls */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="rounded-full border border-neutral-200 bg-white shadow-lg px-3 py-2 flex items-center gap-1.5">
          <button onClick={() => setActiveIdx((i) => Math.max(0, i - 1))} className="p-1.5 rounded-full hover:bg-neutral-100" title="Previous chapter">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setAutoplay((v) => !v)} className="p-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800" title={autoplay ? "Pause" : "Play"}>
            {autoplay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setActiveIdx((i) => Math.min(CHAPTERS.length - 1, i + 1))} className="p-1.5 rounded-full hover:bg-neutral-100" title="Next chapter">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <div className="mx-2 text-[11px] font-mono text-neutral-500">
            Ch {active.id}/12 · ~{Math.ceil(totalRemaining / 60)}m left
          </div>
          <button onClick={() => setNarration((v) => !v)} className={`px-2 py-1 rounded-full text-[10px] border ${narration ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600"}`} title="Toggle narration">
            Narration
          </button>
          <button onClick={() => setShowEvidence((v) => !v)} className={`px-2 py-1 rounded-full text-[10px] border ${showEvidence ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 text-neutral-600"}`} title="Toggle evidence trail">
            Evidence
          </button>
          <button onClick={reset} className="p-1.5 rounded-full hover:bg-neutral-100" title="Reset">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Evidence drawer */}
      {trailNode && (
        <div className="fixed inset-0 z-50 bg-black/30 flex justify-end" onClick={() => setTrailNode(null)}>
          <div className="w-[420px] bg-white h-full border-l border-neutral-200 p-5 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono text-neutral-500">{trailNode.artifact}</div>
              <button onClick={() => setTrailNode(null)} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
            </div>
            <h3 className="text-lg font-semibold font-mono mt-1">{trailNode.label}</h3>
            <div className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] mt-2 ${STATE_STYLES[trailNode.state]}`}>{trailNode.state}</div>
            <div className="mt-4 text-xs text-neutral-600">
              Introduced in Chapter {trailNode.chapter} — {CHAPTERS[trailNode.chapter - 1].title}.
            </div>
            <div className="mt-3 rounded-md border border-neutral-200 px-3 py-2 text-xs">
              <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">Story Message</div>
              {CHAPTERS[trailNode.chapter - 1].outcome}
            </div>
            <button
              onClick={() => { setActiveIdx(trailNode.chapter - 1); setTrailNode(null); }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs hover:bg-neutral-800"
            >
              Jump to Chapter <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function SelectBar({
  label, value, options, onChange, renderOption,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  renderOption?: (v: string) => string;
}) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`text-[11px] px-2 py-1 rounded border ${value === o ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}
          >
            {renderOption ? renderOption(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Panel({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-neutral-200 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function ScoreBlock({ title, items }: { title: string; items: [string, string, "measured" | "estimated"][] }) {
  return (
    <div>
      <div className="text-xs font-semibold mb-1">{title}</div>
      <ul className="space-y-1">
        {items.map(([k, v, t]) => (
          <li key={k} className="flex items-center justify-between text-xs border-b border-neutral-100 py-1">
            <span className="text-neutral-600">{k}</span>
            <span className="flex items-center gap-2">
              <span className="font-medium">{v}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${t === "measured" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600 border-neutral-200"}`}>
                {t}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
