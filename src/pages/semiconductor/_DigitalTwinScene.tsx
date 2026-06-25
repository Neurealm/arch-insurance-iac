import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";

function PlasmaCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.06);
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.2 + Math.sin(t * 3) * 0.6;
  });
  return (
    <mesh ref={ref} position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial color="#ff3b5c" emissive="#ff3b5c" emissiveIntensity={2.5} transparent opacity={0.85} />
    </mesh>
  );
}

function Chamber() {
  return (
    <group>
      <mesh position={[0, -1.1, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.2, 3.6]} />
        <meshStandardMaterial color="#0c1424" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.2, 2.2, 2.6]} />
        <meshStandardMaterial color="#1a2438" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.05, 1.31]}>
        <cylinderGeometry args={[0.78, 0.78, 0.04, 48]} />
        <meshStandardMaterial color="#000814" emissive="#ff2b4a" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 1.34]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.05, 16, 64]} />
        <meshStandardMaterial color="#ff3b5c" emissive="#ff3b5c" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.05, 1.36]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.015, 16, 64]} />
        <meshStandardMaterial color="#ff5577" emissive="#ff5577" emissiveIntensity={1.2} transparent opacity={0.6} />
      </mesh>
      <group position={[0, 0.05, 0.9]}>
        <PlasmaCore />
      </group>
      <mesh position={[-2.4, -0.2, 0]}>
        <boxGeometry args={[1.4, 1.8, 2.4]} />
        <meshStandardMaterial color="#141d2f" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[2.4, -0.2, 0]}>
        <boxGeometry args={[1.4, 1.8, 2.4]} />
        <meshStandardMaterial color="#141d2f" metalness={0.7} roughness={0.35} />
      </mesh>
      {[-2.4, 2.4].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 1.21]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.7, 24]} />
        <meshStandardMaterial color="#1a2438" metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[-1.6, -0.85, 1.8]}>
        <mesh>
          <boxGeometry args={[0.9, 0.4, 0.6]} />
          <meshStandardMaterial color="#0f1a2e" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshBasicMaterial color="#0a1428" />
      </mesh>
    </group>
  );
}

function SceneInner() {
  const cam = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!cam.current) return;
    const t = s.clock.elapsedTime * 0.15;
    cam.current.rotation.y = Math.sin(t) * 0.12;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 6, 5]} intensity={1.1} color="#dbeafe" />
      <pointLight position={[0, 0.5, 1.5]} intensity={2.2} color="#ff3b5c" distance={6} />
      <pointLight position={[-3, 2, 3]} intensity={1.2} color="#60a5fa" />
      <pointLight position={[3, 2, 3]} intensity={1.0} color="#22d3ee" />
      <group ref={cam}>
        <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.15}>
          <Chamber />
        </Float>
      </group>
    </>
  );
}

export default function DigitalTwinScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [4.5, 2.2, 5.5], fov: 42 }}
      className="!h-[480px]"
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#06101f"]} />
      <SceneInner />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={9} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
