import type { BuildingMeta } from "./store";

// Richardson DFW Semiconductor Fab campus — 15 structures
// Coordinates are in scene units (meters-ish). Ground is the XZ plane, Y is up.
export const BUILDINGS: BuildingMeta[] = [
  // ---- Production core (3 fab blocks running E-W) ----
  { id: "B-LITHO", name: "Lithography Building",  kind: "fab", x: -18, z: -6,  w: 14, d: 9,  h: 7.5, status: "running",     utilization: 92, health: 86, powerMW: 14.2, owner: "Fab Ops",      criticality: "Critical", equipmentCount: 142, sensorCount: 5120 },
  { id: "B-ETCH",  name: "Etch Building",          kind: "fab", x:  -2, z: -6,  w: 12, d: 9,  h: 7.5, status: "warning",     utilization: 91, health: 78, powerMW: 11.8, owner: "Fab Ops",      criticality: "Critical", equipmentCount: 118, sensorCount: 4380 },
  { id: "B-CMP",   name: "CMP Building",           kind: "fab", x:  12, z: -6,  w: 11, d: 9,  h: 7.5, status: "running",     utilization: 87, health: 84, powerMW: 9.1,  owner: "Fab Ops",      criticality: "Critical", equipmentCount: 86,  sensorCount: 3110 },

  // ---- Secondary fab row ----
  { id: "B-METRO", name: "Metrology Building",     kind: "fab", x: -18, z:  10, w: 13, d: 8,  h: 6.0, status: "critical",    utilization: 96, health: 64, powerMW: 6.4,  owner: "Quality Eng",  criticality: "Critical", equipmentCount: 64,  sensorCount: 2940 },
  { id: "B-DIFF",  name: "Diffusion Building",     kind: "fab", x:  -2, z:  10, w: 12, d: 8,  h: 6.5, status: "running",     utilization: 88, health: 90, powerMW: 12.7, owner: "Fab Ops",      criticality: "Critical", equipmentCount: 72,  sensorCount: 2810 },
  { id: "B-FILM",  name: "Thin Film Building",     kind: "fab", x:  12, z:  10, w: 11, d: 8,  h: 6.0, status: "running",     utilization: 84, health: 88, powerMW: 8.9,  owner: "Fab Ops",      criticality: "High",     equipmentCount: 58,  sensorCount: 2310 },

  // ---- Logistics row (top of campus, north) ----
  { id: "B-RECV",  name: "Receiving",              kind: "logistics", x: -28, z: -22, w: 8,  d: 7,  h: 4.5, status: "running",     utilization: 62, health: 95, powerMW: 0.6,  owner: "Logistics",    criticality: "Medium",   equipmentCount: 12, sensorCount: 320 },
  { id: "B-WHSE",  name: "Warehouse",              kind: "logistics", x: -16, z: -22, w: 12, d: 7,  h: 5.0, status: "running",     utilization: 71, health: 92, powerMW: 0.9,  owner: "Logistics",    criticality: "Medium",   equipmentCount: 18, sensorCount: 480 },
  { id: "B-AMHS",  name: "AMHS Hub",               kind: "logistics", x:   0, z: -22, w: 10, d: 7,  h: 5.5, status: "warning",     utilization: 89, health: 81, powerMW: 1.7,  owner: "Material Ctrl",criticality: "High",     equipmentCount: 36, sensorCount: 1240 },
  { id: "B-PKG",   name: "Packaging Building",     kind: "logistics", x:  14, z: -22, w: 12, d: 7,  h: 5.0, status: "running",     utilization: 78, health: 90, powerMW: 2.4,  owner: "Backend Ops",  criticality: "High",     equipmentCount: 44, sensorCount: 1620 },

  // ---- Utility belt (south of campus) ----
  { id: "B-CUP",   name: "Central Utility Plant",  kind: "utility", x: -16, z:  24, w: 10, d: 6,  h: 8.0, status: "running",     utilization: 74, health: 93, powerMW: 5.2,  owner: "Facilities",   criticality: "Critical", equipmentCount: 28, sensorCount: 980 },
  { id: "B-COOL",  name: "Cooling Plant",          kind: "cooling", x:  -2, z:  24, w: 9,  d: 6,  h: 6.5, status: "maintenance", utilization: 58, health: 82, powerMW: 3.1,  owner: "Facilities",   criticality: "Critical", equipmentCount: 16, sensorCount: 540 },
  { id: "B-SUB",   name: "Electrical Substation",  kind: "substation", x: 12, z: 24, w: 8,  d: 6,  h: 4.5, status: "running",     utilization: 81, health: 96, powerMW: 67.3, owner: "Facilities",   criticality: "Critical", equipmentCount: 22, sensorCount: 740 },

  // ---- Support (east edge) ----
  { id: "B-ENG",   name: "Engineering Building",   kind: "office", x:  28, z:  -6, w: 6, d: 12, h: 9.0, status: "running",     utilization: 0,  health: 99, powerMW: 0.8, owner: "Engineering", criticality: "Low",      equipmentCount: 0,  sensorCount: 210 },
  { id: "B-MAINT", name: "Maintenance Building",   kind: "office", x:  28, z:  10, w: 6, d: 8,  h: 5.5, status: "running",     utilization: 0,  health: 97, powerMW: 0.5, owner: "Maintenance", criticality: "Medium",   equipmentCount: 0,  sensorCount: 160 },
];

export const STATUS_COLOR: Record<BuildingMeta["status"], string> = {
  running: "#22c55e",
  idle: "#38bdf8",
  maintenance: "#f59e0b",
  warning: "#fbbf24",
  critical: "#ef4444",
  offline: "#64748b",
};

// AMHS overhead paths (rail) — list of waypoint pairs in [x,z]
export const AMHS_PATHS: Array<Array<[number, number]>> = [
  [[-18, -6], [-2, -6], [12, -6]],        // litho -> etch -> cmp
  [[-18, 10], [-2, 10], [12, 10]],         // metro -> diff -> film
  [[-18, -6], [-18, 10]],                  // litho -> metro
  [[12, -6], [12, 10]],                    // cmp -> film
  [[0, -22], [0, -6]],                     // amhs hub -> etch
];

// Ground road network — same structure, drawn on Y=0.02
export const ROADS: Array<Array<[number, number]>> = [
  [[-40, -16], [40, -16]],
  [[-40, 18], [40, 18]],
  [[-24, -28], [-24, 30]],
  [[22, -28], [22, 30]],
  [[0, -28], [0, 30]],
];
