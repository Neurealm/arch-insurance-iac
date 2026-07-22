import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Play,
  Download,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Package,
  FileText,
  GitBranch,
  Fingerprint,
  Search,
  Ban,
  Layers,
  ClipboardCheck,
  Handshake,
  Cpu,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P3.ADVANCE.001 — Physical-Design Intake Decision              */
/* Route: /avep/readiness/physical-design-intake                      */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";
type Decision = "Ready" | "Conditionally Ready" | "Not Ready";
type GateState =
  | "Closed"
  | "Closed with Conditions"
  | "Blocked"
  | "In Review"
  | "Evidence Missing"
  | "Approval Pending"
  | "Stale"
  | "Not Applicable";

interface Gate {
  id: string;
  group: "Engineering Intent" | "Verification Evidence" | "Defect & Risk Control" | "Package & Handoff";
  name: string;
  state: GateState;
  criteria: string[];
  evidence: string[];
  missing: string[];
  conditions: string[];
  dependencies: string[];
  owner: string;
  approver: string;
  lastEval: string;
  baselineCompat: "Compatible" | "Incompatible" | "Superseded";
  impact: string;
}

/* ---------- 14 intake gates ---------- */
const GATES: Gate[] = [
  { id: "G-01", group: "Engineering Intent", name: "Requirements baseline approved", state: "Closed", criteria: ["All requirements approved and versioned", "Traceability to architecture complete", "Ambiguity resolved"], evidence: ["REQ-BL-DDMAC-3.2", "trace_matrix_3.2.csv"], missing: [], conditions: [], dependencies: ["G-02"], owner: "Arun Patel", approver: "IP Architect", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Foundational for downstream constraints" },
  { id: "G-02", group: "Engineering Intent", name: "Architecture and interfaces approved", state: "Closed", criteria: ["Interface contracts approved", "Timing intent captured", "Power intent captured"], evidence: ["ARCH-BL-3.2", "interface_contracts_3.2.md"], missing: [], conditions: [], dependencies: ["G-03"], owner: "Arun Patel", approver: "IP Architect", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Bounds downstream floorplan and constraints" },
  { id: "G-03", group: "Engineering Intent", name: "RTL baseline accepted", state: "Closed", criteria: ["RTL frozen at accepted hash", "Hierarchy validated", "Dependencies included"], evidence: ["rtl_baseline_3.2.18", "hier_manifest.yaml"], missing: [], conditions: [], dependencies: ["G-04", "G-05"], owner: "Maya Chen", approver: "RTL Design Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Downstream netlist and constraint intake" },
  { id: "G-04", group: "Verification Evidence", name: "Static findings dispositioned", state: "Closed", criteria: ["All findings dispositioned", "Waivers scoped", "Baseline current"], evidence: ["static_run_2026.07.24.03", "static_disp_matrix.csv"], missing: [], conditions: [], dependencies: [], owner: "Aisha Rahman", approver: "Static Analysis Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Structural risk bounded before floorplan" },
  { id: "G-05", group: "Verification Evidence", name: "Formal obligations dispositioned", state: "Closed with Conditions", criteria: ["All properties proven or waived", "Bounded proofs annotated"], evidence: ["formal_run_2026.07.24.06", "PROP-ERROR-TIMING-023"], missing: [], conditions: ["Bounded proof for error-timing property"], dependencies: ["G-10"], owner: "Daniel Kim", approver: "Formal Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Bounded formal result requires downstream awareness" },
  { id: "G-06", group: "Verification Evidence", name: "Simulation and regression complete", state: "Closed", criteria: ["Regression pass rate ≥ target", "No open blockers", "Seeds and manifest preserved"], evidence: ["REG-2026-07-24-0068", "seed_manifest.yaml"], missing: [], conditions: [], dependencies: [], owner: "Sofia Rodriguez", approver: "Verification Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Functional evidence complete" },
  { id: "G-07", group: "Verification Evidence", name: "Coverage closure complete", state: "Closed", criteria: ["Functional coverage closed", "Exclusions have structural evidence", "Code coverage acceptable"], evidence: ["COV-DDMAC-3.2-021"], missing: [], conditions: [], dependencies: [], owner: "Sofia Rodriguez", approver: "Verification Methodology", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Verification obligations bounded" },
  { id: "G-08", group: "Verification Evidence", name: "Verification-environment trust established", state: "Closed", criteria: ["Checker trust report signed", "Mutation testing complete"], evidence: ["checker_trust_3.2.pdf", "mutation_report_3.2.csv"], missing: [], conditions: [], dependencies: [], owner: "Sofia Rodriguez", approver: "Verification Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Confidence in verification evidence" },
  { id: "G-09", group: "Defect & Risk Control", name: "Material defects dispositioned", state: "Closed with Conditions", criteria: ["All material defects have dispositions", "Fixes validated"], evidence: ["DEF-DV-219 fix", "DEF-TB-087 accepted", "DEF-DOC-042 closed"], missing: [], conditions: ["DEF DV 219 closure approval pending"], dependencies: [], owner: "Maya Chen", approver: "RTL Design Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "One high-severity closure approval remains" },
  { id: "G-10", group: "Defect & Risk Control", name: "Waivers approved", state: "Closed", criteria: ["Waivers scoped and time-bound", "Rationale documented"], evidence: ["WVR-FORMAL-006", "WVR-COV-014", "WVR-LINT-023", "WVR-CDC-019", "WVR-DOC-004"], missing: [], conditions: [], dependencies: [], owner: "Priya Shah", approver: "Governance Board", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Five active waivers baseline-compatible" },
  { id: "G-11", group: "Defect & Risk Control", name: "Residual risks accepted", state: "In Review", criteria: ["Every risk owned and rated", "Acceptance signed"], evidence: ["RISK-011 pending", "RISK-014 approved", "RISK-018 approved", "RISK-022 pending"], missing: ["Physical-Design Lead acceptance for RISK-011", "Constraints Lead acceptance for RISK-022"], conditions: [], dependencies: [], owner: "Priya Shah", approver: "Risk Lead + Physical-Design Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Two acceptances pending downstream" },
  { id: "G-12", group: "Package & Handoff", name: "Documentation and package synchronized", state: "Closed", criteria: ["Drift resolved", "TRM and register spec current", "Known limitations present"], evidence: ["DDMAC_FE_PACKAGE_3.2_RC2"], missing: [], conditions: [], dependencies: ["G-13"], owner: "Marcus Lee", approver: "Release Authority", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Package reflects controlled baselines" },
  { id: "G-13", group: "Package & Handoff", name: "Reproducibility demonstrated", state: "Closed", criteria: ["Manifest hashes validated", "Tool profiles pinned", "Repro script passes"], evidence: ["MANIFEST_RC2.yaml", "reproduce.sh run 2026-07-24"], missing: [], conditions: [], dependencies: [], owner: "Marcus Lee", approver: "Release Authority", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Downstream can rebuild package" },
  { id: "G-14", group: "Package & Handoff", name: "Downstream intake contract complete", state: "In Review", criteria: ["Responsibilities assigned", "Acknowledgments signed", "Conditions visible downstream"], evidence: ["intake_contract_v0.9.md"], missing: ["Clock intent transfer", "Timing constraint transfer", "Known-limitations acknowledgment"], conditions: ["Three ownership transfers pending"], dependencies: [], owner: "Jordan Lee", approver: "Physical-Design Lead", lastEval: "2026-07-22", baselineCompat: "Compatible", impact: "Intake authorization gated on transfers" },
];

/* ---------- evidence matrix ---------- */
type EvState = "Complete" | "Complete with Condition" | "Missing" | "Stale" | "Conflicting" | "Approval Pending" | "Superseded";

interface EvRow {
  domain: string;
  obligation: string;
  artifact: string;
  baseline: string;
  state: EvState;
  approval: "Approved" | "Pending" | "Draft" | "Rejected";
  repro: "Pass" | "Pending" | "Fail" | "N/A";
  inPackage: boolean;
  owner: string;
  impact: string;
}

const EVIDENCE: EvRow[] = [
  ["Requirements", "Requirements closure", "REQ-BL-DDMAC-3.2", "req_baseline_3.2", "Complete", "Approved", "Pass", true, "Arun Patel", "Intake foundational"],
  ["Architecture", "Architecture approval", "arch_baseline_3.2.pdf", "arch_baseline_3.2", "Complete", "Approved", "Pass", true, "Arun Patel", "Bounds constraints"],
  ["RTL", "RTL baseline", "rtl_baseline_3.2.18", "rtl_3.2.18", "Complete", "Approved", "Pass", true, "Maya Chen", "Intake target"],
  ["Static", "Static report", "static_run_2026.07.24.03", "static_2026.07.24.03", "Complete", "Approved", "Pass", true, "Aisha Rahman", "Structural risk bounded"],
  ["Formal", "Formal report", "formal_run_2026.07.24.06", "formal_2026.07.24.06", "Complete with Condition", "Approved", "Pass", true, "Daniel Kim", "Bounded proof PROP ERROR TIMING 023"],
  ["Regression", "Regression report", "REG-2026-07-24-0068", "reg_2026.07.24.0068", "Complete", "Approved", "Pass", true, "Sofia Rodriguez", "Functional evidence"],
  ["Coverage", "Coverage report", "COV-DDMAC-3.2-021", "cov_3.2.021", "Complete", "Approved", "Pass", true, "Sofia Rodriguez", "Coverage bounded"],
  ["Checker Trust", "Checker-trust report", "checker_trust_3.2.pdf", "check_trust_3.2", "Complete", "Approved", "Pass", true, "Sofia Rodriguez", "Evidence confidence"],
  ["Defects", "Defect report", "defect_register_3.2.csv", "defect_3.2", "Complete with Condition", "Pending", "Pass", true, "Maya Chen", "DEF DV 219 closure pending"],
  ["Waivers", "Waiver register", "waiver_register_3.2.csv", "waiver_3.2", "Complete", "Approved", "Pass", true, "Priya Shah", "Baseline compatible"],
  ["Residual Risk", "Residual-risk register", "risk_register_3.2.csv", "risk_3.2", "Complete with Condition", "Pending", "Pass", true, "Priya Shah", "Two acceptances pending"],
  ["Limitations", "Known limitations", "limitations_3.2.md", "lim_3.2", "Complete", "Pending", "Pass", true, "Marcus Lee", "Acknowledgment pending"],
  ["DV Report", "DV report", "dv_report_3.2.pdf", "dv_3.2", "Complete", "Approved", "Pass", true, "Sofia Rodriguez", "Evidence-backed"],
  ["Documentation", "TRM", "TRM_DDMAC_3.2.pdf", "trm_3.2", "Complete", "Approved", "Pass", true, "Elena Garcia", "Downstream reference"],
  ["Register Model", "Register specification", "register_spec_3.2.rdl", "reg_spec_3.2", "Complete", "Approved", "Pass", true, "Elena Garcia", "SW/HW contract"],
  ["Interface", "Interface documentation", "if_doc_3.2.md", "if_3.2", "Complete", "Approved", "Pass", true, "Arun Patel", "Downstream contract"],
  ["Constraints", "Constraint package", "constraints_3.2.sdc", "sdc_3.2", "Complete", "Approved", "Pass", true, "Arun Patel", "Timing intent"],
  ["Stimulus", "Test and seed manifest", "seed_manifest.yaml", "seeds_3.2", "Complete", "Approved", "Pass", true, "Sofia Rodriguez", "Reproducibility"],
  ["Source", "Source manifest", "source_manifest.yaml", "src_3.2", "Complete", "Approved", "Pass", true, "Marcus Lee", "Hashes validated"],
  ["Tools", "Tool-version manifest", "tools_manifest.yaml", "tools_3.2", "Complete", "Approved", "Pass", true, "Marcus Lee", "Pinned"],
  ["Reproduction", "Reproduction script", "reproduce.sh", "repro_3.2", "Complete", "Approved", "Pass", true, "Marcus Lee", "Demonstrated"],
  ["Approvals", "Approval checklist", "approval_checklist_3.2.md", "appr_3.2", "Complete with Condition", "Pending", "Pass", true, "Marcus Lee", "6 of 8 signed"],
  ["Package", "Package manifest", "MANIFEST_RC2.yaml", "pkg_manifest_rc2", "Complete", "Pending", "Pass", true, "Marcus Lee", "Awaiting authorization"],
  ["Release", "Release notes", "release_notes_3.2_rc2.md", "notes_3.2_rc2", "Complete", "Approved", "Pass", true, "Marcus Lee", "Includes conditions"],
].map((r) => {
  const [domain, obligation, artifact, baseline, state, approval, repro, inPackage, owner, impact] = r as never[];
  return { domain, obligation, artifact, baseline, state, approval, repro, inPackage, owner, impact } as EvRow;
});

/* ---------- conditions ---------- */
interface Cond {
  id: string;
  desc: string;
  source: string;
  state: "Open" | "Approval Pending" | "Closed";
  impact: string;
  owner: string;
  due: string;
  mitigation: string;
  closureEvidence: string;
  downstreamVisibility: "Required" | "Informational" | "Approved";
  approval: string;
}
const CONDITIONS: Cond[] = [
  { id: "COND-001", desc: "Error-Timing Assumption Handoff", source: "REQ DDMAC 143", state: "Open", impact: "Formal and documentation interpretation", owner: "Arun Patel", due: "Before timing-constraint freeze", mitigation: "Preserve approved behavior contract; review during physical-design intake", closureEvidence: "Downstream acknowledgment of assumption", downstreamVisibility: "Required", approval: "IP Architect ✓ · Physical-Design Lead pending" },
  { id: "COND-002", desc: "Intermittent Checker Follow-Up", source: "DEF TB 087", state: "Open", impact: "No demonstrated DUT defect; checker refinement remains", owner: "Sofia Rodriguez", due: "Before next full regression milestone", mitigation: "Preserve transaction traces; rerun updated checker suite", closureEvidence: "Refined checker regression pass", downstreamVisibility: "Informational", approval: "Verification Lead ✓" },
  { id: "COND-003", desc: "Known-Limitations Acknowledgment", source: "Release package", state: "Approval Pending", impact: "Downstream acknowledgment required for intake", owner: "Jordan Lee", due: "Intake authorization", mitigation: "Acknowledge limitations register", closureEvidence: "Signed acknowledgment record", downstreamVisibility: "Required", approval: "Physical-Design Lead pending" },
];

/* ---------- residual risks ---------- */
interface Risk {
  id: string;
  desc: string;
  source: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  exposure: "Low" | "Medium" | "High";
  mitigation: string;
  detection: string;
  owner: string;
  acceptedBy: string;
  expiration: string;
  downstream: string;
  state: "Accepted" | "Pending";
}
const RISKS: Risk[] = [
  { id: "RISK-011", desc: "Error-Response Timing Interpretation", source: "REQ DDMAC 143 · Formal cond.", likelihood: "Low", impact: "Medium", exposure: "Low", mitigation: "Approved assumption + downstream review", detection: "STA review + formal audit", owner: "Arun Patel", acceptedBy: "Physical-Design Lead pending", expiration: "DDMAC 3.3 review", downstream: "Physical-Design Lead confirms during timing review", state: "Pending" },
  { id: "RISK-014", desc: "Checker Ordering Edge Case", source: "DEF TB 087", likelihood: "Low", impact: "Low", exposure: "Low", mitigation: "Checker refinement + targeted rerun", detection: "Regression signature match", owner: "Sofia Rodriguez", acceptedBy: "Verification Lead ✓", expiration: "Next milestone", downstream: "Informational", state: "Accepted" },
  { id: "RISK-018", desc: "Limited Formal Abstraction", source: "PROP ERROR TIMING 023", likelihood: "Low", impact: "Medium", exposure: "Low", mitigation: "Simulation + assertion evidence retained", detection: "Regression + assertion coverage", owner: "Daniel Kim", acceptedBy: "Formal Lead ✓", expiration: "DDMAC 3.3", downstream: "Preserve assumption downstream", state: "Accepted" },
  { id: "RISK-022", desc: "Constraint Evolution During Intake", source: "SDC handoff", likelihood: "Medium", impact: "Medium", exposure: "Medium", mitigation: "Version-controlled constraint-change review", detection: "SDC diff gate at each floorplan iteration", owner: "Constraints Lead", acceptedBy: "Physical-Design Constraints Lead pending", expiration: "Floorplan freeze", downstream: "Constraints Lead owns during intake", state: "Pending" },
];

/* ---------- waivers ---------- */
const WAIVERS = [
  { id: "WVR-FORMAL-006", scope: "PROP ERROR TIMING 023 · bounded ≤128 cycles", rationale: "Simulation and assertion evidence retained; bounded proof valid within cycle budget", baseline: "formal_2026.07.24.06", evidence: "formal report §4.2 + assertion cov", residualRisk: "RISK-018", owner: "Daniel Kim", approver: "Formal Lead", expiration: "DDMAC 3.3", revalidation: "Reprove at next baseline", intakeImpact: "Downstream awareness required", state: "Active" },
  { id: "WVR-COV-014", scope: "Unreachable privilege-reset cross bin", rationale: "Structural unreachability proven via formal", baseline: "cov_3.2.021", evidence: "formal unreachability proof", residualRisk: "None", owner: "Sofia Rodriguez", approver: "Verification Methodology", expiration: "Persistent", revalidation: "On RTL structural change", intakeImpact: "None", state: "Active" },
  { id: "WVR-LINT-023", scope: "Reserved debug signal drives constant", rationale: "Intentional per architecture", baseline: "static_2026.07.24.03", evidence: "architecture note §7.1", residualRisk: "None", owner: "Aisha Rahman", approver: "Static Analysis Lead", expiration: "Persistent", revalidation: "On architecture change", intakeImpact: "None", state: "Active" },
  { id: "WVR-CDC-019", scope: "Static configuration crossing on cfg_reg[3:0]", rationale: "Write-once at reset, verified stable", baseline: "static_2026.07.24.03", evidence: "static report §6.4 + assertion", residualRisk: "None", owner: "Aisha Rahman", approver: "CDC Lead", expiration: "DDMAC 3.3", revalidation: "On config-path change", intakeImpact: "Informational to CDC downstream", state: "Active" },
  { id: "WVR-DOC-004", scope: "Nonfunctional diagram refresh deferred", rationale: "Diagram cosmetic; content current", baseline: "trm_3.2", evidence: "content diff report", residualRisk: "None", owner: "Elena Garcia", approver: "Doc Owner", expiration: "Next doc cycle", revalidation: "Refresh at DDMAC 3.3", intakeImpact: "None", state: "Active" },
];

/* ---------- defects ---------- */
const DEFECTS = [
  { id: "DEF DV 219", severity: "High", state: "Fix validated, closure approval pending", intake: "Conditional", cluster: "Boundary comparison", rootCause: "Inclusive comparison rejected legal maximum", correction: "Corrected comparison operator + boundary tests", validation: "Regression + formal boundary proof passed", owner: "Maya Chen", closureAuthority: "RTL Design Lead", baseline: "rtl_3.2.18" },
  { id: "DEF TB 087", severity: "Medium", state: "Accepted residual testbench issue", intake: "Conditional (informational)", cluster: "Scoreboard ordering", rootCause: "Sequential FIFO match unsafe on out-of-order responses", correction: "Transaction-ID matcher planned in DV env 2.5", validation: "No DUT defect; TB refinement scheduled", owner: "Sofia Rodriguez", closureAuthority: "Verification Lead", baseline: "dv_3.2" },
  { id: "DEF DOC 042", severity: "Medium", state: "Closed", intake: "None", cluster: "Documentation drift", rootCause: "Register spec drifted from RDL", correction: "Regenerated TRM from register model", validation: "Doc sync check passed", owner: "Elena Garcia", closureAuthority: "Doc Owner", baseline: "trm_3.2" },
];

/* ---------- handoff responsibility matrix ---------- */
const HANDOFF = [
  { responsibility: "RTL baseline integrity", feOwner: "Maya Chen (RTL Design Lead)", pdOwner: "Jordan Lee (Physical-Design Lead)", state: "Accepted" },
  { responsibility: "Clock intent", feOwner: "Kai Tanaka (Clock Architect)", pdOwner: "Priya Nair (CTS Lead)", state: "Pending" },
  { responsibility: "Reset intent", feOwner: "Kai Tanaka (Reset Architect)", pdOwner: "Jordan Lee (Physical-Design Lead)", state: "Accepted" },
  { responsibility: "Timing constraints", feOwner: "Arun Patel (IP Architect)", pdOwner: "Rahul Verma (STA Lead)", state: "Pending" },
  { responsibility: "Power intent", feOwner: "Arun Patel (IP Architect)", pdOwner: "Nina Park (Low-Power Lead)", state: "Accepted" },
  { responsibility: "Known limitations", feOwner: "Marcus Lee (Release Authority)", pdOwner: "Jordan Lee (Intake Lead)", state: "Pending" },
  { responsibility: "Active waivers", feOwner: "Domain Owners", pdOwner: "Intake Review Board", state: "Accepted" },
  { responsibility: "ECO feedback", feOwner: "Maya Chen (RTL Lead)", pdOwner: "Jordan Lee (Physical-Design Lead)", state: "Defined" },
  { responsibility: "Package reproducibility", feOwner: "Marcus Lee (Release Eng.)", pdOwner: "Build Lead", state: "Accepted" },
];

/* ---------- approvals ---------- */
const APPROVALS = [
  { role: "RTL Design Lead", owner: "Maya Chen", responsibility: "RTL baseline and defect disposition", state: "Approved" },
  { role: "Verification Lead", owner: "Sofia Rodriguez", responsibility: "Verification evidence", state: "Approved" },
  { role: "Formal Lead", owner: "Daniel Kim", responsibility: "Formal conditions", state: "Approved with condition" },
  { role: "Static Analysis Lead", owner: "Aisha Rahman", responsibility: "Static disposition", state: "Approved" },
  { role: "IP Architect", owner: "Arun Patel", responsibility: "Architecture and assumptions", state: "Approved" },
  { role: "Release Authority", owner: "Marcus Lee", responsibility: "Package approval", state: "Approved" },
  { role: "Physical-Design Lead", owner: "Jordan Lee", responsibility: "Intake acceptance", state: "Pending" },
  { role: "Engineering Executive", owner: "Elena Garcia", responsibility: "Final advancement authorization", state: "Pending" },
];

/* ---------- checklist ---------- */
const CHECKLIST: { category: string; items: { name: string; status: "Complete" | "Condition" | "Pending"; owner: string; approver: string }[] }[] = [
  { category: "Engineering Baseline", items: [
    { name: "RTL hash validated", status: "Complete", owner: "Maya Chen", approver: "RTL Design Lead" },
    { name: "File list complete", status: "Complete", owner: "Marcus Lee", approver: "Release Authority" },
    { name: "Hierarchy validated", status: "Complete", owner: "Maya Chen", approver: "RTL Design Lead" },
    { name: "Dependencies included", status: "Complete", owner: "Marcus Lee", approver: "Release Authority" },
  ]},
  { category: "Constraints", items: [
    { name: "Clock intent included", status: "Complete", owner: "Kai Tanaka", approver: "Clock Architect" },
    { name: "Reset intent included", status: "Complete", owner: "Kai Tanaka", approver: "Reset Architect" },
    { name: "CDC/RDC constraints included", status: "Complete", owner: "Aisha Rahman", approver: "Static Lead" },
    { name: "Formal assumptions included", status: "Condition", owner: "Daniel Kim", approver: "Formal Lead" },
    { name: "Initial timing constraints included", status: "Complete", owner: "Arun Patel", approver: "IP Architect" },
  ]},
  { category: "Verification Evidence", items: [
    { name: "Regression report included", status: "Complete", owner: "Sofia Rodriguez", approver: "Verification Lead" },
    { name: "Formal report included", status: "Condition", owner: "Daniel Kim", approver: "Formal Lead" },
    { name: "Static report included", status: "Complete", owner: "Aisha Rahman", approver: "Static Lead" },
    { name: "Coverage report included", status: "Complete", owner: "Sofia Rodriguez", approver: "Verification Methodology" },
    { name: "Defect and waiver records included", status: "Condition", owner: "Priya Shah", approver: "Governance Board" },
  ]},
  { category: "Documentation", items: [
    { name: "Functional specification current", status: "Complete", owner: "Elena Garcia", approver: "Doc Owner" },
    { name: "TRM current", status: "Complete", owner: "Elena Garcia", approver: "Doc Owner" },
    { name: "Register specification current", status: "Complete", owner: "Elena Garcia", approver: "Doc Owner" },
    { name: "Interface documentation current", status: "Complete", owner: "Arun Patel", approver: "IP Architect" },
    { name: "Known limitations current", status: "Pending", owner: "Marcus Lee", approver: "Release Authority" },
    { name: "Release notes current", status: "Complete", owner: "Marcus Lee", approver: "Release Authority" },
  ]},
  { category: "Governance", items: [
    { name: "Provenance complete", status: "Complete", owner: "Marcus Lee", approver: "Release Authority" },
    { name: "Reproducibility demonstrated", status: "Complete", owner: "Marcus Lee", approver: "Release Authority" },
    { name: "Residual risks assigned", status: "Pending", owner: "Priya Shah", approver: "Risk Lead" },
    { name: "Conditions assigned", status: "Complete", owner: "Marcus Lee", approver: "Release Authority" },
    { name: "Required approvals complete", status: "Pending", owner: "Elena Garcia", approver: "Engineering Executive" },
  ]},
];

/* ---------- walkthrough ---------- */
const STEPS = [
  "Review the controlled baselines in the context strip and confirm compatibility.",
  "Inspect the 14-gate intake model; 13 are closed and 1 remains in review.",
  "Open the validated package summary — 41 of 42 artifacts are complete with hashes and provenance.",
  "Open intake condition COND-001 (Error-Timing Assumption Handoff) and review mitigation and downstream visibility.",
  "Review residual risks and active waivers, including WVR-FORMAL-006 with a bounded rationale.",
  "Inspect the remaining material defect DEF DV 219 — fix validated, closure approval pending.",
  "Open the downstream handoff contract and confirm ownership acknowledgments.",
  "Confirm ownership transfer for Clock intent, Timing constraints, and Known limitations.",
  "Compare the Ready, Conditionally Ready, and Not Ready decision cards.",
  "Review the AI recommendation (Conditionally Ready, 91% confidence) and its supporting evidence.",
  "Note that human authorization is separate — Physical-Design Lead and Engineering Executive remain pending.",
  "Confirm the physical-design boundary: this decision authorizes intake only, not tapeout or fabrication.",
];

/* =========================== component =========================== */

export default function PhysicalDesignIntake() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [tab, setTab] = useState<"model" | "evidence" | "conditions" | "handoff" | "ai">("model");
  const [selGate, setSelGate] = useState<Gate | null>(null);
  const [selCond, setSelCond] = useState<Cond | null>(null);
  const [selRisk, setSelRisk] = useState<Risk | null>(null);
  const [walkStep, setWalkStep] = useState<number | null>(null);
  const [confirmDecision, setConfirmDecision] = useState<Decision | null>(null);
  const [q, setQ] = useState("");

  const state = useMemo(() => {
    const closed = GATES.filter((g) => g.state === "Closed" || g.state === "Closed with Conditions").length;
    const rec: Decision =
      scenario === "T0" || scenario === "T3"
        ? "Ready"
        : scenario === "T1"
        ? "Not Ready"
        : "Conditionally Ready";
    return {
      closed,
      total: GATES.length,
      recommendation: rec,
      humanDecision: scenario === "T3" ? "Authorized" : "Pending",
      openConds: scenario === "T0" ? 0 : scenario === "T1" ? 5 : 3,
      risks: 4,
      pendingRiskAccept: scenario === "T0" || scenario === "T3" ? 0 : 2,
      approvalsDone: scenario === "T3" ? 8 : scenario === "T0" ? 8 : 6,
      approvalsTotal: 8,
      packageCompleteness: scenario === "T1" ? 84 : 98,
      repro: scenario === "T1" ? "Fail" : "Pass",
      evidenceCompleteness: scenario === "T1" ? 82 : 97,
      materialDefects: scenario === "T1" ? 3 : 1,
      waivers: 5,
    };
  }, [scenario]);

  const scenarioTone: Record<Decision, string> = {
    Ready: "border-emerald-300 bg-emerald-50 text-emerald-800",
    "Conditionally Ready": "border-amber-300 bg-amber-50 text-amber-900",
    "Not Ready": "border-red-300 bg-red-50 text-red-800",
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      {/* ---- context strip ---- */}
      <div className="border-b bg-white px-6 py-3 text-[11px] font-mono text-slate-600 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="text-slate-400">PROGRAM</span> <span>StrataShield Secure Processing SoC</span>
        <span className="text-slate-400">IP</span> <span>DDMAC Packet Movement Engine</span>
        <span className="text-slate-400">REV</span> <span>DDMAC 3.2</span>
        <span className="text-slate-400">RTL</span> <span>rtl_baseline_3.2.18</span>
        <span className="text-slate-400">DV</span> <span>dv_env_2.4</span>
        <span className="text-slate-400">STATIC</span> <span>static_run_2026.07.24.03</span>
        <span className="text-slate-400">FORMAL</span> <span>formal_run_2026.07.24.06</span>
        <span className="text-slate-400">REG</span> <span>REG-2026-07-24-0068</span>
        <span className="text-slate-400">COV</span> <span>COV-DDMAC-3.2-021</span>
        <span className="text-slate-400">PKG</span> <span>DDMAC_FE_PACKAGE_3.2_RC2</span>
        <span className="text-slate-400">MANIFEST</span> <span>DDMAC_FE_PACKAGE_MANIFEST_RC2.yaml</span>
        <span className="text-slate-400">MILESTONE</span> <span>M9 Physical-Design Intake Review</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-slate-400">SCENARIO</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-mono"
          >
            <option value="T0">T0 · Ready</option>
            <option value="T1">T1 · Not Ready</option>
            <option value="T2">T2 · Conditional Intake</option>
            <option value="T3">T3 · Intake Authorized</option>
          </select>
          <span className="text-slate-400">ROLE</span> <span>Engineering Release Authority</span>
        </span>
      </div>

      {/* ---- header ---- */}
      <div className="border-b bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              <Handshake size={12} /> AVEP.P3.ADVANCE.001 · Phase 3 · Decide Whether the Validated Front-End Package Should Advance
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight">Physical-Design Intake Decision</h1>
            <p className="mt-1 max-w-4xl text-sm text-slate-600">
              Review the final engineering evidence, package contents, open conditions, residual risks, approvals, and
              downstream responsibilities required to authorize or hold front-end advancement. AVEP recommends; qualified
              engineering and release authorities decide.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
              <Ban size={11} /> This decision authorizes controlled physical-design intake only. It does not authorize
              tapeout, fabrication, packaging, or silicon release.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWalkStep(0)}
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
            >
              <Play size={12} /> Start Physical-Design Intake Walkthrough
            </button>
            <button className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
              <Download size={12} /> Export Intake Decision Package
            </button>
          </div>
        </div>

        {/* recommendation banner */}
        <div className={`mt-4 flex flex-wrap items-center gap-3 rounded-lg border p-3 ${scenarioTone[state.recommendation]}`}>
          <Sparkles size={16} />
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider opacity-80">AI Recommendation · confidence 91%</div>
            <div className="text-sm font-semibold">{state.recommendation}</div>
          </div>
          <div className="mx-2 h-8 w-px bg-current opacity-20" />
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider opacity-80">Human Decision</div>
            <div className="text-sm font-semibold">{state.humanDecision}</div>
          </div>
          <div className="mx-2 h-8 w-px bg-current opacity-20" />
          <div className="max-w-2xl text-xs">
            {state.recommendation === "Conditionally Ready" &&
              "The front-end package is sufficiently complete for controlled physical-design intake, subject to three bounded conditions with owners, due dates, downstream visibility, and approved mitigation plans."}
            {state.recommendation === "Ready" &&
              "All required front-end conditions closed, evidence current, approvals complete, and downstream responsibilities accepted."}
            {state.recommendation === "Not Ready" &&
              "Blocking front-end issues remain: baseline conflict, stale package manifest, or required approvals missing."}
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5 xl:grid-cols-10">
          {[
            { k: "Readiness gates", v: `${state.closed}/${state.total}`, sub: "Closed (incl. w/ conditions)", tab: "model" },
            { k: "Package completeness", v: `${state.packageCompleteness}%`, sub: "41 of 42 artifacts", tab: "evidence" },
            { k: "Evidence completeness", v: `${state.evidenceCompleteness}%`, sub: "1 conditional record", tab: "evidence" },
            { k: "Open conditions", v: state.openConds, sub: "All bounded and assigned", tab: "conditions" },
            { k: "Residual risks", v: state.risks, sub: `${state.risks - state.pendingRiskAccept} accepted · ${state.pendingRiskAccept} pending`, tab: "conditions" },
            { k: "Active waivers", v: state.waivers, sub: "All baseline-compatible", tab: "conditions" },
            { k: "Material defects", v: state.materialDefects, sub: "Validated, closure pending", tab: "conditions" },
            { k: "Approvals", v: `${state.approvalsDone}/${state.approvalsTotal}`, sub: "Intake + Executive pending", tab: "ai" },
            { k: "Reproducibility", v: state.repro, sub: "Manifest + tool profiles", tab: "evidence" },
            { k: "Recommendation", v: state.recommendation, sub: "Human decision pending", tab: "ai" },
          ].map((c) => (
            <button
              key={c.k}
              onClick={() => setTab(c.tab as never)}
              className="rounded border border-slate-200 bg-white p-3 text-left hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{c.k}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{c.v}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">{c.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ---- tabs ---- */}
      <div className="border-b bg-white px-6">
        <div className="flex gap-1">
          {[
            { id: "model", label: "Intake Decision Model", icon: ShieldCheck },
            { id: "evidence", label: "Evidence & Package Summary", icon: Package },
            { id: "conditions", label: "Conditions & Residual Risks", icon: AlertTriangle },
            { id: "handoff", label: "Downstream Handoff Contract", icon: Handshake },
            { id: "ai", label: "AI Decision Evidence", icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as never)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium ${
                  active ? "border-blue-600 text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- content ---- */}
      <div className="px-6 py-5">
        {tab === "model" && <DecisionModelPanel state={state} onOpenGate={(g) => setSelGate(g)} />}
        {tab === "evidence" && <EvidencePanel q={q} setQ={setQ} />}
        {tab === "conditions" && (
          <ConditionsPanel onOpenCond={(c) => setSelCond(c)} onOpenRisk={(r) => setSelRisk(r)} />
        )}
        {tab === "handoff" && <HandoffPanel />}
        {tab === "ai" && <AiEvidencePanel recommendation={state.recommendation} onConfirm={(d) => setConfirmDecision(d)} />}
      </div>

      {/* ---- persistent decision bar ---- */}
      <div className="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-mono text-slate-600">
          <span className={`rounded border px-2 py-0.5 ${scenarioTone[state.recommendation]}`}>
            AI · {state.recommendation}
          </span>
          <span>Human · {state.humanDecision}</span>
          <span>Gates {state.closed}/{state.total}</span>
          <span>Open conditions {state.openConds}</span>
          <span>Risks {state.risks} · pending {state.pendingRiskAccept}</span>
          <span>Approvals {state.approvalsDone}/{state.approvalsTotal}</span>
          <span>Package {state.packageCompleteness}%</span>
          <span>Repro {state.repro}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <button onClick={() => setTab("conditions")} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">Review Conditions</button>
            <button onClick={() => setTab("conditions")} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">Review Risks</button>
            <button onClick={() => setTab("handoff")} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">Review Handoff</button>
            <button
              disabled
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-400"
              title="Requires all conditions closed"
            >
              Approve Ready
            </button>
            <button
              onClick={() => setConfirmDecision("Conditionally Ready")}
              className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-900 hover:bg-amber-100"
            >
              Approve Conditionally Ready
            </button>
            <button
              onClick={() => setConfirmDecision("Not Ready")}
              className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-800 hover:bg-red-100"
            >
              Set Not Ready
            </button>
          </span>
        </div>
      </div>

      {selGate && <GateDrawer gate={selGate} onClose={() => setSelGate(null)} />}
      {selCond && <CondDrawer cond={selCond} onClose={() => setSelCond(null)} />}
      {selRisk && <RiskDrawer risk={selRisk} onClose={() => setSelRisk(null)} />}
      {walkStep !== null && <Walkthrough step={walkStep} setStep={setWalkStep} />}
      {confirmDecision && <ConfirmModal decision={confirmDecision} onClose={() => setConfirmDecision(null)} />}
    </div>
  );
}

/* =========================== panels =========================== */

function stateChip(s: string) {
  const map: Record<string, string> = {
    Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Closed with Conditions": "bg-amber-50 text-amber-900 border-amber-200",
    Blocked: "bg-red-50 text-red-700 border-red-200",
    "In Review": "bg-blue-50 text-blue-700 border-blue-200",
    "Evidence Missing": "bg-red-50 text-red-700 border-red-200",
    "Approval Pending": "bg-amber-50 text-amber-900 border-amber-200",
    Stale: "bg-orange-50 text-orange-800 border-orange-200",
    "Not Applicable": "bg-slate-100 text-slate-500 border-slate-200",
    Complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Complete with Condition": "bg-amber-50 text-amber-900 border-amber-200",
    Missing: "bg-red-50 text-red-700 border-red-200",
    Conflicting: "bg-red-50 text-red-700 border-red-200",
    Superseded: "bg-slate-100 text-slate-500 border-slate-200",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-900 border-amber-200",
    Draft: "bg-slate-100 text-slate-600 border-slate-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    Pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Fail: "bg-red-50 text-red-700 border-red-200",
    Open: "bg-amber-50 text-amber-900 border-amber-200",
    Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Active: "bg-blue-50 text-blue-700 border-blue-200",
    "Approved with condition": "bg-amber-50 text-amber-900 border-amber-200",
    Authorized: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Defined: "bg-blue-50 text-blue-700 border-blue-200",
    Condition: "bg-amber-50 text-amber-900 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono ${map[s] || "bg-slate-100 border-slate-200 text-slate-600"}`}>
      {s}
    </span>
  );
}

function DecisionModelPanel({
  state,
  onOpenGate,
}: {
  state: { recommendation: Decision; closed: number; total: number; openConds: number; pendingRiskAccept: number };
  onOpenGate: (g: Gate) => void;
}) {
  const groups: Gate["group"][] = ["Engineering Intent", "Verification Evidence", "Defect & Risk Control", "Package & Handoff"];

  return (
    <div className="space-y-4">
      {/* three decision cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <DecisionCard
          title="Ready for Physical-Design Intake"
          tone="emerald"
          active={state.recommendation === "Ready"}
          bullets={[
            "No blocking front-end condition remains",
            "Required evidence complete and current",
            "Required package artifacts complete",
            "Material defects dispositioned",
            "Required waivers approved",
            "Residual risks accepted",
            "Reproducibility demonstrated",
            "Required approvals complete",
            "Downstream responsibilities assigned",
          ]}
        />
        <DecisionCard
          title="Conditionally Ready"
          tone="amber"
          active={state.recommendation === "Conditionally Ready"}
          bullets={[
            "No condition invalidates the front-end package",
            "Remaining conditions are bounded",
            "Each condition has owner and due date",
            "Required mitigation exists",
            "Downstream team has visibility",
            "Conditions do not misrepresent design as physically complete",
            "Responsible authorities approve conditional intake",
          ]}
          permits={["Package intake", "Constraint review", "Physical-design planning", "Controlled downstream analysis"]}
          denies={["Tapeout authorization", "Fabrication release", "Physical signoff claims"]}
        />
        <DecisionCard
          title="Not Ready"
          tone="red"
          active={state.recommendation === "Not Ready"}
          bullets={[
            "Blocking design or verification issue remains",
            "Required evidence missing or stale",
            "Material defects lack disposition",
            "Required waivers unapproved",
            "Package cannot be reproduced",
            "Required artifacts missing",
            "Required authorities have not approved",
            "Downstream responsibilities undefined",
          ]}
        />
      </div>

      {/* 14 gates */}
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g} className="rounded-lg border bg-white">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">{g}</div>
              <span className="font-mono text-[11px] text-slate-500">
                {GATES.filter((x) => x.group === g).length} gates
              </span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  {["Gate", "State", "Owner", "Approver", "Baseline", "Impact", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GATES.filter((x) => x.group === g).map((gate) => (
                  <tr key={gate.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{gate.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{gate.id}</div>
                    </td>
                    <td className="px-3 py-2">{stateChip(gate.state)}</td>
                    <td className="px-3 py-2 text-slate-700">{gate.owner}</td>
                    <td className="px-3 py-2 text-slate-700">{gate.approver}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{gate.baselineCompat}</td>
                    <td className="px-3 py-2 max-w-[280px] text-slate-600">{gate.impact}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onOpenGate(gate)}
                        className="inline-flex items-center rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50"
                      >
                        Details <ChevronRight size={12} className="ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* rules that produced recommendation */}
      <div className="rounded-lg border bg-slate-50 p-3 text-xs">
        <div className="mb-2 flex items-center gap-2">
          <Info size={12} className="text-slate-500" />
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
            Rules producing the current recommendation
          </div>
        </div>
        <ul className="ml-4 list-disc space-y-0.5 text-slate-700">
          <li>No gate is Blocked and no evidence is Missing or Conflicting → not "Not Ready".</li>
          <li>Two gates Closed with Conditions and one In Review → not "Ready".</li>
          <li>All conditions bounded, owned, mitigated, and visible downstream → "Conditionally Ready".</li>
          <li>AI cannot select the final human decision. Authorized roles retain approval.</li>
        </ul>
      </div>
    </div>
  );
}

function DecisionCard({
  title,
  tone,
  active,
  bullets,
  permits,
  denies,
}: {
  title: string;
  tone: "emerald" | "amber" | "red";
  active: boolean;
  bullets: string[];
  permits?: string[];
  denies?: string[];
}) {
  const toneMap = {
    emerald: "border-emerald-300 bg-emerald-50",
    amber: "border-amber-300 bg-amber-50",
    red: "border-red-300 bg-red-50",
  };
  return (
    <div className={`rounded-lg border p-3 ${active ? toneMap[tone] : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {active && <span className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[10px]">Current AI recommendation</span>}
      </div>
      <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">Applies when</div>
      <ul className="ml-4 mt-1 list-disc space-y-0.5 text-xs text-slate-700">
        {bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
      {permits && (
        <>
          <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-emerald-700">Permits</div>
          <ul className="ml-4 mt-1 list-disc space-y-0.5 text-xs text-slate-700">
            {permits.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </>
      )}
      {denies && (
        <>
          <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-red-700">Does not permit</div>
          <ul className="ml-4 mt-1 list-disc space-y-0.5 text-xs text-slate-700">
            {denies.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

function EvidencePanel({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  const rows = EVIDENCE.filter((e) => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return e.domain.toLowerCase().includes(ql) || e.artifact.toLowerCase().includes(ql) || e.owner.toLowerCase().includes(ql);
  });

  return (
    <div className="space-y-4">
      {/* validated package summary */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-3 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <Package size={13} className="text-slate-500" />
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Validated Package Summary</div>
            <span className="ml-auto font-mono text-[11px] text-blue-700">DDMAC_FE_PACKAGE_3.2_RC2</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
            {[
              ["Required artifacts", "42"],
              ["Complete", "41"],
              ["Conditional", "1"],
              ["Missing", "0"],
              ["Conflicting", "0"],
              ["Superseded excluded", "6"],
              ["Hashes validated", "42/42"],
              ["Provenance complete", "42/42"],
            ].map(([k, v]) => (
              <div key={k} className="rounded border p-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                <div className="mt-0.5 font-mono text-sm">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
            <AlertTriangle size={11} className="mr-1 inline" /> Package condition: Known-limitations approval pending —
            limitation is present and included; downstream acknowledgment not signed.
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Open Package Matrix", "Validate Manifest", "Compare Package Versions", "Open Reproducibility Evidence", "Export Candidate Package"].map((b) => (
              <button key={b} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">{b}</button>
            ))}
          </div>
        </div>

        {/* traceability graph */}
        <div className="rounded-lg border bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <GitBranch size={13} className="text-slate-500" />
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Evidence Traceability</div>
          </div>
          <svg viewBox="0 0 320 260" className="w-full">
            {[
              ["REQ 143", 10, 10, "#eff6ff", "#1d4ed8"],
              ["Arch spec", 120, 10, "#eff6ff", "#1d4ed8"],
              ["ddmac_error_capture", 230, 10, "#eef2ff", "#4338ca"],
              ["PROP-ERR-023", 10, 60, "#fef3c7", "#92400e"],
              ["Formal cond.", 120, 60, "#fef3c7", "#92400e"],
              ["WVR-FORMAL-006", 230, 60, "#fef3c7", "#92400e"],
              ["Known limitation", 10, 110, "#fef3c7", "#92400e"],
              ["DV report §4", 120, 110, "#ecfdf5", "#047857"],
              ["Package manifest", 230, 110, "#ecfdf5", "#047857"],
              ["Intake condition", 60, 170, "#fef2f2", "#b91c1c"],
              ["Approval pending", 180, 170, "#fef2f2", "#b91c1c"],
            ].map(([label, x, y, fill, stroke], i) => (
              <g key={i as number}>
                <rect x={x as number} y={y as number} width={82} height={32} rx={4} fill={fill as string} stroke={stroke as string} />
                <text x={(x as number) + 41} y={(y as number) + 20} textAnchor="middle" fontSize={9} fill={stroke as string} fontFamily="ui-monospace">
                  {label as string}
                </text>
              </g>
            ))}
            {[
              [92, 26, 120, 26], [212, 26, 230, 26],
              [51, 42, 51, 60], [161, 42, 161, 60], [271, 42, 271, 60],
              [51, 92, 51, 110], [161, 92, 161, 110], [271, 92, 271, 110],
              [51, 142, 101, 170], [271, 142, 221, 170],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={1} />
            ))}
          </svg>
          <div className="mt-1 text-[10px] text-slate-500">
            REQ 143 → Arch → RTL → Formal cond. → Waiver → Limitation → DV report → Package → Intake condition
          </div>
        </div>
      </div>

      {/* evidence matrix */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Evidence Matrix</div>
          <div className="relative ml-auto w-64">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search evidence"
              className="w-full rounded border border-slate-300 bg-white pl-7 pr-2 py-1 text-xs"
            />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                {["Domain", "Obligation", "Artifact", "Baseline", "State", "Approval", "Repro", "In Pkg", "Owner", "Intake Impact"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.artifact} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{r.domain}</td>
                  <td className="px-3 py-2 text-slate-700">{r.obligation}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{r.artifact}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{r.baseline}</td>
                  <td className="px-3 py-2">{stateChip(r.state)}</td>
                  <td className="px-3 py-2">{stateChip(r.approval)}</td>
                  <td className="px-3 py-2">{stateChip(r.repro)}</td>
                  <td className="px-3 py-2">
                    {r.inPackage ? <CheckCircle2 size={12} className="text-emerald-600" /> : <XCircle size={12} className="text-red-600" />}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{r.owner}</td>
                  <td className="px-3 py-2 text-slate-600">{r.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConditionsPanel({ onOpenCond, onOpenRisk }: { onOpenCond: (c: Cond) => void; onOpenRisk: (r: Risk) => void }) {
  return (
    <div className="space-y-4">
      {/* conditions */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center border-b px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Intake Condition Register</div>
          <span className="ml-2 font-mono text-[11px] text-slate-500">{CONDITIONS.length} conditions</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Condition", "Source", "Owner", "Due", "Downstream Visibility", "Approval", "State", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CONDITIONS.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-medium">{c.desc}</div>
                  <div className="font-mono text-[10px] text-slate-500">{c.id}</div>
                </td>
                <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{c.source}</td>
                <td className="px-3 py-2 text-slate-700">{c.owner}</td>
                <td className="px-3 py-2 text-slate-600">{c.due}</td>
                <td className="px-3 py-2">{stateChip(c.downstreamVisibility)}</td>
                <td className="px-3 py-2 text-slate-700">{c.approval}</td>
                <td className="px-3 py-2">{stateChip(c.state)}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onOpenCond(c)} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* risks */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center border-b px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Residual Risk Register</div>
          <span className="ml-2 font-mono text-[11px] text-slate-500">{RISKS.length} risks</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Risk", "Likelihood", "Impact", "Exposure", "Owner", "Accepted By", "Downstream", "State", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {RISKS.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-medium">{r.desc}</div>
                  <div className="font-mono text-[10px] text-slate-500">{r.id} · {r.source}</div>
                </td>
                <td className="px-3 py-2 font-mono text-[11px]">{r.likelihood}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{r.impact}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{r.exposure}</td>
                <td className="px-3 py-2 text-slate-700">{r.owner}</td>
                <td className="px-3 py-2 text-slate-700">{r.acceptedBy}</td>
                <td className="px-3 py-2 max-w-[240px] text-slate-600">{r.downstream}</td>
                <td className="px-3 py-2">{stateChip(r.state)}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onOpenRisk(r)} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* waivers */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center border-b px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Active Waivers</div>
          <span className="ml-2 font-mono text-[11px] text-slate-500">{WAIVERS.length} waivers</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Waiver", "Scope", "Rationale", "Baseline", "Residual Risk", "Owner", "Approver", "Expiration", "Revalidation", "Intake Impact"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {WAIVERS.map((w) => (
              <tr key={w.id}>
                <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{w.id}</td>
                <td className="px-3 py-2 max-w-[220px]">{w.scope}</td>
                <td className="px-3 py-2 max-w-[240px] text-slate-600">{w.rationale}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{w.baseline}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{w.residualRisk}</td>
                <td className="px-3 py-2 text-slate-700">{w.owner}</td>
                <td className="px-3 py-2 text-slate-700">{w.approver}</td>
                <td className="px-3 py-2 text-slate-600">{w.expiration}</td>
                <td className="px-3 py-2 text-slate-600">{w.revalidation}</td>
                <td className="px-3 py-2 text-slate-600">{w.intakeImpact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* defects */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center border-b px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Material Defect Readiness</div>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Defect", "Severity", "State", "Intake Impact", "Root Cause", "Correction", "Validation", "Owner", "Closure Auth.", "Baseline"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DEFECTS.map((d) => (
              <tr key={d.id}>
                <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{d.id}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${d.severity === "High" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-900"}`}>
                    {d.severity}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-700">{d.state}</td>
                <td className="px-3 py-2 text-slate-700">{d.intake}</td>
                <td className="px-3 py-2 max-w-[240px] text-slate-600">{d.rootCause}</td>
                <td className="px-3 py-2 max-w-[240px] text-slate-600">{d.correction}</td>
                <td className="px-3 py-2 max-w-[220px] text-slate-600">{d.validation}</td>
                <td className="px-3 py-2 text-slate-700">{d.owner}</td>
                <td className="px-3 py-2 text-slate-700">{d.closureAuthority}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{d.baseline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HandoffPanel() {
  return (
    <div className="space-y-4">
      {/* package received */}
      <div className="rounded-lg border bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Layers size={13} className="text-slate-500" />
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Package Received by Physical-Design Intake</div>
          <span className="ml-auto font-mono text-[11px] text-blue-700">DDMAC_FE_PACKAGE_3.2_RC2</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 text-xs">
          {[
            ["RTL baseline", "rtl_baseline_3.2.18"],
            ["File list & hashes", "42 files · sha256"],
            ["Design hierarchy", "ddmac_top → 6 blocks"],
            ["Clock definitions", "3 clocks · SDC"],
            ["Reset definitions", "2 resets · domain-local"],
            ["Interface contracts", "5 interfaces"],
            ["Register model", "register_spec_3.2.rdl"],
            ["Power-intent assumptions", "power_intent_3.2.upf"],
            ["Static constraints", "constraints_3.2.sdc"],
            ["Formal assumptions", "PROP-ERR-023 bounded"],
            ["Known limitations", "limitations_3.2.md"],
            ["Active waivers", "5 waivers"],
            ["Residual risks", "4 risks · 2 pending"],
            ["Reproduction script", "reproduce.sh"],
            ["Ownership contacts", "handoff_contacts.md"],
            ["ECO feedback channel", "eco_channel.md"],
          ].map(([k, v]) => (
            <div key={k} className="rounded border p-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-800">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* responsibility matrix */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
          Downstream Responsibilities
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Responsibility", "Front-End Owner", "Physical-Design Owner", "Transfer State", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {HANDOFF.map((h) => (
              <tr key={h.responsibility} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{h.responsibility}</td>
                <td className="px-3 py-2 text-slate-700">{h.feOwner}</td>
                <td className="px-3 py-2 text-slate-700">{h.pdOwner}</td>
                <td className="px-3 py-2">{stateChip(h.state)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] hover:bg-slate-50">Acknowledge</button>
                    <button className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] hover:bg-slate-50">Clarify</button>
                    <button className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] hover:bg-slate-50">Add Condition</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* handoff interface diagram */}
      <div className="rounded-lg border bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Handshake size={13} className="text-slate-500" />
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Handoff Interface — Front-End → Physical-Design Intake</div>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-emerald-800">Completed by AVEP front-end</div>
            <ul className="ml-4 list-disc space-y-0.5 text-xs text-slate-700">
              {["Requirements", "Architecture", "RTL baseline", "Front-end verification", "Static & formal evidence", "Coverage closure", "Package & documentation", "Intake-readiness decision"].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-blue-200 bg-blue-50 p-3 flex flex-col justify-center items-center">
            <ArrowRight size={22} className="text-blue-700" />
            <div className="mt-2 text-center text-[11px] font-medium text-blue-800">
              Validated Package · Constraints · Assumptions · Evidence · Limitations · Waivers · Risks · Ownership
            </div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-700">Beginning downstream (Physical-Design)</div>
            <ul className="ml-4 list-disc space-y-0.5 text-xs text-slate-700">
              {["Floorplan strategy", "Physical constraints refinement", "Placement", "Clock-tree design", "Routing", "Physical timing closure", "Power & signal integrity", "DRC and LVS", "Tapeout preparation"].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-1.5 text-[10px] text-slate-600">
              <Ban size={10} className="mr-1 inline" /> Not authorized by this decision.
            </div>
          </div>
        </div>
      </div>

      {/* intake checklist */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-3 py-2 flex items-center gap-2">
          <ClipboardCheck size={13} className="text-slate-500" />
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Intake Checklist</div>
        </div>
        <div className="divide-y">
          {CHECKLIST.map((cat) => (
            <div key={cat.category} className="px-3 py-2">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-700">{cat.category}</div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {cat.items.map((it) => (
                    <tr key={it.name}>
                      <td className="py-1.5 pr-2">{it.name}</td>
                      <td className="py-1.5 pr-2 w-32">{stateChip(it.status === "Complete" ? "Complete" : it.status === "Condition" ? "Condition" : "Pending")}</td>
                      <td className="py-1.5 pr-2 text-slate-600 w-40">{it.owner}</td>
                      <td className="py-1.5 pr-2 text-slate-600 w-48">{it.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiEvidencePanel({ recommendation, onConfirm }: { recommendation: Decision; onConfirm: (d: Decision) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-amber-800" />
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-amber-800">AI Recommendation</div>
              <div className="text-lg font-semibold text-amber-900">{recommendation}</div>
              <div className="mt-1 text-xs text-amber-900">
                Decision scope · Authorize controlled physical-design intake for DDMAC_FE_PACKAGE_3.2_RC2 after the
                listed conditions and acknowledgments are accepted.
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
                <div>
                  <div className="mb-1 font-medium text-emerald-800">Supporting Evidence</div>
                  <ul className="ml-4 list-disc space-y-0.5 text-slate-800">
                    <li>No blocking front-end gate remains</li>
                    <li>Requirements and architecture baselines approved</li>
                    <li>RTL baseline accepted at rtl_baseline_3.2.18</li>
                    <li>Static and regression evidence complete</li>
                    <li>Coverage obligations dispositioned</li>
                    <li>Package hashes and provenance valid</li>
                    <li>Reproducibility demonstrated</li>
                    <li>Conditions bounded and owned</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium text-red-800">Contradicting / Incomplete</div>
                  <ul className="ml-4 list-disc space-y-0.5 text-slate-800">
                    <li>One residual-risk acceptance pending (RISK-011)</li>
                    <li>One defect closure approval open (DEF DV 219)</li>
                    <li>Two downstream ownership transfers pending</li>
                  </ul>
                  <div className="mt-2 mb-1 font-medium text-amber-900">Conditions to accept</div>
                  <ul className="ml-4 list-disc space-y-0.5 text-slate-800">
                    <li>Physical-design lead acknowledges error-timing assumption</li>
                    <li>Timing-constraint ownership is formally accepted</li>
                    <li>Known-limitations acknowledgment completed</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 rounded border border-amber-300 bg-white/70 p-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <Fingerprint size={11} />
                  Recommendation confidence · <span className="font-mono">91%</span>
                  <span className="ml-1 text-slate-500">
                    Confidence reflects evidence completeness and rule alignment. It is not authorization.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* human authorities */}
        <div className="rounded-lg border bg-white">
          <div className="border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
            Human Approval Workflow
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>{["Role", "Owner", "Responsibility", "State"].map((h) => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {APPROVALS.map((a) => (
                <tr key={a.role}>
                  <td className="px-3 py-2 font-medium">{a.role}</td>
                  <td className="px-3 py-2 text-slate-700">{a.owner}</td>
                  <td className="px-3 py-2 text-slate-600">{a.responsibility}</td>
                  <td className="px-3 py-2">{stateChip(a.state)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* decision actions */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">Decision Actions</div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              "Request Additional Evidence",
              "Return Condition for Remediation",
              "Accept Residual Risk",
              "Acknowledge Known Limitations",
              "Accept Downstream Responsibility",
            ].map((a) => (
              <button key={a} className="rounded border border-slate-300 bg-white px-2 py-1.5 text-left text-xs hover:bg-slate-50">
                {a}
              </button>
            ))}
            <button
              onClick={() => onConfirm("Conditionally Ready")}
              className="rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-left text-xs font-medium text-amber-900 hover:bg-amber-100"
            >
              Approve Conditionally Ready
            </button>
            <button
              disabled
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs text-slate-400"
              title="Requires all conditions closed and approvals complete"
            >
              Approve Ready (disabled)
            </button>
            <button
              onClick={() => onConfirm("Not Ready")}
              className="rounded border border-red-300 bg-red-50 px-2 py-1.5 text-left text-xs font-medium text-red-800 hover:bg-red-100"
            >
              Set Not Ready
            </button>
            <button className="rounded border border-slate-300 bg-white px-2 py-1.5 text-left text-xs hover:bg-slate-50">
              Export Intake Decision Package
            </button>
          </div>
          <div className="mt-3 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
            <Ban size={11} className="mr-1 inline" />
            AI recommends and assembles evidence. It cannot authorize advancement.
          </div>
        </div>

        <div className="rounded-lg border bg-white p-3">
          <div className="mb-2 flex items-center gap-2">
            <Cpu size={13} className="text-slate-500" />
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">Deep Links</div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {[
              ["Signoff Readiness", "/avep/readiness/signoff"],
              ["Coverage Closure", "/avep/readiness/coverage-closure"],
              ["Release Package", "/avep/readiness/release-package"],
              ["AI Governance", "/avep/governance/ai-value"],
              ["Failure Diagnosis", "/avep/verification/failure-diagnosis"],
              ["Simulation Ops", "/avep/verification/simulation-operations"],
              ["Architecture", "/avep/architecture"],
              ["RTL Generation", "/avep/design/rtl-generation"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="truncate rounded border border-slate-200 bg-white px-2 py-1 text-blue-700 hover:bg-slate-50">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================== drawers =========================== */

function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div className="w-full max-w-3xl overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 border-b bg-white px-5 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{subtitle}</div>
              <div className="text-base font-semibold">{title}</div>
            </div>
            <button onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={16} /></button>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3 text-xs">{children}</div>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border p-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-[12px] text-slate-800">{value}</div>
    </div>
  );
}

function GateDrawer({ gate, onClose }: { gate: Gate; onClose: () => void }) {
  return (
    <Drawer title={gate.name} subtitle={`${gate.id} · ${gate.group}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <KV label="State" value={stateChip(gate.state)} />
        <KV label="Baseline compatibility" value={gate.baselineCompat} />
        <KV label="Owner" value={gate.owner} />
        <KV label="Approver" value={gate.approver} />
        <KV label="Last evaluation" value={gate.lastEval} />
        <KV label="Readiness impact" value={gate.impact} />
      </div>
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Required criteria</div>
        <ul className="ml-4 list-disc space-y-0.5">{gate.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Supporting evidence</div>
        <div className="flex flex-wrap gap-1">
          {gate.evidence.map((e) => <span key={e} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px]">{e}</span>)}
        </div>
      </div>
      {gate.missing.length > 0 && (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-red-700">Missing evidence</div>
          <ul className="ml-4 list-disc space-y-0.5">{gate.missing.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      {gate.conditions.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-amber-800">Conditions</div>
          <ul className="ml-4 list-disc space-y-0.5">{gate.conditions.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Dependencies</div>
        <div className="flex flex-wrap gap-1">
          {gate.dependencies.length ? gate.dependencies.map((d) => <span key={d} className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] text-blue-700">{d}</span>) : <span className="text-slate-500">None</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Open evidence", "Request evidence", "Assign owner", "Add condition", "Return for remediation", "Confirm closure"].map((a) => (
          <button key={a} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">{a}</button>
        ))}
      </div>
    </Drawer>
  );
}

function CondDrawer({ cond, onClose }: { cond: Cond; onClose: () => void }) {
  return (
    <Drawer title={cond.desc} subtitle={`${cond.id} · Source ${cond.source}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <KV label="State" value={stateChip(cond.state)} />
        <KV label="Owner" value={cond.owner} />
        <KV label="Due" value={cond.due} />
        <KV label="Downstream visibility" value={cond.downstreamVisibility} />
        <KV label="Approval" value={cond.approval} />
        <KV label="Intake impact" value={cond.impact} />
      </div>
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Mitigation</div>
        {cond.mitigation}
      </div>
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Closure evidence</div>
        {cond.closureEvidence}
      </div>
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-900">
        <Info size={11} className="mr-1 inline" /> Conditional approval preserves this condition in the package,
        release notes, downstream handoff, and approval modal.
      </div>
    </Drawer>
  );
}

function RiskDrawer({ risk, onClose }: { risk: Risk; onClose: () => void }) {
  return (
    <Drawer title={risk.desc} subtitle={`${risk.id} · Source ${risk.source}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <KV label="Likelihood" value={risk.likelihood} />
        <KV label="Impact" value={risk.impact} />
        <KV label="Exposure" value={risk.exposure} />
        <KV label="State" value={stateChip(risk.state)} />
        <KV label="Owner" value={risk.owner} />
        <KV label="Accepted by" value={risk.acceptedBy} />
        <KV label="Expiration" value={risk.expiration} />
        <KV label="Downstream" value={risk.downstream} />
      </div>
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Mitigation</div>
        {risk.mitigation}
      </div>
      <div className="rounded border p-3">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Detection method</div>
        {risk.detection}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {risk.state === "Pending" ? (
          <button className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800 hover:bg-emerald-100">
            Accept Residual Risk (authorized role)
          </button>
        ) : (
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800">Accepted</span>
        )}
        <button className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">Return for Mitigation</button>
      </div>
    </Drawer>
  );
}

/* =========================== confirmation modal =========================== */

function ConfirmModal({ decision, onClose }: { decision: Decision; onClose: () => void }) {
  const body =
    decision === "Conditionally Ready"
      ? "You are authorizing the validated front-end package to enter controlled physical-design intake subject to the listed conditions, residual risks, and downstream responsibilities. This decision does not authorize physical signoff, GDS release, tapeout, fabrication, packaging, or silicon release."
      : decision === "Ready"
      ? "You are authorizing the validated front-end package to enter physical-design intake with all required front-end conditions closed. This decision does not authorize tapeout or fabrication."
      : "You are setting the front-end package to Not Ready. Remediation actions will be created for blocking issues. Physical-design intake will not begin.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="text-base font-semibold">Confirm decision · {decision}</div>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={14} /></button>
        </div>
        <div className="mt-3 text-sm text-slate-700">{body}</div>
        <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
          <Ban size={11} className="mr-1 inline" /> This is not tapeout, manufacturing, or silicon-readiness authorization.
        </div>
        <div className="mt-3 flex flex-col gap-2 text-xs">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5" />
            <span>I have reviewed all open conditions, residual risks, and downstream responsibilities.</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5" />
            <span>I acknowledge that conditional approval preserves every open condition in the handoff.</span>
          </label>
          <textarea placeholder="Rationale (required for override of AI recommendation)" className="rounded border border-slate-300 p-2 text-xs" rows={2} />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50">Cancel</button>
          <button
            onClick={onClose}
            className={`rounded border px-3 py-1.5 text-xs ${
              decision === "Not Ready"
                ? "border-red-300 bg-red-50 text-red-800"
                : decision === "Ready"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            Sign & Record
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================== walkthrough =========================== */

function Walkthrough({ step, setStep }: { step: number; setStep: (n: number | null) => void }) {
  return (
    <div className="fixed bottom-16 right-6 z-30 w-96 rounded-lg border bg-white p-3 shadow-xl">
      <div className="flex items-start gap-2">
        <Sparkles size={14} className="mt-0.5 text-blue-600" />
        <div className="flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Walkthrough · step {step + 1} of {STEPS.length}
          </div>
          <div className="mt-1 text-xs text-slate-800">{STEPS[step]}</div>
        </div>
        <button onClick={() => setStep(null)} className="rounded p-1 hover:bg-slate-100"><X size={13} /></button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] disabled:opacity-40"
        >
          Back
        </button>
        <div className="flex gap-0.5">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1 w-3 rounded ${i <= step ? "bg-blue-600" : "bg-slate-200"}`} />
          ))}
        </div>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] text-blue-700">Next</button>
        ) : (
          <button onClick={() => setStep(null)} className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">Finish</button>
        )}
      </div>
    </div>
  );
}

/* silence intentionally-unreferenced icons */
void FileText;
