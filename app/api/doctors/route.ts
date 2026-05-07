import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch doctors with optional filters
export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const clinic_id = searchParams.get('clinic_id')
    const specialization = searchParams.get('specialization')
    const city = searchParams.get('city')

    let query = supabase
      .from('doctors')
      .select(`
        *,
        clinic:clinics(*),
        schedules:doctor_schedules(*),
        reviews:doctor_reviews(*)
      `)

    if (clinic_id) {
      query = query.eq('clinic_id', clinic_id)
    }

    if (specialization) {
      query = query.ilike('specialization', `%${specialization}%`)
    }

    if (city) {
      query = query.eq('clinic_id', (
        await supabase
          .from('clinics')
          .select('id')
          .eq('city', city)
      ).data?.map(c => c.id) || [])
    }

    const { data: doctors, error } = await query
      .eq('availability_status', 'available')
      .order('average_rating', { ascending: false })

    if (error) throw error

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Doctors GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}
