import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BUILDINGS, AMHS_PATHS, ROADS, STATUS_COLOR } from "../buildings";
import { useTwinStore, type BuildingMeta } from "../store";

/* =====================================================================
   Scene primitives — built from primitives (no GLTF dependency) so the
   scene loads instantly and stays GPU-cheap. Buildings expose metadata
   and route hover/click/dblclick through the global twin store.
   ===================================================================== */

const KIND_TINT: Record<BuildingMeta["kind"], string> = {
  fab: "#cdd6e2",
  utility: "#b8c1cf",
  logistics: "#aab4c2",
  office: "#c2cad6",
  substation: "#8d97a5",
  cooling: "#a8b3c0",
};

/* ---------- Ground / roads / landscaping ---------- */

export function Ground() {
  return (
    <>
      {/* main slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0f1a" roughness={0.95} metalness={0} />
      </mesh>

      {/* paved campus area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.01, 0]}>
        <planeGeometry args={[110, 80]} />
        <meshStandardMaterial color="#141a26" roughness={0.9} />
      </mesh>

      {/* landscaped strips (subtle green tint) */}
      {[
        { x: 0, z: -32, w: 110, d: 6 },
        { x: 0, z: 34, w: 110, d: 6 },
      ].map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[s.x, 0.015, s.z]} receiveShadow>
          <planeGeometry args={[s.w, s.d]} />
          <meshStandardMaterial color="#0f1f17" roughness={1} />
        </mesh>
      ))}

      {/* parking lots (small grids) */}
      {[
        [-40, 28], [40, 28], [-40, -26], [40, -26],
      ].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial color="#0e1421" roughness={1} />
        </mesh>
      ))}

      {/* roads */}
      {ROADS.map((seg, i) => (
        <RoadSegment key={i} points={seg} />
      ))}

      {/* faint grid overlay */}
      <gridHelper args={[200, 80, "#0b1726", "#0b1726"]} position={[0, 0.005, 0]} />
    </>
  );
}

function RoadSegment({ points }: { points: Array<[number, number]> }) {
  // straight segments only — width 3 paved + center dashed line
  const segs: JSX.Element[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, z1] = points[i];
    const [x2, z2] = points[i + 1];
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const rot = Math.atan2(dz, dx);
    segs.push(
      <group key={i} position={[cx, 0.025, cz]} rotation={[-Math.PI / 2, 0, -rot]}>
        <mesh receiveShadow>
          <planeGeometry args={[len, 3]} />
          <meshStandardMaterial color="#1a2233" roughness={1} />
        </mesh>
        {/* dashed center line */}
        {Array.from({ length: Math.floor(len / 2) }).map((_, k) => (
          <mesh key={k} position={[-len / 2 + 1 + k * 2, 0, 0.01]}>
            <planeGeometry args={[0.8, 0.08]} />
            <meshBasicMaterial color="#3b4860" />
          </mesh>
        ))}
      </group>
    );
  }
  return <>{segs}</>;
}

/* ---------- Pipe rack (north-south utility corridor) ---------- */

export function PipeRack() {
  const pipes = useMemo(() => [0, 0.6, 1.2, 1.8], []);
  return (
    <group position={[-8, 0, 18]}>
      {/* supports every 4m */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[i * 4 - 14, 1.5, 0]} castShadow>
          <boxGeometry args={[0.25, 3, 0.25]} />
          <meshStandardMaterial color="#3a4658" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* horizontal pipes */}
      {pipes.map((y, i) => (
        <mesh key={i} position={[0, 2.6 + y * 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 30, 12]} />
          <meshStandardMaterial color={i === 0 ? "#7dd3fc" : i === 1 ? "#fcd34d" : i === 2 ? "#94a3b8" : "#67e8f9"} metalness={0.7} roughness={0.35} emissive={i === 0 ? "#1e3a8a" : "#000000"} emissiveIntensity={0.15} />
        </mesh>
      ))}
      {/* flow indicators */}
      <FlowIndicator y={2.6} color="#7dd3fc" />
      <FlowIndicator y={2.6 + 0.5} color="#fcd34d" />
    </group>
  );
}

