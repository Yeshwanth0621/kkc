// Tabs component

interface TabsProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'bottom-nav';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  if (variant === 'bottom-nav') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-xl border-t border-[rgba(0,240,255,0.08)]">
        <div className="flex items-center justify-around">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex flex-col items-center gap-1 py-2.5 px-3 flex-1 transition-all duration-300
                ${activeTab === tab.id
                  ? 'text-neon-cyan scale-105'
                  : 'text-muted hover:text-primary'
                }
              `}
            >
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              <span className="text-[9px] font-mono uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-0.5"
                  style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)' }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <div className="flex items-center gap-1 border-b border-[rgba(0,240,255,0.08)] overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative px-5 py-3.5 font-mono text-xs uppercase tracking-[3px]
            border-b-2 transition-all whitespace-nowrap duration-300
            ${activeTab === tab.id
              ? 'text-neon-cyan border-neon-cyan'
              : 'text-muted border-transparent hover:text-primary hover:border-[rgba(0,240,255,0.2)]'
            }
          `}
          style={activeTab === tab.id ? {
            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
          } : {}}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Simple tab content wrapper
export function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return null;
  return <div className="fade-in">{children}</div>;
}
