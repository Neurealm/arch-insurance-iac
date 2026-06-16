import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Workflow, Boxes, Sparkles, Layers, ShieldCheck, Cloud, Database,
  Activity, Code2, GitBranch, ArrowRight, ArrowLeft, Building2, BarChart3,
  ClipboardList, CheckCircle2, XCircle, AlertTriangle, Target, Eye, Cpu,
  DollarSign, Smartphone, FileText, CreditCard, UserCheck, PieChart,
  type LucideIcon,
} from "lucide-react";

/* ===================== Tones ===================== */
type Tone = "sky" | "emerald" | "violet" | "amber" | "rose" | "teal" | "slate" | "indigo";
const TONE: Record<Tone, { bg: string; text: string; ring: string; chip: string; border: string; soft: string; dot: string }> = {
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-300",     chip: "bg-sky-100 text-sky-800",         border: "border-sky-200",     soft: "bg-sky-50/60",     dot: "bg-sky-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-300", chip: "bg-emerald-100 text-emerald-800", border: "border-emerald-200", soft: "bg-emerald-50/60", dot: "bg-emerald-500" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-300",  chip: "bg-violet-100 text-violet-800",   border: "border-violet-200",  soft: "bg-violet-50/60",  dot: "bg-violet-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-300",   chip: "bg-amber-100 text-amber-800",     border: "border-amber-200",   soft: "bg-amber-50/60",   dot: "bg-amber-500" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-300",    chip: "bg-rose-100 text-rose-800",       border: "border-rose-200",    soft: "bg-rose-50/60",    dot: "bg-rose-500" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    ring: "ring-teal-300",    chip: "bg-teal-100 text-teal-800",       border: "border-teal-200",    soft: "bg-teal-50/60",    dot: "bg-teal-500" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-700",   ring: "ring-slate-300",   chip: "bg-slate-100 text-slate-800",     border: "border-slate-200",   soft: "bg-slate-50/60",   dot: "bg-slate-500" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-300",  chip: "bg-indigo-100 text-indigo-800",   border: "border-indigo-200",  soft: "bg-indigo-50/60",  dot: "bg-indigo-500" },
};

/* ===================== Data Types ===================== */
type EntityKind = "exec" | "stream" | "platform" | "enabling" | "subsystem" | "kpi";

type Entity = {
  id: string;
  kind: EntityKind;
  name: string;
  tone: Tone;
  icon: LucideIcon;
  tagline: string;
  summary: {
    mission: string;
    why: string;
    value: string;
  };
  owns?: string[];
  doesNotOwn?: string[];
  applications?: string[];
  roles?: { role: string; count: number }[];
  size?: string;
  dependencies?: { team: string; nature: string }[];
  kpis?: { name: string; current: string; target: string; forecast: string }[];
  hhax?: string[];
  workflow?: string[];
  artifacts?: string[];
  journey?: { current: string; target: string; milestones: string[]; timeline: string };
  related?: string[]; // entity ids to highlight when hovered
};

/* ===================== Executive Leadership ===================== */
const EXECS: Entity[] = [
  {
    id: "cto", kind: "exec", name: "CTO", tone: "indigo", icon: Users,
    tagline: "Chief Technology Officer · Technology strategy",
    summary: { mission: "Set technology direction and operating model for the future state.", why: "Strategy needs a single accountable owner to align engineering, platforms, reliability, and security.", value: "Coherent technology bets, faster execution, lower duplication." },
    owns: ["Technology strategy", "Architecture council", "Engineering operating model", "AI strategy"],
    roles: [{ role: "CTO", count: 1 }, { role: "Chief of Staff", count: 1 }, { role: "Principal Architects", count: 4 }],
    related: ["vp-product","vp-rel","vp-plat","vp-sec","vp-data"],
    hhax: ["Move from ITIL to SRE", "Standardize across acquired platforms", "Set cloud + AI direction"],
  },
  {
    id: "vp-product", kind: "exec", name: "VP Product Engineering", tone: "sky", icon: Workflow,
    tagline: "Customer-facing delivery",
    summary: { mission: "Own customer-facing software delivery across stream-aligned teams.", why: "Customer outcomes require a single owner of the product engineering org.", value: "Faster delivery, higher CSAT, predictable roadmaps." },
    owns: ["All stream-aligned teams", "Product engineering hiring", "Delivery cadence"],
    related: ["caregiver","provider","claims","member","analytics"],
    hhax: ["Caregiver Mobile Experience", "Claims Processing", "Provider Services", "Self-Direction"],
  },
  {
    id: "vp-rel", kind: "exec", name: "VP Reliability Engineering (SRE)", tone: "emerald", icon: Activity,
    tagline: "Reliability outcomes",
    summary: { mission: "Own reliability outcomes across all customer-facing services.", why: "Reliability requires a dedicated org with authority over error-budget policy.", value: "99.95%+ availability, MTTR reduction, error-budget discipline." },
    owns: ["Error budget policy", "Reliability platform", "Incident command", "SRE enablement"],
    related: ["reliability-plat","sre-en"],
    hhax: ["SLOs for caregiver mobile + claims", "Blameless postmortems", "On-call rotation across acquired platforms"],
  },
  {
    id: "vp-plat", kind: "exec", name: "VP Platform Engineering", tone: "teal", icon: Boxes,
    tagline: "Reusable platforms",
    summary: { mission: "Build internal platforms as products — adopted, measured, loved.", why: "Without platforms, every stream team duplicates non-differentiating work.", value: "Time-to-first-deploy in hours, golden paths used by default." },
    owns: ["Cloud platform", "Reliability platform", "Data platform", "Developer experience platform"],
    related: ["cloud-plat","reliability-plat","sec-plat","data-plat","devx-plat"],
    hhax: ["AWS + GCP landing zones", "GitHub standardization", "Containerization & Golden Image"],
  },
  {
    id: "vp-sec", kind: "exec", name: "VP Security", tone: "rose", icon: ShieldCheck,
    tagline: "Security strategy",
    summary: { mission: "Embed security into platforms and delivery — not as gates.", why: "Healthcare data requires controls without slowing engineering.", value: "Lower risk, faster audits, fewer late-stage blocks." },
    owns: ["Security platform team", "Zero-trust strategy", "Compliance program", "DevSecOps enablement"],
    related: ["sec-plat","devsec-en"],
    hhax: ["HIPAA + HITRUST posture", "Identity federation across acquisitions", "Vulnerability management at scale"],
  },
  {
    id: "vp-data", kind: "exec", name: "VP Data & Analytics", tone: "violet", icon: Database,
    tagline: "Enterprise data",
    summary: { mission: "Make data a product across Client and acquired platforms.", why: "Acquired platforms produce siloed data; the business needs unified insight.", value: "Faster decisions, trustworthy data, AI/ML readiness." },
    owns: ["Data platform team", "Analytics & insights stream", "Data governance"],
    related: ["data-plat","analytics"],
    hhax: ["Unify Sandata + Pavilio data", "Operational + financial data products", "AI/ML enablement"],
  },
];

