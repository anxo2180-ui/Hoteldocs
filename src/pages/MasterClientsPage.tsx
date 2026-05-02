import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Crown,
  Building2,
  Euro,
  Search,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Client } from '@/types'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/data/api'

const LICENSE_COLORS: Record<string, string> = {
  basic: 'bg-blue-50 text-blue-700 border-blue-200',
  professional: 'bg-purple-50 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

const LICENSE_LABELS: Record<string, string> = {
  basic: 'Basic',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  trial: 'Trial',
}

export default function MasterClientsPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formContactName, setFormContactName] = useState('')
  const [formContactPhone, setFormContactPhone] = useState('')
  const [formLicenseType, setFormLicenseType] = useState<'basic' | 'professional' | 'enterprise'>('basic')
  const [formMaxHotels, setFormMaxHotels] = useState(1)
  const [formMaxUsers, setFormMaxUsers] = useState(1)
  const [formMonthlyFee, setFormMonthlyFee] = useState(0)
  const [formLicenseExpiry, setFormLicenseExpiry] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'suspended' | 'trial'>('trial')
  const [formNotes, setFormNotes] = useState('')

  // Auth guard
  const auth = JSON.parse(localStorage.getItem('hoteldocs_auth') || '{}')
  if (auth.role !== 'master') {
    navigate('/dashboard', { replace: true })
  }

  useEffect(() => {
    async function load() {
      const c = await getClients()
      setClients(c)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = clients.reduce((sum, c) => sum + c.monthlyFee, 0)
  const activeClients = clients.filter((c) => c.status === 'active').length
  const totalActiveHotels = clients.reduce((sum, c) => sum + c.activeHotels, 0)

  function resetForm() {
    setFormName('')
    setFormEmail('')
    setFormContactName('')
    setFormContactPhone('')
    setFormLicenseType('basic')
    setFormMaxHotels(1)
    setFormMaxUsers(1)
    setFormMonthlyFee(0)
    setFormLicenseExpiry('')
    setFormStatus('trial')
    setFormNotes('')
  }

  function openCreate() {
    setEditing(null)
    resetForm()
    setModalOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setFormName(client.name)
    setFormEmail(client.email)
    setFormContactName(client.contactName)
    setFormContactPhone(client.contactPhone)
    setFormLicenseType(client.licenseType)
    setFormMaxHotels(client.maxHotels)
    setFormMaxUsers(client.maxUsers)
    setFormMonthlyFee(client.monthlyFee)
    setFormLicenseExpiry(client.licenseExpiry.split('T')[0])
    setFormStatus(client.status)
    setFormNotes(client.notes)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Nombre y email son obligatorios')
      return
    }

    const payload = {
      name: formName.trim(),
      email: formEmail.trim(),
      contactName: formContactName.trim(),
      contactPhone: formContactPhone.trim(),
      licenseType: formLicenseType,
      licenseExpiry: formLicenseExpiry || new Date().toISOString().split('T')[0],
      maxHotels: Number(formMaxHotels),
      maxUsers: Number(formMaxUsers),
      monthlyFee: Number(formMonthlyFee),
      status: formStatus,
      notes: formNotes,
      activeHotels: editing?.activeHotels ?? 0,
      activeUsers: editing?.activeUsers ?? 0,
    }

    try {
      if (editing) {
        await updateClient(editing.id, payload)
        toast.success('Cliente actualizado')
      } else {
        await createClient(payload)
        toast.success('Cliente creado')
      }
      setModalOpen(false)
      resetForm()
      const c = await getClients()
      setClients(c)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      await deleteClient(confirmDelete.id)
      toast.success('Cliente eliminado')
      setConfirmDelete(null)
      const c = await getClients()
      setClients(c)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Clientes</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Gestión de clientes y sus licencias
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Clientes', value: clients.length, icon: Crown, color: 'text-amber-600' },
          { label: 'Activos', value: activeClients, icon: Building2, color: 'text-emerald-600' },
          { label: 'Hoteles activos', value: totalActiveHotels, icon: Building2, color: 'text-[#2563EB]' },
          { label: 'Ingresos/mes', value: `${totalRevenue} EUR`, icon: Euro, color: 'text-purple-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="bg-white border border-[#E5E7EB] rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-[#6B7280]">{s.label}</span>
            </div>
            <span className="text-xl font-semibold text-[#111827]">{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#6B7280]">Cargando clientes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Crown className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Licencia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Hoteles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Usuarios</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Fee/mes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Vencimiento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#6B7280] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((client, i) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-[#F9FAFB] cursor-pointer"
                  onClick={() => navigate(`/master/clients/${client.id}`)}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    openEdit(client)
                  }}
                >
                  <td className="px-4 py-3 font-medium text-[#111827]">{client.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {client.contactName}
                    <br />
                    <span className="text-xs">{client.contactPhone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={LICENSE_COLORS[client.licenseType]}>
                      {LICENSE_LABELS[client.licenseType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {client.activeHotels}/{client.maxHotels}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {client.activeUsers}/{client.maxUsers}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#111827]">{client.monthlyFee} EUR</td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {new Date(client.licenseExpiry).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS_COLORS[client.status]}>
                      {STATUS_LABELS[client.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(client)
                        }}
                        aria-label="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(client)
                        }}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-[#9CA3AF] ml-1" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-semibold">
              {editing ? 'Editar cliente' : 'Nuevo cliente'}
            </DialogTitle>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Nombre *</Label>
                <Input
                  placeholder="Nombre del cliente"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Email *</Label>
                <Input
                  type="email"
                  placeholder="cliente@empresa.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Nombre de contacto</Label>
                <Input
                  placeholder="Persona de contacto"
                  value={formContactName}
                  onChange={(e) => setFormContactName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Teléfono de contacto</Label>
                <Input
                  placeholder="+34 600 000 000"
                  value={formContactPhone}
                  onChange={(e) => setFormContactPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Tipo de licencia</Label>
                <Select value={formLicenseType} onValueChange={(v) => setFormLicenseType(v as 'basic' | 'professional' | 'enterprise')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Estado</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as 'active' | 'suspended' | 'trial')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Max hoteles</Label>
                <Input
                  type="number"
                  min={0}
                  value={formMaxHotels}
                  onChange={(e) => setFormMaxHotels(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Max usuarios</Label>
                <Input
                  type="number"
                  min={0}
                  value={formMaxUsers}
                  onChange={(e) => setFormMaxUsers(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Fee mensual (EUR)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formMonthlyFee}
                  onChange={(e) => setFormMonthlyFee(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Fecha vencimiento licencia</Label>
              <Input
                type="date"
                value={formLicenseExpiry}
                onChange={(e) => setFormLicenseExpiry(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Notas</Label>
              <Textarea
                rows={3}
                placeholder="Notas adicionales..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>
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
              {editing ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[400px]">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <AlertDialogTitle className="text-base font-semibold text-center">
              ¿Eliminar cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#6B7280] text-center">
              {confirmDelete
                ? `Se eliminará permanentemente el cliente "${confirmDelete.name}". Esta acción no se puede deshacer.`
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => setConfirmDelete(null)}
              className="h-9 text-sm"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white h-9 text-sm"
            >
              Eliminar cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
