import { AppShell } from "@/components/eoc/AppShell";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Search, Bell, HelpCircle, ChevronDown, Star, ArrowRight, ChevronRight,
  Sparkles, ShieldCheck, CheckCircle2, Activity, Database, Cloud, Box,
  BarChart3, Cpu, Settings as Cog, Lightbulb, FileCheck, KeyRound,
  AlertTriangle, DollarSign, GitBranch, Network, Workflow, Users,
  Building2, LayoutGrid, ClipboardList, Eye, FileText,
  Globe, ShieldHalf,
} from "lucide-react";

const Index = () => {
  return (
    <AppShell>
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
          <CommandTopBar />
          <main className="flex-1 px-6 lg:px-8 py-6 space-y-5 animate-fade-in">
            <PageHeader />
            <TopRow />
            <PracticeAndCoworkers />
            <BottomGrid />
          </main>
          <CommandFooter />
      </div>
    </AppShell>
  );
};

export default Index;

/* ---------- TOP BAR ---------- */
function CommandTopBar() {
  const { displayName, initials, role, signOut } = useUserProfile();
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-card">
      <div className="px-6 lg:px-8 h-16 flex items-center gap-6">
        <TopField label="Workspace" value="Neurealm Production" hasChevron />
        <Divider />
        <TopField label="Environment" value="Production" dotColor="status-healthy" hasChevron />
        <Divider />
        <TopField label="Data Freshness" value="2 min ago" dotColor="status-healthy" />
        <Divider />
        <TopField label="Operating Mode" value="Governed Automation" icon={ShieldCheck} />
        <div className="flex-1" />
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search neuGAIN"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ai/20"
          />
        </div>
        <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-accent">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-status-critical text-[10px] font-bold text-white grid place-items-center">0</span>
        </button>
        <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="h-9 w-9 rounded-full bg-foreground text-background grid place-items-center text-xs font-bold">{initials}</div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">{displayName}</div>
            <div className="text-[11px] text-muted-foreground">{role}</div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="ml-1 h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
function Divider() { return <div className="h-8 w-px bg-border" />; }
function TopField({ label, value, dotColor, icon: Icon, hasChevron }: any) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-ai" />}
        {dotColor && <span className="h-2 w-2 rounded-full" style={{ background: `hsl(var(--${dotColor}))` }} />}
        <span className="text-[13px] font-semibold text-foreground">{value}</span>
        {hasChevron && <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </div>
    </div>
  );
}

/* ---------- PAGE HEADER ---------- */
function PageHeader() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-[26px] font-bold tracking-tight">NeuGAIN Command Center</h1>
        <Star className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Your AI-native operating environment for practices, platforms, and digital coworkers.
      </p>
    </div>
  );
}

