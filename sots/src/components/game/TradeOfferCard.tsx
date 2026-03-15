import { Card } from '../ui/Card';
import { TradeStatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RESOURCE_CONFIG, formatGC } from '../../lib/constants';
import type { TradeOffer, TradePayload } from '../../types';

function PayloadDisplay({ payload, label }: { payload: TradePayload; label: string }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[9px] font-mono text-muted uppercase tracking-[3px]">{label}</span>
      <div className="space-y-1">
        {payload.resource && payload.qty && (
          <div className="flex items-center gap-2 text-sm font-mono">
            <span>{RESOURCE_CONFIG[payload.resource]?.emoji}</span>
            <span className="text-primary">{payload.qty} {payload.resource}</span>
          </div>
        )}
        {payload.gc && payload.gc > 0 && (
          <div className="flex items-center gap-2 text-sm font-mono">
            <span>💰</span>
            <span className="text-neon-gold" style={{ textShadow: '0 0 6px rgba(255,215,0,0.3)' }}>
              {formatGC(payload.gc)} GC
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface TradeOfferCardProps {
  offer: TradeOffer;
  type: 'incoming' | 'sent' | 'monitor';
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
  onCancel?: () => void;
  onVoid?: () => void;
  loading?: boolean;
}

export function TradeOfferCard({
  offer,
  type,
  onAccept,
  onReject,
  onCounter,
  onCancel,
  onVoid,
  loading = false,
}: TradeOfferCardProps) {
  const fromCountry = offer.from_country;
  const toCountry = offer.to_country;
  const isPending = offer.status === 'pending';

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {type === 'incoming' && fromCountry && (
            <span className="text-xl">{fromCountry.flag_emoji}</span>
          )}
          {type === 'sent' && toCountry && (
            <span className="text-xl">{toCountry.flag_emoji}</span>
          )}
          <div>
            <div className="text-sm font-heading tracking-[2px]">
              {type === 'incoming' && fromCountry ? `From ${fromCountry.name}` : ''}
              {type === 'sent' && toCountry ? `To ${toCountry.name}` : ''}
              {type === 'monitor' && fromCountry && toCountry
                ? `${fromCountry.flag_emoji} ${fromCountry.name} → ${toCountry.flag_emoji} ${toCountry.name}`
                : ''}
            </div>
            <div className="text-[10px] font-mono text-muted tracking-wider">
              Round {offer.round_number} • {new Date(offer.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
        <TradeStatusBadge status={offer.status} />
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-2 gap-4">
        <PayloadDisplay payload={offer.offering_json} label="They Offer" />
        <PayloadDisplay payload={offer.requesting_json} label="They Want" />
      </div>

      {/* Message */}
      {offer.message && (
        <div className="text-[10px] font-mono text-muted bg-base/50 rounded-xl px-3 py-2 border border-[rgba(0,240,255,0.06)]">
          "{offer.message}"
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2 pt-1">
          {type === 'incoming' && (
            <>
              <Button variant="primary" size="sm" onClick={onAccept} loading={loading} className="flex-1">
                ACCEPT
              </Button>
              <Button variant="danger" size="sm" onClick={onReject} loading={loading} className="flex-1">
                REJECT
              </Button>
              <Button variant="cyan" size="sm" onClick={onCounter} loading={loading}>
                COUNTER
              </Button>
            </>
          )}
          {type === 'sent' && (
            <Button variant="danger" size="sm" onClick={onCancel} loading={loading}>
              CANCEL
            </Button>
          )}
          {type === 'monitor' && (
            <Button variant="danger" size="sm" onClick={onVoid} loading={loading}>
              VOID TRADE
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
