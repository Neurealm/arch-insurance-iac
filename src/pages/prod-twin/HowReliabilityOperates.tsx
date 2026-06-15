import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Heart, ClipboardCheck, DollarSign, Cloud, GitBranch, Shield, Eye, Database,
  Users, Server, Activity, Bot, Target, CheckCircle2, AlertTriangle, TrendingUp,
  Workflow, Zap, Layers, BarChart3, Cog, Brain, Lock, Sparkles, ArrowRight,
  Gauge, PiggyBank, type LucideIcon,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from "recharts";

/* ---------- Types ---------- */
type Detail = {
  id: string;
  title: string;
  kind: string;
  icon: LucideIcon;
  accent: string; // tailwind text color class
  hover: {
    definition: string;
    owner?: string;
    kpi?: string;
    failure?: string;
    impact?: string;
  };
  panel: {
    summary: string;
    responsibilities?: string[];
    activities?: string[];
    kpis?: { name: string; value: string; trend?: number[] }[];
    workflow?: string[];
    antiPatterns?: string[];
    business?: string;
    customer?: string;
    financial?: string;
    tech?: string[];
    ai?: string[];
    incidents?: { when: string; what: string }[];
    teamStructure?: string[];
    industry?: string[];
    talking?: string;
  };
};

/* ---------- Data ---------- */
const trend = (base: number, vol = 4) =>
  Array.from({ length: 14 }, (_, i) => base + Math.sin(i / 2) * vol + (Math.random() * vol - vol / 2));

