create extension if not exists pgcrypto;

drop table if exists diplomacy cascade;
drop table if exists event_log cascade;
drop table if exists game_state cascade;
drop table if exists trade_offers cascade;
drop table if exists industries cascade;
drop table if exists resources cascade;
drop table if exists industry_catalog cascade;
drop table if exists countries cascade;

create table countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  flag_emoji text not null,
  tier int not null,
  population int not null,
  food_req int not null,
  food_produced int not null,
  gc_balance int not null default 0,
  round_income int not null default 0,
  user_id uuid references auth.users(id)
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  resource_type text not null check (resource_type in ('Manpower', 'Energy', 'Food', 'Technology', 'Finance', 'Minerals', 'Manufacturing', 'Influence')),
  quantity int not null default 0,
  replenish_per_round int not null default 0,
  unique (country_id, resource_type)
);

create table industries (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references countries(id) on delete cascade,
  industry_name text not null,
  tier int not null,
  category text not null,
  built_at_round int not null,
  income_per_round int not null default 0,
  is_active boolean not null default false
);

create table industry_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tier int not null,
  category text not null,
  recipe_json jsonb not null,
  gc_cost int not null,
  build_rounds int not null,
  income_per_round int not null,
  max_builds int not null,
  prerequisites text,
  special_effect text,
  who_can_build text not null default 'all'
);

create table trade_offers (
  id uuid primary key default gen_random_uuid(),
  from_country_id uuid not null references countries(id) on delete cascade,
  to_country_id uuid not null references countries(id) on delete cascade,
  round_number int not null,
  status text not null check (status in ('pending', 'accepted', 'rejected', 'countered', 'cancelled', 'voided')),
  offering_json jsonb not null,
  requesting_json jsonb not null,
  message text check (char_length(message) <= 100),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table game_state (
  id uuid primary key default gen_random_uuid(),
  current_round int not null default 1,
  phase text not null check (phase in ('income', 'diplomacy', 'action', 'event', 'paused')),
  is_active boolean not null default false,
  started_at timestamptz
);

create table event_log (
  id uuid primary key default gen_random_uuid(),
  round_number int not null,
  event_type text not null,
  description text not null,
  affected_countries text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table diplomacy (
  id uuid primary key default gen_random_uuid(),
  country_a_id uuid not null references countries(id) on delete cascade,
  country_b_id uuid not null references countries(id) on delete cascade,
  alliance_type text not null check (alliance_type in ('trade_bloc', 'military_pact', 'aid', 'sanction', 'loan')),
  created_round int not null,
  expires_round int,
  is_active boolean not null default true
);

insert into game_state (current_round, phase, is_active, started_at)
values (1, 'paused', false, now());

create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() ->> 'app_role', '') = 'admin'
      or lower(coalesce(auth.jwt() ->> 'email', '')) like '%admin%';
$$;

alter table countries enable row level security;
alter table resources enable row level security;
alter table industries enable row level security;
alter table industry_catalog enable row level security;
alter table trade_offers enable row level security;
alter table game_state enable row level security;
alter table event_log enable row level security;
alter table diplomacy enable row level security;

create policy "countries_read_own_or_admin" on countries
for select to authenticated
using (is_admin() or user_id = auth.uid());

create policy "countries_update_own_or_admin" on countries
for update to authenticated
using (is_admin() or user_id = auth.uid())
with check (is_admin() or user_id = auth.uid());

create policy "countries_insert_admin" on countries
for insert to authenticated
with check (is_admin());

create policy "resources_read_country_or_admin" on resources
for select to authenticated
using (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = resources.country_id and c.user_id = auth.uid()
  )
);

create policy "resources_write_country_or_admin" on resources
for all to authenticated
using (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = resources.country_id and c.user_id = auth.uid()
  )
)
with check (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = resources.country_id and c.user_id = auth.uid()
  )
);

create policy "industries_read_country_or_admin" on industries
for select to authenticated
using (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = industries.country_id and c.user_id = auth.uid()
  )
);

create policy "industries_write_country_or_admin" on industries
for all to authenticated
using (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = industries.country_id and c.user_id = auth.uid()
  )
)
with check (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = industries.country_id and c.user_id = auth.uid()
  )
);

create policy "industry_catalog_public_read" on industry_catalog
for select to anon, authenticated
using (true);

