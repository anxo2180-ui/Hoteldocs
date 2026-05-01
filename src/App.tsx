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
import PublicDocumentPage from './pages/PublicDocumentPage'
import AppShell from './components/AppShell'

function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/documents"
        element={
          <AppLayout>
            <DocumentsPage />
          </AppLayout>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <AppLayout>
            <DocumentViewerPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin/centers"
        element={
          <AppLayout>
            <AdminCentersPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AppLayout>
            <AdminUsersPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin/topics"
        element={
          <AppLayout>
            <AdminTopicsPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin/documents"
        element={
          <AppLayout>
            <AdminDocumentsPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin/documents/:id/edit"
        element={
          <AppLayout>
            <AdminDocumentEditorPage />
          </AppLayout>
        }
      />
      <Route
        path="/admin/log"
        element={
          <AppLayout>
            <AdminLogPage />
          </AppLayout>
        }
      />
      <Route path="/public/:id" element={<PublicDocumentPage />} />
      <Route
        path="/admin/alarms"
        element={
          <AppLayout>
            <AdminAlarmsPage />
          </AppLayout>
        }
      />
    </Routes>
  )
}