/* ===================== Stream-Aligned Teams ===================== */
const STREAMS: Entity[] = [
  {
    id: "caregiver", kind: "stream", name: "Caregiver Experience Team", tone: "sky", icon: Smartphone,
    tagline: "Mobile, scheduling, visit verification",
    summary: {
      mission: "Deliver a seamless mobile experience that empowers caregivers to complete visits, deliver care, and get paid accurately and on time.",
      why: "The caregiver is Client's frontline user. Mobile experience drives retention, EVV compliance, and payroll accuracy.",
      value: "Higher visit completion, fewer support tickets, better caregiver retention.",
    },
    owns: ["Caregiver Mobile App", "Visit Verification (EVV)", "Scheduling", "Caregiver Notifications", "Offline Experience"],
    doesNotOwn: ["Cloud infrastructure (Cloud Platform)", "Identity (Security Platform)", "Observability tooling (Reliability Platform)"],
    applications: ["HHA Mobile", "EVV Service", "Scheduler", "Notification Service"],
    roles: [
      { role: "Product Owner", count: 1 }, { role: "Tech Lead", count: 1 },
      { role: "Developers", count: 7 }, { role: "QA", count: 2 }, { role: "SRE", count: 2 },
    ],
    size: "13 people",
    dependencies: [
      { team: "Cloud Platform Team", nature: "Infra, networking, IaC" },
      { team: "Reliability Platform Team", nature: "Observability, SLOs, alerts" },
      { team: "Security Platform Team", nature: "Auth, secrets, compliance" },
      { team: "Data Platform Team", nature: "Events, streaming" },
      { team: "Integration Services Team", nature: "Third-party + internal APIs" },
    ],
    kpis: [
      { name: "Mobile Availability", current: "99.5%", target: "99.95%", forecast: "+0.45pt" },
      { name: "Visit Completion Rate", current: "92%", target: "> 97%", forecast: "+5pt" },
      { name: "App Crash Rate", current: "1.2%", target: "< 0.5%", forecast: "-58%" },
      { name: "Deployment Frequency", current: "Weekly", target: "Daily", forecast: "5×" },
      { name: "MTTR", current: "3 hrs", target: "< 30 min", forecast: "-83%" },
    ],
    hhax: ["Caregiver Mobile Experience", "EVV regulatory compliance", "Offline rural usage"],
    workflow: ["Caregiver action in mobile", "Visit Verification", "Cloud Platform routing", "Reliability Platform monitoring", "Incident response (if needed)", "Customer outcome"],
    artifacts: ["Service Catalog", "Ownership Matrix", "Runbooks", "SLO Dashboard", "Error Budget Dashboard"],
    journey: { current: "Multiple regional mobile builds, shared backend with claims", target: "Single mobile platform, owned backend, daily releases, 99.95% availability", milestones: ["Unify mobile builds", "Decouple from claims monolith", "Reach daily deploys", "Achieve 99.95%"], timeline: "18 months" },
    related: ["cloud-plat","reliability-plat","sec-plat","data-plat","integration"],
  },
  {
    id: "provider", kind: "stream", name: "Provider Experience Team", tone: "violet", icon: UserCheck,
    tagline: "Provider portal, authorization, communications",
    summary: { mission: "Enable providers with efficient tools to manage members and deliver care.", why: "Providers drive utilization, throughput, and reimbursement quality.", value: "Faster auths, higher provider satisfaction, reduced phone load." },
    owns: ["Provider Portal", "Provider Workflows", "Authorization", "Provider Directory", "Communications"],
    doesNotOwn: ["Identity (Security Platform)", "Underlying claims engine (Claims Team)"],
    applications: ["Provider Portal", "Auth Service", "Provider Directory"],
    roles: [{ role: "Product Owner", count: 1 }, { role: "Tech Lead", count: 1 }, { role: "Developers", count: 6 }, { role: "QA", count: 2 }, { role: "SRE", count: 1 }],
    size: "11 people",
    dependencies: [
      { team: "Cloud Platform Team", nature: "Compute, networking" },
      { team: "Security Platform Team", nature: "Provider identity, OAuth" },
      { team: "Integration Services Team", nature: "Clearinghouse + EHR integration" },
    ],
    kpis: [
      { name: "Portal Uptime", current: "99.7%", target: "99.95%", forecast: "+0.25pt" },
      { name: "Provider CSAT", current: "72", target: "> 85", forecast: "+13" },
      { name: "Transaction Success", current: "94%", target: "> 99%", forecast: "+5pt" },
    ],
    hhax: ["Provider portal across acquired platforms", "Sandata provider workflows", "Pavilio onboarding"],
    workflow: ["Provider login", "Auth workflow", "Integration to clearinghouse", "Status callback", "Provider notified"],
    artifacts: ["Service Catalog", "Ownership Matrix", "Provider API Spec"],
    journey: { current: "Multiple portals per acquired tenant", target: "Unified provider portal, single sign-on", milestones: ["Consolidate portals", "Federate identity", "Unify auth workflow"], timeline: "12 months" },
    related: ["cloud-plat","sec-plat","integration"],
  },
  {
    id: "claims", kind: "stream", name: "Claims & Payments Team", tone: "amber", icon: CreditCard,
    tagline: "Claims processing, billing, payroll, reconciliation",
    summary: { mission: "Process claims accurately and pay providers and caregivers on time.", why: "Claims & payroll are Client's revenue engine and the most regulated workflow.", value: "Faster cash cycle, fewer rejections, accurate payroll." },
    owns: ["Claims Processing", "Billing", "Payments", "Payroll", "Reconciliation"],
    doesNotOwn: ["Policy engine (Subsystem)", "Clearinghouse integration (Integration Services)"],
    applications: ["Claims Engine", "Billing Service", "Payroll Service", "Reconciliation Service"],
    roles: [{ role: "Product Owner", count: 1 }, { role: "Tech Lead", count: 1 }, { role: "Developers", count: 8 }, { role: "QA", count: 3 }, { role: "SRE", count: 2 }],
    size: "15 people",
    dependencies: [
      { team: "Policy Engine Team", nature: "Business rules" },
      { team: "Integration Services Team", nature: "EDI / clearinghouse" },
      { team: "Data Platform Team", nature: "Financial data stream" },
      { team: "Reliability Platform Team", nature: "SLOs, alerts" },
    ],
    kpis: [
      { name: "Claims Throughput", current: "120k/day", target: "200k/day", forecast: "+67%" },
      { name: "Payroll Accuracy", current: "99.1%", target: "> 99.9%", forecast: "+0.8pt" },
      { name: "Revenue Cycle Days", current: "27 days", target: "< 18 days", forecast: "-33%" },
      { name: "Change Failure Rate", current: "12%", target: "< 5%", forecast: "-58%" },
    ],
    hhax: ["Claims Processing", "Payroll Processing", "Revenue cycle reliability"],
    workflow: ["Claim intake", "Policy engine evaluation", "Clearinghouse submission", "Reconciliation", "Payment"],
    artifacts: ["Service Catalog", "Ownership Matrix", "Revenue Cycle Dashboard"],
    journey: { current: "Monolithic claims with batch payroll", target: "Decomposed services, near-real-time reconciliation", milestones: ["Decompose claims monolith", "Real-time recon", "Daily payroll"], timeline: "24 months" },
    related: ["policy-eng","integration","data-plat","reliability-plat"],
  },
  {
    id: "member", kind: "stream", name: "Member & Enrollment Team", tone: "emerald", icon: Users,
    tagline: "Member portal, eligibility, enrollment",
    summary: { mission: "Deliver a simple and transparent member experience.", why: "Members are the regulated population driving compliance and engagement.", value: "Higher enrollment completion, fewer abandoned applications." },
    owns: ["Member Portal", "Eligibility", "Enrollment", "Profile Management", "Member Communications"],
    doesNotOwn: ["Provider workflows", "Claims engine"],
    applications: ["Member Portal", "Eligibility Service", "Enrollment Service"],
    roles: [{ role: "Product Owner", count: 1 }, { role: "Tech Lead", count: 1 }, { role: "Developers", count: 5 }, { role: "QA", count: 2 }, { role: "SRE", count: 1 }],
    size: "10 people",
    dependencies: [
      { team: "Security Platform Team", nature: "Identity, consent" },
      { team: "Integration Services Team", nature: "Eligibility sources" },
      { team: "Cloud Platform Team", nature: "Compute" },
    ],
    kpis: [
      { name: "Enrollment Completion", current: "78%", target: "> 90%", forecast: "+12pt" },
      { name: "Member CSAT", current: "70", target: "> 82", forecast: "+12" },
      { name: "Service Response Time", current: "p95 1.4s", target: "< 500ms", forecast: "-64%" },
    ],
    hhax: ["Self-Direction member journey", "Sandata member data unification"],
    workflow: ["Member application", "Eligibility check", "Enrollment", "Confirmation"],
    artifacts: ["Service Catalog", "Ownership Matrix", "Member Journey Map"],
    journey: { current: "Multiple portals across tenants", target: "Unified member experience", milestones: ["Unified portal", "Single eligibility service"], timeline: "12 months" },
    related: ["sec-plat","integration","cloud-plat"],
  },
  {
    id: "analytics", kind: "stream", name: "Analytics & Insights Team", tone: "teal", icon: PieChart,
    tagline: "Dashboards, data products, reporting",
    summary: { mission: "Provide actionable insights that drive better business outcomes.", why: "Data is fragmented across acquired platforms; the business needs trusted, fresh insight.", value: "Faster decisions, regulatory reporting accuracy, AI-readiness." },
    owns: ["Executive Dashboards", "Data Products", "Operational Reporting", "Business Insights", "Ad-hoc Analytics"],
    doesNotOwn: ["Source-of-truth applications", "Data infrastructure (Data Platform)"],
    applications: ["BI Tooling", "Reporting Service", "Insight Apps"],
    roles: [{ role: "Product Owner", count: 1 }, { role: "Tech Lead", count: 1 }, { role: "Data Engineers", count: 5 }, { role: "Analysts", count: 3 }],
    size: "10 people",
    dependencies: [
      { team: "Data Platform Team", nature: "Streaming, lakehouse, governance" },
      { team: "Security Platform Team", nature: "Row-level security" },
    ],
    kpis: [
      { name: "Data Freshness", current: "24 hrs", target: "< 15 min", forecast: "-99%" },
      { name: "Report Accuracy", current: "96%", target: "> 99.5%", forecast: "+3.5pt" },
      { name: "Business Adoption", current: "45%", target: "> 85%", forecast: "+40pt" },
    ],
    hhax: ["Unified analytics across Sandata + Pavilio", "Operational + financial KPIs", "AI/ML feature pipelines"],
    workflow: ["Source data", "Streaming ingest", "Governed lakehouse", "Data products", "Business consumption"],
    artifacts: ["Data Product Catalog", "Lineage Map", "Quality Dashboard"],
    journey: { current: "T+1 reports, fragmented sources", target: "Near-real-time data products, governed", milestones: ["Lakehouse v1", "First 10 data products"], timeline: "18 months" },
    related: ["data-plat","sec-plat"],
  },
];