const W: Record<string, Detail> = {
  // Workflows
  caregiver: {
    id: "caregiver",
    title: "Caregiver Experience",
    kind: "Business Workflow",
    icon: Heart,
    accent: "text-violet-600",
    hover: {
      definition: "End-to-end experience for a caregiver delivering reliable care in the moments that matter.",
      owner: "Caregiver Experience Product Team",
      kpi: "Visit Completion %",
      failure: "Caregiver unable to submit visit documentation.",
      impact: "Lost revenue, caregiver attrition, member dissatisfaction.",
    },
    panel: {
      summary: "Caregivers depend on a tightly orchestrated mobile, identity, geolocation, claims, and payroll stack to deliver and validate care in the field.",
      workflow: [
        "Caregiver receives assignment",
        "Travels to patient",
        "Documents visit",
        "Completes care",
        "Visit validated",
        "Payroll generated",
      ],
      responsibilities: ["Mobile Platform", "Authentication", "Geolocation/EVV", "Claims", "Payroll"],
      kpis: [
        { name: "Visit Completion %", value: "99.95%", trend: trend(99.9, 0.05) },
        { name: "Mobile App Reliability", value: "99.97%", trend: trend(99.95, 0.04) },
        { name: "Offline Sync Success", value: "99.6%", trend: trend(99.5, 0.2) },
        { name: "Failed Visits / day", value: "12", trend: trend(15, 4) },
      ],
      antiPatterns: ["Treating mobile as a feature, not a product", "No offline-first design", "Ops owns reliability without product involvement"],
      business: "Revenue realization, caregiver retention, member satisfaction.",
      customer: "Members receive on-time, well-documented care. Caregivers feel supported, not stranded.",
      financial: "Each 0.1% drop in visit completion = ~$1.2M annualized revenue at risk.",
      tech: ["iOS/Android", "EVV providers", "Auth0/Okta", "Geolocation APIs"],
      ai: ["Smart route planning", "Documentation summarization", "Anomaly detection on visit patterns"],
      incidents: [
        { when: "08:42", what: "EVV provider regional outage — 312 visits queued, auto-synced on recovery" },
        { when: "11:05", what: "Auth refresh storm — mitigated via token cache" },
      ],
      teamStructure: ["Product Manager", "Mobile Engineers", "SRE embed", "UX Researcher"],
      industry: ["Home Health", "Hospice", "Personal Care"],
      talking: "If a caregiver can't complete a visit, every downstream dollar is at risk.",
    },
  },
  claims: {
    id: "claims",
    title: "Claims Processing",
    kind: "Business Workflow",
    icon: ClipboardCheck,
    accent: "text-blue-600",
    hover: {
      definition: "Accurate, timely claim generation, validation, adjudication, submission and payment.",
      owner: "Claims Processing Product Team",
      kpi: "Claims Processing Success %",
      failure: "Claims fail validation at the clearinghouse and revenue is delayed.",
      impact: "Cash flow disruption and customer dissatisfaction.",
    },
    panel: {
      summary: "Claims is the revenue engine — every workflow step must be reliable, auditable, and observable.",
      workflow: ["Claim Created", "Validated", "Adjudicated", "Submitted", "Paid"],
      kpis: [
        { name: "Claims Throughput", value: "1.4M/day", trend: trend(140, 6) },
        { name: "Processing Success %", value: "99.9%", trend: trend(99.85, 0.06) },
        { name: "Claim Failure Rate", value: "0.10%", trend: trend(0.12, 0.03) },
        { name: "Revenue Leakage", value: "$184K", trend: trend(200, 30) },
      ],
      antiPatterns: ["Manual reprocessing queues", "Silent failure on edge cases", "No SLO on adjudication latency"],
      business: "Direct revenue realization and cash flow.",
      customer: "Providers paid on time. Members billed correctly.",
      financial: "Every 1 bp of failure rate ≈ $2.3M annual leakage.",
      tech: ["Rules engine", "EDI/X12", "Clearinghouse APIs", "Event streaming"],
      ai: ["Failure-cause clustering", "Auto-fix suggestions", "Predictive rejection"],
      teamStructure: ["Claims PM", "Rules Engineers", "Integration Engineers", "Embedded SRE"],
      industry: ["Payer", "Provider", "Clearinghouse"],
      talking: "Reliability of claims is reliability of revenue.",
    },
  },
  payroll: {
    id: "payroll",
    title: "Payroll Reliability",
    kind: "Business Workflow",
    icon: DollarSign,
    accent: "text-teal-600",
    hover: {
      definition: "Accurate pay, on time, every time — for every worker, every cycle.",
      owner: "Payroll Reliability Product Team",
      kpi: "Payroll Accuracy & On-Time %",
      failure: "Missed payroll cycle erodes workforce trust overnight.",
      impact: "Workforce attrition, regulatory exposure, brand damage.",
    },
    panel: {
      summary: "Payroll is a binary reliability function — it either runs perfectly or it is a CEO-level incident.",
      workflow: ["Time Capture", "Validation", "Payroll Processing", "Distribution"],
      kpis: [
        { name: "Payroll Accuracy", value: "99.99%", trend: trend(99.99, 0.01) },
        { name: "On-Time Payroll %", value: "100%", trend: trend(99.99, 0.005) },
        { name: "Payroll Exceptions", value: "47", trend: trend(60, 12) },
      ],
      antiPatterns: ["Manual reconciliation on cycle day", "No dry-run environment", "Ops-only runbooks (no product ownership)"],
      business: "Workforce satisfaction, retention, operational trust.",
      customer: "Caregivers get paid correctly. Always.",
      financial: "A single missed cycle = ~7–12% spike in attrition over 30 days.",
      tech: ["Tax engine", "ACH/banking APIs", "Time & attendance"],
      ai: ["Anomaly detection on hours", "Pre-cycle dry-run validation", "Exception explanation"],
      teamStructure: ["Payroll PM", "Tax/Compliance Eng", "Integration Eng", "SRE embed"],
      industry: ["Healthcare", "Field Services", "Gig Workforce"],
      talking: "Payroll reliability is the most human KPI in the company.",
    },
  },

  // Product team layer
  productTeam: {
    id: "productTeam",
    title: "Product Team",
    kind: "Operating Layer",
    icon: Users,
    accent: "text-violet-600",
    hover: {
      definition: "Owns the product experience and business outcomes end-to-end.",
      owner: "VP Product / Product GM",
      kpi: "Feature Lead Time, CSAT, Release Success Rate",
      failure: "Throwing work to operations after launch.",
      impact: "Reliability debt, slow recovery, misaligned roadmap.",
    },
    panel: {
      summary: "Product teams own outcomes — features, roadmap, releases, UX, and the operational health of what they ship.",
      responsibilities: ["Features", "Roadmap", "Releases", "User Experience", "Product Backlog"],
      activities: ["Prioritize work", "Review incidents", "Plan releases", "Measure outcomes"],
      kpis: [
        { name: "Feature Lead Time", value: "9.4 days", trend: trend(10, 1.5) },
        { name: "CSAT", value: "4.6 / 5", trend: trend(4.55, 0.1) },
        { name: "Release Success Rate", value: "97.8%", trend: trend(97, 1.5) },
      ],
      antiPatterns: ["Throwing work to operations", "No ownership after release", "Reliability is 'someone else's problem'"],
      talking: "You build it. You own it.",
    },
  },

  // Platform capabilities (per workflow row 2) — represented as one detail; cards reuse it
  cloud: {
    id: "cloud", title: "Cloud Platform", kind: "Platform Capability", icon: Cloud, accent: "text-sky-600",
    hover: { definition: "Secure, scalable, multi-cloud foundation provided as a product.", owner: "Cloud Platform Team", kpi: "Provisioning Time, Platform Availability, Standardization %", failure: "Snowflake accounts and drift from landing-zone standard.", impact: "Cost overruns, audit exposure, slower delivery." },
    panel: {
      summary: "Cloud is delivered as a product with golden landing zones, governance, and self-service provisioning.",
      responsibilities: ["Account Management", "Landing Zones", "Governance", "Provisioning"],
      kpis: [
        { name: "Provisioning Time", value: "12 min", trend: trend(15, 3) },
        { name: "Platform Availability", value: "99.99%", trend: trend(99.99, 0.005) },
        { name: "Standardization %", value: "94%", trend: trend(92, 2) },
      ],
      tech: ["AWS", "Azure", "GCP", "Terraform", "Crossplane"],
      talking: "Standardize the boring so product teams can focus on the differentiated.",
    },
  },
  cicd: {
    id: "cicd", title: "CI/CD Platform", kind: "Platform Capability", icon: GitBranch, accent: "text-indigo-600",
    hover: { definition: "Pipelines, release automation, and security gates as a paved road.", owner: "Platform Engineering", kpi: "Deployment Frequency, Change Failure Rate, Lead Time", failure: "Teams roll their own pipelines and bypass security gates.", impact: "Inconsistent quality, audit gaps, slower MTTR." },
    panel: {
      summary: "A single, opinionated paved road from commit to production with built-in security and quality gates.",
      responsibilities: ["Pipelines", "Release Automation", "Security Gates"],
      kpis: [
        { name: "Deployment Frequency", value: "84/day", trend: trend(80, 8) },
        { name: "Change Failure Rate", value: "4.1%", trend: trend(5, 1) },
        { name: "Lead Time for Change", value: "2h 14m", trend: trend(150, 25) },
      ],
      tech: ["GitHub Actions", "ArgoCD", "Spinnaker", "Tekton"],
      talking: "The fastest path to production is also the safest path.",
    },
  },
  identity: {
    id: "identity", title: "Identity & Access", kind: "Platform Capability", icon: Lock, accent: "text-emerald-600",
    hover: { definition: "Unified identity, least privilege, SSO, MFA, and secrets management.", owner: "Identity Platform Team", kpi: "Access Provisioning Time, Identity Compliance", failure: "Standing privileged access and shared service accounts.", impact: "Lateral movement risk and audit findings." },
    panel: {
      summary: "Identity is the new perimeter — provided as a self-service platform for product teams.",
      responsibilities: ["Authentication", "Authorization", "Secrets"],
      kpis: [
        { name: "Access Provisioning Time", value: "3.2 min", trend: trend(4, 1) },
        { name: "Identity Compliance", value: "99.4%", trend: trend(99, 0.6) },
        { name: "MFA Coverage", value: "100%", trend: trend(99.9, 0.05) },
      ],
      tech: ["Okta", "Entra ID", "HashiCorp Vault", "OPA"],
      talking: "Identity-first means least-privilege by default.",
    },
  },
  observability: {
    id: "observability", title: "Observability Platform", kind: "Platform Capability", icon: Eye, accent: "text-fuchsia-600",
    hover: { definition: "Logs, metrics, traces, dashboards and targeted alerting as a product.", owner: "Observability Platform Team", kpi: "Monitoring Coverage, Detection Time", failure: "Alert fatigue and humans watching screens.", impact: "Slow detection, on-call burnout, missed SLOs." },
    panel: {
      summary: "Observability is targeted and outcome-driven — not a NOC of dashboards watched by humans.",
      responsibilities: ["Metrics", "Logs", "Traces", "Alerting"],
      kpis: [
        { name: "Monitoring Coverage", value: "96%", trend: trend(94, 2) },
        { name: "Mean Time to Detect", value: "1m 42s", trend: trend(120, 25) },
        { name: "Alert Precision", value: "92%", trend: trend(90, 3) },
      ],
      tech: ["Datadog", "OpenTelemetry", "Grafana", "Loki"],
      talking: "Alert on what hurts the customer — not on what's noisy.",
    },
  },

  // Reliability team layer
  slo: {
    id: "slo", title: "SLOs & Error Budgets", kind: "Reliability Function", icon: Target, accent: "text-emerald-600",
    hover: { definition: "Defines and measures reliability targets for production services.", owner: "Reliability Engineering", kpi: "SLO Compliance %, Error Budget Burn", failure: "No measurable definition of reliability.", impact: "Cannot understand service quality or guide investment." },
    panel: {
      summary: "SLOs convert reliability from opinion into a quantitative business commitment.",
      kpis: [
        { name: "SLO Compliance %", value: "99.2%", trend: trend(99, 0.5) },
        { name: "Error Budget Remaining", value: "62%", trend: trend(60, 8) },
        { name: "Services with SLOs", value: "184 / 197", trend: trend(180, 5) },
      ],
      antiPatterns: ["Vanity uptime ('five nines')", "SLOs no one acts on", "Error budget without enforcement"],
      business: "Aligns engineering trade-offs to customer-visible reliability.",
      talking: "An SLO without an error budget policy is just a number.",
    },
  },
  monitoring: {
    id: "monitoring", title: "Monitoring & Alerting", kind: "Reliability Function", icon: Activity, accent: "text-amber-600",
    hover: { definition: "Detect meaningful service degradation — without dependence on humans watching screens.", owner: "Reliability Engineering", kpi: "MTTD, Alert Accuracy, False Positive Rate", failure: "Alert storms drown the signal.", impact: "Missed SLOs and burned-out on-call." },
    panel: {
      summary: "Targeted, outcome-driven alerting that pages on customer pain — not on infrastructure noise.",
      kpis: [
        { name: "MTTD", value: "1m 42s", trend: trend(110, 18) },
        { name: "Alert Accuracy", value: "92%", trend: trend(90, 3) },
        { name: "False Positive Rate", value: "6.4%", trend: trend(8, 2) },
      ],
      antiPatterns: ["Threshold-only alerts", "Paging on every error", "Dashboards no one reads"],
      talking: "Stop building NOCs. Build signal.",
    },
  },
  capacity: {
    id: "capacity", title: "Capacity & Performance", kind: "Reliability Function", icon: Gauge, accent: "text-blue-600",
    hover: { definition: "Engineers the system to absorb peak demand within latency targets.", owner: "Reliability Engineering", kpi: "Utilization, Saturation, Latency", failure: "Surprise saturation events during peaks.", impact: "Customer-visible slowness and brownouts." },
    panel: {
      summary: "Performance is treated as a first-class product feature with explicit budgets.",
      kpis: [
        { name: "p99 Latency", value: "187 ms", trend: trend(200, 25) },
        { name: "Saturation", value: "61%", trend: trend(65, 6) },
        { name: "Capacity Headroom", value: "38%", trend: trend(35, 5) },
      ],
      talking: "Performance is a feature you ship — not a problem you wait for.",
    },
  },
  resilience: {
    id: "resilience", title: "Resilience Engineering", kind: "Reliability Function", icon: Shield, accent: "text-rose-600",
    hover: { definition: "Proves the system survives failure — through chaos, failover, and DR validation.", owner: "Reliability Engineering", kpi: "Recovery Success %, Resilience Score", failure: "DR plans that have never been tested.", impact: "Catastrophic outage exposure and audit risk." },
    panel: {
      summary: "Resilience is continuously proven — not documented and shelved.",
      activities: ["Chaos Testing", "Failover Validation", "DR Validation"],
      kpis: [
        { name: "Recovery Success %", value: "98.6%", trend: trend(97, 1.5) },
        { name: "Resilience Score", value: "86 / 100", trend: trend(82, 3) },
        { name: "DR Tests / Quarter", value: "14", trend: trend(12, 3) },
      ],
      talking: "If you haven't tested it, it doesn't work.",
    },
  },

  // Automation layer
  validation: {
    id: "validation", title: "Automated Validation", kind: "Automation Capability", icon: CheckCircle2, accent: "text-emerald-600",
    hover: { definition: "Validates infrastructure, security, and release correctness automatically.", owner: "Automation Engineering", kpi: "Validation Coverage %, Failure Detection Rate" },
    panel: {
      summary: "Every change is validated before humans get involved.",
      activities: ["Infrastructure Validation", "Security Validation", "Release Validation"],
      kpis: [
        { name: "Validation Coverage", value: "91%", trend: trend(88, 3) },
        { name: "Failure Detection Rate", value: "97%", trend: trend(95, 2) },
      ],
      talking: "Validate machines with machines.",
    },
  },
  selfHeal: {
    id: "selfHeal", title: "Self-Healing & Recovery", kind: "Automation Capability", icon: Zap, accent: "text-amber-600",
    hover: { definition: "Detects and remediates known failure modes without human action.", owner: "Automation Engineering", kpi: "Automated Recovery %, Recovery Time" },
    panel: {
      summary: "Known failure modes are remediated automatically — humans handle the novel ones.",
      activities: ["Restart services", "Replace nodes", "Scale infrastructure"],
      kpis: [
        { name: "Automated Recovery %", value: "74%", trend: trend(70, 4) },
        { name: "Mean Recovery Time", value: "42s", trend: trend(50, 10) },
      ],
      talking: "The best on-call shift is the one that didn't page anyone.",
    },
  },
  runbook: {
    id: "runbook", title: "Runbook Automation", kind: "Automation Capability", icon: Workflow, accent: "text-indigo-600",
    hover: { definition: "Codifies repeatable operational procedures.", owner: "Automation Engineering", kpi: "Automation Coverage %, Toil Reduction" },
    panel: {
      summary: "Runbooks live as code — versioned, tested, and executed by machines.",
      activities: ["Certificate Renewal", "Patch Deployment", "User Provisioning"],
      kpis: [
        { name: "Automation Coverage", value: "82%", trend: trend(78, 3) },
        { name: "Toil Reduction (yoy)", value: "−41%", trend: trend(40, 4) },
      ],
      talking: "If you do it twice, automate it the third time.",
    },
  },
  aiops: {
    id: "aiops", title: "AI-Assisted Operations", kind: "Automation Capability", icon: Brain, accent: "text-fuchsia-600",
    hover: { definition: "Augments engineers with summaries, RCA, and change-risk insight.", owner: "Automation Engineering + Product Reliability", kpi: "Resolution Acceleration, Engineer Productivity" },
    panel: {
      summary: "AI augments engineers — it does not replace them. Humans stay accountable.",
      activities: ["Incident Summaries", "Root Cause Suggestions", "Change Risk Analysis"],
      kpis: [
        { name: "Resolution Acceleration", value: "38%", trend: trend(34, 3) },
        { name: "Eng. Productivity Lift", value: "22%", trend: trend(20, 3) },
      ],
      talking: "AI is the co-pilot. Humans are still flying the plane.",
    },
  },

  // Shared platforms (additional)
  dataPlat: {
    id: "dataPlat", title: "Data Platform", kind: "Shared Platform", icon: Database, accent: "text-cyan-600",
    hover: { definition: "Data services, integration, and governance as a product.", owner: "Data Platform Team", kpi: "Data Quality, Pipeline Reliability" },
    panel: {
      summary: "Data is treated as a product with SLOs on freshness, quality, and lineage.",
      responsibilities: ["Data Pipelines", "Data Quality", "Storage Consumption"],
      kpis: [
        { name: "Pipeline Reliability", value: "99.4%", trend: trend(99, 0.5) },
        { name: "Data Quality Score", value: "94 / 100", trend: trend(92, 2) },
      ],
      talking: "Bad data is worse than no data.",
    },
  },
  security: {
    id: "security", title: "Security Platform", kind: "Shared Platform", icon: Shield, accent: "text-rose-600",
    hover: { definition: "Vulnerability management, threat detection, and compliance as a service.", owner: "Security Platform Team", kpi: "Mean Time to Remediate, Exposure" },
    panel: {
      summary: "Security is built in — not bolted on.",
      responsibilities: ["Vulnerabilities", "Exposure", "Compliance"],
      kpis: [
        { name: "Critical Vulns Open", value: "3", trend: trend(6, 3) },
        { name: "MTTR (security)", value: "2.8 days", trend: trend(4, 1) },
        { name: "Compliance", value: "98.7%", trend: trend(98, 1) },
      ],
      talking: "Shift left, then shift everywhere.",
    },
  },

  // Operating principles
  pOwn: { id: "pOwn", title: "Own the Service End-to-End", kind: "Operating Principle", icon: Users, accent: "text-violet-600",
    hover: { definition: "The team that builds the service is accountable for its reliability in production.", kpi: "Service Ownership Coverage" },
    panel: { summary: "Ownership without hand-offs is the foundation of modern reliability.",
      kpis: [{ name: "Services with Named Owner", value: "100%", trend: trend(98, 1) }, { name: "On-call Coverage", value: "100%", trend: trend(99, 0.5) }],
      talking: "Pagers ring where the code was written.",
    },
  },
  pCollab: { id: "pCollab", title: "Collaborate, Don't Hand Off", kind: "Operating Principle", icon: Workflow, accent: "text-indigo-600",
    hover: { definition: "Replace ticket routing with shared accountability and shared workspaces.", kpi: "Handoff Reduction %" },
    panel: { summary: "Eliminate the queue. Eliminate the hand-off. Eliminate the silo.",
      kpis: [{ name: "Handoff Reduction (yoy)", value: "−54%", trend: trend(50, 5) }, { name: "Cross-team Incidents", value: "−38%", trend: trend(35, 4) }],
      antiPatterns: ["Tier-1 → Tier-2 → Tier-3 routing", "Ticket ping-pong", "Bridge calls without product engineers"],
      talking: "Silos optimize the org chart. They de-optimize the customer.",
    },
  },
  pPrev: { id: "pPrev", title: "Prevent Issues, Don't Just Respond", kind: "Operating Principle", icon: Shield, accent: "text-emerald-600",
    hover: { definition: "Be a fire preventer, not a firefighter.", kpi: "Incident Prevention Rate" },
    panel: { summary: "The most reliable incident is the one that never happened.",
      kpis: [{ name: "Preventable Incidents Avoided", value: "62%", trend: trend(58, 4) }, { name: "Incident Reduction (yoy)", value: "−41%", trend: trend(38, 4) }],
      talking: "Smokey the Bear was right. Prevention beats response.",
    },
  },
  pStd: { id: "pStd", title: "Drive Standardization & Reuse", kind: "Operating Principle", icon: Layers, accent: "text-blue-600",
    hover: { definition: "Standardize the boring. Reuse the proven. Differentiate where it matters.", kpi: "Reuse %, Golden Image Adoption" },
    panel: { summary: "Standardization is the multiplier behind everything else.",
      kpis: [{ name: "Golden Image Adoption", value: "94%", trend: trend(92, 2) }, { name: "Shared Pipeline Reuse", value: "87%", trend: trend(85, 3) }],
      talking: "Snowflakes are beautiful. Snowflake services are not.",
    },
  },
  pData: { id: "pData", title: "Use Data to Improve Continuously", kind: "Operating Principle", icon: BarChart3, accent: "text-cyan-600",
    hover: { definition: "Operate from evidence, not opinion.", kpi: "Reliability Reviews per Quarter" },
    panel: { summary: "Every decision is supported by a number you can defend.",
      kpis: [{ name: "Reliability Reviews / Qtr", value: "12", trend: trend(10, 2) }, { name: "SLO Reviews / Qtr", value: "47", trend: trend(40, 5) }],
      talking: "If you can't measure it, you can't improve it.",
    },
  },
  pAuto: { id: "pAuto", title: "Automate to Elevate Human Impact", kind: "Operating Principle", icon: Bot, accent: "text-fuchsia-600",
    hover: { definition: "Automation removes toil so people do work only humans can do.", kpi: "Automation Coverage, Toil %" },
    panel: { summary: "Automation isn't about removing humans. It's about elevating them.",
      kpis: [{ name: "Automation Coverage", value: "82%", trend: trend(78, 3) }, { name: "Toil per Engineer (hrs/wk)", value: "6.4", trend: trend(8, 1.5) }],
      talking: "Replace toil with judgment. Replace tickets with thinking.",
    },
  },

  // Business outcomes
  oCare: { id: "oCare", title: "Caregiver Visit Completion", kind: "Business Outcome", icon: Heart, accent: "text-violet-600",
    hover: { definition: "% of scheduled caregiver visits that are completed and validated.", kpi: "99.95%", impact: "Direct revenue and member care quality." },
    panel: { summary: "The single most important outcome for caregiver operations.",
      kpis: [{ name: "Visit Completion %", value: "99.95%", trend: trend(99.92, 0.05) }],
      workflow: ["Assignment", "Travel", "Documentation", "Validation"],
      business: "Direct revenue, member care quality, regulatory compliance.",
    },
  },
  oClaims: { id: "oClaims", title: "Claims Processing Success", kind: "Business Outcome", icon: ClipboardCheck, accent: "text-blue-600",
    hover: { definition: "% of claims processed without manual intervention.", kpi: "99.9%", impact: "Cash flow and revenue realization." },
    panel: { summary: "Reliability of revenue = reliability of claims.",
      kpis: [{ name: "Claims Success %", value: "99.9%", trend: trend(99.85, 0.06) }],
      business: "Revenue realization, cash flow, provider satisfaction.",
    },
  },
  oPayroll: { id: "oPayroll", title: "Payroll Accuracy & On-Time", kind: "Business Outcome", icon: DollarSign, accent: "text-teal-600",
    hover: { definition: "% of paychecks accurate and on time.", kpi: "99.99%", impact: "Workforce trust and retention." },
    panel: { summary: "Payroll is the most human KPI in the company.",
      kpis: [{ name: "Payroll Accuracy", value: "99.99%", trend: trend(99.99, 0.01) }],
      business: "Workforce satisfaction and retention.",
    },
  },
  oMember: { id: "oMember", title: "Improved Member Experience & Satisfaction", kind: "Business Outcome", icon: TrendingUp, accent: "text-emerald-600",
    hover: { definition: "Composite of NPS, CSAT, and service reliability correlated to incidents.", kpi: "NPS +14 yoy" },
    panel: { summary: "Experience is the downstream effect of reliability.",
      kpis: [{ name: "NPS", value: "62", trend: trend(58, 3) }, { name: "CSAT", value: "4.6 / 5", trend: trend(4.5, 0.1) }],
    },
  },
  oCompliance: { id: "oCompliance", title: "Reduced Risk, Higher Compliance", kind: "Business Outcome", icon: Shield, accent: "text-rose-600",
    hover: { definition: "Composite risk posture across audit findings and control effectiveness.", kpi: "98.7% compliant" },
    panel: { summary: "Reliability and compliance share the same operating model.",
      kpis: [{ name: "Compliance Score", value: "98.7%", trend: trend(98, 1) }, { name: "Open Audit Findings", value: "4", trend: trend(7, 2) }],
    },
  },

  // Enablers
  ePeople: { id: "ePeople", title: "People", kind: "Enabler", icon: Users, accent: "text-violet-600",
    hover: { definition: "Skilled, accountable teams aligned to business outcomes." }, panel: { summary: "The model only works if humans are aligned and accountable." } },
  eProcess: { id: "eProcess", title: "Process", kind: "Enabler", icon: Cog, accent: "text-slate-600",
    hover: { definition: "Lean, evidence-based processes that scale." }, panel: { summary: "Process is the shape of how people and technology meet." } },
  eTech: { id: "eTech", title: "Technology", kind: "Enabler", icon: Server, accent: "text-blue-600",
    hover: { definition: "Modern, standardized, observable technology stack." }, panel: { summary: "Technology is leverage — for everything else." } },
  eData: { id: "eData", title: "Data", kind: "Enabler", icon: Database, accent: "text-cyan-600",
    hover: { definition: "Trustworthy data that powers decisions and automation." }, panel: { summary: "Decisions are only as good as the data behind them." } },
  eAI: { id: "eAI", title: "AI", kind: "Enabler", icon: Sparkles, accent: "text-fuchsia-600",
    hover: { definition: "AI to augment engineers and accelerate outcomes." }, panel: { summary: "AI elevates humans. It doesn't replace them." } },
  eCost: { id: "eCost", title: "Lower Costs, Higher Efficiency", kind: "Enabler", icon: PiggyBank, accent: "text-emerald-600",
    hover: { definition: "Operating leverage produced by the entire model." }, panel: { summary: "Reliability done right is a cost-down program." } },
};

