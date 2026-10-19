export interface AchievementSeed {
  code: string;
  name_ru: string;
  description_ru: string;
  icon: string;
}

export const achievements: AchievementSeed[] = [
  { code: "first_campaign", name_ru: "Первая кампания", description_ru: "Создай свою первую кампанию как мастер", icon: "🎲" },
  { code: "ten_campaigns", name_ru: "Опытный мастер", description_ru: "Создай 10 кампаний", icon: "👑" },
  { code: "first_join", name_ru: "В команде", description_ru: "Присоединись к чужой кампании", icon: "🤝" },
  { code: "five_joins", name_ru: "Душка компании", description_ru: "Присоединись к 5 кампаниям", icon: "🎭" },
  { code: "skyrim_master", name_ru: "Довакин", description_ru: "Создай кампанию по Скайриму", icon: "🐉" },
  { code: "character_editor", name_ru: "Кузнец судеб", description_ru: "Отредактируй персонажа вручную", icon: "⚒️" },
  { code: "first_export", name_ru: "Книжник", description_ru: "Экспортируй кампанию", icon: "📜" },
];