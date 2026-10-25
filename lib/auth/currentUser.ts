import { cache } from "react";
import { createAuthClient } from "@/lib/supabase/serverAuth";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/generator";

export const getCurrentUser = cache(async () => {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const admin = createServerClient();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data ?? null;
});