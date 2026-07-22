import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Play, X, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle,
  ShieldCheck, Sparkles, GitBranch, Layers, Cpu, Code2, FlaskConical, Activity,
  ClipboardList, BadgeCheck, Package, Gavel, FileText, Users, Server, Target,
  Info, RotateCcw, BookOpen, MapIcon,
} from "lucide-react";
import avatarVideo from "@/assets/avatar-video.mp4.asset.json";

/* ------------------------------------------------------------------ */
/* AVEP.P0.OVERVIEW.001 — AI VLSI Engineering Platform Overview        */
/* Route: /avep/overview                                               */
/* ------------------------------------------------------------------ */

type Audience = "Executive" | "Engineering Leadership" | "Deep Engineering";
const AUDIENCE_META: Record<Audience, { duration: string; ctaLabel: string; focus: string[]; default?: boolean }> = {
  Executive: {
    duration: "5–7 min",
    ctaLabel: "Begin Executive Introduction",
    focus: ["Engineering risk", "Decision speed", "Rework", "Compute efficiency", "Governance", "Business value"],
  },
  "Engineering Leadership": {
    duration: "10–15 min",
    ctaLabel: "Begin Engineering Leadership Walkthrough",
    focus: ["Traceability", "Cross-discipline workflows", "Failure triage", "Readiness evidence", "Human authority", "Handoff governance"],
    default: true,
  },
  "Deep Engineering": {
    duration: "20–30 min",
    ctaLabel: "Begin Deep Engineering Demonstration",
    focus: ["RTL", "UVM", "Assertions", "Properties", "Waveforms", "Formal results", "Coverage", "Defects", "Baselines"],
  },
};

const DOMAINS = [
  { id: "req",  label: "Requirements",        icon: ClipboardList, purpose: "Capture and govern engineering intent.",           friction: "Requirements evolve in isolation from implementation.",   ai: "Normalize records, score quality, propose traceability.",       human: "IP Architect approves intent." },
  { id: "arch", label: "Architecture",        icon: Layers,        purpose: "Define logical behavior and interface contracts.", friction: "Documents drift from RTL and register models.",           ai: "Detect contract drift; summarize architecture.",                human: "IP Architect owns the contract." },
  { id: "rtl",  label: "RTL Design",          icon: Code2,         purpose: "Encode requirements into synthesizable logic.",    friction: "Change impact is hard to predict across artifacts.",      ai: "Propose bounded RTL; compute blast radius.",                    human: "RTL Design Lead accepts or rejects." },
  { id: "ver",  label: "Verification",        icon: FlaskConical,  purpose: "Prove the design meets the specification.",        friction: "Environment build compresses schedule; trust varies.",    ai: "Accelerate env construction; cross-check reference model.",     human: "Verification Lead approves checker trust." },
  { id: "sim",  label: "Simulation & Formal", icon: Activity,      purpose: "Exercise the design under realistic and bounded conditions.", friction: "Noise obscures material failures.",           ai: "Cluster failures; correlate waveforms, logs, and CEs.",         human: "Verification & Formal leads confirm root cause." },
  { id: "cov",  label: "Coverage & Defects",  icon: Target,        purpose: "Close gaps and manage defect disposition.",        friction: "Coverage % alone does not prove readiness.",              ai: "Classify gaps; propose validation.",                            human: "Verification Lead approves closure." },
  { id: "sign", label: "Signoff Evidence",    icon: BadgeCheck,    purpose: "Reconcile evidence into a defensible decision.",   friction: "Evidence lives in many systems.",                         ai: "Reconcile gates; assemble evidence.",                           human: "Release Authority approves." },
  { id: "gov",  label: "Governance & Learning", icon: Gavel,       purpose: "Preserve AI lineage and reusable engineering learning.", friction: "Lessons remain trapped in defects and scripts.",   ai: "Extract reusable patterns; version prompts and models.",         human: "Methodology Lead approves lessons." },
  { id: "pd",   label: "Physical-Design Intake", icon: Package,    purpose: "Authorize controlled handoff to physical design.", friction: "Front-end readiness ≠ tapeout readiness.",                ai: "Present recommendation, conditions, and evidence.",             human: "Physical-Design Lead accepts handoff." },
];

const EXISTING_SYSTEMS = [
  "Requirements platform", "Architecture docs", "Git & CI", "EDA tools",
  "Simulation farms", "Formal engines", "Static analysis", "Coverage systems",
  "Defect management", "Documentation repos", "Release systems",
];

interface FrictionCard { id: string; title: string; body: string; example: string; }
const FRICTIONS: FrictionCard[] = [
  { id: "ctx",   title: "Context Drift",             body: "Teams may act on incompatible program, IP, branch, or baseline information.",      example: "A designer reviews a scoreboard for rtl_baseline_3.2.15 while regression already runs on 3.2.18." },
  { id: "trace", title: "Traceability Gaps",         body: "Requirements, RTL, assertions, tests, coverage, defects, and docs may not remain connected.", example: "REQ-DDMAC-142 links to a spec section, but no assertion or coverage bin references it." },
  { id: "noise", title: "Verification Noise",        body: "Raw failures, infra issues, checker defects, and DUT defects blur together.",       example: "398 raw failures from an LSF partition split into 37 clusters; only 4 are engineering-material." },
  { id: "rca",   title: "Slow Root-Cause Analysis",  body: "Waveforms, logs, commits, properties, and prior defects must be manually correlated.", example: "A scoreboard mismatch at t=1284ns is the visible symptom; the divergence occurred 3 cycles earlier." },
  { id: "read",  title: "Readiness Ambiguity",       body: "Volume of reports does not automatically create a defensible advancement decision.", example: "A 240-page DV report cannot answer whether 3 conditional gates should block intake." },
  { id: "learn", title: "Lost Engineering Learning", body: "Resolved defects rarely become reusable prevention patterns.",                       example: "DEF-DV-181, an inclusive boundary defect in Queue Manager, was not carried forward to DDMAC." },
];

