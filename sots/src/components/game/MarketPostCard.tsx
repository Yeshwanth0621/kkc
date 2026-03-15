import { useState } from 'react';
import type { MarketPost, ResourceType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RESOURCE_CONFIG, formatGC } from '../../lib/constants';

interface MarketPostCardProps {
  post: MarketPost;
  type: 'open' | 'mine' | 'history' | 'admin';
  onAccept?: (post: MarketPost) => Promise<void>;
  onCancel?: (post: MarketPost) => Promise<void>;
}

export function MarketPostCard({ post, type, onAccept, onCancel }: MarketPostCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'accept' | 'cancel') => {
    setLoading(true);
    try {
      if (action === 'accept' && onAccept) await onAccept(post);
      if (action === 'cancel' && onCancel) await onCancel(post);
    } finally {
      setLoading(false);
    }
  };

  const renderPayload = (payload: { resource?: ResourceType; qty?: number; gc?: number }) => {
    const parts = [];
    if (payload.resource && payload.qty) {
      const conf = RESOURCE_CONFIG[payload.resource];
      parts.push(
        <span key="res" className="inline-flex items-center gap-1">
          <span>{conf.emoji}</span>
          <span style={{ color: conf.color }} className="font-bold drop-shadow-md">
            {payload.qty} {payload.resource}
          </span>
        </span>
      );
    }
    if (payload.gc) {
      parts.push(
        <span key="gc" className="text-neon-gold font-bold" style={{ textShadow: '0 0 5px rgba(255,215,0,0.4)' }}>
          {formatGC(payload.gc)} GC
        </span>
      );
    }
    return parts.length > 0 ? parts.reduce((prev, curr) => <>{prev} + {curr}</>) : <span className="text-muted">Nothing</span>;
  };

  const getStatusColor = (status: MarketPost['status']) => {
    switch (status) {
      case 'open': return 'text-neon-cyan border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.05)]';
      case 'fulfilled': return 'text-neon-lime border-[rgba(57,255,20,0.3)] bg-[rgba(57,255,20,0.05)]';
      case 'cancelled': return 'text-neon-red border-[rgba(255,45,91,0.3)] bg-[rgba(255,45,91,0.05)]';
      default: return 'text-muted';
    }
  };

  return (
    <Card className={`border-[rgba(0,240,255,0.15)] bg-surface/40 hover:bg-surface/60 transition-colors`}>
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Left side: Country & Status */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" title={post.from_country?.name}>{post.from_country?.flag_emoji}</span>
            <span className="font-heading text-sm text-primary tracking-widest">{post.from_country?.name}</span>
            <span className={`text-[9px] font-mono tracking-[2px] uppercase px-2 py-0.5 rounded-lg border ${getStatusColor(post.status)}`}>
              {post.status}
            </span>
          </div>
          <div className="text-[10px] font-mono text-muted tracking-wide mt-2">
            Round {post.round_number} • {new Date(post.created_at).toLocaleTimeString()}
          </div>
          {post.status === 'fulfilled' && post.fulfilled_country && (
            <div className="text-[10px] font-mono text-neon-lime tracking-wide mt-1">
              Fulfilled by: {post.fulfilled_country.flag_emoji} {post.fulfilled_country.name}
            </div>
          )}
        </div>

        {/* Middle: Trade Values */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base/50 p-3 rounded-xl border border-[rgba(0,240,255,0.05)]">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-neon-lime uppercase tracking-[3px] block">Offering</span>
            <div className="text-sm">{renderPayload(post.offering_json)}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-neon-cyan uppercase tracking-[3px] block">Requesting</span>
            <div className="text-sm">{renderPayload(post.requesting_json)}</div>
          </div>
          {post.message && (
            <div className="col-span-1 sm:col-span-2 text-[10px] font-body text-primary/80 italic border-t border-[rgba(0,240,255,0.1)] pt-2 mt-1">
              "{post.message}"
            </div>
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex flex-col justify-center gap-2 min-w-[120px]">
          {type === 'open' && post.status === 'open' && (
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={() => handleAction('accept')}
              className="w-full tracking-[2px]"
            >
              ACCEPT
            </Button>
          )}
          {type === 'mine' && post.status === 'open' && (
            <Button
              variant="danger"
              size="sm"
              loading={loading}
              onClick={() => handleAction('cancel')}
              className="w-full tracking-[2px]"
            >
              CANCEL
            </Button>
          )}
          {type === 'admin' && post.status === 'open' && (
             <Button
             variant="danger"
             size="sm"
             loading={loading}
             onClick={() => handleAction('cancel')}
             className="w-full tracking-[2px]"
           >
             VOID POST
           </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
