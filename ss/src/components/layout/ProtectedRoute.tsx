import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface ProtectedRouteProps extends PropsWithChildren {
  adminOnly?: boolean
}

export const ProtectedRoute = ({ children, adminOnly }: ProtectedRouteProps) => {
  const [state, setState] = useState<'loading' | 'allowed' | 'blocked'>('loading')

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setState('blocked')
        return
      }
      if (adminOnly && !(user.email ?? '').toLowerCase().includes('admin')) {
        setState('blocked')
        return
      }
      setState('allowed')
    }
    void check()
  }, [adminOnly])

  if (state === 'loading') {
    return <div className="p-4 text-sm text-text-muted">Checking session...</div>
  }

  if (state === 'blocked') {
    return <Navigate to="/login" replace />
  }

  return children
}
