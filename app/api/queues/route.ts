import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch user's queues
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: queues, error } = await supabase
      .from('queues')
      .select(`
        *,
        doctor:doctors(*),
        clinic:clinics(*)
      `)
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(queues)
  } catch (error) {
    console.error('Queue GET error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch queues' },
      { status: 500 }
    )
  }
}

// POST: Create new queue/appointment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      reason_for_visit,
      consultation_type = 'general',
    } = body

    // Get the maximum queue number for this doctor on this date to ensure uniqueness
    const { data: maxQueueData, error: maxError } = await supabase
      .from('queues')
      .select('queue_number')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .order('queue_number', { ascending: false })
      .limit(1)

    if (maxError) throw maxError

    const queue_number = (maxQueueData?.[0]?.queue_number || 0) + 1

    const { data: newQueue, error } = await supabase
      .from('queues')
      .insert({
        patient_id: user.id,
        doctor_id,
        clinic_id,
        appointment_date,
        appointment_time,
        queue_number,
        reason_for_visit,
        consultation_type,
        status: 'waiting',
        estimated_wait_time_minutes: queue_number * 30,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newQueue, {
      status: 201,
    })
  } catch (error) {
    console.error('Queue POST error:', error)

    return NextResponse.json(
      { error: 'Failed to create queue' },
      { status: 500 }
    )
  }
}
