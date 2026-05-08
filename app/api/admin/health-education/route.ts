import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch all health education content
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const isPublished = searchParams.get('published')

    let query = supabase
      .from('health_educations')
      .select('*')
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }
    if (isPublished !== null) {
      query = query.eq('is_published', isPublished === 'true')
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ educations: data || [] })
  } catch (error) {
    console.error('Error fetching health educations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health educations' },
      { status: 500 }
    )
  }
}

// POST: Create new health education
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      title,
      content,
      category,
      difficulty_level,
      image_url,
      author,
      target_age_min,
      target_age_max,
      is_published
    } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('health_educations')
      .insert({
        title,
        content,
        category,
        difficulty_level: difficulty_level || 'easy',
        image_url,
        author: author || 'Admin',
        target_age_min,
        target_age_max,
        is_published: is_published !== false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ education: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating health education:', error)
    return NextResponse.json(
      { error: 'Failed to create health education' },
      { status: 500 }
    )
  }
}

// PATCH: Update health education
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
      .from('health_educations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ education: data })
  } catch (error) {
    console.error('Error updating health education:', error)
    return NextResponse.json(
      { error: 'Failed to update health education' },
      { status: 500 }
    )
  }
}

// DELETE: Delete health education
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
      .from('health_educations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting health education:', error)
    return NextResponse.json(
      { error: 'Failed to delete health education' },
      { status: 500 }
    )
  }
}
