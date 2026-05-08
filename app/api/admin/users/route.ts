import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch all users/profiles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (city) {
      query = query.eq('city', city)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ users: data || [] })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PATCH: Update user profile
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
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE: Delete user
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

    // Note: Actual user deletion happens through Supabase Auth
    // This just marks profile as inactive or similar
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
