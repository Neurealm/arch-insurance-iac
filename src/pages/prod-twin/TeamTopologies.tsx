import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Users, Wrench, Layers, Code2, ArrowRight, ArrowLeft, Sparkles,
  Boxes, Workflow, Target, ShieldCheck, BarChart3, Gauge, Building2,
  ClipboardList, AlertTriangle, CheckCircle2, XCircle, Activity,
  Cpu, Cloud, Database, Eye, GitBranch, DollarSign, Palette, BookOpen,
  type LucideIcon,
} from "lucide-react";

/* ===================== Types ===================== */

type Tone = "sky" | "emerald" | "violet" | "amber" | "rose" | "teal" | "slate";

const TONE: Record<Tone, { bg: string; text: string; ring: string; chip: string; border: string; soft: string }> = {
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-300",     chip: "bg-sky-100 text-sky-800",         border: "border-sky-200",     soft: "bg-sky-50/60" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-300", chip: "bg-emerald-100 text-emerald-800", border: "border-emerald-200", soft: "bg-emerald-50/60" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-300",  chip: "bg-violet-100 text-violet-800",   border: "border-violet-200",  soft: "bg-violet-50/60" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-300",   chip: "bg-amber-100 text-amber-800",     border: "border-amber-200",   soft: "bg-amber-50/60" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-300",    chip: "bg-rose-100 text-rose-800",       border: "border-rose-200",    soft: "bg-rose-50/60" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    ring: "ring-teal-300",    chip: "bg-teal-100 text-teal-800",       border: "border-teal-200",    soft: "bg-teal-50/60" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-700",   ring: "ring-slate-300",   chip: "bg-slate-100 text-slate-800",     border: "border-slate-200",   soft: "bg-slate-50/60" },
};

type DrawerContent = {
  id: string;
  title: string;
  kicker: string;
  icon: LucideIcon;
  tone: Tone;
  overview: {
    purpose: string;
    whyExists: string;
    problem: string;
    differs: string;
  };
  responsibilities: {
    owns: string[];
    doesNotOwn: string[];
    backlog: string[];
    deliverables: string[];
    decisionRights: string[];
  };
  collaboration: {
    interacts: { team: string; mode: "Collaboration" | "X-as-a-Service" | "Facilitating"; detail: string }[];
    workflow: string;
    antiPatterns: string[];
  };
  skills: {
    roles: string[];
    skillMix: string;
    size: string;
    leadership: string;
    capabilityNotes: string;
  };
  kpis: {
    primary: { name: string; current: string; target: string; forecast: string }[];
    secondary: string[];
    success: string[];
    dysfunction: string[];
  };
  hhax: {
    headline: string;
    bullets: { area: string; detail: string }[];
  };
  artifacts: string[];
  antiPatterns: { anti: string; consequence: string }[];
  implementation: {
    d30: string[];
    d90: string[];
    m6: string[];
    m12: string[];
  };
};

/* ===================== Drawer content library ===================== */

