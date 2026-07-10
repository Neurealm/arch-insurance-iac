// Global quick-view helper. Renders a compact preview for any major entity
// type inside the RightContextDrawer without losing the current page.

import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useCallback } from "react";
import { useRightDrawer } from "@/runops/state/RunOpsProviders";
import type { SearchResult, EntityType } from "@/runops/search/searchCatalog";

export type QuickViewInput = {
  type: EntityType;
  id: string;
  title: string;
  status?: string;
  service?: string;
  source?: string;
  freshness?: string;
  route?: string;
  fields?: { label: string; value: string }[];
};

export function useOpenEntityDrawer() {
  const { openDrawer } = useRightDrawer();
  return useCallback((entity: QuickViewInput) => {
    openDrawer({
      title: `${entity.type}: ${entity.title}`,
      subtitle: [entity.status, entity.service, entity.source].filter(Boolean).join(" · "),
      body: <QuickViewBody entity={entity} />,
    });
  }, [openDrawer]);
}

export function fromSearchResult(r: SearchResult): QuickViewInput {
  return {
    type: r.type, id: r.id, title: r.title, status: r.status,
    service: r.service, source: r.source, freshness: r.freshness, route: r.route,
  };
}

function QuickViewBody({ entity }: { entity: QuickViewInput }) {
  const rows: [string, string | undefined][] = [
    ["ID", entity.id],
    ["Type", entity.type],
    ["Status", entity.status],
    ["Service", entity.service],
    ["Source", entity.source],
    ["Freshness", entity.freshness],
    ...(entity.fields ?? []).map((f) => [f.label, f.value] as [string, string]),
  ];
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-[12px]">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[10.5px] uppercase tracking-wider text-slate-500">{k}</dt>
            <dd className="text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      {entity.route && (
        <Link
          to={entity.route}
          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11.5px] text-slate-800 hover:bg-slate-100"
        >
          <ExternalLink className="h-3 w-3" /> Open full view
        </Link>
      )}
    </div>
  );
}
