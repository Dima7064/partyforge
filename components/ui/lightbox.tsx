"use client";

import { useEffect, useState } from "react";
import { ImageSlot } from "./ImageSlot";
import { cn } from "@/lib/utils";

export function Lightbox({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 text-forge-parchment text-4xl leading-none hover:text-forge-gold w-10 h-10 flex items-center justify-center"
        aria-label="Закрыть"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-forge-muted text-xs">
        Нажми вне картинки или Esc — закрыть
      </p>
    </div>
  );
}

interface LightboxImageProps {
  src: string | null;
  width: number;
  height: number;
  alt: string;
  label?: string;
  hint?: string;
  rounded?: "none" | "md" | "lg" | "full";
  className?: string;
  disabled?: boolean;
}

export function LightboxImage({
  src,
  width,
  height,
  alt,
  label,
  hint,
  rounded = "md",
  className,
  disabled,
}: LightboxImageProps) {
  const [open, setOpen] = useState(false);
  const clickable = !!src && !disabled;

  return (
    <>
      <button
        type="button"
        onClick={() => clickable && setOpen(true)}
        disabled={!clickable}
        aria-label={clickable ? `Открыть ${alt} на весь экран` : alt}
        className={cn(
          "block w-full text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-gold",
          clickable
            ? "cursor-zoom-in hover:opacity-90 transition-opacity"
            : "cursor-default",
          className,
        )}
      >
        <ImageSlot
          src={src}
          width={width}
          height={height}
          alt={alt}
          label={label}
          hint={hint}
          rounded={rounded}
        />
      </button>
      {clickable && (
        <Lightbox open={open} src={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  );
}