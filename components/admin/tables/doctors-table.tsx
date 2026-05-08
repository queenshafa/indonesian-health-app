'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Doctor {
  id: string
  full_name: string
  specialization: string
  phone: string
  email: string
  years_experience: number
  consultation_fee: number
}

export function DoctorsTable() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/admin/doctors')
      const data = await response.json()
      setDoctors(data.doctors || [])
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus dokter ini?')) return

    try {
      const response = await fetch('/api/admin/doctors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        setDoctors(doctors.filter(d => d.id !== id))
        alert('Dokter berhasil dihapus!')
      }
    } catch (error) {
      alert('Gagal menghapus dokter')
    }
  }

  if (loading) return <div className="text-center py-8">Memuat...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Dokter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nama</th>
                <th className="text-left p-2">Spesialisasi</th>
                <th className="text-left p-2">Telepon</th>
                <th className="text-left p-2">Pengalaman (Tahun)</th>
                <th className="text-left p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Tidak ada dokter
                  </td>
                </tr>
              ) : (
                doctors.map(doctor => (
                  <tr key={doctor.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{doctor.full_name}</td>
                    <td className="p-2">{doctor.specialization}</td>
                    <td className="p-2">{doctor.phone}</td>
                    <td className="p-2">{doctor.years_experience}</td>
                    <td className="p-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
