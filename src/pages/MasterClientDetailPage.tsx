import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Crown,
  Building2,
  Users,
  Euro,
  Calendar,
  Mail,
  Phone,
  User,
  
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Client, Center } from '@/types'
import { getClientById, getCenters } from '@/data/api'

const LICENSE_COLORS: Record<string, string> = {
  basic: 'bg-blue-50 text-blue-700 border-blue-200',
  professional: 'bg-purple-50 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export default function MasterClientDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<Client | null>(null)
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)

  const auth = JSON.parse(localStorage.getItem('hoteldocs_auth') || '{}')
  if (auth.role !== 'master') {
    navigate('/dashboard', { replace: true })
  }

  useEffect(() => {
    async function load() {
      if (!id) return
      const [c, allCenters] = await Promise.all([
        getClientById(id),
        getCenters(),
      ])
      setClient(c)
      setCenters(allCenters.filter((center) => center.clientId === id))
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return <div className="text-center py-12 text-sm text-[#6B7280]">Cargando...</div>
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#6B7280]">Cliente no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/master/clients')}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
      </div>
    )
  }

  const hotelUsage = Math.round((client.activeHotels / client.maxHotels) * 100)
  const userUsage = Math.round((client.activeUsers / client.maxUsers) * 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back + Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/master/clients')} className="mb-2">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a clientes
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#111827]">{client.name}</h1>
          <Badge variant="outline" className={STATUS_COLORS[client.status]}>
            {client.status === 'active' ? 'Activo' : client.status === 'suspended' ? 'Suspendido' : 'Trial'}
          </Badge>
          <Badge variant="outline" className={LICENSE_COLORS[client.licenseType]}>
            {client.licenseType.charAt(0).toUpperCase() + client.licenseType.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total hoteles', value: centers.length, icon: Building2 },
          { label: 'Hoteles activos', value: client.activeHotels, icon: Building2 },
          { label: 'Usuarios activos', value: client.activeUsers, icon: Users },
          { label: 'Fee mensual', value: `${client.monthlyFee} EUR`, icon: Euro },
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

      {/* Info Grid + License Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#6B7280]" />
            Informacion de contacto
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#6B7280]">Email</p>
              <p className="text-[#111827] flex items-center gap-1">
                <Mail className="w-3 h-3" /> {client.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Contacto</p>
              <p className="text-[#111827]">{client.contactName}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Telefono</p>
              <p className="text-[#111827] flex items-center gap-1">
                <Phone className="w-3 h-3" /> {client.contactPhone}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Vencimiento licencia</p>
              <p className="text-[#111827] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(client.licenseExpiry).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#6B7280]">Notas</p>
              <p className="text-[#111827]">{client.notes}</p>
            </div>
          </div>
        </div>

        {/* License Usage */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#6B7280]" />
            Uso de licencia
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">Hoteles</span>
                <span className="text-[#111827] font-medium">{client.activeHotels}/{client.maxHotels}</span>
              </div>
              <Progress value={hotelUsage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6B7280]">Usuarios</span>
                <span className="text-[#111827] font-medium">{client.activeUsers}/{client.maxUsers}</span>
              </div>
              <Progress value={userUsage} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Hotels Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
        <h2 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#6B7280]" />
          Hoteles del cliente
        </h2>
        {centers.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No hay hoteles asignados</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#6B7280] uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#6B7280] uppercase">Codigo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-[#6B7280] uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {centers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-2 font-medium text-[#111827]">{c.name}</td>
                  <td className="px-4 py-2 text-[#6B7280]">{c.code}</td>
                  <td className="px-4 py-2">
                    <Badge
                      variant="outline"
                      className={c.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'}
                    >
                      {c.status === 'active' ? 'Activo' : 'Pausado'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}
