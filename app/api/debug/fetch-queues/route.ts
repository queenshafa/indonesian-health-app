import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    console.log("\n=== FETCHING QUEUES WITH DOCTOR INFO ===");

    // Approach 1: Using foreign key relationship
    const { data: queuesWithDoctor, error: error1 } = await supabase
      .from("queues")
      .select(`
        id,
        queue_number,
        status,
        estimated_wait_time_minutes,
        appointment_date,
        appointment_time,
        patient_id,
        doctor_id,
        clinic_id,
        created_at,
        doctors:doctor_id (
          id,
          full_name,
          specialization,
          avatar_url
        ),
        clinics:clinic_id (
          id,
          name,
          phone
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    console.log("Approach 1 - With FK:", error1 ? error1.message : `${queuesWithDoctor?.length} records`);

    // Approach 2: Simple select all
    const { data: allQueues, error: error2 } = await supabase
      .from("queues")
      .select("*")
      .limit(10);

    console.log("Approach 2 - All queues:", error2 ? error2.message : `${allQueues?.length} records`);
    console.log("Sample queue:", allQueues?.[0]);

    // Approach 3: Check table structure
    const { data: tableInfo } = await supabase
      .from("queues")
      .select("*")
      .limit(1);

    const columns = tableInfo?.[0] ? Object.keys(tableInfo[0]) : [];

    return NextResponse.json({
      status: "success",
      table_columns: columns,
      approaches: {
        with_doctor_relationship: {
          error: error1?.message,
          count: queuesWithDoctor?.length || 0,
          sample: queuesWithDoctor?.[0],
        },
        all_queues: {
          error: error2?.message,
          count: allQueues?.length || 0,
          sample: allQueues?.[0],
        },
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
