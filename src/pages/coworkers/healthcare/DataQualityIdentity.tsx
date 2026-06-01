import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { Users, UserCheck, UsersRound, AlertTriangle, BarChart3, CheckCircle2, Info, Settings, ShieldCheck, FileSearch, Database, BadgeCheck } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Users, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Data Quality & Member Identity Coworker",
  mission: "Ensure accurate, consistent, and trusted member and provider data across all systems to enable better care, operations, and reporting.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: BadgeCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Overall Data Quality Score (MTD)", value: "96.3%", deltaText: "1.8 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: UserCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Unique Member Match Rate (MTD)", value: "98.1%", deltaText: "1.6 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: UsersRound, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Duplicate Member Rate (MTD)", value: "1.42%", deltaText: "0.32 pts vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Identity Exceptions (MTD)", value: "8,742", deltaText: "12.6% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Provider Match Rate (MTD)", value: "97.4%", deltaText: "1.4 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BarChart3, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Data Steward Actions (MTD)", value: "2,156", deltaText: "18.5% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Data Quality","Member Identity","Provider Identity","Data Sources","Data Governance","Alerts & Issues","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT / Data Governance"],
      ["Function","Data Quality & Member Identity"],
      ["Primary Stakeholders","Data Governance, Analytics, Quality"],
      ["Systems Integrated","MPI, HIE, Claims, Provider Attribution, Care Management, Enrollment"],
      ["Data Sources","Member Master, Claims, Provider Files, HIE, Enrollment, External Reference Data"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I monitor data quality and member/provider identity across systems. I detect duplicates, mismatches, and data gaps, then drive remediation to ensure trusted data for care, operations, and reporting.",
    responsibilities: [
      "Monitor and score data quality across critical domains",
      "Identify and resolve duplicate or mismatched identities",
      "Reconcile member and provider data across source systems",
      "Validate provider attribution and panel alignment",
      "Manage identity exceptions and steward workflows",
      "Partner with data stewards to remediate issues",
      "Ensure data integrity for regulatory and quality reporting",
    ],
  },
  center: {
    title: "Data Quality Score Trend (MTD)",
    type: "donut", totalLabel: "Score", totalValue: "96.3%",
    segments: [
      { label: "May 1", value: "93.1%", pct: 93.1, color: "#3b82f6" },
      { label: "May 8", value: "94.2%", pct: 94.2, color: "#6366f1" },
      { label: "May 15", value: "95.0%", pct: 95.0, color: "#8b5cf6" },
      { label: "May 22", value: "95.8%", pct: 95.8, color: "#a855f7" },
      { label: "May 27", value: "96.3%", pct: 96.3, color: "#22c55e" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Duplicate Members Resolved", value: "6,842" },
      { label: "Member Records Updated", value: "18,521" },
      { label: "Reporting Accuracy Impact", value: "+2.3%" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: BadgeCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Overall Data Quality Score", value: "96.3%", delta: "1.8 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: UserCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Unique Member Match Rate", value: "98.1%", delta: "1.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: UsersRound, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Duplicate Member Rate", value: "1.42%", delta: "0.32 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Identity Exceptions", value: "8,742", delta: "12.6%", deltaTone: "pos", deltaDir: "down" },
      { icon: ShieldCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Provider Match Rate", value: "97.4%", delta: "1.4 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: BarChart3, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Data Steward Actions", value: "2,156", delta: "18.5%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Data Quality Issues (MTD)",
    columns: ["Issue Type","Records","% of Total","Trend"],
    rows: [
      { dot: "red", cells: ["Duplicate Member Records","9,842","27.1%","↑"] },
      { dot: "orange", cells: ["Missing Demographics","7,126","19.6%","↑"] },
      { dot: "yellow", cells: ["Member Name Mismatch","6,784","18.7%","↑"] },
      { dot: "green", cells: ["Missing Date of Birth","5,348","14.7%","↓"] },
      { dot: "blue", cells: ["Invalid Address","4,215","11.6%","↓"] },
      { cells: ["Other","1,528","8.3%","—"] },
      { cells: ["Total","34,843","100%","—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "7:55 AM", tone: "green", icon: CheckCircle2, title: "Duplicate members merged", subtitle: "2,145 records resolved" },
      { time: "7:35 AM", tone: "blue", icon: Info, title: "HIE feed processed successfully", subtitle: "No identity errors detected" },
      { time: "7:20 AM", tone: "orange", icon: AlertTriangle, title: "Identity exception threshold exceeded", subtitle: "Exception ID-7832 assigned" },
      { time: "7:05 AM", tone: "purple", icon: FileSearch, title: "Provider attribution updated", subtitle: "Panel alignment improved" },
      { time: "6:50 AM", tone: "green", icon: Settings, title: "Daily data quality report generated", subtitle: "Available in Reports" },
    ],
  },
  health: {
    title: "Data Sources Health",
    rows: [
      { name: "Member Master (MPI)", freshness: "15 min" },
      { name: "HIE Feeds", freshness: "30 min" },
      { name: "Claims System", freshness: "60 min" },
      { name: "Provider Attribution", freshness: "30 min" },
      { name: "Enrollment System", freshness: "15 min" },
      { name: "External Reference Data", freshness: "Daily" },
    ],
  },
};

export default function DataQualityIdentity() { return <CoworkerDashboard config={config} />; }