import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { ShieldCheck, ArrowLeftRight, BarChart3, AlertTriangle, Clock, ShieldAlert, CheckCircle2, Info, Settings, Repeat } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: ShieldCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "EDI & Clearinghouse Resilience Coworker",
  mission: "Ensure reliable EDI transactions and clearinghouse operations to minimize disruption, maintain data integrity, and protect claims processing continuity.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "EDI Uptime (MTD)", value: "99.96%", deltaText: "0.32 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ArrowLeftRight, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Transactions Processed (MTD)", value: "78.6M", deltaText: "11.8% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BarChart3, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Transaction Success Rate (MTD)", value: "99.35%", deltaText: "0.28 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Transaction Failure Rate (MTD)", value: "0.65%", deltaText: "0.28 pts vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Clock, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Avg Resolution Time (MTD)", value: "22 min", deltaText: "6 min vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: ShieldAlert, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Disruption Events (MTD)", value: "3", deltaText: "40% vs last month", deltaTone: "pos", deltaDir: "down" },
  ],
  tabs: ["Overview","EDI Monitoring","Transaction Health","Clearinghouse Performance","Resilience & Failover","Alerts & Incidents","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT / Claims Infrastructure"],
      ["Function","EDI & Clearinghouse Resilience"],
      ["Primary Stakeholders","Claims IT, EDI Teams, Business Continuity"],
      ["Systems Integrated","Clearinghouses, EDI Gateway, VPN, SFTP, Monitoring Tools, Alerting Platforms"],
      ["Data Sources","EDI 837, 835, 270, 271, 278 Transactions, Acknowledgments, Logs, Partner Status"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I monitor EDI and clearinghouse connectivity, transaction flows, and acknowledgments. I detect disruptions early, automate failover, and ensure rapid recovery to maintain claims operations.",
    responsibilities: [
      "Monitor EDI connectivity and clearinghouse availability",
      "Validate transaction acknowledgments and error handling",
      "Detect and alert on failures, delays, and outages",
      "Automate failover to backup clearinghouse or channel",
      "Ensure end-to-end transaction integrity and data accuracy",
      "Drive incident resolution and post-event analysis",
      "Support business continuity and disaster recovery readiness",
    ],
  },
  center: {
    title: "Transactions by Type (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "78.6M",
    segments: [
      { label: "837 (Claims)", value: "48.2M (61.3%)", pct: 61.3, color: "#3b82f6" },
      { label: "835 (Remittance)", value: "18.6M (23.7%)", pct: 23.7, color: "#22c55e" },
      { label: "270/271 (Eligibility)", value: "7.8M (9.9%)", pct: 9.9, color: "#a855f7" },
      { label: "278 (Referrals)", value: "2.1M (2.7%)", pct: 2.7, color: "#f59e0b" },
      { label: "Other", value: "1.9M (2.4%)", pct: 2.4, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Delayed Claims", value: "25,841" },
      { label: "$ Impact at Risk", value: "$4.82M" },
      { label: "Providers Affected", value: "3,126" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "EDI Uptime", value: "99.96%", delta: "0.32 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: BarChart3, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Transaction Success Rate", value: "99.35%", delta: "0.28 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Transaction Failure Rate", value: "0.65%", delta: "0.28 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Clock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Avg Resolution Time", value: "22 min", delta: "6 min", deltaTone: "pos", deltaDir: "down" },
      { icon: ShieldAlert, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Disruption Events", value: "3", delta: "40%", deltaTone: "pos", deltaDir: "down" },
      { icon: Repeat, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Failover Success Rate", value: "100%", delta: "0 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Partners by Volume (MTD)",
    columns: ["Partner / Trading Partner","Transactions","% of Total","Success Rate","Trend"],
    rows: [
      { dot: "red", cells: ["Health System A","16.8M","21.4%","99.40%","↑"] },
      { dot: "orange", cells: ["Health System B","12.3M","15.6%","99.31%","↑"] },
      { dot: "yellow", cells: ["Provider Network C","9.7M","12.3%","99.21%","↑"] },
      { dot: "green", cells: ["Pharmacy Network D","7.9M","10.0%","99.58%","↑"] },
      { dot: "blue", cells: ["Lab Partner E","6.1M","7.8%","98.92%","↓"] },
      { cells: ["Others","25.8M","32.9%","99.34%","↑"] },
      { cells: ["Total","78.6M","100%","99.35%","↑"] },
    ],
  },
  activity: {
    title: "Recent Alerts & Activity",
    items: [
      { time: "7:45 AM", tone: "green", icon: CheckCircle2, title: "Primary clearinghouse connectivity restored", subtitle: "No impact to transactions" },
      { time: "7:28 AM", tone: "blue", icon: Info, title: "Automatic failover to backup clearinghouse", subtitle: "Primary site latency detected" },
      { time: "6:58 AM", tone: "orange", icon: AlertTriangle, title: "High error rate on 837 transactions", subtitle: "Provider Network C – Resolved" },
      { time: "6:35 AM", tone: "green", icon: CheckCircle2, title: "EDI 835 transactions delayed", subtitle: "Processing normalized" },
      { time: "6:10 AM", tone: "purple", icon: Settings, title: "Daily EDI health summary generated", subtitle: "Available in Reports" },
    ],
  },
  health: {
    title: "Systems & Monitoring",
    rows: [
      { name: "EDI Gateway", freshness: "8:05 AM" },
      { name: "Clearinghouse CH-A", freshness: "8:05 AM" },
      { name: "Clearinghouse CH-B", freshness: "8:05 AM" },
      { name: "SFTP / File Transfer", freshness: "8:05 AM" },
      { name: "VPN Connectivity", freshness: "8:05 AM" },
      { name: "Monitoring & Alerts", freshness: "8:05 AM" },
    ],
  },
};

export default function EdiClearinghouse() { return <CoworkerDashboard config={config} />; }