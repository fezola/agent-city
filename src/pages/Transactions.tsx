import { useSimulationContext } from '@/contexts/SimulationContext';
import { OnchainTransaction, CIV_TOKEN } from '@/types/simulation';
import { ExternalLink, CheckCircle, XCircle, Clock, ArrowRight, Link2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TX_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  salary_payment: { label: 'Salary', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '💰' },
  fee_collection: { label: 'Fee', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '🏛️' },
  building_purchase: { label: 'Build', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🏗️' },
  wager_payout: { label: 'Wager', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🎲' },
  treasury_distribution: { label: 'Distribute', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: '📤' },
  chaos_effect: { label: 'Chaos', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '⚡' },
  trade: { label: 'Trade', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🤝' },
  gift: { label: 'Gift', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: '🎁' },
  bribe: { label: 'Bribe', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '💎' },
  service_payment: { label: 'Service', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', icon: '🔧' },
};

const STATUS_ICONS = {
  confirmed: CheckCircle,
  failed: XCircle,
  pending: Clock,
};

const STATUS_COLORS = {
  confirmed: 'text-emerald-400',
  failed: 'text-red-400',
  pending: 'text-yellow-400',
};

function truncateAddress(addr: string): string {
  if (!addr || addr.length <= 12) return addr || '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function TransactionRow({ tx }: { tx: OnchainTransaction }) {
  const typeInfo = TX_TYPE_CONFIG[tx.tx_type] || { label: tx.tx_type, color: 'bg-muted text-muted-foreground border-border', icon: '📋' };
  const StatusIcon = STATUS_ICONS[tx.status as keyof typeof STATUS_ICONS] || Clock;
  const statusColor = STATUS_COLORS[tx.status as keyof typeof STATUS_COLORS] || 'text-muted-foreground';

  return (
    <div className="group px-4 py-3 border-b border-border/20 hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-3">
        {/* Day */}
        <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">d{tx.day}</span>

        {/* Status */}
        <StatusIcon className={cn('h-4 w-4 shrink-0', statusColor)} />

        {/* Type badge */}
        <Badge variant="outline" className={cn('text-[10px] font-medium border shrink-0', typeInfo.color)}>
          {typeInfo.icon} {typeInfo.label}
        </Badge>

        {/* Agent */}
        <span className="text-sm text-foreground truncate min-w-0 flex-1">
          {tx.agent_name || '—'}
        </span>

        {/* Amount */}
        <span className="text-sm font-mono font-medium text-foreground shrink-0">
          {Number(tx.amount_civ).toFixed(4)} {CIV_TOKEN.symbol}
        </span>
      </div>

      {/* Address row */}
      <div className="flex items-center gap-2 mt-1.5 pl-11">
        <span className="text-[11px] font-mono text-muted-foreground">
          {truncateAddress(tx.from_address)}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        <span className="text-[11px] font-mono text-muted-foreground">
          {truncateAddress(tx.to_address)}
        </span>

        {tx.tx_hash && (
          <a
            href={`${CIV_TOKEN.explorer}/tx/${tx.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {truncateAddress(tx.tx_hash)}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {tx.error_message && (
          <span className="ml-auto text-[11px] text-red-400 truncate max-w-[200px]" title={tx.error_message}>
            {tx.error_message}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Transactions() {
  const { onchainTransactions, worldState } = useSimulationContext();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let txs = [...onchainTransactions];
    if (typeFilter !== 'all') txs = txs.filter(t => t.tx_type === typeFilter);
    if (statusFilter !== 'all') txs = txs.filter(t => t.status === statusFilter);
    return txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [onchainTransactions, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const confirmed = onchainTransactions.filter(t => t.status === 'confirmed');
    const failed = onchainTransactions.filter(t => t.status === 'failed');
    const totalCiv = confirmed.reduce((sum, t) => sum + Number(t.amount_civ), 0);
    const agentTransfers = onchainTransactions.filter(t => ['trade', 'gift', 'bribe', 'service_payment'].includes(t.tx_type));
    return { confirmed: confirmed.length, failed: failed.length, totalCiv, agentTransfers: agentTransfers.length };
  }, [onchainTransactions]);

  const txTypes = useMemo(() => {
    const types = new Set(onchainTransactions.map(t => t.tx_type));
    return Array.from(types);
  }, [onchainTransactions]);

  if (!worldState) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Link2 className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No simulation running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Transaction History</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              All CIV token transfers on Monad — Day {worldState.day}
            </p>
          </div>
          <a
            href={`${CIV_TOKEN.explorer}/address/${CIV_TOKEN.contract}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View Contract <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirmed</span>
            <p className="text-lg font-mono font-semibold text-emerald-400">{stats.confirmed}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Failed</span>
            <p className="text-lg font-mono font-semibold text-red-400">{stats.failed}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total CIV</span>
            <p className="text-lg font-mono font-semibold text-foreground">{stats.totalCiv.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">P2P Transfers</span>
            <p className="text-lg font-mono font-semibold text-orange-400">{stats.agentTransfers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-3">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {txTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {TX_TYPE_CONFIG[type]?.label || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-7 w-[120px] text-xs">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          {(typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
            >
              Clear
            </Button>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <Link2 className="h-6 w-6 opacity-40" />
            <span className="text-sm">No transactions found</span>
            <span className="text-[11px]">Transactions appear after simulation days complete</span>
          </div>
        ) : (
          filtered.map(tx => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}
