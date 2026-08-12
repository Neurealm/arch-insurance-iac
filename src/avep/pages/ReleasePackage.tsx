import { useMemo, useState } from "react";
import {
  FileText,
  Package,
  AlertTriangle,
  GitBranch,
  Layers,
  Play,
  Download,
  ChevronRight,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Fingerprint,
  Lock,
  Info,
  RefreshCw,
  ScrollText,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* AVEP.P3.RELEASE.001 — Documentation & Validated Design Package     */
/* Route: /avep/readiness/release-package                             */
/* ------------------------------------------------------------------ */

type Scenario = "T0" | "T1" | "T2" | "T3";
type Recommendation = "Approve" | "Hold" | "Conditional";
type SyncState =
  | "Current"
  | "Generated"
  | "Synchronized"
  | "Approved"
  | "Conditional"
  | "Missing"
  | "Stale"
  | "Conflicting"
  | "Superseded"
  | "Review Required"
  | "Excluded with Approval";

interface Artifact {
  id: string;
  name: string;
  category: string;
  required: boolean;
  version: string;
  expectedBaseline: string;
  actualBaseline: string;
  state: SyncState;
  evidencePct: number;
  provenance: number;
  owner: string;
  reviewer: string;
  approval: "Approved" | "Pending" | "Draft" | "Rejected";
  conditional: string | null;
  included: boolean;
  lastGenerated: string;
  lastValidated: string;
  hash?: string;
  path?: string;
}

const CATEGORIES = [
  "Design Definition",
  "Register & Software Contract",
  "Verification Planning",
  "Verification Evidence",
  "Constraints & Configuration",
  "Scripts & Manifests",
  "Risk & Governance",
  "Release & Handoff",
] as const;

/* ---------- deterministic artifact catalog (42) ---------- */

const RTL_BL = "rtl_baseline_3.2.18_candidate";
const DV_BL = "dv_env_2.4_candidate";

function a(
  id: string,
  name: string,
  category: (typeof CATEGORIES)[number],
  state: SyncState,
  overrides: Partial<Artifact> = {},
): Artifact {
  const base: Artifact = {
    id,
    name,
    category,
    required: true,
    version: "3.2.RC1",
    expectedBaseline: RTL_BL,
    actualBaseline: RTL_BL,
    state,
    evidencePct: 100,
    provenance: 100,
    owner: "Elena Garcia",
    reviewer: "Marcus Lee",
    approval: state === "Approved" ? "Approved" : state === "Missing" ? "Draft" : "Pending",
    conditional: null,
    included: state !== "Missing",
    lastGenerated: "2026-07-21 08:12",
    lastValidated: "2026-07-21 14:02",
    hash: "0x" + id.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0).toString(16).replace("-", ""),
    path: `pkg/${category.toLowerCase().replace(/[^a-z]/g, "-")}/${id}`,
  };
  return { ...base, ...overrides };
}

