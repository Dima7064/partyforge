import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "./providers";
import { SkipLink } from "@/components/ui/skip-link";
import { GuestBanner } from "@/components/ui/guest-banner";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "SagaForge",
  description: "Create connected D&D campaigns.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const user = await getCurrentUser();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${cinzel.variable} ${inter.variable} antialiased min-h-screen bg-stone-950 text-stone-100`}>
        <NextIntlClientProvider messages={messages}>
          <SkipLink />
          <GuestBanner authenticated={!!user} />
          
          <LanguageSwitcher />

          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}