import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale,
  Target as TargetIcon, BookOpen, Users, UserCheck, ArrowRight, CheckCircle2,
  Calendar, Clock, XCircle, Lightbulb as Bulb, Star, RefreshCw, Save, Send,
  Sparkles as SparkIcon, BookOpen as Book, FileText, BarChart3,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";

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
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop", active: true },
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
            <motion.span layoutId="rail-hitl-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">Human-in-the-Loop</div>
          <div className="text-[11px] text-slate-400">Review AI recommendations, provide feedback, and continuously improve outcomes</div>
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
const confidenceTrend = [
  { d: "May 21", v: 72 }, { d: "May 22", v: 74 }, { d: "May 23", v: 75 },
  { d: "May 24", v: 78 }, { d: "May 25", v: 81 }, { d: "May 26", v: 83 },
  { d: "May 27", v: 86 }, { d: "May 28", v: 89 },
];

const impactRows = [
  { m: "Production Impact", ai: "+9.2K wafers", you: "+8.1K wafers", diff: "-1.1K", tone: "rose" },
  { m: "Yield Impact", ai: "+0.08%", you: "+0.05%", diff: "-0.03%", tone: "rose" },
  { m: "Customer Commitments", ai: "Low Risk", you: "Low Risk", diff: "No Change", tone: "sky" },
  { m: "Maintenance Cost", ai: "$8.7K", you: "$8.7K", diff: "No Change", tone: "sky" },
  { m: "Downtime", ai: "4.0 hrs", you: "4.0 hrs", diff: "No Change", tone: "sky" },
  { m: "Utility / Facilities Impact", ai: "$1.2K", you: "$1.4K", diff: "+$0.2K", tone: "amber" },
  { m: "Risk / Reliability", ai: "Low", you: "Medium", diff: "+1 Level", tone: "amber" },
];

const decisionHistory = [
  { date: "May 21, 2025 9:12 AM", decision: "Approved", window: "May 21, 10:00 PM – May 22, 2:00 AM", conf: "91%", outcome: "Completed", reviewer: "Alex Operator", notes: "Followed recommendation" },
  { date: "May 18, 2025 10:03 AM", decision: "Modified", window: "May 18, 10:00 PM – May 19, 2:00 AM", conf: "88%", outcome: "Completed", reviewer: "Alex Operator", notes: "Shifted 1 day due to production" },
  { date: "May 15, 2025 8:45 AM", decision: "Approved", window: "May 15, 10:00 PM – May 16, 2:00 AM", conf: "93%", outcome: "Completed", reviewer: "Jamie Lee", notes: "Low risk, off-peak window" },
  { date: "May 12, 2025 11:20 AM", decision: "Rejected", window: "—", conf: "85%", outcome: "Deferred", reviewer: "Jamie Lee", notes: "Decided to monitor longer" },
];

const influenceOpts = [
  "Operational constraints",
  "New information not considered by AI",
  "Risk tolerance / business preference",
  "Production priority",
  "Cost considerations",
];

const rationaleBullets = [
  "Vacuum pump vibration trending up with high risk of failure in 6–9 days",
  "Tonight's window has the lowest impact on production and yields",
  "All commitments can be met with minimal risk",
  "Utilities and facilities are stable",
  "Similar assets with same issue show 92% failure rate if deferred beyond 7 days",
];

/* ============================= page ============================= */
type Choice = "approve" | "modify" | "reject" | null;

