import { useState, useMemo } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity, Boxes, Users2, Cloud, Infinity as InfinityIcon, Bot, TrendingUp,
  Shield, BarChart3, ShieldCheck, GitBranch, Lock, DollarSign,
  Eye, UsersRound, Workflow, ShieldAlert, Star, BookOpen,
  Trophy, Rocket, UserCircle2, Building2, RefreshCcw, Compass, ArrowRight,
  ChevronRight, Target, CircleDot,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip,
} from "recharts";

/* ----------------------------- Types & Data ------------------------------ */

type PanelSection = { heading: string; body: string | string[] };
type DetailPanel = {
  id: string;
  title: string;
  kicker?: string;
  summary: string;
  sections: PanelSection[];
};

const PHASE_COLORS = {
  violet:  { ring: "#7c3aed", soft: "#f5f3ff", text: "#5b21b6", bar: "#7c3aed", tint: "bg-violet-50",  border: "border-violet-200",  chip: "bg-violet-50 text-violet-700 border-violet-200" },
  blue:    { ring: "#2563eb", soft: "#eff6ff", text: "#1d4ed8", bar: "#2563eb", tint: "bg-blue-50",    border: "border-blue-200",    chip: "bg-blue-50 text-blue-700 border-blue-200" },
  teal:    { ring: "#0d9488", soft: "#f0fdfa", text: "#0f766e", bar: "#0d9488", tint: "bg-teal-50",    border: "border-teal-200",    chip: "bg-teal-50 text-teal-700 border-teal-200" },
  green:   { ring: "#16a34a", soft: "#f0fdf4", text: "#15803d", bar: "#16a34a", tint: "bg-green-50",   border: "border-green-200",   chip: "bg-green-50 text-green-700 border-green-200" },
  amber:   { ring: "#d97706", soft: "#fffbeb", text: "#b45309", bar: "#d97706", tint: "bg-amber-50",   border: "border-amber-200",   chip: "bg-amber-50 text-amber-700 border-amber-200" },
  orange:  { ring: "#ea580c", soft: "#fff7ed", text: "#c2410c", bar: "#ea580c", tint: "bg-orange-50",  border: "border-orange-200",  chip: "bg-orange-50 text-orange-700 border-orange-200" },
  rose:    { ring: "#e11d48", soft: "#fff1f2", text: "#be123c", bar: "#e11d48", tint: "bg-rose-50",    border: "border-rose-200",    chip: "bg-rose-50 text-rose-700 border-rose-200" },
};
type PhaseKey = keyof typeof PHASE_COLORS;

type Phase = {
  id: string;
  num: number;
  title: string;
  focus: string;
  Icon: typeof Shield;
  color: PhaseKey;
  capabilities: string[];
  outcome: string;
  kpis: string[];
  maturityPct: number;
  timeframe: string;
  trend: { x: string; v: number }[];
  panel: DetailPanel;
};

const trend = (base: number, slope: number) =>
  Array.from({ length: 10 }, (_, i) => ({
    x: `Q${i + 1}`,
    v: Number((base + slope * i + (Math.random() - 0.5) * 3).toFixed(1)),
  }));