const LAYERS = [
  { id: "L1", name: "Controlled Engineering Context",   items: ["Program", "SoC", "IP block", "Revision", "Branch", "Baseline", "Milestone", "Owner", "Methodology", "Scenario"], purpose: "Ensure all artifacts and decisions belong to the correct engineering context." },
  { id: "L2", name: "Canonical Engineering Objects",    items: ["Requirement", "Specification", "Architecture", "Interface", "Register", "Field", "Signal", "RTL module", "Assertion", "Test", "Coverage", "Defect", "Waiver", "Evidence", "Approval"], purpose: "Convert fragmented records into connected engineering objects." },
  { id: "L3", name: "AI Engineering Skills",            items: ["Requirement quality", "Traceability", "Spec drafting", "RTL proposal", "Change impact", "Verification construction", "Failure clustering", "Waveform correlation", "Hypothesis ranking", "Coverage gap classification", "Evidence assembly", "Lesson extraction"], purpose: "Accelerate bounded engineering analysis and authoring." },
  { id: "L4", name: "Evidence and Governance",          items: ["Provenance", "Model/prompt version", "Methodology", "Inputs/outputs", "Confidence", "Evaluation", "Approval boundary", "Human disposition", "Audit history"], purpose: "Make AI-assisted engineering reproducible and reviewable." },
  { id: "L5", name: "Engineering Decisions",            items: ["Requirement approval", "RTL acceptance", "Verification readiness", "Defect disposition", "Waiver approval", "Signoff readiness", "Package approval", "Physical-design intake decision"], purpose: "Turn engineering evidence into accountable decisions." },
];

interface LifecycleStep { n: number; phase: string; title: string; activity: string; friction: string; ai: string; human: string; page?: { label: string; path: string }; }
const LIFECYCLE: LifecycleStep[] = [
  { n: 1, phase: "Phase 1", title: "Establish controlled context",      activity: "Lock program, IP, revision, branch, baseline.",  friction: "Ambiguous context corrupts every downstream artifact.",    ai: "Normalize context records.",                     human: "Program Lead approves.",       page: { label: "Engineering Context Workspace", path: "/avep/context/engineering-context" } },
  { n: 2, phase: "Phase 1", title: "Receive requirements",              activity: "Ingest requirements from source systems.",       friction: "Requirements arrive in inconsistent formats.",              ai: "Extract, normalize, classify.",                  human: "IP Architect reviews.",        page: { label: "Requirements Intake", path: "/avep/requirements" } },
  { n: 3, phase: "Phase 1", title: "Improve requirement quality",       activity: "Rate ambiguity, testability, atomicity.",        friction: "Ambiguous requirements produce ambiguous designs.",         ai: "Score and propose rewrites.",                    human: "IP Architect approves.",       page: { label: "Requirements Review", path: "/avep/requirements-review" } },
  { n: 4, phase: "Phase 1", title: "Analyze dependencies & traceability", activity: "Build the requirement-to-artifact graph.",     friction: "Orphaned requirements escape verification.",                ai: "Propose links; detect orphans.",                 human: "Verification Lead confirms.",  page: { label: "Traceability Workspace", path: "/avep/specification" } },
  { n: 5, phase: "Phase 1", title: "Generate specs & verification intent", activity: "Draft spec sections and verification objectives.", friction: "Specs drift from architecture and registers.",         ai: "Draft with citations.",                          human: "IP Architect approves.",       page: { label: "Engineering Spec & Verification", path: "/avep/rtl" } },
  { n: 6, phase: "Phase 1", title: "Define logical architecture",       activity: "Establish FSMs, interfaces, registers, CDC.",   friction: "Architecture drift breaks verification contracts.",         ai: "Cross-check register/spec.",                     human: "IP Architect owns contract.",  page: { label: "Logical Architecture", path: "/avep/architecture" } },

  { n: 7, phase: "Phase 2", title: "Implement RTL",                      activity: "Propose or hand-author RTL delta.",             friction: "Proposals lack traceable citations.",                       ai: "Propose bounded RTL with citations.",            human: "RTL Design Lead accepts.",     page: { label: "RTL Generation Studio", path: "/avep/design/rtl-generation" } },
  { n: 8, phase: "Phase 2", title: "Analyze RTL change impact",          activity: "Compute blast radius across artifacts.",        friction: "Small changes hide large downstream effects.",              ai: "Blast-radius graph.",                            human: "Leads approve scope.",         page: { label: "RTL Change Impact", path: "/avep/design/change-impact" } },
  { n: 9, phase: "Phase 2", title: "Static & synthesis readiness",       activity: "Run static and synthesis-readiness checks.",    friction: "Findings pile up without triage.",                          ai: "Classify severity and reachability.",            human: "RTL Lead dispositions.",       page: { label: "Static Analysis", path: "/avep/static-analysis" } },
  { n: 10, phase: "Phase 2", title: "Construct verification environment", activity: "Build UVM env, drivers, scoreboards.",         friction: "Compressed schedule risks checker trust.",                  ai: "Generate env; cross-check ref model.",           human: "Verification Lead approves.",  page: { label: "Verification Env Builder", path: "/avep/verification/environment-builder" } },
  { n: 11, phase: "Phase 2", title: "Generate tests, assertions, properties, coverage", activity: "Author stimulus and checkers.", friction: "Coverage often lags stimulus.",                             ai: "Propose bounded checkers and covergroups.",      human: "Verification Lead approves.",  page: { label: "Test Factory", path: "/avep/verification/test-factory" } },
  { n: 12, phase: "Phase 2", title: "Execute simulation & regression",   activity: "Run and monitor regression health.",            friction: "Noise obscures material failures.",                         ai: "Cluster failures; filter infra noise.",          human: "Verification Lead prioritizes.", page: { label: "Simulation Operations", path: "/avep/verification/simulation-operations" } },
  { n: 13, phase: "Phase 2", title: "Diagnose failures & propose corrections", activity: "Correlate evidence; rank hypotheses.",   friction: "Manual correlation is slow and error-prone.",               ai: "First-divergence + ranked hypotheses.",          human: "RTL & DV leads confirm cause.", page: { label: "Failure Diagnosis", path: "/avep/verification/failure-diagnosis" } },

  { n: 14, phase: "Phase 3", title: "Close coverage & verification gaps", activity: "Classify gaps; plan closure.",                 friction: "Coverage % alone misleads readiness.",                      ai: "Gap classification and options.",                human: "Verification Lead approves.",  page: { label: "Coverage Closure", path: "/avep/readiness/coverage-closure" } },
  { n: 15, phase: "Phase 3", title: "Reconcile signoff evidence",        activity: "Evaluate readiness gates.",                     friction: "Evidence lives in many systems.",                           ai: "Reconcile gates and blockers.",                  human: "Release Authority approves.",  page: { label: "Signoff Readiness", path: "/avep/readiness/signoff" } },
  { n: 16, phase: "Phase 3", title: "Assemble validated design package", activity: "Compose reproducible package.",                 friction: "Documentation drift breaks reproducibility.",                ai: "Assemble manifest with provenance.",             human: "Release Authority approves.",  page: { label: "Release Package", path: "/avep/readiness/release-package" } },
  { n: 17, phase: "Phase 3", title: "Govern AI & preserve learning",     activity: "Version prompts/models; capture lessons.",       friction: "Lessons remain trapped in defects.",                        ai: "Extract reusable patterns.",                     human: "Methodology Lead approves.",   page: { label: "AI Governance & Value", path: "/avep/governance/ai-value" } },
  { n: 18, phase: "Phase 3", title: "Decide physical-design intake",     activity: "Advancement decision with conditions.",         friction: "Front-end readiness ≠ tapeout readiness.",                  ai: "Recommendation with evidence.",                  human: "PD Lead accepts handoff.",     page: { label: "Physical-Design Intake", path: "/avep/readiness/physical-design-intake" } },
];

