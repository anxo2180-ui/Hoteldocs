import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  FileText,
  FileEdit,
  Bell,
  History,
} from 'lucide-react'
import Layout from '@/components/Layout'
import StatusBadge from '@/components/StatusBadge'

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
} as const

function HeroSection() {
  return (
    <section className="relative w-full bg-white pt-[120px] pb-20 px-6">
      <div className="max-w-[720px] mx-auto text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-medium mb-6"
        >
          Gestión documental para hoteles
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="text-[2.5rem] leading-[1.15] font-bold text-[#111827] tracking-tight"
        >
          Todos tus manuales, procedimientos y políticas en un solo lugar
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="mt-5 text-lg text-[#6B7280] max-w-[560px] mx-auto"
        >
          Organiza, aprueba y distribuye documentación por hotel y temática. Con control de versiones, marcas de agua legales y trazabilidad completa.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1D4ED8] transition-all duration-150 active:scale-[0.98]"
          >
            Comenzar gratis
          </Link>
          <a
            href="#features"
            className="px-5 py-2.5 text-sm font-medium text-[#6B7280] bg-transparent rounded-md hover:bg-[#F3F4F6] transition-all duration-150 active:scale-[0.98]"
          >
            Ver demostración
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function AppPreviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="w-full bg-[#F9FAFB] py-20 px-6">
      <div className="max-w-[960px] mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden"
        >
          <div className="absolute top-3 right-3 z-10 bg-[#111827] text-white text-[11px] font-medium px-2 py-1 rounded shadow-sm">
            Vista de administrador
          </div>

          {/* Simulated app header */}
          <div className="flex items-center h-14 bg-white border-b border-[#E5E7EB] px-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#111827]">HotelDocs</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#F3F4F6]" />
            </div>
          </div>

          <div className="flex">
            {/* Simulated sidebar */}
            <div className="hidden sm:flex w-[60px] bg-[#F9FAFB] border-r border-[#E5E7EB] py-3 flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#EFF6FF] flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-[#2563EB]/40" />
              </div>
              <div className="w-8 h-8 rounded-md flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-[#D1D5DB]" />
              </div>
              <div className="w-8 h-8 rounded-md flex items-center justify-center">
                <div className="w-4 h-4 rounded-sm bg-[#D1D5DB]" />
              </div>
            </div>

            {/* Simulated content table */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#111827]">Documentos</span>
                <div className="w-20 h-7 rounded-md bg-[#2563EB]" />
              </div>
              <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
                <div className="hidden sm:grid grid-cols-[1fr_120px_100px] gap-2 px-3 py-2 bg-[#F9FAFB] text-xs font-medium text-[#6B7280] uppercase">
                  <span>Título</span>
                  <span>Estado</span>
                  <span>Versión</span>
                </div>
                {[
                  { title: 'Manual de Limpieza', status: 'approved' as const, version: 'v3' },
                  { title: 'Protocolo Check-in', status: 'approved' as const, version: 'v2' },
                  { title: 'Guía Mantenimiento AC', status: 'pending' as const, version: 'v1' },
                  { title: 'Protocolo Incendio', status: 'approved' as const, version: 'v4' },
                  { title: 'Política Vacaciones', status: 'approved' as const, version: 'v2' },
                  { title: 'ISO 9001', status: 'draft' as const, version: 'v1' },
                  { title: 'Seguridad Alimentaria', status: 'discontinued' as const, version: 'v1' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_100px] gap-1 sm:gap-2 px-3 py-2.5 border-t border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <span className="text-sm text-[#111827]">{row.title}</span>
                    <div className="flex items-center">
                      <StatusBadge status={row.status} />
                    </div>
                    <span className="text-sm text-[#6B7280]">{row.version}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: Building2,
    color: 'text-[#2563EB]',
    title: 'Un hotel, una documentación',
    desc: 'Cada centro tiene su propio espacio. Gestiona documentos independientes por hotel o comparte políticas corporativas.',
  },
  {
    icon: CheckCircle2,
    color: 'text-[#10B981]',
    title: 'Borrador → Aprobado',
    desc: 'Estados visuales claros: borrador, pendiente, aprobado, descatalogado. Los usuarios solo ven lo que está en vigor.',
  },
  {
    icon: FileText,
    color: 'text-[#F59E0B]',
    title: 'Descargas protegidas',
    desc: 'Cada descarga incluye marca de agua con fecha y versión: "Copia del 15/01/2026 — No sustituye a la versión digital".',
  },
  {
    icon: FileEdit,
    color: 'text-[#2563EB]',
    title: 'Edita como en Wikipedia',
    desc: 'Contenido enriquecido directamente en la web: textos, tablas, imágenes, videos, enlaces. Sin depender de PDFs para consulta.',
  },
  {
    icon: Bell,
    color: 'text-[#EF4444]',
    title: 'Nunca olvides una revisión',
    desc: 'Configura alarmas por documento. Recibe emails cuando un manual necesite revisión o caduque.',
  },
  {
    icon: History,
    color: 'text-[#6B7280]',
    title: 'Log de auditoría inmutable',
    desc: 'Registro permanente de quién creó, editó o movió cada documento. No se puede borrar, solo consultar.',
  },
]

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="features" ref={ref} className="w-full bg-white py-20 px-6">
      <div className="max-w-[960px] mx-auto">
        <div className="max-w-[720px] mx-auto text-center mb-12">
          <h2 className="text-[28px] font-semibold text-[#111827]">
            Todo lo que necesitas para gestionar documentación
          </h2>
          <p className="mt-3 text-base text-[#6B7280]">
            Diseñado para cadenas hoteleras con múltiples centros y equipos distribuidos
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="bg-white border border-[#E5E7EB] rounded-lg p-6 hover:shadow-sm hover:-translate-y-px transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center">
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="mt-4 text-base font-medium text-[#111827]">{f.title}</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const comparisonRows = [
  { aspect: 'Búsqueda', pdf: false, hoteldocs: true, desc: 'Full-text instantáneo' },
  { aspect: 'Actualización', pdf: false, hoteldocs: true, desc: 'Editar en línea' },
  { aspect: 'Versiones', pdf: false, hoteldocs: true, desc: 'Control automático' },
  { aspect: 'Acceso móvil', pdf: false, hoteldocs: true, desc: 'Web responsive' },
  { aspect: 'Marcas de agua', pdf: false, hoteldocs: true, desc: 'Automática' },
  { aspect: 'Trazabilidad', pdf: false, hoteldocs: true, desc: 'Log inmutable' },
]

function ComparisonSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="w-full bg-[#F9FAFB] py-20 px-6">
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#111827]">
            ¿PDF o web? Hemos elegido lo mejor de ambos.
          </h2>
          <p className="mt-3 text-base text-[#6B7280]">
            El contenido principal se edita y consulta directamente en la web. Los PDFs son complementos descargables.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="py-3 px-4 text-left text-xs font-medium uppercase text-[#6B7280]">
                    Aspecto
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium uppercase text-[#6B7280]">
                    Solo PDF
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium uppercase text-[#2563EB] bg-[#EFF6FF]">
                    HotelDocs
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-t border-[#E5E7EB]">
                    <td className="py-3 px-4 text-[#111827] font-medium">{row.aspect}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[#EF4444]">✕</span>
                    </td>
                    <td className="py-3 px-4 text-center bg-[#EFF6FF]/30">
                      <span className="text-[#10B981]">✓</span>{' '}
                      <span className="text-[#2563EB] font-medium">{row.desc}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="w-full bg-[#2563EB] py-16 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
        className="max-w-[560px] mx-auto text-center"
      >
        <h2 className="text-2xl font-semibold text-white">
          Empieza a organizar la documentación de tu hotel hoy
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Gratis para hasta 3 hoteles y 10 usuarios. Sin tarjeta de crédito.
        </p>
        <div className="mt-8">
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 text-sm font-medium text-[#2563EB] bg-white rounded-md hover:bg-[#F9FAFB] transition-all duration-150 active:scale-[0.98]"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <AppPreviewSection />
      <FeaturesSection />
      <ComparisonSection />
      <CTASection />
    </Layout>
  )
}
