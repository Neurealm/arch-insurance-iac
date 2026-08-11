// Shared primitives for the Agent Orchestration administration plane. The
// component library is the Context / Evidence Layer one so all administration
// planes stay visually identical; only the help registry differs.

export {
  Panel, RichTip, HelpDot, HelpRegistry, InspectDrawer, KV, SubHead, Bullets,
  StatePill, ScoreText, KpiCard, SkeletonPanel, EmptyState, Btn, scoreTone,
} from "@/pages/context-evidence/parts";
export type { TipContent, DrawerTab } from "@/pages/context-evidence/parts";

import type { Health } from "./data";

export function healthTone(h: Health): "ok" | "warn" | "bad" | "muted" {
  return h === "Healthy" ? "ok" : h === "Degraded" ? "warn" : h === "Error" ? "bad" : "muted";
}
