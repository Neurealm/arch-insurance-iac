import { CoworkerDashboard, type CoworkerConfig } from "@/components/coworkers/CoworkerDashboard";
import { HeartHandshake, Users, Handshake, CheckCircle2, UsersRound, ShieldCheck, Smile, Heart, BarChart3, Info, AlertTriangle, Mail, CalendarCheck } from "lucide-react";

const config: CoworkerConfig = {
  backTo: "/coworkers/healthcare-payer",
  icon: HeartHandshake, iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
  title: "Health Equity & Community Outreach Coworker",
  mission: "Advance health equity by coordinating culturally aligned outreach, removing barriers, and improving engagement for underserved members and communities.",
  consoleClass: "bg-indigo-600 hover:bg-indigo-700",
  kpis: [
    { icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Members Reached (MTD)", value: "142,876", deltaText: "14.2% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: Handshake, iconColor: "text-indigo-600", iconBg: "bg-indigo-50", label: "Engagements Completed (MTD)", value: "38,452", deltaText: "12.7% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: CheckCircle2, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Event & Activity Touchpoints (MTD)", value: "524", deltaText: "18.3% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: UsersRound, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Underserved Members Engaged (MTD)", value: "27,983", deltaText: "15.8% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Care Plan Connections (MTD)", value: "16,842", deltaText: "13.9% vs last month", deltaTone: "pos", deltaDir: "up" },
    { icon: BarChart3, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Member Satisfaction (MTD)", value: "4.7 / 5", deltaText: "0.3 pts vs last month", deltaTone: "pos", deltaDir: "up" },
  ],
  tabs: ["Overview","Outreach Activities","Community Partnerships","Member Engagement","Health Equity Insights","Barriers & SDOH","Care Connections","Performance","Reports","Configuration"],
  overview: {
    rows: [
      ["Domain","Health Equity"],
      ["Function","Community Outreach & Engagement"],
      ["Primary Stakeholders","Community Engagement, Health Equity Teams, Population Health, CHW Teams"],
      ["Systems Integrated","Community Office Data, Member Demographics, Outreach Systems, CRM, SDOH Data"],
      ["Data Sources","Member Data, SDOH, Community Events, Partner Reports, Outreach Platforms"],
    ],
    automation: "Supervised (Human-in-the-Loop)",
    risk: { label: "Low", tone: "green" },
    updated: "May 27, 2025 8:00 AM ET",
  },
  whatIDo: {
    paragraph: "I coordinate culturally relevant outreach, connect members to community resources, and remove barriers to care. I collaborate with community partners and track engagement to improve outcomes for underserved populations.",
    responsibilities: [
      "Identify and prioritize underserved populations",
      "Plan and execute culturally aligned outreach",
      "Partner with community organizations and leaders",
      "Track outreach activities and engagement outcomes",
      "Address barriers to care and social needs",
      "Connect members to appropriate resources and services",
      "Measure impact and drive continuous improvement",
    ],
  },
  center: {
    title: "Engagement by Channel (MTD)",
    type: "donut", totalLabel: "Total", totalValue: "38,452",
    segments: [
      { label: "In-Person Events", value: "15,842 (41.2%)", pct: 41.2, color: "#3b82f6" },
      { label: "Phone Outreach", value: "9,876 (25.7%)", pct: 25.7, color: "#22c55e" },
      { label: "Text / SMS", value: "7,213 (18.8%)", pct: 18.8, color: "#a855f7" },
      { label: "Email", value: "3,452 (9.0%)", pct: 9.0, color: "#f59e0b" },
      { label: "Other / Digital", value: "2,069 (5.3%)", pct: 5.3, color: "#ef4444" },
    ],
    bottomTitle: "Impact (MTD)",
    bottomCells: [
      { label: "New Members Reached", value: "142,876" },
      { label: "Resources Referrals Made", value: "21,354" },
      { label: "Care Connections Made", value: "16,842" },
    ],
  },
  outcomes: {
    title: "Key Outcomes (MTD)",
    items: [
      { icon: UsersRound, iconColor: "text-blue-600", iconBg: "bg-blue-50", label: "Underserved Members Engaged", value: "27,983", delta: "15.8%", deltaTone: "pos", deltaDir: "up" },
      { icon: ShieldCheck, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Care Plan Connections", value: "16,842", delta: "13.9%", deltaTone: "pos", deltaDir: "up" },
      { icon: Smile, iconColor: "text-purple-600", iconBg: "bg-purple-50", label: "Member Satisfaction Score", value: "4.7 / 5", delta: "0.3 pts", deltaTone: "pos", deltaDir: "up" },
      { icon: Heart, iconColor: "text-rose-600", iconBg: "bg-rose-50", label: "SDOH Needs Addressed", value: "9,412", delta: "12.4%", deltaTone: "pos", deltaDir: "up" },
      { icon: CalendarCheck, iconColor: "text-orange-600", iconBg: "bg-orange-50", label: "Event Participation", value: "524", delta: "18.3%", deltaTone: "pos", deltaDir: "up" },
      { icon: CheckCircle2, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Follow-Up Completion Rate", value: "71.6%", delta: "6.7 pts", deltaTone: "pos", deltaDir: "up" },
    ],
  },
  bottomLeft: {
    title: "Outreach Activities by Type (MTD)",
    columns: ["Activity Type","Activities","Members Reached","% of Total","Trend"],
    rows: [
      { dot: "red", cells: ["Community Events","142","48,126","33.7%","↑"] },
      { dot: "orange", cells: ["Partner Collaborations","98","31,452","22.0%","↑"] },
      { dot: "yellow", cells: ["Health Education Sessions","87","22,187","15.5%","↑"] },
      { dot: "green", cells: ["Member Follow-Up","416","18,764","13.1%","↑"] },
      { dot: "blue", cells: ["Resource Distribution","65","12,347","8.6%","↑"] },
      { dot: "purple", cells: ["Other Activities","31","10,000","7.0%","↑"] },
      { cells: ["Total","839","142,876","100%","—"] },
    ],
  },
  activity: {
    title: "Recent Activity Feed",
    items: [
      { time: "8:55 AM", tone: "green", icon: CheckCircle2, title: "Community health fair completed in East County", subtitle: "125 members engaged" },
      { time: "8:35 AM", tone: "blue", icon: Info, title: "Partner meeting held with Local Food Bank", subtitle: "Discussed resource referrals and food access" },
      { time: "8:15 AM", tone: "purple", icon: Mail, title: "Text campaign sent to 2,450 members", subtitle: "Reminder: Annual wellness visits" },
      { time: "7:55 AM", tone: "orange", icon: AlertTriangle, title: "Barrier resolved for Member ID 12345678", subtitle: "Transportation assistance arranged" },
      { time: "7:35 AM", tone: "green", icon: CheckCircle2, title: "Follow-up completed for 87 members", subtitle: "Connected to primary care and resources" },
    ],
  },
  health: {
    title: "Community & Data Integrations",
    rows: [
      { name: "Community Office Data", freshness: "1 day ago" },
      { name: "Member Demographics", freshness: "1 day ago" },
      { name: "SDOH Data Feed", freshness: "12 hrs ago" },
      { name: "Outreach Platform", freshness: "15 min ago" },
      { name: "Partner Portal", freshness: "1 hr ago" },
      { name: "CRM / Engagement System", freshness: "15 min ago" },
    ],
  },
};

export default function HealthEquity() { return <CoworkerDashboard config={config} />; }