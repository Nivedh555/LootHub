"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { evalTimeline } from "./use-crate-timeline";

const LOOP = 12;

/* ─── deterministic burst particles (no Math.random) ─── */
function createBurstGeometry(count = 120) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    // pseudo-random from index
    const a = ((i * 9301 + 49297) % 233280) / 233280;
    const b = ((i * 49297 + 9301) % 233280) / 233280;
    const c = ((i * 49297 + 233280) % 233280) / 233280;
    const theta = a * Math.PI * 2;
    const phi = b * Math.PI;
    const speed = 0.5 + c * 1.5;
    velocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[idx + 1] = Math.cos(phi) * speed + 0.5; // bias upward
    velocities[idx + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    positions[idx] = 0;
    positions[idx + 1] = 0.3;
    positions[idx + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  return geo;
}

/* ─── ground contact shadow (simple gradient sprite) ─── */
function ContactShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.45)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, 0]}>
      <planeGeometry args={[2.4, 2.4]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/* ─── main animated content ─── */
function CrateContent() {
  const { camera } = useThree();
  const reduced = useRef(false);
  const [paused, setPaused] = useState(false);
  const tRef = useRef(0);

  // refs for animated objects
  const bodyGroup = useRef<THREE.Group>(null);
  const lidGroup = useRef<THREE.Group>(null);
  const lockMesh = useRef<THREE.Mesh>(null);
  const shackleMesh = useRef<THREE.Mesh>(null);
  const coneMesh = useRef<THREE.Mesh>(null);
  const pointLight = useRef<THREE.PointLight>(null);
  const gemMesh = useRef<THREE.Mesh>(null);
  const gemLight = useRef<THREE.PointLight>(null);
  const burstPoints = useRef<THREE.Points>(null);
  const cameraRest = useMemo(() => new THREE.Vector3(2, 1.6, 2.5), []);
  const cameraNear = useMemo(() => new THREE.Vector3(1.4, 1.2, 1.8), []);
  const cameraZoom = useMemo(() => new THREE.Vector3(1.1, 1.0, 1.4), []);

  // reduced motion (client-only, never SSR'd)
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = m.matches;
    const handler = (e: MediaQueryListEvent) => {
      reduced.current = e.matches;
      if (e.matches) {
        tRef.current = 0.6; // freeze at hero frame
      }
    };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver + visibilitychange
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(canvas);
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const burstGeo = useMemo(() => createBurstGeometry(), []);

  useFrame((_, delta) => {
    if (paused || reduced.current) {
      // When reduced motion is active, we keep rendering but don't advance t
      // tRef is pinned at 0.6 by the effect above
      // We still apply the current frame so the scene looks like a static beauty shot
    } else {
      tRef.current += delta / LOOP;
      if (tRef.current > 1) tRef.current -= 1;
    }

    const f = evalTimeline(tRef.current);

    // Body float + yaw + shiver
    if (bodyGroup.current) {
      bodyGroup.current.position.y = f.bodyY + f.shiver;
      bodyGroup.current.rotation.y = f.bodyYaw;
    }

    // Camera dolly (rest → near front-quarter)
    const camTarget = new THREE.Vector3()
      .lerpVectors(cameraRest, cameraNear, f.cameraBlend)
      .lerp(cameraZoom, f.cameraZoom);
    camera.position.lerp(camTarget, 0.08);
    camera.lookAt(0, 0.2, 0);

    // Lid hinge rotation
    if (lidGroup.current) {
      lidGroup.current.rotation.x = f.lidRotation;
    }

    // Lock emissive + shackle + opacity
    if (lockMesh.current) {
      const mat = lockMesh.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = f.lockEmissive;
    }
    if (shackleMesh.current) {
      shackleMesh.current.rotation.x = f.shackleOpen * Math.PI * 0.65;
      shackleMesh.current.position.y = -f.shackleOpen * 0.06;
      const mat = shackleMesh.current.material as THREE.MeshStandardMaterial;
      mat.opacity = f.lockOpacity;
      mat.transparent = true;
    }

    // Volumetric cone
    if (coneMesh.current) {
      coneMesh.current.scale.setScalar(f.coneScale);
      const mat = coneMesh.current.material as THREE.MeshBasicMaterial;
      mat.opacity = f.coneScale * 0.15;
    }

    // Interior light
    if (pointLight.current) {
      pointLight.current.intensity = f.lightIntensity;
    }

    // Gem
    if (gemMesh.current) {
      gemMesh.current.position.y = 0.35 + f.gemRise * 0.7;
      gemMesh.current.position.z = Math.sin(f.gemRise * Math.PI) * 0.15;
      gemMesh.current.scale.setScalar(f.gemScale);
      gemMesh.current.rotation.y += delta * 2 * f.gemSpin;
      const mat = gemMesh.current.material as THREE.MeshStandardMaterial;
      mat.opacity = f.gemOpacity;
      mat.transparent = f.gemOpacity < 1;
    }
    if (gemLight.current) {
      gemLight.current.intensity = f.gemOpacity * 2;
    }

    // Burst particles
    if (burstPoints.current) {
      const pos = burstPoints.current.geometry.attributes.position.array as Float32Array;
      const vel = burstPoints.current.geometry.attributes.velocity.array as Float32Array;
      for (let i = 0; i < pos.length / 3; i++) {
        const idx = i * 3;
        pos[idx] += vel[idx] * delta * f.burstExpand;
        pos[idx + 1] += vel[idx + 1] * delta * f.burstExpand;
        pos[idx + 2] += vel[idx + 2] * delta * f.burstExpand;
      }
      burstPoints.current.geometry.attributes.position.needsUpdate = true;
      (burstPoints.current.material as THREE.PointsMaterial).opacity = f.burstOpacity;
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#b9a9d6" />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#c4b5fd" castShadow={false} />
      <pointLight position={[-2, 2, -3]} intensity={0.6} color="#a78bfa" />

      {/* Body + Lid group */}
      <group ref={bodyGroup}>
        {/* Crate body */}
        <RoundedBox args={[1.2, 0.7, 0.9]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color="#1e0f3a" roughness={0.6} metalness={0.15} />
        </RoundedBox>

        {/* Trim strips */}
        <mesh position={[0, 0, 0.46]}>
          <boxGeometry args={[1.22, 0.72, 0.02]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.46]}>
          <boxGeometry args={[1.22, 0.72, 0.02]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.92, 0.72, 0.02]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-0.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.92, 0.72, 0.02]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Lock body */}
        <mesh ref={lockMesh} position={[0, 0.08, 0.48]}>
          <boxGeometry args={[0.18, 0.22, 0.08]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0} roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Lock shackle */}
        <mesh ref={shackleMesh} position={[0, 0.22, 0.48]}>
          <torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.2} metalness={0.9} transparent />
        </mesh>

        {/* Hinge group for lid */}
        <group ref={lidGroup} position={[0, 0.35, -0.46]}>
          {/* Lid */}
          <RoundedBox args={[1.25, 0.22, 0.95]} radius={0.04} smoothness={4} castShadow>
            <meshStandardMaterial color="#1e0f3a" roughness={0.6} metalness={0.15} />
          </RoundedBox>
          {/* Lid trim */}
          <mesh position={[0, 0, 0.48]}>
            <boxGeometry args={[1.27, 0.24, 0.02]} />
            <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.48]}>
            <boxGeometry args={[1.27, 0.24, 0.02]} />
            <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* Interior point light */}
        <pointLight ref={pointLight} position={[0, 0.2, 0]} intensity={0} color="#d8b4fe" distance={3} />

        {/* Volumetric light cone */}
        <mesh ref={coneMesh} position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.45, 1.6, 32, 1, true]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Gem */}
        <mesh ref={gemMesh} position={[0, 0.35, 0]}>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color="#7c3aed" emissive="#a78bfa" emissiveIntensity={2} roughness={0.1} metalness={0.1} transparent />
        </mesh>
        <pointLight ref={gemLight} position={[0, 0.35, 0]} intensity={0} color="#d8b4fe" distance={2} />

        {/* Glow sprite behind gem */}
        <mesh position={[0, 0.35, -0.1]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Ambient sparkles */}
      <Sparkles count={60} scale={3} size={2} speed={0.4} opacity={0.6} color="#c4b5fd" />

      {/* Burst particles */}
      <points ref={burstPoints} geometry={burstGeo}>
        <pointsMaterial size={0.04} color="#d8b4fe" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Ground shadow */}
      <ContactShadow />
    </group>
  );
}

export default function CrateScene({ size = 330 }: { size?: number }) {
  const [reduced] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [2, 1.6, 2.5], fov: 38, near: 0.1, far: 20 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <Suspense fallback={null}>
          <CrateContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
