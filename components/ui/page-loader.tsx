"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function PageLoader() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const int = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-forge-bg/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 border-2 border-forge-gold/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 border-t-2 border-forge-gold rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-forge-gold-light font-serif text-lg tracking-widest uppercase">
          Загрузка{dots}
        </p>
      </motion.div>
    </div>
  );
}