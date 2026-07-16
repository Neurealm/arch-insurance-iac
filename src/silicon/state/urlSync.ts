// URL <-> store sync for deep links: ?scenario=…&entity=<kind>:<id>&tab=…
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSiliconStore } from "@/silicon/state/SiliconStore";
import type { DrawerTab } from "@/silicon/state/SiliconStore";
import type { EntityKind, ScenarioId } from "@/silicon/domain/types";

const VALID_SCENARIOS: ScenarioId[] = ["baseline-green","t2-regression","t3-ai-rootcause","t4-fix-validated"];
const VALID_TABS: DrawerTab[] = ["summary","relationships","telemetry","history","evidence","ai","audit"];

export function useUrlSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useSiliconStore();

  // URL -> store on first mount + when search string changes externally.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const scenario = q.get("scenario") as ScenarioId | null;
    if (scenario && VALID_SCENARIOS.includes(scenario) && scenario !== store.selectedScenarioId) {
      store.setScenario(scenario);
    }
    const entity = q.get("entity");
    if (entity && entity.includes(":")) {
      const [kind, ...rest] = entity.split(":");
      const id = rest.join(":");
      const tab = (q.get("tab") as DrawerTab) ?? "summary";
      if (id && (!store.drawerState.open || store.drawerState.entity?.id !== id)) {
        store.openDrawer(kind as EntityKind, id, VALID_TABS.includes(tab) ? tab : "summary");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Store -> URL when scenario or drawer state changes.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    q.set("scenario", store.selectedScenarioId);
    if (store.drawerState.open && store.drawerState.entity) {
      q.set("entity", `${store.drawerState.entity.kind}:${store.drawerState.entity.id}`);
      q.set("tab", store.drawerState.tab);
    } else {
      q.delete("entity"); q.delete("tab");
    }
    const next = `${location.pathname}?${q.toString()}`;
    if (next !== `${location.pathname}${location.search}`) {
      navigate(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.selectedScenarioId, store.drawerState.open, store.drawerState.entity?.id, store.drawerState.tab]);
}
