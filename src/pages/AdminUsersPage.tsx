import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Users,
  Search,
  X,
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
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { User, Center, Department } from '@/types'
import type { UserRole } from '@/types'
import { DEPARTMENTS } from '@/types'
import {
  getUsers,
  getCenters,
  createUser,
  updateUser,
  toggleUserActive,
  addAuditLogEntry,
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

function getAuthUser(): { id: string; name: string; role: string } | null {
  try {
    const raw = localStorage.getItem('hoteldocs_auth')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('user')
  const [formCenterId, setFormCenterId] = useState('')
  const [formDepartment, setFormDepartment] = useState<Department>('todos')
  const [formActive, setFormActive] = useState(true)

  useEffect(() => {
    const auth = getAuthUser()
    if (!auth || !['master', 'clientAdmin', 'hotelAdmin'].includes(auth.role)) {
      navigate('/dashboard')
      return
    }
    loadData()
  }, [navigate])

  async function loadData() {
    setLoading(true)
    const [u, c] = await Promise.all([getUsers(), getCenters()])
    setUsers(u)
    setCenters(c)
    setLoading(false)
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  function centerName(centerId: string): string {
    const c = centers.find((x) => x.id === centerId)
    return c?.name ?? '—'
  }

  function openCreate() {
    setEditing(null)
    setFormName('')
    setFormEmail('')
    setFormRole('user')
    setFormCenterId(centers[0]?.id ?? '')
    setFormDepartment('todos')
    setFormActive(true)
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormCenterId(user.centerId ?? '')
    setFormDepartment((user.department ?? 'todos') as Department)
    setFormActive(user.isActive)
    setModalOpen(true)
  }

  async function handleSave() {
    const auth = getAuthUser()
    if (!formName.trim() || !formEmail.trim()) return

    if (editing) {
      const updated = await updateUser(editing.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        centerId: formRole === 'hotelAdmin' || formRole === 'user' ? formCenterId : null,
        department: formDepartment,
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
        clientId: (auth as any)?.clientId || null,
        centerId: formRole === 'hotelAdmin' || formRole === 'user' ? (formCenterId || centers[0]?.id || '') : null,
        department: formDepartment,
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
    const auth = getAuthUser()
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

  const activeCount = users.filter((u) => u.isActive).length
  const adminCount = users.filter((u) => ['master', 'clientAdmin', 'hotelAdmin'].includes(u.role)).length

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="pt-6 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Gestiona quién tiene acceso y qué puede ver
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

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Total</span>
              <p className="text-lg font-semibold text-[#111827]">{users.length}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Activos</span>
              <p className="text-lg font-semibold text-[#10B981]">{activeCount}</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6B7280]">Admins</span>
              <p className="text-lg font-semibold text-[#2563EB]">{adminCount}</p>
            </div>
          </div>

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

          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-[#6B7280]">
                Cargando usuarios...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Users className="w-12 h-12" />}
                title="No hay usuarios registrados"
                description="Invita a tu primer usuario para empezar"
                cta={
                  <Button
                    onClick={openCreate}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Invitar primer usuario
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Nombre
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Rol
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Centro
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Departamento
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Estado
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4 text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <motion.tbody
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="contents"
                  >
                    {filtered.map((user) => (
                      <motion.tr
                        key={user.id}
                        variants={rowVariant}
                        className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <span className="text-sm font-medium text-[#111827]">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6B7280]">
                          {user.email}
                        </td>
                        <td className="py-3 px-4">
                          {['master', 'clientAdmin', 'hotelAdmin'].includes(user.role) ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-[#EFF6FF] text-[#2563EB]">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-[#F3F4F6] text-[#6B7280]">
                              Usuario
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#6B7280]">
                          {centerName(user.centerId ?? '')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                            {DEPARTMENTS.find(d => d.value === (user.department ?? 'todos'))?.label || user.department}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleActive(user)}
                              aria-label={
                                user.isActive ? 'Desactivar' : 'Activar'
                              }
                            />
                            <span
                              className={`text-xs font-medium ${
                                user.isActive
                                  ? 'text-[#10B981]'
                                  : 'text-[#6B7280]'
                              }`}
                            >
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
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
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0">
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
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Nombre completo</Label>
              <Input
                placeholder="Ej: Ana García"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
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
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Centro asignado</Label>
              <Select
                value={formCenterId}
                onValueChange={setFormCenterId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar centro" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((c) => (
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
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Departamento</Label>
              <Select
                value={formDepartment}
                onValueChange={(v) => setFormDepartment(v as Department)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6B7280]">
                El usuario solo verá documentos dirigidos a este departamento (o a 'Todos')
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Rol</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formRole === 'user'}
                    onChange={() => setFormRole('user')}
                    className="accent-[#2563EB]"
                  />
                  <span className="text-sm text-[#111827]">Usuario</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formRole === 'clientAdmin'}
                    onChange={() => setFormRole('clientAdmin')}
                    className="accent-[#2563EB]"
                  />
                  <span className="text-sm text-[#111827]">Administrador</span>
                </label>
              </div>
              <p className="text-xs text-[#6B7280]">
                {formRole === 'clientAdmin'
                  ? 'Puede crear, editar, aprobar documentos y gestionar usuarios'
                  : 'Puede ver y descargar documentos aprobados'}
              </p>
            </div>
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