create policy "industry_catalog_admin_write" on industry_catalog
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "trade_read_participants_or_admin" on trade_offers
for select to authenticated
using (
  is_admin()
  or exists (
    select 1
    from countries c
    where c.user_id = auth.uid()
      and c.id in (trade_offers.from_country_id, trade_offers.to_country_id)
  )
);

create policy "trade_create_from_own_country_or_admin" on trade_offers
for insert to authenticated
with check (
  is_admin()
  or exists (
    select 1 from countries c
    where c.id = trade_offers.from_country_id and c.user_id = auth.uid()
  )
);

create policy "trade_update_participants_or_admin" on trade_offers
for update to authenticated
using (
  is_admin()
  or exists (
    select 1
    from countries c
    where c.user_id = auth.uid()
      and c.id in (trade_offers.from_country_id, trade_offers.to_country_id)
  )
)
with check (
  is_admin()
  or exists (
    select 1
    from countries c
    where c.user_id = auth.uid()
      and c.id in (trade_offers.from_country_id, trade_offers.to_country_id)
  )
);

create policy "game_state_public_read" on game_state
for select to anon, authenticated
using (true);

create policy "game_state_admin_write" on game_state
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "event_log_public_read" on event_log
for select to anon, authenticated
using (true);

create policy "event_log_admin_write" on event_log
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "diplomacy_public_read" on diplomacy
for select to anon, authenticated
using (true);

create policy "diplomacy_admin_write" on diplomacy
for all to authenticated
using (is_admin())
with check (is_admin());

alter publication supabase_realtime add table game_state;
alter publication supabase_realtime add table trade_offers;
alter publication supabase_realtime add table event_log;

