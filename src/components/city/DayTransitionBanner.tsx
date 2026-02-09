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
      const timer = setTimeout(() => setShowBanner(false), 2800);
      return () => clearTimeout(timer);
    }
  }, [day]);

  if (!showBanner) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
      <div className="day-banner">
        <div className="rpg-panel px-12 py-5 border-rpg-gold border-2">
          {/* Decorative pixel lines */}
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              <div className="w-2 h-0.5 bg-rpg-gold-dim" />
              <div className="w-4 h-0.5 bg-rpg-gold" />
              <div className="w-2 h-0.5 bg-rpg-gold-dim" />
            </div>
            <span className="font-pixel text-lg text-rpg-gold neon-text tracking-wider">
              DAY {day}
            </span>
            <div className="flex gap-0.5">
              <div className="w-2 h-0.5 bg-rpg-gold-dim" />
              <div className="w-4 h-0.5 bg-rpg-gold" />
              <div className="w-2 h-0.5 bg-rpg-gold-dim" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
