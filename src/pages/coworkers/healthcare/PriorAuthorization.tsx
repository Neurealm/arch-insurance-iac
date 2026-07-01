import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  Bot, ClipboardList, CheckSquare, Clock, TrendingDown, ShieldCheck, FileText,
  Phone, FileX, Scale, DollarSign, CheckCircle2, Info, AlertTriangle, Settings,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: Bot, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Prior Authorization & Utilization Management Coworker",
  mission: "Accelerate prior authorization decisions with accurate policy interpretation, evidence review, and compliance.",
  consoleClass: "bg-blue-600 hover:bg-blue-700",
  kpis: [
    { icon: ClipboardList, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Work Items in Queue", value: "4,281", deltaText: "8.3% vs yesterday", deltaTone: "pos", deltaDir: "down" },
    { icon: CheckSquare, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Auto-Approval Rate", value: "68%", deltaText: "5.4% vs yesterday", deltaTone: "pos", deltaDir: "up" },
    { icon: Clock, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Avg. Turnaround Time", value: "2.6 hrs", deltaText: "0.7 hrs vs yesterday", deltaTone: "pos", deltaDir: "down" },
    { icon: TrendingDown, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Denial Rate", value: "12.4%", deltaText: "1.2% vs yesterday", deltaTone: "pos", deltaDir: "down" },
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "SLA Compliance", value: "96%", deltaText: "2.1% vs yesterday", deltaTone: "pos", deltaDir: "up" },
    { icon: FileText, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Today's Decisions", value: "1,842", deltaText: "10.7% vs yesterday", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview", "Workflow Execution", "Performance", "Systems & Data", "Policies & Rules", "Risk & Quality", "Audit & Evidence", "Configuration"],
  overview: {
    rows: [
      ["Domain", "Payer Operations"],
      ["Function", "Prior Authorization & Utilization Management"],
      ["Primary Stakeholders", "UM Team, Medical Directors, Provider Ops, Compliance"],
      ["Systems Integrated", "Availity, UM Platform, Policy Engine, FHIR PA APIs, Claims, EHR"],
      ["Data Sources", "Clinical Documentation, CPT/HCPCS, Member Eligibility, Provider Data, Policy Rules"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I review prior authorization requests, interpret clinical and policy requirements, verify documentation, assess medical necessity, and recommend decisions to the UM team. I ensure compliance with CMS and state mandates and maintain a complete audit trail.",
    responsibilities: [
      "Review requests and extract key data",
      "Validate policy, benefits, and coverage",
      "Assess medical necessity and documentation",
      "Identify missing information and outreach providers",
      "Recommend decision and route for human review",
      "Monitor SLAs and prioritize urgent requests",
      "Capture audit evidence and decision rationale",
    ],
  },
  center: {
    title: "Workload Summary",
    type: "donut",
    totalLabel: "Total", totalValue: "4,281",
    segments: [
      { label: "New Requests", value: "2,104 (49%)", pct: 49, color: "#3b82f6" },
      { label: "In Review", value: "1,247 (29%)", pct: 29, color: "#22c55e" },
      { label: "Pending Info", value: "642 (15%)", pct: 15, color: "#a855f7" },
      { label: "Peer Review", value: "188 (4%)", pct: 4, color: "#f59e0b" },
      { label: "Urgent", value: "100 (2%)", pct: 2, color: "#ef4444" },
    ],
    bottomTitle: "SLA Performance by Priority",
    bottomCells: [
      { label: "Standard", value: "96%" },
      { label: "Expedited", value: "95%" },
      { label: "Urgent", value: "98%" },
    ],
  },
  outcomes: {
    title: "Recent Impact",
    items: [
      { icon: Clock, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Time Saved", value: "1,248 hrs", delta: "9.2%", deltaTone: "pos", deltaDir: "up" },
      { icon: Phone, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Provider Call Reduction", value: "532", delta: "6.8%", deltaTone: "pos", deltaDir: "down" },
      { icon: FileX, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "Incomplete Submission Rate", value: "8.7%", delta: "1.3%", deltaTone: "pos", deltaDir: "down" },
      { icon: Scale, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Appeal Overturn Rate", value: "18.2%", delta: "2.1%", deltaTone: "pos", deltaDir: "down" },
      { icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Estimated Cost Avoidance", value: "$1.42M", delta: "7.4%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Request Categories (Today)",
    columns: ["Category", "Requests", "% of Total", "Avg. TAT"],
    rows: [
      { cells: ["Radiology", "642", "34.8%", "2.1 hrs"] },
      { cells: ["Advanced Imaging (MRI/CT/PET)", "428", "23.2%", "2.4 hrs"] },
      { cells: ["Durable Medical Equipment", "312", "16.9%", "1.8 hrs"] },
      { cells: ["Outpatient Procedures", "238", "12.9%", "2.7 hrs"] },
      { cells: ["Pain Management", "128", "6.9%", "2.0 hrs"] },
      { cells: ["Other Services", "106", "5.3%", "1.9 hrs"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green", icon: CheckCircle2, title: "Auto-approved Radiology request for member 12345678", subtitle: "CPT 72148 - Lumbar Spine MRI" },
      { time: "8:52 AM", tone: "blue", icon: Info, title: "Requested additional information from provider", subtitle: "Missing: Physical therapy notes" },
      { time: "8:48 AM", tone: "orange", icon: AlertTriangle, title: "Urgent request routed to Medical Director", subtitle: "Member 87654321 - Spinal Surgery" },
      { time: "8:44 AM", tone: "green", icon: CheckCircle2, title: "Completed peer review for DME request", subtitle: "CPT E0601 - CPAP Device" },
      { time: "8:40 AM", tone: "purple", icon: Settings, title: "Policy rule updated", subtitle: "Added NIA Clinical Guideline updates effective 6/1/2026" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "Availity Provider Portal", freshness: "1 min ago" },
      { name: "UM Platform", freshness: "1 min ago" },
      { name: "Policy Engine", freshness: "2 min ago" },
      { name: "FHIR Prior Auth APIs", freshness: "2 min ago" },
      { name: "Claims System", freshness: "3 min ago" },
      { name: "Member Eligibility", freshness: "1 min ago" },
      { name: "Clinical Documentation (EHR)", freshness: "2 min ago" },
    ],
  },
};

export default function PriorAuthorization() { return <CoworkerDashboard config={config} />; }