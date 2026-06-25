import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Users,
  DollarSign, FileText, X, Send, ArrowRight, ArrowLeft, MessageSquare, Paperclip,
  Hammer, ClipboardCheck, Droplets, HardHat, Building2, Gavel, Brain, Gauge, Lightbulb,
  GitBranch, Share2, Activity, Shield, FileCheck2, Lock, ScrollText, Scale,
  Command, Search, Download, RotateCcw, Play, Filter, ArrowUpDown, Keyboard, Zap,
, Target as TargetIcon } from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";

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
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center", active: true },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
];

function ModuleRail() {
  const nav = useNavigate();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5">
      {RAIL.map((r: any) => (
        <button
          key={r.label}
          onClick={() => r.to && nav(r.to)}
          className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
            r.active
              ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <r.icon className="h-[18px] w-[18px]" />
          <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
          {r.active && (
            <motion.span layoutId="rail-hgc-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============================= types & data ============================= */
type Status = "approved" | "pending" | "action" | "notstarted" | "rejected" | "escalated";

const STATUS_META: Record<Status, { label: string; color: string; ring: string; dot: string; text: string }> = {
  approved:   { label: "Approved",        color: "bg-emerald-500/15", ring: "ring-emerald-400/40", dot: "bg-emerald-400", text: "text-emerald-300" },
  pending:    { label: "Pending",         color: "bg-violet-500/15",  ring: "ring-violet-400/40",  dot: "bg-violet-400",  text: "text-violet-300" },
  action:     { label: "Action Required", color: "bg-amber-500/15",   ring: "ring-amber-400/50",   dot: "bg-amber-400",   text: "text-amber-300" },
  notstarted: { label: "Not Started",     color: "bg-slate-600/20",   ring: "ring-slate-500/30",   dot: "bg-slate-500",   text: "text-slate-400" },
  rejected:   { label: "Rejected",        color: "bg-rose-500/15",    ring: "ring-rose-400/40",    dot: "bg-rose-400",    text: "text-rose-300" },
  escalated:  { label: "Escalated",       color: "bg-orange-500/15",  ring: "ring-orange-400/40",  dot: "bg-orange-400",  text: "text-orange-300" },
};

type Approval = {
  id: string; step: number; name: string; sub: string; role: string; dept: string;
  approver: string; status: Status; time: string; comment: string; icon: any;
};

const INITIAL_APPROVALS: Approval[] = [
  { id: "mfg", step: 1, name: "Manufacturing", sub: "Production",        role: "Production",        dept: "Manufacturing",    approver: "J. Miller",  status: "approved", time: "May 23, 9:15 AM", comment: "No impact to committed shipments.", icon: Factory },
  { id: "eng", step: 2, name: "Engineering",   sub: "Equipment",         role: "Equipment",         dept: "Engineering",      approver: "R. Patel",   status: "approved", time: "May 23, 9:32 AM", comment: "Health trend supports action tonight.", icon: ClipboardCheck },
  { id: "fac", step: 3, name: "Facilities",    sub: "Utilities",         role: "Utilities",         dept: "Facilities",       approver: "S. Johnson", status: "approved", time: "May 23, 9:45 AM", comment: "Chilled water maintenance aligns.", icon: Droplets },
  { id: "mnt", step: 4, name: "Maintenance",   sub: "Maintenance",       role: "Maintenance",       dept: "Maintenance",      approver: "A. Owens (You)", status: "action",   time: "—", comment: "Awaiting decision", icon: Hammer },
  { id: "qa",  step: 5, name: "Quality",       sub: "Quality Assurance", role: "Quality Assurance", dept: "Quality",          approver: "M. Liang",   status: "pending",  time: "—", comment: "Awaiting decision", icon: ShieldCheck },
  { id: "ops", step: 6, name: "Operations",    sub: "Operations",        role: "Operations",        dept: "Operations",       approver: "K. Tran",    status: "pending",  time: "—", comment: "Awaiting decision", icon: HardHat },
  { id: "vp",  step: 7, name: "Final Approval",sub: "Site Operations",   role: "Site Operations",   dept: "Site Leadership",  approver: "VP D. Reyes",status: "pending",  time: "—", comment: "Final authorization pending", icon: Building2 },
];

const INITIAL_COMMENTS = [
  { who: "R. Patel",   dept: "Engineering",   initials: "RP", time: "May 23, 9:28 AM", text: "Chamber pressure instability trending upward. Agree with window." },
  { who: "S. Johnson", dept: "Facilities",    initials: "SJ", time: "May 23, 9:41 AM", text: "Utility window confirmed. No conflicts." },
  { who: "J. Miller",  dept: "Manufacturing", initials: "JM", time: "May 23, 9:14 AM", text: "Production plan adjusted. Alternate tools available." },
];

const INITIAL_AUDIT = [
  { icon: Sparkles,    text: "AI recommendation generated",  time: "May 23, 8:58 AM", color: "text-violet-300" },
  { icon: Send,        text: "Recommendation published",     time: "May 23, 9:00 AM", color: "text-sky-300" },
  { icon: CheckCircle2,text: "Manufacturing approved",       time: "May 23, 9:15 AM", color: "text-emerald-300" },
  { icon: CheckCircle2,text: "Engineering approved",         time: "May 23, 9:32 AM", color: "text-emerald-300" },
  { icon: CheckCircle2,text: "Facilities approved",          time: "May 23, 9:45 AM", color: "text-emerald-300" },
  { icon: Clock,       text: "Maintenance approval pending", time: "May 23, 9:46 AM", color: "text-amber-300" },
];

/* ============================= header ============================= */
function AppHeader({ onPalette }: { onPalette: () => void }) {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Human Governance Center</div>
          <div className="text-[11px] text-slate-400">Review, approve, and govern AI-recommended maintenance decisions</div>
        </div>
      </div>
      <div className="flex-1" />
      <button onClick={onPalette} className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] flex items-center gap-2 text-slate-300 hover:text-white text-[11.5px]">
        <Search className="h-3.5 w-3.5" /> Command
        <kbd className="ml-1 px-1.5 py-[1px] rounded bg-white/[0.06] text-[10px] text-slate-400 border border-white/10">⌘K</kbd>
      </button>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <Factory className="h-3.5 w-3.5 text-slate-400" />
        <div className="leading-tight">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Fab</div>
          <div className="text-[12.5px] font-semibold text-white">DFW Semiconductor Fab</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <div className="text-[11.5px] text-slate-300">May 23, 2025 · 10:24 AM CT</div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>
      <button className="relative h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold grid place-items-center">3</span>
      </button>
      <button className="h-9 w-9 rounded-lg bg-white/[0.03] border border-white/[0.06] grid place-items-center text-slate-300 hover:text-white"><HelpCircle className="h-4 w-4" /></button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 grid place-items-center text-white text-[11px] font-bold">AO</div>
    </header>
  );
}

/* ============================= sticky action bar ============================= */
function ActionBar({
  approvedCount, total, slaSecs, onApproveAll, onReset, onExport, onSubmit, onPalette, canSubmit,
}: any) {
  const pct = Math.round((approvedCount / total) * 100);
  const mm = String(Math.floor(slaSecs / 60)).padStart(2, "0");
  const ss = String(slaSecs % 60).padStart(2, "0");
  const slaColor = slaSecs < 600 ? "text-rose-300" : slaSecs < 1800 ? "text-amber-300" : "text-emerald-300";
  return (
    <div className="sticky top-0 z-30 -mx-6 px-6 py-3 backdrop-blur-xl bg-[#070a13]/80 border-b border-white/[0.06] flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-sky-300" />
        <div className="text-[12px] font-semibold text-white">Approval Progress</div>
      </div>
      <div className="flex items-center gap-2 min-w-[240px]">
        <div className="h-1.5 flex-1 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-sky-400"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          />
        </div>
        <div className="text-[11px] font-semibold text-white tabular-nums">{approvedCount}/{total}</div>
      </div>
      <div className={`flex items-center gap-1.5 text-[11.5px] font-semibold ${slaColor} tabular-nums`}>
        <Clock className="h-3.5 w-3.5" /> SLA {mm}:{ss}
      </div>
      <div className="flex-1" />
      <button onClick={onApproveAll} className="px-3 h-8 rounded-md bg-emerald-500/15 ring-1 ring-emerald-400/40 text-emerald-300 text-[11.5px] font-semibold hover:bg-emerald-500/25 inline-flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5" /> Approve All <kbd className="ml-1 text-[9px] opacity-60">A</kbd>
      </button>
      <button onClick={onReset} className="px-3 h-8 rounded-md bg-white/[0.04] ring-1 ring-white/10 text-slate-300 text-[11.5px] font-semibold hover:bg-white/[0.08] inline-flex items-center gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" /> Reset <kbd className="ml-1 text-[9px] opacity-60">R</kbd>
      </button>
      <button onClick={onExport} className="px-3 h-8 rounded-md bg-white/[0.04] ring-1 ring-white/10 text-slate-300 text-[11.5px] font-semibold hover:bg-white/[0.08] inline-flex items-center gap-1.5">
        <Download className="h-3.5 w-3.5" /> Export <kbd className="ml-1 text-[9px] opacity-60">E</kbd>
      </button>
      <button onClick={onSubmit} disabled={!canSubmit}
        className={`px-3 h-8 rounded-md text-[11.5px] font-semibold inline-flex items-center gap-1.5 transition ${
          canSubmit
            ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:brightness-110 shadow-[0_0_18px_-4px_rgba(56,189,248,0.7)]"
            : "bg-white/[0.04] ring-1 ring-white/10 text-slate-500 cursor-not-allowed"
        }`}>
        <Play className="h-3.5 w-3.5" /> Submit Decision <kbd className="ml-1 text-[9px] opacity-70">S</kbd>
      </button>
    </div>
  );
}

/* ============================= event ticker ============================= */
function EventTicker({ events }: { events: string[] }) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-white/[0.06] bg-white/[0.02] h-8 flex items-center">
      <div className="px-2.5 h-full grid place-items-center bg-sky-500/15 text-sky-300 text-[10px] font-bold uppercase tracking-wider border-r border-white/10">Live</div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex gap-10 whitespace-nowrap absolute inset-y-0 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {[...events, ...events].map((e, i) => (
            <span key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-sky-400" /> {e}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ============================= equipment strip ============================= */
function EquipmentStrip({ onOpen, approvedCount, total }: any) {
  const overall = approvedCount === total ? { v: "Ready to Execute", color: "text-emerald-300", icon: CheckCircle2 }
    : approvedCount >= 4 ? { v: "In Progress", color: "text-amber-300", icon: Clock }
    : { v: "Early Stage", color: "text-sky-300", icon: Activity };
  const items = [
    { k: "AI Confidence", v: "94%", sub: "", color: "text-emerald-300" },
    { k: "Business Impact", v: "Low", sub: "(-$0.24M)", color: "text-emerald-300" },
    { k: "Risk if Delayed", v: "High", sub: "(18–22 days)", color: "text-rose-300" },
    { k: "Required Approvals", v: `${approvedCount} of ${total}`, sub: "", color: "text-white" },
    { k: "Overall Status", v: overall.v, sub: "", color: overall.color, icon: overall.icon },
  ];
  return (
    <GlassCard className="p-4">
      <button onClick={() => onOpen("back")} className="text-[11.5px] text-sky-300 hover:text-sky-200 flex items-center gap-1 mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Decision Center
      </button>
      <div className="flex items-center gap-5 flex-wrap">
        <button onClick={() => onOpen("etch217")} className="flex items-center gap-3 group">
          <div className="h-[58px] w-[78px] rounded-md overflow-hidden ring-1 ring-white/10 bg-slate-900">
            <img src={etchImg} alt="ETCH-217 chamber" className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition" />
          </div>
          <div className="leading-tight text-left">
            <div className="text-[20px] font-bold text-white tracking-tight">ETCH-217</div>
            <div className="text-[11px] text-slate-400">Metal Etch Chamber | Bay 2</div>
          </div>
        </button>
        <div className="h-12 w-px bg-white/10" />
        <div className="leading-tight">
          <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/15 ring-1 ring-emerald-400/30 text-emerald-300 text-[10.5px] font-semibold">Maintain Tonight</span>
          <div className="text-[11.5px] text-slate-300 mt-1">10:00 PM – 2:00 AM</div>
          <div className="text-[10.5px] text-slate-500">May 23, 2025</div>
        </div>
        <div className="flex-1 flex items-stretch gap-5 flex-wrap">
          {items.map((m: any) => (
            <button key={m.k} onClick={() => onOpen("kpi-" + m.k)} className="text-left group">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{m.k}</div>
              <div className={`text-[20px] font-bold ${m.color} flex items-center gap-1.5`}>
                {m.icon && <m.icon className="h-4 w-4" />} {m.v}
              </div>
              {m.sub && <div className="text-[10px] text-slate-500">{m.sub}</div>}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================= workflow ============================= */
function ApprovalWorkflow({ approvals, onAction, selectedId, setSelected }: any) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[14px] font-semibold text-white">Approval Workflow</div>
        <div className="text-[10.5px] text-slate-500">Click a step to focus · approve/reject inline</div>
      </div>
      <div className="relative mt-5">
        <div className="absolute left-[5%] right-[5%] top-[34px] h-px bg-gradient-to-r from-emerald-500/40 via-amber-400/40 to-slate-600/30" />
        <div className="grid grid-cols-7 gap-2 relative">
          {approvals.map((a: Approval, i: number) => {
            const meta = STATUS_META[a.status];
            const isSel = selectedId === a.id;
            return (
              <motion.button
                key={a.id}
                onClick={() => setSelected(a.id)}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex flex-col items-center gap-1.5 group rounded-lg p-1.5 transition ${isSel ? "bg-white/[0.04] ring-1 ring-sky-400/30" : ""}`}
              >
                <div className={`relative h-[70px] w-[70px] rounded-full grid place-items-center ${meta.color} ring-2 ${meta.ring} ${
                  a.status === "action" ? "shadow-[0_0_28px_-4px_rgba(251,191,36,0.6)]" : ""
                }`}>
                  {a.status === "action" && (
                    <motion.span className="absolute inset-0 rounded-full ring-2 ring-amber-400/40"
                      animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
                  )}
                  <a.icon className={`h-6 w-6 ${meta.text}`} />
                  {a.status === "approved" && (
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 grid place-items-center ring-2 ring-[#0b0f1a]">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                  )}
                  {a.status === "rejected" && (
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-rose-500 grid place-items-center ring-2 ring-[#0b0f1a]">
                      <X className="h-3 w-3 text-white" />
                    </span>
                  )}
                  {a.status === "action" && (
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500 grid place-items-center ring-2 ring-[#0b0f1a] text-white text-[10px] font-bold">{a.step}</span>
                  )}
                </div>
                <div className="text-[11.5px] font-semibold text-white text-center leading-tight">{a.name}</div>
                <div className="text-[10px] text-slate-400">{a.sub}</div>
                <div className={`text-[10.5px] font-semibold ${meta.text}`}>{meta.label}</div>
                {a.time !== "—" && <div className="text-[9.5px] text-slate-500">{a.time}</div>}
                {a.approver !== "—" && <div className="text-[9.5px] text-slate-500 truncate max-w-[80px]">{a.approver}</div>}
                {isSel && (a.status === "action" || a.status === "pending") && (
                  <div className="flex items-center gap-1 mt-1">
                    <button onClick={(e) => { e.stopPropagation(); onAction(a.id, "approved"); }}
                      className="h-6 w-6 rounded bg-emerald-500/15 ring-1 ring-emerald-400/40 grid place-items-center text-emerald-300 hover:bg-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onAction(a.id, "rejected"); }}
                      className="h-6 w-6 rounded bg-rose-500/10 ring-1 ring-rose-400/40 grid place-items-center text-rose-300 hover:bg-rose-500/20">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================= my approval task ============================= */
function MyApprovalTask({ approval, onAction, onInfo }: { approval: Approval; onAction: (id: string, s: Status) => void; onInfo: () => void; }) {
  if (!approval) return null;
  const isDone = approval.status === "approved" || approval.status === "rejected";
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[13.5px] font-semibold text-white">My Approval Task</div>
          <span className={`px-2 py-0.5 rounded ring-1 text-[10px] font-semibold ${STATUS_META[approval.status].color} ${STATUS_META[approval.status].ring} ${STATUS_META[approval.status].text}`}>
            {STATUS_META[approval.status].label}
          </span>
        </div>
        <div className="text-[10.5px] text-slate-500">Hotkeys: <kbd className="px-1 bg-white/5 rounded">A</kbd> approve · <kbd className="px-1 bg-white/5 rounded">X</kbd> reject · <kbd className="px-1 bg-white/5 rounded">I</kbd> info</div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.025] ring-1 ring-white/5">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 ring-1 ring-amber-400/30 grid place-items-center"><Hammer className="h-4 w-4 text-amber-300" /></div>
            <div className="leading-snug">
              <div className="text-[12.5px] font-semibold text-white">{approval.name} Approval</div>
              <div className="text-[11px] text-slate-400">Review and approve AI-recommended maintenance window for ETCH-217.</div>
            </div>
          </div>
        </div>
        <div className="col-span-6 lg:col-span-3 p-3 rounded-lg bg-white/[0.025] ring-1 ring-white/5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Recommendation</div>
          <div className="text-[14px] font-semibold text-emerald-300 mt-1">Maintain Tonight</div>
          <div className="text-[11px] text-slate-300">10:00 PM – 2:00 AM</div>
          <div className="text-[10.5px] text-slate-500">May 23, 2025</div>
        </div>
        <div className="col-span-6 lg:col-span-2 p-3 rounded-lg bg-white/[0.025] ring-1 ring-white/5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Your Decision</div>
          <div className="flex flex-col gap-1.5">
            <button disabled={isDone} onClick={() => onAction(approval.id, "approved")}
              className="px-3 py-1.5 rounded-md bg-emerald-500/15 ring-1 ring-emerald-400/40 text-emerald-300 text-[11.5px] font-semibold hover:bg-emerald-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </button>
            <button disabled={isDone} onClick={() => onAction(approval.id, "rejected")}
              className="px-3 py-1.5 rounded-md bg-rose-500/10 ring-1 ring-rose-400/40 text-rose-300 text-[11.5px] font-semibold hover:bg-rose-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50">
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-2 p-3 rounded-lg bg-white/[0.025] ring-1 ring-white/5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Request More Info</div>
          <button onClick={onInfo} className="w-full px-3 py-1.5 rounded-md bg-sky-500/10 ring-1 ring-sky-400/40 text-sky-300 text-[11.5px] font-semibold hover:bg-sky-500/20 flex items-center justify-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Request Info</button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================= approvals table ============================= */
type SortKey = "step" | "status" | "name";
function AllApprovalsTable({ approvals, onOpen, selectedId, setSelected }: any) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("step");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    let r = [...approvals] as Approval[];
    if (filter !== "all") r = r.filter((a) => a.status === filter);
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter((a) => [a.name, a.role, a.approver, a.dept, a.comment].some((s) => s.toLowerCase().includes(t)));
    }
    r.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "step") cmp = a.step - b.step;
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });
    return r;
  }, [approvals, q, filter, sortKey, sortAsc]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(true); }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="text-[13.5px] font-semibold text-white">All Approvals</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 h-7 rounded-md bg-white/[0.03] ring-1 ring-white/10">
            <Search className="h-3 w-3 text-slate-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="bg-transparent text-[11px] text-white placeholder:text-slate-500 outline-none w-32" />
          </div>
          <div className="flex items-center gap-1 px-2 h-7 rounded-md bg-white/[0.03] ring-1 ring-white/10 text-[11px] text-slate-300">
            <Filter className="h-3 w-3 text-slate-500" />
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-transparent outline-none text-[11px]">
              <option value="all" className="bg-slate-900">All</option>
              {(Object.keys(STATUS_META) as Status[]).map((s) => (
                <option key={s} value={s} className="bg-slate-900">{STATUS_META[s].label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg ring-1 ring-white/5">
        <table className="w-full text-[11.5px]">
          <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/[0.02]">
            <tr>
              <th className="text-left font-semibold px-3 py-2"><button onClick={() => toggleSort("step")} className="inline-flex items-center gap-1 hover:text-white">Step <ArrowUpDown className="h-2.5 w-2.5" /></button></th>
              <th className="text-left font-semibold px-3 py-2">Role</th>
              <th className="text-left font-semibold px-3 py-2">Approver</th>
              <th className="text-left font-semibold px-3 py-2"><button onClick={() => toggleSort("status")} className="inline-flex items-center gap-1 hover:text-white">Status <ArrowUpDown className="h-2.5 w-2.5" /></button></th>
              <th className="text-left font-semibold px-3 py-2">Decision Time</th>
              <th className="text-left font-semibold px-3 py-2">Comments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const m = STATUS_META[a.status];
              const isAction = a.status === "action";
              const isSel = selectedId === a.id;
              return (
                <tr key={a.id} onClick={() => { setSelected(a.id); onOpen("step-" + a.id); }}
                    className={`border-t border-white/[0.04] cursor-pointer hover:bg-white/[0.03] ${isAction ? "bg-amber-500/[0.06]" : ""} ${isSel ? "ring-1 ring-sky-400/30" : ""}`}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold ring-1 ${m.ring} ${m.color} ${m.text}`}>{a.step}</span>
                      <span className="text-white">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{a.role}</td>
                  <td className="px-3 py-2.5 text-slate-300">{a.approver}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${m.color} ring-1 ${m.ring} ${m.text} text-[10.5px] font-semibold`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} /> {m.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{a.time}</td>
                  <td className="px-3 py-2.5 text-slate-300">{a.comment}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500 text-[11px]">No matching approvals</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

/* ============================= right column ============================= */
function DecisionSummary({ onOpen, approvedCount, total }: any) {
  const status = approvedCount === total ? "Ready to Execute" : approvedCount >= 4 ? "In Progress" : "Early Stage";
  return (
    <GlassCard className="p-4">
      <div className="text-[13.5px] font-semibold text-white mb-3">Decision Summary</div>
      <div className="text-[10.5px] uppercase tracking-wider text-slate-500">AI Recommendation</div>
      <div className="text-[20px] font-bold text-emerald-300">Maintain Tonight</div>
      <div className="text-[11px] text-slate-400">10:00 PM – 2:00 AM · May 23, 2025</div>
      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] ring-1 ring-white/10 text-[10.5px] text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" /> {status}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          { icon: Users,       k: "Production Impact", v: "-320 wafers", color: "text-amber-300" },
          { icon: ShieldCheck, k: "Yield Impact",      v: "-0.02%",      color: "text-emerald-300" },
          { icon: DollarSign,  k: "Revenue Impact",    v: "-$0.24M",     color: "text-amber-300" },
          { icon: Clock,       k: "Downtime",          v: "2h 30m",      color: "text-sky-300" },
        ].map((m) => (
          <button key={m.k} onClick={() => onOpen("summary-" + m.k)} className="p-2 rounded-lg bg-white/[0.025] ring-1 ring-white/5 text-left hover:bg-white/[0.04]">
            <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
            <div className="text-[9.5px] uppercase tracking-wider text-slate-500 mt-1.5">{m.k}</div>
            <div className={`text-[12px] font-bold ${m.color}`}>{m.v}</div>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function CommentsPanel({ comments, onPost }: any) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onPost(text.trim());
    setText("");
  };
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Comments & Discussions</div>
        <span className="text-[10.5px] text-slate-500">{comments.length} total</span>
      </div>
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {comments.map((c: any, i: number) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 grid place-items-center text-white text-[10px] font-bold shrink-0">{c.initials}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11.5px] font-semibold text-white truncate">{c.who} <span className="text-slate-400 font-normal">({c.dept})</span></div>
                <div className="text-[10px] text-slate-500 shrink-0">{c.time}</div>
              </div>
              <div className="text-[11.5px] text-slate-300 mt-0.5">{c.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/[0.025] ring-1 ring-white/5 px-2">
        <Paperclip className="h-3.5 w-3.5 text-slate-500" />
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a comment... (Enter to send)"
          className="flex-1 bg-transparent py-2 text-[12px] text-white placeholder:text-slate-500 outline-none" />
        <button onClick={submit} className="h-7 w-7 rounded-md bg-sky-500/15 ring-1 ring-sky-400/40 text-sky-300 grid place-items-center hover:bg-sky-500/25"><Send className="h-3.5 w-3.5" /></button>
      </div>
    </GlassCard>
  );
}

function AuditTrailPanel({ audit }: any) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Audit Trail</div>
        <span className="text-[10.5px] text-slate-500">{audit.length} events</span>
      </div>
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {audit.map((e: any, i: number) => (
            <motion.div key={`${i}-${e.text}`}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <e.icon className={`h-3.5 w-3.5 ${e.color} shrink-0`} />
                <div className="text-[11.5px] text-slate-200 truncate">{e.text}</div>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0">{e.time}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

/* ============================= footer governance ============================= */
function GovernanceFooter({ onOpen }: any) {
  return (
    <GlassCard className="p-5">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <div className="text-[12.5px] font-semibold text-white mb-2">Governance Policy</div>
          <button onClick={() => onOpen("policy")} className="text-[11.5px] text-sky-300 hover:text-sky-200 text-left">Maintenance Decision Policy v2.1</button>
          <div className="text-[10.5px] text-slate-500 mt-1">Last Updated: Apr 12, 2025</div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="text-[12.5px] font-semibold text-white mb-2">Approval Rules</div>
          {["All 7 approvals required", "Decision expires in 24 hours"].map((r) => (
            <div key={r} className="flex items-center gap-2 text-[11px] text-slate-300 py-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {r}
            </div>
          ))}
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="text-[12.5px] font-semibold text-white mb-2">Escalation Rules</div>
          {["Auto-escalate after 2 hours", "Escalate to next level if rejected"].map((r) => (
            <div key={r} className="flex items-center gap-2 text-[11px] text-slate-300 py-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {r}
            </div>
          ))}
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="text-[12.5px] font-semibold text-white mb-2">Data Security & Compliance</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Shield,     k: "SOC 2",         v: "Compliant" },
              { icon: FileCheck2, k: "ISO 27001",     v: "Compliant" },
              { icon: ScrollText, k: "21 CFR Part 11",v: "Compliant" },
              { icon: Lock,       k: "All actions logged", v: "and auditable" },
            ].map((c) => (
              <button key={c.k} onClick={() => onOpen("comp-" + c.k)} className="p-2 rounded-md bg-white/[0.025] ring-1 ring-white/5 text-left hover:bg-white/[0.04]">
                <c.icon className="h-3.5 w-3.5 text-sky-300" />
                <div className="text-[10.5px] text-white font-semibold mt-1 leading-tight">{c.k}</div>
                <div className="text-[10px] text-emerald-300">{c.v}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================= drawer ============================= */
function KnowledgeDrawer({ topic, approvals, onClose, onAction }: any) {
  const [tab, setTab] = useState<"100" | "200" | "300">("100");
  const open = !!topic;
  const stepId = topic?.startsWith("step-") ? topic.slice(5) : null;
  const step: Approval | undefined = stepId ? approvals.find((x: Approval) => x.id === stepId) : undefined;
  const title = useMemo(() => {
    if (!topic) return "";
    if (step) return `${step.name} — ${step.dept}`;
    if (topic === "policy") return "Maintenance Decision Policy v2.1";
    if (topic.startsWith("comp-")) return topic.slice(5);
    if (topic.startsWith("kpi-")) return topic.slice(4);
    if (topic.startsWith("summary-")) return topic.slice(8);
    if (topic === "etch217") return "ETCH-217 · Applied Materials Centura®";
    if (topic === "help") return "Keyboard Shortcuts";
    return "Governance Detail";
  }, [topic, step]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.aside
            initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[460px] z-50 bg-[#0b0f1a] border-l border-white/10 flex flex-col"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 font-semibold">Governance Detail</div>
                <div className="text-[15px] font-semibold text-white mt-0.5">{title}</div>
                {step && (
                  <div className="text-[10.5px] mt-1 inline-flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[step.status].dot}`} />
                    <span className={STATUS_META[step.status].text}>{STATUS_META[step.status].label}</span>
                    <span className="text-slate-500">· {step.approver}</span>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] grid place-items-center text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {topic === "help" ? (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 text-[12px] text-slate-300">
                {[
                  ["⌘K / Ctrl+K", "Open command palette"],
                  ["A", "Approve current step"],
                  ["X", "Reject current step"],
                  ["I", "Request more information"],
                  ["S", "Submit final decision"],
                  ["R", "Reset workflow"],
                  ["E", "Export CSV"],
                  ["1 – 7", "Jump to approval step"],
                  ["? or /", "Show this help"],
                ].map(([k, d]) => (
                  <div key={k} className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                    <kbd className="px-2 py-0.5 rounded bg-white/[0.06] text-[11px] text-white border border-white/10">{k}</kbd>
                    <span className="text-slate-400">{d}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="px-5 pt-3 flex gap-1">
                  {(["100","200","300"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition ${
                              tab === t ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/40" : "text-slate-400 hover:text-white"
                            }`}>
                      {t}-Level · {t === "100" ? "Executive" : t === "200" ? "Operational" : "Engineering"}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-[12.5px] text-slate-300 leading-relaxed">
                  {tab === "100" && (
                    <>
                      <p><span className="text-white font-semibold">Why approval is needed.</span> AI recommends tonight's window to avoid a $0.24M revenue exposure and preserve customer commitments. Final decision remains with Site Leadership.</p>
                      <p><span className="text-white font-semibold">Financial implications.</span> Acting tonight saves an estimated $1.8M in downstream impact vs. waiting; risk window extends only 2h 30m.</p>
                      <p><span className="text-white font-semibold">Recommendation confidence.</span> 94% — supported by Bayesian RUL, evidence telemetry, and customer-commitment models.</p>
                    </>
                  )}
                  {tab === "200" && (
                    <>
                      <p><span className="text-white font-semibold">Cross-functional coordination.</span> Manufacturing, Engineering, and Facilities have approved. Maintenance action is required next; Quality and Operations follow.</p>
                      <p><span className="text-white font-semibold">Scheduling implications.</span> Tonight's utility maintenance window aligns. Alternate tools (ETCH-219/221) cover committed lots.</p>
                      <p><span className="text-white font-semibold">Risk ownership.</span> Quality owns yield risk; Operations owns customer-commitment risk; Maintenance owns execution.</p>
                    </>
                  )}
                  {tab === "300" && (
                    <>
                      <p><span className="text-white font-semibold">Workflow architecture.</span> Seven-stage approval graph with deadline-driven auto-escalation, electronic signatures (21 CFR Part 11), and immutable hash-chained audit records.</p>
                      <p><span className="text-white font-semibold">Recommendation versioning.</span> v2025.05.23-r4 · Digital Twin v3.8.1 · Evidence lineage hashed and pinned.</p>
                      <p><span className="text-white font-semibold">Integrations.</span> FactoryWorks MES, ServiceNow Change, SAP PM, IBM Maximo, SECS/GEM, EDA Historian, Entra ID.</p>
                      <p><span className="text-white font-semibold">Governance frameworks.</span> NIST AI RMF, ISO 27001, SOC 2, Responsible AI principles.</p>
                    </>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    disabled={!step || step.status === "approved" || step.status === "rejected"}
                    onClick={() => step && onAction(step.id, "approved")}
                    className="px-3 py-1.5 rounded-md bg-emerald-500/15 ring-1 ring-emerald-400/40 text-emerald-300 text-[11.5px] font-semibold hover:bg-emerald-500/25 inline-flex items-center gap-1.5 disabled:opacity-40">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    disabled={!step || step.status === "approved" || step.status === "rejected"}
                    onClick={() => step && onAction(step.id, "rejected")}
                    className="px-3 py-1.5 rounded-md bg-rose-500/10 ring-1 ring-rose-400/40 text-rose-300 text-[11.5px] font-semibold hover:bg-rose-500/20 inline-flex items-center gap-1.5 disabled:opacity-40">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button className="ml-auto px-3 py-1.5 rounded-md bg-white/[0.04] ring-1 ring-white/10 text-slate-300 text-[11.5px] font-semibold hover:bg-white/[0.08] inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Export</button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================= command palette ============================= */
function CommandPalette({ open, onClose, commands }: any) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return commands.filter((c: any) => !t || c.label.toLowerCase().includes(t) || (c.hint || "").toLowerCase().includes(t));
  }, [q, commands]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-start pt-[14vh] px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
            className="relative w-full max-w-xl rounded-xl border border-white/10 bg-[#0b0f1a] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 h-11 border-b border-white/10">
              <Command className="h-4 w-4 text-sky-300" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-slate-500 outline-none" />
              <kbd className="text-[10px] text-slate-400 border border-white/10 px-1.5 py-[1px] rounded bg-white/[0.04]">ESC</kbd>
            </div>
            <div className="max-h-[360px] overflow-y-auto py-1">
              {filtered.map((c: any, i: number) => (
                <button key={i} onClick={() => { c.run(); onClose(); }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/[0.05] text-left">
                  <c.icon className="h-4 w-4 text-sky-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-white truncate">{c.label}</div>
                    {c.hint && <div className="text-[10.5px] text-slate-500 truncate">{c.hint}</div>}
                  </div>
                  {c.kbd && <kbd className="text-[10px] text-slate-400 border border-white/10 px-1.5 py-[1px] rounded bg-white/[0.04]">{c.kbd}</kbd>}
                </button>
              ))}
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-[12px] text-slate-500">No results</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================= page ============================= */
export default function HumanGovernanceCenter() {
  const nav = useNavigate();
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [audit, setAudit] = useState<any[]>(INITIAL_AUDIT);
  const [drawer, setDrawer] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("mnt");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [slaSecs, setSlaSecs] = useState(45 * 60);

  // SLA countdown
  useEffect(() => {
    const t = setInterval(() => setSlaSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length;
  const total = approvals.length;
  const canSubmit = approvedCount === total;
  const currentTask = approvals.find((a) => a.id === selectedId) || approvals.find((a) => a.status === "action") || approvals[0];

  const events = useMemo(() => audit.slice(-8).map((e) => `${e.text} · ${e.time}`), [audit]);

  const nowLabel = "May 23, 10:24 AM";

  const setStatus = (id: string, status: Status) => {
    setApprovals((prev) => {
      const next = prev.map((a) => a.id === id ? { ...a, status, time: status === "pending" ? "—" : nowLabel, approver: a.approver === "—" ? "A. Owens (You)" : a.approver, comment: status === "approved" ? "Approved via Governance Center." : status === "rejected" ? "Rejected — escalation required." : a.comment } : a);
      // Promote next pending to action
      if (status === "approved") {
        const nextPending = next.find((a) => a.status === "pending");
        if (nextPending) nextPending.status = "action";
      }
      return next;
    });
    const a = approvals.find((x) => x.id === id);
    setAudit((prev) => [...prev, {
      icon: status === "approved" ? CheckCircle2 : status === "rejected" ? X : Clock,
      text: `${a?.name} ${status}`,
      time: nowLabel,
      color: status === "approved" ? "text-emerald-300" : status === "rejected" ? "text-rose-300" : "text-amber-300",
    }]);
    toast.success(`${a?.name} marked as ${status}`);
  };

  const approveAll = () => {
    setApprovals((prev) => prev.map((a) => a.status === "approved" || a.status === "rejected" ? a : { ...a, status: "approved" as Status, time: nowLabel, comment: "Bulk-approved via Governance Center." }));
    setAudit((prev) => [...prev, { icon: Zap, text: "All remaining approvals granted (bulk)", time: nowLabel, color: "text-emerald-300" }]);
    toast.success("All approvals granted");
  };

  const reset = () => {
    setApprovals(INITIAL_APPROVALS);
    setAudit(INITIAL_AUDIT);
    setComments(INITIAL_COMMENTS);
    setSlaSecs(45 * 60);
    setSelectedId("mnt");
    toast("Workflow reset");
  };

  const exportCSV = () => {
    const rows = [
      ["Step", "Name", "Role", "Department", "Approver", "Status", "Time", "Comment"],
      ...approvals.map((a) => [a.step, a.name, a.role, a.dept, a.approver, a.status, a.time, a.comment]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "etch-217-approvals.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported approvals CSV");
  };

  const submitFinal = () => {
    if (!canSubmit) { toast.error("All 7 approvals required"); return; }
    setAudit((prev) => [...prev, { icon: Send, text: "Decision submitted to execution queue", time: nowLabel, color: "text-sky-300" }]);
    toast.success("Decision submitted — execution scheduled tonight 10:00 PM");
  };

  const requestInfo = () => {
    setAudit((prev) => [...prev, { icon: MessageSquare, text: `Info request sent for ${currentTask?.name}`, time: nowLabel, color: "text-sky-300" }]);
    toast("Information request sent to AI Reasoning team");
  };

  const postComment = (text: string) => {
    setComments((prev) => [{ who: "A. Owens", dept: "Maintenance", initials: "AO", time: nowLabel, text }, ...prev]);
    setAudit((prev) => [...prev, { icon: MessageSquare, text: "Comment added by A. Owens", time: nowLabel, color: "text-slate-300" }]);
    toast.success("Comment posted");
  };

  const onOpen = (id: string) => {
    if (id === "back") { nav("/sead/ai-maintenance-decision-center"); return; }
    setDrawer(id);
  };

  // Hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(true); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setDrawer(null); return; }
      if (e.key === "?" || e.key === "/") { e.preventDefault(); setDrawer("help"); return; }
      if (e.key >= "1" && e.key <= "7") { const idx = parseInt(e.key) - 1; if (approvals[idx]) setSelectedId(approvals[idx].id); return; }
      const k = e.key.toLowerCase();
      if (k === "a") { e.preventDefault(); if (currentTask && currentTask.status !== "approved" && currentTask.status !== "rejected") setStatus(currentTask.id, "approved"); }
      else if (k === "x") { e.preventDefault(); if (currentTask && currentTask.status !== "approved" && currentTask.status !== "rejected") setStatus(currentTask.id, "rejected"); }
      else if (k === "i") { e.preventDefault(); requestInfo(); }
      else if (k === "s") { e.preventDefault(); submitFinal(); }
      else if (k === "r") { e.preventDefault(); reset(); }
      else if (k === "e") { e.preventDefault(); exportCSV(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [approvals, currentTask, canSubmit]);

  const commands = useMemo(() => [
    { icon: CheckCircle2, label: "Approve current step", hint: currentTask?.name, kbd: "A", run: () => currentTask && setStatus(currentTask.id, "approved") },
    { icon: X, label: "Reject current step", hint: currentTask?.name, kbd: "X", run: () => currentTask && setStatus(currentTask.id, "rejected") },
    { icon: Zap, label: "Approve all remaining", kbd: "A", run: approveAll },
    { icon: MessageSquare, label: "Request more information", kbd: "I", run: requestInfo },
    { icon: Play, label: "Submit final decision", hint: canSubmit ? "Ready" : "Requires all 7 approvals", kbd: "S", run: submitFinal },
    { icon: Download, label: "Export approvals CSV", kbd: "E", run: exportCSV },
    { icon: RotateCcw, label: "Reset workflow", kbd: "R", run: reset },
    { icon: Keyboard, label: "Show keyboard shortcuts", kbd: "?", run: () => setDrawer("help") },
    { icon: FileText, label: "Open Maintenance Decision Policy v2.1", run: () => setDrawer("policy") },
    { icon: ArrowLeft, label: "Back to Decision Center", run: () => nav("/sead/ai-maintenance-decision-center") },
    ...approvals.map((a, i) => ({ icon: a.icon, label: `Jump to step ${a.step}: ${a.name}`, hint: a.approver, kbd: String(i + 1), run: () => setSelectedId(a.id) })),
  ], [currentTask, canSubmit, approvals]);

  return (
    <div className="min-h-screen text-slate-100 bg-[radial-gradient(1200px_700px_at_15%_-10%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(900px_500px_at_85%_-5%,rgba(168,85,247,0.08),transparent_60%),linear-gradient(180deg,#070a13_0%,#080c17_100%)]">
      <AppHeader onPalette={() => setPaletteOpen(true)} />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 px-6 py-0">
          <ActionBar
            approvedCount={approvedCount} total={total} slaSecs={slaSecs}
            onApproveAll={approveAll} onReset={reset} onExport={exportCSV} onSubmit={submitFinal}
            onPalette={() => setPaletteOpen(true)} canSubmit={canSubmit}
          />
          <div className="py-5 grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-9 space-y-5">
              <EventTicker events={events} />
              <EquipmentStrip onOpen={onOpen} approvedCount={approvedCount} total={total} />
              <ApprovalWorkflow approvals={approvals} onAction={setStatus} selectedId={selectedId} setSelected={setSelectedId} />
              <MyApprovalTask approval={currentTask} onAction={setStatus} onInfo={requestInfo} />
              <AllApprovalsTable approvals={approvals} onOpen={onOpen} selectedId={selectedId} setSelected={setSelectedId} />
              <GovernanceFooter onOpen={onOpen} />
            </div>
            <div className="col-span-12 xl:col-span-3 space-y-5">
              <DecisionSummary onOpen={onOpen} approvedCount={approvedCount} total={total} />
              <CommentsPanel comments={comments} onPost={postComment} />
              <AuditTrailPanel audit={audit} />
              {rejectedCount > 0 && (
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 text-rose-300 text-[12px] font-semibold mb-1"><AlertTriangle className="h-4 w-4" /> Escalation Triggered</div>
                  <div className="text-[11px] text-slate-400">{rejectedCount} rejection(s) require Site Leadership review before resubmission.</div>
                </GlassCard>
              )}
            </div>
          </div>
        </main>
      </div>
      <KnowledgeDrawer topic={drawer} approvals={approvals} onClose={() => setDrawer(null)} onAction={setStatus} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </div>
  );
}
