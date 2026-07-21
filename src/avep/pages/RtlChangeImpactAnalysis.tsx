import { useMemo, useState } from "react";
import {
  GitPullRequest, GitBranch, AlertTriangle, ShieldCheck, CheckCircle2, XCircle,
  FileCode2, Cpu, Layers, Activity, Sparkles, Info, Lock, Play, Download,
  ChevronRight, MessageSquare, Target, ListChecks, FileText, Users, Zap,
} from "lucide-react";

/**
 * AVEP.P2.RTL.002 — RTL Change Impact Analysis
 * Phase 2, Build and Verify | Step 8, Analyze Design Changes
 */

type Scenario = "T0" | "T1" | "T2" | "T3";
type Severity = "blocking" | "high" | "medium" | "low";
type Impact = "direct-changed" | "direct-impacted" | "indirect" | "review" | "evidence-missing" | "low-confidence" | "none" | "confirmed" | "rejected";

// ---------- Data ----------
const CHANGE = {
  id: "CHG-RTL-0047",
  title: "Correct descriptor length boundary and error response timing",
  pr: "PR-8274",
  commit: "a8c31f7",
  author: "Maya Chen, Senior RTL Engineer",
  branch: "feature/ddmac_descriptor_guard",
  target: "rtl_baseline_3.2.18",
  defect: "DEF-DV-219",
  regression: "REG-CLUSTER-031",
  rationale: "Nightly regression failures indicate that descriptors equal to the configured maximum transfer length are intermittently rejected. The proposed change corrects the boundary comparison and adjusts error response sequencing.",
  files: [
    "ddmac_descriptor_validator.sv",
    "ddmac_error_capture.sv",
    "ddmac_pkg.sv",
    "ddmac_descriptor_validator_sva.sv",
  ],
  classification: [
    { k: "Functional behavior", v: "Changed", tone: "high" },
    { k: "Interface behavior", v: "Potentially changed", tone: "medium" },
    { k: "Register semantics", v: "Unchanged", tone: "ok" },
    { k: "Reset behavior", v: "Potentially changed", tone: "medium" },
    { k: "Security behavior", v: "Affected", tone: "high" },
    { k: "Performance behavior", v: "Low impact expected", tone: "ok" },
    { k: "Formal proof obligations", v: "Affected", tone: "high" },
    { k: "Documentation", v: "Affected", tone: "medium" },
  ],
};

const DIFF_BOUNDARY = {
  baseline: `assign length_error =
    desc_valid &&
    (desc_length >= max_transfer_length);`,
  proposed: `assign length_error =
    desc_valid &&
    (desc_length > max_transfer_length);`,
};

const DIFF_FSM = {
  baseline: `VALIDATE: begin
    if (length_error || privilege_error) begin
        state_d = REJECT;
    end
    else begin
        state_d = ACCEPT;
    end
end`,
  proposed: `VALIDATE: begin
    if (length_error) begin
        error_code_d = ERR_LENGTH;
        state_d      = REJECT;
    end
    else if (privilege_error) begin
        error_code_d = ERR_PRIVILEGE;
        state_d      = REJECT;
    end
    else begin
        state_d = ACCEPT;
    end
end`,
};

const DIFF_BADGES = [
  "REQ-DDMAC-142", "REQ-DDMAC-143", "REQ-SEC-088",
  "ARCH-FSM-04", "PROP-DESC-021", "TEST-DESC-017", "DEF-DV-219",
];

const AI_ANNOTATIONS = [
  { kind: "Behavioral correction", tone: "ok", text: "Descriptors equal to max_transfer_length are now accepted, consistent with REQ-DDMAC-142." },
  { kind: "Potential timing impact", tone: "medium", text: "Error prioritization and state sequencing may affect the cycle in which desc_error and error_code become observable." },
  { kind: "Security impact", tone: "high", text: "Explicit priority causes length violations to be reported before privilege violations when both are present. Security owner review is required." },
  { kind: "Formal impact", tone: "high", text: "Existing mutual exclusion and error consistency properties require revision." },
];

interface GNode {
  id: string; label: string; group: string; state: Impact;
  x: number; y: number; owner?: string; evidence?: string; confidence?: number;
  relation?: string; action?: string; approval?: string;
}

const GRAPH_NODES: GNode[] = [
  // Center — changed RTL objects
  { id: "N-CHG", label: "CHG-RTL-0047", group: "Change", state: "direct-changed", x: 520, y: 300, evidence: "PR-8274 · a8c31f7", confidence: 100, relation: "Origin", action: "Under review" },
  // Requirements (top-left)
  { id: "REQ-DDMAC-142", label: "REQ-DDMAC-142", group: "Requirements", state: "direct-impacted", x: 210, y: 90,  owner: "DMA Architecture",   evidence: "FRS 3.2 §4.7.1", confidence: 98, relation: "Implements", action: "Confirm alignment", approval: "Pending" },
  { id: "REQ-DDMAC-143", label: "REQ-DDMAC-143", group: "Requirements", state: "evidence-missing", x: 320, y: 60,  owner: "DMA Architecture",   evidence: "FRS 3.2 §4.7.4 (ambiguous)", confidence: 62, relation: "Constrains", action: "Clarify timing origin", approval: "Blocked" },
  { id: "REQ-SEC-088",   label: "REQ-SEC-088",   group: "Requirements", state: "review",           x: 430, y: 90,  owner: "Security Architecture", evidence: "Security Spec 2.1", confidence: 84, relation: "Governs", action: "Security review", approval: "Pending" },
  // Architecture (top)
  { id: "ARCH-FSM-04",   label: "Desc validation FSM", group: "Architecture", state: "direct-impacted", x: 540, y: 60,  owner: "Arun Patel", evidence: "ARCH-FSM-04 v3.2", confidence: 96, relation: "Realizes" },
  { id: "ARCH-ERR",      label: "Error handling arch", group: "Architecture", state: "direct-impacted", x: 660, y: 90,  owner: "Arun Patel", confidence: 92 },
  { id: "ARCH-PRIV",     label: "Privilege enforcement", group: "Architecture", state: "review",         x: 770, y: 130, owner: "Priya Shah", confidence: 88 },
  // RTL Modules (right)
  { id: "M-DVAL", label: "ddmac_descriptor_validator", group: "RTL", state: "direct-changed",  x: 870, y: 220, owner: "Maya Chen", confidence: 100, relation: "Modified logic" },
  { id: "M-ECAP", label: "ddmac_error_capture",        group: "RTL", state: "direct-changed",  x: 900, y: 300, owner: "Maya Chen", confidence: 100 },
  { id: "M-IRQ",  label: "ddmac_interrupt_logic",      group: "RTL", state: "indirect",        x: 900, y: 380, owner: "Ben Cohen", confidence: 78 },
  { id: "M-CTRL", label: "ddmac_control",              group: "RTL", state: "indirect",        x: 870, y: 460, owner: "Hiro Tanaka", confidence: 71 },
  // Interfaces (bottom right)
  { id: "IF-DESC", label: "Descriptor input IF", group: "Interfaces", state: "direct-impacted", x: 770, y: 520, owner: "Marcus Lee", confidence: 93 },
  { id: "IF-ERR",  label: "Error status IF",     group: "Interfaces", state: "direct-impacted", x: 660, y: 550, owner: "Marcus Lee", confidence: 91 },
  // Registers (bottom)
  { id: "R-MAX",  label: "MAX_XFER_LEN", group: "Registers", state: "indirect", x: 540, y: 570, owner: "CSR Owner", confidence: 82 },
  { id: "R-ERR",  label: "ERR_STATUS",   group: "Registers", state: "direct-impacted", x: 430, y: 550, owner: "CSR Owner", confidence: 90 },
  { id: "R-INT",  label: "INT_STATUS",   group: "Registers", state: "indirect", x: 320, y: 570, owner: "CSR Owner", confidence: 74 },
  // Formal (bottom left)
  { id: "P-021", label: "PROP-DESC-021",        group: "Formal", state: "direct-impacted", x: 210, y: 520, owner: "Daniel Kim", confidence: 95 },
  { id: "P-022", label: "PROP-INV-NEVER-022",   group: "Formal", state: "direct-impacted", x: 130, y: 460, owner: "Daniel Kim", confidence: 93 },
  { id: "P-023", label: "PROP-ERR-TIMING-023",  group: "Formal", state: "evidence-missing", x: 100, y: 380, owner: "Daniel Kim", confidence: 55 },
  { id: "P-024", label: "PROP-ERR-CODE-024",    group: "Formal", state: "review",          x: 100, y: 300, owner: "Daniel Kim", confidence: 82 },
  { id: "P-025", label: "PROP-PRIV-ENF-025",    group: "Formal", state: "review",          x: 130, y: 220, owner: "Daniel Kim", confidence: 84 },
  // Tests (left)
  { id: "T-MAX",  label: "test_desc_length_max",         group: "Tests", state: "direct-impacted", x: 210, y: 380, owner: "Sofia Rodriguez", confidence: 96 },
  { id: "T-MP1",  label: "test_desc_length_max_plus_one", group: "Tests", state: "direct-impacted", x: 300, y: 400, owner: "Sofia Rodriguez", confidence: 96 },
  { id: "T-DUAL", label: "test_desc_dual_error_priority", group: "Tests", state: "review",         x: 390, y: 420, owner: "Sofia Rodriguez", confidence: 74 },
  // Coverage
  { id: "C-BND", label: "cov_boundary_length", group: "Coverage", state: "direct-impacted", x: 380, y: 300, owner: "Sofia Rodriguez", confidence: 89 },
  { id: "C-PRI", label: "cov_error_priority",  group: "Coverage", state: "review",          x: 380, y: 220, owner: "Sofia Rodriguez", confidence: 78 },
  // Docs (top right)
  { id: "D-FRS", label: "DDMAC functional spec",  group: "Docs", state: "review", x: 780, y: 240, owner: "Tech Writing", confidence: 80 },
  { id: "D-TRM", label: "Technical reference manual", group: "Docs", state: "review", x: 780, y: 320, owner: "Tech Writing", confidence: 78 },
  // Approvals (bottom center)
  { id: "AP-RTL", label: "RTL review", group: "Approvals", state: "review", x: 460, y: 470, owner: "Maya Chen", confidence: 100 },
  { id: "AP-ARC", label: "Architecture review", group: "Approvals", state: "review", x: 540, y: 470, owner: "Arun Patel", confidence: 100 },
  { id: "AP-SEC", label: "Security review", group: "Approvals", state: "review", x: 620, y: 470, owner: "Priya Shah", confidence: 100 },
];

