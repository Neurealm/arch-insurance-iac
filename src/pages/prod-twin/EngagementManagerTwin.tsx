import { useState, useMemo } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import michaelImg from "@/assets/team/michael-brown.jpg";
import {
  Calendar, Download, Filter, Activity, Star, DollarSign, AlertTriangle, Users, Rocket, Bell,
  ChevronRight, TrendingUp, TrendingDown, ShieldCheck, Sparkles, CheckCircle2, Brain,
  Building2, Layers, Cloud, Database, Server, FileBarChart2, Briefcase, Target, Award, X,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";

/* ---------------- Types & helpers ---------------- */
type RAG = "On Track" | "At Risk" | "Breach";
type KPI = {
  id: string;
  label: string;
  icon: any;
  baseline: string;
  target: string;
  actual: string;
  forecast: string;
  status: RAG;
  trend: "up" | "down" | "flat";
  delta: string;
  unit?: string;
  supporting: { name: string; baseline: string; target: string; actual: string; forecast: string; status: RAG }[];
  widgets?: string[];
  series: { m: string; v: number }[];
};

const months30 = ["W-4","W-3","W-2","W-1","Now"];
const months90 = ["M-3","M-2","M-1","Now"];
const monthsY = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];

const mkSeries = (start: number, end: number, jitter = 1, labels = monthsY) =>
  labels.map((m, i) => ({ m, v: +(start + (end - start) * (i / (labels.length - 1)) + Math.sin(i * 1.3) * jitter).toFixed(2) }));

const ragClass = (s: RAG) =>
  s === "On Track" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
  : s === "At Risk" ? "bg-amber-50 text-amber-700 border-amber-200"
  : "bg-rose-50 text-rose-700 border-rose-200";

const sparkColor = (s: RAG) => s === "On Track" ? "#10b981" : s === "At Risk" ? "#f59e0b" : "#ef4444";

