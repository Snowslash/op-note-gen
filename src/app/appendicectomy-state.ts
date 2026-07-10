import type { AppendicectomyInput, OutputMode, TeamMember } from "../domain";

export const APPENDICECTOMY_PROCEDURE_ID = "lap-appendicectomy" as const;

export interface AppendicectomyControlState {
  entryTechniqueChoice: string;
  entryTechniqueCustom: string;
  mesoappendixDivisionChoice: string;
  mesoappendixDivisionCustom: string;
  stumpControlChoice: string;
  stumpControlCustom: string;
  drainLocationChoice: string;
  drainLocationCustom: string;
}

export interface DraftState {
  text: string;
  warnings: string[];
  fresh: boolean;
  reviewed: boolean;
}

export function createAppendicectomyInput(): AppendicectomyInput {
  return {
    procedureId: APPENDICECTOMY_PROCEDURE_ID,
    operationDateTime: getLocalDateTimeValue(),
    surgeon: "",
    assistant: "",
    supervisingConsultant: "",
    anaesthetic: "",
    anaesthetist: "",
    indication: "",
    findings: "",
    portsUsed: "",
    specimen: "",
    bloodLoss: "",
    complications: "",
    antibioticProphylaxis: "",
    dvtProphylaxis: "",
    postOpPlan: "",
    drainStatus: "",
    drainLocation: "",
    haemostasisConfirmed: "",
    fascialClosurePerformed: "",
    fascialSutureMaterial: "",
    skinClosureMethod: "",
    additionalOperativeDetails: "",
    additionalTeamMembers: [],
    appendixAppearance: "",
    perforation: "",
    contaminationPresent: "",
    contaminationDescription: "",
    mesoappendixDivision: "",
    stumpControl: "",
    specimenRemovedInBag: "",
    washoutPerformed: "",
    convertedToOpen: false,
    conversionReason: "",
    entryTechnique: "",
  };
}

export function createControlState(): AppendicectomyControlState {
  return {
    entryTechniqueChoice: "",
    entryTechniqueCustom: "",
    mesoappendixDivisionChoice: "",
    mesoappendixDivisionCustom: "",
    stumpControlChoice: "",
    stumpControlCustom: "",
    drainLocationChoice: "",
    drainLocationCustom: "",
  };
}

export function createDraftState(): DraftState {
  return { text: "", warnings: [], fresh: false, reviewed: false };
}

export function getLocalDateTimeValue(date = new Date()): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function updateTeamMember(
  members: TeamMember[],
  index: number,
  changes: Partial<TeamMember>,
): TeamMember[] {
  return members.map((member, memberIndex) => memberIndex === index ? { ...member, ...changes } : member);
}

export const OUTPUT_MODES: ReadonlyArray<{ value: OutputMode; label: string }> = [
  { value: "full", label: "Full operation note" },
  { value: "postOp", label: "Post-operative plan only" },
  { value: "handover", label: "Ward handover summary" },
];
