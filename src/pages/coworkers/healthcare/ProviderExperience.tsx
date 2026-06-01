import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { Headphones, Users, ClipboardCheck, Clock, Smile, Phone, CheckCircle2, FileText, Info, AlertTriangle, Settings, ShieldCheck, MessageSquare, Repeat } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Headphones, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Provider Experience & Portal Assistant Coworker",
  mission: "Improve provider experience by simplifying interactions, resolving issues faster, and reducing friction across authorizations, claims, and portal navigation.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Provider Interactions (MTD)", value: "48,923", deltaText: "9.7% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Issues Resolved (MTD)", value: "21,857", deltaText: "11.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Avg. Resolution Time", value: "1.8 hrs", deltaText: "18.6% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Headphones, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Provider Satisfaction", value: "92.4%", deltaText: "6.2 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Phone, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Support Calls Deflected", value: "12,684", deltaText: "13.1% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ShieldCheck, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "First Contact Resolution", value: "76.8%", deltaText: "7.4 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Workload Execution","Provider Issues","Authorizations","Claims Support","Portal Assistance","Provider Insights","Satisfaction","Audit & Evidence","Configuration"],
  overview: {
    rows: [
      ["Domain","Provider Operations"],
      ["Function","Provider Experience & Portal Support"],
      ["Primary Stakeholders","Provider Relations, Provider Ops, Contact Center"],
      ["Systems Integrated","Availity, Provider Portal, Claims System, Authorization System, Provider Directory"],
      ["Data Sources","Authorizations, Claims, Provider Profile Data, Portal Analytics, Communication Logs"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I assist providers with authorizations, claims questions, portal navigation, and general inquiries. I resolve issues, guide users to the right information, and reduce the need for live agent support.",
    responsibilities: [
      "Answer provider questions about authorizations and claims",
      "Guide providers through portal navigation and tasks",
      "Check status and update providers proactively",
      "Resolve or route complex issues to the right team",
      "Provide instructions and resources to reduce repeat contacts",
      "Capture feedback to improve provider experience",
    ],
  },
  center: {
    title: "Issue Category Breakdown (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "48,923",
    segments: [
      { label: "Authorization Inquiries", value: "18,781 (38.4%)", pct: 38.4, color: "#3b82f6" },
      { label: "Claims Questions", value: "13,318 (27.2%)", pct: 27.2, color: "#22c55e" },
      { label: "Portal Navigation", value: "8,618 (17.6%)", pct: 17.6, color: "#a855f7" },
      { label: "Eligibility & Benefits", value: "4,403 (9.0%)", pct: 9.0, color: "#f59e0b" },
      { label: "Other Inquiries", value: "3,803 (7.8%)", pct: 7.8, color: "#ef4444" },
    ],
    bottomTitle: "Impact (Next 30 Days)",
    bottomCells: [
      { label: "Support Calls Deflected", value: "12,684" },
      { label: "Providers Reached", value: "18,250" },
      { label: "Time Saved (Est.)", value: "1,052 hrs" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "First Contact Resolution", value: "76.8%", delta: "7.4 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Smile, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Provider Satisfaction", value: "92.4%", delta: "6.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Avg. Resolution Time", value: "1.8 hrs", delta: "18.6%", deltaTone: "pos", deltaDir: "down" },
      { icon: Phone, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Support Calls Deflected", value: "12,684", delta: "13.1%", deltaTone: "pos", deltaDir: "up" },
      { icon: ClipboardCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Portal Task Completion Rate", value: "81.3%", delta: "8.5 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Repeat, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Repeat Contact Rate", value: "23.2%", delta: "6.7%", deltaTone: "pos", deltaDir: "down" },
    ],
  },
  bottomLeft: {
    title: "Top Provider Issues (MTD)",
    columns: ["Issue Type","Volume","% of Total","Trend"],
    rows: [
      { dot: "red", cells: ["Authorization Status","18,781","38.4%","↑"] },
      { dot: "orange", cells: ["Claims Inquiries","13,318","27.2%","↑"] },
      { dot: "yellow", cells: ["Portal Navigation","8,618","17.6%","↑"] },
      { dot: "green", cells: ["Eligibility & Benefits","4,403","9.0%","↓"] },
      { dot: "blue", cells: ["Other Inquiries","3,803","7.8%","—"] },
      { cells: ["Total","48,923","100%","—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Authorization status provided for Provider ID 112233", subtitle: "Outpatient MRI authorization – Approved" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Claim inquiry resolved for Provider ID 87654321", subtitle: "Claim #12345678 – Payment date confirmed" },
      { time: "8:46 AM", tone: "purple", icon: MessageSquare, title: "Portal navigation help for Provider ID 99887766", subtitle: "Assisted with updating practice information" },
      { time: "8:40 AM", tone: "orange", icon: AlertTriangle, title: "Escalated complex claim issue for Provider ID 556677", subtitle: "Routed to Claims Resolution team" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "Benefits verification provided for Provider ID 33445566", subtitle: "Member eligibility and coverage confirmed" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Availity", freshness: "15 min ago" },
      { name: "Provider Portal", freshness: "5 min ago" },
      { name: "Claims System", freshness: "30 min ago" },
      { name: "Authorization System", freshness: "10 min ago" },
      { name: "Provider Directory", freshness: "1 hr ago" },
      { name: "Member Eligibility System", freshness: "15 min ago" },
    ],
  },
};

export default function ProviderExperience() { return <CoworkerDashboard config={config} />; }