import type { ResourceType, EventCard } from '../types';

// ── Resource Metadata ───────────────────────────────────────────

export const RESOURCE_CONFIG: Record<ResourceType, { emoji: string; color: string; bg: string; label: string }> = {
  Manpower:      { emoji: '👷', color: '#856404', bg: '#FFF3CD', label: 'Manpower' },
  Energy:        { emoji: '⚡', color: '#BF360C', bg: '#FFE0B2', label: 'Energy' },
  Food:          { emoji: '🌾', color: '#33691E', bg: '#DCEDC8', label: 'Food' },
  Technology:    { emoji: '💻', color: '#0D47A1', bg: '#E3F2FD', label: 'Technology' },
  Finance:       { emoji: '💰', color: '#6A1B9A', bg: '#F3E5F5', label: 'Finance' },
  Minerals:      { emoji: '⛏️', color: '#37474F', bg: '#ECEFF1', label: 'Minerals' },
  Manufacturing: { emoji: '🏭', color: '#880E4F', bg: '#FCE4EC', label: 'Manufacturing' },
  Influence:     { emoji: '🌐', color: '#1B5E20', bg: '#E8F5E9', label: 'Influence' },
};

export const RESOURCE_TYPES: ResourceType[] = [
  'Manpower', 'Energy', 'Food', 'Technology', 'Finance', 'Minerals', 'Manufacturing', 'Influence',
];

// ── Tier Config ─────────────────────────────────────────────────

export const TIER_COLORS: Record<number, { color: string; label: string }> = {
  1: { color: '#22C55E', label: 'Tier 1' },
  2: { color: '#EAB308', label: 'Tier 2' },
  3: { color: '#F97316', label: 'Tier 3' },
  4: { color: '#EF4444', label: 'Tier 4' },
  0: { color: '#A855F7', label: 'Special' },
};

// ── Phase Config ────────────────────────────────────────────────

export const PHASE_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  income:    { label: 'INCOME',    color: '#22C55E', description: 'Resources are being distributed' },
  diplomacy: { label: 'DIPLOMACY', color: '#00FFE0', description: 'Trade offers are open' },
  action:    { label: 'ACTION',    color: '#C8FF00', description: 'Build industries now' },
  event:     { label: 'EVENT',     color: '#FF2D6B', description: 'Event card in play' },
  paused:    { label: 'PAUSED',    color: '#6B7280', description: 'Game is paused' },
};

export const PHASE_ORDER = ['income', 'diplomacy', 'action', 'event'] as const;

// ── Trade Status ────────────────────────────────────────────────

export const TRADE_STATUS_COLORS: Record<string, string> = {
  pending:   '#EAB308',
  accepted:  '#22C55E',
  rejected:  '#EF4444',
  countered: '#00FFE0',
};

// ── Industry Categories ─────────────────────────────────────────

export const INDUSTRY_CATEGORIES = [
  'Agriculture', 'Energy', 'Mining', 'Manufacturing', 'Infrastructure',
  'Services', 'Technology', 'Military', 'Finance', 'Special',
] as const;

// ── Pre-built Event Cards ───────────────────────────────────────

export const EVENT_CARDS: EventCard[] = [
  {
    id: 'pandemic',
    name: 'Global Pandemic',
    icon: '🦠',
    description: 'A deadly virus spreads across borders, devastating populations and economies.',
    effect: 'Affected countries lose 10% population and -3 Food production.',
    severity: 'critical',
  },
  {
    id: 'financial_crisis',
    name: 'Financial Crisis',
    icon: '📉',
    description: 'Markets crash worldwide. Banks fail and credit freezes.',
    effect: 'Affected countries lose 30 GC and -2 Finance resource.',
    severity: 'high',
  },
  {
    id: 'drought',
    name: 'Severe Drought',
    icon: '🏜️',
    description: 'Record temperatures and no rainfall devastate agriculture.',
    effect: 'Affected countries: Food production halved for 2 rounds.',
    severity: 'high',
  },
  {
    id: 'tech_boom',
    name: 'Tech Revolution',
    icon: '🚀',
    description: 'A breakthrough in AI and computing accelerates development.',
    effect: 'Affected countries gain +3 Technology resource.',
    severity: 'low',
  },
  {
    id: 'climate_disaster',
    name: 'Climate Disaster',
    icon: '🌊',
    description: 'Rising sea levels and extreme weather destroy infrastructure.',
    effect: 'Affected countries lose 1 random industry and -2 Energy.',
    severity: 'critical',
  },
  {
    id: 'conflict',
    name: 'Regional Conflict',
    icon: '⚔️',
    description: 'Military tensions escalate into armed confrontation.',
    effect: 'Affected countries lose -5 Manpower and -20 GC.',
    severity: 'high',
  },
  {
    id: 'trade_boom',
    name: 'Global Trade Boom',
    icon: '📈',
    description: 'International trade flourishes, boosting all economies.',
    effect: 'Affected countries gain +20 GC and +2 to all resources.',
    severity: 'low',
  },
];

// ── Utility ─────────────────────────────────────────────────────

export function formatGC(amount: number): string {
  return amount.toLocaleString('en-IN');
}

export const ADMIN_EMAIL = 'admin@game.com';