const ARTIFACTS: Artifact[] = [
  // 1. Design Definition (8)
  a("DDMAC_FUNCSPEC_3.2_RC1", "Functional specification", "Design Definition", "Approved", { owner: "Arun Patel" }),
  a("DDMAC_ARCHSPEC_3.2_RC1", "IP architecture specification", "Design Definition", "Approved", { owner: "Arun Patel" }),
  a("DDMAC_ICD_3.2_RC1", "Interface control document", "Design Definition", "Synchronized", { owner: "Arun Patel" }),
  a("DDMAC_CLKRST_3.2_RC1", "Clock and reset architecture", "Design Definition", "Conditional", { owner: "Maya Chen", conditional: "COND-004", evidencePct: 90 }),
  a("DDMAC_ERRSPEC_3.2_RC1", "Error-handling specification", "Design Definition", "Conditional", { owner: "Arun Patel", conditional: "COND-001", evidencePct: 88 }),
  a("DDMAC_SECSPEC_3.2_RC1", "Security behavior specification", "Design Definition", "Approved", { owner: "Priya Shah" }),
  a("DDMAC_PERF_3.2_RC1", "Performance requirements", "Design Definition", "Synchronized", { owner: "Arun Patel" }),
  a("DDMAC_HIER_3.2_RC1", "RTL hierarchy report", "Design Definition", "Generated", { owner: "Maya Chen" }),

  // 2. Register & Software Contract (8)
  a("DDMAC_REGISTER_SPEC_3.2_RC1", "Register specification", "Register & Software Contract", "Conflicting", {
    owner: "Elena Garcia",
    version: "3.2.16",
    actualBaseline: "reg_model_3.2.16",
    expectedBaseline: "reg_model_3.2.18",
    evidencePct: 70,
    provenance: 85,
    approval: "Draft",
    conditional: "COND-002",
  }),
  a("DDMAC_REGFIELDS_3.2_RC1", "Register field descriptions", "Register & Software Contract", "Stale", {
    owner: "Elena Garcia",
    evidencePct: 72,
    approval: "Draft",
  }),
  a("DDMAC_ADDRMAP_3.2_RC1", "Address map", "Register & Software Contract", "Synchronized", { owner: "Elena Garcia" }),
  a("DDMAC_RESETVAL_3.2_RC1", "Reset values", "Register & Software Contract", "Conflicting", {
    owner: "Elena Garcia",
    evidencePct: 75,
    approval: "Draft",
    conditional: "COND-002",
  }),
  a("DDMAC_ACCESSPOL_3.2_RC1", "Access policies", "Register & Software Contract", "Approved", { owner: "Priya Shah" }),
  a("DDMAC_FWPROG_3.2_RC1", "Firmware programming model", "Register & Software Contract", "Stale", {
    owner: "Elena Garcia",
    evidencePct: 80,
    approval: "Draft",
  }),
  a("DDMAC_INTRDEF_3.2_RC1", "Interrupt definitions", "Register & Software Contract", "Synchronized", { owner: "Elena Garcia" }),
  a("DDMAC_ERRCODES_3.2_RC1", "Error-code definitions", "Register & Software Contract", "Approved", { owner: "Elena Garcia" }),

  // 3. Verification Planning (6)
  a("DDMAC_VPLAN_3.2_RC1", "Verification plan", "Verification Planning", "Approved", { owner: "Sofia Rodriguez" }),
  a("DDMAC_TPLAN_3.2_RC1", "Test plan", "Verification Planning", "Approved", { owner: "Sofia Rodriguez" }),
  a("DDMAC_COVPLAN_3.2_RC1", "Coverage plan", "Verification Planning", "Approved", { owner: "Sofia Rodriguez" }),
  a("DDMAC_FVPLAN_3.2_RC1", "Formal verification plan", "Verification Planning", "Approved", { owner: "Daniel Kim" }),
  a("DDMAC_CHKPLAN_3.2_RC1", "Checker-validation plan", "Verification Planning", "Synchronized", { owner: "Sofia Rodriguez" }),
  a("DDMAC_REGSTRAT_3.2_RC1", "Regression strategy", "Verification Planning", "Approved", { owner: "Sofia Rodriguez" }),

  // 4. Verification Evidence (8)
  a("DDMAC_DV_REPORT_3.2_RC1", "DV report", "Verification Evidence", "Synchronized", {
    owner: "Sofia Rodriguez",
    conditional: "COND-001",
    evidencePct: 97,
  }),
  a("DDMAC_REG_SUMMARY_3.2_RC1", "Regression summary", "Verification Evidence", "Synchronized", {
    owner: "Sofia Rodriguez",
    actualBaseline: DV_BL,
    expectedBaseline: DV_BL,
  }),
  a("DDMAC_COV_REPORT_3.2_RC1", "Coverage report", "Verification Evidence", "Synchronized", {
    owner: "Sofia Rodriguez",
    actualBaseline: DV_BL,
    expectedBaseline: DV_BL,
  }),
  a("DDMAC_FORMAL_REPORT_3.2_RC1", "Formal verification report", "Verification Evidence", "Conflicting", {
    owner: "Daniel Kim",
    evidencePct: 92,
    approval: "Draft",
    conditional: "COND-003",
    hash: "0x8fe201aa (mismatch)",
  }),
  a("DDMAC_STATIC_REPORT_3.2_RC1", "Static-analysis report", "Verification Evidence", "Synchronized", { owner: "Aisha Rahman" }),
  a("DDMAC_CHKTRUST_3.2_RC1", "Checker-trust report", "Verification Evidence", "Approved", { owner: "Sofia Rodriguez" }),
  a("DDMAC_DEFCLOSE_3.2_RC1", "Defect closure report", "Verification Evidence", "Review Required", {
    owner: "Maya Chen",
    evidencePct: 85,
    approval: "Pending",
  }),
  a("DDMAC_REPRO_3.2_RC1", "Reproducibility report", "Verification Evidence", "Approved", { owner: "Marcus Lee" }),

  // 5. Constraints & Configuration (7)
  a("DDMAC_CLK_CONSTR_3.2_RC1", "Clock constraints", "Constraints & Configuration", "Approved", { owner: "Maya Chen" }),
  a("DDMAC_RST_CONSTR_3.2_RC1", "Reset constraints", "Constraints & Configuration", "Approved", { owner: "Maya Chen" }),
  a("DDMAC_CDCRDC_3.2_RC1", "CDC and RDC constraints", "Constraints & Configuration", "Synchronized", { owner: "Aisha Rahman" }),
  a("DDMAC_FASSUM_3.2_RC1", "Formal assumptions", "Constraints & Configuration", "Conditional", {
    owner: "Daniel Kim",
    conditional: "COND-001",
    evidencePct: 88,
  }),
  a("DDMAC_SIMCFG_3.2_RC1", "Simulation configuration", "Constraints & Configuration", "Synchronized", { owner: "Sofia Rodriguez" }),
  a("DDMAC_TOOLPROF_3.2_RC1", "Tool profiles", "Constraints & Configuration", "Stale", {
    owner: "Marcus Lee",
    evidencePct: 80,
    approval: "Draft",
  }),
  a("DDMAC_BUILDCFG_3.2_RC1", "Build configuration", "Constraints & Configuration", "Synchronized", { owner: "Marcus Lee" }),

  // 6. Scripts & Manifests (already implicit — but we add key manifests as artifacts too)
  a("DDMAC_FE_PACKAGE_MANIFEST_RC1", "Package manifest (yaml)", "Scripts & Manifests", "Conflicting", {
    owner: "Marcus Lee",
    approval: "Draft",
    evidencePct: 90,
    provenance: 100,
    conditional: "COND-003",
    hash: "0xab21ee9c (formal hash mismatch)",
    path: "pkg/manifests/DDMAC_FE_PACKAGE_MANIFEST_RC1.yaml",
  }),

  // 7. Risk & Governance
  a("DDMAC_KNOWN_LIMITATIONS_3.2_RC1", "Known limitations", "Risk & Governance", "Missing", {
    owner: "Arun Patel",
    evidencePct: 60,
    approval: "Draft",
    conditional: "COND-004",
    included: false,
  }),
  a("DDMAC_WAIVER_REG_3.2_RC1", "Waiver register", "Risk & Governance", "Review Required", {
    owner: "Marcus Lee",
    evidencePct: 88,
    approval: "Pending",
  }),
  a("DDMAC_RESIDUAL_RISK_3.2_RC1", "Residual-risk register", "Risk & Governance", "Review Required", {
    owner: "Marcus Lee",
    evidencePct: 90,
    approval: "Pending",
  }),
  a("DDMAC_OPEN_COND_3.2_RC1", "Open-condition register", "Risk & Governance", "Generated", {
    owner: "Marcus Lee",
    approval: "Draft",
  }),

  // 8. Release & Handoff
  a("DDMAC_RELNOTES_3.2_RC1", "Release notes", "Release & Handoff", "Generated", { owner: "Elena Garcia", approval: "Draft" }),
  a("DDMAC_CHGSUM_3.2_RC1", "Change summary", "Release & Handoff", "Generated", { owner: "Elena Garcia", approval: "Draft" }),
  a("DDMAC_PKGLIST_3.2_RC1", "Package contents list", "Release & Handoff", "Generated", { owner: "Marcus Lee", approval: "Draft" }),
  a("DDMAC_PD_INTAKE_3.2_RC1", "Physical-design intake guide", "Release & Handoff", "Missing", {
    owner: "Marcus Lee",
    evidencePct: 55,
    approval: "Draft",
    included: false,
  }),
  a("DDMAC_DOWNRESP_3.2_RC1", "Downstream responsibility matrix", "Release & Handoff", "Missing", {
    owner: "Marcus Lee",
    evidencePct: 40,
    approval: "Draft",
    included: false,
  }),
  a("DDMAC_CONTACTS_3.2_RC1", "Contact & ownership directory", "Release & Handoff", "Synchronized", { owner: "Marcus Lee" }),

  // extra design-definition doc (TRM) — the drift target
  a("DDMAC_TRM_3.2_RC1", "Technical Reference Manual", "Design Definition", "Stale", {
    owner: "Elena Garcia",
    version: "3.2.RC1",
    evidencePct: 74,
    provenance: 92,
    approval: "Draft",
  }),
];

/* ---------- Drift findings ---------- */

interface Drift {
  id: string;
  artifactId: string;
  section: string;
  severity: "High" | "Medium" | "Low";
  kind: string;
  finding: string;
  controlledSource: string;
  documentValue: string;
  expectedValue: string;
  action: string;
  owner: string;
  state: "Open" | "Accepted" | "Rejected" | "In Review";
}

