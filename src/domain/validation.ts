import { hasText } from "./formatters.ts";
import type { FieldValidationError, ProcedureInput, ValidationResult } from "./types.ts";

export function validateProcedureInput(values: ProcedureInput): ValidationResult {
  const errors: FieldValidationError[] = [];

  if (!hasText(values.indication)) {
    errors.push({ field: "indication", message: "Indication is required." });
  }

  if (!hasText(values.findings)) {
    errors.push({ field: "findings", message: "Findings are required." });
  }

  return { valid: errors.length === 0, errors };
}
