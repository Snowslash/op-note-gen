import {
  formatAdditionalDetailsOperationLine,
  formatConversionOperationValue,
  formatNoneOrPresentOperationValue,
  formatSelectOperationValue,
  formatTextOperationValue,
  formatYesNoOperationValue,
  hasText,
} from "../formatters.ts";
import type { AppendicectomyInput } from "../types.ts";

export function buildAppendicectomyOperationText(values: AppendicectomyInput): string {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Appendix appearance: ${formatTextOperationValue(values.appendixAppearance)}`,
    `Perforation: ${formatYesNoOperationValue(values.perforation)}`,
    `Contamination: ${formatNoneOrPresentOperationValue(values.contaminationPresent, values.contaminationDescription)}`,
    `Mesoappendix division: ${formatSelectOperationValue(values.mesoappendixDivision)}`,
    `Stump control: ${formatSelectOperationValue(values.stumpControl)}`,
    `Specimen removed in bag: ${formatYesNoOperationValue(values.specimenRemovedInBag)}`,
    `Washout performed: ${formatYesNoOperationValue(values.washoutPerformed)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Converted to open: ${formatConversionOperationValue(values.convertedToOpen, values.conversionReason)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getAppendicectomyWarnings(values: AppendicectomyInput): string[] {
  const warnings: string[] = [];

  if (values.contaminationPresent === "yes" && !values.washoutPerformed) {
    warnings.push("Contamination marked as present without washout status. Confirm whether washout was performed.");
  }

  if (values.convertedToOpen && !hasText(values.conversionReason)) {
    warnings.push("Converted to open without a reason. Add the reason if available.");
  }

  return warnings;
}
