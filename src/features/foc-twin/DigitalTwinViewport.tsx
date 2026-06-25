import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, AdaptiveDpr, AdaptiveEvents, BakeShadows } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { BUILDINGS } from "./buildings";
import { useTwinStore } from "./store";
import { CameraController } from "./scene/CameraController";
import {
  AmhsNetwork,
  Building,
  EntryGate,
  Ground,
  PipeRack,
  ServiceVehicles,
  UtilityCaps,
} from "./scene/SceneObjects";
import { CameraToolbar, LayerToolbar, MiniMap, SceneLegend, TelemetryOverlay } from "./Overlays";

/* =====================================================================
   DigitalTwinViewport — interactive 3D semiconductor campus.
   Replaces the Prompt-1 placeholder; everything else on the page is
   preserved. Mounted inside the existing FactoryOverview card slot.
   ===================================================================== */

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#7ea7d6", "#0b0f1a", 0.5]} />
      <directionalLight
        castShadow
        position={[60, 80, 40]}
        intensity={1.1}
        color={"#ffe9c8"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
      />
      {/* rim accent */}
      <directionalLight position={[-50, 30, -40]} intensity={0.35} color={"#6ec1ff"} />
    </>
  );
}

function CameraTracker({ onUpdate }: { onUpdate: (p: { x: number; z: number; rot: number }) => void }) {
  const { camera } = useThree();
  useFrame(() => {
    // angle of camera in XZ plane relative to target (0,0,0)-ish — used by minimap arrow
    const rot = Math.atan2(camera.position.x, camera.position.z);
    onUpdate({ x: camera.position.x, z: camera.position.z, rot: -rot });
  });
  return null;
}

function FactoryScene() {
  // gpu instancing optimization left to drei batching in later prompts; for 15
  // buildings, draw-calls are negligible
  return (
    <>
      <Lighting />
      <Environment preset="city" />
      <Ground />
      <PipeRack />
      <AmhsNetwork />
      <ServiceVehicles />
      <EntryGate />
      <UtilityCaps />
      {BUILDINGS.map((b) => (
        <Building key={b.id} b={b} />
      ))}
      <ContactShadows
        position={[0, 0.04, 0]}
        opacity={0.55}
        scale={140}
        blur={2.4}
        far={20}
        color="#000"
      />
      <BakeShadows />
    </>
  );
}

function LoadingOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-30 grid place-items-center bg-[#06080f]/85 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-14 w-14">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-sky-400/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
                style={{ borderRightColor: "transparent", borderBottomColor: "transparent" }}
              />
              <div className="absolute inset-2 rounded-full bg-sky-400/10 border border-sky-400/30 grid place-items-center text-sky-300 font-bold">
                3D
              </div>
            </div>
            <div className="text-[12px] uppercase tracking-[0.2em] text-sky-300/90">
              Initializing Digital Twin
            </div>
            <div className="text-[11px] text-slate-400">
              Loading campus geometry · lighting · telemetry channels
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DigitalTwinViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loading = useTwinStore((s) => s.loading);
  const resetCamera = useTwinStore((s) => s.resetCamera);
  const camRequest = useTwinStore((s) => s.camRequest);
  const [camPos, setCamPos] = useState({ x: 42, z: 42, rot: 0 });

  // pinned proxy for OrbitControls actions; we trigger via re-requesting the
  // store with a slightly modified distance to camera position
  const onZoom = (delta: number) => {
    const dir = new THREE.Vector3(camPos.x, 0, camPos.z);
    const len = dir.length() || 1;
    const newLen = Math.max(20, Math.min(150, len + delta * 12));
    dir.multiplyScalar(newLen / len);
    useTwinStore
      .getState()
      .requestCamera([dir.x, 25 + (newLen / 150) * 25, dir.z], [0, 0, 0]);
  };

  const onFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[460px] w-full overflow-hidden rounded-lg border border-white/[0.06] bg-[radial-gradient(ellipse_at_center,_rgba(15,23,42,1),_#04060c)]"
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [110, 90, 110], fov: 38, near: 0.5, far: 500 }}
      >
        <color attach="background" args={["#04070d"]} />
        <fog attach="fog" args={["#04070d", 90, 220]} />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <FactoryScene />
        </Suspense>
        <CameraController />
        <CameraTracker onUpdate={setCamPos} />
      </Canvas>

      {/* overlays */}
      <LayerToolbar />
      <SceneLegend />
      <CameraToolbar onZoom={onZoom} onReset={resetCamera} onFullscreen={onFullscreen} />
      <MiniMap camPos={camPos} />
      <TelemetryOverlay />
      <LoadingOverlay show={loading} />

      {/* selection hint footer */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[10.5px] text-slate-500 px-2.5 py-1 rounded-md bg-slate-950/70 border border-white/[0.06]">
        Drag to orbit · scroll to zoom · double-click building to fly · <kbd className="px-1 bg-white/10 rounded">Esc</kbd> to reset
      </div>
    </div>
  );
}

export default DigitalTwinViewport;
