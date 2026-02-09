import { ReactNode, useRef, useState, useCallback, useEffect, MouseEvent as ReactMouseEvent } from 'react';

interface IsometricViewportProps {
  children: ReactNode;
}

export function IsometricViewport({ children }: IsometricViewportProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => {
        const next = prev - e.deltaY * 0.001;
        return Math.max(0.5, Math.min(2.5, next));
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="rpg-viewport w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Ambient warm glow layer */}
      <div className="absolute inset-0 pointer-events-none z-0 city-ambient-glow" />

      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
          imageRendering: 'pixelated',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
