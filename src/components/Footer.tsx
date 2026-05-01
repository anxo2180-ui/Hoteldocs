import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E5E7EB] py-10">
      <div className="max-w-[960px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#9CA3AF] text-[13px]">
          <FileText className="w-4 h-4" />
          <span>© 2026 HotelDocs. Todos los derechos reservados.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
            Privacidad
          </Link>
          <Link to="/" className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
            Términos
          </Link>
          <Link to="/" className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  )
}
