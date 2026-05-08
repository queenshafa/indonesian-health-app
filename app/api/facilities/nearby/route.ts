import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // =========================
    // PARSE BODY
    // =========================
    const body = await request.json()

    const {
      lat,
      lng,
      radius = 10,
      facility_type = 'clinic',
    } = body

    // =========================
    // VALIDATE INPUT
    // =========================
    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude required' },
        { status: 400 }
      )
    }

    const latitude = Number(lat)
    const longitude = Number(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // =========================
    // SUPABASE CLIENT
    // =========================
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // =========================
    // WEBHOOK URL
    // =========================
    const webhookUrl = process.env.N8N_WEBHOOK_FACILITY_FINDER

    if (!webhookUrl) {
      console.error('❌ Missing N8N webhook env')
      return NextResponse.json(
        { error: 'N8N webhook env missing' },
        { status: 500 }
      )
    }

    // =========================
    // CREATE JOB ID
    // =========================
    const job_id = randomUUID()

    const payload = {
      job_id,
      user_id: user?.id || null,
      latitude,
      longitude,
      radius,
      facility_type,

      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/facility-finder`,
    }

    // =========================
    // SAVE TO DB (async job)
    // =========================
    const { error: insertError } = await supabase
      .from('async_jobs')
      .insert({
        job_id,
        status: 'processing',
        payload,
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('❌ INSERT ERROR:', insertError)

      return NextResponse.json(
        { error: 'Failed to create async job' },
        { status: 500 }
      )
    }

    // =========================
    // DEBUG LOGS (IMPORTANT)
    // =========================
    console.log('🚀 Sending to N8N:', webhookUrl)
    console.log('📦 Payload:', payload)

    // =========================
    // SEND TO N8N WEBHOOK
    // =========================
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const text = await response.text()

      console.error('❌ N8N ERROR:', text)

      return NextResponse.json(
        {
          error: 'Failed sending to N8N',
          details: text,
        },
        { status: 500 }
      )
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return NextResponse.json(
      {
        success: true,
        job_id,
        status: 'processing',
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('❌ SERVER ERROR:', error)

    return NextResponse.json(
      {
        error: 'Failed to queue facility search',
      },
      { status: 500 }
    )
  }
}