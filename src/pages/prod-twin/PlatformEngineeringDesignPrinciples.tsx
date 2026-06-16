import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, X, Rocket, Brain, Shield, Lock, Gift, ShieldCheck,
  Route, Layers, Eye, TrendingUp, Cloud, GitBranch, Code2, Key, Database, Activity,
  Boxes, DollarSign, Workflow, Monitor, BookOpen, ListChecks, ClipboardList,
  Users, Wrench, Bot, Smartphone, CheckCircle2, XCircle, Gauge, Timer, Target,
  Sparkles, Building2, FileText, ChevronRight, Hexagon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types & data
// ─────────────────────────────────────────────────────────────────────────────
type Entry = {
  id: string;
  kind: "kpi" | "principle" | "service" | "step" | "role" | "outcome" | "exists" | "compare" | "definition";
  name: string;
  subtitle?: string;
  icon: any;
  accent: string;
  bg: string;
  overview?: string;
  purpose?: string[];
  why?: string;
  history?: string;
  misconceptions?: string[];
  industry?: string[];
  owns?: string[];
  influences?: string[];
  notOwn?: string[];
  decisions?: string[];
  operating?: string[];
  components?: string[];
  capabilities?: string[];
  tools?: string[];
  artifacts?: string[];
  dependencies?: string[];
  consumers?: string[];
  providers?: string[];
  technical?: string[];
  operational?: string[];
  business?: string[];
  leadership?: string[];
  experience?: string[];
  certifications?: string[];
  serves?: string[];
  dependsOn?: string[];
  workflows?: string[];
  teamInteractions?: string[];
  sreInteractions?: string;
  securityInteractions?: string;
  archInteractions?: string;
  primaryKpis?: { name: string; how: string; target: string; benchmark: string; why: string }[];
  secondaryKpis?: string[];
  hhax?: string[];
  currentState?: string;
  targetState?: string;
  prerequisites?: string[];
  quickWins?: string[];
  ninetyDay?: string[];
  twelveMonth?: string[];
  pitfalls?: string[];
  exampleArtifacts?: string[];
  // KPI-specific
  kpiValue?: string;
  kpiDefinition?: string;
  kpiHow?: string;
  kpiBenchmark?: string;
  // outcome
  outcomeImpact?: string;
};

const KPIS: Entry[] = [
  { id: "k1", kind: "kpi", name: "Provisioning Time", kpiValue: "< 30 min", icon: Timer, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Time from a developer request to a usable environment, account, or service on the platform.",
    kpiDefinition: "Median wall-clock time between submitting a standard provisioning request and the resource being ready to use.",
    kpiHow: "Tracked through the developer portal and self-service workflow engine; instrumented per request type (account, environment, database, namespace).",
    kpiBenchmark: "Mature platform teams: < 30 minutes for standard requests, < 1 day for landing zones. Traditional infra: days to weeks.",
    why: "Provisioning latency is the single biggest source of friction for delivery teams; reducing it unlocks daily delivery."
  },
  { id: "k2", kind: "kpi", name: "Golden Path Adoption", kpiValue: "78%", icon: Route, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Share of new workloads built on recommended golden-path templates rather than bespoke patterns.",
    kpiDefinition: "% of new services launched in the last 90 days that use sanctioned reference templates and patterns.",
    kpiHow: "Tracked via service catalog tagging, template usage in CI/CD, and Terraform module adoption.",
    kpiBenchmark: "Maturing platforms: 60–80%. Mature platforms: > 85%.",
    why: "Standardization drives reliability, security, and cost predictability — it's the leading indicator of platform value."
  },
  { id: "k3", kind: "kpi", name: "Developer Satisfaction", kpiValue: "4.4 / 5", icon: Users, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "Composite satisfaction score from internal developers on the platform experience.",
    kpiDefinition: "Average of quarterly DevEx survey responses across speed, clarity, support, and reliability dimensions.",
    kpiHow: "Quarterly survey with structured questions + free-text feedback; tracked as a product NPS-style metric.",
    kpiBenchmark: "Healthy platforms: ≥ 4.0 / 5 with rising trend over 3 quarters.",
    why: "If engineers don't choose the platform, they go around it — adoption and trust depend on experience."
  },
  { id: "k4", kind: "kpi", name: "Automation Coverage", kpiValue: "72%", icon: Bot, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Share of repeatable operational tasks that are automated rather than executed manually.",
    kpiDefinition: "% of catalogued runbook tasks executed by automation in the last 30 days.",
    kpiHow: "Inventory of operational tasks in the runbook library, with automation tags and execution telemetry.",
    kpiBenchmark: "Maturing: 50–70%. Mature: > 80%. Anything below 40% indicates ticket-driven operations.",
    why: "Automation coverage is a direct proxy for toil reduction and a leading indicator of operational resilience."
  },
];

const DEFINITION: Entry = {
  id: "def", kind: "definition", name: "Definition", icon: BookOpen, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
  overview: "Platform engineering is the discipline of creating and operating reusable internal capabilities — cloud foundations, developer workflows, security guardrails, observability, and self-service tooling — so that product teams can deliver software faster, more reliably, and with less operational friction.",
  purpose: ["Reduce cognitive load on product teams", "Increase delivery speed", "Improve reliability", "Increase standardization", "Reduce duplicated effort", "Improve security and compliance"],
  why: "Modern engineering organizations cannot scale by giving every team its own infrastructure, security, and operations practice. A platform team productizes the common substrate so product teams can focus on customer value.",
  history: "Platform engineering emerged in the late 2010s as the practical evolution of DevOps. As SRE matured at Google and cloud-native systems became the default, organizations realized that 'you build it, you run it' only works if there is a strong, opinionated internal platform to run it on.",
  misconceptions: ["It's just infrastructure with a new name", "It's only for very large companies", "It replaces product engineering", "It's a one-time project, not a continuous product"],
  industry: ["Spotify Backstage", "Netflix Paved Road", "Google internal platforms", "Atlassian Compass", "Mercedes-Benz internal IDP"],
};

