import { CheckCircle2, Clock, AlertTriangle, FileEdit } from 'lucide-react'

export type DocumentStatus = 'approved' | 'pending' | 'discontinued' | 'draft'

interface StatusBadgeProps {
  status: DocumentStatus
}

const config: Record<
  DocumentStatus,
  {
    label: string
    bg: string
    text: string
    icon: React.ElementType | null
    pulse?: boolean
  }
> = {
  approved: {
    label: 'Aprobado',
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#10B981]',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendiente',
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#F59E0B]',
    icon: Clock,
    pulse: true,
  },
  discontinued: {
    label: 'Descatalogado',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#EF4444]',
    icon: AlertTriangle,
  },
  draft: {
    label: 'Borrador',
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    icon: FileEdit,
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status]
  const Icon = c.icon

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide min-w-[100px] ${c.bg} ${c.text} ${
        c.pulse ? 'animate-pulse-subtle' : ''
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      <span>{c.label}</span>
    </span>
  )
}
