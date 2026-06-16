import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Activity, AlertTriangle, ArrowRight, Bell, Bot, Boxes, ChevronRight, CircleDot,
  Cloud, Cpu, Database, DollarSign, FileBarChart2, Filter, Gauge, GitBranch,
  Globe, Layers, LayoutGrid, Lock, MessageSquare, Network, PauseCircle, PlayCircle,
  RefreshCw, Rocket, Search, Server, Settings as SettingsIcon, Shield, ShieldCheck,
  Sparkles, TrendingDown, TrendingUp, Users, Workflow, Zap, ZapOff,
  Eye, BarChart3, MapPin, Clock, ChevronDown, X, CheckCircle2, AlertOctagon,
} from "lucide-react";
import { useScenarioState } from "@/context/ScenarioStateContext";
import { DemoScenarioController, ScenarioDrawer } from "@/components/scenario/DemoScenarioController";

const KPI_ICONS: Record<string, any> = {
  health: Activity, inc: AlertOctagon, slo: ShieldCheck, budget: Gauge,
  p95: Clock, err: AlertTriangle, spend: DollarSign, fcst: TrendingUp,
  sec: Shield, auto: Sparkles,
};

/* ------------------------------------------------------------------ */
/* TYPES + COLOR LANGUAGE                                              */
/* ------------------------------------------------------------------ */
type Health = "healthy" | "warning" | "critical" | "info";
const HEALTH: Record<Health, { dot: string; chip: string; ring: string; stroke: string; label: string; soft: string }> = {
  healthy:  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "ring-emerald-300/50", stroke: "stroke-emerald-400", soft: "bg-emerald-50",  label: "Healthy"  },
  warning:  { dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",       ring: "ring-amber-300/50",   stroke: "stroke-amber-400",   soft: "bg-amber-50",    label: "Warning"  },
  critical: { dot: "bg-rose-500",    chip: "bg-rose-50 text-rose-700 border-rose-200",          ring: "ring-rose-300/60",    stroke: "stroke-rose-400",    soft: "bg-rose-50",     label: "Critical" },
  info:     { dot: "bg-sky-500",     chip: "bg-sky-50 text-sky-700 border-sky-200",             ring: "ring-sky-300/40",     stroke: "stroke-sky-400",     soft: "bg-sky-50",      label: "Info"     },
};

/* ------------------------------------------------------------------ */
/* MOCK DATA                                                           */
/* ------------------------------------------------------------------ */
let BUSINESS_SERVICES = [
  { id: "bs-cx",   name: "Customer Experience",   health: "healthy"  as Health, avail: "99.98%", sloTarget: "99.95%", sloActual: "99.98%", p95: "182 ms", err: "0.08%", tx: "1.8M/hr",  incidents: 0, risk: 21, impact: "Medium",   owner: "Experience SRE Squad" },
  { id: "bs-om",   name: "Order Management",      health: "warning"  as Health, avail: "99.88%", sloTarget: "99.95%", sloActual: "99.88%", p95: "421 ms", err: "0.62%", tx: "612K/hr",  incidents: 1, risk: 64, impact: "High",     owner: "Orders SRE Squad" },
  { id: "bs-id",   name: "Identity Services",     health: "healthy"  as Health, avail: "99.99%", sloTarget: "99.99%", sloActual: "99.99%", p95: "146 ms", err: "0.03%", tx: "920K/hr",  incidents: 0, risk: 18, impact: "Critical", owner: "Identity Platform Team" },
  { id: "bs-pay",  name: "Payment Services",      health: "critical" as Health, avail: "99.72%", sloTarget: "99.95%", sloActual: "99.72%", p95: "912 ms", err: "2.70%", tx: "184.2K/hr",incidents: 1, risk: 89, impact: "High",     owner: "Payments SRE Squad" },
  { id: "bs-noti", name: "Notification Services", health: "warning"  as Health, avail: "99.81%", sloTarget: "99.90%", sloActual: "99.81%", p95: "680 ms", err: "1.10%", tx: "248K/hr",  incidents: 1, risk: 58, impact: "Medium",   owner: "Messaging Platform Team" },
  { id: "bs-ana",  name: "Analytics Platform",    health: "healthy"  as Health, avail: "99.96%", sloTarget: "99.90%", sloActual: "99.96%", p95: "220 ms", err: "0.11%", tx: "4.8K jobs/hr", incidents: 0, risk: 27, impact: "Medium", owner: "Data Platform Team" },
];

let TRANSACTIONS = [
  { id: "tx-login",   name: "User Login",        health: "healthy"  as Health, p50: "88 ms",  p95: "146 ms", p99: "290 ms",  err: "0.03%", tput: "8,100 rpm", sloT: "99.99%", sloA: "99.99%", owner: "Identity Platform Team", lastDeploy: "2 days ago",  changes: 0, topDep: "Authentication Service", costPerK: "$0.22" },
  { id: "tx-search",  name: "Product Search",    health: "healthy"  as Health, p50: "112 ms", p95: "240 ms", p99: "410 ms",  err: "0.09%", tput: "6,400 rpm", sloT: "99.95%", sloA: "99.96%", owner: "Search Platform Team",   lastDeploy: "6 hours ago", changes: 1, topDep: "Catalog Service",         costPerK: "$0.18" },
  { id: "tx-cart",    name: "Add to Cart",       health: "healthy"  as Health, p50: "94 ms",  p95: "188 ms", p99: "320 ms",  err: "0.11%", tput: "5,800 rpm", sloT: "99.95%", sloA: "99.97%", owner: "Commerce SRE Squad",     lastDeploy: "1 day ago",   changes: 0, topDep: "Catalog Service",         costPerK: "$0.16" },
  { id: "tx-order",   name: "Submit Order",      health: "warning"  as Health, p50: "230 ms", p95: "610 ms", p99: "1,120 ms",err: "0.90%", tput: "5,400 rpm", sloT: "99.95%", sloA: "99.86%", owner: "Orders SRE Squad",       lastDeploy: "3 hours ago", changes: 2, topDep: "Payment Service",         costPerK: "$0.61" },
  { id: "tx-pay",     name: "Process Payment",   health: "critical" as Health, p50: "310 ms", p95: "912 ms", p99: "1,840 ms",err: "2.70%", tput: "3,900 rpm", sloT: "99.95%", sloA: "99.72%", owner: "Payments SRE Squad",     lastDeploy: "2 hours ago", changes: 3, topDep: "Aurora PostgreSQL",       costPerK: "$0.84" },
  { id: "tx-noti",    name: "Send Notification", health: "warning"  as Health, p50: "180 ms", p95: "680 ms", p99: "1,310 ms",err: "1.10%", tput: "4,100 rpm", sloT: "99.90%", sloA: "99.81%", owner: "Messaging Platform Team",lastDeploy: "8 hours ago", changes: 1, topDep: "SQS",                     costPerK: "$0.12" },
  { id: "tx-report",  name: "Generate Report",   health: "healthy"  as Health, p50: "240 ms", p95: "520 ms", p99: "980 ms",  err: "0.14%", tput: "320 rpm",   sloT: "99.90%", sloA: "99.94%", owner: "Data Platform Team",     lastDeploy: "4 days ago",  changes: 0, topDep: "Analytics Platform",      costPerK: "$0.34" },
];

let APP_SERVICES = [
  { id: "svc-web",   name: "Web Front End",         runtime: "ECS Fargate", version: "v8.4.0",  health: "healthy"  as Health, p95: "210 ms", err: "0.12%", sat: "48%", tput: "9,200 rpm",  tasks: 24, deploy: "1 day ago",   owner: "Experience SRE Squad",   cost: "$11,400/mo", sec: "Clean",       changes: 0 },
  { id: "svc-mob",   name: "Mobile API",            runtime: "ECS Fargate", version: "v4.2.1",  health: "healthy"  as Health, p95: "240 ms", err: "0.18%", sat: "52%", tput: "5,400 rpm",  tasks: 18, deploy: "2 days ago",  owner: "Experience SRE Squad",   cost: "$9,800/mo",  sec: "1 low",        changes: 0 },
  { id: "svc-search",name: "Search Service",        runtime: "ECS Fargate", version: "v3.1.4",  health: "healthy"  as Health, p95: "180 ms", err: "0.09%", sat: "44%", tput: "6,400 rpm",  tasks: 16, deploy: "6 hours ago", owner: "Search Platform Team",   cost: "$7,200/mo",  sec: "Clean",        changes: 1 },
  { id: "svc-cat",   name: "Catalog Service",       runtime: "ECS Fargate", version: "v6.0.2",  health: "healthy"  as Health, p95: "160 ms", err: "0.07%", sat: "38%", tput: "7,100 rpm",  tasks: 20, deploy: "3 days ago",  owner: "Commerce SRE Squad",     cost: "$8,600/mo",  sec: "Clean",        changes: 0 },
  { id: "svc-order", name: "Order Service",         runtime: "ECS Fargate", version: "v5.8.2",  health: "warning"  as Health, p95: "610 ms", err: "0.90%", sat: "71%", tput: "5,400 rpm",  tasks: 36, deploy: "3 hours ago", owner: "Orders SRE Squad",       cost: "$14,600/mo", sec: "1 medium",     changes: 2 },
  { id: "svc-pay",   name: "Payment Service",       runtime: "ECS Fargate", version: "v2.14.7", health: "critical" as Health, p95: "912 ms", err: "2.70%", sat: "88%", tput: "3,900 rpm",  tasks: 42, deploy: "2 hours ago", owner: "Payments SRE Squad",     cost: "$18,200/mo", sec: "2 high",       changes: 3 },
  { id: "svc-noti",  name: "Notification Service",  runtime: "Lambda",      version: "v4.0.6",  health: "warning"  as Health, p95: "680 ms", err: "1.10%", sat: "62%", tput: "4,100 rpm",  tasks: 0,  deploy: "8 hours ago", owner: "Messaging Platform Team",cost: "$5,400/mo",  sec: "Clean",        changes: 1 },
  { id: "svc-rep",   name: "Reporting Service",     runtime: "ECS Fargate", version: "v2.3.0",  health: "healthy"  as Health, p95: "520 ms", err: "0.14%", sat: "40%", tput: "320 rpm",    tasks: 8,  deploy: "4 days ago",  owner: "Data Platform Team",     cost: "$4,800/mo",  sec: "Clean",        changes: 0 },
  { id: "svc-auth",  name: "Authentication Service",runtime: "Lambda",      version: "v3.2.1",  health: "healthy"  as Health, p95: "146 ms", err: "0.03%", sat: "42%", tput: "8,100 rpm",  tasks: 0,  deploy: "2 days ago",  owner: "Identity Platform Team", cost: "$7,900/mo",  sec: "Clean",        changes: 0 },
  { id: "svc-inv",   name: "Inventory Service",     runtime: "ECS Fargate", version: "v3.5.1",  health: "healthy"  as Health, p95: "200 ms", err: "0.10%", sat: "46%", tput: "3,200 rpm",  tasks: 12, deploy: "5 days ago",  owner: "Commerce SRE Squad",     cost: "$6,400/mo",  sec: "Clean",        changes: 0 },
  { id: "svc-rec",   name: "Recommendation Service",runtime: "Lambda",      version: "v1.9.2",  health: "healthy"  as Health, p95: "260 ms", err: "0.18%", sat: "50%", tput: "2,800 rpm",  tasks: 0,  deploy: "2 days ago",  owner: "Data Platform Team",     cost: "$5,100/mo",  sec: "Clean",        changes: 0 },
];