/* ===================== Platform Teams ===================== */
const PLATFORMS: Entity[] = [
  {
    id: "cloud-plat", kind: "platform", name: "Cloud Platform Team", tone: "sky", icon: Cloud,
    tagline: "AWS · GCP · Azure · Landing Zones · IaC",
    summary: { mission: "Provide secure, multi-cloud landing zones consumed by every stream team.", why: "Acquired estates and modernization require a unified cloud foundation.", value: "Time-to-first-environment in hours, embedded guardrails, lower spend." },
    owns: ["AWS / GCP / Azure landing zones", "Networking", "IaC (Terraform)", "Account management", "Cost optimization (FinOps)"],
    applications: ["Landing zone modules", "IaC templates", "Cost dashboards"],
    roles: [{ role: "Platform PM", count: 1 }, { role: "Platform Engineers", count: 8 }, { role: "Network Engineers", count: 2 }, { role: "FinOps", count: 2 }],
    size: "13 people",
    kpis: [
      { name: "Time-to-Environment", current: "3 weeks", target: "< 1 day", forecast: "-95%" },
      { name: "Platform Adoption", current: "40%", target: "> 95%", forecast: "+55pt" },
      { name: "Cloud Cost Variance", current: "±18%", target: "< ±5%", forecast: "-72%" },
    ],
    hhax: ["AWS platform", "Virginia data center exit", "Cloud migration of acquired workloads"],
    related: ["caregiver","provider","claims","member","analytics","devx-plat"],
    artifacts: ["Landing Zone Catalog", "IaC Module Library", "Cost Dashboard"],
    journey: { current: "Ad-hoc cloud accounts per tenant", target: "Unified landing zones, embedded guardrails", milestones: ["Landing zone v1", "100% IaC", "Multi-region DR"], timeline: "12 months" },
  },
  {
    id: "reliability-plat", kind: "platform", name: "Reliability Platform Team", tone: "emerald", icon: Activity,
    tagline: "Observability · SLOs · Error Budgets · Incident",
    summary: { mission: "Provide reliability tooling and standards consumed by every service.", why: "Without unified observability and SLO tooling, reliability is anecdotal.", value: "Detect faster, recover faster, fewer customer-impacting events." },
    owns: ["Observability (Datadog)", "SLOs & Error Budgets", "Monitoring standards", "Alerting & on-call", "Incident platform", "Reliability tooling"],
    applications: ["Datadog", "SLO portal", "Incident platform"],
    roles: [{ role: "Platform PM", count: 1 }, { role: "SRE", count: 6 }, { role: "Platform Engineers", count: 3 }],
    size: "10 people",
    kpis: [
      { name: "Observability Coverage", current: "62%", target: "> 95%", forecast: "+33pt" },
      { name: "MTTD", current: "20 min", target: "< 5 min", forecast: "-75%" },
      { name: "SLO Adoption", current: "30%", target: "> 90%", forecast: "+60pt" },
    ],
    hhax: ["SLOs for caregiver mobile, claims, provider portal", "Error budget policy", "Unified incident platform"],
    related: ["caregiver","provider","claims","member","analytics","sre-en"],
    artifacts: ["SLO Catalog", "Runbook Catalog", "Incident Playbook"],
    journey: { current: "Tool sprawl, partial coverage", target: "Unified observability, SLOs on Tier-1 services", milestones: ["Datadog consolidation", "SLO v1 catalog"], timeline: "12 months" },
  },
  {
    id: "sec-plat", kind: "platform", name: "Security Platform Team", tone: "rose", icon: ShieldCheck,
    tagline: "Identity · Zero Trust · VM · Compliance",
    summary: { mission: "Embed security into platforms — guardrails, not gates.", why: "Healthcare data + acquisitions = constant identity and compliance pressure.", value: "Lower risk, faster audits, fewer late-stage blocks." },
    owns: ["Identity & Access", "Zero Trust", "Security Automation", "Vulnerability Management", "Compliance Platform", "Security Monitoring"],
    applications: ["IAM", "PAM", "Secrets manager", "CSPM"],
    roles: [{ role: "Platform PM", count: 1 }, { role: "Security Engineers", count: 6 }, { role: "Compliance Engineer", count: 2 }],
    size: "9 people",
    kpis: [
      { name: "Critical Vulns Open > 30d", current: "42", target: "0", forecast: "-100%" },
      { name: "IAM Coverage", current: "70%", target: "100%", forecast: "+30pt" },
      { name: "Compliance Cycle Time", current: "12 wks", target: "< 4 wks", forecast: "-67%" },
    ],
    hhax: ["Federate identity across acquired tenants", "Zero-trust posture", "HITRUST automation"],
    related: ["caregiver","provider","member","devsec-en"],
    artifacts: ["IAM Policy Catalog", "Compliance Evidence Vault"],
    journey: { current: "Per-tenant identity, manual evidence", target: "Federated identity, automated controls", milestones: ["Federation v1", "Policy-as-code rollout"], timeline: "15 months" },
  },
  {
    id: "data-plat", kind: "platform", name: "Data Platform Team", tone: "violet", icon: Database,
    tagline: "Databases · Kafka · Streaming · Governance",
    summary: { mission: "Provide a unified data foundation for operational and analytical workloads.", why: "Acquired platforms produce siloed data; AI/ML and reporting demand unification.", value: "Trustworthy data, faster decisions, ML-ready features." },
    owns: ["Data engineering platform", "Shared databases", "Kafka & streaming", "Data lake / lakehouse", "Data governance", "Data APIs"],
    applications: ["Lakehouse", "Streaming bus", "Catalog & lineage"],
    roles: [{ role: "Platform PM", count: 1 }, { role: "Data Engineers", count: 7 }, { role: "Governance Lead", count: 1 }],
    size: "9 people",
    kpis: [
      { name: "Data Freshness (Tier-1)", current: "24 hrs", target: "< 15 min", forecast: "-99%" },
      { name: "Data Product Count", current: "0", target: "> 25", forecast: "25" },
      { name: "Catalog Coverage", current: "30%", target: "> 95%", forecast: "+65pt" },
    ],
    hhax: ["Sandata + Pavilio data unification", "AI/ML feature pipelines"],
    related: ["analytics","claims","caregiver"],
    artifacts: ["Data Product Catalog", "Lineage Map"],
    journey: { current: "Per-tenant data warehouses", target: "Governed lakehouse + streaming", milestones: ["Lakehouse v1", "Streaming bus live"], timeline: "18 months" },
  },
  {
    id: "devx-plat", kind: "platform", name: "Developer Experience Platform Team", tone: "teal", icon: Code2,
    tagline: "CI/CD · GitHub · Golden Paths · Self-Service",
    summary: { mission: "Make the path to production fast, safe, and the default choice.", why: "Without golden paths, every team reinvents pipelines and quality.", value: "Daily deploys, low change failure rate, high DX NPS." },
    owns: ["CI/CD platform", "GitHub standards", "Golden paths", "Developer portal", "Self-service tools", "Templates & SDKs"],
    applications: ["CI/CD", "Internal Developer Portal", "Templates"],
    roles: [{ role: "Platform PM", count: 1 }, { role: "Platform Engineers", count: 6 }, { role: "DX Engineer", count: 2 }, { role: "Tech Writer", count: 1 }],
    size: "10 people",
    kpis: [
      { name: "Time-to-First-Deploy", current: "4 wks", target: "< 1 day", forecast: "20×" },
      { name: "Pipeline Reuse", current: "35%", target: "> 90%", forecast: "+55pt" },
      { name: "DX NPS", current: "+10", target: "> +45", forecast: "+35" },
    ],
    hhax: ["GitHub standardization", "Containerization initiative", "Golden Image initiative"],
    related: ["caregiver","provider","claims","member","analytics"],
    artifacts: ["Golden Path Catalog", "Service Template Library"],
    journey: { current: "Pipeline-per-team", target: "Self-service IDP with golden paths", milestones: ["IDP v1", "Top 5 golden paths"], timeline: "12 months" },
  },
];

