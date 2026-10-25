import type {
  Campaign,
  Character,
  Hook,
  HookTemplateRow,
  Rng,
} from "@/types/generator";

const TYPE_LABEL_RU: Record<string, string> = {
  personal: "Личный",
  social: "Социальный",
  exploration: "Исследование",
  combat: "Бой",
};

interface FillResult {
  text: string;
  metadata: Record<string, string>;
}

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
    const template = pickTemplate(
      templates,
      partial.input.tone,
      usedTemplates,
      rng,
    );
    if (!template) break;
    usedTemplates.add(template.id);

    const { text, metadata } = fillTemplate(
      template.template,
      char,
      partial,
      rng,
    );
    hooks.push({
      title: `${char.name}: ${TYPE_LABEL_RU[template.type] ?? "Событие"}`,
      description: text,
      type: template.type,
      character_index: i,
      template_id: template.id,
      metadata,
    });
  }

  if (hooks.length < 5 && partial.characters.length > 0) {
    const template = pickTemplate(
      templates,
      partial.input.tone,
      usedTemplates,
      rng,
    );
    if (template) {
      const char = partial.characters[0];
      const { text, metadata } = fillTemplate(
        template.template,
        char,
        partial,
        rng,
      );
      hooks.push({
        title: `Партия: ${TYPE_LABEL_RU[template.type] ?? "Событие"}`,
        description: text,
        type: template.type,
        character_index: 0,
        template_id: template.id,
        metadata,
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
): FillResult {
  const metadata: Record<string, string> = { character: character.name };

  function pickOrGet(
    key: "npc" | "faction" | "location",
    pool: { name: string }[],
    fallback: string,
  ): string {
    if (metadata[key]) return metadata[key];
    const value =
      pool.length > 0
        ? pool[Math.floor(rng() * pool.length)].name
        : fallback;
    metadata[key] = value;
    return value;
  }

  let result = template;
  result = result.replace(/{character}/g, character.name);
  result = result.replace(/{npc}/g, () =>
    pickOrGet("npc", partial.npcs, "незнакомец"),
  );
  result = result.replace(/{faction}/g, () =>
    pickOrGet("faction", partial.factions, "неизвестная фракция"),
  );
  result = result.replace(/{location}/g, () =>
    pickOrGet("location", partial.locations, "неизвестное место"),
  );

  return { text: result, metadata };
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