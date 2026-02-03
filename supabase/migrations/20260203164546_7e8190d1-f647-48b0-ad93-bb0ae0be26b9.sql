-- World State table - tracks global simulation state
CREATE TABLE public.world_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day INTEGER NOT NULL DEFAULT 1,
  treasury_balance DECIMAL NOT NULL DEFAULT 10000,
  tax_rate DECIMAL NOT NULL DEFAULT 0.15,
  salary_rate DECIMAL NOT NULL DEFAULT 100,
  participation_fee DECIMAL NOT NULL DEFAULT 20,
  city_health DECIMAL NOT NULL DEFAULT 100,
  worker_satisfaction DECIMAL NOT NULL DEFAULT 75,
  merchant_stability DECIMAL NOT NULL DEFAULT 80,
  inflation DECIMAL NOT NULL DEFAULT 1.0,
  is_running BOOLEAN NOT NULL DEFAULT false,
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agents table - all agent types stored here
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('governor', 'worker', 'merchant')),
  balance DECIMAL NOT NULL DEFAULT 500,
  is_alive BOOLEAN NOT NULL DEFAULT true,
  mood TEXT NOT NULL DEFAULT 'neutral' CHECK (mood IN ('ecstatic', 'happy', 'neutral', 'frustrated', 'desperate')),
  confidence DECIMAL NOT NULL DEFAULT 0.7,
  -- Merchant-specific fields
  current_price_modifier DECIMAL DEFAULT 1.0,
  -- Governor-specific fields (stored for history)
  last_action TEXT,
  last_action_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Memories table
CREATE TABLE public.agent_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  event TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('positive', 'negative', 'neutral')),
  emotion TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wagers table
CREATE TABLE public.wagers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day_placed INTEGER NOT NULL,
  prediction TEXT NOT NULL CHECK (prediction IN ('tax_up', 'tax_down', 'salary_up', 'salary_down', 'collapse', 'stability')),
  amount DECIMAL NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  won BOOLEAN,
  payout DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- World Events log
CREATE TABLE public.world_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name TEXT,
  description TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Balance history for charts
CREATE TABLE public.balance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  balance DECIMAL NOT NULL,
  treasury_balance DECIMAL,
  worker_satisfaction DECIMAL,
  city_health DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_agents_world_id ON public.agents(world_id);
CREATE INDEX idx_agents_type ON public.agents(agent_type);
CREATE INDEX idx_memories_agent_id ON public.agent_memories(agent_id);
CREATE INDEX idx_wagers_agent_id ON public.wagers(agent_id);
CREATE INDEX idx_wagers_world_id ON public.wagers(world_id);
CREATE INDEX idx_events_world_id ON public.world_events(world_id);
CREATE INDEX idx_balance_history_world_id ON public.balance_history(world_id);

-- Enable RLS on all tables
ALTER TABLE public.world_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_history ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (this is a public simulation, no auth required)
CREATE POLICY "Public read access for world_state" ON public.world_state FOR SELECT USING (true);
CREATE POLICY "Public insert access for world_state" ON public.world_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for world_state" ON public.world_state FOR UPDATE USING (true);
CREATE POLICY "Public delete access for world_state" ON public.world_state FOR DELETE USING (true);

CREATE POLICY "Public read access for agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public insert access for agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Public delete access for agents" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Public read access for agent_memories" ON public.agent_memories FOR SELECT USING (true);
CREATE POLICY "Public insert access for agent_memories" ON public.agent_memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for agent_memories" ON public.agent_memories FOR UPDATE USING (true);
CREATE POLICY "Public delete access for agent_memories" ON public.agent_memories FOR DELETE USING (true);

CREATE POLICY "Public read access for wagers" ON public.wagers FOR SELECT USING (true);
CREATE POLICY "Public insert access for wagers" ON public.wagers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for wagers" ON public.wagers FOR UPDATE USING (true);
CREATE POLICY "Public delete access for wagers" ON public.wagers FOR DELETE USING (true);

CREATE POLICY "Public read access for world_events" ON public.world_events FOR SELECT USING (true);
CREATE POLICY "Public insert access for world_events" ON public.world_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for world_events" ON public.world_events FOR UPDATE USING (true);
CREATE POLICY "Public delete access for world_events" ON public.world_events FOR DELETE USING (true);

CREATE POLICY "Public read access for balance_history" ON public.balance_history FOR SELECT USING (true);
CREATE POLICY "Public insert access for balance_history" ON public.balance_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for balance_history" ON public.balance_history FOR UPDATE USING (true);
CREATE POLICY "Public delete access for balance_history" ON public.balance_history FOR DELETE USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.world_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.world_events;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_world_state_updated_at
  BEFORE UPDATE ON public.world_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();