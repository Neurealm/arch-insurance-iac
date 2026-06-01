import {
  Bot, GitBranch, Target, Zap, Activity, ShieldCheck, Bell, Settings,
  CheckCircle2, Crosshair, BellRing, RefreshCw, ClipboardCheck,
  Users, Layers, Database, Code2, Server,
  Cpu, Workflow, Network, Brain, Search, FileText, GitMerge,
  Cloud, Boxes, Lock, IdCard, ShieldAlert, BarChart3, HardDrive, DollarSign,
  PlayCircle, UserCheck, Sparkles, Bookmark,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const trend = Array.from({ length: 16 }, (_, i) => ({ v: 80 + Math.round(Math.sin(i / 1.6) * 8 + (i % 3) * 3) }));

const headerKpis = [
  { icon: Bot,      label: "Active Digital Coworkers", value: "128",   delta: "▲ 12%",   tone: "text-emerald-600" },
  { icon: GitBranch,label: "Workflows Running",        value: "356",   delta: "Live",    tone: "text-indigo" },
  { icon: Target,   label: "Success Rate (24h)",       value: "97.6%", delta: "▲ 7.1%",  tone: "text-emerald-600" },
  { icon: Zap,      label: "Automation Coverage",      value: "74%",   delta: "▲ 5%",    tone: "text-emerald-600" },
  { icon: Activity, label: "System Health",            value: "98/100",delta: "",        tone: "text-emerald-600", spark: true },
];

const layers = [
  { n: 7, color: "from-indigo-700 to-indigo-600", icon: Users,    title: "Solutions",                       sub: "(RunOps Digital Coworkers)", desc: "The actual business workflows that client buys, and that users interact with.", k1: ["Active Solutions", "42"], k2: ["Adoption (30d)", "86%"], pct: 86 },
  { n: 6, color: "from-indigo-600 to-indigo-500", icon: UserCheck,title: "Experience & Consumption Layer", sub: "",                            desc: "How users access and interact with agents.",                                       k1: ["Users (24h)", "1,842"],     k2: ["Satisfaction", "4.6/5"], pct: 92 },
  { n: 5, color: "from-indigo-500 to-violet-500", icon: Settings, title: "Orchestration & Agent Execution Layer (n8n)", sub: "", desc: "Where agents actually run and execute work.",                                  k1: ["Workflows", "356"],         k2: ["Success (24h)", "97.6%"], pct: 97 },
  { n: 4, color: "from-violet-500 to-purple-500", icon: Brain,    title: "Intelligence & Knowledge Layer (AI)", sub: "",       desc: "How agents think, reason, and understand context.",                                k1: ["AI Requests (24h)", "12,671"], k2: ["Accuracy", "93.8%"], pct: 93 },
  { n: 3, color: "from-purple-500 to-fuchsia-500",icon: Database, title: "Data & Integration Fabric (NeuFlow)", sub: "",       desc: "How data flows in and out of the system.",                                          k1: ["Data Syncs (24h)", "8,932"], k2: ["Connectors", "128"], pct: 88 },
  { n: 2, color: "from-sky-600 to-blue-500",      icon: Code2,    title: "Engineering & Delivery Platform (AI SDLC Pulse)", sub: "", desc: "How we build, deploy, and manage agents.",                              k1: ["Deployments (24h)", "18"],   k2: ["Pipeline Success", "98.1%"], pct: 98 },
  { n: 1, color: "from-slate-700 to-slate-600",   icon: ShieldCheck,title: "Infrastructure & Governance Foundation", sub: "",   desc: "The foundation everything runs on.",                                          k1: ["Uptime (30d)", "99.99%"],    k2: ["Security Alerts (24h)", "2"], pct: 99, alert: true },
];

const flow = [
  { icon: BellRing,      title: "Trigger Signal",       lines: ["Incidents, Tickets,", "Requests, Events,", "Changes, Signals"] },
  { icon: Brain,         title: "Intent Understanding", lines: ["NLP & Context", "Classification", "Enrichment"] },
  { icon: Workflow,      title: "Planning & Reasoning", lines: ["Task Decomposition", "Choose Runbook", "Risk & Impact"] },
  { icon: PlayCircle,    title: "Execution",            lines: ["Agent Executes", "Actions & APIs", "Human-in-the-loop"] },
  { icon: CheckCircle2,  title: "Outcome",              lines: ["Resolve Captured", "Learned & Improved", "Feedback-Loop"] },
];

const agents = [
  "Incident Triage Agent","Change Risk Advisor","Auto-Remediation Agent","SLA Guardian Agent","Knowledge Curator",
];

const execStates = [
  { c: "bg-emerald-500", l: "Succeeded", v: 342 },
  { c: "bg-blue-500",    l: "Running",   v: 10  },
  { c: "bg-amber-500",   l: "Waiting",   v: 3   },
  { c: "bg-rose-500",    l: "Failed",    v: 1   },
];

const intelligence = [
  { icon: Sparkles, title: "LLM Orchestration", body: "Multi-model routing, fallbacks, guardrails" },
  { icon: Network,  title: "Knowledge Graph",   body: "ITIL/Nas, Relationships, Runbooks, Policies" },
  { icon: Database, title: "Vector Store",      body: "RAG, Semantic Search, Context Retrieval" },
  { icon: Brain,    title: "Reasoning Engine",  body: "Multi-step reasoning, Tool use, Planning" },
  { icon: ShieldCheck, title: "Policy & Guardrails", body: "Safety, Compliance, Access, Boundaries" },
];

const dataFabric = [
  { icon: Boxes,    title: "Connectors",         body: "128+" },
  { icon: Code2,    title: "APIs",               body: "REST / GraphQL" },
  { icon: Activity, title: "Streaming",          body: "Real-time Events" },
  { icon: GitMerge, title: "ETL / Pipelines",    body: "Batch & Incremental" },
  { icon: Settings, title: "Data Quality",       body: "Validation, DQ" },
  { icon: Search,   title: "Lineage",            body: "Trace & Audit" },
];

const infra = [
  { icon: Cloud,       title: "Cloud / On-Prem", body: "Hybrid" },
  { icon: Boxes,       title: "Kubernetes",      body: "Orchestration" },
  { icon: Lock,        title: "Security",        body: "Zero Trust" },
  { icon: IdCard,      title: "Identity",        body: "SSO, RBAC, MFA" },
  { icon: ClipboardCheck, title: "Compliance",   body: "SOC2, ISO, GDPR" },
  { icon: BarChart3,   title: "Observability",   body: "Logs, Metrics, Traces" },
  { icon: HardDrive,   title: "Backup & DR",     body: "Resilience" },
  { icon: DollarSign,  title: "FinOps",          body: "Cost Optimization" },
];

const mission = [
  { icon: Crosshair,    t: "Real-time visibility across all operations" },
  { icon: Bell,         t: "Proactive insights and risk detection" },
  { icon: RefreshCw,    t: "Closed-loop automation and continuous learning" },
  { icon: CheckCircle2, t: "Outcome-driven operations at scale" },
];

const outcomes = [
  { l: "MTTR (All Incidents)", v: "38m",   d: "▼ 18%", tone: "text-emerald-600" },
  { l: "SLA Compliance",       v: "96.3%", d: "▲ 5.2%",tone: "text-emerald-600" },
  { l: "Change Success Rate",  v: "92.7%", d: "▲ 9.2%",tone: "text-emerald-600" },
  { l: "Automation Coverage",  v: "74%",   d: "▲ 5%",  tone: "text-emerald-600" },
  { l: "Risk Exposure",        v: "Low",   d: "▼ 16%", tone: "text-emerald-600" },
  { l: "Cost per Ticket",      v: "$18.42",d: "▼ 6%",  tone: "text-emerald-600" },
];

const initiatives = [
  { icon: FileText,  t: "Runbook Optimization",  v: "18 updated" },
  { icon: Zap,       t: "Automation Expansion",  v: "32 new automations" },
  { icon: Brain,     t: "AI Model Training",     v: "Models retrained" },
  { icon: Boxes,     t: "Connector Expansion",   v: "12 new connectors" },
  { icon: DollarSign,t: "Cost Optimization",     v: "$34.7k savings" },
];

const integrations = ["servicenow", "Jira", "Microsoft Teams", "slack", "aws", "Azure", "Google Cloud", "GitHub", "okta", "splunk>", "DATADOG", "...and more"];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>{children}</div>;
}

