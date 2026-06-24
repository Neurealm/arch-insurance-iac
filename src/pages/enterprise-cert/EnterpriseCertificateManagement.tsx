import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, HelpCircle, Settings, RefreshCw, Download, ArrowUp, ArrowDown,
  LayoutDashboard, ShieldAlert, Globe, Activity, Briefcase, FileText,
  Zap, Bot, ServerCog, GitBranch, Plug, ShieldCheck, BookCheck, FileSearch,
  Scale, ScrollText, Package, Building2, UserCog, Cog, X, ChevronRight,
  CheckCircle2, AlertTriangle, Clock, UserX, FileWarning, ShieldX, PieChart as PieIcon,
  TrendingUp, Repeat, Rocket, RotateCcw, Ban, UserCheck, ListChecks, Briefcase as BriefcaseIcon,
  Server, Cloud, Building, AppWindow, Cable, Layers, DollarSign, Sparkles,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, LineChart, Line,
  XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend,
} from "recharts";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ---------------- Data ----------------
type KPI = {
  id: string; label: string; value: string; sub: string;
  delta: { dir: "up" | "down"; value: string; period: string; positive: boolean };
  icon: any; tone: "blue" | "green" | "amber" | "red" | "purple" | "slate";
  tip: { definition: string; why: string; owner: string; cadence: string };
  detail: PaneDetail;
};

type PaneDetail = {
  title: string;
  breadcrumb: string;
  overview: { label: string; value: string }[];
  bullets: string[];
  telemetry: { label: string; value: string; tone?: string }[];
  actions: string[];
  automation: { coverage: string; agent: string; opportunity: string };
  evidence: { ts: string; text: string }[];
  diagnostic: {
    rootCause: string; related: string[]; workflow: string[];
    recommended: string; opportunity: string; risk: "Critical" | "High" | "Medium" | "Low";
    owner: string; updated: string;
  };
};

const mk = (over: Partial<PaneDetail> & Pick<PaneDetail, "title" | "breadcrumb">): PaneDetail => ({
  overview: [], bullets: [], telemetry: [], actions: [],
  automation: { coverage: "—", agent: "—", opportunity: "—" },
  evidence: [],
  diagnostic: {
    rootCause: "—", related: [], workflow: [], recommended: "—",
    opportunity: "—", risk: "Medium", owner: "PKI Operations", updated: "Jun 23, 2025 10:21 AM EDT",
  },
  ...over,
});