const PHASES: Phase[] = [
  {
    id: "stability",
    num: 1,
    title: "Operational Stability",
    focus: "Establish visibility and restore control",
    Icon: Shield,
    color: "violet",
    capabilities: ["Monitoring & alerting", "Incident management", "Backup & restore", "Patch management", "Configuration mgmt"],
    outcome: "Operational confidence",
    kpis: ["MTTR", "MTTD", "Availability", "Incident Volume"],
    maturityPct: 55,
    timeframe: "0 – 6 Months",
    trend: trend(50, 4),
    panel: {
      id: "stability", kicker: "Phase 1", title: "Operational Stability",
      summary: "Establish operational confidence and reduce chaos. You cannot modernize instability.",
      sections: [
        { heading: "Objective", body: "Stabilize operations before any modernization work begins. Restore signal quality, reduce noise, and create a predictable operating baseline." },
        { heading: "Capabilities Built", body: ["Monitoring & alerting", "Incident management", "Backup validation", "Patch management", "Configuration management"] },
        { heading: "Observable Behaviors", body: ["Consistent uptime on tier-1 services", "Alerts are trusted and actionable", "Recovery procedures are repeatable"] },
        { heading: "Common Anti-Patterns", body: ["Constant firefighting", "Alert fatigue and noise saturation", "Manual recovery as the default path", "No baseline of what 'normal' looks like"] },
        { heading: "Example Workflows", body: ["On-call rotation with documented runbooks", "Triage → diagnose → mitigate → restore", "Post-incident review for every Sev1"] },
        { heading: "Example Team Structure", body: ["Operations centered on tiered support", "Dedicated incident commanders", "Shared monitoring & tooling team"] },
        { heading: "KPIs", body: ["Availability (tier-1, tier-2)", "MTTD — mean time to detect", "MTTR — mean time to restore", "Incident volume by severity"] },
        { heading: "SLAs", body: ["Tier-1 99.9% baseline", "Sev1 acknowledgement within minutes", "Restore targets per tier"] },
        { heading: "Modernization Opportunities", body: ["Consolidate fragmented monitoring stacks", "Standardize alert taxonomy", "Convert tribal runbooks into living docs"] },
        { heading: "AI Opportunities", body: ["Alert correlation & noise reduction", "Anomaly detection on golden signals", "Auto-generated incident summaries"] },
        { heading: "Executive Talking Point", body: "\"You cannot modernize instability.\"" },
        { heading: "Industry Benchmarks", body: ["Top-quartile MTTR < 30 min on tier-1", "Alert-to-incident ratio < 5:1", "Repeat-incident rate < 10%"] },
        { heading: "Related Capabilities", body: ["Standardization", "Ownership & Collaboration", "Automation & AI"] },
      ],
    },
  },
  {
    id: "standardization",
    num: 2,
    title: "Standardization",
    focus: "Create consistency and reduce variability",
    Icon: Boxes,
    color: "blue",
    capabilities: ["Standard environments", "Golden images", "Standard pipelines", "Standard security controls", "Standard observability"],
    outcome: "Predictability and control",
    kpis: ["Standardization %", "Platform adoption %", "Configuration drift %"],
    maturityPct: 60,
    timeframe: "3 – 12 Months",
    trend: trend(45, 5),
    panel: {
      id: "standardization", kicker: "Phase 2", title: "Standardization",
      summary: "Reduce variability so the operating model can scale. Consistency enables automation, ownership, and platform thinking.",
      sections: [
        { heading: "Objective", body: "Replace bespoke environments and snowflake configurations with standard, repeatable, observable building blocks." },
        { heading: "Capabilities Built", body: ["Golden images & base templates", "Standard environments (dev, stage, prod)", "Standard CI/CD pipelines", "Standard security controls", "Standard observability schema"] },
        { heading: "Observable Behaviors", body: ["New services come up on a known baseline", "Configuration drift is measured and trending down", "Security controls inherit, not bolt on"] },
        { heading: "Common Anti-Patterns", body: ["Every team builds their own pipeline", "Environment parity is aspirational", "Security as a late-stage gate"] },
        { heading: "Example Workflows", body: ["Provision from golden image, never from scratch", "Pipeline-as-code with shared templates", "Drift detection feeds remediation backlog"] },
        { heading: "Example Team Structure", body: ["Standards guild across engineering", "Platform team curating golden images", "Security embedded in pipeline templates"] },
        { heading: "KPIs", body: ["Standardization coverage %", "Configuration drift %", "Platform adoption %", "Pipeline reuse %"] },
        { heading: "SLAs", body: ["Image refresh cadence", "Drift remediation SLAs", "Pipeline availability"] },
        { heading: "Modernization Opportunities", body: ["Retire one-off scripts", "Consolidate observability agents", "Codify security baselines"] },
        { heading: "AI Opportunities", body: ["Drift classification & auto-tagging", "Suggested baseline upgrades", "Policy-as-code generation"] },
        { heading: "Executive Talking Point", body: "\"Consistency enables scale.\"" },
        { heading: "Industry Benchmarks", body: ["80%+ services on golden baseline", "<5% configuration drift", ">70% pipeline reuse"] },
        { heading: "Related Capabilities", body: ["Operational Stability", "Platform Engineering", "Automation & AI"] },
      ],
    },
  },
  {
    id: "ownership",
    num: 3,
    title: "Ownership & Collaboration",
    focus: "Establish accountability and break silos",
    Icon: Users2,
    color: "teal",
    capabilities: ["Product ownership", "Service ownership", "SLOs & error budgets", "Shared accountability", "Cross-functional teams"],
    outcome: "Accountability and alignment",
    kpis: ["Ownership coverage %", "SLO coverage %", "Escalations per incident", "Handoffs per incident"],
    maturityPct: 65,
    timeframe: "6 – 18 Months",
    trend: trend(40, 6),
    panel: {
      id: "ownership", kicker: "Phase 3", title: "Ownership & Collaboration",
      summary: "Replace ticket routing with end-to-end ownership. Reliability becomes a property of teams, not of tickets.",
      sections: [
        { heading: "Objective", body: "Every critical service has a clearly accountable owner with measurable reliability targets and shared accountability across product, engineering, and operations." },
        { heading: "Capabilities Built", body: ["Product ownership for every critical service", "Service ownership with on-call accountability", "SLOs and error budgets", "Shared accountability across functions", "Cross-functional, persistent teams"] },
        { heading: "Observable Behaviors", body: ["Tickets become a coordination signal, not a routing mechanism", "Teams own reliability outcomes, not just features", "Escalations decrease as ownership clarifies"] },
        { heading: "Common Anti-Patterns", body: ["Throw-it-over-the-fence between dev and ops", "Ticket culture as the operating model", "Escalation chains substituting for ownership", "Reliability owned by 'someone else'"] },
        { heading: "Example Workflows", body: ["SLO defined per critical journey", "Error-budget policy gates releases", "Service owner triages, not a queue"] },
        { heading: "Example Team Structure", body: ["Stream-aligned product teams", "Platform team as enabling team", "SRE embedded or consulting model"] },
        { heading: "KPIs", body: ["Ownership coverage %", "SLO coverage %", "Escalation count per incident", "Handoffs per incident"] },
        { heading: "SLAs", body: ["SLOs per tier", "Error budget burn-rate alerts", "Ownership review cadence"] },
        { heading: "Modernization Opportunities", body: ["Retire ticket-driven operating model", "Move from RACI on tickets to RACI on services", "Adopt Team Topologies patterns"] },
        { heading: "AI Opportunities", body: ["Auto-route based on service ownership graph", "Ownership gap detection", "SLO drafting from telemetry"] },
        { heading: "Executive Talking Point", body: "\"Ownership should replace ticket routing.\"" },
        { heading: "Industry Benchmarks", body: ["100% tier-1 with named owner", "SLOs on >80% critical journeys", "Escalations per incident < 2"] },
        { heading: "Related Capabilities", body: ["Platform Engineering", "Continuous Optimization", "Reliability Built-In"] },
      ],
    },
  },
  {
    id: "platform",
    num: 4,
    title: "Platform Engineering",
    focus: "Build once, reuse many — enable self-service",
    Icon: Cloud,
    color: "green",
    capabilities: ["Internal platforms", "Self-service provisioning", "Reusable components", "Service catalogs", "Golden paths"],
    outcome: "Developer productivity and scale",
    kpis: ["Self-service adoption %", "Platform usage %", "Time to provision"],
    maturityPct: 70,
    timeframe: "9 – 24 Months",
    trend: trend(38, 6.5),
    panel: {
      id: "platform", kicker: "Phase 4", title: "Platform Engineering",
      summary: "Curate internal platforms and golden paths so teams ship faster, safer, and consistently — without rebuilding the fundamentals.",
      sections: [
        { heading: "Objective", body: "Treat the internal developer experience as a product. Centralize reusable capabilities and expose them via self-service." },
        { heading: "Capabilities Built", body: ["Cloud platform", "Observability platform", "Identity platform", "CI/CD platform", "Data platform"] },
        { heading: "Observable Behaviors", body: ["Teams self-serve environments in minutes", "Golden paths are the easiest path", "Compliance is inherited from the platform"] },
        { heading: "Common Anti-Patterns", body: ["Platform as a ticket queue", "No product manager for the platform", "Forcing adoption without value"] },
        { heading: "Example Workflows", body: ["Spin up a new service from a golden path", "Promote through environments via platform pipelines", "Consume observability, secrets, identity as APIs"] },
        { heading: "Example Team Structure", body: ["Platform team with PM, designer, engineers", "Stream-aligned teams as platform customers", "Enabling team for adoption coaching"] },
        { heading: "KPIs", body: ["Platform adoption %", "Self-service utilization %", "Platform consistency %", "Time-to-first-deploy for new services"] },
        { heading: "SLAs", body: ["Platform availability targets", "Provisioning latency", "Support response from platform team"] },
        { heading: "Modernization Opportunities", body: ["Replace shadow tooling with platform offerings", "Deprecate one-off integrations", "Consolidate identity & secrets"] },
        { heading: "AI Opportunities", body: ["AI-assisted scaffolding from golden paths", "Recommend platform components by workload", "Auto-document service contracts"] },
        { heading: "Executive Talking Point", body: "\"Build once. Consume many.\"" },
        { heading: "Industry Benchmarks", body: ["Platform adoption >75%", "Time to provision < 1 day", ">60% services on golden paths"] },
        { heading: "Related Capabilities", body: ["Standardization", "Modernization", "Automation & AI"] },
      ],
    },
  },
  {
    id: "modernization",
    num: 5,
    title: "Modernization",
    focus: "Reduce technical debt and evolve architecture",
    Icon: InfinityIcon,
    color: "amber",
    capabilities: ["Containerization", "Cloud migration", "Application rationalization", "Refactoring", "Technical debt reduction"],
    outcome: "Agility and flexibility",
    kpis: ["Container adoption %", "Technical debt index", "Legacy retirement %"],
    maturityPct: 55,
    timeframe: "12 – 30 Months",
    trend: trend(35, 5.5),
    panel: {
      id: "modernization", kicker: "Phase 5", title: "Modernization",
      summary: "Continuously evolve architecture, rationalize the estate, and reduce debt — never a one-time program.",
      sections: [
        { heading: "Objective", body: "Treat modernization as an always-on capability, prioritized by business value and risk — not a multi-year project." },
        { heading: "Capabilities Built", body: ["Containerization", "Application rationalization", "Refactoring at the seams", "Cloud migration", "Technical debt reduction"] },
        { heading: "Observable Behaviors", body: ["Legacy footprint trends down quarter over quarter", "Architecture decisions are recorded and revisited", "Debt is visible and prioritized"] },
        { heading: "Common Anti-Patterns", body: ["Big-bang re-platform programs", "Modernization without rationalization", "Lift-and-shift without architecture change"] },
        { heading: "Example Workflows", body: ["Quarterly rationalization review", "Strangler-fig refactoring of monoliths", "Workload-to-target-pattern mapping"] },
        { heading: "Example Team Structure", body: ["Modernization tiger teams partnering with owners", "Architecture review board as enabler, not gate", "Funding tied to rationalization outcomes"] },
        { heading: "KPIs", body: ["Container adoption %", "Legacy asset %", "Technical debt index", "Modernization velocity"] },
        { heading: "SLAs", body: ["Architecture review turnaround", "Migration cutover targets", "Rollback windows"] },
        { heading: "Modernization Opportunities", body: ["Containerize remaining tier-1 workloads", "Retire duplicate applications", "Move to managed services where ROI is clear"] },
        { heading: "AI Opportunities", body: ["Codebase analysis to identify refactor candidates", "Workload similarity clustering", "Migration-pattern recommendation"] },
        { heading: "Executive Talking Point", body: "\"Modernization is a continuous capability.\"" },
        { heading: "Industry Benchmarks", body: ["Container adoption >70% tier-1", "Legacy retirement velocity > 15%/yr", "Debt index trending down 4 consecutive quarters"] },
        { heading: "Related Capabilities", body: ["Platform Engineering", "Automation & AI", "Continuous Optimization"] },
      ],
    },
  },
  {
    id: "automation",
    num: 6,
    title: "Automation & AI",
    focus: "Automate to reduce toil and accelerate delivery",
    Icon: Bot,
    color: "orange",
    capabilities: ["Automated remediation", "Automated provisioning", "Automated validation", "AI/ML for operations", "Agentic operations"],
    outcome: "Scale with less effort",
    kpis: ["Automation coverage %", "Toil reduction %", "Automated recovery %"],
    maturityPct: 65,
    timeframe: "18 – 36 Months",
    trend: trend(30, 7),
    panel: {
      id: "automation", kicker: "Phase 6", title: "Automation & AI",
      summary: "Humans focus on decisions; systems handle repetition. Automation compounds once standardization and ownership are in place.",
      sections: [
        { heading: "Objective", body: "Eliminate toil and accelerate delivery through automation, ML, and agentic operations layered on a standardized, owned, platform-based foundation." },
        { heading: "Capabilities Built", body: ["Automated recovery & remediation", "Automated provisioning", "Automated validation & testing", "Self-healing services", "Agentic operations workflows"] },
        { heading: "Observable Behaviors", body: ["Most recoveries happen without human action", "Toil is measured and shrinking", "Engineers spend time on design, not repetition"] },
        { heading: "Common Anti-Patterns", body: ["Automating chaos instead of removing it", "Automation owned by no one", "ML in operations without a feedback loop"] },
        { heading: "Example Workflows", body: ["Auto-remediation triggered by SLO burn", "Policy-driven auto-provisioning", "Agentic triage proposing remediation"] },
        { heading: "Example Team Structure", body: ["Automation guild across SRE & platform", "Owners for each automation artifact", "Model lifecycle ownership for ops ML"] },
        { heading: "KPIs", body: ["Automation coverage %", "Toil reduction %", "Automated recovery %", "Manual intervention count"] },
        { heading: "SLAs", body: ["Automation availability", "Remediation success rate", "Time to automated rollback"] },
        { heading: "Modernization Opportunities", body: ["Replace runbooks with code", "Convert ticket-driven ops to event-driven", "Add agents to the operating model"] },
        { heading: "AI Opportunities", body: ["Agentic incident triage", "Predictive capacity & failure detection", "AI-generated test & validation"] },
        { heading: "Executive Talking Point", body: "\"Humans should focus on decisions, not repetition.\"" },
        { heading: "Industry Benchmarks", body: ["Automation coverage >65% tier-1", "Toil < 25% of SRE time", "Automated recovery > 60% of eligible incidents"] },
        { heading: "Related Capabilities", body: ["Standardization", "Ownership & Collaboration", "Continuous Optimization"] },
      ],
    },
  },
  {
    id: "optimization",
    num: 7,
    title: "Continuous Optimization",
    focus: "Optimize outcomes and evolve continuously",
    Icon: TrendingUp,
    color: "rose",
    capabilities: ["FinOps & unit economics", "Reliability reviews", "Tech investment decisions", "Acquisition integration", "Continuous learning"],
    outcome: "Continuous evolution",
    kpis: ["Cost per service", "Error budget health", "Modernization velocity", "Acquisition readiness"],
    maturityPct: 60,
    timeframe: "24+ Months",
    trend: trend(28, 7.5),
    panel: {
      id: "optimization", kicker: "Phase 7", title: "Continuous Optimization",
      summary: "Reliability, cost, and capability are continuously tuned. The operating model itself is a product that evolves.",
      sections: [
        { heading: "Objective", body: "Treat the operating model as a living product. Optimize cost, reliability, and capability continuously; absorb new business and acquisitions without disruption." },
        { heading: "Capabilities Built", body: ["Reliability reviews", "FinOps & unit economics", "Acquisition integration & onboarding", "Continuous improvement loops", "Technology investment governance"] },
        { heading: "Observable Behaviors", body: ["Quarterly reliability reviews shape investment", "Unit economics inform architecture", "Acquisitions are absorbed without bespoke programs"] },
        { heading: "Common Anti-Patterns", body: ["Optimization treated as a finance-only motion", "Reliability reviews without funded actions", "Acquisitions re-platformed by exception"] },
        { heading: "Example Workflows", body: ["Quarterly business review of reliability + cost", "Acquisition onboarding via standard runway", "Investment decisions tied to outcome data"] },
        { heading: "Example Team Structure", body: ["FinOps function partnering with owners", "M&A operational readiness team", "Reliability council across product lines"] },
        { heading: "KPIs", body: ["Cost per service / per transaction", "Error budget health", "Modernization velocity", "Acquisition time-to-operational-readiness"] },
        { heading: "SLAs", body: ["Reliability review cadence", "Investment decision SLAs", "Acquisition onboarding SLAs"] },
        { heading: "Modernization Opportunities", body: ["Continuous rationalization", "Cross-portfolio platform leverage", "Standardized M&A integration runway"] },
        { heading: "AI Opportunities", body: ["Cost anomaly detection", "Investment scenario modeling", "Acquisition diligence automation"] },
        { heading: "Executive Talking Point", body: "\"Optimization never ends.\"" },
        { heading: "Industry Benchmarks", body: ["Cost-per-transaction trending down YoY", "Acquisition onboarding < 2 quarters", ">85% error budget compliance"] },
        { heading: "Related Capabilities", body: ["Ownership & Collaboration", "Modernization", "Automation & AI"] },
      ],
    },
  },
];

