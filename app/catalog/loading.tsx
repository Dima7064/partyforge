export default function Loading() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-forge-surface rounded w-1/3" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-forge-surface rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}