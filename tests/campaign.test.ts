import { describe, it, expect } from "vitest";
import { generateCampaign } from "@/lib/generator/campaign";
import { fixtureData } from "./fixtures";
import type { GeneratorInput } from "@/types/generator";

const baseInput: GeneratorInput = {
  system: "dnd5e",
  level: 3,
  tone: "dark_fantasy",
  party_size: 4,
  world: "custom",
  constraints: {},
  duration: "mini_campaign",
};

describe("generateCampaign", () => {
  it("возвращает все поля", () => {
    const campaign = generateCampaign(baseInput, fixtureData, 42);
    expect(campaign.input).toEqual(baseInput);
    expect(campaign.characters).toHaveLength(4);
    expect(campaign.relationships.length).toBeGreaterThan(0);
    expect(campaign.locations).toHaveLength(4);
    expect(campaign.character_locations.length).toBeGreaterThan(0);
    expect(campaign.factions.length).toBeGreaterThanOrEqual(3);
    expect(campaign.npcs.length).toBeGreaterThan(0);
    expect(campaign.situation.length).toBeGreaterThan(0);
    expect(campaign.hooks.length).toBeGreaterThanOrEqual(4);
  });

  it("все персонажи заполнены", () => {
    const campaign = generateCampaign(baseInput, fixtureData, 42);
    for (const c of campaign.characters) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.class_name.length).toBeGreaterThan(0);
      expect(c.backstory.length).toBeGreaterThan(50);
      expect(c.secret_text.length).toBeGreaterThan(0);
      expect(c.personality.values.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("все имена персонажей уникальны", () => {
    const campaign = generateCampaign(baseInput, fixtureData, 42);
    const names = campaign.characters.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("все классы уникальны", () => {
    const campaign = generateCampaign(baseInput, fixtureData, 42);
    const classes = campaign.characters.map((c) => c.class_name);
    expect(new Set(classes).size).toBe(classes.length);
  });

  it("детерминирован при одном seed", () => {
    const c1 = generateCampaign(baseInput, fixtureData, 42);
    const c2 = generateCampaign(baseInput, fixtureData, 42);
    expect(c1).toEqual(c2);
  });

  it("детерминирован при string seed", () => {
    const c1 = generateCampaign(baseInput, fixtureData, "abcdef");
    const c2 = generateCampaign(baseInput, fixtureData, "abcdef");
    expect(c1).toEqual(c2);
  });

  it("разные seed — разные кампании", () => {
    const c1 = generateCampaign(baseInput, fixtureData, 1);
    const c2 = generateCampaign(baseInput, fixtureData, 2);
    expect(JSON.stringify(c1)).not.toBe(JSON.stringify(c2));
  });

  it("работает с party_size=3", () => {
    const input = { ...baseInput, party_size: 3 };
    const campaign = generateCampaign(input, fixtureData, 42);
    expect(campaign.characters).toHaveLength(3);
  });

  it("не падает без seed", () => {
    expect(() => generateCampaign(baseInput, fixtureData)).not.toThrow();
  });

  it("все связи ссылаются на существующих персонажей", () => {
    const campaign = generateCampaign(baseInput, fixtureData, 42);
    for (const r of campaign.relationships) {
      expect(r.source_character_index).toBeLessThan(campaign.characters.length);
      expect(r.target_character_index).toBeLessThan(campaign.characters.length);
    }
  });

  it("у каждой character_location индексы валидны", () => {
    const campaign = generateCampaign(baseInput, fixtureData, 42);
    for (const cl of campaign.character_locations) {
      expect(cl.character_index).toBeLessThan(campaign.characters.length);
      expect(cl.location_index).toBeLessThan(campaign.locations.length);
    }
  });
});