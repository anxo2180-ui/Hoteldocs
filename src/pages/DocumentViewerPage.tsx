import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Building2,
  Calendar,
  Hash,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { getDocumentById, getDocuments, getTopics, getCenters, getUsers } from '@/data/api'
import type { Document, Topic, Center, User as UserType } from '@/types'
import StatusBadge from '@/components/StatusBadge'

interface AuthData {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  centerId: string
}

function getAuth(): AuthData | null {
  const raw = localStorage.getItem('hoteldocs_auth')
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthData
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

export default function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const auth = getAuth()
  const isAdmin = auth?.role === 'admin'

  const [doc, setDoc] = useState<Document | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      navigate('/login', { replace: true })
      return
    }
    async function load() {
      try {
        const [d, allDocs, t, c, u] = await Promise.all([
          getDocumentById(id ?? ''),
          getDocuments(),
          getTopics(),
          getCenters(),
          getUsers(),
        ])
        setDoc(d)
        setDocs(allDocs)
        setTopics(t)
        setCenters(c)
        setUsers(u)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, auth, navigate])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const topicMap = useMemo(() => {
    const map: Record<string, Topic> = {}
    topics.forEach((t) => (map[t.id] = t))
    return map
  }, [topics])

  const centerMap = useMemo(() => {
    const map: Record<string, string> = {}
    centers.forEach((c) => (map[c.id] = c.name))
    return map
  }, [centers])

  const userMap = useMemo(() => {
    const map: Record<string, string> = {}
    users.forEach((u) => (map[u.id] = u.name))
    return map
  }, [users])

  // Prev/Next in same topic
  const { prevDoc, nextDoc } = useMemo(() => {
    if (!doc) return { prevDoc: null as Document | null, nextDoc: null as Document | null }
    const topicDocs = docs
      .filter((d) => d.topicId === doc.topicId)
      .sort((a, b) => a.title.localeCompare(b.title))
    const idx = topicDocs.findIndex((d) => d.id === doc.id)
    return {
      prevDoc: idx > 0 ? topicDocs[idx - 1] : null,
      nextDoc: idx < topicDocs.length - 1 ? topicDocs[idx + 1] : null,
    }
  }, [doc, docs])

  const handleDownload = () => {
    setToast('Descargando... se añadirá marca de agua')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="pt-6 text-center">
        <FileText className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
        <h2 className="text-lg font-medium text-[#111827]">Documento no encontrado</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          El documento que buscas no existe o ha sido eliminado.
        </p>
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a documentos
        </Link>
      </div>
    )
  }

  const topic = topicMap[doc.topicId]
  const authorName = userMap[doc.createdBy] || 'Desconocido'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-2 pb-10"
    >
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#111827] text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#6B7280]">
        <Link to="/documents" className="text-[#2563EB] hover:underline">
          Documentos
        </Link>
        <span>/</span>
        {topic && (
          <>
            <Link
              to={`/documents?topic=${topic.id}`}
              className="text-[#2563EB] hover:underline"
            >
              {topic.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#111827] font-medium truncate max-w-[280px]">{doc.title}</span>
      </nav>

      {/* Header Card */}
      <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={doc.status} />
            {topic && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                {topic.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to={`/admin/documents/${doc.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] text-[#111827] text-sm font-medium border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                Editar
              </Link>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                setToast('Enlace copiado al portapapeles')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#6B7280] text-sm font-medium rounded-md hover:bg-[#F3F4F6] active:scale-[0.98] transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Compartir
            </button>
          </div>
        </div>

        <h1 className="mt-3 text-[22px] font-semibold text-[#111827]">
          {doc.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280]">
            <Building2 className="w-4 h-4" />
            {centerMap[doc.centerId] || doc.centerId}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280]">
            <Calendar className="w-4 h-4" />
            Aprobado: {formatDate(doc.approvalDate)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] font-mono">
            <Hash className="w-4 h-4" />
            v{doc.version}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280]">
            <User className="w-4 h-4" />
            {authorName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 max-w-[840px]">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="mt-6 max-w-[840px]">
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-medium text-[#111827]">Archivos adjuntos</h3>
          </div>
          <div className="px-4 py-6 text-center text-sm text-[#9CA3AF]">
            No hay archivos adjuntos
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 max-w-[840px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {prevDoc && (
            <button
              onClick={() => navigate(`/documents/${prevDoc.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="max-w-[160px] truncate">{prevDoc.title}</span>
            </button>
          )}
        </div>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F3F4F6] text-[#111827] text-sm font-medium border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="flex items-center gap-2">
          {nextDoc && (
            <button
              onClick={() => navigate(`/documents/${nextDoc.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-all"
            >
              <span className="max-w-[160px] truncate">{nextDoc.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
