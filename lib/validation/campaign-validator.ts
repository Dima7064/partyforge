import type {
  Campaign,
  Character,
  Hook,
  Relationship,
} from "@/types/generator";
import type { RuleIssue, RuleResult, Severity } from "./rules";
import { makeResult } from "./rules";

const CORE_ROLES = ["tank", "healer", "dps"] as const;
const VALID_REL_TYPES = ["trust", "debt", "love", "conflict", "secret"];
const VALID_HOOK_TYPES = ["personal", "social", "exploration", "combat"];

export function validateRolesRule(
  characters: Character[],
  severity: Severity = "error",
): RuleIssue[] {
  const present = new Set(characters.map((c) => c.role));
  const issues: RuleIssue[] = [];
  for (const role of CORE_ROLES) {
    if (!present.has(role)) {
      issues.push({
        code: "ROLE_MISSING",
        severity,
        message: `В партии нет роли «${role}».`,
        field: "roles",
      });
    }
  }
  return issues;
}

export function validateRelationshipsRule(
  characters: Character[],
  relationships: Relationship[],
): RuleIssue[] {
  if (characters.length < 2) return [];
  const issues: RuleIssue[] = [];

  const degree = new Array(characters.length).fill(0);
  for (const r of relationships) {
    if (
      r.source_character_index >= 0 &&
      r.source_character_index < characters.length
    ) {
      degree[r.source_character_index]++;
    }
    if (
      r.target_character_index >= 0 &&
      r.target_character_index < characters.length
    ) {
      degree[r.target_character_index]++;
    }
  }
  const isolated = degree.filter((d) => d === 0).length;
  if (isolated > 0) {
    issues.push({
      code: "REL_ISOLATED",
      severity: "error",
      message: `${isolated} изолированных персонажей (нет связей).`,
      field: "relationships",
    });
  }

  if (
    relationships.some(
      (r) => r.source_character_index === r.target_character_index,
    )
  ) {
    issues.push({
      code: "REL_SELF_LOOP",
      severity: "error",
      message: "Найдена связь персонажа с самим собой.",
      field: "relationships",
    });
  }

  const types = new Set(relationships.map((r) => r.type));
  if (!types.has("conflict")) {
    issues.push({
      code: "REL_NO_CONFLICT",
      severity: "warning",
      message: "Нет ни одной связи-конфликта.",
      field: "relationships",
    });
  }
  if (!types.has("trust") && !types.has("love") && !types.has("debt")) {
    issues.push({
      code: "REL_NO_POSITIVE",
      severity: "warning",
      message: "Нет ни одной позитивной связи.",
      field: "relationships",
    });
  }
  if (!types.has("secret")) {
    issues.push({
      code: "REL_NO_SECRET",
      severity: "info",
      message: "Нет ни одной тайной связи.",
      field: "relationships",
    });
  }

  for (const r of relationships) {
    if (!VALID_REL_TYPES.includes(r.type)) {
      issues.push({
        code: "REL_INVALID_TYPE",
        severity: "error",
        message: `Неизвестный тип связи: ${r.type}.`,
        field: "relationships",
      });
    }
  }

  return issues;
}

export function validateHooksRule(
  characters: Character[],
  hooks: Hook[],
): RuleIssue[] {
  if (characters.length === 0) return [];
  const issues: RuleIssue[] = [];

  if (hooks.length === 0) {
    issues.push({
      code: "HOOKS_EMPTY",
      severity: "error",
      message: "Крючки не сгенерированы.",
      field: "hooks",
    });
    return issues;
  }

  const covered = new Set(
    hooks.map((h) => h.character_index).filter((i): i is number => i !== undefined),
  );
  const missing = characters.filter((_, i) => !covered.has(i)).length;
  if (missing > 0) {
    issues.push({
      code: "HOOKS_MISSING",
      severity: "warning",
      message: `${missing} персонажей без личного крючка.`,
      field: "hooks",
    });
  }

  for (const h of hooks) {
    if (!VALID_HOOK_TYPES.includes(h.type)) {
      issues.push({
        code: "HOOK_INVALID_TYPE",
        severity: "error",
        message: `Неизвестный тип крючка: ${h.type}.`,
        field: "hooks",
      });
    }
  }

  return issues;
}

export function validateCampaign(campaign: Campaign): RuleResult {
  const issues: RuleIssue[] = [
    ...validateRolesRule(campaign.characters, "warning"),
    ...validateRelationshipsRule(campaign.characters, campaign.relationships),
    ...validateHooksRule(campaign.characters, campaign.hooks),
  ];
  return makeResult(issues);
}