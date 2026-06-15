import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  ArrowLeft, ArrowRight, Calendar, Filter, RefreshCcw, Bell, Search, HelpCircle,
  Activity, Clock, ShieldCheck, Bot, Layers, Users, Code2, Building2,
  Flame, Ticket, Network, Server, MousePointerClick, Boxes, GitBranch, Database,
  GitMerge, Workflow as WorkflowIcon, ListChecks, Cloud, Settings, TrendingUp,
  Cpu, DollarSign, Target, Sparkles, Quote, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

/* -------------------- types & helpers -------------------- */
type Panel = {
  title: string;
  subtitle?: string;
  body: React.ReactNode;
};

const spark = (a: number, b: number, n = 12, j = 0.6) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    v: +(a + (b - a) * (i / (n - 1)) + Math.sin(i * 1.4) * j).toFixed(2),
  }));

/* -------------------- KPI ribbon data -------------------- */
type KpiRow = {
  id: string; label: string; icon: any; current: string; target: string;
  trend: "up" | "down";
  trendData: { x: number; v: number }[];
  definition: string;
  why: string;
  currentState: string;
  futureState: string;
  benchmarks: { name: string; v: string }[];
  actions: string[];
  impact: string;
};

const KPI_COLOR = "text-rose-600";

const KPIS: KpiRow[] = [
  {
    id: "mttd", label: "Mean Time to Detect", icon: Activity,
    current: "28 min", target: "< 5 min", trend: "down", trendData: spark(35, 12),
    definition: "Elapsed time from incident origination to first reliable detection signal.",
    why: "Detection speed is the leading indicator of customer impact and reliability posture.",
    currentState: "Manual triage on 6 monitoring tools, no event correlation.",
    futureState: "AI-correlated signals, anomaly detection, auto-paging within 60s.",
    benchmarks: [{ name: "Top Quartile", v: "< 5 min" }, { name: "Median", v: "12 min" }, { name: "HHAX", v: "28 min" }],
    actions: ["Consolidate observability into single pane", "Deploy AI event correlation", "Establish golden signals per service"],
    impact: "$2.1M / yr avoided incident cost; +3 pts NPS uplift",
  },
  {
    id: "mttr", label: "Mean Time to Recover", icon: Clock,
    current: "4.2 hrs", target: "< 30 min", trend: "down", trendData: spark(5.5, 0.6),
    definition: "Time from incident detection to verified service restoration.",
    why: "MTTR is the dominant driver of availability SLAs and customer trust.",
    currentState: "Manual runbooks, war-room driven recovery, slow rollback.",
    futureState: "Automated runbooks, validated recovery, instant rollback gates.",
    benchmarks: [{ name: "Top Quartile", v: "< 30 min" }, { name: "Median", v: "2.5 hrs" }, { name: "HHAX", v: "4.2 hrs" }],
    actions: ["Automate top-10 runbooks", "Adopt progressive delivery", "Mandate rollback rehearsal"],
    impact: "92% reduction in customer-visible downtime",
  },
  {
    id: "cfr", label: "Change Failure Rate", icon: ShieldCheck,
    current: "18%", target: "< 5%", trend: "down", trendData: spark(22, 4),
    definition: "Percentage of production changes that cause incidents or rollbacks.",
    why: "Indicator of engineering rigor, test coverage, and platform safety.",
    currentState: "Mixed CI maturity, manual approvals, sparse automated testing.",
    futureState: "Pipeline-enforced quality gates, canary, automated regression.",
    benchmarks: [{ name: "Elite (DORA)", v: "0-15%" }, { name: "High", v: "16-30%" }, { name: "HHAX", v: "18%" }],
    actions: ["Mandate trunk-based delivery", "Quality gates in IDP", "Pre-prod chaos validation"],
    impact: "3x deployment safety; faster feature velocity",
  },
  {
    id: "auto", label: "Automated Operations", icon: Bot,
    current: "21%", target: "75%+", trend: "up", trendData: spark(18, 72),
    definition: "Share of operational workflows executed by automation / AI agents.",
    why: "Automation breaks the linear scaling of operations to growth.",
    currentState: "Selective scripts, manual ticket triage, human-driven escalations.",
    futureState: "Agentic operations, AI runbooks, self-healing controllers.",
    benchmarks: [{ name: "Leaders", v: "70-85%" }, { name: "Mainstream", v: "30-50%" }, { name: "HHAX", v: "21%" }],
    actions: ["Deploy 6 AI digital coworkers", "Build runbook catalog", "Enable self-healing"],
    impact: "$4.8M / yr toil reduction; 60% capacity reclaimed",
  },
  {
    id: "platform", label: "Platform Standardization", icon: Layers,
    current: "32%", target: "90%+", trend: "up", trendData: spark(28, 88),
    definition: "Share of workloads running on standardized shared platform services.",
    why: "Standardization compounds reliability, security, and acquisition speed.",
    currentState: "7 independent platforms, divergent tooling, duplicated controls.",
    futureState: "Single IDP with golden paths, shared identity, observability, CI/CD.",
    benchmarks: [{ name: "Top Quartile", v: "90%+" }, { name: "Median", v: "45%" }, { name: "HHAX", v: "32%" }],
    actions: ["Consolidate identity + observability", "Publish golden paths", "Sunset legacy platforms"],
    impact: "40% lower run-cost; 5x faster onboarding",
  },
  {
    id: "ownership", label: "Service Ownership Coverage", icon: Users,
    current: "15%", target: "95%", trend: "up", trendData: spark(12, 92),
    definition: "Share of services with a designated product team accountable end-to-end.",
    why: "Clear ownership is the prerequisite for SLOs, error budgets, and accountability.",
    currentState: "Operations owns most production services; weak product accountability.",
    futureState: "Team Topologies model; every service owned by a stream-aligned team.",
    benchmarks: [{ name: "SRE Mature", v: "95%+" }, { name: "Median", v: "40%" }, { name: "HHAX", v: "15%" }],
    actions: ["Service catalog rollout", "On-call rotation by team", "Publish SLO commitments"],
    impact: "Faster recovery + stronger product accountability",
  },
  {
    id: "iac", label: "Infrastructure as Code Coverage", icon: Code2,
    current: "28%", target: "95%", trend: "up", trendData: spark(25, 92),
    definition: "Share of infrastructure provisioned and managed via versioned code.",
    why: "IaC enables drift detection, reproducibility, and audit-ready compliance.",
    currentState: "Manual provisioning, snowflake servers, untracked drift.",
    futureState: "Golden environments, pipeline-enforced IaC, continuous compliance.",
    benchmarks: [{ name: "Cloud Native", v: "95%+" }, { name: "Median", v: "50%" }, { name: "HHAX", v: "28%" }],
    actions: ["Terraform/CDK platform", "Drift detection in CI", "Compliance-as-code"],
    impact: "Audit-ready posture; 80% drift elimination",
  },
  {
    id: "acq", label: "Acquisition Integration Time", icon: Building2,
    current: "9 mo", target: "< 90 days", trend: "down", trendData: spark(11, 2.8),
    definition: "Time from close to full operational integration on shared platforms.",
    why: "Integration velocity is a primary value-creation lever for PE-backed growth.",
    currentState: "Bespoke onboarding, duplicated tools, prolonged tech-debt assessment.",
    futureState: "Acquisition factory with templated playbooks and self-service onboarding.",
    benchmarks: [{ name: "Best-in-class", v: "< 90 days" }, { name: "Typical PE", v: "6-12 mo" }, { name: "HHAX", v: "9 mo" }],
    actions: ["Acquisition factory playbook", "Standard landing zones", "Day-1 observability"],
    impact: "Faster synergy capture; ~$6M / acquisition unlocked",
  },
];

