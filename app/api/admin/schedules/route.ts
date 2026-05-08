import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch schedules
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctor_id')

    let query = supabase
      .from('doctor_schedules')
      .select(`
        *,
        doctor:doctors(full_name, specialization)
      `)

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    const { data, error } = await query.order('day_of_week', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Schedule GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST: Create schedule
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      doctor_id,
      day_of_week,
      start_time,
      end_time,
      consultation_slot_duration_minutes,
      max_patients_per_session,
    } = body

    if (!doctor_id || !day_of_week || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: newSchedule, error } = await supabase
      .from('doctor_schedules')
      .insert({
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        consultation_slot_duration_minutes: consultation_slot_duration_minutes || 30,
        max_patients_per_session: max_patients_per_session || 20,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newSchedule, { status: 201 })
  } catch (error) {
    console.error('Schedule POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}

// PUT: Update schedule
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID required' },
        { status: 400 }
      )
    }

    const { data: updatedSchedule, error } = await supabase
      .from('doctor_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error('Schedule PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

// DELETE: Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('doctor_schedules')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Schedule DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
