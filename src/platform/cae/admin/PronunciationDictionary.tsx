import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Play, Square, Search } from "lucide-react";
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
  usePronunciationRules, useUpsertPronunciation, useDeletePronunciation,
  useSpeechProfiles, type PronunciationRow,
} from "./data";
import { toRuntimeProfile, useDraftPreview } from "./helpers";

const ANY = "__any__";
const GLOBAL = "__global__";
const LOCALES = ["en-US", "en-GB", "en-IN", "fr-FR", "de-DE", "es-ES"];

type Draft = {
  id?: string;
  match_text: string;
  match_type: string;
  replacement_text: string;
  locale: string;
  module_key: string;
  scope: string;
  priority: string;
  is_enabled: boolean;
};

const EMPTY: Draft = {
  match_text: "", match_type: "word", replacement_text: "", locale: ANY,
  module_key: "", scope: "global", priority: "100", is_enabled: true,
};

export default function PronunciationDictionary() {
  const { activeTenantId, hasPermission } = useAccess();
  const rules = usePronunciationRules(activeTenantId);
  const profiles = useSpeechProfiles(activeTenantId);
  const upsert = useUpsertPronunciation();
  const remove = useDeletePronunciation();
  const preview = useDraftPreview();

  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState(ANY);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [pendingDelete, setPendingDelete] = useState<PronunciationRow | null>(null);

  const canManage = hasPermission("audio.pronunciation.manage") || hasPermission("audio.admin");
  const canView = canManage || hasPermission("audio.view");
  const defaultProfile = (profiles.data ?? []).find((p) => p.is_default) ?? (profiles.data ?? [])[0];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rules.data ?? []).filter((r) => {
      if (scopeFilter === GLOBAL && r.module_key) return false;
      if (scopeFilter !== ANY && scopeFilter !== GLOBAL && r.module_key !== scopeFilter) return false;
      if (!q) return true;
      return `${r.match_text} ${r.replacement_text}`.toLowerCase().includes(q);
    });
  }, [rules.data, search, scopeFilter]);

  const modules = useMemo(
    () => [...new Set((rules.data ?? []).map((r) => r.module_key).filter(Boolean) as string[])].sort(),
    [rules.data],
  );

  if (!canView) return <ForbiddenState permission="audio.view" />;
  if (rules.isLoading) return <LoadingState label="Loading pronunciation rules…" />;
  if (rules.error) return <ErrorState error={rules.error} onRetry={() => rules.refetch()} />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const speak = (text: string) => {
    if (preview.state === "speaking") { preview.stop(); return; }
    void preview.speak(text, toRuntimeProfile(defaultProfile), []);
  };

  const save = async () => {
    if (!activeTenantId) return;
    try {
      await upsert.mutateAsync({
        id: draft.id,
        tenant_id: activeTenantId,
        match_text: draft.match_text.trim(),
        match_type: draft.match_type,
        replacement_text: draft.replacement_text.trim(),
        locale: draft.locale === ANY ? null : draft.locale,
        module_key: draft.module_key.trim() || null,
        scope: draft.module_key.trim() ? "module" : "global",
        priority: Number(draft.priority) || 100,
        is_enabled: draft.is_enabled,
      });
      toast.success(draft.id ? "Rule updated" : "Rule created");
      setOpen(false);
    } catch (err) {
      toast.error(sanitizeError(errorMessage(err)));
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success("Rule removed");
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
          <h2 className="text-lg font-semibold text-foreground">Pronunciation dictionary</h2>
          <p className="text-xs text-muted-foreground">
            Centralised spoken replacements applied to every narration before playback.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setDraft(EMPTY); setOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" /><span>New rule</span>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search pronunciation rules"
            className="pl-8"
            placeholder="Search written term or spoken replacement"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={scopeFilter} onValueChange={setScopeFilter}>
          <SelectTrigger className="w-[200px]" aria-label="Filter by module scope"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All scopes</SelectItem>
            <SelectItem value={GLOBAL}>Global only</SelectItem>
            {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} rules</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No pronunciation rules" description="Add a rule so acronyms and product names are spoken correctly." />
            </div>
          ) : (
            <Table>
              <caption className="sr-only">Pronunciation rules</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Written term</TableHead>
                  <TableHead>Spoken replacement</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Module scope</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.match_text}</TableCell>
                    <TableCell className="text-xs">{r.replacement_text}</TableCell>
                    <TableCell className="text-xs">{r.match_type}</TableCell>
                    <TableCell className="text-xs">{r.locale ?? "any"}</TableCell>
                    <TableCell className="text-xs">{r.module_key ?? "global"}</TableCell>
                    <TableCell className="text-xs">{r.priority}</TableCell>
                    <TableCell>
                      <Badge variant={r.is_enabled ? "default" : "outline"}>{r.is_enabled ? "enabled" : "disabled"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" disabled={!preview.isSupported} onClick={() => speak(r.replacement_text)}>
                          {preview.state === "speaking"
                            ? <Square className="h-4 w-4" aria-hidden="true" />
                            : <Play className="h-4 w-4" aria-hidden="true" />}
                          <span className="sr-only">Preview {r.match_text}</span>
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => {
                                setDraft({
                                  id: r.id,
                                  match_text: r.match_text,
                                  match_type: r.match_type,
                                  replacement_text: r.replacement_text,
                                  locale: r.locale ?? ANY,
                                  module_key: r.module_key ?? "",
                                  scope: r.scope,
                                  priority: String(r.priority),
                                  is_enabled: r.is_enabled,
                                });
                                setOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Edit {r.match_text}</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setPendingDelete(r)}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Delete {r.match_text}</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{draft.id ? "Edit rule" : "New pronunciation rule"}</SheetTitle>
            <SheetDescription>Leave the module blank to apply the rule platform wide.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="pr-term">Written term</Label>
              <Input id="pr-term" value={draft.match_text} onChange={(e) => set("match_text", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pr-replacement">Spoken replacement</Label>
              <Input id="pr-replacement" value={draft.replacement_text} onChange={(e) => set("replacement_text", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pr-type">Match type</Label>
                <Select value={draft.match_type} onValueChange={(v) => set("match_type", v)}>
                  <SelectTrigger id="pr-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="word">Whole word</SelectItem>
                    <SelectItem value="exact">Exact text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pr-locale">Locale</Label>
                <Select value={draft.locale} onValueChange={(v) => set("locale", v)}>
                  <SelectTrigger id="pr-locale"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any locale</SelectItem>
                    {LOCALES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pr-module">Module scope</Label>
                <Input id="pr-module" value={draft.module_key} onChange={(e) => set("module_key", e.target.value)} placeholder="Blank = global" />
              </div>
              <div>
                <Label htmlFor="pr-priority">Priority</Label>
                <Input id="pr-priority" type="number" value={draft.priority} onChange={(e) => set("priority", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch id="pr-enabled" checked={draft.is_enabled} onCheckedChange={(v) => set("is_enabled", v)} />
              <Label htmlFor="pr-enabled">Enabled</Label>
            </div>
            <Button
              type="button" variant="outline" className="w-full"
              disabled={!preview.isSupported || !draft.replacement_text.trim()}
              onClick={() => speak(draft.replacement_text)}
            >
              {preview.state === "speaking"
                ? <><Square className="h-4 w-4" aria-hidden="true" /><span>Stop preview</span></>
                : <><Play className="h-4 w-4" aria-hidden="true" /><span>Preview replacement</span></>}
            </Button>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending || !draft.match_text.trim() || !draft.replacement_text.trim()}>
              Save rule
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this pronunciation rule?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.match_text}” will be spoken as written from the next playback onward.
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
