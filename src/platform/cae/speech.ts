/**
 * Contextual Audio Enrichment — native browser speech utilities.
 *
 * The platform deliberately uses the device's built-in SpeechSynthesis engine:
 * no external provider, no generated audio assets, no server-side TTS, no
 * secrets. Everything in this module is pure and dependency free so the
 * playback controller stays testable and module independent.
 */

import type { CaePronunciationRule, CaeSpeechProfile } from "./types";

export type SpeechSupport = "supported" | "unsupported";

export function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  const synth = (window as Window & { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
  if (!synth || typeof synth.speak !== "function") return null;
  if (typeof (window as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance !== "function") {
    return null;
  }
  return synth;
}

export function isSpeechSupported(): boolean {
  return getSpeechSynthesis() !== null;
}

/**
 * Browser voice lists frequently populate asynchronously. Resolves as soon as a
 * non-empty list is available, and resolves with whatever exists once the
 * timeout elapses so the caller always falls back to the device default voice.
 */
export function loadVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  const synth = getSpeechSynthesis();
  if (!synth) return Promise.resolve([]);

  const immediate = safeVoices(synth);
  if (immediate.length > 0) return Promise.resolve(immediate);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      synth.removeEventListener?.("voiceschanged", onChange);
      resolve(voices);
    };
    const onChange = () => {
      const voices = safeVoices(synth);
      if (voices.length > 0) finish(voices);
    };
    const timer = setTimeout(() => finish(safeVoices(synth)), timeoutMs);
    synth.addEventListener?.("voiceschanged", onChange);
  });
}

function safeVoices(synth: SpeechSynthesis): SpeechSynthesisVoice[] {
  try {
    return synth.getVoices() ?? [];
  } catch {
    return [];
  }
}

function normaliseLocale(value: string | undefined | null): string {
  return (value ?? "").replace("_", "-").toLowerCase();
}

/**
 * Voice resolution order:
 *  1. explicit user preference
 *  2. profile preferred voice names
 *  3. exact locale match
 *  4. fallback locale (language prefix) match
 *  5. device default voice (null)
 */
export function selectVoice(
  voices: SpeechSynthesisVoice[],
  profile: Pick<CaeSpeechProfile, "locale" | "fallbackLocale" | "preferredVoiceNames">,
  preferredVoiceName?: string | null,
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (preferredVoiceName) {
    const explicit = voices.find((v) => v.name === preferredVoiceName);
    if (explicit) return explicit;
  }

  for (const name of profile.preferredVoiceNames ?? []) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }

  const locale = normaliseLocale(profile.locale);
  if (locale) {
    const exact = voices.find((v) => normaliseLocale(v.lang) === locale);
    if (exact) return exact;
  }

  const fallback = normaliseLocale(profile.fallbackLocale) || locale.split("-")[0];
  if (fallback) {
    const prefix = fallback.split("-")[0];
    const partial = voices.find((v) => normaliseLocale(v.lang).split("-")[0] === prefix);
    if (partial) return partial;
  }

  return null;
}

/**
 * Removes speech markup so tags are never read aloud as literal text.
 * `<break/>` becomes a pause-approximating punctuation gap; `<p>`/`<s>` become
 * sentence boundaries; all remaining tags are dropped, entities decoded.
 */
export function stripSpeechMarkup(text: string): string {
  if (!text) return "";
  return text
    .replace(/<\s*break\b[^>]*\/?\s*>/gi, ", ")
    .replace(/<\s*\/?\s*(p|s)\s*>/gi, ". ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s*\.\s*(\.\s*)+/g, ". ")
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function applyPronunciationRules(text: string, rules: CaePronunciationRule[]): string {
  if (!text || !rules || rules.length === 0) return text;
  const ordered = [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  let output = text;
  for (const rule of ordered) {
    if (!rule?.matchText) continue;
    const escaped = escapeRegExp(rule.matchText);
    const pattern =
      rule.matchType === "word" ? new RegExp(`\\b${escaped}\\b`, "g") : new RegExp(escaped, "g");
    output = output.replace(pattern, rule.replacementText ?? "");
  }
  return output;
}

/** Full text preparation pipeline: markup removal then pronunciation rules. */
export function prepareSpeechText(speechText: string, rules: CaePronunciationRule[]): string {
  return applyPronunciationRules(stripSpeechMarkup(speechText), rules);
}
