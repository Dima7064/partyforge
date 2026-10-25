import path from "node:path";
import fs from "node:fs";

export function resolveImageForPdf(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/")) {
    const fullPath = path.join(process.cwd(), "public", url);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return url;
}