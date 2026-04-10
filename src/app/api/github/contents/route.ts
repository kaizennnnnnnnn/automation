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

  try {
    // Fetch repo contents
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

    // Fetch all file contents (HTML, CSS, JS, images, etc.)
    const textExtensions = [".html", ".htm", ".css", ".js", ".json", ".txt", ".svg"];
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico"];
    const files: Record<string, string> = {};
    let mainHtml = "";

    async function fetchDir(dirItems: { name: string; type: string; download_url: string | null; path: string }[], prefix: string) {
      for (const item of dirItems) {
        const ext = "." + item.name.split(".").pop()?.toLowerCase();

        if (item.type === "dir") {
          // Fetch subdirectory contents
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
            const content = await fileRes.text();
            files[filePath] = content;

            if ((item.name === "index.html" || item.name === "index.htm") && !prefix) {
              mainHtml = content;
            }
          } else if (imageExtensions.includes(ext)) {
            const fileRes = await fetch(item.download_url);
            const buffer = await fileRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const mime =
              ext === ".png" ? "image/png" :
              ext === ".svg" ? "image/svg+xml" :
              ext === ".gif" ? "image/gif" :
              ext === ".webp" ? "image/webp" :
              ext === ".ico" ? "image/x-icon" :
              "image/jpeg";
            files[filePath] = `data:${mime};base64,${base64}`;
          }
        }
      }
    }

    await fetchDir(items, "");

    // If no index.html found at root, look for any .html file
    if (!mainHtml) {
      const htmlFile = Object.entries(files).find(
        ([k]) => k.endsWith(".html") || k.endsWith(".htm")
      );
      if (htmlFile) {
        mainHtml = htmlFile[1];
      }
    }

    if (!mainHtml) {
      return NextResponse.json({ error: "No HTML file found in repository" }, { status: 400 });
    }

    // Inline CSS and resolve relative paths
    let processed = mainHtml;
    for (const [filePath, content] of Object.entries(files)) {
      if (filePath.endsWith(".css")) {
        const linkPattern = new RegExp(
          `<link[^>]*href=["'](?:\\.?\\/)?${filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
          "gi"
        );
        processed = processed.replace(linkPattern, `<style>${content}</style>`);
      }

      if (content.startsWith("data:")) {
        const escaped = filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        processed = processed.replace(
          new RegExp(`(?:src|href)=["'](?:\\.?\\/)?${escaped}["']`, "gi"),
          (match) => match.replace(new RegExp(`(?:\\.?\\/)?${escaped}`), content)
        );
      }
    }

    return NextResponse.json({
      html: processed,
      files,
      fileName: `${repo} (GitHub)`,
    });
  } catch (error) {
    console.error("GitHub contents error:", error);
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 });
  }
}
