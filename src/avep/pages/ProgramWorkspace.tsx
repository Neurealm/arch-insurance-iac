import { useMemo, useState } from "react";
import {
  Lock, ShieldCheck, GitBranch, Tag, AlertTriangle, CheckCircle2, XCircle,
  Copy, ExternalLink, Play, RotateCcw, ChevronRight, Search, Info, Users,
  FileText, Cpu, Layers, ClipboardList, Activity, Bug, Target, Sparkles,
  GitPullRequest, BadgeCheck, PackageOpen, Clock, User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AVEP_IDENTITY } from "../theme";

/* -------------------------- Types & Fixture Data -------------------------- */

type IntegrityState = "validated" | "warning" | "blocking" | "stale" | "missing";
type LockState = "locked" | "selectable" | "scenario";

interface ContextRow {
  key: string;
  label: string;
  value: string;
  lock: LockState;
  source: string;
  freshness: string;
  owner: string;
  state: IntegrityState;
  mono?: boolean;
}

const CONTEXT_ROWS: ContextRow[] = [
  { key: "tenant", label: "Tenant", value: "Palo Alto Networks Engineering Demo", lock: "locked", source: "Identity Directory", freshness: "Synthetic", owner: "Platform", state: "validated" },
  { key: "portfolio", label: "Portfolio", value: "Network Security Silicon Engineering", lock: "locked", source: "Program Registry", freshness: "Synthetic", owner: "Portfolio Office", state: "validated" },
  { key: "program", label: "Program", value: "Project Aegis", lock: "locked", source: "Program Registry", freshness: "T2 · 15 Jul 2026", owner: "Priya Nair", state: "validated" },
  { key: "soc", label: "Target SoC", value: "Aegis Network Processing SoC", lock: "locked", source: "Architecture", freshness: "T2", owner: "Daniel Cho", state: "validated" },
  { key: "ip", label: "Primary IP", value: "DDMAC", lock: "locked", source: "IP Catalog", freshness: "T2", owner: "Daniel Cho", state: "validated", mono: true },
  { key: "ipv", label: "IP Version", value: "2.4", lock: "locked", source: "IP Catalog", freshness: "T2", owner: "Daniel Cho", state: "validated", mono: true },
  { key: "dv-env", label: "Verification Environment", value: "DDMAC UVM Environment 2.4", lock: "locked", source: "DV Registry", freshness: "T2", owner: "Arjun Rao", state: "validated" },
  { key: "branch", label: "Current Branch", value: "feature/descriptor-ring-fix", lock: "selectable", source: "Git", freshness: "3 commits ahead", owner: "Mei Lin", state: "validated", mono: true },
  { key: "parent", label: "Parent Branch", value: "release/2.4", lock: "selectable", source: "Git", freshness: "Protected", owner: "Marcus Lee", state: "validated", mono: true },
  { key: "req-bl", label: "Requirement Baseline", value: "REQ-BL-2026.07.15", lock: "selectable", source: "Requirements", freshness: "T2", owner: "Priya Nair", state: "validated", mono: true },
  { key: "spec-bl", label: "Specification Baseline", value: "SPEC-BL-2.4.3", lock: "selectable", source: "Spec Repo", freshness: "T2", owner: "Daniel Cho", state: "validated", mono: true },
  { key: "arch-bl", label: "Architecture Baseline", value: "ARCH-BL-2.4.2", lock: "selectable", source: "Architecture", freshness: "T2", owner: "Daniel Cho", state: "validated", mono: true },
  { key: "rdl-bl", label: "Register Baseline", value: "RDL-BL-2.4.5", lock: "selectable", source: "SystemRDL", freshness: "T2", owner: "Daniel Cho", state: "validated", mono: true },
  { key: "rtl-bl", label: "RTL Baseline", value: "RTL-BL-2.4.7", lock: "selectable", source: "Git tag", freshness: "T2", owner: "Mei Lin", state: "validated", mono: true },
  { key: "dv-bl", label: "Verification Baseline", value: "DV-BL-2.4.6", lock: "selectable", source: "DV Registry", freshness: "T2", owner: "Arjun Rao", state: "warning", mono: true },
  { key: "milestone", label: "Current Milestone", value: "RTL Remediation Review", lock: "scenario", source: "Program Timeline", freshness: "T2", owner: "Priya Nair", state: "validated" },
  { key: "scenario", label: "Scenario", value: "T2 · AI Assisted Root Cause", lock: "scenario", source: "Demo Controller", freshness: "Active", owner: "Platform", state: "validated" },
  { key: "time", label: "Frozen Time", value: "2026-07-15 14:30 UTC", lock: "scenario", source: "Demo Controller", freshness: "Scenario controlled", owner: "Platform", state: "validated", mono: true },
  { key: "seed", label: "Seed Version", value: "AVEP-SEED-2026.07.15.1", lock: "locked", source: "Demo Controller", freshness: "Synthetic", owner: "Platform", state: "validated", mono: true },
];

interface PropagationNode {
  id: string; label: string; icon: React.ComponentType<{ className?: string }>;
  count: string; baseline: string; state: IntegrityState; mismatches: number;
}

const PROPAGATION: PropagationNode[] = [
  { id: "req", label: "Requirements",   icon: ClipboardList, count: "186",    baseline: "REQ-BL-2026.07.15", state: "validated", mismatches: 0 },
  { id: "spec", label: "Specification", icon: FileText,      count: "42",     baseline: "SPEC-BL-2.4.3",    state: "validated", mismatches: 0 },
  { id: "arch", label: "Architecture",  icon: Cpu,           count: "18",     baseline: "ARCH-BL-2.4.2",    state: "validated", mismatches: 0 },
  { id: "reg", label: "Registers",      icon: Layers,        count: "212",    baseline: "RDL-BL-2.4.5",     state: "validated", mismatches: 0 },
  { id: "rtl", label: "RTL Modules",    icon: Cpu,           count: "13",     baseline: "RTL-BL-2.4.7",     state: "validated", mismatches: 0 },
  { id: "test", label: "Tests",         icon: ClipboardList, count: "612",    baseline: "DV-BL-2.4.6",      state: "validated", mismatches: 0 },
  { id: "sim", label: "Simulations",    icon: Activity,      count: "4,280",  baseline: "T2 bound",         state: "validated", mismatches: 0 },
  { id: "def", label: "Defects",        icon: Bug,           count: "37",     baseline: "T2 bound",         state: "validated", mismatches: 0 },
  { id: "cov", label: "Coverage",       icon: Target,        count: "128",    baseline: "DV-BL-2.4.6",      state: "validated", mismatches: 0 },
  { id: "ai", label: "AI Analyses",     icon: Sparkles,      count: "24",     baseline: "T2 evidence",      state: "validated", mismatches: 0 },
  { id: "cr", label: "Changes",         icon: GitPullRequest, count: "12",    baseline: "release/2.4",      state: "validated", mismatches: 0 },
  { id: "apr", label: "Approvals",      icon: BadgeCheck,    count: "18",     baseline: "2 pending",        state: "warning",   mismatches: 2 },
  { id: "pkg", label: "Handoff Package", icon: PackageOpen,  count: "31",     baseline: "Not released",     state: "warning",   mismatches: 0 },
];

