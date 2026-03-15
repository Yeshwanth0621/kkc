import { useState, useEffect } from 'react';
import type { EventLog } from '../../types';

interface EventOverlayProps {
  event: EventLog | null;
  onDismiss: () => void;
}

const EVENT_ICONS: Record<string, string> = {
  pandemic: '🦠',
  financial_crisis: '📉',
  drought: '🏜️',
  tech_boom: '🚀',
  climate_disaster: '🌊',
  conflict: '⚔️',
  trade_boom: '📈',
  custom: '📋',
};

const EVENT_COLORS: Record<string, string> = {
  pandemic: '#ff2d5b',
  financial_crisis: '#ff6b35',
  drought: '#ffd700',
  tech_boom: '#39ff14',
  climate_disaster: '#ff2d5b',
  conflict: '#ff006e',
  trade_boom: '#39ff14',
  custom: '#00f0ff',
};

export function EventOverlay({ event, onDismiss }: EventOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [event, onDismiss]);

  if (!event) return null;

  const icon = EVENT_ICONS[event.event_type] || EVENT_ICONS.custom;
  const color = EVENT_COLORS[event.event_type] || EVENT_COLORS.custom;

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-opacity duration-500
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onDismiss}
    >
      {/* Backdrop with radial neon glow */}
      <div
        className="absolute inset-0 backdrop-blur-lg"
        style={{
          background: `radial-gradient(ellipse at center, ${color}08 0%, rgba(5,5,16,0.95) 60%)`,
        }}
      />

      {/* Event card */}
      <div className="relative event-entrance max-w-md w-full text-center">
        {/* Massive glow orb behind card */}
        <div
          className="absolute inset-0 rounded-2xl blur-[80px] opacity-20"
          style={{ backgroundColor: color }}
        />

        <div
          className="relative overflow-hidden bg-surface/90 border-2 rounded-2xl p-8 space-y-5 backdrop-blur-xl"
          style={{
            borderColor: `${color}40`,
            boxShadow: `0 0 40px ${color}20, 0 0 80px ${color}10, inset 0 0 30px ${color}05`,
          }}
        >
          {/* Scan-lines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 6px)',
          }} />

          {/* Top neon line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          />

          <div className="relative z-10 space-y-4">
            {/* Icon */}
            <div className="text-6xl mb-2" style={{ filter: `drop-shadow(0 0 20px ${color}60)` }}>
              {icon}
            </div>

            {/* Badge */}
            <div
              className="inline-block px-4 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-[4px]"
              style={{
                color,
                backgroundColor: `${color}10`,
                border: `1px solid ${color}30`,
                textShadow: `0 0 10px ${color}60`,
              }}
            >
              ⚡ EVENT — ROUND {event.round_number}
            </div>

            {/* Title */}
            <h2
              className="text-3xl font-heading tracking-[4px]"
              style={{ color, textShadow: `0 0 20px ${color}60, 0 0 40px ${color}30` }}
            >
              {event.event_type.replace(/_/g, ' ').toUpperCase()}
            </h2>

            {/* Description */}
            <p className="text-sm font-body text-primary/80 leading-relaxed">
              {event.description}
            </p>

            {/* Affected countries */}
            {event.affected_countries && event.affected_countries.length > 0 && (
              <div className="text-[10px] font-mono text-muted pt-2">
                Affected: {event.affected_countries.join(', ')}
              </div>
            )}

            {/* Dismiss hint */}
            <div className="text-[9px] font-mono text-muted/40 pt-4 tracking-widest uppercase">
              Click anywhere to dismiss • Auto-closes in 5s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
