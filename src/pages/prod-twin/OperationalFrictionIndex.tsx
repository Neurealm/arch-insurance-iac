import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Users, Shield, Cloud, Layers, Boxes, Building2, Database, Server,
  AlertTriangle, BellRing, Flame, GitBranch, Eye, Lock, KeyRound,
  Smile, DollarSign, Timer, Scale, Activity, TrendingUp, ArrowRight,
  Sparkles, Workflow, Network, Wrench, Gauge, Target, ChevronRight,
  PackagePlus, Bug, FileWarning, ShieldAlert, Hospital, Rocket,
  Search, BarChart3, Zap, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, LineChart, Line, CartesianGrid,
} from "recharts";

/* ============================================================
   TYPES
============================================================ */
type Severity = "Critical" | "High" | "Moderate" | "Emerging";
type Stage = "Current State" | "Stabilize" | "Standardize" | "Modernize" | "Automate" | "Optimize" | "Scale";

type Challenge = {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  icon: any;
  description: string;
  metric: { value: string; label: string };
  stage: Stage;
  impactScore: number; // 0-100
  currentMaturity: number; // 0-5
  targetMaturity: number; // 0-5
  valueUnlocked: string; // $
  kpis: { label: string; baseline: string; current: string; target: string; forecast: string }[];
  initiatives: string[];
  timeline: string;
  investment: string;
  related: string[];
};

/* ============================================================
   DATA — 42 challenges across 7 stages
============================================================ */
const STAGES: { key: Stage; label: string; sub: string; icon: any }[] = [
  { key: "Current State", label: "Current State", sub: "Fragmented & Reactive", icon: AlertTriangle },
  { key: "Stabilize",     label: "Stabilize",     sub: "Reduce Variability",   icon: Activity },
  { key: "Standardize",   label: "Standardize",   sub: "Build Foundations",    icon: Layers },
  { key: "Modernize",     label: "Modernize",     sub: "Simplify & Migrate",   icon: Sparkles },
  { key: "Automate",      label: "Automate",      sub: "Improve Efficiency",   icon: Workflow },
  { key: "Optimize",      label: "Optimize",      sub: "Drive Value",          icon: Target },
  { key: "Scale",         label: "Scale",         sub: "Enable Growth",        icon: Rocket },
];

const CATEGORIES = [
  {
    id: "exec",
    num: 1,
    title: "Executive & Strategic Alignment",
    desc: "Challenges in strategy clarity, governance, and visibility that limit informed decision making.",
    icon: Users,
    tint: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
  },
  {
    id: "sre",
    num: 2,
    title: "SRE & Organizational Transformation",
    desc: "Cultural and operational maturity gaps preventing modern SRE practices and collaboration.",
    icon: Cloud,
    tint: "#2563eb",
    bg: "rgba(37,99,235,0.06)",
  },
  {
    id: "ma",
    num: 3,
    title: "Transformation & M&A Complexity",
    desc: "Complexity from acquisitions, legacy systems, and fragmented architecture slows modernization.",
    icon: Building2,
    tint: "#059669",
    bg: "rgba(5,150,105,0.06)",
  },
  {
    id: "tech",
    num: 4,
    title: "Technology & Platform Operations",
    desc: "Infrastructure, tools, and data challenges increase complexity and cost.",
    icon: Server,
    tint: "#ea580c",
    bg: "rgba(234,88,12,0.06)",
  },
  {
    id: "sec",
    num: 5,
    title: "Security & Risk Management",
    desc: "Security gaps and compliance risks increase exposure and audit findings.",
    icon: Shield,
    tint: "#0891b2",
    bg: "rgba(8,145,178,0.06)",
  },
  {
    id: "biz",
    num: 6,
    title: "Business Impact & Customer Experience",
    desc: "Operational friction directly impacts customers, cost, and growth.",
    icon: Smile,
    tint: "#db2777",
    bg: "rgba(219,39,119,0.06)",
  },
] as const;

