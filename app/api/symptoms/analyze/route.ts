import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest
) {
  try {

    const supabase =
      await createClient();

    const {
      job_id,
      result,
    } = await request.json();

    // update async_jobs
    await supabase
      .from("async_jobs")
      .update({
        status: "completed",
        result,
        completed_at:
          new Date().toISOString(),
      })
      .eq("job_id", job_id);

    return NextResponse.json({
      success: true,
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
