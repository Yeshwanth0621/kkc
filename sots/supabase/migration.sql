-- ========================================
-- SURVIVAL OF THE STATE — Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. COUNTRIES
CREATE TABLE countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  flag_emoji TEXT NOT NULL DEFAULT '🏳️',
  tier INT NOT NULL DEFAULT 1,
  population INT NOT NULL DEFAULT 10,
  food_req INT NOT NULL DEFAULT 5,
  food_produced INT NOT NULL DEFAULT 3,
  gc_balance INT NOT NULL DEFAULT 100,
  round_income INT NOT NULL DEFAULT 10,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. RESOURCES
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('Manpower','Energy','Food','Technology','Finance','Minerals','Manufacturing','Influence')),
  quantity INT NOT NULL DEFAULT 0,
  replenish_per_round INT NOT NULL DEFAULT 1
);

-- 3. INDUSTRY CATALOG (reference table)
CREATE TABLE industry_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tier INT NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'General',
  recipe_json JSONB NOT NULL DEFAULT '{}',
  gc_cost INT NOT NULL DEFAULT 10,
  build_rounds INT NOT NULL DEFAULT 1,
  income_per_round INT NOT NULL DEFAULT 5,
  max_builds INT NOT NULL DEFAULT 1,
  prerequisites TEXT DEFAULT 'None',
  special_effect TEXT DEFAULT 'None',
  who_can_build TEXT DEFAULT 'All'
);

-- 4. INDUSTRIES (built by countries)
CREATE TABLE industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  industry_name TEXT NOT NULL,
  tier INT NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'General',
  built_at_round INT NOT NULL DEFAULT 1,
  income_per_round INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT false
);

-- 5. TRADE OFFERS
CREATE TABLE trade_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  to_country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  round_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','countered')),
  offering_json JSONB NOT NULL DEFAULT '{}',
  requesting_json JSONB NOT NULL DEFAULT '{}',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- 6. GAME STATE
CREATE TABLE game_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  current_round INT NOT NULL DEFAULT 1,
  phase TEXT NOT NULL DEFAULT 'paused' CHECK (phase IN ('income','diplomacy','action','event','paused')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now()
);

-- 7. EVENT LOG
CREATE TABLE event_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_number INT NOT NULL DEFAULT 1,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  affected_countries TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. DIPLOMACY
CREATE TABLE diplomacy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_a_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  country_b_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  alliance_type TEXT NOT NULL CHECK (alliance_type IN ('trade_bloc','military_pact','aid','sanction','loan')),
  created_round INT NOT NULL DEFAULT 1,
  expires_round INT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 9. MARKET POSTS (open trade marketplace — any country can accept)
CREATE TABLE market_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  round_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','fulfilled','cancelled')),
  offering_json JSONB NOT NULL DEFAULT '{}',
  requesting_json JSONB NOT NULL DEFAULT '{}',
  message TEXT DEFAULT '',
  fulfilled_by UUID REFERENCES countries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ
);

-- ========================================
-- ENABLE REALTIME
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE trade_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE event_log;
ALTER PUBLICATION supabase_realtime ADD TABLE market_posts;

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE diplomacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_posts ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (all authenticated users can read most tables)
CREATE POLICY "Anyone can read countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Anyone can read industry_catalog" ON industry_catalog FOR SELECT USING (true);
CREATE POLICY "Anyone can read game_state" ON game_state FOR SELECT USING (true);
CREATE POLICY "Anyone can read event_log" ON event_log FOR SELECT USING (true);
CREATE POLICY "Anyone can read diplomacy" ON diplomacy FOR SELECT USING (true);
CREATE POLICY "Anyone can read industries" ON industries FOR SELECT USING (true);
CREATE POLICY "Anyone can read market_posts" ON market_posts FOR SELECT USING (true);

-- Resources: users can read all, write own
CREATE POLICY "Anyone can read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Users can update own resources" ON resources FOR UPDATE USING (
  EXISTS (SELECT 1 FROM countries WHERE countries.id = resources.country_id AND countries.user_id = auth.uid())
);

