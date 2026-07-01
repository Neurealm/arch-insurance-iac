import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { Monitor, ArrowUp, LineChart, AlertTriangle, Clock, Headphones, ThumbsUp, CheckCircle2, Info, Settings, ShieldCheck, TrendingUp } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Monitor, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Provider Portal & Availity Reliability Coworker",
  mission: "Ensure reliable, secure, and seamless provider portal and Availity experiences by monitoring transactions, detecting issues early, and driving rapid resolution.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: ArrowUp, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Portal Uptime (MTD)", value: "99.92%", deltaText: "0.28 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: LineChart, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Successful Transactions (MTD)", value: "5.42M", deltaText: "12.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Transaction Failure Rate (MTD)", value: "0.68%", deltaText: "0.21 pts vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Clock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Avg Response Time (MTD)", value: "1.42 sec", deltaText: "0.31 sec vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Headphones, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Provider Tickets Reduced (MTD)", value: "2,318", deltaText: "14.8% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: ThumbsUp, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Provider Satisfaction (MTD)", value: "4.6 / 5", deltaText: "0.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Portal Health","Availity Monitoring","Transaction Insights","Provider Experience","Alerts & Incidents","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT / Provider Technology"],
      ["Function","Provider Portal & Availity Reliability"],
      ["Primary Stakeholders","Provider IT, Service Desk, Provider Ops"],
      ["Systems Integrated","Availity, SSO, Provider Portal, Telemetry Monitoring, Log Analytics"],
      ["Data Sources","Portal Logs, Availity APIs, SSO Logs, User Sessions, Error Reports"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I monitor the health and performance of the provider portal and Availity transactions. I detect, triage, and escalate issues impacting providers to minimize disruption and improve their experience.",
    responsibilities: [
      "Monitor portal and Availity availability and performance",
      "Detect transaction failures and error patterns",
      "Identify root cause and route to the right team",
      "Track issue resolution and verify service recovery",
      "Communicate impacts and updates to stakeholders",
      "Analyze trends to prevent recurring issues",
      "Optimize provider experience and reduce friction",
    ],
  },
  center: {
    title: "Transactions by Type (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "5.42M",
    segments: [
      { label: "Eligibility", value: "1.68M (31.0%)", pct: 31.0, color: "#3b82f6" },
      { label: "Claims", value: "1.52M (28.0%)", pct: 28.0, color: "#22c55e" },
      { label: "Auth / Referrals", value: "1.12M (20.7%)", pct: 20.7, color: "#a855f7" },
      { label: "Claims Status", value: "0.71M (13.1%)", pct: 13.1, color: "#f59e0b" },
      { label: "Other", value: "0.39M (7.2%)", pct: 7.2, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Failed Transactions", value: "36,724" },
      { label: "Providers Affected", value: "4,382" },
      { label: "Tickets Prevented", value: "2,318" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ArrowUp, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Portal Uptime", value: "99.92%", delta: "0.28 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Transaction Failure Rate", value: "0.68%", delta: "0.21 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Clock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Avg Response Time", value: "1.42 sec", delta: "0.31 sec", deltaTone: "pos", deltaDir: "down" },
      { icon: Headphones, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Provider Tickets Reduced", value: "2,318", delta: "14.8%", deltaTone: "pos", deltaDir: "down" },
      { icon: ThumbsUp, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Provider Satisfaction", value: "4.6 / 5", delta: "0.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "First Contact Resolution", value: "78.3%", delta: "6.2 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Transactions by Failure Rate (MTD)",
    columns: ["Transaction","Volume","Failure Rate","Trend"],
    rows: [
      { dot: "red", cells: ["Auth / Referrals","1.12M","1.24%","↑"] },
      { dot: "orange", cells: ["Claims Status","0.71M","0.92%","↑"] },
      { dot: "yellow", cells: ["Claims Submission","1.52M","0.61%","↓"] },
      { dot: "green", cells: ["Eligibility","1.68M","0.42%","↓"] },
      { dot: "blue", cells: ["Provider Profile Update","0.12M","0.38%","↓"] },
      { dot: "purple", cells: ["Document Upload","0.27M","0.28%","—"] },
      { cells: ["Total","5.42M","0.68%","↓"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "7:55 AM", tone: "orange", icon: AlertTriangle, title: "High error rate for Auth / Referrals resolved", subtitle: "Root cause: Availity endpoint timeout" },
      { time: "7:40 AM", tone: "blue", icon: Info, title: "Deploy: Provider Portal v2.18.3 completed", subtitle: "No incidents detected" },
      { time: "7:25 AM", tone: "purple", icon: Settings, title: "SSO latency spike detected", subtitle: "Elevated to Identity Team – Resolved" },
      { time: "7:10 AM", tone: "green", icon: CheckCircle2, title: "Claims Status transaction errors resolved", subtitle: "Fix deployed – Monitoring normal" },
      { time: "6:55 AM", tone: "green", icon: TrendingUp, title: "Weekly provider experience report generated", subtitle: "Available in Reports" },
    ],
  },
  health: {
    title: "Systems & Integrations Health",
    rows: [
      { name: "Provider Portal", freshness: "99.93%" },
      { name: "Availity Platform", freshness: "99.91%" },
      { name: "SSO / Identity", freshness: "99.94%" },
      { name: "API Gateway", freshness: "99.92%" },
      { name: "Telemetry Pipeline", freshness: "100%" },
      { name: "Log Analytics", freshness: "100%" },
    ],
  },
};

export default function ProviderPortalAvaility() { return <CoworkerDashboard config={config} />; }