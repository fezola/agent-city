-- Buildings table for agent construction system
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES world_state(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  building_type TEXT NOT NULL CHECK (building_type IN ('housing','factory','market','gate','power_hub')),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 3),
  is_active BOOLEAN NOT NULL DEFAULT true,
  built_day INTEGER NOT NULL,
  last_maintained_day INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_buildings_world_id ON buildings(world_id);
CREATE INDEX idx_buildings_owner_id ON buildings(owner_id);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON buildings FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE buildings;
