interface BottomNavProps {
  items: Array<{ id: string; label: string }>
  activeId: string
  onSelect: (id: string) => void
}

export const BottomNav = ({ items, activeId, onSelect }: BottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-border bg-base p-2 md:hidden">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`rounded-sm px-2 py-2 text-[10px] uppercase tracking-[0.18em] ${
          activeId === item.id ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-text-muted'
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
)
