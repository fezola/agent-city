import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Sparkles } from 'lucide-react';
import { ChaosEvent, ChaosEventType } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface ChaosPanelProps {
  chaosEvents: ChaosEvent[];
  compact?: boolean;
}

const chaosIcons: Record<ChaosEventType, React.ComponentType<{ className?: string }>> = {
  'emergency_tax_hike': TrendingUp,
  'inflation_spike': DollarSign,
  'treasury_leak': AlertTriangle,
  'merchant_supply_shock': ShoppingCart,
  'worker_strike': Users,
  'external_demand_boom': Sparkles,
  'no_event': Zap,
};

const chaosColors: Record<ChaosEventType, string> = {
  'emergency_tax_hike': 'text-red-500 bg-red-500/10',
  'inflation_spike': 'text-orange-500 bg-orange-500/10',
  'treasury_leak': 'text-yellow-500 bg-yellow-500/10',
  'merchant_supply_shock': 'text-purple-500 bg-purple-500/10',
  'worker_strike': 'text-blue-500 bg-blue-500/10',
  'external_demand_boom': 'text-green-500 bg-green-500/10',
  'no_event': 'text-muted-foreground bg-muted',
};

const chaosLabels: Record<ChaosEventType, string> = {
  'emergency_tax_hike': 'Emergency Tax Hike',
  'inflation_spike': 'Inflation Spike',
  'treasury_leak': 'Treasury Leak',
  'merchant_supply_shock': 'Supply Shock',
  'worker_strike': 'Worker Strike',
  'external_demand_boom': 'Demand Boom',
  'no_event': 'No Event',
};

export function ChaosPanel({ chaosEvents, compact = false }: ChaosPanelProps) {
  const sortedEvents = [...chaosEvents].sort((a, b) => b.day - a.day);
  const activeEvents = sortedEvents.filter(e => e.event_type !== 'no_event');
  const displayEvents = compact ? sortedEvents.slice(0, 3) : sortedEvents.slice(0, 10);

  if (chaosEvents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Chaos Events
          {activeEvents.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {activeEvents.length} Active
            </Badge>
          )}
        </CardTitle>
        {!compact && (
          <CardDescription>Random events that disrupt the economy</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {displayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chaos events yet</p>
        ) : (
          displayEvents.map((event) => {
            const Icon = chaosIcons[event.event_type];
            const colorClass = chaosColors[event.event_type];
            const isActive = event.event_type !== 'no_event';

            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 p-2 rounded-md",
                  isActive ? colorClass : "bg-muted/30"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  isActive ? colorClass : "bg-muted"
                )}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Day {event.day}
                    </Badge>
                    <span className="text-xs font-medium">
                      {chaosLabels[event.event_type]}
                    </span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {(event.severity * 100).toFixed(0)}% Severe
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.reason}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
