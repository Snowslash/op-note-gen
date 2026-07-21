import { formatSelectOperationValue, formatTextOperationValue, hasText } from "../formatters.ts";
import type { DistalRadiusOrifInput } from "../types.ts";

export function buildDistalRadiusOrifOperationText(values: DistalRadiusOrifInput): string {
  return [
    `Fracture pattern: ${formatTextOperationValue(values.distalRadiusFracturePattern)}`,
    `Surgical approach: ${formatSelectOperationValue(values.distalRadiusApproach)}`,
    `Approach / incision details: ${formatTextOperationValue(values.distalRadiusApproachAndIncision)}`,
    `Reduction details: ${formatTextOperationValue(values.distalRadiusReductionDetails)}`,
    `Plate and screw fixation: ${formatTextOperationValue(values.distalRadiusFixationDetails)}`,
    `Distal radioulnar joint assessed: ${formatSelectOperationValue(values.distalRadiusDrujAssessed)}`,
    values.distalRadiusDrujAssessed === "yes"
      ? `Distal radioulnar joint assessment: ${formatTextOperationValue(values.distalRadiusDrujDetails)}`
      : "",
    `Tendon assessment: ${formatTextOperationValue(values.distalRadiusTendonAssessment)}`,
    `Irrigation: ${formatTextOperationValue(values.distalRadiusIrrigationDetails)}`,
    `Additional operative details: ${formatTextOperationValue(values.additionalOperativeDetails)}`,
  ].filter(Boolean).join("\n");
}

export function getDistalRadiusOrifWarnings(values: DistalRadiusOrifInput): string[] {
  const warnings: string[] = [];
  if (!hasText(values.distalRadiusApproach)) warnings.push("No distal-radius approach entered. Add the approach used.");
  if (!hasText(values.distalRadiusReductionDetails)) warnings.push("No distal-radius reduction details entered. Add the reduction performed if available.");
  if (!hasText(values.distalRadiusFixationDetails)) warnings.push("No plate or screw fixation details entered. Add the fixation performed if available.");
  if (!values.distalRadiusDrujAssessed) {
    warnings.push("Distal radioulnar joint assessment not recorded. Confirm whether it was assessed.");
  } else if (values.distalRadiusDrujAssessed === "yes" && !hasText(values.distalRadiusDrujDetails)) {
    warnings.push("Distal radioulnar joint marked as assessed without findings. Add the recorded assessment.");
  }
  return warnings;
}
