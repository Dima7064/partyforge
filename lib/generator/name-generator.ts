const PREFIXES = ["Аэл", "Бал", "Гор", "Дра", "Эл", "Фин", "Гал", "Хал", "Иг", "Кал", "Лор", "Мор", "Ним", "Ор", "Пел", "Ран", "Сил", "Тар", "Ул", "Вал", "Зен"];
const MIDDLES = ["а", "о", "и", "е", "у", "ан", "ор", "ил", "ам", "ер", "ин", "ос"];
const SUFFIXES = ["дриэль", "тор", "ган", "мир", "лион", "дар", "нис", "лас", "рим", "вар", "кс", "ус", "ия", "он"];

export function generateFantasyName(race: string): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const middle = Math.random() > 0.5 ? MIDDLES[Math.floor(Math.random() * MIDDLES.length)] : "";
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  
  let name = `${prefix}${middle}${suffix}`;
  
  if (race === "Dwarf") {
    name = `${prefix}${Math.random() > 0.5 ? "ин" : "ур"}${Math.random() > 0.5 ? "д" : "н"}`;
  } else if (race === "Half-Orc") {
    name = `${prefix.replace(/[аеиоуыэюя]/g, "а")}${Math.random() > 0.5 ? "г" : "к"}`;
  }
  
  return name;
}