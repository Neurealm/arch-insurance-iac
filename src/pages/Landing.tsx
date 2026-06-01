import { Link } from "react-router-dom";
import {
  Sparkles, Play, Lock, ShieldCheck, BarChart3, Cloud, Cpu, Database,
  Settings as Cog, Activity, CheckCircle2, FileCheck, UserCog, ClipboardCheck,
  Eye, Brain, Lightbulb, CheckCheck, Zap, Building2, Server, Box,
  Heart, Cpu as ChipIcon, Briefcase, Factory, Landmark, ShoppingBag,
  ArrowRight, ShieldCheck as Shield2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import neurealmLogo from "@/assets/neurealm-logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Hero />
        <PracticesAndActivity />
        <DeploymentGovernanceIntegrations />
        <IndustryOutcomesAction />
      </main>
      <TrustBar />
      <Footer />
    </div>
  );
}

/* ---------- NAV ---------- */
function LandingNav() {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={neurealmLogo} alt="Neurealm" className="h-[3.75rem] w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium text-muted-foreground">
          <a href="#platform" className="hover:text-foreground transition">Platform</a>
          <a href="#solutions" className="hover:text-foreground transition">Solutions</a>
          <a href="#resources" className="hover:text-foreground transition">Resources</a>
          <a href="#industries" className="hover:text-foreground transition">Industries</a>
          <a href="#company" className="hover:text-foreground transition">Company</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" className="h-9 gap-2 text-[13px]">
              <Lock className="h-3.5 w-3.5" /> Login
            </Button>
          </Link>
          <a href="mailto:hello@neugain.io">
            <Button className="h-9 text-[13px] bg-ai hover:bg-ai/90 text-ai-foreground">Request a Demo</Button>
          </a>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo to-ai grid place-items-center text-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M4 18 L9 6 L14 18 L19 6" />
      </svg>
    </div>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="pt-12 pb-10 grid lg:grid-cols-2 gap-10 items-center">
      <div className="space-y-7">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai-soft border border-ai/20 text-[11px] font-semibold tracking-wide text-ai uppercase">
          <Sparkles className="h-3.5 w-3.5" /> neuGAIN AI Platform
        </span>
        <h1 className="text-[44px] sm:text-[52px] font-bold leading-[1.05] tracking-tight">
          AI-Native Operations.<br />
          Governed Automation.<br />
          <span className="bg-gradient-to-r from-indigo via-ai to-ai bg-clip-text text-transparent">
            Digital Coworkers at Scale.
          </span>
        </h1>
        <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
          neuGAIN connects practices, platforms, data, and digital coworkers into a unified
          execution fabric for modern enterprise operations.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/login">
            <Button className="h-11 px-6 gap-2 bg-ai hover:bg-ai/90 text-ai-foreground">
              <Lock className="h-4 w-4" /> Login
            </Button>
          </Link>
          <Button variant="outline" className="h-11 px-6 gap-2">
            <Play className="h-4 w-4" /> Watch Overview
          </Button>
        </div>
      </div>
      <FlowDiagram />
    </section>
  );
}

