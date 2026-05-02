import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { isSupabaseConfigured } from '@/data/supabase-client'
import {
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Crown,
  Building2,
  User,
} from 'lucide-react'

/** =============================================================================
 *  DEMO USERS — Fallback cuando Supabase NO está configurado
 *  =============================================================================
 *  NOTA: Estos datos deben mantenerse sincronizados con seed.sql.
 *  Si cambias un email, contraseña o UUID en seed.sql, actualiza aquí también.
 */
const DEMO_USERS = [
  {
    email: 'anxo.taboada@gmail.com',
    password: 'demo123',
    id: '40000000-0000-0000-0000-000000000001',
    name: 'Anxo Taboada',
    role: 'master' as const,
    clientId: null,
    centerIds: [] as string[],
    departmentId: null,
  },
  {
    email: 'soporte@hoteldocs.com',
    password: 'demo123',
    id: '40000000-0000-0000-0000-000000000002',
    name: 'Master Soporte',
    role: 'master' as const,
    clientId: null,
    centerIds: [] as string[],
    departmentId: null,
  },
  {
    email: 'robinson.admin@hoteldocs.com',
    password: 'demo123',
    id: '40000000-0000-0000-0000-000000000003',
    name: 'Robinson Admin',
    role: 'clientAdmin' as const,
    clientId: '10000000-0000-0000-0000-000000000001',
    centerIds: [
      '30000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000002',
      '30000000-0000-0000-0000-000000000003',
      '30000000-0000-0000-0000-000000000004',
      '30000000-0000-0000-0000-000000000005',
      '30000000-0000-0000-0000-000000000006',
    ],
    departmentId: '20000000-0000-0000-0000-000000000006',
  },
  {
    email: 'tui.admin@hoteldocs.com',
    password: 'demo123',
    id: '40000000-0000-0000-0000-000000000019',
    name: 'TUI Admin',
    role: 'clientAdmin' as const,
    clientId: '10000000-0000-0000-0000-000000000002',
    centerIds: [
      '30000000-0000-0000-0000-000000000007',
      '30000000-0000-0000-0000-000000000008',
    ],
    departmentId: '20000000-0000-0000-0000-000000000011',
  },
  {
    email: 'rcjd.admin@hoteldocs.com',
    password: 'demo123',
    id: '40000000-0000-0000-0000-000000000004',
    name: 'RCJD Admin',
    role: 'hotelAdmin' as const,
    clientId: '10000000-0000-0000-0000-000000000001',
    centerIds: ['30000000-0000-0000-0000-000000000001'],
    departmentId: '20000000-0000-0000-0000-000000000006',
  },
  {
    email: 'maria.recepcion@hoteldocs.com',
    password: 'demo123',
    id: '40000000-0000-0000-0000-000000000010',
    name: 'Maria Recepcionista',
    role: 'user' as const,
    clientId: '10000000-0000-0000-0000-000000000001',
    centerIds: ['30000000-0000-0000-0000-000000000001'],
    departmentId: '20000000-0000-0000-0000-000000000002',
  },
]

