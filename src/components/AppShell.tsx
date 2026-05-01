import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FileText,
  LayoutDashboard,
  FileEdit,
  Bell,
  Building2,
  Users,
  FolderOpen,
  History,
  Menu,
  X,
} from 'lucide-react'

const mainNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Documentos', path: '/documents', icon: FileEdit },
  { label: 'Alarmas', path: '/admin/alarms', icon: Bell },
]

const adminNavItems = [
  { label: 'Centros', path: '/admin/centers', icon: Building2 },
  { label: 'Usuarios', path: '/admin/users', icon: Users },
  { label: 'Temas', path: '/admin/topics', icon: FolderOpen },
]

const systemNavItems = [
  { label: 'Log de Auditoría', path: '/admin/log', icon: History },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/documents' && location.pathname.startsWith('/documents')) return true
    if (path === '/admin/documents' && location.pathname.startsWith('/admin/documents')) return true
    return location.pathname === path
  }

  return (
    <div className="min-h-[100dvh] flex bg-white">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[260px] bg-white border-r border-[#E5E7EB] z-50 transform transition-transform duration-250 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-[#E5E7EB]">
          <Link to="/" className="flex items-center gap-2 text-[#111827]">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <span className="text-base font-semibold">HotelDocs</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent isActive={isActive} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-[100dvh] bg-white border-r border-[#E5E7EB] fixed left-0 top-0 bottom-0">
        <div className="flex items-center h-14 px-5 border-b border-[#E5E7EB]">
          <Link to="/" className="flex items-center gap-2 text-[#111827]">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <span className="text-base font-semibold">HotelDocs</span>
          </Link>
        </div>
        <SidebarContent isActive={isActive} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 lg:px-6 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm text-[#6B7280]">
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/documents' && 'Documentos'}
            {location.pathname.startsWith('/documents/') && 'Documento'}
            {location.pathname === '/admin/centers' && 'Centros'}
            {location.pathname === '/admin/users' && 'Usuarios'}
            {location.pathname === '/admin/topics' && 'Temas'}
            {location.pathname === '/admin/documents' && 'Documentos (Admin)'}
            {location.pathname.startsWith('/admin/documents/') && 'Editor de Documento'}
            {location.pathname === '/admin/log' && 'Log de Auditoría'}
            {location.pathname === '/admin/alarms' && 'Alarmas'}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 py-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ isActive }: { isActive: (path: string) => boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="px-3 space-y-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.path} item={item} active={isActive(item.path)} />
        ))}
      </div>

      <div className="my-3 mx-4 border-t border-[#E5E7EB]" />
      <div className="px-3 pb-1">
        <span className="px-3 text-[11px] font-semibold uppercase text-[#9CA3AF] tracking-wide">
          Gestión
        </span>
      </div>
      <div className="px-3 space-y-1">
        {adminNavItems.map((item) => (
          <NavItem key={item.path} item={item} active={isActive(item.path)} />
        ))}
      </div>

      <div className="my-3 mx-4 border-t border-[#E5E7EB]" />
      <div className="px-3 pb-1">
        <span className="px-3 text-[11px] font-semibold uppercase text-[#9CA3AF] tracking-wide">
          Sistema
        </span>
      </div>
      <div className="px-3 space-y-1">
        {systemNavItems.map((item) => (
          <NavItem key={item.path} item={item} active={isActive(item.path)} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  item,
  active,
}: {
  item: { label: string; path: string; icon: React.ElementType }
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ${
        active
          ? 'bg-[#EFF6FF] text-[#2563EB] border-l-[3px] border-l-[#2563EB]'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] border-l-[3px] border-l-transparent'
      }`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span>{item.label}</span>
    </Link>
  )
}
