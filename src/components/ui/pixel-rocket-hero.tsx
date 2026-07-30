"use client";

/**
 * Voxel pixel rocket that chases the cursor, trailed by pooled exhaust
 * particles, orbiting gold coins and a starfield — rendered with three.js
 * and a bloom pass.
 *
 * Loaded only through pixel-hero-loader.tsx so three.js (~600 KB) stays out
 * of every other route's bundle.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { cn } from "@/lib/utils";

const MAGENTA = 0xff00ff;
const CYAN = 0x00ffff;
const GOLD = 0xffd700;
const BG = 0x1a0033;

/** Voxel blocks making up the rocket, in local units. */
const ROCKET_VOXELS: Array<[number, number, number, number]> = [
  // [x, y, z, color]
  [0, 1.5, 0, 0xf8f5ff],
  [0, 0.5, 0, 0xf8f5ff],
  [-0.5, 0.5, 0, 0xf8f5ff],
  [0.5, 0.5, 0, 0xf8f5ff],
  [0, -0.5, 0, MAGENTA],
  [-0.5, -0.5, 0, MAGENTA],
  [0.5, -0.5, 0, MAGENTA],
  [-1, -1.5, 0, CYAN],
  [1, -1.5, 0, CYAN],
  [0, -1.5, 0, 0xf8f5ff],
];

interface Pooled {
  mesh: THREE.Mesh;
  life: number;
  velocity: THREE.Vector3;
}

export default function PixelRocketHero({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const small = window.matchMedia("(max-width: 640px)").matches;
    const STAR_COUNT = small ? 700 : 1500;
    const COIN_COUNT = small ? 10 : 20;
    const POOL_SIZE = small ? 40 : 80;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 18, 40);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / Math.max(1, mount.clientHeight),
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    } catch {
      return; // no WebGL — the CSS starfield fallback stays visible
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.PointLight(MAGENTA, 2.2, 40);
    key.position.set(6, 6, 10);
    scene.add(key);
    const rim = new THREE.PointLight(CYAN, 1.6, 40);
    rim.position.set(-7, -4, 8);
    scene.add(rim);

    // -- disposables -------------------------------------------------------
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const track = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
      if (x instanceof THREE.BufferGeometry) geometries.push(x);
      else materials.push(x);
      return x;
    };

    // -- rocket ------------------------------------------------------------
    const rocket = new THREE.Group();
    const voxel = track(new THREE.BoxGeometry(0.5, 0.5, 0.5));
    const voxelMats = new Map<number, THREE.MeshStandardMaterial>();
    for (const [x, y, z, color] of ROCKET_VOXELS) {
      let mat = voxelMats.get(color);
      if (!mat) {
        mat = track(
          new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.45,
            flatShading: true,
          }),
        );
        voxelMats.set(color, mat);
      }
      const block = new THREE.Mesh(voxel, mat);
      block.position.set(x, y, z);
      rocket.add(block);
    }
    rocket.scale.setScalar(0.9);
    scene.add(rocket);

    // -- exhaust pool ------------------------------------------------------
    const trailGeo = track(new THREE.BoxGeometry(0.18, 0.18, 0.18));
    const trailMat = track(
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.9 }),
    );
    const pool: Pooled[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = new THREE.Mesh(trailGeo, trailMat);
      mesh.visible = false;
      scene.add(mesh);
      pool.push({ mesh, life: 0, velocity: new THREE.Vector3() });
    }
    let poolCursor = 0;

    // -- coins -------------------------------------------------------------
    const coinGeo = track(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 8));
    const coinMat = track(
      new THREE.MeshStandardMaterial({
        color: GOLD,
        emissive: GOLD,
        emissiveIntensity: 0.6,
        flatShading: true,
      }),
    );
    const coins: Array<{ mesh: THREE.Mesh; spin: number; bob: number }> = [];
    for (let i = 0; i < COIN_COUNT; i++) {
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      const angle = (i / COIN_COUNT) * Math.PI * 2;
      const radius = 6 + (i % 3) * 1.6;
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 3.2, -2 - (i % 4));
      mesh.rotation.x = Math.PI / 2;
      scene.add(mesh);
      coins.push({ mesh, spin: 0.9 + (i % 5) * 0.25, bob: angle });
    }

    // -- starfield ---------------------------------------------------------
    const starGeo = track(new THREE.BufferGeometry());
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 70;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      starPos[i * 3 + 2] = -Math.random() * 45 - 4;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = track(
      new THREE.PointsMaterial({ color: 0xf8f5ff, size: 0.14, sizeAttenuation: true }),
    );
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // -- post-processing (bloom skipped on small screens for perf) ----------
    const composer = new EffectComposer(renderer);
    composer.setSize(mount.clientWidth, mount.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    let bloom: UnrealBloomPass | null = null;
    if (!small) {
      bloom = new UnrealBloomPass(
        new THREE.Vector2(mount.clientWidth, mount.clientHeight),
        0.9,
        0.6,
        0.15,
      );
      composer.addPass(bloom);
    }

    // -- pointer -----------------------------------------------------------
    const target = new THREE.Vector3(0, 0, 0);
    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      target.set(nx * 7.5, ny * 4.2, 0);
    };
    // Listen on the hero section, not window, so overlaid CTAs stay clickable.
    const host = mount.parentElement ?? mount;
    host.addEventListener("pointermove", onPointer);

    // -- resize ------------------------------------------------------------
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom?.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // -- run loop ----------------------------------------------------------
    let raf = 0;
    let visible = true;
    let onScreen = true;
    const clock = new THREE.Clock();

    const spawnTrail = () => {
      const p = pool[poolCursor];
      poolCursor = (poolCursor + 1) % pool.length;
      p.mesh.position.copy(rocket.position);
      p.mesh.position.y -= 1.1;
      p.mesh.visible = true;
      p.life = 1;
      p.velocity.set((Math.random() - 0.5) * 0.9, -1.6 - Math.random(), (Math.random() - 0.5) * 0.9);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      rocket.position.lerp(target, 1 - Math.pow(0.001, dt));
      rocket.rotation.z = THREE.MathUtils.lerp(
        rocket.rotation.z,
        (target.x - rocket.position.x) * -0.12,
        0.1,
      );
      rocket.rotation.y = Math.sin(t * 0.8) * 0.15;

      if (Math.random() < 0.7) spawnTrail();
      for (const p of pool) {
        if (p.life <= 0) continue;
        p.life -= dt * 1.6;
        if (p.life <= 0) {
          p.mesh.visible = false;
          continue;
        }
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.scale.setScalar(Math.max(0.01, p.life));
      }

      for (const c of coins) {
        c.mesh.rotation.z += c.spin * dt;
        c.mesh.position.y += Math.sin(t * 1.4 + c.bob) * dt * 0.6;
      }

      stars.rotation.z += dt * 0.012;
      composer.render();
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      const shouldRun = visible && onScreen;
      if (shouldRun && !raf) {
        clock.getDelta(); // drop the paused interval
        frame();
      } else if (!shouldRun) {
        stop();
      }
    };

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(mount);

    sync();

    return () => {
      stop();
      host.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      io.disconnect();
      composer.dispose();
      bloom?.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    />
  );
}
