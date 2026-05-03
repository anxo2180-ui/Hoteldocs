import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Bell,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Mail,
  X,
} from 'lucide-react'
import type { Alarm, Document } from '@/types'
import { getAlarms, getDocuments, createAlarm, deleteAlarm, updateAlarm } from '@/data/api'
import EmptyState from '@/components/EmptyState'
import LoadingState from '@/components/LoadingState'
import { toast, Toaster } from 'sonner'

function useAdminGuard() {
  const navigate = useNavigate()
  useEffect(() => {
    const raw = localStorage.getItem('hoteldocs_auth')
    const auth = raw ? (JSON.parse(raw) as { role?: string }) : null
    const role = auth?.role
    if (!role || !['master', 'clientAdmin', 'hotelAdmin'].includes(role)) {
      navigate('/dashboard')
    }
  }, [navigate])
}

type TabKey = 'upcoming' | 'active' | 'overdue' | 'history'

export default function AdminAlarmsPage() {
  useAdminGuard()

  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming')
  const [modalOpen, setModalOpen] = useState(false)
  const [formDocId, setFormDocId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formRecipients, setFormRecipients] = useState('')
  const [formMessage, setFormMessage] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [a, d] = await Promise.all([getAlarms(), getDocuments()])
      setAlarms(a)
      setDocuments(d)
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const stats = useMemo(() => {
    const active = alarms.filter((a) => !a.isTriggered)
    const upcoming = active.filter((a) => new Date(a.reminderDate) > now && new Date(a.reminderDate) <= in7Days)
    const overdue = active.filter((a) => new Date(a.reminderDate) < now)
    const sentThisMonth = alarms.filter((a) => {
      if (!a.isTriggered) return false
      const d = new Date(a.reminderDate)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      active: active.length,
      upcoming7: upcoming.length,
      overdue: overdue.length,
      sentThisMonth: sentThisMonth.length,
    }
  }, [alarms])

  const filteredAlarms = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return alarms.filter((a) => !a.isTriggered && new Date(a.reminderDate) > now && new Date(a.reminderDate) <= in7Days)
      case 'active':
        return alarms.filter((a) => !a.isTriggered && new Date(a.reminderDate) > in7Days)
      case 'overdue':
        return alarms.filter((a) => !a.isTriggered && new Date(a.reminderDate) < now)
      case 'history':
        return alarms.filter((a) => a.isTriggered)
      default:
        return []
    }
  }, [alarms, activeTab])

  const handleCreate = async () => {
    if (!formDocId || !formDate) {
      toast.error('Documento y fecha son obligatorios')
      return
    }
    const doc = documents.find((d) => d.id === formDocId)
    if (!doc) return
    const recipients = formRecipients
      .split(/[\n,]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
    const newAlarm = await createAlarm({
      documentId: doc.id,
      documentTitle: doc.title,
      reminderDate: new Date(formDate).toISOString(),
      emailRecipients: recipients.length > 0 ? recipients : ['admin@hoteldocs.com'],
      isTriggered: false,
    })
    setAlarms((prev) => [...prev, newAlarm])
    setModalOpen(false)
    setFormDocId('')
    setFormDate('')
    setFormRecipients('')
    setFormMessage('')
    toast.success('Alarma creada')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar alarma? Los destinatarios no recibirán este recordatorio.')) return
    await deleteAlarm(id)
    setAlarms((prev) => prev.filter((a) => a.id !== id))
    toast.success('Alarma eliminada')
  }

  const handleSimulateSend = async (alarm: Alarm) => {
    await updateAlarm(alarm.id, { isTriggered: true })
    setAlarms((prev) => prev.map((a) => (a.id === alarm.id ? { ...a, isTriggered: true } : a)))
    toast.success(`Email enviado a ${alarm.emailRecipients.join(', ')}`)
  }

  const daysUntil = (dateStr: string) => {
    const d = new Date(dateStr)
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const tabConfig: { key: TabKey; label: string }[] = [
    { key: 'upcoming', label: 'Próximas' },
    { key: 'active', label: 'Activas' },
    { key: 'overdue', label: 'Vencidas' },
    { key: 'history', label: 'Historial' },
  ]

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
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">Alarmas y Recordatorios</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Configura recordatorios para revisiones y actualizaciones de documentos</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] transition-all duration-150 active:scale-[0.98] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-1"
        >
          <Plus className="w-4 h-4" />
          Nueva Alarma
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Alarmas activas', value: stats.active, icon: Bell, color: 'text-[#2563EB]' },
          { label: 'Próximas 7 días', value: stats.upcoming7, icon: Calendar, color: 'text-[#F59E0B]' },
          { label: 'Vencidas (sin enviar)', value: stats.overdue, icon: AlertTriangle, color: 'text-[#EF4444]' },
          { label: 'Enviadas este mes', value: stats.sentThisMonth, icon: CheckCircle2, color: 'text-[#10B981]' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center gap-4"
          >
            <div className={`p-2 rounded-md bg-[#F9FAFB] ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#6B7280]">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB] mb-4">
        <div className="flex gap-1">
          {tabConfig.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        {loading ? (
          <LoadingState text="Cargando alarmas..." />
        ) : filteredAlarms.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-12 h-12" />}
            title="No hay alarmas"
            description="No se encontraron alarmas en esta categoría."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase font-medium">
                  <th className="text-left py-3 px-4">Documento</th>
                  <th className="text-left py-3 px-4">Fecha recordatorio</th>
                  <th className="text-left py-3 px-4">Destinatarios</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredAlarms.map((alarm, i) => {
                    const d = daysUntil(alarm.reminderDate)
                    const isOverdue = d < 0 && !alarm.isTriggered
                    return (
                      <motion.tr
                        key={alarm.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#2563EB] text-[13px]">{alarm.documentTitle}</span>
                        </td>
                        <td className="py-3 px-4 text-[#111827] text-[13px]">
                          {new Date(alarm.reminderDate).toLocaleDateString('es-ES')}
                          <div className={`text-[12px] font-medium ${isOverdue ? 'text-[#EF4444]' : d <= 7 ? 'text-[#F59E0B]' : 'text-[#6B7280]'}`}>
                            {isOverdue ? `Hace ${Math.abs(d)} días` : d === 0 ? '¡Hoy!' : d === 1 ? 'Mañana' : `En ${d} días`}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#6B7280] text-[13px]">
                          {alarm.emailRecipients.slice(0, 2).join(', ')}
                          {alarm.emailRecipients.length > 2 && ` +${alarm.emailRecipients.length - 2}`}
                        </td>
                        <td className="py-3 px-4">
                          {alarm.isTriggered ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-[#ECFDF5] text-[#10B981]">
                              Enviada
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-[#FFFBEB] text-[#F59E0B]">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {!alarm.isTriggered && (
                              <button
                                onClick={() => handleSimulateSend(alarm)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#2563EB] bg-[#EFF6FF] rounded hover:bg-[#DBEAFE] transition-colors"
                                title="Simular envío"
                              >
                                <Mail className="w-3 h-3" />
                                Simular envío
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(alarm.id)}
                              className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#EF4444] transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-semibold text-[#111827]">Nueva Alarma</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Documento</label>
                  <select
                    value={formDocId}
                    onChange={(e) => setFormDocId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
                  >
                    <option value="">Seleccionar documento...</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Fecha recordatorio</label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Destinatarios email</label>
                  <textarea
                    rows={3}
                    placeholder="correo1@hotel.com, correo2@hotel.com"
                    value={formRecipients}
                    onChange={(e) => setFormRecipients(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none resize-none"
                  />
                  <p className="mt-1 text-xs text-[#9CA3AF]">Separados por comas o saltos de línea</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Mensaje personalizado</label>
                  <textarea
                    rows={3}
                    placeholder="Motivo del recordatorio..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#111827] bg-[#F3F4F6] border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1D4ED8] transition-all active:scale-[0.98]"
                >
                  Guardar alarma
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
