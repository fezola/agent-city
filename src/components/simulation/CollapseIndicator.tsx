import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, AlertCircle, Skull } from 'lucide-react';
import { CollapseEvaluation, CollapseStatus } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface CollapseIndicatorProps {
  evaluations: CollapseEvaluation[];
  compact?: boolean;
}

const statusConfig: Record<CollapseStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}> = {
  stable: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Stable',
  },
  unstable: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Unstable',
  },
  collapsed: {
    icon: Skull,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Collapsed',
  },
};

export function CollapseIndicator({ evaluations, compact = false }: CollapseIndicatorProps) {
  const sortedEvaluations = [...evaluations].sort((a, b) => b.day - a.day);
  const latestEvaluation = sortedEvaluations[0];

  if (!latestEvaluation) {
    return null;
  }

  const config = statusConfig[latestEvaluation.status];
  const Icon = config.icon;

  // Calculate stability trend
  const recentEvaluations = sortedEvaluations.slice(0, 5);
  const unstableCount = recentEvaluations.filter(e => e.status === 'unstable').length;
  const stableCount = recentEvaluations.filter(e => e.status === 'stable').length;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md",
        config.bgColor
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
        <Badge variant="outline" className="ml-auto text-xs">
          {(latestEvaluation.confidence * 100).toFixed(0)}% confident
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-2",
      latestEvaluation.status === 'collapsed' && "border-red-500",
      latestEvaluation.status === 'unstable' && "border-yellow-500",
      latestEvaluation.status === 'stable' && "border-green-500/50"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          System Stability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Status */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-md",
          config.bgColor
        )}>
          <Icon className={cn("h-6 w-6", config.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold", config.color)}>
                {config.label}
              </span>
              <Badge variant="outline" className="text-xs">
                Day {latestEvaluation.day}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {latestEvaluation.reason}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">
              {(latestEvaluation.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">confidence</div>
          </div>
        </div>

        {/* Trend */}
        {recentEvaluations.length > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last {recentEvaluations.length} days:</span>
            <div className="flex gap-1">
              {recentEvaluations.map((e, i) => {
                const c = statusConfig[e.status];
                return (
                  <div
                    key={e.id}
                    className={cn("w-2 h-2 rounded-full", c.bgColor)}
                    title={`Day ${e.day}: ${c.label}`}
                  />
                );
              })}
            </div>
            <span>
              {stableCount} stable, {unstableCount} unstable
            </span>
          </div>
        )}

        {/* Recent History */}
        {sortedEvaluations.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Recent Evaluations</p>
            {sortedEvaluations.slice(1, 4).map((evaluation) => {
              const c = statusConfig[evaluation.status];
              const EvalIcon = c.icon;
              return (
                <div
                  key={evaluation.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <EvalIcon className={cn("h-3 w-3", c.color)} />
                  <Badge variant="outline" className="text-xs">
                    Day {evaluation.day}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {evaluation.reason}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
