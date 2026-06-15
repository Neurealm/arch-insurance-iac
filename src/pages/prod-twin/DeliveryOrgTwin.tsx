import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Users, Search, ChevronRight, Activity, ShieldCheck, Cloud, Server, Wrench,
  Network, Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Target,
  DollarSign, Sparkles, GitBranch, Briefcase, Database, ArrowLeft, Filter,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import sarahMitchellAsset from "@/assets/sarah-mitchell.png.asset.json";
import amitImg from "@/assets/team/amit.jpg";
import brianImg from "@/assets/team/brian.jpg";
import oliviaImg from "@/assets/team/olivia.jpg";
import priyaNImg from "@/assets/team/priya-n.jpg";
import vikramImg from "@/assets/team/vikram.jpg";
import jchenImg from "@/assets/team/jchen.jpg";
import lauraImg from "@/assets/team/laura.jpg";
import danielImg from "@/assets/team/daniel.jpg";
import rahulImg from "@/assets/team/rahul.jpg";
import arunImg from "@/assets/team/arun.jpg";
import kevinImg from "@/assets/team/kevin.jpg";
import nehaImg from "@/assets/team/neha.jpg";
import williamImg from "@/assets/team/william.jpg";
import nicholasImg from "@/assets/team/nicholas.jpg";
import fatimaImg from "@/assets/team/fatima.jpg";
import meeraImg from "@/assets/team/meera.jpg";
import jasonImg from "@/assets/team/jason.jpg";
import amandaImg from "@/assets/team/amanda.jpg";
import michaelImg from "@/assets/team/michael.jpg";
import jenniferImg from "@/assets/team/jennifer.jpg";
import anitaImg from "@/assets/team/anita.jpg";

/* ---------- Types ---------- */
type Status = "On Track" | "At Risk" | "Escalated";
type KPI = { name: string; target: string; baseline: string; current: string; trend: "up" | "down" | "flat"; risk: "low" | "med" | "high" };
type Person = {
  id: string;
  name: string;
  title: string;
  manager: string;
  layer: string;
  workstream: string;
  team: number;
  years: number;
  status: Status;
  criticality: "Critical" | "High" | "Medium";
  avatar?: string;
  initials: string;
  responsibilities: string[];
  servicesOwned: string[];
  outcomes: string[];
  kpis: KPI[];
  peers: string[];
  reports: string[];
  budget?: string;
  forecast?: string;
  savings?: string;
  aiSummary: string;
};

/* ---------- Layers ---------- */
const LAYERS = [
  { key: "exec", label: "Executive Leadership", icon: Briefcase, color: "from-blue-900 to-blue-700" },
  { key: "svc",  label: "Service Management",   icon: Users,     color: "from-slate-700 to-slate-500" },
  { key: "sre",  label: "Site Reliability Engineering", icon: Activity, color: "from-violet-700 to-violet-500" },
  { key: "cloud",label: "Cloud & Infrastructure", icon: Cloud,   color: "from-emerald-700 to-emerald-500" },
  { key: "sec",  label: "Security & Compliance", icon: ShieldCheck, color: "from-amber-700 to-amber-500" },
  { key: "app",  label: "Application Operations", icon: Server,  color: "from-orange-700 to-orange-500" },
  { key: "plat", label: "Platform Engineering", icon: Wrench,    color: "from-cyan-700 to-cyan-500" },
  { key: "mod",  label: "Modernization",        icon: Sparkles,  color: "from-fuchsia-700 to-fuchsia-500" },
] as const;

const spark = (vals: number[]) => vals.map((y, i) => ({ x: i, y }));