/* ---------------- Executive KPIs ---------------- */
const execKPIs: KPI[] = [
  {
    id: "sla", label: "SLA Attainment", icon: Activity,
    baseline: "96.7%", target: "99.0%", actual: "99.3%", forecast: "99.4%",
    status: "On Track", trend: "up", delta: "+1.3%",
    series: mkSeries(96.7, 99.3, 0.3),
    supporting: [
      { name: "Availability", baseline: "99.10%", target: "99.95%", actual: "99.93%", forecast: "99.96%", status: "On Track" },
      { name: "MTTR (P1)", baseline: "62 min", target: "<30 min", actual: "24 min", forecast: "21 min", status: "On Track" },
      { name: "MTTD", baseline: "14 min", target: "<8 min", actual: "6 min", forecast: "5 min", status: "On Track" },
      { name: "Change Success", baseline: "92%", target: "98%", actual: "98.8%", forecast: "99.0%", status: "On Track" },
      { name: "Escalation Volume", baseline: "18/mo", target: "<10/mo", actual: "7/mo", forecast: "6/mo", status: "On Track" },
      { name: "Incident Volume", baseline: "210/mo", target: "<150/mo", actual: "138/mo", forecast: "128/mo", status: "On Track" },
      { name: "Resolution Time", baseline: "4.6h", target: "<3h", actual: "2.4h", forecast: "2.1h", status: "On Track" },
      { name: "Response Time", baseline: "11 min", target: "<5 min", actual: "4 min", forecast: "3.6 min", status: "On Track" },
      { name: "Error Budget Burn", baseline: "62%", target: "<40%", actual: "28%", forecast: "24%", status: "On Track" },
      { name: "Customer Impact Events", baseline: "7/mo", target: "<3/mo", actual: "2/mo", forecast: "1/mo", status: "On Track" },
    ],
    widgets: ["SLA trend chart", "Service heat map", "Breach forecast", "Executive SLA scorecard"],
  },
  {
    id: "csat", label: "Customer Satisfaction", icon: Star,
    baseline: "4.2", target: "4.5", actual: "4.6", forecast: "4.7",
    status: "On Track", trend: "up", delta: "+0.4",
    series: mkSeries(4.2, 4.6, 0.08),
    supporting: [
      { name: "CSAT", baseline: "4.2", target: "4.5", actual: "4.6", forecast: "4.7", status: "On Track" },
      { name: "NPS", baseline: "32", target: "50", actual: "58", forecast: "62", status: "On Track" },
      { name: "Survey Volume", baseline: "420/mo", target: "600/mo", actual: "712/mo", forecast: "780/mo", status: "On Track" },
      { name: "Escalations", baseline: "18/mo", target: "<10", actual: "7", forecast: "6", status: "On Track" },
      { name: "Executive Feedback", baseline: "4.0", target: "4.5", actual: "4.7", forecast: "4.8", status: "On Track" },
      { name: "QBR Feedback", baseline: "3.9", target: "4.5", actual: "4.6", forecast: "4.7", status: "On Track" },
      { name: "User Sentiment", baseline: "68%", target: "85%", actual: "88%", forecast: "90%", status: "On Track" },
      { name: "Ticket Satisfaction", baseline: "4.1", target: "4.5", actual: "4.6", forecast: "4.7", status: "On Track" },
      { name: "Product Experience", baseline: "4.0", target: "4.4", actual: "4.5", forecast: "4.6", status: "On Track" },
      { name: "Adoption Rate", baseline: "62%", target: "80%", actual: "82%", forecast: "87%", status: "On Track" },
    ],
    widgets: ["Sentiment trend", "Survey analytics", "Relationship health score"],
  },
  {
    id: "budget", label: "Budget Performance", icon: DollarSign,
    baseline: "-2.1%", target: "On Budget", actual: "+3.8%", forecast: "+5.2%",
    status: "On Track", trend: "up", delta: "$312K",
    series: mkSeries(-2.1, 5.2, 0.6),
    supporting: [
      { name: "Labor Spend", baseline: "$4.20M", target: "$4.10M", actual: "$3.96M", forecast: "$3.92M", status: "On Track" },
      { name: "Vendor Spend", baseline: "$1.40M", target: "$1.32M", actual: "$1.32M", forecast: "$1.30M", status: "On Track" },
      { name: "Cloud Spend", baseline: "$2.60M", target: "$2.45M", actual: "$2.30M", forecast: "$2.20M", status: "On Track" },
      { name: "Licensing", baseline: "$680K", target: "$640K", actual: "$610K", forecast: "$600K", status: "On Track" },
      { name: "Savings Delivered", baseline: "$0.5M", target: "$1.0M", actual: "$1.24M", forecast: "$1.45M", status: "On Track" },
      { name: "Cost Avoidance", baseline: "$0.4M", target: "$0.7M", actual: "$0.78M", forecast: "$0.92M", status: "On Track" },
      { name: "Margin", baseline: "18%", target: "22%", actual: "24%", forecast: "26%", status: "On Track" },
      { name: "Burn Rate", baseline: "$310K/mo", target: "$280K/mo", actual: "$262K/mo", forecast: "$254K/mo", status: "On Track" },
      { name: "Forecast Accuracy", baseline: "82%", target: "95%", actual: "97%", forecast: "98%", status: "On Track" },
      { name: "Revenue Protected", baseline: "$0.9M", target: "$1.1M", actual: "$1.20M", forecast: "$1.32M", status: "On Track" },
    ],
    widgets: ["Waterfall chart", "Budget variance", "Forecast model"],
  },
  {
    id: "risks", label: "Open Risks", icon: AlertTriangle,
    baseline: "12", target: "<10", actual: "8", forecast: "6",
    status: "On Track", trend: "down", delta: "-4",
    series: mkSeries(12, 6, 0.8),
    supporting: [
      { name: "Operational Risks", baseline: "4", target: "<3", actual: "2", forecast: "1", status: "On Track" },
      { name: "Security Risks", baseline: "3", target: "<2", actual: "2", forecast: "1", status: "At Risk" },
      { name: "Financial Risks", baseline: "1", target: "0", actual: "1", forecast: "0", status: "At Risk" },
      { name: "Resource Risks", baseline: "2", target: "<2", actual: "1", forecast: "1", status: "On Track" },
      { name: "Vendor Risks", baseline: "1", target: "0", actual: "1", forecast: "0", status: "At Risk" },
      { name: "Program Risks", baseline: "1", target: "0", actual: "0", forecast: "0", status: "On Track" },
      { name: "Compliance Risks", baseline: "1", target: "0", actual: "0", forecast: "0", status: "On Track" },
      { name: "Modernization Risks", baseline: "2", target: "<2", actual: "1", forecast: "1", status: "On Track" },
      { name: "Customer Risks", baseline: "1", target: "0", actual: "0", forecast: "0", status: "On Track" },
      { name: "Escalation Risks", baseline: "1", target: "0", actual: "0", forecast: "0", status: "On Track" },
    ],
  },
  {
    id: "util", label: "Team Utilization", icon: Users,
    baseline: "72%", target: "75%", actual: "78%", forecast: "82%",
    status: "On Track", trend: "up", delta: "+6%",
    series: mkSeries(72, 82, 1.2),
    supporting: [
      { name: "Capacity", baseline: "320 pts", target: "360 pts", actual: "388 pts", forecast: "402 pts", status: "On Track" },
      { name: "PTO", baseline: "8%", target: "8%", actual: "7%", forecast: "8%", status: "On Track" },
      { name: "Bench", baseline: "12%", target: "<10%", actual: "9%", forecast: "8%", status: "On Track" },
      { name: "Overtime", baseline: "4%", target: "<3%", actual: "3.2%", forecast: "2.8%", status: "At Risk" },
      { name: "Attrition", baseline: "11%", target: "<8%", actual: "6%", forecast: "5%", status: "On Track" },
      { name: "Open Reqs", baseline: "5", target: "<3", actual: "2", forecast: "1", status: "On Track" },
      { name: "Escalations", baseline: "12", target: "<8", actual: "5", forecast: "4", status: "On Track" },
      { name: "Backlog", baseline: "180 pts", target: "<150 pts", actual: "132 pts", forecast: "120 pts", status: "On Track" },
      { name: "Productivity", baseline: "78%", target: "85%", actual: "88%", forecast: "92%", status: "On Track" },
      { name: "Employee Satisfaction", baseline: "3.9", target: "4.2", actual: "4.2", forecast: "4.4", status: "On Track" },
    ],
    widgets: ["Capacity heat map", "Staffing forecast", "Team trend analysis"],
  },
  {
    id: "mod", label: "Modernization Progress", icon: Rocket,
    baseline: "58%", target: "75%", actual: "72%", forecast: "85%",
    status: "On Track", trend: "up", delta: "+14%",
    series: mkSeries(58, 85, 1.4),
    supporting: [
      { name: "Container Adoption", baseline: "20%", target: "60%", actual: "62%", forecast: "78%", status: "On Track" },
      { name: "Cloud Migration", baseline: "45%", target: "75%", actual: "72%", forecast: "84%", status: "On Track" },
      { name: "IaC Adoption", baseline: "38%", target: "80%", actual: "76%", forecast: "88%", status: "On Track" },
      { name: "Legacy Retirement", baseline: "12%", target: "40%", actual: "34%", forecast: "48%", status: "At Risk" },
      { name: "Technical Debt Reduction", baseline: "8%", target: "25%", actual: "23%", forecast: "32%", status: "On Track" },
      { name: "Platform Standardization", baseline: "55%", target: "85%", actual: "82%", forecast: "92%", status: "On Track" },
      { name: "Automation Coverage", baseline: "30%", target: "70%", actual: "66%", forecast: "78%", status: "On Track" },
      { name: "GitOps Adoption", baseline: "22%", target: "65%", actual: "58%", forecast: "74%", status: "At Risk" },
      { name: "Service Ownership Adoption", baseline: "44%", target: "80%", actual: "76%", forecast: "88%", status: "On Track" },
      { name: "Platform Maturity", baseline: "Lvl 2", target: "Lvl 4", actual: "Lvl 3.6", forecast: "Lvl 4", status: "On Track" },
    ],
  },
  {
    id: "esc", label: "Escalations", icon: Bell,
    baseline: "7", target: "<5", actual: "3", forecast: "2",
    status: "On Track", trend: "down", delta: "-4",
    series: mkSeries(7, 2, 0.8),
    supporting: [
      { name: "P1 Escalations", baseline: "3", target: "<2", actual: "1", forecast: "1", status: "On Track" },
      { name: "P2 Escalations", baseline: "4", target: "<3", actual: "2", forecast: "1", status: "On Track" },
      { name: "Executive Escalations", baseline: "2", target: "<1", actual: "0", forecast: "0", status: "On Track" },
      { name: "Vendor Escalations", baseline: "2", target: "<1", actual: "1", forecast: "0", status: "On Track" },
      { name: "Customer Escalations", baseline: "3", target: "<2", actual: "1", forecast: "1", status: "On Track" },
    ],
  },
];

/* ---------------- Services ---------------- */
type Service = {
  id: string; name: string; owner: string; health: number; sla: RAG; risk: "Low" | "Medium" | "High"; openIssues: number;
  trend: { m: string; v: number }[];
  kpis: { name: string; baseline: string; target: string; actual: string; forecast: string; status: RAG }[];
  slas: { name: string; baseline: string; target: string; actual: string; forecast: string; status: RAG }[];
};

