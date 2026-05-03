import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Building2,
  Search,
  AlertTriangle,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { Center } from '@/types'
import {
  getCenters,
  createCenter,
  updateCenter,
  deleteCenter,
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

export default function AdminCentersPage() {
  const navigate = useNavigate()
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Center | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Center | null>(null)

  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formActive, setFormActive] = useState(true)

  useEffect(() => {
    const auth = getAuthUser()
    if (!auth || !['master', 'clientAdmin', 'hotelAdmin'].includes(auth.role)) {
      navigate('/dashboard')
      return
    }
    loadCenters()
  }, [navigate])

  async function loadCenters() {
    setLoading(true)
    const data = await getCenters()
    setCenters(data)
    setLoading(false)
  }

  const filtered = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = centers.filter((c) => c.status === 'active').length
  const pausedCount = centers.filter((c) => c.status === 'paused').length

  function openCreate() {
    setEditing(null)
    setFormName('')
    setFormCode('')
    setFormActive(true)
    setModalOpen(true)
  }

  function openEdit(center: Center) {
    setEditing(center)
    setFormName(center.name)
    setFormCode(center.code)
    setFormActive(center.status === 'active')
    setModalOpen(true)
  }

  async function handleSave() {
    const auth = getAuthUser()
    if (!formName.trim() || !formCode.trim()) return

    if (editing) {
      const updated = await updateCenter(editing.id, {
        name: formName.trim(),
        code: formCode.trim(),
        status: formActive ? 'active' : 'paused',
      })
      await addAuditLogEntry({
        userId: auth?.id ?? 'unknown',
        userName: auth?.name ?? 'Desconocido',
        action: 'UPDATED',
        entityType: 'center',
        entityId: updated.id,
        details: `Actualizó el centro "${updated.name}" (${updated.code})`,
      })
    } else {
      const created = await createCenter({
        name: formName.trim(),
        code: formCode.trim(),
        clientId: 'client-1',
        status: formActive ? 'active' : 'paused',
      })
      await addAuditLogEntry({
        userId: auth?.id ?? 'unknown',
        userName: auth?.name ?? 'Desconocido',
        action: 'CREATED',
        entityType: 'center',
        entityId: created.id,
        details: `Creó el centro "${created.name}" (${created.code})`,
      })
    }
    setModalOpen(false)
    loadCenters()
  }

  async function handleToggleStatus(center: Center) {
    const auth = getAuthUser()
    const newStatus = center.status === 'active' ? 'paused' : 'active'
    const updated = await updateCenter(center.id, { status: newStatus })
    await addAuditLogEntry({
      userId: auth?.id ?? 'unknown',
      userName: auth?.name ?? 'Desconocido',
      action: 'STATUS_CHANGED',
      entityType: 'center',
      entityId: updated.id,
      details: `${newStatus === 'active' ? 'Reactivó' : 'Pausó'} el centro "${updated.name}"`,
    })
    loadCenters()
  }

  async function handleDelete() {
    if (!confirmDelete) return
    const auth = getAuthUser()
    await deleteCenter(confirmDelete.id)
    await addAuditLogEntry({
      userId: auth?.id ?? 'unknown',
      userName: auth?.name ?? 'Desconocido',
      action: 'DELETED',
      entityType: 'center',
      entityId: confirmDelete.id,
      details: `Eliminó el centro "${confirmDelete.name}" (${confirmDelete.code})`,
    })
    setConfirmDelete(null)
    loadCenters()
  }

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
                Gestión de Centros
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Gestiona los centros donde se organizan los documentos
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-[0.98] transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Nuevo Centro
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide bg-[#ECFDF5] text-[#10B981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {activeCount} activos
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide bg-[#FEF2F2] text-[#EF4444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              {pausedCount} pausados
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                placeholder="Buscar centro por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-[#6B7280]">
                Cargando centros...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Building2 className="w-12 h-12" />}
                title="No hay centros configurados"
                description="Crea tu primer centro para empezar a organizar documentos"
                cta={
                  <Button
                    onClick={openCreate}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Crear centro
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
                      Código
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
                    {filtered.map((center) => (
                      <motion.tr
                        key={center.id}
                        variants={rowVariant}
                        className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#6B7280] shrink-0" />
                            <span className="text-sm font-medium text-[#111827]">
                              {center.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block font-mono text-xs text-[#9CA3AF] bg-[#F3F4F6] rounded px-2 py-0.5">
                            {center.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {center.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-[#ECFDF5] text-[#10B981]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-[#F3F4F6] text-[#6B7280]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" />
                              Pausado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(center)}
                              className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                              aria-label="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleToggleStatus(center)}
                              className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                              aria-label={
                                center.status === 'active'
                                  ? 'Pausar'
                                  : 'Reactivar'
                              }
                            >
                              {center.status === 'active' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setConfirmDelete(center)}
                              className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
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
              {editing ? 'Editar centro' : 'Nuevo centro'}
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
              <Label className="text-[13px] font-medium">
                Nombre del hotel o centro
              </Label>
              <Input
                placeholder="Ej: Hotel Madrid Centro"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Código interno</Label>
              <Input
                placeholder="Ej: HMC-001"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
              />
              <p className="text-xs text-[#6B7280]">
                Código único para identificar el centro
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <Label className="text-[13px] font-medium">Centro activo</Label>
                <p className="text-xs text-[#6B7280]">
                  Si está pausado, los usuarios no podrán acceder a sus
                  documentos
                </p>
              </div>
              <Switch
                checked={formActive}
                onCheckedChange={setFormActive}
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
              disabled={!formName.trim() || !formCode.trim()}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm"
            >
              {editing ? 'Guardar cambios' : 'Crear centro'}
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
              ¿Eliminar centro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#6B7280] text-center">
              Se eliminarán todos los documentos y usuarios asociados a este
              centro. Esta acción no se puede deshacer.
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
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
