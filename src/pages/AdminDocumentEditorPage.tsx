import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  X,
  Check,
  Loader2,
  Sparkles,
  Save,
  ArrowLeft,
  ShieldCheck,
  Paperclip,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Document, DocumentAttachment, Topic, Center, DocumentVisibility } from '@/types'
import {
  getDocumentById,
  createDocument,
  updateDocument,
  getTopics,
  getCenters,
  getAttachmentsByDocumentId,
  createAttachment,
  addAuditLogEntry,
  uploadPDFAndConvert,
} from '@/data/api'
import { extractTextFromPDF } from '@/services/pdfExtractor'
import { convertPDFToWikiWithSteps, type ConversionStep } from '@/services/aiConverter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminDocumentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const isEdit = !isNew && !!id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const auth = JSON.parse(localStorage.getItem('hoteldocs_auth') || '{}')
  const [topics, setTopics] = useState<Topic[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [departments] = useState<{id: string; name: string; code: string; clientId: string}[]>([])
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([])

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topicId, setTopicId] = useState('')
  const [centerIds, setCenterIds] = useState<string[]>([])
  const [status, setStatus] = useState<Document['status']>('draft')
  const [isVisible, setIsVisible] = useState(false)
  const [departmentId, setDepartmentId] = useState<string>('')
  const [visibility, setVisibility] = useState<DocumentVisibility>('private')
  const [sourceType, setSourceType] = useState<Document['sourceType']>('manual')

  // PDF import state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfImporting, setPdfImporting] = useState(false)
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([])
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const [t, c] = await Promise.all([getTopics(), getCenters()])
      setTopics(t)
      setCenters(c)
      if (isEdit && id) {
        const doc = await getDocumentById(id)
        if (doc) {
          setTitle(doc.title)
          setContent(doc.content)
          setTopicId(doc.topicId)
          setCenterIds(doc.centerIds)
          setStatus(doc.status)
          setIsVisible(doc.isVisible)
          setDepartmentId(doc.departmentId ?? '')
          setVisibility(doc.visibility)
          setSourceType(doc.sourceType)
          const atts = await getAttachmentsByDocumentId(id)
          setAttachments(atts)
        } else {
          toast.error('Documento no encontrado')
          navigate('/admin/documents')
        }
      }
      setLoading(false)
    }
    load()
  }, [id, isEdit, navigate])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('El título es obligatorio')
      return
    }
    if (!topicId || centerIds.length === 0) {
      toast.error('Selecciona un tema y un centro')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        const newDoc = await createDocument({
          title,
          content,
          topicId,
          centerIds,
          clientId: auth?.clientId ?? null,
          departmentId,
          visibility,
          status,
          version: 1,
          approvalDate: null,
          isVisible,
          createdBy: 'user-1',
          sourceType,
        })
        // Save any pending PDF as attachment
        if (pdfFile) {
          const fileUrl = URL.createObjectURL(pdfFile)
          await createAttachment({
            documentId: newDoc.id,
            fileName: pdfFile.name,
            fileUrl,
            fileType: pdfFile.type || 'application/pdf',
            isSignedOriginal: true,
          })
        }
        await addAuditLogEntry({
          userId: 'user-1',
          userName: 'Carlos Administrador',
          action: 'CREATED',
          entityType: 'document',
          entityId: newDoc.id,
          details: `Creó el documento "${title}"`,
        })
        toast.success('Documento creado')
        navigate(`/admin/documents/${newDoc.id}/edit`)
      } else if (id) {
        await updateDocument(id, {
          title,
          content,
          topicId,
          centerIds,
          departmentId,
          visibility,
          status,
          isVisible,
          sourceType,
        })
        toast.success('Documento actualizado')
      }
    } catch (e) {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      await processPDFFile(file)
    } else if (file) {
      toast.error('Solo se permiten archivos PDF')
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      await processPDFFile(file)
    } else if (file) {
      toast.error('Solo se permiten archivos PDF')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function processPDFFile(file: File) {
    setPdfFile(file)
    setPdfImporting(true)
    setShowConversionModal(true)
    setConversionSteps([
      { label: 'Extrayendo texto del PDF...', status: 'pending' },
      { label: 'Analizando estructura del documento...', status: 'pending' },
      { label: 'Generando contenido wiki...', status: 'pending' },
    ])
    try {
      const text = await extractTextFromPDF(file)
      const html = await convertPDFToWikiWithSteps(text, setConversionSteps)
      setGeneratedHtml(html)
    } catch (err) {
      toast.error('Error al procesar el PDF')
      setShowConversionModal(false)
      setPdfFile(null)
    } finally {
      setPdfImporting(false)
    }
  }

  const acceptGeneratedContent = () => {
    setContent(generatedHtml)
    setTitle(pdfFile?.name.replace(/\.pdf$/i, '') || title)
    setSourceType('pdf-import')
    setShowConversionModal(false)
    toast.success('Contenido importado en el editor')
  }

  const rejectGeneratedContent = () => {
    setGeneratedHtml('')
    setShowConversionModal(false)
  }

  const removePdfFile = () => {
    setPdfFile(null)
    setGeneratedHtml('')
  }

  const runFullPDFImport = async () => {
    if (!pdfFile) return
    if (!topicId || centerIds.length === 0) {
      toast.error('Selecciona tema y centro antes de importar')
      return
    }
    setSaving(true)
    try {
      const result = await uploadPDFAndConvert(pdfFile, {
        title: title || pdfFile.name.replace(/\.pdf$/i, ''),
        topicId,
        centerIds,
        clientId: auth?.clientId ?? null,
        createdBy: 'user-1',
        status,
      })
      toast.success('PDF importado y documento creado con éxito')
      navigate(`/admin/documents/${result.id}/edit`)
    } catch (e) {
      toast.error('Error al importar PDF')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/documents')}
          className="text-[#6B7280]"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-semibold text-[#111827]">
          {isNew ? 'Nuevo Documento' : 'Editar Documento'}
        </h1>
        {sourceType === 'pdf-import' && (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
            <Sparkles className="w-3 h-3 mr-1" />
            Conversión IA
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del documento"
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Tema</label>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccionar tema" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Hoteles ({centerIds.length})</label>
              <div className="border border-[#E5E7EB] rounded-md p-2 bg-white max-h-40 overflow-y-auto">
                {centers.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 py-1 px-1 hover:bg-[#F9FAFB] rounded cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={centerIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCenterIds([...centerIds, c.id])
                        } else {
                          setCenterIds(centerIds.filter((id) => id !== c.id))
                        }
                      }}
                      className="rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-[#374151]">{c.name}</span>
                    <span className="text-[10px] text-[#9CA3AF] ml-auto">{c.code}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Estado</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as Document['status'])}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB]"
                />
                Visible para usuarios
              </label>
            </div>
          </div>

          {/* Target Group & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Departamento</label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Visibilidad</label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v as DocumentVisibility)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privado (requiere login)</SelectItem>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="public">Público QR (sin login)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {visibility === 'public' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm text-emerald-800">
              <strong>Documento Público:</strong> Este documento será accesible públicamente mediante QR sin necesidad de inicio de sesión. Úsalo para protocolos generales, normas de seguridad o información que todos los empleados necesiten consultar.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Contenido HTML
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h1>Título</h1><p>Contenido del documento...</p>"
              rows={16}
              className="bg-white font-mono text-sm"
            />
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Escribe HTML directamente o importa desde un PDF.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </Button>
            {isNew && pdfFile && (
              <Button
                variant="outline"
                onClick={runFullPDFImport}
                disabled={saving}
                className="border-[#2563EB] text-[#2563EB]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Importar PDF y Crear Documento
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar: PDF import + attachments */}
        <div className="space-y-5">
          {/* PDF Import */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#2563EB]" />
              Importar desde PDF
            </h3>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${dragActive ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF]'}
              `}
            >
              <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
              <p className="text-sm text-[#374151] font-medium">
                Arrastra un PDF aquí
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                o haz clic para seleccionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {pdfFile && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2">
                <FileText className="w-4 h-4 text-[#EF4444]" />
                <span className="text-sm text-[#374151] flex-1 truncate">{pdfFile.name}</span>
                <button
                  onClick={removePdfFile}
                  className="p-1 rounded hover:bg-[#F3F4F6] text-[#9CA3AF]"
                  title="Quitar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {pdfFile && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm border-[#2563EB] text-[#2563EB]"
                  onClick={() => processPDFFile(pdfFile)}
                  disabled={pdfImporting}
                >
                  {pdfImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {pdfImporting ? 'Procesando...' : 'Convertir a Wiki con IA'}
                </Button>
              </div>
            )}

            <p className="mt-3 text-xs text-[#9CA3AF] leading-relaxed">
              La IA extrae el texto del PDF y lo convierte en contenido wiki estructurado.
              El PDF original se guardará como versión firmada.
            </p>
          </div>

          {/* Attachments */}
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#6B7280]" />
              Adjuntos
            </h3>

            {attachments.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">No hay adjuntos</p>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2"
                  >
                    <FileText className="w-4 h-4 text-[#6B7280] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#374151] truncate">{att.fileName}</p>
                      {att.isSignedOriginal && (
                        <Badge
                          variant="outline"
                          className="mt-1 text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-700 bg-emerald-50"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Original Firmado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show signed original note */}
            {attachments.some((a) => a.isSignedOriginal) && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-800">
                  Versión firmada disponible para descarga
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Conversion Modal */}
      <Dialog open={showConversionModal} onOpenChange={setShowConversionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              Conversión IA de PDF a Wiki
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Steps */}
            <div className="space-y-2">
              {conversionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 border ${
                    step.status === 'done'
                      ? 'border-emerald-200 bg-emerald-50'
                      : step.status === 'running'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      step.status === 'done'
                        ? 'bg-emerald-500 text-white'
                        : step.status === 'running'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#E5E7EB] text-[#9CA3AF]'
                    }`}
                  >
                    {step.status === 'done' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : step.status === 'running' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.status === 'done'
                        ? 'text-emerald-800'
                        : step.status === 'running'
                        ? 'text-blue-800'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Preview */}
            {generatedHtml && (
              <div>
                <p className="text-sm font-semibold text-[#374151] mb-2">Vista previa del resultado</p>
                <div className="rounded-md border border-[#E5E7EB] bg-white p-4 max-h-64 overflow-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={rejectGeneratedContent}>
                Cancelar
              </Button>
              <Button
                onClick={acceptGeneratedContent}
                disabled={!generatedHtml || pdfImporting}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Usar este contenido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
