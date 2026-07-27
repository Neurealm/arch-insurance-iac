/**
 * Contextual Audio Enrichment — global playback layer.
 *
 * A single provider owns the only speech controller in NeuGAIN.io. Modules
 * never talk to SpeechSynthesis directly: they call `useContextualAudio()` and
 * hand over a call ID. This guarantees that exactly one narrative can play
 * anywhere in the application at any moment.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveContextualAudio } from "./contextualAudioService";
import {
  getSpeechSynthesis,
  isSpeechSupported,
  loadVoices,
  prepareSpeechText,
  selectVoice,
} from "./speech";
import type { CaeFailureStatus, CaeResolvedAudio } from "./types";

export type CaePlaybackState =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type ContextualAudioValue = {
  /** Current controller state. */
  state: CaePlaybackState;
  /** Call ID of the currently loaded narrative, if any. */
  callId: string | null;
  /** Title of the currently loaded narrative, if any. */
  title: string | null;
  /** Estimated duration in seconds, when the version supplies one. */
  estimatedDurationSeconds: number | null;
  /** Readable transcript for accessibility and unsupported-browser fallback. */
  transcript: string | null;
  /** Full resolved payload for advanced consumers (read only). */
  resolved: CaeResolvedAudio | null;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  error: string | null;
  /** Machine readable failure reason, when the last resolution failed. */
  errorStatus: CaeFailureStatus | null;
  /** False when the browser has no usable SpeechSynthesis implementation. */
  isSupported: boolean;
  /** Voices reported by the device (may populate asynchronously). */
  voices: SpeechSynthesisVoice[];
  preferredVoiceName: string | null;
  setPreferredVoiceName: (name: string | null) => void;
  /** Name of the voice actually used for the active utterance. */
  activeVoiceName: string | null;
  /** Resolve a narrative without speaking it. */
  load: (callId: string, placementKey?: string | null) => Promise<CaeResolvedAudio | null>;
  /** Resolve if needed, then speak. Always stops any narrative already playing. */
  play: (callId: string, placementKey?: string | null) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  restart: () => Promise<void>;
  /** True when the supplied call ID is the one currently playing. */
  isActive: (callId: string) => boolean;
};

const ContextualAudioContext = createContext<ContextualAudioValue | null>(null);

const VOICE_STORAGE_KEY = "cae:preferredVoice";
const TENANT_STORAGE_KEY = "platform:activeTenant";

