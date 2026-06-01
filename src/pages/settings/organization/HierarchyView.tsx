import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ORG_LEVELS, ORG_LEVEL_ORDER, type OrgLevelKey } from "@/config/orgLevels";
import { ChevronRight, ChevronDown, Network as NetworkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const db = supabase as unknown as { from: (t: string) => any };

type Row = { id: string; name: string; parent?: string | null };

function useAllLevels() {
  return useQuery({
    queryKey: ["org", "hierarchy", "all"],
    queryFn: async () => {
      const result: Record<OrgLevelKey, Row[]> = {} as any;
      await Promise.all(
        ORG_LEVEL_ORDER.map(async (k) => {
          const cfg = ORG_LEVELS[k];
          const cols = cfg.parentFk ? `id,name,${cfg.parentFk}` : "id,name";
          const { data, error } = await db.from(cfg.table).select(cols).order("name");
          if (error) throw error;
          result[k] = (data ?? []).map((r: any) => ({
            id: r.id,
            name: r.name,
            parent: cfg.parentFk ? r[cfg.parentFk] : null,
          }));
        }),
      );
      return result;
    },
  });
}

export default function HierarchyView() {
  const { data, isLoading } = useAllLevels();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const childrenIndex = useMemo(() => {
    const idx: Record<OrgLevelKey, Record<string, Row[]>> = {} as any;
    if (!data) return idx;
    ORG_LEVEL_ORDER.forEach((k) => {
      const map: Record<string, Row[]> = {};
      data[k].forEach((r) => {
        const p = r.parent ?? "__root";
        (map[p] = map[p] ?? []).push(r);
      });
      idx[k] = map;
    });
    return idx;
  }, [data]);

  const toggleAll = (v: boolean) => {
    if (!data) return;
    const next: Record<string, boolean> = {};
    ORG_LEVEL_ORDER.forEach((k) => data[k].forEach((r) => (next[`${k}:${r.id}`] = v)));
    setOpen(next);
  };

  if (isLoading || !data) return <div className="p-6 text-muted-foreground">Loading hierarchy...</div>;

  const matchesSearch = (name: string) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase());

  const renderNode = (level: OrgLevelKey, row: Row, depth: number) => {
    const cfg = ORG_LEVELS[level];
    const Icon = cfg.icon;
    const childKey = cfg.child;
    const kids = childKey ? childrenIndex[childKey][row.id] ?? [] : [];
    const key = `${level}:${row.id}`;
    const isOpen = open[key] ?? !!q.trim();
    const highlight = q.trim() && matchesSearch(row.name);

    return (
      <div key={key}>
        <div
          className="flex items-center gap-1 py-1 hover:bg-muted/40 rounded px-1"
          style={{ paddingLeft: depth * 18 + 4 }}
        >
          {kids.length > 0 ? (
            <button
              onClick={() => setOpen((p) => ({ ...p, [key]: !isOpen }))}
              className="h-5 w-5 grid place-items-center text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="h-5 w-5" />
          )}
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <Link
            to={`/settings/organization/${cfg.slug}/${row.id}`}
            className={cn(
              "text-sm hover:underline",
              highlight && "bg-yellow-200/40 dark:bg-yellow-300/10 px-1 rounded",
            )}
          >
            {row.name}
          </Link>
          {kids.length > 0 && (
            <span className="text-[10px] text-muted-foreground ml-1">({kids.length})</span>
          )}
        </div>
        {isOpen && childKey && kids.map((c) => renderNode(childKey, c, depth + 1))}
      </div>
    );
  };

  const buRoots = childrenIndex.business_units["__root"] ?? data.business_units;
  const practiceRoots = childrenIndex.practices["__root"] ?? data.practices;

  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center">
          <NetworkIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Hierarchy View</h1>
          <p className="text-xs text-muted-foreground">
            Full operating model tree from Business Units down to Tasks.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Input
          placeholder="Search nodes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>Expand all</Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>Collapse all</Button>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border bg-card p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Business Units
          </div>
          {buRoots.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 text-sm">
              No business units yet.
            </div>
          ) : (
            buRoots.map((r) => renderNode("business_units", r, 0))
          )}
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Practices
          </div>
          {practiceRoots.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 text-sm">
              No practices yet.
            </div>
          ) : (
            practiceRoots.map((r) => renderNode("practices", r, 0))
          )}
        </div>
      </div>
    </div>
  );
}