const services: Service[] = [
  {
    id: "caregiver", name: "Caregiver Platform", owner: "Vikram Reddy", health: 92, sla: "On Track", risk: "Low", openIssues: 2,
    trend: mkSeries(88, 94, 1.2),
    kpis: [
      { name: "Availability", baseline: "99.20%", target: "99.95%", actual: "99.94%", forecast: "99.96%", status: "On Track" },
      { name: "MTTR", baseline: "55 min", target: "<30 min", actual: "22 min", forecast: "18 min", status: "On Track" },
      { name: "MTTD", baseline: "12 min", target: "<8 min", actual: "5 min", forecast: "4 min", status: "On Track" },
      { name: "Error Rate", baseline: "0.8%", target: "<0.3%", actual: "0.2%", forecast: "0.15%", status: "On Track" },
      { name: "Deployment Success", baseline: "92%", target: "98%", actual: "99%", forecast: "99.2%", status: "On Track" },
      { name: "Caregiver Throughput", baseline: "12K/d", target: "18K/d", actual: "19.2K/d", forecast: "21K/d", status: "On Track" },
      { name: "Defect Rate", baseline: "1.2%", target: "<0.5%", actual: "0.4%", forecast: "0.3%", status: "On Track" },
      { name: "User Experience Score", baseline: "78", target: "88", actual: "91", forecast: "93", status: "On Track" },
      { name: "Incident Volume", baseline: "32/mo", target: "<20", actual: "14/mo", forecast: "11/mo", status: "On Track" },
      { name: "Capacity Utilization", baseline: "68%", target: "75%", actual: "72%", forecast: "76%", status: "On Track" },
    ],
    slas: [
      { name: "Availability SLA", baseline: "99.20%", target: "99.95%", actual: "99.94%", forecast: "99.96%", status: "On Track" },
      { name: "Resolution SLA", baseline: "88%", target: "98%", actual: "98.4%", forecast: "99%", status: "On Track" },
      { name: "Response SLA", baseline: "92%", target: "99%", actual: "99.2%", forecast: "99.4%", status: "On Track" },
      { name: "Change SLA", baseline: "94%", target: "98%", actual: "99%", forecast: "99.2%", status: "On Track" },
      { name: "Performance SLA", baseline: "91%", target: "97%", actual: "98%", forecast: "98.6%", status: "On Track" },
    ],
  },
  {
    id: "claims", name: "Claims Platform", owner: "Meera Iyer", health: 87, sla: "On Track", risk: "Medium", openIssues: 4,
    trend: mkSeries(82, 89, 1.4),
    kpis: [
      { name: "Availability", baseline: "99.10%", target: "99.95%", actual: "99.93%", forecast: "99.96%", status: "On Track" },
      { name: "MTTR", baseline: "62 min", target: "<30 min", actual: "24 min", forecast: "21 min", status: "On Track" },
      { name: "Claims Throughput", baseline: "44K/d", target: "60K/d", actual: "62K/d", forecast: "68K/d", status: "On Track" },
      { name: "Error Rate", baseline: "1.1%", target: "<0.5%", actual: "0.4%", forecast: "0.3%", status: "On Track" },
      { name: "Deployment Success", baseline: "90%", target: "97%", actual: "97.2%", forecast: "98%", status: "On Track" },
      { name: "Defect Rate", baseline: "1.4%", target: "<0.6%", actual: "0.6%", forecast: "0.5%", status: "At Risk" },
      { name: "Incident Volume (30d)", baseline: "8", target: "<5", actual: "4", forecast: "3", status: "On Track" },
      { name: "Capacity Utilization", baseline: "72%", target: "78%", actual: "76%", forecast: "80%", status: "On Track" },
    ],
    slas: [
      { name: "Availability SLA", baseline: "99.10%", target: "99.95%", actual: "99.93%", forecast: "99.96%", status: "On Track" },
      { name: "Resolution SLA", baseline: "86%", target: "97%", actual: "97.4%", forecast: "98.2%", status: "On Track" },
      { name: "Response SLA", baseline: "90%", target: "98%", actual: "98.2%", forecast: "98.8%", status: "On Track" },
      { name: "Change SLA", baseline: "92%", target: "98%", actual: "98.6%", forecast: "99%", status: "On Track" },
      { name: "Performance SLA", baseline: "89%", target: "96%", actual: "96.4%", forecast: "97.2%", status: "On Track" },
    ],
  },
  {
    id: "payroll", name: "Payroll Platform", owner: "Aman Kumar", health: 90, sla: "On Track", risk: "Low", openIssues: 1,
    trend: mkSeries(85, 92, 1.0),
    kpis: [
      { name: "Availability", baseline: "99.15%", target: "99.95%", actual: "99.95%", forecast: "99.97%", status: "On Track" },
      { name: "Payroll Cycles Run", baseline: "98%", target: "100%", actual: "100%", forecast: "100%", status: "On Track" },
      { name: "MTTR", baseline: "48 min", target: "<30 min", actual: "20 min", forecast: "16 min", status: "On Track" },
      { name: "Error Rate", baseline: "0.6%", target: "<0.3%", actual: "0.2%", forecast: "0.15%", status: "On Track" },
    ],
    slas: [
      { name: "Availability SLA", baseline: "99.15%", target: "99.95%", actual: "99.95%", forecast: "99.97%", status: "On Track" },
      { name: "Resolution SLA", baseline: "89%", target: "98%", actual: "98.8%", forecast: "99.2%", status: "On Track" },
    ],
  },
  {
    id: "mobile", name: "Mobile Platform", owner: "Sonia Patel", health: 78, sla: "At Risk", risk: "High", openIssues: 7,
    trend: mkSeries(82, 75, 1.6),
    kpis: [
      { name: "Crash-free Sessions", baseline: "97.0%", target: "99.5%", actual: "98.6%", forecast: "99.2%", status: "At Risk" },
      { name: "P1 Incidents (30d)", baseline: "6", target: "<3", actual: "5", forecast: "3", status: "At Risk" },
      { name: "Latency p95", baseline: "780ms", target: "<400ms", actual: "510ms", forecast: "420ms", status: "At Risk" },
      { name: "Deployment Success", baseline: "88%", target: "97%", actual: "93%", forecast: "96%", status: "At Risk" },
    ],
    slas: [
      { name: "Availability SLA", baseline: "99.0%", target: "99.9%", actual: "99.6%", forecast: "99.8%", status: "At Risk" },
    ],
  },
  {
    id: "provider", name: "Provider Portal", owner: "Daniel Martinez", health: 91, sla: "On Track", risk: "Low", openIssues: 2,
    trend: mkSeries(86, 92, 1.1), kpis: [], slas: [],
  },
  {
    id: "identity", name: "Identity Services", owner: "Neha Gupta", health: 88, sla: "On Track", risk: "Medium", openIssues: 3,
    trend: mkSeries(84, 90, 1.0), kpis: [], slas: [],
  },
  {
    id: "cloud", name: "Cloud Platform", owner: "Arun Thomas", health: 93, sla: "On Track", risk: "Low", openIssues: 1,
    trend: mkSeries(86, 94, 1.2), kpis: [], slas: [],
  },
];

