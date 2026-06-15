import { useMemo, useState } from "react";
import {
  Users, Workflow, Ticket, HelpCircle, Boxes,
  Wrench, BellRing, GitBranch, Layers, Building2,
  Database, AlertTriangle, PackagePlus, Server, Bot, Eye,
  Smile, DollarSign, Timer, ShieldAlert, Scale,
  Flame, ArrowRight, X, TrendingDown, Activity, ChevronRight,
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

type Challenge = {
  id: string;
  title: string;
  category: string;
  icon: any;
  oneLine: string;
  executiveSummary: string;
  whatThisMeans: string;
  whyItHappens: string[];
  symptoms: string[];
  operationalImpact: string[];
  businessImpact: string[];
  financialImpact: string[];
  customerImpact: string[];
  kpis: { label: string; value: string; trend?: string }[];
  slaDegradation: string;
  execComplaints: string[];
  benchmarks: { label: string; legacy: string; modern: string }[];
  related: string[];
  visual: "trend" | "bar" | "radar" | "line" | "stack";
};

const CHALLENGES: Challenge[] = [
  // People & Organization
  {
    id: "reactive",
    title: "Reactive & Firefighting",
    category: "People & Organization",
    icon: Flame,
    oneLine: "Energy spent responding to incidents rather than preventing them.",
    executiveSummary: "Organization spends most energy responding to incidents rather than preventing them.",
    whatThisMeans: "Engineering capacity is consumed by unplanned work. Strategic initiatives are deprioritized whenever an incident bridge opens.",
    whyItHappens: ["Weak preventive engineering practices", "Limited observability and early warning", "No error-budget discipline", "Reward systems favor heroics over prevention"],
    symptoms: ["Frequent Sev1 incidents", "Long escalation bridges", "High operational stress", "Unplanned work dominates sprints"],
    operationalImpact: ["Constant interruption", "Reduced engineering throughput", "Burnout and attrition risk"],
    businessImpact: ["Delayed initiatives", "Reduced customer confidence", "Slower revenue realization"],
    financialImpact: ["15–25% of engineering payroll absorbed by unplanned work", "Incident handling cost rises with severity"],
    customerImpact: ["Repeat outages erode trust", "Support escalations rise"],
    kpis: [
      { label: "Sev1 Frequency", value: "4.2 / mo", trend: "+18%" },
      { label: "MTTD", value: "42 min", trend: "+9%" },
      { label: "MTTR", value: "3.8 hrs", trend: "+12%" },
      { label: "Unplanned Work", value: "47%", trend: "+6%" },
    ],
    slaDegradation: "SLO burn-rate exceeds budget in 3 of 4 quarters",
    execComplaints: ['"We keep solving the same problem."', '"My best engineers are firefighting, not building."'],
    benchmarks: [
      { label: "Unplanned Work %", legacy: "45–55%", modern: "<20%" },
      { label: "Sev1 / month", legacy: "4–6", modern: "<1" },
    ],
    related: ["interruptions", "ownership", "automation"],
    visual: "trend",
  },
  {
    id: "siloed",
    title: "Siloed & Handoff Heavy",
    category: "People & Organization",
    icon: Workflow,
    oneLine: "Work moves between teams instead of being owned end-to-end.",
    executiveSummary: "Work moves between teams instead of being owned end-to-end.",
    whatThisMeans: "Outcomes are nobody's responsibility. Each team optimizes its own queue, and value flow is fractured.",
    whyItHappens: ["Functional org structures", "Tooling boundaries", "Approval gates between teams", "Lack of shared SLOs"],
    symptoms: ["Multiple approvals per change", "Escalation chains", "Delayed decisions", "Repeated context-setting"],
    operationalImpact: ["High coordination overhead", "Queue time dominates lead time"],
    businessImpact: ["Slow response to market", "Frustrated stakeholders"],
    financialImpact: ["Lead time inflation increases cost-to-deliver by 20–40%"],
    customerImpact: ["Slower issue resolution", "Inconsistent experience"],
    kpis: [
      { label: "Handoffs / Incident", value: "6.3", trend: "+11%" },
      { label: "Resolution Time", value: "5.1 hrs", trend: "+14%" },
      { label: "Cross-Team Deps", value: "9 / sprint" },
    ],
    slaDegradation: "Resolution SLAs missed in cross-domain incidents 38% of the time",
    execComplaints: ['"Why does every change need five teams?"'],
    benchmarks: [
      { label: "Handoffs per change", legacy: "5–8", modern: "≤2" },
    ],
    related: ["ticket", "ownership", "standardization"],
    visual: "bar",
  },
  {
    id: "ticket",
    title: "Ticket-Driven Culture",
    category: "People & Organization",
    icon: Ticket,
    oneLine: "Work is organized around queues instead of outcomes.",
    executiveSummary: "Operational work is organized around queues instead of outcomes.",
    whatThisMeans: "Teams optimize for ticket throughput, not for service health or customer outcomes.",
    whyItHappens: ["ITSM tooling-centric processes", "KPIs that reward ticket closure", "Lack of product orientation"],
    symptoms: ["Long ticket queues", "Slow execution", "Poor responsiveness", "Tickets bounce between queues"],
    operationalImpact: ["Long aging", "Low first-time resolution"],
    businessImpact: ["Delivery delays", "Reduced agility"],
    financialImpact: ["Cost-per-ticket rises while value-per-ticket falls"],
    customerImpact: ["Frustration with response times"],
    kpis: [
      { label: "Ticket Backlog", value: "1,284" },
      { label: "Ticket Aging (avg)", value: "11.3 d" },
      { label: "Resolution Time", value: "4.7 d" },
    ],
    slaDegradation: "P3/P4 SLA compliance ~72%",
    execComplaints: ['"Why is everything a ticket?"'],
    benchmarks: [{ label: "Avg aging", legacy: "8–14 d", modern: "<3 d" }],
    related: ["siloed", "manual", "standardization"],
    visual: "line",
  },
  {
    id: "ownership",
    title: "Operational Ownership Ambiguity",
    category: "People & Organization",
    icon: HelpCircle,
    oneLine: "Many participate, nobody owns outcomes.",
    executiveSummary: "Many people participate but nobody owns outcomes.",
    whatThisMeans: "Incidents pull in large groups. RCAs stall. Improvement actions are not assigned or tracked.",
    whyItHappens: ["Matrixed org with unclear RACI", "Shared services without service owners"],
    symptoms: ["Crowded bridges", "Unassigned RCA actions", "Repeat incidents"],
    operationalImpact: ["Slower MTTR", "Lower RCA closure"],
    businessImpact: ["Recurring outages", "Eroded trust in IT"],
    financialImpact: ["Avoidable rework cost 8–12% of operations budget"],
    customerImpact: ["Repeat outages of the same service"],
    kpis: [
      { label: "Incident Participants", value: "14 avg" },
      { label: "Escalation Count", value: "3.1 / inc" },
      { label: "RCA Completion", value: "61%" },
    ],
    slaDegradation: "RCA SLA missed in 39% of Sev1/Sev2",
    execComplaints: ['"Too many people show up but nobody owns it."'],
    benchmarks: [{ label: "Bridge participants", legacy: "12–20", modern: "3–6" }],
    related: ["siloed", "service-ownership"],
    visual: "bar",
  },
  {
    id: "service-ownership",
    title: "Lack of Service Ownership",
    category: "People & Organization",
    icon: Users,
    oneLine: "Teams consume services without owning reliability, cost, or outcomes.",
    executiveSummary: "Teams consume services without owning reliability, cost, or outcomes.",
    whatThisMeans: "Service catalog exists but accountability is diffuse. Cost, SLO and reliability decisions drift to central teams.",
    whyItHappens: ["Central IT operating model", "No product-team alignment", "Missing service catalog ownership"],
    symptoms: ["No clear service owner", "Reliability decisions made centrally"],
    operationalImpact: ["Lower SLO compliance", "Unclear cost attribution"],
    businessImpact: ["Slow modernization decisions"],
    financialImpact: ["Unattributed infra spend 15–30% of bill"],
    customerImpact: ["Inconsistent service quality"],
    kpis: [
      { label: "Service Ownership Coverage", value: "48%" },
      { label: "Cost Accountability", value: "Partial" },
      { label: "SLO Compliance", value: "78%" },
    ],
    slaDegradation: "Services without owners show 2.3x more SLO breaches",
    execComplaints: ['"Who owns this service?"'],
    benchmarks: [{ label: "Owner coverage", legacy: "<60%", modern: ">95%" }],
    related: ["ownership", "vendor"],
    visual: "radar",
  },
  // Process & Operating Model
  {
    id: "manual",
    title: "Manual & Repetitive Work",
    category: "Process & Operating Model",
    icon: Wrench,
    oneLine: "Humans perform repeatable tasks that should be automated.",
    executiveSummary: "Humans perform repeatable tasks that should be automated.",
    whatThisMeans: "Toil consumes engineering capacity that should be reinvested into reliability and product engineering.",
    whyItHappens: ["No platform engineering function", "Runbooks not codified", "Tool fragmentation prevents automation"],
    symptoms: ["High toil hours", "Repetitive runbooks", "Manual approvals"],
    operationalImpact: ["Lower throughput", "Error-prone execution"],
    businessImpact: ["Slow scale-out", "Higher unit cost"],
    financialImpact: ["Each 10% toil reduction frees ~$1.2M / 100 engineers"],
    customerImpact: ["Slow provisioning of new services"],
    kpis: [
      { label: "Automation Coverage", value: "34%" },
      { label: "Manual Interventions", value: "612 / wk" },
      { label: "Toil Hours", value: "1,920 / mo" },
    ],
    slaDegradation: "Provisioning SLA missed 28% due to manual steps",
    execComplaints: ['"Why is this still manual?"'],
    benchmarks: [{ label: "Toil share", legacy: ">40%", modern: "<20%" }],
    related: ["reactive", "automation"],
    visual: "stack",
  },
  {
    id: "interruptions",
    title: "Constant Interruptions",
    category: "Process & Operating Model",
    icon: BellRing,
    oneLine: "Operational noise consumes strategic capacity.",
    executiveSummary: "Operational noise consumes strategic capacity.",
    whatThisMeans: "Engineers cannot sustain deep work. Strategic backlog ages while reactive tasks dominate.",
    whyItHappens: ["No interrupt-shielding rotation", "Alert noise and pager fatigue", "Lack of self-service"],
    symptoms: ["High pager load", "Context switching", "Strategic backlog aging"],
    operationalImpact: ["Lower focus", "Higher error rate"],
    businessImpact: ["Roadmap slippage"],
    financialImpact: ["10–20% productivity loss from context switching"],
    customerImpact: ["Slower feature delivery"],
    kpis: [
      { label: "Interruptions / Week", value: "38" },
      { label: "Strategic Capacity %", value: "29%" },
      { label: "Context Switches / Day", value: "11" },
    ],
    slaDegradation: "Strategic milestones slip in 2 of 3 quarters",
    execComplaints: ['"My teams cannot focus."'],
    benchmarks: [{ label: "Strategic capacity", legacy: "<35%", modern: ">60%" }],
    related: ["reactive", "manual"],
    visual: "stack",
  },
  {
    id: "change-risk",
    title: "Change & Release Risk",
    category: "Process & Operating Model",
    icon: GitBranch,
    oneLine: "Changes create instability and uncertainty.",
    executiveSummary: "Changes create instability and uncertainty.",
    whatThisMeans: "Releases are infrequent, large, and risky. Rollbacks are common. CAB becomes the bottleneck.",
    whyItHappens: ["Large batch sizes", "Weak test automation", "Missing progressive delivery"],
    symptoms: ["Frequent rollbacks", "CAB bottlenecks", "Failed deployments"],
    operationalImpact: ["Long change freezes", "Rework"],
    businessImpact: ["Slow release of value", "Reputational risk"],
    financialImpact: ["Each failed change averages $35–80K in remediation"],
    customerImpact: ["Disruption during releases"],
    kpis: [
      { label: "Change Failure Rate", value: "17%" },
      { label: "Rollback Frequency", value: "11 / mo" },
      { label: "Deploy Success Rate", value: "83%" },
    ],
    slaDegradation: "Post-release SLO burn doubles for 48 hrs",
    execComplaints: ['"Every release feels like a coin flip."'],
    benchmarks: [{ label: "Change Failure Rate", legacy: ">15%", modern: "<5%" }],
    related: ["standardization", "automation"],
    visual: "line",
  },
  {
    id: "standardization",
    title: "Lack of Standardization",
    category: "Process & Operating Model",
    icon: Layers,
    oneLine: "Every team implements processes differently.",
    executiveSummary: "Every team implements processes differently.",
    whatThisMeans: "Process variance multiplies tooling, training, and support cost. Outcomes vary by team rather than by design.",
    whyItHappens: ["Federated teams without platform guardrails", "Acquisition layering"],
    symptoms: ["Variant pipelines", "Inconsistent reliability practices"],
    operationalImpact: ["Higher cognitive load", "Slower onboarding"],
    businessImpact: ["Unpredictable delivery"],
    financialImpact: ["Variance adds 12–18% to platform spend"],
    customerImpact: ["Inconsistent experience across products"],
    kpis: [
      { label: "Standard Adoption", value: "41%" },
      { label: "Process Variance Index", value: "0.62" },
      { label: "Platform Variance", value: "High" },
    ],
    slaDegradation: "SLA outcomes vary by team by ±22%",
    execComplaints: ['"Why does each team do this differently?"'],
    benchmarks: [{ label: "Standard adoption", legacy: "<50%", modern: ">85%" }],
    related: ["fragmented-tools", "siloed"],
    visual: "bar",
  },
  {
    id: "vendor",
    title: "Vendor Dependency Without Innovation",
    category: "Process & Operating Model",
    icon: Building2,
    oneLine: "Partners maintain operations but do not improve them.",
    executiveSummary: "Partners maintain operations but do not improve them.",
    whatThisMeans: "Managed service contracts deliver run-the-business outcomes but not modernization, automation, or capability uplift.",
    whyItHappens: ["SLAs reward steady-state, not modernization", "Lack of innovation KPIs in contracts"],
    symptoms: ["Flat automation coverage", "Year-over-year toil unchanged"],
    operationalImpact: ["Stalled modernization"],
    businessImpact: ["Falling behind peers"],
    financialImpact: ["Run cost flat or rising; innovation budget squeezed"],
    customerImpact: ["No experience improvements"],
    kpis: [
      { label: "Modernization Velocity", value: "Low" },
      { label: "Innovation Adoption", value: "12%" },
      { label: "Automation Growth (YoY)", value: "+3%" },
    ],
    slaDegradation: "Operational SLAs met, modernization SLOs absent",
    execComplaints: ['"They keep the lights on but do not move us forward."'],
    benchmarks: [{ label: "Automation YoY", legacy: "<5%", modern: ">25%" }],
    related: ["service-ownership", "automation"],
    visual: "line",
  },
  // Technology & Platform
  {
    id: "fragmented-tools",
    title: "Fragmented Tools & Data",
    category: "Technology & Platform",
    icon: Database,
    oneLine: "Multiple tools provide disconnected views of operations.",
    executiveSummary: "Multiple tools provide disconnected views of operations.",
    whatThisMeans: "Operations and engineering pay a tax to integrate signals manually. Decisions are made on partial information.",
    whyItHappens: ["Tool-by-tool procurement", "M&A inheritance", "No platform strategy"],
    symptoms: ["Tool sprawl", "Duplicate dashboards", "Manual correlation"],
    operationalImpact: ["Slower triage", "Blind spots"],
    businessImpact: ["Poor decision quality"],
    financialImpact: ["20–35% of observability spend duplicated"],
    customerImpact: ["Slower problem isolation"],
    kpis: [
      { label: "Tool Count", value: "47" },
      { label: "Duplicate Tooling", value: "31%" },
      { label: "Data Sources", value: "112" },
    ],
    slaDegradation: "Triage adds 18 min average due to tool switching",
    execComplaints: ['"Which dashboard is right?"'],
    benchmarks: [{ label: "Tool count", legacy: ">30", modern: "<12 consolidated" }],
    related: ["visibility", "standardization"],
    visual: "bar",
  },
  {
    id: "legacy-debt",
    title: "Legacy & Technical Debt",
    category: "Technology & Platform",
    icon: Server,
    oneLine: "Aging technology increases complexity and slows modernization.",
    executiveSummary: "Aging technology increases complexity and slows modernization.",
    whatThisMeans: "Legacy assets accumulate cost, risk, and operational drag. Modernization is deferred and compounds.",
    whyItHappens: ["Underinvestment in remediation", "Acquisition debt", "End-of-life software"],
    symptoms: ["Unsupported software", "Brittle integrations", "High patch failure rate"],
    operationalImpact: ["Higher incident frequency", "Slower change"],
    businessImpact: ["Modernization cost compounds"],
    financialImpact: ["Each year of deferral grows remediation 18–25%"],
    customerImpact: ["Experience constrained by legacy"],
    kpis: [
      { label: "Legacy Asset %", value: "38%" },
      { label: "Unsupported Software %", value: "12%" },
      { label: "Tech Debt Index", value: "7.2 / 10" },
    ],
    slaDegradation: "Legacy services account for 62% of Sev1 incidents",
    execComplaints: ['"How did we get here?"'],
    benchmarks: [{ label: "Legacy share", legacy: ">30%", modern: "<15%" }],
    related: ["acquisition", "environment-sprawl"],
    visual: "stack",
  },
  {
    id: "acquisition",
    title: "Acquisition Onboarding Risk",
    category: "Technology & Platform",
    icon: PackagePlus,
    oneLine: "New acquisitions introduce unknown technology and operational risk.",
    executiveSummary: "New acquisitions introduce unknown technology and operational risk.",
    whatThisMeans: "Integrations stretch beyond plan. Unknown assets create reliability and compliance exposure.",
    whyItHappens: ["No standard integration playbook", "Limited discovery in diligence"],
    symptoms: ["Unknown assets", "Duplicate platforms", "Inconsistent operating models"],
    operationalImpact: ["Surprise incidents", "Higher operating cost"],
    businessImpact: ["Deal value erosion"],
    financialImpact: ["Integration overrun typically 30–50% over plan"],
    customerImpact: ["Disruption during cut-over"],
    kpis: [
      { label: "Integration Duration", value: "14 mo" },
      { label: "Unknown Assets", value: "240+" },
      { label: "Duplicate Platforms", value: "18" },
    ],
    slaDegradation: "Acquired services run at 2x incident rate for 12+ months",
    execComplaints: ['"Skeletons in the closet."'],
    benchmarks: [{ label: "Integration duration", legacy: "12–24 mo", modern: "<6 mo" }],
    related: ["legacy-debt", "environment-sprawl"],
    visual: "radar",
  },
  {
    id: "environment-sprawl",
    title: "Environment Sprawl",
    category: "Technology & Platform",
    icon: Boxes,
    oneLine: "Too many environments create operational overhead.",
    executiveSummary: "Too many environments create operational overhead.",
    whatThisMeans: "Configuration drift and snowflakes drive defects to production and increase support cost.",
    whyItHappens: ["Long-lived environments", "Manual provisioning", "Per-team environments"],
    symptoms: ["Config drift", "Environment-specific defects"],
    operationalImpact: ["Defect leakage", "Slow troubleshooting"],
    businessImpact: ["Unpredictable releases"],
    financialImpact: ["Idle environments 18–30% of infra spend"],
    customerImpact: ["Production-only defects"],
    kpis: [
      { label: "Environment Count", value: "84" },
      { label: "Config Drift Index", value: "0.47" },
      { label: "Support Cost / Env", value: "$3.4K / mo" },
    ],
    slaDegradation: "Drift-related incidents add 9% to MTTR",
    execComplaints: ['"Works in QA, fails in prod."'],
    benchmarks: [{ label: "Environments", legacy: ">50", modern: "ephemeral, on-demand" }],
    related: ["legacy-debt", "automation"],
    visual: "bar",
  },
  {
    id: "automation",
    title: "Limited Automation Adoption",
    category: "Technology & Platform",
    icon: Bot,
    oneLine: "Automation exists but is inconsistent and fragmented.",
    executiveSummary: "Automation exists but is inconsistent and fragmented.",
    whatThisMeans: "Automation pockets do not compound. Self-healing and auto-remediation are rare. Toil persists.",
    whyItHappens: ["No platform team", "Federated automation efforts", "Tool fragmentation"],
    symptoms: ["Inconsistent runbooks", "Low self-healing", "Manual remediation"],
    operationalImpact: ["Persistent toil"],
    businessImpact: ["Slow scale"],
    financialImpact: ["Automation gap costs 15–25% of run budget"],
    customerImpact: ["Slow recovery"],
    kpis: [
      { label: "Automation Coverage", value: "34%" },
      { label: "Automated Recovery %", value: "11%" },
      { label: "Self-Healing Events", value: "42 / mo" },
    ],
    slaDegradation: "Recovery SLAs missed when humans are in the loop",
    execComplaints: ['"Why don\'t these recover themselves?"'],
    benchmarks: [{ label: "Auto-recovery", legacy: "<15%", modern: ">60%" }],
    related: ["manual", "fragmented-tools"],
    visual: "stack",
  },
  {
    id: "visibility",
    title: "Poor Operational Visibility",
    category: "Technology & Platform",
    icon: Eye,
    oneLine: "Leaders lack visibility into dependencies and performance.",
    executiveSummary: "Leaders lack visibility into dependencies and performance.",
    whatThisMeans: "Critical service dependencies, ownership, and performance posture are not unified for executive decisions.",
    whyItHappens: ["No service graph", "Disparate CMDB / observability", "No executive layer"],
    symptoms: ["Unknown assets", "Gaps in monitoring", "Manual reports"],
    operationalImpact: ["Slow detection", "Reactive posture"],
    businessImpact: ["Decisions made without data"],
    financialImpact: ["Blind spots drive avoidable incident cost"],
    customerImpact: ["Detection-after-customer"],
    kpis: [
      { label: "Unknown Assets", value: "8%" },
      { label: "Monitoring Coverage", value: "71%" },
      { label: "Dependency Mapping", value: "54%" },
    ],
    slaDegradation: "Customer-reported incidents 24% of total",
    execComplaints: ['"Why am I learning this from the customer?"'],
    benchmarks: [{ label: "Monitoring coverage", legacy: "<80%", modern: ">98%" }],
    related: ["fragmented-tools", "service-ownership"],
    visual: "radar",
  },
  // Business Impact
  {
    id: "cx",
    title: "Customer Experience Vulnerability",
    category: "Business Impact",
    icon: Smile,
    oneLine: "Technology failures directly impact customer experience.",
    executiveSummary: "Technology failures directly impact customer experience.",
    whatThisMeans: "Reliability deficits surface to customers as outages, latency, and support friction.",
    whyItHappens: ["Reactive operations", "Weak SLO discipline"],
    symptoms: ["NPS/CSAT decline", "Outage-driven escalations"],
    operationalImpact: ["Support load spikes"],
    businessImpact: ["Churn risk", "Brand erosion"],
    financialImpact: ["1% availability loss can equal 2–5% revenue impact on digital lines"],
    customerImpact: ["Direct customer-visible failures"],
    kpis: [
      { label: "CSAT", value: "72" },
      { label: "Availability", value: "99.62%" },
      { label: "UX Score", value: "B-" },
    ],
    slaDegradation: "Customer-facing SLA missed 2 of last 6 months",
    execComplaints: ['"Our customers feel this."'],
    benchmarks: [{ label: "Availability", legacy: "<99.9%", modern: ">99.95%" }],
    related: ["reactive", "visibility"],
    visual: "line",
  },
  {
    id: "cost",
    title: "High Operational Cost",
    category: "Business Impact",
    icon: DollarSign,
    oneLine: "Complexity drives unnecessary cost.",
    executiveSummary: "Complexity drives unnecessary cost.",
    whatThisMeans: "Fragmentation, toil, and rework compound into a structurally high run cost.",
    whyItHappens: ["Tool duplication", "Manual work", "Environment sprawl"],
    symptoms: ["High cost per ticket", "High cost per environment"],
    operationalImpact: ["Limited reinvestment"],
    businessImpact: ["Lower margin", "Less innovation funding"],
    financialImpact: ["Run/grow ratio skews to 75/25 or worse"],
    customerImpact: ["Constrained roadmap"],
    kpis: [
      { label: "Cost per Service", value: "$184K / yr" },
      { label: "Cost per Ticket", value: "$42" },
      { label: "Cost per Env", value: "$3.4K / mo" },
    ],
    slaDegradation: "Cost-to-serve trending up despite flat volume",
    execComplaints: ['"Why is run cost still rising?"'],
    benchmarks: [{ label: "Run/Grow ratio", legacy: "75/25", modern: "<60/40" }],
    related: ["fragmented-tools", "manual"],
    visual: "bar",
  },
  {
    id: "ttm",
    title: "Slow Time to Market",
    category: "Business Impact",
    icon: Timer,
    oneLine: "Operational friction slows delivery.",
    executiveSummary: "Operational friction slows delivery.",
    whatThisMeans: "Lead time, deployment frequency, and release cycle time lag industry benchmarks.",
    whyItHappens: ["Manual gates", "Change risk", "Standardization gaps"],
    symptoms: ["Quarterly releases", "Long lead times"],
    operationalImpact: ["Slow value flow"],
    businessImpact: ["Missed market windows"],
    financialImpact: ["Delayed revenue realization"],
    customerImpact: ["Feature gap vs competitors"],
    kpis: [
      { label: "Lead Time for Change", value: "21 d" },
      { label: "Deploy Frequency", value: "Weekly" },
      { label: "Release Cycle Time", value: "6 wks" },
    ],
    slaDegradation: "Release commitments slip in 40% of cycles",
    execComplaints: ['"Why are we slower than the market?"'],
    benchmarks: [{ label: "Lead time", legacy: ">2 wks", modern: "<1 day" }],
    related: ["change-risk", "standardization"],
    visual: "line",
  },
  {
    id: "compliance",
    title: "Risk & Compliance Exposure",
    category: "Business Impact",
    icon: ShieldAlert,
    oneLine: "Operational inconsistency increases audit and compliance risk.",
    executiveSummary: "Operational inconsistency increases audit and compliance risk.",
    whatThisMeans: "Inconsistent controls and patching create audit findings, exceptions, and regulatory exposure.",
    whyItHappens: ["Manual control execution", "Variance across teams"],
    symptoms: ["Audit findings", "Policy exceptions"],
    operationalImpact: ["Remediation churn"],
    businessImpact: ["Regulatory and reputational risk"],
    financialImpact: ["Penalties and remediation cost"],
    customerImpact: ["Trust impact"],
    kpis: [
      { label: "Audit Findings (open)", value: "23" },
      { label: "Policy Exceptions", value: "47" },
      { label: "Patch Compliance", value: "81%" },
    ],
    slaDegradation: "Patch SLA missed on 19% of critical assets",
    execComplaints: ['"We cannot defend this in audit."'],
    benchmarks: [{ label: "Patch compliance", legacy: "<90%", modern: ">98%" }],
    related: ["standardization", "legacy-debt"],
    visual: "bar",
  },
  {
    id: "scalability",
    title: "Lack of Scalability & Agility",
    category: "Business Impact",
    icon: Scale,
    oneLine: "Organization struggles to absorb growth.",
    executiveSummary: "Organization struggles to absorb growth.",
    whatThisMeans: "Each new product, market, or acquisition adds operational drag instead of scaling sub-linearly.",
    whyItHappens: ["No platform leverage", "Hand-crafted operations"],
    symptoms: ["Long onboarding", "Integration overruns"],
    operationalImpact: ["Linear cost scaling"],
    businessImpact: ["Growth ceiling"],
    financialImpact: ["Marginal cost of growth too high"],
    customerImpact: ["Slow geographic / product expansion"],
    kpis: [
      { label: "New Product Onboarding", value: "5 mo" },
      { label: "Acquisition Integration", value: "14 mo" },
      { label: "Platform Scaling", value: "Slow" },
    ],
    slaDegradation: "Capacity events disrupt SLAs 3x / yr",
    execComplaints: ['"We cannot grow at this cost."'],
    benchmarks: [{ label: "Onboarding", legacy: ">3 mo", modern: "<4 wks" }],
    related: ["acquisition", "automation"],
    visual: "radar",
  },
];

const CATEGORIES = [
  { key: "People & Organization", color: "from-rose-500/10 to-rose-500/0", accent: "text-rose-600", dot: "bg-rose-500" },
  { key: "Process & Operating Model", color: "from-amber-500/10 to-amber-500/0", accent: "text-amber-600", dot: "bg-amber-500" },
  { key: "Technology & Platform", color: "from-sky-500/10 to-sky-500/0", accent: "text-sky-600", dot: "bg-sky-500" },
  { key: "Business Impact", color: "from-emerald-600/10 to-emerald-600/0", accent: "text-emerald-700", dot: "bg-emerald-600" },
];

const COMPOUNDED = [
  { key: "Higher Risk", icon: ShieldAlert, value: "+38%", note: "Sev1 frequency vs baseline" },
  { key: "Higher Cost", icon: DollarSign, value: "+22%", note: "Run cost vs benchmark" },
  { key: "Slower Delivery", icon: Timer, value: "3.4x", note: "Lead time vs benchmark" },
  { key: "Lower Reliability", icon: Activity, value: "99.62%", note: "Service availability" },
  { key: "Reduced Agility", icon: Scale, value: "Slow", note: "Time-to-onboard" },
  { key: "Poor CX", icon: Smile, value: "72", note: "CSAT" },
  { key: "Reduced Enterprise Value", icon: TrendingDown, value: "↓", note: "Run/Grow ratio 75/25" },
];

const REINFORCING_CHAIN = [
  { id: "reactive", label: "Reactive Culture" },
  { id: "interruptions", label: "Interruptions" },
  { id: "legacy-debt", label: "Technical Debt" },
  { id: "ttm", label: "Slow Delivery" },
  { id: "cx", label: "Customer Impact" },
  { id: "reactive", label: "More Reactive Work" },
];

// --- Visualizations ---
const trendData = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`,
  Reactive: 60 + Math.round(Math.sin(i / 2) * 8) + i,
  Strategic: 40 - Math.round(Math.sin(i / 2) * 8) - i,
}));
const barData = [
  { name: "Team A", legacy: 7, modern: 2 },
  { name: "Team B", legacy: 6, modern: 2 },
  { name: "Team C", legacy: 8, modern: 3 },
  { name: "Team D", legacy: 5, modern: 1 },
];
const radarData = [
  { axis: "Coverage", legacy: 55, modern: 95 },
  { axis: "Ownership", legacy: 48, modern: 92 },
  { axis: "Automation", legacy: 34, modern: 88 },
  { axis: "Standardization", legacy: 41, modern: 90 },
  { axis: "Visibility", legacy: 60, modern: 96 },
];
const lineData = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`,
  value: 70 + Math.round(Math.cos(i / 2) * 6) + (i % 3),
}));
const stackData = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`,
  Manual: 60 - i * 2,
  Automated: 40 + i * 2,
}));

function ChallengeVisual({ kind }: { kind: Challenge["visual"] }) {
  const common = { strokeWidth: 2 };
  if (kind === "trend") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trendData}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))" }} />
          <Area type="monotone" dataKey="Reactive" stroke="#e11d48" fill="#e11d48" fillOpacity={0.18} {...common} />
          <Area type="monotone" dataKey="Strategic" stroke="#059669" fill="#059669" fillOpacity={0.18} {...common} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  if (kind === "bar") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="legacy" name="Legacy" fill="#e11d48" radius={[4, 4, 0, 0]} />
          <Bar dataKey="modern" name="Modern" fill="#059669" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (kind === "radar") {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          <Radar name="Legacy" dataKey="legacy" stroke="#e11d48" fill="#e11d48" fillOpacity={0.25} />
          <Radar name="Modern" dataKey="modern" stroke="#059669" fill="#059669" fillOpacity={0.25} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }
  if (kind === "line") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={lineData}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))" }} />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={stackData}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
        <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(var(--border))" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Manual" stackId="a" fill="#e11d48" />
        <Bar dataKey="Automated" stackId="a" fill="#059669" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function OperationalFrictionIndex() {
  const [open, setOpen] = useState<Challenge | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  const byCategory = useMemo(() => {
    const m: Record<string, Challenge[]> = {};
    for (const c of CHALLENGES) (m[c.category] ||= []).push(c);
    return m;
  }, []);

  const handleChainClick = (id: string) => {
    const c = CHALLENGES.find((x) => x.id === id);
    if (!c) return;
    setHighlightedIds([id, ...c.related]);
    setOpen(c);
  };

  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider mb-2">
                <span>Site Resilience Engineering</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-700">Operational Friction Index</span>
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                Legacy State: Common Challenges Organizations Face Today
              </h1>
              <p className="mt-2 text-slate-600 max-w-3xl">
                Persistent operational, organizational, and technology challenges that increase risk, slow delivery, and limit business outcomes.
              </p>
            </div>
            <div className="hidden lg:flex gap-2 text-xs">
              <Badge variant="outline" className="border-slate-300 text-slate-600">21 Challenges</Badge>
              <Badge variant="outline" className="border-slate-300 text-slate-600">4 Categories</Badge>
              <Badge variant="outline" className="border-slate-300 text-slate-600">Industry Benchmarks</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 px-8 py-6">
        {/* Main */}
        <div className="col-span-12 xl:col-span-9 space-y-6">
          {CATEGORIES.map((cat) => (
            <section key={cat.key}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">{cat.key}</h2>
                  <span className="text-xs text-slate-400">({byCategory[cat.key]?.length || 0})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {byCategory[cat.key]?.map((c) => {
                  const Icon = c.icon;
                  const isHi = highlightedIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setOpen(c); setHighlightedIds([]); }}
                      className={[
                        "group text-left rounded-lg border bg-white p-4 transition-all",
                        "hover:border-slate-400 hover:shadow-sm",
                        isHi ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-md flex items-center justify-center bg-gradient-to-br ${cat.color} ${cat.accent}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">{c.title}</h3>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.oneLine}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {c.kpis.slice(0, 2).map((k) => (
                              <span key={k.label} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {k.label}: <span className="font-semibold">{k.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Reinforcing chain */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                How These Challenges Reinforce Each Other
              </h2>
            </div>
            <Card className="border-slate-200 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {REINFORCING_CHAIN.map((n, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => handleChainClick(n.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition"
                    >
                      {n.label}
                    </button>
                    {i < REINFORCING_CHAIN.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Click any node to open the related challenge and highlight connected items across the screen.
              </p>
            </Card>
          </section>
        </div>

        {/* Compounded Impact rail */}
        <aside className="col-span-12 xl:col-span-3 space-y-4">
          <Card className="border-slate-200 p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">Compounded Impact</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Cumulative effect of unresolved legacy challenges.</p>
            <div className="space-y-2">
              {COMPOUNDED.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.key}
                    onClick={() => setOpen(CHALLENGES.find((c) => c.title.includes(m.key.split(" ")[1])) || CHALLENGES[0])}
                    className="w-full flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-slate-400 hover:bg-slate-50 text-left transition"
                  >
                    <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">{m.key}</div>
                      <div className="text-[10px] text-slate-500 truncate">{m.note}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{m.value}</div>
                  </button>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div>
              <div className="text-xs text-slate-500 mb-1">Run / Grow Ratio</div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Run 75%</span><span>Grow 25%</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-none sm:w-[35vw] overflow-y-auto bg-white">
          {open && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
                      <open.icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <Badge variant="outline" className="border-slate-300 text-slate-600 text-[10px] mb-1">
                        {open.category}
                      </Badge>
                      <SheetTitle className="text-xl text-slate-900">{open.title}</SheetTitle>
                      <SheetDescription className="text-slate-600">{open.executiveSummary}</SheetDescription>
                    </div>
                  </div>
                  <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 gap-2">
                  {open.kpis.map((k) => (
                    <div key={k.label} className="rounded-md border border-slate-200 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">{k.label}</div>
                      <div className="text-lg font-semibold text-slate-900 mt-0.5">{k.value}</div>
                      {k.trend && <div className="text-[10px] text-rose-600 mt-0.5">{k.trend}</div>}
                    </div>
                  ))}
                </div>

                <Section title="Visualization">
                  <ChallengeVisual kind={open.visual} />
                </Section>

                <Section title="What This Means">
                  <p className="text-sm text-slate-700 leading-relaxed">{open.whatThisMeans}</p>
                </Section>

                <Section title="Why It Happens">
                  <Bullets items={open.whyItHappens} />
                </Section>

                <Section title="Common Symptoms">
                  <Bullets items={open.symptoms} />
                </Section>

                <div className="grid grid-cols-1 gap-4">
                  <Section title="Operational Impact"><Bullets items={open.operationalImpact} /></Section>
                  <Section title="Business Impact"><Bullets items={open.businessImpact} /></Section>
                  <Section title="Financial Impact"><Bullets items={open.financialImpact} /></Section>
                  <Section title="Customer Impact"><Bullets items={open.customerImpact} /></Section>
                </div>

                <Section title="Typical SLA Degradation">
                  <p className="text-sm text-slate-700">{open.slaDegradation}</p>
                </Section>

                <Section title="Common Executive Complaints">
                  <div className="space-y-2">
                    {open.execComplaints.map((q, i) => (
                      <div key={i} className="rounded-md bg-slate-50 border-l-2 border-slate-300 px-3 py-2 text-sm text-slate-700 italic">
                        {q}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Industry Benchmarks">
                  <div className="overflow-hidden rounded-md border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Metric</th>
                          <th className="text-left px-3 py-2 font-medium">Legacy</th>
                          <th className="text-left px-3 py-2 font-medium">Modern</th>
                        </tr>
                      </thead>
                      <tbody>
                        {open.benchmarks.map((b) => (
                          <tr key={b.label} className="border-t border-slate-200">
                            <td className="px-3 py-2 text-slate-700">{b.label}</td>
                            <td className="px-3 py-2 text-rose-700">{b.legacy}</td>
                            <td className="px-3 py-2 text-emerald-700">{b.modern}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section title="Related Challenges">
                  <div className="flex flex-wrap gap-1.5">
                    {open.related.map((rid) => {
                      const r = CHALLENGES.find((x) => x.id === rid);
                      if (!r) return null;
                      return (
                        <button
                          key={rid}
                          onClick={() => setOpen(r)}
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

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
