import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { Database, Activity, Boxes, Clock, AlertTriangle, CheckCircle2, BarChart3, Info, Settings, ShieldCheck, TrendingUp } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Database, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "HIE & Integration Feed Reliability Coworker",
  mission: "Ensure the reliability, timeliness, and accuracy of HIE and integration feeds to support seamless operations and better health outcomes.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: Activity, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Feed Success Rate (MTD)", value: "98.6%", deltaText: "2.4 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Boxes, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Feeds Processed (MTD)", value: "1.24M", deltaText: "15.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Avg End-to-End Latency", value: "18.6 min", deltaText: "3.2 min vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Feed Failures (MTD)", value: "2,134", deltaText: "18.7% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Incidents Resolved (MTD)", value: "487", deltaText: "20.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BarChart3, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Data Completeness (MTD)", value: "99.2%", deltaText: "1.8 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Feed Monitoring","HIE Performance","Integration Health","Data Quality","Issue Management","Alerts & Notifications","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT / Data Integration"],
      ["Function","HIE & Integration Feed Management"],
      ["Primary Stakeholders","HIE Team, Data Ops, Integration Engineering, Operations, Provider Relations"],
      ["Systems Integrated","HIEs, FHIR APIs, HL7 Feeds, ETL Tools, Integration Engines, Data Lake"],
      ["Data Sources","Clinical Data, ADT, Claims, Lab, Provider, Pharmacy, SDOH, Reference Data"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I monitor, validate, and optimize HIE and integration feeds to ensure timely, accurate data delivery across systems. I detect issues early, coordinate resolutions, and drive continuous reliability improvements.",
    responsibilities: [
      "Monitor HIE and integration feed availability and performance",
      "Detect and alert on feed delays or failures",
      "Validate data accuracy, completeness, and consistency",
      "Coordinate with trading partners and internal teams to resolve issues",
      "Manage interface configurations and mappings",
      "Document incidents, root causes, and resolutions",
      "Drive preventive improvements and capacity planning",
    ],
  },
  center: {
    title: "Feed Status by Source (MTD)",
    type: "donut", totalLabel: "Total Feeds", totalValue: "1.24M",
    segments: [
      { label: "HIE Partners", value: "562K (45.3%)", pct: 45.3, color: "#3b82f6" },
      { label: "Provider Feeds", value: "312K (25.2%)", pct: 25.2, color: "#22c55e" },
      { label: "Clinical Systems", value: "198K (16.0%)", pct: 16.0, color: "#a855f7" },
      { label: "Claims & Admin", value: "126K (10.2%)", pct: 10.2, color: "#f59e0b" },
      { label: "Other Sources", value: "44K (3.3%)", pct: 3.3, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Delayed Feeds", value: "1,876" },
      { label: "Records Affected", value: "2.31M" },
      { label: "Issues Prevented", value: "356" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: Activity, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Feed Success Rate", value: "98.6%", delta: "2.4 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Clock, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Avg End-to-End Latency", value: "18.6 min", delta: "3.2 min", deltaTone: "pos", deltaDir: "down" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Feed Failures", value: "2,134", delta: "18.7%", deltaTone: "pos", deltaDir: "down" },
      { icon: CheckCircle2, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Incidents Resolved", value: "487", delta: "20.6%", deltaTone: "pos", deltaDir: "up" },
      { icon: BarChart3, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Data Completeness", value: "99.2%", delta: "1.8 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Partner SLA Compliance", value: "97.8%", delta: "2.1 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Feeds by Volume (MTD)",
    columns: ["Feed / Interface","Source","Feed Type","Messages","Success Rate","Trend"],
    rows: [
      { dot: "red", cells: ["ADT Notifications","HIE Partner A","HL7 v2","312,456","99.1%","↑"] },
      { dot: "orange", cells: ["Lab Results","HIE Partner B","HL7 v2","245,812","98.3%","↑"] },
      { dot: "yellow", cells: ["Clinical Documents","HIE Partner C","C-CDA / FHIR","184,221","97.4%","↓"] },
      { dot: "green", cells: ["Claims Adjudication","Claims System","Flat File","156,339","98.9%","↑"] },
      { dot: "blue", cells: ["Provider Roster","Provider System","FHIR","98,452","99.6%","↑"] },
      { dot: "purple", cells: ["Pharmacy Claims","Pharmacy System","HL7 v2","76,118","98.1%","↑"] },
      { cells: ["SDOH Updates","Community System","FHIR","28,552","97.0%","↑"] },
      { cells: ["Total","","","1,101,950","98.6%","—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "7:55 AM", tone: "green", icon: CheckCircle2, title: "HIE Partner B feed delay resolved", subtitle: "Lab results feed latency returned to normal" },
      { time: "7:35 AM", tone: "blue", icon: Info, title: "New interface deployed: Provider Roster v2", subtitle: "Deployment successful" },
      { time: "7:15 AM", tone: "orange", icon: AlertTriangle, title: "Feed failure detected: HIE Partner C", subtitle: "Clinical documents feed – issue identified" },
      { time: "6:55 AM", tone: "green", icon: CheckCircle2, title: "Data quality issue resolved", subtitle: "Duplicate records from Community System corrected" },
      { time: "6:35 AM", tone: "purple", icon: Settings, title: "Capacity threshold increased", subtitle: "ETL job window extended for overnight processing" },
    ],
  },
  health: {
    title: "Integrations & Systems Health",
    rows: [
      { name: "HIE Partner A", freshness: "100%" },
      { name: "HIE Partner B", freshness: "100%" },
      { name: "HIE Partner C", freshness: "98.1%" },
      { name: "Claims System", freshness: "100%" },
      { name: "Provider System", freshness: "99.9%" },
      { name: "Lab System", freshness: "100%" },
      { name: "ETL / Integration Engine", freshness: "100%" },
      { name: "Data Lake", freshness: "100%" },
    ],
  },
};

export default function HieIntegration() { return <CoworkerDashboard config={config} />; }