interface ValidationCheck { id: string; label: string; state: IntegrityState; note: string; }
const BASE_CHECKS: ValidationCheck[] = [
  { id: "c1", label: "Program identity matches active tenant", state: "validated", note: "Aegis under PANW demo" },
  { id: "c2", label: "Target SoC matches selected program", state: "validated", note: "soc-aegis-np1" },
  { id: "c3", label: "IP version matches architecture baseline", state: "validated", note: "DDMAC 2.4 ↔ ARCH-BL-2.4.2" },
  { id: "c4", label: "Requirement baseline matches specification source", state: "validated", note: "REQ-BL-2026.07.15" },
  { id: "c5", label: "Register baseline matches RTL generated interface", state: "validated", note: "RDL-BL-2.4.5" },
  { id: "c6", label: "Current branch derives from release/2.4", state: "validated", note: "3 commits ahead" },
  { id: "c7", label: "Verification baseline references current RTL baseline", state: "warning", note: "Verification lead review pending" },
  { id: "c8", label: "Simulation results use current seed and tool context", state: "validated", note: "PANW-DDMAC-240715" },
  { id: "c9", label: "Defects belong to active scenario", state: "validated", note: "T2 defects only" },
  { id: "c10", label: "AI analyses use active evidence set", state: "validated", note: "24 T2 evidence bundles" },
  { id: "c11", label: "Approvals reference current artifact versions", state: "warning", note: "Release configuration approval pending" },
  { id: "c12", label: "Release package remains blocked until final sign off", state: "validated", note: "Handoff gated" },
];

interface AuthorityRow { role: string; name: string; responsibility: string; state: string; nextAction: string; }
const AUTHORITIES: AuthorityRow[] = [
  { role: "Program Director",              name: "Priya Nair",       responsibility: "Program integrity & milestone gates",  state: "acknowledged", nextAction: "Review remediation plan" },
  { role: "IP Architect",                  name: "Daniel Cho",       responsibility: "Spec / architecture / register baselines", state: "acknowledged", nextAction: "None" },
  { role: "RTL Design Lead",               name: "Mei Lin",          responsibility: "RTL baseline & branch merges",         state: "acknowledged", nextAction: "Merge readiness note" },
  { role: "Verification Lead",             name: "Arjun Rao",        responsibility: "DV baseline alignment",                state: "pending",      nextAction: "Confirm verification baseline alignment" },
  { role: "Formal & Static Lead",          name: "Sofia Martinez",   responsibility: "CDC/RDC & assurance",                  state: "acknowledged", nextAction: "None" },
  { role: "Release & Configuration Manager", name: "Marcus Lee",     responsibility: "Branch/tag & release configuration",   state: "pending",      nextAction: "Approve active release configuration" },
  { role: "AI Engineering Lead",           name: "Jordan Kim",       responsibility: "AI evidence integrity",                state: "acknowledged", nextAction: "None" },
];

const STANDARDS = [
  { std: "SystemVerilog",                    cat: "RTL & verification language",     applies: "RTL, DV",   ver: "IEEE 1800-2017", src: "IEEE",  owner: "Mei Lin",         state: "validated" as IntegrityState },
  { std: "UVM",                              cat: "Verification methodology",         applies: "DV",        ver: "1.2 / 2020",     src: "Accellera", owner: "Arjun Rao",   state: "validated" as IntegrityState },
  { std: "SVA",                              cat: "Assertion methodology",            applies: "RTL, DV",   ver: "2017",           src: "IEEE",  owner: "Sofia Martinez",   state: "validated" as IntegrityState },
  { std: "SystemRDL",                        cat: "Register source of truth",         applies: "Registers", ver: "2.0",            src: "Accellera", owner: "Daniel Cho",   state: "validated" as IntegrityState },
  { std: "APB4",                             cat: "Control interface",                applies: "CSR path",  ver: "AMBA APB",       src: "Arm",   owner: "Daniel Cho",       state: "validated" as IntegrityState },
  { std: "AXI4",                             cat: "Primary data path",                applies: "Data path", ver: "AMBA AXI4",      src: "Arm",   owner: "Daniel Cho",       state: "validated" as IntegrityState },
  { std: "Git Flow",                         cat: "Source control methodology",       applies: "All",       ver: "Internal",       src: "Neurealm", owner: "Marcus Lee",    state: "validated" as IntegrityState },
  { std: "Secure Coding Standard NSSE 4.2",  cat: "Internal synthetic standard",      applies: "RTL, tools", ver: "4.2",           src: "Internal", owner: "Sofia Martinez", state: "validated" as IntegrityState },
  { std: "CDC & RDC Review Standard",        cat: "Static assurance",                 applies: "RTL",       ver: "1.3",            src: "Internal", owner: "Sofia Martinez", state: "validated" as IntegrityState },
  { std: "DV Sign Off Template 2.4",         cat: "Quality & sign off",               applies: "DV",        ver: "2.4",            src: "Internal", owner: "Arjun Rao",     state: "validated" as IntegrityState },
  { std: "Release Configuration Standard 3.1", cat: "Package control",                applies: "Handoff",   ver: "3.1",            src: "Internal", owner: "Marcus Lee",    state: "validated" as IntegrityState },
];

interface ArtifactRow {
  id: string; type: string; version: string; branch: string; baseline: string;
  scenario: string; owner: string; source: string; freshness: string; state: IntegrityState;
}
const ARTIFACTS: ArtifactRow[] = [
  { id: "REQ-0042",                type: "Requirement",    version: "v3",  branch: "release/2.4",              baseline: "REQ-BL-2026.07.15", scenario: "T2", owner: "Priya Nair",     source: "Requirements", freshness: "T2", state: "validated" },
  { id: "SPEC-SEC-011",            type: "Specification",  version: "v2",  branch: "release/2.4",              baseline: "SPEC-BL-2.4.3",     scenario: "T2", owner: "Daniel Cho",     source: "Spec Repo",    freshness: "T2", state: "validated" },
  { id: "ARCH-DDMAC-CTRL",         type: "Architecture",   version: "v4",  branch: "release/2.4",              baseline: "ARCH-BL-2.4.2",     scenario: "T2", owner: "Daniel Cho",     source: "Architecture", freshness: "T2", state: "validated" },
  { id: "REG-COMP-STATUS",         type: "Register",       version: "v5",  branch: "release/2.4",              baseline: "RDL-BL-2.4.5",      scenario: "T2", owner: "Daniel Cho",     source: "SystemRDL",    freshness: "T2", state: "validated" },
  { id: "ddmac_completion_ctrl",   type: "RTL module",     version: "v7",  branch: "feature/descriptor-ring-fix", baseline: "RTL-BL-2.4.7",   scenario: "T2", owner: "Mei Lin",        source: "Git",          freshness: "T2", state: "validated" },
  { id: "TEST-DESC-WRAP-019",      type: "Test",           version: "v2",  branch: "feature/descriptor-ring-fix", baseline: "DV-BL-2.4.6",    scenario: "T2", owner: "Verification Team", source: "DV Registry", freshness: "T2", state: "warning" },
  { id: "REG-T2-NIGHTLY-0715",     type: "Regression",     version: "run-142", branch: "feature/descriptor-ring-fix", baseline: "DV-BL-2.4.6", scenario: "T2", owner: "Arjun Rao",     source: "Sim Farm",     freshness: "T2", state: "validated" },
  { id: "DV-2741",                 type: "Defect",         version: "v1",  branch: "feature/descriptor-ring-fix", baseline: "DV-BL-2.4.6",    scenario: "T2", owner: "Arjun Rao",     source: "Defect Tracker", freshness: "T2", state: "validated" },
  { id: "AIA-104",                 type: "AI Analysis",    version: "v1",  branch: "feature/descriptor-ring-fix", baseline: "T2 evidence",    scenario: "T2", owner: "Jordan Kim",     source: "AI Ops",       freshness: "T2", state: "validated" },
  { id: "CR-219",                  type: "Change Request", version: "v1",  branch: "release/2.4",              baseline: "release/2.4",       scenario: "T2", owner: "Marcus Lee",     source: "Change Mgmt",  freshness: "T2", state: "validated" },
  { id: "APR-RTL-024",             type: "Approval",       version: "v1",  branch: "release/2.4",              baseline: "RTL-BL-2.4.7",      scenario: "T2", owner: "Priya Nair",     source: "Approvals",    freshness: "T2", state: "validated" },
  { id: "PKG-RTL-MANIFEST",        type: "Package Item",   version: "d1",  branch: "release/2.4",              baseline: "Not released",      scenario: "T2", owner: "Marcus Lee",     source: "Release Mgmt", freshness: "T2", state: "warning" },
];