/* ---------------- Workstreams ---------------- */
const workstreams = [
  { name: "Operations", icon: Activity, teamSize: 6, capacity: "120 pts", utilization: 82, openTasks: 14, escalations: 1, csat: "4.4 / 5", score: 88,
    kpis: [
      { name: "Ticket Volume", baseline: "1.2K", target: "1.0K", actual: "920", forecast: "880", status: "On Track" as RAG },
      { name: "MTTR", baseline: "4.6h", target: "<3h", actual: "2.4h", forecast: "2.1h", status: "On Track" as RAG },
      { name: "Backlog", baseline: "180", target: "<150", actual: "132", forecast: "120", status: "On Track" as RAG },
      { name: "Escalations", baseline: "8", target: "<5", actual: "2", forecast: "1", status: "On Track" as RAG },
      { name: "Capacity", baseline: "100 pts", target: "120 pts", actual: "120 pts", forecast: "128 pts", status: "On Track" as RAG },
      { name: "SLA Compliance", baseline: "93%", target: "99%", actual: "99.3%", forecast: "99.4%", status: "On Track" as RAG },
      { name: "Automation Coverage", baseline: "30%", target: "70%", actual: "66%", forecast: "78%", status: "On Track" as RAG },
      { name: "Customer Satisfaction", baseline: "4.2", target: "4.5", actual: "4.6", forecast: "4.7", status: "On Track" as RAG },
    ] },
  { name: "SRE", icon: ShieldCheck, teamSize: 4, capacity: "80 pts", utilization: 78, openTasks: 9, escalations: 0, csat: "4.6 / 5", score: 91,
    kpis: [
      { name: "SLO Compliance", baseline: "88%", target: "98%", actual: "98.6%", forecast: "99%", status: "On Track" as RAG },
      { name: "Error Budget", baseline: "62%", target: "<40%", actual: "28%", forecast: "24%", status: "On Track" as RAG },
      { name: "Reliability Score", baseline: "78", target: "92", actual: "94", forecast: "96", status: "On Track" as RAG },
      { name: "Observability Coverage", baseline: "60%", target: "90%", actual: "92%", forecast: "96%", status: "On Track" as RAG },
      { name: "Runbook Coverage", baseline: "55%", target: "90%", actual: "88%", forecast: "94%", status: "On Track" as RAG },
      { name: "Incident Prevention", baseline: "12%", target: "30%", actual: "34%", forecast: "40%", status: "On Track" as RAG },
      { name: "Automation Rate", baseline: "32%", target: "70%", actual: "66%", forecast: "78%", status: "On Track" as RAG },
      { name: "Service Health", baseline: "82", target: "92", actual: "94", forecast: "96", status: "On Track" as RAG },
    ] },
  { name: "Platform Engineering", icon: Layers, teamSize: 4, capacity: "80 pts", utilization: 85, openTasks: 11, escalations: 1, csat: "4.3 / 5", score: 84,
    kpis: [
      { name: "IaC Coverage", baseline: "38%", target: "85%", actual: "82%", forecast: "92%", status: "On Track" as RAG },
      { name: "Platform Availability", baseline: "99.10%", target: "99.95%", actual: "99.96%", forecast: "99.97%", status: "On Track" as RAG },
      { name: "Developer Satisfaction", baseline: "3.8", target: "4.3", actual: "4.4", forecast: "4.6", status: "On Track" as RAG },
      { name: "Environment Provisioning", baseline: "5d", target: "<1d", actual: "6h", forecast: "4h", status: "On Track" as RAG },
      { name: "Container Adoption", baseline: "20%", target: "60%", actual: "62%", forecast: "78%", status: "On Track" as RAG },
      { name: "Golden Image Compliance", baseline: "70%", target: "98%", actual: "96%", forecast: "99%", status: "At Risk" as RAG },
      { name: "GitOps Adoption", baseline: "22%", target: "65%", actual: "58%", forecast: "74%", status: "At Risk" as RAG },
      { name: "Technical Debt", baseline: "High", target: "Low", actual: "Medium", forecast: "Low", status: "On Track" as RAG },
    ] },
  { name: "Cloud Engineering", icon: Cloud, teamSize: 3, capacity: "60 pts", utilization: 70, openTasks: 8, escalations: 0, csat: "4.7 / 5", score: 92,
    kpis: [
      { name: "Cloud Spend", baseline: "$2.60M", target: "$2.45M", actual: "$2.30M", forecast: "$2.20M", status: "On Track" as RAG },
      { name: "Utilization", baseline: "58%", target: "75%", actual: "72%", forecast: "78%", status: "On Track" as RAG },
      { name: "Reserved Instance Coverage", baseline: "42%", target: "70%", actual: "74%", forecast: "82%", status: "On Track" as RAG },
      { name: "Savings Plan Coverage", baseline: "30%", target: "60%", actual: "62%", forecast: "70%", status: "On Track" as RAG },
      { name: "Cost Per Application", baseline: "$24K", target: "$18K", actual: "$16K", forecast: "$14K", status: "On Track" as RAG },
      { name: "Resource Efficiency", baseline: "62%", target: "82%", actual: "84%", forecast: "88%", status: "On Track" as RAG },
      { name: "Cloud Risk Score", baseline: "62", target: "<40", actual: "32", forecast: "26", status: "On Track" as RAG },
      { name: "Optimization Opportunities", baseline: "$120K", target: "$300K", actual: "$340K", forecast: "$420K", status: "On Track" as RAG },
    ] },
  { name: "Security", icon: ShieldCheck, teamSize: 2, capacity: "40 pts", utilization: 65, openTasks: 6, escalations: 1, csat: "4.5 / 5", score: 87,
    kpis: [
      { name: "Critical Vulnerabilities", baseline: "12", target: "0", actual: "1", forecast: "0", status: "At Risk" as RAG },
      { name: "Patch Compliance", baseline: "82%", target: "98%", actual: "97%", forecast: "99%", status: "At Risk" as RAG },
      { name: "Threat Detection", baseline: "78%", target: "95%", actual: "96%", forecast: "98%", status: "On Track" as RAG },
      { name: "EDR Coverage", baseline: "84%", target: "100%", actual: "99%", forecast: "100%", status: "On Track" as RAG },
      { name: "Risk Score", baseline: "62", target: "<40", actual: "34", forecast: "28", status: "On Track" as RAG },
      { name: "Compliance Findings", baseline: "18", target: "<5", actual: "3", forecast: "2", status: "On Track" as RAG },
      { name: "MTTC", baseline: "9d", target: "<3d", actual: "2.4d", forecast: "2d", status: "On Track" as RAG },
      { name: "Attack Surface", baseline: "High", target: "Low", actual: "Medium", forecast: "Low", status: "On Track" as RAG },
    ] },
  { name: "Application Support", icon: Briefcase, teamSize: 2, capacity: "40 pts", utilization: 75, openTasks: 15, escalations: 0, csat: "4.2 / 5", score: 82, kpis: [] },
  { name: "ITSM", icon: FileBarChart2, teamSize: 1, capacity: "20 pts", utilization: 60, openTasks: 7, escalations: 0, csat: "4.4 / 5", score: 85, kpis: [] },
];

/* ---------------- Initiatives ---------------- */
type Initiative = { id: string; name: string; status: "On Track" | "At Risk" | "Escalated" | "Blocked" | "Completed"; baseline: string; target: string; actual: string; forecast: string; note?: string; };
const initiatives: Initiative[] = [
  { id: "i1", name: "Kubernetes Upgrade Program", status: "On Track", baseline: "30%", target: "100%", actual: "90%", forecast: "100%" },
  { id: "i2", name: "Observability Expansion",    status: "On Track", baseline: "40%", target: "100%", actual: "75%", forecast: "100%" },
  { id: "i3", name: "Cloud Cost Optimization",    status: "On Track", baseline: "$0", target: "$1.2M", actual: "$1.24M", forecast: "$1.45M" },
  { id: "i4", name: "ITSM Process Improvement",   status: "On Track", baseline: "55%", target: "100%", actual: "85%", forecast: "100%" },
  { id: "i5", name: "Legacy App Modernization",   status: "At Risk",  baseline: "10%", target: "80%", actual: "60%", forecast: "78%", note: "Waiting on schedule" },
  { id: "i6", name: "Mobile Platform Enhancement",status: "At Risk",  baseline: "12%", target: "75%", actual: "55%", forecast: "70%", note: "Behind schedule" },
  { id: "i7", name: "Database Performance Program",status: "At Risk", baseline: "8%",  target: "70%", actual: "48%", forecast: "65%", note: "Risk of delay" },
  { id: "i8", name: "Provider Portal Outage Remediation", status: "Escalated", baseline: "0%", target: "100%", actual: "40%", forecast: "100%", note: "P1 – Executive Escalation" },
  { id: "i9", name: "Security Vulnerability Remediation", status: "Escalated", baseline: "0%", target: "100%", actual: "62%", forecast: "100%", note: "High severity" },
  { id: "i10", name: "Data Center Migration",     status: "Blocked",  baseline: "10%", target: "60%", actual: "22%", forecast: "55%", note: "Dependency delay" },
  { id: "i11", name: "Third Party Integration",   status: "Blocked",  baseline: "0%",  target: "80%", actual: "12%", forecast: "60%", note: "Vendor delay" },
  { id: "i12", name: "CI/CD Pipeline Standardization", status: "Completed", baseline: "20%", target: "100%", actual: "100%", forecast: "100%" },
  { id: "i13", name: "Backup Modernization",      status: "Completed", baseline: "30%", target: "100%", actual: "100%", forecast: "100%" },
  { id: "i14", name: "Runbook Automation",        status: "Completed", baseline: "10%", target: "100%", actual: "100%", forecast: "100%" },
  { id: "i15", name: "Container Modernization",   status: "On Track", baseline: "18%", target: "60%", actual: "46%", forecast: "72%" },
];

