"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/components/ui/motion";

export function Hero({ authenticated }: { authenticated: boolean }) {
  return (
    <motion.div
      className="max-w-2xl w-full text-center space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUp} className="space-y-4">
        <p className="text-forge-gold text-sm tracking-[0.3em] uppercase">
          Конструктор партий
        </p>
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-forge-gold-light"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          PartyForge
        </motion.h1>
        <p className="text-forge-muted text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Собирай связанные партии персонажей, локации, ситуации и сюжетные
          крючки для настольных ролевых игр.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-3 justify-center flex-wrap">
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

      <motion.div variants={fadeUp}>
        <Card className="max-w-md mx-auto text-left">
          <CardContent>
            <p className="text-sm text-forge-muted">
              Версия 1.0 — генерация, роли мастера и игрока, редактирование,
              изображения, экспорт в PDF и JSON.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}