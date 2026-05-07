import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius = 10 } = await request.json()

    const supabase = await createClient()

    // PostGIS query to find facilities within radius
    const { data, error } = await supabase.rpc('nearby_facilities', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radius
    })

    if (error) {
      console.error('Error:', error)
      // Return mock data for demo if RPC fails
      return NextResponse.json({
        facilities: getMockFacilities(lat, lng)
      })
    }

    return NextResponse.json({
      facilities: data || getMockFacilities(lat, lng)
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    )
  }
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