export default function PlatformOverview() {
  return (
    <div className="bg-white text-slate-900 rounded-xl border border-border p-6 space-y-5">
      {/* Top bar */}
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-violet-100 grid place-items-center">
            <Sparkles className="h-7 w-7 text-violet-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              <span className="text-violet-600">neuGAIN</span> <span className="text-slate-900">Platform</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">The end-to-end operating system for <span className="text-violet-600 font-semibold">Digital Coworkers</span></div>
          </div>
        </div>
        <div className="col-span-7 grid grid-cols-5 gap-3">
          {headerKpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-slate-100 grid place-items-center text-violet-600 shrink-0"><Icon className="h-4.5 w-4.5" /></div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 leading-tight">{k.label}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tabular-nums leading-none">{k.value}</span>
                    {k.spark ? (
                      <div className="h-5 w-12">
                        <ResponsiveContainer><LineChart data={trend}><Line type="monotone" dataKey="v" stroke="rgb(16 185 129)" strokeWidth={1.5} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold ${k.tone}`}>{k.delta}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="col-span-2 flex items-center justify-end gap-2">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
          <div className="text-right">
            <div className="text-sm font-extrabold leading-tight">Trusted by design.</div>
            <div className="text-sm font-extrabold leading-tight">Built to run. <span className="text-violet-600">Built to trust.</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT — 7 layers */}
        <div className="col-span-3 space-y-2">
          <div className="text-[11px] font-bold tracking-wider text-violet-600">THE SEVEN LAYERS</div>
          {layers.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.n} className="flex items-stretch gap-2">
                <div className={`w-10 shrink-0 rounded-md bg-gradient-to-b ${l.color} text-white grid place-items-center text-xl font-extrabold`}>{l.n}</div>
                <Card className="flex-1 p-2.5">
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-[12px] font-bold text-slate-800 leading-tight">{l.title}</div>
                      </div>
                      {l.sub && <div className="text-[10px] text-slate-500">{l.sub}</div>}
                      <div className="text-[10px] text-slate-500 leading-snug mt-0.5">{l.desc}</div>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        <div>
                          <div className="text-[9px] text-slate-500">{l.k1[0]}</div>
                          <div className="text-[12px] font-extrabold">{l.k1[1]}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500">{l.k2[0]}</div>
                          <div className={`text-[12px] font-extrabold ${l.alert ? "text-rose-600" : ""}`}>{l.k2[1]}</div>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${l.pct}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* CENTER */}
        <div className="col-span-7 space-y-3">
          <div className="text-[11px] font-bold tracking-wider text-violet-600">DIGITAL COWORKER OPERATING FLOW</div>
          <div className="grid grid-cols-5 gap-2 items-stretch">
            {flow.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="relative">
                  <Card className="p-2.5 h-full">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-violet-100 grid place-items-center text-violet-600"><Icon className="h-4 w-4" /></div>
                      <div className="text-[12px] font-bold leading-tight">{f.title}</div>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[10px] text-slate-600">
                      {f.lines.map((ln) => <li key={ln}>{ln}</li>)}
                    </ul>
                  </Card>
                  {i < flow.length - 1 && <div className="absolute top-1/2 -right-1.5 text-violet-400 -translate-y-1/2 text-xs">▶</div>}
                </div>
              );
            })}
          </div>

          {/* Orchestration */}
          <div className="rounded-lg border-2 border-violet-200 bg-violet-50/40 p-3">
            <div className="text-[11px] font-bold tracking-wider text-violet-600 text-center mb-2">ORCHESTRATION & EXECUTION (n8n)</div>
            <div className="grid grid-cols-12 gap-3">
              {/* Agent runtime */}
              <Card className="col-span-3 p-2.5">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-violet-600" />
                  <div className="text-[12px] font-bold">Agent Runtime</div>
                </div>
                <div className="text-2xl font-extrabold mt-1">128</div>
                <div className="text-[10px] text-slate-500 -mt-0.5">Active Agents</div>
                <ul className="mt-2 space-y-1">
                  {agents.map((a) => (
                    <li key={a} className="flex items-center gap-1.5 text-[10px] text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{a}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Diagram */}
              <div className="col-span-6 relative h-[260px]">
                {/* SVG connectors layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 260" preserveAspectRatio="none">
                  <defs>
                    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M0,0 L10,5 L0,10 z" fill="rgb(139 92 246)" />
                    </marker>
                  </defs>
                  {/* Human Approval (top center) dashed to AI Classify and Decide */}
                  <path d="M 280 50 L 165 110" stroke="rgb(139 92 246)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" />
                  <path d="M 320 50 L 425 110" stroke="rgb(139 92 246)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" />
                  {/* Main row arrows */}
                  <path d="M 80 130 L 130 130" stroke="rgb(139 92 246)" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
                  <path d="M 200 130 L 250 130" stroke="rgb(139 92 246)" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
                  <path d="M 320 130 L 370 130" stroke="rgb(139 92 246)" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
                  {/* Decide → three right blocks */}
                  <path d="M 440 130 C 480 130, 480 70, 520 70" stroke="rgb(139 92 246)" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
                  <path d="M 440 130 L 520 130" stroke="rgb(139 92 246)" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
                  <path d="M 440 130 C 480 130, 480 200, 520 200" stroke="rgb(139 92 246)" strokeWidth="1.5" fill="none" markerEnd="url(#arr)" />
                  {/* AI Classify ↔ Knowledge Lookup (curve down then back up) */}
                  <path d="M 165 155 C 165 200, 220 220, 250 220" stroke="rgb(139 92 246)" strokeWidth="1.2" fill="none" />
                  <path d="M 280 220 C 320 220, 165 220, 165 155" stroke="rgb(139 92 246)" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" />
                </svg>

                {/* Top row: Human Approval centered */}
                <div className="absolute" style={{ left: "42%", top: 0 }}>
                  <NodePill icon={UserCheck} label="Human Approval" wide />
                </div>

                {/* Middle row */}
                <div className="absolute" style={{ left: "2%",  top: 105 }}><NodePill icon={Zap}       label="Webhook" /></div>
                <div className="absolute" style={{ left: "22%", top: 105 }}><NodePill icon={Cpu}       label="AI Classify" /></div>
                <div className="absolute" style={{ left: "42%", top: 105 }}><NodePill icon={Database}  label="Enrich Context" /></div>
                <div className="absolute" style={{ left: "62%", top: 105 }}><NodePill icon={GitBranch} label="Decide" /></div>

                {/* Right column branches */}
                <div className="absolute" style={{ left: "82%", top: 45  }}><NodePill icon={PlayCircle} label="Execute Actions" /></div>
                <div className="absolute" style={{ left: "82%", top: 105 }}><NodePill icon={RefreshCw}  label="Update System" /></div>
                <div className="absolute" style={{ left: "82%", top: 175 }}><NodePill icon={Bell}       label="Notify" /></div>

                {/* Knowledge Lookup centered below */}
                <div className="absolute" style={{ left: "38%", top: 195 }}><NodePill icon={Brain} label="Knowledge Lookup" /></div>
              </div>

              {/* Execution states */}
              <Card className="col-span-3 p-2.5">
                <div className="text-[12px] font-bold mb-2">Execution States (24h)</div>
                <ul className="space-y-1.5">
                  {execStates.map((s) => (
                    <li key={s.l} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${s.c}`} />{s.l}</span>
                      <span className="font-extrabold tabular-nums">{s.v}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[12px] font-bold mt-3 mb-1.5">Top Integrations</div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                  <span>● ServiceNow</span><span>● Jira</span>
                  <span>● Azure</span><span>● AWS</span>
                  <span>● GitHub</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Intelligence */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-violet-600 text-center mb-1.5">INTELLIGENCE & KNOWLEDGE LAYER (AI)</div>
            <div className="grid grid-cols-5 gap-2">
              {intelligence.map((b) => {
                const Icon = b.icon;
                return (
                  <Card key={b.title} className="p-2.5">
                    <div className="flex items-center gap-1.5"><Icon className="h-4 w-4 text-violet-600" /><div className="text-[11px] font-bold">{b.title}</div></div>
                    <div className="h-8 grid place-items-center mt-1"><Icon className="h-6 w-6 text-violet-400" /></div>
                    <div className="text-[9.5px] text-slate-500 leading-snug mt-1">{b.body}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Data fabric */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-violet-600 text-center mb-1.5">DATA & INTEGRATION FABRIC (NeuFlow)</div>
            <div className="grid grid-cols-6 gap-2">
              {dataFabric.map((b) => {
                const Icon = b.icon;
                return (
                  <Card key={b.title} className="p-2 text-center">
                    <Icon className="h-4 w-4 text-violet-600 mx-auto" />
                    <div className="text-[11px] font-bold mt-1">{b.title}</div>
                    <div className="text-[9.5px] text-slate-500">{b.body}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Infrastructure */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-violet-600 text-center mb-1.5">INFRASTRUCTURE & GOVERNANCE FOUNDATION</div>
            <div className="grid grid-cols-8 gap-2">
              {infra.map((b) => {
                const Icon = b.icon;
                return (
                  <Card key={b.title} className="p-2 text-center">
                    <Icon className="h-4 w-4 text-violet-600 mx-auto" />
                    <div className="text-[10.5px] font-bold mt-1">{b.title}</div>
                    <div className="text-[9.5px] text-slate-500">{b.body}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-2 space-y-3">
          <Card className="p-3">
            <div className="text-[11px] font-bold tracking-wider text-violet-600 mb-2">MISSION CONTROL</div>
            <ul className="space-y-2">
              {mission.map((m, i) => {
                const Icon = m.icon;
                return (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                    <Icon className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                    <span>{m.t}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card className="p-3">
            <div className="text-[11px] font-bold tracking-wider text-violet-600 mb-2">OPERATIONAL OUTCOMES (24h)</div>
            <ul className="space-y-1.5">
              {outcomes.map((o) => (
                <li key={o.l} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700">{o.l}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-extrabold tabular-nums">{o.v}</span>
                    <span className={`text-[10px] font-bold ${o.tone}`}>{o.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-3">
            <div className="text-[11px] font-bold tracking-wider text-violet-600 mb-2">ACTIVE INITIATIVES</div>
            <ul className="space-y-1.5">
              {initiatives.map((it) => {
                const Icon = it.icon;
                return (
                  <li key={it.t} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-700"><Icon className="h-3.5 w-3.5 text-violet-600" />{it.t}</span>
                    <span className="text-slate-500 text-[10px]">{it.v}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      {/* Ecosystem */}
      <div className="grid grid-cols-12 gap-4 items-center pt-3 border-t border-slate-200">
        <div className="col-span-1 text-[10px] font-bold tracking-wider text-violet-600">ECOSYSTEM<br/>INTEGRATIONS</div>
        <div className="col-span-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold text-slate-600">
          {integrations.map((s) => <span key={s}>{s}</span>)}
        </div>
        <div className="col-span-2 flex items-center gap-2 justify-end">
          <div className="h-9 w-9 rounded-md bg-violet-600 text-white grid place-items-center font-extrabold">AI</div>
          <div className="text-[10px] text-slate-600 leading-tight">
            <div className="font-bold">Powered</div>
            <div>Multi-model, Multi-agent,</div>
            <div>Enterprise-grade.</div>
          </div>
        </div>
      </div>
      <div className="text-center text-[10px] text-slate-500 pt-1">Built for scale. Designed for trust. Governed for enterprise.</div>
    </div>
  );
}

function Node({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-9 w-9 rounded-md bg-white border border-violet-200 grid place-items-center text-violet-600 shadow-sm"><Icon className="h-4 w-4" /></div>
      <div className="text-[9.5px] text-slate-600 text-center leading-tight">{label}</div>
    </div>
  );
}

function NodePill({ icon: Icon, label, wide = false }: { icon: any; label: string; wide?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${wide ? "w-28" : "w-20"}`}>
      <div className="h-9 w-9 rounded-md bg-white border border-violet-300 grid place-items-center text-violet-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[10px] font-semibold text-slate-700 text-center leading-tight whitespace-nowrap">{label}</div>
    </div>
  );
}