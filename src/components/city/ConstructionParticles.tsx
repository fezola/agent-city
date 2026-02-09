import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface ConstructionParticlesProps {
  active: boolean;
}

const COLORS = ['#ffd700', '#00e676', '#ffffff'];

export function ConstructionParticles({ active }: ConstructionParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate 8 square particles with random directions
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() > 0.5 ? 4 : 3,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`construction-particle absolute sparkle-${(p.id % 4) + 1}`}
          style={{
            left: '50%',
            top: '50%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            imageRendering: 'pixelated',
            ['--px' as string]: `${p.x}px`,
            ['--py' as string]: `${p.y}px`,
          }}
        />
      ))}
    </div>
  );
}
