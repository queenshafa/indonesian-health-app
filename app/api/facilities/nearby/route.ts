import { createClient } from '@/lib/supabase/server'
import { sendJobToN8N } from '@/lib/n8n/send-job'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      lat,
      lng,
      radius = 10,
      facility_type = "clinic"
    } = await request.json()

    // Validate input
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

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Send job to N8N webhook
    const { job_id } = await sendJobToN8N("/facility-finder", {
      user_id: user?.id,
      latitude,
      longitude,
      radius_km: radius,
      facility_type,
    })

    // Return immediately with job ID
    return NextResponse.json(
      {
        message: "Facility search queued",
        job_id,
        status: "processing",
      },
      { status: 202 }
    )

  } catch (error) {
    console.error('Server Error:', error)

    return NextResponse.json(
      { error: 'Failed to queue facility search' },
      { status: 500 }
    )
  }
}
