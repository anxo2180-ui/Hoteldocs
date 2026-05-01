import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  FileText,
  Loader2,
  ShieldCheck,
  Download,
  Sparkles,
  Eye,
  FileCheck,
  Paperclip,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Document, DocumentAttachment, Center } from '@/types'
import { getDocumentById, getAttachmentsByDocumentId, getCenters } from '@/data/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Extract centerIds from a document, supporting both old (centerId)
 *  and new (centerIds) shapes.                                         */
function getDocCenterIds(doc: any): string[] {
  if (doc.centerIds && Array.isArray(doc.centerIds)) return doc.centerIds
  if (doc.centerId) return [doc.centerId]
  return []
}

/* ------------------------------------------------------------------ */

export default function DocumentViewerPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null)
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [activeTab, setActiveTab] = useState('wiki')

  useEffect(() => {
    async function load() {
      if (!id) return
      const [doc, atts, allCenters] = await Promise.all([
        getDocumentById(id),
        getAttachmentsByDocumentId(id),
        getCenters(),
      ])
      if (doc) {
        setCurrentDoc(doc)
        setAttachments(atts)
        setCenters(allCenters)
      } else {
        toast.error('Documento no encontrado')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const signedAttachments = attachments.filter((a) => a.isSignedOriginal)
  const otherAttachments = attachments.filter((a) => !a.isSignedOriginal)

  const docCenterIds = getDocCenterIds(currentDoc)
  const docCenters = centers.filter((c) => docCenterIds.includes(c.id))
  const allCentersSelected = docCenterIds.length > 0 && docCenterIds.length === centers.length

  const handleDownloadWiki = () => {
    toast.info('Descarga como PDF disponible próximamente')
  }

  const handleDownloadSigned = (att: DocumentAttachment) => {
    const a = window.document.createElement('a')
    a.href = att.fileUrl
    a.download = att.fileName
    a.click()
    toast.success(`Descargando ${att.fileName}`)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando documento...
        </div>
      </div>
    )
  }

  if (!currentDoc) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-[#111827]">Documento no encontrado</h2>
          <p className="text-sm text-[#6B7280] mt-1">
            El documento que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-[#111827]">{currentDoc.title}</h1>
            {currentDoc.sourceType === 'pdf-import' && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                <Sparkles className="w-3 h-3 mr-1" />
                Conversión IA
              </Badge>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-3 mt-2 text-sm text-[#6B7280] flex-wrap">
            <Badge
              variant="outline"
              className={
                currentDoc.status === 'approved'
                  ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                  : currentDoc.status === 'draft'
                  ? 'text-gray-600 border-gray-300 bg-gray-50'
                  : currentDoc.status === 'pending'
                  ? 'text-amber-700 border-amber-300 bg-amber-50'
                  : 'text-red-700 border-red-300 bg-red-50'
              }
            >
              {currentDoc.status === 'approved' && 'Aprobado'}
              {currentDoc.status === 'draft' && 'Borrador'}
              {currentDoc.status === 'pending' && 'Pendiente'}
              {currentDoc.status === 'discontinued' && 'Descontinuado'}
            </Badge>
            <span>Versión {currentDoc.version}</span>
            {currentDoc.approvalDate && (
              <span>
                Aprobado el{' '}
                {new Date(currentDoc.approvalDate).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>

          {/* Hotels / Centers */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Building2 className="w-4 h-4 text-[#6B7280]" />
            {allCentersSelected ? (
              <span className="text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Aplica a todos los hoteles del cliente
              </span>
            ) : docCenters.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#6B7280] mr-1">Hoteles:</span>
                {docCenters.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]"
                  >
                    {c.code}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#9CA3AF]">Sin hoteles asignados</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-[#F3F4F6]">
          <TabsTrigger value="wiki" className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            Versión Wiki
          </TabsTrigger>
          <TabsTrigger value="signed" className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Versión Firmada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wiki" className="mt-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
            {/* Wiki toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="text-sm font-medium text-[#374151]">Contenido wiki</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadWiki}
                className="text-[#374151]"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar como PDF
              </Button>
            </div>
            {/* Rendered HTML */}
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none prose-headings:text-[#111827] prose-p:text-[#374151]"
                dangerouslySetInnerHTML={{ __html: currentDoc.content }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="signed" className="mt-4">
          <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
            {/* Signed toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-[#374151]">Versión certificada original</span>
              </div>
            </div>

            {signedAttachments.length > 0 ? (
              <div className="p-6 space-y-4">
                {signedAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-[#EF4444]" />
                      <div>
                        <p className="text-sm font-medium text-[#374151]">{att.fileName}</p>
                        <p className="text-xs text-[#9CA3AF]">PDF original certificado</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadSigned(att)}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar versión certificada
                    </Button>
                  </div>
                ))}

                {/* Watermark notice */}
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs text-amber-800">
                    Este documento es la versión firmada/certificada original. Cualquier descarga incluye marca de agua de trazabilidad interna.
                  </p>
                </div>

                {/* PDF Preview iframe */}
                <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                  <iframe
                    src={signedAttachments[0].fileUrl}
                    title="PDF preview"
                    className="w-full h-[600px]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <ShieldCheck className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">
                  No hay versión firmada asociada a este documento.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Other attachments */}
      {otherAttachments.length > 0 && (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-[#6B7280]" />
            Adjuntos adicionales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-3 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
              >
                <FileText className="w-4 h-4 text-[#6B7280] shrink-0" />
                <span className="text-sm text-[#374151] flex-1 truncate">{att.fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[#6B7280]"
                  onClick={() => handleDownloadSigned(att)}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
