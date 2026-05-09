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
