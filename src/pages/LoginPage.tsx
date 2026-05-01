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
  Info,
} from 'lucide-react'

const DEMO_USERS = [
  {
    email: 'admin@hoteldocs.com',
    password: 'admin123',
    id: 'user-1',
    name: 'Carlos Administrador',
    role: 'admin' as const,
    centerId: 'center-1',
  },
  {
    email: 'user@hoteldocs.com',
    password: 'user123',
    id: 'user-demo',
    name: 'Usuario Demo',
    role: 'user' as const,
    centerId: 'center-1',
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
      centerId: user.centerId,
    }

    localStorage.setItem('hoteldocs_auth', JSON.stringify(authData))
    setLoading(false)
    navigate('/dashboard', { replace: true })
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
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: [0, -4, 4, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[13px] text-[#EF4444] bg-[#FEF2F2] rounded px-3 py-2"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </motion.div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t border-[#E5E7EB]" />
          <span className="text-xs text-[#9CA3AF]">o</span>
          <div className="flex-1 border-t border-[#E5E7EB]" />
        </div>

        {/* Demo hint */}
        <div className="flex items-start gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-md p-3">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#1E40AF]">
            ¿Primera vez? Contacta a tu administrador para obtener acceso.
          </p>
        </div>

        {/* Demo credentials hint */}
        <p className="mt-3 text-[11px] text-center text-[#9CA3AF]">
          Demo: admin@hoteldocs.com / admin123 · user@hoteldocs.com / user123
        </p>
      </motion.div>
    </div>
  )
}

// Inline AnimatePresence to avoid extra import
import { AnimatePresence } from 'framer-motion'
