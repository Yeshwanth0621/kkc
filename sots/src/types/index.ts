// ── Database Types ──────────────────────────────────────────────

export type ResourceType =
  | 'Manpower'
  | 'Energy'
  | 'Food'
  | 'Technology'
  | 'Finance'
  | 'Minerals'
  | 'Manufacturing'
  | 'Influence';

export type GamePhase = 'income' | 'diplomacy' | 'action' | 'event' | 'paused';

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export type AllianceType = 'trade_bloc' | 'military_pact' | 'aid' | 'sanction' | 'loan';

export interface Country {
  id: string;
  name: string;
  flag_emoji: string;
  tier: number;
  population: number;
  food_req: number;
  food_produced: number;
  gc_balance: number;
  round_income: number;
  user_id: string | null;
}

export interface Resource {
  id: string;
  country_id: string;
  resource_type: ResourceType;
  quantity: number;
  replenish_per_round: number;
}

export interface Industry {
  id: string;
  country_id: string;
  industry_name: string;
  tier: number;
  category: string;
  built_at_round: number;
  income_per_round: number;
  is_active: boolean;
}

export interface IndustryCatalogItem {
  id: string;
  name: string;
  tier: number;
  category: string;
  recipe_json: Record<string, number>;
  gc_cost: number;
  build_rounds: number;
  income_per_round: number;
  max_builds: number;
  prerequisites: string;
  special_effect: string;
  who_can_build: string;
}

export interface TradeOffer {
  id: string;
  from_country_id: string;
  to_country_id: string;
  round_number: number;
  status: TradeStatus;
  offering_json: TradePayload;
  requesting_json: TradePayload;
  message: string;
  created_at: string;
  responded_at: string | null;
  // Joined fields
  from_country?: Country;
  to_country?: Country;
}

export interface TradePayload {
  resource?: ResourceType;
  qty?: number;
  gc?: number;
}

export interface GameState {
  id: string;
  current_round: number;
  phase: GamePhase;
  is_active: boolean;
  started_at: string;
}

export interface EventLog {
  id: string;
  round_number: number;
  event_type: string;
  description: string;
  affected_countries: string[];
  created_at: string;
}

export type MarketPostStatus = 'open' | 'fulfilled' | 'cancelled';

export interface MarketPost {
  id: string;
  from_country_id: string;
  round_number: number;
  status: MarketPostStatus;
  offering_json: TradePayload;
  requesting_json: TradePayload;
  message: string;
  fulfilled_by: string | null;
  created_at: string;
  fulfilled_at: string | null;
  // Joined fields
  from_country?: Country;
  fulfilled_country?: Country;
}

export interface Diplomacy {
  id: string;
  country_a_id: string;
  country_b_id: string;
  alliance_type: AllianceType;
  created_round: number;
  expires_round: number | null;
  is_active: boolean;
}

// ── UI / Component Types ────────────────────────────────────────

export interface ScorePillars {
  economic_strength: number;
  sustainability: number;
  diplomacy: number;
  social_wellbeing: number;
  resilience: number;
  total: number;
}

export interface LeaderboardEntry {
  country: Country;
  scores: ScorePillars;
}

export interface EventCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  effect: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
