import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CIV_TOKEN } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface OnchainBalanceViewerProps {
  agentName: string;
  agentId: string;
  simulationBalance: number;
}

interface WalletInfo {
  address: string;
  civBalance: string;
  civRaw: string;
  monBalance: string;
  loading: boolean;
  error?: string;
}

export default function OnchainBalanceViewer({ agentName, agentId, simulationBalance }: OnchainBalanceViewerProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    civBalance: '—',
    civRaw: '0',
    monBalance: '—',
    loading: true,
  });

  const fetchWalletData = async () => {
    setWalletInfo(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const { data, error } = await supabase.functions.invoke('treasury-verify', {
        body: { action: 'agent-wallet', agentName },
      });

      if (error) throw error;

      setWalletInfo({
        address: data.address || '',
        civBalance: data.civBalance || '0',
        civRaw: data.civRaw || '0',
        monBalance: data.monBalance || '0',
        loading: false,
      });
    } catch (err) {
      setWalletInfo(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch wallet data',
      }));
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [agentName]);

  const shortAddress = walletInfo.address
    ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`
    : '—';

  const explorerUrl = walletInfo.address
    ? `${CIV_TOKEN.explorer}/address/${walletInfo.address}`
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Onchain Wallet
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          HD-derived wallet on {CIV_TOKEN.chain}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={fetchWalletData}
            disabled={walletInfo.loading}
          >
            {walletInfo.loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletInfo.error ? (
          <p className="text-sm text-destructive">{walletInfo.error}</p>
        ) : (
          <>
            {/* Address */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Address</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {shortAddress}
                </code>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Simulation Balance */}
              <div className="rounded-md border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Simulation</p>
                <p className="text-lg font-bold">{simulationBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{CIV_TOKEN.symbol}</p>
              </div>

              {/* Onchain CIV */}
              <div className="rounded-md border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Onchain</p>
                <p className={cn(
                  "text-lg font-bold",
                  walletInfo.loading && "animate-pulse"
                )}>
                  {walletInfo.loading ? '...' : walletInfo.civBalance}
                </p>
                <p className="text-xs text-muted-foreground">{CIV_TOKEN.symbol}</p>
              </div>

              {/* MON Gas */}
              <div className="rounded-md border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Gas</p>
                <p className={cn(
                  "text-lg font-bold",
                  walletInfo.loading && "animate-pulse",
                  !walletInfo.loading && parseFloat(walletInfo.monBalance) < 0.001 && "text-destructive"
                )}>
                  {walletInfo.loading ? '...' : walletInfo.monBalance}
                </p>
                <p className="text-xs text-muted-foreground">MON</p>
              </div>
            </div>

            {/* Sync Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Scale: 1 sim = 0.001 real CIV</span>
              {!walletInfo.loading && (
                <Badge variant={
                  parseFloat(walletInfo.monBalance) >= 0.001 ? 'secondary' : 'destructive'
                }>
                  {parseFloat(walletInfo.monBalance) >= 0.001 ? 'Gas OK' : 'Low Gas'}
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
