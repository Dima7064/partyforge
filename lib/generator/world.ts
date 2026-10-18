import type {
  Character,
  CharacterLocation,
  ConnectionType,
  Faction,
  FactionAttitude,
  GeneratorInput,
  Location,
  Npc,
  NpcRole,
  Rng,
} from "@/types/generator";
import { imageForLocation, portraitForNpc } from "./images";

interface LocationArchetype {
  type: string;
  names: string[];
  descriptions: string[];
}

const LOCATION_ARCHETYPES: LocationArchetype[] = [
  {
    type: "city",
    names: ["Тенебра", "Вельд", "Каэрн", "Оствинд"],
    descriptions: [
      "Портовый город, где всё продаётся.",
      "Столица королевства, полная интриг.",
      "Город на перекрёстке торговых путей.",
    ],
  },
  {
    type: "temple",
    names: ["Храм Забытых", "Святилище Света", "Обитель Теней"],
    descriptions: [
      "Древний храм, где молятся забытым богам.",
      "Святилище, куда приходят за исцелением.",
      "Обитель, где служат тёмным силам.",
    ],
  },
  {
    type: "forest",
    names: ["Лес Туманов", "Чёрная чаща", "Шёпот-лес"],
    descriptions: [
      "Лес, где легко заблудиться.",
      "Чаща, куда не ходят без провожатого.",
      "Лес, где слышны голоса.",
    ],
  },
  {
    type: "ruins",
    names: ["Руины Древних", "Разрушенная крепость", "Проклятые развалины"],
    descriptions: [
      "Руины древней цивилизации.",
      "Крепость, павшая много веков назад.",
      "Развалины, где обитают чудовища.",
    ],
  },
  {
    type: "port",
    names: ["Порт Свободы", "Гавань Контрабандистов"],
    descriptions: [
      "Порт, где закон не писан.",
      "Гавань, где торгуют всем, включая людей.",
    ],
  },
];

const CONNECTION_TYPES: ConnectionType[] = ["born", "lost", "served", "dreams"];

interface FactionArchetype {
  name: string;
  goals: string;
  description: string;
}

const FACTION_ARCHETYPES: FactionArchetype[] = [
  {
    name: "Гильдия Воров",
    goals: "Контролировать все тёмные дела в городе.",
    description: "Тайная сеть воров, убийц и информаторов.",
  },
  {
    name: "Орден Света",
    goals: "Искоренить зло и защитить невинных.",
    description: "Рыцарский орден, служащий богине света.",
  },
  {
    name: "Ковен Ведьм",
    goals: "Сохранить древние знания и защитить природу.",
    description: "Тайное общество женщин-магов.",
  },
  {
    name: "Совет Торговцев",
    goals: "Увеличить богатство и влияние.",
    description: "Союз богатых купцов и банкиров.",
  },
  {
    name: "Культ Теней",
    goals: "Пробудить древнее божество тьмы.",
    description: "Фанатики, готовые на всё ради своей цели.",
  },
  {
    name: "Стража Королевства",
    goals: "Поддерживать порядок и защищать корону.",
    description: "Официальная армия и полиция.",
  },
];

const NPC_ROLES: NpcRole[] = ["ally", "enemy", "neutral"];

const NPC_NAMES = [
  "Морган",
  "Селена",
  "Бартоломью",
  "Изольда",
  "Рэйвен",
  "Ортега",
  "Вивьен",
  "Кальвин",
  "Фрея",
  "Дункан",
  "Лира",
  "Оскар",
];

const NPC_DESCRIPTIONS = [
  "Хитрый информатор с добрым лицом.",
  "Старый наёмник, уставший от крови.",
  "Жрица, потерявшая веру.",
  "Купец, который знает слишком много.",
  "Молодой вор, мечтающий о большой добыче.",
  "Стражник, который берёт взятки.",
];

const SITUATIONS = [
  "В городе пропадают дети. Гильдия обвиняет храм. Храм обвиняет гильдию.",
  "Война на границе. Беженцы стекаются в город.",
  "Новый король взошёл на трон, и все ждут, что он сделает.",
  "Древнее зло проснулось в горах.",
  "Мор пронёсся по земле, и лекари бессильны.",
  "На выборах главы гильдии идёт тайная борьба.",
  "Проклятие пало на землю: урожай гибнет, скот болеет.",
  "Появился пророк, и толпы идут за ним.",
];

function pickOne<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface WorldResult {
  locations: Location[];
  character_locations: CharacterLocation[];
  factions: Faction[];
  npcs: Npc[];
  situation: string;
}

export function generateWorld(
  input: GeneratorInput,
  characters: Character[],
  rng: Rng,
): WorldResult {
  // 1. Локации: 4 разных типа
  const shuffledArchetypes = shuffle(LOCATION_ARCHETYPES, rng).slice(0, 4);
  const locations: Location[] = shuffledArchetypes.map((a) => ({
    name: pickOne(a.names, rng),
    type: a.type,
    description: pickOne(a.descriptions, rng),
    image_url: imageForLocation(a.type),
  }));

  // 2. character_locations: каждый персонаж связан с 1-2 локациями
  const character_locations: CharacterLocation[] = [];
  for (let i = 0; i < characters.length; i++) {
    const count = rng() < 0.5 ? 1 : 2;
    const usedIndices = new Set<number>();
    for (let k = 0; k < count; k++) {
      const locIdx = Math.floor(rng() * locations.length);
      if (usedIndices.has(locIdx)) continue;
      usedIndices.add(locIdx);
      character_locations.push({
        character_index: i,
        location_index: locIdx,
        connection_type: pickOne(CONNECTION_TYPES, rng),
      });
    }
  }

  // 3. Фракции: 3-4, гарантированно ally/enemy/neutral
  const attitudes: FactionAttitude[] = ["ally", "enemy", "neutral"];
  const factionCount = 3 + (rng() < 0.5 ? 1 : 0);
  const factionPool = shuffle(FACTION_ARCHETYPES, rng);
  const factions: Faction[] = [];
  for (let i = 0; i < factionCount; i++) {
    const a = factionPool[i % factionPool.length];
    factions.push({
      name: a.name,
      goals: a.goals,
      description: a.description,
      attitude: attitudes[i] ?? "neutral",
    });
  }
  const shuffledFactions = shuffle(factions, rng);

  // 4. NPC: для каждого персонажа — ally + enemy + neutral
  const npcs: Npc[] = [];
  const usedNames = new Set<string>();
  for (let i = 0; i < characters.length; i++) {
    for (const role of NPC_ROLES) {
      const name = pickUniqueName(NPC_NAMES, usedNames, rng);
      usedNames.add(name);
      const npc: Npc = {
        name,
        role,
        description: pickOne(NPC_DESCRIPTIONS, rng),
        location_index: Math.floor(rng() * locations.length),
        faction_index: Math.floor(rng() * shuffledFactions.length),
      };
      npc.image_url = portraitForNpc(npc);
      npcs.push(npc);
    }
  }

  // 5. Ситуация
  const situation = pickOne(SITUATIONS, rng);

  return {
    locations,
    character_locations,
    factions: shuffledFactions,
    npcs,
    situation,
  };
}

function pickUniqueName(pool: string[], used: Set<string>, rng: Rng): string {
  const available = pool.filter((n) => !used.has(n));
  if (available.length > 0) return pickOne(available, rng);
  return `${pickOne(pool, rng)} ${used.size + 1}`;
}