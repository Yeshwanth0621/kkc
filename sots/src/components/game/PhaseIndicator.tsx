import { PHASE_CONFIG } from '../../lib/constants';

interface PhaseIndicatorProps {
  phase: string;
  round: number;
}

export function PhaseIndicator({ phase, round }: PhaseIndicatorProps) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.paused;

  return (
    <div className="flex items-center gap-3">
      {/* Round */}
      <div className="bg-card/60 border border-[rgba(0,240,255,0.08)] rounded-xl px-3 py-1.5 flex items-center gap-2">
        <span className="text-[9px] font-mono text-muted uppercase tracking-[2px]">Rnd</span>
        <span
          className="text-lg font-heading text-neon-cyan tracking-wider"
          style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}
        >
          {round}
        </span>
        <span className="text-[10px] font-mono text-muted">/20</span>
      </div>

      {/* Phase */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
        style={{
          borderColor: `${config.color}25`,
          backgroundColor: `${config.color}08`,
          boxShadow: `0 0 15px ${config.color}10`,
        }}
      >
        {/* Animated pulse ring */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-50"
            style={{ backgroundColor: config.color }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}` }}
          />
        </span>
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-[3px]"
          style={{ color: config.color, textShadow: `0 0 8px ${config.color}60` }}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
