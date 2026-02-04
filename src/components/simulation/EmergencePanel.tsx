import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { EmergenceLog } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface EmergencePanelProps {
  emergenceLogs: EmergenceLog[];
  compact?: boolean;
}

export function EmergencePanel({ emergenceLogs, compact = false }: EmergencePanelProps) {
  const sortedLogs = [...emergenceLogs].sort((a, b) => b.day - a.day);
  const detectedLogs = sortedLogs.filter(e => e.detected);
  const displayLogs = compact ? sortedLogs.slice(0, 5) : sortedLogs.slice(0, 15);

  if (emergenceLogs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-purple-500" />
          Emergence Detection
          {detectedLogs.length > 0 && (
            <Badge className="ml-auto bg-purple-500">
              {detectedLogs.length} Detected
            </Badge>
          )}
        </CardTitle>
        {!compact && (
          <CardDescription>AI-detected emergent behaviors and patterns</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {displayLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No emergence analysis yet</p>
        ) : (
          displayLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-3 p-2 rounded-md",
                log.detected
                  ? "bg-purple-500/10 border border-purple-500/30"
                  : "bg-muted/30"
              )}
            >
              {log.detected ? (
                <Sparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Day {log.day}
                  </Badge>
                  {log.detected ? (
                    <Badge variant="secondary" className="text-xs text-purple-500">
                      Emergence Detected
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Normal Behavior</span>
                  )}
                </div>
                <p className={cn(
                  "text-xs mt-1",
                  log.detected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {log.description || "No unusual patterns observed."}
                </p>
              </div>
            </div>
          ))
        )}

        {detectedLogs.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-purple-500">{detectedLogs.length}</span> emergent
              behaviors detected out of <span className="font-medium">{emergenceLogs.length}</span> days analyzed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
