import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Play, Square, Search } from "lucide-react";
import { useAccess } from "@/platform/access/AccessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { LoadingState, ErrorState, EmptyState, ForbiddenState, sanitizeError } from "@/platform/components/States";
import {
  useSpeechProfiles, useUpsertSpeechProfile, usePronunciationRules, type SpeechProfileRow,
} from "./data";
import { toRuntimeProfile, toRuntimeRules, useDraftPreview } from "./helpers";

const NONE = "__none__";
const LOCALES = ["en-US", "en-GB", "en-IN", "fr-FR", "de-DE", "es-ES"];
const SAMPLE = "NeuGAIN delivers governed EBITDA insight with clear, measured narration.";

type Draft = {
  id?: string;
  profile_key: string;
  display_name: string;
  description: string;
  locale: string;
  fallback_locale: string;
  preferred_voice_names: string;
  rate: string;
  pitch: string;
  volume: string;
  is_default: boolean;
  is_enabled: boolean;
  fallback_profile_id: string;
};

const EMPTY: Draft = {
  profile_key: "", display_name: "", description: "", locale: "en-US", fallback_locale: "en",
  preferred_voice_names: "", rate: "1", pitch: "1", volume: "1",
  is_default: false, is_enabled: true, fallback_profile_id: NONE,
};

function toDraft(row: SpeechProfileRow & { fallback_profile_id?: string | null }): Draft {
  return {
    id: row.id,
    profile_key: row.profile_key,
    display_name: row.display_name,
    description: row.description ?? "",
    locale: row.locale,
    fallback_locale: row.fallback_locale ?? "en",
    preferred_voice_names: (row.preferred_voice_names ?? []).join(", "),
    rate: String(row.rate ?? 1),
    pitch: String(row.pitch ?? 1),
    volume: String(row.volume ?? 1),
    is_default: !!row.is_default,
    is_enabled: !!row.is_enabled,
    fallback_profile_id: row.fallback_profile_id ?? NONE,
  };
}

