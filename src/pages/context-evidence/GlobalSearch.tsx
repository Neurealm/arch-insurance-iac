// Global page search across sources, entities, schemas, policies and indexes.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { SOURCES, ENTITIES, POLICIES, STORAGE } from "./data";
import { Search } from "lucide-react";

interface Result { group: string; label: string; sub: string; route: string }

export function GlobalSearch({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (route: string) => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => { if (open) { setQ(""); setIdx(0); } }, [open]);

  const all: Result[] = useMemo(() => [
    ...SOURCES.map((s) => ({ group: "Sources", label: s.name, sub: `${s.connector} · ${s.domain}`, route: `/context-evidence/overview?drawer=${s.id}` })),
    ...ENTITIES.map((e) => ({ group: "Entities", label: e.name, sub: `${e.count} · ${e.domain}`, route: `/context-evidence/overview?entity=${e.id}` })),
    ...SOURCES.map((s) => ({ group: "Schemas", label: `${s.name} → canonical`, sub: "Schema mapping", route: `/context-evidence/overview?drawer=${s.id}&tab=schemas` })),
    ...POLICIES.map((p) => ({ group: "Policies", label: p.name, sub: `${p.count} policies · ${p.state}`, route: `/context-evidence/overview?policy=${p.id}` })),
    ...STORAGE.map((s) => ({ group: "Indexes", label: s.name, sub: `${s.gb} GB · ${s.pct}%`, route: `/context-evidence/overview?index=${s.id}` })),
  ], []);

  const results = useMemo(() => {
    if (!q.trim()) return all.slice(0, 8);
    const t = q.toLowerCase();
    return all.filter((r) => r.label.toLowerCase().includes(t) || r.sub.toLowerCase().includes(t)).slice(0, 24);
  }, [q, all]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(results.length - 1, i + 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
      if (e.key === "Enter" && results[idx]) onSelect(results[idx].route);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, results, idx, onClose, onSelect]);

  if (!open) return null;

  const groups = Array.from(new Set(results.map((r) => r.group)));

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search platform configuration">
      <div className="absolute inset-0 bg-slate-900/25" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-[620px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            placeholder="Search sources, entities, policies, schemas, indexes..."
            className="h-11 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400" />
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1">
          {results.length === 0 && <div className="px-4 py-6 text-center text-[12px] text-slate-500">No configuration objects match “{q}”.</div>}
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{g}</div>
              {results.filter((r) => r.group === g).map((r) => {
                const i = results.indexOf(r);
                return (
                  <button key={r.route + r.label} onMouseEnter={() => setIdx(i)} onClick={() => onSelect(r.route)}
                    className={cn("flex w-full items-center justify-between px-3 py-1.5 text-left", i === idx ? "bg-blue-50" : "hover:bg-slate-50")}>
                    <span className="text-[12.5px] text-slate-800">{r.label}</span>
                    <span className="text-[11px] text-slate-500">{r.sub}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-slate-200 px-3 py-1.5 text-[10.5px] text-slate-500">
          <span>↑ ↓ navigate · Enter open · Esc close</span><span>Tenant: DUAL Insurance Group</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
