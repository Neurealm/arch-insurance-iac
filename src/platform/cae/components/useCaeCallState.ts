import { useContextualAudio } from "../ContextualAudioProvider";

/** User facing states rendered by the CAE components. */
export type CaeUserState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "unavailable"
  | "error"
  | "unsupported";

/** Failure reasons that mean "there is nothing to play here", not "it broke". */
const UNAVAILABLE_STATUSES = new Set([
  "narrative_not_found",
  "narrative_unavailable",
  "no_published_version",
  "unauthorized",
  "unsupported_context",
  "invalid_call_id",
]);

/**
 * Derives the state of one call ID from the single global controller.
 * A narrative owned by another button is always reported as `idle` here.
 */
export function useCaeCallState(callId: string): CaeUserState {
  const { state, callId: activeCallId, errorStatus, isSupported } = useContextualAudio();
  const isMine = activeCallId === callId;

  if (isMine && state === "loading") return "loading";
  if (isMine && state === "error") {
    return errorStatus && UNAVAILABLE_STATUSES.has(errorStatus) ? "unavailable" : "error";
  }
  if (!isSupported) return "unsupported";
  if (!isMine) return "idle";
  if (state === "playing") return "playing";
  if (state === "paused") return "paused";
  return "idle";
}

/** Short, non-technical wording for each failure state. */
export function friendlyCaeMessage(state: CaeUserState, rawMessage: string | null): string | null {
  switch (state) {
    case "unavailable":
      return rawMessage?.trim()
        ? rawMessage
        : "This narration is not available right now.";
    case "error":
      return "We could not start this narration. Please try again.";
    case "unsupported":
      return "This browser cannot play narration. Read the transcript instead.";
    default:
      return null;
  }
}
