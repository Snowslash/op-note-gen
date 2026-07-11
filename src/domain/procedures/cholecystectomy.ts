import {
  formatAchievedOperationValue,
  formatAdditionalDetailsOperationLine,
  formatConversionOperationValue,
  formatNoneOrPresentOperationValue,
  formatPerformedOperationValue,
  formatSelectOperationValue,
  formatTextOperationValue,
  formatYesNoOperationValue,
  hasText,
} from "../formatters.ts";
import type { LaparoscopicCholecystectomyInput } from "../types.ts";

export function buildCholecystectomyOperationText(values: LaparoscopicCholecystectomyInput): string {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Gallbladder appearance: ${formatTextOperationValue(values.gallbladderAppearance)}`,
    `Critical view of safety: ${formatAchievedOperationValue(values.criticalViewAchieved)}`,
    `Cystic duct control: ${formatSelectOperationValue(values.cysticDuctControl)}`,
    `Cystic artery control: ${formatSelectOperationValue(values.cysticArteryControl)}`,
    `Gallbladder removed in bag: ${formatYesNoOperationValue(values.gallbladderRemovedInBag)}`,
    `Bile spillage: ${formatNoneOrPresentOperationValue(values.bileSpillage, values.bileSpillageDetails)}`,
    `Stone spillage: ${formatNoneOrPresentOperationValue(values.stoneSpillage, values.stoneSpillageDetails)}`,
    `Intraoperative cholangiogram: ${formatPerformedOperationValue(values.cholangiogramPerformed, values.cholangiogramFindings)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Converted to open: ${formatConversionOperationValue(values.convertedToOpen, values.conversionReason)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getCholecystectomyWarnings(values: LaparoscopicCholecystectomyInput): string[] {
  const warnings: string[] = [];

  if (values.criticalViewAchieved === "no") {
    warnings.push("Critical view marked as not achieved. Ensure the operation narrative and plan are clinically reviewed.");
  }

  if (values.convertedToOpen && !hasText(values.conversionReason)) {
    warnings.push("Converted to open without a reason. Add the reason if available.");
  }

  return warnings;
}
