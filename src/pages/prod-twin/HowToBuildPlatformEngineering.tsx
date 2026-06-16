import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, X, Cloud, GitBranch, Boxes, Workflow, Users, Bot, Shield,
  Eye, Timer, Target, Sparkles, FileText, Route, BookOpen, ListChecks, Activity,
  Wrench, DollarSign, Database, Layers, ClipboardList, Rocket, Gauge, ShieldCheck,
  LayoutGrid, Map, ChevronRight, Building2, BadgeCheck, Settings, Lightbulb,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Kind = "kpi" | "input" | "stage" | "enabler" | "deliverable" | "role" | "journey" | "outcome";
type Entry = {
  id: string;
  kind: Kind;
  name: string;
  subtitle?: string;
  icon: any;
  accent: string;
  bg: string;
  // overview tab
  summary?: string;
  why?: string;
  benchmark?: string;
  kpiValue?: string;
  // implementation
  activities?: string[];
  dependencies?: string[];
  deliverables?: string[];
  pitfalls?: string[];
  // raci
  owner?: string;
  contributors?: string[];
  raci?: { role: string; r: string }[];
  decisions?: string[];
  // competencies
  technical?: string[];
  operational?: string[];
  business?: string[];
  leadership?: string[];
  certifications?: string[];
  experience?: string[];
  // artifacts
  artifacts?: string[];
  // kpis
  kpis?: { name: string; target: string; benchmark: string; owner: string; cadence: string }[];
  // hhax
  hhax?: string[];
  // roadmap
  d30?: string[];
  d90?: string[];
  d180?: string[];
  d365?: string[];
  risks?: string[];
  // relationships
  related?: string[];
};

// ─── KPIs ────────────────────────────────────────────────────────────────────
const KPIS: Entry[] = [
  { id: "kpi1", kind: "kpi", name: "Time To First Value", kpiValue: "90 Days", icon: Timer, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Time from platform program kickoff to first product team consuming a paved-road service in production.",
    benchmark: "Mature platform programs: 60–90 days for first golden path; 6 months for portal and catalog at scale.",
    why: "First value proves the platform is real to engineering and unlocks executive sponsorship for sustained investment." },
  { id: "kpi2", kind: "kpi", name: "Platform Adoption Target", kpiValue: "75%", icon: Target, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Share of new services launched on golden paths instead of bespoke patterns.",
    benchmark: "Maturing platforms: 60–80%. Mature platforms (Spotify, Netflix paved road): > 85%.",
    why: "Adoption is the only honest measure of platform value — usage proves engineers chose the platform over going around it." },
  { id: "kpi3", kind: "kpi", name: "Developer Satisfaction", kpiValue: "4.5 / 5", icon: Users, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Composite DevEx survey score across speed, clarity, support, and reliability.",
    benchmark: "Healthy platform: ≥ 4.0 / 5 with rising trend over 3 consecutive quarters.",
    why: "Developer satisfaction predicts retention, productivity, and willingness to adopt new platform capabilities." },
  { id: "kpi4", kind: "kpi", name: "Provisioning Time", kpiValue: "< 30 Minutes", icon: Gauge, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Median time from a standard self-service request to a usable resource.",
    benchmark: "Mature platforms: < 30 min for standard requests, < 1 day for landing zones. Ticket-driven ops: days to weeks.",
    why: "Provisioning latency is the largest source of delivery friction; reducing it unlocks daily deployment." },
  { id: "kpi5", kind: "kpi", name: "Manual Requests Eliminated", kpiValue: "60%", icon: Bot, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Reduction in human-handled tickets after self-service workflows go live.",
    benchmark: "Year 1: 40–60% elimination of routine tickets. Year 2: 70–80% with mature golden paths.",
    why: "Toil reduction frees platform engineers to build new capabilities and reduces lead time variance." },
  { id: "kpi6", kind: "kpi", name: "Golden Path Adoption", kpiValue: "80%", icon: Route, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "% of new workloads built on the recommended reference templates.",
    benchmark: "Mature platform organizations target 80%+ adoption of sanctioned templates.",
    why: "Standardization is the leading indicator of reliability, security, and cost predictability at scale." },
];

