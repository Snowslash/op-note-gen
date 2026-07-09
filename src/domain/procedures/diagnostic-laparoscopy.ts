import {
  formatAdditionalDetailsOperationLine,
  formatConversionOperationValue,
  formatSelectOperationValue,
  formatTextOperationValue,
  formatYesNoOperationValue,
  hasText,
} from "../formatters.ts";
import type { DiagnosticLaparoscopyInput } from "../types.ts";

export function buildDiagnosticLaparoscopyOperationText(values: DiagnosticLaparoscopyInput): string {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Abdominal survey: ${formatTextOperationValue(values.abdominalSurvey)}`,
    `Procedure performed: ${formatTextOperationValue(values.procedurePerformed)}`,
    `Washout/irrigation: ${formatTextOperationValue(values.washoutFluid)}`,
    `Adhesiolysis: ${formatTextOperationValue(values.adhesiolysisDetails)}`,
    `Source control: ${formatTextOperationValue(values.sourceControl)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Converted to open: ${formatConversionOperationValue(values.convertedToOpen, values.conversionReason)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getDiagnosticLaparoscopyWarnings(values: DiagnosticLaparoscopyInput): string[] {
  return values.convertedToOpen && !hasText(values.conversionReason)
    ? ["Converted to open without a reason. Add the reason if available."]
    : [];
}
