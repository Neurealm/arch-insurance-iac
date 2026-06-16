import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle, Boxes, ClipboardList, Wrench, RefreshCw, Layers, Building2,
  ShieldCheck, Users, Eye, Cpu, Cloud, Ticket, Gauge, Target, BarChart3,
  ArrowRight, ArrowLeft, ChevronRight, Sparkles, BookOpen, CheckCircle2,
  Activity, TrendingUp, Database, GitBranch, Server, Bot, FileCheck,
  DollarSign, Heart, Code2, Network, Bell, Workflow, Settings,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";

/* ===================== Types ===================== */

type Tone = "rose" | "amber" | "emerald" | "sky" | "violet" | "teal" | "slate" | "indigo" | "orange";

const TONE: Record<Tone, { bg: string; text: string; ring: string; border: string; soft: string; dot: string }> = {
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-300",    border: "border-rose-200",    soft: "bg-rose-50/60",    dot: "bg-rose-500" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-300",  border: "border-orange-200",  soft: "bg-orange-50/60",  dot: "bg-orange-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-300",   border: "border-amber-200",   soft: "bg-amber-50/60",   dot: "bg-amber-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-300", border: "border-emerald-200", soft: "bg-emerald-50/60", dot: "bg-emerald-500" },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-300",     border: "border-sky-200",     soft: "bg-sky-50/60",     dot: "bg-sky-500" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-300",  border: "border-violet-200",  soft: "bg-violet-50/60",  dot: "bg-violet-500" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    ring: "ring-teal-300",    border: "border-teal-200",    soft: "bg-teal-50/60",    dot: "bg-teal-500" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-700",   ring: "ring-slate-300",   border: "border-slate-200",   soft: "bg-slate-50/60",   dot: "bg-slate-500" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-300",  border: "border-indigo-200",  soft: "bg-indigo-50/60",  dot: "bg-indigo-500" },
};

/* ===================== Current State Inputs ===================== */

type Input = {
  id: string;
  title: string;
  icon: LucideIcon;
  definition: string;
  symptoms: string[];
  impact: string;
  metrics: string[];
  hhax: string;
};

const INPUTS: Input[] = [
  { id: "tech-debt", title: "Technical Debt", icon: AlertTriangle,
    definition: "Accumulated design and implementation shortcuts that compound operational cost and risk over time.",
    symptoms: ["Velocity declining quarter over quarter", "Same code areas drive most incidents", "Engineering avoids 'that subsystem'"],
    impact: "Reduces feature throughput by 20-40%; raises incident frequency and severity.",
    metrics: ["% sprint capacity on rework", "Lead time variance", "Change failure rate"],
    hhax: "Surfaced across acquired platforms — older SQL footprints, fragile integrations, and tightly coupled legacy services." },
  { id: "legacy-platforms", title: "Legacy Platforms", icon: Server,
    definition: "Older systems that constrain architectural change, observability, and operating model evolution.",
    symptoms: ["Cannot deploy without downtime", "Limited telemetry available", "Patching requires off-hours windows"],
    impact: "Caps reliability targets and slows modernization.",
    metrics: ["% workloads on legacy stack", "Patch cycle time", "Outage minutes from legacy origin"],
    hhax: "Multiple acquired platforms operate on heterogeneous legacy stacks with limited shared tooling." },
  { id: "ticket-culture", title: "Ticket Culture", icon: Ticket,
    definition: "Operational behavior is governed by ticket queues rather than service ownership.",
    symptoms: ["Branches and engineers wait days for access", "Ticket SLAs measured, outcomes are not", "Same request types repeat weekly"],
    impact: "Consumes engineering capacity; obscures real reliability investment needs.",
    metrics: ["Tickets per engineer / week", "% repeat ticket categories", "Time-to-fulfill vs. self-service rate"],
    hhax: "Discovery consistently surfaced ticket-driven behaviors across IT, ops, and engineering." },
  { id: "reactive-ops", title: "Reactive Operations", icon: Bell,
    definition: "Most operational time is spent responding to events rather than engineering them out.",
    symptoms: ["Days dominated by alerts and bridges", "Roadmap consistently delayed", "On-call burnout signals"],
    impact: "Caps engineering throughput; degrades attrition risk.",
    metrics: ["Pages / engineer / week", "MTTR variance", "% sprint spent on unplanned work"],
    hhax: "Engineering leadership described firefighting as the dominant operating mode." },
  { id: "manual-processes", title: "Manual Processes", icon: Wrench,
    definition: "Repetitive operational tasks executed by humans instead of automation.",
    symptoms: ["Runbook steps copy-pasted from wikis", "Provisioning by ticket", "Compliance evidence assembled by hand"],
    impact: "Cost scales linearly with growth; reliability bounded by human consistency.",
    metrics: ["% tasks automated", "Toil hours / week", "Provisioning time"],
    hhax: "Common runbooks still hand-executed; provisioning bottlenecked by manual approval chains." },
  { id: "toil", title: "Operational Toil", icon: RefreshCw,
    definition: "Manual, repetitive, automatable work without enduring value that consumes team capacity.",
    symptoms: ["Same incidents resolved repeatedly", "Engineering backlog growing while team is 'busy'", "No clear automation backlog"],
    impact: "Erodes capacity for engineering work that prevents tomorrow's toil.",
    metrics: ["Toil % per team", "Automation backlog burn-down", "Repeat incident rate"],
    hhax: "Engineering reports majority of week consumed by repeated operational events." },
  { id: "env-sprawl", title: "Environment Sprawl", icon: Layers,
    definition: "Proliferation of inconsistent environments across accounts, regions, and acquisitions.",
    symptoms: ["Drift between dev/stage/prod", "Untracked accounts and resources", "Inconsistent IAM and tagging"],
    impact: "Raises cost, security risk, and operational complexity.",
    metrics: ["# active environments", "Drift detection rate", "% resources tagged correctly"],
    hhax: "Cloud footprint distributed across acquired platforms with varying standards." },
  { id: "acq-complexity", title: "Acquisition Complexity", icon: Building2,
    definition: "Each acquisition introduces new platforms, teams, tooling, and operating models.",
    symptoms: ["Integration timelines highly variable", "Reliability posture differs by acquisition", "Engineering ramp slow"],
    impact: "Slows portfolio modernization; creates parallel operating models.",
    metrics: ["Integration cycle time", "Time to first standard adoption", "Cross-acquisition incident rate"],
    hhax: "HHAX growth strategy includes multiple acquisitions with heterogeneous engineering histories." },
  { id: "silos", title: "Siloed Teams", icon: Users,
    definition: "Engineering, operations, infra, security, and product teams operate with limited shared visibility.",
    symptoms: ["Handoffs dominate delivery", "Each team has its own backlog and metrics", "Cross-team work stalls"],
    impact: "Slows delivery; reduces reliability through poor coordination.",
    metrics: ["Cross-team lead time", "% incidents requiring 3+ teams", "Dependency wait time"],
    hhax: "Engineering, infra, and ops report poor shared visibility and limited joint planning." },
  { id: "ownership-gaps", title: "Service Ownership Gaps", icon: Users,
    definition: "Tier-1 services exist without consistently named, accountable owners.",
    symptoms: ["Alerts route to shared inboxes", "On-call ambiguity", "No single roadmap per service"],
    impact: "Drives orphan incidents; blocks reliability improvement.",
    metrics: ["% services with named owner", "% alerts with team routing", "Owner-on-pager coverage"],
    hhax: "Discovery surfaced several Tier-1 services without clearly named owning teams." },
  { id: "obs-gaps", title: "Observability Gaps", icon: Eye,
    definition: "Telemetry insufficient to diagnose distributed-system failures or measure user experience.",
    symptoms: ["Incidents diagnosed via guesswork", "Customer-impacting issues found via support", "No user-journey traces"],
    impact: "Raises MTTR; hides real reliability posture.",
    metrics: ["% services with traces", "Telemetry coverage by tier", "MTTD"],
    hhax: "Limited unified observability across mobile, claims, payroll, and acquired platforms." },
  { id: "cloud-incon", title: "Cloud Inconsistency", icon: Cloud,
    definition: "Cloud usage varies in tooling, guardrails, IaC, and FinOps maturity across the portfolio.",
    symptoms: ["No common landing zone", "Inconsistent tagging and FinOps", "IaC adoption uneven"],
    impact: "Inflates cost; complicates security, compliance, and operations.",
    metrics: ["% workloads in landing zone", "IaC coverage", "Tagging compliance"],
    hhax: "AWS migration and consolidation in progress; cloud standards still maturing across acquisitions." },
];