const CHALLENGES: Challenge[] = [
  // 1 — Executive (4)
  { id: "fsd", category: "exec", title: "Lack of Future-State Definition", severity: "Critical", icon: Target,
    description: "No clearly defined target state for SRE, platform, or technology transformation.",
    metric: { value: "23%", label: "Initiatives with defined target state" },
    stage: "Standardize", impactScore: 78, currentMaturity: 1.6, targetMaturity: 4.2, valueUnlocked: "$1.1M",
    kpis: [
      { label: "Defined Target States", baseline: "10%", current: "23%", target: "85%", forecast: "78%" },
      { label: "Strategy Alignment Score", baseline: "32", current: "41", target: "88", forecast: "80" },
    ],
    initiatives: ["Define enterprise target operating model", "Publish reference architectures", "Establish maturity scorecards"],
    timeline: "6 months", investment: "$420K",
    related: ["twg","lev","sim","mom","ttm"] },
  { id: "twg", category: "exec", title: "Transformation Without Governance", severity: "High", icon: Scale,
    description: "Multiple initiatives running without integrated governance or prioritization.",
    metric: { value: "57%", label: "Initiatives lack executive sponsorship" },
    stage: "Standardize", impactScore: 71, currentMaturity: 2.0, targetMaturity: 4.2, valueUnlocked: "$900K",
    kpis: [
      { label: "Governed Initiatives", baseline: "28%", current: "43%", target: "92%", forecast: "85%" },
      { label: "Cross-Portfolio Visibility", baseline: "Low", current: "Partial", target: "Full", forecast: "Full" },
    ],
    initiatives: ["Stand up transformation PMO", "Quarterly portfolio reviews", "Investment governance gates"],
    timeline: "4 months", investment: "$280K",
    related: ["fsd","lev","sim"] },
  { id: "lev", category: "exec", title: "Limited Executive Visibility", severity: "Moderate", icon: Eye,
    description: "Executives lack real-time visibility into service health, risk, and transformation progress.",
    metric: { value: "38%", label: "Critical KPIs visible to executives" },
    stage: "Optimize", impactScore: 64, currentMaturity: 2.4, targetMaturity: 4.5, valueUnlocked: "$650K",
    kpis: [
      { label: "Exec KPI Coverage", baseline: "22%", current: "38%", target: "95%", forecast: "88%" },
      { label: "Time to Insight", baseline: "Days", current: "Hours", target: "Minutes", forecast: "Minutes" },
    ],
    initiatives: ["Executive command tower", "Real-time service scorecards", "Transformation telemetry"],
    timeline: "5 months", investment: "$520K",
    related: ["fsd","obs","cei"] },
  { id: "sim", category: "exec", title: "Strategy & Initiative Misalignment", severity: "High", icon: Workflow,
    description: "Technology investments are not always aligned to business priorities.",
    metric: { value: "41%", label: "Initiatives aligned to business outcomes" },
    stage: "Stabilize", impactScore: 69, currentMaturity: 2.1, targetMaturity: 4.3, valueUnlocked: "$780K",
    kpis: [
      { label: "Outcome-Aligned Spend", baseline: "30%", current: "41%", target: "90%", forecast: "82%" },
    ],
    initiatives: ["Outcome-based funding", "OKR cascade to engineering"],
    timeline: "4 months", investment: "$240K",
    related: ["fsd","twg","ttm"] },

  // 2 — SRE (6)
  { id: "itil", category: "sre", title: "ITIL-to-SRE Transition Resistance", severity: "Critical", icon: GitBranch,
    description: "Siloed, ticket-driven culture resists SRE operating model and ownership.",
    metric: { value: "2.1/5", label: "SRE maturity score" },
    stage: "Standardize", impactScore: 88, currentMaturity: 2.1, targetMaturity: 4.2, valueUnlocked: "$1.7M",
    kpis: [
      { label: "SRE Maturity", baseline: "1.4", current: "2.1", target: "4.2", forecast: "3.6" },
      { label: "% Services with SLOs", baseline: "12%", current: "26%", target: "90%", forecast: "75%" },
    ],
    initiatives: ["SRE academy", "Embedded SREs in product teams", "Error-budget policy"],
    timeline: "9 months", investment: "$980K",
    related: ["rff","sog","ehd","afn","crr"] },
  { id: "rff", category: "sre", title: "Reactive Firefighting Culture", severity: "High", icon: Flame,
    description: "Teams spend most of their time reacting to incidents instead of preventing them.",
    metric: { value: "73%", label: "Time spent on unplanned work" },
    stage: "Automate", impactScore: 81, currentMaturity: 1.9, targetMaturity: 4.0, valueUnlocked: "$1.4M",
    kpis: [
      { label: "Unplanned Work %", baseline: "78%", current: "73%", target: "25%", forecast: "38%" },
      { label: "MTTR (Sev1)", baseline: "5h", current: "3.2h", target: "45m", forecast: "75m" },
    ],
    initiatives: ["Preventive engineering program", "Postmortem maturity", "Toil budgets"],
    timeline: "8 months", investment: "$760K",
    related: ["itil","afn","crr","obs"] },
  { id: "sog", category: "sre", title: "Service Ownership Gaps", severity: "High", icon: Users,
    description: "Many services lack clear owners, SLOs, or error budgets.",
    metric: { value: "48%", label: "Services with defined owners" },
    stage: "Standardize", impactScore: 78, currentMaturity: 2.0, targetMaturity: 4.4, valueUnlocked: "$880K",
    kpis: [
      { label: "Services w/ Owners", baseline: "32%", current: "48%", target: "98%", forecast: "92%" },
      { label: "Services w/ SLOs", baseline: "9%", current: "26%", target: "90%", forecast: "78%" },
    ],
    initiatives: ["Service catalog adoption", "Ownership attestation", "SLO program"],
    timeline: "6 months", investment: "$420K",
    related: ["itil","idf","mom"] },
  { id: "ehd", category: "sre", title: "Excessive Human Dependency", severity: "Moderate", icon: Users,
    description: "Operations rely on tribal knowledge and key individuals.",
    metric: { value: "65%", label: "Runbooks incomplete or outdated" },
    stage: "Automate", impactScore: 66, currentMaturity: 2.2, targetMaturity: 4.2, valueUnlocked: "$520K",
    kpis: [
      { label: "Runbook Coverage", baseline: "28%", current: "35%", target: "92%", forecast: "80%" },
      { label: "Single Point of Failure Roles", baseline: "14", current: "9", target: "0", forecast: "2" },
    ],
    initiatives: ["Runbook-as-code", "Automated remediation library"],
    timeline: "5 months", investment: "$360K",
    related: ["rff","afn","obs"] },
  { id: "afn", category: "sre", title: "Alert Fatigue & Noise", severity: "High", icon: BellRing,
    description: "Too many alerts with low signal-to-noise ratio cause burnout and delays.",
    metric: { value: "312", label: "Alerts per engineer per day" },
    stage: "Automate", impactScore: 72, currentMaturity: 1.8, targetMaturity: 4.3, valueUnlocked: "$640K",
    kpis: [
      { label: "Alerts / Engineer / Day", baseline: "385", current: "312", target: "<25", forecast: "55" },
      { label: "Actionable Alert Ratio", baseline: "12%", current: "21%", target: ">85%", forecast: "72%" },
    ],
    initiatives: ["Alert SLO triage", "Adaptive alerting", "Runbook-linked alerts"],
    timeline: "4 months", investment: "$280K",
    related: ["rff","obs","ehd"] },
  { id: "crr", category: "sre", title: "Change & Release Risk", severity: "Moderate", icon: PackagePlus,
    description: "High failure and rollback rate slows delivery of new capabilities.",
    metric: { value: "17%", label: "Change failure rate" },
    stage: "Stabilize", impactScore: 60, currentMaturity: 2.4, targetMaturity: 4.2, valueUnlocked: "$430K",
    kpis: [
      { label: "Change Failure Rate", baseline: "22%", current: "17%", target: "<5%", forecast: "8%" },
      { label: "Lead Time for Change", baseline: "28d", current: "21d", target: "1d", forecast: "5d" },
    ],
    initiatives: ["Progressive delivery", "Automated rollback", "Release health scorecards"],
    timeline: "6 months", investment: "$540K",
    related: ["itil","rff","ttm"] },

  // 3 — M&A (8)
  { id: "aic", category: "ma", title: "Acquisition Integration Complexity", severity: "Critical", icon: Building2,
    description: "New acquisitions bring duplicated systems, processes, and technology.",
    metric: { value: "11", label: "Platforms pending integration" },
    stage: "Scale", impactScore: 82, currentMaturity: 1.7, targetMaturity: 4.0, valueUnlocked: "$1.6M",
    kpis: [
      { label: "Platforms Integrated", baseline: "2", current: "5", target: "11", forecast: "9" },
      { label: "Days to Integrate New Acq.", baseline: "540", current: "320", target: "120", forecast: "180" },
    ],
    initiatives: ["Acquisition integration factory", "Reference integration patterns"],
    timeline: "12 months", investment: "$1.4M",
    related: ["ute","cms","laa","idf","mom","tda"] },
  { id: "ute", category: "ma", title: "Unknown Technology Estate", severity: "High", icon: Search,
    description: "Incomplete visibility into assets, dependencies, and integrations.",
    metric: { value: "8%", label: "Unknown / unmanaged assets" },
    stage: "Stabilize", impactScore: 70, currentMaturity: 2.0, targetMaturity: 4.3, valueUnlocked: "$620K",
    kpis: [
      { label: "Asset Discovery Coverage", baseline: "78%", current: "92%", target: "99.5%", forecast: "98%" },
    ],
    initiatives: ["Continuous discovery", "CMDB modernization"],
    timeline: "5 months", investment: "$420K",
    related: ["aic","cms","obs"] },
  { id: "cms", category: "ma", title: "Cloud Migration Stagnation", severity: "Critical", icon: Cloud,
    description: "Critical workloads remain on-prem due to complexity, risk, or cost.",
    metric: { value: "42%", label: "Workloads in cloud" },
    stage: "Modernize", impactScore: 85, currentMaturity: 2.7, targetMaturity: 4.5, valueUnlocked: "$2.4M",
    kpis: [
      { label: "Workloads in Cloud", baseline: "31%", current: "42%", target: "85%", forecast: "72%" },
      { label: "Cloud Cost per Workload", baseline: "$8.2K", current: "$6.4K", target: "$3.8K", forecast: "$4.6K" },
    ],
    initiatives: ["Migration factory", "Landing zones at scale", "App modernization waves"],
    timeline: "18 months", investment: "$2.1M",
    related: ["aic","laa","tda","tsf"] },
  { id: "laa", category: "ma", title: "Legacy Application Architecture", severity: "High", icon: Layers,
    description: "Tightly coupled apps and legacy frameworks block modernization.",
    metric: { value: "68%", label: "Apps are monolithic" },
    stage: "Modernize", impactScore: 75, currentMaturity: 2.1, targetMaturity: 4.0, valueUnlocked: "$1.3M",
    kpis: [
      { label: "Monolith %", baseline: "78%", current: "68%", target: "<25%", forecast: "38%" },
    ],
    initiatives: ["Strangler-fig decomposition", "Domain modeling", "API-first refactor"],
    timeline: "12 months", investment: "$1.2M",
    related: ["aic","cms","tda","pei"] },
  { id: "pei", category: "ma", title: "Platform Engineering Immaturity", severity: "Critical", icon: Boxes,
    description: "Lack of self-service platform services and developer enablement.",
    metric: { value: "18%", label: "Self-service adoption" },
    stage: "Standardize", impactScore: 80, currentMaturity: 1.8, targetMaturity: 4.0, valueUnlocked: "$1.1M",
    kpis: [
      { label: "Self-Service Adoption", baseline: "8%", current: "18%", target: "85%", forecast: "70%" },
      { label: "Time to Provision Env", baseline: "21d", current: "9d", target: "30m", forecast: "2h" },
    ],
    initiatives: ["Internal developer platform", "Golden paths", "Backstage rollout"],
    timeline: "9 months", investment: "$980K",
    related: ["sog","mom","tsf","obs"] },
  { id: "idf", category: "ma", title: "Identity Fragmentation", severity: "High", icon: KeyRound,
    description: "Multiple identity domains increase risk and operational complexity.",
    metric: { value: "11", label: "Identity domains" },
    stage: "Standardize", impactScore: 74, currentMaturity: 2.0, targetMaturity: 4.3, valueUnlocked: "$680K",
    kpis: [
      { label: "Identity Domains", baseline: "13", current: "11", target: "2", forecast: "4" },
      { label: "Orphaned Accounts", baseline: "1.1K", current: "742", target: "<25", forecast: "120" },
    ],
    initiatives: ["Identity consolidation", "SSO/SCIM rollout"],
    timeline: "8 months", investment: "$640K",
    related: ["aic","iac","sce","scd"] },
  { id: "mom", category: "ma", title: "Multiple Operating Models", severity: "Moderate", icon: Workflow,
    description: "Inconsistent processes, tools, and standards across entities.",
    metric: { value: "26%", label: "Rationalized" },
    stage: "Standardize", impactScore: 62, currentMaturity: 2.3, targetMaturity: 4.2, valueUnlocked: "$540K",
    kpis: [
      { label: "Standardized Practices", baseline: "18%", current: "26%", target: "90%", forecast: "78%" },
    ],
    initiatives: ["Operating model harmonization", "Process catalog"],
    timeline: "7 months", investment: "$520K",
    related: ["aic","pei","sog"] },
  { id: "tda", category: "ma", title: "Technical Debt Accumulation", severity: "Critical", icon: FileWarning,
    description: "Growing debt slows delivery, increases cost, and risk.",
    metric: { value: "38%", label: "Legacy code penetration" },
    stage: "Modernize", impactScore: 92, currentMaturity: 1.8, targetMaturity: 4.0, valueUnlocked: "$1.9M",
    kpis: [
      { label: "Legacy Code %", baseline: "44%", current: "38%", target: "<15%", forecast: "22%" },
      { label: "Debt Interest / yr", baseline: "$3.1M", current: "$2.4M", target: "<$500K", forecast: "$900K" },
    ],
    initiatives: ["Debt retirement program", "Architecture runway funding"],
    timeline: "15 months", investment: "$1.8M",
    related: ["cms","laa","pei","ttm"] },

  // 4 — Technology (6)
  { id: "tsf", category: "tech", title: "Tool Sprawl & Fragmentation", severity: "High", icon: Wrench,
    description: "Too many tools create complexity, cost, and integration gaps.",
    metric: { value: "47", label: "Tools in active use" },
    stage: "Standardize", impactScore: 68, currentMaturity: 2.2, targetMaturity: 4.2, valueUnlocked: "$900K",
    kpis: [
      { label: "Active Tools", baseline: "54", current: "47", target: "<18", forecast: "24" },
      { label: "Tooling Spend", baseline: "$4.2M", current: "$3.7M", target: "$2.1M", forecast: "$2.6M" },
    ],
    initiatives: ["Tool rationalization", "Vendor consolidation"],
    timeline: "8 months", investment: "$420K",
    related: ["pei","dic","sce"] },
  { id: "dic", category: "tech", title: "Data & Integration Complexity", severity: "High", icon: Database,
    description: "Siloed data sources and complex integrations hinder agility.",
    metric: { value: "240+", label: "Known data interfaces" },
    stage: "Modernize", impactScore: 70, currentMaturity: 2.1, targetMaturity: 4.2, valueUnlocked: "$880K",
    kpis: [
      { label: "Integration Surface", baseline: "300", current: "242", target: "<80", forecast: "120" },
      { label: "Data Quality Index", baseline: "61", current: "68", target: "92", forecast: "84" },
    ],
    initiatives: ["Event mesh", "Master data program"],
    timeline: "10 months", investment: "$960K",
    related: ["tsf","laa","obs"] },
  { id: "env", category: "tech", title: "Environment Sprawl", severity: "Moderate", icon: Server,
    description: "Too many environments create overhead and inconsistent configuration.",
    metric: { value: "84", label: "Total environments" },
    stage: "Stabilize", impactScore: 56, currentMaturity: 2.3, targetMaturity: 4.0, valueUnlocked: "$420K",
    kpis: [
      { label: "Environments", baseline: "96", current: "84", target: "32", forecast: "44" },
    ],
    initiatives: ["Ephemeral environments", "IaC standardization"],
    timeline: "6 months", investment: "$280K",
    related: ["pei","tsf"] },
  { id: "sag", category: "tech", title: "Security Automation Adoption", severity: "Moderate", icon: Shield,
    description: "Automation exists but is inconsistent and fragmented.",
    metric: { value: "34%", label: "Automation coverage" },
    stage: "Automate", impactScore: 64, currentMaturity: 2.2, targetMaturity: 4.3, valueUnlocked: "$580K",
    kpis: [
      { label: "Security Automation", baseline: "21%", current: "34%", target: "90%", forecast: "72%" },
    ],
    initiatives: ["SOAR rollout", "Policy-as-code"],
    timeline: "7 months", investment: "$520K",
    related: ["scd","iac","sca","stf"] },
  { id: "obs", category: "tech", title: "Poor Observability", severity: "High", icon: Eye,
    description: "Leaders lack visibility into system health, dependencies, and performance.",
    metric: { value: "71%", label: "Monitoring coverage" },
    stage: "Standardize", impactScore: 72, currentMaturity: 2.4, targetMaturity: 4.4, valueUnlocked: "$820K",
    kpis: [
      { label: "Coverage", baseline: "58%", current: "71%", target: "98%", forecast: "92%" },
      { label: "MTTD", baseline: "32m", current: "18m", target: "<2m", forecast: "5m" },
    ],
    initiatives: ["OpenTelemetry rollout", "Service catalog SLOs"],
    timeline: "8 months", investment: "$720K",
    related: ["afn","rff","dic","lev"] },
  { id: "vdr", category: "tech", title: "Vendor & Dependency Risk", severity: "Moderate", icon: Network,
    description: "Third-party dependencies lack oversight and standardization.",
    metric: { value: "29%", label: "Critical vendors reviewed" },
    stage: "Optimize", impactScore: 58, currentMaturity: 2.3, targetMaturity: 4.2, valueUnlocked: "$390K",
    kpis: [
      { label: "Critical Vendors Reviewed", baseline: "18%", current: "29%", target: "100%", forecast: "92%" },
    ],
    initiatives: ["Vendor risk program", "SBOM rollout"],
    timeline: "6 months", investment: "$320K",
    related: ["tsf","sce"] },

  // 5 — Security (6)
  { id: "svr", category: "sec", title: "Slow Vulnerability Remediation", severity: "Critical", icon: Bug,
    description: "Critical vulnerabilities remain open longer than acceptable.",
    metric: { value: "21", label: "Critical CVEs open" },
    stage: "Stabilize", impactScore: 79, currentMaturity: 2.1, targetMaturity: 4.3, valueUnlocked: "$760K",
    kpis: [
      { label: "Open Critical CVEs", baseline: "34", current: "21", target: "0", forecast: "3" },
      { label: "Mean Time to Remediate", baseline: "62d", current: "41d", target: "<7d", forecast: "12d" },
    ],
    initiatives: ["Risk-based patching", "Automated patch pipelines"],
    timeline: "5 months", investment: "$340K",
    related: ["scd","sce","sag"] },
  { id: "scd", category: "sec", title: "Security Configuration Drift", severity: "High", icon: ShieldAlert,
    description: "Configurations drift from standards and policies.",
    metric: { value: "32%", label: "Resources with drift" },
    stage: "Automate", impactScore: 62, currentMaturity: 2.3, targetMaturity: 4.4, valueUnlocked: "$480K",
    kpis: [
      { label: "Resources with Drift", baseline: "41%", current: "32%", target: "<3%", forecast: "8%" },
    ],
    initiatives: ["Policy-as-code", "Continuous compliance scanning"],
    timeline: "6 months", investment: "$380K",
    related: ["sag","sce","obs"] },
  { id: "iac", category: "sec", title: "Identity & Access Challenges", severity: "High", icon: Lock,
    description: "Privileged access, orphaned accounts, and role sprawl increase risk.",
    metric: { value: "742", label: "Orphaned accounts" },
    stage: "Standardize", impactScore: 70, currentMaturity: 2.2, targetMaturity: 4.3, valueUnlocked: "$640K",
    kpis: [
      { label: "Orphaned Accounts", baseline: "1.1K", current: "742", target: "<25", forecast: "120" },
      { label: "Privileged Sessions Recorded", baseline: "42%", current: "61%", target: "100%", forecast: "95%" },
    ],
    initiatives: ["PAM modernization", "Just-in-time access"],
    timeline: "7 months", investment: "$520K",
    related: ["idf","scd","sce"] },
  { id: "sca", category: "sec", title: "Security Automation Gaps", severity: "Moderate", icon: Zap,
    description: "Manual security processes limit scalability and increase risk.",
    metric: { value: "24%", label: "Security tasks automated" },
    stage: "Automate", impactScore: 60, currentMaturity: 2.1, targetMaturity: 4.2, valueUnlocked: "$430K",
    kpis: [
      { label: "Tasks Automated", baseline: "12%", current: "24%", target: "85%", forecast: "70%" },
    ],
    initiatives: ["SOAR playbooks", "Auto-remediation"],
    timeline: "6 months", investment: "$420K",
    related: ["sag","svr","scd"] },
  { id: "sce", category: "sec", title: "Compliance & Audit Exposure", severity: "Moderate", icon: FileWarning,
    description: "High number of audit findings and policy exceptions.",
    metric: { value: "47", label: "Policy exceptions" },
    stage: "Optimize", impactScore: 58, currentMaturity: 2.3, targetMaturity: 4.3, valueUnlocked: "$390K",
    kpis: [
      { label: "Open Audit Findings", baseline: "58", current: "47", target: "<5", forecast: "12" },
    ],
    initiatives: ["Continuous controls monitoring", "Evidence automation"],
    timeline: "6 months", investment: "$360K",
    related: ["scd","iac","rce"] },
  { id: "stf", category: "sec", title: "Security Tool Fragmentation", severity: "Moderate", icon: Wrench,
    description: "Multiple overlapping tools increase cost and reduce effectiveness.",
    metric: { value: "16", label: "Security tools in use" },
    stage: "Standardize", impactScore: 56, currentMaturity: 2.4, targetMaturity: 4.2, valueUnlocked: "$420K",
    kpis: [
      { label: "Security Tools", baseline: "19", current: "16", target: "<8", forecast: "10" },
    ],
    initiatives: ["Platform consolidation", "XDR rollout"],
    timeline: "7 months", investment: "$480K",
    related: ["tsf","sag","scd"] },

  // 6 — Business (6)
  { id: "cei", category: "biz", title: "Customer Experience Instability", severity: "High", icon: Smile,
    description: "Outages and issues impact caregivers, members, and payroll.",
    metric: { value: "72", label: "CSAT score" },
    stage: "Optimize", impactScore: 64, currentMaturity: 2.3, targetMaturity: 4.4, valueUnlocked: "$1.1M",
    kpis: [
      { label: "CSAT", baseline: "68", current: "72", target: "92", forecast: "85" },
      { label: "Customer-Impacting Outages", baseline: "22", current: "14", target: "<3", forecast: "6" },
    ],
    initiatives: ["Customer journey reliability", "Experience SLOs"],
    timeline: "8 months", investment: "$720K",
    related: ["cwd","hoc","rff","obs"] },
  { id: "cwd", category: "biz", title: "Caregiver Workflow Disruption", severity: "High", icon: Hospital,
    description: "System issues disrupt critical caregiver workflows and EVV.",
    metric: { value: "14", label: "Monthly major incidents impacting CX" },
    stage: "Modernize", impactScore: 66, currentMaturity: 2.2, targetMaturity: 4.3, valueUnlocked: "$1.0M",
    kpis: [
      { label: "Major CX Incidents", baseline: "19", current: "14", target: "<2", forecast: "4" },
      { label: "EVV Reliability", baseline: "97.1%", current: "98.4%", target: "99.95%", forecast: "99.7%" },
    ],
    initiatives: ["Critical workflow reliability", "Field-first reliability program"],
    timeline: "9 months", investment: "$860K",
    related: ["cei","laa","obs","rff"] },
  { id: "hoc", category: "biz", title: "High Operational Cost", severity: "Moderate", icon: DollarSign,
    description: "Complexity and manual work drive unnecessary cost.",
    metric: { value: "$184K / yr", label: "Cost per service" },
    stage: "Optimize", impactScore: 60, currentMaturity: 2.3, targetMaturity: 4.2, valueUnlocked: "$1.6M",
    kpis: [
      { label: "Cost per Service", baseline: "$220K", current: "$184K", target: "$95K", forecast: "$125K" },
    ],
    initiatives: ["FinOps program", "Automation factory"],
    timeline: "9 months", investment: "$640K",
    related: ["tsf","tda","sag"] },
  { id: "ttm", category: "biz", title: "Slow Time to Market", severity: "Moderate", icon: Timer,
    description: "Operational friction slows delivery of new capabilities.",
    metric: { value: "21", label: "Days lead time for change" },
    stage: "Modernize", impactScore: 62, currentMaturity: 2.3, targetMaturity: 4.4, valueUnlocked: "$1.2M",
    kpis: [
      { label: "Lead Time", baseline: "32d", current: "21d", target: "<2d", forecast: "5d" },
      { label: "Deployment Frequency", baseline: "Weekly", current: "Daily", target: "On Demand", forecast: "Daily+" },
    ],
    initiatives: ["DORA program", "Progressive delivery"],
    timeline: "9 months", investment: "$680K",
    related: ["crr","pei","laa"] },
  { id: "rce", category: "biz", title: "Risk & Compliance Exposure", severity: "Moderate", icon: ShieldAlert,
    description: "Operational issues increase risk and compliance exposure.",
    metric: { value: "23", label: "Open audit findings" },
    stage: "Stabilize", impactScore: 58, currentMaturity: 2.4, targetMaturity: 4.3, valueUnlocked: "$640K",
    kpis: [
      { label: "Open Audit Findings", baseline: "31", current: "23", target: "<3", forecast: "8" },
    ],
    initiatives: ["Continuous compliance", "Control automation"],
    timeline: "7 months", investment: "$420K",
    related: ["sce","scd","iac"] },
  { id: "lsa", category: "biz", title: "Lack of Scalability & Agility", severity: "Emerging", icon: Gauge,
    description: "Platform and processes struggle to absorb growth and change.",
    metric: { value: "5 mo", label: "Time to onboard new product" },
    stage: "Scale", impactScore: 54, currentMaturity: 2.4, targetMaturity: 4.4, valueUnlocked: "$880K",
    kpis: [
      { label: "Product Onboarding Time", baseline: "8mo", current: "5mo", target: "<6w", forecast: "10w" },
    ],
    initiatives: ["Platform scalability program", "Self-service paved roads"],
    timeline: "9 months", investment: "$720K",
    related: ["pei","aic","mom"] },
];

