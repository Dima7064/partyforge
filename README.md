# SagaForge

Веб-приложение для генерации связанных D&D-кампаний: персонажи, граф отношений,
локации, фракции, NPC и сюжетные крючки. С inline-редактированием (в будущем —
выбором из пулов), экспортом в PDF/SVG и (в будущем) библиотекой, публичным
каталогом и ML-рекомендациями.

## Стек

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Flow, @react-pdf/renderer
- **Backend:** Next.js Route Handlers, PostgreSQL через Supabase SDK
- **Auth:** Supabase Auth (email = `username@sagaforge.local`)
- **Хостинг:** Vercel (регион fra1) + Supabase (регион eu-central-1)

## Быстрый старт

````powershell
npm install
Copy-Item .env.example .env.local
# Заполни .env.local (Supabase URL + ключи)
npm run dev

Сайт откроется на http://localhost:3000.

Скрипты
npm run dev — dev-сервер

npm run build — production-сборка

npm test — юнит-тесты (Vitest)

npm run lint — ESLint

npm run format — Prettier

npx tsx scripts/seed.ts — заполнить каталог в БД

npx tsx scripts/seed-images.ts — зарегистрировать картинки из public/images/

npx tsx scripts/metrics.ts — метрики качества генератора

Структура
app/ — страницы и API-роуты (App Router)

components/ — UI-компоненты

lib/ — генератор, доступ к БД, PDF, Supabase

data/ — сид-данные каталога

supabase/migrations/ — SQL-миграции

scripts/ — серверные скрипты

tests/ — юнит-тесты

docs/ — документация, ER-диаграмма, аудит, архитектура

Лицензия
Приватный проект. D&D 5e механики используются по SRD 5.1 (CC-BY-4.0).
Торговая марка «D&D» не используется в названии.


Сохрани. Проверь, что нигде не осталось «PartyForge»:

```powershell
Select-String -Path "app\*.tsx","app\**\*.tsx","components\**\*.tsx","lib\**\*.ts","lib\**\*.tsx","data\*.ts","docs\*.md","README.md","package.json" -Pattern "PartyForge" -SimpleMatch
````
