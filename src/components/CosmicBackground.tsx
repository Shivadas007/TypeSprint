import React, { useEffect, useRef } from 'react';
import { ThemeId } from '../types';

interface CosmicBackgroundProps {
  theme: ThemeId;
  typingEnergy?: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: [number, number, number];
  twinkle: number;
  twinkleSpeed: number;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ theme, typingEnergy = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const energyRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update target energy when typingEnergy prop updates
  useEffect(() => {
    energyRef.current = Math.min(1, energyRef.current + typingEnergy);
  }, [typingEnergy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let centerX = width / 2;
    let centerY = height / 2;

    const FOV = 320;
    const DEPTH = 1100;
    const count = Math.min(160, Math.round((width * height) / 9000));

    // Theme color palette
    const getPalette = (): [number, number, number][] => {
      switch (theme) {
        case 'midnight':
          return [
            [168, 85, 247],
            [126, 34, 206],
            [236, 72, 153],
            [192, 132, 252],
          ];
        case 'cyber':
          return [
            [52, 211, 153],
            [16, 185, 129],
            [6, 95, 70],
            [245, 158, 11],
          ];
        case 'aurora':
          return [
            [45, 212, 191],
            [129, 140, 248],
            [244, 114, 182],
            [56, 189, 248],
          ];
        case 'light':
          return [
            [14, 165, 233],
            [99, 102, 241],
            [217, 70, 239],
            [56, 189, 248],
          ];
        case 'cosmic':
        default:
          return [
            [12, 151, 224], // electric cyan
            [56, 189, 248], // sky blue
            [108, 30, 178], // deep violet
            [209, 79, 160], // magenta accent
            [55, 92, 160],  // cobalt
          ];
      }
    };

    const palette = getPalette();

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const col = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * DEPTH,
        baseX: (Math.random() - 0.5) * width,
        baseY: (Math.random() - 0.5) * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: 0.6 + Math.random() * 1.2,
        size: 1.2 + Math.random() * 2.4,
        color: col,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / width) * 2 - 1,
        y: (e.clientY / height) * 2 - 1,
      };
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const energy = energyRef.current;
      energyRef.current *= 0.96;

      const tiltX = mouseRef.current.x * 20 * (1 + energy * 0.5);
      const tiltY = mouseRef.current.y * 15 * (1 + energy * 0.5);

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.z -= p.vz * (1 + energy * 2.5);
          if (p.z <= 0) {
            p.z = DEPTH;
            p.x = (Math.random() - 0.5) * width;
            p.y = (Math.random() - 0.5) * height;
          }
          p.twinkle += p.twinkleSpeed;
        }

        const scale = FOV / (FOV + p.z);
        const sx = centerX + (p.x + tiltX * (1 - p.z / DEPTH)) * scale;
        const sy = centerY + (p.y + tiltY * (1 - p.z / DEPTH)) * scale;
        const alpha = Math.min(1, Math.max(0, 1.1 - p.z / DEPTH)) * (0.6 + 0.4 * Math.sin(p.twinkle));
        const r = Math.max(0.5, p.size * scale * (1 + energy * 0.8));

        const [cr, cg, cb] = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * (theme === 'light' ? 0.35 : 0.65)})`;
        ctx.fill();

        if (energy > 0.1 && Math.random() < 0.25) {
          // Micro glow halo
          ctx.beginPath();
          ctx.arc(sx, sy, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Background Deep Cosmic Gradients */}
      <div className="absolute inset-0 bg-[#020307]" />
      
      {/* Dynamic Cosmic Nebulae */}
      <div 
        className="absolute -top-[15%] left-[10%] w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full blur-[130px] opacity-25 mix-blend-screen"
        style={{
          background: theme === 'midnight' 
            ? 'radial-gradient(circle, #7c3aed 0%, transparent 70%)'
            : theme === 'cyber'
            ? 'radial-gradient(circle, #059669 0%, transparent 70%)'
            : theme === 'aurora'
            ? 'radial-gradient(circle, #0d9488 0%, transparent 70%)'
            : theme === 'light'
            ? 'radial-gradient(circle, #38bdf8 0%, transparent 70%)'
            : 'radial-gradient(circle, #0C97E0 0%, #1A2C53 60%, transparent 70%)',
        }}
      />

      <div 
        className="absolute -bottom-[20%] right-[5%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full blur-[140px] opacity-20 mix-blend-screen"
        style={{
          background: theme === 'midnight'
            ? 'radial-gradient(circle, #c026d3 0%, transparent 70%)'
            : theme === 'cyber'
            ? 'radial-gradient(circle, #10b981 0%, transparent 70%)'
            : theme === 'aurora'
            ? 'radial-gradient(circle, #6366f1 0%, transparent 70%)'
            : theme === 'light'
            ? 'radial-gradient(circle, #818cf8 0%, transparent 70%)'
            : 'radial-gradient(circle, #6C1EB2 0%, #0C97E0 50%, transparent 70%)',
        }}
      />

      {/* Subtle Orbital Geometry Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-sky-500/[0.04] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full border border-sky-400/[0.02] pointer-events-none" />

      {/* 3D Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
