interface BottomNavProps {
  tabs: { id: string; label: string; icon: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function BottomNav({ tabs, activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-2xl border-t border-[rgba(0,240,255,0.08)] pb-2 pt-1 md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      {/* Top neon line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.3)] to-transparent" />
      
      <div className="flex items-center justify-around safe-area-bottom">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex flex-col items-center gap-1 py-2 px-2 flex-1 transition-all duration-300
              ${activeTab === tab.id ? 'text-neon-cyan scale-110' : 'text-muted hover:text-white'}
            `}
          >
            <span className={`text-xl transition-all duration-300 ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-[8px] font-mono uppercase tracking-[2px]">{tab.label}</span>
            {activeTab === tab.id && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-0.5"
                style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)' }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
