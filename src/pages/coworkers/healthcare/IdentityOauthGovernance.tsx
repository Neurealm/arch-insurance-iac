import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { ShieldCheck, AlertTriangle, KeyRound, Fingerprint, Lock, ClipboardList, CheckCircle2, Info, Settings, TrendingUp, Activity } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: ShieldCheck, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Identity, OAuth & Access Governance Coworker",
  mission: "Enforce least privilege access, manage OAuth sprawl, and strengthen identity governance to reduce access risk and ensure compliance.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Identity Risk Score (MTD)", value: "72 / 100", deltaText: "6 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: AlertTriangle, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "High Risk Accounts (MTD)", value: "28", deltaText: "18% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: KeyRound, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "OAuth Applications (MTD)", value: "356", deltaText: "12% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Fingerprint, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "MFA Adoption", value: "94.6%", deltaText: "2.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Lock, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Privileged Accounts", value: "412", deltaText: "8% vs last month", deltaTone: "pos", deltaDir: "down" },
    { icon: ClipboardList, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Access Reviews Completed", value: "89%", deltaText: "14% vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Identity Health","Access Governance","OAuth & Applications","Privileged Access","Risk & Alerts","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","Cybersecurity / IAM"],
      ["Function","Identity, OAuth & Access Governance"],
      ["Primary Stakeholders","IAM, Security, Compliance"],
      ["Systems Integrated","IAM, OAuth, MFA, SSO, HRIS, ITSM, GRC"],
      ["Data Sources","Identity Provider, OAuth Platform, Cloud Directories, HR Systems, SIEM"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "High", tone: "orange" },
    updated: "May 27, 2026 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I continuously monitor identities, access, and authentication activity. I detect risky access, manage OAuth sprawl, and ensure compliance with access policies and reviews.",
    responsibilities: [
      "Enforce least privilege and separation of duties",
      "Detect and remediate risky and anomalous access",
      "Govern OAuth applications and API permissions",
      "Monitor privileged access and session activity",
      "Drive access reviews and certification campaigns",
      "Ensure MFA adoption and authentication strength",
      "Generate audit-ready access governance reports",
    ],
  },
  center: {
    title: "OAuth & Application Health (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "356",
    segments: [
      { label: "High Risk", value: "62 (17.4%)", pct: 17.4, color: "#ef4444" },
      { label: "Medium Risk", value: "104 (29.2%)", pct: 29.2, color: "#f59e0b" },
      { label: "Low Risk", value: "168 (47.2%)", pct: 47.2, color: "#22c55e" },
      { label: "Unknown", value: "22 (6.2%)", pct: 6.2, color: "#94a3b8" },
    ],
    bottomTitle: "Top Risk Factors",
    bottomCells: [
      { label: "Over-privileged scopes", value: "142" },
      { label: "Unused applications", value: "96" },
      { label: "No owner assigned", value: "74" },
      { label: "Expired credentials", value: "44" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: ShieldCheck, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Identity Risk Score", value: "72 / 100", delta: "6 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: AlertTriangle, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "High Risk Accounts", value: "28", delta: "18%", deltaTone: "pos", deltaDir: "down" },
      { icon: KeyRound, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "OAuth Applications", value: "356", delta: "12%", deltaTone: "pos", deltaDir: "up" },
      { icon: Fingerprint, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "MFA Adoption", value: "94.6%", delta: "2.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Lock, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Privileged Accounts", value: "412", delta: "8%", deltaTone: "pos", deltaDir: "down" },
      { icon: ClipboardList, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Access Reviews Completed", value: "89%", delta: "14%", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Top Identity Risks (MTD)",
    columns: ["Risk","Accounts","Severity","Trend"],
    rows: [
      { dot: "red", cells: ["Dormant Accounts (90+ days)","1,246","High","↑"] },
      { dot: "red", cells: ["Excessive Privileges","842","High","↑"] },
      { dot: "red", cells: ["Shared Accounts","314","High","↑"] },
      { dot: "orange", cells: ["MFA Not Enforced","1,028","Medium","↓"] },
      { dot: "orange", cells: ["Failed Login Anomalies","2,156","Medium","↓"] },
      { dot: "yellow", cells: ["Impossible Travel","116","Low","↓"] },
      { cells: ["Total Risky Accounts","3,702","",""] },
    ],
  },
  activity: {
    title: "Recent Alerts & Activity",
    items: [
      { time: "7:55 AM", tone: "red", icon: AlertTriangle, title: "Privilege escalation detected", subtitle: "Admin account used outside policy" },
      { time: "7:38 AM", tone: "orange", icon: KeyRound, title: "New OAuth app with high privileges", subtitle: "Finance API access" },
      { time: "7:21 AM", tone: "blue", icon: Info, title: "Access review campaign launched", subtitle: "Q2 2026 – Certify by June 10" },
      { time: "7:05 AM", tone: "green", icon: CheckCircle2, title: "Dormant accounts disabled", subtitle: "126 accounts" },
      { time: "6:48 AM", tone: "green", icon: TrendingUp, title: "Daily identity governance report", subtitle: "Available in Reports" },
    ],
  },
  health: {
    title: "Systems & Integrations",
    rows: [
      { name: "Identity Provider", freshness: "99.8%" },
      { name: "OAuth Platform", freshness: "99.6%" },
      { name: "SSO Platform", freshness: "99.7%" },
      { name: "MFA Platform", freshness: "99.5%" },
      { name: "HRIS", freshness: "99.9%" },
      { name: "GRC Platform", freshness: "99.6%" },
      { name: "SIEM", freshness: "99.7%" },
    ],
  },
};

export default function IdentityOauthGovernance() { return <CoworkerDashboard config={config} />; }