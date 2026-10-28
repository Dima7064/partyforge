import { MetadataRoute } from 'next'
import { createServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sagaforge-game.vercel.app';
  
  const supabase = createServerClient();
  const { data } = await supabase.from("campaigns").select("share_code, created_at").eq("is_public", true);

  const campaigns = (data || []).map((c) => ({
    url: `${baseUrl}/ru/c/${c.share_code}`,
    lastModified: new Date(c.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: `${baseUrl}/ru`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/ru/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...campaigns,
  ];
}