"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/components/ui/motion";

export function Hero({ authenticated }: { authenticated: boolean }) {
  return (
    <motion.div
      className="relative max-w-4xl w-full text-center space-y-8 py-20 px-4 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-forge-border"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-forge-bg via-forge-bg/80 to-transparent" />

      <motion.div variants={fadeUp} className="relative z-10 space-y-4">
        <p className="text-forge-gold text-sm tracking-[0.3em] uppercase">
          Кузница Кампаний
        </p>
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-forge-gold-light drop-shadow-[0_0_20px_rgba(201,162,39,0.5)]"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          SagaForge
        </motion.h1>
        <p className="text-forge-parchment text-lg md:text-xl max-w-xl mx-auto leading-relaxed drop-shadow-md">
          Создавайте связанные партии персонажей, локации и сюжетные крючки. Пусть ваши истории оживут.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="relative z-10 flex gap-4 justify-center flex-wrap">
        {authenticated ? (
          <>
            <Link href="/dashboard">
              <Button size="lg">Мой кабинет</Button>
            </Link>
            <Link href="/generate">
              <Button size="lg" variant="outline">Создать кампанию</Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/register">
              <Button size="lg">Зарегистрироваться</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Войти</Button>
            </Link>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}