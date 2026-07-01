import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Cloud, Database, HardDrive, Server, Shield, Network as NetIcon,
  Monitor, Activity, Boxes, Lock, ArrowUpRight, ArrowDownRight,
  ArrowRight, Minus, Filter, GitCompare, Share2, RefreshCw, X,
  Calendar, ChevronRight, CheckCircle2, AlertTriangle, Clock,
  Sparkles, Target, DollarSign, TrendingUp, BarChart3, Settings,
  Users, Workflow, Zap, FileBarChart, Tag, Eye, Wrench, Bell,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line } from "recharts";

/* ============== Types ============== */
type Status = "In Flight" | "Stable" | "At Risk" | "Planned";
type Trend = "up" | "down" | "flat";

type ExecStep = {
  name: string;
  owner: string;
  pct: number;
  start: string;
  forecast: string;
  dep: string;
  savings: string;
  status: "Completed" | "In Flight" | "At Risk" | "Blocked" | "Planned";
  risk: "Low" | "Medium" | "High";
};

type Row = {
  id: string;
  letter: string;
  name: string;
  icon: LucideIcon;
  scope: string;
  baseline: number;       // $K
  trendPct: number;
  trendDir: Trend;
  forecast: number;       // $K
  target: number;         // $K
  gap: number;            // $K
  achieve: string;
  owner: string;
  status: Status;
  overview: string;
  steps: ExecStep[];
  metrics: { metric: string; baseline: string; current: string; target: string; trend: Trend; owner: string }[];
  dependencies: string[];
  risks: string[];
  automation: string[];
  nextAction: string;
  spark: number[];
  annualOpportunity: string;
  completion: string;
  maturity: string;
  reviewed: string;
};

/* ============== Helpers ============== */
const k = (n: number) => `$${n}K`;
const fmtSpark = (arr: number[]) => arr.map((v, i) => ({ i, v }));

const statusStyle = (s: Status) => {
  switch (s) {
    case "In Flight": return "bg-sky-50 text-sky-700 border-sky-200";
    case "Stable": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "At Risk": return "bg-orange-50 text-orange-700 border-orange-200";
    case "Planned": return "bg-violet-50 text-violet-700 border-violet-200";
  }
};
const statusDot = (s: Status) => {
  switch (s) {
    case "In Flight": return "bg-sky-500";
    case "Stable": return "bg-emerald-500";
    case "At Risk": return "bg-orange-500";
    case "Planned": return "bg-violet-500";
  }
};

const stepColor = (s: ExecStep["status"]) =>
  s === "Completed" ? "bg-emerald-500"
  : s === "In Flight" ? "bg-sky-500"
  : s === "At Risk" ? "bg-orange-500"
  : s === "Blocked" ? "bg-rose-500"
  : "bg-slate-300";

