import { RESOURCE_CONFIG } from '../../lib/constants';
import type { Resource } from '../../types';

interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
}

export function ResourceCard({ resource, compact = false }: ResourceCardProps) {
  const config = RESOURCE_CONFIG[resource.resource_type];
  if (!config) return null;

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono"
        style={{
          borderColor: `${config.color}30`,
          backgroundColor: `${config.color}08`,
          boxShadow: `0 0 8px ${config.color}10`,
        }}
      >
        <span>{config.emoji}</span>
        <span style={{ color: config.color, textShadow: `0 0 6px ${config.color}40` }}>
          {resource.quantity}
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-card/70 border border-[rgba(0,240,255,0.06)] rounded-2xl p-4 hover:border-[rgba(0,240,255,0.15)] transition-all duration-500 group hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]">
      {/* Top accent line with resource color */}
      <div
        className="absolute top-0 left-[15%] right-[15%] h-px transition-all duration-500 group-hover:left-[5%] group-hover:right-[5%]"
        style={{ background: `linear-gradient(90deg, transparent, ${config.color}60, transparent)` }}
      />

      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `${config.color}12`,
            border: `1px solid ${config.color}25`,
            boxShadow: `0 0 12px ${config.color}15`,
          }}
        >
          {config.emoji}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted">
          {config.label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span
          className="text-2xl font-heading text-primary tracking-wider"
          style={{ textShadow: `0 0 15px ${config.color}30` }}
        >
          {resource.quantity}
        </span>
        <span className="text-[10px] font-mono text-muted">
          +{resource.replenish_per_round}/rd
        </span>
      </div>
    </div>
  );
}

// Ingredient display for recipes
export function RecipeIngredient({ type, qty, has }: { type: string; qty: number; has?: number }) {
  const config = RESOURCE_CONFIG[type as keyof typeof RESOURCE_CONFIG];
  if (!config) return null;

  const sufficient = has !== undefined ? has >= qty : undefined;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono"
      style={{
        borderColor: sufficient === false ? 'rgba(255,45,91,0.3)' : `${config.color}30`,
        backgroundColor: sufficient === false ? 'rgba(255,45,91,0.06)' : `${config.color}08`,
      }}
    >
      <span>{config.emoji}</span>
      <span style={{ color: config.color }}>{qty}</span>
      {sufficient !== undefined && (
        <span className="ml-1">{sufficient ? '✅' : '❌'}</span>
      )}
    </div>
  );
}
