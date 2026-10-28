import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96" />
    </main>
  );
}