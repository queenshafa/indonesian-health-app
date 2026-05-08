import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/jobs/[job_id]
 * Check the status of an async job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const { job_id } = await params;

    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from("async_jobs")
      .select("*")
      .eq("job_id", job_id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      job_id,
      status: job.status,
      result: job.result,
      error_message: job.error_message,
      created_at: job.created_at,
      completed_at: job.completed_at,
    });
  } catch (error) {
    console.error("Job status error:", error);
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
