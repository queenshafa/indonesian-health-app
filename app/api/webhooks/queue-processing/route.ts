import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("WEBHOOK RECEIVED:", body);

    const {
      job_id,
      patient_id,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      queue_number,
      estimated_wait_time,
      status,
      error_message,
    } = body;

    if (!job_id || !patient_id) {
      return NextResponse.json(
        { error: "job_id and patient_id required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 💀 IF ERROR CASE
    if (error_message && error_message !== "{}") {
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

    // 🚀 INSERT KE QUEUES (INI YANG KAMU MAU)
    const { data, error } = await supabase
      .from("queues")
      .insert({
        patient_id,
        doctor_id,
        clinic_id,
        appointment_date,
        appointment_time,
        queue_number,
        status: status || "waiting",
        estimated_wait_time_minutes:
          estimated_wait_time ?? queue_number * 30,
      })
      .select()
      .single();

    if (error) {
      console.error("QUEUE INSERT ERROR:", error);

      await supabase
        .from("async_jobs")
        .update({
          status: "failed",
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq("job_id", job_id);

      return NextResponse.json(
        { error: "Failed to insert queue" },
        { status: 500 }
      );
    }

    // ✅ UPDATE JOB SUCCESS
    await supabase
      .from("async_jobs")
      .update({
        status: "completed",
        result: data,
        completed_at: new Date().toISOString(),
      })
      .eq("job_id", job_id);

    return NextResponse.json({
      success: true,
      queue: data,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}