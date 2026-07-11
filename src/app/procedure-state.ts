import type {
  AppendicectomyInput,
  CommonProcedureInput,
  DiagnosticLaparoscopyInput,
  EmergencyLaparotomyInput,
  IncisionAndDrainageInput,
  LaparoscopicCholecystectomyInput,
  OpenInguinalHerniaRepairInput,
  OpenUmbilicalHerniaRepairInput,
  OutputMode,
  ProcedureId,
  ProcedureInput,
  TeamMember,
} from "../domain";

export interface SelectOrCustomControl {
  choice: string;
  custom: string;
}

export interface ProcedureControlState {
  choices: Record<string, SelectOrCustomControl>;
  drainLocationChoice: string;
  drainLocationCustom: string;
}

export interface DraftState {
  text: string;
  warnings: string[];
  fresh: boolean;
  reviewed: boolean;
}

function createCommonInput(): CommonProcedureInput {
  return {
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
  };
}

export function createProcedureInput(procedureId: ProcedureId): ProcedureInput {
  const common = createCommonInput();

  switch (procedureId) {
    case "lap-appendicectomy":
      return {
        ...common,
        procedureId,
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
      } satisfies AppendicectomyInput;
    case "lap-cholecystectomy":
      return {
        ...common,
        procedureId,
        entryTechnique: "",
        gallbladderAppearance: "",
        criticalViewAchieved: "",
        cysticDuctControl: "",
        cysticArteryControl: "",
        gallbladderRemovedInBag: "",
        bileSpillage: "",
        bileSpillageDetails: "",
        stoneSpillage: "",
        stoneSpillageDetails: "",
        cholangiogramPerformed: "",
        cholangiogramFindings: "",
        convertedToOpen: false,
        conversionReason: "",
      } satisfies LaparoscopicCholecystectomyInput;
    case "diagnostic-laparoscopy":
      return {
        ...common,
        procedureId,
        entryTechnique: "",
        abdominalSurvey: "",
        procedurePerformed: "",
        washoutFluid: "",
        adhesiolysisDetails: "",
        sourceControl: "",
        convertedToOpen: false,
        conversionReason: "",
      } satisfies DiagnosticLaparoscopyInput;
    case "incision-and-drainage":
      return {
        ...common,
        procedureId,
        incisionSite: "",
        incisionType: "",
        abscessContents: "",
        pusSwabSent: "",
        loculationsBrokenDown: "",
        cavityIrrigated: "",
        packingOrDrain: "",
      } satisfies IncisionAndDrainageInput;
    case "open-inguinal-hernia-repair":
      return {
        ...common,
        procedureId,
        herniaSide: "",
        herniaType: "",
        herniaContents: "",
        sacManagement: "",
        meshUsed: "",
        meshType: "",
        meshFixation: "",
        cordStructuresManaged: "",
        ilioinguinalNerveStatus: "",
      } satisfies OpenInguinalHerniaRepairInput;
    case "open-umbilical-hernia-repair":
      return {
        ...common,
        procedureId,
        umbilicalHerniaDefectSize: "",
        umbilicalHerniaContents: "",
        umbilicalSacManagement: "",
        umbilicalRepairMethod: "",
        umbilicalMeshUsed: "",
        umbilicalMeshType: "",
        umbilicalMeshPosition: "",
        umbilicalMeshFixation: "",
      } satisfies OpenUmbilicalHerniaRepairInput;
    case "emergency-laparotomy":
      return {
        ...common,
        procedureId,
        laparotomyIncision: "",
        laparotomyPathology: "",
        laparotomyProcedurePerformed: "",
        laparotomyBowelResectionPerformed: "",
        laparotomyBowelResectionDetails: "",
        laparotomyAnastomosisPerformed: "",
        laparotomyAnastomosisDetails: "",
        laparotomyStomaFormed: "",
        laparotomyStomaDetails: "",
        laparotomyWashoutPerformed: "",
        laparotomyWashoutDetails: "",
        laparotomyTemporaryClosure: "",
        laparotomyTemporaryClosureDetails: "",
      } satisfies EmergencyLaparotomyInput;
  }
}

export function createControlState(): ProcedureControlState {
  return { choices: {}, drainLocationChoice: "", drainLocationCustom: "" };
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
