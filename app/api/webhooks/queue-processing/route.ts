import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook receiver for N8N queue processing results
 * Called by N8N after queue/appointment processing is complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      job_id,
      patient_id,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      queue_number,
      estimated_wait_time,
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

    if (error_message) {
      // Update job status to failed
      await supabase
        .from("async_jobs")
        .update({
          status: "failed",
          error_message,
          completed_at: new Date().toISOString(),
        })
        .eq("job_id", job_id);

      return NextResponse.json({ success: true });
    }

    // Create queue entry
    const { data: newQueue, error: insertError } = await supabase
      .from("queues")
      .insert({
        patient_id,
        doctor_id,
        clinic_id,
        appointment_date,
        appointment_time,
        queue_number,
        status: "waiting",
        estimated_wait_time_minutes: estimated_wait_time || queue_number * 30,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Queue insert error:", insertError);
      await supabase
        .from("async_jobs")
        .update({
          status: "failed",
          error_message: insertError.message,
          completed_at: new Date().toISOString(),
        })
        .eq("job_id", job_id);

      return NextResponse.json(
        { error: "Failed to create queue" },
        { status: 500 }
      );
    }

    // Update job status to completed
    const { error: updateError } = await supabase
      .from("async_jobs")
      .update({
        status: "completed",
        result: newQueue,
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