const EXISTS: Entry[] = [
  { id: "ex1", kind: "exists", name: "Faster Delivery", subtitle: "Ship features quickly and confidently", icon: Rocket, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Self-service provisioning, golden-path templates, and automated pipelines eliminate the waiting that fragments engineering work.",
    purpose: ["Reduce wait time between commit and production", "Eliminate cross-team dependencies for routine work", "Enable safe daily deployments"],
    primaryKpis: [{ name: "Lead time for changes", how: "Commit → production timestamp", target: "< 2 days", benchmark: "Elite: < 1 hour", why: "Direct measure of delivery flow." }] },
  { id: "ex2", kind: "exists", name: "Lower Cognitive Load", subtitle: "Simplify decisions and reduce complexity", icon: Brain, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Teams should make decisions about their product, not about kubernetes ingress, CIDR ranges, or IAM trust policies. The platform encapsulates that decision space.",
    purpose: ["Hide unnecessary complexity", "Allow teams to focus on business outcomes", "Make the right pattern the easy pattern"] },
  { id: "ex3", kind: "exists", name: "Better Reliability", subtitle: "Reduce incidents and operational variance", icon: ShieldCheck, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "When every team uses the same proven patterns for deployments, observability, and recovery, the operational variance that causes incidents drops sharply.",
    purpose: ["Reduce operational variance across teams", "Standardize proven patterns", "Embed reliability defaults at the platform layer"] },
  { id: "ex4", kind: "exists", name: "Safer Standardization", subtitle: "Enforce controls while enabling speed", icon: Lock, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Security and compliance controls live inside the golden paths — engineers get safe defaults without writing tickets.",
    purpose: ["Enforce controls through the platform itself", "Replace policy documents with policy-as-code", "Make audit evidence a byproduct of normal delivery"] },
];

const PRINCIPLES: Entry[] = [
  { id: "p1", kind: "principle", name: "Platform as a Product", subtitle: "Treat the platform like a customer-facing product",
    icon: Gift, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Platform teams treat internal services like products. The customers are engineers. Adoption, satisfaction, and value are measured continuously.",
    purpose: ["Own a roadmap and prioritize backlog", "Measure adoption and satisfaction", "Invest in usability and documentation", "Run feedback loops with engineering teams"],
    primaryKpis: [
      { name: "Platform adoption", how: "% workloads using golden paths", target: "≥ 85%", benchmark: "Mature: > 85%", why: "Adoption is the truest measure of value." },
      { name: "Developer NPS", how: "Quarterly survey", target: "≥ +30", benchmark: "Strong: > +40", why: "Engineers are the customer." },
      { name: "Provisioning time", how: "Request → ready", target: "< 30 min", benchmark: "Mature: < 30 min", why: "Friction signal." },
      { name: "Support volume", how: "Tickets per active user", target: "Trending down", benchmark: "Lower with rising adoption is healthy.", why: "Indicates clarity and self-service maturity." },
    ],
    hhax: ["Supports GitHub standardization, cloud standardization, onboarding acquired platforms, and reducing dependency on individual experts."],
    pitfalls: ["Treating the platform as a side-project of infra", "No PM, no roadmap, no adoption data", "Building features no team asked for"] },
  { id: "p2", kind: "principle", name: "Self-Service with Guardrails", subtitle: "Enable teams to provision and use capabilities on demand",
    icon: ShieldCheck, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Engineers provision and consume capabilities themselves through paved workflows. Controls are enforced at the platform layer, not by a ticket queue.",
    purpose: ["No ticket queues for standard requests", "Policy-as-code embedded in the workflow", "Auditable, repeatable, fast"],
    primaryKpis: [
      { name: "Time to provision", how: "Request → ready", target: "< 30 min", benchmark: "Mature: < 30 min", why: "Flow." },
      { name: "Compliance pass rate", how: "% deploys passing automated policy", target: "> 98%", benchmark: "Mature: > 98%", why: "Guardrails working." },
      { name: "Manual tickets avoided", how: "Self-service requests / month", target: "Trending up", benchmark: "Replaces ticket-driven ops.", why: "Capacity reclaimed." },
    ] },
  { id: "p3", kind: "principle", name: "Golden Paths", subtitle: "Provide paved roads for common engineering workflows",
    icon: Route, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "A small number of opinionated, well-supported paths cover most use cases. Teams move fast on them and only deviate with explicit architectural agreement.",
    purpose: ["Reference architectures per workload type", "Secure defaults baked in", "Tested templates, not slide decks"],
    primaryKpis: [
      { name: "Golden path adoption", how: "% new services on a path", target: "≥ 85%", benchmark: "Mature: > 85%", why: "Standardization metric." },
      { name: "Release success", how: "% deploys without rollback", target: "> 95%", benchmark: "Elite: > 98%", why: "Path quality." },
      { name: "Exception rate", how: "% workloads off-path", target: "< 15%", benchmark: "Lower is better, but never zero.", why: "Exceptions are signals." },
    ] },
  { id: "p4", kind: "principle", name: "Reusable Shared Services", subtitle: "Centralize common capabilities so product teams don't reinvent",
    icon: Layers, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    overview: "Cloud foundations, identity, secrets, observability — each built once, consumed everywhere, with clear ownership and SLOs.",
    primaryKpis: [
      { name: "Reuse rate", how: "% workloads on shared services", target: "≥ 90%", benchmark: "Mature: > 90%", why: "Avoids duplication." },
      { name: "Duplicate tool reduction", how: "Distinct tools per capability", target: "1–2", benchmark: "Mature: consolidated.", why: "Operating cost." },
      { name: "Cost efficiency", how: "Unit cost trend per workload", target: "Trending down", benchmark: "Shared > bespoke.", why: "Scale benefit." },
    ] },
  { id: "p5", kind: "principle", name: "Reduce Cognitive Load", subtitle: "Hide unnecessary complexity so stream-aligned teams focus on outcomes",
    icon: Brain, accent: "border-teal-200 text-teal-700", bg: "bg-teal-50",
    overview: "The platform abstracts the substrate. Engineers learn the platform interface, not the underlying cloud, network, or runtime details.",
    purpose: ["Abstraction", "Documentation", "Simple interfaces", "Clear support model"],
    primaryKpis: [
      { name: "Developer satisfaction", how: "DevEx survey", target: "≥ 4.3 / 5", benchmark: "Healthy: > 4.0", why: "Experience proxy." },
      { name: "Onboarding time", how: "Days to first prod deploy", target: "< 5 days", benchmark: "Mature: < 5 days", why: "Productivity ramp." },
      { name: "Support volume", how: "Tickets per active user", target: "Trending down", benchmark: "Lower = clearer.", why: "Clarity signal." },
    ] },
  { id: "p6", kind: "principle", name: "Continuous Improvement", subtitle: "Measure adoption, friction, and outcomes — then improve the platform",
    icon: TrendingUp, accent: "border-orange-200 text-orange-700", bg: "bg-orange-50",
    overview: "Treat the platform as a living product. Telemetry, feedback, and backlog management are continuous, not annual.",
    primaryKpis: [
      { name: "Platform adoption", how: "% workloads", target: "≥ 85%", benchmark: "Mature: > 85%", why: "North-star." },
      { name: "Backlog burn", how: "Story points completed / month", target: "On plan", benchmark: "Predictable throughput.", why: "Delivery muscle." },
      { name: "Satisfaction trend", how: "Quarterly DevEx survey", target: "Rising 3 quarters", benchmark: "Trend > absolute.", why: "Improvement velocity." },
    ] },
];

