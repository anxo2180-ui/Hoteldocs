import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import {
  FileText,
  LayoutDashboard,
  FileEdit,
  Bell,
  Building2,
  Users,
  FolderOpen,
  History,
  Settings,
  Crown,
  Layers,
  Menu,
  X,
} from 'lucide-react'

function getAuthRole(): string | null {
  try {
    const raw = localStorage.getItem('hoteldocs_auth')
    if (!raw || raw === 'null' || raw === 'undefined') return null
    const parsed = JSON.parse(raw)
    return parsed?.role ?? null
  } catch {
    return null
  }
}

function canViewUsers(role: string | null): boolean {
  return role === 'master' || role === 'clientAdmin' || role === 'hotelAdmin'
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const userRole = getAuthRole()
  const isMaster = userRole === 'master'
  const { t, lang, setLang } = useTranslation('navigation')
  const { t: tCommon } = useTranslation('common')

  const mainNavItems = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('documents'), path: '/documents', icon: FileEdit },
    { label: t('alarms'), path: '/admin/alarms', icon: Bell },
  ]

  const adminNavItems = [
    { label: t('centers'), path: '/admin/centers', icon: Building2 },
    { label: t('departments'), path: '/admin/departments', icon: Layers },
    { label: t('users'), path: '/admin/users', icon: Users },
    { label: t('topics'), path: '/admin/topics', icon: FolderOpen },
  ]

  const systemNavItems = [
    { label: t('auditLog'), path: '/admin/log', icon: History },
  ]

  const masterNavItems = [
    { label: t('clients'), path: '/master/clients', icon: Crown },
    { label: t('licenses'), path: '/master/licenses', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/documents' && location.pathname.startsWith('/documents')) return true
    if (path === '/admin/documents' && location.pathname.startsWith('/admin/documents')) return true
    if (path === '/master/clients' && location.pathname.startsWith('/master/clients')) return true
    return location.pathname === path
  }

  const visibleAdminItems = adminNavItems.filter((item) =>
    item.label !== t('users') || canViewUsers(userRole)
  )

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
            aria-label={tCommon('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent
          isActive={isActive}
          isMaster={isMaster}
          userRole={userRole}
          mainNavItems={mainNavItems}
          visibleAdminItems={visibleAdminItems}
          systemNavItems={systemNavItems}
          masterNavItems={masterNavItems}
          t={t}
          tCommon={tCommon}
          lang={lang}
          setLang={setLang}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-[100dvh] bg-white border-r border-[#E5E7EB] fixed left-0 top-0 bottom-0">
        <div className="flex items-center h-14 px-5 border-b border-[#E5E7EB]">
          <Link to="/" className="flex items-center gap-2 text-[#111827]">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <span className="text-base font-semibold">HotelDocs</span>
          </Link>
        </div>
        <SidebarContent
          isActive={isActive}
          isMaster={isMaster}
          userRole={userRole}
          mainNavItems={mainNavItems}
          visibleAdminItems={visibleAdminItems}
          systemNavItems={systemNavItems}
          masterNavItems={masterNavItems}
          t={t}
          tCommon={tCommon}
          lang={lang}
          setLang={setLang}
        />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 lg:px-6 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280]"
            aria-label={tCommon('open')}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm text-[#6B7280] flex-1">
            {location.pathname === '/dashboard' && t('dashboard')}
            {location.pathname === '/documents' && t('documents')}
            {location.pathname.startsWith('/documents/') && t('documents')}
            {location.pathname === '/admin/centers' && t('centers')}
            {location.pathname === '/admin/users' && t('users')}
            {location.pathname === '/admin/topics' && t('topics')}
            {location.pathname === '/admin/documents' && t('documents')}
            {location.pathname.startsWith('/admin/documents/') && t('documents')}
            {location.pathname === '/admin/log' && t('auditLog')}
            {location.pathname === '/admin/alarms' && t('alarms')}
            {location.pathname === '/master/clients' && t('clients')}
            {location.pathname.startsWith('/master/clients/') && t('clients')}
            {location.pathname === '/master/licenses' && t('licenses')}
          </span>
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-md p-0.5">
            {(['es', 'en', 'de'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  lang === l
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 py-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  isActive,
  isMaster,
  mainNavItems,
  visibleAdminItems,
  systemNavItems,
  masterNavItems,
  t,
}: {
  isActive: (path: string) => boolean
  isMaster: boolean
  userRole: string | null
  mainNavItems: any[]
  visibleAdminItems: any[]
  systemNavItems: any[]
  masterNavItems: any[]
  t: (key: string) => string
  tCommon: (key: string) => string
  lang: string
  setLang: (lang: 'es' | 'en' | 'de') => void
}) {
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
          {t('management')}
        </span>
      </div>
      <div className="px-3 space-y-1">
        {visibleAdminItems.map((item) => (
          <NavItem key={item.path} item={item} active={isActive(item.path)} />
        ))}
      </div>

      {isMaster && (
        <>
          <div className="my-3 mx-4 border-t border-[#E5E7EB]" />
          <div className="px-3 pb-1">
            <span className="px-3 text-[11px] font-semibold uppercase text-[#9CA3AF] tracking-wide">
              {t('master')}
            </span>
          </div>
          <div className="px-3 space-y-1">
            {masterNavItems.map((item) => (
              <NavItem key={item.path} item={item} active={isActive(item.path)} />
            ))}
          </div>
        </>
      )}

      <div className="my-3 mx-4 border-t border-[#E5E7EB]" />
      <div className="px-3 pb-1">
        <span className="px-3 text-[11px] font-semibold uppercase text-[#9CA3AF] tracking-wide">
          {t('system')}
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
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-[#EFF6FF] text-[#2563EB]'
          : 'text-[#374151] hover:bg-[#F3F4F6]'
      }`}
    >
      <item.icon className="w-[18px] h-[18px]" />
      {item.label}
    </Link>
  )
}