type MismatchKind = "wrong-rtl" | "wrong-req" | "wrong-branch" | "stale-dv" | "missing-owner" | "scenario-conflict";
const MISMATCH_OPTIONS: { id: MismatchKind; label: string; effect: string; blocking: boolean; affected: number; owner: string; }[] = [
  { id: "wrong-rtl",         label: "Wrong RTL baseline",              effect: "Sim results and coverage would map to a different RTL configuration.",    blocking: true,  affected: 47, owner: "Mei Lin" },
  { id: "wrong-req",         label: "Wrong requirement baseline",      effect: "RTL and tests would validate obsolete engineering intent.",               blocking: true,  affected: 63, owner: "Priya Nair" },
  { id: "wrong-branch",      label: "Wrong branch",                    effect: "Reviewers see commits outside the active release.",                       blocking: true,  affected: 12, owner: "Marcus Lee" },
  { id: "stale-dv",          label: "Stale verification result",       effect: "A passing regression predates the current RTL baseline.",                 blocking: false, affected: 8,  owner: "Arjun Rao" },
  { id: "missing-owner",     label: "Missing owner",                   effect: "Artifact accountability is undefined and cannot be approved.",             blocking: false, affected: 3,  owner: "Priya Nair" },
  { id: "scenario-conflict", label: "Scenario conflict",               effect: "Evidence bundles combine T2 and T3 records.",                             blocking: true,  affected: 21, owner: "Jordan Kim" },
];

/* -------------------------- Small UI Helpers -------------------------- */

function StateBadge({ state, label }: { state: IntegrityState | string; label?: string }) {
  const map: Record<string, { bg: string; fg: string; text: string; Icon: React.ComponentType<{ className?: string }> }> = {
    validated: { bg: "hsl(var(--avep-pass-soft))", fg: "hsl(var(--avep-pass))", text: label ?? "Validated", Icon: CheckCircle2 },
    warning:   { bg: "hsl(var(--avep-warn-soft))", fg: "hsl(var(--avep-warn))", text: label ?? "Warning",   Icon: AlertTriangle },
    blocking:  { bg: "hsl(var(--avep-fail-soft))", fg: "hsl(var(--avep-fail))", text: label ?? "Blocking",  Icon: XCircle },
    stale:     { bg: "hsl(var(--avep-warn-soft))", fg: "hsl(var(--avep-warn))", text: label ?? "Stale",     Icon: Clock },
    missing:   { bg: "hsl(var(--avep-fail-soft))", fg: "hsl(var(--avep-fail))", text: label ?? "Missing",   Icon: XCircle },
  };
  const it = map[state] ?? map.validated;
  const Icon = it.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: it.bg, color: it.fg, fontSize: "var(--avep-text-2xs)", fontWeight: 600, letterSpacing: "var(--avep-tracking-wide)" }}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {it.text}
    </span>
  );
}

function LockBadge({ lock }: { lock: LockState }) {
  const map = {
    locked:     { text: "Locked",             bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))", Icon: Lock },
    selectable: { text: "Selectable",         bg: "hsl(var(--avep-info-soft))",     fg: "hsl(var(--avep-info))",             Icon: GitBranch },
    scenario:   { text: "Scenario Controlled", bg: "hsl(var(--avep-ai-soft))",      fg: "hsl(var(--avep-ai))",               Icon: Sparkles },
  } as const;
  const it = map[lock];
  const Icon = it.Icon;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: it.bg, color: it.fg, fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
      <Icon className="h-3 w-3" aria-hidden /> {it.text}
    </span>
  );
}

