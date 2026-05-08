import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook receiver for N8N facility finder results
 * Called by N8N after facility processing is complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      job_id,
      user_id,
      latitude,
      longitude,
      radius_km,
      facility_type,
      facilities,
      status = "completed",
      error_message,
    } = body;

    if (!job_id || !user_id) {
      return NextResponse.json(
        { error: "job_id and user_id required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update job status in async_jobs table
    const { error: updateError } = await supabase
      .from("async_jobs")
      .update({
        status: error_message ? "failed" : "completed",
        result: {
          total_facilities: facilities?.length || 0,
          facilities,
          search_params: { latitude, longitude, radius_km, facility_type },
        },
        error_message,
        completed_at: new Date().toISOString(),
      })
      .eq("job_id", job_id);

    if (updateError) {
      console.error("Update job error:", updateError);
      return NextResponse.json(
        { error: "Failed to update job status" },
        { status: 500 }
      );
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
