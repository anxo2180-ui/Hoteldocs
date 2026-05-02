# DIAGNÓSTICO DE LOGIN — HotelDocs

## 1. Estado del código: ❌ CON BUGS CRÍTICOS

El flujo de login tiene **3 bugs críticos** que hacen que la autenticación con Supabase sea inusable o imposible de diagnosticar en producción.

---

## 2. Bugs identificados

### 🔴 BUG CRÍTICO #1: El fallback silencia TODOS los errores de Supabase
**Archivo:** `LoginPage.tsx`, líneas 87-124

```tsx
try {
  // ... crea cliente, llama signInWithPassword ...
  if (!authError && authData?.user) {
    // ... fetch profile ...
    if (profile) { /* login OK */ return }
  }
} catch {
  // Supabase failed, continue to localStorage fallback  ← ⚠️ CATCH VACÍO
}
```

**Problema:** Si `isSupabaseConfigured === true`, cualquier error (CORS, red, credenciales inválidas, tabla `users` no existe, etc.) se atrapa y se **silencia por completo**. El usuario ni siquiera sabe que intentó conectar con Supabase. Cae al fallback local y recibe el genérico "Credenciales incorrectas", haciendo imposible depurar qué falló.

**Impacto:** En producción, si las variables de entorno existen pero Supabase falla por cualquier razón, el desarrollador y el usuario no tienen visibilidad del error real.

---

### 🔴 BUG CRÍTICO #2: `authError` de Supabase nunca se muestra al usuario
**Archivo:** `LoginPage.tsx`, línea 98

```tsx
if (!authError && authData?.user) {
  // ... login exitoso
}
```

**Problema:** Si `signInWithPassword` devuelve un `authError` (ej: "Invalid login credentials", "Email not confirmed", "User not found"), el código **no entra al if**, no muestra el error, y simplemente cae al fallback local. Si el email no coincide con ningún `DEMO_USER`, el usuario ve "Credenciales incorrectas" en lugar del error real de Supabase.

**Impacto:** Un usuario registrado en Supabase que escribe mal su contraseña no recibe feedback de Supabase. Recibe el mensaje genérico del fallback.

---

### 🔴 BUG CRÍTICO #3: Variables de entorno pueden NO estar en el build de Vercel
**Archivo:** `supabase-client.ts`, líneas 15-19 + `.env.example`

```ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY
```

**Problema:** Vite inyecta `import.meta.env.*` en **build time**, no en runtime. El repositorio tiene un `.env.example` con todas las líneas comentadas. Si el deploy en Vercel no tiene configuradas las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el dashboard de Vercel → Settings → Environment Variables, el build generará `undefined` para ambas, y `isSupabaseConfigured` será `false` en producción.

**Impacto:** La app funciona 100% en modo demo/localStorage. Supabase nunca se intenta usar, aunque el usuario quiera.

---

### 🟡 BUG MENOR #4: Se crea un cliente Supabase nuevo en cada login
**Archivo:** `LoginPage.tsx`, líneas 88-91

```tsx
const { createClient } = await import('@supabase/supabase-js')
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(url, key)
```

**Problema:** En lugar de reutilizar el singleton `getSupabaseClient()` exportado desde `supabase-client.ts`, se importa dinámicamente `@supabase/supabase-js` y se crea un cliente nuevo en cada submit. Esto es ineficiente y duplica la lógica de configuración.

---

### 🟡 BUG MENOR #5: Error en fetch de profile no se maneja explícitamente
**Archivo:** `LoginPage.tsx`, líneas 100-104

```tsx
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', authData.user.id)
  .single()

if (profile) { /* OK */ }
```

**Problema:** Si el usuario autenticado en Supabase Auth **no existe** en la tabla pública `users` (por ejemplo, fue creado directamente en Auth pero no migrado), `profile` será `null`. El código no muestra ningún error al usuario; simplemente cae al fallback. El usuario vería "Credenciales incorrectas" sin saber que realmente falta su perfil en la tabla.

---

## 3. Causas raíz del fallo en producción

