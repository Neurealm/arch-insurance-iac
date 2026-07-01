import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  HeartPulse, Users, CheckCircle2, Target, Star, BarChart3, FileText,
  Info, AlertTriangle, Database, Activity, Stethoscope, Pill, Droplet, Eye,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: HeartPulse, iconColor: "text-emerald-600", iconBg: "bg-emerald-100",
  title: "Stars, HEDIS & QARR Care Gap Closure Coworker",
  mission: "Identify, prioritize, and close care gaps in real time to improve Stars, HEDIS, and QARR performance.",
  consoleClass: "bg-blue-600 hover:bg-blue-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Care Gaps Identified", value: "18,742", deltaText: "9.8% vs yesterday", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Gaps Closed (Today)", value: "3,412", deltaText: "11.2% vs yesterday", deltaTone: "pos", deltaDir: "up" },
    { icon: Target, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Closure Rate (MTD)", value: "64.8%", deltaText: "6.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Users, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Members Impacted", value: "125,843", deltaText: "7.1% vs yesterday", deltaTone: "pos", deltaDir: "up" },
    { icon: Star, iconColor: "text-amber-500", iconBg: "bg-amber-50", label: "Stars Rating Impact (Proj.)", value: "+0.38", deltaText: "0.08 vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BarChart3, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "HEDIS Measures Improved", value: "14 of 22", deltaText: "4 vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workload Execution", "Performance", "Care Gap Insights", "Member Outreach", "Provider Engagement", "Data & Integrations", "Risk & Equity", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Quality & Population Health"],
      ["Function", "Care Gap Identification & Closure"],
      ["Primary Stakeholders", "Quality Team, Stars Team, Population Health, VBC"],
      ["Systems Integrated", "Hyphen, HIE, Claims, Pharmacy, Care Management, Provider Feeds"],
      ["Data Sources", "Claims, EHR, Pharmacy Claims, Lab Results, Care Mgmt., SDOH, Provider Data"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I continuously scan member data across clinical, pharmacy, social, and administrative sources to identify care gaps, stratify risk, and prime timely outreach and interventions. I track outcomes and measure impact on Stars, HEDIS, and QARR performance.",
    responsibilities: [
      "Identify care gaps in real time across all measures",
      "Prioritize members based on risk and measure impact",
      "Orchestrate outreach and care management tasks",
      "Engage providers with actionable gap closure insights",
      "Monitor closures, validate outcomes, and prevent recurrences",
      "Measure performance impact on Stars, HEDIS, and QARR",
      "Ensure equity-focused gap closure strategies",
    ],
  },
  center: {
    title: "Gap Closure Funnel (MTD)",
    type: "funnel",
    segments: [
      { label: "Gaps Identified", value: "18,742 (100%)", pct: 100, color: "#3b82f6" },
      { label: "Outreach Initiated", value: "10,986 (58.6%)", pct: 58.6, color: "#22c55e" },
      { label: "In Progress", value: "6,248 (33.3%)", pct: 33.3, color: "#a855f7" },
      { label: "Closed", value: "3,412 (18.2%)", pct: 18.2, color: "#f97316" },
    ],
    bottomTitle: "Projected Impact",
    bottomCells: [
      { label: "Stars Rating Impact", value: "+0.38" },
      { label: "Members Impacted", value: "125,843" },
      { label: "ROI (Est. Annual)", value: "$14.2M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: HeartPulse, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Breast Cancer Screening Closure Rate", value: "68.2%", delta: "8.4 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Activity, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Controlling High Blood Pressure Closure Rate", value: "62.7%", delta: "6.1 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Droplet, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Diabetes HbA1c Poor Control Closure Rate", value: "58.9%", delta: "5.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Stethoscope, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Kidney Health Evaluation Closure Rate", value: "61.4%", delta: "7.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Eye, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Follow-Up After ED Visit (Mental Illness) Closure Rate", value: "53.1%", delta: "6.0 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Care Gaps by Volume (Today)",
    columns: ["Care Gap / Measure", "Members Impacted", "% of Total", "Closure Rate"],
    rows: [
      { cells: ["Controlling High Blood Pressure", "32,145", "17.1%", "62.7%"] },
      { cells: ["Breast Cancer Screening", "28,976", "15.4%", "68.2%"] },
      { cells: ["Diabetes HbA1c Poor Control", "24,112", "12.9%", "58.9%"] },
      { cells: ["Colorectal Cancer Screening", "18,934", "10.1%", "61.3%"] },
      { cells: ["Well-Child Visits (3-6 yrs)", "16,287", "8.7%", "67.5%"] },
    ],
    link: "View all care gaps",
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Closed 125 care gaps for Member ID 12345678", subtitle: "Breast Cancer Screening completed" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Outreach task created for 342 members", subtitle: "Diabetes HbA1c follow-up due" },
      { time: "8:45 AM", tone: "orange", icon: AlertTriangle, title: "Provider alert sent to Midtown Family Health", subtitle: "High BP care gaps > 20 patients" },
      { time: "8:40 AM", tone: "green", icon: CheckCircle2, title: "Gap closure validated for 98 members", subtitle: "Kidney Health Evaluation" },
      { time: "8:35 AM", tone: "purple", icon: Database, title: "New data received from HIE", subtitle: "248 member records updated" },
    ],
  },
  health: {
    title: "Data & Integration Health",
    rows: [
      { name: "Hyphen Platform", freshness: "15 min ago" },
      { name: "Health Information Exchange", freshness: "12 min ago" },
      { name: "Claims System", freshness: "4 hrs ago" },
      { name: "Pharmacy Claims (PBM)", freshness: "2 hrs ago" },
      { name: "Care Management System", freshness: "8 min ago" },
      { name: "Provider Feed", freshness: "1 hr ago" },
    ],
  },
};

export default function StarsHedis() { return <CoworkerDashboard config={config} />; }