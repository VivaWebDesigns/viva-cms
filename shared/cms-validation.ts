export const CANONICAL_URL_MESSAGE = "Must be a valid URL or root-relative path.";

export function isValidCanonicalUrl(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed === "") return true;

  if (trimmed.startsWith("/")) {
    return !trimmed.startsWith("//") && !/\s/.test(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
