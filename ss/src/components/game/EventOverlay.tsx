import type { EventLog } from '../../types'

interface EventOverlayProps {
  eventItem: EventLog | null
}

export const EventOverlay = ({ eventItem }: EventOverlayProps) => {
  if (!eventItem) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4">
      <div className="w-full max-w-lg rounded-md border border-accent-hot/50 bg-card p-6 text-center">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-accent-hot">Live Event</p>
        <h3 className="mt-2 font-heading text-4xl uppercase tracking-[0.1em]">{eventItem.event_type}</h3>
        <p className="mt-3 text-sm text-text-muted">{eventItem.description}</p>
      </div>
    </div>
  )
}
