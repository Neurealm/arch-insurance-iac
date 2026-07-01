import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { Cloud, ShieldCheck, KeyRound, FileCheck, AlertTriangle, Lock, Landmark, CheckCircle2, Info, Settings, Clock, TrendingUp } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Cloud, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "FHIR & CMS Interoperability API Operations Coworker",
  mission: "Ensure reliable, secure, and compliant FHIR and CMS API services to accelerate interoperability, improve developer experience, and support CMS reporting and member data exchange.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "API Uptime (MTD)", value: "99.94%", deltaText: "0.22 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: KeyRound, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Total API Calls (MTD)", value: "18.7M", deltaText: "14.8% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: FileCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Success Rate (MTD)", value: "98.6%", deltaText: "1.6 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "API Errors (MTD)", value: "28,452", deltaText: "12.4% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Lock, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "OAuth Token Issues (MTD)", value: "6,532", deltaText: "15.2% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Landmark, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "CMS Readiness Score (YTD)", value: "92.4%", deltaText: "4.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","API Performance","FHIR Operations","OAuth & Security","CMS Interoperability","Compliance & Governance","Developer Experience","Alerts & Incidents","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","IT / Interoperability"],
      ["Function","API Operations & Interoperability"],
      ["Primary Stakeholders","CIO, API Teams, Compliance, Business Units"],
      ["Systems Integrated","FHIR APIs, OAuth Platform, API Gateway, Developer Portal, Monitoring Tools, CMS Systems"],
      ["Data Sources","API Gateway Logs, FHIR Servers, OAuth Logs, CMS Schemas, Uptime Monitoring, Ticketing System"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I monitor, secure, and optimize FHIR and CMS APIs. I ensure compliance with industry standards, manage OAuth governance, and support seamless data exchange for members, providers, and CMS.",
    responsibilities: [
      "Monitor API uptime, performance, and error rates",
      "Manage OAuth clients, tokens, and access governance",
      "Ensure FHIR resource compliance and data quality",
      "Support CMS interoperability requirements and attestations",
      "Collaborate with developers to improve API experience",
      "Investigate and resolve API incidents and alerts",
      "Maintain documentation and versioning for APIs",
    ],
  },
  center: {
    title: "API Traffic by Type (MTD)",
    type: "donut", totalLabel: "Total Calls", totalValue: "18.7M",
    segments: [
      { label: "Member Access", value: "7.6M (40.6%)", pct: 40.6, color: "#3b82f6" },
      { label: "Provider Access", value: "4.8M (25.7%)", pct: 25.7, color: "#22c55e" },
      { label: "Claims & Authorizations", value: "3.1M (16.6%)", pct: 16.6, color: "#a855f7" },
      { label: "Quality & Measures", value: "2.0M (10.7%)", pct: 10.7, color: "#f59e0b" },
      { label: "Other / System", value: "1.2M (6.4%)", pct: 6.4, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "Data Exchanges", value: "4.2M" },
      { label: "Successful Transactions", value: "18.4M" },
      { label: "CMS Submissions Supported", value: "12" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "API Uptime", value: "99.94%", delta: "0.22 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: TrendingUp, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Success Rate", value: "98.6%", delta: "1.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "API Errors", value: "28,452", delta: "12.4%", deltaTone: "pos", deltaDir: "down" },
      { icon: Lock, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "OAuth Token Issues", value: "6,532", delta: "15.2%", deltaTone: "pos", deltaDir: "down" },
      { icon: Clock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Average Response Time", value: "412 ms", delta: "8.7%", deltaTone: "pos", deltaDir: "down" },
      { icon: Landmark, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "CMS Readiness Score (YTD)", value: "92.4%", delta: "4.3 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top API Endpoints (MTD)",
    columns: ["Endpoint","Calls","% of Total","Avg Response Time","Trend"],
    rows: [
      { dot: "red", cells: ["/Member/$everything","4.6M","24.6%","412 ms","↑"] },
      { dot: "orange", cells: ["/Coverage","3.2M","17.1%","368 ms","↑"] },
      { dot: "yellow", cells: ["/Claim","2.8M","15.0%","455 ms","↓"] },
      { dot: "green", cells: ["/Provider","2.3M","12.3%","375 ms","↑"] },
      { dot: "blue", cells: ["/ExplanationOfBenefit","1.9M","10.2%","402 ms","↓"] },
      { dot: "purple", cells: ["/Observation","1.6M","8.6%","390 ms","↑"] },
      { cells: ["/MedicationRequest","0.3M","1.6%","410 ms","—"] },
      { cells: ["Total","18.7M","100%","412 ms","↑"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:55 AM", tone: "green", icon: CheckCircle2, title: "FHIR Release R4.0.1 deployed successfully", subtitle: "All endpoints healthy" },
      { time: "8:35 AM", tone: "blue", icon: Info, title: "OAuth client \"ProviderApp-1234\" renewed", subtitle: "Token rotation completed" },
      { time: "8:15 AM", tone: "orange", icon: AlertTriangle, title: "High error rate on /Claim endpoint", subtitle: "Root cause identified and resolved" },
      { time: "7:55 AM", tone: "green", icon: CheckCircle2, title: "CMS TR3 test file submitted successfully", subtitle: "All validations passed" },
      { time: "7:35 AM", tone: "purple", icon: Settings, title: "New API version v2.5.0 published", subtitle: "Documentation and changelog updated" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "FHIR API Gateway", freshness: "1 min ago" },
      { name: "OAuth Platform", freshness: "2 min ago" },
      { name: "Developer Portal", freshness: "3 min ago" },
      { name: "CMS Interoperability Hub", freshness: "5 min ago" },
      { name: "Monitoring & Alerts", freshness: "2 min ago" },
      { name: "Logging & Analytics", freshness: "2 min ago" },
    ],
  },
};

export default function FhirCmsApi() { return <CoworkerDashboard config={config} />; }