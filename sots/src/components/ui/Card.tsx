import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'lime' | 'cyan' | null;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glow = null, onClick }: CardProps) {
  const glowStyles = {
    lime: 'shadow-[0_0_20px_rgba(57,255,20,0.15)] border-[rgba(57,255,20,0.2)]',
    cyan: 'shadow-[0_0_20px_rgba(0,240,255,0.15)] border-[rgba(0,240,255,0.2)]',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-card/80 backdrop-blur-xl
        border border-[rgba(0,240,255,0.06)] rounded-2xl p-5
        shadow-[0_0_1px_rgba(0,240,255,0.2),0_4px_24px_rgba(0,0,0,0.3)]
        transition-all duration-500 ease-out
        ${hover ? `
          hover:bg-card-hover/90
          hover:border-[rgba(0,240,255,0.2)]
          hover:shadow-[0_0_20px_rgba(0,240,255,0.15),0_8px_32px_rgba(0,0,0,0.4)]
          hover:-translate-y-1 hover:scale-[1.01]
          cursor-pointer group
        ` : ''}
        ${glow ? glowStyles[glow] || '' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Scan-line hover effect */}
      {hover && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.02) 2px, rgba(0, 240, 255, 0.02) 4px)',
          }} />
        </div>
      )}
      {/* Top edge neon line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.3)] to-transparent" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
