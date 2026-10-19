import { createServerClient } from "@/lib/supabase/server";
import type {
  BackgroundRow,
  ClassRow,
  GeneratorData,
  HookTemplateRow,
  RaceRow,
  SecretRow,
  ToneWeightRow,
  TraitRow,
} from "@/types/generator";

export async function loadGeneratorData(): Promise<GeneratorData> {
  const supabase = createServerClient();

  const [classes, races, backgrounds, traits, secrets, hookTemplates, toneWeights] =
    await Promise.all([
      supabase.from("classes").select("id, name, name_ru, role, ability_priorities, tone_tags, theme, description"),
      supabase.from("races").select("id, name, name_ru, tone_tags, theme, description"),
      supabase.from("backgrounds").select("id, name, name_ru, tone_tags, description"),
      supabase.from("traits").select("id, type, name, tags, description"),
      supabase.from("secrets").select("id, text, tags"),
      supabase.from("hook_templates").select("id, template, type, tags"),
      supabase.from("tone_weights").select("id, tone, entity_type, entity_id, weight"),
    ]);

  if (classes.error) throw classes.error;
  if (races.error) throw races.error;
  if (backgrounds.error) throw backgrounds.error;
  if (traits.error) throw traits.error;
  if (secrets.error) throw secrets.error;
  if (hookTemplates.error) throw hookTemplates.error;
  if (toneWeights.error) throw toneWeights.error;

  return {
    classes: (classes.data ?? []) as ClassRow[],
    races: (races.data ?? []) as RaceRow[],
    backgrounds: (backgrounds.data ?? []) as BackgroundRow[],
    traits: (traits.data ?? []) as TraitRow[],
    secrets: (secrets.data ?? []) as SecretRow[],
    hook_templates: (hookTemplates.data ?? []) as HookTemplateRow[],
    tone_weights: (toneWeights.data ?? []) as ToneWeightRow[],
  };
}