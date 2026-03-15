import type { ResourceType, TradeStatus } from '../types'

export const RESOURCE_COLORS: Record<ResourceType, { color: string; bg: string; emoji: string }> = {
  Manpower: { color: '#856404', bg: '#FFF3CD', emoji: '🧑‍🏭' },
  Energy: { color: '#BF360C', bg: '#FFE0B2', emoji: '⚡' },
  Food: { color: '#33691E', bg: '#DCEDC8', emoji: '🌾' },
  Technology: { color: '#0D47A1', bg: '#E3F2FD', emoji: '🧠' },
  Finance: { color: '#6A1B9A', bg: '#F3E5F5', emoji: '💰' },
  Minerals: { color: '#37474F', bg: '#ECEFF1', emoji: '⛏️' },
  Manufacturing: { color: '#880E4F', bg: '#FCE4EC', emoji: '🏭' },
  Influence: { color: '#1B5E20', bg: '#E8F5E9', emoji: '🛰️' },
}

export const TIER_COLORS: Record<number, string> = {
  1: 'bg-green-500/20 text-green-300 border-green-400/50',
  2: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
  3: 'bg-orange-500/20 text-orange-300 border-orange-400/50',
  4: 'bg-red-500/20 text-red-300 border-red-400/50',
}

export const TRADE_STATUS_COLORS: Record<TradeStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  accepted: 'bg-green-500/20 text-green-300 border-green-400/40',
  rejected: 'bg-red-500/20 text-red-300 border-red-400/40',
  countered: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  cancelled: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/40',
  voided: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
}

export const PHASE_ORDER = ['income', 'diplomacy', 'action', 'event', 'paused'] as const