/* ===================== Enabling Teams ===================== */
const ENABLERS: Entity[] = [
  { id: "sre-en", kind: "enabling", name: "SRE Enablement", tone: "emerald", icon: Activity,
    tagline: "Coach teams on SRE practices & reliability",
    summary: { mission: "Coach stream teams on SLOs, error budgets, blameless postmortems.", why: "SRE is a practice, not a tool — needs in-team coaching to land.", value: "Stream teams self-sufficient in reliability practices." },
    owns: ["Coaching engagements", "Reference patterns", "Maturity assessments"],
    roles: [{ role: "SRE Coaches", count: 3 }, { role: "Practice Lead", count: 1 }],
    size: "4 people",
    kpis: [{ name: "Teams Coached", current: "2/qtr", target: "6/qtr", forecast: "3×" }, { name: "Exit Rate", current: "40%", target: "> 80%", forecast: "2×" }],
    hhax: ["Move from ITIL to SRE across acquired teams"], related: ["caregiver","provider","claims","member","analytics"],
    artifacts: ["Engagement Charter", "Maturity Model"], journey: { current: "Practice nascent", target: "All Tier-1 teams at SRE Level 3", milestones: ["Pilot 2 teams", "Roll to 6"], timeline: "12 months" }
  },
  { id: "devsec-en", kind: "enabling", name: "DevSecOps Enablement", tone: "rose", icon: ShieldCheck,
    tagline: "Embed secure delivery practices",
    summary: { mission: "Accelerate adoption of secure delivery practices in stream teams.", why: "Security as a gate slows delivery; as a coached practice it accelerates it.", value: "Lower vulns in prod, faster releases." },
    owns: ["Secure SDLC patterns", "Threat modeling coaching", "Pipeline security checks"],
    roles: [{ role: "Coaches", count: 3 }], size: "3 people",
    kpis: [{ name: "Teams Coached", current: "1/qtr", target: "4/qtr", forecast: "4×" }],
    hhax: ["DevSecOps across acquired teams", "Pipeline guardrails"], related: ["caregiver","provider","claims","member"],
    artifacts: ["Secure SDLC Playbook"], journey: { current: "Sec gates", target: "Coached self-sufficiency", milestones: ["Pilot", "Scale"], timeline: "12 months" }
  },
  { id: "cloud-en", kind: "enabling", name: "Cloud Enablement", tone: "sky", icon: Cloud,
    tagline: "Help workloads adopt landing zones",
    summary: { mission: "Coach teams on multi-cloud reference patterns and migrations.", why: "Acquired workloads need help adopting landing zones and FinOps.", value: "Faster migrations, fewer anti-patterns." },
    owns: ["Migration patterns", "Refactor coaching", "Cloud architecture reviews"],
    roles: [{ role: "Cloud Architects", count: 3 }], size: "3 people",
    kpis: [{ name: "Workloads Migrated/qtr", current: "3", target: "10", forecast: "3×" }],
    hhax: ["Virginia DC exit", "AWS landing zone adoption"], related: ["cloud-plat","caregiver","claims"],
    artifacts: ["Migration Playbook"], journey: { current: "Lift-and-shift", target: "Refactor-by-default", milestones: ["Pattern library", "Wave 1"], timeline: "18 months" }
  },
  { id: "auto-en", kind: "enabling", name: "Automation Enablement", tone: "violet", icon: Cpu,
    tagline: "Build automation patterns & toil reduction",
    summary: { mission: "Coach teams to identify and automate toil.", why: "Without automation coaching, ops keeps drowning in repetitive work.", value: "Toil reduction, capacity reclaimed for engineering." },
    owns: ["Automation patterns", "Toil scoring", "Runbook automation"], roles: [{ role: "Automation Engineers", count: 3 }], size: "3 people",
    kpis: [{ name: "Toil Reduced", current: "0%", target: "> 40%", forecast: "+40pt" }],
    hhax: ["Reduce operational interruptions"], related: ["reliability-plat","caregiver","claims"],
    artifacts: ["Toil Inventory"], journey: { current: "Manual ops", target: "Automated runbooks", milestones: ["Toil baseline", "Top-20 automated"], timeline: "12 months" }
  },
  { id: "finops-en", kind: "enabling", name: "FinOps Enablement", tone: "amber", icon: DollarSign,
    tagline: "Cost transparency & engineering accountability",
    summary: { mission: "Make cost visible at the service and team level.", why: "Without FinOps coaching, cost grows opaquely; engineers can't optimize.", value: "Cloud spend variance reduced, transparent unit economics." },
    owns: ["Tagging discipline", "Cost dashboards per team", "Showback / chargeback"], roles: [{ role: "FinOps Coaches", count: 2 }], size: "2 people",
    kpis: [{ name: "Teams with Cost Dashboard", current: "20%", target: "100%", forecast: "+80pt" }],
    hhax: ["Cloud cost transparency across acquisitions"], related: ["cloud-plat","claims","analytics"],
    artifacts: ["FinOps Playbook", "Tagging Standard"], journey: { current: "Opaque", target: "Per-service unit economics", milestones: ["Tagging 100%", "Dashboards"], timeline: "9 months" }
  },
];

