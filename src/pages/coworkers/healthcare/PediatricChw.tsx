import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  Baby, Users, ClipboardList, CheckCircle2, Heart, RotateCcw, Phone,
  Info, MessageCircle, AlertTriangle, Activity, ShieldCheck, FileText,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Baby, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Pediatric CHW & Developmental Screening Coworker",
  mission: "Ensure children receive timely developmental screenings and follow-through on referrals through collaboration with CHWs and care teams.",
  consoleClass: "bg-purple-600 hover:bg-purple-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Children Due for Screening", value: "27,431", deltaText: "8.6% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Screenings Completed (MTD)", value: "16,842", deltaText: "11.2% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Screening Completion Rate", value: "61.4%", deltaText: "6.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Users, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Referrals Initiated (MTD)", value: "5,928", deltaText: "9.7% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: RotateCcw, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Referrals Completed (MTD)", value: "3,842", deltaText: "12.5% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Heart, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Care Gaps Closed (MTD)", value: "3,126", deltaText: "10.3% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workload Execution", "Performance", "Screening Insights", "Outreach & Engagement", "Referrals & Follow-Up", "Care Gaps", "Providers & Partners", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Community Health"],
      ["Function", "Pediatric CHW & Developmental Screening"],
      ["Primary Stakeholders", "Pediatrics, CHW Teams, Medicaid Quality"],
      ["Systems Integrated", "Pediatric EHR, CHW Platform, Screening Tools, Claims, Member Data"],
      ["Data Sources", "Screening Data, Claims, CHW Notes, Referrals, Member Demographics"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I help identify children due for developmental screening, support CHWs with outreach and education, track screening completion, and ensure referrals are completed — closing gaps for better early childhood outcomes.",
    responsibilities: [
      "Identify children due for developmental screening",
      "Coordinate outreach with CHWs and families",
      "Track screening completion and document results",
      "Initiate referrals for additional evaluation or services",
      "Monitor referral completion and close care gaps",
      "Provide resources and education to families",
      "Generate reports for quality and compliance",
    ],
  },
  center: {
    title: "Screening & Referral Funnel (MTD)",
    type: "funnel",
    segments: [
      { label: "Due for Screening", value: "27,431 (100%)", pct: 100, color: "#6366f1" },
      { label: "Outreach Initiated", value: "22,184 (80.8%)", pct: 80.8, color: "#3b82f6" },
      { label: "Screening Completed", value: "16,842 (61.4%)", pct: 61.4, color: "#22c55e" },
      { label: "Referrals Initiated", value: "5,928 (21.6%)", pct: 21.6, color: "#f59e0b" },
      { label: "Referrals Completed", value: "3,842 (14.0%)", pct: 14, color: "#f97316" },
      { label: "Care Gaps Closed", value: "3,126 (11.4%)", pct: 11.4, color: "#ef4444" },
    ],
    bottomTitle: "Projected Impact (Next 30 Days)",
    bottomCells: [
      { label: "Additional Screenings", value: "+2,150" },
      { label: "Additional Referrals Completed", value: "+820" },
      { label: "Care Gaps Closed", value: "+650" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Screening Completion Rate", value: "61.4%", delta: "6.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: RotateCcw, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Referral Completion Rate", value: "64.8%", delta: "7.2 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Heart, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Care Gaps Closed", value: "3,126", delta: "10.3%", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Children with Up-to-Date Screenings", value: "58.7%", delta: "5.9 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Activity, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Well-Child Visit Compliance (3-6 yrs)", value: "72.1%", delta: "4.8 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: FileText, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Developmental Delay Identified Early", value: "1,042", delta: "9.8%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Screenings Due by Age Group",
    columns: ["Age Group", "Children Due", "% of Total", "Trend"],
    rows: [
      { dot: "red", cells: ["0-12 Months", "6,842", "24.9%", "↑"] },
      { dot: "orange", cells: ["13-24 Months", "7,513", "27.4%", "↑"] },
      { dot: "yellow", cells: ["25-36 Months", "6,174", "22.5%", "↑"] },
      { dot: "blue", cells: ["37-48 Months", "4,982", "18.2%", "—"] },
      { dot: "green", cells: ["49-60 Months", "1,920", "7.0%", "↓"] },
      { cells: ["Total", "27,431", "100%", "—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Screening completed for Member ID 12345678", subtitle: "ASQ-3 completed - On track" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Referral confirmed for Member ID 87654321", subtitle: "Speech evaluation - Appointment scheduled" },
      { time: "8:46 AM", tone: "purple", icon: Phone, title: "CHW outreach completed for Member ID 99887766", subtitle: "Family education provided - Follow-up set" },
      { time: "8:40 AM", tone: "yellow", icon: AlertTriangle, title: "No show for referral appointment", subtitle: "Member ID 44556677 - Reschedule in progress" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "Care gap closed for Member ID 11223344", subtitle: "Referral completed - Services initiated" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Pediatric EHR", freshness: "15 min ago" },
      { name: "CHW Platform", freshness: "5 min ago" },
      { name: "Screening Tool System", freshness: "10 min ago" },
      { name: "Claims System", freshness: "4 hrs ago" },
      { name: "Member Demographics", freshness: "2 hrs ago" },
      { name: "Community Resource Directory", freshness: "1 day ago" },
    ],
  },
};

export default function PediatricChw() { return <CoworkerDashboard config={config} />; }