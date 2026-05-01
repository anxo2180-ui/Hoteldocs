import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  size?: number
  text?: string
}

export default function LoadingState({ size = 20, text }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin text-[#2563EB]" style={{ width: size, height: size }} />
      {text && <span className="text-sm text-[#6B7280]">{text}</span>}
    </div>
  )
}
