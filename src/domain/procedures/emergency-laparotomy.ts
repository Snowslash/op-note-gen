import {
  formatAdditionalDetailsOperationLine,
  formatTextOperationValue,
  formatYesNoOperationValue,
  hasText,
} from "../formatters.ts";
import type { EmergencyLaparotomyInput } from "../types.ts";

export function buildEmergencyLaparotomyOperationText(values: EmergencyLaparotomyInput): string {
  const detailLine = (label: string, status: string, detail: string) => {
    if (status === "yes" || hasText(detail)) {
      return `${label}: ${formatTextOperationValue(detail)}`;
    }

    return "";
  };

  return [
    `Incision: ${formatTextOperationValue(values.laparotomyIncision)}`,
    `Pathology/source: ${formatTextOperationValue(values.laparotomyPathology)}`,
    `Procedure performed: ${formatTextOperationValue(values.laparotomyProcedurePerformed)}`,
    `Bowel resection performed: ${formatYesNoOperationValue(values.laparotomyBowelResectionPerformed)}`,
    detailLine("Bowel resection details", values.laparotomyBowelResectionPerformed, values.laparotomyBowelResectionDetails),
    `Anastomosis performed: ${formatYesNoOperationValue(values.laparotomyAnastomosisPerformed)}`,
    detailLine("Anastomosis details", values.laparotomyAnastomosisPerformed, values.laparotomyAnastomosisDetails),
    `Stoma formed: ${formatYesNoOperationValue(values.laparotomyStomaFormed)}`,
    detailLine("Stoma details", values.laparotomyStomaFormed, values.laparotomyStomaDetails),
    `Washout performed: ${formatYesNoOperationValue(values.laparotomyWashoutPerformed)}`,
    detailLine("Washout details", values.laparotomyWashoutPerformed, values.laparotomyWashoutDetails),
    `Temporary abdominal closure: ${formatYesNoOperationValue(values.laparotomyTemporaryClosure)}`,
    detailLine("Temporary closure details", values.laparotomyTemporaryClosure, values.laparotomyTemporaryClosureDetails),
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

export function getEmergencyLaparotomyWarnings(values: EmergencyLaparotomyInput): string[] {
  const warnings: string[] = [];

  if (values.laparotomyBowelResectionPerformed === "yes" && !hasText(values.laparotomyBowelResectionDetails)) {
    warnings.push("Bowel resection marked as performed without details. Add resection details if available.");
  }

  if (values.laparotomyAnastomosisPerformed === "yes" && !hasText(values.laparotomyAnastomosisDetails)) {
    warnings.push("Anastomosis marked as performed without details. Add anastomosis details if available.");
  }

  if (values.laparotomyStomaFormed === "yes" && !hasText(values.laparotomyStomaDetails)) {
    warnings.push("Stoma marked as formed without details. Add stoma details if available.");
  }

  if (values.laparotomyTemporaryClosure === "yes" && !hasText(values.laparotomyTemporaryClosureDetails)) {
    warnings.push("Temporary abdominal closure marked as yes without details. Add closure details if available.");
  }

  return warnings;
}
