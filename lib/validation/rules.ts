export type Severity = "error" | "warning" | "info";

export interface RuleIssue {
  code: string;
  severity: Severity;
  message: string;
  field?: string;
}

export interface RuleResult {
  valid: boolean;
  issues: RuleIssue[];
}

export function makeResult(issues: RuleIssue[]): RuleResult {
  const hasError = issues.some((i) => i.severity === "error");
  return { valid: !hasError, issues };
}

export function groupBySeverity(
  issues: RuleIssue[],
): Record<Severity, RuleIssue[]> {
  return {
    error: issues.filter((i) => i.severity === "error"),
    warning: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
  };
}