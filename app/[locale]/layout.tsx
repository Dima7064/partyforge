import type { Metadata } from "next";
import { Cinzel, Inter, IM_Fell_English_SC } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "./providers";
import { SkipLink } from "@/components/ui/skip-link";
import { GuestBanner } from "@/components/ui/guest-banner";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { MouseSpotlight } from "@/components/ui/mouse-spotlight";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["400", "600", "700", "900"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const fell = IM_Fell_English_SC({ variable: "--font-fell", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "SagaForge | Dark Fantasy",
  description: "Create dark, connected D&D campaigns.",
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

  const embers = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bottom: `-10px`,
    size: `${Math.random() * 4 + 2}px`,
    duration: `${Math.random() * 4 + 3}s`,
    delay: `-${Math.random() * 5}s`,
  }));

  return (
    <html lang={locale} className="dark">
      <body className={`${cinzel.variable} ${inter.variable} ${fell.variable} antialiased min-h-screen bg-forge-bg text-forge-parchment`}>
        <MouseSpotlight />
        <div className="grain-overlay" />
        
        {embers.map(p => (
          <div 
            key={p.id} 
            className="ember-particle" 
            style={{ 
              left: p.left, 
              bottom: p.bottom, 
              width: p.size, 
              height: p.size, 
              animationDuration: p.duration, 
              animationDelay: p.delay 
            }} 
          />
        ))}

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