const TOP_FRICTION = [
  { rank: 1,  id: "tda",  label: "Technical Debt Accumulation",     score: 92 },
  { rank: 2,  id: "itil", label: "ITIL-to-SRE Transition Resistance", score: 88 },
  { rank: 3,  id: "cms",  label: "Cloud Migration Stagnation",      score: 85 },
  { rank: 4,  id: "aic",  label: "Acquisition Integration Complexity", score: 82 },
  { rank: 5,  id: "sog",  label: "Service Ownership Gaps",          score: 78 },
  { rank: 6,  id: "idf",  label: "Identity Fragmentation",          score: 74 },
  { rank: 7,  id: "afn",  label: "Alert Fatigue & Noise",           score: 72 },
  { rank: 8,  id: "tsf",  label: "Tool Sprawl & Fragmentation",     score: 68 },
  { rank: 9,  id: "cei",  label: "Customer Experience Instability", score: 64 },
  { rank: 10, id: "scd",  label: "Security Configuration Drift",    score: 62 },
];

const MATURITY = [
  { domain: "SRE",                  current: 2.1, target: 4.0 },
  { domain: "Cloud Adoption",       current: 2.7, target: 4.5 },
  { domain: "Security Posture",     current: 3.0, target: 4.5 },
  { domain: "Platform Engineering", current: 1.8, target: 4.0 },
  { domain: "Operational Excellence", current: 2.3, target: 4.2 },
  { domain: "Cost Optimization",    current: 2.2, target: 4.0 },
  { domain: "Change & Release",     current: 2.4, target: 4.2 },
];

