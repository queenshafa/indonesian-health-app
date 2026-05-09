import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    console.log("\n=== CHECKING QUEUES TABLE STATUS ===");

    // 1. Check if table exists by trying to get schema info
    const { data: tableData, error: tableError } = await supabase
      .from("queues")
      .select("*")
      .limit(1);

    const tableExists = !tableError?.message?.includes("does not exist");

    // 2. Check RLS status
    let rlsInfo = "Unknown";
    let canInsert = false;
    let canSelect = false;

    if (tableExists) {
      // Try insert
      const insertTest = await supabase
        .from("queues")
        .insert({
          queue_number: 999,
          status: "test",
          estimated_wait_time_minutes: 0,
        })
        .select()
        .single();

      if (insertTest.error) {
        rlsInfo = insertTest.error.message;
        console.error("Insert test failed:", insertTest.error);
      } else {
        canInsert = true;
        rlsInfo = "RLS allows insert (test successful)";
        // Clean up test
        if (insertTest.data?.id) {
          await supabase
            .from("queues")
            .delete()
            .eq("id", insertTest.data.id);
        }
      }

      // Check select
      const selectTest = await supabase
        .from("queues")
        .select("*")
        .limit(1);

      canSelect = !selectTest.error;
    }

    // 3. Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 4. Check N8N webhook URL
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_QUEUE_PROCESSING;

    return NextResponse.json({
      status: "success",
      table: {
        exists: tableExists,
        error: tableError?.message,
      },
      rls: {
        info: rlsInfo,
        can_insert: canInsert,
        can_select: canSelect,
      },
      auth: {
        user_id: user?.id,
        email: user?.email,
        error: authError?.message,
      },
      n8n: {
        webhook_url: n8nWebhookUrl ? "✓ Set" : "✗ Not set",
        url: n8nWebhookUrl,
      },
      debug_endpoints: {
        test_insert_fetch: "/api/debug/queues-test",
        webhook_log: "/api/debug/webhook-log",
        fetch_queues: "/api/debug/fetch-queues",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