// ─── Section 1: Inputs ──────────────────────────────────────────────────────
const INPUTS: Entry[] = [
  { id: "in1", kind: "input", name: "Manual Provisioning", icon: Wrench, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Infrastructure, accounts, and environments are stood up by hand through ticket queues.",
    why: "Manual provisioning creates lead-time variance, configuration drift, and security gaps.",
    activities: ["Catalog all current provisioning request types", "Measure median and 90th percentile lead time", "Identify top 5 most-requested resources for automation"] },
  { id: "in2", kind: "input", name: "Ticket Queues", icon: ClipboardList, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Engineering productivity is gated by ITSM tickets routed to ops, networking, security, and DBA teams.",
    why: "Tickets create cognitive friction, hide root causes, and convert engineering capacity into queue management." },
  { id: "in3", kind: "input", name: "Environment Drift", icon: Layers, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Dev, staging, and production diverge over time because changes are applied directly to environments.",
    why: "Drift is the root cause of 'works on my machine,' undiagnosed outages, and untestable rollbacks." },
  { id: "in4", kind: "input", name: "Cloud Inconsistency", icon: Cloud, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Acquired business units run different cloud providers, account structures, and tagging schemes.",
    why: "Inconsistency blocks centralized observability, cost reporting, and security posture management." },
  { id: "in5", kind: "input", name: "Low Automation", icon: Bot, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Most operational work is human-executed — runbooks live in wikis, not pipelines.",
    why: "Low automation caps the organization at the throughput of its on-call rotation." },
  { id: "in6", kind: "input", name: "Developer Friction", icon: Users, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Engineers spend 30–50% of their week on non-feature work: setup, debugging environments, chasing approvals.",
    why: "DevEx friction is the largest unrecognized cost in engineering organizations." },
  { id: "in7", kind: "input", name: "Security Variance", icon: Shield, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Security controls are inconsistently applied across teams and accounts.",
    why: "Variance creates audit findings, breach exposure, and rework when controls are retrofitted." },
  { id: "in8", kind: "input", name: "Tool Sprawl", icon: Boxes, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Multiple CI tools, secret stores, observability platforms, and IaC frameworks across teams.",
    why: "Tool sprawl multiplies licensing, training, and integration cost while reducing leverage." },
  { id: "in9", kind: "input", name: "Long Lead Times", icon: Timer, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Days to weeks between a developer request and a usable resource.",
    why: "Lead time directly determines deployment frequency and feedback loop length." },
  { id: "in10", kind: "input", name: "Knowledge Silos", icon: BookOpen, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Operational knowledge lives in individuals, not in code or documentation.",
    why: "Silos create key-person dependencies and prevent organizational scaling." },
  { id: "in11", kind: "input", name: "Infrastructure Snowflakes", icon: Sparkles, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Each service runs on a uniquely configured stack assembled by its team.",
    why: "Snowflakes block patching, hardening, and reliability engineering at scale." },
  { id: "in12", kind: "input", name: "High Cognitive Load", icon: Activity, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Product teams must understand cloud, networking, security, IaC, CI, observability, and on-call.",
    why: "Cognitive overload is the underlying reason teams ship slowly and burn out." },
];

// ─── Section 2: Stages ──────────────────────────────────────────────────────
const STAGES: Entry[] = [
  { id: "s1", kind: "stage", name: "Define Platform Vision", subtitle: "Stage 1 · Weeks 0–8",
    icon: Lightbulb, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Identify platform customers, current state, and platform scope. Establish a charter and roadmap that frames the platform as an internal product.",
    activities: ["Developer interviews (20+ across product teams)", "Developer journey mapping (request → production)", "Current state assessment (tools, lead times, friction)", "Platform scope definition (in/out of charter)", "Persona development for platform consumers"],
    deliverables: ["Platform Charter", "Platform Roadmap", "Platform Personas", "Platform Backlog"],
    dependencies: ["Executive sponsorship", "Access to product team leaders", "Baseline DORA / DevEx metrics"],
    pitfalls: ["Defining the platform from infrastructure perspective instead of developer perspective", "Skipping interviews and assuming what developers need", "Treating the charter as a one-time document instead of a living artifact"],
    related: ["in2", "in6", "in10", "e1", "e2"] },
  { id: "s2", kind: "stage", name: "Build Foundations", subtitle: "Stage 2 · Months 2–5",
    icon: Layers, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Stand up the substrate every paved road will depend on: landing zones, identity, networking, IaC, and observability standards.",
    activities: ["Cloud landing zones (multi-account / multi-region)", "Identity & access standards (SSO, RBAC, break-glass)", "Networking standards (VPC, peering, egress)", "IaC standards (Terraform modules, state, policy-as-code)", "Observability standards (logs, metrics, traces, tagging)"],
    deliverables: ["Reference Architecture", "Golden Images", "Terraform Module Library", "Platform Standards Document"],
    dependencies: ["Cloud provider relationships", "Security & compliance alignment", "Network architecture decisions"],
    pitfalls: ["Building foundations without a consumer in mind", "Choosing tools before understanding patterns", "Skipping policy-as-code and bolting compliance on later"],
    related: ["in1", "in3", "in4", "in7", "s3"] },
  { id: "s3", kind: "stage", name: "Create Reusable Services", subtitle: "Stage 3 · Months 4–8",
    icon: Boxes, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Productize the foundations into self-service capabilities: CI/CD templates, a developer portal, golden paths, and platform APIs.",
    activities: ["CI/CD pipeline templates per workload type", "Developer portal (Backstage or equivalent)", "Self-service workflows (account, env, DB, namespace)", "Platform APIs and SDK for programmatic access", "Shared services (queues, caches, observability, secrets)"],
    deliverables: ["Internal Developer Platform", "Golden Path Library", "Service Catalog", "Reusable Components"],
    dependencies: ["Foundations from Stage 2", "Product team pilots", "Identity and policy integration"],
    pitfalls: ["Building a portal with no real capabilities behind it", "Creating golden paths nobody asked for", "Ignoring versioning and lifecycle of platform services"],
    related: ["in5", "in8", "in11", "s2", "s4"] },
  { id: "s4", kind: "stage", name: "Enable Adoption", subtitle: "Stage 4 · Months 6–12",
    icon: Rocket, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Treat adoption as a product launch: documentation, training, onboarding, support, and feedback loops drive usage.",
    activities: ["Documentation portal and reference content", "Onboarding paths for new teams", "Office hours and embedded platform engineers", "Platform support model (Slack + on-call)", "Developer feedback rituals (surveys, retros, NPS)"],
    deliverables: ["Adoption Program", "Platform Champions Network", "Knowledge Base", "Developer Experience Metrics"],
    dependencies: ["Stage 3 capabilities", "Executive endorsement", "Pilot teams willing to publicize wins"],
    pitfalls: ["Treating adoption as marketing instead of product", "Forcing adoption through mandate without value", "Not measuring DevEx after launch"],
    related: ["in6", "in9", "in12", "s3", "s5"] },
  { id: "s5", kind: "stage", name: "Scale Platform Operations", subtitle: "Stage 5 · Months 9–18+",
    icon: TrendingUpIcon, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Operate the platform as a continuously improving product: SRE practices, FinOps, security controls, and product governance.",
    activities: ["Automation of operational toil", "Reliability engineering (SLOs, error budgets)", "FinOps (cost allocation, optimization, showback)", "Security controls (guardrails, drift detection)", "Platform telemetry and scorecards"],
    deliverables: ["Platform Governance", "Platform Product Management Function", "Continuous Improvement Cadence"],
    dependencies: ["Adoption maturity from Stage 4", "Cross-functional partnerships (SRE, Sec, FinOps)", "Stable platform team headcount"],
    pitfalls: ["Stopping investment once first wave adopts", "Letting platform become its own snowflake", "Failing to retire deprecated services"],
    related: ["in7", "in12", "s4"] },
];

