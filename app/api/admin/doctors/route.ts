import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth/check-admin'

// GET: Fetch all doctors
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw error

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Admin doctors GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

// PUT: Update doctor availability
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    const { doctor_id, is_available } = body

    if (!doctor_id || is_available === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: doctor_id, is_available' },
        { status: 400 }
      )
    }

    const { data: updatedDoctor, error } = await supabase
      .from('doctors')
      .update({ is_available })
      .eq('id', doctor_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedDoctor)
  } catch (error) {
    console.error('Admin doctors PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}
