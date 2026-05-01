import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Search,
  X,
  AlertTriangle,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { Topic, Document } from '@/types'
import {
  getTopics,
  getDocuments,
  createTopic,
  updateTopic,
  deleteTopic,
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

export default function AdminTopicsPage() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState<Topic[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Topic | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Topic | null>(null)

  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formOrder, setFormOrder] = useState(1)

  useEffect(() => {
    const auth = getAuthUser()
    if (!auth || auth.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    loadData()
  }, [navigate])

  async function loadData() {
    setLoading(true)
    const [t, d] = await Promise.all([getTopics(), getDocuments()])
    // Sort by orderIndex
    t.sort((a, b) => a.orderIndex - b.orderIndex)
    setTopics(t)
    setDocuments(d)
    setLoading(false)
  }

  const filtered = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  )

  function docCount(topicId: string): number {
    return documents.filter((d) => d.topicId === topicId).length
  }

  function openCreate() {
    setEditing(null)
    setFormName('')
    setFormDescription('')
    setFormOrder(topics.length + 1)
    setModalOpen(true)
  }

  function openEdit(topic: Topic) {
    setEditing(topic)
    setFormName(topic.name)
    setFormDescription(topic.description)
    setFormOrder(topic.orderIndex)
    setModalOpen(true)
  }

  async function handleSave() {
    const auth = getAuthUser()
    if (!formName.trim()) return

    if (editing) {
      const updated = await updateTopic(editing.id, {
        name: formName.trim(),
        description: formDescription.trim(),
        orderIndex: formOrder,
      })
      await addAuditLogEntry({
        userId: auth?.id ?? 'unknown',
        userName: auth?.name ?? 'Desconocido',
        action: 'UPDATED',
        entityType: 'topic',
        entityId: updated.id,
        details: `Actualizó el tema "${updated.name}"`,
      })
    } else {
      const created = await createTopic({
        name: formName.trim(),
        description: formDescription.trim(),
        orderIndex: formOrder,
      })
      await addAuditLogEntry({
        userId: auth?.id ?? 'unknown',
        userName: auth?.name ?? 'Desconocido',
        action: 'CREATED',
        entityType: 'topic',
        entityId: created.id,
        details: `Creó el tema "${created.name}"`,
      })
    }
    setModalOpen(false)
    loadData()
  }

  async function handleDelete() {
    if (!confirmDelete) return
    const auth = getAuthUser()
    await deleteTopic(confirmDelete.id)
    await addAuditLogEntry({
      userId: auth?.id ?? 'unknown',
      userName: auth?.name ?? 'Desconocido',
      action: 'DELETED',
      entityType: 'topic',
      entityId: confirmDelete.id,
      details: `Eliminó el tema "${confirmDelete.name}"`,
    })
    setConfirmDelete(null)
    loadData()
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
                Gestión de Temas
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Organiza los documentos por áreas de conocimiento
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-[0.98] transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Nuevo Tema
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                placeholder="Buscar tema por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-[#6B7280]">
                Cargando temas...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="w-12 h-12" />}
                title="No hay temas configurados"
                description="Crea tu primera temática para organizar los documentos"
                cta={
                  <Button
                    onClick={openCreate}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Crear tema
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
                      Descripción
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Orden
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Documentos
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
                    {filtered.map((topic) => (
                      <motion.tr
                        key={topic.id}
                        variants={rowVariant}
                        className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-[#2563EB] shrink-0" />
                            <span className="text-sm font-medium text-[#111827]">
                              {topic.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="text-sm text-[#6B7280] truncate block">
                            {topic.description || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block font-mono text-xs text-[#9CA3AF] bg-[#F3F4F6] rounded px-2 py-0.5">
                            {topic.orderIndex}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#111827]">
                            {docCount(topic.id)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(topic)}
                              className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                              aria-label="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setConfirmDelete(topic)}
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
        <DialogContent className="sm:max-w-[440px] p-0">
          <DialogHeader className="p-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-semibold">
              {editing ? 'Editar tema' : 'Nuevo tema'}
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
              <Label className="text-[13px] font-medium">Nombre</Label>
              <Input
                placeholder="Ej: Limpieza"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Descripción</Label>
              <Textarea
                rows={3}
                placeholder="Describe el contenido de esta temática..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-[#9CA3AF] text-right">
                {formDescription.length}/200
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium">Orden</Label>
              <Input
                type="number"
                min={1}
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
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
              disabled={!formName.trim()}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 text-sm"
            >
              {editing ? 'Guardar cambios' : 'Crear tema'}
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
              ¿Eliminar tema?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#6B7280] text-center">
              {docCount(confirmDelete?.id ?? '') > 0
                ? `Este tema tiene ${docCount(confirmDelete?.id ?? '')} documentos asociados. Eliminarlo no afectará los documentos, pero quedarán sin temática asignada.`
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
              Eliminar tema
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