/* ---------- TOP ROW ---------- */
function TopRow() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <Card className="xl:col-span-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-md bg-ai-soft text-ai grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold">Operating Summary</h3>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          neuGAIN is monitoring active workflows across RunOps, Cybersecurity, Platform Engineering, and Data &amp; Analytics.
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-3">
          3 recommendations are awaiting approval, 2 integrations require review, and the Service Reliability Coworker has identified a dependency risk affecting a critical business service.
        </p>
        <button className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-ai/30 bg-ai-soft text-ai text-xs font-semibold hover:bg-ai/10">
          View Full Summary <ArrowRight className="h-3 w-3" />
        </button>
      </Card>

      <Card className="xl:col-span-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Environment Status</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View All Health <ArrowRight className="h-3 w-3" /></a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Security Posture", value: "Healthy", icon: ShieldCheck, color: "status-healthy" },
            { name: "Compliance", value: "On Track", icon: CheckCircle2, color: "status-healthy" },
            { name: "Digital Coworkers", value: "Active", icon: Activity, color: "status-healthy" },
            { name: "Integrations", value: "Connected", icon: GitBranch, color: "status-healthy" },
            { name: "Data Quality", value: "Good", icon: Database, color: "status-healthy" },
            { name: "Automation Health", value: "Optimal", icon: Workflow, color: "status-healthy" },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
              <div className="h-9 w-9 rounded-lg grid place-items-center"
                style={{ background: `hsl(var(--${s.color}) / 0.12)`, color: `hsl(var(--${s.color}))` }}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground">{s.name}</div>
                <div className="text-[13px] font-bold" style={{ color: `hsl(var(--${s.color}))` }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="xl:col-span-4 border-ai/30 bg-ai-soft/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-ai" />
            <h3 className="text-sm font-bold text-ai">What You Should Know or Do</h3>
          </div>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View All Actions <ArrowRight className="h-3 w-3" /></a>
        </div>
        <ul className="divide-y divide-border">
          {[
            { icon: FileCheck, color: "status-critical", title: "Review 3 recommendations awaiting your approval", sub: "Digital Coworkers are waiting for your decision.", time: "5 min ago" },
            { icon: KeyRound, color: "status-warning", title: "Identity privilege drift detected", sub: "Review accounts with excessive privileges.", time: "15 min ago" },
            { icon: AlertTriangle, color: "status-warning", title: "Service reliability risk identified", sub: "A dependency risk is impacting a critical service.", time: "25 min ago" },
            { icon: Cog, color: "status-warning", title: "ServiceNow integration needs attention", sub: "Credential rotation required.", time: "1 hr ago" },
            { icon: DollarSign, color: "ai", title: "Cloud cost optimization opportunity", sub: "FinOps Coworker identified $48.2K in savings.", time: "2 hrs ago" },
          ].map((a) => (
            <li key={a.title} className="flex items-center gap-3 py-2.5">
              <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0"
                style={{ background: `hsl(var(--${a.color}) / 0.12)`, color: `hsl(var(--${a.color}))` }}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate">{a.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{a.sub}</div>
              </div>
              <div className="text-[11px] font-semibold whitespace-nowrap" style={{ color: `hsl(var(--${a.color}))` }}>{a.time}</div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- PRACTICE + COWORKERS ---------- */
function PracticeAndCoworkers() {
  const practices = [
    { name: "AI", status: "Active", icon: Sparkles, color: "ai", a: "23 active workflows", b: "8 models operational" },
    { name: "Data & Analytics", status: "Active", icon: BarChart3, color: "status-info", a: "15 data pipelines", b: "96% data quality" },
    { name: "Platform Engineering", status: "Active", icon: Cloud, color: "ai", a: "28 deployments", b: "All systems healthy" },
    { name: "Chip to Edge Engineering", status: "Learning", icon: Cpu, color: "status-warning", a: "12 devices online", b: "3 edge workloads" },
    { name: "Cybersecurity", status: "Active", icon: ShieldCheck, color: "ai", a: "4 risks detected", b: "2 require review" },
    { name: "RunOps", status: "Active", icon: Cog, color: "status-healthy", a: "18 incidents", b: "2 major changes" },
  ];
  const coworkers = [
    { name: "Cloud Governance Coworker", state: "Monitoring", last: "Reviewed cloud policy alignment", stage: "Observed", stageColor: "ai", icon: Cloud },
    { name: "Identity Hygiene Coworker", state: "Recommending", last: "Detected privilege drift", stage: "Recommended", stageColor: "ai", icon: Users },
    { name: "Service Reliability Coworker", state: "Investigating", last: "Correlated availability signals", stage: "Reasoned", stageColor: "ai", icon: Activity },
    { name: "Network Intelligence Coworker", state: "Awaiting Approval", last: "Proposed segmentation cleanup", stage: "Awaiting Approval", stageColor: "status-warning", icon: Network },
    { name: "FinOps Coworker", state: "Optimizing", last: "Identified rightsizing opportunities", stage: "Recommended", stageColor: "ai", icon: DollarSign },
    { name: "Change Risk Coworker", state: "Reviewing", last: "Assessed impact of upcoming change", stage: "Reasoned", stageColor: "ai", icon: ClipboardList },
  ];
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <Card className="xl:col-span-7">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Practice Health Overview</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View All Practices <ArrowRight className="h-3 w-3" /></a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {practices.map((p) => (
            <div key={p.name} className="rounded-xl border border-border bg-background/40 p-3 flex flex-col">
              <div className="h-10 w-10 rounded-full grid place-items-center mb-3"
                style={{ background: `hsl(var(--${p.color}) / 0.12)`, color: `hsl(var(--${p.color}))` }}>
                <p.icon className="h-5 w-5" />
              </div>
              <div className="text-[12px] font-bold leading-tight">{p.name}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(var(--${p.status === "Learning" ? "status-warning" : "status-healthy"}))` }} />
                <span className="text-[11px] font-semibold" style={{ color: `hsl(var(--${p.status === "Learning" ? "status-warning" : "status-healthy"}))` }}>{p.status}</span>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">{p.a}</div>
              <div className="text-[11px] text-muted-foreground">{p.b}</div>
              <a href="#" className="mt-3 text-[11px] font-semibold text-ai inline-flex items-center gap-1">Enter Workspace <ArrowRight className="h-3 w-3" /></a>
            </div>
          ))}
        </div>
      </Card>

      <Card className="xl:col-span-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Digital Coworker Activity</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View All Coworkers <ArrowRight className="h-3 w-3" /></a>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr_1.4fr_0.9fr] gap-3 px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Coworker</span><span>Current State</span><span>Last Activity</span><span>Stage</span>
        </div>
        <ul className="space-y-2">
          {coworkers.map((c) => (
            <li key={c.name} className="grid grid-cols-[1.4fr_1fr_1.4fr_0.9fr] gap-3 items-center rounded-lg border border-border bg-background/40 px-2 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-md bg-ai-soft text-ai grid place-items-center shrink-0"><c.icon className="h-3.5 w-3.5" /></div>
                <span className="text-[12px] font-semibold truncate">{c.name}</span>
              </div>
              <span className="text-[11px] text-muted-foreground truncate">{c.state}</span>
              <span className="text-[11px] text-muted-foreground truncate">{c.last}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: `hsl(var(--${c.stageColor}))` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(var(--${c.stageColor}))` }} />
                {c.stage}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- BOTTOM GRID ---------- */
function BottomGrid() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <Card className="xl:col-span-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Operational Posture Map</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View Map <ArrowRight className="h-3 w-3" /></a>
        </div>
        <div className="flex items-center justify-between gap-2 my-2">
          <PostureBubble icon={Users} label={"Business\nServices"} />
          <div className="flex-1 h-px border-t border-dashed border-border" />
          <PostureBubble icon={Sparkles} label={"neuGAIN\nExecution Fabric"} accent />
          <div className="flex-1 h-px border-t border-dashed border-border" />
          <PostureBubble icon={Box} label={"Digital\nCoworkers"} />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { icon: LayoutGrid, t: "Systems &\nPlatforms", v: "28 Connected", c: "status-info" },
            { icon: Activity, t: "Signals &\nTelemetry", v: "42.3K Events", c: "ai" },
            { icon: ShieldHalf, t: "Governance\nLayer", v: "Active", c: "status-warning" },
            { icon: Sparkles, t: "Outcomes", v: "Resilient", c: "ai" },
          ].map((b) => (
            <div key={b.t} className="rounded-lg border border-border bg-background/40 p-2 text-center">
              <div className="h-7 w-7 mx-auto rounded-md grid place-items-center mb-1"
                style={{ background: `hsl(var(--${b.c}) / 0.12)`, color: `hsl(var(--${b.c}))` }}>
                <b.icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-[10px] font-semibold whitespace-pre-line leading-tight">{b.t}</div>
              <div className="text-[10px] mt-1 font-semibold" style={{ color: `hsl(var(--${b.c}))` }}>{b.v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="xl:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">My Work Queue</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></a>
        </div>
        <ul className="space-y-2">
          {[
            { icon: CheckCircle2, color: "status-warning", t: "My Approvals", n: 3 },
            { icon: Eye, color: "ai", t: "My Reviews", n: 2 },
            { icon: ClipboardList, color: "status-info", t: "My Assigned Work", n: 7 },
            { icon: Star, color: "status-warning", t: "My Watchlist", n: 5 },
            { icon: FileText, color: "ai", t: "My Drafts", n: 2 },
            { icon: Activity, color: "muted-foreground", t: "My Recent Activity" },
          ].map((q: any) => (
            <li key={q.t} className="flex items-center gap-2 py-1">
              <div className="h-7 w-7 rounded-md grid place-items-center"
                style={{ background: `hsl(var(--${q.color}) / 0.12)`, color: `hsl(var(--${q.color}))` }}>
                <q.icon className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-[12px] font-semibold">{q.t}</span>
              {q.n !== undefined && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-accent text-foreground">{q.n}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="xl:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Integration Status</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View Integrations <ArrowRight className="h-3 w-3" /></a>
        </div>
        <ul className="space-y-2">
          {["ServiceNow", "Jira", "Azure", "AWS", "Google Cloud", "Microsoft 365"].map((n) => (
            <li key={n} className="flex items-center gap-2 py-1">
              <div className="h-6 w-6 rounded bg-accent grid place-items-center text-[10px] font-bold text-muted-foreground">{n[0]}</div>
              <span className="flex-1 text-[12px] font-semibold">{n}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-healthy">
                <span className="h-1.5 w-1.5 rounded-full bg-status-healthy" /> Connected
              </span>
            </li>
          ))}
        </ul>
        <a href="#" className="block mt-3 text-[11px] font-semibold text-ai">View All Integrations (18) →</a>
      </Card>

      <Card className="xl:col-span-2">
        <h3 className="text-sm font-bold mb-3">Quick Launch</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Box, t: "Digital Coworker Catalog" },
            { icon: Workflow, t: "Workflow Studio" },
            { icon: Building2, t: "Solution Library" },
            { icon: GitBranch, t: "Integration Center" },
            { icon: ShieldHalf, t: "Governance Center" },
            { icon: FileCheck, t: "Evidence Center" },
            { icon: BarChart3, t: "Reports & Dashboards" },
            { icon: Cog, t: "Admin Center" },
            { icon: HelpCircle, t: "Help & Support" },
          ].map((q) => (
            <div key={q.t} className="rounded-lg border border-border bg-background/40 p-2 text-center hover:border-ai/40 cursor-pointer">
              <div className="h-7 w-7 mx-auto rounded-md bg-ai-soft text-ai grid place-items-center mb-1">
                <q.icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-[9px] font-semibold leading-tight">{q.t}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="xl:col-span-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Trust &amp; Governance</h3>
          <a href="#" className="text-xs font-semibold text-ai inline-flex items-center gap-1">View Controls <ArrowRight className="h-3 w-3" /></a>
        </div>
        <ul className="space-y-2">
          {[
            { icon: Users, t: "Role-Based Access", v: "Enforced" },
            { icon: CheckCircle2, t: "Approval Gates", v: "Active" },
            { icon: FileText, t: "Audit Trail", v: "Enabled" },
            { icon: ShieldCheck, t: "Policy Controls", v: "Active" },
            { icon: FileCheck, t: "Evidence Capture", v: "Automated" },
            { icon: Database, t: "Data Boundaries", v: "Customer Controlled" },
            { icon: KeyRound, t: "Secrets Management", v: "Secure" },
            { icon: Cog, t: "API Execution", v: "Governed" },
          ].map((g) => (
            <li key={g.t} className="flex items-center gap-2 py-1">
              <div className="h-6 w-6 rounded-md bg-accent text-muted-foreground grid place-items-center">
                <g.icon className="h-3.5 w-3.5" />
              </div>
              <span className="flex-1 text-[12px] font-semibold">{g.t}</span>
              <span className="text-[11px] font-bold text-status-healthy">{g.v}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function PostureBubble({ icon: Icon, label, accent }: any) {
  return (
    <div className="flex flex-col items-center text-center shrink-0">
      <div className={`h-12 w-12 rounded-full grid place-items-center ${accent ? "bg-ai text-ai-foreground" : "bg-accent text-muted-foreground"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[10px] font-semibold mt-1 whitespace-pre-line leading-tight">{label}</div>
    </div>
  );
}

/* ---------- FOOTER ---------- */
function CommandFooter() {
  const items = [
    { icon: Cloud, label: "Deployment", value: "Neurealm SaaS" },
    { icon: Globe, label: "Region", value: "US East (N. Virginia)" },
    { icon: ShieldCheck, label: "Security", value: "Zero Trust Aligned" },
    { icon: FileCheck, label: "Compliance", value: "SOC 2 Type II" },
    { icon: Building2, label: "Tenant ID", value: "NRLM-78219" },
  ];
  return (
    <footer className="border-t border-border bg-card">
      <div className="px-6 lg:px-8 h-12 flex items-center gap-6 text-[11px] text-muted-foreground">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-1.5">
            <i.icon className="h-3.5 w-3.5" />
            <span>{i.label}:</span>
            <span className="font-semibold text-foreground">{i.value}</span>
          </div>
        ))}
        <div className="flex-1" />
        <span>© {new Date().getFullYear()} Neurealm. All rights reserved. | neuGAIN Platform Live</span>
        <a href="#" className="hover:text-foreground">Privacy</a>
        <span>|</span>
        <a href="#" className="hover:text-foreground">Terms</a>
      </div>
    </footer>
  );
}

/* ---------- SHARED ---------- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-sm)] ${className}`}>
      {children}
    </div>
  );
}