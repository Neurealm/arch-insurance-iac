import * as React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { CommercialGuideContent } from "./types";
import { useCommercialGuide } from "./CommercialGuideProvider";
import { searchGuide } from "./guideText";

export function CommercialGuideSearch({ guide }: { guide: CommercialGuideContent }) {
  const { search, setSearch } = useCommercialGuide();
  const results = React.useMemo(() => searchGuide(guide, search), [guide, search]);
  const active = search.trim().length >= 2;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search this guide"
          aria-label="Search this guide"
          className="h-9 pl-8 text-sm"
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {active ? `${results.length} result${results.length === 1 ? "" : "s"} found.` : ""}
      </p>
      {active && (
        <div className="rounded-md border border-border">
          <p className="border-b border-border px-3 py-1.5 text-xs font-medium text-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No matches in this guide.</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto px-3 py-2">
              {results.slice(0, 25).map((r, i) => (
                <li key={`${r.group}-${r.heading}-${i}`} className="text-xs">
                  <span className="font-medium text-foreground">{r.group} · {r.heading}</span>
                  {r.body && <span className="text-muted-foreground"> — {r.body.slice(0, 140)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
