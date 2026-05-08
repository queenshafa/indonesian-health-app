import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch all queues with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const doctorId = searchParams.get('doctorId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    let query = supabase
      .from('queues')
      .select(`
        *,
        doctors:doctor_id(full_name, specialization),
        patients:patient_id(full_name, phone),
        clinics:clinic_id(name)
      `)
      .order('created_at', { ascending: false })

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (date) {
      query = query.eq('appointment_date', date)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ queues: data || [] })
  } catch (error) {
    console.error('Error fetching queues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queues' },
      { status: 500 }
    )
  }
}

// PATCH: Update queue status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { id, status, estimated_wait_time_minutes, queue_number } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('queues')
      .update({
        status,
        estimated_wait_time_minutes,
        queue_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ queue: data })
  } catch (error) {
    console.error('Error updating queue:', error)
    return NextResponse.json(
      { error: 'Failed to update queue' },
      { status: 500 }
    )
  }
}

// DELETE: Cancel queue
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('queues')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling queue:', error)
    return NextResponse.json(
      { error: 'Failed to cancel queue' },
      { status: 500 }
    )
  }
}