function readStoredVoice(): string | null {
  try {
    return window.localStorage.getItem(VOICE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readActiveTenant(): string | null {
  try {
    return window.localStorage.getItem(TENANT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ContextualAudioProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  const [state, setState] = useState<CaePlaybackState>("idle");
  const [resolved, setResolved] = useState<CaeResolvedAudio | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<CaeFailureStatus | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoiceName, setPreferredVoiceNameState] = useState<string | null>(
    typeof window === "undefined" ? null : readStoredVoice(),
  );
  const [activeVoiceName, setActiveVoiceName] = useState<string | null>(null);
  const [isSupported] = useState<boolean>(() => isSpeechSupported());

  /** Monotonic token: every new request invalidates the previous one. */
  const requestRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resolvedRef = useRef<CaeResolvedAudio | null>(null);

  /** Single writer for the resolved payload: keeps state and ref in lockstep. */
  const commitResolved = useCallback((next: CaeResolvedAudio | null) => {
    resolvedRef.current = next;
    setResolved(next);
  }, []);

  /** Hard stop of any speech, regardless of who started it. */
  const cancelSpeech = useCallback(() => {
    const synth = getSpeechSynthesis();
    const utterance = utteranceRef.current;
    if (utterance) {
      utterance.onend = null;
      utterance.onerror = null;
      utterance.onstart = null;
      utteranceRef.current = null;
    }
    try {
      synth?.cancel();
    } catch {
      /* device speech engines may throw while cancelling; ignore */
    }
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    cancelSpeech();
    setActiveVoiceName(null);
    setState((prev) => (prev === "idle" || prev === "error" ? prev : "ready"));
  }, [cancelSpeech]);

  /** Full teardown used for sign out, tenant switch, and unmount. */
  const reset = useCallback(() => {
    requestRef.current += 1;
    cancelSpeech();
    setActiveVoiceName(null);
    commitResolved(null);
    setCallId(null);
    setError(null);
    setErrorStatus(null);
    setState("idle");
  }, [cancelSpeech, commitResolved]);

  // --- Voice list (may populate asynchronously) -----------------------------
  useEffect(() => {
    if (!isSupported) return;
    let active = true;
    const synth = getSpeechSynthesis();

    const refresh = () => {
      const list = synth?.getVoices?.() ?? [];
      if (active && list.length > 0) setVoices(list);
    };

    void loadVoices().then((list) => {
      if (active) setVoices(list);
    });

    synth?.addEventListener?.("voiceschanged", refresh);
    return () => {
      active = false;
      synth?.removeEventListener?.("voiceschanged", refresh);
    };
  }, [isSupported]);

  // --- Route / module changes must never leave unmanaged playback ----------
  const pathname = location?.pathname ?? "";
  const firstRouteRef = useRef(true);
  useEffect(() => {
    if (firstRouteRef.current) {
      firstRouteRef.current = false;
      return;
    }
    reset();
  }, [pathname, reset]);

  // --- Sign out / session loss ---------------------------------------------
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "SIGNED_IN") {
        reset();
      }
    });
    return () => data?.subscription?.unsubscribe?.();
  }, [reset]);

  // --- Tenant switch --------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    let current = readActiveTenant();
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== TENANT_STORAGE_KEY) return;
      const next = readActiveTenant();
      if (next !== current) {
        current = next;
        reset();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("platform:tenant-changed", reset as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("platform:tenant-changed", reset as EventListener);
    };
  }, [reset]);

  // --- Provider destruction -------------------------------------------------
  useEffect(() => () => {
    requestRef.current += 1;
    cancelSpeech();
  }, [cancelSpeech]);

  const setPreferredVoiceName = useCallback((name: string | null) => {
    setPreferredVoiceNameState(name);
    try {
      if (name) window.localStorage.setItem(VOICE_STORAGE_KEY, name);
      else window.localStorage.removeItem(VOICE_STORAGE_KEY);
    } catch {
      /* storage unavailable — preference stays in memory only */
    }
  }, []);

  const load = useCallback(
    async (nextCallId: string, placementKey?: string | null): Promise<CaeResolvedAudio | null> => {
      // Any load supersedes whatever is currently loaded or speaking.
      requestRef.current += 1;
      const token = requestRef.current;
      cancelSpeech();
      setActiveVoiceName(null);
      setCallId(nextCallId);
      commitResolved(null);
      setError(null);
      setErrorStatus(null);
      setState("loading");

      try {
        const result = await resolveContextualAudio(nextCallId, placementKey ?? null);
        if (token !== requestRef.current) return null;
        if (result.status !== "ok") {
          setError(result.message);
          setErrorStatus(result.status);
          setState("error");
          return null;
        }
        commitResolved(result);
        setState("ready");
        return result;
      } catch (err) {
        if (token !== requestRef.current) return null;
        setError(err instanceof Error ? err.message : "Unable to load narration.");
        setErrorStatus("narrative_unavailable");
        setState("error");
        return null;
      }
    },
    [cancelSpeech, commitResolved],
  );

  const speak = useCallback(
    (payload: CaeResolvedAudio, token: number) => {
      const synth = getSpeechSynthesis();
      if (!synth) {
        // Unsupported browsers keep the transcript available for reading.
        setState("ready");
        return;
      }

      const text = prepareSpeechText(payload.version.speechText, payload.pronunciationRules);
      if (!text) {
        setState("ended");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const profile = payload.speechProfile;
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;
      utterance.volume = profile.volume;
      utterance.lang = profile.locale;

      const voice = selectVoice(
        synth.getVoices?.() ?? voices,
        profile,
        preferredVoiceName,
      );
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || profile.locale;
      }
      setActiveVoiceName(voice?.name ?? null);

      utterance.onend = () => {
        if (token !== requestRef.current) return;
        utteranceRef.current = null;
        setActiveVoiceName(null);
        setState("ended");
      };
      utterance.onerror = () => {
        if (token !== requestRef.current) return;
        utteranceRef.current = null;
        setActiveVoiceName(null);
        setState("ready");
      };

      utteranceRef.current = utterance;
      setState("playing");
      try {
        synth.speak(utterance);
      } catch {
        utteranceRef.current = null;
        setState("error");
        setErrorStatus("invalid_speech_configuration");
        setError("The browser speech engine refused to start.");
      }
    },
    [preferredVoiceName, voices],
  );

  const play = useCallback(
    async (nextCallId: string, placementKey?: string | null) => {
      const already = resolvedRef.current;
      if (already && already.narrative.callId === nextCallId) {
        // Same narrative re-selected: cancel and restart, never overlap.
        requestRef.current += 1;
        cancelSpeech();
        speak(already, requestRef.current);
        return;
      }

      const payload = await load(nextCallId, placementKey);
      if (!payload) return;
      speak(payload, requestRef.current);
    },
    [cancelSpeech, load, speak],
  );

  const pause = useCallback(() => {
    const synth = getSpeechSynthesis();
    if (!synth || !utteranceRef.current) return;
    try {
      synth.pause();
    } catch {
      /* ignore */
    }
    setState((prev) => (prev === "playing" ? "paused" : prev));
  }, []);

  const resume = useCallback(() => {
    const synth = getSpeechSynthesis();
    if (!synth || !utteranceRef.current) return;
    try {
      synth.resume();
    } catch {
      /* ignore */
    }
    setState((prev) => (prev === "paused" ? "playing" : prev));
  }, []);

  const restart = useCallback(async () => {
    const payload = resolvedRef.current;
    if (!payload) return;
    requestRef.current += 1;
    cancelSpeech();
    speak(payload, requestRef.current);
  }, [cancelSpeech, speak]);

  const isActive = useCallback(
    (candidate: string) => callId === candidate && (state === "playing" || state === "paused"),
    [callId, state],
  );

  const value = useMemo<ContextualAudioValue>(
    () => ({
      state,
      callId,
      title: resolved?.narrative.title ?? null,
      estimatedDurationSeconds: resolved?.version.estimatedDurationSeconds ?? null,
      transcript: resolved?.version.transcriptText ?? null,
      resolved,
      isLoading: state === "loading",
      isPlaying: state === "playing",
      isPaused: state === "paused",
      error,
      errorStatus,
      isSupported,
      voices,
      preferredVoiceName,
      setPreferredVoiceName,
      activeVoiceName,
      load,
      play,
      pause,
      resume,
      stop,
      restart,
      isActive,
    }),
    [
      state,
      callId,
      resolved,
      error,
      errorStatus,
      isSupported,
      voices,
      preferredVoiceName,
      setPreferredVoiceName,
      activeVoiceName,
      load,
      play,
      pause,
      resume,
      stop,
      restart,
      isActive,
    ],
  );

  return (
    <ContextualAudioContext.Provider value={value}>{children}</ContextualAudioContext.Provider>
  );
}

export function useContextualAudio(): ContextualAudioValue {
  const ctx = useContext(ContextualAudioContext);
  if (!ctx) {
    throw new Error("useContextualAudio must be used within a ContextualAudioProvider");
  }
  return ctx;
}

/** Escape hatch for optional consumers rendered outside the provider. */
export function useOptionalContextualAudio(): ContextualAudioValue | null {
  return useContext(ContextualAudioContext);
}
