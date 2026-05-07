'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DoctorBookingModal from './doctor-booking-modal'

interface Doctor {
  id: string
  full_name: string
  specialization: string
  years_experience: number
  average_rating: number
  empathy_rating: number
  communication_rating: number
  avatar_url?: string
  clinic?: {
    name: string
    city: string
    phone: string
  }
  schedules?: any[]
}

interface DoctorSearchProps {
  onQueueCreated?: () => void
}

export default function DoctorSearch({ onQueueCreated }: DoctorSearchProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const specializations = [
    'Umum',
    'Gigi',
    'Anak',
    'Kulit',
    'Jantung',
    'Paru',
    'Mata',
  ]

  useEffect(() => {
    fetchDoctors()
  }, [selectedSpecialization])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedSpecialization) {
        params.append('specialization', selectedSpecialization)
      }

      const response = await fetch(`/api/doctors?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch doctors')
      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Dokter</CardTitle>
          <CardDescription>Temukan dokter terbaik sesuai kebutuhan Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Cari nama dokter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Spesialisasi</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedSpecialization === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedSpecialization('')}
              >
                Semua
              </Badge>
              {specializations.map((spec) => (
                <Badge
                  key={spec}
                  variant={selectedSpecialization === spec ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedSpecialization(spec)}
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Memuat dokter...</p>
        ) : filteredDoctors.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Tidak ada dokter yang ditemukan</p>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center text-2xl">
                      👨‍⚕️
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{doctor.full_name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {doctor.years_experience || 0} tahun pengalaman
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-500">
                          ⭐ {doctor.average_rating.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">Empati</p>
                        <p className="font-semibold text-blue-600">{doctor.empathy_rating.toFixed(1)}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-gray-600">Komunikasi</p>
                        <p className="font-semibold text-green-600">{doctor.communication_rating.toFixed(1)}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-gray-600">Klinik</p>
                        <p className="font-semibold text-purple-600">{doctor.clinic?.city}</p>
                      </div>
                    </div>

                    {/* Clinic Info */}
                    <p className="text-sm text-gray-600 mb-3">
                      {doctor.clinic?.name}
                    </p>

                    {/* Action */}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDoctor(doctor)
                        setShowBookingModal(true)
                      }}
                    >
                      Booking Jadwal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <DoctorBookingModal
          doctor={selectedDoctor}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false)
            onQueueCreated?.()
          }}
        />
      )}
    </div>
  )
}
