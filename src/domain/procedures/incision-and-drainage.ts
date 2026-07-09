import {
  formatAdditionalDetailsOperationLine,
  formatSelectOperationValue,
  formatTextOperationValue,
  formatYesNoOperationValue,
} from "../formatters.ts";
import type { IncisionAndDrainageInput } from "../types.ts";

function formatSentStatus(value: string): string {
  if (value === "yes") {
    return "sent";
  }

  if (value === "no") {
    return "not sent";
  }

  return "not specified";
}

function formatYesNoNotApplicableOperationValue(value: string): string {
  return value === "not applicable" ? "not applicable" : formatYesNoOperationValue(value);
}

export function buildIncisionAndDrainageOperationText(values: IncisionAndDrainageInput): string {
  return [
    `Incision site: ${formatTextOperationValue(values.incisionSite)}`,
    `Incision: ${formatSelectOperationValue(values.incisionType)}`,
    `Contents drained: ${formatSelectOperationValue(values.abscessContents)}`,
    `Microbiology swab: ${formatSentStatus(values.pusSwabSent)}`,
    `Loculations broken down: ${formatYesNoNotApplicableOperationValue(values.loculationsBrokenDown)}`,
    `Cavity irrigation/washout: ${formatYesNoOperationValue(values.cavityIrrigated)}`,
    `Packing/drain: ${formatTextOperationValue(values.packingOrDrain)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getIncisionAndDrainageWarnings(values: IncisionAndDrainageInput): string[] {
  const warnings: string[] = [];

  if (!values.specimen.trim() && values.pusSwabSent !== "yes") {
    warnings.push("No specimen or microbiology swab entered. Confirm whether a swab/specimen was sent.");
  }

  if (!values.drainStatus && !values.packingOrDrain.trim()) {
    warnings.push("No drain status or packing details entered. Confirm whether the cavity was packed, drained, or left without either.");
  }

  if (values.pusSwabSent === "yes" && !values.specimen.trim()) {
    warnings.push("Microbiology swab marked as sent. Consider documenting the specimen/swab in the specimen field.");
  }

  return warnings;
}
