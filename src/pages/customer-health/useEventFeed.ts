// Mock live event feed. Events tick every few seconds so the UI can
// demonstrate changing conditions: relative timestamps age, telemetry
// refreshes, and a scripted scenario can promote or resolve an event.

import { useCallback, useEffect, useMemo, useState } from "react";
import { events as seedEvents } from "./data";
import { eventRank } from "./eventDetail";
import type { ServiceEvent } from "./types";

type Stage = 0 | 1 | 2;

/** Scripted mock conditions applied on top of the seed events. */
const scenarios: Record<Stage, { label: string; apply: (e: ServiceEvent) => ServiceEvent }> = {
  0: { label: "Current conditions", apply: (e) => e },
  1: {
    label: "Storage latency worsens",
    apply: (e) =>
      e.id === "evt-blob-latency"
        ? {
            ...e,
            kind: "Degradation",
            status: "degraded",
            summary:
              "Storage latency has increased further. A small number of requests are now completing more slowly than normal for users in West US 2.",
            impactToYou: "Slower data access for some users",
            customerImpact: "Degraded experience for some users",
            responseStatus: "Mitigation started, provider escalation raised",
            ranking: { ...(e.ranking ?? { actualImpact: 0, potentialImpact: 0, exposedDeployments: 1, durationMinutes: 0, infrastructureSeverity: 2 }), actualImpact: 2, potentialImpact: 3 },
          }
        : e,
  },
  2: {
    label: "Sign-in incident resolved",
    apply: (e) =>
      e.id === "evt-identity-incident"
        ? {
            ...e,
            kind: "Information",
            status: "info",
            active: false,
            summary: "Sign-ins in EU North have fully recovered. The event is closed and no further impact is expected.",
            impactToYou: "None",
            customerImpact: "Resolved — no impact",
            responseStatus: "Resolved",
            nextUpdate: "Closed",
            ranking: { actualImpact: 0, potentialImpact: 0, exposedDeployments: 1, durationMinutes: 120, infrastructureSeverity: 1 },
          }
        : e,
  },
};

function ageLabel(seconds: number): string {
  if (seconds < 60) return "just now";
  return `${Math.floor(seconds / 60)}m ago`;
}

export function useEventFeed() {
  const [stage, setStage] = useState<Stage>(0);
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 5000);
    return () => window.clearInterval(id);
  }, [live]);

  const items = useMemo(() => {
    const apply = scenarios[stage].apply;
    return seedEvents
      .map(apply)
      .map((e, i) =>
        e.active === false || e.updated === "Scheduled"
          ? e
          : { ...e, updated: ageLabel((tick * 5 + i * 37) % 480) },
      )
      .sort((a, b) => eventRank(b) - eventRank(a));
  }, [stage, tick]);

  const advance = useCallback(() => setStage((s) => ((s + 1) % 3) as Stage), []);

  return {
    events: items,
    active: items.filter((e) => e.active !== false),
    scenarioLabel: scenarios[stage].label,
    advance,
    live,
    setLive,
    tick,
  };
}
