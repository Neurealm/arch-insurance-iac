// Shared primitives for the Agentic AI FinOps & Cost Management administration
// plane. The component library is the Context / Evidence Layer one so every
// administration plane stays visually identical; only the help registry and
// domain tone helpers differ.

export {
  Panel, RichTip, HelpDot, HelpRegistry, InspectDrawer, KV, SubHead, Bullets,
  StatePill, ScoreText, KpiCard, SkeletonPanel, EmptyState, Btn, scoreTone,
} from "@/pages/context-evidence/parts";
export type { TipContent, DrawerTab } from "@/pages/context-evidence/parts";

import type { Health, Risk } from "./data";

export function healthTone(h: Health): "ok" | "warn" | "bad" | "muted" {
  if (h === "Healthy") return "ok";
  if (h === "Degraded" || h === "Attention") return "warn";
  if (h === "Error") return "bad";
  return "muted";
}

export function riskTone(r: Risk): "ok" | "warn" | "bad" {
  if (r === "Very Low" || r === "Low") return "ok";
  if (r === "Medium") return "warn";
  return "bad";
}

export function money(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
