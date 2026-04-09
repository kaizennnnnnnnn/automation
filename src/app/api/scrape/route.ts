import { NextResponse } from "next/server";
import { fetchBusinessData } from "@/lib/google-places";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Google Maps URL is required" },
        { status: 400 }
      );
    }

    const businessData = await fetchBusinessData(url);
    return NextResponse.json(businessData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to scrape business data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
