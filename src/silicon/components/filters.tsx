// Filter framework — shared filters synchronize all components on a page via
// the global store. FilterBar renders chip controls and writes into the store.

import React from "react";
import { useSiliconStore } from "@/silicon/state/SiliconStore";
import type { ActiveFilters, FilterKey } from "@/silicon/domain/types";

export function useFilters(): [ActiveFilters, (key: keyof ActiveFilters, value: string | string[] | undefined) => void, () => void] {
  const filters = useSiliconStore(s => s.activeFilters);
  const set = useSiliconStore(s => s.setFilter);
  const clear = useSiliconStore(s => s.setFilters);
  return [filters, set, () => clear({})];
}

export interface FilterOption { value: string; label: string; }
export interface FilterDefinition { key: FilterKey; label: string; options: FilterOption[]; }

export const FilterBar: React.FC<{ definitions: FilterDefinition[] }> = ({ definitions }) => {
  const [filters, setFilter, clearAll] = useFilters();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
      {definitions.map(def => {
        const current = filters[def.key];
        const value = Array.isArray(current) ? current[0] : (current ?? "");
        return (
          <label key={def.key} className="flex items-center gap-1 text-xs text-slate-600">
            <span>{def.label}</span>
            <select
              className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs"
              value={value as string}
              onChange={e => setFilter(def.key, e.target.value || undefined)}
            >
              <option value="">any</option>
              {def.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        );
      })}
      <button onClick={() => clearAll()} className="ml-auto rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50">Clear</button>
    </div>
  );
};