const DRIFTS: Drift[] = [
  {
    id: "DOC-DRIFT-014",
    artifactId: "DDMAC_TRM_3.2_RC1",
    section: "Descriptor Length Handling",
    severity: "High",
    kind: "Conflicting value",
    finding: "Equal-to-maximum length is described as invalid.",
    controlledSource: "REQ-DDMAC-142 · RTL exclusive comparison",
    documentValue: "len ≥ MAX_XFER_LEN → reject",
    expectedValue: "len > MAX_XFER_LEN → reject",
    action: "Regenerate section and request architecture review",
    owner: "Elena Garcia",
    state: "Open",
  },
  {
    id: "DOC-DRIFT-019",
    artifactId: "DDMAC_REGISTER_SPEC_3.2_RC1",
    section: "ERR_STATUS.ERROR_CODE",
    severity: "High",
    kind: "Stale value",
    finding: "Field width documented as 2 bits; controlled model defines 3 bits.",
    controlledSource: "reg_model_3.2.18",
    documentValue: "[1:0] 2b",
    expectedValue: "[2:0] 3b",
    action: "Synchronize from current controlled register model",
    owner: "Elena Garcia",
    state: "Open",
  },
  {
    id: "DOC-DRIFT-021",
    artifactId: "DDMAC_KNOWN_LIMITATIONS_3.2_RC1",
    section: "Known Limitations",
    severity: "High",
    kind: "Missing limitation",
    finding: "Conditional timing interpretation not included.",
    controlledSource: "COND-001 · WVR FORMAL 006",
    documentValue: "—",
    expectedValue: "Error-response timing entry with owner, mitigation, expiration",
    action: "Add limitation with owner, mitigation, expiration",
    owner: "Arun Patel",
    state: "Open",
  },
  {
    id: "DOC-DRIFT-028",
    artifactId: "DDMAC_DV_REPORT_3.2_RC1",
    section: "Regression Results",
    severity: "Medium",
    kind: "Unlinked claim",
    finding: "Regression pass rate references an earlier run.",
    controlledSource: "REG-2026-07-21-0051",
    documentValue: "REG-2026-07-18-0044",
    expectedValue: "REG-2026-07-21-0051",
    action: "Link current accepted regression baseline",
    owner: "Sofia Rodriguez",
    state: "In Review",
  },
  {
    id: "DOC-DRIFT-031",
    artifactId: "DDMAC_TRM_3.2_RC1",
    section: "Descriptor state diagram",
    severity: "Medium",
    kind: "Superseded diagram",
    finding: "Diagram references retired state DESC_HOLD.",
    controlledSource: "ARCH DDMAC 3.2 §4.7",
    documentValue: "Includes DESC_HOLD",
    expectedValue: "DESC_HOLD removed in 3.2",
    action: "Regenerate diagram from architecture source",
    owner: "Elena Garcia",
    state: "Open",
  },
  {
    id: "DOC-DRIFT-037",
    artifactId: "DDMAC_FE_PACKAGE_MANIFEST_RC1",
    section: "artifacts.formal",
    severity: "High",
    kind: "Incorrect baseline",
    finding: "Formal report hash does not match approved formal run.",
    controlledSource: "formal_run_2026.07.21.09",
    documentValue: "0x8fe201aa",
    expectedValue: "0xd42a1c73",
    action: "Reconcile package manifest and regenerate hash",
    owner: "Marcus Lee",
    state: "Open",
  },
];

/* ---------- Conditional items, limitations, approvals ---------- */

const CONDITIONS = [
  { id: "COND-001", desc: "Error-response timing interpretation remains time-limited and owned.", owner: "Arun Patel", due: "2026-09-30", state: "Pending", packageImpact: "DV report + formal assumptions + known limitations" },
  { id: "COND-002", desc: "Register document synchronization from reg_model_3.2.18 required.", owner: "Elena Garcia", due: "2026-07-24", state: "In Progress", packageImpact: "Register specification, reset values, TRM" },
  { id: "COND-003", desc: "Formal-report manifest hash must be corrected.", owner: "Marcus Lee", due: "2026-07-23", state: "Open", packageImpact: "Package manifest, formal evidence link" },
  { id: "COND-004", desc: "Known-limitations section must include approved timing assumption.", owner: "Arun Patel", due: "2026-07-24", state: "Open", packageImpact: "Known limitations, release notes, TRM" },
];

const LIMITATIONS = [
  {
    name: "Error-response timing interpretation",
    impact: "Formal proof and timing documentation use an approved interpretation.",
    affected: "DV report, formal assumptions, TRM",
    mitigation: "Preserve assumption and monitor downstream integration.",
    detection: "Formal monitor + regression assertion",
    owner: "Arun Patel",
    expiration: "2026-09-30",
    downstream: "Physical-design intake team must retain the approved behavior contract.",
    state: "Conditional approval pending",
  },
  {
    name: "Unreachable privilege-reset cross exclusion",
    impact: "Functional-coverage cross excluded with formal unreachability proof.",
    affected: "Coverage report, waiver register",
    mitigation: "Formal proof retained; revalidate on register-model change.",
    detection: "Coverage exclusion linked to formal property",
    owner: "Sofia Rodriguez",
    expiration: "2026-12-31",
    downstream: "Preserve exclusion rationale during physical-design integration.",
    state: "Approved",
  },
];

const APPROVALS = [
  { role: "RTL Design Lead", owner: "Maya Chen", responsibility: "RTL and implementation documentation", state: "Approved with condition" },
  { role: "Verification Lead", owner: "Sofia Rodriguez", responsibility: "DV report and regression evidence", state: "Approved" },
  { role: "Formal Lead", owner: "Daniel Kim", responsibility: "Formal report and assumptions", state: "Pending" },
  { role: "Static Analysis Lead", owner: "Aisha Rahman", responsibility: "Static report and constraints", state: "Approved" },
  { role: "IP Architect", owner: "Arun Patel", responsibility: "Specifications, interfaces, limitations", state: "Pending" },
  { role: "Documentation Lead", owner: "Elena Garcia", responsibility: "Document synchronization", state: "Pending" },
  { role: "Release Authority", owner: "Marcus Lee", responsibility: "Package approval and handoff", state: "Pending" },
];

/* ---------- DV report structured sections ---------- */

