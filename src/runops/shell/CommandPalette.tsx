// Global command palette. Opens from top bar and via ⌘K / Ctrl+K.
// Search queries the OperationsProvider-derived catalog. Results navigate
// to the destination route.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import { useOperations } from "@/runops/state/RunOpsProviders";
import {
  buildSearchCatalog, filterResults, type EntityType, type SearchResult,
} from "@/runops/search/searchCatalog";

interface Ctx { open: boolean; setOpen: (v: boolean) => void; toggle: () => void }
const CommandPaletteContext = createContext<Ctx | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>;
}

export function useCommandPalette(): Ctx {
  const c = useContext(CommandPaletteContext);
  if (!c) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return c;
}

const groupOrder: EntityType[] = [
  "Incident", "Service", "Runbook", "Execution", "Digital Worker",
  "SLO", "Change", "Problem", "Component", "Knowledge", "Evidence", "Connector",
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const ops = useOperations();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const catalog = useMemo(() => buildSearchCatalog(ops), [ops]);
  const results = useMemo(() => filterResults(catalog, q), [catalog, q]);

  const grouped = useMemo(() => {
    const map = new Map<EntityType, SearchResult[]>();
    results.forEach((r) => {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    });
    return groupOrder
      .map((t) => [t, map.get(t) ?? []] as const)
      .filter(([, arr]) => arr.length > 0);
  }, [results]);

  const go = (r: SearchResult) => {
    setOpen(false);
    setQ("");
    navigate(r.route);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={q}
        onValueChange={setQ}
        placeholder="Search services, runbooks, incidents, workers, evidence…"
      />
      <CommandList>
        <CommandEmpty>No results for “{q}”.</CommandEmpty>
        {grouped.map(([type, items]) => (
          <CommandGroup key={type} heading={type}>
            {items.map((r) => (
              <CommandItem
                key={`${r.type}:${r.id}`}
                value={`${r.type} ${r.title} ${r.keywords}`}
                onSelect={() => go(r)}
                className="flex items-start gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-slate-900">{r.title}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10.5px] text-slate-500">
                    <span>{r.type}</span>
                    {r.status && <span>· {r.status}</span>}
                    {r.service && <span>· {r.service}</span>}
                    <span>· {r.source}</span>
                    <span>· {r.freshness}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">{r.route}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
