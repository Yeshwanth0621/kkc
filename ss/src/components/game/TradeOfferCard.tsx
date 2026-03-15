import { summarizeTradeSide } from '../../lib/gameLogic'
import { TRADE_STATUS_COLORS } from '../../lib/constants'
import type { TradeOffer } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface TradeOfferCardProps {
  trade: TradeOffer
  senderLabel: string
  onAccept?: () => void
  onReject?: () => void
  onCounter?: () => void
  onCancel?: () => void
}

export const TradeOfferCard = ({ trade, senderLabel, onAccept, onReject, onCounter, onCancel }: TradeOfferCardProps) => (
  <Card className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="font-data text-xs uppercase tracking-[0.2em] text-text-muted">{senderLabel}</p>
      <Badge className={TRADE_STATUS_COLORS[trade.status]}>{trade.status}</Badge>
    </div>
    <div className="grid gap-2 text-sm">
      <p>
        <span className="text-text-muted">They offer:</span> {summarizeTradeSide(trade.offering_json)}
      </p>
      <p>
        <span className="text-text-muted">They want:</span> {summarizeTradeSide(trade.requesting_json)}
      </p>
      <p className="text-xs text-text-muted">{trade.message ?? 'No message'}</p>
    </div>
    <p className="font-data text-[11px] text-text-muted">{new Date(trade.created_at).toLocaleTimeString()}</p>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {onAccept && (
        <Button className="w-full" onClick={onAccept}>
          Accept
        </Button>
      )}
      {onReject && (
        <Button className="w-full" variant="danger" onClick={onReject}>
          Reject
        </Button>
      )}
      {onCounter && (
        <Button className="w-full" variant="secondary" onClick={onCounter}>
          Counter
        </Button>
      )}
      {onCancel && (
        <Button className="w-full" variant="danger" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  </Card>
)
