import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Crown,
  Building2,
  Euro,
  Search,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Client } from '@/types'
import { getClients } from '@/data/api'

const LICENSE_COLORS: Record<string, string> = {
  basic: 'bg-blue-50 text-blue-700 border-blue-200',
  professional: 'bg-purple-50 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

const LICENSE_LABELS: Record<string, string> = {
  basic: 'Basic',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export default function MasterClientsPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Auth guard
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

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = clients.reduce((sum, c) => sum + c.monthlyFee, 0)
  const activeClients = clients.filter((c) => c.status === 'active').length
  const totalActiveHotels = clients.reduce((sum, c) => sum + c.activeHotels, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Clientes</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Gestión de clientes y sus licencias
          </p>
        </div>
        <Button
          onClick={() => toast.info('Funcion disponible en version completa')}
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Clientes', value: clients.length, icon: Crown, color: 'text-amber-600' },
          { label: 'Activos', value: activeClients, icon: Building2, color: 'text-emerald-600' },
          { label: 'Hoteles activos', value: totalActiveHotels, icon: Building2, color: 'text-[#2563EB]' },
          { label: 'Ingresos/mes', value: `${totalRevenue} EUR`, icon: Euro, color: 'text-purple-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="bg-white border border-[#E5E7EB] rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-[#6B7280]">{s.label}</span>
            </div>
            <span className="text-xl font-semibold text-[#111827]">{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#6B7280]">Cargando clientes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Crown className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Licencia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Hoteles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Usuarios</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Fee/mes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Vencimiento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((client, i) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-[#F9FAFB] cursor-pointer"
                  onClick={() => navigate(`/master/clients/${client.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-[#111827]">{client.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {client.contactName}
                    <br />
                    <span className="text-xs">{client.contactPhone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={LICENSE_COLORS[client.licenseType]}>
                      {LICENSE_LABELS[client.licenseType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {client.activeHotels}/{client.maxHotels}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {client.activeHotels}/{client.maxHotels}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#111827]">{client.monthlyFee} EUR</td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {new Date(client.licenseExpiry).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS_COLORS[client.status]}>
                      {client.status === 'active' ? 'Activo' : client.status === 'suspended' ? 'Suspendido' : 'Trial'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
