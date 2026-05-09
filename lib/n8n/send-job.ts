import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";

export interface N8NJobPayload {
  job_id: string;
  webhook_url: string;
  [key: string]: any;
}

/**
 * Creates an async job and sends it to N8N webhook
 */
export async function sendJobToN8N(
  webhookUrl: string,
  payload: Omit<N8NJobPayload, "job_id" | "webhook_url">
): Promise<{ job_id: string }> {
  const job_id = uuidv4();

  try {
    const supabase = await createClient();

    // Create job record in database
    const { error: insertError } = await supabase
      .from("async_jobs")
      .insert({
        job_id,
        webhook_url,
        payload,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to create job record:", insertError);
      throw new Error("Failed to create job record");
    }

    // Send to N8N webhook
    const n8nPayload: N8NJobPayload = {
      job_id,
      webhook_url: process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks${webhookUrl}`
        : `${process.env.VERCEL_URL}/api/webhooks${webhookUrl}`,
      ...payload,
    };

    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      throw new Error(
        `N8N webhook failed: ${response.status} ${response.statusText}`
      );
    }

    return { job_id };
  } catch (error) {
    console.error("Failed to send job to N8N:", error);

    // Update job status to failed
    const supabase = await createClient();
    await supabase
      .from("async_jobs")
      .update({
        status: "failed",
        error_message: String(error),
        completed_at: new Date().toISOString(),
      })
      .eq("job_id", job_id);

    throw error;
  }
}

/**
 * Gets the status of an async job
 */
export async function getJobStatus(job_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("async_jobs")
    .select("*")
    .eq("job_id", job_id)
    .single();

  if (error) {
    console.error("Failed to get job status:", error);
    throw new Error("Job not found");
  }

  return data;
}