/* ------------------------------- Impacts -------------------------------- */

type Impact = {
  id: string;
  title: string;
  delta: string;
  direction: "up" | "down";
  sub: string;
  Icon: typeof Shield;
  color: PhaseKey;
  panel: DetailPanel;
};

const IMPACTS: Impact[] = [
  {
    id: "imp-rel", title: "Reliability", delta: "↑ 40–60%", direction: "up",
    sub: "Increase in availability", Icon: ShieldCheck, color: "teal",
    panel: {
      id: "imp-rel", title: "Reliability Improvement", summary: "Sustained availability uplift driven by SLOs, error budgets, and platform-grade tooling.",
      sections: [
        { heading: "Availability Trends", body: ["Tier-1 99.95%+", "Tier-2 99.9%+", "Customer-impacting minutes ↓ 60–80%"] },
        { heading: "Incident Reduction Trends", body: ["Sev1 volume ↓ 60–80%", "Repeat incident rate < 5%", "MTTR within target on >90% incidents"] },
        { heading: "Error Budget Performance", body: ["Budgets honored on >85% services", "Burn-rate alerts drive release gating", "Quarterly review of budget vs. velocity"] },
      ],
    },
  },
  {
    id: "imp-vel", title: "Velocity", delta: "↑ 2–5x", direction: "up",
    sub: "Faster delivery", Icon: Rocket, color: "blue",
    panel: {
      id: "imp-vel", title: "Delivery Velocity", summary: "Throughput and quality move together once platform and ownership are in place.",
      sections: [
        { heading: "Lead Time For Change", body: ["Hours, not weeks", "Predictable per service tier"] },
        { heading: "Deployment Frequency", body: ["Multiple deploys per day on tier-1", "Weekly cadence on legacy estates"] },
        { heading: "Release Success Rate", body: ["Change failure rate < 5%", "Automated rollback > 90%", "Progressive delivery default"] },
      ],
    },
  },
  {
    id: "imp-cost", title: "Cost Efficiency", delta: "↓ 20–40%", direction: "down",
    sub: "Lower operating costs", Icon: DollarSign, color: "amber",
    panel: {
      id: "imp-cost", title: "Cost Efficiency", summary: "FinOps discipline plus platform leverage compounds savings without sacrificing reliability.",
      sections: [
        { heading: "FinOps Dashboard", body: ["Unit economics per service", "Anomaly detection on spend", "Showback / chargeback by owner"] },
        { heading: "Cloud Efficiency", body: ["Right-sized workloads", "Commitment & savings plan coverage", "Idle resource reclamation"] },
        { heading: "Service Costing", body: ["Cost per transaction", "Cost per customer", "Cost per critical journey"] },
      ],
    },
  },
  {
    id: "imp-cx", title: "Customer Experience", delta: "↑ 30–50%", direction: "up",
    sub: "Improved satisfaction", Icon: UserCircle2, color: "green",
    panel: {
      id: "imp-cx", title: "Customer Experience", summary: "Reliability translates to customer-perceived quality across critical journeys.",
      sections: [
        { heading: "Customer Journey Reliability", body: ["SLOs on every critical journey", "Real-user monitoring tied to journeys", "Journey-level error budgets"] },
        { heading: "Service Availability", body: ["External availability mirrors internal SLOs", "Status communications tied to error budgets"] },
        { heading: "Experience Metrics", body: ["NPS / CSAT uplift", "Support volume per customer down", "Journey completion rate up"] },
      ],
    },
  },
  {
    id: "imp-mna", title: "Acquisition Readiness", delta: "↑ 50–70%", direction: "up",
    sub: "Faster integration", Icon: Building2, color: "violet",
    panel: {
      id: "imp-mna", title: "Acquisition Readiness", summary: "Standardization and platform leverage shorten the time from close to operational readiness.",
      sections: [
        { heading: "Integration Readiness", body: ["Standard onboarding runway", "Inherited security & observability", "Identity and access patterns reused"] },
        { heading: "Standardization Coverage", body: ["Golden paths available to acquired teams", "Platform components consumable on day one"] },
        { heading: "Time To Operational Readiness", body: ["Reduced quarter-over-quarter", "Tracked as an executive KPI", "Tied to deal-thesis outcomes"] },
      ],
    },
  },
];

