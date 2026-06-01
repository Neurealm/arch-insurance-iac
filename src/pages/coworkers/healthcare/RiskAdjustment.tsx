import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { ClipboardCheck, Users, ClipboardList, CheckCircle2, TrendingUp, ShieldCheck, FileSearch, BadgeCheck, Stethoscope, Info, AlertTriangle, MessageSquare, Award, BookOpen } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: ClipboardCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Risk Adjustment & Documentation Integrity Coworker",
  mission: "Identify and close documentation and coding gaps to improve risk accuracy, revenue integrity, and quality outcomes.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Members Attributed", value: "278,452", deltaText: "8.9% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: FileSearch, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "HCC Opportunities Identified (MTD)", value: "15,732", deltaText: "11.7% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Supported & Closed (MTD)", value: "10,842", deltaText: "12.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: TrendingUp, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Closure Rate (MTD)", value: "68.9%", deltaText: "4.6 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "RAF Impact (YTD)", value: "+0.086", deltaText: "0.014 vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BadgeCheck, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Audit-Ready Rate", value: "93.4%", deltaText: "5.8 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","HCC Opportunity Pipeline","Provider Documentation","Coding Accuracy","Education & Outreach","Compliance & Audit","Provider Insights","Revenue Impact","Audit & Evidence","Configuration"],
  overview: {
    rows: [
      ["Domain","Revenue & Quality"],
      ["Function","Risk Adjustment & Documentation Integrity"],
      ["Primary Stakeholders","Risk Adjustment, Provider Education, Compliance"],
      ["Systems Integrated","Claims, Clinical Records, Hyphen Analytics, Provider Portal, HIE"],
      ["Data Sources","Medical Claims, Encounter Data, EHR Documents, Lab Results, Provider Notes"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I find documentation and coding gaps, prioritize by impact, and coordinate with providers to capture and support accurate HCC/CRG coding—improving RAF, quality, and audit readiness.",
    responsibilities: [
      "Identify HCC/CRG documentation opportunities",
      "Validate clinical evidence and coding support",
      "Engage providers for documentation and code capture",
      "Track closure, RAF impact, and coding accuracy",
      "Provide education and feedback to providers",
      "Ensure compliance and audit readiness",
    ],
  },
  center: {
    title: "HCC Opportunity Status (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "15,732",
    segments: [
      { label: "New Opportunities", value: "6,412 (40.7%)", pct: 40.7, color: "#3b82f6" },
      { label: "In Review", value: "3,218 (20.4%)", pct: 20.4, color: "#22c55e" },
      { label: "Provider Outreach", value: "2,306 (14.6%)", pct: 14.6, color: "#a855f7" },
      { label: "Documentation Received", value: "2,130 (13.5%)", pct: 13.5, color: "#f59e0b" },
      { label: "Closed / Supported", value: "1,666 (10.6%)", pct: 10.6, color: "#ef4444" },
    ],
    bottomTitle: "RAF Impact (YTD)",
    bottomCells: [
      { label: "RAF YTD", value: "0.086" },
      { label: "RAF vs Prior YTD", value: "+0.014" },
      { label: "Annualized Revenue Impact", value: "$8.7M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: TrendingUp, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Closure Rate", value: "68.9%", delta: "4.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Supported & Closed", value: "10,842", delta: "12.3%", deltaTone: "pos", deltaDir: "up" },
      { icon: Stethoscope, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Coding Accuracy", value: "92.1%", delta: "4.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Audit-Ready Rate", value: "93.4%", delta: "5.8 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Users, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Provider Engagement Rate", value: "82.7%", delta: "6.7 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Award, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "High-Priority Opportunities Closed", value: "1,666", delta: "13.2%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top HCC Categories (MTD)",
    columns: ["HCC Category","Opportunities","Closed","Closure Rate","RAF Impact"],
    rows: [
      { dot: "red", cells: ["Diabetes with Complications","2,184","1,612","73.8%","0.018"] },
      { dot: "orange", cells: ["Congestive Heart Failure","1,876","1,243","66.2%","0.013"] },
      { dot: "yellow", cells: ["COPD","1,654","1,102","66.6%","0.010"] },
      { dot: "green", cells: ["Major Depression","1,432","978","68.3%","0.008"] },
      { dot: "blue", cells: ["CKD (Stages 3–5)","1,218","845","69.4%","0.007"] },
      { dot: "purple", cells: ["Atrial Fibrillation","1,106","742","67.1%","0.006"] },
      { cells: ["Other HCCs","4,262","2,320","54.4%","0.014"] },
      { cells: ["Total","15,732","10,842","68.9%","0.086"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "HCC opportunity closed for Member ID 12345678", subtitle: "COPD documentation supported" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Provider outreach sent for Member ID 87654321", subtitle: "Missing documentation: CHF" },
      { time: "8:46 AM", tone: "purple", icon: MessageSquare, title: "Provider replied for Member ID 99887766", subtitle: "Documentation received and under review" },
      { time: "8:40 AM", tone: "orange", icon: AlertTriangle, title: "High-impact opportunity flagged for Member ID 556677", subtitle: "Diabetes w/ complications - needs documentation" },
      { time: "8:35 AM", tone: "green", icon: BookOpen, title: "Coding accuracy improved to 92.1% (+4.3 pts)", subtitle: "Based on supported opportunities closed" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Claims System", freshness: "15 min ago" },
      { name: "Clinical Records (EHR)", freshness: "30 min ago" },
      { name: "Hyphen Analytics", freshness: "1 hr ago" },
      { name: "Provider Portal", freshness: "10 min ago" },
      { name: "HIE / Clinical Data", freshness: "15 min ago" },
      { name: "Lab Results Interface", freshness: "2 hrs ago" },
      { name: "Provider Directory", freshness: "1 hr ago" },
    ],
  },
};

export default function RiskAdjustment() { return <CoworkerDashboard config={config} />; }