const GRAPH_EDGES: Array<[string, string]> = [
  ["N-CHG","REQ-DDMAC-142"], ["N-CHG","REQ-DDMAC-143"], ["N-CHG","REQ-SEC-088"],
  ["N-CHG","ARCH-FSM-04"], ["N-CHG","ARCH-ERR"], ["N-CHG","ARCH-PRIV"],
  ["N-CHG","M-DVAL"], ["N-CHG","M-ECAP"], ["M-ECAP","M-IRQ"], ["M-DVAL","M-CTRL"],
  ["M-DVAL","IF-DESC"], ["M-ECAP","IF-ERR"],
  ["M-ECAP","R-ERR"], ["M-IRQ","R-INT"], ["M-DVAL","R-MAX"],
  ["N-CHG","P-021"], ["N-CHG","P-022"], ["N-CHG","P-023"], ["N-CHG","P-024"], ["N-CHG","P-025"],
  ["N-CHG","T-MAX"], ["N-CHG","T-MP1"], ["N-CHG","T-DUAL"],
  ["N-CHG","C-BND"], ["N-CHG","C-PRI"],
  ["N-CHG","D-FRS"], ["N-CHG","D-TRM"],
  ["N-CHG","AP-RTL"], ["N-CHG","AP-ARC"], ["N-CHG","AP-SEC"],
];

const KPIS_T2 = {
  blastRadius: { value: 34, sub: "3 req · 4 RTL · 2 IF · 1 reg · 5 prop · 8 tests · 6 cov · 2 doc · 3 approvals" },
  risk: { value: 78, label: "High" },
  confidence: { value: 89, sub: "31 of 34 predicted relationships have direct evidence" },
  reviewers: { value: 6, sub: "RTL · Architect · Verification · Formal · Interface · Security" },
  validation: { value: "Targeted + dependent regression", sub: "24 tests · 7 properties · 12 coverage objectives" },
  compute: { value: "640 core-hours", sub: "Estimated range 520 – 780 (planning estimate)" },
};

const REQ_ROWS = [
  { id: "REQ-DDMAC-142", impact: "Boundary behavior corrected", conf: 98, action: "Confirm implementation alignment", tone: "ok" },
  { id: "REQ-DDMAC-143", impact: "Error timing may change",     conf: 62, action: "Clarify timing origin",             tone: "blocking" },
  { id: "REQ-SEC-088",   impact: "Error priority may affect observability", conf: 84, action: "Security review",       tone: "high" },
];

const RTL_ROWS = [
  { m: "ddmac_descriptor_validator", impact: "Direct", rel: "Modified logic",            action: "Full review",           tone: "high" },
  { m: "ddmac_error_capture",        impact: "Direct", rel: "Error code timing",         action: "Targeted review",       tone: "high" },
  { m: "ddmac_interrupt_logic",      impact: "Indirect", rel: "Error event dependency",  action: "Targeted test",         tone: "medium" },
  { m: "ddmac_control",              impact: "Indirect", rel: "State observation",       action: "Confirm no behavior change", tone: "low" },
];

const FORMAL_ROWS = [
  { id: "PROP-DESC-021",       text: "assert (desc_valid && desc_length > max_len) |-> ##[1:2] desc_error;", cur: "Passing", pred: "Requires re-elaboration", action: "Re-run after diff",   cx: "Low",    owner: "Daniel Kim" },
  { id: "PROP-INV-NEVER-022",  text: "assert never (invalid_desc && accept);",                              cur: "Passing", pred: "Still valid",             action: "Re-run",              cx: "Low",    owner: "Daniel Kim" },
  { id: "PROP-ERR-TIMING-023", text: "assert (invalid_desc) |-> ##[1:2] desc_error;",                       cur: "Passing", pred: "Invalid vs proposed",    action: "Update after req clarification", cx: "Medium", owner: "Daniel Kim" },
  { id: "PROP-ERR-CODE-024",   text: "assert (state==REJECT) |-> (error_code inside {ERR_LENGTH,ERR_PRIVILEGE});", cur: "New",    pred: "Property to add", action: "Author & prove", cx: "Medium", owner: "Daniel Kim" },
  { id: "PROP-PRIV-ENF-025",   text: "assert (privilege_error) |-> !accept;",                               cur: "Passing", pred: "Still valid",            action: "Re-run",              cx: "Low",    owner: "Daniel Kim" },
];

