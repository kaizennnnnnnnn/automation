import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("github_token")
    .eq("user_id", user.id)
    .single();

  if (!profile?.github_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 401 });
  }

  const res = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50&type=owner", {
    headers: {
      Authorization: `Bearer ${profile.github_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Token expired/revoked — clear it
      await supabase
        .from("profiles")
        .update({ github_token: null })
        .eq("user_id", user.id);
      return NextResponse.json({ error: "GitHub token expired. Please reconnect." }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }

  const repos = await res.json();

  return NextResponse.json(
    repos.map((r: { id: number; name: string; full_name: string; description: string | null; private: boolean; html_url: string; default_branch: string; updated_at: string; language: string | null }) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      private: r.private,
      html_url: r.html_url,
      default_branch: r.default_branch,
      updated_at: r.updated_at,
      language: r.language,
    }))
  );
}
