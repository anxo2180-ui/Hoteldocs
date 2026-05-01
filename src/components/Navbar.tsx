import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[#111827] hover:opacity-80 transition-opacity">
          <FileText className="w-5 h-5 text-[#2563EB]" />
          <span className="text-lg font-semibold tracking-tight">HotelDocs</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-all duration-150"
          >
            Inicio
          </Link>
          <Link
            to="/login"
            className="px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-md transition-all duration-150"
          >
            Características
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-[#111827] bg-[#F3F4F6] border border-[#E5E7EB] rounded-md hover:bg-[#E5E7EB] transition-all duration-150"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  )
}
