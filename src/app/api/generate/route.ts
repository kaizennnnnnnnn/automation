import { NextResponse } from "next/server";
import { applyBusinessDataToTemplate } from "@/lib/ai-engine";
import { generateSlug } from "@/lib/preview-engine";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { BusinessData } from "@/lib/google-places";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

export async function POST(request: Request) {
  try {
    const { htmlContent, businessData, templateId } =
      (await request.json()) as {
        htmlContent: string;
        businessData: BusinessData;
        templateId?: string;
      };

    if (!htmlContent || !businessData) {
      return NextResponse.json(
        { error: "HTML content and business data are required" },
        { status: 400 }
      );
    }

    console.log("[generate] Starting AI generation for:", businessData.name);
    console.log("[generate] HTML length:", htmlContent.length);

    // Use AI to apply business data to template
    const generatedHtml = await applyBusinessDataToTemplate(
      htmlContent,
      businessData
    );

    console.log("[generate] AI generation complete, output length:", generatedHtml.length);

    // Try to save the preview (but don't fail if auth is missing)
    let slug = generateSlug();

    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from("previews").insert({
          caller_id: user.id,
          template_id: templateId || null,
          slug,
          field_values: businessData,
          html_snapshot: generatedHtml,
          prospect_name: businessData.name,
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        if (error) {
          console.error("[generate] DB save error:", error.message);
        }
      }
    } catch (dbError) {
      console.error("[generate] DB error (non-fatal):", dbError);
    }

    return NextResponse.json({
      slug,
      html: generatedHtml,
      url: `/preview/${slug}`,
    });
  } catch (error) {
    console.error("[generate] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate preview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
