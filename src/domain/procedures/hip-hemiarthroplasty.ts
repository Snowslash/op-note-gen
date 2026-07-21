import {
  formatSelectOperationValue,
  formatTextOperationValue,
  hasText,
} from "../formatters.ts";
import type { HipHemiarthroplastyInput } from "../types.ts";

export function buildHipHemiarthroplastyOperationText(values: HipHemiarthroplastyInput): string {
  return [
    `Surgical approach: ${formatSelectOperationValue(values.hemiApproach)}`,
    `Approach / incision details: ${formatTextOperationValue(values.hemiApproachAndIncisionDetails)}`,
    `Capsule management: ${formatTextOperationValue(values.hemiCapsuleManagement)}`,
    `Femoral head excision: ${formatTextOperationValue(values.hemiFemoralHeadExcision)}`,
    `Native femoral head size: ${formatTextOperationValue(values.hemiNativeHeadSize)}`,
    `Femoral canal preparation: ${formatTextOperationValue(values.hemiCanalPreparation)}`,
    `Stem fixation: ${formatSelectOperationValue(values.hemiStemFixation)}`,
    values.hemiStemFixation === "Cemented"
      ? `Cement and cementing details: ${formatTextOperationValue(values.hemiCementDetails)}`
      : "",
    `Trial and reduction: ${formatTextOperationValue(values.hemiTrialAndReduction)}`,
    `Stability assessment: ${formatTextOperationValue(values.hemiStabilityAssessment)}`,
    `Leg length / offset assessment: ${formatTextOperationValue(values.hemiLegLengthAndOffset)}`,
    `Capsule / abductor repair: ${formatTextOperationValue(values.hemiCapsuleAndAbductorRepair)}`,
    `Additional operative details: ${formatTextOperationValue(values.additionalOperativeDetails)}`,
  ].filter(Boolean).join("\n");
}

export function getHipHemiarthroplastyWarnings(values: HipHemiarthroplastyInput): string[] {
  const warnings: string[] = [];
  if (!hasText(values.hemiApproach)) warnings.push("No hemiarthroplasty approach entered. Add the approach used.");
  if (!hasText(values.hemiStemFixation)) warnings.push("No stem-fixation method entered. Add the fixation used.");
  if (values.hemiStemFixation === "Cemented" && !hasText(values.hemiCementDetails)) {
    warnings.push("Cemented fixation selected without cement or cementing details. Add available details and verify the implant record.");
  }
  if (!hasText(values.hemiTrialAndReduction)) warnings.push("No trial and reduction details entered. Add the recorded details if available.");
  if (!hasText(values.hemiStabilityAssessment)) warnings.push("No stability assessment entered. Add the recorded assessment if available.");
  return warnings;
}