const KPIS: KPI[] = [
  {
    id: "total", label: "Total Certificates", value: "42,000", sub: "Across 1,200 Applications",
    delta: { dir: "up", value: "5.4%", period: "vs last 30 days", positive: true },
    icon: FileText, tone: "blue",
    tip: { definition: "All TLS/PKI certificates known to RunOps inventory.", why: "Foundational visibility metric.", owner: "PKI Operations", cadence: "Every 5 min" },
    detail: mk({
      title: "Total Certificates", breadcrumb: "Operations Overview › KPI › Total Certificates",
      overview: [{ label: "Inventory", value: "42,000" }, { label: "Applications", value: "1,200" }, { label: "Discovery Sources", value: "14" }],
      bullets: ["Discovery feeds: CMDB, CT logs, Cloud scanners, ACME registries", "Daily reconciliation against IPAM and DNS", "Includes internal PKI and 3rd-party CAs"],
      telemetry: [{ label: "Discovery freshness", value: "4m", tone: "green" }, { label: "Source health", value: "14/14 healthy", tone: "green" }],
      actions: ["Trigger full inventory scan", "Export inventory snapshot", "Compare to last week"],
      automation: { coverage: "82%", agent: "Inventory Sync Agent", opportunity: "Auto-merge duplicate CNs" },
      evidence: [{ ts: "10:24", text: "Sync completed across 14 sources" }, { ts: "09:00", text: "Daily reconciliation passed" }],
    }),
  },
  {
    id: "managed", label: "Managed Certificates", value: "34,800", sub: "82% of total",
    delta: { dir: "up", value: "5.4%", period: "vs last 30 days", positive: true },
    icon: ShieldCheck, tone: "green",
    tip: { definition: "Certificates with assigned owner, lifecycle policy, and renewal plan.", why: "Drives renewal automation eligibility.", owner: "Certificate Governance", cadence: "Hourly" },
    detail: mk({
      title: "Managed Certificates", breadcrumb: "Operations Overview › KPI › Managed",
      overview: [{ label: "Managed", value: "34,800" }, { label: "Coverage", value: "82%" }, { label: "Policies Applied", value: "27" }],
      bullets: ["All managed certs have owners and SLAs", "Eligible for autonomous renewal", "Bound to CMDB business services"],
      telemetry: [{ label: "Policy attach rate", value: "98.4%", tone: "green" }, { label: "Renewal automation", value: "76%" }],
      actions: ["Promote unmanaged → managed", "Review policy exceptions"],
      automation: { coverage: "76%", agent: "Renewal Planner", opportunity: "Lift coverage to 90% with ACME enrollment" },
      evidence: [{ ts: "10:18", text: "412 certs promoted to managed in last 24h" }],
    }),
  },
  {
    id: "unmanaged", label: "Unmanaged Certificates", value: "7,200", sub: "18% of total",
    delta: { dir: "up", value: "8.7%", period: "vs last 30 days", positive: false },
    icon: ShieldAlert, tone: "red",
    tip: { definition: "Discovered certs with no owner, policy, or renewal plan.", why: "High risk of outage and audit findings.", owner: "PKI Operations", cadence: "Hourly" },
    detail: mk({
      title: "Unmanaged Certificates", breadcrumb: "Operations Overview › KPI › Unmanaged",
      overview: [{ label: "Unmanaged", value: "7,200" }, { label: "Net new (30d)", value: "+612" }],
      bullets: ["Discovered via CT logs and cloud scanners", "Pending owner assignment", "Excluded from renewal automation"],
      telemetry: [{ label: "Aging > 30d", value: "1,420", tone: "amber" }, { label: "On critical apps", value: "186", tone: "red" }],
      actions: ["Run ownership discovery", "Bulk-assign by subnet", "Open remediation ticket"],
      automation: { coverage: "0%", agent: "Ownership Discovery Agent", opportunity: "Auto-claim via CMDB heuristics" },
      evidence: [{ ts: "10:10", text: "612 new unmanaged certs discovered" }],
    }),
  },
  {
    id: "exp30", label: "Expiring in 30 Days", value: "1,150", sub: "",
    delta: { dir: "up", value: "12.3%", period: "vs last 30 days", positive: false },
    icon: Clock, tone: "amber",
    tip: { definition: "Certs expiring within 30 days.", why: "Renewal pipeline pressure.", owner: "Renewal Ops", cadence: "Real-time" },
    detail: mk({
      title: "Expiring in 30 Days", breadcrumb: "Operations Overview › Lifecycle › 30d",
      overview: [{ label: "Expiring", value: "1,150" }, { label: "Auto-renew eligible", value: "871" }, { label: "Manual queue", value: "279" }],
      bullets: ["Forecast queue 7/14/30 days", "Auto-renew pipeline healthy", "Manual queue assigned to 12 owners"],
      telemetry: [{ label: "Predicted on-time renewal", value: "99.1%", tone: "green" }],
      actions: ["Open renewal queue", "Notify owners of manual queue"],
      automation: { coverage: "76%", agent: "Renewal Planner", opportunity: "Lift to 90% with ACME on F5 fleet" },
      evidence: [{ ts: "10:00", text: "Daily renewal forecast generated" }],
    }),
  },
  {
    id: "exp7", label: "Expiring in 7 Days", value: "287", sub: "",
    delta: { dir: "up", value: "18.6%", period: "vs last 7 days", positive: false },
    icon: Clock, tone: "red",
    tip: { definition: "Urgent expiring certs within 7 days.", why: "Outage prevention window.", owner: "Renewal Ops + SRE", cadence: "Real-time" },
    detail: mk({
      title: "Expiring in 7 Days — Urgent Queue", breadcrumb: "Operations Overview › Lifecycle › 7d urgent",
      overview: [{ label: "Urgent", value: "287" }, { label: "Critical services impacted", value: "23" }, { label: "Blocked", value: "11" }],
      bullets: ["api.payments.company.com — expires in 2d", "vpn-gateway.company.com — expires in 4d", "11 blocked by CA approval gates", "Escalation path: SRE on-call → PKI Lead → CISO"],
      telemetry: [{ label: "Blast radius", value: "23 critical services", tone: "red" }, { label: "ETA to clear", value: "6h" }],
      actions: ["Execute mass renewal playbook", "Escalate blocked CA approvals", "Open war-room"],
      automation: { coverage: "82%", agent: "Urgent Renewal Agent", opportunity: "Pre-emptive renewal at T-14d" },
      evidence: [{ ts: "10:20", text: "Renewed api.gateway.company.com" }, { ts: "09:54", text: "Escalation opened for 4 blocked certs" }],
      diagnostic: {
        rootCause: "Late notice from owners + 11 CA approval blockers", related: ["Payments API", "VPN Gateway", "B2B Portal"],
        workflow: ["Detect", "Validate owner", "Enroll new cert", "Stage", "Deploy", "Verify"],
        recommended: "Run Urgent Renewal Agent across 287-cert queue with SRE auto-approve",
        opportunity: "Cut manual approval steps via pre-approved policy on T1 services",
        risk: "Critical", owner: "SRE + PKI On-call", updated: "Jun 23, 2025 10:23 AM EDT",
      },
    }),
  },
  {
    id: "unknown", label: "Unknown Owners", value: "420", sub: "",
    delta: { dir: "down", value: "3.2%", period: "vs last 30 days", positive: true },
    icon: UserX, tone: "slate",
    tip: { definition: "Certificates with no resolvable business owner.", why: "Blocks renewal and audit response.", owner: "CMDB Stewards", cadence: "Daily" },
    detail: mk({
      title: "Unknown Owners", breadcrumb: "Operations Overview › Governance › Unknown Owners",
      overview: [{ label: "Unknown", value: "420" }, { label: "Stale CMDB links", value: "190" }, { label: "Auto-discoverable", value: "260" }],
      bullets: ["CMDB lookup gaps on 190 assets", "Stale business service mappings on 88 services", "Recommend AD group inheritance for shared assets"],
      telemetry: [{ label: "Discovery confidence", value: "78%", tone: "amber" }],
      actions: ["Run ownership discovery workflow", "Sync with HRIS", "Notify suggested owners"],
      automation: { coverage: "55%", agent: "Ownership Discovery Agent", opportunity: "Resolve 260 with CMDB + AD heuristics" },
      evidence: [{ ts: "08:00", text: "Daily ownership reconciliation completed" }],
    }),
  },
  {
    id: "violations", label: "Policy Violations", value: "153", sub: "",
    delta: { dir: "up", value: "9.1%", period: "vs last 30 days", positive: false },
    icon: FileWarning, tone: "red",
    tip: { definition: "Certs that violate enterprise crypto/lifecycle policy.", why: "Non-compliance and audit exposure.", owner: "Policy Engine", cadence: "Continuous" },
    detail: mk({
      title: "Policy Violations", breadcrumb: "Operations Overview › Compliance › Violations",
      overview: [{ label: "Open violations", value: "153" }, { label: "Categories", value: "6" }],
      bullets: ["Weak algorithm (SHA-1): 41", "Validity > 398d: 38", "Wildcard scope drift: 22", "Missing CT log: 17", "Untrusted CA: 19", "Key length < 2048: 16"],
      telemetry: [{ label: "Top control failed", value: "PCI-DSS 4.2.1", tone: "red" }],
      actions: ["Open remediation campaign", "Auto-quarantine non-compliant", "Generate evidence pack"],
      automation: { coverage: "60%", agent: "Compliance Remediation Agent", opportunity: "Auto-replace SHA-1 across 41 certs" },
      evidence: [{ ts: "10:05", text: "12 violations auto-remediated overnight" }],
    }),
  },
  {
    id: "findings", label: "Active Security Findings", value: "24", sub: "",
    delta: { dir: "up", value: "14.3%", period: "vs last 30 days", positive: false },
    icon: ShieldX, tone: "amber",
    tip: { definition: "Open cyber findings tied to certificate posture.", why: "Direct cyber risk exposure.", owner: "Cyber Defense", cadence: "Real-time" },
    detail: mk({
      title: "Active Security Findings", breadcrumb: "Operations Overview › Security › Findings",
      overview: [{ label: "Open", value: "24" }, { label: "Critical", value: "3" }],
      bullets: ["Weak algorithm exposure on edge gateways", "Expired internal CA chain — 2 services", "Mis-issued wildcard on staging"],
      telemetry: [{ label: "Median age", value: "3.2d" }],
      actions: ["Open findings queue", "Trigger SOC playbook"],
      automation: { coverage: "70%", agent: "Cyber Cert Triage Agent", opportunity: "Auto-rotate suspected leaked keys" },
      evidence: [{ ts: "09:40", text: "Finding F-2031 escalated to SOC" }],
    }),
  },
  {
    id: "automation", label: "Automation Coverage", value: "82%", sub: "",
    delta: { dir: "up", value: "4.5%", period: "vs last 30 days", positive: true },
    icon: PieIcon, tone: "green",
    tip: { definition: "Share of certs lifecycle-managed via automation.", why: "Reduces toil and outage risk.", owner: "Platform Engineering", cadence: "Hourly" },
    detail: mk({
      title: "Automation Coverage", breadcrumb: "Operations Overview › Operations › Automation",
      overview: [{ label: "Automated", value: "82%" }, { label: "Manual", value: "18%" }, { label: "Blocked", value: "4%" }],
      bullets: ["Top blockers: legacy F5 fleet, hardcoded private keys, vendor-managed appliances", "Agent coverage active on 14 platforms", "Next candidates: SAP HANA, MQ, mainframe gateways"],
      telemetry: [{ label: "Auto-renewal success", value: "99.4%", tone: "green" }],
      actions: ["Open automation backlog", "Enroll new platform"],
      automation: { coverage: "82%", agent: "ACME Onboarding Agent", opportunity: "Lift to 92% by H2" },
      evidence: [{ ts: "07:00", text: "Onboarded 3 new clusters to ACME" }],
    }),
  },
  {
    id: "agentic", label: "Agentic Coverage", value: "61%", sub: "",
    delta: { dir: "up", value: "6.7%", period: "vs last 30 days", positive: true },
    icon: Bot, tone: "purple",
    tip: { definition: "Share of operations executed by autonomous Digital Coworkers.", why: "Quantifies agentic ROI.", owner: "RunOps Agentic Office", cadence: "Hourly" },
    detail: mk({
      title: "Agentic Coverage", breadcrumb: "Operations Overview › Agentic › Coverage",
      overview: [{ label: "Agentic", value: "61%" }, { label: "Active Agents", value: "12" }],
      bullets: ["Renewal Planner, Ownership Discovery, Blast Radius, Compliance Remediation, Cyber Triage", "Confidence > 92% on 9/12 agents"],
      telemetry: [{ label: "Agent decisions/day", value: "18,400" }],
      actions: ["Open Agent Control Plane", "Tune agent confidence thresholds"],
      automation: { coverage: "61%", agent: "Orchestrator", opportunity: "Promote 2 supervised agents to autonomous" },
      evidence: [{ ts: "10:00", text: "Renewal Planner closed 412 tasks autonomously" }],
    }),
  },
  {
    id: "renewal", label: "Renewal Success Rate", value: "99.1%", sub: "",
    delta: { dir: "up", value: "0.6%", period: "vs last 30 days", positive: true },
    icon: CheckCircle2, tone: "green",
    tip: { definition: "Renewals completed on time without outage.", why: "Primary reliability signal.", owner: "Renewal Ops", cadence: "Daily" },
    detail: mk({
      title: "Renewal Success Rate", breadcrumb: "Operations Overview › Lifecycle › Renewals",
      overview: [{ label: "Success", value: "99.1%" }, { label: "Failed", value: "0.9%" }, { label: "Trend", value: "▲ 0.6%" }],
      bullets: ["Failure modes: CA timeout, staging mismatch, owner unreachable", "Failed renewals auto-rollback within 4 minutes"],
      telemetry: [{ label: "Mean renewal time", value: "12m" }],
      actions: ["Open failure RCA", "Drill into per-CA performance"],
      automation: { coverage: "82%", agent: "Renewal Planner", opportunity: "Add pre-flight CA health check" },
      evidence: [{ ts: "06:00", text: "Nightly renewals: 412/415 succeeded" }],
    }),
  },
  {
    id: "incidents", label: "Annual Incidents", value: "18", sub: "",
    delta: { dir: "down", value: "28.0%", period: "vs last year", positive: true },
    icon: AlertTriangle, tone: "amber",
    tip: { definition: "Cert-related production incidents YTD.", why: "Operational reliability outcome.", owner: "SRE", cadence: "Per incident" },
    detail: mk({
      title: "Annual Incidents", breadcrumb: "Operations Overview › Reliability › Incidents",
      overview: [{ label: "YTD", value: "18" }, { label: "vs LY", value: "▼ 28%" }],
      bullets: ["Top causes: missed renewal (6), CA outage (4), chain misconfig (3)", "MTTR improved from 47m → 22m"],
      telemetry: [{ label: "Avg blast radius", value: "1.4 services" }],
      actions: ["Open incident archive", "Run prevention review"],
      automation: { coverage: "70%", agent: "Blast Radius Agent", opportunity: "Predictive cert outage detection" },
      evidence: [{ ts: "Jun 19", text: "INC-9821 closed in 14m" }],
    }),
  },
];

