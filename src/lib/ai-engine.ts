/**
 * AI Engine — uses Claude to intelligently apply business data to a template.
 * Instead of rewriting the entire HTML, Claude returns a list of find/replace pairs.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { BusinessData } from "./google-places";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Replacement {
  find: string;
  replace: string;
}

/**
 * Extracts only the text content from HTML to send to Claude (much smaller).
 */
function extractTextContent(html: string): string {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<[^>]+>/g, "\n");
  text = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l, i, arr) => arr.indexOf(l) === i)
    .join("\n");
  return text;
}

/**
 * Extracts image src values from HTML.
 */
function extractImageSrcs(html: string): string[] {
  const srcs: string[] = [];
  const imgRegex = /src=["']([^"']+\.(jpg|jpeg|png|gif|webp|svg|avif))['"]/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    if (!match[1].startsWith("data:") && !match[1].startsWith("__SITEFORGE")) {
      srcs.push(match[1]);
    }
  }
  return [...new Set(srcs)];
}

/**
 * Detects the likely language/country from business data.
 */
function detectLanguageContext(businessData: BusinessData): string {
  const address = businessData.address.toLowerCase();
  const name = businessData.name.toLowerCase();
  const all = `${address} ${name} ${businessData.description || ""}`.toLowerCase();

  // Common country/language indicators
  if (/serbia|srbija|beograd|belgrade|novi sad|niš|kragujevac/i.test(all)) return "Serbian (Latin script)";
  if (/croatia|hrvatska|zagreb/i.test(all)) return "Croatian";
  if (/bosnia|sarajevo/i.test(all)) return "Bosnian";
  if (/germany|deutschland|berlin|münchen|hamburg/i.test(all)) return "German";
  if (/france|paris|lyon|marseille/i.test(all)) return "French";
  if (/spain|españa|madrid|barcelona/i.test(all)) return "Spanish";
  if (/italy|italia|roma|milano/i.test(all)) return "Italian";
  if (/netherlands|nederland|amsterdam/i.test(all)) return "Dutch";
  if (/portugal|lisboa|porto/i.test(all)) return "Portuguese";
  if (/japan|tokyo|東京/i.test(all)) return "Japanese";
  if (/china|beijing|shanghai|中国/i.test(all)) return "Chinese (Simplified)";
  if (/korea|seoul|서울/i.test(all)) return "Korean";
  if (/turkey|türkiye|istanbul|ankara/i.test(all)) return "Turkish";
  if (/poland|polska|warszawa|warsaw/i.test(all)) return "Polish";
  if (/czech|praha|prague/i.test(all)) return "Czech";
  if (/russia|россия|москва|moscow/i.test(all)) return "Russian";
  if (/greece|ελλάδα|athens/i.test(all)) return "Greek";
  if (/romania|bucurești|bucharest/i.test(all)) return "Romanian";
  if (/hungary|budapest|magyarország/i.test(all)) return "Hungarian";
  if (/arab|dubai|riyadh|saudi|egypt|cairo/i.test(all)) return "Arabic";
  return "English";
}

