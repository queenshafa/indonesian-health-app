import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Test: Fetch existing queues with doctor info
    console.log("\n=== TEST 1: Fetch existing queues ===");
    const { data: existingQueues, error: fetchError } = await supabase
      .from("queues")
      .select(
        `
        id,
        queue_number,
        patient_id,
        doctor_id,
        clinic_id,
        appointment_date,
        appointment_time,
        estimated_wait_time_minutes,
        status,
        created_at,
        doctors:doctor_id(id, full_name, specialization)
      `
      )
      .limit(5);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        {
          status: "error",
          step: "fetch_queues",
          error: fetchError,
          message: fetchError.message,
        },
        { status: 500 }
      );
    }

    console.log("Existing queues:", existingQueues);

    // 2. Test: Insert a test queue record
    console.log("\n=== TEST 2: Insert test queue ===");
    const testQueueData = {
      queue_number: 99,
      status: "waiting",
      estimated_wait_time_minutes: 30,
      appointment_date: new Date().toISOString().split("T")[0],
      appointment_time: "14:00",
      doctor_id: null,
      clinic_id: null,
      patient_id: null,
    };

    console.log("Inserting:", testQueueData);

    const { data: insertedQueue, error: insertError } = await supabase
      .from("queues")
      .insert(testQueueData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        {
          status: "error",
          step: "insert_queue",
          error: insertError,
          message: insertError.message,
          details: insertError.details,
        },
        { status: 500 }
      );
    }

    console.log("Inserted queue:", insertedQueue);

    // 3. Test: Fetch with doctor relationship
    console.log("\n=== TEST 3: Fetch test queue with doctor ===");
    const { data: queueWithDoctor, error: fetchWithDocError } = await supabase
      .from("queues")
      .select(
        `
        id,
        queue_number,
        status,
        doctors:doctor_id(id, full_name, specialization),
        clinics:clinic_id(id, name)
      `
      )
      .eq("id", insertedQueue.id)
      .single();

    if (fetchWithDocError) {
      console.error("Fetch with doctor error:", fetchWithDocError);
    } else {
      console.log("Queue with doctor:", queueWithDoctor);
    }

    // 4. Test: Get all queues count
    console.log("\n=== TEST 4: Get total queue count ===");
    const { count, error: countError } = await supabase
      .from("queues")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
    } else {
      console.log("Total queues:", count);
    }

    return NextResponse.json({
      status: "success",
      tests: {
        existing_queues: {
          count: existingQueues?.length || 0,
          data: existingQueues,
        },
        inserted_queue: {
          data: insertedQueue,
        },
        queue_with_doctor: {
          data: queueWithDoctor,
        },
        total_count: count,
      },
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: String(error),
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
