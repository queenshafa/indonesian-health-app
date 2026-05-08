import { createClient } from "@/lib/supabase/server";
import { sendJobToN8N } from "@/lib/n8n/send-job";
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

    // Check user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SymptomAnalysisRequest = await request.json();

    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: "Symptoms required" },
        { status: 400 }
      );
    }

    // Send job to N8N webhook
    const { job_id } = await sendJobToN8N("/symptom-analysis", {
      patient_id: user.id,
      symptoms: body.symptoms,
      duration: body.duration,
      severity: body.severity,
      age: body.age,
    });

    // Return immediately with job ID
    return NextResponse.json(
      {
        message: "Symptom analysis queued",
        job_id,
        status: "processing",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Symptom analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to queue symptom analysis",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // cek user login
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ambil body
    const body: SymptomAnalysisRequest = await request.json();

    if (!body.symptoms || body.symptoms.length === 0) {
      return NextResponse.json(
        { error: "Symptoms required" },
        { status: 400 }
      );
    }

    // cek api key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key missing" },
        { status: 500 }
      );
    }

    const symptomList = body.symptoms.join(", ");

    const prompt = `
You are a professional health information assistant.

Analyze these symptoms and provide general health guidance.
DO NOT provide a medical diagnosis.

Symptoms: ${symptomList}
Duration: ${body.duration || "not specified"}
Severity: ${body.severity || "not specified"}
Age: ${body.age || "not specified"}

Return ONLY valid JSON.

{
  "disclaimer": "...",
  "possible_conditions": [
    {
      "name": "...",
      "likelihood": "high|medium|low",
      "description": "..."
    }
  ],
  "urgency_level": "low|medium|high|emergency",
  "urgency_color": "green|yellow|orange|red",
  "immediate_actions": ["...", "..."],
  "when_to_see_doctor": "...",
  "red_flags": ["...", "..."],
  "follow_up_questions": ["...", "..."]
}
`;

    // init gemini
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // retry function
    async function generateWithRetry(
      retries = 3
    ): Promise<any> {

      for (let i = 0; i < retries; i++) {

        try {

          console.log("Generating AI response...");

          return await model.generateContent(prompt);

        } catch (error: any) {

          console.error("Gemini Error:", error);

          // handle rate limit
          if (
            error?.status === 429 &&
            i < retries - 1
          ) {

            const delay = (i + 1) * 60000;

            console.log(
              `Rate limited. Retrying in ${delay}ms`
            );

            await new Promise((resolve) =>
              setTimeout(resolve, delay)
            );

          } else {
            throw error;
          }
        }
      }
    }

    let analysisResult;

    try {

      const result = await generateWithRetry();

      const response = await result.response;

      const content = response.text();

      console.log("AI RESPONSE:", content);

      // parse json
      try {

        const jsonMatch = content.match(/\{[\s\S]*\}/);

        analysisResult = jsonMatch
          ? JSON.parse(jsonMatch[0])
          : JSON.parse(content);

      } catch {

        // fallback
        analysisResult = {
          disclaimer:
            "⚠️ This is NOT a medical diagnosis. Please consult a healthcare professional.",

          analysis: content,

          urgency_level: "medium",

          urgency_color: "yellow",

          immediate_actions: [
            "Rest and stay hydrated",
            "Monitor your symptoms",
            "Seek medical help if symptoms worsen",
          ],

          when_to_see_doctor:
            "Consult a doctor if symptoms continue.",

          red_flags: [
            "Difficulty breathing",
            "Severe chest pain",
          ],

          follow_up_questions: [
            "How long have symptoms lasted?",
            "Have symptoms worsened recently?",
          ],
        };
      }

    } catch (aiError: any) {

      console.error("Final AI Error:", aiError);

      if (aiError?.status === 429) {

        return NextResponse.json(
          {
            error:
              "AI quota exceeded. Please wait and try again later.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            "AI service temporarily unavailable.",
        },
        { status: 500 }
      );
    }

    // simpan ke database
    const { error: insertError } = await supabase
      .from("health_records")
      .insert({
        patient_id: user.id,

        record_type: "symptom_log",

        title: `Symptom Analysis: ${symptomList}`,

        description: `
Duration: ${body.duration || "not specified"},
Severity: ${body.severity || "not specified"}
        `,

        symptoms: body.symptoms,

        ai_suggestion: JSON.stringify(
          analysisResult
        ),

        urgency_level:
          analysisResult.urgency_level,

        record_date: new Date()
          .toISOString()
          .split("T")[0],
      });

    if (insertError) {

      console.error(
        "Supabase Insert Error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Failed to save health record",
        },
        { status: 500 }
      );
    }

    // sukses
    return NextResponse.json(analysisResult);

  } catch (error) {

    console.error(
      "Symptom analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to analyze symptoms",
      },
      { status: 500 }
    );
  }
}
