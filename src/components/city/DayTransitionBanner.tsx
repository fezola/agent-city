import { useEffect, useState, useRef } from 'react';

interface DayTransitionBannerProps {
  day: number;
}

export function DayTransitionBanner({ day }: DayTransitionBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const prevDay = useRef(day);

  useEffect(() => {
    if (day !== prevDay.current && day > 0) {
      prevDay.current = day;
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [day]);

  if (!showBanner) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
      <div className="day-banner">
        <div className="bg-zinc-800 border-2 border-emerald-500 rounded-lg px-10 py-5 shadow-2xl">
          <span className="text-emerald-400 font-mono font-bold text-3xl tracking-wider">
            Day {day}
          </span>
        </div>
      </div>
    </div>
  );
}
