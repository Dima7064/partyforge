import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SkipLink } from "@/components/ui/skip-link";
import { GuestBanner } from "@/components/ui/guest-banner";
import { getCurrentUser } from "@/lib/auth/currentUser";

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
  title: "SagaForge — конструктор кампаний для D&D",
  description:
    "Создавай связанные кампании для D&D: персонажи, связи, мир, фракции, NPC и сюжетные крючки. С экспортом в PDF и SVG.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="ru" className="dark">
      <body
        className={`${cinzel.variable} ${inter.variable} antialiased min-h-screen bg-stone-950 text-stone-100`}
      >
        <SkipLink />
        <GuestBanner authenticated={!!user} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}