function FlowIndicator({ y, color }: { y: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = (s.clock.elapsedTime % 4) / 4;
    ref.current.position.x = -14 + t * 28;
  });
  return (
    <mesh ref={ref} position={[-14, y, 0]}>
      <sphereGeometry args={[0.22, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
  );
}

/* ---------- AMHS overhead carriers ---------- */

export function AmhsNetwork() {
  return (
    <group>
      {AMHS_PATHS.map((path, i) => (
        <AmhsPath key={i} path={path} offset={i * 0.5} speed={6 + i * 0.7} />
      ))}
    </group>
  );
}

function AmhsPath({ path, offset, speed }: { path: Array<[number, number]>; offset: number; speed: number }) {
  // Build a polyline at y=9 (overhead) and run a glowing carrier along it
  const points = useMemo(
    () => path.map(([x, z]) => new THREE.Vector3(x, 9, z)),
    [path]
  );
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.0), [points]);
  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
    return g;
  }, [curve]);

  const carrier = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!carrier.current) return;
    const total = curve.getLength();
    const t = ((s.clock.elapsedTime * speed + offset * 4) % total) / total;
    const p = curve.getPointAt(t);
    carrier.current.position.copy(p);
  });

  return (
    <group>
      {/* rail */}
      <primitive object={new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: "#3a5a7a", transparent: true, opacity: 0.7 }))} />
      {/* supports (vertical poles to ground every other waypoint) */}
      {path.map(([x, z], i) =>
        i % 1 === 0 ? (
          <mesh key={i} position={[x, 4.5, z]}>
            <cylinderGeometry args={[0.08, 0.08, 9, 8]} />
            <meshStandardMaterial color="#3a4658" metalness={0.5} roughness={0.6} />
          </mesh>
        ) : null
      )}
      {/* carrier */}
      <mesh ref={carrier} castShadow>
        <boxGeometry args={[0.9, 0.4, 0.6]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.7} metalness={0.4} roughness={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------- Service vehicles on roads ---------- */

export function ServiceVehicles() {
  return (
    <>
      <RoadVehicle path={[[-40, -16], [40, -16]]} color="#fbbf24" speed={5} offset={0} />
      <RoadVehicle path={[[40, 18], [-40, 18]]} color="#22c55e" speed={4} offset={2} />
      <RoadVehicle path={[[0, -28], [0, 30]]} color="#38bdf8" speed={3.5} offset={1} />
    </>
  );
}

function RoadVehicle({ path, color, speed, offset }: { path: Array<[number, number]>; color: string; speed: number; offset: number }) {
  const points = useMemo(
    () => path.map(([x, z]) => new THREE.Vector3(x, 0.3, z)),
    [path]
  );
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = ((s.clock.elapsedTime * speed + offset * 10) % curve.getLength()) / curve.getLength();
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    ref.current.position.copy(p);
    ref.current.rotation.y = Math.atan2(tan.x, tan.z);
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.55, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0.1]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
    </group>
  );
}

/* ---------- Cooling tower fans ---------- */

export function CoolingFans({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      {[-1.6, 0, 1.6].map((dx, i) => (
        <Fan key={i} position={[dx, 0, 0]} speed={1 + i * 0.3} />
      ))}
    </group>
  );
}
function Fan({ position, speed }: { position: [number, number, number]; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed * 2;
  });
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.75, 0.75, 0.3, 24, 1, true]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <group ref={ref} position={[0, 0.2, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <boxGeometry args={[0.6, 0.04, 0.1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Steam puff ---------- */

function Steam({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = (s.clock.elapsedTime % 3) / 3;
    ref.current.position.y = position[1] + t * 3;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - t);
    ref.current.scale.setScalar(0.8 + t * 1.6);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.6, 10, 10]} />
      <meshBasicMaterial color="#e2e8f0" transparent opacity={0.3} />
    </mesh>
  );
}

/* ---------- Blinking utility light ---------- */

function BeaconLight({ position, color = "#ef4444" }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const v = 0.5 + Math.sin(s.clock.elapsedTime * 4) * 0.5;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + v * 2;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.15, 10, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
  );
}

/* ---------- Building ---------- */

