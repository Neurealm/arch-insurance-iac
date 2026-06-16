import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Gauge, Users, Activity, Wrench, AlertTriangle, RefreshCw, Target, Eye,
  Cpu, ClipboardList, BarChart3, ChevronRight, ArrowRight, ShieldCheck,
  Sparkles, Clock, TrendingUp, Building2, BookOpen, CheckCircle2, XCircle,
  Lightbulb, Code2, Heart, Workflow, Layers, ArrowLeft, Bell, Boxes,
  type LucideIcon,
} from "lucide-react";

/* ===================== Types & Drawer Data Model ===================== */

type Tone = "emerald" | "sky" | "violet" | "amber" | "rose" | "teal" | "slate";

type DrawerContent = {
  id: string;
  title: string;
  kicker: string;
  icon: LucideIcon;
  tone: Tone;
  meaning: {
    plain: string;
    whyExists: string;
    whyGoogle: string;
    misconceptions: string[];
  };
  operational: {
    intro: string;
    examples: { org: string; story: string }[];
  };
  metrics?: {
    definition: string;
    formula?: string;
    measured: string;
    targets: { label: string; value: string; status?: "good" | "warn" | "risk" }[];
  };
  patterns: { good: string; better: string; best: string };
  mistakes: { anti: string; consequence: string }[];
  hhax: {
    headline: string;
    bullets: { area: string; detail: string }[];
  };
};

const TONE: Record<Tone, { bg: string; text: string; ring: string; chip: string; border: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-300", chip: "bg-emerald-100 text-emerald-800", border: "border-emerald-200" },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-300",     chip: "bg-sky-100 text-sky-800",         border: "border-sky-200" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-300",  chip: "bg-violet-100 text-violet-800",   border: "border-violet-200" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-300",   chip: "bg-amber-100 text-amber-800",     border: "border-amber-200" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-300",    chip: "bg-rose-100 text-rose-800",       border: "border-rose-200" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    ring: "ring-teal-300",    chip: "bg-teal-100 text-teal-800",       border: "border-teal-200" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-700",   ring: "ring-slate-300",   chip: "bg-slate-100 text-slate-800",     border: "border-slate-200" },
};

/* ===================== Drawer Library ===================== */

const makeDrawer = (d: DrawerContent) => d;

