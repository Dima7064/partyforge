"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DiceLoader({ label = "Бросаем кости..." }: { label?: string }) {
  const [num, setNum] = useState(20);

  useEffect(() => {
    const int = setInterval(() => {
      setNum(Math.floor(Math.random() * 20) + 1);
    }, 450);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14">
      <motion.div
        className="relative w-24 h-24 flex items-center justify-center"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <polygon
            points="50,5 92,28 92,72 50,95 8,72 8,28"
            fill="#1a1613"
            stroke="#c9a227"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="50,20 78,35 78,65 50,80 22,65 22,35"
            fill="none"
            stroke="#e8c547"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <motion.span
          key={num}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-2xl font-bold text-forge-gold-light"
        >
          {num}
        </motion.span>
      </motion.div>
      <motion.p
        className="text-forge-muted text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {label}
      </motion.p>
    </div>
  );
}