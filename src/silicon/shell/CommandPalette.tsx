// Global command palette — Ctrl/Cmd+K. Uses the local search index.

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSiliconStore } from "@/silicon/state/SiliconStore";
import { useRepository } from "@/silicon/data/repository";
import type { EntityKind } from "@/silicon/domain/types";

export const CommandPalette: React.FC = () => {
  const open = useSiliconStore(s => s.navigationState.paletteOpen);
  const setOpen = useSiliconStore(s => s.setPaletteOpen);
  const openDrawer = useSiliconStore(s => s.openDrawer);
  const repo = useRepository();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => { if (open) { setQ(""); setCursor(0); setTimeout(() => inputRef.current?.focus(), 10); } }, [open]);

  const index = useMemo(() => repo.searchIndex(), [repo]);
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return index.slice(0, 30);
    return index.filter(x => x.id.toLowerCase().includes(term) || x.label.toLowerCase().includes(term) || (x.hint ?? "").toLowerCase().includes(term)).slice(0, 60);
  }, [q, index]);

  const commit = (kind: EntityKind, id: string) => { openDrawer(kind, id, "summary"); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0">
        <div className="border-b border-slate-200 p-2">
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setCursor(0); }}
            onKeyDown={e => {
              if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(results.length - 1, c + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
              else if (e.key === "Enter") { const r = results[cursor]; if (r) commit(r.kind, r.id); }
              else if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search requirements, defects, tests, modules, formal properties, people…"
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-1" role="listbox">
          {results.length === 0 && <li className="p-3 text-xs text-slate-400">No matches.</li>}
          {results.map((r, i) => (
            <li key={r.kind + r.id}
                role="option"
                aria-selected={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => commit(r.kind, r.id)}
                className={`flex cursor-pointer items-center justify-between rounded px-2 py-1 text-xs ${i === cursor ? "bg-sky-50" : "hover:bg-slate-50"}`}>
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">{r.kind}</span>
                <span className="text-slate-800">{r.label}</span>
              </div>
              {r.hint && <span className="text-slate-400">{r.hint}</span>}
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-100 px-3 py-1 text-[10px] text-slate-400">
          ↑↓ navigate · Enter open · Esc close
        </div>
      </DialogContent>
    </Dialog>
  );
};
