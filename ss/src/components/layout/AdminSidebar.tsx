interface AdminSidebarProps {
  sections: string[]
  active: string
  onSelect: (section: string) => void
}

export const AdminSidebar = ({ sections, active, onSelect }: AdminSidebarProps) => (
  <aside className="space-y-2">
    {sections.map((section) => (
      <button
        key={section}
        onClick={() => onSelect(section)}
        className={`w-full rounded-sm border px-3 py-2 text-left text-xs uppercase tracking-[0.2em] ${
          active === section
            ? 'border-accent-lime bg-accent-lime/15 text-accent-lime'
            : 'border-border bg-card text-text-muted'
        }`}
      >
        {section}
      </button>
    ))}
  </aside>
)
