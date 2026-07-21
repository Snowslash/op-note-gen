import type {
  AnkleOrifInput,
  AppendicectomyInput,
  CephalomedullaryNailInput,
  CommonProcedureInput,
  DiagnosticLaparoscopyInput,
  DistalRadiusOrifInput,
  DynamicHipScrewInput,
  EmergencyLaparotomyInput,
  HipHemiarthroplastyInput,
  ImplantRecord,
  IncisionAndDrainageInput,
  LaparoscopicCholecystectomyInput,
  OpenInguinalHerniaRepairInput,
  OpenUmbilicalHerniaRepairInput,
  OrthopaedicCommonInput,
  OrthopaedicProcedureInput,
  OutputMode,
  ProcedureId,
  ProcedureInput,
  SharedProcedureInput,
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

export type PreloadedTeamMember = Omit<TeamMember, "id"> & { id?: string };
export type PreloadedImplantRecord = Omit<ImplantRecord, "id"> & { id?: string };
type WithPreloadedRows<Input extends ProcedureInput> = Input extends OrthopaedicCommonInput
  ? Omit<Input, "additionalTeamMembers" | "implants"> & {
      additionalTeamMembers: PreloadedTeamMember[];
      implants: PreloadedImplantRecord[];
    }
  : Omit<Input, "additionalTeamMembers"> & { additionalTeamMembers: PreloadedTeamMember[] };
export type PreloadedProcedureInput = WithPreloadedRows<ProcedureInput>;

function createSharedInput(operationDateTime: string): SharedProcedureInput {
  return {
    operationDateTime,
    surgeon: "",
    assistant: "",
    supervisingConsultant: "",
    anaesthetic: "",
    anaesthetist: "",
    indication: "",
    findings: "",
    bloodLoss: "",
    complications: "",
    antibioticProphylaxis: "",
    dvtProphylaxis: "",
    postOpPlan: "",
    additionalOperativeDetails: "",
    additionalTeamMembers: [],
  };
}

function createCommonInput(): CommonProcedureInput {
  return {
    ...createSharedInput(getLocalDateTimeValue()),
    portsUsed: "",
    specimen: "",
    drainStatus: "",
    drainLocation: "",
    haemostasisConfirmed: "",
    fascialClosurePerformed: "",
    fascialSutureMaterial: "",
    skinClosureMethod: "",
  };
}

function createOrthopaedicCommonInput(): OrthopaedicCommonInput {
  return {
    ...createSharedInput(""),
    caseClassification: "",
    side: "",
    operativeDiagnosis: "",
    positionAndTableSetup: "",
    tourniquetUsed: "",
    tourniquetSite: "",
    tourniquetPressure: "",
    tourniquetDuration: "",
    imageIntensifierUsed: "",
    finalImagingFindings: "",
    additionalProcedurePerformed: "",
    additionalProcedureDetails: "",
    additionalProcedureReason: "",
    specimensOrSamples: "",
    tissueDetails: "",
    implantsUsed: "",
    implants: [],
    haemostasisDetails: "",
    closureDetails: "",
    dressingAndImmobilisation: "",
    loadingInstructions: "",
    postoperativeMonitoring: "",
    postoperativeImaging: "",
    woundCare: "",
    followUp: "",
    rehabilitationPlan: "",
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
    case "ankle-orif": {
      const orthopaedic = createOrthopaedicCommonInput();
      return {
        ...orthopaedic,
        procedureId,
        ankleFracturePattern: "",
        ankleApproachAndIncision: "",
        ankleReductionMethod: "",
        ankleReductionDetails: "",
        fibularFixationPerformed: "",
        fibularFixationDetails: "",
        medialMalleolusFixationPerformed: "",
        medialMalleolusFixationDetails: "",
        posteriorMalleolusFixationPerformed: "",
        posteriorMalleolusFixationDetails: "",
        syndesmosisAssessed: "",
        syndesmosisAssessmentDetails: "",
        syndesmosisStabilised: "",
        syndesmosisFixationDetails: "",
        ankleIrrigationDetails: "",
      } satisfies AnkleOrifInput;
    }
    case "hip-hemiarthroplasty": {
      const orthopaedic = createOrthopaedicCommonInput();
      return {
        ...orthopaedic,
        procedureId,
        hemiApproach: "",
        hemiApproachAndIncisionDetails: "",
        hemiCapsuleManagement: "",
        hemiFemoralHeadExcision: "",
        hemiNativeHeadSize: "",
        hemiCanalPreparation: "",
        hemiStemFixation: "",
        hemiCementDetails: "",
        hemiTrialAndReduction: "",
        hemiStabilityAssessment: "",
        hemiLegLengthAndOffset: "",
        hemiCapsuleAndAbductorRepair: "",
      } satisfies HipHemiarthroplastyInput;
    }
    case "dynamic-hip-screw": {
      const orthopaedic = createOrthopaedicCommonInput();
      return {
        ...orthopaedic,
        procedureId,
        dhsFracturePattern: "",
        dhsReductionMethod: "",
        dhsReductionDetails: "",
        dhsApproachAndIncision: "",
        dhsGuidewireAndLagScrewDetails: "",
        dhsPlateFixationDetails: "",
        dhsCompressionApplied: "",
        dhsIrrigationDetails: "",
      } satisfies DynamicHipScrewInput;
    }
    case "cephalomedullary-nail": {
      const orthopaedic = createOrthopaedicCommonInput();
      return {
        ...orthopaedic,
        procedureId,
        cmnFracturePattern: "",
        cmnReductionMethod: "",
        cmnReductionDetails: "",
        cmnEntryPointAndIncision: "",
        cmnCanalPreparation: "",
        cmnNailInsertionDetails: "",
        cmnProximalFixationDetails: "",
        cmnDistalLockingPerformed: "",
        cmnDistalLockingDetails: "",
        cmnCompressionApplied: "",
        cmnIrrigationDetails: "",
      } satisfies CephalomedullaryNailInput;
    }
    case "distal-radius-orif": {
      const orthopaedic = createOrthopaedicCommonInput();
      return {
        ...orthopaedic,
        procedureId,
        distalRadiusFracturePattern: "",
        distalRadiusApproach: "",
        distalRadiusApproachAndIncision: "",
        distalRadiusReductionDetails: "",
        distalRadiusFixationDetails: "",
        distalRadiusDrujAssessed: "",
        distalRadiusDrujDetails: "",
        distalRadiusTendonAssessment: "",
        distalRadiusIrrigationDetails: "",
      } satisfies DistalRadiusOrifInput;
    }
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

let fallbackRepeatableRowId = 0;

function createStableRowId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  fallbackRepeatableRowId += 1;
  return randomId ?? `${prefix}-${Date.now()}-${fallbackRepeatableRowId}`;
}

function createTeamMemberId(): string {
  return createStableRowId("team-member");
}

function createImplantId(): string {
  return createStableRowId("implant");
}

export function createTeamMember(): TeamMember {
  return {
    id: createTeamMemberId(),
    role: "Assistant",
    name: "",
  };
}

export function createImplantRecord(): ImplantRecord {
  return {
    id: createImplantId(),
    component: "",
    manufacturer: "",
    productOrSystem: "",
    size: "",
    lotSerialOrReference: "",
  };
}

export function ensureTeamMemberIds(input: PreloadedProcedureInput): ProcedureInput {
  const seenTeamMemberIds = new Set<string>();
  const additionalTeamMembers = input.additionalTeamMembers.map((member) => {
    const id = member.id && !seenTeamMemberIds.has(member.id) ? member.id : createTeamMemberId();
    seenTeamMemberIds.add(id);
    return id === member.id ? member as TeamMember : { ...member, id };
  });

  if (!("implants" in input)) {
    return { ...input, additionalTeamMembers } as ProcedureInput;
  }

  const seenImplantIds = new Set<string>();
  const implants = input.implants.map((implant) => {
    const id = implant.id && !seenImplantIds.has(implant.id) ? implant.id : createImplantId();
    seenImplantIds.add(id);
    return id === implant.id ? implant as ImplantRecord : { ...implant, id };
  });

  return { ...input, additionalTeamMembers, implants } as OrthopaedicProcedureInput;
}

export function updateTeamMember(
  members: TeamMember[],
  index: number,
  changes: Partial<TeamMember>,
): TeamMember[] {
  return members.map((member, memberIndex) => memberIndex === index ? { ...member, ...changes } : member);
}

export function updateImplantRecord(
  implants: ImplantRecord[],
  id: string,
  changes: Partial<Omit<ImplantRecord, "id">>,
): ImplantRecord[] {
  return implants.map((implant) => implant.id === id ? { ...implant, ...changes } : implant);
}

export function moveImplantRecord(
  implants: ImplantRecord[],
  id: string,
  direction: "up" | "down",
): ImplantRecord[] {
  const sourceIndex = implants.findIndex((implant) => implant.id === id);
  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
  if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= implants.length) return implants;

  const reordered = [...implants];
  [reordered[sourceIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[sourceIndex]];
  return reordered;
}

export const OUTPUT_MODES: ReadonlyArray<{ value: OutputMode; label: string }> = [
  { value: "full", label: "Full operation note" },
  { value: "postOp", label: "Post-operative plan only" },
  { value: "handover", label: "Ward handover summary" },
];
