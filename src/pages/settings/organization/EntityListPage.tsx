import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ORG_LEVELS, levelBySlug } from "@/config/orgLevels";
import { useOrgList, useOrgMutations, type OrgRecord } from "@/hooks/org/useOrgEntity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { EntityFormDialog } from "@/components/org/EntityFormDialog";
import { Badge } from "@/components/ui/badge";

export default function EntityListPage() {
  const { levelSlug = "" } = useParams();
  const cfg = levelBySlug(levelSlug);
  if (!cfg) return <div className="p-6">Unknown level</div>;

  const [params, setParams] = useSearchParams();
  const parentFilter = cfg.parentFk ? params.get("parent") : null;
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OrgRecord | null>(null);
  const [toDelete, setToDelete] = useState<OrgRecord | null>(null);

  const list = useOrgList(cfg.key, parentFilter || undefined);
  const parentList = useOrgList(cfg.parent ?? "business_units");
  const { remove } = useOrgMutations(cfg.key);

  const parentMap = useMemo(() => {
    const m: Record<string, string> = {};
    (parentList.data ?? []).forEach((p) => (m[p.id] = p.name));
    return m;
  }, [parentList.data]);

  const filtered = useMemo(() => {
    const data = list.data ?? [];
    if (!q.trim()) return data;
    const s = q.toLowerCase();
    return data.filter(
      (r) =>
        r.name?.toLowerCase().includes(s) ||
        r.short_name?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s),
    );
  }, [list.data, q]);

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy text-white grid place-items-center">
            <cfg.icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{cfg.label}</h1>
            <p className="text-xs text-muted-foreground">
              Manage {cfg.label.toLowerCase()} in the operating model.
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add {cfg.singular}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${cfg.label.toLowerCase()}...`}
            className="pl-8"
          />
        </div>
        {cfg.parent && cfg.parentFk && (
          <Select
            value={parentFilter ?? "__all"}
            onValueChange={(v) => {
              const p = new URLSearchParams(params);
              if (v === "__all") p.delete("parent");
              else p.set("parent", v);
              setParams(p, { replace: true });
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder={`Filter by ${ORG_LEVELS[cfg.parent].singular}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All {ORG_LEVELS[cfg.parent].label}</SelectItem>
              {(parentList.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Short Name</TableHead>
              {cfg.parent && <TableHead>{ORG_LEVELS[cfg.parent].singular}</TableHead>}
              <TableHead>Tagline</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No {cfg.label.toLowerCase()} found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/settings/organization/${cfg.slug}/${r.id}`}
                      className="hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.short_name || "—"}</TableCell>
                  {cfg.parent && cfg.parentFk && (
                    <TableCell className="text-muted-foreground">
                      {parentMap[(r as any)[cfg.parentFk] as string] || "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground max-w-[260px] truncate">
                    {r.tagline || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(r.keywords ?? []).slice(0, 3).map((k) => (
                        <Badge key={k} variant="outline" className="text-[10px]">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title="View">
                        <Link to={`/settings/organization/${cfg.slug}/${r.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => {
                          setEditing(r);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => setToDelete(r)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EntityFormDialog
        level={cfg.key}
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        defaultParentId={parentFilter}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {cfg.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{toDelete?.name}". Records with children cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (toDelete) await remove.mutateAsync(toDelete.id);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}