let AWS_GROUPS: { id: string; name: string; tone: string; resources: { name: string; status: Health; util?: string; cost?: string }[] }[] = [
  { id: "g-edge", name: "Edge & Access", tone: "from-sky-50 to-white", resources: [
    { name: "Route53",    status: "healthy", util: "—",   cost: "$120/mo" },
    { name: "CloudFront", status: "healthy", util: "62%", cost: "$3,400/mo" },
    { name: "AWS WAF",    status: "healthy", util: "—",   cost: "$680/mo" },
  ]},
  { id: "g-api", name: "API & Routing", tone: "from-indigo-50 to-white", resources: [
    { name: "API Gateway",              status: "healthy", util: "58%", cost: "$2,100/mo" },
    { name: "Application Load Balancer", status: "warning", util: "74%", cost: "$1,820/mo" },
  ]},
  { id: "g-compute", name: "Compute", tone: "from-violet-50 to-white", resources: [
    { name: "ECS Fargate",    status: "warning",  util: "78%", cost: "$84,200/mo" },
    { name: "Lambda",         status: "healthy",  util: "44%", cost: "$18,400/mo" },
    { name: "Step Functions", status: "healthy",  util: "—",   cost: "$1,260/mo" },
  ]},
  { id: "g-data", name: "Data", tone: "from-rose-50 to-white", resources: [
    { name: "Aurora PostgreSQL", status: "critical", util: "91%", cost: "$62,800/mo" },
    { name: "DynamoDB",          status: "healthy",  util: "48%", cost: "$22,400/mo" },
    { name: "ElastiCache Redis", status: "healthy",  util: "52%", cost: "$11,200/mo" },
    { name: "S3",                status: "healthy",  util: "—",   cost: "$14,600/mo" },
  ]},
  { id: "g-event", name: "Eventing", tone: "from-amber-50 to-white", resources: [
    { name: "EventBridge", status: "healthy", util: "—",  cost: "$840/mo" },
    { name: "SNS",         status: "healthy", util: "—",  cost: "$420/mo" },
    { name: "SQS",         status: "warning", util: "24K msgs queued", cost: "$680/mo" },
  ]},
  { id: "g-net", name: "Network", tone: "from-teal-50 to-white", resources: [
    { name: "VPC",            status: "healthy", util: "—", cost: "—" },
    { name: "Subnets",        status: "healthy", util: "—", cost: "—" },
    { name: "Security Groups",status: "healthy", util: "—", cost: "—" },
    { name: "NAT Gateway",    status: "warning", util: "82%", cost: "$4,200/mo" },
    { name: "Transit Gateway",status: "healthy", util: "44%", cost: "$2,100/mo" },
  ]},
  { id: "g-sec", name: "Security", tone: "from-indigo-50 to-white", resources: [
    { name: "IAM",            status: "healthy", util: "—", cost: "—" },
    { name: "KMS",            status: "healthy", util: "—", cost: "$320/mo" },
    { name: "Secrets Manager",status: "warning", util: "8 keys >90d", cost: "$280/mo" },
    { name: "GuardDuty",      status: "warning", util: "1 medium finding", cost: "$1,420/mo" },
    { name: "Security Hub",   status: "healthy", util: "—", cost: "$840/mo" },
    { name: "Inspector",      status: "healthy", util: "—", cost: "$620/mo" },
    { name: "CloudTrail",     status: "healthy", util: "—", cost: "$540/mo" },
    { name: "Config",         status: "healthy", util: "—", cost: "$480/mo" },
  ]},
  { id: "g-obs", name: "Observability", tone: "from-sky-50 to-white", resources: [
    { name: "CloudWatch",        status: "healthy", util: "—", cost: "$8,400/mo" },
    { name: "Application Signals", status: "healthy", util: "—", cost: "$2,100/mo" },
    { name: "X-Ray",             status: "healthy", util: "—", cost: "$1,240/mo" },
    { name: "OpenTelemetry",     status: "healthy", util: "—", cost: "—" },
  ]},
  { id: "g-cost", name: "Cost", tone: "from-teal-50 to-white", resources: [
    { name: "Cost Explorer",      status: "info", util: "—", cost: "—" },
    { name: "Budgets",            status: "warning", util: "+8.8% variance", cost: "—" },
    { name: "Anomaly Detection",  status: "warning", util: "3 anomalies", cost: "—" },
    { name: "Savings Plans",      status: "info", util: "62% coverage", cost: "—" },
  ]},
];

let TIMELINE_EVENTS: { t: string; type: string; label: string; tone: Health }[] = [
  { t: "-12h",  type: "Change",     label: "Aurora parameter group update",        tone: "info" as Health },
  { t: "-8h",   type: "Deployment", label: "Notification Service v4.0.6 released", tone: "info" as Health },
  { t: "-6h",   type: "Security",   label: "GuardDuty medium finding opened",      tone: "warning" as Health },
  { t: "-3h",   type: "Deployment", label: "Order Service v5.8.2 released",        tone: "info" as Health },
  { t: "-2h 12m", type: "Deployment", label: "Payment Service v2.14.7 released ⚠", tone: "warning" as Health },
  { t: "-2h",   type: "Alert",      label: "Payment latency anomaly detected",     tone: "critical" as Health },
  { t: "-1h 50m", type: "Alert",    label: "Aurora CPU > 85% threshold breached",  tone: "critical" as Health },
  { t: "-1h 40m", type: "SLO",      label: "Payment SLO burn rate 8.4×",           tone: "critical" as Health },
  { t: "-1h 20m", type: "Alert",    label: "SQS queue depth > 20K",                tone: "warning" as Health },
  { t: "-1h",   type: "Scaling",    label: "ECS auto-scaled +18 Payment tasks",    tone: "warning" as Health },
  { t: "-50m",  type: "Incident",   label: "INC-48217 opened · Payment Critical",  tone: "critical" as Health },
  { t: "-20m",  type: "Automation", label: "NOVA recommendation generated",        tone: "info" as Health },
  { t: "-5m",   type: "Change",     label: "Emergency change CHG-9821 pending approval", tone: "warning" as Health },
];

const VIEWS = [
  { id: "twin",       label: "Digital Twin" },
  { id: "apm",        label: "APM" },
  { id: "infra",      label: "Infrastructure" },
  { id: "security",   label: "Security" },
  { id: "finops",     label: "FinOps" },
  { id: "reliability",label: "Reliability" },
  { id: "incident",   label: "Incident Command" },
  { id: "change",     label: "Change Impact" },
  { id: "simulation", label: "Simulation" },
] as const;
type ViewId = typeof VIEWS[number]["id"];

let GLOBAL_KPIS: { id: string; label: string; value: string; tone: Health; icon: any }[] = [
  { id: "health",  label: "Overall Health",        value: "Warning",   tone: "warning"  as Health, icon: Activity },
  { id: "inc",     label: "Active Incidents",      value: "2",         tone: "critical" as Health, icon: AlertOctagon },
  { id: "slo",     label: "SLO Compliance",        value: "99.91%",    tone: "healthy"  as Health, icon: ShieldCheck },
  { id: "budget",  label: "Error Budget Remaining",value: "38%",       tone: "warning"  as Health, icon: Gauge },
  { id: "p95",     label: "P95 Latency",           value: "284 ms",    tone: "warning"  as Health, icon: Clock },
  { id: "err",     label: "Error Rate",            value: "0.42%",     tone: "warning"  as Health, icon: AlertTriangle },
  { id: "spend",   label: "Monthly Spend",         value: "$482.3K",   tone: "info"     as Health, icon: DollarSign },
  { id: "fcst",    label: "Forecast Spend",        value: "$516.8K",   tone: "warning"  as Health, icon: TrendingUp },
  { id: "sec",     label: "Security Findings",     value: "17",        tone: "warning"  as Health, icon: Shield },
  { id: "auto",    label: "Automation Opps",       value: "23",        tone: "info"     as Health, icon: Sparkles },
];

const SUB_NAV: { id: ViewId | "biz" | "tx"; label: string; icon: any; badge?: string }[] = [
  { id: "twin",         label: "Digital Twin",     icon: Layers },
  { id: "biz",          label: "Business Services",icon: Boxes },
  { id: "tx",           label: "Transactions",     icon: Workflow },
  { id: "apm",          label: "APM",              icon: Activity },
  { id: "infra",        label: "Infrastructure",   icon: Server },
  { id: "security",     label: "Security",         icon: Shield, badge: "17" },
  { id: "finops",       label: "FinOps",           icon: DollarSign },
  { id: "reliability",  label: "Reliability",      icon: Gauge },
  { id: "incident",     label: "Incidents",        icon: AlertOctagon, badge: "2" },
  { id: "change",       label: "Changes",          icon: GitBranch },
  { id: "simulation",   label: "Simulation",       icon: Sparkles },
];

