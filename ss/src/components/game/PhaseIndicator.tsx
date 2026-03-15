import type { GamePhase } from '../../types'

interface PhaseIndicatorProps {
  phase: GamePhase
}

export const PhaseIndicator = ({ phase }: PhaseIndicatorProps) => (
  <div className="inline-flex items-center gap-2 rounded-md border border-accent-lime/40 bg-accent-lime/10 px-3 py-1 font-data text-xs uppercase tracking-[0.2em] text-accent-lime">
    <span className="h-2 w-2 animate-pulse rounded-full bg-accent-lime" />
    {phase}
  </div>
)
