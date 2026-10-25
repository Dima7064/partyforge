export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-forge-gold focus:text-forge-bg focus:px-4 focus:py-2 focus:rounded font-semibold"
    >
      Перейти к содержимому
    </a>
  );
}