import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedRoutes = ["/dashboard", "/customize"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // First refresh the session — this uses the refresh token to get
  // a new access token if the current one is expired (>1 hour).
  // Without this, getUser() fails after the JWT expires.
  const { data: { session } } = await supabase.auth.getSession();

  let user = session?.user ?? null;

  // If we got a session, validate it with getUser() for security.
  // If getUser fails (e.g. token just refreshed), still trust the session.
  if (session) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      user = data.user;
    }
  }

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users straight to dashboard
  if (user && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|preview|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
