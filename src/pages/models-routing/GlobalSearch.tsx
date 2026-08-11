// Global search across models, providers, routing policies, guardrails and
// evaluations. Selecting a result opens the corresponding inspection drawer.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { MODELS, PROVIDERS, POLICIES, GUARDRAILS, EVALUATIONS } from "./data";

export type SearchHit = { group: string; label: string; sub: string; drawer: string };

const CATALOG: SearchHit[] = [
  ...MODELS.map((m) => ({ group: "Models", label: m.name, sub: `${m.provider} · ${m.reasoning} · ${m.contextWindow}`, drawer: `model:${m.id}` })),
  ...PROVIDERS.map((p) => ({ group: "Providers", label: p.name, sub: `${p.regions} · ${p.status}`, drawer: `provider:${p.id}` })),
  ...POLICIES.map((p) => ({ group: "Routing Policies", label: p.name, sub: `${p.intent} · ${p.primary}`, drawer: `policy:${p.id}` })),
  ...GUARDRAILS.map((g) => ({ group: "Guardrails", label: g.name, sub: `${g.policies} policies · ${g.enforced}`, drawer: `guardrail:${g.id}` })),
  ...EVALUATIONS.map((e) => ({ group: "Evaluations", label: `${e.model} evaluation`, sub: `${e.suite} · ${e.date}`, drawer: `eval:${e.model}` })),
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
    return hits.reduce<Record<string, SearchHit[]>>((acc, h) => {
      (acc[h.group] ||= []).push(h);
      return acc;
    }, {});
  }, [q]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[75] flex justify-center bg-slate-900/30 pt-[12vh]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search the model routing plane"
        className="h-fit max-h-[70vh] w-full max-w-[640px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search models, providers, routing policies, guardrails…"
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
                  className={cn("flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-slate-50")}>
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
