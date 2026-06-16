import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ChevronRight, Users, Shield, Cloud, Database, Activity,
  GitBranch, Bot, Building2, Briefcase, Wrench, Server, Lock, Code2, BarChart3,
  Smartphone, FileText, DollarSign, UserCircle, Stethoscope, Layers, X,
  CheckCircle2, Zap, Target, TrendingUp, Sparkles, Network, HeartHandshake, Gauge,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type EntityType = "exec" | "leader" | "stream" | "function" | "role" | "service" | "partner" | "outcome";

type Entity = {
  id: string;
  type: EntityType;
  name: string;
  subtitle?: string;
  people?: number;
  owner?: string;
  maturity?: string;
  connected?: string[];
  icon: any;
  accent: string;          // border + text accent
  bg: string;              // tint background
  swatch: string;          // small colored chip
  mission?: string;
  why?: string;
  supportsModel?: string;
  responsibilities?: string[];
  secondaryResp?: string[];
  notOwn?: string[];
  decisionsMade?: string[];
  decisionsInfluenced?: string[];
  ownedServices?: string[];
  ownedArtifacts?: string[];
  ownedMetrics?: string[];
  decisionRights?: string[];
  escalationOwnership?: string;
  ownershipBoundaries?: string[];
  technical?: string[];
  operating?: string[];
  business?: string[];
  leadership?: string[];
  tools?: string[];
  certifications?: string[];
  supports?: string[];
  supportedBy?: string[];
  interactionTypes?: string[];
  workflows?: string[];
  handoffs?: string[];
  reduceHandoffs?: string;
  kpis?: { name: string; current?: string; target: string; definition: string; why: string; owner: string; cadence: string }[];
  artifacts?: string[];
  failureModes?: string[];
  antiPatterns?: string[];
  dependencyRisks?: string[];
  skillGaps?: string[];
  controlGaps?: string[];
  customerImpact?: string;
  mitigation?: string;
  growth12?: string[];
  growth24?: string[];
  whenAdd?: string;
  whenAutomate?: string;
  whenPartner?: string;
  whenRetire?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const COMMON_TEAM_RESP = [
  "Own customer workflow outcomes",
  "Own application delivery and release readiness",
  "Own service health with SRE support",
  "Consume shared platform services",
  "Own product backlog and prioritization",
  "Own defects, enhancements, and customer feedback loops",
  "Participate in incident learning and RCAs",
];

const COMMON_TEAM_COMP = [
  "Domain workflow knowledge",
  "Software engineering",
  "API integration",
  "Testing & QA automation",
  "Observability awareness",
  "Security awareness & secure coding",
  "Agile delivery",
];

const ENTITIES: Record<string, Entity> = {
  // ── Executive
  cto: {
    id: "cto", type: "exec", name: "CTO", subtitle: "Chief Technology Officer",
    people: 1, owner: "Executive Leadership", maturity: "Sponsoring",
    icon: Briefcase, accent: "border-slate-300 text-slate-900", bg: "bg-slate-50", swatch: "bg-slate-400",
    mission: "Own technology strategy, operating model, reliability outcomes, platform direction, modernization, partner governance, and enterprise technology investment.",
    why: "A single accountable executive sets technology direction, aligns engineering investment to business outcomes, and is the steward of the future-state operating model.",
    supportsModel: "Defines the operating model that SRE, platform engineering, Team Topologies, and reliability outcomes are built on.",
    responsibilities: [
      "Technology strategy and target architecture",
      "Reliability operating model accountability",
      "Platform direction and developer productivity",
      "Product–engineering alignment",
      "Security alignment with CISO",
      "Investment prioritization and partner governance",
      "Transformation roadmap delivery",
    ],
    decisionsMade: ["Operating model", "Build vs. buy vs. partner", "Modernization sequencing", "Org design"],
    decisionsInfluenced: ["Annual budget", "Customer commitments on reliability", "Acquisition technology strategy"],
    ownedServices: ["Engineering org", "Platform org", "Reliability program"],
    ownedArtifacts: ["Technology strategy", "Operating model", "Investment portfolio"],
    ownedMetrics: ["Availability", "Customer-impacting incidents", "Modernization milestones", "Cloud cost trend"],
    technical: ["Cloud strategy", "SRE literacy", "Platform engineering literacy", "Healthcare SaaS architecture"],
    operating: ["Operating model design", "Vendor & partner governance", "Run-the-business cadence"],
    business: ["P&L awareness", "Customer outcomes", "Compliance posture"],
    leadership: ["Executive communication", "Talent strategy", "Cross-functional alignment"],
    tools: ["Board reporting", "Portfolio management", "Strategic roadmap"],
    supports: ["CEO", "Board", "CPO", "CFO", "CISO", "All engineering directors"],
    supportedBy: ["Director Product Eng", "Director Reliability Eng", "Director Platform Eng", "Security Lead", "Enterprise Architect"],
    interactionTypes: ["Governance", "Strategy", "Investment review"],
    kpis: [
      { name: "Customer-facing availability", target: "> 99.95%", definition: "Composite uptime across customer-facing services", why: "Direct customer trust and revenue protection", owner: "CTO + Director Reliability", cadence: "Monthly" },
      { name: "Customer-impacting incident count", target: "< 4/quarter", definition: "P1/P2 incidents with customer impact", why: "Operating model effectiveness", owner: "CTO", cadence: "Quarterly" },
      { name: "Modernization milestone delivery", target: "≥ 90%", definition: "% of modernization milestones delivered on plan", why: "Transformation accountability", owner: "CTO + Enterprise Architect", cadence: "Quarterly" },
      { name: "Cloud cost variance", target: "± 5%", definition: "Actual vs. plan", why: "Financial discipline", owner: "CTO + CFO", cadence: "Monthly" },
    ],
    artifacts: ["Technology strategy", "Operating model doc", "Transformation roadmap", "Investment portfolio", "Partner governance scorecard"],
    failureModes: ["Operating model not embedded", "Investment misalignment", "Partner over-dependence"],
    antiPatterns: ["Approving every architecture decision", "Acting as escalation manager for every incident"],
    mitigation: "Push decision rights down via service ownership; reserve CTO time for strategy, partner governance, and executive alignment.",
    growth12: ["Operating model adopted across all teams", "All services have named owners"],
    growth24: ["Reliability is a product feature; partner mix optimized for value, not capacity."],
  },

  // ── Functional leaders
  dirProduct: {
    id: "dirProduct", type: "leader", name: "Director, Product Engineering",
    subtitle: "Owns product delivery, roadmaps & value streams",
    people: 1, owner: "CTO", maturity: "Mature",
    icon: Layers, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    mission: "Own value stream delivery and product outcomes.",
    responsibilities: ["Roadmap execution", "Value stream alignment", "Product delivery and release quality", "Customer workflow performance", "Engineering productivity for streams"],
    technical: ["Product engineering leadership", "Agile delivery", "Domain workflow design", "Quality engineering", "Release management"],
    leadership: ["Coaching engineering leads", "Cross-stream alignment", "Stakeholder management"],
    supports: ["CTO", "Product Management", "Value Stream Teams"],
    supportedBy: ["Reliability Engineering", "Platform Engineering", "Security", "Architecture"],
    kpis: [
      { name: "Deployment frequency", target: "Daily per stream", definition: "Production deployments / stream / week", why: "Flow & responsiveness", owner: "Director Product Eng", cadence: "Weekly" },
      { name: "Lead time for changes", target: "< 2 days", definition: "Commit to production", why: "Engineering velocity", owner: "Director Product Eng", cadence: "Weekly" },
      { name: "Change failure rate", target: "< 10%", definition: "% deployments causing incidents/rollback", why: "Release safety", owner: "Director Product Eng + SRE", cadence: "Monthly" },
      { name: "Roadmap delivery", target: "≥ 90%", definition: "% of committed roadmap items delivered", why: "Predictability", owner: "Director Product Eng", cadence: "Quarterly" },
    ],
    artifacts: ["Roadmaps", "Release calendar", "Stream KPIs", "Customer workflow maps"],
  },
  dirReliability: {
    id: "dirReliability", type: "leader", name: "Director, Reliability Engineering",
    subtitle: "Owns reliability, SRE practice, observability & operations",
    people: 1, owner: "CTO", maturity: "Maturing",
    icon: Shield, accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Own the SRE practice and reliability outcomes across all services.",
    responsibilities: ["SLOs and error budgets", "Service health and major incidents", "Problem management and prevention", "Observability strategy", "Operational readiness governance"],
    technical: ["Google SRE practices", "Observability strategy", "Incident command", "Cloud operations", "Service ownership coaching"],
    supports: ["Value Stream Teams", "Platform Engineering", "CTO"],
    kpis: [
      { name: "Customer-facing availability", target: "> 99.95%", definition: "Composite uptime", why: "Customer trust", owner: "Director Reliability", cadence: "Monthly" },
      { name: "MTTR", target: "< 30 min", definition: "Mean time to recovery on P1/P2", why: "Operational health", owner: "Director Reliability", cadence: "Monthly" },
      { name: "SLO coverage", target: "100% of Tier-1", definition: "% Tier-1 services with active SLOs", why: "Service ownership maturity", owner: "Director Reliability", cadence: "Quarterly" },
      { name: "Repeat incident rate", target: "< 10%", definition: "% incidents recurring within 90 days", why: "RCA quality", owner: "Director Reliability", cadence: "Quarterly" },
    ],
  },
  dirPlatform: {
    id: "dirPlatform", type: "leader", name: "Director, Platform Engineering",
    subtitle: "Owns platform services & developer productivity",
    people: 1, owner: "CTO", maturity: "Building",
    icon: Cloud, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Own reusable platform services and developer productivity.",
    responsibilities: ["Platform roadmap and catalog", "Self-service and golden paths", "Cloud foundations and developer platform", "Automation standards"],
    technical: ["Platform engineering", "Cloud architecture", "CI/CD", "Infrastructure as code", "Developer experience"],
    supports: ["Value Stream Teams", "Reliability", "Security", "Architecture"],
    kpis: [
      { name: "Provisioning lead time", target: "< 1 hour", definition: "Request to provisioned environment", why: "Developer flow", owner: "Director Platform", cadence: "Monthly" },
      { name: "Platform adoption", target: "≥ 85%", definition: "% teams on golden paths", why: "Standardization", owner: "Director Platform", cadence: "Quarterly" },
      { name: "Developer satisfaction", target: "≥ 4.3/5", definition: "Quarterly DevEx survey", why: "Productivity", owner: "Director Platform", cadence: "Quarterly" },
      { name: "Golden path coverage", target: "≥ 90%", definition: "% workloads on standard patterns", why: "Reuse & safety", owner: "Director Platform", cadence: "Quarterly" },
    ],
  },
  secLead: {
    id: "secLead", type: "leader", name: "Security Lead",
    subtitle: "Owns security strategy, risk management & compliance",
    people: 1, owner: "CTO + CISO", maturity: "Maturing",
    icon: Lock, accent: "border-amber-300 text-amber-900", bg: "bg-amber-50", swatch: "bg-amber-400",
    mission: "Own security strategy and production risk.",
    responsibilities: ["Vulnerability management", "IAM & PAM", "Compliance controls", "Security automation", "Risk reporting"],
    kpis: [
      { name: "Critical vulnerability SLA", target: "100% < 7d", definition: "% critical CVEs remediated within SLA", why: "Risk reduction", owner: "Security Lead", cadence: "Weekly" },
      { name: "Privileged access coverage", target: "100% PAM", definition: "% privileged accounts under PAM", why: "Identity risk", owner: "Security Lead + IAM Eng", cadence: "Quarterly" },
      { name: "Misconfiguration count", target: "Trending down", definition: "Cloud misconfigurations open > 7d", why: "Posture hygiene", owner: "Security Lead", cadence: "Monthly" },
      { name: "Audit readiness score", target: "≥ 95%", definition: "Control evidence completeness", why: "Compliance", owner: "Security Lead", cadence: "Quarterly" },
    ],
  },
  entArch: {
    id: "entArch", type: "leader", name: "Enterprise Architect",
    subtitle: "Owns architecture standards & transformation strategy",
    people: 1, owner: "CTO", maturity: "Mature",
    icon: Building2, accent: "border-rose-300 text-rose-900", bg: "bg-rose-50", swatch: "bg-rose-400",
    mission: "Own architecture standards and transformation direction.",
    responsibilities: ["Reference architectures", "Technical standards", "Modernization decisions", "Architecture governance", "Acquisition integration patterns"],
    kpis: [
      { name: "Architecture standard adoption", target: "≥ 90%", definition: "% new builds on reference patterns", why: "Consistency", owner: "Enterprise Architect", cadence: "Quarterly" },
      { name: "Technical debt reduction", target: "10% YoY", definition: "Debt index trend", why: "Engineering health", owner: "Enterprise Architect", cadence: "Quarterly" },
      { name: "Exception count", target: "Trending down", definition: "Architecture exceptions open", why: "Standards discipline", owner: "Enterprise Architect", cadence: "Monthly" },
      { name: "Acquisition onboarding duration", target: "< 90 days", definition: "Median time to standardize", why: "M&A velocity", owner: "Acquisition Integration Architect", cadence: "Per acquisition" },
    ],
  },

  // ── Value stream teams (5 × 4 = 20)
  caregiver: {
    id: "caregiver", type: "stream", name: "Caregiver Experience Team",
    subtitle: "Mobile experience, visit verification, scheduling, offline",
    people: 4, owner: "Director Product Eng", maturity: "Mature",
    icon: Smartphone, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    connected: ["cloud", "devplat", "obs", "data", "security", "automation"],
    mission: "Deliver a seamless mobile experience that empowers caregivers to complete visits, document care, support offline usage, and get paid accurately.",
    responsibilities: [...COMMON_TEAM_RESP, "Mobile defects and enhancements prioritization", "Coordinate with SRE on uptime & performance"],
    ownedServices: ["Mobile application", "Visit verification", "Scheduling", "Caregiver notifications", "Offline experience"],
    technical: ["Mobile development (iOS/Android)", "API integration", "UX/UI", "Quality engineering", "Performance testing", "Observability awareness", "Secure coding", "Healthcare workflow understanding"],
    kpis: [
      { name: "Mobile app availability", target: "> 99.95%", definition: "Uptime of mobile backend services", why: "Caregivers can't complete visits without it", owner: "Caregiver PO + SRE", cadence: "Monthly" },
      { name: "Visit completion rate", target: "> 96%", definition: "% scheduled visits completed in app", why: "Direct revenue & care quality", owner: "Caregiver PO", cadence: "Weekly" },
      { name: "App crash rate", target: "< 0.5%", definition: "Crashes per session", why: "Field reliability", owner: "Eng Lead", cadence: "Weekly" },
      { name: "Caregiver CSAT", target: "> 4.6 / 5", definition: "In-app survey", why: "Retention", owner: "Caregiver PO", cadence: "Monthly" },
      { name: "Offline sync success", target: "> 98%", definition: "% queued events synced on reconnect", why: "Field reality", owner: "Eng Lead", cadence: "Weekly" },
    ],
    supports: ["Caregivers"],
    supportedBy: ["Platform Engineering", "Reliability Engineering", "Security"],
  },
  provider: {
    id: "provider", type: "stream", name: "Provider Experience Team",
    subtitle: "Provider portal, workflows, authorization, directory",
    people: 4, owner: "Director Product Eng", maturity: "Mature",
    icon: Stethoscope, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    connected: ["cloud", "devplat", "obs", "data", "security"],
    mission: "Enable provider agencies to manage operational workflows efficiently, reliably, and securely.",
    responsibilities: COMMON_TEAM_RESP,
    ownedServices: ["Provider portal", "Provider workflows", "Authorization", "Provider directory", "Provider communications"],
    technical: ["Web application engineering", "Workflow design", "API integration", "Customer operations", "Quality engineering", "Observability awareness", "Secure application development"],
    kpis: [
      { name: "Provider portal availability", target: "> 99.9%", definition: "Portal uptime", why: "Provider productivity", owner: "Provider PO + SRE", cadence: "Monthly" },
      { name: "Workflow completion rate", target: "> 95%", definition: "% workflows finished w/o error", why: "Quality of experience", owner: "Provider PO", cadence: "Weekly" },
      { name: "Provider support ticket volume", target: "Trending down", definition: "Tickets / 1000 active providers", why: "Usability proxy", owner: "Provider PO", cadence: "Monthly" },
      { name: "Provider satisfaction", target: "> 4.4 / 5", definition: "Quarterly survey", why: "Retention", owner: "Provider PO", cadence: "Quarterly" },
    ],
  },
  claims: {
    id: "claims", type: "stream", name: "Claims & Payments Team",
    subtitle: "Claims, billing, payroll, reconciliation",
    people: 4, owner: "Director Product Eng", maturity: "Maturing",
    icon: DollarSign, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    connected: ["cloud", "devplat", "obs", "data", "security", "automation"],
    mission: "Ensure claims, billing, payroll, and reconciliation are accurate, timely, reliable, and auditable.",
    responsibilities: COMMON_TEAM_RESP,
    ownedServices: ["Claims processing", "Billing", "Payments", "Payroll", "Reconciliation"],
    technical: ["Financial workflow engineering", "Data validation", "Integration engineering", "Batch processing", "Audit controls", "Performance engineering"],
    kpis: [
      { name: "Claims throughput", target: "≥ plan", definition: "Claims processed / day", why: "Cash flow", owner: "Claims PO", cadence: "Daily" },
      { name: "Payroll accuracy", target: "> 99.9%", definition: "% payroll runs with no exception", why: "Caregiver trust", owner: "Claims PO", cadence: "Per run" },
      { name: "Reconciliation exception rate", target: "< 1%", definition: "% records requiring manual rec.", why: "Audit risk", owner: "Eng Lead", cadence: "Weekly" },
      { name: "Payment cycle time", target: "≤ 7 days", definition: "Submission to settlement", why: "Working capital", owner: "Claims PO", cadence: "Monthly" },
      { name: "Revenue-impacting incidents", target: "0/quarter", definition: "P1/P2 with $$ impact", why: "Financial reliability", owner: "Claims PO + SRE", cadence: "Quarterly" },
    ],
  },
  member: {
    id: "member", type: "stream", name: "Member Experience Team",
    subtitle: "Member portal, eligibility, enrollment, communications",
    people: 4, owner: "Director Product Eng", maturity: "Mature",
    icon: UserCircle, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    connected: ["cloud", "devplat", "obs", "data", "security"],
    mission: "Deliver a simple, transparent, and reliable member experience across eligibility, enrollment, communications, and member profile.",
    responsibilities: COMMON_TEAM_RESP,
    ownedServices: ["Member portal", "Eligibility", "Enrollment", "Member profile", "Communications"],
    technical: ["Customer journey design", "Web engineering", "API integration", "Data accuracy", "Accessibility (WCAG)", "Secure coding"],
    kpis: [
      { name: "Enrollment completion rate", target: "> 92%", definition: "% started enrollments completed", why: "Member acquisition", owner: "Member PO", cadence: "Weekly" },
      { name: "Member profile accuracy", target: "> 99%", definition: "% records w/o data exception", why: "Eligibility integrity", owner: "Member PO", cadence: "Monthly" },
      { name: "Portal availability", target: "> 99.9%", definition: "Uptime", why: "Self-service", owner: "Member PO + SRE", cadence: "Monthly" },
      { name: "Eligibility response time", target: "< 2s p95", definition: "Eligibility API latency", why: "Workflow flow", owner: "Eng Lead", cadence: "Weekly" },
    ],
  },
  analytics: {
    id: "analytics", type: "stream", name: "Analytics & Insights Team",
    subtitle: "Dashboards, data products, reporting",
    people: 4, owner: "Director Product Eng", maturity: "Maturing",
    icon: BarChart3, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    connected: ["cloud", "devplat", "obs", "data"],
    mission: "Provide actionable insights that improve business decisions, operational transparency, and executive visibility.",
    responsibilities: COMMON_TEAM_RESP,
    ownedServices: ["Dashboards", "Data products", "Reporting", "Business insights", "Ad-hoc analytics"],
    technical: ["Data engineering", "BI development", "Analytics", "Data governance", "SQL", "API data integration", "Data quality"],
    kpis: [
      { name: "Data freshness", target: "≤ 15 min lag", definition: "Source-to-dashboard latency", why: "Decision quality", owner: "Analytics PO", cadence: "Daily" },
      { name: "Report accuracy", target: "> 99.5%", definition: "% reports passing validation", why: "Trust in data", owner: "Eng Lead", cadence: "Monthly" },
      { name: "Dashboard adoption", target: "≥ 80% MAU", definition: "% target audience active", why: "Value delivery", owner: "Analytics PO", cadence: "Quarterly" },
      { name: "Data incident count", target: "Trending down", definition: "Data quality incidents / month", why: "Reliability", owner: "Eng Lead", cadence: "Monthly" },
    ],
  },

  // ── Reliability Engineering org (5)
  relMgr: {
    id: "relMgr", type: "role", name: "Reliability Manager",
    subtitle: "Owns SRE strategy, SLOs, error budgets, reliability reviews",
    people: 1, owner: "Director Reliability", maturity: "Maturing",
    icon: Gauge, accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Own reliability strategy and operational readiness across the engineering org.",
    responsibilities: ["Own SRE strategy", "Own SLO & error budget program", "Run reliability reviews", "Prioritize reliability backlog", "Coordinate value stream teams", "Coordinate with platform & security", "Operational readiness governance"],
    technical: ["Google SRE practices", "Service ownership", "Incident learning", "Observability strategy", "Cloud operations"],
    kpis: [
      { name: "Services with SLOs", target: "100% Tier-1", definition: "Tier-1 services with active SLOs", why: "Maturity baseline", owner: "Reliability Manager", cadence: "Quarterly" },
      { name: "Error budget adoption", target: "100% Tier-1", definition: "Streams using error budget policy", why: "Decision discipline", owner: "Reliability Manager", cadence: "Quarterly" },
      { name: "Repeat incident reduction", target: "10% QoQ", definition: "Recurring incidents within 90d", why: "Learning culture", owner: "Reliability Manager", cadence: "Quarterly" },
      { name: "Operational readiness score", target: "≥ 90%", definition: "% launches passing OR checklist", why: "Launch safety", owner: "Reliability Manager", cadence: "Per launch" },
    ],
  },
  sreEng: {
    id: "sreEng", type: "role", name: "SRE Engineer",
    subtitle: "Service reliability, runbooks, incident response, toil reduction",
    people: 2, owner: "Reliability Manager", maturity: "Building",
    icon: Zap, accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Engineer reliability into services and reduce toil.",
    responsibilities: ["Improve service reliability", "Co-create SLOs with product teams", "Support incident response", "Reduce toil", "Improve runbooks and deployment safety", "Partner with platform on automation"],
    technical: ["Cloud operations (AWS/GCP)", "Linux/Windows", "Observability", "Scripting (Python/Bash)", "Incident response", "Performance analysis", "Automation", "CI/CD awareness"],
    kpis: [
      { name: "MTTR", target: "< 30 min", definition: "Mean recovery on P1/P2", why: "Customer impact", owner: "SRE Eng + Reliability Mgr", cadence: "Monthly" },
      { name: "Toil reduction", target: "≥ 25% YoY", definition: "Hours of manual toil reclaimed", why: "Engineering capacity", owner: "SRE Eng", cadence: "Quarterly" },
      { name: "Runbook automation coverage", target: "≥ 70%", definition: "% runbooks automated", why: "Response speed", owner: "SRE Eng", cadence: "Quarterly" },
      { name: "Incident recurrence rate", target: "< 10%", definition: "Same root cause within 90d", why: "Learning effectiveness", owner: "SRE Eng", cadence: "Quarterly" },
    ],
  },
  obsEng: {
    id: "obsEng", type: "role", name: "Observability Engineer",
    subtitle: "Telemetry standards, dashboards, alert quality",
    people: 1, owner: "Reliability Manager", maturity: "Maturing",
    icon: Activity, accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Make every service observable, every alert actionable.",
    responsibilities: ["Own telemetry patterns", "Maintain monitoring standards", "Improve alert quality and tune noise", "Manage Datadog dashboards", "Create service health views", "Map alerts to service ownership"],
    technical: ["Datadog", "Metrics, logs, traces", "SLO monitoring", "Alert tuning", "Dashboard design", "Telemetry pipelines"],
    kpis: [
      { name: "Actionable alert %", target: "> 90%", definition: "% alerts leading to action", why: "Reduces fatigue", owner: "Observability Eng", cadence: "Monthly" },
      { name: "Duplicate alert reduction", target: "≥ 50% YoY", definition: "Deduped alert ratio", why: "Signal quality", owner: "Observability Eng", cadence: "Quarterly" },
      { name: "Monitoring coverage", target: "100% Tier-1", definition: "% services with golden signals", why: "Coverage baseline", owner: "Observability Eng", cadence: "Quarterly" },
      { name: "Services w/ health dashboards", target: "100% Tier-1", definition: "% with standard dashboard", why: "Visibility", owner: "Observability Eng", cadence: "Quarterly" },
    ],
  },
  incMgr: {
    id: "incMgr", type: "role", name: "Incident & Problem Manager",
    subtitle: "Major incident command, RCA quality, prevention",
    people: 1, owner: "Reliability Manager", maturity: "Mature",
    icon: FileText, accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Lead major incidents to fast recovery and convert each one into prevention.",
    responsibilities: ["Lead major incident process", "Coordinate incident command", "Own problem management", "Drive RCA quality", "Track corrective actions to closure"],
    technical: ["Incident command", "Problem management", "RCA facilitation", "Stakeholder communication", "ITSM"],
    kpis: [
      { name: "MTTR", target: "< 30 min", definition: "Recovery time", why: "Customer impact", owner: "Incident Mgr", cadence: "Monthly" },
      { name: "RCA completion", target: "100% within 7d", definition: "% P1/P2 with RCA on time", why: "Learning discipline", owner: "Incident Mgr", cadence: "Monthly" },
      { name: "Corrective action closure", target: "≥ 90% within 60d", definition: "Actions closed on time", why: "Prevention follow-through", owner: "Incident Mgr", cadence: "Monthly" },
      { name: "Repeat incident rate", target: "< 10%", definition: "Recurrence within 90d", why: "Effectiveness of learning", owner: "Incident Mgr", cadence: "Quarterly" },
    ],
  },

  // ── Platform Engineering (6)
  platMgr: {
    id: "platMgr", type: "role", name: "Platform Manager",
    subtitle: "Platform roadmap, service catalog, golden paths",
    people: 1, owner: "Director Platform", maturity: "Building",
    icon: Layers, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Run the platform as a product for engineering teams.",
    responsibilities: ["Own platform roadmap", "Own service catalog", "Prioritize developer experience", "Define platform standards", "Manage adoption", "Coordinate with product, reliability, security, architecture"],
    technical: ["Platform product management", "Cloud architecture", "Developer experience", "Service catalog design", "Governance"],
    kpis: [
      { name: "Platform adoption", target: "≥ 85%", definition: "% teams on golden paths", why: "Reuse", owner: "Platform Mgr", cadence: "Quarterly" },
      { name: "Developer satisfaction", target: "≥ 4.3/5", definition: "DevEx survey", why: "Productivity", owner: "Platform Mgr", cadence: "Quarterly" },
      { name: "Provisioning lead time", target: "< 1h", definition: "Request → environment", why: "Flow", owner: "Platform Mgr", cadence: "Monthly" },
      { name: "Golden path coverage", target: "≥ 90%", definition: "% workloads on patterns", why: "Standardization", owner: "Platform Mgr", cadence: "Quarterly" },
    ],
  },
  cloudEng: {
    id: "cloudEng", type: "role", name: "Cloud Engineer",
    subtitle: "AWS/GCP, landing zones, networking, IaC",
    people: 2, owner: "Platform Manager", maturity: "Maturing",
    icon: Cloud, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Operate safe, repeatable, cost-efficient cloud foundations.",
    responsibilities: ["Manage AWS/GCP foundations", "Own landing zones", "Networking patterns", "Account & project governance", "Infrastructure as code", "Cost optimization", "Cloud security guardrails"],
    technical: ["AWS", "GCP", "Networking", "IAM", "Terraform", "Cloud security", "FinOps", "Backup & recovery"],
    kpis: [
      { name: "Cloud compliance", target: "100%", definition: "% accounts compliant", why: "Posture", owner: "Cloud Eng", cadence: "Monthly" },
      { name: "Provisioning cycle time", target: "< 1h", definition: "Standard env build", why: "Flow", owner: "Cloud Eng", cadence: "Monthly" },
      { name: "Cloud cost variance", target: "± 5%", definition: "Actual vs plan", why: "Financial discipline", owner: "Cloud Eng + FinOps", cadence: "Monthly" },
      { name: "Policy drift rate", target: "< 2%", definition: "% accounts with drift", why: "Stability", owner: "Cloud Eng", cadence: "Weekly" },
    ],
  },
  devops: {
    id: "devops", type: "role", name: "DevOps Engineer",
    subtitle: "CI/CD patterns, GitHub standards, release automation",
    people: 1, owner: "Platform Manager", maturity: "Maturing",
    icon: GitBranch, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Make safe delivery the easy path.",
    responsibilities: ["Own CI/CD patterns", "Support GitHub standards", "Create reusable deployment templates", "Improve release automation", "Pipeline governance", "Enable safe self-service delivery"],
    technical: ["GitHub Actions", "CI/CD", "Artifact management", "Deployment automation", "Environment management", "Quality gates"],
    kpis: [
      { name: "Deployment frequency", target: "Daily per stream", definition: "Deploys/stream/week", why: "Flow", owner: "DevOps Eng", cadence: "Weekly" },
      { name: "Lead time for changes", target: "< 2d", definition: "Commit → prod", why: "Velocity", owner: "DevOps Eng", cadence: "Weekly" },
      { name: "Change failure rate", target: "< 10%", definition: "% deploys causing incidents", why: "Safety", owner: "DevOps Eng + SRE", cadence: "Monthly" },
      { name: "Pipeline adoption", target: "≥ 90%", definition: "% repos on standard pipelines", why: "Reuse", owner: "DevOps Eng", cadence: "Quarterly" },
    ],
  },
  autoEng: {
    id: "autoEng", type: "role", name: "Automation Engineer",
    subtitle: "Runbook automation, ChatOps, AI-enabled operations",
    people: 1, owner: "Platform Manager", maturity: "Building",
    icon: Bot, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Convert repetitive operations into safe, automated workflows.",
    responsibilities: ["Build runbook automation", "Automate repetitive operational work", "Create self-service workflows", "Support AI-enabled operations", "Integrate tools & APIs"],
    technical: ["Python", "PowerShell", "API integration", "Workflow automation", "ITSM integration", "Cloud automation", "AI-assisted ops"],
    kpis: [
      { name: "Manual task reduction", target: "≥ 30% YoY", definition: "Hours reclaimed", why: "Capacity", owner: "Automation Eng", cadence: "Quarterly" },
      { name: "Runbook automation coverage", target: "≥ 70%", definition: "% runbooks automated", why: "Speed", owner: "Automation Eng", cadence: "Quarterly" },
      { name: "Automation success rate", target: "> 98%", definition: "% executions succeeding", why: "Trust", owner: "Automation Eng", cadence: "Monthly" },
      { name: "Self-service request completion", target: "> 90%", definition: "% completed w/o human", why: "Flow", owner: "Automation Eng", cadence: "Monthly" },
    ],
  },
  dataPlat: {
    id: "dataPlat", type: "role", name: "Data Platform Engineer",
    subtitle: "Databases, APIs, streaming, data services",
    people: 1, owner: "Platform Manager", maturity: "Maturing",
    icon: Database, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Run reliable, performant shared data services.",
    responsibilities: ["Operate databases, APIs, streaming", "Support shared data services & reliability", "Partner with analytics & claims", "Kafka, DB modernization, data movement, perf tuning"],
    technical: ["SQL", "Postgres", "SQL Server", "Oracle awareness", "Kafka", "APIs", "Data pipelines", "DB performance"],
    kpis: [
      { name: "Data platform availability", target: "> 99.95%", definition: "Composite DB/streaming uptime", why: "Foundational", owner: "Data Platform Eng", cadence: "Monthly" },
      { name: "Data freshness", target: "≤ 15 min", definition: "Source → consumer", why: "Decisioning", owner: "Data Platform Eng", cadence: "Daily" },
      { name: "Database incident count", target: "Trending down", definition: "DB-caused incidents / month", why: "Reliability", owner: "Data Platform Eng", cadence: "Monthly" },
      { name: "Query performance", target: "p95 within SLO", definition: "Tier-1 query p95 latency", why: "App responsiveness", owner: "Data Platform Eng", cadence: "Weekly" },
    ],
  },

  // ── Security (3)
  secEng: {
    id: "secEng", type: "role", name: "Security Engineer",
    subtitle: "Vulnerability remediation, secure configuration",
    people: 1, owner: "Security Lead", maturity: "Maturing",
    icon: Shield, accent: "border-amber-300 text-amber-900", bg: "bg-amber-50", swatch: "bg-amber-400",
    mission: "Make secure the default in cloud & delivery.",
    responsibilities: ["Manage vulnerability remediation workflows", "Review cloud security & firewall risks", "Support secure configuration", "Partner with DevOps on security gates", "Support incident response readiness"],
    technical: ["Cloud security", "Vulnerability management", "Secure configuration", "CrowdStrike awareness", "SIEM awareness", "Threat modeling", "Security automation"],
    kpis: [
      { name: "Vulnerability age (critical)", target: "< 7d", definition: "Median age of open critical CVEs", why: "Risk window", owner: "Security Eng", cadence: "Weekly" },
      { name: "Misconfiguration count", target: "Trending down", definition: "Open > 7d", why: "Posture", owner: "Security Eng", cadence: "Weekly" },
      { name: "Automated control coverage", target: "≥ 80%", definition: "% controls auto-enforced", why: "Scalability", owner: "Security Eng", cadence: "Quarterly" },
      { name: "Security finding recurrence", target: "< 10%", definition: "% findings reappearing", why: "Fix quality", owner: "Security Eng", cadence: "Quarterly" },
    ],
  },
  iamEng: {
    id: "iamEng", type: "role", name: "IAM Engineer",
    subtitle: "Identity, SSO, MFA, PAM, least privilege",
    people: 1, owner: "Security Lead", maturity: "Building",
    icon: Lock, accent: "border-amber-300 text-amber-900", bg: "bg-amber-50", swatch: "bg-amber-400",
    mission: "Own identity as a control plane.",
    responsibilities: ["Identity & access control patterns", "Entra, AD, SSO, MFA, PAM, access reviews", "Reduce identity fragmentation", "JML automation"],
    technical: ["Entra", "Active Directory", "PAM", "IAM governance", "Identity lifecycle", "Federation"],
    kpis: [
      { name: "Privileged access coverage", target: "100% PAM", definition: "% priv accounts in PAM", why: "Lateral risk", owner: "IAM Eng", cadence: "Quarterly" },
      { name: "JML automation", target: "≥ 90%", definition: "% lifecycle events automated", why: "Speed & accuracy", owner: "IAM Eng", cadence: "Quarterly" },
      { name: "Orphaned account count", target: "0", definition: "Accounts w/o valid owner", why: "Hygiene", owner: "IAM Eng", cadence: "Monthly" },
      { name: "Access review completion", target: "100% on time", definition: "% reviews completed", why: "Compliance", owner: "IAM Eng", cadence: "Quarterly" },
    ],
  },

  // ── Architecture (additional role)
  acqArch: {
    id: "acqArch", type: "role", name: "Acquisition Integration Architect",
    subtitle: "Onboards acquired platforms, standardizes & integrates",
    people: 1, owner: "Enterprise Architect", maturity: "Building",
    icon: Network, accent: "border-rose-300 text-rose-900", bg: "bg-rose-50", swatch: "bg-rose-400",
    mission: "Make acquired platforms safe, observable, and ownable inside the operating model.",
    responsibilities: ["Onboard acquired platforms", "Assess inherited technology", "Define integration patterns", "Standardize security, observability, identity, platform, runbooks", "Acquisition readiness playbooks"],
    technical: ["M&A technology integration", "Cloud assessment", "Dependency mapping", "Security onboarding", "Service cataloging", "Application modernization"],
    kpis: [
      { name: "Acquisition onboarding duration", target: "< 90 days", definition: "Median time to standardize", why: "M&A velocity", owner: "Acquisition Architect", cadence: "Per acquisition" },
      { name: "Assets mapped", target: "100%", definition: "% inherited assets catalogued", why: "Visibility", owner: "Acquisition Architect", cadence: "Per acquisition" },
      { name: "Controls onboarded", target: "100% baseline", definition: "% controls applied", why: "Risk reduction", owner: "Acquisition Architect", cadence: "Per acquisition" },
      { name: "Services assigned owners", target: "100%", definition: "% services with owner", why: "Accountability", owner: "Acquisition Architect", cadence: "Per acquisition" },
    ],
  },

  // ── Shared Services
  cloud: { id: "cloud", type: "service", name: "Cloud Infrastructure", subtitle: "AWS, GCP, networking, compute, storage, landing zones",
    icon: Cloud, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400", owner: "Platform Engineering",
    mission: "Provide standardized, compliant cloud foundations on demand.",
    technical: ["AWS", "GCP", "Networking", "IAM", "Terraform", "Backup/DR"],
    kpis: [
      { name: "Cloud availability", target: "> 99.99%", definition: "Composite cloud platform uptime", why: "Foundation", owner: "Cloud Eng", cadence: "Monthly" },
      { name: "Provisioning time", target: "< 1h", definition: "Std env request → ready", why: "Flow", owner: "Cloud Eng", cadence: "Monthly" },
    ],
    supports: ["All value stream teams"],
  },
  devplat: { id: "devplat", type: "service", name: "Developer Platform", subtitle: "GitHub, CI/CD, artifacts, templates, environments",
    icon: Code2, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400", owner: "Platform Engineering",
    mission: "Make safe delivery the path of least resistance.",
    technical: ["GitHub Actions", "Artifact registry", "Templates", "Quality gates"],
    kpis: [
      { name: "Pipeline adoption", target: "≥ 90%", definition: "% repos on std pipelines", why: "Reuse", owner: "DevOps Eng", cadence: "Quarterly" },
    ],
  },
  obs: { id: "obs", type: "service", name: "Observability", subtitle: "Datadog, logs, metrics, traces, alerts, dashboards",
    icon: Activity, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400", owner: "Reliability + Platform",
    mission: "Make every service observable with consistent telemetry.",
    technical: ["Datadog", "OpenTelemetry", "SLO monitoring", "Alert tuning"],
    kpis: [
      { name: "Monitoring coverage", target: "100% Tier-1", definition: "Services w/ golden signals", why: "Baseline", owner: "Observability Eng", cadence: "Quarterly" },
    ],
  },
  data: { id: "data", type: "service", name: "Data Services", subtitle: "Databases, APIs, streaming, Kafka, data governance",
    icon: Database, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400", owner: "Platform Engineering",
    mission: "Reliable, governed data and APIs for product teams.",
    technical: ["Postgres", "SQL Server", "Kafka", "API gateway"],
    kpis: [
      { name: "Data platform availability", target: "> 99.95%", definition: "Composite uptime", why: "Foundation", owner: "Data Platform Eng", cadence: "Monthly" },
    ],
  },
  security: { id: "security", type: "service", name: "Security Services", subtitle: "IAM, PAM, secrets, vulnerability mgmt, compliance",
    icon: Shield, accent: "border-amber-300 text-amber-900", bg: "bg-amber-50", swatch: "bg-amber-400", owner: "Security",
    mission: "Embed security controls in platforms, pipelines, and identity.",
    technical: ["Entra", "PAM", "Secrets management", "Vuln scanning", "Compliance evidence"],
    kpis: [
      { name: "Critical vulns within SLA", target: "100%", definition: "% remediated < 7d", why: "Risk", owner: "Security Eng", cadence: "Weekly" },
    ],
  },
  automation: { id: "automation", type: "service", name: "Automation", subtitle: "Runbooks, self-service, AI workflows, ChatOps",
    icon: Bot, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400", owner: "Platform Engineering",
    mission: "Codify repeatable work into safe, self-service automations.",
    technical: ["Workflow engine", "ChatOps", "API integrations", "AI-assisted ops"],
    kpis: [
      { name: "Automation coverage", target: "≥ 70%", definition: "% runbooks automated", why: "Speed", owner: "Automation Eng", cadence: "Quarterly" },
    ],
  },

  // ── Partner Augmentation
  pManagedOps: { id: "pManagedOps", type: "partner", name: "Managed Operations", subtitle: "L0/L1 monitoring, event triage, backup checks",
    icon: Wrench, accent: "border-orange-300 text-orange-900", bg: "bg-orange-50", swatch: "bg-orange-400", owner: "Partner-delivered, Internal-governed",
    mission: "Executes repeatable monitoring and operational tasks under internal direction.",
    supports: ["Reliability Engineering", "Platform Engineering"],
    kpis: [
      { name: "Alert response time", target: "< 5 min", definition: "Time to acknowledge", why: "Operational SLA", owner: "Reliability Manager", cadence: "Weekly" },
    ],
  },
  pNoc: { id: "pNoc", type: "partner", name: "24×7 Operations Support", subtitle: "Infrastructure event response, escalation",
    icon: Server, accent: "border-orange-300 text-orange-900", bg: "bg-orange-50", swatch: "bg-orange-400", owner: "Partner-delivered",
    mission: "Provide always-on coverage for infrastructure events and escalations.",
    supports: ["Platform Engineering"],
    kpis: [{ name: "Escalation accuracy", target: "> 95%", definition: "% correctly escalated", why: "Reduces noise", owner: "Reliability Manager", cadence: "Monthly" }],
  },
  pAppSup: { id: "pAppSup", type: "partner", name: "Application Support", subtitle: "L2/L3 support, incident handling",
    icon: Users, accent: "border-orange-300 text-orange-900", bg: "bg-orange-50", swatch: "bg-orange-400", owner: "Partner-delivered",
    mission: "Execute application support workflows under product team ownership.",
    supports: ["Value Stream Teams", "Reliability"],
    kpis: [{ name: "Tier handoff rate", target: "Trending down", definition: "% escalated to internal", why: "Capability uplift", owner: "Eng Lead", cadence: "Monthly" }],
  },
  pAutoTools: { id: "pAutoTools", type: "partner", name: "Automation & Tools", subtitle: "Tooling enhancements, script development",
    icon: Bot, accent: "border-orange-300 text-orange-900", bg: "bg-orange-50", swatch: "bg-orange-400", owner: "Partner-delivered",
    mission: "Surge capacity for automation engineering under internal architecture direction.",
    supports: ["Platform Engineering", "Reliability"],
    kpis: [{ name: "Automation backlog burn-down", target: "On plan", definition: "Items delivered vs plan", why: "Throughput", owner: "Platform Mgr", cadence: "Monthly" }],
  },
  pProjects: { id: "pProjects", type: "partner", name: "Projects & Delivery", subtitle: "Modernization, migrations, major initiatives",
    icon: TrendingUp, accent: "border-orange-300 text-orange-900", bg: "bg-orange-50", swatch: "bg-orange-400", owner: "Partner-delivered",
    mission: "Engineering surge for modernization and migration initiatives.",
    supports: ["Architecture", "Platform Engineering"],
    kpis: [{ name: "Milestone delivery", target: "≥ 90%", definition: "% on plan", why: "Predictability", owner: "Enterprise Architect", cadence: "Quarterly" }],
  },

  // ── Outcomes
  oAvail: { id: "oAvail", type: "outcome", name: "High Availability", subtitle: "> 99.95% uptime", icon: CheckCircle2,
    accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Customer-facing services remain available within target.",
    kpis: [{ name: "Availability", target: "> 99.95%", definition: "Composite uptime", why: "Customer trust", owner: "Reliability", cadence: "Monthly" }] },
  oMttr: { id: "oMttr", type: "outcome", name: "Fast Recovery", subtitle: "MTTR < 30 min (target)", icon: Zap,
    accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Recover quickly from disruptions.",
    kpis: [{ name: "MTTR", target: "< 30 min", definition: "Recovery time", why: "Customer impact", owner: "Reliability", cadence: "Monthly" }] },
  oOpex: { id: "oOpex", type: "outcome", name: "Operational Excellence", subtitle: "Fewer incidents, proactive ops",
    icon: Target, accent: "border-emerald-300 text-emerald-900", bg: "bg-emerald-50", swatch: "bg-emerald-400",
    mission: "Repeatable, proactive operations.",
    kpis: [{ name: "Incident volume", target: "Trending down", definition: "P1/P2 per month", why: "Health", owner: "Reliability", cadence: "Monthly" }] },
  oVelocity: { id: "oVelocity", type: "outcome", name: "Engineering Velocity", subtitle: "Faster delivery, lower lead time",
    icon: Sparkles, accent: "border-violet-300 text-violet-900", bg: "bg-violet-50", swatch: "bg-violet-400",
    mission: "Move faster safely.",
    kpis: [{ name: "Lead time", target: "< 2d", definition: "Commit → prod", why: "Flow", owner: "Product Eng", cadence: "Weekly" }] },
  oSecurity: { id: "oSecurity", type: "outcome", name: "Security & Compliance", subtitle: "Secure by design, audit ready",
    icon: Shield, accent: "border-amber-300 text-amber-900", bg: "bg-amber-50", swatch: "bg-amber-400",
    mission: "Continuous control validation, audit readiness.",
    kpis: [{ name: "Audit readiness", target: "≥ 95%", definition: "Control evidence completeness", why: "Compliance", owner: "Security", cadence: "Quarterly" }] },
  oCost: { id: "oCost", type: "outcome", name: "Cost Optimization", subtitle: "Right-sized, FinOps, reduced waste",
    icon: DollarSign, accent: "border-sky-300 text-sky-900", bg: "bg-sky-50", swatch: "bg-sky-400",
    mission: "Right-sized cloud spend with FinOps discipline.",
    kpis: [{ name: "Cloud cost variance", target: "± 5%", definition: "Actual vs plan", why: "Discipline", owner: "Cloud Eng", cadence: "Monthly" }] },
  oCx: { id: "oCx", type: "outcome", name: "Customer Experience", subtitle: "Reliable, secure, delightful",
    icon: HeartHandshake, accent: "border-rose-300 text-rose-900", bg: "bg-rose-50", swatch: "bg-rose-400",
    mission: "Reliable, secure, delightful experiences for caregivers, providers, members.",
    kpis: [{ name: "CSAT", target: "≥ 4.5/5", definition: "Composite CSAT", why: "Retention", owner: "Product Eng", cadence: "Quarterly" }] },
};

const VALUE_STREAMS = ["caregiver", "provider", "claims", "member", "analytics"];
const RELIABILITY = ["relMgr", "sreEng", "obsEng", "incMgr"];
const PLATFORM = ["platMgr", "cloudEng", "devops", "autoEng", "dataPlat"];
const SECURITY = ["secEng", "iamEng"]; // Sec Lead shown in leaders row
const ARCHITECTURE = ["acqArch"]; // Ent Arch shown in leaders row
const SERVICES = ["cloud", "devplat", "obs", "data", "security", "automation"];
const PARTNERS = ["pManagedOps", "pNoc", "pAppSup", "pAutoTools", "pProjects"];
const OUTCOMES = ["oAvail", "oMttr", "oOpex", "oVelocity", "oSecurity", "oCost", "oCx"];

const PANE_ORDER = [
  "cto", "dirProduct", "dirReliability", "dirPlatform", "secLead", "entArch",
  ...VALUE_STREAMS, ...RELIABILITY, ...PLATFORM, ...SECURITY, ...ARCHITECTURE,
  ...SERVICES, ...PARTNERS, ...OUTCOMES,
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function FunctionalOrgChart() {
  const navigate = useNavigate();
  const [view, setView] = useState<"org" | "capability">("org");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const selectedEntity = selected ? ENTITIES[selected] : null;
  const idx = selected ? PANE_ORDER.indexOf(selected) : -1;

  const highlight = (id: string) => {
    if (!hover) return false;
    if (hover === id) return true;
    const h = ENTITIES[hover];
    return !!(h?.connected?.includes(id));
  };
  const dim = (id: string) => !!hover && hover !== id && !highlight(id);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-[1480px] mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/reliability-foundations")} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Reliability Foundations
          </button>
          <div className="text-xs text-slate-500">Future-State Operating Model · Functional Org Chart</div>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-6 py-8">
        {/* Title block */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              FUTURE-STATE RELIABILITY ENGINEERING ORGANIZATION
            </h1>
            <div className="mt-1 text-lg font-semibold text-sky-700">Functional Organization Structure</div>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              40 internal team members organized around value streams, platform services, reliability, security,
              architecture, and partner augmentation — to deliver exceptional caregiver, provider, and member experiences.
            </p>
          </div>

          {/* Header indicators */}
          <div className="flex items-stretch gap-3">
            <div className="rounded-xl bg-slate-900 text-white px-4 py-3 text-center shadow-sm">
              <div className="text-2xl font-bold leading-none">40</div>
              <div className="text-[10px] uppercase tracking-wider mt-1 opacity-80">Internal Team Members</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed shadow-sm">
              <IndicatorRow n="5" text="Value Stream Teams" />
              <IndicatorRow n="3" text="Shared Engineering Organizations" />
              <IndicatorRow n="4" text="Enabling & Governance Functions" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed shadow-sm">
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-orange-500"/> Partner Augmented Delivery</div>
              <div className="flex items-center gap-2 mt-1"><Bot className="w-3.5 h-3.5 text-sky-500"/> Automation-First Operations</div>
            </div>
          </div>
        </div>

        {/* CTO + View toggle row */}
        <div className="grid grid-cols-3 items-center mb-6">
          <div />
          <div className="flex justify-center">
            <button
              onClick={() => setSelected("cto")}
              onMouseEnter={() => setHover("cto")} onMouseLeave={() => setHover(null)}
              className="w-72 rounded-2xl border-2 border-slate-300 bg-white p-4 hover:shadow-md transition-shadow text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="font-semibold text-slate-900">CTO</div>
              <div className="text-xs text-slate-600 mt-1">Chief Technology Officer</div>
            </button>
          </div>
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs text-slate-500 mr-1">View by:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button onClick={() => setView("org")} className={`px-3 py-1.5 text-xs rounded-md ${view==="org" ? "bg-sky-600 text-white" : "text-slate-600"}`}>Organization</button>
                <button onClick={() => setView("capability")} className={`px-3 py-1.5 text-xs rounded-md ${view==="capability" ? "bg-sky-600 text-white" : "text-slate-600"}`}>Capabilities</button>
              </div>
            </div>
          </div>
        </div>

        {/* Reporting line */}
        <div className="flex justify-center -mt-2 mb-2"><div className="w-px h-6 bg-slate-300" /></div>

        {/* Director row */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {["dirProduct","dirReliability","dirPlatform","secLead","entArch"].map((id) => (
            <LeaderCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} />
          ))}
        </div>

        {/* Functional rows */}
        <div className="grid grid-cols-12 gap-3 mb-8">
          {/* Value Streams (5 wide) */}
          <div className="col-span-5 rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
            <SectionHeader label="VALUE STREAM TEAMS" count="20" tint="violet" />
            <div className="grid grid-cols-5 gap-2">
              {VALUE_STREAMS.map((id) => (
                <StreamCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} highlight={highlight(id)} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-violet-700 font-semibold">
              <ArrowLeft className="w-3 h-3"/> Own End-to-End Outcomes <ArrowRight className="w-3 h-3"/>
            </div>
          </div>

          {/* Reliability Engineering */}
          <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4">
            <SectionHeader label="RELIABILITY ENGINEERING" count="5" tint="emerald" />
            <div className="space-y-2">
              {RELIABILITY.map((id) => <RoleCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} />)}
            </div>
            <PeopleFooter n={5} tint="emerald" />
          </div>

          {/* Platform Engineering */}
          <div className="col-span-3 rounded-2xl border border-sky-200 bg-sky-50/30 p-4">
            <SectionHeader label="PLATFORM ENGINEERING" count="6" tint="sky" />
            <div className="space-y-2">
              {PLATFORM.map((id) => <RoleCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} />)}
            </div>
            <PeopleFooter n={6} tint="sky" />
          </div>

          {/* Security */}
          <div className="col-span-1 rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
            <SectionHeader label="SECURITY" count="3" tint="amber" />
            <div className="space-y-2">
              <RoleCard id="secLead" onSelect={setSelected} onHover={setHover} active={selected==="secLead"} dim={dim("secLead")} compact />
              {SECURITY.map((id) => <RoleCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} compact />)}
            </div>
            <PeopleFooter n={3} tint="amber" />
          </div>

          {/* Architecture */}
          <div className="col-span-1 rounded-2xl border border-rose-200 bg-rose-50/30 p-4">
            <SectionHeader label="ARCH. & TRANSFORM." count="2" tint="rose" />
            <div className="space-y-2">
              <RoleCard id="entArch" onSelect={setSelected} onHover={setHover} active={selected==="entArch"} dim={dim("entArch")} compact />
              {ARCHITECTURE.map((id) => <RoleCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} compact />)}
            </div>
            <PeopleFooter n={2} tint="rose" />
          </div>
        </div>

        {/* Shared Platform Services */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-center mb-3">
            <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              Shared Platform Services <span className="text-slate-500 font-normal normal-case">(consumed by value stream teams)</span>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {SERVICES.map((id) => <ServiceCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} highlight={highlight(id)} />)}
          </div>
        </div>

        {/* Partner Augmentation */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50/30 p-4 mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
              Partner Augmentation <span className="text-orange-700/80 font-normal normal-case">(flexible capacity & specialized skills)</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {PARTNERS.map((id) => <PartnerCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} dim={dim(id)} />)}
          </div>
        </div>

        {/* Outcomes */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
              Outcomes We Deliver Together
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {OUTCOMES.map((id) => <OutcomeCard key={id} id={id} onSelect={setSelected} onHover={setHover} active={selected===id} />)}
          </div>
        </div>

        {/* Legend */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700">LEGEND:</span>
          <LegendItem swatch="line" label="Reporting Line" color="bg-slate-700" />
          <LegendItem swatch="dash" label="Functional Collaboration" color="border-slate-500" />
          <LegendItem swatch="arrow" label="Platform Consumption" color="text-violet-600" />
          <LegendItem swatch="dot" label="Partner Augmentation" color="text-orange-500" />
          <span className="w-px h-4 bg-slate-300" />
          <span className="inline-flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5 text-sky-600" /> Product Owner</span>
          <span className="inline-flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5 text-slate-700" /> Engineering Lead</span>
          <span className="inline-flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-slate-500" /> Software Engineer</span>
          <span className="inline-flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-700" /> Manager / Lead</span>
        </div>

        <p className="mt-6 text-[10px] text-slate-400 text-center">
          Illustrative example. Numbers and targets are reference values to support operating-model design discussions.
        </p>
      </div>

      {/* Right Pane */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[42vw] sm:w-[42vw] p-0 overflow-y-auto">
          {selectedEntity && (
            <EntityPane
              entity={selectedEntity}
              onPrev={() => idx > 0 && setSelected(PANE_ORDER[idx - 1])}
              onNext={() => idx >= 0 && idx < PANE_ORDER.length - 1 && setSelected(PANE_ORDER[idx + 1])}
              indexInfo={`${idx + 1} of ${PANE_ORDER.length}`}
              onJump={setSelected}
              onClose={() => setSelected(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small UI atoms
// ─────────────────────────────────────────────────────────────────────────────
function IndicatorRow({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-slate-100 text-slate-700 text-[9px] font-bold">{n}</span>
      <span className="text-slate-700">{text}</span>
    </div>
  );
}

function SectionHeader({ label, count, tint }: { label: string; count: string; tint: string }) {
  const map: Record<string, string> = {
    violet: "text-violet-800", emerald: "text-emerald-800", sky: "text-sky-800", amber: "text-amber-800", rose: "text-rose-800",
  };
  return (
    <div className={`flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-3 ${map[tint]}`}>
      <span>{label}</span><span className="opacity-70">({count})</span>
    </div>
  );
}

function PeopleFooter({ n, tint }: { n: number; tint: string }) {
  const map: Record<string, string> = { violet: "bg-violet-100 text-violet-800", emerald: "bg-emerald-100 text-emerald-800", sky: "bg-sky-100 text-sky-800", amber: "bg-amber-100 text-amber-800", rose: "bg-rose-100 text-rose-800" };
  return (
    <div className={`mt-3 mx-auto w-fit px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${map[tint]}`}>
      <span className="text-base font-bold mr-1">{n}</span>People
    </div>
  );
}

function LegendItem({ swatch, label, color }: { swatch: "line"|"dash"|"arrow"|"dot"; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch === "line" && <span className={`w-6 h-0.5 ${color}`} />}
      {swatch === "dash" && <span className={`w-6 h-0 border-t border-dashed ${color}`} />}
      {swatch === "arrow" && <ArrowRight className={`w-3.5 h-3.5 ${color}`} />}
      {swatch === "dot" && <span className={`w-6 h-0 border-t border-dotted ${color.replace("text-", "border-")}`} />}
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card components
// ─────────────────────────────────────────────────────────────────────────────
function LeaderCard({ id, active, dim, onSelect, onHover }: { id: string; active: boolean; dim: boolean; onSelect: (i: string)=>void; onHover: (i: string|null)=>void; }) {
  const e = ENTITIES[id]; const Icon = e.icon;
  return (
    <button
      onClick={() => onSelect(id)} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      className={`text-left rounded-xl border bg-white p-3 hover:shadow-md transition-all ${e.accent} ${active ? "ring-2 ring-offset-1 ring-slate-400" : ""} ${dim ? "opacity-50" : ""}`}
    >
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${e.bg} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{e.name.includes(",") ? e.name.split(",")[0] : "Lead"}</div>
      <div className="text-sm font-bold text-slate-900 leading-tight">{e.name.includes(",") ? e.name.split(", ")[1] : e.name}</div>
      <div className="text-[11px] text-slate-600 mt-1 leading-snug">{e.subtitle}</div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
        <UserCircle className="w-3 h-3" /> 1
      </div>
    </button>
  );
}

function StreamCard({ id, active, dim, highlight, onSelect, onHover }: { id: string; active: boolean; dim: boolean; highlight: boolean; onSelect: (i: string)=>void; onHover: (i: string|null)=>void; }) {
  const e = ENTITIES[id]; const Icon = e.icon;
  return (
    <button
      onClick={() => onSelect(id)} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      className={`text-left rounded-lg border border-violet-200 bg-white p-2.5 hover:shadow-md transition-all ${active ? "ring-2 ring-violet-400" : ""} ${dim ? "opacity-40" : ""} ${highlight ? "ring-2 ring-violet-400" : ""}`}
    >
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-violet-100 text-violet-700 mb-1.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="text-[11px] font-bold text-slate-900 leading-tight">{e.name.replace(" Team", "")}<br/>Team</div>
      <div className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-3">{e.subtitle?.split(",")[0]}</div>
      <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
        <div className="flex items-center gap-1"><UserCircle className="w-3 h-3" /> PO</div>
        <div className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Eng Lead</div>
        <div className="flex items-center gap-1"><Code2 className="w-3 h-3" /> 2 Engineers</div>
      </div>
      <div className="mt-2 -mx-2.5 -mb-2.5 px-2.5 py-1.5 bg-violet-100/70 rounded-b-lg text-center">
        <span className="text-base font-bold text-violet-800">4</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-violet-700 ml-1">People</span>
      </div>
    </button>
  );
}

function RoleCard({ id, active, dim, onSelect, onHover, compact }: { id: string; active: boolean; dim: boolean; onSelect: (i: string)=>void; onHover: (i: string|null)=>void; compact?: boolean }) {
  const e = ENTITIES[id]; const Icon = e.icon;
  return (
    <button
      onClick={() => onSelect(id)} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      className={`w-full text-left rounded-lg border bg-white px-2.5 py-2 hover:shadow-sm transition-all ${e.accent} ${active ? "ring-2 ring-offset-1" : ""} ${dim ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${e.bg} flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[11px] font-bold leading-tight ${compact ? "" : "text-slate-900"}`}>
            {e.name}{e.people && e.people > 1 ? <span className="ml-1 text-slate-500 font-normal">({e.people})</span> : null}
          </div>
          {!compact && <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{e.subtitle}</div>}
        </div>
      </div>
    </button>
  );
}

function ServiceCard({ id, active, dim, highlight, onSelect, onHover }: { id: string; active: boolean; dim: boolean; highlight: boolean; onSelect: (i: string)=>void; onHover: (i: string|null)=>void; }) {
  const e = ENTITIES[id]; const Icon = e.icon;
  return (
    <button
      onClick={() => onSelect(id)} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      className={`text-left rounded-lg border border-slate-200 bg-white p-2.5 hover:shadow-md transition-all ${active ? "ring-2 ring-sky-400" : ""} ${dim ? "opacity-40" : ""} ${highlight ? "ring-2 ring-violet-400" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-sky-50 text-sky-700">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-900 leading-tight">{e.name}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{e.subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function PartnerCard({ id, active, dim, onSelect, onHover }: { id: string; active: boolean; dim: boolean; onSelect: (i: string)=>void; onHover: (i: string|null)=>void; }) {
  const e = ENTITIES[id]; const Icon = e.icon;
  return (
    <button
      onClick={() => onSelect(id)} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      className={`text-left rounded-lg border border-orange-200 bg-white p-2.5 hover:shadow-md transition-all ${active ? "ring-2 ring-orange-400" : ""} ${dim ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2">
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-orange-50 text-orange-700">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-900 leading-tight">{e.name}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{e.subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function OutcomeCard({ id, active, onSelect, onHover }: { id: string; active: boolean; onSelect: (i: string)=>void; onHover: (i: string|null)=>void; }) {
  const e = ENTITIES[id]; const Icon = e.icon;
  return (
    <button
      onClick={() => onSelect(id)} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)}
      className={`text-left rounded-lg border border-slate-200 bg-white p-2.5 hover:shadow-md transition-all ${active ? "ring-2 ring-slate-400" : ""}`}
    >
      <div className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${e.bg} mb-1.5`}>
        <Icon className={`w-4 h-4 ${e.accent.split(" ").find(c => c.startsWith("text-"))}`} />
      </div>
      <div className="text-[11px] font-bold text-slate-900 leading-tight">{e.name}</div>
      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{e.subtitle}</div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right-side pane
// ─────────────────────────────────────────────────────────────────────────────
function EntityPane({ entity, onPrev, onNext, indexInfo, onJump, onClose }: { entity: Entity; onPrev: ()=>void; onNext: ()=>void; indexInfo: string; onJump: (id: string)=>void; onClose: ()=>void; }) {
  const Icon = entity.icon;
  const typeLabel = useMemo(() => ({
    exec: "Executive", leader: "Functional Leader", stream: "Value Stream Team", function: "Function",
    role: "Role", service: "Shared Platform Service", partner: "Partner Function", outcome: "Outcome",
  } as Record<EntityType, string>)[entity.type], [entity.type]);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${entity.bg} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${entity.accent.split(" ").find(c => c.startsWith("text-"))}`} />
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg font-bold text-slate-900 leading-tight">{entity.name}</SheetTitle>
            <div className="text-xs text-slate-500 mt-0.5">{typeLabel}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4"/></button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
          {entity.people !== undefined && <PaneFact label="People" value={String(entity.people)} />}
          {entity.owner && <PaneFact label="Owner" value={entity.owner} />}
          {entity.maturity && <PaneFact label="Maturity" value={entity.maturity} />}
          {entity.connected && entity.connected.length > 0 && <PaneFact label="Connected" value={`${entity.connected.length} services`} />}
        </div>
      </SheetHeader>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="px-6 mt-3 flex flex-wrap justify-start h-auto bg-transparent gap-1">
          {["overview","responsibilities","ownership","competencies","interactions","kpis","artifacts","risks","growth"].map(t => (
            <TabsTrigger key={t} value={t} className="text-[11px] capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white">{t}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <TabsContent value="overview" className="space-y-4 mt-4">
            {entity.mission && <PaneSection title="Mission"><p className="text-sm text-slate-700 leading-relaxed">{entity.mission}</p></PaneSection>}
            {entity.why && <PaneSection title="Why this exists"><p className="text-sm text-slate-700 leading-relaxed">{entity.why}</p></PaneSection>}
            {entity.supportsModel && <PaneSection title="How it supports the operating model"><p className="text-sm text-slate-700 leading-relaxed">{entity.supportsModel}</p></PaneSection>}
          </TabsContent>

          <TabsContent value="responsibilities" className="space-y-4 mt-4">
            {entity.responsibilities && <PaneList title="Primary responsibilities" items={entity.responsibilities} />}
            {entity.secondaryResp && <PaneList title="Secondary responsibilities" items={entity.secondaryResp} />}
            {entity.notOwn && <PaneList title="Does not own" items={entity.notOwn} />}
            {entity.decisionsMade && <PaneList title="Key decisions made" items={entity.decisionsMade} />}
            {entity.decisionsInfluenced && <PaneList title="Key decisions influenced" items={entity.decisionsInfluenced} />}
            {!entity.responsibilities && <Empty />}
          </TabsContent>

          <TabsContent value="ownership" className="space-y-4 mt-4">
            {entity.ownedServices && <PaneList title="Owned services" items={entity.ownedServices} />}
            {entity.ownedArtifacts && <PaneList title="Owned artifacts" items={entity.ownedArtifacts} />}
            {entity.ownedMetrics && <PaneList title="Owned metrics" items={entity.ownedMetrics} />}
            {entity.decisionRights && <PaneList title="Decision rights" items={entity.decisionRights} />}
            {entity.escalationOwnership && <PaneSection title="Escalation ownership"><p className="text-sm text-slate-700">{entity.escalationOwnership}</p></PaneSection>}
            {entity.ownershipBoundaries && <PaneList title="Service ownership boundaries" items={entity.ownershipBoundaries} />}
            {!entity.ownedServices && !entity.ownedArtifacts && !entity.ownedMetrics && <Empty />}
          </TabsContent>

          <TabsContent value="competencies" className="space-y-4 mt-4">
            {entity.technical && <PaneTags title="Technical" items={entity.technical} />}
            {entity.operating && <PaneTags title="Operating" items={entity.operating} />}
            {entity.business && <PaneTags title="Business" items={entity.business} />}
            {entity.leadership && <PaneTags title="Leadership" items={entity.leadership} />}
            {entity.tools && <PaneTags title="Tools & technologies" items={entity.tools} />}
            {entity.certifications && <PaneTags title="Certifications" items={entity.certifications} />}
            {entity.type === "stream" && <>
              <PaneTags title="Common stream competencies" items={COMMON_TEAM_COMP} />
            </>}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4 mt-4">
            {entity.supports && <PaneList title="This team supports" items={entity.supports} />}
            {entity.supportedBy && <PaneList title="Supported by" items={entity.supportedBy} />}
            {entity.interactionTypes && <PaneTags title="Interaction types" items={entity.interactionTypes} />}
            {entity.workflows && <PaneList title="Common workflows" items={entity.workflows} />}
            {entity.handoffs && <PaneList title="Common handoffs" items={entity.handoffs} />}
            {entity.reduceHandoffs && <PaneSection title="How handoffs should be reduced"><p className="text-sm text-slate-700">{entity.reduceHandoffs}</p></PaneSection>}
            {entity.connected && entity.connected.length > 0 && (
              <PaneSection title="Jump to consumed services">
                <div className="flex flex-wrap gap-1.5">
                  {entity.connected.map(c => (
                    <button key={c} onClick={() => onJump(c)} className="text-[11px] px-2 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100">
                      {ENTITIES[c]?.name} <ChevronRight className="w-3 h-3 inline" />
                    </button>
                  ))}
                </div>
              </PaneSection>
            )}
            {!entity.supports && !entity.supportedBy && !entity.connected && <Empty />}
          </TabsContent>

          <TabsContent value="kpis" className="space-y-3 mt-4">
            {entity.kpis ? entity.kpis.map((k, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-sm text-slate-900">{k.name}</div>
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{k.target}</div>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{k.definition}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500">
                  <div><span className="font-semibold text-slate-600">Why:</span> {k.why}</div>
                  <div><span className="font-semibold text-slate-600">Owner:</span> {k.owner}</div>
                  <div><span className="font-semibold text-slate-600">Cadence:</span> {k.cadence}</div>
                  {k.current && <div><span className="font-semibold text-slate-600">Current:</span> {k.current}</div>}
                </div>
              </div>
            )) : <Empty />}
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-4 mt-4">
            {entity.artifacts ? <PaneList title="Artifacts" items={entity.artifacts} /> : (
              <PaneList title="Standard artifacts" items={[
                "Service catalog entry", "Ownership matrix", "Runbooks",
                "Architecture diagrams", "SLO dashboards", "Error budget reports",
                "RCA reports", "Operational readiness checklist",
                "Release readiness checklist", "Security evidence", "Transformation roadmap",
              ]} />
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4 mt-4">
            {entity.failureModes && <PaneList title="Failure modes" items={entity.failureModes} />}
            {entity.antiPatterns && <PaneList title="Anti-patterns" items={entity.antiPatterns} />}
            {entity.dependencyRisks && <PaneList title="Dependency risks" items={entity.dependencyRisks} />}
            {entity.skillGaps && <PaneList title="Skill gaps" items={entity.skillGaps} />}
            {entity.controlGaps && <PaneList title="Control gaps" items={entity.controlGaps} />}
            {entity.customerImpact && <PaneSection title="Customer impact if weak"><p className="text-sm text-slate-700">{entity.customerImpact}</p></PaneSection>}
            {entity.mitigation && <PaneSection title="Mitigation approach"><p className="text-sm text-slate-700">{entity.mitigation}</p></PaneSection>}
            {!entity.failureModes && !entity.antiPatterns && !entity.mitigation && <Empty />}
          </TabsContent>

          <TabsContent value="growth" className="space-y-4 mt-4">
            {entity.growth12 && <PaneList title="Maturity at 12 months" items={entity.growth12} />}
            {entity.growth24 && <PaneList title="Maturity at 24 months" items={entity.growth24} />}
            {entity.whenAdd && <PaneSection title="When to add capacity"><p className="text-sm text-slate-700">{entity.whenAdd}</p></PaneSection>}
            {entity.whenAutomate && <PaneSection title="When to automate"><p className="text-sm text-slate-700">{entity.whenAutomate}</p></PaneSection>}
            {entity.whenPartner && <PaneSection title="When to shift to partner"><p className="text-sm text-slate-700">{entity.whenPartner}</p></PaneSection>}
            {entity.whenRetire && <PaneSection title="When to retire / merge"><p className="text-sm text-slate-700">{entity.whenRetire}</p></PaneSection>}
            {!entity.growth12 && !entity.growth24 && <Empty />}
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
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

function PaneFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-xs font-semibold text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}
function PaneSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">{title}</div>
      {children}
    </div>
  );
}
function PaneList({ title, items }: { title: string; items: string[] }) {
  return (
    <PaneSection title={title}>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400 mt-1">•</span><span>{it}</span></li>
        ))}
      </ul>
    </PaneSection>
  );
}
function PaneTags({ title, items }: { title: string; items: string[] }) {
  return (
    <PaneSection title={title}>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-700">{it}</span>
        ))}
      </div>
    </PaneSection>
  );
}
function Empty() {
  return <p className="text-xs text-slate-400 italic">No content for this section.</p>;
}
