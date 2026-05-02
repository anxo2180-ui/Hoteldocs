import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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

const DEMO_USERS = [
  {
    email: 'anxo.taboada@gmail.com',
    password: 'demo123',
    id: 'user-master',
    name: 'Anxo Taboada',
    role: 'master',
    clientId: null,
    centerIds: [],
    departmentId: null,
  },
  {
    email: 'robinson.admin@hoteldocs.com',
    password: 'demo123',
    id: 'user-robinson-admin',
    name: 'Robinson Admin',
    role: 'clientAdmin',
    clientId: 'client-1',
    centerIds: ['center-rcjd', 'center-rcez', 'center-rcsn', 'center-rcvd', 'center-rcqr', 'center-rcbt'],
    departmentId: 'dept-todos',
  },
  {
    email: 'tui.admin@hoteldocs.com',
    password: 'demo123',
    id: 'user-tui-admin',
    name: 'TUI Admin',
    role: 'clientAdmin',
    clientId: 'client-2',
    centerIds: ['center-tmlf', 'center-tmlcal'],
    departmentId: 'dept-tui-todos',
  },
  {
    email: 'rcjd.admin@hoteldocs.com',
    password: 'demo123',
    id: 'user-rcjd-admin',
    name: 'RCJD Admin',
    role: 'hotelAdmin',
    clientId: 'client-1',
    centerIds: ['center-rcjd'],
    departmentId: 'dept-todos',
  },
  {
    email: 'maria.recepcion@robinson.com',
    password: 'demo123',
    id: 'user-maria-recepcion',
    name: 'Maria Recepcionista',
    role: 'user',
    clientId: 'client-1',
    centerIds: ['center-rcjd'],
    departmentId: 'dept-recepcion',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = DEMO_USERS.find(
      (u) => u.email === email.trim() && u.password === password
    )

    if (!user) {
      setError('Credenciales incorrectas.')
      setLoading(false)
      return
    }

    const authData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      centerIds: user.centerIds,
      departmentId: user.departmentId,
    }

    localStorage.setItem('hoteldocs_auth', JSON.stringify(authData))
    setLoading(false)
    navigate('/dashboard', { replace: true })
  }

  const setDemoCredentials = (user: (typeof DEMO_USERS)[0]) => {
    setEmail(user.email)
    setPassword(user.password)
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
          <p className="mt-2 text-sm text-[#6B7280]">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
          >
            <label className="block text-[13px] font-medium text-[#374151] mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@hotel.com"
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
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
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
              'Iniciar Sesion'
            )}
          </motion.button>
        </form>

        {/* Demo users */}
        <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
          <p className="text-[11px] font-medium uppercase text-[#9CA3AF] tracking-wide mb-3">
            Credenciales de demo
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
                  <p className="text-[11px] text-[#6B7280] truncate">
                    {user.role === 'master'
                      ? 'Master Admin'
                      : user.role === 'clientAdmin'
                        ? 'Admin de Grupo'
                        : user.role === 'hotelAdmin'
                          ? 'Admin de Hotel'
                          : 'Usuario'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
// Deploy trigger: Sat May  2 16:41:16 CST 2026
