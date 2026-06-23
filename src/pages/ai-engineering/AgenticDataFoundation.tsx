import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Home, Eye, LayoutGrid, Cpu, Network, GitBranch, Calendar, Trophy,
  FileText, BookOpen, Settings, Download, Play, Maximize2, ArrowRight,
  Database, Shield, Layers, Sparkles, Workflow, CheckCircle2, Search,
  Bot, Activity, Cloud, Server, BarChart3, Lock, Zap, Target, Users,
  RefreshCw, FileCheck, Lightbulb,
} from "lucide-react";

/* ===================== DESIGN TOKENS ===================== */
const C = {
  primary: "#0B1F5E",
  secondary: "#2455E6",
  green: "#0F9D58",
  orange: "#F57C00",
  purple: "#6C43E0",
  grey: "#F5F7FA",
  dark: "#4A5568",
  text: "#1E293B",
  divider: "#E2E8F0",
};

/* ===================== LEFT IN-PAGE SIDEBAR ===================== */
const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "observations", label: "Observations", icon: Eye },
  { id: "architecture", label: "Architecture", icon: LayoutGrid },
  { id: "execution", label: "Execution Model", icon: Cpu },
  { id: "context", label: "Context Layer", icon: Network },
  { id: "rca", label: "RCA Journey", icon: GitBranch },
  { id: "plan", label: "6 Week Plan", icon: Calendar },
  { id: "outcomes", label: "Outcomes", icon: Trophy },
  { id: "artifacts", label: "Artifacts", icon: FileText },
  { id: "glossary", label: "Glossary", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const TOPNAV = [
  { id: "observations", n: 1, label: "Observations" },
  { id: "architecture", n: 2, label: "Future State" },
  { id: "execution", n: 3, label: "Execution Model" },
  { id: "context", n: 4, label: "Context Layer" },
  { id: "rca", n: 5, label: "CI Journey" },
  { id: "plan", n: 6, label: "6 Week Plan" },
  { id: "outcomes", n: 7, label: "Outcomes" },
];

const PRINCIPLES = [
  "Federate, Don't Duplicate",
  "Trust Before Intelligence",
  "Near Real-Time Context",
  "Build Once, Reuse Many Times",
  "Explainability Over Black Box",
  "Secure By Design",
  "Future Agent Ready",
];

/* ===================== SHARED PRIMITIVES ===================== */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <div className="text-xs font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: C.secondary }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ color: C.primary }} className="font-bold leading-tight" >
        <span className="text-[44px] md:text-[56px]">{title}</span>
      </h1>
      {subtitle && (
        <p className="mt-4 text-[18px] md:text-[20px] font-medium max-w-4xl" style={{ color: C.dark }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SoftCard({ children, className, accent }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-5 transition-all hover:shadow-md",
        className,
      )}
      style={{
        boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)",
        border: `1px solid ${C.divider}`,
        borderTop: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, color = C.secondary }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}
    >
      {children}
    </span>
  );
}

