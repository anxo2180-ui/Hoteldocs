import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  History,
  Search,
  Download,
  Lock,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
  Link,
  X,
} from 'lucide-react'

import AppShell from '@/components/AppShell'
import EmptyState from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { AuditLogEntry } from '@/types'
import { getAuditLog } from '@/data/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.02,
    },
  },
}

const rowVariant = {
  hidden: { opacity: 0, y: 3 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15 } },
}

function getAuthUser(): { id: string; name: string; role: string } | null {
  try {
    const raw = localStorage.getItem('hoteldocs_auth')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const actionConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  CREATED: {
    label: 'Creó',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
    icon: Plus,
  },
  UPDATED: {
    label: 'Actualizó',
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    icon: Pencil,
  },
  DELETED: {
    label: 'Eliminó',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#EF4444]',
    icon: Trash2,
  },
  APPROVED: {
    label: 'Aprobó',
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#10B981]',
    icon: CheckCircle2,
  },
  STATUS_CHANGED: {
    label: 'Cambió estado',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#F59E0B]',
    icon: ArrowUpDown,
  },
  ASSIGNED: {
    label: 'Asignó',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
    icon: Link,
  },
}

function actionDisplay(action: string) {
  const cfg = actionConfig[action] || {
    label: action,
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    icon: Pencil,
  }
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function entityLabel(type: string): string {
  const map: Record<string, string> = {
    document: 'Documento',
    center: 'Centro',
    user: 'Usuario',
    topic: 'Tema',
    alarm: 'Alarma',
  }
  return map[type] ?? type
}

function escapeCSV(value: string): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export default function AdminLogPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const auth = getAuthUser()
    if (!auth || auth.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    loadLogs()
  }, [navigate])

  async function loadLogs() {
    setLoading(true)
    const data = await getAuditLog()
    // Sort by date desc
    data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setLogs(data)
    setLoading(false)
  }

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.entityType.toLowerCase().includes(search.toLowerCase())

      const logDate = new Date(log.createdAt)
      const from = dateFrom ? new Date(dateFrom) : null
      const to = dateTo ? new Date(dateTo) : null
      if (to) to.setHours(23, 59, 59, 999)

      const matchesFrom = !from || logDate >= from
      const matchesTo = !to || logDate <= to

      return matchesSearch && matchesFrom && matchesTo
    })
  }, [logs, search, dateFrom, dateTo])

  function handleExportCSV() {
    const headers = ['Fecha', 'Hora', 'Usuario', 'Acción', 'Entidad', 'ID Entidad', 'Detalles']
    const rows = filtered.map((log) => [
      format(new Date(log.createdAt), 'dd/MM/yyyy', { locale: es }),
      format(new Date(log.createdAt), 'HH:mm:ss', { locale: es }),
      log.userName,
      actionConfig[log.action]?.label ?? log.action,
      entityLabel(log.entityType),
      log.entityId,
      log.details,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCSV).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="pt-6 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
                Log de Auditoría
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Registro inmutable de todas las acciones del sistema
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-sm active:scale-[0.98] transition-all duration-150"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="mt-4 flex items-start gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-3">
            <Lock className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <p className="text-sm text-[#EF4444]">
              Este registro es inmutable y no puede ser modificado ni eliminado.
            </p>
          </div>

          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                placeholder="Buscar por usuario, acción o entidad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-sm w-40"
              />
              <span className="text-sm text-[#6B7280]">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-sm w-40"
              />
            </div>
            {(search || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setDateFrom('')
                  setDateTo('')
                }}
                className="text-[#6B7280] hover:text-[#111827] h-9"
              >
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="mt-4 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-[#6B7280]">
                Cargando registros...
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<History className="w-12 h-12" />}
                title="No hay registros en el log"
                description="Las acciones aparecerán aquí automáticamente"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4 w-[110px]">
                      Fecha
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4 w-[100px]">
                      Usuario
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4 w-[140px]">
                      Acción
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4 w-[100px]">
                      Entidad
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-[#6B7280] py-3 px-4">
                      Detalles
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <motion.tbody
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="contents"
                  >
                    {filtered.map((log) => (
                      <motion.tr
                        key={log.id}
                        variants={rowVariant}
                        className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="text-sm text-[#6B7280]">
                            {format(new Date(log.createdAt), 'dd/MM/yyyy', {
                              locale: es,
                            })}
                          </div>
                          <div className="text-xs font-mono text-[#9CA3AF]">
                            {format(new Date(log.createdAt), 'HH:mm:ss', {
                              locale: es,
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                              {log.userName
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-[#111827]">
                              {log.userName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {actionDisplay(log.action)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#6B7280]">
                            {entityLabel(log.entityType)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="text-sm text-[#6B7280] block max-w-xs truncate"
                            title={log.details}
                          >
                            {log.details}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </TableBody>
              </Table>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <div className="mt-3 px-6 text-xs text-[#9CA3AF]">
              {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
            </div>
          )}
        </div>
      </motion.div>
    </AppShell>
  )
}
