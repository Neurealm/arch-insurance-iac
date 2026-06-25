import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, Activity, Zap, Cpu, AlertTriangle, Clock, Users, Network as NetIcon, FileText, Wrench } from "lucide-react";
import { BUILDINGS, STATUS_COLOR } from "./buildings";
import { useTwinStore } from "./store";

/* Right-side selection drawer. Slides in when a building is selected.
   Uses placeholder content sections matching the Prompt-1 drawer schema. */

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "status", label: "Current Status", icon: Activity },
  { id: "impact", label: "Business Impact", icon: Zap },
  { id: "tech", label: "Technical Details", icon: Cpu },
  { id: "deps", label: "Dependencies", icon: NetIcon },
  { id: "trends", label: "Historical Trends", icon: Clock },
  { id: "ai", label: "AI Summary", icon: AlertTriangle },
  { id: "actions", label: "Actions", icon: Wrench },
  { id: "related", label: "Related Objects", icon: Users },
  { id: "notes", label: "Notes & Timeline", icon: FileText },
];

export function SelectionDrawer() {
  const { selectedId, setSelected } = useTwinStore();
  const b = BUILDINGS.find((x) => x.id === selectedId);
  const open = Boolean(b);
  return (
    <AnimatePresence>
      {open && b && (
        <motion.aside
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed right-3 top-[80px] bottom-3 w-[360px] z-50 rounded-xl border border-white/[0.08] bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-start gap-3">
            <div
              className="h-9 w-9 rounded-lg grid place-items-center shrink-0"
              style={{
                background: STATUS_COLOR[b.status] + "22",
                border: `1px solid ${STATUS_COLOR[b.status]}55`,
                boxShadow: `0 0 18px -8px ${STATUS_COLOR[b.status]}`,
              }}
            >
              <Building2 className="h-4 w-4" style={{ color: STATUS_COLOR[b.status] }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white truncate">{b.name}</div>
              <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="font-mono">{b.id}</span> · {b.owner} · {b.criticality}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="h-7 w-7 grid place-items-center rounded-md text-slate-400 hover:bg-white/[0.05] hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* status strip */}
          <div className="px-4 py-3 border-b border-white/[0.06] grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Util", v: `${b.utilization}%` },
              { l: "Health", v: `${b.health}` },
              { l: "Power", v: `${b.powerMW.toFixed(1)} MW` },
            ].map((m) => (
              <div key={m.l} className="rounded-md bg-white/[0.025] border border-white/[0.05] py-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{m.l}</div>
                <div className="text-[13px] font-semibold text-white tabular-nums">{m.v}</div>
              </div>
            ))}
          </div>

          {/* sections (placeholder content) */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {SECTIONS.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/[0.03] cursor-pointer transition"
              >
                <s.icon className="h-3.5 w-3.5 text-sky-300" />
                <div className="flex-1 text-[12px] text-slate-200">{s.label}</div>
                <span className="text-[10px] text-slate-500">→</span>
              </div>
            ))}
            <div className="px-3 mt-3 text-[10.5px] text-slate-500 leading-relaxed">
              Drawer content placeholder. Equipment, live telemetry, work orders, and AI summaries will populate in Prompt&nbsp;3 when the building is instrumented.
            </div>
          </div>

          <div className="border-t border-white/[0.06] p-3 flex items-center gap-2">
            <button className="flex-1 h-8 rounded-md bg-sky-500/15 border border-sky-400/30 text-[11.5px] text-sky-200 hover:bg-sky-500/25">
              Open Building Dashboard
            </button>
            <button className="h-8 px-3 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11.5px] text-slate-200 hover:bg-white/[0.08]">
              Fly To
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
