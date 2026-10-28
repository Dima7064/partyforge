"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/hooks/useToast";
import { validatePassword, validateUsername, usernameToEmail } from "@/lib/utils/username";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const nextUrl = searchParams.get("next") ?? `/${locale}/dashboard`;

  const t = useTranslations("Auth");
  const { show } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const uErr = validateUsername(username);
    if (uErr) { show("error", uErr); return; }

    const pErr = validatePassword(password);
    if (pErr) { show("error", pErr); return; }

    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signErr } = await supabase.auth.signUp({
        email: usernameToEmail(username),
        password,
      });
      if (signErr) throw signErr;

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? t("registerError"));
      }

      show("success", t("registerSuccess"));
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      show("error", err instanceof Error ? err.message : t("registerError"));
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-forge-gold-light">
            {t("register")}
          </h1>
          <p className="text-forge-muted text-sm mt-2">
            {t("noEmail")}
          </p>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
                {loading ? "..." : t("registerBtn")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-forge-muted text-sm">
          {t("hasAccount")}{" "}
          <Link href={`/${locale}/login?next=${nextUrl}`} className="text-forge-gold hover:underline">
            {t("loginBtn")}
          </Link>
        </p>
      </div>
    </main>
  );
}