"use client";

import React, { useEffect, useRef } from "react";

interface BarSpec {
  index: number;
  // Normalized -1..1 across X
  nx: number;
  // Assembled V-shape top & bottom Y in normalized units
  yTop: number;
  yBot: number;
  // Break-apart 3D scatter offsets
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  spinSpeedX: number;
  spinSpeedZ: number;
  delay: number;
  color: [number, number, number];
}

const BAR_COUNT = 25;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Interpolate SolVox brand gradient: Purple (#9945FF) -> Cyan (#00D1FF) -> Mint (#14F195)
function brandColorAt(u: number): [number, number, number] {
  if (u < 0.5) {
    const k = u * 2;
    return [
      Math.round(lerp(153, 0, k)),
      Math.round(lerp(69, 209, k)),
      Math.round(lerp(255, 255, k)),
    ];
  }
  const k = (u - 0.5) * 2;
  return [
    Math.round(lerp(0, 20, k)),
    Math.round(lerp(209, 241, k)),
    Math.round(lerp(255, 149, k)),
  ];
}

// Build the 25-bar SolVox V-waveform geometry matching public/brand/solvox-icon-dark.png
const BARS: BarSpec[] = Array.from({ length: BAR_COUNT }, (_, i) => {
  const u = i / (BAR_COUNT - 1); // 0..1 left to right
  const nx = (u - 0.5) * 2; // -1..1
  const distFromCenter = Math.abs(nx); // 0 at center V tip, 1 at outer wings

  // V silhouette: outer wings high, center tip lowest
  const yTop = lerp(0.18, -0.78, Math.pow(distFromCenter, 0.92));
  const yBot = lerp(0.88, -0.22, Math.pow(distFromCenter, 1.05));

  // Deterministic 3D scatter vector for break-apart phase
  const angle = (i * 2.39996) % (Math.PI * 2);
  const spread = 0.55 + ((i * 29) % 10) * 0.08;
  const scatterX = nx * 0.75 + Math.cos(angle) * spread * 0.65;
  const scatterY = Math.sin(angle) * spread * 0.6 + (i % 2 === 0 ? -0.18 : 0.18);
  const scatterZ = ((i % 5) - 2) * 0.42 + Math.cos(angle * 2) * 0.35;

  return {
    index: i,
    nx,
    yTop,
    yBot,
    scatterX,
    scatterY,
    scatterZ,
    spinSpeedX: ((i % 3) - 1) * 1.1 + 0.35,
    spinSpeedZ: ((i % 4) - 1.5) * 0.9,
    delay: distFromCenter * 0.16,
    color: brandColorAt(u),
  };
});

export function Hero3DCore() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cycleOffsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const CYCLE_SECONDS = 8.0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.34;

      ctx.clearRect(0, 0, w, h);

      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.07;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.07;

      const phaseTime = reducedMotion ? 0 : (t + cycleOffsetRef.current) % CYCLE_SECONDS;

      // Cycle timeline (8.0s):
      // 0.0 -> 3.0s : Formed V-logo (breathing waveform)
      // 3.0 -> 4.8s : Breaking apart into 3D shards
      // 4.8 -> 5.5s : Suspended 3D float
      // 5.5 -> 7.4s : Reforming & locking back into V
      // 7.4 -> 8.0s : Lock pulse settle
      let globalDisperse = 0;
      let lockPulse = 0;

      if (phaseTime >= 3.0 && phaseTime < 4.8) {
        globalDisperse = (phaseTime - 3.0) / 1.8;
      } else if (phaseTime >= 4.8 && phaseTime < 5.5) {
        globalDisperse = 1;
      } else if (phaseTime >= 5.5 && phaseTime < 7.4) {
        globalDisperse = 1 - (phaseTime - 5.5) / 1.9;
      } else if (phaseTime >= 7.4) {
        lockPulse = Math.sin(((phaseTime - 7.4) / 0.6) * Math.PI);
      }

      // Smooth 3D camera sway + mouse tilt
      const rotY = pointerRef.current.x * 0.52 + (reducedMotion ? 0.12 : Math.sin(t * 0.65) * 0.24);
      const rotX = pointerRef.current.y * 0.35 + (reducedMotion ? 0.06 : Math.cos(t * 0.5) * 0.1);
      const bobY = reducedMotion ? 0 : Math.sin(t * 1.2) * 6;

      // Ambient brand glow behind logo
      const glow = ctx.createRadialGradient(cx, cy + bobY, scale * 0.1, cx, cy + bobY, scale * 1.55);
      glow.addColorStop(0, `rgba(0, 209, 255, ${0.18 + lockPulse * 0.14})`);
      glow.addColorStop(0.45, "rgba(153, 69, 255, 0.13)");
      glow.addColorStop(0.75, "rgba(20, 241, 149, 0.07)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Compute 3D state of each bar and sort back-to-front by Z
      const barWidthBase = Math.max(4.5, scale * 0.048);

      const computed = BARS.map((bar) => {
        // Staggered disperse per bar
        const localT = clamp01((globalDisperse - bar.delay * 0.4) / (1 - bar.delay * 0.4));
        const disperse =
          phaseTime >= 5.5 && phaseTime < 7.4
            ? 1 - easeOutBack(1 - localT)
            : easeInOutCubic(localT);

        // Live voice-waveform subtle pulse when formed
        const wave =
          reducedMotion || disperse > 0.2
            ? 0
            : Math.sin(t * 3.6 - Math.abs(bar.nx) * 4.5) * 0.045 * (1 - disperse);

        const x3 = bar.nx * 0.92 + bar.scatterX * disperse;
        const yMid = (bar.yTop + bar.yBot) / 2 + bar.scatterY * disperse;
        const halfLen = (bar.yBot - bar.yTop) / 2 + wave;
        const z3 = bar.scatterZ * disperse;

        // Apply 3D camera rotation (Y then X)
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const rx1 = x3 * cosY + z3 * sinY;
        const rz1 = -x3 * sinY + z3 * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const ry2 = yMid * cosX - rz1 * sinX;
        const rz2 = yMid * sinX + rz1 * cosX;

        const fov = 4.2;
        const factor = fov / (fov - rz2);

        return {
          bar,
          px: cx + rx1 * scale * factor,
          py: cy + bobY + ry2 * scale * factor,
          z: rz2,
          factor,
          halfLenPx: halfLen * scale * factor,
          tiltAngle: disperse * bar.spinSpeedZ * 1.4 + rotY * 0.08 * disperse,
          disperse,
        };
      }).sort((a, b) => a.z - b.z);

      // Draw each 3D capsule bar with cylindrical highlight & glow
      for (const item of computed) {
        const { bar, px, py, factor, halfLenPx, tiltAngle, disperse } = item;
        const bw = barWidthBase * factor;
        const bh = Math.max(bw * 1.5, halfLenPx * 2);
        const radius = bw / 2;
        const [r, g, b] = bar.color;
        const alpha = clamp01(0.95 - disperse * 0.12 + lockPulse * 0.05);

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tiltAngle);

        // Outer neon aura
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.55 + lockPulse * 0.35})`;
        ctx.shadowBlur = 14 * factor;

        // 3D cylindrical vertical gradient
        const bodyGrad = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
        bodyGrad.addColorStop(0, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${alpha})`);
        bodyGrad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        bodyGrad.addColorStop(1, `rgba(${Math.max(0, r - 45)}, ${Math.max(0, g - 45)}, ${Math.max(0, b - 45)}, ${alpha})`);

        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, radius);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Crisp inner specular ridge (gives the glossy 3D cylinder feel from solvox-icon-dark.png)
        ctx.shadowBlur = 0;
        const specGrad = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
        specGrad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
        specGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
        specGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
        ctx.beginPath();
        ctx.roundRect(-bw * 0.22, -bh / 2 + 2, bw * 0.28, Math.max(4, bh - 4), bw * 0.14);
        ctx.fillStyle = specGrad;
        ctx.fill();

        ctx.restore();
      }

      if (!reducedMotion) {
        t += 0.016;
        rafId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="relative mx-auto flex h-[400px] w-full max-w-[540px] items-center justify-center sm:h-[480px] lg:h-[540px]"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerRef.current.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerRef.current.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }}
      onMouseLeave={() => {
        pointerRef.current.targetX = 0;
        pointerRef.current.targetY = 0;
      }}
      onClick={() => {
        // Jump straight to the break-apart moment when clicked
        cycleOffsetRef.current += 3.0;
      }}
      title="Hover to tilt in 3D · Click to trigger break & reform"
    >
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D SolVox V-waveform logo animation"
        className="h-full w-full cursor-pointer"
      />
    </div>
  );
}
