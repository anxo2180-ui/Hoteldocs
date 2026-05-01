import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Department } from '@/types'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, addAuditLogEntry } from '@/data/api'

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem('hoteldocs_auth') || '{}')
  } catch {
    return null
  }
}

export default function AdminDepartmentsPage() {
  const navigate = useNavigate()
  const auth = getAuth()

  if (!auth || !['master', 'clientAdmin', 'hotelAdmin'].includes(auth.role)) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const isMaster = auth.role === 'master'
  const clientId = auth.clientId

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const all = await getDepartments()
    // Filter by clientId unless master
    const filtered = isMaster ? all : all.filter((d) => d.clientId === clientId)
    setDepartments(filtered)
    setLoading(false)
  }

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditing(null)
    setFormName('')
    setFormCode('')
    setModalOpen(true)
  }

  function openEdit(dept: Department) {
    setEditing(dept)
    setFormName(dept.name)
    setFormCode(dept.code)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!formName.trim() || !formCode.trim()) {
      toast.error('Nombre y codigo son obligatorios')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateDepartment(editing.id, { name: formName.trim(), code: formCode.trim() })
        await addAuditLogEntry({
          userId: auth.id, userName: auth.name, action: 'ACTUALIZO',
          entityType: 'department', entityId: editing.id,
          details: `Actualizo departamento "${formName.trim()}"`,
        })
        toast.success('Departamento actualizado')
      } else {
        await createDepartment({
          clientId: clientId || 'client-1',
          name: formName.trim(),
          code: formCode.trim(),
        })
        await addAuditLogEntry({
          userId: auth.id, userName: auth.name, action: 'CREO',
          entityType: 'department', entityId: '',
          details: `Creo departamento "${formName.trim()}"`,
        })
        toast.success('Departamento creado')
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      toast.error('Error al guardar')
    }
    setSaving(false)
  }

  async function handleDelete(dept: Department) {
    if (!confirm(`Eliminar departamento "${dept.name}"?`)) return
    await deleteDepartment(dept.id)
    await addAuditLogEntry({
      userId: auth.id, userName: auth.name, action: 'ELIMINO',
      entityType: 'department', entityId: dept.id,
      details: `Elimino departamento "${dept.name}"`,
    })
    toast.success('Departamento eliminado')
    await load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Departamentos</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Crea y gestiona los departamentos de tu cadena hotelera
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo Departamento
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input placeholder="Buscar departamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-[#6B7280]">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">No hay departamentos</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Crear departamento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#111827]">{dept.name}</h3>
                    <Badge variant="outline" className="text-[11px] mt-0.5 bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]">
                      {dept.code}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded hover:bg-[#F3F4F6] text-[#6B7280]">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(dept)} className="p-1.5 rounded hover:bg-red-50 text-[#6B7280] hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-[#E5E7EB] shadow-lg w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#111827]">
                {editing ? 'Editar Departamento' : 'Nuevo Departamento'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-[#F3F4F6]">
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Nombre</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej: Cocina" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Codigo</label>
                <Input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="Ej: COC" maxLength={10} />
                <p className="text-xs text-[#6B7280] mt-1">Codigo corto para identificar el departamento</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#2563EB]">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
