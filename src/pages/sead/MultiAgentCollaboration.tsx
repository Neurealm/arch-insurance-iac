import { SeadRail } from "@/components/sead/SeadRail";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network as NetIcon, Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale, Target as TargetIcon, BookOpen, Users, Activity, ArrowRight, CheckCircle2, MessageSquare, Zap, DollarSign, Cpu, Database, FileSearch, UserCheck, FlaskConical, Network,
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
/* ============================= header ============================= */
function AppHeader() {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Multi-Agent Collaboration</div>
          <div className="text-[11px] text-slate-400">Specialized AI agents collaborate to deliver the best maintenance recommendation</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <Factory className="h-4 w-4 text-sky-300" /> Fab: DFW Semiconductor Fab
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <span>May 23, 2026 10:24 AM CT</span>
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
const AGENTS = [
  { id: "eq", name: "Equipment Health Agent", icon: Activity, tone: "sky", role: "Evaluates equipment condition, failure risk, and degradation patterns.",
    insight: "Vacuum pump vibration trending up. Risk of failure in 6–9 days if not addressed.", confidence: 92, sources: 12 },
  { id: "pr", name: "Production Agent", icon: Factory, tone: "emerald", role: "Assesses production impact, capacity constraints, and wafer flow.",
    insight: "Maintaining tonight minimizes wafer starts lost and keeps plan on track.", confidence: 87, sources: 8 },
  { id: "ds", name: "Dispatch Agent", icon: Cpu, tone: "violet", role: "Evaluates dispatch rules, queue priority, and tool availability.",
    insight: "Current queue and priority rules favor maintaining ETCH-217 tonight.", confidence: 88, sources: 6 },
  { id: "fa", name: "Facilities Agent", icon: Zap, tone: "amber", role: "Checks utilities, facility constraints, and maintenance windows.",
    insight: "Utilities are stable tonight. No facility conflicts in the recommended window.", confidence: 91, sources: 7 },
  { id: "bi", name: "Business Impact Agent", icon: DollarSign, tone: "rose", role: "Quantifies financial impact, customer commitments, and risk exposure.",
    insight: "This window minimizes cost, meets commitments, and reduces risk.", confidence: 90, sources: 9 },
];

const EVIDENCE = [
  { label: "Vibration trend and failure probability", count: 12, color: "text-sky-300" },
  { label: "Production plan and capacity", count: 8, color: "text-emerald-300" },
  { label: "Dispatch rules and queue status", count: 6, color: "text-violet-300" },
  { label: "Utilities and facility availability", count: 7, color: "text-amber-300" },
  { label: "Business impact and commitments", count: 9, color: "text-rose-300" },
];

const TIMELINE = [
  { t: "10:21:04", title: "Agents Initialized", desc: "All agents receive context and goals", color: "bg-sky-400" },
  { t: "10:21:12", title: "Domain Analysis", desc: "Each agent analyzes its domain", color: "bg-emerald-400" },
  { t: "10:21:28", title: "Share Insights", desc: "Agents share key findings", color: "bg-violet-400" },
  { t: "10:21:46", title: "Resolve Trade-offs", desc: "Agents discuss and resolve conflicts", color: "bg-amber-400" },
  { t: "10:22:03", title: "Reach Consensus", desc: "Consensus achieved on best window", color: "bg-sky-400" },
  { t: "10:22:10", title: "Recommendation Generated", desc: "Result delivered with confidence", color: "bg-slate-400" },
];

const COMMS = [
  { t: "10:21:28", agent: "Equipment Health Agent", msg: "Sharing failure risk analysis and trend data.", color: "text-sky-300", dot: "bg-sky-400" },
  { t: "10:21:32", agent: "Production Agent", msg: "Sharing production impact assessment.", color: "text-emerald-300", dot: "bg-emerald-400" },
  { t: "10:21:36", agent: "Dispatch Agent", msg: "Queue status and priority rules shared.", color: "text-violet-300", dot: "bg-violet-400" },
  { t: "10:21:40", agent: "Facilities Agent", msg: "Utilities and facility status confirmed.", color: "text-amber-300", dot: "bg-amber-400" },
  { t: "10:21:44", agent: "Business Impact Agent", msg: "Financial impact and risk assessment shared.", color: "text-rose-300", dot: "bg-rose-400" },
];

const AGREEMENT = [
  { k: "Strongly Agree", v: 4, pct: 80, c: "#34d399" },
  { k: "Agree", v: 1, pct: 20, c: "#a3e635" },
  { k: "Neutral", v: 0, pct: 0, c: "#fbbf24" },
  { k: "Disagree", v: 0, pct: 0, c: "#fb923c" },
  { k: "Strongly Disagree", v: 0, pct: 0, c: "#f87171" },
];

/* ============================= small bits ============================= */
const toneRing: any = {
  sky: "ring-sky-400/30 from-sky-500/10",
  emerald: "ring-emerald-400/30 from-emerald-500/10",
  violet: "ring-violet-400/30 from-violet-500/10",
  amber: "ring-amber-400/30 from-amber-500/10",
  rose: "ring-rose-400/30 from-rose-500/10",
};
const toneBar: any = {
  sky: "bg-sky-400", emerald: "bg-emerald-400", violet: "bg-violet-400",
  amber: "bg-amber-400", rose: "bg-rose-400",
};
const toneText: any = {
  sky: "text-sky-300", emerald: "text-emerald-300", violet: "text-violet-300",
  amber: "text-amber-300", rose: "text-rose-300",
};

function AgentCard({ a, selected, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`text-left w-full rounded-xl border border-white/[0.06] bg-gradient-to-b ${toneRing[a.tone]} to-transparent p-4 transition hover:bg-white/[0.04] ${selected ? "ring-1 " + toneRing[a.tone].split(" ")[0] : ""}`}>
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-lg grid place-items-center bg-white/[0.04] ${toneText[a.tone]}`}>
          <a.icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-semibold text-white leading-tight">{a.name}</div>
          <div className="text-[10.5px] text-emerald-300 inline-flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Analyzed
          </div>
        </div>
      </div>
      <div className="mt-3 text-[11.5px] text-slate-400 leading-relaxed">{a.role}</div>
      <div className="mt-3">
        <div className={`text-[10.5px] uppercase tracking-wider font-semibold ${toneText[a.tone]}`}>Key Insight</div>
        <div className="text-[12px] text-slate-200 leading-relaxed mt-1">{a.insight}</div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Confidence</span>
          <span className={`tabular-nums font-semibold ${toneText[a.tone]}`}>{a.confidence}%</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full ${toneBar[a.tone]}`} style={{ width: `${a.confidence}%` }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2">
        <div className="text-[10.5px] uppercase tracking-wider text-slate-400">Evidence</div>
        <div className="text-[11px] text-slate-300">{a.sources} data sources</div>
      </div>
      <div className={`mt-3 h-7 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-300 grid place-items-center hover:bg-white/[0.06]`}>
        View Analysis
      </div>
    </button>
  );
}