/* ------------------------------- Enablers ------------------------------- */

const ENABLERS: { id: string; Icon: typeof Shield; title: string; panel: DetailPanel }[] = [
  { id: "en-leader", Icon: UsersRound, title: "Leadership Commitment",
    panel: { id: "en-leader", title: "Leadership Commitment", summary: "Reliability transformation requires visible, sustained executive sponsorship.",
      sections: [
        { heading: "What Good Looks Like", body: ["Funded as a multi-year capability", "Reliability is on the executive scorecard", "Tradeoffs are made in the open"] },
        { heading: "Anti-Patterns", body: ["Transformation as a project, not a capability", "Sponsorship that fades after launch", "Reliability as an IT-only conversation"] },
      ],
    } },
  { id: "en-data", Icon: BarChart3, title: "Data-Driven Decisions",
    panel: { id: "en-data", title: "Data-Driven Decisions", summary: "Decisions are grounded in telemetry, SLOs, and unit economics.",
      sections: [
        { heading: "Signals", body: ["SLO compliance", "Error budget burn", "Unit cost per service", "Toil ratio"] },
        { heading: "Decision Forums", body: ["Quarterly reliability review", "Architecture decision records", "Investment governance"] },
      ],
    } },
  { id: "en-culture", Icon: ShieldCheck, title: "Strong Culture of Reliability",
    panel: { id: "en-culture", title: "Strong Culture of Reliability", summary: "Reliability is a shared value, not a specialist responsibility.",
      sections: [
        { heading: "Behaviors", body: ["Blameless post-incident learning", "SLO-driven prioritization", "Reliability included in definition of done"] },
        { heading: "Rituals", body: ["Weekly reliability standups", "Quarterly service reviews", "Game days and chaos exercises"] },
      ],
    } },
  { id: "en-change", Icon: RefreshCcw, title: "Effective Change Management",
    panel: { id: "en-change", title: "Effective Change Management", summary: "Change becomes safer as standardization, ownership, and automation mature.",
      sections: [
        { heading: "Capabilities", body: ["Progressive delivery", "Automated rollback", "Change risk scoring"] },
        { heading: "Outcomes", body: ["Change failure rate < 5%", "Lead time in hours", "Most changes require zero CAB"] },
      ],
    } },
  { id: "en-sec", Icon: Lock, title: "Security by Design",
    panel: { id: "en-sec", title: "Security by Design", summary: "Security is inherited from the platform, not bolted on per service.",
      sections: [
        { heading: "Patterns", body: ["Identity, secrets, and policy as platform APIs", "Pipeline-enforced controls", "Continuous compliance evidence"] },
        { heading: "Outcomes", body: ["Audit lead time reduced", "Fewer security exceptions", "Security incidents trend down"] },
      ],
    } },
  { id: "en-finops", Icon: DollarSign, title: "FinOps Discipline",
    panel: { id: "en-finops", title: "FinOps Discipline", summary: "Cost is owned where the workload is owned — and visible at the unit level.",
      sections: [
        { heading: "Practices", body: ["Unit economics per service", "Showback / chargeback", "Anomaly detection on spend"] },
        { heading: "Outcomes", body: ["20–40% cost reduction sustained", "Cost-per-transaction trending down", "Tradeoffs made with full visibility"] },
      ],
    } },
];

