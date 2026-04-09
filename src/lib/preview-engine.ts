/**
 * Replaces all {{PLACEHOLDER}} tags in HTML with the provided field values.
 */
export function renderTemplate(
  html: string,
  fieldValues: Record<string, string>
): string {
  let rendered = html;
  for (const [key, value] of Object.entries(fieldValues)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, value);
  }
  return rendered;
}

/**
 * Extracts all {{UPPERCASE_KEY}} placeholder tags from HTML content.
 */
export function extractPlaceholders(html: string): string[] {
  const regex = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
  const keys = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) {
    keys.add(match[1]);
  }
  return Array.from(keys);
}

/**
 * Generates a random slug for preview URLs.
 */
export function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 10; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}
