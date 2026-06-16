import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Activity, Users, Boxes, TrendingUp, ShieldCheck, DollarSign,
  Bell, Ticket, MonitorCheck, Clock, ClipboardList,
  Code2, Rocket, RefreshCw, Building2, Wrench,
  AlertTriangle, FileCheck, Shield, Network, Eye,
  Cpu, Maximize2, GitBranch, Boxes as BoxesIcon,
  Banknote, FileBarChart, Target, Trash2, BarChart3,
  ArrowRight, X, Sparkles, CheckCircle2, Gauge,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

/* ---------------- Types ---------------- */

type DisciplineId =
  | "sre" | "topo" | "platform" | "tech" | "devsecops" | "finops";

type Discipline = {
  id: DisciplineId;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  color: string; // tailwind text color
  ring: string;  // tailwind ring color
  bg: string;    // tailwind bg tint
};

type Shift = {
  id: string;
  current: string;
  future: string;
  icon: LucideIcon;
  frictions: number;        // count for badge
  frictionPoints: string[]; // names linked back to friction index
  disciplines: DisciplineId[];
  value: string;            // estimated value contribution
  narrative: string;
  operationalChanges: string[];
  capability: { processes: string[]; technology: string[]; automation: string[]; governance: string[] };
  kpi: { label: string; current: string; target: string; forecast: string }[];
  outcomes: { risk: string; cost: string; customer: string; growth: string };
  aiCoworkers: string[];
  dependencies: string[];
  maturity: { stage: string; status: "done" | "active" | "pending" }[];
};

type Category = {
  id: string;
  name: string;
  accent: string;     // hex
  tint: string;       // bg tint class
  textAccent: string; // tailwind text class
  shifts: Shift[];
};

/* ---------------- Disciplines ---------------- */

const DISCIPLINES: Discipline[] = [
  { id: "sre", name: "Google SRE", short: "SRE",
    description: "Reliability engineering discipline focused on prevention, service ownership, error budgets, and resilient systems.",
    icon: Gauge, color: "text-emerald-600", ring: "ring-emerald-300", bg: "bg-emerald-50" },
  { id: "topo", name: "Team Topologies", short: "Topologies",
    description: "Organizing teams around flow, value delivery, collaboration, and platform enablement.",
    icon: Users, color: "text-violet-600", ring: "ring-violet-300", bg: "bg-violet-50" },
  { id: "platform", name: "Platform Engineering", short: "Platform",
    description: "Reusable capabilities, golden paths, self-service platforms, and developer productivity.",
    icon: Boxes, color: "text-sky-600", ring: "ring-sky-300", bg: "bg-sky-50" },
  { id: "tech", name: "Technology Investment Strategy", short: "Tech Strategy",
    description: "Evolve, modernize, retire, consolidate, and reinvest technology intentionally.",
    icon: TrendingUp, color: "text-amber-600", ring: "ring-amber-300", bg: "bg-amber-50" },
  { id: "devsecops", name: "DevSecOps", short: "DevSecOps",
    description: "Security embedded into engineering workflows, automation, and software delivery.",
    icon: ShieldCheck, color: "text-teal-600", ring: "ring-teal-300", bg: "bg-teal-50" },
  { id: "finops", name: "FinOps", short: "FinOps",
    description: "Financial accountability, cost transparency, service ownership, and value realization.",
    icon: DollarSign, color: "text-rose-600", ring: "ring-rose-300", bg: "bg-rose-50" },
];

/* ---------------- Shifts ---------------- */

const mkShift = (s: Shift): Shift => s;