const D: Record<string, DrawerContent> = {
  streamAligned: {
    id: "streamAligned",
    title: "Stream-Aligned Team",
    kicker: "Primary value-delivery team",
    icon: Workflow, tone: "sky",
    overview: {
      purpose: "Deliver value to customers through a defined product, service, workflow, or value stream — end to end.",
      whyExists: "Most value flows through a small number of customer-facing streams. Aligning a long-lived team to each one removes handoffs and creates a tight loop from customer signal to production change.",
      problem: "Functional silos cause queues, ticket bouncing, and unclear ownership. Stream-aligned teams collapse the path from idea to production.",
      differs: "Unlike project teams or component teams, stream-aligned teams are long-lived, own production, and are accountable for outcomes — not output.",
    },
    responsibilities: {
      owns: [
        "Customer-facing product / value stream",
        "Roadmap, backlog, and prioritization",
        "Production reliability and on-call",
        "SLOs, error budget, and customer impact",
        "Cost of running the service",
      ],
      doesNotOwn: [
        "Underlying platform internals (consume as-a-service)",
        "Shared security guardrails (consume from Platform/Security)",
        "Deep specialist subsystems (consume from Complicated Subsystem)",
      ],
      backlog: [
        "Customer features", "Reliability work", "Tech debt paydown",
        "Toil reduction", "Observability improvements",
      ],
      deliverables: [
        "Working service in production", "SLO compliance", "Incident postmortems",
        "Roadmap outcomes", "Customer NPS / satisfaction",
      ],
      decisionRights: [
        "Architecture within the service", "Sprint priorities",
        "Release timing", "On-call escalation",
      ],
    },
    collaboration: {
      interacts: [
        { team: "Platform Teams", mode: "X-as-a-Service", detail: "Consume CI/CD, observability, landing zones, and golden paths." },
        { team: "Enabling Teams", mode: "Facilitating", detail: "Time-boxed coaching to adopt SRE, DevSecOps, or FinOps practices." },
        { team: "Complicated Subsystem", mode: "X-as-a-Service", detail: "Consume specialist capabilities (policy engine, identity federation)." },
        { team: "Other Stream Teams", mode: "Collaboration", detail: "Short bursts when value streams cross — e.g., Member + Claims." },
      ],
      workflow: "Customer signal → backlog → build → deploy via platform → run in production → measure SLO → learn.",
      antiPatterns: [
        "Stream team does not own production (handed to Ops)",
        "Stream team becomes a feature factory with no reliability budget",
        "Permanent collaboration with platform team (platform should be self-service)",
      ],
    },
    skills: {
      roles: ["Product Owner", "Tech Lead", "Engineers (FE/BE)", "SRE", "QA", "UX", "Data"],
      skillMix: "Cross-functional, T-shaped engineers, embedded reliability and quality.",
      size: "5–9 people (one or two pizza teams).",
      leadership: "Product Owner + Tech Lead, supported by an Engineering Manager.",
      capabilityNotes: "Add capabilities only when they appear in the steady-state value stream — not for one-off projects.",
    },
    kpis: {
      primary: [
        { name: "Deployment Frequency", current: "Weekly", target: "Daily", forecast: "5×" },
        { name: "Lead Time for Change", current: "2 weeks", target: "< 1 day", forecast: "-60%" },
        { name: "Change Failure Rate", current: "18%", target: "< 5%", forecast: "-70%" },
        { name: "MTTR", current: "4 hrs", target: "< 1 hr", forecast: "-50%" },
      ],
      secondary: ["SLO attainment", "Error budget burn", "Customer satisfaction", "On-call load per engineer"],
      success: ["Owns production", "Hits SLOs", "Releases small and often", "Customer outcomes visible"],
      dysfunction: ["Constantly blocked by other teams", "Tickets thrown over the wall", "Reliability is someone else's job"],
    },
    hhax: {
      headline: "Stream-aligned teams map directly to HHAX's customer value streams.",
      bullets: [
        { area: "Caregiver Mobile Experience", detail: "One team owns mobile end-to-end: app, APIs, EVV reliability." },
        { area: "Claims & Payments", detail: "Long-lived team owns claim intake through payment, including SLOs." },
        { area: "Provider Experience", detail: "Owns the provider portal journey across acquired platforms." },
        { area: "Member Services", detail: "Customer-facing team owns the digital member journey." },
      ],
    },
    artifacts: ["Team Charter", "Service Ownership Matrix", "Value Stream Map", "SLO Definitions", "RACI", "On-call Runbook"],
    antiPatterns: [
      { anti: "Project-based stream team", consequence: "Knowledge and ownership evaporate at project end." },
      { anti: "Stream team without production access", consequence: "Reliability decisions decouple from design." },
    ],
    implementation: {
      d30: ["Identify top 3 value streams", "Name an owning team per stream", "Define initial SLOs"],
      d90: ["Move on-call to stream team", "Establish weekly reliability review", "Stand up first golden path"],
      m6: ["All Tier-1 services have a stream-aligned owner", "Error budget policy live", "Deployment cadence 2× starting baseline"],
      m12: ["Daily deploys", "MTTR <1hr", "Tech debt budget institutionalized"],
    },
  },

  enabling: {
    id: "enabling",
    title: "Enabling Team",
    kicker: "Coaches capability adoption",
    icon: Sparkles, tone: "violet",
    overview: {
      purpose: "Help stream-aligned and other teams adopt new capabilities, patterns, tools, and practices.",
      whyExists: "New disciplines (SRE, FinOps, DevSecOps, Cloud) require coaching — not a permanent dependency. Enabling teams accelerate adoption then step back.",
      problem: "Without enabling teams, new practices stall or become bottlenecks owned by a central group that becomes a queue.",
      differs: "Unlike a center of excellence, enabling teams are time-bounded in any one engagement and measured by how quickly they leave.",
    },
    responsibilities: {
      owns: [
        "Coaching engagements with stream teams",
        "Reference implementations and patterns",
        "Internal training and enablement content",
        "Adoption metrics for the practice",
      ],
      doesNotOwn: [
        "Production services for stream teams",
        "Permanent operational responsibility",
        "Tooling that should live in a platform",
      ],
      backlog: [
        "Coaching engagements", "Pattern library", "Workshops",
        "Office hours", "Adoption playbooks",
      ],
      deliverables: ["Adoption maturity uplift", "Reference patterns", "Trained champions inside stream teams"],
      decisionRights: ["Recommended practices for the discipline", "Engagement scope and exit criteria"],
    },
    collaboration: {
      interacts: [
        { team: "Stream-Aligned", mode: "Facilitating", detail: "Time-boxed coaching on SRE, FinOps, DevSecOps." },
        { team: "Platform Teams", mode: "Collaboration", detail: "Codify accepted patterns into platform golden paths." },
        { team: "Other Enabling Teams", mode: "Collaboration", detail: "Cross-discipline campaigns (e.g., reliability + cost)." },
      ],
      workflow: "Identify capability gap → engage stream team → coach → leave artifacts → measure adoption → exit.",
      antiPatterns: [
        "Enabling team becomes permanent for one stream",
        "Coaching with no exit criteria",
        "Enabling team owns tooling instead of platform team",
      ],
    },
    skills: {
      roles: ["Discipline Coach", "Senior Engineer", "Practice Lead"],
      skillMix: "Deep expertise + teaching ability. Strong written communication.",
      size: "3–6 people.",
      leadership: "Practice Lead reporting into engineering org.",
      capabilityNotes: "Rotate experienced engineers from stream teams in and out to spread practice knowledge.",
    },
    kpis: {
      primary: [
        { name: "Teams Coached", current: "2/qtr", target: "6/qtr", forecast: "3×" },
        { name: "Engagement Exit Rate", current: "40%", target: "> 80%", forecast: "2×" },
        { name: "Practice Maturity Uplift", current: "Level 1", target: "Level 3", forecast: "+2" },
      ],
      secondary: ["Pattern reuse", "Champion network size", "Training NPS"],
      success: ["Exits engagements cleanly", "Stream teams self-sufficient post-engagement"],
      dysfunction: ["Long-running engagements", "Owns production work", "Becomes a help desk"],
    },
    hhax: {
      headline: "Enabling teams accelerate HHAX's shift from ticket-driven ops to engineering practices.",
      bullets: [
        { area: "SRE Enablement", detail: "Coach acquired teams on SLOs, error budgets, blameless postmortems." },
        { area: "Cloud Enablement", detail: "Help workloads adopt AWS/GCP landing zones and reference patterns." },
        { area: "DevSecOps Enablement", detail: "Embed security testing into CI/CD across acquired platforms." },
        { area: "FinOps Enablement", detail: "Coach product teams on cost visibility and tagging discipline." },
      ],
    },
    artifacts: ["Coaching Engagement Charter", "Pattern Library", "Maturity Model", "Exit Criteria Checklist"],
    antiPatterns: [
      { anti: "Permanent embed", consequence: "Stream team never builds the muscle themselves." },
      { anti: "Owns tooling", consequence: "Becomes a platform team without the engineering investment." },
    ],
    implementation: {
      d30: ["Define discipline scope", "Recruit 2–3 senior coaches", "Pick first 2 stream teams"],
      d90: ["Run first engagements with explicit exit criteria", "Publish pattern library v1"],
      m6: ["Cross-team champion network in place", "Adoption metrics dashboard"],
      m12: ["Practice maturity averages Level 3 across critical streams"],
    },
  },

  complicated: {
    id: "complicated",
    title: "Complicated Subsystem Team",
    kicker: "Specialist depth, protects cognitive load",
    icon: Layers, tone: "amber",
    overview: {
      purpose: "Own specialized systems requiring deep expertise that would overload stream-aligned teams.",
      whyExists: "Some subsystems (rules engines, mainframe adapters, ML pipelines, integration engines) are inherently complex. Embedding them in stream teams overwhelms cognitive load.",
      problem: "When complexity isn't isolated, every stream team must hire scarce specialists, slowing all of them.",
      differs: "Unlike a platform team, the subsystem isn't broadly reused — it's deep, specialized, and consumed by a small set of streams.",
    },
    responsibilities: {
      owns: ["Specialized subsystem behavior", "API contracts", "Deep specialist knowledge", "Subsystem reliability and evolution"],
      doesNotOwn: ["End-user experience", "Broad platform tooling", "Cross-cutting platform concerns"],
      backlog: ["Subsystem capability roadmap", "Performance and accuracy improvements", "API evolution"],
      deliverables: ["Stable subsystem APIs", "Specialist runbooks", "Capacity and performance baselines"],
      decisionRights: ["Internal subsystem architecture", "Specialist hiring profile"],
    },
    collaboration: {
      interacts: [
        { team: "Stream-Aligned", mode: "X-as-a-Service", detail: "Stream teams consume the subsystem via stable APIs." },
        { team: "Platform Teams", mode: "Collaboration", detail: "Use platform CI/CD, observability, security." },
        { team: "Enabling Teams", mode: "Facilitating", detail: "Adopt modern engineering practices internally." },
      ],
      workflow: "Stream team need → API contract → subsystem delivers as a service → measured by API SLO.",
      antiPatterns: [
        "Becomes a bottleneck for every stream team",
        "API surface grows ad-hoc per consumer",
        "Loses specialist expertise to attrition",
      ],
    },
    skills: {
      roles: ["Domain Specialist", "Senior Engineer", "Architect"],
      skillMix: "Deep, narrow expertise plus modern engineering practice.",
      size: "4–8 people.",
      leadership: "Tech Lead with subsystem authority.",
      capabilityNotes: "Plan succession deliberately — specialist knowledge is fragile.",
    },
    kpis: {
      primary: [
        { name: "API SLO Attainment", current: "97%", target: "99.5%", forecast: "+2.5pt" },
        { name: "Consumer Wait Time", current: "3 weeks", target: "< 3 days", forecast: "-85%" },
        { name: "Specialist Coverage", current: "2 people", target: "≥ 4", forecast: "2×" },
      ],
      secondary: ["API stability", "Change failure rate", "Documentation freshness"],
      success: ["Consumed via stable APIs", "Predictable evolution", "No queue of waiting streams"],
      dysfunction: ["Every change requires ticket", "Heroics keep it running", "Bus factor of 1"],
    },
    hhax: {
      headline: "Isolate HHAX's specialized systems so stream teams stay focused on customer value.",
      bullets: [
        { area: "Policy Engine", detail: "Specialist team owns complex business-rule engine consumed by Claims, Eligibility." },
        { area: "Legacy Database Modernization", detail: "Deep DBAs evolve schemas without burdening every stream team." },
        { area: "Integration Engine", detail: "EDI / clearinghouse / Sandata integration as a service." },
        { area: "Identity Federation", detail: "Federation across acquired tenants without each team rebuilding it." },
      ],
    },
    artifacts: ["API Contract", "Subsystem Runbook", "Specialist Skills Matrix", "Succession Plan"],
    antiPatterns: [
      { anti: "Becomes a ticket queue", consequence: "Latency for every consumer; reverses the cognitive-load win." },
      { anti: "Specialist hoarding", consequence: "Knowledge concentrated in one person; high outage risk." },
    ],
    implementation: {
      d30: ["Identify true 'complicated' subsystems vs. just legacy", "Form team around each"],
      d90: ["Publish stable API contracts", "Stand up API SLOs"],
      m6: ["Documented succession + cross-training", "Consumer waitlist eliminated"],
      m12: ["Subsystems evolve independently without cascading changes"],
    },
  },

  platform: {
    id: "platform",
    title: "Platform Team",
    kicker: "Self-service capability provider",
    icon: Boxes, tone: "emerald",
    overview: {
      purpose: "Provide reusable internal services and self-service capabilities that accelerate stream-aligned delivery.",
      whyExists: "Every stream team rebuilding CI/CD, observability, and cloud landing zones is waste. Platforms turn common capability into a product.",
      problem: "Without a platform, each stream invents its own toolchain; with a bad platform, the team becomes a ticket queue.",
      differs: "A platform is a product with users (internal engineers). Success is adoption and TTV, not tickets closed.",
    },
    responsibilities: {
      owns: [
        "Internal Developer Platform (IDP)",
        "Cloud landing zones",
        "CI/CD golden paths",
        "Observability platform",
        "Security guardrails",
        "Developer experience metrics",
      ],
      doesNotOwn: [
        "Application code", "Stream team production",
        "Bespoke one-off automations for a single team",
      ],
      backlog: ["Platform features", "Golden paths", "Documentation", "Self-service workflows"],
      deliverables: ["Platform product", "Reference architectures", "Onboarding experience"],
      decisionRights: ["Platform roadmap", "Supported patterns", "Deprecation policy"],
    },
    collaboration: {
      interacts: [
        { team: "Stream-Aligned", mode: "X-as-a-Service", detail: "Stream teams self-serve via API, CLI, portal." },
        { team: "Enabling Teams", mode: "Collaboration", detail: "Codify proven patterns into platform features." },
        { team: "Security / Compliance", mode: "Collaboration", detail: "Embed guardrails into golden paths." },
      ],
      workflow: "Treat platform as a product → user research with stream teams → ship features → measure adoption + DX.",
      antiPatterns: [
        "Platform becomes a ticket queue",
        "Platform team owns app deployments",
        "Mandated platform with poor DX → shadow tooling",
      ],
    },
    skills: {
      roles: ["Platform PM", "Platform Engineers", "SRE", "DX Engineer", "Tech Writer"],
      skillMix: "Product mindset + strong engineering + empathy for internal users.",
      size: "6–12 people per platform.",
      leadership: "Platform PM partners with Tech Lead.",
      capabilityNotes: "Hire a writer early — docs are part of the product.",
    },
    kpis: {
      primary: [
        { name: "Time-to-First-Deploy", current: "4 weeks", target: "< 1 day", forecast: "20×" },
        { name: "Platform Adoption", current: "30%", target: "> 90%", forecast: "3×" },
        { name: "DX NPS", current: "+10", target: "> +40", forecast: "4×" },
        { name: "Self-Service Ratio", current: "55%", target: "> 95%", forecast: "+40pt" },
      ],
      secondary: ["Golden path coverage", "Doc freshness", "Support load per engineer"],
      success: ["Stream teams choose the platform", "Self-service is the default", "Low support load"],
      dysfunction: ["Tickets pile up", "Stream teams build their own pipelines", "DX NPS declining"],
    },
    hhax: {
      headline: "Platforms are the leverage point for HHAX to standardize across acquired estates.",
      bullets: [
        { area: "Cloud Platform", detail: "Landing zones for AWS + GCP with embedded guardrails for acquired workloads." },
        { area: "Observability Platform", detail: "Unified logs, traces, metrics across acquired tenants." },
        { area: "SRE Platform", detail: "SLO tooling, error-budget policy, release automation." },
        { area: "Security Platform", detail: "Identity, secrets, policy-as-code consumed by every stream." },
        { area: "Data Platform", detail: "Self-serve data products bridging acquired data estates." },
      ],
    },
    artifacts: ["Platform Service Catalog", "Golden Path Definitions", "Adoption Dashboard", "DX Survey", "Deprecation Calendar"],
    antiPatterns: [
      { anti: "Ticket queue platform", consequence: "Stream teams blocked; platform burns out." },
      { anti: "Build-and-pray", consequence: "Platform without user research → low adoption, shadow tooling." },
    ],
    implementation: {
      d30: ["Treat platform as a product", "Hire/identify PM + DX engineer", "Pick first 2 golden paths"],
      d90: ["Ship landing zone v1", "Stand up adoption dashboard", "Onboard pilot stream teams"],
      m6: ["Self-service ratio > 80%", "DX NPS measured monthly"],
      m12: ["Platform underpins every Tier-1 service", "TTV measured in hours, not weeks"],
    },
  },
};

