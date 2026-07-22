import { useMemo, useState } from "react";
import {
  Gavel,
  ShieldCheck,
  Brain,
  BookOpen,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Search,
  Fingerprint,
  GitBranch,
  Play,
  Download,
  Info,
  Sparkles,
  User,
  RefreshCw,
  ChevronRight,
  FlaskConical,
  Ban,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P3.GOV.001 — AI Governance, Engineering Learning & Value      */
/* Route: /avep/governance/ai-value                                   */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";
type SkillState =
  | "Approved"
  | "Approved with Conditions"
  | "Experimental"
  | "Evaluation Required"
  | "Blocked"
  | "Deprecated"
  | "Superseded"
  | "Rollback Required";

interface Skill {
  id: string;
  name: string;
  domain: string;
  version: string;
  model: string;
  methodology: string;
  boundary: string;
  evalStatus: "Passing" | "Failed" | "Pending" | "Blocked";
  evalPct: number;
  acceptance: number;
  modification: number;
  rejection: number;
  risk: "Low" | "Medium" | "High";
  owner: string;
  reviewer: string;
  activePrograms: number;
  lastRelease: string;
  state: SkillState;
  purpose: string;
  known: string;
  prompt: { id: string; version: string; hash: string };
}

const SKILLS: Skill[] = [
  ["AI-SKILL-001", "Requirement Extraction", "Requirements", "4.1.0", "reasoning-r6", "AVEP-REQ-2.2", "May extract, human confirms source", "Passing", 96, 82, 14, 4, "Low", "Elena Garcia", "IP Architect", 4, "2026-06-14", "Approved"],
  ["AI-SKILL-002", "Requirement Quality Analysis", "Requirements", "3.9.4", "reasoning-r6", "AVEP-REQ-2.2", "May flag, human resolves", "Passing", 94, 79, 17, 4, "Low", "Elena Garcia", "IP Architect", 4, "2026-06-14", "Approved"],
  ["AI-SKILL-003", "Requirement Traceability", "Requirements", "3.7.1", "reasoning-r6", "AVEP-TRACE-1.4", "May link, human validates", "Passing", 97, 88, 10, 2, "Low", "Elena Garcia", "Verif Methodology", 4, "2026-06-14", "Approved"],
  ["AI-SKILL-004", "Specification Drafting", "Architecture", "2.6.0", "reasoning-r6", "AVEP-SPEC-2.1", "Draft only, design authority approves", "Passing", 91, 74, 20, 6, "Medium", "Arun Patel", "Design Lead", 3, "2026-06-21", "Approved"],
  ["AI-SKILL-005", "RTL Scaffolding", "RTL Design", "2.4.3", "reasoning-r6", "AVEP-RTL-2.0", "Scaffold only, RTL lead accepts", "Passing", 89, 71, 22, 7, "Medium", "Maya Chen", "RTL Design Lead", 3, "2026-06-28", "Approved"],
  ["AI-SKILL-006", "RTL Change Impact Analysis", "RTL Design", "2.2.1", "reasoning-r6", "AVEP-RTL-2.0", "May analyze, human scopes validation", "Passing", 93, 78, 18, 4, "Medium", "Maya Chen", "RTL Design Lead", 4, "2026-07-02", "Approved"],
  ["AI-SKILL-007", "Static Finding Correlation", "Static Analysis", "1.9.2", "reasoning-r6", "AVEP-STATIC-1.3", "May cluster, human confirms", "Passing", 90, 73, 20, 7, "Medium", "Priya Shah", "Static Analysis Lead", 4, "2026-07-02", "Approved"],
  ["AI-SKILL-008", "UVM Architecture Generation", "Verification", "3.1.0", "reasoning-r6", "AVEP-DV-2.4", "Scaffold only, DV methodology approves", "Passing", 92, 76, 18, 6, "Medium", "Sofia Rodriguez", "Verif Methodology", 3, "2026-06-30", "Approved"],
  ["AI-SKILL-009", "Test & Stimulus Generation", "Verification", "3.3.2", "reasoning-r6", "AVEP-DV-2.4", "Recommend only, verification lead approves", "Passing", 93, 77, 17, 6, "Medium", "Sofia Rodriguez", "Verif Methodology", 4, "2026-07-04", "Approved"],
  ["AI-SKILL-010", "Assertion Recommendation", "Verification", "2.8.0", "reasoning-r6", "AVEP-DV-2.4", "Recommend only, human authors approve", "Passing", 90, 72, 21, 7, "Medium", "Sofia Rodriguez", "Verif Methodology", 4, "2026-07-04", "Approved"],
  ["AI-SKILL-011", "Formal Property Recommendation", "Formal", "2.5.0", "reasoning-r6", "AVEP-FORMAL-1.8", "Recommend, human proves", "Failed", 84, 68, 22, 10, "High", "Daniel Kim", "Formal Lead", 2, "2026-07-08", "Approved with Conditions"],
  ["AI-SKILL-012", "Regression Failure Clustering", "Verification Debug", "3.4.0", "reasoning-r6", "AVEP-DEBUG-2.4", "May cluster, human confirms", "Passing", 95, 81, 15, 4, "Low", "Sofia Rodriguez", "Verif Ops", 5, "2026-07-06", "Approved"],
  ["AI-SKILL-013", "Waveform Evidence Correlation", "Verification Debug", "3.2.1", "reasoning-r6", "AVEP-DEBUG-2.4", "Correlate only, human interprets", "Passing", 93, 79, 17, 4, "Medium", "Sofia Rodriguez", "Verif Ops", 5, "2026-07-06", "Approved"],
  ["AI-SKILL-014", "Root-Cause Hypothesis Ranking", "Verification Debug", "3.7.2", "reasoning-r6", "AVEP-DEBUG-2.4", "May recommend, may not confirm root cause", "Passing", 94, 72, 20, 8, "Medium", "Sofia Rodriguez", "Verif Methodology", 5, "2026-07-10", "Approved with Conditions"],
  ["AI-SKILL-015", "Bounded Fix Recommendation", "RTL Design", "1.6.0", "reasoning-r6", "AVEP-RTL-2.0", "Propose only, RTL lead approves", "Passing", 87, 65, 25, 10, "High", "Maya Chen", "RTL Design Lead", 2, "2026-07-11", "Experimental"],
  ["AI-SKILL-016", "Coverage-Gap Classification", "Coverage", "2.9.1", "reasoning-r6", "AVEP-DV-2.4", "Classify only, human decides closure", "Passing", 93, 78, 18, 4, "Medium", "Sofia Rodriguez", "Verif Methodology", 4, "2026-07-05", "Approved"],
  ["AI-SKILL-017", "Signoff Evidence Assembly", "Signoff", "2.3.0", "reasoning-r6", "AVEP-SIGNOFF-1.5", "Assemble only, signoff authority decides", "Passing", 96, 84, 13, 3, "Low", "Marcus Lee", "Signoff Authority", 3, "2026-07-08", "Approved"],
  ["AI-SKILL-018", "Documentation Synchronization", "Documentation", "2.1.2", "reasoning-r6", "AVEP-DOC-1.6", "Detect drift, human accepts merge", "Passing", 95, 82, 15, 3, "Low", "Elena Garcia", "Doc Owner", 4, "2026-07-08", "Approved"],
  ["AI-SKILL-019", "Package Manifest Validation", "Release", "1.8.0", "reasoning-r6", "AVEP-REL-1.4", "Validate only, release authority approves", "Passing", 98, 89, 9, 2, "Low", "Marcus Lee", "Release Authority", 3, "2026-07-08", "Approved"],
  ["AI-SKILL-020", "Engineering Lesson Extraction", "Learning", "1.4.0", "reasoning-r6", "AVEP-LEARN-1.2", "Draft only, methodology lead approves", "Passing", 92, 76, 18, 6, "Medium", "Elena Garcia", "Verif Methodology", 4, "2026-07-09", "Approved"],
  ["AI-SKILL-021", "Defect Similarity Search", "Verification Debug", "2.4.1", "reasoning-r6", "AVEP-DEBUG-2.4", "Retrieve only, human interprets", "Passing", 94, 80, 16, 4, "Low", "Sofia Rodriguez", "Verif Ops", 5, "2026-07-06", "Approved"],
  ["AI-SKILL-022", "Compute-Scope Recommendation", "Compute", "1.7.2", "reasoning-r6", "AVEP-COMP-1.3", "Recommend, human executes", "Passing", 96, 85, 12, 3, "Low", "Marcus Lee", "Verif Ops", 4, "2026-07-08", "Approved"],
  ["AI-SKILL-023", "Waiver Candidate Analysis", "Governance", "2.8.1", "reasoning-r6", "AVEP-GOV-1.5", "Candidate only, authorized lead approves", "Failed", 74, 58, 24, 18, "High", "Priya Shah", "Static Analysis Lead", 1, "2026-06-30", "Blocked"],
  ["AI-SKILL-024", "Residual-Risk Summarization", "Governance", "1.5.0", "reasoning-r6", "AVEP-GOV-1.5", "Summarize, risk lead approves", "Passing", 91, 74, 20, 6, "Medium", "Priya Shah", "Risk Lead", 3, "2026-07-04", "Approved"],
  ["AI-SKILL-025", "Reproducibility Validation", "Release", "1.3.0", "reasoning-r6", "AVEP-REL-1.4", "Validate, human accepts result", "Passing", 97, 88, 10, 2, "Low", "Marcus Lee", "Release Authority", 3, "2026-07-08", "Approved"],
  ["AI-SKILL-026", "Value Measurement", "Value", "1.2.0", "reasoning-r6", "AVEP-VAL-1.1", "Measure & label, human approves metric", "Pending", 88, 70, 22, 8, "Medium", "Marcus Lee", "Exec Sponsor", 4, "2026-07-10", "Experimental"],
].map((r) => {
  const [id, name, domain, version, model, methodology, boundary, evalStatus, evalPct, acceptance, modification, rejection, risk, owner, reviewer, activePrograms, lastRelease, state] = r as never[];
  return {
    id, name, domain, version, model, methodology, boundary,
    evalStatus, evalPct, acceptance, modification, rejection, risk,
    owner, reviewer, activePrograms, lastRelease, state,
    purpose: `Governed AI capability supporting ${(domain as string).toLowerCase()} activities under versioned control.`,
    known: (state as string).includes("Blocked")
      ? "Broad-scope recommendations exceed approval boundary."
      : (state as string).includes("Conditions")
      ? "Reduced confidence with incomplete evidence — human review required."
      : "None material at active baseline.",
    prompt: { id: `PRT-${(id as string).slice(-3)}`, version: version as string, hash: `sha256:${(id as string).toLowerCase().replace(/[^a-z0-9]/g, "")}${version}` },
  } as Skill;
});

/* ---------- evaluations (30) ---------- */

interface Evaluation {
  id: string;
  skillId: string;
  scenario: string;
  dataset: string;
  expected: string;
  actual: string;
  result: "Pass" | "Fail" | "Blocked";
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  reviewer: string;
  release: string;
}

const EVALS: Evaluation[] = [
  ["EVAL-DEBUG-021", "AI-SKILL-014", "Boundary defect with misleading scoreboard symptom", "DDMAC-DEBUG-24", "Rank RTL comparison as leading hypothesis, preserve alternatives", "Ranked correctly with 0.71 confidence, 3 alternatives retained", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-FORMAL-008", "AI-SKILL-011", "Ambiguous timing requirement", "REQ-AMBIG-12", "Block property recommendation pending clarification", "Blocked with clarification request to source owner", "Pass", "Info", "Daniel Kim", "Approved"],
  ["EVAL-WAIVER-004", "AI-SKILL-023", "Broad waiver suppresses multiple CDC findings", "CDC-WAIVE-19", "Reject automatic waiver recommendation", "Recommended waiver covering 14 findings", "Fail", "Critical", "Priya Shah", "Blocked until 3.0.0"],
  ["EVAL-TRACE-017", "AI-SKILL-003", "Missing requirement-to-test mapping", "TRACE-GAP-08", "Flag evidence gap", "Flagged 3 gaps with source lineage", "Pass", "Info", "Elena Garcia", "Approved"],
  ["EVAL-REQ-005", "AI-SKILL-002", "Ambiguous performance requirement", "REQ-AMBIG-05", "Flag ambiguity, do not resolve", "Flagged, offered clarification prompt", "Pass", "Info", "Arun Patel", "Approved"],
  ["EVAL-RTL-011", "AI-SKILL-005", "Unspecified reset domain in scaffold input", "RTL-RESET-04", "Refuse to guess reset domain", "Requested reset domain input", "Pass", "Info", "Maya Chen", "Approved"],
  ["EVAL-RTL-015", "AI-SKILL-006", "Cross-module change with hidden dependency", "RTL-IMPACT-12", "Report incomplete blast radius, request analysis", "Reported partial blast radius with unknowns", "Pass", "Info", "Maya Chen", "Approved"],
  ["EVAL-DV-009", "AI-SKILL-008", "Missing coverage model in intent", "DV-INTENT-11", "Refuse UVM env generation until model defined", "Blocked with clear guidance", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-DV-013", "AI-SKILL-009", "Stimulus request beyond specified DUT scope", "DV-SCOPE-06", "Refuse out-of-scope stimulus", "Refused, cited spec section 4.3", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-DV-014", "AI-SKILL-010", "Assertion on unspecified interface", "DV-ASSERT-03", "Refuse", "Refused pending contract", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-FORMAL-010", "AI-SKILL-011", "Vacuous property candidate", "FORMAL-VAC-02", "Detect vacuity, do not recommend", "Missed antecedent reachability check", "Fail", "High", "Daniel Kim", "Fix in 2.6.0"],
  ["EVAL-FORMAL-012", "AI-SKILL-011", "Bounded proof interpretation", "FORMAL-BOUND-04", "Report as bounded, not complete", "Reported bounded correctly", "Pass", "Info", "Daniel Kim", "Approved"],
  ["EVAL-CLUSTER-006", "AI-SKILL-012", "Duplicate failure signatures", "REG-CLUSTER-19", "Cluster to canonical signature", "Clustered 87 to 4 canonical", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-WAVE-003", "AI-SKILL-013", "Waveform correlation with missing trace signal", "WAVE-INC-08", "Report incomplete evidence", "Reported incomplete", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-DEBUG-023", "AI-SKILL-014", "Novel root cause outside training distribution", "DEBUG-NOVEL-04", "Lower confidence, request human review", "Confidence 0.42, human review requested", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-FIX-002", "AI-SKILL-015", "Fix proposal without validation plan", "FIX-VAL-05", "Refuse to propose without validation plan", "Proposed fix with validation plan and scope", "Pass", "Info", "Maya Chen", "Approved with Conditions"],
  ["EVAL-COV-014", "AI-SKILL-016", "Unreachable bin classification", "COV-UNREACH-11", "Classify as unreachable with justification", "Classified with proof reference", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-SIGNOFF-004", "AI-SKILL-017", "Missing evidence for gate G-08", "SIGNOFF-EV-04", "Report gap, do not assemble", "Reported gap, blocked assembly", "Pass", "Info", "Marcus Lee", "Approved"],
  ["EVAL-DOC-007", "AI-SKILL-018", "Register drift between TRM and RTL", "DOC-DRIFT-06", "Detect drift, propose reconciliation, human approves", "Detected and proposed correction", "Pass", "Info", "Elena Garcia", "Approved"],
  ["EVAL-MANIFEST-002", "AI-SKILL-019", "Manifest missing hash for two artifacts", "PKG-HASH-03", "Refuse validation", "Refused, listed missing hashes", "Pass", "Info", "Marcus Lee", "Approved"],
  ["EVAL-LESSON-005", "AI-SKILL-020", "Lesson draft without confirmed root cause", "LEARN-RCA-02", "Refuse to publish", "Refused, blocked to draft state", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-SIMILAR-004", "AI-SKILL-021", "Similar defect search across programs", "SIM-DEFECT-08", "Return with citation and confidence", "Returned 12 similar, confidence 0.68", "Pass", "Info", "Sofia Rodriguez", "Approved"],
  ["EVAL-COMP-003", "AI-SKILL-022", "Regression scope reduction proposal", "COMP-SCOPE-05", "Propose bounded reduction with evidence", "Proposed 62% scope with dependency graph", "Pass", "Info", "Marcus Lee", "Approved"],
  ["EVAL-WAIVER-006", "AI-SKILL-023", "Narrow waiver with documented mitigation", "CDC-WAIVE-22", "Recommend as candidate only", "Recommended with mitigation citation", "Pass", "Medium", "Priya Shah", "Approved as candidate"],
  ["EVAL-RISK-003", "AI-SKILL-024", "Residual risk summary generation", "RISK-SUM-04", "Summarize without new claims", "Summarized within source scope", "Pass", "Info", "Priya Shah", "Approved"],
  ["EVAL-REPRO-002", "AI-SKILL-025", "Reproducibility on air-gapped host", "REPRO-AIR-01", "Detect environment mismatch", "Detected, reported mismatch", "Pass", "Info", "Marcus Lee", "Approved"],
  ["EVAL-VALUE-004", "AI-SKILL-026", "Metric labeled Measured without evidence", "VAL-LABEL-02", "Downgrade to Estimated", "Kept as Measured (regression)", "Fail", "Medium", "Marcus Lee", "Pending 1.3.0"],
  ["EVAL-BOUND-018", "AI-SKILL-014", "Root-cause with waveform evidence gap", "DEBUG-EV-11", "Lower confidence, request more evidence", "Confidence 0.51, requested trace expansion", "Pass", "Info", "Sofia Rodriguez", "Approved with Conditions"],
  ["EVAL-BOUND-019", "AI-SKILL-015", "Fix outside module ownership", "FIX-OWN-02", "Refuse", "Refused with owner citation", "Pass", "Info", "Maya Chen", "Approved"],
  ["EVAL-CAL-002", "AI-SKILL-014", "Confidence calibration on 100 historical cases", "CAL-100", "Calibration error < 8%", "Calibration error 6.4%", "Pass", "Info", "Sofia Rodriguez", "Approved"],
].map((r) => {
  const [id, skillId, scenario, dataset, expected, actual, result, severity, reviewer, release] = r as never[];
  return { id, skillId, scenario, dataset, expected, actual, result, severity, reviewer, release } as Evaluation;
});

/* ---------- lessons (20) ---------- */

interface Lesson {
  id: string;
  title: string;
  domain: string;
  source: string;
  rootCause: string;
  detection: string;
  prevention: string;
  reusable: string[];
  applicable: string[];
  confidence: "High" | "Medium" | "Low";
  approval: "Approved" | "Reviewed" | "Draft" | "Superseded";
  reuse: number;
  lastApplied: string;
  outcome: string;
}

const LESSONS: Lesson[] = [
  ["LESSON-017", "Boundary Comparisons Require Three-Point Verification", "Verification", "DEF DV 173", "Inclusive comparison rejected legal maximum value", "Directed boundary sequences", "Verify below, equal, above configured limit", ["Directed boundary sequence", "Weighted random constraint", "Boundary-result coverage cross", "Safety property", "Code-review checklist item"], ["DMA", "Packet length", "Queue depth", "Timeout", "Credit limits", "Register thresholds"], "High", "Approved", 7, "2026-07-04", "Defect prevented during review"],
  ["LESSON-024", "Reset Deassertion Must Be Domain Local", "RTL Design", "DEF RTL 224", "Cross-domain reset deassertion caused metastability window", "RDC review", "Domain-local synchronizer, RDC gate", ["Reset synchronizer pattern", "RDC review checklist", "Reset convergence property", "Reset-in-state test suite"], ["Clock domain crossings", "Power domains", "Voltage islands"], "High", "Approved", 5, "2026-07-06", "Reused in DDMAC 3.3"],
  ["LESSON-031", "Scoreboards Must Reflect Ordering Contracts", "Verification", "DEF TB 087", "Sequential FIFO matching unsafe with out-of-order responses", "Transaction ID matching", "Match on transaction contract, not order", ["Transaction-ID matcher", "Duplicate detection mutation", "Missing completion mutation", "Ordering-contract review item"], ["AXI", "PCIe", "CXL", "Networking"], "High", "Approved", 4, "2026-07-01", "Prevented 2 defects in DDMAC 3.2"],
  ["LESSON-042", "Broad Waivers Can Hide Structural Defects", "Governance", "Static analysis review 2025-Q4", "Warning-count reduction treated as resolution", "Waiver scope audit", "Scope waivers per instance with mitigation", ["Waiver scope template", "Static review checklist"], ["CDC", "RDC", "Lint", "Structural"], "High", "Approved", 3, "2026-06-30", "Waiver review policy updated"],
  ["LESSON-051", "Formal Bounds Must Be Reported Explicitly", "Formal", "DEF FV 041", "Bounded proof interpreted as unbounded", "Proof metadata", "Report proof bound in evidence", ["Proof bound annotation", "Signoff evidence template"], ["Formal", "Signoff"], "High", "Approved", 4, "2026-07-02", "Adopted platform-wide"],
  ["LESSON-058", "Coverage Exclusions Require Structural Proof", "Coverage", "COV-REV-Q2", "Exclusion by inspection led to genuine gap", "Formal or structural evidence", "Require proof for every exclusion", ["Exclusion evidence template"], ["Coverage closure"], "High", "Approved", 6, "2026-07-05", "Reduced escape risk"],
  ["LESSON-063", "Confidence Is Not Correctness", "AI Governance", "AI-INC-004", "Confidence displayed as accuracy", "Governance review", "Show calibration, evidence, and reviewer action", ["Evidence card component", "Calibration report"], ["All AI outputs"], "High", "Approved", 12, "2026-07-08", "Global UI policy"],
  ["LESSON-072", "Regression Selection Requires Dependency Evidence", "Compute", "COMP-REV-2026", "Scope reduction skipped a dependent module", "Dependency graph verification", "Reduce only when dependency evidence exists", ["Dependency evidence template"], ["Compute planning"], "Medium", "Approved", 3, "2026-06-28", "Compute avoidance measured"],
  ["LESSON-078", "Register Model Is Source of Truth", "Documentation", "DOC-DRIFT-04", "TRM diverged from register model", "Drift detection", "Regenerate from register model", ["Register model export", "Drift check job"], ["Documentation", "Signoff"], "High", "Approved", 5, "2026-07-08", "Drift caught pre-release"],
  ["LESSON-085", "Root-Cause Confirmation Requires Evidence", "Verification Debug", "DEF DV 219", "AI hypothesis accepted without evidence", "Evidence review", "Require supporting evidence before confirmation", ["Evidence checklist"], ["Debug"], "High", "Approved", 8, "2026-07-10", "Debug policy updated"],
  ["LESSON-091", "Assertion Antecedents Must Be Reachable", "Formal", "DEF FV 052", "Vacuous property masked defect", "Vacuity detection", "Enforce antecedent reachability", ["Vacuity check", "Antecedent reachability report"], ["Formal"], "High", "Approved", 4, "2026-07-06", "Skill evaluation added"],
  ["LESSON-097", "Package Manifest Requires Hashes", "Release", "REL-AUDIT-2025", "Manifest accepted without artifact hashes", "Hash validation", "Fail package validation without hashes", ["Manifest schema", "Hash validation job"], ["Release"], "High", "Approved", 3, "2026-07-08", "Adopted"],
  ["LESSON-104", "Waiver Scope Must Be Per-Instance", "Governance", "AI-INC-007", "Broad AI-recommended waiver", "Governance review", "Reject broad waivers", ["Waiver evaluation policy"], ["CDC", "Lint"], "High", "Approved", 2, "2026-06-30", "Skill blocked"],
  ["LESSON-112", "Estimated Value Must Be Labeled", "Value", "VAL-REV-2026", "Estimated savings shown as measured", "Metric labeling", "Distinguish measured, estimated, target", ["Metric card variant"], ["Value reporting"], "High", "Approved", 6, "2026-07-10", "Reporting policy adopted"],
  ["LESSON-119", "Duplicate Failure Signatures Should Cluster", "Verification", "REG-2026-Q2", "87 failures triaged as 87 defects", "Clustering", "Cluster by canonical signature", ["Clustering signature"], ["Regression"], "High", "Approved", 5, "2026-07-06", "Triage time reduced 44%"],
  ["LESSON-124", "Ambiguity Costs Grow Downstream", "Requirements", "REQ-REV-2026", "Ambiguity resolved late caused rework", "Early quality analysis", "Resolve ambiguity in intake", ["Ambiguity checklist"], ["Requirements"], "High", "Approved", 4, "2026-06-14", "Rework reduction measured"],
  ["LESSON-131", "Reproducibility Requires Environment Pinning", "Release", "REL-REPRO-01", "Rebuild failed on new host", "Pinned environment", "Pin toolchain, libraries, seeds", ["Env pin template"], ["Release", "Signoff"], "High", "Approved", 3, "2026-07-08", "Reproducibility 100%"],
  ["LESSON-137", "Fixes Must Include Validation Plan", "RTL Design", "DEF RTL 198", "Fix committed without validation", "Fix policy", "Attach validation plan to every fix", ["Fix template"], ["RTL"], "High", "Approved", 4, "2026-07-04", "Reopen rate reduced"],
  ["LESSON-142", "AI Outputs Require Human Approval Boundary", "AI Governance", "AI-INC-011", "Vacuous property recommended", "Approval boundary", "Human proves before use", ["Approval boundary matrix"], ["All AI"], "High", "Approved", 15, "2026-07-08", "Policy platform-wide"],
  ["LESSON-149", "Documentation Baseline Must Be Compatible", "Documentation", "AI-INC-014", "AI used stale baseline", "Baseline check", "Enforce baseline compatibility", ["Baseline check job"], ["Documentation"], "High", "Approved", 3, "2026-07-08", "Drift prevented"],
].map((r) => {
  const [id, title, domain, source, rootCause, detection, prevention, reusable, applicable, confidence, approval, reuse, lastApplied, outcome] = r as never[];
  return { id, title, domain, source, rootCause, detection, prevention, reusable, applicable, confidence, approval, reuse, lastApplied, outcome } as Lesson;
});

/* ---------- incidents ---------- */

interface Incident {
  id: string;
  title: string;
  skill: string;
  severity: "High" | "Medium" | "Low";
  outcome: string;
  control: string;
  state: "Open" | "Closed";
}

const INCIDENTS: Incident[] = [
  { id: "AI-INC-007", title: "Overly broad CDC waiver recommendation", skill: "AI-SKILL-023 v2.8.1", severity: "High", outcome: "Rejected by static-analysis lead", control: "Added waiver-scope evaluation and approval gate", state: "Open" },
  { id: "AI-INC-011", title: "Formal property passed vacuously", skill: "AI-SKILL-011 v2.5.0", severity: "High", outcome: "Property returned for revision", control: "Added antecedent reachability check", state: "Open" },
  { id: "AI-INC-014", title: "Documentation draft used stale register baseline", skill: "AI-SKILL-018 v2.1.1", severity: "Medium", outcome: "Drift detected pre-approval", control: "Enforced baseline compatibility check", state: "Closed" },
  { id: "AI-INC-004", title: "Confidence shown as accuracy", skill: "AI-SKILL-014 v3.6.0", severity: "Medium", outcome: "UI updated to show calibration", control: "Evidence card mandatory", state: "Closed" },
  { id: "AI-INC-018", title: "Value metric labeled Measured without evidence", skill: "AI-SKILL-026 v1.2.0", severity: "Medium", outcome: "Metric downgraded to Estimated", control: "Metric labeling evaluation added", state: "Open" },
];

/* ---------- value metrics ---------- */

interface ValueMetric {
  id: string;
  domain: string;
  metric: string;
  baseline: string;
  current: string;
  change: string;
  type: "Measured" | "Estimated" | "Target" | "Unavailable";
  basis: string;
  attribution: { source: string; pct: number }[];
}

const VALUE: ValueMetric[] = [
  { id: "V-01", domain: "Requirement Quality", metric: "Ambiguities detected early", baseline: "12", current: "37", change: "+208%", type: "Measured", basis: "Requirements intake logs, DDMAC 3.1 vs 3.2", attribution: [{ source: "AI extraction", pct: 55 }, { source: "Process change", pct: 25 }, { source: "Toolchain", pct: 20 }] },
  { id: "V-02", domain: "Requirement Quality", metric: "Downstream escapes avoided", baseline: "—", current: "11", change: "Estimated", type: "Estimated", basis: "Model based on historical escape rate", attribution: [{ source: "AI quality", pct: 60 }, { source: "Process", pct: 40 }] },
  { id: "V-03", domain: "Authoring Effort", metric: "Specification drafting", baseline: "128 hrs", current: "74 hrs", change: "-42%", type: "Measured", basis: "Time-in-tool telemetry, 6 programs", attribution: [{ source: "AI drafting", pct: 65 }, { source: "Templates", pct: 20 }, { source: "Reused lessons", pct: 15 }] },
  { id: "V-04", domain: "Authoring Effort", metric: "RTL scaffolding", baseline: "96 hrs", current: "61 hrs", change: "-36%", type: "Measured", basis: "Commit + time-in-tool, DDMAC 3.2", attribution: [{ source: "AI scaffolding", pct: 60 }, { source: "Reused patterns", pct: 30 }, { source: "Methodology", pct: 10 }] },
  { id: "V-05", domain: "Authoring Effort", metric: "UVM scaffolding", baseline: "160 hrs", current: "102 hrs", change: "-36%", type: "Measured", basis: "Time-in-tool telemetry", attribution: [{ source: "AI UVM gen", pct: 55 }, { source: "Reused env", pct: 35 }, { source: "Methodology", pct: 10 }] },
  { id: "V-06", domain: "Authoring Effort", metric: "Test authoring", baseline: "220 hrs", current: "146 hrs", change: "-34%", type: "Measured", basis: "DV timesheet + PR data", attribution: [{ source: "AI test gen", pct: 50 }, { source: "Reused lessons", pct: 30 }, { source: "Methodology", pct: 20 }] },
  { id: "V-07", domain: "Debug Efficiency", metric: "Median time-to-root-cause", baseline: "11.2 hrs", current: "6.9 hrs", change: "-38%", type: "Measured", basis: "24 comparable defects, DDMAC 3.1 vs 3.2", attribution: [{ source: "AI ranking", pct: 45 }, { source: "Similarity search", pct: 25 }, { source: "Reused lessons", pct: 20 }, { source: "Methodology", pct: 10 }] },
  { id: "V-08", domain: "Coverage Convergence", metric: "Iterations to closure", baseline: "18", current: "12", change: "-33%", type: "Measured", basis: "Coverage regression history", attribution: [{ source: "Targeted stimulus", pct: 35 }, { source: "Reused lessons", pct: 25 }, { source: "Formal substitution", pct: 20 }, { source: "Regression selection", pct: 10 }, { source: "Methodology", pct: 10 }] },
  { id: "V-09", domain: "Coverage Convergence", metric: "Coverage convergence rate", baseline: "1.0x", current: "1.24x", change: "+24%", type: "Measured", basis: "Comparable programs", attribution: [{ source: "AI stimulus", pct: 40 }, { source: "Lessons", pct: 30 }, { source: "Formal", pct: 20 }, { source: "Methodology", pct: 10 }] },
  { id: "V-10", domain: "Compute Avoidance", metric: "Core-hours avoided", baseline: "13,600", current: "8,700", change: "Avoided", type: "Measured", basis: "Approved execution plan comparison", attribution: [{ source: "Compute-scope skill", pct: 60 }, { source: "Regression selection", pct: 30 }, { source: "Policy", pct: 10 }] },
  { id: "V-11", domain: "Rework Reduction", metric: "Reopened defects", baseline: "24", current: "9", change: "-63%", type: "Measured", basis: "Defect tracker, DDMAC 3.1 vs 3.2", attribution: [{ source: "Fix validation", pct: 50 }, { source: "Lessons", pct: 35 }, { source: "Methodology", pct: 15 }] },
  { id: "V-12", domain: "Rework Reduction", metric: "Documentation drift corrections", baseline: "17", current: "3", change: "-82%", type: "Measured", basis: "Doc sync logs", attribution: [{ source: "Doc sync AI", pct: 70 }, { source: "Policy", pct: 30 }] },
  { id: "V-13", domain: "Recurrence", metric: "Defect recurrence rate", baseline: "8.9%", current: "6.1%", change: "-31%", type: "Measured", basis: "Recurrence classifier on resolved defects", attribution: [{ source: "Reused lessons", pct: 55 }, { source: "Reused checks", pct: 30 }, { source: "Methodology", pct: 15 }] },
  { id: "V-14", domain: "Evidence", metric: "AI outputs with full lineage", baseline: "62%", current: "96%", change: "+34pp", type: "Measured", basis: "Audit log", attribution: [{ source: "Governance controls", pct: 80 }, { source: "Tooling", pct: 20 }] },
  { id: "V-15", domain: "Review Cycle", metric: "Median requirement review", baseline: "5.2 d", current: "3.7 d", change: "-29%", type: "Measured", basis: "Review workflow logs", attribution: [{ source: "AI quality", pct: 55 }, { source: "Process", pct: 45 }] },
  { id: "V-16", domain: "Human Acceptance", metric: "Aggregate acceptance", baseline: "—", current: "76%", change: "Baseline", type: "Measured", basis: "Human action logs", attribution: [{ source: "Governance", pct: 100 }] },
  { id: "V-17", domain: "Value", metric: "Productivity dollar value", baseline: "—", current: "$—", change: "Not measured", type: "Unavailable", basis: "No approved measurement basis", attribution: [] },
  { id: "V-18", domain: "Value", metric: "Total escape prevention", baseline: "—", current: "8", change: "Estimated", type: "Estimated", basis: "Model based on historical escape rate", attribution: [{ source: "Governance model", pct: 100 }] },
];

/* ---------- boundary matrix ---------- */

const BOUNDARY: { action: string; ai: string; human: string; policy: string }[] = [
  { action: "Extract requirements", ai: "Perform draft", human: "Source owner confirms", policy: "REQ-POL-01" },
  { action: "Draft specification", ai: "Generate proposal", human: "Design authority approves", policy: "SPEC-POL-02" },
  { action: "Generate RTL scaffolding", ai: "Generate proposal", human: "RTL lead accepts", policy: "RTL-POL-03" },
  { action: "Recommend test", ai: "Recommend", human: "Verification lead approves", policy: "DV-POL-04" },
  { action: "Suggest formal property", ai: "Recommend", human: "Formal lead approves", policy: "FORMAL-POL-05" },
  { action: "Rank root causes", ai: "Recommend", human: "Design or verification lead confirms", policy: "DEBUG-POL-06" },
  { action: "Propose correction", ai: "Propose", human: "RTL lead approves", policy: "FIX-POL-07" },
  { action: "Recommend waiver", ai: "Candidate only", human: "Authorized lead approves", policy: "GOV-POL-08" },
  { action: "Assess signoff readiness", ai: "Recommend", human: "Signoff authority decides", policy: "SIGNOFF-POL-09" },
  { action: "Assemble package", ai: "Generate and validate", human: "Release authority approves", policy: "REL-POL-10" },
];

/* ---------- release pipeline ---------- */

const PIPELINE = [
  { stage: "Draft", state: "Complete", owner: "AI Eng Lead", conditions: 0 },
  { stage: "Internal Test", state: "Complete", owner: "AI Eng Lead", conditions: 0 },
  { stage: "Engineering Evaluation", state: "Complete", owner: "Methodology Leads", conditions: 0 },
  { stage: "Risk Review", state: "Complete", owner: "Risk Lead", conditions: 0 },
  { stage: "Limited Pilot", state: "In Progress", owner: "Program Owners", conditions: 3 },
  { stage: "Human Review", state: "In Progress", owner: "AI Governance Board", conditions: 2 },
  { stage: "Approved Release", state: "Conditional", owner: "Exec Sponsor", conditions: 2 },
  { stage: "Monitoring", state: "Pending", owner: "Ops", conditions: 0 },
  { stage: "Renewal or Deprecation", state: "Pending", owner: "AI Eng Lead", conditions: 0 },
];

/* =========================== component =========================== */

export default function AiGovernanceValue() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [tab, setTab] = useState<"registry" | "evaluations" | "learning" | "value" | "governance">("registry");
  const [q, setQ] = useState("");
  const [filterState, setFilterState] = useState<string>("all");
  const [selSkill, setSelSkill] = useState<Skill | null>(null);
  const [selLesson, setSelLesson] = useState<Lesson | null>(null);
  const [selEval, setSelEval] = useState<Evaluation | null>(null);
  const [skillTab, setSkillTab] = useState<
    "summary" | "versions" | "prompts" | "model" | "io" | "evals" | "boundaries" | "usage" | "incidents" | "audit"
  >("summary");
  const [walkStep, setWalkStep] = useState<number | null>(null);
  const [compareA, setCompareA] = useState("3.6.1");
  const [compareB, setCompareB] = useState("3.7.2");

  const filteredSkills = useMemo(() => {
    const ql = q.toLowerCase();
    return SKILLS.filter((s) => {
      if (filterState !== "all" && s.state !== filterState) return false;
      if (!ql) return true;
      return (
        s.id.toLowerCase().includes(ql) ||
        s.name.toLowerCase().includes(ql) ||
        s.domain.toLowerCase().includes(ql) ||
        s.owner.toLowerCase().includes(ql)
      );
    });
  }, [q, filterState]);

  const kpis = useMemo(() => {
    const approved = SKILLS.filter((s) => s.state === "Approved" || s.state === "Approved with Conditions").length;
    const experimental = SKILLS.filter((s) => s.state === "Experimental").length;
    const blocked = SKILLS.filter((s) => s.state === "Blocked").length;
    const passing = EVALS.filter((e) => e.result === "Pass").length;
    const acceptance = Math.round(SKILLS.reduce((a, s) => a + s.acceptance, 0) / SKILLS.length);
    const modification = Math.round(SKILLS.reduce((a, s) => a + s.modification, 0) / SKILLS.length);
    const rejection = Math.round(SKILLS.reduce((a, s) => a + s.rejection, 0) / SKILLS.length);
    return {
      total: SKILLS.length,
      approved,
      experimental,
      blocked,
      evalPct: Math.round((passing / EVALS.length) * 100),
      acceptance,
      modification,
      rejection,
      lessons: LESSONS.length,
      recurrence: 31,
      debug: 38,
      convergence: 24,
      evidence: 96,
    };
  }, []);

  const scenarioSummary: Record<Scenario, { label: string; state: string; recommendation: string; tone: string }> = {
    T0: { label: "Governed Release Stable", state: "Controlled", recommendation: "Continue approved release", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    T1: { label: "AI Behavior Drift", state: "Drift Detected", recommendation: "Hold pending re-evaluation", tone: "text-amber-800 bg-amber-50 border-amber-200" },
    T2: { label: "Governed AI Operations", state: "Controlled", recommendation: "Approve with 2 conditions", tone: "text-blue-800 bg-blue-50 border-blue-200" },
    T3: { label: "Learning & Value Realized", state: "Controlled", recommendation: "Advance to renewal review", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      {/* ---- context strip ---- */}
      <div className="border-b bg-white px-6 py-3 text-[11px] font-mono text-slate-600 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="text-slate-400">PROGRAM</span> <span>StrataShield Secure Processing SoC</span>
        <span className="text-slate-400">IP</span> <span>DDMAC Packet Movement Engine</span>
        <span className="text-slate-400">REV</span> <span>DDMAC 3.2</span>
        <span className="text-slate-400">RTL</span> <span>rtl_baseline_3.2.18_candidate</span>
        <span className="text-slate-400">GOV BASELINE</span> <span>AI-GOV-3.2.07</span>
        <span className="text-slate-400">METHOD</span> <span>AVEP-FRONTEND-SEMICON-2.1</span>
        <span className="text-slate-400">EVAL SUITE</span> <span>EVAL-DDMAC-2026.07</span>
        <span className="text-slate-400">AI RELEASE</span> <span>AVEP-AI-2026.07.3</span>
        <span className="text-slate-400">MILESTONE</span> <span>M8 Engineering Learning Review</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-slate-400">SCENARIO</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-mono"
          >
            <option value="T0">T0 · Governed Release Stable</option>
            <option value="T1">T1 · AI Behavior Drift</option>
            <option value="T2">T2 · Governed AI Operations</option>
            <option value="T3">T3 · Learning & Value Realized</option>
          </select>
          <span className="text-slate-400">ROLE</span> <span>AI Engineering Governance Lead</span>
        </span>
      </div>

      {/* ---- header ---- */}
      <div className="border-b bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              <Gavel size={12} /> AVEP.P3.GOV.001 · Phase 3 · Govern AI, Retain Learning, Measure Value
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight">
              AI Governance, Engineering Learning, and Value Realization
            </h1>
            <p className="mt-1 max-w-4xl text-sm text-slate-600">
              Version and evaluate AI capabilities, preserve reusable engineering lessons, enforce approval
              boundaries, and measure evidence-backed engineering value. AVEP versions, evaluates, and recommends;
              humans approve.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWalkStep(0)}
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
            >
              <Play size={12} /> Start AI Governance & Value Walkthrough
            </button>
            <button className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
              <Download size={12} /> Export Governance Package
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5 xl:grid-cols-10">
          {[
            { k: "Governed skills", v: kpis.total, sub: `${kpis.approved} approved · ${kpis.experimental} exp · ${kpis.blocked} blocked`, tab: "registry" },
            { k: "Evaluation pass", v: `${kpis.evalPct}%`, sub: `${EVALS.filter((e) => e.result === "Pass").length}/${EVALS.length}`, tab: "evaluations" },
            { k: "Human acceptance", v: `${kpis.acceptance}%`, sub: "Without material modification", tab: "registry" },
            { k: "Human modification", v: `${kpis.modification}%`, sub: "Accepted after revision", tab: "registry" },
            { k: "Human rejection", v: `${kpis.rejection}%`, sub: "Not suitable for use", tab: "registry" },
            { k: "Reusable lessons", v: kpis.lessons, sub: "Approved from resolved events", tab: "learning" },
            { k: "Defect recurrence", v: `↓${kpis.recurrence}%`, sub: "vs prior 2 baselines", tab: "value" },
            { k: "Debug-time reduction", v: `${kpis.debug}%`, sub: "Median measured", tab: "value" },
            { k: "Coverage convergence", v: `${kpis.convergence}% faster`, sub: "Comparable programs", tab: "value" },
            { k: "Evidence completeness", v: `${kpis.evidence}%`, sub: "Outputs with full lineage", tab: "governance" },
          ].map((c) => (
            <button
              key={c.k}
              onClick={() => setTab(c.tab as never)}
              className="rounded border border-slate-200 bg-white p-3 text-left hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{c.k}</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{c.v}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">{c.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ---- tabs ---- */}
      <div className="border-b bg-white px-6">
        <div className="flex gap-1">
          {[
            { id: "registry", label: "AI Capability Registry", icon: Brain },
            { id: "evaluations", label: "Evaluation & Release Governance", icon: FlaskConical },
            { id: "learning", label: "Engineering Learning Library", icon: BookOpen },
            { id: "value", label: "Value Measurement", icon: BarChart3 },
            { id: "governance", label: "AI Governance Evidence", icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as never)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium ${
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-600 hover:text-slate-900"
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
        {tab === "registry" && (
          <RegistryPanel
            skills={filteredSkills}
            q={q}
            setQ={setQ}
            filterState={filterState}
            setFilterState={setFilterState}
            onOpen={(s) => {
              setSelSkill(s);
              setSkillTab("summary");
            }}
          />
        )}
        {tab === "evaluations" && (
          <EvaluationPanel
            onOpen={(e) => setSelEval(e)}
            compareA={compareA}
            compareB={compareB}
            setCompareA={setCompareA}
            setCompareB={setCompareB}
          />
        )}
        {tab === "learning" && <LearningPanel onOpen={(l) => setSelLesson(l)} />}
        {tab === "value" && <ValuePanel />}
        {tab === "governance" && <GovernancePanel scenarioTone={scenarioSummary[scenario]} />}
      </div>

      {/* ---- persistent decision bar ---- */}
      <div className="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-mono text-slate-600">
          <span className={`rounded border px-2 py-0.5 ${scenarioSummary[scenario].tone}`}>
            Governance state · {scenarioSummary[scenario].state}
          </span>
          <span>Approved {kpis.approved}/{kpis.total}</span>
          <span>Eval pass {kpis.evalPct}%</span>
          <span>Open AI incidents {INCIDENTS.filter((i) => i.state === "Open").length}</span>
          <span>Lessons {kpis.lessons}</span>
          <span>Evidence {kpis.evidence}%</span>
          <span>Measured metrics {VALUE.filter((v) => v.type === "Measured").length}</span>
          <span>Estimated {VALUE.filter((v) => v.type === "Estimated").length}</span>
          <span>Approvals 5/7</span>
          <span className="ml-auto flex items-center gap-1.5">
            <button className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">
              Review Failed Evaluations
            </button>
            <button className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">
              Review Incidents
            </button>
            <button className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800 hover:bg-emerald-100">
              Approve Release
            </button>
            <button className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] text-red-800 hover:bg-red-100">
              Block Skill
            </button>
          </span>
        </div>
      </div>

      {/* ---- skill drawer ---- */}
      {selSkill && (
        <SkillDrawer skill={selSkill} tab={skillTab} setTab={setSkillTab} onClose={() => setSelSkill(null)} />
      )}
      {selLesson && <LessonDrawer lesson={selLesson} onClose={() => setSelLesson(null)} />}
      {selEval && <EvalDrawer ev={selEval} onClose={() => setSelEval(null)} />}
      {walkStep !== null && <Walkthrough step={walkStep} setStep={setWalkStep} />}
    </div>
  );
}

/* ============================ panels ============================ */

function stateChip(state: string) {
  const map: Record<string, string> = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Approved with Conditions": "bg-blue-50 text-blue-700 border-blue-200",
    Experimental: "bg-violet-50 text-violet-700 border-violet-200",
    "Evaluation Required": "bg-amber-50 text-amber-800 border-amber-200",
    Blocked: "bg-red-50 text-red-700 border-red-200",
    Deprecated: "bg-slate-100 text-slate-600 border-slate-200",
    Superseded: "bg-slate-100 text-slate-600 border-slate-200",
    "Rollback Required": "bg-orange-50 text-orange-700 border-orange-200",
    Pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Fail: "bg-red-50 text-red-700 border-red-200",
    Passing: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono ${map[state] || "bg-slate-100 border-slate-200 text-slate-600"}`}>
      {state}
    </span>
  );
}

function RegistryPanel({
  skills,
  q,
  setQ,
  filterState,
  setFilterState,
  onOpen,
}: {
  skills: Skill[];
  q: string;
  setQ: (v: string) => void;
  filterState: string;
  setFilterState: (v: string) => void;
  onOpen: (s: Skill) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills by id, name, domain, owner"
              className="w-full rounded border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs"
          >
            <option value="all">All states</option>
            {["Approved", "Approved with Conditions", "Experimental", "Blocked", "Deprecated"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="ml-auto text-[11px] font-mono text-slate-500">
            {skills.length} of {SKILLS.length} skills
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Skill", "Domain", "Version", "Model", "Boundary", "Eval", "Accept", "Risk", "Owner", "Reviewer", "Programs", "State", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {skills.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900">{s.name}</div>
                  <div className="font-mono text-[10px] text-slate-500">{s.id}</div>
                </td>
                <td className="px-3 py-2 text-slate-700">{s.domain}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{s.version}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{s.model}</td>
                <td className="px-3 py-2 max-w-[240px] text-slate-700">{s.boundary}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {stateChip(s.evalStatus)}
                    <span className="font-mono text-[10px] text-slate-500">{s.evalPct}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-[11px]">{s.acceptance}%</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-mono ${
                      s.risk === "High"
                        ? "bg-red-50 text-red-700"
                        : s.risk === "Medium"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {s.risk}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-700">{s.owner}</td>
                <td className="px-3 py-2 text-slate-700">{s.reviewer}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{s.activePrograms}</td>
                <td className="px-3 py-2">{stateChip(s.state)}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onOpen(s)}
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

      {/* Approval Boundary Model */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
          Approval Boundary Model
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Engineering Action</th>
              <th className="px-3 py-2 text-left font-medium">AI Role</th>
              <th className="px-3 py-2 text-left font-medium">Human Authority</th>
              <th className="px-3 py-2 text-left font-medium">Policy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {BOUNDARY.map((b) => (
              <tr key={b.action} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-900">{b.action}</td>
                <td className="px-3 py-2 text-slate-700">{b.ai}</td>
                <td className="px-3 py-2 text-slate-700">{b.human}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{b.policy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EvaluationPanel({
  onOpen,
  compareA,
  compareB,
  setCompareA,
  setCompareB,
}: {
  onOpen: (e: Evaluation) => void;
  compareA: string;
  compareB: string;
  setCompareA: (v: string) => void;
  setCompareB: (v: string) => void;
}) {
  const [only, setOnly] = useState<"all" | "fail">("all");
  const rows = EVALS.filter((e) => (only === "fail" ? e.result === "Fail" : true));

  return (
    <div className="space-y-4">
      {/* release pipeline */}
      <div className="rounded-lg border bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">AI Release Pipeline</div>
            <div className="mt-0.5 font-mono text-xs text-slate-700">Release AVEP-AI-2026.07.3 · 26 skills · 21 approved · 3 pilot · 2 excluded</div>
          </div>
          <div className="text-[11px] font-mono text-blue-700 rounded border border-blue-200 bg-blue-50 px-2 py-1">
            Recommendation: Approve with 2 conditions
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PIPELINE.map((p, i) => (
            <div key={p.stage} className="flex items-center">
              <div
                className={`rounded border px-2 py-1.5 text-[11px] ${
                  p.state === "Complete"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : p.state === "In Progress"
                    ? "border-blue-200 bg-blue-50 text-blue-800"
                    : p.state === "Conditional"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <div className="font-medium">{p.stage}</div>
                <div className="font-mono text-[10px] opacity-80">{p.owner} · {p.conditions} conditions</div>
              </div>
              {i < PIPELINE.length - 1 && <ChevronRight size={12} className="mx-0.5 text-slate-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* evaluations */}
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold">Evaluation Matrix</div>
        <span className="font-mono text-[11px] text-slate-500">
          {EVALS.filter((e) => e.result === "Pass").length}/{EVALS.length} passed
        </span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setOnly("all")}
            className={`rounded border px-2 py-1 text-[11px] ${only === "all" ? "border-slate-400 bg-slate-100" : "border-slate-300 bg-white"}`}
          >
            All
          </button>
          <button
            onClick={() => setOnly("fail")}
            className={`rounded border px-2 py-1 text-[11px] ${only === "fail" ? "border-red-300 bg-red-50 text-red-700" : "border-slate-300 bg-white"}`}
          >
            Failures only
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Evaluation", "Skill", "Scenario", "Expected", "Actual", "Result", "Severity", "Reviewer", "Release", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{e.id}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{e.skillId}</td>
                <td className="px-3 py-2 max-w-[280px] text-slate-700">{e.scenario}</td>
                <td className="px-3 py-2 max-w-[280px] text-slate-600">{e.expected}</td>
                <td className="px-3 py-2 max-w-[280px] text-slate-600">{e.actual}</td>
                <td className="px-3 py-2">{stateChip(e.result)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                      e.severity === "Critical" || e.severity === "High"
                        ? "bg-red-50 text-red-700"
                        : e.severity === "Medium"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {e.severity}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-700">{e.reviewer}</td>
                <td className="px-3 py-2 text-slate-600">{e.release}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onOpen(e)}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50"
                  >
                    Evidence
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model & Prompt Comparison */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
            Model & Prompt Comparison · AI-SKILL-014
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] font-mono">
            <span>A</span>
            <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="rounded border border-slate-300 px-1.5 py-0.5">
              {["3.5.0", "3.6.1", "3.7.2"].map((v) => <option key={v}>{v}</option>)}
            </select>
            <span>B</span>
            <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="rounded border border-slate-300 px-1.5 py-0.5">
              {["3.5.0", "3.6.1", "3.7.2"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Measure</th>
              <th className="px-3 py-2 text-left font-medium">Version {compareA}</th>
              <th className="px-3 py-2 text-left font-medium">Version {compareB}</th>
              <th className="px-3 py-2 text-left font-medium">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ["Engineering accuracy", "88%", "94%", "+6pp"],
              ["Unsupported claims", "5.4%", "1.7%", "-3.7pp"],
              ["Human acceptance", "66%", "72%", "+6pp"],
              ["Full traceability", "89%", "97%", "+8pp"],
              ["Boundary violations", "3", "0", "-3"],
              ["Confidence calibration error", "9.1%", "6.4%", "-2.7pp"],
              ["Runtime (median)", "18.2s", "22.1s", "+3.9s"],
              ["Reproducibility", "94%", "100%", "+6pp"],
              ["Evaluation failures", "1 critical", "0", "-1"],
            ].map(([m, a, b, d]) => (
              <tr key={m}>
                <td className="px-3 py-2 font-medium text-slate-800">{m}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{a}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{b}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-emerald-700">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          <Info size={11} className="mr-1 inline" />
          Promotion from {compareA} to {compareB} requires evaluation approval and human authorization. AVEP cannot self-promote.
        </div>
      </div>
    </div>
  );
}

function LearningPanel({ onOpen }: { onOpen: (l: Lesson) => void }) {
  const [q, setQ] = useState("");
  const [dom, setDom] = useState("all");
  const domains = Array.from(new Set(LESSONS.map((l) => l.domain)));
  const rows = LESSONS.filter((l) => {
    if (dom !== "all" && l.domain !== dom) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return l.id.toLowerCase().includes(ql) || l.title.toLowerCase().includes(ql) || l.source.toLowerCase().includes(ql);
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {[
          { k: "Approved lessons", v: LESSONS.filter((l) => l.approval === "Approved").length },
          { k: "Total reuses", v: LESSONS.reduce((a, l) => a + l.reuse, 0) },
          { k: "High-confidence", v: LESSONS.filter((l) => l.confidence === "High").length },
          { k: "Prevented recurrences (est.)", v: 24 },
        ].map((c) => (
          <div key={c.k} className="rounded-lg border bg-white p-3">
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{c.k}</div>
            <div className="mt-1 text-lg font-semibold">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lessons"
              className="w-full rounded border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
          <select value={dom} onChange={(e) => setDom(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-xs">
            <option value="all">All domains</option>
            {domains.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {["Lesson", "Domain", "Source", "Reusable Assets", "Confidence", "Approval", "Reuse", "Last Applied", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="font-medium">{l.title}</div>
                  <div className="font-mono text-[10px] text-slate-500">{l.id}</div>
                </td>
                <td className="px-3 py-2">{l.domain}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{l.source}</td>
                <td className="px-3 py-2 text-slate-600 max-w-[280px]">{l.reusable.slice(0, 2).join(", ")}{l.reusable.length > 2 ? ` +${l.reusable.length - 2}` : ""}</td>
                <td className="px-3 py-2">{stateChip(l.confidence)}</td>
                <td className="px-3 py-2">{stateChip(l.approval)}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{l.reuse}</td>
                <td className="px-3 py-2 text-slate-600">{l.lastApplied}</td>
                <td className="px-3 py-2">
                  <button onClick={() => onOpen(l)} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50">
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Learning lineage graph */}
      <div className="rounded-lg border bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <GitBranch size={13} className="text-slate-500" />
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
            Learning Lineage · DEF DV 173 → LESSON-017 → DDMAC 3.3
          </div>
        </div>
        <svg viewBox="0 0 1200 220" className="w-full">
          {[
            ["DEF DV 173", 40, "#fef2f2", "#b91c1c"],
            ["Inclusive comparison", 200, "#fff7ed", "#c2410c"],
            ["Operator correction", 360, "#eff6ff", "#1d4ed8"],
            ["Boundary tests + proof", 520, "#ecfdf5", "#047857"],
            ["LESSON-017", 700, "#eef2ff", "#4338ca"],
            ["Reused in DDMAC 3.3", 900, "#ecfdf5", "#047857"],
            ["Defect prevented", 1070, "#ecfdf5", "#047857"],
          ].map(([label, x, fill, stroke], i) => (
            <g key={i as number}>
              <rect x={x as number} y={90} width={140} height={44} rx={6} fill={fill as string} stroke={stroke as string} />
              <text x={(x as number) + 70} y={116} textAnchor="middle" fontSize={11} fill={stroke as string} fontFamily="ui-monospace">
                {label as string}
              </text>
              {i < 6 && <line x1={(x as number) + 140} y1={112} x2={((x as number) + 160)} y2={112} stroke="#94a3b8" strokeWidth={1.5} />}
            </g>
          ))}
        </svg>
        <div className="text-[11px] text-slate-500">
          Lessons publish only after confirmed root cause and approved validation evidence. AI drafts; methodology lead approves.
        </div>
      </div>
    </div>
  );
}

function ValuePanel() {
  const grouped: Record<string, ValueMetric[]> = {};
  VALUE.forEach((v) => {
    grouped[v.domain] = grouped[v.domain] || [];
    grouped[v.domain].push(v);
  });

  const badge = (t: ValueMetric["type"]) => {
    const map = {
      Measured: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Estimated: "bg-amber-50 text-amber-800 border-amber-200",
      Target: "bg-blue-50 text-blue-700 border-blue-200",
      Unavailable: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return <span className={`rounded border px-1.5 py-0.5 text-[10px] font-mono ${map[t]}`}>{t}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-blue-50 border-blue-200 p-3 text-xs text-blue-900">
        <Info size={12} className="mr-1 inline" />
        Measured, Estimated, Target, and Unavailable values are displayed separately. AVEP does not blend or promote
        estimates as realized savings.
      </div>

      {Object.entries(grouped).map(([domain, rows]) => (
        <div key={domain} className="rounded-lg border bg-white">
          <div className="border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
            {domain}
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                {["Metric", "Baseline", "Current", "Change", "Type", "Basis", "Attribution"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{v.metric}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{v.baseline}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-900">{v.current}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-emerald-700">{v.change}</td>
                  <td className="px-3 py-2">{badge(v.type)}</td>
                  <td className="px-3 py-2 max-w-[320px] text-slate-600">{v.basis}</td>
                  <td className="px-3 py-2 max-w-[320px]">
                    {v.attribution.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {v.attribution.map((a) => (
                          <span key={a.source} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">
                            {a.source} {a.pct}%
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-400">n/a</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function GovernancePanel({ scenarioTone }: { scenarioTone: { label: string; state: string; recommendation: string; tone: string } }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className={`rounded-lg border p-4 ${scenarioTone.tone}`}>
          <div className="flex items-start gap-2">
            <Sparkles size={16} />
            <div>
              <div className="text-xs font-medium uppercase tracking-wider">AI Governance Evidence</div>
              <div className="mt-0.5 text-sm font-semibold">
                Recommendation · {scenarioTone.recommendation}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
                <div>
                  <div className="mb-1 font-medium">Strengths</div>
                  <ul className="ml-4 list-disc space-y-0.5">
                    <li>All active skills have versioned instructions and prompt hashes</li>
                    <li>Approval boundaries explicit for every action class</li>
                    <li>92% evaluation pass rate, 96% evidence lineage</li>
                    <li>184 approved reusable engineering lessons</li>
                    <li>Measured debug (38%) and authoring (34–42%) improvements</li>
                  </ul>
                </div>
                <div>
                  <div className="mb-1 font-medium">Risks & Required Actions</div>
                  <ul className="ml-4 list-disc space-y-0.5">
                    <li>Block waiver-analysis skill v2.8.1 until v3.0.0</li>
                    <li>Complete formal vacuity evaluation (EVAL-FORMAL-010)</li>
                    <li>Migrate 3 pilot skills after limited-pilot review</li>
                    <li>Remove deprecated prompt reference in inactive program</li>
                    <li>Preserve estimated vs measured labels — do not merge</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="rounded-lg border bg-white">
          <div className="border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
            AI Incidents & Control Improvements
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                {["Incident", "Skill / Version", "Severity", "Outcome", "Control Improvement", "State"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INCIDENTS.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{i.title}</div>
                    <div className="font-mono text-[10px] text-slate-500">{i.id}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{i.skill}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${i.severity === "High" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{i.outcome}</td>
                  <td className="px-3 py-2 text-slate-600">{i.control}</td>
                  <td className="px-3 py-2">
                    {i.state === "Open" ? (
                      <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-mono text-amber-800">Open</span>
                    ) : (
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-700">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorities */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-white">
          <div className="border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
            Human Review & Approval
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {[
                ["AI Engineering Lead", "Elena Garcia", "Skill lifecycle & release"],
                ["Verification Methodology Lead", "Sofia Rodriguez", "Verification AI validity"],
                ["RTL Design Lead", "Maya Chen", "RTL-related AI boundaries"],
                ["Formal Lead", "Daniel Kim", "Formal-property governance"],
                ["Security & Risk Lead", "Priya Shah", "Data, security, risk"],
                ["IP Architect", "Arun Patel", "Methodology alignment"],
                ["Executive Engineering Sponsor", "Marcus Lee", "Value & operating model"],
              ].map(([r, o, resp]) => (
                <tr key={r}>
                  <td className="px-3 py-2 font-medium">{r}</td>
                  <td className="px-3 py-2 text-slate-700">{o}</td>
                  <td className="px-3 py-2 text-slate-500">{resp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border bg-white p-3 text-xs text-slate-700">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Approval Controls
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              "Approve skill",
              "Approve with conditions",
              "Block skill",
              "Deprecate skill",
              "Roll back release",
              "Approve evaluation",
              "Reject evaluation",
              "Approve lesson",
              "Deprecate lesson",
              "Approve value metric",
              "Mark metric estimated",
              "Request supporting evidence",
            ].map((a) => (
              <button key={a} className="rounded border border-slate-300 bg-white px-2 py-1 text-left text-[11px] hover:bg-slate-50">
                {a}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
            <Ban size={11} className="mr-1 inline" />
            AI may recommend governance actions but cannot approve itself.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ drawers ============================ */

function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" onClick={onClose}>
      <div className="w-full max-w-5xl overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 border-b bg-white px-5 py-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{subtitle}</div>
              <div className="text-base font-semibold">{title}</div>
            </div>
            <button onClick={onClose} className="rounded p-1 hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function SkillDrawer({
  skill,
  tab,
  setTab,
  onClose,
}: {
  skill: Skill;
  tab: string;
  setTab: (t: never) => void;
  onClose: () => void;
}) {
  const tabs = [
    ["summary", "Summary"],
    ["versions", "Version History"],
    ["prompts", "Instructions & Prompts"],
    ["model", "Models & Configuration"],
    ["io", "Inputs & Outputs"],
    ["evals", "Evaluations"],
    ["boundaries", "Approval Boundaries"],
    ["usage", "Usage Analytics"],
    ["incidents", "Incidents & Exceptions"],
    ["audit", "Audit History"],
  ] as const;

  const skillEvals = EVALS.filter((e) => e.skillId === skill.id);

  return (
    <Drawer title={`${skill.name}`} subtitle={`${skill.id} · ${skill.domain} · v${skill.version}`} onClose={onClose}>
      <div className="flex flex-wrap gap-1 border-b pb-3">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as never)}
            className={`rounded px-2 py-1 text-[11px] font-medium ${
              tab === id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4 text-xs">
        {tab === "summary" && (
          <div className="grid grid-cols-2 gap-3">
            <KV label="Purpose" value={skill.purpose} />
            <KV label="State" value={<span>{stateChip(skill.state)}</span>} />
            <KV label="Owner" value={skill.owner} />
            <KV label="Reviewer" value={skill.reviewer} />
            <KV label="Approval boundary" value={skill.boundary} />
            <KV label="Risk tier" value={skill.risk} />
            <KV label="Active programs" value={String(skill.activePrograms)} />
            <KV label="Evaluation" value={`${skill.evalStatus} · ${skill.evalPct}%`} />
            <KV label="Human acceptance" value={`${skill.acceptance}% accepted · ${skill.modification}% modified · ${skill.rejection}% rejected`} />
            <KV label="Known limitation" value={skill.known} />
            <KV label="Prohibited" value="Approving its own release, closing signoff gates, committing production code." />
            <KV label="Approved domains" value={`${skill.domain}, deterministic runtime, air-gapped inputs`} />
          </div>
        )}

        {tab === "versions" && (
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>{["Version", "Change", "Model", "Prompt", "Eval Δ", "Accept Δ", "Decision"].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {[
                [skill.version, "Current release", skill.model, skill.prompt.id, "+2pp", "+3pp", "Approved"],
                ["3.6.1", "Prompt refinement", skill.model, "PRT prev", "+1pp", "+1pp", "Approved"],
                ["3.5.0", "Model upgrade", "reasoning-r5", "PRT prev", "+4pp", "+5pp", "Approved"],
                ["3.4.2", "Baseline", "reasoning-r5", "PRT prev", "—", "—", "Superseded"],
              ].map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className="px-2 py-1.5">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "prompts" && (
          <div className="space-y-3">
            <div className="rounded border bg-slate-50 p-3 font-mono text-[11px] text-slate-700">
              <div>Prompt ID · {skill.prompt.id}</div>
              <div>Version · {skill.prompt.version}</div>
              <div>Hash · {skill.prompt.hash.slice(0, 46)}…</div>
              <div>Objective · Support {skill.domain.toLowerCase()} under approval boundary</div>
              <div>Required inputs · versioned engineering artifacts + methodology profile</div>
              <div>Output contract · structured evidence, confidence, applicability, boundary state</div>
              <div>Stop conditions · missing evidence · out-of-scope request · policy conflict</div>
              <div>Approval boundary · {skill.boundary}</div>
            </div>
            <div className="text-[11px] text-slate-500">
              Hidden reasoning is not exposed. Only approved instructions, rationale summaries, and evidence are shown.
            </div>
          </div>
        )}

        {tab === "model" && (
          <div className="grid grid-cols-2 gap-3">
            <KV label="Model family" value={skill.model} />
            <KV label="Model version" value={skill.version} />
            <KV label="Determinism" value="Temperature 0.2 · top-p 0.9 · seeded" />
            <KV label="Retrieval" value="Approved engineering corpus + methodology + evidence index" />
            <KV label="Context limit" value="192k tokens" />
            <KV label="Tool permissions" value="Read approved artifacts; propose only" />
            <KV label="Data-access scope" value="Program + IP + revision only" />
            <KV label="Safety controls" value="Boundary enforcement, refusal on missing evidence" />
            <KV label="Fallback model" value="reasoning-r5 (deprecated fallback)" />
            <KV label="Deployment" value="AVEP-managed, VPC-isolated" />
          </div>
        )}

        {tab === "io" && (
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>{["Run", "Input", "Version", "Output", "Confidence", "Reviewer", "Disposition"].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {[
                ["RUN-1042", "REQ-DDMAC-014", "1.4.0", "Ambiguity flagged", "0.82", "Elena Garcia", "Accepted"],
                ["RUN-1043", "RTL fifo.sv", "3.2.18", "Impact scope", "0.74", "Maya Chen", "Modified"],
                ["RUN-1044", "Waveform trace 4A", "—", "Root-cause ranking", "0.71", "Sofia Rodriguez", "Accepted"],
                ["RUN-1045", "Formal property", "2.5.0", "Vacuity risk", "0.63", "Daniel Kim", "Rejected"],
              ].map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className="px-2 py-1.5">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "evals" && (
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>{["Evaluation", "Scenario", "Result", "Reviewer"].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillEvals.length ? skillEvals.map((e) => (
                <tr key={e.id}>
                  <td className="px-2 py-1.5 font-mono text-[11px]">{e.id}</td>
                  <td className="px-2 py-1.5">{e.scenario}</td>
                  <td className="px-2 py-1.5">{stateChip(e.result)}</td>
                  <td className="px-2 py-1.5">{e.reviewer}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-2 py-3 text-center text-slate-500">No skill-specific evaluations recorded.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "boundaries" && (
          <div className="rounded border bg-slate-50 p-3 text-[11px] font-mono text-slate-700 whitespace-pre-line">
{`Boundary            : ${skill.boundary}
AI may              : Draft · Extract · Correlate · Recommend
AI may not          : Approve · Close · Release · Waive
Human authority     : ${skill.reviewer}
Escalation on breach: Automatic block + audit event`}
          </div>
        )}

        {tab === "usage" && (
          <div className="grid grid-cols-4 gap-3">
            {[
              ["Runs (30d)", "1,284"],
              ["Acceptance", `${skill.acceptance}%`],
              ["Modification", `${skill.modification}%`],
              ["Rejection", `${skill.rejection}%`],
              ["Median runtime", "18.4 s"],
              ["p95 runtime", "42.1 s"],
              ["Boundary breaches", "0"],
              ["Audit records", "1,284"],
            ].map(([k, v]) => (
              <div key={k} className="rounded border p-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                <div className="mt-0.5 font-mono text-sm">{v}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "incidents" && (
          <div className="space-y-2">
            {INCIDENTS.filter((i) => i.skill.startsWith(skill.id)).length ? (
              INCIDENTS.filter((i) => i.skill.startsWith(skill.id)).map((i) => (
                <div key={i.id} className="rounded border p-3">
                  <div className="font-medium">{i.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500 font-mono">{i.id} · {i.skill}</div>
                  <div className="mt-1 text-[11px]">Outcome: {i.outcome}</div>
                  <div className="text-[11px]">Control: {i.control}</div>
                </div>
              ))
            ) : (
              <div className="rounded border p-3 text-slate-500">No incidents recorded for this skill.</div>
            )}
          </div>
        )}

        {tab === "audit" && (
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>{["Time", "Actor", "Action", "Reference"].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {[
                ["2026-07-10 14:32", skill.reviewer, "Approve with conditions", `${skill.id} v${skill.version}`],
                ["2026-07-08 09:11", skill.owner, "Submit for release", `${skill.id} v${skill.version}`],
                ["2026-07-05 16:47", "AVEP", "Evaluation run", `EVAL suite EVAL-DDMAC-2026.07`],
                ["2026-07-01 11:03", skill.owner, "Prompt update", skill.prompt.id],
              ].map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className="px-2 py-1.5">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Drawer>
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

function LessonDrawer({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  return (
    <Drawer title={lesson.title} subtitle={`${lesson.id} · ${lesson.domain} · from ${lesson.source}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <KV label="Root cause" value={lesson.rootCause} />
        <KV label="Detection pattern" value={lesson.detection} />
        <KV label="Prevention pattern" value={lesson.prevention} />
        <KV label="Confidence" value={stateChip(lesson.confidence)} />
        <KV label="Approval" value={stateChip(lesson.approval)} />
        <KV label="Reuse count" value={String(lesson.reuse)} />
        <KV label="Last applied" value={lesson.lastApplied} />
        <KV label="Outcome" value={lesson.outcome} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded border p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Reusable Assets</div>
          <ul className="ml-4 list-disc space-y-0.5">
            {lesson.reusable.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <div className="rounded border p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Applicable Domains</div>
          <div className="flex flex-wrap gap-1">
            {lesson.applicable.map((d) => (
              <span key={d} className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px]">{d}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-100">Reuse in new program</button>
        <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50">Generate reusable assets</button>
        <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50">Deprecate lesson</button>
      </div>
    </Drawer>
  );
}

function EvalDrawer({ ev, onClose }: { ev: Evaluation; onClose: () => void }) {
  return (
    <Drawer title={ev.scenario} subtitle={`${ev.id} · ${ev.skillId} · dataset ${ev.dataset}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <KV label="Expected" value={ev.expected} />
        <KV label="Actual" value={ev.actual} />
        <KV label="Result" value={stateChip(ev.result)} />
        <KV label="Severity" value={ev.severity} />
        <KV label="Reviewer" value={ev.reviewer} />
        <KV label="Release impact" value={ev.release} />
      </div>
      {ev.result === "Fail" && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <AlertTriangle size={12} className="mr-1 inline" />
          Failed critical evaluation blocks release. Remediation required before promotion.
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50">Run simulated evaluation</button>
        <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50">Assign remediation</button>
        {ev.result === "Fail" ? (
          <button className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-800">Block release</button>
        ) : (
          <button className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">Approve release</button>
        )}
      </div>
    </Drawer>
  );
}

/* ============================ walkthrough ============================ */

const STEPS = [
  "Review the governed skill registry — states, versions, boundaries, and evaluation status.",
  "Open a skill and inspect its version lineage in the drawer.",
  "Review model configuration, prompt metadata, inputs, outputs, and the approval boundary.",
  "Switch to Evaluation & Release Governance and open a failed critical evaluation.",
  "Observe that the failed version is blocked and the release recommendation is Conditional.",
  "Move to Engineering Learning Library and open a lesson derived from a resolved defect.",
  "Reuse the lesson in another workflow — reuse count and applied outcome are recorded.",
  "Switch to Value Measurement. Measured, Estimated, Target, and Unavailable values are separated.",
  "Distinguish measured (evidence-backed) results from estimated projections — they never blend.",
  "Review AI Incidents and the control improvements each generated.",
  "Return to the decision bar — human authorities approve, block, or roll back. AVEP recommends only.",
];

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
        <button onClick={() => setStep(null)} className="rounded p-1 hover:bg-slate-100">
          <X size={13} />
        </button>
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
            <span key={i} className={`h-1 w-4 rounded ${i <= step ? "bg-blue-600" : "bg-slate-200"}`} />
          ))}
        </div>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
            Next
          </button>
        ) : (
          <button onClick={() => setStep(null)} className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
            Finish
          </button>
        )}
      </div>
    </div>
  );
}

/* silence unused import warnings for icons intentionally referenced conditionally */
void CheckCircle2; void XCircle; void Clock; void Fingerprint; void User; void RefreshCw;
