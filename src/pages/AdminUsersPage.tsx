import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Simple data loader from localStorage
function getAuthFromStorage() {
  try {
    const data = localStorage.getItem('hoteldocs_auth')
    return data ? JSON.parse(data) : null
  } catch { return null }
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Form
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const auth = getAuthFromStorage()
    if (!auth) { navigate('/login'); return }

    // Load users from localStorage
    const stored = localStorage.getItem('hoteldocs_users')
    if (stored) {
      setUsers(JSON.parse(stored))
    } else {
      // Default 2 users
      const defaultUsers = [
        { id: '1', name: 'Anxo Taboada', email: 'anxo.taboada@gmail.com', role: 'master', isActive: true, centerIds: [], clientId: null },
        { id: '2', name: 'Anxo Robinson', email: 'anxo.taboada@robinson.com', role: 'clientAdmin', isActive: true, centerIds: ['rcjd'], clientId: 'robinson' },
      ]
      localStorage.setItem('hoteldocs_users', JSON.stringify(defaultUsers))
      setUsers(defaultUsers)
    }
    setLoading(false)
  }, [navigate])

  const filteredUsers = users.filter((u: any) =>
    search === '' || u.name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formName || !formEmail) { toast.error('Nombre y email obligatorios'); return }
    
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    
    const newUser = {
      id: Date.now().toString(),
      name: formName,
      email: formEmail,
      role: 'user',
      isActive: true,
      centerIds: [],
      clientId: null,
    }
    const updated = [...users, newUser]
    setUsers(updated)
    localStorage.setItem('hoteldocs_users', JSON.stringify(updated))
    
    toast.success('Usuario creado')
    setShowModal(false)
    setFormName('')
    setFormEmail('')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredUsers.length} usuarios</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {user.role === 'master' ? 'Master' : user.role === 'clientAdmin' ? 'Admin Cliente' : 'Usuario'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Nuevo usuario</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ej: Juan García" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="juan@robinson.com" required />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