const TEST_ROWS = [
  { name: "test_desc_length_max",           kind: "Existing", cat: "Directed", impact: "Direct",   exec: "Required", rt: "12s",  owner: "Sofia R.", res: "Regression fail" },
  { name: "test_desc_length_max_plus_one",  kind: "Existing", cat: "Directed", impact: "Direct",   exec: "Required", rt: "12s",  owner: "Sofia R.", res: "Not yet run" },
  { name: "test_desc_dual_error_priority",  kind: "New",      cat: "Directed", impact: "New scope",exec: "Required", rt: "18s",  owner: "Sofia R.", res: "Draft" },
  { name: "test_desc_reset_during_reject",  kind: "New",      cat: "Directed", impact: "New scope",exec: "Required", rt: "15s",  owner: "Sofia R.", res: "Draft" },
  { name: "test_desc_interrupt_latency",    kind: "Existing", cat: "Directed", impact: "Indirect", exec: "Recommended", rt: "22s", owner: "Sofia R.", res: "Not yet run" },
  { name: "test_desc_back_to_back_errors",  kind: "New",      cat: "Constrained random", impact: "New scope", exec: "Recommended", rt: "3m", owner: "Sofia R.", res: "Draft" },
];

const COV_ROWS = [
  { model: "cg_desc_length", bin: "Boundary [MAX-1, MAX, MAX+1]", cur: "Partial", pred: "Reopens closure", stim: "Directed", formal: "Yes", owner: "Sofia R." },
  { model: "cg_error_type",  bin: "ERR_LENGTH · ERR_PRIVILEGE", cur: "Covered", pred: "Priority cross required", stim: "Directed", formal: "Yes", owner: "Sofia R." },
  { model: "cg_state",       bin: "VALIDATE → REJECT",         cur: "Covered", pred: "New transition edge",   stim: "Directed", formal: "No",  owner: "Sofia R." },
  { model: "cg_priv",        bin: "priv_mode × length_err",    cur: "Partial", pred: "New cross required",    stim: "CRV",      formal: "No",  owner: "Sofia R." },
];

const IF_REG_ROWS = [
  { id: "IF-DESC", type: "Interface", impact: "Direct",   rel: "Observable error timing", action: "Confirm observable timing", conf: 93, owner: "Marcus Lee" },
  { id: "IF-ERR",  type: "Interface", impact: "Direct",   rel: "Error code sequencing",   action: "Contract review",           conf: 91, owner: "Marcus Lee" },
  { id: "MAX_XFER_LEN", type: "Register", impact: "Indirect", rel: "Boundary semantics",  action: "Doc update",                conf: 82, owner: "CSR Owner" },
  { id: "ERR_STATUS",   type: "Register", impact: "Direct",   rel: "Latched error code",  action: "Confirm readback timing",   conf: 90, owner: "CSR Owner" },
  { id: "INT_STATUS",   type: "Register", impact: "Indirect", rel: "Interrupt latency",   action: "Targeted test",             conf: 74, owner: "CSR Owner" },
];

const DEFECT_ROWS = [
  { id: "DEF-DV-219", title: "Nightly boundary rejection", state: "Open", link: "Direct cause", owner: "Maya Chen" },
  { id: "DEF-DV-173", title: "Boundary value incorrectly rejected", state: "Closed", link: "Historical similar", owner: "Legacy" },
];

const DOC_ROWS = [
  { id: "D-FRS", name: "DDMAC functional spec §4.7", state: "Update required" },
  { id: "D-TRM", name: "Technical reference manual §6.2", state: "Update required" },
  { id: "D-VP",  name: "Verification plan §3", state: "Add simultaneous error injection" },
  { id: "D-REG", name: "Register description", state: "No change expected" },
  { id: "D-REL", name: "Release notes", state: "Draft entry required" },
];

const APPROVAL_ROWS = [
  { role: "RTL Design Lead", owner: "Maya Chen",       status: "Approved for review", action: "Confirm code intent" },
  { role: "IP Architect",    owner: "Arun Patel",      status: "Pending",             action: "Resolve timing semantics" },
  { role: "Verification Lead", owner: "Sofia Rodriguez", status: "Pending",           action: "Approve validation scope" },
  { role: "Formal Lead",     owner: "Daniel Kim",      status: "Pending",             action: "Approve property updates" },
  { role: "Security Engineer", owner: "Priya Shah",    status: "Pending",             action: "Confirm error priority behavior" },
  { role: "Interface Owner", owner: "Marcus Lee",      status: "Pending",             action: "Confirm observable timing" },
];

const COMPUTE_ROWS = [
  { act: "Lint & elaboration",           jobs: "4",  hrs: 12,  pri: "Required" },
  { act: "Formal targeted proofs",       jobs: "7",  hrs: 96,  pri: "Required" },
  { act: "Directed simulation",          jobs: "14", hrs: 42,  pri: "Required" },
  { act: "Constrained random",           jobs: "6 configs", hrs: 180, pri: "Recommended" },
  { act: "Dependent regression",         jobs: "480 tests", hrs: 290, pri: "Required" },
  { act: "Performance characterization", jobs: "3 scenarios", hrs: 20, pri: "Conditional" },
];

const HISTORY = [
  { id: "CHG-RTL-0031", kind: "Change",  title: "Descriptor error code priority update", sim: 82, outcome: "Introduced interrupt timing regression", lesson: "Error code and interrupt timing must be validated together", module: "ddmac_error_capture" },
  { id: "DEF-DV-173",   kind: "Defect",  title: "Boundary value incorrectly rejected",   sim: 91, outcome: "Fixed by replacing inclusive with exclusive comparison", lesson: "Verify max, max+1, and zero values together", module: "ddmac_descriptor_validator" },
  { id: "CHG-RTL-0019", kind: "Change",  title: "State machine reject path simplification", sim: 68, outcome: "Formal dead state property failed", lesson: "State transition properties must be rerun after reject path changes", module: "ddmac_descriptor_validator" },
];

const VALIDATION_OPTIONS = [
  { key: "A", name: "Minimal targeted", hrs: 120, risk: "Insufficient for this change", status: "Not recommended", tone: "high", tests: 6, prop: 2, cov: 3 },
  { key: "B", name: "Proportionate (recommended)", hrs: 640, risk: "Balanced coverage", status: "Recommended", tone: "ok", tests: 24, prop: 7, cov: 12 },
  { key: "C", name: "Full IP regression", hrs: 2900, risk: "Highest reduction", status: "Optional escalation", tone: "medium", tests: 480, prop: 12, cov: 40 },
];

// ---------- Style helpers ----------
const card: React.CSSProperties = {
  background: "hsl(var(--avep-surface))",
  border: "1px solid hsl(var(--avep-border))",
  borderRadius: "var(--avep-radius-md)",
};

const tone = (t: string) => {
  switch (t) {
    case "ok":       return { bg: "hsl(var(--avep-success-soft))",  fg: "hsl(var(--avep-success))" };
    case "medium":   return { bg: "hsl(var(--avep-warning-soft))",  fg: "hsl(var(--avep-warning))" };
    case "high":     return { bg: "hsl(var(--avep-danger-soft))",   fg: "hsl(var(--avep-danger))" };
    case "blocking": return { bg: "hsl(var(--avep-danger-soft))",   fg: "hsl(var(--avep-danger))" };
    case "low":      return { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))" };
    default:         return { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))" };
  }
};

const stateColor = (s: Impact) => {
  switch (s) {
    case "direct-changed":   return "hsl(var(--avep-danger))";
    case "direct-impacted":  return "hsl(var(--avep-warning))";
    case "indirect":         return "hsl(var(--avep-accent))";
    case "review":           return "hsl(var(--avep-primary))";
    case "evidence-missing": return "hsl(var(--avep-danger))";
    case "low-confidence":   return "hsl(var(--avep-warning))";
    case "confirmed":        return "hsl(var(--avep-success))";
    case "rejected":         return "hsl(var(--avep-foreground-subtle))";
    default:                 return "hsl(var(--avep-foreground-subtle))";
  }
};

