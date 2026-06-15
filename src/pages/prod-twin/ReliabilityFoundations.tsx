import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ShieldCheck, UserCheck, Users, Boxes, Cog, RefreshCw, Building2, Lock,
  Target, Rocket, TrendingUp, Smile, Zap, Layers, DollarSign, Code2,
  ChevronRight, X, Activity, BarChart3, CheckCircle2, AlertTriangle,
  ArrowRight, Compass, type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";

/* ---------------- Types ---------------- */

type KPI = { label: string; value: string; trend?: string };
type Foundation = {
  id: string;
  number: number;
  title: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;       // hex
  ringClass: string;    // tailwind ring color
  industryTranslation: string;
  executiveDefinition: string;
  whyExists: string;
  looksLike: string[];
  withoutIt: string[];
  practices: string[];
  antiPatterns: string[];
  kpis: KPI[];
  slas: string[];
  visuals: string[];
  realWorld: string[];
  reporting: string[];
  talkingPoints: string[];
  coworkerOpportunities: string[];
  modernizationInitiatives: string[];
  serviceCatalog: string[];
  teamStructure: string[];
  related: string[];
  radar: { axis: string; current: number; target: number }[];
  trend: { m: string; value: number }[];
};

type Outcome = {
  id: string;
  title: string;
  metric: string;
  caption: string;
  icon: LucideIcon;
  accent: string;
  panels: { title: string; items: string[] }[];
  trend: { m: string; value: number }[];
};

type Framework = {
  id: string;
  name: string;
  caption: string;
  icon: LucideIcon;
  accent: string;
  what: string;
  why: string;
  influence: string[];
  pitfalls: string[];
  useCases: string[];
  relatedFoundations: string[];
};

/* ---------------- Data ---------------- */