/* ===================== Page ===================== */

type TeamId = "streamAligned" | "enabling" | "complicated" | "platform";

const TEAMS: { id: TeamId; name: string; tone: Tone; tagline: string; icon: LucideIcon }[] = [
  { id: "streamAligned", name: "Stream-Aligned Team", tone: "sky",     tagline: "Deliver value through flow of work", icon: Workflow },
  { id: "enabling",      name: "Enabling Team",       tone: "violet",  tagline: "Build and accelerate capability",    icon: Sparkles },
  { id: "complicated",   name: "Complicated Subsystem Team", tone: "amber", tagline: "Own specialist depth",          icon: Layers   },
  { id: "platform",      name: "Platform Team",       tone: "emerald", tagline: "Provide self-service foundation",    icon: Boxes    },
];

const CAPABILITIES = [
  { id: "product",   name: "Product Thinking",         icon: Target,       team: "Stream-Aligned",          how: "Frames work around customer outcomes, not output." },
  { id: "domain",    name: "Domain Expertise",         icon: BookOpen,     team: "Stream-Aligned / Complicated", how: "Encodes business knowledge into services." },
  { id: "swe",       name: "Software Engineering",     icon: Code2,        team: "All",                     how: "Builds, evolves, and operates code in production." },
  { id: "devops",    name: "DevOps & Reliability",     icon: GitBranch,    team: "Stream-Aligned / Platform", how: "Owns CI/CD, SLOs, on-call." },
  { id: "data",      name: "Data Engineering",         icon: Database,     team: "Platform / Stream",       how: "Self-serve, governed data products." },
  { id: "sec",       name: "Security Engineering",     icon: ShieldCheck,  team: "Platform / Enabling",     how: "Guardrails in golden paths, not gates." },
  { id: "ux",        name: "UX & Design",              icon: Palette,      team: "Stream-Aligned",          how: "Reduces user friction in customer journeys." },
  { id: "quality",   name: "Quality Engineering",      icon: CheckCircle2, team: "Stream-Aligned",          how: "Quality designed in, not inspected in." },
  { id: "observ",    name: "Observability & Monitoring", icon: Eye,        team: "Platform / Stream",       how: "See what customers see, before they see it." },
  { id: "cloud",     name: "Cloud Architecture",       icon: Cloud,        team: "Platform",                how: "Landing zones, multi-region, hybrid placement." },
  { id: "finops",    name: "FinOps",                   icon: DollarSign,   team: "Enabling / Stream",       how: "Cost transparency for engineering choices." },
  { id: "automation",name: "Automation Engineering",   icon: Cpu,          team: "Platform / Enabling",     how: "Toil reduction at scale." },
];

