import { hasText } from "./formatters.ts";
import { getProcedureSpecificWarnings } from "./procedures/index.ts";
import type { CommonProcedureInput, ImplantRecord, OrthopaedicProcedureInput, ProcedureInput } from "./types.ts";

function generalSurgeryCommonWarnings(values: CommonProcedureInput): string[] {
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

function implantRowHasText(row: ImplantRecord): boolean {
  return [row.component, row.manufacturer, row.productOrSystem, row.size, row.lotSerialOrReference].some(hasText);
}

function orthopaedicWarnings(values: OrthopaedicProcedureInput): string[] {
  const warnings: string[] = [];

  if (!values.caseClassification) warnings.push("No case classification entered. Add elective or non-elective status if available.");
  if (!hasText(values.operationDateTime)) warnings.push("No operation date/time entered. Add the date and time if available.");
  if (!hasText(values.operativeDiagnosis)) warnings.push("No operative diagnosis entered. Add the diagnosis if available.");
  if (!hasText(values.complications)) warnings.push("No complications status entered. Record complications or explicitly state none if that is accurate.");

  if (!values.tourniquetUsed) {
    warnings.push("Tourniquet use not recorded. Confirm whether it was used, not used or not applicable.");
  } else if (values.tourniquetUsed === "yes"
    && (!hasText(values.tourniquetSite) || !hasText(values.tourniquetPressure) || !hasText(values.tourniquetDuration))) {
    warnings.push("Tourniquet marked as used without complete site, pressure and duration details. Add available details.");
  }

  if (!values.imageIntensifierUsed) {
    warnings.push("Image-intensifier use not recorded. Confirm whether it was used or not applicable.");
  } else if (values.imageIntensifierUsed === "yes" && !hasText(values.finalImagingFindings)) {
    warnings.push("Image intensifier marked as used without final imaging findings. Add the recorded findings if available.");
  }

  if (!values.additionalProcedurePerformed) {
    warnings.push("Additional-procedure status not recorded. Confirm whether an additional procedure was performed.");
  } else if (values.additionalProcedurePerformed === "yes") {
    if (!hasText(values.additionalProcedureDetails)) {
      warnings.push("Additional procedure marked as performed without procedure details. Add the procedure performed.");
    }
    if (!hasText(values.additionalProcedureReason)) {
      warnings.push("Additional procedure marked as performed without a reason. Add the reason if available.");
    }
  }

  if (!values.implantsUsed) {
    warnings.push("Implant use not recorded. Confirm whether implants were used.");
  } else if (values.implantsUsed === "yes") {
    const rows = values.implants.filter(implantRowHasText);
    if (!rows.length) {
      warnings.push("Implants marked as used without implant details. Add implant records and verify the theatre traceability record.");
    }
    for (const row of rows) {
      if (!hasText(row.component)) warnings.push("An implant record has no component name. Add the component.");
      if (!hasText(row.lotSerialOrReference)) {
        warnings.push("An implant record has no lot, serial or reference number. Add the available identifier and verify the theatre traceability record.");
      }
    }
  }

  if (!hasText(values.closureDetails)) warnings.push("No closure details entered. Add the closure technique if available.");
  if (!hasText(values.loadingInstructions)) warnings.push("No loading or weight-bearing instructions entered. Add the operative plan if available.");
  if (!hasText(values.postoperativeImaging)) warnings.push("No post-operative imaging plan entered. Confirm whether imaging is required or not applicable.");
  if (!hasText(values.followUp)) warnings.push("No follow-up plan entered. Add follow-up details if available.");
  if (!hasText(values.antibioticProphylaxis)) warnings.push("No antibiotic prophylaxis entered. Confirm whether it was given or not applicable.");
  if (!hasText(values.dvtProphylaxis)) warnings.push("No DVT prophylaxis entered. Record the plan or explicitly state not applicable if that is accurate.");

  return warnings;
}

export function getAdvisoryWarnings(values: ProcedureInput): string[] {
  if ("side" in values) {
    return [...orthopaedicWarnings(values), ...getProcedureSpecificWarnings(values)];
  }

  const warnings = generalSurgeryCommonWarnings(values);

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