/** =============================================================================
 *  LoginPage — Flujo dual: Supabase (producción) | localStorage (demo offline)
 *  =============================================================================
 *  REGLAS DE ORO:
 *  1. Si Supabase está configurado  →  SOLO usamos Supabase Auth.
 *     Errores se muestran al usuario. NUNCA caemos silenciosamente al fallback.
 *  2. Si Supabase NO está configurado  →  Usamos fallback localStorage.
 *  3. Si Supabase auth OK pero public.users no tiene perfil  →  Error explícito.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /** --------------------------------------------------------------------------
   *  LOGIN CON SUPABASE (modo producción)
   *  -------------------------------------------------------------------------- */
  const loginWithSupabase = async (): Promise<boolean> => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

    if (!url || !key) {
      throw new Error('Supabase URL o Anon Key no están definidos en las variables de entorno.')
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })

    // 1) Autenticar contra auth.users
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (authError) {
      // Credenciales incorrectas o usuario no existe
      throw new Error(
        authError.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
          : `Error de autenticación: ${authError.message}`
      )
    }

    if (!authData?.user) {
      throw new Error('No se pudo obtener el usuario después de la autenticación.')
    }

    // 2) Leer perfil enriquecido desde public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('[LoginPage] Error al leer public.users:', profileError)
      throw new Error(
        'No se pudo cargar tu perfil de usuario. Contacta al administrador.'
      )
    }

    if (!profile) {
      // Auth OK pero public.users no tiene la fila → sincronización rota
      throw new Error(
        'Tu cuenta de autenticación existe pero no tiene perfil asociado. ' +
        'Ejecuta el SQL de sincronización (fix-login.sql) en Supabase.'
      )
    }

    if (!profile.is_active) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.')
    }

    // 3) Guardar payload enriquecido en localStorage
    const authPayload = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      clientId: profile.client_id,
      centerIds: profile.center_ids || [],
      departmentId: profile.department_id,
    }
    localStorage.setItem('hoteldocs_auth', JSON.stringify(authPayload))
    return true
  }

  /** --------------------------------------------------------------------------
   *  LOGIN LOCAL (modo demo offline — SOLO cuando Supabase no está configurado)
   *  -------------------------------------------------------------------------- */
  const loginLocal = async (): Promise<boolean> => {
    // Pequeño delay para simular red (UX)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const user = DEMO_USERS.find(
      (u) => u.email === email.trim() && u.password === password
    )

    if (!user) {
      throw new Error('Credenciales incorrectas.')
    }

    const authPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      centerIds: user.centerIds,
      departmentId: user.departmentId,
    }

    localStorage.setItem('hoteldocs_auth', JSON.stringify(authPayload))
    return true
  }

  /** --------------------------------------------------------------------------
   *  SUBMIT HANDLER
   *  -------------------------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSupabaseConfigured) {
        // ── MODO SUPABASE ──
        // Solo intentamos Supabase. Si falla, mostramos error y paramos.
        await loginWithSupabase()
        navigate('/dashboard', { replace: true })
      } else {
        // ── MODO OFFLINE DEMO ──
        // Supabase no está configurado, usamos fallback localStorage.
        await loginLocal()
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.'
      setError(message)
      setLoading(false)
    }
  }

  const setDemoCredentials = (user: (typeof DEMO_USERS)[0]) => {
    setEmail(user.email)
    setPassword(user.password)
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case 'master': return t('masterAdmin')
      case 'clientAdmin': return t('groupAdmin')
      case 'hotelAdmin': return t('hotelAdmin')
      default: return t('user')
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F9FAFB] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[420px] bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-8"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-[#111827]">
            <FileText className="w-6 h-6 text-[#2563EB]" />
            <span className="text-xl font-semibold">HotelDocs</span>
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">{t('title')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
          >
            <label className="block text-[13px] font-medium text-[#374151] mb-1">
              {t('emailLabel')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="w-full pl-10 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
          >
            <label className="block text-[13px] font-medium text-[#374151] mb-1">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                className="w-full pl-10 pr-10 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t('submitButton')
            )}
          </motion.button>
        </form>

        {/* Demo users */}
        <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
          <p className="text-[11px] font-medium uppercase text-[#9CA3AF] tracking-wide mb-3">
            {t('demoCredentials')}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => setDemoCredentials(user)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-[#E5E7EB] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all text-left"
              >
                {user.role === 'master' ? (
                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                ) : user.role === 'clientAdmin' ? (
                  <Building2 className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                ) : user.role === 'hotelAdmin' ? (
                  <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[#111827] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{roleLabel(user.role)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Indicador de modo */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-[#9CA3AF]">
            {isSupabaseConfigured
              ? 'Conectado a Supabase'
              : 'Modo demo offline (sin Supabase)'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
