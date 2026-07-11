import {
  buildAdditionalTeamMembersLine,
  buildClosureText,
  buildComplicationsText,
  buildDrainText,
  formatBlock,
  formatDateTimeValue,
  formatInlineValue,
  formatTextOperationValue,
  hasText,
} from "./formatters.ts";
import { buildOperationText } from "./procedures/index.ts";
import { PROCEDURE_DEFINITIONS } from "./registry.ts";
import type { CommonProcedureInput, OutputMode, ProcedureInput } from "./types.ts";

function buildStructuredPostOperativePlan(values: CommonProcedureInput, postOperativeCareLabel: string): string[] {
  const lines: string[] = [];

  if (hasText(values.antibioticProphylaxis)) {
    lines.push(`Antibiotic prophylaxis: ${values.antibioticProphylaxis}`);
  }

  if (hasText(values.dvtProphylaxis)) {
    lines.push(`DVT prophylaxis: ${values.dvtProphylaxis}`);
  }

  if (hasText(values.postOpPlan)) {
    lines.push(`${postOperativeCareLabel}: ${values.postOpPlan}`);
  }

  return lines;
}

function buildPostOperativePlanOutput(values: ProcedureInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  const lines = [
    `Procedure: ${procedure.label}`,
    ...buildStructuredPostOperativePlan(values, "Care instructions"),
  ];

  return lines.length > 1 ? lines.join("\n") : `Procedure: ${procedure.label}\nPost-operative plan: no plan details entered.`;
}

function buildHandoverOutput(values: ProcedureInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  return [
    `Procedure: ${procedure.label}`,
    hasText(values.findings) ? `Findings: ${values.findings}` : "",
    values.drainStatus === "yes" ? `Drain: ${buildDrainText(values)}` : "",
    hasText(values.complications) ? `Complications: ${buildComplicationsText(values)}` : "",
    ...buildStructuredPostOperativePlan(values, "Care instructions"),
  ].filter(Boolean).join("\n");
}

function buildFullOutput(values: ProcedureInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  const includePorts = values.procedureId === "lap-appendicectomy"
    || values.procedureId === "lap-cholecystectomy"
    || values.procedureId === "diagnostic-laparoscopy";

  return [
    `Procedure: ${procedure.label}`,
    `Date/time: ${formatDateTimeValue(values.operationDateTime)}`,
    `Surgeon / Assistant: Surgeon ${hasText(values.surgeon) ? values.surgeon : "not specified"}; Assistant ${hasText(values.assistant) ? values.assistant : "not specified"}`,
    buildAdditionalTeamMembersLine(values),
    hasText(values.supervisingConsultant) ? `Supervising consultant: ${values.supervisingConsultant}` : "",
    `Anaesthetic: ${formatInlineValue(values.anaesthetic)}`,
    hasText(values.anaesthetist) ? `Anaesthetist: ${values.anaesthetist}` : "",
    formatBlock("Indication", values.indication),
    formatBlock("Findings", values.findings),
    includePorts && hasText(values.portsUsed) ? formatBlock("Ports", values.portsUsed) : "",
    `Operation:\n${buildOperationText(values)}`,
    `Specimen: ${formatInlineValue(hasText(values.specimen) ? values.specimen : "")}`,
    `Drain: ${buildDrainText(values)}`,
    hasText(values.bloodLoss) && values.bloodLoss.trim().toLowerCase() !== "not specified" ? `Estimated blood loss: ${values.bloodLoss}` : "",
    `Complications: ${buildComplicationsText(values)}`,
    `Closure: ${buildClosureText(values)}`,
    [
      "Post-operative plan:",
      `Antibiotic prophylaxis: ${formatTextOperationValue(values.antibioticProphylaxis)}`,
      `DVT prophylaxis: ${formatTextOperationValue(values.dvtProphylaxis)}`,
      `Post-operative care instructions: ${formatTextOperationValue(values.postOpPlan)}`,
    ].join("\n"),
  ].filter(Boolean).join("\n\n");
}

export function generateNote(values: ProcedureInput, mode: OutputMode = "full"): string {
  if (mode === "postOp") {
    return buildPostOperativePlanOutput(values);
  }

  if (mode === "handover") {
    return buildHandoverOutput(values);
  }

  return buildFullOutput(values);
}
