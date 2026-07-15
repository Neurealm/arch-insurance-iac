import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Bot, Search, Sparkles, PlayCircle, GitBranch, Brain, ChevronDown, ChevronRight,
  Activity, Clock, DollarSign, ShieldCheck, HeartPulse, TrendingUp, Users, AlertTriangle,
  Cpu, Cloud, Server, Network, Lock, Smartphone, LayoutGrid, HardDrive, LineChart,
  Stethoscope, Gavel, Rocket, Wrench, X, CheckCircle2, Layers,
} from "lucide-react";

/* ------------------------------ Data model ------------------------------ */

type AutomationLevel = "Autonomous" | "Supervised" | "Recommend";
type Status = "Running" | "Idle" | "Learning" | "Awaiting Approval";

type Coworker = {
  name: string;
  outcome: string;
  problem: string;
  trigger: string;
  automation: AutomationLevel;
  confidence: number; // 0-100
  approval: boolean;
  hoursSaved: number; // annual
  healthcareValue: string;
  dependencies: string[];
  status: Status;
  kpis: { l: string; v: string }[];
  // Drawer detail:
  purpose: string;
  businessValue: string;
  healthcareExamples: string[];
  workflow: string[];
  reasoning: string[];
  apis: string[];
  roi: string;
  related: string[];
  history: { t: string; e: string }[];
  risk: number;
  knowledge: string[];
};

type Section = {
  key: string;
  title: string;
  icon: any;
  accent: string;
  outcomes: string[];
  coworkers: Coworker[];
};

const mk = (
  name: string,
  outcome: string,
  problem: string,
  trigger: string,
  opts: Partial<Coworker> = {},
): Coworker => ({
  name,
  outcome,
  problem,
  trigger,
  automation: opts.automation ?? "Supervised",
  confidence: opts.confidence ?? 88 + ((name.length * 7) % 10),
  approval: opts.approval ?? false,
  hoursSaved: opts.hoursSaved ?? 1200 + ((name.length * 137) % 3600),
  healthcareValue:
    opts.healthcareValue ??
    "Protects EHR access and clinician throughput across acute-care sites.",
  dependencies: opts.dependencies ?? ["Citrix Cloud", "Azure", "ServiceNow", "Splunk"],
  status: opts.status ?? (["Running", "Idle", "Learning", "Awaiting Approval"] as Status[])[name.length % 4],
  kpis: opts.kpis ?? [
    { l: "Runs (30D)", v: `${300 + (name.length * 11) % 900}` },
    { l: "Success", v: `${94 + (name.length % 6)}%` },
    { l: "MTTR ↓", v: `${18 + (name.length % 22)}%` },
  ],
  purpose:
    opts.purpose ??
    `${name} continuously observes signals across the Citrix estate and orchestrates the manual engineering work traditionally handled by Level 2/3 platform teams.`,
  businessValue:
    opts.businessValue ??
    "Reduces manual toil, protects clinical uptime, and produces auditable evidence for governance and HIPAA reviews.",
  healthcareExamples: opts.healthcareExamples ?? [
    "Ensures Epic Hyperspace launch < 3s during 06:30 shift-change at 14 acute-care hospitals",
    "Pre-stages VDI capacity for a 400-bed hospital acquisition go-live",
    "Prevents PACS session failures during OR block schedules",
  ],
  workflow: opts.workflow ?? [
    "Ingest telemetry from Citrix Monitor + NetScaler + Azure",
    "Correlate against historical baselines & clinical shift calendar",
    "Score risk & propose remediation plan",
    "Route to human approver when confidence < policy threshold",
    "Execute, verify, and file evidence in ServiceNow / GRC",
  ],
  reasoning: opts.reasoning ?? [
    "Signal: Session logon time trending +18% w/w on Delivery Group DG-CLINICAL-EPIC",
    "Hypothesis: profile container latency on Azure Files premium tier",
    "Evidence: FSLogix diff metrics + storage IOPS saturation 07:10-07:35",
    "Recommendation: shard containers, pre-warm cache, expand IOPS tier",
  ],
  apis: opts.apis ?? ["Citrix Cloud API", "NetScaler NITRO", "Azure ARM", "ServiceNow ITSM", "Splunk"],
  roi: opts.roi ?? `$${(opts.hoursSaved ?? 2400) * 0.185 | 0}K annual`,
  related: opts.related ?? ["Login Performance Investigator", "Session Risk Predictor"],
  history: opts.history ?? [
    { t: "12m ago", e: "Executed remediation on DG-CLINICAL-EPIC — success" },
    { t: "1h ago", e: "Filed HIPAA evidence packet #A-7742" },
    { t: "Yesterday", e: "Learned new pattern: pre-shift storage warm-up" },
  ],
  risk: opts.risk ?? 12 + (name.length % 40),
  knowledge: opts.knowledge ?? ["Citrix Tech Zone", "Internal runbooks", "HIPAA §164.312", "Vendor advisories"],
  ...opts,
});

/* ------------------------------ Sections ------------------------------ */

