import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      job_id,
      patient_id,
      patient_email,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      queue_number,
      estimated_wait_time,
      error_message,
    } = body

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Jika ada error
    if (
      error_message &&
      error_message !== '{}' &&
      error_message !== 'null'
    ) {
      await supabase
        .from('async_jobs')
        .update({
          status: 'failed',
          error_message,
          completed_at: new Date().toISOString(),
        })
        .eq('job_id', job_id)

      return NextResponse.json({ success: true })
    }

    // Insert queue
    const { data: newQueue, error: insertError } = await supabase
      .from('queues')
      .insert({
        patient_id,
        patient_email,
        doctor_id,
        clinic_id,
        appointment_date,
        appointment_time,
        queue_number,
        status: 'waiting',
        estimated_wait_time_minutes:
          estimated_wait_time || queue_number * 30,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Update async_jobs
    await supabase
      .from('async_jobs')
      .update({
        status: 'completed',
        result: newQueue,
        completed_at: new Date().toISOString(),
      })
      .eq('job_id', job_id)

    return NextResponse.json({
      success: true,
      queue: newQueue,
    })
  } catch (error) {
    console.error('Webhook error:', error)

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}