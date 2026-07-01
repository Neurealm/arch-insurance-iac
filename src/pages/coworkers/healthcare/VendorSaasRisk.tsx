import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { ShieldCheck, AlertTriangle, Cloud, Activity, Briefcase, CheckCircle2, Clock, Bell, Info, Settings, TrendingUp } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Briefcase, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Vendor & SaaS Dependency Risk Coworker",
  mission: "Ensure visibility into vendor and SaaS dependencies to proactively manage risk, improve resilience, and coordinate response during outages.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Overall Vendor Risk Score (MTD)", value: "78 / 100", deltaText: "5 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "High Risk Vendors (MTD)", value: "12", deltaText: "14% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Cloud, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "SaaS Services Monitored", value: "126", deltaText: "18 vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Activity, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Vendor Incidents (MTD)", value: "28", deltaText: "22% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Briefcase, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Business Services at Risk", value: "8", deltaText: "20% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Outages Avoided (MTD)", value: "5", deltaText: "25% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Vendor Inventory","SaaS Health","Dependency Map","Risk & Resilience","Incidents","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT Operations"],
      ["Function","Vendor & SaaS Dependency Risk"],
      ["Primary Stakeholders","Vendor Mgmt, IT Ops, Security"],
      ["Systems Integrated","Vendor Inventories, CMDB, Monitoring Tools, ITSM, Security Platforms"],
      ["Data Sources","Vendor Portals, Status Pages, Monitoring, Contracts, Performance Reports"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "High", tone: "orange" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I maintain visibility into vendor and SaaS services that Health Plan relies on. I assess risk, monitor operational health, and coordinate response to reduce impact and improve resilience.",
    responsibilities: [
      "Maintain accurate vendor and SaaS inventory",
      "Assess vendor criticality and operational risk",
      "Monitor vendor/SaaS health and performance",
      "Identify dependencies across business services",
      "Detect and communicate vendor issues proactively",
      "Coordinate with vendor management and IT Ops",
      "Drive mitigation and resilience planning",
    ],
  },
  center: {
    title: "Vendor Risk Distribution (MTD)",
    type: "donut", totalLabel: "Total Vendors", totalValue: "88",
    segments: [
      { label: "High Risk", value: "12 (13.6%)", pct: 13.6, color: "#ef4444" },
      { label: "Medium Risk", value: "28 (31.8%)", pct: 31.8, color: "#f59e0b" },
      { label: "Low Risk", value: "40 (45.5%)", pct: 45.5, color: "#22c55e" },
      { label: "Informational", value: "8 (9.1%)", pct: 9.1, color: "#3b82f6" },
    ],
    bottomTitle: "Risk Summary (MTD)",
    bottomCells: [
      { label: "High Risk Vendors", value: "12" },
      { label: "Vendors with Incidents", value: "28" },
      { label: "% Critical Services", value: "18%" },
      { label: "Average Risk Score", value: "78 / 100" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Overall Vendor Risk Score", value: "78 / 100", delta: "5 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "High Risk Vendors", value: "12", delta: "14%", deltaTone: "pos", deltaDir: "down" },
      { icon: Activity, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Vendor Incidents", value: "28", delta: "22%", deltaTone: "pos", deltaDir: "down" },
      { icon: Briefcase, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Business Services at Risk", value: "8", delta: "20%", deltaTone: "pos", deltaDir: "down" },
      { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Outages Avoided", value: "5", delta: "25%", deltaTone: "pos", deltaDir: "up" },
      { icon: Clock, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Mean Time to Detect (MTTD)", value: "18 min", delta: "15 min", deltaTone: "pos", deltaDir: "down" },
    ],
  },
  bottomLeft: {
    title: "Top Vendors by Risk Score",
    columns: ["Vendor","Critical Services","Risk Score","Trend"],
    rows: [
      { dot: "red", cells: ["Claims Processing Vendor","Claims, Appeals","92 / 100","↑"] },
      { dot: "red", cells: ["Provider Network Vendor","Provider Data","88 / 100","↑"] },
      { dot: "orange", cells: ["Pharmacy Benefits Vendor","Pharmacy Claims","83 / 100","—"] },
      { dot: "orange", cells: ["UM & Review Vendor","Prior Auth, UM","78 / 100","↓"] },
      { dot: "yellow", cells: ["Cloud Infrastructure Vendor","Hosting, Storage","75 / 100","↓"] },
    ],
  },
  activity: {
    title: "Recent Vendor Incidents",
    items: [
      { time: "7:45 AM", tone: "orange", icon: AlertTriangle, title: "Claims Processing Vendor – Elevated claim latency", subtitle: "Impact: High" },
      { time: "7:30 AM", tone: "purple", icon: Info, title: "Provider Data Vendor – API slowdown", subtitle: "Impact: Medium" },
      { time: "7:15 AM", tone: "orange", icon: AlertTriangle, title: "Pharmacy Benefits Vendor – Intermittent portal errors", subtitle: "Impact: Medium" },
      { time: "6:50 AM", tone: "blue", icon: Info, title: "Email Service Vendor – Partial outage", subtitle: "Impact: Low" },
      { time: "6:20 AM", tone: "blue", icon: Info, title: "Document Management – Slow document retrieval", subtitle: "Impact: Low" },
    ],
  },
  health: {
    title: "Business Services at Risk",
    rows: [
      { name: "Member Claims (Claims Processing Vendor)", freshness: "High" },
      { name: "Provider Directory (Provider Data Vendor)", freshness: "Medium" },
      { name: "Pharmacy Claims (Pharmacy Benefits Vendor)", freshness: "Medium" },
      { name: "Prior Authorization (UM & Review Vendor)", freshness: "Medium" },
      { name: "Member Communications (Email Service Vendor)", freshness: "Low" },
    ],
  },
};

export default function VendorSaasRisk() { return <CoworkerDashboard config={config} />; }