import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { slug, html } = await request.json();

    if (!slug || !html) {
      return NextResponse.json(
        { error: "Slug and HTML are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("previews")
      .update({ html_snapshot: html })
      .eq("slug", slug);

    if (error) {
      return NextResponse.json(
        { error: "Failed to save: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save preview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
