import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("doctors").select("*");

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
