import { OnchainTransaction, CIV_TOKEN } from '@/types/simulation';
import { ExternalLink, CheckCircle, XCircle, Clock, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnchainActivityProps {
  transactions: OnchainTransaction[];
}

const TX_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  salary_payment: { label: 'Salary', color: 'text-emerald-400' },
  fee_collection: { label: 'Fee', color: 'text-amber-400' },
  building_purchase: { label: 'Build', color: 'text-blue-400' },
  wager_payout: { label: 'Wager', color: 'text-purple-400' },
  treasury_distribution: { label: 'Distribute', color: 'text-cyan-400' },
  chaos_effect: { label: 'Chaos', color: 'text-red-400' },
};

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  confirmed: CheckCircle,
  failed: XCircle,
  pending: Clock,
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-emerald-400',
  failed: 'text-red-400',
  pending: 'text-yellow-400',
};

function truncateAddress(addr: string): string {
  if (!addr || addr.length <= 12) return addr || '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function OnchainActivity({ transactions }: OnchainActivityProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-xs text-muted-foreground gap-2">
        <Link2 className="h-5 w-5 opacity-40" />
        <span>No onchain transactions yet</span>
        <span className="text-[10px]">Transactions appear after each simulation day</span>
      </div>
    );
  }

  const confirmed = transactions.filter(t => t.status === 'confirmed').length;
  const failed = transactions.filter(t => t.status === 'failed').length;

  return (
    <div className="h-full flex flex-col">
      {/* Summary bar */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border/30 bg-muted/10">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Onchain</span>
        <span className="text-xs font-mono text-emerald-400">{confirmed} confirmed</span>
        {failed > 0 && (
          <span className="text-xs font-mono text-red-400">{failed} failed</span>
        )}
        <a
          href={`${CIV_TOKEN.explorer}/address/${CIV_TOKEN.contract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
        >
          Contract <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto">
        {transactions.map((tx) => {
          const typeInfo = TX_TYPE_LABELS[tx.tx_type] || { label: tx.tx_type, color: 'text-zinc-400' };
          const StatusIcon = STATUS_ICONS[tx.status] || Clock;

          return (
            <div
              key={tx.id}
              className="px-3 py-2 border-b border-border/10 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground w-5">d{tx.day}</span>
                <StatusIcon className={cn('h-3 w-3', STATUS_COLORS[tx.status])} />
                <span className={cn('text-xs font-medium', typeInfo.color)}>
                  {typeInfo.label}
                </span>
                {tx.agent_name && (
                  <span className="text-[10px] text-zinc-400 truncate">
                    {tx.agent_name}
                  </span>
                )}
                <span className="ml-auto text-xs font-mono text-zinc-200">
                  {Number(tx.amount_civ).toFixed(3)} {CIV_TOKEN.symbol}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 pl-5">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {truncateAddress(tx.from_address)} → {truncateAddress(tx.to_address)}
                </span>
                {tx.tx_hash && (
                  <a
                    href={`${CIV_TOKEN.explorer}/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 text-[10px] font-mono"
                  >
                    {truncateAddress(tx.tx_hash)}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {tx.error_message && (
                  <span className="text-[10px] text-red-400 truncate" title={tx.error_message}>
                    {tx.error_message}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
