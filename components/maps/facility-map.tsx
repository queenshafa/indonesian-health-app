'use client'

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'

const MapContainerAny = MapContainer as any
const TileLayerAny = TileLayer as any
const MarkerAny = Marker as any
const CircleAny = Circle as any

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

L.Icon.Default.mergeOptions(DefaultIcon.options)

const UserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22%230008DC%22%20/%3E%3C/svg%3E',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const facilityIconUrl = (color: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.8"/><path d="M12 7v5l4 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )}`

const createFacilityIcon = (color: string) =>
  new L.Icon({
    iconUrl: facilityIconUrl(color),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })

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
      <MapContainerAny
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayerAny
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Circle */}
        <CircleAny
          center={center}
          radius={500}
          pathOptions={{ color: 'blue', weight: 2, opacity: 0.5 }}
        />

        {/* User Marker */}
        <MarkerAny position={center} icon={UserIcon}>
          <Popup>Lokasi Anda</Popup>
        </MarkerAny>

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

          const FacilityIcon = createFacilityIcon(
            getColor(facility.facility_type)
          )

          return (
            <MarkerAny
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
            </MarkerAny>
          )
        })}
      </MapContainerAny>
    </div>
  )
}
