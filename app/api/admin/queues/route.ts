import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkIsAdmin } from '@/lib/auth/check-admin'

// GET: Fetch all queues for admin dashboard
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

    // Get all queues with related data
    const { data: queues, error } = await supabase
      .from('queues')
      .select(`
        *,
        doctor:doctors(*),
        clinic:clinics(*),
        patient:profiles(*)
      `)
      .order('appointment_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(queues)
  } catch (error) {
    console.error('Admin queue GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queues' },
      { status: 500 }
    )
  }
}

// PUT: Update queue status (admin only)
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

    const { queue_id, status } = body

    if (!queue_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: queue_id, status' },
        { status: 400 }
      )
    }

    const { data: updatedQueue, error } = await supabase
      .from('queues')
      .update({ status })
      .eq('id', queue_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedQueue)
  } catch (error) {
    console.error('Admin queue PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update queue' },
      { status: 500 }
    )
  }
}

// DELETE: Cancel a queue (admin only)
export async function DELETE(request: NextRequest) {
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

    const { queue_id } = body

    if (!queue_id) {
      return NextResponse.json(
        { error: 'Missing required field: queue_id' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('queues')
      .update({ status: 'cancelled' })
      .eq('id', queue_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin queue DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel queue' },
      { status: 500 }
    )
  }
}
