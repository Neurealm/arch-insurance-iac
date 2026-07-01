import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  HeartPulse, Users, ClipboardList, CheckCircle2, Building2, ShieldCheck, Phone,
  Activity, FileText, Info, AlertTriangle, MessageCircle,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: HeartPulse, iconColor: "text-purple-600", iconBg: "bg-purple-100",
  title: "Behavioral Health & Substance Use Transition Coworker",
  mission: "Ensure timely follow-up and coordinated care for members after behavioral health or substance use discharge to reduce readmissions and improve outcomes.",
  consoleClass: "bg-purple-600 hover:bg-purple-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Discharges Identified (MTD)", value: "9,784", deltaText: "11.2% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Follow-Up Completed (7 Days)", value: "6,214", deltaText: "9.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Follow-Up Rate (7 Days)", value: "63.5%", deltaText: "6.4 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Building2, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "30-Day Readmissions Prevented (Est.)", value: "312", deltaText: "12.7% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "High-Risk Members Under Care", value: "2,941", deltaText: "8.9% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Phone, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Outreach Attempts (MTD)", value: "18,642", deltaText: "10.3% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workload Execution", "Performance", "Member Insights", "Care Coordination", "Outreach & Engagement", "Risk & Quality", "Providers", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Behavioral Health"],
      ["Function", "Post-Discharge Transition & Follow-Up"],
      ["Primary Stakeholders", "Behavioral Health, Care Coordinators, Medical Directors"],
      ["Systems Integrated", "HIE Discharge Feeds, Care Management System, Behavioral Health Workflows, Claims, Provider Data, Member Communications"],
      ["Data Sources", "Discharge Feeds, Claims, Encounters, Care Plans, SUD Treatment Data, Member Outreach Logs"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I identify members discharged from behavioral health and substance use inpatient or residential care, assess risk, and ensure timely follow-up, outreach, and care plan activation to reduce readmissions and support long-term recovery.",
    responsibilities: [
      "Identify discharges from inpatient behavioral health and SUD facilities",
      "Assess readmission risk and SDOH factors",
      "Ensure follow-up appointments within 7 and 30 days",
      "Orchestrate outreach via phone, text, and care coordinator",
      "Engage community resources and SUD recovery supports",
      "Monitor adherence and remove barriers to follow-up",
      "Escalate high-risk cases and missed follow-ups",
    ],
  },
  center: {
    title: "Follow-Up Funnel (MTD)",
    type: "funnel",
    segments: [
      { label: "Discharges Identified", value: "9,784 (100%)", pct: 100, color: "#6366f1" },
      { label: "Risk Assessed", value: "9,102 (93.0%)", pct: 93, color: "#a855f7" },
      { label: "Outreach Initiated", value: "7,842 (80.1%)", pct: 80.1, color: "#22c55e" },
      { label: "Follow-Up Completed", value: "6,214 (63.5%)", pct: 63.5, color: "#f59e0b" },
      { label: "30-Day Follow-Up Completed", value: "5,112 (52.3%)", pct: 52.3, color: "#ef4444" },
    ],
    bottomTitle: "Projected Impact (Next 30 Days)",
    bottomCells: [
      { label: "Readmissions Prevented (Est.)", value: "312" },
      { label: "ED Visits Prevented (Est.)", value: "521" },
      { label: "Cost Avoidance (Est.)", value: "$1.62M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: Building2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "30-Day Readmission Rate (BH)", value: "12.6%", delta: "1.9 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: CheckCircle2, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "7-Day Follow-Up Rate", value: "63.5%", delta: "6.4 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: CheckCircle2, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "30-Day Follow-Up Rate", value: "52.3%", delta: "5.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "SUD Readmission Rate", value: "14.2%", delta: "2.1 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Activity, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Member Engagement Rate", value: "58.7%", delta: "4.7 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: FileText, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Care Plan Activation Rate", value: "71.8%", delta: "5.6 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "High-Risk Members by Risk Level",
    columns: ["Risk Level", "Members", "% of Total", "30-Day Readmission Risk"],
    rows: [
      { dot: "red", cells: ["Very High (90-100)", "1,024", "13.6%", "39.8%"] },
      { dot: "orange", cells: ["High (70-89)", "1,917", "25.5%", "22.6%"] },
      { dot: "yellow", cells: ["Moderate (40-69)", "2,842", "37.8%", "10.4%"] },
      { dot: "green", cells: ["Low (0-39)", "1,478", "19.7%", "3.1%"] },
      { cells: ["Total", "7,261", "100%", "—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Follow-up completed for Member ID 11223344", subtitle: "7-day follow-up completed via telehealth" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Discharge received from Southside Behavioral Health", subtitle: "Member ID 87654321 - Inpatient discharge" },
      { time: "8:46 AM", tone: "purple", icon: MessageCircle, title: "Outreach attempt made - no response", subtitle: "Member ID 99887766 - Left voicemail and text" },
      { time: "8:40 AM", tone: "yellow", icon: AlertTriangle, title: "High-risk member escalated", subtitle: "Member ID 33445566 - No follow-up scheduled" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "Care plan updated", subtitle: "Member ID 44556677 - SUD recovery support added" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "HIE Discharge Feeds", freshness: "15 min ago" },
      { name: "Care Management System", freshness: "5 min ago" },
      { name: "Behavioral Health EHR", freshness: "12 min ago" },
      { name: "Claims System", freshness: "4 hrs ago" },
      { name: "SUD Treatment Providers", freshness: "1 hr ago" },
      { name: "Member Outreach Platform", freshness: "2 min ago" },
    ],
  },
};

export default function BehavioralHealth() { return <CoworkerDashboard config={config} />; }