const OPPORTUNITIES = [
  { name: "Platform Engineering & Self-Service", value: 1.1 },
  { name: "Cloud Modernization", value: 2.4 },
  { name: "SRE Transformation", value: 1.7 },
  { name: "Tool Consolidation", value: 0.9 },
  { name: "AI & Automation Enablement", value: 2.8 },
];

const STAGE_PLAN: Record<Stage, { current: number; target: number; initiatives: string[]; value: string; timeline: string; investment: string }> = {
  "Current State": { current: 1.5, target: 2.0, initiatives: ["Run friction baseline assessment","Establish executive sponsorship"], value: "Baseline", timeline: "Now", investment: "—" },
  "Stabilize":     { current: 2.0, target: 2.8, initiatives: ["Reduce unplanned work","Stand up incident command","Asset & dependency discovery"], value: "$1.4M", timeline: "0-6 mo", investment: "$680K" },
  "Standardize":   { current: 2.5, target: 3.4, initiatives: ["Service ownership program","Reference architectures","Internal developer platform foundations"], value: "$2.1M", timeline: "3-9 mo", investment: "$1.2M" },
  "Modernize":     { current: 2.8, target: 3.8, initiatives: ["Cloud migration factory","Monolith decomposition","Technical debt retirement"], value: "$2.6M", timeline: "6-15 mo", investment: "$2.1M" },
  "Automate":      { current: 3.0, target: 4.0, initiatives: ["SOAR & policy-as-code","Alert SLO program","Automated remediation"], value: "$1.8M", timeline: "9-15 mo", investment: "$960K" },
  "Optimize":      { current: 3.4, target: 4.3, initiatives: ["FinOps program","Customer journey SLOs","Vendor rationalization"], value: "$1.6M", timeline: "12-18 mo", investment: "$780K" },
  "Scale":         { current: 3.6, target: 4.5, initiatives: ["Acquisition integration factory","Self-service paved roads at scale"], value: "$1.4M", timeline: "15-24 mo", investment: "$1.1M" },
};