/* ------------------------------------------------------------------ */
/* SMALL PRIMITIVES                                                   */
/* ------------------------------------------------------------------ */
const Glass = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn(
    "rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm",
    "shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]",
    className
  )}>{children}</div>
);

const StatusDot = ({ s, pulse }: { s: Health; pulse?: boolean }) => (
  <span className={cn("inline-block h-2 w-2 rounded-full", HEALTH[s].dot, pulse && s === "critical" && "animate-pulse")} />
);

const Chip = ({ s, children }: { s: Health; children: React.ReactNode }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", HEALTH[s].chip)}>
    <StatusDot s={s} /> {children}
  </span>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-500">{children}</div>
);

const Metric = ({ label, value, sub, tone = "info" as Health }: { label: string; value: string; sub?: string; tone?: Health }) => (
  <div className="rounded-xl border border-slate-200/70 bg-white/70 p-3">
    <Label>{label}</Label>
    <div className="mt-1 flex items-baseline gap-2">
      <div className="text-xl font-semibold tabular-nums text-slate-900">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
    <div className={cn("mt-1 h-0.5 rounded", HEALTH[tone].dot, "opacity-60")} />
  </div>
);

/* ------------------------------------------------------------------ */
/* DIGITAL TWIN CANVAS (SVG + glass nodes)                             */
/* ------------------------------------------------------------------ */
// dependency edges between layers (source id → target id)
const EDGES_BS_TX: [string, string][] = [
  ["bs-cx","tx-login"], ["bs-cx","tx-search"], ["bs-cx","tx-cart"],
  ["bs-id","tx-login"],
  ["bs-om","tx-cart"], ["bs-om","tx-order"],
  ["bs-pay","tx-pay"], ["bs-pay","tx-order"],
  ["bs-noti","tx-noti"],
  ["bs-ana","tx-report"],
];
const EDGES_TX_SVC: [string, string][] = [
  ["tx-login","svc-auth"], ["tx-login","svc-web"],
  ["tx-search","svc-search"], ["tx-search","svc-cat"],
  ["tx-cart","svc-cat"], ["tx-cart","svc-inv"],
  ["tx-order","svc-order"], ["tx-order","svc-pay"], ["tx-order","svc-inv"],
  ["tx-pay","svc-pay"],
  ["tx-noti","svc-noti"],
  ["tx-report","svc-rep"], ["tx-report","svc-rec"],
];
const EDGES_SVC_AWS: [string, string][] = [
  ["svc-web","g-edge"], ["svc-web","g-compute"],
  ["svc-mob","g-api"], ["svc-mob","g-compute"],
  ["svc-search","g-compute"], ["svc-search","g-data"],
  ["svc-cat","g-compute"], ["svc-cat","g-data"],
  ["svc-order","g-compute"], ["svc-order","g-data"], ["svc-order","g-event"],
  ["svc-pay","g-compute"], ["svc-pay","g-data"], ["svc-pay","g-event"],
  ["svc-noti","g-compute"], ["svc-noti","g-event"],
  ["svc-rep","g-compute"], ["svc-rep","g-data"],
  ["svc-auth","g-compute"], ["svc-auth","g-sec"],
  ["svc-inv","g-compute"], ["svc-inv","g-data"],
  ["svc-rec","g-compute"], ["svc-rec","g-data"],
];

// Highlight set for the active Payment Services incident path
let HIGHLIGHT_PATH: Set<string> = new Set([
  "bs-pay","tx-pay","svc-pay","g-data","g-event","svc-noti","bs-noti","svc-order","bs-om",
]);
let CRIT_EDGES: Set<string> = new Set([
  "bs-pay|tx-pay","tx-pay|svc-pay","svc-pay|g-data","svc-pay|g-event",
  "g-event|svc-noti","svc-noti|bs-noti",
]);