/* -------------------- Traditional column data -------------------- */
type TradCard = {
  id: string; title: string; quote: string; icon: any; body: Panel;
};

const radarReactive = [
  { axis: "Reactive", current: 9, future: 3 },
  { axis: "Predictive", current: 2, future: 8 },
  { axis: "Preventive", current: 3, future: 8 },
  { axis: "Automated", current: 2, future: 9 },
  { axis: "Self-Healing", current: 1, future: 8 },
];

const tradCards: TradCard[] = [
  {
    id: "reactive", title: "Reactive Operations", quote: "Firefighting", icon: Flame,
    body: {
      title: "Reactive Operations",
      subtitle: "Firefighting · Fire Marshal · Smokey The Bear",
      body: (
        <DetailLayout
          definition="Operations primarily respond after customer impact rather than preventing or predicting incidents."
          symptoms={["High incident volume", "Frequent escalations", "Human dependency", "Operational interruptions"]}
          kpis={[
            { k: "Incident Count (30d)", v: "128" },
            { k: "Repeat Incident %", v: "34%" },
            { k: "MTTD", v: "28 min" },
            { k: "MTTR", v: "4.2 hrs" },
          ]}
          chart={
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarReactive}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#475569" }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Current" dataKey="current" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                <Radar name="Future" dataKey="future" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          }
          actions={["Deploy AI incident correlation coworker", "Establish SLO-based alerting", "Predictive capacity forecasting"]}
          agents={["Incident Triage Coworker", "Root-Cause Correlation Coworker", "Capacity Forecaster"]}
          impact="Cut unplanned operational hours by 65%, freeing strategic capacity."
        />
      ),
    },
  },
  {
    id: "ticket", title: "Ticket-Based Workflows", quote: "Throw it over the fence", icon: Ticket,
    body: {
      title: "Ticket-Based Workflows", subtitle: "Throw it over the fence",
      body: (
        <DetailLayout
          definition="Work flows between siloed teams via tickets, with no end-to-end ownership."
          symptoms={["Long queue times", "Handoff friction", "Loss of context", "Customer wait time"]}
          kpis={[
            { k: "Avg. Ticket Age", v: "6.8 d" },
            { k: "Handoffs / Incident", v: "5.4" },
            { k: "Reopen Rate", v: "19%" },
          ]}
          chart={<FlowCompare />}
          actions={["Shift to product team ownership", "Adopt Team Topologies", "Embed reliability engineers"]}
          agents={["Workflow Orchestrator Coworker"]}
          impact="Eliminates 70% of cross-team handoffs."
        />
      ),
    },
  },
  {
    id: "silos", title: "Technology Silos", quote: "Too many handoffs", icon: Network,
    body: {
      title: "Technology Silos", subtitle: "Too many handoffs",
      body: (
        <DetailLayout
          definition="Independent technology teams operate without a shared platform or operating model."
          symptoms={["Duplicated tooling", "Conflicting standards", "Slow change throughput"]}
          kpis={[
            { k: "Handoffs / Change", v: "7.2" }, { k: "Escalations / week", v: "23" }, { k: "Avg. Wait Time", v: "18 hrs" },
          ]}
          chart={<TeamNetwork />}
          actions={["Consolidate to shared platforms", "Federated service ownership", "Cross-functional product squads"]}
          agents={["Dependency Analyzer Coworker"]}
          impact="50% reduction in cross-team handoffs and escalations."
        />
      ),
    },
  },
  {
    id: "infra", title: "Infrastructure-Centric Ownership", quote: "Keep the lights on", icon: Server,
    body: {
      title: "Infrastructure-Centric Ownership", subtitle: "Keep the lights on",
      body: (
        <DetailLayout
          definition="Operations measured by infrastructure uptime instead of business outcomes."
          symptoms={["Green dashboards, unhappy customers", "No revenue-impact attribution"]}
          kpis={[
            { k: "Availability", v: "99.2%" }, { k: "CX Score", v: "62" }, { k: "Revenue at Risk", v: "$3.4M" },
          ]}
          chart={
            <div className="grid grid-cols-2 gap-3 text-xs">
              <MiniStat label="Infra Focus" value="78%" tone="amber" />
              <MiniStat label="Outcome Focus" value="22%" tone="emerald" />
            </div>
          }
          actions={["Adopt SLOs linked to customer journeys", "Business-outcome KPIs", "Service ownership realignment"]}
          agents={["Outcome Correlator Coworker"]}
          impact="Aligns ops to revenue-protecting customer journeys."
        />
      ),
    },
  },
  {
    id: "manual", title: "Manual Processes", quote: "People watching screens", icon: MousePointerClick,
    body: {
      title: "Manual Processes", subtitle: "People watching screens",
      body: (
        <DetailLayout
          definition="Operational toil consumes engineering capacity that should be applied to product reliability."
          symptoms={["Manual triage", "Copy-paste runbooks", "Repetitive remediation"]}
          kpis={[
            { k: "Manual Tasks / day", v: "412" }, { k: "Automation Coverage", v: "21%" }, { k: "Hours Recoverable", v: "1,840 / mo" },
          ]}
          chart={<ToilBar />}
          actions={["Automate top-20 runbooks", "Deploy AI digital coworkers", "Embed automation into intake"]}
          agents={["Auto-Remediation Coworker", "Toil Analyzer"]}
          impact="Reclaim 60% of operations capacity for engineering work."
        />
      ),
    },
  },
  {
    id: "acqcomplex", title: "Acquisition Complexity", quote: "Skeletons in the closet", icon: Boxes,
    body: {
      title: "Acquisition Complexity", subtitle: "Skeletons in the closet",
      body: (
        <DetailLayout
          definition="Each acquisition introduces unique platforms, tools, and operational standards."
          symptoms={["Tool sprawl", "Inconsistent posture", "Long integration tails"]}
          kpis={[
            { k: "Integration Time", v: "9 mo" }, { k: "Duplicate Platforms", v: "7" }, { k: "Standardization", v: "32%" },
          ]}
          chart={<Pipeline />}
          actions={["Acquisition factory model", "Standard landing zones", "Day-1 observability"]}
          agents={["M&A Onboarding Coworker"]}
          impact="Integration in <90 days vs. 9 months."
        />
      ),
    },
  },
  {
    id: "incons", title: "Inconsistent Standards", quote: "Every product is different", icon: GitBranch,
    body: {
      title: "Inconsistent Standards", subtitle: "Every product is different",
      body: (
        <DetailLayout
          definition="Lack of shared standards multiplies risk, cost, and operational drag."
          symptoms={["Divergent CI/CD", "Different observability stacks", "Bespoke security controls"]}
          kpis={[
            { k: "Shared Service Adoption", v: "32%" }, { k: "Standard Consistency", v: "41%" },
          ]}
          chart={
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Today" value="7 platforms" tone="amber" />
              <MiniStat label="Target" value="1 shared IDP" tone="emerald" />
            </div>
          }
          actions={["Publish golden paths", "Mandate platform conformance", "Decommission redundant stacks"]}
          agents={["Conformance Auditor Coworker"]}
          impact="Single IDP unlocks 5x acquisition velocity."
        />
      ),
    },
  },
  {
    id: "legacy", title: "Legacy Platform Dependencies", quote: "Technical debt", icon: Database,
    body: {
      title: "Legacy Platform Dependencies", subtitle: "Technical debt",
      body: (
        <DetailLayout
          definition="Aging platforms constrain velocity, reliability, and security posture."
          symptoms={["Unsupported OS", "Manual patching", "Limited observability"]}
          kpis={[
            { k: "Legacy OS %", v: "38%" }, { k: "Container Adoption", v: "44%" }, { k: "Unsupported Components", v: "117" },
          ]}
          chart={
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={[
                { axis: "Containerized", current: 4, future: 9 },
                { axis: "Cloud-Native", current: 3, future: 9 },
                { axis: "Observable", current: 5, future: 9 },
                { axis: "IaC", current: 3, future: 9 },
                { axis: "Secure", current: 5, future: 9 },
              ]}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#475569" }} />
                <Radar dataKey="current" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                <Radar dataKey="future" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          }
          actions={["Modernization roadmap", "Container migration factory", "Continuous patching"]}
          agents={["Modernization Planner Coworker"]}
          impact="Eliminate unsupported components in 18 months."
        />
      ),
    },
  },
  {
    id: "central", title: "Centralized Operational Bottlenecks", quote: "Everything comes through my team", icon: GitMerge,
    body: {
      title: "Centralized Operational Bottlenecks", subtitle: "Everything comes through my team",
      body: (
        <DetailLayout
          definition="A single ops team becomes the queue manager for all infrastructure, security, and reliability work."
          symptoms={["Hero culture", "Burnout", "Slow throughput"]}
          kpis={[
            { k: "Request Lead Time", v: "11 d" }, { k: "Queue Depth", v: "234" }, { k: "Dependencies", v: "62 teams" },
          ]}
          chart={<ToilBar />}
          actions={["Self-service via IDP", "Federated ownership", "Automation-first intake"]}
          agents={["Intake Router Coworker"]}
          impact="Lead time drops from 11 days to under 2 days."
        />
      ),
    },
  },
  {
    id: "interrupt", title: "Project Interruptions", quote: "Strategic work constantly gets interrupted", icon: ListChecks,
    body: {
      title: "Project Interruptions", subtitle: "Strategic work constantly gets interrupted",
      body: (
        <DetailLayout
          definition="Reactive operations starve strategic engineering investment."
          symptoms={["Context switching", "Missed roadmap commits", "Engineer attrition risk"]}
          kpis={[
            { k: "Context Switches / wk", v: "27" }, { k: "Strategic Capacity", v: "20%" }, { k: "Interruptions / wk", v: "42" },
          ]}
          chart={
            <div className="grid grid-cols-2 gap-3">
              <CapacityBar label="Current Strategic Capacity" pct={20} tone="amber" />
              <CapacityBar label="Future Strategic Capacity" pct={70} tone="emerald" />
            </div>
          }
          actions={["Protect engineering hours via automation", "Operational firewall via SRE", "Shared on-call"]}
          agents={["On-Call Shield Coworker"]}
          impact="Strategic capacity 20% → 70% within 12 months."
        />
      ),
    },
  },
];

