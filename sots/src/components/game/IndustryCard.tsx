import { TierBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { RecipeIngredient } from './ResourceCard';
import { formatGC } from '../../lib/constants';
import type { IndustryCatalogItem } from '../../types';
import type { BuildValidation } from '../../lib/gameLogic';

interface IndustryCardProps {
  item: IndustryCatalogItem;
  validation?: BuildValidation;
  onBuild?: () => void;
  showBuildButton?: boolean;
  loading?: boolean;
}

export function IndustryCard({ item, validation, onBuild, showBuildButton = false, loading = false }: IndustryCardProps) {
  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-sm text-primary tracking-widest">{item.name}</h3>
          <span className="text-[10px] font-mono text-muted tracking-wider">{item.category}</span>
        </div>
        <TierBadge tier={item.tier} />
      </div>

      {/* Recipe */}
      <div>
        <span className="text-[9px] font-mono text-muted uppercase tracking-[3px]">Recipe</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {Object.entries(item.recipe_json).map(([type, qty]) => (
            <RecipeIngredient
              key={type}
              type={type}
              qty={qty as number}
              has={validation?.ingredientStatus[type]?.has}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-base/60 rounded-xl p-3 border border-[rgba(0,240,255,0.06)]">
          <div className="text-[9px] font-mono text-muted uppercase tracking-[2px] mb-1">Cost</div>
          <div className="text-sm font-mono text-white font-bold">{formatGC(item.gc_cost)} GC</div>
        </div>
        <div className="bg-base/60 rounded-xl p-3 border border-[rgba(0,240,255,0.06)]">
          <div className="text-[9px] font-mono text-muted uppercase tracking-[2px] mb-1">Build</div>
          <div className="text-sm font-mono text-neon-cyan font-bold" style={{ textShadow: '0 0 8px rgba(0,240,255,0.4)' }}>
            {item.build_rounds} rd
          </div>
        </div>
        <div className="bg-base/60 rounded-xl p-3 border border-[rgba(0,240,255,0.06)]">
          <div className="text-[9px] font-mono text-muted uppercase tracking-[2px] mb-1">Income</div>
          <div className="text-sm font-mono text-neon-lime font-bold" style={{ textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
            +{item.income_per_round}/rd
          </div>
        </div>
      </div>

      {/* Max Builds */}
      {item.max_builds > 0 && (
        <div className="text-[10px] font-mono text-muted">
          Max builds: <span className="text-primary">{item.max_builds}</span>
        </div>
      )}

      {/* Prerequisites */}
      {item.prerequisites && item.prerequisites !== 'None' && (
        <div className="text-[10px] font-mono text-muted">
          Requires: <span className="text-neon-cyan">{item.prerequisites}</span>
        </div>
      )}

      {/* Special Effect */}
      {item.special_effect && item.special_effect !== 'None' && (
        <div className="text-[10px] font-mono text-neon-gold/80 bg-[rgba(255,215,0,0.04)] border border-[rgba(255,215,0,0.15)] rounded-lg px-3 py-1.5">
          ★ {item.special_effect}
        </div>
      )}

      {/* Who can build */}
      {item.who_can_build && item.who_can_build !== 'All' && (
        <div className="text-[10px] font-mono text-muted">
          Available to: <span className="text-primary">{item.who_can_build}</span>
        </div>
      )}

      {/* Build Button */}
      {showBuildButton && (
        <div className="pt-1">
          <Button
            variant={validation?.canBuild ? 'primary' : 'secondary'}
            size="sm"
            className="w-full"
            disabled={!validation?.canBuild}
            loading={loading}
            onClick={onBuild}
            title={validation?.reasons.join('\n') || 'Build this industry'}
          >
            {validation?.canBuild ? '⚡ BUILD' : 'CANNOT BUILD'}
          </Button>
          {validation && !validation.canBuild && validation.reasons.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {validation.reasons.map((reason, i) => (
                <div key={i} className="text-[10px] font-mono text-neon-red/70">⚠ {reason}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
