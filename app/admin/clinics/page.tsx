'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ClinicsManagement() {
  const [clinics, setClinic] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    bpjsPartner: 0,
    emergency: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [formData, setFormData] = useState({
    name: '',
    clinic_type: 'clinic',
    address: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    website: '',
    is_bpjs_partner: false,
    emergency_available: false,
    ambulance_available: false
  })

  useEffect(() => {
    fetchClinics()
  }, [])

  const fetchClinics = async () => {
    try {
      const response = await fetch('/api/admin/clinics')
      const data = await response.json()
      setClinic(data.clinics || [])
      
      const clinicList = data.clinics || []
      setStats({
        total: clinicList.length,
        bpjsPartner: clinicList.filter((c: any) => c.is_bpjs_partner).length,
        emergency: clinicList.filter((c: any) => c.emergency_available).length
      })
    } catch (error) {
      console.error('Failed to fetch clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create clinic')

      alert('Klinik berhasil ditambahkan!')
      setFormData({
        name: '',
        clinic_type: 'clinic',
        address: '',
        city: '',
        province: '',
        phone: '',
        email: '',
        website: '',
        is_bpjs_partner: false,
        emergency_available: false,
        ambulance_available: false
      })
      setActiveTab('list')
      fetchClinics()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus klinik ini?')) return

    try {
      const response = await fetch('/api/admin/clinics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        setClinic(clinics.filter(c => c.id !== id))
        alert('Klinik berhasil dihapus!')
      }
    } catch (error) {
      alert('Gagal menghapus klinik')
    }
  }

  if (loading) return <div className="text-center py-8">Memuat...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Klinik & Rumah Sakit</h1>
        <p className="text-gray-600 mt-1">Kelola data fasilitas kesehatan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Klinik</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.bpjsPartner}</div>
              <div className="text-sm text-gray-600 mt-1">BPJS Partner</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.emergency}</div>
              <div className="text-sm text-gray-600 mt-1">Dengan IGD</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Daftar Klinik</TabsTrigger>
          <TabsTrigger value="add">Tambah Klinik</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Nama</th>
                    <th className="text-left p-3">Tipe</th>
                    <th className="text-left p-3">Kota</th>
                    <th className="text-left p-3">Telepon</th>
                    <th className="text-left p-3">BPJS</th>
                    <th className="text-left p-3">IGD</th>
                    <th className="text-left p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">
                        Tidak ada klinik
                      </td>
                    </tr>
                  ) : (
                    clinics.map(clinic => (
                      <tr key={clinic.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{clinic.name}</td>
                        <td className="p-3 text-xs">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {clinic.clinic_type}
                          </span>
                        </td>
                        <td className="p-3">{clinic.city}</td>
                        <td className="p-3">{clinic.phone}</td>
                        <td className="p-3">
                          {clinic.is_bpjs_partner ? '✓' : '-'}
                        </td>
                        <td className="p-3">
                          {clinic.emergency_available ? '✓' : '-'}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDelete(clinic.id)}
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
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Nama Klinik"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <select
                    value={formData.clinic_type}
                    onChange={(e) => setFormData({ ...formData, clinic_type: e.target.value })}
                    className="border rounded px-3 py-2"
                  >
                    <option value="clinic">Klinik</option>
                    <option value="hospital">Rumah Sakit</option>
                    <option value="emergency_room">IGD</option>
                    <option value="pharmacy">Apotek</option>
                  </select>
                  <input
                    placeholder="Alamat"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="border rounded px-3 py-2 col-span-2"
                    required
                  />
                  <input
                    placeholder="Kota"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    placeholder="Provinsi"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    placeholder="Telepon"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border rounded px-3 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_bpjs_partner}
                      onChange={(e) => setFormData({ ...formData, is_bpjs_partner: e.target.checked })}
                    />
                    <span className="text-sm">BPJS Partner</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.emergency_available}
                      onChange={(e) => setFormData({ ...formData, emergency_available: e.target.checked })}
                    />
                    <span className="text-sm">Memiliki IGD</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ambulance_available}
                      onChange={(e) => setFormData({ ...formData, ambulance_available: e.target.checked })}
                    />
                    <span className="text-sm">Memiliki Ambulans</span>
                  </label>
                </div>

                <Button type="submit" className="w-full">
                  Tambah Klinik
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