const TRACE = [
  { id: "t1",  label: "REQ-DDMAC-142",                artifact: "Requirement",         owner: "IP Architect",      state: "Approved" },
  { id: "t2",  label: "SPEC §4.3.2",                   artifact: "Specification",       owner: "IP Architect",      state: "Approved" },
  { id: "t3",  label: "Descriptor Validator",          artifact: "Architecture",        owner: "IP Architect",      state: "Approved" },
  { id: "t4",  label: "MAX_XFER_LEN",                  artifact: "Register",            owner: "IP Architect",      state: "Approved" },
  { id: "t5",  label: "ddmac_descriptor_validator",    artifact: "RTL Module",          owner: "RTL Design Lead",   state: "Corrected" },
  { id: "t6",  label: "p_length_boundary",             artifact: "Assertion",           owner: "Formal Lead",       state: "Verified" },
  { id: "t7",  label: "test_desc_len_boundary_*",      artifact: "Directed Test",       owner: "Verification Lead", state: "Verified" },
  { id: "t8",  label: "cg_len_boundary",               artifact: "Coverage Bin",        owner: "Verification Lead", state: "Verified" },
  { id: "t9",  label: "FC-031",                         artifact: "Regression Cluster",  owner: "Verification Lead", state: "Resolved" },
  { id: "t10", label: "DEF-DV-219",                     artifact: "Defect",              owner: "Verification Lead", state: "Corrected" },
  { id: "t11", label: "RTL Correction Δ42",             artifact: "Bounded Change",      owner: "RTL Design Lead",   state: "Validated" },
  { id: "t12", label: "Validation Bundle",              artifact: "Validation Evidence", owner: "Verification Lead", state: "Validated" },
  { id: "t13", label: "DV Report",                       artifact: "Report",              owner: "Verification Lead", state: "Approved" },
  { id: "t14", label: "DDMAC_FE_PACKAGE_3.2_RC2",       artifact: "Package Manifest",    owner: "Release Authority", state: "Conditional" },
  { id: "t15", label: "Physical-Design Intake Decision", artifact: "Advancement Decision", owner: "PD Intake Lead",   state: "Pending Approval" },
];

const AI_CAN = [
  "Extract and normalize engineering records", "Identify ambiguity and inconsistency",
  "Build traceability", "Generate bounded proposals",
  "Correlate engineering evidence", "Rank hypotheses",
  "Recommend validation", "Assemble readiness evidence",
  "Preserve reusable learning",
];
const AI_CANNOT = [
  "Approve requirements", "Accept architecture", "Commit production RTL",
  "Approve tests or properties", "Confirm root cause autonomously", "Approve waivers",
  "Close defects", "Accept residual risk", "Authorize signoff",
  "Release a package", "Authorize tapeout",
];
const HUMAN_AUTH = [
  "Program & Release Management", "IP Architect", "RTL Design Lead",
  "Verification Lead", "Formal Lead", "Static-Analysis Lead",
  "Signoff Authority", "Release Authority", "Physical-Design Intake Lead",
];

const PROOF = [
  { n: 1, title: "Controlled Context",       body: "Every requirement, artifact, run, defect, recommendation, and decision remains tied to the correct program, IP, revision, branch, and baseline.", link: { label: "Engineering Context", path: "/avep/context/engineering-context" } },
  { n: 2, title: "End-to-End Traceability",  body: "The platform connects engineering intent to RTL, verification, evidence, defects, documentation, and advancement decisions.",                    link: { label: "Traceability Workspace", path: "/avep/specification" } },
  { n: 3, title: "Evidence-Based AI",        body: "AI recommendations expose their inputs, assumptions, confidence, alternatives, evidence, and approval boundaries.",                              link: { label: "AI Governance & Value", path: "/avep/governance/ai-value" } },
  { n: 4, title: "Human Engineering Authority", body: "Material engineering decisions remain assigned to accountable human roles.",                                                                   link: { label: "Signoff Readiness", path: "/avep/readiness/signoff" } },
  { n: 5, title: "Measurable Engineering Value", body: "The platform measures requirement quality, authoring effort, debug time, coverage convergence, compute avoidance, rework, and evidence completeness.", link: { label: "End-to-End Story", path: "/avep/demo/end-to-end-story" } },
];

const METRICS: [string, string, "Measured" | "Estimated"][] = [
  ["Requirement traceability",   "98.9%",           "Measured"],
  ["Debug-time improvement",      "38%",             "Measured"],
  ["Coverage convergence",        "24% faster",      "Measured"],
  ["Compute avoided",             "8,700 core-hrs",  "Measured"],
  ["Evidence completeness",       "97%",             "Measured"],
  ["Downstream escapes avoided",  "11",              "Estimated"],
];

