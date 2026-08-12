/**
 * Contextual Audio Enrichment — administrative data layer.
 *
 * Every read and write in the CAE Manager goes through this module. There are
 * no hardcoded arrays and no local-only records: the database is the single
 * source of truth, and tenant isolation is enforced by RLS plus the
 * `audio_can_view` / `audio_can_manage` SECURITY DEFINER helpers.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CAE_QK = "platform" as const;

export type NarrativeRow = {
  id: string;
  tenant_id: string;
  call_id: string;
  name: string;
  description: string | null;
  module_key: string;
  topic_key: string;
  scope_type: string;
  scope_reference: string | null;
  audience: string;
  default_locale: string;
  status: string;
  owner_user_id: string | null;
  owner_name: string | null;
  active_version_id: string | null;
  active_version_no: number | null;
  speech_profile_id: string | null;
  speech_profile_name: string | null;
  placement_count: number;
  enabled_placement_count: number;
  version_count: number;
  updated_at: string;
};

export type VersionRow = {
  id: string;
  tenant_id: string;
  narrative_id: string;
  version_no: number;
  source_text: string;
  speech_text: string | null;
  change_summary: string | null;
  status: string;
  speech_profile_id: string | null;
  estimated_duration_seconds: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SpeechProfileRow = {
  id: string;
  tenant_id: string;
  profile_key: string;
  display_name: string;
  description: string | null;
  locale: string;
  fallback_locale: string;
  preferred_voice_names: string[];
  rate: number;
  pitch: number;
  volume: number;
  is_default: boolean;
  is_enabled: boolean;
  fallback_profile_id: string | null;
};

export type PlacementRow = {
  id: string;
  tenant_id: string;
  narrative_id: string;
  placement_key: string;
  call_id: string;
  module_key: string;
  route_pattern: string | null;
  page_key: string | null;
  section_key: string | null;
  component_key: string | null;
  audience: string;
  button_label: string | null;
  display_variant: string;
  is_enabled: boolean;
  sort_order: number;
};

export type PronunciationRow = {
  id: string;
  tenant_id: string;
  match_text: string;
  match_type: string;
  replacement_text: string;
  locale: string | null;
  module_key: string | null;
  scope: string;
  priority: number;
  is_enabled: boolean;
};

export type VariableRow = {
  id: string;
  tenant_id: string;
  variable_key: string;
  module_key: string;
  value_type: string;
  description: string | null;
  is_enabled: boolean;
};

export type PlaybackEventRow = {
  id: string;
  call_id: string | null;
  event_type: string;
  occurred_at: string;
  duration_ms: number | null;
  error_code: string | null;
  browser_supported: boolean | null;
  locale: string | null;
  voice_name: string | null;
  placement_key: string | null;
};

/* ------------------------------------------------------------------ reads */

export function useNarratives(tenantId: string | null) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "narratives", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("audio_admin_list_narratives", {
        _tenant_id: tenantId!,
      });
      if (error) throw error;
      return (data ?? []) as NarrativeRow[];
    },
  });
}

export function useNarrative(tenantId: string | null, narrativeId: string | undefined) {
  const list = useNarratives(tenantId);
  return {
    ...list,
    data: narrativeId ? list.data?.find((n) => n.id === narrativeId) ?? null : null,
  };
}

export function useNarrativeVersions(tenantId: string | null, narrativeId: string | undefined) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "versions", tenantId, narrativeId ?? null],
    enabled: !!tenantId && !!narrativeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_narrative_versions")
        .select(
          "id, tenant_id, narrative_id, version_no, source_text, speech_text, change_summary, status, speech_profile_id, estimated_duration_seconds, published_at, created_at, updated_at",
        )
        .eq("tenant_id", tenantId!)
        .eq("narrative_id", narrativeId!)
        .order("version_no", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VersionRow[];
    },
  });
}

export function useSpeechProfiles(tenantId: string | null) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "profiles", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_speech_profiles")
        .select(
          "id, tenant_id, profile_key, display_name, description, locale, fallback_locale, preferred_voice_names, rate, pitch, volume, is_default, is_enabled, fallback_profile_id",
        )
        .eq("tenant_id", tenantId!)
        .order("display_name");
      if (error) throw error;
      return (data ?? []) as SpeechProfileRow[];
    },
  });
}

export function usePlacements(tenantId: string | null) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "placements", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_placements")
        .select(
          "id, tenant_id, narrative_id, placement_key, call_id, module_key, route_pattern, page_key, section_key, component_key, audience, button_label, display_variant, is_enabled, sort_order",
        )
        .eq("tenant_id", tenantId!)
        .order("call_id")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as PlacementRow[];
    },
  });
}

