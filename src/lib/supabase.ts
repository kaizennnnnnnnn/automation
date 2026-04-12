import { createBrowserClient } from "@supabase/ssr";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function parseCookies(): { name: string; value: string }[] {
  return document.cookie.split(";").map((c) => {
    const [name, ...rest] = c.trim().split("=");
    return { name: name || "", value: decodeURIComponent(rest.join("=") || "") };
  }).filter((c) => c.name);
}

function setCookie(name: string, value: string, options: Record<string, unknown> = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookie += `; Max-Age=${MAX_AGE}`;
  cookie += `; Path=/`;
  cookie += `; SameSite=Lax`;
  if (options.secure !== false) cookie += `; Secure`;
  document.cookie = cookie;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookies();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, options as Record<string, unknown>);
          });
        },
      },
    }
  );
}
