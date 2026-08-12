/**
 * Contextual Audio Enrichment — privacy-conscious usage telemetry.
 *
 * Design rules enforced here:
 *
 * 1. Only bounded, low-cardinality identifiers leave the browser: call ID,
 *    placement key, module / page / section keys, audience, published version
 *    number, browser capability class, playback state, and an error category.
 * 2. Narrative text, transcript text, resolved variable values, and any
 *    restricted commercial / operational / engineering value are never sent.
 * 3. Tenant and user are resolved server side by `audio_record_event`; the
 *    client cannot claim either.
 * 4. Telemetry is fire-and-forget. Every failure is swallowed so analytics can
 *    never block narrative resolution or speech playback.
 */

import { supabase } from "@/integrations/supabase/client";
import type { CaeFailureStatus, CaeResolvedAudio } from "./types";
import { isSpeechSupported } from "./speech";

export type CaeEventType =
  | "playback_requested"
  | "playback_started"
  | "playback_paused"
  | "playback_resumed"
  | "playback_stopped"
  | "playback_completed"
  | "transcript_opened"
  | "narrative_unavailable"
  | "unsupported_browser"
  | "playback_error";

export const CAE_EVENT_TYPES: readonly CaeEventType[] = [
  "playback_requested",
  "playback_started",
  "playback_paused",
  "playback_resumed",
  "playback_stopped",
  "playback_completed",
  "transcript_opened",
  "narrative_unavailable",
  "unsupported_browser",
  "playback_error",
];

/** Coarse capability class — never a raw user agent string. */
export type CaeBrowserCapability = "speech_supported" | "speech_unsupported" | "unknown";

export type CaeErrorCategory =
  | "invalid_call_id"
  | "narrative_not_found"
  | "narrative_unavailable"
  | "unauthorized"
  | "no_published_version"
  | "invalid_speech_configuration"
  | "unsupported_context"
  | "speech_engine_error"
  | "speech_engine_refused"
  | "resolution_exception";

export type CaeTelemetryContext = {
  callId?: string | null;
  placementKey?: string | null;
  moduleKey?: string | null;
  pageKey?: string | null;
  sectionKey?: string | null;
  audience?: string | null;
  versionNo?: number | null;
  playbackState?: string | null;
  errorCategory?: CaeErrorCategory | string | null;
  errorCode?: string | null;
  durationMs?: number | null;
  charCount?: number | null;
  locale?: string | null;
  voiceName?: string | null;
  browserCapability?: CaeBrowserCapability | null;
};

/** Identifier-shaped values only: bounded length, no free text, no payload. */
function safeKey(value: unknown, max = 128): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function safeInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= 0 ? rounded : null;
}

export function classifyBrowser(): CaeBrowserCapability {
  try {
    return isSpeechSupported() ? "speech_supported" : "speech_unsupported";
  } catch {
    return "unknown";
  }
}

/** Maps a resolution failure onto a stable, non-identifying error category. */
export function errorCategoryFromStatus(status: CaeFailureStatus | null): CaeErrorCategory {
  return (status ?? "resolution_exception") as CaeErrorCategory;
}

/**
 * Derives reportable context from a resolved narrative.
 * Deliberately excludes source text, speech text, transcript text, and every
 * resolved variable value.
 */
export function contextFromResolved(resolved: CaeResolvedAudio | null): CaeTelemetryContext {
  if (!resolved) return {};
  return {
    callId: resolved.narrative.callId,
    moduleKey: resolved.narrative.moduleKey,
    audience: resolved.narrative.audience,
    versionNo: resolved.version.versionNo,
    placementKey: resolved.placement?.placementKey ?? null,
    pageKey: resolved.placement?.pageKey ?? null,
    sectionKey: resolved.placement?.sectionKey ?? null,
    locale: resolved.speechProfile.locale,
    // Character count is a volume metric, not content: the text itself never leaves.
    charCount: resolved.version.speechText.length,
  };
}

let telemetryEnabled = true;

/** Test and deployment hook: disables emission entirely. */
export function setContextualAudioTelemetryEnabled(next: boolean) {
  telemetryEnabled = next;
}

/**
 * Emits one event. Never throws, never returns a rejected promise, and never
 * awaits anything the playback path depends on.
 */
export function recordAudioEvent(
  eventType: CaeEventType,
  context: CaeTelemetryContext = {},
): void {
  if (!telemetryEnabled) return;
  if (!CAE_EVENT_TYPES.includes(eventType)) return;

  const payload = {
    _event_type: eventType,
    _call_id: safeKey(context.callId),
    _placement_key: safeKey(context.placementKey),
    _module_key: safeKey(context.moduleKey, 64),
    _page_key: safeKey(context.pageKey),
    _section_key: safeKey(context.sectionKey),
    _audience: safeKey(context.audience, 64),
    _version_no: safeInt(context.versionNo),
    _playback_state: safeKey(context.playbackState, 32),
    _browser_capability: safeKey(context.browserCapability ?? classifyBrowser(), 32),
    _error_category: safeKey(context.errorCategory, 64),
    _error_code: safeKey(context.errorCode, 64),
    _duration_ms: safeInt(context.durationMs),
    _char_count: safeInt(context.charCount),
    _locale: safeKey(context.locale, 32),
    _voice_name: safeKey(context.voiceName, 96),
  };

  try {
    void Promise.resolve(supabase.rpc("audio_record_event", payload as never))
      .then((result) => {
        const error = (result as { error?: unknown } | null)?.error;
        if (error && import.meta.env?.DEV) {
          // Diagnostics only: a telemetry failure is never surfaced to users.
          console.debug("[cae] telemetry rejected", eventType, error);
        }
      })
      .catch(() => {
        /* telemetry must never affect playback */
      });
  } catch {
    /* telemetry must never affect playback */
  }
}
