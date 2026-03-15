-- ========================================
-- SURVIVAL OF THE STATE — Seed Data
-- Run this AFTER migration.sql
-- ========================================

-- ────────────────────────────────────────
-- 15 COUNTRIES
-- ────────────────────────────────────────

INSERT INTO countries (name, flag_emoji, tier, population, food_req, food_produced, gc_balance, round_income) VALUES
  ('India',        '🇮🇳', 2, 140, 14, 12, 100, 10),
  ('China',        '🇨🇳', 2, 140, 14, 12, 100, 10),
  ('Russia',       '🇷🇺', 2, 15,  4,  2,  100, 10),
  ('America',      '🇺🇸', 1, 33,  7,  5,  100, 15),
  ('Germany',      '🇩🇪', 1, 8,   3,  2,  100, 12),
  ('France',       '🇫🇷', 1, 7,   3,  3,  100, 12),
  ('UAE',          '🇦🇪', 2, 1,   3,  3,  100, 12),
  ('Spain',        '🇪🇸', 2, 5,   4,  2,  100, 10),
  ('Singapore',    '🇸🇬', 1, 1,   5,  3,  100, 15),
  ('Japan',        '🇯🇵', 1, 12,  5,  3,  100, 12),
  ('Australia',    '🇦🇺', 2, 3,   3,  2,  100, 10),
  ('Canada',       '🇨🇦', 2, 4,   4,  2,  100, 10),
  ('South Korea',  '🇰🇷', 1, 5,   4,  2,  100, 12),
  ('South Africa', '🇿🇦', 3, 6,   4,  2,  100, 8),
  ('New Zealand',  '🇳🇿', 3, 1,   2,  1,  100, 8);

-- ────────────────────────────────────────
-- RESOURCES FOR EACH COUNTRY (8 per country)
-- Primary resources get custom values, others get base amounts
-- ────────────────────────────────────────

-- Function to insert resources for a country
DO $$
DECLARE
  cid UUID;
BEGIN
  -- India: Manpower(10), Food(6), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'India';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 10, 3), (cid, 'Energy', 2, 1), (cid, 'Food', 6, 2),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- China: Manpower(12), Minerals(8), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'China';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 12, 3), (cid, 'Energy', 2, 1), (cid, 'Food', 2, 1),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 8, 2),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- Russia: Energy(15), Minerals(10), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Russia';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 15, 4), (cid, 'Food', 2, 1),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 10, 3),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- America: Finance(12), Technology(8), rest=3
  SELECT id INTO cid FROM countries WHERE name = 'America';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 3, 1), (cid, 'Energy', 3, 1), (cid, 'Food', 3, 1),
    (cid, 'Technology', 8, 2), (cid, 'Finance', 12, 3), (cid, 'Minerals', 3, 1),
    (cid, 'Manufacturing', 3, 1), (cid, 'Influence', 3, 1);

  -- Germany: Technology(10), Manufacturing(6), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Germany';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 2, 1), (cid, 'Food', 2, 1),
    (cid, 'Technology', 10, 3), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 6, 2), (cid, 'Influence', 2, 1);

  -- France: Food(8), Energy(7), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'France';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 7, 2), (cid, 'Food', 8, 2),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- UAE: Energy(12), Finance(9), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'UAE';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 12, 3), (cid, 'Food', 2, 1),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 9, 2), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- Spain: Food(7), Influence(8), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Spain';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 2, 1), (cid, 'Food', 7, 2),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 8, 2);

  -- Singapore: Finance(14), Influence(12), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Singapore';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 2, 1), (cid, 'Food', 2, 1),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 14, 4), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 12, 3);

  -- Japan: Technology(11), Manufacturing(9), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Japan';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 2, 1), (cid, 'Food', 2, 1),
    (cid, 'Technology', 11, 3), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 9, 2), (cid, 'Influence', 2, 1);

  -- Australia: Minerals(12), Food(8), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Australia';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 2, 1), (cid, 'Food', 8, 2),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 12, 3),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- Canada: Energy(10), Food(8), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'Canada';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 10, 3), (cid, 'Food', 8, 2),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- South Korea: Technology(11), Manufacturing(9), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'South Korea';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 2, 1), (cid, 'Food', 2, 1),
    (cid, 'Technology', 11, 3), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 9, 2), (cid, 'Influence', 2, 1);

  -- South Africa: Minerals(8), Manpower(8), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'South Africa';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 8, 2), (cid, 'Energy', 2, 1), (cid, 'Food', 2, 1),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 8, 2),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);

  -- New Zealand: Food(9), Energy(10), rest=2
  SELECT id INTO cid FROM countries WHERE name = 'New Zealand';
  INSERT INTO resources (country_id, resource_type, quantity, replenish_per_round) VALUES
    (cid, 'Manpower', 2, 1), (cid, 'Energy', 10, 3), (cid, 'Food', 9, 2),
    (cid, 'Technology', 2, 1), (cid, 'Finance', 2, 1), (cid, 'Minerals', 2, 1),
    (cid, 'Manufacturing', 2, 1), (cid, 'Influence', 2, 1);
