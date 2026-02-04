import { WorldState } from '@/types/simulation';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface StatsStripProps {
  worldState: WorldState;
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={cn(
        "text-xs font-mono font-medium",
        danger && "text-red-400"
      )}>
        {value}
      </span>
    </div>
  );
}

export function StatsStrip({ worldState }: StatsStripProps) {
  return (
    <div className="flex items-center h-8 px-4 border-b bg-muted/20 gap-3 overflow-x-auto scrollbar-hide">
      <Stat
        label="Treasury"
        value={worldState.treasury_balance.toLocaleString()}
        danger={worldState.treasury_balance < 3000}
      />
      <Separator orientation="vertical" className="h-3" />
      <Stat
        label="Tax"
        value={`${(worldState.tax_rate * 100).toFixed(0)}%`}
      />
      <Separator orientation="vertical" className="h-3" />
      <Stat
        label="Salary"
        value={worldState.salary_rate.toString()}
      />
      <Separator orientation="vertical" className="h-3" />
      <Stat
        label="Fee"
        value={worldState.participation_fee.toString()}
      />
      <Separator orientation="vertical" className="h-3" />
      <Stat
        label="Inflation"
        value={`${worldState.inflation.toFixed(1)}%`}
      />
      <Separator orientation="vertical" className="h-3" />
      <Stat
        label="Satisfaction"
        value={`${worldState.worker_satisfaction}%`}
        danger={worldState.worker_satisfaction < 30}
      />
      <Separator orientation="vertical" className="h-3" />
      <Stat
        label="Stability"
        value={`${worldState.merchant_stability}%`}
        danger={worldState.merchant_stability < 30}
      />
    </div>
  );
}
