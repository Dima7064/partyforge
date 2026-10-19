import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { loadGeneratorData } from "../lib/generator/data";
import { generateCampaign } from "../lib/generator/campaign";
import { validateRoles } from "../lib/generator/balance";
import { validateRelationships } from "../lib/generator/relationships";
import { validateHooks } from "../lib/generator/hooks";
import type { GeneratorInput } from "../types/generator";

const TONES: GeneratorInput["tone"][] = [
  "dark_fantasy",
  "heroic",
  "comedic",
  "political",
  "wild",
  "religious",
];

const N = 50;

async function main() {
  const data = await loadGeneratorData();
  console.log(`Прогон ${N} кампаний по ${TONES.length} тонам (${N * TONES.length} генераций)\n`);

  let totalRolesOk = 0;
  let totalRelOk = 0;
  let totalHooksOk = 0;
  let totalChars = 0;
  let totalRels = 0;
  let totalHooks = 0;
  let totalTime = 0;

  for (const tone of TONES) {
    let rolesOk = 0;
    let relOk = 0;
    let hooksOk = 0;
    let chars = 0;
    let rels = 0;
    let hooks = 0;

    for (let i = 0; i < N; i++) {
      const input: GeneratorInput = {
        system: "dnd5e",
        level: 3,
        tone,
        theme: "classic",
        party_size: 4,
        world: "custom",
        constraints: {},
        duration: "mini_campaign",
      };

      const t0 = Date.now();
      const campaign = generateCampaign(input, data, i);
      totalTime += Date.now() - t0;

      if (validateRoles(campaign.characters).valid) rolesOk++;
      if (validateRelationships(campaign.characters, campaign.relationships).valid) relOk++;
      if (validateHooks(campaign.hooks, campaign.characters.length)) hooksOk++;

      chars += campaign.characters.length;
      rels += campaign.relationships.length;
      hooks += campaign.hooks.length;
    }

    totalRolesOk += rolesOk;
    totalRelOk += relOk;
    totalHooksOk += hooksOk;
    totalChars += chars;
    totalRels += rels;
    totalHooks += hooks;

    const pct = (x: number) => `${Math.round((x / N) * 100)}%`;
    console.log(
      `${tone.padEnd(14)} | роли ${pct(rolesOk).padStart(4)} | связи ${pct(relOk).padStart(4)} | крючки ${pct(hooksOk).padStart(4)} | ` +
        `ср. персонажей ${(chars / N).toFixed(1)} | ср. связей ${(rels / N).toFixed(1)} | ср. крючков ${(hooks / N).toFixed(1)}`,
    );
  }

  const total = N * TONES.length;
  console.log(`\nИтого:`);
  console.log(`  Роли валидны:     ${Math.round((totalRolesOk / total) * 100)}%`);
  console.log(`  Связи валидны:    ${Math.round((totalRelOk / total) * 100)}%`);
  console.log(`  Крючки валидны:   ${Math.round((totalHooksOk / total) * 100)}%`);
  console.log(`  Ср. персонажей:   ${(totalChars / total).toFixed(1)}`);
  console.log(`  Ср. связей:       ${(totalRels / total).toFixed(1)}`);
  console.log(`  Ср. крючков:      ${(totalHooks / total).toFixed(1)}`);
  console.log(`  Ср. время ген.:   ${(totalTime / total).toFixed(0)} мс`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});