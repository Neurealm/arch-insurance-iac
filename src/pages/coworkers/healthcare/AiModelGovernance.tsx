import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import {
  ShieldCheck, Bot, ClipboardList, CheckCircle2, AlertTriangle, FileText,
  TrendingUp, Info, MessageSquare, Award, BookOpen, Activity,
} from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: ShieldCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "AI Governance & Digital Coworker Oversight Coworker",
  mission: "Ensure AI-powered workflows and digital coworkers operate safely, ethically, and compliantly with transparency, accountability, and continuous oversight.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  consoleLabel: "Open Governance Console",
  kpis: [
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "AI Governance Score (MTD)", value: "87 / 100", deltaText: "9 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Bot, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "AI Workflows Monitored", value: "156", deltaText: "23 vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ClipboardList, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Models in Production", value: "32", deltaText: "4 vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Policy Compliance (MTD)", value: "96%", deltaText: "5 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Bias / Risk Alerts (MTD)", value: "12", deltaText: "20% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: FileText, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Audit Trails Captured (MTD)", value: "18,642", deltaText: "28% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","AI Inventory","Risk & Controls","Workflows & Approvals","Monitoring","Compliance","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","AI Governance"],
      ["Function","AI Governance & Digital Coworker Oversight"],
      ["Primary Stakeholders","CIO, CISO, Legal, Compliance, Risk, Business Owners"],
      ["Systems Integrated","AI Orchestration, Approval Workflows, Audit Trails, Policy Repository"],
      ["Data Sources","Model Logs, User Activities, Decisions, Outputs, Feedback, Monitoring Tools"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Medium", tone: "yellow" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I provide governance, risk management, and oversight for AI systems and digital coworkers to ensure safe, ethical, compliant, and explainable operations.",
    responsibilities: [
      "Ensure AI policies and guardrails are enforced",
      "Review and approve AI workflows and model changes",
      "Detect bias, drift, and abnormal behavior",
      "Maintain audit trails and decision transparency",
      "Ensure data privacy, security, and regulatory compliance",
      "Provide insights for responsible AI improvement",
    ],
  },
  center: {
    title: "AI Governance Score Trend (MTD)",
    type: "line",
    linePoints: [
      { label: "Apr 27", value: 68 },
      { label: "May 4", value: 72 },
      { label: "May 11", value: 76 },
      { label: "May 18", value: 81 },
      { label: "May 27", value: 87 },
    ],
    bottomTitle: "Score Components (MTD)",
    bottomCells: [
      { label: "Policy Compliance", value: "96 / 100" },
      { label: "Risk Management", value: "84 / 100" },
      { label: "Transparency", value: "86 / 100" },
      { label: "Monitoring", value: "92 / 100" },
      { label: "Accountability", value: "85 / 100" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "AI Governance Score", value: "87 / 100", delta: "9 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Bot, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "AI Workflows Monitored", value: "156", delta: "23", deltaTone: "pos", deltaDir: "up" },
      { icon: ClipboardList, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Models in Production", value: "32", delta: "4", deltaTone: "pos", deltaDir: "up" },
      { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Policy Compliance", value: "96%", delta: "5 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Bias / Risk Alerts", value: "12", delta: "20%", deltaTone: "pos", deltaDir: "down" },
      { icon: FileText, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Audit Trails Captured", value: "18,642", delta: "28%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Models in Production (MTD)",
    columns: ["Model Name","Use Case","Risk Level","Status"],
    rows: [
      { dot: "blue",   cells: ["Claims Triage Model","Claims Processing","Medium","Active"] },
      { dot: "green",  cells: ["Provider Matching Model","Provider Ops","Low","Active"] },
      { dot: "orange", cells: ["Auth Decision Model","Prior Authorization","High","Active"] },
      { dot: "purple", cells: ["Member Outreach Model","Member Engagement","Medium","Active"] },
      { dot: "red",    cells: ["Risk Stratification Model","Care Management","Medium","Active"] },
      { cells: ["Total Models","32","vs Last Month","+4"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:58 AM", tone: "green",  icon: CheckCircle2,   title: "Policy compliance check passed for Claims Triage Model", subtitle: "All guardrails enforced successfully" },
      { time: "8:52 AM", tone: "orange", icon: AlertTriangle,  title: "Bias alert flagged on Auth Decision Model",              subtitle: "High-risk signal — escalated for review" },
      { time: "8:46 AM", tone: "blue",   icon: Info,           title: "New AI workflow registered: Member Outreach v2",        subtitle: "Awaiting governance approval" },
      { time: "8:40 AM", tone: "purple", icon: MessageSquare,  title: "Reviewer approved Provider Matching Model update",      subtitle: "Change log updated and audit trail captured" },
      { time: "8:35 AM", tone: "green",  icon: BookOpen,       title: "AI Governance Score improved to 87 (+9 pts)",            subtitle: "Driven by stronger monitoring and audit coverage" },
    ],
  },
  health: {
    title: "Integrations & Data Health",
    rows: [
      { name: "AI Orchestration Platforms", freshness: "5 min ago" },
      { name: "Workflow Systems",           freshness: "10 min ago" },
      { name: "Audit Logs",                 freshness: "5 min ago" },
      { name: "Model Monitoring Tools",     freshness: "15 min ago" },
      { name: "Policy Repository",          freshness: "1 hr ago" },
      { name: "IAM",                        freshness: "20 min ago" },
    ],
  },
};

export default function AiModelGovernance() { return <CoworkerDashboard config={config} />; }
