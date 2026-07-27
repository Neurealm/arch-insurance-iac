import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Play, Save, Square } from "lucide-react";
import { useAccess } from "@/platform/access/AccessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LoadingState, ErrorState, sanitizeError } from "@/platform/components/States";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { VariablePreviewPanel } from "./VariablePreviewPanel";
import { useVariableRegistry } from "../variables/useVariableRegistry";
import { buildRegistry } from "../variables/registry";
import type { CaeVariableContext } from "../variables/types";
import {
  useNarratives, useNarrativeVersions, useSpeechProfiles, usePronunciationRules,
  useCreateNarrative, useUpdateNarrative, useSaveDraftVersion,
  useCreateDraftVersion,
} from "./data";
import {
  countWords, estimateDurationSeconds, formatDuration,
  isValidCallId, parseCallId, toRuntimeProfile, toRuntimeRules, useDraftPreview,
} from "./helpers";


const NONE = "__none__";
const SCOPE_TYPES = ["page", "record", "section", "global"];
const AUDIENCES = ["all", "executive", "technical", "operations", "accessibility"];
const LOCALES = ["en-US", "en-GB", "en-IN", "fr-FR", "de-DE", "es-ES"];

type FormState = {
  callId: string;
  name: string;
  description: string;
  scopeType: string;
  scopeReference: string;
  audience: string;
  locale: string;
  speechProfileId: string;
  sourceText: string;
  speechText: string;
  changeSummary: string;
};

const EMPTY: FormState = {
  callId: "", name: "", description: "", scopeType: "page", scopeReference: "",
  audience: "all", locale: "en-US", speechProfileId: NONE,
  sourceText: "", speechText: "", changeSummary: "",
};

