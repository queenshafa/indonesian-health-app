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
    const { job_id, responseBody } = await sendJobToN8N("symptom-analysis", {
      patient_id: user.id,
      symptoms: body.symptoms,
      duration: body.duration,
      severity: body.severity,
      age: body.age,
    });

    if (responseBody && typeof responseBody === 'object') {
      if ('analysis_result' in responseBody && responseBody.analysis_result) {
        const analysis = responseBody.analysis_result as any;
        const possibleConditions = Array.isArray(analysis.possible_conditions)
          ? analysis.possible_conditions.map((item: any) =>
              typeof item === 'string'
                ? { name: item, likelihood: 'low', description: '' }
                : item
            )
          : [];

        return NextResponse.json(
          {
            message: "Symptom analysis completed",
            job_id,
            status: "completed",
            disclaimer: analysis.disclaimer ?? "Hasil analisis awal.",
            possible_conditions: possibleConditions,
            urgency_level: analysis.urgency_level ?? "medium",
            urgency_color: analysis.urgency_color ?? "yellow",
            immediate_actions: analysis.recommended_actions ?? analysis.immediate_actions ?? [],
            when_to_see_doctor: analysis.when_to_see_doctor ?? analysis.additional_notes ?? "",
            red_flags: analysis.red_flags ?? [],
            follow_up_questions: analysis.follow_up_questions ?? [],
          },
          { status: 200 }
        );
      }

      if (Array.isArray((responseBody as any).possible_conditions)) {
        return NextResponse.json(
          {
            message: "Symptom analysis completed",
            job_id,
            status: "completed",
            ...responseBody,
          },
          { status: 200 }
        );
      }
    }

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