const FOUNDATIONS: Foundation[] = [
  {
    id: "prevention",
    number: 1,
    title: "Prevention Over Reaction",
    tagline: "Reliability is engineered before incidents occur.",
    icon: ShieldCheck,
    accent: "#6D28D9",
    ringClass: "ring-violet-200",
    industryTranslation: "Google SRE",
    executiveDefinition: "Reliability is engineered before incidents occur.",
    whyExists: "Production reliability is a property of design, not heroics. Investing in prevention compounds — every failure mode eliminated is a future incident that does not happen.",
    looksLike: ["Proactive reliability reviews", "Error budget management", "Capacity forecasting", "Chaos testing", "Resilience engineering"],
    withoutIt: ["Firefighting culture", "Escalation fatigue", "Constant interruptions", "High incident volume"],
    practices: ["SLOs & Error Budgets", "Proactive Operations", "Resilience Testing", "Chaos & GameDays"],
    antiPatterns: ["Heroics over process", "Firefighting as the norm", "No error budgets"],
    kpis: [
      { label: "MTTD", value: "6 min", trend: "-42%" },
      { label: "MTTR", value: "28 min", trend: "-38%" },
      { label: "Sev1 / month", value: "0.8", trend: "-71%" },
      { label: "Error Budget Burn", value: "62%", trend: "-12%" },
    ],
    slas: ["99.95% service availability", "Sev1 recovery < 60 min", "Quarterly chaos drill completion 100%"],
    visuals: ["Reliability Trend", "Incident Reduction", "Error Budget Gauge", "Prevention vs Response Ratio"],
    realWorld: [
      "Pre-release reliability reviews block deploys when SLO burn risk is elevated",
      "GameDays run quarterly across top 10 services",
      "Capacity headroom enforced via automated forecasting",
    ],
    reporting: ["Reliability Trend Graph", "Incident Reduction Trend", "Error Budget Gauge", "Prevention vs Response Ratio"],
    talkingPoints: [
      "The best incident is the one that never occurs.",
      "Prevention investment compounds; reaction cost is linear.",
    ],
    coworkerOpportunities: [
      "SLO Sentinel — automated burn-rate detection and rollback",
      "Chaos Conductor — scheduled fault injection",
      "Capacity Forecaster — predictive scaling and headroom alerts",
    ],
    modernizationInitiatives: [
      "Stand up error budget policy across tier-1 services",
      "Adopt progressive delivery with automated SLO gates",
    ],
    serviceCatalog: ["SLO Service", "Chaos Engineering Service", "Reliability Review"],
    teamStructure: ["SRE Embedded Pods", "Platform Reliability Guild"],
    related: ["ownership", "automation", "platform"],
    radar: [
      { axis: "Prevention", current: 4, target: 5 },
      { axis: "Detection", current: 3, target: 5 },
      { axis: "Recovery", current: 3, target: 5 },
      { axis: "Learning", current: 2, target: 5 },
      { axis: "Resilience", current: 3, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 12 }, { m: "Q2", value: 9 }, { m: "Q3", value: 6 },
      { m: "Q4", value: 4 }, { m: "Q5", value: 3 }, { m: "Q6", value: 2 },
    ],
  },
  {
    id: "ownership",
    number: 2,
    title: "Service Ownership",
    tagline: "Every service has a clearly accountable owner end to end.",
    icon: UserCheck,
    accent: "#0F766E",
    ringClass: "ring-teal-200",
    industryTranslation: "Product Ownership",
    executiveDefinition: "Every service has a clearly accountable owner.",
    whyExists: "Without unambiguous ownership, decisions stall and accountability dilutes. Ownership is the operating contract that makes reliability and improvement possible.",
    looksLike: ["Clear ownership boundaries", "Defined escalation paths", "End-to-end accountability"],
    withoutIt: ["Ownership confusion", "Multiple escalation layers", "Slow recovery", "Accountability gaps"],
    practices: ["End-to-End Accountability", "Product Ownership", "Clear Boundaries", "Escalation Ownership"],
    antiPatterns: ["Shared responsibility", "Ticket ping-pong", "Blame & handoffs"],
    kpis: [
      { label: "Ownership Coverage", value: "96%", trend: "+18%" },
      { label: "Escalation Count", value: "1.4", trend: "-46%" },
      { label: "MTTR", value: "31 min", trend: "-35%" },
      { label: "Service Health Score", value: "92", trend: "+9" },
    ],
    slas: ["100% of tier-1 services have a named on-call owner", "Escalation resolved within 2 hops"],
    visuals: ["Ownership Heat Map", "Ownership Matrix", "Responsibility Radar"],
    realWorld: [
      "Each service registered in Compass-style catalog with primary, secondary, exec sponsor",
      "On-call rotation tied to service ownership, not function",
    ],
    reporting: ["Ownership Heat Map", "Service Ownership Matrix", "Responsibility Coverage Radar"],
    talkingPoints: ["Ownership should never be ambiguous.", "If two teams own it, no one does."],
    coworkerOpportunities: [
      "Owner Resolver — auto-routes alerts to the correct on-call",
      "Coverage Auditor — surfaces services without a defined owner",
    ],
    modernizationInitiatives: ["Adopt service registry with required ownership fields", "Tie funding model to service ownership"],
    serviceCatalog: ["Service Registry", "On-Call Management", "Ownership Audit"],
    teamStructure: ["Stream-aligned teams", "Service Owner role per product"],
    related: ["prevention", "collaboration", "platform"],
    radar: [
      { axis: "Coverage", current: 4, target: 5 },
      { axis: "Clarity", current: 4, target: 5 },
      { axis: "Escalation", current: 3, target: 5 },
      { axis: "Funding", current: 3, target: 5 },
      { axis: "Lifecycle", current: 3, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 60 }, { m: "Q2", value: 71 }, { m: "Q3", value: 82 },
      { m: "Q4", value: 88 }, { m: "Q5", value: 93 }, { m: "Q6", value: 96 },
    ],
  },
  {
    id: "collaboration",
    number: 3,
    title: "Collaborative Engineering",
    tagline: "We solve problems together, not by throwing tickets over the fence.",
    icon: Users,
    accent: "#1D4ED8",
    ringClass: "ring-blue-200",
    industryTranslation: "Flow-Based Organizations",
    executiveDefinition: "Teams solve problems together instead of routing tickets between silos.",
    whyExists: "Customer outcomes flow horizontally; functional silos optimize locally and degrade globally. Collaboration replaces queuing.",
    looksLike: ["Shared accountability", "Embedded engineering", "Cross-functional collaboration"],
    withoutIt: ["Ticket routing", "Delays", "Escalation chains", "Friction"],
    practices: ["Cross-Functional Teams", "Clear Communication", "Shared Context", "Collective Problem Solving"],
    antiPatterns: ["Siloed mindsets", "\"That's not my job\"", "Us vs. Them culture"],
    kpis: [
      { label: "Handoffs / Incident", value: "1.8", trend: "-66%" },
      { label: "Collaboration Score", value: "84", trend: "+22" },
      { label: "Reopened Incidents %", value: "3.1%", trend: "-58%" },
      { label: "CSAT / NPS", value: "62", trend: "+18" },
    ],
    slas: ["Cross-team incidents resolved within shared SLO", "Joint post-incident review within 5 days"],
    visuals: ["Workflow Map", "Cross-Team Collaboration Radar"],
    realWorld: [
      "Engineering, SRE and security co-own production health dashboards",
      "Major incidents triaged in shared rooms, not via tickets",
    ],
    reporting: ["Current State Workflow", "Future State Workflow", "Cross-Team Collaboration Radar"],
    talkingPoints: ["Collaboration should replace ticket routing.", "Tickets are evidence of broken flow."],
    coworkerOpportunities: [
      "Incident Companion — assembles context and stakeholders into one room",
      "Handoff Detector — flags chains exceeding threshold",
    ],
    modernizationInitiatives: ["Adopt shared SLOs across delivery, SRE, security", "Replace approval boards with policy-as-code"],
    serviceCatalog: ["Incident Collaboration Workspace", "Shared Observability"],
    teamStructure: ["Enabling teams", "Complicated-subsystem teams", "Stream-aligned squads"],
    related: ["ownership", "platform", "automation"],
    radar: [
      { axis: "Flow", current: 4, target: 5 },
      { axis: "Shared Context", current: 4, target: 5 },
      { axis: "Joint Tools", current: 3, target: 5 },
      { axis: "Trust", current: 3, target: 5 },
      { axis: "Rituals", current: 4, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 5.2 }, { m: "Q2", value: 4.1 }, { m: "Q3", value: 3.2 },
      { m: "Q4", value: 2.4 }, { m: "Q5", value: 2.0 }, { m: "Q6", value: 1.8 },
    ],
  },
  {
    id: "platform",
    number: 4,
    title: "Shared Platform Services",
    tagline: "Common capabilities are built once, secured, and consumed everywhere.",
    icon: Boxes,
    accent: "#0F766E",
    ringClass: "ring-emerald-200",
    industryTranslation: "Platform Engineering",
    executiveDefinition: "Common capabilities are delivered once and consumed everywhere.",
    whyExists: "Reinventing core capabilities per team multiplies cost, risk and tech debt. Platforms convert reliability and security into reusable services.",
    looksLike: ["Cloud Platform", "Identity Platform", "Observability Platform", "CI/CD Platform", "Data Platform"],
    withoutIt: ["Reinventing solutions", "Snowflake environments", "Ad-hoc tooling sprawl"],
    practices: ["Platform Engineering", "Self-Service Portal", "Reusable Services", "Golden Paths & Guardrails"],
    antiPatterns: ["Reinventing solutions", "Snowflake environments", "Ad-hoc tooling sprawl"],
    kpis: [
      { label: "Shared Service Adoption", value: "78%", trend: "+24%" },
      { label: "Self-Service Utilization", value: "71%", trend: "+31%" },
      { label: "Platform Consistency", value: "88%", trend: "+12%" },
      { label: "Time to Provision", value: "9 min", trend: "-83%" },
    ],
    slas: ["Platform availability 99.95%", "Golden path provisioning < 15 min"],
    visuals: ["Service Catalog", "Adoption Heat Map"],
    realWorld: [
      "Internal developer portal exposes paved-path templates",
      "Identity, observability, CI/CD consumed as platform products",
    ],
    reporting: ["Platform Service Catalog", "Consumer Adoption Heat Map"],
    talkingPoints: ["Build once. Consume many.", "Platforms turn reliability into a product."],
    coworkerOpportunities: [
      "Paved-Path Advisor — recommends golden templates",
      "Drift Watcher — detects deviation from platform standards",
    ],
    modernizationInitiatives: ["Establish internal developer platform", "Define golden paths for top 5 workloads"],
    serviceCatalog: ["Compute", "Identity", "Observability", "CI/CD", "Data"],
    teamStructure: ["Platform engineering team(s)", "Product manager per platform"],
    related: ["automation", "ownership", "modernization"],
    radar: [
      { axis: "Adoption", current: 4, target: 5 },
      { axis: "Self-Service", current: 4, target: 5 },
      { axis: "Coverage", current: 3, target: 5 },
      { axis: "Reliability", current: 4, target: 5 },
      { axis: "DX", current: 3, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 32 }, { m: "Q2", value: 44 }, { m: "Q3", value: 58 },
      { m: "Q4", value: 66 }, { m: "Q5", value: 73 }, { m: "Q6", value: 78 },
    ],
  },
  {
    id: "automation",
    number: 5,
    title: "Automation First",
    tagline: "Humans focus on decisions. Automation handles repetition.",
    icon: Cog,
    accent: "#C2410C",
    ringClass: "ring-orange-200",
    industryTranslation: "Agentic Operations",
    executiveDefinition: "Humans focus on decisions. Automation handles repetition.",
    whyExists: "Toil is a tax on engineering capacity. Automation converts repeatable work into reliable, observable systems and frees humans for judgement.",
    looksLike: ["Automated remediation", "Automated validation", "Automated patching", "Automated scaling"],
    withoutIt: ["Manual, repetitive work", "Tribal knowledge runbooks", "Low automation maturity"],
    practices: ["Runbook Automation", "Self-Healing", "Policy as Code", "AI / Agentic Operations"],
    antiPatterns: ["Manual repetitive work", "Tribal knowledge runbooks", "Low automation maturity"],
    kpis: [
      { label: "Automation Coverage", value: "76%", trend: "+22%" },
      { label: "Toil Reduction", value: "63%", trend: "+18%" },
      { label: "Automated Recovery", value: "58%", trend: "+27%" },
      { label: "Manual Interventions", value: "22%", trend: "-44%" },
    ],
    slas: ["Auto-remediation for top 20 alert classes", "Patch automation cycle ≤ 7 days"],
    visuals: ["Automation Coverage Gauge", "Manual vs Automated Activity Trend"],
    realWorld: [
      "Self-healing runbooks resolve common alerts without paging",
      "Policy-as-code blocks non-compliant change at PR time",
    ],
    reporting: ["Automation Coverage Gauge", "Manual vs Automated Activity Trend"],
    talkingPoints: ["Human judgment should be reserved for high-value decisions.", "If we did it twice, we should automate it."],
    coworkerOpportunities: [
      "Runbook Operator — executes parameterized runbooks safely",
      "Patch Pilot — automates risk-scored patch waves",
    ],
    modernizationInitiatives: ["Build automation catalog", "Adopt policy-as-code across CI/CD"],
    serviceCatalog: ["Runbook Service", "Policy Service", "Agent Catalog"],
    teamStructure: ["Automation guild", "Agent operations team"],
    related: ["platform", "prevention", "modernization"],
    radar: [
      { axis: "Coverage", current: 4, target: 5 },
      { axis: "Safety", current: 4, target: 5 },
      { axis: "Reuse", current: 3, target: 5 },
      { axis: "Telemetry", current: 4, target: 5 },
      { axis: "Adoption", current: 3, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 28 }, { m: "Q2", value: 41 }, { m: "Q3", value: 55 },
      { m: "Q4", value: 64 }, { m: "Q5", value: 71 }, { m: "Q6", value: 76 },
    ],
  },
  {
    id: "modernization",
    number: 6,
    title: "Continuous Modernization",
    tagline: "Technology continuously evolves. Technical debt continuously declines.",
    icon: RefreshCw,
    accent: "#1D4ED8",
    ringClass: "ring-blue-200",
    industryTranslation: "Technology Investment Strategy",
    executiveDefinition: "Technology continuously evolves.",
    whyExists: "Software ages. Without a continuous modernization loop, debt compounds and optionality narrows.",
    looksLike: ["Modern Architectures", "Containerization", "Refactoring", "Retire What We Don't Need"],
    withoutIt: ["Preserve for forever", "Big bang rewrites", "Ignoring technical debt"],
    practices: ["Modern Architectures", "Containerization", "Refactoring", "Retire What We Don't Need"],
    antiPatterns: ["Preserve for forever", "Big bang rewrites", "Ignoring technical debt"],
    kpis: [
      { label: "Technical Debt Index", value: "31", trend: "-19" },
      { label: "Container Adoption", value: "72%", trend: "+24%" },
      { label: "Legacy Asset Reduction", value: "28%", trend: "+11%" },
      { label: "Deployment Frequency", value: "8.4 / day", trend: "+3.1x" },
    ],
    slas: ["Modernization milestones reported quarterly", "Legacy retirement ≥ 10% per year"],
    visuals: ["Modernization Roadmap", "Technical Debt Trend", "Application Modernization Heat Map"],
    realWorld: [
      "Quarterly architecture review board sets retirement and refactor targets",
      "Application portfolio scored against modernization criteria",
    ],
    reporting: ["Modernization Roadmap", "Technical Debt Trend", "Application Modernization Heat Map"],
    talkingPoints: ["Technical debt compounds when ignored.", "Modernization is a rhythm, not a project."],
    coworkerOpportunities: [
      "Debt Analyst — quantifies and trends technical debt",
      "Retirement Scout — identifies sunset candidates",
    ],
    modernizationInitiatives: ["Containerize tier-1 legacy workloads", "Establish portfolio modernization scorecard"],
    serviceCatalog: ["Refactor Service", "Containerization Factory", "Sunset Service"],
    teamStructure: ["Modernization tiger teams", "Architecture review board"],
    related: ["platform", "automation", "acquisition"],
    radar: [
      { axis: "Visibility", current: 4, target: 5 },
      { axis: "Velocity", current: 3, target: 5 },
      { axis: "Retirement", current: 3, target: 5 },
      { axis: "Standards", current: 4, target: 5 },
      { axis: "Funding", current: 3, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 52 }, { m: "Q2", value: 47 }, { m: "Q3", value: 41 },
      { m: "Q4", value: 38 }, { m: "Q5", value: 34 }, { m: "Q6", value: 31 },
    ],
  },
  {
    id: "acquisition",
    number: 7,
    title: "Acquisition Readiness",
    tagline: "We can integrate, secure, and operate acquisitions within 60 days.",
    icon: Building2,
    accent: "#7C2D12",
    ringClass: "ring-amber-200",
    industryTranslation: "Acquisition Integration Factory",
    executiveDefinition: "Organizations can absorb acquisitions without creating operational chaos.",
    whyExists: "Inorganic growth fails operationally when each acquisition is bespoke. A factory model converts integrations into a repeatable, predictable motion.",
    looksLike: ["Standard onboarding", "Standard tooling", "Standard observability", "Standard identity"],
    withoutIt: ["One-off integrations", "Long stabilization cycles", "Inconsistent patterns"],
    practices: ["Standardized Landing Zone", "Rapid Onboarding", "Identity & Access", "Operating Model Playbooks"],
    antiPatterns: ["One-off integrations", "Long stabilization cycles", "Inconsistent patterns"],
    kpis: [
      { label: "Time to Stand Up", value: "42 days", trend: "-58%" },
      { label: "Integration Cycle", value: "63 days", trend: "-49%" },
      { label: "Security Compliance Time", value: "21 days", trend: "-44%" },
      { label: "Acquisition Success Score", value: "87", trend: "+19" },
    ],
    slas: ["Operational readiness within 60 days", "Identity unification within 30 days"],
    visuals: ["Acquisition Factory Workflow", "Integration Readiness Radar"],
    realWorld: [
      "Acquire → Assess → Standardize → Integrate → Operate factory",
      "Pre-built landing zone provisioned within 5 business days",
    ],
    reporting: ["Acquisition Factory Workflow", "Integration Readiness Radar"],
    talkingPoints: ["Every acquisition should become easier than the last.", "Integration speed is an enterprise capability."],
    coworkerOpportunities: [
      "Onboarding Orchestrator — provisions landing zone & identity",
      "Compliance Mapper — accelerates control inheritance",
    ],
    modernizationInitiatives: ["Stand up acquisition factory playbook", "Pre-build standard landing zones"],
    serviceCatalog: ["Landing Zone", "Identity Unification", "Tooling Standard Pack"],
    teamStructure: ["Acquisition integration office", "Integration SRE pod"],
    related: ["platform", "ownership", "security"],
    radar: [
      { axis: "Playbook", current: 4, target: 5 },
      { axis: "Landing Zone", current: 4, target: 5 },
      { axis: "Identity", current: 3, target: 5 },
      { axis: "Observability", current: 3, target: 5 },
      { axis: "Governance", current: 4, target: 5 },
    ],
    trend: [
      { m: "M1", value: 120 }, { m: "M2", value: 96 }, { m: "M3", value: 78 },
      { m: "M4", value: 64 }, { m: "M5", value: 52 }, { m: "M6", value: 42 },
    ],
  },
  {
    id: "security",
    number: 8,
    title: "Security By Design",
    tagline: "Security is embedded into engineering workflows.",
    icon: Lock,
    accent: "#0F766E",
    ringClass: "ring-emerald-200",
    industryTranslation: "DevSecOps",
    executiveDefinition: "Security is embedded in engineering workflows.",
    whyExists: "Security bolted on at the end produces friction, delay, and gaps. Embedding it in the engineering lifecycle yields both speed and assurance.",
    looksLike: ["DevSecOps", "Zero Trust", "Identity Security", "Compliance Automation"],
    withoutIt: ["Security as a gate", "Manual compliance", "Shared privileged access"],
    practices: ["DevSecOps", "Shift Left Security", "Zero Trust", "Compliance Automation"],
    antiPatterns: ["Security as a gate", "Manual compliance", "Shared privileged access"],
    kpis: [
      { label: "Patch Compliance", value: "94%", trend: "+11%" },
      { label: "Vulnerability Exposure", value: "Low", trend: "-37%" },
      { label: "Identity Coverage", value: "98%", trend: "+6%" },
      { label: "Security Lead Time", value: "2.1 days", trend: "-61%" },
    ],
    slas: ["Critical CVE remediation < 7 days", "MFA coverage 100%"],
    visuals: ["Security Posture Dashboard", "Risk Reduction Trend"],
    realWorld: [
      "Security scanners enforce policy in CI/CD",
      "Just-in-time privileged access replaces standing admin",
    ],
    reporting: ["Security Posture Dashboard", "Risk Reduction Trend"],
    talkingPoints: ["Security should be embedded, not bolted on.", "Speed and security are not a trade-off."],
    coworkerOpportunities: [
      "CVE Triager — risk-scores and routes vulnerabilities",
      "Access Reviewer — automates least-privilege reviews",
    ],
    modernizationInitiatives: ["Embed scanners in every pipeline", "Adopt zero-trust identity baseline"],
    serviceCatalog: ["Scanner Service", "Identity Platform", "Compliance Automation"],
    teamStructure: ["Security guild", "Embedded security engineers"],
    related: ["platform", "automation", "acquisition"],
    radar: [
      { axis: "Shift-Left", current: 4, target: 5 },
      { axis: "Zero Trust", current: 4, target: 5 },
      { axis: "Compliance", current: 4, target: 5 },
      { axis: "Identity", current: 5, target: 5 },
      { axis: "Response", current: 3, target: 5 },
    ],
    trend: [
      { m: "Q1", value: 71 }, { m: "Q2", value: 78 }, { m: "Q3", value: 84 },
      { m: "Q4", value: 88 }, { m: "Q5", value: 91 }, { m: "Q6", value: 94 },
    ],
  },
];