const SERVICES: Entry[] = [
  { id: "s-cloud", kind: "service", name: "Cloud Foundations", subtitle: "Landing zones, accounts, networking, guardrails", icon: Cloud, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Standardized, compliant AWS / GCP foundations: account vending, landing zones, networking patterns, IAM baselines, and policy-as-code guardrails.",
    capabilities: ["Account / project vending", "Landing zone templates", "Networking & connectivity", "IAM baselines", "Policy-as-code (SCPs / Org Policies)"],
    tools: ["AWS Organizations", "GCP Resource Manager", "Terraform", "Control Tower / Landing Zone"],
    consumers: ["All product teams", "Data & Analytics", "Acquired-platform onboarding"],
    primaryKpis: [{ name: "Cloud compliance", how: "% accounts compliant", target: "100%", benchmark: "Mature: 100%", why: "Posture." }, { name: "Provisioning time", how: "Account ready", target: "< 1 day", benchmark: "Mature: < 1h", why: "Flow." }],
    hhax: ["Foundational for onboarding acquired platforms onto standard AWS / GCP landing zones."] },
  { id: "s-ci", kind: "service", name: "CI/CD Templates", subtitle: "Pipelines, quality gates, release workflows", icon: GitBranch, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "Reusable, opinionated pipelines covering build, test, scan, sign, and deploy — with quality and security gates baked in.",
    capabilities: ["Reusable pipeline templates", "Quality gates", "Security scanning", "Artifact signing", "Progressive delivery"],
    tools: ["GitHub Actions", "Artifact registries", "Trivy / Snyk", "Argo / Spinnaker"],
    primaryKpis: [{ name: "Pipeline adoption", how: "% repos on templates", target: "≥ 90%", benchmark: "Mature: > 90%", why: "Reuse." }, { name: "Change failure rate", how: "% deploys causing incidents", target: "< 10%", benchmark: "Elite: < 5%", why: "Safety." }],
    hhax: ["Anchors GitHub standardization across teams and acquired platforms."] },
  { id: "s-iac", kind: "service", name: "Infrastructure as Code", subtitle: "Terraform, modules, versioned IaC", icon: Code2, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Versioned, tested, reusable infrastructure modules consumed via a module registry.",
    capabilities: ["Module registry", "Drift detection", "Policy testing", "Environment promotion"],
    tools: ["Terraform", "OpenTofu", "Terragrunt", "Atlantis"],
    primaryKpis: [{ name: "Module reuse", how: "% workloads on registry modules", target: "≥ 80%", benchmark: "Mature: > 80%", why: "Standardization." }] },
  { id: "s-id", kind: "service", name: "Identity & Secrets", subtitle: "SSO, RBAC, secrets management", icon: Key, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Centralized identity, role-based access, and secrets management — consumed via SDKs and admission controllers.",
    tools: ["Entra ID", "AWS IAM Identity Center", "Vault / Secrets Manager"],
    primaryKpis: [{ name: "Secrets sprawl", how: "Plaintext secret findings", target: "0", benchmark: "Mature: 0", why: "Risk." }] },
  { id: "s-data", kind: "service", name: "Data & Messaging Services", subtitle: "Databases, queues, streams, caches", icon: Database, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Managed databases, message brokers, streaming, and caches available as on-demand platform services with SLOs.",
    tools: ["Postgres", "SQL Server", "Kafka", "Redis", "SNS / SQS"],
    primaryKpis: [{ name: "Data platform availability", how: "Composite uptime", target: "> 99.95%", benchmark: "Tier-1.", why: "Foundation." }] },
  { id: "s-obs", kind: "service", name: "Observability", subtitle: "Logs, metrics, traces, alerts, SLOs", icon: Activity, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "Telemetry platform with consistent instrumentation patterns, dashboards, SLO monitoring, and alert quality discipline.",
    capabilities: ["APM", "SLO monitoring", "Synthetic monitoring", "Dashboards", "Alerting"],
    tools: ["Datadog", "OpenTelemetry"],
    primaryKpis: [{ name: "Monitoring coverage", how: "% Tier-1 with golden signals", target: "100%", benchmark: "Mature: 100%", why: "Baseline." }, { name: "Actionable alert rate", how: "% alerts leading to action", target: "> 90%", benchmark: "Healthy: > 90%", why: "Reduces fatigue." }, { name: "MTTD / MTTR", how: "Detect & recover time", target: "MTTD < 5m / MTTR < 30m", benchmark: "Mature.", why: "Customer impact." }],
    hhax: ["Supports the move away from reactive operations toward prevention and service ownership."] },
  { id: "s-sec", kind: "service", name: "Security Guardrails", subtitle: "Policies, scanning, compliance controls", icon: Shield, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    overview: "Policy-as-code, vulnerability scanning, and compliance evidence collection embedded in the platform.",
    tools: ["OPA / Conftest", "Trivy / Snyk", "Cloud-native posture tools"],
    primaryKpis: [{ name: "Critical vuln SLA", how: "% remediated < 7d", target: "100%", benchmark: "Mature: 100%", why: "Risk." }] },
  { id: "s-runtime", kind: "service", name: "Runtime / Kubernetes", subtitle: "Clusters, runtimes, serverless, autoscaling", icon: Boxes, accent: "border-teal-200 text-teal-700", bg: "bg-teal-50",
    overview: "Managed compute substrate — Kubernetes platforms, serverless runtimes, autoscaling, and node lifecycle.",
    tools: ["EKS / GKE", "Lambda / Cloud Run", "Karpenter"],
    primaryKpis: [{ name: "Cluster availability", how: "Control-plane uptime", target: "> 99.99%", benchmark: "Mature.", why: "Foundation." }] },
  { id: "s-cost", kind: "service", name: "Cost Visibility / FinOps", subtitle: "Budgets, tagging, chargeback, reports", icon: DollarSign, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Unit-economics visibility, tagging discipline, and rightsizing tooling for engineering teams.",
    tools: ["Cloud cost tools", "Tagging policy engine"],
    primaryKpis: [{ name: "Cost variance", how: "Actual vs plan", target: "± 5%", benchmark: "Discipline.", why: "Financial." }] },
  { id: "s-ss", kind: "service", name: "Self-Service Workflows", subtitle: "Approval workflows, APIs, automation", icon: Workflow, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Workflow engine that turns standard requests into automated, auditable flows — no tickets, no manual provisioning.",
    primaryKpis: [{ name: "Self-service completion", how: "% completed w/o human", target: "> 90%", benchmark: "Mature.", why: "Flow." }] },
  { id: "s-portal", kind: "service", name: "Developer Portal", subtitle: "Single entry point, search, status, support", icon: Monitor, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "One place engineers go to find services, docs, status, ownership, and support — typically built on Backstage or similar.",
    tools: ["Backstage", "Internal portal"],
    primaryKpis: [{ name: "Active users", how: "Weekly active engineers", target: "≥ 90% of eng", benchmark: "Mature.", why: "Adoption." }] },
  { id: "s-cat", kind: "service", name: "Service Catalog & Documentation", subtitle: "Catalog, docs, APIs, how-to guides", icon: BookOpen, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Authoritative inventory of services with ownership, lifecycle, dependencies, and how-to documentation.",
    primaryKpis: [{ name: "Catalog coverage", how: "% services registered", target: "100%", benchmark: "Mature.", why: "Visibility." }] },
];