/* -------------------- Modern column data -------------------- */
type ModernCard = {
  id: string; title: string; industry: string; icon: any; body: Panel;
};

const modernCards: ModernCard[] = [
  {
    id: "re", title: "Reliability Engineering", industry: "Google SRE", icon: Activity,
    body: panel("Reliability Engineering", "Google SRE",
      "Engineering discipline that applies software practices to operations, prioritizing prevention.",
      ["Prevention culture", "Error Budgets", "SLOs / SLIs", "Reliability metrics drive priorities"],
      "Per-service SLOs feed an error-budget policy that arbitrates release velocity vs. reliability."),
  },
  {
    id: "po", title: "Product Ownership", industry: "Team Topologies", icon: Users,
    body: panel("Product Ownership", "Team Topologies",
      "Stream-aligned teams own services end-to-end, supported by enabling and platform teams.",
      ["Service ownership", "Product teams", "Accountability", "Outcomes over outputs"],
      "Each service has a single accountable team with on-call, SLOs, and roadmap authority."),
  },
  {
    id: "shared", title: "Shared Platform Services", industry: "Platform Engineering", icon: Layers,
    body: panel("Shared Platform Services", "Platform Engineering",
      "A small set of treated-as-product platforms that all stream-aligned teams consume.",
      ["Cloud Platform", "Identity Platform", "Observability Platform", "CI/CD Platform"],
      "Golden paths reduce cognitive load and accelerate every product team."),
  },
  {
    id: "sim", title: "Standardized Integration Model", industry: "Acquisition Factory", icon: Boxes,
    body: panel("Standardized Integration Model", "Acquisition Factory",
      "Repeatable, templated integration flow that turns acquisitions into operational assets in days.",
      ["Acquire → Assess → Standardize → Integrate → Operate", "Standard landing zones", "Day-1 observability"],
      "Integration becomes a product, not a project. <90 days from close to fully integrated."),
  },
  {
    id: "self", title: "Self-Service Engineering", industry: "Internal Developer Platform", icon: Sparkles,
    body: panel("Self-Service Engineering", "Internal Developer Platform",
      "Developers compose, deploy, and observe services without ops handoffs.",
      ["DX metrics", "Golden paths", "Self-service infra", "Embedded compliance"],
      "Lead time for changes measured in minutes, not days."),
  },
  {
    id: "auto", title: "Automated Operations", industry: "Agentic Operations", icon: Bot,
    body: panel("Automated Operations", "Agentic Operations",
      "AI digital coworkers handle triage, remediation, and validation alongside humans.",
      ["Automation coverage", "AI agents", "Operational savings", "Continuous improvement"],
      "75%+ of operational workflows handled without human touch."),
  },
  {
    id: "iac", title: "Infrastructure as Code", industry: "Golden Environment", icon: Code2,
    body: panel("Infrastructure as Code", "Golden Environment",
      "Every environment is reproducible, versioned, and policy-enforced.",
      ["IaC coverage", "Drift detection", "Pipeline enforcement"],
      "Audit-ready evidence on demand; no production snowflakes."),
  },
  {
    id: "fin", title: "FinOps Transparency", industry: "Service Accountability", icon: DollarSign,
    body: panel("FinOps Transparency", "Service Accountability",
      "Cost is attributed to products, platforms, and customer journeys in real time.",
      ["Cost by product", "Cost by platform", "Cost trends", "Unit economics"],
      "Cost decisions made by the team accountable for the outcome."),
  },
  {
    id: "slo", title: "Service Level Objectives", industry: "Reliability Governance", icon: Target,
    body: panel("Service Level Objectives", "Reliability Governance",
      "Reliability is governed via SLIs/SLOs and error-budget policies.",
      ["SLIs", "SLOs", "Error budgets", "Policy enforcement"],
      "Reliability becomes a contract between engineering and the business."),
  },
  {
    id: "cm", title: "Continuous Modernization", industry: "Technology Evolution", icon: TrendingUp,
    body: panel("Continuous Modernization", "Technology Evolution",
      "Modernization is a continuous backlog, not a project with a finish line.",
      ["Modernization backlog", "Progress KPIs", "Roadmap visibility"],
      "Technology evolves continuously aligned to business value."),
  },
];