/* ---------------- Customer Engagement ---------------- */
const customerMetrics = [
  { name: "Executive Meetings", baseline: "8/yr", target: "12/yr", actual: "14/yr", forecast: "16/yr", status: "On Track" as RAG, note: "Next: May 20, 2025" },
  { name: "QBR Completion",      baseline: "75%",  target: "100%", actual: "100%",  forecast: "100%",  status: "On Track" as RAG, note: "Next: May 28, 2025" },
  { name: "Steering Committee",  baseline: "Q",    target: "Monthly", actual: "Monthly", forecast: "Monthly", status: "On Track" as RAG, note: "Next: Jun 5, 2025" },
  { name: "Open Actions",        baseline: "22",   target: "<15",  actual: "12",   forecast: "8",     status: "On Track" as RAG },
  { name: "Customer Sentiment",  baseline: "68%",  target: "85%",  actual: "92%",  forecast: "94%",   status: "On Track" as RAG, note: "Positive 4.6 / 5" },
  { name: "Relationship Health", baseline: "72%",  target: "85%",  actual: "87%",  forecast: "92%",   status: "On Track" as RAG, note: "Strong" },
  { name: "Survey Response Rate",baseline: "68%",  target: "85%",  actual: "92%",  forecast: "94%",   status: "On Track" as RAG },
  { name: "Expansion Opportunities", baseline: "$0.4M", target: "$1.0M", actual: "$1.4M", forecast: "$1.8M", status: "On Track" as RAG },
  { name: "Renewal Health",      baseline: "Medium", target: "Strong", actual: "Strong", forecast: "Strong", status: "On Track" as RAG },
];