/* ============================================================
   HELPERS
============================================================ */
const SEVERITY_STYLE: Record<Severity, { dot: string; chip: string }> = {
  Critical: { dot: "#dc2626", chip: "bg-red-50 text-red-700 border-red-200" },
  High:     { dot: "#ea580c", chip: "bg-orange-50 text-orange-700 border-orange-200" },
  Moderate: { dot: "#f59e0b", chip: "bg-amber-50 text-amber-700 border-amber-200" },
  Emerging: { dot: "#10b981", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function useCountUp(target: number, duration = 1200, deps: any[] = []) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return v;
}

/* ============================================================
   COMPONENTS
============================================================ */
function TransformationRibbon({
  activeStage, onStage, hoverStage, setHoverStage,
}: {
  activeStage: Stage | null; onStage: (s: Stage) => void;
  hoverStage: Stage | null; setHoverStage: (s: Stage | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">TRANSFORMATION JOURNEY</div>
          <span className="text-xs text-slate-400">·  Click a stage for strategic plan</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" />Current</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Active</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Target</span>
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full" />
        <div className="relative grid grid-cols-7 gap-2">
          {STAGES.map((s) => {
            const Icon = s.icon;
            const isActive = activeStage === s.key;
            const isHover = hoverStage === s.key;
            return (
              <button
                key={s.key}
                onMouseEnter={() => setHoverStage(s.key)}
                onMouseLeave={() => setHoverStage(null)}
                onClick={() => onStage(s.key)}
                className="group flex flex-col items-center gap-2 py-2 transition"
              >
                <div
                  className={[
                    "h-11 w-11 rounded-full grid place-items-center transition-all duration-300 border",
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.55)] scale-110"
                      : isHover
                        ? "bg-white border-blue-300 text-blue-600 shadow-md scale-105"
                        : "bg-white border-slate-200 text-slate-500 shadow-sm",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className={["text-[12.5px] font-semibold leading-tight", isActive ? "text-blue-700" : "text-slate-800"].join(" ")}>{s.label}</div>
                  <div className="text-[10.5px] text-slate-500">{s.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniEcosystem({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 120 60" className="w-full h-12 mt-2 opacity-90">
      <defs>
        <linearGradient id="ln" x1="0" x2="1">
          <stop offset="0" stopColor={tint} stopOpacity="0.1" />
          <stop offset="1" stopColor={tint} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d="M10,40 C30,10 60,55 90,20 L110,30" fill="none" stroke="url(#ln)" strokeWidth="1.5" />
      <circle cx="10" cy="40" r="3" fill={tint} opacity="0.6" />
      <circle cx="45" cy="28" r="2.5" fill={tint} opacity="0.85" />
      <circle cx="78" cy="32" r="2.5" fill={tint} opacity="0.85" />
      <circle cx="110" cy="30" r="3" fill={tint} />
      <line x1="45" y1="28" x2="78" y2="32" stroke={tint} strokeOpacity="0.25" />
    </svg>
  );
}

function ChallengeCard({ c, onClick, activeStage, hoverStage, related, hoverId, setHoverId }: {
  c: Challenge; onClick: () => void; activeStage: Stage | null; hoverStage: Stage | null;
  related: Set<string>; hoverId: string | null; setHoverId: (id: string | null) => void;
}) {
  const sev = SEVERITY_STYLE[c.severity];
  const cat = CATEGORIES.find((x) => x.id === c.category)!;
  const Icon = c.icon;
  const stageMatch = activeStage === c.stage || hoverStage === c.stage;
  const isRelated = related.has(c.id);
  const dimmed = (hoverId && hoverId !== c.id && !isRelated) || (activeStage && activeStage !== c.stage && !stageMatch);
  const lit = isRelated || stageMatch || hoverId === c.id;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHoverId(c.id)}
      onMouseLeave={() => setHoverId(null)}
      className={[
        "group text-left rounded-xl border bg-white p-4 transition-all duration-300 relative overflow-hidden",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.18)]",
        lit ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200",
        dimmed ? "opacity-40" : "opacity-100",
      ].join(" ")}
      style={{ boxShadow: lit ? `0 8px 24px -12px ${cat.tint}55` : undefined }}
    >
      {lit && <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: cat.tint }} />}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: cat.bg, color: cat.tint }}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-[13px] font-semibold text-slate-900 leading-snug">{c.title}</div>
        </div>
        <span className="h-2 w-2 mt-1.5 rounded-full shrink-0" style={{ background: sev.dot }} />
      </div>
      <div className="text-[11.5px] text-slate-600 mt-2 leading-snug line-clamp-2">{c.description}</div>
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <div className="text-[9.5px] tracking-wider text-slate-400 font-semibold">KEY METRIC</div>
        <div className="flex items-end gap-2">
          <div className="text-[18px] font-semibold text-slate-900 leading-tight">{c.metric.value}</div>
          <div className="text-[10.5px] text-slate-500 leading-snug pb-1">{c.metric.label}</div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: `${cat.tint}14`, color: cat.tint }}
        >{c.stage}</span>
        <span className="text-[10px] text-slate-400 group-hover:text-blue-600 inline-flex items-center gap-1 transition">
          Open <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}

