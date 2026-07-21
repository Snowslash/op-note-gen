import {
  formatSelectOperationValue,
  formatTextOperationValue,
  hasText,
} from "../formatters.ts";
import type { AnkleOrifInput } from "../types.ts";

function conditionalDetailLine(label: string, controller: string, details: string): string {
  return controller === "yes" ? `${label}: ${formatTextOperationValue(details)}` : "";
}

export function buildAnkleOrifOperationText(values: AnkleOrifInput): string {
  return [
    `Fracture pattern: ${formatTextOperationValue(values.ankleFracturePattern)}`,
    `Approach / incision: ${formatTextOperationValue(values.ankleApproachAndIncision)}`,
    `Reduction method: ${formatSelectOperationValue(values.ankleReductionMethod)}`,
    `Reduction details: ${formatTextOperationValue(values.ankleReductionDetails)}`,
    `Fibular fixation performed: ${formatSelectOperationValue(values.fibularFixationPerformed)}`,
    conditionalDetailLine("Fibular fixation details", values.fibularFixationPerformed, values.fibularFixationDetails),
    `Medial malleolus fixation performed: ${formatSelectOperationValue(values.medialMalleolusFixationPerformed)}`,
    conditionalDetailLine("Medial malleolus fixation details", values.medialMalleolusFixationPerformed, values.medialMalleolusFixationDetails),
    `Posterior malleolus fixation performed: ${formatSelectOperationValue(values.posteriorMalleolusFixationPerformed)}`,
    conditionalDetailLine("Posterior malleolus fixation details", values.posteriorMalleolusFixationPerformed, values.posteriorMalleolusFixationDetails),
    `Syndesmosis assessed: ${formatSelectOperationValue(values.syndesmosisAssessed)}`,
    conditionalDetailLine("Syndesmosis assessment", values.syndesmosisAssessed, values.syndesmosisAssessmentDetails),
    values.syndesmosisAssessed === "yes"
      ? `Syndesmosis stabilised: ${formatSelectOperationValue(values.syndesmosisStabilised)}`
      : "",
    values.syndesmosisAssessed === "yes"
      ? conditionalDetailLine("Syndesmosis fixation", values.syndesmosisStabilised, values.syndesmosisFixationDetails)
      : "",
    `Irrigation: ${formatTextOperationValue(values.ankleIrrigationDetails)}`,
    `Additional operative details: ${formatTextOperationValue(values.additionalOperativeDetails)}`,
  ].filter(Boolean).join("\n");
}

export function getAnkleOrifWarnings(values: AnkleOrifInput): string[] {
  const warnings: string[] = [];

  if (!hasText(values.ankleReductionDetails)) {
    warnings.push("No ankle-fracture reduction details entered. Add the reduction performed if available.");
  }

  if (!values.fibularFixationPerformed
    && !values.medialMalleolusFixationPerformed
    && !values.posteriorMalleolusFixationPerformed) {
    warnings.push("No malleolar fixation status entered. Record the relevant fibular, medial or posterior malleolar fixation status.");
  }

  if (!values.syndesmosisAssessed) {
    warnings.push("Syndesmosis assessment not recorded. Confirm whether it was assessed.");
  } else if (values.syndesmosisAssessed === "yes" && !hasText(values.syndesmosisAssessmentDetails)) {
    warnings.push("Syndesmosis marked as assessed without method or findings. Add the recorded assessment.");
  }

  if (values.syndesmosisAssessed === "yes"
    && values.syndesmosisStabilised === "yes"
    && !hasText(values.syndesmosisFixationDetails)) {
    warnings.push("Syndesmosis marked as stabilised without fixation details. Add the fixation performed.");
  }

  return warnings;
}
