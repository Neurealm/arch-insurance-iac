import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  Pill, Users, ClipboardList, CheckCircle2, Star, ShieldCheck, Phone,
  Heart, Info, MessageSquare, AlertTriangle,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Pill, iconColor: "text-purple-600", iconBg: "bg-purple-100",
  title: "Medication Adherence & Pharmacy Outreach Coworker",
  mission: "Improve medication adherence and close care gaps through proactive pharmacy outreach and coordinated interventions.",
  consoleClass: "bg-purple-600 hover:bg-purple-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Members Identified", value: "52,341", deltaText: "8.7% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Adherence Interventions", value: "31,876", deltaText: "9.9% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Adherence Rate (PDC)", value: "78.4%", deltaText: "3.2 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Star, iconColor: "text-amber-500", iconBg: "bg-amber-50", label: "Members Improved", value: "14,826", deltaText: "10.4% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "High-Risk Members Managed", value: "7,512", deltaText: "7.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Phone, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Outreach Attempts Completed", value: "68,421", deltaText: "11.3% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workload Execution", "Performance", "Medication Insights", "Outreach & Engagement", "Care Gaps", "Member Impact", "Risk & Quality", "Providers", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Pharmacy & Quality"],
      ["Function", "Medication Adherence & Outreach"],
      ["Primary Stakeholders", "Pharmacy Ops, Medicare Stars, Quality"],
      ["Systems Integrated", "Pharmacy Claims, PBM Feeds, Medication Adherence Data"],
      ["Data Sources", "Pharmacy Claims, PBM, Medication Adherence Data, Member Demographics, Provider Data, Care Management"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I identify non-adherent members, prioritize outreach, and coordinate pharmacy interventions to improve medication adherence and close care gaps that impact health outcomes and quality scores.",
    responsibilities: [
      "Identify members with medication adherence gaps",
      "Prioritize based on risk, chronic conditions, and quality impact",
      "Coordinate outreach via phone, text, email, and mail",
      "Partner with pharmacies for targeted interventions",
      "Address barriers to adherence (cost, access, understanding)",
      "Track and document interventions and outcomes",
      "Measure adherence improvement and close care gaps",
    ],
  },
  center: {
    title: "Adherence Funnel (MTD)",
    type: "funnel",
    segments: [
      { label: "Members Identified", value: "52,341 (100%)", pct: 100, color: "#3b82f6" },
      { label: "Contact Attempted", value: "41,267 (78.8%)", pct: 78.8, color: "#10b981" },
      { label: "Engaged", value: "31,876 (60.9%)", pct: 60.9, color: "#22c55e" },
      { label: "Interventions Completed", value: "20,543 (39.2%)", pct: 39.2, color: "#f59e0b" },
      { label: "Adherence Improved", value: "14,826 (28.3%)", pct: 28.3, color: "#f97316" },
      { label: "Care Gaps Closed", value: "9,842 (18.8%)", pct: 18.8, color: "#ef4444" },
    ],
    bottomTitle: "Projected Impact (Next 30 Days)",
    bottomCells: [
      { label: "Adherence Improvement", value: "+3.2 pts" },
      { label: "Members Impacted", value: "16,400" },
      { label: "Star Rating Impact", value: "+0.22" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: Pill, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Medication Adherence Rate (PDC)", value: "78.4%", delta: "3.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Heart, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Members with Improved Adherence", value: "14,826", delta: "10.4%", deltaTone: "pos", deltaDir: "up" },
      { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Care Gaps Closed", value: "9,842", delta: "11.1%", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Diabetes Members Adherent (PDC)", value: "76.1%", delta: "3.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Hypertension Members Adherent (PDC)", value: "81.3%", delta: "2.9 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Statin Adherence (ASCVD)", value: "72.8%", delta: "3.1 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Medication Classes (MTD)",
    columns: ["Medication Class", "Members Non-Adherent", "% Non-Adherent", "Trend"],
    rows: [
      { dot: "red", cells: ["Diabetes Medications", "12,842", "24.6%", "↑"] },
      { dot: "orange", cells: ["ACE/ARB", "9,763", "21.3%", "↑"] },
      { dot: "yellow", cells: ["Statins", "8,942", "18.7%", "↑"] },
      { dot: "green", cells: ["Beta Blockers", "6,215", "16.5%", "—"] },
      { dot: "blue", cells: ["Antidepressants", "5,981", "22.9%", "↑"] },
      { dot: "purple", cells: ["Inhaled Corticosteroids", "3,862", "20.4%", "↑"] },
      { cells: ["Total", "52,341", "—", "—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Intervention completed for Member ID 12345678", subtitle: "Diabetes medication adherence improved" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Pharmacy outreach attempted", subtitle: "Left voicemail for Member ID 87654321" },
      { time: "8:46 AM", tone: "purple", icon: MessageSquare, title: "Text reminder sent", subtitle: "Medication refill reminder sent to 342 members" },
      { time: "8:40 AM", tone: "yellow", icon: AlertTriangle, title: "High-cost barrier identified", subtitle: "Member ID 98765432 - Cost issue escalated to MAP team" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "Care gap closed", subtitle: "Statin therapy initiated - Member ID 11223344" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Pharmacy Claims System", freshness: "15 min ago" },
      { name: "PBM Feed", freshness: "30 min ago" },
      { name: "Medication Adherence Platform", freshness: "10 min ago" },
      { name: "Care Management System", freshness: "5 min ago" },
      { name: "Provider Directory", freshness: "1 hr ago" },
      { name: "Member Demographics", freshness: "2 hrs ago" },
    ],
  },
};

export default function MedicationAdherence() { return <CoworkerDashboard config={config} />; }