const SCOPE_IN = [
  "Program & engineering context", "Requirements intake & quality", "Architecture & specification",
  "RTL proposal & review", "Static & synthesis readiness", "Verification construction",
  "Tests, assertions, properties, coverage", "Simulation & regression", "Failure diagnosis",
  "Coverage closure", "Signoff-readiness evidence", "Documentation & package validation",
  "AI governance & engineering learning", "Physical-design intake decision",
];
const SCOPE_OUT = [
  "Floorplanning", "Placement", "Clock-tree synthesis", "Routing",
  "Physical timing closure", "Power-integrity closure", "Signal-integrity closure",
  "DRC", "LVS", "GDS generation", "Tapeout", "Fabrication", "Packaging", "Silicon validation",
];

const GLOSSARY: [string, string][] = [
  ["Canonical engineering context", "The controlled program/IP/revision/branch/baseline set every artifact belongs to."],
  ["Engineering baseline", "A named, frozen version of RTL, DV, or documentation used as the reference for a decision."],
  ["Requirement traceability", "The connected graph from a requirement to every downstream artifact that implements or proves it."],
  ["RTL", "Register-Transfer-Level hardware description used to synthesize digital logic."],
  ["UVM", "The Universal Verification Methodology used to build reusable verification environments."],
  ["Assertion", "An executable statement of expected behavior checked during simulation or formal proof."],
  ["Formal property", "A mathematically checked statement of design behavior, independent of stimulus."],
  ["Regression", "A batched run of many tests used to detect functional drift."],
  ["Coverage closure", "The engineering activity of driving coverage gaps to a justified terminal state."],
  ["Root cause", "The first meaningful engineering divergence from expected behavior."],
  ["Engineering evidence", "The reconciled artifacts (tests, formal, static, coverage, defects) that support a decision."],
  ["Waiver", "An approved deviation from a rule or expectation, recorded with justification."],
  ["Residual risk", "A known, accepted risk carried into a later stage with owner and mitigation."],
  ["Signoff readiness", "The reconciled state showing whether front-end evidence supports advancement."],
  ["Reproducibility", "The ability to regenerate an outcome from its recorded inputs and versions."],
  ["Physical-design intake", "The controlled handoff from front-end engineering into physical design."],
  ["AI skill", "A governed, versioned AI capability with defined inputs, outputs, and approval boundary."],
  ["Approval boundary", "The line beyond which a human authority — not AI — must decide."],
];

const STATE_STYLE: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Corrected: "bg-violet-50 text-violet-700 border-violet-200",
  Verified: "bg-blue-50 text-blue-700 border-blue-200",
  Validated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Conditional: "bg-amber-50 text-amber-700 border-amber-200",
  "Pending Approval": "bg-neutral-100 text-neutral-700 border-neutral-300",
};

const STORAGE_KEY = "avep-overview-audience";

/* ---------- Guided introduction ---------- */
const GUIDE = [
  { title: "The Problem",         copy: "Semiconductor teams already use sophisticated engineering tools. The challenge is preserving context, traceability, evidence, and decision continuity across them." },
  { title: "The AVEP Layer",      copy: "AVEP sits alongside your EDA, source control, and defect tools. It records what each artifact depends on, whose approval it needs, and where the evidence lives — so a decision at RTL freeze can be traced back to the requirement it satisfies." },
  { title: "The Lifecycle",       copy: "The demonstration follows the lifecycle from controlled requirements through RTL, verification, readiness, and physical-design intake." },
  { title: "Evidence-Based AI",   copy: "Every AI-assisted output retains its inputs, version, methodology, evidence, confidence, limitations, and approval boundary." },
  { title: "Human Authority",     copy: "AVEP recommends and explains. Qualified engineers approve, reject, modify, or hold." },
  { title: "Start the Demo",      copy: "The journey begins by establishing the controlled program and engineering context that every downstream artifact inherits." },
];

