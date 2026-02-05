import { ReactNode, useRef, useState, useCallback, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Eye, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IsometricViewportProps {
  children: ReactNode;
  className?: string;
}

// Default isometric view - better angle for viewing buildings
const DEFAULT_ROTATION = { x: 55, z: -45 };
const TOP_DOWN_ROTATION = { x: 90, z: 0 };
const SIDE_VIEW_ROTATION = { x: 30, z: -45 };

export function IsometricViewport({ children, className }: IsometricViewportProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const isDragging = useRef(false);
  const isRotating = useRef(false);
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
        return Math.max(0.3, Math.min(2.0, next));
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    // Right-click or Ctrl+click = rotate
    if (e.button === 2 || e.ctrlKey) {
      isRotating.current = true;
    } else {
      isDragging.current = true;
    }
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (isRotating.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setRotation((prev) => ({
        x: Math.max(15, Math.min(85, prev.x - dy * 0.4)),
        z: prev.z + dx * 0.4,
      }));
      return;
    }
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isRotating.current = false;
  }, []);

  const handleContextMenu = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
  }, []);

  const resetView = useCallback(() => {
    setRotation(DEFAULT_ROTATION);
    setOffset({ x: 0, y: 0 });
    setZoom(1.0);
  }, []);

  const setTopDown = useCallback(() => {
    setRotation(TOP_DOWN_ROTATION);
  }, []);

  const setSideView = useCallback(() => {
    setRotation(SIDE_VIEW_ROTATION);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(2.0, prev + 0.15));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.3, prev - 0.15));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('iso-viewport w-full h-full relative', className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <div
        className="iso-viewport-inner"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transition: isDragging.current || isRotating.current ? 'none' : 'transform 0.1s ease-out',
          ['--rotX' as string]: `${rotation.x}deg`,
          ['--rotZ' as string]: `${rotation.z}deg`,
        }}
      >
        {children}
      </div>

      {/* Viewport controls overlay */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
        {/* View presets */}
        <div className="flex gap-1">
          <button
            onClick={resetView}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-800/90 border border-zinc-600 text-zinc-200 text-xs hover:bg-zinc-700 transition-colors backdrop-blur-sm"
            title="Reset to default isometric view"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={setTopDown}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-zinc-800/90 border border-zinc-600 text-zinc-200 text-xs hover:bg-zinc-700 transition-colors backdrop-blur-sm"
            title="Top-down view"
          >
            <Eye className="h-3 w-3" />
            Top
          </button>
          <button
            onClick={setSideView}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-zinc-800/90 border border-zinc-600 text-zinc-200 text-xs hover:bg-zinc-700 transition-colors backdrop-blur-sm"
            title="Side angle view"
          >
            <Compass className="h-3 w-3" />
            Side
          </button>
        </div>
        
        {/* Zoom controls */}
        <div className="flex gap-1">
          <button
            onClick={zoomIn}
            className="flex items-center justify-center w-8 h-8 rounded bg-zinc-800/90 border border-zinc-600 text-zinc-200 hover:bg-zinc-700 transition-colors backdrop-blur-sm"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={zoomOut}
            className="flex items-center justify-center w-8 h-8 rounded bg-zinc-800/90 border border-zinc-600 text-zinc-200 hover:bg-zinc-700 transition-colors backdrop-blur-sm"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="flex items-center px-2 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-xs backdrop-blur-sm">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Control hints */}
        <div className="text-[10px] text-zinc-400 bg-zinc-900/80 rounded px-2 py-1.5 leading-relaxed border border-zinc-700 backdrop-blur-sm">
          <div className="flex items-center gap-1"><span className="text-zinc-300">◀▶</span> Left-drag: Pan</div>
          <div className="flex items-center gap-1"><span className="text-zinc-300">⟳</span> Right-drag: Rotate</div>
          <div className="flex items-center gap-1"><span className="text-zinc-300">⊕</span> Scroll: Zoom</div>
        </div>
      </div>

      {/* Rotation indicator */}
      <div className="absolute bottom-3 left-3 z-30 text-[10px] text-zinc-500 bg-zinc-900/70 px-2 py-1 rounded border border-zinc-700 backdrop-blur-sm">
        X: {rotation.x.toFixed(0)}° | Z: {rotation.z.toFixed(0)}°
      </div>
    </div>
  );
}