/* ---------- Reusable bits ---------- */
function Hover({ d, children }: { d: Detail; children: React.ReactNode }) {
  const Icon = d.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children as any}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-0 overflow-hidden">
        <div className="bg-popover text-popover-foreground">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
            <Icon className={`h-4 w-4 ${d.accent}`} />
            <div className="text-xs font-semibold">{d.title}</div>
            <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">{d.kind}</span>
          </div>
          <div className="px-3 py-2.5 space-y-1.5 text-[12px]">
            <div><span className="text-muted-foreground">Definition: </span>{d.hover.definition}</div>
            {d.hover.owner && <div><span className="text-muted-foreground">Owner: </span>{d.hover.owner}</div>}
            {d.hover.kpi && <div><span className="text-muted-foreground">KPI: </span>{d.hover.kpi}</div>}
            {d.hover.failure && <div><span className="text-muted-foreground">Failure: </span>{d.hover.failure}</div>}
            {d.hover.impact && <div><span className="text-muted-foreground">Impact: </span>{d.hover.impact}</div>}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function Spark({ data, color = "hsl(var(--primary))" }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Pill({
  d, onOpen, dense = false, className = "",
}: { d: Detail; onOpen: (d: Detail) => void; dense?: boolean; className?: string }) {
  const Icon = d.icon;
  return (
    <Hover d={d}>
      <button
        onClick={() => onOpen(d)}
        className={`group w-full flex items-center gap-2 ${dense ? "py-1.5 px-2" : "py-2 px-2.5"} rounded-md border border-transparent hover:border-border hover:bg-muted/60 transition text-left ${className}`}
      >
        <Icon className={`h-3.5 w-3.5 shrink-0 ${d.accent}`} />
        <span className="text-[12.5px] text-foreground/90 group-hover:text-foreground truncate">{d.title}</span>
        <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
      </button>
    </Hover>
  );
}

/* ---------- Page ---------- */
export default function HowReliabilityOperates() {
  const [active, setActive] = useState<Detail | null>(null);
  const onOpen = (d: Detail) => setActive(d);

  // Workflow column data
  const workflows = [W.caregiver, W.claims, W.payroll];
  const platformItems = [W.cloud, W.cicd, W.identity, W.observability];
  const reliabilityItems = [W.slo, W.monitoring, W.capacity, W.resilience];
  const automationItems = [W.validation, W.selfHeal, W.runbook, W.aiops];
  const sharedPlatforms = [W.cloud, W.identity, W.observability, W.cicd, W.dataPlat, W.security];
  const outcomes = [W.oCare, W.oClaims, W.oPayroll, W.oMember, W.oCompliance];
  const principles = [W.pOwn, W.pCollab, W.pPrev, W.pStd, W.pData, W.pAuto];
  const enablers = [W.ePeople, W.eProcess, W.eTech, W.eData, W.eAI, W.eCost];

  const workflowAccent = (id: string) =>
    id === "caregiver" ? "from-violet-50 to-white border-violet-200"
    : id === "claims" ? "from-blue-50 to-white border-blue-200"
    : "from-teal-50 to-white border-teal-200";

  const headerAccent = (id: string) =>
    id === "caregiver" ? "bg-violet-600" : id === "claims" ? "bg-blue-600" : "bg-teal-600";

  const journeyTrend = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    d: i + 1,
    reliability: 99 + Math.sin(i / 4) * 0.4 + i * 0.01,
    velocity: 60 + i * 0.6 + Math.sin(i / 3) * 4,
    cost: 100 - i * 0.9 + Math.cos(i / 3) * 3,
  })), []);

  return (
    <AppShell>
      <TooltipProvider delayDuration={120}>
        <div className="min-h-screen bg-background">
          {/* Page header */}
          <div className="border-b border-border bg-white">
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Workflow className="h-3.5 w-3.5" /> Site Resilience Engineering · Operating Model
                  </div>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    How a Modern Product Reliability Organization Operates
                  </h1>
                  <p className="mt-1 text-[13.5px] text-muted-foreground max-w-3xl">
                    Cross-functional teams and platform capabilities working together to deliver reliable services and exceptional experiences.
                    Every element is interactive — hover for context, click for the operating playbook.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Badge variant="outline" className="gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Live operating view</Badge>
                  <Badge variant="outline" className="gap-1.5"><Activity className="h-3 w-3 text-blue-600" /> 197 services</Badge>
                  <Badge variant="outline" className="gap-1.5"><Target className="h-3 w-3 text-violet-600" /> SLO compliance 99.2%</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="px-6 py-5 grid grid-cols-12 gap-5">
            {/* Left rail: layer labels */}
            <div className="col-span-12 xl:col-span-9 space-y-4">
              <div className="text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">
                We deliver business outcomes through collaborative, product-aligned teams
              </div>

              <div className="grid grid-cols-12 gap-4">
                {/* Layer labels column */}
                <div className="col-span-12 lg:col-span-3 space-y-3">
                  {[
                    { d: W.productTeam, sub: "Owns product experience and business outcomes" },
                    { d: W.cloud, label: "Platform Team", sub: "Builds and operates the platforms that enable product teams" },
                    { d: W.slo, label: "Reliability Team", sub: "Ensures reliability, resilience and performance at scale" },
                    { d: W.aiops, label: "Automation & AI Layer", sub: "Automates repetitive work and accelerates issue resolution" },
                  ].map(({ d, label, sub }, idx) => {
                    const Icon = d.icon;
                    return (
                      <Hover key={idx} d={d}>
                        <button
                          onClick={() => onOpen(d)}
                          className="w-full text-left rounded-lg border border-border bg-card p-3.5 hover:shadow-sm hover:border-foreground/30 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`h-9 w-9 rounded-full grid place-items-center bg-muted ${d.accent}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-[12px] font-semibold uppercase tracking-wider text-foreground">{label || d.title}</div>
                            </div>
                          </div>
                          <p className="mt-2 text-[12px] text-muted-foreground leading-snug">{sub}</p>
                        </button>
                      </Hover>
                    );
                  })}
                </div>

                {/* Workflow grid */}
                <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {workflows.map((wf) => {
                    const Icon = wf.icon;
                    const rows = [
                      { title: "Product", items: [
                        { label: "Features & Backlog", d: W.productTeam },
                        { label: "User Experience", d: W.productTeam },
                        { label: "Release Planning", d: W.productTeam },
                        { label: "Business KPIs", d: W.productTeam },
                      ]},
                      { title: "Platform", items: [
                        { label: "Cloud & Infrastructure", d: W.cloud },
                        { label: "CI/CD Pipelines", d: W.cicd },
                        { label: "Identity & Access", d: W.identity },
                        { label: "Observability Platform", d: W.observability },
                      ]},
                      { title: "Reliability", items: [
                        { label: "SLOs & Error Budgets", d: W.slo },
                        { label: "Monitoring & Alerting", d: W.monitoring },
                        { label: "Capacity & Performance", d: W.capacity },
                        { label: "Resilience Engineering", d: W.resilience },
                      ]},
                      { title: "Automation", items: [
                        { label: "Automated Validation", d: W.validation },
                        { label: "Self-Healing & Recovery", d: W.selfHeal },
                        { label: "Runbook Automation", d: W.runbook },
                        { label: "AI/ML Anomaly Detection", d: W.aiops },
                      ]},
                    ];
                    return (
                      <div key={wf.id} className={`rounded-xl border bg-gradient-to-b ${workflowAccent(wf.id)} overflow-hidden`}>
                        <Hover d={wf}>
                          <button
                            onClick={() => onOpen(wf)}
                            className={`w-full text-left ${headerAccent(wf.id)} text-white p-3.5 hover:brightness-110 transition`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div className="text-[12px] font-semibold uppercase tracking-wider">{wf.title}</div>
                            </div>
                            <p className="mt-1 text-[12px] text-white/85">{
                              wf.id === "caregiver" ? "Reliable care in the moments that matter"
                              : wf.id === "claims" ? "Accurate, timely claims with less rework"
                              : "Accurate pay, on time, every time"
                            }</p>
                          </button>
                        </Hover>
                        <div className="p-2 space-y-2">
                          {rows.map((row) => (
                            <div key={row.title} className="rounded-md bg-white/70 border border-border/60 p-1.5">
                              {row.items.map((it) => (
                                <Pill key={it.label} d={{ ...it.d, title: it.label } as Detail} onOpen={() => onOpen(it.d)} dense />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shared platform services */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wider text-foreground">Shared Platform Services</div>
                    <div className="text-[11.5px] text-muted-foreground">Provided as products to every product team</div>
                  </div>
                  <Badge variant="outline" className="text-[10.5px]">6 platforms · 100% standardized</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {sharedPlatforms.map((p) => {
                    const Icon = p.icon;
                    return (
                      <Hover key={p.id} d={p}>
                        <button onClick={() => onOpen(p)} className="text-left rounded-lg border border-border bg-background p-3 hover:shadow-sm hover:border-foreground/30 transition">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${p.accent}`} />
                            <div className="text-[12.5px] font-semibold text-foreground">{p.title}</div>
                          </div>
                          <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">{p.hover.definition}</p>
                          {p.panel.kpis?.[0] && (
                            <div className="mt-2">
                              <div className="text-[10.5px] text-muted-foreground">{p.panel.kpis[0].name}</div>
                              <div className="text-[13px] font-semibold text-foreground">{p.panel.kpis[0].value}</div>
                              <Spark data={p.panel.kpis[0].trend || trend(80)} />
                            </div>
                          )}
                        </button>
                      </Hover>
                    );
                  })}
                </div>
              </div>

              {/* Business outcomes */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <div className="text-[12px] font-semibold uppercase tracking-wider">Business Outcomes</div>
                  <span className="text-[11.5px] text-white/70 ml-2">What matters most</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-border">
                  {outcomes.map((o) => {
                    const Icon = o.icon;
                    return (
                      <Hover key={o.id} d={o}>
                        <button onClick={() => onOpen(o)} className="bg-card hover:bg-muted/50 transition text-left p-3.5">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${o.accent}`} />
                            <div className="text-[11.5px] uppercase tracking-wide text-muted-foreground">{o.title}</div>
                          </div>
                          <div className="mt-1.5 text-[18px] font-semibold text-foreground">{o.panel.kpis?.[0]?.value || "—"}</div>
                          <Spark data={o.panel.kpis?.[0]?.trend || trend(90)} />
                        </button>
                      </Hover>
                    );
                  })}
                </div>
              </div>

              {/* Operating trend chart */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-wider text-foreground">30-Day Operating Signal</div>
                    <div className="text-[11.5px] text-muted-foreground">Reliability up · velocity up · cost down — the operating model in motion</div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Reliability</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Velocity</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-fuchsia-500" />Cost</span>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={journeyTrend}>
                      <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
                      <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="reliability" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cost" stroke="#d946ef" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right rail */}
            <aside className="col-span-12 xl:col-span-3 space-y-4">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-slate-900 text-white px-3 py-2 text-[11.5px] font-semibold uppercase tracking-wider">How it works</div>
                <div className="p-3 space-y-2.5 bg-card">
                  {[
                    { i: Users, t: "Product-Aligned", d: "Teams aligned to business services and outcomes, not technologies." },
                    { i: Workflow, t: "Platform Enables Speed", d: "Self-service platforms remove friction and accelerate delivery." },
                    { i: Shield, t: "Reliability by Design", d: "Reliability is built in through SLOs, observability, and chaos engineering." },
                    { i: Bot, t: "Automation First", d: "Automation and AI reduce toil, speed resolution, and prevent issues." },
                    { i: TrendingUp, t: "Outcome Focused", d: "We measure what matters to the business, not just the infrastructure." },
                  ].map((row, i) => {
                    const Icon = row.i;
                    return (
                      <div key={i} className="flex gap-2.5">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-muted grid place-items-center text-foreground/80">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-foreground">{row.t}</div>
                          <div className="text-[11.5px] text-muted-foreground leading-snug">{row.d}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-3 py-2 border-b border-border text-[11.5px] font-semibold uppercase tracking-wider text-primary">Operating Principles</div>
                <div className="p-2">
                  {principles.map((p) => (
                    <Hover key={p.id} d={p}>
                      <button onClick={() => onOpen(p)} className="w-full flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/60 transition text-left">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[12.5px] text-foreground/90">{p.title}</span>
                        <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                      </button>
                    </Hover>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="px-3 py-2 border-b border-border text-[11.5px] font-semibold uppercase tracking-wider text-primary">Enabled By</div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  {enablers.map((e) => {
                    const Icon = e.icon;
                    return (
                      <Hover key={e.id} d={e}>
                        <button onClick={() => onOpen(e)} className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-muted/60 transition">
                          <Icon className={`h-4 w-4 ${e.accent}`} />
                          <span className="text-[10.5px] text-center text-foreground/85 leading-tight">{e.title}</span>
                        </button>
                      </Hover>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>

          {/* Footer band */}
          <div className="px-6 pb-8">
            <div className="rounded-xl border border-border bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 text-center">
              <div className="text-[13px] italic">
                One organization. Shared responsibility. Reliable services. Exceptional experiences.
              </div>
            </div>
          </div>
        </div>

        {/* Detail sheet */}
        <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
            {active && <DetailPanel d={active} onOpen={onOpen} />}
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    </AppShell>
  );
}

function DetailPanel({ d, onOpen }: { d: Detail; onOpen: (d: Detail) => void }) {
  const Icon = d.icon;
  return (
    <div className="space-y-5">
      <SheetHeader>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Icon className={`h-3.5 w-3.5 ${d.accent}`} /> {d.kind}
        </div>
        <SheetTitle className="text-xl">{d.title}</SheetTitle>
        <SheetDescription className="text-[13px] leading-relaxed">{d.panel.summary}</SheetDescription>
      </SheetHeader>

      {d.panel.workflow && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Workflow</div>
          <div className="flex flex-wrap gap-1.5">
            {d.panel.workflow.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[12px] px-2 py-1 rounded-md bg-muted text-foreground/90">{s}</span>
                {i < d.panel.workflow!.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {d.panel.kpis && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">KPI Grid</div>
          <div className="grid grid-cols-2 gap-2.5">
            {d.panel.kpis.map((k) => (
              <div key={k.name} className="rounded-lg border border-border p-3 bg-card">
                <div className="text-[11px] text-muted-foreground">{k.name}</div>
                <div className="text-[16px] font-semibold text-foreground">{k.value}</div>
                {k.trend && <Spark data={k.trend} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {d.panel.responsibilities && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Real-World Responsibilities</div>
          <div className="flex flex-wrap gap-1.5">
            {d.panel.responsibilities.map((r) => (
              <Badge key={r} variant="secondary" className="text-[11.5px]">{r}</Badge>
            ))}
          </div>
        </section>
      )}

      {d.panel.activities && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Typical Activities</div>
          <ul className="grid grid-cols-2 gap-1.5">
            {d.panel.activities.map((a) => (
              <li key={a} className="flex items-center gap-2 text-[12.5px] text-foreground/90">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(d.panel.business || d.panel.customer || d.panel.financial) && (
        <section className="grid grid-cols-1 gap-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Impact</div>
          {d.panel.business && <div className="rounded-md border border-border p-2.5 text-[12.5px]"><b>Business: </b>{d.panel.business}</div>}
          {d.panel.customer && <div className="rounded-md border border-border p-2.5 text-[12.5px]"><b>Customer: </b>{d.panel.customer}</div>}
          {d.panel.financial && <div className="rounded-md border border-border p-2.5 text-[12.5px]"><b>Financial: </b>{d.panel.financial}</div>}
        </section>
      )}

      {d.panel.antiPatterns && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Common Anti-Patterns</div>
          <ul className="space-y-1.5">
            {d.panel.antiPatterns.map((a) => (
              <li key={a} className="flex items-start gap-2 text-[12.5px] text-foreground/90">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-600 shrink-0" /> {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.panel.incidents && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Example Incident Timeline</div>
          <div className="space-y-1.5">
            {d.panel.incidents.map((i, idx) => (
              <div key={idx} className="flex items-start gap-3 text-[12.5px]">
                <span className="text-muted-foreground tabular-nums">{i.when}</span>
                <span className="text-foreground/90">{i.what}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(d.panel.tech || d.panel.ai) && (
        <section className="grid grid-cols-2 gap-3">
          {d.panel.tech && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Supporting Technology</div>
              <div className="flex flex-wrap gap-1.5">
                {d.panel.tech.map((t) => <Badge key={t} variant="outline" className="text-[11px]">{t}</Badge>)}
              </div>
            </div>
          )}
          {d.panel.ai && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AI Opportunities</div>
              <div className="flex flex-wrap gap-1.5">
                {d.panel.ai.map((t) => <Badge key={t} variant="outline" className="text-[11px] gap-1"><Sparkles className="h-3 w-3 text-fuchsia-500" />{t}</Badge>)}
              </div>
            </div>
          )}
        </section>
      )}

      {(d.panel.teamStructure || d.panel.industry) && (
        <section className="grid grid-cols-2 gap-3">
          {d.panel.teamStructure && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Example Team Structure</div>
              <ul className="text-[12.5px] space-y-1">
                {d.panel.teamStructure.map((t) => <li key={t} className="flex items-center gap-2"><Users className="h-3 w-3 text-muted-foreground" />{t}</li>)}
              </ul>
            </div>
          )}
          {d.panel.industry && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Industry Examples</div>
              <div className="flex flex-wrap gap-1.5">
                {d.panel.industry.map((t) => <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>)}
              </div>
            </div>
          )}
        </section>
      )}

      {d.panel.talking && (
        <>
          <Separator />
          <div className="rounded-lg bg-slate-900 text-white p-3.5">
            <div className="text-[10.5px] uppercase tracking-wider text-white/70">Executive Talking Point</div>
            <div className="mt-1 text-[13.5px] italic">"{d.panel.talking}"</div>
          </div>
        </>
      )}
    </div>
  );
}
