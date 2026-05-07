import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

interface SymptomAnalysisRequest {
  symptoms: string[]
  duration?: string
  severity?: 'mild' | 'moderate' | 'severe'
  age?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SymptomAnalysisRequest = await request.json()

    // Validate input
    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms required' },
        { status: 400 }
      )
    }

    // Create prompt for symptom analysis
    const symptomList = body.symptoms.join(', ')
    const prompt = `You are a helpful health information assistant. Analyze these symptoms and provide guidance (NOT a diagnosis - that requires a doctor).

Symptoms: ${symptomList}
Duration: ${body.duration || 'not specified'}
Severity: ${body.severity || 'not specified'}
Patient Age: ${body.age || 'not specified'}

IMPORTANT: You must:
1. Disclaimer: Start with "⚠️ DISCLAIMER: This is NOT a medical diagnosis. Please see a doctor for proper evaluation."
2. Provide 3-5 common conditions that could cause these symptoms
3. Rate urgency (Low/Medium/High/Emergency - green/yellow/orange/red)
4. Suggest immediate actions (rest, hydration, over-the-counter remedies if safe)
5. List when to see a doctor
6. Ask about red flag symptoms

Format response as JSON with:
{
  "disclaimer": "...",
  "possible_conditions": [{"name": "...", "likelihood": "high|medium|low", "description": "..."}],
  "urgency_level": "low|medium|high|emergency",
  "urgency_color": "green|yellow|orange|red",
  "immediate_actions": ["...", "..."],
  "when_to_see_doctor": "...",
  "red_flags": ["...", "..."],
  "follow_up_questions": ["...", "..."]
}`

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful healthcare information assistant. Always include medical disclaimers and encourage users to seek professional medical advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    let analysisResult

    try {
      // Extract JSON from response
      const jsonMatch = content?.match(/\{[\s\S]*\}/)
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content || '{}')
    } catch {
      // Fallback if JSON parsing fails
      analysisResult = {
        disclaimer:
          '⚠️ DISCLAIMER: This is NOT a medical diagnosis. Please see a doctor for proper evaluation.',
        analysis: content,
        urgency_level: 'medium',
        urgency_color: 'yellow',
        immediate_actions: [
          'Rest and stay hydrated',
          'Monitor your symptoms',
          'See a doctor if symptoms persist or worsen',
        ],
      }
    }

    // Save to health records
    await supabase.from('health_records').insert({
      patient_id: user.id,
      record_type: 'symptom_log',
      title: `Symptom Analysis: ${symptomList}`,
      description: `Duration: ${body.duration || 'not specified'}, Severity: ${body.severity || 'not specified'}`,
      symptoms: body.symptoms,
      ai_suggestion: analysisResult.analysis || JSON.stringify(analysisResult),
      urgency_level: analysisResult.urgency_level,
      record_date: new Date().toISOString().split('T')[0],
    })

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Symptom analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    )
  }
}
