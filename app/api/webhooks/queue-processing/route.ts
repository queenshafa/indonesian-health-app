import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook receiver for N8N queue processing results
 * Called by N8N after queue/appointment processing is complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

const rawPayload = Array.isArray(body) ? body[0] : body;

const payload =
  rawPayload &&
  typeof rawPayload === 'object' &&
  rawPayload !== null
    ? 'body' in rawPayload &&
      typeof rawPayload.body === 'object' &&
      rawPayload.body !== null
      ? rawPayload.body
      : 'data' in rawPayload &&
        typeof rawPayload.data === 'object' &&
        rawPayload.data !== null
      ? rawPayload.data
      : rawPayload
    : rawPayload;

    const {
      job_id,
      patient_id,
      patient_email,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      queue_number,
      estimated_wait_time,
      status = "completed",
      error_message,
    } = payload as Record<string, unknown>;

    if (!job_id) {
      return NextResponse.json(
        { error: "job_id required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const hasErrorMessage = (() => {
      if (error_message == null) return false;
      if (typeof error_message === "string") {
        const trimmed = error_message.trim();
        return trimmed !== "" && trimmed !== "{}" && trimmed.toLowerCase() !== "null";
      }
      if (typeof error_message === "object") {
        return Object.keys(error_message).length > 0;
      }
      return true;
    })();

    if (hasErrorMessage) {
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

    const normalizedQueueNumber =
      typeof queue_number === "number"
        ? queue_number
        : Number(queue_number);
    const normalizedEstimatedWaitTime =
      typeof estimated_wait_time === "number"
        ? estimated_wait_time
        : Number(estimated_wait_time);

    const queueRow: Record<string, unknown> = {
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      queue_number: Number.isFinite(normalizedQueueNumber)
        ? normalizedQueueNumber
        : null,
      patient_email: typeof patient_email === "string" ? patient_email : null,
      status: "waiting",
      estimated_wait_time_minutes: Number.isFinite(normalizedEstimatedWaitTime)
        ? normalizedEstimatedWaitTime
        : Number.isFinite(normalizedQueueNumber)
        ? normalizedQueueNumber * 30
        : null,
    };

    if (patient_id) {
      queueRow.patient_id = patient_id;
    }

    const { data: newQueue, error: insertError } = await supabase
      .from("queues")
      .insert(queueRow)
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
