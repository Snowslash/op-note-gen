import { formatSelectOperationValue, formatTextOperationValue, hasText } from "../formatters.ts";
import type { DynamicHipScrewInput } from "../types.ts";

export function buildDynamicHipScrewOperationText(values: DynamicHipScrewInput): string {
  return [
    `Fracture pattern: ${formatTextOperationValue(values.dhsFracturePattern)}`,
    `Reduction method: ${formatSelectOperationValue(values.dhsReductionMethod)}`,
    `Reduction details: ${formatTextOperationValue(values.dhsReductionDetails)}`,
    `Approach / incision: ${formatTextOperationValue(values.dhsApproachAndIncision)}`,
    `Guidewire and lag-screw placement: ${formatTextOperationValue(values.dhsGuidewireAndLagScrewDetails)}`,
    `Side-plate and screw fixation: ${formatTextOperationValue(values.dhsPlateFixationDetails)}`,
    `Compression applied: ${formatSelectOperationValue(values.dhsCompressionApplied)}`,
    `Irrigation: ${formatTextOperationValue(values.dhsIrrigationDetails)}`,
    `Additional operative details: ${formatTextOperationValue(values.additionalOperativeDetails)}`,
  ].join("\n");
}

export function getDynamicHipScrewWarnings(values: DynamicHipScrewInput): string[] {
  const warnings: string[] = [];
  if (!hasText(values.dhsReductionDetails)) warnings.push("No fracture-reduction details entered. Add the reduction performed if available.");
  if (!hasText(values.dhsGuidewireAndLagScrewDetails)) warnings.push("No guidewire or lag-screw placement details entered. Add the recorded details if available.");
  if (!hasText(values.dhsPlateFixationDetails)) warnings.push("No side-plate fixation details entered. Add the fixation performed if available.");
  return warnings;
}