export function usePronunciationRules(tenantId: string | null) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "pronunciation", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_pronunciation_rules")
        .select(
          "id, tenant_id, match_text, match_type, replacement_text, locale, module_key, scope, priority, is_enabled",
        )
        .eq("tenant_id", tenantId!)
        .order("priority")
        .order("match_text");
      if (error) throw error;
      return (data ?? []) as PronunciationRow[];
    },
  });
}

export function useVariableDefinitions(tenantId: string | null) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "variables", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_variable_definitions")
        .select("id, tenant_id, variable_key, module_key, value_type, description, is_enabled")
        .eq("tenant_id", tenantId!)
        .order("variable_key");
      if (error) throw error;
      return (data ?? []) as VariableRow[];
    },
  });
}

export function usePlaybackEvents(tenantId: string | null) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "playback-events", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_playback_events")
        .select(
          "id, call_id, event_type, occurred_at, duration_ms, error_code, browser_supported, locale, voice_name, placement_key",
        )
        .eq("tenant_id", tenantId!)
        .order("occurred_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as PlaybackEventRow[];
    },
  });
}

export type AudioAnalyticsOverview = {
  status: "ok" | "unauthorized";
  message?: string;
  tenantId?: string;
  windowDays?: number;
  generatedAt?: string;
  totals?: {
    requested: number; started: number; paused: number; resumed: number;
    stopped: number; completed: number; transcripts: number;
    unavailable: number; unsupported: number; errors: number; total: number;
  };
  topNarratives?: Array<{
    call_id: string; title: string | null; module_key: string | null;
    starts: number; completes: number; stops: number; transcripts: number; errors: number;
  }>;
  byModulePage?: Array<{
    module_key: string; page_key: string;
    starts: number; completes: number; transcripts: number; errors: number;
  }>;
  brokenCalls?: Array<{ call_id: string; failures: number; last_seen: string; category: string }>;
  unusedPlacements?: Array<{
    placement_key: string; module_key: string; page_key: string | null;
    call_id: string; title: string | null;
  }>;
  brokenPlacements?: Array<{
    placement_key: string; module_key: string; page_key: string | null;
    call_id: string; reason: string;
  }>;
  versionTrends?: Array<{
    call_id: string; version_no: number; starts: number; completes: number;
    stops: number; errors: number; last_seen: string;
  }>;
};

/**
 * Administrative analytics rollup. All aggregation, tenant scoping, and
 * permission checking happen inside `audio_analytics_overview`; the browser
 * only supplies the workspace it is already operating in and a time window.
 */
export function useAudioAnalyticsOverview(tenantId: string | null, days: number) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "analytics-overview", tenantId, days],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("audio_analytics_overview", {
        _tenant_id: tenantId!,
        _days: days,
      } as never);
      if (error) throw error;
      return (data ?? { status: "unauthorized" }) as unknown as AudioAnalyticsOverview;
    },
  });
}

/* ----------------------------------------------------------------- writes */

export function useCaeInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [CAE_QK, "cae"] });
}

export type CreateNarrativeInput = {
  tenantId: string;
  callId: string;
  name: string;
  moduleKey: string;
  topicKey: string;
  description?: string | null;
  scopeType?: string;
  scopeReference?: string | null;
  audience?: string;
  locale?: string;
  speechProfileId?: string | null;
  sourceText?: string;
  speechText?: string | null;
  changeSummary?: string | null;
  estimatedDurationSeconds?: number | null;
};

export function useCreateNarrative() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: CreateNarrativeInput) => {
      const { data, error } = await supabase.rpc("audio_admin_create_narrative", {
        _tenant_id: input.tenantId,
        _call_id: input.callId,
        _name: input.name,
        _module_key: input.moduleKey,
        _topic_key: input.topicKey,
        _description: input.description ?? null,
        _scope_type: input.scopeType ?? "page",
        _scope_reference: input.scopeReference ?? null,
        _audience: input.audience ?? "all",
        _default_locale: input.locale ?? "en-US",
        _speech_profile_id: input.speechProfileId ?? null,
        _source_text: input.sourceText ?? "",
        _speech_text: input.speechText ?? null,
        _change_summary: input.changeSummary ?? null,
        _estimated_duration_seconds: input.estimatedDurationSeconds ?? null,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: invalidate,
  });
}

export function useDuplicateNarrative() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: { narrativeId: string; newCallId: string; newName: string }) => {
      const { data, error } = await supabase.rpc("audio_admin_duplicate_narrative", {
        _narrative_id: input.narrativeId,
        _new_call_id: input.newCallId,
        _new_name: input.newName,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: invalidate,
  });
}

