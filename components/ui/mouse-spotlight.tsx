"use client";

import { useEffect, useState } from "react";

export function MouseSpotlight() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9995] transition-opacity duration-300"
      style={{
        background: `radial-gradient(circle 800px at ${position.x}px ${position.y}px, rgba(201, 162, 39, 0.15), transparent 50%)`,
      }}
    />
  );
}