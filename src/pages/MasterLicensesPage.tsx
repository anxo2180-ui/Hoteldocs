import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Crown,
  Euro,
  Building2,
  
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Client } from '@/types'
import { getClients } from '@/data/api'

const LICENSE_COLORS: Record<string, string> = {
  basic: 'bg-blue-50 text-blue-700 border-blue-200',
  professional: 'bg-purple-50 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function MasterLicensesPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const auth = JSON.parse(localStorage.getItem('hoteldocs_auth') || '{}')
  if (auth.role !== 'master') {
    navigate('/dashboard', { replace: true })
  }

  useEffect(() => {
    async function load() {
      const c = await getClients()
      setClients(c)
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = clients.reduce((sum, c) => sum + c.monthlyFee, 0)
  const activeLicenses = clients.filter((c) => c.status === 'active').length
  const expiredSoon = clients.filter((c) => {
    const days = Math.ceil((new Date(c.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days < 30 && days > 0
  }).length
  const avgHotelUsage = clients.length
    ? Math.round(clients.reduce((sum, c) => sum + (c.activeHotels / c.maxHotels) * 100, 0) / clients.length)
    : 0

  const licenseDist = {
    basic: clients.filter((c) => c.licenseType === 'basic').length,
    professional: clients.filter((c) => c.licenseType === 'professional').length,
    enterprise: clients.filter((c) => c.licenseType === 'enterprise').length,
  }

  function expiryColor(expiry: string): string {
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 30) return 'text-red-600'
    if (days < 90) return 'text-amber-600'
    return 'text-emerald-600'
  }

  function expiryIcon(expiry: string) {
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 30) return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
    if (days < 90) return <Clock className="w-3.5 h-3.5 text-amber-500" />
    return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Licencias y Facturacion</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Control de licencias, vencimientos e ingresos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Clientes', value: clients.length, icon: Crown },
          { label: 'Ingresos/mes', value: `${totalRevenue} EUR`, icon: Euro },
          { label: 'Licencias activas', value: `${activeLicenses}/${clients.length}`, icon: CheckCircle },
          { label: 'Vencen pronto', value: expiredSoon, icon: AlertTriangle },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-[#E5E7EB] rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-[#6B7280]" />
              <span className="text-xs text-[#6B7280]">{s.label}</span>
            </div>
            <span className="text-xl font-semibold text-[#111827]">{s.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients Table */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-sm text-[#6B7280]">Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Licencia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Hoteles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Vencimiento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {clients.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-3 font-medium text-[#111827]">{client.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={LICENSE_COLORS[client.licenseType]}>
                        {client.licenseType.charAt(0).toUpperCase() + client.licenseType.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span className="text-[#6B7280]">{client.activeHotels}/{client.maxHotels}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{client.monthlyFee} EUR</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-sm ${expiryColor(client.licenseExpiry)}`}>
                        {expiryIcon(client.licenseExpiry)}
                        {new Date(client.licenseExpiry).toLocaleDateString('es-ES')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={client.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : client.status === 'suspended'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                      >
                        {client.status === 'active' ? 'Activo' : client.status === 'suspended' ? 'Suspendido' : 'Trial'}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* License Distribution */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Distribucion de licencias</h2>
          <div className="space-y-4">
            {[
              { type: 'Basic', count: licenseDist.basic, color: 'bg-blue-500' },
              { type: 'Professional', count: licenseDist.professional, color: 'bg-purple-500' },
              { type: 'Enterprise', count: licenseDist.enterprise, color: 'bg-amber-500' },
            ].map((l) => (
              <div key={l.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#374151]">{l.type}</span>
                  <span className="text-[#6B7280]">{l.count} clientes</span>
                </div>
                <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${l.color} rounded-full transition-all`}
                    style={{ width: clients.length ? `${(l.count / clients.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-medium text-[#111827] mb-2">Uso promedio</h3>
            <div className="flex items-center gap-3">
              <Progress value={avgHotelUsage} className="h-2 flex-1" />
              <span className="text-sm text-[#6B7280] w-12 text-right">{avgHotelUsage}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
