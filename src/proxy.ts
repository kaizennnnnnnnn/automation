import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/customize"];

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: "/",
  sameSite: "lax" as const,
  secure: true,
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: COOKIE_OPTIONS,
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
            response.cookies.set(name, value, { ...COOKIE_OPTIONS, ...options })
          );
        },
      },
    }
  );

  // ALWAYS call getUser() to refresh the session token.
  // This is what keeps the user logged in between visits.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|preview|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
