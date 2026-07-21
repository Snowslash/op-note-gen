import { hasText } from "./formatters.ts";
import type {
  AnkleOrifInput,
  CephalomedullaryNailInput,
  DistalRadiusOrifInput,
  DynamicHipScrewInput,
  FieldValidationError,
  HipHemiarthroplastyInput,
  OrthopaedicProcedureInput,
  ProcedureInput,
  ValidationResult,
} from "./types.ts";

function ankleHasFixationDetails(values: AnkleOrifInput): boolean {
  return values.fibularFixationPerformed === "yes"
    || hasText(values.fibularFixationDetails)
    || values.medialMalleolusFixationPerformed === "yes"
    || hasText(values.medialMalleolusFixationDetails)
    || values.posteriorMalleolusFixationPerformed === "yes"
    || hasText(values.posteriorMalleolusFixationDetails)
    || values.syndesmosisStabilised === "yes"
    || hasText(values.syndesmosisFixationDetails);
}

function hipHemiarthroplastyHasFixationDetails(values: HipHemiarthroplastyInput): boolean {
  return hasText(values.hemiStemFixation) || hasText(values.hemiCementDetails);
}

function dynamicHipScrewHasFixationDetails(values: DynamicHipScrewInput): boolean {
  return hasText(values.dhsGuidewireAndLagScrewDetails)
    || hasText(values.dhsPlateFixationDetails)
    || values.dhsCompressionApplied === "yes";
}

function cephalomedullaryNailHasFixationDetails(values: CephalomedullaryNailInput): boolean {
  return hasText(values.cmnNailInsertionDetails)
    || hasText(values.cmnProximalFixationDetails)
    || values.cmnDistalLockingPerformed === "yes"
    || hasText(values.cmnDistalLockingDetails)
    || values.cmnCompressionApplied === "yes";
}

function distalRadiusHasFixationDetails(values: DistalRadiusOrifInput): boolean {
  return hasText(values.distalRadiusFixationDetails);
}

function orthopaedicHasFixationDetails(values: OrthopaedicProcedureInput): boolean {
  switch (values.procedureId) {
    case "ankle-orif":
      return ankleHasFixationDetails(values);
    case "hip-hemiarthroplasty":
      return hipHemiarthroplastyHasFixationDetails(values);
    case "dynamic-hip-screw":
      return dynamicHipScrewHasFixationDetails(values);
    case "cephalomedullary-nail":
      return cephalomedullaryNailHasFixationDetails(values);
    case "distal-radius-orif":
      return distalRadiusHasFixationDetails(values);
  }
}

export function validateProcedureInput(values: ProcedureInput): ValidationResult {
  const errors: FieldValidationError[] = [];

  if (!hasText(values.indication)) {
    errors.push({ field: "indication", message: "Indication is required." });
  }

  if (!hasText(values.findings)) {
    errors.push({ field: "findings", message: "Findings are required." });
  }

  if ("side" in values) {
    if (!hasText(values.side)) {
      errors.push({ field: "side", message: "Side is required." });
    }

    if (values.implantsUsed === "no" && orthopaedicHasFixationDetails(values)) {
      errors.push({
        field: "implantsUsed",
        message: "Implants are marked as not used but fixation details are present. Correct the implant status or fixation details before generating.",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
