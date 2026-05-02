import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Eye,
  Download,
  Pencil,
  FileText,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react'
import { getDocuments, getDocumentsForUser, getTopics, getCenters, getDepartmentsByClient, updateDocument } from '@/data/api'
import type { Document, Topic, Center, User, Department } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

interface AuthData {
  id: string
  email: string
  name: string
  role: 'master' | 'clientAdmin' | 'hotelAdmin' | 'user'
  clientId: string
  centerIds: string[]
  departmentId: string | null
}

function getAuth(): AuthData | null {
  const raw = localStorage.getItem('hoteldocs_auth')
  if (!raw || raw === 'null' || raw === 'undefined') return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.id) return null
    return parsed as AuthData
  } catch {
    return null
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const statusOrder: Record<string, number> = {
  approved: 0,
  pending: 1,
  discontinued: 2,
  draft: 3,
}

const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
} as const

export default function DocumentsPage() {
  const navigate = useNavigate()
  const auth = getAuth()
  const isAdmin = ['master', 'clientAdmin', 'hotelAdmin'].includes(auth?.role || '')

  const [docs, setDocs] = useState<Document[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [centerFilter, setCenterFilter] = useState('')
  const [onlyApprovedVisible, setOnlyApprovedVisible] = useState(false)
  const [deptFilter, setDeptFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      navigate('/login', { replace: true })
      return
    }
    async function load() {
      try {
        // Get current user for permission filtering
        const authData = getAuth()
        const docsPromise = isAdmin ? getDocuments() : getDocumentsForUser(authData as unknown as User)
        const clientId = auth?.clientId
        const [d, t, c, depts] = await Promise.all([
          docsPromise,
          getTopics(),
          getCenters(),
          clientId ? getDepartmentsByClient(clientId) : Promise.resolve([]),
        ])
        setDocs(d)
        setTopics(t)
        setCenters(c)
        setDepartments(depts)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [auth, navigate])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const filteredDocs = useMemo(() => {
    let list = [...docs]

    // User permission filtering is now handled by getDocumentsForUser
    // Additional frontend filters below

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((d) => d.title.toLowerCase().includes(q))
    }

    if (topicFilter) {
      list = list.filter((d) => d.topicId === topicFilter)
    }

    if (centerFilter) {
      list = list.filter((d) => (d.centerIds || []).includes(centerFilter))
    }

    if (deptFilter) {
      list = list.filter((d) => d.departmentId === deptFilter)
    }

    if (visibilityFilter) {
      list = list.filter((d) => d.visibility === visibilityFilter)
    }

    if (onlyApprovedVisible) {
      list = list.filter((d) => d.status === 'approved' && d.isVisible)
    }

    // Sort: approved first, then pending, discontinued, draft. Within group: alphabetical
    list.sort((a, b) => {
      const ordA = statusOrder[a.status] ?? 99
      const ordB = statusOrder[b.status] ?? 99
      if (ordA !== ordB) return ordA - ordB
      return a.title.localeCompare(b.title)
    })

    return list
  }, [docs, search, topicFilter, centerFilter, deptFilter, visibilityFilter, onlyApprovedVisible, isAdmin, auth, departments])

  const handleToggleVisible = async (doc: Document) => {
    try {
      const updated = await updateDocument(doc.id, { isVisible: !doc.isVisible })
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      setToast('Visibilidad actualizada')
    } catch {
      setToast('Error al actualizar visibilidad')
    }
  }

  const hasActiveFilters =
    search.trim() || topicFilter || centerFilter || deptFilter || visibilityFilter || onlyApprovedVisible

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {}
    topics.forEach((t) => (map[t.id] = t.name))
    return map
  }, [topics])

  const centerMap = useMemo(() => {
    const map: Record<string, string> = {}
    centers.forEach((c) => (map[c.id] = c.name))
    return map
  }, [centers])

  const clearFilters = () => {
    setSearch('')
    setTopicFilter('')
    setCenterFilter('')
    setDeptFilter('')
    setVisibilityFilter('')
    setOnlyApprovedVisible(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return (
    <div className="pt-2 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#111827] text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Documentos</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Gestiona y consulta todos los manuales y procedimientos
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/documents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] active:scale-[0.98] transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            Nuevo documento
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="mt-4 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-[260px] pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
          />
        </div>

        {/* Topic filter */}
        <div className="relative">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white transition-all cursor-pointer"
          >
            <option value="">Todos los temas</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* Center filter (admin only) */}
        {isAdmin && (
          <div className="relative">
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white transition-all cursor-pointer"
            >
              <option value="">Todos los centros</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        )}

        {/* Department filter */}
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white transition-all cursor-pointer"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* Visibility filter */}
        <div className="relative">
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white transition-all cursor-pointer"
          >
            <option value="">Todas las visibilidades</option>
            <option value="private">Privado</option>
            <option value="all">Todos los usuarios</option>
            <option value="public">Público QR</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* Toggle approved visible */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <div
            className={`relative w-10 h-5 rounded-full transition-colors ${
              onlyApprovedVisible ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'
            }`}
            onClick={() => setOnlyApprovedVisible(!onlyApprovedVisible)}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                onlyApprovedVisible ? 'translate-x-5' : ''
              }`}
            />
          </div>
          <span className="text-sm text-[#374151]">Solo aprobados en vigor</span>
        </label>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </motion.div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
              Buscar: {search}
              <button onClick={() => setSearch('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {topicFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
              Tema: {topicMap[topicFilter] || topicFilter}
              <button onClick={() => setTopicFilter('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {centerFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
              Centro: {centerMap[centerFilter] || centerFilter}
              <button onClick={() => setCenterFilter('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {deptFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
              Dept: {departments.find(d => d.id === deptFilter)?.name || deptFilter}
              <button onClick={() => setDeptFilter('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {visibilityFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
              Visibilidad: {visibilityFilter === 'private' ? 'Privado' : visibilityFilter === 'all' ? 'Todos' : 'Público QR'}
              <button onClick={() => setVisibilityFilter('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {onlyApprovedVisible && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded">
              Solo visibles
              <button onClick={() => setOnlyApprovedVisible(false)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Document list */}
      <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {filteredDocs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No hay documentos"
            description={
              hasActiveFilters
                ? 'Prueba ajustando los filtros'
                : 'Empieza creando un nuevo documento'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-[#F9FAFB] text-left">
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase w-[280px]">
                    Título
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                    Tema
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                    Centro
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                    Fecha apr.
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                    Dept
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                    Visibilidad
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                    Estado
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">
                      Visible
                    </th>
                  )}
                  <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-medium text-[#111827] truncate max-w-[240px]">
                        {doc.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                        {topicMap[doc.topicId] || doc.topicId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {(doc.centerIds || []).map((cid: string) => centerMap[cid] || cid).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">
                      {formatDate(doc.approvalDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                        {departments.find(d => d.id === doc.departmentId)?.name || '- '}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        doc.visibility === 'public'
                          ? 'bg-emerald-50 text-emerald-700'
                          : doc.visibility === 'all'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {doc.visibility === 'public' ? 'Público QR' : doc.visibility === 'all' ? 'Todos' : 'Privado'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={doc.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleVisible(doc)}
                          className={`w-8 h-4 rounded-full transition-colors relative ${
                            doc.isVisible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'
                          }`}
                          aria-label={doc.isVisible ? 'Ocultar documento' : 'Mostrar documento'}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${
                              doc.isVisible ? 'translate-x-4' : ''
                            }`}
                          />
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          className="p-1.5 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                          aria-label="Ver documento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setToast('Descargando... se añadirá marca de agua')
                          }}
                          className="p-1.5 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                          aria-label="Descargar documento"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/admin/documents/${doc.id}/edit`)}
                            className="p-1.5 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                            aria-label="Editar documento"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
