import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Database, Server, Cloud, Boxes, Layers, GitBranch, Cpu, HardDrive,
  Activity, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Rocket,
  Sparkles, Brain, Target, ShieldCheck, Network, Workflow, Building2,
  ArrowRight, CheckCircle2, Clock, Zap, BarChart3, FileWarning, Package,
  GitMerge, Container, ArrowRightLeft, Gauge, Eye, ChevronRight, X,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, RadialBarChart, RadialBar,
  PieChart, Pie, Cell,
} from "recharts";

/* ============================================================== */
/*  Types                                                          */
/* ============================================================== */
type Tile = {
  id: string;
  name: string;
  icon: LucideIcon;
  iconColor: string;
  tileBg: string;
  blurb: string;
  status?: "new" | "trending" | "core";
  duration: string;
  difficulty: "Low" | "Medium" | "High";
  rating: number;
  reviews: number;
  hover: {
    purpose: string;
    useCase: string;
    complexity: string;
    effort: string;
    businessImpact: string;
    technicalImpact: string;
    paths: string[];
    stats: { label: string; value: string }[];
  };
  panel: {
    summary: string;
    currentState: string[];
    futureState: string[];
    drivers: string[];
    technical: string[];
    dependencies: string[];
    risks: { level: "low" | "med" | "high"; text: string }[];
    cost: { label: string; value: string }[];
    reliability: string;
    security: string;
    business: string;
    actions: string[];
    ai: string[];
    related: string[];
    scenarios: string[];
  };
};

/* ============================================================== */
/*  Data                                                           */
/* ============================================================== */
const KPIS = [
  {
    id: "debt",
    icon: TrendingDown,
    tone: "from-violet-500 to-fuchsia-500",
    value: "$4.2M",
    label: "Technical Debt Retired",
    delta: "+24% vs Q1",
    deltaUp: true,
    detail: {
      categories: [
        { name: "Legacy SQL stored procedures", value: "$1.6M" },
        { name: "Unsupported runtimes", value: "$820K" },
        { name: "Bespoke integration code", value: "$640K" },
        { name: "Hand-managed VMs", value: "$580K" },
        { name: "Snowflake configurations", value: "$560K" },
      ],
      impact: "Each dollar of retired debt frees ~3 hours of engineering capacity per month and reduces incident exposure by ~11%.",
      savings: "Run-rate savings reinvested into platform engineering and reliability automation.",
    },
  },
  {
    id: "legacy",
    icon: Database,
    tone: "from-blue-500 to-cyan-500",
    value: "137",
    label: "Legacy Services Modernized",
    delta: "+18%",
    deltaUp: true,
    detail: {
      categories: [
        { name: "Replatformed to containers", value: "64" },
        { name: "Decomposed monoliths", value: "23" },
        { name: "Database migrations (Aurora/PG)", value: "31" },
        { name: "API extractions from SQL logic", value: "19" },
      ],
      impact: "127 of 137 are now deployed continuously with no manual change windows.",
      savings: "~$1.1M annual infrastructure savings recognized from rationalized services.",
    },
  },
  {
    id: "container",
    icon: Container,
    tone: "from-emerald-500 to-teal-500",
    value: "68%",
    label: "Container Adoption",
    delta: "+22%",
    deltaUp: true,
    detail: {
      categories: [
        { name: "Containerized services", value: "289" },
        { name: "EKS workloads", value: "172" },
        { name: "ECS workloads", value: "117" },
        { name: "Remaining VM candidates", value: "136" },
      ],
      impact: "Mean deploy time dropped from 38m to 6m for containerized services.",
      savings: "Container density and bin-packing reduced compute spend ~$680K annualized.",
    },
  },
  {
    id: "infra",
    icon: Server,
    tone: "from-amber-500 to-orange-500",
    value: "41%",
    label: "Infrastructure Reduction",
    delta: "+16%",
    deltaUp: true,
    detail: {
      categories: [
        { name: "VMs retired", value: "412" },
        { name: "SQL Servers consolidated", value: "27" },
        { name: "Datacenter racks released", value: "8" },
        { name: "Platforms consolidated", value: "5 → 2" },
      ],
      impact: "Footprint reduction directly reduces blast radius and patching surface.",
      savings: "$1.4M annualized hardware, hosting and licensing reduction.",
    },
  },
  {
    id: "velocity",
    icon: Rocket,
    tone: "from-rose-500 to-pink-500",
    value: "73%",
    label: "Faster Deployments",
    delta: "+31%",
    deltaUp: true,
    detail: {
      categories: [
        { name: "Mean lead time", value: "2.1 days" },
        { name: "Deploys per week", value: "184" },
        { name: "Change failure rate", value: "4.2%" },
        { name: "MTTR", value: "38m" },
      ],
      impact: "Faster, safer deployments correlate with a 27% reduction in Sev2+ incidents.",
      savings: "Velocity improvements translate to ~$2.3M of unlocked product capacity per year.",
    },
  },
];

const SQL_DEPS = [
  { x: 30, y: 40 }, { x: 70, y: 30 }, { x: 50, y: 70 }, { x: 90, y: 60 },
  { x: 20, y: 80 }, { x: 60, y: 50 }, { x: 110, y: 40 }, { x: 130, y: 75 },
];

const SQL_TREND = [120, 132, 128, 145, 162, 175, 188, 201, 218, 235, 248, 262];