const sections: Section[] = [
  {
    key: "daas", title: "Citrix DaaS", icon: Cloud, accent: "blue",
    outcomes: ["Lower Azure cost", "Increase clinician performance", "Reduce infrastructure waste", "Prevent capacity shortages", "Accelerate hospital expansion"],
    coworkers: [
      mk("Capacity Forecast Agent", "Prevent capacity shortages", "DaaS host pool exhaustion during shift-change surges", "Forecast horizon crosses 85% utilization", { automation: "Autonomous", confidence: 94, hoursSaved: 4800 }),
      mk("Environment Expansion Planner", "Accelerate hospital expansion", "Manual sizing for M&A go-lives takes 6+ weeks", "New site onboarding request", { approval: true, hoursSaved: 3600 }),
      mk("Cloud Cost Optimizer", "Lower Azure cost", "Overprovisioned session hosts burning Azure spend", "Daily 04:00 rightsizing sweep", { automation: "Autonomous", hoursSaved: 5200 }),
      mk("DaaS Readiness Validator", "Increase clinician performance", "Pre-shift environment drift causes 07:00 logon storms", "Pre-shift T-60m", { hoursSaved: 2400 }),
      mk("Workload Placement Advisor", "Reduce infrastructure waste", "Wrong workload → wrong region latency for clinical apps", "New Delivery Group creation", {}),
      mk("Host Pool Optimizer", "Lower Azure cost", "Static host pool schedules ignore real demand", "Continuous", { automation: "Autonomous" }),
      mk("GPU Capacity Planner", "Increase clinician performance", "Radiology 3D rendering starves under GPU contention", "Weekly + on-demand", { approval: true }),
      mk("Regional Expansion Planner", "Accelerate hospital expansion", "Multi-region rollout blueprints are hand-crafted", "New region request", { approval: true }),
      mk("Disaster Recovery Planner", "Prevent capacity shortages", "DR runbooks drift from production reality", "Monthly DR validation", {}),
      mk("Image Lifecycle Planner", "Reduce infrastructure waste", "Golden image sprawl inflates storage & patch effort", "New patch cycle", {}),
      mk("License Optimization Advisor", "Lower Azure cost", "Under-utilized Citrix + Windows licenses", "Weekly", {}),
      mk("Session Density Optimizer", "Reduce infrastructure waste", "Session density set conservatively 'just in case'", "Continuous", { automation: "Autonomous" }),
    ],
  },
  {
    key: "cvad", title: "Citrix Virtual Apps and Desktops", icon: LayoutGrid, accent: "indigo",
    outcomes: ["Reduce login delays", "Reduce clinician frustration", "Improve physician productivity", "Reduce gold images", "Accelerate onboarding"],
    coworkers: [
      mk("Clinical Workspace Readiness Agent", "Reduce clinician frustration", "Pre-shift environment problems surface after clinicians log in", "T-90m before shift", { automation: "Autonomous", confidence: 96, hoursSaved: 5400 }),
      mk("Morning Shift Readiness Agent", "Reduce login delays", "07:00 logon storm at 22 hospitals overwhelms brokers", "06:00 daily", { automation: "Autonomous", hoursSaved: 6200 }),
      mk("Login Performance Investigator", "Reduce login delays", "Logon time regressions get root-caused manually over hours", "Logon > 15s threshold", { hoursSaved: 3800 }),
      mk("Session Risk Predictor", "Improve physician productivity", "Session disconnects mid-encounter frustrate physicians", "Continuous", { automation: "Autonomous" }),
      mk("Image Engineering Advisor", "Reduce gold images", "Too many gold images inflate patching effort", "New app request", {}),
      mk("Application Publishing Planner", "Accelerate onboarding", "New app publishing takes 2-3 weeks of ticket ping-pong", "New app intake", { approval: true }),
      mk("Policy Recommendation Agent", "Reduce clinician frustration", "Legacy Citrix policies conflict; nobody knows why", "Weekly + on change", {}),
      mk("Workload Persona Builder", "Improve physician productivity", "Personas built from anecdote, not telemetry", "Quarterly", {}),
      mk("VIP Physician Experience Monitor", "Improve physician productivity", "VIP complaints escalate before ops sees the signal", "Continuous", { automation: "Autonomous" }),
      mk("Application Rationalization Advisor", "Reduce gold images", "Long-tail apps consume engineering time for < 5 users", "Quarterly review", {}),
    ],
  },
  {
    key: "netscaler", title: "Citrix NetScaler", icon: Network, accent: "cyan",
    outcomes: ["Reduce outages", "Reduce configuration drift", "Prevent expired certificates", "Increase availability"],
    coworkers: [
      mk("ADC Configuration Reviewer", "Reduce configuration drift", "Config drift between ADC pairs causes silent failures", "Nightly + on change", { hoursSaved: 3200 }),
      mk("Certificate Lifecycle Planner", "Prevent expired certificates", "Cert expiries take down Gateway during OR block time", "T-45d, T-14d, T-3d", { automation: "Autonomous", confidence: 97 }),
      mk("Load Balancing Optimizer", "Increase availability", "Static LB weights ignore backend health signals", "Continuous", { automation: "Autonomous" }),
      mk("SSL Dependency Mapper", "Reduce outages", "Cert-to-service mapping lives in someone's spreadsheet", "On change", {}),
      mk("Gateway Readiness Validator", "Increase availability", "Gateway policy changes deployed without safety checks", "Pre-change", { approval: true }),
      mk("Health Check Automation Agent", "Increase availability", "Monitors mis-scoped, hide broken backends", "Weekly", {}),
      mk("VIP Migration Planner", "Reduce outages", "VIP moves during acquisitions cause avoidable outages", "Migration event", { approval: true }),
      mk("Traffic Pattern Analyzer", "Reduce outages", "Anomalous traffic patterns detected too late", "Continuous", { automation: "Autonomous" }),
    ],
  },
  {
    key: "spa", title: "Citrix Secure Private Access", icon: Lock, accent: "violet",
    outcomes: ["Reduce unnecessary access", "Improve clinician experience", "Reduce audit findings"],
    coworkers: [
      mk("Zero Trust Assessment Agent", "Reduce unnecessary access", "Access policies accreted over years, nobody prunes", "Quarterly access review", { hoursSaved: 2800 }),
      mk("Application Access Optimizer", "Improve clinician experience", "Clinicians re-authenticate 20+ times a shift", "Continuous", {}),
      mk("Identity Dependency Mapper", "Reduce audit findings", "Which app depends on which IdP claim? Unknown.", "On change", {}),
      mk("Remote Access Journey Analyzer", "Improve clinician experience", "Remote clinician login journey has 6 friction points", "Weekly", {}),
      mk("Healthcare Third Party Access Advisor", "Reduce audit findings", "Vendor access grants outlive vendor engagements", "Monthly", { approval: true }),
    ],
  },
  {
    key: "cem", title: "Citrix Endpoint Management", icon: Smartphone, accent: "emerald",
    outcomes: ["Improve mobility", "Reduce endpoint failures", "Improve compliance"],
    coworkers: [
      mk("Device Compliance Advisor", "Improve compliance", "Non-compliant devices reach production undetected", "Continuous", { automation: "Autonomous" }),
      mk("Clinical Cart Readiness Agent", "Reduce endpoint failures", "COW carts fail at bedside during medication pass", "Pre-shift", { automation: "Autonomous", confidence: 95 }),
      mk("Mobile Workforce Planner", "Improve mobility", "Field clinicians run out of battery / signal / policy", "Weekly", {}),
      mk("Policy Optimization Advisor", "Improve compliance", "MDM policies conflict across device classes", "On change", {}),
      mk("Device Refresh Planner", "Reduce endpoint failures", "Ad-hoc refresh planning misses risk cohorts", "Quarterly", { approval: true }),
    ],
  },
  {
    key: "workspace", title: "Citrix Workspace", icon: LayoutGrid, accent: "sky",
    outcomes: ["Increase adoption", "Reduce training", "Improve physician efficiency"],
    coworkers: [
      mk("Workspace Experience Advisor", "Improve physician efficiency", "Workspace UX regressions unnoticed for weeks", "Continuous", {}),
      mk("Application Discovery Agent", "Increase adoption", "Clinicians don't know an app is already published", "On login", { automation: "Autonomous" }),
      mk("Workspace Personalization Advisor", "Improve physician efficiency", "Every clinician re-arranges the same workspace", "On persona change", {}),
      mk("Persona Recommendation Agent", "Increase adoption", "Wrong persona → wrong tools → shadow IT", "On onboarding", {}),
      mk("Workspace Adoption Coach", "Reduce training", "Training decks age faster than Workspace ships", "Weekly", {}),
    ],
  },
  {
    key: "pvs", title: "Citrix Provisioning", icon: HardDrive, accent: "amber",
    outcomes: ["Reduce maintenance", "Improve image quality", "Reduce downtime"],
    coworkers: [
      mk("Image Lifecycle Automation Planner", "Reduce maintenance", "Image build → test → promote is manual & fragile", "Monthly", { approval: true }),
      mk("vDisk Rationalization Agent", "Reduce maintenance", "vDisk sprawl consumes storage & attention", "Quarterly", {}),
      mk("Patch Validation Planner", "Improve image quality", "Patches ship without full clinical app regression", "Patch Tuesday + 3d", { approval: true }),
      mk("Rollback Risk Advisor", "Reduce downtime", "Rollback decisions made under pressure with no data", "On incident", {}),
      mk("Image Compliance Auditor", "Improve image quality", "Compliance evidence collected only at audit time", "Continuous", { automation: "Autonomous" }),
    ],
  },
  {
    key: "hypervisor", title: "Citrix Hypervisor", icon: Cpu, accent: "orange",
    outcomes: ["Increase density", "Reduce outages", "Improve performance"],
    coworkers: [
      mk("Cluster Capacity Planner", "Increase density", "Clusters run at 40% density 'to be safe'", "Weekly", {}),
      mk("Storage Optimization Advisor", "Improve performance", "Datastore hot-spots cause session lag", "Continuous", { automation: "Autonomous" }),
      mk("Host Health Predictor", "Reduce outages", "Host failures surprise on-call", "Continuous", { automation: "Autonomous", confidence: 93 }),
      mk("Resource Utilization Optimizer", "Increase density", "vCPU:pCPU ratios set by memory, not measurement", "Weekly", {}),
      mk("Maintenance Window Planner", "Reduce outages", "Maintenance clashes with clinical schedules", "Change intake", { approval: true }),
    ],
  },
  {
    key: "monitor", title: "Citrix Monitor", icon: LineChart, accent: "rose",
    outcomes: ["Executive reporting", "Continuous improvement", "Capacity planning"],
    coworkers: [
      mk("Executive Experience Reporter", "Executive reporting", "Exec decks are hand-built monthly, always late", "Weekly", { automation: "Autonomous" }),
      mk("Trend Analysis Agent", "Continuous improvement", "Trends only spotted after they become incidents", "Continuous", {}),
      mk("Experience Forecast Agent", "Capacity planning", "Capacity plans lag reality by a quarter", "Weekly", {}),
      mk("Service Health Advisor", "Continuous improvement", "Service health mixes signal & noise", "Continuous", { automation: "Autonomous" }),
      mk("Business Review Generator", "Executive reporting", "QBRs consume 40+ engineer-hours to assemble", "Monthly", { approval: true }),
    ],
  },
  {
    key: "clinical", title: "Healthcare Clinical Experience", icon: Stethoscope, accent: "red",
    outcomes: ["Protect patient care", "Improve clinician productivity", "Reduce downtime", "Accelerate acquisitions"],
    coworkers: [
      mk("Epic Session Readiness Agent", "Protect patient care", "Epic Hyperspace launch slowness hits the AM shift", "T-90m before shift", { automation: "Autonomous", confidence: 97, hoursSaved: 7200 }),
      mk("PACS Workflow Readiness", "Protect patient care", "Radiologists wait on image loads during read sessions", "Continuous", { automation: "Autonomous" }),
      mk("Dragon Medical Availability Advisor", "Improve clinician productivity", "Dragon session hangs stall documentation", "Continuous", {}),
      mk("Operating Room Readiness Agent", "Protect patient care", "OR displays / apps unready at first-case start", "T-60m before first case", { automation: "Autonomous" }),
      mk("Medication Administration Workspace Validator", "Protect patient care", "eMAR workstation issues delay medication pass", "Pre-shift", { approval: true }),
      mk("Emergency Department Readiness", "Protect patient care", "ED workstations degrade during surge", "Continuous", { automation: "Autonomous" }),
      mk("Virtual Nursing Station Monitor", "Improve clinician productivity", "Nursing stations fall out of policy silently", "Continuous", {}),
      mk("Hospital Acquisition Readiness Planner", "Accelerate acquisitions", "M&A cutovers slip because Citrix estate isn't understood", "Deal announced", { approval: true, hoursSaved: 5800 }),
      mk("Clinical Downtime Coordinator", "Reduce downtime", "Downtime protocols invoked late & inconsistently", "On P1", { automation: "Autonomous" }),
      mk("Clinical Workflow Analyzer", "Improve clinician productivity", "Nobody measures Citrix impact on clinical workflow time", "Weekly", {}),
    ],
  },
  {
    key: "governance", title: "Governance and Compliance", icon: Gavel, accent: "slate",
    outcomes: ["Reduce audit effort", "Improve governance", "Lower operational risk"],
    coworkers: [
      mk("HIPAA Audit Readiness Agent", "Reduce audit effort", "HIPAA audit prep consumes weeks of engineer time", "Quarterly + on request", { hoursSaved: 4200 }),
      mk("Configuration Drift Investigator", "Lower operational risk", "Drift discovered during incidents, not before", "Nightly", { automation: "Autonomous" }),
      mk("Architecture Standards Reviewer", "Improve governance", "Standards live in Confluence, reality lives in prod", "Weekly", {}),
      mk("Operational Documentation Generator", "Reduce audit effort", "Runbooks age faster than they're written", "Continuous", { automation: "Autonomous" }),
      mk("Executive Risk Dashboard", "Improve governance", "Exec risk view stitched together from 6 tools", "Weekly", {}),
      mk("Technical Debt Advisor", "Lower operational risk", "Tech debt is invisible until it breaks", "Monthly", {}),
      mk("Service Lifecycle Manager", "Improve governance", "Services outlive their owners", "Quarterly", { approval: true }),
      mk("Healthcare Compliance Evidence Collector", "Reduce audit effort", "Evidence gathering is manual & retroactive", "Continuous", { automation: "Autonomous" }),
    ],
  },
  {
    key: "modernization", title: "Modernization", icon: Rocket, accent: "purple",
    outcomes: ["Accelerate migrations", "Reduce project duration", "Lower consulting effort"],
    coworkers: [
      mk("Legacy Environment Discovery", "Accelerate migrations", "Legacy Citrix estates are undocumented", "Program kickoff", { hoursSaved: 6400 }),
      mk("Migration Factory Planner", "Reduce project duration", "Wave planning done by hand across thousands of users", "Program planning", { approval: true }),
      mk("Application Dependency Mapper", "Accelerate migrations", "Migrations break on hidden app dependencies", "Pre-wave", {}),
      mk("Cloud Migration Advisor", "Lower consulting effort", "Cloud target-state design is bespoke every time", "Design phase", {}),
      mk("Technical Debt Scoring Agent", "Reduce project duration", "Debt discovered mid-migration derails schedule", "Continuous", { automation: "Autonomous" }),
      mk("Environment Consolidation Planner", "Lower consulting effort", "Post-M&A duplicate environments linger for years", "Post-deal close", { approval: true }),
      mk("Acquisition Integration Planner", "Accelerate migrations", "Integration playbooks are re-invented every deal", "Deal signed", { approval: true }),
    ],
  },
  {
    key: "operations", title: "Operations", icon: Wrench, accent: "teal",
    outcomes: ["Reduce MTTR", "Reduce incidents", "Increase automation", "Reduce human toil"],
    coworkers: [
      mk("Incident Correlation Agent", "Reduce MTTR", "Alert storms hide the real signal", "Continuous", { automation: "Autonomous", confidence: 95 }),
      mk("Root Cause Investigator", "Reduce MTTR", "RCA reports take days & miss upstream causes", "On P1/P2", { hoursSaved: 4800 }),
      mk("Known Error Advisor", "Reduce MTTR", "KEDB exists, but nobody consults it under pressure", "Incident open", { automation: "Autonomous" }),
      mk("Change Risk Predictor", "Reduce incidents", "Change risk scoring is subjective", "CAB intake", { approval: true }),
      mk("Problem Management Advisor", "Reduce incidents", "Problems are declared long after the pattern is clear", "Weekly", {}),
      mk("Release Validation Agent", "Reduce incidents", "Post-release validation is a checklist, not a system", "Post-release", { automation: "Autonomous" }),
      mk("Maintenance Readiness Agent", "Reduce human toil", "Maintenance prep is a 30-item manual checklist", "Pre-window", {}),
      mk("Executive Daily Operations Brief", "Reduce human toil", "Daily brief takes 90 minutes to hand-assemble", "Daily 06:00", { automation: "Autonomous" }),
    ],
  },
];