Si el usuario reporta que "no puede loguearse con Supabase", hay **tres causas posibles**, ordenadas de más a menos probable:

| Prioridad | Causa | Evidencia en código |
|-----------|-------|---------------------|
| 1 | **Variables de entorno no definidas en Vercel** | `.env.example` comentado, `vercel.json` no define env vars, Vite usa build-time env |
| 2 | **CORS no configurado en Supabase** | El catch vacío ocultaría un `fetch` fallido por CORS |
| 3 | **Tabla `users` no existe / no tiene RLS correcto** | El fallback ocultaría un error de `.from('users')` |
| 4 | **Usuario existe en Auth pero no en tabla `users`** | `profile === null` cae al fallback sin error |

---

## 4. Código corregido

### `LoginPage.tsx` — Versión corregida

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from '@/i18n'
import { isSupabaseConfigured, getSupabaseClient } from '@/data/supabase-client'
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
  const { t } = useTranslation('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // --- SUPABASE AUTH (solo si está configurado) ---
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseClient()

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        // Si Supabase devuelve un error de autenticación, mostrarlo y detenerse
        if (authError) {
          setError(authError.message || 'Error de autenticación.')
          setLoading(false)
          return
        }

        if (!authData?.user) {
          setError('No se pudo obtener el usuario.')
          setLoading(false)
          return
        }

        // Fetch user profile from public.users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError || !profile) {
          setError('Usuario autenticado pero perfil no encontrado. Contacte al administrador.')
          setLoading(false)
          return
        }

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
        setLoading(false)
        navigate('/dashboard', { replace: true })
        return

      } catch (err: any) {
        // Errores de red/CORS/JSON/etc — mostrar algo útil
        const msg = err?.message || String(err)
        setError(`Error de conexión con Supabase: ${msg}`)
        setLoading(false)
        return
      }
    }

    // --- FALLBACK: LOCAL DEMO LOGIN (solo si Supabase NO está configurado) ---
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
        {!isSupabaseConfigured && (
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
        )}
      </motion.div>
    </div>
  )
}
```

---

## 5. Checklist de verificación en Vercel

Para que Supabase funcione en producción, verifica en el dashboard de Vercel:

### ✅ Variables de entorno (OBLIGATORIAS)
Ir a **Project Settings → Environment Variables** y asegurar que existen:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://hculvpzrtqcapzxyiqpf.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdWx2cHpydHFjYXB6eHlpcXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NzczMDQsImV4cCI6MjA5MzI1MzMwNH0.vdobop9WcIw9UBJbZoW6AYvx2QBvFC7sv_9LoeB4NdQ` |

> ⚠️ **Importante:** Vite inyecta estas variables en **build time**. Después de añadirlas en Vercel, debe hacerse un **redeploy** para que se incluyan en el bundle.

### ✅ CORS en Supabase
Ir a **Supabase Dashboard → Authentication → URL Configuration** y verificar que la URL del sitio está en la lista de Allowed Origins:
- `https://hoteldocs.vercel.app`
- `https://*.vercel.app` (wildcard para previews)

### ✅ Tabla `users` migrada
Verificar en **Supabase Dashboard → Table Editor** que existe la tabla `users` con:
- Columnas: `id` (uuid, PK), `email`, `name`, `role`, `client_id`, `center_ids` (text[]), `department_id`
- RLS policies que permitan SELECT a usuarios autenticados

---

## 6. Resumen ejecutivo

| Ítem | Estado |
|------|--------|
| `signInWithPassword` recibe email/password correctamente | ✅ Sí |
| Error de Supabase se muestra al usuario | ❌ **NO — se silencia** |
| Fallback localStorage solo si Supabase no está configurado | ❌ **NO — siempre que falle** |
| Variables de entorno en build de Vercel | ⚠️ **Probablemente NO** (`.env.example` comentado) |
| Reutiliza cliente Supabase singleton | ❌ **NO — crea uno nuevo** |
| Maneja perfil faltante en tabla `users` | ❌ **NO — cae al fallback** |
| CORS configurado en Supabase | ⚠️ **Verificar manualmente** |
