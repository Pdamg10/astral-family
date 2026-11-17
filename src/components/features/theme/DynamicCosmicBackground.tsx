'use client';
import React, { useEffect, useRef, useState } from 'react';

interface DynamicCosmicBackgroundProps {
  primaryColor?: string;
  accentColor?: string;
  cardOpacity?: number;
  backgroundType?: string; // 'dynamic' | 'gradient' | 'custom-gradient' | 'image' | 'solid'
  backgroundImage?: string | null;
  gradientColors?: string[];
  backgroundColor?: string | null;
  children?: React.ReactNode;
}

export default function DynamicCosmicBackground({
  primaryColor = '#a855f7',
  accentColor = '#f59e0b',
  cardOpacity = 0.85,
  backgroundType = 'dynamic',
  backgroundImage = null,
  gradientColors = ['#0f0a1a', '#1a0a2e', '#0f0a1a'],
  backgroundColor = '#070312',
  children,
}: DynamicCosmicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isDynamic = backgroundType === 'dynamic';
  const isImage = backgroundType === 'image' && Boolean(backgroundImage);
  const isGradient = backgroundType === 'gradient' || backgroundType === 'custom-gradient';

  // Interactive subtle parallax effect on mouse move
  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = ((e.clientX / innerWidth) - 0.5) * 16; // -8px to +8px
      targetY = ((e.clientY / innerHeight) - 0.5) * 16; // -8px to +8px
    };

    const animateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMousePos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(animateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(animateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Floating stardust & spark particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 45 subtle stardust particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.5 - 0.1, // Drifts gently upwards
      opacity: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? 'gold' : 'primary',
    }));

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around borders
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentOpacity = (Math.sin(time * p.pulseSpeed * 100 + p.x) * 0.3 + 0.6) * p.opacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        if (p.color === 'gold') {
          ctx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(192, 132, 252, ${currentOpacity})`;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 6;
        }
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const computedGradient = (() => {
    if (gradientColors && gradientColors.length >= 2) {
      return `linear-gradient(135deg, ${gradientColors.join(', ')})`;
    }
    return 'linear-gradient(135deg, #0f0a1a, #1a0a2e, #0f0a1a)';
  })();

  const normalizedBgImage = backgroundImage === '/background.jpg' ? '/images/cosmic-bg.jpg' : backgroundImage;
  const imageSrc = isImage && normalizedBgImage ? normalizedBgImage : '/images/cosmic-bg.jpg';

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: isGradient ? computedGradient : (backgroundColor || '#070312'),
      }}
    >
      {/* 1. Image Layer (Dynamic or Custom Image) */}
      {(isDynamic || isImage) && (
        <>
          <div
            className="fixed inset-0 pointer-events-none z-0 will-change-transform"
            style={{
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 40%',
              backgroundRepeat: 'no-repeat',
              transform: `scale(1.05) translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              transition: 'transform 0.1s ease-out',
            }}
          />

          {/* Breathing Animation Overlay (Active in dynamic mode) */}
          {isDynamic && (
            <div
              className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay animate-pulse"
              style={{
                backgroundImage: 'url(/images/cosmic-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                animationDuration: '14s',
              }}
            />
          )}

          {/* Central Mandala Pulse Glow */}
          {isDynamic && (
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none z-0 blur-3xl opacity-35 animate-pulse"
              style={{
                background: `radial-gradient(circle, ${accentColor} 0%, ${primaryColor} 45%, transparent 75%)`,
                animationDuration: '6s',
              }}
            />
          )}

          {/* Ambient Purple Nebula Glow Accents */}
          <div
            className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none z-0 blur-[120px] opacity-30"
            style={{ background: primaryColor }}
          />
          <div
            className="fixed -bottom-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none z-0 blur-[120px] opacity-25"
            style={{ background: accentColor }}
          />

          {/* Dark Vignette / Contrast Shade for Pristine Readability */}
          <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#070312]/60 via-transparent to-[#070312]/80" />
          <div className="fixed inset-0 pointer-events-none z-0 bg-[#070312]/30 backdrop-blur-[0.5px]" />
        </>
      )}

      {/* 2. Gradient Accent Overlay (When in gradient mode) */}
      {isGradient && (
        <>
          <div
            className="fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-[140px] opacity-25"
            style={{ background: primaryColor }}
          />
          <div
            className="fixed -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-[140px] opacity-25"
            style={{ background: accentColor }}
          />
          <div className="fixed inset-0 pointer-events-none z-0 bg-black/20" />
        </>
      )}

      {/* 3. Floating Stardust Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      />

      {/* 4. Actual App Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
