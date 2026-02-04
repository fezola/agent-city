-- Meta-Agent Tables for Chaos, Collapse, Narrative, and Emergence

-- Chaos Events table - tracks disruptive events
CREATE TABLE public.chaos_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'emergency_tax_hike',
    'inflation_spike',
    'treasury_leak',
    'merchant_supply_shock',
    'worker_strike',
    'external_demand_boom',
    'no_event'
  )),
  severity DECIMAL NOT NULL DEFAULT 0.5 CHECK (severity >= 0 AND severity <= 1),
  reason TEXT NOT NULL,
  effects_applied JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Day Narratives table - human-readable story summaries
CREATE TABLE public.day_narratives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(world_id, day)
);

-- Emergence Logs table - detected emergent behaviors
CREATE TABLE public.emergence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  detected BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Collapse Evaluations table - tracks stability assessments
CREATE TABLE public.collapse_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('stable', 'unstable', 'collapsed')),
  confidence DECIMAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System Memory table - memory for meta-agents
CREATE TABLE public.system_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('chaos', 'collapse', 'narrative', 'emergence')),
  day INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_chaos_events_world_id ON public.chaos_events(world_id);
CREATE INDEX idx_chaos_events_day ON public.chaos_events(day);
CREATE INDEX idx_day_narratives_world_id ON public.day_narratives(world_id);
CREATE INDEX idx_emergence_logs_world_id ON public.emergence_logs(world_id);
CREATE INDEX idx_collapse_evaluations_world_id ON public.collapse_evaluations(world_id);
CREATE INDEX idx_system_memory_world_id ON public.system_memory(world_id);

-- Enable RLS
ALTER TABLE public.chaos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collapse_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_memory ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Public access for chaos_events" ON public.chaos_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for day_narratives" ON public.day_narratives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for emergence_logs" ON public.emergence_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for collapse_evaluations" ON public.collapse_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for system_memory" ON public.system_memory FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for narratives and chaos events
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaos_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.day_narratives;
