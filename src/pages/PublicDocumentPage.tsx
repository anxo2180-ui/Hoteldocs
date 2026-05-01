import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Globe,
  Calendar,
  Hash,
  Download,
  Building2,
  ArrowLeft,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Document, DocumentAttachment } from '@/types'
import { getPublicDocumentById, getAttachmentsByDocumentId } from '@/data/api'

export default function PublicDocumentPage() {
  const { id } = useParams<{ id: string }>()
  const [document, setDocument] = useState<Document | null>(null)
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false)
        return
      }
      const doc = await getPublicDocumentById(id)
      if (doc) {
        setDocument(doc)
        const atts = await getAttachmentsByDocumentId(id)
        setAttachments(atts.filter((a) => a.isSignedOriginal))
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <FileText className="w-4 h-4 animate-spin" />
          Cargando documento...
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-[#111827]">
            Documento no disponible
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Este documento no es público o no existe. Es posible que necesites iniciar sesión para acceder a él.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.href = '/#/login'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ir al login
          </Button>
        </div>
      </div>
    )
  }

  const signedAttachments = attachments.filter((a) => a.isSignedOriginal)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#111827] text-sm">HotelDocs</span>
          </div>
          <Badge
            variant="outline"
            className="text-emerald-700 border-emerald-300 bg-emerald-50"
          >
            <Globe className="w-3 h-3 mr-1" />
            Documento Público
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title & Meta */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#111827] mb-3">
            {document.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
            <Badge
              variant="outline"
              className={
                document.status === 'approved'
                  ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                  : 'text-amber-700 border-amber-300 bg-amber-50'
              }
            >
              {document.status === 'approved' ? 'Aprobado' : document.status}
            </Badge>

            {document.approvalDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Aprobado: {new Date(document.approvalDate).toLocaleDateString('es-ES')}
              </span>
            )}

            {document.version && (
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                v{document.version}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {document.targetGroup === 'todos'
                ? 'Todos los departamentos'
                : `Dirigido a: ${document.targetGroup}`}
            </span>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-8">
          <div
            className="prose prose-sm max-w-none prose-headings:text-[#111827] prose-p:text-[#374151] prose-strong:text-[#111827] prose-li:text-[#374151]"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </div>

        {/* Signed Original Attachments */}
        {signedAttachments.length > 0 && (
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[#111827] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6B7280]" />
              Versión certificada (PDF firmado)
            </h3>

            <div className="space-y-3">
              {signedAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-md p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#2563EB]" />
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{att.fileName}</p>
                      <p className="text-xs text-[#6B7280]">Documento original certificado</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => {
                      const a = window.document.createElement('a')
                      a.href = att.fileUrl
                      a.download = att.fileName
                      a.click()
                      toast.success('Descargando versión certificada...')
                    }}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#6B7280] mt-3">
              Este PDF es la versión certificada original. La versión wiki mostrada arriba es una conversión digital editable.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#E5E7EB] text-center">
          <p className="text-xs text-[#9CA3AF]">
            HotelDocs — Sistema de gestión documental para hoteles
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Documento de acceso público. Para más información, contacte con administración.
          </p>
        </div>
      </main>
    </motion.div>
  )
}