const OUTCOMES: Outcome[] = [
  {
    id: "reliability", title: "Reliability", metric: "99.95%+", caption: "Service Availability (Target)",
    icon: ShieldCheck, accent: "#6D28D9",
    panels: [
      { title: "Availability Trends", items: ["Tier-1 availability 99.962% trailing 90d", "No tier-1 SLO miss last 2 quarters"] },
      { title: "SLO Performance", items: ["92% of services meeting SLO", "Top 3 SLO burners under remediation"] },
      { title: "Error Budget Performance", items: ["Burn rate 62% of quarterly budget", "Auto-freeze on >2x burn"] },
    ],
    trend: [{ m: "Q1", value: 99.82 }, { m: "Q2", value: 99.89 }, { m: "Q3", value: 99.93 }, { m: "Q4", value: 99.95 }, { m: "Q5", value: 99.96 }, { m: "Q6", value: 99.96 }],
  },
  {
    id: "velocity", title: "Delivery Velocity", metric: "5x", caption: "Faster Change Throughput",
    icon: Rocket, accent: "#C2410C",
    panels: [
      { title: "Lead Time For Change", items: ["Median 1.4 days", "P90 3.1 days"] },
      { title: "Deployment Frequency", items: ["8.4 deploys / day", "On-demand for 78% of services"] },
      { title: "Release Success", items: ["Change failure rate 4.2%", "Auto-rollback on SLO burn"] },
    ],
    trend: [{ m: "Q1", value: 1 }, { m: "Q2", value: 1.6 }, { m: "Q3", value: 2.4 }, { m: "Q4", value: 3.2 }, { m: "Q5", value: 4.1 }, { m: "Q6", value: 5 }],
  },
  {
    id: "automation", title: "Automation Coverage", metric: "75%+", caption: "Of Operational Tasks Automated",
    icon: Cog, accent: "#C2410C",
    panels: [
      { title: "Automation Inventory", items: ["312 automations in catalog", "184 self-service consumable"] },
      { title: "Agent Catalog", items: ["27 production agents", "9 in safety review"] },
      { title: "Toil Reduction", items: ["63% toil reduction trailing 12 months", "Top 10 toil sources tracked"] },
    ],
    trend: [{ m: "Q1", value: 28 }, { m: "Q2", value: 41 }, { m: "Q3", value: 55 }, { m: "Q4", value: 64 }, { m: "Q5", value: 71 }, { m: "Q6", value: 76 }],
  },
  {
    id: "standardization", title: "Standardization", metric: "90%+", caption: "Workloads on Standard Platforms",
    icon: Boxes, accent: "#0F766E",
    panels: [
      { title: "Platform Standardization", items: ["88% workloads on golden paths", "12% in remediation backlog"] },
      { title: "Pipeline Standardization", items: ["Single CI/CD platform across 94% of services"] },
      { title: "Service Standardization", items: ["Catalog coverage 96%", "Drift alerts active"] },
    ],
    trend: [{ m: "Q1", value: 52 }, { m: "Q2", value: 64 }, { m: "Q3", value: 73 }, { m: "Q4", value: 81 }, { m: "Q5", value: 87 }, { m: "Q6", value: 90 }],
  },
  {
    id: "modernization", title: "Modernization Progress", metric: "Quarterly", caption: "Clear Visibility into Tech Evolution",
    icon: RefreshCw, accent: "#1D4ED8",
    panels: [
      { title: "Roadmap", items: ["8 modernization waves in flight", "Quarterly board review"] },
      { title: "Completed Initiatives", items: ["27 retirements YTD", "14 refactors closed"] },
      { title: "Remaining Debt", items: ["Debt index reduced from 52 → 31", "Top 5 debt clusters quantified"] },
    ],
    trend: [{ m: "Q1", value: 52 }, { m: "Q2", value: 47 }, { m: "Q3", value: 41 }, { m: "Q4", value: 38 }, { m: "Q5", value: 34 }, { m: "Q6", value: 31 }],
  },
  {
    id: "acquisition", title: "Acquisition Readiness", metric: "<90 Days", caption: "Systems Reprovisioned Post-Acquisition",
    icon: Building2, accent: "#7C2D12",
    panels: [
      { title: "Integration Score", items: ["Last 3 acquisitions: 87 / 84 / 91", "Trending upward"] },
      { title: "Operational Readiness", items: ["Identity unified in 21 days median", "Observability in 18 days median"] },
      { title: "Standardization Coverage", items: ["94% of acquired workloads on standard tooling within 90 days"] },
    ],
    trend: [{ m: "M1", value: 120 }, { m: "M2", value: 96 }, { m: "M3", value: 78 }, { m: "M4", value: 64 }, { m: "M5", value: 52 }, { m: "M6", value: 42 }],
  },
];

