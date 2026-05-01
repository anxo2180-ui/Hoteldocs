import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  cta?: ReactNode
}

export default function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[#D1D5DB] mb-4">{icon}</div>
      <h3 className="text-base font-medium text-[#111827]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[#6B7280] max-w-sm">{description}</p>
      )}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  )
}
