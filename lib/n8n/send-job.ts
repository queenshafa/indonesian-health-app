import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function sendJobToN8N(
  webhookUrl: string,
  payload: Record<string, any>
) {

  const job_id = randomUUID();

  const supabase =
    await createClient();

  const callback_url =
    `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks${webhookUrl}`;

  console.log(
    "NEXT_PUBLIC_API_URL:",
    process.env.NEXT_PUBLIC_API_URL
  );

  console.log(
    "N8N_WEBHOOK_URL:",
    process.env.N8N_WEBHOOK_URL
  );

  console.log(
    "CALLBACK URL:",
    callback_url
  );

  // INSERT JOB
  const {
    error: insertError,
  } = await supabase
    .from("async_jobs")
    .insert({
      job_id,
      webhook_url: callback_url,
      payload,
      status: "processing",
      created_at:
        new Date().toISOString(),
    });

  if (insertError) {

    console.error(
      "INSERT ERROR:",
      insertError
    );

    throw insertError;
  }

  // SEND TO N8N
  const response = await fetch(
    process.env.N8N_WEBHOOK_URL!,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        job_id,
        webhook_url: callback_url,
        ...payload,
      }),
    }
  );

  console.log(
    "N8N STATUS:",
    response.status
  );

  if (!response.ok) {

    const text =
      await response.text();

    console.error(
      "N8N RESPONSE:",
      text
    );

    throw new Error(
      "Failed send to N8N"
    );
  }

  return { job_id };
}