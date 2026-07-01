import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  Users, HeartHandshake, CheckCircle2, BedDouble, Home, UsersRound,
  ClipboardList, Activity, Star, Shield, FileText, Info, Truck, AlertTriangle,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Users, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "D-SNP & Long-Term Care Navigation Coworker",
  mission: "Coordinate care and services across Medicare, Medicaid, LTSS, and community resources to improve outcomes and member experience.",
  consoleClass: "bg-blue-600 hover:bg-blue-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Members Enrolled D-SNP/LTSS", value: "38,945", deltaText: "6.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: HeartHandshake, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Care Plans Active", value: "34,128", deltaText: "7.1% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Referrals Completed (MTD)", value: "12,746", deltaText: "8.2% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BedDouble, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Inpatient Admissions (MTD)", value: "1,842", deltaText: "9.4% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: Home, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Avoidable Admissions Prevented (MTD)", value: "623", deltaText: "12.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: UsersRound, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Members at Risk", value: "4,891", deltaText: "5.9% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workload Execution", "Performance", "Member Insights", "Care Coordination", "Care Plans", "Referrals & Services", "Providers & Community", "Risk & Quality", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Care Management"],
      ["Function", "D-SNP & LTSS Navigation"],
      ["Primary Stakeholders", "Care Management, LTSS, Social Work Teams"],
      ["Systems Integrated", "Care Management System, Provider Data, Social Care Referrals"],
      ["Data Sources", "Care Plans, Claims, HIE, Provider Directory, LTSS Providers, Social Services, Community Orgs"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I help care teams coordinate and navigate services for Dual Eligible Special Needs Plan (D-SNP) and LTSS members. I identify needs, close care gaps, facilitate referrals, and ensure members receive the right services at the right time across all touchpoints.",
    responsibilities: [
      "Identify members needing LTSS or care coordination",
      "Review care plans and SDOH to determine needs",
      "Coordinate services across Medicare, Medicaid, and LTSS",
      "Facilitate referrals to providers and community resources",
      "Monitor transitions, discharges, and post-acute needs",
      "Reduce avoidable utilization and improve plan adherence",
      "Escalate complex cases to care managers or social workers",
    ],
  },
  center: {
    title: "Care Coordination Funnel (MTD)",
    type: "funnel",
    segments: [
      { label: "Identified", value: "19,842 (100%)", pct: 100, color: "#3b82f6" },
      { label: "Assessment Initiated", value: "16,735 (84.3%)", pct: 84.3, color: "#a855f7" },
      { label: "Care Plan Created", value: "14,128 (71.2%)", pct: 71.2, color: "#22c55e" },
      { label: "Referrals Initiated", value: "12,746 (64.2%)", pct: 64.2, color: "#10b981" },
      { label: "Services Connected", value: "9,102 (45.9%)", pct: 45.9, color: "#f59e0b" },
      { label: "Closed / Resolved", value: "7,918 (39.9%)", pct: 39.9, color: "#ef4444" },
    ],
    bottomTitle: "Projected Impact (Next 30 Days)",
    bottomCells: [
      { label: "Avoidable Admissions Prevented", value: "158" },
      { label: "ED Visits Prevented", value: "342" },
      { label: "Cost Avoidance (Est.)", value: "$1.24M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: BedDouble, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "30-Day Readmission Rate", value: "13.6%", delta: "1.8 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Activity, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Inpatient Admissions per 1,000", value: "79.4", delta: "6.2 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Star, iconColor: "text-amber-500", iconBg: "bg-amber-50", label: "ED Visits per 1,000", value: "145.7", delta: "8.7 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Shield, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Plan All-Cause Readmission Rate", value: "17.9%", delta: "2.1 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: ClipboardList, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Care Plan Completion Rate", value: "92.4%", delta: "3.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: FileText, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Member Retention Rate (D-SNP)", value: "91.2%", delta: "2.4 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Member Needs (Today)",
    columns: ["Need Category", "Members", "% of Total", "Trend"],
    rows: [
      { cells: ["Personal Care Assistance", "8,976", "23.1%", "↑"] },
      { cells: ["Home-Delivered Meals", "6,542", "16.8%", "↑"] },
      { cells: ["Transportation", "5,812", "14.9%", "—"] },
      { cells: ["Home Modifications", "4,365", "11.2%", "↑"] },
      { cells: ["Caregiver Support", "3,842", "9.9%", "—"] },
      { cells: ["Adult Day Health", "3,111", "8.0%", "↓"] },
      { cells: ["Other Services", "2,475", "6.1%", "—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Care plan updated for Member ID 11223344", subtitle: "Added home health aide and meal services" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Referral sent to home care provider", subtitle: "Provider: Comfort Home Care" },
      { time: "8:46 AM", tone: "purple", icon: Truck, title: "Transportation arranged for Member ID 88776655", subtitle: "3 rides scheduled for upcoming appointments" },
      { time: "8:40 AM", tone: "yellow", icon: AlertTriangle, title: "High-risk member flagged for post-discharge follow-up", subtitle: "Member ID 55667788 discharged from hospital" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "LTSS eligibility verified for Member ID 33445566", subtitle: "Level of Care: Nursing Facility" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Care Management System", freshness: "5 min ago" },
      { name: "Claims System", freshness: "15 min ago" },
      { name: "HIE / Provider Data", freshness: "10 min ago" },
      { name: "LTSS Provider Network", freshness: "30 min ago" },
      { name: "Social Care Referrals", freshness: "12 min ago" },
      { name: "Community Based Orgs", freshness: "1 hr ago" },
    ],
  },
};

export default function DsnpLtc() { return <CoworkerDashboard config={config} />; }