/**
 * Contextual Audio Enrichment — public module surface.
 *
 * Feature modules import ONLY from `@/platform/cae`. Nothing outside this
 * folder may talk to SpeechSynthesis, the resolve RPC, or the audio tables
 * directly, which is what keeps single-playback and authorisation guarantees
 * intact across the platform.
 */

export { ContextualAudioProvider, useContextualAudio, useOptionalContextualAudio } from "./ContextualAudioProvider";
export type { ContextualAudioValue, CaePlaybackState } from "./ContextualAudioProvider";
export { ContextualAudioErrorBoundary, ContextualAudioRoot } from "./ContextualAudioErrorBoundary";
export { isContextualAudioEnabled, useContextualAudioEnabled, CAE_FLAG_STORAGE_KEY } from "./featureFlags";

export { AudioEnrichmentButton } from "./components/AudioEnrichmentButton";
export type { AudioEnrichmentButtonProps, AudioEnrichmentDisplayVariant } from "./components/AudioEnrichmentButton";
export { AudioPlaybackControls } from "./components/AudioPlaybackControls";
export { TranscriptPanel } from "./components/TranscriptPanel";
export { useCaeCallState, friendlyCaeMessage } from "./components/useCaeCallState";
export type { CaeUserState } from "./components/useCaeCallState";

export { CAE_CALL_ID_PATTERN } from "./types";
export type { CaeResolvedAudio, CaeFailureStatus, CaeStatus } from "./types";
