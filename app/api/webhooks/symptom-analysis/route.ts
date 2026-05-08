import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook receiver for N8N symptom analysis results
 * Called by N8N after AI analysis is complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      job_id,
      patient_id,
      symptoms,
      duration,
      severity,
      age,
      analysis_result,
      status = "completed",
      error_message,
    } = body;

    if (!job_id || !patient_id) {
      return NextResponse.json(
        { error: "job_id and patient_id required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Save analysis result to health_records
    const { error: insertError } = await supabase
      .from("health_records")
      .insert({
        patient_id,
        record_type: "symptom_log",
        title: `Symptom Analysis: ${symptoms.join(", ")}`,
        description: `Duration: ${duration || "not specified"}, Severity: ${severity || "not specified"}`,
        symptoms,
        ai_suggestion: JSON.stringify(analysis_result),
        urgency_level: analysis_result?.urgency_level || "medium",
        record_date: new Date().toISOString().split("T")[0],
      });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json(
        { error: "Failed to save health record" },
        { status: 500 }
      );
    }

    // Update job status in async_jobs table
    const { error: updateError } = await supabase
      .from("async_jobs")
      .update({
        status: error_message ? "failed" : "completed",
        result: analysis_result,
        error_message,
        completed_at: new Date().toISOString(),
      })
      .eq("job_id", job_id);

    if (updateError) {
      console.error("Update job error:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
