import React, { useEffect, useRef } from 'react';

interface CursorAuraProps {
  typingEnergy?: number;
}

export const CursorAura: React.FC<CursorAuraProps> = ({ typingEnergy = 0 }) => {
  const auraRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: -200, y: -200, targetX: -200, targetY: -200, energy: 0 });

  useEffect(() => {
    posRef.current.energy = Math.min(1, posRef.current.energy + typingEnergy * 1.5);
  }, [typingEnergy]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
      if (auraRef.current) {
        auraRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      if (auraRef.current) {
        auraRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let rafId: number;
    const animate = () => {
      const p = posRef.current;
      p.x += (p.targetX - p.x) * 0.18;
      p.y += (p.targetY - p.y) * 0.18;
      p.energy *= 0.94;

      if (auraRef.current) {
        const scale = 1 + p.energy * 0.7;
        auraRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={auraRef}
      className="fixed top-0 left-0 pointer-events-none z-30 opacity-0 transition-opacity duration-300 will-change-transform mix-blend-screen"
      style={{ width: '180px', height: '180px' }}
      aria-hidden="true"
    >
      {/* Outer blurred glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(12,151,224,0.22)_0%,rgba(108,30,178,0.12)_45%,transparent_70%)] filter blur-md" />

      {/* Orbiting thin particle ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-cyan-400/40 border-t-cyan-300 animate-spin" />

      {/* Center glowing dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8,0_0_16px_rgba(12,151,224,0.8)]" />
    </div>
  );
};
