import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  Clock,
  Bell,
  Plus,
  Users,
  Building2,
  History,
  Loader2,
} from 'lucide-react'
import { getDocuments, getAlarms, getAuditLog, getTopics } from '@/data/api'
import type { Document, Alarm, AuditLogEntry, Topic } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

interface AuthData {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  centerId: string
}

function useAuth(): AuthData | null {
  const [auth, setAuth] = useState<AuthData | null>(null)
  useEffect(() => {
    const raw = localStorage.getItem('hoteldocs_auth')
    if (raw) {
      try {
        setAuth(JSON.parse(raw) as AuthData)
      } catch {
        setAuth(null)
      }
    }
  }, [])
  return auth
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

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
} as const

const rowVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
} as const

export default function DashboardPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [docs, setDocs] = useState<Document[]>([])
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [log, setLog] = useState<AuditLogEntry[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      const raw = localStorage.getItem('hoteldocs_auth')
      if (!raw) {
        navigate('/login', { replace: true })
        return
      }
    }
  }, [auth, navigate])

  useEffect(() => {
    async function load() {
      try {
        const [d, a, l, t] = await Promise.all([
          getDocuments(),
          getAlarms(),
          getAuditLog(),
          getTopics(),
        ])
        setDocs(d)
        setAlarms(a)
        setLog(l.slice(0, 5))
        setTopics(t)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalDocs = docs.length
  const approvedCount = docs.filter((d) => d.status === 'approved').length
  const pendingCount = docs.filter((d) => d.status === 'pending').length
  const alarmCount = alarms.filter((a) => !a.isTriggered).length

  const statusCounts = {
    approved: docs.filter((d) => d.status === 'approved').length,
    draft: docs.filter((d) => d.status === 'draft').length,
    pending: docs.filter((d) => d.status === 'pending').length,
    discontinued: docs.filter((d) => d.status === 'discontinued').length,
  }

  const maxStatus = Math.max(...Object.values(statusCounts), 1)

  const topicCounts = topics
    .map((t) => ({
      ...t,
      count: docs.filter((d) => d.topicId === t.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const maxTopicCount = Math.max(...topicCounts.map((t) => t.count), 1)

  const recentDocs = [...docs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const activeAlarms = alarms.filter((a) => !a.isTriggered).slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return (
    <div className="pt-2">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-semibold text-[#111827]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Resumen de tu organización</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: 'Documentos totales',
            value: totalDocs,
            icon: FileText,
            color: 'text-[#2563EB]',
            bg: 'bg-[#F9FAFB]',
            trend: '+12 este mes',
            trendColor: 'text-[#10B981]',
          },
          {
            label: 'Aprobados en vigor',
            value: approvedCount,
            icon: CheckCircle2,
            color: 'text-[#10B981]',
            bg: 'bg-[#ECFDF5]',
            trend: '92% del total',
            trendColor: 'text-[#6B7280]',
          },
          {
            label: 'Pendientes',
            value: pendingCount,
            icon: Clock,
            color: 'text-[#F59E0B]',
            bg: 'bg-[#FFFBEB]',
            trend: 'Revisar →',
            trendColor: 'text-[#2563EB]',
          },
          {
            label: 'Alarmas esta semana',
            value: alarmCount,
            icon: Bell,
            color: 'text-[#EF4444]',
            bg: 'bg-[#FEF2F2]',
            trend: '',
            trendColor: '',
            pulse: true,
          },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white border border-[#E5E7EB] rounded-lg p-5"
            >
              <div className="flex items-start justify-between">
                <div className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className="text-[28px] font-semibold text-[#111827]">{card.value}</span>
              </div>
              <p className="mt-2 text-[13px] text-[#6B7280]">{card.label}</p>
              {card.trend && (
                <p className={`mt-1 text-xs ${card.trendColor} ${card.pulse ? 'flex items-center gap-1' : ''}`}>
                  {card.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
                    </span>
                  )}
                  {card.trend}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Documentos por estado */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white border border-[#E5E7EB] rounded-lg p-5"
        >
          <h3 className="text-sm font-medium text-[#111827] mb-4">Documentos por estado</h3>
          <div className="space-y-3">
            {([
              { key: 'approved', label: 'Aprobado', color: 'bg-[#10B981]', count: statusCounts.approved },
              { key: 'pending', label: 'Pendiente', color: 'bg-[#F59E0B]', count: statusCounts.pending },
              { key: 'draft', label: 'Borrador', color: 'bg-[#6B7280]', count: statusCounts.draft },
              { key: 'discontinued', label: 'Descatalogado', color: 'bg-[#EF4444]', count: statusCounts.discontinued },
            ] as const).map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] w-24 shrink-0">{s.label}</span>
                <div className="flex-1 h-7 bg-[#F3F4F6] rounded-r-md overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-r-md transition-all duration-500`}
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#111827] w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Documentos por tema */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white border border-[#E5E7EB] rounded-lg p-5"
        >
          <h3 className="text-sm font-medium text-[#111827] mb-4">Documentos por temática</h3>
          <div className="space-y-3">
            {topicCounts.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] w-28 shrink-0">{t.name}</span>
                <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                    style={{ width: `${(t.count / maxTopicCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#6B7280] w-6 text-right">{t.count}</span>
              </div>
            ))}
            {topicCounts.length === 0 && (
              <p className="text-sm text-[#9CA3AF]">Sin datos</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 mt-6"
      >
        <Link
          to="/admin/documents"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo documento
        </Link>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] text-[#111827] text-sm font-medium border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] active:scale-[0.98] transition-all"
        >
          <Users className="w-4 h-4" />
          Gestionar usuarios
        </Link>
        <Link
          to="/admin/centers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] text-[#111827] text-sm font-medium border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] active:scale-[0.98] transition-all"
        >
          <Building2 className="w-4 h-4" />
          Crear centro
        </Link>
        <Link
          to="/admin/log"
          className="inline-flex items-center gap-2 px-4 py-2 text-[#6B7280] text-sm font-medium rounded-md hover:bg-[#F3F4F6] active:scale-[0.98] transition-all"
        >
          <History className="w-4 h-4" />
          Ver log
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="bg-white border border-[#E5E7EB] rounded-lg mt-6 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-medium text-[#111827]">Actividad reciente</h3>
        </div>
        {log.length === 0 ? (
          <EmptyState
            icon={<History className="w-12 h-12" />}
            title="Sin actividad reciente"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] text-left">
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Fecha</th>
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Usuario</th>
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Acción</th>
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Documento/Entidad</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry, i) => {
                const actionColor =
                  entry.action === 'CREATED'
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : entry.action === 'APPROVED'
                    ? 'bg-[#ECFDF5] text-[#10B981]'
                    : entry.action === 'UPDATED'
                    ? 'bg-[#F3F4F6] text-[#6B7280]'
                    : 'bg-[#FEF2F2] text-[#EF4444]'
                return (
                  <motion.tr
                    key={entry.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={rowVariants}
                    className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-4 py-3 text-[13px] text-[#6B7280]">{formatDateTime(entry.createdAt)}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{entry.userName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${actionColor}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#2563EB]">{entry.details}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
        <div className="px-4 py-3 border-t border-[#E5E7EB] text-center">
          <Link to="/admin/log" className="text-[13px] text-[#2563EB] hover:underline">
            Ver todo el log →
          </Link>
        </div>
      </motion.div>

      {/* Alarmas próximas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="bg-white border border-[#E5E7EB] rounded-lg mt-6 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6B7280]" />
            <h3 className="text-sm font-medium text-[#111827]">Alarmas próximas</h3>
          </div>
          <Link to="/admin/alarms" className="text-[13px] text-[#2563EB] hover:underline">
            Ver todas →
          </Link>
        </div>
        {activeAlarms.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#9CA3AF]">
            No hay alarmas configuradas
          </div>
        ) : (
          <div>
            {activeAlarms.map((alarm, i) => {
              const days = Math.ceil(
                (new Date(alarm.reminderDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              const daysLabel = days <= 0 ? 'Hoy' : `En ${days} días`
              const daysColor =
                days <= 3 ? 'text-[#EF4444]' : days <= 10 ? 'text-[#F59E0B]' : 'text-[#6B7280]'
              return (
                <motion.div
                  key={alarm.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-[#6B7280]" />
                    <div>
                      <p className="text-[13px] font-medium text-[#111827]">{alarm.documentTitle}</p>
                      <p className="text-xs text-[#9CA3AF]">{formatDate(alarm.reminderDate)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${daysColor}`}>{daysLabel}</span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Documents */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.3 }}
        className="bg-white border border-[#E5E7EB] rounded-lg mt-6 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-medium text-[#111827]">Documentos recientes</h3>
        </div>
        {recentDocs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No hay documentos"
            description="Empieza creando un nuevo documento"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] text-left">
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Título</th>
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Estado</th>
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Versión</th>
                <th className="px-4 py-2 text-xs font-medium text-[#6B7280] uppercase">Modificado</th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.map((doc, i) => (
                <motion.tr
                  key={doc.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <td className="px-4 py-3 text-[13px] font-medium text-[#111827] truncate max-w-[240px]">
                    {doc.title}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#9CA3AF] font-mono">v{doc.version}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6B7280]">{formatDate(doc.updatedAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
