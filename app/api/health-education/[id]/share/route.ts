import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const articleId = params.id

    // Update shares count
    const { data, error } = await supabase
      .from('health_educations')
      .update({ shares_count: supabase.rpc('increment_shares', { article_id: articleId }) })
      .eq('id', articleId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { error: 'Failed to share article' },
      { status: 500 }
    )
  }
}