const TONE = {
  blue:   { bg: "bg-blue-50",   fg: "text-blue-600",   ring: "ring-blue-100" },
  green:  { bg: "bg-emerald-50",fg: "text-emerald-600",ring: "ring-emerald-100" },
  amber:  { bg: "bg-amber-50",  fg: "text-amber-600",  ring: "ring-amber-100" },
  red:    { bg: "bg-red-50",    fg: "text-red-600",    ring: "ring-red-100" },
  purple: { bg: "bg-violet-50", fg: "text-violet-600", ring: "ring-violet-100" },
  slate:  { bg: "bg-slate-100", fg: "text-slate-600",  ring: "ring-slate-200" },
};

// Charts data
const riskProfile = [
  { name: "Critical", value: 380, color: "#ef4444" },
  { name: "High",     value: 2700, color: "#f97316" },
  { name: "Medium",   value: 12400, color: "#f59e0b" },
  { name: "Low",      value: 26520, color: "#22c55e" },
];
const certsByType = [
  { name: "TLS/SSL", value: 29450, color: "#2563eb" },
  { name: "Internal PKI", value: 5400, color: "#0ea5e9" },
  { name: "Client Auth", value: 2850, color: "#8b5cf6" },
  { name: "Code Signing", value: 1950, color: "#a855f7" },
  { name: "Email", value: 1600, color: "#f59e0b" },
  { name: "Document Signing", value: 750, color: "#ef4444" },
];
const riskByService = [
  { name: "Critical", value: 42, color: "#ef4444" },
  { name: "High", value: 118, color: "#f97316" },
  { name: "Medium", value: 190, color: "#f59e0b" },
  { name: "Low", value: 150, color: "#22c55e" },
];
const issuers = [
  { name: "DigiCert", value: 18900, pct: "45.0%" },
  { name: "Microsoft CA", value: 8100, pct: "19.3%" },
  { name: "GlobalSign", value: 6200, pct: "14.8%" },
  { name: "Entrust", value: 4500, pct: "10.7%" },
  { name: "Internal CA", value: 2300, pct: "5.5%" },
  { name: "Other", value: 2000, pct: "4.7%" },
];
const overTime = Array.from({ length: 16 }, (_, i) => ({
  d: ["May 24","May 28","May 31","Jun 3","Jun 7","Jun 10","Jun 14","Jun 17","Jun 21"][i % 9] + (i > 8 ? "" : ""),
  total: 42000 + Math.round(Math.sin(i / 2) * 600),
  managed: 34800 + Math.round(Math.cos(i / 2) * 500),
  exp30: 1150 + Math.round(Math.sin(i / 3) * 80),
  exp7: 287 + Math.round(Math.cos(i / 2) * 30),
}));
const compliance = [
  { name: "PCI-DSS", value: 98.7 },
  { name: "SOC 2", value: 99.2 },
  { name: "NIST", value: 96.1 },
  { name: "ISO 27001", value: 98.3 },
];
const regions = [
  { id: "na", label: "NA", coords: [-100, 40] as [number, number], count: "17.5K", tone: "blue" },
  { id: "eu", label: "EU", coords: [15, 50] as [number, number], count: "9.4K", tone: "blue" },
  { id: "ap", label: "AP", coords: [115, 30] as [number, number], count: "8.7K", tone: "blue" },
  { id: "sa", label: "SA", coords: [-60, -15] as [number, number], count: "3.0K", tone: "blue" },
  { id: "me", label: "ME", coords: [50, 25] as [number, number], count: "3.4K", tone: "blue" },
];
const feed = [
  { id: "f1", icon: CheckCircle2, tone: "green", title: "Renewal completed", sub: "api.payments.company.com", time: "2m ago" },
  { id: "f2", icon: FileSearch,   tone: "blue",  title: "New certificate discovered", sub: "10.10.35.42", time: "5m ago" },
  { id: "f3", icon: FileWarning,  tone: "amber", title: "Policy violation detected", sub: "SHA-1 certificate on 2 servers", time: "8m ago" },
  { id: "f4", icon: Clock,        tone: "red",   title: "Certificate expiring in 7 days", sub: "vpn-gateway.company.com", time: "10m ago" },
  { id: "f5", icon: UserCheck,    tone: "blue",  title: "Ownership identified", sub: "db.internal.company.com", time: "15m ago" },
  { id: "f6", icon: AlertTriangle,tone: "red",   title: "Deployment failed", sub: "portal.company.com", time: "17m ago" },
  { id: "f7", icon: ShieldCheck,  tone: "green", title: "Security finding resolved", sub: "Weak algorithm on 3 certs", time: "20m ago" },
  { id: "f8", icon: RefreshCw,    tone: "blue",  title: "CA sync completed", sub: "DigiCert External CA", time: "24m ago" },
];
const workload = [
  { label: "Renewals", value: "18,000", icon: Repeat },
  { label: "Deployments", value: "14,000", icon: Rocket },
  { label: "Rotations", value: "2,800", icon: RotateCcw },
  { label: "Revocations", value: "350", icon: Ban },
  { label: "Ownership Changes", value: "900", icon: UserCog },
  { label: "Audit Requests", value: "500", icon: ListChecks },
];
const coworker = [
  { label: "Active Coworkers", value: "12", icon: Bot },
  { label: "Tasks Processed", value: "249,000", icon: ListChecks },
  { label: "Human Hours Saved", value: "38,000", icon: Clock },
  { label: "Escalation Rate", value: "4.7%", icon: TrendingUp },
];
const value = [
  { label: "Labor Savings", value: "$1.8M" },
  { label: "Outage Avoidance", value: "$2.4M" },
  { label: "Audit Savings", value: "$350K" },
  { label: "Total Value", value: "$4.55M" },
];
const footer = [
  { label: "Applications", value: "1,200", icon: AppWindow },
  { label: "Business Services", value: "500", icon: BriefcaseIcon },
  { label: "APIs / Interfaces", value: "650", icon: Cable },
  { label: "Servers", value: "8,000", icon: Server },
  { label: "Endpoints", value: "20,000", icon: Layers },
  { label: "Cloud Accounts", value: "35", icon: Cloud },
  { label: "Data Centers", value: "6", icon: Building },
  { label: "System Health", value: "Healthy", icon: CheckCircle2, tone: "green" as const },
  { label: "RunOps Coverage", value: "24x7x365" },
  { label: "Data Accuracy", value: "99.8%" },
];

