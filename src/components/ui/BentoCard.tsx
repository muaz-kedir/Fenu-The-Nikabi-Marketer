import React, { useRef, useState, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react';
import './BentoCard.css';

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  glowColor?: string; // e.g. '#f04796' or '240, 71, 150'
  enableTilt?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableStars?: boolean;
  spotlightRadius?: number;
  clickEffect?: boolean;
  as?: 'article' | 'div' | 'section';
  radius?: number;
}

function hexToRgb(color: string): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `${r}, ${g}, ${b}`;
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
  }
  return color;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rate: number;
  phase: number;
}

export const BentoCard = ({
  children,
  className = '',
  glowColor = '#f04796',
  enableTilt = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableStars = true,
  spotlightRadius = 320,
  clickEffect = true,
  as: Component = 'div',
  radius = 28,
  style,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: BentoCardProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [wave, setWave] = useState<{ x: number; y: number; id: number } | null>(null);

  const glowRgb = hexToRgb(glowColor);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePosRef.current = { x, y };

      root.style.setProperty('--bc-x', `${x}px`);
      root.style.setProperty('--bc-y', `${y}px`);
      root.style.setProperty('--bc-hot', '1');

      if (enableTilt) {
        const u = x / Math.max(1, rect.width) - 0.5;
        const v = y / Math.max(1, rect.height) - 0.5;
        const rx = -v * 10;
        const ry = u * 10;
        root.style.setProperty('--bc-rx', `${rx.toFixed(2)}deg`);
        root.style.setProperty('--bc-ry', `${ry.toFixed(2)}deg`);
        root.style.setProperty('--bc-scale', '1.015');
      }

      if (!isHovered) setIsHovered(true);
    },
    [enableTilt, isHovered, onPointerMove]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(e);
      const root = rootRef.current;
      if (root) {
        root.style.setProperty('--bc-hot', '0');
        root.style.setProperty('--bc-rx', '0deg');
        root.style.setProperty('--bc-ry', '0deg');
        root.style.setProperty('--bc-scale', '1');
      }
      setIsHovered(false);
    },
    [onPointerLeave]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      if (!clickEffect) return;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setWave({ x, y, id: Date.now() });
    },
    [clickEffect, onClick]
  );

  // Canvas star specks animation
  useEffect(() => {
    if (!enableStars || !isHovered) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = root.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));

    // Seed particles if empty
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 20 }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 8,
        vy: -6 - Math.random() * 12,
        size: 0.8 + Math.random() * 1.4,
        rate: 1.5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    let lastTime = performance.now();
    const [r, g, b] = glowRgb.split(',').map((c) => parseInt(c.trim(), 10) || 240);

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const reach = spotlightRadius * 0.7;

      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.y < -4) {
          p.y = rect.height + 4;
          p.x = Math.random() * rect.width;
        }
        if (p.x < -4) p.x = rect.width + 4;
        if (p.x > rect.width + 4) p.x = -4;

        const dist = Math.hypot(p.x - mx, p.y - my) / reach;
        if (dist >= 1) continue;

        const falloff = 1 - dist * dist;
        const twinkle = 0.5 + 0.5 * Math.sin(now * 0.002 * p.rate + p.phase);
        const alpha = falloff * twinkle * 0.8;
        if (alpha < 0.01) continue;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enableStars, glowRgb, isHovered, spotlightRadius]);

  const customStyle: CSSProperties = {
    ...style,
    ['--bc-glow-rgb' as any]: glowRgb,
    ['--bc-radius' as any]: `${radius}px`,
    ['--bc-spot-radius' as any]: `${spotlightRadius}px`,
    ['--bc-border-radius' as any]: `${Math.round(spotlightRadius * 0.75)}px`,
  };

  return (
    <Component
      ref={rootRef as any}
      className={`bento-card-root ${className}`.trim()}
      data-hovered={isHovered ? 'true' : undefined}
      style={customStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      {...(props as any)}
    >
      {/* Light spotlight following cursor */}
      {enableSpotlight && <div className="bento-card-spotlight" aria-hidden="true" />}

      {/* Border rim & border glow */}
      <div className="bento-card-rim" aria-hidden="true" />
      {enableBorderGlow && <div className="bento-card-border-glow" aria-hidden="true" />}

      {/* Floating specks on canvas */}
      {enableStars && <canvas ref={canvasRef} className="bento-card-stars" aria-hidden="true" />}

      {/* Click ripple wave */}
      {wave && (
        <div className="bento-card-wave" aria-hidden="true">
          <span
            key={wave.id}
            className="bento-card-wave-pulse"
            style={{ left: wave.x, top: wave.y }}
            onAnimationEnd={() => setWave(null)}
          />
        </div>
      )}

      {/* Real Card Content */}
      <div className="bento-card-inner">{children}</div>
    </Component>
  );
};

export default BentoCard;
