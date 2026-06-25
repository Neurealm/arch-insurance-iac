import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Users,
  DollarSign, FileText, X, Send, ArrowRight, ArrowLeft, MessageSquare, Paperclip,
  Hammer, ClipboardCheck, Droplets, HardHat, Building2, Gavel, Activity, Shield,
  FileCheck2, Lock, ScrollText,
} from "lucide-react";
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
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center", active: true },
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

/* ============================= header ============================= */
function AppHeader() {
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

/* ============================= data ============================= */
type Status = "approved" | "pending" | "action" | "notstarted" | "rejected" | "escalated";

const STATUS_META: Record<Status, { label: string; color: string; ring: string; dot: string; text: string }> = {
  approved:   { label: "Approved",     color: "bg-emerald-500/15", ring: "ring-emerald-400/40", dot: "bg-emerald-400", text: "text-emerald-300" },
  pending:    { label: "Pending",      color: "bg-violet-500/15",  ring: "ring-violet-400/40",  dot: "bg-violet-400",  text: "text-violet-300" },
  action:     { label: "Action Required", color: "bg-amber-500/15",ring: "ring-amber-400/50",   dot: "bg-amber-400",   text: "text-amber-300" },
  notstarted: { label: "Not Started",  color: "bg-slate-600/20",   ring: "ring-slate-500/30",   dot: "bg-slate-500",   text: "text-slate-400" },
  rejected:   { label: "Rejected",     color: "bg-rose-500/15",    ring: "ring-rose-400/40",    dot: "bg-rose-400",    text: "text-rose-300" },
  escalated:  { label: "Escalated",    color: "bg-orange-500/15",  ring: "ring-orange-400/40",  dot: "bg-orange-400",  text: "text-orange-300" },
};

const APPROVALS: Array<{
  id: string; step: number; name: string; sub: string; role: string; dept: string;
  approver: string; status: Status; time: string; comment: string; icon: any;
}> = [
  { id: "mfg", step: 1, name: "Manufacturing", sub: "Production",  role: "Production",       dept: "Manufacturing", approver: "J. Miller",  status: "approved", time: "May 23, 9:15 AM", comment: "No impact to committed shipments.", icon: Factory },
  { id: "eng", step: 2, name: "Engineering",   sub: "Equipment",   role: "Equipment",        dept: "Engineering",   approver: "R. Patel",   status: "approved", time: "May 23, 9:32 AM", comment: "Health trend supports action tonight.", icon: ClipboardCheck },
  { id: "fac", step: 3, name: "Facilities",    sub: "Utilities",   role: "Utilities",        dept: "Facilities",    approver: "S. Johnson", status: "approved", time: "May 23, 9:45 AM", comment: "Chilled water maintenance aligns.", icon: Droplets },
  { id: "mnt", step: 4, name: "Maintenance",   sub: "Maintenance", role: "Maintenance",      dept: "Maintenance",   approver: "—",          status: "action",   time: "—",               comment: "Awaiting decision",                  icon: Hammer },
  { id: "qa",  step: 5, name: "Quality",       sub: "Quality Assurance", role: "Quality Assurance", dept: "Quality", approver: "—",        status: "pending",  time: "—",               comment: "Awaiting decision",                  icon: ShieldCheck },
  { id: "ops", step: 6, name: "Operations",    sub: "Operations",  role: "Operations",       dept: "Operations",    approver: "—",          status: "pending",  time: "—",               comment: "Awaiting decision",                  icon: HardHat },
  { id: "vp",  step: 7, name: "Final Approval",sub: "Site Operations", role: "Site Operations", dept: "Site Leadership", approver: "—",    status: "pending",  time: "—",               comment: "Final authorization pending",        icon: Building2 },
];

const COMMENTS = [
  { who: "R. Patel",   dept: "Engineering",   initials: "RP", time: "May 23, 9:28 AM", text: "Chamber pressure instability trending upward. Agree with window." },
  { who: "S. Johnson", dept: "Facilities",    initials: "SJ", time: "May 23, 9:41 AM", text: "Utility window confirmed. No conflicts." },
  { who: "J. Miller",  dept: "Manufacturing", initials: "JM", time: "May 23, 9:14 AM", text: "Production plan adjusted. Alternate tools available." },
];

const AUDIT = [
  { icon: Sparkles,    text: "AI recommendation generated", time: "May 23, 8:58 AM", color: "text-violet-300" },
  { icon: Send,        text: "Recommendation published",    time: "May 23, 9:00 AM", color: "text-sky-300" },
  { icon: CheckCircle2,text: "Manufacturing approved",      time: "May 23, 9:15 AM", color: "text-emerald-300" },
  { icon: CheckCircle2,text: "Engineering approved",        time: "May 23, 9:32 AM", color: "text-emerald-300" },
  { icon: CheckCircle2,text: "Facilities approved",         time: "May 23, 9:45 AM", color: "text-emerald-300" },
  { icon: Clock,       text: "Maintenance approval pending",time: "May 23, 9:46 AM", color: "text-amber-300" },
  { icon: Activity,    text: "Workflow initiated",          time: "May 23, 9:00 AM", color: "text-slate-300" },
];

/* ============================= header strip ============================= */
function EquipmentStrip({ onOpen }: { onOpen: (id: string) => void }) {
  const items = [
    { k: "AI Confidence", v: "94%", sub: "", color: "text-emerald-300" },
    { k: "Business Impact", v: "Low", sub: "(-$0.24M)", color: "text-emerald-300" },
    { k: "Risk if Delayed", v: "High", sub: "(18–22 days)", color: "text-rose-300" },
    { k: "Required Approvals", v: "7 of 7", sub: "", color: "text-white" },
    { k: "Overall Status", v: "In Progress", sub: "", color: "text-amber-300", icon: Clock },
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
function ApprovalWorkflow({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[14px] font-semibold text-white">Approval Workflow</div>
        <div className="text-[10.5px] text-slate-500">All approvals are required. Decision will proceed when all steps are completed.</div>
      </div>
      <div className="relative mt-5">
        {/* horizontal connector */}
        <div className="absolute left-[5%] right-[5%] top-[34px] h-px bg-gradient-to-r from-emerald-500/40 via-amber-400/40 to-slate-600/30" />
        <div className="grid grid-cols-7 gap-2 relative">
          {APPROVALS.map((a, i) => {
            const meta = STATUS_META[a.status];
            return (
              <motion.button
                key={a.id}
                onClick={() => onOpen("step-" + a.id)}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={`relative h-[70px] w-[70px] rounded-full grid place-items-center ${meta.color} ring-2 ${meta.ring} ${
                  a.status === "action" ? "shadow-[0_0_28px_-4px_rgba(251,191,36,0.6)]" : ""
                } ${a.status === "pending" || a.status === "notstarted" ? "" : ""}`}>
                  {a.status === "action" && (
                    <motion.span
                      className="absolute inset-0 rounded-full ring-2 ring-amber-400/40"
                      animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <a.icon className={`h-6 w-6 ${meta.text}`} />
                  {a.status === "approved" && (
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 grid place-items-center ring-2 ring-[#0b0f1a]">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                  )}
                  {a.status === "action" && (
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500 grid place-items-center ring-2 ring-[#0b0f1a] text-white text-[10px] font-bold">{4}</span>
                  )}
                </div>
                <div className="text-[11.5px] font-semibold text-white text-center leading-tight">{a.name}</div>
                <div className="text-[10px] text-slate-400">{a.sub}</div>
                <div className={`text-[10.5px] font-semibold ${meta.text}`}>{meta.label}</div>
                {a.time !== "—" && <div className="text-[9.5px] text-slate-500">{a.time}</div>}
                {a.status === "action" && <div className="text-[9.5px] text-amber-300/80">Due in 45m</div>}
                {a.approver !== "—" && <div className="text-[9.5px] text-slate-500">{a.approver}</div>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================= my approval task ============================= */
function MyApprovalTask() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[13.5px] font-semibold text-white">My Approval Task</div>
          <span className="px-2 py-0.5 rounded bg-amber-500/15 ring-1 ring-amber-400/40 text-amber-300 text-[10px] font-semibold">Action Required</span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.025] ring-1 ring-white/5">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 ring-1 ring-amber-400/30 grid place-items-center"><Hammer className="h-4 w-4 text-amber-300" /></div>
            <div className="leading-snug">
              <div className="text-[12.5px] font-semibold text-white">Maintenance Approval</div>
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
            <button className="px-3 py-1.5 rounded-md bg-emerald-500/15 ring-1 ring-emerald-400/40 text-emerald-300 text-[11.5px] font-semibold hover:bg-emerald-500/25 flex items-center justify-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
            <button className="px-3 py-1.5 rounded-md bg-rose-500/10 ring-1 ring-rose-400/40 text-rose-300 text-[11.5px] font-semibold hover:bg-rose-500/20 flex items-center justify-center gap-1.5"><X className="h-3.5 w-3.5" /> Reject</button>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-2 p-3 rounded-lg bg-white/[0.025] ring-1 ring-white/5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Request More Info</div>
          <button className="w-full px-3 py-1.5 rounded-md bg-sky-500/10 ring-1 ring-sky-400/40 text-sky-300 text-[11.5px] font-semibold hover:bg-sky-500/20 flex items-center justify-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Request Info</button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ============================= approvals table ============================= */
function AllApprovalsTable({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="p-5">
      <div className="text-[13.5px] font-semibold text-white mb-3">All Approvals</div>
      <div className="overflow-hidden rounded-lg ring-1 ring-white/5">
        <table className="w-full text-[11.5px]">
          <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/[0.02]">
            <tr>
              <th className="text-left font-semibold px-3 py-2">Step</th>
              <th className="text-left font-semibold px-3 py-2">Role</th>
              <th className="text-left font-semibold px-3 py-2">Approver</th>
              <th className="text-left font-semibold px-3 py-2">Status</th>
              <th className="text-left font-semibold px-3 py-2">Decision Time</th>
              <th className="text-left font-semibold px-3 py-2">Comments</th>
            </tr>
          </thead>
          <tbody>
            {APPROVALS.map((a) => {
              const m = STATUS_META[a.status];
              const isAction = a.status === "action";
              return (
                <tr key={a.id} onClick={() => onOpen("step-" + a.id)}
                    className={`border-t border-white/[0.04] cursor-pointer hover:bg-white/[0.03] ${isAction ? "bg-amber-500/[0.06]" : ""}`}>
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
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-5 mt-4 text-[10.5px] text-slate-400 flex-wrap">
        {(["approved","action","pending","notstarted","rejected"] as Status[]).map((s) => {
          const m = STATUS_META[s];
          return (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${m.dot}`} /> {s === "action" ? "Pending (Action Required)" : m.label}
            </span>
          );
        })}
      </div>
    </GlassCard>
  );
}

/* ============================= right column ============================= */
function DecisionSummary({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="p-4">
      <div className="text-[13.5px] font-semibold text-white mb-3">Decision Summary</div>
      <div className="text-[10.5px] uppercase tracking-wider text-slate-500">AI Recommendation</div>
      <div className="text-[20px] font-bold text-emerald-300">Maintain Tonight</div>
      <div className="text-[11px] text-slate-400">10:00 PM – 2:00 AM · May 23, 2025</div>
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

function CommentsPanel() {
  const [text, setText] = useState("");
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Comments & Discussions</div>
        <button className="text-[10.5px] text-sky-300 hover:text-sky-200">View All</button>
      </div>
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {COMMENTS.map((c) => (
          <div key={c.who} className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 grid place-items-center text-white text-[10px] font-bold shrink-0">{c.initials}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11.5px] font-semibold text-white truncate">{c.who} <span className="text-slate-400 font-normal">({c.dept})</span></div>
                <div className="text-[10px] text-slate-500 shrink-0">{c.time}</div>
              </div>
              <div className="text-[11.5px] text-slate-300 mt-0.5">{c.text}</div>
              <div className="flex items-center gap-3 mt-1 text-[10.5px] text-slate-500">
                <button className="hover:text-slate-300 inline-flex items-center gap-1">👍 1</button>
                <button className="hover:text-sky-300">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/[0.025] ring-1 ring-white/5 px-2">
        <Paperclip className="h-3.5 w-3.5 text-slate-500" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent py-2 text-[12px] text-white placeholder:text-slate-500 outline-none" />
        <button className="h-7 w-7 rounded-md bg-sky-500/15 ring-1 ring-sky-400/40 text-sky-300 grid place-items-center hover:bg-sky-500/25"><Send className="h-3.5 w-3.5" /></button>
      </div>
    </GlassCard>
  );
}

function AuditTrailPanel() {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Audit Trail</div>
        <button className="text-[10.5px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">View Full Audit Log <ArrowRight className="h-3 w-3" /></button>
      </div>
      <div className="space-y-2">
        {AUDIT.map((e, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <e.icon className={`h-3.5 w-3.5 ${e.color} shrink-0`} />
              <div className="text-[11.5px] text-slate-200 truncate">{e.text}</div>
            </div>
            <div className="text-[10px] text-slate-500 shrink-0">{e.time}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ============================= footer governance ============================= */
function GovernanceFooter({ onOpen }: { onOpen: (id: string) => void }) {
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
              { icon: Lock,       k: "All actions are logged", v: "and auditable" },
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
function KnowledgeDrawer({ topic, onClose }: { topic: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<"100" | "200" | "300">("100");
  const open = !!topic;
  const title = useMemo(() => {
    if (!topic) return "";
    if (topic.startsWith("step-")) {
      const a = APPROVALS.find((x) => x.id === topic.slice(5));
      return a ? `${a.name} — ${a.dept}` : "Approval Step";
    }
    if (topic === "policy") return "Maintenance Decision Policy v2.1";
    if (topic.startsWith("comp-")) return topic.slice(5);
    if (topic.startsWith("kpi-")) return topic.slice(4);
    if (topic === "etch217") return "ETCH-217 · Applied Materials Centura®";
    return "Governance Detail";
  }, [topic]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.aside
            initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] z-50 bg-[#0b0f1a] border-l border-white/10 flex flex-col"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 font-semibold">Governance Detail</div>
                <div className="text-[15px] font-semibold text-white mt-0.5">{title}</div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] grid place-items-center text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
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
                  <p><span className="text-white font-semibold">Why approval is needed.</span> AI recommends tonight's window to avoid an $0.24M revenue exposure and preserve customer commitments. Final decision remains with Site Leadership.</p>
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
              <button className="px-3 py-1.5 rounded-md bg-emerald-500/15 ring-1 ring-emerald-400/40 text-emerald-300 text-[11.5px] font-semibold hover:bg-emerald-500/25 inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
              <button className="px-3 py-1.5 rounded-md bg-sky-500/10 ring-1 ring-sky-400/40 text-sky-300 text-[11.5px] font-semibold hover:bg-sky-500/20 inline-flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Request Info</button>
              <button className="ml-auto px-3 py-1.5 rounded-md bg-white/[0.04] ring-1 ring-white/10 text-slate-300 text-[11.5px] font-semibold hover:bg-white/[0.08] inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Export</button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================= page ============================= */
export default function HumanGovernanceCenter() {
  const [drawer, setDrawer] = useState<string | null>(null);
  const nav = useNavigate();
  const onOpen = (id: string) => {
    if (id === "back") { nav("/sead/ai-maintenance-decision-center"); return; }
    setDrawer(id);
  };
  return (
    <div className="min-h-screen text-slate-100 bg-[radial-gradient(1200px_700px_at_15%_-10%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(900px_500px_at_85%_-5%,rgba(168,85,247,0.08),transparent_60%),linear-gradient(180deg,#070a13_0%,#080c17_100%)]">
      <AppHeader />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 px-6 py-6 grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-9 space-y-5">
            <EquipmentStrip onOpen={onOpen} />
            <ApprovalWorkflow onOpen={onOpen} />
            <MyApprovalTask />
            <AllApprovalsTable onOpen={onOpen} />
            <GovernanceFooter onOpen={onOpen} />
          </div>
          <div className="col-span-12 xl:col-span-3 space-y-5">
            <DecisionSummary onOpen={onOpen} />
            <CommentsPanel />
            <AuditTrailPanel />
          </div>
        </main>
      </div>
      <KnowledgeDrawer topic={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}
