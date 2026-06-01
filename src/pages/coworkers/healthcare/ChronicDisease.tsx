import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  HeartHandshake, Users, Phone, CheckCircle2, HeartPulse, Pill, TrendingUp,
  Activity, ShieldCheck, FileText, Info, AlertTriangle, Beaker,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: HeartHandshake, iconColor: "text-blue-600", iconBg: "bg-blue-100",
  title: "Chronic Disease Management Coworker",
  mission: "Proactively identify, engage, and support members with chronic conditions to improve health outcomes and quality performance.",
  consoleClass: "bg-blue-600 hover:bg-blue-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "High-Risk Members Identified (MTD)", value: "41,256", deltaText: "8.9% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Phone, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Outreach Attempts Completed (MTD)", value: "28,673", deltaText: "10.4% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Engagement Rate", value: "62.1%", deltaText: "6.2 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: HeartPulse, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "A1c Improved (MTD)", value: "6,842", deltaText: "9.8% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Pill, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Medication Adherence Improved (MTD)", value: "12,341", deltaText: "7.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: TrendingUp, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Chronic Disease Care Gaps Closed (MTD)", value: "9,518", deltaText: "11.7% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Member Insights", "Outreach & Engagement", "Conditions", "Care Plans", "Care Gaps", "Providers", "Risk & Quality", "Analytics", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Population Health"],
      ["Function", "Chronic Disease Management"],
      ["Primary Stakeholders", "Population Health, Quality, Community Outreach"],
      ["Systems Integrated", "Claims, Labs, HIE, Pharmacy, Provider Data, Care Management, Member Outreach"],
      ["Data Sources", "Medical Claims, Lab Results, Pharmacy Claims, HIE Feeds, Provider Data, Social Determinants"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I identify members with chronic conditions, prioritize outreach based on risk, coordinate care interventions, and track engagement to improve clinical outcomes and close care gaps.",
    responsibilities: [
      "Identify high-risk members using predictive analytics",
      "Prioritize outreach for diabetes, hypertension, COPD, and more",
      "Monitor clinical measures (A1c, BP, LDL, BMI, etc.)",
      "Coordinate care with providers and community resources",
      "Support medication adherence and lifestyle management",
      "Track engagement and outcomes",
      "Close chronic disease care gaps",
    ],
  },
  center: {
    title: "Chronic Condition Overview (MTD)",
    type: "donut",
    totalLabel: "High-Risk Members", totalValue: "41,256",
    segments: [
      { label: "Diabetes", value: "15,842 (38.4%)", pct: 38.4, color: "#3b82f6" },
      { label: "Hypertension", value: "10,653 (25.8%)", pct: 25.8, color: "#f59e0b" },
      { label: "COPD", value: "6,218 (15.1%)", pct: 15.1, color: "#22c55e" },
      { label: "Asthma", value: "4,821 (11.7%)", pct: 11.7, color: "#10b981" },
      { label: "CHF", value: "2,732 (6.6%)", pct: 6.6, color: "#ef4444" },
      { label: "Other", value: "990 (2.4%)", pct: 2.4, color: "#a855f7" },
    ],
    bottomTitle: "Projected Impact (Next 30 Days)",
    bottomCells: [
      { label: "A1c Improved", value: "+1,842" },
      { label: "BP Controlled", value: "+2,350" },
      { label: "Care Gaps Closed", value: "+3,120" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Engagement Rate", value: "62.1%", delta: "6.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: HeartPulse, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "A1c Improvement Rate", value: "23.6%", delta: "3.1 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Activity, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Blood Pressure Controlled", value: "61.4%", delta: "5.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "LDL Controlled", value: "58.2%", delta: "4.8 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-amber-500", iconBg: "bg-amber-50", label: "ER Visits (Chronic) Avoided", value: "1,285", delta: "12.3%", deltaTone: "pos", deltaDir: "down" },
      { icon: FileText, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Hospitalizations Avoided", value: "417", delta: "10.7%", deltaTone: "pos", deltaDir: "down" },
    ],
  },
  bottomLeft: {
    title: "High-Risk Members by Condition",
    columns: ["Condition", "Members", "% of Total", "Trend"],
    rows: [
      { dot: "red", cells: ["Diabetes", "15,842", "38.4%", "↑"] },
      { dot: "orange", cells: ["Hypertension", "10,653", "25.8%", "↑"] },
      { dot: "yellow", cells: ["COPD", "6,218", "15.1%", "↑"] },
      { dot: "green", cells: ["Asthma", "4,821", "11.7%", "—"] },
      { dot: "red", cells: ["CHF", "2,732", "6.6%", "↓"] },
      { dot: "purple", cells: ["Other Conditions", "990", "2.4%", "—"] },
      { cells: ["Total", "41,256", "100%", "—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Outreach call completed for Member ID 12345678", subtitle: "Diabetes care plan follow-up" },
      { time: "8:52 AM", tone: "purple", icon: Phone, title: "Care gap identified: A1c > 9% for Member ID 87654321", subtitle: "Member added to high-priority outreach" },
      { time: "8:46 AM", tone: "blue", icon: Pill, title: "Pharmacy adherence alert for Member ID 99887766", subtitle: "Metformin refill overdue" },
      { time: "8:40 AM", tone: "green", icon: Beaker, title: "Lab result received: A1c improved to 7.2%", subtitle: "Member ID 33445566" },
      { time: "8:35 AM", tone: "indigo", icon: Info, title: "Care plan updated for Member ID 11223344", subtitle: "BP goal achieved" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Claims System", freshness: "15 min ago" },
      { name: "Lab Results", freshness: "5 min ago" },
      { name: "Pharmacy Claims", freshness: "30 min ago" },
      { name: "HIE / Provider Data", freshness: "10 min ago" },
      { name: "Care Management System", freshness: "5 min ago" },
      { name: "Member Outreach Platform", freshness: "1 hr ago" },
      { name: "Community Resource Directory", freshness: "2 hrs ago" },
    ],
  },
};

export default function ChronicDisease() { return <CoworkerDashboard config={config} />; }