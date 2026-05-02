import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Users,
  Search,
  X,
  Crown,
  Building2,
  User as UserIcon,
  Shield,
} from 'lucide-react'

import AppShell from '@/components/AppShell'
import EmptyState from '@/components/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { User, Center, Client, Department, UserRole } from '@/types'
import {
  getUsersForCurrentUser,
  getCenters,
  getClients,
  getDepartmentsByClient,
  createUser,
  updateUser,
  toggleUserActive,
  addAuditLogEntry,
  getAuthUser,
} from '@/data/api'

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const rowVariant = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function roleBadge(role: UserRole) {
  if (role === 'master') {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
        <Crown className="w-3 h-3 mr-1" />
        Master
      </Badge>
    )
  }
  if (role === 'clientAdmin') {
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
        <Shield className="w-3 h-3 mr-1" />
        Client Admin
      </Badge>
    )
  }
  if (role === 'hotelAdmin') {
    return (
      <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
        <Building2 className="w-3 h-3 mr-1" />
        Hotel Admin
      </Badge>
    )
  }
  return (
    <Badge variant="secondary">
      <UserIcon className="w-3 h-3 mr-1" />
      Usuario
    </Badge>
  )
}

function roleLabel(role: UserRole): string {
  switch (role) {
    case 'master': return 'Master'
    case 'clientAdmin': return 'Client Admin'
    case 'hotelAdmin': return 'Hotel Admin'
    case 'user': return 'Usuario'
  }
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('user')
  const [formClientId, setFormClientId] = useState('')
  const [formCenterId, setFormCenterId] = useState('')
  const [formDepartmentId, setFormDepartmentId] = useState<string>('')
  const [formActive, setFormActive] = useState(true)

  const auth = useMemo(() => getAuthUser(), [modalOpen])
  const authRole = auth?.role ?? null

  // Redirect non-admin users
  useEffect(() => {
    if (!authRole || !['master', 'clientAdmin', 'hotelAdmin'].includes(authRole)) {
      navigate('/dashboard')
    }
  }, [authRole, navigate])

  async function loadData() {
    setLoading(true)
    const [u, c, cl] = await Promise.all([
      getUsersForCurrentUser(),
      getCenters(),
      getClients(),
    ])
    setUsers(u)
    setCenters(c)
    setClients(cl)
    // Preload departments for auth user's client
    if (auth?.clientId) {
      const depts = await getDepartmentsByClient(auth.clientId)
      setDepartments(depts)
    } else if (auth?.role === 'master' && cl.length > 0) {
      const depts = await getDepartmentsByClient(cl[0].id)
      setDepartments(depts)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authRole])

  // Load departments when form client changes (for master)
  useEffect(() => {
    if (!formClientId) return
    getDepartmentsByClient(formClientId).then(setDepartments)
  }, [formClientId])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const platformStaff = filtered.filter((u) => u.role === 'master')
  const clientUsers = (clientId: string) => filtered.filter((u) => u.clientId === clientId)

  function centerName(centerId: string): string {
    const c = centers.find((x) => x.id === centerId)
    return c?.name ?? '—'
  }

  function clientName(clientId: string): string {
    const c = clients.find((x) => x.id === clientId)
    return c?.name ?? '—'
  }

  function departmentName(deptId: string | null): string {
    if (!deptId) return '—'
    const d = departments.find((x) => x.id === deptId)
    return d?.name ?? '—'
  }

  function openCreate() {
    setEditing(null)
    setFormName('')
    setFormEmail('')
    setFormRole(authRole === 'hotelAdmin' ? 'user' : 'user')
    setFormClientId(
      authRole === 'master'
        ? (clients[0]?.id ?? '')
        : (auth?.clientId ?? '')
    )
    setFormCenterId(
      authRole === 'hotelAdmin'
        ? (auth?.centerIds[0] ?? centers[0]?.id ?? '')
        : (centers[0]?.id ?? '')
    )
    setFormDepartmentId(departments[0]?.id ?? '')
    setFormActive(true)
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormClientId(user.clientId ?? '')
    setFormCenterId((user.centerIds || [])[0] ?? '')
    setFormDepartmentId(user.departmentId ?? '')
    setFormActive(user.isActive)
    setModalOpen(true)
    // Preload departments for this user's client
    if (user.clientId) {
      getDepartmentsByClient(user.clientId).then(setDepartments)
    }
  }

  const availableRolesForForm = useMemo(() => {
    if (authRole === 'master') return ['master', 'clientAdmin', 'hotelAdmin', 'user'] as UserRole[]
    if (authRole === 'clientAdmin') return ['hotelAdmin', 'user'] as UserRole[]
    return ['user'] as UserRole[]
  }, [authRole])

  const availableClientsForForm = useMemo(() => {
    if (authRole === 'master') return clients
    if (auth?.clientId) return clients.filter((c) => c.id === auth.clientId)
    return []
  }, [authRole, auth, clients])

  const availableCentersForForm = useMemo(() => {
    if (authRole === 'master') {
      if (!formClientId) return centers
      return centers.filter((c) => c.clientId === formClientId)
    }
    if (authRole === 'clientAdmin' && auth?.clientId) {
      return centers.filter((c) => c.clientId === auth.clientId)
    }
    if (authRole === 'hotelAdmin' && auth?.centerIds) {
      return centers.filter((c) => auth.centerIds.includes(c.id))
    }
    return []
  }, [authRole, auth, centers, formClientId])

  async function handleSave() {
    if (!formName.trim() || !formEmail.trim()) return

    const centerIds =
      formRole === 'hotelAdmin' || formRole === 'user'
        ? (formCenterId ? [formCenterId] : [])
        : authRole === 'clientAdmin' && auth?.clientId
          ? centers.filter((c) => c.clientId === auth.clientId).map((c) => c.id)
          : authRole === 'hotelAdmin' && auth?.centerIds
            ? auth.centerIds
            : []

    if (editing) {
      const updated = await updateUser(editing.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        clientId: formRole === 'master' ? null : (formClientId || null),
        centerIds,
        departmentId: formDepartmentId || null,
        isActive: formActive,
      })
      await addAuditLogEntry({
        userId: auth?.id ?? 'unknown',
        userName: auth?.name ?? 'Desconocido',
        action: 'UPDATED',
        entityType: 'user',
        entityId: updated.id,
        details: `Actualizó el usuario "${updated.name}" (${updated.email})`,
      })
    } else {
      const created = await createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        clientId: formRole === 'master' ? null : (formClientId || null),
        centerIds,
        departmentId: formDepartmentId || null,
        isActive: formActive,
      })
      await addAuditLogEntry({
        userId: auth?.id ?? 'unknown',
        userName: auth?.name ?? 'Desconocido',
        action: 'CREATED',
        entityType: 'user',
        entityId: created.id,
        details: `Creó el usuario "${created.name}" (${created.email})`,
      })
    }
    setModalOpen(false)
    loadData()
  }

  async function handleToggleActive(user: User) {
    const updated = await toggleUserActive(user.id)
    await addAuditLogEntry({
      userId: auth?.id ?? 'unknown',
      userName: auth?.name ?? 'Desconocido',
      action: 'STATUS_CHANGED',
      entityType: 'user',
      entityId: updated.id,
      details: `${updated.isActive ? 'Activó' : 'Desactivó'} el usuario "${updated.name}"`,
    })
    loadData()
  }

  const activeCount = filtered.filter((u) => u.isActive).length
  const adminCount = filtered.filter((u) => ['master', 'clientAdmin', 'hotelAdmin'].includes(u.role)).length
  const userCount = filtered.filter((u) => u.role === 'user').length

  // ==================== RENDER HELPERS ====================

  function UserRow({ user, showClient = false }: { user: User; showClient?: boolean }) {
    return (
      <motion.div
        variants={rowVariant}
        className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {getInitials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#111827]">{user.name}</span>
            {roleBadge(user.role)}
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">
            {user.email}
            {showClient && user.clientId && (
              <span className="ml-2">· {clientName(user.clientId)}</span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs text-[#6B7280] gap-0.5">
          <span>{(user.centerIds || []).map((cid: string) => centerName(cid)).join(', ')}</span>
          <span>{departmentName(user.departmentId)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={user.isActive}
            onCheckedChange={() => handleToggleActive(user)}
            aria-label={user.isActive ? 'Desactivar' : 'Activar'}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEdit(user)}
            className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function ClientSection({ client }: { client: Client }) {
    const usersInClient = clientUsers(client.id)
    const clientAdmin = usersInClient.find((u) => u.role === 'clientAdmin')
    const centersInClient = centers.filter((c) => c.clientId === client.id)

    return (
      <motion.div variants={cardVariant}>
        <Card className="overflow-hidden border border-[#E5E7EB]">
          <CardHeader className="pb-3 bg-[#F9FAFB]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-[#111827]">
                  {client.name}
                </CardTitle>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {usersInClient.length} usuarios · {usersInClient.filter((u) => u.isActive).length} activos
                </p>
              </div>
              <Badge variant="outline" className="text-[11px]">
                {centersInClient.length} centros
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {clientAdmin && (
              <div className="px-4 py-2 bg-amber-50/50 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2 text-xs text-amber-700 font-medium uppercase tracking-wide">
                  <Shield className="w-3.5 h-3.5" />
                  Client Admin
                </div>
                <UserRow user={clientAdmin} />
              </div>
            )}

            <Accordion type="multiple" className="w-full">
              {centersInClient.map((center) => {
                const centerUsers = usersInClient.filter(
                  (u) => u.role !== 'clientAdmin' && u.centerIds.includes(center.id)
                )
                const hotelAdmin = centerUsers.find((u) => u.role === 'hotelAdmin')
                const regularUsers = centerUsers.filter((u) => u.role === 'user')

                if (!hotelAdmin && regularUsers.length === 0) return null

                return (
                  <AccordionItem key={center.id} value={center.id} className="border-b border-[#E5E7EB]">
                    <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-[#F9FAFB]">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#6B7280]" />
                        <span className="font-medium text-[#111827]">{center.name}</span>
                        <Badge variant="outline" className="text-[11px] ml-2">
                          {centerUsers.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      {hotelAdmin && (
                        <div className="px-4 py-1 bg-blue-50/30">
                          <div className="flex items-center gap-2 text-xs text-blue-700 font-medium uppercase tracking-wide px-4 pt-2">
                            <Building2 className="w-3.5 h-3.5" />
                            Hotel Admin
                          </div>
                          <UserRow user={hotelAdmin} />
                        </div>
                      )}
                      {regularUsers.length > 0 && (
                        <div className="px-4 py-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide px-4 pt-2">
                            <UserIcon className="w-3.5 h-3.5" />
                            Usuarios
                          </div>
                          <motion.div variants={staggerContainer} initial="hidden" animate="show">
                            {regularUsers.map((user) => (
                              <UserRow key={user.id} user={user} />
                            ))}
                          </motion.div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  function HotelAdminView() {
    const myCenterIds = auth?.centerIds ?? []
    const myUsers = filtered.filter((u) => u.centerIds.some((cid: string) => myCenterIds.includes(cid)))

    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
        {myCenterIds.map((cid: string) => {
          const center = centers.find((c) => c.id === cid)
          const centerUsers = myUsers.filter((u) => u.centerIds.includes(cid))
          if (!center || centerUsers.length === 0) return null
          return (
            <motion.div key={cid} variants={cardVariant}>
              <Card className="overflow-hidden border border-[#E5E7EB]">
                <CardHeader className="pb-3 bg-[#F9FAFB]">
                  <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#6B7280]" />
                    {center.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                  <motion.div variants={staggerContainer} initial="hidden" animate="show">
                    {centerUsers.map((user) => (
                      <UserRow key={user.id} user={user} />
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    )
  }

  // ==================== MAIN RENDER ====================

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="pt-6 px-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                {authRole === 'master'
                  ? 'Gestiona staff de plataforma y usuarios de todos los clientes'
                  : authRole === 'clientAdmin'
                    ? 'Gestiona usuarios de tu organización'
                    : 'Gestiona usuarios de tu centro'}
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-[0.98] transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Total</span>
              <p className="text-lg font-semibold text-[#111827]">{filtered.length}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Activos</span>
              <p className="text-lg font-semibold text-[#10B981]">{activeCount}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Admins</span>
              <p className="text-lg font-semibold text-[#2563EB]">{adminCount}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Usuarios</span>
              <p className="text-lg font-semibold text-[#6B7280]">{userCount}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="py-16 text-center text-sm text-[#6B7280]">
                Cargando usuarios...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Users className="w-12 h-12" />}
                title="No hay usuarios"
                description="No se encontraron usuarios con los filtros actuales"
                cta={
                  <Button
                    onClick={openCreate}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo usuario
                  </Button>
                }
              />
            ) : (
              <AnimatePresence mode="wait">
                {authRole === 'master' && (
                  <motion.div
                    key="master-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Platform Staff */}
                    {platformStaff.length > 0 && (
                      <motion.div variants={cardVariant}>
                        <Card className="overflow-hidden border border-[#E5E7EB]">
                          <CardHeader className="pb-3 bg-[#F9FAFB]">
                            <CardTitle className="text-base font-semibold text-[#111827] flex items-center gap-2">
                              <Crown className="w-4 h-4 text-amber-500" />
                              Staff de Plataforma
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-0 pt-0">
                            <motion.div variants={staggerContainer} initial="hidden" animate="show">
                              {platformStaff.map((user) => (
                                <UserRow key={user.id} user={user} />
                              ))}
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Clients */}
                    {clients.map((client) => (
                      <ClientSection key={client.id} client={client} />
                    ))}
                  </motion.div>
                )}

                {authRole === 'clientAdmin' && (
                  <motion.div
                    key="clientadmin-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {auth?.clientId && (
                      <ClientSection
                        client={
                          clients.find((c) => c.id === auth.clientId) || {
                            id: auth.clientId,
                            name: 'Mi Organización',
                            email: '',
                            contactName: '',
                            contactPhone: '',
                            licenseType: 'professional',
                            licenseExpiry: '',
                            maxHotels: 0,
                            maxUsers: 0,
                            activeHotels: 0,
                            activeUsers: 0,
                            status: 'active',
                            monthlyFee: 0,
                            notes: '',
                            createdAt: '',
                          }
                        }
                      />
                    )}
                  </motion.div>
                )}

                {authRole === 'hotelAdmin' && <HotelAdminView />}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[520px] p-0">
          <DialogHeader className="p-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-semibold">
              {editing ? 'Editar usuario' : 'Nuevo usuario'}
            </DialogTitle>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>
          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Nombre completo</Label>
              <Input
                placeholder="Ej: Ana García"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Correo electrónico</Label>
              <Input
                type="email"
                placeholder="ana@hotel.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                disabled={!!editing}
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Rol</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {availableRolesForForm.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6B7280]">
                {formRole === 'master'
                  ? 'Acceso total a la plataforma'
                  : formRole === 'clientAdmin'
                    ? 'Gestiona todos los centros de su cliente'
                    : formRole === 'hotelAdmin'
                      ? 'Gestiona un centro específico'
                      : 'Solo puede ver documentos de su centro y departamento'}
              </p>
            </div>

            {/* Client (master only) */}
            {authRole === 'master' && (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Cliente</Label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClientsForForm.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Center (for hotelAdmin and user roles) */}
            {(formRole === 'hotelAdmin' || formRole === 'user') && (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">
                  {authRole === 'hotelAdmin' ? 'Centro asignado' : 'Centro asignado'}
                </Label>
                <Select value={formCenterId} onValueChange={setFormCenterId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCentersForForm.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6B7280]">
                  El usuario solo verá documentos de este centro
                </p>
              </div>
            )}

            {/* Department */}
            {(formRole === 'hotelAdmin' || formRole === 'user') && (
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Departamento</Label>
                <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6B7280]">
                  El usuario solo verá documentos dirigidos a este departamento (o a 'Todos')
                </p>
              </div>
            )}

            {/* Active toggle (edit only) */}
            {editing && (
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <Label className="text-[13px] font-medium">Usuario activo</Label>
                </div>
                <Switch
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
              </div>
            )}
          </div>
          <DialogFooter className="p-5 border-t border-[#E5E7EB]">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="h-9 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || !formEmail.trim()}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm"
            >
              {editing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
