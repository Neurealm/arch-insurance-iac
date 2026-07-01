import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { ClipboardList, ShieldCheck, RefreshCw, Network, AlertTriangle, Clock, Users, CheckCircle2, Info, Settings, BarChart3 } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: ClipboardList, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Prior Authorization Configuration Governance Coworker",
  mission: "Ensure accurate, consistent, and well-governed prior authorization configurations across systems and vendors to reduce defects, improve routing accuracy, and enhance provider and member experience.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Authorization Accuracy (MTD)", value: "98.7%", deltaText: "1.6 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: RefreshCw, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Auth Requests Processed (MTD)", value: "1.28M", deltaText: "12.4% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Network, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Correct Routing Rate (MTD)", value: "97.9%", deltaText: "1.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Configuration Defects (MTD)", value: "142", deltaText: "28.6% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Clock, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Avg Time to Implement Change", value: "2.6 days", deltaText: "0.6 days vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Users, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Provider Impacted (MTD)", value: "1,842", deltaText: "15.3% vs last month", deltaTone: "pos", deltaDir: "down" },
  ],
  tabs: ["Overview","Configuration Health","Authorization Rules","Vendor Systems","Change Management","Alerts & Issues","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT / UM Systems"],
      ["Function","Prior Authorization Configuration Governance"],
      ["Primary Stakeholders","Release Management, UM IT, Provider Ops"],
      ["Systems Integrated","UM Systems, Provider Portals, Authorization Vendors"],
      ["Data Sources","UM Rules, Clinical Policies, System Configurations, Authorization Logs, Provider Feedback"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I monitor and govern prior authorization configurations across policies, systems, and vendors. I detect configuration drift, validate routing logic, and ensure accurate, timely updates to reduce defects and friction.",
    responsibilities: [
      "Monitor configuration changes and detect drift",
      "Validate policy, rules, and clinical criteria alignment",
      "Ensure accurate routing to the appropriate vendor",
      "Manage end-to-end change management and releases",
      "Perform regression testing and impact analysis",
      "Investigate and resolve configuration defects",
      "Drive continuous improvement and stakeholder communication",
    ],
  },
  center: {
    title: "Configuration Health (MTD)",
    type: "donut", totalLabel: "Items Monitored", totalValue: "1,842",
    segments: [
      { label: "In Sync", value: "1,524 (82.7%)", pct: 82.7, color: "#22c55e" },
      { label: "Minor Drift", value: "208 (11.3%)", pct: 11.3, color: "#3b82f6" },
      { label: "Major Drift", value: "78 (4.2%)", pct: 4.2, color: "#f59e0b" },
      { label: "Critical Drift", value: "32 (1.8%)", pct: 1.8, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Auth Requests Impacted", value: "18,642" },
      { label: "Providers Impacted", value: "1,842" },
      { label: "Members Impacted", value: "6,731" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Authorization Accuracy", value: "98.7%", delta: "1.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Network, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Correct Routing Rate", value: "97.9%", delta: "1.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Configuration Defects", value: "142", delta: "28.6%", deltaTone: "pos", deltaDir: "down" },
      { icon: Clock, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Avg Time to Implement Change", value: "2.6 days", delta: "0.6 days", deltaTone: "pos", deltaDir: "down" },
      { icon: Users, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Provider Impacted", value: "1,842", delta: "15.3%", deltaTone: "pos", deltaDir: "down" },
      { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Change Success Rate", value: "96.4%", delta: "1.9 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Authorization Categories (MTD)",
    columns: ["Category","Requests","% of Total","Defect Rate","Trend"],
    rows: [
      { dot: "red", cells: ["Imaging (Advanced)","412,345","32.1%","0.42%","↓"] },
      { dot: "orange", cells: ["Musculoskeletal","298,776","23.3%","0.38%","↓"] },
      { dot: "yellow", cells: ["Cardiology","189,654","14.8%","0.51%","↑"] },
      { dot: "green", cells: ["Oncology","146,221","11.4%","0.44%","↓"] },
      { dot: "blue", cells: ["Radiation Therapy","98,532","7.7%","0.37%","↓"] },
      { cells: ["Other","140,022","10.9%","0.45%","↓"] },
      { cells: ["Total","1,285,550","100%","0.43%","↓"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "7:55 AM", tone: "green", icon: CheckCircle2, title: "Rule update deployed: Imaging Clinical Guideline v2025.05", subtitle: "All systems in sync" },
      { time: "7:35 AM", tone: "blue", icon: Info, title: "Configuration drift detected: Cardiology echo criteria", subtitle: "Resolution in progress" },
      { time: "7:15 AM", tone: "orange", icon: AlertTriangle, title: "Routing issue detected: MSK requests to Vendor A", subtitle: "Auto-correct applied" },
      { time: "6:55 AM", tone: "purple", icon: Settings, title: "Change request approved: Oncology policy update", subtitle: "Scheduled for release" },
      { time: "6:35 AM", tone: "green", icon: BarChart3, title: "Daily configuration health report generated", subtitle: "Available in Reports" },
    ],
  },
  health: {
    title: "Vendor & System Health",
    rows: [
      { name: "UM System (Internal)", freshness: "99.94%" },
      { name: "Availity", freshness: "99.92%" },
      { name: "Optum", freshness: "99.90%" },
      { name: "Integra", freshness: "99.88%" },
      { name: "eviCore", freshness: "99.85%" },
    ],
  },
};

export default function PaConfigGovernance() { return <CoworkerDashboard config={config} />; }