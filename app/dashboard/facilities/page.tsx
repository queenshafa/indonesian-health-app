'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Clock, AlertCircle } from 'lucide-react'

interface Facility {
  id: string
  name: string
  type: 'clinic' | 'hospital' | 'emergency_room' | 'pharmacy' | 'ambulance'
  address: string
  phone: string
  distance_km: number
  isOpen: boolean
  operatingHours: string
  bpjsPartner: boolean
  rating: number
  specialties?: string[]
}

const FACILITY_TYPES = {
  clinic: { label: 'Klinik', icon: '🏥' },
  hospital: { label: 'Rumah Sakit', icon: '🏨' },
  emergency_room: { label: 'IGD', icon: '🚨' },
  pharmacy: { label: 'Apotek', icon: '💊' },
  ambulance: { label: 'Ambulans', icon: '🚑' }
}

export default function FacilitiesPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // =========================
  // GET LOCATION
  // =========================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        () => {
          // fallback
          setUserLocation({ lat: -6.2088, lng: 106.8456 })
        }
      )
    }
  }, [])

  // =========================
  // FETCH DATA
  // =========================
const fetchFacilities = async () => {
  setLoading(true)

  try {
    const res = await fetch('/api/facilities/nearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        radius: 100
      })
    })

    const data = await res.json()

    console.log("RAW:", data)

    // =========================
    // FIX UTAMA DI SINI
    // =========================
    const results = data?.[0]?.results ?? []

    console.log("PARSED RESULTS:", results)

    setFacilities(results)

  } catch (err) {
    console.error(err)
    setFacilities([])
  } finally {
    setLoading(false)
  }
}

  // =========================
  // FILTER
  // =========================
  const filtered = selectedType
    ? facilities.filter(f => f.type === selectedType)
    : facilities

  const sorted = [...filtered].sort(
    (a, b) => a.distance_km - b.distance_km
  )

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          ← Kembali
        </Button>
        <h1 className="text-2xl font-bold">
          Cari Fasilitas Kesehatan
        </h1>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(FACILITY_TYPES).map(([key, val]) => (
          <Button
            key={key}
            variant={selectedType === key ? "default" : "outline"}
            onClick={() =>
              setSelectedType(selectedType === key ? null : key)
            }
          >
            {val.icon} {val.label}
          </Button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <p>Loading fasilitas...</p>
      )}

      {/* LIST */}
      {!loading && sorted.length > 0 && (
        <div className="space-y-4">
          {sorted.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-4 space-y-2">

                <div className="flex justify-between">
                  <h2 className="font-bold">{f.name}</h2>
                  <Badge>
                    {FACILITY_TYPES[f.type]?.icon} {f.type}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  {f.address}
                </p>

                <p className="text-sm">
                  📍 {f.distance_km.toFixed(1)} km
                </p>

                <p className="text-sm">
                  📞 {f.phone}
                </p>

                <p className="text-sm">
                  ⭐ {f.rating}
                </p>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && sorted.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto mb-2" />
            Tidak ada fasilitas ditemukan
          </CardContent>
        </Card>
      )}

    </div>
  )
}