-- Trade offers: users can read their own + all pending, write own
CREATE POLICY "Anyone can read trade_offers" ON trade_offers FOR SELECT USING (true);
CREATE POLICY "Users can insert trade_offers" ON trade_offers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM countries WHERE countries.id = trade_offers.from_country_id AND countries.user_id = auth.uid())
);
CREATE POLICY "Users can update relevant trade_offers" ON trade_offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM countries WHERE (countries.id = trade_offers.from_country_id OR countries.id = trade_offers.to_country_id) AND countries.user_id = auth.uid())
);
CREATE POLICY "Users can delete own trade_offers" ON trade_offers FOR DELETE USING (
  EXISTS (SELECT 1 FROM countries WHERE countries.id = trade_offers.from_country_id AND countries.user_id = auth.uid())
);

-- Countries: users can update own
CREATE POLICY "Users can update own country" ON countries FOR UPDATE USING (user_id = auth.uid());

-- Industries: users can insert for own country
CREATE POLICY "Users can insert own industries" ON industries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM countries WHERE countries.id = industries.country_id AND countries.user_id = auth.uid())
);

-- Market posts: users can read all open, write own
CREATE POLICY "Users can insert market_posts" ON market_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM countries WHERE countries.id = market_posts.from_country_id AND countries.user_id = auth.uid())
);
CREATE POLICY "Users can update market_posts" ON market_posts FOR UPDATE USING (
  -- either they own it (to cancel) or they are fulfilling it (any country they own)
  EXISTS (SELECT 1 FROM countries WHERE countries.user_id = auth.uid())
);
CREATE POLICY "Users can delete own market_posts" ON market_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM countries WHERE countries.id = market_posts.from_country_id AND countries.user_id = auth.uid())
);

-- Admin bypass: For the admin user, create broader policies
-- NOTE: You should also give admin permissions via Supabase Dashboard → Authentication → Policies
-- or by adding admin-specific policies. For simplicity, the app uses the service role for admin operations.

-- Allow all operations for authenticated users (simplification for game context)
CREATE POLICY "Auth users full access to countries" ON countries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to resources" ON resources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to industries" ON industries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to trade_offers" ON trade_offers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to game_state" ON game_state FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to event_log" ON event_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to diplomacy" ON diplomacy FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to industry_catalog" ON industry_catalog FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access to market_posts" ON market_posts FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- INITIAL GAME STATE
-- ========================================
INSERT INTO game_state (current_round, phase, is_active, started_at)
VALUES (1, 'paused', true, now());
INSERT INTO event_log (round_number, event_type, description, affected_countries)
VALUES (1, 'game_start', 'Initial game state initialized.', ARRAY['All']);

-- ========================================
-- RESET GAME RPC (For Admin use)
-- ========================================
CREATE OR REPLACE FUNCTION reset_game_state()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Reset Game State to round 0 and paused
  UPDATE game_state SET current_round = 0, phase = 'paused', is_active = false;
  
  -- 2. Clear all history and transactions
  TRUNCATE TABLE event_log RESTART IDENTITY CASCADE;
  TRUNCATE TABLE trade_offers RESTART IDENTITY CASCADE;
  TRUNCATE TABLE market_posts RESTART IDENTITY CASCADE;
  TRUNCATE TABLE industries RESTART IDENTITY CASCADE;
  
  -- 3. Reset all Countries
  UPDATE countries SET 
    gc_balance = 100,
    population = 10,
    food_req = 5,
    food_produced = 3,
    round_income = 10;
    
  -- 4. Reset all Resources
  UPDATE resources SET quantity = 0;
  
  -- 5. Add init log
  INSERT INTO event_log (round_number, event_type, description, affected_countries)
  VALUES (0, 'game_reset', 'Game has been hard reset by Admin.', ARRAY['All']);
END;
$$;
