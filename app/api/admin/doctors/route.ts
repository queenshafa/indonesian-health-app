import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all doctors or specific doctor
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    let query = supabase
      .from('doctors')
      .select(`
        *,
        clinic:clinics(name),
        schedules:doctor_schedules(*)
      `)

    if (id) {
      query = query.eq('id', id).single()
    } else {
      query = query.order('full_name', { ascending: true })
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Doctor GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

// POST: Create new doctor
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      clinic_id,
      full_name,
      specialization,
      license_number,
      phone,
      email,
      bio,
      years_experience,
      consultation_fee,
    } = body

    // Validate required fields
    if (!full_name || !specialization || !clinic_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: newDoctor, error } = await supabase
      .from('doctors')
      .insert({
        clinic_id,
        full_name,
        specialization,
        license_number,
        phone,
        email,
        bio,
        years_experience,
        consultation_fee,
        availability_status: 'available',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newDoctor, { status: 201 })
  } catch (error) {
    console.error('Doctor POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}

// PUT: Update doctor
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID required' },
        { status: 400 }
      )
    }

    const { data: updatedDoctor, error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedDoctor)
  } catch (error) {
    console.error('Doctor PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}

// DELETE: Delete doctor
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Doctor DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}
