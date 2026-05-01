import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  FileText,
} from 'lucide-react'
import type { Document, Topic, Center } from '@/types'
import {
  getDocuments,
  getTopics,
  getCenters,
  deleteDocument,
  toggleDocumentVisibility,
} from '@/data/api'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import LoadingState from '@/components/LoadingState'
import { toast, Toaster } from 'sonner'

function useAdminGuard() {
  const navigate = useNavigate()
  useEffect(() => {
    const raw = localStorage.getItem('hoteldocs_auth')
    const auth = raw ? (JSON.parse(raw) as { user?: { role?: string } }) : null
    const role = auth?.user?.role
    if (role && role !== 'admin') {
      navigate('/dashboard')
    }
  }, [navigate])
}

export default function AdminDocumentsPage() {
  useAdminGuard()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState<Document[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [centerFilter, setCenterFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [d, t, c] = await Promise.all([getDocuments(), getTopics(), getCenters()])
      setDocuments(d)
      setTopics(t)
      setCenters(c)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false
      if (topicFilter !== 'all' && doc.topicId !== topicFilter) return false
      if (centerFilter !== 'all' && !(doc.centerIds || []).includes(centerFilter)) return false
      return true
    })
  }, [documents, search, statusFilter, topicFilter, centerFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return
    await deleteDocument(id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    toast.success('Documento eliminado')
  }

  const handleToggleVisible = async (doc: Document) => {
    const updated = await toggleDocumentVisibility(doc.id, !doc.isVisible)
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)))
    toast.success(updated.isVisible ? 'Documento visible para usuarios' : 'Documento oculto')
  }

  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? '-'
  const centerName = (id: string) => centers.find((c) => c.id === id)?.name ?? '-'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="max-w-7xl mx-auto"
    >
      <Toaster position="bottom-right" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Documentos</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Gestiona todos los documentos del sistema</p>
        </div>
        <button
          onClick={() => navigate('/admin/documents/new/edit')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] transition-all duration-150 active:scale-[0.98] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-1"
        >
          <Plus className="w-4 h-4" />
          Nuevo Documento
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F3F4F6] transition-all"
          >
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-3"
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="discontinued">Descatalogado</option>
            </select>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
            >
              <option value="all">Todos los temas</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
            >
              <option value="all">Todos los centros</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingState text="Cargando documentos..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No hay documentos"
            description="No se encontraron documentos con los filtros seleccionados."
            cta={
              <button
                onClick={() => navigate('/admin/documents/new/edit')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Documento
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase font-medium">
                  <th className="text-left py-3 px-4">Título</th>
                  <th className="text-left py-3 px-4">Tema</th>
                  <th className="text-left py-3 px-4">Centro</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Fecha aprob.</th>
                  <th className="text-left py-3 px-4">Visible</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#111827]">{doc.title}</span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">{topicName(doc.topicId)}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{(doc.centerIds || []).map((cid: string) => centerName(cid)).join(', ')}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">
                      {doc.approvalDate ? new Date(doc.approvalDate).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.isVisible}
                          onChange={() => handleToggleVisible(doc)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                        />
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/documents/${doc.id}/edit`)}
                          className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#EF4444] transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
