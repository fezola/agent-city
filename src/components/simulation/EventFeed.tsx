import { WorldEvent } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Crown, Hammer, ShoppingCart, Skull, Trophy, AlertCircle, Sparkles } from 'lucide-react';

interface EventFeedProps {
  events: WorldEvent[];
}

const eventIcons: Record<string, React.ReactNode> = {
  world_created: <Sparkles className="h-4 w-4 text-amber-400" />,
  governor_decision: <Crown className="h-4 w-4 text-amber-500" />,
  worker_decision: <Hammer className="h-4 w-4 text-blue-500" />,
  merchant_decision: <ShoppingCart className="h-4 w-4 text-purple-500" />,
  expulsion: <Skull className="h-4 w-4 text-red-500" />,
  wager_won: <Trophy className="h-4 w-4 text-yellow-500" />,
  collapse: <AlertCircle className="h-4 w-4 text-red-600" />,
};

const eventColors: Record<string, string> = {
  world_created: 'border-l-amber-400',
  governor_decision: 'border-l-amber-500',
  worker_decision: 'border-l-blue-500',
  merchant_decision: 'border-l-purple-500',
  expulsion: 'border-l-red-500',
  wager_won: 'border-l-yellow-500',
  collapse: 'border-l-red-600',
};

export function EventFeed({ events }: EventFeedProps) {
  // Show most recent events first, limit to 50
  const displayEvents = events.slice(0, 50);

  return (
    <Card className="bg-background/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Live Events
          {events.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              {events.length} total
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-4 pb-4">
          <div className="space-y-2">
            {displayEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No events yet. Start the simulation!
              </div>
            ) : (
              displayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg bg-muted/30 border-l-4 ${eventColors[event.event_type] || 'border-l-gray-500'} animate-in slide-in-from-right duration-300`}
                >
                  <div className="flex items-start gap-2">
                    {eventIcons[event.event_type] || <Activity className="h-4 w-4 text-gray-400" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Day {event.day}
                        </span>
                        {event.agent_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            {event.agent_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{event.description}</p>
                      {event.details && typeof event.details === 'object' && 'reason' in event.details && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{String(event.details.reason)}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