const STEPS: Entry[] = [
  { id: "st1", kind: "step", name: "Product Teams Need Capabilities", subtitle: "Need secure cloud, CI/CD, observability — facing manual processes and long lead times", icon: Smartphone, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Product teams identify recurring needs (a secure AWS account, a CI/CD pipeline, an observability baseline) that today require manual setup, inconsistent results, and long lead times.",
    workflows: ["Submit ticket for new environment", "Wait for security review", "Recreate observability boilerplate per service", "Inconsistent results across teams"] },
  { id: "st2", kind: "step", name: "Platform Team Builds Reusable Services", subtitle: "Build landing zones, templates, golden paths, policy controls", icon: Layers, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "The platform team productizes the substrate: landing zones, pipeline templates, golden paths, and policy controls — designed for self-service consumption.",
    purpose: ["Treat substrate as a product", "Automate provisioning & guardrails", "Embed observability and security defaults"] },
  { id: "st3", kind: "step", name: "Teams Consume via Self-Service", subtitle: "Provision through portal / API, onboard with docs and standards", icon: Workflow, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "Engineers consume services through a portal or API in minutes — not weeks — following golden paths with built-in support.",
    workflows: ["Portal request → automated provisioning", "Golden-path scaffolding", "Self-service docs and chat support"] },
  { id: "st4", kind: "step", name: "Reliability, Security & Cost Improve at Scale", subtitle: "Faster releases, fewer manual tickets, better compliance, lower costs", icon: TrendingUp, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Once standardized, the operating substrate compounds: reliability rises, security posture improves, ticket volumes drop, and unit costs fall — without slowing delivery.",
    primaryKpis: [
      { name: "Deployment frequency", how: "Deploys / team / week", target: "Daily", benchmark: "Elite.", why: "Flow." },
      { name: "Change failure rate", how: "% deploys causing incidents", target: "< 10%", benchmark: "Elite: < 5%", why: "Safety." },
      { name: "Cost per workload", how: "Unit economics", target: "Trending down", benchmark: "Scale benefit.", why: "Efficiency." },
    ] },
];

const ROLES: Entry[] = [
  { id: "r1", kind: "role", name: "Platform Product Manager", subtitle: "Define the platform product strategy and value",
    icon: ClipboardList, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Owns the platform as a product: roadmap, adoption, stakeholder alignment, and outcomes.",
    owns: ["Platform roadmap and backlog priorities", "Adoption metrics and outcomes", "Stakeholder alignment across engineering"],
    technical: ["Platform product management", "Developer experience design", "Adoption analytics"],
    leadership: ["Stakeholder management", "Roadmap negotiation", "Outcome storytelling"],
    primaryKpis: [{ name: "Platform adoption", how: "% on golden paths", target: "≥ 85%", benchmark: "Mature.", why: "Value proxy." }] },
  { id: "r2", kind: "role", name: "Platform Engineer", subtitle: "Build and operate reusable platform capabilities",
    icon: Wrench, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Builds and operates the reusable services and templates that product teams consume.",
    owns: ["Reusable services & templates", "Automation & standardization", "Operate & monitor platform services"],
    technical: ["Backend / systems engineering", "API design", "Automation", "Cloud", "IaC"],
    primaryKpis: [{ name: "Service availability", how: "Platform service uptime", target: "> 99.95%", benchmark: "Mature.", why: "Foundation." }] },
  { id: "r3", kind: "role", name: "Cloud Engineer", subtitle: "Design secure, scalable cloud foundations",
    icon: Cloud, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "Designs and operates cloud foundations — landing zones, networking, IaC, cloud guardrails.",
    technical: ["AWS / GCP", "Networking", "IAM", "Terraform", "Cloud security"],
    primaryKpis: [{ name: "Cloud compliance", how: "% accounts compliant", target: "100%", benchmark: "Mature.", why: "Posture." }] },
  { id: "r4", kind: "role", name: "DevOps / CI-CD Engineer", subtitle: "Enable reliable delivery and deployments",
    icon: GitBranch, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    overview: "Builds and supports the delivery substrate — CI/CD pipelines, release automation, quality gates.",
    technical: ["GitHub Actions", "CI/CD design", "Release engineering", "Quality gates"],
    primaryKpis: [{ name: "Deployment frequency", how: "Deploys / week", target: "Daily / stream", benchmark: "Elite.", why: "Flow." }] },
  { id: "r5", kind: "role", name: "Developer Experience Engineer", subtitle: "Improve workflows and developer happiness",
    icon: Sparkles, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Owns the experience layer — portals, docs, onboarding, support patterns, and DevEx telemetry.",
    owns: ["Developer portal & docs", "Onboarding & training", "Feedback & support flows"],
    technical: ["Frontend", "Docs-as-code", "DX research", "Backstage"],
    primaryKpis: [{ name: "Developer satisfaction", how: "Quarterly survey", target: "≥ 4.3 / 5", benchmark: "Healthy.", why: "Experience." }, { name: "Onboarding time", how: "Days to first deploy", target: "< 5d", benchmark: "Mature.", why: "Ramp." }] },
];