/* ===================== Complicated Subsystem Teams ===================== */
const SUBSYSTEMS: Entity[] = [
  { id: "legacy-db", kind: "subsystem", name: "Legacy Database Platform", tone: "amber", icon: Database,
    tagline: "Own complex legacy databases & migrations",
    summary: { mission: "Operate and evolve legacy databases without burdening stream teams.", why: "Decades-old schemas require deep DBAs and careful change.", value: "Stream teams don't carry DB complexity; modernization happens safely." },
    owns: ["Legacy DB operations", "Schema evolution", "Migration strategy"], roles: [{ role: "Senior DBAs", count: 4 }], size: "4 people",
    kpis: [{ name: "Schema Change Lead Time", current: "6 wks", target: "< 1 wk", forecast: "-83%" }],
    hhax: ["HHA Enterprise DBs", "Sandata legacy DBs"], related: ["claims","member"],
    artifacts: ["Migration Plan", "Schema Catalog"], journey: { current: "Frozen", target: "Modernized with stream-team velocity", milestones: ["Replatform Tier-1"], timeline: "24 months" }
  },
  { id: "integration", kind: "subsystem", name: "Integration Services Team", tone: "teal", icon: GitBranch,
    tagline: "Manage ESB, APIs, complex integrations",
    summary: { mission: "Provide stable APIs for third-party and internal integration.", why: "EDI, clearinghouses, EHR, Sandata each require specialist knowledge.", value: "Stream teams consume integration as a service, not a project." },
    owns: ["ESB / iPaaS", "Clearinghouse adapters", "EHR connectors", "API gateway"], roles: [{ role: "Integration Engineers", count: 5 }], size: "5 people",
    kpis: [{ name: "Integration SLA", current: "97%", target: "99.9%", forecast: "+2.9pt" }],
    hhax: ["Sandata integration", "EDI/clearinghouse", "EHR integration"], related: ["claims","provider","caregiver","member"],
    artifacts: ["Integration Catalog", "API Specs"], journey: { current: "Point-to-point", target: "API-first with reuse", milestones: ["Catalog v1", "Top-10 reused"], timeline: "18 months" }
  },
  { id: "identity-fed", kind: "subsystem", name: "Identity & Access Platform Team", tone: "rose", icon: ShieldCheck,
    tagline: "Identity federation across acquisitions",
    summary: { mission: "Federate identity across Client + acquired tenants.", why: "Each tenant brought its own IdP; users and providers need one identity.", value: "Single sign-on, simpler audits, faster onboarding." },
    owns: ["Identity federation", "SSO platform", "Directory sync"], roles: [{ role: "IAM Engineers", count: 4 }], size: "4 people",
    kpis: [{ name: "Federated Apps", current: "12", target: "> 60", forecast: "5×" }],
    hhax: ["Federate Sandata, Pavilio, HHA"], related: ["sec-plat","provider","member"],
    artifacts: ["Federation Architecture"], journey: { current: "Per-tenant IdP", target: "Federated SSO", milestones: ["Federation v1"], timeline: "12 months" }
  },
  { id: "policy-eng", kind: "subsystem", name: "Policy Engine Team", tone: "violet", icon: FileText,
    tagline: "Business rules & policy engine",
    summary: { mission: "Own complex business rules and policy engine consumed by claims and eligibility.", why: "Rules are intricate and change often; embedding them in streams overloads them.", value: "Faster rule changes, fewer regressions." },
    owns: ["Rules engine", "Policy catalog", "Rule testing framework"], roles: [{ role: "Specialists", count: 3 }], size: "3 people",
    kpis: [{ name: "Rule Change Cycle", current: "4 wks", target: "< 1 wk", forecast: "-75%" }],
    hhax: ["Claims policy", "Eligibility rules"], related: ["claims","member"],
    artifacts: ["Policy Catalog", "Rule Test Suite"], journey: { current: "Code-buried rules", target: "Externalized engine", milestones: ["Externalize Tier-1 rules"], timeline: "15 months" }
  },
  { id: "third-party", kind: "subsystem", name: "Third-Party Interfaces Team", tone: "slate", icon: Layers,
    tagline: "Critical third-party integrations",
    summary: { mission: "Manage critical third-party integrations with SLAs.", why: "Third-party APIs change; absorbing volatility centrally protects streams.", value: "Predictable consumer experience even as vendors change." },
    owns: ["Vendor adapters", "Contract testing", "Vendor SLO tracking"], roles: [{ role: "Engineers", count: 3 }], size: "3 people",
    kpis: [{ name: "Vendor Outage Customer Impact", current: "Medium", target: "Low", forecast: "↓" }],
    hhax: ["Pavilio external partners", "Self-Direction partners"], related: ["claims","provider"],
    artifacts: ["Vendor SLA Tracker"], journey: { current: "Direct calls", target: "Abstracted adapters", milestones: ["Top-5 adapters"], timeline: "12 months" }
  },
];

