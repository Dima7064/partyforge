import { cn } from "@/lib/utils";
import Image from "next/image";


interface ImageSlotProps {
  src?: string | null;
  width: number;
  height: number;
  alt: string;
  label?: string;
  hint?: string;
  className?: string;
  rounded?: "none" | "md" | "lg" | "full";
}

export function ImageSlot({
  src,
  width,
  height,
  alt,
  label,
  hint,
  className,
  rounded = "md",
}: ImageSlotProps) {
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "md"
      ? "rounded-md"
      : "";

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("object-cover w-full h-auto", radius, className)}
        style={{ aspectRatio: `${width} / ${height}` }}
        sizes="(max-width: 768px) 100vw, 400px"
      />
    );
  }

  return (
    <div
      className={cn(
        "relative bg-forge-bg border-2 border-dashed border-forge-border flex flex-col items-center justify-center text-center p-2",
        radius,
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div className="text-forge-muted text-[10px] uppercase tracking-wider mb-1">
        {label ?? "Изображение"}
      </div>
      <div className="text-forge-gold font-mono text-xs">
        {width} × {height}
      </div>
      {hint && (
        <div className="text-forge-muted text-[10px] mt-1 px-1">
          {hint}
        </div>
      )}
    </div>
  );
}