/* ===================== Transformation Stages ===================== */

type Stage = {
  id: string;
  number: number;
  title: string;
  window: string;
  tone: Tone;
  icon: LucideIcon;
  purpose: string;
  inputs: string[];      // input ids
  activities: { title: string; detail: string }[];
  outputs: { title: string; detail: string }[];
  roles: string[];
  kpis: { label: string; baseline: string; target: string; forecast: string }[];
  ai: string[];
  hhax: string;
  why: string;
  cannotSkip: string;
  decisionGate: { id: string; name: string; metric: string };
};

const STAGES: Stage[] = [
  { id: "stabilize", number: 1, title: "Stabilize", window: "0 – 3 Months", tone: "sky", icon: ShieldCheck,
    purpose: "Create visibility and control of the current state.",
    inputs: ["reactive-ops", "obs-gaps", "env-sprawl", "legacy-platforms"],
    activities: [
      { title: "Asset discovery", detail: "Automated inventory across cloud accounts, data centers, and acquired estates." },
      { title: "Service inventory", detail: "Initial list of business-critical services with current owners and dependencies." },
      { title: "Monitoring rationalization", detail: "Consolidate signals; eliminate noise; baseline alerting." },
      { title: "Incident baseline", detail: "Establish Sev definitions, MTTR baseline, top-incident categories." },
      { title: "Runbook inventory", detail: "Identify the runbooks that exist today and their freshness." },
    ],
    outputs: [
      { title: "Asset Inventory", detail: "Living catalog of compute, data, network, and identity assets." },
      { title: "Service Inventory", detail: "Tier-1 services identified with provisional ownership." },
      { title: "Monitoring Baseline", detail: "Consolidated alerting baseline with noise reduction." },
      { title: "Incident Baseline", detail: "Documented MTTR, frequency, and top categories." },
    ],
    roles: ["Operations", "Infrastructure", "SRE Lead", "Architecture", "Security"],
    kpis: [
      { label: "Monitoring Coverage", baseline: "45%", target: "> 70%", forecast: "72%" },
      { label: "Asset Visibility", baseline: "60%", target: "> 90%", forecast: "92%" },
      { label: "MTTR (Tier-1)", baseline: "65 min", target: "< 45 min", forecast: "42 min" },
    ],
    ai: ["Asset Discovery Agent", "Alert Triage Copilot", "Runbook Indexer"],
    hhax: "HHAX enters this stage with multiple acquired estates and partial visibility. Stabilize creates the operating baseline that all subsequent investment depends on.",
    why: "You cannot improve what you cannot see. Stabilization establishes the truth of the current state.",
    cannotSkip: "Without stabilization, later stages optimize the wrong things. Standardization without visibility creates standards no one trusts.",
    decisionGate: { id: "DG1", name: "Baseline Established", metric: "Monitoring Coverage > 70%" },
  },
  { id: "standardize", number: 2, title: "Standardize", window: "3 – 6 Months", tone: "indigo", icon: Layers,
    purpose: "Establish consistent standards, tooling, and guardrails.",
    inputs: ["env-sprawl", "cloud-incon", "manual-processes", "tech-debt"],
    activities: [
      { title: "Golden images", detail: "Hardened, versioned base images for compute, containers, and data services." },
      { title: "IaC standards", detail: "Module library, naming, tagging, and review patterns for Terraform/CloudFormation." },
      { title: "GitHub standards", detail: "Branch protection, CODEOWNERS, required checks, repository templates." },
      { title: "Cloud guardrails", detail: "Landing zones, SCPs, and policy-as-code enforced at the org level." },
      { title: "Security baselines", detail: "Common controls, identity standards, secrets management patterns." },
    ],
    outputs: [
      { title: "Golden Images", detail: "Hardened OS, container, and runtime images." },
      { title: "Standard Build Library", detail: "Reusable IaC modules and pipeline templates." },
      { title: "Cloud Standards", detail: "Landing zones, guardrails, tagging, FinOps baselines." },
      { title: "Security Baselines", detail: "Identity, secrets, and control baselines." },
    ],
    roles: ["Platform Engineering", "Cloud", "Security", "Architecture", "DevSecOps"],
    kpis: [
      { label: "Image Standardization", baseline: "30%", target: "> 70%", forecast: "73%" },
      { label: "IaC Coverage", baseline: "35%", target: "> 75%", forecast: "78%" },
      { label: "Tagging Compliance", baseline: "55%", target: "> 90%", forecast: "92%" },
    ],
    ai: ["IaC Authoring Copilot", "Policy Drift Detector", "Compliance Evidence Agent"],
    hhax: "Standardization is the lever that lets HHAX absorb future acquisitions without bespoke integration. Golden images, GitHub standards, and cloud guardrails are explicit HHAX initiatives.",
    why: "Standards reduce cognitive load, accelerate onboarding, and create the substrate for automation.",
    cannotSkip: "Service ownership without standards burdens every team with the same decisions in isolation.",
    decisionGate: { id: "DG2", name: "Standards Adopted", metric: "Image Standardization > 70%" },
  },
  { id: "service-ownership", number: 3, title: "Service Ownership", window: "6 – 12 Months", tone: "emerald", icon: Users,
    purpose: "Establish ownership, accountability, and operating contracts per service.",
    inputs: ["ownership-gaps", "silos", "ticket-culture"],
    activities: [
      { title: "Service catalog", detail: "Single source of truth: owner, tier, dependencies, runbooks, on-call, SLOs." },
      { title: "Ownership matrix", detail: "Named owning team for every Tier-1 service across HHAX and acquisitions." },
      { title: "Escalation models", detail: "Defined paging, escalation, and customer-comms paths per Sev." },
      { title: "Service tiering", detail: "Tier-1/2/3 model with criticality, RTO/RPO, and SLO commitments." },
      { title: "KPI framework", detail: "Per-service health: reliability, cost, performance, customer impact." },
    ],
    outputs: [
      { title: "Service Catalog", detail: "Production service catalog (Backstage / Cortex / Port-style)." },
      { title: "Ownership Matrix", detail: "RACI across services, teams, and accountability points." },
      { title: "Service KPIs", detail: "Per-service scorecards visible to engineering leadership." },
      { title: "Escalation Framework", detail: "Documented Sev-based escalation paths." },
    ],
    roles: ["SRE Leads", "Service Owners", "Product Owners", "Operations Leads", "Finance Partners"],
    kpis: [
      { label: "Services with Owner", baseline: "55%", target: "> 80%", forecast: "85%" },
      { label: "Alert→Team Routing", baseline: "60%", target: "> 95%", forecast: "96%" },
      { label: "Service Catalog Coverage", baseline: "40%", target: "> 90%", forecast: "92%" },
    ],
    ai: ["Service Catalog Curator", "Ownership Inference Agent", "On-Call Routing Optimizer"],
    hhax: "Aligns directly with Chris's stated objective: move from ticket queues and shared accountability toward service ownership with clear pagers, SLOs, and roadmaps.",
    why: "You cannot manage what you don't own. Ownership drives accountability and enables every subsequent SRE practice.",
    cannotSkip: "Platform engineering without owners has no customers. Automation without owners has no priority signal.",
    decisionGate: { id: "DG3", name: "Ownership Established", metric: "Services with Owner > 80%" },
  },
  { id: "platform", number: 4, title: "Platform Engineering", window: "9 – 18 Months", tone: "violet", icon: Boxes,
    purpose: "Build reusable platform capabilities and self-service.",
    inputs: ["manual-processes", "silos", "tech-debt", "cloud-incon"],
    activities: [
      { title: "Shared services", detail: "Common identity, secrets, observability, CI/CD, data, and AI services." },
      { title: "Developer platform", detail: "Internal developer portal with catalog, scorecards, templates, and golden paths." },
      { title: "Self-service workflows", detail: "Provisioning, access, environment, and database self-service." },
      { title: "Golden paths", detail: "Opinionated, supported route from idea to production for common service types." },
      { title: "Platform APIs", detail: "Programmable platform interfaces consumed by product teams." },
    ],
    outputs: [
      { title: "Platform Catalog", detail: "Catalog of platform services, owners, SLAs, and usage." },
      { title: "Self-Service Portal", detail: "IDP with template-based service creation and self-serve workflows." },
      { title: "Shared Services", detail: "Identity, secrets, observability, CI/CD as managed offerings." },
      { title: "Developer Platform", detail: "Catalog + scorecards + golden paths surface in one place." },
    ],
    roles: ["Platform Engineering", "Architecture", "SRE", "Security", "Developer Experience"],
    kpis: [
      { label: "Platform Adoption", baseline: "20%", target: "> 60%", forecast: "63%" },
      { label: "Self-Service Ratio", baseline: "15%", target: "> 60%", forecast: "62%" },
      { label: "Time-to-First-Service", baseline: "12 wk", target: "< 2 wk", forecast: "1.5 wk" },
    ],
    ai: ["Developer Onboarding Copilot", "Golden Path Recommender", "Catalog Quality Agent"],
    hhax: "Directly addresses HHAX discussions around standardization, golden images, GitHub standards, shared services, and reusable platforms across acquired teams.",
    why: "Platforms compound. Each capability you build reduces operational tax for every team that consumes it.",
    cannotSkip: "Automation without a platform creates point automations. Reliability engineering without a platform cannot scale across the portfolio.",
    decisionGate: { id: "DG4", name: "Platform Adoption", metric: "Platform Adoption > 60%" },
  },
  { id: "automation", number: 5, title: "Automation", window: "12 – 24 Months", tone: "amber", icon: Cpu,
    purpose: "Automate operations and eliminate repetitive work.",
    inputs: ["toil", "manual-processes", "reactive-ops"],
    activities: [
      { title: "Runbook automation", detail: "Convert top-frequency runbooks into executable, auditable workflows." },
      { title: "Self-healing workflows", detail: "Auto-remediation for known incident patterns with safety guardrails." },
      { title: "Provisioning automation", detail: "Account, environment, and resource provisioning via platform APIs." },
      { title: "Compliance automation", detail: "Continuous evidence collection; policy-as-code enforcement." },
      { title: "Auto-remediation", detail: "Closed-loop response for high-confidence failure modes." },
    ],
    outputs: [
      { title: "Automation Library", detail: "Versioned, owned, tested catalog of automations." },
      { title: "Self-Healing Workflows", detail: "Production-grade auto-remediation patterns." },
      { title: "Automated Provisioning", detail: "Self-service provisioning end-to-end." },
      { title: "Auto Remediation", detail: "Closed-loop fixes for repeat incidents." },
    ],
    roles: ["SRE", "Platform Engineering", "Operations", "Security", "Data"],
    kpis: [
      { label: "Toil Reduction", baseline: "55%", target: "> 40% reduction", forecast: "44%" },
      { label: "Auto-Remediated Incidents", baseline: "5%", target: "> 35%", forecast: "37%" },
      { label: "Self-Service Adoption", baseline: "15%", target: "> 70%", forecast: "72%" },
    ],
    ai: ["Toil Analyst", "Auto-Remediation Orchestrator", "Provisioning Agent", "Compliance Evidence Bot"],
    hhax: "Targets the ticket-factory and interrupt-driven patterns surfaced during discovery — replacing branch access tickets, common runbooks, and repeat-incident response with engineered workflows.",
    why: "Automation is how reliability scales without adding headcount.",
    cannotSkip: "Reliability engineering without automation leaves the team trapped in toil; the engineering capacity to ship reliability work never materializes.",
    decisionGate: { id: "DG5", name: "Automation Coverage", metric: "Toil Reduction > 40%" },
  },
  { id: "reliability", number: 6, title: "Reliability Engineering", window: "18 – 36 Months", tone: "rose", icon: Gauge,
    purpose: "Engineer reliability with SLOs, error budgets, and continuous learning.",
    inputs: ["reactive-ops", "ownership-gaps", "ticket-culture"],
    activities: [
      { title: "SLOs & SLIs", detail: "Per-journey SLOs derived from user telemetry; multi-window burn-rate alerts." },
      { title: "Error budgets", detail: "Budget policy governing release pace and reliability investment." },
      { title: "Reliability reviews", detail: "Quarterly per-service reviews driving investment decisions." },
      { title: "Capacity planning", detail: "Forecast-driven capacity with headroom targets per tier." },
      { title: "Postmortem program", detail: "Blameless postmortems with tracked action items and trend reporting." },
    ],
    outputs: [
      { title: "SLO Framework", detail: "Catalog of SLOs per service, journey, and persona." },
      { title: "Error Budget Program", detail: "Policy enforced in release pipelines and reliability council." },
      { title: "Reliability Reviews", detail: "Quarterly cadence with executive visibility." },
      { title: "Toil Reduction Program", detail: "Measured, capped, and engineered down." },
    ],
    roles: ["SRE", "Service Owners", "Product", "Architecture", "Operations Leads"],
    kpis: [
      { label: "SLO Compliance", baseline: "60%", target: "> 90%", forecast: "92%" },
      { label: "Error Budget Burn (avg)", baseline: "1.8×", target: "< 1×", forecast: "0.85×" },
      { label: "Postmortem Action Closure", baseline: "40%", target: "> 90%", forecast: "92%" },
    ],
    ai: ["Reliability Sentinel", "Incident Commander Copilot", "Postmortem Drafting Agent", "Capacity Forecaster"],
    hhax: "Directly reflects Chris's stated objective: from firefighting to prevention; from ITIL toward SRE — operationalized across caregiver, claims, payroll, and acquired platforms.",
    why: "Reliability becomes a measurable, engineered property of services — not the result of heroics.",
    cannotSkip: "This is the destination. Skipping it collapses the entire program back into reactive operations dressed in new tooling.",
    decisionGate: { id: "DG6", name: "Reliability at Scale", metric: "SLO Compliance > 90%" },
  },
];