export function useSetNarrativeStatus() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: { narrativeId: string; status: "retired" | "restore" }) => {
      const { error } = await supabase.rpc("audio_admin_set_narrative_status", {
        _narrative_id: input.narrativeId,
        _status: input.status,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

/** Narrative metadata update. `call_id`, `module_key` and `topic_key` are immutable by design. */
export function useUpdateNarrative() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      description: string | null;
      scope_type: string;
      scope_reference: string | null;
      audience: string;
      default_locale: string;
      default_speech_profile_id: string | null;
    }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("audio_narratives").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveDraftVersion() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: {
      versionId: string;
      source_text: string;
      speech_text: string | null;
      change_summary: string | null;
      speech_profile_id: string | null;
      estimated_duration_seconds: number | null;
    }) => {
      const { versionId, ...patch } = input;
      const { error } = await supabase
        .from("audio_narrative_versions")
        .update(patch)
        .eq("id", versionId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useCreateDraftVersion() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: {
      tenantId: string;
      narrativeId: string;
      versionNo: number;
      source_text: string;
      speech_text: string | null;
      change_summary: string | null;
      speech_profile_id: string | null;
      estimated_duration_seconds: number | null;
    }) => {
      const { data, error } = await supabase
        .from("audio_narrative_versions")
        .insert({
          tenant_id: input.tenantId,
          narrative_id: input.narrativeId,
          version_no: input.versionNo,
          source_text: input.source_text,
          speech_text: input.speech_text,
          change_summary: input.change_summary,
          speech_profile_id: input.speech_profile_id,
          estimated_duration_seconds: input.estimated_duration_seconds,
          status: "draft",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: invalidate,
  });
}

/** Lifecycle transition on a version. Permissions are enforced by the DB trigger. */
export function useSetVersionStatus() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: { versionId: string; status: string }) => {
      const { error } = await supabase
        .from("audio_narrative_versions")
        .update({ status: input.status })
        .eq("id", input.versionId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

/* ------------------------------------------------- CAE.080 lifecycle layer */

export type LifecycleAction = "submit" | "approve" | "reject" | "publish" | "retire";

export type AuditRow = {
  id: string;
  occurred_at: string;
  action_code: string;
  object_type: string;
  object_id: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  previous_status: string | null;
  new_status: string | null;
  version_no: number | null;
  comment: string | null;
};

/**
 * Governed lifecycle transition. Allowed transitions, permission checks,
 * separation of duties and audit capture all happen inside the database.
 */
export function useVersionTransition() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: { versionId: string; action: LifecycleAction; comment?: string | null }) => {
      const { data, error } = await supabase.rpc("audio_version_transition", {
        _version_id: input.versionId,
        _action: input.action,
        _comment: input.comment ?? null,
      });
      if (error) throw error;
      return data as unknown as { status: string; version_no: number };
    },
    onSuccess: invalidate,
  });
}

/** Restore-as-new-draft / edit-published: never mutates the source version. */
export function useCreateDraftFromVersion() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: { sourceVersionId: string; changeSummary?: string | null }) => {
      const { data, error } = await supabase.rpc("audio_version_create_draft_from", {
        _source_version_id: input.sourceVersionId,
        _change_summary: input.changeSummary ?? null,
      });
      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: invalidate,
  });
}

export function useNarrativeAudit(narrativeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [CAE_QK, "cae", "audit", narrativeId ?? null],
    enabled: !!narrativeId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("audio_admin_narrative_audit", {
        _narrative_id: narrativeId!,
      });
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
  });
}

export function useUpsertSpeechProfile() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: Partial<SpeechProfileRow> & { tenant_id: string }) => {
      if (input.id) {
        const { id, tenant_id: _t, ...patch } = input;
        const { error } = await supabase.from("audio_speech_profiles").update(patch).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("audio_speech_profiles")
        .insert(input as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: invalidate,
  });
}

export function useUpsertPlacement() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: Partial<PlacementRow> & { tenant_id: string }) => {
      if (input.id) {
        const { id, tenant_id: _t, call_id: _c, module_key: _m, ...patch } = input;
        const { error } = await supabase.from("audio_placements").update(patch).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("audio_placements")
        .insert(input as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: invalidate,
  });
}

export function useDeletePlacement() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("audio_placements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUpsertPronunciation() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (input: Partial<PronunciationRow> & { tenant_id: string }) => {
      if (input.id) {
        const { id, tenant_id: _t, ...patch } = input;
        const { error } = await supabase.from("audio_pronunciation_rules").update(patch).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("audio_pronunciation_rules")
        .insert(input as never)
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: invalidate,
  });
}

export function useDeletePronunciation() {
  const invalidate = useCaeInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("audio_pronunciation_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
