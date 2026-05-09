// lib/n8n/send-job.ts
import { randomUUID } from "crypto";
// 👇 Replace this import with whatever your project exports
import { createClient } from "@/lib/supabase/server"; // or "./client", etc.

type WebhookKind = "symptom-analysis" | "facility-finder" | "queue-processing" | "main";

const WEBHOOK_URLS: Record<WebhookKind, string | undefined> = {
  "symptom-analysis":
    process.env.N8N_SYMPTOM_ANALYSIS_URL ?? process.env.N8N_WEBHOOK_SYMPTOM_ANALYSIS,
  "facility-finder":
    process.env.N8N_FACILITY_FINDER_URL ?? process.env.N8N_WEBHOOK_FACILITY_FINDER,
  "queue-processing":
    process.env.N8N_QUEUE_PROCESSING_URL ?? process.env.N8N_WEBHOOK_QUEUE_PROCESSING,
  "main":
    process.env.N8N_MAIN_URL ?? process.env.N8N_WEBHOOK_MAIN,
};

export async function sendJobToN8N(kind: WebhookKind, payload: unknown) {
  const webhook_url = WEBHOOK_URLS[kind];
  if (!webhook_url) {
    throw new Error(
      `Missing env var N8N_${kind.toUpperCase().replace(/-/g, "_")}_URL or N8N_WEBHOOK_${kind.toUpperCase().replace(/-/g, "_")}. ` +
      `Add it to .env.local and restart "next dev".`
    );
  }

  const supabase = await createClient(); // adjust if your helper is sync
  const job_id = randomUUID();

  const { error: insertError } = await supabase.from("async_jobs").insert({
    job_id,
    webhook_url,
    payload,
    status: "pending",
    created_at: new Date().toISOString(),
  });
  if (insertError) throw new Error(`async_jobs insert failed: ${insertError.message}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.N8N_WEBHOOK_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`;
  }

  let res: Response

  try {
    res = await fetch(webhook_url, {
      method: "POST",
      headers,
      body: JSON.stringify({ job_id, ...(payload as object ?? {}) }),
    })
  } catch (fetchError) {
    console.error(`n8n webhook fetch failed for ${kind}:`, fetchError)

    // The webhook was queued, but the remote service did not respond.
    // Keep this job pending so it can be resolved when N8N eventually calls back.
    return { job_id, responseBody: null }
  }

  const responseBody = await res.json().catch(() => null);

  if (!res.ok) {
    const text = typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody ?? "");

    if ([524, 502, 503, 504].includes(res.status)) {
      await supabase.from("async_jobs")
        .update({ status: "pending", error: `n8n ${res.status}: ${text}` })
        .eq("job_id", job_id);
      return { job_id, responseBody: null }
    }

    await supabase.from("async_jobs")
      .update({ status: "failed", error: `n8n ${res.status}: ${text}` })
      .eq("job_id", job_id);
    throw new Error(`n8n webhook ${res.status}: ${text}`);
  }

  return { job_id, responseBody };
}