END $$;

-- ────────────────────────────────────────
-- 35 INDUSTRIES (industry_catalog)
-- ────────────────────────────────────────

-- TIER 1 (8 industries) — Basic infrastructure
INSERT INTO industry_catalog (name, tier, category, recipe_json, gc_cost, build_rounds, income_per_round, max_builds, prerequisites, special_effect, who_can_build) VALUES
  ('Farm', 1, 'Agriculture',
   '{"Manpower": 2, "Food": 1}', 10, 1, 5, 3, 'None', 'Increases food_produced by 2', 'All'),
  ('Water Treatment', 1, 'Infrastructure',
   '{"Manpower": 2, "Minerals": 1}', 12, 1, 4, 2, 'None', 'Reduces food_req by 1', 'All'),
  ('Basic Mine', 1, 'Mining',
   '{"Manpower": 3, "Energy": 1}', 15, 1, 6, 2, 'None', '+2 Minerals per round', 'All'),
  ('Oil/Gas Well', 1, 'Energy',
   '{"Manpower": 2, "Minerals": 2}', 15, 1, 7, 2, 'None', '+2 Energy per round', 'All'),
  ('Solar Farm', 1, 'Energy',
   '{"Manpower": 1, "Technology": 1, "Minerals": 1}', 12, 1, 5, 3, 'None', 'Clean energy source', 'All'),
  ('Coal Power Plant', 1, 'Energy',
   '{"Manpower": 2, "Minerals": 2}', 10, 1, 6, 2, 'None', '+3 Energy per round', 'All'),
  ('Fishing Port', 1, 'Agriculture',
   '{"Manpower": 2, "Manufacturing": 1}', 10, 1, 4, 2, 'None', '+2 Food per round', 'All'),
  ('Lumber Mill', 1, 'Manufacturing',
   '{"Manpower": 2, "Energy": 1}', 8, 1, 4, 2, 'None', '+1 Manufacturing per round', 'All');

-- TIER 2 (9 industries) — Advanced infrastructure
INSERT INTO industry_catalog (name, tier, category, recipe_json, gc_cost, build_rounds, income_per_round, max_builds, prerequisites, special_effect, who_can_build) VALUES
  ('Steel Mill', 2, 'Manufacturing',
   '{"Minerals": 4, "Energy": 3, "Manpower": 2}', 25, 2, 10, 2, 'Basic Mine', '+3 Manufacturing per round', 'All'),
  ('Food Processing', 2, 'Agriculture',
   '{"Food": 3, "Energy": 2, "Manufacturing": 1}', 20, 1, 8, 2, 'Farm', '+3 Food per round', 'All'),
  ('Oil Refinery', 2, 'Energy',
   '{"Energy": 4, "Minerals": 3, "Technology": 1}', 30, 2, 12, 1, 'Oil/Gas Well', '+4 Energy per round', 'All'),
  ('Textile Factory', 2, 'Manufacturing',
   '{"Manpower": 3, "Manufacturing": 2, "Energy": 1}', 18, 1, 7, 2, 'None', 'Employs population', 'All'),
  ('Port/Harbour', 2, 'Infrastructure',
   '{"Minerals": 3, "Manpower": 3, "Manufacturing": 2}', 25, 2, 9, 1, 'None', 'Enables overseas trade bonuses', 'All'),
  ('Hospital Network', 2, 'Services',
   '{"Technology": 2, "Manpower": 3, "Finance": 2}', 30, 2, 6, 1, 'None', '+5 population growth', 'All'),
  ('University', 2, 'Services',
   '{"Technology": 3, "Manpower": 2, "Finance": 2}', 28, 2, 8, 1, 'None', '+2 Technology per round', 'All'),
  ('Gas Pipeline', 2, 'Energy',
   '{"Energy": 3, "Minerals": 4, "Manpower": 2}', 22, 2, 10, 1, 'Oil/Gas Well', 'Energy distribution network', 'All'),
  ('Arms Factory', 2, 'Military',
   '{"Manufacturing": 4, "Minerals": 3, "Technology": 2}', 35, 2, 12, 1, 'Steel Mill', '+3 Influence per round', 'All');

