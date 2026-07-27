import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { useAccess } from "@/platform/access/AccessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingState, ErrorState, EmptyState, ForbiddenState, sanitizeError, errorMessage } from "@/platform/components/States";
import {
  usePlacements, useNarratives, useUpsertPlacement, useDeletePlacement, type PlacementRow,
} from "./data";

const ANY = "__any__";
const AUDIENCES = ["all", "executive", "technical", "operations", "accessibility"];
const VARIANTS = ["icon", "button", "inline", "toolbar"];

type Draft = {
  id?: string;
  narrative_id: string;
  placement_key: string;
  route_pattern: string;
  page_key: string;
  section_key: string;
  component_key: string;
  audience: string;
  button_label: string;
  display_variant: string;
  is_enabled: boolean;
  sort_order: string;
};

const EMPTY: Draft = {
  narrative_id: "", placement_key: "", route_pattern: "", page_key: "", section_key: "",
  component_key: "", audience: "all", button_label: "", display_variant: "icon",
  is_enabled: true, sort_order: "0",
};

/** A route pattern is linkable when it contains no dynamic parameters. */
function staticRoute(pattern: string | null): string | null {
  if (!pattern) return null;
  return pattern.includes(":") || pattern.includes("*") ? null : pattern;
}

export default function PlacementMap() {
  const { activeTenantId, hasPermission } = useAccess();
  const placements = usePlacements(activeTenantId);
  const narratives = useNarratives(activeTenantId);
  const upsert = useUpsertPlacement();
  const remove = useDeletePlacement();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState(ANY);
  const [enabledFilter, setEnabledFilter] = useState(ANY);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [pendingDelete, setPendingDelete] = useState<PlacementRow | null>(null);

  const canManage = hasPermission("audio.placement.manage") || hasPermission("audio.admin");
  const canView = canManage || hasPermission("audio.view");

  const modules = useMemo(
    () => [...new Set((placements.data ?? []).map((p) => p.module_key))].sort(),
    [placements.data],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (placements.data ?? []).filter((p) => {
      if (moduleFilter !== ANY && p.module_key !== moduleFilter) return false;
      if (enabledFilter !== ANY && String(p.is_enabled) !== enabledFilter) return false;
      if (!q) return true;
      return `${p.call_id} ${p.placement_key} ${p.route_pattern ?? ""} ${p.page_key ?? ""} ${p.section_key ?? ""} ${p.component_key ?? ""}`
        .toLowerCase().includes(q);
    });
  }, [placements.data, search, moduleFilter, enabledFilter]);

  if (!canView) return <ForbiddenState permission="audio.view" />;
  if (placements.isLoading) return <LoadingState label="Loading placements…" />;
  if (placements.error) return <ErrorState error={placements.error} onRetry={() => placements.refetch()} />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const edit = (p: PlacementRow) => {
    setDraft({
      id: p.id,
      narrative_id: p.narrative_id,
      placement_key: p.placement_key,
      route_pattern: p.route_pattern ?? "",
      page_key: p.page_key ?? "",
      section_key: p.section_key ?? "",
      component_key: p.component_key ?? "",
      audience: p.audience,
      button_label: p.button_label ?? "",
      display_variant: p.display_variant,
      is_enabled: p.is_enabled,
      sort_order: String(p.sort_order ?? 0),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!activeTenantId) return;
    const narrative = narratives.data?.find((n) => n.id === draft.narrative_id);
    if (!narrative) { toast.error("Select a narrative for this placement."); return; }
    try {
      await upsert.mutateAsync({
        id: draft.id,
        tenant_id: activeTenantId,
        narrative_id: draft.narrative_id,
        placement_key: draft.placement_key.trim(),
        call_id: narrative.call_id,
        module_key: narrative.module_key,
        route_pattern: draft.route_pattern.trim() || null,
        page_key: draft.page_key.trim() || null,
        section_key: draft.section_key.trim() || null,
        component_key: draft.component_key.trim() || null,
        audience: draft.audience,
        button_label: draft.button_label.trim() || null,
        display_variant: draft.display_variant,
        is_enabled: draft.is_enabled,
        sort_order: Number(draft.sort_order) || 0,
      });
      toast.success(draft.id ? "Placement updated" : "Placement created");
      setOpen(false);
    } catch (err) {
      toast.error(sanitizeError(errorMessage(err)));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success("Placement removed");
    } catch (err) {
      toast.error(sanitizeError(errorMessage(err)));
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Placement map</h2>
          <p className="text-xs text-muted-foreground">
            Where each narrative surfaces across NeuGAIN.io routes, pages, sections, and components.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setDraft(EMPTY); setOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" /><span>New placement</span>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search placements"
            className="pl-8"
            placeholder="Search by call ID, key, route, page, section, or component"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by module"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All modules</SelectItem>
            {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={enabledFilter} onValueChange={setEnabledFilter}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by state"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any state</SelectItem>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} placements</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No placements" description="Add a placement to surface a narrative on a page." />
            </div>
          ) : (
            <Table>
              <caption className="sr-only">Narrative placements</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Page / Section / Component</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Button</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => {
                  const route = staticRoute(p.route_pattern);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link className="font-mono text-xs underline" to={`/platform/audio/narratives/${p.narrative_id}`}>
                          {p.call_id}
                        </Link>
                        <div className="font-mono text-[10px] text-muted-foreground">{p.placement_key}</div>
                      </TableCell>
                      <TableCell className="text-xs">{p.module_key}</TableCell>
                      <TableCell className="text-xs">
                        {route ? (
                          <Link to={route} className="inline-flex items-center gap-1 underline">
                            {route}<ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        ) : (p.route_pattern ?? "—")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {[p.page_key, p.section_key, p.component_key].filter(Boolean).join(" / ") || "—"}
                      </TableCell>
                      <TableCell className="text-xs">{p.audience}</TableCell>
                      <TableCell className="text-xs">{p.button_label ?? "—"}</TableCell>
                      <TableCell className="text-xs">{p.display_variant}</TableCell>
                      <TableCell>
                        <Badge variant={p.is_enabled ? "default" : "outline"}>{p.is_enabled ? "enabled" : "disabled"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {canManage && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => edit(p)}>
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Edit {p.placement_key}</span>
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setPendingDelete(p)}>
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">Delete {p.placement_key}</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{draft.id ? "Edit placement" : "New placement"}</SheetTitle>
            <SheetDescription>The call ID and module are inherited from the linked narrative.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="pl-narrative">Narrative</Label>
              <Select value={draft.narrative_id} onValueChange={(v) => set("narrative_id", v)} disabled={!!draft.id}>
                <SelectTrigger id="pl-narrative"><SelectValue placeholder="Select a narrative" /></SelectTrigger>
                <SelectContent>
                  {(narratives.data ?? []).map((n) => (
                    <SelectItem key={n.id} value={n.id}>{n.call_id} · {n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pl-key">Placement key</Label>
              <Input id="pl-key" className="font-mono" value={draft.placement_key} onChange={(e) => set("placement_key", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pl-route">Route pattern</Label>
              <Input id="pl-route" value={draft.route_pattern} onChange={(e) => set("route_pattern", e.target.value)} placeholder="/commercial/model/pnl" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="pl-page">Page</Label>
                <Input id="pl-page" value={draft.page_key} onChange={(e) => set("page_key", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pl-section">Section</Label>
                <Input id="pl-section" value={draft.section_key} onChange={(e) => set("section_key", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pl-component">Component</Label>
                <Input id="pl-component" value={draft.component_key} onChange={(e) => set("component_key", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pl-audience">Audience</Label>
                <Select value={draft.audience} onValueChange={(v) => set("audience", v)}>
                  <SelectTrigger id="pl-audience"><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pl-variant">Display variant</Label>
                <Select value={draft.display_variant} onValueChange={(v) => set("display_variant", v)}>
                  <SelectTrigger id="pl-variant"><SelectValue /></SelectTrigger>
                  <SelectContent>{VARIANTS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pl-label">Button label</Label>
                <Input id="pl-label" value={draft.button_label} onChange={(e) => set("button_label", e.target.value)} placeholder="Listen" />
              </div>
              <div>
                <Label htmlFor="pl-sort">Sort order</Label>
                <Input id="pl-sort" type="number" value={draft.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch id="pl-enabled" checked={draft.is_enabled} onCheckedChange={(v) => set("is_enabled", v)} />
              <Label htmlFor="pl-enabled">Enabled</Label>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending || !draft.narrative_id || !draft.placement_key.trim()}>
              Save placement
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this placement?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.placement_key} will no longer surface {pendingDelete?.call_id} on that page.
              The narrative itself is not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
