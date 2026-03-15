# 🌍 Survival of the State

A real-time country simulator web app for college events. Teams play as countries,
managing resources, building industries, and trading over 20 rounds.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Realtime)
- **Fonts**: Bebas Neue, Space Mono, Rajdhani

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key

### 3. Configure environment
Create a `.env` file in the root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up database
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/migration.sql` — creates all tables, RLS policies, and enables Realtime
3. Run `supabase/seed.sql` — populates 15 countries, resources, and 35 industries

### 5. Create user accounts
In Supabase Dashboard → Authentication → Users, create accounts:
- **Admin**: `admin@game.com` (password of your choice)
- **Teams**: One account per country (e.g., `india@game.com`, `china@game.com`, etc.)

Then update the `countries` table to link `user_id` to each team's auth user.

### 6. Run locally
```bash
npm run dev
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Email + password login |
| `/dashboard` | Player | Main game dashboard with 4 tabs |
| `/admin` | Admin only | Game Master control panel |
| `/crafting-guide` | Public | Industry catalog reference |
| `/leaderboard` | Public | Live scoring display |

## Game Phases

Each round cycles through: **Income → Diplomacy → Action → Event**

- **Income**: Resources replenish, industry income distributed
- **Diplomacy**: Teams can send/accept/reject trade offers
- **Action**: Teams can build industries
- **Event**: Admin can trigger event cards

## Project Structure

```
src/
├── components/
│   ├── ui/         — Button, Card, Badge, Modal, Toast, Tabs, Skeleton
│   ├── game/       — ResourceCard, IndustryCard, TradeOfferCard, etc.
│   └── layout/     — Navbar, BottomNav, AdminSidebar
├── pages/          — Login, Dashboard, Crafting, Trade, Admin, etc.
├── hooks/          — useAuth, useGameState, useTrades, useCountry, useResources
├── lib/            — supabase client, gameLogic, constants
└── types/          — TypeScript interfaces
```

## Admin Controls

The admin (Game Master) can:
- Start/pause the game and advance phases
- View and edit all country data
- Monitor all trades and void if needed
- Trigger event cards affecting selected countries
- View the leaderboard with auto-calculated scores

## Scoring Pillars

| Pillar | Based on |
|--------|----------|
| Economic Strength | GC balance + industry income + Finance |
| Sustainability | Food balance + Energy production |
| Diplomacy | Completed trades + Influence resource |
| Social Wellbeing | Population + food security + Healthcare |
| Resilience | Resource diversity + Technology + industry count |