function Card({ title, subtitle, children, actions, id }: {
  title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode; id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-xl border overflow-hidden"
      style={{
        background: "hsl(var(--avep-surface))",
        borderColor: "hsl(var(--avep-border))",
        boxShadow: "var(--avep-shadow-xs)",
      }}
    >
      <header
        className="flex items-start justify-between gap-3 px-4 py-3 border-b"
        style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}
      >
        <div className="min-w-0">
          <h2 className="font-semibold" style={{ fontSize: "var(--avep-text-md)", color: "hsl(var(--avep-foreground))" }}>{title}</h2>
          {subtitle && <p style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Button({ children, onClick, variant = "secondary", size = "sm", disabled, title, type = "button", ariaLabel }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger" | "warn";
  size?: "sm" | "md"; disabled?: boolean; title?: string; type?: "button" | "submit"; ariaLabel?: string;
}) {
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: "hsl(var(--avep-primary))",         color: "hsl(var(--avep-primary-foreground))", border: "1px solid hsl(var(--avep-primary))" },
    secondary: { background: "hsl(var(--avep-surface))",         color: "hsl(var(--avep-foreground))",         border: "1px solid hsl(var(--avep-border))" },
    ghost:     { background: "transparent",                       color: "hsl(var(--avep-foreground-muted))",   border: "1px solid transparent" },
    danger:    { background: "hsl(var(--avep-fail))",             color: "#fff",                                 border: "1px solid hsl(var(--avep-fail))" },
    warn:      { background: "hsl(var(--avep-warn-soft))",        color: "hsl(var(--avep-warn))",                border: "1px solid hsl(var(--avep-warn))" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
      style={{
        ...variants[variant],
        fontSize: size === "sm" ? "var(--avep-text-xs)" : "var(--avep-text-sm)",
        padding: size === "sm" ? "5px 10px" : "7px 12px",
        fontWeight: 500,
        boxShadow: variant === "primary" ? "var(--avep-shadow-xs)" : undefined,
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Main Page ------------------------------ */

export function ProgramWorkspace() {
  const [branch, setBranch] = useState("feature/descriptor-ring-fix");
  const [baseline, setBaseline] = useState("BL-DDMAC-2.4-T2");
  const [compare, setCompare] = useState(false);
  const [mismatch, setMismatch] = useState<MismatchKind | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [artifactSearch, setArtifactSearch] = useState("");
  const [artifactType, setArtifactType] = useState<string>("all");
  const [selectedPropNode, setSelectedPropNode] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ open: boolean; kind: string; id: string; title: string } | null>(null);

  const activeMismatch = mismatch ? MISMATCH_OPTIONS.find(m => m.id === mismatch)! : null;

  const checks = useMemo<ValidationCheck[]>(() => {
    if (!activeMismatch) return BASE_CHECKS;
    const overlay = [...BASE_CHECKS];
    switch (activeMismatch.id) {
      case "wrong-rtl":         overlay[4] = { ...overlay[4], state: "blocking", note: "Register baseline diverges from RTL baseline" }; break;
      case "wrong-req":         overlay[3] = { ...overlay[3], state: "blocking", note: "Requirement baseline diverges from specification" }; break;
      case "wrong-branch":      overlay[5] = { ...overlay[5], state: "blocking", note: "Current branch is not derived from release/2.4" }; break;
      case "stale-dv":          overlay[6] = { ...overlay[6], state: "warning",  note: "Verification results predate current RTL baseline" }; break;
      case "missing-owner":     overlay[10] = { ...overlay[10], state: "warning", note: "Owner missing on one approval" }; break;
      case "scenario-conflict": overlay[8] = { ...overlay[8], state: "blocking", note: "Defects mixed across T2 and T3 scenarios" }; break;
    }
    return overlay;
  }, [activeMismatch]);

  const counts = useMemo(() => {
    const v = checks.filter(c => c.state === "validated").length;
    const w = checks.filter(c => c.state === "warning").length;
    const b = checks.filter(c => c.state === "blocking").length;
    return { v, w, b };
  }, [checks]);

  const integrityScore = useMemo(() => {
    if (counts.b > 0) return Math.max(58, 98.7 - counts.b * 12);
    if (counts.w > 1) return 96.4;
    return 98.7;
  }, [counts]);

  const canContinue = counts.b === 0;

  function runValidation() {
    if (validating) return;
    setValidating(true);
    setValidationStep(0);
    const steps = 8;
    let i = 0;
    const tick = () => {
      i += 1;
      setValidationStep(i);
      if (i < steps) {
        window.setTimeout(tick, 320);
      } else {
        setValidating(false);
        toast.success("Context validated with 2 nonblocking human decisions pending.");
      }
    };
    window.setTimeout(tick, 320);
  }

  function openDrawer(kind: string, id: string, title: string) {
    setDrawer({ open: true, kind, id, title });
  }
  function closeDrawer() { setDrawer(null); }

  function copyLink(label: string) {
    const url = `${window.location.origin}${window.location.pathname}#${label}`;
    if (navigator?.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    toast.success(`Copied deep link to ${label}`);
  }

  function resetDemo() {
    setBranch("feature/descriptor-ring-fix");
    setBaseline("BL-DDMAC-2.4-T2");
    setCompare(false);
    setMismatch(null);
    setArtifactSearch("");
    setArtifactType("all");
    setSelectedPropNode(null);
    toast.success("Reset to T2 canonical context");
  }

  const filteredArtifacts = ARTIFACTS.filter(a => {
    if (artifactType !== "all" && a.type !== artifactType) return false;
    if (!artifactSearch) return true;
    const s = artifactSearch.toLowerCase();
    return a.id.toLowerCase().includes(s) || a.owner.toLowerCase().includes(s) || a.baseline.toLowerCase().includes(s);
  });

  const artifactTypes = Array.from(new Set(ARTIFACTS.map(a => a.type)));

  /* ------------------------------ Render ------------------------------ */

  return (
    <div className="flex flex-col gap-5 pb-8" style={{ color: "hsl(var(--avep-foreground))" }}>

      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              <span>Command & Program</span>
              <ChevronRight className="h-3 w-3" />
              <span>IP Program Workspace</span>
            </div>
            <h1 className="font-semibold" style={{ fontSize: "var(--avep-text-2xl)", letterSpacing: "var(--avep-tracking-tight)" }}>
              Engineering Context Workspace
            </h1>
            <p style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
              Controlled program, IP, branch, baseline, ownership, and milestone context.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StateBadge state={activeMismatch ? (activeMismatch.blocking ? "blocking" : "warning") : "validated"} label={activeMismatch ? (activeMismatch.blocking ? "Context Blocked" : "Context At Risk") : "Context Validated"} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ background: "hsl(var(--avep-ai-soft))", color: "hsl(var(--avep-ai))", fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
              <Sparkles className="h-3 w-3" /> Scenario T2 · AI Assisted Root Cause
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ background: "hsl(var(--avep-surface-muted))", color: "hsl(var(--avep-foreground-muted))", fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
              Synthetic Engineering Data
            </span>
            <Button onClick={resetDemo} variant="ghost" ariaLabel="Reset demo">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
            </Button>
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 rounded-lg border"
          style={{ background: "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))" }}
        >
          {[
            { l: "Program",       v: "Project Aegis" },
            { l: "Target SoC",    v: "Aegis Network Processing SoC" },
            { l: "IP",            v: "DDMAC 2.4", mono: true },
            { l: "Branch",        v: branch, mono: true },
            { l: "Baseline",      v: baseline, mono: true },
            { l: "Milestone",     v: "RTL Remediation Review" },
            { l: "Scenario",      v: "T2" },
            { l: "Integrity",     v: `${integrityScore.toFixed(1)}%`, mono: true },
          ].map((s, i, arr) => (
            <div key={s.l} className="flex items-center gap-2">
              <div className="flex flex-col leading-tight">
                <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>{s.l}</span>
                <span
                  className={s.mono ? "avep-mono" : ""}
                  style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}
                >{s.v}</span>
              </div>
              {i < arr.length - 1 && <span className="mx-1 h-6 w-px" style={{ background: "hsl(var(--avep-border))" }} />}
            </div>
          ))}
        </div>
      </header>

      {/* Screen Context Panel */}
      <section
        className="rounded-xl border p-4"
        style={{ background: "hsl(var(--avep-primary-soft))", borderColor: "hsl(var(--avep-border))" }}
      >
        <div className="grid gap-3 md:grid-cols-5">
          {[
            { title: "Purpose", body: "Establish the controlled program and IP context that governs every engineering artifact, result, recommendation, and decision." },
            { title: "Engineering Problem", body: "Context is distributed across program tools, Git, release systems, requirements repos, engineering documents, EDA outputs, and issue records. Engineers can unknowingly review or approve the wrong version." },
            { title: "Decision Supported", body: "Determine whether the active program, IP, branch, baseline, milestone, ownership, and scenario are internally consistent and safe for downstream work." },
            { title: "Expected Outcome", body: "One validated engineering context used by requirements, specification, architecture, RTL, verification, simulation, debug, coverage, approvals, and handoff." },
            { title: "Demonstration Storyline", body: "Every artifact and AI action belongs to the correct IP, version, baseline, owner, and scenario. Program and release management validate that context before work advances." },
          ].map(x => (
            <div key={x.title}>
              <div className="mb-1 font-semibold" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-primary))", letterSpacing: "var(--avep-tracking-wide)", textTransform: "uppercase" }}>{x.title}</div>
              <p style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))", lineHeight: "var(--avep-leading-relaxed)" }}>{x.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Primary metrics">
        <MetricCard label="Context Integrity"          value={`${integrityScore.toFixed(1)}%`}      status={activeMismatch?.blocking ? "blocking" : counts.w > 0 ? "warning" : "validated"} sub={`${counts.w} nonblocking ${counts.w === 1 ? "warning" : "warnings"}${counts.b ? ` · ${counts.b} blocking` : ""}`} onClick={() => openDrawer("integrity", "context-integrity", "Context Integrity")} />
        <MetricCard label="Active Engineering Baseline" value={baseline}       status="validated" sub="Approved requirement & architecture lineage" mono onClick={() => openDrawer("baseline", baseline, "Active Engineering Baseline")} />
        <MetricCard label="Current Branch"              value={branch}         status={activeMismatch?.id === "wrong-branch" ? "blocking" : "validated"} sub="3 commits ahead of release/2.4" mono onClick={() => openDrawer("branch", branch, "Current Branch")} />
        <MetricCard label="Current Milestone"           value="RTL Remediation Review" status="warning" sub="In progress · scenario controlled" onClick={() => openDrawer("milestone", "rtl-remediation-review", "Current Milestone")} />
        <MetricCard label="Required Context Decisions"  value="2"              status="warning" sub="Release manager & verification lead" onClick={() => openDrawer("decisions", "pending", "Required Context Decisions")} />
      </section>

      {/* Three column workspace */}
      <section className="grid gap-4 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card
            title="Canonical Program Context"
            subtitle="Values governing every artifact and decision in this program"
            actions={
              <>
                <Button onClick={() => setCompare(v => !v)} title="Compare baselines">
                  <Tag className="h-3.5 w-3.5" /> {compare ? "Exit Compare" : "Compare Baseline"}
                </Button>
                <Button onClick={() => openDrawer("lineage", "context", "Context Lineage")} ariaLabel="View lineage">
                  <GitBranch className="h-3.5 w-3.5" /> Lineage
                </Button>
                <Button onClick={() => copyLink("context")} ariaLabel="Copy context deep link"><Copy className="h-3.5 w-3.5" /></Button>
              </>
            }
          >
            <div className="flex flex-col divide-y" style={{ borderColor: "hsl(var(--avep-border))" }}>
              {CONTEXT_ROWS.map((r) => (
                <div key={r.key} className="grid grid-cols-[110px_1fr_auto] gap-2 py-2 items-start"
                  style={{ borderColor: "hsl(var(--avep-border))" }}
                >
                  <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
                    {r.label}
                  </div>
                  <div className="min-w-0">
                    {r.key === "branch" ? (
                      <select
                        value={branch}
                        onChange={(e) => { setBranch(e.target.value); toast.success(`Local comparison branch set to ${e.target.value}`); }}
                        className="avep-mono w-full rounded border px-2 py-1"
                        style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}
                        aria-label="Select branch"
                      >
                        <option>feature/descriptor-ring-fix</option>
                        <option>release/2.4</option>
                        <option>release/2.3</option>
                        <option>main</option>
                      </select>
                    ) : r.key === "rtl-bl" ? (
                      <select
                        value={baseline === "BL-DDMAC-2.4-T2" ? "RTL-BL-2.4.7" : baseline}
                        onChange={(e) => { setBaseline(e.target.value); toast.success(`Local comparison baseline set to ${e.target.value}`); }}
                        className="avep-mono w-full rounded border px-2 py-1"
                        style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}
                        aria-label="Select RTL baseline"
                      >
                        <option>RTL-BL-2.4.7</option>
                        <option>RTL-BL-2.4.6</option>
                        <option>RTL-BL-2.4.5</option>
                      </select>
                    ) : (
                      <div className={r.mono ? "avep-mono" : ""} style={{ fontSize: "var(--avep-text-sm)", fontWeight: 500, wordBreak: "break-word" }}>
                        {r.value}
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                      <span>{r.source}</span>
                      <span>·</span>
                      <span>{r.freshness}</span>
                      <span>·</span>
                      <span title={`Owner: ${r.owner}`}>{r.owner}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <LockBadge lock={r.lock} />
                    <StateBadge state={r.state} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <BranchLineageCard
            compare={compare}
            onCompareToggle={() => setCompare(v => !v)}
            branch={branch}
            onOpenNode={(kind, id, title) => openDrawer(kind, id, title)}
          />

          <Card
            title="Context Propagation Across Engineering Artifacts"
            subtitle="Every artifact resolves to one canonical program, IP, version, branch, baseline, scenario, owner, and team."
          >
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {PROPAGATION.map(n => {
                const Icon = n.icon;
                const active = selectedPropNode === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedPropNode(active ? null : n.id)}
                    className="text-left rounded-md border p-2.5 hover:opacity-95 transition"
                    style={{
                      background: active ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface))",
                      borderColor: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))",
                    }}
                    aria-pressed={active}
                    aria-label={`Filter artifacts by ${n.label}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>
                        <Icon className="h-3.5 w-3.5" />
                        <span style={{ fontSize: "var(--avep-text-xs)", fontWeight: 600, color: "hsl(var(--avep-foreground))" }}>{n.label}</span>
                      </div>
                      <StateBadge state={n.state} label={n.state === "warning" ? `${n.mismatches || 0} pending` : "OK"} />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="avep-mono" style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700 }}>{n.count}</span>
                      <span className="avep-mono" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{n.baseline}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card
            title="Context Validation"
            actions={
              <Button variant="primary" onClick={runValidation} disabled={validating} ariaLabel="Run context validation">
                <Play className="h-3.5 w-3.5" />
                {validating ? "Validating…" : "Run Validation"}
              </Button>
            }
          >
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              <ValSummary label="Validated" value={counts.v} tone="validated" />
              <ValSummary label="Warnings" value={counts.w} tone="warning" />
              <ValSummary label="Blocking" value={counts.b} tone="blocking" />
            </div>
            {validating && (
              <div className="mb-3 rounded-md border p-2"
                style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-info-soft))" }}>
                <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-info))", fontWeight: 600 }}>
                  Step {validationStep} / 8
                </div>
                <div style={{ fontSize: "var(--avep-text-xs)" }}>
                  {[
                    "Program identity", "Version compatibility", "Branch ancestry",
                    "Baseline reconciliation", "Ownership completeness", "Scenario consistency",
                    "Evidence freshness", "Approval alignment",
                  ][Math.min(validationStep, 7)]}…
                </div>
              </div>
            )}
            <ul className="flex flex-col divide-y" style={{ borderColor: "hsl(var(--avep-border))" }}>
              {checks.map(c => (
                <li key={c.id} className="py-2 flex items-start gap-2">
                  <div className="mt-0.5">
                    {c.state === "validated" && <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-pass))" }} />}
                    {c.state === "warning"   && <AlertTriangle className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-warn))" }} />}
                    {c.state === "blocking"  && <XCircle className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-fail))" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div style={{ fontSize: "var(--avep-text-xs)", fontWeight: 500 }}>{c.label}</div>
                    <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{c.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Context Decision Authority" subtitle="Program and release management retain approval authority.">
            <ul className="flex flex-col gap-2.5">
              {AUTHORITIES.map(a => (
                <li key={a.role} className="rounded-md border p-2"
                  style={{ borderColor: "hsl(var(--avep-border))", background: a.state === "pending" ? "hsl(var(--avep-warn-soft))" : "hsl(var(--avep-surface))" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div style={{ fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>{a.role}</div>
                      <div className="flex items-center gap-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                        <UserIcon className="h-3 w-3" /> {a.name}
                      </div>
                    </div>
                    <StateBadge state={a.state === "pending" ? "warning" : "validated"} label={a.state === "pending" ? "Pending" : "Acknowledged"} />
                  </div>
                  <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{a.responsibility}</div>
                  {a.state === "pending" && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Button size="sm" onClick={() => { toast.success(`Opened review for ${a.name}`); openDrawer("authority", a.role, `${a.role} · ${a.name}`); }}>Open Review</Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.info(`Requested clarification from ${a.name}`)}>Clarify</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2 rounded-md border p-2"
              style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-ai-soft))" }}>
              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 mt-0.5" style={{ color: "hsl(var(--avep-ai))" }} />
                <p style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                  AI may validate consistency and identify discrepancies. Program and release management retain approval authority.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Standards */}
      <Card
        title="Applicable Engineering Standards and Methodologies"
        subtitle="Standards governing this program. AXI4 is the canonical primary data path; APB4 is the canonical control interface."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ background: "hsl(var(--avep-surface-muted))" }}>
                {["Standard or Method","Category","Applies To","Version","Source","Owner","State",""].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: "hsl(var(--avep-foreground-muted))", borderBottom: "1px solid hsl(var(--avep-border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STANDARDS.map((s) => (
                <tr key={s.std} className="hover:bg-black/[0.02]" style={{ borderBottom: "1px solid hsl(var(--avep-border))" }}>
                  <td className="px-3 py-2 font-medium">{s.std}</td>
                  <td className="px-3 py-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{s.cat}</td>
                  <td className="px-3 py-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{s.applies}</td>
                  <td className="px-3 py-2 avep-mono">{s.ver}</td>
                  <td className="px-3 py-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{s.src}</td>
                  <td className="px-3 py-2">{s.owner}</td>
                  <td className="px-3 py-2"><StateBadge state={s.state} /></td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="ghost" onClick={() => openDrawer("standard", s.std, s.std)}>
                      Evidence <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Artifacts */}
      <Card
        title="Artifact Context Reconciliation"
        subtitle="Every artifact belongs to the canonical program, IP, version, branch, baseline, scenario, and owner."
        actions={
          <>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
              <input
                value={artifactSearch}
                onChange={(e) => setArtifactSearch(e.target.value)}
                placeholder="Search ID, owner, baseline"
                aria-label="Search artifacts"
                className="rounded-md border pl-7 pr-2 py-1"
                style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)", height: 28, width: 220 }}
              />
            </div>
            <select
              value={artifactType}
              onChange={(e) => setArtifactType(e.target.value)}
              aria-label="Filter by type"
              className="rounded-md border px-2 py-1"
              style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)", height: 28 }}
            >
              <option value="all">All types</option>
              {artifactTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button onClick={() => toast.success("Context report prepared for preview")}>
              <FileText className="h-3.5 w-3.5" /> Preview Context Report
            </Button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ background: "hsl(var(--avep-surface-muted))" }}>
                {["Artifact","Type","Version","Branch","Baseline","Scenario","Owner","Source","Freshness","State",""].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: "hsl(var(--avep-foreground-muted))", borderBottom: "1px solid hsl(var(--avep-border))" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredArtifacts.map(a => (
                <tr key={a.id} className="hover:bg-black/[0.02]" style={{ borderBottom: "1px solid hsl(var(--avep-border))" }}>
                  <td className="px-3 py-2 avep-mono font-medium">{a.id}</td>
                  <td className="px-3 py-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{a.type}</td>
                  <td className="px-3 py-2 avep-mono">{a.version}</td>
                  <td className="px-3 py-2 avep-mono" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{a.branch}</td>
                  <td className="px-3 py-2 avep-mono">{a.baseline}</td>
                  <td className="px-3 py-2">{a.scenario}</td>
                  <td className="px-3 py-2">{a.owner}</td>
                  <td className="px-3 py-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{a.source}</td>
                  <td className="px-3 py-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{a.freshness}</td>
                  <td className="px-3 py-2"><StateBadge state={a.state} /></td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="ghost" onClick={() => openDrawer("artifact", a.id, a.id)}>
                      Open <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredArtifacts.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-6 text-center" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>
                    No artifacts match the current filters. Local deterministic demonstration data is being used.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mismatch simulation */}
      <Card
        title="Simulate Context Mismatch"
        subtitle="Simulated demonstration action. Canonical data is not mutated."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="grid gap-2 sm:grid-cols-2">
              {MISMATCH_OPTIONS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMismatch(m.id); toast.warning(`Simulating: ${m.label}`); }}
                  className="text-left rounded-md border p-2.5"
                  style={{
                    background: mismatch === m.id ? "hsl(var(--avep-warn-soft))" : "hsl(var(--avep-surface))",
                    borderColor: mismatch === m.id ? "hsl(var(--avep-warn))" : "hsl(var(--avep-border))",
                    fontSize: "var(--avep-text-xs)",
                  }}
                  aria-pressed={mismatch === m.id}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontWeight: 600 }}>{m.label}</span>
                    <StateBadge state={m.blocking ? "blocking" : "warning"} label={m.blocking ? "Blocking" : "Warning"} />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Button variant="ghost" onClick={() => { setMismatch(null); toast.success("Restored canonical context"); }} disabled={!mismatch}>
                <RotateCcw className="h-3.5 w-3.5" /> Restore Valid Context
              </Button>
            </div>
          </div>
          <div
            className="rounded-md border p-3"
            style={{ background: activeMismatch ? "hsl(var(--avep-warn-soft))" : "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" style={{ color: activeMismatch ? "hsl(var(--avep-warn))" : "hsl(var(--avep-foreground-subtle))" }} />
              <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>
                {activeMismatch ? `Simulated: ${activeMismatch.label}` : "No mismatch active"}
              </div>
            </div>
            {activeMismatch ? (
              <div className="flex flex-col gap-1.5" style={{ fontSize: "var(--avep-text-xs)" }}>
                <p style={{ color: "hsl(var(--avep-foreground-muted))" }}>{activeMismatch.effect}</p>
                <ul className="flex flex-col gap-1 mt-1">
                  <li><b>Affected artifacts:</b> <span className="avep-mono">{activeMismatch.affected}</span></li>
                  <li><b>Decision owner:</b> {activeMismatch.owner}</li>
                  <li><b>Downstream screens:</b> Simulation, Coverage, Signoff — marked at risk</li>
                  <li><b>Continue action:</b> {activeMismatch.blocking ? "Disabled" : "Enabled with conditions"}</li>
                  <li><b>Audit:</b> Simulated overlay recorded</li>
                </ul>
              </div>
            ) : (
              <p style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                Select a mismatch to overlay a simulated context defect. Overlays are reversible and never mutate the canonical program state.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Impact callout */}
      <Card title="Why Context Integrity Matters">
        <div className="grid gap-3 md:grid-cols-5">
          {[
            { t: "Wrong branch",              b: "Engineers may review code that is not part of the active release." },
            { t: "Wrong requirement baseline", b: "RTL and tests may validate obsolete engineering intent." },
            { t: "Wrong register baseline",    b: "Hardware and software visible contracts may diverge." },
            { t: "Wrong verification result",  b: "A passing regression may belong to a different RTL configuration." },
            { t: "Wrong scenario",             b: "Defects, AI analyses, coverage, and approvals may be interpreted incorrectly." },
          ].map(x => (
            <div key={x.t} className="rounded-md border p-2.5"
              style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}>
              <div style={{ fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>{x.t}</div>
              <p style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 4 }}>{x.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ImpactChain />
        </div>
      </Card>

      {/* Decision area */}
      <section
        id="advancement-decision"
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{
          background: canContinue ? "hsl(var(--avep-pass-soft))" : "hsl(var(--avep-fail-soft))",
          borderColor: canContinue ? "hsl(var(--avep-pass))" : "hsl(var(--avep-fail))",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: canContinue ? "hsl(var(--avep-pass))" : "hsl(var(--avep-fail))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
              Context Advancement Decision
            </div>
            <h2 className="font-semibold" style={{ fontSize: "var(--avep-text-xl)" }}>
              {canContinue ? "Safe to Continue with Conditions" : `Blocked · ${activeMismatch?.label ?? "Context Integrity Failure"}`}
            </h2>
            <ul className="mt-1.5 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              <li>· Verification lead confirms DV baseline alignment</li>
              <li>· Release manager approves active release configuration</li>
              {!canContinue && activeMismatch && <li>· {activeMismatch.effect}</li>}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={runValidation}><ShieldCheck className="h-3.5 w-3.5" /> Validate Context</Button>
            <Button onClick={() => toast.success("Review requested from decision authorities")}>Request Review</Button>
            <Button variant="warn" onClick={() => toast.info("Engineering work placed on hold")}>Hold Engineering Work</Button>
            <Button onClick={() => openDrawer("briefing", "context", "Decision Briefing")}>Open Decision Briefing</Button>
            <Button variant="primary" onClick={() => toast.success("Advanced to Program Timeline")} disabled={!canContinue}>
              Continue to Program Timeline <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Provenance footer */}
      <footer
        className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-3"
        style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))" }}
      >
        <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
          {AVEP_IDENTITY.shortName} · Demonstration environment using synthetic engineering data structured around established digital design and verification practices.
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            ["Seed", "AVEP-SEED-2026.07.15.1"],
            ["App Version", "AVEP 0B"],
            ["Provenance", "Deterministic"],
            ["Limitations", "No live tool integration"],
            ["Scope", "No physical design or manufacturing"],
            ["Foundation", "0A · 0B complete"],
          ].map(([l, v]) => (
            <button
              key={l}
              onClick={() => toast.info(`${l}: ${v}`)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border"
              style={{ background: "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}
              aria-label={`${l}: ${v}`}
            >
              <Info className="h-3 w-3" /> {l}: <span className="avep-mono">{v}</span>
            </button>
          ))}
        </div>
      </footer>

      {/* Entity Detail Drawer */}
      {drawer?.open && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={closeDrawer}
          role="dialog"
          aria-modal="true"
          aria-label={`Entity detail: ${drawer.title}`}
        >
          <div className="absolute inset-0" style={{ background: "hsl(var(--avep-foreground) / 0.35)" }} />
          <aside
            className="relative w-full max-w-md h-full overflow-y-auto"
            style={{ background: "hsl(var(--avep-surface))", borderLeft: "1px solid hsl(var(--avep-border))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 flex items-center justify-between px-4 py-3 border-b"
              style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))" }}>
              <div>
                <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
                  {drawer.kind}
                </div>
                <div style={{ fontSize: "var(--avep-text-md)", fontWeight: 600 }}>{drawer.title}</div>
              </div>
              <Button variant="ghost" onClick={closeDrawer} ariaLabel="Close drawer">Close</Button>
            </header>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {["Summary","Relationships","Telemetry","History","Evidence","AI Analysis","Audit"].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded border"
                    style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", background: t === "Summary" ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface-muted))" }}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="rounded-md border p-3" style={{ borderColor: "hsl(var(--avep-border))" }}>
                <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>Canonical ID</div>
                <div className="avep-mono" style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{drawer.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2" style={{ fontSize: "var(--avep-text-xs)" }}>
                <DrawerField label="Program" value="Project Aegis" />
                <DrawerField label="IP" value="DDMAC 2.4" mono />
                <DrawerField label="Branch" value={branch} mono />
                <DrawerField label="Baseline" value={baseline} mono />
                <DrawerField label="Scenario" value="T2" />
                <DrawerField label="Frozen Time" value="2026-07-15 14:30 UTC" mono />
                <DrawerField label="Owner" value="Priya Nair" />
                <DrawerField label="Synthetic" value="Yes" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button onClick={() => { navigator?.clipboard?.writeText(drawer.id); toast.success("Copied canonical ID"); }}>
                  <Copy className="h-3.5 w-3.5" /> Copy ID
                </Button>
                <Button onClick={() => copyLink(drawer.id)}>Deep Link</Button>
                <Button onClick={() => toast.info("Opening owning screen")}>Open Screen</Button>
                <Button onClick={() => toast.info("Provenance opened")}>Provenance</Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Sub-components --------------------------- */

function MetricCard({ label, value, status, sub, mono, onClick }: {
  label: string; value: string; status: IntegrityState; sub: string; mono?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border p-3 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2"
      style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", boxShadow: "var(--avep-shadow-xs)" }}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)", fontWeight: 600 }}>
          {label}
        </div>
        <StateBadge state={status} />
      </div>
      <div className={`mt-2 ${mono ? "avep-mono" : ""}`} style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700, letterSpacing: "var(--avep-tracking-tight)" }}>
        {value}
      </div>
      <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{sub}</div>
    </button>
  );
}

function ValSummary({ label, value, tone }: { label: string; value: number; tone: IntegrityState }) {
  const map: Record<string, { bg: string; fg: string }> = {
    validated: { bg: "hsl(var(--avep-pass-soft))", fg: "hsl(var(--avep-pass))" },
    warning:   { bg: "hsl(var(--avep-warn-soft))", fg: "hsl(var(--avep-warn))" },
    blocking:  { bg: "hsl(var(--avep-fail-soft))", fg: "hsl(var(--avep-fail))" },
    stale:     { bg: "hsl(var(--avep-warn-soft))", fg: "hsl(var(--avep-warn))" },
    missing:   { bg: "hsl(var(--avep-fail-soft))", fg: "hsl(var(--avep-fail))" },
  };
  const it = map[tone];
  return (
    <div className="rounded-md text-center py-1.5" style={{ background: it.bg, color: it.fg }}>
      <div className="avep-mono" style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>{label}</div>
    </div>
  );
}

function DrawerField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border p-2" style={{ borderColor: "hsl(var(--avep-border))" }}>
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>{label}</div>
      <div className={mono ? "avep-mono" : ""} style={{ fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function BranchLineageCard({ compare, onCompareToggle, branch, onOpenNode }: {
  compare: boolean; onCompareToggle: () => void; branch: string;
  onOpenNode: (kind: string, id: string, title: string) => void;
}) {
  const commits = [
    { id: "c81a45f", label: "Release 2.4 baseline",       branch: "release/2.4", x: 200, y: 130, tag: "v2.4-rtl-baseline" },
    { id: "aa14b2d", label: "Descriptor wrap test update", branch: "feature",     x: 320, y: 60 },
    { id: "f77c919", label: "Pointer commit logic",        branch: "feature",     x: 440, y: 60 },
    { id: "e12d4ab", label: "Assertion update",            branch: "feature",     x: 560, y: 60, tag: "T2-analysis-context" },
  ];
  const baselineNodes = [
    { id: "REQ-BL-2026.07.15", label: "Requirement Baseline", x: 620, y: 200 },
    { id: "SPEC-BL-2.4.3",     label: "Specification Baseline", x: 620, y: 240 },
    { id: "ARCH-BL-2.4.2",     label: "Architecture Baseline", x: 620, y: 280 },
    { id: "RDL-BL-2.4.5",      label: "Register Baseline",     x: 620, y: 320 },
    { id: "RTL-BL-2.4.7",      label: "RTL Baseline",          x: 620, y: 360 },
    { id: "DV-BL-2.4.6",       label: "Verification Baseline", x: 620, y: 400 },
  ];
  return (
    <Card
      title="Branch and Baseline Lineage"
      subtitle="Commits, tags, baselines, and approvals for the active release path."
      actions={
        <>
          <label className="inline-flex items-center gap-1.5" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            <input type="checkbox" checked={compare} onChange={onCompareToggle} aria-label="Toggle comparison view" />
            Compare vs release/2.4
          </label>
        </>
      }
    >
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 740 440" width="100%" height="360" role="img"
          aria-label="Branch and baseline lineage graph showing main, release/2.3, release/2.4, and feature/descriptor-ring-fix with related baselines">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--avep-foreground-muted))" />
            </marker>
          </defs>
          {/* branch lines */}
          <line x1="20" y1="200" x2="700" y2="200" stroke="hsl(var(--avep-border-strong))" strokeWidth="2" />
          <line x1="20" y1="130" x2="700" y2="130" stroke="hsl(var(--avep-border))" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="180" y1="60"  x2="640" y2="60"  stroke="hsl(var(--avep-info))" strokeWidth="2" />
          <line x1="180" y1="130" x2="180" y2="60"  stroke="hsl(var(--avep-info))" strokeWidth="2" />
          {/* labels */}
          <text x="20" y="52"  fontSize="10" fill="hsl(var(--avep-info))" fontFamily="var(--avep-font-mono)">feature/descriptor-ring-fix</text>
          <text x="20" y="122" fontSize="10" fill="hsl(var(--avep-foreground-muted))" fontFamily="var(--avep-font-mono)">release/2.4</text>
          <text x="20" y="192" fontSize="10" fill="hsl(var(--avep-foreground-muted))" fontFamily="var(--avep-font-mono)">main</text>
          {/* main commits */}
          <circle cx="80" cy="200" r="6" fill="hsl(var(--avep-foreground-muted))" />
          <circle cx="140" cy="200" r="6" fill="hsl(var(--avep-foreground-muted))" />
          <text x="80" y="220" fontSize="9" fill="hsl(var(--avep-foreground-subtle))" fontFamily="var(--avep-font-mono)">v2.3-approved</text>
          {/* release 2.4 base */}
          <g onClick={() => onOpenNode("commit", "c81a45f", "c81a45f · Release 2.4 baseline")} style={{ cursor: "pointer" }}>
            <circle cx="200" cy="130" r="8" fill="hsl(var(--avep-primary))" />
            <text x="200" y="115" fontSize="9" fill="hsl(var(--avep-foreground))" fontFamily="var(--avep-font-mono)" textAnchor="middle">c81a45f</text>
            <text x="200" y="150" fontSize="9" fill="hsl(var(--avep-foreground-muted))" textAnchor="middle">Release 2.4 baseline</text>
          </g>
          {/* feature commits */}
          {commits.slice(1).map(c => (
            <g key={c.id} onClick={() => onOpenNode("commit", c.id, `${c.id} · ${c.label}`)} style={{ cursor: "pointer" }}>
              <circle cx={c.x} cy={c.y} r="7" fill="hsl(var(--avep-info))" />
              <text x={c.x} y={c.y - 12} fontSize="9" fill="hsl(var(--avep-foreground))" fontFamily="var(--avep-font-mono)" textAnchor="middle">{c.id}</text>
              <text x={c.x} y={c.y + 20} fontSize="9" fill="hsl(var(--avep-foreground-muted))" textAnchor="middle">{c.label}</text>
              {c.tag && (
                <g>
                  <rect x={c.x - 42} y={c.y + 26} width="84" height="14" rx="3" fill="hsl(var(--avep-ai-soft))" />
                  <text x={c.x} y={c.y + 36} fontSize="8" fill="hsl(var(--avep-ai))" textAnchor="middle" fontFamily="var(--avep-font-mono)">{c.tag}</text>
                </g>
              )}
            </g>
          ))}
          {/* approval diamond */}
          <g onClick={() => onOpenNode("approval", "APR-RTL-024", "APR-RTL-024 · RTL Approval")} style={{ cursor: "pointer" }}>
            <polygon points="200,340 220,360 200,380 180,360" fill="hsl(var(--avep-ai-soft))" stroke="hsl(var(--avep-ai))" />
            <text x="200" y="405" fontSize="9" fill="hsl(var(--avep-ai))" textAnchor="middle" fontFamily="var(--avep-font-mono)">APR-RTL-024</text>
          </g>
          {/* scenario hexagon */}
          <g onClick={() => onOpenNode("scenario", "T2", "Scenario T2 · AI Assisted Root Cause")} style={{ cursor: "pointer" }}>
            <polygon points="80,340 100,330 120,340 120,360 100,370 80,360" fill="hsl(var(--avep-primary-soft))" stroke="hsl(var(--avep-primary))" />
            <text x="100" y="355" fontSize="9" fill="hsl(var(--avep-primary))" textAnchor="middle" fontFamily="var(--avep-font-mono)">T2</text>
          </g>
          {/* baseline rectangles */}
          {baselineNodes.map(b => (
            <g key={b.id} onClick={() => onOpenNode("baseline", b.id, `${b.id} · ${b.label}`)} style={{ cursor: "pointer" }}>
              <rect x={b.x - 60} y={b.y - 10} width="120" height="22" rx="6" fill="hsl(var(--avep-surface-muted))" stroke="hsl(var(--avep-border))" />
              <text x={b.x} y={b.y + 4} fontSize="9" fill="hsl(var(--avep-foreground))" textAnchor="middle" fontFamily="var(--avep-font-mono)">{b.id}</text>
            </g>
          ))}
          {/* linking commits to baseline stack */}
          <path d="M 560 60 Q 620 60 620 180" fill="none" stroke="hsl(var(--avep-border-strong))" strokeWidth="1" markerEnd="url(#arrow)" />
          {compare && (
            <g>
              <rect x="180" y="14" width="450" height="20" rx="4" fill="hsl(var(--avep-warn-soft))" />
              <text x="405" y="28" fontSize="10" fill="hsl(var(--avep-warn))" textAnchor="middle">Compare · feature branch is 3 commits ahead of release/2.4</text>
            </g>
          )}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
        {["Requirements","Architecture","RTL","Verification","Approvals","Scenario Events"].map(f => (
          <span key={f} className="px-2 py-0.5 rounded border"
            style={{ background: "hsl(var(--avep-surface-muted))", borderColor: "hsl(var(--avep-border))" }}>{f}</span>
        ))}
      </div>
    </Card>
  );
}

function ImpactChain() {
  const items = ["Context mismatch","Incorrect artifact association","Invalid engineering conclusion","Unsafe approval","Rework or silicon escape risk"];
  return (
    <ol
      className="flex flex-wrap items-center gap-1.5"
      aria-label="Impact chain: how a context mismatch propagates to silicon escape risk"
    >
      {items.map((t, i) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className="rounded-md border px-2 py-1"
            style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface))", fontSize: "var(--avep-text-xs)", fontWeight: 500 }}>
            {t}
          </span>
          {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
        </li>
      ))}
    </ol>
  );
}