// Generic detail builder for non-KPI items
const genericDetail = (title: string, breadcrumb: string, lines: string[]): PaneDetail =>
  mk({
    title, breadcrumb,
    overview: lines.slice(0, 3).map((l, i) => ({ label: `Fact ${i + 1}`, value: l })),
    bullets: lines,
    telemetry: [{ label: "Freshness", value: "live", tone: "green" }],
    actions: ["Open detail report", "Export to PDF"],
    automation: { coverage: "—", agent: "—", opportunity: "—" },
    evidence: [{ ts: "now", text: `Captured ${title} snapshot` }],
  });

// ---------------- Components ----------------
const navSections = [
  { label: "Command Center", items: [
    { id: "ops", label: "Operations Overview", icon: LayoutDashboard, active: true },
    { id: "risk", label: "Risk & Exposure", icon: ShieldAlert, to: "/enterprise-certificate-management/risk-exposure" },
    { id: "map", label: "Global Map", icon: Globe },
    { id: "life", label: "Lifecycle", icon: Activity, to: "/enterprise-certificate-management/lifecycle" },
    { id: "biz", label: "Business Services", icon: Briefcase },
    { id: "rep", label: "Reports", icon: FileText },
  ]},
  { label: "Operations", items: [
    { id: "auto", label: "Agentic Execution Center", icon: Sparkles, to: "/enterprise-certificate-management/agentic-execution" },
    { id: "co", label: "Digital Coworkers", icon: Bot, to: "/enterprise-certificate-management/digital-coworkers" },
    { id: "oc", label: "Operations Center", icon: ServerCog, to: "/enterprise-certificate-management/operations-center" },
    { id: "cm", label: "Change Manager", icon: GitBranch },
    { id: "int", label: "Integrations", icon: Plug },
  ]},
  { label: "Security & Compliance", items: [
    { id: "sec", label: "Security Posture", icon: ShieldCheck },
    { id: "com", label: "Compliance Center", icon: BookCheck },
    { id: "audit", label: "Audit & Evidence", icon: FileSearch },
    { id: "pol", label: "Policy Engine", icon: Scale },
    { id: "ct", label: "CT Logs Monitor", icon: ScrollText },
  ]},
  { label: "Administration", items: [
    { id: "inv", label: "Inventory", icon: Package },
    { id: "iss", label: "Issuers & CAs", icon: Building2 },
    { id: "acc", label: "Account Management", icon: UserCog },
    { id: "sys", label: "System Settings", icon: Cog },
  ]},
];

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }}
      className="w-[240px] shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 flex flex-col"
    >
      <div className="px-5 pt-5 pb-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center text-white text-xs font-bold">n</div>
        <div className="leading-tight">
          <div className="text-[11px] text-slate-500 font-medium">neurealm</div>
          <div className="text-base font-bold text-slate-900 -mt-0.5">RunOps</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {navSections.map((s) => (
          <div key={s.label} className="mt-4">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className="mt-1 space-y-0.5">
              {s.items.map((it: any) => {
                const inner = (<><it.icon className="h-4 w-4" /><span>{it.label}</span></>);
                const cls = cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  it.active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                );
                return it.to
                  ? <Link key={it.id} to={it.to} className={cls}>{inner}</Link>
                  : <button key={it.id} className={cls}>{inner}</button>;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="text-[11px] uppercase tracking-wider opacity-80 font-bold">Digital Coworker Status</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">12</span>
          <span className="text-xs opacity-80">Active</span>
        </div>
        <div className="text-xs opacity-90">249,000 Tasks YTD</div>
        <button className="mt-3 text-xs font-semibold underline-offset-2 hover:underline">View All Coworkers →</button>
      </div>
    </motion.aside>
  );
}

function Header() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-0 z-20 bg-white border-b border-slate-200"
    >
      <div className="px-6 py-3 flex items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Enterprise Certificate Operations Command Center</h1>
          <p className="text-xs text-slate-500">Real-time operational view of your certificate ecosystem</p>
        </div>
        <div className="flex-1 max-w-[420px] mx-auto">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9 pr-12 h-9 bg-slate-50 border-slate-200" placeholder="Search certificates, apps, services, domains…" />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">⌘K</kbd>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="relative h-9 w-9 grid place-items-center text-slate-500 hover:bg-slate-100 rounded-lg">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center">8</span>
          </button>
          <button className="h-9 w-9 grid place-items-center text-slate-500 hover:bg-slate-100 rounded-lg"><HelpCircle className="h-4 w-4" /></button>
          <button className="h-9 w-9 grid place-items-center text-slate-500 hover:bg-slate-100 rounded-lg"><Settings className="h-4 w-4" /></button>
          <div className="ml-2 flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right leading-tight">
              <div className="text-[13px] font-semibold text-slate-900">Sarah Mitchell</div>
              <div className="text-[10px] text-slate-500">VP Infrastructure</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-bold grid place-items-center">SM</div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-2.5 flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>Data as of: Jun 23, 2025 10:24 AM EDT</span>
        <Button variant="outline" size="sm" className="h-8 ml-2"><RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh</Button>
        <Button variant="outline" size="sm" className="h-8"><Download className="h-3.5 w-3.5 mr-1" /> Export</Button>
      </div>
    </motion.header>
  );
}

function KpiCard({ kpi, idx, onOpen }: { kpi: KPI; idx: number; onOpen: (d: PaneDetail, deep?: boolean) => void }) {
  const t = TONE[kpi.tone];
  const Arrow = kpi.delta.dir === "up" ? ArrowUp : ArrowDown;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.2 + idx * 0.04 }}
            onClick={() => onOpen(kpi.detail, false)}
            onDoubleClick={() => onOpen(kpi.detail, true)}
            className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-slate-500 truncate">{kpi.label}</div>
                <div className="mt-1 text-[26px] font-bold leading-none tracking-tight text-slate-900">{kpi.value}</div>
                {kpi.sub && <div className="mt-1 text-[11px] text-slate-500">{kpi.sub}</div>}
              </div>
              <span className={cn("h-9 w-9 rounded-lg grid place-items-center shrink-0", t.bg, t.fg)}>
                <kpi.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px]">
              <span className={cn("inline-flex items-center font-semibold", kpi.delta.positive ? "text-emerald-600" : "text-red-600")}>
                <Arrow className="h-3 w-3" />{kpi.delta.value}
              </span>
              <span className="text-slate-400">{kpi.delta.period}</span>
            </div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-xs">
          <div className="font-semibold mb-1">{kpi.label}</div>
          <div className="text-slate-300"><span className="font-medium text-white">Definition:</span> {kpi.tip.definition}</div>
          <div className="text-slate-300 mt-1"><span className="font-medium text-white">Why it matters:</span> {kpi.tip.why}</div>
          <div className="text-slate-300 mt-1"><span className="font-medium text-white">Owner:</span> {kpi.tip.owner}</div>
          <div className="text-slate-300"><span className="font-medium text-white">Refresh:</span> {kpi.tip.cadence}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Card({ title, action, children, className, delay = 0.6 }: any) {
  return (
    <motion.section
      initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay }}
      className={cn("bg-white rounded-xl border border-slate-200 p-4", className)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

export default function EnterpriseCertificateManagement() {
  const [pane, setPane] = useState<PaneDetail | null>(null);
  const [deep, setDeep] = useState(false);
  const open = (d: PaneDetail, isDeep = false) => { setPane(d); setDeep(isDeep); };

  const totalRisk = useMemo(() => riskProfile.reduce((s, r) => s + r.value, 0), []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-6 space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {KPIS.map((k, i) => <KpiCard key={k.id} kpi={k} idx={i} onOpen={open} />)}
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-4">
            <Card title="Certificate Risk Profile" delay={0.7} className="col-span-12 lg:col-span-3"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Certificate Risk Profile", "Operations Overview › Risk Profile", riskProfile.map(r => `${r.name}: ${r.value.toLocaleString()}`)))}>View full report →</button>}
            >
              <div className="h-[200px] relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={riskProfile} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2} startAngle={90} endAngle={-270} animationDuration={900}>
                      {riskProfile.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">42,000</div>
                    <div className="text-[10px] text-slate-500">Total Certificates</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                {riskProfile.map((r) => (
                  <button key={r.name} onClick={() => open(genericDetail(`${r.name} Risk Tier`, `Risk Profile › ${r.name}`, [`${r.value.toLocaleString()} certificates classified ${r.name}`, `${((r.value / totalRisk) * 100).toFixed(1)}% of inventory`, "Mapped to business service criticality"]))}
                    className="w-full flex items-center justify-between text-[12px] hover:bg-slate-50 rounded px-1 py-0.5"
                  >
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />{r.name}</span>
                    <span className="text-slate-500 tabular-nums">{r.value.toLocaleString()} ({((r.value / totalRisk) * 100).toFixed(1)}%)</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Certificates Over Time" delay={0.75} className="col-span-12 lg:col-span-5"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Certificates Over Time", "Operations Overview › Trends", ["Total stable around 42K", "Managed certs growing steadily", "Expiring queues seasonal"]))}>View trends →</button>}
            >
              <div className="h-[230px]">
                <ResponsiveContainer>
                  <LineChart data={overTime} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RTooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} animationDuration={1100} name="Total" />
                    <Line type="monotone" dataKey="managed" stroke="#22c55e" strokeWidth={2} dot={false} animationDuration={1100} name="Managed" />
                    <Line type="monotone" dataKey="exp30" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={1100} name="Expiring < 30 Days" />
                    <Line type="monotone" dataKey="exp7" stroke="#ef4444" strokeWidth={2} dot={false} animationDuration={1100} name="Expiring < 7 Days" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Global Footprint" delay={0.8} className="col-span-12 lg:col-span-4 flex flex-col"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Global Footprint", "Operations Overview › Global", regions.map(r => `${r.label}: ${r.count} certificates`)))}>View global map →</button>}
            >
              <div className="flex-1 min-h-[340px] -mx-4 -mb-4 rounded-b-xl overflow-hidden bg-slate-50/60">
                <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 175 }} style={{ width: "100%", height: "100%" }}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((g) => <Geography key={g.rsmKey} geography={g} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={0.4} style={{ default: { outline: "none" }, hover: { fill: "#dbeafe", outline: "none", cursor: "pointer" }, pressed: { outline: "none" } }} />)
                    }
                  </Geographies>
                  {regions.map((r, i) => (
                    <Marker key={r.id} coordinates={r.coords} onClick={() => open(genericDetail(`${r.label} Region`, `Global Footprint › ${r.label}`, [`${r.count} certificates`, "Regional CAs and ACME endpoints active", "Geo-specific compliance: GDPR / HIPAA / APRA depending on region"]))}>
                      <motion.circle initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.6, delay: 1 + i * 0.1 }} r={22} fill="#3b82f6" fillOpacity={0.9} stroke="#1d4ed8" strokeWidth={1.2} style={{ cursor: "pointer" }} />
                      <text textAnchor="middle" y={4} style={{ fontSize: 11, fontWeight: 800, fill: "white", pointerEvents: "none" }}>{r.count}</text>
                      <text textAnchor="middle" y={38} style={{ fontSize: 10, fontWeight: 600, fill: "#1e293b", pointerEvents: "none" }}>{r.label}</text>
                    </Marker>
                  ))}
                </ComposableMap>
              </div>
            </Card>

          </div>

          {/* Activity feed row separated below to mimic image with feed as 4-wide */}
          <div className="grid grid-cols-12 gap-4">
            <Card title="Certificates by Type" delay={0.85} className="col-span-12 lg:col-span-3"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Certificates by Type", "Inventory › By Type", certsByType.map(c => `${c.name}: ${c.value.toLocaleString()}`)))}>View details →</button>}
            >
              <div className="h-[180px] relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={certsByType} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} startAngle={90} endAngle={-270} animationDuration={900}>
                      {certsByType.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">42,000</div>
                    <div className="text-[10px] text-slate-500">Total</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {certsByType.map((r) => (
                  <button key={r.name} onClick={() => open(genericDetail(r.name, `Inventory › ${r.name}`, [`${r.value.toLocaleString()} certificates`, "Active lifecycle policy in place", "Owners assigned via CMDB"]))}
                    className="w-full flex items-center justify-between text-[11px] hover:bg-slate-50 rounded px-1 py-0.5"
                  >
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />{r.name}</span>
                    <span className="text-slate-500 tabular-nums">{r.value.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Top Issuers" delay={0.9} className="col-span-12 lg:col-span-3"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Top Issuers", "Inventory › Issuers", issuers.map(i => `${i.name}: ${i.value.toLocaleString()} (${i.pct})`)))}>View all →</button>}
            >
              <div className="space-y-2.5 mt-1">
                {issuers.map((i, idx) => {
                  const max = Math.max(...issuers.map(x => x.value));
                  const width = (i.value / max) * 100;
                  return (
                    <button key={i.name} onClick={() => open(genericDetail(`${i.name}`, `Issuers › ${i.name}`, [`${i.value.toLocaleString()} certs issued (${i.pct})`, "Concentration risk evaluated", "Contract renewal status: Active"]))} className="w-full text-left">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-slate-700">{i.name}</span>
                        <span className="text-slate-500 tabular-nums">{i.value.toLocaleString()} ({i.pct})</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.8, delay: 1 + idx * 0.05 }} className="h-2 rounded bg-blue-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Risk Exposure by Business Service" delay={0.95} className="col-span-12 lg:col-span-3"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Risk Exposure by Business Service", "Risk › By Service", riskByService.map(r => `${r.name}: ${r.value}`)))}>View services →</button>}
            >
              <div className="h-[180px] relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={riskByService} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} startAngle={90} endAngle={-270} animationDuration={900}>
                      {riskByService.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">500</div>
                    <div className="text-[10px] text-slate-500">Business Services</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {riskByService.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: r.color }} />{r.name}</span>
                    <span className="text-slate-500 tabular-nums">{r.value} ({((r.value / 500) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Compliance Posture" delay={1.0} className="col-span-12 lg:col-span-3"
              action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Compliance Posture", "Compliance › Posture", compliance.map(c => `${c.name}: ${c.value}%`)))}>View compliance center →</button>}
            >
              <div className="space-y-3.5 mt-2">
                {compliance.map((c, i) => (
                  <button key={c.name} onClick={() => open(genericDetail(c.name, `Compliance › ${c.name}`, [`Score: ${c.value}%`, "Controls evaluated continuously", "Evidence pack auto-generated"]))} className="w-full text-left">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="text-slate-700 font-semibold tabular-nums">{c.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 0.9, delay: 1 + i * 0.06 }} className="h-2 rounded bg-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Activity feed full row */}
          <Card title="Operations Activity Feed" delay={1.05}
            action={<button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Operations Activity Feed", "Activity › All", feed.map(f => `${f.title} — ${f.sub} (${f.time})`)))}>View all →</button>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              {feed.map((f, i) => {
                const t = TONE[f.tone as keyof typeof TONE] || TONE.blue;
                return (
                  <motion.button key={f.id}
                    initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35, delay: 1.1 + i * 0.05 }}
                    onClick={() => open(genericDetail(f.title, `Activity Feed › ${f.title}`, [`Target: ${f.sub}`, `When: ${f.time}`, "Owning service auto-resolved via CMDB", "Audit evidence attached"]))}
                    className="flex items-start gap-2 p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 text-left"
                  >
                    <span className={cn("h-7 w-7 rounded-md grid place-items-center shrink-0", t.bg, t.fg)}>
                      <f.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-slate-800 truncate">{f.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{f.sub}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 shrink-0">{f.time}</div>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Strips */}
          <div className="grid grid-cols-12 gap-4">
            <Card title="Operational Workload" delay={1.15} className="col-span-12 lg:col-span-4"
              action={<span className="text-[11px] text-slate-400">(Annual)</span>}
            >
              <div className="grid grid-cols-3 gap-3 mt-1">
                {workload.map((w) => (
                  <button key={w.label} onClick={() => open(genericDetail(w.label, `Operational Workload › ${w.label}`, [`Annual volume: ${w.value}`, "Trended monthly", "Linked to renewal automation"]))}
                    className="flex flex-col items-center p-2 rounded hover:bg-slate-50">
                    <w.icon className="h-4 w-4 text-slate-500 mb-1" />
                    <div className="text-sm font-bold text-slate-900">{w.value}</div>
                    <div className="text-[10px] text-slate-500 text-center">{w.label}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center"><button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Workload Report", "Operational Workload", workload.map(w => `${w.label}: ${w.value}`)))}>View workload report →</button></div>
            </Card>

            <Card title="Digital Coworker Impact" delay={1.2} className="col-span-12 lg:col-span-4"
              action={<span className="text-[11px] text-slate-400">(YTD)</span>}
            >
              <div className="grid grid-cols-4 gap-2 mt-1">
                {coworker.map((w) => (
                  <button key={w.label} onClick={() => open(genericDetail(w.label, `Digital Coworker › ${w.label}`, [`YTD: ${w.value}`, "Calculated from agent task ledger", "Compared against human baseline"]))}
                    className="flex flex-col items-center p-2 rounded hover:bg-slate-50">
                    <w.icon className="h-4 w-4 text-violet-500 mb-1" />
                    <div className="text-sm font-bold text-slate-900">{w.value}</div>
                    <div className="text-[10px] text-slate-500 text-center">{w.label}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center"><button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("All Coworkers", "Digital Coworkers › Roster", coworker.map(c => `${c.label}: ${c.value}`)))}>View all coworkers →</button></div>
            </Card>

            <Card title="RunOps Value Delivered" delay={1.25} className="col-span-12 lg:col-span-4"
              action={<span className="text-[11px] text-slate-400">(Annual)</span>}
            >
              <div className="grid grid-cols-4 gap-2 mt-1">
                {value.map((v) => (
                  <button key={v.label} onClick={() => open(genericDetail(v.label, `Value Delivered › ${v.label}`, [`Value: ${v.value}`, "Model: hours × loaded labor cost + avoided outage × per-minute revenue", "Annualized from YTD run-rate"]))}
                    className="flex flex-col items-center p-3 rounded bg-blue-50/40 hover:bg-blue-50">
                    <DollarSign className="h-4 w-4 text-blue-600 mb-1" />
                    <div className="text-base font-bold text-slate-900">{v.value}</div>
                    <div className="text-[10px] text-slate-500 text-center">{v.label}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center"><button className="text-[11px] text-blue-600 font-semibold" onClick={() => open(genericDetail("Value Dashboard", "RunOps Value", value.map(v => `${v.label}: ${v.value}`)))}>View value dashboard →</button></div>
            </Card>
          </div>

          {/* Footer summary */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.35 }}
            className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3"
          >
            {footer.map((f) => (
              <button key={f.label} onClick={() => open(genericDetail(f.label, `Footprint › ${f.label}`, [`Count: ${f.value}`, "Real-time inventory signal", "Used in capacity planning"]))}
                className="flex items-center gap-2 p-1 rounded hover:bg-slate-50 text-left">
                {f.icon && <span className={cn("h-7 w-7 rounded-md grid place-items-center bg-slate-100 text-slate-500", f.tone === "green" && "bg-emerald-50 text-emerald-600")}><f.icon className="h-3.5 w-3.5" /></span>}
                <div className="min-w-0">
                  <div className={cn("text-sm font-bold text-slate-900 truncate", f.tone === "green" && "text-emerald-600")}>{f.value}</div>
                  <div className="text-[10px] text-slate-500 truncate">{f.label}</div>
                </div>
              </button>
            ))}
          </motion.div>
        </main>
      </div>

      {/* Details pane */}
      <Sheet open={!!pane} onOpenChange={(o) => !o && setPane(null)}>
        <SheetContent side="right" className="w-[28%] min-w-[420px] sm:max-w-none p-0 overflow-y-auto">
          <AnimatePresence>
            {pane && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    {pane.breadcrumb.split(" › ").map((b, i, arr) => (
                      <span key={i} className="flex items-center gap-1">
                        <span>{b}</span>{i < arr.length - 1 && <ChevronRight className="h-3 w-3" />}
                      </span>
                    ))}
                  </div>
                  <SheetTitle className="flex items-center justify-between">
                    <span>{pane.title}{deep && <span className="ml-2 text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded">Deep Diagnostic</span>}</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="px-5 pt-3 flex-1">
                  <Tabs defaultValue={deep ? "telemetry" : "overview"}>
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="automation">Automation</TabsTrigger>
                      <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4 space-y-4">
                      {deep ? (
                        <div className="space-y-3 text-sm">
                          <div className="rounded-lg border border-slate-200 p-3">
                            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Root cause</div>
                            <div className="mt-1">{pane.diagnostic.rootCause}</div>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Related systems</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {pane.diagnostic.related.map((r) => <span key={r} className="text-xs px-2 py-0.5 rounded bg-slate-100">{r}</span>)}
                            </div>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-3">
                            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Operational workflow</div>
                            <ol className="mt-1 text-sm list-decimal pl-5 space-y-1">{pane.diagnostic.workflow.map((s) => <li key={s}>{s}</li>)}</ol>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <div className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold">Recommended action</div>
                            <div className="mt-1 text-blue-900">{pane.diagnostic.recommended}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg border border-slate-200 p-2"><div className="text-slate-500">Risk</div><div className="font-semibold">{pane.diagnostic.risk}</div></div>
                            <div className="rounded-lg border border-slate-200 p-2"><div className="text-slate-500">Owner</div><div className="font-semibold">{pane.diagnostic.owner}</div></div>
                            <div className="rounded-lg border border-slate-200 p-2 col-span-2"><div className="text-slate-500">Automation opportunity</div><div className="font-semibold">{pane.diagnostic.opportunity}</div></div>
                            <div className="rounded-lg border border-slate-200 p-2 col-span-2"><div className="text-slate-500">Last updated</div><div className="font-semibold">{pane.diagnostic.updated}</div></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            {pane.overview.map((o) => (
                              <div key={o.label} className="rounded-lg border border-slate-200 p-3">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{o.label}</div>
                                <div className="text-base font-bold text-slate-900 mt-0.5">{o.value}</div>
                              </div>
                            ))}
                          </div>
                          <ul className="space-y-1.5 text-sm text-slate-700">
                            {pane.bullets.map((b) => <li key={b} className="flex gap-2"><span className="text-blue-500">•</span>{b}</li>)}
                          </ul>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="telemetry" className="mt-4 space-y-2">
                      {pane.telemetry.map((t) => (
                        <div key={t.label} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                          <span className="text-slate-600">{t.label}</span>
                          <span className={cn("font-semibold", t.tone === "green" && "text-emerald-600", t.tone === "red" && "text-red-600", t.tone === "amber" && "text-amber-600")}>{t.value}</span>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="actions" className="mt-4 space-y-2">
                      {pane.actions.map((a) => (
                        <button key={a} className="w-full flex items-center justify-between rounded-lg border border-slate-200 hover:border-blue-300 p-3 text-sm">
                          <span>{a}</span><ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                      ))}
                    </TabsContent>

                    <TabsContent value="automation" className="mt-4 space-y-3">
                      <div className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Coverage</div>
                        <div className="font-bold text-slate-900">{pane.automation.coverage}</div>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold">Active Agent</div>
                        <div className="font-bold text-slate-900">{pane.automation.agent}</div>
                      </div>
                      <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm">
                        <div className="text-[10px] uppercase text-violet-700 font-semibold">Next Opportunity</div>
                        <div className="text-violet-900">{pane.automation.opportunity}</div>
                      </div>
                    </TabsContent>

                    <TabsContent value="evidence" className="mt-4 space-y-2">
                      {pane.evidence.map((e, i) => (
                        <div key={i} className="flex gap-3 text-sm border-l-2 border-blue-200 pl-3 py-1">
                          <span className="text-xs text-slate-400 tabular-nums w-14 shrink-0">{e.ts}</span>
                          <span className="text-slate-700">{e.text}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}
