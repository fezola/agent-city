import { Wager, Agent } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dice6, Trophy, XCircle, Clock } from 'lucide-react';

interface WagersPanelProps {
  wagers: Wager[];
  agents: Agent[];
  currentDay: number;
}

const predictionLabels: Record<string, string> = {
  tax_up: '📈 Tax Increase',
  tax_down: '📉 Tax Decrease',
  salary_up: '💰 Salary Increase',
  salary_down: '✂️ Salary Cut',
  collapse: '💀 City Collapse',
  stability: '🏛️ City Stability',
};

export function WagersPanel({ wagers, agents, currentDay }: WagersPanelProps) {
  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown';
  };

  const pendingWagers = wagers.filter(w => !w.resolved);
  const resolvedWagers = wagers.filter(w => w.resolved);

  return (
    <Card className="bg-background/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dice6 className="h-5 w-5 text-amber-500" />
          Active Wagers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {pendingWagers.length === 0 && resolvedWagers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Dice6 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No wagers placed yet</p>
              <p className="text-xs">Workers can wager on future events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Pending wagers */}
              {pendingWagers.map((wager) => (
                <div
                  key={wager.id}
                  className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span className="text-sm font-medium">
                        {getAgentName(wager.agent_id)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {wager.amount} tokens
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Bet on: {predictionLabels[wager.prediction] || wager.prediction}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Placed Day {wager.day_placed} • Resolves Day {wager.day_placed + 1}
                  </div>
                </div>
              ))}

              {/* Recently resolved wagers */}
              {resolvedWagers.slice(0, 5).map((wager) => (
                <div
                  key={wager.id}
                  className={`p-2 rounded-lg ${
                    wager.won 
                      ? 'bg-green-950/30 border border-green-800/30' 
                      : 'bg-red-950/30 border border-red-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {wager.won ? (
                        <Trophy className="h-3 w-3 text-green-400" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-sm font-medium">
                        {getAgentName(wager.agent_id)}
                      </span>
                    </div>
                    <Badge 
                      variant={wager.won ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {wager.won ? `+${wager.payout}` : `-${wager.amount}`}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {predictionLabels[wager.prediction] || wager.prediction}
                    {wager.won ? ' ✓' : ' ✗'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