export function Building({ b }: { b: BuildingMeta }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { hoveredId, selectedId, setHovered, setSelected, requestCamera } = useTwinStore();

  const isHover = hoveredId === b.id;
  const isSelected = selectedId === b.id;
  const baseColor = KIND_TINT[b.kind];
  const statusColor = STATUS_COLOR[b.status];

  // hover lift
  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const targetY = isHover || isSelected ? 0.18 : 0;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * Math.min(1, dt * 8);
  });

  // window rows generated as a single canvas-like texture: emulate by emissive stripes
  const winY = Math.max(1, Math.floor(b.h / 1.6));

  return (
    <group
      ref={groupRef}
      position={[b.x, 0, b.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(b.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(b.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setSelected(b.id);
        // fly camera to a nice 3-quarter view of this building
        const dist = Math.max(b.w, b.d) * 1.6 + 8;
        requestCamera(
          [b.x + dist * 0.8, b.h + dist * 0.6, b.z + dist * 0.9],
          [b.x, b.h / 2, b.z]
        );
      }}
    >
      {/* main mass */}
      <mesh ref={meshRef} castShadow receiveShadow position={[0, b.h / 2, 0]}>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.25}
          roughness={0.55}
          emissive={isSelected ? "#38bdf8" : isHover ? "#0ea5e9" : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : isHover ? 0.22 : 0}
        />
      </mesh>

      {/* roof detailing */}
      <mesh position={[0, b.h + 0.1, 0]} castShadow>
        <boxGeometry args={[b.w * 0.94, 0.2, b.d * 0.94]} />
        <meshStandardMaterial color="#404a5e" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* HVAC unit on roof */}
      <mesh position={[b.w * 0.25, b.h + 0.7, -b.d * 0.2]} castShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#52606d" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* window bands (front face) — emissive stripes for that "lit fab" look */}
      {Array.from({ length: winY }).map((_, i) => (
        <mesh
          key={`wf-${i}`}
          position={[0, 0.9 + i * 1.5, b.d / 2 + 0.01]}
        >
          <planeGeometry args={[b.w * 0.86, 0.45]} />
          <meshStandardMaterial
            color="#0c1424"
            emissive={statusColor}
            emissiveIntensity={b.status === "offline" ? 0 : 0.55}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* window bands (back face) */}
      {Array.from({ length: winY }).map((_, i) => (
        <mesh
          key={`wb-${i}`}
          position={[0, 0.9 + i * 1.5, -b.d / 2 - 0.01]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[b.w * 0.86, 0.45]} />
          <meshStandardMaterial color="#0c1424" emissive={statusColor} emissiveIntensity={b.status === "offline" ? 0 : 0.45} toneMapped={false} />
        </mesh>
      ))}

      {/* status base strip */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[b.w + 0.6, b.d + 0.6]} />
        <meshBasicMaterial color={statusColor} transparent opacity={isHover || isSelected ? 0.35 : 0.12} />
      </mesh>

      {/* selection outline ring */}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(b.w, b.d) * 0.7, Math.max(b.w, b.d) * 0.78, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      )}

      {/* tooltip */}
      {(isHover || isSelected) && (
        <Html
          position={[0, b.h + 1.6, 0]}
          center
          distanceFactor={28}
          style={{ pointerEvents: "none" }}
        >
          <div className="px-2.5 py-1.5 rounded-md bg-slate-900/95 border border-white/10 shadow-xl backdrop-blur text-[11px] text-white whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
              />
              <span className="font-semibold">{b.name}</span>
              <span className="text-slate-400">· {b.status}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Util {b.utilization}% · Health {b.health} · {b.powerMW.toFixed(1)} MW
            </div>
          </div>
        </Html>
      )}

      {/* small beacon for non-running buildings */}
      {(b.status === "critical" || b.status === "warning") && (
        <BeaconLight position={[b.w * 0.4, b.h + 0.6, b.d * 0.4]} color={statusColor} />
      )}
    </group>
  );
}

/* ---------- Special caps for utility buildings ---------- */

export function UtilityCaps() {
  const cup = BUILDINGS.find((b) => b.id === "B-CUP")!;
  const cool = BUILDINGS.find((b) => b.id === "B-COOL")!;
  const sub = BUILDINGS.find((b) => b.id === "B-SUB")!;
  return (
    <>
      <CoolingFans x={cool.x} y={cool.h + 0.3} z={cool.z} />
      <Steam position={[cup.x - 2, cup.h + 1, cup.z + 1]} />
      <Steam position={[cup.x + 2, cup.h + 1, cup.z - 1]} />
      {/* substation transformers */}
      <group position={[sub.x, 0, sub.z]}>
        {[-2, 0, 2].map((dx, i) => (
          <group key={i} position={[dx, 0, sub.d / 2 + 1.5]}>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[1.2, 2, 1]} />
              <meshStandardMaterial color="#3b4658" metalness={0.5} roughness={0.6} />
            </mesh>
            <mesh position={[0, 2.7, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

/* ---------- Entry gate ---------- */

export function EntryGate() {
  return (
    <group position={[-46, 0, -16]}>
      <mesh position={[0, 1.2, -2]} castShadow>
        <boxGeometry args={[1.5, 2.4, 1.5]} />
        <meshStandardMaterial color="#2a3445" />
      </mesh>
      <mesh position={[0, 1.2, 2]} castShadow>
        <boxGeometry args={[1.5, 2.4, 1.5]} />
        <meshStandardMaterial color="#2a3445" />
      </mesh>
      <BeaconLight position={[0, 2.6, 0]} color="#fbbf24" />
    </group>
  );
}
