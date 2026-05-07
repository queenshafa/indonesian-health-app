'use client'

import { useEffect, useState } from 'react'

interface Facility {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  distance_km: number
  average_wait_time_minutes: number
  services: string[]
}

export default function EmergencyPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    getLocation()
  }, [])

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setLocation({ latitude, longitude })

        try {
          const response = await fetch(
            'YOUR_N8N_WEBHOOK_URL/webhook/find-facility',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: 'guest-user',
                latitude,
                longitude,
                facility_type: 'emergency',
                radius_km: 5,
                open_now: true,
              }),
            }
          )

          if (!response.ok) {
            throw new Error('Failed fetch emergency facilities')
          }

          const data = await response.json()

          setFacilities(data.results || [])
        } catch (err) {
          console.error(err)
          setError('Gagal mengambil fasilitas emergency')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error(err)
        setError('Izin lokasi ditolak')
        setLoading(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          🚑 Emergency Terdekat
        </h1>

        <p className="text-gray-600 mb-6">
          Menampilkan IGD dan fasilitas emergency terdekat dari lokasi Anda
        </p>

        {loading && (
          <div className="bg-white rounded-lg p-6 shadow">
            <p>Mencari fasilitas emergency...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {location && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded-lg mb-6">
            Lokasi ditemukan:
            <br />
            Latitude: {location.latitude}
            <br />
            Longitude: {location.longitude}
          </div>
        )}

        <div className="space-y-4">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-xl shadow p-5 border"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {facility.name}
                  </h2>

                  <p className="text-gray-600 mt-1">
                    {facility.address}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {facility.services?.map((service, idx) => (
                      <span
                        key={idx}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-700">
                    <p>📞 {facility.phone}</p>
                    <p>⭐ {facility.rating}</p>
                    <p>📍 {facility.distance_km?.toFixed(1)} km</p>
                    <p>
                      ⏱️ Estimasi tunggu:{' '}
                      {facility.average_wait_time_minutes} menit
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    facility.address
                  )}`}
                  target="_blank"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Buka Maps
                </a>
              </div>
            </div>
          ))}
        </div>

        {!loading && facilities.length === 0 && !error && (
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Tidak ada fasilitas emergency ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}