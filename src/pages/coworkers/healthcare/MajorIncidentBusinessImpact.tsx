import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { Activity, AlertTriangle, Clock, Users, CheckCircle2, BarChart3, Info, Mail, Settings, ShieldCheck, TrendingUp, DollarSign } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: AlertTriangle, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Major Incident & Business Impact Coworker",
  mission: "Connect infrastructure alerts to business impact so incidents are prioritized by what matters most to members, providers, and operations.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: Activity, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Business Impact Score (MTD)", value: "94.3%", deltaText: "8.7 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Major Incidents (MTD)", value: "23", deltaText: "17% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "MTTR (Business Impact)", value: "42 min", deltaText: "18 min vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Users, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Members Impacted (MTD)", value: "125K", deltaText: "26% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Incidents Resolved (MTD)", value: "247", deltaText: "19% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BarChart3, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Repeat Incident Rate", value: "6.5%", deltaText: "1.3 pts vs last month", deltaTone: "pos", deltaDir: "down" },
  ],
  tabs: ["Overview","Incident Monitoring","Business Impact","Service Health","Alert Correlation","Post-Incident","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT Operations"],
      ["Function","Major Incident & Business Impact"],
      ["Primary Stakeholders","NOC, IT Ops, Executive IT Leadership"],
      ["Systems Integrated","ITSM, Observability, Application Telemetry, CMDB, Change Mgmt"],
      ["Data Sources","Alerts, Metrics, Logs, APM, Synthetic, User Experience, Service Dependencies"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "High", tone: "orange" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I correlate alerts, identify major incidents, and determine real business impact. I inform stakeholders, drive response, and communicate updates until resolution.",
    responsibilities: [
      "Correlate alerts to find and suppress noise",
      "Determine business impact and affected user groups",
      "Declare major incidents and engage response teams",
      "Communicate status to stakeholders and leadership",
      "Monitor recovery and validate service restoration",
      "Create post-incident reviews and drive improvements",
    ],
  },
  center: {
    title: "Incidents by Business Impact (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "23",
    segments: [
      { label: "Severe", value: "5 (21.7%)", pct: 21.7, color: "#ef4444" },
      { label: "High", value: "7 (30.4%)", pct: 30.4, color: "#f59e0b" },
      { label: "Medium", value: "6 (26.1%)", pct: 26.1, color: "#eab308" },
      { label: "Low", value: "4 (17.4%)", pct: 17.4, color: "#3b82f6" },
      { label: "Informational", value: "1 (4.3%)", pct: 4.3, color: "#22c55e" },
    ],
    bottomTitle: "Impact Summary (MTD)",
    bottomCells: [
      { label: "Members Impacted", value: "125K" },
      { label: "Providers Impacted", value: "8,432" },
      { label: "Transactions Impacted", value: "2.1M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Business Impact Score", value: "94.3%", delta: "8.7 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Major Incidents", value: "23", delta: "17%", deltaTone: "pos", deltaDir: "down" },
      { icon: Clock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "MTTR (Business Impact)", value: "42 min", delta: "18 min", deltaTone: "pos", deltaDir: "down" },
      { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Incidents Resolved", value: "247", delta: "19%", deltaTone: "pos", deltaDir: "up" },
      { icon: BarChart3, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Repeat Incident Rate", value: "6.5%", delta: "1.3 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: TrendingUp, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Stakeholder Satisfaction", value: "4.7 / 5", delta: "0.4 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Active Incidents",
    columns: ["Incident","Severity","Business Impact","Members Impacted","Duration","Status"],
    rows: [
      { dot: "red", cells: ["INC-24681","Severe","Member Portal Down","62,000","1h 23m","Investigating"] },
      { dot: "orange", cells: ["INC-24677","High","Claims Submission Errors","24,000","48m","Identified"] },
      { dot: "orange", cells: ["INC-24672","High","Authorization Delays","18,500","37m","Monitoring"] },
      { dot: "yellow", cells: ["INC-24665","Medium","Provider Portal Slowness","12,200","25m","Monitoring"] },
      { dot: "blue", cells: ["INC-24659","Low","Batch Reporting Delay","3,500","12m","Resolved"] },
      { cells: ["Total Impact (Active)","","","120,200","2h 25m",""] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "7:55 AM", tone: "green", icon: CheckCircle2, title: "Incident INC-24665 resolved", subtitle: "Provider portal performance restored" },
      { time: "7:42 AM", tone: "orange", icon: AlertTriangle, title: "Business impact increased: INC-24677", subtitle: "Now affecting claims submission for providers" },
      { time: "7:31 AM", tone: "red", icon: AlertTriangle, title: "Major incident declared: INC-24681", subtitle: "Member portal is down" },
      { time: "7:15 AM", tone: "green", icon: CheckCircle2, title: "Incident INC-24659 resolved", subtitle: "Batch reporting completed successfully" },
      { time: "7:05 AM", tone: "blue", icon: Mail, title: "Stakeholder update sent", subtitle: "Executive IT leadership notified" },
    ],
  },
  health: {
    title: "Top Impacted Services (MTD)",
    rows: [
      { name: "Member Portal", freshness: "94.1%" },
      { name: "Claims System", freshness: "96.3%" },
      { name: "Authorization System", freshness: "97.2%" },
      { name: "Provider Portal", freshness: "98.6%" },
      { name: "Billing System", freshness: "99.2%" },
      { name: "Overall Service Availability", freshness: "97.1%" },
    ],
  },
};

export default function MajorIncidentBusinessImpact() { return <CoworkerDashboard config={config} />; }