export default function NarrativeEditor() {
  const { narrativeId } = useParams<{ narrativeId: string }>();
  const isNew = !narrativeId;
  const navigate = useNavigate();
  const { activeTenantId } = useAccess();

  const narratives = useNarratives(activeTenantId);
  const versions = useNarrativeVersions(activeTenantId, narrativeId);
  const profiles = useSpeechProfiles(activeTenantId);
  const rules = usePronunciationRules(activeTenantId);
  const variables = useVariableDefinitions(activeTenantId);

  const createNarrative = useCreateNarrative();
  const updateNarrative = useUpdateNarrative();
  const saveDraft = useSaveDraftVersion();
  const createDraft = useCreateDraftVersion();
  const preview = useDraftPreview();

  const narrative = narratives.data?.find((n) => n.id === narrativeId) ?? null;
  const draft = (versions.data ?? []).find((v) => v.status === "draft") ?? null;
  const latest = (versions.data ?? [])[0] ?? null;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isNew || hydrated || !narrative) return;
    const base = draft ?? latest;
    setForm({
      callId: narrative.call_id,
      name: narrative.name,
      description: narrative.description ?? "",
      scopeType: narrative.scope_type,
      scopeReference: narrative.scope_reference ?? "",
      audience: narrative.audience,
      locale: narrative.default_locale,
      speechProfileId: base?.speech_profile_id ?? narrative.speech_profile_id ?? NONE,
      sourceText: base?.source_text ?? "",
      speechText: base?.speech_text ?? "",
      changeSummary: draft?.change_summary ?? "",
    });
    setHydrated(true);
  }, [isNew, hydrated, narrative, draft, latest]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const parsed = parseCallId(form.callId);
  const profile = profiles.data?.find((p) => p.id === form.speechProfileId) ?? null;
  const spokenText = form.speechText.trim() || form.sourceText;
  const words = countWords(spokenText);
  const duration = estimateDurationSeconds(spokenText, Number(profile?.rate ?? 1));
  const tokens = useMemo(() => extractVariableTokens(`${form.sourceText} ${form.speechText}`), [form.sourceText, form.speechText]);
  const knownTokens = new Set((variables.data ?? []).map((v) => v.variable_key));

  const callIdError = form.callId && !isValidCallId(form.callId)
    ? "Use the format CAE.MODULE.TOPIC.001."
    : null;
  const canSave = form.name.trim().length > 2 && form.sourceText.trim().length > 0
    && (!isNew || (!!parsed && !callIdError));

  const runPreview = () => {
    if (preview.state === "speaking") {
      preview.stop();
      return;
    }
    void preview.speak(
      spokenText,
      toRuntimeProfile(profile),
      toRuntimeRules(rules.data, parsed?.moduleKey ?? narrative?.module_key),
    );
  };

  const submit = async () => {
    if (!activeTenantId || !canSave) return;
    try {
      if (isNew) {
        const id = await createNarrative.mutateAsync({
          tenantId: activeTenantId,
          callId: form.callId.trim(),
          name: form.name.trim(),
          moduleKey: parsed!.moduleKey,
          topicKey: parsed!.topicKey,
          description: form.description.trim() || null,
          scopeType: form.scopeType,
          scopeReference: form.scopeReference.trim() || null,
          audience: form.audience,
          locale: form.locale,
          speechProfileId: form.speechProfileId === NONE ? null : form.speechProfileId,
          sourceText: form.sourceText,
          speechText: form.speechText.trim() || null,
          changeSummary: form.changeSummary.trim() || null,
          estimatedDurationSeconds: duration,
        });
        toast.success("Draft narrative created");
        navigate(`/platform/audio/narratives/${id}`);
        return;
      }

      await updateNarrative.mutateAsync({
        id: narrativeId!,
        name: form.name.trim(),
        description: form.description.trim() || null,
        scope_type: form.scopeType,
        scope_reference: form.scopeReference.trim() || null,
        audience: form.audience,
        default_locale: form.locale,
        default_speech_profile_id: form.speechProfileId === NONE ? null : form.speechProfileId,
      });

      const payload = {
        source_text: form.sourceText,
        speech_text: form.speechText.trim() || null,
        change_summary: form.changeSummary.trim() || null,
        speech_profile_id: form.speechProfileId === NONE ? null : form.speechProfileId,
        estimated_duration_seconds: duration,
      };

      if (draft) {
        await saveDraft.mutateAsync({ versionId: draft.id, ...payload });
      } else {
        await createDraft.mutateAsync({
          tenantId: activeTenantId,
          narrativeId: narrativeId!,
          versionNo: (latest?.version_no ?? 0) + 1,
          ...payload,
        });
      }
      toast.success("Draft saved");
      navigate(`/platform/audio/narratives/${narrativeId}`);
    } catch (err) {
      toast.error(sanitizeError(err instanceof Error ? err.message : String(err)));
    }
  };

  if (!isNew && (narratives.isLoading || versions.isLoading)) return <LoadingState label="Loading editor…" />;
  if (narratives.error) return <ErrorState error={narratives.error} onRetry={() => narratives.refetch()} />;

  const busy = createNarrative.isPending || updateNarrative.isPending || saveDraft.isPending || createDraft.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={isNew ? "/platform/audio" : `/platform/audio/narratives/${narrativeId}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /><span>Back</span>
            </Link>
          </Button>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            {isNew ? "New narrative" : `Edit ${narrative?.call_id ?? ""}`}
          </h2>
        </div>
        <Button onClick={submit} disabled={!canSave || busy}>
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{isNew ? "Create draft" : "Save draft"}</span>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="ed-call">Call ID</Label>
              <Input
                id="ed-call"
                value={form.callId}
                readOnly={!isNew}
                aria-readonly={!isNew}
                onChange={(e) => set("callId", e.target.value.toUpperCase())}
                placeholder="CAE.MODULE.TOPIC.001"
                className={!isNew ? "bg-muted font-mono" : "font-mono"}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {isNew
                  ? "Module and topic are derived from the call ID and locked permanently."
                  : "Call IDs are immutable once created."}
              </p>
              {callIdError && <p className="mt-1 text-xs text-destructive" role="alert">{callIdError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ed-module">module_key</Label>
                <Input id="ed-module" readOnly aria-readonly value={parsed?.moduleKey ?? narrative?.module_key ?? ""} className="bg-muted font-mono" />
              </div>
              <div>
                <Label htmlFor="ed-topic">topic_key</Label>
                <Input id="ed-topic" readOnly aria-readonly value={parsed?.topicKey ?? narrative?.topic_key ?? ""} className="bg-muted font-mono" />
              </div>
            </div>
            <div>
              <Label htmlFor="ed-name">Name</Label>
              <Input id="ed-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={160} />
            </div>
            <div>
              <Label htmlFor="ed-desc">Description</Label>
              <Textarea id="ed-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={600} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ed-scope">Scope type</Label>
                <Select value={form.scopeType} onValueChange={(v) => set("scopeType", v)}>
                  <SelectTrigger id="ed-scope"><SelectValue /></SelectTrigger>
                  <SelectContent>{SCOPE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ed-scoperef">Scope reference</Label>
                <Input id="ed-scoperef" value={form.scopeReference} onChange={(e) => set("scopeReference", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ed-audience">Audience</Label>
                <Select value={form.audience} onValueChange={(v) => set("audience", v)}>
                  <SelectTrigger id="ed-audience"><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ed-locale">Locale</Label>
                <Select value={form.locale} onValueChange={(v) => set("locale", v)}>
                  <SelectTrigger id="ed-locale"><SelectValue /></SelectTrigger>
                  <SelectContent>{LOCALES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="ed-profile">Speech profile</Label>
              <Select value={form.speechProfileId} onValueChange={(v) => set("speechProfileId", v)}>
                <SelectTrigger id="ed-profile"><SelectValue placeholder="Select a profile" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No profile</SelectItem>
                  {(profiles.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Content</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="ed-source">Source text</Label>
                <Textarea id="ed-source" rows={8} value={form.sourceText} onChange={(e) => set("sourceText", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ed-speech">Speech optimised text</Label>
                <Textarea
                  id="ed-speech" rows={6} value={form.speechText}
                  onChange={(e) => set("speechText", e.target.value)}
                  placeholder="Optional. When empty, the source text is spoken."
                />
              </div>
              <div>
                <Label htmlFor="ed-summary">Change summary</Label>
                <Input id="ed-summary" value={form.changeSummary} onChange={(e) => set("changeSummary", e.target.value)} maxLength={240} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground" role="status" aria-live="polite">
                <span>{words} words</span>
                <span>Estimated listening time {formatDuration(duration)}</span>
              </div>

              <div>
                <span className="text-xs font-medium text-foreground">Dynamic variable tokens</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {tokens.length === 0 && <span className="text-xs text-muted-foreground">None referenced.</span>}
                  {tokens.map((t) => (
                    <Badge key={t} variant={knownTokens.has(t) ? "secondary" : "outline"}>
                      {`{{${t}}}`}{knownTokens.has(t) ? "" : " · unregistered"}
                    </Badge>
                  ))}
                </div>
                {(variables.data ?? []).length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Available: {(variables.data ?? []).map((v) => v.variable_key).join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={runPreview} disabled={!preview.isSupported || !spokenText.trim()}>
                  {preview.state === "speaking"
                    ? <><Square className="h-4 w-4" aria-hidden="true" /><span>Stop preview</span></>
                    : <><Play className="h-4 w-4" aria-hidden="true" /><span>Preview playback</span></>}
                </Button>
                {!preview.isSupported && (
                  <span className="text-xs text-muted-foreground">
                    This browser cannot speak text. The transcript preview below is still accurate.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TranscriptPanel
                title="Transcript preview"
                transcript={spokenText || null}
                estimatedDurationSeconds={duration || null}
                isSpeechUnavailable={!preview.isSupported}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
