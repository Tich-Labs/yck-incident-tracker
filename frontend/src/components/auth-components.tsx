import { useAuth } from '@/components/providers/supabase'
import { Spinner } from '@/components/ui/spinner'

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <Spinner />
  if (!isAuthenticated) return null
  return <>{children}</>
}

export function Unauthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <Spinner />
  if (isAuthenticated) return null
  return <>{children}</>
}

export function AuthLoading({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()
  
  if (!loading) return null
  return <>{children}</>
}
