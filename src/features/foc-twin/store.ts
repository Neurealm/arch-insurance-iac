import { create } from "zustand";

export type LayerId =
  | "production"
  | "equipment"
  | "material"
  | "utilities"
  | "maintenance"
  | "power"
  | "thermal"
  | "environmental"
  | "quality"
  | "ai-risk";

export type OpStatus = "running" | "idle" | "maintenance" | "warning" | "critical" | "offline";

export type BuildingMeta = {
  id: string;
  name: string;
  status: OpStatus;
  utilization: number; // %
  health: number; // 0-100
  powerMW: number;
  owner: string;
  criticality: "Critical" | "High" | "Medium" | "Low";
  equipmentCount: number;
  sensorCount: number;
  // scene placement (campus units; ground is XZ plane)
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind:
    | "fab"
    | "utility"
    | "logistics"
    | "office"
    | "substation"
    | "cooling";
};

type CamRequest = {
  pos: [number, number, number];
  target: [number, number, number];
  // monotonically increasing id so the camera controller knows to re-run
  nonce: number;
};

type Store = {
  selectedId: string | null;
  hoveredId: string | null;
  layers: Record<LayerId, boolean>;
  activeLayer: LayerId;
  sceneReady: boolean;
  loading: boolean;
  camRequest: CamRequest;
  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  toggleLayer: (id: LayerId) => void;
  setActiveLayer: (id: LayerId) => void;
  markReady: () => void;
  requestCamera: (pos: [number, number, number], target: [number, number, number]) => void;
  resetCamera: () => void;
};

const DEFAULT_POS: [number, number, number] = [42, 32, 42];
const DEFAULT_TGT: [number, number, number] = [0, 0, 0];

export const useTwinStore = create<Store>((set, get) => ({
  selectedId: null,
  hoveredId: null,
  layers: {
    production: true,
    equipment: false,
    material: true,
    utilities: false,
    maintenance: false,
    power: false,
    thermal: false,
    environmental: false,
    quality: false,
    "ai-risk": false,
  },
  activeLayer: "production",
  sceneReady: false,
  loading: true,
  camRequest: { pos: DEFAULT_POS, target: DEFAULT_TGT, nonce: 0 },
  setSelected: (id) => set({ selectedId: id }),
  setHovered: (id) => set({ hoveredId: id }),
  toggleLayer: (id) =>
    set((s) => ({ layers: { ...s.layers, [id]: !s.layers[id] } })),
  setActiveLayer: (id) => set({ activeLayer: id }),
  markReady: () => set({ sceneReady: true, loading: false }),
  requestCamera: (pos, target) =>
    set({ camRequest: { pos, target, nonce: get().camRequest.nonce + 1 } }),
  resetCamera: () =>
    set({
      camRequest: { pos: DEFAULT_POS, target: DEFAULT_TGT, nonce: get().camRequest.nonce + 1 },
      selectedId: null,
    }),
}));

export const DEFAULT_CAMERA = { pos: DEFAULT_POS, target: DEFAULT_TGT };
