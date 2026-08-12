// Shared primitives for the Agentic AI IAM administration plane. The component
// library is the Context / Evidence Layer one so every administration plane
// stays visually identical; only the help registry and tone helpers differ.

export {
  Panel, RichTip, HelpDot, HelpRegistry, InspectDrawer, KV, SubHead, Bullets,
  StatePill, ScoreText, KpiCard, SkeletonPanel, EmptyState, Btn, scoreTone,
} from "@/pages/context-evidence/parts";
export type { TipContent, DrawerTab } from "@/pages/context-evidence/parts";

export function effectTone(effect: string): "ok" | "warn" | "bad" | "muted" {
  if (effect === "Allow") return "ok";
  if (effect === "Approval Required") return "warn";
  if (effect === "Deny" || effect.startsWith("Denied")) return "bad";
  return "muted";
}