const DV_SECTIONS: { title: string; supported: boolean; claim: string; evidence: string[]; warning?: string }[] = [
  { title: "Executive engineering summary", supported: true, claim: "Front-end verification obligations met with 4 conditional items.", evidence: ["COND-001", "COND-002", "COND-003", "COND-004"] },
  { title: "Scope and baselines", supported: true, claim: "Package assembled against rtl_baseline_3.2.18_candidate and dv_env_2.4_candidate.", evidence: [RTL_BL, DV_BL] },
  { title: "Requirements closure", supported: true, claim: "184 of 186 requirements verified; 2 approved-with-clarification.", evidence: ["REQ-REVIEW-2026.07.12"] },
  { title: "Verification environment", supported: true, claim: "UVM environment 2.4 with 412 SVA and validated scoreboard.", evidence: ["CHK-TRUST-018"] },
  { title: "Test execution", supported: true, claim: "10,000 seed regression executed without unexplained failures.", evidence: ["REG-2026-07-21-0051"] },
  { title: "Regression results", supported: false, claim: "Regression pass rate 99.98%.", evidence: ["REG-2026-07-18-0044 (stale)"], warning: "Cited run is superseded — see DOC-DRIFT-028" },
  { title: "Formal verification", supported: true, claim: "34 of 36 required properties proven; 2 bounded assumptions retained.", evidence: ["formal_run_2026.07.21.09", "WVR FORMAL 006"] },
  { title: "Static analysis", supported: true, claim: "Lint and CDC clean or waived; one blocking RDC under remediation.", evidence: ["static_run_2026.07.21.04", "BLK-003"] },
  { title: "Coverage closure", supported: true, claim: "Functional coverage 97.1% with dispositioned gaps.", evidence: ["COV-DDMAC-3.2-017"] },
  { title: "Defect summary", supported: true, claim: "3 material defects: 1 blocking, 2 conditional.", evidence: ["DEF-RTL-224", "DEF-DV-219", "DEF-TB-087"] },
  { title: "Waivers", supported: true, claim: "8 active waivers, 2 pending final approval.", evidence: ["WVR FORMAL 006", "WVR COV 014"] },
  { title: "Known limitations", supported: false, claim: "One conditional timing interpretation documented.", evidence: [], warning: "Limitation entry missing — see DOC-DRIFT-021" },
  { title: "Residual risks", supported: true, claim: "6 residual risks with accountable owners and expirations.", evidence: ["RSK-001", "RSK-002", "RSK-003", "RSK-004", "RSK-005", "RSK-006"] },
  { title: "Reproducibility", supported: true, claim: "All required runs reproducible with pinned tool profiles.", evidence: ["REPRO-2026.07.21"] },
  { title: "Signoff approvals", supported: true, claim: "4 of 7 required approvals complete.", evidence: ["APPROVALS-2026.07.21"] },
  { title: "Conditional items", supported: true, claim: "4 conditional items tracked with owners and due dates.", evidence: ["COND-001", "COND-002", "COND-003", "COND-004"] },
  { title: "Conclusion and handoff state", supported: true, claim: "Front-end package In Review · handoff not yet authorized.", evidence: [] },
];

/* ---------- Scenario meta ---------- */

const SCENARIO_META: Record<Scenario, {
  label: string;
  packageState: string;
  complete: number;
  conditional: number;
  missing: number;
  conflicts: number;
  drift: number;
  evidencePct: number;
  recommendation: Recommendation;
}> = {
  T0: { label: "T0 · Package Approved", packageState: "Approved", complete: 42, conditional: 0, missing: 0, conflicts: 0, drift: 0, evidencePct: 100, recommendation: "Approve" },
  T1: { label: "T1 · Documentation Drift", packageState: "In Remediation", complete: 27, conditional: 4, missing: 6, conflicts: 5, drift: 12, evidencePct: 78, recommendation: "Hold" },
  T2: { label: "T2 · Package Assembly", packageState: "In Review", complete: 35, conditional: 4, missing: 3, conflicts: 2, drift: 6, evidencePct: 92, recommendation: "Hold" },
  T3: { label: "T3 · Package Validated", packageState: "Authorized for PD intake", complete: 42, conditional: 2, missing: 0, conflicts: 0, drift: 0, evidencePct: 100, recommendation: "Approve" },
};

/* ---------- helpers ---------- */

const stateColor: Record<SyncState, string> = {
  "Current": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Generated": "bg-sky-50 text-sky-700 border-sky-200",
  "Synchronized": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Conditional": "bg-amber-50 text-amber-700 border-amber-200",
  "Missing": "bg-rose-50 text-rose-700 border-rose-200",
  "Stale": "bg-orange-50 text-orange-700 border-orange-200",
  "Conflicting": "bg-rose-50 text-rose-700 border-rose-200",
  "Superseded": "bg-neutral-50 text-neutral-500 border-neutral-200",
  "Review Required": "bg-sky-50 text-sky-700 border-sky-200",
  "Excluded with Approval": "bg-neutral-50 text-neutral-500 border-neutral-200",
};

