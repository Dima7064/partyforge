# Аудит проекта SagaForge (Фаза 0)

Дата: <впиши сегодняшнюю дату>
Автор: <твоё имя>

## 1. Файлы с "PartyForge" (переименовать в SagaForge)

### Код

- [ ] `package.json` — поле `name`
- [ ] `app/layout.tsx` — `metadata.title`, `metadata.description`
- [ ] `components/home/Hero.tsx` — `<h1>PartyForge</h1>`, слоган
- [ ] `app/login/page.tsx` — «Вход в PartyForge»
- [ ] `app/register/page.tsx` — «Регистрация в PartyForge»
- [ ] `app/design/page.tsx` — «Дизайн-система PartyForge»
- [ ] `lib/pdf/CharacterSheet.tsx` — футер PDF
- [ ] `lib/pdf/MasterNotes.tsx` — футер PDF («Конспект мастера», «PartyForge · код»)
- [ ] `lib/export/svg.ts` — футер SVG
- [ ] `lib/utils/username.ts` — `usernameToEmail()` → `@sagaforge.local`
- [ ] `docs/er-diagram.md` — заголовок
- [ ] `docs/image-prompts.md` — заголовок
- [ ] `README.md` — заголовок и упоминания

### Не трогаем

- Имена таблиц БД (campaigns, characters, …)
- URL API (/api/…)
- Внутренние переменные
- Папку проекта `C:\dev\partyforge` (это просто имя папки)

## 2. Файлы с "Skyrim" (Фаза 1 — НЕ сейчас)

Оставляем как есть в Фазе 0. Удалим в Фазе 1. Список для памяти:

- [ ] `data/skyrim.ts`
- [ ] `lib/db/campaigns.ts` — `SKYRIM_LOCATIONS_PRESETS`, `SKYRIM_FACTIONS_PRESETS`, `SKYRIM_NPCS_PRESETS`
- [ ] `lib/generator/world.ts` — ветка `if (isSkyrim)`
- [ ] `lib/generator/character.ts` — фильтр по `theme`
- [ ] `lib/generator/campaign.ts` — `theme` в `GeneratorInput`
- [ ] `app/generate/page.tsx` — селектор темы
- [ ] `components/campaign/LocationCard.tsx`, `FactionCard.tsx`, `NpcCard.tsx` — `SKYRIM_*_OPTIONS`, проверки `theme === "skyrim"`
- [ ] `components/campaign/LocationEditModal.tsx`, `FactionEditModal.tsx`, `NpcEditModal.tsx` — `SKYRIM_*` импорты
- [ ] `app/c/[code]/page.tsx`, `app/dashboard/page.tsx`, `app/join/[code]/page.tsx` — `THEME_LABEL.skyrim`
- [ ] `data/situations.ts` — `SKYRIM_SITUATIONS`
- [ ] `data/races.ts`, `data/classes.ts` — `theme: ["skyrim"]`
- [ ] `data/achievements.ts` — `skyrim_master`
- [ ] `app/api/export/[code]/character/[index]/pdf/route.ts` — `THEME_LABEL`
- [ ] `scripts/seed.ts` — сиды Skyrim
- [ ] `scripts/seed-images.ts` — папка `public/images/skyrim/`
- [ ] `supabase/migrations/*` — CHECK constraint `campaigns_theme_check` включает `'skyrim'`
- [ ] `public/images/skyrim/` — удалить папку

## 3. Файлы с free-text вводом (Фаза 1 — НЕ сейчас)

- [ ] `components/campaign/CharacterCard.tsx` — Input/Textarea в `editing`
- [ ] `components/campaign/CharacterEditModal.tsx` — то же (модалка)
- [ ] `components/campaign/FactionCard.tsx`, `FactionEditModal.tsx` — Input/Textarea
- [ ] `components/campaign/LocationCard.tsx`, `LocationEditModal.tsx` — Input/Textarea
- [ ] `components/campaign/NpcCard.tsx`, `NpcEditModal.tsx` — Input/Textarea
- [ ] `components/campaign/SituationCard.tsx`, `SituationEditModal.tsx` — Textarea
- [ ] `components/campaign/HookCard.tsx`, `HookEditModal.tsx` — `--- свой текст ---`
- [ ] `components/campaign/CharacterNotes.tsx` — Textarea (заметки — это ок, оставляем)
- [ ] `app/generate/page.tsx` — поле «Название»
- [ ] `app/join/page.tsx` — поле «Код» (это не free text, код share — оставляем)
- [ ] `components/campaign/InvitesPanel.tsx` — `maxUses` (число, не text — оставляем)

## 4. Проверки `if (!user)` → 401 (уже есть, оставляем)

- [ ] `app/api/auth/profile/route.ts`
- [ ] `app/api/campaigns/[code]/join/route.ts`
- [ ] `app/api/campaigns/[code]/invites/route.ts`
- [ ] `app/api/campaigns/[code]/invites/[inviteId]/route.ts`
- [ ] `app/api/campaigns/[code]/leave/route.ts`
- [ ] `app/api/campaigns/[code]/map/route.ts`
- [ ] `app/api/campaigns/[code]/relationships/route.ts`
- [ ] `app/api/campaigns/[code]/route.ts` (PATCH/DELETE)
- [ ] `app/api/campaigns/[code]/situation/route.ts`
- [ ] `app/api/campaigns/[code]/terrain/route.ts`
- [ ] `app/api/campaigns/route.ts`
- [ ] `app/api/characters/[id]/route.ts`
- [ ] `app/api/characters/[id]/image/route.ts`
- [ ] `app/api/export/[code]/character/[index]/pdf/route.ts`
- [ ] `app/api/export/[code]/pdf/route.ts`
- [ ] `app/api/export/[code]/svg/route.ts`
- [ ] `app/api/factions/[id]/route.ts`
- [ ] `app/api/generate/route.ts`
- [ ] `app/api/hooks/[id]/route.ts`
- [ ] `app/api/image-pool/route.ts`
- [ ] `app/api/locations/[id]/route.ts`, `image/route.ts`
- [ ] `app/api/notes/[characterId]/route.ts`
- [ ] `app/api/npcs/[id]/route.ts`, `image/route.ts`
- [ ] `app/api/profile/route.ts`

## 5. Что делать в Фазе 0

- [ ] Шаг 2: переименование (только UI + auth-email)
- [ ] Шаг 4: `campaigns.user_id` — уже nullable, ничего не меняем
- [ ] Шаг 5: `getCurrentUserOrGuest()` в `lib/auth/currentUser.ts`
- [ ] Шаг 6: лимит 10 кампаний (в `lib/db/campaigns.ts`)
- [ ] Шаг 7: блокировка полной кампании (в `joinCampaign`)
- [ ] Шаг 8: гостевой баннер + редиректы на `/register?next=...`
- [ ] Шаг 9: `docs/architecture.md` — принцип «no free text»
- [ ] Шаг 10: чек-лист ручных тестов

## 6. Что НЕ делаем в Фазе 0

- Удаление Skyrim (Фаза 1)
- Удаление free-text из карточек (Фаза 1)
- Библиотека (Фаза 2)
- Локализация (Фаза 3)
- Публичный каталог (Фаза 4)
