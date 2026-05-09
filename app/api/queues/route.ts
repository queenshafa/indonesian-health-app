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

    // Import sendJobToN8N
    const { sendJobToN8N } = await import('@/lib/n8n/send-job')

    // Send job to N8N webhook
    const { job_id } = await sendJobToN8N("queue-processing", {
      patient_id: user.id,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      reason_for_visit,
      consultation_type,
    })

    // Return immediately with job ID
    return NextResponse.json(
      {
        message: "Queue appointment queued",
        job_id,
        status: "processing",
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('Queue POST error:', error)

    return NextResponse.json(
      { error: 'Failed to queue appointment' },
      { status: 500 }
    )
  }
}