const CATEGORIES: Category[] = [
  {
    id: "ro", name: "Reliability & Operations",
    accent: "#10b981", tint: "bg-emerald-50/60", textAccent: "text-emerald-700",
    shifts: [
      mkShift({
        id: "ro-1", current: "Reactive Operations", future: "Proactive Reliability", icon: Bell,
        frictions: 7,
        frictionPoints: ["Reactive Firefighting", "Alert Fatigue", "Repeat Incidents", "Unclear Ownership", "Toil-Heavy Days", "MTTR Volatility", "Customer-Impacting Drift"],
        disciplines: ["sre", "platform"],
        value: "$14.2M / 3yr",
        narrative: "Shift the operating posture from responding to outages to engineering them out. Reliability becomes a measurable property of services, not the result of heroics.",
        operationalChanges: [
          "Replace ticket-driven response with service-owner-led reliability work",
          "Adopt error budgets that govern release pace and reliability investment",
          "Move toil work into engineering backlogs with explicit reduction targets",
          "Stand up reliability reviews for every Tier-1 service each sprint",
        ],
        capability: {
          processes: ["Error budget policy", "Service reliability review cadence", "Blameless postmortems"],
          technology: ["SLO platform", "Synthetic monitoring", "Chaos & resilience tooling"],
          automation: ["Auto-remediation runbooks", "Self-healing workflows", "Toil-burn dashboards"],
          governance: ["Reliability council", "Service tiering policy", "Error budget enforcement"],
        },
        kpi: [
          { label: "MTTR (Tier 1)", current: "48 min", target: "12 min", forecast: "14 min" },
          { label: "Repeat Incidents", current: "31%", target: "<10%", forecast: "11%" },
          { label: "Toil %", current: "55%", target: "<25%", forecast: "27%" },
        ],
        outcomes: {
          risk: "55% lower outage probability on Tier-1 services",
          cost: "$3.1M annual reduction in unplanned operations spend",
          customer: "Fewer member-impacting incidents and faster recovery",
          growth: "Capacity to absorb 2× release volume without instability",
        },
        aiCoworkers: ["Reliability Sentinel", "Incident Commander Copilot", "Toil Analyst"],
        dependencies: ["Service catalog", "Defined ownership", "Telemetry foundation"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ro-2", current: "Ticket Escalation", future: "Service Ownership", icon: Ticket,
        frictions: 6,
        frictionPoints: ["Unclear Ownership", "Cross-Team Handoffs", "Escalation Loops", "Knowledge Silos", "Slow Triage", "Accountability Gaps"],
        disciplines: ["sre", "topo"],
        value: "$9.6M / 3yr",
        narrative: "Replace ticket hand-offs with named service owners accountable for reliability, performance, and customer experience end-to-end.",
        operationalChanges: [
          "Every Tier-1/2 service gets a named owning team and on-call rotation",
          "Eliminate L1→L2→L3 escalation chains in favor of stream-aligned ownership",
          "Service scorecards published and reviewed monthly",
        ],
        capability: {
          processes: ["Ownership charter", "On-call standard", "Service scorecards"],
          technology: ["Service catalog", "Ownership graph", "Paging platform"],
          automation: ["Auto-routing by service ownership", "Ownership drift detection"],
          governance: ["Ownership policy", "Stream-aligned team model"],
        },
        kpi: [
          { label: "Services with named owner", current: "62%", target: "100%", forecast: "98%" },
          { label: "Escalation hops / incident", current: "3.4", target: "<1.5", forecast: "1.6" },
          { label: "Mean Time to Engage", current: "22 min", target: "5 min", forecast: "6 min" },
        ],
        outcomes: {
          risk: "Clear accountability eliminates dropped-ball outages",
          cost: "Removes duplicated triage effort across L1/L2/L3",
          customer: "Single owner for member-impacting issues",
          growth: "Faster onboarding of new services and acquisitions",
        },
        aiCoworkers: ["Ownership Mapper", "On-Call Copilot"],
        dependencies: ["Service catalog", "Team topology mapping"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ro-3", current: "Alert Monitoring", future: "Service Health Management", icon: MonitorCheck,
        frictions: 6,
        frictionPoints: ["Alert Fatigue", "Tool Sprawl", "Limited Observability", "Symptom-only Signals", "False Positives", "Customer-Impact Blindness"],
        disciplines: ["sre", "platform"],
        value: "$8.4M / 3yr",
        narrative: "Move from raw alert streams to a managed model of service health where SLOs, journeys, and business impact drive what humans see.",
        operationalChanges: [
          "Define SLO/SLI for every Tier-1 service and golden journey",
          "Replace symptom alerts with SLO-burn and journey-impact alerts",
          "Stand up a unified observability plane across infra, app, and customer experience",
        ],
        capability: {
          processes: ["SLO definition workflow", "Alert quality review"],
          technology: ["Unified observability", "Journey monitoring", "Trace + log correlation"],
          automation: ["Auto-suppression", "Correlation engine", "Noise reduction"],
          governance: ["Alert quality SLA", "Observability standards"],
        },
        kpi: [
          { label: "Alert-to-Signal Ratio", current: "1:18", target: "1:3", forecast: "1:4" },
          { label: "SLO Coverage", current: "31%", target: "95%", forecast: "92%" },
          { label: "Customer-Impact Detection", current: "44%", target: ">90%", forecast: "88%" },
        ],
        outcomes: {
          risk: "Earlier detection of member-impacting drift",
          cost: "Lower on-call burden and reduced tooling sprawl",
          customer: "Issues caught before they reach the member",
          growth: "Confidence to ship faster with observable services",
        },
        aiCoworkers: ["Signal Curator", "SLO Architect"],
        dependencies: ["Telemetry foundation", "Service catalog"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ro-4", current: "Manual Incident Response", future: "Intelligent Incident Management", icon: Clock,
        frictions: 7,
        frictionPoints: ["High MTTR", "Manual Triage", "War-Room Overhead", "Comms Gaps", "Postmortem Backlog", "Repeat Incidents", "Toil"],
        disciplines: ["sre", "platform", "devsecops"],
        value: "$11.8M / 3yr",
        narrative: "Make incident response a high-leverage, AI-assisted workflow with automated triage, runbook execution, and structured learning.",
        operationalChanges: [
          "AI-assisted triage and root-cause hypothesis on incident open",
          "Runbook automation for the top 50 incident types",
          "Structured postmortems with action tracking and recurrence prevention",
        ],
        capability: {
          processes: ["Severity matrix", "Postmortem standard", "Comms playbook"],
          technology: ["Incident platform", "Runbook automation", "AI triage assistant"],
          automation: ["Auto-bridge spin-up", "Auto-remediation for known patterns"],
          governance: ["Incident review board", "Recurrence SLAs"],
        },
        kpi: [
          { label: "MTTR", current: "72 min", target: "15 min", forecast: "18 min" },
          { label: "Auto-Remediated %", current: "6%", target: ">40%", forecast: "38%" },
          { label: "Postmortems on time", current: "55%", target: "100%", forecast: "97%" },
        ],
        outcomes: {
          risk: "Faster containment of revenue- and member-impacting events",
          cost: "Lower on-call burnout and overtime",
          customer: "Shorter, less visible disruptions",
          growth: "Scales without proportional response staffing",
        },
        aiCoworkers: ["Incident Commander Copilot", "Postmortem Synthesizer"],
        dependencies: ["Service health management", "Service ownership"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ro-5", current: "ITIL-Centric Processes", future: "SRE Practices & Culture", icon: ClipboardList,
        frictions: 4,
        frictionPoints: ["Process Drag", "CAB Bottlenecks", "Change Failure Rate", "Slow Lead Time"],
        disciplines: ["sre", "topo"],
        value: "$6.2M / 3yr",
        narrative: "Retain ITIL governance value but replace gatekeeping rituals with engineering-led, evidence-based reliability practices.",
        operationalChanges: [
          "Replace CAB review for low-risk changes with automated policy and pre-approved changes",
          "Adopt error budgets to govern release velocity vs. reliability",
          "Move from ticket-driven to engineering-driven operations",
        ],
        capability: {
          processes: ["Change policy", "Error budget policy", "Reliability reviews"],
          technology: ["Policy-as-code", "Release platform"],
          automation: ["Pre-approved change automation", "Risk scoring"],
          governance: ["Reliability council replaces CAB for routine changes"],
        },
        kpi: [
          { label: "Change Lead Time", current: "9 days", target: "<1 day", forecast: "1.2 days" },
          { label: "Change Failure Rate", current: "14%", target: "<5%", forecast: "6%" },
          { label: "CAB Reviews / week", current: "120", target: "<20", forecast: "24" },
        ],
        outcomes: {
          risk: "Lower change-induced incidents through automated guardrails",
          cost: "Removes governance overhead from routine work",
          customer: "Faster delivery of fixes and features",
          growth: "Supports modern engineering velocity",
        },
        aiCoworkers: ["Change Risk Scorer", "Policy-as-Code Author"],
        dependencies: ["Service ownership", "Automated delivery"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
    ],
  },
  {
    id: "ed", name: "Engineering & Delivery",
    accent: "#8b5cf6", tint: "bg-violet-50/60", textAccent: "text-violet-700",
    shifts: [
      mkShift({
        id: "ed-1", current: "Custom Engineering", future: "Shared Platforms", icon: Code2,
        frictions: 5, frictionPoints: ["Reinvented Wheels", "Duplicate Tooling", "Inconsistent Patterns", "High Cognitive Load", "Slow Onboarding"],
        disciplines: ["platform", "topo"], value: "$12.4M / 3yr",
        narrative: "Replace one-off engineering with reusable platform capabilities and golden paths that accelerate every team.",
        operationalChanges: [
          "Establish platform team with internal-product mindset",
          "Publish golden paths for service creation, deploy, observability",
          "Deprecate redundant in-house tools in favor of shared capabilities",
        ],
        capability: {
          processes: ["Platform product management", "Golden path standards"],
          technology: ["Internal developer portal", "Service templates", "Paved-road infra"],
          automation: ["Service scaffolding", "Self-service environments"],
          governance: ["Platform investment board", "Capability roadmap"],
        },
        kpi: [
          { label: "Time to first deploy", current: "3 wks", target: "<2 days", forecast: "3 days" },
          { label: "Golden-path adoption", current: "18%", target: ">80%", forecast: "76%" },
          { label: "Duplicate tools retired", current: "0", target: "30+", forecast: "27" },
        ],
        outcomes: { risk: "Fewer unsupported bespoke systems", cost: "Major engineering leverage from reuse",
          customer: "Faster delivery of value", growth: "Scales engineering without scaling headcount" },
        aiCoworkers: ["Golden-Path Copilot", "Service Scaffolder"],
        dependencies: ["Platform team funded", "Service catalog"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ed-2", current: "Manual Deployments", future: "Automated Delivery", icon: Rocket,
        frictions: 5, frictionPoints: ["Deploy Risk", "Off-Hours Releases", "Manual Steps", "Rollback Pain", "Inconsistent Pipelines"],
        disciplines: ["platform", "devsecops"], value: "$9.1M / 3yr",
        narrative: "Move from manual release events to continuous, policy-governed, automated delivery on every service.",
        operationalChanges: ["Standardize CI/CD per language/runtime", "Adopt progressive delivery (canary, blue/green)", "Automate rollback on SLO breach"],
        capability: {
          processes: ["Release policy", "Progressive delivery standard"],
          technology: ["CI/CD platform", "Feature flag platform", "Release orchestrator"],
          automation: ["Pipeline-as-code", "Auto-rollback", "Policy gates"],
          governance: ["Pre-approved change framework"],
        },
        kpi: [
          { label: "Deployment Frequency", current: "Weekly", target: "On-demand", forecast: "Daily+" },
          { label: "Lead Time for Change", current: "9 days", target: "<1 day", forecast: "1.4 days" },
          { label: "Change Failure Rate", current: "14%", target: "<5%", forecast: "6%" },
        ],
        outcomes: { risk: "Lower deploy-induced incidents", cost: "Less weekend / overtime release effort",
          customer: "Faster fixes and features", growth: "Sustains modern delivery cadence" },
        aiCoworkers: ["Release Copilot", "Pipeline Author"],
        dependencies: ["Shared platforms", "Service ownership"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ed-3", current: "Project Modernization", future: "Continuous Modernization", icon: RefreshCw,
        frictions: 5, frictionPoints: ["Tech Debt Drift", "End-of-Life Risk", "Aging Stacks", "Migration Fatigue", "Stalled Roadmaps"],
        disciplines: ["tech", "platform"], value: "$10.7M / 3yr",
        narrative: "Stop treating modernization as episodic projects. Make modernization a continuous engineering discipline tied to outcomes.",
        operationalChanges: ["Tech-debt budget allocated each sprint", "Lifecycle policy per technology", "Modernization tied to product roadmaps"],
        capability: {
          processes: ["Technology lifecycle policy", "Modernization intake"],
          technology: ["Architecture decision records", "Dependency telemetry"],
          automation: ["Auto-upgrade workflows", "EOL detection"],
          governance: ["Tech-debt portfolio review"],
        },
        kpi: [
          { label: "EOL components", current: "187", target: "<20", forecast: "26" },
          { label: "Tech-debt burn / sprint", current: "5%", target: "20%", forecast: "18%" },
          { label: "Modern stack %", current: "41%", target: "85%", forecast: "82%" },
        ],
        outcomes: { risk: "Less hidden risk from unsupported stacks", cost: "Avoided emergency migrations",
          customer: "Stable, modern experience", growth: "Faster delivery on modern foundations" },
        aiCoworkers: ["Modernization Strategist", "EOL Sentinel"],
        dependencies: ["Application portfolio assessment"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ed-4", current: "Siloed Engineering", future: "Cross-Functional Teams", icon: Building2,
        frictions: 4, frictionPoints: ["Hand-offs", "Slow Decisions", "Conway-style Bottlenecks", "Misaligned Roadmaps"],
        disciplines: ["topo"], value: "$5.4M / 3yr",
        narrative: "Reorganize from functional silos to stream-aligned teams with the skills to deliver, run, and improve their services.",
        operationalChanges: ["Stream-aligned teams own services end-to-end", "Enabling teams accelerate capability adoption", "Reduce dependencies via platform model"],
        capability: {
          processes: ["Team topology charter", "Dependency mapping"],
          technology: ["Dependency dashboard"],
          automation: ["Cross-team workflow automation"],
          governance: ["Topology review board"],
        },
        kpi: [
          { label: "Cross-team dependencies", current: "high", target: "low", forecast: "med-low" },
          { label: "Lead-time variability", current: "high", target: "low", forecast: "low" },
          { label: "Stream-aligned %", current: "35%", target: "85%", forecast: "80%" },
        ],
        outcomes: { risk: "Fewer dropped balls between teams", cost: "Lower coordination overhead",
          customer: "Faster decisions on member-impacting work", growth: "Scales with new lines of business" },
        aiCoworkers: ["Topology Mapper"],
        dependencies: ["Service ownership"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "ed-5", current: "Manual Operations", future: "Automation First", icon: Wrench,
        frictions: 6, frictionPoints: ["Toil", "Manual Runbooks", "Inconsistent Execution", "Human Error", "Slow Recovery", "Hidden Work"],
        disciplines: ["sre", "platform"], value: "$8.9M / 3yr",
        narrative: "Adopt an automation-first stance: every recurring operational task is a candidate for codification.",
        operationalChanges: ["Toil inventory & burn-down per team", "Runbook-as-code standard", "Automation reviews each sprint"],
        capability: {
          processes: ["Toil tracking", "Automation backlog"],
          technology: ["Workflow engine", "Runbook platform"],
          automation: ["Runbook-as-code", "Event-driven actions"],
          governance: ["Automation review board"],
        },
        kpi: [
          { label: "Toil %", current: "55%", target: "<25%", forecast: "27%" },
          { label: "Automated runbooks", current: "22", target: "200+", forecast: "190" },
          { label: "Auto-remediation %", current: "6%", target: ">40%", forecast: "38%" },
        ],
        outcomes: { risk: "Consistent, predictable execution", cost: "Reduces ops headcount pressure",
          customer: "Faster recovery", growth: "Scales without scaling ops headcount" },
        aiCoworkers: ["Toil Analyst", "Runbook Author"],
        dependencies: ["Telemetry", "Service catalog"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
    ],
  },
  {
    id: "sr", name: "Security & Risk",
    accent: "#0ea5e9", tint: "bg-sky-50/60", textAccent: "text-sky-700",
    shifts: [
      mkShift({
        id: "sr-1", current: "Periodic Security", future: "Embedded Security", icon: ShieldCheck,
        frictions: 5, frictionPoints: ["Late-Stage Findings", "Annual Audits", "Reactive Posture", "Blocked Releases", "Drift"],
        disciplines: ["devsecops", "platform"], value: "$7.6M / 3yr",
        narrative: "Move from periodic security reviews to security capabilities embedded in pipelines, services, and platforms.",
        operationalChanges: ["Shift-left security in CI/CD", "Service-level risk scoring", "Security guardrails as code"],
        capability: {
          processes: ["Security-as-code policy", "Service risk reviews"],
          technology: ["SCA/SAST/DAST", "Runtime protection"],
          automation: ["Policy gates", "Auto-remediation of common findings"],
          governance: ["Security risk board"],
        },
        kpi: [
          { label: "Time-to-fix critical", current: "31 days", target: "<5 days", forecast: "6 days" },
          { label: "Coverage in CI", current: "40%", target: ">95%", forecast: "92%" },
          { label: "Security debt", current: "high", target: "low", forecast: "low" },
        ],
        outcomes: { risk: "Lower exploitable risk", cost: "Fewer last-minute release blocks",
          customer: "Stronger trust posture", growth: "Audit-ready by default" },
        aiCoworkers: ["AppSec Copilot"],
        dependencies: ["Shared platforms", "Automated delivery"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sr-2", current: "Manual Compliance", future: "Continuous Compliance", icon: FileCheck,
        frictions: 4, frictionPoints: ["Audit Sprints", "Evidence Sprawl", "Manual Attestation", "Control Drift"],
        disciplines: ["devsecops", "platform"], value: "$5.1M / 3yr",
        narrative: "Replace audit-driven compliance with continuous control monitoring and evidence automation.",
        operationalChanges: ["Controls codified once, evaluated continuously", "Automated evidence capture", "Real-time compliance posture"],
        capability: {
          processes: ["Control catalog", "Continuous attestation"],
          technology: ["GRC platform", "Compliance-as-code"],
          automation: ["Evidence harvest", "Drift alerts"],
          governance: ["Compliance council"],
        },
        kpi: [
          { label: "Audit prep effort", current: "12 wks", target: "<2 wks", forecast: "2 wks" },
          { label: "Control coverage", current: "61%", target: "100%", forecast: "98%" },
          { label: "Drift incidents", current: "high", target: "low", forecast: "low" },
        ],
        outcomes: { risk: "Continuous assurance instead of point-in-time", cost: "Major audit overhead reduction",
          customer: "Trusted operations", growth: "Faster expansion into regulated markets" },
        aiCoworkers: ["Compliance Evidence Bot"],
        dependencies: ["Service catalog", "Embedded security"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sr-3", current: "Reactive Patching", future: "Risk-Based Remediation", icon: AlertTriangle,
        frictions: 4, frictionPoints: ["Patch Backlog", "Unprioritized Vulns", "Manual Triage", "SLA Misses"],
        disciplines: ["devsecops"], value: "$4.7M / 3yr",
        narrative: "Prioritize remediation by real-world exploitability and business impact instead of CVSS alone.",
        operationalChanges: ["Risk-based SLAs by service tier", "Exposure-weighted prioritization", "Automated patch pipelines"],
        capability: {
          processes: ["Vuln triage SLA", "Exception management"],
          technology: ["Risk-based vuln platform", "Asset/exposure correlation"],
          automation: ["Auto-patching for low-risk classes"],
          governance: ["Remediation council"],
        },
        kpi: [
          { label: "Critical patch SLA", current: "55%", target: ">95%", forecast: "93%" },
          { label: "Exploitable backlog", current: "high", target: "low", forecast: "low" },
          { label: "Auto-patched %", current: "12%", target: ">60%", forecast: "57%" },
        ],
        outcomes: { risk: "Sharp drop in exploitable exposure", cost: "Right-sized remediation effort",
          customer: "Trust through hardened services", growth: "Scales with growing asset estate" },
        aiCoworkers: ["Vuln Prioritizer"],
        dependencies: ["Service ownership", "Asset inventory"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sr-4", current: "Siloed Security", future: "Integrated Security", icon: Shield,
        frictions: 5, frictionPoints: ["Tool Silos", "Slow Detection", "Disconnected Identity", "Cross-Team Friction", "Acquired-Entity Gaps"],
        disciplines: ["devsecops", "topo"], value: "$6.3M / 3yr",
        narrative: "Integrate security into the engineering and operations operating model rather than treating it as a parallel function.",
        operationalChanges: ["Security embedded into stream-aligned teams", "Unified identity & access plane", "Shared detection & response across business units"],
        capability: {
          processes: ["Security partnership model"],
          technology: ["Unified IAM", "SIEM/SOAR consolidation"],
          automation: ["Cross-domain detection automation"],
          governance: ["Joint security & engineering council"],
        },
        kpi: [
          { label: "Detection MTTR", current: "hours", target: "minutes", forecast: "minutes" },
          { label: "Identity sprawl", current: "high", target: "low", forecast: "low" },
          { label: "Acquired-entity integration", current: "manual", target: "templated", forecast: "templated" },
        ],
        outcomes: { risk: "Unified posture across business units", cost: "Tool consolidation savings",
          customer: "Consistent protection", growth: "Acquisitions integrate faster" },
        aiCoworkers: ["Detection Engineer Copilot"],
        dependencies: ["Identity foundation", "Service catalog"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sr-5", current: "Limited Visibility", future: "End-to-End Observability", icon: Eye,
        frictions: 6, frictionPoints: ["Tool Sprawl", "Blind Spots", "Slow RCA", "Customer-Impact Blindness", "Cost Surprises", "Compliance Gaps"],
        disciplines: ["sre", "platform", "devsecops"], value: "$7.9M / 3yr",
        narrative: "Build a unified observability plane spanning infrastructure, application, security, customer journey, and cost.",
        operationalChanges: ["Single observability backbone", "Standard instrumentation libraries", "Cost & journey signals on the same pane"],
        capability: {
          processes: ["Instrumentation standards"],
          technology: ["OpenTelemetry stack", "Unified data lake"],
          automation: ["Auto-instrumentation", "Correlation engine"],
          governance: ["Observability standards board"],
        },
        kpi: [
          { label: "Trace coverage", current: "28%", target: ">90%", forecast: "85%" },
          { label: "MTTD", current: "18 min", target: "<3 min", forecast: "4 min" },
          { label: "Tools consolidated", current: "0", target: "12+", forecast: "10" },
        ],
        outcomes: { risk: "Far fewer blind spots", cost: "Major tool consolidation savings",
          customer: "Member-impact visible end-to-end", growth: "Foundation for AI ops" },
        aiCoworkers: ["Observability Architect"],
        dependencies: ["Service catalog"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
    ],
  },
  {
    id: "sg", name: "Scale & Growth",
    accent: "#f59e0b", tint: "bg-amber-50/60", textAccent: "text-amber-700",
    shifts: [
      mkShift({
        id: "sg-1", current: "Acquired Silos", future: "Integrated Platforms", icon: Network,
        frictions: 6, frictionPoints: ["Duplicate Stacks", "Identity Fragmentation", "Data Silos", "Process Forks", "Cost Duplication", "Integration Backlog"],
        disciplines: ["platform", "tech"], value: "$13.5M / 3yr",
        narrative: "Replace acquisition-by-acquisition integration with a templated platform-based onboarding model.",
        operationalChanges: ["Acquisition onboarding factory", "Reference target architecture", "Decommission duplicate platforms on a schedule"],
        capability: {
          processes: ["M&A onboarding playbook"],
          technology: ["Shared identity, network, observability"],
          automation: ["Templated environment build-out"],
          governance: ["M&A integration board"],
        },
        kpi: [
          { label: "Onboarding time", current: "9 mo", target: "<3 mo", forecast: "3.5 mo" },
          { label: "Duplicate stacks", current: "many", target: "few", forecast: "few" },
          { label: "Integration value capture", current: "low", target: "high", forecast: "high" },
        ],
        outcomes: { risk: "Lower integration-related outages", cost: "Major duplicate-cost recovery",
          customer: "Consistent experience across brands", growth: "Acquisition becomes a strength" },
        aiCoworkers: ["M&A Integration Planner"],
        dependencies: ["Shared platforms", "Identity foundation"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sg-2", current: "Human-Centric Operations", future: "AI-Augmented Operations", icon: Cpu,
        frictions: 5, frictionPoints: ["Repetitive Work", "Slow Triage", "Knowledge Silos", "Inconsistent Decisions", "Burnout"],
        disciplines: ["sre", "platform"], value: "$11.2M / 3yr",
        narrative: "Inject digital coworkers into operations to absorb toil and accelerate human decision-making.",
        operationalChanges: ["Digital coworkers for triage, RCA, change risk, compliance", "Human-in-the-loop review patterns", "AI guardrails and audit trail"],
        capability: {
          processes: ["AI coworker lifecycle"],
          technology: ["AI control plane", "Knowledge graph"],
          automation: ["AI-assisted runbooks", "AI-generated postmortems"],
          governance: ["AI governance board"],
        },
        kpi: [
          { label: "Operations work AI-assisted", current: "5%", target: ">50%", forecast: "47%" },
          { label: "Time saved / engineer / week", current: "0 hrs", target: "8+ hrs", forecast: "7 hrs" },
          { label: "Knowledge reuse", current: "low", target: "high", forecast: "high" },
        ],
        outcomes: { risk: "More consistent decisions", cost: "Major leverage on existing staff",
          customer: "Faster response", growth: "Operating leverage on growth" },
        aiCoworkers: ["All Reliability Coworkers"],
        dependencies: ["Observability foundation", "Knowledge captured"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sg-3", current: "Manual Scaling", future: "Elastic & Automated Scale", icon: Maximize2,
        frictions: 4, frictionPoints: ["Capacity Surprises", "Overprovisioning", "Slow Scale Events", "Cost Spikes"],
        disciplines: ["platform", "finops"], value: "$6.8M / 3yr",
        narrative: "Replace human-driven capacity decisions with policy-driven elastic scaling and continuous capacity intelligence.",
        operationalChanges: ["Capacity-as-code", "Autoscaling defaults per service tier", "Capacity reviews on cadence"],
        capability: {
          processes: ["Capacity policy"],
          technology: ["Autoscaling platform", "Capacity intelligence"],
          automation: ["Predictive scaling"],
          governance: ["Capacity council"],
        },
        kpi: [
          { label: "Autoscaling coverage", current: "37%", target: ">90%", forecast: "85%" },
          { label: "Overprovisioning %", current: "42%", target: "<15%", forecast: "18%" },
          { label: "Scale events failed", current: "high", target: "rare", forecast: "rare" },
        ],
        outcomes: { risk: "Headroom without surprises", cost: "Lower steady-state spend",
          customer: "Stable performance under load", growth: "Confident peak handling" },
        aiCoworkers: ["Capacity Forecaster"],
        dependencies: ["Observability", "FinOps tagging"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sg-4", current: "Fragmented Processes", future: "Standardized Workflows", icon: GitBranch,
        frictions: 5, frictionPoints: ["Process Variance", "Onboarding Cost", "Audit Pain", "Reinvented Workflows", "Slow Decisions"],
        disciplines: ["topo", "platform"], value: "$4.9M / 3yr",
        narrative: "Standardize key operational workflows across the enterprise to enable measurement, automation, and improvement.",
        operationalChanges: ["Workflow catalog", "Reference processes per domain", "Continuous improvement loop"],
        capability: {
          processes: ["Process standard library"],
          technology: ["Workflow platform"],
          automation: ["Process automation"],
          governance: ["Process owners by domain"],
        },
        kpi: [
          { label: "Standard workflow adoption", current: "32%", target: ">85%", forecast: "82%" },
          { label: "Onboarding time", current: "weeks", target: "days", forecast: "days" },
          { label: "Process variance", current: "high", target: "low", forecast: "low" },
        ],
        outcomes: { risk: "Predictable execution", cost: "Lower coordination overhead",
          customer: "Consistent experience", growth: "Scales without re-invention" },
        aiCoworkers: ["Process Cartographer"],
        dependencies: ["Topology mapping"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "sg-5", current: "Tool Sprawl", future: "Unified Toolchain", icon: BoxesIcon,
        frictions: 6, frictionPoints: ["Duplicate Tools", "Integration Tax", "Vendor Cost", "Skills Fragmentation", "Data Silos", "Slow Onboarding"],
        disciplines: ["platform", "finops", "tech"], value: "$7.4M / 3yr",
        narrative: "Consolidate to a curated, integrated toolchain aligned to platform capabilities and golden paths.",
        operationalChanges: ["Tool inventory & rationalization", "Reference toolchain per capability", "Decommission schedule"],
        capability: {
          processes: ["Tool intake & exit"],
          technology: ["Reference toolchain"],
          automation: ["Usage telemetry"],
          governance: ["Tool council"],
        },
        kpi: [
          { label: "Tools retired", current: "0", target: "30+", forecast: "27" },
          { label: "License savings", current: "$0", target: "$2.5M", forecast: "$2.2M" },
          { label: "Onboarding time", current: "weeks", target: "days", forecast: "days" },
        ],
        outcomes: { risk: "Fewer unsupported tools", cost: "License + integration savings",
          customer: "Faster delivery", growth: "Simpler, more leverageable estate" },
        aiCoworkers: ["Toolchain Optimizer"],
        dependencies: ["Platform capabilities defined"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
    ],
  },
  {
    id: "fv", name: "Financial & Value",
    accent: "#f43f5e", tint: "bg-rose-50/60", textAccent: "text-rose-700",
    shifts: [
      mkShift({
        id: "fv-1", current: "Technology Cost Centers", future: "Business Value Platforms", icon: Banknote,
        frictions: 5, frictionPoints: ["Cost-Center Mindset", "Value Disconnect", "Underinvestment", "Hidden Wins", "Misaligned Funding"],
        disciplines: ["finops", "topo"], value: "$8.6M / 3yr",
        narrative: "Reframe technology as a portfolio of business value platforms with explicit outcomes, owners, and ROI.",
        operationalChanges: ["Platform-as-product funding", "Outcome-based scorecards", "Investment review tied to value"],
        capability: {
          processes: ["Value-stream accounting"],
          technology: ["Cost + value telemetry"],
          automation: ["Outcome dashboards"],
          governance: ["Investment council"],
        },
        kpi: [
          { label: "Platforms with value scorecard", current: "18%", target: "100%", forecast: "95%" },
          { label: "Outcome reporting cadence", current: "annual", target: "quarterly", forecast: "monthly" },
          { label: "ROI visibility", current: "low", target: "high", forecast: "high" },
        ],
        outcomes: { risk: "Investment aligned to value", cost: "Sharper allocation",
          customer: "Investment follows member impact", growth: "Funds the right bets" },
        aiCoworkers: ["Value Analyst"],
        dependencies: ["FinOps transparency"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "fv-2", current: "Opaque Spending", future: "FinOps Transparency", icon: FileBarChart,
        frictions: 4, frictionPoints: ["Untagged Spend", "Surprise Bills", "Cost Drift", "No Service Cost"],
        disciplines: ["finops", "platform"], value: "$5.7M / 3yr",
        narrative: "Bring cost visibility to every service, team, and capability with FinOps practices and tooling.",
        operationalChanges: ["Tagging standard + enforcement", "Service cost reporting", "Anomaly alerting"],
        capability: {
          processes: ["FinOps council", "Tagging policy"],
          technology: ["FinOps platform"],
          automation: ["Cost anomaly detection"],
          governance: ["FinOps council"],
        },
        kpi: [
          { label: "Tagging coverage", current: "47%", target: ">95%", forecast: "92%" },
          { label: "Cost per service", current: "unknown", target: "published", forecast: "published" },
          { label: "Anomalies caught", current: "0", target: "all", forecast: "98%" },
        ],
        outcomes: { risk: "Cost surprises eliminated", cost: "Direct savings from visibility",
          customer: "Investment goes where it matters", growth: "Confidence to invest in growth" },
        aiCoworkers: ["FinOps Analyst"],
        dependencies: ["Service catalog"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "fv-3", current: "Budget Focus", future: "Outcome & Value Focus", icon: Target,
        frictions: 4, frictionPoints: ["Budget Theater", "Activity-Based Measurement", "Misaligned KPIs", "Slow Reprioritization"],
        disciplines: ["finops", "topo"], value: "$4.3M / 3yr",
        narrative: "Shift governance and reporting from budget consumption to outcomes delivered and value realized.",
        operationalChanges: ["Outcome OKRs per platform", "Funding tied to outcome milestones", "Quarterly value review"],
        capability: {
          processes: ["Outcome planning"],
          technology: ["OKR + value telemetry"],
          automation: ["Outcome dashboards"],
          governance: ["Outcome review board"],
        },
        kpi: [
          { label: "Outcome-funded %", current: "22%", target: ">80%", forecast: "75%" },
          { label: "Value realization", current: "ad hoc", target: "tracked", forecast: "tracked" },
          { label: "Reprioritization speed", current: "slow", target: "fast", forecast: "fast" },
        ],
        outcomes: { risk: "Investment follows results", cost: "Stops funding low-value work",
          customer: "Investment aligned to member outcomes", growth: "Maximizes growth investment" },
        aiCoworkers: ["Outcome Tracker"],
        dependencies: ["FinOps transparency"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "fv-4", current: "Resource Waste", future: "Efficient Resource Utilization", icon: Trash2,
        frictions: 4, frictionPoints: ["Idle Resources", "Overprovisioned Stacks", "Zombie Workloads", "Unrightsized Services"],
        disciplines: ["finops", "platform"], value: "$5.9M / 3yr",
        narrative: "Continuously right-size, retire, and reclaim resources across the estate as a normal engineering practice.",
        operationalChanges: ["Idle/zombie scanning", "Rightsizing reviews per quarter", "Auto-shutdown of non-prod"],
        capability: {
          processes: ["Rightsizing cadence"],
          technology: ["Utilization telemetry"],
          automation: ["Auto-shutdown, auto-rightsize"],
          governance: ["FinOps council"],
        },
        kpi: [
          { label: "Idle resources", current: "high", target: "low", forecast: "low" },
          { label: "Rightsized services", current: "21%", target: ">85%", forecast: "82%" },
          { label: "Non-prod off-hours savings", current: "$0", target: "$1.5M", forecast: "$1.3M" },
        ],
        outcomes: { risk: "Smaller attack surface", cost: "Direct utilization savings",
          customer: "Investment redirected to value", growth: "Funds new initiatives" },
        aiCoworkers: ["Rightsizing Bot"],
        dependencies: ["Tagging", "Observability"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
      mkShift({
        id: "fv-5", current: "Disconnected Metrics", future: "Unified Value Metrics", icon: BarChart3,
        frictions: 4, frictionPoints: ["Metric Sprawl", "Conflicting KPIs", "No Single Source", "Hard to Roll Up"],
        disciplines: ["finops", "platform", "sre"], value: "$4.1M / 3yr",
        narrative: "Establish a unified metric model that connects reliability, delivery, security, cost, and customer outcomes.",
        operationalChanges: ["Value metric catalog", "Single source of truth dashboards", "Roll-up to executive scorecard"],
        capability: {
          processes: ["Metric governance"],
          technology: ["Unified metrics layer"],
          automation: ["Metric pipelines"],
          governance: ["Metric council"],
        },
        kpi: [
          { label: "Executive scorecard coverage", current: "partial", target: "full", forecast: "full" },
          { label: "Conflicting metrics resolved", current: "few", target: "all", forecast: "most" },
          { label: "Decision time", current: "slow", target: "fast", forecast: "fast" },
        ],
        outcomes: { risk: "Clear, shared truth", cost: "Stops duplicate reporting effort",
          customer: "Decisions made on member outcomes", growth: "Aligned execution" },
        aiCoworkers: ["Metric Steward"],
        dependencies: ["Observability", "FinOps"],
        maturity: [
          { stage: "Current", status: "done" }, { stage: "Stabilize", status: "active" },
          { stage: "Standardize", status: "pending" }, { stage: "Modernize", status: "pending" },
          { stage: "Automate", status: "pending" }, { stage: "Optimize", status: "pending" }, { stage: "Scale", status: "pending" },
        ],
      }),
    ],
  },
];

/* ---------------- Friction → Shifts mapping ---------------- */

const FRICTION_MAP: { friction: string; shiftIds: string[] }[] = [
  { friction: "Reactive Firefighting", shiftIds: ["ro-1", "ro-4"] },
  { friction: "Technical Debt", shiftIds: ["ed-3", "ed-1"] },
  { friction: "Identity Fragmentation", shiftIds: ["sg-1", "sr-4"] },
  { friction: "Operational Inefficiency", shiftIds: ["ed-5", "ro-5"] },
  { friction: "Customer Experience Instability", shiftIds: ["ro-3", "sr-5"] },
  { friction: "Cost Opacity", shiftIds: ["fv-2", "fv-4"] },
  { friction: "Acquisition Integration Drag", shiftIds: ["sg-1", "ed-4"] },
  { friction: "Security Drift", shiftIds: ["sr-1", "sr-3"] },
];

/* ---------------- UI ---------------- */

function HeaderIndicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function DisciplineCard({
  d, active, hoveredId, onHover,
}: {
  d: Discipline;
  active: boolean;
  hoveredId: DisciplineId | null;
  onHover: (id: DisciplineId | null) => void;
}) {
  const Icon = d.icon;
  const dim = hoveredId && hoveredId !== d.id;
  const navigate = useNavigate();
  const isSre = d.id === "sre";
  const isTopo = d.id === "topo";
  const isPlatform = d.id === "platform";
  return (
    <div
      onMouseEnter={() => onHover(d.id)}
      onMouseLeave={() => onHover(null)}
      className={[
        "group relative rounded-2xl border bg-white p-4 transition-all",
        "border-slate-200 hover:border-slate-300 hover:shadow-md",
        active ? `ring-2 ${d.ring}` : "",
        dim ? "opacity-50" : "",
      ].join(" ")}
    >
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${d.bg} ${d.color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm font-semibold text-slate-900">{d.name}</div>
      <div className="mt-1 text-xs text-slate-600 leading-relaxed">{d.description}</div>
      {isSre && (
        <div className="mt-3 flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/google-sre"); }}
            className="text-left text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 px-2 py-1.5 transition-colors"
          >
            <span>Reliability Engineering Discipline</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/google-sre/how-to-achieve"); }}
            className="text-left text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 px-2 py-1.5 transition-colors"
          >
            <span>How Organizations Achieve It</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
      {isTopo && (
        <div className="mt-3 flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/team-topologies"); }}
            className="text-left text-[11px] font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center justify-between rounded-md border border-sky-200 bg-sky-50/60 hover:bg-sky-50 px-2 py-1.5 transition-colors"
          >
            <span>Design Principles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/team-topologies/future-state-org"); }}
            className="text-left text-[11px] font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center justify-between rounded-md border border-sky-200 bg-sky-50/60 hover:bg-sky-50 px-2 py-1.5 transition-colors"
          >
            <span>Team Structure</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/team-topologies/functional-org-chart"); }}
            className="text-left text-[11px] font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center justify-between rounded-md border border-sky-200 bg-sky-50/60 hover:bg-sky-50 px-2 py-1.5 transition-colors"
          >
            <span>Functional Org Chart</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
      {isPlatform && (
        <div className="mt-3 flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/platform-engineering/design-principles"); }}
            className="text-left text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 inline-flex items-center justify-between rounded-md border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 px-2 py-1.5 transition-colors"
          >
            <span>Design Principles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("/reliability-foundations/platform-engineering/how-to-build"); }}
            className="text-left text-[11px] font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center justify-between rounded-md border border-sky-200 bg-sky-50/60 hover:bg-sky-50 px-2 py-1.5 transition-colors"
          >
            <span>How Organizations Achieve It</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

    </div>
  );
}


function ShiftCard({
  shift, hoveredDiscipline, onOpen, dim,
}: {
  shift: Shift;
  hoveredDiscipline: DisciplineId | null;
  onOpen: () => void;
  dim: boolean;
}) {
  const Icon = shift.icon;
  const highlight = hoveredDiscipline && shift.disciplines.includes(hoveredDiscipline);
  return (
    <button
      onClick={onOpen}
      className={[
        "group w-full text-left rounded-xl border bg-white p-3 transition-all",
        "border-slate-200 hover:border-slate-300 hover:shadow-md",
        highlight ? "ring-2 ring-amber-300 border-amber-300 shadow-md" : "",
        dim ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate">{shift.current}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-900 truncate">{shift.future}</span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold">
            {shift.frictions}
          </span>
          <BarChart3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
        </div>
      </div>
    </button>
  );
}

function OutcomeCard({
  icon: Icon, title, points, accent,
}: { icon: LucideIcon; title: string; points: string[]; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: `${accent}14`, color: accent }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
      <ul className="space-y-1.5">
        {points.map((p) => (
          <li key={p} className="text-xs text-slate-600 flex gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaturityRail({ items }: { items: Shift["maturity"] }) {
  return (
    <div className="flex items-center gap-1">
      {items.map((m, i) => (
        <div key={m.stage} className="flex-1 flex items-center gap-1">
          <div
            className={[
              "flex-1 h-1.5 rounded-full",
              m.status === "done" ? "bg-emerald-500" :
              m.status === "active" ? "bg-amber-400" : "bg-slate-200",
            ].join(" ")}
          />
          {i < items.length - 1 && <div className="w-1" />}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function ReliabilityFoundations() {
  const [hoveredDiscipline, setHoveredDiscipline] = useState<DisciplineId | null>(null);
  const [openShift, setOpenShift] = useState<Shift | null>(null);

  const totalShifts = CATEGORIES.reduce((acc, c) => acc + c.shifts.length, 0);
  const totalFriction = CATEGORIES.reduce((acc, c) => acc + c.shifts.reduce((a, s) => a + s.frictions, 0), 0);

  const trendData = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({
      m: `M${i + 1}`,
      friction: Math.round(100 - i * 6 + Math.sin(i) * 4),
      capability: Math.round(20 + i * 6 + Math.cos(i) * 3),
    })),
    []
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

          {/* Header */}
          <header className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  From Enterprise Friction to Future-State Operations
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                  Enterprise Operating Shifts
                </h1>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  The organizational, engineering, and operational changes required to eliminate enterprise friction
                  and create a modern, resilient, scalable operating model.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <HeaderIndicator label="Current State" value="Legacy Operations" />
                <HeaderIndicator label="Target State" value="Production Reliability OM" />
                <HeaderIndicator label="Operating Maturity" value="Transitional" />
                <HeaderIndicator label="Transformation Horizon" value="24–36 Months" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Operating Shifts</div>
                <div className="text-2xl font-semibold text-slate-900">{totalShifts}</div>
                <div className="text-xs text-slate-500">across 5 domains</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Friction Points Addressed</div>
                <div className="text-2xl font-semibold text-slate-900">{totalFriction}</div>
                <div className="text-xs text-emerald-600">100% coverage</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">3-Year Value</div>
                <div className="text-2xl font-semibold text-slate-900">$210M+</div>
                <div className="text-xs text-slate-500">total unlocked</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Risk Reduction</div>
                <div className="text-2xl font-semibold text-slate-900">55%</div>
                <div className="text-xs text-slate-500">lower operational risk</div>
              </div>
            </div>
          </header>

          {/* SECTION 1 - Foundational Disciplines */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 01</div>
                <h2 className="text-lg font-semibold text-slate-900">Foundational Disciplines</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Industry disciplines informing the operating shifts. Hover any discipline to highlight the shifts it informs.
                </p>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200">
                {hoveredDiscipline ? `Highlighting ${DISCIPLINES.find(d => d.id === hoveredDiscipline)?.short}` : "6 disciplines"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DISCIPLINES.map((d) => (
                <DisciplineCard
                  key={d.id} d={d}
                  active={hoveredDiscipline === d.id}
                  hoveredId={hoveredDiscipline}
                  onHover={setHoveredDiscipline}
                />
              ))}
            </div>
          </section>

          {/* SECTION 2 - Operating Shifts */}
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 02</div>
                <h2 className="text-lg font-semibold text-slate-900">Enterprise Operating Shifts</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Current state → Future state. Click any shift to open the Operating Shift Intelligence Panel.
                </p>
              </div>
              <div className="text-xs text-slate-500">
                {hoveredDiscipline ? (
                  <span>Filtering by <span className="font-semibold text-slate-700">{DISCIPLINES.find(d => d.id === hoveredDiscipline)?.name}</span></span>
                ) : "Hover a discipline above to filter"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {CATEGORIES.map((c) => (
                <div key={c.id} className={`rounded-2xl border border-slate-200 ${c.tint} p-3`}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className={`text-[11px] uppercase tracking-wider font-semibold ${c.textAccent}`}>{c.name}</div>
                    <span className="text-[10px] text-slate-500">{c.shifts.length} shifts</span>
                  </div>
                  <div className="space-y-2">
                    {c.shifts.map((s) => (
                      <ShiftCard
                        key={s.id} shift={s}
                        hoveredDiscipline={hoveredDiscipline}
                        dim={Boolean(hoveredDiscipline && !s.disciplines.includes(hoveredDiscipline))}
                        onOpen={() => setOpenShift(s)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3 - Outcomes */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 03</div>
              <h2 className="text-lg font-semibold text-slate-900">Operating Shift Impact Summary</h2>
              <p className="text-xs text-slate-500 mt-1">What the enterprise gains when these shifts are achieved.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <OutcomeCard icon={Gauge} title="More Reliable" accent="#10b981"
                points={["Reduced incidents", "Higher service availability", "Improved customer experience"]} />
              <OutcomeCard icon={Rocket} title="Faster Delivery" accent="#8b5cf6"
                points={["Reduced lead times", "Higher deployment velocity", "Faster modernization"]} />
              <OutcomeCard icon={ShieldCheck} title="More Secure" accent="#0ea5e9"
                points={["Reduced risk exposure", "Improved compliance posture", "Embedded security"]} />
              <OutcomeCard icon={Maximize2} title="Built To Scale" accent="#f59e0b"
                points={["Supports acquisitions", "Supports growth", "Supports new products"]} />
              <OutcomeCard icon={TrendingUp} title="Greater Value" accent="#f43f5e"
                points={["Improved operating leverage", "Lower operational cost", "Higher enterprise value"]} />
            </div>
          </section>

          {/* SECTION 4 - Friction Reduction Coverage */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 04</div>
                <h2 className="text-lg font-semibold text-slate-900">Friction Reduction Coverage</h2>
                <p className="text-xs text-slate-500 mt-1">
                  How operating shifts directly address the friction identified on the Enterprise Friction Index.
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                40 / 40 friction points covered
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 space-y-2">
                {FRICTION_MAP.map((row) => (
                  <div key={row.friction} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 px-2 py-1 rounded-md bg-white border border-slate-200">
                        {row.friction}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <div className="flex flex-wrap gap-1.5">
                        {row.shiftIds.map((sid) => {
                          const sh = CATEGORIES.flatMap(c => c.shifts).find(x => x.id === sid)!;
                          return (
                            <button
                              key={sid}
                              onClick={() => setOpenShift(sh)}
                              className="text-[11px] px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm transition text-slate-700"
                            >
                              {sh.current} <span className="text-slate-400">→</span> <span className="font-semibold text-slate-900">{sh.future}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="text-xs font-semibold text-slate-700 mb-2">Friction ↓ vs. Capability ↑ (illustrative, 12 months)</div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="m" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="friction" stroke="#f43f5e" fill="#fecdd3" />
                      <Area type="monotone" dataKey="capability" stroke="#10b981" fill="#a7f3d0" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <div className="text-[11px] text-slate-400 text-center pb-6">
            Enterprise Friction Index identified what is broken. Enterprise Operating Shifts identifies what must change.
            The Future-State Operating Model defines how people, process, technology, and AI are organized once these shifts are achieved.
          </div>
        </div>

        {/* ---- Operating Shift Intelligence Panel ---- */}
        <Sheet open={!!openShift} onOpenChange={(o) => !o && setOpenShift(null)}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-white">
            {openShift && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700">
                      <openShift.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">Operating Shift Intelligence Panel</div>
                      <SheetTitle className="text-base">
                        <span className="text-slate-500 font-normal">{openShift.current}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-slate-900">{openShift.future}</span>
                      </SheetTitle>
                    </div>
                    <button onClick={() => setOpenShift(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </SheetHeader>

                <div className="mt-5 space-y-5">
                  {/* Executive Narrative */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Executive Narrative</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{openShift.narrative}</p>
                  </section>

                  <Separator />

                  {/* Frictions Reduced */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Frictions Reduced ({openShift.frictionPoints.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {openShift.frictionPoints.map((f) => (
                        <span key={f} className="text-[11px] px-2 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">{f}</span>
                      ))}
                    </div>
                  </section>

                  {/* Supporting Disciplines */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Supporting Disciplines</div>
                    <div className="grid grid-cols-2 gap-2">
                      {openShift.disciplines.map((id) => {
                        const d = DISCIPLINES.find((x) => x.id === id)!;
                        const Icon = d.icon;
                        return (
                          <div key={id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 ${d.bg}`}>
                            <Icon className={`w-4 h-4 ${d.color}`} />
                            <span className="text-xs font-semibold text-slate-800">{d.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <Separator />

                  {/* Operational Changes */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Operational Changes Required</div>
                    <ul className="space-y-1.5">
                      {openShift.operationalChanges.map((c) => (
                        <li key={c} className="text-sm text-slate-700 flex gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Capability Requirements */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Capability Requirements</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["processes", "technology", "automation", "governance"] as const).map((k) => (
                        <Card key={k} className="p-3 border-slate-200">
                          <div className="text-[10px] uppercase text-slate-500 mb-1">{k}</div>
                          <ul className="space-y-1">
                            {openShift.capability[k].map((v) => (
                              <li key={v} className="text-xs text-slate-700">• {v}</li>
                            ))}
                          </ul>
                        </Card>
                      ))}
                    </div>
                  </section>

                  {/* KPI Framework */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">KPI Framework</div>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="text-left p-2 font-medium">KPI</th>
                            <th className="text-left p-2 font-medium">Current</th>
                            <th className="text-left p-2 font-medium">Target</th>
                            <th className="text-left p-2 font-medium">Forecast</th>
                          </tr>
                        </thead>
                        <tbody>
                          {openShift.kpi.map((k) => (
                            <tr key={k.label} className="border-t border-slate-200">
                              <td className="p-2 text-slate-800 font-medium">{k.label}</td>
                              <td className="p-2 text-slate-600">{k.current}</td>
                              <td className="p-2 text-slate-900 font-semibold">{k.target}</td>
                              <td className="p-2 text-emerald-700">{k.forecast}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Business Outcomes */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Business Outcomes</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["risk", "cost", "customer", "growth"] as const).map((k) => (
                        <div key={k} className="rounded-lg border border-slate-200 p-3">
                          <div className="text-[10px] uppercase text-slate-500">{k}</div>
                          <div className="text-xs text-slate-700 mt-1">{openShift.outcomes[k]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">Estimated value contribution: <span className="font-semibold text-slate-900">{openShift.value}</span></div>
                  </section>

                  {/* AI Enablement */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">AI Enablement — Digital Coworkers</div>
                    <div className="flex flex-wrap gap-1.5">
                      {openShift.aiCoworkers.map((c) => (
                        <span key={c} className="text-[11px] px-2 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-200">{c}</span>
                      ))}
                    </div>
                  </section>

                  {/* Dependencies */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Transformation Dependencies</div>
                    <div className="flex flex-wrap gap-1.5">
                      {openShift.dependencies.map((d) => (
                        <span key={d} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">{d}</span>
                      ))}
                    </div>
                  </section>

                  {/* Maturity Journey */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Maturity Journey</div>
                    <MaturityRail items={openShift.maturity} />
                    <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                      {openShift.maturity.map((m) => (<span key={m.stage}>{m.stage}</span>))}
                    </div>
                  </section>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
