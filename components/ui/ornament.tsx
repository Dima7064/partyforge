export function Ornament() {
  return (
    <div className="flex items-center justify-center my-8 w-full opacity-60">
      <div className="h-px bg-gradient-to-r from-transparent via-forge-gold/50 to-transparent flex-1" />
      <svg className="w-8 h-8 text-forge-gold mx-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
      <div className="h-px bg-gradient-to-r from-transparent via-forge-gold/50 to-transparent flex-1" />
    </div>
  );
}