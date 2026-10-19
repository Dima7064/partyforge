export const CLASS_NAMES_RU: Record<string, string> = {
  Barbarian: "Варвар",
  Bard: "Бард",
  Cleric: "Жрец",
  Druid: "Друид",
  Fighter: "Воин",
  Monk: "Монах",
  Paladin: "Паладин",
  Ranger: "Следопыт",
  Rogue: "Плут",
  Sorcerer: "Чародей",
  Warlock: "Колдун",
  Wizard: "Волшебник",
};

export const RACE_NAMES_RU: Record<string, string> = {
  Human: "Человек",
  Elf: "Эльф",
  Dwarf: "Дварф",
  Halfling: "Полурослик",
  Dragonborn: "Драконорождённый",
  Gnome: "Гном",
  "Half-Elf": "Полуэльф",
  "Half-Orc": "Полуорк",
  Tiefling: "Тифлинг",
    Nord: "Норд",
  Dunmer: "Данмер",
  Altmer: "Альтмер",
  Bosmer: "Босмер",
  Khajiit: "Каджит",
  Argonian: "Аргонианин",
  Breton: "Бретон",
  Redguard: "Редгард",
  Orsimer: "Орсимер",
  Imperial: "Имперец",
};

export const BACKGROUND_NAMES_RU: Record<string, string> = {
  Acolyte: "Послушник",
  Criminal: "Преступник",
  "Folk Hero": "Народный герой",
  Noble: "Дворянин",
  Sage: "Мудрец",
  Soldier: "Солдат",
  Charlatan: "Шарлатан",
  Sailor: "Моряк",
};

export function classNameRu(name: string): string {
  return CLASS_NAMES_RU[name] ?? name;
}

export function raceNameRu(name: string): string {
  return RACE_NAMES_RU[name] ?? name;
}

export function backgroundNameRu(name: string): string {
  return BACKGROUND_NAMES_RU[name] ?? name;
}