import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { FileWarning, Users, ClipboardList, CheckCircle2, Clock, DollarSign, ShieldCheck, AlertTriangle, Info, Mail, Settings, Scale, Repeat } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: FileWarning, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Claims Exception & Appeals Coworker",
  mission: "Improve accuracy and efficiency in exception handling and appeals to reduce rework, ensure compliance, and accelerate resolution.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Exceptions Identified (MTD)", value: "24,317", deltaText: "9.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardList, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Exceptions Resolved (MTD)", value: "18,726", deltaText: "11.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Auto-Resolved Rate (MTD)", value: "37.8%", deltaText: "7.2 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Clock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Avg. Resolution Time (MTD)", value: "2.6 days", deltaText: "15.4% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "$ Impact Avoided (MTD)", value: "$3.42M", deltaText: "12.1% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ShieldCheck, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Appeal Success Rate (MTD)", value: "62.7%", deltaText: "6.8 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Exception Pipeline","Appeals Management","Payment Integrity","Performance","Root Cause Insights","Compliance & Audit","Provider Insights","Audit & Evidence","Configuration"],
  overview: {
    rows: [
      ["Domain","Claims Operations"],
      ["Function","Claims Exception & Appeals Management"],
      ["Primary Stakeholders","Claims Ops, Appeals, Compliance, Provider Relations"],
      ["Systems Integrated","Claims System, Policy Rules Engine, Payment Integrity Tools, Provider Portal"],
      ["Data Sources","Claims Data, EOBs, Policy Rules, Provider Contracts, Audit Guidelines"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I identify, analyze, and resolve claim exceptions, prepare appeals with supporting documentation, and ensure accurate application of policies to reduce rework and improve payment accuracy.",
    responsibilities: [
      "Detect and prioritize claim exceptions",
      "Apply policy rules and determine resolution path",
      "Auto-resolve or route to appropriate owner",
      "Prepare appeals and supporting documentation",
      "Track appeal status and manage deadlines",
      "Identify root causes and prevent recurring issues",
      "Ensure compliance with policies and regulations",
    ],
  },
  center: {
    title: "Exception Category Breakdown (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "24,317",
    segments: [
      { label: "Coding / Billing", value: "8,421 (34.6%)", pct: 34.6, color: "#3b82f6" },
      { label: "Eligibility", value: "5,287 (21.7%)", pct: 21.7, color: "#22c55e" },
      { label: "Authorization", value: "3,986 (16.4%)", pct: 16.4, color: "#a855f7" },
      { label: "Medical Policy", value: "3,125 (12.8%)", pct: 12.8, color: "#f59e0b" },
      { label: "Other / Misc", value: "3,498 (14.4%)", pct: 14.4, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Overpayments Prevented", value: "$2.14M" },
      { label: "Underpayments Recovered", value: "$1.28M" },
      { label: "Net Financial Impact", value: "$3.42M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Auto-Resolved Rate", value: "37.8%", delta: "7.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ClipboardList, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Exceptions Resolved", value: "18,726", delta: "11.6%", deltaTone: "pos", deltaDir: "up" },
      { icon: Clock, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Avg. Resolution Time", value: "2.6 days", delta: "15.4%", deltaTone: "pos", deltaDir: "down" },
      { icon: Scale, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Appeal Success Rate", value: "62.7%", delta: "6.8 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Repeat, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Rework Rate", value: "8.1%", delta: "2.3 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "$ Impact Avoided", value: "$3.42M", delta: "12.1%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Exception Pipeline (MTD)",
    columns: ["Status","Count","% of Total","Trend"],
    rows: [
      { dot: "red", cells: ["New Exceptions","24,317","100.0%","↑"] },
      { dot: "orange", cells: ["In Review","7,842","32.3%","↑"] },
      { dot: "yellow", cells: ["Auto-Resolved","9,182","37.8%","↑"] },
      { dot: "blue", cells: ["Pending Information","2,961","12.2%","—"] },
      { dot: "purple", cells: ["Escalated","1,247","5.1%","↑"] },
      { dot: "green", cells: ["Resolved","18,726","77.0%","↑"] },
      { cells: ["Total","24,317","100.0%","—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Exception auto-resolved for Claim #87654321", subtitle: "Duplicate claim – policy edit applied" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Appeal package generated for Claim #12345678", subtitle: "Medical necessity documentation attached" },
      { time: "8:46 AM", tone: "purple", icon: Mail, title: "Information request sent to provider", subtitle: "Missing diagnosis code – Claim #99887766" },
      { time: "8:40 AM", tone: "orange", icon: AlertTriangle, title: "Policy update applied", subtitle: "New authorization rule effective 5/27/2025" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "Appeal approved for Claim #55667788", subtitle: "Payment overturned – $8,452 recovered" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Claims System", freshness: "15 min ago" },
      { name: "Policy Rules Engine", freshness: "15 min ago" },
      { name: "Payment Integrity Tool", freshness: "30 min ago" },
      { name: "Provider Portal", freshness: "10 min ago" },
      { name: "Authorization System", freshness: "15 min ago" },
      { name: "EOB Repository", freshness: "1 hr ago" },
    ],
  },
};

export default function ClaimsExceptionAppeals() { return <CoworkerDashboard config={config} />; }