export default function Overview() {
  const navigate = useNavigate();
  const [audience, setAudience] = useState<Audience>(() => {
    if (typeof window === "undefined") return "Engineering Leadership";
    return (sessionStorage.getItem(STORAGE_KEY) as Audience) || "Engineering Leadership";
  });
  useEffect(() => { sessionStorage.setItem(STORAGE_KEY, audience); }, [audience]);

  const [hoverDomain, setHoverDomain] = useState<string | null>(null);
  const [hoverFriction, setHoverFriction] = useState<string | null>(null);
  const [openLayer, setOpenLayer] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<LifecycleStep | null>(null);
  const [openTrace, setOpenTrace] = useState<typeof TRACE[number] | null>(null);
  const [guideStep, setGuideStep] = useState<number | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const audienceMeta = AUDIENCE_META[audience];
  const phaseSteps = useMemo(() => {
    const grouped: Record<string, LifecycleStep[]> = {};
    LIFECYCLE.forEach((s) => { (grouped[s.phase] ||= []).push(s); });
    return grouped;
  }, []);

  const beginJourney = () => navigate("/avep/context/engineering-context");
  const resetDemo = () => { setAudience("Engineering Leadership"); setGuideStep(null); };

  const activeDomain = hoverDomain ? DOMAINS.find((d) => d.id === hoverDomain) : null;
  const activeFriction = hoverFriction ? FRICTIONS.find((f) => f.id === hoverFriction) : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-24">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.08), transparent 60%), radial-gradient(ellipse at 90% 10%, rgba(16,185,129,0.06), transparent 55%)",
          }}
        />
        <div className="relative max-w-[1600px] mx-auto px-6 pt-8 pb-10 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-10">


            <h1 className="mt-3 text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight">
              Connect Engineering Intent to <span className="text-blue-700">Evidence-Backed Advancement</span>
            </h1>
            <p className="mt-4 text-[15px] text-neutral-700 max-w-2xl">
              AVEP connects requirements, architecture, RTL, verification, simulation, coverage, defects, approvals, and release evidence
              into one governed engineering model.
            </p>
            <p className="mt-2 text-sm text-neutral-600 max-w-2xl">
              It helps teams improve engineering quality and decision speed while preserving the authority of architects, designers,
              verification engineers, methodology leaders, release authorities, and downstream intake teams.
            </p>

            <div className="mt-5 rounded-md border border-neutral-200 bg-white/70 backdrop-blur px-4 py-3 max-w-2xl">
              <div className="text-[11px] font-semibold text-neutral-700 mb-1">Central Positioning</div>
              <p className="text-sm text-neutral-800">
                AVEP is an <span className="font-medium">AI-enabled engineering operating model</span> that connects requirements,
                architecture, RTL, verification, engineering evidence, governance, and advancement decisions across the semiconductor
                front-end lifecycle.
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                AVEP does not replace requirements systems, source control, EDA tools, simulators, formal-verification platforms, static-analysis tools,
                coverage systems, defect platforms, or engineering authorities. It connects their evidence into a controlled,
                traceable, and decision-ready engineering model.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={beginJourney}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-900 text-white text-sm hover:bg-neutral-800">
                Begin the Engineering Journey <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => setGuideStep(0)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-50">
                <Play className="h-4 w-4" /> Start Guided Introduction
              </button>
              <a href="#lifecycle" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-50">
                View Platform Lifecycle
              </a>
              <a href="#audience" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-50">
                Select Demo Audience
              </a>
              <a href="#principles" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-50">
                Explore AVEP Principles
              </a>
            </div>

            {/* Demo context card */}
            <div className="mt-5 grid grid-cols-2 gap-2 max-w-xl">
              {[
                ["Program", "StrataShield Secure Processing SoC"],
                ["IP", "DDMAC Packet Movement Engine"],
                ["Revision", "DDMAC 3.2"],
                ["Demo scope", "Requirements → PD Intake"],
                ["Active scenario", "AI-Assisted Engineering Decision"],
                ["Current outcome", "Conditionally Ready"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-neutral-200 bg-white px-3 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500">{k}</div>
                  <div className="text-xs font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrated intro video */}
          <div className="col-span-12 lg:col-span-2">
            <div className="w-full rounded-xl border border-neutral-200 bg-neutral-950 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800 bg-neutral-900">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  AVEP · Intro
                </div>
                <div className="text-[10px] font-mono text-blue-300">Avatar</div>
              </div>
              <video
                src={avatarVideo.url}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                className="w-full aspect-[9/16] object-cover bg-black"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Hero visual — AVEP layer over existing systems */}
          <div className="col-span-12 space-y-4">



            <div className="rounded-xl border border-neutral-200 bg-white/70 backdrop-blur p-4 relative">

              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 text-center">
                Context · Traceability · Evidence · Approval
              </div>

              {/* AVEP core */}
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <div className="text-sm font-semibold text-blue-900 text-center">
                  AVEP — evidence layer for DDMAC 3.2
                </div>
              </div>

              {/* Domains ring */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {DOMAINS.map((d) => {
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onMouseEnter={() => setHoverDomain(d.id)}
                      onMouseLeave={() => setHoverDomain(null)}
                      onFocus={() => setHoverDomain(d.id)}
                      onBlur={() => setHoverDomain(null)}
                      className={`text-left rounded-md border px-2.5 py-2 transition ${
                        hoverDomain === d.id
                          ? "border-blue-400 bg-blue-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-blue-700" />
                        <div className="text-[11px] font-medium">{d.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Connector */}
              <div className="my-3 flex items-center gap-2 text-[10px] text-neutral-400">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                connects evidence across
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
              </div>

              {/* Existing systems */}
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1">
                  <Server className="h-3 w-3" /> Existing Engineering Systems & Tools
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXISTING_SYSTEMS.map((s) => (
                    <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-neutral-200 bg-white text-neutral-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover details */}
              {activeDomain && (
                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs space-y-1">
                  <div className="font-semibold text-blue-900">{activeDomain.label}</div>
                  <div><span className="text-neutral-500">Purpose — </span>{activeDomain.purpose}</div>
                  <div><span className="text-neutral-500">Fragmentation — </span>{activeDomain.friction}</div>
                  <div><span className="text-neutral-500">AVEP — </span>{activeDomain.ai}</div>
                  <div><span className="text-neutral-500">Human — </span>{activeDomain.human}</div>
                </div>
              )}

              <div className="mt-2 text-[10px] text-neutral-500 text-center italic">
                From fragmented engineering activity to connected engineering decisions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 — Engineering Challenge */}
      <section className="max-w-[1600px] mx-auto px-6 py-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <SectionEyebrow>Section 1 · The Engineering Challenge</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold">Modern Engineering Is Sophisticated, but the Evidence Is Fragmented</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            <li>• Requirements, architecture, RTL, verification, and release evidence live in different systems.</li>
            <li>• Engineers may review the wrong branch, baseline, register version, simulation result, or waiver.</li>
            <li>• Traceability weakens as implementation and verification evolve.</li>
            <li>• Regression failures create large triage volumes.</li>
            <li>• Lessons remain in defect systems, scripts, reports, and individual experience.</li>
            <li>• Readiness decisions require manual reconciliation across many disciplines.</li>
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <SectionEyebrow>Resulting Friction</SectionEyebrow>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {FRICTIONS.map((f) => (
              <button
                key={f.id}
                onMouseEnter={() => setHoverFriction(f.id)}
                onMouseLeave={() => setHoverFriction(null)}
                onFocus={() => setHoverFriction(f.id)}
                onBlur={() => setHoverFriction(null)}
                className={`text-left rounded-md border px-3 py-2.5 transition ${
                  hoverFriction === f.id ? "border-amber-300 bg-amber-50/40" : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <div className="text-sm font-semibold">{f.title}</div>
                </div>
                <div className="text-xs text-neutral-600 mt-1">{f.body}</div>
                {hoverFriction === f.id && (
                  <div className="mt-2 rounded bg-white border border-amber-200 px-2 py-1.5 text-[11px] text-neutral-700">
                    <span className="text-amber-700 font-medium">Example — </span>{f.example}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Operating Model */}
      <section id="principles" className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <SectionEyebrow>Section 2 · The AVEP Operating Model</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold">One Connected Engineering Model</h2>
          <p className="mt-1 text-sm text-neutral-600 max-w-3xl">
            AVEP creates a canonical relationship between engineering intent, implementation, proof, decisions, and institutional learning.
          </p>

          <div className="mt-5 space-y-2">
            {LAYERS.map((L, i) => (
              <button
                key={L.id}
                onClick={() => setOpenLayer(openLayer === L.id ? null : L.id)}
                className={`w-full text-left rounded-md border px-4 py-3 transition ${
                  openLayer === L.id ? "border-blue-300 bg-white shadow-sm" : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[11px] font-mono text-neutral-500 w-8">{L.id}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{L.name}</div>
                    <div className="text-xs text-neutral-600">{L.purpose}</div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-neutral-400 transition ${openLayer === L.id ? "rotate-90" : ""}`} />
                </div>
                {openLayer === L.id && (
                  <div className="mt-3 pl-11 flex flex-wrap gap-1.5">
                    {L.items.map((it) => (
                      <span key={it} className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-neutral-700">
                        {it}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Lifecycle */}
      <section id="lifecycle" className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <SectionEyebrow>Section 3 · End-to-End Lifecycle</SectionEyebrow>
            <h2 className="mt-2 text-2xl font-semibold">The Demonstration Journey</h2>
            <p className="mt-1 text-sm text-neutral-600 max-w-3xl">
              Four phases, eighteen numbered steps. Click a step to preview its role, friction, AVEP contribution, and human authority.
            </p>
          </div>
          <Link to="/avep/demo/end-to-end-story"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-50">
            <MapIcon className="h-4 w-4" /> Open Full End-to-End Story
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          {(["Phase 1", "Phase 2", "Phase 3"] as const).map((p) => (
            <div key={p}>
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                {p === "Phase 1" && "Phase 1 — Define What Should Be Built"}
                {p === "Phase 2" && "Phase 2 — Design and Verify the Solution"}
                {p === "Phase 3" && "Phase 3 — Prove Readiness"}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {phaseSteps[p].map((s) => (
                  <button key={s.n} onClick={() => setOpenStep(s)}
                    className="text-left rounded-md border border-neutral-200 bg-white px-2.5 py-2 hover:bg-neutral-50 hover:border-blue-300 transition">
                    <div className="text-[10px] font-mono text-neutral-500">Step {s.n.toString().padStart(2, "0")}</div>
                    <div className="text-xs font-medium leading-tight mt-0.5">{s.title}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Phase 4 — Communicate & Demonstrate</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { t: "Guided Executive Story",         p: "/avep/demo/end-to-end-story" },
                { t: "Engineering Leadership Walkthrough", p: "/avep/demo/end-to-end-story" },
                { t: "Deep Engineering Investigation", p: "/avep/demo/end-to-end-story" },
                { t: "Decision & Outcome Summary",     p: "/avep/demo/end-to-end-story" },
              ].map((c) => (
                <Link key={c.t} to={c.p}
                  className="rounded-md border border-neutral-200 bg-white px-2.5 py-2 hover:bg-neutral-50 hover:border-blue-300 transition text-xs font-medium">
                  {c.t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — One requirement */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <SectionEyebrow>Section 4 · One Engineering Story</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold">Follow One Requirement Through the Complete Lifecycle</h2>
          <div className="mt-3 rounded-md border border-neutral-200 bg-white px-4 py-3 max-w-3xl">
            <div className="text-[11px] font-mono text-neutral-500">REQ-DDMAC-142</div>
            <div className="text-sm mt-1">
              "The descriptor engine shall reject descriptors whose payload length exceeds the configured maximum transfer length."
            </div>
          </div>

          <ol className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {TRACE.map((n, i) => (
              <li key={n.id}>
                <button onClick={() => setOpenTrace(n)}
                  className="w-full text-left rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-mono">{i + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono truncate">{n.label}</div>
                    <div className="text-[10px] text-neutral-500">{n.artifact}</div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATE_STYLE[n.state] || "border-neutral-200"}`}>{n.state}</span>
                </button>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-sm text-neutral-700 max-w-3xl">
            AVEP preserves the relationship between what was requested, what was built, how it was tested, what failed, what changed,
            how it was validated, and why the design may or may not advance.
          </p>
        </div>
      </section>

      {/* Section 5 — AI and Human Authority */}
      <section className="max-w-[1600px] mx-auto px-6 py-10">
        <SectionEyebrow>Section 5 · AI and Human Authority</SectionEyebrow>
        <h2 className="mt-2 text-2xl font-semibold">AI Accelerates Engineering Work. Engineers Retain Authority.</h2>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <AuthorityColumn tone="emerald" icon={<Sparkles className="h-4 w-4" />} title="AI Can" items={AI_CAN} />
          <AuthorityColumn tone="red"     icon={<X className="h-4 w-4" />}       title="AI Cannot" items={AI_CANNOT} />
          <AuthorityColumn tone="sky"     icon={<Users className="h-4 w-4" />}   title="Human Authorities" items={HUMAN_AUTH} />
        </div>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <ShieldCheck className="h-4 w-4 inline mr-1.5 text-amber-700 align-text-bottom" />
          <span className="font-medium">AI confidence is not engineering approval.</span>
        </div>

        {/* Approval-boundary matrix */}
        <div className="mt-5 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-neutral-600" />
            <div className="text-sm font-semibold">Approval Boundary Matrix</div>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Engineering Action</th>
                <th className="text-left px-4 py-2 font-medium">AI Contribution</th>
                <th className="text-left px-4 py-2 font-medium">Human Authority</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Accept a proposed RTL delta",      "Propose & explain",    "RTL Design Lead"],
                ["Approve a bounded formal property", "Draft & score",       "Formal Lead"],
                ["Close a coverage gap",              "Classify & plan",     "Verification Lead"],
                ["Approve a waiver",                  "Draft justification", "Signoff Authority"],
                ["Accept residual risk",              "Assemble evidence",   "Release Authority"],
                ["Authorize physical-design intake",  "Recommend & explain", "Physical-Design Intake Lead"],
              ].map(([a, ai, h]) => (
                <tr key={a} className="border-t border-neutral-100">
                  <td className="px-4 py-2 font-medium">{a}</td>
                  <td className="px-4 py-2 text-neutral-600">{ai}</td>
                  <td className="px-4 py-2 text-sky-700 font-medium">{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6 — Watch For */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <SectionEyebrow>Section 6 · Five Proof Points</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold">What the Audience Should Watch For</h2>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {PROOF.map((p) => (
              <div key={p.n} className="rounded-lg border border-neutral-200 bg-white p-4 flex flex-col">
                <div className="text-3xl font-semibold text-blue-700 leading-none">{p.n}</div>
                <div className="text-sm font-semibold mt-2">{p.title}</div>
                <div className="text-xs text-neutral-600 mt-1 flex-1">{p.body}</div>
                <Link to={p.link.path} className="mt-3 text-xs inline-flex items-center gap-1 text-blue-700 hover:underline">
                  {p.link.label} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Outcomes */}
      <section className="max-w-[1600px] mx-auto px-6 py-10">
        <SectionEyebrow>Section 7 · Platform Outcomes</SectionEyebrow>
        <h2 className="mt-2 text-2xl font-semibold">What AVEP Is Designed to Improve</h2>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-xs font-semibold mb-2">Engineering Outcomes</div>
            <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
              <li>Improved requirement quality</li>
              <li>Stronger cross-domain traceability</li>
              <li>Faster authoring of bounded engineering artifacts</li>
              <li>Reduced regression-triage effort</li>
              <li>Faster root-cause investigation</li>
              <li>More targeted validation</li>
              <li>Improved coverage convergence</li>
              <li>Reusable defect-prevention patterns</li>
              <li>More complete signoff evidence</li>
              <li>Reproducible release packages</li>
            </ul>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-xs font-semibold mb-2">Business & Program Outcomes</div>
            <ul className="text-sm text-neutral-700 space-y-1 list-disc pl-5">
              <li>Reduced avoidable rework</li>
              <li>Faster engineering decisions</li>
              <li>More predictable milestone readiness</li>
              <li>Better use of simulation compute and licenses</li>
              <li>Reduced downstream handoff risk</li>
              <li>Improved governance of AI-assisted engineering</li>
              <li>Better retention of institutional knowledge</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center gap-2">
            <div className="text-sm font-semibold">Representative Demonstration Metrics</div>
            <div className="ml-auto flex items-center gap-2 text-[10px] text-neutral-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Measured</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-neutral-400" /> Estimated</span>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Outcome</th>
                <th className="text-left px-4 py-2 font-medium">Demonstration Value</th>
                <th className="text-left px-4 py-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map(([k, v, t]) => (
                <tr key={k} className="border-t border-neutral-100">
                  <td className="px-4 py-2 font-medium">{k}</td>
                  <td className="px-4 py-2">{v}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      t === "Measured" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-50 text-neutral-600 border-neutral-200"
                    }`}>{t}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 8 — Scope */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <SectionEyebrow>Section 8 · Scope & Boundary</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold">Where This Demonstration Begins and Ends</h2>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <div className="text-xs font-semibold text-emerald-800">Included in the AVEP Demonstration</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SCOPE_IN.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded border border-emerald-200 bg-white text-neutral-700">{s}</span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-300 bg-white p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <X className="h-4 w-4 text-neutral-500" />
                <div className="text-xs font-semibold text-neutral-700">Downstream Activities Not Claimed as Complete</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SCOPE_OUT.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-neutral-600">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm">
            <ShieldCheck className="h-4 w-4 inline mr-1.5 text-amber-700 align-text-bottom" />
            <span className="font-medium">AVEP demonstrates front-end engineering readiness and controlled physical-design intake — not tapeout or manufacturing readiness.</span>
          </div>
        </div>
      </section>

      {/* Section 9 — Audience */}
      <section id="audience" className="max-w-[1600px] mx-auto px-6 py-10">
        <SectionEyebrow>Section 9 · Choose the Conversation</SectionEyebrow>
        <h2 className="mt-2 text-2xl font-semibold">Demo Audience Selection</h2>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {(Object.keys(AUDIENCE_META) as Audience[]).map((a) => {
            const m = AUDIENCE_META[a];
            const active = audience === a;
            return (
              <button key={a} onClick={() => setAudience(a)}
                className={`text-left rounded-lg border p-4 transition ${
                  active ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{a}</div>
                  {m.default && !active && <span className="text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-500">Default</span>}
                  {active && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Duration · {m.duration}</div>
                <ul className="text-xs text-neutral-700 mt-2 space-y-0.5">
                  {m.focus.map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm flex items-center gap-3 flex-wrap">
          <div className="text-neutral-600">
            <span className="text-neutral-500">Active audience — </span><span className="font-medium">{audience}</span>
            <span className="text-neutral-500"> · Estimated duration — </span><span className="font-medium">{audienceMeta.duration}</span>
          </div>
          <button onClick={beginJourney} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs hover:bg-neutral-800">
            {audienceMeta.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* Section 10 — Begin */}
      <section className="bg-gradient-to-br from-blue-50/60 via-white to-emerald-50/40 border-y border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6 py-12 text-center">
          <SectionEyebrow>Section 10 · Begin the Journey</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-semibold">Begin with the Controlled Engineering Context</h2>
          <p className="mt-3 text-sm text-neutral-700 max-w-3xl mx-auto">
            Before AI analyzes requirements, generates proposals, correlates failures, or recommends readiness, the program context must be correct.
            The next workspace establishes the SoC, IP block, revision, branch, baseline, milestone, engineering owners, methodology, and active scenario
            that govern every downstream artifact and decision.
          </p>
          <div className="mt-5 flex items-center justify-center flex-wrap gap-2">
            <button onClick={beginJourney} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-900 text-white text-sm hover:bg-neutral-800">
              Open Engineering Context Workspace <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => setGuideStep(0)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-neutral-300 text-sm bg-white hover:bg-neutral-50">
              <Play className="h-4 w-4" /> Start Guided Introduction
            </button>
            <Link to="/avep/demo/end-to-end-story" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-neutral-300 text-sm bg-white hover:bg-neutral-50">
              <MapIcon className="h-4 w-4" /> Open End-to-End Story
            </Link>
            <a href="#principles" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-neutral-300 text-sm bg-white hover:bg-neutral-50">
              Review Demo Proof Points
            </a>
          </div>
        </div>
      </section>

      {/* Key concepts */}
      <section className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <SectionEyebrow>Key Concepts</SectionEyebrow>
            <h2 className="mt-2 text-xl font-semibold">Interactive Concept Glossary</h2>
          </div>
          <button onClick={() => setGlossaryOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 text-xs hover:bg-neutral-50">
            <BookOpen className="h-4 w-4" /> Open Full Glossary
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {GLOSSARY.slice(0, 12).map(([term, def]) => (
            <button key={term} title={def} onClick={() => setGlossaryOpen(true)}
              className="text-[11px] font-mono px-2 py-1 rounded border border-neutral-200 bg-white text-neutral-700 hover:border-blue-300 hover:bg-blue-50/50">
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Persistent bottom demo bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px]">
          <span className="font-mono text-neutral-500">Module</span><span className="font-medium">AI VLSI Engineering Platform</span>
          <span className="font-mono text-neutral-500">Demo mode</span><span className="font-medium">{audience}</span>
          <span className="font-mono text-neutral-500">Scenario</span><span className="font-medium">AI-Assisted Engineering Decision</span>
          <span className="font-mono text-neutral-500">Journey</span><span className="font-medium text-amber-700">Not Started</span>
          <span className="font-mono text-neutral-500 hidden lg:inline">Scope</span><span className="font-medium hidden lg:inline">Requirements → PD Intake</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={beginJourney} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 text-white text-[11px] hover:bg-neutral-800">
              Begin Journey <ArrowRight className="h-3 w-3" />
            </button>
            <a href="#audience" className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 text-[11px] hover:bg-neutral-50">
              Select Audience
            </a>
            <Link to="/avep/demo/end-to-end-story" className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 text-[11px] hover:bg-neutral-50">
              Story Map
            </Link>
            <button onClick={resetDemo} className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 text-[11px] hover:bg-neutral-50">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Lifecycle step drawer */}
      {openStep && (
        <Drawer onClose={() => setOpenStep(null)} title={`Step ${openStep.n.toString().padStart(2, "0")} · ${openStep.phase}`}>
          <div className="text-lg font-semibold">{openStep.title}</div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
            <Field label="Current activity" value={openStep.activity} />
            <Field label="Common friction" value={openStep.friction} tone="amber" />
            <Field label="AVEP contribution" value={openStep.ai} tone="violet" />
            <Field label="Human authority" value={openStep.human} tone="sky" />
          </div>
          {openStep.page && (
            <Link to={openStep.page.path} onClick={() => setOpenStep(null)}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs hover:bg-neutral-800">
              Open {openStep.page.label} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </Drawer>
      )}

      {/* Trace artifact drawer */}
      {openTrace && (
        <Drawer onClose={() => setOpenTrace(null)} title={openTrace.artifact}>
          <div className="text-lg font-mono">{openTrace.label}</div>
          <div className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] mt-2 ${STATE_STYLE[openTrace.state] || "border-neutral-200"}`}>
            {openTrace.state}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
            <Field label="Owner" value={openTrace.owner} />
            <Field label="Engineering intent" value="Preserve the connection from requirement through advancement decision." />
            <Field label="AI contribution" value="Extracts, correlates, and links this artifact to its neighbors." tone="violet" />
            <Field label="Human decision" value="Approved by the accountable engineering authority for this artifact type." tone="sky" />
          </div>
        </Drawer>
      )}

      {/* Glossary drawer */}
      {glossaryOpen && (
        <Drawer onClose={() => setGlossaryOpen(false)} title="Key Concepts">
          <div className="space-y-3">
            {GLOSSARY.map(([term, def]) => (
              <div key={term} className="rounded-md border border-neutral-200 px-3 py-2">
                <div className="text-xs font-mono text-blue-700">{term}</div>
                <div className="text-sm text-neutral-700 mt-0.5">{def}</div>
              </div>
            ))}
          </div>
        </Drawer>
      )}

      {/* Guided introduction */}
      {guideStep !== null && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-lg bg-white border border-neutral-200 shadow-xl">
            <div className="px-5 py-3 border-b border-neutral-200 flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-700" />
              <div className="text-sm font-semibold">Guided Introduction</div>
              <div className="ml-auto text-[11px] font-mono text-neutral-500">
                Step {guideStep + 1} of {GUIDE.length}
              </div>
              <button onClick={() => setGuideStep(null)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="text-lg font-semibold">{GUIDE[guideStep].title}</div>
              <p className="text-sm text-neutral-700 mt-2">{GUIDE[guideStep].copy}</p>

              <div className="mt-4 h-1 rounded bg-neutral-100 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${((guideStep + 1) / GUIDE.length) * 100}%` }} />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-neutral-200 flex items-center gap-2">
              <button onClick={() => setGuideStep(null)} className="text-xs text-neutral-500 hover:text-neutral-800">Skip</button>
              <button onClick={() => setGuideStep(0)} className="text-xs text-neutral-500 hover:text-neutral-800">Restart</button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setGuideStep((s) => Math.max(0, (s ?? 0) - 1))}
                  disabled={guideStep === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs disabled:opacity-40 hover:bg-neutral-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                {guideStep < GUIDE.length - 1 ? (
                  <button
                    onClick={() => setGuideStep((s) => Math.min(GUIDE.length - 1, (s ?? 0) + 1))}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-900 text-white text-xs hover:bg-neutral-800"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setGuideStep(null); beginJourney(); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700"
                  >
                    Begin Journey <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- helpers ------------------------------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-mono uppercase tracking-wider text-blue-700">{children}</div>;
}

function AuthorityColumn({
  title, items, tone, icon,
}: { title: string; items: string[]; tone: "emerald" | "red" | "sky"; icon: React.ReactNode }) {
  const styles = {
    emerald: { border: "border-emerald-200", head: "bg-emerald-50 text-emerald-800", dot: "text-emerald-600" },
    red:     { border: "border-red-200",     head: "bg-red-50 text-red-800",         dot: "text-red-500" },
    sky:     { border: "border-sky-200",     head: "bg-sky-50 text-sky-800",         dot: "text-sky-600" },
  }[tone];
  return (
    <div className={`rounded-lg border ${styles.border} bg-white overflow-hidden`}>
      <div className={`px-4 py-2 ${styles.head} flex items-center gap-2 text-sm font-semibold`}>
        <span className={styles.dot}>{icon}</span>{title}
      </div>
      <ul className="p-4 space-y-1.5 text-sm text-neutral-700">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${styles.dot} bg-current shrink-0`} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "amber" | "violet" | "sky" }) {
  const bg = tone === "amber" ? "bg-amber-50/40 border-amber-200"
           : tone === "violet" ? "bg-violet-50/40 border-violet-200"
           : tone === "sky" ? "bg-sky-50/40 border-sky-200"
           : "border-neutral-200";
  return (
    <div className={`rounded-md border ${bg} px-3 py-2`}>
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-[440px] max-w-full bg-white h-full border-l border-neutral-200 p-5 overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">{title}</div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
