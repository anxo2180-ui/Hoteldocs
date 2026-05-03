import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthFromStorage } from '@/data/api'

/**
 * RequireAuth — Guard de ruta centralizado
 *
 * Si no hay usuario logueado → redirige a /login
 * Si se provee `allowedRoles` y el rol no está incluido → redirige a /dashboard
 */
export default function RequireAuth({
  children,
  allowedRoles,
}: {
  children: ReactNode
  allowedRoles?: string[]
}) {
  const navigate = useNavigate()
  const auth = getAuthFromStorage()

  useEffect(() => {
    if (!auth) {
      navigate('/login', { replace: true })
      return
    }
    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth, navigate, allowedRoles])

  // Mientras se resuelve la redirección no renderizamos nada
  if (!auth) return null
  if (allowedRoles && !allowedRoles.includes(auth.role)) return null

  return <>{children}</>
}
