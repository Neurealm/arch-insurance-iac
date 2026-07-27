/**
 * Shared helpers for the CAE administration surfaces: text metrics, call ID
 * parsing, and a draft preview player.
 *
 * The preview player exists because draft content is not resolvable through
 * `audio_resolve_call` (that path only serves published, authorised versions).
 * It still routes through the global controller's `stop()` first so the
 * "one narrative at a time" guarantee holds across the whole application.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useContextualAudio } from "../ContextualAudioProvider";
import {
  applyPronunciationRules,
  getSpeechSynthesis,
  isSpeechSupported,
  loadVoices,
  selectVoice,
  stripSpeechMarkup,
} from "../speech";
import { CAE_CALL_ID_PATTERN } from "../types";
import type { CaePronunciationRule, CaeSpeechProfile } from "../types";
import type { PronunciationRow, SpeechProfileRow } from "./data";

/** Words per minute used for the listening-duration estimate. */
export const WORDS_PER_MINUTE = 155;

export function countWords(text: string): number {
  const trimmed = stripSpeechMarkup(text ?? "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function estimateDurationSeconds(text: string, rate = 1): number {
  const words = countWords(text);
  if (!words) return 0;
  const effectiveRate = rate > 0 ? rate : 1;
  return Math.max(1, Math.round((words / (WORDS_PER_MINUTE * effectiveRate)) * 60));
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`;
}

export function isValidCallId(value: string): boolean {
  return CAE_CALL_ID_PATTERN.test(value.trim());
}

/** Extracts module and topic segments from a well-formed call ID. */
export function parseCallId(value: string): { moduleKey: string; topicKey: string; sequence: string } | null {
  if (!isValidCallId(value)) return null;
  const [, moduleKey, topicKey, sequence] = value.trim().split(".");
  return { moduleKey, topicKey, sequence };
}

/** Tokens of the form {{variable_key}} referenced by a body of text. */
export function extractVariableTokens(text: string): string[] {
  const found = new Set<string>();
  const re = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  let match = re.exec(text ?? "");
  while (match) {
    found.add(match[1]);
    match = re.exec(text ?? "");
  }
  return [...found].sort();
}

export function toRuntimeProfile(profile: SpeechProfileRow | null | undefined): CaeSpeechProfile | null {
  if (!profile) return null;
  return {
    profileKey: profile.profile_key,
    displayName: profile.display_name,
    locale: profile.locale,
    fallbackLocale: profile.fallback_locale,
    preferredVoiceNames: profile.preferred_voice_names ?? [],
    rate: Number(profile.rate ?? 1),
    pitch: Number(profile.pitch ?? 1),
    volume: Number(profile.volume ?? 1),
  };
}

export function toRuntimeRules(rules: PronunciationRow[] | undefined, moduleKey?: string): CaePronunciationRule[] {
  return (rules ?? [])
    .filter((r) => r.is_enabled)
    .filter((r) => !r.module_key || !moduleKey || r.module_key === moduleKey)
    .sort((a, b) => a.priority - b.priority)
    .map((r) => ({
      matchText: r.match_text,
      matchType: r.match_type === "exact" ? "exact" : "word",
      replacementText: r.replacement_text,
      priority: r.priority,
    }));
}

export type DraftPreviewState = "idle" | "speaking" | "unsupported";

/**
 * Speaks arbitrary administrative text (draft narration, profile sample,
 * pronunciation sample) with the supplied profile settings.
 */
export function useDraftPreview() {
  const { stop: stopGlobal } = useContextualAudio();
  const [state, setState] = useState<DraftPreviewState>(() =>
    isSpeechSupported() ? "idle" : "unsupported",
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    const synth = getSpeechSynthesis();
    synth?.cancel();
    utteranceRef.current = null;
    setState((prev) => (prev === "unsupported" ? prev : "idle"));
  }, []);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    async (text: string, profile: CaeSpeechProfile | null, rules: CaePronunciationRule[] = []) => {
      const synth = getSpeechSynthesis();
      if (!synth) {
        setState("unsupported");
        return;
      }
      // Any preview supersedes whatever is currently narrating anywhere.
      stopGlobal();
      synth.cancel();

      const prepared = applyPronunciationRules(stripSpeechMarkup(text ?? ""), rules);
      if (!prepared.trim()) return;

      const voices = await loadVoices();
      const utterance = new SpeechSynthesisUtterance(prepared);
      const voice = selectVoice(voices, {
        preferredVoiceName: null,
        profileVoiceNames: profile?.preferredVoiceNames ?? [],
        locale: profile?.locale ?? "en-US",
        fallbackLocale: profile?.fallbackLocale ?? "en",
      });
      if (voice) utterance.voice = voice;
      utterance.lang = profile?.locale ?? "en-US";
      utterance.rate = profile?.rate ?? 1;
      utterance.pitch = profile?.pitch ?? 1;
      utterance.volume = profile?.volume ?? 1;
      utterance.onend = () => setState("idle");
      utterance.onerror = () => setState("idle");
      utteranceRef.current = utterance;
      setState("speaking");
      synth.speak(utterance);
    },
    [stopGlobal],
  );

  return { state, speak, stop, isSupported: state !== "unsupported" };
}