/* ---------- ANIMATED FLOW DIAGRAM ---------- */
function FlowDiagram() {
  const inputs = [
    { label: "Practices", icon: Box, color: "indigo", x: 8, y: 18 },
    { label: "Data", icon: Database, color: "indigo", x: 4, y: 50 },
    { label: "People", icon: UserCog, color: "status-healthy", x: 8, y: 82 },
  ];
  const outputs = [
    { label: "Digital Coworkers", icon: Brain, color: "ai", x: 92, y: 18 },
    { label: "Platforms", icon: Cloud, color: "indigo", x: 96, y: 50 },
    { label: "Actions", icon: Zap, color: "status-warning", x: 92, y: 82 },
  ];
  return (
    <div className="relative aspect-[5/4] w-full">
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineIn" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(var(--indigo))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="hsl(var(--ai))" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="lineOut" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(var(--ai))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--status-warning))" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {inputs.map((n, i) => (
          <g key={i}>
            <path
              d={`M ${n.x + 4} ${n.y * 0.8} Q 30 ${n.y * 0.8}, 50 40`}
              fill="none" stroke="url(#lineIn)" strokeWidth="0.4" strokeDasharray="0.8 0.8"
            />
            <circle r="0.6" fill="hsl(var(--ai))">
              <animateMotion dur={`${2 + i * 0.4}s`} repeatCount="indefinite"
                path={`M ${n.x + 4} ${n.y * 0.8} Q 30 ${n.y * 0.8}, 50 40`} />
            </circle>
          </g>
        ))}
        {outputs.map((n, i) => (
          <g key={i}>
            <path
              d={`M 50 40 Q 70 ${n.y * 0.8}, ${n.x - 4} ${n.y * 0.8}`}
              fill="none" stroke="url(#lineOut)" strokeWidth="0.4" strokeDasharray="0.8 0.8"
            />
            <circle r="0.6" fill="hsl(var(--ai))">
              <animateMotion dur={`${2.2 + i * 0.3}s`} repeatCount="indefinite"
                path={`M 50 40 Q 70 ${n.y * 0.8}, ${n.x - 4} ${n.y * 0.8}`} />
            </circle>
          </g>
        ))}
      </svg>

      {/* Center hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-36 w-36 rounded-full bg-gradient-to-br from-white to-ai-soft border border-ai/20 shadow-[var(--shadow-lg)] grid place-items-center">
          <div className="absolute inset-2 rounded-full border border-ai/15 animate-[pulseRing_2.5s_ease-out_infinite]" />
          <LogoMark />
        </div>
        <div className="text-center mt-3">
          <div className="text-xs font-semibold text-ai">Unified Execution Fabric</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Intelligent. Autonomous. Governed.</div>
        </div>
      </div>

      {/* Nodes */}
      {[...inputs, ...outputs].map((n, i) => (
        <FlowNode key={i} {...n} side={inputs.includes(n) ? "left" : "right"} />
      ))}
    </div>
  );
}
function FlowNode({ label, icon: Icon, color, x, y, side }: any) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
      style={{ left: `${x}%`, top: `${y * 0.8 + 5}%`, flexDirection: side === "right" ? "row-reverse" : "row" }}
    >
      <div
        className="h-12 w-12 rounded-full bg-card border border-border shadow-[var(--shadow-md)] grid place-items-center"
        style={{ color: `hsl(var(--${color}))` }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-semibold text-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ---------- PRACTICES + COWORKER ACTIVITY ---------- */
const practices = [
  { name: "AI", icon: Sparkles, color: "ai", items: ["Agentic Workflows", "LLM Orchestration", "RAG Pipelines", "AI Guardrails"] },
  { name: "Data & Analytics", icon: BarChart3, color: "status-info", items: ["Data Engineering", "Analytics & BI", "Data Platforms", "AI-Ready Data"] },
  { name: "Platform Engineering", icon: Cloud, color: "status-healthy", items: ["DevOps & GitOps", "Cloud Native", "SRE & Observability", "Platform Automation"] },
  { name: "Chip to Edge Engineering", icon: ChipIcon, color: "status-warning", items: ["Embedded Systems", "IoT & Edge", "Device Operations", "Edge Intelligence"] },
  { name: "Cybersecurity", icon: ShieldCheck, color: "ai", items: ["Zero Trust", "IAM & Access", "Vulnerability Mgmt", "Security Automation"] },
  { name: "RunOps", icon: Cog, color: "status-healthy", items: ["ITSM & CloudOps", "Infrastructure", "Network & EUC", "SRE & Automation"] },
];
const coworkers = [
  { name: "Cloud Governance Coworker", note: "Detected untagged resources in AWS us-east-1", time: "2 min ago", icon: Cloud },
  { name: "Identity Hygiene Coworker", note: "Found 8 accounts with excessive privileges", time: "5 min ago", icon: UserCog },
  { name: "Service Reliability Coworker", note: "Identified failing dependency impacting availability", time: "8 min ago", icon: Activity },
  { name: "Security Posture Coworker", note: "Blocked sign-in from risky geo-location", time: "12 min ago", icon: ShieldCheck },
  { name: "FinOps Coworker", note: "Rightsized 23 underutilized cloud resources", time: "15 min ago", icon: BarChart3 },
];
const stages = [
  { label: "Observed", icon: Eye },
  { label: "Reasoned", icon: Brain },
  { label: "Recommended", icon: Lightbulb },
  { label: "Approved", icon: CheckCheck },
  { label: "Executed", icon: Zap },
];

function PracticesAndActivity() {
  return (
    <section className="grid lg:grid-cols-[1.15fr_1fr] gap-6 pt-2 pb-8">
      {/* Practices */}
      <Panel header="PRACTICES">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {practices.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border bg-card p-4 card-hover">
              <div
                className="h-10 w-10 rounded-full grid place-items-center mb-3"
                style={{ background: `hsl(var(--${p.color}) / 0.12)`, color: `hsl(var(--${p.color}))` }}
              >
                <p.icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold text-foreground leading-tight">{p.name}</div>
              <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                {p.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
              <div className="mt-3 h-0.5 rounded-full" style={{ background: `hsl(var(--${p.color}) / 0.4)` }} />
            </div>
          ))}
        </div>
      </Panel>

      {/* Coworker Activity */}
      <Panel header="DIGITAL COWORKER ACTIVITY">
        <div className="hidden md:flex items-center justify-end gap-4 mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {stages.map((s) => (
            <div key={s.label} className="flex items-center gap-1">
              <s.icon className="h-3 w-3" /> {s.label}
            </div>
          ))}
        </div>
        <ul className="space-y-3">
          {coworkers.map((c, idx) => (
            <li key={c.name} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-ai-soft text-ai grid place-items-center shrink-0">
                <c.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">{c.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{c.note}</div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                {stages.map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full" style={{
                    background: i <= ((idx + 3) % stages.length)
                      ? "hsl(var(--ai))" : "hsl(var(--border))"
                  }} />
                ))}
                <CheckCircle2 className="h-4 w-4 text-status-healthy" />
              </div>
              <div className="text-[11px] text-muted-foreground w-16 text-right">{c.time}</div>
            </li>
          ))}
        </ul>
        <a href="#" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ai">
          View all activity <ArrowRight className="h-3 w-3" />
        </a>
      </Panel>
    </section>
  );
}

