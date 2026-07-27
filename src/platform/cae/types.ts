/**
 * Contextual Audio Enrichment (CAE) — shared runtime contract.
 *
 * Every field below is produced server-side by the `audio_resolve_call`
 * SECURITY DEFINER function. The client never supplies user id, tenant id,
 * role, or permission values: identity and authorisation are resolved from the
 * authenticated session inside the database.
 */

export const CAE_CALL_ID_PATTERN = /^CAE\.[A-Z][A-Z0-9]*\.[A-Z][A-Z0-9_]*\.\d{3}$/;

export type CaeFailureStatus =
  | "invalid_call_id"
  | "narrative_not_found"
  | "narrative_unavailable"
  | "unauthorized"
  | "no_published_version"
  | "invalid_speech_configuration"
  | "unsupported_context";

export type CaeStatus = "ok" | CaeFailureStatus;

export type CaeNarrative = {
  callId: string;
  title: string;
  description: string | null;
  moduleKey: string;
  topicKey: string;
  audience: string;
  scopeType: string;
  scopeReference: string | null;
};

export type CaeVersion = {
  versionNo: number;
  sourceText: string;
  speechText: string;
  transcriptText: string;
  estimatedDurationSeconds: number | null;
  publishedAt: string | null;
};

export type CaeSpeechProfile = {
  profileKey: string;
  displayName: string;
  locale: string;
  fallbackLocale: string;
  preferredVoiceNames: string[];
  rate: number;
  pitch: number;
  volume: number;
};

export type CaePronunciationRule = {
  matchText: string;
  matchType: "exact" | "word";
  replacementText: string;
  priority: number;
};

export type CaePlacement = {
  placementKey: string;
  buttonLabel: string | null;
  displayVariant: string | null;
  routePattern: string | null;
  pageKey: string | null;
  sectionKey: string | null;
  componentKey: string | null;
  sortOrder: number | null;
};

export type CaeResolvedAudio = {
  status: "ok";
  narrative: CaeNarrative;
  version: CaeVersion;
  speechProfile: CaeSpeechProfile;
  pronunciationRules: CaePronunciationRule[];
  placement: CaePlacement | null;
};

export type CaeFailure = {
  status: CaeFailureStatus;
  message: string;
};

export type CaeResolveResult = CaeResolvedAudio | CaeFailure;

export function isCaeSuccess(result: CaeResolveResult): result is CaeResolvedAudio {
  return result.status === "ok";
}

export function isValidCaeCallId(callId: unknown): callId is string {
  return typeof callId === "string" && CAE_CALL_ID_PATTERN.test(callId);
}
