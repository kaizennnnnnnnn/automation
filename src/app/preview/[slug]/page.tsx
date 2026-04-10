import { createServiceRoleClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { PreviewRenderer } from "./preview-renderer";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createServiceRoleClient();
  const { data: preview } = await supabase
    .from("previews")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!preview) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // Inject banner and a script that makes anchor links work inside the iframe
  const banner = `
<div id="siteforge-banner" style="
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  z-index: 99999;
">
  <span style="color: #94a3b8; font-size: 13px;">
    Built with <strong style="color: white;">SiteForge</strong>
  </span>
  <span style="color: #475569;">|</span>
  <a href="${appUrl}/signup"
     style="color: #60a5fa; font-size: 13px; text-decoration: none; font-weight: 500;"
     target="_top">
    Create your free website preview &rarr;
  </a>
</div>`;

  let fullHtml = preview.html_snapshot || "";
  if (fullHtml.includes("</body>")) {
    fullHtml = fullHtml.replace("</body>", `${banner}</body>`);
  } else {
    fullHtml = fullHtml + banner;
  }

  return <PreviewRenderer html={fullHtml} />;
}