/* ===================== PAGE 1 — OBSERVATIONS ===================== */
function Observations() {
  const observations = [
    { t: "Distributed Data Estate", d: "Operational data exists across multiple specialized platforms purpose-built for their domain." },
    { t: "Diverse Representations", d: "Different systems represent the same entities through their own native schemas." },
    { t: "Variable Freshness", d: "Each platform operates on its own cadence and refresh model." },
    { t: "Cross-Domain Relationships", d: "Meaningful connections exist between data that lives in different systems." },
    { t: "Distributed Ownership", d: "Operational stewardship is shared across multiple expert teams." },
    { t: "Continuous Agent Onboarding", d: "New AI agents are introduced regularly, each with evolving context needs." },
  ];

  const Flow = ({ steps, accent }: { steps: string[]; accent: string }) => (
    <div className="flex flex-col items-center gap-2">
      {steps.map((s, i) => (
        <div key={i} className="w-full">
          <div
            className="w-full text-center rounded-md px-4 py-3 text-sm font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
          >
            {s}
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-center my-1.5">
              <ArrowRight className="w-4 h-4 rotate-90" style={{ color: accent }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section>
      <SectionHeader
        eyebrow="Page 1 · Observations"
        title="Observations from Modern Agentic AI Environments"
        subtitle="As organizations evolve from traditional observability toward agentic operations, a new architectural need emerges: enabling trusted operational context for AI agents."
      />
      <div className="grid grid-cols-12 gap-6">
        <SoftCard className="col-span-12 lg:col-span-3" accent={C.dark}>
          <div className="mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: C.dark }} />
            <h3 className="text-[18px] font-semibold" style={{ color: C.primary }}>Traditional Operations</h3>
          </div>
          <Flow steps={["Data", "Dashboard", "Human Expert", "Decision"]} accent={C.dark} />
        </SoftCard>

        <div className="col-span-12 lg:col-span-6">
          <SoftCard accent={C.secondary}>
            <h3 className="text-[18px] font-semibold mb-4" style={{ color: C.primary }}>Field Observations</h3>
            <div className="divide-y" style={{ borderColor: C.divider }}>
              {observations.map((o, i) => (
                <div key={i} className="py-3 flex gap-3 group">
                  <div className="mt-1 w-6 h-6 rounded-md grid place-items-center text-[11px] font-bold flex-none"
                    style={{ background: `${C.secondary}14`, color: C.secondary }}>{i + 1}</div>
                  <div>
                    <div className="text-[15px] font-semibold" style={{ color: C.text }}>{o.t}</div>
                    <div className="text-[14px]" style={{ color: C.dark }}>{o.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </SoftCard>
        </div>

        <SoftCard className="col-span-12 lg:col-span-3" accent={C.green}>
          <div className="mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4" style={{ color: C.green }} />
            <h3 className="text-[18px] font-semibold" style={{ color: C.primary }}>Agentic Operations</h3>
          </div>
          <Flow steps={["Data", "Trusted Operational Context", "Context Graph", "AI Agents", "Decision & Recommendation"]} accent={C.green} />
        </SoftCard>
      </div>

      <div className="mt-8 rounded-lg p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})` }}>
        <p className="text-white text-[20px] md:text-[22px] font-semibold">
          The opportunity is not to centralize data — it is to enable <span style={{ color: "#A7F3D0" }}>trusted operational context</span>.
        </p>
      </div>
    </section>
  );
}

/* ===================== PAGE 2 — FUTURE STATE ARCHITECTURE ===================== */
function Architecture() {
  const Layer = ({ idx, title, accent, items, icon: Icon }: any) => (
    <SoftCard accent={accent}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-md grid place-items-center" style={{ background: `${accent}14`, color: accent }}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold tracking-[0.15em]" style={{ color: accent }}>LAYER {idx}</div>
          <div className="text-[18px] font-semibold" style={{ color: C.primary }}>{title}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((it: string) => (
          <div key={it} className="px-3 py-2 rounded-md text-[13px] font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: C.grey, color: C.text, border: `1px solid ${C.divider}` }}>
            {it}
          </div>
        ))}
      </div>
    </SoftCard>
  );

  const contextSteps = [
    "Federation", "Trust Validation", "Context Hydration", "Entity Resolution",
    "Relationship Modeling", "Evidence Assembly", "Confidence", "Semantic Contracts",
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Page 2 · Future State"
        title="Federated Context Architecture for Agentic Operations"
        subtitle="Four cooperating layers that turn distributed operational data into trusted, agent-ready context — without introducing another data platform."
      />

      <div className="space-y-5">
        <Layer idx={1} title="Source Systems" accent={C.dark} icon={Database}
          items={["XSIAM", "BigQuery", "LogicMonitor", "Datadog", "Future Sources"]} />

        <SoftCard accent={C.secondary}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-md grid place-items-center" style={{ background: `${C.secondary}14`, color: C.secondary }}>
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.15em]" style={{ color: C.secondary }}>LAYER 2</div>
              <div className="text-[18px] font-semibold" style={{ color: C.primary }}>Context Engineering Layer</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {contextSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-md text-[12.5px] font-semibold transition-all hover:scale-105 cursor-default"
                  style={{ background: `${C.secondary}10`, color: C.secondary, border: `1px solid ${C.secondary}33` }}>
                  {s}
                </div>
                {i < contextSteps.length - 1 && <ArrowRight className="w-3.5 h-3.5" style={{ color: C.secondary }} />}
              </div>
            ))}
          </div>
        </SoftCard>

        <Layer idx={3} title="Context Graph" accent={C.purple} icon={Network}
          items={["Dependency Graph", "Knowledge Graph", "Impact Analysis", "Digital Twin", "Service Relationships"]} />

        <Layer idx={4} title="Agent Consumers" accent={C.green} icon={Bot}
          items={["Network SRE", "CloudOps", "FinOps", "Capacity", "Security", "NetOps", "Future Agents"]} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: `${C.green}10`, border: `1px solid ${C.green}33` }}>
          <Shield className="w-5 h-5" style={{ color: C.green }} />
          <span className="text-[15px] font-semibold" style={{ color: C.primary }}>Read-Only Access</span>
        </div>
        <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: `${C.secondary}10`, border: `1px solid ${C.secondary}33` }}>
          <Layers className="w-5 h-5" style={{ color: C.secondary }} />
          <span className="text-[15px] font-semibold" style={{ color: C.primary }}>No Data Duplication</span>
        </div>
      </div>
    </section>
  );
}

