import type { Resource, IndustryCatalogItem, Industry, Country, TradeOffer, LeaderboardEntry } from '../types';

// ── Build Validation ────────────────────────────────────────────

export interface BuildValidation {
  canBuild: boolean;
  reasons: string[];
  ingredientStatus: Record<string, { has: number; needs: number; ok: boolean }>;
}

export function validateBuild(
  item: IndustryCatalogItem,
  resources: Resource[],
  country: Country,
  industries: Industry[],
  currentPhase: string
): BuildValidation {
  const reasons: string[] = [];
  const ingredientStatus: Record<string, { has: number; needs: number; ok: boolean }> = {};

  // Phase check
  if (currentPhase !== 'action') {
    reasons.push('Can only build during Action phase');
  }

  // GC check
  if (country.gc_balance < item.gc_cost) {
    reasons.push(`Need ${item.gc_cost} GC (have ${country.gc_balance})`);
  }

  // Resource recipe check
  for (const [resType, needed] of Object.entries(item.recipe_json)) {
    const res = resources.find(r => r.resource_type === resType);
    const has = res?.quantity ?? 0;
    const ok = has >= needed;
    ingredientStatus[resType] = { has, needs: needed, ok };
    if (!ok) {
      reasons.push(`Need ${needed} ${resType} (have ${has})`);
    }
  }

  // Max builds check
  if (item.max_builds > 0) {
    const builtCount = industries.filter(i => i.industry_name === item.name).length;
    if (builtCount >= item.max_builds) {
      reasons.push(`Maximum ${item.max_builds} already built`);
    }
  }

  // Prerequisites check
  if (item.prerequisites && item.prerequisites.trim() !== '' && item.prerequisites !== 'None') {
    const prereqs = item.prerequisites.split(',').map(p => p.trim());
    for (const prereq of prereqs) {
      const hasPrereq = industries.some(i => i.industry_name === prereq && i.is_active);
      if (!hasPrereq) {
        reasons.push(`Requires: ${prereq}`);
      }
    }
  }

  // who_can_build check
  if (item.who_can_build && item.who_can_build.trim() !== '' && item.who_can_build !== 'All') {
    const allowed = item.who_can_build.split(',').map(c => c.trim().toLowerCase());
    if (!allowed.includes(country.name.toLowerCase())) {
      reasons.push(`Only available to: ${item.who_can_build}`);
    }
  }

  return {
    canBuild: reasons.length === 0,
    reasons,
    ingredientStatus,
  };
}

// ── Trade Validation ────────────────────────────────────────────

export function validateTrade(
  offer: Pick<TradeOffer, 'offering_json' | 'requesting_json'>,
  resources: Resource[],
  country: Country
): { valid: boolean; reason: string } {
  const { offering_json } = offer;

  // Check GC
  if (offering_json.gc && offering_json.gc > country.gc_balance) {
    return { valid: false, reason: `Insufficient GC (have ${country.gc_balance}, offering ${offering_json.gc})` };
  }

  // Check resource
  if (offering_json.resource && offering_json.qty) {
    const res = resources.find(r => r.resource_type === offering_json.resource);
    if (!res || res.quantity < offering_json.qty) {
      return {
        valid: false,
        reason: `Insufficient ${offering_json.resource} (have ${res?.quantity ?? 0}, offering ${offering_json.qty})`
      };
    }
  }

  // Must offer something
  if (!offering_json.gc && !offering_json.qty) {
    return { valid: false, reason: 'Must offer something' };
  }

  return { valid: true, reason: '' };
}

// ── Leaderboard Scoring ─────────────────────────────────────────

export function calculateScores(
  country: Country,
  resources: Resource[],
  industries: Industry[],
  allTrades: TradeOffer[],
): LeaderboardEntry {
  const getResQty = (type: string) =>
    resources.find(r => r.resource_type === type)?.quantity ?? 0;

  const activeIndustries = industries.filter(i => i.is_active);
  const totalIncome = activeIndustries.reduce((sum, i) => sum + i.income_per_round, 0);

  // Economic Strength: GC + total industry income + Finance resource
  const economic_strength = Math.round(
    (country.gc_balance * 0.3) + (totalIncome * 5) + (getResQty('Finance') * 2)
  );

  // Sustainability: Food balance + Energy + green industries
  const foodBalance = country.food_produced - country.food_req;
  const sustainability = Math.round(
    (foodBalance * 10) + (getResQty('Energy') * 3) + (getResQty('Food') * 2)
  );

  // Diplomacy: Completed trades + Influence resource
  const completedTrades = allTrades.filter(
    t => (t.from_country_id === country.id || t.to_country_id === country.id) && t.status === 'accepted'
  ).length;
  const diplomacy = Math.round(
    (completedTrades * 5) + (getResQty('Influence') * 3)
  );

  // Social Wellbeing: Population + Food security + Healthcare industries
  const social_wellbeing = Math.round(
    (country.population * 0.5) +
    (country.food_produced >= country.food_req ? 20 : -10) +
    (getResQty('Manpower') * 2)
  );

  // Resilience: Resource diversity + Technology + industry count
  const resourceDiversity = resources.filter(r => r.quantity > 0).length;
  const resilience = Math.round(
    (resourceDiversity * 5) + (getResQty('Technology') * 3) + (activeIndustries.length * 3)
  );

  const total = economic_strength + sustainability + diplomacy + social_wellbeing + resilience;

  return {
    country,
    scores: { economic_strength, sustainability, diplomacy, social_wellbeing, resilience, total },
  };
}
