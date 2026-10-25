import path from "node:path";

function toFileUrl(filePath: string): string {
  let p = filePath.replace(/\\/g, "/");
  if (!p.startsWith("/")) p = "/" + p;
  return `file://${p}`;
}

export function resolveImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("file:")) return url;
  const absolute = path.join(process.cwd(), "public", url);
  return toFileUrl(absolute);
}