const COMPARISON: { trad: string; topo: string; drawer: keyof typeof CMP_DRAWERS }[] = [
  { trad: "Siloed by function",      topo: "Organized by value stream",      drawer: "silos" },
  { trad: "Handoffs & queuing",      topo: "Collaboration over handoffs",    drawer: "handoffs" },
  { trad: "Ticket-driven work",      topo: "Service ownership",              drawer: "tickets" },
  { trad: "Project-based teams",     topo: "Long-lived teams",               drawer: "projects" },
  { trad: "High cognitive load",     topo: "Managed cognitive load",         drawer: "cognitive" },
  { trad: "Slow feedback loops",     topo: "Fast feedback",                  drawer: "feedback" },
  { trad: "Local optimization",      topo: "Platform-enabled delivery",      drawer: "local" },
  { trad: "Unclear ownership",       topo: "Clear accountability",           drawer: "ownership" },
];

const CMP_DRAWERS = {
  silos:     { title: "Siloed by Function → Value-Stream Organization", why: "Functional silos optimize for utilization, not flow. Work queues at every handoff.", change: "Form long-lived teams around customer-facing value streams. Functional skills become embedded.", before: "Dev → QA → Ops → Security, each with its own backlog.", after: "One stream-aligned team owns idea → production for a value stream." },
  handoffs:  { title: "Handoffs & Queues → Collaboration", why: "Each handoff adds queue time, context loss, and rework.", change: "Collapse handoffs into a single accountable team; remaining interactions are deliberate interaction modes.", before: "Avg 5 handoffs per change, lead time 14 days.", after: "0–1 handoffs, lead time < 1 day." },
  tickets:   { title: "Ticket-Driven Work → Service Ownership", why: "Ticket culture decouples decisions from consequences.", change: "Teams own the services they build, including on-call and reliability roadmap.", before: "Ops triages tickets; devs unaware of production pain.", after: "Stream team carries the pager and prioritizes accordingly." },
  projects:  { title: "Project Teams → Long-Lived Teams", why: "Projects end; services don't. Ownership evaporates with the project.", change: "Fund teams, not projects. Work is pulled into the team that owns the service.", before: "Project team disbands; service decays.", after: "Team persists; capacity is allocated to outcomes." },
  cognitive: { title: "High Cognitive Load → Managed Cognitive Load", why: "Teams overloaded with concerns produce poor decisions and miss reliability work.", change: "Use platforms and complicated subsystem teams to absorb intrinsic and extraneous load.", before: "Stream team manages cloud, security, CI/CD, app — all themselves.", after: "Stream team focuses on the value stream; platform absorbs the rest." },
  feedback:  { title: "Slow Feedback → Fast Feedback", why: "Long cycles hide quality and reliability problems.", change: "Trunk-based development, CI/CD, observability, customer telemetry.", before: "Quarterly releases.", after: "Daily safe releases." },
  local:     { title: "Local Optimization → Platform-Enabled Delivery", why: "Without a platform, every team reinvents non-differentiating capability.", change: "Shared platforms turn common capability into a product with adoption metrics.", before: "10 teams, 10 CI/CD pipelines.", after: "One platform, 10 stream teams flowing through golden paths." },
  ownership: { title: "Unclear Ownership → Clear Accountability", why: "Ambiguity destroys reliability; everyone assumes someone else is on it.", change: "Every production service has a named team in the Service Ownership Matrix.", before: "Outages bounce between teams.", after: "Page goes to the owning team automatically; ownership is documented." },
};

