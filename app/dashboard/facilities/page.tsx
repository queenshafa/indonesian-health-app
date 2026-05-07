'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Clock, AlertCircle, Navigation } from 'lucide-react'

interface Facility {
  id: string
  name: string
  type: 'clinic' | 'hospital' | 'emergency_room' | 'pharmacy' | 'ambulance'
  address: string
  phone: string
  distance: number
  isOpen: boolean
  operatingHours: string
  bpjsPartner: boolean
  rating: number
  specialties?: string[]
}

const FACILITY_TYPES = {
  clinic: { label: 'Klinik', color: 'bg-blue-100 text-blue-800', icon: '🏥' },
  hospital: { label: 'Rumah Sakit', color: 'bg-purple-100 text-purple-800', icon: '🏨' },
  emergency_room: { label: 'IGD', color: 'bg-red-100 text-red-800', icon: '🚨' },
  pharmacy: { label: 'Apotek', color: 'bg-green-100 text-green-800', icon: '💊' },
  ambulance: { label: 'Ambulans', color: 'bg-orange-100 text-orange-800', icon: '🚑' }
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied, using default location')
          // Default location (Jakarta)
          setUserLocation({ lat: -6.2088, lng: 106.8456 })
        }
      )
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchFacilities()
    }
  }, [userLocation])

  const fetchFacilities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/facilities/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          radius: 10
        })
      })
      const data = await response.json()
      setFacilities(data.facilities || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFacilities = selectedType
    ? facilities.filter(f => f.type === selectedType)
    : facilities

  const sortedFacilities = [...filteredFacilities].sort((a, b) => a.distance - b.distance)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cari Fasilitas Kesehatan</h1>
        <p className="text-gray-600 mt-2">Temukan klinik, rumah sakit, apotek, dan ambulans terdekat</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(FACILITY_TYPES).map(([type, info]) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            onClick={() => setSelectedType(selectedType === type ? null : type)}
            className="text-sm"
          >
            <span className="mr-1">{info.icon}</span>
            {info.label}
          </Button>
        ))}
      </div>

      {/* Emergency Button */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-4">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-red-900 mb-2">Butuh Bantuan Darurat?</p>
          <div className="flex gap-2">
            <Button variant="destructive">
              🚨 Panggil Ambulans Sekarang
            </Button>
            <Button variant="outline">
              📞 Hubungi IGD Terdekat
            </Button>
          </div>
        </div>
      </div>

      {/* Facilities List */}
      {loading ? (
        <Card>
          <CardContent className="pt-8">
            <p className="text-center text-gray-600">Memuat fasilitas terdekat...</p>
          </CardContent>
        </Card>
      ) : sortedFacilities.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ditemukan {sortedFacilities.length} fasilitas terdekat
          </p>
          {sortedFacilities.map(facility => (
            <Card key={facility.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left side: Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{facility.name}</h3>
                        <Badge className="mt-1">
                          {FACILITY_TYPES[facility.type as keyof typeof FACILITY_TYPES].icon}
                          {FACILITY_TYPES[facility.type as keyof typeof FACILITY_TYPES].label}
                        </Badge>
                      </div>
                      {facility.bpjsPartner && (
                        <Badge variant="outline">BPJS ✓</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{facility.address}</p>
                          <p className="text-gray-600">{facility.distance.toFixed(1)} km dari Anda</p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="font-medium">{facility.phone}</p>
                      </div>

                      <div className="flex gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{facility.operatingHours}</p>
                          <p className={facility.isOpen ? 'text-green-600' : 'text-red-600'}>
                            {facility.isOpen ? '🟢 Buka Sekarang' : '🔴 Tutup'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {facility.specialties && facility.specialties.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Spesialisasi:</p>
                        <div className="flex flex-wrap gap-1">
                          {facility.specialties.map(spec => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side: Actions */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                      <p className="text-sm text-gray-500">📍 Lokasi di peta</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Rute
                      </Button>
                      <Button className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Hubungi
                      </Button>
                    </div>

                    <Button variant="secondary" className="w-full">
                      💬 Reservasi / Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8">
            <p className="text-center text-gray-600">Tidak ada fasilitas yang ditemukan</p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Penting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">🚨 Kasus Darurat</p>
            <p className="text-gray-600">Jika Anda dalam kondisi serius, langsung ke IGD terdekat atau panggil ambulans</p>
          </div>
          <div>
            <p className="font-semibold mb-1">💳 Kartu BPJS</p>
            <p className="text-gray-600">Pastikan bawa kartu BPJS ke fasilitas yang ditunjukkan badge BPJS ✓</p>
          </div>
          <div>
            <p className="font-semibold mb-1">📱 Reservasi Online</p>
            <p className="text-gray-600">Banyak fasilitas menerima reservasi online melalui chat untuk menghemat waktu antri</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
