import { PhaseIndicator } from '../game/PhaseIndicator';
import { formatGC } from '../../lib/constants';
import type { Country, GameState } from '../../types';

interface NavbarProps {
  country: Country | null;
  gameState: GameState | null;
  onSignOut: () => void;
  isAdmin?: boolean;
}

export function Navbar({ country, gameState, onSignOut, isAdmin = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface/70 backdrop-blur-2xl border-b border-[rgba(0,240,255,0.06)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      {/* Top neon line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.4)] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Country info or Admin label */}
        <div className="flex items-center gap-3 min-w-0">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎛️</span>
              <h1 className="font-heading text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta tracking-widest">
                GAME MASTER
              </h1>
            </div>
          ) : country ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card border border-[rgba(0,240,255,0.1)] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                {country.flag_emoji}
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-sm text-primary tracking-widest truncate">
                  {country.name}
                </h1>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="neon-text-gold">💰 {formatGC(country.gc_balance)} GC</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Center: Phase indicator */}
        <div className="hidden sm:block">
          {gameState && (
            <PhaseIndicator phase={gameState.phase} round={gameState.current_round} />
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile phase & round */}
          <div className="sm:hidden">
            {gameState && (
              <PhaseIndicator phase={gameState.phase} round={gameState.current_round} />
            )}
          </div>
          <button
            onClick={onSignOut}
            className="text-muted hover:text-neon-cyan text-[10px] font-mono uppercase tracking-[3px] transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] px-3 py-1.5 rounded-lg border border-transparent hover:border-[rgba(0,240,255,0.15)] hover:bg-[rgba(0,240,255,0.05)]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
