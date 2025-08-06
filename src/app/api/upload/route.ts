import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const sb_url = process.env.SUPABASE_URL!;
const sb_secret_key = process.env.SUPABASE_SECRET_KEY!;

if (!sb_url || !sb_secret_key) {
  throw new Error("Supabase URL or secret key is not set in environment variables");
}

const supabase = createClient(sb_url, sb_secret_key);

export async function POST(request: NextRequest) {
  try {
    const videoData = await request.json();
    console.log("this is the videoData:", videoData);
    if (!videoData) {
      return NextResponse.json({ error: "Video data is required" }, { status: 400 });
    }
    const { data, error } = await supabase.from("videos").insert([{ data: videoData }]);

    if (error) {
      console.error("Supabase error", error);
      return NextResponse.json({ error: "Failed to upload video data", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Video data saved successfully", savedData: data }, { status: 200 });
  } catch (e) {
    console.error("Error in POST /api/upload-analyze:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
