interface AdminSidebarProps {
  tabs: { id: string; label: string; icon: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function AdminSidebar({ tabs, activeTab, onChange }: AdminSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface/80 backdrop-blur-xl border-r border-[rgba(0,240,255,0.06)] min-h-screen relative">
      {/* Right edge neon line */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-[rgba(0,240,255,0.3)] via-transparent to-[rgba(124,58,237,0.3)]" />
      
      {/* Logo */}
      <div className="p-5 border-b border-[rgba(0,240,255,0.06)]">
        <h1 className="font-heading text-lg text-neon-cyan tracking-[4px] neon-text-cyan">SOTS</h1>
        <p className="text-[9px] font-mono text-muted uppercase tracking-[3px] mt-1">Command Center</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-left text-sm font-mono transition-all duration-300 relative overflow-hidden
              ${activeTab === tab.id
                ? 'bg-[rgba(0,240,255,0.06)] text-neon-cyan border border-[rgba(0,240,255,0.15)] shadow-[0_0_15px_rgba(0,240,255,0.08)]'
                : 'text-muted hover:text-primary hover:bg-card/50 border border-transparent'
              }
            `}
          >
            {/* Left accent line for active */}
            {activeTab === tab.id && (
              <div className="absolute left-0 top-[20%] bottom-[20%] w-0.5 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            )}
            <span className={`text-lg ${activeTab === tab.id ? 'drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]' : ''}`}>
              {tab.icon}
            </span>
            <span className="tracking-[2px] uppercase text-[10px]">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[rgba(0,240,255,0.06)]">
        <div className="text-[8px] font-mono text-muted/50 text-center tracking-[3px] uppercase">
          Survival of the State
        </div>
      </div>
    </aside>
  );
}
