'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'

interface Facility {
  id: string
  name: string
  address: string
  phone?: string
  facility_type: string
  distance_km?: number
  geolocation?: { latitude: number; longitude: number }
}

interface FacilityMapProps {
  facilities: Facility[]
  userLocation: { lat: number; lng: number }
  selectedFacility?: string
  onSelectFacility?: (id: string) => void
}

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const UserIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzAwMDhDQyIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

L.Marker.prototype.setIcon(DefaultIcon)

export function FacilityMap({
  facilities,
  userLocation,
  selectedFacility,
  onSelectFacility,
}: FacilityMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-96 bg-gray-200 rounded-lg" />

  // Calculate bounds to fit all markers
  const center: [number, number] = [userLocation.lat, userLocation.lng]

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 h-96">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Circle */}
        <Circle
          center={center}
          radius={500}
          pathOptions={{ color: 'blue', weight: 2, opacity: 0.5 }}
        />

        {/* User Marker */}
        <Marker position={center} icon={UserIcon}>
          <Popup>Lokasi Anda</Popup>
        </Marker>

        {/* Facility Markers */}
        {facilities.map((facility) => {
          if (!facility.geolocation) return null

          const position: [number, number] = [
            facility.geolocation.latitude,
            facility.geolocation.longitude,
          ]

          // Get color based on facility type
          const getColor = (type: string) => {
            switch (type) {
              case 'hospital':
                return '#DC2626'
              case 'emergency_room':
                return '#FF6B6B'
              case 'clinic':
                return '#2563EB'
              case 'pharmacy':
                return '#059669'
              case 'ambulance':
                return '#EF4444'
              default:
                return '#666666'
            }
          }

          const FacilityIcon = L.icon({
            iconUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iJHtnaWZlQ29sb3IodHlwZSl9IiBmaWxsLW9wYWNpdHk9IjAuOCIvPjwvc3ZnPg==`.replace(
              '${getColor(facility.facility_type)}',
              getColor(facility.facility_type)
            ),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
          })

          return (
            <Marker
              key={facility.id}
              position={position}
              icon={FacilityIcon}
              eventHandlers={{
                click: () => onSelectFacility?.(facility.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-sm">{facility.name}</h3>
                  <p className="text-xs text-gray-600">{facility.address}</p>
                  {facility.phone && (
                    <p className="text-xs text-blue-600 mt-1">{facility.phone}</p>
                  )}
                  {facility.distance_km && (
                    <p className="text-xs text-gray-500 mt-1">
                      Jarak: {facility.distance_km.toFixed(1)} km
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
