export type ProcedureId =
  | "lap-appendicectomy"
  | "lap-cholecystectomy"
  | "diagnostic-laparoscopy"
  | "incision-and-drainage"
  | "open-inguinal-hernia-repair"
  | "open-umbilical-hernia-repair"
  | "emergency-laparotomy";

export type OutputMode = "full" | "postOp" | "handover";

export interface TeamMember {
  id: string;
  role: string;
  name: string;
}

export interface CommonProcedureInput {
  operationDateTime: string;
  surgeon: string;
  assistant: string;
  supervisingConsultant: string;
  anaesthetic: string;
  anaesthetist: string;
  indication: string;
  findings: string;
  portsUsed: string;
  specimen: string;
  bloodLoss: string;
  complications: string;
  antibioticProphylaxis: string;
  dvtProphylaxis: string;
  postOpPlan: string;
  drainStatus: string;
  drainLocation: string;
  haemostasisConfirmed: string;
  fascialClosurePerformed: string;
  fascialSutureMaterial: string;
  skinClosureMethod: string;
  additionalOperativeDetails: string;
  additionalTeamMembers: TeamMember[];
}

export interface AppendicectomyInput extends CommonProcedureInput {
  procedureId: "lap-appendicectomy";
  appendixAppearance: string;
  perforation: string;
  contaminationPresent: string;
  contaminationDescription: string;
  mesoappendixDivision: string;
  stumpControl: string;
  specimenRemovedInBag: string;
  washoutPerformed: string;
  convertedToOpen: boolean;
  conversionReason: string;
  entryTechnique: string;
}

export interface LaparoscopicCholecystectomyInput extends CommonProcedureInput {
  procedureId: "lap-cholecystectomy";
  entryTechnique: string;
  gallbladderAppearance: string;
  criticalViewAchieved: string;
  cysticDuctControl: string;
  cysticArteryControl: string;
  gallbladderRemovedInBag: string;
  bileSpillage: string;
  bileSpillageDetails: string;
  stoneSpillage: string;
  stoneSpillageDetails: string;
  cholangiogramPerformed: string;
  cholangiogramFindings: string;
  convertedToOpen: boolean;
  conversionReason: string;
}

export interface DiagnosticLaparoscopyInput extends CommonProcedureInput {
  procedureId: "diagnostic-laparoscopy";
  entryTechnique: string;
  abdominalSurvey: string;
  procedurePerformed: string;
  washoutFluid: string;
  adhesiolysisDetails: string;
  sourceControl: string;
  convertedToOpen: boolean;
  conversionReason: string;
}

export interface IncisionAndDrainageInput extends CommonProcedureInput {
  procedureId: "incision-and-drainage";
  incisionSite: string;
  incisionType: string;
  abscessContents: string;
  pusSwabSent: string;
  loculationsBrokenDown: string;
  cavityIrrigated: string;
  packingOrDrain: string;
}

export interface OpenInguinalHerniaRepairInput extends CommonProcedureInput {
  procedureId: "open-inguinal-hernia-repair";
  herniaSide: string;
  herniaType: string;
  herniaContents: string;
  sacManagement: string;
  meshUsed: string;
  meshType: string;
  meshFixation: string;
  cordStructuresManaged: string;
  ilioinguinalNerveStatus: string;
}

export interface OpenUmbilicalHerniaRepairInput extends CommonProcedureInput {
  procedureId: "open-umbilical-hernia-repair";
  umbilicalHerniaDefectSize: string;
  umbilicalHerniaContents: string;
  umbilicalSacManagement: string;
  umbilicalRepairMethod: string;
  umbilicalMeshUsed: string;
  umbilicalMeshType: string;
  umbilicalMeshPosition: string;
  umbilicalMeshFixation: string;
}

export interface EmergencyLaparotomyInput extends CommonProcedureInput {
  procedureId: "emergency-laparotomy";
  laparotomyIncision: string;
  laparotomyPathology: string;
  laparotomyProcedurePerformed: string;
  laparotomyBowelResectionPerformed: string;
  laparotomyBowelResectionDetails: string;
  laparotomyAnastomosisPerformed: string;
  laparotomyAnastomosisDetails: string;
  laparotomyStomaFormed: string;
  laparotomyStomaDetails: string;
  laparotomyWashoutPerformed: string;
  laparotomyWashoutDetails: string;
  laparotomyTemporaryClosure: string;
  laparotomyTemporaryClosureDetails: string;
}

export type ProcedureInput =
  | AppendicectomyInput
  | LaparoscopicCholecystectomyInput
  | DiagnosticLaparoscopyInput
  | IncisionAndDrainageInput
  | OpenInguinalHerniaRepairInput
  | OpenUmbilicalHerniaRepairInput
  | EmergencyLaparotomyInput;

export interface ProcedureDefinition {
  id: ProcedureId;
  label: string;
  supportedOutputModes: readonly OutputMode[];
}

export interface FieldValidationError {
  field: "indication" | "findings";
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: FieldValidationError[];
}
