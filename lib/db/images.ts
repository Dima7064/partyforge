import { createServerClient } from "@/lib/supabase/server";
import { getDimsFromType } from "@/lib/images/dimensions";

export interface PoolImage {
  id: string;
  url: string;
  type: string;
  race_name: string | null;
  location_type: string | null;
  theme: string;
  width: number;
  height: number;
}

export interface ResolvedImage {
  url: string | null;
  width: number;
  height: number;
}

export async function getPoolImages(filters: {
  type?: string;
  race_name?: string;
  location_type?: string;
  theme?: string;
}): Promise<PoolImage[]> {
  const supabase = createServerClient();
  let q = supabase.from("images").select("*").eq("is_pool", true);
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.race_name) q = q.eq("race_name", filters.race_name);
  if (filters.location_type) q = q.eq("location_type", filters.location_type);
  if (filters.theme) q = q.eq("theme", filters.theme);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getRandomPoolImage(filters: {
  type: string;
  race_name?: string;
  location_type?: string;
  theme?: string;
}): Promise<PoolImage | null> {
  const pool = await getPoolImages(filters);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function getImageById(id: string | null): Promise<PoolImage | null> {
  if (!id) return null;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

export function resolveImage(
  image: PoolImage | null,
  fallbackType: string,
): ResolvedImage {
  if (image) {
    return { url: image.url, width: image.width, height: image.height };
  }
  const { width, height } = getDimsFromType(fallbackType);
  return { url: null, width, height };
}