const monoFont = "var(--avep-font-mono, 'JetBrains Mono', monospace)";

// ---------- Component ----------
export default function RtlChangeImpactAnalysis() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [diffMode, setDiffMode] = useState<"line" | "semantic" | "requirement" | "signal" | "state" | "assertion" | "security" | "performance">("semantic");
  const [tab, setTab] = useState<"req" | "arch" | "rtl" | "ifreg" | "formal" | "verif" | "cov" | "defects" | "docs" | "approvals" | "compute">("rtl");
  const [validationChoice, setValidationChoice] = useState<"A" | "B" | "C">("B");
  const [filter, setFilter] = useState<string>("all");
  const [walkStep, setWalkStep] = useState<number | null>(null);
  const [showConfidenceDrawer, setShowConfidenceDrawer] = useState(false);
  const [showValidationDrawer, setShowValidationDrawer] = useState(false);
  const [audit, setAudit] = useState<string[]>([
    "System · CHG-RTL-0047 ingested from PR-8274 (a8c31f7)",
    "AI · Predicted 34 impacted objects · confidence 89%",
    "Maya Chen · Approved change for review",
  ]);

  const scenarioMeta = useMemo(() => ({
    T0: { risk: "Low",  state: "Baseline stable",     kpi: 0,  reco: "Minimal validation" },
    T1: { risk: "Medium", state: "Regression degradation", kpi: 12, reco: "Targeted investigation" },
    T2: { risk: "High", state: "Review required",    kpi: 34, reco: "Proportionate validation (Option B)" },
    T3: { risk: "Low",  state: "Fix validated",      kpi: 34, reco: "Awaiting baseline acceptance" },
  }[scenario]), [scenario]);

  const filteredNodes = useMemo(
    () => filter === "all" ? GRAPH_NODES : GRAPH_NODES.filter(n => n.group === filter || n.id === "N-CHG"),
    [filter]
  );

  const walkTargets = [
    "Understand the proposed change — code diff",
    "Expand the blast radius — dependency graph",
    "Expose uncertainty — unresolved timing requirement",
    "Review historical evidence — prior changes and defects",
    "Establish validation scope — proportionate plan",
    "Estimate compute demand — planning estimate",
    "Preserve human authority — approval workflow",
  ];

  const logAudit = (line: string) => setAudit(prev => [...prev, `${new Date().toLocaleTimeString()} · ${line}`]);

  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* Header / Context */}
      <div style={card} className="p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(var(--avep-foreground-subtle))", fontFamily: monoFont }}>
              <span>AVEP.P2.RTL.002</span>
              <ChevronRight className="h-3 w-3" />
              <span>Phase 2 · Build and Verify</span>
              <ChevronRight className="h-3 w-3" />
              <span>Step 8 · Analyze Design Changes</span>
            </div>
            <h1 className="text-2xl font-semibold mt-1" style={{ color: "hsl(var(--avep-foreground))" }}>
              RTL Change Impact Analysis
            </h1>
            <p className="text-sm mt-1 max-w-3xl" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
              Predict the downstream engineering effects of a proposed RTL change, expose uncertainty, identify accountable owners, and recommend a proportionate validation scope.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={scenario}
              onChange={(e) => { setScenario(e.target.value as Scenario); logAudit(`Scenario switched to ${e.target.value}`); }}
              className="text-xs px-2 py-1 rounded border"
              style={{ background: "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))", fontFamily: monoFont }}
              aria-label="Scenario"
            >
              <option value="T0">T0 · Baseline Stable</option>
              <option value="T1">T1 · Regression Degradation</option>
              <option value="T2">T2 · AI-Assisted Root Cause</option>
              <option value="T3">T3 · Fix Validated</option>
            </select>
            <button
              onClick={() => setWalkStep(0)}
              className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
              style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))" }}
            >
              <Play className="h-3 w-3" /> Start Change Impact Walkthrough
            </button>
            <button
              onClick={() => logAudit("Exported review package (simulated)")}
              className="text-xs px-3 py-1.5 rounded border flex items-center gap-1.5"
              style={{ borderColor: "hsl(var(--avep-border))", color: "hsl(var(--avep-foreground))" }}
            >
              <Download className="h-3 w-3" /> Export review package
            </button>
          </div>
        </div>

        {/* Context chips */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs" style={{ fontFamily: monoFont }}>
          {[
            ["Program", "StrataShield SoC"],
            ["IP block", "DDMAC PME"],
            ["Revision", "DDMAC 3.2"],
            ["Branch", CHANGE.branch],
            ["Baseline", "rtl_baseline_3.2.17"],
            ["Milestone", "M4 DV Entry"],
            ["Active change", CHANGE.id],
            ["Scenario", scenario === "T2" ? "T2 AI-Assisted RC" : scenario],
          ].map(([k, v]) => (
            <div key={k} className="px-2 py-1.5 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
              <div style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: 10 }}>{k}</div>
              <div className="truncate" style={{ color: "hsl(var(--avep-foreground))" }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs px-2 py-1.5 rounded" style={{ background: "hsl(var(--avep-primary-soft))", color: "hsl(var(--avep-primary))" }}>
          <Lock className="h-3.5 w-3.5" />
          <span className="font-medium">Controlled engineering context</span>
          <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>· All analysis is constrained to the selected program, IP, revision, branch, baseline, change set, and scenario.</span>
        </div>

        {/* What this workspace proves */}
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 p-3 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
            <div className="text-xs font-semibold mb-1" style={{ color: "hsl(var(--avep-foreground))" }}>What this workspace proves</div>
            <p className="text-xs" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
              AVEP connects code changes to engineering intent, dependencies, verification evidence, historical defects, approvals, and compute demand before a material change advances. AI provides evidence-based recommendations. Design, verification, architecture, interface, security, and formal owners retain approval authority for material changes.
            </p>
          </div>
          <div className="p-3 rounded flex flex-col gap-1" style={{ background: "hsl(var(--avep-danger-soft))" }}>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "hsl(var(--avep-danger))" }}>Analysis state</div>
            <div className="text-sm font-semibold" style={{ color: "hsl(var(--avep-danger))" }}>Review required · Change risk High</div>
            <div className="text-xs" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
              Proceed only after resolving one blocking ambiguity and completing targeted cross-discipline validation.
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Predicted blast radius" value={String(KPIS_T2.blastRadius.value)} sub={KPIS_T2.blastRadius.sub} icon={<Target className="h-4 w-4" />} onClick={() => setTab("rtl")} />
        <KpiCard title="Change risk score" value={`${KPIS_T2.risk.value} / 100`} sub={`Classification: ${KPIS_T2.risk.label}`} icon={<AlertTriangle className="h-4 w-4" />} tone="high" />
        <KpiCard title="Traceability confidence" value={`${KPIS_T2.confidence.value}%`} sub={KPIS_T2.confidence.sub} icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setShowConfidenceDrawer(true)} />
        <KpiCard title="Required reviewers" value={String(KPIS_T2.reviewers.value)} sub={KPIS_T2.reviewers.sub} icon={<Users className="h-4 w-4" />} onClick={() => setTab("approvals")} />
        <KpiCard title="Recommended validation" value={String(KPIS_T2.validation.value)} sub={KPIS_T2.validation.sub} icon={<ListChecks className="h-4 w-4" />} onClick={() => setShowValidationDrawer(true)} />
        <KpiCard title="Estimated compute" value={String(KPIS_T2.compute.value)} sub={KPIS_T2.compute.sub} icon={<Cpu className="h-4 w-4" />} onClick={() => setTab("compute")} />
      </div>

      {/* Primary workspace: A, B, C, D */}
      <div className="grid grid-cols-12 gap-3">
        {/* Panel A — Change Definition */}
        <div style={card} className="col-span-12 lg:col-span-3 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
            <h3 className="text-sm font-semibold">Change definition</h3>
          </div>
          <div className="text-xs space-y-1" style={{ fontFamily: monoFont }}>
            <Row k="Change ID" v={CHANGE.id} />
            <Row k="Title" v={CHANGE.title} mono={false} />
            <Row k="PR" v={CHANGE.pr} />
            <Row k="Commit" v={CHANGE.commit} />
            <Row k="Author" v={CHANGE.author} mono={false} />
            <Row k="Branch" v={CHANGE.branch} />
            <Row k="Target" v={CHANGE.target} />
            <Row k="Defect" v={CHANGE.defect} />
            <Row k="Regression" v={CHANGE.regression} />
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Rationale</div>
            <p className="text-xs" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{CHANGE.rationale}</p>
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Changed files</div>
            <ul className="text-xs space-y-0.5" style={{ fontFamily: monoFont }}>
              {CHANGE.files.map(f => <li key={f} style={{ color: "hsl(var(--avep-foreground))" }}>· {f}</li>)}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Classification</div>
            <div className="space-y-1">
              {CHANGE.classification.map(c => {
                const t = tone(c.tone);
                return (
                  <div key={c.k} className="flex items-center justify-between text-xs px-2 py-1 rounded" style={{ background: t.bg }}>
                    <span style={{ color: "hsl(var(--avep-foreground))" }}>{c.k}</span>
                    <span className="font-medium" style={{ color: t.fg }}>{c.v}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-1">
            <SmallBtn onClick={() => logAudit("Opened code diff")}>Open code diff</SmallBtn>
            <SmallBtn onClick={() => logAudit("Opened linked defect DEF-DV-219")}>Linked defect</SmallBtn>
            <SmallBtn onClick={() => logAudit("Opened regression evidence")}>Regression</SmallBtn>
            <SmallBtn onClick={() => logAudit("Opened requirement context")}>Requirements</SmallBtn>
          </div>
        </div>

        {/* Panel B — Semantic Code Change */}
        <div style={card} className="col-span-12 lg:col-span-6 p-3 flex flex-col gap-2" data-walk="1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
              <h3 className="text-sm font-semibold">Semantic code change</h3>
            </div>
            <select
              value={diffMode}
              onChange={(e) => setDiffMode(e.target.value as typeof diffMode)}
              className="text-xs px-2 py-1 rounded border"
              style={{ background: "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))" }}
            >
              <option value="line">Line diff</option>
              <option value="semantic">Semantic diff</option>
              <option value="requirement">Requirement impact</option>
              <option value="signal">Signal impact</option>
              <option value="state">State machine impact</option>
              <option value="assertion">Assertion impact</option>
              <option value="security">Security impact</option>
              <option value="performance">Performance impact</option>
            </select>
          </div>

          <DiffBlock title="Boundary comparison · ddmac_descriptor_validator.sv" baseline={DIFF_BOUNDARY.baseline} proposed={DIFF_BOUNDARY.proposed} />
          <DiffBlock title="State machine · error prioritization" baseline={DIFF_FSM.baseline} proposed={DIFF_FSM.proposed} />

          <div className="flex flex-wrap gap-1.5">
            {DIFF_BADGES.map(b => (
              <button
                key={b}
                onClick={() => { const n = GRAPH_NODES.find(x => x.id === b || x.label === b); if (n) setSelectedNode(n); logAudit(`Opened evidence for ${b}`); }}
                className="text-[10px] px-1.5 py-0.5 rounded border"
                style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-muted))", fontFamily: monoFont }}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="mt-1 space-y-1.5">
            <div className="text-[10px] uppercase" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>AI annotations</div>
            {AI_ANNOTATIONS.map(a => {
              const t = tone(a.tone);
              return (
                <div key={a.kind} className="text-xs px-2 py-1.5 rounded flex gap-2" style={{ background: t.bg }}>
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: t.fg }} />
                  <div>
                    <div className="font-medium" style={{ color: t.fg }}>{a.kind}</div>
                    <div style={{ color: "hsl(var(--avep-foreground))" }}>{a.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel D — AI Impact Evidence */}
        <div style={card} className="col-span-12 lg:col-span-3 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--avep-ai))" }} />
            <h3 className="text-sm font-semibold">AI impact evidence</h3>
          </div>

          <div className="p-2.5 rounded" style={{ background: "hsl(var(--avep-primary-soft))" }}>
            <div className="text-[10px] uppercase" style={{ color: "hsl(var(--avep-primary))" }}>Recommendation</div>
            <div className="text-sm font-semibold" style={{ color: "hsl(var(--avep-primary))" }}>Conditional approval for validation</div>
            <p className="text-xs mt-1" style={{ color: "hsl(var(--avep-foreground))" }}>
              The change appears to correct the maximum transfer length boundary defect but also modifies error prioritization and may affect observable response timing. Cross-discipline review and targeted validation are required before baseline acceptance.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Highest-risk impacts</div>
            <div className="space-y-1.5 text-xs">
              <RiskLine sev="blocking" text="REQ-DDMAC-143 does not clearly define when the two-cycle error response window begins." />
              <RiskLine sev="high" text="Simultaneous length and privilege failures now produce a deterministic length-error priority that is not explicitly specified." />
              <RiskLine sev="high" text="Formal property PROP-ERROR-TIMING-023 no longer matches the proposed sequencing." />
              <RiskLine sev="medium" text="Interrupt timing may shift by one cycle under concurrent error conditions." />
              <RiskLine sev="medium" text="Verification plan does not currently include simultaneous error injection." />
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Supporting evidence</div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                ["Requirements", 3], ["Architecture", 3], ["RTL deps", 4], ["Prior defects", 2],
                ["Regression sigs", 6], ["Historical changes", 3], ["Formal refs", 5], ["Verification refs", 14],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between px-2 py-1 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                  <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{k}</span>
                  <span className="font-semibold" style={{ fontFamily: monoFont }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Uncertainty</div>
            <ul className="text-xs space-y-1" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
              <li>· 1 unresolved requirement (REQ-DDMAC-143)</li>
              <li>· 2 inferred relationships (advisory)</li>
              <li>· 1 undocumented firmware assumption</li>
              <li>· No measured performance result</li>
              <li>· Compute demand remains estimated</li>
            </ul>
            <button className="text-[10px] mt-1.5 underline" style={{ color: "hsl(var(--avep-primary))" }} onClick={() => setShowConfidenceDrawer(true)}>
              How is confidence calculated?
            </button>
          </div>

          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>Recommended owners</div>
            <div className="text-xs space-y-0.5" style={{ color: "hsl(var(--avep-foreground))" }}>
              <div>· Maya Chen — RTL Design Lead</div>
              <div>· Arun Patel — IP Architect</div>
              <div>· Sofia Rodriguez — Verification Lead</div>
              <div>· Daniel Kim — Formal Lead</div>
              <div>· Priya Shah — Security Engineer</div>
              <div>· Marcus Lee — Interface Owner</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel C — Blast Radius Graph */}
      <div style={card} className="p-3" data-walk="2">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
            <h3 className="text-sm font-semibold">Blast radius graph</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--avep-surface-muted))", color: "hsl(var(--avep-foreground-muted))" }}>
              {filteredNodes.length} nodes · {GRAPH_EDGES.length} relationships
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-xs px-2 py-1 rounded border" style={{ background: "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))" }}>
              <option value="all">All artifacts</option>
              {["Requirements","Architecture","RTL","Interfaces","Registers","Formal","Tests","Coverage","Docs","Approvals"].map(g => <option key={g}>{g}</option>)}
            </select>
            {(["direct-changed","direct-impacted","indirect","review","evidence-missing"] as Impact[]).map(s => (
              <div key={s} className="flex items-center gap-1 text-[10px]" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: stateColor(s) }} />
                {s.replace("-", " ")}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-auto" style={{ background: "hsl(var(--avep-surface-muted))", borderRadius: "var(--avep-radius-sm)" }}>
          <svg viewBox="0 0 1000 640" style={{ width: "100%", height: 520 }} role="img" aria-label="Change impact dependency graph">
            {/* edges */}
            {GRAPH_EDGES.map(([a, b], i) => {
              const na = GRAPH_NODES.find(n => n.id === a); const nb = GRAPH_NODES.find(n => n.id === b);
              if (!na || !nb) return null;
              const visible = filter === "all" || nb.group === filter || na.id === "N-CHG";
              return (
                <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={visible ? "hsl(var(--avep-border))" : "hsl(var(--avep-border))"}
                  strokeOpacity={visible ? 0.6 : 0.15} strokeWidth={1.2} />
              );
            })}
            {/* nodes */}
            {filteredNodes.map(n => {
              const isCenter = n.id === "N-CHG";
              const r = isCenter ? 32 : 22;
              return (
                <g key={n.id} onClick={() => { setSelectedNode(n); logAudit(`Selected node ${n.id}`); }} style={{ cursor: "pointer" }}>
                  <circle cx={n.x} cy={n.y} r={r} fill="hsl(var(--avep-surface))" stroke={stateColor(n.state)} strokeWidth={isCenter ? 3 : 2} />
                  <text x={n.x} y={n.y + r + 12} textAnchor="middle" fontSize="10" fill="hsl(var(--avep-foreground))" style={{ fontFamily: monoFont }}>
                    {n.label.length > 24 ? n.label.slice(0,24) + "…" : n.label}
                  </text>
                  <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize={isCenter ? 10 : 8} fill={stateColor(n.state)} style={{ fontFamily: monoFont, fontWeight: 700 }}>
                    {n.group.slice(0, isCenter ? 6 : 4)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Impact Inventory */}
      <div style={card} className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
          <h3 className="text-sm font-semibold">Impact inventory</h3>
        </div>
        <div className="flex gap-1 flex-wrap border-b mb-2" style={{ borderColor: "hsl(var(--avep-border))" }}>
          {[
            ["req","Requirements"],["arch","Architecture"],["rtl","RTL"],["ifreg","Interfaces & Registers"],
            ["formal","Formal"],["verif","Verification"],["cov","Coverage"],["defects","Defects"],
            ["docs","Documentation"],["approvals","Approvals"],["compute","Compute"],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as typeof tab)}
              className="text-xs px-3 py-1.5 -mb-px border-b-2"
              style={{
                borderColor: tab === k ? "hsl(var(--avep-primary))" : "transparent",
                color: tab === k ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                fontWeight: tab === k ? 600 : 500,
              }}>{l}</button>
          ))}
        </div>

        {tab === "req" && <InventoryTable head={["Requirement","Predicted impact","Confidence","Required action"]} rows={REQ_ROWS.map(r => [r.id, r.impact, `${r.conf}%`, r.action])} tones={REQ_ROWS.map(r => r.tone)} />}
        {tab === "arch" && <InventoryTable head={["Architecture source","Impact","Confidence","Required action"]} rows={[
          ["ARCH-FSM-04 · Descriptor validation FSM","Direct","96%","Update state diagram"],
          ["ARCH-ERR · Error handling","Direct","92%","Update error priority spec"],
          ["ARCH-PRIV · Privilege enforcement","Review","88%","Security review"],
        ]} />}
        {tab === "rtl" && <InventoryTable head={["Module","Impact","Relationship","Required action"]} rows={RTL_ROWS.map(r => [r.m, r.impact, r.rel, r.action])} tones={RTL_ROWS.map(r => r.tone)} />}
        {tab === "ifreg" && <InventoryTable head={["ID","Type","Impact","Relationship","Action","Confidence","Owner"]} rows={IF_REG_ROWS.map(r => [r.id, r.type, r.impact, r.rel, r.action, `${r.conf}%`, r.owner])} />}
        {tab === "formal" && (
          <div className="overflow-auto">
            <table className="w-full text-xs" style={{ fontFamily: monoFont }}>
              <thead style={{ background: "hsl(var(--avep-surface-muted))" }}>
                <tr>{["Property","Assertion","Current","Predicted","Required modification","Complexity","Owner"].map(h => <th key={h} className="text-left p-2">{h}</th>)}</tr>
              </thead>
              <tbody>
                {FORMAL_ROWS.map(r => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
                    <td className="p-2 font-semibold">{r.id}</td>
                    <td className="p-2" style={{ maxWidth: 320 }}>{r.text}</td>
                    <td className="p-2">{r.cur}</td>
                    <td className="p-2" style={{ color: r.pred.includes("Invalid") ? "hsl(var(--avep-danger))" : "hsl(var(--avep-foreground))" }}>{r.pred}</td>
                    <td className="p-2">{r.action}</td>
                    <td className="p-2">{r.cx}</td>
                    <td className="p-2">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "verif" && <InventoryTable head={["Test","Kind","Category","Impact","Execute","Runtime","Owner","Result"]} rows={TEST_ROWS.map(t => [t.name, t.kind, t.cat, t.impact, t.exec, t.rt, t.owner, t.res])} />}
        {tab === "cov" && <InventoryTable head={["Model","Bin","Current","Predicted","Stimulus","Formal candidate","Owner"]} rows={COV_ROWS.map(c => [c.model, c.bin, c.cur, c.pred, c.stim, c.formal, c.owner])} />}
        {tab === "defects" && <InventoryTable head={["ID","Title","State","Link","Owner"]} rows={DEFECT_ROWS.map(d => [d.id, d.title, d.state, d.link, d.owner])} />}
        {tab === "docs" && <InventoryTable head={["ID","Document","Required update"]} rows={DOC_ROWS.map(d => [d.id, d.name, d.state])} />}
        {tab === "approvals" && <InventoryTable head={["Role","Owner","Status","Required action"]} rows={APPROVAL_ROWS.map(a => [a.role, a.owner, a.status, a.action])} />}
        {tab === "compute" && (
          <div>
            <InventoryTable head={["Activity","Jobs","Estimated core-hours","Priority"]} rows={COMPUTE_ROWS.map(c => [c.act, c.jobs, String(c.hrs), c.pri])} />
            <div className="mt-2 flex items-center justify-between text-xs px-2 py-1.5 rounded" style={{ background: "hsl(var(--avep-warning-soft))", color: "hsl(var(--avep-warning))" }}>
              <span>Estimated total: 640 core-hours · Range 520 – 780</span>
              <span>Planning estimate based on historical execution. Actual usage may vary.</span>
            </div>
          </div>
        )}
      </div>

      {/* Proportionate Validation Plan */}
      <div style={card} className="p-3" data-walk="4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
          <h3 className="text-sm font-semibold">Proportionate validation plan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {VALIDATION_OPTIONS.map(o => {
            const t = tone(o.tone);
            const active = validationChoice === o.key;
            return (
              <button key={o.key} onClick={() => { setValidationChoice(o.key as "A" | "B" | "C"); logAudit(`Validation option ${o.key} selected`); }}
                className="p-3 rounded text-left border transition-colors"
                style={{
                  borderColor: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))",
                  background: active ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface))",
                }}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">Option {o.key} · {o.name}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: t.bg, color: t.fg }}>{o.status}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{o.risk}</div>
                <div className="grid grid-cols-4 gap-2 mt-2 text-xs" style={{ fontFamily: monoFont }}>
                  <Stat label="Core-hrs" v={String(o.hrs)} />
                  <Stat label="Tests" v={String(o.tests)} />
                  <Stat label="Props" v={String(o.prop)} />
                  <Stat label="Cov obj" v={String(o.cov)} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <PlanBlock title="Static & structural" items={["Compile & elaboration","RTL lint","CDC analysis","RDC analysis","Reset consistency","Synthesis readiness","Interface rule checks","Coding standard compliance"]} />
          <PlanBlock title="Formal validation" items={[
            "Prove invalid descriptors never accepted",
            "Prove valid max-length may be accepted",
            "Prove accept & reject mutually exclusive",
            "Prove error code matches condition",
            "Prove privilege violations cannot accept",
            "Prove reset returns to IDLE",
            "Prove error response within approved window (BLOCKED — REQ-DDMAC-143 clarification)",
          ]} />
          <PlanBlock title="Simulation" items={[
            "Directed: length {< max, = max, > max}",
            "Simultaneous length + privilege error",
            "Reset during validation",
            "Back-to-back invalid descriptors",
            "Error interrupt generation",
            "Register readback after error",
            "CRV: boundary-weighted, mixed privilege, backpressure",
          ]} />
          <PlanBlock title="Coverage" items={[
            "Boundary length bins",
            "Error type bins",
            "Error priority cross",
            "Privilege × length cross",
            "State transition coverage",
            "Reset in each state",
            "Back-to-back error coverage",
            "Requirement coverage",
          ]} />
        </div>
      </div>

      {/* Historical Change Intelligence */}
      <div style={card} className="p-3" data-walk="3">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
          <h3 className="text-sm font-semibold">Relevant historical evidence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HISTORY.map(h => (
            <div key={h.id} className="p-3 rounded border" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-muted))" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ fontFamily: monoFont }}>{h.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--avep-primary-soft))", color: "hsl(var(--avep-primary))" }}>{h.kind} · sim {h.sim}%</span>
              </div>
              <div className="text-sm mt-1 font-medium">{h.title}</div>
              <div className="text-xs mt-1" style={{ color: "hsl(var(--avep-foreground-muted))" }}>Module: <span style={{ fontFamily: monoFont }}>{h.module}</span></div>
              <div className="text-xs mt-1">Outcome: <span style={{ color: "hsl(var(--avep-danger))" }}>{h.outcome}</span></div>
              <div className="text-xs mt-2 p-2 rounded" style={{ background: "hsl(var(--avep-surface))" }}>
                <span className="font-medium">Lesson: </span>{h.lesson}
              </div>
              <div className="flex gap-1.5 mt-2">
                <SmallBtn onClick={() => logAudit(`Accepted lesson from ${h.id}`)}>Accept lesson</SmallBtn>
                <SmallBtn onClick={() => logAudit(`Dismissed lesson from ${h.id}`)}>Dismiss</SmallBtn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit trail */}
      <div style={card} className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
          <h3 className="text-sm font-semibold">Audit trail</h3>
        </div>
        <ul className="text-xs space-y-0.5 max-h-40 overflow-auto" style={{ fontFamily: monoFont, color: "hsl(var(--avep-foreground-muted))" }}>
          {audit.map((a, i) => <li key={i}>· {a}</li>)}
        </ul>
      </div>

      {/* Bottom decision bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t px-6 py-3"
        style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", boxShadow: "0 -4px 12px hsl(var(--avep-shadow) / 0.06)" }}
        data-walk="6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="px-2 py-1 rounded" style={{ background: "hsl(var(--avep-warning-soft))", color: "hsl(var(--avep-warning))" }}>
              <AlertTriangle className="h-3 w-3 inline mr-1" />Awaiting cross-discipline review
            </span>
            <span style={{ color: "hsl(var(--avep-danger))" }}><Lock className="h-3 w-3 inline mr-1" />1 blocking</span>
            <span style={{ color: "hsl(var(--avep-warning))" }}>3 high-severity</span>
            <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>Approvals 1 / 6</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <SmallBtn onClick={() => logAudit("Clarification requested for REQ-DDMAC-143")}>
              <MessageSquare className="h-3 w-3 inline mr-1" />Request clarification
            </SmallBtn>
            <SmallBtn onClick={() => { setShowValidationDrawer(true); logAudit("Opened modify impact analysis"); }}>Modify analysis</SmallBtn>
            <SmallBtn onClick={() => logAudit("Returned change for revision")}>Return for revision</SmallBtn>
            <button
              onClick={() => { if (confirm("You are approving this change for controlled static analysis, formal analysis, simulation, and regression execution. You are NOT approving production commit, baseline acceptance, signoff, or physical design advancement.")) logAudit("Approved for controlled validation"); }}
              className="text-xs px-3 py-1.5 rounded"
              style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))" }}>
              Approve for controlled validation
            </button>
            <button disabled title="Blocked until conditions resolved, validation complete, approvals complete"
              className="text-xs px-3 py-1.5 rounded cursor-not-allowed"
              style={{ background: "hsl(var(--avep-surface-muted))", color: "hsl(var(--avep-foreground-subtle))" }}>
              <Lock className="h-3 w-3 inline mr-1" />Approve baseline acceptance
            </button>
          </div>
        </div>
      </div>

      {/* Artifact drawer */}
      {selectedNode && (
        <Drawer onClose={() => setSelectedNode(null)} title={selectedNode.label} subtitle={selectedNode.group}>
          <DrawerRow k="Artifact ID" v={selectedNode.id} mono />
          <DrawerRow k="Type" v={selectedNode.group} />
          <DrawerRow k="Impact state" v={selectedNode.state} />
          <DrawerRow k="Relationship" v={selectedNode.relation ?? "Predicted via traversal"} />
          <DrawerRow k="Confidence" v={selectedNode.confidence != null ? `${selectedNode.confidence}%` : "—"} />
          <DrawerRow k="Owner" v={selectedNode.owner ?? "Unassigned"} />
          <DrawerRow k="Evidence" v={selectedNode.evidence ?? "Traversed dependency (advisory)"} />
          <DrawerRow k="Required action" v={selectedNode.action ?? "Review predicted impact"} />
          <DrawerRow k="Approval state" v={selectedNode.approval ?? "Not required"} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <SmallBtn onClick={() => { logAudit(`Confirmed relationship for ${selectedNode.id}`); setSelectedNode(null); }}>Human-confirm</SmallBtn>
            <SmallBtn onClick={() => { const j = prompt("Justification to remove predicted relationship:"); if (j) { logAudit(`Rejected relationship for ${selectedNode.id} · ${j}`); setSelectedNode(null); } }}>Reject prediction</SmallBtn>
          </div>
        </Drawer>
      )}

      {showConfidenceDrawer && (
        <Drawer onClose={() => setShowConfidenceDrawer(false)} title="Confidence explanation" subtitle="How the 89% is computed">
          {[
            ["Direct traceability", "+38"], ["Dependency strength", "+22"], ["Historical similarity", "+14"],
            ["Source completeness", "+11"], ["Prior defect correlation", "+9"], ["Reviewer confirmation", "+2"],
            ["Ambiguity penalty (REQ-DDMAC-143)", "-5"], ["Missing evidence penalty (3 inferred)", "-2"],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between text-xs py-1 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <span>{k}</span><span style={{ fontFamily: monoFont, color: (v as string).startsWith("-") ? "hsl(var(--avep-danger))" : "hsl(var(--avep-success))" }}>{v}</span>
            </div>
          ))}
          <p className="text-xs mt-3 p-2 rounded" style={{ background: "hsl(var(--avep-warning-soft))", color: "hsl(var(--avep-warning))" }}>
            Confidence indicates the strength of the impact prediction. It is not a verification result.
          </p>
        </Drawer>
      )}

      {showValidationDrawer && (
        <Drawer onClose={() => setShowValidationDrawer(false)} title="Validation scope" subtitle="Modify tests, properties, coverage, compute">
          <div className="text-xs space-y-2">
            <div>Currently selected: <b>Option {validationChoice}</b></div>
            <div className="p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
              Compare options in the Proportionate validation plan. Adding tests, properties, or coverage objectives recalculates compute demand.
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <SmallBtn onClick={() => logAudit("Added test: test_desc_dual_error_priority to scope")}>+ Add directed test</SmallBtn>
              <SmallBtn onClick={() => logAudit("Added property PROP-ERR-CODE-024 to scope")}>+ Add formal property</SmallBtn>
              <SmallBtn onClick={() => logAudit("Added coverage cross priv × length")}>+ Add coverage objective</SmallBtn>
              <SmallBtn onClick={() => logAudit("Recalculated compute demand")}>Recalculate compute</SmallBtn>
              <SmallBtn onClick={() => logAudit("Assigned owner Sofia Rodriguez to scope")}>Assign owner</SmallBtn>
              <SmallBtn onClick={() => logAudit("Saved review version")}>Save review version</SmallBtn>
            </div>
          </div>
        </Drawer>
      )}

      {/* Walkthrough overlay */}
      {walkStep !== null && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-6" style={{ background: "rgba(15,23,42,0.35)" }}>
          <div className="max-w-2xl w-full p-4 rounded" style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
                <span className="text-xs font-semibold">Change impact walkthrough · Step {walkStep + 1} of {walkTargets.length}</span>
              </div>
              <button onClick={() => setWalkStep(null)} className="text-xs" style={{ color: "hsl(var(--avep-foreground-muted))" }}>Close</button>
            </div>
            <p className="text-sm mb-3" style={{ color: "hsl(var(--avep-foreground))" }}>{walkTargets[walkStep]}</p>
            <div className="flex gap-2 justify-end">
              <SmallBtn onClick={() => setWalkStep(Math.max(0, walkStep - 1))}>Back</SmallBtn>
              {walkStep < walkTargets.length - 1
                ? <button onClick={() => setWalkStep(walkStep + 1)} className="text-xs px-3 py-1.5 rounded" style={{ background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))" }}>Next</button>
                : <button onClick={() => { setWalkStep(null); logAudit("Completed change impact walkthrough"); }} className="text-xs px-3 py-1.5 rounded" style={{ background: "hsl(var(--avep-success))", color: "hsl(var(--avep-primary-foreground))" }}>Finish</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Sub-components ----------
function KpiCard({ title, value, sub, icon, onClick, tone: t }: { title: string; value: string; sub: string; icon: React.ReactNode; onClick?: () => void; tone?: string }) {
  const c = t ? tone(t) : null;
  return (
    <button onClick={onClick} style={{ ...card, textAlign: "left" }} className="p-3 hover:opacity-90 transition-opacity">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>{title}</span>
        <span style={{ color: c ? c.fg : "hsl(var(--avep-primary))" }}>{icon}</span>
      </div>
      <div className="text-lg font-semibold" style={{ color: c ? c.fg : "hsl(var(--avep-foreground))" }}>{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{sub}</div>
    </button>
  );
}

function Row({ k, v, mono = true }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span style={{ color: "hsl(var(--avep-foreground-subtle))", fontFamily: "inherit" }}>{k}</span>
      <span className="truncate" style={{ color: "hsl(var(--avep-foreground))", fontFamily: mono ? monoFont : "inherit", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function SmallBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="text-xs px-2 py-1 rounded border hover:bg-black/[0.03]"
      style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))" }}>
      {children}
    </button>
  );
}

function DiffBlock({ title, baseline, proposed }: { title: string; baseline: string; proposed: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase mb-1" style={{ color: "hsl(var(--avep-foreground-subtle))", fontFamily: monoFont }}>{title}</div>
      <div className="grid grid-cols-2 gap-2">
        <pre className="text-[11px] p-2 rounded overflow-auto" style={{ background: "hsl(var(--avep-danger-soft))", color: "hsl(var(--avep-foreground))", fontFamily: monoFont, border: "1px solid hsl(var(--avep-danger) / 0.2)" }}>
          <div className="text-[9px] font-semibold mb-1" style={{ color: "hsl(var(--avep-danger))" }}>— Baseline</div>
          {baseline}
        </pre>
        <pre className="text-[11px] p-2 rounded overflow-auto" style={{ background: "hsl(var(--avep-success-soft))", color: "hsl(var(--avep-foreground))", fontFamily: monoFont, border: "1px solid hsl(var(--avep-success) / 0.2)" }}>
          <div className="text-[9px] font-semibold mb-1" style={{ color: "hsl(var(--avep-success))" }}>+ Proposed</div>
          {proposed}
        </pre>
      </div>
    </div>
  );
}

function RiskLine({ sev, text }: { sev: Severity; text: string }) {
  const t = tone(sev);
  return (
    <div className="flex items-start gap-2 px-2 py-1.5 rounded" style={{ background: t.bg }}>
      <span className="text-[10px] font-bold uppercase shrink-0" style={{ color: t.fg }}>{sev}</span>
      <span style={{ color: "hsl(var(--avep-foreground))" }}>{text}</span>
    </div>
  );
}

function InventoryTable({ head, rows, tones }: { head: string[]; rows: (string | number)[][]; tones?: string[] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-xs" style={{ fontFamily: monoFont }}>
        <thead style={{ background: "hsl(var(--avep-surface-muted))" }}>
          <tr>{head.map(h => <th key={h} className="text-left p-2 font-medium" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const t = tones ? tone(tones[i]) : null;
            return (
              <tr key={i} className="border-t hover:bg-black/[0.02]" style={{ borderColor: "hsl(var(--avep-border))" }}>
                {r.map((c, j) => (
                  <td key={j} className="p-2" style={{ color: t && j === r.length - 1 ? t.fg : "hsl(var(--avep-foreground))" }}>{c}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlanBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-3 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
      <div className="text-xs font-semibold mb-1.5">{title}</div>
      <ul className="text-xs space-y-1" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
        {items.map(i => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>{label}</div>
      <div className="text-xs font-semibold">{v}</div>
    </div>
  );
}

function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1" style={{ background: "rgba(15,23,42,0.25)" }} />
      <div className="w-[440px] max-w-full h-full overflow-auto p-4" style={{ background: "hsl(var(--avep-surface))", borderLeft: "1px solid hsl(var(--avep-border))" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>{subtitle}</div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button onClick={onClose}><XCircle className="h-5 w-5" style={{ color: "hsl(var(--avep-foreground-muted))" }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DrawerRow({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-xs py-1.5 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
      <span style={{ color: "hsl(var(--avep-foreground-subtle))" }}>{k}</span>
      <span className="text-right" style={{ color: "hsl(var(--avep-foreground))", fontFamily: mono ? monoFont : "inherit" }}>{v}</span>
    </div>
  );
}
