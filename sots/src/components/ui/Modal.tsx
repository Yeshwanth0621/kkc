import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with radial neon glow */}
      <div
        className="absolute inset-0 fade-in"
        onClick={onClose}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.03) 0%, rgba(0,0,0,0.85) 70%)',
          backdropFilter: 'blur(8px)',
        }}
      />
      {/* Modal content */}
      <div
        className="relative overflow-hidden bg-surface border border-[rgba(0,240,255,0.12)] rounded-2xl p-6 slide-up w-full overflow-y-auto max-h-[90vh] shadow-[0_0_40px_rgba(0,240,255,0.08),0_25px_50px_rgba(0,0,0,0.5)]"
        style={{ maxWidth }}
      >
        {/* Top neon accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.5)] to-transparent" />
        
        {/* Scan-line texture */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 240, 255, 0.01) 3px, rgba(0, 240, 255, 0.01) 6px)',
        }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-heading text-neon-cyan tracking-widest neon-text-cyan">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-neon-cyan transition-all duration-300 text-xl leading-none hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