/* ------------------------------ Characteristics ------------------------- */

const CHARACTERISTICS: { id: string; Icon: typeof Shield; title: string; bullets: string[]; panel: DetailPanel }[] = [
  { id: "ch-obs", Icon: Eye, title: "Unified Observability",
    bullets: ["Full-stack visibility", "Correlated insights", "Actionable alerts"],
    panel: { id: "ch-obs", title: "Unified Observability", summary: "Signals from infrastructure, applications, and experience flow into a single, correlated view.",
      sections: [
        { heading: "What Good Looks Like", body: ["Single source of truth for golden signals", "Telemetry correlated across layers", "Alerts tied to SLOs, not thresholds"] },
        { heading: "Example Dashboards", body: ["Critical journey health", "Service SLO compliance", "Error budget burn"] },
        { heading: "Example KPIs", body: ["Mean time to detect", "Alert-to-incident ratio", "SLO compliance %"] },
      ],
    } },
  { id: "ch-teams", Icon: UsersRound, title: "Engaged Teams",
    bullets: ["Ownership mindset", "Cross-functional collaboration", "Continuous learning"],
    panel: { id: "ch-teams", title: "Engaged Teams", summary: "Teams own outcomes, collaborate across functions, and learn continuously.",
      sections: [
        { heading: "Collaboration", body: ["Persistent stream-aligned teams", "Platform team as enabler", "Communities of practice"] },
        { heading: "Ownership", body: ["Service owners on-call for their services", "SLOs as a team contract", "Error budgets as a shared currency"] },
        { heading: "Cross-Functional Delivery", body: ["Product, engineering, ops, security in one team", "Shared backlog for reliability", "Joint outcome metrics"] },
      ],
    } },
  { id: "ch-flow", Icon: Workflow, title: "Efficient Workflows",
    bullets: ["Fewer handoffs", "Automated processes", "Faster resolutions"],
    panel: { id: "ch-flow", title: "Efficient Workflows", summary: "Work flows through the system with fewer handoffs and less toil.",
      sections: [
        { heading: "Reduced Handoffs", body: ["Service owners triage directly", "Platform consumed via APIs", "Cross-functional teams remove queues"] },
        { heading: "Faster Resolution", body: ["Auto-remediation for known issues", "Runbooks executable, not narrative", "Incident commanders empowered"] },
        { heading: "Reduced Toil", body: ["Toil tracked as a KPI", "Engineering capacity reclaimed", "Repetitive work converted to code"] },
      ],
    } },
  { id: "ch-rel", Icon: ShieldAlert, title: "Reliability Built-In",
    bullets: ["SLOs everywhere", "Error budgets managed", "Proactive not reactive"],
    panel: { id: "ch-rel", title: "Reliability Built-In", summary: "Reliability is a property of design and operations — not an after-the-fact fix.",
      sections: [
        { heading: "SLOs", body: ["Defined per critical journey", "Tied to customer experience", "Reviewed quarterly"] },
        { heading: "Error Budgets", body: ["Burn-rate alerts gate releases", "Budgets shape investment", "Honored as a contract"] },
        { heading: "Reliability Reviews", body: ["Quarterly business review of reliability", "Cross-team service reviews", "Funded follow-through on actions"] },
      ],
    } },
  { id: "ch-cust", Icon: Star, title: "Customer Outcomes",
    bullets: ["Experience measured", "Business metrics linked", "Value delivered"],
    panel: { id: "ch-cust", title: "Customer Outcomes", summary: "Operational metrics are connected to the outcomes customers and the business actually experience.",
      sections: [
        { heading: "Experience Metrics", body: ["Critical journey completion rate", "Real-user monitoring", "NPS / CSAT correlated with reliability"] },
        { heading: "Business Outcomes", body: ["Revenue-protecting journeys monitored end-to-end", "Service availability tied to business KPIs", "Reliability framed in business terms"] },
        { heading: "Service Availability", body: ["External availability mirrors internal SLOs", "Predictable, communicated, trusted"] },
      ],
    } },
  { id: "ch-learn", Icon: BookOpen, title: "Continuous Learning",
    bullets: ["Post-incident learning", "Knowledge captured", "Improvement ongoing"],
    panel: { id: "ch-learn", title: "Continuous Learning", summary: "Learning loops are designed into the operating model — not optional.",
      sections: [
        { heading: "Post-Incident Reviews", body: ["Blameless reviews on every Sev1", "Actions tracked to closure", "Themes inform investment"] },
        { heading: "Knowledge Management", body: ["Runbooks as code", "Searchable incident history", "Living architecture documentation"] },
        { heading: "Operational Excellence", body: ["Quarterly improvement targets", "Game days and chaos exercises", "Cross-team learning forums"] },
      ],
    } },
];

