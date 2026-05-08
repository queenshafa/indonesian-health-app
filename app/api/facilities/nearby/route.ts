import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {

  try {

    const {
      lat,
      lng,
      radius = 10,
      facility_type = "clinic"
    } = await request.json()

    // =========================
    // VALIDATE INPUT
    // =========================

    if (
      lat === undefined ||
      lng === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'Latitude and longitude required',
        },
        { status: 400 }
      )
    }

    const latitude = Number(lat)
    const longitude = Number(lng)

    if (
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid coordinates',
        },
        { status: 400 }
      )
    }

    // =========================
    // CONNECT SUPABASE
    // =========================

    const supabase = await createClient()

    let query =
      supabase
        .from('clinics')
        .select('*')

    // filter type kalau bukan all
    if (
      facility_type &&
      facility_type !== 'all'
    ) {
      query =
        query.eq(
          'clinic_type',
          facility_type
        )
    }

    const {
      data: clinics,
      error
    } = await query

    if (error) {

      console.error(
        'Supabase Error:',
        error
      )

      return NextResponse.json(
        {
          error:
            'Failed to fetch clinics',
        },
        { status: 500 }
      )
    }

    // =========================
    // PROCESS DISTANCE
    // =========================

    const facilities = (clinics || [])

      .map((clinic) => {

        const distance =
          calculateDistance(
            latitude,
            longitude,
            Number(clinic.latitude),
            Number(clinic.longitude)
          )

        return {

          id: clinic.id,

          name: clinic.name,

          clinic_type:
            clinic.clinic_type,

          address:
            clinic.address,

          city:
            clinic.city,

          phone:
            clinic.phone,

          latitude:
            clinic.latitude,

          longitude:
            clinic.longitude,

          rating:
            clinic.rating,

          distance_km:
            Number(
              distance.toFixed(1)
            ),

          specialties:
            clinic.specialties || [],

          services:
            clinic.services || [],

          operating_hours:
            clinic.operating_hours,

          average_wait_time_minutes:
            clinic.average_wait_time_minutes || 15,
        }
      })

      .filter(
        (clinic) =>
          clinic.distance_km <= radius
      )

      .sort(
        (a, b) =>
          a.distance_km -
          b.distance_km
      )

    // =========================
    // SEND TO N8N WEBHOOK
    // =========================

    let webhookData = null

    try {

      const webhookResponse =
        await fetch(
          process.env
            .N8N_WEBHOOK_FACILITY_FINDER!,
          {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({

              latitude,

              longitude,

              radius_km:
                radius,

              facility_type,

              total_facilities:
                facilities.length,

              facilities,
            }),
          }
        )

      webhookData =
        await webhookResponse.json()

    } catch (webhookError) {

      console.error(
        'Webhook Error:',
        webhookError
      )

      webhookData = {
        success: false,
        message:
          'Webhook failed',
      }
    }

    // =========================
    // RETURN RESPONSE
    // =========================

    return NextResponse.json({

      success: true,

      total_facilities:
        facilities.length,

      facilities,

      webhook_response:
        webhookData,
    })

  } catch (error) {

    console.error(
      'Server Error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to fetch facilities',
      },
      { status: 500 }
    )
  }
}

// =========================
// DISTANCE CALCULATOR
// =========================

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {

  const R = 6371

  const dLat =
    toRad(lat2 - lat1)

  const dLon =
    toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +

    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *

    Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}

function toRad(value: number) {

  return (
    value * Math.PI
  ) / 180
}