import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { DayNarrative } from '@/types/simulation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NarrativePanelProps {
  narratives: DayNarrative[];
  compact?: boolean;
}

export function NarrativePanel({ narratives, compact = false }: NarrativePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedNarratives = [...narratives].sort((a, b) => b.day - a.day);
  const latestNarrative = sortedNarratives[0];
  const displayCount = compact ? (expanded ? 5 : 1) : (expanded ? narratives.length : 3);
  const displayNarratives = sortedNarratives.slice(0, displayCount);

  if (narratives.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-500" />
          The Story So Far
        </CardTitle>
        {!compact && (
          <CardDescription>AI-generated narrative summaries</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayNarratives.map((narrative, index) => (
          <div
            key={narrative.id}
            className={cn(
              "relative",
              index === 0 && "bg-muted/50 rounded-lg p-3 border"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                Day {narrative.day}
              </Badge>
              {index === 0 && (
                <span className="text-xs text-muted-foreground">Latest</span>
              )}
            </div>
            <p className={cn(
              "text-sm leading-relaxed",
              index === 0 ? "text-foreground" : "text-muted-foreground"
            )}>
              {narrative.summary}
            </p>
          </div>
        ))}

        {sortedNarratives.length > displayCount && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {sortedNarratives.length - displayCount} More
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
