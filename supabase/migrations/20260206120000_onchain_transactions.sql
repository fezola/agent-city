-- Onchain transaction log for real CIV token transfers on Monad
CREATE TABLE public.onchain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  tx_type TEXT NOT NULL CHECK (tx_type IN (
    'salary_payment',
    'fee_collection',
    'building_purchase',
    'wager_payout',
    'treasury_distribution',
    'chaos_effect'
  )),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount_civ DECIMAL NOT NULL,
  amount_wei TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_onchain_tx_world_id ON public.onchain_transactions(world_id);
CREATE INDEX idx_onchain_tx_day ON public.onchain_transactions(day);
CREATE INDEX idx_onchain_tx_agent_id ON public.onchain_transactions(agent_id);
CREATE INDEX idx_onchain_tx_status ON public.onchain_transactions(status);

ALTER TABLE public.onchain_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON public.onchain_transactions FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.onchain_transactions;

-- Add onchain address to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS onchain_address TEXT;
