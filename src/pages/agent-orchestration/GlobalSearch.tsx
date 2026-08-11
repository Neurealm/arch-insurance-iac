// Global search across workflows, pipeline stages, policy families, tool
// bindings and handoffs. Selecting a result opens the matching drawer.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { WORKFLOWS, PIPELINE, POLICY_FAMILIES, TOOL_BINDINGS, HANDOFFS } from "./data";

export type SearchHit = { group: string; label: string; sub: string; drawer: string };

const CATALOG: SearchHit[] = [
  ...WORKFLOWS.map((w) => ({ group: "Workflows", label: w.name, sub: `${w.domain} · ${w.orchestrator} · ${w.version}`, drawer: `workflow:${w.id}` })),
  ...PIPELINE.map((p) => ({ group: "Pipeline Stages", label: p.name, sub: p.headline, drawer: `stage:${p.id}` })),
  ...POLICY_FAMILIES.map((p) => ({ group: "Policy Families", label: p.category, sub: `${p.count} policies · ${p.status}`, drawer: `policy:${p.id}` })),
  ...TOOL_BINDINGS.map((t) => ({ group: "Tool Bindings", label: t.name, sub: `${t.mode} · ${t.workflows} workflows`, drawer: `tool:${t.id}` })),
  ...HANDOFFS.map((h) => ({ group: "Handoffs", label: `${h.source} → ${h.destination}`, sub: h.kind, drawer: `handoff:${h.id}` })),
];

export function GlobalSearch({
  open, onClose, onSelect,
}: { open: boolean; onClose: () => void; onSelect: (drawer: string) => void }) {
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const hits = t ? CATALOG.filter((c) => (c.label + c.sub).toLowerCase().includes(t)) : CATALOG.slice(0, 12);
    return hits.reduce<Record<string, SearchHit[]>>((acc, h) => { (acc[h.group] ||= []).push(h); return acc; }, {});
  }, [q]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[75] flex justify-center bg-slate-900/30 pt-[12vh]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search the orchestration plane"
        className="h-fit max-h-[70vh] w-full max-w-[640px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search workflows, stages, policies, tool bindings, handoffs…"
            className="flex-1 text-[13px] text-slate-800 outline-none placeholder:text-slate-400" />
          <button onClick={onClose} aria-label="Close search" className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1">
          {Object.keys(groups).length === 0 && (
            <div className="px-4 py-6 text-center text-[12px] text-slate-500">No objects match “{q}”.</div>
          )}
          {Object.entries(groups).map(([g, items]) => (
            <div key={g}>
              <div className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{g}</div>
              {items.map((h) => (
                <button key={h.drawer} onClick={() => onSelect(h.drawer)}
                  className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-slate-50">
                  <span className="flex-1 text-[12.5px] text-slate-800">{h.label}</span>
                  <span className="truncate text-[11px] text-slate-500">{h.sub}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