create or replace function execute_trade(trade_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  trade_row trade_offers;
  from_country countries;
  to_country countries;
  offered_resource text;
  offered_qty int;
  offered_gc int;
  requested_resource text;
  requested_qty int;
  requested_gc int;
begin
  select * into trade_row
  from trade_offers
  where id = trade_id
  for update;

  if trade_row.id is null then
    raise exception 'Trade offer not found';
  end if;

  if trade_row.status <> 'pending' then
    raise exception 'Trade offer is not pending';
  end if;

  select * into from_country from countries where id = trade_row.from_country_id for update;
  select * into to_country from countries where id = trade_row.to_country_id for update;

  offered_resource := nullif(trade_row.offering_json ->> 'resource', '');
  offered_qty := coalesce((trade_row.offering_json ->> 'qty')::int, 0);
  offered_gc := coalesce((trade_row.offering_json ->> 'gc')::int, 0);

  requested_resource := nullif(trade_row.requesting_json ->> 'resource', '');
  requested_qty := coalesce((trade_row.requesting_json ->> 'qty')::int, 0);
  requested_gc := coalesce((trade_row.requesting_json ->> 'gc')::int, 0);

  if offered_gc > 0 and from_country.gc_balance < offered_gc then
    raise exception 'Offering country has insufficient GC';
  end if;

  if requested_gc > 0 and to_country.gc_balance < requested_gc then
    raise exception 'Receiving country has insufficient GC';
  end if;

  if offered_resource is not null and offered_qty > 0 then
    if not exists (
      select 1 from resources
      where country_id = from_country.id and resource_type = offered_resource and quantity >= offered_qty
    ) then
      raise exception 'Offering country has insufficient offered resource';
    end if;
  end if;

  if requested_resource is not null and requested_qty > 0 then
    if not exists (
      select 1 from resources
      where country_id = to_country.id and resource_type = requested_resource and quantity >= requested_qty
    ) then
      raise exception 'Receiving country has insufficient requested resource';
    end if;
  end if;

  if offered_resource is not null and offered_qty > 0 then
    update resources
    set quantity = quantity - offered_qty
    where country_id = from_country.id and resource_type = offered_resource;

    insert into resources (country_id, resource_type, quantity, replenish_per_round)
    values (to_country.id, offered_resource, offered_qty, 0)
    on conflict (country_id, resource_type) do update
    set quantity = resources.quantity + excluded.quantity;
  end if;

  if requested_resource is not null and requested_qty > 0 then
    update resources
    set quantity = quantity - requested_qty
    where country_id = to_country.id and resource_type = requested_resource;

    insert into resources (country_id, resource_type, quantity, replenish_per_round)
    values (from_country.id, requested_resource, requested_qty, 0)
    on conflict (country_id, resource_type) do update
    set quantity = resources.quantity + excluded.quantity;
  end if;

  if offered_gc > 0 then
    update countries set gc_balance = gc_balance - offered_gc where id = from_country.id;
    update countries set gc_balance = gc_balance + offered_gc where id = to_country.id;
  end if;

  if requested_gc > 0 then
    update countries set gc_balance = gc_balance - requested_gc where id = to_country.id;
    update countries set gc_balance = gc_balance + requested_gc where id = from_country.id;
  end if;

  update trade_offers
  set status = 'accepted', responded_at = now()
  where id = trade_row.id;

  insert into event_log (round_number, event_type, description, affected_countries)
  values (
    trade_row.round_number,
    'trade_executed',
    'Trade accepted between countries',
    array[from_country.name, to_country.name]
  );

  return jsonb_build_object('ok', true, 'trade_id', trade_row.id, 'status', 'accepted');
end;
$$;

grant execute on function execute_trade(uuid) to authenticated;

create or replace function process_round_income(round_number int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_resources int;
  updated_countries int;
begin
  update resources
  set quantity = quantity + replenish_per_round
  where replenish_per_round > 0;

  get diagnostics updated_resources = row_count;

  update industries i
  set is_active = true
  from industry_catalog ic
  where i.industry_name = ic.name
    and i.is_active = false
    and i.built_at_round + ic.build_rounds <= round_number;

  update countries c
  set gc_balance = c.gc_balance + coalesce(income.sum_income, 0),
      round_income = coalesce(income.sum_income, 0)
  from (
    select country_id, sum(income_per_round)::int as sum_income
    from industries
    where is_active = true
    group by country_id
  ) income
  where c.id = income.country_id;

  update countries
  set round_income = 0
  where id not in (select distinct country_id from industries where is_active = true);

  update countries
  set population = greatest(0, population - greatest(1, food_req - food_produced))
  where food_produced < food_req;

  get diagnostics updated_countries = row_count;

  insert into event_log (round_number, event_type, description, affected_countries)
  values (
    round_number,
    'income_processed',
    'Round income and upkeep processed',
    '{}'
  );

  return jsonb_build_object(
    'ok', true,
    'round', round_number,
    'resources_updated', updated_resources,
    'countries_food_adjusted', updated_countries
  );
end;
$$;

grant execute on function process_round_income(int) to authenticated;

insert into industry_catalog (name, tier, category, recipe_json, gc_cost, build_rounds, income_per_round, max_builds, prerequisites, special_effect, who_can_build)
values
('Farm', 1, 'Agriculture', '{"Manpower":2,"Energy":1,"Minerals":1}', 10, 1, 4, 4, 'None', 'Boosts food production', 'all'),
('Water Treatment', 1, 'Utilities', '{"Energy":2,"Technology":1,"Manpower":1}', 12, 1, 3, 2, 'None', 'Improves public health', 'all'),
('Basic Mine', 1, 'Extraction', '{"Manpower":2,"Energy":2,"Technology":1}', 15, 1, 5, 4, 'None', 'Adds steady minerals', 'all'),
('Oil/Gas Well', 1, 'Energy', '{"Manpower":2,"Minerals":1,"Technology":1}', 16, 1, 6, 3, 'None', 'Adds energy output', 'all'),
('Solar Farm', 1, 'Energy', '{"Technology":2,"Manpower":1,"Finance":1}', 14, 1, 4, 4, 'None', 'Clean energy bonus', 'all'),
('Coal Power Plant', 1, 'Energy', '{"Minerals":3,"Manpower":2,"Finance":1}', 13, 1, 5, 3, 'None', 'High early output', 'all'),
('Fishing Port', 1, 'Agriculture', '{"Manpower":2,"Energy":1,"Manufacturing":1}', 12, 1, 4, 3, 'Coastal access', 'Food via maritime output', 'all'),
('Lumber Mill', 1, 'Manufacturing', '{"Manpower":2,"Energy":1,"Minerals":1}', 11, 1, 4, 3, 'Forest access', 'Supports downstream factories', 'all'),
('Steel Mill', 2, 'Manufacturing', '{"Minerals":4,"Energy":3,"Manpower":2}', 24, 2, 8, 3, 'Basic Mine', 'Boosts heavy industry chain', 'all'),
('Food Processing', 2, 'Agriculture', '{"Food":4,"Energy":2,"Manufacturing":2}', 22, 1, 7, 3, 'Farm', 'Improves food efficiency', 'all'),
('Oil Refinery', 2, 'Energy', '{"Energy":4,"Technology":2,"Finance":2}', 26, 2, 9, 3, 'Oil/Gas Well', 'Converts crude to high-value fuels', 'all'),
('Textile Factory', 2, 'Manufacturing', '{"Manpower":3,"Energy":2,"Finance":2}', 20, 1, 6, 3, 'Lumber Mill', 'Employment and exports', 'all'),
('Port/Harbour', 2, 'Trade', '{"Manufacturing":3,"Energy":2,"Finance":2}', 25, 2, 7, 2, 'Fishing Port', 'Trade throughput bonus', 'all'),
('Hospital Network', 2, 'Social', '{"Technology":3,"Finance":3,"Manpower":2}', 28, 2, 5, 2, 'Water Treatment', 'Reduces food shortage penalties', 'all'),
('University', 2, 'Knowledge', '{"Technology":3,"Finance":2,"Influence":2}', 23, 2, 6, 2, 'None', 'Improves advanced build efficiency', 'all'),
('Gas Pipeline', 2, 'Energy', '{"Energy":4,"Minerals":2,"Manufacturing":2}', 24, 2, 7, 3, 'Oil/Gas Well', 'Distributes regional energy', 'all'),
('Arms Factory', 2, 'Defense', '{"Manufacturing":3,"Minerals":2,"Technology":2}', 27, 2, 8, 2, 'Steel Mill', 'Security and deterrence', 'all'),
('Automobile Factory', 3, 'Manufacturing', '{"Steel Mill":1,"Manufacturing":5,"Energy":3}', 36, 2, 12, 2, 'Steel Mill', 'Major export engine', 'all'),
('Tech Campus', 3, 'Knowledge', '{"Technology":5,"Finance":3,"Influence":2}', 38, 2, 13, 2, 'University', 'Accelerates innovation', 'all'),
('Pharma Plant', 3, 'Health', '{"Technology":4,"Manufacturing":3,"Finance":3}', 34, 2, 11, 2, 'Hospital Network', 'Boosts health resilience', 'all'),
('Nuclear Power Plant', 3, 'Energy', '{"Technology":5,"Minerals":4,"Finance":3}', 42, 3, 16, 1, 'University', 'Massive stable power', 'all'),
('Special Econ Zone', 3, 'Finance', '{"Finance":5,"Influence":3,"Manufacturing":2}', 40, 2, 14, 2, 'Port/Harbour', 'Trade and tax growth', 'all'),
('Shipyard', 3, 'Trade', '{"Manufacturing":4,"Energy":3,"Minerals":3}', 35, 2, 11, 2, 'Port/Harbour', 'Naval and trade leverage', 'all'),
('Media & Culture Hub', 3, 'Influence', '{"Influence":5,"Finance":2,"Technology":2}', 30, 2, 10, 2, 'University', 'Soft-power multiplier', 'all'),
('Financial Exchange', 3, 'Finance', '{"Finance":6,"Technology":2,"Influence":2}', 44, 2, 15, 1, 'Special Econ Zone', 'Capital market acceleration', 'all'),
('AI Research Lab', 4, 'Knowledge', '{"Technology":7,"Finance":4,"Influence":3}', 55, 3, 20, 1, 'Tech Campus', 'Future-tech breakthrough potential', 'all'),
('Space Agency', 4, 'Science', '{"Technology":7,"Finance":5,"Manufacturing":3}', 60, 3, 22, 1, 'AI Research Lab', 'Prestige and innovation boost', 'all'),
('Green Energy Grid', 4, 'Energy', '{"Energy":6,"Technology":4,"Finance":3}', 52, 3, 18, 1, 'Nuclear Power Plant', 'Sustainable national energy bonus', 'all'),
('Biotech Lab', 4, 'Health', '{"Technology":6,"Finance":4,"Manpower":3}', 53, 3, 19, 1, 'Pharma Plant', 'Medical productivity gains', 'all'),
('Sovereign Fund', 4, 'Finance', '{"Finance":8,"Influence":3,"Technology":2}', 58, 3, 21, 1, 'Financial Exchange', 'Compounding economic power', 'all'),
('Megacity Hub', 4, 'Urban', '{"Manufacturing":5,"Finance":4,"Energy":4}', 57, 3, 20, 1, 'Special Econ Zone', 'Urban output multiplier', 'all'),
('Global HQ', 4, 'Influence', '{"Influence":7,"Finance":4,"Technology":3}', 59, 3, 21, 1, 'Media & Culture Hub', 'Global influence amplification', 'all'),
('Trade Canal', 4, 'Special', '{"Manufacturing":5,"Finance":5,"Influence":4}', 62, 3, 24, 1, 'Shipyard', 'Massive trade route control', 'all'),
('Rare Earth Monopoly', 4, 'Special', '{"Minerals":8,"Finance":4,"Influence":3}', 61, 3, 23, 1, 'Basic Mine', 'Strategic mineral dominance', 'all'),
('Remittance Network', 3, 'Special', '{"Influence":4,"Finance":4,"Technology":2}', 37, 2, 12, 2, 'Media & Culture Hub', 'Stable foreign inflow', 'all'),
('Luxury Export Hub', 3, 'Special', '{"Manufacturing":4,"Influence":3,"Finance":3}', 39, 2, 13, 2, 'Textile Factory', 'High-margin export brand', 'all');

insert into countries (name, flag_emoji, tier, population, food_req, food_produced, gc_balance, round_income)
values
('India', '🇮🇳', 1, 140, 14, 12, 100, 0),
('China', '🇨🇳', 1, 140, 14, 12, 100, 0),
('Russia', '🇷🇺', 2, 15, 4, 2, 100, 0),
('America', '🇺🇸', 1, 33, 7, 5, 100, 0),
('Germany', '🇩🇪', 2, 8, 3, 2, 100, 0),
('France', '🇫🇷', 2, 7, 3, 3, 100, 0),
('UAE', '🇦🇪', 3, 1, 3, 3, 100, 0),
('Spain', '🇪🇸', 3, 5, 4, 2, 100, 0),
('Singapore', '🇸🇬', 3, 1, 5, 3, 100, 0),
('Japan', '🇯🇵', 2, 12, 5, 3, 100, 0),
('Australia', '🇦🇺', 2, 3, 3, 2, 100, 0),
('Canada', '🇨🇦', 2, 4, 4, 2, 100, 0),
('South Korea', '🇰🇷', 2, 5, 4, 2, 100, 0),
('South Africa', '🇿🇦', 3, 6, 4, 2, 100, 0),
('New Zealand', '🇳🇿', 3, 1, 2, 1, 100, 0);

insert into resources (country_id, resource_type, quantity, replenish_per_round)
select c.id, r.resource_type, r.quantity, greatest(1, floor(r.quantity / 5.0)::int)
from countries c
join (
  values
    ('India', 'Manpower', 10),
    ('India', 'Food', 6),
    ('China', 'Manpower', 12),
    ('China', 'Minerals', 8),
    ('Russia', 'Energy', 15),
    ('Russia', 'Minerals', 10),
    ('America', 'Finance', 12),
    ('America', 'Technology', 8),
    ('Germany', 'Technology', 10),
    ('Germany', 'Manufacturing', 6),
    ('France', 'Food', 8),
    ('France', 'Energy', 7),
    ('UAE', 'Energy', 12),
    ('UAE', 'Finance', 9),
    ('Spain', 'Food', 7),
    ('Spain', 'Influence', 8),
    ('Singapore', 'Finance', 14),
    ('Singapore', 'Influence', 12),
    ('Japan', 'Technology', 11),
    ('Japan', 'Manufacturing', 9),
    ('Australia', 'Minerals', 12),
    ('Australia', 'Food', 8),
    ('Canada', 'Energy', 10),
    ('Canada', 'Food', 8),
    ('South Korea', 'Technology', 11),
    ('South Korea', 'Manufacturing', 9),
    ('South Africa', 'Minerals', 8),
    ('South Africa', 'Manpower', 8),
    ('New Zealand', 'Food', 9),
    ('New Zealand', 'Energy', 10)
) as r(country_name, resource_type, quantity) on c.name = r.country_name;
