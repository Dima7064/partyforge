const KEY = "pf_achievements_seen";

export function shouldShowAchievement(code: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEY);
    const seen: string[] = raw ? JSON.parse(raw) : [];
    if (seen.includes(code)) return false;
    localStorage.setItem(KEY, JSON.stringify([...seen, code]));
    return true;
  } catch {
    return false;
  }
}