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
 * Returns visible text snippets that Claude can identify and replace.
 */
function extractTextContent(html: string): string {
  // Remove <script> and <style> blocks
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Remove HTML tags but keep the text
  text = text.replace(/<[^>]+>/g, "\n");
  // Clean up whitespace
  text = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l, i, arr) => arr.indexOf(l) === i) // dedupe
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

export async function applyBusinessDataToTemplate(
  htmlContent: string,
  businessData: BusinessData
): Promise<string> {
  const photoList = businessData.photos
    .map((url, i) => `Photo ${i + 1}: ${url}`)
    .join("\n");

  const textContent = extractTextContent(htmlContent);
  const imageSrcs = extractImageSrcs(htmlContent);

  // Also grab raw HTML snippets that contain visible text (headings, paragraphs, spans, titles, alt texts, meta)
  const rawSnippets: string[] = [];
  const snippetRegex = /<(title|h[1-6]|p|span|a|li|td|th|label|button|figcaption)[^>]*>([^<]{3,})<\//gi;
  let snippetMatch;
  while ((snippetMatch = snippetRegex.exec(htmlContent)) !== null) {
    const text = snippetMatch[2].trim();
    if (text && !text.startsWith("data:") && !text.startsWith("__SITEFORGE") && !text.startsWith("{") && text.length < 200) {
      rawSnippets.push(text);
    }
  }
  // Also find text in attributes like alt, title, placeholder, content
  const attrRegex = /(?:alt|title|placeholder|content|aria-label)=["']([^"']{3,})["']/gi;
  while ((snippetMatch = attrRegex.exec(htmlContent)) !== null) {
    const text = snippetMatch[1].trim();
    if (text && text.length < 200) {
      rawSnippets.push(text);
    }
  }
  const uniqueSnippets = [...new Set(rawSnippets)];

  console.log("[ai-engine] Raw snippets found:", uniqueSnippets.length);
  console.log("[ai-engine] First 5 snippets:", uniqueSnippets.slice(0, 5));

  const businessInfo = `
Business Name: ${businessData.name}
Phone: ${businessData.phone}
Address: ${businessData.address}
Website: ${businessData.website}
Category: ${businessData.category}
Rating: ${businessData.rating}/5 (${businessData.reviewCount} reviews)
Description: ${businessData.description}
Hours: ${businessData.hours.join(" | ") || "Not available"}
  `.trim();

  console.log("[ai-engine] Text content length:", textContent.length);
  console.log("[ai-engine] Image srcs found:", imageSrcs.length);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    messages: [
      {
        role: "user",
        content: `You are helping customize a website template for a real business called "${businessData.name}". I'll give you the visible text from the template and the real business data. Return a JSON array of find/replace pairs.

REAL BUSINESS DATA:
${businessInfo}

BUSINESS PHOTOS (use these URLs to replace any template/placeholder image URLs):
${photoList || "No photos available"}

ALL VISIBLE TEXT IN THE TEMPLATE (extracted from HTML tags):
${uniqueSnippets.slice(0, 60).join("\n")}

ADDITIONAL TEXT (extracted by stripping tags):
${textContent.slice(0, 2000)}

IMAGE URLS CURRENTLY IN THE TEMPLATE:
${imageSrcs.slice(0, 15).join("\n")}

Return a JSON array of find/replace pairs. IMPORTANT RULES:

1. Find the template's brand/business name (appears in headings, titles, footer, nav) and replace ALL occurrences with "${businessData.name}"
2. Find ANY phone numbers and replace with "${businessData.phone || "Call us today"}"
3. Find ANY street addresses and replace with "${businessData.address}"
4. Find the tagline/subtitle and write a new one specific to "${businessData.name}"
5. Find descriptive paragraphs about the business and rewrite them for "${businessData.name}" - a ${businessData.category} located at ${businessData.address}
6. Replace image src URLs with the business photo URLs I provided (match hero images first, then other images)
7. Find ANY email addresses and replace with a plausible one for "${businessData.name}"
8. Find opening hours text and replace with: ${businessData.hours.join(", ") || "Contact us for hours"}

Be AGGRESSIVE with replacements - I want the website to look like it was built specifically for "${businessData.name}". Replace at minimum 10+ items. Every piece of text that refers to the original template business should be changed.

Each "find" must be an EXACT string copy-pasted from the template text above.

Return ONLY a JSON array. Example:
[{"find":"IRONFORGE","replace":"BLACK WORKOUT"},{"find":"IronForge","replace":"Black Workout"},{"find":"Forge Your Best Self","replace":"Push Your Limits"},{"find":"(555) 123-4567","replace":"011 4234223"}]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response from AI");
  }

  let jsonText = content.text.trim();
  // Remove markdown code blocks if present
  if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
  if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
  if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
  jsonText = jsonText.trim();

  console.log("[ai-engine] AI response:", jsonText.slice(0, 500));

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

  // Also do smart brand name detection and replacement
  // Find what looks like the brand name in the template (appears in <title>)
  const titleMatch = result.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    const titleText = titleMatch[1];
    // Extract the brand name (usually the first word(s) before a separator)
    const brandMatch = titleText.match(/^([A-Za-z0-9\s]+?)[\s]*[—\-–|:]/);
    if (brandMatch) {
      const templateBrand = brandMatch[1].trim();
      if (templateBrand && templateBrand !== businessData.name) {
        result = result.split(templateBrand).join(businessData.name);
        console.log("[ai-engine] Brand replacement:", templateBrand, "->", businessData.name);
      }
    }
  }

  // Replace split-tag brand names like: TEXT<span>TEXT</span>
  // Pattern: word characters followed by a <span> with more word characters
  // e.g. IRON<span class="text-primary">FORGE</span>
  const splitBrandRegex2 = /([A-Z]{2,})(<span[^>]*>)([A-Z]{2,})(<\/span>)/g;
  let splitMatch2;
  const resultCopy = result; // search on current result
  while ((splitMatch2 = splitBrandRegex2.exec(resultCopy)) !== null) {
    const part1 = splitMatch2[1]; // "IRON"
    const spanOpen = splitMatch2[2]; // <span class="text-primary">
    const part2 = splitMatch2[3]; // "FORGE"
    const spanClose = splitMatch2[4]; // </span>
    const combinedBrand = part1 + part2; // "IRONFORGE"

    // Check if this looks like the brand name
    const titleUpper = (titleMatch?.[1] || "").toUpperCase();
    if (combinedBrand.length >= 4 && (titleUpper.includes(combinedBrand) || titleUpper.includes(part1))) {
      const bizWords = businessData.name.toUpperCase().split(" ");
      let newPart1: string, newPart2: string;
      if (bizWords.length >= 2) {
        // Split by words: "BLACK" + "WORKOUT"
        newPart1 = bizWords[0];
        newPart2 = bizWords.slice(1).join(" ");
      } else {
        // Single word: split in half
        const mid = Math.ceil(bizWords[0].length / 2);
        newPart1 = bizWords[0].slice(0, mid);
        newPart2 = bizWords[0].slice(mid);
      }
      const original = splitMatch2[0]; // IRON<span class="text-primary">FORGE</span>
      const replacement = `${newPart1}${spanOpen}${newPart2}${spanClose}`;
      result = result.split(original).join(replacement);
      console.log("[ai-engine] Split brand fix:", original, "->", replacement);
    }
  }

  // Also handle the heading "Forge Your <br/><span>Best Self</span>" pattern
  // This is text split across <br/> and <span> tags
  const headingRegex = /(<h[1-6][^>]*>)\s*([\s\S]*?)\s*(<\/h[1-6]>)/gi;
  let headingMatch;
  const resultForHeadings = result;
  while ((headingMatch = headingRegex.exec(resultForHeadings)) !== null) {
    const fullHeading = headingMatch[0];
    const innerHtml = headingMatch[2];
    // Extract just the text from the heading
    const headingText = innerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    // Check if any AI replacement targets this text
    for (const { find, replace } of replacements) {
      if (find && replace && headingText.includes(find) && !fullHeading.includes(replace)) {
        // The text exists in the heading but wasn't replaced because of HTML tags
        // Do a text-only replacement preserving the HTML structure
        const newInner = innerHtml.replace(find, replace);
        if (newInner !== innerHtml) {
          result = result.split(fullHeading).join(
            headingMatch[1] + newInner + headingMatch[3]
          );
          console.log("[ai-engine] Heading fix:", find, "->", replace);
        }
      }
    }
  }

  // Replace any remaining image placeholders with business photos
  if (businessData.photos.length > 0) {
    const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^"'\s)]+/g;
    let photoIndex = 0;
    result = result.replace(unsplashRegex, () => {
      const photo = businessData.photos[photoIndex % businessData.photos.length];
      photoIndex++;
      return photo;
    });
    if (photoIndex > 0) {
      console.log("[ai-engine] Replaced", photoIndex, "Unsplash images with business photos");
    }
  }

  console.log("[ai-engine] Applied", appliedCount, "AI replacements");

  return result;
}