const COMPARE = {
  is: [
    { id: "is1", text: "A product for internal engineers", detail: "Roadmap, adoption metrics, and a backlog driven by engineering customers." },
    { id: "is2", text: "Reusable capabilities and standards", detail: "Built once, consumed everywhere, with versioning and ownership." },
    { id: "is3", text: "Self-service with governance", detail: "Engineers provision themselves through paved workflows with policy-as-code." },
    { id: "is4", text: "A way to reduce toil and inconsistency", detail: "Codifies the right path so it's also the easy path." },
    { id: "is5", text: "A force multiplier for product teams", detail: "One platform team enables many product teams to move faster, safely." },
  ],
  isNot: [
    { id: "n1", text: "Just another infrastructure team", detail: "Infrastructure teams take tickets and deliver resources. Platform teams build products that engineers consume directly." },
    { id: "n2", text: "Only a ticket queue", detail: "If every standard request is a ticket, you don't have a platform — you have shared services with a backlog." },
    { id: "n3", text: "A rebranding of manual operations", detail: "Renaming an ops team to 'platform team' without changing operating model produces the same outcomes." },
    { id: "n4", text: "A blocker to engineering autonomy", detail: "Done right, the platform increases autonomy by removing the dependencies that create blockers." },
    { id: "n5", text: "A one-time cloud project", detail: "Platforms are continuously improved products, not migration milestones." },
  ],
};

const OUTCOMES: Entry[] = [
  { id: "o1", kind: "outcome", name: "Delivery Velocity", subtitle: "Lead time reduced", icon: Gauge, accent: "border-sky-200 text-sky-700", bg: "bg-sky-50",
    overview: "Standardized delivery substrate compresses commit-to-production from days to hours.",
    primaryKpis: [{ name: "Lead time", how: "Commit → prod", target: "< 2d", benchmark: "Elite: < 1h", why: "Flow." }, { name: "Deployment frequency", how: "Per stream / week", target: "Daily", benchmark: "Elite.", why: "Responsiveness." }] },
  { id: "o2", kind: "outcome", name: "Reliability", subtitle: "More consistent production operations", icon: ShieldCheck, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Shared, proven patterns reduce operational variance, which is the leading cause of incidents.",
    primaryKpis: [{ name: "Availability", how: "Composite uptime", target: "> 99.95%", benchmark: "Tier-1.", why: "Trust." }, { name: "Change failure rate", how: "% deploys causing incidents", target: "< 10%", benchmark: "Elite: < 5%", why: "Release quality." }] },
  { id: "o3", kind: "outcome", name: "Standardization", subtitle: "Common patterns across teams", icon: Hexagon, accent: "border-violet-200 text-violet-700", bg: "bg-violet-50",
    overview: "Golden paths and shared services replace bespoke architectures with sanctioned patterns.",
    primaryKpis: [{ name: "Golden path adoption", how: "% new services", target: "≥ 85%", benchmark: "Mature.", why: "Standardization." }] },
  { id: "o4", kind: "outcome", name: "Security", subtitle: "Controls embedded by default", icon: Lock, accent: "border-amber-200 text-amber-700", bg: "bg-amber-50",
    overview: "Security controls live in the platform layer — engineers get safe defaults automatically.",
    primaryKpis: [{ name: "Critical vuln SLA", how: "% < 7d remediation", target: "100%", benchmark: "Mature.", why: "Risk." }, { name: "Automated control coverage", how: "% controls auto-enforced", target: "≥ 80%", benchmark: "Mature.", why: "Scale." }] },
  { id: "o5", kind: "outcome", name: "Cost Efficiency", subtitle: "Shared services and reduced duplication", icon: DollarSign, accent: "border-emerald-200 text-emerald-700", bg: "bg-emerald-50",
    overview: "Shared services compress unit economics; FinOps visibility puts spend in engineer hands.",
    primaryKpis: [{ name: "Cost variance", how: "Actual vs plan", target: "± 5%", benchmark: "Discipline.", why: "Predictability." }] },
  { id: "o6", kind: "outcome", name: "Developer Productivity", subtitle: "Less friction, more focus on product work", icon: Sparkles, accent: "border-rose-200 text-rose-700", bg: "bg-rose-50",
    overview: "Engineers spend more time on customer-facing work and less time on infrastructure, configuration, and toil.",
    primaryKpis: [{ name: "Developer satisfaction", how: "Survey", target: "≥ 4.3 / 5", benchmark: "Healthy.", why: "Retention & productivity." }, { name: "Onboarding time", how: "Days to first deploy", target: "< 5d", benchmark: "Mature.", why: "Ramp." }] },
];