/* ---------- People (22) ---------- */
const PEOPLE: Person[] = [
  // EXEC (1)
  {
    id: "sarah", name: "Sarah Mitchell", title: "Service Delivery Director", manager: "HHAX CIO",
    layer: "exec", workstream: "Executive Service Ownership", team: 22, years: 18,
    status: "On Track", criticality: "Critical", avatar: sarahMitchellAsset.url, initials: "SM",
    responsibilities: ["SLA Accountability & Service Governance", "Executive Reporting & QBR Leadership", "Roadmap Execution & Value Realization", "Risk Management & Compliance Oversight", "Vendor & Financial Management"],
    servicesOwned: ["HHAX Production Platform", "All Critical Workflows", "Modernization Program"],
    outcomes: ["Customer Satisfaction", "SLA Performance", "Executive Governance", "Modernization Success"],
    kpis: [
      { name: "Availability", target: "99.95%", baseline: "99.82%", current: "99.95%", trend: "up", risk: "low" },
      { name: "MTTR (P1)", target: "30 min", baseline: "62 min", current: "27 min", trend: "down", risk: "low" },
      { name: "SLA Attainment", target: "99%", baseline: "96.4%", current: "98.7%", trend: "up", risk: "low" },
      { name: "Customer Satisfaction", target: "4.5+", baseline: "4.1", current: "4.6", trend: "up", risk: "low" },
      { name: "Modernization Progress", target: "80%", baseline: "22%", current: "47%", trend: "up", risk: "med" },
      { name: "Cloud Savings", target: "10%", baseline: "0%", current: "7.2%", trend: "up", risk: "med" },
      { name: "Executive Escalations", target: "<5", baseline: "11", current: "3", trend: "down", risk: "low" },
      { name: "QBR Completion", target: "100%", baseline: "75%", current: "100%", trend: "up", risk: "low" },
    ],
    peers: ["HHAX CIO", "HHAX CFO"], reports: ["Amit Verma", "Jennifer Lee", "Rahul Sharma", "Priya Nair", "Michael Brown", "Anita Desai"],
    budget: "$18.7M", forecast: "$18.2M", savings: "$2.6M",
    aiSummary: "Executive ownership posture is strong. SLA attainment improved 2.3 pts QoQ. Modernization progress requires acceleration in containerization workstream to hit 80% horizon target by Q4. Recommend reallocating $420K from L2 contractor spend into platform engineering uplift.",
  },
  // SERVICE MANAGEMENT (3)
  {
    id: "amit", name: "Amit Verma", title: "Engagement Manager", manager: "Sarah Mitchell",
    layer: "svc", workstream: "Service Delivery", team: 0, years: 12, status: "On Track", criticality: "High", avatar: amitImg, initials: "AV",
    responsibilities: ["Engagement leadership", "Stakeholder management", "Delivery governance"],
    servicesOwned: ["Executive Engagement", "QBR Operations", "Stakeholder Register"],
    outcomes: ["Stakeholder Satisfaction", "Governance Cadence"],
    kpis: [
      { name: "QBR Completion", target: "100%", baseline: "82%", current: "100%", trend: "up", risk: "low" },
      { name: "Stakeholder NPS", target: "60", baseline: "44", current: "62", trend: "up", risk: "low" },
      { name: "Escalation Closure", target: "<48h", baseline: "92h", current: "39h", trend: "down", risk: "low" },
    ],
    peers: ["Jennifer Lee", "Anita Desai"], reports: [],
    aiSummary: "Engagement health is excellent. Recommend formalizing executive sponsor reviews for two at-risk acquisition tenants.",
  },
  {
    id: "brian", name: "Brian Thompson", title: "ITSM Lead", manager: "Michael Brown",
    layer: "svc", workstream: "Service Management", team: 1, years: 10, status: "On Track", criticality: "High", avatar: brianImg, initials: "BT",
    responsibilities: ["Service management", "Process governance", "Change & Release ownership"],
    servicesOwned: ["ITSM Platform", "Change Calendar", "Service Catalog"],
    outcomes: ["Process Efficiency", "Change Success"],
    kpis: [
      { name: "SLA Compliance", target: "98%", baseline: "92%", current: "97.4%", trend: "up", risk: "low" },
      { name: "Change Success", target: "98%", baseline: "91%", current: "96.8%", trend: "up", risk: "low" },
      { name: "Request Fulfillment", target: "95%", baseline: "84%", current: "93%", trend: "up", risk: "med" },
      { name: "KB Utilization", target: "70%", baseline: "31%", current: "58%", trend: "up", risk: "med" },
      { name: "Incident Volume", target: "<240/mo", baseline: "418", current: "262", trend: "down", risk: "med" },
    ],
    peers: ["Olivia Martin"], reports: ["Olivia Martin"],
    aiSummary: "ITSM maturity is climbing into Level 3. Change failure rate dropped 4.2 pts. Suggest automating standard change templates to drive request fulfillment past 95%.",
  },
  {
    id: "olivia", name: "Olivia Martin", title: "Service Desk Analyst", manager: "Brian Thompson",
    layer: "svc", workstream: "Service Management", team: 0, years: 4, status: "On Track", criticality: "Medium", avatar: oliviaImg, initials: "OM",
    responsibilities: ["Request fulfillment", "End-user support", "Knowledge curation"],
    servicesOwned: ["Service Desk", "Self-Service Portal"],
    outcomes: ["End-User Satisfaction"],
    kpis: [
      { name: "First Contact Resolution", target: "75%", baseline: "58%", current: "72%", trend: "up", risk: "med" },
      { name: "CSAT", target: "4.5", baseline: "4.1", current: "4.4", trend: "up", risk: "low" },
    ],
    peers: [], reports: [],
    aiSummary: "Strong CSAT trajectory. Encourage shifting top-10 repeat tickets into AI deflection workflows.",
  },
  // SRE (4)
  {
    id: "priya-n", name: "Priya Nair", title: "SRE Program Manager", manager: "Sarah Mitchell",
    layer: "sre", workstream: "SRE Program", team: 4, years: 11, status: "On Track", criticality: "Critical", avatar: priyaNImg, initials: "PN",
    responsibilities: ["SRE strategy & roadmap", "Reliability governance", "SLO/SLI & error budgets"],
    servicesOwned: ["SRE Operating Model", "Error Budget Policy", "Reliability Council"],
    outcomes: ["Availability", "Reliability", "Service Health"],
    kpis: [
      { name: "Availability", target: "99.95%", baseline: "99.82%", current: "99.94%", trend: "up", risk: "low" },
      { name: "Error Budget Burn", target: "<70%", baseline: "118%", current: "52%", trend: "down", risk: "low" },
      { name: "Service Ownership Adoption", target: "100%", baseline: "38%", current: "74%", trend: "up", risk: "med" },
      { name: "Postmortem Closure", target: "100%", baseline: "61%", current: "92%", trend: "up", risk: "low" },
    ],
    peers: ["Rahul Sharma", "Arun Kumar"], reports: ["Vikram Reddy", "James Chen", "Laura Green", "Daniel Martinez"],
    aiSummary: "Reliability posture trending toward SLO compliance across 8/10 tier-1 services. Caregiver Onboarding remains the dominant burn source — accelerate platform refactor.",
  },
  {
    id: "vikram", name: "Vikram Reddy", title: "SRE Lead", manager: "Priya Nair",
    layer: "sre", workstream: "Site Reliability Engineering", team: 3, years: 9, status: "On Track", criticality: "Critical", avatar: vikramImg, initials: "VR",
    responsibilities: ["Reliability strategy", "SLO/SLI & error budgets", "Major incident command"],
    servicesOwned: ["Production Reliability", "Major Incident Process", "Observability Standards"],
    outcomes: ["Availability", "Incident Prevention", "Service Health"],
    kpis: [
      { name: "Availability", target: "99.95%", baseline: "99.82%", current: "99.94%", trend: "up", risk: "low" },
      { name: "Error Budget", target: ">30%", baseline: "-18%", current: "48%", trend: "up", risk: "low" },
      { name: "MTTR", target: "30 min", baseline: "62 min", current: "27 min", trend: "down", risk: "low" },
      { name: "MTTD", target: "<5 min", baseline: "18 min", current: "4.2 min", trend: "down", risk: "low" },
      { name: "P1 Count (30d)", target: "<3", baseline: "11", current: "2", trend: "down", risk: "low" },
      { name: "P2 Count (30d)", target: "<10", baseline: "27", current: "9", trend: "down", risk: "low" },
      { name: "Automation Adoption", target: "70%", baseline: "22%", current: "58%", trend: "up", risk: "med" },
      { name: "Runbook Coverage", target: "95%", baseline: "41%", current: "84%", trend: "up", risk: "med" },
      { name: "Observability Coverage", target: "100%", baseline: "46%", current: "82%", trend: "up", risk: "med" },
      { name: "Service Health", target: ">90", baseline: "71", current: "92", trend: "up", risk: "low" },
    ],
    peers: ["Arun Kumar", "Meera Iyer"], reports: ["James Chen", "Laura Green", "Daniel Martinez"],
    aiSummary: "SRE reliability metrics are trending positively. MTTR reduced 17%. Observability coverage increased 12%. Risk concentration exists within legacy SQL Server infrastructure and manual release validation. Recommended actions: expand automation coverage, accelerate containerization, reduce alert noise, increase service ownership adoption.",
  },
  {
    id: "jchen", name: "James Chen", title: "Reliability Engineer", manager: "Vikram Reddy",
    layer: "sre", workstream: "Site Reliability Engineering", team: 0, years: 6, status: "On Track", criticality: "High", avatar: jchenImg, initials: "JC",
    responsibilities: ["SRE best practices", "Automation & tooling", "Incident prevention"],
    servicesOwned: ["Caregiver Onboarding", "Visit Verification"],
    outcomes: ["Incident Prevention", "SLO Compliance"],
    kpis: [
      { name: "Incident Prevention", target: "12/mo", baseline: "4", current: "14", trend: "up", risk: "low" },
      { name: "Alert Quality", target: ">85%", baseline: "47%", current: "82%", trend: "up", risk: "med" },
      { name: "Noise Reduction", target: "60%", baseline: "0%", current: "54%", trend: "up", risk: "med" },
      { name: "Automation Success", target: "95%", baseline: "78%", current: "93%", trend: "up", risk: "low" },
      { name: "Change Success", target: "98%", baseline: "92%", current: "97%", trend: "up", risk: "low" },
      { name: "SLO Compliance", target: "100%", baseline: "71%", current: "94%", trend: "up", risk: "med" },
    ],
    peers: ["Laura Green", "Daniel Martinez"], reports: [],
    aiSummary: "Strong proactive posture. Recommend expanding chaos game-days into Claims domain.",
  },
  {
    id: "laura", name: "Laura Green", title: "Reliability Engineer", manager: "Vikram Reddy",
    layer: "sre", workstream: "Site Reliability Engineering", team: 0, years: 5, status: "At Risk", criticality: "High", avatar: lauraImg, initials: "LG",
    responsibilities: ["Dependency mapping", "Service ownership enablement", "SLI instrumentation"],
    servicesOwned: ["Claims Adjudication", "Payroll Engine"],
    outcomes: ["Service Availability", "Dependency Mapping"],
    kpis: [
      { name: "Dependency Mapping", target: "100%", baseline: "31%", current: "68%", trend: "up", risk: "med" },
      { name: "SLO Compliance", target: "100%", baseline: "62%", current: "87%", trend: "up", risk: "med" },
      { name: "Service Availability", target: "99.9%", baseline: "99.71%", current: "99.88%", trend: "up", risk: "med" },
    ],
    peers: ["James Chen"], reports: [],
    aiSummary: "Payroll engine SLOs are at risk due to upstream batch dependency variance — recommend co-investing in DataOps observability.",
  },
  {
    id: "daniel", name: "Daniel Martinez", title: "Observability Engineer", manager: "Vikram Reddy",
    layer: "sre", workstream: "Site Reliability Engineering", team: 0, years: 7, status: "On Track", criticality: "High", avatar: danielImg, initials: "DM",
    responsibilities: ["Monitoring & alerting", "Metrics & dashboards", "Telemetry pipeline"],
    servicesOwned: ["Observability Platform", "SLO Dashboards"],
    outcomes: ["Signal Quality", "Detection Time"],
    kpis: [
      { name: "Observability Coverage", target: "100%", baseline: "46%", current: "82%", trend: "up", risk: "med" },
      { name: "Alert Quality", target: ">85%", baseline: "47%", current: "82%", trend: "up", risk: "low" },
      { name: "Telemetry Cost / Service", target: "-15%", baseline: "0%", current: "-9%", trend: "down", risk: "med" },
    ],
    peers: ["James Chen", "Laura Green"], reports: [],
    aiSummary: "Telemetry footprint optimization is on track. Recommend log-tier rebalancing in Provider domain for additional 6% savings.",
  },
  // CLOUD / INFRA (4)
  {
    id: "rahul", name: "Rahul Sharma", title: "Head of Engineering", manager: "Sarah Mitchell",
    layer: "cloud", workstream: "Engineering", team: 4, years: 16, status: "On Track", criticality: "Critical", avatar: rahulImg, initials: "RS",
    responsibilities: ["Technical leadership", "Architecture oversight", "Engineering standards"],
    servicesOwned: ["Cloud Platform", "Engineering Standards", "Architecture Review Board"],
    outcomes: ["Engineering Throughput", "Architecture Quality"],
    kpis: [
      { name: "Architecture Compliance", target: "95%", baseline: "62%", current: "89%", trend: "up", risk: "med" },
      { name: "Deployment Frequency", target: "Daily", baseline: "Weekly", current: "2/day", trend: "up", risk: "low" },
      { name: "Lead Time for Change", target: "<2 days", baseline: "11 days", current: "1.7 days", trend: "down", risk: "low" },
    ],
    peers: ["Priya Nair", "Jennifer Lee"], reports: ["Arun Kumar", "Kevin Thomas", "Neha Gupta", "William Clark"],
    aiSummary: "Engineering velocity is strong. Recommend expanding architecture review automation to remove 30% of manual review cycles.",
  },
  {
    id: "arun", name: "Arun Kumar", title: "Platform Engineering Lead", manager: "Rahul Sharma",
    layer: "plat", workstream: "Platform & Infrastructure", team: 3, years: 12, status: "On Track", criticality: "Critical", avatar: arunImg, initials: "AK",
    responsibilities: ["Platform strategy", "Infrastructure standards", "Golden image governance"],
    servicesOwned: ["Internal Developer Platform", "Golden Images", "GitOps Pipelines"],
    outcomes: ["Developer Experience", "Platform Adoption"],
    kpis: [
      { name: "IaC Coverage", target: "100%", baseline: "32%", current: "78%", trend: "up", risk: "med" },
      { name: "GitOps Adoption", target: "90%", baseline: "11%", current: "67%", trend: "up", risk: "med" },
      { name: "Golden Image Compliance", target: "100%", baseline: "44%", current: "91%", trend: "up", risk: "low" },
      { name: "Platform Uptime", target: "99.95%", baseline: "99.7%", current: "99.96%", trend: "up", risk: "low" },
      { name: "Container Adoption", target: "80%", baseline: "18%", current: "54%", trend: "up", risk: "med" },
      { name: "DevEx Score", target: ">75", baseline: "52", current: "73", trend: "up", risk: "low" },
      { name: "Env Provisioning Time", target: "<30 min", baseline: "4 days", current: "26 min", trend: "down", risk: "low" },
    ],
    peers: ["Vikram Reddy"], reports: ["Kevin Thomas", "Neha Gupta", "William Clark"],
    aiSummary: "Platform adoption is accelerating. Containerization is the critical-path bottleneck for the modernization horizon — accelerate funding by Q3.",
  },
  {
    id: "kevin", name: "Kevin Thomas", title: "Cloud Engineer", manager: "Arun Kumar",
    layer: "cloud", workstream: "Cloud Operations", team: 0, years: 8, status: "On Track", criticality: "High", avatar: kevinImg, initials: "KT",
    responsibilities: ["Cloud operations", "Automation (IaC)", "FinOps execution"],
    servicesOwned: ["AWS Landing Zone", "Cost & Tagging Governance"],
    outcomes: ["Cost Optimization", "Cloud Resilience"],
    kpis: [
      { name: "Cloud Spend", target: "-10%", baseline: "$0", current: "-7.2%", trend: "down", risk: "med" },
      { name: "Reserved Instance Coverage", target: "70%", baseline: "22%", current: "64%", trend: "up", risk: "med" },
      { name: "Savings Plans", target: "60%", baseline: "0%", current: "48%", trend: "up", risk: "med" },
      { name: "Resource Utilization", target: ">65%", baseline: "31%", current: "61%", trend: "up", risk: "med" },
      { name: "Storage Efficiency", target: "+20%", baseline: "0%", current: "+14%", trend: "up", risk: "low" },
      { name: "AWS Health", target: "Green", baseline: "Yellow", current: "Green", trend: "up", risk: "low" },
      { name: "Cloud Security Score", target: ">85", baseline: "62", current: "82", trend: "up", risk: "med" },
      { name: "Cost / Application", target: "-12%", baseline: "$0", current: "-8.4%", trend: "down", risk: "med" },
    ],
    peers: ["Neha Gupta"], reports: [],
    aiSummary: "FinOps trajectory will land at -9% by Q4. Recommend committing 1-yr savings plans on EKS + RDS for additional $310K annualized savings.",
  },
  {
    id: "neha", name: "Neha Gupta", title: "Cloud Engineer", manager: "Arun Kumar",
    layer: "cloud", workstream: "Cloud Operations", team: 0, years: 6, status: "On Track", criticality: "High", avatar: nehaImg, initials: "NG",
    responsibilities: ["Cloud automation", "Disaster recovery", "Multi-region resilience"],
    servicesOwned: ["DR Runbooks", "Cross-Region Replication"],
    outcomes: ["Cloud Resilience", "Recovery Posture"],
    kpis: [
      { name: "RTO Compliance", target: "100%", baseline: "62%", current: "94%", trend: "up", risk: "med" },
      { name: "DR Test Cadence", target: "Quarterly", baseline: "Annual", current: "Quarterly", trend: "up", risk: "low" },
    ],
    peers: ["Kevin Thomas"], reports: [],
    aiSummary: "DR posture is materially improved. Recommend chaos-injection in non-prod ahead of next acquisition cutover.",
  },
  {
    id: "william", name: "William Clark", title: "Systems Engineer", manager: "Arun Kumar",
    layer: "cloud", workstream: "Platform & Infrastructure", team: 0, years: 14, status: "On Track", criticality: "Medium", avatar: williamImg, initials: "WC",
    responsibilities: ["Systems administration", "Capacity & performance"],
    servicesOwned: ["Linux Estate", "Windows Estate", "Capacity Plan"],
    outcomes: ["Capacity Planning", "Performance"],
    kpis: [
      { name: "Capacity Headroom", target: ">25%", baseline: "8%", current: "27%", trend: "up", risk: "low" },
      { name: "Patch Compliance", target: ">95%", baseline: "71%", current: "94%", trend: "up", risk: "med" },
    ],
    peers: ["Kevin Thomas", "Neha Gupta"], reports: [],
    aiSummary: "Capacity posture is healthy. Recommend retiring 7 idle legacy hosts identified by FinOps scan.",
  },
  // SECURITY (2)
  {
    id: "nicholas", name: "Nicholas James", title: "Security Lead", manager: "Sarah Mitchell",
    layer: "sec", workstream: "Security & Compliance", team: 1, years: 13, status: "On Track", criticality: "Critical", avatar: nicholasImg, initials: "NJ",
    responsibilities: ["Security governance", "Risk & compliance", "Threat detection ownership"],
    servicesOwned: ["SOC", "Compliance Program", "Vulnerability Management"],
    outcomes: ["Risk Reduction", "Compliance", "Threat Detection"],
    kpis: [
      { name: "Critical Vulnerabilities", target: "0", baseline: "47", current: "2", trend: "down", risk: "low" },
      { name: "Patch Compliance", target: ">95%", baseline: "71%", current: "94%", trend: "up", risk: "med" },
      { name: "EDR Coverage", target: "100%", baseline: "78%", current: "99%", trend: "up", risk: "low" },
      { name: "Security Events / day", target: "<200", baseline: "1,420", current: "184", trend: "down", risk: "low" },
      { name: "Threat Detections", target: ">90% TP", baseline: "62%", current: "89%", trend: "up", risk: "med" },
      { name: "Mean Time To Contain", target: "<30 min", baseline: "4h", current: "26 min", trend: "down", risk: "low" },
      { name: "Compliance Findings", target: "0", baseline: "31", current: "1", trend: "down", risk: "low" },
      { name: "Risk Score", target: "<25", baseline: "78", current: "22", trend: "down", risk: "low" },
    ],
    peers: ["Vikram Reddy"], reports: ["Fatima Ali"],
    aiSummary: "Cyber posture is materially de-risked. Recommend formalizing HITRUST control mapping ahead of next PE transaction readiness review.",
  },
  {
    id: "fatima", name: "Fatima Ali", title: "Security Engineer", manager: "Nicholas James",
    layer: "sec", workstream: "Security & Compliance", team: 0, years: 5, status: "On Track", criticality: "High", avatar: fatimaImg, initials: "FA",
    responsibilities: ["Security monitoring", "Vulnerability mgmt"],
    servicesOwned: ["Vulnerability Scanner", "EDR Console"],
    outcomes: ["Threat Detection", "Vulnerability Closure"],
    kpis: [
      { name: "Vuln Closure SLA", target: ">95%", baseline: "61%", current: "92%", trend: "up", risk: "med" },
      { name: "EDR Coverage", target: "100%", baseline: "78%", current: "99%", trend: "up", risk: "low" },
    ],
    peers: [], reports: [],
    aiSummary: "Steady operational rigor. Recommend automating exception workflow for non-prod hosts.",
  },
  // APPLICATION OPS (3)
  {
    id: "meera", name: "Meera Iyer", title: "Application Support Lead", manager: "Rahul Sharma",
    layer: "app", workstream: "Application Management", team: 2, years: 11, status: "On Track", criticality: "High", avatar: meeraImg, initials: "MI",
    responsibilities: ["Application support mgmt", "Release coordination"],
    servicesOwned: ["Caregiver App", "Provider Portal", "Claims UI"],
    outcomes: ["Application Availability", "Release Stability"],
    kpis: [
      { name: "Ticket Resolution", target: ">95%", baseline: "74%", current: "93%", trend: "up", risk: "med" },
      { name: "Release Stability", target: ">98%", baseline: "88%", current: "97%", trend: "up", risk: "low" },
      { name: "Defect Closure", target: ">90%", baseline: "61%", current: "88%", trend: "up", risk: "med" },
      { name: "Application Availability", target: "99.9%", baseline: "99.71%", current: "99.92%", trend: "up", risk: "low" },
      { name: "User Satisfaction", target: ">4.5", baseline: "3.9", current: "4.5", trend: "up", risk: "low" },
    ],
    peers: ["Brian Thompson"], reports: ["Jason Lee", "Amanda White"],
    aiSummary: "Release quality is on a positive curve. Suggest formal canary policy for Visit Verification to insulate caregiver journeys.",
  },
  {
    id: "jason", name: "Jason Lee", title: "Application Support Engineer", manager: "Meera Iyer",
    layer: "app", workstream: "Application Management", team: 0, years: 4, status: "On Track", criticality: "Medium", avatar: jasonImg, initials: "JL",
    responsibilities: ["L2/L3 application support", "Issue resolution"],
    servicesOwned: ["Visit Verification", "Payroll UI"],
    outcomes: ["Ticket Aging", "Escalation Rate"],
    kpis: [
      { name: "Ticket Aging", target: "<48h", baseline: "5d", current: "41h", trend: "down", risk: "low" },
      { name: "Escalation Rate", target: "<8%", baseline: "21%", current: "7.4%", trend: "down", risk: "low" },
    ],
    peers: ["Amanda White"], reports: [],
    aiSummary: "Solid operational discipline. Encourage cross-training into Claims domain to broaden coverage.",
  },
  {
    id: "amanda", name: "Amanda White", title: "Application Support Engineer", manager: "Meera Iyer",
    layer: "app", workstream: "Application Management", team: 0, years: 3, status: "On Track", criticality: "Medium", avatar: amandaImg, initials: "AW",
    responsibilities: ["L2/L3 application support", "Issue resolution"],
    servicesOwned: ["Claims UI", "Provider Portal"],
    outcomes: ["Customer Impact", "Application Availability"],
    kpis: [
      { name: "Customer Impact", target: "<2h/mo", baseline: "11h", current: "1.7h", trend: "down", risk: "low" },
    ],
    peers: ["Jason Lee"], reports: [],
    aiSummary: "Customer-impact minutes are within target. Recommend deepening synthetic monitoring for Provider Portal.",
  },
  // OPERATIONS (Service Delivery Manager + ops staff)
  {
    id: "michael", name: "Michael Brown", title: "Service Delivery Manager", manager: "Sarah Mitchell",
    layer: "svc", workstream: "Service Delivery", team: 1, years: 14, status: "On Track", criticality: "High", avatar: michaelImg, initials: "MB",
    responsibilities: ["Service performance", "SLA management", "Continuous improvement"],
    servicesOwned: ["SLA Portfolio", "Continuous Improvement Backlog"],
    outcomes: ["SLA Performance", "Continuous Improvement"],
    kpis: [
      { name: "SLA Attainment", target: "99%", baseline: "96.4%", current: "98.7%", trend: "up", risk: "low" },
      { name: "Improvement Initiatives Closed", target: "12/qtr", baseline: "4", current: "11", trend: "up", risk: "low" },
    ],
    peers: ["Brian Thompson"], reports: ["Brian Thompson"],
    aiSummary: "Improvement throughput is up 175%. Recommend funding a dedicated automation pod to sustain velocity.",
  },
  {
    id: "jennifer", name: "Jennifer Lee", title: "Head of Operations", manager: "Sarah Mitchell",
    layer: "svc", workstream: "Operations", team: 6, years: 17, status: "On Track", criticality: "Critical", avatar: jenniferImg, initials: "JLe",
    responsibilities: ["Operational leadership", "Service delivery oversight", "Shift & team management"],
    servicesOwned: ["24x7 Ops", "NOC", "L1/L2 Support"],
    outcomes: ["Operational Stability", "Coverage"],
    kpis: [
      { name: "24x7 Coverage", target: "100%", baseline: "82%", current: "100%", trend: "up", risk: "low" },
      { name: "Ops Staff Attrition", target: "<10%", baseline: "22%", current: "8%", trend: "down", risk: "low" },
    ],
    peers: ["Rahul Sharma", "Priya Nair"], reports: ["David Wilson", "Maria Sanchez", "Ryan Patel", "Sophia Kim", "Alex Johnson", "Priya Singh"],
    aiSummary: "Operations org is stable with reduced attrition. Recommend rotating L2 engineers into SRE shadow cohorts.",
  },
  // MODERNIZATION (1)
  {
    id: "anita", name: "Anita Desai", title: "Transformation Manager", manager: "Sarah Mitchell",
    layer: "mod", workstream: "Modernization", team: 0, years: 13, status: "At Risk", criticality: "Critical", avatar: anitaImg, initials: "AD",
    responsibilities: ["Modernization execution", "Program coordination", "Change management"],
    servicesOwned: ["Modernization Roadmap", "Acquisition Onboarding Factory"],
    outcomes: ["Modernization Success", "Acquisition Readiness"],
    kpis: [
      { name: "Roadmap Progress", target: "80%", baseline: "22%", current: "47%", trend: "up", risk: "med" },
      { name: "Acquisition Readiness", target: ">85", baseline: "41", current: "83", trend: "up", risk: "med" },
      { name: "Cost-to-Serve", target: "-15%", baseline: "0%", current: "-9.4%", trend: "down", risk: "med" },
    ],
    peers: ["Amit Verma"], reports: [],
    aiSummary: "Modernization horizon is at risk of slipping by ~6 weeks due to containerization dependency. Recommend pulling forward the IDP self-service launch by 30 days.",
  },
];

