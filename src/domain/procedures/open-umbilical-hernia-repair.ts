import {
  formatAdditionalDetailsOperationLine,
  formatSelectOperationValue,
  formatTextOperationValue,
  formatYesNoOperationValue,
  hasText,
} from "../formatters.ts";
import type { OpenUmbilicalHerniaRepairInput } from "../types.ts";

export function buildOpenUmbilicalHerniaRepairOperationText(values: OpenUmbilicalHerniaRepairInput): string {
  return [
    `Defect size: ${formatTextOperationValue(values.umbilicalHerniaDefectSize)}`,
    `Hernia contents: ${formatTextOperationValue(values.umbilicalHerniaContents)}`,
    `Sac management: ${formatTextOperationValue(values.umbilicalSacManagement)}`,
    `Repair method: ${formatSelectOperationValue(values.umbilicalRepairMethod)}`,
    `Mesh used: ${formatYesNoOperationValue(values.umbilicalMeshUsed)}`,
    `Mesh type: ${formatTextOperationValue(values.umbilicalMeshType)}`,
    `Mesh position: ${formatSelectOperationValue(values.umbilicalMeshPosition)}`,
    `Mesh fixation: ${formatTextOperationValue(values.umbilicalMeshFixation)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getOpenUmbilicalHerniaRepairWarnings(values: OpenUmbilicalHerniaRepairInput): string[] {
  const warnings: string[] = [];

  if (values.umbilicalMeshUsed === "yes" && !hasText(values.umbilicalMeshType)) {
    warnings.push("Mesh marked as used without mesh type. Add mesh type if available.");
  }

  if (values.umbilicalMeshUsed === "yes" && !hasText(values.umbilicalMeshPosition)) {
    warnings.push("Mesh marked as used without mesh position. Add mesh position if available.");
  }

  if (values.umbilicalMeshUsed === "yes" && !hasText(values.umbilicalMeshFixation)) {
    warnings.push("Mesh marked as used without fixation details. Add mesh fixation if available.");
  }

  return warnings;
}