/* -------------------- Transformation journey -------------------- */
type Stage = {
  id: string; label: string; color: string; icon: any; summary: string;
  goals: string[]; activities: string[]; deliverables: string[]; metrics: string[]; outcome: string;
};

const stages: Stage[] = [
  { id: "s1", label: "Stabilize", color: "#ef4444", icon: ShieldCheck,
    summary: "Stop the bleeding. Establish predictable operations and incident hygiene.",
    goals: ["Predictable incident response", "Baseline observability", "Top-10 risk burn-down"],
    activities: ["Standup war-room cadence", "Deploy unified paging", "Establish on-call rotation"],
    deliverables: ["Incident playbooks", "Severity matrix", "30-day stability plan"],
    metrics: ["MTTR ↓ 40%", "Repeat incidents ↓ 50%", "Pager noise ↓ 60%"],
    outcome: "HHAX achieved 99.5% availability across top-5 services in 60 days." },
  { id: "s2", label: "Standardize", color: "#f59e0b", icon: Layers,
    summary: "Establish shared platforms, identity, observability, and CI/CD.",
    goals: ["Unified observability", "Shared identity platform", "Golden CI/CD path"],
    activities: ["Tool rationalization", "Identity consolidation", "Pipeline templates"],
    deliverables: ["Golden paths", "Platform catalog", "Standards charter"],
    metrics: ["Platform standardization 32% → 70%", "Tool count ↓ 45%"],
    outcome: "HHAX consolidated 7 platforms to 2 in 6 months." },
  { id: "s3", label: "Modernize", color: "#3b82f6", icon: Cloud,
    summary: "Containerize, cloud-native-ify, and retire legacy dependencies.",
    goals: ["Container adoption", "Cloud-native migration", "Legacy retirement"],
    activities: ["Modernization factory", "App refactor sprints", "Database modernization"],
    deliverables: ["Migration runbooks", "Modernization roadmap", "Refactor catalog"],
    metrics: ["Container adoption 44% → 85%", "Legacy OS ↓ 70%"],
    outcome: "Cut hosting cost 28% while improving reliability." },
  { id: "s4", label: "Automate", color: "#10b981", icon: Settings,
    summary: "Automate runbooks, remediation, and provisioning end-to-end.",
    goals: ["Automated runbooks", "Auto-remediation", "Self-service infra"],
    activities: ["Runbook automation sprints", "AI agent deployment", "IDP launch"],
    deliverables: ["Runbook catalog", "Digital coworker fleet", "Self-service portal"],
    metrics: ["Automation 21% → 75%", "Toil hours ↓ 60%"],
    outcome: "Reclaimed 1,840 engineering hours per month." },
  { id: "s5", label: "Optimize", color: "#0ea5e9", icon: TrendingUp,
    summary: "Continuously improve via SLOs, error budgets, and FinOps signals.",
    goals: ["SLO-driven prioritization", "FinOps optimization", "Continuous modernization"],
    activities: ["SLO reviews", "Cost reviews", "Modernization backlog grooming"],
    deliverables: ["Quarterly reliability review", "Unit-economics dashboard"],
    metrics: ["SLO attainment 99.95%", "Unit cost ↓ 22%"],
    outcome: "Reliability and cost become continuous competitive advantages." },
];

