import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ScrollText,
  ArrowLeft,
  Search,
  Filter,
  Crown,
  Hammer,
  ShoppingCart,
  AlertTriangle,
  Dices,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const eventTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'governor_decision': Crown,
  'worker_decision': Hammer,
  'merchant_decision': ShoppingCart,
  'expulsion': AlertTriangle,
  'wager_won': Dices,
  'world_created': Sparkles,
  'collapse': AlertTriangle,
};

const eventTypeColors: Record<string, string> = {
  'governor_decision': 'text-amber-500',
  'worker_decision': 'text-blue-500',
  'merchant_decision': 'text-green-500',
  'expulsion': 'text-red-500',
  'wager_won': 'text-purple-500',
  'world_created': 'text-primary',
  'collapse': 'text-destructive',
};

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');

  const {
    worldState,
    events,
    agents,
    getAgent,
  } = useSimulationContext();

  if (!worldState) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No simulation running</p>
        <Link to="/">
          <Button variant="link" className="p-0 mt-2">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.event_type));
    return Array.from(types).sort();
  }, [events]);

  // Get unique days
  const days = useMemo(() => {
    const daySet = new Set(events.map(e => e.day));
    return Array.from(daySet).sort((a, b) => b - a);
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = event.description?.toLowerCase().includes(query);
        const matchesAgent = event.agent_name?.toLowerCase().includes(query);
        if (!matchesDescription && !matchesAgent) return false;
      }

      // Event type filter
      if (eventTypeFilter !== 'all' && event.event_type !== eventTypeFilter) {
        return false;
      }

      // Day filter
      if (dayFilter !== 'all' && event.day !== parseInt(dayFilter)) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, eventTypeFilter, dayFilter]);

  // Group events by day
  const groupedEvents = useMemo(() => {
    const groups: Record<number, typeof events> = {};
    filteredEvents.forEach(event => {
      if (!groups[event.day]) {
        groups[event.day] = [];
      }
      groups[event.day].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const sortedDays = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-primary" />
            Event History
          </h1>
          <p className="text-muted-foreground">
            {events.length} total events recorded
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Event Type Filter */}
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Day Filter */}
            <Select value={dayFilter} onValueChange={setDayFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {days.map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    Day {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || eventTypeFilter !== 'all' || dayFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setEventTypeFilter('all');
                  setDayFilter('all');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events Timeline */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No Events Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDays.map(day => (
            <div key={day}>
              {/* Day Header */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Day {day}</h2>
                <Badge variant="secondary">
                  {groupedEvents[day].length} events
                </Badge>
              </div>

              {/* Events for this day */}
              <div className="space-y-2 ml-6 border-l-2 border-muted pl-4">
                {groupedEvents[day].map(event => {
                  const Icon = eventTypeIcons[event.event_type] || ScrollText;
                  const color = eventTypeColors[event.event_type] || 'text-muted-foreground';

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-md bg-card border"
                    >
                      <div className={cn("shrink-0 mt-0.5", color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type.replace(/_/g, ' ')}
                          </Badge>
                          {event.agent_name && (
                            <Link
                              to={`/agent/${event.agent_id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {event.agent_name}
                            </Link>
                          )}
                        </div>
                        {(event.details as Record<string, unknown>)?.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reason: {String((event.details as Record<string, unknown>).reason)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
