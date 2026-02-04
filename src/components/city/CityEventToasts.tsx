import { useEffect, useState, useRef } from 'react';
import { WorldEvent } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface CityEventToastsProps {
  events: WorldEvent[];
  currentDay: number;
}

interface ToastItem {
  id: string;
  text: string;
  type: string;
}

export function CityEventToasts({ events, currentDay }: CityEventToastsProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const newEvents = events.filter(
      (e) => e.day === currentDay && !seenIds.current.has(e.id)
    );

    if (newEvents.length === 0) return;

    const newToasts: ToastItem[] = newEvents.map((e) => {
      seenIds.current.add(e.id);
      return {
        id: e.id,
        text: e.description.length > 80 ? e.description.slice(0, 77) + '...' : e.description,
        type: e.event_type,
      };
    });

    setToasts((prev) => [...newToasts, ...prev].slice(0, 5));

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => !newToasts.some((n) => n.id === t.id)));
    }, 4000);

    return () => clearTimeout(timer);
  }, [events, currentDay]);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 max-w-[300px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'event-toast px-3 py-2 rounded-lg text-xs leading-relaxed',
            'bg-zinc-800 border border-zinc-600',
            toast.type === 'chaos' && 'border-red-600 bg-red-950',
            toast.type === 'collapse_check' && 'border-orange-600',
            toast.type === 'building' && 'border-emerald-600',
          )}
        >
          <span className="text-xs text-emerald-400 font-bold uppercase mr-1.5">
            {toast.type}
          </span>
          <span className="text-zinc-200">{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
