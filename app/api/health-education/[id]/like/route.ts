import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const articleId = params.id

    // Update likes count
    const { data, error } = await supabase
      .from('health_educations')
      .update({ likes_count: supabase.rpc('increment_likes', { article_id: articleId }) })
      .eq('id', articleId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Failed to like article' },
      { status: 500 }
    )
  }
}