const recColor: Record<Recommendation, string> = {
  Approve: "bg-emerald-600 text-white",
  Conditional: "bg-amber-500 text-white",
  Hold: "bg-rose-600 text-white",
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

function Kv({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="text-[11px]"><div className="text-neutral-500">{k}</div><div className="font-medium text-neutral-900 break-words">{v}</div></div>;
}

/* ================================================================== */
/*                             MAIN PAGE                              */
/* ================================================================== */

export default function ReleasePackage() {
  const [scenario, setScenario] = useState<Scenario>("T2");
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [tab, setTab] = useState<"summary" | "sources" | "document" | "drift" | "evidence" | "history" | "approvals" | "inclusion" | "audit">("summary");
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [walkOpen, setWalkOpen] = useState(false);
  const [walkStep, setWalkStep] = useState(0);

  const meta = SCENARIO_META[scenario];

  const artifacts = useMemo<Artifact[]>(() => {
    if (scenario === "T2") return ARTIFACTS;
    if (scenario === "T0" || scenario === "T3") {
      return ARTIFACTS.map((x) => ({
        ...x,
        state: (x.state === "Missing" || x.state === "Conflicting" || x.state === "Stale" ? "Approved" : x.state) as SyncState,
        included: true,
        approval: "Approved" as const,
        conditional: scenario === "T3" && x.conditional ? x.conditional : null,
        evidencePct: 100,
        provenance: 100,
      }));
    }
    // T1
    return ARTIFACTS.map((x, i) => ({
      ...x,
      state: (i % 3 === 0 ? "Stale" : i % 5 === 0 ? "Missing" : i % 7 === 0 ? "Conflicting" : x.state) as SyncState,
      evidencePct: Math.max(50, x.evidencePct - 20),
      approval: "Draft" as const,
    }));
  }, [scenario]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return artifacts.filter(
      (x) =>
        (categoryFilter === "All" || x.category === categoryFilter) &&
        (!q || [x.id, x.name, x.owner, x.state, x.category].some((v) => v.toLowerCase().includes(q))),
    );
  }, [artifacts, filter, categoryFilter]);

  const walkSteps = [
    "Review controlled baselines in the context strip",
    "Inspect the 42-artifact package matrix",
    "Open drift finding DOC-DRIFT-014 (TRM descriptor length)",
    "Compare the document with its controlled source",
    "Review the evidence-backed DV report claims",
    "Inspect missing and conditional artifacts",
    "Validate the package manifest and hashes",
    "Review provenance and reproducibility",
    "Inspect known limitations retained downstream",
    "Note the physical-design intake boundary",
    "Show accountable human approval controls",
  ];

  return (
    <div className="min-h-full bg-neutral-50/60">
      {/* Context strip */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-[11px] font-medium text-neutral-600">
          <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Program <span className="ml-1 font-mono text-neutral-900">StrataShield SoC</span></span>
          <span>IP <span className="font-mono text-neutral-900">DDMAC 3.2</span></span>
          <span>RTL <span className="font-mono text-neutral-900">{RTL_BL}</span></span>
          <span>DV <span className="font-mono text-neutral-900">{DV_BL}</span></span>
          <span>Static <span className="font-mono text-neutral-900">static_run_2026.07.21.04</span></span>
          <span>Formal <span className="font-mono text-neutral-900">formal_run_2026.07.21.09</span></span>
          <span>Regression <span className="font-mono text-neutral-900">REG-2026-07-21-0051</span></span>
          <span>Coverage <span className="font-mono text-neutral-900">COV-DDMAC-3.2-017</span></span>
          <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Candidate <span className="font-mono text-neutral-900">DDMAC_FE_PACKAGE_3.2_RC1</span></span>
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Role <span className="font-mono text-neutral-900">Release Review Chair</span></span>
          <span className="ml-auto flex items-center gap-2">
            <label className="text-neutral-500">Scenario</label>
            <select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)} className="rounded-md border border-neutral-200 bg-white px-2 py-1 font-mono text-[11px]">
              {(Object.keys(SCENARIO_META) as Scenario[]).map((k) => <option key={k} value={k}>{SCENARIO_META[k].label}</option>)}
            </select>
            <button onClick={() => { setWalkOpen(true); setWalkStep(0); }} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50"><Play className="h-3 w-3" /> Walkthrough</button>
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div className="max-w-3xl">
            <div className="text-[11px] font-mono text-neutral-500">AVEP.P3.RELEASE.001 · Phase 3 · Produce Documents and the Release Package</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">Documentation &amp; Validated Design Package</h1>
            <p className="mt-1 text-sm text-neutral-600">Synchronize engineering documentation, assemble evidence-backed release artifacts, validate package completeness and provenance, and prepare a reproducible front-end package for physical-design intake.</p>
            <p className="mt-2 text-xs text-neutral-500 max-w-2xl">Front-end release only. This workspace does not authorize tapeout, fabrication, packaging, or physical silicon release.</p>
          </div>
          <div className={`rounded-lg px-4 py-3 ${recColor[meta.recommendation]}`}>
            <div className="text-[10px] uppercase tracking-wider opacity-80">Package recommendation</div>
            <div className="text-lg font-semibold">{meta.recommendation === "Approve" ? "Approve" : meta.recommendation === "Hold" ? "Hold" : "Conditional"}</div>
            <div className="text-[11px] opacity-90">Human approval required</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4 md:grid-cols-5">
        {[
          { l: "Required artifacts", v: "42", d: "10 package categories" },
          { l: "Complete", v: String(meta.complete), d: "Current and approved" },
          { l: "Conditional", v: String(meta.conditional), d: "Bounded conditions" },
          { l: "Missing", v: String(meta.missing), d: "Required before handoff" },
          { l: "Drift findings", v: String(meta.drift), d: "Docs differ from sources" },
          { l: "Version conflicts", v: String(meta.conflicts), d: "Mixed baseline references" },
          { l: "Evidence completeness", v: `${meta.evidencePct}%`, d: "39 of 42 obligations" },
          { l: "Provenance coverage", v: "98%", d: "One artifact incomplete lineage" },
          { l: "Reproducibility", v: "Conditional", d: "One tool-profile mismatch" },
          { l: "Package state", v: meta.packageState, d: `Recommendation ${meta.recommendation}` },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-[11px] font-medium text-neutral-500">{k.l}</div>
            <div className="mt-1 text-xl font-semibold text-neutral-900">{k.v}</div>
            <div className="text-[11px] text-neutral-500">{k.d}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 pb-24 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Package matrix */}
          <Section
            title="Validated Package Matrix"
            subtitle={`${filtered.length} of ${artifacts.length} artifacts · click a row for synchronization details`}
            icon={Package}
            right={
              <div className="flex items-center gap-2">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px]">
                  <option>All</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
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
                    {["ID", "Artifact", "Category", "Version", "Actual baseline", "State", "Evidence", "Provenance", "Owner", "Approval", "Cond.", "In pkg"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((x) => (
                    <tr key={x.id} onClick={() => { setSelected(x); setTab("summary"); }} className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50/60">
                      <td className="px-2 py-1.5 font-mono text-neutral-800">{x.id}</td>
                      <td className="px-2 py-1.5">{x.name}</td>
                      <td className="px-2 py-1.5 text-neutral-500">{x.category}</td>
                      <td className="px-2 py-1.5 font-mono">{x.version}</td>
                      <td className={`px-2 py-1.5 font-mono ${x.actualBaseline !== x.expectedBaseline ? "text-rose-700 font-medium" : "text-neutral-600"}`}>{x.actualBaseline}</td>
                      <td className="px-2 py-1.5"><Pill className={stateColor[x.state]}>{x.state}</Pill></td>
                      <td className="px-2 py-1.5">{x.evidencePct}%</td>
                      <td className="px-2 py-1.5">{x.provenance}%</td>
                      <td className="px-2 py-1.5">{x.owner}</td>
                      <td className={`px-2 py-1.5 ${x.approval === "Approved" ? "text-emerald-700" : x.approval === "Draft" ? "text-neutral-500" : "text-amber-700"}`}>{x.approval}</td>
                      <td className="px-2 py-1.5 font-mono text-neutral-500">{x.conditional || "—"}</td>
                      <td className="px-2 py-1.5">{x.included ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-rose-600" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Drift Intelligence */}
          <Section title="Documentation Drift Intelligence" subtitle={`${DRIFTS.length} findings · document regeneration produces a new draft revision`} icon={AlertTriangle}>
            <div className="space-y-2">
              {DRIFTS.map((d) => (
                <div key={d.id} className="rounded-lg border border-neutral-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-neutral-500">{d.id}</span>
                      <span className="text-sm font-medium">{d.section}</span>
                      <Pill className={d.severity === "High" ? "border-rose-200 bg-rose-50 text-rose-700" : d.severity === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-neutral-200 bg-neutral-50 text-neutral-600"}>{d.severity}</Pill>
                      <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">{d.kind}</Pill>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-500">{d.artifactId}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-neutral-800">{d.finding}</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] md:grid-cols-3">
                    <div className="rounded-md border border-neutral-200 p-2"><div className="text-neutral-500">Document value</div><div className="font-mono text-neutral-900">{d.documentValue}</div></div>
                    <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2"><div className="text-neutral-500">Expected value</div><div className="font-mono text-neutral-900">{d.expectedValue}</div></div>
                    <div className="rounded-md border border-neutral-200 p-2"><div className="text-neutral-500">Controlled source</div><div className="font-mono text-neutral-900">{d.controlledSource}</div></div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-neutral-600"><span className="font-medium">Action</span> — {d.action}</span>
                    <div className="flex gap-1">
                      <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50"><RefreshCw className="mr-1 inline h-3 w-3" />Regenerate section</button>
                      <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50">Accept correction</button>
                      <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50">Reject finding</button>
                      <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50">Assign owner</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* DV Report */}
          <Section title="Evidence-Backed DV Report" subtitle="Every claim links to supporting engineering evidence" icon={ScrollText}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {DV_SECTIONS.map((s, i) => (
                <div key={i} className={`rounded-md border p-3 text-[11px] ${s.supported ? "border-neutral-200 bg-white" : "border-amber-200 bg-amber-50/50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-neutral-900">{s.title}</div>
                    {!s.supported && <Pill className="border-amber-200 bg-white text-amber-700">Unsupported</Pill>}
                  </div>
                  <p className="mt-1 text-neutral-700">{s.claim}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.evidence.map((e) => (
                      <span key={e} className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-700">{e}</span>
                    ))}
                  </div>
                  {s.warning && <div className="mt-1 text-[11px] text-amber-800">⚠ {s.warning}</div>}
                </div>
              ))}
            </div>
          </Section>

          {/* Dependency graph */}
          <Section title="Package Dependency Graph" subtitle="From requirement to release approval" icon={GitBranch}>
            <PackageGraph />
            <p className="mt-2 text-[11px] text-neutral-600">
              <span className="font-mono">REQ-DDMAC-142</span> → Descriptor architecture → <span className="font-mono">ddmac_descriptor_validator</span> → Boundary regression → Formal property → DV report §7 → TRM §4.7 → Package manifest → Release approval
            </p>
          </Section>

          {/* Manifest */}
          <Section title="Reproducible Package Manifest" subtitle="DDMAC_FE_PACKAGE_MANIFEST_RC1.yaml" icon={Fingerprint}>
            <pre className="overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed text-neutral-800">{`package:
  id: DDMAC_FE_PACKAGE_3.2_RC1
  program: StrataShield Secure Processing SoC
  ip: DDMAC
  revision: "3.2"

baselines:
  rtl:         ${RTL_BL}
  verification:${DV_BL}
  static:      static_run_2026.07.21.04
  formal:      formal_run_2026.07.21.09
  regression:  REG-2026-07-21-0051
  coverage:    COV-DDMAC-3.2-017

artifacts:
  required:    42
  complete:    ${meta.complete}
  conditional: ${meta.conditional}
  missing:     ${meta.missing}

reproducibility:
  status:                conditional_pass
  tool_profiles_locked:  true
  source_hashes_complete:true
  formal_hash_conflict:  ${meta.conflicts > 0 ? "true  # COND-003" : "false"}`}</pre>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-[11px]">
                <thead className="bg-neutral-50 text-left text-neutral-500">
                  <tr>{["Artifact", "Version", "Path", "Hash", "Approval", "Inclusion"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {artifacts.slice(0, 12).map((x) => (
                    <tr key={x.id} className="border-t border-neutral-100">
                      <td className="px-2 py-1.5 font-mono">{x.id}</td>
                      <td className="px-2 py-1.5 font-mono">{x.version}</td>
                      <td className="px-2 py-1.5 font-mono text-neutral-600">{x.path}</td>
                      <td className={`px-2 py-1.5 font-mono ${x.hash?.includes("mismatch") ? "text-rose-700" : "text-neutral-700"}`}>{x.hash}</td>
                      <td className="px-2 py-1.5">{x.approval}</td>
                      <td className="px-2 py-1.5">{x.included ? "Included" : "Excluded"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {["Compare manifests", "Validate hashes", "Detect duplicates", "Detect missing files", "Detect superseded files", "Detect baseline conflicts", "Regenerate manifest"].map((a) => (
                <button key={a} className="rounded-md border border-neutral-200 bg-white px-2 py-1 hover:bg-neutral-50">{a}</button>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-4 xl:col-span-1">
          {/* Package Completeness */}
          <Section title="Package Completeness Model" icon={CheckCircle2}>
            <div className="space-y-2">
              {CATEGORIES.map((c) => {
                const arts = artifacts.filter((x) => x.category === c);
                const complete = arts.filter((x) => x.state === "Approved" || x.state === "Synchronized" || x.state === "Current").length;
                const missing = arts.filter((x) => x.state === "Missing").length;
                const conflict = arts.filter((x) => x.state === "Conflicting").length;
                return (
                  <div key={c} className="rounded-md border border-neutral-200 p-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-800">{c}</span>
                      <span className="text-neutral-500">{complete}/{arts.length}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-neutral-100">
                      <div className="h-full bg-emerald-500" style={{ width: `${(complete / Math.max(1, arts.length)) * 100}%` }} />
                    </div>
                    {(missing > 0 || conflict > 0) && (
                      <div className="mt-1 flex gap-2 text-[10px]">
                        {missing > 0 && <span className="text-rose-700">{missing} missing</span>}
                        {conflict > 0 && <span className="text-rose-700">{conflict} conflicting</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Conditional register */}
          <Section title="Conditional Item Register" icon={Clock}>
            <ul className="space-y-2 text-[11px]">
              {CONDITIONS.map((c) => (
                <li key={c.id} className="rounded-md border border-amber-200 bg-amber-50/60 p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-neutral-800">{c.id}</span>
                    <Pill className="border-amber-300 bg-white text-amber-700">{c.state}</Pill>
                  </div>
                  <p className="mt-1 text-neutral-900">{c.desc}</p>
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-neutral-600">
                    <span>Owner <span className="text-neutral-900">{c.owner}</span></span>
                    <span>Due <span className="text-neutral-900">{c.due}</span></span>
                    <span className="col-span-2">Impact <span className="text-neutral-900">{c.packageImpact}</span></span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Limitations */}
          <Section title="Known Limitations & Downstream Responsibilities" icon={Info}>
            <ul className="space-y-2 text-[11px]">
              {LIMITATIONS.map((l) => (
                <li key={l.name} className="rounded-md border border-neutral-200 p-2">
                  <div className="font-medium text-neutral-900">{l.name}</div>
                  <div className="mt-1 grid gap-0.5 text-neutral-600">
                    <span><b className="text-neutral-800">Impact</b> — {l.impact}</span>
                    <span><b className="text-neutral-800">Affected</b> — {l.affected}</span>
                    <span><b className="text-neutral-800">Mitigation</b> — {l.mitigation}</span>
                    <span><b className="text-neutral-800">Detection</b> — {l.detection}</span>
                    <span><b className="text-neutral-800">Owner</b> — {l.owner} · Expires {l.expiration}</span>
                    <span className="text-neutral-800"><b>Downstream</b> — {l.downstream}</span>
                  </div>
                  <div className="mt-1"><Pill className="border-amber-200 bg-amber-50 text-amber-700">{l.state}</Pill></div>
                </li>
              ))}
            </ul>
          </Section>

          {/* Provenance */}
          <Section title="Provenance & Lineage" icon={Fingerprint}>
            <div className="space-y-2 text-[11px]">
              <p className="italic text-neutral-600">“Generated content is not approved content. Approval status belongs to the artifact revision, not the generation event.”</p>
              {[
                { key: "Source systems", value: "Requirements, Architecture, Register Model, RTL, DV" },
                { key: "AI skill", value: "avep.doc-sync v2.3.1" },
                { key: "Generation timestamp", value: "2026-07-21 08:12" },
                { key: "Human modifications", value: "3 sections edited by Elena Garcia" },
                { key: "Reviewer", value: "Marcus Lee" },
                { key: "Output hash", value: "0x9a72c4f18b0e3d5f" },
                { key: "Package inclusion", value: "35 of 42 required" },
              ].map((r) => (
                <div key={r.key} className="flex items-start justify-between rounded-md border border-neutral-200 bg-white px-2 py-1.5">
                  <span className="text-neutral-500">{r.key}</span>
                  <span className="font-mono text-neutral-900">{r.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Physical Design Intake boundary */}
          <Section title="Physical-Design Intake Boundary" icon={Lock}>
            <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3 text-[11px]">
              <div className="font-semibold text-emerald-800">This package supports</div>
              <ul className="mt-1 list-disc pl-4 text-emerald-900">
                <li>Controlled front-end design handoff</li>
                <li>RTL and verification evidence review</li>
                <li>Physical-design intake planning</li>
                <li>Downstream constraint and ownership transfer</li>
              </ul>
            </div>
            <div className="mt-2 rounded-md border border-rose-200 bg-rose-50/60 p-3 text-[11px]">
              <div className="font-semibold text-rose-800">This package does not authorize</div>
              <ul className="mt-1 list-disc pl-4 text-rose-900">
                <li>Floorplanning / placement / CTS / routing closure</li>
                <li>Physical timing signoff · power integrity · DRC / LVS</li>
                <li>GDS generation · tapeout · fabrication · packaging</li>
                <li>Silicon validation</li>
              </ul>
            </div>
            <div className="mt-3 rounded-md border border-neutral-300 bg-neutral-50 p-2 text-[11px] font-medium text-neutral-800">
              Decision language: “Is the validated and reproducible front-end design package sufficiently complete to enter physical-design intake?”
            </div>
          </Section>

          {/* Approvals */}
          <Section title="Human Review & Approval" icon={User}>
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
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
              “You are approving this reproducible front-end package for physical-design intake. This action does not authorize tapeout, fabrication, packaging, or physical silicon release.”
            </div>
          </Section>
        </div>
      </div>

      {/* Persistent decision bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${recColor[meta.recommendation]}`}>{meta.recommendation}</span>
            <span className="text-neutral-500">State <b className="text-neutral-900">{meta.packageState}</b></span>
            <span className="text-neutral-500">Complete <b className="text-neutral-900">{meta.complete}/42</b></span>
            <span className="text-neutral-500">Conditional <b className="text-neutral-900">{meta.conditional}</b></span>
            <span className="text-neutral-500">Missing <b className="text-neutral-900">{meta.missing}</b></span>
            <span className="text-neutral-500">Conflicts <b className="text-neutral-900">{meta.conflicts}</b></span>
            <span className="text-neutral-500">Drift <b className="text-neutral-900">{meta.drift}</b></span>
            <span className="text-neutral-500">Evidence <b className="text-neutral-900">{meta.evidencePct}%</b></span>
            <span className="text-neutral-500">Approvals <b className="text-neutral-900">4/7</b></span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {["Review Missing", "Review Drift", "Regenerate Drafts", "Validate Manifest", "Review Conditions"].map((a) => (
              <button key={a} className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 hover:bg-neutral-50">{a}</button>
            ))}
            <button className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 text-neutral-400" disabled title="Blocked: missing artifacts, drift, and manifest conflict">Approve Package</button>
            <button className="rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-rose-700 hover:bg-rose-50">Return for Remediation</button>
            <button className="inline-flex items-center gap-1 rounded-md border border-neutral-900 bg-neutral-900 px-2.5 py-1.5 text-white hover:bg-neutral-800"><Download className="h-3 w-3" /> Export Candidate Package</button>
          </div>
        </div>
      </div>

      {/* Artifact drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex" role="dialog">
          <div className="flex-1 bg-neutral-900/30" onClick={() => setSelected(null)} />
          <div className="w-full max-w-2xl overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
              <div>
                <div className="font-mono text-[11px] text-neutral-500">{selected.id} · {selected.category}</div>
                <h3 className="text-lg font-semibold text-neutral-900">{selected.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Pill className={stateColor[selected.state]}>{selected.state}</Pill>
                  <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">Owner {selected.owner}</Pill>
                  <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">Reviewer {selected.reviewer}</Pill>
                  <Pill className="border-neutral-200 bg-neutral-50 text-neutral-600">v{selected.version}</Pill>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-3 pt-2 text-[11px]">
              {(["summary", "sources", "document", "drift", "evidence", "history", "approvals", "inclusion", "audit"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-t-md px-2.5 py-1.5 capitalize ${tab === t ? "border border-b-white bg-white font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-800"}`}>{t}</button>
              ))}
            </div>
            <div className="px-5 py-4 text-[12px] text-neutral-800">
              {tab === "summary" && (
                <div className="grid grid-cols-2 gap-3">
                  <Kv k="Purpose" v={`Artifact of category ${selected.category}`} />
                  <Kv k="Required state" v="Approved and synchronized" />
                  <Kv k="Current state" v={selected.state} />
                  <Kv k="Baseline (expected)" v={<span className="font-mono">{selected.expectedBaseline}</span>} />
                  <Kv k="Baseline (actual)" v={<span className={`font-mono ${selected.actualBaseline !== selected.expectedBaseline ? "text-rose-700" : ""}`}>{selected.actualBaseline}</span>} />
                  <Kv k="Evidence coverage" v={`${selected.evidencePct}%`} />
                  <Kv k="Provenance coverage" v={`${selected.provenance}%`} />
                  <Kv k="Package path" v={<span className="font-mono">{selected.path}</span>} />
                  <Kv k="Open condition" v={selected.conditional || "—"} />
                  <Kv k="Approval" v={selected.approval} />
                </div>
              )}
              {tab === "sources" && (
                <ul className="list-disc pl-4 text-[11px] text-neutral-700">
                  <li>Approved requirements — REQ-DDMAC-142…170</li>
                  <li>Architecture — ARCH DDMAC 3.2 §4.7</li>
                  <li>Register model — reg_model_3.2.18</li>
                  <li>Interface contracts — IF-DDMAC-CTRL / IF-DDMAC-DATA</li>
                  <li>RTL metadata — {selected.expectedBaseline}</li>
                  <li>Verification results — REG-2026-07-21-0051 · formal_run_2026.07.21.09</li>
                  <li>Waivers — WVR FORMAL 006, WVR COV 014</li>
                  <li>Signoff decisions — pending</li>
                </ul>
              )}
              {tab === "document" && (
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-mono">{selected.id} · v{selected.version}</span>
                    <span>Generated {selected.lastGenerated}</span>
                  </div>
                  <div className="rounded-md border border-neutral-200 bg-white p-3 text-[12px]">
                    <div className="text-sm font-semibold">{selected.name}</div>
                    <ol className="mt-2 list-decimal pl-4 text-neutral-700">
                      <li>Overview and scope</li>
                      <li>Baselines and references</li>
                      <li>Detailed content (auto-generated)</li>
                      <li>Cross-references to controlled sources</li>
                      <li>Conditional-item markers</li>
                      <li>Change history</li>
                    </ol>
                    <p className="mt-3 text-[11px] italic text-neutral-500">Preview is a placeholder. Regeneration creates a new draft revision and never overwrites an approved artifact.</p>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px]">Compare</button>
                    <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px]">Comment</button>
                    <button className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px]">Simulate export</button>
                  </div>
                </div>
              )}
              {tab === "drift" && (
                <ul className="space-y-2">
                  {DRIFTS.filter((d) => d.artifactId === selected.id).map((d) => (
                    <li key={d.id} className="rounded-md border border-neutral-200 p-2 text-[11px]">
                      <div className="flex items-center justify-between"><span className="font-mono">{d.id}</span><Pill className={d.severity === "High" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{d.severity}</Pill></div>
                      <div className="mt-1">{d.finding}</div>
                      <div className="mt-1 text-neutral-500">Action — <span className="text-neutral-800">{d.action}</span></div>
                    </li>
                  ))}
                  {DRIFTS.filter((d) => d.artifactId === selected.id).length === 0 && <li className="text-neutral-500">No drift findings recorded.</li>}
                </ul>
              )}
              {tab === "evidence" && (
                <ul className="list-disc pl-4 text-[11px] text-neutral-700">
                  <li>REG-2026-07-21-0051 · regression manifest</li>
                  <li>formal_run_2026.07.21.09 · property proofs</li>
                  <li>static_run_2026.07.21.04 · lint/CDC/RDC</li>
                  <li>COV-DDMAC-3.2-017 · coverage snapshot</li>
                  <li>REPRO-2026.07.21 · reproducibility manifest</li>
                </ul>
              )}
              {tab === "history" && (
                <ul className="space-y-1 font-mono text-[11px] text-neutral-600">
                  <li>2026-07-21 14:02 · validated · {selected.lastValidated}</li>
                  <li>2026-07-21 08:12 · generated · avep.doc-sync 2.3.1</li>
                  <li>2026-07-20 09:11 · draft prepared · owner {selected.owner}</li>
                </ul>
              )}
              {tab === "approvals" && (
                <div>
                  <Kv k="Reviewer" v={selected.reviewer} />
                  <Kv k="Approval state" v={selected.approval} />
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-md border border-neutral-200 px-2 py-1 text-[11px]">Approve revision</button>
                    <button className="rounded-md border border-neutral-200 px-2 py-1 text-[11px]">Reject</button>
                    <button className="rounded-md border border-neutral-200 px-2 py-1 text-[11px]">Request correction</button>
                  </div>
                  <p className="mt-2 text-[11px] italic text-neutral-500">Approval attaches to the revision, not to the generation event.</p>
                </div>
              )}
              {tab === "inclusion" && (
                <div>
                  <Kv k="Included in package" v={selected.included ? "Yes" : "No"} />
                  <Kv k="Package path" v={<span className="font-mono">{selected.path}</span>} />
                  <Kv k="Hash" v={<span className="font-mono">{selected.hash}</span>} />
                </div>
              )}
              {tab === "audit" && (
                <ul className="space-y-1 font-mono text-[11px] text-neutral-600">
                  <li>2026-07-21 · state → {selected.state}</li>
                  <li>2026-07-20 · owner assigned · {selected.owner}</li>
                  <li>2026-07-19 · category placement · {selected.category}</li>
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
            <div className="text-xs font-semibold text-neutral-900">Validated Package walkthrough</div>
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

/* ---------- graph ---------- */
function PackageGraph() {
  const nodes = [
    { id: "REQ", x: 20, y: 40, label: "REQ-DDMAC-142" },
    { id: "ARCH", x: 180, y: 20, label: "Descriptor arch" },
    { id: "REG", x: 180, y: 90, label: "reg_model 3.2.18" },
    { id: "RTL", x: 340, y: 55, label: "RTL 3.2.18" },
    { id: "REG_R", x: 500, y: 20, label: "Regression 0051" },
    { id: "FORMAL", x: 500, y: 90, label: "Formal .09" },
    { id: "DV", x: 660, y: 20, label: "DV report §7" },
    { id: "TRM", x: 660, y: 90, label: "TRM §4.7" },
    { id: "MAN", x: 820, y: 55, label: "Package manifest" },
    { id: "APR", x: 960, y: 55, label: "Release approval" },
  ];
  const edges: [string, string, boolean?][] = [
    ["REQ", "ARCH"], ["REQ", "REG"], ["ARCH", "RTL"], ["REG", "RTL"],
    ["RTL", "REG_R"], ["RTL", "FORMAL"], ["REG_R", "DV"], ["FORMAL", "DV"],
    ["DV", "TRM", true], ["TRM", "MAN", true], ["FORMAL", "MAN", true], ["DV", "MAN"], ["MAN", "APR"],
  ];
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 1080 130" className="min-w-[820px]">
        {edges.map(([a, b, block], i) => {
          const A = map[a], B = map[b];
          return <line key={i} x1={A.x + 100} y1={A.y + 12} x2={B.x} y2={B.y + 12} stroke={block ? "#e11d48" : "#cbd5e1"} strokeWidth={block ? 2 : 1} strokeDasharray={block ? "0" : "3 3"} />;
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
