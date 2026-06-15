import { useState, useMemo } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Activity, ShieldCheck, Timer, GitPullRequest, Rocket, DollarSign,
  Users2, Cloud, Boxes, Bot, Building2, BarChart3, TrendingUp, TrendingDown,
  ChevronRight, Sparkles, Target, FileDown, Calendar, Info, Heart, FileCheck2, Wallet, Smile,
  Workflow, Network, Layers, Compass, Gauge,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip as RTooltip, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, CartesianGrid,
} from "recharts";

/* ============================== Types & utils ============================== */

type Direction = "up" | "down" | "flat";
type Goodness = "good" | "bad" | "neutral";

type PanelSection = { heading: string; body: string | string[] };
type DetailPanel = {
  id: string;
  kicker?: string;
  title: string;
  summary: string;
  sections: PanelSection[];
  chart?: "trend" | "bar" | "donut" | "radar";
  chartData?: any[];
};

type HoverMeta = {
  definition: string;
  formula: string;
  why: string;
  sources: string[];
  owner: string;
  cadence: string;
  impact: string;
};

const trend = (base: number, slope: number, jitter = 1.2, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: `W${i + 1}`,
    v: Number((base + slope * i + (Math.random() - 0.5) * jitter).toFixed(2)),
  }));

/* ============================== Hover wrapper ============================== */

