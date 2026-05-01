import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  X,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Undo,
  Redo,
  Upload,
  Trash2,
  FileText,
  Bell,
  ChevronLeft,
  Save,
} from 'lucide-react'
import type { Document, Topic, Center } from '@/types'
import {
  getDocumentById,
  getTopics,
  getCenters,
  createDocument,
  updateDocument,
  addAuditLogEntry,
  getAlarms,
  createAlarm,
} from '@/data/api'
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

function getCurrentUser() {
  const raw = localStorage.getItem('hoteldocs_auth')
  if (!raw) return { id: 'user-1', name: 'Carlos Administrador', role: 'admin' }
  const auth = JSON.parse(raw) as { user?: { id?: string; name?: string; role?: string } }
  return {
    id: auth?.user?.id ?? 'user-1',
    name: auth?.user?.name ?? 'Carlos Administrador',
    role: auth?.user?.role ?? 'admin',
  }
}

/* ------------------------------------------------------------------ */
/*  Rich Text Toolbar                                                  */
/* ------------------------------------------------------------------ */
function RichTextToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const exec = useCallback(
    (cmd: string, val?: string) => {
      document.execCommand(cmd, false, val)
      editorRef.current?.focus()
    },
    [editorRef]
  )

  const btn = (icon: React.ReactNode, title: string, onClick: () => void) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#E5E7EB] active:bg-[#D1D5DB] text-[#6B7280] transition-colors"
    >
      {icon}
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
      {btn(<Bold className="w-4 h-4" />, 'Negrita', () => exec('bold'))}
      {btn(<Italic className="w-4 h-4" />, 'Cursiva', () => exec('italic'))}
      <div className="w-px h-5 bg-[#E5E7EB] mx-1" />
      {btn(<Heading1 className="w-4 h-4" />, 'Título 1', () => exec('formatBlock', 'H1'))}
      {btn(<Heading2 className="w-4 h-4" />, 'Título 2', () => exec('formatBlock', 'H2'))}
      {btn(<Heading3 className="w-4 h-4" />, 'Título 3', () => exec('formatBlock', 'H3'))}
      <div className="w-px h-5 bg-[#E5E7EB] mx-1" />
      {btn(<List className="w-4 h-4" />, 'Lista', () => exec('insertUnorderedList'))}
      {btn(<ListOrdered className="w-4 h-4" />, 'Lista numerada', () => exec('insertOrderedList'))}
      <div className="w-px h-5 bg-[#E5E7EB] mx-1" />
      {btn(<Link className="w-4 h-4" />, 'Enlace', () => {
        const url = prompt('URL del enlace:')
        if (url) exec('createLink', url)
      })}
      {btn(<Quote className="w-4 h-4" />, 'Cita', () => exec('formatBlock', 'BLOCKQUOTE'))}
      {btn(<Code className="w-4 h-4" />, 'Código', () => exec('formatBlock', 'PRE'))}
      <div className="w-px h-5 bg-[#E5E7EB] mx-1" />
      {btn(<Undo className="w-4 h-4" />, 'Deshacer', () => exec('undo'))}
      {btn(<Redo className="w-4 h-4" />, 'Rehacer', () => exec('redo'))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDocumentEditorPage() {
  useAdminGuard()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isCreate = id === 'new'

  const [loading, setLoading] = useState(!isCreate)
  const [topics, setTopics] = useState<Topic[]>([])
  const [centers, setCenters] = useState<Center[]>([])

  /* Form state */
  const [title, setTitle] = useState('')
  const [topicId, setTopicId] = useState('')
  const [centerId, setCenterId] = useState('')
  const [status, setStatus] = useState<Document['status']>('draft')
  const [approvalDate, setApprovalDate] = useState('')
  const [version, setVersion] = useState('1.0')
  const [isVisible, setIsVisible] = useState(false)
  const [content, setContent] = useState('<p>Empieza a escribir el contenido de tu documento...</p>')
  const [abstract, setAbstract] = useState('')

  /* Attachments */
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; url: string }[]>([])

  /* Alarm section inside editor */
  const [alarmDate, setAlarmDate] = useState('')
  const [alarmRecipients, setAlarmRecipients] = useState('')
  const [alarmMessage, setAlarmMessage] = useState('')
  const [showAlarmSection, setShowAlarmSection] = useState(false)

  /* UI state */
  const [previewOpen, setPreviewOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Load data */
  useEffect(() => {
    async function load() {
      const [t, c, a] = await Promise.all([getTopics(), getCenters(), getAlarms()])
      setTopics(t)
      setCenters(c)

      if (!isCreate && id) {
        const doc = await getDocumentById(id)
        if (doc) {
          setTitle(doc.title)
          setTopicId(doc.topicId)
          setCenterId(doc.centerId)
          setStatus(doc.status)
          setVersion(String(doc.version))
          setIsVisible(doc.isVisible)
          setContent(doc.content || '<p>Empieza a escribir...</p>')
          setAbstract('')
          if (doc.approvalDate) {
            setApprovalDate(new Date(doc.approvalDate).toISOString().split('T')[0])
          }
          const docAlarms = a.filter((al) => al.documentId === doc.id)
          if (docAlarms.length > 0) {
            setShowAlarmSection(true)
            const al = docAlarms[0]
            setAlarmDate(new Date(al.reminderDate).toISOString().slice(0, 16))
            setAlarmRecipients(al.emailRecipients.join(', '))
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [id, isCreate])

  /* Auto-save draft to localStorage every 30s */
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDirty) return
      const draft = {
        title,
        topicId,
        centerId,
        status,
        approvalDate,
        version,
        isVisible,
        content,
        abstract,
        alarmDate,
        alarmRecipients,
        alarmMessage,
      }
      localStorage.setItem(`hoteldocs_draft_${id ?? 'new'}`, JSON.stringify(draft))
      setLastSaved(new Date().toLocaleTimeString('es-ES'))
      toast.success('Guardado automático', { duration: 2000 })
      setIsDirty(false)
    }, 30000)
    return () => clearInterval(timer)
  }, [isDirty, title, topicId, centerId, status, approvalDate, version, isVisible, content, abstract, alarmDate, alarmRecipients, alarmMessage, id])

  /* Track dirty state */
  const markDirty = useCallback(() => setIsDirty(true), [])

  /* Handle save */
  const handleSave = async () => {
    if (!title.trim() || !topicId || !centerId) {
      toast.error('Título, temática y centro son obligatorios')
      return
    }
    const user = getCurrentUser()
    const payload = {
      title: title.trim(),
      content,
      topicId,
      centerId,
      status,
      version: parseFloat(version) || 1,
      approvalDate: status === 'approved' ? (approvalDate ? new Date(approvalDate).toISOString() : new Date().toISOString()) : null,
      isVisible,
      createdBy: user.id,
    }

    let doc: Document
    if (isCreate) {
      doc = await createDocument(payload)
      await addAuditLogEntry({
        userId: user.id,
        userName: user.name,
        action: 'CREATED',
        entityType: 'document',
        entityId: doc.id,
        details: `Creó el documento "${doc.title}"`,
      })
      toast.success('Documento creado')
    } else if (id) {
      doc = await updateDocument(id, payload)
      await addAuditLogEntry({
        userId: user.id,
        userName: user.name,
        action: 'UPDATED',
        entityType: 'document',
        entityId: doc.id,
        details: `Editó el documento "${doc.title}"`,
      })
      toast.success('Documento actualizado')
    } else {
      return
    }

    /* Save alarm if configured */
    if (showAlarmSection && alarmDate) {
      const recipients = alarmRecipients
        .split(/[\n,]/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
      if (recipients.length > 0) {
        await createAlarm({
          documentId: doc.id,
          documentTitle: doc.title,
          reminderDate: new Date(alarmDate).toISOString(),
          emailRecipients: recipients,
          isTriggered: false,
        })
      }
    }

    setIsDirty(false)
    navigate('/admin/documents')
  }

  /* Handle file upload simulation */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      setAttachments((prev) => [
        ...prev,
        {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          url,
        },
      ])
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
    markDirty()
  }

  const removeAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId))
    markDirty()
  }

  const statusOptions: { value: Document['status']; label: string; color: string }[] = [
    { value: 'draft', label: 'Borrador', color: '#6B7280' },
    { value: 'pending', label: 'Pendiente', color: '#F59E0B' },
    { value: 'approved', label: 'Aprobado', color: '#10B981' },
    { value: 'discontinued', label: 'Descatalogado', color: '#EF4444' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="max-w-4xl mx-auto pb-24"
    >
      <Toaster position="bottom-right" />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/documents')}
            className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a documentos
          </button>
          <h1 className="text-2xl font-semibold text-[#111827]">
            {isCreate ? 'Nuevo documento' : 'Editar documento'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F3F4F6] transition-all"
          >
            <Eye className="w-4 h-4" />
            Previsualizar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1D4ED8] transition-all active:scale-[0.98] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-1"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={() => navigate('/admin/documents')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F3F4F6] transition-all"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-[#111827] border-b border-[#E5E7EB] pb-3 mb-4">
          Información del documento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Título del manual o procedimiento..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); markDirty() }}
              className="w-full text-xl font-medium text-[#111827] placeholder:text-[#9CA3AF] border-b border-[#E5E7EB] pb-2 focus:border-[#2563EB] outline-none bg-transparent transition-colors"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1">Temática</label>
            <select
              value={topicId}
              onChange={(e) => { setTopicId(e.target.value); markDirty() }}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
            >
              <option value="">Seleccionar tema...</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Center */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1">Centro</label>
            <select
              value={centerId}
              onChange={(e) => { setCenterId(e.target.value); markDirty() }}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
            >
              <option value="">Seleccionar centro...</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1">Estado del documento</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => { setStatus(s.value); markDirty() }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-all ${
                    status === s.value
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                      : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Approval date */}
          {status === 'approved' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <label className="block text-[13px] font-medium text-[#111827] mb-1">Fecha de aprobación</label>
              <input
                type="date"
                value={approvalDate}
                onChange={(e) => { setApprovalDate(e.target.value); markDirty() }}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
              />
            </motion.div>
          )}

          {/* Version */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1">Versión</label>
            <input
              type="text"
              value={version}
              onChange={(e) => { setVersion(e.target.value); markDirty() }}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
            />
            <p className="mt-1 text-xs text-[#9CA3AF]">Formato: v[major].[minor]</p>
          </div>

          {/* Visibility */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => { setIsVisible(e.target.checked); markDirty() }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#E5E7EB] peer-checked:bg-[#2563EB] rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-[#111827]">
                  {isVisible ? 'Sí, mostrar a usuarios' : 'No, solo administradores'}
                </span>
                <p className="text-xs text-[#9CA3AF]">Los usuarios solo pueden ver documentos aprobados y visibles</p>
              </div>
            </label>
          </div>

          {/* Abstract */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-[#111827] mb-1">Resumen / Abstract</label>
            <textarea
              rows={3}
              placeholder="Breve descripción del contenido del documento..."
              value={abstract}
              onChange={(e) => { setAbstract(e.target.value); markDirty() }}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#111827]">Contenido del documento</h2>
        </div>
        <RichTextToolbar editorRef={editorRef} />
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            setContent(e.currentTarget.innerHTML)
            markDirty()
          }}
          dangerouslySetInnerHTML={{ __html: content }}
          className="min-h-[400px] p-6 text-[15px] leading-relaxed text-[#111827] outline-none prose prose-sm max-w-none"
          style={{ lineHeight: 1.7 }}
        />
      </div>

      {/* Attachments */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-medium text-[#111827]">Archivos adjuntos (PDFs)</h2>
        </div>
        <div className="p-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D1D5DB] rounded-lg p-6 bg-[#F9FAFB] text-center cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all"
          >
            <Upload className="w-6 h-6 text-[#9CA3AF] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">Arrastra PDFs aquí o haz clic para subir</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Máximo 10MB. Se añadirán como complementos descargables.</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between py-2 px-3 bg-[#F9FAFB] rounded-md border border-[#E5E7EB]"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#111827]">{att.name}</span>
                    <span className="text-xs text-[#9CA3AF]">{att.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={att.url}
                      download={att.name}
                      className="text-xs text-[#2563EB] hover:underline"
                    >
                      Descargar
                    </a>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 rounded hover:bg-[#FEF2F2] text-[#EF4444]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alarm Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6B7280]" />
            <h2 className="text-sm font-medium text-[#111827]">Alarmas y recordatorios</h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAlarmSection}
              onChange={(e) => setShowAlarmSection(e.target.checked)}
              className="w-4 h-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
            />
            <span className="text-sm text-[#6B7280]">Configurar alarma</span>
          </label>
        </div>

        <AnimatePresence>
          {showAlarmSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#111827] mb-1">Fecha de recordatorio</label>
                  <input
                    type="datetime-local"
                    value={alarmDate}
                    onChange={(e) => { setAlarmDate(e.target.value); markDirty() }}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#111827] mb-1">Destinatarios email</label>
                  <input
                    type="text"
                    placeholder="correo1@hotel.com, correo2@hotel.com"
                    value={alarmRecipients}
                    onChange={(e) => { setAlarmRecipients(e.target.value); markDirty() }}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-[#111827] mb-1">Mensaje</label>
                  <textarea
                    rows={3}
                    placeholder="Motivo del recordatorio..."
                    value={alarmMessage}
                    onChange={(e) => { setAlarmMessage(e.target.value); markDirty() }}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-semibold text-[#111827]">Vista previa</h2>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <h1 className="text-2xl font-bold text-[#111827] mb-4">{title || 'Sin título'}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-[#6B7280] mb-6">
                  <span className="px-2 py-1 bg-[#F3F4F6] rounded">{topics.find((t) => t.id === topicId)?.name ?? 'Sin tema'}</span>
                  <span className="px-2 py-1 bg-[#F3F4F6] rounded">{centers.find((c) => c.id === centerId)?.name ?? 'Sin centro'}</span>
                  <span className="px-2 py-1 bg-[#F3F4F6] rounded">v{version}</span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-[#111827]"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                {attachments.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-[#111827] mb-3">Adjuntos</h3>
                    <div className="space-y-2">
                      {attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          download={att.name}
                          className="flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#111827] bg-[#F3F4F6] border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save status */}
      <div className="fixed bottom-4 left-[260px] right-4 z-40 flex items-center justify-between px-4 py-2 bg-white border border-[#E5E7EB] rounded-md shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
          {isDirty ? 'Borrador sin guardar' : lastSaved ? `Guardado a las ${lastSaved}` : 'Listo'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/documents')}
            className="px-3 py-1.5 text-xs font-medium text-[#6B7280] bg-white border border-[#E5E7EB] rounded hover:bg-[#F3F4F6] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#2563EB] rounded hover:bg-[#1D4ED8] transition-all active:scale-[0.98]"
          >
            Guardar
          </button>
        </div>
      </div>
    </motion.div>
  )
}
