import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch all clinics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const clinicType = searchParams.get('type')

    let query = supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false })

    if (city) {
      query = query.eq('city', city)
    }
    if (clinicType) {
      query = query.eq('clinic_type', clinicType)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ clinics: data || [] })
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    )
  }
}

// POST: Create new clinic
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      name,
      clinic_type,
      address,
      city,
      province,
      phone,
      email,
      website,
      is_bpjs_partner,
      specialties,
      emergency_available,
      ambulance_available
    } = body

    if (!name || !clinic_type || !address || !city) {
      return NextResponse.json(
        { error: 'Name, type, address, and city required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('clinics')
      .insert({
        name,
        clinic_type,
        address,
        city,
        province,
        phone,
        email,
        website,
        is_bpjs_partner: is_bpjs_partner || false,
        specialties: specialties || [],
        emergency_available: emergency_available || false,
        ambulance_available: ambulance_available || false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ clinic: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating clinic:', error)
    return NextResponse.json(
      { error: 'Failed to create clinic' },
      { status: 500 }
    )
  }
}

// PATCH: Update clinic
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('clinics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ clinic: data })
  } catch (error) {
    console.error('Error updating clinic:', error)
    return NextResponse.json(
      { error: 'Failed to update clinic' },
      { status: 500 }
    )
  }
}

// DELETE: Delete clinic
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
      .from('clinics')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting clinic:', error)
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    )
  }
}
