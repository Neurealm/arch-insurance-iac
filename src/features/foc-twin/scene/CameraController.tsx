import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTwinStore, DEFAULT_CAMERA } from "../store";

/* Smooth camera controller. Handles
   - initial cinematic flyover (orbit + ease to iso 3/4)
   - external cam requests from store (e.g. double-click building)
   - ESC = reset to default overview
*/

export function CameraController() {
  const { camera, gl } = useThree();
  const controls = useRef<any>(null);
  const camRequest = useTwinStore((s) => s.camRequest);
  const resetCamera = useTwinStore((s) => s.resetCamera);
  const markReady = useTwinStore((s) => s.markReady);

  // animation state
  const anim = useRef<{
    active: boolean;
    t: number;
    duration: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTgt: THREE.Vector3;
    toTgt: THREE.Vector3;
  }>({
    active: false,
    t: 0,
    duration: 1.4,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTgt: new THREE.Vector3(),
    toTgt: new THREE.Vector3(),
  });

  // intro flyover
  const intro = useRef({ active: true, t: 0, duration: 3.5 });

  useEffect(() => {
    // start position high & far for cinematic intro
    camera.position.set(110, 90, 110);
    camera.lookAt(0, 0, 0);
    // mark ready slightly after mount so loading overlay can fade out
    const id = setTimeout(() => markReady(), 600);
    return () => clearTimeout(id);
  }, [camera, markReady]);

  // listen for ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetCamera();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetCamera]);

  // when camRequest nonce changes, kick off a smooth animation
  useEffect(() => {
    if (!controls.current) return;
    const a = anim.current;
    a.fromPos.copy(camera.position);
    a.toPos.set(...camRequest.pos);
    a.fromTgt.copy(controls.current.target);
    a.toTgt.set(...camRequest.target);
    a.t = 0;
    a.duration = 1.2;
    a.active = true;
    intro.current.active = false; // user took over
  }, [camRequest.nonce, camera]);

  useFrame((_, dt) => {
    // intro flyover: orbit slowly while pulling in toward iso
    if (intro.current.active) {
      intro.current.t += dt;
      const p = Math.min(1, intro.current.t / intro.current.duration);
      const eased = 1 - Math.pow(1 - p, 3);
      // orbit angle from ~135deg down to ~45deg
      const angle = Math.PI * 0.75 - eased * Math.PI * 0.5;
      const radius = 110 - eased * 50; // 110 -> 60
      const height = 90 - eased * 55;  // 90 -> 35
      camera.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      camera.lookAt(0, 0, 0);
      if (controls.current) controls.current.target.set(0, 0, 0);
      if (p >= 1) intro.current.active = false;
      return;
    }

    // explicit animation toward requested cam state
    if (anim.current.active && controls.current) {
      anim.current.t += dt;
      const p = Math.min(1, anim.current.t / anim.current.duration);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
      camera.position.lerpVectors(anim.current.fromPos, anim.current.toPos, eased);
      controls.current.target.lerpVectors(anim.current.fromTgt, anim.current.toTgt, eased);
      if (p >= 1) anim.current.active = false;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={15}
      maxDistance={160}
      target={[0, 0, 0]}
    />
  );
}
