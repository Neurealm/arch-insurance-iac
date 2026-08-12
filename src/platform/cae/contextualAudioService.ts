import { supabase } from "@/integrations/supabase/client";
import {
  isValidCaeCallId,
  type CaeFailureStatus,
  type CaePlacement,
  type CaePronunciationRule,
  type CaeResolveResult,
  type CaeSpeechProfile,
} from "./types";

const FAILURE_STATUSES: readonly CaeFailureStatus[] = [
  "invalid_call_id",
  "narrative_not_found",
  "narrative_unavailable",
  "unauthorized",
  "no_published_version",
  "invalid_speech_configuration",
  "unsupported_context",
];

const DEFAULT_MESSAGES: Record<CaeFailureStatus, string> = {
  invalid_call_id: "Call ID must match CAE.<MODULE>.<TOPIC>.<SEQUENCE>.",
  narrative_not_found: "No narrative exists for this call ID.",
  narrative_unavailable: "This narrative is not currently available.",
  unauthorized: "You do not have access to this narrative.",
  no_published_version: "This narrative has no active published version.",
  invalid_speech_configuration: "No enabled speech profile is available for this narrative.",
  unsupported_context: "The requested placement context is not available.",
};

function fail(status: CaeFailureStatus, message?: string): CaeResolveResult {
  return { status, message: message ?? DEFAULT_MESSAGES[status] };
}

function num(value: unknown, fallback: number): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : fallback;
}

function normaliseProfile(raw: Record<string, unknown>): CaeSpeechProfile {
  return {
    profileKey: String(raw.profileKey ?? ""),
    displayName: String(raw.displayName ?? ""),
    locale: String(raw.locale ?? "en-US"),
    fallbackLocale: String(raw.fallbackLocale ?? "en"),
    preferredVoiceNames: Array.isArray(raw.preferredVoiceNames)
      ? (raw.preferredVoiceNames as unknown[]).map(String)
      : [],
    rate: num(raw.rate, 1),
    pitch: num(raw.pitch, 1),
    volume: num(raw.volume, 1),
  };
}

/**
 * Query key factory for CAE runtime reads.
 *
 * The active tenant id is part of the key so a cached resolution can never be
 * served to a session operating in a different tenant. The call id and
 * placement key complete the identity of the cached entry.
 */
export function caeQueryKey(
  tenantId: string | null,
  callId: string,
  placementKey?: string | null,
) {
  return ["cae", tenantId, callId, placementKey ?? null] as const;
}

/**
 * Resolves one contextual audio call.
 *
 * Only the call ID and an optional placement key cross the boundary; tenant,
 * user, role, and permission resolution happen entirely inside
 * `audio_resolve_call`, using the session already trusted by the application.
 */
export async function resolveContextualAudio(
  callId: string,
  placementKey?: string | null,
): Promise<CaeResolveResult> {
  if (!isValidCaeCallId(callId)) return fail("invalid_call_id");
  if (placementKey !== undefined && placementKey !== null) {
    if (typeof placementKey !== "string" || placementKey.trim() === "" || placementKey.length > 128) {
      return fail("unsupported_context", "The supplied placement identifier is not valid.");
    }
  }

  const { data, error } = await supabase.rpc("audio_resolve_call", {
    _call_id: callId,
    _placement_key: placementKey ?? null,
  } as never);

  if (error) {
    // A transport or authorization failure is a "nothing to play here" outcome,
    // not an application fault: signed-out visitors and users without the
    // narrative permission must see clear wording rather than a retry prompt.
    const code = String((error as { code?: string }).code ?? "");
    const message = String(error.message ?? "");
    const denied =
      code === "42501" ||
      code === "PGRST301" ||
      /401|403|jwt|permission denied|not authorized|unauthorized/i.test(message);
    return fail(denied ? "unauthorized" : "narrative_unavailable");
  }

  const payload = (data ?? null) as Record<string, unknown> | null;
  if (!payload || typeof payload.status !== "string") {
    return fail("narrative_not_found");
  }

  const status = payload.status as string;

  if (status === "ok") {
    const narrative = (payload.narrative ?? {}) as Record<string, unknown>;
    const version = (payload.version ?? {}) as Record<string, unknown>;
    const profileRaw = payload.speechProfile as Record<string, unknown> | null;
    if (!profileRaw) return fail("invalid_speech_configuration");

    const speechText = String(version.speechText ?? version.sourceText ?? "");
    if (!speechText.trim()) return fail("no_published_version");

    return {
      status: "ok",
      narrative: {
        callId: String(narrative.callId ?? callId),
        title: String(narrative.title ?? ""),
        description: (narrative.description as string | null) ?? null,
        moduleKey: String(narrative.moduleKey ?? ""),
        topicKey: String(narrative.topicKey ?? ""),
        audience: String(narrative.audience ?? "all"),
        scopeType: String(narrative.scopeType ?? "page"),
        scopeReference: (narrative.scopeReference as string | null) ?? null,
      },
      version: {
        versionNo: num(version.versionNo, 1),
        sourceText: String(version.sourceText ?? speechText),
        speechText,
        transcriptText: String(version.transcriptText ?? version.sourceText ?? speechText),
        estimatedDurationSeconds:
          version.estimatedDurationSeconds === null || version.estimatedDurationSeconds === undefined
            ? null
            : num(version.estimatedDurationSeconds, 0),
        publishedAt: (version.publishedAt as string | null) ?? null,
      },
      speechProfile: normaliseProfile(profileRaw),
      pronunciationRules: Array.isArray(payload.pronunciationRules)
        ? (payload.pronunciationRules as CaePronunciationRule[])
        : [],
      placement: (payload.placement as CaePlacement | null) ?? null,
    };
  }

  if ((FAILURE_STATUSES as readonly string[]).includes(status)) {
    return fail(status as CaeFailureStatus, payload.message as string | undefined);
  }

  return fail("narrative_not_found");
}