/* ===================== PAGE 3 — EXECUTION MODEL ===================== */
function Execution() {
  const stages = [
    { n: 1, title: "Understand Ecosystem", color: C.secondary, icon: Search,
      activities: ["Inventory source systems", "Map ownership", "Identify agent demand"],
      examples: ["XSIAM telemetry catalog", "Datadog service map"],
      outputs: ["Source Catalog", "Ownership Map"] },
    { n: 2, title: "Establish Common Understanding", color: C.purple, icon: Users,
      activities: ["Align on entities", "Define operational vocabulary", "Stakeholder workshops"],
      examples: ["Entity glossary", "Domain ontology drafts"],
      outputs: ["Common Vocabulary", "Entity Definitions"] },
    { n: 3, title: "Enable Trusted Context", color: C.green, icon: Shield,
      activities: ["Trust scoring", "Freshness validation", "Schema profiling"],
      examples: ["Source trust scorecard", "Freshness SLAs"],
      outputs: ["Trust Scorecard", "Confidence Model"] },
    { n: 4, title: "Enable Relational Intelligence", color: C.orange, icon: Network,
      activities: ["Cross-source entity resolution", "Relationship discovery", "Graph hydration"],
      examples: ["Service dependency graph", "Cross-cloud topology"],
      outputs: ["Relationship Model", "Context Graph"] },
    { n: 5, title: "Publish Agent Ready Interfaces", color: C.secondary, icon: Bot,
      activities: ["Semantic contracts", "Versioned APIs", "Evidence packaging"],
      examples: ["Context API for SRE agent", "Capacity context contract"],
      outputs: ["Semantic Contracts", "Agent SDK"] },
    { n: 6, title: "Continuous Improvement", color: C.primary, icon: RefreshCw,
      activities: ["Feedback loops", "Trust recalibration", "New source onboarding"],
      examples: ["Agent feedback telemetry", "Trust drift alerts"],
      outputs: ["Learning Loop", "Maturity Index"] },
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Page 3 · Execution Model"
        title="Agentic Data Enablement Execution Model"
        subtitle="Six sequential stages that move an enterprise from inventory through to continuously improving agent readiness."
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {stages.map((s, i) => (
              <SoftCard key={s.n} accent={s.color} className="animate-fade-in"
                {...{ style: { animationDelay: `${i * 80}ms` } as any }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full grid place-items-center text-white font-bold" style={{ background: s.color }}>
                    {s.n}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.15em]" style={{ color: s.color }}>STAGE {s.n}</div>
                    <div className="text-[16px] font-semibold leading-tight" style={{ color: C.primary }}>{s.title}</div>
                  </div>
                </div>
                <div className="space-y-3 text-[13px]">
                  <div>
                    <div className="text-[11px] font-bold tracking-wider mb-1" style={{ color: C.dark }}>KEY ACTIVITIES</div>
                    <ul className="space-y-1">
                      {s.activities.map((a) => (
                        <li key={a} className="flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-none" style={{ color: s.color }} /><span style={{ color: C.text }}>{a}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold tracking-wider mb-1" style={{ color: C.dark }}>EXAMPLES</div>
                    <div className="flex flex-wrap gap-1">
                      {s.examples.map((e) => <Pill key={e} color={s.color}>{e}</Pill>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold tracking-wider mb-1" style={{ color: C.dark }}>OUTPUTS</div>
                    <div className="flex flex-wrap gap-1">
                      {s.outputs.map((o) => (
                        <span key={o} className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                          style={{ background: C.grey, color: C.text, border: `1px solid ${C.divider}` }}>{o}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </SoftCard>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-5">
          <SoftCard accent={C.primary}>
            <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: C.secondary }}>EXECUTION PHILOSOPHY</div>
            <p className="text-[14px]" style={{ color: C.text }}>
              Federate intelligence around what already exists. Build trust before automation. Treat every stage as reusable infrastructure for future agents.
            </p>
          </SoftCard>
          <SoftCard accent={C.green}>
            <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: C.green }}>VALUE FLOW</div>
            <div className="space-y-2 text-[13px]" style={{ color: C.text }}>
              {["Source Awareness", "Common Understanding", "Trusted Context", "Relationship Intelligence", "Agent Enablement", "Continuous Learning"].map((v, i) => (
                <div key={v} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white" style={{ background: C.green }}>{i + 1}</span>
                  {v}
                </div>
              ))}
            </div>
          </SoftCard>
        </div>
      </div>

      <div className="mt-6">
        <SoftCard accent={C.purple}>
          <div className="text-[11px] font-bold tracking-wider mb-3" style={{ color: C.purple }}>GUIDING PRINCIPLES</div>
          <div className="flex flex-wrap gap-2">
            {PRINCIPLES.map((p) => <Pill key={p} color={C.purple}>{p}</Pill>)}
          </div>
        </SoftCard>
      </div>

      <div className="mt-5 rounded-lg p-5 text-white text-center" style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.purple})` }}>
        <span className="text-[18px] font-semibold">Each stage compounds — together they form a durable foundation for any future agent.</span>
      </div>
    </section>
  );
}

/* ===================== PAGE 4 — CONTEXT LAYER ===================== */
function ContextLayer() {
  const sources = ["XSIAM", "BigQuery", "LogicMonitor", "Datadog", "Future Sources"];
  const services = [
    { t: "Schema Profiling", icon: FileCheck },
    { t: "Trust Validation", icon: Shield },
    { t: "Context Hydration", icon: Sparkles },
    { t: "Entity Resolution", icon: Target },
    { t: "Relationship Modeling", icon: Network },
    { t: "Evidence & Confidence", icon: BarChart3 },
    { t: "Semantic Contracts", icon: FileText },
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Page 4 · Context Layer"
        title="Context Engineering Layer"
        subtitle="A federated gateway that profiles, validates, hydrates and contracts operational context — purpose-built for agent consumption."
      />

      <div className="grid grid-cols-12 gap-5">
        <SoftCard className="col-span-12 lg:col-span-2" accent={C.dark}>
          <div className="text-[11px] font-bold tracking-wider mb-3" style={{ color: C.dark }}>SOURCE SYSTEMS</div>
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s} className="px-3 py-2 rounded-md text-[13px] font-semibold text-center"
                style={{ background: C.grey, color: C.text, border: `1px solid ${C.divider}` }}>{s}</div>
            ))}
          </div>
        </SoftCard>

        <SoftCard className="col-span-12 lg:col-span-2" accent={C.secondary}>
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full grid place-items-center mb-3" style={{ background: `${C.secondary}14`, color: C.secondary }}>
              <Workflow className="w-7 h-7" />
            </div>
            <div className="text-[15px] font-semibold" style={{ color: C.primary }}>Federation Gateway</div>
            <div className="text-[12px] mt-1" style={{ color: C.dark }}>Read-only access across all sources</div>
          </div>
        </SoftCard>

        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((s) => (
            <SoftCard key={s.t} accent={C.purple} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-md grid place-items-center mb-2" style={{ background: `${C.purple}14`, color: C.purple }}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-[14px] font-semibold" style={{ color: C.primary }}>{s.t}</div>
            </SoftCard>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-5">
        <SoftCard accent={C.green}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: C.green }}>SHARED INTELLIGENCE SERVICES</div>
          <ul className="text-[13px] space-y-1.5" style={{ color: C.text }}>
            <li>• Entity Catalog</li><li>• Trust Registry</li><li>• Evidence Store</li><li>• Contract Library</li>
          </ul>
        </SoftCard>
        <SoftCard accent={C.orange}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: C.orange }}>CONTINUOUS LEARNING LOOP</div>
          <ul className="text-[13px] space-y-1.5" style={{ color: C.text }}>
            <li>• Agent feedback ingestion</li><li>• Trust recalibration</li><li>• Schema drift detection</li><li>• Contract evolution</li>
          </ul>
        </SoftCard>
        <SoftCard accent={C.secondary}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: C.secondary }}>KEY BENEFITS</div>
          <ul className="text-[13px] space-y-1.5" style={{ color: C.text }}>
            <li>• No new data platform</li><li>• Reusable context</li><li>• Explainable decisions</li><li>• Faster agent onboarding</li>
          </ul>
        </SoftCard>
        <SoftCard accent={C.purple}>
          <div className="text-[11px] font-bold tracking-wider mb-2" style={{ color: C.purple }}>DESIGN PRINCIPLES</div>
          <ul className="text-[13px] space-y-1.5" style={{ color: C.text }}>
            {PRINCIPLES.slice(0, 4).map((p) => <li key={p}>• {p}</li>)}
          </ul>
        </SoftCard>
      </div>
    </section>
  );
}

/* ===================== PAGE 5 — CI / RCA JOURNEY ===================== */
function RcaJourney() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "Query Contract", d: "Agent submits an intent against the published semantic contract.", icon: FileText },
    { t: "Federated Access", d: "Gateway resolves the contract across source systems with read-only access.", icon: Workflow },
    { t: "Context Assembly", d: "Hydrate operational context: builds, deployments, dependencies, telemetry.", icon: Sparkles },
    { t: "Relationship Modeling", d: "Map upstream and downstream entities through the context graph.", icon: Network },
    { t: "Evidence Assembly", d: "Package signals with provenance and confidence into an evidence bundle.", icon: BarChart3 },
    { t: "AI Response", d: "Agent produces an explainable recommendation with traceable evidence.", icon: Bot },
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Page 5 · CI Journey"
        title="CI Failure Journey"
        subtitle="Follow a real operational question end-to-end through the federated context architecture."
      />

      <SoftCard accent={C.secondary} className="mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5" style={{ color: C.secondary }} />
          <Input defaultValue="Why did CI-App-145 fail?" className="text-[16px] font-medium border-0 focus-visible:ring-0 px-0" />
          <Button style={{ background: C.secondary }} className="text-white hover:opacity-90" onClick={() => setStep((s) => (s + 1) % (steps.length + 1))}>
            <Play className="w-4 h-4 mr-1.5" /> Trace
          </Button>
        </div>
      </SoftCard>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 space-y-3">
          {steps.map((s, i) => {
            const active = i < step;
            return (
              <div
                key={s.t}
                onClick={() => setStep(i + 1)}
                className="rounded-lg p-4 flex items-start gap-4 cursor-pointer transition-all"
                style={{
                  background: active ? `${C.secondary}08` : "white",
                  border: `1px solid ${active ? C.secondary : C.divider}`,
                  boxShadow: active ? `0 0 0 3px ${C.secondary}1a` : undefined,
                }}
              >
                <div className="w-9 h-9 rounded-full grid place-items-center text-white font-bold flex-none"
                  style={{ background: active ? C.secondary : C.dark }}>{i + 1}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <s.icon className="w-4 h-4" style={{ color: C.secondary }} />
                    <div className="text-[15px] font-semibold" style={{ color: C.primary }}>{s.t}</div>
                  </div>
                  <div className="text-[13.5px] mt-0.5" style={{ color: C.dark }}>{s.d}</div>
                </div>
                {active && <CheckCircle2 className="w-5 h-5 ml-auto" style={{ color: C.green }} />}
              </div>
            );
          })}
        </div>

        <SoftCard className="col-span-12 lg:col-span-5" accent={C.green}>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5" style={{ color: C.green }} />
            <div className="text-[18px] font-semibold" style={{ color: C.primary }}>Agent Response</div>
            <Pill color={C.green}>Confidence 92%</Pill>
          </div>
          <div className="space-y-3 text-[13.5px]" style={{ color: C.text }}>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: C.dark }}>ROOT CAUSE</div>
              Build CI-App-145 failed due to an upstream dependency contract mismatch introduced in commit a1f2c93.
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: C.dark }}>EVIDENCE</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Pill color={C.secondary}>XSIAM signal</Pill>
                <Pill color={C.secondary}>Datadog trace</Pill>
                <Pill color={C.secondary}>BigQuery build log</Pill>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md p-3" style={{ background: C.grey }}>
                <div className="text-[11px] font-bold" style={{ color: C.dark }}>UPSTREAM IMPACT</div>
                <div className="text-[14px] font-semibold" style={{ color: C.primary }}>2 services</div>
              </div>
              <div className="rounded-md p-3" style={{ background: C.grey }}>
                <div className="text-[11px] font-bold" style={{ color: C.dark }}>DOWNSTREAM IMPACT</div>
                <div className="text-[14px] font-semibold" style={{ color: C.primary }}>7 consumers</div>
              </div>
            </div>
            <div className="rounded-md p-3" style={{ background: `${C.green}10`, border: `1px solid ${C.green}33` }}>
              <div className="text-[11px] font-bold" style={{ color: C.green }}>RECOMMENDATION</div>
              Revert contract change in CI-App-145 and trigger coordinated rebuild of impacted consumers.
            </div>
          </div>
        </SoftCard>
      </div>
    </section>
  );
}

/* ===================== PAGE 6 — 6 WEEK PLAN ===================== */
function Plan() {
  const rows = [
    { name: "Source Intelligence", weeks: [1, 2], color: C.secondary },
    { name: "Trust Validation", weeks: [2, 3], color: C.green },
    { name: "Context Hydration", weeks: [3, 4], color: C.purple },
    { name: "Relationship Modeling", weeks: [4, 5], color: C.orange },
    { name: "Agent Enablement", weeks: [5, 6], color: C.primary },
    { name: "Validation & Knowledge Transfer", weeks: [6], color: C.dark },
  ];
  const deliverables = [
    ["W1", "Source Catalog"], ["W2", "Trust Scorecard"], ["W3", "Hydration Engine"],
    ["W4", "Relationship Model"], ["W5", "Semantic Contracts"], ["W6", "Reference Architecture"],
  ];

  const FragmentRow = ({ r }: { r: typeof rows[number] }) => (
    <>
      <div className="py-3 px-2 text-[13.5px] font-semibold" style={{ color: C.text }}>{r.name}</div>
      {[1, 2, 3, 4, 5, 6].map((w) => {
        const inRange = r.weeks.includes(w);
        return (
          <div key={w} className="py-3 px-1">
            {inRange && (
              <div className="h-7 rounded-md flex items-center justify-center text-[11px] font-semibold text-white transition-transform hover:scale-105"
                style={{ background: r.color }}>
                {r.name.split(" ")[0]}
              </div>
            )}
          </div>
        );
      })}
    </>
  );


  return (
    <section>
      <SectionHeader
        eyebrow="Page 6 · Plan"
        title="6 Week Execution Plan"
        subtitle="A focused, parallelizable swimlane that delivers a reusable reference architecture in six weeks."
      />

      <SoftCard>
        <div className="grid" style={{ gridTemplateColumns: "240px repeat(6, 1fr)", gap: 8 }}>
          <div />
          {["W1", "W2", "W3", "W4", "W5", "W6"].map((w) => (
            <div key={w} className="text-center text-[12px] font-bold py-2 rounded-md" style={{ background: C.grey, color: C.primary }}>{w}</div>
          ))}
          {rows.map((r) => (
            <FragmentRow key={r.name} r={r} />
          ))}
        </div>
      </SoftCard>

      <div className="mt-6">
        <div className="text-[11px] font-bold tracking-wider mb-3" style={{ color: C.secondary }}>WEEKLY DELIVERABLES</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {deliverables.map(([w, d]) => (
            <SoftCard key={w} accent={C.secondary} className="text-center">
              <div className="text-[12px] font-bold" style={{ color: C.secondary }}>{w}</div>
              <div className="text-[14px] font-semibold mt-1" style={{ color: C.primary }}>{d}</div>
            </SoftCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== PAGE 7 — OUTCOMES ===================== */
function Outcomes() {
  const kpis = [
    { t: "Sources Operationalized", v: "5", u: "platforms", c: C.secondary, icon: Database },
    { t: "Freshness SLA", v: "< 60s", u: "p95 context refresh", c: C.green, icon: Zap },
    { t: "Completeness", v: "94%", u: "entity coverage", c: C.purple, icon: Target },
    { t: "Relationship Coverage", v: "87%", u: "cross-domain links", c: C.orange, icon: Network },
    { t: "Pilot Use Cases", v: "6", u: "agentic flows live", c: C.secondary, icon: Bot },
    { t: "Confidence Score", v: "0.92", u: "avg evidence quality", c: C.green, icon: Shield },
    { t: "Future Agent Readiness", v: "Tier 1", u: "contracts published", c: C.purple, icon: Lightbulb },
    { t: "Operational Efficiency", v: "+38%", u: "MTTR improvement", c: C.orange, icon: Activity },
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Page 7 · Outcomes"
        title="Expected Outcomes"
        subtitle="Measurable signals that the federated context foundation is enabling trusted agentic operations."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <SoftCard key={k.t} accent={k.c}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-md grid place-items-center" style={{ background: `${k.c}14`, color: k.c }}>
                <k.icon className="w-5 h-5" />
              </div>
              <Pill color={k.c}>KPI</Pill>
            </div>
            <div className="text-[36px] font-bold leading-none" style={{ color: C.primary }}>{k.v}</div>
            <div className="text-[12px] mt-1" style={{ color: C.dark }}>{k.u}</div>
            <div className="text-[14px] font-semibold mt-2" style={{ color: C.text }}>{k.t}</div>
          </SoftCard>
        ))}
      </div>

      <div className="mt-8 rounded-lg p-6 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.green})` }}>
        <p className="text-[18px] md:text-[20px] font-semibold">
          Trusted operational context enables AI agents to make explainable, timely and consistent operational decisions —
          without introducing another data platform.
        </p>
      </div>
    </section>
  );
}

/* ===================== HOME / ARTIFACTS / GLOSSARY ===================== */
function Hero({ onJump }: { onJump: (id: string) => void }) {
  return (
    <section>
      <SectionHeader
        eyebrow="Agentic Operations Architecture Studio"
        title="Agentic Data Foundation"
        subtitle="An executive architecture experience for enabling trusted operational context for AI agents — federated, explainable, and built on what already exists."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { t: "Federate, Don't Duplicate", d: "Leverage your existing investments without building yet another data platform.", c: C.secondary, icon: Workflow },
          { t: "Trust Before Intelligence", d: "Every agent decision is grounded in scored, validated, explainable evidence.", c: C.green, icon: Shield },
          { t: "Future Agent Ready", d: "Build once, reuse many times — every new agent inherits the same trusted context.", c: C.purple, icon: Sparkles },
        ].map((b) => (
          <SoftCard key={b.t} accent={b.c}>
            <b.icon className="w-6 h-6 mb-2" style={{ color: b.c }} />
            <div className="text-[18px] font-semibold" style={{ color: C.primary }}>{b.t}</div>
            <div className="text-[14px] mt-1" style={{ color: C.dark }}>{b.d}</div>
          </SoftCard>
        ))}
      </div>
      <SoftCard accent={C.primary}>
        <div className="text-[11px] font-bold tracking-wider mb-3" style={{ color: C.primary }}>DESIGN PRINCIPLES</div>
        <div className="flex flex-wrap gap-2">
          {PRINCIPLES.map((p) => <Pill key={p} color={C.primary}>{p}</Pill>)}
        </div>
      </SoftCard>
      <div className="mt-6 flex flex-wrap gap-3">
        {TOPNAV.map((s) => (
          <Button key={s.id} variant="outline" onClick={() => onJump(s.id)} className="text-[13px]">
            {s.n}. {s.label} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        ))}
      </div>
    </section>
  );
}

function Artifacts() {
  const items = [
    "Source Catalog", "Trust Scorecard", "Hydration Engine", "Relationship Model",
    "Semantic Contracts", "Reference Architecture", "Agent SDK", "Evidence Bundle Schema",
  ];
  return (
    <section>
      <SectionHeader eyebrow="Artifacts" title="Architecture Artifacts"
        subtitle="The reusable building blocks produced by the six-week engagement." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((i) => (
          <SoftCard key={i} accent={C.secondary}>
            <FileText className="w-5 h-5 mb-2" style={{ color: C.secondary }} />
            <div className="text-[15px] font-semibold" style={{ color: C.primary }}>{i}</div>
          </SoftCard>
        ))}
      </div>
    </section>
  );
}

