'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface DoctorFormProps {
  clinicId: string
  onSuccess?: () => void
}

export function DoctorForm({ clinicId, onSuccess }: DoctorFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    license_number: '',
    phone: '',
    email: '',
    years_experience: 0,
    consultation_fee: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...formData
        })
      })

      if (!response.ok) throw new Error('Failed to create doctor')

      alert('Doctor berhasil ditambahkan!')
      setFormData({
        full_name: '',
        specialization: '',
        license_number: '',
        phone: '',
        email: '',
        years_experience: 0,
        consultation_fee: 0
      })
      onSuccess?.()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Dokter</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nama Lengkap"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              placeholder="Spesialisasi"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
            <Input
              placeholder="Nomor Lisensi"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            />
            <Input
              placeholder="Telepon"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Tahun Pengalaman"
              type="number"
              value={formData.years_experience}
              onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Tambah Dokter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