const ALL_ENTITIES = [...EXECS, ...STREAMS, ...PLATFORMS, ...ENABLERS, ...SUBSYSTEMS];
const ENTITY_BY_ID: Record<string, Entity> = Object.fromEntries(ALL_ENTITIES.map((e) => [e.id, e]));

/* ===================== Business Outcomes ===================== */
const OUTCOMES = [
  { name: "Deployment Frequency", value: "5×",      label: "Increase",     why: "Smaller, safer changes more often.", how: "Deploys / service / week.", owner: "Stream teams + Devex Platform", contributing: ["caregiver","claims","devx-plat"] },
  { name: "Lead Time for Change", value: "-60%",    label: "Reduction",    why: "Faster idea-to-value, faster learning.", how: "Commit-to-prod (p95).", owner: "Stream teams + Devex Platform", contributing: ["caregiver","provider","devx-plat"] },
  { name: "Change Failure Rate", value: "-70%",     label: "Reduction",    why: "Quality designed in, not bolted on.", how: "% changes causing incident.", owner: "Stream teams + SRE Enablement", contributing: ["claims","sre-en","reliability-plat"] },
  { name: "MTTR",                value: "-50%",     label: "Reduction",    why: "Operational mastery from ownership.", how: "Detect → recover time.", owner: "Stream teams + Reliability Platform", contributing: ["reliability-plat","caregiver","claims"] },
  { name: "Developer Productivity", value: "+40%",  label: "Improvement",  why: "Less toil, more flow.", how: "SPACE / DX metrics.", owner: "Devex Platform + Enabling teams", contributing: ["devx-plat","auto-en"] },
  { name: "System Reliability",  value: "99.95%",   label: "Availability", why: "SLO discipline + ownership.", how: "User-journey SLO attainment.", owner: "VP Reliability Engineering", contributing: ["vp-rel","reliability-plat"] },
  { name: "Cost of Change",      value: "-25%",     label: "Reduction",    why: "Reduced rework, platform leverage.", how: "Cost per delivered change.", owner: "VP Platform + FinOps", contributing: ["finops-en","cloud-plat"] },
  { name: "Employee Satisfaction", value: "+30%",   label: "Improvement",  why: "Clarity, ownership, autonomy.", how: "Quarterly survey.", owner: "All leaders", contributing: ["vp-product","vp-rel","vp-plat"] },
];

