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
  { code: "five_joins", name_ru: "Душа компании", description_ru: "Присоединись к 5 кампаниям", icon: "🎭" },
  { code: "skyrim_master", name_ru: "Довакин", description_ru: "Создай кампанию по Skyrim", icon: "🐉" },
  { code: "character_editor", name_ru: "Кузнец судеб", description_ru: "Отредактируй персонажа вручную", icon: "⚒️" },
  { code: "first_export", name_ru: "Книжник", description_ru: "Экспортируй кампанию", icon: "📜" },
  { code: "first_note", name_ru: "Летописец", description_ru: "Напиши свою первую заметку к персонажу", icon: "📝" },
  { code: "five_races", name_ru: "Космополит", description_ru: "Сыграй за 5 разных рас", icon: "🌍" },
  { code: "all_roles", name_ru: "Мастер на все руки", description_ru: "Сыграй за все 6 ролей", icon: "🛡️" },
  { code: "ten_characters", name_ru: "Герой-легион", description_ru: "Создай 10 персонажей в своих играх", icon: "⚔️" },
  { code: "night_owl", name_ru: "Полуночник", description_ru: "Создай кампанию после полуночи", icon: "🦉" },
  { code: "perfect_party", name_ru: "Идеальный баланс", description_ru: "Сгенерируй партию с максимальной синергией", icon: "⚖️" },
  { code: "storyteller", name_ru: "Сказитель", description_ru: "Сгенерируй 5 кампаний с разными темами", icon: "📖" },
];