/* ===================== Future-state outputs (right side of factory) ===================== */

const FUTURE_OUTPUTS = [
  { icon: ClipboardList, title: "Service Catalog" },
  { icon: Server,        title: "Golden Images" },
  { icon: Boxes,         title: "Platform Services" },
  { icon: Target,        title: "SLO Framework" },
  { icon: ShieldCheck,   title: "Error Budgets" },
  { icon: Cpu,           title: "Automation Library" },
  { icon: Eye,           title: "Observability Platform" },
  { icon: Bot,           title: "AI Operations" },
];

/* ===================== Deliverables Matrix ===================== */

const DELIVERABLES: { name: string; stages: Record<string, boolean>; matters: string }[] = [
  { name: "Service Catalog",        stages: { stabilize: true, "service-ownership": true, platform: true }, matters: "Source of truth for ownership, dependencies, and reliability." },
  { name: "Golden Images",          stages: { standardize: true }, matters: "Hardened, versioned baselines reduce drift and accelerate provisioning." },
  { name: "Ownership Matrix",       stages: { "service-ownership": true }, matters: "Closes 'no one owns it'; aligns alerts, SLOs, and roadmaps to teams." },
  { name: "GitHub Standards",       stages: { standardize: true }, matters: "Branch protection, CODEOWNERS, required checks enable safe velocity." },
  { name: "Platform Services",      stages: { platform: true }, matters: "Reusable capabilities eliminate per-team operational tax." },
  { name: "Automation Library",     stages: { automation: true }, matters: "Versioned, owned automations replace bespoke scripts." },
  { name: "SLO Framework",          stages: { reliability: true }, matters: "Makes reliability negotiable, measurable, and visible." },
  { name: "Error Budgets",          stages: { reliability: true }, matters: "Governs release pace; informs reliability investment." },
  { name: "Observability Platform", stages: { stabilize: true, platform: true }, matters: "Unified telemetry across services, journeys, and personas." },
  { name: "AI Operations",          stages: { automation: true, reliability: true }, matters: "Digital coworkers accelerate triage, remediation, and learning." },
  { name: "Runbook Library",        stages: { stabilize: true, automation: true }, matters: "Curated, versioned runbooks; first step toward automation." },
  { name: "Self-Service Portal",    stages: { platform: true }, matters: "Removes ticket queues; gives engineers direct platform access." },
];