/* ---------------- Page ---------------- */
export default function EngagementManagerTwin() {
  const [panel, setPanel] = useState<null | { title: string; subtitle?: string; kpi?: KPI; service?: Service; workstream?: any; initiative?: Initiative; generic?: { name: string; baseline: string; target: string; actual: string; forecast: string; status: RAG; note?: string } }>(null);
  const close = () => setPanel(null);

  const openKPI = (k: KPI) => setPanel({ title: k.label, subtitle: "Executive KPI Drill-Down", kpi: k });
  const openService = (s: Service) => setPanel({ title: s.name, subtitle: `Owner: ${s.owner} • Service Health & SLA decomposition`, service: s });
  const openWorkstream = (w: any) => setPanel({ title: `${w.name} Team`, subtitle: "Workstream KPIs & performance", workstream: w });
  const openInitiative = (i: Initiative) => setPanel({ title: i.name, subtitle: "Initiative drill-down", initiative: i });
  const openGeneric = (g: any) => setPanel({ title: g.name, subtitle: "Customer engagement metric", generic: g });

  return (
    <AppShell title="Engagement Manager Digital Twin" subtitle="Service Delivery • Program Execution • Customer Success">
      <div className="bg-slate-50/50 min-h-screen">
        <div className="px-6 py-5 max-w-[1800px] mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engagement Manager Digital Twin</h1>
              <p className="text-sm text-slate-500 mt-1">Service Delivery • Program Execution • Customer Success</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white"><Calendar className="h-4 w-4 mr-1.5" />Last 30 Days</Button>
              <Button variant="outline" size="sm" className="bg-white"><Filter className="h-4 w-4 mr-1.5" />Filters</Button>
              <Button variant="outline" size="sm" className="bg-white"><Download className="h-4 w-4 mr-1.5" />Export</Button>
            </div>
          </div>

          {/* Top: Profile (left) + KPI strip (right) */}
          <div className="grid grid-cols-12 gap-4">
            {/* Profile */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="relative">
                  <img src={michaelImg} alt="Michael Brown" className="w-full h-56 object-cover" loading="lazy" />
                  <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-0 shadow"><span className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 inline-block" />Online</Badge>
                </div>
                <div className="p-4">
                  <div className="text-[17px] font-bold text-slate-900">Michael Brown</div>
                  <div className="text-sm text-indigo-600 font-medium">Engagement Manager</div>
                  <div className="text-xs text-slate-500 mt-0.5">Service Delivery</div>
                  <div className="text-xs text-slate-500">SRE & Modernization Services</div>
                  <div className="text-xs text-slate-500 mt-1">Customer: <span className="font-semibold text-slate-700">HHAX</span></div>
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 gap-1.5 text-[12px]">
                    {[
                      { i: Users, l: "Team Size", v: "22" },
                      { i: Briefcase, l: "Services Managed", v: "47" },
                      { i: DollarSign, l: "Annual Contract Value", v: "$8.4M" },
                      { i: Building2, l: "Locations Supported", v: "US + India" },
                      { i: Activity, l: "Coverage Model", v: "24x7" },
                    ].map(({ i: Icon, l, v }) => (
                      <div key={l} className="flex items-center justify-between py-1">
                        <span className="flex items-center gap-1.5 text-slate-500"><Icon className="h-3.5 w-3.5" />{l}</span>
                        <span className="font-semibold text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certs */}
              <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-2">Experience & Certifications</div>
                <div className="text-xs text-slate-600 mb-3">Years Experience <span className="float-right font-semibold text-slate-800">12+ Years</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {["ITIL 4 MP","SAFe 6 Agilist","PMP","AWS SAA","CSM","COBIT 2019"].map(c => (
                    <Badge key={c} variant="outline" className="text-[10px] bg-slate-50 border-slate-200">{c}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Customer Sat</div>
                    <div className="text-xl font-bold text-slate-900">4.6<span className="text-xs text-slate-400"> / 5</span></div>
                    <div className="text-amber-400 text-xs">★★★★★</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold">Employee Sat</div>
                    <div className="text-xl font-bold text-slate-900">4.2<span className="text-xs text-slate-400"> / 5</span></div>
                    <div className="text-amber-400 text-xs">★★★★☆</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI strip + main content middle column */}
            <div className="col-span-12 lg:col-span-9 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {execKPIs.map((k) => {
                  const Icon = k.icon;
                  const arrow = k.trend === "up" ? TrendingUp : k.trend === "down" ? TrendingDown : Activity;
                  const Ar = arrow;
                  return (
                    <button key={k.id} onClick={() => openKPI(k)}
                      className="text-left bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition">
                      <div className="flex items-center justify-between">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 grid place-items-center"><Icon className="h-3.5 w-3.5 text-slate-600" /></div>
                        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wide leading-tight text-right">{k.label}</div>
                      </div>
                      <div className="mt-2 text-[20px] font-bold text-slate-900 leading-none">{k.actual}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Target {k.target}</span>
                        <span>Baseline {k.baseline}</span>
                      </div>
                      <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${k.status === "On Track" ? "text-emerald-600" : k.status === "At Risk" ? "text-amber-600" : "text-rose-600"}`}>
                        <Ar className="h-3 w-3" />{k.delta} <span className="text-slate-400 font-normal ml-auto">Fcst {k.forecast}</span>
                      </div>
                      <div className="h-7 -mx-1 mt-1">
                        <ResponsiveContainer>
                          <AreaChart data={k.series}>
                            <defs>
                              <linearGradient id={`g-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={sparkColor(k.status)} stopOpacity={0.35} />
                                <stop offset="100%" stopColor={sparkColor(k.status)} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke={sparkColor(k.status)} strokeWidth={1.5} fill={`url(#g-${k.id})`} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Service Delivery Health + AI Advisor + Right rail */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 xl:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-slate-500" />
                      <div className="text-[11px] uppercase tracking-wide font-bold text-slate-700">Service Delivery Health Center</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600">View All Services →</Button>
                  </div>
                  <div className="px-4 py-2 grid grid-cols-12 text-[10px] uppercase tracking-wide font-bold text-slate-400 border-b border-slate-100">
                    <div className="col-span-4">Service / Platform</div>
                    <div className="col-span-1 text-center">Health</div>
                    <div className="col-span-2">SLA Status</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-1">Risk</div>
                    <div className="col-span-1 text-center">Issues</div>
                    <div className="col-span-1 text-right">Trend</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {services.map(s => (
                      <button key={s.id} onClick={() => openService(s)}
                        className="w-full px-4 py-2.5 grid grid-cols-12 items-center text-sm hover:bg-blue-50/40 transition text-left">
                        <div className="col-span-4 flex items-center gap-2 font-medium text-slate-800">
                          <Database className="h-3.5 w-3.5 text-slate-400" />{s.name}
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`inline-grid place-items-center h-7 w-7 rounded-full text-[11px] font-bold border-2 ${
                            s.health >= 90 ? "border-emerald-400 text-emerald-700" : s.health >= 80 ? "border-amber-400 text-amber-700" : "border-rose-400 text-rose-700"
                          }`}>{s.health}</span>
                        </div>
                        <div className="col-span-2"><Badge className={`${ragClass(s.sla)} text-[10px] border`}>{s.sla}</Badge></div>
                        <div className="col-span-2 text-slate-600 text-xs">{s.owner}</div>
                        <div className="col-span-1">
                          <Badge className={`text-[10px] border ${
                            s.risk === "Low" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : s.risk === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>{s.risk}</Badge>
                        </div>
                        <div className="col-span-1 text-center text-slate-700 font-semibold">{s.openIssues}</div>
                        <div className="col-span-1 h-7">
                          <ResponsiveContainer><LineChart data={s.trend}><Line type="monotone" dataKey="v" stroke={s.sla === "On Track" ? "#10b981" : "#f59e0b"} strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Delivery Advisor */}
                <div className="col-span-12 xl:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-indigo-500" />
                      <div className="text-[11px] uppercase tracking-wide font-bold text-slate-700">AI Delivery Advisor</div>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[9px] border">BETA</Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Executive Summary</div>
                      <p className="text-slate-700 leading-snug">
                        Delivery performance remains on target. SLA attainment exceeds target by 1.3%. Cloud modernization
                        program is progressing ahead of schedule. Current risk concentration exists within legacy SQL Server
                        environments and staffing constraints in Platform Engineering.
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Recommended Actions</div>
                      <ol className="space-y-1.5 text-[13px] text-slate-700">
                        {[
                          "Accelerate containerization for legacy applications",
                          "Reduce technical debt backlog by 25%",
                          "Add cloud engineering capacity (2 resources)",
                          "Expand automation coverage to additional platforms",
                        ].map((a, i) => (
                          <li key={a} className="flex gap-2"><span className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-[10px] font-bold shrink-0">{i+1}</span>{a}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Confidence Score</span>
                        <span className="text-emerald-700 font-bold">92%</span>
                      </div>
                      <Progress value={92} className="h-1.5 mt-1.5" />
                      <div className="text-[10px] text-slate-400 mt-2">Insights generated: May 14, 2025 8:45 AM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Execution Board */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <ClipboardCheckIcon />
                  <div className="text-[11px] uppercase tracking-wide font-bold text-slate-700">Delivery Execution Board</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 divide-x divide-slate-100">
                  {([
                    { label: "On Track", color: "emerald", status: "On Track" as const },
                    { label: "At Risk", color: "amber", status: "At Risk" as const },
                    { label: "Escalated", color: "rose", status: "Escalated" as const },
                    { label: "Blocked", color: "slate", status: "Blocked" as const },
                    { label: "Completed", color: "blue", status: "Completed" as const },
                  ]).map(col => {
                    const items = initiatives.filter(i => i.status === col.status);
                    return (
                      <div key={col.label} className="p-3 min-h-[180px]">
                        <div className={`text-[10px] uppercase font-bold mb-2 text-${col.color}-700`}>{col.label} ({items.length})</div>
                        <div className="space-y-2">
                          {items.slice(0, 3).map(i => (
                            <button key={i.id} onClick={() => openInitiative(i)}
                              className="w-full text-left p-2 rounded-md border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition">
                              <div className="text-[12px] font-semibold text-slate-800 leading-tight">{i.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{i.note || `${i.actual} • Fcst ${i.forecast}`}</div>
                            </button>
                          ))}
                          {items.length > 3 && <div className="text-[10px] text-slate-400">+ {items.length - 3} more</div>}
                          {items.length === 0 && <div className="text-[10px] text-slate-400">+ 0 more</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance + Customer Engagement */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <div className="text-[11px] uppercase tracking-wide font-bold text-slate-700">Team Performance by Workstream</div>
                </div>
              </div>
              <div className="px-4 py-2 grid grid-cols-12 text-[10px] uppercase tracking-wide font-bold text-slate-400 border-b border-slate-100">
                <div className="col-span-3">Workstream</div>
                <div className="col-span-1 text-center">Team</div>
                <div className="col-span-3">Capacity / Utilization</div>
                <div className="col-span-1 text-center">Open</div>
                <div className="col-span-1 text-center">Esc</div>
                <div className="col-span-1 text-center">CSAT</div>
                <div className="col-span-2 text-right">Performance</div>
              </div>
              <div className="divide-y divide-slate-100">
                {workstreams.map(w => {
                  const Icon = w.icon;
                  return (
                    <button key={w.name} onClick={() => openWorkstream(w)}
                      className="w-full px-4 py-2.5 grid grid-cols-12 items-center text-sm hover:bg-blue-50/40 transition text-left">
                      <div className="col-span-3 flex items-center gap-2 font-medium text-slate-800">
                        <Icon className="h-4 w-4 text-slate-400" />{w.name}
                      </div>
                      <div className="col-span-1 text-center text-slate-700">{w.teamSize}</div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <Progress value={w.utilization} className="h-1.5 flex-1" />
                          <span className="text-[11px] text-slate-500 w-16">{w.capacity} {w.utilization}%</span>
                        </div>
                      </div>
                      <div className="col-span-1 text-center text-slate-700">{w.openTasks}</div>
                      <div className="col-span-1 text-center text-slate-700">{w.escalations}</div>
                      <div className="col-span-1 text-center text-slate-700 text-xs">{w.csat}</div>
                      <div className="col-span-2 text-right">
                        <span className={`inline-grid place-items-center h-7 w-7 rounded-full text-[11px] font-bold border-2 ${
                          w.score >= 90 ? "border-emerald-400 text-emerald-700" : w.score >= 80 ? "border-amber-400 text-amber-700" : "border-rose-400 text-rose-700"
                        }`}>{w.score}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Engagement */}
            <div className="col-span-12 xl:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-500" />
                  <div className="text-[11px] uppercase tracking-wide font-bold text-slate-700">Customer Engagement</div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">View All</Button>
              </div>
              <div className="divide-y divide-slate-100">
                {customerMetrics.slice(0,8).map(m => (
                  <button key={m.name} onClick={() => openGeneric(m)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-blue-50/40 transition text-left">
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">{m.name}</div>
                      <div className="text-[10px] text-slate-500">{m.note || `Target ${m.target} • Baseline ${m.baseline}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-bold text-slate-900">{m.actual}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Fcst {m.forecast}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Management Strip */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <div className="text-[11px] uppercase tracking-wide font-bold text-slate-700">Financial Management</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">View Details</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
              {[
                { l: "Budget (YTD)", v: "$3.12M", sub: "of $8.40M", pct: 37 },
                { l: "Forecast (FY)", v: "$8.21M", sub: "vs $8.40M", pct: 97 },
                { l: "Burn Rate", v: "$262K", sub: "↓ 4.3%" },
                { l: "Savings Delivered", v: "$1.24M", sub: "↑ 18% vs baseline" },
                { l: "Cost Avoidance", v: "$780K", sub: "↑ 21% vs baseline" },
                { l: "Cloud Optimization", v: "$640K", sub: "↑ 16% vs baseline" },
                { l: "Revenue Protected", v: "$1.20M", sub: "" },
              ].map(c => (
                <div key={c.l} className="border border-slate-100 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">{c.l}</div>
                  <div className="text-[18px] font-bold text-slate-900 mt-0.5">{c.v}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{c.sub}</div>
                  {c.pct !== undefined && <Progress value={c.pct} className="h-1 mt-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Principles */}
          <div className="bg-slate-900 text-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div className="font-bold text-[11px] uppercase tracking-wide opacity-80">Delivery Principles</div>
              {[
                { t: "Customer First", s: "Outcome Focused" },
                { t: "Reliability by Design", s: "Prevent, Detect, Resolve" },
                { t: "Automation First", s: "Reduce Manual Work" },
                { t: "Data Driven Decisions", s: "Measure, Learn, Improve" },
              ].map(p => (
                <div key={p.t} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                  <div>
                    <div className="font-semibold">{p.t}</div>
                    <div className="text-[11px] opacity-70">{p.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Intelligence Panel */}
      <Sheet open={!!panel} onOpenChange={(o) => !o && close()}>
        <SheetContent side="right" className="w-full sm:max-w-[640px] overflow-y-auto p-0">
          {panel && (
            <div>
              <SheetHeader className="px-5 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SheetTitle className="text-base font-bold text-slate-900">{panel.title}</SheetTitle>
                    {panel.subtitle && <SheetDescription className="text-xs text-slate-500 mt-0.5">{panel.subtitle}</SheetDescription>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={close} className="h-7 w-7"><X className="h-4 w-4" /></Button>
                </div>
              </SheetHeader>
              <div className="p-5 space-y-5">
                {/* KPI Drill */}
                {panel.kpi && <KPIDrill kpi={panel.kpi} />}
                {panel.service && <ServiceDrill service={panel.service} />}
                {panel.workstream && <WorkstreamDrill ws={panel.workstream} />}
                {panel.initiative && <InitiativeDrill i={panel.initiative} />}
                {panel.generic && <GenericDrill g={panel.generic} />}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function ClipboardCheckIcon() {
  return <CheckCircle2 className="h-4 w-4 text-slate-500" />;
}

/* ---------- Drill Components ---------- */
function ScoreRow({ label, baseline, target, actual, forecast, status }: { label: string; baseline: string; target: string; actual: string; forecast: string; status: RAG; }) {
  return (
    <div className="grid grid-cols-12 text-[12px] py-1.5 border-b border-slate-100 last:border-0 items-center">
      <div className="col-span-4 text-slate-700 font-medium">{label}</div>
      <div className="col-span-2 text-slate-500">{baseline}</div>
      <div className="col-span-2 text-slate-500">{target}</div>
      <div className="col-span-2 text-slate-900 font-semibold">{actual}</div>
      <div className="col-span-1 text-emerald-700 font-semibold">{forecast}</div>
      <div className="col-span-1 text-right"><Badge className={`${ragClass(status)} text-[9px] border px-1.5`}>{status}</Badge></div>
    </div>
  );
}
function ScoreHeader() {
  return (
    <div className="grid grid-cols-12 text-[9px] uppercase tracking-wide font-bold text-slate-400 pb-1 border-b border-slate-200">
      <div className="col-span-4">KPI</div>
      <div className="col-span-2">Baseline</div>
      <div className="col-span-2">Target</div>
      <div className="col-span-2">Actual</div>
      <div className="col-span-1">Fcst</div>
      <div className="col-span-1 text-right">Status</div>
    </div>
  );
}

function KPIDrill({ kpi }: { kpi: KPI }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="supporting">Supporting</TabsTrigger>
        <TabsTrigger value="trend">Trend</TabsTrigger>
        <TabsTrigger value="ai">AI Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4 mt-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { l: "Baseline", v: kpi.baseline, c: "text-slate-700" },
            { l: "Target", v: kpi.target, c: "text-slate-700" },
            { l: "Actual", v: kpi.actual, c: "text-blue-700" },
            { l: "Forecast", v: kpi.forecast, c: "text-emerald-700" },
          ].map(b => (
            <div key={b.l} className="border border-slate-200 rounded-lg p-2.5">
              <div className="text-[9px] uppercase font-bold text-slate-500">{b.l}</div>
              <div className={`text-lg font-bold mt-0.5 ${b.c}`}>{b.v}</div>
            </div>
          ))}
        </div>
        <div className="border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">12-Month Trend (Actual vs Forecast)</div>
          <div className="h-44">
            <ResponsiveContainer>
              <AreaChart data={kpi.series}>
                <defs><linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sparkColor(kpi.status)} stopOpacity={0.4} /><stop offset="100%" stopColor={sparkColor(kpi.status)} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke={sparkColor(kpi.status)} strokeWidth={2} fill="url(#kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {kpi.widgets && (
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Widgets</div>
            <div className="flex flex-wrap gap-1.5">
              {kpi.widgets.map(w => <Badge key={w} variant="outline" className="text-[10px] bg-slate-50">{w}</Badge>)}
            </div>
          </div>
        )}
      </TabsContent>
      <TabsContent value="supporting" className="mt-4">
        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Supporting KPIs ({kpi.supporting.length})</div>
        <ScoreHeader />
        {kpi.supporting.map(s => <ScoreRow key={s.name} label={s.name} {...s} />)}
      </TabsContent>
      <TabsContent value="trend" className="mt-4 space-y-3">
        {["30 Day","90 Day","1 Year"].map((label, idx) => (
          <div key={label} className="border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</div>
            <div className="h-32">
              <ResponsiveContainer>
                <LineChart data={idx === 0 ? mkSeries(parseFloat(kpi.baseline) || 0, parseFloat(kpi.actual) || 0, 0.4, months30) : idx === 1 ? mkSeries(parseFloat(kpi.baseline) || 0, parseFloat(kpi.actual) || 0, 0.4, months90) : kpi.series}>
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={36} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke={sparkColor(kpi.status)} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="ai" className="mt-4 space-y-3 text-sm">
        {[
          { q: "What changed?", a: `${kpi.label} moved from ${kpi.baseline} → ${kpi.actual} (${kpi.delta}). Status: ${kpi.status}.` },
          { q: "Why did it change?", a: "Improved reliability engineering, targeted automation, and reduced incident volume across high-impact services." },
          { q: "What is the impact?", a: `Forecast trajectory remains positive (${kpi.forecast}). Customer SLA exposure reduced and modernization velocity preserved.` },
          { q: "What should we do next?", a: "Continue investment in observability and platform standardization; lock in gains by codifying runbooks." },
        ].map(c => (
          <div key={c.q} className="border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] uppercase font-bold text-indigo-600 mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" />{c.q}</div>
            <div className="text-slate-700 text-[13px] leading-snug">{c.a}</div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

function ServiceDrill({ service }: { service: Service }) {
  return (
    <Tabs defaultValue="kpis">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="kpis">KPIs</TabsTrigger>
        <TabsTrigger value="slas">SLAs</TabsTrigger>
        <TabsTrigger value="trend">Trend</TabsTrigger>
        <TabsTrigger value="deps">Dependencies</TabsTrigger>
      </TabsList>
      <TabsContent value="kpis" className="mt-4">
        <ScoreHeader />
        {service.kpis.length > 0 ? service.kpis.map(s => <ScoreRow key={s.name} label={s.name} {...s} />) : <div className="text-xs text-slate-500 py-3">KPI catalog being onboarded.</div>}
      </TabsContent>
      <TabsContent value="slas" className="mt-4">
        <ScoreHeader />
        {service.slas.length > 0 ? service.slas.map(s => <ScoreRow key={s.name} label={s.name} {...s} />) : <div className="text-xs text-slate-500 py-3">SLA catalog being onboarded.</div>}
      </TabsContent>
      <TabsContent value="trend" className="mt-4">
        <div className="h-44 border border-slate-200 rounded-lg p-3">
          <ResponsiveContainer>
            <AreaChart data={service.trend}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={32} />
              <Tooltip />
              <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      <TabsContent value="deps" className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {[
          { l: "Applications", v: "12 downstream" },
          { l: "Infrastructure", v: "3 clusters" },
          { l: "Cloud Services", v: "AWS / EKS / RDS" },
          { l: "Teams", v: "SRE • Platform • Ops" },
          { l: "Vendors", v: "Datadog, PagerDuty" },
          { l: "Customers", v: "HHAX • Affiliated" },
        ].map(d => (
          <div key={d.l} className="border border-slate-200 rounded-lg p-2.5">
            <div className="text-[9px] uppercase font-bold text-slate-500">{d.l}</div>
            <div className="text-slate-800 font-medium mt-0.5">{d.v}</div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

function WorkstreamDrill({ ws }: { ws: any }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { l: "Team", v: ws.teamSize },
          { l: "Capacity", v: ws.capacity },
          { l: "Utilization", v: `${ws.utilization}%` },
          { l: "Score", v: ws.score },
        ].map(b => (
          <div key={b.l} className="border border-slate-200 rounded-lg p-2.5">
            <div className="text-[9px] uppercase font-bold text-slate-500">{b.l}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{b.v}</div>
          </div>
        ))}
      </div>
      <div>
        <ScoreHeader />
        {ws.kpis?.length ? ws.kpis.map((s: any) => <ScoreRow key={s.name} label={s.name} {...s} />) : <div className="text-xs text-slate-500 py-3">Workstream KPI catalog being onboarded.</div>}
      </div>
    </div>
  );
}

function InitiativeDrill({ i }: { i: Initiative }) {
  const supporting = [
    { name: "Applications Migrated", baseline: "8", target: "40", actual: "26", forecast: "38", status: "On Track" as RAG },
    { name: "Apps Remaining", baseline: "32", target: "0", actual: "14", forecast: "2", status: "On Track" as RAG },
    { name: "Deployment Frequency", baseline: "2/wk", target: "Daily", actual: "5/wk", forecast: "Daily", status: "On Track" as RAG },
    { name: "Failure Rate", baseline: "8%", target: "<3%", actual: "2.4%", forecast: "1.8%", status: "On Track" as RAG },
    { name: "Technical Debt Removed", baseline: "$0", target: "$1M", actual: "$640K", forecast: "$1.1M", status: "On Track" as RAG },
    { name: "Cloud Savings", baseline: "$0", target: "$400K", actual: "$310K", forecast: "$520K", status: "On Track" as RAG },
    { name: "Engineering Velocity", baseline: "32 pts", target: "60 pts", actual: "54 pts", forecast: "66 pts", status: "On Track" as RAG },
    { name: "Adoption Rate", baseline: "20%", target: "75%", actual: "62%", forecast: "82%", status: "On Track" as RAG },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { l: "Baseline", v: i.baseline },
          { l: "Target", v: i.target },
          { l: "Actual", v: i.actual },
          { l: "Forecast", v: i.forecast },
        ].map(b => (
          <div key={b.l} className="border border-slate-200 rounded-lg p-2.5">
            <div className="text-[9px] uppercase font-bold text-slate-500">{b.l}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{b.v}</div>
          </div>
        ))}
      </div>
      {i.note && <div className="text-xs text-slate-600 italic">{i.note}</div>}
      <ScoreHeader />
      {supporting.map(s => <ScoreRow key={s.name} label={s.name} {...s} />)}
    </div>
  );
}

function GenericDrill({ g }: { g: any }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { l: "Baseline", v: g.baseline },
          { l: "Target", v: g.target },
          { l: "Actual", v: g.actual },
          { l: "Forecast", v: g.forecast },
        ].map(b => (
          <div key={b.l} className="border border-slate-200 rounded-lg p-2.5">
            <div className="text-[9px] uppercase font-bold text-slate-500">{b.l}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{b.v}</div>
          </div>
        ))}
      </div>
      {g.note && <div className="text-xs text-slate-600">{g.note}</div>}
      <Badge className={`${ragClass(g.status)} text-[10px] border`}>{g.status}</Badge>
    </div>
  );
}