/* ---------- DEPLOYMENT / GOVERNANCE / INTEGRATIONS ---------- */
function DeploymentGovernanceIntegrations() {
  return (
    <section className="grid lg:grid-cols-[1fr_1.1fr_1.1fr] gap-6 pb-8">
      <Panel header="DEPLOYMENT MODELS">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "neuGAIN SaaS", sub: "Multi-tenant SaaS\nmanaged by Neurealm", icon: Cloud },
            { name: "Customer-Hosted SaaS", sub: "Single-tenant SaaS\nin your environment", icon: Building2 },
            { name: "Containerized Execution", sub: "Deploy anywhere\nCloud or On-Prem", icon: Box },
          ].map((d) => (
            <div key={d.name} className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="h-9 w-9 mx-auto rounded-lg bg-accent text-indigo grid place-items-center mb-2">
                <d.icon className="h-4 w-4" />
              </div>
              <div className="text-[12px] font-bold text-foreground">{d.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1 whitespace-pre-line">{d.sub}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel header="GOVERNANCE & TRUST">
        <div className="grid grid-cols-5 gap-3">
          {[
            { name: "Approval Gates", sub: "Human-in-the-loop", icon: ClipboardCheck },
            { name: "Audit Trail", sub: "Complete visibility", icon: FileCheck },
            { name: "RBAC", sub: "Role-based access", icon: UserCog },
            { name: "Policy Controls", sub: "Guardrails & policies", icon: ShieldCheck },
            { name: "Evidence Capture", sub: "Automated reporting", icon: CheckCircle2 },
          ].map((g) => (
            <div key={g.name} className="text-center">
              <div className="h-9 w-9 mx-auto rounded-lg bg-ai-soft text-ai grid place-items-center mb-2">
                <g.icon className="h-4 w-4" />
              </div>
              <div className="text-[11px] font-bold text-foreground leading-tight">{g.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{g.sub}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel header="INTEGRATION ECOSYSTEM">
        <div className="grid grid-cols-4 gap-3">
          {["ServiceNow", "Jira", "Azure", "AWS", "Google Cloud", "Microsoft 365", "CoreStack", "Okta"].map((b) => (
            <div key={b} className="h-12 rounded-lg border border-border bg-card grid place-items-center text-[11px] font-semibold text-muted-foreground">
              {b}
            </div>
          ))}
        </div>
        <div className="mt-3 text-center text-xs text-ai font-semibold">…and 150+ more integrations</div>
      </Panel>
    </section>
  );
}

/* ---------- INDUSTRY + OUTCOMES + ACTION ---------- */
function IndustryOutcomesAction() {
  const industries = [
    { name: "Healthcare", icon: Heart },
    { name: "HiTech", icon: ChipIcon },
    { name: "Financial Services", icon: Briefcase },
    { name: "Insurance", icon: ShieldCheck },
    { name: "Manufacturing", icon: Factory },
    { name: "Public Sector", icon: Landmark },
  ];
  const outcomes = [
    { name: "Accelerate Resolution", sub: "Resolve faster with AI-powered insights" },
    { name: "Reduce Risk", sub: "Proactive risk detection & remediation" },
    { name: "Improve Reliability", sub: "Increase uptime & service performance" },
    { name: "Optimize Costs", sub: "Intelligent automation & optimization" },
    { name: "Ensure Compliance", sub: "Governed operations by design" },
  ];
  return (
    <section className="grid lg:grid-cols-[1fr_1.3fr_1fr] gap-6 pb-12">
      <Panel header="INDUSTRY LENS">
        <div className="grid grid-cols-3 gap-3">
          {industries.map((i) => (
            <div key={i.name} className="text-center">
              <div className="h-10 w-10 mx-auto rounded-full bg-accent text-indigo grid place-items-center mb-1.5">
                <i.icon className="h-4 w-4" />
              </div>
              <div className="text-[11px] font-semibold text-foreground">{i.name}</div>
            </div>
          ))}
        </div>
        <a href="#" className="block mt-4 text-center text-xs font-semibold text-ai">Explore all industries →</a>
      </Panel>

      <Panel header="OUTCOMES THAT MATTER">
        <div className="grid grid-cols-5 gap-2">
          {outcomes.map((o) => (
            <div key={o.name} className="text-center">
              <div className="text-[12px] font-bold text-foreground leading-tight">{o.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-snug">{o.sub}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="rounded-2xl bg-gradient-to-br from-indigo to-ai p-6 text-white shadow-[var(--shadow-lg)] flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">See neuGAIN AI Platform in Action</div>
          <p className="text-sm text-white/90">Experience the power of AI-native operations.</p>
        </div>
        <div className="flex gap-2 mt-4">
          <a href="mailto:hello@neugain.io" className="flex-1">
            <Button className="w-full h-9 bg-white text-indigo hover:bg-white/90 text-xs">Request a Demo</Button>
          </a>
          <a href="mailto:sales@neugain.io" className="flex-1">
            <Button variant="outline" className="w-full h-9 border-white/40 text-white hover:bg-white/10 bg-transparent text-xs">Contact Sales</Button>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- TRUST BAR + FOOTER ---------- */
function TrustBar() {
  return (
    <div className="border-t border-border bg-card/50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Shield2 className="h-4 w-4 text-status-healthy" />
          Secure by design. Built for enterprise. Trusted to run critical operations.
        </div>
        <div className="flex flex-wrap items-center gap-5 font-medium">
          <span>Zero Trust Aligned</span>
          <span>Data is Customer Controlled</span>
          <span>ISO 27001 Aligned</span>
          <span>SOC 2 Type II Aligned</span>
          <span>GDPR Ready</span>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer id="company" className="border-t border-border bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <img src={neurealmLogo} alt="Neurealm" className="h-7 w-auto" />
        <div>© {new Date().getFullYear()} Neurealm. All rights reserved.</div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Security</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- SHARED ---------- */
function Panel({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-[var(--shadow-sm)]">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-4">{header}</div>
      {children}
    </div>
  );
}