/* ----------------------------- Iterative panel -------------------------- */

const ITERATIVE_PANEL: DetailPanel = {
  id: "iterative", title: "The Journey Is Iterative",
  kicker: "Operating Model",
  summary: "Capabilities are built iteratively, with continuous feedback, learning, and value delivery. This is not a linear program.",
  sections: [
    { heading: "Measure Outcomes", body: ["Reliability, velocity, cost, experience, acquisition readiness", "Telemetry-grade, not slide-grade", "Reviewed at executive cadence"] },
    { heading: "Learn", body: ["Post-incident learning", "Quarterly reliability reviews", "Cross-team retrospectives"] },
    { heading: "Improve", body: ["Funded improvement actions", "Outcome-tied investment decisions", "Backlog informed by signals, not opinions"] },
    { heading: "Standardize", body: ["Promote what works to platform & golden paths", "Retire what doesn't", "Reduce variability deliberately"] },
    { heading: "Automate", body: ["Convert proven patterns to code", "Reduce toil systematically", "Add agents to the operating model"] },
    { heading: "Repeat", body: ["Feedback loops are designed in", "Continuous modernization", "The operating model is itself a product"] },
  ],
};

/* ---------------------------- Ultimate outcome -------------------------- */

const ULTIMATE_PANEL: DetailPanel = {
  id: "ultimate", title: "Modern Product Reliability Organization",
  kicker: "Ultimate Outcome",
  summary: "Resilient. Scalable. Efficient. Customer-Centric. Innovative.",
  sections: [
    { heading: "What It Looks Like", body: ["Reliability is a product capability, not an IT cost", "Ownership replaces ticket routing", "Platform engineering makes the right path the easy path", "Automation compounds on standardization"] },
    { heading: "What Changes For The Business", body: ["Higher availability with fewer incidents", "Faster, safer delivery", "Lower operating cost per transaction", "Faster acquisition integration"] },
    { heading: "What Changes For Customers", body: ["Critical journeys are reliable", "Experience metrics improve", "Trust compounds"] },
  ],
};

/* ------------------------------- Component ------------------------------ */