/* -------------------- Frameworks -------------------- */
const frameworks = [
  { id: "re", title: "Reliability Engineering", icon: Activity, bullets: ["Reliability focus", "SLOs", "Error budgets", "Automation", "Service ownership"] },
  { id: "pe", title: "Platform Engineering", icon: Layers, bullets: ["Shared services", "Internal Developer Platform", "Infrastructure as Code", "Self-service"] },
  { id: "po", title: "Product Ownership", icon: Users, bullets: ["Product teams", "Accountability", "Business outcomes", "Customer experience"] },
  { id: "ti", title: "Technology Investment Framework", icon: WorkflowIcon, bullets: ["Invest", "Standardize", "Consolidate", "Modernize", "Automate", "Retire", "Leave Alone"] },
  { id: "ai", title: "AI-Augmented Operations", icon: Cpu, bullets: ["Agentic operations", "Automated runbooks", "Incident correlation", "Capacity forecasting", "Recovery validation"] },
];

/* -------------------- Strategic priorities -------------------- */
const priorities = [
  { id: "p1", title: "Caregiver Experience", icon: Users, target: "99.95%",
    metrics: ["Visit Success Rate", "Mobile Availability", "Offline Capability"], tone: "rose" },
  { id: "p2", title: "Claims Processing", icon: ListChecks, target: "99.90%",
    metrics: ["Claims Throughput", "Processing Success Rate"], tone: "amber" },
  { id: "p3", title: "Payroll Services", icon: DollarSign, target: "99.95%",
    metrics: ["Payroll Processing Success", "Recovery Time"], tone: "emerald" },
  { id: "p4", title: "Acquisition Integration", icon: Building2, target: "< 90 Days",
    metrics: ["Onboarding Duration", "Platform Standardization"], tone: "sky" },
];

/* -------------------- Operating system layers -------------------- */
const opLayers = [
  { id: "bo", title: "Business Outcomes", icon: Target,
    purpose: "Outcomes that justify investment: caregiver experience, payroll reliability, claims throughput, acquisition velocity.",
    responsibilities: ["Define value targets", "Approve investment", "Own customer outcomes"],
    kpis: ["NPS", "Revenue at Risk", "Customer Retention"], roles: ["CEO", "COO", "Business Owners"],
    workflows: ["Outcome OKR review", "Investment governance"], outcomes: "Reliability spend tied directly to business value." },
  { id: "pt", title: "Product Teams", icon: Users,
    purpose: "Stream-aligned teams owning services end-to-end.",
    responsibilities: ["Build, run, observe services", "Own SLOs", "Drive roadmap"],
    kpis: ["SLO attainment", "Lead time", "Change failure rate"], roles: ["Product Engineering", "Service Owners"],
    workflows: ["Service ownership lifecycle", "SLO review"], outcomes: "Accountability anchored at the service level." },
  { id: "ple", title: "Platform Engineering", icon: Layers,
    purpose: "Shared platforms treated as products: cloud, identity, observability, CI/CD.",
    responsibilities: ["Provide golden paths", "Govern platforms", "Reduce cognitive load"],
    kpis: ["Platform adoption", "DX score", "Lead time to deploy"], roles: ["Platform PMs", "Platform Engineers"],
    workflows: ["IDP roadmap", "Platform onboarding"], outcomes: "Velocity for every product team." },
  { id: "re2", title: "Reliability Engineering", icon: Activity,
    purpose: "Reliability as engineering discipline using SLOs and error budgets.",
    responsibilities: ["Author SLOs", "Govern error budgets", "Drive postmortems"],
    kpis: ["SLO attainment", "MTTD", "MTTR"], roles: ["SREs", "Reliability Engineers"],
    workflows: ["Incident → review → action", "Error-budget policy"], outcomes: "Reliability becomes a contract." },
  { id: "ai2", title: "Automation & AI", icon: Bot,
    purpose: "AI digital coworkers and automation engines that scale operations beyond headcount.",
    responsibilities: ["Build coworkers", "Automate runbooks", "Validate recoveries"],
    kpis: ["Automation coverage", "Toil hours reclaimed", "Auto-remediation rate"], roles: ["Automation Engineers", "AI Ops"],
    workflows: ["Coworker lifecycle", "Runbook automation"], outcomes: "Operations scales with growth, not headcount." },
  { id: "ci", title: "Continuous Improvement", icon: TrendingUp,
    purpose: "Continuous backlog of modernization, reliability, and cost improvements.",
    responsibilities: ["Run reviews", "Prioritize backlog", "Measure outcomes"],
    kpis: ["Modernization velocity", "Unit cost trend", "Reliability trend"], roles: ["Engineering Leadership"],
    workflows: ["Quarterly reliability review", "Modernization roadmap"], outcomes: "Compounding improvement loop." },
];