/* ---------- Helpers ---------- */
const statusColor = (s: Status) =>
  s === "On Track" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
  : s === "At Risk" ? "bg-amber-50 text-amber-700 border-amber-200"
  : "bg-rose-50 text-rose-700 border-rose-200";

const trendIcon = (t: KPI["trend"]) =>
  t === "up" ? <TrendingUp className="h-3 w-3 text-emerald-600" />
  : t === "down" ? <TrendingDown className="h-3 w-3 text-emerald-600" />
  : <Activity className="h-3 w-3 text-slate-400" />;

const riskColor = (r: KPI["risk"]) =>
  r === "low" ? "text-emerald-700 bg-emerald-50" : r === "med" ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50";

/* ---------- Page ---------- */
export default function DeliveryOrgTwin() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Person | null>(null);
  const [query, setQuery] = useState("");
  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [drawerCtx, setDrawerCtx] = useState<{ title: string; subtitle?: string } | null>(null);

  const filtered = useMemo(() => {
    return PEOPLE.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.workstream.toLowerCase().includes(q);
      const matchesL = layerFilter === "all" || p.layer === layerFilter;
      return matchesQ && matchesL;
    });
  }, [query, layerFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    PEOPLE.forEach((p) => (c[p.layer] = (c[p.layer] || 0) + 1));
    return c;
  }, []);

  const openPerson = (p: Person) => { setSelected(p); setDrawerCtx(null); };
  const openContext = (title: string, subtitle?: string) => setDrawerCtx({ title, subtitle });

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/40">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 px-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                <span>HHAX Production Resilience OS</span><ChevronRight className="h-3 w-3" /><span>Delivery Organization</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Delivery Organization Digital Twin</h1>
              <p className="text-sm text-slate-600">22-person SRE, RunOps, Platform, Security, Cloud, Service Management & Modernization operating model — every person is a business function.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">22 Members</Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Follow-the-Sun</Badge>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200">8 Layers</Badge>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 pb-3 flex items-center gap-2">
            <div className="relative w-72">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people, titles, workstreams" className="pl-8 h-9" />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              <Button variant={layerFilter === "all" ? "default" : "outline"} size="sm" className="h-8" onClick={() => setLayerFilter("all")}>
                <Filter className="h-3.5 w-3.5 mr-1" /> All ({PEOPLE.length})
              </Button>
              {LAYERS.map((l) => (
                <Button key={l.key} variant={layerFilter === l.key ? "default" : "outline"} size="sm" className="h-8 whitespace-nowrap"
                  onClick={() => setLayerFilter(l.key)}>
                  <l.icon className="h-3.5 w-3.5 mr-1" /> {l.label} ({counts[l.key] || 0})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Org Stats Strip */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: "Availability", value: "99.94%", trend: "+0.12 pts", color: "emerald", icon: Activity, ctx: "Org-wide availability" },
              { label: "MTTR (P1)", value: "27 min", trend: "-35 min", color: "emerald", icon: Target, ctx: "Mean time to restore" },
              { label: "Modernization", value: "47%", trend: "+9 pts", color: "blue", icon: Sparkles, ctx: "Roadmap progress" },
              { label: "Cloud Savings", value: "$2.6M", trend: "7.2%", color: "violet", icon: DollarSign, ctx: "Annualized" },
              { label: "Risk Score", value: "22", trend: "-56", color: "emerald", icon: ShieldCheck, ctx: "Composite cyber risk" },
              { label: "Acquisition Readiness", value: "83", trend: "+42", color: "amber", icon: GitBranch, ctx: "Index 0–100" },
            ].map((s) => (
              <Card key={s.label} onClick={() => openContext(s.label, s.ctx)}
                className="p-3 cursor-pointer hover:shadow-md transition border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</div>
                    <div className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{s.value}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {s.trend}
                    </div>
                  </div>
                  <div className={`h-8 w-8 rounded-full grid place-items-center bg-${s.color}-50`}>
                    <s.icon className={`h-4 w-4 text-${s.color}-600`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Org by Layer */}
        <div className="px-6 py-4 space-y-4">
          {LAYERS.filter((l) => layerFilter === "all" || layerFilter === l.key).map((layer) => {
            const list = filtered.filter((p) => p.layer === layer.key);
            if (!list.length) return null;
            return (
              <div key={layer.key}>
                <div className={`rounded-t-lg bg-gradient-to-r ${layer.color} px-4 py-2 flex items-center justify-between`}>
                  <div className="flex items-center gap-2 text-white">
                    <layer.icon className="h-4 w-4" />
                    <span className="text-sm font-semibold tracking-wide uppercase">{layer.label}</span>
                    <Badge className="bg-white/15 text-white border-white/20 ml-1">{list.length}</Badge>
                  </div>
                  <button onClick={() => openContext(layer.label, "Layer-level outcomes, KPIs & dependencies")}
                    className="text-white/80 hover:text-white text-[11px] flex items-center gap-1">
                    Explore layer <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {list.map((p) => (
                    <button key={p.id} onClick={() => p.id === "sarah" ? navigate("/executive-service-owner-twin") : openPerson(p)}
                      className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          {p.avatar ? (
                            <img src={p.avatar} alt={p.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white text-[12px] font-bold grid place-items-center ring-2 ring-white shadow-sm">
                              {p.initials}
                            </div>
                          )}
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${p.status === "On Track" ? "bg-emerald-500" : p.status === "At Risk" ? "bg-amber-500" : "bg-rose-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-slate-900 text-[14px] truncate">{p.name}</div>
                            <Badge className={`${statusColor(p.status)} text-[10px] border`}>{p.status}</Badge>
                          </div>
                          <div className="text-[12px] text-slate-600 truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{p.workstream}{p.team ? ` · ${p.team} reports` : ""}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.responsibilities.slice(0, 2).map((r) => (
                              <span key={r} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">{r}</span>
                            ))}
                            {p.responsibilities.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">+{p.responsibilities.length - 2}</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                            <Database className="h-3 w-3" /> {p.servicesOwned.length} services
                            <Target className="h-3 w-3 ml-1" /> {p.kpis.length} KPIs
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Intelligence Panel - Person */}
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <SheetContent side="right" className="w-[35vw] min-w-[520px] sm:max-w-none p-0 bg-white/95 backdrop-blur-xl border-l border-slate-200 overflow-y-auto">
            {selected && (
              <div>
                <SheetHeader className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-start gap-3">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white text-[14px] font-bold grid place-items-center ring-2 ring-white shadow">
                        {selected.initials}
                      </div>
                    )}
                    <div className="flex-1">
                      <SheetTitle className="text-lg text-slate-900">{selected.name}</SheetTitle>
                      <SheetDescription className="text-[12px] text-slate-600">{selected.title} · {selected.workstream}</SheetDescription>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <Badge className={`${statusColor(selected.status)} border text-[10px]`}>{selected.status}</Badge>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">Reports to {selected.manager}</Badge>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">{selected.years} yrs</Badge>
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">{selected.criticality}</Badge>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mx-5 mt-3 grid grid-cols-5 h-9">
                    <TabsTrigger value="overview" className="text-[11px]">Overview</TabsTrigger>
                    <TabsTrigger value="kpis" className="text-[11px]">KPIs</TabsTrigger>
                    <TabsTrigger value="ops" className="text-[11px]">Ops</TabsTrigger>
                    <TabsTrigger value="org" className="text-[11px]">Org</TabsTrigger>
                    <TabsTrigger value="ai" className="text-[11px]">AI</TabsTrigger>
                  </TabsList>

                  {/* Overview */}
                  <TabsContent value="overview" className="p-5 space-y-4">
                    <Section title="Accountability">
                      <ul className="text-[13px] text-slate-700 space-y-1.5">
                        {selected.responsibilities.map((r) => (
                          <li key={r} className="flex items-start gap-2 cursor-pointer hover:text-blue-700"
                            onClick={() => openContext(r, "Responsibility detail")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-600" />{r}
                          </li>
                        ))}
                      </ul>
                    </Section>
                    <Section title="Outcome Ownership">
                      <div className="flex flex-wrap gap-1.5">
                        {selected.outcomes.map((o) => (
                          <button key={o} onClick={() => openContext(o, "Business outcome")}
                            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-[11px] font-semibold text-blue-800 hover:shadow-sm">
                            {o}
                          </button>
                        ))}
                      </div>
                    </Section>
                    <Section title="Services Owned">
                      <div className="grid grid-cols-1 gap-1.5">
                        {selected.servicesOwned.map((s) => (
                          <button key={s} onClick={() => openContext(s, "Service detail")}
                            className="flex items-center justify-between p-2 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-[12px]">
                            <span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-slate-500" /> {s}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </Section>
                    {selected.budget && (
                      <Section title="Financial Impact">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <FinChip label="Budget" value={selected.budget} />
                          <FinChip label="Forecast" value={selected.forecast || "—"} />
                          <FinChip label="Savings" value={selected.savings || "—"} />
                        </div>
                      </Section>
                    )}
                  </TabsContent>

                  {/* KPIs */}
                  <TabsContent value="kpis" className="p-5 space-y-3">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wide">KPI Dashboard</div>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">KPI</th>
                            <th className="text-right px-3 py-2 font-medium">Target</th>
                            <th className="text-right px-3 py-2 font-medium">Baseline</th>
                            <th className="text-right px-3 py-2 font-medium">Current</th>
                            <th className="text-center px-3 py-2 font-medium">Trend</th>
                            <th className="text-center px-3 py-2 font-medium">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.kpis.map((k) => (
                            <tr key={k.name} className="border-t border-slate-100 hover:bg-blue-50/30 cursor-pointer"
                              onClick={() => openContext(k.name, `Target ${k.target} · Current ${k.current}`)}>
                              <td className="px-3 py-2 font-medium text-slate-800">{k.name}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{k.target}</td>
                              <td className="px-3 py-2 text-right text-slate-500">{k.baseline}</td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-900">{k.current}</td>
                              <td className="px-3 py-2 text-center">{trendIcon(k.trend)}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${riskColor(k.risk)}`}>{k.risk}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  {/* Ops */}
                  <TabsContent value="ops" className="p-5 space-y-4">
                    <Section title="90-Day Trend">
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={spark([72, 74, 76, 78, 80, 81, 83, 86, 88, 91, 93, 94])}>
                            <defs>
                              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Section>
                    <Section title="Work Queue">
                      <ul className="text-[12px] text-slate-700 space-y-1.5">
                        <li className="flex items-center justify-between p-2 rounded border border-slate-200 hover:bg-blue-50/30 cursor-pointer"
                          onClick={() => openContext("Initiative", "Containerization wave 2")}>
                          <span>Containerization wave 2</span><Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">In Flight</Badge>
                        </li>
                        <li className="flex items-center justify-between p-2 rounded border border-slate-200 hover:bg-blue-50/30 cursor-pointer"
                          onClick={() => openContext("Initiative", "Observability uplift")}>
                          <span>Observability uplift</span><Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">At Risk</Badge>
                        </li>
                        <li className="flex items-center justify-between p-2 rounded border border-slate-200 hover:bg-blue-50/30 cursor-pointer"
                          onClick={() => openContext("Initiative", "Runbook automation")}>
                          <span>Runbook automation</span><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">On Track</Badge>
                        </li>
                      </ul>
                    </Section>
                    <Section title="SLA Performance">
                      <div className="grid grid-cols-3 gap-2">
                        <FinChip label="Target" value="99.9%" />
                        <FinChip label="Actual" value="99.94%" tone="good" />
                        <FinChip label="Variance" value="+0.04%" tone="good" />
                      </div>
                    </Section>
                  </TabsContent>

                  {/* Org */}
                  <TabsContent value="org" className="p-5 space-y-4">
                    <Section title="Reporting Relationships">
                      <div className="space-y-2 text-[12px]">
                        <Row label="Manager" value={selected.manager} />
                        <Row label="Peers" value={selected.peers.join(", ") || "—"} />
                        <Row label="Direct Reports" value={selected.reports.join(", ") || "—"} />
                      </div>
                    </Section>
                    <Section title="Cross-Functional Dependencies">
                      <div className="flex flex-wrap gap-1.5">
                        {["SRE", "Platform", "Security", "Service Mgmt", "Modernization"].map((d) => (
                          <button key={d} onClick={() => openContext(d, "Dependency map")}
                            className="px-2 py-1 rounded-full border border-slate-200 hover:border-blue-300 text-[11px] flex items-center gap-1">
                            <Network className="h-3 w-3 text-slate-500" /> {d}
                          </button>
                        ))}
                      </div>
                    </Section>
                  </TabsContent>

                  {/* AI */}
                  <TabsContent value="ai" className="p-5 space-y-3">
                    <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                        <Brain className="h-4 w-4" /> AI Role Advisor
                      </div>
                      <p className="text-[13px] text-slate-800 mt-2 leading-relaxed">{selected.aiSummary}</p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-[12px] text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5" /> Recommended next review: weekly 1:1 with executive sponsor.
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Context Drawer (KPI / service / outcome clicks) */}
        <Sheet open={!!drawerCtx} onOpenChange={(o) => !o && setDrawerCtx(null)}>
          <SheetContent side="right" className="w-[32vw] min-w-[460px] sm:max-w-none p-0 bg-white/95 backdrop-blur-xl border-l border-slate-200 overflow-y-auto">
            {drawerCtx && (
              <div className="p-5 space-y-4">
                <SheetHeader>
                  <SheetTitle className="text-slate-900">{drawerCtx.title}</SheetTitle>
                  {drawerCtx.subtitle && <SheetDescription>{drawerCtx.subtitle}</SheetDescription>}
                </SheetHeader>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spark([62, 65, 67, 70, 72, 75, 78, 80, 83, 86, 89, 92])}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 text-[12px] text-slate-800 flex items-start gap-2">
                  <Brain className="h-4 w-4 mt-0.5 text-violet-700" />
                  <span>AI: Driver analysis suggests modernization and automation are the leading positive contributors. No immediate executive action required.</span>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ---------- Small components ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{title}</div>
      {children}
    </div>
  );
}
function FinChip({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" }) {
  return (
    <div className={`rounded-md border p-2 ${tone === "good" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50"}`}>
      <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wide">{label}</div>
      <div className={`text-[13px] font-bold ${tone === "good" ? "text-emerald-700" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 p-2 rounded border border-slate-200">
      <div className="text-[10px] uppercase font-semibold tracking-wide text-slate-500 shrink-0">{label}</div>
      <div className="text-[12px] text-slate-800 text-right">{value}</div>
    </div>
  );
}