export default function TransformationJourney() {
  const [panel, setPanel] = useState<DetailPanel | null>(null);
  const [activePhase, setActivePhase] = useState<string>("ownership");

  const radarData = useMemo(
    () => PHASES.map((p) => ({ subject: p.title.split(" ")[0], score: p.maturityPct })),
    [],
  );

  const journeyTrend = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({
      x: `M${i + 1}`,
      reliability: Math.min(99.99, 97 + i * 0.12 + Math.sin(i / 3) * 0.2),
      cost: Math.max(60, 100 - i * 1.4 + Math.cos(i / 4) * 2),
      velocity: Math.min(100, 25 + i * 3 + Math.sin(i / 2) * 3),
    })),
    [],
  );

  const phase = PHASES.find((p) => p.id === activePhase) ?? PHASES[0];
  const phaseCol = PHASE_COLORS[phase.color];

  return (
    <AppShell>
      <div className="min-h-full bg-white text-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1600px] px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300">
                <Compass className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <span>Site Resilience Engineering</span>
                  <span>·</span>
                  <span>Capability Evolution Model</span>
                </div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  Production Reliability Transformation Journey
                </h1>
                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">
                  The capabilities organizations build as they evolve from traditional operations to modern
                  Product Reliability. Every phase, KPI, outcome, capability, and enabler is interactive — click
                  any element to open the executive detail panel.
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-1 text-right">
                <Badge variant="outline" className="border-slate-300 text-slate-600">Living operating model</Badge>
                <span className="text-[11px] text-slate-500">7 phases · 5 impact bands · 6 enablers · 6 characteristics</span>
              </div>
            </div>

            {/* Not linear strip */}
            <button
              onClick={() => setPanel(ITERATIVE_PANEL)}
              className="mt-5 flex w-full items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-400 hover:bg-slate-100"
            >
              <Users2 className="mt-0.5 h-4 w-4 text-slate-600" />
              <div className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">This is not a linear project.</span>
                <span className="ml-3 text-slate-600">
                  Capabilities are built <span className="font-medium text-slate-900">iteratively</span> with
                  continuous feedback, learning, and value delivery.
                </span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="mx-auto max-w-[1600px] px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Phases rail */}
            <section className="col-span-12 xl:col-span-9">
              <SectionTitle eyebrow="The 7 Phases" title="Capabilities organizations build as they evolve" />

              {/* Horizontal phase strip */}
              <div className="mt-4 overflow-x-auto pb-2">
                <ol className="flex min-w-full items-stretch gap-3">
                  {PHASES.map((p, idx) => {
                    const col = PHASE_COLORS[p.color];
                    const active = p.id === activePhase;
                    return (
                      <li key={p.id} className="flex min-w-[200px] flex-1 items-stretch">
                        <button
                          onClick={() => setActivePhase(p.id)}
                          className={`group relative w-full overflow-hidden rounded-lg border bg-white text-left transition hover:shadow-sm ${
                            active ? "border-slate-900 shadow-sm" : "border-slate-200"
                          }`}
                        >
                          <div className="h-1 w-full" style={{ backgroundColor: col.ring }} />
                          <div className={`px-4 pt-3 ${active ? col.tint : ""}`}>
                            <div className="flex items-center justify-between">
                              <div
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white"
                                style={{ backgroundColor: col.ring }}
                              >
                                {p.num}
                              </div>
                              <p.Icon className="h-4 w-4" style={{ color: col.ring }} />
                            </div>
                            <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: col.ring }}>
                              Phase {p.num}
                            </div>
                            <div className="text-sm font-semibold leading-snug text-slate-900">{p.title}</div>
                            <div className="mt-1 text-[11px] leading-snug text-slate-600">{p.focus}</div>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
                            <span>{p.timeframe}</span>
                            <span className="font-medium" style={{ color: col.ring }}>{p.maturityPct}%</span>
                          </div>
                        </button>
                        {idx < PHASES.length - 1 && (
                          <div className="flex items-center px-1 text-slate-300">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Active Phase Detail */}
              <article className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="h-1 w-full" style={{ backgroundColor: phaseCol.ring }} />
                <div className={`grid grid-cols-12 gap-0 ${phaseCol.tint}`}>
                  <div className="col-span-12 px-6 py-5 md:col-span-8">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: phaseCol.ring }}
                      >
                        {phase.num}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: phaseCol.ring }}>
                          Phase {phase.num} · {phase.timeframe}
                        </div>
                        <div className="text-xl font-semibold text-slate-900">{phase.title}</div>
                      </div>
                      <button
                        onClick={() => setPanel(phase.panel)}
                        className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-slate-900"
                      >
                        Open executive detail
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{phase.focus}</p>
                  </div>
                  <div className="col-span-12 border-t border-white/60 px-6 py-5 md:col-span-4 md:border-l md:border-t-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Phase Outcome</div>
                    <div className="mt-1 text-base font-semibold" style={{ color: phaseCol.ring }}>{phase.outcome}</div>
                    <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Phase Maturity</div>
                    <div className="mt-1 flex items-center gap-3">
                      <Progress value={phase.maturityPct} className="h-1.5 bg-white" />
                      <span className="text-[12px] font-medium text-slate-700">{phase.maturityPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-0">
                  {/* Capabilities */}
                  <div className="col-span-12 border-t border-slate-200 px-6 py-5 md:col-span-4 md:border-r">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Key Capabilities Built</div>
                    <ul className="mt-3 space-y-2">
                      {phase.capabilities.map((c) => (
                        <li key={c}>
                          <button
                            onClick={() => setPanel(phase.panel)}
                            className="group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-slate-700 transition hover:bg-slate-50"
                          >
                            <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: phaseCol.ring }} />
                            <span className="flex-1">{c}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* KPIs */}
                  <div className="col-span-12 border-t border-slate-200 px-6 py-5 md:col-span-4 md:border-r">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Example KPIs</div>
                    <ul className="mt-3 space-y-2">
                      {phase.kpis.map((k) => (
                        <li key={k}>
                          <button
                            onClick={() => setPanel(phase.panel)}
                            className="group flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-[13px] text-slate-800 transition hover:border-slate-400"
                          >
                            <span>{k}</span>
                            <Target className="h-3.5 w-3.5" style={{ color: phaseCol.ring }} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trend chart */}
                  <div className="col-span-12 border-t border-slate-200 px-6 py-5 md:col-span-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Capability Build Trend</div>
                      <button
                        onClick={() => setPanel(phase.panel)}
                        className="text-[11px] text-slate-500 hover:text-slate-900"
                      >
                        Inspect
                      </button>
                    </div>
                    <div className="mt-2 h-32">
                      <ResponsiveContainer>
                        <AreaChart data={phase.trend}>
                          <defs>
                            <linearGradient id={`g-${phase.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={phaseCol.ring} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={phaseCol.ring} stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <Area dataKey="v" type="monotone" stroke={phaseCol.ring} strokeWidth={2} fill={`url(#g-${phase.id})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </article>

              {/* Journey-wide trend */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Cross-Phase Outcomes
                    </div>
                    <div className="text-base font-semibold text-slate-900">Reliability, cost, and velocity over 24 months</div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Reliability</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Velocity</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Cost index</span>
                  </div>
                </div>
                <div className="mt-3 h-56">
                  <ResponsiveContainer>
                    <LineChart data={journeyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="x" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderColor: "#e2e8f0" }} />
                      <Line type="monotone" dataKey="reliability" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Right rail */}
            <aside className="col-span-12 space-y-6 xl:col-span-3">
              {/* Ultimate outcome */}
              <button
                onClick={() => setPanel(ULTIMATE_PANEL)}
                className="block w-full overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 text-left transition hover:border-emerald-400"
              >
                <div className="px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <Trophy className="h-4 w-4" />
                    Ultimate Outcome
                  </div>
                  <div className="mt-2 text-lg font-semibold leading-tight text-slate-900">
                    Modern Product Reliability Organization
                  </div>
                  <div className="mt-2 text-[12px] leading-snug text-slate-700">
                    Resilient · Scalable · Efficient<br />Customer-Centric · Innovative
                  </div>
                </div>
              </button>

              {/* Business impact */}
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Business Impact</div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {IMPACTS.map((i) => {
                    const col = PHASE_COLORS[i.color];
                    return (
                      <li key={i.id}>
                        <button
                          onClick={() => setPanel(i.panel)}
                          className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: col.soft }}
                          >
                            <i.Icon className="h-4 w-4" style={{ color: col.ring }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="text-[12px] font-semibold text-slate-900">{i.title}</div>
                              <div className="text-[12px] font-semibold" style={{ color: col.ring }}>{i.delta}</div>
                            </div>
                            <div className="text-[11px] leading-snug text-slate-600">{i.sub}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Iterative panel */}
              <button
                onClick={() => setPanel(ITERATIVE_PANEL)}
                className="block w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:border-slate-400"
              >
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">The Journey Is Iterative</div>
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 py-4 text-[12px] text-slate-700">
                  {["Measure Outcomes", "Learn & Improve", "Standardize", "Automate", "Gather Feedback", "Implement Changes"].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <RefreshCcw className="h-3.5 w-3.5 text-teal-600" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </button>

              {/* Maturity radar */}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Maturity Profile</div>
                <div className="mt-2 h-48">
                  <ResponsiveContainer>
                    <RadarChart data={radarData} outerRadius="78%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} />
                      <Radar dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.12} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </aside>
          </div>

          {/* Enablers */}
          <section className="mt-10">
            <SectionTitle eyebrow="Key Enablers" title="Foundation throughout the journey" />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {ENABLERS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setPanel(e.panel)}
                  className="group rounded-lg border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-400 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <e.Icon className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">{e.title}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Characteristics dark band */}
          <section className="mt-10 overflow-hidden rounded-xl border border-slate-900 bg-slate-900 text-slate-50">
            <div className="border-b border-slate-800 px-6 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Characteristics of a Modern Product Reliability Organization
              </div>
              <div className="text-base font-semibold text-slate-50">What you observe when the model is working</div>
            </div>
            <div className="grid grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {CHARACTERISTICS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPanel(c.panel)}
                  className="group flex flex-col rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-4 text-left transition hover:bg-slate-800"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
                    <c.Icon className="h-4 w-4 text-slate-100" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-50">{c.title}</div>
                  <ul className="mt-2 space-y-1">
                    {c.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[11.5px] text-slate-300">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </section>

          {/* Footer guidance */}
          <section className="mt-8 flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <GitBranch className="mt-0.5 h-4 w-4 text-slate-600" />
            <div className="text-sm text-slate-700">
              Organizations do not need to do everything at once.{" "}
              <span className="font-medium text-slate-900">
                Start where the pain is greatest, build momentum, and evolve continuously.
              </span>
            </div>
          </section>
        </main>

        {/* Detail Sheet */}
        <Sheet open={!!panel} onOpenChange={(o) => !o && setPanel(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto bg-white sm:max-w-xl lg:max-w-2xl">
            {panel && (
              <>
                <SheetHeader className="text-left">
                  {panel.kicker && (
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {panel.kicker}
                    </div>
                  )}
                  <SheetTitle className="text-2xl text-slate-900">{panel.title}</SheetTitle>
                  <SheetDescription className="text-slate-600">{panel.summary}</SheetDescription>
                </SheetHeader>
                <Separator className="my-5" />
                <div className="space-y-6 pb-10">
                  {panel.sections.map((s, idx) => (
                    <div key={idx}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {s.heading}
                      </div>
                      <div className="mt-2">
                        {Array.isArray(s.body) ? (
                          <ul className="space-y-1.5 text-sm text-slate-700">
                            {s.body.map((b, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm leading-relaxed text-slate-700">{s.body}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ---------------------------- Sub-components ---------------------------- */

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 pb-2">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</div>
        <div className="text-base font-semibold text-slate-900">{title}</div>
      </div>
      <div className="text-[11px] text-slate-400">Click any element to inspect</div>
    </div>
  );
}
