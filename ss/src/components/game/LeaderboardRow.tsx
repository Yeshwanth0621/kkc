interface LeaderboardRowProps {
  rank: number
  country: string
  scores: {
    economic: number
    sustainability: number
    diplomacy: number
    social: number
    resilience: number
    total: number
  }
}

export const LeaderboardRow = ({ rank, country, scores }: LeaderboardRowProps) => (
  <tr className="border-b border-border text-sm">
    <td className="p-2 font-data">{rank}</td>
    <td className="p-2 font-heading uppercase">{country}</td>
    <td className="p-2">{scores.economic}</td>
    <td className="p-2">{scores.sustainability}</td>
    <td className="p-2">{scores.diplomacy}</td>
    <td className="p-2">{scores.social}</td>
    <td className="p-2">{scores.resilience}</td>
    <td className="p-2 font-semibold text-accent-lime">{scores.total}</td>
  </tr>
)