const KPIS = [
  { name: "Deployment Frequency", target: "5× increase",        why: "Smaller, more frequent changes are safer.", how: "Deploys per service per week.", topo: "Stream-Aligned + Platform" },
  { name: "Lead Time for Change", target: "-60%",                why: "Faster idea-to-value, faster learning.",     how: "Commit-to-prod time, p95.",     topo: "Stream-Aligned + Platform" },
  { name: "Change Failure Rate",  target: "-70%",                why: "Quality designed in, not patched in.",        how: "% of changes causing incident.", topo: "Stream-Aligned + Enabling" },
  { name: "MTTR",                 target: "-50%",                why: "Operational mastery from ownership.",         how: "Detect → recover time.",        topo: "Stream-Aligned (owns prod)" },
  { name: "Developer Productivity", target: "+40%",              why: "Less toil, more flow.",                       how: "SPACE / DX metrics.",           topo: "Platform + Enabling" },
  { name: "Employee Satisfaction",target: "+30%",                why: "Clarity, ownership, autonomy.",               how: "Quarterly survey.",             topo: "All team types" },
  { name: "System Reliability",   target: "99.95%",              why: "SLO discipline + ownership.",                 how: "User-journey SLO attainment.",  topo: "Stream-Aligned + Platform" },
  { name: "Cost of Change",       target: "-25%",                why: "Reduced rework + platform leverage.",         how: "Cost per delivered change.",    topo: "Platform + FinOps Enabling" },
];

/* ===================== UI Components ===================== */

function HeaderIndicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function TeamCard({
  t, hovered, setHovered, onClick,
}: {
  t: typeof TEAMS[number];
  hovered: TeamId | null;
  setHovered: (id: TeamId | null) => void;
  onClick: () => void;
}) {
  const Icon = t.icon;
  const tone = TONE[t.tone];
  const dim = hovered && hovered !== t.id;
  const data = D[t.id];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(t.id)}
      onMouseLeave={() => setHovered(null)}
      className={[
        "group text-left rounded-2xl border bg-white p-5 transition-all w-full",
        "border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5",
        hovered === t.id ? `ring-2 ${tone.ring}` : "",
        dim ? "opacity-50" : "",
      ].join(" ")}
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${tone.bg} ${tone.text} mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-base font-semibold text-slate-900">{t.name}</div>
      <div className="text-xs text-slate-600 mt-1">{t.tagline}</div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Primary Responsibilities</div>
        <ul className="space-y-1">
          {data.responsibilities.owns.slice(0, 4).map((r) => (
            <li key={r} className="text-xs text-slate-700 flex items-start gap-1.5">
              <span className={`mt-1 w-1 h-1 rounded-full ${tone.text} bg-current`} /> {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Examples</div>
        <div className="flex flex-wrap gap-1">
          {data.hhax.bullets.slice(0, 3).map((b) => (
            <span key={b.area} className={`text-[10px] px-1.5 py-0.5 rounded ${tone.chip}`}>{b.area}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
        Open team profile <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function FlowNode({
  label, sub, tone, onClick, active,
}: { label: string; sub?: string; tone: Tone; onClick?: () => void; active?: boolean }) {
  const t = TONE[tone];
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border bg-white px-4 py-3 text-left transition-all hover:shadow-md",
        t.border, active ? `ring-2 ${t.ring}` : "",
      ].join(" ")}
    >
      <div className={`text-xs font-semibold ${t.text}`}>{label}</div>
      {sub && <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>}
    </button>
  );
}

function CapabilityTile({ c, onClick }: { c: typeof CAPABILITIES[number]; onClick: () => void }) {
  const Icon = c.icon;
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-slate-200 bg-white p-3 text-left hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 inline-flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900">{c.name}</div>
          <div className="text-[10px] text-slate-500">{c.team}</div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-slate-600 leading-snug opacity-0 group-hover:opacity-100 transition-opacity">{c.how}</div>
    </button>
  );
}

/* ===================== Right Drawer ===================== */

function TeamDrawer({ id, onClose }: { id: TeamId | null; onClose: () => void }) {
  const open = !!id;
  const d = id ? D[id] : null;
  if (!d) return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[40vw] sm:w-[40vw] p-0" />
    </Sheet>
  );
  const tone = TONE[d.tone];
  const Icon = d.icon;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[42vw] sm:w-[42vw] p-0 overflow-hidden flex flex-col">
        <SheetHeader className={`px-6 py-5 border-b ${tone.border} ${tone.soft}`}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl ${tone.bg} ${tone.text} inline-flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{d.kicker}</div>
              <SheetTitle className="text-lg text-slate-900">{d.title}</SheetTitle>
              <div className="text-xs text-slate-600 mt-1">{d.overview.purpose}</div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-white px-4 h-auto py-0 overflow-x-auto">
              {["overview","responsibilities","collaboration","skills","kpis","hhax","artifacts","anti","implementation"].map((t) => (
                <TabsTrigger key={t} value={t} className="text-[11px] capitalize data-[state=active]:bg-slate-100">
                  {t === "anti" ? "Anti-patterns" : t === "hhax" ? "HHAX" : t === "kpis" ? "KPIs" : t}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6 space-y-5">
              <TabsContent value="overview" className="space-y-4 m-0">
                <Section title="Why it exists">{d.overview.whyExists}</Section>
                <Section title="What problem it solves">{d.overview.problem}</Section>
                <Section title="How it differs from traditional IT">{d.overview.differs}</Section>
              </TabsContent>

              <TabsContent value="responsibilities" className="space-y-4 m-0">
                <BulletBlock title="Owns" items={d.responsibilities.owns} tone="emerald" />
                <BulletBlock title="Does not own" items={d.responsibilities.doesNotOwn} tone="rose" />
                <BulletBlock title="Typical backlog" items={d.responsibilities.backlog} tone="sky" />
                <BulletBlock title="Typical deliverables" items={d.responsibilities.deliverables} tone="violet" />
                <BulletBlock title="Decision rights" items={d.responsibilities.decisionRights} tone="amber" />
              </TabsContent>

              <TabsContent value="collaboration" className="space-y-4 m-0">
                <Section title="Workflow">{d.collaboration.workflow}</Section>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Interaction modes</div>
                  {d.collaboration.interacts.map((i) => (
                    <div key={i.team} className="rounded-lg border border-slate-200 p-3 bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-slate-900">{i.team}</div>
                        <ModeBadge mode={i.mode} />
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{i.detail}</div>
                    </div>
                  ))}
                </div>
                <BulletBlock title="Anti-patterns to avoid" items={d.collaboration.antiPatterns} tone="rose" />
              </TabsContent>

              <TabsContent value="skills" className="space-y-4 m-0">
                <div className="flex flex-wrap gap-1.5">
                  {d.skills.roles.map((r) => <span key={r} className={`text-[10px] px-2 py-0.5 rounded ${tone.chip}`}>{r}</span>)}
                </div>
                <Section title="Skill mix">{d.skills.skillMix}</Section>
                <Section title="Team size">{d.skills.size}</Section>
                <Section title="Leadership model">{d.skills.leadership}</Section>
                <Section title="Adding / removing capabilities">{d.skills.capabilityNotes}</Section>
              </TabsContent>

              <TabsContent value="kpis" className="space-y-4 m-0">
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">KPI</th>
                        <th className="text-left px-3 py-2 font-medium">Current</th>
                        <th className="text-left px-3 py-2 font-medium">Target</th>
                        <th className="text-left px-3 py-2 font-medium">Forecast</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {d.kpis.primary.map((k) => (
                        <tr key={k.name}>
                          <td className="px-3 py-2 font-medium text-slate-900">{k.name}</td>
                          <td className="px-3 py-2 text-slate-700">{k.current}</td>
                          <td className="px-3 py-2 text-slate-900 font-semibold">{k.target}</td>
                          <td className="px-3 py-2 text-emerald-700">{k.forecast}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <BulletBlock title="Secondary KPIs" items={d.kpis.secondary} tone="sky" />
                <BulletBlock title="Signals of success" items={d.kpis.success} tone="emerald" />
                <BulletBlock title="Signals of dysfunction" items={d.kpis.dysfunction} tone="rose" />
              </TabsContent>

              <TabsContent value="hhax" className="space-y-4 m-0">
                <Section title="Headline">{d.hhax.headline}</Section>
                <div className="space-y-2">
                  {d.hhax.bullets.map((b) => (
                    <div key={b.area} className="rounded-lg border border-slate-200 p-3 bg-white">
                      <div className="text-sm font-medium text-slate-900">{b.area}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{b.detail}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="artifacts" className="m-0">
                <div className="grid grid-cols-2 gap-2">
                  {d.artifacts.map((a) => (
                    <div key={a} className="rounded-lg border border-slate-200 p-2.5 bg-white text-xs text-slate-800 flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5 text-slate-500" /> {a}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="anti" className="space-y-3 m-0">
                {d.antiPatterns.map((a) => (
                  <div key={a.anti} className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
                    <div className="flex items-center gap-2 text-rose-800 font-medium text-sm">
                      <AlertTriangle className="w-4 h-4" /> {a.anti}
                    </div>
                    <div className="text-xs text-rose-900/80 mt-1">{a.consequence}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="implementation" className="space-y-3 m-0">
                {[
                  { label: "First 30 days", items: d.implementation.d30 },
                  { label: "First 90 days", items: d.implementation.d90 },
                  { label: "First 6 months", items: d.implementation.m6 },
                  { label: "First 12 months", items: d.implementation.m12 },
                ].map((p) => (
                  <div key={p.label} className="rounded-lg border border-slate-200 p-3 bg-white">
                    <div className="text-xs font-semibold text-slate-900">{p.label}</div>
                    <ul className="mt-1.5 space-y-1">
                      {p.items.map((i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-600 shrink-0" /> {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{title}</div>
      <div className="text-sm text-slate-800 leading-relaxed">{children}</div>
    </div>
  );
}

function BulletBlock({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  const t = TONE[tone];
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{title}</div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="text-xs text-slate-800 flex items-start gap-2">
            <span className={`mt-1.5 w-1 h-1 rounded-full bg-current ${t.text}`} /> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModeBadge({ mode }: { mode: "Collaboration" | "X-as-a-Service" | "Facilitating" }) {
  const cls = mode === "Collaboration" ? "bg-violet-100 text-violet-800"
            : mode === "X-as-a-Service" ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800";
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cls}`}>{mode}</span>;
}

/* ===================== Generic side drawer for cap/compare/kpi ===================== */

type GenericDrawer =
  | { kind: "cap"; cap: typeof CAPABILITIES[number] }
  | { kind: "cmp"; key: keyof typeof CMP_DRAWERS }
  | { kind: "kpi"; kpi: typeof KPIS[number] }
  | { kind: "node"; node: { label: string; detail: string; layer: string } };

function GenericSideDrawer({ d, onClose }: { d: GenericDrawer | null; onClose: () => void }) {
  return (
    <Sheet open={!!d} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[40vw] sm:w-[40vw] p-0 overflow-hidden flex flex-col">
        {d?.kind === "cap" && (
          <>
            <SheetHeader className="px-6 py-5 border-b bg-slate-50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Capability</div>
              <SheetTitle className="text-lg">{d.cap.name}</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-4 overflow-y-auto">
              <Section title="Definition">{d.cap.how}</Section>
              <Section title="Where it belongs">{d.cap.team}</Section>
              <Section title="Maturity signals">
                Practiced daily, documented, taught by an enabling team, encoded in the platform, and measured.
              </Section>
              <Section title="HHAX relevance">
                Required across acquired estates to standardize practice and reduce duplicated effort.
              </Section>
            </div>
          </>
        )}
        {d?.kind === "cmp" && (
          <>
            <SheetHeader className="px-6 py-5 border-b bg-slate-50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Operating Shift</div>
              <SheetTitle className="text-lg">{CMP_DRAWERS[d.key].title}</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-4 overflow-y-auto">
              <Section title="Why this causes friction">{CMP_DRAWERS[d.key].why}</Section>
              <Section title="What changes">{CMP_DRAWERS[d.key].change}</Section>
              <Section title="Before"><span className="text-rose-700">{CMP_DRAWERS[d.key].before}</span></Section>
              <Section title="After"><span className="text-emerald-700">{CMP_DRAWERS[d.key].after}</span></Section>
              <Section title="How to implement">
                Identify a candidate value stream, form the team, define ownership in the Service Ownership Matrix, move on-call, measure DORA + SLOs, scale to next stream.
              </Section>
            </div>
          </>
        )}
        {d?.kind === "kpi" && (
          <>
            <SheetHeader className="px-6 py-5 border-b bg-slate-50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Outcome KPI</div>
              <SheetTitle className="text-lg">{d.kpi.name}</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-4 overflow-y-auto">
              <Section title="Target">{d.kpi.target}</Section>
              <Section title="Why it matters">{d.kpi.why}</Section>
              <Section title="How it's measured">{d.kpi.how}</Section>
              <Section title="Which topology improves it">{d.kpi.topo}</Section>
            </div>
          </>
        )}
        {d?.kind === "node" && (
          <>
            <SheetHeader className="px-6 py-5 border-b bg-slate-50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{d.node.layer}</div>
              <SheetTitle className="text-lg">{d.node.label}</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-4 overflow-y-auto">
              <Section title="What this team does">{d.node.detail}</Section>
              <Section title="HHAX relevance">
                Maps to current HHAX needs across acquired platforms, cloud operations, and modernization.
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ===================== Page ===================== */

export default function TeamTopologies() {
  const [openTeam, setOpenTeam] = useState<TeamId | null>(null);
  const [hovered, setHovered] = useState<TeamId | null>(null);
  const [generic, setGeneric] = useState<GenericDrawer | null>(null);

  const orgModel = useMemo(() => ([
    { layer: "Executive Leadership", tone: "slate" as Tone, nodes: ["Executive Leadership"] },
    { layer: "Stream-Aligned Teams (Value Streams)", tone: "sky" as Tone, nodes: [
      "Member Experience","Provider Experience","Claims & Payments",
      "Eligibility & Enrollment","Analytics & Insights","Caregiver Mobile Experience",
    ]},
    { layer: "Enabling Teams", tone: "violet" as Tone, nodes: [
      "SRE Enablement","DevSecOps Enablement","Cloud Enablement","Automation Enablement","FinOps Enablement",
    ]},
    { layer: "Complicated Subsystem Teams", tone: "amber" as Tone, nodes: [
      "Legacy Modernization","Database Platform","Policy Engine","Integration Services","Identity & Access",
    ]},
    { layer: "Platform Teams", tone: "emerald" as Tone, nodes: [
      "Cloud Platform","SRE Platform","Security Platform","Observability Platform","Developer Experience","Data Platform",
    ]},
  ]), []);

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
            <Link to="/reliability-foundations" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-3.5 h-3.5" /> Enterprise Operating Shifts
            </Link>
            <div className="flex items-center gap-2">
              <HeaderIndicator label="Discipline" value="Team Topologies" />
              <HeaderIndicator label="Source" value="Skelton & Pais" />
              <HeaderIndicator label="Audience" value="Engineering Leadership" />
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
          {/* HERO */}
          <section>
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="bg-sky-100 text-sky-800 mb-3">Team Topologies — Design Principles</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Team Topologies</h1>
                <p className="mt-2 text-base text-slate-700">
                  Organize teams for fast flow, cognitive load management, and evolutionary architecture.
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Team Topologies is an operating model for designing team structures and interaction patterns so work flows
                  quickly from business need to production value — with clear ownership and managed cognitive load.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Flow of Work","Reduced Cognitive Load","Clear Team Boundaries"].map((c) => (
                    <span key={c} className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">{c}</span>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex flex-col gap-2 min-w-[220px]">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Based on</div>
                  <div className="text-sm font-medium text-slate-900">Team Topologies</div>
                  <div className="text-xs text-slate-600">Matthew Skelton & Manuel Pais</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Reading time</div>
                  <div className="text-sm font-medium text-slate-900">10–15 min</div>
                </div>
              </div>
            </div>
          </section>

          {/* FOUR TEAM TYPES */}
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Section 1</div>
                <h2 className="text-xl font-semibold text-slate-900">Four Fundamental Team Types</h2>
              </div>
              <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-600">
                <Legend dot="bg-sky-500" label="Flow" />
                <Legend dot="bg-violet-500" label="Enable" />
                <Legend dot="bg-amber-500" label="Complicate" />
                <Legend dot="bg-emerald-500" label="Platform" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {TEAMS.map((t) => (
                <TeamCard key={t.id} t={t} hovered={hovered} setHovered={setHovered} onClick={() => setOpenTeam(t.id)} />
              ))}
            </div>
          </section>

          {/* COLLABORATION FLOW */}
          <section>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Section 2</div>
              <h2 className="text-xl font-semibold text-slate-900">How Teams Collaborate</h2>
              <p className="text-sm text-slate-600 mt-1">Customer value flows through stream-aligned teams, supported by platforms and specialists, accelerated by enablers.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-7 gap-3 items-center">
                <FlowNode label="Customer Value" sub="Demand & outcomes" tone="slate" onClick={() => setGeneric({ kind: "node", node: { label: "Customer Value", layer: "Demand", detail: "The originating signal of work — customer needs, business outcomes, and SLO breaches." }})} />
                <Arrow type="solid" caption="X-as-a-Service" />
                <FlowNode label="Stream-Aligned" sub="End-to-end delivery" tone="sky" onClick={() => setOpenTeam("streamAligned")} />
                <Arrow type="dashed" caption="Collaboration" />
                <FlowNode label="Complicated Subsystem" sub="Specialist depth" tone="amber" onClick={() => setOpenTeam("complicated")} />
                <Arrow type="dotted" caption="Facilitating" />
                <FlowNode label="Platform" sub="Self-service" tone="emerald" onClick={() => setOpenTeam("platform")} />
              </div>
              <div className="grid grid-cols-7 gap-3 items-center mt-3">
                <div />
                <div />
                <div className="flex justify-center"><Arrow type="dashed" vertical caption="Enabling" /></div>
                <div />
                <div />
                <div />
                <FlowNode label="Fast Flow, Low Cognitive Load" sub="Outcome" tone="slate" />
              </div>
              <div className="grid grid-cols-7 gap-3 items-start mt-3">
                <div />
                <div />
                <FlowNode label="Enabling" sub="Coaching capability" tone="violet" onClick={() => setOpenTeam("enabling")} />
                <div />
                <div />
                <div />
                <div />
              </div>
              <div className="mt-6 flex items-center gap-5 text-[11px] text-slate-600 border-t border-slate-100 pt-4">
                <LineKey type="solid" label="X-as-a-Service" />
                <LineKey type="dashed" label="Collaboration" />
                <LineKey type="dotted" label="Facilitating" />
              </div>
            </div>
          </section>

          {/* CORE CAPABILITIES */}
          <section>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Section 3</div>
              <h2 className="text-xl font-semibold text-slate-900">Core Capabilities & Skills</h2>
              <p className="text-sm text-slate-600 mt-1">Hover for the role in flow. Click for definition, ownership, and maturity signals.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {CAPABILITIES.map((c) => (
                <CapabilityTile key={c.id} c={c} onClick={() => setGeneric({ kind: "cap", cap: c })} />
              ))}
            </div>
          </section>

          {/* COMPARISON */}
          <section>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Section 4</div>
              <h2 className="text-xl font-semibold text-slate-900">Traditional IT vs. Team Topologies</h2>
              <p className="text-sm text-slate-600 mt-1">Click any row to see why it matters, what changes, and a before/after example.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="grid grid-cols-2 text-[10px] uppercase tracking-widest text-slate-500 px-5 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-rose-700 font-semibold">Traditional IT Organization</div>
                <div className="text-emerald-700 font-semibold">Team Topologies Model</div>
              </div>
              {COMPARISON.map((r) => (
                <button
                  key={r.drawer as string}
                  onClick={() => setGeneric({ kind: "cmp", key: r.drawer })}
                  className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="text-sm text-slate-800 flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-rose-500" />{r.trad}</div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-sm text-slate-900 font-medium flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{r.topo}</div>
                </button>
              ))}
            </div>
          </section>

          {/* TYPICAL ORG MODEL */}
          <section>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Section 5</div>
              <h2 className="text-xl font-semibold text-slate-900">Typical Organizational Structure</h2>
              <p className="text-sm text-slate-600 mt-1">A reference model. Click any node to inspect its role in flow.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              {orgModel.map((row) => {
                const t = TONE[row.tone];
                return (
                  <div key={row.layer} className={`rounded-xl border ${t.border} ${t.soft} p-3`}>
                    <div className={`text-[11px] font-semibold ${t.text} mb-2 uppercase tracking-wider`}>{row.layer}</div>
                    <div className="flex flex-wrap gap-2">
                      {row.nodes.map((n) => (
                        <button
                          key={n}
                          onClick={() => setGeneric({ kind: "node", node: { label: n, layer: row.layer, detail: `Part of the ${row.layer} layer. Engages other layers through clear interaction modes to deliver and operate ${n}.` }})}
                          className={`text-xs rounded-lg border bg-white px-3 py-1.5 ${t.border} hover:shadow-sm transition-shadow`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* OUTCOMES */}
          <section>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Section 6</div>
              <h2 className="text-xl font-semibold text-slate-900">Why Team Topologies Drives Business Outcomes</h2>
              <p className="text-sm text-slate-600 mt-1">Outcome targets when the model is implemented end-to-end with platforms and enablers.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {KPIS.map((k) => (
                <button
                  key={k.name}
                  onClick={() => setGeneric({ kind: "kpi", kpi: k })}
                  className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wider">
                    <BarChart3 className="w-3.5 h-3.5" /> Outcome
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{k.name}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{k.target}</div>
                  <Sparkline />
                  <div className="text-[11px] text-slate-600 mt-2">{k.why}</div>
                </button>
              ))}
            </div>
          </section>

          {/* HHAX RELEVANCE FOOTER */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50/50 to-white p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 inline-flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Why Team Topologies Matters for HHAX</h3>
                <p className="text-sm text-slate-700 mt-1 max-w-4xl">
                  HHAX is moving from ITIL-oriented operations toward SRE and platform engineering. Multiple acquired platforms,
                  AWS and GCP cloud estates, a Virginia data center, Sandata integration, the Pavilio growth platform, and the
                  self-direction platform transition all demand clear ownership, reduced cognitive load, and reusable platforms.
                  Team Topologies provides the operating shape that makes that transition concrete and measurable.
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Standardize across acquired platforms",
                    "Move from ticket-driven work",
                    "Service ownership for caregiver mobile, claims, payroll",
                    "Platform engineering for cloud + observability + security",
                    "SRE enablement across product lines",
                    "FinOps visibility for cloud spend",
                    "Reduce interruptions for strategic work",
                    "Faster modernization of legacy",
                  ].map((b) => (
                    <div key={b} className="text-xs text-slate-700 bg-white rounded-lg border border-slate-200 p-2 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" /> {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* footer nav */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <Link to="/reliability-foundations" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back to Enterprise Operating Shifts
            </Link>
            <Link to="/reliability-foundations/google-sre" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Continue to Google SRE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <TeamDrawer id={openTeam} onClose={() => setOpenTeam(null)} />
      <GenericSideDrawer d={generic} onClose={() => setGeneric(null)} />
    </AppShell>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return <div className="inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${dot}`} /> {label}</div>;
}

function Arrow({ type, caption, vertical }: { type: "solid" | "dashed" | "dotted"; caption?: string; vertical?: boolean }) {
  const style =
    type === "solid" ? "border-t-2 border-slate-700"
    : type === "dashed" ? "border-t-2 border-dashed border-slate-500"
    : "border-t-2 border-dotted border-slate-400";
  return (
    <div className={`flex flex-col items-center ${vertical ? "rotate-90" : ""}`}>
      <div className={`w-full ${style}`} />
      {caption && <div className="text-[10px] text-slate-500 mt-1">{caption}</div>}
    </div>
  );
}

function LineKey({ type, label }: { type: "solid" | "dashed" | "dotted"; label: string }) {
  const style =
    type === "solid" ? "border-t-2 border-slate-700"
    : type === "dashed" ? "border-t-2 border-dashed border-slate-500"
    : "border-t-2 border-dotted border-slate-400";
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`w-8 ${style}`} />
      <span>{label}</span>
    </div>
  );
}

function Sparkline() {
  const points = "0,18 10,14 20,15 30,10 40,11 50,7 60,8 70,5 80,4 90,2 100,1";
  return (
    <svg viewBox="0 0 100 20" className="w-full h-5 mt-1">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} className="text-emerald-500" />
    </svg>
  );
}
