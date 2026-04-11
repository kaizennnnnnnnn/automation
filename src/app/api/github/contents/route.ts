import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
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

  const { owner, repo, branch, path = "" } = await request.json();
  const token = profile.github_token;

  // Raw URL base for serving files directly from GitHub
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch repo contents" }, { status: 500 });
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Not a directory" }, { status: 400 });
    }

    const textExtensions = [".html", ".htm", ".css", ".js", ".json", ".txt", ".svg"];
    const mediaExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".avif", ".mp4", ".webm", ".ogg", ".mov", ".pdf", ".woff", ".woff2", ".ttf", ".eot"];

    const textFiles: Record<string, string> = {};
    const mediaFiles: Record<string, string> = {}; // path -> raw GitHub URL
    let mainHtml = "";

    async function fetchDir(dirItems: { name: string; type: string; download_url: string | null; path: string }[], prefix: string) {
      for (const item of dirItems) {
        const ext = "." + (item.name.split(".").pop()?.toLowerCase() || "");

        if (item.type === "dir") {
          const subRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
            { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
          );
          if (subRes.ok) {
            const subItems = await subRes.json();
            if (Array.isArray(subItems)) {
              await fetchDir(subItems, prefix ? `${prefix}/${item.name}` : item.name);
            }
          }
        } else if (item.download_url) {
          const filePath = prefix ? `${prefix}/${item.name}` : item.name;

          if (textExtensions.includes(ext)) {
            const fileRes = await fetch(item.download_url);
            textFiles[filePath] = await fileRes.text();

            if ((item.name === "index.html" || item.name === "index.htm") && !prefix) {
              mainHtml = textFiles[filePath];
            }
          } else if (mediaExtensions.includes(ext)) {
            // Use raw GitHub URL instead of base64 — faster, no size limit
            mediaFiles[filePath] = `${rawBase}/${item.path}`;
          }
        }
      }
    }

    await fetchDir(items, "");

    // Fallback: find any .html if no index.html at root
    if (!mainHtml) {
      const htmlFile = Object.entries(textFiles).find(
        ([k]) => k.endsWith(".html") || k.endsWith(".htm")
      );
      if (htmlFile) mainHtml = htmlFile[1];
    }

    if (!mainHtml) {
      return NextResponse.json({ error: "No HTML file found in repository" }, { status: 400 });
    }

    // --- Process the HTML ---
    let processed = mainHtml;

    // 1. Inline CSS files
    for (const [filePath, content] of Object.entries(textFiles)) {
      if (!filePath.endsWith(".css")) continue;
      const cssFileName = filePath.split("/").pop()!;

      // Also resolve url() references inside CSS to raw GitHub URLs
      let resolvedCss = content;
      const cssDir = filePath.includes("/") ? filePath.substring(0, filePath.lastIndexOf("/")) : "";

      // Replace url(...) references in CSS
      resolvedCss = resolvedCss.replace(/url\(["']?([^"')]+)["']?\)/gi, (_match, ref: string) => {
        if (ref.startsWith("data:") || ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("//")) {
          return `url(${ref})`;
        }
        // Resolve relative path
        const resolved = resolvePath(cssDir, ref);
        const rawUrl = mediaFiles[resolved] || textFiles[resolved] ? `${rawBase}/${resolved}` : `${rawBase}/${resolved}`;
        return `url(${rawUrl})`;
      });

      // Replace <link> tag with inline <style>
      const linkRegex = new RegExp(
        `<link[^>]*href=["'][^"']*?${cssFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*/?>`,
        "gi"
      );
      if (linkRegex.test(processed)) {
        processed = processed.replace(linkRegex, `<style>${resolvedCss}</style>`);
      } else {
        // If no matching link tag, inject before </head>
        processed = processed.replace("</head>", `<style>${resolvedCss}</style>\n</head>`);
      }
    }

    // 2. Inline JS files
    for (const [filePath, content] of Object.entries(textFiles)) {
      if (!filePath.endsWith(".js")) continue;
      const jsFileName = filePath.split("/").pop()!;
      const scriptRegex = new RegExp(
        `<script[^>]*src=["'][^"']*?${jsFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>\\s*</script>`,
        "gi"
      );
      processed = processed.replace(scriptRegex, `<script>${content}</script>`);
    }

    // 3. Replace all relative asset references (src, href, poster, data-src) with raw GitHub URLs
    processed = processed.replace(
      /(src|href|poster|data-src|data-bg|content)=(["'])([^"']+)\2/gi,
      (_match, attr: string, quote: string, ref: string) => {
        // Skip external URLs, data URIs, anchors, mailto, tel, javascript
        if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("//") ||
            ref.startsWith("data:") || ref.startsWith("#") || ref.startsWith("mailto:") ||
            ref.startsWith("tel:") || ref.startsWith("javascript:")) {
          return `${attr}=${quote}${ref}${quote}`;
        }

        // Skip if it's an already-inlined CSS/JS (won't match since we removed link/script tags)
        // Resolve the relative path
        const resolved = resolvePath("", ref);

        // Check if it's a known media file
        if (mediaFiles[resolved]) {
          return `${attr}=${quote}${mediaFiles[resolved]}${quote}`;
        }

        // For any other relative reference, try raw GitHub URL
        return `${attr}=${quote}${rawBase}/${resolved}${quote}`;
      }
    );

    // 4. Fix lazy loading
    processed = processed.replace(/(<img[^>]*)\bdata-src=(["'][^"']+["'])/gi, (_match, before: string, src: string) => {
      if (/\bsrc=["']/i.test(before)) return _match;
      return `${before} src=${src}`;
    });
    processed = processed.replace(/\bloading=["']lazy["']/gi, "");

    // 5. Also resolve url() in inline styles
    processed = processed.replace(/style=["']([^"']+)["']/gi, (_match, styleContent: string) => {
      const resolved = styleContent.replace(/url\(["']?([^"')]+)["']?\)/gi, (_m, ref: string) => {
        if (ref.startsWith("data:") || ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("//")) {
          return `url(${ref})`;
        }
        const resolvedPath = resolvePath("", ref);
        return `url(${mediaFiles[resolvedPath] || `${rawBase}/${resolvedPath}`})`;
      });
      return `style="${resolved}"`;
    });

    // 6. Add <base> tag as ultimate fallback for any missed references
    if (!processed.includes("<base")) {
      processed = processed.replace("<head>", `<head>\n<base href="${rawBase}/">`);
      // If no <head>, add it
      if (!processed.includes("<base")) {
        processed = `<base href="${rawBase}/">\n${processed}`;
      }
    }

    // Combine all files for the response
    const allFiles: Record<string, string> = { ...textFiles };
    for (const [k, v] of Object.entries(mediaFiles)) {
      allFiles[k] = v;
    }

    return NextResponse.json({
      html: processed,
      files: allFiles,
      fileName: `${repo} (GitHub)`,
    });
  } catch (error) {
    console.error("GitHub contents error:", error);
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 });
  }
}

/** Resolve a relative path like ./assets/img.png or ../fonts/x.woff relative to a base dir */
function resolvePath(baseDir: string, ref: string): string {
  // Strip leading ./ or /
  let clean = ref.replace(/^\.\//, "").replace(/^\//, "");

  if (clean.startsWith("../")) {
    // Go up from baseDir
    const baseParts = baseDir ? baseDir.split("/") : [];
    while (clean.startsWith("../") && baseParts.length > 0) {
      clean = clean.substring(3);
      baseParts.pop();
    }
    clean = clean.replace(/^\.\.\//, "");
    return baseParts.length > 0 ? `${baseParts.join("/")}/${clean}` : clean;
  }

  if (baseDir && !clean.includes("/")) {
    return `${baseDir}/${clean}`;
  }

  return clean;
}
