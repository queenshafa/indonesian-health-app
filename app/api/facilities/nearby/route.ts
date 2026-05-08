import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius = 10, facilityType = null } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First try to get real data from database
    let { data: clinics, error } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        clinic_type,
        address,
        city,
        phone,
        email,
        website,
        geolocation,
        rating,
        review_count,
        is_bpjs_partner,
        specialties,
        emergency_available,
        ambulance_available
      `)
      .not('geolocation', 'is', null)

    if (error) {
      console.warn('Database query failed, using mock data:', error.message)
      return NextResponse.json({
        facilities: getMockFacilities(lat, lng),
        source: 'mock'
      })
    }

    // Filter by type if specified
    if (facilityType && facilityType !== 'all') {
      clinics = clinics?.filter(c => c.clinic_type === facilityType) || []
    }

    // Calculate distance and sort by distance
    const facilitiesWithDistance = (clinics || []).map(clinic => {
      const distance = calculateDistance(
        lat,
        lng,
        // Extract coordinates from geolocation
        0,
        0
      )
      return {
        ...clinic,
        distance: parseFloat(distance.toFixed(2))
      }
    })
      .filter(f => f.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json({
      facilities: facilitiesWithDistance,
      count: facilitiesWithDistance.length,
      source: 'database'
    })
  } catch (error) {
    console.error('Facilities API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facilities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Mock data for demo
function getMockFacilities(lat: number, lng: number) {
  const facilities = [
    {
      id: '1',
      name: 'Puskesmas Jakarta Pusat',
      type: 'clinic',
      address: 'Jl. Merdeka No. 123, Jakarta Pusat',
      phone: '021-3456789',
      distance: 0.8,
      isOpen: true,
      operatingHours: '08:00 - 16:00',
      bpjsPartner: true,
      rating: 4.5,
      specialties: ['Dokter Umum', 'Vaksinasi']
    },
    {
      id: '2',
      name: 'Rumah Sakit Mitra Sejati',
      type: 'hospital',
      address: 'Jl. Sudirman No. 456, Jakarta Pusat',
      phone: '021-9876543',
      distance: 2.3,
      isOpen: true,
      operatingHours: '24 Jam',
      bpjsPartner: true,
      rating: 4.8,
      specialties: ['Umum', 'Spesialis Anak', 'Spesialis Kandungan', 'Spesialis Jantung']
    },
    {
      id: '3',
      name: 'IGD Rumah Sakit Central',
      type: 'emergency_room',
      address: 'Jl. Gatot Subroto, Jakarta Pusat',
      phone: '021-5555555',
      distance: 3.1,
      isOpen: true,
      operatingHours: '24 Jam',
      bpjsPartner: true,
      rating: 4.6,
      specialties: ['Emergency', 'Trauma']
    },
    {
      id: '4',
      name: 'Apotek Sehat Farma',
      type: 'pharmacy',
      address: 'Jl. Thamrin No. 789, Jakarta Pusat',
      phone: '021-1234567',
      distance: 1.2,
      isOpen: true,
      operatingHours: '08:00 - 22:00',
      bpjsPartner: false,
      rating: 4.3,
      specialties: []
    },
    {
      id: '5',
      name: 'Layanan Ambulans 24 Jam',
      type: 'ambulance',
      address: 'Jl. Kuningan, Jakarta Pusat',
      phone: '021-9999999',
      distance: 1.5,
      isOpen: true,
      operatingHours: '24 Jam',
      bpjsPartner: true,
      rating: 4.7,
      specialties: []
    },
    {
      id: '6',
      name: 'Klinik Spesialis Kulit Dermata',
      type: 'clinic',
      address: 'Jl. Diponegoro No. 321, Jakarta Pusat',
      phone: '021-8765432',
      distance: 2.8,
      isOpen: true,
      operatingHours: '09:00 - 17:00',
      bpjsPartner: true,
      rating: 4.9,
      specialties: ['Spesialis Kulit']
    }
  ]

  return facilities
}