/* ------------------------------ Aggregates ------------------------------ */

const allCoworkers = sections.flatMap((s) => s.coworkers.map((c) => ({ ...c, section: s.title, sectionKey: s.key })));

const totals = {
  total: allCoworkers.length,
  active: allCoworkers.filter((c) => c.status !== "Idle").length,
  running: allCoworkers.filter((c) => c.status === "Running").length,
  approvals: allCoworkers.filter((c) => c.approval).length,
  autonomous: allCoworkers.filter((c) => c.automation === "Autonomous").length,
  hoursSaved: allCoworkers.reduce((a, c) => a + c.hoursSaved, 0),
};

const kpiTiles = [
  { l: "Total Digital Coworkers", v: `${totals.total}`, icon: Bot, bg: "bg-blue-50", color: "text-blue-600" },
  { l: "Active", v: `${totals.active}`, icon: Activity, bg: "bg-emerald-50", color: "text-emerald-600" },
  { l: "Running Now", v: `${totals.running}`, icon: PlayCircle, bg: "bg-cyan-50", color: "text-cyan-600" },
  { l: "Human Approval Required", v: `${totals.approvals}`, icon: ShieldCheck, bg: "bg-amber-50", color: "text-amber-600" },
  { l: "Autonomous", v: `${totals.autonomous}`, icon: Sparkles, bg: "bg-violet-50", color: "text-violet-600" },
  { l: "Hours Saved / Month", v: `${Math.round(totals.hoursSaved / 12).toLocaleString()}`, icon: Clock, bg: "bg-indigo-50", color: "text-indigo-600" },
  { l: "Incidents Prevented (MTD)", v: "1,284", icon: AlertTriangle, bg: "bg-rose-50", color: "text-rose-600" },
  { l: "Clinical Minutes Protected", v: "412,890", icon: HeartPulse, bg: "bg-red-50", color: "text-red-600" },
  { l: "Cost Avoidance (YTD)", v: "$14.6M", icon: DollarSign, bg: "bg-emerald-50", color: "text-emerald-600" },
  { l: "MTTR Reduction", v: "-46%", icon: TrendingUp, bg: "bg-sky-50", color: "text-sky-600" },
  { l: "User Satisfaction ↑", v: "+38 NPS", icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
];

/* ------------------------------ Component ------------------------------ */

export default function CitrixPlatformDigitalCoworkers() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<string>("All");
  const [automation, setAutomation] = useState<string>("All");
  const [approval, setApproval] = useState<string>("All");
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.key, true])),
  );
  const [selected, setSelected] = useState<Coworker | null>(null);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections
      .filter((s) => platform === "All" || s.key === platform)
      .map((s) => ({
        ...s,
        coworkers: s.coworkers.filter((c) => {
          if (automation !== "All" && c.automation !== automation) return false;
          if (approval === "Yes" && !c.approval) return false;
          if (approval === "No" && c.approval) return false;
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            c.outcome.toLowerCase().includes(q) ||
            c.problem.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((s) => s.coworkers.length > 0);
  }, [query, platform, automation, approval]);

  return (
    <AppShell>
      <main className="min-h-screen bg-slate-50">
        {/* Banner */}
        <div className="border-b border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40">
          <div className="px-6 py-6">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white shrink-0 shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">RunOps · Digital Coworkers</div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
                  Citrix Platform Digital Coworkers
                </h1>
                <p className="text-sm text-slate-600 mt-1 max-w-4xl">
                  Outcome-focused AI Digital Coworkers for Engineering, Modernization, Operations,
                  Governance, Healthcare Clinical Experience, and Platform Optimization.
                </p>
                <p className="mt-2 text-[12px] text-slate-500 max-w-4xl italic">
                  Citrix delivers the platform. Our Digital Coworkers make it dramatically easier to
                  engineer, modernize, operate, optimize, govern, and continuously improve.
                </p>
              </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11 gap-2.5 mt-5">
              {kpiTiles.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.l} className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-2.5 shadow-sm">
                    <div className={`h-7 w-7 rounded-lg ${k.bg} ${k.color} grid place-items-center mb-1.5`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[9.5px] font-medium text-slate-500 leading-tight">{k.l}</div>
                    <div className="text-base font-bold text-slate-900 leading-tight mt-0.5">{k.v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-5">
          {/* Filter rail */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Search</div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search coworkers, outcomes..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Filters</div>
              <FilterSelect label="Platform" value={platform} onChange={setPlatform}
                options={[{ v: "All", l: "All platforms" }, ...sections.map((s) => ({ v: s.key, l: s.title }))]} />
              <FilterSelect label="Automation Level" value={automation} onChange={setAutomation}
                options={[{ v: "All", l: "All" }, { v: "Autonomous", l: "Autonomous" }, { v: "Supervised", l: "Supervised" }, { v: "Recommend", l: "Recommend only" }]} />
              <FilterSelect label="Human Approval" value={approval} onChange={setApproval}
                options={[{ v: "All", l: "All" }, { v: "Yes", l: "Requires approval" }, { v: "No", l: "Autonomous" }]} />
              <button
                onClick={() => { setPlatform("All"); setAutomation("All"); setApproval("All"); setQuery(""); }}
                className="text-[11px] text-blue-600 font-semibold mt-1"
              >Clear All</button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Automation Maturity</div>
              <MaturityBar label="Autonomous" pct={Math.round((totals.autonomous / totals.total) * 100)} color="bg-emerald-500" />
              <MaturityBar label="Supervised" pct={Math.round((allCoworkers.filter(c=>c.automation==="Supervised").length / totals.total) * 100)} color="bg-blue-500" />
              <MaturityBar label="Recommend" pct={Math.round((allCoworkers.filter(c=>c.automation==="Recommend").length / totals.total) * 100)} color="bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Executive Snapshot</div>
              <ExecStat l="Annual Hours Saved" v={`${totals.hoursSaved.toLocaleString()}`} />
              <ExecStat l="Labor Reduction" v="~168 FTEs" />
              <ExecStat l="Automation Coverage" v="78%" />
              <ExecStat l="Clinical Workflow Coverage" v="92%" />
              <ExecStat l="Incident Reduction" v="-41%" />
              <ExecStat l="Clinical Downtime Prevented" v="1,240 min" />
              <ExecStat l="Engineer Productivity" v="+34%" />
              <ExecStat l="Platform Health Score" v="94 / 100" cls="text-emerald-600" />
              <ExecStat l="Risk Reduction" v="-52%" />
            </div>
          </aside>

          {/* Sections */}
          <div className="space-y-5 min-w-0">
            {filteredSections.map((s) => {
              const Icon = s.icon;
              const isOpen = open[s.key];
              return (
                <section key={s.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className={`h-9 w-9 rounded-lg bg-${s.accent}-50 text-${s.accent}-600 grid place-items-center shrink-0`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900">{s.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {s.coworkers.length} Digital Coworkers · Outcomes: {s.outcomes.slice(0, 3).join(" · ")}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 mr-2">
                      {s.outcomes.slice(0, 4).map((o) => (
                        <span key={o} className="text-[10px] font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">{o}</span>
                      ))}
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-2 border-t border-slate-100 bg-gradient-to-br from-white to-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {s.coworkers.map((c) => (
                          <CoworkerCard key={c.name} c={c} onOpen={() => setSelected(c)} />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}

            {/* Executive Dashboard */}
            <ExecutiveDashboard />
          </div>
        </div>

        {/* Drawer */}
        {selected && <DetailDrawer c={selected} onClose={() => setSelected(null)} />}
      </main>
    </AppShell>
  );
}

/* ------------------------------ Subcomponents ------------------------------ */

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <div className="mb-2">
      <div className="text-[11px] font-semibold text-slate-600 mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function MaturityBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-[11px] mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ExecStat({ l, v, cls }: { l: string; v: string; cls?: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-600">{l}</span>
      <span className={`font-bold text-slate-900 ${cls ?? ""}`}>{v}</span>
    </div>
  );
}

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    Running: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Idle: "bg-slate-50 text-slate-600 border-slate-200",
    Learning: "bg-violet-50 text-violet-700 border-violet-200",
    "Awaiting Approval": "bg-amber-50 text-amber-700 border-amber-200",
  };
  return <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${map[s]}`}>{s}</span>;
}

function ConfidenceRing({ pct }: { pct: number }) {
  const tone = pct >= 92 ? "text-emerald-600" : pct >= 80 ? "text-blue-600" : "text-amber-600";
  const stroke = pct >= 92 ? "#059669" : pct >= 80 ? "#2563eb" : "#d97706";
  const c = 2 * Math.PI * 14;
  return (
    <div className="relative h-10 w-10 shrink-0">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle cx="18" cy="18" r="14" fill="none" stroke={stroke} strokeWidth="3"
          strokeDasharray={`${(pct / 100) * c} 999`} strokeLinecap="round" />
      </svg>
      <div className={`absolute inset-0 grid place-items-center text-[10px] font-bold ${tone}`}>{pct}</div>
    </div>
  );
}

function CoworkerCard({ c, onOpen }: { c: Coworker; onOpen: () => void }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
      <div className="flex items-start gap-2.5">
        <ConfidenceRing pct={c.confidence} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold text-slate-900 leading-tight truncate">{c.name}</h3>
            <StatusBadge s={c.status} />
          </div>
          <div className="text-[10.5px] text-blue-700 font-semibold mt-0.5">{c.outcome}</div>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 mt-2.5 leading-snug line-clamp-2">
        <span className="font-semibold text-slate-700">Problem:</span> {c.problem}
      </p>
      <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2">
        <span className="font-semibold text-slate-700">Trigger:</span> {c.trigger}
      </p>

      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
        {c.kpis.map((k) => (
          <div key={k.l} className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1 text-center">
            <div className="text-[9px] text-slate-500 leading-tight">{k.l}</div>
            <div className="text-[11px] font-bold text-slate-900 leading-tight">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-2.5 text-[10px]">
        <span className={`rounded-full px-1.5 py-0.5 border font-semibold ${
          c.automation === "Autonomous" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : c.automation === "Supervised" ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-violet-50 text-violet-700 border-violet-200"
        }`}>{c.automation}</span>
        {c.approval && <span className="rounded-full px-1.5 py-0.5 border bg-amber-50 text-amber-700 border-amber-200 font-semibold">Approval</span>}
        <span className="ml-auto text-slate-500 font-medium">{c.hoursSaved.toLocaleString()} hrs/yr</span>
      </div>

      <div className="mt-2 text-[10.5px] text-slate-600 border-t border-slate-100 pt-2 line-clamp-2">
        <span className="font-semibold text-red-700">Clinical:</span> {c.healthcareValue}
      </div>

      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
        <button onClick={onOpen} className="flex-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 inline-flex items-center justify-center gap-1">
          <PlayCircle className="h-3 w-3" /> Launch
        </button>
        <button onClick={onOpen} className="flex-1 text-[11px] font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg py-1.5 inline-flex items-center justify-center gap-1">
          <GitBranch className="h-3 w-3" /> Workflow
        </button>
        <button onClick={onOpen} className="flex-1 text-[11px] font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg py-1.5 inline-flex items-center justify-center gap-1">
          <Brain className="h-3 w-3" /> Reasoning
        </button>
      </div>
    </article>
  );
}

function ExecutiveDashboard() {
  const platformTotals = sections.map((s) => ({ name: s.title, n: s.coworkers.length, hrs: s.coworkers.reduce((a, c) => a + c.hoursSaved, 0) }));
  const maxN = Math.max(...platformTotals.map((p) => p.n));
  const top = [...allCoworkers].sort((a, b) => b.hoursSaved - a.hoursSaved).slice(0, 6);

  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center">
          <LineChart className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">Executive Dashboard</div>
          <div className="text-[11px] text-slate-500">Portfolio outcomes across the Citrix estate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Digital Coworkers by Platform */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Digital Coworkers by Platform</div>
          <div className="space-y-2">
            {platformTotals.map((p) => (
              <div key={p.name} className="grid grid-cols-[1fr_auto] items-center gap-2 text-[11px]">
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-slate-700 truncate">{p.name}</span>
                    <span className="text-slate-500">{p.n} coworkers · {p.hrs.toLocaleString()} hrs/yr</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(p.n / maxN) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest ROI */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Top Performing / Highest ROI</div>
          <div className="space-y-2">
            {top.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-[11px] border-b border-slate-50 last:border-0 pb-1.5">
                <div className="h-5 w-5 rounded bg-blue-50 text-blue-700 grid place-items-center text-[10px] font-bold shrink-0">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{(c as any).section}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">{c.roi}</div>
                  <div className="text-[10px] text-slate-500">{c.hoursSaved.toLocaleString()} hrs/yr</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome heat map */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Outcome Heat Map · Automation Maturity × Platform</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10.5px]">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left font-semibold py-1 pr-2">Platform</th>
                  <th className="font-semibold py-1 px-1">Autonomous</th>
                  <th className="font-semibold py-1 px-1">Supervised</th>
                  <th className="font-semibold py-1 px-1">Recommend</th>
                  <th className="font-semibold py-1 px-1 text-right">Hrs/yr</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => {
                  const auto = s.coworkers.filter((c) => c.automation === "Autonomous").length;
                  const sup = s.coworkers.filter((c) => c.automation === "Supervised").length;
                  const rec = s.coworkers.filter((c) => c.automation === "Recommend").length;
                  const hrs = s.coworkers.reduce((a, c) => a + c.hoursSaved, 0);
                  const cell = (n: number, tone: string) => (
                    <td className="py-1 px-1 text-center">
                      <div className={`inline-block min-w-[28px] rounded px-1.5 py-0.5 font-bold ${tone}`} style={{ opacity: 0.35 + (n / Math.max(1, s.coworkers.length)) * 0.65 }}>{n}</div>
                    </td>
                  );
                  return (
                    <tr key={s.key} className="border-t border-slate-50">
                      <td className="py-1 pr-2 text-slate-700 font-medium">{s.title}</td>
                      {cell(auto, "bg-emerald-100 text-emerald-800")}
                      {cell(sup, "bg-blue-100 text-blue-800")}
                      {cell(rec, "bg-violet-100 text-violet-800")}
                      <td className="py-1 px-1 text-right font-semibold text-slate-900">{hrs.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailDrawer({ c, onClose }: { c: Coworker; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white z-50 shadow-2xl overflow-y-auto border-l border-slate-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 px-5 py-3 flex items-start gap-3">
          <ConfidenceRing pct={c.confidence} />
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold text-blue-700 uppercase tracking-wide">{c.outcome}</div>
            <div className="text-sm font-bold text-slate-900 leading-tight">{c.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusBadge s={c.status} />
              <span className="text-[10px] font-semibold rounded-full border px-1.5 py-0.5 bg-slate-50 text-slate-700 border-slate-200">{c.automation}</span>
              {c.approval && <span className="text-[10px] font-semibold rounded-full border px-1.5 py-0.5 bg-amber-50 text-amber-700 border-amber-200">Human approval</span>}
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500 shrink-0" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-[12px] text-slate-700">
          <Block title="Purpose" body={c.purpose} />
          <Block title="Business value" body={c.businessValue} />

          <div>
            <SectionLabel>Healthcare examples</SectionLabel>
            <ul className="mt-1 space-y-1 list-disc list-inside text-slate-700">
              {c.healthcareExamples.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniStat l="Annual hours saved" v={c.hoursSaved.toLocaleString()} />
            <MiniStat l="Estimated ROI" v={c.roi} tone="text-emerald-600" />
            <MiniStat l="Confidence" v={`${c.confidence}%`} />
            <MiniStat l="Risk score" v={`${c.risk} / 100`} tone={c.risk < 25 ? "text-emerald-600" : c.risk < 50 ? "text-amber-600" : "text-rose-600"} />
          </div>

          <div>
            <SectionLabel>Workflow</SectionLabel>
            <ol className="mt-1 space-y-1 list-decimal list-inside">
              {c.workflow.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          <div>
            <SectionLabel>Reasoning chain</SectionLabel>
            <ul className="mt-1 space-y-1">
              {c.reasoning.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <Brain className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionLabel>API integrations</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {c.apis.map((a) => <span key={a} className="text-[10.5px] rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">{a}</span>)}
            </div>
          </div>

          <div>
            <SectionLabel>Dependencies</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {c.dependencies.map((d) => <span key={d} className="text-[10.5px] rounded border border-blue-200 bg-blue-50 text-blue-800 px-1.5 py-0.5">{d}</span>)}
            </div>
          </div>

          <div>
            <SectionLabel>Execution history</SectionLabel>
            <ul className="mt-1 space-y-1.5">
              {c.history.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10.5px] text-slate-500">{h.t}</div>
                    <div>{h.e}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionLabel>Knowledge sources</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {c.knowledge.map((k) => <span key={k} className="text-[10.5px] rounded border border-slate-200 bg-white px-1.5 py-0.5">{k}</span>)}
            </div>
          </div>

          <div>
            <SectionLabel>Related coworkers</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {c.related.map((r) => <span key={r} className="text-[10.5px] rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">{r}</span>)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button className="flex-1 text-[12px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 inline-flex items-center justify-center gap-1">
              <PlayCircle className="h-3.5 w-3.5" /> Launch coworker
            </button>
            <button className="flex-1 text-[12px] font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg py-2">
              View full audit trail
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <p className="mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500">{children}</div>;
}

function MiniStat({ l, v, tone }: { l: string; v: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="text-[10px] text-slate-500">{l}</div>
      <div className={`text-sm font-bold ${tone ?? "text-slate-900"}`}>{v}</div>
    </div>
  );
}
