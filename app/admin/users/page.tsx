'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    bpjs: 0,
    private: 0,
    none: 0,
    withFamily: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users || [])
      
      const userList = data.users || []
      setStats({
        total: userList.length,
        bpjs: userList.filter((u: any) => u.health_insurance_type === 'bpjs').length,
        private: userList.filter((u: any) => u.health_insurance_type === 'private').length,
        none: userList.filter((u: any) => u.health_insurance_type === 'none').length,
        withFamily: userList.filter((u: any) => u.family_members_count > 0).length
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
        alert('Pengguna berhasil dihapus!')
      }
    } catch (error) {
      alert('Gagal menghapus pengguna')
    }
  }

  if (loading) return <div className="text-center py-8">Memuat...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <p className="text-gray-600 mt-1">Kelola data pengguna dan profil</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Pengguna</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.bpjs}</div>
              <div className="text-sm text-gray-600 mt-1">BPJS</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.private}</div>
              <div className="text-sm text-gray-600 mt-1">Privat</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.none}</div>
              <div className="text-sm text-gray-600 mt-1">Tanpa Asuransi</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.withFamily}</div>
              <div className="text-sm text-gray-600 mt-1">Dengan Keluarga</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Kota</th>
                <th className="text-left p-3">Asuransi</th>
                <th className="text-left p-3">BPJS Number</th>
                <th className="text-left p-3">Terdaftar</th>
                <th className="text-left p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada pengguna
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.full_name || 'N/A'}</td>
                    <td className="p-3 text-gray-600">{user.email || 'N/A'}</td>
                    <td className="p-3">{user.city || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.health_insurance_type === 'bpjs'
                          ? 'bg-green-100 text-green-800'
                          : user.health_insurance_type === 'private'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.health_insurance_type || 'Tidak ada'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{user.bpjs_number || '-'}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