function CategoryBlock({ catId, onSelect, activeStage, hoverStage, hoverId, setHoverId, relatedIds }: {
  catId: string; onSelect: (c: Challenge) => void; activeStage: Stage | null; hoverStage: Stage | null;
  hoverId: string | null; setHoverId: (id: string | null) => void; relatedIds: Set<string>;
}) {
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const items = CHALLENGES.filter((c) => c.category === catId);
  const Icon = cat.icon;
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      style={{ backgroundImage: `linear-gradient(180deg, ${cat.bg} 0%, rgba(255,255,255,0.6) 50%)` }}
    >
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0" style={{ background: cat.tint }}>
              <span className="text-sm font-semibold">{cat.num}</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: cat.tint }}>
                <Icon className="h-3.5 w-3.5" /> Category
              </div>
              <h3 className="text-[15.5px] font-semibold text-slate-900 leading-tight mt-1">{cat.title}</h3>
              <p className="text-[12px] text-slate-600 mt-2 leading-snug">{cat.desc}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-700 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.tint }} />
                {items.length} challenges
              </div>
              <MiniEcosystem tint={cat.tint} />
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((c) => (
            <ChallengeCard
              key={c.id} c={c} onClick={() => onSelect(c)}
              activeStage={activeStage} hoverStage={hoverStage}
              related={relatedIds} hoverId={hoverId} setHoverId={setHoverId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TopFrictionPanel({ onHover, onClick }: { onHover: (id: string | null) => void; onClick: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">TOP 10 FRICTION DRIVERS</div>
        <span className="text-[10px] text-slate-400">Impact Score</span>
      </div>
      <ul className="space-y-1.5">
        {TOP_FRICTION.map((d) => {
          const color = d.score >= 80 ? "#dc2626" : d.score >= 70 ? "#ea580c" : "#f59e0b";
          return (
            <li key={d.id}>
              <button
                onMouseEnter={() => onHover(d.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onClick(d.id)}
                className="w-full flex items-center gap-2.5 px-1.5 py-1 rounded-lg hover:bg-slate-50 transition"
              >
                <span className="h-5 w-5 grid place-items-center text-[10px] font-semibold rounded-full text-white shrink-0" style={{ background: color }}>{d.rank}</span>
                <span className="text-[12px] text-slate-700 text-left flex-1 truncate">{d.label}</span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.score}%`, background: color }} />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 w-6 text-right">{d.score}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MaturityRadar() {
  const data = MATURITY.map((m) => ({ subject: m.domain, current: m.current, target: m.target }));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500">MATURITY AT A GLANCE</div>
        <span className="text-[10px] text-slate-400">Current vs Target</span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
            <Radar dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
            <Radar dataKey="current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1">
        {MATURITY.slice(0, 4).map((m) => {
          const gap = +(m.target - m.current).toFixed(1);
          return (
            <div key={m.domain} className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-600 w-32 truncate">{m.domain}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(m.current / 5) * 100}%` }} />
              </div>
              <span className="text-slate-500 w-10 text-right">+{gap}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityPanel() {
  const total = OPPORTUNITIES.reduce((a, b) => a + b.value, 0);
  const v = useCountUp(total);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 mb-3">TRANSFORMATION OPPORTUNITY VALUE</div>
      <table className="w-full">
        <tbody>
          {OPPORTUNITIES.map((o) => (
            <tr key={o.name} className="border-b border-slate-100 last:border-0">
              <td className="py-2 text-[12px] text-slate-700">{o.name}</td>
              <td className="py-2 text-[12px] font-semibold text-slate-900 text-right">${o.value.toFixed(1)}M</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-blue-700">TOTAL OPPORTUNITY</span>
        <span className="text-[20px] font-semibold text-blue-700">${v.toFixed(1)}M</span>
      </div>
    </div>
  );
}

function CostKpi({ icon: Icon, value, label, tint, suffix }: { icon: any; value: number; label: string; tint: string; suffix?: string }) {
  const v = useCountUp(value);
  const isCurrency = suffix === "$M" || suffix === "$K" || suffix === "$";
  const display = suffix === "$M" ? `$${v.toFixed(1)}M`
    : suffix === "K" ? `${Math.round(v).toLocaleString()}`
    : suffix === "mo" ? `${Math.round(v)}` 
    : Math.round(v).toLocaleString();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: `${tint}14`, color: tint }}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] tracking-[0.14em] uppercase font-semibold text-slate-500">{label}</span>
      </div>
      <div className="mt-2 text-[26px] font-semibold text-slate-900 leading-none">{display}{!isCurrency && suffix && suffix !== "K" ? ` ${suffix}` : ""}</div>
    </div>
  );
}

/* ============================================================
   DETAIL PANELS
============================================================ */
function ChallengePanel({ c, onClose, onOpen }: { c: Challenge | null; onClose: () => void; onOpen: (id: string) => void }) {
  if (!c) return null;
  const cat = CATEGORIES.find((x) => x.id === c.category)!;
  const Icon = c.icon;
  const sev = SEVERITY_STYLE[c.severity];
  const trend = Array.from({ length: 12 }).map((_, i) => ({
    m: `M${i + 1}`,
    current: 50 - i * 1.8 + (i % 3) * 1.2,
    target: 90 - Math.max(0, 11 - i) * 4,
  }));
  return (
    <Sheet open={!!c} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-[560px] sm:max-w-[560px] p-0 overflow-y-auto bg-white">
        <div className="p-6 border-b border-slate-100" style={{ background: cat.bg }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl grid place-items-center text-white" style={{ background: cat.tint }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase" style={{ color: cat.tint }}>{cat.title}</div>
                <SheetTitle className="text-[18px] font-semibold text-slate-900 mt-1">{c.title}</SheetTitle>
                <SheetDescription className="text-[12px] text-slate-600 mt-1">{c.description}</SheetDescription>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${sev.chip}`}>{c.severity}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { l: "Impact Score", v: `${c.impactScore}` },
              { l: "Current Maturity", v: `${c.currentMaturity}/5` },
              { l: "Target Maturity", v: `${c.targetMaturity}/5` },
              { l: "Value Unlocked", v: c.valueUnlocked },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-slate-200 bg-white p-2.5">
                <div className="text-[9.5px] tracking-wider text-slate-400 font-semibold uppercase">{s.l}</div>
                <div className="text-[15px] font-semibold text-slate-900 mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 mb-2">FORECAST TRAJECTORY</div>
            <div className="h-[140px] rounded-lg border border-slate-200 bg-white p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <RTooltip />
                  <Area type="monotone" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 mb-2">CONTRIBUTING KPIs / SLAs</div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">KPI</th>
                    <th className="text-right px-3 py-2 font-medium">Baseline</th>
                    <th className="text-right px-3 py-2 font-medium">Current</th>
                    <th className="text-right px-3 py-2 font-medium">Target</th>
                    <th className="text-right px-3 py-2 font-medium">Forecast</th>
                  </tr>
                </thead>
                <tbody>
                  {c.kpis.map((k) => (
                    <tr key={k.label} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{k.label}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{k.baseline}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{k.current}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-700">{k.target}</td>
                      <td className="px-3 py-2 text-right text-blue-700">{k.forecast}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 mb-1.5">RECOMMENDED INITIATIVES</div>
              <ul className="space-y-1">
                {c.initiatives.map((i) => (
                  <li key={i} className="text-[12px] text-slate-700 flex items-start gap-1.5">
                    <ArrowRight className="h-3 w-3 mt-1 text-blue-500 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 space-y-2.5">
              <div>
                <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Timeline</div>
                <div className="text-[13px] font-semibold text-slate-900">{c.timeline}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Investment</div>
                <div className="text-[13px] font-semibold text-slate-900">{c.investment}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Expected Annual Value</div>
                <div className="text-[13px] font-semibold text-emerald-700">{c.valueUnlocked}</div>
              </div>
            </div>
          </div>

          {c.related.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 mb-2">RELATED CHALLENGES</div>
              <div className="flex flex-wrap gap-1.5">
                {c.related.map((rid) => {
                  const r = CHALLENGES.find((x) => x.id === rid);
                  if (!r) return null;
                  return (
                    <button key={rid} onClick={() => onOpen(rid)}
                      className="text-[11px] px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-700 transition">
                      {r.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StagePanel({ stage, onClose }: { stage: Stage | null; onClose: () => void }) {
  if (!stage) return null;
  const plan = STAGE_PLAN[stage];
  const meta = STAGES.find((s) => s.key === stage)!;
  const Icon = meta.icon;
  return (
    <Sheet open={!!stage} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 overflow-y-auto bg-white">
        <SheetHeader className="p-6 border-b border-slate-100 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl grid place-items-center text-white bg-blue-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-blue-700">Transformation Stage</div>
              <SheetTitle className="text-[18px] font-semibold text-slate-900 mt-1">{meta.label}</SheetTitle>
              <SheetDescription className="text-[12px] text-slate-600">{meta.sub}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Current Maturity</div>
              <div className="text-[18px] font-semibold text-slate-900">{plan.current}/5</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Target Maturity</div>
              <div className="text-[18px] font-semibold text-emerald-700">{plan.target}/5</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Timeline</div>
              <div className="text-[15px] font-semibold text-slate-900">{plan.timeline}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">Investment</div>
              <div className="text-[15px] font-semibold text-slate-900">{plan.investment}</div>
            </div>
            <div className="rounded-lg border border-emerald-200 p-3 col-span-2 bg-emerald-50/40">
              <div className="text-[10px] tracking-wider text-emerald-700 font-semibold uppercase">Expected Annual Business Value</div>
              <div className="text-[20px] font-semibold text-emerald-700">{plan.value}</div>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 mb-2">RECOMMENDED INITIATIVES</div>
            <ul className="space-y-1.5">
              {plan.initiatives.map((i) => (
                <li key={i} className="text-[12.5px] text-slate-700 flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-blue-600 shrink-0" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 mb-2">CHALLENGES AT THIS STAGE</div>
            <div className="flex flex-wrap gap-1.5">
              {CHALLENGES.filter((c) => c.stage === stage).map((c) => (
                <span key={c.id} className="text-[11px] px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700">{c.title}</span>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============================================================
   PAGE
============================================================ */
export default function OperationalFrictionIndex() {
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const [hoverStage, setHoverStage] = useState<Stage | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [sidebarHoverId, setSidebarHoverId] = useState<string | null>(null);

  const relatedIds = useMemo(() => {
    const set = new Set<string>();
    const seedId = hoverId || sidebarHoverId;
    if (seedId) {
      const seed = CHALLENGES.find((c) => c.id === seedId);
      seed?.related.forEach((r) => set.add(r));
      set.add(seedId);
    }
    return set;
  }, [hoverId, sidebarHoverId]);

  const openById = (id: string) => {
    const c = CHALLENGES.find((x) => x.id === id);
    if (c) setSelected(c);
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-[1640px] mx-auto px-6 py-6 space-y-5">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[11px] tracking-[0.18em] text-slate-500 font-semibold uppercase flex items-center gap-2">
                <span>Site Reliability Engineering</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span>Operational Friction Index</span>
              </div>
              <h1 className="text-[28px] font-semibold text-slate-900 mt-1 leading-tight">Enterprise Friction Index</h1>
              <p className="text-[13px] text-slate-600 mt-1 max-w-3xl">
                Executive transformation assessment of operational, organizational, technology, and business friction
                limiting performance and growth. Each challenge maps to a transformation stage, maturity gap, and quantified value opportunity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[
                { l: "42 Challenges" }, { l: "7 Categories" }, { l: "Industry Benchmark" },
              ].map((x) => (
                <span key={x.l} className="text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">{x.l}</span>
              ))}
              <div className="hidden xl:flex items-center gap-3 ml-3 text-[11px] text-slate-600">
                {(["Critical","High","Moderate","Emerging"] as Severity[]).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_STYLE[s].dot }} />{s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIBBON */}
          <TransformationRibbon
            activeStage={activeStage}
            onStage={(s) => setActiveStage(activeStage === s ? null : s)}
            hoverStage={hoverStage}
            setHoverStage={setHoverStage}
          />

          {/* GRID + SIDEBAR */}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-9 space-y-4">
              {CATEGORIES.map((cat) => (
                <CategoryBlock
                  key={cat.id} catId={cat.id}
                  onSelect={(c) => setSelected(c)}
                  activeStage={activeStage} hoverStage={hoverStage}
                  hoverId={hoverId} setHoverId={setHoverId}
                  relatedIds={relatedIds}
                />
              ))}
            </div>
            <div className="col-span-12 xl:col-span-3 space-y-4 xl:sticky xl:top-4 xl:self-start">
              <TopFrictionPanel onHover={setSidebarHoverId} onClick={openById} />
              <MaturityRadar />
              <OpportunityPanel />
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 mb-2">LEGEND & DEFINITIONS</div>
                <ul className="text-[11.5px] text-slate-600 space-y-1.5">
                  <li><b className="text-slate-800">Key Metric</b> — Primary indicator of the challenge</li>
                  <li><b className="text-slate-800">Current State</b> — Assessed maturity / performance</li>
                  <li><b className="text-slate-800">Target State</b> — Desired future maturity</li>
                  <li><b className="text-slate-800">Impact Score</b> — Relative impact on business outcomes</li>
                  <li><b className="text-slate-800">Stages</b> — Where the challenge is most relevant</li>
                </ul>
              </div>
            </div>
          </div>

          {/* COST OF FRICTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">The Cost of Friction</div>
                <div className="text-[15px] font-semibold text-slate-900 mt-0.5">Annual Impact Estimate · Enterprise Transformation Assessment</div>
              </div>
              <div className="text-[11px] text-slate-500">Source · Internal Assessment, Stakeholder Interviews, Operational Metrics & Industry Benchmarks</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <CostKpi icon={DollarSign} value={8.9} label="Annual Operational Waste" tint="#7c3aed" suffix="$M" />
              <CostKpi icon={Timer} value={18560} label="Engineer Hours Lost" tint="#0891b2" suffix="K" />
              <CostKpi icon={AlertTriangle} value={27} label="Sev1 Incidents (12 Months)" tint="#ea580c" suffix="" />
              <CostKpi icon={Users} value={14} label="Customer-Impacting Outages" tint="#db2777" suffix="" />
              <CostKpi icon={TrendingUp} value={15.2} label="Enterprise Value at Risk" tint="#dc2626" suffix="$M" />
            </div>
          </div>
        </div>
      </div>

      <ChallengePanel c={selected} onClose={() => setSelected(null)} onOpen={openById} />
      <StagePanel stage={!selected ? activeStage : null} onClose={() => setActiveStage(null)} />
    </AppShell>
  );
}