const D: Record<string, DrawerContent> = {
  /* --- Section 1: What is SRE --- */
  serviceOwnership: makeDrawer({
    id: "serviceOwnership",
    title: "Service Ownership",
    kicker: "Core SRE Practice",
    icon: Users, tone: "emerald",
    meaning: {
      plain: "Every production service has a named team that is accountable for its reliability, performance, cost, and customer experience — end to end.",
      whyExists: "Ownership eliminates the gray zones between Dev, Ops, and Infra where incidents linger and accountability evaporates.",
      whyGoogle: "Google found that systems run reliably only when engineers carry the pager for the code they ship. Ownership creates a tight feedback loop between design choices and operational pain.",
      misconceptions: [
        "Ownership does not mean a single hero engineer — it means a team with on-call rotation.",
        "Ownership is not just on-call. It includes SLOs, capacity, cost, and reliability roadmap.",
        "Ownership does not replace platform teams. Platforms enable owners, they don't absorb the responsibility.",
      ],
    },
    operational: {
      intro: "How real engineering organizations practice service ownership today.",
      examples: [
        { org: "Google", story: "Every service has an owning SWE team. SRE teams partner only when a service meets reliability and engineering maturity bars." },
        { org: "Netflix", story: "'You build it, you run it.' Developers own services in production, with paved-road platforms reducing the operational tax." },
        { org: "Amazon (AWS)", story: "Two-pizza teams own services through their full lifecycle, including pager duty and customer escalations." },
        { org: "Datadog", story: "Each service has an owner declared in the service catalog. Alerts, SLOs, and on-call route from that single source of truth." },
      ],
    },
    patterns: {
      good: "Service catalog lists every Tier-1 service with a named owning team and on-call rotation.",
      better: "Owners publish SLOs, error budgets, and a reliability roadmap; on-call is shared across the team, not one person.",
      best: "Ownership extends to cost, security posture, customer impact, and modernization decisions — measured as part of team health.",
    },
    mistakes: [
      { anti: "Ops owns reliability for code Dev wrote", consequence: "No feedback loop. Same incidents recur. Toil grows quarter over quarter." },
      { anti: "One hero engineer named as 'owner'", consequence: "Single point of failure. Burnout. Knowledge leaves when they do." },
      { anti: "Ownership exists on a wiki but not in tooling", consequence: "Alerts route to the wrong team. Incidents go orphan. MTTR climbs." },
    ],
    hhax: {
      headline: "At HHAX, service ownership directly addresses the operational interruption and tribal-knowledge concerns surfaced in discovery.",
      bullets: [
        { area: "Caregiver Mobile App", detail: "A named team owns mobile reliability — clock-in/clock-out, EVV, offline sync — with SLOs visible to product leadership." },
        { area: "Claims Processing", detail: "Claims engine has a single owning team accountable for throughput, error rate, and payer SLAs." },
        { area: "Payroll Execution", detail: "Weekly payroll runs have an owning team with a published reliability target and clear escalation path." },
        { area: "Acquired Platforms", detail: "Each acquired platform receives a named owner during integration — preventing the 'no one owns it' pattern across the portfolio." },
      ],
    },
  }),

  reliabilityTargets: makeDrawer({
    id: "reliabilityTargets",
    title: "Reliability Targets (SLOs)",
    kicker: "Core SRE Practice",
    icon: Target, tone: "sky",
    meaning: {
      plain: "A Service Level Objective is a measurable reliability target — usually expressed as a percentage over a rolling window — that defines 'reliable enough' for users.",
      whyExists: "Without an explicit target, every team optimizes for a different definition of reliable. SLOs make reliability a negotiated, data-driven decision.",
      whyGoogle: "Google realized 100% is the wrong target. Pursuing it slows feature velocity without improving user-perceived reliability. SLOs make the right level of reliability explicit.",
      misconceptions: [
        "SLOs are not SLAs. SLAs are contractual; SLOs are internal targets, intentionally stricter.",
        "SLOs do not need to be 99.99%. The right target is what users actually need.",
        "An SLO without an error budget policy is just a number on a dashboard.",
      ],
    },
    operational: {
      intro: "How engineering organizations operationalize SLOs.",
      examples: [
        { org: "Google", story: "Each user-facing service has SLOs reviewed quarterly. Burn-rate alerts page on-call only when budget is at risk." },
        { org: "LinkedIn", story: "SLOs are first-class objects in the service catalog. Release pipelines check error budget before deploying." },
        { org: "Healthcare SaaS", story: "Patient-facing workflows carry tighter SLOs than internal tools; clinical workflows have explicit latency SLOs measured by user journey." },
      ],
    },
    metrics: {
      definition: "Percentage of valid events that meet a defined Service Level Indicator over a rolling window.",
      formula: "SLO = (Good Events / Valid Events) × 100, measured over 28-day rolling window",
      measured: "From real user telemetry — synthetic monitoring, RUM, or backend success ratios — not from infrastructure uptime.",
      targets: [
        { label: "Tier-1 customer journey", value: "99.95%", status: "good" },
        { label: "Tier-2 internal service", value: "99.5%", status: "good" },
        { label: "Current at-risk service", value: "99.82% (target 99.95%)", status: "warn" },
      ],
    },
    patterns: {
      good: "Each Tier-1 service has at least one availability and one latency SLO.",
      better: "SLOs are derived from user journeys, not infrastructure metrics. Burn-rate alerts replace threshold alerts.",
      best: "Error budget policy gates deploys, governs feature freezes, and informs reliability investment quarterly.",
    },
    mistakes: [
      { anti: "Setting every SLO to 99.99%", consequence: "Constant budget burn, perpetual feature freeze, team demoralized." },
      { anti: "SLOs measured from infrastructure uptime", consequence: "Dashboards green while customers complain. Loses credibility." },
      { anti: "SLOs exist but no error budget policy", consequence: "Reliability data ignored. Release decisions still made on gut feel." },
    ],
    hhax: {
      headline: "SLOs give HHAX a shared language for reliability across home care, claims, payroll, and mobile platforms.",
      bullets: [
        { area: "Caregiver Clock-In", detail: "A 99.95% availability SLO on clock-in (mobile + EVV) directly protects payroll accuracy and compliance." },
        { area: "Claims Submission", detail: "Latency SLO on claims submission ensures payer windows are never missed due to platform slowness." },
        { area: "Acquisition Integration", detail: "SLOs published during integration set expectations between HHAX teams and acquired engineering groups." },
      ],
    },
  }),

  measurement: makeDrawer({
    id: "measurement",
    title: "Measurement",
    kicker: "Core SRE Practice",
    icon: BarChart3, tone: "violet",
    meaning: {
      plain: "Reliability is measured from the user's perspective using telemetry, not from server health or component uptime.",
      whyExists: "Servers can be green while users are suffering. Customer-perceived reliability is the only measure that matters.",
      whyGoogle: "Google's SRE book centers on the four golden signals: latency, traffic, errors, saturation — measured at the user boundary.",
      misconceptions: [
        "CPU and memory dashboards are not reliability measurements.",
        "Uptime monitoring (ping checks) does not capture user experience.",
        "Logs without metrics make trend analysis impossible.",
      ],
    },
    operational: {
      intro: "Modern observability stacks instrument at the user boundary.",
      examples: [
        { org: "Datadog", story: "Customers instrument with traces and metrics tied to user journeys. Service maps surface dependency-driven latency." },
        { org: "Honeycomb", story: "High-cardinality events let teams ask new questions about production behavior without re-instrumenting." },
        { org: "Google", story: "Borgmon and successors collect metrics every 10s; SLO burn rate is the primary alerting signal." },
      ],
    },
    patterns: {
      good: "Every service emits the four golden signals (latency, traffic, errors, saturation).",
      better: "Telemetry is tied to user journeys; dashboards show SLO burn, not just raw metrics.",
      best: "Tracing, logs, and metrics are unified; alerts derive from SLO burn rate, not static thresholds.",
    },
    mistakes: [
      { anti: "Monitoring only infrastructure metrics", consequence: "User-impacting incidents discovered via support tickets." },
      { anti: "Threshold alerts on every metric", consequence: "Alert fatigue. Real signals lost in noise." },
    ],
    hhax: {
      headline: "Telemetry at the user journey level shows HHAX where caregivers, branches, and payers actually experience friction.",
      bullets: [
        { area: "Mobile App", detail: "Real-user monitoring on caregiver app shows latency by region, device, and network — exposing the real causes of clock-in failures." },
        { area: "Branch Workflows", detail: "Journey-level traces on scheduling and authorization workflows reveal where branch staff lose time." },
      ],
    },
  }),

  automation: makeDrawer({
    id: "automation",
    title: "Automation",
    kicker: "Core SRE Practice",
    icon: Cpu, tone: "amber",
    meaning: {
      plain: "Repetitive operational work (toil) is identified, measured, and eliminated through engineering — not absorbed by adding people.",
      whyExists: "Toil scales linearly with the platform. Without automation, operational cost grows faster than the business.",
      whyGoogle: "Google caps SRE toil at 50%. The other 50% is engineering — the work that prevents tomorrow's toil.",
      misconceptions: [
        "Automation is not just CI/CD. It includes remediation, provisioning, configuration, and incident response.",
        "Scripts in someone's home directory are not automation — they are toil with a wrapper.",
      ],
    },
    operational: {
      intro: "Engineering teams treat automation as a product, not a side project.",
      examples: [
        { org: "Netflix", story: "Spinnaker automates safe deploys across regions; chaos tooling automates resilience verification." },
        { org: "AWS", story: "Systems Manager automation runbooks remediate common operational events without human intervention." },
        { org: "Google", story: "Self-healing systems restart and reroute around failures before SREs are paged." },
      ],
    },
    patterns: {
      good: "Top 5 most frequent toil items are automated each quarter.",
      better: "Toil is measured continuously; automation backlog is part of the product backlog.",
      best: "Self-healing runbooks resolve common incidents before paging humans; on-call exists for novel failures only.",
    },
    mistakes: [
      { anti: "Hiring more ops engineers to keep up", consequence: "Cost grows linearly. Engineers leave. Reliability stagnates." },
      { anti: "Automation owned by one person", consequence: "Bus factor of one. Automation rots when they leave." },
    ],
    hhax: {
      headline: "Automation directly attacks the 'ticket factory' pattern observed across HHAX operations.",
      bullets: [
        { area: "Access Requests", detail: "Self-service access workflows replace ticket queues for caregiver and branch onboarding." },
        { area: "Remediation", detail: "Common incident patterns (failed sync, retry storms) self-heal without paging on-call." },
        { area: "Acquisition Onboarding", detail: "Automated platform-bootstrap scripts replace bespoke manual integration for each acquisition." },
      ],
    },
  }),

  incidentResponse: makeDrawer({
    id: "incidentResponse",
    title: "Incident Response",
    kicker: "Core SRE Practice",
    icon: AlertTriangle, tone: "rose",
    meaning: {
      plain: "Incidents are managed with defined roles, clear communication, and a structured response process — and learned from blamelessly afterward.",
      whyExists: "Ad-hoc incident response increases MTTR and burns out engineers. Structure makes recovery predictable and learning compounding.",
      whyGoogle: "Google's IMAG (Incident Management at Google) framework defines Incident Commander, Operations Lead, Communications Lead — adopted broadly across the industry.",
      misconceptions: [
        "An Incident Commander is not the most senior engineer — they're the coordinator.",
        "Blameless postmortems are not blame-free of accountability. They focus on systems, not individuals.",
      ],
    },
    operational: {
      intro: "Modern engineering organizations practice incident response as a craft.",
      examples: [
        { org: "PagerDuty / Atlassian", story: "Incident commander, scribe, comms lead activated within minutes; bridge opened; status page updated automatically." },
        { org: "Google", story: "Severity-based playbooks; postmortems published widely; action items tracked to completion." },
      ],
    },
    patterns: {
      good: "Severity levels defined; on-call rotations documented; every Sev-1/2 gets a postmortem.",
      better: "Incident roles practiced regularly; postmortem action items have owners and due dates and are tracked to completion.",
      best: "Game days and chaos exercises rehearse response; postmortems feed reliability backlog directly.",
    },
    mistakes: [
      { anti: "Same incident, different response each time", consequence: "MTTR unpredictable. Customers lose trust." },
      { anti: "Postmortems written, never read, never actioned", consequence: "Same incidents recur. Engineering loses faith in the process." },
      { anti: "Blame-driven postmortems", consequence: "Engineers hide information. Real root causes never surface." },
    ],
    hhax: {
      headline: "Structured incident response replaces the firefighting-and-tribal-knowledge pattern observed across HHAX teams.",
      bullets: [
        { area: "Payroll Week", detail: "Defined incident command during weekly payroll runs eliminates ad-hoc war rooms and CEO calls." },
        { area: "Mobile Outages", detail: "Customer comms scripted; status page automated; field operations notified within SLAs." },
        { area: "Acquired Platforms", detail: "Incident process applied consistently across all platforms, regardless of origin." },
      ],
    },
  }),

  continuousImprovement: makeDrawer({
    id: "continuousImprovement",
    title: "Continuous Improvement",
    kicker: "Core SRE Practice",
    icon: RefreshCw, tone: "teal",
    meaning: {
      plain: "Every incident, near-miss, and toil item feeds a reliability backlog that is worked alongside features — not after them.",
      whyExists: "Without explicit improvement work, reliability decays. Feature pressure always wins unless reliability is a first-class commitment.",
      whyGoogle: "Error budgets create the explicit tradeoff: when you're burning budget, reliability work takes priority over features.",
      misconceptions: [
        "Continuous improvement is not 'we'll get to it next quarter.' It is a tracked, measured commitment.",
        "It is not maturity-model checkboxes — it's measurable reliability improvement quarter over quarter.",
      ],
    },
    operational: {
      intro: "High-performing teams build continuous improvement into their cadence.",
      examples: [
        { org: "Etsy", story: "Postmortem action items tracked publicly; teams measured on completion rate." },
        { org: "Google", story: "Reliability work share of backlog reviewed quarterly; SRE/SWE engagement renegotiated based on data." },
      ],
    },
    patterns: {
      good: "Postmortem action items tracked to completion.",
      better: "Reliability work is part of every sprint; backlog priority informed by error budget burn.",
      best: "Quarterly reliability reviews trigger investment shifts; retros feed both team and platform improvements.",
    },
    mistakes: [
      { anti: "Improvement backlog grows but nothing ships", consequence: "Reliability decays. Incidents repeat. Engineers cynical." },
      { anti: "Action items without owners", consequence: "Nothing happens. Postmortems become theater." },
    ],
    hhax: {
      headline: "Continuous reliability investment is how HHAX moves from reactive to proactive — the central theme of the transformation journey.",
      bullets: [
        { area: "Reliability Backlog", detail: "Each owning team holds a reliability backlog visible to engineering leadership and prioritized alongside features." },
        { area: "Quarterly Reviews", detail: "Tier-1 services reviewed quarterly — error budget burn, toil %, incident trends — driving next-quarter investment." },
      ],
    },
  }),

  /* --- Section 3: Core Concepts --- */
  sloDeep: makeDrawer({
    id: "sloDeep",
    title: "Service Level Objectives (SLOs)",
    kicker: "Core Concept",
    icon: Target, tone: "sky",
    meaning: {
      plain: "An SLO is a target for a Service Level Indicator — a measurable property of service behavior that matters to users.",
      whyExists: "SLOs create a shared, data-driven definition of 'reliable enough,' replacing arguments with measurement.",
      whyGoogle: "Google introduced SLOs as the engineering primitive that lets organizations reason about reliability without pursuing 100%.",
      misconceptions: [
        "SLOs are not infrastructure metrics. They are user-experience metrics.",
        "SLOs are not promises. They are working agreements between product and engineering.",
      ],
    },
    operational: {
      intro: "SLOs in production reliability programs.",
      examples: [
        { org: "Google", story: "Burn-rate alerts at multiple windows (1h, 6h, 72h) page only when the budget is actually at risk." },
        { org: "Nobl9 / Datadog / Grafana", story: "SLO platforms compute burn rate, error budget, and forecast violations in near-real time." },
      ],
    },
    metrics: {
      definition: "A target for the percentage of valid events that meet an SLI over a rolling time window.",
      formula: "Good events ÷ Valid events × 100, measured over 28 days",
      measured: "From user-facing telemetry, not infrastructure health checks.",
      targets: [
        { label: "Typical Tier-1 web service", value: "99.9% – 99.95%", status: "good" },
        { label: "Critical financial transactions", value: "99.99%", status: "good" },
        { label: "Internal tooling", value: "99.0% – 99.5%", status: "good" },
      ],
    },
    patterns: {
      good: "One availability SLO per Tier-1 service.",
      better: "Availability + latency SLOs tied to user journeys, with burn-rate alerts.",
      best: "Error budget policy governs deploys; multi-window burn rate alerts; quarterly SLO review.",
    },
    mistakes: [
      { anti: "Aspirational SLOs no one believes", consequence: "Permanent budget burn → policy ignored → SLOs irrelevant." },
      { anti: "Threshold alerts instead of burn-rate alerts", consequence: "Pager noise. Real SLO violations buried." },
    ],
    hhax: {
      headline: "SLOs are the foundation HHAX needs to make reliability negotiable, measurable, and visible across all platforms.",
      bullets: [
        { area: "Caregiver Workflows", detail: "Per-journey SLOs (visit start, EVV capture, visit close) replace generic uptime targets." },
        { area: "Claims & Payroll", detail: "Process-level SLOs (claims acknowledged within X, payroll completed by Y) align with business calendars." },
      ],
    },
  }),

  errorBudgets: makeDrawer({
    id: "errorBudgets",
    title: "Error Budgets",
    kicker: "Core Concept",
    icon: ShieldCheck, tone: "amber",
    meaning: {
      plain: "If your SLO is 99.9%, you have a 0.1% error budget — the allowable amount of unreliability over a window. Budget governs release pace.",
      whyExists: "Error budgets transform the dev-vs-ops fight into a shared, data-driven decision: ship when budget is healthy, stabilize when it's burning.",
      whyGoogle: "Google uses error budgets as the explicit tradeoff that protects both feature velocity and reliability.",
      misconceptions: [
        "Error budgets are not punishment for shipping bugs. They're a tool for shared decision-making.",
        "You should spend your budget. Unspent budget signals you're over-investing in reliability vs. velocity.",
      ],
    },
    operational: {
      intro: "How budget policies operate in practice.",
      examples: [
        { org: "Google", story: "When budget is exhausted: feature freeze, reliability-only work until budget recovers." },
        { org: "LinkedIn", story: "Release pipelines block automatically when budget is at risk; overrides require leadership signoff." },
      ],
    },
    metrics: {
      definition: "Allowed unreliability over a window = (1 − SLO) × Total valid events.",
      formula: "Budget = (1 − SLO target) × window; Burn rate = consumed budget ÷ time elapsed",
      measured: "Continuously, with multi-window alerts on burn rate.",
      targets: [
        { label: "99.9% SLO over 28 days", value: "~43 minutes unreliability", status: "good" },
        { label: "99.95% SLO over 28 days", value: "~21 minutes unreliability", status: "good" },
        { label: "Healthy burn", value: "<100% over the window", status: "good" },
        { label: "At-risk burn", value: "2× or higher", status: "warn" },
      ],
    },
    patterns: {
      good: "Budget visible on a dashboard.",
      better: "Burn-rate alerts on multiple windows; budget reviewed weekly.",
      best: "Budget policy enforced in release pipelines and reliability investment decisions.",
    },
    mistakes: [
      { anti: "Budget tracked but never enforced", consequence: "Feature pressure always wins. Reliability decays. SLOs become decoration." },
      { anti: "Hoarding the budget", consequence: "Over-investment in reliability. Slow delivery. Wrong tradeoff." },
    ],
    hhax: {
      headline: "Error budgets give HHAX a principled way to balance modernization velocity with reliability commitments.",
      bullets: [
        { area: "Modernization Trains", detail: "When error budget is healthy, modernization work proceeds aggressively; when burning, focus shifts to stabilization." },
        { area: "Acquisition Integration", detail: "Acquired platforms enter a 'stabilization window' with explicit budget targets before being released for change." },
      ],
    },
  }),

  toilReduction: makeDrawer({
    id: "toilReduction",
    title: "Toil Reduction",
    kicker: "Core Concept",
    icon: Wrench, tone: "rose",
    meaning: {
      plain: "Toil is manual, repetitive, automatable, tactical, devoid-of-enduring-value operational work. SRE caps it so engineering capacity isn't consumed by it.",
      whyExists: "Toil compounds. Unchecked, it consumes a team's capacity within a few quarters, leaving no room for engineering.",
      whyGoogle: "Google's 50% toil cap forces continuous automation and protects the engineering work that prevents tomorrow's toil.",
      misconceptions: [
        "Toil is not the same as 'work I don't enjoy.' It has a specific definition.",
        "Not all manual work is toil. Architecture, design, complex incident analysis are engineering.",
      ],
    },
    operational: {
      intro: "Engineering organizations actively measure and reduce toil.",
      examples: [
        { org: "Google", story: "SRE teams log toil hours and report quarterly; managers reallocate when caps are breached." },
        { org: "Netflix", story: "Paved-road platforms eliminate categories of toil for application teams." },
      ],
    },
    metrics: {
      definition: "Percentage of team time spent on toil vs. engineering.",
      measured: "Self-reported time logging or sampled surveys, aggregated quarterly.",
      targets: [
        { label: "SRE toil cap (Google)", value: "≤ 50%", status: "good" },
        { label: "Healthy product team", value: "< 25%", status: "good" },
        { label: "At-risk team", value: "> 60%", status: "risk" },
      ],
    },
    patterns: {
      good: "Top toil items identified and prioritized.",
      better: "Toil measured continuously; automation backlog tracked against capacity.",
      best: "Toil cap enforced; teams over the cap get help or scope changes.",
    },
    mistakes: [
      { anti: "Toil normalized as 'just the job'", consequence: "Engineering capacity erodes. Burnout. Attrition." },
      { anti: "Automating individual tasks without addressing categories", consequence: "Toil whack-a-mole. Same patterns reappear elsewhere." },
    ],
    hhax: {
      headline: "Toil reduction is the lever HHAX uses to reclaim engineering capacity currently lost to operational interruptions.",
      bullets: [
        { area: "Access & Provisioning", detail: "Self-service replaces ticket queues, reclaiming branch IT capacity." },
        { area: "Repeat Incidents", detail: "Categorized incidents auto-remediated, freeing on-call for novel work." },
      ],
    },
  }),

  blamelessPostmortems: makeDrawer({
    id: "blamelessPostmortems",
    title: "Blameless Postmortems",
    kicker: "Core Concept",
    icon: BookOpen, tone: "violet",
    meaning: {
      plain: "After significant incidents, the team produces a written postmortem focused on systems and contributing factors — never on individual blame.",
      whyExists: "Blame drives information underground. Blameless culture surfaces the real causes and lets the organization learn.",
      whyGoogle: "Google formalized blameless postmortems as the mechanism that turns incidents into compounding organizational learning.",
      misconceptions: [
        "Blameless does not mean accountability-free. Owners and due dates exist on every action item.",
        "Postmortems are not punishment. They're a learning artifact.",
      ],
    },
    operational: {
      intro: "Industry leaders practice blameless postmortems consistently.",
      examples: [
        { org: "Etsy", story: "Postmortems shared widely; 'just culture' established at the leadership level." },
        { org: "Google", story: "Postmortem template, peer review, and action-item tracking are organization-wide standards." },
      ],
    },
    patterns: {
      good: "Every Sev-1/2 has a postmortem within a defined window.",
      better: "Postmortems peer-reviewed; action items have owners and due dates.",
      best: "Postmortems published broadly; trends fed to engineering leadership; common causes feed platform investment." ,
    },
    mistakes: [
      { anti: "Postmortems become finger-pointing", consequence: "Engineers stop participating honestly. Real causes hidden." },
      { anti: "Action items never tracked", consequence: "Same incidents repeat. Postmortems become theater." },
    ],
    hhax: {
      headline: "A blameless culture is a precondition for HHAX moving from reactive operations to learning-driven reliability.",
      bullets: [
        { area: "Cross-Platform Incidents", detail: "Postmortems shared across acquired platforms surface systemic patterns no single team can see." },
        { area: "Leadership Visibility", detail: "Quarterly incident trends reviewed by engineering leadership inform platform investment." },
      ],
    },
  }),

  observability: makeDrawer({
    id: "observability",
    title: "Observability",
    kicker: "Core Concept",
    icon: Eye, tone: "teal",
    meaning: {
      plain: "The ability to ask new questions about a system's behavior in production — without shipping new code — using metrics, logs, and traces.",
      whyExists: "Modern distributed systems fail in ways no dashboard can pre-specify. Observability lets engineers explore the unknown.",
      whyGoogle: "Google's monitoring philosophy emphasizes that telemetry must answer 'why,' not just 'what.'",
      misconceptions: [
        "Observability is not monitoring. Monitoring tells you something is wrong; observability tells you why.",
        "Three pillars (metrics/logs/traces) without correlation is just three data silos.",
      ],
    },
    operational: {
      intro: "Modern observability stacks unify telemetry.",
      examples: [
        { org: "Honeycomb", story: "High-cardinality event data lets engineers slice production behavior by any dimension." },
        { org: "Datadog", story: "Unified traces, metrics, and logs with service maps automatically derived from telemetry." },
      ],
    },
    patterns: {
      good: "Metrics, logs, and traces collected for every service.",
      better: "Telemetry tied to user journeys; correlation across the three pillars.",
      best: "OpenTelemetry standard adopted; SLOs and burn rates derived directly from telemetry; cost of observability budgeted." ,
    },
    mistakes: [
      { anti: "Logs without metrics", consequence: "Trend analysis impossible. Incidents take longer to diagnose." },
      { anti: "Metrics without traces", consequence: "Distributed-system failures impossible to root-cause." },
    ],
    hhax: {
      headline: "Observability investments make HHAX's distributed platforms diagnosable — across acquisitions, modern services, and legacy systems alike.",
      bullets: [
        { area: "Cross-Platform Tracing", detail: "End-to-end traces across home care, claims, payroll surface where workflows fail across system boundaries." },
        { area: "User-Journey Telemetry", detail: "Caregiver and branch journeys instrumented at the user boundary, not infrastructure." },
      ],
    },
  }),

  capacityPlanning: makeDrawer({
    id: "capacityPlanning",
    title: "Capacity Planning",
    kicker: "Core Concept",
    icon: TrendingUp, tone: "emerald",
    meaning: {
      plain: "Forecast demand and provision capacity proactively, using data — not by waiting for saturation to alert.",
      whyExists: "Capacity surprises drive outages and cost overruns. Data-driven capacity planning eliminates both.",
      whyGoogle: "Google treats capacity as an engineering discipline with forecasting, headroom targets, and scheduled growth reviews.",
      misconceptions: [
        "Auto-scaling is not capacity planning. It handles short-term variance, not long-term growth.",
        "Capacity is not just compute. It includes database, network, observability, and cost." ,
      ],
    },
    operational: {
      intro: "Engineering organizations forecast and review capacity systematically.",
      examples: [
        { org: "AWS / GCP customers", story: "Headroom targets defined per service; quarterly reviews drive reserved-capacity and architecture decisions." },
        { org: "Google", story: "Capacity reviewed per service with explicit headroom and surge models for known events." },
      ],
    },
    patterns: {
      good: "Auto-scaling configured per service.",
      better: "Headroom targets defined; forecasts reviewed quarterly.",
      best: "Capacity planning integrated with FinOps; reservation strategy aligned with growth model.",
    },
    mistakes: [
      { anti: "Provisioning by 'last incident + 20%'", consequence: "Cost climbs without reliability gains; saturation still surprises." },
      { anti: "Capacity planning detached from product roadmap", consequence: "Launches over- or under-provisioned; customer experience and cost both suffer." },
    ],
    hhax: {
      headline: "Capacity planning gives HHAX predictable cost and predictable reliability — particularly as acquisitions add load.",
      bullets: [
        { area: "Payroll Week Surge", detail: "Capacity model accounts for weekly payroll peaks rather than treating them as incidents." },
        { area: "Acquisition Onboarding", detail: "Capacity reviewed and forecast each time an acquired platform onboards." },
      ],
    },
  }),

  /* --- Section 4: Lifecycle steps --- */
  lifeDefine: makeDrawer({
    id: "lifeDefine",
    title: "Define Service",
    kicker: "Lifecycle Step 1",
    icon: Layers, tone: "slate",
    meaning: {
      plain: "Establish what the service is, who owns it, who its users are, and what reliability matters to them.",
      whyExists: "Without a clear definition, reliability conversations are impossible — there's no scope, no owner, no users to optimize for.",
      whyGoogle: "Google requires a defined service contract before SRE engagement.",
      misconceptions: [
        "A service is not the same as a microservice. It's the unit of customer value.",
      ],
    },
    operational: {
      intro: "Service definition lives in the service catalog.",
      examples: [
        { org: "Spotify Backstage", story: "Service catalog records owner, tier, dependencies, runbooks, on-call." },
        { org: "Cortex / Port", story: "Service definition enforced via scorecards and quality gates." },
      ],
    },
    patterns: {
      good: "Service listed in catalog with owner.",
      better: "Service has tier, dependencies, runbooks, and on-call linked.",
      best: "Service definition versioned; scorecards enforce standards.",
    },
    mistakes: [
      { anti: "Service exists only in someone's head", consequence: "Onboarding takes weeks; incident response inefficient." },
    ],
    hhax: {
      headline: "Service definition is the precondition for service ownership across HHAX's portfolio.",
      bullets: [
        { area: "Catalog", detail: "Every Tier-1 service across HHAX and acquired platforms catalogued with owner and on-call." },
      ],
    },
  }),

  lifeSLO: makeDrawer({
    id: "lifeSLO",
    title: "Create SLOs",
    kicker: "Lifecycle Step 2",
    icon: Target, tone: "sky",
    meaning: {
      plain: "Define measurable reliability targets that reflect what users actually need.",
      whyExists: "SLOs make reliability a negotiated, data-driven commitment.",
      whyGoogle: "Google centers its reliability practice on SLOs as the engineering primitive.",
      misconceptions: ["SLOs ≠ SLAs. SLOs are internal, stricter."],
    },
    operational: {
      intro: "SLO authoring is collaborative between product, engineering, and SRE.",
      examples: [
        { org: "LinkedIn", story: "SLO templates per service archetype shorten the time to first SLO." },
      ],
    },
    patterns: {
      good: "One SLO per Tier-1 service.",
      better: "Availability + latency per user journey.",
      best: "Quarterly SLO review; SLOs drive policy.",
    },
    mistakes: [
      { anti: "SLOs copied from infra dashboards", consequence: "Disconnected from user experience." },
    ],
    hhax: {
      headline: "HHAX SLOs map to caregiver, branch, payer, and claims journeys.",
      bullets: [
        { area: "Journey-Level", detail: "Per-journey SLOs replace generic uptime metrics." },
      ],
    },
  }),

  lifeMeasure: makeDrawer({
    id: "lifeMeasure",
    title: "Measure Reliability",
    kicker: "Lifecycle Step 3",
    icon: BarChart3, tone: "violet",
    meaning: {
      plain: "Instrument telemetry that measures reliability against SLOs from the user's perspective.",
      whyExists: "You cannot manage what you cannot measure — and infrastructure metrics aren't enough.",
      whyGoogle: "Google's golden signals (latency, traffic, errors, saturation) are the baseline.",
      misconceptions: ["Uptime ping is not reliability measurement."],
    },
    operational: {
      intro: "Modern stacks unify metrics, logs, and traces.",
      examples: [{ org: "Datadog / Grafana / Honeycomb", story: "Unified telemetry with SLO modules built in." }],
    },
    patterns: {
      good: "Golden signals emitted per service.",
      better: "Telemetry tied to user journeys; SLO modules compute burn.",
      best: "OpenTelemetry standard; cost of observability budgeted.",
    },
    mistakes: [{ anti: "Logs without metrics", consequence: "Trend analysis impossible." }],
    hhax: {
      headline: "HHAX telemetry instruments user journeys end-to-end.",
      bullets: [{ area: "End-to-End", detail: "Traces across home care, claims, payroll." }],
    },
  }),

  lifeBudget: makeDrawer({
    id: "lifeBudget",
    title: "Manage Error Budget",
    kicker: "Lifecycle Step 4",
    icon: ShieldCheck, tone: "amber",
    meaning: {
      plain: "Track budget consumption; balance feature velocity against reliability based on burn.",
      whyExists: "Budgets make the reliability-vs-velocity tradeoff explicit.",
      whyGoogle: "Google ties release pace to budget health.",
      misconceptions: ["Hoarding the budget is wasteful."],
    },
    operational: {
      intro: "Release pipelines and reliability councils enforce budget policy.",
      examples: [{ org: "LinkedIn", story: "Pipelines block when budget at risk; overrides require signoff." }],
    },
    patterns: {
      good: "Budget visible.",
      better: "Burn-rate alerts; weekly review.",
      best: "Budget policy enforced in pipelines and investment decisions.",
    },
    mistakes: [{ anti: "Budget tracked, never enforced", consequence: "Feature pressure wins; SLOs become decoration." }],
    hhax: {
      headline: "Budget policy lets HHAX balance modernization velocity with reliability commitments.",
      bullets: [{ area: "Modernization", detail: "Modernization proceeds aggressively when budget healthy; stabilization when burning." }],
    },
  }),

  lifeToil: makeDrawer({
    id: "lifeToil",
    title: "Reduce Toil",
    kicker: "Lifecycle Step 5",
    icon: Wrench, tone: "rose",
    meaning: {
      plain: "Measure manual operational work; automate it as a first-class engineering investment.",
      whyExists: "Toil consumes capacity that should fund engineering.",
      whyGoogle: "Google caps SRE toil at 50%.",
      misconceptions: ["Not all manual work is toil."],
    },
    operational: {
      intro: "Teams measure and burn down toil quarterly.",
      examples: [{ org: "Google", story: "Toil hours reported quarterly; reallocation when caps breach." }],
    },
    patterns: {
      good: "Top items identified.",
      better: "Toil measured continuously.",
      best: "Toil cap enforced.",
    },
    mistakes: [{ anti: "Toil normalized as 'the job'", consequence: "Engineering capacity erodes." }],
    hhax: {
      headline: "Toil reduction reclaims capacity lost to operational interruptions.",
      bullets: [{ area: "Self-Service", detail: "Self-service replaces ticket queues." }],
    },
  }),

  lifeLearn: makeDrawer({
    id: "lifeLearn",
    title: "Learn From Incidents",
    kicker: "Lifecycle Step 6",
    icon: BookOpen, tone: "violet",
    meaning: {
      plain: "Every significant incident produces a blameless postmortem that drives systemic improvement.",
      whyExists: "Without learning, incidents repeat.",
      whyGoogle: "Postmortems are organization-wide standards at Google.",
      misconceptions: ["Blameless is not accountability-free."],
    },
    operational: {
      intro: "Postmortems are peer-reviewed and published broadly.",
      examples: [{ org: "Etsy", story: "Just culture established at the leadership level." }],
    },
    patterns: {
      good: "Postmortem per Sev-1/2.",
      better: "Action items tracked.",
      best: "Trends drive platform investment.",
    },
    mistakes: [{ anti: "Action items never tracked", consequence: "Incidents repeat." }],
    hhax: {
      headline: "Cross-platform postmortems surface patterns invisible to a single team.",
      bullets: [{ area: "Leadership Visibility", detail: "Quarterly incident trends inform platform investment." }],
    },
  }),

  lifeImprove: makeDrawer({
    id: "lifeImprove",
    title: "Continuously Improve",
    kicker: "Lifecycle Step 7",
    icon: RefreshCw, tone: "teal",
    meaning: {
      plain: "Reliability backlog worked alongside features, informed by data.",
      whyExists: "Reliability decays without explicit investment.",
      whyGoogle: "Error budgets create the explicit tradeoff that protects reliability work.",
      misconceptions: ["Continuous improvement is not 'next quarter.'"],
    },
    operational: {
      intro: "Reliability work is part of every sprint.",
      examples: [{ org: "Google", story: "Quarterly reviews shift investment based on data." }],
    },
    patterns: {
      good: "Action items completed.",
      better: "Reliability work in every sprint.",
      best: "Quarterly reviews trigger investment shifts.",
    },
    mistakes: [{ anti: "Improvement backlog grows, nothing ships", consequence: "Reliability decays." }],
    hhax: {
      headline: "Continuous investment is the central transformation theme for HHAX.",
      bullets: [{ area: "Reliability Backlog", detail: "Visible to leadership, prioritized alongside features." }],
    },
  }),

  /* --- Section 5 metrics --- */
  mAvail: makeDrawer({
    id: "mAvail", title: "Availability", kicker: "Reliability Metric",
    icon: Activity, tone: "emerald",
    meaning: { plain: "Percentage of valid requests that succeed.", whyExists: "Most fundamental reliability dimension.", whyGoogle: "Cornerstone SLI in the SRE book.", misconceptions: ["Uptime ≠ availability."] },
    operational: { intro: "Measured from success-rate telemetry at the user boundary.", examples: [{ org: "AWS", story: "Service availability published per region." }] },
    metrics: { definition: "Successful requests ÷ valid requests over a window.", formula: "A = good ÷ valid × 100", measured: "From backend success ratio or RUM.", targets: [
      { label: "Tier-1 web", value: "99.95%", status: "good" },
      { label: "Internal", value: "99.5%", status: "good" },
      { label: "Critical financial", value: "99.99%", status: "good" },
    ] },
    patterns: { good: "Measured per service.", better: "Per user journey.", best: "Drives error budget policy." },
    mistakes: [{ anti: "Measured from infra checks", consequence: "Disconnected from user experience." }],
    hhax: { headline: "Availability of caregiver, branch, and payer journeys drives HHAX's primary reliability commitments.", bullets: [{ area: "Caregiver App", detail: "Per-journey availability tracked separately from infrastructure uptime." }] },
  }),
  mLatency: makeDrawer({
    id: "mLatency", title: "Latency", kicker: "Reliability Metric",
    icon: Clock, tone: "sky",
    meaning: { plain: "Time for a request to complete, measured at user-experienced percentiles (p50, p95, p99).", whyExists: "Average latency hides the worst experiences. Percentiles surface them.", whyGoogle: "Google measures latency at p99 and beyond for user-facing services.", misconceptions: ["Average latency is misleading."] },
    operational: { intro: "Tracked per endpoint and per user journey.", examples: [{ org: "Datadog", story: "Percentile latency natively in service maps." }] },
    metrics: { definition: "Request duration at given percentile over a window.", formula: "p95(latency) over rolling window", measured: "From request traces or RUM.", targets: [
      { label: "Interactive p95", value: "< 300 ms", status: "good" },
      { label: "API p99", value: "< 1 s", status: "good" },
      { label: "At-risk p95", value: "> 1 s", status: "warn" },
    ] },
    patterns: { good: "p95 tracked.", better: "p95 + p99 per user journey.", best: "Latency SLO with burn-rate alerts." },
    mistakes: [{ anti: "Reporting only average latency", consequence: "Tail latency hidden; worst users invisible." }],
    hhax: { headline: "Mobile latency for caregivers directly impacts clock-in success and payroll accuracy.", bullets: [{ area: "Mobile p95", detail: "Latency per region and network type exposes real causes of failed visits." }] },
  }),
  mError: makeDrawer({
    id: "mError", title: "Error Rate", kicker: "Reliability Metric",
    icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Percentage of requests that fail.", whyExists: "Errors are the inverse of availability and a direct customer signal.", whyGoogle: "One of the four golden signals.", misconceptions: ["Not all errors are equal — distinguish client vs. server errors."] },
    operational: { intro: "Tracked per endpoint and error class.", examples: [{ org: "Netflix", story: "Error budgets derived directly from request error rate." }] },
    metrics: { definition: "Failed requests ÷ valid requests.", formula: "errors ÷ valid × 100", measured: "From request logs or traces.", targets: [
      { label: "Healthy", value: "< 0.1%", status: "good" }, { label: "Warning", value: "0.1% – 1%", status: "warn" }, { label: "Critical", value: "> 1%", status: "risk" },
    ] },
    patterns: { good: "Error rate per service.", better: "By error class and endpoint.", best: "Drives SLO and budget calculation." },
    mistakes: [{ anti: "Counting all 4xx as failures", consequence: "Customer 'errors' inflate the rate; real problems hidden." }],
    hhax: { headline: "Error rates per workflow expose where claims, payroll, and caregiver flows actually fail.", bullets: [{ area: "Per-Workflow", detail: "Tracked separately for caregiver, branch, payer, and integration workflows." }] },
  }),
  mThroughput: makeDrawer({
    id: "mThroughput", title: "Throughput", kicker: "Reliability Metric",
    icon: TrendingUp, tone: "violet",
    meaning: { plain: "Request volume per unit time.", whyExists: "Surface load patterns and saturation risk.", whyGoogle: "Traffic is one of the four golden signals.", misconceptions: ["Throughput without saturation context is incomplete."] },
    operational: { intro: "Tracked per service and per dependency.", examples: [{ org: "AWS", story: "CloudWatch traffic metrics drive auto-scaling decisions." }] },
    metrics: { definition: "Requests per second over a window.", measured: "From load balancer, gateway, or service telemetry.", targets: [
      { label: "Predictable variance", value: "< 25% week-over-week", status: "good" },
      { label: "Surge event", value: "Defined and modeled", status: "good" },
    ] },
    patterns: { good: "RPS per service.", better: "Per endpoint + per dependency.", best: "Capacity headroom derived from throughput forecasts." },
    mistakes: [{ anti: "Sizing for average, not peak", consequence: "Saturation incidents at week's peak." }],
    hhax: { headline: "Throughput modeling around payroll week makes load planning predictable.", bullets: [{ area: "Payroll Week", detail: "Throughput model anticipates surge instead of treating it as an incident." }] },
  }),
  mMTTR: makeDrawer({
    id: "mMTTR", title: "MTTR", kicker: "Operational Metric",
    icon: Clock, tone: "amber",
    meaning: { plain: "Mean Time To Recovery — average time from incident detection to recovery.", whyExists: "Most useful single operational metric; measures response capability.", whyGoogle: "Tracked per service tier with explicit targets.", misconceptions: ["Lower MTTR alone doesn't mean reliability is improving — incident frequency matters too."] },
    operational: { intro: "Tracked per Sev level.", examples: [{ org: "PagerDuty users", story: "MTTR reported per service and per Sev level in monthly reviews." }] },
    metrics: { definition: "Sum(recovery time) ÷ incident count over a window.", measured: "From incident management system.", targets: [
      { label: "Tier-1 Sev-1", value: "< 15 min", status: "good" }, { label: "Tier-1 Sev-2", value: "< 1 hour", status: "good" }, { label: "At risk", value: "> 1 hour Sev-1", status: "risk" },
    ] },
    patterns: { good: "MTTR tracked per Sev.", better: "Trend reviewed quarterly.", best: "MTTR drives platform and runbook investment." },
    mistakes: [{ anti: "Tracking MTTR without incident-rate context", consequence: "Optimizing the wrong number." }],
    hhax: { headline: "MTTR targets per platform make recovery time a measurable commitment, not a hope.", bullets: [{ area: "Per-Platform", detail: "Each acquired platform has explicit MTTR targets during integration." }] },
  }),
  mToilPct: makeDrawer({
    id: "mToilPct", title: "Toil %", kicker: "Operational Metric",
    icon: Wrench, tone: "rose",
    meaning: { plain: "Percentage of team time spent on toil vs. engineering.", whyExists: "Toil consumes capacity that should fund engineering.", whyGoogle: "Google caps SRE toil at 50%.", misconceptions: ["Toil is not the same as work I dislike."] },
    operational: { intro: "Measured via time logging or sampled surveys.", examples: [{ org: "Google", story: "Quarterly toil reports drive reallocation." }] },
    metrics: { definition: "Hours spent on toil ÷ total hours.", measured: "Self-report or sampled audit.", targets: [{ label: "SRE cap", value: "≤ 50%", status: "good" }, { label: "Product team healthy", value: "< 25%", status: "good" }, { label: "At risk", value: "> 60%", status: "risk" }] },
    patterns: { good: "Top items identified.", better: "Measured continuously.", best: "Cap enforced." },
    mistakes: [{ anti: "Normalizing toil as 'the job'", consequence: "Capacity erodes." }],
    hhax: { headline: "Reducing toil reclaims HHAX engineering capacity for modernization.", bullets: [{ area: "Self-Service", detail: "Replaces ticket queues, freeing capacity." }] },
  }),
  mBurn: makeDrawer({
    id: "mBurn", title: "Error Budget Burn", kicker: "Reliability Metric",
    icon: ShieldCheck, tone: "amber",
    meaning: { plain: "Rate of error budget consumption — fast burn means SLO violation is imminent.", whyExists: "Burn-rate alerts replace noisy threshold alerts.", whyGoogle: "Multi-window burn rate is Google's preferred alerting model.", misconceptions: ["Threshold alerts are not equivalent."] },
    operational: { intro: "Multi-window alerts (1h, 6h, 72h) used together.", examples: [{ org: "Google", story: "Pages only fire when budget is actually at risk." }] },
    metrics: { definition: "Budget consumed ÷ time elapsed over a window.", formula: "burn = (1 − good/valid) ÷ (1 − SLO)", measured: "Computed continuously by SLO platform.", targets: [{ label: "Healthy", value: "< 1×", status: "good" }, { label: "Warning", value: "2×", status: "warn" }, { label: "Critical", value: "10× short-window", status: "risk" }] },
    patterns: { good: "Burn rate visible.", better: "Multi-window alerts.", best: "Burn rate drives release decisions." },
    mistakes: [{ anti: "Single-window burn alerts", consequence: "Pager noise or missed incidents." }],
    hhax: { headline: "Burn-rate alerts give HHAX on-call signal without noise.", bullets: [{ area: "Per-Service", detail: "Replaces threshold alerts across acquired platforms." }] },
  }),
  mSloComp: makeDrawer({
    id: "mSloComp", title: "SLO Compliance", kicker: "Reliability Metric",
    icon: CheckCircle2, tone: "emerald",
    meaning: { plain: "Whether services met their SLO targets over the window.", whyExists: "Aggregate view of reliability posture.", whyGoogle: "Reported to leadership as a portfolio-level metric.", misconceptions: ["100% compliance may mean SLOs are too loose."] },
    operational: { intro: "Reported quarterly to engineering leadership.", examples: [{ org: "LinkedIn", story: "Portfolio SLO compliance reviewed by exec staff." }] },
    metrics: { definition: "Percentage of services meeting SLO over the window.", measured: "From SLO platform aggregate.", targets: [{ label: "Healthy portfolio", value: "> 85%", status: "good" }, { label: "Attention", value: "70–85%", status: "warn" }, { label: "Critical", value: "< 70%", status: "risk" }] },
    patterns: { good: "Compliance reported.", better: "Reviewed quarterly with action.", best: "Drives investment shifts." },
    mistakes: [{ anti: "Compliance hidden in dashboards", consequence: "No leadership signal; no investment changes." }],
    hhax: { headline: "Portfolio SLO compliance gives HHAX leadership a single reliability-posture signal across platforms.", bullets: [{ area: "Quarterly", detail: "Reported with platform-level drilldowns." }] },
  }),

  /* --- Section 6 anti-patterns --- */
  apHero: makeDrawer({
    id: "apHero", title: "Hero Culture", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Reliability depends on a small number of individuals being heroic during incidents.", whyExists: "It feels like it works — until those people leave or burn out.", whyGoogle: "Heroism does not scale and cannot survive growth.", misconceptions: ["Hero culture is not the same as engineering excellence."] },
    operational: { intro: "Hero patterns surface in incident timelines and on-call data.", examples: [{ org: "Industry", story: "When 3 people resolve 80% of incidents, the org is hero-dependent." }] },
    patterns: { good: "Identify hero dependency.", better: "Cross-train and document.", best: "Service ownership distributes knowledge by design." },
    mistakes: [
      { anti: "Reliance on a few key people", consequence: "Burnout, attrition, knowledge loss." },
      { anti: "Rewarding heroism", consequence: "Reinforces the pattern; discourages systemic fixes." },
    ],
    hhax: { headline: "HHAX's tribal-knowledge concerns map directly to hero culture — service ownership is the structural fix.", bullets: [{ area: "On-Call Spread", detail: "Cross-team on-call rotation breaks hero dependency." }] },
  }),
  apTickets: makeDrawer({
    id: "apTickets", title: "Ticket Factories", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Ops teams measured by ticket throughput rather than reliability outcomes.", whyExists: "Tickets are easy to count — but counting them rewards the wrong behavior.", whyGoogle: "Measuring outcomes (reliability, toil, customer satisfaction) replaces ticket metrics.", misconceptions: ["Tickets are useful workflow tools; the anti-pattern is making them the goal."] },
    operational: { intro: "Symptom: ticket volume up, reliability flat.", examples: [{ org: "Industry", story: "Self-service replaces tickets where possible; tickets become exception cases." }] },
    patterns: { good: "Identify high-volume ticket types.", better: "Self-service replaces tickets.", best: "Service ownership eliminates ticket categories entirely." },
    mistakes: [{ anti: "Optimizing ticket SLAs without reducing tickets", consequence: "Cost grows, reliability stagnates." }],
    hhax: { headline: "HHAX's ticket-driven operations pattern is exactly what SRE addresses through self-service and automation.", bullets: [{ area: "Self-Service", detail: "Branch and caregiver requests served by platforms, not queues." }] },
  }),
  apMonNoOwn: makeDrawer({
    id: "apMonNoOwn", title: "Monitoring Without Ownership", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Alerts fire to mailboxes no one owns; everyone assumes someone else is handling it.", whyExists: "Without named ownership, alerts become noise.", whyGoogle: "Alerts must route to a named on-call.", misconceptions: ["A dashboard is not ownership."] },
    operational: { intro: "Alert hygiene audits expose orphan alerts.", examples: [{ org: "Industry", story: "Service catalog enforces owner-on-alert mapping." }] },
    patterns: { good: "Every alert routes to a team.", better: "Every alert has runbook and SLI link.", best: "Alerts auto-disable if owner unknown." },
    mistakes: [{ anti: "Send to ops@", consequence: "Alerts ignored; incidents missed." }],
    hhax: { headline: "Service ownership defines who carries the pager for each HHAX platform.", bullets: [{ area: "Catalog", detail: "Routes alerts from a single source of truth." }] },
  }),
  apTribal: makeDrawer({
    id: "apTribal", title: "Tribal Knowledge", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Critical operational knowledge lives only in long-tenured employees' heads.", whyExists: "It builds up naturally and feels harmless — until those people move on.", whyGoogle: "Runbooks, postmortems, and service catalogs externalize tribal knowledge.", misconceptions: ["Documentation alone is insufficient — practiced runbooks matter."] },
    operational: { intro: "Knowledge gaps surface in incident-response timelines.", examples: [{ org: "Industry", story: "Runbook + game-day cadence keeps knowledge current." }] },
    patterns: { good: "Runbooks per service.", better: "Game days exercise runbooks.", best: "Service catalog is the source of truth." },
    mistakes: [{ anti: "Stale runbooks", consequence: "False confidence; worse than no runbook." }],
    hhax: { headline: "Externalizing knowledge is essential as HHAX integrates acquired platforms with disparate engineering histories.", bullets: [{ area: "Catalog", detail: "Standardized runbooks across platforms." }] },
  }),
  apToil: makeDrawer({
    id: "apToil", title: "Excessive Toil", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Manual operational work consumes most of the team's capacity.", whyExists: "It accumulates incrementally and is rarely measured.", whyGoogle: "Toil cap forces continuous automation investment.", misconceptions: ["Not all manual work is toil."] },
    operational: { intro: "Quarterly toil audits drive prioritization.", examples: [{ org: "Google", story: "Reallocations triggered when caps breach." }] },
    patterns: { good: "Identify top items.", better: "Measure continuously.", best: "Cap and enforce." },
    mistakes: [{ anti: "Normalize toil", consequence: "Engineering capacity erodes." }],
    hhax: { headline: "Reclaiming toil capacity is how HHAX funds modernization without growing headcount.", bullets: [{ area: "Automation Backlog", detail: "Toil categories prioritized alongside features." }] },
  }),
  apOvertime: makeDrawer({
    id: "apOvertime", title: "Reliability Through Overtime", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Reliability sustained by extending hours rather than engineering improvements.", whyExists: "Easier in the short term; unsustainable.", whyGoogle: "Overtime hides systemic problems and accelerates attrition.", misconceptions: ["Crunches happen; the anti-pattern is making them the operating model."] },
    operational: { intro: "Hours tracked alongside incident metrics.", examples: [{ org: "Industry", story: "On-call hours per engineer per month reviewed by leadership." }] },
    patterns: { good: "Track on-call hours.", better: "Cap consecutive on-call weeks.", best: "Engineering investment removes the need." },
    mistakes: [{ anti: "Reward overtime", consequence: "Reinforces the anti-pattern; drives attrition." }],
    hhax: { headline: "Replacing heroics with engineering protects HHAX from the attrition risk seen in similar transformations.", bullets: [{ area: "On-Call Health", detail: "Hours and pages tracked; investment when limits breach." }] },
  }),
  apNoBudget: makeDrawer({
    id: "apNoBudget", title: "No Error Budgets", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Reliability and feature velocity argued case by case, without a shared budget.", whyExists: "Without budgets, feature pressure always wins.", whyGoogle: "Budgets create the explicit tradeoff.", misconceptions: ["A target on a dashboard is not a budget policy."] },
    operational: { intro: "Budget policy enforced in pipelines and reliability councils.", examples: [{ org: "LinkedIn", story: "Pipelines block deploys when budget at risk." }] },
    patterns: { good: "Budget visible.", better: "Reviewed weekly.", best: "Enforced in pipelines." },
    mistakes: [{ anti: "Budget tracked, not enforced", consequence: "Velocity always wins." }],
    hhax: { headline: "Budget policy is the mechanism that lets HHAX modernize without sacrificing reliability.", bullets: [{ area: "Modernization Trains", detail: "Stabilize when burning, accelerate when healthy." }] },
  }),
  apMonNoAction: makeDrawer({
    id: "apMonNoAction", title: "Monitoring Without Action", kicker: "Anti-Pattern", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Telemetry collected at cost but not acted on.", whyExists: "Tools are bought before processes are designed.", whyGoogle: "Telemetry must drive decisions or it isn't worth collecting.", misconceptions: ["Adding more dashboards is not the answer."] },
    operational: { intro: "Telemetry tied to SLOs and runbooks; cost of observability reviewed.", examples: [{ org: "Industry", story: "Observability cost benchmarked vs. business value." }] },
    patterns: { good: "Telemetry tied to a runbook.", better: "Telemetry drives SLO burn.", best: "Cost of observability budgeted and reviewed." },
    mistakes: [{ anti: "Buy more monitoring", consequence: "Cost climbs; outcomes don't improve." }],
    hhax: { headline: "Disciplined telemetry strategy ensures HHAX observability spend returns reliability value.", bullets: [{ area: "Per-Workflow", detail: "Telemetry tied to user journeys, not infrastructure." }] },
  }),

  /* --- Section 2 comparison rows --- */
  cmpOps: makeDrawer({
    id: "cmpOps", title: "Operations Model", kicker: "Traditional vs SRE", icon: Workflow, tone: "violet",
    meaning: { plain: "Traditional ops separates Dev and Ops; SRE treats operations as a software-engineering problem.", whyExists: "Separation creates handoff cost, blame, and slow learning.", whyGoogle: "Google's premise: operations work is engineering work.", misconceptions: ["SRE is not 'ops with scripts.'"] },
    operational: { intro: "Traditional: ticket queues, Ops responds. SRE: services owned by teams that write the code.", examples: [{ org: "Industry", story: "'You build it, you run it' is the common phrasing." }] },
    patterns: { good: "Defined ownership.", better: "Pager held by service team.", best: "SRE engages services that meet maturity bar." },
    mistakes: [{ anti: "Rebrand Ops as SRE without changing operating model", consequence: "Same handoffs, new badges." }],
    hhax: { headline: "HHAX's discovery showed exactly the handoff and ownership gaps SRE addresses.", bullets: [{ area: "Per-Service", detail: "Code-owning teams hold the pager." }] },
  }),
  cmpOwn: makeDrawer({
    id: "cmpOwn", title: "Ownership", kicker: "Traditional vs SRE", icon: Users, tone: "emerald",
    meaning: { plain: "Traditional: Ops owns production. SRE: service teams own production end to end.", whyExists: "Without ownership, feedback loops are broken.", whyGoogle: "Ownership tightens the loop between design and operations.", misconceptions: ["SRE doesn't take ownership off product teams."] },
    operational: { intro: "Catalog enforces named ownership.", examples: [{ org: "Netflix", story: "'You build it, you run it.'" }] },
    patterns: { good: "Named team.", better: "Team owns SLOs, cost, security.", best: "Ownership measured in team scorecards." },
    mistakes: [{ anti: "Wiki ownership only", consequence: "Alerts misroute; incidents orphan." }],
    hhax: { headline: "Named ownership ends 'no one owns it' for acquired and legacy HHAX platforms.", bullets: [{ area: "Catalog", detail: "Source of truth for ownership across all platforms." }] },
  }),
  cmpIncident: makeDrawer({
    id: "cmpIncident", title: "Incident Management", kicker: "Traditional vs SRE", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Traditional: ad-hoc war room. SRE: defined roles, structured response, blameless postmortem.", whyExists: "Structure makes recovery predictable; learning compounds.", whyGoogle: "IMAG framework adopted broadly.", misconceptions: ["Postmortems are not punishment."] },
    operational: { intro: "Incident Commander coordinates; postmortems peer-reviewed.", examples: [{ org: "PagerDuty / Atlassian", story: "IC/Comms/Scribe activated within minutes." }] },
    patterns: { good: "Defined Sevs.", better: "Practiced roles.", best: "Action items tracked and trended." },
    mistakes: [{ anti: "Ad-hoc each time", consequence: "Unpredictable MTTR." }],
    hhax: { headline: "Structured incident response replaces HHAX firefighting and CEO calls.", bullets: [{ area: "Payroll Week", detail: "IC role activates instead of ad-hoc bridge." }] },
  }),
  cmpChange: makeDrawer({
    id: "cmpChange", title: "Change Management", kicker: "Traditional vs SRE", icon: RefreshCw, tone: "teal",
    meaning: { plain: "Traditional: CABs and freezes. SRE: error budget governs release pace.", whyExists: "Heavy change processes slow learning without improving reliability.", whyGoogle: "Budget policy replaces freeze theater.", misconceptions: ["SRE doesn't mean 'ship anything anytime.'"] },
    operational: { intro: "Pipelines check budget; reliability council reviews exceptions.", examples: [{ org: "LinkedIn", story: "Pipelines auto-block on budget at risk." }] },
    patterns: { good: "Defined release process.", better: "Automated checks.", best: "Budget-driven release decisions." },
    mistakes: [{ anti: "CAB-only model", consequence: "Slow delivery without reliability gains." }],
    hhax: { headline: "Budget-governed release replaces freeze theater for HHAX modernization trains.", bullets: [{ area: "Pipelines", detail: "Automated checks ensure reliability stays in budget." }] },
  }),
  cmpAuto: makeDrawer({
    id: "cmpAuto", title: "Automation", kicker: "Traditional vs SRE", icon: Cpu, tone: "amber",
    meaning: { plain: "Traditional: scripts as personal tools. SRE: automation as product.", whyExists: "Product-quality automation scales; scripts do not.", whyGoogle: "Automation owned by teams with maintenance and quality SLOs.", misconceptions: ["Automation is not just CI/CD."] },
    operational: { intro: "Automation backlog runs alongside product backlog.", examples: [{ org: "Netflix", story: "Spinnaker invested as a product." }] },
    patterns: { good: "Top toil items automated.", better: "Automation backlog measured.", best: "Self-healing dominates response." },
    mistakes: [{ anti: "Scripts in home directories", consequence: "Bus factor of one." }],
    hhax: { headline: "Automation investment is the lever that breaks HHAX's ticket-factory pattern.", bullets: [{ area: "Self-Service", detail: "Replaces ticket queues for access and provisioning." }] },
  }),
  cmpMon: makeDrawer({
    id: "cmpMon", title: "Monitoring", kicker: "Traditional vs SRE", icon: Eye, tone: "teal",
    meaning: { plain: "Traditional: threshold alerts on infrastructure. SRE: SLO burn from user telemetry.", whyExists: "Thresholds create noise; burn rate creates signal.", whyGoogle: "Multi-window burn rate is Google's preferred alerting.", misconceptions: ["More dashboards ≠ better monitoring."] },
    operational: { intro: "Telemetry tied to user journeys; alerts derived from burn.", examples: [{ org: "Google", story: "Burn alerts page only when budget is at risk." }] },
    patterns: { good: "Golden signals per service.", better: "Journey-level telemetry.", best: "Burn-rate alerts replace thresholds." },
    mistakes: [{ anti: "Threshold alerts on every metric", consequence: "Alert fatigue; real signals lost." }],
    hhax: { headline: "User-journey telemetry exposes the real causes of HHAX caregiver and branch issues.", bullets: [{ area: "Journeys", detail: "Per-journey burn replaces noisy thresholds." }] },
  }),
  cmpCap: makeDrawer({
    id: "cmpCap", title: "Capacity Planning", kicker: "Traditional vs SRE", icon: TrendingUp, tone: "emerald",
    meaning: { plain: "Traditional: spreadsheets. SRE: data + forecasts + headroom targets.", whyExists: "Surprises drive outages and cost.", whyGoogle: "Capacity is an engineering discipline at Google.", misconceptions: ["Auto-scaling alone is not capacity planning."] },
    operational: { intro: "Forecasts reviewed quarterly; reservations aligned with growth.", examples: [{ org: "AWS customers", story: "Headroom defined per service tier." }] },
    patterns: { good: "Auto-scaling configured.", better: "Headroom targets.", best: "Integrated with FinOps." },
    mistakes: [{ anti: "Provision by last-incident + 20%", consequence: "Cost up; saturation still surprises." }],
    hhax: { headline: "Predictable HHAX capacity ends payroll-week surprises.", bullets: [{ area: "Payroll Week", detail: "Surge modeled, not reacted to." }] },
  }),
  cmpCust: makeDrawer({
    id: "cmpCust", title: "Customer Focus", kicker: "Traditional vs SRE", icon: Heart, tone: "rose",
    meaning: { plain: "Traditional: SLAs and uptime. SRE: SLOs tied to user experience and burn budgets.", whyExists: "Customers feel journeys; they don't feel uptime.", whyGoogle: "SLOs map to user experience.", misconceptions: ["Uptime ≠ reliability."] },
    operational: { intro: "SLOs per user journey, per persona.", examples: [{ org: "Healthcare SaaS", story: "Patient and provider journeys carry distinct SLOs." }] },
    patterns: { good: "Service-level SLOs.", better: "Journey-level SLOs.", best: "Persona-level SLOs with VoC tie-in." },
    mistakes: [{ anti: "Optimize SLA, ignore experience", consequence: "Customers churn while dashboards green." }],
    hhax: { headline: "Caregiver, branch, and payer experience become measurable HHAX commitments.", bullets: [{ area: "Personas", detail: "Distinct SLOs per persona and platform." }] },
  }),
  cmpEng: makeDrawer({
    id: "cmpEng", title: "Engineering Involvement", kicker: "Traditional vs SRE", icon: Code2, tone: "violet",
    meaning: { plain: "Traditional: engineering disconnected from ops. SRE: engineers carry pagers for what they ship.", whyExists: "Distance creates poor design choices for operability.", whyGoogle: "Pager pain is the fastest feedback loop.", misconceptions: ["SRE doesn't mean engineers always carry the pager forever."] },
    operational: { intro: "Engineering owns production by default; SRE engages services that earn it.", examples: [{ org: "Google", story: "Maturity bar gates SRE engagement." }] },
    patterns: { good: "Engineers on call.", better: "Engineers own SLOs.", best: "Reliability bar earns SRE partnership." },
    mistakes: [{ anti: "Throw it over the wall", consequence: "Bad design choices for operability." }],
    hhax: { headline: "Engineering ownership closes HHAX's design-to-operations feedback loop.", bullets: [{ area: "Per-Service", detail: "Engineers own production reliability for code they ship." }] },
  }),
  cmpRel: makeDrawer({
    id: "cmpRel", title: "Reliability Strategy", kicker: "Traditional vs SRE", icon: ShieldCheck, tone: "emerald",
    meaning: { plain: "Traditional: 'more 9s.' SRE: explicit targets and budgets aligned with business value.", whyExists: "100% is the wrong target; the right level is negotiated.", whyGoogle: "SLO/budget framework formalizes the tradeoff.", misconceptions: ["Higher targets are not always better."] },
    operational: { intro: "Targets reviewed quarterly with product and business.", examples: [{ org: "Industry", story: "Targets adjusted as user expectations evolve." }] },
    patterns: { good: "Defined per service.", better: "Reviewed quarterly.", best: "Aligned with business value and budget policy." },
    mistakes: [{ anti: "Aspirational targets no one believes", consequence: "Policy ignored; SLOs irrelevant." }],
    hhax: { headline: "Reliability becomes a strategic conversation across HHAX leadership.", bullets: [{ area: "Tiers", detail: "Targets reflect business criticality, not aspiration." }] },
  }),

  /* --- Section 7 HHAX --- */
  hhCurrentReactive: makeDrawer({
    id: "hhCurrentReactive", title: "Reactive Operations", kicker: "HHAX Current State", icon: Bell, tone: "rose",
    meaning: { plain: "Most operational work is responding to issues as they surface, rather than engineering them out.", whyExists: "Years of growth and acquisitions outpaced engineering investment in reliability.", whyGoogle: "SRE is the engineering response to reactive operating models.", misconceptions: [] },
    operational: { intro: "Pattern observed across HHAX engineering interviews.", examples: [{ org: "HHAX", story: "Recurring incident categories absorb on-call capacity weekly." }] },
    patterns: { good: "Categorize recurring incidents.", better: "Backlog for repeat causes.", best: "Engineering invests until categories disappear." },
    mistakes: [{ anti: "Hire to keep up", consequence: "Cost grows; reliability doesn't." }],
    hhax: { headline: "Moving from reactive to proactive is the central transformation goal.", bullets: [{ area: "Recurring Categories", detail: "Top categories targeted in reliability roadmap." }] },
  }),
  hhCurrentTickets: makeDrawer({
    id: "hhCurrentTickets", title: "Ticket-Driven Work", kicker: "HHAX Current State", icon: ClipboardList, tone: "rose",
    meaning: { plain: "Engineering capacity consumed by access, provisioning, and operational requests routed via tickets.", whyExists: "Tickets fill the gap left by missing self-service.", whyGoogle: "Platform engineering eliminates ticket categories.", misconceptions: [] },
    operational: { intro: "Observed across branch and caregiver workflows.", examples: [{ org: "HHAX", story: "High-volume ticket types catalogued during discovery." }] },
    patterns: { good: "Top types identified.", better: "Self-service replaces them.", best: "Service ownership eliminates entire categories." },
    mistakes: [{ anti: "SLA harder", consequence: "Cost up; reliability flat." }],
    hhax: { headline: "Self-service platforms reclaim engineering capacity.", bullets: [{ area: "Branch Ops", detail: "Access and provisioning self-serve." }] },
  }),
  hhCurrentInterrupt: makeDrawer({
    id: "hhCurrentInterrupt", title: "Heavy Interruptions", kicker: "HHAX Current State", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Engineering interrupted constantly by operational events, eroding flow and project delivery.", whyExists: "Lack of toil reduction and clear ownership.", whyGoogle: "Toil cap and ownership protect engineering time.", misconceptions: [] },
    operational: { intro: "Observed across product and platform teams.", examples: [{ org: "HHAX", story: "Engineers report majority of week consumed by ops interruptions." }] },
    patterns: { good: "Measure interruptions.", better: "Categorize and automate.", best: "Cap toil; protect engineering time." },
    mistakes: [{ anti: "Add 'just one more' on-call channel", consequence: "Capacity erodes further." }],
    hhax: { headline: "Reducing interruptions unlocks modernization capacity.", bullets: [{ area: "Flow Time", detail: "Engineering time protected for roadmap." }] },
  }),
  hhCurrentOwnership: makeDrawer({
    id: "hhCurrentOwnership", title: "Limited Service Ownership", kicker: "HHAX Current State", icon: Users, tone: "rose",
    meaning: { plain: "Services exist without consistently named owners; alerts route to shared inboxes.", whyExists: "Acquisitions and reorgs left gaps unfilled.", whyGoogle: "Service catalog and named ownership are foundational.", misconceptions: [] },
    operational: { intro: "Surfaced during discovery interviews.", examples: [{ org: "HHAX", story: "Several Tier-1 services lacked clear owner during walkthrough." }] },
    patterns: { good: "Name owner per service.", better: "Owner accountable for SLOs and cost.", best: "Ownership in scorecards." },
    mistakes: [{ anti: "Wiki ownership", consequence: "Alerts orphan; MTTR climbs." }],
    hhax: { headline: "Ownership is the single highest-leverage change.", bullets: [{ area: "Catalog", detail: "Source of truth for ownership." }] },
  }),
  hhCurrentDebt: makeDrawer({
    id: "hhCurrentDebt", title: "High Technical Debt", kicker: "HHAX Current State", icon: AlertTriangle, tone: "rose",
    meaning: { plain: "Accumulated design and infrastructure debt across legacy and acquired platforms.", whyExists: "Years of velocity-first decisions without debt repayment.", whyGoogle: "Modernization roadmap repays debt deliberately.", misconceptions: [] },
    operational: { intro: "Observed across platform assessments.", examples: [{ org: "HHAX", story: "Debt categories surfaced during modernization workshops." }] },
    patterns: { good: "Inventory debt.", better: "Prioritized backlog.", best: "Budgeted repayment per quarter." },
    mistakes: [{ anti: "Defer indefinitely", consequence: "Velocity collapses." }],
    hhax: { headline: "Repaying debt enables platform and reliability investment.", bullets: [{ area: "Modernization", detail: "Repayment tied to roadmap." }] },
  }),
  hhCurrentFragmented: makeDrawer({
    id: "hhCurrentFragmented", title: "Fragmented Platforms", kicker: "HHAX Current State", icon: Layers, tone: "rose",
    meaning: { plain: "Multiple platforms from acquisitions operate with different tools, processes, and standards.", whyExists: "Each acquisition brought its own stack.", whyGoogle: "Platform engineering converges over time on golden paths.", misconceptions: [] },
    operational: { intro: "Observed across portfolio reviews.", examples: [{ org: "HHAX", story: "Disparate CI/CD, observability, and IAM stacks." }] },
    patterns: { good: "Inventory.", better: "Converge on golden paths.", best: "Platform team enables migration." },
    mistakes: [{ anti: "Rip-and-replace all at once", consequence: "Business disruption." }],
    hhax: { headline: "Convergence on golden paths reduces operational tax across the portfolio.", bullets: [{ area: "Golden Paths", detail: "Common CI/CD, observability, IAM." }] },
  }),
  hhCurrentManual: makeDrawer({
    id: "hhCurrentManual", title: "Manual Operations", kicker: "HHAX Current State", icon: Wrench, tone: "rose",
    meaning: { plain: "Significant operations performed manually — runbooks executed by humans, provisioning by ticket.", whyExists: "Automation investment trailed business growth.", whyGoogle: "Automation as product addresses this.", misconceptions: [] },
    operational: { intro: "Observed across ops walkthroughs.", examples: [{ org: "HHAX", story: "Common runbooks still hand-executed." }] },
    patterns: { good: "Identify top runbooks.", better: "Automate them.", best: "Self-healing on common patterns." },
    mistakes: [{ anti: "Add headcount", consequence: "Cost up; reliability flat." }],
    hhax: { headline: "Automation reclaims capacity and improves reliability simultaneously.", bullets: [{ area: "Runbooks", detail: "Top patterns automated first." }] },
  }),
  hhCurrentAcq: makeDrawer({
    id: "hhCurrentAcq", title: "Acquisition Complexity", kicker: "HHAX Current State", icon: Building2, tone: "rose",
    meaning: { plain: "Each acquisition adds platforms, teams, processes, and reliability postures that take time to integrate.", whyExists: "Without a repeatable integration model, each acquisition starts from scratch.", whyGoogle: "Standardized golden paths reduce integration time.", misconceptions: [] },
    operational: { intro: "Pattern observed across multiple acquisitions.", examples: [{ org: "HHAX", story: "Variable integration timelines and reliability outcomes per acquisition." }] },
    patterns: { good: "Document integration steps.", better: "Templated onboarding.", best: "Standardized acquisition factory." },
    mistakes: [{ anti: "Treat each acquisition as unique", consequence: "Slow integration; reliability variance." }],
    hhax: { headline: "An acquisition factory turns integration into a repeatable, fast process.", bullets: [{ area: "Factory", detail: "Standard templates and golden paths." }] },
  }),

  hhFutureOwnership: makeDrawer({
    id: "hhFutureOwnership", title: "Service Ownership", kicker: "HHAX Future State", icon: Users, tone: "emerald",
    meaning: { plain: "Every Tier-1 service has a named owning team, with SLOs, on-call, and a reliability roadmap.", whyExists: "Ownership closes feedback loops and ends 'no one owns it.'", whyGoogle: "Foundational SRE practice.", misconceptions: [] },
    operational: { intro: "Catalog as source of truth.", examples: [{ org: "Netflix", story: "'You build it, you run it.'" }] },
    patterns: { good: "Named team.", better: "Scope expanded to cost & security.", best: "Measured in scorecards." },
    mistakes: [{ anti: "Wiki ownership", consequence: "Alerts misroute." }],
    hhax: { headline: "Ownership is the single highest-leverage shift.", bullets: [{ area: "All Platforms", detail: "Consistent ownership across HHAX and acquisitions." }] },
  }),
  hhFutureReliable: makeDrawer({
    id: "hhFutureReliable", title: "Reliable Platforms", kicker: "HHAX Future State", icon: ShieldCheck, tone: "emerald",
    meaning: { plain: "Platforms operate within explicit SLOs and budgets, with measurable improvement quarter over quarter.", whyExists: "Predictability for customers and the business.", whyGoogle: "SLO/budget framework formalizes this.", misconceptions: [] },
    operational: { intro: "Reliability council reviews each quarter.", examples: [{ org: "Google", story: "Quarterly reliability reviews drive investment." }] },
    patterns: { good: "SLOs defined.", better: "Budgets enforced.", best: "Investment shifts based on data." },
    mistakes: [{ anti: "SLOs without policy", consequence: "Decoration." }],
    hhax: { headline: "Reliability becomes a measurable commitment to caregivers, branches, and payers.", bullets: [{ area: "Per-Platform", detail: "Quarterly reviews per platform." }] },
  }),
  hhFutureAuto: makeDrawer({
    id: "hhFutureAuto", title: "Automation", kicker: "HHAX Future State", icon: Cpu, tone: "emerald",
    meaning: { plain: "Operational work eliminated by self-healing platforms and self-service workflows.", whyExists: "Reclaim capacity; improve reliability.", whyGoogle: "Toil cap drives this.", misconceptions: [] },
    operational: { intro: "Automation backlog prioritized alongside features.", examples: [{ org: "Netflix", story: "Paved roads eliminate categories of toil." }] },
    patterns: { good: "Top items automated.", better: "Toil measured.", best: "Self-healing dominates response." },
    mistakes: [{ anti: "Personal scripts only", consequence: "Bus factor one." }],
    hhax: { headline: "Automation reclaims engineering capacity for modernization.", bullets: [{ area: "Self-Service", detail: "Replaces ticket queues." }] },
  }),
  hhFuturePlatform: makeDrawer({
    id: "hhFuturePlatform", title: "Platform Engineering", kicker: "HHAX Future State", icon: Boxes, tone: "emerald",
    meaning: { plain: "A dedicated platform team builds golden paths that reduce the operational tax for every product team.", whyExists: "Platforms scale; one-off enablement does not.", whyGoogle: "Platform engineering is the modern successor to internal tooling.", misconceptions: [] },
    operational: { intro: "Platform as product, with users, SLAs, and a roadmap.", examples: [{ org: "Spotify Backstage / Cortex / Port", story: "Catalog + golden paths." }] },
    patterns: { good: "Identify golden paths.", better: "Platform team owns them.", best: "Adoption measured." },
    mistakes: [{ anti: "Platform as ops dumping ground", consequence: "Anti-pattern; fails." }],
    hhax: { headline: "Platform engineering converges acquired platforms over time.", bullets: [{ area: "Golden Paths", detail: "Common CI/CD, observability, IAM." }] },
  }),
  hhFutureModern: makeDrawer({
    id: "hhFutureModern", title: "Modern Architecture", kicker: "HHAX Future State", icon: Code2, tone: "emerald",
    meaning: { plain: "Architecture aligned with current business and technology realities — cloud-native where it matters, with clear modernization priorities.", whyExists: "Legacy architecture caps reliability, velocity, and cost outcomes.", whyGoogle: "Modernization is a continuous discipline, not a project.", misconceptions: [] },
    operational: { intro: "Modernization roadmap aligned with reliability and platform investment.", examples: [{ org: "AWS / GCP customers", story: "Modernization tied to business outcomes." }] },
    patterns: { good: "Roadmap exists.", better: "Tied to debt repayment.", best: "Continuous modernization cadence." },
    mistakes: [{ anti: "Big-bang rewrite", consequence: "Business risk." }],
    hhax: { headline: "Modernization unlocks reliability, velocity, and cost wins simultaneously.", bullets: [{ area: "Roadmap", detail: "Aligned with reliability priorities." }] },
  }),
  hhFutureInt: makeDrawer({
    id: "hhFutureInt", title: "Integrated Acquisitions", kicker: "HHAX Future State", icon: Building2, tone: "emerald",
    meaning: { plain: "A repeatable acquisition factory integrates platforms, teams, and reliability standards predictably.", whyExists: "Each new acquisition adds operational tax without repeatability.", whyGoogle: "Standardized templates reduce integration cost.", misconceptions: [] },
    operational: { intro: "Templates and golden paths reduce ramp time.", examples: [{ org: "Industry", story: "Acquisition playbooks shared across portfolios." }] },
    patterns: { good: "Templates exist.", better: "Integration measured.", best: "Acquisition factory." },
    mistakes: [{ anti: "Treat each acquisition as unique", consequence: "Slow ramp." }],
    hhax: { headline: "An acquisition factory turns integration into a competitive advantage.", bullets: [{ area: "Factory", detail: "Standard templates per platform type." }] },
  }),
  hhFutureReduced: makeDrawer({
    id: "hhFutureReduced", title: "Reduced Interruptions", kicker: "HHAX Future State", icon: CheckCircle2, tone: "emerald",
    meaning: { plain: "Engineering time protected from operational interruptions through automation, ownership, and platforms.", whyExists: "Flow time is the leading indicator of delivery and reliability.", whyGoogle: "Toil cap exists for exactly this.", misconceptions: [] },
    operational: { intro: "Interruptions measured per team.", examples: [{ org: "Google", story: "Toil reports drive reallocation." }] },
    patterns: { good: "Measure.", better: "Reduce categories.", best: "Cap and enforce." },
    mistakes: [{ anti: "Normalize interruptions", consequence: "Capacity erodes." }],
    hhax: { headline: "Protected flow time unlocks roadmap delivery.", bullets: [{ area: "Per-Team", detail: "Interruption budget tracked." }] },
  }),
  hhFuturePredict: makeDrawer({
    id: "hhFuturePredict", title: "Predictable Operations", kicker: "HHAX Future State", icon: Activity, tone: "emerald",
    meaning: { plain: "Operations follow data-driven cadences with explicit targets, budgets, and reviews.", whyExists: "Predictability for customers, the business, and engineering teams.", whyGoogle: "SLO/budget framework drives predictability.", misconceptions: [] },
    operational: { intro: "Quarterly reliability reviews; weekly burn review.", examples: [{ org: "Google", story: "Cadence is the source of compounding improvement." }] },
    patterns: { good: "Cadence established.", better: "Cadence enforced.", best: "Cadence drives investment shifts." },
    mistakes: [{ anti: "Cadence without action", consequence: "Theater." }],
    hhax: { headline: "Predictable operations free leadership to invest in growth.", bullets: [{ area: "Reviews", detail: "Per-platform quarterly cadence." }] },
  }),
};

