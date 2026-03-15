# Survival of the State

Real-time geopolitical country simulator for college events.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth + Postgres + Realtime

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3. Run Supabase SQL bootstrap:

- Open Supabase SQL editor.
- Run the file at `supabase/init.sql`.
- This file creates schema, RLS policies, realtime table publication, RPC functions, and seed data.

4. Start development server:

```bash
npm run dev
```

## Database Seed Details

The bootstrap SQL includes:

- All required tables: countries, resources, industries, industry_catalog, trade_offers, game_state, event_log, diplomacy
- Realtime enabled tables: game_state, trade_offers, event_log
- RPC functions:
  - `execute_trade(trade_id uuid)`
  - `process_round_income(round_number int)`
- 35 industries in `industry_catalog`
- 15 countries with starter population, food, GC, and initial resources

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run preview
```

## Routes

- `/login`
- `/dashboard`
- `/crafting`
- `/trade`
- `/crafting-guide`
- `/admin`
- `/leaderboard`

## Notes

- Admin detection in UI currently uses email containing `admin`.
- Trade acceptance uses Supabase RPC transaction function `execute_trade`.
- Game round income processing uses `process_round_income`.
