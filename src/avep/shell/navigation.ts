import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  FileText,
  Cpu,
  Code2,
  Layers,
  ClipboardList,
  PlayCircle,
  AlertTriangle,
  Activity,
  ShieldCheck,
  ScanSearch,
  Target,
  FlaskConical,
  Binary,
  GitPullRequest,
  BadgeCheck,
  Sparkles,
  Server,
  Gavel,
  type LucideIcon,
} from "lucide-react";

export interface AvepNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  group: "Plan" | "Design" | "Verify" | "Deliver" | "Platform";
}

export const AVEP_NAV: AvepNavItem[] = [
  { id: "overview",           label: "Overview",              path: "/avep",                          icon: LayoutDashboard, group: "Plan" },
  { id: "program",            label: "Program & Portfolio",   path: "/avep/program",                  icon: FolderKanban,    group: "Plan" },
  { id: "requirements",       label: "Requirements",          path: "/avep/requirements",             icon: ListChecks,      group: "Plan" },
  { id: "requirements-review",label: "Requirements Review",   path: "/avep/requirements-review",      icon: ShieldCheck,     group: "Plan" },
  { id: "specification",      label: "Engineering Traceability Workspace", path: "/avep/specification",  icon: FileText,        group: "Plan" },

  { id: "architecture",       label: "Logical Architecture Workspace", path: "/avep/architecture",     icon: Cpu,             group: "Plan" },
  { id: "rtl",                label: "Engineering Specification & Verification Workspace", path: "/avep/rtl", icon: Code2,           group: "Plan" },
  { id: "rtl-generation",     label: "RTL Generation Studio", path: "/avep/design/rtl-generation",     icon: Code2,           group: "Design" },
  { id: "change-impact",      label: "RTL Change Impact Analysis", path: "/avep/design/change-impact", icon: GitPullRequest,  group: "Design" },
  { id: "verification-env",   label: "Verification Environment Builder", path: "/avep/verification/environment-builder", icon: Layers, group: "Design" },
  { id: "test-factory",       label: "Test, Stimulus, Assertion & Property Factory", path: "/avep/verification/test-factory", icon: FlaskConical, group: "Design" },
  { id: "sim-ops",            label: "Simulation Operations & Regression Intelligence", path: "/avep/verification/simulation-operations", icon: PlayCircle, group: "Design" },
  { id: "failure-diagnosis",  label: "Waveform Intelligence & Failure Diagnosis", path: "/avep/verification/failure-diagnosis", icon: Activity, group: "Design" },

  { id: "verification-plan",  label: "Coverage Closure & Verification Readiness", path: "/avep/readiness/coverage-closure", icon: ClipboardList,   group: "Verify" },
  { id: "signoff-readiness",  label: "Signoff Readiness & Engineering Evidence", path: "/avep/readiness/signoff", icon: BadgeCheck,      group: "Verify" },
  { id: "release-package",    label: "Documentation & Validated Design Package", path: "/avep/readiness/release-package", icon: FileText,        group: "Verify" },
  { id: "ai-governance-value",label: "AI Governance, Engineering Learning & Value Realization", path: "/avep/governance/ai-value", icon: Gavel,           group: "Verify" },
  { id: "pd-intake",          label: "Physical-Design Intake Decision", path: "/avep/readiness/physical-design-intake", icon: BadgeCheck,      group: "Verify" },
  { id: "simulation",         label: "Simulation",            path: "/avep/simulation",               icon: PlayCircle,      group: "Verify" },
  { id: "failure-triage",     label: "Failure Triage",        path: "/avep/failure-triage",           icon: AlertTriangle,   group: "Verify" },
  { id: "waveform",           label: "Waveform Debug",        path: "/avep/waveform-debug",           icon: Activity,        group: "Verify" },
  { id: "formal",             label: "Formal Verification",   path: "/avep/formal-verification",      icon: ShieldCheck,     group: "Verify" },
  { id: "static",             label: "Static Analysis",       path: "/avep/static-analysis",          icon: ScanSearch,      group: "Verify" },
  { id: "coverage",           label: "Coverage Closure",      path: "/avep/coverage-closure",         icon: Target,          group: "Verify" },
  { id: "gls",                label: "Gate Level Simulation", path: "/avep/gate-level-simulation",    icon: Binary,          group: "Verify" },

  { id: "ecn",                label: "Engineering Changes",   path: "/avep/engineering-changes",      icon: GitPullRequest,  group: "Deliver" },
  { id: "signoff",            label: "Signoff",               path: "/avep/signoff",                  icon: BadgeCheck,      group: "Deliver" },

  { id: "ai-engineering",     label: "AI Engineering",        path: "/avep/ai-engineering",           icon: Sparkles,        group: "Platform" },
  { id: "compute",            label: "Compute",               path: "/avep/compute",                  icon: Server,          group: "Platform" },
  { id: "governance",         label: "Governance",            path: "/avep/governance",               icon: Gavel,           group: "Platform" },
];

export const AVEP_NAV_GROUPS = ["Plan", "Design", "Verify", "Deliver", "Platform"] as const;