const ALL_ENTRIES = [DEFINITION, ...KPIS, ...EXISTS, ...PRINCIPLES, ...SERVICES, ...STEPS, ...ROLES, ...OUTCOMES];
const ENTRY_BY_ID = Object.fromEntries(ALL_ENTRIES.map(e => [e.id, e])) as Record<string, Entry>;
const PANE_ORDER = ALL_ENTRIES.map(e => e.id);

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PlatformEngineeringDesignPrinciples() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverService, setHoverService] = useState<string | null>(null);

  const entry = selected ? ENTRY_BY_ID[selected] : null;
  const idx = selected ? PANE_ORDER.indexOf(selected) : -1;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-[1480px] mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/reliability-foundations")} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Reliability Foundations
          </button>
          <div className="text-[11px] text-slate-500 uppercase tracking-wider">Foundations · Platform Engineering</div>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto px-6 py-8 space-y-10">
        {/* Hero */}
        <section>
          <div className="text-[11px] font-bold tracking-[0.18em] text-sky-700 uppercase mb-3">FOUNDATIONS &nbsp;›&nbsp; PLATFORM ENGINEERING</div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Platform Engineering Design Principles</h1>
              <p className="mt-1 text-xl font-semibold text-slate-700">What Is Platform Engineering?</p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-2xl">
                A practical discipline focused on building reusable internal platforms, self-service capabilities, and engineering guardrails
                that help product teams move faster with less operational friction.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {KPIS.map(k => <KpiCard key={k.id} k={k} onClick={() => setSelected(k.id)} />)}
            </div>
          </div>
        </section>

        {/* Section 1: Definition + Why It Exists */}
        <section className="grid grid-cols-12 gap-4">
          <button
            onClick={() => setSelected("def")}
            className="col-span-12 lg:col-span-5 text-left rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sky-50 text-sky-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-sky-700">Definition</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{DEFINITION.overview}</p>
            <div className="mt-3 text-[11px] text-slate-400 inline-flex items-center gap-1">Click to open knowledge panel <ChevronRight className="w-3 h-3" /></div>
          </button>

          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-sky-700 mb-4">Why It Exists</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EXISTS.map(e => <ExistsCard key={e.id} e={e} onClick={() => setSelected(e.id)} />)}
            </div>
          </div>
        </section>

        {/* Section 3: Core Principles */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-sky-700 mb-4">Core Principles</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRINCIPLES.map((p, i) => <PrincipleCard key={p.id} p={p} letter={String.fromCharCode(65 + i)} onClick={() => setSelected(p.id)} />)}
          </div>
        </section>

        {/* Section: How Platform Engineering Works */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-sky-700 mb-4">How Platform Engineering Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setSelected(s.id)} className={`text-left rounded-xl border ${s.accent.replace("text-", "border-").split(" ")[0]} bg-white p-4 hover:shadow-md transition-all`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${s.bg} font-bold text-sm ${s.accent.split(" ").find(c => c.startsWith("text-"))}`}>{i + 1}</div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{s.name}</div>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{s.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Section: What the Platform Includes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-sky-700 mb-1">What the Platform Typically Includes</h2>
          <p className="text-xs text-slate-500 mb-5">Hover a service to see its relationship to the Internal Developer Platform.</p>
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 lg:col-span-3 grid grid-cols-1 gap-2">
              {SERVICES.slice(0, 4).map(s => <ServicePill key={s.id} s={s} onClick={() => setSelected(s.id)} onHover={setHoverService} active={hoverService === s.id} />)}
            </div>
            <div className="col-span-12 lg:col-span-6 flex items-center justify-center py-6">
              <div className="relative w-full max-w-md aspect-square">
                {/* spokes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  {SERVICES.map((s, i) => {
                    const angle = (i / SERVICES.length) * Math.PI * 2 - Math.PI / 2;
                    const x = 200 + Math.cos(angle) * 170;
                    const y = 200 + Math.sin(angle) * 170;
                    const active = hoverService === s.id;
                    return <line key={s.id} x1={200} y1={200} x2={x} y2={y} stroke={active ? "#0ea5e9" : "#e2e8f0"} strokeWidth={active ? 2 : 1} strokeDasharray={active ? "0" : "3 3"} />;
                  })}
                </svg>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-24 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center text-center px-3 shadow-lg">
                  <Boxes className="w-5 h-5 mb-1" />
                  <div className="text-xs font-bold leading-tight">Internal Developer Platform</div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-3 grid grid-cols-1 gap-2">
              {SERVICES.slice(4, 8).map(s => <ServicePill key={s.id} s={s} onClick={() => setSelected(s.id)} onHover={setHoverService} active={hoverService === s.id} />)}
            </div>
            <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {SERVICES.slice(8).map(s => <ServicePill key={s.id} s={s} onClick={() => setSelected(s.id)} onHover={setHoverService} active={hoverService === s.id} />)}
            </div>
          </div>
        </section>

        {/* Section: Roles */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-sky-700 mb-4">Typical Platform Engineering Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLES.map(r => <RoleCard key={r.id} r={r} onClick={() => setSelected(r.id)} />)}
          </div>
        </section>

        {/* Section: Is / Is Not */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6">
            <h3 className="text-base font-bold text-emerald-800 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> It Is</h3>
            <ul className="space-y-2">
              {COMPARE.is.map(i => (
                <li key={i.id} className="group rounded-lg border border-emerald-200 bg-white px-3 py-2 hover:shadow-sm cursor-default">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{i.text}</div>
                      <div className="text-xs text-slate-600 mt-0.5 leading-snug">{i.detail}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6">
            <h3 className="text-base font-bold text-rose-800 mb-4 flex items-center gap-2"><XCircle className="w-5 h-5" /> It Is Not</h3>
            <ul className="space-y-2">
              {COMPARE.isNot.map(i => (
                <li key={i.id} className="rounded-lg border border-rose-200 bg-white px-3 py-2 hover:shadow-sm cursor-default">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{i.text}</div>
                      <div className="text-xs text-slate-600 mt-0.5 leading-snug">{i.detail}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Business & Engineering Outcomes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-sky-700 mb-4">Business & Engineering Outcomes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {OUTCOMES.map(o => (
              <button key={o.id} onClick={() => setSelected(o.id)} className={`text-left rounded-xl border bg-white p-3 hover:shadow-md transition-all ${o.accent.replace("text-", "border-").split(" ")[0]}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${o.bg} mb-2`}>
                  <o.icon className={`w-4 h-4 ${o.accent.split(" ").find(c => c.startsWith("text-"))}`} />
                </div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{o.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">{o.subtitle}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Footer quote */}
        <section className="rounded-2xl border-l-4 border-sky-500 bg-slate-50 px-6 py-4">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">Platform Engineering in One Sentence</div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Platform engineering creates the paved roads, shared services, and self-service workflows that let product teams move faster
            without losing reliability, security, or control.
          </p>
        </section>

        <p className="text-[10px] text-slate-400 text-center pb-6">
          Illustrative example metrics for educational reference. Targets are industry benchmarks, not customer commitments.
        </p>
      </div>

      {/* Right pane */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[42vw] sm:w-[42vw] p-0 overflow-y-auto">
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

// ─── Cards ────────────────────────────────────────────────────────────────────
function KpiCard({ k, onClick }: { k: Entry; onClick: () => void }) {
  const Icon = k.icon;
  return (
    <button onClick={onClick} className={`text-left rounded-xl border ${k.accent.replace("text-", "border-").split(" ")[0]} ${k.bg} px-3 py-2.5 hover:shadow-md transition-all min-w-[140px]`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        <Icon className={`w-3.5 h-3.5 ${k.accent.split(" ").find(c => c.startsWith("text-"))}`} />
        {k.name}
      </div>
      <div className={`mt-1 text-xl font-bold ${k.accent.split(" ").find(c => c.startsWith("text-"))}`}>{k.kpiValue}</div>
    </button>
  );
}
function ExistsCard({ e, onClick }: { e: Entry; onClick: () => void }) {
  const Icon = e.icon;
  return (
    <button onClick={onClick} className={`text-left rounded-xl border ${e.accent.replace("text-", "border-").split(" ")[0]} bg-white p-3 hover:shadow-md transition-all`}>
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${e.bg} mb-2`}>
        <Icon className={`w-4 h-4 ${e.accent.split(" ").find(c => c.startsWith("text-"))}`} />
      </div>
      <div className={`text-sm font-bold ${e.accent.split(" ").find(c => c.startsWith("text-"))}`}>{e.name}</div>
      <div className="text-[11px] text-slate-600 mt-1 leading-snug">{e.subtitle}</div>
    </button>
  );
}
function PrincipleCard({ p, letter, onClick }: { p: Entry; letter: string; onClick: () => void }) {
  const Icon = p.icon;
  return (
    <button onClick={onClick} className={`text-left rounded-xl border ${p.accent.replace("text-", "border-").split(" ")[0]} bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${p.bg} text-[11px] font-bold ${p.accent.split(" ").find(c => c.startsWith("text-"))}`}>{letter}</div>
        <Icon className={`w-4 h-4 ${p.accent.split(" ").find(c => c.startsWith("text-"))}`} />
      </div>
      <div className={`text-sm font-bold ${p.accent.split(" ").find(c => c.startsWith("text-"))} leading-tight`}>{p.name}</div>
      <div className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-3">{p.subtitle}</div>
      {p.primaryKpis && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">KPIs to watch</div>
          <div className="text-[10px] text-slate-600 leading-snug line-clamp-2">{p.primaryKpis.map(k => k.name).join(" · ")}</div>
        </div>
      )}
    </button>
  );
}
function ServicePill({ s, onClick, onHover, active }: { s: Entry; onClick: () => void; onHover: (id: string|null) => void; active: boolean }) {
  const Icon = s.icon;
  return (
    <button onClick={onClick} onMouseEnter={() => onHover(s.id)} onMouseLeave={() => onHover(null)}
      className={`text-left rounded-xl border bg-white px-3 py-2 transition-all ${active ? "border-sky-400 shadow-md" : `${s.accent.replace("text-", "border-").split(" ")[0]} hover:shadow-sm`}`}>
      <div className="flex items-start gap-2">
        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${s.bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${s.accent.split(" ").find(c => c.startsWith("text-"))}`} />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-slate-900 leading-tight">{s.name}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{s.subtitle}</div>
        </div>
      </div>
    </button>
  );
}
function RoleCard({ r, onClick }: { r: Entry; onClick: () => void }) {
  const Icon = r.icon;
  return (
    <button onClick={onClick} className={`text-left rounded-xl border ${r.accent.replace("text-", "border-").split(" ")[0]} bg-white p-4 hover:shadow-md transition-all`}>
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${r.bg} mb-2`}>
        <Icon className={`w-4.5 h-4.5 ${r.accent.split(" ").find(c => c.startsWith("text-"))}`} />
      </div>
      <div className="text-sm font-bold text-slate-900 leading-tight">{r.name}</div>
      <div className="text-[11px] text-slate-600 mt-1 leading-snug">{r.subtitle}</div>
      {r.owns && (
        <ul className="mt-2 space-y-0.5 text-[10px] text-slate-500">
          {r.owns.slice(0, 3).map((o, i) => <li key={i}>• {o}</li>)}
        </ul>
      )}
    </button>
  );
}

// ─── Right pane ──────────────────────────────────────────────────────────────
function EntryPane({ entry, onPrev, onNext, indexInfo, onClose }: { entry: Entry; onPrev: () => void; onNext: () => void; indexInfo: string; onClose: () => void; }) {
  const Icon = entry.icon;
  const kindLabel = useMemo(() => ({
    kpi: "Key Performance Indicator", principle: "Core Principle", service: "Platform Service", step: "Workflow Step",
    role: "Role", outcome: "Outcome", exists: "Why It Exists", compare: "Comparison", definition: "Definition",
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4"/></button>
        </div>
      </SheetHeader>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="px-6 mt-3 flex flex-wrap justify-start h-auto bg-transparent gap-1">
          {["overview","responsibilities","components","competencies","interactions","metrics","hhax","implementation","artifacts"].map(t => (
            <TabsTrigger key={t} value={t} className="text-[11px] capitalize data-[state=active]:bg-slate-900 data-[state=active]:text-white">{t === "hhax" ? "HHAX Relevance" : t}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <TabsContent value="overview" className="space-y-4 mt-4">
            {entry.kpiValue && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Current value</span>
                <span className="text-lg font-bold text-slate-900">{entry.kpiValue}</span>
              </div>
            )}
            {entry.overview && <Section title="Definition"><p className="text-sm text-slate-700 leading-relaxed">{entry.overview}</p></Section>}
            {entry.kpiDefinition && <Section title="What it measures"><p className="text-sm text-slate-700 leading-relaxed">{entry.kpiDefinition}</p></Section>}
            {entry.kpiHow && <Section title="How it is measured"><p className="text-sm text-slate-700 leading-relaxed">{entry.kpiHow}</p></Section>}
            {entry.kpiBenchmark && <Section title="Industry benchmark"><p className="text-sm text-slate-700 leading-relaxed">{entry.kpiBenchmark}</p></Section>}
            {entry.purpose && <ListSection title="Purpose" items={entry.purpose} />}
            {entry.why && <Section title="Why it matters"><p className="text-sm text-slate-700 leading-relaxed">{entry.why}</p></Section>}
            {entry.history && <Section title="History"><p className="text-sm text-slate-700 leading-relaxed">{entry.history}</p></Section>}
            {entry.misconceptions && <ListSection title="Common misconceptions" items={entry.misconceptions} />}
            {entry.industry && <TagSection title="Industry examples" items={entry.industry} />}
          </TabsContent>

          <TabsContent value="responsibilities" className="space-y-4 mt-4">
            {entry.owns && <ListSection title="What it owns" items={entry.owns} />}
            {entry.influences && <ListSection title="What it influences" items={entry.influences} />}
            {entry.notOwn && <ListSection title="What it does not own" items={entry.notOwn} />}
            {entry.decisions && <ListSection title="Decision rights" items={entry.decisions} />}
            {entry.operating && <ListSection title="Operating responsibilities" items={entry.operating} />}
            {!entry.owns && !entry.influences && !entry.notOwn && <Empty />}
          </TabsContent>

          <TabsContent value="components" className="space-y-4 mt-4">
            {entry.components && <ListSection title="Services" items={entry.components} />}
            {entry.capabilities && <ListSection title="Capabilities" items={entry.capabilities} />}
            {entry.tools && <TagSection title="Tools" items={entry.tools} />}
            {entry.artifacts && <ListSection title="Artifacts" items={entry.artifacts} />}
            {entry.dependencies && <ListSection title="Dependencies" items={entry.dependencies} />}
            {entry.consumers && <ListSection title="Consumers" items={entry.consumers} />}
            {entry.providers && <ListSection title="Providers" items={entry.providers} />}
            {!entry.capabilities && !entry.tools && !entry.components && <Empty />}
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

          <TabsContent value="interactions" className="space-y-4 mt-4">
            {entry.serves && <ListSection title="Who it serves" items={entry.serves} />}
            {entry.dependsOn && <ListSection title="Who it depends on" items={entry.dependsOn} />}
            {entry.workflows && <ListSection title="Workflow interactions" items={entry.workflows} />}
            {entry.teamInteractions && <ListSection title="Team interactions" items={entry.teamInteractions} />}
            {entry.sreInteractions && <Section title="SRE interactions"><p className="text-sm text-slate-700">{entry.sreInteractions}</p></Section>}
            {entry.securityInteractions && <Section title="Security interactions"><p className="text-sm text-slate-700">{entry.securityInteractions}</p></Section>}
            {entry.archInteractions && <Section title="Architecture interactions"><p className="text-sm text-slate-700">{entry.archInteractions}</p></Section>}
            {!entry.serves && !entry.dependsOn && !entry.workflows && <Empty />}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-3 mt-4">
            {entry.primaryKpis ? entry.primaryKpis.map((k, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-sm text-slate-900">{k.name}</div>
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{k.target}</div>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{k.how}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500">
                  <div><span className="font-semibold text-slate-600">Benchmark:</span> {k.benchmark}</div>
                  <div><span className="font-semibold text-slate-600">Why:</span> {k.why}</div>
                </div>
              </div>
            )) : <Empty />}
            {entry.secondaryKpis && <ListSection title="Secondary KPIs" items={entry.secondaryKpis} />}
          </TabsContent>

          <TabsContent value="hhax" className="space-y-4 mt-4">
            {entry.hhax ? entry.hhax.map((h, i) => <p key={i} className="text-sm text-slate-700 leading-relaxed">{h}</p>) : (
              <div className="text-sm text-slate-700 leading-relaxed">
                Platform engineering directly supports HHAX modernization: standardizing acquired platforms onto common cloud foundations,
                anchoring GitHub-based delivery, embedding Datadog observability, and replacing ticket-driven operations with self-service
                workflows that scale across product teams.
              </div>
            )}
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4 mt-4">
            {entry.currentState && <Section title="Current state"><p className="text-sm text-slate-700">{entry.currentState}</p></Section>}
            {entry.targetState && <Section title="Target state"><p className="text-sm text-slate-700">{entry.targetState}</p></Section>}
            {entry.prerequisites && <ListSection title="Prerequisites" items={entry.prerequisites} />}
            {entry.quickWins && <ListSection title="Quick wins" items={entry.quickWins} />}
            {entry.ninetyDay && <ListSection title="90-day plan" items={entry.ninetyDay} />}
            {entry.twelveMonth && <ListSection title="12-month evolution" items={entry.twelveMonth} />}
            {entry.pitfalls && <ListSection title="Common pitfalls" items={entry.pitfalls} />}
            {!entry.currentState && !entry.quickWins && !entry.pitfalls && (
              <div className="text-xs text-slate-500 leading-relaxed">
                Typical implementation arc: <strong>Stabilize</strong> (inventory + ownership) →
                <strong> Standardize</strong> (golden paths + IaC) → <strong>Productize</strong> (portal + adoption metrics) →
                <strong> Continuously improve</strong> (DevEx + platform KPIs).
              </div>
            )}
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-4 mt-4">
            <ListSection title="Standard artifacts" items={entry.exampleArtifacts ?? [
              "Platform Service Catalog", "Golden Path Library", "Landing Zone Standards",
              "Developer Portal", "CI/CD Templates", "Terraform Modules",
              "Observability Standards", "Security Guardrails", "Service Documentation", "Platform Roadmap",
            ]} />
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
