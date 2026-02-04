import { WorldEvent } from '@/types/simulation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EventLogProps {
  events: WorldEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const displayEvents = events.slice(0, 50);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-8 border-b bg-background shrink-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Event Log
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {events.length}
        </span>
      </div>

      {/* Scrollable events */}
      <ScrollArea className="flex-1">
        {displayEvents.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            No events yet
          </div>
        ) : (
          displayEvents.map((event) => {
            const isDanger = event.event_type === 'expulsion' || event.event_type === 'collapse';

            return (
              <div
                key={event.id}
                className="px-3 py-1.5 border-b border-border/20 hover:bg-muted/30"
              >
                {/* Line 1: day + agent */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    d{event.day}
                  </span>
                  <span className={cn(
                    "text-[10px] truncate",
                    isDanger ? "text-red-400 font-medium" : "text-muted-foreground"
                  )}>
                    {event.agent_name || event.event_type.replace(/_/g, ' ')}
                  </span>
                </div>
                {/* Line 2: description */}
                <p className="text-xs text-foreground/80 pl-6 line-clamp-1 mt-0.5">
                  {event.description}
                </p>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}
