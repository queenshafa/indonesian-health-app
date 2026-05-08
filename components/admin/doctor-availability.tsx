'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Doctor {
  id: string
  full_name: string
  specialization: string
  is_available: boolean
  clinic?: { name: string }
}

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/admin/doctors')
      if (!response.ok) throw new Error('Failed to fetch doctors')
      const data = await response.json()
      setDoctors(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading doctors')
    } finally {
      setLoading(false)
    }
  }

  const toggleDoctorAvailability = async (doctorId: string, isAvailable: boolean) => {
    try {
      const response = await fetch('/api/admin/doctors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId, is_available: !isAvailable }),
      })

      if (!response.ok) throw new Error('Failed to update doctor')

      toast.success(`Status dokter diperbarui`)
      fetchDoctors()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error updating doctor')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Memuat data dokter...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ketersediaan Dokter</CardTitle>
          <CardDescription>
            Total dokter: {doctors.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
              <p className="text-red-900">❌ {error}</p>
            </div>
          )}

          {doctors.length === 0 ? (
            <p className="text-gray-600">Tidak ada dokter terdaftar</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{doctor.full_name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        {doctor.clinic && (
                          <p className="text-xs text-gray-500">{doctor.clinic.name}</p>
                        )}
                      </div>
                      <Badge
                        className={
                          doctor.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {doctor.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={doctor.is_available ? 'destructive' : 'default'}
                    onClick={() => toggleDoctorAvailability(doctor.id, doctor.is_available)}
                    className="w-full"
                  >
                    {doctor.is_available ? 'Tandai Tidak Tersedia' : 'Tandai Tersedia'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
