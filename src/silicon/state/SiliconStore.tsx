// Prompt 0G — global state (Zustand) with localStorage persistence.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActiveFilters, EntityKind, PersonaId, ScenarioId } from "@/silicon/domain/types";

export interface DrawerState { open: boolean; entity: { kind: EntityKind; id: string } | null; tab: DrawerTab; }
export type DrawerTab = "summary" | "relationships" | "telemetry" | "history" | "evidence" | "ai" | "audit";
export interface NavigationState { paletteOpen: boolean; }

export interface SiliconStoreState {
  selectedTenantId: string;
  selectedPortfolioId: string;
  selectedProgramId: string;
  selectedIpId: string;
  selectedScenarioId: ScenarioId;
  selectedPersonaId: PersonaId;
  selectedTime: string;
  selectedEntity: { kind: EntityKind; id: string } | null;
  activeFilters: ActiveFilters;
  navigationState: NavigationState;
  drawerState: DrawerState;
  reducedMotionPreference: boolean;

  setScenario: (s: ScenarioId) => void;
  setPersona: (p: PersonaId) => void;
  setTime: (t: string) => void;
  setFilters: (f: ActiveFilters) => void;
  setFilter: (key: keyof ActiveFilters, value: string | string[] | undefined) => void;
  openDrawer: (kind: EntityKind, id: string, tab?: DrawerTab) => void;
  setDrawerTab: (tab: DrawerTab) => void;
  closeDrawer: () => void;
  setPaletteOpen: (open: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  resetDemo: () => void;
}

export const DEFAULT_STATE: Omit<SiliconStoreState,
  "setScenario"|"setPersona"|"setTime"|"setFilters"|"setFilter"|
  "openDrawer"|"setDrawerTab"|"closeDrawer"|"setPaletteOpen"|"setReducedMotion"|"resetDemo"> = {
  selectedTenantId: "tenant-panw-demo",
  selectedPortfolioId: "portfolio-nsse",
  selectedProgramId: "program-aegis-240",
  selectedIpId: "ip-ddmac-240",
  selectedScenarioId: "t2-regression",
  selectedPersonaId: "priya-nair",
  selectedTime: "2026-07-14T15:30:00Z",
  selectedEntity: null,
  activeFilters: {},
  navigationState: { paletteOpen: false },
  drawerState: { open: false, entity: null, tab: "summary" },
  reducedMotionPreference: false,
};

export const useSiliconStore = create<SiliconStoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setScenario: (s) => set({ selectedScenarioId: s }),
      setPersona: (p) => set({ selectedPersonaId: p }),
      setTime: (t) => set({ selectedTime: t }),
      setFilters: (f) => set({ activeFilters: f }),
      setFilter: (key, value) => set(state => {
        const next = { ...state.activeFilters };
        if (value == null || (Array.isArray(value) && value.length === 0)) delete next[key];
        else next[key] = value;
        return { activeFilters: next };
      }),
      openDrawer: (kind, id, tab = "summary") =>
        set({ drawerState: { open: true, entity: { kind, id }, tab }, selectedEntity: { kind, id } }),
      setDrawerTab: (tab) => set(state => ({ drawerState: { ...state.drawerState, tab } })),
      closeDrawer: () => set(state => ({ drawerState: { ...state.drawerState, open: false } })),
      setPaletteOpen: (open) => set(state => ({ navigationState: { ...state.navigationState, paletteOpen: open } })),
      setReducedMotion: (v) => set({ reducedMotionPreference: v }),
      resetDemo: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: "silicon:state:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        selectedTenantId: s.selectedTenantId,
        selectedPortfolioId: s.selectedPortfolioId,
        selectedProgramId: s.selectedProgramId,
        selectedIpId: s.selectedIpId,
        selectedScenarioId: s.selectedScenarioId,
        selectedPersonaId: s.selectedPersonaId,
        selectedTime: s.selectedTime,
        activeFilters: s.activeFilters,
        reducedMotionPreference: s.reducedMotionPreference,
      }) as any,
    }
  )
);
