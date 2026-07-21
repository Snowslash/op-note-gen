import { buildAppendicectomyOperationText, getAppendicectomyWarnings } from "./appendicectomy.ts";
import { buildAnkleOrifOperationText, getAnkleOrifWarnings } from "./ankle-orif.ts";
import { buildCholecystectomyOperationText, getCholecystectomyWarnings } from "./cholecystectomy.ts";
import { buildCephalomedullaryNailOperationText, getCephalomedullaryNailWarnings } from "./cephalomedullary-nail.ts";
import { buildDiagnosticLaparoscopyOperationText, getDiagnosticLaparoscopyWarnings } from "./diagnostic-laparoscopy.ts";
import { buildDistalRadiusOrifOperationText, getDistalRadiusOrifWarnings } from "./distal-radius-orif.ts";
import { buildDynamicHipScrewOperationText, getDynamicHipScrewWarnings } from "./dynamic-hip-screw.ts";
import { buildEmergencyLaparotomyOperationText, getEmergencyLaparotomyWarnings } from "./emergency-laparotomy.ts";
import { buildHipHemiarthroplastyOperationText, getHipHemiarthroplastyWarnings } from "./hip-hemiarthroplasty.ts";
import { buildIncisionAndDrainageOperationText, getIncisionAndDrainageWarnings } from "./incision-and-drainage.ts";
import { buildOpenInguinalHerniaRepairOperationText, getOpenInguinalHerniaRepairWarnings } from "./open-inguinal-hernia-repair.ts";
import { buildOpenUmbilicalHerniaRepairOperationText, getOpenUmbilicalHerniaRepairWarnings } from "./open-umbilical-hernia-repair.ts";
import type { ProcedureInput } from "../types.ts";

export function buildOperationText(values: ProcedureInput): string {
  switch (values.procedureId) {
    case "lap-appendicectomy":
      return buildAppendicectomyOperationText(values);
    case "lap-cholecystectomy":
      return buildCholecystectomyOperationText(values);
    case "diagnostic-laparoscopy":
      return buildDiagnosticLaparoscopyOperationText(values);
    case "incision-and-drainage":
      return buildIncisionAndDrainageOperationText(values);
    case "open-inguinal-hernia-repair":
      return buildOpenInguinalHerniaRepairOperationText(values);
    case "open-umbilical-hernia-repair":
      return buildOpenUmbilicalHerniaRepairOperationText(values);
    case "emergency-laparotomy":
      return buildEmergencyLaparotomyOperationText(values);
    case "ankle-orif":
      return buildAnkleOrifOperationText(values);
    case "hip-hemiarthroplasty":
      return buildHipHemiarthroplastyOperationText(values);
    case "dynamic-hip-screw":
      return buildDynamicHipScrewOperationText(values);
    case "cephalomedullary-nail":
      return buildCephalomedullaryNailOperationText(values);
    case "distal-radius-orif":
      return buildDistalRadiusOrifOperationText(values);
  }
}

export function getProcedureSpecificWarnings(values: ProcedureInput): string[] {
  switch (values.procedureId) {
    case "lap-appendicectomy":
      return getAppendicectomyWarnings(values);
    case "lap-cholecystectomy":
      return getCholecystectomyWarnings(values);
    case "diagnostic-laparoscopy":
      return getDiagnosticLaparoscopyWarnings(values);
    case "incision-and-drainage":
      return getIncisionAndDrainageWarnings(values);
    case "open-inguinal-hernia-repair":
      return getOpenInguinalHerniaRepairWarnings(values);
    case "open-umbilical-hernia-repair":
      return getOpenUmbilicalHerniaRepairWarnings(values);
    case "emergency-laparotomy":
      return getEmergencyLaparotomyWarnings(values);
    case "ankle-orif":
      return getAnkleOrifWarnings(values);
    case "hip-hemiarthroplasty":
      return getHipHemiarthroplastyWarnings(values);
    case "dynamic-hip-screw":
      return getDynamicHipScrewWarnings(values);
    case "cephalomedullary-nail":
      return getCephalomedullaryNailWarnings(values);
    case "distal-radius-orif":
      return getDistalRadiusOrifWarnings(values);
  }
}
