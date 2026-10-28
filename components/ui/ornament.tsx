export function Ornament() {
  return (
    <div className="flex items-center justify-center my-10 w-full opacity-70">
      <div className="h-px bg-gradient-to-r from-transparent via-[#3a3a3a] to-[#5a5a5a] flex-1" />
      <svg className="w-10 h-10 text-forge-muted mx-4 drop-shadow-[0_0_5px_rgba(201,162,39,0.2)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 3h2v14h-2zM8 17h8v1H8zM10 18h4l-2 4z"/>
      </svg>
      <div className="h-px bg-gradient-to-l from-transparent via-[#3a3a3a] to-[#5a5a5a] flex-1" />
    </div>
  );
}