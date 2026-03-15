export type ResourceType =
  | 'Manpower'
  | 'Energy'
  | 'Food'
  | 'Technology'
  | 'Finance'
  | 'Minerals'
  | 'Manufacturing'
  | 'Influence'

export type GamePhase = 'income' | 'diplomacy' | 'action' | 'event' | 'paused'

export type TradeStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'countered'
  | 'cancelled'
  | 'voided'

export interface Country {
  id: string
  name: string
  flag_emoji: string
  tier: number
  population: number
  food_req: number
  food_produced: number
  gc_balance: number
  round_income: number
  user_id: string | null
}

export interface Resource {
  id: string
  country_id: string
  resource_type: ResourceType
  quantity: number
  replenish_per_round: number
}

export interface Industry {
  id: string
  country_id: string
  industry_name: string
  tier: number
  category: string
  built_at_round: number
  income_per_round: number
  is_active: boolean
}

export interface IndustryCatalogItem {
  id: string
  name: string
  tier: number
  category: string
  recipe_json: Partial<Record<ResourceType, number>>
  gc_cost: number
  build_rounds: number
  income_per_round: number
  max_builds: number
  prerequisites: string | null
  special_effect: string | null
  who_can_build: string
}

export interface TradeSide {
  resource?: ResourceType
  qty?: number
  gc?: number
}

export interface TradeOffer {
  id: string
  from_country_id: string
  to_country_id: string
  round_number: number
  status: TradeStatus
  offering_json: TradeSide
  requesting_json: TradeSide
  message: string | null
  created_at: string
  responded_at: string | null
}

export interface GameState {
  id: string
  current_round: number
  phase: GamePhase
  is_active: boolean
  started_at: string | null
}

export interface EventLog {
  id: string
  round_number: number
  event_type: string
  description: string
  affected_countries: string[]
  created_at: string
}

export interface Diplomacy {
  id: string
  country_a_id: string
  country_b_id: string
  alliance_type: 'trade_bloc' | 'military_pact' | 'aid' | 'sanction' | 'loan'
  created_round: number
  expires_round: number | null
  is_active: boolean
}