function HoverMetric({
  meta, children, onClick,
}: { meta: HoverMeta; children: React.ReactNode; onClick?: () => void }) {
  return (
    <TooltipProvider delayDuration={120}>
      <UITooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="block w-full cursor-pointer text-left transition focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-[360px] border border-slate-200 bg-white p-0 text-slate-900 shadow-lg"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Metric Detail</div>
          </div>
          <div className="space-y-2 px-3 py-3 text-[12px] leading-relaxed">
            <div><span className="font-semibold text-slate-900">Definition · </span><span className="text-slate-700">{meta.definition}</span></div>
            <div><span className="font-semibold text-slate-900">Formula · </span><span className="font-mono text-[11px] text-slate-700">{meta.formula}</span></div>
            <div><span className="font-semibold text-slate-900">Why it matters · </span><span className="text-slate-700">{meta.why}</span></div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Owner</div>
                <div className="text-slate-800">{meta.owner}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Update</div>
                <div className="text-slate-800">{meta.cadence}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Sources</div>
              <div className="text-slate-700">{meta.sources.join(" · ")}</div>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Business Impact</div>
              <div className="text-slate-800">{meta.impact}</div>
            </div>
          </div>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}

/* ============================== Building blocks ============================== */

function DeltaPill({ value, direction, good }: { value: string; direction: Direction; good: Goodness }) {
  const color =
    good === "good" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : good === "bad" ? "text-rose-700 bg-rose-50 border-rose-200"
    : "text-slate-700 bg-slate-50 border-slate-200";
  const Arrow = direction === "down" ? TrendingDown : TrendingUp;
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium ${color}`}>
      <Arrow className="h-3 w-3" />
      {value}
    </span>
  );
}

function MiniTrend({ data, color = "#0f172a", height = 44 }: { data: { x: string; v: number }[]; color?: string; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`mt-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={`url(#mt-${color.replace("#", "")})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScoreDonut({ value, color }: { value: number; color: string }) {
  const data = [{ v: value }, { v: 100 - value }];
  return (
    <div className="relative h-20 w-20">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="v" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
            <Cell fill={color} />
            <Cell fill="#eef2f7" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold tabular-nums text-slate-900">{value}</span>
        <span className="-mt-0.5 text-[10px] text-slate-500">/100</span>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 pb-2">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</div>
        <div className="text-base font-semibold text-slate-900">{title}</div>
      </div>
      {action ?? <div className="text-[11px] text-slate-400">Hover for definition · click to inspect</div>}
    </div>
  );
}

/* ============================== Data ============================== */

const COLORS = {
  blue: "#2563eb", indigo: "#4f46e5", violet: "#7c3aed", teal: "#0d9488",
  green: "#16a34a", emerald: "#059669", amber: "#d97706", orange: "#ea580c",
  rose: "#e11d48", slate: "#0f172a",
};

/* ---- Top KPI bar ---- */

type TopKpi = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: string;
  direction: Direction;
  good: Goodness;
  target: string;
  color: string;
  trend: { x: string; v: number }[];
  meta: HoverMeta;
  panel: DetailPanel;
};

const TOP_KPIS: TopKpi[] = [
  {
    id: "score",
    label: "Overall Maturity Score",
    value: "78", unit: "/100", delta: "↑ 12 pts", direction: "up", good: "good",
    target: "Maturing", color: COLORS.blue,
    trend: trend(60, 0.8),
    meta: {
      definition: "Composite score across Reliability, Ownership, Platform, Modernization, Automation, and Business Outcomes.",
      formula: "weighted avg(domain scores)",
      why: "Single executive read on whether the operating model is improving.",
      sources: ["SLO platform", "Service catalog", "FinOps", "Incident system"],
      owner: "VP Product Reliability",
      cadence: "Weekly",
      impact: "Indicates whether transformation investments are compounding.",
    },
    panel: makePanel("score", "Overall Maturity Score", "Composite executive index across all six domains.", [
      ["Executive Summary", "Score has moved from 66 → 78 over the last 90 days, driven by ownership coverage and automation gains."],
      ["Formula", "Weighted average of domain scores: Reliability 25%, Ownership 20%, Platform 15%, Modernization 15%, Automation 15%, Business Outcomes 10%."],
      ["Current Performance", ["Reliability 82", "Ownership 76", "Platform 81", "Modernization 73", "Automation 69", "Acquisition Readiness 74"]],
      ["Contributing Factors", ["SLO coverage up 14 pts", "MTTR down 28%", "Container adoption up 9 pts"]],
      ["Improvement Opportunities", ["Close ownership gaps on tier-2 services", "Increase automated recovery on tier-1"]],
      ["AI Opportunities", ["Auto-detect ownership drift", "Recommend SLO targets from telemetry"]],
    ]),
  },
  {
    id: "avail",
    label: "Service Availability (SLO)",
    value: "99.96%", delta: "↑ 0.03%", direction: "up", good: "good",
    target: "≥ 99.95%", color: COLORS.emerald,
    trend: trend(99.9, 0.002, 0.04),
    meta: {
      definition: "Weighted availability across tier-1 services, measured against SLO targets.",
      formula: "Σ(uptime_i × weight_i) ÷ Σ(weight_i)",
      why: "Direct measure of whether customers can use the product.",
      sources: ["SLO platform", "Synthetics", "RUM"],
      owner: "Director, SRE",
      cadence: "Real-time",
      impact: "Tied to revenue protection and customer trust.",
    },
    panel: makePanel("avail", "Service Availability (SLO)", "Tier-1 availability vs. SLO target.", [
      ["Service Breakdown", ["Claims API 99.97%", "Member Portal 99.94% (at risk)", "Provider Search 99.96%", "Auth Service 99.99%", "Payment Gateway 99.92% (at risk)"]],
      ["SLO Alignment", ["12 of 14 tier-1 services within budget", "2 services in burn-rate alert"]],
      ["Outage Analysis", ["Sev1 minutes ↓ 41% QoQ", "Top cause: dependent third-party"]],
      ["Improvement Opportunities", ["Add regional fallback for Payment Gateway", "Tighten Member Portal release gating"]],
    ]),
  },
  {
    id: "mttr",
    label: "MTTR (Sev 1)",
    value: "32m", delta: "↓ 28%", direction: "down", good: "good",
    target: "< 45m", color: COLORS.teal,
    trend: trend(50, -0.6, 2),
    meta: {
      definition: "Mean time to restore service for Sev 1 incidents.",
      formula: "Σ(restore_time) ÷ count(sev1)",
      why: "Measures the operational muscle to recover from severe impact.",
      sources: ["Incident system", "Status page"],
      owner: "Incident Commander Lead",
      cadence: "Daily",
      impact: "Lower MTTR = less customer-impacting minutes.",
    },
    panel: makePanel("mttr", "MTTR (Sev 1)", "Mean time to restore severity-1 incidents.", [
      ["Incident Timeline", ["Detect 4m", "Triage 6m", "Mitigate 14m", "Restore 8m"]],
      ["Escalation Analysis", ["Avg escalation layers: 1.6 → 1.2", "Auto-paging covers 92% of Sev1"]],
      ["Team Contribution", ["Platform: 26m", "Payments: 38m", "Auth: 22m"]],
      ["Automation Opportunities", ["Auto-rollback on burn-rate trigger", "Auto-failover for stateless tier"]],
    ]),
  },
  {
    id: "cfr",
    label: "Change Failure Rate",
    value: "6.2%", delta: "↓ 22%", direction: "down", good: "good",
    target: "< 10%", color: COLORS.amber,
    trend: trend(10, -0.15, 0.8),
    meta: {
      definition: "Percentage of changes that result in degraded service or rollback.",
      formula: "failed_changes ÷ total_changes",
      why: "Indicates release quality and platform maturity.",
      sources: ["CI/CD", "Incident system"],
      owner: "Platform Engineering",
      cadence: "Daily",
      impact: "Lower CFR enables higher velocity safely.",
    },
    panel: makePanel("cfr", "Change Failure Rate", "Release quality across teams.", [
      ["Failed Deployments", ["Last 90d: 47 failures of 758 deploys", "Top failing service: Member Portal"]],
      ["Rollbacks", ["Automated rollback used in 91% of failures"]],
      ["Root Causes", ["Config drift 34%", "Dependency upgrade 28%", "Data migration 18%"]],
      ["Release Quality Trends", "Quality improving for 6 consecutive weeks."],
    ]),
  },
  {
    id: "freq",
    label: "Deployment Frequency",
    value: "268", unit: "/ week", delta: "↑ 34%", direction: "up", good: "good",
    target: "Increasing", color: COLORS.indigo,
    trend: trend(180, 4, 8),
    meta: {
      definition: "Total production deployments per week across owned services.",
      formula: "count(prod_deploys) per week",
      why: "Higher safe frequency = smaller, lower-risk changes.",
      sources: ["CI/CD"],
      owner: "Platform Engineering",
      cadence: "Hourly",
      impact: "Faster, safer delivery into production.",
    },
    panel: makePanel("freq", "Deployment Frequency", "Velocity safely accelerating.", [
      ["Releases Per Team", ["Payments 64/wk", "Member 58/wk", "Auth 42/wk", "Search 38/wk"]],
      ["Velocity Trends", "Doubled over the last 2 quarters."],
      ["Platform Adoption Impact", ["Teams on golden paths deploy 3.1× more often"]],
    ]),
  },
  {
    id: "cost",
    label: "Cost Per Service",
    value: "$1,240", delta: "↓ 18%", direction: "down", good: "good",
    target: "Decreasing", color: COLORS.rose,
    trend: trend(1500, -10, 30),
    meta: {
      definition: "Average fully-loaded monthly cost per production service.",
      formula: "(infra + platform + labor) ÷ services",
      why: "Tracks unit economics of the operating model.",
      sources: ["FinOps", "Cloud bill", "HRIS"],
      owner: "FinOps Lead",
      cadence: "Daily",
      impact: "Direct lever on operating margin.",
    },
    panel: makePanel("cost", "Cost Per Service", "Unit economics trending down.", [
      ["Service Economics", ["Median $1,180", "P90 $4,320", "Top spender: data platform"]],
      ["Infrastructure Costs", ["Compute 48%", "Storage 18%", "Network 12%", "Other 22%"]],
      ["Platform Costs", ["Observability 11%", "Identity 4%", "CI/CD 3%"]],
      ["Labor Costs", ["On-call labor down 26% on automated services"]],
    ]),
  },
];

/* ---- Domain sections ---- */

type DomainMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  direction: Direction;
  good: Goodness;
  meta: HoverMeta;
  panel: DetailPanel;
};

type DomainBlock = {
  id: string;
  title: string;
  Icon: typeof ShieldCheck;
  color: string;
  score: number;
  scoreDelta: string;
  metrics: DomainMetric[];
  trendLabel: string;
  trendData: { x: string; v: number }[];
};

const reliability: DomainBlock = {
  id: "reliability", title: "Reliability Outcomes", Icon: ShieldCheck, color: COLORS.blue,
  score: 82, scoreDelta: "↑ 14 pts vs prior 90 days",
  trendLabel: "Sev 1 Incidents Over Time",
  trendData: Array.from({ length: 14 }, (_, i) => ({ x: `${i + 1}`, v: Math.max(2, Math.round(22 - i * 1.1 + (Math.random() - 0.5) * 4)) })),
  metrics: [
    dm("rel-avail", "Service Availability (SLO)", "99.96%", "↑", "up", "good",
      "Weighted tier-1 SLO compliance.", "Σ(uptime × weight)", "Customer-facing reliability.", "Director, SRE", "Real-time",
      ["SLO Compliance: 92% services within budget", "Error Budget Health: 76%", "Service Health: 12/14 green"]),
    dm("rel-sev1", "Sev 1 Incident Rate", "0.08 /mo", "↓", "down", "good",
      "Sev1 incidents per service per month.", "sev1 ÷ services ÷ months", "Frequency of severe customer impact.", "Incident Commander Lead", "Daily",
      ["Incident Trends: down 41% QoQ", "Service Impact: concentrated in 2 services", "Customer Impact: ↓ 38% impacted minutes"]),
    dm("rel-mttr", "MTTR (Sev 1)", "32m", "↓", "down", "good",
      "Mean time to restore Sev1.", "Σ(restore) ÷ count(sev1)", "Operational recovery muscle.", "IC Lead", "Daily",
      ["Mean: 32m", "Median: 24m", "P95: 78m"]),
    dm("rel-mttd", "MTTD (Sev 1)", "6m", "↓", "down", "good",
      "Mean time to detect Sev1.", "Σ(detect) ÷ count(sev1)", "Detection quality.", "Observability Team", "Real-time",
      ["Mean: 6m", "Median: 4m", "Detection via SLO burn 71%"]),
    dm("rel-budget", "Error Budget Burn (30d)", "24%", "✓", "flat", "good",
      "Share of 30-day error budget consumed.", "consumed ÷ budget", "Guides release gating.", "SRE Leads", "Hourly",
      ["Burn Trends: stable", "At-Risk Services: Member Portal, Payment Gateway", "Violations: 2 (recovered)"]),
    dm("rel-cfr", "Change Failure Rate", "6.2%", "↓", "down", "good",
      "Failed changes share.", "failed ÷ total", "Release quality.", "Platform Eng", "Daily",
      ["Deployment Risk: improving", "Rollback Frequency: 91% automated", "Root Causes: config drift dominant"]),
    dm("rel-unplanned", "Unplanned Work %", "18%", "↓", "down", "good",
      "Engineering time spent reactively.", "unplanned_hours ÷ total_hours", "Reduces firefighting; protects strategic work.", "Eng Managers", "Weekly",
      ["Interruptions: ↓ 24%", "Strategic Work Loss: ↓ 19%", "Reactive Work %: 18%"]),
  ],
};

const ownership: DomainBlock = {
  id: "ownership", title: "Ownership & Accountability", Icon: Users2, color: COLORS.violet,
  score: 76, scoreDelta: "↑ 10 pts vs prior 90 days",
  trendLabel: "Ownership Coverage Trend",
  trendData: trend(70, 1.6, 1.5, 14),
  metrics: [
    dm("own-svc", "Service Ownership Coverage", "96%", "↑", "up", "good",
      "Production services with a formally assigned owner.", "owned_services ÷ total_services",
      "Accountability and faster incident resolution.", "VP Product Reliability", "Daily",
      ["Services With Owners: 192/200", "Services Without Owners: 8", "Ownership Trends: +6 pts QoQ"]),
    dm("own-prod", "Product Ownership Coverage", "92%", "↑", "up", "good",
      "Product-managed services with named product owner.", "owned ÷ total_product_services",
      "Aligns reliability with product priorities.", "Head of Product Ops", "Weekly",
      ["Product Teams: 24", "Assigned Owners: 22", "Accountability Gaps: 2 teams"]),
    dm("own-slo", "SLO Coverage", "94%", "↑", "up", "good",
      "Services with formally defined SLOs.", "services_with_slos ÷ total",
      "Enables error-budget-driven operations.", "SRE Leads", "Weekly",
      ["Services With SLOs: 188", "Services Missing SLOs: 12"]),
    dm("own-esc", "Escalation Layers (Avg)", "1.6", "↓", "down", "good",
      "Average escalation layers per incident.", "Σ escalations ÷ incidents",
      "Indicator of ownership clarity.", "IC Lead", "Per incident",
      ["Average Escalations Per Incident: 1.6", "Trend Over Time: ↓ from 2.4"]),
    dm("own-hand", "Handoffs Per Incident", "1.8", "↓", "down", "good",
      "Team handoffs per incident.", "Σ handoffs ÷ incidents",
      "Reduces delay and miscommunication.", "IC Lead", "Per incident",
      ["Team Handoffs: 1.8 avg", "Delay Analysis: ~12m per handoff"]),
    dm("own-collab", "Team Collaboration Score", "4.4 / 5", "↑", "up", "good",
      "Cross-team collaboration health index.", "survey + shared resolution rate",
      "Predictor of resolution speed and ownership culture.", "Head of Eng Ops", "Monthly",
      ["Cross-Team Work: 38% of issues", "Shared Resolution Rates: 71%"]),
  ],
};

const platform: DomainBlock = {
  id: "platform", title: "Platform Engineering", Icon: Cloud, color: COLORS.teal,
  score: 81, scoreDelta: "↑ 11 pts vs prior 90 days",
  trendLabel: "Self-Service Adoption Trend",
  trendData: trend(48, 2.1, 2, 14),
  metrics: [
    dm("plat-ss", "Self-Service Adoption", "78%", "↑", "up", "good",
      "Provisioning requests served via self-service.", "self_service ÷ total_requests",
      "Removes the platform-team queue.", "Platform PM", "Daily",
      ["Self-Service Requests: 1,840/mo", "Manual Requests: 520/mo", "Adoption Trends: +14 pts QoQ"]),
    dm("plat-adopt", "Platform Adoption", "88%", "↑", "up", "good",
      "Services consuming the internal platform.", "consumers ÷ total_services",
      "Leverage on shared investments.", "Platform PM", "Weekly",
      ["Platform Consumers: 176", "Platform Utilization: 88%"]),
    dm("plat-std", "Standardization Coverage", "92%", "↑", "up", "good",
      "Services on golden baseline (image, pipeline, observability).", "standardized ÷ total",
      "Predictability and inheritance of controls.", "Platform Eng", "Weekly",
      ["Image baseline: 96%", "Pipeline baseline: 91%", "Observability baseline: 89%"]),
    dm("plat-gp", "Golden Path Utilization", "74%", "↑", "up", "good",
      "Workflows shipped through golden paths.", "golden_path ÷ total",
      "Lower cognitive load, fewer mistakes.", "Platform PM", "Weekly",
      ["Pipeline Adoption: 78%", "Template Adoption: 71%"]),
    dm("plat-iac", "IaC Coverage", "100%", "✓", "flat", "good",
      "Infrastructure managed by code.", "iac_assets ÷ total_assets",
      "Reproducibility and drift control.", "Platform Eng", "Daily",
      ["IaC Managed Assets: 100%", "Manual Assets: 0"]),
    dm("plat-drift", "Configuration Drift", "2.1%", "↓", "down", "good",
      "Share of assets drifted from baseline.", "drifted ÷ total",
      "Signals control plane health.", "Platform Eng", "Daily",
      ["Drift: 2.1%", "Compliance: 97.9%", "Standardization holding"]),
  ],
};

const modernization: DomainBlock = {
  id: "modernization", title: "Modernization", Icon: Boxes, color: COLORS.amber,
  score: 73, scoreDelta: "↑ 9 pts vs prior 90 days",
  trendLabel: "Technical Debt Index Trend",
  trendData: trend(70, -1.4, 1.4, 14).map(d => ({ ...d, v: Math.max(35, d.v) })),
  metrics: [
    dm("mod-cont", "Container Adoption", "62%", "↑", "up", "good",
      "Workloads running as containers.", "containerized ÷ total_workloads",
      "Enables platform leverage.", "Architecture", "Weekly",
      ["Containerized Services: 124", "Non-Containerized Services: 76"]),
    dm("mod-debt", "Technical Debt Index", "41", "↓ 19%", "down", "good",
      "Composite debt score across services.", "weighted(debt_categories)",
      "Predicts future change risk.", "Architecture", "Monthly",
      ["Debt Categories: legacy framework, data coupling, manual config", "Debt Trends: ↓ 19% QoQ", "Service Contribution: 6 services drive 60% of debt"]),
    dm("mod-leg", "Legacy Asset %", "28%", "↓", "down", "good",
      "Share of estate on legacy platforms.", "legacy_assets ÷ total",
      "Reduces compounding risk.", "Architecture", "Monthly",
      ["Legacy Platforms: 4", "Risk Analysis: 2 high-risk under active migration"]),
    dm("mod-rat", "App Rationalization (YTD)", "17", "↑", "up", "good",
      "Applications consolidated or retired YTD.", "retired_or_merged",
      "Removes duplicate spend and risk.", "Portfolio Mgmt", "Quarterly",
      ["Consolidated Platforms: 6", "Remaining Targets: 12"]),
    dm("mod-cloud", "Cloud Workload %", "71%", "↑", "up", "good",
      "Workloads on target cloud.", "cloud_workloads ÷ total",
      "Enables managed-service leverage.", "Architecture", "Weekly",
      ["Cloud Workloads: 142", "On-prem Workloads: 58"]),
    dm("mod-vel", "Modernization Velocity", "1.6×", "↑", "up", "good",
      "Pace of modernization vs. baseline.", "current_progress ÷ baseline_pace",
      "Indicates whether the program is compounding.", "VP Engineering", "Quarterly",
      ["Quarterly Progress: +18%", "Program Progress: 62% of multi-year plan"]),
  ],
};

const automation: DomainBlock = {
  id: "automation", title: "Automation & AI", Icon: Bot, color: COLORS.indigo,
  score: 69, scoreDelta: "↑ 12 pts vs prior 90 days",
  trendLabel: "Toil Hours Trend",
  trendData: trend(360, -10, 12, 14).map(d => ({ ...d, v: Math.max(120, d.v) })),
  metrics: [
    dm("auto-cov", "Automation Coverage", "64%", "↑", "up", "good",
      "Workflows automated end-to-end.", "automated_workflows ÷ total",
      "Reduces toil and human error.", "Platform Eng", "Weekly",
      ["Automated Workflows: 642", "Manual Workflows: 358"]),
    dm("auto-toil", "Toil Reduction (YTD)", "28%", "↑", "up", "good",
      "Reduction in measured toil hours.", "(baseline − current) ÷ baseline",
      "Reclaims engineering capacity.", "SRE Leads", "Weekly",
      ["Hours Eliminated: ~1,240/mo", "Labor Savings: significant"]),
    dm("auto-rec", "Automated Recovery %", "41%", "↑", "up", "good",
      "Incidents resolved without human action.", "auto_recovered ÷ incidents",
      "Faster restore, smaller blast radius.", "SRE Leads", "Per incident",
      ["Recovery Events: 184/qtr", "Human Interventions: 264/qtr"]),
    dm("auto-val", "Automated Validation %", "56%", "↑", "up", "good",
      "Releases auto-validated pre-promote.", "auto_validated ÷ releases",
      "Catches defects before customers do.", "Platform Eng", "Daily",
      ["Validation Coverage: 56%", "Quality Improvement: failures ↓ 22%"]),
    dm("auto-agent", "Agentic Workflows Live", "12", "↑", "up", "good",
      "Production AI-agent workflows.", "count(agentic_workflows)",
      "Frontier capability for ops scale.", "AI Ops PM", "Weekly",
      ["AI-Assisted Workflows: 12", "Human Approval Points: 4"]),
    dm("auto-int", "Manual Interventions /wk", "38", "↓", "down", "good",
      "Weekly manual ops interventions.", "count(manual_actions) / wk",
      "Inverse signal of automation maturity.", "SRE Leads", "Weekly",
      ["Manual Interventions: 38", "Down from 92 baseline"]),
  ],
};

const acquisition: DomainBlock = {
  id: "acquisition", title: "Acquisition Readiness", Icon: Building2, color: COLORS.green,
  score: 74, scoreDelta: "↑ 8 pts vs prior 90 days",
  trendLabel: "Time to Ops Readiness Trend",
  trendData: trend(75, -1.2, 2, 14).map(d => ({ ...d, v: Math.max(35, d.v) })),
  metrics: [
    dm("acq-ttor", "Time to Ops Readiness", "42 days", "↓", "down", "good",
      "Days from close to operational readiness.", "ops_ready_date − close_date",
      "Speed of value capture on acquisitions.", "M&A Ops", "Per deal",
      ["Acquire → Assess → Standardize → Integrate → Operate", "42 days (was 96)"]),
    dm("acq-std", "Standardization Coverage", "89%", "↑", "up", "good",
      "Inherited platform coverage on integration.", "covered_domains ÷ 5",
      "Reduces bespoke integration work.", "M&A Ops", "Per deal",
      ["Identity ✓", "Monitoring ✓", "Security ✓", "CI/CD ✓", "FinOps in progress"]),
    dm("acq-dur", "Integration Duration (Avg)", "48 days", "↓", "down", "good",
      "Avg duration of integration program.", "Σ(durations) ÷ deals",
      "Speed of operational consolidation.", "M&A Ops", "Per deal",
      ["Current: 48d", "Target: 30d", "Trend: improving"]),
    dm("acq-dup", "Duplicate Platforms Removed", "34", "↑", "up", "good",
      "Duplicate platforms removed post-acquisition.", "count(retired)",
      "Removes cost and complexity.", "M&A Ops", "Quarterly",
      ["Consolidation Progress: 34 platforms retired", "12 in pipeline"]),
    dm("acq-data", "Data Migration Success", "98%", "↑", "up", "good",
      "Data migrations completed without rollback.", "successful ÷ total_migrations",
      "Predicts customer-facing risk on cutover.", "Data Eng", "Per migration",
      ["Successful: 98%", "Rollbacks: 2 of 96"]),
    dm("acq-inc", "Post-Acquisition Incidents", "0.9 /mo", "↓", "down", "good",
      "Incidents attributable to recent integration.", "integration_incidents ÷ months",
      "Health of integration outcomes.", "M&A Ops", "Monthly",
      ["Incidents: 0.9/mo", "Down from 3.4/mo baseline"]),
  ],
};

const DOMAINS: DomainBlock[] = [reliability, ownership, platform, modernization, automation, acquisition];

/* ---- Business Impact rail ---- */

type BizOutcome = {
  id: string; label: string; value: string; delta: string; direction: Direction; good: Goodness;
  Icon: typeof Heart; meta: HoverMeta; panel: DetailPanel;
};
const BUSINESS_OUTCOMES: BizOutcome[] = [
  bo("bo-care", "Caregiver Experience (Uptime)", "99.93%", "↑ 0.04%", "up", "good", Heart,
    "Availability of caregiver-facing workflows.", "weighted(uptime over caregiver journeys)",
    "Reliable visits and shift execution.", "VP Field Ops", "Real-time",
    [["Failed Visits", ["Down 22% QoQ"]],
     ["Mobile App Reliability", ["Crash-free sessions 99.8%"]],
     ["Connectivity Issues", ["Offline sync success 99.6%"]]]),
  bo("bo-claims", "Claims Processing Reliability", "99.95%", "↑ 0.05%", "up", "good", FileCheck2,
    "Reliability of claims processing pipeline.", "successful ÷ submitted",
    "Direct revenue continuity.", "Director, Revenue Cycle", "Hourly",
    [["Throughput", ["Avg 18.2k claims/day"]],
     ["Delays", ["P95 process time: 42m"]],
     ["Failures", ["0.05% failure, all recovered"]]]),
  bo("bo-payroll", "Payroll Reliability", "99.98%", "↑ 0.02%", "up", "good", Wallet,
    "Successful payroll runs vs. scheduled.", "successful ÷ scheduled",
    "People-facing trust metric.", "VP People Ops", "Per run",
    [["Payroll Success", ["120 of 120 runs"]],
     ["Delayed Payments", ["0 in last 90d"]],
     ["Processing Errors", ["3 minor, auto-corrected"]]]),
  bo("bo-csat", "Customer Satisfaction (CSAT)", "4.6 / 5", "↑ 0.2", "up", "good", Smile,
    "Composite CSAT score across channels.", "weighted(survey scores)",
    "Leading indicator of retention.", "Head of CX", "Weekly",
    [["Service Health", ["Tier-1 green"]],
     ["Experience Trends", ["+0.2 in 90d"]],
     ["Customer Impact", ["Complaints ↓ 18%"]]]),
  bo("bo-rev", "Revenue Protection", "$8.7M", "↑ 12%", "up", "good", DollarSign,
    "Revenue protected by reliability improvements.", "incidents_avoided × revenue_at_risk",
    "Translates reliability into dollars.", "CFO Office", "Monthly",
    [["Avoided Outage Minutes", ["~3,400/mo"]],
     ["Revenue at Risk", ["Reduced 42% YoY"]],
     ["Coverage", ["All tier-1 journeys instrumented"]]]),
  bo("bo-int", "Service Interruptions", "↓ 42%", "vs prior 90 days", "down", "good", Activity,
    "Reduction in customer-impacting interruptions.", "(baseline − current) ÷ baseline",
    "Direct trust signal.", "Director, SRE", "Weekly",
    [["Tier-1 Interruptions", ["Down 48%"]],
     ["Tier-2 Interruptions", ["Down 31%"]]]),
];

/* ---- Insights ---- */

type Insight = { id: string; title: string; sub: string; tone: "good" | "warn"; panel: DetailPanel };
const INSIGHTS: Insight[] = [
  ins("in-1", "SLO attainment improving across 92% of critical services", "Driven by error-budget gating + platform releases", "good"),
  ins("in-2", "MTTR improved 28% due to better observability and automated runbooks", "Top contributors: Auth, Payments", "good"),
  ins("in-3", "Technical debt down 19% with increased refactoring velocity", "6 services drive 60% of remaining debt", "good"),
  ins("in-4", "Automation is saving ~1,240 operational hours per month", "Concentrated in provisioning + remediation", "good"),
  ins("in-5", "Member Portal and Payment Gateway burning error budget", "Recommend release gating until burn stabilizes", "warn"),
];

/* ---- Benchmarks ---- */

const BENCHMARKS = [
  bm("bm-avail", "Service Availability", "99.96%", "99.50%", "99.95%"),
  bm("bm-mttr", "MTTR (Sev 1)", "32m", "78m", "28m"),
  bm("bm-cfr", "Change Failure Rate", "6.2%", "15%", "5%"),
  bm("bm-freq", "Deployment Frequency", "268 /wk", "52 /wk", "320 /wk"),
  bm("bm-cost", "Cost per Service", "$1,240", "$1,890", "$1,020"),
];

/* ---- Error budget burn rows ---- */

const BURN_ROWS = [
  { svc: "Claims API", slo: "99.95%", burn: "18%", status: "Healthy" as const, trend: trend(20, -0.1, 1, 12) },
  { svc: "Member Portal", slo: "99.90%", burn: "32%", status: "At Risk" as const, trend: trend(28, 0.3, 1, 12) },
  { svc: "Provider Search", slo: "99.95%", burn: "12%", status: "Healthy" as const, trend: trend(14, -0.05, 1, 12) },
  { svc: "Auth Service", slo: "99.99%", burn: "6%", status: "Healthy" as const, trend: trend(8, -0.05, 0.6, 12) },
  { svc: "Payment Gateway", slo: "99.95%", burn: "45%", status: "At Risk" as const, trend: trend(36, 0.4, 1, 12) },
];

/* ---- Deployment performance ---- */

const DEPLOY_METRICS = [
  { id: "dp-lead", label: "Lead Time for Change", value: "2.1", unit: "days", delta: "↓ 18%", direction: "down" as Direction, good: "good" as Goodness, score: 80, color: COLORS.blue,
    meta: hm("Time from commit to production.", "merge_time − deploy_time", "Throughput health.", "Platform Eng", "Daily", "Faster, safer delivery."),
    panel: makePanel("dp-lead", "Lead Time for Change", "Commit → production.", [
      ["Team Breakdown", ["Payments 1.4d", "Member 2.6d", "Auth 1.9d"]],
      ["Service Breakdown", "Spread narrowing across services."],
      ["Trend Analysis", "Down 18% in 90 days."],
    ]) },
  { id: "dp-freq", label: "Deployment Frequency", value: "268", unit: "/ week", delta: "↑ 34%", direction: "up" as Direction, good: "good" as Goodness, score: 86, color: COLORS.indigo,
    meta: hm("Production deploys per week.", "count(prod_deploys)/wk", "Velocity + smaller changes.", "Platform Eng", "Hourly", "Lower change risk."),
    panel: makePanel("dp-freq", "Deployment Frequency", "Safely accelerating velocity.", [
      ["Team Breakdown", ["Payments 64/wk", "Member 58/wk", "Auth 42/wk"]],
      ["Trend Analysis", "Doubled in 2 quarters."],
    ]) },
  { id: "dp-cfr", label: "Change & Fail Rate", value: "6.2%", unit: "", delta: "↓ 22%", direction: "down" as Direction, good: "good" as Goodness, score: 74, color: COLORS.amber,
    meta: hm("Failed changes share.", "failed÷total", "Release quality.", "Platform Eng", "Daily", "Confidence to ship more."),
    panel: makePanel("dp-cfr", "Change Failure Rate", "Release quality improving.", [
      ["Team Breakdown", ["Top failing: Member Portal"]],
      ["Trend Analysis", "6 consecutive weeks improving."],
    ]) },
  { id: "dp-mttr", label: "Mean Time to Restore", value: "32m", unit: "", delta: "↓ 28%", direction: "down" as Direction, good: "good" as Goodness, score: 82, color: COLORS.teal,
    meta: hm("Mean time to restore.", "Σrestore÷count", "Operational muscle.", "IC Lead", "Daily", "Less customer impact."),
    panel: makePanel("dp-mttr", "Mean Time to Restore", "Restore speed across teams.", [
      ["Team Breakdown", ["Platform 26m", "Payments 38m", "Auth 22m"]],
      ["Trend Analysis", "Down 28% in 90 days."],
    ]) },
];

/* ============================== Helpers ============================== */

function makePanel(id: string, title: string, summary: string, rows: [string, string | string[]][], kicker?: string): DetailPanel {
  return { id, title, summary, kicker, sections: rows.map(([heading, body]) => ({ heading, body })) };
}

function hm(definition: string, formula: string, why: string, owner: string, cadence: string, impact: string): HoverMeta {
  return { definition, formula, why, owner, cadence, impact, sources: ["SLO platform", "Service catalog", "CI/CD"] };
}

function dm(
  id: string, label: string, value: string, delta: string, direction: Direction, good: Goodness,
  definition: string, formula: string, why: string, owner: string, cadence: string,
  panelBullets: string[],
): DomainMetric {
  return {
    id, label, value, delta, direction, good,
    meta: hm(definition, formula, why, owner, cadence, "Improves reliability, ownership clarity, or unit economics."),
    panel: makePanel(id, label, definition, [
      ["Executive Summary", `${label} is ${value} (${delta}).`],
      ["Why This Matters", why],
      ["Formula", formula],
      ["Current Performance", panelBullets],
      ["Improvement Opportunities", ["Close measurement gaps", "Tighten release gating", "Invest in platform leverage"]],
      ["AI Opportunities", ["Anomaly detection", "Auto-routing & summarization", "Predictive risk scoring"]],
      ["Related Metrics", ["SLO Compliance", "Error Budget Burn", "Change Failure Rate"]],
    ]),
  };
}

function bo(
  id: string, label: string, value: string, delta: string, direction: Direction, good: Goodness,
  Icon: typeof Heart, definition: string, formula: string, why: string, owner: string, cadence: string,
  panelRows: [string, string[]][],
): BizOutcome {
  return {
    id, label, value, delta, direction, good, Icon,
    meta: hm(definition, formula, why, owner, cadence, "Directly tied to revenue, retention, or trust."),
    panel: makePanel(id, label, definition, panelRows),
  };
}

function ins(id: string, title: string, sub: string, tone: "good" | "warn"): Insight {
  return {
    id, title, sub, tone,
    panel: makePanel(id, title, sub, [
      ["Why It Happened", "Composite of platform investments, ownership clarification, and SLO-based release gating."],
      ["Teams Contributing", ["Platform Engineering", "SRE", "Top 3 stream-aligned teams"]],
      ["Business Impact", ["Customer-impacting minutes reduced", "Operational hours reclaimed"]],
      ["Recommended Next Steps", ["Promote pattern to remaining tier-1 services", "Codify in golden path"]],
    ]),
  };
}

function bm(id: string, label: string, you: string, median: string, top: string): { id: string; label: string; you: string; median: string; top: string; panel: DetailPanel } {
  return {
    id, label, you, median, top,
    panel: makePanel(id, `${label} — Benchmark`, "Internal vs. industry vs. top-quartile.", [
      ["Internal Benchmark", you],
      ["Industry Benchmark", median],
      ["Top Quartile Benchmark", top],
      ["Gap Analysis", "Currently between median and top quartile."],
      ["Recommended Improvements", ["Adopt golden paths on lagging services", "Tighten release gating", "Automate validation"]],
    ]),
  };
}

/* ============================== Component ============================== */

export default function MeasuringSuccess() {
  const [panel, setPanel] = useState<DetailPanel | null>(null);

  const radarData = useMemo(() => DOMAINS.map(d => ({ subject: d.title.split(" ")[0], score: d.score })), []);

  return (
    <AppShell>
      <div className="min-h-full bg-white text-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1700px] px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300">
                <Gauge className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <span>Site Resilience Engineering</span><span>·</span><span>Executive Scorecard</span>
                </div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  Measuring Success at a Modern Product Reliability Organization
                </h1>
                <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">
                  Data-driven indicators that prove operational excellence, accelerate delivery, and drive measurable
                  business outcomes. Hover any metric for its definition · click to open the executive detail panel.
                </p>
              </div>
              <div className="hidden flex-col gap-2 md:flex">
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:border-slate-900">
                  <Calendar className="h-3.5 w-3.5" /> Last 90 Days
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-slate-800">
                  <FileDown className="h-3.5 w-3.5" /> Export Report
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="mx-auto max-w-[1700px] px-8 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Main column */}
            <div className="col-span-12 xl:col-span-9 space-y-6">
              {/* Top KPI bar */}
              <section>
                <SectionHeader eyebrow="Executive KPI Bar" title="The six numbers leadership tracks weekly" />
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {TOP_KPIS.map((k) => (
                    <HoverMetric key={k.id} meta={k.meta} onClick={() => setPanel(k.panel)}>
                      <div className="group rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-400 hover:shadow-sm">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{k.label}</div>
                        {k.id === "score" ? (
                          <div className="mt-2 flex items-center gap-3">
                            <ScoreDonut value={Number(k.value)} color={k.color} />
                            <div>
                              <DeltaPill value={k.delta} direction={k.direction} good={k.good} />
                              <div className="mt-1 text-[10px] text-slate-500">vs prior 90 days</div>
                              <div className="mt-1 text-[10px] font-medium" style={{ color: k.color }}>{k.target}</div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-2xl font-semibold tabular-nums text-slate-900">{k.value}</span>
                              {k.unit && <span className="text-[11px] text-slate-500">{k.unit}</span>}
                              <span className="ml-auto"><DeltaPill value={k.delta} direction={k.direction} good={k.good} /></span>
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-500">Target: {k.target}</div>
                            <div className="mt-1"><MiniTrend data={k.trend} color={k.color} height={32} /></div>
                          </>
                        )}
                      </div>
                    </HoverMetric>
                  ))}
                </div>
              </section>

              {/* Domain grid */}
              <section>
                <SectionHeader eyebrow="Domain Scorecards" title="Reliability · Ownership · Platform · Modernization · Automation · Acquisition" />
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {DOMAINS.map((d) => (
                    <DomainCard key={d.id} d={d} onOpen={setPanel} />
                  ))}
                </div>
              </section>

              {/* Reliability trend + Error budget + Deployment performance */}
              <section className="grid grid-cols-12 gap-4">
                {/* Reliability Trend */}
                <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Reliability Trend (90 Days)</div>
                      <div className="text-sm font-semibold text-slate-900">Availability, MTTR, Sev 1 Incidents</div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Availability</span>
                      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> MTTR</span>
                      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Sev 1</span>
                    </div>
                  </div>
                  <div className="mt-3 h-56">
                    <ResponsiveContainer>
                      <LineChart data={Array.from({ length: 24 }, (_, i) => ({
                        x: `D${i + 1}`,
                        availability: 99.7 + Math.min(0.3, i * 0.012) + Math.sin(i / 3) * 0.04,
                        mttr: Math.max(28, 60 - i * 1.2 + Math.cos(i / 4) * 3),
                        sev1: Math.max(2, 16 - i * 0.4 + Math.sin(i / 3) * 2),
                      }))} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="x" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                        <YAxis yAxisId="l" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} domain={[99.5, 100]} />
                        <YAxis yAxisId="r" orientation="right" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                        <RTooltip contentStyle={{ fontSize: 12, borderColor: "#e2e8f0" }} />
                        <Line yAxisId="l" type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line yAxisId="r" type="monotone" dataKey="mttr" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line yAxisId="r" type="monotone" dataKey="sev1" stroke="#7c3aed" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Error Budget Burn */}
                <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Error Budget Burn (Top 5)</div>
                      <div className="text-sm font-semibold text-slate-900">Service-level burn over last 30 days</div>
                    </div>
                  </div>
                  <div className="mt-3 overflow-hidden rounded border border-slate-100">
                    <table className="w-full text-[12px]">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Service</th>
                          <th className="px-3 py-2 text-left font-medium">SLO</th>
                          <th className="px-3 py-2 text-left font-medium">Burn</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                          <th className="px-3 py-2 text-left font-medium">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {BURN_ROWS.map((r) => (
                          <tr key={r.svc} className="cursor-pointer hover:bg-slate-50"
                              onClick={() => setPanel(makePanel(`burn-${r.svc}`, `${r.svc} · Error Budget`, `Burn rate at ${r.burn} of 30-day budget.`, [
                                ["SLO", r.slo],
                                ["Current Burn", r.burn],
                                ["Status", r.status],
                                ["Recommended Actions", r.status === "At Risk" ? ["Gate releases", "Investigate top causes", "Notify product owner"] : ["Maintain current cadence"]],
                              ]))}>
                            <td className="px-3 py-2 font-medium text-slate-900">{r.svc}</td>
                            <td className="px-3 py-2 text-slate-700">{r.slo}</td>
                            <td className="px-3 py-2 text-slate-700">{r.burn}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                                r.status === "Healthy" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-3 py-2"><div className="w-20"><MiniTrend data={r.trend} color={r.status === "Healthy" ? "#10b981" : "#f59e0b"} height={24} /></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Deployment Performance */}
                <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Deployment Performance</div>
                  <div className="text-sm font-semibold text-slate-900">DORA across teams</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {DEPLOY_METRICS.map((d) => (
                      <HoverMetric key={d.id} meta={d.meta} onClick={() => setPanel(d.panel)}>
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 hover:border-slate-400">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">{d.label}</div>
                          <div className="mt-1 flex items-center justify-between">
                            <ScoreDonut value={d.score} color={d.color} />
                          </div>
                          <div className="mt-1 flex items-baseline justify-between">
                            <div className="text-sm font-semibold tabular-nums text-slate-900">{d.value}<span className="ml-0.5 text-[10px] text-slate-500">{d.unit}</span></div>
                            <DeltaPill value={d.delta} direction={d.direction} good={d.good} />
                          </div>
                        </div>
                      </HoverMetric>
                    ))}
                  </div>
                </div>
              </section>

              {/* Footer note */}
              <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <Info className="mt-0.5 h-4 w-4 text-slate-600" />
                <div className="text-sm text-slate-700">
                  These metrics are most valuable when reviewed regularly at the executive level and used to drive
                  <span className="ml-1 font-medium text-slate-900">decisions, investments, and continuous improvement.</span>
                </div>
              </div>
            </div>

            {/* Right rail */}
            <aside className="col-span-12 space-y-5 xl:col-span-3">
              {/* Business Impact */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Business Impact (90 days)</div>
                  <Target className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <ul className="divide-y divide-slate-100">
                  {BUSINESS_OUTCOMES.map((b) => (
                    <li key={b.id}>
                      <HoverMetric meta={b.meta} onClick={() => setPanel(b.panel)}>
                        <div className="flex w-full items-start gap-3 px-4 py-3 hover:bg-slate-50">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <b.Icon className="h-4 w-4 text-slate-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-slate-800">{b.label}</div>
                            <div className="mt-0.5 flex items-baseline justify-between gap-2">
                              <div className="text-base font-semibold tabular-nums text-slate-900">{b.value}</div>
                              <DeltaPill value={b.delta} direction={b.direction} good={b.good} />
                            </div>
                          </div>
                        </div>
                      </HoverMetric>
                    </li>
                  ))}
                </ul>
                <button className="block w-full border-t border-slate-200 px-4 py-2 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                  View Business Impact Dashboard →
                </button>
              </div>

              {/* Insights */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                  <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Key Insights</div>
                </div>
                <ul className="divide-y divide-slate-100">
                  {INSIGHTS.map((i) => (
                    <li key={i.id}>
                      <button onClick={() => setPanel(i.panel)} className="block w-full px-4 py-3 text-left hover:bg-slate-50">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${i.tone === "good" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <div>
                            <div className="text-[12.5px] leading-snug text-slate-800">{i.title}</div>
                            <div className="mt-0.5 text-[11px] text-slate-500">{i.sub}</div>
                          </div>
                          <ChevronRight className="ml-auto mt-0.5 h-3.5 w-3.5 text-slate-300" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benchmarks */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Industry Benchmarking</div>
                  <button className="text-[11px] font-medium text-slate-700 hover:underline">View Details →</button>
                </div>
                <table className="w-full text-[12px]">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Metric</th>
                      <th className="px-2 py-2 text-left font-medium">Your Org</th>
                      <th className="px-2 py-2 text-left font-medium">Median</th>
                      <th className="px-2 py-2 text-left font-medium">Top</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {BENCHMARKS.map((b) => (
                      <tr key={b.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setPanel(b.panel)}>
                        <td className="px-3 py-2 font-medium text-slate-800">{b.label}</td>
                        <td className="px-2 py-2 font-semibold text-slate-900">{b.you}</td>
                        <td className="px-2 py-2 text-slate-600">{b.median}</td>
                        <td className="px-2 py-2 text-emerald-700">{b.top}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Maturity Radar */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Maturity by Domain</div>
                <div className="mt-2 h-48">
                  <ResponsiveContainer>
                    <RadarChart data={radarData} outerRadius="78%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.12} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Detail Sheet */}
        <Sheet open={!!panel} onOpenChange={(o) => !o && setPanel(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto bg-white sm:max-w-xl lg:max-w-2xl">
            {panel && (
              <>
                <SheetHeader className="text-left">
                  {panel.kicker && (
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{panel.kicker}</div>
                  )}
                  <SheetTitle className="text-2xl text-slate-900">{panel.title}</SheetTitle>
                  <SheetDescription className="text-slate-600">{panel.summary}</SheetDescription>
                </SheetHeader>
                <Separator className="my-5" />
                <div className="space-y-6 pb-10">
                  {panel.sections.map((s, idx) => (
                    <div key={idx}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{s.heading}</div>
                      <div className="mt-2">
                        {Array.isArray(s.body) ? (
                          <ul className="space-y-1.5 text-sm text-slate-700">
                            {s.body.map((b, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm leading-relaxed text-slate-700">{s.body}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}

/* ============================== DomainCard ============================== */

function DomainCard({ d, onOpen }: { d: DomainBlock; onOpen: (p: DetailPanel) => void }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 w-full" style={{ backgroundColor: d.color }} />
      <div className="flex items-start gap-3 px-4 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${d.color}14` }}>
          <d.Icon className="h-4 w-4" style={{ color: d.color }} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: d.color }}>{d.title}</div>
          <div className="text-sm font-semibold text-slate-900">Domain Scorecard</div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreDonut value={d.score} color={d.color} />
          <div className="hidden text-right md:block">
            <DeltaPill value={d.scoreDelta.split(" ")[0] + " " + d.scoreDelta.split(" ")[1]} direction="up" good="good" />
            <div className="mt-1 text-[10px] text-slate-500">vs prior 90 days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 px-4 pt-3">
        {d.metrics.map((m) => (
          <HoverMetric key={m.id} meta={m.meta} onClick={() => onOpen(m.panel)}>
            <div className="flex items-center justify-between border-t border-slate-100 py-2 hover:bg-slate-50">
              <div className="text-[12.5px] text-slate-700">{m.label}</div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold tabular-nums text-slate-900">{m.value}</span>
                <DeltaPill value={m.delta} direction={m.direction} good={m.good} />
              </div>
            </div>
          </HoverMetric>
        ))}
      </div>

      <div className="px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{d.trendLabel}</div>
        <div className="mt-1">
          <MiniTrend data={d.trendData} color={d.color} height={56} />
        </div>
      </div>
    </article>
  );
}