/* ===================== UI ===================== */
function HeaderIndicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function EntityCard({
  e, hovered, related, onOpen, onHover, size = "md",
}: {
  e: Entity;
  hovered: string | null;
  related: Set<string>;
  onOpen: (id: string) => void;
  onHover: (id: string | null) => void;
  size?: "sm" | "md" | "lg";
}) {
  const t = TONE[e.tone];
  const Icon = e.icon;
  const dim = hovered && hovered !== e.id && !related.has(e.id);
  const highlight = hovered && related.has(e.id);
  return (
    <button
      onClick={() => onOpen(e.id)}
      onMouseEnter={() => onHover(e.id)}
      onMouseLeave={() => onHover(null)}
      className={[
        "group text-left rounded-2xl border bg-white transition-all w-full",
        "border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5",
        hovered === e.id ? `ring-2 ${t.ring}` : "",
        highlight ? `ring-2 ${t.ring}` : "",
        dim ? "opacity-40" : "",
        size === "lg" ? "p-5" : size === "sm" ? "p-3" : "p-4",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className={`inline-flex items-center justify-center rounded-xl ${t.bg} ${t.text} shrink-0 ${size === "sm" ? "w-8 h-8" : "w-10 h-10"}`}>
          <Icon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </div>
        <div className="min-w-0">
          <div className={`font-semibold text-slate-900 ${size === "sm" ? "text-xs" : "text-sm"}`}>{e.name}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">{e.tagline}</div>
        </div>
      </div>
      {size === "lg" && (
        <>
          <div className="mt-3 text-xs text-slate-700 line-clamp-2">{e.summary.mission}</div>
          {e.owns && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Owns</div>
              <ul className="space-y-0.5">
                {e.owns.slice(0, 5).map((o) => (
                  <li key={o} className="text-[11px] text-slate-700 flex items-start gap-1">
                    <span className={`mt-1 w-1 h-1 rounded-full ${t.dot}`} /> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {e.roles && (
            <div className="mt-3 flex flex-wrap gap-1">
              {e.roles.slice(0, 5).map((r) => (
                <span key={r.role} className={`text-[10px] px-1.5 py-0.5 rounded ${t.chip}`}>
                  {abbreviate(r.role)} {r.count}
                </span>
              ))}
            </div>
          )}
        </>
      )}
      {size === "md" && e.owns && (
        <div className="mt-3">
          <ul className="space-y-0.5">
            {e.owns.slice(0, 5).map((o) => (
              <li key={o} className="text-[11px] text-slate-700 flex items-start gap-1">
                <span className={`mt-1 w-1 h-1 rounded-full ${t.dot}`} /> {o}
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}

function abbreviate(role: string) {
  const map: Record<string, string> = {
    "Product Owner": "PO", "Tech Lead": "TL", "Developers": "DEV", "QA": "QA",
    "SRE": "SRE", "Data Engineers": "DATA", "Analysts": "AN", "Platform Engineers": "PE",
    "Platform PM": "PM", "Network Engineers": "NET", "FinOps": "FIN", "Security Engineers": "SEC",
    "Compliance Engineer": "CMP", "Governance Lead": "GOV", "DX Engineer": "DX", "Tech Writer": "DOC",
    "CTO": "CTO", "Chief of Staff": "CoS", "Principal Architects": "PA",
    "SRE Coaches": "SRE", "Practice Lead": "LEAD", "Coaches": "COACH",
    "Cloud Architects": "ARCH", "Automation Engineers": "AUTO", "FinOps Coaches": "FIN",
    "Senior DBAs": "DBA", "Integration Engineers": "INT", "IAM Engineers": "IAM",
    "Specialists": "SPEC", "Engineers": "ENG",
  };
  return map[role] || role;
}

/* ===================== Drawer ===================== */
function EntityDrawer({ id, onClose, onOpen }: { id: string | null; onClose: () => void; onOpen: (id: string) => void }) {
  const e = id ? ENTITY_BY_ID[id] : null;
  if (!e) return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[40vw] sm:w-[40vw] p-0" />
    </Sheet>
  );
  const t = TONE[e.tone];
  const Icon = e.icon;
  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[42vw] sm:w-[42vw] p-0 overflow-hidden flex flex-col">
        <SheetHeader className={`px-6 py-5 border-b ${t.border} ${t.soft}`}>
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl ${t.bg} ${t.text} inline-flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {e.kind === "exec" ? "Executive Leadership"
                  : e.kind === "stream" ? "Stream-Aligned Team"
                  : e.kind === "platform" ? "Platform Team"
                  : e.kind === "enabling" ? "Enabling Team"
                  : "Complicated Subsystem Team"}
              </div>
              <SheetTitle className="text-lg text-slate-900">{e.name}</SheetTitle>
              <div className="text-xs text-slate-600 mt-1">{e.summary.mission}</div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-white px-4 h-auto py-0 overflow-x-auto flex-wrap">
              {[
                ["summary","Summary"], ["resp","Responsibilities"], ["apps","Applications"],
                ["team","Composition"], ["kpis","KPIs"], ["deps","Dependencies"],
                ["hhax","Client"], ["flow","Workflows"], ["artifacts","Artifacts"], ["journey","Journey"],
              ].map(([v,l]) => (
                <TabsTrigger key={v} value={v} className="text-[11px] data-[state=active]:bg-slate-100">{l}</TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6 space-y-5">
              <TabsContent value="summary" className="space-y-3 m-0">
                <Section title="Mission">{e.summary.mission}</Section>
                <Section title="Why it exists">{e.summary.why}</Section>
                <Section title="Business value">{e.summary.value}</Section>
              </TabsContent>

              <TabsContent value="resp" className="space-y-3 m-0">
                <BulletBlock title="Owns" items={e.owns ?? []} tone="emerald" />
                <BulletBlock title="Does not own" items={e.doesNotOwn ?? []} tone="rose" />
              </TabsContent>

              <TabsContent value="apps" className="m-0">
                <div className="grid grid-cols-2 gap-2">
                  {(e.applications ?? []).map((a) => (
                    <div key={a} className="rounded-lg border border-slate-200 p-2.5 bg-white text-xs text-slate-800 flex items-center gap-2">
                      <Boxes className="w-3.5 h-3.5 text-slate-500" /> {a}
                    </div>
                  ))}
                  {!e.applications?.length && <div className="text-xs text-slate-500">No direct applications.</div>}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-3 m-0">
                <div className="grid grid-cols-3 gap-2">
                  {(e.roles ?? []).map((r) => (
                    <div key={r.role} className={`rounded-lg border ${t.border} ${t.soft} p-3`}>
                      <div className={`text-[10px] uppercase tracking-wider ${t.text}`}>{abbreviate(r.role)}</div>
                      <div className="text-lg font-semibold text-slate-900">{r.count}</div>
                      <div className="text-[11px] text-slate-600">{r.role}</div>
                    </div>
                  ))}
                </div>
                {e.size && <Section title="Recommended size">{e.size}</Section>}
              </TabsContent>

              <TabsContent value="kpis" className="m-0">
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
                      {(e.kpis ?? []).map((k) => (
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
              </TabsContent>

              <TabsContent value="deps" className="space-y-2 m-0">
                {(e.dependencies ?? []).map((d) => (
                  <div key={d.team} className="rounded-lg border border-slate-200 p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{d.team}</div>
                      <div className="text-xs text-slate-600">{d.nature}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
                {!e.dependencies?.length && <div className="text-xs text-slate-500">No tracked dependencies.</div>}
              </TabsContent>

              <TabsContent value="hhax" className="space-y-2 m-0">
                {(e.hhax ?? []).map((h) => (
                  <div key={h} className="text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" /> {h}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="flow" className="m-0">
                <div className="space-y-2">
                  {(e.workflow ?? []).map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${t.bg} ${t.text} text-[10px] font-semibold inline-flex items-center justify-center`}>{i+1}</div>
                      <div className="text-xs text-slate-800">{step}</div>
                    </div>
                  ))}
                  {!e.workflow?.length && <div className="text-xs text-slate-500">No workflow defined.</div>}
                </div>
              </TabsContent>

              <TabsContent value="artifacts" className="m-0">
                <div className="grid grid-cols-2 gap-2">
                  {(e.artifacts ?? []).map((a) => (
                    <div key={a} className="rounded-lg border border-slate-200 p-2.5 bg-white text-xs text-slate-800 flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5 text-slate-500" /> {a}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="journey" className="space-y-3 m-0">
                {e.journey ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                        <div className="text-[10px] uppercase tracking-wider text-rose-700">Current</div>
                        <div className="text-xs text-slate-800 mt-1">{e.journey.current}</div>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-700">Target</div>
                        <div className="text-xs text-slate-800 mt-1">{e.journey.target}</div>
                      </div>
                    </div>
                    <Section title="Milestones">
                      <ul className="space-y-1 mt-1">
                        {e.journey.milestones.map((m) => (
                          <li key={m} className="text-xs text-slate-800 flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-600" /> {m}
                          </li>
                        ))}
                      </ul>
                    </Section>
                    <Section title="Expected timeline">{e.journey.timeline}</Section>
                  </>
                ) : (
                  <div className="text-xs text-slate-500">No journey defined.</div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {!!e.related?.length && (
          <div className="border-t border-slate-200 p-4 bg-slate-50/60">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Connected teams</div>
            <div className="flex flex-wrap gap-1.5">
              {e.related.map((rid) => {
                const r = ENTITY_BY_ID[rid];
                if (!r) return null;
                const rt = TONE[r.tone];
                return (
                  <button key={rid} onClick={() => onOpen(rid)} className={`text-[11px] px-2 py-1 rounded-full border ${rt.border} ${rt.soft} ${rt.text} hover:shadow-sm`}>
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
  if (!items.length) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{title}</div>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i} className="text-xs text-slate-800 flex items-start gap-2">
            <span className={`mt-1.5 w-1 h-1 rounded-full ${t.dot}`} /> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ===================== Outcome Drawer ===================== */
function OutcomeDrawer({ outcome, onClose, onOpen }: { outcome: typeof OUTCOMES[number] | null; onClose: () => void; onOpen: (id: string) => void }) {
  return (
    <Sheet open={!!outcome} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[40vw] sm:w-[40vw] p-0 overflow-hidden flex flex-col">
        {outcome && (
          <>
            <SheetHeader className="px-6 py-5 border-b bg-slate-50">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Business Outcome</div>
              <SheetTitle className="text-lg">{outcome.name}</SheetTitle>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{outcome.value} <span className="text-xs text-slate-500 font-normal">{outcome.label}</span></div>
            </SheetHeader>
            <div className="p-6 space-y-4 overflow-y-auto">
              <Section title="Why it matters">{outcome.why}</Section>
              <Section title="How it's measured">{outcome.how}</Section>
              <Section title="Who owns it">{outcome.owner}</Section>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Contributing teams</div>
                <div className="flex flex-wrap gap-1.5">
                  {outcome.contributing.map((id) => {
                    const r = ENTITY_BY_ID[id];
                    if (!r) return null;
                    const t = TONE[r.tone];
                    return (
                      <button key={id} onClick={() => onOpen(id)} className={`text-[11px] px-2 py-1 rounded-full border ${t.border} ${t.soft} ${t.text} hover:shadow-sm`}>
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ===================== Page ===================== */
export default function FutureStateReliabilityOrg() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openOutcome, setOpenOutcome] = useState<typeof OUTCOMES[number] | null>(null);

  const related = useMemo(() => {
    if (!hovered) return new Set<string>();
    const e = ENTITY_BY_ID[hovered];
    return new Set<string>(e?.related ?? []);
  }, [hovered]);

  const traditional = ["Applications Team", "Infrastructure Team", "Database Team", "Security Team", "Operations Team"];
  const future = ["Value Stream Teams", "Platform Teams", "Enabling Teams", "Subsystem Teams"];

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Top bar */}
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between">
            <Link to="/reliability-foundations/team-topologies" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-3.5 h-3.5" /> Team Topologies
            </Link>
            <div className="flex items-center gap-2">
              <HeaderIndicator label="Value Stream" value="Aligned" />
              <HeaderIndicator label="Platform" value="Enabled" />
              <HeaderIndicator label="Ownership" value="Clear" />
              <HeaderIndicator label="Handoffs" value="Reduced" />
              <HeaderIndicator label="Reliability" value="Built-In" />
            </div>
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto px-6 py-8 space-y-10">
          {/* HERO */}
          <section>
            <Badge variant="secondary" className="bg-sky-100 text-sky-800 mb-3">Future-State Reliability Engineering Structure</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Future-State Reliability Engineering Organization</h1>
            <p className="mt-2 text-base text-slate-700">Organized around value streams, platform services, and reliability engineering.</p>
            <p className="mt-3 text-sm text-slate-600 max-w-4xl leading-relaxed">
              This operating model enables end-to-end ownership, reduces cognitive load, and accelerates delivery of reliable,
              secure, and scalable products and services. Every team has a named owner, a clear interaction mode, and measurable outcomes.
            </p>
          </section>

          {/* LAYER 1 — EXECUTIVE LEADERSHIP */}
          <section>
            <LayerHeader index="Layer 1" title="Executive Leadership" subtitle="Strategic accountability — not reporting hierarchy." />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {EXECS.map((e) => (
                <EntityCard key={e.id} e={e} hovered={hovered} related={related} onOpen={setOpenId} onHover={setHovered} size="sm" />
              ))}
            </div>
          </section>

          {/* LAYER 2 — STREAM ALIGNED */}
          <section>
            <LayerHeader index="Layer 2" title="Stream-Aligned Teams" subtitle="Own end-to-end customer outcomes." accent="sky" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {STREAMS.map((e) => (
                <EntityCard key={e.id} e={e} hovered={hovered} related={related} onOpen={setOpenId} onHover={setHovered} size="lg" />
              ))}
            </div>
          </section>

          {/* LAYER 3 — PLATFORMS */}
          <section>
            <LayerHeader index="Layer 3" title="Platform Teams" subtitle="Build reusable capabilities & self-service." accent="emerald" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {PLATFORMS.map((e) => (
                <EntityCard key={e.id} e={e} hovered={hovered} related={related} onOpen={setOpenId} onHover={setHovered} size="md" />
              ))}
            </div>
          </section>

          {/* LAYER 4 — ENABLING */}
          <section>
            <LayerHeader index="Layer 4" title="Enabling Teams" subtitle="Temporary expert accelerators." accent="violet" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {ENABLERS.map((e) => (
                <EntityCard key={e.id} e={e} hovered={hovered} related={related} onOpen={setOpenId} onHover={setHovered} size="sm" />
              ))}
            </div>
          </section>

          {/* LAYER 5 — COMPLICATED SUBSYSTEMS */}
          <section>
            <LayerHeader index="Layer 5" title="Complicated Subsystem Teams" subtitle="Deep expertise — protect stream teams from intrinsic complexity." accent="amber" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {SUBSYSTEMS.map((e) => (
                <EntityCard key={e.id} e={e} hovered={hovered} related={related} onOpen={setOpenId} onHover={setHovered} size="sm" />
              ))}
            </div>
          </section>

          {/* TRANSFORMATION VIEW */}
          <section>
            <LayerHeader index="Transformation" title="From Traditional IT to Team Topologies" subtitle="How today's silos become tomorrow's value-stream organization." />
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-rose-700 mb-2">Traditional Organization (Today)</div>
                  <div className="grid grid-cols-5 gap-2">
                    {traditional.map((t) => (
                      <div key={t} className="text-[11px] font-medium text-slate-800 bg-white rounded-lg border border-rose-200 p-2 text-center">{t}</div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Siloed","Handoffs","Ticket Driven","High Cognitive Load","Unclear Ownership","Slow Flow"].map((p) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" />{p}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-8 h-8 text-slate-400" />
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-2">Team Topologies Model (Future State)</div>
                  <div className="grid grid-cols-4 gap-2">
                    {future.map((t) => (
                      <div key={t} className="text-[11px] font-medium text-slate-800 bg-white rounded-lg border border-emerald-200 p-2 text-center">{t}</div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["End-to-End Ownership","Collaboration","Platform Enablement","Managed Cognitive Load","Fast Flow"].map((p) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />{p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BUSINESS OUTCOMES */}
          <section>
            <LayerHeader index="Outcomes" title="Business Outcomes Enabled" subtitle="Targets achievable when the full operating model is in place." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OUTCOMES.map((o) => (
                <button
                  key={o.name}
                  onClick={() => setOpenOutcome(o)}
                  className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wider">
                    <BarChart3 className="w-3.5 h-3.5" /> {o.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{o.name}</div>
                  <div className="mt-2 text-2xl font-bold text-emerald-700">{o.value}</div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">{o.why}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Client THEMES */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50/40 to-white p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 inline-flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">How This Operating Model Addresses Client Realities</h3>
                <p className="text-sm text-slate-700 mt-1 max-w-4xl">
                  The structure above is shaped by Client's specific situation: multiple acquired platforms, AWS and GCP cloud estates,
                  a Virginia data center transition, Sandata integration, the Pavilio growth platform, and the self-direction platform —
                  all needing standardization, service ownership, and reliability engineering.
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Move from ITIL to SRE","Reduce ticket-driven work","Improve service ownership",
                    "Build platform engineering capability","Standardize infrastructure","Accelerate modernization",
                    "Reduce operational interruptions","Enable cloud transformation","Improve acquisition integration",
                    "Increase automation","Improve caregiver experience","Improve claims & payroll reliability",
                    "Create reusable shared services","Scale through acquisition and growth",
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
            <Link to="/reliability-foundations/team-topologies" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back to Team Topologies
            </Link>
            <Link to="/reliability-foundations" className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800">
              Enterprise Operating Shifts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <EntityDrawer id={openId} onClose={() => setOpenId(null)} onOpen={setOpenId} />
      <OutcomeDrawer outcome={openOutcome} onClose={() => setOpenOutcome(null)} onOpen={(id) => { setOpenOutcome(null); setOpenId(id); }} />
    </AppShell>
  );
}

function LayerHeader({ index, title, subtitle, accent }: { index: string; title: string; subtitle: string; accent?: Tone }) {
  const t = accent ? TONE[accent] : null;
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500">{index}</div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          {t && <span className={`inline-block w-2 h-2 rounded-full ${t.dot}`} />}
          {title}
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