const TILES: Tile[] = [
  {
    id: "sql",
    name: "SQL Modernization Assessment",
    icon: Database,
    iconColor: "text-violet-600",
    tileBg: "bg-violet-50",
    blurb: "Analyze SQL Server environments and generate modernization recommendations.",
    status: "new",
    duration: "30–45 min",
    difficulty: "Medium",
    rating: 4.8,
    reviews: 124,
    hover: {
      purpose: "Assess SQL Server estates and prioritize Aurora / PostgreSQL / RDS migration candidates.",
      useCase: "Pre-migration assessment for Virginia SQL Server consolidation and acquisition databases.",
      complexity: "Medium — read-only scan; no production impact.",
      effort: "30–45 minutes per estate; results in a prioritized roadmap.",
      businessImpact: "$1.8M projected annual savings from licensing and infrastructure consolidation.",
      technicalImpact: "Reduces SQL Server footprint by 60–70% across in-scope estates.",
      paths: ["AWS Aurora PostgreSQL", "Amazon RDS for SQL Server", "Self-managed PostgreSQL on EKS"],
      stats: [
        { label: "SQL Estate", value: "42 Servers" },
        { label: "Databases", value: "317" },
        { label: "Stored Procedures", value: "18,642" },
        { label: "Modernization Candidates", value: "71%" },
        { label: "Estimated Savings", value: "$1.8M / yr" },
      ],
    },
    panel: {
      summary: "Analyzes SQL Server environments to assess current state, technical debt, and provides a prioritized modernization roadmap toward managed Postgres / Aurora.",
      currentState: [
        "42 SQL Server instances across 4 regions",
        "317 production databases, 18,642 stored procedures",
        "Heavy business logic embedded in T-SQL",
        "Manual patching; 12% of versions out of support",
      ],
      futureState: [
        "Strategic database platforms: Aurora PostgreSQL + RDS",
        "Business logic refactored to services and event handlers",
        "Automated provisioning via Platform Engineering",
        "Continuous compliance via golden database templates",
      ],
      drivers: [
        "Reduce SQL Server licensing exposure",
        "Eliminate Virginia datacenter SQL footprint",
        "Enable elastic scaling and managed HA/DR",
        "Modernize acquisitions onto a single platform",
      ],
      technical: [
        "Stored procedure complexity scoring",
        "Cross-database dependency analysis",
        "Schema portability rating (PG / Aurora)",
        "T-SQL → PG/PLpgSQL conversion estimates",
      ],
      dependencies: ["AWS DMS", "Schema Conversion Tool", "Identity Platform", "Observability"],
      risks: [
        { level: "med", text: "Stored procedure business logic requires refactor or wrapping" },
        { level: "low", text: "Read-only assessment; no production impact" },
        { level: "high", text: "Linked-server patterns must be re-architected" },
      ],
      cost: [
        { label: "Estimated Savings", value: "$1.8M annually" },
        { label: "Migration Investment", value: "$420K one-time" },
        { label: "Payback Period", value: "< 4 months" },
      ],
      reliability: "Managed Aurora MultiAZ delivers 99.99% SLO vs current 99.5% on self-managed SQL.",
      security: "Eliminates 14 CVEs tied to out-of-support SQL versions; centralizes encryption-at-rest.",
      business: "Predictable cost model; standardized database platform across all acquisitions.",
      actions: [
        "Generate prioritized modernization roadmap",
        "Spin up sandbox Aurora cluster for top 3 candidates",
        "Schedule stakeholder review with Data Platform Team",
      ],
      ai: [
        "12 databases recommended for direct lift to Aurora PostgreSQL",
        "6 stored procedures flagged as candidates for API extraction",
        "ROI maximized by sequencing Virginia estate first",
      ],
      related: ["Stored Procedure Dependency Analyzer", "Database Platform Rationalization", "AWS Migration Factory"],
      scenarios: [
        "PE-backed health-tech with 28 acquired SQL estates",
        "Insurance carrier consolidating 60+ databases pre-IPO",
      ],
    },
  },
  {
    id: "sproc",
    name: "Stored Procedure Dependency Analyzer",
    icon: Network,
    iconColor: "text-sky-600",
    tileBg: "bg-sky-50",
    blurb: "Discover and map stored procedure dependencies across systems.",
    duration: "15–30 min",
    difficulty: "Medium",
    rating: 4.7,
    reviews: 98,
    hover: {
      purpose: "Map cross-database and cross-service stored procedure dependencies to identify refactor candidates.",
      useCase: "Untangle business logic embedded in T-SQL before microservice extraction.",
      complexity: "Medium — static + dynamic analysis.",
      effort: "15–30 min per database.",
      businessImpact: "Accelerates monolith decomposition by 6–9 months.",
      technicalImpact: "Identifies service boundaries grounded in real data lineage.",
      paths: ["API extraction", "Event-driven refactor", "Read-model projection"],
      stats: [
        { label: "Procedures Analyzed", value: "18,642" },
        { label: "Dependencies Found", value: "36,791" },
        { label: "Refactor Candidates", value: "64%" },
        { label: "API Candidates", value: "412" },
      ],
    },
    panel: {
      summary: "Parses and instruments stored procedures, surfacing dependency graphs, business-logic clusters, and suggested service boundaries.",
      currentState: [
        "Business logic embedded across 18,642 stored procedures",
        "36,791 cross-procedure dependencies",
        "317 cross-database calls identified",
        "Limited test coverage on T-SQL logic",
      ],
      futureState: [
        "Logic externalized as APIs and event handlers",
        "Stored procedures reduced to CRUD only",
        "Clear domain boundaries with contract tests",
        "Continuous dependency monitoring via platform",
      ],
      drivers: [
        "Enable monolith decomposition",
        "Reduce risk of cross-team change collisions",
        "Improve testability and reliability of business logic",
      ],
      technical: [
        "Static AST analysis of T-SQL",
        "Runtime call-graph capture via XEvents",
        "Complexity scoring (cyclomatic + fan-out)",
        "Domain clustering using semantic embeddings",
      ],
      dependencies: ["SQL Modernization Assessment", "Monolith Decomposition Planner"],
      risks: [
        { level: "med", text: "Hidden runtime branches may be missed by static analysis" },
        { level: "low", text: "Read-only metadata capture" },
      ],
      cost: [
        { label: "Engineering Hours Saved", value: "1,800 hrs" },
        { label: "Refactor Acceleration", value: "6–9 months" },
      ],
      reliability: "Surfaces hot-path procedures responsible for 72% of database load.",
      security: "Flags procedures accessing PII without parameterization (47 found).",
      business: "Provides defensible refactor sequencing aligned to revenue-critical flows.",
      actions: [
        "Run dependency scan against top 3 OLTP databases",
        "Export refactor backlog into Jira",
        "Tag procedures by domain owner",
      ],
      ai: [
        "Clusters 412 procedures into 18 candidate microservices",
        "Recommends event-driven refactor for 64 procedures with high write fan-out",
      ],
      related: ["SQL Modernization Assessment", "Monolith Decomposition Planner"],
      scenarios: [
        "Health-tech with 30K stored procedures inherited from acquisitions",
        "FinServ workflow engine with heavy T-SQL orchestration",
      ],
    },
  },
  {
    id: "mono",
    name: "Monolith Decomposition Planner",
    icon: GitMerge,
    iconColor: "text-indigo-600",
    tileBg: "bg-indigo-50",
    blurb: "Break monolithic applications into modern microservices.",
    duration: "20–40 min",
    difficulty: "High",
    rating: 4.6,
    reviews: 87,
    hover: {
      purpose: "Propose service boundaries, migration waves, and API/event opportunities from monolith analysis.",
      useCase: "Replatform legacy monoliths into product-aligned services.",
      complexity: "High — requires architectural review.",
      effort: "20–40 min per monolith.",
      businessImpact: "Enables independent team velocity and isolated blast radius.",
      technicalImpact: "Reduces mean change failure rate by ~38% per decomposed domain.",
      paths: ["Strangler fig", "Branch by abstraction", "Read-model extraction"],
      stats: [
        { label: "Services Identified", value: "24" },
        { label: "Decomposition Score", value: "78/100" },
        { label: "Est. Effort", value: "8–12 weeks" },
      ],
    },
    panel: {
      summary: "Visualizes monolith structure and proposes a decomposition plan with service boundaries, dependency reorganization, and migration waves.",
      currentState: ["Single deployable, ~2.1M LOC", "78 internal modules", "Tightly coupled to one SQL Server"],
      futureState: ["18–24 services aligned to domains", "Event-driven inter-service contracts", "Platform-provisioned environments per service"],
      drivers: ["Independent deploys", "Domain ownership", "Reduce blast radius"],
      technical: ["Domain-driven design analysis", "Coupling/cohesion heatmaps", "Migration wave sequencing"],
      dependencies: ["Stored Procedure Dependency Analyzer", "Containerization Readiness"],
      risks: [
        { level: "high", text: "Distributed transactions across legacy boundaries" },
        { level: "med", text: "Data ownership negotiation across product teams" },
      ],
      cost: [
        { label: "Investment", value: "$1.2M over 4 quarters" },
        { label: "Annual Velocity Gain", value: "$2.3M" },
      ],
      reliability: "Independent deploys reduce coordinated change-window failures by ~60%.",
      security: "Smaller services enable tighter network policy and least-privilege identities.",
      business: "Unlocks 6 independent product teams currently blocked by shared release trains.",
      actions: ["Approve initial decomposition wave", "Spin up platform environments", "Schedule architecture review"],
      ai: ["Recommends Strangler Fig for the order-management module", "Detects two services that should remain merged due to transactional coupling"],
      related: ["Stored Procedure Dependency Analyzer", "Containerization Readiness Assessment"],
      scenarios: ["Legacy claims monolith decomposed into 14 services over 3 quarters"],
    },
  },
  {
    id: "container",
    name: "Containerization Readiness Assessment",
    icon: Container,
    iconColor: "text-teal-600",
    tileBg: "bg-teal-50",
    blurb: "Assess workloads for container readiness and cloud-native fit.",
    duration: "10–20 min",
    difficulty: "Low",
    rating: 4.5,
    reviews: 76,
    hover: {
      purpose: "Score workloads for container readiness, surface refactor work, and recommend EKS vs ECS placement.",
      useCase: "Identify next wave of VM workloads to containerize and bin-pack on EKS.",
      complexity: "Low — runtime + dependency scan.",
      effort: "10–20 min per workload.",
      businessImpact: "Container density and bin-packing reduce compute spend ~$680K annualized.",
      technicalImpact: "Reduces deploy time from 38m to <6m for containerized services.",
      paths: ["EKS (preferred)", "ECS (lift-and-shift)", "Lambda (event handlers)"],
      stats: [
        { label: "Container Ready", value: "62%" },
        { label: "Refactor", value: "24%" },
        { label: "High Complexity", value: "14%" },
      ],
    },
    panel: {
      summary: "Scans application runtimes, dependencies, and configuration to score container readiness and produce a sequenced containerization plan.",
      currentState: ["246 VM-hosted workloads in scope", "Mixed Windows/Linux runtimes", "Legacy .NET Framework and Java 8 dominant"],
      futureState: ["EKS-first with ECS for legacy Windows", "Golden base images per runtime", "Continuous CVE scanning at build"],
      drivers: ["Deploy velocity", "Bin-packing density", "Standardized runtime governance"],
      technical: ["Runtime detection", "Dependency analysis", "Stateful resource flagging", "Network ingress patterns"],
      dependencies: ["Monolith Decomposition Planner", "AWS Migration Factory"],
      risks: [
        { level: "med", text: "14% of workloads require refactor (stateful filesystem dependencies)" },
        { level: "low", text: "Read-only scan" },
      ],
      cost: [
        { label: "Annual Savings", value: "$680K" },
        { label: "Investment", value: "$220K" },
      ],
      reliability: "Standardized golden images reduce drift-related incidents by ~45%.",
      security: "Centralized image scanning closes long-tail CVE exposure.",
      business: "Enables product teams to deploy without infrastructure tickets.",
      actions: ["Approve EKS landing zone for wave 2", "Refactor 14% stateful workloads", "Publish golden images"],
      ai: ["Recommends ECS for 18 Windows workloads pending .NET 8 upgrade", "Identifies 11 workloads ready for Lambda"],
      related: ["AWS Migration Factory", "Monolith Decomposition Planner"],
      scenarios: ["Containerized 64 services in 90 days post-assessment"],
    },
  },
  {
    id: "aws",
    name: "AWS Migration Factory",
    icon: Cloud,
    iconColor: "text-orange-600",
    tileBg: "bg-orange-50",
    blurb: "End-to-end migration planning, execution, and optimization.",
    duration: "30–60 min",
    difficulty: "Medium",
    rating: 4.7,
    reviews: 112,
    hover: {
      purpose: "Orchestrate the Assess → Transform → Migrate → Validate → Optimize lifecycle.",
      useCase: "Migrate Virginia SQL infrastructure to AWS with predictable waves and rollback.",
      complexity: "Medium — guided runbooks per workload.",
      effort: "30–60 min planning per wave.",
      businessImpact: "$1.8M annualized savings + datacenter exit on accelerated timeline.",
      technicalImpact: "Migrates 142 workloads with <0.1% data loss tolerance.",
      paths: ["6 Rs framework", "Wave planning", "Cutover automation"],
      stats: [
        { label: "Workloads Assessed", value: "142" },
        { label: "Est. Cost Savings", value: "$1.8M / yr" },
        { label: "Migration Readiness", value: "68%" },
        { label: "Est. Timeline", value: "12–16 weeks" },
      ],
    },
    panel: {
      summary: "End-to-end factory orchestrating discovery, transformation, migration, validation, and post-migration optimization across waves.",
      currentState: ["142 workloads in Virginia + colo", "Mixed bare-metal, VMware, and self-managed cloud"],
      futureState: ["AWS-native with Aurora and EKS", "Single landing zone with org-wide guardrails", "Continuous cost optimization"],
      drivers: ["Datacenter exit", "Cost predictability", "Reliability via managed services"],
      technical: ["Wave planning", "Cutover automation", "Cost modeling", "Performance validation"],
      dependencies: ["SQL Modernization Assessment", "Containerization Readiness", "Identity Platform"],
      risks: [
        { level: "high", text: "Cutover dependency on legacy identity provider" },
        { level: "med", text: "Latency-sensitive workloads need re-architecture" },
      ],
      cost: [
        { label: "Annual Savings", value: "$1.8M" },
        { label: "Migration Investment", value: "$2.1M one-time" },
      ],
      reliability: "Managed services upgrade SLOs from 99.5% to 99.95% across migrated estate.",
      security: "Single landing zone enables consistent SCPs, GuardDuty, and IAM Identity Center.",
      business: "Datacenter exit unlocks $4M+ multi-year facility savings.",
      actions: ["Lock wave 1 scope", "Run dry-run cutover", "Schedule executive go/no-go"],
      ai: ["Recommends wave sequencing prioritizing Virginia SQL estate first", "Flags 9 workloads needing re-architecture before move"],
      related: ["SQL Modernization", "Containerization Readiness", "Database Platform Rationalization"],
      scenarios: ["12-week migration of 142 workloads with zero customer-visible downtime"],
    },
  },
  {
    id: "dbplat",
    name: "Database Platform Rationalization",
    icon: HardDrive,
    iconColor: "text-emerald-600",
    tileBg: "bg-emerald-50",
    blurb: "Identify consolidation opportunities and align to strategic platforms.",
    duration: "20–30 min",
    difficulty: "Medium",
    rating: 4.6,
    reviews: 69,
    hover: {
      purpose: "Inventory every database engine and recommend consolidation to strategic platforms.",
      useCase: "Reduce from 5 database platforms to 2 strategic platforms.",
      complexity: "Medium — multi-engine scan.",
      effort: "20–30 min.",
      businessImpact: "Reduces DBA toil and licensing exposure simultaneously.",
      technicalImpact: "Consolidates platforms 5 → 2 over 3 quarters.",
      paths: ["Aurora PostgreSQL", "Amazon RDS"],
      stats: [
        { label: "SQL Server", value: "142" },
        { label: "Oracle", value: "38" },
        { label: "MySQL", value: "64" },
        { label: "PostgreSQL", value: "73" },
      ],
    },
    panel: {
      summary: "Cross-engine inventory and consolidation planner aligning every database to strategic platforms.",
      currentState: ["5 database platforms in production", "Inconsistent backup and HA postures", "12 unsupported engine versions"],
      futureState: ["Aurora PostgreSQL + RDS as strategic", "Single backup, HA, DR posture", "Continuous compliance"],
      drivers: ["Reduce DBA toil", "License optimization", "Standardize reliability"],
      technical: ["Engine inventory", "Version + EOL detection", "Workload pattern matching"],
      dependencies: ["SQL Modernization Assessment", "AWS Migration Factory"],
      risks: [
        { level: "med", text: "Oracle migrations require schema conversion review" },
      ],
      cost: [
        { label: "License Savings", value: "$1.1M / yr" },
        { label: "DBA Toil Reduction", value: "~40%" },
      ],
      reliability: "Standardized HA/DR yields uniform 99.99% SLO across data tier.",
      security: "Encryption-at-rest and centralized audit across all engines.",
      business: "Predictable cost model; fewer specialized skill silos.",
      actions: ["Approve target architecture", "Sequence Oracle exits", "Decommission unsupported MySQL"],
      ai: ["Detects 27 SQL Servers as direct consolidation candidates", "Flags 6 Oracle workloads requiring custom path"],
      related: ["SQL Modernization Assessment", "AWS Migration Factory"],
      scenarios: ["Consolidated from 5 → 2 database platforms in 9 months"],
    },
  },
  {
    id: "debt",
    name: "Technical Debt Observatory",
    icon: FileWarning,
    iconColor: "text-rose-600",
    tileBg: "bg-rose-50",
    blurb: "Identify, score, and prioritize technical debt across applications.",
    duration: "15–30 min",
    difficulty: "Medium",
    rating: 4.6,
    reviews: 135,
    hover: {
      purpose: "Quantify technical debt by source, severity, and business impact.",
      useCase: "Build the executive debt burn-down roadmap.",
      complexity: "Medium — multi-signal scoring.",
      effort: "15–30 min per portfolio.",
      businessImpact: "Connects debt to incident risk and engineering capacity loss.",
      technicalImpact: "Surfaces hotspots that drive 80% of toil.",
      paths: ["Refactor", "Replatform", "Replace", "Retire"],
      stats: [
        { label: "Debt Items", value: "1,248" },
        { label: "Avg Debt Score", value: "71/100" },
        { label: "Trend", value: "Improving" },
      ],
    },
    panel: {
      summary: "Heatmap of technical debt across applications, with prioritized remediation plan and burn-down roadmap.",
      currentState: ["1,248 debt items tracked", "62% in legacy SQL / .NET Framework", "Top 5% of items drive 47% of incidents"],
      futureState: ["Continuous debt scoring at build time", "Debt budget per service", "Tied to product team OKRs"],
      drivers: ["Reduce incident frequency", "Recover engineering capacity", "Lower change failure rate"],
      technical: ["CVE feeds", "Static analysis", "Dependency age", "Test coverage"],
      dependencies: ["All other Modernization tiles"],
      risks: [
        { level: "low", text: "Debt items require owner acknowledgement to act" },
      ],
      cost: [
        { label: "Recovered Capacity", value: "1,800 eng hrs / qtr" },
        { label: "Incident Cost Avoided", value: "$420K / qtr" },
      ],
      reliability: "Top-decile debt remediation reduces Sev2+ by 27%.",
      security: "Surfaces unpatched CVEs and out-of-support runtimes.",
      business: "Provides a defensible, prioritized roadmap for executive reporting.",
      actions: ["Approve top 20 remediation items", "Tag debt by owner", "Publish quarterly burn-down"],
      ai: ["Recommends targeting 18 hotspot services first for highest ROI", "Predicts 31% debt reduction within 2 quarters at current pace"],
      related: ["SQL Modernization", "Containerization Readiness", "AWS Migration Factory"],
      scenarios: ["Quarterly burn-down adopted by board reporting"],
    },
  },
  {
    id: "acq",
    name: "Acquisition Replatforming Factory",
    icon: Building2,
    iconColor: "text-fuchsia-600",
    tileBg: "bg-fuchsia-50",
    blurb: "Rapidly assess, replatform, and standardize acquired workloads.",
    duration: "45–90 min",
    difficulty: "High",
    rating: 4.7,
    reviews: 58,
    hover: {
      purpose: "Standard onboarding lifecycle for every acquisition: Acquire → Assess → Replatform → Standardize → Operate.",
      useCase: "Reprovision acquired environments onto the standard platform within 42 days.",
      complexity: "High — multi-domain coordination.",
      effort: "45–90 min per acquisition kickoff.",
      businessImpact: "Eliminates unknown-risk windows post-close.",
      technicalImpact: "Standardizes identity, observability, security, and cloud posture.",
      paths: ["Replatform", "Rehost", "Retire"],
      stats: [
        { label: "Acquisitions Onboarded", value: "7" },
        { label: "Avg. Onboarding Time", value: "42 days" },
        { label: "Standardization Score", value: "81%" },
      ],
    },
    panel: {
      summary: "End-to-end replatforming factory for acquisitions, standardizing identity, security, observability, cloud posture, and modernization in a predictable cadence.",
      currentState: ["7 acquisitions in flight", "Wide variance in security and observability posture", "Mean onboarding 42 days"],
      futureState: ["30-day standard onboarding", "100% identity + observability coverage at day 14", "Standard platform by day 60"],
      drivers: ["Eliminate unknown risk", "Standardize operations", "Accelerate value realization"],
      technical: ["Identity federation", "Security baselining", "Observability instrumentation", "Cloud landing zone bootstrap"],
      dependencies: ["Identity Platform", "Cloud Landing Zones", "Observability"],
      risks: [
        { level: "high", text: "Inherited custom integrations resist standardization" },
        { level: "med", text: "Founder-built monoliths with sparse documentation" },
      ],
      cost: [
        { label: "Time-to-Standard", value: "42 → 30 days target" },
        { label: "Per-Acquisition Savings", value: "$280K" },
      ],
      reliability: "Brings every acquisition to baseline SLO posture within 60 days.",
      security: "Eliminates 100% of inherited unmanaged identities and unscanned workloads.",
      business: "Predictable, repeatable acquisition integration enables faster M&A cadence.",
      actions: ["Onboard next acquisition", "Run identity federation playbook", "Schedule day-60 review"],
      ai: ["Predicts day-60 standardization at 88% for current acquisition", "Recommends parallelizing observability + identity workstreams"],
      related: ["SQL Modernization", "Containerization Readiness", "AWS Migration Factory"],
      scenarios: ["PE-backed roll-up onboarding 4 acquisitions per year on a repeatable factory"],
    },
  },
];

