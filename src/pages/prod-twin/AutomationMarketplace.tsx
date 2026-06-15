import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Cloud, Boxes, Layers, ShieldCheck, Target, Gauge, Activity, Eye, Bell,
  Network, Lock, ClipboardCheck, KeyRound, GitBranch, FolderGit2, Rocket,
  AlertTriangle, Building2, Users, Server, Bot, Sparkles, Search, Star,
  Clock, TrendingUp, CheckCircle2, ArrowRight, Filter, LayoutGrid, List,
  Workflow, Zap, BarChart3, DollarSign, Database, ShieldAlert, FileCheck,
  Brain, Wand2, PiggyBank, BookOpen, type LucideIcon,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type AutomationCategory =
  | "Cloud Platform"
  | "Reliability Engineering"
  | "Observability"
  | "Security"
  | "Developer Productivity"
  | "Acquisition Integration"
  | "AI Operations";

type Automation = {
  id: string;
  name: string;
  category: AutomationCategory;
  icon: LucideIcon;
  iconColor: string;       // tailwind text color class for icon
  tile: string;            // tailwind bg class for tile icon block
  blurb: string;
  provisionMin: number;
  consumers: number;       // total runs / consumers
  rating: number;
  trend: number[];
  status: "healthy" | "degraded" | "new";
  tags: string[];
  hover: {
    does: string;
    consumer: string;
    outcomes: string[];
    consumption: string;
    business: string;
    reliability: string;
    cost: string;
    security: string;
  };
  panel: {
    overview: string;
    operational: string;
    business: string;
    consumer: string;
    workflow: string[];
    inputs: string[];
    outputs: string[];
    architecture: string[];
    dependencies: string[];
    security: string[];
    cost: string[];
    observability: string[];
    useCases: string[];
    antiPatterns: string[];
    kpis: { name: string; value: string }[];
    sla: string;
    adoption: { consumers: number; runs: string; teams: number };
    related: string[];
    ai?: string[];
    owner: string;
    platformOwner: string;
    lastUpdate: string;
  };
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const trend = (base: number, vol = 6, n = 14) =>
  Array.from({ length: n }, (_, i) => Math.max(0, base + Math.sin(i / 1.8) * vol + (Math.random() * vol - vol / 2)));

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
const AUTOMATIONS: Automation[] = [
  /* ---- Cloud Platform ---- */
  {
    id: "aws-account",
    name: "AWS Account Provisioning",
    category: "Cloud Platform",
    icon: Boxes,
    iconColor: "text-orange-600",
    tile: "bg-orange-50",
    blurb: "Provision a secure AWS account with baseline guardrails, logging, and tagging.",
    provisionMin: 10,
    consumers: 1247,
    rating: 4.8,
    trend: trend(80, 8),
    status: "healthy",
    tags: ["aws", "account", "baseline", "control-tower"],
    hover: {
      does: "Stands up a fully governed AWS account via Control Tower with security baseline applied.",
      consumer: "Platform Engineers · Developers · SRE",
      outcomes: ["Standardized AWS Account", "Guardrails Enabled", "Security Baseline Applied"],
      consumption: "1,247 provisions · 84 teams",
      business: "Cuts new-team onboarding from weeks to minutes.",
      reliability: "Pre-wired logging, monitoring, and DR baseline.",
      cost: "Budgets and cost-allocation tags enforced at create.",
      security: "GuardDuty, Security Hub, CloudTrail enabled by default.",
    },
    panel: {
      overview: "Creates a new AWS account in minutes with enterprise baseline configurations including Org enrollment, IAM roles, logging, monitoring, and security services.",
      operational: "Removes the multi-team ticket chain for new AWS accounts. The platform owns provisioning, the product team consumes it.",
      business: "Accelerates new product launches and acquisition onboarding; eliminates drift between accounts.",
      consumer: "Product engineering teams launching a new service or environment, and platform teams onboarding an acquired company.",
      workflow: ["Request", "Configure", "Review", "Provision", "Ready"],
      inputs: ["Account name", "OU", "Owner", "Budget", "Environment"],
      outputs: ["AWS Account ID", "Landing zone OUs", "IAM Identity Center mappings", "Default VPC + subnets", "Logging targets"],
      architecture: ["AWS Control Tower", "Organizations", "IAM Identity Center", "Config + CloudTrail + Security Hub", "GuardDuty"],
      dependencies: ["IAM Identity Center", "VPC Baseline Deployment", "Cloud Logging Setup"],
      security: ["GuardDuty", "Security Hub", "CloudTrail org trail", "SCP guardrails", "Encryption defaults"],
      cost: ["Budget alerts", "Cost allocation tags", "Reserved capacity hint"],
      observability: ["Centralized CloudWatch", "Service Health dashboard", "Drift detection"],
      useCases: ["New product launch", "Acquisition account onboarding", "Spinning up a regulated workload"],
      antiPatterns: ["Manual click-ops account creation", "Bolting on security after launch", "Skipping budgets to ship faster"],
      kpis: [
        { name: "Avg provisioning", value: "~10 min" },
        { name: "Guardrail coverage", value: "100%" },
        { name: "User input needed", value: "~5 min" },
      ],
      sla: "P90 ≤ 15 min · 99.9% success",
      adoption: { consumers: 1247, runs: "1.2k / mo", teams: 84 },
      related: ["IAM Identity Center Setup", "VPC Baseline Deployment", "Cloud Logging Setup"],
      ai: ["Recommended OU", "Budget sizing", "Tag policy generation"],
      owner: "Cloud Platform Team",
      platformOwner: "Platform Engineering",
      lastUpdate: "3 days ago",
    },
  },
  {
    id: "k8s-namespace",
    name: "Kubernetes Namespace Creation",
    category: "Cloud Platform",
    icon: Layers,
    iconColor: "text-sky-600",
    tile: "bg-sky-50",
    blurb: "Create a new Kubernetes namespace with RBAC, quotas, and monitoring.",
    provisionMin: 2,
    consumers: 956,
    rating: 4.9,
    trend: trend(95, 4),
    status: "healthy",
    tags: ["k8s", "namespace", "rbac"],
    hover: {
      does: "Bootstraps a namespace with RBAC, resource quotas, network policies, and observability.",
      consumer: "Application Engineers · SRE",
      outcomes: ["Namespace with quotas", "RBAC bound", "Monitoring on by default"],
      consumption: "956 created · 41 clusters",
      business: "Tenants land safely without cluster-admin involvement.",
      reliability: "Quotas prevent noisy-neighbor incidents.",
      cost: "Workload-level cost allocation enforced.",
      security: "Network policy default-deny applied.",
    },
    panel: {
      overview: "Creates a hardened Kubernetes namespace with RBAC bindings, resource quotas, network policies, alerting templates, and secrets scaffolding.",
      operational: "Removes cluster-admin hand-offs and makes tenancy self-service.",
      business: "Speeds delivery of new services while protecting shared cluster reliability.",
      consumer: "Application engineering teams deploying to shared clusters.",
      workflow: ["Request", "Pick cluster", "Bind owners", "Apply policies", "Ready"],
      inputs: ["Cluster", "Owners", "Quota tier", "Tags"],
      outputs: ["Namespace", "RBAC bindings", "Resource quotas", "Default NetworkPolicies", "Monitoring scrape config"],
      architecture: ["Argo CD", "OPA Gatekeeper", "Prometheus + Loki", "External Secrets"],
      dependencies: ["Cluster Onboarding", "Secrets Backend"],
      security: ["Default-deny NetworkPolicy", "Pod Security Admission", "Image pull policy"],
      cost: ["Workload cost tags", "Quota tier"],
      observability: ["Prom scrape", "Loki tail", "Default alerts"],
      useCases: ["New service deploy", "Per-environment isolation"],
      antiPatterns: ["Shared namespaces across teams", "No quota = noisy neighbor"],
      kpis: [
        { name: "Avg provisioning", value: "~2 min" },
        { name: "Policy coverage", value: "100%" },
      ],
      sla: "P90 ≤ 3 min",
      adoption: { consumers: 956, runs: "2.3k / mo", teams: 64 },
      related: ["Cluster Onboarding", "Secrets Backend"],
      ai: ["Quota recommendation", "Policy lint"],
      owner: "Cloud Platform Team",
      platformOwner: "Platform Engineering",
      lastUpdate: "1 day ago",
    },
  },
  {
    id: "env-create",
    name: "Environment Creation",
    category: "Cloud Platform",
    icon: Boxes,
    iconColor: "text-emerald-600",
    tile: "bg-emerald-50",
    blurb: "Provision a standardized environment (Dev, Test, Stage, Prod).",
    provisionMin: 5,
    consumers: 1800,
    rating: 4.7,
    trend: trend(70, 6),
    status: "healthy",
    tags: ["environment", "landing-zone"],
    hover: {
      does: "Stands up an isolated, standards-compliant environment ready for deploys.",
      consumer: "Product Teams · QA",
      outcomes: ["Isolated network", "Baseline secrets", "Promotion path wired"],
      consumption: "1,800 environments · 96% standardized",
      business: "Consistent envs = predictable deploys.",
      reliability: "Identical Prod-shaped lower envs reduce surprises.",
      cost: "Right-sized per tier with sleep schedules.",
      security: "Per-env IAM and key isolation.",
    },
    panel: {
      overview: "Creates a Dev/Test/Stage/Prod environment with isolation, secrets, observability, and a standardized promotion path.",
      operational: "Eliminates one-off envs that drift away from production.",
      business: "Releases ship faster because lower environments behave like prod.",
      consumer: "Product teams launching or refreshing an environment.",
      workflow: ["Request", "Pick tier", "Isolate", "Wire promotion", "Ready"],
      inputs: ["Tier", "Region", "Owners"],
      outputs: ["VPC/Subnets", "Secrets store", "Observability targets", "Promotion pipeline"],
      architecture: ["Terraform modules", "Vault", "Datadog", "ArgoCD"],
      dependencies: ["AWS Account Provisioning", "Pipeline Generator"],
      security: ["Per-env keys", "Network isolation"],
      cost: ["Sleep schedules", "Right-sized tiers"],
      observability: ["Env health dashboard"],
      useCases: ["New service env", "Refreshing stage", "Per-PR ephemeral env"],
      antiPatterns: ["Snowflake stage env", "Shared secrets across envs"],
      kpis: [
        { name: "Avg provisioning", value: "~5 min" },
        { name: "Drift", value: "< 2%" },
      ],
      sla: "P90 ≤ 8 min",
      adoption: { consumers: 1800, runs: "3.1k / mo", teams: 92 },
      related: ["AWS Account Provisioning", "Pipeline Generator"],
      ai: ["Tier recommendation"],
      owner: "Cloud Platform Team",
      platformOwner: "Platform Engineering",
      lastUpdate: "5 days ago",
    },
  },
  {
    id: "golden-infra",
    name: "Golden Infrastructure Deployment",
    category: "Cloud Platform",
    icon: ShieldCheck,
    iconColor: "text-violet-600",
    tile: "bg-violet-50",
    blurb: "Deploy secure, pre-approved infrastructure using golden modules.",
    provisionMin: 15,
    consumers: 784,
    rating: 4.6,
    trend: trend(60, 6),
    status: "healthy",
    tags: ["terraform", "golden", "infra"],
    hover: {
      does: "Deploys approved Terraform modules with security and observability built-in.",
      consumer: "Platform Engineers · SRE",
      outcomes: ["Approved modules", "Security baseline", "Observability wired"],
      consumption: "784 deploys · 96% module reuse",
      business: "Scales secure infra without bottlenecks.",
      reliability: "Every module is tested with chaos + DR.",
      cost: "Module-level cost guardrails.",
      security: "Pre-approved by Security & Compliance.",
    },
    panel: {
      overview: "Pre-approved Terraform modules with networking, IAM, security controls, and logging baked in.",
      operational: "No more bespoke Terraform per team.",
      business: "Standardized infra = lower TCO and faster audits.",
      consumer: "Any team needing infra beyond what self-service covers.",
      workflow: ["Pick module", "Configure", "Plan", "Approve", "Apply"],
      inputs: ["Module", "Inputs", "Owners"],
      outputs: ["Infra", "State", "Drift detection"],
      architecture: ["Terraform Cloud", "OPA", "Atlantis"],
      dependencies: ["Cloud Account"],
      security: ["OPA policies", "Approved providers only"],
      cost: ["Module cost estimate"],
      observability: ["Drift detection"],
      useCases: ["VPC peering", "RDS cluster", "Service mesh"],
      antiPatterns: ["Forking modules locally", "Bypassing review"],
      kpis: [
        { name: "Avg provisioning", value: "~15 min" },
        { name: "Reuse rate", value: "96%" },
      ],
      sla: "P90 ≤ 25 min",
      adoption: { consumers: 784, runs: "1.0k / mo", teams: 48 },
      related: ["AWS Account Provisioning"],
      owner: "Cloud Platform Team",
      platformOwner: "Platform Engineering",
      lastUpdate: "2 days ago",
    },
  },

  /* ---- Reliability ---- */
  {
    id: "slo-wizard",
    name: "SLO Creation Wizard",
    category: "Reliability Engineering",
    icon: Target,
    iconColor: "text-rose-600",
    tile: "bg-rose-50",
    blurb: "Define and create Availability, Latency, or Error Rate SLOs with best practices.",
    provisionMin: 8,
    consumers: 1100,
    rating: 4.8,
    trend: trend(72, 5),
    status: "healthy",
    tags: ["slo", "reliability"],
    hover: {
      does: "Generates SLOs, SLIs, and error budgets aligned to customer journeys.",
      consumer: "Service Owners · SRE",
      outcomes: ["SLOs in catalog", "Error budget policy", "Burn-rate alerts"],
      consumption: "1,100 services · 92% with SLOs",
      business: "Reliability becomes a measurable commitment.",
      reliability: "Prevention over reaction begins here.",
      cost: "Aligns engineering investment to customer value.",
      security: "Scopes SLOs to security-critical paths too.",
    },
    panel: {
      overview: "Wizard-driven creation of Availability/Latency/Error Rate SLOs with dependency mapping and error-budget policy.",
      operational: "Replaces tribal definitions of reliability with a shared, measurable contract.",
      business: "Connects engineering trade-offs to customer impact.",
      consumer: "Every service owner launching or maturing a service.",
      workflow: ["Pick service", "Define SLI", "Set target", "Wire alerts", "Publish"],
      inputs: ["Service", "User journey", "Target", "Window"],
      outputs: ["SLO + SLI", "Burn-rate alerts", "Error-budget policy", "Catalog entry"],
      architecture: ["Datadog SLOs", "OpenSLO", "Service Catalog"],
      dependencies: ["Datadog Onboarding", "Service Catalog"],
      security: ["RBAC on SLO edits"],
      cost: ["—"],
      observability: ["Burn-rate alerts", "SLO dashboards"],
      useCases: ["New service launch", "Reliability maturity review"],
      antiPatterns: ["Five-nines for everything", "SLOs no one acts on"],
      kpis: [{ name: "SLOs created", value: "1,100" }, { name: "Services with SLO", value: "92%" }],
      sla: "P90 ≤ 10 min",
      adoption: { consumers: 1100, runs: "240 / mo", teams: 76 },
      related: ["Error Budget Creation", "Service Health Dashboard"],
      ai: ["SLI suggestion", "Target benchmarking"],
      owner: "Reliability Engineering",
      platformOwner: "Reliability Platform",
      lastUpdate: "1 day ago",
    },
  },
  {
    id: "err-budget",
    name: "Error Budget Creation",
    category: "Reliability Engineering",
    icon: Gauge,
    iconColor: "text-amber-600",
    tile: "bg-amber-50",
    blurb: "Automatically calculate error budgets and configure alerts & dashboards.",
    provisionMin: 5,
    consumers: 892,
    rating: 4.7,
    trend: trend(68, 5),
    status: "healthy",
    tags: ["error-budget", "burn-rate"],
    hover: {
      does: "Calculates error budgets, burn-rate alerts, and forecasts.",
      consumer: "Service Owners · SRE",
      outcomes: ["Budget policy", "Burn-rate alerts", "Forecasting"],
      consumption: "892 services · 38% lower incident rate",
      business: "Spend reliability where it matters.",
      reliability: "Early warning before customers feel pain.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Generates budget policies and burn-rate alerts from SLOs.",
      operational: "Drives release-vs-reliability decisions with data.",
      business: "Protects revenue paths before they break.",
      consumer: "Service owners and release captains.",
      workflow: ["Pick SLO", "Set burn-rate", "Wire freeze policy", "Publish"],
      inputs: ["SLO", "Burn-rate thresholds"],
      outputs: ["Budget", "Alerts", "Policy doc"],
      architecture: ["Datadog", "PagerDuty"],
      dependencies: ["SLO Creation Wizard"],
      security: [],
      cost: [],
      observability: ["Burn-rate alerts"],
      useCases: ["Pre-release check", "Mid-quarter reset"],
      antiPatterns: ["Resetting budgets to ship anyway"],
      kpis: [{ name: "Budgets active", value: "892" }],
      sla: "P90 ≤ 5 min",
      adoption: { consumers: 892, runs: "180 / mo", teams: 64 },
      related: ["SLO Creation Wizard"],
      owner: "Reliability Engineering",
      platformOwner: "Reliability Platform",
      lastUpdate: "Today",
    },
  },
  {
    id: "service-health",
    name: "Service Health Dashboard",
    category: "Reliability Engineering",
    icon: Activity,
    iconColor: "text-violet-600",
    tile: "bg-violet-50",
    blurb: "Create a Datadog service scorecard and reliability dashboards.",
    provisionMin: 6,
    consumers: 1300,
    rating: 4.7,
    trend: trend(78, 5),
    status: "healthy",
    tags: ["dashboard", "scorecard"],
    hover: {
      does: "Generates a per-service scorecard with availability, latency, and dependency view.",
      consumer: "Service Owners",
      outcomes: ["Scorecard", "Dependencies", "Reliability trends"],
      consumption: "1,300 services · weekly reviews",
      business: "One pane of glass per service.",
      reliability: "Surfaces drift before it becomes incidents.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Provisions a Datadog scorecard and embeds it in the Service Catalog.",
      operational: "Replaces 'who owns this dashboard?'",
      business: "Ownership and health are visible to leadership.",
      consumer: "Service owners + on-call.",
      workflow: ["Pick service", "Generate", "Embed", "Subscribe"],
      inputs: ["Service"],
      outputs: ["Scorecard", "Dashboard URL"],
      architecture: ["Datadog Scorecards", "Service Catalog"],
      dependencies: ["Datadog Onboarding"],
      security: [],
      cost: [],
      observability: ["Reliability trends"],
      useCases: ["Service launch", "Quarterly review"],
      antiPatterns: ["Dashboards no one looks at"],
      kpis: [{ name: "Scorecards", value: "1.3k" }],
      sla: "P90 ≤ 8 min",
      adoption: { consumers: 1300, runs: "320 / mo", teams: 84 },
      related: ["SLO Creation Wizard"],
      owner: "Reliability Engineering",
      platformOwner: "Reliability Platform",
      lastUpdate: "2 days ago",
    },
  },
  {
    id: "ir-assess",
    name: "Incident Readiness Assessment",
    category: "Reliability Engineering",
    icon: ClipboardCheck,
    iconColor: "text-orange-600",
    tile: "bg-orange-50",
    blurb: "Assess runbooks, ownership, monitoring and escalation readiness.",
    provisionMin: 7,
    consumers: 743,
    rating: 4.6,
    trend: trend(60, 5),
    status: "healthy",
    tags: ["incident", "readiness"],
    hover: {
      does: "Scores a service on runbooks, ownership, monitoring, and escalation paths.",
      consumer: "Service Owners · IM",
      outcomes: ["Readiness score", "Gap list", "Remediation tasks"],
      consumption: "743 services · 41% gap-closure",
      business: "Reduce time-to-recover when incidents do happen.",
      reliability: "Closes the prevention-to-response gap.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Inspects a service for IR readiness and opens tickets for any gaps.",
      operational: "Turns IR readiness into a measurable program.",
      business: "Lower MTTR and fewer customer-visible incidents.",
      consumer: "Service owners ahead of GA, M&A onboarding.",
      workflow: ["Scan", "Score", "Open gaps", "Track"],
      inputs: ["Service"],
      outputs: ["Score", "Gaps", "Tickets"],
      architecture: ["Service Catalog", "PagerDuty"],
      dependencies: ["Service Health Dashboard"],
      security: [],
      cost: [],
      observability: ["Readiness trend"],
      useCases: ["Pre-GA", "Post-acquisition"],
      antiPatterns: ["Tabletop without remediation"],
      kpis: [{ name: "Avg score", value: "82 / 100" }],
      sla: "P90 ≤ 10 min",
      adoption: { consumers: 743, runs: "120 / mo", teams: 54 },
      related: ["SLO Creation Wizard"],
      owner: "Reliability Engineering",
      platformOwner: "Reliability Platform",
      lastUpdate: "1 week ago",
    },
  },

  /* ---- Observability ---- */
  {
    id: "dd-onboard",
    name: "Datadog Monitoring Onboarding",
    category: "Observability",
    icon: Eye,
    iconColor: "text-fuchsia-600",
    tile: "bg-fuchsia-50",
    blurb: "Onboard a service to Datadog with logs, metrics, traces and dashboards.",
    provisionMin: 10,
    consumers: 1600,
    rating: 4.8,
    trend: trend(85, 6),
    status: "healthy",
    tags: ["datadog", "observability"],
    hover: {
      does: "Wires a service into Datadog with logs, metrics, traces, alerts, and dashboards.",
      consumer: "Service Owners",
      outcomes: ["Logs", "Metrics", "Traces", "Dashboards"],
      consumption: "1,600 services onboarded",
      business: "Visibility is the prerequisite for reliability.",
      reliability: "Targeted alerts replace screen-watching.",
      cost: "Budget guardrails on index volume.",
      security: "Audit logs to security data lake.",
    },
    panel: {
      overview: "Provisions Datadog APM, log pipelines, and dashboards via templates.",
      operational: "Removes manual Datadog setup per service.",
      business: "Faster time-to-visibility for every new launch.",
      consumer: "Any service launching or maturing observability.",
      workflow: ["Pick service", "Apply template", "Configure", "Validate"],
      inputs: ["Service", "Env", "Tags"],
      outputs: ["APM", "Logs", "Dashboards", "Alerts"],
      architecture: ["Datadog Agent", "OpenTelemetry"],
      dependencies: ["Service Catalog"],
      security: ["Sensitive-data scrubbing"],
      cost: ["Index sampling"],
      observability: ["MTTD", "Alert precision"],
      useCases: ["New service launch", "Standardization sweep"],
      antiPatterns: ["Custom one-off Datadog accounts"],
      kpis: [{ name: "Services onboarded", value: "1.6k" }, { name: "Index efficiency", value: "+22%" }],
      sla: "P90 ≤ 15 min",
      adoption: { consumers: 1600, runs: "210 / mo", teams: 96 },
      related: ["Synthetic Monitoring", "Alert Optimization"],
      ai: ["Alert template selection"],
      owner: "Observability Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "2 days ago",
    },
  },
  {
    id: "synth",
    name: "Synthetic Monitoring",
    category: "Observability",
    icon: Activity,
    iconColor: "text-sky-600",
    tile: "bg-sky-50",
    blurb: "Create synthetic tests for user journeys, APIs, and critical transactions.",
    provisionMin: 6,
    consumers: 967,
    rating: 4.6,
    trend: trend(70, 5),
    status: "healthy",
    tags: ["synthetic", "journeys"],
    hover: {
      does: "Generates synthetic checks for top journeys and APIs.",
      consumer: "Service Owners",
      outcomes: ["Journey checks", "API checks", "Geo coverage"],
      consumption: "967 journeys monitored",
      business: "Catch outages before customers report them.",
      reliability: "MTTD measured in seconds.",
      cost: "Tiered execution frequency.",
      security: "—",
    },
    panel: {
      overview: "Authoring + scheduling for synthetic checks across journeys, APIs, and transactions.",
      operational: "Removes the 'no one noticed it was down' class of incident.",
      business: "Protects revenue-critical journeys.",
      consumer: "Service owners and product teams.",
      workflow: ["Record journey", "Parameterize", "Schedule", "Alert"],
      inputs: ["Journey", "Geos", "Frequency"],
      outputs: ["Synthetic test", "Alert", "SLI"],
      architecture: ["Datadog Synthetics"],
      dependencies: ["Datadog Onboarding"],
      security: ["Secret vault for test creds"],
      cost: ["Frequency tier"],
      observability: ["Latency over time"],
      useCases: ["Checkout flow", "Login flow"],
      antiPatterns: ["Tests not maintained when UI changes"],
      kpis: [{ name: "Journeys", value: "967" }],
      sla: "P90 ≤ 8 min",
      adoption: { consumers: 967, runs: "180 / mo", teams: 58 },
      related: ["Datadog Onboarding"],
      owner: "Observability Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "4 days ago",
    },
  },
  {
    id: "dep-map",
    name: "Dependency Mapping",
    category: "Observability",
    icon: Network,
    iconColor: "text-emerald-600",
    tile: "bg-emerald-50",
    blurb: "Discover and map dependencies across services, APIs and datastores.",
    provisionMin: 12,
    consumers: 1000,
    rating: 4.7,
    trend: trend(65, 6),
    status: "healthy",
    tags: ["dependency", "graph"],
    hover: {
      does: "Crawls traces and config to build a live dependency map.",
      consumer: "SRE · Architecture",
      outcomes: ["Live graph", "Impact analysis"],
      consumption: "1,000 services mapped",
      business: "See blast radius before changes ship.",
      reliability: "Faster RCA and incident scoping.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Builds a live service-dependency graph from traces, config, and infra.",
      operational: "Used during change risk analysis and incident response.",
      business: "Reduces customer-visible blast radius.",
      consumer: "SRE, architecture, change advisory.",
      workflow: ["Discover", "Augment", "Publish", "Subscribe"],
      inputs: ["Trace data", "Config", "CMDB"],
      outputs: ["Graph", "Impact reports"],
      architecture: ["OpenTelemetry", "Backstage Graph"],
      dependencies: ["Datadog Onboarding"],
      security: [],
      cost: [],
      observability: ["Graph freshness"],
      useCases: ["Change risk", "Incident scoping"],
      antiPatterns: ["Static visio diagrams"],
      kpis: [{ name: "Services mapped", value: "1.0k" }],
      sla: "P90 ≤ 15 min",
      adoption: { consumers: 1000, runs: "60 / mo", teams: 40 },
      related: ["Deployment Risk Analysis"],
      owner: "Observability Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "1 day ago",
    },
  },
  {
    id: "alert-opt",
    name: "Alert Optimization",
    category: "Observability",
    icon: Bell,
    iconColor: "text-orange-600",
    tile: "bg-orange-50",
    blurb: "Analyze and reduce alert noise and improve alert quality and routing.",
    provisionMin: 5,
    consumers: 812,
    rating: 4.5,
    trend: trend(58, 6),
    status: "healthy",
    tags: ["alerts", "noise"],
    hover: {
      does: "Audits alerts, removes noise, and improves routing.",
      consumer: "SRE · On-call",
      outcomes: ["Lower noise", "Better routing", "Less burnout"],
      consumption: "−47% alert volume yoy",
      business: "Protects the on-call humans.",
      reliability: "Signal beats noise.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Continuously analyzes alert health: noise, precision, routing, and ownership.",
      operational: "Replaces NOC-style screen-watching with targeted, owned alerts.",
      business: "Reduces on-call burnout and missed real incidents.",
      consumer: "Every team with on-call.",
      workflow: ["Scan", "Score", "Recommend", "Apply"],
      inputs: ["Alert catalog", "Ownership"],
      outputs: ["Tuned alerts", "Routing"],
      architecture: ["Datadog", "PagerDuty"],
      dependencies: ["Datadog Onboarding"],
      security: [],
      cost: [],
      observability: ["Alert precision"],
      useCases: ["On-call rotation prep", "Burnout reduction"],
      antiPatterns: ["Threshold-only alerts", "Pager spam"],
      kpis: [{ name: "Precision", value: "92%" }],
      sla: "P90 ≤ 5 min",
      adoption: { consumers: 812, runs: "90 / mo", teams: 52 },
      related: ["Datadog Onboarding"],
      ai: ["Noise clustering", "Routing suggestions"],
      owner: "Observability Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "Today",
    },
  },

  /* ---- Security ---- */
  {
    id: "sg-validate",
    name: "Security Group Validation",
    category: "Security",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
    tile: "bg-emerald-50",
    blurb: "Validate security groups against best practices and exposure risks.",
    provisionMin: 5,
    consumers: 1200,
    rating: 4.7,
    trend: trend(72, 5),
    status: "healthy",
    tags: ["sg", "exposure"],
    hover: {
      does: "Scans security groups for public exposure and drift.",
      consumer: "Security · Cloud Eng",
      outcomes: ["Exposure report", "Drift detection"],
      consumption: "1,200 scans · 38 critical findings closed",
      business: "Pre-empts audit findings.",
      reliability: "Prevents catastrophic exposure incidents.",
      cost: "—",
      security: "Continuous compliance.",
    },
    panel: {
      overview: "Inspects SG rules for public exposure, dangerous ports, and drift from baseline.",
      operational: "Continuous validation, not point-in-time review.",
      business: "Lower exposure means lower breach probability.",
      consumer: "Security and cloud engineering.",
      workflow: ["Scan", "Score", "Notify", "Remediate"],
      inputs: ["Account", "Region"],
      outputs: ["Findings", "Tickets"],
      architecture: ["AWS Config", "Custom rules"],
      dependencies: ["AWS Account Provisioning"],
      security: ["Findings"],
      cost: [],
      observability: ["Exposure trend"],
      useCases: ["Pre-prod", "Continuous"],
      antiPatterns: ["0.0.0.0/0 anywhere"],
      kpis: [{ name: "Public exposure", value: "0 critical" }],
      sla: "P90 ≤ 5 min",
      adoption: { consumers: 1200, runs: "740 / mo", teams: 64 },
      related: ["Security Baseline Validation"],
      owner: "Security Platform",
      platformOwner: "Security Engineering",
      lastUpdate: "Today",
    },
  },
  {
    id: "patch-audit",
    name: "Patch Compliance Audit",
    category: "Security",
    icon: FileCheck,
    iconColor: "text-blue-600",
    tile: "bg-blue-50",
    blurb: "Scan and validate patch compliance across instances and containers.",
    provisionMin: 15,
    consumers: 934,
    rating: 4.6,
    trend: trend(64, 6),
    status: "healthy",
    tags: ["patch", "compliance"],
    hover: {
      does: "Reports on patch state and missing critical updates.",
      consumer: "Security · Ops",
      outcomes: ["Patch report", "Risk scoring"],
      consumption: "934 scans · 12% MTTR drop",
      business: "Defensible compliance posture.",
      reliability: "Fewer vuln-driven incidents.",
      cost: "—",
      security: "Closes critical CVEs faster.",
    },
    panel: {
      overview: "Builds a fleet patch compliance view with risk scoring.",
      operational: "Replaces the spreadsheet.",
      business: "Audit-ready, on-demand.",
      consumer: "Security, ops.",
      workflow: ["Scan", "Score", "Notify"],
      inputs: ["Fleet"],
      outputs: ["Report"],
      architecture: ["SSM", "Tanium"],
      dependencies: [],
      security: [],
      cost: [],
      observability: ["Compliance trend"],
      useCases: ["Audit", "Monthly review"],
      antiPatterns: ["Manual sampling"],
      kpis: [{ name: "Patched within SLA", value: "94%" }],
      sla: "P90 ≤ 25 min",
      adoption: { consumers: 934, runs: "120 / mo", teams: 38 },
      related: [],
      owner: "Security Platform",
      platformOwner: "Security Engineering",
      lastUpdate: "1 day ago",
    },
  },
  {
    id: "iam-review",
    name: "IAM Access Review",
    category: "Security",
    icon: KeyRound,
    iconColor: "text-violet-600",
    tile: "bg-violet-50",
    blurb: "Review IAM roles and permissions for least privilege and access risks.",
    provisionMin: 8,
    consumers: 876,
    rating: 4.6,
    trend: trend(60, 5),
    status: "healthy",
    tags: ["iam", "least-privilege"],
    hover: {
      does: "Identifies role sprawl, standing privilege, and dormant access.",
      consumer: "Security · IAM",
      outcomes: ["Right-sized roles", "Closed gaps"],
      consumption: "876 reviews · 41% sprawl reduction",
      business: "Lateral-movement risk drops.",
      reliability: "—",
      cost: "—",
      security: "Continuous least-privilege.",
    },
    panel: {
      overview: "Inspects IAM roles and surfaces sprawl, standing privilege, and dormant access.",
      operational: "Drives quarterly access certifications.",
      business: "Lower breach blast-radius.",
      consumer: "IAM and security.",
      workflow: ["Scan", "Score", "Certify"],
      inputs: ["Account", "Owner"],
      outputs: ["Findings", "Workflow"],
      architecture: ["IAM Access Analyzer"],
      dependencies: [],
      security: [],
      cost: [],
      observability: ["Sprawl trend"],
      useCases: ["Quarterly certs"],
      antiPatterns: ["Wildcard policies"],
      kpis: [{ name: "Standing privilege", value: "−41% yoy" }],
      sla: "P90 ≤ 10 min",
      adoption: { consumers: 876, runs: "60 / mo", teams: 28 },
      related: [],
      owner: "Security Platform",
      platformOwner: "Security Engineering",
      lastUpdate: "3 days ago",
    },
  },
  {
    id: "sec-baseline",
    name: "Security Baseline Validation",
    category: "Security",
    icon: ShieldAlert,
    iconColor: "text-sky-600",
    tile: "bg-sky-50",
    blurb: "Validate CIS benchmarks, encryption, logging and guardrail compliance.",
    provisionMin: 10,
    consumers: 1100,
    rating: 4.7,
    trend: trend(76, 5),
    status: "healthy",
    tags: ["cis", "baseline"],
    hover: {
      does: "Checks CIS benchmarks, encryption, logging, and guardrails.",
      consumer: "Security · Audit",
      outcomes: ["CIS posture", "Encryption report"],
      consumption: "1,100 scans · 98.7% compliant",
      business: "Pre-built audit evidence.",
      reliability: "Encryption + logging baselines.",
      cost: "—",
      security: "Continuous compliance.",
    },
    panel: {
      overview: "Validates accounts and workloads against CIS, NIST, HIPAA controls.",
      operational: "Audit-ready, continuously.",
      business: "Faster audits, fewer findings.",
      consumer: "Security, audit, compliance.",
      workflow: ["Scan", "Score", "Evidence pack"],
      inputs: ["Account"],
      outputs: ["Report", "Evidence"],
      architecture: ["Prowler", "Steampipe"],
      dependencies: ["AWS Account Provisioning"],
      security: [],
      cost: [],
      observability: ["Compliance score"],
      useCases: ["Pre-audit", "Continuous"],
      antiPatterns: ["Point-in-time only"],
      kpis: [{ name: "Compliance", value: "98.7%" }],
      sla: "P90 ≤ 15 min",
      adoption: { consumers: 1100, runs: "180 / mo", teams: 44 },
      related: ["Security Group Validation"],
      owner: "Security Platform",
      platformOwner: "Security Engineering",
      lastUpdate: "Today",
    },
  },

  /* ---- Developer Productivity ---- */
  {
    id: "pipeline-gen",
    name: "CI/CD Pipeline Generator",
    category: "Developer Productivity",
    icon: GitBranch,
    iconColor: "text-indigo-600",
    tile: "bg-indigo-50",
    blurb: "Generate a paved-road GitHub Actions pipeline with security & quality gates.",
    provisionMin: 4,
    consumers: 1450,
    rating: 4.8,
    trend: trend(88, 5),
    status: "healthy",
    tags: ["cicd", "github-actions"],
    hover: {
      does: "Bootstraps a paved-road pipeline with security and quality gates.",
      consumer: "Developers",
      outcomes: ["Pipeline", "Gates", "Release flow"],
      consumption: "1,450 repos onboarded",
      business: "Faster, safer releases.",
      reliability: "Built-in tests + canary.",
      cost: "—",
      security: "SAST, SCA, secret scanning.",
    },
    panel: {
      overview: "Generates a GitHub Actions pipeline with build, test, security gates, and progressive release.",
      operational: "One paved road. No bespoke pipelines.",
      business: "Faster lead time + lower change failure rate.",
      consumer: "Every product team.",
      workflow: ["Pick template", "Bind repo", "Apply gates", "Ship"],
      inputs: ["Repo", "Language", "Targets"],
      outputs: ["Pipeline", "Gates"],
      architecture: ["GitHub Actions", "ArgoCD"],
      dependencies: ["Repository Bootstrap"],
      security: ["SAST", "SCA", "Secret scan"],
      cost: ["Runner sizing"],
      observability: ["DORA metrics"],
      useCases: ["New service", "Pipeline modernization"],
      antiPatterns: ["Per-team forks of base pipeline"],
      kpis: [{ name: "Deployment frequency", value: "+38%" }, { name: "CFR", value: "4.1%" }],
      sla: "P90 ≤ 5 min",
      adoption: { consumers: 1450, runs: "640 / mo", teams: 104 },
      related: ["Repository Bootstrap", "Release Readiness Assessment"],
      ai: ["Gate suggestions"],
      owner: "Developer Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "Today",
    },
  },
  {
    id: "repo-bootstrap",
    name: "Repository Bootstrap",
    category: "Developer Productivity",
    icon: FolderGit2,
    iconColor: "text-slate-700",
    tile: "bg-slate-100",
    blurb: "Create a repo with branch policies, security controls, templates and scanning.",
    provisionMin: 3,
    consumers: 1320,
    rating: 4.8,
    trend: trend(90, 5),
    status: "healthy",
    tags: ["github", "bootstrap"],
    hover: {
      does: "Creates a repo with branch policies, templates, and scanning enabled.",
      consumer: "Developers",
      outcomes: ["Repo", "Policies", "Scanning"],
      consumption: "1,320 repos · 100% policy coverage",
      business: "Consistent dev experience.",
      reliability: "—",
      cost: "—",
      security: "Branch protections + scanning on day 1.",
    },
    panel: {
      overview: "Bootstraps a new repo with policies, CODEOWNERS, templates, and scanning.",
      operational: "No more 'I forgot to enable scanning'.",
      business: "Faster start, fewer footguns.",
      consumer: "Every developer.",
      workflow: ["Pick template", "Create repo", "Apply policies"],
      inputs: ["Template", "Owners"],
      outputs: ["Repo"],
      architecture: ["GitHub", "Renovate"],
      dependencies: [],
      security: ["Branch protection", "Code scanning", "Secret scanning"],
      cost: [],
      observability: [],
      useCases: ["New service", "POC"],
      antiPatterns: ["Personal-account repos"],
      kpis: [{ name: "Repos bootstrapped", value: "1.3k" }],
      sla: "P90 ≤ 3 min",
      adoption: { consumers: 1320, runs: "740 / mo", teams: 96 },
      related: ["CI/CD Pipeline Generator"],
      owner: "Developer Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "Yesterday",
    },
  },
  {
    id: "release-ready",
    name: "Release Readiness Assessment",
    category: "Developer Productivity",
    icon: Rocket,
    iconColor: "text-rose-600",
    tile: "bg-rose-50",
    blurb: "Score readiness: documentation, rollback, monitoring and alerting.",
    provisionMin: 5,
    consumers: 880,
    rating: 4.6,
    trend: trend(64, 5),
    status: "healthy",
    tags: ["release", "readiness"],
    hover: {
      does: "Scores a release on docs, rollback, monitoring, and alerts.",
      consumer: "Release captains · SRE",
      outcomes: ["Readiness score", "Gap list"],
      consumption: "880 releases · 33% lower CFR",
      business: "Fewer rollbacks, happier customers.",
      reliability: "Releases ship with the rails on.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Pre-release scan of docs, rollback plan, monitoring, and alerts.",
      operational: "Blocks risky launches with evidence.",
      business: "Higher release success rate.",
      consumer: "Release captains.",
      workflow: ["Scan", "Score", "Approve / block"],
      inputs: ["Release", "Service"],
      outputs: ["Score", "Findings"],
      architecture: ["Backstage", "GitHub"],
      dependencies: ["CI/CD Pipeline Generator"],
      security: [],
      cost: [],
      observability: [],
      useCases: ["Pre-release gate"],
      antiPatterns: ["Skipping the rollback plan"],
      kpis: [{ name: "Release success", value: "97.8%" }],
      sla: "P90 ≤ 5 min",
      adoption: { consumers: 880, runs: "240 / mo", teams: 64 },
      related: ["Deployment Risk Analysis"],
      owner: "Developer Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "2 days ago",
    },
  },
  {
    id: "deploy-risk",
    name: "Deployment Risk Analysis",
    category: "Developer Productivity",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    tile: "bg-amber-50",
    blurb: "Analyze code, infra, and dependency risk before each deploy.",
    provisionMin: 4,
    consumers: 720,
    rating: 4.6,
    trend: trend(58, 5),
    status: "new",
    tags: ["risk", "deploy"],
    hover: {
      does: "Risk-scores each deploy across code, infra, and dependency changes.",
      consumer: "Release captains · SRE",
      outcomes: ["Risk score", "Blast radius"],
      consumption: "720 deploys analyzed",
      business: "Confidence to ship faster.",
      reliability: "Catches risky changes before customers do.",
      cost: "—",
      security: "Flags risky infra changes.",
    },
    panel: {
      overview: "ML-assisted risk scoring per deploy across code, infra, dependencies.",
      operational: "Inputs the change advisory needs without the meeting.",
      business: "Higher ship rate at the same risk profile.",
      consumer: "Release captains.",
      workflow: ["Analyze", "Score", "Recommend"],
      inputs: ["Diff", "Service"],
      outputs: ["Risk score", "Notes"],
      architecture: ["GitHub", "Dependency Graph"],
      dependencies: ["Dependency Mapping"],
      security: [],
      cost: [],
      observability: [],
      useCases: ["Pre-deploy gate"],
      antiPatterns: ["Big-bang Friday deploys"],
      kpis: [{ name: "Risky catch rate", value: "92%" }],
      sla: "P90 ≤ 4 min",
      adoption: { consumers: 720, runs: "1.1k / mo", teams: 58 },
      related: ["Release Readiness Assessment"],
      ai: ["Diff explanation"],
      owner: "Developer Platform",
      platformOwner: "Platform Engineering",
      lastUpdate: "1 week ago",
    },
  },

  /* ---- Acquisition Integration ---- */
  {
    id: "acq-assess",
    name: "Acquisition Assessment",
    category: "Acquisition Integration",
    icon: Building2,
    iconColor: "text-indigo-600",
    tile: "bg-indigo-50",
    blurb: "Assess an acquired company's tech, security, and reliability posture.",
    provisionMin: 30,
    consumers: 42,
    rating: 4.7,
    trend: trend(40, 5),
    status: "healthy",
    tags: ["m&a", "assessment"],
    hover: {
      does: "Runs a 360° tech + security + reliability assessment of an acquired company.",
      consumer: "M&A · Platform · Security",
      outcomes: ["Readiness score", "Integration plan"],
      consumption: "42 acquisitions onboarded",
      business: "Time-to-integrate shrinks by 60%.",
      reliability: "Standards applied from day 1.",
      cost: "Identifies redundant spend.",
      security: "Closes drift before it ships.",
    },
    panel: {
      overview: "Inventories systems, scores posture, and produces an integration plan.",
      operational: "M&A becomes an industrial process, not heroics.",
      business: "Faster value capture from acquisitions.",
      consumer: "Corp dev, platform, security.",
      workflow: ["Inventory", "Score", "Plan"],
      inputs: ["Target company"],
      outputs: ["Score", "Plan", "Backlog"],
      architecture: ["Discovery agents", "CMDB"],
      dependencies: [],
      security: ["Baseline scan"],
      cost: ["Cost mapping"],
      observability: ["Coverage report"],
      useCases: ["Pre-close", "Day-1", "Day-90"],
      antiPatterns: ["Spreadsheet-driven integration"],
      kpis: [{ name: "TTI reduction", value: "−60%" }],
      sla: "P90 ≤ 45 min",
      adoption: { consumers: 42, runs: "6 / qtr", teams: 12 },
      related: ["Identity Integration", "Migration Factory"],
      owner: "Acquisition Integration",
      platformOwner: "Platform Engineering",
      lastUpdate: "2 weeks ago",
    },
  },
  {
    id: "id-integration",
    name: "Identity Integration",
    category: "Acquisition Integration",
    icon: KeyRound,
    iconColor: "text-violet-600",
    tile: "bg-violet-50",
    blurb: "Integrate identity systems for acquired companies with SSO and MFA.",
    provisionMin: 60,
    consumers: 38,
    rating: 4.6,
    trend: trend(38, 4),
    status: "healthy",
    tags: ["identity", "sso", "mfa"],
    hover: {
      does: "Federates identity into corporate IdP with SSO and MFA.",
      consumer: "IAM · Platform",
      outcomes: ["SSO", "MFA", "Lifecycle"],
      consumption: "38 acquisitions integrated",
      business: "One identity. One audit trail.",
      reliability: "—",
      cost: "Sunset duplicate IdPs.",
      security: "MFA everywhere from day 1.",
    },
    panel: {
      overview: "Federates an acquired company into the corporate IdP with SSO, MFA, and lifecycle.",
      operational: "Identity is the first integration milestone.",
      business: "Day-1 access without compromising security.",
      consumer: "IAM, HR systems.",
      workflow: ["Discover", "Federate", "Migrate", "Sunset"],
      inputs: ["IdP", "Directory"],
      outputs: ["Federation", "Lifecycle"],
      architecture: ["Okta", "Entra ID"],
      dependencies: [],
      security: ["MFA"],
      cost: [],
      observability: [],
      useCases: ["Day-1 access"],
      antiPatterns: ["Manual account creation"],
      kpis: [{ name: "Day-1 access", value: "100%" }],
      sla: "P90 ≤ 90 min",
      adoption: { consumers: 38, runs: "4 / qtr", teams: 8 },
      related: ["Acquisition Assessment"],
      owner: "Acquisition Integration",
      platformOwner: "Platform Engineering",
      lastUpdate: "3 weeks ago",
    },
  },
  {
    id: "monitor-std",
    name: "Monitoring Standardization",
    category: "Acquisition Integration",
    icon: Eye,
    iconColor: "text-fuchsia-600",
    tile: "bg-fuchsia-50",
    blurb: "Standardize monitoring across acquired systems within 30 days.",
    provisionMin: 45,
    consumers: 32,
    rating: 4.5,
    trend: trend(34, 5),
    status: "healthy",
    tags: ["monitoring", "standardize"],
    hover: {
      does: "Wires acquired services into the standard observability stack.",
      consumer: "Platform · SRE",
      outcomes: ["Coverage", "SLIs", "Alerts"],
      consumption: "32 portfolios standardized",
      business: "Visibility from day 30.",
      reliability: "Same playbooks apply.",
      cost: "Sunset duplicate observability stacks.",
      security: "—",
    },
    panel: {
      overview: "Brings acquired services to the standard observability platform with SLIs and alerts.",
      operational: "Same dashboards. Same alerts. Same playbooks.",
      business: "Consistent customer experience reporting.",
      consumer: "Platform, SRE.",
      workflow: ["Discover", "Instrument", "Validate", "Cutover"],
      inputs: ["Inventory"],
      outputs: ["Dashboards", "Alerts"],
      architecture: ["Datadog", "OpenTelemetry"],
      dependencies: ["Datadog Onboarding"],
      security: [],
      cost: [],
      observability: ["Coverage"],
      useCases: ["Day-30 milestone"],
      antiPatterns: ["Maintaining the acquired stack indefinitely"],
      kpis: [{ name: "Coverage", value: "96%" }],
      sla: "P90 ≤ 60 min",
      adoption: { consumers: 32, runs: "3 / qtr", teams: 7 },
      related: ["Acquisition Assessment"],
      owner: "Acquisition Integration",
      platformOwner: "Platform Engineering",
      lastUpdate: "1 month ago",
    },
  },
  {
    id: "migration-factory",
    name: "Migration Factory",
    category: "Acquisition Integration",
    icon: Workflow,
    iconColor: "text-blue-600",
    tile: "bg-blue-50",
    blurb: "Industrialized migration of acquired workloads to standard platforms.",
    provisionMin: 90,
    consumers: 24,
    rating: 4.6,
    trend: trend(30, 4),
    status: "healthy",
    tags: ["migration", "factory"],
    hover: {
      does: "Industrialized waves of workload migration to standard platforms.",
      consumer: "Platform · App Eng",
      outcomes: ["Migrated workloads", "Risk-controlled cutover"],
      consumption: "24 programs · 14k workloads",
      business: "TCO down, reliability up.",
      reliability: "Lift to a proven platform.",
      cost: "Sunset acquired infra.",
      security: "Baseline applied at cutover.",
    },
    panel: {
      overview: "Wave-based migration of acquired workloads to standard platforms with risk-controlled cutovers.",
      operational: "Replaces bespoke migration projects.",
      business: "Predictable TCO and value capture.",
      consumer: "Platform, application engineering.",
      workflow: ["Discover", "Wave plan", "Migrate", "Cutover", "Sunset"],
      inputs: ["Portfolio"],
      outputs: ["Migrated services"],
      architecture: ["Terraform", "CloudEndure", "ArgoCD"],
      dependencies: ["Acquisition Assessment"],
      security: [],
      cost: ["Sunset plan"],
      observability: ["Wave dashboard"],
      useCases: ["Post-acquisition"],
      antiPatterns: ["Big-bang migrations"],
      kpis: [{ name: "Cutover success", value: "98.4%" }],
      sla: "P90 ≤ 120 min",
      adoption: { consumers: 24, runs: "2 / qtr", teams: 18 },
      related: ["Acquisition Assessment"],
      owner: "Acquisition Integration",
      platformOwner: "Platform Engineering",
      lastUpdate: "1 month ago",
    },
  },

  /* ---- AI Operations ---- */
  {
    id: "incident-investigator",
    name: "Incident Investigator",
    category: "AI Operations",
    icon: Brain,
    iconColor: "text-fuchsia-600",
    tile: "bg-fuchsia-50",
    blurb: "AI analyzes logs, metrics, traces, changes, and dependencies for RCA.",
    provisionMin: 1,
    consumers: 540,
    rating: 4.7,
    trend: trend(90, 6),
    status: "new",
    tags: ["ai", "rca"],
    hover: {
      does: "Synthesizes telemetry to propose probable root causes.",
      consumer: "On-call · SRE",
      outcomes: ["Probable root cause", "Evidence"],
      consumption: "540 incidents assisted",
      business: "MTTR down ~38%.",
      reliability: "Faster recovery, fewer repeats.",
      cost: "—",
      security: "Read-only access scoped.",
    },
    panel: {
      overview: "Joins logs, metrics, traces, and recent changes to propose probable root causes.",
      operational: "Augments — does not replace — on-call engineers.",
      business: "MTTR reduction translates directly to revenue protected.",
      consumer: "On-call engineers and incident commanders.",
      workflow: ["Trigger", "Collect", "Reason", "Recommend"],
      inputs: ["Incident ID"],
      outputs: ["RCA hypothesis", "Evidence"],
      architecture: ["Lovable AI Gateway", "OTel"],
      dependencies: ["Datadog Onboarding", "Dependency Mapping"],
      security: ["Scoped read access"],
      cost: ["Per-incident token budget"],
      observability: ["Acceptance rate"],
      useCases: ["Major incidents", "Repeat incidents"],
      antiPatterns: ["Letting AI close incidents alone"],
      kpis: [{ name: "MTTR delta", value: "−38%" }],
      sla: "P90 ≤ 90s",
      adoption: { consumers: 540, runs: "1.4k / mo", teams: 64 },
      related: ["Alert Optimization", "Dependency Mapping"],
      ai: ["RCA", "Evidence summary", "Repeat-incident clustering"],
      owner: "AI Operations",
      platformOwner: "Reliability Platform",
      lastUpdate: "This week",
    },
  },
  {
    id: "patch-coord",
    name: "Patch Coordinator",
    category: "AI Operations",
    icon: Wand2,
    iconColor: "text-amber-600",
    tile: "bg-amber-50",
    blurb: "AI plans risk-aware patch rollout: risk, dependencies, testing, strategy.",
    provisionMin: 2,
    consumers: 410,
    rating: 4.5,
    trend: trend(70, 6),
    status: "new",
    tags: ["ai", "patch"],
    hover: {
      does: "Plans a risk-aware patch rollout with dependency awareness.",
      consumer: "Platform · Security",
      outcomes: ["Rollout plan", "Risk profile"],
      consumption: "410 rollouts planned",
      business: "Faster CVE closure.",
      reliability: "Safer patching cadence.",
      cost: "—",
      security: "Closes critical CVEs sooner.",
    },
    panel: {
      overview: "Plans patch rollouts ranked by risk and dependency awareness.",
      operational: "Replaces the patch spreadsheet.",
      business: "Audit-ready remediation pace.",
      consumer: "Platform, security.",
      workflow: ["Analyze", "Plan", "Sequence", "Validate"],
      inputs: ["CVE list", "Fleet"],
      outputs: ["Plan", "Sequencing"],
      architecture: ["Lovable AI Gateway"],
      dependencies: ["Patch Compliance Audit"],
      security: [],
      cost: [],
      observability: [],
      useCases: ["Zero-day", "Monthly patching"],
      antiPatterns: ["Patch everything at once"],
      kpis: [{ name: "CVE MTTR", value: "−42%" }],
      sla: "P90 ≤ 2 min",
      adoption: { consumers: 410, runs: "120 / mo", teams: 28 },
      related: ["Patch Compliance Audit"],
      ai: ["Risk ranking", "Sequencing"],
      owner: "AI Operations",
      platformOwner: "Security Engineering",
      lastUpdate: "2 weeks ago",
    },
  },
  {
    id: "cost-analyst",
    name: "Cloud Cost Analyst",
    category: "AI Operations",
    icon: PiggyBank,
    iconColor: "text-emerald-600",
    tile: "bg-emerald-50",
    blurb: "AI analyzes compute, storage, network, RIs, and Savings Plans.",
    provisionMin: 3,
    consumers: 384,
    rating: 4.6,
    trend: trend(76, 6),
    status: "healthy",
    tags: ["ai", "finops"],
    hover: {
      does: "Continuously analyzes cloud spend and recommends savings.",
      consumer: "FinOps · Platform",
      outcomes: ["Savings recommendations"],
      consumption: "$4.8M annualized savings",
      business: "Direct cost-down.",
      reliability: "Right-size without sacrificing reliability.",
      cost: "Largest single ROI on this page.",
      security: "—",
    },
    panel: {
      overview: "Reviews compute, storage, network, RIs, and Savings Plans with recommended actions.",
      operational: "Replaces quarterly FinOps consulting work.",
      business: "$4.8M annualized savings.",
      consumer: "FinOps and platform engineering.",
      workflow: ["Analyze", "Recommend", "Approve", "Apply"],
      inputs: ["Cost data"],
      outputs: ["Recommendations"],
      architecture: ["CUR", "Lovable AI Gateway"],
      dependencies: [],
      security: [],
      cost: ["Direct savings"],
      observability: ["Savings realized"],
      useCases: ["Quarterly review", "Pre-budget cycle"],
      antiPatterns: ["Buying RIs without analysis"],
      kpis: [{ name: "Annualized savings", value: "$4.8M" }],
      sla: "P90 ≤ 3 min",
      adoption: { consumers: 384, runs: "60 / mo", teams: 18 },
      related: [],
      ai: ["RI/SP modeling", "Right-sizing"],
      owner: "AI Operations",
      platformOwner: "Cloud Platform",
      lastUpdate: "Last week",
    },
  },
  {
    id: "runbook-gen",
    name: "Runbook Generator",
    category: "AI Operations",
    icon: BookOpen,
    iconColor: "text-indigo-600",
    tile: "bg-indigo-50",
    blurb: "AI creates runbooks, recovery plans, and escalation trees.",
    provisionMin: 2,
    consumers: 296,
    rating: 4.5,
    trend: trend(60, 6),
    status: "new",
    tags: ["ai", "runbook"],
    hover: {
      does: "Generates a runbook from service signals and prior incidents.",
      consumer: "Service Owners · SRE",
      outcomes: ["Runbook", "Escalation tree"],
      consumption: "296 runbooks generated",
      business: "Faster on-call ramp.",
      reliability: "Coverage closes the gap that causes long incidents.",
      cost: "—",
      security: "—",
    },
    panel: {
      overview: "Generates runbooks, recovery plans, and escalation trees from service context.",
      operational: "Closes runbook coverage gaps fast.",
      business: "Faster incident response and quicker on-call ramp.",
      consumer: "Service owners.",
      workflow: ["Analyze", "Draft", "Review", "Publish"],
      inputs: ["Service"],
      outputs: ["Runbook", "Escalation tree"],
      architecture: ["Lovable AI Gateway"],
      dependencies: ["Service Health Dashboard"],
      security: [],
      cost: [],
      observability: ["Coverage"],
      useCases: ["Pre-GA", "Post-acquisition"],
      antiPatterns: ["AI runbook published without review"],
      kpis: [{ name: "Coverage delta", value: "+34%" }],
      sla: "P90 ≤ 2 min",
      adoption: { consumers: 296, runs: "80 / mo", teams: 32 },
      related: ["Incident Readiness Assessment"],
      ai: ["Draft", "Update suggestions"],
      owner: "AI Operations",
      platformOwner: "Reliability Platform",
      lastUpdate: "This week",
    },
  },
];

const CATEGORIES: { name: AutomationCategory | "All"; icon: LucideIcon; color: string }[] = [
  { name: "All", icon: LayoutGrid, color: "text-slate-700" },
  { name: "Cloud Platform", icon: Cloud, color: "text-sky-600" },
  { name: "Reliability Engineering", icon: Target, color: "text-rose-600" },
  { name: "Observability", icon: Eye, color: "text-fuchsia-600" },
  { name: "Security", icon: ShieldCheck, color: "text-emerald-600" },
  { name: "Developer Productivity", icon: GitBranch, color: "text-indigo-600" },
  { name: "Acquisition Integration", icon: Building2, color: "text-blue-600" },
  { name: "AI Operations", icon: Brain, color: "text-fuchsia-600" },
];

const EXEC_METRICS = [
  { id: "req", label: "Self-Service Requests", value: 12847, suffix: "", icon: Zap, accent: "text-blue-600", bg: "bg-blue-50", delta: "+24%", sub: "Last 30 days", trendData: trend(120, 12) },
  { id: "tix", label: "Tickets Eliminated", value: 68, suffix: "%", icon: CheckCircle2, accent: "text-emerald-600", bg: "bg-emerald-50", delta: "+18%", sub: "vs. manual process", trendData: trend(60, 4) },
  { id: "prov", label: "Avg. Provisioning Time", value: 12, suffix: " min", icon: Clock, accent: "text-violet-600", bg: "bg-violet-50", delta: "−62%", sub: "vs. manual", trendData: trend(20, 4) },
  { id: "hrs", label: "Engineering Hours Saved", value: 4120, suffix: "", icon: Users, accent: "text-orange-600", bg: "bg-orange-50", delta: "+31%", sub: "Last 30 days", trendData: trend(110, 10) },
  { id: "auto", label: "Automated Actions", value: 1.2, suffix: "M", icon: Bot, accent: "text-blue-600", bg: "bg-blue-50", delta: "+27%", sub: "Last 30 days", trendData: trend(130, 14) },
  { id: "adopt", label: "Platform Adoption", value: 93, suffix: "%", icon: BarChart3, accent: "text-fuchsia-600", bg: "bg-fuchsia-50", delta: "+12%", sub: "Active teams", trendData: trend(90, 3) },
];

/* ------------------------------------------------------------------ */
/*  UI                                                                  */
/* ------------------------------------------------------------------ */
function Spark({ data, color = "hsl(var(--primary))" }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-7 w-full">
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

function StatusDot({ status }: { status: Automation["status"] }) {
  const color =
    status === "healthy" ? "bg-emerald-500"
    : status === "degraded" ? "bg-amber-500"
    : "bg-blue-500";
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

function AutomationTile({
  a, onOpen,
}: { a: Automation; onOpen: (a: Automation) => void }) {
  const Icon = a.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onOpen(a)}
          className="group relative text-left rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {/* glow */}
          <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent" />

          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-lg ${a.tile} grid place-items-center transition-transform duration-200 group-hover:scale-105`}>
              <Icon className={`h-5 w-5 ${a.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="text-[13.5px] font-semibold text-foreground leading-tight">{a.name}</div>
                <StatusDot status={a.status} />
              </div>
              <div className="mt-1">
                <Badge variant="secondary" className="text-[10.5px] font-medium">Self-Service</Badge>
                {a.status === "new" && <Badge className="ml-1 text-[10.5px] bg-blue-600 hover:bg-blue-600 text-white">New</Badge>}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] text-muted-foreground line-clamp-2 leading-snug">{a.blurb}</p>

          <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.provisionMin} min</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {fmt(a.consumers)}</span>
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {a.rating.toFixed(1)}</span>
          </div>

          <div className="mt-2 -mx-1">
            <Spark data={a.trend} color="#3b82f6" />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-sm p-0 overflow-hidden">
        <div className="bg-popover text-popover-foreground">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
            <Icon className={`h-4 w-4 ${a.iconColor}`} />
            <div className="text-xs font-semibold">{a.name}</div>
            <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">{a.category}</span>
          </div>
          <div className="px-3 py-2.5 space-y-1.5 text-[12px]">
            <div><span className="text-muted-foreground">What it does: </span>{a.hover.does}</div>
            <div><span className="text-muted-foreground">Consumer: </span>{a.hover.consumer}</div>
            <div><span className="text-muted-foreground">Provision time: </span>{a.provisionMin} min</div>
            <div><span className="text-muted-foreground">Outcomes: </span>{a.hover.outcomes.join(" · ")}</div>
            <div><span className="text-muted-foreground">Consumption: </span>{a.hover.consumption}</div>
            <div className="pt-1 grid grid-cols-2 gap-1 border-t border-border/60 mt-1">
              <div className="text-[11px]"><span className="text-muted-foreground">Business: </span>{a.hover.business}</div>
              <div className="text-[11px]"><span className="text-muted-foreground">Reliability: </span>{a.hover.reliability}</div>
              <div className="text-[11px]"><span className="text-muted-foreground">Cost: </span>{a.hover.cost}</div>
              <div className="text-[11px]"><span className="text-muted-foreground">Security: </span>{a.hover.security}</div>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function CategorySection({
  category, items, onOpen,
}: { category: AutomationCategory; items: Automation[]; onOpen: (a: Automation) => void }) {
  const meta = CATEGORIES.find((c) => c.name === category)!;
  const Icon = meta.icon;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${meta.color}`} />
          <h2 className="text-[14px] font-semibold text-foreground">{category} Services</h2>
        </div>
        <button className="text-[12px] text-primary hover:underline inline-flex items-center gap-1">
          View all ({items.length}) <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.slice(0, 4).map((a) => (
          <AutomationTile key={a.id} a={a} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function AutomationMarketplace() {
  const [active, setActive] = useState<Automation | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<AutomationCategory | "All">("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return AUTOMATIONS.filter((a) => {
      const matchesQ = query.trim() === "" || a.name.toLowerCase().includes(query.toLowerCase()) || a.tags.some((t) => t.includes(query.toLowerCase()));
      const matchesC = selectedCat === "All" || a.category === selectedCat;
      return matchesQ && matchesC;
    });
  }, [query, selectedCat]);

  const grouped = useMemo(() => {
    const groups: Record<AutomationCategory, Automation[]> = {
      "Cloud Platform": [], "Reliability Engineering": [], "Observability": [],
      "Security": [], "Developer Productivity": [], "Acquisition Integration": [], "AI Operations": [],
    };
    filtered.forEach((a) => groups[a.category].push(a));
    return groups;
  }, [filtered]);

  const totals = useMemo(() => ({
    automations: AUTOMATIONS.length,
    teams: 104,
    runs30d: AUTOMATIONS.reduce((s, a) => s + a.consumers, 0),
  }), []);

  return (
    <AppShell>
      <TooltipProvider delayDuration={120}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b border-border bg-white">
            <div className="px-6 py-5 flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Boxes className="h-3.5 w-3.5" /> Reliability Platform · Internal Engineering Marketplace
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                  Product Reliability Automation Marketplace
                  <Star className="h-4 w-4 text-amber-500" />
                </h1>
                <p className="mt-1 text-[13.5px] text-muted-foreground max-w-3xl">
                  Self-service operational capabilities, platform services, and reliability automations available to engineering teams.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search automations, services, or components…"
                    className="pl-8 w-[360px] h-9 text-[13px]"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5">⌘K</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 pb-3 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = selectedCat === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedCat(c.name)}
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[12px] border transition ${
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card border-border text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-background" : c.color}`} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5"><Filter className="h-3.5 w-3.5" /> Sort: Popularity</Button>
                <div className="inline-flex border border-border rounded-md overflow-hidden">
                  <button onClick={() => setView("grid")} className={`h-8 w-8 grid place-items-center ${view === "grid" ? "bg-muted" : "bg-card"}`}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setView("list")} className={`h-8 w-8 grid place-items-center ${view === "list" ? "bg-muted" : "bg-card"}`}>
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main grid: catalog + live platform */}
          <div className="px-6 py-5 grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-9 space-y-6">
              {(Object.keys(grouped) as AutomationCategory[])
                .filter((c) => grouped[c].length > 0)
                .map((c) => (
                  <CategorySection key={c} category={c} items={grouped[c]} onOpen={setActive} />
                ))}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-[13px]">
                  No automations match this filter.
                </div>
              )}
            </div>

            {/* Right rail: Live platform visualization */}
            <aside className="col-span-12 xl:col-span-3 space-y-4">
              <LivePlatformPanel />
              <PrinciplesPanel />
            </aside>
          </div>

          {/* Executive metrics */}
          <div className="px-6 pb-8">
            <div className="rounded-xl border border-border bg-white overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
                {EXEC_METRICS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.id} className="bg-card p-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg ${m.bg} grid place-items-center`}>
                          <Icon className={`h-4 w-4 ${m.accent}`} />
                        </div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.label}</div>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <CountUp value={m.value} suffix={m.suffix} />
                        <span className={`text-[11px] ${m.delta.startsWith("−") ? "text-emerald-600" : "text-emerald-600"}`}>{m.delta}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{m.sub}</div>
                      <Spark data={m.trendData} color="#3b82f6" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sheet panel */}
        <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl xl:max-w-3xl overflow-y-auto">
            {active && <DetailPanel a={active} />}
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Live platform / principles                                          */
/* ------------------------------------------------------------------ */
function LivePlatformPanel() {
  // pseudo-live activity
  const activity = useMemo(() => [
    { svc: "AWS Account Provisioning", team: "Claims", t: "12s ago" },
    { svc: "SLO Creation Wizard", team: "Payroll", t: "48s ago" },
    { svc: "Datadog Onboarding", team: "Caregiver Mobile", t: "1m ago" },
    { svc: "Security Group Validation", team: "Platform", t: "2m ago" },
    { svc: "Incident Investigator", team: "SRE", t: "4m ago" },
  ], []);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-border bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-3.5 w-3.5 text-blue-600" />
          <div className="text-[12px] font-semibold uppercase tracking-wider text-foreground">Live Platform</div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Services", v: 197 },
          { l: "Consumers", v: 104 },
          { l: "Runs / hr", v: 142 },
        ].map((s) => (
          <div key={s.l} className="rounded-md bg-muted/50 p-2">
            <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{s.l}</div>
            <div className="text-[15px] font-semibold text-foreground tabular-nums">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-3 space-y-1.5">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Recent activity</div>
        {activity.map((row, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-foreground/90 truncate">{row.svc}</span>
            <span className="ml-auto text-muted-foreground">{row.team} · {row.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrinciplesPanel() {
  const principles = [
    { i: CheckCircle2, t: "Self-Service First", d: "Anything that needs a ticket is an automation we haven't built yet." },
    { i: ShieldCheck, t: "Guardrails by Default", d: "Security, cost, observability — wired in, not bolted on." },
    { i: Sparkles, t: "Reusable Building Blocks", d: "One paved road. Many product teams." },
    { i: TrendingUp, t: "Prevention Over Reaction", d: "Catch it in CI/CD. Catch it at provision. Catch it before customers do." },
  ];
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-3.5 py-2.5 border-b border-border bg-gradient-to-r from-slate-50 to-white text-[12px] font-semibold uppercase tracking-wider text-foreground">
        Operating Principles
      </div>
      <div className="p-3 space-y-2.5">
        {principles.map((p, i) => {
          const Icon = p.i;
          return (
            <div key={i} className="flex gap-2.5">
              <div className="h-7 w-7 shrink-0 rounded-full bg-muted grid place-items-center"><Icon className="h-3.5 w-3.5 text-foreground/80" /></div>
              <div>
                <div className="text-[12px] font-semibold text-foreground">{p.t}</div>
                <div className="text-[11.5px] text-muted-foreground leading-snug">{p.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CountUp                                                             */
/* ------------------------------------------------------------------ */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  // simple non-animated tabular display; keep CPU low
  const formatted = Number.isInteger(value) ? value.toLocaleString() : value.toString();
  return <span className="text-[18px] font-semibold text-foreground tabular-nums">{formatted}{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                        */
/* ------------------------------------------------------------------ */
function DetailPanel({ a }: { a: Automation }) {
  const Icon = a.icon;
  const adoption = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    m: `M${i + 1}`,
    runs: 50 + Math.round(Math.sin(i / 2) * 20) + i * 4,
  })), []);

  return (
    <div className="space-y-5">
      <SheetHeader>
        <div className="flex items-center gap-2">
          <div className={`h-10 w-10 rounded-lg ${a.tile} grid place-items-center`}>
            <Icon className={`h-5 w-5 ${a.iconColor}`} />
          </div>
          <div className="flex-1">
            <SheetTitle className="text-[18px] leading-tight">{a.name}</SheetTitle>
            <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-muted-foreground">
              <Badge variant="secondary" className="text-[10.5px]">Self-Service</Badge>
              <span>{a.category}</span>
              <span>·</span>
              <Star className="h-3 w-3 text-amber-500" /> <span>{a.rating.toFixed(1)} ({fmt(a.consumers)})</span>
            </div>
          </div>
        </div>
        <SheetDescription className="text-[13px] leading-relaxed pt-2">{a.panel.overview}</SheetDescription>
      </SheetHeader>

      {/* Quick facts grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Provisioning Time", v: `~${a.provisionMin} min`, i: Clock },
          { l: "User Input", v: "~5 min", i: Users },
          { l: "Approval", v: "None (guardrails)", i: ShieldCheck },
        ].map((f, i) => {
          const I = f.i;
          return (
            <div key={i} className="rounded-lg border border-border p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><I className="h-3 w-3" /> {f.l}</div>
              <div className="text-[12.5px] font-medium text-foreground">{f.v}</div>
            </div>
          );
        })}
      </div>

      {/* Workflow */}
      <section>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Workflow</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {a.panel.workflow.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[12px] px-2.5 py-1 rounded-md bg-muted text-foreground/90">{s}</span>
              {i < a.panel.workflow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </section>

      {/* Inputs / outputs */}
      <section className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Required Inputs</div>
          <ul className="space-y-1">
            {a.panel.inputs.map((x) => (
              <li key={x} className="flex items-center gap-2 text-[12.5px] text-foreground/90"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Generated Outputs</div>
          <ul className="space-y-1">
            {a.panel.outputs.map((x) => (
              <li key={x} className="flex items-center gap-2 text-[12.5px] text-foreground/90"><CheckCircle2 className="h-3 w-3 text-emerald-600" />{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* KPIs */}
      {a.panel.kpis.length > 0 && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">KPIs</div>
          <div className="grid grid-cols-3 gap-2">
            {a.panel.kpis.map((k) => (
              <div key={k.name} className="rounded-lg border border-border p-2.5">
                <div className="text-[10.5px] text-muted-foreground">{k.name}</div>
                <div className="text-[14px] font-semibold text-foreground">{k.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Adoption chart */}
      <section>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Adoption (last 12 months)</div>
        <div className="h-32 rounded-lg border border-border p-2 bg-card">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adoption}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="runs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1.5 text-[11.5px] text-muted-foreground">
          {a.panel.adoption.consumers.toLocaleString()} consumers · {a.panel.adoption.runs} · {a.panel.adoption.teams} teams
        </div>
      </section>

      {/* Architecture / dependencies */}
      <section className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Architecture</div>
          <div className="flex flex-wrap gap-1.5">
            {a.panel.architecture.map((t) => <Badge key={t} variant="outline" className="text-[11px]">{t}</Badge>)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Dependencies</div>
          {a.panel.dependencies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {a.panel.dependencies.map((t) => <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>)}
            </div>
          ) : (
            <div className="text-[12px] text-muted-foreground">None</div>
          )}
        </div>
      </section>

      {/* Controls */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { l: "Security Controls", items: a.panel.security, icon: ShieldCheck, color: "text-emerald-600" },
          { l: "Cost Controls", items: a.panel.cost, icon: DollarSign, color: "text-amber-600" },
          { l: "Observability", items: a.panel.observability, icon: Eye, color: "text-fuchsia-600" },
        ].map((g) => {
          const I = g.icon;
          return (
            <div key={g.l} className="rounded-lg border border-border p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><I className={`h-3 w-3 ${g.color}`} />{g.l}</div>
              <ul className="mt-1 space-y-0.5">
                {g.items.length > 0 ? g.items.map((x) => (
                  <li key={x} className="text-[12px] text-foreground/90">· {x}</li>
                )) : <li className="text-[12px] text-muted-foreground">—</li>}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Use cases / anti-patterns */}
      <section className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Example Use Cases</div>
          <ul className="space-y-1">
            {a.panel.useCases.map((u) => (
              <li key={u} className="flex items-start gap-2 text-[12.5px] text-foreground/90"><CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" />{u}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Anti-Patterns</div>
          <ul className="space-y-1">
            {a.panel.antiPatterns.map((u) => (
              <li key={u} className="flex items-start gap-2 text-[12.5px] text-foreground/90"><AlertTriangle className="h-3 w-3 mt-0.5 text-amber-600 shrink-0" />{u}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* AI enhancements */}
      {a.panel.ai && a.panel.ai.length > 0 && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AI Enhancements</div>
          <div className="flex flex-wrap gap-1.5">
            {a.panel.ai.map((t) => (
              <Badge key={t} variant="outline" className="text-[11px] gap-1"><Sparkles className="h-3 w-3 text-fuchsia-500" />{t}</Badge>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {a.panel.related.length > 0 && (
        <section>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Related Automations</div>
          <div className="flex flex-wrap gap-1.5">
            {a.panel.related.map((t) => <Badge key={t} className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100">{t}</Badge>)}
          </div>
        </section>
      )}

      <Separator />

      {/* Owners + actions */}
      <section className="rounded-lg border border-border p-3 bg-muted/30">
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div><span className="text-muted-foreground">Service Owner: </span><span className="font-medium text-foreground">{a.panel.owner}</span></div>
          <div><span className="text-muted-foreground">Platform Owner: </span><span className="font-medium text-foreground">{a.panel.platformOwner}</span></div>
          <div><span className="text-muted-foreground">SLA: </span><span className="font-medium text-foreground">{a.panel.sla}</span></div>
          <div><span className="text-muted-foreground">Last update: </span><span className="font-medium text-foreground">{a.panel.lastUpdate}</span></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" className="h-9 gap-1.5"><Zap className="h-3.5 w-3.5" /> Launch Automation</Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5"><BookOpen className="h-3.5 w-3.5" /> View Documentation</Button>
          <Button size="sm" variant="outline" className="h-9 gap-1.5"><Star className="h-3.5 w-3.5" /> Add to Favorites</Button>
        </div>
      </section>
    </div>
  );
}
