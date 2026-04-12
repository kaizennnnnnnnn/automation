import { createBrowserClient } from "@supabase/ssr";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          const pairs = document.cookie.split(";");
          return pairs
            .map((c) => {
              const idx = c.indexOf("=");
              if (idx === -1) return null;
              return {
                name: c.substring(0, idx).trim(),
                value: c.substring(idx + 1).trim(),
              };
            })
            .filter(Boolean) as { name: string; value: string }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            document.cookie = `${name}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax; Secure`;
          });
        },
      },
    }
  );
}
