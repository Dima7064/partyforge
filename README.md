# PartyForge

Конструктор партий персонажей, миров и сюжетных крючков для настольных ролевых игр (D&D 5e).

**Живая ссылка:** [partyforge.vercel.app](https://partyforge.vercel.app)

## Что делает

- Генерирует **сбалансированную партию** (танк, хилер, dps) с уникальными классами, расами и именами.
- Даёт каждому персонажу **характер** (ценности, страхи, привычки, мотивация), **предысторию** и **тайну**.
- Строит **граф связей** между персонажами (доверие, долг, любовь, конфликт, тайна) с гарантией покрытия.
- Создаёт **мир**: 4 локации разных типов, 3–4 фракции (ally/enemy/neutral), 3 NPC на каждого персонажа (ally/enemy/neutral), стартовую ситуацию.
- Генерирует **сюжетные крючки**, привязанные к персонажам, локациям, фракциям и NPC.
- **Сохраняет** кампанию в PostgreSQL, даёт **share_code** для доступа без авторизации.

## Стек

| Слой               | Технология                          |
| ------------------ | ----------------------------------- |
| Frontend + Backend | Next.js 15 (App Router), TypeScript |
| Стили              | Tailwind CSS v4                     |
| БД                 | PostgreSQL (Supabase)               |
| Визуализация графа | React Flow                          |
| Хостинг            | Vercel                              |
| Тесты              | Vitest                              |

## Архитектура

Клиент → Next.js API routes → Supabase (PostgreSQL)
↓
lib/generator/ (чистые функции)
↓
types/generator.ts (контракты)

**Генератор** — набор чистых функций без побочных эффектов:

- `generateCharacter` — один персонаж
- `generateBalancedParty` — партия с балансировкой ролей, синергий, разнообразия
- `generateRelationships` — граф связей с spanning tree
- `generateWorld` — локации, фракции, NPC, ситуация
- `generateHooks` — крючки с подстановкой персонажей/NPC/фракций/локаций

**Детерминизм:** вся генерация идёт через `mulberry32(seed)`. Один seed → одна кампания. Используется `share_code` как seed при восстановлении.

## API

| Метод  | Путь                    | Что делает                                                           |
| ------ | ----------------------- | -------------------------------------------------------------------- |
| POST   | `/api/generate`         | Сгенерировать кампанию, сохранить, вернуть `{ share_code }`          |
| GET    | `/api/campaigns/[code]` | Загрузить кампанию по коду                                           |
| PATCH  | `/api/campaigns/[code]` | `{ action: "regenerate_character", character_index: N }`             |
| DELETE | `/api/campaigns/[code]` | Удалить кампанию                                                     |
| GET    | `/api/catalog/*`        | Каталог: классы, расы, предыстории, черты, тайны, шаблоны, tone-веса |

## Локальный запуск

````bash
# 1. Клонировать
git clone https://github.com/YOUR_USERNAME/partyforge.git
cd partyforge

# 2. Установить зависимости
npm install

# 3. Создать .env.local (скопировать из .env.example и заполнить)
cp .env.example .env.local

# 4. Применить миграции в Supabase SQL Editor (по порядку)
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_denormalize.sql

# 5. Заполнить каталог
npx tsx scripts/seed.ts

# 6. Запустить
npm run dev

Открыть http://localhost:3000.

Тесты
bash
npm test
118+ тестов: генератор, баланс, связи, мир, крючки, полный конвейер.

Метрики
bash
npm run metrics
Прогоняет 300 генераций и показывает:

% валидных ролей

% валидных связей

% валидных крючков

среднее число персонажей/связей/крючков

среднее время генерации

Структура
text
app/                    # страницы и API routes
  api/generate/         # POST /api/generate
  api/campaigns/        # GET/PATCH/DELETE
  api/catalog/          # каталог
  c/[code]/             # просмотр кампании
  generate/             # форма генерации
  catalog/              # страница каталога
  design/               # песочница компонентов
components/
  ui/                   # Button, Card, Input, Select, Badge, Skeleton
  campaign/             # CharacterCard, RelationshipsGraph, WorldTab, HooksTab, CampaignTabs
lib/
  generator/            # character, balance, relationships, world, hooks, campaign, random, abilities, names, personality, backstory, secret, images
  db/                   # campaigns, catalog
  supabase/             # server, client
  campaigns/            # shareCode
types/                  # generator.ts (все типы)
data/                   # статические данные (классы, расы, черты) — для seed
scripts/                # seed.ts, metrics.ts
tests/                  # 12 файлов тестов
supabase/migrations/    # 001_initial_schema.sql, 002_denormalize.sql
public/images/          # портреты, локации, карты
Известные ограничения
Нет авторизации — доступ к кампании по share_code (как в pastebin).

Изображения — предзаготовленные (по классу/типу локации), не генерируются под конкретного персонажа.

Экспорт — пока нет (PDF/JSON запланированы).

Лицензия
MIT (для учебного проекта).

text

Если файла нет — создай:

```tsx
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-forge-surface rounded", className)}
      {...props}
    />
  );
}
````
