import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { url }: { url: string } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    console.log("Received URL:", url);

    return NextResponse.json({ url: `this is the url you entered ${url}`, status: 200 });
  } catch (error) {}
}