/* ===================== Operating Model Evolution ===================== */

const TRADITIONAL = [
  { icon: Ticket,  label: "Requests & Tickets" },
  { icon: Users,   label: "Ops Teams" },
  { icon: Wrench,  label: "Manual Processes" },
  { icon: Bell,    label: "Firefighting Mode" },
  { icon: Network, label: "Siloed Accountability" },
];
const FUTURE_MODEL = [
  { icon: ClipboardList, label: "Service Ownership" },
  { icon: Boxes,         label: "Platform Teams" },
  { icon: Cpu,           label: "Automation First" },
  { icon: Gauge,         label: "Reliability Engineered" },
  { icon: RefreshCw,     label: "Continuous Improvement" },
];

/* ===================== Business Outcomes ===================== */

const OUTCOMES: { icon: LucideIcon; label: string; value: string; positive: boolean; trend: { x: number; y: number }[] }[] = [
  { icon: ShieldCheck, label: "Reliability (SLO Compliance)", value: "99.95%", positive: true,
    trend: [{x:0,y:60},{x:1,y:68},{x:2,y:76},{x:3,y:84},{x:4,y:90},{x:5,y:95},{x:6,y:99.5}] },
  { icon: AlertTriangle, label: "Incident Reduction (MTTR)", value: "-60%", positive: true,
    trend: [{x:0,y:100},{x:1,y:88},{x:2,y:76},{x:3,y:64},{x:4,y:54},{x:5,y:46},{x:6,y:40}] },
  { icon: RefreshCw, label: "Operational Toil Reduction", value: "-50%", positive: true,
    trend: [{x:0,y:100},{x:1,y:92},{x:2,y:82},{x:3,y:72},{x:4,y:64},{x:5,y:56},{x:6,y:50}] },
  { icon: GitBranch, label: "Deployment Frequency", value: "5×", positive: true,
    trend: [{x:0,y:10},{x:1,y:14},{x:2,y:20},{x:3,y:28},{x:4,y:36},{x:5,y:44},{x:6,y:50}] },
  { icon: CheckCircle2, label: "Change Success Rate", value: "> 90%", positive: true,
    trend: [{x:0,y:62},{x:1,y:68},{x:2,y:74},{x:3,y:80},{x:4,y:85},{x:5,y:88},{x:6,y:92}] },
  { icon: DollarSign, label: "Infrastructure Cost Optimization", value: "-30%", positive: true,
    trend: [{x:0,y:100},{x:1,y:96},{x:2,y:90},{x:3,y:84},{x:4,y:78},{x:5,y:74},{x:6,y:70}] },
  { icon: Heart, label: "Customer Experience Improvement", value: "+40%", positive: true,
    trend: [{x:0,y:55},{x:1,y:60},{x:2,y:66},{x:3,y:72},{x:4,y:78},{x:5,y:84},{x:6,y:90}] },
];

