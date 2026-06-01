export type Persona = "executive" | "operations" | "security" | "sre";

export type Status = "healthy" | "warning" | "critical" | "info" | "maintenance";

const spark = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.round(50 + Math.sin(i / 2 + seed) * 18 + ((seed * 13 + i * 7) % 17)),
  }));

export type Kpi = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: { value: string; direction: "up" | "down"; positive: boolean; period: string };
  status: "healthy" | "warning" | "critical" | "info";
  series: { x: number; y: number }[];
  pulse?: boolean;
};

export const kpis: Kpi[] = [
  {
    id: "health",
    label: "Overall Health Score",
    value: "92",
    unit: "/100",
    delta: { value: "Healthy", direction: "up", positive: true, period: "" },
    status: "healthy",
    series: spark(1),
  },
  {
    id: "mttr",
    label: "MTTR (7 Days)",
    value: "28m",
    delta: { value: "35%", direction: "down", positive: true, period: "vs last 7 days" },
    status: "info",
    series: spark(2),
  },
  {
    id: "incidents",
    label: "Open Incidents",
    value: "12",
    delta: { value: "42%", direction: "down", positive: true, period: "vs last 7 days" },
    status: "critical",
    series: spark(3),
  },
  {
    id: "alerts",
    label: "Alerts (Last 15m)",
    value: "183",
    delta: { value: "15%", direction: "up", positive: false, period: "vs last 15m" },
    status: "warning",
    series: spark(4),
    pulse: true,
  },
  {
    id: "change",
    label: "Change Success Rate",
    value: "96",
    unit: "%",
    delta: { value: "8%", direction: "up", positive: true, period: "vs last 7 days" },
    status: "healthy",
    series: spark(5),
  },
  {
    id: "vendor",
    label: "Vendor SLA Score",
    value: "91",
    unit: "%",
    delta: { value: "5%", direction: "up", positive: true, period: "vs last 7 days" },
    status: "info",
    series: spark(6),
  },
];

export type Service = { id: string; name: string; status: Status };

export const services: Service[] = [
  { id: "online", name: "Online Banking", status: "healthy" },
  { id: "mobile", name: "Mobile App", status: "healthy" },
  { id: "portal", name: "Customer Portal", status: "warning" },
  { id: "card", name: "Card Services", status: "warning" },
  { id: "loan", name: "Loan Services", status: "healthy" },
  { id: "core", name: "Core Banking", status: "healthy" },
  { id: "identity", name: "Identity Services", status: "critical" },
  { id: "payments", name: "Payments", status: "healthy" },
];

export type Incident = {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  priority: "P1" | "P2" | "P3" | "P4";
  startedAgo: string;
};

export const incidents: Incident[] = [
  { id: "INC-5832", title: "Identity Service Degradation", severity: "Critical", priority: "P1", startedAgo: "12m ago" },
  { id: "INC-5829", title: "Online Banking Slowness", severity: "High", priority: "P2", startedAgo: "18m ago" },
  { id: "INC-5827", title: "Payment Gateway Errors", severity: "Medium", priority: "P2", startedAgo: "45m ago" },
  { id: "INC-5825", title: "Vendor API Timeout", severity: "Low", priority: "P3", startedAgo: "1h ago" },
  { id: "INC-5821", title: "Loan Application Errors", severity: "Medium", priority: "P3", startedAgo: "2h ago" },
];

export type Coworker = { id: string; name: string; health: number; running: boolean };

export const coworkers: Coworker[] = [
  { id: "orch", name: "EOC Command Orchestrator", health: 98, running: true },
  { id: "triage", name: "Incident Triage & Correlation", health: 96, running: true },
  { id: "change", name: "Change Risk Analyzer", health: 93, running: true },
  { id: "vendor", name: "Vendor Performance Monitor", health: 91, running: true },
  { id: "sla", name: "SLA Compliance Checker", health: 97, running: true },
];

export type Risk = {
  id: string;
  title: string;
  description: string;
  level: "Critical" | "High" | "Medium" | "Low";
  score: number;
};

export const risks: Risk[] = [
  { id: "r1", title: "Identity Service Instability", description: "High impact on authentication and access", level: "Critical", score: 90 },
  { id: "r2", title: "Third-party API Dependencies", description: "Multiple vendor services degraded", level: "High", score: 75 },
  { id: "r3", title: "Privileged Account Sprawl", description: "Excessive admin accounts without rotation", level: "Medium", score: 62 },
  { id: "r4", title: "Outdated Vulnerabilities", description: "Critical patches pending in production", level: "Low", score: 35 },
];

export const trendData = [
  { day: "May 8",  Critical: 19, High: 12, Medium: 4,  Low: 2 },
  { day: "May 9",  Critical: 28, High: 16, Medium: 9,  Low: 5 },
  { day: "May 10", Critical: 30, High: 22, Medium: 10, Low: 7 },
  { day: "May 11", Critical: 45, High: 24, Medium: 13, Low: 4 },
  { day: "May 12", Critical: 34, High: 20, Medium: 11, Low: 8 },
  { day: "May 13", Critical: 31, High: 22, Medium: 12, Low: 5 },
  { day: "May 14", Critical: 21, High: 18, Medium: 11, Low: 5 },
];

export type Vendor = { id: string; name: string; sla: number; openIssues: number; trend: { x: number; y: number }[] };

export const vendors: Vendor[] = [
  { id: "v1", name: "Cloud Hosting Co.", sla: 96, openIssues: 2, trend: spark(11, 14) },
  { id: "v2", name: "Network Provider", sla: 92, openIssues: 3, trend: spark(12, 14) },
  { id: "v3", name: "Security Partner", sla: 89, openIssues: 5, trend: spark(13, 14) },
  { id: "v4", name: "IT Service Partner", sla: 85, openIssues: 7, trend: spark(14, 14) },
  { id: "v5", name: "Software Vendor", sla: 78, openIssues: 9, trend: spark(15, 14) },
];