/* ===================== Drawer Component ===================== */

function ContextDrawer({
  open, onClose, content,
}: { open: boolean; onClose: () => void; content: DrawerContent | null }) {
  if (!content) return null;
  const Icon = content.icon;
  const t = TONE[content.tone];
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-[40vw] p-0 overflow-hidden bg-white">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className={`shrink-0 w-10 h-10 rounded-lg inline-flex items-center justify-center ${t.bg} ${t.text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">{content.kicker}</div>
              <SheetTitle className="text-base font-semibold text-slate-900">{content.title}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="meaning" className="flex flex-col h-[calc(100vh-92px)]">
          <TabsList className="mx-6 mt-3 bg-slate-100 rounded-lg flex flex-wrap gap-1 p-1 h-auto">
            <TabsTrigger value="meaning" className="text-[11px] px-2 py-1">What It Means</TabsTrigger>
            <TabsTrigger value="ops" className="text-[11px] px-2 py-1">Operational Reality</TabsTrigger>
            {content.metrics && <TabsTrigger value="metrics" className="text-[11px] px-2 py-1">Metrics</TabsTrigger>}
            <TabsTrigger value="patterns" className="text-[11px] px-2 py-1">Patterns</TabsTrigger>
            <TabsTrigger value="mistakes" className="text-[11px] px-2 py-1">Mistakes</TabsTrigger>
            <TabsTrigger value="hhax" className="text-[11px] px-2 py-1">HHAX Relevance</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto px-6 py-4 flex-1">
            <TabsContent value="meaning" className="mt-0 space-y-4">
              <Section label="In Plain Terms" body={content.meaning.plain} />
              <Section label="Why It Exists" body={content.meaning.whyExists} />
              <Section label="Why Google Created It" body={content.meaning.whyGoogle} />
              {content.meaning.misconceptions.length > 0 && (
                <div>
                  <Label>Common Misconceptions</Label>
                  <ul className="mt-2 space-y-2">
                    {content.meaning.misconceptions.map((m, i) => (
                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ops" className="mt-0 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">{content.operational.intro}</p>
              <div className="space-y-2">
                {content.operational.examples.map((e, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3 bg-white">
                    <div className="text-xs font-semibold text-slate-900">{e.org}</div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">{e.story}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {content.metrics && (
              <TabsContent value="metrics" className="mt-0 space-y-4">
                <Section label="Definition" body={content.metrics.definition} />
                {content.metrics.formula && <Section label="Formula" body={content.metrics.formula} mono />}
                <Section label="How Measured" body={content.metrics.measured} />
                <div>
                  <Label>Target Ranges</Label>
                  <div className="mt-2 space-y-2">
                    {content.metrics.targets.map((tt, i) => {
                      const statusTone = tt.status === "good" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : tt.status === "warn" ? "bg-amber-50 text-amber-700 border-amber-200"
                        : tt.status === "risk" ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-50 text-slate-700 border-slate-200";
                      return (
                        <div key={i} className={`rounded-lg border p-3 flex items-center justify-between ${statusTone}`}>
                          <div className="text-xs">{tt.label}</div>
                          <div className="text-xs font-semibold">{tt.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            )}

            <TabsContent value="patterns" className="mt-0 space-y-3">
              <PatternRow level="Good" body={content.patterns.good} tone="bg-slate-50 text-slate-700 border-slate-200" />
              <PatternRow level="Better" body={content.patterns.better} tone="bg-sky-50 text-sky-700 border-sky-200" />
              <PatternRow level="Best" body={content.patterns.best} tone="bg-emerald-50 text-emerald-700 border-emerald-200" />
            </TabsContent>

            <TabsContent value="mistakes" className="mt-0 space-y-3">
              {content.mistakes.map((m, i) => (
                <div key={i} className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-rose-800">{m.anti}</div>
                      <div className="text-xs text-rose-700 mt-1">{m.consequence}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="hhax" className="mt-0 space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-emerald-800 leading-relaxed">{content.hhax.headline}</div>
                </div>
              </div>
              <div className="space-y-2">
                {content.hhax.bullets.map((b, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3">
                    <div className="text-xs font-semibold text-slate-900">{b.area}</div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">{b.detail}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Section({ label, body, mono = false }: { label: string; body: string; mono?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className={`mt-1.5 text-xs text-slate-700 leading-relaxed ${mono ? "font-mono bg-slate-50 p-2 rounded border border-slate-200" : ""}`}>{body}</p>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">{children}</div>;
}
function PatternRow({ level, body, tone }: { level: string; body: string; tone: string }) {
  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <div className="text-[10px] uppercase tracking-wider font-semibold">{level}</div>
      <div className="text-xs mt-1 leading-relaxed">{body}</div>
    </div>
  );
}

/* ===================== Page ===================== */

const ATGLANCE = [
  { icon: Users,      title: "Engineering Led",       sub: "Operations run by engineers" },
  { icon: ShieldCheck,title: "Reliability as a Goal", sub: "Measure, manage, improve" },
  { icon: Cpu,        title: "Automation First",      sub: "Eliminate toil and manual work" },
  { icon: Heart,      title: "Customer Focused",      sub: "Reliability drives experience" },
];

const WHAT_CARDS = [
  { id: "serviceOwnership",     icon: Users,        title: "Service Ownership",      desc: "Named teams accountable for reliability end to end.", tone: "emerald" as Tone },
  { id: "reliabilityTargets",   icon: Target,       title: "Reliability Targets",    desc: "Measurable SLOs that define 'reliable enough.'", tone: "sky" as Tone },
  { id: "measurement",          icon: BarChart3,    title: "Measurement",            desc: "Telemetry at the user boundary, not infra checks.", tone: "violet" as Tone },
  { id: "automation",           icon: Cpu,          title: "Automation",             desc: "Toil identified, measured, and engineered away.", tone: "amber" as Tone },
  { id: "incidentResponse",     icon: AlertTriangle,title: "Incident Response",      desc: "Defined roles, structured response, blameless learning.", tone: "rose" as Tone },
  { id: "continuousImprovement",icon: RefreshCw,    title: "Continuous Improvement", desc: "Reliability backlog worked alongside features.", tone: "teal" as Tone },
];

const COMPARISON: { id: string; row: string; traditional: string; sre: string }[] = [
  { id: "cmpOps",      row: "Operations Model",       traditional: "Separate Dev and Ops",                  sre: "Engineering owns operations" },
  { id: "cmpOwn",      row: "Ownership",              traditional: "Ops owns production",                   sre: "Service teams own end to end" },
  { id: "cmpIncident", row: "Incident Management",    traditional: "Ad-hoc war room",                       sre: "Defined roles + blameless postmortem" },
  { id: "cmpChange",   row: "Change Management",      traditional: "CABs and freezes",                      sre: "Error budget governs pace" },
  { id: "cmpAuto",     row: "Automation",             traditional: "Scripts as personal tools",             sre: "Automation as product" },
  { id: "cmpMon",      row: "Monitoring",             traditional: "Threshold alerts on infrastructure",    sre: "SLO burn from user telemetry" },
  { id: "cmpCap",      row: "Capacity Planning",      traditional: "Spreadsheets",                          sre: "Data + forecasts + headroom" },
  { id: "cmpCust",     row: "Customer Focus",         traditional: "SLAs and uptime",                       sre: "SLOs tied to experience" },
  { id: "cmpEng",      row: "Engineering Involvement",traditional: "Disconnected from ops",                 sre: "Engineers carry pagers for what they ship" },
  { id: "cmpRel",      row: "Reliability Strategy",   traditional: "'More 9s'",                             sre: "Explicit targets + budgets aligned to value" },
];

const CONCEPT_TILES = [
  { id: "serviceOwnership", icon: Users,        title: "Service Ownership",      hover: "Named teams accountable for reliability — Netflix, Amazon, Google.", tone: "emerald" as Tone },
  { id: "sloDeep",          icon: Target,       title: "SLOs",                   hover: "Measurable targets from user telemetry — Google, LinkedIn.", tone: "sky" as Tone },
  { id: "errorBudgets",     icon: ShieldCheck,  title: "Error Budgets",          hover: "Budget governs release pace — Google's release framework.", tone: "amber" as Tone },
  { id: "toilReduction",    icon: Wrench,       title: "Toil Reduction",         hover: "Toil cap forces continuous automation — Google's 50% rule.", tone: "rose" as Tone },
  { id: "blamelessPostmortems", icon: BookOpen, title: "Blameless Postmortems",  hover: "Incidents become organizational learning — Etsy, Google.", tone: "violet" as Tone },
  { id: "observability",    icon: Eye,          title: "Observability",          hover: "Ask new questions in production — Honeycomb, Datadog.", tone: "teal" as Tone },
  { id: "automation",       icon: Cpu,          title: "Automation",             hover: "Self-healing systems and self-service — Netflix, AWS.", tone: "amber" as Tone },
  { id: "capacityPlanning", icon: TrendingUp,   title: "Capacity Planning",      hover: "Forecasts and headroom replace surprises — Google, AWS.", tone: "emerald" as Tone },
];

const LIFECYCLE = [
  { id: "lifeDefine",  step: 1, title: "Define Service",      icon: Layers,        tone: "slate" as Tone },
  { id: "lifeSLO",     step: 2, title: "Create SLOs",         icon: Target,        tone: "sky" as Tone },
  { id: "lifeMeasure", step: 3, title: "Measure Reliability", icon: BarChart3,     tone: "violet" as Tone },
  { id: "lifeBudget",  step: 4, title: "Manage Error Budget", icon: ShieldCheck,   tone: "amber" as Tone },
  { id: "lifeToil",    step: 5, title: "Reduce Toil",         icon: Wrench,        tone: "rose" as Tone },
  { id: "lifeLearn",   step: 6, title: "Learn From Incidents",icon: BookOpen,      tone: "violet" as Tone },
  { id: "lifeImprove", step: 7, title: "Continuously Improve",icon: RefreshCw,     tone: "teal" as Tone },
];

const METRIC_CARDS = [
  { id: "mAvail",      icon: Activity,      title: "Availability",        hover: "Successful requests ÷ valid requests" },
  { id: "mLatency",    icon: Clock,         title: "Latency",             hover: "p50, p95, p99 per journey" },
  { id: "mError",      icon: AlertTriangle, title: "Error Rate",          hover: "Failed requests ÷ valid requests" },
  { id: "mThroughput", icon: TrendingUp,    title: "Throughput",          hover: "Requests per second per service" },
  { id: "mMTTR",       icon: Clock,         title: "MTTR",                hover: "Mean time from detection to recovery" },
  { id: "mToilPct",    icon: Wrench,        title: "Toil %",              hover: "Manual work share of capacity" },
  { id: "mBurn",       icon: ShieldCheck,   title: "Error Budget Burn",   hover: "Budget consumption rate" },
  { id: "mSloComp",    icon: CheckCircle2,  title: "SLO Compliance",      hover: "Portfolio reliability posture" },
];

const ANTI_PATTERNS = [
  { id: "apHero",        title: "Hero Culture" },
  { id: "apTickets",     title: "Ticket Factories" },
  { id: "apMonNoOwn",    title: "Monitoring Without Ownership" },
  { id: "apTribal",      title: "Tribal Knowledge" },
  { id: "apToil",        title: "Excessive Toil" },
  { id: "apOvertime",    title: "Reliability Through Overtime" },
  { id: "apNoBudget",    title: "No Error Budgets" },
  { id: "apMonNoAction", title: "Monitoring Without Action" },
];

const HHAX_CURRENT = [
  { id: "hhCurrentReactive",   title: "Reactive Operations" },
  { id: "hhCurrentTickets",    title: "Ticket-Driven Work" },
  { id: "hhCurrentInterrupt",  title: "Heavy Interruptions" },
  { id: "hhCurrentOwnership",  title: "Limited Service Ownership" },
  { id: "hhCurrentDebt",       title: "High Technical Debt" },
  { id: "hhCurrentFragmented", title: "Fragmented Platforms" },
  { id: "hhCurrentManual",     title: "Manual Operations" },
  { id: "hhCurrentAcq",        title: "Acquisition Complexity" },
];

const HHAX_FUTURE = [
  { id: "hhFutureOwnership", title: "Service Ownership" },
  { id: "hhFutureReliable",  title: "Reliable Platforms" },
  { id: "hhFutureAuto",      title: "Automation" },
  { id: "hhFuturePlatform",  title: "Platform Engineering" },
  { id: "hhFutureModern",    title: "Modern Architecture" },
  { id: "hhFutureInt",       title: "Integrated Acquisitions" },
  { id: "hhFutureReduced",   title: "Reduced Interruptions" },
  { id: "hhFuturePredict",   title: "Predictable Operations" },
];

export default function GoogleSre() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredLifecycle, setHoveredLifecycle] = useState<number | null>(null);

  const open = (id: string) => setActiveId(id);
  const close = () => setActiveId(null);
  const content = useMemo(() => (activeId ? D[activeId] ?? null : null), [activeId]);

  useEffect(() => { document.title = "Google SRE — Reliability Engineering Discipline"; }, []);

  return (
    <AppShell>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto p-6 space-y-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/reliability-foundations" className="hover:text-slate-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Enterprise Operating Shifts
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>Foundational Disciplines</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-700 font-semibold">Google SRE</span>
          </div>

          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 inline-flex items-center justify-center ring-1 ring-emerald-200">
                  <Gauge className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Google SRE</h1>
                  <div className="text-base text-slate-600 mt-1">Reliability Engineering Discipline</div>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-700 leading-relaxed max-w-3xl">
                Site Reliability Engineering applies software engineering principles to operations to create reliable,
                scalable, and resilient digital services. It replaces ticket-driven, reactive operating models with
                engineering-led service ownership, measurable reliability targets, error budgets, and continuous
                automation of operational work.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">Engineering Discipline</Badge>
                <Badge variant="secondary" className="bg-sky-50 text-sky-700 border border-sky-200">Prevention Over Reaction</Badge>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-200">SLO + Error Budget</Badge>
                <Badge variant="secondary" className="bg-violet-50 text-violet-700 border border-violet-200">Service Ownership</Badge>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">At A Glance</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {ATGLANCE.map(({ icon: I, title, sub }) => (
                  <div key={title} className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition-all">
                    <I className="w-4 h-4 text-emerald-600" />
                    <div className="text-xs font-semibold text-slate-900 mt-2">{title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 1 - What Is SRE */}
          <SectionHeader number="01" title="What Is SRE" subtitle="The core practices that define Site Reliability Engineering. Click any card to open the learning drawer." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {WHAT_CARDS.map((c) => (
              <ConceptCard key={c.id} id={c.id} icon={c.icon} title={c.title} desc={c.desc} tone={c.tone} onOpen={open} />
            ))}
          </div>

          {/* SECTION 2 - Comparison */}
          <SectionHeader number="02" title="Traditional Operations vs Google SRE" subtitle="Click any row to compare approaches, tradeoffs, and real-world examples." />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <div className="col-span-3">Dimension</div>
              <div className="col-span-4">Traditional Approach</div>
              <div className="col-span-4">SRE Approach</div>
              <div className="col-span-1 text-right">Detail</div>
            </div>
            {COMPARISON.map((r, i) => (
              <button
                key={r.id}
                onClick={() => open(r.id)}
                className={`w-full text-left grid grid-cols-12 px-4 py-3 items-center transition-colors hover:bg-emerald-50/40 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
              >
                <div className="col-span-3 text-xs font-semibold text-slate-900">{r.row}</div>
                <div className="col-span-4 text-xs text-slate-600">{r.traditional}</div>
                <div className="col-span-4 text-xs text-emerald-700">{r.sre}</div>
                <div className="col-span-1 flex justify-end"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></div>
              </button>
            ))}
          </div>

          {/* SECTION 3 - Core Concepts */}
          <SectionHeader number="03" title="Core Concepts" subtitle="The engineering primitives that make SRE actually work. Hover for context, click for the full learning drawer." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CONCEPT_TILES.map((c) => (
              <ConceptTile key={c.id + c.title} id={c.id} icon={c.icon} title={c.title} hover={c.hover} tone={c.tone} onOpen={open} />
            ))}
          </div>

          {/* SECTION 4 - Lifecycle */}
          <SectionHeader number="04" title="SRE Lifecycle" subtitle="How SRE operates as a continuous discipline. Hover to trace connections; click a step to open the deep dive." />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex flex-wrap items-stretch justify-center gap-2">
              {LIFECYCLE.map((s, i) => {
                const isHovered = hoveredLifecycle === i;
                const isNeighbor = hoveredLifecycle != null && Math.abs(hoveredLifecycle - i) <= 1;
                const t = TONE[s.tone];
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex items-center">
                    <button
                      onMouseEnter={() => setHoveredLifecycle(i)}
                      onMouseLeave={() => setHoveredLifecycle(null)}
                      onClick={() => open(s.id)}
                      className={[
                        "group rounded-xl border bg-white p-3 w-32 transition-all text-left",
                        "border-slate-200 hover:shadow-md hover:-translate-y-0.5",
                        isHovered ? `ring-2 ${t.ring}` : "",
                        hoveredLifecycle != null && !isNeighbor ? "opacity-50" : "",
                      ].join(" ")}
                    >
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${t.bg} ${t.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-2">Step {s.step}</div>
                      <div className="text-xs font-semibold text-slate-900 mt-0.5 leading-tight">{s.title}</div>
                    </button>
                    {i < LIFECYCLE.length - 1 && (
                      <ArrowRight className={`w-4 h-4 mx-1 transition-colors ${hoveredLifecycle != null && (hoveredLifecycle === i || hoveredLifecycle === i + 1) ? "text-emerald-500" : "text-slate-300"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-xs text-slate-500">
              {hoveredLifecycle != null ? (
                <span>Focusing on <span className="font-semibold text-slate-700">Step {LIFECYCLE[hoveredLifecycle].step}: {LIFECYCLE[hoveredLifecycle].title}</span></span>
              ) : "Hover any step to trace connected steps."}
            </div>
          </div>

          {/* SECTION 5 - Metrics */}
          <SectionHeader number="05" title="Metrics That Matter" subtitle="The reliability metrics SRE teams actually use. Click any metric for a deep dive." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {METRIC_CARDS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => open(m.id)}
                  className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300"
                  title={m.hover}
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-3">{m.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">{m.hover}</div>
                </button>
              );
            })}
          </div>

          {/* SECTION 6 - Anti-patterns */}
          <SectionHeader number="06" title="Common Anti-Patterns" subtitle="Patterns to actively avoid. Click any anti-pattern to understand the trap, the cost, and the recovery." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ANTI_PATTERNS.map((a) => (
              <button
                key={a.id}
                onClick={() => open(a.id)}
                className="group rounded-xl border border-rose-200 bg-rose-50/40 p-4 text-left transition-all hover:shadow-md hover:bg-rose-50 hover:-translate-y-0.5"
              >
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 text-rose-700 group-hover:animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-rose-900 mt-3">{a.title}</div>
                <div className="text-[11px] text-rose-700/80 mt-1">Click to learn more</div>
              </button>
            ))}
          </div>

          {/* SECTION 7 - Why this matters to HHAX */}
          <SectionHeader number="07" title="Why This Matters To HHAX" subtitle="From current state to desired future state. Click any item for the contextual HHAX explanation." />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="text-xs font-semibold uppercase tracking-wider text-rose-700">Current State</div>
                </div>
                <div className="space-y-2">
                  {HHAX_CURRENT.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => open(h.id)}
                      className="w-full text-left rounded-lg border border-rose-200 bg-rose-50/40 p-3 transition-all hover:shadow-sm hover:bg-rose-50 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-rose-900">{h.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Desired Future State</div>
                </div>
                <div className="space-y-2">
                  {HHAX_FUTURE.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => open(h.id)}
                      className="w-full text-left rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 transition-all hover:shadow-sm hover:bg-emerald-50 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-emerald-900">{h.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  SRE is the engineering discipline that connects HHAX's modernization, platform engineering, automation,
                  acquisition integration, and reliability goals into a single operating model. It is the bridge from
                  reactive, ticket-driven operations to proactive, engineering-owned reliability — the foundation the
                  rest of the transformation depends on.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Further reading</span> · Google SRE Book · Google Cloud SRE Workbook · Implementing Service Level Objectives
            </div>
            <Link to="/reliability-foundations" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Disciplines
            </Link>
          </div>
        </div>

        <ContextDrawer open={!!activeId} onClose={close} content={content} />
      </div>
    </AppShell>
  );
}

/* ===================== Card sub-components ===================== */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-end justify-between gap-4 pt-2">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-500">Section {number}</div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ConceptCard({
  id, icon: Icon, title, desc, tone, onOpen,
}: { id: string; icon: LucideIcon; title: string; desc: string; tone: Tone; onOpen: (id: string) => void }) {
  const t = TONE[tone];
  return (
    <button
      onClick={() => onOpen(id)}
      className="group text-left rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${t.bg} ${t.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-600 leading-relaxed">{desc}</div>
      <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
        Open learning drawer <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function ConceptTile({
  id, icon: Icon, title, hover, tone, onOpen,
}: { id: string; icon: LucideIcon; title: string; hover: string; tone: Tone; onOpen: (id: string) => void }) {
  const t = TONE[tone];
  return (
    <button
      onClick={() => onOpen(id)}
      className="group text-left rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300"
    >
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${t.bg} ${t.text}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-sm font-semibold text-slate-900 mt-3">{title}</div>
      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{hover}</div>
    </button>
  );
}
