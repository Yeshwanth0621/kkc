import type { LeaderboardEntry } from '../../types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

const RANK_EMOJIS = ['🥇', '🥈', '🥉'];
const RANK_GLOW: Record<number, string> = {
  1: '0 0 15px rgba(255, 215, 0, 0.4)',
  2: '0 0 15px rgba(192, 192, 192, 0.3)',
  3: '0 0 15px rgba(205, 127, 50, 0.3)',
};

export function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  const { country, scores } = entry;

  return (
    <tr className={`
      border-b border-[rgba(0,240,255,0.04)] transition-all duration-300
      hover:bg-[rgba(0,240,255,0.03)]
      ${rank <= 3 ? 'font-bold' : ''}
    `}>
      {/* Rank */}
      <td className="px-3 py-3.5">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-heading border"
          style={{
            borderColor: rank <= 3 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 240, 255, 0.08)',
            backgroundColor: rank <= 3 ? 'rgba(255, 215, 0, 0.05)' : 'rgba(0, 240, 255, 0.03)',
            boxShadow: RANK_GLOW[rank] || 'none',
          }}
        >
          {rank <= 3 ? RANK_EMOJIS[rank - 1] : <span className="text-muted">{rank}</span>}
        </span>
      </td>

      {/* Country */}
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{country.flag_emoji}</span>
          <span className="font-heading text-sm tracking-[2px]">{country.name}</span>
        </div>
      </td>

      {/* Score pillars */}
      <td className="px-3 py-3.5 text-center font-mono text-sm text-neon-lime" style={{ textShadow: '0 0 6px rgba(57,255,20,0.3)' }}>
        {scores.economic_strength}
      </td>
      <td className="px-3 py-3.5 text-center font-mono text-sm text-neon-cyan" style={{ textShadow: '0 0 6px rgba(0,240,255,0.3)' }}>
        {scores.sustainability}
      </td>
      <td className="px-3 py-3.5 text-center font-mono text-sm text-neon-gold" style={{ textShadow: '0 0 6px rgba(255,215,0,0.3)' }}>
        {scores.diplomacy}
      </td>
      <td className="px-3 py-3.5 text-center font-mono text-sm text-neon-red" style={{ textShadow: '0 0 6px rgba(255,45,91,0.3)' }}>
        {scores.social_wellbeing}
      </td>
      <td className="px-3 py-3.5 text-center font-mono text-sm text-primary">
        {scores.resilience}
      </td>

      {/* Total */}
      <td className="px-3 py-3.5 text-center">
        <span
          className="font-heading text-xl text-neon-cyan tracking-wider"
          style={{ textShadow: '0 0 12px rgba(0, 240, 255, 0.5)' }}
        >
          {scores.total}
        </span>
      </td>
    </tr>
  );
}
