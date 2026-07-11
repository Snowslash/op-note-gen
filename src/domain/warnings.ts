import { hasText } from "./formatters.ts";
import { getProcedureSpecificWarnings } from "./procedures/index.ts";
import type { CommonProcedureInput, ProcedureInput } from "./types.ts";

function commonWarnings(values: CommonProcedureInput): string[] {
  return !hasText(values.complications)
    ? ["No complications entered. Confirm that there were no immediate complications."]
    : [];
}

function specimenAndDrainWarnings(values: CommonProcedureInput): string[] {
  const warnings: string[] = [];

  if (!hasText(values.specimen)) {
    warnings.push("No specimen entered. Confirm whether there was no specimen or add details.");
  }

  if (!values.drainStatus) {
    warnings.push("No drain status entered. Confirm whether no drain was placed or add details.");
  } else if (values.drainStatus === "yes" && !hasText(values.drainLocation)) {
    warnings.push("Drain marked as yes without a location. Add drain location if available.");
  }

  return warnings;
}

function drainWarnings(values: CommonProcedureInput): string[] {
  if (!values.drainStatus) {
    return ["No drain status entered. Confirm whether no drain was placed or add details."];
  }

  if (values.drainStatus === "yes" && !hasText(values.drainLocation)) {
    return ["Drain marked as yes without a location. Add drain location if available."];
  }

  return [];
}

export function getAdvisoryWarnings(values: ProcedureInput): string[] {
  const warnings = commonWarnings(values);

  switch (values.procedureId) {
    case "lap-appendicectomy":
    case "lap-cholecystectomy":
    case "diagnostic-laparoscopy":
    case "emergency-laparotomy":
      warnings.push(...specimenAndDrainWarnings(values));
      break;
    case "open-inguinal-hernia-repair":
    case "open-umbilical-hernia-repair":
      warnings.push(...drainWarnings(values));
      break;
    case "incision-and-drainage":
      break;
  }

  warnings.push(...getProcedureSpecificWarnings(values));
  return warnings;
}
