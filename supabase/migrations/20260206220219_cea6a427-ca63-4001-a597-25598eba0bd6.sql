
-- Create onchain_transactions table for logging CIV token transfers
CREATE TABLE public.onchain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id),
  day INTEGER NOT NULL,
  tx_type TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount_civ NUMERIC NOT NULL DEFAULT 0,
  amount_wei TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  agent_id UUID REFERENCES public.agents(id),
  agent_name TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onchain_transactions ENABLE ROW LEVEL SECURITY;

-- Public read access (simulation is public)
CREATE POLICY "Public read access for onchain_transactions"
ON public.onchain_transactions FOR SELECT USING (true);

-- Public insert for edge functions
CREATE POLICY "Public insert access for onchain_transactions"
ON public.onchain_transactions FOR INSERT WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_onchain_transactions_world_day ON public.onchain_transactions(world_id, day);
CREATE INDEX idx_onchain_transactions_agent ON public.onchain_transactions(agent_id);
