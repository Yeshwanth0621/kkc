import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }
    const resolvedEmail = data.user?.email?.toLowerCase() ?? ''
    navigate(resolvedEmail.includes('admin') ? '/admin' : '/dashboard')
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-md place-items-center px-4">
      <Card className="w-full space-y-5">
        <div>
          <h1 className="font-heading text-4xl uppercase tracking-[0.1em] text-accent-lime">Secure Login</h1>
          <p className="mt-1 text-sm text-text-muted">Country team and game master access portal.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-data text-sm text-text-primary outline-none focus:border-accent-cyan"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-sm border border-border bg-surface px-3 py-2 font-data text-sm text-text-primary outline-none focus:border-accent-cyan"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="text-sm text-accent-hot">{error}</p>}
          <Button disabled={loading} className="w-full">
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </Card>
    </main>
  )
}
