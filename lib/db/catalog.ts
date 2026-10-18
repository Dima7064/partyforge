import { createServerClient } from "@/lib/supabase/server";

export async function getClasses() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, role, ability_priorities, tone_tags, description")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getRaces() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("races")
    .select("id, name, tone_tags, description")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getBackgrounds() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("backgrounds")
    .select("id, name, tone_tags, description")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getTraits() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("traits")
    .select("id, type, name, tags, description")
    .order("type, name");
  if (error) throw error;
  return data;
}

export async function getSecrets() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("secrets")
    .select("id, text, tags");
  if (error) throw error;
  return data;
}

export async function getHookTemplates() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("hook_templates")
    .select("id, template, type, tags");
  if (error) throw error;
  return data;
}

export async function getToneWeights() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("tone_weights")
    .select("id, tone, entity_type, entity_id, weight");
  if (error) throw error;
  return data;
}