/* ===================== Roadmap / Decision Gates ===================== */

const ROADMAP_COLS: { stageId: string; focus: string; gate: string; metric: string; outcome: string }[] = STAGES.map((s) => ({
  stageId: s.id,
  focus: {
    stabilize: "Gain visibility and control",
    standardize: "Establish standards and consistency",
    "service-ownership": "Establish ownership and accountability",
    platform: "Build platforms and self-service",
    automation: "Automate and eliminate toil",
    reliability: "Engineer reliability and learn continuously",
  }[s.id]!,
  gate: `${s.decisionGate.id}: ${s.decisionGate.name}`,
  metric: s.decisionGate.metric,
  outcome: {
    stabilize: "Operational Visibility",
    standardize: "Consistency & Control",
    "service-ownership": "Accountability",
    platform: "Developer Velocity",
    automation: "Operational Efficiency",
    reliability: "Reliability at Scale",
  }[s.id]!,
}));

/* ===================== Page ===================== */

export default function HowToAchieveGoogleSre() {
  const [activeStage, setActiveStage] = useState<string | null>("service-ownership");
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [activeDeliverable, setActiveDeliverable] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [hoveredOutcome, setHoveredOutcome] = useState<number | null>(null);

  useEffect(() => { document.title = "How Organizations Achieve Google SRE"; }, []);

  const stage = useMemo(() => STAGES.find((s) => s.id === activeStage) ?? null, [activeStage]);
  const input = useMemo(() => INPUTS.find((i) => i.id === activeInput) ?? null, [activeInput]);
  const deliverable = useMemo(() => DELIVERABLES.find((d) => d.name === activeDeliverable) ?? null, [activeDeliverable]);

  const hovered = hoveredStage ? STAGES.find((s) => s.id === hoveredStage) : null;
  const highlightedInputIds = new Set(hovered?.inputs ?? []);
  const highlightedOutputs = hovered?.outputs.map((o) => o.title) ?? [];

  return (
    <AppShell>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1440px] mx-auto p-6 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/reliability-foundations" className="hover:text-slate-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Enterprise Operating Shifts
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/reliability-foundations/google-sre" className="hover:text-slate-900">Google SRE</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-700 font-semibold">How Organizations Achieve Google SRE</span>
          </div>

          {/* Hero */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Transformation Operating System</div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mt-1">How Organizations Achieve Google SRE</h1>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                  The transformation factory that converts operational complexity into a modern reliability engineering organization.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="bg-sky-50 text-sky-700 border border-sky-200" variant="secondary">6 Stages</Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200" variant="secondary">6 Decision Gates</Badge>
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200" variant="secondary">12+ Deliverables</Badge>
                  <Badge className="bg-violet-50 text-violet-700 border border-violet-200" variant="secondary">18–36 Months</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600 max-w-xs">
                <div className="font-semibold text-slate-900 mb-1 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Narrative
                </div>
                Previous: <Link to="/reliability-foundations/google-sre" className="text-emerald-700 hover:underline">What is Google SRE</Link>.
                Here: how organizations actually get there. Next: what the finished operating model looks like in production.
              </div>
            </div>
          </section>

          {/* SECTION 1 — Current State Inputs */}
          <SectionHeader number="01" title="Current State Inputs" subtitle="The operational realities entering the transformation factory. Hover for context; click for the full intelligence panel." tone="rose" />
          <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {INPUTS.map((i) => {
                const Icon = i.icon;
                const isHighlighted = hoveredStage ? highlightedInputIds.has(i.id) : false;
                const isDim = hoveredStage && !isHighlighted;
                return (
                  <button
                    key={i.id}
                    onClick={() => setActiveInput(i.id)}
                    title={`${i.title}\n${i.definition}`}
                    className={[
                      "group text-left rounded-lg border bg-white p-2.5 transition-all flex items-center gap-2",
                      "border-rose-200 hover:shadow-md hover:border-rose-300",
                      isHighlighted ? "ring-2 ring-rose-400 shadow-md" : "",
                      isDim ? "opacity-40" : "",
                    ].join(" ")}
                  >
                    <div className="shrink-0 w-7 h-7 rounded-md bg-rose-100 text-rose-700 inline-flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">{i.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2 — Transformation Factory */}
          <SectionHeader number="02" title="Transformation Factory" subtitle="The end-to-end progression that converts current state into a reliability engineering operating model. Click any stage for the intelligence panel." />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-12 gap-4 items-stretch">
              {/* Left rail: inputs summary */}
              <div className="col-span-12 lg:col-span-2 rounded-xl border border-rose-200 bg-rose-50/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">Current State Inputs</div>
                <div className="mt-2 space-y-1">
                  {INPUTS.slice(0, 8).map((i) => {
                    const isHighlighted = hoveredStage ? highlightedInputIds.has(i.id) : false;
                    const Icon = i.icon;
                    return (
                      <div key={i.id} className={`flex items-center gap-1.5 text-[11px] text-rose-800 transition-all ${isHighlighted ? "font-semibold" : ""} ${hoveredStage && !isHighlighted ? "opacity-40" : ""}`}>
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{i.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center: stages */}
              <div className="col-span-12 lg:col-span-8">
                <div className="text-center text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Transformation Factory</div>
                <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
                  {STAGES.map((s, i) => {
                    const t = TONE[s.tone];
                    const Icon = s.icon;
                    const isActive = activeStage === s.id;
                    const isHov = hoveredStage === s.id;
                    return (
                      <div key={s.id} className="flex items-stretch">
                        <button
                          onClick={() => setActiveStage(s.id)}
                          onMouseEnter={() => setHoveredStage(s.id)}
                          onMouseLeave={() => setHoveredStage(null)}
                          className={[
                            "group rounded-xl border bg-white p-3 w-36 text-left transition-all",
                            "border-slate-200 hover:shadow-md hover:-translate-y-0.5",
                            isActive ? `ring-2 ${t.ring} border-transparent shadow-md` : "",
                            isHov ? `ring-1 ${t.ring}` : "",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-6 h-6 rounded-full ${t.bg} ${t.text} inline-flex items-center justify-center text-[11px] font-bold`}>{s.number}</div>
                            <Icon className={`w-3.5 h-3.5 ${t.text}`} />
                          </div>
                          <div className={`mt-2 text-sm font-semibold ${t.text}`}>{s.title}</div>
                          <div className="mt-1 text-[10px] text-slate-500 leading-tight">{s.purpose}</div>
                          <div className="mt-2 text-[10px] text-slate-400 font-medium">{s.window}</div>
                        </button>
                        {i < STAGES.length - 1 && (
                          <div className="self-center px-1">
                            <ArrowRight className={`w-3.5 h-3.5 ${hoveredStage && (hoveredStage === s.id || hoveredStage === STAGES[i+1].id) ? "text-emerald-500" : "text-slate-300"}`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right rail: future state */}
              <div className="col-span-12 lg:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Future State Outputs</div>
                <div className="mt-2 space-y-1">
                  {FUTURE_OUTPUTS.map((o) => {
                    const Icon = o.icon;
                    const isHighlighted = highlightedOutputs.some((h) => h === o.title);
                    return (
                      <div key={o.title} className={`flex items-center gap-1.5 text-[11px] text-emerald-800 transition-all ${isHighlighted ? "font-semibold" : ""} ${hoveredStage && !isHighlighted ? "opacity-40" : ""}`}>
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{o.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 — Deliverables Matrix */}
          <SectionHeader number="03" title="Deliverables Produced By Stage" subtitle="Which artifacts are produced where. Click any deliverable to open artifact examples." />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.6fr_repeat(6,1fr)] text-[11px] uppercase tracking-wider text-slate-500 font-semibold bg-slate-50 border-b border-slate-200">
              <div className="px-4 py-3">Deliverable</div>
              {STAGES.map((s) => {
                const t = TONE[s.tone];
                return (
                  <div key={s.id} className={`px-3 py-3 text-center border-l border-slate-200 ${t.text}`}>
                    <div className="text-[10px]">{s.number}</div>
                    <div className="text-[11px] font-semibold">{s.title}</div>
                  </div>
                );
              })}
            </div>
            {DELIVERABLES.map((d, idx) => (
              <button
                key={d.name}
                onClick={() => setActiveDeliverable(d.name)}
                className={`w-full grid grid-cols-[1.6fr_repeat(6,1fr)] items-center text-left transition-colors hover:bg-emerald-50/30 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                title={d.matters}
              >
                <div className="px-4 py-2.5 text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" /> {d.name}
                </div>
                {STAGES.map((s) => {
                  const present = d.stages[s.id];
                  const t = TONE[s.tone];
                  return (
                    <div key={s.id} className="px-3 py-2.5 text-center border-l border-slate-100">
                      {present ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${t.bg} ${t.text}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </div>
                  );
                })}
              </button>
            ))}
          </div>

          {/* SECTION 4 — Operating Model Evolution */}
          <SectionHeader number="04" title="Operating Model Evolution" subtitle="From traditional operations to a reliability engineering organization." />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <ModelColumn label="From: Traditional Operations" tone="rose" items={TRADITIONAL} />
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 inline-flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <ModelColumn label="To: SRE Operating Model" tone="emerald" items={FUTURE_MODEL} />
            </div>
          </div>

          {/* SECTION 5 — Roadmap & Decision Gates */}
          <SectionHeader number="05" title="Transformation Roadmap & Decision Gates" subtitle="How each stage is governed. Click a stage column to open the intelligence panel." />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Phase</th>
                  {ROADMAP_COLS.map((c) => {
                    const s = STAGES.find((x) => x.id === c.stageId)!;
                    const t = TONE[s.tone];
                    return (
                      <th key={c.stageId} className={`px-3 py-3 text-left border-l border-slate-200`}>
                        <button onClick={() => setActiveStage(s.id)} className="text-left">
                          <div className={`text-[11px] font-bold ${t.text}`}>{s.number}. {s.title}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{s.window}</div>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <Row label="Focus">
                  {ROADMAP_COLS.map((c) => <td key={c.stageId} className="px-3 py-2.5 border-l border-slate-100 text-slate-700">{c.focus}</td>)}
                </Row>
                <Row label="Decision Gate" striped>
                  {ROADMAP_COLS.map((c) => (
                    <td key={c.stageId} className="px-3 py-2.5 border-l border-slate-100">
                      <div className="font-semibold text-slate-900">{c.gate}</div>
                    </td>
                  ))}
                </Row>
                <Row label="Key Metric">
                  {ROADMAP_COLS.map((c) => <td key={c.stageId} className="px-3 py-2.5 border-l border-slate-100 text-emerald-700 font-semibold">{c.metric}</td>)}
                </Row>
                <Row label="Primary Outcome" striped>
                  {ROADMAP_COLS.map((c) => <td key={c.stageId} className="px-3 py-2.5 border-l border-slate-100 text-slate-700">{c.outcome}</td>)}
                </Row>
              </tbody>
            </table>
          </div>

          {/* SECTION 6 — Business Outcomes */}
          <SectionHeader number="06" title="Expected Business Outcomes" subtitle="Measured over 18–36 months across reliability, velocity, cost, and customer experience." />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {OUTCOMES.map((o, i) => {
              const Icon = o.icon;
              return (
                <div
                  key={o.label}
                  onMouseEnter={() => setHoveredOutcome(i)}
                  onMouseLeave={() => setHoveredOutcome(null)}
                  className={`rounded-xl border bg-white p-4 transition-all ${hoveredOutcome === i ? "shadow-md border-emerald-300 -translate-y-0.5" : "border-slate-200"}`}
                >
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <div className="text-[11px] text-slate-600 mt-2 font-medium leading-tight">{o.label}</div>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">{o.value}</div>
                  <div className="h-10 mt-2 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={o.trend}>
                        <defs>
                          <linearGradient id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="y" stroke="#10b981" fill={`url(#g-${i})`} strokeWidth={1.5} />
                        <XAxis dataKey="x" hide />
                        <YAxis hide />
                        <Tooltip cursor={false} contentStyle={{ display: "none" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer narrative */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-xs text-slate-600 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Timelines are estimates and will be refined during planning. Success depends on executive sponsorship, cross-functional collaboration, and continuous feedback.
            </div>
            <div className="flex items-center gap-3">
              <Link to="/reliability-foundations/google-sre" className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Google SRE Discipline
              </Link>
              <span className="text-slate-300">·</span>
              <Link to="/sre-operating-model" className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                Operating Model in Production <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stage Intelligence Panel */}
        <StagePanel open={!!activeStage} onClose={() => setActiveStage(null)} stage={stage} />
        {/* Input Panel */}
        <InputPanel open={!!activeInput} onClose={() => setActiveInput(null)} input={input} />
        {/* Deliverable Panel */}
        <DeliverablePanel open={!!activeDeliverable} onClose={() => setActiveDeliverable(null)} deliverable={deliverable} />
      </div>
    </AppShell>
  );
}

/* ===================== Sub-components ===================== */

function SectionHeader({ number, title, subtitle, tone }: { number: string; title: string; subtitle: string; tone?: Tone }) {
  const t = tone ? TONE[tone] : null;
  return (
    <div className="flex items-end justify-between pt-2">
      <div>
        <div className={`text-[11px] uppercase tracking-wider font-semibold ${t ? t.text : "text-slate-500"}`}>Section {number}</div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ModelColumn({ label, tone, items }: { label: string; tone: Tone; items: { icon: LucideIcon; label: string }[] }) {
  const t = TONE[tone];
  return (
    <div>
      <div className={`text-[11px] uppercase tracking-wider font-semibold ${t.text} mb-3`}>{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex items-center">
              <div className={`rounded-xl border ${t.border} ${t.soft} px-3 py-2 inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${t.text}`} />
                <span className={`text-xs font-semibold ${t.text}`}>{it.label}</span>
              </div>
              {i < items.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, children, striped = false }: { label: string; children: React.ReactNode; striped?: boolean }) {
  return (
    <tr className={striped ? "bg-slate-50/40" : "bg-white"}>
      <td className="px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-t border-slate-100">{label}</td>
      {children}
    </tr>
  );
}

/* ----- Stage Panel ----- */

function StagePanel({ open, onClose, stage }: { open: boolean; onClose: () => void; stage: Stage | null }) {
  if (!stage) return null;
  const t = TONE[stage.tone];
  const Icon = stage.icon;
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className={`shrink-0 w-10 h-10 rounded-lg inline-flex items-center justify-center ${t.bg} ${t.text} relative`}>
              <Icon className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-700 inline-flex items-center justify-center">{stage.number}</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Stage {stage.number} · {stage.window}</div>
              <SheetTitle className="text-base font-semibold text-slate-900">{stage.title}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="exec" className="flex flex-col h-[calc(100vh-92px)]">
          <TabsList className="mx-6 mt-3 bg-slate-100 rounded-lg flex flex-wrap gap-1 p-1 h-auto">
            <TabsTrigger value="exec"      className="text-[11px] px-2 py-1">Executive</TabsTrigger>
            <TabsTrigger value="acts"      className="text-[11px] px-2 py-1">Activities</TabsTrigger>
            <TabsTrigger value="delivs"    className="text-[11px] px-2 py-1">Deliverables</TabsTrigger>
            <TabsTrigger value="roles"     className="text-[11px] px-2 py-1">People & Roles</TabsTrigger>
            <TabsTrigger value="kpis"      className="text-[11px] px-2 py-1">KPIs</TabsTrigger>
            <TabsTrigger value="ai"        className="text-[11px] px-2 py-1">AI Enablement</TabsTrigger>
            <TabsTrigger value="hhax"      className="text-[11px] px-2 py-1">HHAX</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
            <TabsContent value="exec" className="mt-0 space-y-3">
              <Field label="Purpose" body={stage.purpose} />
              <Field label="Why This Stage" body={stage.why} />
              <Field label="Why It Comes Now" body={`Stage ${stage.number} follows the natural sequencing of the factory. Without the prior stage, this work compounds risk rather than reducing it.`} />
              <Field label="Why It Cannot Be Skipped" body={stage.cannotSkip} />
              <div className={`rounded-lg border ${t.border} ${t.soft} p-3`}>
                <div className={`text-[10px] uppercase tracking-wider font-semibold ${t.text}`}>Decision Gate</div>
                <div className="text-xs font-semibold text-slate-900 mt-1">{stage.decisionGate.id}: {stage.decisionGate.name}</div>
                <div className="text-xs text-slate-700 mt-0.5">{stage.decisionGate.metric}</div>
              </div>
            </TabsContent>

            <TabsContent value="acts" className="mt-0 space-y-2">
              {stage.activities.map((a) => (
                <div key={a.title} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">{a.detail}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="delivs" className="mt-0 space-y-2">
              {stage.outputs.map((o) => (
                <div key={o.title} className={`rounded-lg border ${t.border} ${t.soft} p-3`}>
                  <div className="flex items-center gap-2">
                    <FileCheck className={`w-3.5 h-3.5 ${t.text}`} />
                    <div className="text-xs font-semibold text-slate-900">{o.title}</div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">{o.detail}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="roles" className="mt-0">
              <div className="flex flex-wrap gap-1.5">
                {stage.roles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold">
                    <Users className="w-3 h-3" /> {r}
                  </span>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-slate-600 leading-relaxed">Roles participate per stage; ownership shifts toward service-owning teams as the program matures.</p>
            </TabsContent>

            <TabsContent value="kpis" className="mt-0">
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="text-left px-3 py-2">KPI</th>
                      <th className="text-right px-3 py-2">Baseline</th>
                      <th className="text-right px-3 py-2">Target</th>
                      <th className="text-right px-3 py-2">Forecast</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stage.kpis.map((k) => (
                      <tr key={k.label} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-semibold text-slate-900">{k.label}</td>
                        <td className="px-3 py-2 text-right text-rose-700">{k.baseline}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{k.target}</td>
                        <td className="px-3 py-2 text-right text-emerald-700 font-semibold">{k.forecast}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0 space-y-2">
              {stage.ai.map((a) => (
                <div key={a} className="rounded-lg border border-slate-200 p-3 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-violet-600" />
                  <div className="text-xs font-semibold text-slate-900">{a}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="hhax" className="mt-0">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-emerald-800 leading-relaxed">{stage.hhax}</div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

/* ----- Input Panel ----- */

function InputPanel({ open, onClose, input }: { open: boolean; onClose: () => void; input: Input | null }) {
  if (!input) return null;
  const Icon = input.icon;
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[38vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-rose-200">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-rose-50 text-rose-700 inline-flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-rose-700">Current State Input</div>
              <SheetTitle className="text-base font-semibold text-slate-900">{input.title}</SheetTitle>
            </div>
          </div>
        </SheetHeader>
        <div className="px-6 py-4 space-y-4 overflow-y-auto h-[calc(100vh-92px)]">
          <Field label="Definition" body={input.definition} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Symptoms</div>
            <ul className="mt-1.5 space-y-1.5">
              {input.symptoms.map((s) => (
                <li key={s} className="text-xs text-slate-700 flex gap-2"><AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" /><span>{s}</span></li>
              ))}
            </ul>
          </div>
          <Field label="Business Impact" body={input.impact} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Example Metrics</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {input.metrics.map((m) => (
                <span key={m} className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-[11px] font-medium">{m}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">HHAX Manifestation</div>
            <div className="text-xs text-emerald-900 mt-1 leading-relaxed">{input.hhax}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ----- Deliverable Panel ----- */

function DeliverablePanel({ open, onClose, deliverable }: { open: boolean; onClose: () => void; deliverable: typeof DELIVERABLES[number] | null }) {
  if (!deliverable) return null;
  const stagesProducing = STAGES.filter((s) => deliverable.stages[s.id]);
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[36vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 inline-flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Deliverable Artifact</div>
              <SheetTitle className="text-base font-semibold text-slate-900">{deliverable.name}</SheetTitle>
            </div>
          </div>
        </SheetHeader>
        <div className="px-6 py-4 space-y-4 overflow-y-auto h-[calc(100vh-92px)]">
          <Field label="Why It Matters" body={deliverable.matters} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Produced In</div>
            <div className="mt-2 space-y-2">
              {stagesProducing.map((s) => {
                const t = TONE[s.tone];
                return (
                  <div key={s.id} className={`rounded-lg border ${t.border} ${t.soft} p-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full ${t.bg} ${t.text} inline-flex items-center justify-center text-[10px] font-bold`}>{s.number}</span>
                      <span className={`text-xs font-semibold ${t.text}`}>{s.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{s.window}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Example Artifact Templates</div>
            <ul className="mt-2 space-y-1.5">
              <li className="text-xs text-slate-700 flex gap-2"><BookOpen className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" /><span>Sample {deliverable.name} (markdown template)</span></li>
              <li className="text-xs text-slate-700 flex gap-2"><Code2 className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" /><span>Reference implementation (repo skeleton)</span></li>
              <li className="text-xs text-slate-700 flex gap-2"><Database className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" /><span>Schema / data model definition</span></li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