function Donut({ pct = 89 }: { pct?: number }) {
  const r = 52; const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" className="h-[140px] w-[140px]">
      <circle cx="70" cy="70" r={r} stroke="#1e293b" strokeWidth="12" fill="none" />
      <circle cx="70" cy="70" r={r} stroke="#34d399" strokeWidth="12" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round"
        transform="rotate(-90 70 70)" />
      <text x="70" y="68" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="600">{pct}%</text>
      <text x="70" y="86" textAnchor="middle" fill="#94a3b8" fontSize="10">Strong</text>
      <text x="70" y="98" textAnchor="middle" fill="#94a3b8" fontSize="10">Agreement</text>
    </svg>
  );
}

/* ============================= page ============================= */
export default function MultiAgentCollaboration() {
  const [selected, setSelected] = useState("eq");
  const totalEvidence = useMemo(() => EVIDENCE.reduce((s, e) => s + e.count, 0), []);

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-200 selection:bg-sky-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <AppHeader />
      <div className="flex">
        <SeadRail />

        <main className="flex-1 p-6 space-y-6">
          {/* Recommendation header strip */}
          <GlassCard className="p-4">
            <div className="flex items-start gap-6">
              <button onClick={() => history.back()} className="text-sky-300 text-[12px] inline-flex items-center gap-1.5 hover:text-sky-200 mt-1">
                <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to Recommendation
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
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Recommended Window</div>
                <div className="text-white font-semibold text-[14px] mt-0.5">May 28, 10:00 PM – May 29, 2:00 AM</div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10.5px]">Maintain Tonight</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Confidence</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="text-emerald-300 font-semibold text-[20px] tabular-nums">89%</div>
                  <div className="text-[11px] text-emerald-300">High</div>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Impact</div>
                <div className="text-emerald-300 font-semibold text-[20px] mt-0.5">Low</div>
                <div className="text-[11px] text-slate-400">(–$0.12M)</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Consensus</div>
                <div className="text-[12px] text-slate-300 mt-0.5">All agents agree this is the optimal window based on current data.</div>
                <div className="mt-1 flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10.5px]">Strong Agreement</span>
                  <button className="text-sky-300 text-[11px] inline-flex items-center gap-1">View reasoning <ArrowRight className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              {/* Agents grid */}
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[14px] font-semibold text-white">How Our AI Agents Collaborate</div>
                    <div className="text-[11px] text-slate-400">Each agent analyzes its domain, shares insights, and references evidence to reach a consensus.</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
                      Collaboration Status <span className="inline-flex items-center gap-1 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active</span>
                    </div>
                    <button className="h-8 px-3 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11.5px] text-slate-200 inline-flex items-center gap-1.5 hover:bg-white/[0.08]">
                      <MessageSquare className="h-3.5 w-3.5" /> View Conversation
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {AGENTS.map((a) => (
                    <AgentCard key={a.id} a={a} selected={selected === a.id} onClick={() => setSelected(a.id)} />
                  ))}
                </div>

                {/* Consensus engine */}
                <div className="mt-6 grid grid-cols-[260px_1fr] gap-4 items-stretch">
                  <div className="relative rounded-xl border border-sky-400/30 bg-sky-500/[0.06] p-4 grid place-items-center text-center">
                    <div>
                      <div className="mx-auto h-14 w-14 rounded-full bg-sky-500/15 grid place-items-center ring-2 ring-sky-400/40 shadow-[0_0_28px_-4px_rgba(56,189,248,0.6)]">
                        <Brain className="h-6 w-6 text-sky-300" />
                      </div>
                      <div className="mt-2 text-[12.5px] font-semibold text-white">AI Consensus Engine</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Aggregates insights and reconciles trade-offs</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-slate-400">Consensus Recommendation</div>
                        <div className="text-white font-semibold text-[16px] mt-1">Maintain Tonight</div>
                        <div className="text-[12px] text-slate-300">May 28, 10:00 PM – May 29, 2:00 AM</div>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 text-[11px]">Recommended</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.05]">
                      <div>
                        <div className="text-[11px] text-slate-400">Confidence</div>
                        <div className="text-emerald-300 font-semibold text-[16px] tabular-nums">89%</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Agreement</div>
                        <div className="text-emerald-300 font-semibold text-[16px]">Strong</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Dynamics + timeline */}
              <div className="grid grid-cols-[300px_1fr] gap-4">
                <GlassCard className="p-5">
                  <div className="text-[13px] font-semibold text-white mb-3">Collaboration Dynamics</div>
                  {[
                    { icon: Activity, label: "Information Shared", v: 42 },
                    { icon: MessageSquare, label: "Insights Exchanged", v: 18 },
                    { icon: Scale, label: "Trade-offs Resolved", v: 6 },
                    { icon: GitBranch, label: "Iterations", v: 3 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <r.icon className="h-4 w-4 text-sky-300" />
                      <div className="text-[12px] text-slate-300 flex-1">{r.label}</div>
                      <div className="text-white tabular-nums font-semibold">{r.v}</div>
                      <svg viewBox="0 0 40 14" className="w-10 h-3.5">
                        <polyline points="0,10 8,7 16,9 24,4 32,6 40,2" fill="none" stroke="#34d399" strokeWidth="1.5" />
                      </svg>
                    </div>
                  ))}
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="text-[13px] font-semibold text-white mb-4">Collaboration Timeline</div>
                  <div className="relative">
                    <div className="absolute top-2 left-3 right-3 h-px bg-white/10" />
                    <div className="grid grid-cols-6 gap-2 relative">
                      {TIMELINE.map((s, i) => (
                        <div key={i} className="text-center">
                          <div className="text-[10.5px] text-slate-400 tabular-nums mb-1">{s.t}</div>
                          <div className={`mx-auto h-3 w-3 rounded-full ${s.color} ring-2 ring-[#05060a] shadow-[0_0_10px_currentColor]`} />
                          <div className="mt-2 text-[11.5px] text-white font-semibold leading-tight">{s.title}</div>
                          <div className="mt-1 text-[10.5px] text-slate-400 leading-tight">{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <GlassCard className="p-5">
                <div className="text-[13px] font-semibold text-white mb-3">Agent Agreement</div>
                <div className="flex items-center gap-4">
                  <Donut pct={89} />
                  <div className="flex-1 space-y-1.5 text-[11.5px]">
                    {AGREEMENT.map((a) => (
                      <div key={a.k} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: a.c }} />
                        <span className="text-slate-300 flex-1">{a.k}</span>
                        <span className="text-white tabular-nums">{a.v}</span>
                        <span className="text-slate-500 tabular-nums w-10 text-right">({a.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-center text-[11px] text-emerald-300">5 of 5 agents in strong agreement</div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-[13px] font-semibold text-white mb-3">Key Evidence Supporting Consensus</div>
                <div className="space-y-2">
                  {EVIDENCE.map((e) => (
                    <div key={e.label} className="flex items-center gap-2 text-[12px] py-1 border-b border-white/[0.04] last:border-0">
                      <FileSearch className={`h-3.5 w-3.5 ${e.color}`} />
                      <span className="text-slate-300 flex-1">{e.label}</span>
                      <span className="text-slate-400">{e.count} sources</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[12px]">
                  <span className="text-slate-300">Total Supporting Evidence</span>
                  <span className="text-sky-300 font-semibold tabular-nums">{totalEvidence} sources</span>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[13px] font-semibold text-white">Agent Communication <span className="text-slate-400 font-normal text-[11px]">(Recent)</span></div>
                </div>
                <div className="space-y-3">
                  {COMMS.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="text-[10.5px] text-slate-500 tabular-nums w-14 pt-0.5">{c.t}</div>
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      <div className="flex-1">
                        <div className={`text-[12px] font-semibold ${c.color}`}>{c.agent}</div>
                        <div className="text-[11.5px] text-slate-400">{c.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-sky-300 text-[12px] inline-flex items-center gap-1.5">
                  View full conversation <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
