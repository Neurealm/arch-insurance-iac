import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  Users, ClipboardList, CheckCircle2, AlertTriangle, FileDown, Phone, Info, Mail,
  FileText, Shield, Smile, Clock, RotateCcw,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-100",
  title: "Member Renewal & Recertification Coworker",
  mission: "Prevent coverage gaps by proactively managing renewals, collecting documents, and ensuring eligibility continuity.",
  consoleClass: "bg-blue-600 hover:bg-blue-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Renewals Due (30 Days)", value: "48,762", deltaText: "9.6% vs yesterday", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Renewals Completed (MTD)", value: "32,814", deltaText: "12.4% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Renewal Rate (MTD)", value: "67.3%", deltaText: "4.8 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Coverage at Risk", value: "9,842", deltaText: "8.7% vs yesterday", deltaTone: "pos", deltaDir: "down" },
    { icon: FileDown, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Documents Received (MTD)", value: "27,561", deltaText: "13.1% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Phone, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Member Outreach (MTD)", value: "112,458", deltaText: "10.2% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workload Execution", "Performance", "Member Insights", "Outreach & Communications", "Documents & Cases", "Policies & Rules", "Risk & Escalations", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Member Operations"],
      ["Function", "Renewal & Recertification Management"],
      ["Primary Stakeholders", "Medicaid Ops, Member Services, Retention Teams"],
      ["Systems Integrated", "Eligibility System, CRM, Outreach Platform, Document Management, Member Portal"],
      ["Data Sources", "Eligibility Data, Member Demographics, Mail Logs, Call Center, Portal, HIE, Address Services"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I proactively identify members with upcoming renewals, determine eligibility requirements, and coordinate outreach across multiple channels. I track member responses, collect and validate required documents, and ensure timely case resolution to prevent coverage gaps.",
    responsibilities: [
      "Identify members with upcoming renewal or recertification",
      "Determine required actions and documents",
      "Initiate multi-channel outreach and reminders",
      "Track member responses and document submissions",
      "Validate and process documents",
      "Escalate cases needing human intervention",
      "Prevent coverage gaps and ensure continuity",
    ],
  },
  center: {
    title: "Renewal Pipeline (30 Days)",
    type: "donut",
    totalLabel: "Total", totalValue: "48,762",
    segments: [
      { label: "Not Contacted", value: "12,548 (25.7%)", pct: 25.7, color: "#ef4444" },
      { label: "Contacted", value: "18,365 (37.6%)", pct: 37.6, color: "#3b82f6" },
      { label: "In Progress", value: "9,842 (20.2%)", pct: 20.2, color: "#f59e0b" },
      { label: "Documents Received", value: "5,217 (10.7%)", pct: 10.7, color: "#a855f7" },
      { label: "Completed", value: "2,790 (5.7%)", pct: 5.7, color: "#22c55e" },
    ],
    bottomTitle: "Projected Impact (Next 30 Days)",
    bottomCells: [
      { label: "Coverage Gaps Prevented", value: "6,124" },
      { label: "Members Retained", value: "5,812" },
      { label: "Cost Avoidance (Est.)", value: "$1.83M" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: Shield, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Coverage Gap Rate", value: "2.6%", delta: "0.4 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: Clock, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Renewal Turnaround Time", value: "6.2 days", delta: "1.1 days", deltaTone: "pos", deltaDir: "down" },
      { icon: CheckCircle2, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "First Contact Resolution", value: "72.8%", delta: "4.6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Smile, iconColor: "text-amber-500", iconBg: "bg-amber-50", label: "Member Satisfaction Score", value: "4.6 / 5", delta: "0.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: RotateCcw, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Return Mail Rate", value: "3.1%", delta: "0.6 pts", deltaTone: "pos", deltaDir: "down" },
      { icon: FileText, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Renewal Cost per Member", value: "$18.42", delta: "$2.11", deltaTone: "pos", deltaDir: "down" },
    ],
  },
  bottomLeft: {
    title: "Renewal Workload by Priority",
    columns: ["Priority", "Members", "% of Total", "Avg. Days to Due"],
    rows: [
      { dot: "red", cells: ["High (0-15 Days)", "9,842", "20.2%", "7.8"] },
      { dot: "orange", cells: ["Medium (16-30 Days)", "18,365", "37.6%", "22.4"] },
      { dot: "yellow", cells: ["Low (31-60 Days)", "12,548", "25.7%", "42.1"] },
      { dot: "green", cells: ["Not Due (>60 Days)", "8,007", "16.5%", "89.3"] },
      { cells: ["Total", "48,762", "100%", "29.1"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Renewal completed for Member ID 12345678", subtitle: "Coverage effective through 06/30/2026" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Document received from Member ID 87654321", subtitle: "Proof of income - Verified" },
      { time: "8:46 AM", tone: "purple", icon: Mail, title: "Reminder sent to 342 members", subtitle: "30-day renewal reminder via email and SMS" },
      { time: "8:40 AM", tone: "yellow", icon: AlertTriangle, title: "Escalated case to eligibility specialist", subtitle: "Member ID 11223344 - Complex household" },
      { time: "8:35 AM", tone: "green", icon: CheckCircle2, title: "Outreach call completed", subtitle: "Member ID 99887766 - Documents pending" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Eligibility System", freshness: "5 min ago" },
      { name: "CRM / Member 360", freshness: "3 min ago" },
      { name: "Outreach Platform", freshness: "2 min ago" },
      { name: "Document Management", freshness: "1 min ago" },
      { name: "Address Verification Service", freshness: "25 min ago" },
      { name: "HIE / Provider Data", freshness: "15 min ago" },
    ],
  },
};

export default function MemberRenewal() { return <CoworkerDashboard config={config} />; }