/* -------------------- helper components -------------------- */
function panel(title: string, subtitle: string, def: string, bullets: string[], example: string): Panel {
  return {
    title, subtitle,
    body: (
      <div className="space-y-5">
        <Section label="Definition"><p className="text-sm text-slate-700">{def}</p></Section>
        <Section label="Core Capabilities">
          <ul className="text-sm text-slate-700 space-y-1.5">
            {bullets.map((b) => <li key={b} className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-1 text-emerald-600" /><span>{b}</span></li>)}
          </ul>
        </Section>
        <Section label="HHAX Example"><p className="text-sm text-slate-700">{example}</p></Section>
        <Section label="Trend">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={spark(20, 85)}>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>
      </div>
    ),
  };
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase mb-2">{label}</div>
      {children}
    </div>
  );
}

function DetailLayout({
  definition, symptoms, kpis, chart, actions, agents, impact,
}: {
  definition: string; symptoms: string[]; kpis: { k: string; v: string }[];
  chart: React.ReactNode; actions: string[]; agents: string[]; impact: string;
}) {
  return (
    <div className="space-y-5">
      <Section label="Definition"><p className="text-sm text-slate-700">{definition}</p></Section>
      <Section label="Common Symptoms">
        <ul className="text-sm text-slate-700 space-y-1.5">
          {symptoms.map((s) => <li key={s} className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-1 text-amber-600" /><span>{s}</span></li>)}
        </ul>
      </Section>
      <Section label="Key Metrics">
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((k) => (
            <div key={k.k} className="rounded-md border border-slate-200 bg-white p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{k.k}</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{k.v}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="Maturity / Visual">{chart}</Section>
      <Section label="Suggested Modernization Actions">
        <ul className="text-sm text-slate-700 space-y-1.5">
          {actions.map((a) => <li key={a} className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-1 text-emerald-600" /><span>{a}</span></li>)}
        </ul>
      </Section>
      <Section label="Suggested AI Digital Coworkers">
        <div className="flex flex-wrap gap-2">
          {agents.map((a) => <Badge key={a} variant="secondary" className="bg-violet-50 text-violet-700 border border-violet-200"><Bot className="w-3 h-3 mr-1" />{a}</Badge>)}
        </div>
      </Section>
      <Section label="Business Impact">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{impact}</div>
      </Section>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "amber" | "emerald" | "rose" | "sky" }) {
  const tones: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
  };
  return (
    <div className={`rounded-md border p-3 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-base font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function CapacityBar({ label, pct, tone }: { label: string; pct: number; tone: "amber" | "emerald" }) {
  const color = tone === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-base font-semibold mt-0.5 mb-2">{pct}%</div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function FlowCompare() {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3">
        <div className="text-[10px] font-semibold tracking-wide text-amber-700 uppercase mb-2">Traditional Ticket Flow</div>
        <div className="flex items-center gap-1 text-[11px] text-amber-900">
          {["Request", "Triage", "Assign", "Wait", "Work", "Handoff", "Close"].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="px-2 py-1 rounded bg-white border border-amber-200">{s}</span>
              {i < 6 && <ArrowRight className="w-3 h-3 text-amber-500" />}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
        <div className="text-[10px] font-semibold tracking-wide text-emerald-700 uppercase mb-2">Product Ownership Flow</div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-900">
          {["Signal", "Owning Team", "Resolve"].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="px-2 py-1 rounded bg-white border border-emerald-200">{s}</span>
              {i < 2 && <ArrowRight className="w-3 h-3 text-emerald-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamNetwork() {
  const nodes = [
    { x: 50, y: 20, name: "App" }, { x: 15, y: 60, name: "Infra" },
    { x: 85, y: 60, name: "Sec" }, { x: 30, y: 95, name: "DB" },
    { x: 70, y: 95, name: "Net" },
  ];
  return (
    <svg viewBox="0 0 100 110" className="w-full h-48">
      {nodes.flatMap((a, i) => nodes.slice(i + 1).map((b, j) => (
        <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cbd5e1" strokeWidth="0.4" />
      )))}
      {nodes.map((n) => (
        <g key={n.name}>
          <circle cx={n.x} cy={n.y} r="6" fill="#fff" stroke="#f59e0b" strokeWidth="1" />
          <text x={n.x} y={n.y + 1.5} fontSize="3.5" textAnchor="middle" fill="#92400e">{n.name}</text>
        </g>
      ))}
    </svg>
  );
}

function ToilBar() {
  const data = [
    { name: "Manual", v: 412 }, { name: "Scripted", v: 184 },
    { name: "Automated", v: 92 }, { name: "Self-Healing", v: 28 },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
        <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
        <Tooltip />
        <Bar dataKey="v" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Pipeline() {
  return (
    <div className="flex items-center justify-between gap-1 text-[11px]">
      {["Acquire", "Assess", "Standardize", "Integrate", "Operate"].map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className="px-2.5 py-1.5 rounded-md bg-sky-50 border border-sky-200 text-sky-900 font-medium">{s}</div>
          {i < 4 && <ArrowRight className="w-3 h-3 text-sky-400" />}
        </div>
      ))}
    </div>
  );
}

/* -------------------- main page -------------------- */
export default function ProductReliabilityTransformationIndex() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel | null>(null);

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 leading-tight truncate">Product Reliability Transformation Index</h1>
              <p className="text-xs text-slate-500 truncate">Evolution from Traditional Operations to Modern Product Reliability Engineering</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Calendar className="w-3.5 h-3.5" />May 18 – Jun 18, 2025</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="w-3.5 h-3.5" />Filters</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCcw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Search className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><HelpCircle className="w-4 h-4" /></Button>
          </div>
        </header>

        {/* Scroll */}
        <div className="flex-1 overflow-auto">
          <div className="p-5 space-y-5">
            {/* KPI Ribbon */}
            <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {KPIS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setPanel(kpiPanel(k))}
                  className="text-left rounded-xl border border-slate-200 bg-white/90 backdrop-blur p-3 hover:shadow-md hover:border-slate-300 transition group"
                >
                  <div className="text-[11px] font-medium text-slate-600 leading-tight min-h-[28px]">{k.label}</div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-slate-400">Current</div>
                      <div className={`text-base font-bold ${KPI_COLOR} leading-tight`}>{k.current}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-slate-400">Target</div>
                      <div className="text-base font-bold text-emerald-600 leading-tight flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />{k.target}
                      </div>
                    </div>
                  </div>
                  <div className="h-7 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={k.trendData}>
                        <Line type="monotone" dataKey="v" stroke={k.trend === "down" ? "#10b981" : "#3b82f6"} strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 flex items-center justify-center">
                    <k.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </button>
              ))}
            </section>

            {/* Three columns */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left: Traditional */}
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 backdrop-blur p-4">
                <div className="text-center text-[11px] font-bold tracking-[0.16em] text-amber-700 uppercase mb-3">Traditional Operations Characteristics</div>
                <div className="grid grid-cols-2 text-[10px] font-medium text-slate-500 uppercase tracking-wide pb-2 border-b border-amber-200/60 mb-1">
                  <div>Common Industry Characteristic</div>
                  <div>Client Language (What We Hear)</div>
                </div>
                <div className="divide-y divide-amber-200/40">
                  {tradCards.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setPanel(c.body)}
                      className="w-full grid grid-cols-2 items-center gap-2 py-2.5 hover:bg-amber-100/40 rounded-md px-2 -mx-2 text-left transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                          <c.icon className="w-3.5 h-3.5 text-amber-700" />
                        </span>
                        <span className="text-[12.5px] font-medium text-slate-800 truncate">{c.title}</span>
                      </div>
                      <div className="text-[12px] italic text-slate-600 truncate">"{c.quote}"</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Center: Transformation Journey */}
              <div className="rounded-xl border border-slate-200 bg-white/90 backdrop-blur p-4 flex flex-col">
                <div className="text-center text-[11px] font-bold tracking-[0.16em] text-slate-700 uppercase mb-4">Transformation Journey</div>
                <div className="flex items-center justify-between gap-1 mb-5">
                  {stages.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-1 flex-1">
                      <button
                        onClick={() => setPanel(stagePanel(s))}
                        className="flex flex-col items-center group flex-1"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition"
                          style={{ backgroundColor: s.color }}
                        >
                          <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="mt-1.5 text-[11px] font-semibold text-slate-700">{s.label}</div>
                      </button>
                      {i < stages.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 mb-3">
                  <div className="text-center text-[10px] font-bold tracking-[0.16em] text-slate-700 uppercase mb-3">Enablers & Frameworks</div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {frameworks.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPanel(frameworkPanel(f))}
                        className="rounded-md border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm p-2 flex flex-col items-center text-center transition"
                      >
                        <f.icon className="w-5 h-5 text-slate-700 mb-1" />
                        <div className="text-[10.5px] font-medium text-slate-700 leading-tight">{f.title}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto rounded-lg bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-100 p-3 flex gap-2.5">
                  <Quote className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-slate-700 leading-relaxed">
                    Move from reactive, siloed operations to a proactive, automated, and product-centric reliability organization that scales with HHAX's growth and acquisition strategy.
                  </p>
                </div>
              </div>

              {/* Right: Modern */}
              <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-sky-50/40 to-emerald-50/40 backdrop-blur p-4">
                <div className="text-center text-[11px] font-bold tracking-[0.16em] text-emerald-700 uppercase mb-3">Modern Product Reliability Characteristics</div>
                <div className="grid grid-cols-2 text-[10px] font-medium text-slate-500 uppercase tracking-wide pb-2 border-b border-emerald-200/60 mb-1">
                  <div>Future State Outcome</div>
                  <div>Industry Translation (How We Deliver)</div>
                </div>
                <div className="divide-y divide-emerald-200/40">
                  {modernCards.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setPanel(c.body)}
                      className="w-full grid grid-cols-2 items-center gap-2 py-2.5 hover:bg-emerald-100/30 rounded-md px-2 -mx-2 text-left transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                          <c.icon className="w-3.5 h-3.5 text-emerald-700" />
                        </span>
                        <span className="text-[12.5px] font-medium text-slate-800 truncate">{c.title}</span>
                      </div>
                      <div className="text-[12px] font-medium text-sky-700 truncate">{c.industry}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Bottom: Priorities + Operating System */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Priorities */}
              <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
                <div className="text-center text-[11px] font-bold tracking-[0.16em] text-slate-700 uppercase mb-3">HHAX Future-State Priorities</div>
                <div className="grid grid-cols-2 gap-3">
                  {priorities.map((p) => {
                    const tones: Record<string, string> = {
                      rose: "border-rose-200 bg-rose-50/50", amber: "border-amber-200 bg-amber-50/50",
                      emerald: "border-emerald-200 bg-emerald-50/50", sky: "border-sky-200 bg-sky-50/50",
                    };
                    const iconTones: Record<string, string> = {
                      rose: "text-rose-600", amber: "text-amber-600", emerald: "text-emerald-600", sky: "text-sky-600",
                    };
                    return (
                      <button key={p.id} onClick={() => setPanel(priorityPanel(p))}
                        className={`text-left rounded-lg border ${tones[p.tone]} p-3 hover:shadow-md transition`}>
                        <div className="flex items-center gap-2 mb-2">
                          <p.icon className={`w-4 h-4 ${iconTones[p.tone]}`} />
                          <div className="text-[12.5px] font-semibold text-slate-800">{p.title}</div>
                        </div>
                        <ul className="space-y-1 mb-2">
                          {p.metrics.map((m) => (
                            <li key={m} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                              <span className={`mt-1 w-1 h-1 rounded-full ${iconTones[p.tone].replace("text-", "bg-")}`} />{m}
                            </li>
                          ))}
                        </ul>
                        <div className={`text-[11px] font-medium ${iconTones[p.tone]}`}>
                          {p.id === "p4" ? "Target Integration: " : "Target Uptime: "}{p.target}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operating System */}
              <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
                <div className="text-center text-[11px] font-bold tracking-[0.16em] text-slate-700 uppercase mb-4">Production Reliability Operating System</div>
                <div className="flex items-center justify-between gap-1">
                  {opLayers.map((l, i) => {
                    const colors = ["bg-slate-700", "bg-sky-600", "bg-indigo-600", "bg-emerald-600", "bg-violet-600", "bg-rose-600"];
                    return (
                      <div key={l.id} className="flex items-center gap-1 flex-1">
                        <button onClick={() => setPanel(layerPanel(l))} className="flex flex-col items-center group flex-1">
                          <div className={`w-12 h-12 rounded-full ${colors[i]} flex items-center justify-center shadow-sm group-hover:scale-110 transition`}>
                            <l.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="mt-1.5 text-[10.5px] font-semibold text-slate-700 text-center leading-tight">{l.title}</div>
                        </button>
                        {i < opLayers.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 -mt-4" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Detail panel */}
        <Sheet open={!!panel} onOpenChange={(o) => !o && setPanel(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            {panel && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-xl">{panel.title}</SheetTitle>
                  {panel.subtitle && <SheetDescription>{panel.subtitle}</SheetDescription>}
                </SheetHeader>
                <div className="mt-5">{panel.body}</div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* -------------------- panel builders -------------------- */
function kpiPanel(k: KpiRow): Panel {
  return {
    title: k.label,
    subtitle: `Current ${k.current}  →  Target ${k.target}`,
    body: (
      <div className="space-y-5">
        <Section label="Executive Definition"><p className="text-sm text-slate-700">{k.definition}</p></Section>
        <Section label="Why It Matters"><p className="text-sm text-slate-700">{k.why}</p></Section>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Current State" value={k.current} tone="rose" />
          <MiniStat label="Future State" value={k.target} tone="emerald" />
        </div>
        <Section label="Trend">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={k.trendData}>
              <defs><linearGradient id="kg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip />
              <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#kg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>
        <Section label="Industry Benchmarks">
          <div className="space-y-1.5">
            {k.benchmarks.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-sm border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">{b.name}</span>
                <span className="font-semibold text-slate-900">{b.v}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section label="Suggested Actions">
          <ul className="text-sm text-slate-700 space-y-1.5">
            {k.actions.map((a) => <li key={a} className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-1 text-emerald-600" /><span>{a}</span></li>)}
          </ul>
        </Section>
        <Section label="Business Impact">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{k.impact}</div>
        </Section>
      </div>
    ),
  };
}

function stagePanel(s: Stage): Panel {
  return {
    title: s.label, subtitle: s.summary,
    body: (
      <div className="space-y-5">
        <Section label="Goals"><BulletList items={s.goals} /></Section>
        <Section label="Activities"><BulletList items={s.activities} /></Section>
        <Section label="Deliverables"><BulletList items={s.deliverables} /></Section>
        <Section label="Success Metrics"><BulletList items={s.metrics} tone="emerald" /></Section>
        <Section label="Example HHAX Outcome">
          <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">{s.outcome}</div>
        </Section>
      </div>
    ),
  };
}

function frameworkPanel(f: typeof frameworks[number]): Panel {
  return {
    title: f.title, subtitle: "Framework explorer",
    body: (
      <div className="space-y-5">
        <Section label="Core Concepts"><BulletList items={f.bullets} tone="emerald" /></Section>
        <Section label="Why It Matters">
          <p className="text-sm text-slate-700">
            {f.id === "ti"
              ? "A structured way to allocate technology investment across the portfolio without consulting jargon — every component receives a clear disposition."
              : "This framework anchors a core capability of the modern product reliability organization."}
          </p>
        </Section>
        <Section label="Maturity">
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={[
              { axis: "Adoption", current: 4, future: 9 },
              { axis: "Tooling", current: 5, future: 9 },
              { axis: "Process", current: 4, future: 9 },
              { axis: "People", current: 5, future: 9 },
              { axis: "Outcomes", current: 3, future: 9 },
            ]}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#475569" }} />
              <Radar dataKey="current" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
              <Radar dataKey="future" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </Section>
      </div>
    ),
  };
}

function priorityPanel(p: typeof priorities[number]): Panel {
  return {
    title: p.title, subtitle: `Target ${p.target}`,
    body: (
      <div className="space-y-5">
        <Section label="Metrics"><BulletList items={p.metrics} /></Section>
        <Section label="Why It Matters">
          <p className="text-sm text-slate-700">A flagship outcome that the Product Reliability organization must deliver against to protect HHAX customer value.</p>
        </Section>
        <Section label="Trend">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={spark(95, 99.95)}>
              <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>
        <Section label="Business Impact">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Sustaining {p.target} availability protects revenue, customer trust, and regulatory standing.
          </div>
        </Section>
      </div>
    ),
  };
}

function layerPanel(l: typeof opLayers[number]): Panel {
  return {
    title: l.title, subtitle: "Operating model layer",
    body: (
      <div className="space-y-5">
        <Section label="Purpose"><p className="text-sm text-slate-700">{l.purpose}</p></Section>
        <Section label="Responsibilities"><BulletList items={l.responsibilities} /></Section>
        <Section label="KPIs"><BulletList items={l.kpis} tone="sky" /></Section>
        <Section label="Typical Roles"><BulletList items={l.roles} /></Section>
        <Section label="Example Workflows"><BulletList items={l.workflows} /></Section>
        <Section label="Business Outcomes">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{l.outcomes}</div>
        </Section>
      </div>
    ),
  };
}

function BulletList({ items, tone = "slate" }: { items: string[]; tone?: "slate" | "emerald" | "sky" }) {
  const colors: Record<string, string> = {
    slate: "text-slate-500", emerald: "text-emerald-600", sky: "text-sky-600",
  };
  return (
    <ul className="text-sm text-slate-700 space-y-1.5">
      {items.map((a) => (
        <li key={a} className="flex items-start gap-2">
          <ChevronRight className={`w-3.5 h-3.5 mt-1 ${colors[tone]}`} />
          <span>{a}</span>
        </li>
      ))}
    </ul>
  );
}
