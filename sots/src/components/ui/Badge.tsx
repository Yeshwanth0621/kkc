import React from 'react';
import { TIER_COLORS, TRADE_STATUS_COLORS } from '../../lib/constants';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-[10px] font-mono font-bold uppercase tracking-widest
        rounded-lg border
        ${className}
      `}
      style={{
        color: color || '#e8e6f0',
        borderColor: color ? `${color}30` : 'rgba(0, 240, 255, 0.15)',
        backgroundColor: color ? `${color}10` : 'rgba(0, 240, 255, 0.05)',
        textShadow: color ? `0 0 8px ${color}60` : 'none',
      }}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: number }) {
  const config = TIER_COLORS[tier] || TIER_COLORS[1];
  return (
    <Badge color={config.color}>
      {tier === 0 ? '★ SPECIAL' : config.label.toUpperCase()}
    </Badge>
  );
}

export function TradeStatusBadge({ status }: { status: string }) {
  const color = TRADE_STATUS_COLORS[status] || '#6b6b8a';
  return <Badge color={color}>{status}</Badge>;
}

export function PhaseBadge({ phase, active = true }: { phase: string; active?: boolean }) {
  const phaseColors: Record<string, string> = {
    income: '#39ff14',
    diplomacy: '#00f0ff',
    action: '#ffd700',
    event: '#ff006e',
    paused: '#6b6b8a',
  };
  const color = phaseColors[phase] || '#6b6b8a';
  return (
    <div className="inline-flex items-center gap-2">
      {active && (
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
        </span>
      )}
      <Badge color={color}>{phase}</Badge>
    </div>
  );
}
