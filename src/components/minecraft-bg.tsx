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

const BLOCK_SIZE = 64;
const COLORS = [
  "rgba(93, 181, 94, 0.6)",   // grass green
  "rgba(93, 181, 94, 0.4)",
  "rgba(67, 167, 68, 0.5)",   // dark green
  "rgba(128, 199, 132, 0.35)", // light green
  "rgba(139, 69, 19, 0.3)",   // dirt brown
  "rgba(160, 82, 45, 0.25)",  // brown
  "rgba(205, 127, 50, 0.2)",  // bronze
  "rgba(255, 255, 100, 0.5)", // torch yellow
  "rgba(255, 220, 80, 0.4)",  // gold
];

export function MinecraftBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const maxParticles = 60;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function blockGrid() {
      ctx!.save();
      ctx!.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx!.lineWidth = 1;
      for (let x = 0; x < canvas!.width; x += BLOCK_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, canvas!.height);
        ctx!.stroke();
      }
      for (let y = 0; y < canvas!.height; y += BLOCK_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(canvas!.width, y);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function spawnParticle() {
      if (Math.random() > 0.35) return;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * canvas!.width,
        y: -10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 0.8 + 0.3,
        size: Math.random() * 4 + 1.5,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 400 + 250,
      });
    }

    function drawParticles() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.002;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;
      }
      particles = particles.filter((p) => p.alpha > 0);

      for (const p of particles) {
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;

        // Draw as small square pixel
        ctx!.fillRect(p.x, p.y, p.size, p.size);

        // Pixel glow
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = p.size * 2;
        ctx!.fillRect(p.x, p.y, p.size, p.size);
        ctx!.shadowBlur = 0;

        ctx!.restore();
      }
    }

    function drawVignette() {
      const gradient = ctx!.createRadialGradient(
        canvas!.width / 2, canvas!.height / 2, canvas!.width * 0.3,
        canvas!.width / 2, canvas!.height / 2, canvas!.width * 0.75
      );
      gradient.addColorStop(0, "rgba(8, 6, 16, 0)");
      gradient.addColorStop(1, "rgba(8, 6, 16, 0.55)");
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    function drawBottomGrass() {
      ctx!.save();
      // Subtle grass strip at the very bottom
      const h = canvas!.height * 0.06;
      const y = canvas!.height - h;
      const grad = ctx!.createLinearGradient(0, y, 0, canvas!.height);
      grad.addColorStop(0, "rgba(93, 181, 94, 0)");
      grad.addColorStop(0.5, "rgba(93, 181, 94, 0.06)");
      grad.addColorStop(0.85, "rgba(67, 167, 68, 0.1)");
      grad.addColorStop(1, "rgba(139, 69, 19, 0.12)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, y, canvas!.width, h);

      // Dirt block squares
      for (let x = 0; x < canvas!.width; x += BLOCK_SIZE) {
        ctx!.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.04 + 0.02})`;
        ctx!.fillRect(x, y + h * 0.5, BLOCK_SIZE, h * 0.5);
      }
      ctx!.restore();
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Block grid
      blockGrid();

      // Particles
      spawnParticle();
      if (particles.length < maxParticles) spawnParticle();
      drawParticles();

      // Bottom grass strip
      drawBottomGrass();

      // Vignette overlay
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
      style={{ opacity: 0.85 }}
    />
  );
}
