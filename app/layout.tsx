import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

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
  title: "PartyForge — конструктор партий для D&D",
  description:
    "Собирай связанные партии персонажей, локации, ситуации и сюжетные крючки для настольных ролевых игр.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${cinzel.variable} ${inter.variable} antialiased min-h-screen bg-stone-950 text-stone-100`}
      >
        {children}
      </body>
    </html>
  );
}
