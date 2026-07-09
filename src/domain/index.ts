export { generateNote } from "./generation.ts";
export { PROCEDURE_DEFINITIONS } from "./registry.ts";
export { validateProcedureInput } from "./validation.ts";
export { getAdvisoryWarnings } from "./warnings.ts";

export type {
  AppendicectomyInput,
  CommonProcedureInput,
  DiagnosticLaparoscopyInput,
  EmergencyLaparotomyInput,
  FieldValidationError,
  IncisionAndDrainageInput,
  LaparoscopicCholecystectomyInput,
  OpenInguinalHerniaRepairInput,
  OpenUmbilicalHerniaRepairInput,
  OutputMode,
  ProcedureDefinition,
  ProcedureId,
  ProcedureInput,
  TeamMember,
  ValidationResult,
} from "./types.ts";