-- TIER 3 (8 industries) — High-tech infrastructure
INSERT INTO industry_catalog (name, tier, category, recipe_json, gc_cost, build_rounds, income_per_round, max_builds, prerequisites, special_effect, who_can_build) VALUES
  ('Automobile Factory', 3, 'Manufacturing',
   '{"Manufacturing": 5, "Technology": 3, "Minerals": 3, "Energy": 2}', 40, 2, 15, 1, 'Steel Mill', 'High-value exports', 'All'),
  ('Tech Campus', 3, 'Technology',
   '{"Technology": 5, "Finance": 3, "Manpower": 2, "Energy": 2}', 45, 2, 18, 1, 'University', '+4 Technology per round', 'All'),
  ('Pharma Plant', 3, 'Technology',
   '{"Technology": 4, "Manpower": 3, "Finance": 2, "Food": 1}', 38, 2, 14, 1, 'Hospital Network', 'Reduces pandemic impact', 'All'),
  ('Nuclear Power Plant', 3, 'Energy',
   '{"Technology": 5, "Minerals": 4, "Energy": 3, "Manpower": 2}', 50, 3, 20, 1, 'University', '+8 Energy per round', 'All'),
  ('Special Econ Zone', 3, 'Finance',
   '{"Finance": 5, "Influence": 3, "Manpower": 3}', 40, 2, 16, 1, 'Port/Harbour', '+5 Finance per round', 'All'),
  ('Shipyard', 3, 'Manufacturing',
   '{"Manufacturing": 5, "Minerals": 4, "Manpower": 3, "Technology": 2}', 42, 2, 14, 1, 'Port/Harbour,Steel Mill', 'Naval power projection', 'All'),
  ('Media & Culture Hub', 3, 'Services',
   '{"Influence": 4, "Technology": 3, "Finance": 2}', 30, 2, 12, 1, 'University', '+5 Influence per round', 'All'),
  ('Financial Exchange', 3, 'Finance',
   '{"Finance": 6, "Technology": 3, "Influence": 2}', 45, 2, 18, 1, 'None', '+6 Finance per round', 'All');

-- TIER 4 (7 industries) — Endgame megastructures
INSERT INTO industry_catalog (name, tier, category, recipe_json, gc_cost, build_rounds, income_per_round, max_builds, prerequisites, special_effect, who_can_build) VALUES
  ('AI Research Lab', 4, 'Technology',
   '{"Technology": 8, "Finance": 5, "Energy": 4, "Manpower": 3}', 60, 3, 25, 1, 'Tech Campus', 'Doubles Technology income', 'All'),
  ('Space Agency', 4, 'Technology',
   '{"Technology": 8, "Finance": 6, "Energy": 5, "Manufacturing": 4}', 70, 3, 30, 1, 'Tech Campus,Nuclear Power Plant', 'National prestige +10 Influence', 'All'),
  ('Green Energy Grid', 4, 'Energy',
   '{"Technology": 6, "Energy": 5, "Finance": 4, "Manufacturing": 3}', 55, 3, 22, 1, 'Solar Farm,Nuclear Power Plant', 'Eliminates energy dependency', 'All'),
  ('Biotech Lab', 4, 'Technology',
   '{"Technology": 7, "Finance": 4, "Food": 3, "Manpower": 3}', 50, 3, 20, 1, 'Pharma Plant,Tech Campus', 'Food production +50%', 'All'),
  ('Sovereign Fund', 4, 'Finance',
   '{"Finance": 10, "Influence": 5, "Technology": 3}', 65, 3, 28, 1, 'Financial Exchange,Special Econ Zone', 'GC income +50%', 'All'),
  ('Megacity Hub', 4, 'Infrastructure',
   '{"Manpower": 8, "Finance": 6, "Technology": 4, "Manufacturing": 4, "Energy": 3}', 60, 3, 22, 1, 'Hospital Network,University', '+20 population capacity', 'All'),
  ('Global HQ', 4, 'Services',
   '{"Finance": 8, "Technology": 6, "Influence": 5, "Manufacturing": 3}', 70, 3, 30, 1, 'Financial Exchange,Tech Campus', 'Dominant global player status', 'All');

-- SPECIAL (4 industries)
INSERT INTO industry_catalog (name, tier, category, recipe_json, gc_cost, build_rounds, income_per_round, max_builds, prerequisites, special_effect, who_can_build) VALUES
  ('Trade Canal', 0, 'Special',
   '{"Minerals": 6, "Manpower": 5, "Finance": 4, "Manufacturing": 3}', 50, 3, 20, 1, 'Port/Harbour', 'All trades give +10% bonus resources', 'All'),
  ('Rare Earth Monopoly', 0, 'Special',
   '{"Minerals": 8, "Technology": 4, "Energy": 3}', 45, 2, 18, 1, 'Basic Mine,Steel Mill', 'Controls rare earth supply: +3 to all resource income', 'All'),
  ('Remittance Network', 0, 'Special',
   '{"Finance": 6, "Influence": 4, "Technology": 3}', 35, 2, 15, 1, 'None', 'Diaspora income: +10 GC per round per trade partner', 'All'),
  ('Luxury Export Hub', 0, 'Special',
   '{"Manufacturing": 5, "Influence": 4, "Finance": 3, "Food": 2}', 40, 2, 16, 1, 'Textile Factory', 'Premium goods: trade offers worth +20% more', 'All');
