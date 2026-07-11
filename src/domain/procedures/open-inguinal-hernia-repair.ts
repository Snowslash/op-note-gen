import {
  formatAdditionalDetailsOperationLine,
  formatInlineValue,
  formatSelectOperationValue,
  formatTextOperationValue,
  formatYesNoOperationValue,
  hasText,
} from "../formatters.ts";
import type { OpenInguinalHerniaRepairInput } from "../types.ts";

export function buildOpenInguinalHerniaRepairOperationText(values: OpenInguinalHerniaRepairInput): string {
  return [
    `Side: ${formatInlineValue(values.herniaSide)}`,
    `Hernia type: ${formatSelectOperationValue(values.herniaType)}`,
    `Hernia contents: ${formatTextOperationValue(values.herniaContents)}`,
    `Sac management: ${formatTextOperationValue(values.sacManagement)}`,
    `Mesh used: ${formatYesNoOperationValue(values.meshUsed)}`,
    `Mesh type: ${formatTextOperationValue(values.meshType)}`,
    `Mesh fixation: ${formatTextOperationValue(values.meshFixation)}`,
    `Cord structures: ${formatTextOperationValue(values.cordStructuresManaged)}`,
    `Ilioinguinal nerve: ${formatSelectOperationValue(values.ilioinguinalNerveStatus)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getOpenInguinalHerniaRepairWarnings(values: OpenInguinalHerniaRepairInput): string[] {
  const warnings: string[] = [];

  if (values.meshUsed === "yes" && !hasText(values.meshType)) {
    warnings.push("Mesh marked as used without mesh type. Add mesh type if available.");
  }

  if (values.meshUsed === "yes" && !hasText(values.meshFixation)) {
    warnings.push("Mesh marked as used without fixation details. Add mesh fixation if available.");
  }

  return warnings;
}
