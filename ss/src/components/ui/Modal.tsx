import type { PropsWithChildren } from 'react'
import { Button } from './Button'
import { Card } from './Card'

interface ModalProps extends PropsWithChildren {
  open: boolean
  onClose: () => void
  title: string
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-2xl uppercase tracking-[0.15em]">{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <div>{children}</div>
      </Card>
    </div>
  )
}