export async function applyBusinessDataToTemplate(
  htmlContent: string,
  businessData: BusinessData
): Promise<string> {
  const photoList = businessData.photos
    .map((url, i) => `Photo ${i + 1}: ${url}`)
    .join("\n");

  const textContent = extractTextContent(htmlContent);
  const imageSrcs = extractImageSrcs(htmlContent);

  const rawSnippets: string[] = [];
  const snippetRegex = /<(title|h[1-6]|p|span|a|li|td|th|label|button|figcaption|div)[^>]*>([^<]{3,})<\//gi;
  let snippetMatch;
  while ((snippetMatch = snippetRegex.exec(htmlContent)) !== null) {
    const text = snippetMatch[2].trim();
    if (text && !text.startsWith("data:") && !text.startsWith("__SITEFORGE") && !text.startsWith("{") && text.length < 300) {
      rawSnippets.push(text);
    }
  }
  const attrRegex = /(?:alt|title|placeholder|content|aria-label)=["']([^"']{3,})["']/gi;
  while ((snippetMatch = attrRegex.exec(htmlContent)) !== null) {
    const text = snippetMatch[1].trim();
    if (text && text.length < 300) {
      rawSnippets.push(text);
    }
  }
  const uniqueSnippets = [...new Set(rawSnippets)];

  const detectedLanguage = detectLanguageContext(businessData);

  const businessInfo = `
Business Name: ${businessData.name}
Phone: ${businessData.phone}
Address: ${businessData.address}
Website: ${businessData.website}
Category: ${businessData.category}
Rating: ${businessData.rating}/5 (${businessData.reviewCount} reviews)
Description: ${businessData.description}
Hours: ${businessData.hours.join(" | ") || "Not available"}
Detected Language/Country: ${detectedLanguage}
  `.trim();

  console.log("[ai-engine] Text content length:", textContent.length);
  console.log("[ai-engine] Image srcs found:", imageSrcs.length);
  console.log("[ai-engine] Detected language:", detectedLanguage);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are customizing a website template for a REAL business. Your job is to make the website look like it was BUILT for this business — not a template with a few words swapped.

REAL BUSINESS DATA:
${businessInfo}

BUSINESS PHOTOS (replace template/placeholder images with these):
${photoList || "No photos available"}

ALL VISIBLE TEXT IN THE TEMPLATE:
${uniqueSnippets.slice(0, 80).join("\n")}

ADDITIONAL TEXT:
${textContent.slice(0, 2500)}

IMAGE URLS IN TEMPLATE:
${imageSrcs.slice(0, 15).join("\n")}

Return a JSON array of find/replace pairs. CRITICAL RULES:

## BRANDING (most important)
- Find the template's brand name in ALL forms (uppercase, lowercase, title case, split across tags) and replace EVERY occurrence with "${businessData.name}"
- Example: if template brand is "IronForge", replace "IronForge", "IRONFORGE", "ironforge", "Iron Forge", "Ironforge" — ALL of them
- The brand name usually appears in: page title, nav/header, hero heading, footer, copyright, meta tags
- Generate AT LEAST 3-5 brand name replacements covering different casings

## LANGUAGE
- The business is located in a ${detectedLanguage}-speaking area
${detectedLanguage !== "English" ? `- TRANSLATE ALL template text to ${detectedLanguage}. This includes:
  - Navigation menu items (Home, About, Contact, etc.)
  - Button text (Learn More, Get Started, Sign Up, etc.)
  - Section headings (Our Services, About Us, Contact, etc.)
  - Taglines and descriptions
  - Footer text
  - ALL body copy and paragraphs
- Keep the business name "${businessData.name}" as-is (don't translate it)
- The entire website should read naturally in ${detectedLanguage}` : "- Keep all text in English"}

## CONTENT
- Replace ALL phone numbers with "${businessData.phone || "Contact us"}"
- Replace ALL addresses with "${businessData.address}"
- Replace ALL email addresses with a plausible one for "${businessData.name}"
- Replace taglines/slogans with something specific to this ${businessData.category}${detectedLanguage !== "English" ? ` (in ${detectedLanguage})` : ""}
- Rewrite ALL descriptive paragraphs to be about "${businessData.name}"${detectedLanguage !== "English" ? ` in ${detectedLanguage}` : ""}
- Replace hours/schedule text with: ${businessData.hours.join(", ") || "Contact for hours"}
- Replace ALL "lorem ipsum" or placeholder text

## IMAGES
- Replace hero/banner image URLs with business photos
- Replace gallery/facility images with business photos
- Do NOT replace small avatar/profile images (team members, reviewers)

## QUANTITY
- Return AT LEAST 20 replacements. Every visible piece of template text should be customized.
- Be thorough — miss nothing.

Each "find" must be an EXACT string that appears in the template text above. Do not guess or fabricate strings.

Return ONLY a JSON array, no other text:
[{"find":"exact template text","replace":"new text"},...]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response from AI");
  }

  let jsonText = content.text.trim();
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  console.log("[ai-engine] AI response length:", jsonText.length);

  let replacements: Replacement[];
  try {
    replacements = JSON.parse(jsonText);
  } catch {
    console.error("[ai-engine] Failed to parse AI response as JSON");
    throw new Error("AI returned invalid response. Please try again.");
  }

  // Apply all replacements to the original HTML
  let result = htmlContent;
  let appliedCount = 0;
  for (const { find, replace } of replacements) {
    if (find && replace && find !== replace) {
      if (result.includes(find)) {
        result = result.split(find).join(replace);
        appliedCount++;
      }
    }
  }

  // ── BRAND DETECTION ──
  // Extract the template's brand name from <title>
  const titleMatch = result.match(/<title>([^<]+)<\/title>/i);
  let templateBrand = "";
  if (titleMatch) {
    const titleText = titleMatch[1].trim();
    // Try "Brand — tagline" or "Brand | tagline" or "Brand - tagline"
    const brandMatch = titleText.match(/^([A-Za-z0-9]+(?:\s?[A-Za-z0-9]+)?)\s*[—\-–|:,]/);
    if (brandMatch) {
      templateBrand = brandMatch[1].trim();
    } else {
      // Title might just be the brand name
      templateBrand = titleText.split(/\s+/).slice(0, 2).join(" ").trim();
    }
  }

  if (templateBrand && templateBrand.toLowerCase() !== businessData.name.toLowerCase()) {
    console.log("[ai-engine] Detected template brand:", templateBrand);

    // Generate ALL casing variants of the template brand
    const brandVariants = [
      templateBrand,                                    // Original: IronForge
      templateBrand.toUpperCase(),                      // IRONFORGE
      templateBrand.toLowerCase(),                      // ironforge
      templateBrand.replace(/([a-z])([A-Z])/g, "$1 $2"), // Iron Forge (camelCase split)
      templateBrand.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase(), // IRON FORGE
    ];

    // Also try without spaces
    const noSpace = templateBrand.replace(/\s+/g, "");
    if (noSpace !== templateBrand) {
      brandVariants.push(noSpace, noSpace.toUpperCase(), noSpace.toLowerCase());
    }

    const uniqueVariants = [...new Set(brandVariants)].filter(v => v.length >= 3);

    // Replace each variant with the corresponding casing of the business name
    for (const variant of uniqueVariants) {
      if (!result.includes(variant)) continue;
      let replacement: string;
      if (variant === variant.toUpperCase()) {
        replacement = businessData.name.toUpperCase();
      } else if (variant === variant.toLowerCase()) {
        replacement = businessData.name.toLowerCase();
      } else {
        replacement = businessData.name;
      }
      result = result.split(variant).join(replacement);
      console.log("[ai-engine] Brand variant:", variant, "->", replacement);
    }
  }

  // ── SPLIT-TAG BRAND NAMES ──
  // Handles: Iron<span>Forge</span>, IRON<span>FORGE</span>, etc.
  const splitBrandRegex = /([A-Za-z]{2,})(<(?:span|strong|em|b)[^>]*>)([A-Za-z]{2,})(<\/(?:span|strong|em|b)>)/gi;
  let splitMatch;
  const resultForSplit = result;
  while ((splitMatch = splitBrandRegex.exec(resultForSplit)) !== null) {
    const part1 = splitMatch[1];
    const tagOpen = splitMatch[2];
    const part2 = splitMatch[3];
    const tagClose = splitMatch[4];
    const combined = (part1 + part2).toLowerCase();

    // Check if this looks like the brand
    const isBrand = (templateBrand && combined === templateBrand.replace(/\s+/g, "").toLowerCase()) ||
      (titleMatch && titleMatch[1].toLowerCase().includes(combined));

    if (isBrand) {
      const bizWords = businessData.name.split(" ");
      let newPart1: string, newPart2: string;

      if (bizWords.length >= 2) {
        newPart1 = bizWords[0];
        newPart2 = bizWords.slice(1).join(" ");
      } else {
        const mid = Math.ceil(bizWords[0].length / 2);
        newPart1 = bizWords[0].slice(0, mid);
        newPart2 = bizWords[0].slice(mid);
      }

      // Match the casing of the original
      if (part1 === part1.toUpperCase()) {
        newPart1 = newPart1.toUpperCase();
        newPart2 = newPart2.toUpperCase();
      }

      const original = splitMatch[0];
      const replacement = `${newPart1}${tagOpen}${newPart2}${tagClose}`;
      result = result.split(original).join(replacement);
      console.log("[ai-engine] Split brand:", original, "->", replacement);
    }
  }

  // ── HEADING TAG CLEANUP ──
  // Handle AI replacements that failed because text is split across HTML tags
  const headingRegex = /(<(?:h[1-6]|p|span|a|div)[^>]*>)\s*([\s\S]*?)\s*(<\/(?:h[1-6]|p|span|a|div)>)/gi;
  let headingMatch;
  const resultForHeadings = result;
  while ((headingMatch = headingRegex.exec(resultForHeadings)) !== null) {
    const fullEl = headingMatch[0];
    const innerHtml = headingMatch[2];
    // Get plain text version
    const plainText = innerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    for (const { find, replace } of replacements) {
      if (!find || !replace || find === replace) continue;
      if (plainText.includes(find) && !fullEl.includes(replace)) {
        // The AI wanted to replace this text but couldn't because of HTML tags
        // Try replacing in the inner HTML directly
        const newInner = innerHtml.replace(find, replace);
        if (newInner !== innerHtml) {
          result = result.split(fullEl).join(headingMatch[1] + newInner + headingMatch[3]);
          console.log("[ai-engine] Tag cleanup:", find, "->", replace);
        }
      }
    }
  }

  // Smart image replacement
  if (businessData.photos.length > 0) {
    let photoIndex = 0;
    let replacedCount = 0;

    const imgTagRegex = /<img[^>]*src=["'](https:\/\/images\.unsplash\.com\/[^"'\s)]+)["'][^>]*>/gi;
    let imgMatch;
    const resultForImgs = result;

    while ((imgMatch = imgTagRegex.exec(resultForImgs)) !== null) {
      const fullTag = imgMatch[0];
      const url = imgMatch[1];
      const position = imgMatch.index;

      const contextBefore = resultForImgs.slice(Math.max(0, position - 300), position).toLowerCase();
      const contextAfter = resultForImgs.slice(position, position + fullTag.length + 300).toLowerCase();
      const context = contextBefore + " " + contextAfter;

      const isPeopleSection = /trainer|coach|instructor|staff|team|member|review|testimonial|client|customer|said|quote|avatar|profile|headshot|portrait|ceo|founder|manager/i.test(context);
      const isSmallImage = /rounded-full|w-[0-9]{1,2}\b|h-[0-9]{1,2}\b|w-1[0-6]|h-1[0-6]|max-w-\[?[0-9]{2,3}px/i.test(fullTag);

      if (isPeopleSection || isSmallImage) {
        console.log("[ai-engine] Kept image (people section):", url.slice(0, 60));
      } else if (photoIndex < businessData.photos.length) {
        result = result.split(url).join(businessData.photos[photoIndex]);
        photoIndex++;
        replacedCount++;
      }
    }

    const bgRegex = /url\(["']?(https:\/\/images\.unsplash\.com\/[^"'\s)]+)["']?\)/gi;
    let bgMatch;
    while ((bgMatch = bgRegex.exec(resultForImgs)) !== null) {
      if (photoIndex < businessData.photos.length) {
        result = result.split(bgMatch[1]).join(businessData.photos[photoIndex % businessData.photos.length]);
        photoIndex++;
        replacedCount++;
      }
    }

    console.log("[ai-engine] Replaced", replacedCount, "facility images");
  }

  console.log("[ai-engine] Applied", appliedCount, "AI replacements");

  return result;
}
