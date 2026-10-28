import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { createServerClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/library");

  const supabase = createServerClient();
  const { data: campaigns } = await supabase
    .from("campaign_members")
    .select("campaign_id, campaigns(share_code, title)")
    .eq("user_id", user.id)
    .eq("role", "master");

  const myCampaigns = (campaigns ?? []).map((c: any) => {
    const camp = Array.isArray(c.campaigns) ? c.campaigns[0] : c.campaigns;
    return { id: c.campaign_id, title: camp?.title, share_code: camp?.share_code };
  });

  return (
    <main id="main-content" className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-forge-muted text-sm uppercase tracking-wider">Личный архив</p>
          <h1 className="text-3xl md:text-4xl font-bold text-forge-gold-light">Моя библиотека</h1>
        </div>
      </div>
      
      <LibraryGrid campaigns={myCampaigns} />
    </main>
  );
}