/* ============================================================== */
/*  Subcomponents                                                  */
/* ============================================================== */
function Sparkline({ data, color = "#7c3aed" }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`g-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={`url(#g-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KpiCard({ kpi, onClick }: { kpi: typeof KPIS[number]; onClick: () => void }) {
  const Icon = kpi.icon;
  return (
    <button
      onClick={onClick}
      className="group relative flex-1 min-w-[180px] text-left px-5 py-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 size-10 rounded-lg bg-gradient-to-br ${kpi.tone} flex items-center justify-center shadow-sm`}>
          <Icon className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold text-slate-900 tracking-tight">{kpi.value}</div>
          <div className="text-xs text-slate-600 leading-tight">{kpi.label}</div>
          <div className={`mt-1 text-[11px] font-medium ${kpi.deltaUp ? "text-emerald-600" : "text-rose-600"} flex items-center gap-0.5`}>
            <TrendingUp className="size-3" /> {kpi.delta}
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

/* Per-tile mini visualization */
function TileVisual({ tile }: { tile: Tile }) {
  if (tile.id === "sql") {
    return (
      <div className="mt-3 rounded-md bg-gradient-to-br from-violet-50/40 to-white p-2">
        <ResponsiveContainer width="100%" height={56}>
          <AreaChart data={SQL_TREND.map((v, i) => ({ i, v }))}>
            <defs>
              <linearGradient id="sqlg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={1.8} fill="url(#sqlg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (tile.id === "sproc") {
    return (
      <div className="mt-3 relative h-[72px] rounded-md bg-gradient-to-br from-sky-50/60 to-white">
        <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full">
          {SQL_DEPS.map((p, i) =>
            SQL_DEPS.slice(i + 1).map((q, j) => (
              <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#bae6fd" strokeWidth="0.6" className="group-hover:stroke-sky-400 transition-colors" />
            ))
          )}
          {SQL_DEPS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i % 3 === 0 ? 4 : 2.6} fill={i % 3 === 0 ? "#0ea5e9" : "#7dd3fc"} className="transition-all" />
          ))}
        </svg>
      </div>
    );
  }
  if (tile.id === "mono") {
    return (
      <div className="mt-3 h-[72px] rounded-md bg-gradient-to-br from-indigo-50/60 to-white flex items-center justify-around px-3">
        <div className="flex flex-col items-center">
          <div className="size-9 rounded bg-slate-300 group-hover:bg-slate-200 transition-all" />
          <span className="text-[9px] text-slate-500 mt-1">Monolith</span>
        </div>
        <ArrowRight className="size-3 text-slate-400" />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`size-3 rounded-sm ${i === 0 ? "bg-indigo-500" : i % 2 === 0 ? "bg-indigo-400" : "bg-indigo-300"} group-hover:scale-110 transition-transform`} style={{ transitionDelay: `${i * 30}ms` }} />
          ))}
        </div>
      </div>
    );
  }
  if (tile.id === "container") {
    const data = [{ name: "ready", v: 62, fill: "#0d9488" }, { name: "ref", v: 24, fill: "#5eead4" }, { name: "comp", v: 14, fill: "#fda4af" }];
    return (
      <div className="mt-3 h-[72px] rounded-md bg-gradient-to-br from-teal-50/60 to-white relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="v" cx="50%" cy="50%" innerRadius={20} outerRadius={32} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[11px] font-semibold text-teal-700">62%</div>
      </div>
    );
  }
  if (tile.id === "aws") {
    const steps = ["Assess", "Transform", "Migrate", "Validate", "Optimize"];
    return (
      <div className="mt-3 h-[72px] rounded-md bg-gradient-to-br from-orange-50/60 to-white flex items-center justify-between px-2 gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className="size-7 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-all" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="size-2 rounded-full bg-orange-500" />
            </div>
            {i < steps.length - 1 && <ArrowRight className="size-2.5 text-orange-300" />}
          </div>
        ))}
      </div>
    );
  }
  if (tile.id === "dbplat") {
    const rows = [
      { name: "SQL Server", v: 142, color: "bg-emerald-500" },
      { name: "Oracle", v: 38, color: "bg-rose-500" },
      { name: "MySQL", v: 64, color: "bg-amber-500" },
      { name: "PostgreSQL", v: 73, color: "bg-blue-500" },
    ];
    const max = 160;
    return (
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2 text-[10px] text-slate-600">
            <span className="w-16 truncate">{r.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full ${r.color} transition-all duration-700 group-hover:brightness-110`} style={{ width: `${(r.v / max) * 100}%` }} />
            </div>
            <span className="w-6 text-right font-medium text-slate-700">{r.v}</span>
          </div>
        ))}
      </div>
    );
  }
  if (tile.id === "debt") {
    return (
      <div className="mt-3 grid grid-cols-12 gap-[2px] h-[72px]">
        {Array.from({ length: 96 }).map((_, i) => {
          const heat = Math.random();
          const cls = heat > 0.8 ? "bg-rose-500" : heat > 0.6 ? "bg-rose-400" : heat > 0.4 ? "bg-amber-400" : heat > 0.2 ? "bg-amber-200" : "bg-emerald-200";
          return <div key={i} className={`${cls} rounded-[1px] group-hover:scale-105 transition-transform`} style={{ transitionDelay: `${i % 12 * 10}ms` }} />;
        })}
      </div>
    );
  }
  if (tile.id === "acq") {
    const steps = ["Acquire", "Assess", "Replatform", "Standardize", "Operate"];
    return (
      <div className="mt-3 h-[72px] rounded-md bg-gradient-to-br from-fuchsia-50/60 to-white flex items-center justify-between px-2 gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className="size-7 rounded-md bg-fuchsia-100 flex items-center justify-center group-hover:bg-fuchsia-200 transition-all" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="size-2 rounded-sm bg-fuchsia-500" />
            </div>
            {i < steps.length - 1 && <ChevronRight className="size-2.5 text-fuchsia-300" />}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function TileCard({ tile, onOpen }: { tile: Tile; onOpen: () => void }) {
  const Icon = tile.icon;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onOpen}
            className="group relative text-left rounded-xl bg-white border border-slate-200/80 px-4 py-4 hover:border-slate-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`shrink-0 size-9 rounded-lg ${tile.tileBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`size-5 ${tile.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 leading-tight">{tile.name}</div>
                </div>
              </div>
              {tile.status === "new" && (
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px] px-1.5 py-0 h-5">New</Badge>
              )}
            </div>
            <p className="mt-2 text-[11.5px] text-slate-500 leading-snug line-clamp-2">{tile.blurb}</p>
            <TileVisual tile={tile} />
            <div className="mt-3 space-y-1">
              {tile.hover.stats.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-500 truncate">{s.label}</span>
                  <span className="text-slate-800 font-medium tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Clock className="size-3" />{tile.duration}</span>
              <span className="inline-flex items-center gap-1">★ {tile.rating} <span className="text-slate-400">({tile.reviews})</span></span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs p-0 bg-white border border-slate-200 shadow-2xl text-slate-800">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`size-7 rounded-md ${tile.tileBg} flex items-center justify-center`}>
                <Icon className={`size-4 ${tile.iconColor}`} />
              </div>
              <div className="text-[12px] font-semibold">{tile.name}</div>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">{tile.hover.purpose}</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
              <div><span className="text-slate-500">Complexity:</span> <span className="text-slate-800 font-medium">{tile.hover.complexity.split(" —")[0]}</span></div>
              <div><span className="text-slate-500">Effort:</span> <span className="text-slate-800 font-medium">{tile.duration}</span></div>
            </div>
            <div className="rounded-md bg-slate-50 p-2 text-[10.5px] text-slate-700">
              <div className="font-medium text-slate-800">Business Impact</div>
              <div className="text-slate-600">{tile.hover.businessImpact}</div>
            </div>
            <div className="rounded-md bg-violet-50/60 p-2 text-[10.5px] text-violet-900">
              <div className="font-medium">Modernization Paths</div>
              <div className="text-violet-800">{tile.hover.paths.join(" · ")}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* Right-side detail panel */
function TileDetail({ tile, onClose }: { tile: Tile | null; onClose: () => void }) {
  if (!tile) return null;
  const Icon = tile.icon;
  const adoptionData = Array.from({ length: 12 }).map((_, i) => ({
    m: `M${i + 1}`,
    adoption: Math.round(20 + i * 6 + Math.random() * 8),
    savings: Math.round(10 + i * 4 + Math.random() * 6),
  }));
  return (
    <Sheet open={!!tile} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[40vw] sm:max-w-none p-0 overflow-hidden bg-white" side="right">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`size-10 rounded-lg ${tile.tileBg} flex items-center justify-center`}>
                <Icon className={`size-5 ${tile.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base">{tile.name}</SheetTitle>
                  {tile.status === "new" && <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-[10px]">New</Badge>}
                </div>
                <SheetDescription className="text-[11.5px] text-slate-500 mt-0.5">{tile.blurb}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-5 mt-3 bg-slate-100/70 grid grid-cols-5 h-9">
              <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
              <TabsTrigger value="technical" className="text-[11px]">Technical</TabsTrigger>
              <TabsTrigger value="risks" className="text-[11px]">Risks & Cost</TabsTrigger>
              <TabsTrigger value="metrics" className="text-[11px]">Metrics</TabsTrigger>
              <TabsTrigger value="ai" className="text-[11px]">AI</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <TabsContent value="overview" className="m-0 space-y-4">
                <Section title="Executive Summary">
                  <p className="text-[12px] text-slate-600 leading-relaxed">{tile.panel.summary}</p>
                </Section>
                <div className="grid grid-cols-2 gap-3">
                  <Card title="Current State" tone="rose">
                    <ul className="text-[11.5px] text-slate-700 space-y-1 list-disc list-inside">
                      {tile.panel.currentState.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </Card>
                  <Card title="Future State" tone="emerald">
                    <ul className="text-[11.5px] text-slate-700 space-y-1 list-disc list-inside">
                      {tile.panel.futureState.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </Card>
                </div>
                <Section title="Modernization Drivers">
                  <div className="flex flex-wrap gap-1.5">
                    {tile.panel.drivers.map((d) => (
                      <span key={d} className="text-[11px] px-2 py-1 rounded-md bg-violet-50 text-violet-800 border border-violet-100">{d}</span>
                    ))}
                  </div>
                </Section>
                <Section title="Reliability · Security · Business Impact">
                  <div className="grid grid-cols-1 gap-2">
                    <Pill icon={Gauge} tone="emerald" label="Reliability">{tile.panel.reliability}</Pill>
                    <Pill icon={ShieldCheck} tone="indigo" label="Security">{tile.panel.security}</Pill>
                    <Pill icon={DollarSign} tone="amber" label="Business">{tile.panel.business}</Pill>
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="technical" className="m-0 space-y-4">
                <Section title="Technical Analysis">
                  <ul className="text-[11.5px] text-slate-700 space-y-1.5 list-disc list-inside">
                    {tile.panel.technical.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </Section>
                <Section title="Architecture Diagram">
                  <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <div className="flex flex-col items-center gap-1">
                        <div className="size-9 rounded-md bg-rose-100 flex items-center justify-center"><HardDrive className="size-4 text-rose-600" /></div>
                        <span>Legacy</span>
                      </div>
                      <ArrowRight className="size-4 text-slate-400" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="size-9 rounded-md bg-violet-100 flex items-center justify-center"><GitBranch className="size-4 text-violet-600" /></div>
                        <span>Transform</span>
                      </div>
                      <ArrowRight className="size-4 text-slate-400" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="size-9 rounded-md bg-orange-100 flex items-center justify-center"><Cloud className="size-4 text-orange-600" /></div>
                        <span>Migrate</span>
                      </div>
                      <ArrowRight className="size-4 text-slate-400" />
                      <div className="flex flex-col items-center gap-1">
                        <div className="size-9 rounded-md bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="size-4 text-emerald-600" /></div>
                        <span>Target</span>
                      </div>
                    </div>
                  </div>
                </Section>
                <Section title="Dependencies">
                  <div className="flex flex-wrap gap-1.5">
                    {tile.panel.dependencies.map((d) => (
                      <span key={d} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">{d}</span>
                    ))}
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="risks" className="m-0 space-y-4">
                <Section title="Risks">
                  <div className="space-y-1.5">
                    {tile.panel.risks.map((r) => (
                      <div key={r.text} className="flex items-start gap-2 p-2 rounded-md border border-slate-200 bg-white">
                        <div className={`mt-0.5 size-2 rounded-full ${r.level === "high" ? "bg-rose-500" : r.level === "med" ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <div className="text-[11.5px] text-slate-700">{r.text}</div>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Cost Implications">
                  <div className="grid grid-cols-3 gap-2">
                    {tile.panel.cost.map((c) => (
                      <div key={c.label} className="rounded-md border border-slate-200 p-2.5">
                        <div className="text-[10px] text-slate-500">{c.label}</div>
                        <div className="text-[14px] font-semibold text-slate-900 mt-0.5">{c.value}</div>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Recommended Actions">
                  <ul className="text-[11.5px] text-slate-700 space-y-1 list-decimal list-inside">
                    {tile.panel.actions.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </Section>
              </TabsContent>

              <TabsContent value="metrics" className="m-0 space-y-4">
                <Section title="12-Month Adoption Trend">
                  <div className="h-40 rounded-md border border-slate-200 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={adoptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="m" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <RTooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", fontSize: 11 }} />
                        <Line type="monotone" dataKey="adoption" stroke="#7c3aed" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
                <Section title="Stats">
                  <div className="grid grid-cols-2 gap-2">
                    {tile.hover.stats.map((s) => (
                      <div key={s.label} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-1.5">
                        <span className="text-[11px] text-slate-500">{s.label}</span>
                        <span className="text-[12px] font-semibold text-slate-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Example Reporting Widgets">
                  <div className="flex flex-wrap gap-1.5">
                    {["Burn-down", "Heatmap", "Adoption", "Cost Trend", "Cutover Readiness"].map((w) => (
                      <span key={w} className="text-[10.5px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">{w}</span>
                    ))}
                  </div>
                </Section>
              </TabsContent>

              <TabsContent value="ai" className="m-0 space-y-4">
                <Section title="AI Recommendations">
                  <div className="space-y-1.5">
                    {tile.panel.ai.map((a) => (
                      <div key={a} className="flex items-start gap-2 p-2 rounded-md border border-violet-100 bg-violet-50/40">
                        <Sparkles className="size-3.5 text-violet-600 mt-0.5" />
                        <div className="text-[11.5px] text-slate-700">{a}</div>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Related Services">
                  <div className="flex flex-wrap gap-1.5">
                    {tile.panel.related.map((r) => (
                      <span key={r} className="text-[11px] px-2 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-100">{r}</span>
                    ))}
                  </div>
                </Section>
                <Section title="Example Customer Scenarios">
                  <ul className="text-[11.5px] text-slate-700 space-y-1 list-disc list-inside">
                    {tile.panel.scenarios.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </Section>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2">
            <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"><Rocket className="size-4 mr-1.5" />Launch Modernization</Button>
            <Button variant="outline" className="flex-1">View Roadmap</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-900 uppercase tracking-wide mb-1.5">{title}</div>
      {children}
    </div>
  );
}

function Card({ title, tone, children }: { title: string; tone: "rose" | "emerald"; children: React.ReactNode }) {
  const toneCls = tone === "rose" ? "border-rose-100 bg-rose-50/40" : "border-emerald-100 bg-emerald-50/40";
  return (
    <div className={`rounded-md border ${toneCls} p-2.5`}>
      <div className="text-[11px] font-semibold text-slate-900 mb-1.5">{title}</div>
      {children}
    </div>
  );
}

function Pill({ icon: Icon, tone, label, children }: { icon: LucideIcon; tone: "emerald" | "indigo" | "amber"; label: string; children: React.ReactNode }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  } as const;
  return (
    <div className={`flex items-start gap-2 p-2 rounded-md border ${map[tone]}`}>
      <Icon className="size-3.5 mt-0.5" />
      <div className="text-[11.5px] leading-snug">
        <div className="font-semibold">{label}</div>
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
}

/* KPI Detail */
function KpiDetail({ kpi, onClose }: { kpi: typeof KPIS[number] | null; onClose: () => void }) {
  if (!kpi) return null;
  const Icon = kpi.icon;
  const trend = Array.from({ length: 12 }).map((_, i) => ({ m: i, v: 30 + i * 4 + Math.random() * 12 }));
  return (
    <Sheet open={!!kpi} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[40vw] sm:max-w-none p-0 overflow-hidden bg-white" side="right">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-lg bg-gradient-to-br ${kpi.tone} flex items-center justify-center`}>
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-base">{kpi.label}</SheetTitle>
                <SheetDescription className="text-[11.5px]">Current: {kpi.value} · {kpi.delta}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="h-40 rounded-md border border-slate-200 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="kpig" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="m" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <RTooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", fontSize: 11 }} />
                  <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} fill="url(#kpig)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <Section title="Breakdown">
              <div className="space-y-1.5">
                {kpi.detail.categories.map((c) => (
                  <div key={c.name} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-1.5">
                    <span className="text-[11.5px] text-slate-700">{c.name}</span>
                    <span className="text-[12px] font-semibold text-slate-900">{c.value}</span>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Business Impact">
              <p className="text-[11.5px] text-slate-600">{kpi.detail.impact}</p>
            </Section>
            <Section title="Savings">
              <p className="text-[11.5px] text-slate-600">{kpi.detail.savings}</p>
            </Section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* AI Advisor */
function AiAdvisor() {
  const recs = [
    { icon: Target, tone: "text-violet-600", title: "Sequence Virginia SQL estate first", body: "Highest ROI: $1.1M savings recovered in Q1." },
    { icon: AlertTriangle, tone: "text-rose-600", title: "18 hotspot services drive 47% of incidents", body: "Prioritize debt burn-down on these services." },
    { icon: Zap, tone: "text-amber-600", title: "11 workloads ready for Lambda", body: "Eliminate persistent VM cost for event-driven loads." },
    { icon: Brain, tone: "text-emerald-600", title: "Cluster 412 stored procs into 18 microservices", body: "Use semantic embeddings + write fan-out scoring." },
  ];
  return (
    <div className="rounded-xl bg-white border border-slate-200/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-7 rounded-md bg-violet-100 flex items-center justify-center">
          <Brain className="size-4 text-violet-600" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900">AI Modernization Advisor</div>
          <div className="text-[10.5px] text-slate-500">Recommended next actions across your estate</div>
        </div>
      </div>
      <div className="space-y-2">
        {recs.map((r) => (
          <div key={r.title} className="group flex items-start gap-2 p-2 rounded-md border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors cursor-pointer">
            <r.icon className={`size-3.5 ${r.tone} mt-0.5`} />
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium text-slate-800 leading-tight">{r.title}</div>
              <div className="text-[10.5px] text-slate-500 leading-snug">{r.body}</div>
            </div>
            <ChevronRight className="size-3.5 text-slate-300 ml-auto group-hover:text-violet-600 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Ecosystem graph */
function EcosystemGraph() {
  const nodes = [
    { id: "core", x: 200, y: 130, label: "Estate", size: 18, color: "#7c3aed" },
    { id: "apps", x: 70, y: 60, label: "Apps", size: 10, color: "#0ea5e9" },
    { id: "db", x: 70, y: 130, label: "DBs", size: 10, color: "#10b981" },
    { id: "svc", x: 70, y: 200, label: "Services", size: 10, color: "#f59e0b" },
    { id: "container", x: 330, y: 60, label: "Containers", size: 10, color: "#06b6d4" },
    { id: "cloud", x: 330, y: 130, label: "AWS", size: 10, color: "#fb923c" },
    { id: "api", x: 330, y: 200, label: "APIs", size: 10, color: "#a855f7" },
    { id: "id", x: 200, y: 30, label: "Identity", size: 8, color: "#6366f1" },
    { id: "sec", x: 200, y: 230, label: "Security", size: 8, color: "#ef4444" },
    { id: "obs", x: 200, y: 260, label: "Observability", size: 8, color: "#14b8a6" },
  ];
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="rounded-xl bg-white border border-slate-200/80 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5">
            Modernization Ecosystem <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Live</span>
          </div>
          <div className="text-[10.5px] text-slate-500">Hover a node to highlight modernization relationships</div>
        </div>
      </div>
      <div className="relative">
        <svg viewBox="0 0 400 300" className="w-full h-[300px]">
          {nodes.filter(n => n.id !== "core").map((n) => {
            const core = nodes[0];
            const isActive = active === n.id || active === "core";
            return (
              <line
                key={n.id}
                x1={core.x} y1={core.y} x2={n.x} y2={n.y}
                stroke={isActive ? n.color : "#e2e8f0"}
                strokeWidth={isActive ? 1.8 : 1}
                strokeDasharray={isActive ? "0" : "3 3"}
                opacity={active && !isActive ? 0.25 : 1}
                className="transition-all duration-300"
              />
            );
          })}
          {nodes.map((n) => {
            const isActive = active === n.id;
            const dim = active && !isActive && n.id !== "core";
            return (
              <g
                key={n.id}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
                className="cursor-pointer"
                opacity={dim ? 0.45 : 1}
              >
                <circle cx={n.x} cy={n.y} r={n.size + (isActive ? 4 : 0)} fill={n.color} opacity={0.15} className="transition-all" />
                <circle cx={n.x} cy={n.y} r={n.size * 0.55} fill={n.color} className="transition-all" />
                <text x={n.x} y={n.y + n.size + 14} textAnchor="middle" fontSize="10" fill="#475569" fontWeight={isActive ? 600 : 400}>{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10.5px] text-slate-500">
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sky-500" />Applications</div>
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" />Databases</div>
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" />Services</div>
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500" />Cloud</div>
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-purple-500" />APIs</div>
        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" />Security</div>
      </div>
    </div>
  );
}

/* Impact strip */
function ImpactStrip({ onMetricClick }: { onMetricClick: (id: string) => void }) {
  const metrics = [
    { id: "assessed", label: "Applications Assessed", value: "312", delta: "+18%", spark: [12, 18, 24, 28, 33, 41, 47, 56, 64, 71, 78, 86], color: "#0ea5e9" },
    { id: "completed", label: "Modernizations Completed", value: "47", delta: "+26%", spark: [4, 6, 8, 11, 14, 18, 22, 28, 33, 38, 42, 47], color: "#10b981" },
    { id: "retired", label: "Debt Items Retired", value: "284", delta: "+32%", spark: [10, 22, 38, 54, 74, 98, 124, 152, 186, 220, 252, 284], color: "#7c3aed" },
    { id: "cost", label: "Cost Savings Identified", value: "$2.1M", delta: "+27%", spark: [120, 240, 380, 520, 700, 880, 1100, 1320, 1540, 1740, 1920, 2100], color: "#f59e0b" },
    { id: "deploy", label: "Deployment Frequency", value: "3.6x", delta: "+41%", spark: [1, 1.2, 1.4, 1.6, 1.9, 2.1, 2.4, 2.7, 2.9, 3.1, 3.4, 3.6], color: "#ef4444" },
    { id: "cfr", label: "Change Failure Rate", value: "-38%", delta: "-28%", spark: [12, 11, 10, 9.5, 8.7, 8, 7.5, 6.8, 6.2, 5.6, 5.1, 4.6], color: "#06b6d4" },
  ];
  return (
    <div className="rounded-xl bg-white border border-slate-200/80 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[13px] font-semibold text-slate-900">Modernization Impact</div>
          <div className="text-[10.5px] text-slate-500">Last 90 Days · click any metric for breakdown</div>
        </div>
        <Badge variant="outline" className="text-[10px]">90d</Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => onMetricClick(m.id)}
            className="text-left rounded-md border border-slate-100 p-2.5 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="text-[10.5px] text-slate-500">{m.label}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-[18px] font-semibold text-slate-900 tabular-nums">{m.value}</div>
              <div className="text-[10.5px] font-medium text-emerald-600">{m.delta}</div>
            </div>
            <div className="mt-1">
              <Sparkline data={m.spark} color={m.color} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================== */
/*  Page                                                           */
/* ============================================================== */
export default function ModernizationFactory() {
  const [openTile, setOpenTile] = useState<Tile | null>(null);
  const [openKpi, setOpenKpi] = useState<typeof KPIS[number] | null>(null);

  return (
    <AppShell>
      <div className="min-h-full bg-slate-50/40">
        <div className="px-6 py-5 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                <span>Automation & Marketplace</span>
                <ChevronRight className="size-3" />
                <span>Modernization Factory</span>
                <Badge variant="outline" className="ml-1 text-[10px]">Internal</Badge>
              </div>
              <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="size-5 text-violet-600" />
                Application & Data Modernization Factory
              </h1>
              <p className="text-[12.5px] text-slate-500 mt-0.5 max-w-3xl">
                Self-service modernization assessments, migration accelerators, architecture transformations, and technical debt reduction workflows.
              </p>
            </div>
          </div>

          {/* KPI strip */}
          <div className="rounded-xl bg-white border border-slate-200/80 p-3 mb-5">
            <div className="flex gap-3 flex-wrap">
              {KPIS.map((k) => (
                <KpiCard key={k.id} kpi={k} onClick={() => setOpenKpi(k)} />
              ))}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-9 space-y-5">
              {/* Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TILES.map((t) => (
                  <TileCard key={t.id} tile={t} onOpen={() => setOpenTile(t)} />
                ))}
              </div>
              {/* Ecosystem + Impact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <EcosystemGraph />
                <ImpactStrip onMetricClick={() => {}} />
              </div>
            </div>

            {/* Right rail */}
            <div className="col-span-12 xl:col-span-3 space-y-5">
              <AiAdvisor />
              <div className="rounded-xl bg-white border border-slate-200/80 p-4">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">Operating Principles</div>
                <ul className="space-y-1.5 text-[11.5px] text-slate-600">
                  {[
                    "Modernization is a continuous platform capability, not a project.",
                    "Every legacy system has a planned future state.",
                    "Technical debt is measured, owned, and budgeted.",
                    "Acquisitions onboard onto a standard platform.",
                    "Containerization follows decomposition; not the other way around.",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-emerald-500 mt-0.5 shrink-0" />{p}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-4" />
                  <div className="text-[12px] font-semibold">Modernization Factory · Live</div>
                </div>
                <div className="text-[11px] text-white/80 leading-snug">
                  7 modernization workflows in flight · 23 candidates queued · next executive review in 4 days.
                </div>
                <Button size="sm" className="mt-3 bg-white/15 hover:bg-white/25 text-white border border-white/20">
                  Open Roadmap <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TileDetail tile={openTile} onClose={() => setOpenTile(null)} />
      <KpiDetail kpi={openKpi} onClose={() => setOpenKpi(null)} />
    </AppShell>
  );
}
