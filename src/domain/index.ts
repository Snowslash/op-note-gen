export { generateNote } from "./generation.ts";
export { PROCEDURE_DEFINITIONS } from "./registry.ts";
export { validateProcedureInput } from "./validation.ts";
export { getAdvisoryWarnings } from "./warnings.ts";

export type {
  AnkleOrifInput,
  AppendicectomyInput,
  CephalomedullaryNailInput,
  CompletionProfile,
  CommonProcedureInput,
  DiagnosticLaparoscopyInput,
  DistalRadiusOrifInput,
  DynamicHipScrewInput,
  EmergencyLaparotomyInput,
  FieldValidationError,
  HipHemiarthroplastyInput,
  ImplantRecord,
  IncisionAndDrainageInput,
  LaparoscopicCholecystectomyInput,
  OpenInguinalHerniaRepairInput,
  OpenUmbilicalHerniaRepairInput,
  OrthopaedicCommonInput,
  OrthopaedicProcedureInput,
  OutputMode,
  ProcedureDefinition,
  ProcedureId,
  ProcedureInput,
  SharedProcedureInput,
  SurgicalSpecialty,
  TeamMember,
  ValidationResult,
} from "./types.ts";
