import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network as NetIcon, Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale, Target as TargetIcon, BookOpen, Users, UserCheck, FlaskConical, MessageSquare, ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, Copy, Send, ChevronRight, TrendingUp, Clock, Box as BoxIcon, ShieldCheck, Activity, Layers, Network,
} from "lucide-react";

/* ============================= atoms ============================= */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}

/* ============================= rail ============================= */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop" },
  { icon: FlaskConical, label: "Engineering\nSandbox", to: "/sead/engineering-sandbox" },
  { icon: MessageSquare, label: "Digital Coworker\nConversation", to: "/sead/digital-coworker-conversation", active: true },
  { icon: Network, label: "IoT→AI\nArchitecture", to: "/sead/iot-ai-architecture" },
];

function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button key={r.label} onClick={() => r.to && nav(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}>
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.active && (
            <motion.span layoutId="rail-dcc-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============================= header ============================= */
function AppHeader() {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Digital Coworker Conversation</div>
          <div className="text-[11px] text-slate-400">Ask questions, get answers, and collaborate with your AI coworker</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <Factory className="h-4 w-4 text-sky-300" /> Fab: DFW Semiconductor Fab
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <span>May 23, 2025 10:24 AM CT</span>
        <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 relative">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[10px] text-white grid place-items-center">2</span>
      </button>
      <button className="h-10 w-10 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[12px] font-semibold text-white">AO</div>
    </header>
  );
}

/* ============================= data ============================= */
type Msg = {
  id: string; who: "user" | "ai"; at: string; text?: string; bullets?: string[];
};

const INITIAL: Msg[] = [
  { id: "m1", who: "user", at: "10:21 AM", text: "Why are you recommending maintenance tonight for ETCH-217?" },
  {
    id: "m2", who: "ai", at: "10:21 AM",
    text: "Great question. I'm recommending maintenance tonight because it delivers the best balance of low risk, high operational stability, and minimal business impact.",
    bullets: [
      "Failure probability is elevated to 7.6%, trending up over the last 7 days.",
      "Tonight's window has the lowest impact on production throughput and yield.",
      "All constraints are satisfied with sufficient technician and parts availability.",
      "The estimated total impact is low (-$0.12M) compared to other windows.",
    ],
  },
  { id: "m3", who: "user", at: "10:22 AM", text: "What happens if we wait until the weekend?" },
  {
    id: "m4", who: "ai", at: "10:22 AM",
    text: "Waiting until the weekend increases risk and cost.",
    bullets: [
      "Failure probability increases to 12.3% by Saturday.",
      "Impact increases to Medium (+$0.45M) due to higher demand for the weekend production shift.",
      "Limited technician availability could extend the maintenance window.",
      "Higher risk of unplanned downtime if the pump fails before the weekend.",
    ],
  },
];

const QUICK = [
  "Show confidence drivers",
  "Compare to next best window",
  "What are the key risks?",
  "Explain the cost impact",
];

const KEY_DRIVERS = [
  { icon: TrendingUp, tone: "rose", title: "Failure probability increasing", desc: "7.6% risk, up 1.6% vs. baseline" },
  { icon: BoxIcon, tone: "emerald", title: "Low impact window", desc: "Minimal effect on throughput and yield" },
  { icon: Users, tone: "sky", title: "Resources available", desc: "Technicians and parts are available" },
  { icon: ShieldCheck, tone: "violet", title: "Constraints satisfied", desc: "All operational constraints are met" },
];

const INSIGHTS = [
  { icon: TrendingUp, title: "Failure probability trend", desc: "Increasing from 5.2% to 7.6% over 7 days" },
  { icon: Clock, title: "Impact over time", desc: "Lowest impact in recommended window" },
  { icon: Layers, title: "Capacity & resource check", desc: "All resources available and within limits" },
  { icon: Activity, title: "Similar asset history", desc: "3 of 5 similar assets showed early pump degradation" },
];

const CONTINUE = [
  "Show me a comparison of the top 3 windows",
  "What factors are driving the confidence score?",
  "How does this recommendation tie to our goals?",
];

const toneText: any = { rose: "text-rose-300", emerald: "text-emerald-300", sky: "text-sky-300", violet: "text-violet-300" };
const toneBg: any = { rose: "bg-rose-500/10 ring-rose-400/20", emerald: "bg-emerald-500/10 ring-emerald-400/20", sky: "bg-sky-500/10 ring-sky-400/20", violet: "bg-violet-500/10 ring-violet-400/20" };

/* ============================= page ============================= */
export default function DigitalCoworkerConversation() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const t = text.trim(); if (!t) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setMessages((m) => [...m, { id: `u${Date.now()}`, who: "user", at: now, text: t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        id: `a${Date.now()}`, who: "ai", at: now,
        text: "Here's what I found based on current sensor data, plant schedule, and historical patterns.",
        bullets: [
          "Recommendation remains: Maintain Tonight (May 28, 10 PM – May 29, 2 AM).",
          "Confidence stays at 89% (High) — no new conflicting signals.",
          "I can dive deeper into drivers, risks, or trade-offs whenever you'd like.",
        ],
      }]);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-200 selection:bg-sky-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <AppHeader />
      <div className="flex">
        <ModuleRail />

        <main className="flex-1 p-6 space-y-6">
          {/* Top context strip */}
          <GlassCard className="p-4">
            <div className="flex items-start gap-6 flex-wrap">
              <button onClick={() => history.back()} className="text-sky-300 text-[12px] inline-flex items-center gap-1.5 hover:text-sky-200 mt-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Recommendation
              </button>
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[10px] text-slate-400">CHAMBER</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-white font-semibold text-[15px]">ETCH-217</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">Fair</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Metal Etch Chamber | Bay 2</div>
                  <div className="text-[11px] text-slate-400">Focus: Vacuum Pump Degradation</div>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Recommended Window (Current)</div>
                <div className="text-white font-semibold text-[14px] mt-0.5">May 28, 10:00 PM – May 29, 2:00 AM</div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10.5px]">Maintain Tonight</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Confidence</div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-emerald-300 font-semibold text-[24px] tabular-nums">89%</div>
                  <svg viewBox="0 0 80 50" className="h-10 w-16">
                    <path d="M5 45 A35 35 0 0 1 75 45" stroke="#1e293b" strokeWidth="6" fill="none" />
                    <path d="M5 45 A35 35 0 0 1 75 45" stroke="#34d399" strokeWidth="6" fill="none"
                      strokeDasharray="110" strokeDashoffset={110 - 0.89 * 110} strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[11px] text-emerald-300">High</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Impact</div>
                <div className="text-emerald-300 font-semibold text-[22px] mt-0.5">Low</div>
                <div className="text-[11px] text-slate-400">(–$0.12M)</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Optimization Objective</div>
                <div className="flex items-center gap-2 mt-0.5 text-white font-semibold text-[14px]">
                  <Sparkles className="h-4 w-4 text-sky-300" /> Balanced
                </div>
                <div className="text-[11px] text-slate-400">Weighted across all objectives</div>
              </div>
            </div>
          </GlassCard>

          {/* Conversation + Right rail */}
          <div className="grid grid-cols-12 gap-6">
            {/* Chat */}
            <GlassCard className="col-span-8 p-5 flex flex-col" >
              <div>
                <div className="text-white font-semibold text-[16px]">How can I help you today?</div>
                <div className="text-[11.5px] text-slate-400">Your AI coworker has full context across your data, models, and recommendations.</div>
              </div>

              <div ref={scrollRef} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4 max-h-[560px]">
                {messages.map((m) => (
                  m.who === "user" ? (
                    <div key={m.id} className="flex items-start gap-3 justify-end">
                      <div className="max-w-[70%]">
                        <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 bg-sky-500/15 border border-sky-400/20 text-[13px] text-slate-100">
                          {m.text}
                          <span className="ml-2 text-[10.5px] text-slate-400">{m.at}</span>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[11px] font-semibold text-white shrink-0">AO</div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-black text-white shrink-0">N</div>
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.03] border border-white/[0.06]">
                        {m.text && <div className="text-[13px] text-slate-100 leading-relaxed">{m.text}</div>}
                        {m.bullets && (
                          <ul className="mt-2 space-y-1.5 text-[12.5px] text-slate-200">
                            {m.bullets.map((b) => (
                              <li key={b} className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-sky-400 shrink-0" />{b}</li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[10.5px] text-slate-500">{m.at}</div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <button className="h-6 w-6 rounded-md hover:bg-white/[0.05] grid place-items-center"><ThumbsUp className="h-3.5 w-3.5" /></button>
                            <button className="h-6 w-6 rounded-md hover:bg-white/[0.05] grid place-items-center"><ThumbsDown className="h-3.5 w-3.5" /></button>
                            <button className="h-6 w-6 rounded-md hover:bg-white/[0.05] grid place-items-center"><Copy className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                {typing && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center text-[11px] font-black text-white shrink-0">N</div>
                    <div className="rounded-2xl px-4 py-3 bg-white/[0.03] border border-white/[0.06] inline-flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-pulse [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-pulse [animation-delay:240ms]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick replies */}
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="px-3 h-8 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-200 hover:bg-white/[0.06]">
                    {q}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div className="mt-3 h-12 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 px-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask a question or request…"
                  className="flex-1 bg-transparent outline-none text-[13px] text-slate-100 placeholder:text-slate-500"
                />
                <button onClick={() => send(input)}
                  className="h-9 w-9 rounded-md bg-sky-500/20 border border-sky-400/30 text-sky-200 grid place-items-center hover:bg-sky-500/30">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center text-[10.5px] text-slate-500 mt-2">Neurealm AI can make mistakes. Consider checking important information.</div>
            </GlassCard>

            {/* Right rail */}
            <div className="col-span-4 space-y-5">
              <GlassCard className="p-4">
                <div className="text-white font-semibold text-[13.5px]">Current Recommendation</div>
                <div className="mt-3 rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-emerald-500/15 border border-emerald-400/20 grid place-items-center text-emerald-300">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-white text-[13px] font-semibold">Maintain Tonight</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">Recommended</span>
                      </div>
                      <div className="text-[11px] text-slate-400">May 28, 10:00 PM – May 29, 2:00 AM</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    {[
                      { l: "Confidence", v: "89%", c: "text-white" },
                      { l: "Impact", v: "Low", s: "(–$0.12M)", c: "text-emerald-300" },
                      { l: "Failure Prob.", v: "7.6%", c: "text-white" },
                      { l: "MTBF", v: "21.3 days", c: "text-white" },
                    ].map((k) => (
                      <div key={k.l}>
                        <div className="text-[9.5px] text-slate-400">{k.l}</div>
                        <div className={`text-[12.5px] font-semibold tabular-nums ${k.c}`}>{k.v}</div>
                        {k.s && <div className="text-[9.5px] text-slate-500">{k.s}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-[13.5px]">Key Drivers</div>
                  <button className="text-sky-300 text-[11px]">View all</button>
                </div>
                <div className="mt-3 space-y-2">
                  {KEY_DRIVERS.map((d) => (
                    <div key={d.title} className="flex items-start gap-3 rounded-lg p-2 hover:bg-white/[0.03]">
                      <div className={`h-8 w-8 rounded-md grid place-items-center ring-1 ${toneBg[d.tone]} ${toneText[d.tone]}`}>
                        <d.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-white font-semibold">{d.title}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">{d.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-[13.5px]">Supporting Insights</div>
                  <button className="text-sky-300 text-[11px]">View all</button>
                </div>
                <div className="mt-3 space-y-2">
                  {INSIGHTS.map((d) => (
                    <button key={d.title} className="w-full flex items-start gap-3 rounded-lg p-2 hover:bg-white/[0.03] text-left">
                      <div className="h-8 w-8 rounded-md grid place-items-center bg-sky-500/10 ring-1 ring-sky-400/20 text-sky-300">
                        <d.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-white font-semibold">{d.title}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">{d.desc}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="text-white font-semibold text-[13.5px]">Continue the Conversation</div>
                <div className="mt-3 space-y-2">
                  {CONTINUE.map((q) => (
                    <button key={q} onClick={() => send(q)}
                      className="w-full text-left flex items-center gap-2 rounded-md p-2 text-[12.5px] text-sky-300 hover:bg-white/[0.03]">
                      <MessageSquare className="h-3.5 w-3.5" /> {q}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
}
