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

  // Use native wheel listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => {
        const next = prev - e.deltaY * 0.001;
        return Math.max(0.5, Math.min(2.0, next));
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
      style={{
        background: 'repeating-conic-gradient(#1a2332 0% 25%, #202d3d 0% 50%) 0 0 / 48px 48px',
      }}
    >
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
