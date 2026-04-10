import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GitHub not configured" }, { status: 500 });
  }

  // Derive the app origin from the request itself so it works even if
  // NEXT_PUBLIC_APP_URL is not set in the environment.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  const redirectUri = `${origin}/api/github/callback`;
  const scope = "repo";

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return NextResponse.redirect(url);
}
