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

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Webhook failed",
      },
      {
        status: 500,
      }
    );
  }
}