import { formatSelectOperationValue, formatTextOperationValue, hasText } from "../formatters.ts";
import type { CephalomedullaryNailInput } from "../types.ts";

export function buildCephalomedullaryNailOperationText(values: CephalomedullaryNailInput): string {
  return [
    `Fracture pattern: ${formatTextOperationValue(values.cmnFracturePattern)}`,
    `Reduction method: ${formatSelectOperationValue(values.cmnReductionMethod)}`,
    `Reduction details: ${formatTextOperationValue(values.cmnReductionDetails)}`,
    `Entry point / approach / incision: ${formatTextOperationValue(values.cmnEntryPointAndIncision)}`,
    `Canal preparation: ${formatTextOperationValue(values.cmnCanalPreparation)}`,
    `Nail insertion: ${formatTextOperationValue(values.cmnNailInsertionDetails)}`,
    `Proximal fixation: ${formatTextOperationValue(values.cmnProximalFixationDetails)}`,
    `Distal locking performed: ${formatSelectOperationValue(values.cmnDistalLockingPerformed)}`,
    values.cmnDistalLockingPerformed === "yes"
      ? `Distal locking details: ${formatTextOperationValue(values.cmnDistalLockingDetails)}`
      : "",
    `Compression applied: ${formatSelectOperationValue(values.cmnCompressionApplied)}`,
    `Irrigation: ${formatTextOperationValue(values.cmnIrrigationDetails)}`,
    `Additional operative details: ${formatTextOperationValue(values.additionalOperativeDetails)}`,
  ].filter(Boolean).join("\n");
}

export function getCephalomedullaryNailWarnings(values: CephalomedullaryNailInput): string[] {
  const warnings: string[] = [];
  if (!hasText(values.cmnReductionDetails)) warnings.push("No fracture-reduction details entered. Add the reduction performed if available.");
  if (!hasText(values.cmnEntryPointAndIncision)) warnings.push("No entry-point, approach or incision details entered. Add the recorded details if available.");
  if (!hasText(values.cmnProximalFixationDetails)) warnings.push("No proximal fixation details entered. Add the fixation performed if available.");
  if (!values.cmnDistalLockingPerformed) {
    warnings.push("Distal-locking status not recorded. Confirm whether distal locking was performed or not applicable.");
  } else if (values.cmnDistalLockingPerformed === "yes" && !hasText(values.cmnDistalLockingDetails)) {
    warnings.push("Distal locking marked as performed without details. Add the fixation performed.");
  }
  return warnings;
}
