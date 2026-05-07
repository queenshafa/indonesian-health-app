// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Get user's current location
export async function getUserLocation(): Promise<{
  latitude: number
  longitude: number
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(new Error(`Gagal mendapatkan lokasi: ${error.message}`))
      }
    )
  })
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} meter`
  }
  return `${km.toFixed(1)} km`
}

// Get major Indonesian cities for fallback locations
export const INDONESIAN_CITIES = {
  jakarta: { lat: -6.2088, lng: 106.8456 },
  surabaya: { lat: -7.2504, lng: 112.7508 },
  bandung: { lat: -6.9175, lng: 107.6011 },
  medan: { lat: 3.1949, lng: 98.6722 },
  semarang: { lat: -6.9665, lng: 110.4226 },
  makassar: { lat: -5.3521, lng: 119.4327 },
  palembang: { lat: -2.9761, lng: 104.7519 },
  yogyakarta: { lat: -7.7956, lng: 110.3695 },
  denpasar: { lat: -8.6705, lng: 115.2126 },
  batam: { lat: 1.1291, lng: 104.0068 },
}

// Convert city name to coordinates
export function getCityCoordinates(
  cityName: string
): { lat: number; lng: number } | null {
  const normalized = cityName.toLowerCase().replace(/\s/g, '')

  for (const [city, coords] of Object.entries(INDONESIAN_CITIES)) {
    if (city.includes(normalized) || normalized.includes(city)) {
      return coords
    }
  }

  return null
}