const FRAMEWORKS: Framework[] = [
  {
    id: "sre", name: "Google SRE", caption: "Reliability engineering discipline", icon: ShieldCheck, accent: "#6D28D9",
    what: "An engineering discipline that treats operations as a software problem with SLOs, error budgets and toil reduction.",
    why: "Provides quantitative reliability targets the business can reason about, and a budget for change velocity.",
    influence: ["Defines SLOs and error budgets", "Frames toil as work to be eliminated", "Embeds reliability into engineering practice"],
    pitfalls: ["Treating SRE as a renamed ops team", "Setting SLOs without business input", "No enforcement of error budget policy"],
    useCases: ["Set per-service SLOs", "Auto-freeze releases on burn", "Quarterly reliability reviews"],
    relatedFoundations: ["prevention", "ownership", "automation"],
  },
  {
    id: "topologies", name: "Team Topologies", caption: "Organizing around flow and value", icon: Users, accent: "#1D4ED8",
    what: "An organizational design model with four team types and three interaction modes optimized for flow.",
    why: "Removes coordination cost by aligning team structure to value streams.",
    influence: ["Defines stream-aligned, enabling, complicated-subsystem and platform teams", "Constrains cognitive load"],
    pitfalls: ["Renaming teams without changing interactions", "Platform team without product mindset"],
    useCases: ["Realign squads to product domains", "Stand up enabling teams for new capabilities"],
    relatedFoundations: ["ownership", "collaboration", "platform"],
  },
  {
    id: "platformeng", name: "Platform Engineering", caption: "Reusable capabilities and self-service", icon: Boxes, accent: "#0F766E",
    what: "Practice of building internal platforms as products, with golden paths and developer self-service.",
    why: "Compounds engineering productivity and standardizes reliability and security.",
    influence: ["Internal developer portal", "Golden path templates", "Paved roads vs guardrails"],
    pitfalls: ["Building a tool, not a product", "No platform PM or roadmap", "Mandates without incentives"],
    useCases: ["Provision environments in minutes", "Centralize identity and observability"],
    relatedFoundations: ["platform", "automation", "modernization"],
  },
  {
    id: "techinvest", name: "Technology Investment Strategy", caption: "Evolve, retire, and reinvest", icon: TrendingUp, accent: "#1D4ED8",
    what: "A continuous portfolio management discipline that evolves, retires and reinvests across the technology estate.",
    why: "Prevents technical debt accumulation and protects optionality.",
    influence: ["Portfolio scoring", "Retirement targets", "Funding model tied to outcomes"],
    pitfalls: ["Modernization treated as one-time program", "No retirement targets"],
    useCases: ["Quarterly portfolio review", "Sunset legacy systems on schedule"],
    relatedFoundations: ["modernization", "platform", "acquisition"],
  },
  {
    id: "devsecops", name: "DevSecOps", caption: "Security embedded in the lifecycle", icon: Code2, accent: "#0F766E",
    what: "Embeds security activities and controls into the engineering lifecycle through automation.",
    why: "Yields both speed and assurance; reduces last-mile security cost.",
    influence: ["Scanners in CI/CD", "Policy as code", "Shift-left security"],
    pitfalls: ["Security as gate, not partner", "Tool sprawl without policy", "No measurable lead time"],
    useCases: ["Block deploys on critical CVEs", "Automate compliance evidence"],
    relatedFoundations: ["security", "automation", "platform"],
  },
  {
    id: "finops", name: "FinOps", caption: "Financial accountability and transparency", icon: DollarSign, accent: "#0F766E",
    what: "An operating model that brings financial accountability to cloud and platform spend.",
    why: "Aligns engineering decisions to unit economics and business outcomes.",
    influence: ["Showback and chargeback", "Unit economics", "Forecast and budget discipline"],
    pitfalls: ["Cost cutting without engineering partnership", "No unit metric"],
    useCases: ["Per-service cost dashboards", "Right-sizing automation"],
    relatedFoundations: ["platform", "modernization", "automation"],
  },
];

