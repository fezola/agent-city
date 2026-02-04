import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface ConstructionParticlesProps {
  active: boolean;
}

const COLORS = ['bg-yellow-400', 'bg-orange-400', 'bg-emerald-400', 'bg-blue-400', 'bg-white'];

export function ConstructionParticles({ active }: ConstructionParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate 8 particles with random directions
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
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
          className={`construction-particle absolute w-2 h-2 rounded-full ${p.color}`}
          style={{
            left: '50%',
            top: '50%',
            ['--px' as string]: `${p.x}px`,
            ['--py' as string]: `${p.y}px`,
          }}
        />
      ))}
    </div>
  );
}