export default function SpeechProfileManager() {
  const { activeTenantId, hasPermission } = useAccess();
  const profiles = useSpeechProfiles(activeTenantId);
  const rules = usePronunciationRules(activeTenantId);
  const upsert = useUpsertSpeechProfile();
  const preview = useDraftPreview();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const canManage = hasPermission("audio.profile.manage") || hasPermission("audio.admin");
  const canView = canManage || hasPermission("audio.view");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (profiles.data ?? []).filter(
      (p) => !q || `${p.display_name} ${p.profile_key} ${p.locale}`.toLowerCase().includes(q),
    );
  }, [profiles.data, search]);

  if (!canView) return <ForbiddenState permission="audio.view" />;
  if (profiles.isLoading) return <LoadingState label="Loading speech profiles…" />;
  if (profiles.error) return <ErrorState error={profiles.error} onRetry={() => profiles.refetch()} />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const previewProfile = (row: SpeechProfileRow) => {
    if (preview.state === "speaking") { preview.stop(); return; }
    void preview.speak(SAMPLE, toRuntimeProfile(row), toRuntimeRules(rules.data));
  };

  const save = async () => {
    if (!activeTenantId) return;
    try {
      await upsert.mutateAsync({
        id: draft.id,
        tenant_id: activeTenantId,
        profile_key: draft.profile_key.trim(),
        display_name: draft.display_name.trim(),
        description: draft.description.trim() || null,
        locale: draft.locale,
        fallback_locale: draft.fallback_locale.trim() || "en",
        preferred_voice_names: draft.preferred_voice_names
          .split(",").map((s) => s.trim()).filter(Boolean),
        rate: Number(draft.rate) || 1,
        pitch: Number(draft.pitch) || 1,
        volume: Number(draft.volume) || 1,
        is_default: draft.is_default,
        is_enabled: draft.is_enabled,
        ...(draft.fallback_profile_id === NONE
          ? { fallback_profile_id: null }
          : { fallback_profile_id: draft.fallback_profile_id }),
      } as never);
      toast.success(draft.id ? "Profile updated" : "Profile created");
      setOpen(false);
    } catch (err) {
      toast.error(sanitizeError(err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Speech profiles</h2>
          <p className="text-xs text-muted-foreground">
            Reusable delivery settings shared by every narrative across NeuGAIN.io.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setDraft(EMPTY); setOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" /><span>New profile</span>
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="Search speech profiles"
          className="pl-8"
          placeholder="Search by name, key, or locale"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">{rows.length} profiles</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No speech profiles" description="Create a profile to control voice, rate, pitch, and volume." />
            </div>
          ) : (
            <Table>
              <caption className="sr-only">Speech profiles for the active workspace</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Preferred voices</TableHead>
                  <TableHead>Rate / Pitch / Volume</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{p.display_name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{p.profile_key}</div>
                    </TableCell>
                    <TableCell className="text-xs">Browser speech synthesis</TableCell>
                    <TableCell className="text-xs">{p.locale} → {p.fallback_locale}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-xs">
                      {(p.preferred_voice_names ?? []).join(", ") || "Any available voice"}
                    </TableCell>
                    <TableCell className="text-xs">{Number(p.rate)} / {Number(p.pitch)} / {Number(p.volume)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.is_default && <Badge variant="secondary">default</Badge>}
                        <Badge variant={p.is_enabled ? "default" : "outline"}>{p.is_enabled ? "enabled" : "disabled"}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => previewProfile(p)} disabled={!preview.isSupported}>
                          {preview.state === "speaking"
                            ? <Square className="h-4 w-4" aria-hidden="true" />
                            : <Play className="h-4 w-4" aria-hidden="true" />}
                          <span className="sr-only">Preview {p.display_name}</span>
                        </Button>
                        {canManage && (
                          <Button size="sm" variant="ghost" onClick={() => { setDraft(toDraft(p)); setOpen(true); }}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Edit {p.display_name}</span>
                          </Button>
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{draft.id ? "Edit speech profile" : "New speech profile"}</SheetTitle>
            <SheetDescription>Delivery settings apply to every narrative assigned to this profile.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="sp-key">Profile key</Label>
              <Input id="sp-key" value={draft.profile_key} disabled={!!draft.id}
                onChange={(e) => set("profile_key", e.target.value)} className="font-mono" />
            </div>
            <div>
              <Label htmlFor="sp-name">Profile name</Label>
              <Input id="sp-name" value={draft.display_name} onChange={(e) => set("display_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sp-desc">Delivery guidance</Label>
              <Textarea id="sp-desc" rows={3} value={draft.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="sp-locale">Locale</Label>
                <Select value={draft.locale} onValueChange={(v) => set("locale", v)}>
                  <SelectTrigger id="sp-locale"><SelectValue /></SelectTrigger>
                  <SelectContent>{LOCALES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sp-fallback-locale">Fallback locale</Label>
                <Input id="sp-fallback-locale" value={draft.fallback_locale} onChange={(e) => set("fallback_locale", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sp-voices">Preferred voice criteria</Label>
              <Input id="sp-voices" value={draft.preferred_voice_names}
                onChange={(e) => set("preferred_voice_names", e.target.value)}
                placeholder="Google US English, Samantha" />
              <p className="mt-1 text-xs text-muted-foreground">Comma separated, in priority order.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="sp-rate">Rate</Label>
                <Input id="sp-rate" type="number" step="0.05" min="0.5" max="2" value={draft.rate} onChange={(e) => set("rate", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sp-pitch">Pitch</Label>
                <Input id="sp-pitch" type="number" step="0.05" min="0" max="2" value={draft.pitch} onChange={(e) => set("pitch", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sp-volume">Volume</Label>
                <Input id="sp-volume" type="number" step="0.05" min="0" max="1" value={draft.volume} onChange={(e) => set("volume", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sp-fallback">Fallback profile</Label>
              <Select value={draft.fallback_profile_id} onValueChange={(v) => set("fallback_profile_id", v)}>
                <SelectTrigger id="sp-fallback"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No fallback</SelectItem>
                  {(profiles.data ?? []).filter((p) => p.id !== draft.id).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch id="sp-default" checked={draft.is_default} onCheckedChange={(v) => set("is_default", v)} />
                <Label htmlFor="sp-default">Default profile</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="sp-enabled" checked={draft.is_enabled} onCheckedChange={(v) => set("is_enabled", v)} />
                <Label htmlFor="sp-enabled">Enabled</Label>
              </div>
            </div>
            <Button
              type="button" variant="outline" className="w-full"
              disabled={!preview.isSupported}
              onClick={() => {
                if (preview.state === "speaking") { preview.stop(); return; }
                void preview.speak(SAMPLE, {
                  profileKey: draft.profile_key || "preview",
                  displayName: draft.display_name || "Preview",
                  locale: draft.locale,
                  fallbackLocale: draft.fallback_locale || "en",
                  preferredVoiceNames: draft.preferred_voice_names.split(",").map((s) => s.trim()).filter(Boolean),
                  rate: Number(draft.rate) || 1,
                  pitch: Number(draft.pitch) || 1,
                  volume: Number(draft.volume) || 1,
                }, toRuntimeRules(rules.data));
              }}
            >
              {preview.state === "speaking"
                ? <><Square className="h-4 w-4" aria-hidden="true" /><span>Stop preview</span></>
                : <><Play className="h-4 w-4" aria-hidden="true" /><span>Preview this profile</span></>}
            </Button>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending || !draft.display_name.trim() || !draft.profile_key.trim()}>
              Save profile
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