export default function HumanInTheLoop() {
  const [choice, setChoice] = useState<Choice>("approve");
  const [influences, setInfluences] = useState<Record<string, boolean>>({});
  const [other, setOther] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [note, setNote] = useState("");

  const toggleInf = (k: string) => setInfluences((s) => ({ ...s, [k]: !s[k] }));

  const choiceTone = (c: Choice, target: Choice, base: string) =>
    c === target ? base : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]";

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
          {/* Top strip */}
          <GlassCard className="p-4">
            <div className="flex items-start gap-6 flex-wrap">
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
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Recommended Window (Current)</div>
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
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Review Status</div>
                <div className="text-sky-300 font-semibold text-[14px] mt-0.5 inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> In Review</div>
                <div className="text-[11px] text-slate-400">Pending your feedback</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Reviewer</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500/40 to-indigo-500/40 grid place-items-center text-[11px] font-semibold text-white">AO</div>
                  <div className="leading-tight">
                    <div className="text-white text-[13px] font-semibold">Alex Operator</div>
                    <div className="text-[10.5px] text-slate-400">Role: Maintenance Manager</div>
                    <div className="text-[10.5px] text-slate-500">May 23, 2025 10:24 AM CT</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              {/* 1. Review */}
              <GlassCard className="p-5">
                <div className="text-[14px] font-semibold text-white mb-4">1. Review AI Recommendation</div>
                <div className="grid grid-cols-[1fr_280px] gap-4">
                  <div>
                    <div className="text-[12.5px] font-semibold text-amber-300 inline-flex items-center gap-1.5"><Bulb className="h-3.5 w-3.5" /> Key Rationale</div>
                    <div className="mt-2 text-[12px] text-slate-300 leading-relaxed">
                      The AI recommends maintaining tonight to minimize long-term risk and cost while meeting production commitments.
                    </div>
                    <ul className="mt-3 space-y-2">
                      {rationaleBullets.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-[12px] text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-4 h-8 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-200 inline-flex items-center gap-1.5 hover:bg-white/[0.06]">
                      <FileText className="h-3.5 w-3.5" /> View Full Reasoning
                    </button>
                  </div>
                  <div>
                    <div className="text-[12px] text-slate-300 mb-1">Confidence Over Time</div>
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={confidenceTrend}>
                          <XAxis dataKey="d" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }} />
                          <ReferenceLine y={89} stroke="#34d399" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="v" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2.5, fill: "#38bdf8" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Confidence
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* 2. Decision */}
              <GlassCard className="p-5">
                <div className="text-[14px] font-semibold text-white">2. Your Decision</div>
                <div className="text-[11.5px] text-slate-400 mb-3">What would you like to do?</div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setChoice("approve")}
                    className={`text-left rounded-lg border p-3 transition ${choiceTone(choice, "approve", "border-emerald-400/40 bg-emerald-500/10 ring-1 ring-emerald-400/30")}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <div className="text-[12.5px] font-semibold text-white">Approve Recommendation</div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-slate-400">Proceed with the recommended maintenance window.</div>
                  </button>
                  <button onClick={() => setChoice("modify")}
                    className={`text-left rounded-lg border p-3 transition ${choiceTone(choice, "modify", "border-sky-400/40 bg-sky-500/10 ring-1 ring-sky-400/30")}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-300" />
                      <div className="text-[12.5px] font-semibold text-white">Modify Window</div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-slate-400">Adjust the timing but keep the maintenance.</div>
                  </button>
                  <button onClick={() => setChoice("reject")}
                    className={`text-left rounded-lg border p-3 transition ${choiceTone(choice, "reject", "border-rose-400/40 bg-rose-500/10 ring-1 ring-rose-400/30")}`}>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-rose-300" />
                      <div className="text-[12.5px] font-semibold text-white">Reject Recommendation</div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-slate-400">Do not perform maintenance in the recommended window.</div>
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-[11.5px] text-slate-400 mb-2">If modifying, select a new window</div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { l: "Start", v: "May 29, 2025", icon: Calendar },
                      { l: "", v: "10:00 PM", icon: Clock },
                      { l: "End", v: "May 29, 2025", icon: Calendar },
                      { l: "", v: "2:00 AM", icon: Clock },
                    ].map((f, i) => (
                      <div key={i}>
                        {f.l && <div className="text-[11px] text-slate-400 mb-1">{f.l}</div>}
                        {!f.l && <div className="text-[11px] text-transparent mb-1">.</div>}
                        <div className="h-9 px-2.5 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-200">
                          <f.icon className="h-3.5 w-3.5 text-slate-400" /> {f.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400">Duration <span className="text-slate-200 ml-1">4h 0m</span></div>
                </div>

                <div className="mt-4">
                  <div className="text-[11.5px] text-slate-400 mb-1">Add a note (optional)</div>
                  <div className="relative">
                    <textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)}
                      placeholder="Provide additional context or rationale for your decision…"
                      className="w-full h-20 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.06] text-[12px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/40 resize-none" />
                    <div className="absolute bottom-1.5 right-2 text-[10.5px] text-slate-500 tabular-nums">{note.length}/500</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="h-10 rounded-md bg-emerald-500/90 hover:bg-emerald-500 text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Submit Decision
                  </button>
                  <button className="h-10 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[13px] inline-flex items-center justify-center gap-2 hover:bg-white/[0.07]">
                    <Save className="h-4 w-4" /> Save Draft
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* 3. Impact Preview */}
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[14px] font-semibold text-white">3. Impact Preview</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    Comparing
                    <div className="h-8 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11.5px] text-slate-200 inline-flex items-center gap-2">
                      Current Recommendation vs Your Decision
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-white/[0.05]">
                  <table className="w-full text-[12px]">
                    <thead className="bg-white/[0.02] text-slate-400">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">Metric</th>
                        <th className="text-left px-3 py-2 font-medium">AI Recommendation<br /><span className="text-[10px] text-slate-500">(May 28, 10:00 PM)</span></th>
                        <th className="text-left px-3 py-2 font-medium">Your Decision<br /><span className="text-[10px] text-slate-500">(May 29, 10:00 PM)</span></th>
                        <th className="text-left px-3 py-2 font-medium">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impactRows.map((r) => (
                        <tr key={r.m} className="border-t border-white/[0.04]">
                          <td className="px-3 py-2 text-slate-300">{r.m}</td>
                          <td className="px-3 py-2 text-slate-200">{r.ai}</td>
                          <td className="px-3 py-2 text-slate-200">{r.you}</td>
                          <td className={`px-3 py-2 ${
                            r.tone === "rose" ? "text-rose-300" : r.tone === "amber" ? "text-amber-300" : "text-sky-300"
                          }`}>{r.diff}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-amber-400/20 bg-amber-500/[0.05]">
                        <td className="px-3 py-2 text-amber-300 font-semibold">Total Impact</td>
                        <td className="px-3 py-2 text-emerald-300">Low (–$0.12M)</td>
                        <td className="px-3 py-2 text-emerald-300">Low (–$0.05M)</td>
                        <td className="px-3 py-2 text-amber-300 font-semibold">+$0.07M</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* 4. Feedback */}
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[14px] font-semibold text-white">4. Provide Feedback <span className="text-[11px] text-slate-400 font-normal">(Helps improve future recommendations)</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11.5px] text-slate-300 mb-2">What influenced your decision?</div>
                    <div className="space-y-1.5">
                      {influenceOpts.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-[12px] text-slate-300 cursor-pointer">
                          <input type="checkbox" checked={!!influences[opt]} onChange={() => toggleInf(opt)} className="accent-sky-400" />
                          {opt}
                        </label>
                      ))}
                      <div className="flex items-center gap-2 text-[12px] text-slate-300">
                        <input type="checkbox" checked={!!influences["Other"]} onChange={() => toggleInf("Other")} className="accent-sky-400" />
                        Other
                        <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Please specify…"
                          className="flex-1 h-7 px-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11.5px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/40" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11.5px] text-slate-300 mb-2">How do you rate this recommendation?</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setRating(n)}>
                          <Star className={`h-6 w-6 ${rating >= n ? "fill-amber-300 text-amber-300" : "text-slate-600"}`} />
                        </button>
                      ))}
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-1">(Select a rating)</div>

                    <div className="mt-4 text-[11.5px] text-slate-300 mb-1">Additional feedback</div>
                    <div className="relative">
                      <textarea value={feedback} maxLength={500} onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share any feedback to help improve future recommendations…"
                        className="w-full h-24 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.06] text-[12px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/40 resize-none" />
                      <div className="absolute bottom-1.5 right-2 text-[10.5px] text-slate-500 tabular-nums">{feedback.length}/500</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* 5. History + Loop diagram */}
          <div className="grid grid-cols-[1fr_460px] gap-6">
            <GlassCard className="p-5">
              <div className="text-[14px] font-semibold text-white mb-3">5. Decision History</div>
              <div className="overflow-hidden rounded-lg border border-white/[0.05]">
                <table className="w-full text-[12px]">
                  <thead className="bg-white/[0.02] text-slate-400">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Date</th>
                      <th className="text-left px-3 py-2 font-medium">Decision</th>
                      <th className="text-left px-3 py-2 font-medium">Window</th>
                      <th className="text-left px-3 py-2 font-medium">Confidence</th>
                      <th className="text-left px-3 py-2 font-medium">Outcome (Actual)</th>
                      <th className="text-left px-3 py-2 font-medium">Reviewer</th>
                      <th className="text-left px-3 py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisionHistory.map((r, i) => (
                      <tr key={i} className="border-t border-white/[0.04]">
                        <td className="px-3 py-2 text-slate-300">{r.date}</td>
                        <td className={`px-3 py-2 font-semibold ${
                          r.decision === "Approved" ? "text-emerald-300" :
                          r.decision === "Modified" ? "text-amber-300" : "text-rose-300"
                        }`}>{r.decision}</td>
                        <td className="px-3 py-2 text-slate-300">{r.window}</td>
                        <td className="px-3 py-2 text-slate-200 tabular-nums">{r.conf}</td>
                        <td className="px-3 py-2 text-slate-300">{r.outcome}</td>
                        <td className="px-3 py-2 text-slate-300">{r.reviewer}</td>
                        <td className="px-3 py-2 text-slate-400">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-3 text-sky-300 text-[12px] inline-flex items-center gap-1.5">View All History <ArrowRight className="h-3.5 w-3.5" /></button>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-[14px] font-semibold text-white mb-3">How Your Feedback Improves Recommendations</div>
              <div className="grid grid-cols-[1fr_180px] gap-4">
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle2, title: "Feedback is captured", desc: "Your input is recorded with context and rationale.", color: "text-emerald-300" },
                    { icon: Brain, title: "Models learn and adapt", desc: "Insights are used to refine AI models and decision logic.", color: "text-violet-300" },
                    { icon: SparkIcon, title: "Better recommendations", desc: "You receive more accurate and aligned recommendations over time.", color: "text-sky-300" },
                  ].map((s) => (
                    <div key={s.title} className="flex items-start gap-2.5">
                      <div className={`h-7 w-7 rounded-full bg-white/[0.04] grid place-items-center ${s.color}`}>
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-semibold text-white">{s.title}</div>
                        <div className="text-[11px] text-slate-400">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Loop diagram */}
                <div className="relative grid place-items-center">
                  <svg viewBox="0 0 180 180" className="h-[180px] w-[180px]">
                    <defs>
                      <linearGradient id="loopg" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                    <circle cx="90" cy="90" r="60" fill="none" stroke="url(#loopg)" strokeWidth="1.5" strokeDasharray="4 4" />
                    {/* arrowheads */}
                    <polygon points="148,86 156,90 148,94" fill="#38bdf8" />
                    <polygon points="86,30 90,22 94,30" fill="#34d399" />
                    <polygon points="32,94 24,90 32,86" fill="#a78bfa" />
                  </svg>
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="grid place-items-center"><div className="text-center"><div className="h-8 w-8 mx-auto rounded-full bg-sky-500/15 ring-1 ring-sky-400/30 grid place-items-center"><UserCheck className="h-3.5 w-3.5 text-sky-300" /></div><div className="text-[9.5px] text-slate-300 mt-0.5">You</div></div></div>
                    <div className="grid place-items-center"><div className="text-center"><div className="h-8 w-8 mx-auto rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30 grid place-items-center"><Send className="h-3.5 w-3.5 text-emerald-300" /></div><div className="text-[9.5px] text-slate-300 mt-0.5 leading-tight">Provide<br />Feedback</div></div></div>
                    <div className="grid place-items-center"><div className="text-center"><div className="h-8 w-8 mx-auto rounded-full bg-violet-500/15 ring-1 ring-violet-400/30 grid place-items-center"><BarChart3 className="h-3.5 w-3.5 text-violet-300" /></div><div className="text-[9.5px] text-slate-300 mt-0.5 leading-tight">Better<br />Recommendations</div></div></div>
                    <div className="grid place-items-center"><div className="text-center"><div className="h-8 w-8 mx-auto rounded-full bg-amber-500/15 ring-1 ring-amber-400/30 grid place-items-center"><Book className="h-3.5 w-3.5 text-amber-300" /></div><div className="text-[9.5px] text-slate-300 mt-0.5 leading-tight">AI Models<br />Learn</div></div></div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