const ENABLERS = [
  { label: "Better Experiences", icon: Smile },
  { label: "Greater Resilience", icon: ShieldCheck },
  { label: "Faster Delivery", icon: Rocket },
  { label: "Higher Business Value", icon: TrendingUp },
];

/* ---------------- Page ---------------- */

export default function ReliabilityFoundations() {
  const [openFoundation, setOpenFoundation] = useState<Foundation | null>(null);
  const [openOutcome, setOpenOutcome] = useState<Outcome | null>(null);
  const [openFramework, setOpenFramework] = useState<Framework | null>(null);
  const [openPurpose, setOpenPurpose] = useState(false);
  const [openEnabler, setOpenEnabler] = useState<string | null>(null);

  const headerKpis = useMemo(
    () => [
      { label: "Availability", value: "99.95%+" },
      { label: "Automation", value: "76%" },
      { label: "Standardization", value: "90%" },
      { label: "Acquisition", value: "<90d" },
    ],
    []
  );

  return (
    <AppShell>
      <div className="min-h-full bg-white text-slate-900">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="px-8 py-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider mb-2">
                  <span>Site Resilience Engineering</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-slate-700">Foundations</span>
                </div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                  Foundations of the Production Reliability Operating Model
                </h1>
                <p className="mt-2 text-slate-600 max-w-3xl">
                  The core beliefs and design principles that guide how high-performing organizations build, run, and evolve reliable products at scale.
                </p>
              </div>
              <div className="hidden lg:flex gap-2 text-xs">
                {headerKpis.map((k) => (
                  <Badge key={k.label} variant="outline" className="border-slate-300 text-slate-600 font-normal">
                    {k.label}: <span className="ml-1 font-semibold text-slate-800">{k.value}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 px-8 py-6">
          {/* Main column */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            {/* Purpose + Enable ribbon */}
            <Card className="border-slate-200 p-5 bg-gradient-to-br from-white to-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <button
                  onClick={() => setOpenPurpose(true)}
                  className="lg:col-span-7 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center ring-1 ring-emerald-100">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">Our Purpose</div>
                      <p className="text-sm text-slate-800 mt-1 leading-relaxed group-hover:text-slate-900">
                        Deliver reliable, secure, and cost-effective services that create exceptional experiences for our users
                        and measurable value for the business.
                      </p>
                    </div>
                  </div>
                </button>

                <div className="lg:col-span-5">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold text-center mb-2">We Enable</div>
                  <div className="grid grid-cols-4 gap-2">
                    {ENABLERS.map((e) => {
                      const Icon = e.icon;
                      return (
                        <button
                          key={e.label}
                          onClick={() => setOpenEnabler(e.label)}
                          className="rounded-md border border-slate-200 hover:border-slate-400 hover:bg-white px-2 py-3 text-center transition"
                        >
                          <Icon className="h-5 w-5 mx-auto text-slate-700" />
                          <div className="text-[10px] font-medium text-slate-700 mt-1 leading-tight">{e.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Foundations grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-900" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Eight Foundations</h2>
                  <span className="text-xs text-slate-400">(click any element to drill in)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {FOUNDATIONS.map((f) => (
                  <FoundationCard key={f.id} f={f} onOpen={setOpenFoundation} />
                ))}
              </div>
            </div>

            {/* Outcomes */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Outcomes We Deliver</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {OUTCOMES.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setOpenOutcome(o)}
                      className="text-left rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400 hover:shadow-sm transition group"
                    >
                      <div className="h-8 w-8 rounded-md flex items-center justify-center mb-3"
                           style={{ backgroundColor: `${o.accent}14`, color: o.accent }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">{o.title}</div>
                      <div className="text-xl font-semibold text-slate-900 mt-0.5 leading-tight">{o.metric}</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-2">{o.caption}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Bottom band */}
            <Card className="border-slate-900 bg-slate-900 text-white p-5">
              <div className="flex items-start gap-3">
                <Compass className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm leading-relaxed">
                    These foundations guide every decision, every investment, and every interaction across the production reliability operating model.
                  </p>
                  <p className="text-sm text-emerald-300 mt-1">
                    They ensure consistent outcomes today while building the optionality required for tomorrow.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Side rail: industry practices */}
          <aside className="col-span-12 xl:col-span-3 space-y-4">
            <Card className="border-slate-200 p-4 sticky top-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                Inspired by Leading Industry Practices
              </div>
              <div className="space-y-2">
                {FRAMEWORKS.map((fr) => {
                  const Icon = fr.icon;
                  return (
                    <button
                      key={fr.id}
                      onClick={() => setOpenFramework(fr)}
                      className="w-full text-left flex items-start gap-3 rounded-md border border-slate-200 px-3 py-2.5 hover:border-slate-400 hover:bg-slate-50 transition"
                    >
                      <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
                           style={{ backgroundColor: `${fr.accent}14`, color: fr.accent }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">{fr.name}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{fr.caption}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 ml-auto shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Operating Health</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>SLO Compliance</span><span className="font-semibold text-slate-900">92%</span>
                    </div>
                    <Progress value={92} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Automation Coverage</span><span className="font-semibold text-slate-900">76%</span>
                    </div>
                    <Progress value={76} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Standardization</span><span className="font-semibold text-slate-900">90%</span>
                    </div>
                    <Progress value={90} className="h-1.5" />
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>

        {/* Foundation Sheet */}
        <Sheet open={!!openFoundation} onOpenChange={(o) => !o && setOpenFoundation(null)}>
          <SheetContent side="right" className="w-full sm:max-w-none sm:w-[35vw] overflow-y-auto bg-white">
            {openFoundation && <FoundationDetail f={openFoundation} onJump={(id) => {
              const next = FOUNDATIONS.find((x) => x.id === id);
              if (next) setOpenFoundation(next);
            }} onClose={() => setOpenFoundation(null)} />}
          </SheetContent>
        </Sheet>

        {/* Outcome Sheet */}
        <Sheet open={!!openOutcome} onOpenChange={(o) => !o && setOpenOutcome(null)}>
          <SheetContent side="right" className="w-full sm:max-w-none sm:w-[35vw] overflow-y-auto bg-white">
            {openOutcome && <OutcomeDetail o={openOutcome} onClose={() => setOpenOutcome(null)} />}
          </SheetContent>
        </Sheet>

        {/* Framework Sheet */}
        <Sheet open={!!openFramework} onOpenChange={(o) => !o && setOpenFramework(null)}>
          <SheetContent side="right" className="w-full sm:max-w-none sm:w-[35vw] overflow-y-auto bg-white">
            {openFramework && <FrameworkDetail fr={openFramework} onClose={() => setOpenFramework(null)} onJump={(id) => {
              const next = FOUNDATIONS.find((x) => x.id === id);
              if (next) { setOpenFramework(null); setOpenFoundation(next); }
            }} />}
          </SheetContent>
        </Sheet>

        {/* Purpose Sheet */}
        <Sheet open={openPurpose} onOpenChange={setOpenPurpose}>
          <SheetContent side="right" className="w-full sm:max-w-none sm:w-[35vw] overflow-y-auto bg-white">
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl">Our Purpose</SheetTitle>
              <SheetDescription>
                Deliver reliable, secure, and cost-effective services that create exceptional experiences for our users and measurable value for the business.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-5">
              <Section title="Why It Exists">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Purpose anchors trade-offs. Every reliability, security, cost and velocity decision is evaluated against this statement,
                  so engineering choices remain aligned with customer outcomes and enterprise value.
                </p>
              </Section>
              <Section title="How It Shows Up">
                <Bullets items={[
                  "Investment cases reference purpose explicitly",
                  "SLOs derived from customer-impacting journeys",
                  "Engineering OKRs map to purpose pillars",
                ]} />
              </Section>
              <Section title="What Happens Without It">
                <Bullets items={[
                  "Conflicting priorities between teams",
                  "Reliability investments deprioritized",
                  "Local optimization erodes customer trust",
                ]} />
              </Section>
            </div>
          </SheetContent>
        </Sheet>

        {/* Enabler Sheet */}
        <Sheet open={!!openEnabler} onOpenChange={(o) => !o && setOpenEnabler(null)}>
          <SheetContent side="right" className="w-full sm:max-w-none sm:w-[35vw] overflow-y-auto bg-white">
            {openEnabler && <EnablerDetail label={openEnabler} onClose={() => setOpenEnabler(null)} />}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ---------------- Cards & Details ---------------- */

function FoundationCard({ f, onOpen }: { f: Foundation; onOpen: (f: Foundation) => void }) {
  const Icon = f.icon;
  return (
    <div className={`rounded-lg border border-slate-200 bg-white hover:shadow-md hover:border-slate-300 transition-all group`}>
      <button onClick={() => onOpen(f)} className="w-full text-left p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400">{String(f.number).padStart(2, "0")}</span>
            <div className={`h-9 w-9 rounded-full grid place-items-center ring-2 ${f.ringClass}`}
                 style={{ backgroundColor: `${f.accent}10`, color: f.accent }}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700" />
        </div>
        <h3 className="mt-3 text-sm font-semibold tracking-tight uppercase" style={{ color: f.accent }}>
          {f.title}
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-snug">{f.tagline}</p>
      </button>

      <div className="border-t border-slate-100 px-4 py-3 space-y-2">
        <SubList label="Key Practices" items={f.practices} color="text-slate-700" onPick={() => onOpen(f)} />
        <SubList label="KPIs to Watch" items={f.kpis.slice(0, 4).map((k) => k.label)} color="text-slate-700" onPick={() => onOpen(f)} />
        <SubList label="Anti-Patterns" items={f.antiPatterns} color="text-rose-700" onPick={() => onOpen(f)} />
      </div>
    </div>
  );
}

function SubList({ label, items, color, onPick }: { label: string; items: string[]; color: string; onPick: () => void }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <ul className="mt-1 space-y-0.5">
        {items.map((it) => (
          <li key={it}>
            <button onClick={onPick} className={`text-[11px] ${color} hover:text-slate-900 hover:underline underline-offset-2 text-left`}>
              • {it}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FoundationDetail({ f, onClose, onJump }: { f: Foundation; onClose: () => void; onJump: (id: string) => void }) {
  const Icon = f.icon;
  return (
    <>
      <SheetHeader className="text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-md grid place-items-center"
                 style={{ backgroundColor: `${f.accent}14`, color: f.accent }}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="border-slate-300 text-slate-600 text-[10px] mb-1">
                Foundation {String(f.number).padStart(2, "0")} · {f.industryTranslation}
              </Badge>
              <SheetTitle className="text-xl text-slate-900">{f.title}</SheetTitle>
              <SheetDescription className="text-slate-600">{f.executiveDefinition}</SheetDescription>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-2">
          {f.kpis.map((k) => (
            <div key={k.label} className="rounded-md border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{k.label}</div>
              <div className="text-lg font-semibold text-slate-900 mt-0.5">{k.value}</div>
              {k.trend && (
                <div className={`text-[10px] mt-0.5 ${k.trend.startsWith("-") ? "text-emerald-600" : "text-emerald-600"}`}>
                  {k.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        <Section title="Trend">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={f.trend}>
                <defs>
                  <linearGradient id={`g-${f.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={f.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={f.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke={f.accent} fill={`url(#g-${f.id})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Maturity Radar">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={f.radar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#475569" }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} angle={30} domain={[0, 5]} />
                <Radar name="Current" dataKey="current" stroke={f.accent} fill={f.accent} fillOpacity={0.35} />
                <Radar name="Target" dataKey="target" stroke="#64748b" fill="#64748b" fillOpacity={0.08} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Why This Foundation Exists">
          <p className="text-sm text-slate-700 leading-relaxed">{f.whyExists}</p>
        </Section>

        <div className="grid grid-cols-1 gap-4">
          <Section title="What It Looks Like in Real Organizations"><Bullets items={f.looksLike} /></Section>
          <Section title="What Happens Without It"><Bullets items={f.withoutIt} /></Section>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Section title="Operational Characteristics"><Bullets items={f.realWorld} /></Section>
          <Section title="Common Anti-Patterns"><Bullets items={f.antiPatterns} /></Section>
        </div>

        <Section title="Typical SLAs"><Bullets items={f.slas} /></Section>
        <Section title="Suggested Reporting Widgets"><Bullets items={f.reporting} /></Section>

        <Section title="Executive Talking Points">
          <div className="space-y-2">
            {f.talkingPoints.map((t, i) => (
              <div key={i} className="rounded-md bg-slate-50 border-l-2 border-slate-300 px-3 py-2 text-sm text-slate-700 italic">
                {t}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Example Service Catalog"><Bullets items={f.serviceCatalog} /></Section>
        <Section title="Example Team Structure"><Bullets items={f.teamStructure} /></Section>
        <Section title="Example Modernization Initiatives"><Bullets items={f.modernizationInitiatives} /></Section>
        <Section title="Digital Coworker Opportunities"><Bullets items={f.coworkerOpportunities} /></Section>

        <Section title="Related Foundations">
          <div className="flex flex-wrap gap-1.5">
            {f.related.map((rid) => {
              const r = FOUNDATIONS.find((x) => x.id === rid);
              if (!r) return null;
              return (
                <button
                  key={rid}
                  onClick={() => onJump(rid)}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-slate-700"
                >
                  {r.title}
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}

function OutcomeDetail({ o, onClose }: { o: Outcome; onClose: () => void }) {
  const Icon = o.icon;
  return (
    <>
      <SheetHeader className="text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-md grid place-items-center"
                 style={{ backgroundColor: `${o.accent}14`, color: o.accent }}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="border-slate-300 text-slate-600 text-[10px] mb-1">Outcome</Badge>
              <SheetTitle className="text-xl text-slate-900">{o.title}</SheetTitle>
              <SheetDescription className="text-slate-600">{o.caption} · <span className="font-semibold text-slate-900">{o.metric}</span></SheetDescription>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        <Section title="Trend">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={o.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", fontSize: 11 }} />
                <Line type="monotone" dataKey="value" stroke={o.accent} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {o.panels.map((p) => (
          <Section key={p.title} title={p.title}>
            <Bullets items={p.items} />
          </Section>
        ))}
      </div>
    </>
  );
}

function FrameworkDetail({ fr, onClose, onJump }: { fr: Framework; onClose: () => void; onJump: (id: string) => void }) {
  const Icon = fr.icon;
  return (
    <>
      <SheetHeader className="text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-md grid place-items-center"
                 style={{ backgroundColor: `${fr.accent}14`, color: fr.accent }}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="outline" className="border-slate-300 text-slate-600 text-[10px] mb-1">Industry Practice</Badge>
              <SheetTitle className="text-xl text-slate-900">{fr.name}</SheetTitle>
              <SheetDescription className="text-slate-600">{fr.caption}</SheetDescription>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-5">
        <Section title="What It Is"><p className="text-sm text-slate-700 leading-relaxed">{fr.what}</p></Section>
        <Section title="Why It Matters"><p className="text-sm text-slate-700 leading-relaxed">{fr.why}</p></Section>
        <Section title="How It Influences Product Reliability"><Bullets items={fr.influence} /></Section>
        <Section title="What Organizations Usually Get Wrong"><Bullets items={fr.pitfalls} /></Section>
        <Section title="Example Use Cases"><Bullets items={fr.useCases} /></Section>
        <Section title="Related Foundations">
          <div className="flex flex-wrap gap-1.5">
            {fr.relatedFoundations.map((rid) => {
              const r = FOUNDATIONS.find((x) => x.id === rid);
              if (!r) return null;
              return (
                <button key={rid} onClick={() => onJump(rid)} className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-slate-700">
                  {r.title}
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}

function EnablerDetail({ label, onClose }: { label: string; onClose: () => void }) {
  const map: Record<string, { why: string; how: string[]; metrics: string[] }> = {
    "Better Experiences": {
      why: "Reliability and performance shape user trust and adoption.",
      how: ["Customer-journey-aligned SLOs", "Experience telemetry tied to journeys", "Post-incident customer comms"],
      metrics: ["Journey availability", "P90 latency", "Customer-reported incident count"],
    },
    "Greater Resilience": {
      why: "Resilience is the ability to absorb failure without customer harm.",
      how: ["Chaos and GameDay programs", "Multi-region and DR posture", "Graceful degradation"],
      metrics: ["MTTR", "RTO / RPO", "Failover rehearsal success"],
    },
    "Faster Delivery": {
      why: "Speed and stability are correlated when reliability is engineered in.",
      how: ["Progressive delivery", "Trunk-based development", "Automated quality gates"],
      metrics: ["Lead time for change", "Deployment frequency", "Change failure rate"],
    },
    "Higher Business Value": {
      why: "Reliable platforms convert engineering investment into compounding business outcomes.",
      how: ["Unit economics per service", "Outcome-based funding", "Platform adoption tracking"],
      metrics: ["Cost per transaction", "Revenue per platform user", "Run / grow ratio"],
    },
  };
  const m = map[label];
  return (
    <>
      <SheetHeader className="text-left">
        <div className="flex items-start justify-between gap-3">
          <SheetTitle className="text-xl">{label}</SheetTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <SheetDescription>{m.why}</SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-5">
        <Section title="How We Deliver It"><Bullets items={m.how} /></Section>
        <Section title="Metrics That Tell The Story"><Bullets items={m.metrics} /></Section>
      </div>
    </>
  );
}

/* ---------------- Primitives ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="text-sm text-slate-700 flex gap-2">
          <span className="mt-2 h-1 w-1 rounded-full bg-slate-400 shrink-0" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
