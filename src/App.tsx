import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentViewerPage from './pages/DocumentViewerPage'
import AdminCentersPage from './pages/AdminCentersPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminTopicsPage from './pages/AdminTopicsPage'
import AdminDocumentsPage from './pages/AdminDocumentsPage'
import AdminDocumentEditorPage from './pages/AdminDocumentEditorPage'
import AdminLogPage from './pages/AdminLogPage'
import AdminAlarmsPage from './pages/AdminAlarmsPage'
import AdminDepartmentsPage from './pages/AdminDepartmentsPage'
import PublicDocumentPage from './pages/PublicDocumentPage'
import MasterClientsPage from './pages/MasterClientsPage'
import MasterClientDetailPage from './pages/MasterClientDetailPage'
import MasterLicensesPage from './pages/MasterLicensesPage'
import AppShell from './components/AppShell'
import RequireAuth from './components/RequireAuth'

function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

/** Roles permitidos para funciones de administración */
const ADMIN_ROLES = ['master', 'clientAdmin', 'hotelAdmin']

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public/:id" element={<PublicDocumentPage />} />

      {/* Protegidas — cualquier usuario logueado */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/documents"
        element={
          <RequireAuth>
            <AppLayout>
              <DocumentsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <RequireAuth>
            <AppLayout>
              <DocumentViewerPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      {/* Protegidas — administradores */}
      <Route
        path="/admin/centers"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminCentersPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminUsersPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/topics"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminTopicsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/documents"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminDocumentsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/documents/:id/edit"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminDocumentEditorPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminDepartmentsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/alarms"
        element={
          <RequireAuth allowedRoles={ADMIN_ROLES}>
            <AppLayout>
              <AdminAlarmsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin/log"
        element={
          <RequireAuth>
            <AppLayout>
              <AdminLogPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      {/* Protegidas — solo master */}
      <Route
        path="/master/clients"
        element={
          <RequireAuth allowedRoles={['master']}>
            <AppLayout>
              <MasterClientsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/master/clients/:id"
        element={
          <RequireAuth allowedRoles={['master']}>
            <AppLayout>
              <MasterClientDetailPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/master/licenses"
        element={
          <RequireAuth allowedRoles={['master']}>
            <AppLayout>
              <MasterLicensesPage />
            </AppLayout>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
