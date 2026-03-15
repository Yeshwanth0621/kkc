import { Link } from 'react-router-dom'

export const Navbar = () => (
  <header className="sticky top-0 z-20 border-b border-border bg-base/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <Link to="/" className="font-heading text-2xl uppercase tracking-[0.15em] text-accent-lime">
        Survival of the State
      </Link>
      <nav className="hidden items-center gap-5 text-xs uppercase tracking-[0.2em] text-text-muted md:flex">
        <Link to="/dashboard" className="hover:text-text-primary">
          Dashboard
        </Link>
        <Link to="/admin" className="hover:text-text-primary">
          Admin
        </Link>
        <Link to="/leaderboard" className="hover:text-text-primary">
          Leaderboard
        </Link>
      </nav>
    </div>
  </header>
)
