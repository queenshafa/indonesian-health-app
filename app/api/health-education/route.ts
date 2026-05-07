import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get published health education content, ordered by scheduled_at
    const { data, error } = await supabase
      .from('health_educations')
      .select('*')
      .eq('is_published', true)
      .order('scheduled_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch health education' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Health education fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST endpoint for N8N to create health education content
export async function POST(request: NextRequest) {
  try {
    // Verify N8N webhook token
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, category' },
        { status: 400 }
      )
    }

    // Insert health education content
    const { data, error } = await supabase
      .from('health_educations')
      .insert({
        title: body.title,
        content: body.content,
        category: body.category,
        difficulty_level: body.difficulty_level || 'easy',
        duration_minutes: body.duration_minutes || 5,
        image_url: body.image_url,
        source: body.source || 'N8N Workflow',
        author: body.author || 'Health Department',
        is_published: true,
        scheduled_at: body.scheduled_at || new Date().toISOString(),
        target_age_min: body.target_age_min,
        target_age_max: body.target_age_max,
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create health education: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Health education creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
