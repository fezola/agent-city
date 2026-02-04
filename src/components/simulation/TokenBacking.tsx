import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Coins } from 'lucide-react';
import { CIV_TOKEN } from '@/types/simulation';
import { supabase } from '@/integrations/supabase/client';

interface TreasuryData {
  token: {
    name: string;
    symbol: string;
    contract: string;
    chain: string;
  };
  treasury: {
    wallet: string;
    balance_raw: string;
    balance_formatted: string;
    success: boolean;
    error?: string;
  };
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function TokenBacking({ virtualTotal }: { virtualTotal: number }) {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTreasury() {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('treasury-verify');
      if (fnError) throw fnError;
      setData(result as TreasuryData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-white">{CIV_TOKEN.name}</span>
            <span className="text-xs text-zinc-400">({CIV_TOKEN.symbol})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={fetchTreasury}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Contract</span>
            <a
              href={`https://explorer.monad.xyz/address/${CIV_TOKEN.contract}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              {truncateAddress(CIV_TOKEN.contract)}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Chain</span>
            <span className="text-zinc-200">{CIV_TOKEN.chain}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Virtual Total</span>
            <span className="text-zinc-200 font-mono">
              {virtualTotal.toLocaleString()} {CIV_TOKEN.symbol}
            </span>
          </div>

          {data && (
            <>
              <div className="border-t border-zinc-700 pt-1.5 mt-1.5" />
              <div className="flex justify-between">
                <span className="text-zinc-400">Treasury Wallet</span>
                <span className="text-zinc-200 font-mono">
                  {truncateAddress(data.treasury.wallet || '—')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Onchain Balance</span>
                <span className={`font-mono ${data.treasury.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.treasury.success
                    ? `${parseFloat(data.treasury.balance_formatted).toLocaleString()} ${CIV_TOKEN.symbol}`
                    : data.treasury.error || 'Error'}
                </span>
              </div>
            </>
          )}

          {error && (
            <div className="text-red-400 text-[10px]">{error}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
