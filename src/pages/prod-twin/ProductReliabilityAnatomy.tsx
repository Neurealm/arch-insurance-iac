import { useState, useMemo } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Users, ShieldCheck, Boxes, Users2, Bot, TrendingUp, Building2, Target,
  Eye, ClipboardList, UsersRound, Settings2, Lock, GraduationCap,
  Rocket, DollarSign, UserCircle2, Landmark, Star, CheckCircle2, LineChart as LineIcon, Heart, Compass,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
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

const CHAR_COLORS = {
  indigo:  { ring: "#4338ca", soft: "#eef2ff", text: "#3730a3", accent: "bg-indigo-600", chip: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  teal:    { ring: "#0f766e", soft: "#f0fdfa", text: "#115e59", accent: "bg-teal-600",   chip: "bg-teal-50 text-teal-700 border-teal-200" },
  emerald: { ring: "#047857", soft: "#ecfdf5", text: "#065f46", accent: "bg-emerald-600",chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  orange:  { ring: "#c2410c", soft: "#fff7ed", text: "#9a3412", accent: "bg-orange-600", chip: "bg-orange-50 text-orange-700 border-orange-200" },
  green:   { ring: "#15803d", soft: "#f0fdf4", text: "#166534", accent: "bg-green-600",  chip: "bg-green-50 text-green-700 border-green-200" },
  violet:  { ring: "#6d28d9", soft: "#f5f3ff", text: "#5b21b6", accent: "bg-violet-600", chip: "bg-violet-50 text-violet-700 border-violet-200" },
  sky:     { ring: "#0369a1", soft: "#f0f9ff", text: "#075985", accent: "bg-sky-600",    chip: "bg-sky-50 text-sky-700 border-sky-200" },
  slate:   { ring: "#1e293b", soft: "#f8fafc", text: "#0f172a", accent: "bg-slate-800",  chip: "bg-slate-100 text-slate-700 border-slate-200" },
};

type CharKey = keyof typeof CHAR_COLORS;

type Characteristic = {
  id: string;
  num: number;
  title: string;
  oneLine: string;
  Icon: typeof Users;
  color: CharKey;
  keySignals: string[];
  metricLabel: string;
  metricValue: string;
  metricTarget: string;
  trend: { x: string; v: number }[];
  donut?: { label: string; value: number; color: string }[];
  panel: DetailPanel;
};

const trend = (base: number, spread: number) =>
  Array.from({ length: 12 }, (_, i) => ({
    x: `W${i + 1}`,
    v: Number((base + Math.sin(i / 1.8) * spread + (Math.random() - 0.5) * spread * 0.4).toFixed(2)),
  }));

const CHARACTERISTICS: Characteristic[] = [
  {
    id: "ownership",
    num: 1,
    title: "Product-Centric Ownership",
    oneLine: "Every critical service has a clearly accountable owner with end-to-end responsibility for reliability, experience, and cost.",
    Icon: Users,
    color: "indigo",
    keySignals: ["100% of critical services have an owner", "Clear RACI and escalation paths", "Ownership reviews are routine"],
    metricLabel: "Ownership Coverage",
    metricValue: "100%",
    metricTarget: "Target: 100%",
    trend: trend(96, 3),
    donut: [
      { label: "Owned",   value: 100, color: "#4338ca" },
      { label: "Shared",  value: 0,   color: "#a5b4fc" },
      { label: "Unowned", value: 0,   color: "#e5e7eb" },
    ],
    panel: {
      id: "ownership",
      title: "Product-Centric Ownership",
      kicker: "Characteristic 1 of 8",
      summary: "Every critical service has a clearly accountable owner.",
      sections: [
        { heading: "Executive Definition", body: "A named product owner is responsible for the end-to-end reliability, customer experience, and unit economics of every critical service. Ownership is a property of the service, not a property of the on-call rotation." },
        { heading: "Why It Exists", body: "Shared ownership collapses under pressure. When everyone owns a service, no one does. Product-centric ownership creates a single point of decision-making accountability for prioritization, investment, and reliability outcomes." },
        { heading: "Common Industry Interpretation", body: "Aligned with Team Topologies stream-aligned teams, SRE service ownership models, and platform-product principles popularized by Spotify, Netflix, and Amazon two-pizza teams." },
        { heading: "How It Appears In Real Organizations", body: [
          "Service catalog lists a named owner, on-call team, and product manager for every tier-1 service",
          "Quarterly service reviews led by the named owner, not by a central operations team",
          "Cost, reliability, and CSAT roll up to the same owner",
        ]},
        { heading: "Operational Behaviors", body: ["Service ownership exists", "Product ownership exists", "Reliability accountability exists", "Cost accountability exists"] },
        { heading: "Example Workflows", body: ["Service onboarding: owner assigned before go-live", "Quarterly reliability review: owner presents SLO, error budget, and roadmap", "Incident review: owner attends and signs off on actions"] },
        { heading: "Example Team Structures", body: ["Stream-aligned team owns service end-to-end", "Platform team provides paved roads, not handoffs", "Enabling team accelerates owner capability"] },
        { heading: "Typical KPIs", body: ["Ownership Coverage %", "Time To Ownership Assignment", "Service Health Score", "Escalation Count per service"] },
        { heading: "Typical SLAs", body: ["Owner response to Sev1 within 15 minutes", "Service review completed quarterly", "Ownership change notified within 24 hours"] },
        { heading: "Business Impact", body: "Faster prioritization decisions, reduced escalation cycles, clearer investment cases tied to a single owner accountable for outcomes." },
        { heading: "Customer Impact", body: "Customer-impacting decisions have a named decision-maker. Resolution times shorten because ownership is unambiguous." },
        { heading: "Financial Impact", body: "Service-level FinOps becomes possible. Cost attribution, optimization, and chargeback align to the owner's P&L." },
        { heading: "Common Anti-Patterns", body: ["Shared ownership across multiple teams", "Long escalation chains substituting for ownership", "Ownership ambiguity discovered only during incidents"] },
        { heading: "Modernization Opportunities", body: ["Service catalog with ownership metadata", "Automated ownership validation against catalog", "Ownership signals in deployment gating"] },
        { heading: "AI Automation Opportunities", body: ["AI-assisted ownership inference from code, deploys, and on-call data", "Automated reminders for stale ownership records", "AI-generated quarterly service review packs"] },
        { heading: "Executive Talking Points", body: ["\"Every critical service should have a named owner.\"", "\"Ownership is a property of the service, not the team rotation.\"", "\"If we cannot name the owner, we do not have one.\""] },
        { heading: "Example Reporting Widgets", body: ["Ownership Heat Map by domain", "Service Ownership Matrix", "Product Accountability Radar"] },
      ],
    },
  },
  {
    id: "reliability",
    num: 2,
    title: "Reliability Engineering Culture",
    oneLine: "Reliability is engineered through data, learning, and continuous improvement — not just firefighting.",
    Icon: ShieldCheck,
    color: "teal",
    keySignals: ["SLOs and error budgets defined", "Blameless postmortems standard", "Reliability reviews drive change"],
    metricLabel: "SLO Achievement (30D)",
    metricValue: "98.2%",
    metricTarget: "Target: 99%",
    trend: trend(98, 0.6),
    panel: {
      id: "reliability",
      title: "Reliability Engineering Culture",
      kicker: "Characteristic 2 of 8",
      summary: "Reliability is engineered proactively rather than managed reactively.",
      sections: [
        { heading: "Executive Definition", body: "Reliability is the outcome of deliberate engineering: SLOs, error budgets, capacity forecasting, chaos engineering, and learning loops drive measurable improvement." },
        { heading: "Why It Exists", body: "Reactive operations create a ceiling on reliability. Organizations that engineer reliability proactively avoid the firefighting trap and free engineering capacity for differentiated work." },
        { heading: "Common Industry Interpretation", body: "Google SRE, the DORA capabilities, the SLO Adoption Lifecycle, and Accelerate-style continuous improvement." },
        { heading: "How It Appears In Real Organizations", body: ["Every tier-1 service has an SLO and an active error budget", "Postmortems are blameless and produce tracked actions", "Capacity is forecast, not discovered"] },
        { heading: "Operational Behaviors", body: ["SLOs exist", "Error budgets exist", "Reliability reviews exist", "Capacity forecasting exists", "Incident learning exists"] },
        { heading: "Typical KPIs", body: ["MTTD", "MTTR", "Error Budget Consumption", "Sev1 Frequency", "Repeat Incident %"] },
        { heading: "Visualizations", body: ["SLO Achievement Trend", "Error Budget Dashboard", "Incident Reduction Trend"] },
        { heading: "Business Impact", body: "Sev1 volume declines 60–80% within 12–18 months. Engineering capacity reclaimed from firefighting is reinvested in product and platform." },
        { heading: "Customer Impact", body: "Customers experience fewer disruptions and faster recovery when disruptions occur." },
        { heading: "Financial Impact", body: "Incident-driven cost (overtime, premium support, lost revenue) declines. Insurance and operational risk premiums improve." },
        { heading: "Common Anti-Patterns", body: ["Firefighting", "Reactive operations", "Constant escalations", "Postmortems without action follow-through"] },
        { heading: "Modernization Opportunities", body: ["Automated SLO definition from telemetry", "Error budget gating in deployment pipelines", "Chaos engineering as standard practice"] },
        { heading: "AI Automation Opportunities", body: ["AI-generated incident summaries and postmortem drafts", "Predictive incident detection from telemetry baselines", "Automated correlation across signals"] },
        { heading: "Executive Talking Points", body: ["\"The best incident is the one that never occurs.\"", "\"Reliability is engineered, not escalated.\"", "\"Error budgets convert reliability from opinion to evidence.\""] },
      ],
    },
  },
  {
    id: "platform",
    num: 3,
    title: "Platform Engineering",
    oneLine: "Reusable platforms provide self-service capabilities that accelerate delivery and enforce guardrails.",
    Icon: Boxes,
    color: "emerald",
    keySignals: ["High adoption of platform services", "Self-service > 70% for key workflows", "Consistent standards and guardrails"],
    metricLabel: "Platform Adoption",
    metricValue: "78%",
    metricTarget: "Target: > 75%",
    trend: trend(76, 4),
    donut: [
      { label: "High",   value: 78, color: "#047857" },
      { label: "Medium", value: 17, color: "#6ee7b7" },
      { label: "Low",    value: 5,  color: "#d1fae5" },
    ],
    panel: {
      id: "platform",
      title: "Platform Engineering",
      kicker: "Characteristic 3 of 8",
      summary: "Shared capabilities are built once and consumed repeatedly.",
      sections: [
        { heading: "Executive Definition", body: "Internal platforms (identity, cloud, observability, CI/CD, data) are productized and consumed by stream-aligned teams through self-service. The platform team treats internal developers as customers." },
        { heading: "Why It Exists", body: "Without platforms, teams rebuild the same capabilities repeatedly. Platforms create leverage, enforce standards by default, and shorten time-to-production." },
        { heading: "Common Industry Interpretation", body: "Platform engineering, internal developer platforms (IDP), golden paths, paved roads, and Team Topologies platform teams." },
        { heading: "Example Shared Platforms", body: ["Identity Platform", "Cloud Platform", "Observability Platform", "CI/CD Platform", "Data Platform"] },
        { heading: "Observable Behaviors", body: ["Self-service provisioning", "Standardized environments", "Golden paths", "Shared services consumed, not rebuilt"] },
        { heading: "Typical KPIs", body: ["Platform Adoption %", "Self-Service Usage %", "Standardization Coverage %", "Time-to-Environment", "Platform NPS"] },
        { heading: "Visualizations", body: ["Platform Service Catalog", "Adoption Heat Map", "Platform Dependency Graph"] },
        { heading: "Business Impact", body: "Delivery accelerates 2–5x for teams on golden paths. Compliance posture improves because controls are built into the platform rather than enforced at the edge." },
        { heading: "Financial Impact", body: "Per-team infrastructure cost drops; platform investment is amortized across the portfolio." },
        { heading: "Common Anti-Patterns", body: ["Platform built without product mindset", "Mandated adoption with no measurable benefit", "Platform team as ticket queue, not product"] },
        { heading: "Executive Talking Points", body: ["\"Teams should consume platforms, not build them repeatedly.\"", "\"Standards enforced by default beat standards enforced by review.\""] },
      ],
    },
  },
  {
    id: "collab",
    num: 4,
    title: "Collaborative Engineering",
    oneLine: "Teams work together with shared context, reducing handoffs and accelerating problem resolution.",
    Icon: Users2,
    color: "orange",
    keySignals: ["Fewer handoffs per incident", "Cross-functional teams embedded", "Shared tooling and data"],
    metricLabel: "Handoffs Per Incident",
    metricValue: "1.2",
    metricTarget: "Target: < 2.0",
    trend: trend(1.6, 0.3),
    panel: {
      id: "collab",
      title: "Collaborative Engineering",
      kicker: "Characteristic 4 of 8",
      summary: "Teams solve problems together rather than routing tickets.",
      sections: [
        { heading: "Executive Definition", body: "Problems are solved through shared context and direct collaboration between teams. Tickets exist for coordination, not for relocating accountability." },
        { heading: "Why It Exists", body: "Ticket-driven handoffs add latency, lose context, and erode ownership. Collaboration replaces routing with co-resolution." },
        { heading: "Observable Behaviors", body: ["Shared accountability across product, engineering, and operations", "Shared context through common tooling and telemetry", "Shared outcomes rather than team-specific output metrics"] },
        { heading: "Typical KPIs", body: ["Handoffs Per Incident", "Escalation Count", "Resolution Lead Time", "Collaboration Score"] },
        { heading: "Visualizations", body: ["Current State vs Future State Workflow", "Collaboration Radar", "Cross-Team Dependency Graph"] },
        { heading: "Common Anti-Patterns", body: ["Throw it over the fence", "Ticket routing as primary coordination", "Organizational silos with private tooling"] },
        { heading: "Modernization Opportunities", body: ["ChatOps and shared incident channels", "Single observability plane across teams", "Shared on-call across product and platform"] },
        { heading: "Executive Talking Points", body: ["\"Collaboration should replace ticket routing.\"", "\"Tickets coordinate work — they do not transfer ownership.\""] },
      ],
    },
  },
  {
    id: "automation",
    num: 5,
    title: "Automation-First Operations",
    oneLine: "Automation handles repetitive work and remediates issues, freeing humans to focus on high-value decisions.",
    Icon: Bot,
    color: "green",
    keySignals: ["High automation coverage", "Automated remediation in place", "Toil reduced continuously"],
    metricLabel: "Automation Coverage",
    metricValue: "72%",
    metricTarget: "Target: > 70%",
    trend: trend(68, 4),
    donut: [
      { label: "Automated", value: 72, color: "#15803d" },
      { label: "Manual",    value: 28, color: "#bbf7d0" },
    ],
    panel: {
      id: "automation",
      title: "Automation-First Operations",
      kicker: "Characteristic 5 of 8",
      summary: "Automation handles repetitive work so humans can focus on decisions.",
      sections: [
        { heading: "Executive Definition", body: "Repetitive operational work — provisioning, validation, remediation, recovery — is automated by default. Human attention is reserved for novel problems and judgment-bearing decisions." },
        { heading: "Why It Exists", body: "Manual toil is the single largest tax on operational capacity. Automation converts toil into platform investment and increases consistency, speed, and safety." },
        { heading: "Observable Behaviors", body: ["Automated remediation", "Automated recovery", "Automated validation", "Automated provisioning"] },
        { heading: "Typical KPIs", body: ["Automation Coverage %", "Toil Hours Eliminated", "Automated Recovery Rate", "Manual Intervention Count"] },
        { heading: "Visualizations", body: ["Automation Coverage Trend", "Manual vs Automated Activity", "Agent Activity Dashboard"] },
        { heading: "AI Automation Opportunities", body: ["AI co-workers for triage, classification, and routine remediation", "Generative runbook authoring from incident history", "Closed-loop remediation with human approval gates"] },
        { heading: "Executive Talking Points", body: ["\"Humans should make decisions, not perform repetitive work.\"", "\"Every recurring manual task is an unbuilt automation.\""] },
      ],
    },
  },
  {
    id: "modernization",
    num: 6,
    title: "Continuous Modernization",
    oneLine: "Technology, architecture, and processes evolve continuously to reduce debt and increase agility.",
    Icon: TrendingUp,
    color: "violet",
    keySignals: ["Modernization roadmap in motion", "Legacy footprint shrinking", "Technical debt is visible"],
    metricLabel: "Modernization Progress",
    metricValue: "64%",
    metricTarget: "Target: 75%",
    trend: trend(58, 6),
    panel: {
      id: "modernization",
      title: "Continuous Modernization",
      kicker: "Characteristic 6 of 8",
      summary: "Technology evolves continuously rather than through large periodic projects.",
      sections: [
        { heading: "Executive Definition", body: "Modernization is a steady-state capability. Containerization, refactoring, rationalization, and debt reduction happen continuously inside delivery teams — not as a separate program." },
        { heading: "Why It Exists", body: "Multi-year modernization programs lag the rate of change in the business. Continuous modernization keeps the estate current and reduces the cost of every future change." },
        { heading: "Observable Behaviors", body: ["Containerization", "Refactoring", "Rationalization", "Technical debt reduction"] },
        { heading: "Typical KPIs", body: ["Container Adoption %", "Technical Debt Index", "Modernization Velocity", "Legacy Asset %"] },
        { heading: "Visualizations", body: ["Technical Debt Trend", "Modernization Roadmap", "Application Evolution Dashboard"] },
        { heading: "Common Anti-Patterns", body: ["Modernization as a one-time project", "Lift-and-shift without refactor follow-through", "Hidden technical debt with no measurement"] },
        { heading: "Executive Talking Points", body: ["\"Modernization is a capability, not a project.\"", "\"Debt that is invisible cannot be paid down.\""] },
      ],
    },
  },
  {
    id: "acquisition",
    num: 7,
    title: "Acquisition Integration Factory",
    oneLine: "A repeatable, standardized process rapidly integrates acquisitions into the operating model.",
    Icon: Building2,
    color: "sky",
    keySignals: ["Standard onboarding process", "Time to operational readiness tracked", "Platforms and standards adopted"],
    metricLabel: "Integration Readiness",
    metricValue: "86%",
    metricTarget: "Target: > 80%",
    trend: trend(74, 6),
    panel: {
      id: "acquisition",
      title: "Acquisition Integration Factory",
      kicker: "Characteristic 7 of 8",
      summary: "Acquired companies are onboarded through a repeatable operational model.",
      sections: [
        { heading: "Executive Definition", body: "Acquisitions are integrated through a standardized factory: assess, standardize, integrate, operate. Each acquisition strengthens the factory rather than disrupting it." },
        { heading: "Workflow", body: ["Acquire", "Assess", "Standardize", "Integrate", "Operate"] },
        { heading: "Observable Behaviors", body: ["Standard onboarding", "Standard observability", "Standard security controls", "Standard pipelines", "Standard operating model"] },
        { heading: "Typical KPIs", body: ["Time To Operational Readiness", "Integration Duration", "Standardization Rate", "Duplicate Platform Reduction"] },
        { heading: "Visualizations", body: ["Acquisition Factory Workflow", "Integration Readiness Radar", "Platform Consolidation Dashboard"] },
        { heading: "Business Impact", body: "Time-to-value from M&A compresses from 18–24 months to 6–9 months. Synergy realization becomes predictable rather than aspirational." },
        { heading: "Financial Impact", body: "Reduction in duplicate tooling, licenses, and platform teams. Consolidated FinOps across acquired estates." },
        { heading: "Common Anti-Patterns", body: ["Acquired company runs its own stack indefinitely", "Integration done bespoke per deal", "Operational readiness discovered post-close"] },
        { heading: "Executive Talking Points", body: ["\"Every acquisition should become easier than the last.\"", "\"The factory is the moat, not the deal team.\""] },
      ],
    },
  },
  {
    id: "outcome",
    num: 8,
    title: "Business Outcome Alignment",
    oneLine: "Operations are measured by business outcomes and customer experience — not just infrastructure metrics.",
    Icon: Target,
    color: "slate",
    keySignals: ["Business KPIs tied to services", "Customer experience monitored", "Outcomes drive decisions"],
    metricLabel: "Business Outcome Score",
    metricValue: "92/100",
    metricTarget: "Target: > 90",
    trend: trend(86, 4),
    panel: {
      id: "outcome",
      title: "Business Outcome Alignment",
      kicker: "Characteristic 8 of 8",
      summary: "Technology is measured by business outcomes rather than infrastructure metrics.",
      sections: [
        { heading: "Executive Definition", body: "Every critical service is tied to a measurable business outcome — revenue processed, claims throughput, payroll reliability, customer satisfaction. Infrastructure metrics support, but do not replace, business measurement." },
        { heading: "Why It Exists", body: "Infrastructure metrics describe the plumbing; business metrics describe the value. Operations led by business outcomes prioritize correctly under pressure." },
        { heading: "Example Outcomes", body: ["Customer Experience", "Revenue Processing", "Claims Throughput", "Payroll Reliability", "Workforce Productivity"] },
        { heading: "Observable Behaviors", body: ["Business KPIs linked to services", "Customer outcomes monitored", "Product outcomes monitored"] },
        { heading: "Typical KPIs", body: ["Customer Satisfaction", "Claims Success Rate", "Payroll Success Rate", "Service Availability tied to business KPI"] },
        { heading: "Visualizations", body: ["Business Outcome Dashboard", "Customer Journey Reliability Map", "Outcome Dependency Tree"] },
        { heading: "Executive Talking Points", body: ["\"Business outcomes are the primary measure of operational success.\"", "\"Green dashboards with unhappy customers are red dashboards.\""] },
      ],
    },
  },
];

const IMPACTS: { id: string; Icon: typeof Rocket; title: string; value: string; sub: string; color: CharKey; panel: DetailPanel }[] = [
  {
    id: "impact-rel", Icon: ShieldCheck, title: "Reliability Improvement", value: "60–80%", sub: "Reduction in Sev1 incidents", color: "indigo",
    panel: {
      id: "impact-rel", title: "Reliability Improvement", summary: "Measured reduction in Sev1 incidents and customer-impacting outages.",
      sections: [
        { heading: "What This Measures", body: "Year-over-year change in Sev1 incident volume, customer-impacting minutes, and repeat incident rate across tier-1 services." },
        { heading: "Availability Trends", body: ["Tier-1 availability trending from 99.5% → 99.95% over 12–18 months", "Error budget burn within target on >85% of services", "Customer-impacting minutes reduced 70%"] },
        { heading: "Incident Reduction Trends", body: ["Sev1 down 60–80%", "Sev2 down 40–60%", "Repeat incident rate < 5%"] },
        { heading: "Reliability Scorecards", body: ["Per-service SLO scorecard", "Per-domain incident scorecard", "Executive reliability index"] },
      ],
    },
  },
  {
    id: "impact-vel", Icon: Rocket, title: "Velocity Increase", value: "2–5x", sub: "Faster delivery of changes", color: "sky",
    panel: {
      id: "impact-vel", title: "Velocity Increase", summary: "Throughput improvement driven by platform adoption and automation.",
      sections: [
        { heading: "Deployment Frequency", body: ["From weekly to multiple per day on tier-1 services", "Self-service deploys for >70% of teams"] },
        { heading: "Lead Time For Change", body: ["From weeks to hours on golden paths", "Change failure rate < 5%"] },
        { heading: "Release Success Metrics", body: ["Automated rollback coverage > 90%", "Time-to-restore < 30 minutes"] },
      ],
    },
  },
  {
    id: "impact-cost", Icon: DollarSign, title: "Cost Optimization", value: "20–35%", sub: "Infrastructure and ops savings", color: "emerald",
    panel: {
      id: "impact-cost", title: "Cost Optimization", summary: "Sustained reduction in infrastructure and operational unit cost.",
      sections: [
        { heading: "FinOps Dashboard", body: ["Per-service unit economics", "Idle and orphaned resource elimination", "Reserved vs on-demand mix optimized"] },
        { heading: "Cloud Efficiency", body: ["Right-sizing coverage > 80%", "Storage tiering automated", "Egress and inter-AZ traffic measured and optimized"] },
        { heading: "Unit Economics", body: ["Cost per transaction tracked per service", "Cost trend reviewed quarterly with owners"] },
      ],
    },
  },
  {
    id: "impact-cx", Icon: UserCircle2, title: "Customer Experience", value: "30–50%", sub: "Improvement in NPS / CSAT", color: "orange",
    panel: {
      id: "impact-cx", title: "Customer Experience", summary: "Customer-perceived reliability and experience improvement.",
      sections: [
        { heading: "Customer Journey Health", body: ["End-to-end journey SLOs", "Critical path monitoring", "Customer-impacting minutes tied to journeys"] },
        { heading: "Experience Metrics", body: ["NPS / CSAT trending", "Support ticket volume per customer-impacting minute"] },
        { heading: "Service Reliability", body: ["Tier-1 service SLO compliance", "Customer-impacting incident rate"] },
      ],
    },
  },
  {
    id: "impact-acq", Icon: Landmark, title: "Acquisition Acceleration", value: "50–70%", sub: "Faster time to operational readiness", color: "violet",
    panel: {
      id: "impact-acq", title: "Acquisition Acceleration", summary: "Time-to-operational-readiness compression through the integration factory.",
      sections: [
        { heading: "Integration Metrics", body: ["Time to operational readiness: 18m → 6–9m", "Standard tooling adoption within 90 days"] },
        { heading: "Readiness Scores", body: ["Per-acquisition readiness radar", "Platform consolidation index"] },
        { heading: "Standardization Metrics", body: ["Observability standard adoption %", "Security control standard adoption %", "CI/CD standard adoption %"] },
      ],
    },
  },
];

const MATURITY: { label: string; level: "High" | "Medium-High" | "Medium" | "Low"; pct: number; panel: DetailPanel }[] = [
  { label: "Ownership & Accountability", level: "High",        pct: 92, panel: maturityPanel("Ownership & Accountability", "High", 92) },
  { label: "Reliability Engineering",    level: "High",        pct: 90, panel: maturityPanel("Reliability Engineering", "High", 90) },
  { label: "Platform Adoption",          level: "Medium-High", pct: 78, panel: maturityPanel("Platform Adoption", "Medium-High", 78) },
  { label: "Automation",                 level: "High",        pct: 86, panel: maturityPanel("Automation", "High", 86) },
  { label: "Modernization",              level: "Medium",      pct: 64, panel: maturityPanel("Modernization", "Medium", 64) },
  { label: "Acquisition Readiness",      level: "Medium-High", pct: 75, panel: maturityPanel("Acquisition Readiness", "Medium-High", 75) },
  { label: "Outcome Alignment",          level: "High",        pct: 92, panel: maturityPanel("Outcome Alignment", "High", 92) },
];

function maturityPanel(label: string, level: string, pct: number): DetailPanel {
  return {
    id: `mat-${label}`, title: `${label} — ${level}`, kicker: "Maturity indicator",
    summary: `${label} is currently rated ${level} (${pct}/100) against industry benchmarks.`,
    sections: [
      { heading: "What Good Looks Like", body: `${label} at the High maturity tier reflects standardized practice, measurable behaviors, and outcome accountability across the portfolio.` },
      { heading: "Industry Benchmarks", body: ["Top quartile: > 85", "Median: 60–75", "Bottom quartile: < 55"] },
      { heading: "Maturity Scoring", body: ["Practice depth (40%)", "Adoption breadth (30%)", "Outcome evidence (30%)"] },
      { heading: "Example Operational Behaviors", body: ["Behaviors are observable in tooling, not only in policy", "Cadence reviews use the same evidence as operations", "Improvements are tracked as a roadmap, not a list"] },
      { heading: "Example KPIs", body: ["Coverage %", "Trend over trailing 90 days", "Outcome KPI correlation"] },
      { heading: "Improvement Recommendations", body: [
        "Identify the lowest-coverage domain and assign a named owner",
        "Move two manual practices into the platform default this quarter",
        "Add the practice's outcome KPI to the executive scorecard",
      ]},
    ],
  };
}

const SIGNALS: { id: string; Icon: typeof Eye; title: string; sub: string; panel: DetailPanel }[] = [
  signal("sig-obs",  Eye,            "Unified Observability", "Single source of truth for telemetry and insights"),
  signal("sig-data", ClipboardList,  "Data-Driven Decisions", "Metrics guide prioritization and investments"),
  signal("sig-team", UsersRound,     "Engaged Teams",         "Teams own outcomes and take initiative"),
  signal("sig-wf",   Settings2,      "Efficient Workflows",   "Work flows, not tickets. Friction is minimized."),
  signal("sig-sec",  Lock,           "Built-In Security",     "Security is part of every workflow and platform"),
  signal("sig-lrn",  GraduationCap,  "Continuous Learning",   "Feedback loops drive constant improvement"),
];

function signal(id: string, Icon: typeof Eye, title: string, sub: string) {
  return {
    id, Icon, title, sub,
    panel: {
      id, title, kicker: "Observable signal", summary: sub,
      sections: [
        { heading: "Definition", body: `${title} describes a behavior pattern that is consistently observable across the organization, not only in pilot teams.` },
        { heading: "Why It Matters", body: "Signals are leading indicators. They appear before outcomes shift and are early evidence that the operating model is taking root." },
        { heading: "Observable Evidence", body: [
          "Cross-team usage of common tooling",
          "Shared dashboards referenced in operating reviews",
          "Recurring practices reflected in team rituals",
        ]},
        { heading: "Example Dashboards", body: ["Signal coverage by domain", "Signal trend over trailing 90 days", "Signal correlation with outcome KPIs"] },
        { heading: "KPIs", body: ["Coverage %", "Adoption velocity", "Outcome correlation"] },
        { heading: "SLAs", body: ["Signal coverage reviewed quarterly", "Gaps assigned to a named owner within 30 days"] },
      ],
    },
  };
}

const BOTTOM_LINE: { id: string; Icon: typeof CheckCircle2; title: string; sub: string; panel: DetailPanel }[] = [
  {
    id: "bl-rel", Icon: CheckCircle2, title: "Higher Reliability", sub: "Fewer incidents, more stability",
    panel: {
      id: "bl-rel", title: "Higher Reliability", summary: "Sustained reliability uplift across tier-1 services.",
      sections: [
        { heading: "Availability", body: ["Tier-1 99.95%+", "Tier-2 99.9%+", "Customer-impacting minutes ↓ 70%"] },
        { heading: "Error Budget Performance", body: ["Budgets honored on >85% of services", "Error-budget-driven release gating"] },
        { heading: "Incident Reduction", body: ["Sev1 ↓ 60–80%", "Repeat incidents <5%", "MTTR within target on >90% of incidents"] },
      ],
    },
  },
  {
    id: "bl-vel", Icon: LineIcon, title: "Faster Velocity", sub: "Ship better software, faster",
    panel: {
      id: "bl-vel", title: "Faster Velocity", summary: "Throughput and quality moving together.",
      sections: [
        { heading: "Release Frequency", body: ["Multiple deploys per day on tier-1", "Weekly cadence even on legacy estates"] },
        { heading: "Lead Time", body: ["Commit to production within hours", "Change failure rate < 5%"] },
        { heading: "Deployment Success", body: ["Automated rollback > 90%", "Progressive delivery default"] },
      ],
    },
  },
  {
    id: "bl-cx", Icon: Heart, title: "Happier Customers", sub: "Better experiences, stronger loyalty",
    panel: {
      id: "bl-cx", title: "Happier Customers", summary: "Customer-perceived reliability and experience uplift.",
      sections: [
        { heading: "Experience Metrics", body: ["NPS / CSAT ↑ 30–50%", "Support volume per customer down"] },
        { heading: "Reliability Metrics", body: ["Customer-impacting minutes ↓", "Critical journey SLO compliance"] },
        { heading: "Business Outcomes", body: ["Revenue protected", "Retention uplift", "Operational risk reduced"] },
      ],
    },
  },
];

/* ------------------------------- Component ------------------------------- */

export default function ProductReliabilityAnatomy() {
  const [panel, setPanel] = useState<DetailPanel | null>(null);

  const radarData = useMemo(
    () => CHARACTERISTICS.map((c) => ({ subject: c.title.split(" ")[0], score: 60 + Math.round(Math.random() * 35) })),
    [],
  );

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
                  <span>Executive Field Guide</span>
                </div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  Anatomy of a Modern Product Reliability Organization
                </h1>
                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">
                  Observable characteristics of organizations that have operationalized reliability, ownership,
                  platform engineering, automation, and modernization. Every element on this page is interactive —
                  click any card, metric, or signal to open the executive detail panel.
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-1 text-right">
                <Badge variant="outline" className="border-slate-300 text-slate-600">Live operating model</Badge>
                <span className="text-[11px] text-slate-500">8 characteristics · 5 impact bands · 6 signals</span>
              </div>
            </div>

            {/* What this means strip */}
            <div className="mt-5 flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <Users2 className="mt-0.5 h-4 w-4 text-slate-600" />
              <div className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">What This Means</span>
                <span className="ml-3 text-slate-600">
                  When the foundations are put into practice, these characteristics emerge. They are measurable,
                  repeatable, and drive business outcomes.
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="mx-auto max-w-[1600px] px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left: 8 characteristics */}
            <section className="col-span-12 xl:col-span-9">
              <SectionTitle eyebrow="The 8 Defining Characteristics" title="What good actually looks like" />
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
                {CHARACTERISTICS.map((c) => (
                  <CharacteristicCard key={c.id} c={c} onOpen={() => setPanel(c.panel)} />
                ))}
              </div>
            </section>

            {/* Right rail: impacts + maturity */}
            <aside className="col-span-12 xl:col-span-3 space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    How These Characteristics Drive Impact
                  </div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {IMPACTS.map((i) => {
                    const col = CHAR_COLORS[i.color];
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
                            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: col.ring }}>
                              {i.title}
                            </div>
                            <div className="text-base font-semibold text-slate-900">{i.value}</div>
                            <div className="text-[12px] leading-snug text-slate-600">{i.sub}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Leading Indicators of Maturity
                  </div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {MATURITY.map((m) => (
                    <li key={m.label}>
                      <button
                        onClick={() => setPanel(m.panel)}
                        className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
                      >
                        <div className="w-40 truncate text-[12px] text-slate-700">{m.label}</div>
                        <div className="flex-1">
                          <Progress value={m.pct} className="h-1.5 bg-slate-100" />
                        </div>
                        <div className="w-20 text-right text-[11px] font-medium text-slate-600">{m.level}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Maturity Profile
                </div>
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

          {/* Observable Signals */}
          <section className="mt-10">
            <SectionTitle eyebrow="Observable Signals Across The Organization" title="Leading indicators visible in daily operations" />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {SIGNALS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPanel(s.panel)}
                  className="group rounded-lg border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-400 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <s.Icon className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">{s.title}</div>
                  <div className="mt-1 text-[12px] leading-snug text-slate-600">{s.sub}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Bottom line */}
          <section className="mt-10 overflow-hidden rounded-xl border border-slate-900 bg-slate-900 text-slate-50">
            <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
                  <Star className="h-5 w-5 text-slate-100" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-300">The Bottom Line</div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">
                    When these characteristics are present, organizations deliver reliable products, accelerate
                    innovation, reduce cost, and create exceptional experiences — consistently.
                  </p>
                </div>
              </div>
              <div className="md:col-span-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {BOTTOM_LINE.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setPanel(b.panel)}
                    className="group flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-left transition hover:bg-slate-800"
                  >
                    <b.Icon className="mt-0.5 h-5 w-5 text-slate-100" />
                    <div>
                      <div className="text-sm font-semibold text-slate-50">{b.title}</div>
                      <div className="text-[12px] leading-snug text-slate-300">{b.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Detail Sheet */}
        <Sheet open={!!panel} onOpenChange={(o) => !o && setPanel(null)}>
          <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto bg-white">
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

function CharacteristicCard({ c, onOpen }: { c: Characteristic; onOpen: () => void }) {
  const col = CHAR_COLORS[c.color];
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Accent rail */}
      <div className="h-1 w-full" style={{ backgroundColor: col.ring }} />
      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-start gap-3 px-4 pt-4">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[12px] font-bold text-white"
            style={{ backgroundColor: col.ring }}
          >
            {c.num}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold leading-snug text-slate-900 group-hover:underline">
              {c.title}
            </div>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: col.soft }}
          >
            <c.Icon className="h-4 w-4" style={{ color: col.ring }} />
          </div>
        </div>

        <p className="mt-2 px-4 text-[12.5px] leading-relaxed text-slate-600">{c.oneLine}</p>
      </button>

      {/* Key signals */}
      <div className="px-4 pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key Signals</div>
        <ul className="mt-1 space-y-1">
          {c.keySignals.map((k, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: col.ring }} />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Metric block */}
      <button
        onClick={onOpen}
        className="mt-3 block w-full px-4 pb-4 text-left"
      >
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] font-medium text-slate-600">{c.metricLabel}</div>
            <div className="text-[10px] text-slate-500">{c.metricTarget}</div>
          </div>
          <div className="mt-1 flex items-end gap-3">
            {c.donut ? (
              <div className="relative h-16 w-16 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={c.donut}
                      dataKey="value"
                      innerRadius="60%"
                      outerRadius="100%"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {c.donut.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-slate-800">
                  {c.metricValue}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-semibold tracking-tight" style={{ color: col.ring }}>
                {c.metricValue}
              </div>
            )}
            <div className="h-12 min-w-0 flex-1">
              <ResponsiveContainer>
                <AreaChart data={c.trend}>
                  <defs>
                    <linearGradient id={`g-${c.id}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={col.ring} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={col.ring} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="v"
                    stroke={col.ring}
                    strokeWidth={1.6}
                    fill={`url(#g-${c.id})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {c.donut && (
            <ul className="mt-2 space-y-0.5">
              {c.donut.map((d) => (
                <li key={d.label} className="flex items-center justify-between text-[10.5px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.label}
                  </span>
                  <span className="tabular-nums">{d.value}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </button>
    </article>
  );
}