function Glossary() {
  const terms = [
    ["Trusted Operational Context", "Validated, scored, federated operational signal made ready for agent consumption."],
    ["Federated Intelligence", "Intelligence assembled across sources without centralizing or duplicating data."],
    ["Semantic Access", "Contract-first interface that exposes meaning, not raw schemas."],
    ["Context Assembly", "The runtime process of hydrating entities, relationships and evidence on demand."],
    ["Relationship Intelligence", "Insight derived from cross-source entity and dependency graphs."],
    ["Agent Readiness", "The maturity of contracts, evidence and trust that lets new agents onboard quickly."],
    ["Continuous Improvement", "Feedback-driven refinement of trust scoring, contracts and relationships."],
    ["Future Agent Ready", "Architectural posture that anticipates onboarding of new agents with minimal change."],
  ];
  return (
    <section>
      <SectionHeader eyebrow="Glossary" title="Shared Language" subtitle="The collaborative vocabulary used across this architecture experience." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms.map(([t, d]) => (
          <SoftCard key={t} accent={C.purple}>
            <div className="text-[15px] font-semibold" style={{ color: C.primary }}>{t}</div>
            <div className="text-[13.5px] mt-1" style={{ color: C.dark }}>{d}</div>
          </SoftCard>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel() {
  return (
    <section>
      <SectionHeader eyebrow="Settings" title="Presentation Settings" subtitle="Optimized for 1920 × 1080 executive presentation." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ["Layout", "16:9 presentation, max 1800px"],
          ["Theme", "White surface with subtle grey accents"],
          ["Language", "Collaborative architecture vocabulary"],
        ].map(([t, d]) => (
          <SoftCard key={t} accent={C.dark}>
            <div className="text-[15px] font-semibold" style={{ color: C.primary }}>{t}</div>
            <div className="text-[13.5px] mt-1" style={{ color: C.dark }}>{d}</div>
          </SoftCard>
        ))}
      </div>
    </section>
  );
}

/* ===================== SHELL ===================== */
export default function AgenticDataFoundation() {
  const [active, setActive] = useState<string>("home");
  const jump = (id: string) => {
    setActive(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: "#FFFFFF", color: C.text }}>
        <div className="flex">
          {/* LEFT IN-PAGE SIDEBAR */}
          <aside
            className="hidden lg:flex flex-col items-center sticky top-0 self-start h-screen py-6"
            style={{ width: 100, background: C.primary }}
          >
            <div className="text-white text-[10px] font-bold tracking-[0.2em] mb-6">ADF</div>
            <nav className="flex-1 w-full flex flex-col items-center gap-1">
              {NAV.map((n) => {
                const isActive = active === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => jump(n.id)}
                    className={cn(
                      "w-[84px] flex flex-col items-center gap-1 py-2.5 rounded-md transition-all",
                      isActive ? "bg-white/15" : "hover:bg-white/10",
                    )}
                  >
                    <n.icon className="w-4 h-4 text-white" />
                    <span className="text-[9.5px] leading-tight text-white/85 text-center font-medium">{n.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MAIN */}
          <div className="flex-1 min-w-0">
            {/* TOP BAR */}
            <div className="sticky top-0 z-20 flex items-center px-6 py-3 bg-white/95 backdrop-blur"
              style={{ borderBottom: `1px solid ${C.divider}` }}>
              <div className="flex-1 flex items-center justify-center gap-1">
                {TOPNAV.map((s) => {
                  const isActive = active === s.id;
                  return (
                    <button key={s.id} onClick={() => jump(s.id)}
                      className={cn("px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all",
                        isActive ? "text-white" : "hover:bg-slate-100")}
                      style={{ background: isActive ? C.secondary : "transparent", color: isActive ? "white" : C.dark }}>
                      <span className="opacity-60 mr-1">{s.n}</span>{s.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" />Export</Button>
                <Button variant="outline" size="sm"><Play className="w-4 h-4 mr-1.5" />Present</Button>
                <Button variant="outline" size="sm"><Maximize2 className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="px-6 lg:px-12 py-10 max-w-[1800px] mx-auto animate-fade-in">
              {active === "home" && <Hero onJump={jump} />}
              {active === "observations" && <Observations />}
              {active === "architecture" && <Architecture />}
              {active === "execution" && <Execution />}
              {active === "context" && <ContextLayer />}
              {active === "rca" && <RcaJourney />}
              {active === "plan" && <Plan />}
              {active === "outcomes" && <Outcomes />}
              {active === "artifacts" && <Artifacts />}
              {active === "glossary" && <Glossary />}
              {active === "settings" && <SettingsPanel />}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
