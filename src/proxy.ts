import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/customize"];
// Routes only for non-authenticated users
const authRoutes = ["/login", "/signup"];
// Routes that should be accessible to anyone
const publicRoutes = ["/login", "/signup", "/onboarding", "/marketplace", "/preview"];

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

  const pathname = request.nextUrl.pathname;

  // Skip auth check for public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users to login
    if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    // If auth check fails, allow the request through
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|preview|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