// Sneaky import: lucide-react has TrendingUp; alias for a name used above.
import { TrendingUp as TrendingUpIcon } from "lucide-react";

// ─── Section 3: Enablers ────────────────────────────────────────────────────
const ENABLERS: Entry[] = [
  { id: "e1", kind: "enabler", name: "Leadership Alignment", icon: BadgeCheck, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Executives publicly commit to the platform as a product, not a side project.", why: "Platform investment spans budget cycles — sponsorship survives the inevitable trough.",
    activities: ["Quarterly executive review of platform metrics", "Named executive sponsor", "Funding model aligned to platform outcomes"] },
  { id: "e2", kind: "enabler", name: "Platform Product Thinking", icon: Target, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "The platform has a product manager, roadmap, personas, and adoption metrics.", why: "Without product thinking, the platform becomes a tool collection developers route around.",
    activities: ["Dedicated platform PM", "Public roadmap", "Persona-based prioritization"] },
  { id: "e3", kind: "enabler", name: "Standards & Reference Architecture", icon: Layers, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Documented patterns for the top workload types (web, API, batch, ML, event-driven).", why: "Standards make automation possible and reduce decision fatigue.",
    activities: ["Reference architecture library", "Workload-type templates", "ADR practice"] },
  { id: "e4", kind: "enabler", name: "Automation First", icon: Bot, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Every repeated operation is automated before it is documented as a runbook.", why: "Automation-first creates compounding leverage; ticket-first creates compounding toil." },
  { id: "e5", kind: "enabler", name: "Observability", icon: Eye, accent: "border-cyan-200 text-cyan-700", bg: "bg-cyan-50",
    summary: "Standardized logs, metrics, traces, and tagging across all platform services.", why: "Without observability, the platform cannot prove reliability or diagnose adoption issues." },
  { id: "e6", kind: "enabler", name: "Security by Default", icon: ShieldCheck, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Identity, secrets, network, and policy guardrails are baked into golden paths.", why: "Retrofitting security after adoption is 10× more expensive and breaks DevEx." },
  { id: "e7", kind: "enabler", name: "Developer Experience Focus", icon: Users, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "DevEx is measured, owned, and improved on a quarterly cadence.", why: "DevEx is the leading indicator of adoption, retention, and delivery velocity." },
  { id: "e8", kind: "enabler", name: "Metrics & Feedback", icon: Gauge, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Adoption, DevEx, reliability, and cost are tracked publicly and reviewed.", why: "Metrics convert anecdote into investment cases and surface drift early." },
  { id: "e9", kind: "enabler", name: "Self-Service Design", icon: Workflow, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Every common request has a self-service path that bypasses tickets.", why: "Self-service is the operational definition of platform value." },
  { id: "e10", kind: "enabler", name: "Documentation", icon: FileText, accent: "border-slate-200 text-slate-700", bg: "bg-slate-50",
    summary: "Docs live next to the platform code and are versioned with each release.", why: "Documentation is the user interface for everything the platform doesn't render visually." },
];

// ─── Section 4: Deliverables matrix ─────────────────────────────────────────
const DELIVERABLES: Entry[] = [
  { id: "d1", kind: "deliverable", name: "Platform Charter", icon: FileText, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "1–2 page statement of platform mission, customers, scope, and success metrics.",
    owner: "Platform Product Manager",
    contributors: ["Platform Lead", "CTO", "VP Engineering"],
    artifacts: ["Charter doc", "Stakeholder map", "Out-of-scope list"] },
  { id: "d2", kind: "deliverable", name: "Platform Roadmap", icon: Map, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Quarterly capability roadmap tied to adoption and DevEx outcomes.", owner: "Platform Product Manager" },
  { id: "d3", kind: "deliverable", name: "Cloud Landing Zones", icon: Cloud, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Pre-configured multi-account / multi-region cloud foundations with identity, network, and policy baked in.", owner: "Cloud Platform Engineer" },
  { id: "d4", kind: "deliverable", name: "Golden Images", icon: Boxes, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Hardened, scanned, versioned base images / containers used by all workloads.", owner: "Platform Engineer" },
  { id: "d5", kind: "deliverable", name: "Terraform Library", icon: GitBranch, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Versioned, tested Terraform modules for every supported resource pattern.", owner: "Platform Engineer" },
  { id: "d6", kind: "deliverable", name: "Developer Portal", icon: LayoutGrid, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Backstage-style entry point: catalog, docs, scaffolders, scorecards.", owner: "Developer Experience Engineer" },
  { id: "d7", kind: "deliverable", name: "CI/CD Templates", icon: Workflow, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Reusable pipeline templates per workload type with policy and security baked in.", owner: "Platform Engineer" },
  { id: "d8", kind: "deliverable", name: "Platform APIs", icon: Settings, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Programmatic access to provisioning, deployment, and operations.", owner: "Platform Engineer" },
  { id: "d9", kind: "deliverable", name: "Observability Standards", icon: Eye, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Logs, metrics, traces, and tagging conventions across services.", owner: "SRE / Platform Engineer" },
  { id: "d10", kind: "deliverable", name: "Service Catalog", icon: BookOpen, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Discoverable index of all platform services with ownership and SLOs.", owner: "Developer Experience Engineer" },
  { id: "d11", kind: "deliverable", name: "Golden Paths", icon: Route, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Opinionated, end-to-end paths for the top workload types.", owner: "Platform Product Manager + Platform Engineer" },
  { id: "d12", kind: "deliverable", name: "Security Guardrails", icon: ShieldCheck, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Preventive policies (OPA, SCPs) and detective controls embedded in pipelines.", owner: "Security Engineer + Platform Engineer" },
  { id: "d13", kind: "deliverable", name: "Platform Scorecards", icon: Gauge, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Service-level scorecards covering reliability, security, cost, and DevEx.", owner: "SRE / Platform PM" },
  { id: "d14", kind: "deliverable", name: "Platform Governance", icon: ClipboardList, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Operating model for change, deprecation, escalation, and investment review.", owner: "Platform Lead + CTO" },
];

const STAGE_COLUMNS = ["Foundation", "Build", "Adoption", "Scale"] as const;
const DELIVERABLE_MATRIX: Record<string, ("●" | "◐" | "○" | "")[]> = {
  d1: ["●", "○", "", ""],
  d2: ["●", "◐", "◐", "○"],
  d3: ["●", "◐", "", ""],
  d4: ["●", "◐", "", ""],
  d5: ["◐", "●", "○", ""],
  d6: ["", "●", "●", "○"],
  d7: ["", "●", "●", ""],
  d8: ["", "●", "◐", "○"],
  d9: ["◐", "●", "◐", "○"],
  d10: ["", "●", "●", "◐"],
  d11: ["", "◐", "●", "●"],
  d12: ["◐", "●", "◐", "●"],
  d13: ["", "", "◐", "●"],
  d14: ["", "", "○", "●"],
};

// ─── Section 5: Roles ───────────────────────────────────────────────────────
const ROLES: Entry[] = [
  { id: "r1", kind: "role", name: "Platform Product Manager", icon: Target, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Owns the platform charter, roadmap, personas, and adoption metrics.",
    technical: ["Cloud fundamentals", "Developer workflows", "Internal platforms (Backstage, IDPs)"],
    operational: ["Product discovery", "Roadmap management", "Stakeholder management"],
    leadership: ["Influence without authority", "Executive communication"],
    business: ["Cost / value framing", "OKR design"],
    experience: ["5+ years product management, ideally for technical / internal customers"] },
  { id: "r2", kind: "role", name: "Platform Engineers", icon: Wrench, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Build and operate the reusable services consumed by product teams.",
    technical: ["IaC (Terraform, Pulumi)", "Kubernetes", "API design", "CI/CD"],
    operational: ["On-call discipline", "Incident management", "Capacity planning"] },
  { id: "r3", kind: "role", name: "Cloud Engineers", icon: Cloud, accent: "border-cyan-200 text-cyan-700", bg: "bg-cyan-50",
    summary: "Own landing zones, identity, networking, and cloud-native primitives.",
    technical: ["AWS / GCP / Azure deep knowledge", "Networking", "Identity (SSO, IAM)"],
    certifications: ["AWS Solutions Architect", "CKA", "GCP Professional Cloud Architect"] },
  { id: "r4", kind: "role", name: "DevOps Engineers", icon: GitBranch, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Build and operate CI/CD pipelines and deployment automation.",
    technical: ["Pipeline frameworks", "Containers", "Artifact management"] },
  { id: "r5", kind: "role", name: "Developer Experience Engineers", icon: Users, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Own the portal, scaffolders, docs, and onboarding experience.",
    technical: ["Frontend (React)", "Backstage", "Docs-as-code"],
    operational: ["UX research", "Adoption analytics"] },
  { id: "r6", kind: "role", name: "Automation Engineers", icon: Bot, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Automate operational toil and build platform workflow services.",
    technical: ["Workflow engines", "Scripting (Python, Go)", "Event-driven systems"] },
  { id: "r7", kind: "role", name: "Security Engineers", icon: ShieldCheck, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Embed identity, secrets, policy, and detection into the platform.",
    technical: ["Policy-as-code (OPA)", "Secrets management", "Cloud security posture"] },
  { id: "r8", kind: "role", name: "Reliability Engineers", icon: Activity, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Define SLOs, error budgets, and reliability standards for platform services.",
    technical: ["SLO design", "Observability", "Incident management"] },
  { id: "r9", kind: "role", name: "Enterprise Architects", icon: Building2, accent: "border-slate-200 text-slate-700", bg: "bg-slate-50",
    summary: "Set reference architectures and integration standards across acquired BUs.",
    technical: ["Reference architecture", "Integration patterns", "Cloud landing zone design"] },
];

// ─── Section 6: Adoption Journey ────────────────────────────────────────────
const JOURNEY: Entry[] = [
  { id: "j1", kind: "journey", name: "Developers Request Capability", icon: Users, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Product team identifies a recurring need (a queue, a database type, an environment pattern)." },
  { id: "j2", kind: "journey", name: "Platform Team Creates Service", icon: Wrench, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Platform PM validates demand; engineers build a paved-road service with golden defaults." },
  { id: "j3", kind: "journey", name: "Golden Path Published", icon: Route, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Service appears in the portal with docs, examples, scaffolder, and supported SLO." },
  { id: "j4", kind: "journey", name: "Developer Self-Service Adoption", icon: Workflow, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Teams adopt through the portal — no tickets required." },
  { id: "j5", kind: "journey", name: "Usage Telemetry Captured", icon: Eye, accent: "border-cyan-200 text-cyan-700", bg: "bg-cyan-50",
    summary: "Adoption, latency, errors, and DevEx signals flow into the platform scorecard." },
  { id: "j6", kind: "journey", name: "Platform Improved", icon: TrendingUpIcon, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Feedback drives the next iteration; the loop continues as a product." },
];

// ─── Section 7: Outcomes ────────────────────────────────────────────────────
const OUTCOMES: Entry[] = [
  { id: "o1", kind: "outcome", name: "Developer Productivity", subtitle: "More time on features, less on plumbing", icon: Rocket, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    summary: "Self-service and golden paths return 20–40% of engineering capacity to product work." },
  { id: "o2", kind: "outcome", name: "Delivery Velocity", subtitle: "Daily, low-risk deployment", icon: TrendingUpIcon, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "Standardized pipelines and environments enable elite DORA performance." },
  { id: "o3", kind: "outcome", name: "Reliability", subtitle: "Fewer incidents, faster recovery", icon: Activity, accent: "border-indigo-200 text-indigo-700", bg: "bg-indigo-50",
    summary: "Shared observability and SLO discipline shrink MTTR and change failure rate." },
  { id: "o4", kind: "outcome", name: "Security", subtitle: "Guardrails before gates", icon: ShieldCheck, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    summary: "Policy-as-code and secure defaults raise baseline posture without slowing teams." },
  { id: "o5", kind: "outcome", name: "Cost Efficiency", subtitle: "Optimization built in", icon: DollarSign, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    summary: "Shared services, right-sizing, and FinOps embedded in golden paths reduce unit cost." },
  { id: "o6", kind: "outcome", name: "Standardization", subtitle: "Common patterns across BUs", icon: Layers, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    summary: "Acquired and legacy environments converge onto a single supported substrate." },
  { id: "o7", kind: "outcome", name: "Reduced Cognitive Load", subtitle: "Teams focus on what they own", icon: Sparkles, accent: "border-cyan-200 text-cyan-700", bg: "bg-cyan-50",
    summary: "Platform abstracts cloud, security, and ops so product teams optimize for value." },
  { id: "o8", kind: "outcome", name: "Faster Onboarding", subtitle: "Day-one productivity", icon: BadgeCheck, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    summary: "New engineers ship code in days, not weeks, via the portal and scaffolders." },
];

const ALL: Entry[] = [...KPIS, ...INPUTS, ...STAGES, ...ENABLERS, ...DELIVERABLES, ...ROLES, ...JOURNEY, ...OUTCOMES];
const PANE_ORDER = ALL.map(e => e.id);

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HowToBuildPlatformEngineering() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);
  const entry = ALL.find(e => e.id === selected) ?? null;
  const idx = selected ? PANE_ORDER.indexOf(selected) : -1;
  const stageRelated = useMemo(() => new Set(hoverStage ? (STAGES.find(s => s.id === hoverStage)?.related ?? []) : []), [hoverStage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/reliability-foundations")} className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Reliability Foundations
          </button>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Platform Engineering · Implementation</div>
          <button onClick={() => navigate("/reliability-foundations/platform-engineering/design-principles")} className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1">
            Design Principles <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 p-8">
          <div className="text-[11px] uppercase tracking-wider text-sky-700 font-bold mb-2">How Organizations Build It</div>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">How Organizations Build Platform Engineering</h1>
          <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
            A practical implementation journey from fragmented operations to reusable platform services — the people,
            capabilities, governance, technology, and operating model required to create a successful platform engineering organization.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {KPIS.map(k => <KpiCard key={k.id} k={k} onClick={() => setSelected(k.id)} />)}
          </div>
        </section>

        {/* Section 1: Inputs */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">1. Inputs We Start With</h2>
              <p className="text-xs text-slate-500 mt-1">The operational friction that motivates a platform investment. Click any input to see how the platform addresses it.</p>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">12 friction sources</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INPUTS.map(i => (
              <button key={i.id} onClick={() => setSelected(i.id)}
                className={`text-left rounded-xl border bg-white p-3 hover:shadow-md transition-all ${i.accent.replace("text-", "border-").split(" ")[0]} ${stageRelated.has(i.id) ? "ring-2 ring-sky-400" : ""}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${i.bg} mb-2`}>
                  <i.icon className={`w-4 h-4 ${i.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{i.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{i.summary}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Transformation Factory */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">2. The Platform Engineering Transformation Factory</h2>
              <p className="text-xs text-slate-500 mt-1">A staged, sequenced journey from foundations to scaled platform operations. Hover to see related friction; click for the implementation drawer.</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-12 left-6 right-6 h-0.5 bg-gradient-to-r from-sky-300 via-emerald-300 to-violet-300" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {STAGES.map((s, i) => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  onMouseEnter={() => setHoverStage(s.id)} onMouseLeave={() => setHoverStage(null)}
                  className={`text-left rounded-2xl border bg-white p-4 hover:shadow-lg transition-all ${s.accent.replace("text-", "border-").split(" ")[0]} ${hoverStage === s.id ? "shadow-xl -translate-y-1" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${s.bg}`}>
                      <s.icon className={`w-5 h-5 ${s.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">STAGE {i + 1}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{s.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.subtitle}</div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-snug line-clamp-3">{s.summary}</p>
                  {s.deliverables && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Outputs</div>
                      <ul className="space-y-0.5">
                        {s.deliverables.slice(0, 3).map((d, k) => <li key={k} className="text-[10px] text-slate-600">• {d}</li>)}
                      </ul>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Enablers */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">3. Critical Enablers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ENABLERS.map(e => (
              <button key={e.id} onClick={() => setSelected(e.id)}
                className={`text-left rounded-xl border bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all ${e.accent.replace("text-", "border-").split(" ")[0]}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${e.bg} mb-2`}>
                  <e.icon className={`w-4 h-4 ${e.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{e.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-3">{e.summary}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 4: Deliverables Matrix */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 overflow-x-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-4">4. Key Deliverables</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold py-2 pr-4">Deliverable</th>
                {STAGE_COLUMNS.map(c => (
                  <th key={c} className="text-center text-[11px] uppercase tracking-wider text-slate-500 font-semibold py-2 px-3">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DELIVERABLES.map(d => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/60 cursor-pointer" onClick={() => setSelected(d.id)}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <d.icon className={`w-4 h-4 ${d.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{d.summary}</div>
                      </div>
                    </div>
                  </td>
                  {DELIVERABLE_MATRIX[d.id].map((m, i) => (
                    <td key={i} className="text-center text-lg font-bold text-slate-700">{m}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-[10px] text-slate-500 flex gap-4">
            <span>● Primary delivery</span><span>◐ Active investment</span><span>○ Maintenance</span>
          </div>
        </section>

        {/* Section 5: Roles */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">5. Platform Team Structure</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setSelected(r.id)}
                className={`text-left rounded-xl border bg-white p-4 hover:shadow-md transition-all ${r.accent.replace("text-", "border-").split(" ")[0]}`}>
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${r.bg} mb-2`}>
                  <r.icon className={`w-4 h-4 ${r.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{r.name}</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-snug">{r.summary}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 6: Adoption Journey */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">6. Platform Adoption Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-stretch">
            {JOURNEY.map((j, i) => (
              <div key={j.id} className="relative flex">
                <button onClick={() => setSelected(j.id)}
                  className={`flex-1 text-left rounded-xl border bg-white p-3 hover:shadow-md transition-all ${j.accent.replace("text-", "border-").split(" ")[0]}`}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${j.bg} mb-2`}>
                    <j.icon className={`w-4 h-4 ${j.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Step {i + 1}</div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{j.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-3">{j.summary}</div>
                </button>
                {i < JOURNEY.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Outcomes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">7. Business Outcomes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OUTCOMES.map(o => (
              <button key={o.id} onClick={() => setSelected(o.id)}
                className={`text-left rounded-xl border bg-white p-3 hover:shadow-md transition-all ${o.accent.replace("text-", "border-").split(" ")[0]}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${o.bg} mb-2`}>
                  <o.icon className={`w-4 h-4 ${o.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{o.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">{o.subtitle}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="rounded-2xl border-l-4 border-sky-500 bg-slate-50 px-6 py-4">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">How Platform Engineering Is Built — In One Sentence</div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Define the platform as a product, build opinionated foundations, productize them into self-service capabilities,
            invest in adoption, and operate the result as a continuously improving internal product.
          </p>
        </section>

        <p className="text-[10px] text-slate-400 text-center pb-6">
          Illustrative implementation guidance for educational reference. Targets reflect industry benchmarks, not customer commitments.
        </p>
      </div>

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[40vw] sm:w-[40vw] p-0 overflow-y-auto">
          {entry && (
            <EntryPane
              entry={entry}
              onPrev={() => idx > 0 && setSelected(PANE_ORDER[idx - 1])}
              onNext={() => idx >= 0 && idx < PANE_ORDER.length - 1 && setSelected(PANE_ORDER[idx + 1])}
              indexInfo={`${idx + 1} of ${PANE_ORDER.length}`}
              onClose={() => setSelected(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({ k, onClick }: { k: Entry; onClick: () => void }) {
  const Icon = k.icon;
  return (
    <button onClick={onClick} className={`text-left rounded-xl border ${k.accent.replace("text-", "border-").split(" ")[0]} ${k.bg} px-3 py-2.5 hover:shadow-md transition-all`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        <Icon className={`w-3.5 h-3.5 ${k.accent.split(" ").find(c => c.startsWith("text-"))}`} />
        {k.name}
      </div>
      <div className={`mt-1 text-xl font-bold ${k.accent.split(" ").find(c => c.startsWith("text-"))}`}>{k.kpiValue}</div>
      <div className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">{k.summary}</div>
    </button>
  );
}

// ─── Drawer pane ────────────────────────────────────────────────────────────
function EntryPane({ entry, onPrev, onNext, indexInfo, onClose }: { entry: Entry; onPrev: () => void; onNext: () => void; indexInfo: string; onClose: () => void; }) {
  const Icon = entry.icon;
  const kindLabel = useMemo(() => ({
    kpi: "Key Performance Indicator", input: "Operational Input", stage: "Transformation Stage",
    enabler: "Critical Enabler", deliverable: "Key Deliverable", role: "Platform Role",
    journey: "Adoption Step", outcome: "Business Outcome",
  } as Record<string, string>)[entry.kind], [entry.kind]);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${entry.bg} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${entry.accent.split(" ").find(c => c.startsWith("text-"))}`} />
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg font-bold text-slate-900 leading-tight">{entry.name}</SheetTitle>
            <div className="text-xs text-slate-500 mt-0.5">{kindLabel}{entry.subtitle ? ` · ${entry.subtitle}` : ""}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>
      </SheetHeader>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="px-6 mt-3 flex flex-wrap justify-start h-auto bg-transparent gap-1">
          {["overview", "implementation", "raci", "competencies", "artifacts", "kpis", "hhax", "roadmap"].map(t => (
            <TabsTrigger key={t} value={t} className="text-[11px] capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              {t === "hhax" ? "HHAX Relevance" : t === "raci" ? "Roles & RACI" : t === "kpis" ? "KPIs" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <TabsContent value="overview" className="space-y-4 mt-4">
            {entry.kpiValue && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Target / Current</span>
                <span className="text-lg font-bold text-slate-900">{entry.kpiValue}</span>
              </div>
            )}
            {entry.summary && <Section title="What this is"><p className="text-sm text-slate-700 leading-relaxed">{entry.summary}</p></Section>}
            {entry.why && <Section title="Why it matters"><p className="text-sm text-slate-700 leading-relaxed">{entry.why}</p></Section>}
            {entry.benchmark && <Section title="Industry benchmark"><p className="text-sm text-slate-700 leading-relaxed">{entry.benchmark}</p></Section>}
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4 mt-4">
            {entry.activities && <ListSection title="Activities" items={entry.activities} />}
            {entry.dependencies && <ListSection title="Dependencies" items={entry.dependencies} />}
            {entry.deliverables && <ListSection title="Deliverables" items={entry.deliverables} />}
            {entry.pitfalls && <ListSection title="Common pitfalls" items={entry.pitfalls} />}
            {!entry.activities && !entry.dependencies && !entry.deliverables && <Empty />}
          </TabsContent>

          <TabsContent value="raci" className="space-y-4 mt-4">
            {entry.owner && <Section title="Owner"><p className="text-sm text-slate-700 font-semibold">{entry.owner}</p></Section>}
            {entry.contributors && <ListSection title="Contributors" items={entry.contributors} />}
            {entry.decisions && <ListSection title="Decision rights" items={entry.decisions} />}
            {!entry.owner && !entry.contributors && (
              <div className="text-xs text-slate-500 leading-relaxed">
                Typical accountability: <strong>Platform PM</strong> sets direction · <strong>Platform Engineers</strong> build ·
                <strong> SRE / Security</strong> embed standards · <strong>Product teams</strong> consume and feed back.
              </div>
            )}
          </TabsContent>

          <TabsContent value="competencies" className="space-y-4 mt-4">
            {entry.technical && <TagSection title="Technical" items={entry.technical} />}
            {entry.operational && <TagSection title="Operational" items={entry.operational} />}
            {entry.business && <TagSection title="Business" items={entry.business} />}
            {entry.leadership && <TagSection title="Leadership" items={entry.leadership} />}
            {entry.experience && <ListSection title="Required experience" items={entry.experience} />}
            {entry.certifications && <TagSection title="Relevant certifications" items={entry.certifications} />}
            {!entry.technical && !entry.operational && !entry.leadership && <Empty />}
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-4 mt-4">
            <ListSection title="Standard artifacts" items={entry.artifacts ?? [
              "Platform Charter", "Terraform Module", "Golden Path", "Developer Portal entry",
              "Reference Architecture", "CI/CD Pipeline template", "Runbook (automated)", "Service Catalog record",
            ]} />
          </TabsContent>

          <TabsContent value="kpis" className="space-y-3 mt-4">
            {entry.kpis ? entry.kpis.map((k, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-sm text-slate-900">{k.name}</div>
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{k.target}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500">
                  <div><span className="font-semibold text-slate-600">Benchmark:</span> {k.benchmark}</div>
                  <div><span className="font-semibold text-slate-600">Owner:</span> {k.owner}</div>
                  <div className="col-span-2"><span className="font-semibold text-slate-600">Review:</span> {k.cadence}</div>
                </div>
              </div>
            )) : (
              <ListSection title="Default platform KPIs" items={[
                "Provisioning Time (target < 30 min)", "Golden Path Adoption (target > 80%)",
                "Developer Satisfaction (target ≥ 4.5/5)", "Change Failure Rate (target < 10%)",
                "Automation Coverage (target > 70%)", "Time To First Value (target ≤ 90 days)",
              ]} />
            )}
          </TabsContent>

          <TabsContent value="hhax" className="space-y-4 mt-4">
            {entry.hhax ? entry.hhax.map((h, i) => <p key={i} className="text-sm text-slate-700 leading-relaxed">{h}</p>) : (
              <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                <p>For HHAX, building platform engineering directly answers the themes raised across the workshops:</p>
                <ul className="space-y-1 text-sm text-slate-700">
                  {["Need for standardization across acquired BUs", "Golden image strategy", "GitHub standardization",
                    "Cloud modernization and AWS landing zones", "Datadog observability as a shared service",
                    "Self-service infrastructure", "Containerization journey", "Shared services model",
                    "Reduction of ticket-driven work", "SRE transformation goals", "Reusable capabilities",
                    "Moving beyond ITIL operating patterns",
                    "Platform teams operating shared services (Kafka, observability, queues, databases, self-service onboarding)"].map((h, i) => (
                    <li key={i} className="flex gap-2"><span className="text-slate-400 mt-1">•</span><span>{h}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-4 mt-4">
            {entry.d30 && <ListSection title="30 days" items={entry.d30} />}
            {entry.d90 && <ListSection title="90 days" items={entry.d90} />}
            {entry.d180 && <ListSection title="180 days" items={entry.d180} />}
            {entry.d365 && <ListSection title="365 days" items={entry.d365} />}
            {entry.risks && <ListSection title="Risks" items={entry.risks} />}
            {!entry.d30 && !entry.d90 && !entry.d180 && (
              <div className="text-xs text-slate-500 leading-relaxed">
                Typical implementation arc: <strong>30d</strong> charter + discovery · <strong>90d</strong> first paved road in production ·
                <strong> 180d</strong> portal, catalog, multiple golden paths · <strong>365d</strong> measurable adoption, DevEx, and reliability outcomes.
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-white">
        <Button variant="outline" size="sm" onClick={onPrev} className="text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
        </Button>
        <div className="text-[11px] text-slate-500">{indexInfo}</div>
        <Button variant="outline" size="sm" onClick={onNext} className="text-xs">
          Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">{title}</div>{children}</div>;
}
function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Section title={title}>
      <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400 mt-1">•</span><span>{it}</span></li>)}</ul>
    </Section>
  );
}
function TagSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-1.5">{items.map((it, i) => <span key={i} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-700">{it}</span>)}</div>
    </Section>
  );
}
function Empty() { return <p className="text-xs text-slate-400 italic">No content for this section.</p>; }
