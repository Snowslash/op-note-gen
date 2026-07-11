import type { OutputMode, ProcedureDefinition, ProcedureId } from "./types.ts";

const OUTPUT_MODES: readonly OutputMode[] = ["full", "postOp", "handover"];

export const PROCEDURE_DEFINITIONS: Readonly<Record<ProcedureId, ProcedureDefinition>> = {
  "lap-appendicectomy": {
    id: "lap-appendicectomy",
    label: "Laparoscopic appendicectomy",
    supportedOutputModes: OUTPUT_MODES,
  },
  "lap-cholecystectomy": {
    id: "lap-cholecystectomy",
    label: "Laparoscopic cholecystectomy",
    supportedOutputModes: OUTPUT_MODES,
  },
  "diagnostic-laparoscopy": {
    id: "diagnostic-laparoscopy",
    label: "Diagnostic laparoscopy +/- washout / adhesiolysis",
    supportedOutputModes: OUTPUT_MODES,
  },
  "incision-and-drainage": {
    id: "incision-and-drainage",
    label: "Incision and drainage of abscess",
    supportedOutputModes: OUTPUT_MODES,
  },
  "open-inguinal-hernia-repair": {
    id: "open-inguinal-hernia-repair",
    label: "Open inguinal hernia repair",
    supportedOutputModes: OUTPUT_MODES,
  },
  "open-umbilical-hernia-repair": {
    id: "open-umbilical-hernia-repair",
    label: "Open umbilical hernia repair",
    supportedOutputModes: OUTPUT_MODES,
  },
  "emergency-laparotomy": {
    id: "emergency-laparotomy",
    label: "Emergency laparotomy",
    supportedOutputModes: OUTPUT_MODES,
  },
};
