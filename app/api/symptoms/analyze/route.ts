import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

interface SymptomAnalysisRequest {
  symptoms: string[];
  duration?: string;
  severity?: "mild" | "moderate" | "severe";
  age?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SymptomAnalysisRequest = await request.json();

    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json({ error: "Symptoms required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key missing" },
        { status: 500 },
      );
    }

    const symptomList = body.symptoms.join(", ");

    const prompt = `
You are a helpful health information assistant. Analyze these symptoms and provide guidance (NOT a diagnosis).

Symptoms: ${symptomList}
Duration: ${body.duration || "not specified"}
Severity: ${body.severity || "not specified"}
Age: ${body.age || "not specified"}

Return ONLY valid JSON:
{
  "disclaimer": "...",
  "possible_conditions": [
    {"name": "...", "likelihood": "high|medium|low", "description": "..."}
  ],
  "urgency_level": "low|medium|high|emergency",
  "urgency_color": "green|yellow|orange|red",
  "immediate_actions": ["...", "..."],
  "when_to_see_doctor": "...",
  "red_flags": ["...", "..."],
  "follow_up_questions": ["...", "..."]
}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    let analysisResult;

    try {
      const result = await model.generateContent(prompt);

      const response = await result.response;
      const content = response.text();

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        analysisResult = jsonMatch
          ? JSON.parse(jsonMatch[0])
          : JSON.parse(content);
      } catch {
        analysisResult = {
          disclaimer:
            "⚠️ DISCLAIMER: This is NOT a medical diagnosis. Please consult a doctor.",
          analysis: content,
          urgency_level: "medium",
          urgency_color: "yellow",
          immediate_actions: [
            "Rest and hydrate",
            "Monitor symptoms",
            "Consult doctor if symptoms worsen",
          ],
        };
      }
    } catch (aiError: any) {
      console.error("Gemini AI Error:", aiError);

      if (aiError?.status === 429) {
        return NextResponse.json(
          {
            error: "AI quota exceeded. Please try again later.",
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          error: "AI service temporarily unavailable.",
        },
        { status: 500 },
      );
    }

    await supabase.from("health_records").insert({
      patient_id: user.id,
      record_type: "symptom_log",
      title: `Symptom Analysis: ${symptomList}`,
      description: `Duration: ${
        body.duration || "not specified"
      }, Severity: ${body.severity || "not specified"}`,
      symptoms: body.symptoms,
      ai_suggestion: JSON.stringify(analysisResult),
      urgency_level: analysisResult.urgency_level,
      record_date: new Date().toISOString().split("T")[0],
    });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Symptom analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze symptoms",
      },
      { status: 500 },
    );
  }
}