function DigitalTwinCanvas({
  selectedId, onSelect, hoveredId, setHoveredId,
}: { selectedId: string | null; onSelect: (id: string) => void; hoveredId: string | null; setHoveredId: (id: string | null) => void }) {
  const bizCols = BUSINESS_SERVICES.length;
  const txCols  = TRANSACTIONS.length;
  const svcCols = APP_SERVICES.length;
  const awsCols = AWS_GROUPS.length;

  const isHighlighted = (id: string) => HIGHLIGHT_PATH.has(id);
  const focusId = selectedId || hoveredId;
  const dim = (id: string) => focusId && id !== focusId && !isHighlighted(id) && !isHighlighted(focusId);

  // Compute viewBox column-center X for each layer (viewBox 1000 x 1000)
  const colX = (i: number, n: number) => ((i + 0.5) / n) * 1000;
  const bizIdx = (id: string) => BUSINESS_SERVICES.findIndex(b => b.id === id);
  const txIdx  = (id: string) => TRANSACTIONS.findIndex(t => t.id === id);
  const svcIdx = (id: string) => APP_SERVICES.findIndex(s => s.id === id);
  const awsIdx = (id: string) => AWS_GROUPS.findIndex(g => g.id === id);

  // Layer Y centers (top/bottom anchor for the curves)
  const Y_BIZ_BOT = 165;
  const Y_TX_TOP  = 305;
  const Y_TX_BOT  = 420;
  const Y_SVC_TOP = 555;
  const Y_SVC_BOT = 660;
  const Y_AWS_TOP = 795;

  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const dy = (y2 - y1) * 0.55;
    return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  };

  const edgeKey = (a: string, b: string) => `${a}|${b}`;
  const isEdgeCrit = (a: string, b: string) => CRIT_EDGES.has(edgeKey(a, b));
  const edgeActive = (a: string, b: string) =>
    !focusId || focusId === a || focusId === b || (isHighlighted(a) && isHighlighted(b));

  const allEdges = [
    ...EDGES_BS_TX.map(([a,b]) => ({ a, b, d: curve(colX(bizIdx(a), bizCols), Y_BIZ_BOT, colX(txIdx(b), txCols), Y_TX_TOP) })),
    ...EDGES_TX_SVC.map(([a,b]) => ({ a, b, d: curve(colX(txIdx(a), txCols), Y_TX_BOT, colX(svcIdx(b), svcCols), Y_SVC_TOP) })),
    ...EDGES_SVC_AWS.map(([a,b]) => ({ a, b, d: curve(colX(svcIdx(a), svcCols), Y_SVC_BOT, colX(awsIdx(b), awsCols), Y_AWS_TOP) })),
  ];

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-[#F6F8FB] via-white to-[#EEF4FF]">
      {/* atmospheric gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      {/* faint topology grid */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]" preserveAspectRatio="none" viewBox="0 0 1000 1000">
        <defs>
          <pattern id="twin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="1000" height="1000" fill="url(#twin-grid)" />
      </svg>

      {/* SVG dependency mesh (stretches to fill canvas) */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <radialGradient id="nodePulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fb7185" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* base edges */}
        {allEdges.map(({ a, b, d }, i) => {
          const crit = isEdgeCrit(a, b);
          const active = edgeActive(a, b);
          return (
            <path
              key={`edge-${i}`}
              d={d}
              fill="none"
              stroke={crit ? "#f43f5e" : "#94a3b8"}
              strokeWidth={crit ? 1.6 : 0.9}
              opacity={active ? (crit ? 0.85 : 0.35) : 0.08}
              strokeLinecap="round"
            />
          );
        })}

        {/* animated flow particles on critical edges */}
        {allEdges.filter(({ a, b }) => isEdgeCrit(a, b)).map(({ d }, i) => (
          <path
            key={`flow-${i}`}
            d={d}
            fill="none"
            stroke="#fb7185"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="6 22"
            opacity="0.9"
            filter="url(#softGlow)"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-56" dur={`${1.6 + i * 0.15}s`} repeatCount="indefinite" />
          </path>
        ))}

        {/* pulse halo on critical node anchor points */}
        <circle cx={colX(svcIdx("svc-pay"), svcCols)} cy={Y_SVC_TOP - 8} r="10" fill="url(#nodePulse)">
          <animate attributeName="r" values="8;18;8" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={colX(awsIdx("g-data"), awsCols)} cy={Y_AWS_TOP + 4} r="10" fill="url(#nodePulse)">
          <animate attributeName="r" values="8;18;8" dur="2.6s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* LAYER 1 — Business Services */}
      <div className="relative z-10 px-3 pt-3">
        <Label>Business Services</Label>
        <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${bizCols}, minmax(0, 1fr))` }}>
          {BUSINESS_SERVICES.map((b) => {
            const isFocus = focusId === b.id;
            return (
              <button key={b.id}
                onMouseEnter={() => setHoveredId(b.id)} onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(b.id)}
                className={cn(
                  "group relative text-left rounded-xl border bg-white/85 backdrop-blur p-2.5 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow-lg",
                  "border-slate-200/70",
                  isFocus && "ring-2 " + HEALTH[b.health].ring,
                  b.health === "critical" && "animate-[pulse_2.6s_ease-in-out_infinite]",
                  dim(b.id) && "opacity-30",
                )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-[11px] font-semibold text-slate-800">{b.name}</div>
                  <StatusDot s={b.health} pulse />
                </div>
                <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-600">
                  <div>SLO <span className="tabular-nums text-slate-800">{b.sloActual}</span></div>
                  <div>p95 <span className="tabular-nums text-slate-800">{b.p95}</span></div>
                  <div>Err <span className="tabular-nums text-slate-800">{b.err}</span></div>
                  <div>Risk <span className="tabular-nums text-slate-800">{b.risk}</span></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* connector spacer */}
      <div className="h-9" />

      {/* LAYER 2 — Transaction lanes */}
      <div className="relative z-10 px-3">
        <Label>User Transactions</Label>
        <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${txCols}, minmax(0, 1fr))` }}>
          {TRANSACTIONS.map((t) => {
            const isFocus = focusId === t.id;
            return (
              <button key={t.id}
                onMouseEnter={() => setHoveredId(t.id)} onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(t.id)}
                className={cn(
                  "relative text-left rounded-lg border border-slate-200/70 bg-white/80 p-2 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow",
                  isFocus && "ring-2 " + HEALTH[t.health].ring,
                  dim(t.id) && "opacity-30",
                )}>
                <div className="flex items-center justify-between">
                  <div className="truncate text-[10.5px] font-medium text-slate-800">{t.name}</div>
                  <StatusDot s={t.health} />
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
                  <span>p95 {t.p95}</span><span>{t.err}</span>
                </div>
                <div className="mt-1 h-0.5 w-full overflow-hidden rounded bg-slate-100">
                  <div className={cn("h-full w-1/3 animate-[flow_2.4s_linear_infinite] rounded",
                    t.health === "critical" ? "bg-rose-400" : t.health === "warning" ? "bg-amber-400" : "bg-emerald-400")} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-9" />

      {/* LAYER 3 — Application Services */}
      <div className="relative z-10 px-3">
        <Label>Application Services</Label>
        <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${svcCols}, minmax(0, 1fr))` }}>
          {APP_SERVICES.map((s) => {
            const isFocus = focusId === s.id;
            return (
              <button key={s.id}
                onMouseEnter={() => setHoveredId(s.id)} onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(s.id)}
                className={cn(
                  "relative text-left rounded-lg border border-slate-200/70 bg-white/85 p-1.5 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow",
                  isFocus && "ring-2 " + HEALTH[s.health].ring,
                  s.health === "critical" && "shadow-[0_0_0_4px_rgba(244,63,94,0.10)]",
                  dim(s.id) && "opacity-30",
                )}>
                <div className="flex items-center gap-1.5">
                  <StatusDot s={s.health} pulse />
                  <div className="truncate text-[10px] font-medium text-slate-800">{s.name}</div>
                </div>
                <div className="text-[9.5px] text-slate-500 tabular-nums">{s.version} · sat {s.sat}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-9" />

      {/* LAYER 4 — AWS Resource clusters */}
      <div className="relative z-10 px-3 pb-3">
        <Label>AWS Cloud Native Resources</Label>
        <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${awsCols}, minmax(0, 1fr))` }}>
          {AWS_GROUPS.map((g) => {
            const isFocus = focusId === g.id;
            const worst: Health = g.resources.some(r => r.status === "critical") ? "critical"
              : g.resources.some(r => r.status === "warning") ? "warning" : "healthy";
            return (
              <button key={g.id}
                onMouseEnter={() => setHoveredId(g.id)} onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(g.id)}
                className={cn(
                  "relative text-left rounded-xl border border-slate-200/70 bg-gradient-to-b p-1.5 transition-all duration-300 overflow-hidden",
                  g.tone, "hover:-translate-y-0.5 hover:shadow",
                  isFocus && "ring-2 " + HEALTH[worst].ring,
                  dim(g.id) && "opacity-30",
                )}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-slate-800 truncate">{g.name}</div>
                  <StatusDot s={worst} pulse />
                </div>
                <div className="mt-1 space-y-0.5">
                  {g.resources.slice(0, 3).map((r) => (
                    <div key={r.name} className="flex items-center justify-between gap-1 text-[9.5px] text-slate-600">
                      <span className="truncate">{r.name}</span>
                      <StatusDot s={r.status} />
                    </div>
                  ))}
                  {g.resources.length > 3 && <div className="text-[9px] text-slate-400">+{g.resources.length - 3} more</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Investigation breadcrumb */}
      {selectedId === "svc-pay" && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10.5px] text-slate-600 shadow-sm backdrop-blur">
          Payment Services <ChevronRight className="inline h-3 w-3 mx-0.5 text-slate-400" /> Process Payment
          <ChevronRight className="inline h-3 w-3 mx-0.5 text-slate-400" /> Payment Service
          <ChevronRight className="inline h-3 w-3 mx-0.5 text-slate-400" /> Aurora PostgreSQL
          <ChevronRight className="inline h-3 w-3 mx-0.5 text-slate-400" /> SQS
          <ChevronRight className="inline h-3 w-3 mx-0.5 text-slate-400" /> Notification Service
        </div>
      )}

      {/* Canvas legend */}
      <div className="pointer-events-none absolute bottom-2 right-3 z-20 flex items-center gap-3 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[10px] text-slate-600 shadow-sm backdrop-blur">
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-rose-500" /> Critical path</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-3 rounded-full bg-slate-400/70" /> Dependency</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Live</span>
      </div>

      <style>{`
        @keyframes flow { 0% { transform: translateX(-100%);} 100% { transform: translateX(400%);} }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RIGHT DETAIL PANEL                                                  */
/* ------------------------------------------------------------------ */
function detailFor(id: string | null) {
  if (!id) return null;
  const biz = BUSINESS_SERVICES.find(b => b.id === id);
  const tx  = TRANSACTIONS.find(t => t.id === id);
  const svc = APP_SERVICES.find(s => s.id === id);
  const aws = AWS_GROUPS.find(g => g.id === id);
  if (biz) return { kind: "Business Service", name: biz.name, health: biz.health, owner: biz.owner, fields: [
    ["Availability", biz.avail], ["SLO Target", biz.sloTarget], ["Actual SLO", biz.sloActual],
    ["P95 Latency", biz.p95], ["Error Rate", biz.err], ["Transactions", biz.tx],
    ["Risk Score", String(biz.risk)], ["Business Impact", biz.impact], ["Open Incidents", String(biz.incidents)],
  ]};
  if (tx) return { kind: "Transaction", name: tx.name, health: tx.health, owner: tx.owner, fields: [
    ["P50", tx.p50], ["P95", tx.p95], ["P99", tx.p99], ["Errors", tx.err], ["Throughput", tx.tput],
    ["SLO Target", tx.sloT], ["Actual SLO", tx.sloA], ["Last Deploy", tx.lastDeploy],
    ["Top Dependency", tx.topDep], ["Cost / 1K", tx.costPerK], ["Recent Changes", String(tx.changes)],
  ]};
  if (svc) return { kind: "Application Service", name: svc.name, health: svc.health, owner: svc.owner, fields: [
    ["Runtime", svc.runtime], ["Version", svc.version], ["P95", svc.p95], ["Errors", svc.err],
    ["Saturation", svc.sat], ["Throughput", svc.tput], ["Tasks", String(svc.tasks)],
    ["Last Deploy", svc.deploy], ["Cost", svc.cost], ["Security", svc.sec], ["Recent Changes", String(svc.changes)],
  ]};
  if (aws) return { kind: "AWS Resource Group", name: aws.name, health: (aws.resources.some(r => r.status === "critical") ? "critical" : aws.resources.some(r => r.status === "warning") ? "warning" : "healthy") as Health, owner: "Platform Cloud Team", fields:
    aws.resources.map(r => [r.name, `${r.util || "—"}  ·  ${r.cost || "—"}`]) as [string, string][],
  };
  return null;
}

function RightPanel({
  selectedId, onClear, onGenerateRCA,
}: { selectedId: string | null; onClear: () => void; onGenerateRCA: () => void }) {
  const d = detailFor(selectedId) || detailFor("svc-pay")!;
  const isPay = (selectedId ?? "svc-pay") === "svc-pay" || selectedId === "bs-pay" || selectedId === "tx-pay";
  return (
    <Glass className="flex h-full w-full flex-col overflow-hidden">
      {/* Sticky header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 p-4">
        <div>
          <Label>{d.kind}</Label>
          <div className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
            {d.name} <Chip s={d.health}>{HEALTH[d.health].label}</Chip>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Owner · {d.owner} · prod · us-east-1</div>
        </div>
        {selectedId && (
          <button onClick={onClear} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Golden signals */}
        {isPay && (
          <section>
            <Label>Golden Signals</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Metric label="Latency P95" value="912 ms" sub="target <300 · base 228" tone="critical" />
              <Metric label="Traffic"     value="3,900 rpm" sub="base 2,800" tone="warning" />
              <Metric label="Errors"      value="2.70%" sub="target <0.25 · base 0.08" tone="critical" />
              <Metric label="Saturation"  value="91%" sub="target <70 · base 44" tone="critical" />
            </div>
          </section>
        )}

        {/* SLO + Error Budget */}
        {isPay && (
          <section>
            <Label>SLO & Error Budget</Label>
            <div className="mt-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 text-[12px]">
              <div className="flex items-center justify-between"><span className="text-slate-500">Target</span><span className="font-medium tabular-nums">99.95%</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Actual</span><span className="font-medium tabular-nums">99.72%</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Burn rate</span><span className="font-medium tabular-nums text-rose-600">8.4×</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Budget remaining</span><span className="font-medium tabular-nums">12%</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Time to exhaustion</span><span className="font-medium tabular-nums">~3 hours</span></div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" style={{ width: "88%" }} />
              </div>
            </div>
          </section>
        )}

        {/* Generic fields */}
        <section>
          <Label>Operating Telemetry</Label>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11.5px]">
            {d.fields.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded border border-slate-200/60 bg-white/70 px-2 py-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium text-slate-800 tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trace waterfall (always show on selection, defaults to Payment) */}
        <section>
          <Label>APM Trace Waterfall</Label>
          <div className="mt-2 space-y-1 rounded-xl border border-slate-200/70 bg-white/70 p-3">
            {[
              { n: "CloudFront",        ms: 18,  c: "bg-sky-300" },
              { n: "API Gateway",       ms: 32,  c: "bg-indigo-300" },
              { n: "Payment Service",   ms: 612, c: "bg-rose-400" },
              { n: "Aurora PostgreSQL", ms: 412, c: "bg-rose-500" },
              { n: "KMS",               ms: 28,  c: "bg-violet-300" },
              { n: "SQS",               ms: 184, c: "bg-amber-400" },
              { n: "Notification Svc",  ms: 96,  c: "bg-amber-300" },
            ].map(r => (
              <div key={r.n} className="flex items-center gap-2 text-[11px]">
                <div className="w-32 shrink-0 text-slate-600 truncate">{r.n}</div>
                <div className="relative h-2 flex-1 rounded bg-slate-100">
                  <div className={cn("absolute left-0 top-0 h-full rounded", r.c)} style={{ width: `${(r.ms/700)*100}%` }} />
                </div>
                <div className="w-12 text-right tabular-nums text-slate-700">{r.ms}ms</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended actions */}
        <section>
          <Label>Recommended Actions</Label>
          <div className="mt-2 space-y-2">
            {[
              { t: "Rollback deployment v2.14.7", risk: "Medium", conf: 87, impact: "Restore P95 to ~228 ms" },
              { t: "Scale Aurora writer instance", risk: "Low",    conf: 72, impact: "Relieve CPU saturation" },
              { t: "Throttle payment retry storm", risk: "Low",    conf: 81, impact: "Reduce error rate" },
              { t: "Increase SQS consumers",       risk: "Low",    conf: 76, impact: "Drain backlog" },
            ].map(a => (
              <div key={a.t} className="rounded-xl border border-slate-200/70 bg-white/80 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[12px] font-medium text-slate-800">{a.t}</div>
                    <div className="text-[10.5px] text-slate-500">{a.impact}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px]">Conf {a.conf}%</Badge>
                    <Badge variant="outline" className="text-[10px]">Risk {a.risk}</Badge>
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button size="sm" className="h-7 text-[11px]">Approve & Run</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]">Diagnose</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Label>Reporting</Label>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onGenerateRCA}><FileBarChart2 className="mr-1 h-3 w-3" />Generate RCA</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"><Sparkles className="mr-1 h-3 w-3" />Exec Summary</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"><Activity className="mr-1 h-3 w-3" />SRE Report</Button>
            <Button size="sm" variant="outline" className="h-7 text-[11px]"><DollarSign className="mr-1 h-3 w-3" />FinOps Report</Button>
          </div>
        </section>
      </div>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* OPERATIONAL TIMELINE                                                */
/* ------------------------------------------------------------------ */
function Timeline() {
  const [filter, setFilter] = useState<string>("All");
  const filters = ["All", "Incidents", "Changes", "Deployments", "Security", "Cost", "Automation", "SLO", "APM"];
  return (
    <Glass className="p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label>Operational Timeline · Last 24h</Label>
          <Select defaultValue="24h">
            <SelectTrigger className="h-7 w-[120px] text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Live", "15m", "1h", "6h", "24h", "7d", "30d"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]"><PlayCircle className="mr-1 h-3 w-3" />Play incident</Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]"><PauseCircle className="mr-1 h-3 w-3" />Pause</Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]"><RefreshCw className="mr-1 h-3 w-3" />Reset</Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-full border px-2 py-0.5 text-[10.5px]",
              filter === f ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{f}</button>
        ))}
      </div>
      <div className="mt-3 relative">
        <div className="absolute left-0 right-0 top-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="flex items-start gap-3 overflow-x-auto pb-1">
          {TIMELINE_EVENTS.map((e, i) => (
            <div key={i} className="relative shrink-0 w-[148px]">
              <div className={cn("mx-auto h-2.5 w-2.5 rounded-full ring-4 ring-white", HEALTH[e.tone].dot)} />
              <div className="mt-1 text-center text-[10px] text-slate-500 tabular-nums">{e.t}</div>
              <div className="mt-1 rounded-md border border-slate-200/70 bg-white/80 p-1.5 text-[10.5px]">
                <div className="text-[9.5px] uppercase tracking-wide text-slate-400">{e.type}</div>
                <div className="text-slate-800 leading-tight">{e.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* NOVA COPILOT                                                        */
/* ------------------------------------------------------------------ */
function NovaCopilot({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  return (
    <>
      {!open && (
        <button onClick={() => onOpenChange(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-2.5 text-[12px] font-medium text-white shadow-lg hover:shadow-xl transition-shadow">
          <Bot className="h-4 w-4" /> Ask NOVA SRE Copilot
        </button>
      )}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[440px] sm:w-[500px] p-0 bg-gradient-to-b from-white to-slate-50">
          <SheetHeader className="px-5 pt-5">
            <SheetTitle className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white"><Bot className="h-4 w-4" /></span>
              NOVA SRE Copilot
            </SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-5 pt-3 space-y-3 overflow-y-auto h-[calc(100vh-72px)]">
            <Glass className="p-3">
              <Label>Summary</Label>
              <p className="mt-1 text-[12.5px] text-slate-700 leading-relaxed">
                Payment Services is <span className="font-semibold text-rose-600">Critical</span>. Aurora PostgreSQL CPU reached 91%,
                active connections increased 43%, and Payment Service error rate climbed to 2.7%.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Confidence</div><div className="font-semibold text-slate-900">87%</div></div>
                <div className="rounded-md bg-slate-50 p-2"><div className="text-slate-500">Risk</div><div className="font-semibold text-amber-700">Medium</div></div>
              </div>
            </Glass>

            <Glass className="p-3">
              <Label>Evidence</Label>
              <ul className="mt-1.5 space-y-1 text-[11.5px] text-slate-700 list-disc pl-4">
                <li>Payment Service P95 latency 228 ms → 912 ms</li>
                <li>Payment Service error rate 0.08% → 2.7%</li>
                <li>Aurora CPU 44% → 91% · connections +43%</li>
                <li>Error budget burn 8.4× normal</li>
                <li>Deployment v2.14.7 occurred 12m before degradation</li>
              </ul>
            </Glass>

            <Glass className="p-3">
              <Label>Probable Root Cause</Label>
              <p className="mt-1 text-[12px] text-slate-700">Connection pool saturation after deployment v2.14.7.</p>
              <Label><span className="mt-2 inline-block">Blast Radius</span></Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {["Payment Service","Order Service","Notification Service","Submit Order","Process Payment"].map(x =>
                  <Badge key={x} variant="outline" className="text-[10px]">{x}</Badge>)}
              </div>
            </Glass>

            <Glass className="p-3">
              <Label>Recommended Actions</Label>
              <div className="mt-2 space-y-1.5">
                {[
                  "Rollback Payment Service deployment v2.14.7",
                  "Increase Aurora capacity & reduce retry concurrency",
                  "Create emergency change and notify Payments SRE Squad",
                ].map(t => (
                  <div key={t} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-2 text-[11.5px]">
                    <span className="text-slate-700">{t}</span>
                    <Button size="sm" className="h-6 text-[10.5px]">Run</Button>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {["Create Incident","Create Change","Execute Runbook","Run Simulation","Generate RCA","Export Evidence"].map(b =>
                  <Button key={b} size="sm" variant="outline" className="h-7 text-[10.5px]">{b}</Button>)}
              </div>
            </Glass>

            <div className="relative">
              <Input placeholder="Ask NOVA about reliability, incidents, cost, security, dependencies, traces, or automation" className="pr-9" />
              <MessageSquare className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <div className="flex flex-wrap gap-1">
              {["Why is Payment Services critical?","What changed before the spike?","What is the blast radius?","Simulate Aurora failure","Generate executive summary"].map(p =>
                <button key={p} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] text-slate-600 hover:bg-slate-50">{p}</button>)}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* SECONDARY VIEWS                                                     */
/* ------------------------------------------------------------------ */
function APMView() {
  return (
    <div className="grid h-full grid-cols-12 gap-3">
      <Glass className="col-span-7 p-4 overflow-auto">
        <Label>Service Map · Process Payment trace</Label>
        <div className="mt-3 space-y-1">
          {[
            { n: "CloudFront",        ms: 18,  c: "bg-sky-300" },
            { n: "API Gateway",       ms: 32,  c: "bg-indigo-300" },
            { n: "Payment Service",   ms: 612, c: "bg-rose-400" },
            { n: "Aurora PostgreSQL", ms: 412, c: "bg-rose-500" },
            { n: "KMS",               ms: 28,  c: "bg-violet-300" },
            { n: "SQS",               ms: 184, c: "bg-amber-400" },
            { n: "Notification Svc",  ms: 96,  c: "bg-amber-300" },
          ].map(r => (
            <div key={r.n} className="flex items-center gap-2 text-[12px]">
              <div className="w-40 shrink-0 text-slate-700">{r.n}</div>
              <div className="relative h-3 flex-1 rounded bg-slate-100">
                <div className={cn("absolute left-0 top-0 h-full rounded", r.c)} style={{ width: `${(r.ms/700)*100}%` }} />
              </div>
              <div className="w-14 text-right tabular-nums text-slate-700">{r.ms} ms</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Apdex" value="0.71" sub="target ≥ 0.85" tone="warning" />
          <Metric label="P95" value="912 ms" tone="critical" />
          <Metric label="Error Rate" value="2.70%" tone="critical" />
        </div>
      </Glass>
      <Glass className="col-span-5 p-4 overflow-auto">
        <Label>Top Endpoints</Label>
        <div className="mt-2 space-y-1 text-[12px]">
          {[
            { e: "POST /payment",  rpm: 3900, p95: 912, err: "2.70%", apdex: 0.71, tone: "critical" as Health },
            { e: "POST /checkout", rpm: 5400, p95: 610, err: "0.90%", apdex: 0.84, tone: "warning"  as Health },
            { e: "GET /catalog/search", rpm: 6400, p95: 240, err: "0.09%", apdex: 0.97, tone: "healthy" as Health },
            { e: "POST /login",    rpm: 8100, p95: 146, err: "0.03%", apdex: 0.99, tone: "healthy" as Health },
            { e: "GET /recommendations", rpm: 2800, p95: 260, err: "0.18%", apdex: 0.96, tone: "healthy" as Health },
            { e: "POST /notification", rpm: 4100, p95: 680, err: "1.10%", apdex: 0.80, tone: "warning" as Health },
          ].map(r => (
            <div key={r.e} className="grid grid-cols-12 items-center gap-2 rounded-md border border-slate-200/70 bg-white/80 px-2 py-1.5">
              <StatusDot s={r.tone} /> <div className="col-span-4 truncate">{r.e}</div>
              <div className="col-span-2 tabular-nums text-right text-slate-600">{r.rpm} rpm</div>
              <div className="col-span-2 tabular-nums text-right">{r.p95}ms</div>
              <div className="col-span-2 tabular-nums text-right">{r.err}</div>
              <div className="col-span-1 tabular-nums text-right">{r.apdex}</div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

function InfrastructureView() {
  return (
    <div className="grid h-full grid-cols-12 gap-3 overflow-auto">
      <Glass className="col-span-12 p-4">
        <Label>AWS Account · 1248-prod-commerce · us-east-1 · 3 AZs · VPC vpc-prod-commerce</Label>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {AWS_GROUPS.flatMap(g => g.resources.map(r => ({ ...r, group: g.name }))).map((r) => (
            <div key={r.name+r.group} className="rounded-xl border border-slate-200/70 bg-white/80 p-2.5">
              <div className="flex items-center justify-between">
                <div className="truncate text-[12px] font-medium text-slate-800">{r.name}</div>
                <StatusDot s={r.status} />
              </div>
              <div className="text-[10.5px] text-slate-500">{r.group}</div>
              <div className="mt-1 text-[10.5px] text-slate-600">Utilization · <span className="tabular-nums text-slate-800">{r.util || "—"}</span></div>
              <div className="text-[10.5px] text-slate-600">Cost · <span className="tabular-nums text-slate-800">{r.cost || "—"}</span></div>
              <div className="mt-1.5 h-1 rounded bg-slate-100 overflow-hidden">
                <div className={cn("h-full", r.status === "critical" ? "bg-rose-400" : r.status === "warning" ? "bg-amber-400" : "bg-emerald-400")}
                  style={{ width: r.util && r.util.endsWith("%") ? r.util : "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

function SecurityView() {
  const kpis = [
    { l: "Critical Findings", v: "3",  t: "critical" as Health },
    { l: "High Findings",     v: "14", t: "warning"  as Health },
    { l: "Public Exposure",   v: "2 resources", t: "warning" as Health },
    { l: "Secrets > 90 days", v: "8",  t: "warning"  as Health },
    { l: "Open Sec Groups",   v: "1",  t: "warning"  as Health },
    { l: "Encryption Cov.",   v: "98%",t: "healthy"  as Health },
  ];
  return (
    <div className="grid h-full grid-cols-12 gap-3 overflow-auto">
      <div className="col-span-12 grid grid-cols-6 gap-2">
        {kpis.map(k => <Glass key={k.l} className="p-3"><Label>{k.l}</Label><div className="mt-1 text-xl font-semibold tabular-nums">{k.v}</div><Chip s={k.t}>{HEALTH[k.t].label}</Chip></Glass>)}
      </div>
      <Glass className="col-span-12 p-4">
        <Label>Security Findings</Label>
        <div className="mt-2 space-y-1 text-[12px]">
          {[
            { sev: "critical" as Health, t: "Unencrypted backup snapshot detected", r: "RDS aurora-payment", e: "snapshot publicly listable", b: "Payment Services" },
            { sev: "warning"  as Health, t: "GuardDuty: anomalous IAM access pattern",  r: "iam::role/PaymentService", e: "5 unusual API calls from new IP", b: "Payment Service" },
            { sev: "warning"  as Health, t: "Secret > 90 days without rotation",       r: "secrets/payment-db-master", e: "last rotated 127 days ago", b: "Payment Service" },
            { sev: "warning"  as Health, t: "Inspector: outdated runtime", r: "ECS task def payment:482", e: "Node 16 EOL", b: "Payment Service" },
            { sev: "healthy"  as Health, t: "WAF rate-limit rule triggered (resolved)", r: "WAF rule rl-payment", e: "burst from 1 ASN, blocked", b: "Payment Services" },
          ].map((f,i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-md border border-slate-200/70 bg-white/80 px-2 py-1.5">
              <StatusDot s={f.sev} />
              <div className="col-span-4 font-medium text-slate-800">{f.t}</div>
              <div className="col-span-3 text-slate-600">{f.r}</div>
              <div className="col-span-3 text-slate-500">{f.e}</div>
              <div className="col-span-1 text-right"><Badge variant="outline" className="text-[10px]">{f.b}</Badge></div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
}

function FinOpsView() {
  const cards = [
    { l: "Monthly Budget",   v: "$475.0K", t: "info"    as Health },
    { l: "Current Spend",    v: "$482.3K", t: "warning" as Health },
    { l: "Forecast",         v: "$516.8K", t: "warning" as Health },
    { l: "Variance",         v: "+8.8%",   t: "warning" as Health },
    { l: "Optimization Opp", v: "$74.2K",  t: "healthy" as Health },
    { l: "Idle Resources",   v: "$18.9K",  t: "warning" as Health },
  ];
  return (
    <div className="grid h-full grid-cols-12 gap-3 overflow-auto">
      <div className="col-span-12 grid grid-cols-6 gap-2">
        {cards.map(c => <Glass key={c.l} className="p-3"><Label>{c.l}</Label><div className="mt-1 text-xl font-semibold tabular-nums">{c.v}</div></Glass>)}
      </div>
      <Glass className="col-span-7 p-4">
        <Label>Cost by Business Service</Label>
        <div className="mt-3 space-y-1.5 text-[12px]">
          {[
            { n: "Payment Services",     v: 168, c: "bg-teal-400" },
            { n: "Order Management",     v: 124, c: "bg-teal-400" },
            { n: "Customer Experience",  v: 92,  c: "bg-teal-300" },
            { n: "Identity Services",    v: 38,  c: "bg-teal-300" },
            { n: "Notification Services",v: 28,  c: "bg-teal-300" },
            { n: "Analytics Platform",   v: 32,  c: "bg-teal-300" },
          ].map(r => (
            <div key={r.n} className="flex items-center gap-2">
              <div className="w-44 truncate text-slate-700">{r.n}</div>
              <div className="relative h-3 flex-1 rounded bg-slate-100">
                <div className={cn("absolute left-0 top-0 h-full rounded", r.c)} style={{ width: `${(r.v/170)*100}%` }} />
              </div>
              <div className="w-16 text-right tabular-nums text-slate-700">${r.v}K</div>
            </div>
          ))}
        </div>
      </Glass>
      <Glass className="col-span-5 p-4">
        <Label>Recommendations</Label>
        <ul className="mt-2 space-y-1.5 text-[12px]">
          {[
            ["Rightsize ECS Payment Service", "$8,400/mo"],
            ["Tune Aurora storage IOPS",       "$5,200/mo"],
            ["Reduce NAT GW data processing",  "$3,100/mo"],
            ["S3 IA tier for cold reports",    "$2,400/mo"],
            ["Purchase Savings Plan (compute)","$23,900/mo"],
            ["Cleanup unattached EBS",         "$1,100/mo"],
          ].map(([t,v]) => (
            <li key={t} className="flex items-center justify-between rounded-md border border-slate-200/70 bg-white/80 px-2 py-1.5">
              <span>{t}</span><span className="tabular-nums font-medium text-teal-700">{v}</span>
            </li>
          ))}
        </ul>
      </Glass>
    </div>
  );
}

function ReliabilityView() {
  const slos = [
    { n: "Checkout Availability", t: "99.95%", a: "99.86%", brn: "3.2×", rem: "62%", o: "Orders SRE Squad", h: "warning" as Health },
    { n: "Payment Latency",       t: "<300ms p95", a: "912ms p95", brn: "8.4×", rem: "12%", o: "Payments SRE Squad", h: "critical" as Health },
    { n: "Search Success",        t: "99.95%", a: "99.96%", brn: "0.4×", rem: "88%", o: "Search Platform Team", h: "healthy" as Health },
    { n: "Login Success",         t: "99.99%", a: "99.99%", brn: "0.1×", rem: "97%", o: "Identity Platform Team", h: "healthy" as Health },
    { n: "Notification Delivery", t: "99.90%", a: "99.81%", brn: "2.4×", rem: "44%", o: "Messaging Platform Team", h: "warning" as Health },
    { n: "API Availability",      t: "99.95%", a: "99.94%", brn: "1.1×", rem: "71%", o: "Platform SRE", h: "warning" as Health },
  ];
  return (
    <div className="grid h-full grid-cols-12 gap-3 overflow-auto">
      <div className="col-span-12 grid grid-cols-2 md:grid-cols-3 gap-2">
        {slos.map(s => (
          <Glass key={s.n} className="p-3">
            <div className="flex items-center justify-between"><div className="text-[12px] font-semibold text-slate-800">{s.n}</div><Chip s={s.h}>{HEALTH[s.h].label}</Chip></div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div><Label>Target</Label><div className="tabular-nums">{s.t}</div></div>
              <div><Label>Actual</Label><div className="tabular-nums">{s.a}</div></div>
              <div><Label>Burn</Label><div className="tabular-nums">{s.brn}</div></div>
              <div><Label>Budget</Label><div className="tabular-nums">{s.rem}</div></div>
            </div>
            <div className="mt-2 text-[10.5px] text-slate-500">Owner · {s.o}</div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

function IncidentCommandView({ onGenerateRCA }: { onGenerateRCA: () => void }) {
  return (
    <Glass className="h-full overflow-auto p-4">
      <div className="flex items-start justify-between">
        <div>
          <Label>Incident</Label>
          <div className="mt-0.5 flex items-center gap-2 text-lg font-semibold text-slate-900">INC-48217 · Payment Services Critical <Chip s="critical">SEV-1</Chip></div>
          <div className="mt-1 text-[11.5px] text-slate-500">Commander · Sarah Mitchell · Opened 50m ago · Bridge active · CHG-9821 pending</div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm">Execute Rollback</Button>
          <Button size="sm" variant="outline">Page owner</Button>
          <Button size="sm" variant="outline" onClick={onGenerateRCA}>Generate RCA</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="bg-slate-100/70">
          {["overview","impact","timeline","traces","logs","metrics","changes","deps","runbook","comms","rca"].map(t =>
            <TabsTrigger key={t} value={t} className="text-[11px] capitalize">{t}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="overview" className="mt-3 grid grid-cols-3 gap-3">
          <Glass className="p-3"><Label>Current Hypothesis</Label><p className="mt-1 text-[12px] text-slate-700">Connection pool saturation after Payment Service v2.14.7 deploy.</p></Glass>
          <Glass className="p-3"><Label>Customer Impact</Label><p className="mt-1 text-[12px] text-slate-700">~12.4K checkout attempts degraded, 1.8% failure rate.</p></Glass>
          <Glass className="p-3"><Label>SLO Impact</Label><p className="mt-1 text-[12px] text-slate-700">Payment SLO 99.95→99.72, error budget burn 8.4× (12% remaining).</p></Glass>
          <Glass className="col-span-3 p-3"><Label>Actions Taken</Label>
            <ul className="mt-1 list-disc pl-4 text-[12px] text-slate-700 space-y-0.5">
              <li>09:42 — Auto-scale +18 Payment tasks</li>
              <li>09:48 — Payments SRE on-call engaged</li>
              <li>09:55 — NOVA recommendation: rollback v2.14.7</li>
              <li>10:02 — Emergency change CHG-9821 submitted, awaiting approval</li>
            </ul>
          </Glass>
        </TabsContent>
        <TabsContent value="impact">Impact details available in the right panel.</TabsContent>
        <TabsContent value="timeline">See the operational timeline below.</TabsContent>
        <TabsContent value="traces">Trace waterfall is shown in the right panel.</TabsContent>
        <TabsContent value="logs"><div className="text-[12px] text-slate-600 mt-2">Streaming logs from Payment Service, Aurora, SQS, Notification…</div></TabsContent>
        <TabsContent value="metrics">P95, error rate, saturation, traffic — see the Reliability and APM views.</TabsContent>
        <TabsContent value="changes">CHG-9821 · Rollback Payment Service v2.14.7 → v2.14.6 — pending approval.</TabsContent>
        <TabsContent value="deps">Aurora PostgreSQL, SQS, KMS, Notification Service.</TabsContent>
        <TabsContent value="runbook">RB-PAY-022 · Payment Service rollback runbook.</TabsContent>
        <TabsContent value="comms">Status page draft prepared. 2 stakeholder updates queued.</TabsContent>
        <TabsContent value="rca">Use <em>Generate RCA</em> to draft a full root cause analysis.</TabsContent>
      </Tabs>
    </Glass>
  );
}

function ChangeImpactView() {
  return (
    <Glass className="h-full overflow-auto p-4">
      <Label>Recent Changes & Operational Impact</Label>
      <div className="mt-2 space-y-1 text-[12px]">
        {[
          { id:"CHG-9819", t:"-12h", res:"Aurora paramgroup", svc:"Payment Service", risk:"Low",  lat:["228→228","stable"], err:["0.08→0.08","stable"], corr:"" },
          { id:"CHG-9820", t:"-8h",  res:"Notification Service v4.0.6", svc:"Notification Service", risk:"Low", lat:["620→680","+10%"], err:["0.9→1.1","+0.2"], corr:"" },
          { id:"CHG-9817", t:"-3h",  res:"Order Service v5.8.2", svc:"Order Service", risk:"Med", lat:["520→610","+17%"], err:["0.6→0.9","+0.3"], corr:"36%" },
          { id:"CHG-9821", t:"-2h12m", res:"Payment Service v2.14.7", svc:"Payment Service", risk:"High", lat:["228→912","+300%"], err:["0.08→2.7","+2.6"], corr:"87%" },
        ].map(c => (
          <div key={c.id} className="grid grid-cols-12 items-center gap-2 rounded-md border border-slate-200/70 bg-white/80 px-2 py-1.5">
            <div className="col-span-1 font-mono text-[10.5px] text-slate-500">{c.id}</div>
            <div className="col-span-1 text-slate-500">{c.t}</div>
            <div className="col-span-3 font-medium text-slate-800 truncate">{c.res}</div>
            <div className="col-span-2 text-slate-600 truncate">{c.svc}</div>
            <div className="col-span-1"><Badge variant="outline" className="text-[10px]">{c.risk}</Badge></div>
            <div className="col-span-2 tabular-nums text-slate-700">Lat {c.lat[0]} <span className="text-rose-600">{c.lat[1]}</span></div>
            <div className="col-span-1 tabular-nums text-slate-700">Err {c.err[0]}</div>
            <div className="col-span-1 text-right">{c.corr && <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">corr {c.corr}</Badge>}</div>
          </div>
        ))}
      </div>
    </Glass>
  );
}

function SimulationView() {
  const [scenario, setScenario] = useState("aurora-writer");
  const scenarios = [
    { id: "az",             label: "Availability Zone failure" },
    { id: "region",         label: "Region degradation" },
    { id: "aurora-writer",  label: "Aurora writer failure" },
    { id: "dynamodb",       label: "DynamoDB throttling" },
    { id: "redis",          label: "Redis failure" },
    { id: "sqs",            label: "SQS backlog" },
    { id: "lambda",         label: "Lambda concurrency exhaustion" },
    { id: "ecs",            label: "ECS task crash loop" },
    { id: "waf",            label: "WAF block surge" },
    { id: "secrets",        label: "Secrets rotation failure" },
    { id: "iam",            label: "IAM misconfiguration" },
    { id: "cloudfront",     label: "CloudFront outage" },
    { id: "apigw",          label: "API Gateway throttling" },
    { id: "nat",            label: "NAT Gateway failure" },
    { id: "cost",           label: "Cost spike" },
    { id: "compromise",     label: "Security compromise" },
  ];
  return (
    <div className="grid h-full grid-cols-12 gap-3 overflow-auto">
      <Glass className="col-span-4 p-3">
        <Label>What-If Scenarios</Label>
        <div className="mt-2 grid grid-cols-1 gap-1">
          {scenarios.map(s => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={cn("rounded-md border px-2 py-1.5 text-left text-[12px]",
                scenario === s.id ? "border-indigo-300 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700")}>{s.label}</button>
          ))}
        </div>
      </Glass>
      <Glass className="col-span-8 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Simulation Result</Label>
            <div className="text-lg font-semibold text-slate-900">{scenarios.find(s => s.id === scenario)?.label}</div>
          </div>
          <Button size="sm"><PlayCircle className="mr-1 h-3.5 w-3.5" />Run simulation</Button>
        </div>
        <div className="relative mt-4 h-44 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white">
          {/* propagation wave */}
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/70" />
          {[1,2,3].map(i => (
            <div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-400/50"
              style={{ width: `${i*80}px`, height: `${i*80}px`, animation: `wave 2.4s ease-out ${i*0.3}s infinite` }} />
          ))}
          <style>{`@keyframes wave { 0%{transform:translate(-50%,-50%) scale(0.6); opacity:0.7;} 100%{transform:translate(-50%,-50%) scale(1.4); opacity:0;} }`}</style>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
          <Glass className="p-2"><Label>Estimated Downtime</Label><div className="font-semibold text-slate-900">~2 minutes</div><div className="text-slate-500">with automated failover</div></Glass>
          <Glass className="p-2"><Label>RTO / RPO</Label><div className="font-semibold text-slate-900">4 min / 30 s</div></Glass>
          <Glass className="p-2"><Label>Confidence</Label><div className="font-semibold text-slate-900">82%</div></Glass>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          <Glass className="p-3"><Label>Impacted</Label>
            <ul className="mt-1 list-disc pl-4 text-slate-700">
              <li>Payment Services · Order Management</li>
              <li>Submit Order · Process Payment</li>
              <li>Payment Service · Order Service</li>
            </ul>
          </Glass>
          <Glass className="p-3"><Label>Recommended improvements</Label>
            <ul className="mt-1 list-disc pl-4 text-slate-700">
              <li>Enable read replica routing</li>
              <li>Review connection pooling</li>
              <li>Test failover runbook quarterly</li>
            </ul>
          </Glass>
        </div>
      </Glass>
    </div>
  );
}

function BusinessServicesView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid h-full grid-cols-3 gap-3 overflow-auto">
      {BUSINESS_SERVICES.map(b => (
        <div key={b.id} onClick={() => onSelect(b.id)} className="cursor-pointer"><Glass className="p-4 hover:-translate-y-0.5 transition">
          <div className="flex items-center justify-between"><div className="font-semibold">{b.name}</div><Chip s={b.health}>{HEALTH[b.health].label}</Chip></div>
          <div className="mt-1 text-[11px] text-slate-500">{b.owner}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Metric label="Availability" value={b.avail} />
            <Metric label="SLO" value={b.sloActual} sub={`target ${b.sloTarget}`} />
            <Metric label="P95" value={b.p95} />
            <Metric label="Errors" value={b.err} />
            <Metric label="Traffic" value={b.tx} />
            <Metric label="Risk" value={String(b.risk)} sub={b.impact} />
          </div>
        </Glass></div>

      ))}
    </div>
  );
}

function TransactionsView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Glass className="h-full overflow-auto p-4">
      <Label>User Transactions</Label>
      <div className="mt-2 space-y-1 text-[12px]">
        <div className="grid grid-cols-12 px-2 text-[10px] uppercase tracking-wide text-slate-500">
          <div className="col-span-3">Name</div><div>P50</div><div>P95</div><div>P99</div><div>Err</div><div>Throughput</div><div>SLO Tgt</div><div>SLO Act</div><div className="col-span-2">Top Dep</div><div className="text-right">$ / 1K</div>
        </div>
        {TRANSACTIONS.map(t => (
          <button key={t.id} onClick={() => onSelect(t.id)} className="grid w-full grid-cols-12 items-center gap-1 rounded-md border border-slate-200/70 bg-white/80 px-2 py-1.5 text-left hover:bg-slate-50">
            <div className="col-span-3 flex items-center gap-2"><StatusDot s={t.health} /> <span className="font-medium text-slate-800">{t.name}</span></div>
            <div className="tabular-nums">{t.p50}</div><div className="tabular-nums">{t.p95}</div><div className="tabular-nums">{t.p99}</div>
            <div className="tabular-nums">{t.err}</div><div className="tabular-nums">{t.tput}</div>
            <div className="tabular-nums">{t.sloT}</div><div className="tabular-nums">{t.sloA}</div>
            <div className="col-span-2 truncate text-slate-600">{t.topDep}</div>
            <div className="text-right tabular-nums">{t.costPerK}</div>
          </button>
        ))}
      </div>
    </Glass>
  );
}

/* ------------------------------------------------------------------ */
/* RCA PREVIEW                                                         */
/* ------------------------------------------------------------------ */
function RCAPreview({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[560px] sm:w-[640px] p-0 bg-white">
        <SheetHeader className="px-5 pt-5"><SheetTitle>Root Cause Analysis · INC-48217</SheetTitle></SheetHeader>
        <div className="overflow-y-auto px-5 py-4 h-[calc(100vh-72px)] space-y-3 text-[12.5px] text-slate-700">
          {[
            ["Executive Summary", "Payment Services degraded for ~50 minutes after Payment Service v2.14.7 introduced a connection pool change that saturated Aurora PostgreSQL. Customer checkout was impacted at ~1.8% failure rate before mitigation."],
            ["Incident Timeline", "09:30 deploy v2.14.7 · 09:42 latency anomaly · 09:48 Aurora CPU 85%+ · 09:55 SLO burn 8.4× · 10:02 emergency change submitted · 10:18 rollback executed · 10:24 P95 recovered."],
            ["Customer Impact", "~12,400 checkout attempts degraded · ~720 transactions failed and retried successfully · 0 financial loss confirmed."],
            ["Affected Services", "Payment Service, Order Service, Notification Service, Aurora PostgreSQL, SQS."],
            ["Root Cause", "Pool exhaustion: new client pool max=20 per task × 60 tasks exceeded Aurora max connections."],
            ["Contributing Factors", "Load test did not exercise auto-scaling steady state. Connection metrics not in deploy gate."],
            ["Detection", "Application Signals latency anomaly fired 2 minutes after rollout."],
            ["Response Actions", "Auto-scale +18 tasks · NOVA recommendation · Emergency CHG-9821 · Rollback v2.14.7 → v2.14.6."],
            ["Resolution", "Rollback restored P95 to 228 ms within 6 minutes."],
            ["Prevention Actions", "Add connection-pool metric to deploy gate · canary with synthetic checkout · raise Aurora max_connections · update load test."],
            ["Owners & Due Dates", "Payments SRE — pool metric (Jun 25). Platform DBA — Aurora capacity review (Jun 22). QE — checkout synthetic (Jun 30)."],
            ["SLO / Error Budget Impact", "Payment SLO 99.95 → 99.72 · 38% of monthly error budget consumed."],
            ["Cost Impact", "+$3,200 from extra ECS tasks and Aurora IO."],
            ["Security Review", "No security implications identified."],
            ["Automation Opportunities", "Auto-rollback on pool saturation pattern + canary fail."],
          ].map(([h,t]) => (
            <div key={h} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-[10.5px] uppercase tracking-wide font-semibold text-slate-500">{h}</div>
              <div className="mt-1">{t}</div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */
export default function EnterpriseCloudTwin() {
  const [view, setView] = useState<ViewId | "biz" | "tx">("twin");
  const [selectedId, setSelectedId] = useState<string | null>("svc-pay");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);
  const [rcaOpen, setRcaOpen] = useState(false);

  // simulated gentle real-time tick (kept invisible — visual flow already animated)
  const [, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(x => x+1), 3500); return () => clearInterval(i); }, []);

  const renderCanvasArea = () => {
    switch (view) {
      case "twin":        return <DigitalTwinCanvas selectedId={selectedId} onSelect={setSelectedId} hoveredId={hoveredId} setHoveredId={setHoveredId} />;
      case "biz":         return <BusinessServicesView onSelect={(id) => setSelectedId(id)} />;
      case "tx":          return <TransactionsView onSelect={(id) => setSelectedId(id)} />;
      case "apm":         return <APMView />;
      case "infra":       return <InfrastructureView />;
      case "security":    return <SecurityView />;
      case "finops":      return <FinOpsView />;
      case "reliability": return <ReliabilityView />;
      case "incident":    return <IncidentCommandView onGenerateRCA={() => setRcaOpen(true)} />;
      case "change":      return <ChangeImpactView />;
      case "simulation":  return <SimulationView />;
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-screen w-full bg-gradient-to-br from-[#F6F8FB] via-white to-[#EEF4FF]">
        {/* atmospheric overlay */}
        <div aria-hidden className="pointer-events-none fixed inset-0">
          <div className="absolute top-10 left-1/4 h-[420px] w-[420px] rounded-full bg-sky-200/20 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 h-[380px] w-[380px] rounded-full bg-violet-200/20 blur-3xl" />
        </div>

        <div className="relative z-10 px-4 pt-4 pb-4">
          {/* TOP COMMAND BAR */}
          <Glass className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[260px]">
                <Label>SRE Command Center</Label>
                <div className="text-[15px] font-semibold text-slate-900">Enterprise Cloud Application Digital Twin</div>
                <div className="text-[11px] text-slate-500">Health · Reliability · Security · Cost · Automated Operations</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Select defaultValue="prod"><SelectTrigger className="h-8 w-[130px] text-[11.5px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{["prod","staging","dev"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
                <Select defaultValue="us-east-1"><SelectTrigger className="h-8 w-[130px] text-[11.5px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{["us-east-1","us-west-2","eu-west-1"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
                <Select defaultValue="commerce"><SelectTrigger className="h-8 w-[230px] text-[11.5px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="commerce">Enterprise Commerce Platform</SelectItem></SelectContent>
                </Select>
                <Select value={view} onValueChange={(v) => setView(v as ViewId)}>
                  <SelectTrigger className="h-8 w-[170px] text-[11.5px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VIEWS.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Search services, transactions, traces, resources, incidents, changes, owners, tags, runbooks" className="h-8 w-[420px] pl-8 text-[11.5px]" />
              </div>
            </div>
            {/* Global KPI strip */}
            <div className="mt-3 grid grid-cols-5 lg:grid-cols-10 gap-1.5">
              {GLOBAL_KPIS.map(k => {
                const Icon = k.icon;
                return (
                  <button key={k.id} className="group rounded-lg border border-slate-200/70 bg-white/85 p-2 text-left transition hover:-translate-y-0.5 hover:shadow">
                    <div className="flex items-center justify-between">
                      <div className="text-[9.5px] uppercase tracking-wide text-slate-500 truncate">{k.label}</div>
                      <Icon className={cn("h-3.5 w-3.5", k.tone === "critical" ? "text-rose-500" : k.tone === "warning" ? "text-amber-500" : k.tone === "healthy" ? "text-emerald-500" : "text-sky-500")} />
                    </div>
                    <div className="mt-0.5 text-[14px] font-semibold tabular-nums text-slate-900">{k.value}</div>
                    <div className={cn("mt-1 h-0.5 rounded", HEALTH[k.tone].dot, "opacity-70")} />
                  </button>
                );
              })}
            </div>
          </Glass>

          {/* MAIN GRID */}
          <div className="mt-3 grid grid-cols-12 gap-3" style={{ minHeight: "560px" }}>
            {/* LEFT SUB-NAV */}
            <Glass className="col-span-2 p-2">
              <div className="px-2 pt-1 pb-2"><Label>Navigation</Label></div>
              <div className="space-y-0.5">
                {SUB_NAV.map(n => {
                  const Icon = n.icon;
                  const active = view === n.id;
                  return (
                    <button key={n.id} onClick={() => setView(n.id as any)}
                      className={cn("flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11.5px] transition",
                        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")}>
                      <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" /> {n.label}</span>
                      {n.badge && <span className={cn("rounded-full px-1.5 py-0 text-[10px]", active ? "bg-white/20" : "bg-rose-100 text-rose-700")}>{n.badge}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 px-2"><Label>Quick Actions</Label></div>
              <div className="mt-1 space-y-1 px-1">
                {[
                  { i: AlertOctagon, t: "Create Incident" },
                  { i: GitBranch,    t: "Create Change" },
                  { i: Sparkles,     t: "Run Simulation" },
                  { i: FileBarChart2,t: "Generate RCA", onClick: () => setRcaOpen(true) },
                  { i: Bot,          t: "Open NOVA", onClick: () => setNovaOpen(true) },
                ].map(({ i: I, t, onClick }) => (
                  <button key={t} onClick={onClick}
                    className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50">
                    <I className="h-3 w-3 text-slate-500" />{t}
                  </button>
                ))}
              </div>
            </Glass>

            {/* CANVAS / VIEW */}
            <div className="col-span-7 h-full">
              <div className="min-h-[620px]">{renderCanvasArea()}</div>
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-3 min-h-[620px]">
              <RightPanel selectedId={selectedId} onClear={() => setSelectedId(null)} onGenerateRCA={() => setRcaOpen(true)} />
            </div>
          </div>

          {/* TIMELINE */}
          <div className="mt-3">
            <Timeline />
          </div>
        </div>

        <NovaCopilot open={novaOpen} onOpenChange={setNovaOpen} />
        <RCAPreview open={rcaOpen} onOpenChange={setRcaOpen} />
      </div>
    </AppShell>
  );
}
