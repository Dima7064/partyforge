import { getCurrentUser } from "@/lib/auth/currentUser";
import { Hero } from "@/components/home/Hero";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
    >
      <Hero authenticated={!!user} />
    </main>
  );
}