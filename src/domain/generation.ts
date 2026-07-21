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
import type {
  CommonProcedureInput,
  ImplantRecord,
  OrthopaedicProcedureInput,
  OutputMode,
  ProcedureInput,
} from "./types.ts";

type GeneralSurgeryInput = Exclude<ProcedureInput, OrthopaedicProcedureInput>;

function buildGeneralStructuredPostOperativePlan(values: CommonProcedureInput, postOperativeCareLabel: string): string[] {
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

function buildGeneralPostOperativePlanOutput(values: GeneralSurgeryInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  const lines = [
    `Procedure: ${procedure.label}`,
    ...buildGeneralStructuredPostOperativePlan(values, "Care instructions"),
  ];

  return lines.length > 1 ? lines.join("\n") : `Procedure: ${procedure.label}\nPost-operative plan: no plan details entered.`;
}

function buildGeneralHandoverOutput(values: GeneralSurgeryInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  return [
    `Procedure: ${procedure.label}`,
    hasText(values.findings) ? `Findings: ${values.findings}` : "",
    values.drainStatus === "yes" ? `Drain: ${buildDrainText(values)}` : "",
    hasText(values.complications) ? `Complications: ${buildComplicationsText(values)}` : "",
    ...buildGeneralStructuredPostOperativePlan(values, "Care instructions"),
  ].filter(Boolean).join("\n");
}

function buildGeneralFullOutput(values: GeneralSurgeryInput): string {
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

function tnoValue(value: string): string {
  return hasText(value) ? value.trim() : "not specified";
}

function buildTnoAdditionalTeamMembersLine(values: OrthopaedicProcedureInput): string {
  const entries = values.additionalTeamMembers
    .map((member) => ({ role: member.role.trim(), name: member.name.trim() }))
    .filter((member) => member.name)
    .map((member) => `${member.role || "Team member"}: ${member.name}`);
  return entries.length ? `Additional team members: ${entries.join("; ")}` : "Additional team members: not specified";
}

function tnoBlock(label: string, value: string): string {
  return `${label}:\n${tnoValue(value)}`;
}

function buildTnoTeamMembersLine(values: OrthopaedicProcedureInput): string {
  return buildTnoAdditionalTeamMembersLine(values);
}

function implantHasText(row: ImplantRecord): boolean {
  return [row.component, row.manufacturer, row.productOrSystem, row.size, row.lotSerialOrReference].some(hasText);
}

function buildImplantsOutput(values: OrthopaedicProcedureInput): string {
  if (values.implantsUsed === "no") return "Implants used: no";
  if (values.implantsUsed !== "yes") return "Implants: not specified";

  const rows = values.implants.filter(implantHasText);
  if (!rows.length) return "Implants: not specified";

  const lines = rows.map((row, index) => {
    const attributes = [
      hasText(row.component) ? `Component: ${row.component.trim()}` : "",
      hasText(row.manufacturer) ? `manufacturer: ${row.manufacturer.trim()}` : "",
      hasText(row.productOrSystem) ? `product / system: ${row.productOrSystem.trim()}` : "",
      hasText(row.size) ? `size: ${row.size.trim()}` : "",
      hasText(row.lotSerialOrReference) ? `lot / serial / reference: ${row.lotSerialOrReference.trim()}` : "",
    ].filter(Boolean);
    return `${index + 1}. ${attributes.join("; ")}`;
  });

  return ["Implants:", ...lines].join("\n");
}

function buildTourniquetLines(values: OrthopaedicProcedureInput): string[] {
  if (values.tourniquetUsed !== "yes") {
    return [`Tourniquet used: ${tnoValue(values.tourniquetUsed)}`];
  }

  return [
    "Tourniquet used: yes",
    `Tourniquet details: Site ${tnoValue(values.tourniquetSite)}; pressure ${tnoValue(values.tourniquetPressure)}; duration ${tnoValue(values.tourniquetDuration)}`,
  ];
}

function buildImageIntensifierLines(values: OrthopaedicProcedureInput): string[] {
  if (values.imageIntensifierUsed !== "yes") {
    return [`Image intensifier used: ${tnoValue(values.imageIntensifierUsed)}`];
  }

  return [
    "Image intensifier used: yes",
    `Final intraoperative imaging: ${tnoValue(values.finalImagingFindings)}`,
  ];
}

function buildAdditionalProcedureLines(values: OrthopaedicProcedureInput): string[] {
  if (values.additionalProcedurePerformed !== "yes") {
    return [`Additional procedure performed: ${tnoValue(values.additionalProcedurePerformed)}`];
  }

  return [
    "Additional procedure performed: yes",
    `Additional procedure: ${tnoValue(values.additionalProcedureDetails)}`,
    `Reason for additional procedure: ${tnoValue(values.additionalProcedureReason)}`,
  ];
}

function buildTnoOperationText(values: OrthopaedicProcedureInput): string {
  return [
    ...buildTourniquetLines(values),
    buildOperationText(values),
    ...buildImageIntensifierLines(values),
    ...buildAdditionalProcedureLines(values),
  ].filter(Boolean).join("\n");
}

function tnoComplicationsText(values: OrthopaedicProcedureInput): string {
  return tnoValue(values.complications);
}

function buildTnoFullOutput(values: OrthopaedicProcedureInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  return [
    `Procedure: ${procedure.label}`,
    `Date/time: ${formatDateTimeValue(values.operationDateTime)}`,
    `Case classification: ${tnoValue(values.caseClassification)}`,
    `Side: ${tnoValue(values.side)}`,
    `Surgeon / Assistant: Surgeon ${tnoValue(values.surgeon)}; Assistant ${tnoValue(values.assistant)}`,
    buildTnoTeamMembersLine(values),
    `Supervising consultant: ${tnoValue(values.supervisingConsultant)}`,
    `Anaesthetic: ${tnoValue(values.anaesthetic)}`,
    `Anaesthetist: ${tnoValue(values.anaesthetist)}`,
    tnoBlock("Indication", values.indication),
    tnoBlock("Operative diagnosis", values.operativeDiagnosis),
    tnoBlock("Findings", values.findings),
    `Position / table set-up: ${tnoValue(values.positionAndTableSetup)}`,
    `Operation:\n${buildTnoOperationText(values)}`,
    `Specimens / samples: ${tnoValue(values.specimensOrSamples)}`,
    buildImplantsOutput(values),
    `Tissue removed, added or altered: ${tnoValue(values.tissueDetails)}`,
    `Estimated blood loss: ${tnoValue(values.bloodLoss)}`,
    `Complications: ${tnoComplicationsText(values)}`,
    `Haemostasis: ${tnoValue(values.haemostasisDetails)}`,
    `Closure: ${tnoValue(values.closureDetails)}`,
    [
      "Post-operative plan:",
      `Antibiotic prophylaxis: ${tnoValue(values.antibioticProphylaxis)}`,
      `DVT prophylaxis: ${tnoValue(values.dvtProphylaxis)}`,
      `Loading / weight-bearing instructions: ${tnoValue(values.loadingInstructions)}`,
      `Post-operative monitoring / checks: ${tnoValue(values.postoperativeMonitoring)}`,
      `Post-operative imaging: ${tnoValue(values.postoperativeImaging)}`,
      `Dressing / immobilisation: ${tnoValue(values.dressingAndImmobilisation)}`,
      `Wound care: ${tnoValue(values.woundCare)}`,
      `Physiotherapy / rehabilitation plan: ${tnoValue(values.rehabilitationPlan)}`,
      `Follow-up: ${tnoValue(values.followUp)}`,
      `Other post-operative instructions: ${tnoValue(values.postOpPlan)}`,
    ].join("\n"),
  ].join("\n\n");
}

function enteredLine(label: string, value: string): string {
  return hasText(value) ? `${label}: ${value.trim()}` : "";
}

function enteredComplicationsLine(values: OrthopaedicProcedureInput): string {
  return hasText(values.complications) ? `Complications: ${tnoComplicationsText(values)}` : "";
}

function buildTnoPostOperativePlanOutput(values: OrthopaedicProcedureInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  const detailLines = [
    enteredComplicationsLine(values),
    enteredLine("Antibiotic prophylaxis", values.antibioticProphylaxis),
    enteredLine("DVT prophylaxis", values.dvtProphylaxis),
    enteredLine("Loading / weight-bearing instructions", values.loadingInstructions),
    enteredLine("Post-operative monitoring / checks", values.postoperativeMonitoring),
    enteredLine("Post-operative imaging", values.postoperativeImaging),
    enteredLine("Dressing / immobilisation", values.dressingAndImmobilisation),
    enteredLine("Wound care", values.woundCare),
    enteredLine("Physiotherapy / rehabilitation plan", values.rehabilitationPlan),
    enteredLine("Follow-up", values.followUp),
    enteredLine("Other post-operative instructions", values.postOpPlan),
  ].filter(Boolean);

  return [
    `Procedure: ${procedure.label}`,
    `Side: ${tnoValue(values.side)}`,
    ...(detailLines.length ? detailLines : ["Post-operative plan: no plan details entered."]),
  ].join("\n");
}

function buildTnoHandoverOutput(values: OrthopaedicProcedureInput): string {
  const procedure = PROCEDURE_DEFINITIONS[values.procedureId];
  return [
    `Procedure: ${procedure.label}`,
    `Side: ${tnoValue(values.side)}`,
    enteredLine("Findings", values.findings),
    enteredComplicationsLine(values),
    enteredLine("Dressing / immobilisation", values.dressingAndImmobilisation),
    enteredLine("Loading / weight-bearing instructions", values.loadingInstructions),
    enteredLine("Post-operative monitoring / checks", values.postoperativeMonitoring),
    enteredLine("Post-operative imaging", values.postoperativeImaging),
    enteredLine("Antibiotic prophylaxis", values.antibioticProphylaxis),
    enteredLine("DVT prophylaxis", values.dvtProphylaxis),
    enteredLine("Physiotherapy / rehabilitation plan", values.rehabilitationPlan),
    enteredLine("Follow-up", values.followUp),
    enteredLine("Other post-operative instructions", values.postOpPlan),
  ].filter(Boolean).join("\n");
}

export function generateNote(values: ProcedureInput, mode: OutputMode = "full"): string {
  if ("side" in values) {
    if (mode === "postOp") return buildTnoPostOperativePlanOutput(values);
    if (mode === "handover") return buildTnoHandoverOutput(values);
    return buildTnoFullOutput(values);
  }

  if (mode === "postOp") return buildGeneralPostOperativePlanOutput(values);
  if (mode === "handover") return buildGeneralHandoverOutput(values);
  return buildGeneralFullOutput(values);
}
