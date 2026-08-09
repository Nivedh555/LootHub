"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { evalTimeline } from "./use-crate-timeline";

const LOOP = 12;
/** Frame shown when prefers-reduced-motion: lid open, light on, gem out. */
const BEAUTY_SHOT_T = 0.62;
const BURST_COUNT = 120;

/* ─── deterministic burst particles (no Math.random) ─── */
function createBurstData(count = BURST_COUNT) {
  const origins = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    // pseudo-random from index (deterministic)
    const a = ((i * 9301 + 49297) % 233280) / 233280;
    const b = ((i * 49297 + 9301) % 233280) / 233280;
    const c = ((i * 49297 + 233280) % 233280) / 233280;
    const theta = a * Math.PI * 2;
    const phi = b * Math.PI;
    const speed = 0.5 + c * 1.2;
    velocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[idx + 1] = Math.abs(Math.cos(phi)) * speed + 0.4; // bias upward
    velocities[idx + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    origins[idx] = 0;
    origins[idx + 1] = 0.9; // gem's emerged height
    origins[idx + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(origins.slice(), 3));
  return { geo, origins, velocities };
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
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, 0]}>
      <planeGeometry args={[2.4, 2.4]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/* ─── main animated content ─── */
function CrateContent({ reduced }: { reduced: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const set = useThree((s) => s.set);
  const invalidate = useThree((s) => s.invalidate);
  const tRef = useRef(reduced ? BEAUTY_SHOT_T : 0);

  // refs for animated objects
  const bodyGroup = useRef<THREE.Group>(null);
  const lidGroup = useRef<THREE.Group>(null);
  const lockMesh = useRef<THREE.Mesh>(null);
  const shackleGroup = useRef<THREE.Group>(null);
  const shackleMesh = useRef<THREE.Mesh>(null);
  const coneMesh = useRef<THREE.Mesh>(null);
  const pointLight = useRef<THREE.PointLight>(null);
  const gemGroup = useRef<THREE.Group>(null);
  const gemMesh = useRef<THREE.Mesh>(null);
  const gemGlow = useRef<THREE.Mesh>(null);
  const gemLight = useRef<THREE.PointLight>(null);
  const burstPoints = useRef<THREE.Points>(null);

  const cameraRest = useMemo(() => new THREE.Vector3(2, 1.6, 2.5), []);
  const cameraNear = useMemo(() => new THREE.Vector3(1.5, 1.25, 1.9), []);
  const cameraZoomV = useMemo(() => new THREE.Vector3(1.15, 1.05, 1.5), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);

  // Pause rendering entirely when offscreen or tab hidden (skip in reduced
  // mode — it's already on frameloop="demand" and renders exactly once).
  useEffect(() => {
    if (reduced) {
      invalidate();
      return;
    }
    let visible = true;
    const sync = () =>
      set({ frameloop: visible && !document.hidden ? "always" : "never" });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(gl.domElement);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced, gl, set, invalidate]);

  const burst = useMemo(() => createBurstData(), []);
  useEffect(() => () => burst.geo.dispose(), [burst]);

  useFrame((_, delta) => {
    if (!reduced) {
      // clamp so a background-tab resume doesn't jump the timeline
      tRef.current += Math.min(delta, 0.1) / LOOP;
      if (tRef.current >= 1) tRef.current -= 1;
    }

    const t = tRef.current;
    const f = evalTimeline(t);

    // Body float + yaw + shiver (shiver as tiny x-wobble = anticipation)
    if (bodyGroup.current) {
      bodyGroup.current.position.y = f.bodyY;
      bodyGroup.current.rotation.y = f.bodyYaw + Math.sin(t * 240) * f.shiver;
    }

    // Camera dolly (rest → front-quarter → zoom); reduced = snap, else smooth
    camTarget
      .lerpVectors(cameraRest, cameraNear, f.cameraBlend)
      .lerp(cameraZoomV, f.cameraZoom);
    if (reduced) camera.position.copy(camTarget);
    else camera.position.lerp(camTarget, 1 - Math.pow(0.001, delta));
    camera.lookAt(0, 0.25, 0);

    // Lid hinge rotation
    if (lidGroup.current) lidGroup.current.rotation.x = f.lidRotation;

    // Lock emissive + shackle + opacity
    if (lockMesh.current) {
      (lockMesh.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        f.lockEmissive;
    }
    if (shackleGroup.current) {
      shackleGroup.current.rotation.x = f.shackleOpen * Math.PI * 0.6;
      shackleGroup.current.position.y = 0.22 - f.shackleOpen * 0.05;
    }
    if (shackleMesh.current) {
      (shackleMesh.current.material as THREE.MeshStandardMaterial).opacity =
        f.lockOpacity;
    }

    // Volumetric cone + interior light
    if (coneMesh.current) {
      coneMesh.current.scale.set(f.coneScale, f.coneScale, f.coneScale);
      coneMesh.current.visible = f.coneScale > 0.001;
      (coneMesh.current.material as THREE.MeshBasicMaterial).opacity =
        f.coneScale * 0.14;
    }
    if (pointLight.current) pointLight.current.intensity = f.lightIntensity;

    // Gem — position/scale/spin are pure functions of t (loop-safe)
    if (gemGroup.current) {
      gemGroup.current.position.y = 0.25 + f.gemRise * 0.65;
      gemGroup.current.position.z = Math.sin(f.gemRise * Math.PI) * 0.12;
      gemGroup.current.scale.setScalar(Math.max(f.gemScale, 0.0001));
      gemGroup.current.visible = f.gemScale > 0.001;
    }
    if (gemMesh.current) {
      gemMesh.current.rotation.y = f.gemSpin * Math.PI * 5 + f.gemRise * 0.8;
      gemMesh.current.rotation.x = Math.sin(f.gemSpin * Math.PI * 2) * 0.15;
      (gemMesh.current.material as THREE.MeshStandardMaterial).opacity =
        f.gemOpacity;
    }
    if (gemGlow.current) {
      gemGlow.current.quaternion.copy(camera.quaternion); // billboard
      (gemGlow.current.material as THREE.MeshBasicMaterial).opacity =
        f.gemOpacity * 0.3;
    }
    if (gemLight.current) gemLight.current.intensity = f.gemOpacity * f.gemRise * 2;

    // Burst particles — positions derived from burstExpand (no accumulation,
    // so the loop resets cleanly)
    if (burstPoints.current) {
      burstPoints.current.visible = f.burstOpacity > 0.001;
      if (burstPoints.current.visible) {
        const pos = burstPoints.current.geometry.attributes.position
          .array as Float32Array;
        const { origins, velocities } = burst;
        const spread = f.burstExpand * 0.9;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] = origins[i] + velocities[i] * spread;
          pos[i + 1] =
            origins[i + 1] + velocities[i + 1] * spread - spread * spread * 0.3; // gravity
          pos[i + 2] = origins[i + 2] + velocities[i + 2] * spread;
        }
        burstPoints.current.geometry.attributes.position.needsUpdate = true;
      }
      (burstPoints.current.material as THREE.PointsMaterial).opacity =
        f.burstOpacity;
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.35} color="#b9a9d6" />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#a7f3d0" />
      <pointLight position={[-2, 2, -3]} intensity={0.6} color="#6ee7b7" />

      {/* Body + Lid group */}
      <group ref={bodyGroup}>
        {/* Crate body */}
        <RoundedBox args={[1.2, 0.7, 0.9]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#1e0f3a" roughness={0.55} metalness={0.2} />
        </RoundedBox>

        {/* Trim strips */}
        <mesh position={[0, 0, 0.46]}>
          <boxGeometry args={[1.22, 0.72, 0.02]} />
          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.46]}>
          <boxGeometry args={[1.22, 0.72, 0.02]} />
          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.92, 0.72, 0.02]} />
          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-0.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.92, 0.72, 0.02]} />
          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Lock body */}
        <mesh ref={lockMesh} position={[0, 0.08, 0.48]}>
          <boxGeometry args={[0.18, 0.22, 0.08]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        {/* Lock shackle — grouped so rotation pivots at its base */}
        <group ref={shackleGroup} position={[0, 0.22, 0.48]}>
          <mesh ref={shackleMesh}>
            <torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color="#6ee7b7"
              roughness={0.2}
              metalness={0.9}
              transparent
            />
          </mesh>
        </group>

        {/* Hinge group for lid — pivot at back-top edge */}
        <group ref={lidGroup} position={[0, 0.35, -0.46]}>
          <group position={[0, 0.11, 0.46]}>
            <RoundedBox args={[1.25, 0.22, 0.95]} radius={0.04} smoothness={4}>
              <meshStandardMaterial color="#1e0f3a" roughness={0.55} metalness={0.2} />
            </RoundedBox>
            <mesh position={[0, 0, 0.47]}>
              <boxGeometry args={[1.27, 0.24, 0.02]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, -0.47]}>
              <boxGeometry args={[1.27, 0.24, 0.02]} />
              <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* Interior point light */}
        <pointLight
          ref={pointLight}
          position={[0, 0.4, 0]}
          intensity={0}
          color="#d8b4fe"
          distance={3}
        />

        {/* Volumetric light cone (apex down inside the crate, opens upward) */}
        <mesh ref={coneMesh} position={[0, 1.05, 0]} visible={false}>
          <coneGeometry args={[0.55, 1.5, 32, 1, true]} />
          <meshBasicMaterial
            color="#a7f3d0"
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Gem (group animates position/scale; mesh spins inside it) */}
        <group ref={gemGroup} position={[0, 0.25, 0]} visible={false}>
          <mesh ref={gemMesh}>
            <icosahedronGeometry args={[0.18, 1]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#6ee7b7"
              emissiveIntensity={2}
              roughness={0.1}
              metalness={0.1}
              flatShading
              transparent
            />
          </mesh>
          {/* Additive glow sprite billboarded to camera */}
          <mesh ref={gemGlow}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial
              color="#6ee7b7"
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
        <pointLight ref={gemLight} position={[0, 0.9, 0]} intensity={0} color="#d8b4fe" distance={2} />

        {/* Burst particles */}
        <points ref={burstPoints} geometry={burst.geo} visible={false}>
          <pointsMaterial
            size={0.045}
            color="#d8b4fe"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      {/* Ambient sparkles */}
      <Sparkles count={50} scale={[2.6, 2.2, 2.6]} size={2} speed={0.4} opacity={0.5} color="#a7f3d0" />

      {/* Ground shadow */}
      <ContactShadow />
    </group>
  );
}

export default function CrateScene({ size = 330 }: { size?: number }) {
  // ssr:false — window always exists; read once, listener not needed for the
  // initial frameloop choice (CrateContent handles live changes).
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  // Leak-proof across navigations: drop the GL context on unmount.
  useEffect(
    () => () => {
      glRef.current?.dispose();
      glRef.current?.forceContextLoss();
    },
    [],
  );

  return (
    <div style={{ width: size, height: size }} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [2, 1.6, 2.5], fov: 38, near: 0.1, far: 20 }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <Suspense fallback={null}>
          <CrateContent reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
