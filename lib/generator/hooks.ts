import type {
  Campaign,
  Character,
  Hook,
  HookTemplateRow,
  Rng,
} from "@/types/generator";

export function generateHooks(
  partial: Omit<Campaign, "hooks">,
  templates: HookTemplateRow[],
  rng: Rng,
): Hook[] {
  if (templates.length === 0) return [];
  if (partial.characters.length === 0) return [];

  const hooks: Hook[] = [];
  const usedTemplates = new Set<string>();

  for (let i = 0; i < partial.characters.length; i++) {
    const char = partial.characters[i];
    const template = pickTemplate(templates, partial.input.tone, usedTemplates, rng);
    if (!template) break;
    usedTemplates.add(template.id);

    const description = fillTemplate(template.template, char, partial, rng);
    hooks.push({
      title: `${char.name}: ${template.type}`,
      description,
      type: template.type,
      character_index: i,
    });
  }

  if (hooks.length < 5 && partial.characters.length > 0) {
    const template = pickTemplate(templates, partial.input.tone, usedTemplates, rng);
    if (template) {
      const char = partial.characters[0];
      const description = fillTemplate(template.template, char, partial, rng);
      hooks.push({
        title: `Партия: ${template.type}`,
        description,
        type: template.type,
        character_index: 0,
      });
    }
  }

  return hooks;
}

function pickTemplate(
  templates: HookTemplateRow[],
  tone: string,
  used: Set<string>,
  rng: Rng,
): HookTemplateRow | null {
  const candidates = templates.filter((t) => !used.has(t.id));
  if (candidates.length === 0) return null;

  const preferred = candidates.filter((t) => t.tags.includes(tone));
  const pool = preferred.length > 0 && rng() < 0.6 ? preferred : candidates;
  return pool[Math.floor(rng() * pool.length)];
}

function fillTemplate(
  template: string,
  character: Character,
  partial: Omit<Campaign, "hooks">,
  rng: Rng,
): string {
  let result = template;

  result = result.replace(/{character}/g, character.name);

  result = result.replace(/{npc}/g, () => {
    const arr = partial.npcs;
    return arr.length > 0 ? arr[Math.floor(rng() * arr.length)].name : "незнакомец";
  });

  result = result.replace(/{faction}/g, () => {
    const arr = partial.factions;
    return arr.length > 0
      ? arr[Math.floor(rng() * arr.length)].name
      : "неизвестная фракция";
  });

  result = result.replace(/{location}/g, () => {
    const arr = partial.locations;
    return arr.length > 0
      ? arr[Math.floor(rng() * arr.length)].name
      : "неизвестное место";
  });

  return result;
}

export function validateHooks(
  hooks: Hook[],
  characterCount: number,
): boolean {
  if (hooks.length === 0) return false;
  if (characterCount === 0) return true;
  const covered = new Set(
    hooks.map((h) => h.character_index).filter((i): i is number => i !== undefined),
  );
  return covered.size === characterCount;
}