/* ============== Data ============== */
const ROWS: Row[] = [
  {
    id: "A", letter: "A", name: "AWS Windows EC2 Production", icon: Cloud,
    scope: "Core HHA workloads",
    baseline: 290, trendPct: 4.2, trendDir: "up",
    forecast: 302, target: 245, gap: 57,
    achieve: "Rightsizing, RI / Savings Plans, non-prod scheduling",
    owner: "Cloud Platform", status: "In Flight",
    overview: "Core HHA production workloads running largely on AWS Windows EC2. Cost optimization focuses on rightsizing, instance lifecycle management, reserved commitment coverage, non-production scheduling, and decommissioning unused capacity.",
    steps: [
      { name: "Inventory EC2 estate", owner: "Cloud Platform", pct: 100, start: "Apr 1", forecast: "May 20", dep: "Tagging coverage", savings: "$0K", status: "Completed", risk: "Low" },
      { name: "Map workloads to products & environments", owner: "Cloud Platform", pct: 85, start: "Apr 15", forecast: "May 30", dep: "Service ownership", savings: "$4K", status: "In Flight", risk: "Low" },
      { name: "Identify idle / underutilized instances", owner: "FinOps Lead", pct: 72, start: "May 1", forecast: "Jun 7", dep: "Inventory", savings: "$11K", status: "In Flight", risk: "Medium" },
      { name: "Apply rightsizing recommendations", owner: "Cloud Engineering", pct: 54, start: "May 10", forecast: "Jun 21", dep: "App owner approval", savings: "$18K", status: "In Flight", risk: "Medium" },
      { name: "Expand RI / Savings Plan coverage", owner: "FinOps & Finance", pct: 40, start: "May 15", forecast: "Jun 30", dep: "Finance approval", savings: "$12K", status: "In Flight", risk: "Low" },
      { name: "Enable non-prod schedules", owner: "Platform Engineering", pct: 35, start: "May 20", forecast: "Jul 8", dep: "Env model", savings: "$8K", status: "In Flight", risk: "Medium" },
      { name: "Decommission orphaned instances", owner: "Infra Operations", pct: 28, start: "Jun 1", forecast: "Jul 15", dep: "Dependency map", savings: "$4K", status: "At Risk", risk: "High" },
    ],
    metrics: [
      { metric: "Avg CPU utilization", baseline: "18%", current: "27%", target: "45%", trend: "up", owner: "Cloud Platform" },
      { metric: "Instance coverage", baseline: "76%", current: "88%", target: "98%", trend: "up", owner: "Cloud Platform" },
      { metric: "RI / SP coverage", baseline: "42%", current: "58%", target: "80%", trend: "up", owner: "FinOps" },
      { metric: "Idle instance count", baseline: "112", current: "74", target: "<20", trend: "down", owner: "FinOps" },
      { metric: "Monthly run rate", baseline: "$290K", current: "$302K", target: "$245K", trend: "up", owner: "Cloud Platform" },
      { metric: "Unit cost / product line", baseline: "$0.052", current: "$0.046", target: "$0.038", trend: "down", owner: "FinOps" },
    ],
    dependencies: ["Application owner approval", "Change windows", "Tagging coverage", "Service ownership model", "Cloud account governance"],
    risks: ["Application teams may resist rightsizing", "Unknown dependencies may block decommissioning", "Non-prod schedules may be incomplete", "Savings may not persist without policy enforcement"],
    automation: ["AI-assisted rightsizing review", "Idle resource detector", "Schedule compliance bot", "RI coverage recommender", "Drift detection workflow"],
    nextAction: "Approve the first production rightsizing wave and confirm product owner sign off.",
    spark: [288, 292, 290, 295, 298, 300, 302, 301, 303, 302],
    annualOpportunity: "$684K",
    completion: "Jul 15, 2026",
    maturity: "Operating",
    reviewed: "May 13, 2026",
  },
  {
    id: "B", letter: "B", name: "AWS EKS / Container Platform", icon: Boxes,
    scope: "Shared product services",
    baseline: 96, trendPct: 6.8, trendDir: "up",
    forecast: 101, target: 82, gap: 19,
    achieve: "Cluster consolidation, node sizing, autoscaling guardrails",
    owner: "Platform Eng", status: "In Flight",
    overview: "Shared EKS and container services are growing as modernization accelerates. Optimization focuses on cluster consolidation, node group sizing, namespace allocation, autoscaling policy, and chargeback visibility.",
    steps: [
      { name: "Inventory clusters & namespaces", owner: "Platform Engineering", pct: 90, start: "Apr 5", forecast: "May 22", dep: "Tagging", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Map namespaces to product teams", owner: "Platform Engineering", pct: 75, start: "Apr 20", forecast: "Jun 1", dep: "Ownership model", savings: "$2K", status: "In Flight", risk: "Low" },
      { name: "Right-size node groups", owner: "Cloud Platform", pct: 62, start: "May 1", forecast: "Jun 15", dep: "Inventory", savings: "$6K", status: "In Flight", risk: "Medium" },
      { name: "Cluster autoscaling guardrails", owner: "Platform Engineering", pct: 50, start: "May 10", forecast: "Jun 22", dep: "Observability", savings: "$4K", status: "In Flight", risk: "Medium" },
      { name: "Namespace chargeback model", owner: "FinOps Lead", pct: 35, start: "May 20", forecast: "Jul 2", dep: "Ownership", savings: "$3K", status: "In Flight", risk: "Medium" },
      { name: "Retire duplicate clusters", owner: "Platform Engineering", pct: 20, start: "Jun 1", forecast: "Jul 18", dep: "Migration readiness", savings: "$3K", status: "At Risk", risk: "High" },
    ],
    metrics: [
      { metric: "Node utilization", baseline: "32%", current: "44%", target: "65%", trend: "up", owner: "Platform Eng" },
      { metric: "Pod density", baseline: "12", current: "18", target: "28", trend: "up", owner: "Platform Eng" },
      { metric: "Idle capacity", baseline: "38%", current: "26%", target: "<10%", trend: "down", owner: "Platform Eng" },
      { metric: "Cluster count", baseline: "14", current: "12", target: "8", trend: "down", owner: "Platform Eng" },
      { metric: "Cost / namespace", baseline: "$1.4K", current: "$1.2K", target: "$0.9K", trend: "down", owner: "FinOps" },
      { metric: "Change failure rate", baseline: "12%", current: "8%", target: "<5%", trend: "down", owner: "SRE" },
    ],
    dependencies: ["Container platform standards", "Product team migration readiness", "Observability coverage", "Security baseline", "GitHub pipeline patterns"],
    risks: ["Clusters used inconsistently", "Autoscaling may not reflect real demand", "Chargeback requires tagging and namespace ownership", "Modernization demand may increase cost before reducing it"],
    automation: ["Cluster rightsizing assistant", "Autoscaling recommendation workflow", "Namespace cost allocation bot", "Unused workload detector"],
    nextAction: "Complete namespace ownership mapping and publish cluster cost scorecards.",
    spark: [94, 95, 96, 97, 98, 99, 100, 101, 102, 101],
    annualOpportunity: "$228K", completion: "Jul 18, 2026", maturity: "Defined", reviewed: "May 12, 2026",
  },
  {
    id: "C", letter: "C", name: "GCP Self-Direction Estate", icon: Cloud,
    scope: "Single-tenant product line",
    baseline: 62, trendPct: -2.7, trendDir: "down",
    forecast: 60, target: 54, gap: 6,
    achieve: "Commit discounts, workload rationalization, migration tuning",
    owner: "Cloud Platform", status: "Stable",
    overview: "GCP supports a specific single-tenant product line. The target is to maintain what must remain, rationalize where possible, apply committed use discounts, and tune migration economics as workloads shift toward the strategic AWS posture.",
    steps: [
      { name: "Confirm GCP product ownership", owner: "Cloud Platform", pct: 100, start: "Apr 1", forecast: "May 15", dep: "Product roadmap", savings: "$0K", status: "Completed", risk: "Low" },
      { name: "Inventory projects & services", owner: "Cloud Platform", pct: 86, start: "Apr 10", forecast: "May 28", dep: "Tagging", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Identify idle GCP services", owner: "FinOps Lead", pct: 65, start: "Apr 25", forecast: "Jun 10", dep: "Inventory", savings: "$2K", status: "In Flight", risk: "Low" },
      { name: "Review committed use discount coverage", owner: "Finance", pct: 52, start: "May 5", forecast: "Jun 17", dep: "Forecast", savings: "$2K", status: "In Flight", risk: "Low" },
      { name: "Evaluate AWS migration candidates", owner: "Architecture", pct: 30, start: "May 20", forecast: "Jul 15", dep: "Customer commitments", savings: "$1K", status: "In Flight", risk: "Medium" },
      { name: "Retire unused GCP artifacts", owner: "Cloud Engineering", pct: 25, start: "Jun 1", forecast: "Jul 22", dep: "Idle inventory", savings: "$1K", status: "In Flight", risk: "Low" },
    ],
    metrics: [
      { metric: "Project count", baseline: "42", current: "38", target: "28", trend: "down", owner: "Cloud Platform" },
      { metric: "Committed use coverage", baseline: "31%", current: "48%", target: "75%", trend: "up", owner: "Finance" },
      { metric: "Idle service count", baseline: "27", current: "18", target: "<5", trend: "down", owner: "FinOps" },
      { metric: "Spend by product line", baseline: "$62K", current: "$60K", target: "$54K", trend: "down", owner: "FinOps" },
      { metric: "Migration candidate value", baseline: "$0", current: "$8K/mo", target: "$14K/mo", trend: "up", owner: "Architecture" },
      { metric: "Support burden", baseline: "High", current: "Medium", target: "Low", trend: "down", owner: "Cloud Platform" },
    ],
    dependencies: ["Self-direction roadmap", "Product owner approval", "Customer commitments", "Data migration feasibility", "Security controls"],
    risks: ["Single-tenant commitments may limit consolidation", "Migration cost may exceed savings", "Hidden dependencies may exist", "Support team skills may remain fragmented"],
    automation: ["GCP idle service detector", "Project tagging validator", "Committed use recommender", "Migration candidate scorer"],
    nextAction: "Complete product owner validation of which GCP workloads are strategic versus transition candidates.",
    spark: [64, 63, 62, 62, 61, 60, 60, 60, 60, 60],
    annualOpportunity: "$72K", completion: "Jul 22, 2026", maturity: "Operating", reviewed: "May 11, 2026",
  },
  {
    id: "D", letter: "D", name: "Virginia Data Center", icon: HardDrive,
    scope: "Legacy enterprise workloads",
    baseline: 178, trendPct: 0.8, trendDir: "flat",
    forecast: 179, target: 120, gap: 59,
    achieve: "Server consolidation, storage tiering, exit planning",
    owner: "Infra Ops", status: "At Risk",
    overview: "Virginia data center hosts legacy enterprise workloads and carries operational, hardware, storage, and migration complexity. FinOps focus is reducing run rate through consolidation, storage tiering, lifecycle management, and selective migration planning.",
    steps: [
      { name: "Workload inventory", owner: "Infra Operations", pct: 78, start: "Apr 1", forecast: "Jun 5", dep: "CMDB", savings: "$2K", status: "In Flight", risk: "Medium" },
      { name: "Map hardware, storage, app dependencies", owner: "Architecture", pct: 55, start: "Apr 20", forecast: "Jun 20", dep: "Inventory", savings: "$3K", status: "In Flight", risk: "Medium" },
      { name: "Identify consolidation candidates", owner: "Infra Operations", pct: 42, start: "May 5", forecast: "Jul 1", dep: "Dep map", savings: "$8K", status: "In Flight", risk: "Medium" },
      { name: "Define storage tiering policy", owner: "Reliability Operations", pct: 35, start: "May 12", forecast: "Jul 12", dep: "Retention policy", savings: "$6K", status: "In Flight", risk: "Medium" },
      { name: "Migration & retirement plan", owner: "Architecture", pct: 25, start: "May 20", forecast: "Aug 1", dep: "Wave model", savings: "$12K", status: "At Risk", risk: "High" },
      { name: "Execute wave 1 consolidation", owner: "Infra Operations", pct: 10, start: "Jun 15", forecast: "Aug 30", dep: "Plan", savings: "$28K", status: "Planned", risk: "High" },
    ],
    metrics: [
      { metric: "Server count", baseline: "184", current: "172", target: "92", trend: "down", owner: "Infra Ops" },
      { metric: "Storage growth (90d)", baseline: "+14%", current: "+11%", target: "<+4%", trend: "down", owner: "Infra Ops" },
      { metric: "Hardware lifecycle risk", baseline: "High", current: "High", target: "Medium", trend: "flat", owner: "Architecture" },
      { metric: "Data center run rate", baseline: "$178K", current: "$179K", target: "$120K", trend: "flat", owner: "Infra Ops" },
      { metric: "Migration readiness", baseline: "12%", current: "28%", target: "75%", trend: "up", owner: "Architecture" },
      { metric: "Dep mapping coverage", baseline: "22%", current: "55%", target: "95%", trend: "up", owner: "Architecture" },
    ],
    dependencies: ["SQL Server footprint", "Application modernization", "Backup and recovery", "Network architecture", "Customer commitments", "Security controls"],
    risks: ["Legacy dependencies may block consolidation", "Data center exit may be a long pole", "Storage growth may offset savings", "Hardware lifecycle events may create unplanned spend"],
    automation: ["Asset inventory reconciliation", "Dependency discovery assistant", "Storage tiering analyzer", "Migration wave planner"],
    nextAction: "Approve dependency discovery and consolidation wave design for the Virginia environment.",
    spark: [176, 177, 178, 178, 179, 179, 180, 179, 179, 179],
    annualOpportunity: "$708K", completion: "Aug 30, 2026", maturity: "Forming", reviewed: "May 12, 2026",
  },
  {
    id: "E", letter: "E", name: "SQL Server Bare Metal Footprint", icon: Database,
    scope: "Enterprise databases in Virginia",
    baseline: 232, trendPct: -1.4, trendDir: "down",
    forecast: 229, target: 160, gap: 69,
    achieve: "DB footprint reduction, modernization, selective move to AWS",
    owner: "Database / Arch", status: "At Risk",
    overview: "Legacy SQL Server on bare metal in Virginia is the largest targeted cost concentration. The strategy is not a blind lift and shift. The strategy is footprint reduction, application modernization, selective migration, storage optimization, and better data platform patterns.",
    steps: [
      { name: "Database inventory & baseline", owner: "Database / Architecture", pct: 100, start: "Apr 1", forecast: "May 18", dep: "CMDB", savings: "$0K", status: "Completed", risk: "Low" },
      { name: "Map databases to product workflows", owner: "Database Architecture", pct: 72, start: "Apr 20", forecast: "Jun 10", dep: "App owners", savings: "$4K", status: "In Flight", risk: "Medium" },
      { name: "Identify high-cost, low-utilization DBs", owner: "Database Engineering", pct: 58, start: "May 1", forecast: "Jun 24", dep: "Inventory", savings: "$9K", status: "In Flight", risk: "Medium" },
      { name: "Define modernization candidates", owner: "Architecture", pct: 42, start: "May 12", forecast: "Jul 15", dep: "App roadmap", savings: "$14K", status: "In Flight", risk: "High" },
      { name: "Optimize backup & storage tiers", owner: "Reliability Operations", pct: 38, start: "May 18", forecast: "Jul 22", dep: "Retention", savings: "$8K", status: "In Flight", risk: "Medium" },
      { name: "Evaluate selective AWS migration", owner: "DB & Cloud Architecture", pct: 28, start: "Jun 1", forecast: "Aug 15", dep: "Customer downtime tolerance", savings: "$18K", status: "At Risk", risk: "High" },
      { name: "Execute wave 1 database reduction", owner: "Database Engineering", pct: 12, start: "Jul 1", forecast: "Sep 15", dep: "Wave plan", savings: "$16K", status: "Planned", risk: "High" },
    ],
    metrics: [
      { metric: "CPU utilization", baseline: "22%", current: "31%", target: "55%", trend: "up", owner: "Database Eng" },
      { metric: "Storage growth (90d)", baseline: "+18%", current: "+11%", target: "<+5%", trend: "down", owner: "Database Eng" },
      { metric: "Backup cost", baseline: "$48K/mo", current: "$41K/mo", target: "$28K/mo", trend: "down", owner: "Reliability Ops" },
      { metric: "Database count", baseline: "412", current: "388", target: "240", trend: "down", owner: "Database Eng" },
      { metric: "Patch compliance", baseline: "78%", current: "87%", target: "98%", trend: "up", owner: "Database Eng" },
      { metric: "Recovery readiness", baseline: "84%", current: "92%", target: "99%", trend: "up", owner: "Reliability Ops" },
      { metric: "SQL licensing exposure", baseline: "High", current: "High", target: "Low", trend: "flat", owner: "Finance" },
      { metric: "Monthly run rate", baseline: "$232K", current: "$229K", target: "$160K", trend: "down", owner: "Database / Arch" },
    ],
    dependencies: ["Application modernization", "AWS migration analysis", "Backup policy", "Data retention policy", "Claims and payroll reliability", "Customer downtime tolerance"],
    risks: ["Database logic embedded in stored procedures", "Large data sets may limit migration speed", "Performance risk may outweigh short-term savings", "Application teams may not be ready for refactoring"],
    automation: ["Database footprint analyzer", "Stored procedure dependency mapper", "Backup cost optimizer", "SQL modernization candidate scorer", "Migration readiness assistant"],
    nextAction: "Prioritize the top 20 databases by cost, business criticality, and modernization feasibility.",
    spark: [236, 234, 232, 232, 230, 229, 229, 230, 229, 229],
    annualOpportunity: "$828K", completion: "Sep 15, 2026", maturity: "Forming", reviewed: "May 12, 2026",
  },
  {
    id: "F", letter: "F", name: "Backup & Recovery", icon: Shield,
    scope: "Cross-cloud and on-prem protection",
    baseline: 118, trendPct: 5.1, trendDir: "up",
    forecast: 121, target: 78, gap: 43,
    achieve: "Retention tiering, immutability optimization, backup policy cleanup",
    owner: "Reliability Ops", status: "In Flight",
    overview: "Backup and recovery costs span cloud and on-premises environments. Optimization focuses on retention tiers, immutability controls, duplicate policy cleanup, recovery testing, and matching backup cost to business criticality.",
    steps: [
      { name: "Inventory backup policies", owner: "Reliability Operations", pct: 80, start: "Apr 5", forecast: "May 28", dep: "CMDB", savings: "$2K", status: "In Flight", risk: "Low" },
      { name: "Map policies to services", owner: "Reliability Operations", pct: 62, start: "Apr 25", forecast: "Jun 14", dep: "Service catalog", savings: "$3K", status: "In Flight", risk: "Medium" },
      { name: "Identify redundant retention policies", owner: "FinOps Lead", pct: 50, start: "May 5", forecast: "Jun 21", dep: "Mapping", savings: "$6K", status: "In Flight", risk: "Medium" },
      { name: "Tiered retention standards", owner: "Reliability & Security", pct: 44, start: "May 10", forecast: "Jul 5", dep: "Policy approval", savings: "$10K", status: "In Flight", risk: "Medium" },
      { name: "Validate immutability & air-gap", owner: "Security", pct: 40, start: "May 12", forecast: "Jul 12", dep: "Security standards", savings: "$5K", status: "In Flight", risk: "Medium" },
      { name: "Recovery tests by tier", owner: "Reliability Operations", pct: 22, start: "Jun 1", forecast: "Aug 1", dep: "Tiering", savings: "$3K", status: "Planned", risk: "Medium" },
      { name: "Remove orphaned backups", owner: "Reliability Operations", pct: 18, start: "Jun 10", forecast: "Aug 12", dep: "Mapping", savings: "$14K", status: "Planned", risk: "Medium" },
    ],
    metrics: [
      { metric: "Backup cost / TB", baseline: "$28", current: "$24", target: "$15", trend: "down", owner: "Reliability Ops" },
      { metric: "Retention compliance", baseline: "72%", current: "85%", target: "98%", trend: "up", owner: "Reliability Ops" },
      { metric: "Recovery test completion", baseline: "32%", current: "54%", target: "95%", trend: "up", owner: "Reliability Ops" },
      { metric: "Backup policy count", baseline: "286", current: "240", target: "120", trend: "down", owner: "Reliability Ops" },
      { metric: "Orphaned backup count", baseline: "1,240", current: "780", target: "<100", trend: "down", owner: "Reliability Ops" },
      { metric: "RTO/RPO alignment", baseline: "58%", current: "74%", target: "95%", trend: "up", owner: "Reliability Ops" },
    ],
    dependencies: ["Service tiering", "Security requirements", "Data retention policy", "SQL Server footprint", "DR strategy", "Application owner approval"],
    risks: ["Cost reductions may weaken resilience if not governed", "Recovery requirements may be unclear", "Retention policies duplicated across acquisitions", "Orphaned backups hard to validate"],
    automation: ["Backup policy analyzer", "Orphaned backup detector", "Recovery readiness bot", "Retention tier recommender", "RTO / RPO validator"],
    nextAction: "Approve tiered retention standards and run a backup policy cleanup wave.",
    spark: [114, 116, 118, 119, 120, 121, 121, 122, 121, 121],
    annualOpportunity: "$516K", completion: "Aug 12, 2026", maturity: "Defined", reviewed: "May 13, 2026",
  },
  {
    id: "G", letter: "G", name: "Observability Tooling", icon: Monitor,
    scope: "Datadog + Uptrends",
    baseline: 84, trendPct: 7.9, trendDir: "up",
    forecast: 88, target: 65, gap: 23,
    achieve: "Log ingest controls, monitor rationalization, dashboard cleanup",
    owner: "SRE", status: "In Flight",
    overview: "Datadog and Uptrends provide critical visibility but require governance over log ingest, custom metrics, monitor sprawl, synthetics, dashboard usage, and alert quality. FinOps target is cost control without weakening production visibility.",
    steps: [
      { name: "Inventory Datadog usage by service", owner: "SRE", pct: 82, start: "Apr 8", forecast: "May 30", dep: "Tagging", savings: "$2K", status: "In Flight", risk: "Low" },
      { name: "Map monitors to service owners", owner: "SRE", pct: 66, start: "Apr 22", forecast: "Jun 10", dep: "Service catalog", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Identify noisy / duplicate monitors", owner: "Observability Engineer", pct: 55, start: "May 1", forecast: "Jun 18", dep: "Mapping", savings: "$3K", status: "In Flight", risk: "Medium" },
      { name: "Apply log ingest controls", owner: "SRE", pct: 42, start: "May 8", forecast: "Jul 2", dep: "Inventory", savings: "$9K", status: "In Flight", risk: "Medium" },
      { name: "Rationalize synthetics & dashboards", owner: "SRE", pct: 33, start: "May 15", forecast: "Jul 15", dep: "Usage data", savings: "$4K", status: "In Flight", risk: "Medium" },
      { name: "Observability cost allocation", owner: "FinOps Lead", pct: 25, start: "Jun 1", forecast: "Jul 30", dep: "Ownership", savings: "$4K", status: "Planned", risk: "Low" },
    ],
    metrics: [
      { metric: "Log ingest volume", baseline: "12 TB/mo", current: "14 TB/mo", target: "8 TB/mo", trend: "up", owner: "SRE" },
      { metric: "Custom metric count", baseline: "42K", current: "38K", target: "20K", trend: "down", owner: "SRE" },
      { metric: "Monitor count", baseline: "3,840", current: "3,210", target: "1,800", trend: "down", owner: "SRE" },
      { metric: "Actionable alert rate", baseline: "28%", current: "44%", target: "75%", trend: "up", owner: "SRE" },
      { metric: "Dashboard usage", baseline: "38%", current: "52%", target: "80%", trend: "up", owner: "SRE" },
      { metric: "MTTD", baseline: "22m", current: "14m", target: "<5m", trend: "down", owner: "SRE" },
      { metric: "MTTR", baseline: "1h 48m", current: "1h 12m", target: "<30m", trend: "down", owner: "SRE" },
    ],
    dependencies: ["Service ownership", "Datadog tagging", "SLO model", "Incident process", "Application ownership", "Platform standards"],
    risks: ["Cost controls may reduce visibility", "Teams may create duplicate monitors", "Noisy alerts may remain unmanaged", "Synthetics may not be tied to business journeys"],
    automation: ["Log ingest anomaly detector", "Duplicate monitor detector", "Alert quality scorer", "Dashboard usage analyzer", "SLO coverage assistant"],
    nextAction: "Implement log ingest guardrails and map Datadog costs to service owners.",
    spark: [80, 82, 84, 85, 86, 87, 88, 88, 89, 88],
    annualOpportunity: "$276K", completion: "Jul 30, 2026", maturity: "Defined", reviewed: "May 13, 2026",
  },
  {
    id: "H", letter: "H", name: "Citrix / EUC Delivery", icon: Server,
    scope: "Citrix, secure browser, user access",
    baseline: 45, trendPct: 0.5, trendDir: "flat",
    forecast: 45, target: 38, gap: 7,
    achieve: "License optimization, ADC retirement, browser access standardization",
    owner: "EUC", status: "Planned",
    overview: "Citrix is used for specific legacy access patterns and thick-client needs. Optimization focuses on license alignment, secure browser strategy, ADC rationalization, and reducing specialist support demand.",
    steps: [
      { name: "Inventory Citrix apps & users", owner: "EUC", pct: 70, start: "Apr 10", forecast: "Jun 7", dep: "Asset mgmt", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Validate license consumption", owner: "EUC & Finance", pct: 52, start: "Apr 28", forecast: "Jun 21", dep: "Inventory", savings: "$2K", status: "In Flight", risk: "Medium" },
      { name: "Assess secure browser candidates", owner: "EUC & Security", pct: 35, start: "May 10", forecast: "Jul 10", dep: "Security review", savings: "$2K", status: "In Flight", risk: "Medium" },
      { name: "ADC retirement / reduction path", owner: "Network & EUC", pct: 20, start: "May 25", forecast: "Aug 1", dep: "Network architecture", savings: "$1K", status: "Planned", risk: "Medium" },
      { name: "Surge Citrix expertise model", owner: "EUC", pct: 15, start: "Jun 5", forecast: "Aug 12", dep: "Vendor agreement", savings: "$1K", status: "Planned", risk: "Low" },
    ],
    metrics: [
      { metric: "License utilization", baseline: "62%", current: "71%", target: "92%", trend: "up", owner: "EUC" },
      { metric: "Cost / user", baseline: "$48", current: "$42", target: "$32", trend: "down", owner: "EUC" },
      { metric: "Application count", baseline: "118", current: "104", target: "60", trend: "down", owner: "EUC" },
      { metric: "Support hours", baseline: "420", current: "340", target: "180", trend: "down", owner: "EUC" },
      { metric: "ADC count", baseline: "8", current: "8", target: "3", trend: "flat", owner: "Network" },
      { metric: "Legacy access risk", baseline: "Medium", current: "Medium", target: "Low", trend: "flat", owner: "Security" },
    ],
    dependencies: ["Legacy application roadmap", "Security requirements", "Network architecture", "Vendor licensing", "User acceptance testing"],
    risks: ["Specialist expertise needed intermittently", "Legacy application constraints", "License model may be inflexible", "User disruption risk"],
    automation: ["License utilization monitor", "Inactive user detector", "Secure browser candidate analyzer", "Citrix health check workflow"],
    nextAction: "Complete license utilization review and determine which workloads can move to secure browser access.",
    spark: [45, 45, 45, 45, 45, 45, 45, 45, 45, 45],
    annualOpportunity: "$84K", completion: "Aug 12, 2026", maturity: "Forming", reviewed: "May 9, 2026",
  },
  {
    id: "I", letter: "I", name: "Network & Connectivity", icon: NetIcon,
    scope: "VPN, egress, interconnects, security paths",
    baseline: 58, trendPct: 3.3, trendDir: "up",
    forecast: 60, target: 46, gap: 14,
    achieve: "Traffic shaping, peering optimization, route cleanup",
    owner: "NetOps", status: "Planned",
    overview: "Network and connectivity costs include VPN, egress, interconnects, routing, firewall paths, and security pathways. Optimization focuses on traffic visibility, peering, routing cleanup, egress controls, and business continuity design.",
    steps: [
      { name: "Baseline network spend & flows", owner: "NetOps", pct: 65, start: "Apr 12", forecast: "Jun 12", dep: "Flow logs", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Map egress by product & env", owner: "NetOps & FinOps", pct: 45, start: "Apr 28", forecast: "Jun 28", dep: "Tagging", savings: "$3K", status: "In Flight", risk: "Medium" },
      { name: "Identify routing inefficiencies", owner: "Network Engineering", pct: 38, start: "May 10", forecast: "Jul 12", dep: "Baseline", savings: "$4K", status: "In Flight", risk: "Medium" },
      { name: "Optimize peering & interconnects", owner: "Network Engineering", pct: 25, start: "May 22", forecast: "Aug 1", dep: "Vendor", savings: "$3K", status: "Planned", risk: "Medium" },
      { name: "Firewall & security path costs", owner: "Security & NetOps", pct: 22, start: "May 28", forecast: "Aug 15", dep: "Policy review", savings: "$2K", status: "Planned", risk: "Medium" },
      { name: "Egress anomaly alerts", owner: "FinOps Lead", pct: 18, start: "Jun 8", forecast: "Aug 25", dep: "Telemetry", savings: "$1K", status: "Planned", risk: "Low" },
    ],
    metrics: [
      { metric: "Egress cost", baseline: "$22K", current: "$24K", target: "$14K", trend: "up", owner: "NetOps" },
      { metric: "Interconnect cost", baseline: "$18K", current: "$18K", target: "$12K", trend: "flat", owner: "NetOps" },
      { metric: "VPN utilization", baseline: "44%", current: "52%", target: "75%", trend: "up", owner: "NetOps" },
      { metric: "Route count", baseline: "1,820", current: "1,540", target: "<900", trend: "down", owner: "Network Eng" },
      { metric: "Traffic anomalies / mo", baseline: "32", current: "21", target: "<5", trend: "down", owner: "FinOps" },
      { metric: "Firewall rule count", baseline: "8,420", current: "7,640", target: "<4,500", trend: "down", owner: "Security" },
    ],
    dependencies: ["Cloud accounts", "VPC architecture", "Security groups", "Firewall policy", "Business continuity plan", "Application traffic patterns"],
    risks: ["Traffic visibility incomplete", "Security requirements may limit optimization", "Route changes introduce availability risk", "Egress spikes may be event-driven"],
    automation: ["Egress anomaly detector", "Route hygiene analyzer", "Firewall cost mapper", "Traffic pattern classifier"],
    nextAction: "Create product-level egress visibility and identify the top 10 traffic cost drivers.",
    spark: [56, 57, 58, 58, 59, 59, 60, 60, 61, 60],
    annualOpportunity: "$168K", completion: "Aug 25, 2026", maturity: "Forming", reviewed: "May 12, 2026",
  },
  {
    id: "J", letter: "J", name: "Security & IAM Controls", icon: Lock,
    scope: "Access, guardrails, privileged controls",
    baseline: 39, trendPct: 1.7, trendDir: "up",
    forecast: 40, target: 36, gap: 4,
    achieve: "Access rationalization, tooling alignment, policy automation",
    owner: "Security", status: "Stable",
    overview: "Security and IAM costs are optimized through access rationalization, privileged access governance, guardrails, policy automation, and tool alignment. The goal is not simply cost reduction. The goal is lower risk at controlled cost.",
    steps: [
      { name: "Inventory access & privileged accounts", owner: "Security", pct: 75, start: "Apr 10", forecast: "Jun 10", dep: "Identity sources", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Map IAM controls to AWS & GCP", owner: "IAM Engineer", pct: 58, start: "Apr 28", forecast: "Jun 25", dep: "Inventory", savings: "$1K", status: "In Flight", risk: "Low" },
      { name: "Identify redundant security tooling", owner: "Security Lead", pct: 40, start: "May 10", forecast: "Jul 15", dep: "Tool inventory", savings: "$1K", status: "In Flight", risk: "Medium" },
      { name: "Automate access reviews", owner: "IAM & Automation", pct: 34, start: "May 18", forecast: "Jul 30", dep: "Identity model", savings: "$1K", status: "In Flight", risk: "Medium" },
      { name: "Policy-as-code guardrails", owner: "Security & Platform Eng", pct: 25, start: "Jun 1", forecast: "Aug 20", dep: "Platform standards", savings: "$1K", status: "Planned", risk: "Medium" },
      { name: "Reduce orphaned accounts & privileges", owner: "IAM Engineer", pct: 22, start: "Jun 10", forecast: "Aug 30", dep: "Reviews", savings: "$1K", status: "Planned", risk: "Medium" },
    ],
    metrics: [
      { metric: "Privileged access coverage", baseline: "72%", current: "84%", target: "98%", trend: "up", owner: "Security" },
      { metric: "MFA coverage", baseline: "86%", current: "94%", target: "100%", trend: "up", owner: "IAM" },
      { metric: "Orphaned account count", baseline: "418", current: "260", target: "<25", trend: "down", owner: "IAM" },
      { metric: "Access review completion", baseline: "62%", current: "78%", target: "98%", trend: "up", owner: "IAM" },
      { metric: "Policy compliance", baseline: "74%", current: "85%", target: "98%", trend: "up", owner: "Security" },
      { metric: "Security tool spend", baseline: "$39K", current: "$40K", target: "$36K", trend: "up", owner: "Security" },
      { metric: "Misconfiguration count", baseline: "212", current: "138", target: "<25", trend: "down", owner: "Security" },
    ],
    dependencies: ["Corporate identity model", "AWS IAM", "GCP IAM", "PAM strategy", "Security standards", "Application owner approval"],
    risks: ["Multiple identity domains may slow progress", "Privileged access cleanup can disrupt operations", "Security tooling fragmented by acquisition", "Policy automation requires platform alignment"],
    automation: ["Access review bot", "Orphaned account detector", "Privilege risk scorer", "Policy-as-code compliance bot", "IAM drift monitor"],
    nextAction: "Complete privileged access baseline and prioritize access cleanup by production risk.",
    spark: [38, 38, 39, 39, 40, 40, 40, 40, 40, 40],
    annualOpportunity: "$48K", completion: "Aug 30, 2026", maturity: "Operating", reviewed: "May 13, 2026",
  },
];

/* ============== KPIs ============== */
type Kpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaDir: Trend;
  sub: string;
  spark: number[];
  tone: "ok" | "warn" | "neutral";
};
const KPIS: Kpi[] = [
  { id: "rr", label: "Total Monthly Run Rate", value: "$1.20M", delta: "-3.1%", deltaDir: "down", sub: "vs last quarter", spark: [1.24,1.23,1.22,1.21,1.21,1.20,1.20], tone: "ok" },
  { id: "pipe", label: "Annualized Savings Pipeline", value: "$3.42M", delta: "+18%", deltaDir: "up", sub: "this quarter", spark: [2.6,2.8,2.9,3.0,3.2,3.3,3.42], tone: "ok" },
  { id: "var", label: "Budget Variance (MTD)", value: "-2.8%", delta: "Under budget", deltaDir: "down", sub: "favorable", spark: [-1.2,-1.5,-1.9,-2.2,-2.5,-2.7,-2.8], tone: "ok" },
  { id: "alloc", label: "Allocation Coverage", value: "86%", delta: "Target > 95%", deltaDir: "up", sub: "tag + owner", spark: [78,80,82,83,85,85,86], tone: "warn" },
  { id: "visit", label: "Unit Cost / Visit", value: "$0.041", delta: "Target $0.036", deltaDir: "down", sub: "per visit", spark: [0.048,0.046,0.044,0.043,0.042,0.041,0.041], tone: "warn" },
  { id: "claim", label: "Unit Cost / Claims Txn", value: "$0.18", delta: "Target $0.15", deltaDir: "down", sub: "per transaction", spark: [0.22,0.21,0.20,0.19,0.19,0.18,0.18], tone: "warn" },
];

/* ============== Savings Levers / Enablers ============== */
const LEVERS = [
  { id: "rs", title: "Rightsizing & Commitments", impact: "$620K", icon: Wrench, related: ["A","B","D"], color: "text-sky-600", ring: "ring-sky-200" },
  { id: "sql", title: "SQL Modernization", impact: "$828K", icon: Database, related: ["E","D"], color: "text-emerald-600", ring: "ring-emerald-200" },
  { id: "bk", title: "Backup Tiering", impact: "$520K", icon: Shield, related: ["F","E"], color: "text-sky-600", ring: "ring-sky-200" },
  { id: "obs", title: "Observability Optimization", impact: "$275K", icon: Monitor, related: ["G"], color: "text-violet-600", ring: "ring-violet-200" },
  { id: "self", title: "Self-Service Standards / Golden Paths", impact: "$210K", icon: Boxes, related: ["B","A"], color: "text-emerald-600", ring: "ring-emerald-200" },
  { id: "cb", title: "Chargeback & Allocation Discipline", impact: "$145K", icon: FileBarChart, related: ["A","B","G","D"], color: "text-amber-600", ring: "ring-amber-200" },
];

const ENABLERS = [
  { id: "inform", title: "Inform", icon: Eye, items: ["Tagging & metadata", "Showback & transparency", "Anomaly detection", "Unit economics"] },
  { id: "optimize", title: "Optimize", icon: Settings, items: ["Rightsizing", "Storage tiering", "RI / CUD strategy", "Log retention controls"] },
  { id: "operate", title: "Operate", icon: Workflow, items: ["Budgets & alerts", "Policy guardrails", "Forecasting", "Review cadence"] },
  { id: "collab", title: "Collaborate", icon: Users, items: ["Finance reviews", "Engineering accountability", "Product owner decisions", "Service ownership"] },
  { id: "evolve", title: "Evolve", icon: Zap, items: ["Automation", "Predictive insights", "Platform standards", "Workload modernization"] },
];

/* ============== Small UI ============== */
function Spark({ data, color = "#0ea5e9" }: { data: number[]; color?: string }) {
  return (
    <div className="h-9 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={fmtSpark(data)}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendArrow({ dir, pct }: { dir: Trend; pct: number }) {
  const color = dir === "up" ? "text-rose-600" : dir === "down" ? "text-emerald-600" : "text-slate-500";
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

/* ============== Page ============== */
export default function FinOpsOperationsConsole() {
  const [selected, setSelected] = useState<Row | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [activeLever, setActiveLever] = useState<string | null>(null);

  const highlightRowIds = useMemo(() => {
    if (!activeLever) return new Set<string>();
    return new Set(LEVERS.find(l => l.id === activeLever)?.related ?? []);
  }, [activeLever]);

  return (
    <AppShell>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Cloud &amp; Production Operations</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-semibold">FinOps</span>
          </div>

          {/* Header */}
          <header className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 inline-flex items-center justify-center border border-rose-100">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                    FinOps Operations Console
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    Run rate, targets, trends, and savings actions across the production estate.
                  </p>
                  <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
                    Illustrative view of in-scope production cost objects surfaced during discovery: AWS production workloads,
                    GCP product line, Virginia data center, SQL Server footprint, observability, backup, networking, security,
                    IAM, Citrix, and platform engineering.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Calendar className="w-3.5 h-3.5" /> May 2026 (MTD) <ChevronRight className="w-3 h-3 rotate-90" />
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <GitCompare className="w-3.5 h-3.5" /> Compare
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <div className="text-[11px] text-slate-500 ml-1 inline-flex items-center gap-2">
                  Data as of: May 13, 2026 10:30 AM ET
                  <button className="p-1.5 rounded-md hover:bg-slate-100"><RefreshCw className="w-3.5 h-3.5 text-slate-500" /></button>
                </div>
              </div>
            </div>
          </header>

          {/* KPI Strip */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {KPIS.map((k) => (
              <button
                key={k.id}
                className="text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="text-[11px] uppercase tracking-wide text-slate-500">{k.label}</div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <div className="text-2xl font-semibold text-slate-900">{k.value}</div>
                  <Spark data={k.spark} color={k.tone === "ok" ? "#059669" : k.tone === "warn" ? "#9333ea" : "#0ea5e9"} />
                </div>
                <div className="mt-1 text-[11px] flex items-center gap-1.5">
                  <span className={k.deltaDir === "down" && k.tone === "ok" ? "text-emerald-600 font-semibold" : k.deltaDir === "up" && k.tone === "ok" ? "text-emerald-600 font-semibold" : "text-slate-500 font-medium"}>
                    {k.delta}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{k.sub}</span>
                </div>
              </button>
            ))}
          </section>

          {/* In-Scope Cost Objects Table */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 01</div>
                <h2 className="text-base font-semibold text-slate-900">In-Scope Cost Objects</h2>
              </div>
              <div className="text-[11px] text-slate-500">Showing 1–{ROWS.length} of {ROWS.length} cost objects</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50/80 backdrop-blur border-y border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="text-left py-2.5 px-3 font-semibold w-[260px]">Cost Object</th>
                    <th className="text-left py-2.5 px-3 font-semibold">Platform / Scope</th>
                    <th className="text-right py-2.5 px-3 font-semibold">Baseline Monthly Cost</th>
                    <th className="text-left py-2.5 px-3 font-semibold">90-Day Trend</th>
                    <th className="text-right py-2.5 px-3 font-semibold">Current Forecast</th>
                    <th className="text-right py-2.5 px-3 font-semibold">Target Run Rate</th>
                    <th className="text-right py-2.5 px-3 font-semibold">Savings Gap</th>
                    <th className="text-left py-2.5 px-3 font-semibold">How We Achieve It</th>
                    <th className="text-left py-2.5 px-3 font-semibold">Owner</th>
                    <th className="text-left py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selected?.id === r.id;
                    const isHovered = hover === r.id;
                    const isLeverHighlighted = highlightRowIds.has(r.id);
                    const dimmed = (selected && !isSelected) || (activeLever && !isLeverHighlighted);
                    return (
                      <tr
                        key={r.id}
                        onMouseEnter={() => setHover(r.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setSelected(r)}
                        className={[
                          "border-b border-slate-100 cursor-pointer transition-all",
                          isSelected ? "bg-sky-50/50 ring-1 ring-inset ring-sky-200" : "hover:bg-slate-50",
                          isLeverHighlighted && !isSelected ? "bg-amber-50/40" : "",
                          dimmed ? "opacity-50" : "opacity-100",
                        ].join(" ")}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">{r.letter}</span>
                            <Icon className="w-4 h-4 text-slate-500" />
                            <span className="font-semibold text-slate-900">{r.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{r.scope}</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900">{k(r.baseline)}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <TrendArrow dir={r.trendDir} pct={r.trendPct} />
                            <div className={`transition-all ${isHovered ? "opacity-100" : "opacity-70"}`}>
                              <Spark data={r.spark} color={r.trendDir === "up" ? "#e11d48" : r.trendDir === "down" ? "#059669" : "#64748b"} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700">{k(r.forecast)}</td>
                        <td className="py-3 px-3 text-right text-slate-700">{k(r.target)}</td>
                        <td className="py-3 px-3 text-right font-semibold text-rose-600">{k(r.gap)}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-[280px]">
                          <div className="line-clamp-2 leading-snug">{r.achieve}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {r.owner}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-medium ${statusStyle(r.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(r.status)}`} />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 border-t border-slate-100">
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> In Flight</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> At Risk</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Planned</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Stable</span>
            </div>
          </section>

          {/* Savings Levers */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 02</div>
                <h2 className="text-base font-semibold text-slate-900">Savings Levers by Theme</h2>
              </div>
              {activeLever && (
                <button onClick={() => setActiveLever(null)} className="text-[11px] text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear lever focus
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {LEVERS.map((l) => {
                const Icon = l.icon;
                const active = activeLever === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLever(active ? null : l.id)}
                    className={[
                      "text-left rounded-xl border bg-white p-3 transition-all hover:shadow-md",
                      active ? `ring-2 ${l.ring} border-transparent shadow-md` : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-slate-50 inline-flex items-center justify-center mb-2 ${l.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-rose-500 font-semibold">{l.title}</div>
                    <div className="mt-1 text-[10px] text-slate-500">Est. annual impact</div>
                    <div className="text-lg font-semibold text-slate-900">{l.impact}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Operational Enablers */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Section 03</div>
              <h2 className="text-base font-semibold text-slate-900">Operational Enablers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {ENABLERS.map((e) => {
                const Icon = e.icon;
                return (
                  <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 inline-flex items-center justify-center text-slate-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{e.title}</div>
                    </div>
                    <ul className="space-y-1.5">
                      {e.items.map((it) => (
                        <li key={it} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Illustrative Client-aligned FinOps view. Built for hybrid AWS / GCP / Virginia data center operations,
              SQL Server cost takeout, reliability tooling control, and clearer ownership across cloud, infrastructure,
              database, SRE, security, and product teams. All numbers are illustrative placeholders unless connected
              to live billing data.
            </p>
          </footer>
        </div>

        {/* Right Pane */}
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[640px] lg:max-w-[720px] p-0 overflow-y-auto">
            {selected && <RowDetail row={selected} onClose={() => setSelected(null)} />}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ============== Row Detail ============== */
function RowDetail({ row, onClose }: { row: Row; onClose: () => void }) {
  const Icon = row.icon;
  const totalSavings = row.steps.reduce((acc, s) => acc + Number(s.savings.replace(/[^0-9.-]/g, "")), 0);
  const overallProgress = Math.round(row.steps.reduce((a, s) => a + s.pct, 0) / row.steps.length);
  const blocked = row.steps.filter(s => s.status === "Blocked" || s.status === "At Risk").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center border border-rose-100">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Cost Object {row.letter}</div>
              <div className="text-lg font-semibold text-slate-900 leading-tight">{row.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{row.scope}</div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusStyle(row.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot(row.status)}`} />
                  {row.status}
                </span>
                <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                  <Users className="w-3 h-3 mr-1" /> {row.owner}
                </Badge>
                <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                  Maturity · {row.maturity}
                </Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Summary tiles */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <SummaryTile label="Baseline" value={k(row.baseline)} />
          <SummaryTile label="Forecast" value={k(row.forecast)} />
          <SummaryTile label="Target" value={k(row.target)} tone="ok" />
          <SummaryTile label="Gap" value={k(row.gap)} tone="warn" />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <SummaryTile label="Annualized Opportunity" value={row.annualOpportunity} tone="ok" />
          <SummaryTile label="Forecast Completion" value={row.completion} />
          <SummaryTile label="Last Reviewed" value={row.reviewed} />
        </div>

        {/* Progress tracker */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Overall Progress</span>
            <span className="text-slate-500">{overallProgress}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">
            <div><span className="text-slate-500">Phase:</span> <span className="text-slate-800 font-semibold">Execution</span></div>
            <div><span className="text-slate-500">Confidence:</span> <span className="text-slate-800 font-semibold">{row.status === "At Risk" ? "Medium" : "High"}</span></div>
            <div><span className="text-slate-500">Blocked:</span> <span className="text-slate-800 font-semibold">{blocked}</span></div>
            <div><span className="text-slate-500">Steps:</span> <span className="text-slate-800 font-semibold">{row.steps.length}</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="execution" className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4 bg-slate-100 grid grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
          <TabsTrigger value="execution" className="text-[11px]">Execution Plan</TabsTrigger>
          <TabsTrigger value="metrics" className="text-[11px]">Metrics</TabsTrigger>
          <TabsTrigger value="depends" className="text-[11px]">Dependencies</TabsTrigger>
        </TabsList>
        <TabsList className="mx-6 mt-2 bg-slate-100 grid grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="risks" className="text-[11px]">Risks</TabsTrigger>
          <TabsTrigger value="automation" className="text-[11px]">Automation</TabsTrigger>
          <TabsTrigger value="milestones" className="text-[11px]">Milestones</TabsTrigger>
          <TabsTrigger value="artifacts" className="text-[11px]">Artifacts</TabsTrigger>
        </TabsList>

        <div className="px-6 py-4 flex-1">
          <TabsContent value="overview">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{row.overview}</p>
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
              <div className="text-[11px] uppercase tracking-wider text-sky-700 font-semibold">Recommended Next Action</div>
              <p className="mt-1 text-sm text-slate-800">{row.nextAction}</p>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="space-y-4">
            {/* Steps list */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Technical Steps</h3>
              <div className="space-y-2">
                {row.steps.map((s, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{i + 1}. {s.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {s.owner} · Dep: {s.dep} · Start {s.start} · ETA {s.forecast}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-500">Savings</div>
                        <div className="text-sm font-semibold text-emerald-600">{s.savings}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${stepColor(s.status)} transition-all`} style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-500 w-10 text-right">{s.pct}%</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        s.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        s.status === "In Flight" ? "bg-sky-50 text-sky-700 border-sky-200" :
                        s.status === "At Risk" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        s.status === "Blocked" ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-violet-50 text-violet-700 border-violet-200"
                      }`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Gantt */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Progress Timeline</h3>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                {row.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <div className="w-44 truncate text-slate-700">{s.name}</div>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
                      <div className={`h-full ${stepColor(s.status)}`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="w-16 text-right text-slate-500">{s.forecast}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action checklist */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Action Checklist</h3>
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                {row.steps.map((s, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" defaultChecked={s.pct >= 100} className="rounded border-slate-300" />
                    <span className={s.pct >= 100 ? "line-through text-slate-400" : ""}>{s.name}</span>
                    <span className="ml-auto text-[10px] text-slate-500">{s.pct}%</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">Estimated monthly savings at full execution: <span className="font-semibold text-emerald-600">${totalSavings}K</span></div>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">KPI Table</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Metric</th>
                    <th className="text-left px-3 py-2">Baseline</th>
                    <th className="text-left px-3 py-2">Current</th>
                    <th className="text-left px-3 py-2">Target</th>
                    <th className="text-left px-3 py-2">Trend</th>
                    <th className="text-left px-3 py-2">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {row.metrics.map((m, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{m.metric}</td>
                      <td className="px-3 py-2 text-slate-600">{m.baseline}</td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">{m.current}</td>
                      <td className="px-3 py-2 text-slate-600">{m.target}</td>
                      <td className="px-3 py-2">
                        {m.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                          : m.trend === "down" ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                          : <Minus className="w-3.5 h-3.5 text-slate-400" />}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{m.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="depends">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Dependency Map</h3>
            <div className="flex flex-wrap gap-2">
              {row.dependencies.map(d => (
                <span key={d} className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">{d}</span>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Key Risks</h3>
            <div className="space-y-2">
              {row.risks.map((r, i) => (
                <div key={i} className="rounded-lg border border-orange-200 bg-orange-50/50 p-2.5 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-700">{r}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="automation">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Automation & AI Assist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {row.automation.map((a, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs text-slate-700">{a}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Milestones</h3>
            <div className="space-y-2">
              {row.steps.filter(s => s.pct === 100 || s.pct >= 60).slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <div className={`w-2 h-2 rounded-full ${stepColor(s.status)}`} />
                  <div className="flex-1 text-slate-700">{s.name}</div>
                  <div className="text-slate-500">{s.forecast}</div>
                  <div className="text-slate-800 font-semibold w-10 text-right">{s.pct}%</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artifacts">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Artifacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {["Cost baseline export", "Optimization recommendations", "Approval log", "Wave plan", "Risk register", "Owner sign-offs"].map((a) => (
                <div key={a} className="rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                  <FileBarChart className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-700">{a}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const color = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-rose-600" : "text-slate-900";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
