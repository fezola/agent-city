-- Create buildings table
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  building_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  built_day INTEGER NOT NULL,
  last_maintained_day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chaos_events table
CREATE TABLE public.chaos_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  severity NUMERIC NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  effects_applied JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create day_narratives table
CREATE TABLE public.day_narratives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergence_logs table
CREATE TABLE public.emergence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  detected BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collapse_evaluations table
CREATE TABLE public.collapse_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.world_state(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'stable',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chaos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collapse_evaluations ENABLE ROW LEVEL SECURITY;

-- Buildings policies
CREATE POLICY "Public read access for buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Public insert access for buildings" ON public.buildings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for buildings" ON public.buildings FOR UPDATE USING (true);
CREATE POLICY "Public delete access for buildings" ON public.buildings FOR DELETE USING (true);

-- Chaos events policies
CREATE POLICY "Public read access for chaos_events" ON public.chaos_events FOR SELECT USING (true);
CREATE POLICY "Public insert access for chaos_events" ON public.chaos_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for chaos_events" ON public.chaos_events FOR UPDATE USING (true);
CREATE POLICY "Public delete access for chaos_events" ON public.chaos_events FOR DELETE USING (true);

-- Day narratives policies
CREATE POLICY "Public read access for day_narratives" ON public.day_narratives FOR SELECT USING (true);
CREATE POLICY "Public insert access for day_narratives" ON public.day_narratives FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for day_narratives" ON public.day_narratives FOR UPDATE USING (true);
CREATE POLICY "Public delete access for day_narratives" ON public.day_narratives FOR DELETE USING (true);

-- Emergence logs policies
CREATE POLICY "Public read access for emergence_logs" ON public.emergence_logs FOR SELECT USING (true);
CREATE POLICY "Public insert access for emergence_logs" ON public.emergence_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for emergence_logs" ON public.emergence_logs FOR UPDATE USING (true);
CREATE POLICY "Public delete access for emergence_logs" ON public.emergence_logs FOR DELETE USING (true);

-- Collapse evaluations policies
CREATE POLICY "Public read access for collapse_evaluations" ON public.collapse_evaluations FOR SELECT USING (true);
CREATE POLICY "Public insert access for collapse_evaluations" ON public.collapse_evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for collapse_evaluations" ON public.collapse_evaluations FOR UPDATE USING (true);
CREATE POLICY "Public delete access for collapse_evaluations" ON public.collapse_evaluations FOR DELETE USING (true);

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.buildings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chaos_events;