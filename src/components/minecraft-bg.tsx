"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

const BLOCK = 32; // pixel block size

export function MinecraftBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const maxParticles = 80;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Pre-compute terrain blocks ──
    function terrainBlocks() {
      const cw = canvas!.width / (window.devicePixelRatio || 1);
      const ch = canvas!.height / (window.devicePixelRatio || 1);
      const blocks: { x: number; y: number; w: number; h: number; topColor: string; sideColor: string }[] = [];

      // 3 layers of terrain at bottom
      const layerHeight = BLOCK;
      const baseY = ch - layerHeight * 3;

      for (let row = 0; row < 3; row++) {
        for (let x = 0; x < cw + BLOCK; x += BLOCK) {
          const y = baseY + row * layerHeight;
          if (row === 0) {
            // Grass layer — colored top (green), brown sides
            blocks.push({
              x, y, w: BLOCK, h: layerHeight,
              topColor: Math.random() > 0.5 ? "#7ec850" : "#5a9e3a",
              sideColor: Math.random() > 0.5 ? "#8b6914" : "#6b4f10",
            });
          } else if (row === 1) {
            // Dirt layer
            blocks.push({
              x, y, w: BLOCK, h: layerHeight,
              topColor: Math.random() > 0.5 ? "#8b6914" : "#a0782c",
              sideColor: Math.random() > 0.5 ? "#6b4f10" : "#8b6914",
            });
          } else {
            // Stone layer
            const stoneColors = ["#7a7a7a", "#8a8a8a", "#6a6a6a", "#909090"];
            const sc = stoneColors[Math.floor(Math.random() * stoneColors.length)];
            blocks.push({
              x, y, w: BLOCK, h: layerHeight,
              topColor: sc,
              sideColor: sc,
            });
          }
        }
      }
      return blocks;
    }

    let tBlocks = terrainBlocks();

    function drawBlock(x: number, y: number, w: number, h: number, tl: string, tr: string, bl: string, br: string) {
      // Top face
      ctx!.fillStyle = tl;
      ctx!.fillRect(x + w * 0.12, y, w * 0.76, h * 0.12);
      // Front face
      ctx!.fillStyle = bl;
      ctx!.fillRect(x, y + h * 0.12, w, h * 0.88);
      // Left side highlight
      ctx!.fillStyle = tl;
      ctx!.fillRect(x, y + h * 0.12, w * 0.12, h * 0.88);
      // Right side shadow
      ctx!.fillStyle = br;
      ctx!.fillRect(x + w * 0.88, y + h * 0.12, w * 0.12, h * 0.88);
      // Border
      ctx!.strokeStyle = "rgba(0,0,0,0.3)";
      ctx!.lineWidth = 1;
      ctx!.strokeRect(x, y, w, h);
    }

    function drawTerrain() {
      // Recompute when resized
      for (const b of tBlocks) {
        const light = b.topColor;
        const dark = b.sideColor;
        // Simpler: just draw filled rect with border
        ctx!.fillStyle = dark;
        ctx!.fillRect(b.x, b.y, b.w, b.h);
        // Top highlight strip
        ctx!.fillStyle = light;
        ctx!.fillRect(b.x, b.y, b.w, b.h * 0.22);
        // Grid lines
        ctx!.strokeStyle = "rgba(0,0,0,0.25)";
        ctx!.lineWidth = 1;
        ctx!.strokeRect(b.x, b.y, b.w, b.h);
      }
    }

    function spawnParticle() {
      if (particles.length >= maxParticles) return;
      if (Math.random() > 0.3) return;
      const greens = [
        "rgba(126, 200, 80, 0.7)",
        "rgba(90, 158, 58, 0.65)",
        "rgba(160, 210, 100, 0.6)",
        "rgba(100, 180, 60, 0.55)",
      ];
      particles.push({
        x: Math.random() * (canvas!.width / (window.devicePixelRatio || 1)),
        y: -10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 1.2 + 0.4,
        size: Math.random() * 5 + 2,
        color: greens[Math.floor(Math.random() * greens.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 350 + 200,
      });
    }

    function drawParticles() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.003;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
      }
      particles = particles.filter((p) => p.alpha > 0);

      for (const p of particles) {
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        // Square pixel particles
        ctx!.fillStyle = p.color;
        ctx!.fillRect(p.x, p.y, p.size, p.size);
        // Glow
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = 6;
        ctx!.fillRect(p.x, p.y, p.size, p.size);
        ctx!.shadowBlur = 0;
        ctx!.restore();
      }
    }

    function drawSkyGradient() {
      const ch = canvas!.height / (window.devicePixelRatio || 1);
      const grad = ctx!.createLinearGradient(0, 0, 0, ch);
      grad.addColorStop(0, "#1a1a2e");
      grad.addColorStop(0.3, "#16213e");
      grad.addColorStop(0.7, "#0f3460");
      grad.addColorStop(1, "#1a1a2e");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, canvas!.width, ch);
    }

    function drawVignette() {
      const cw = canvas!.width / (window.devicePixelRatio || 1);
      const ch = canvas!.height / (window.devicePixelRatio || 1);
      // Top vignette only (keep terrain visible)
      const grad = ctx!.createLinearGradient(0, 0, 0, ch * 0.35);
      grad.addColorStop(0, "rgba(8, 6, 16, 0.7)");
      grad.addColorStop(1, "rgba(8, 6, 16, 0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, cw, ch * 0.35);
    }

    function animate() {
      // Don't fully clear — trail effect
      ctx!.fillStyle = "rgba(10, 10, 25, 0.15)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      drawSkyGradient();
      drawTerrain();
      spawnParticle();
      drawParticles();
      drawVignette();

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
