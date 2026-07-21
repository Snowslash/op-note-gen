export type ProcedureId =
  | "lap-appendicectomy"
  | "lap-cholecystectomy"
  | "diagnostic-laparoscopy"
  | "incision-and-drainage"
  | "open-inguinal-hernia-repair"
  | "open-umbilical-hernia-repair"
  | "emergency-laparotomy"
  | "ankle-orif"
  | "hip-hemiarthroplasty"
  | "dynamic-hip-screw"
  | "cephalomedullary-nail"
  | "distal-radius-orif";

export type OutputMode = "full" | "postOp" | "handover";
export type SurgicalSpecialty = "general-surgery" | "trauma-orthopaedics";
export type CompletionProfile = "general-surgery" | "orthopaedics";

export interface TeamMember {
  id: string;
  role: string;
  name: string;
}

export interface SharedProcedureInput {
  operationDateTime: string;
  surgeon: string;
  assistant: string;
  supervisingConsultant: string;
  anaesthetic: string;
  anaesthetist: string;
  indication: string;
  findings: string;
  bloodLoss: string;
  complications: string;
  antibioticProphylaxis: string;
  dvtProphylaxis: string;
  postOpPlan: string;
  additionalOperativeDetails: string;
  additionalTeamMembers: TeamMember[];
}

export interface CommonProcedureInput extends SharedProcedureInput {
  portsUsed: string;
  specimen: string;
  drainStatus: string;
  drainLocation: string;
  haemostasisConfirmed: string;
  fascialClosurePerformed: string;
  fascialSutureMaterial: string;
  skinClosureMethod: string;
}

export interface ImplantRecord {
  id: string;
  component: string;
  manufacturer: string;
  productOrSystem: string;
  size: string;
  lotSerialOrReference: string;
}

export interface OrthopaedicCommonInput extends SharedProcedureInput {
  caseClassification: string;
  side: string;
  operativeDiagnosis: string;
  positionAndTableSetup: string;
  tourniquetUsed: string;
  tourniquetSite: string;
  tourniquetPressure: string;
  tourniquetDuration: string;
  imageIntensifierUsed: string;
  finalImagingFindings: string;
  additionalProcedurePerformed: string;
  additionalProcedureDetails: string;
  additionalProcedureReason: string;
  specimensOrSamples: string;
  tissueDetails: string;
  implantsUsed: string;
  implants: ImplantRecord[];
  haemostasisDetails: string;
  closureDetails: string;
  dressingAndImmobilisation: string;
  loadingInstructions: string;
  postoperativeMonitoring: string;
  postoperativeImaging: string;
  woundCare: string;
  followUp: string;
  rehabilitationPlan: string;
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

export interface AnkleOrifInput extends OrthopaedicCommonInput {
  procedureId: "ankle-orif";
  ankleFracturePattern: string;
  ankleApproachAndIncision: string;
  ankleReductionMethod: string;
  ankleReductionDetails: string;
  fibularFixationPerformed: string;
  fibularFixationDetails: string;
  medialMalleolusFixationPerformed: string;
  medialMalleolusFixationDetails: string;
  posteriorMalleolusFixationPerformed: string;
  posteriorMalleolusFixationDetails: string;
  syndesmosisAssessed: string;
  syndesmosisAssessmentDetails: string;
  syndesmosisStabilised: string;
  syndesmosisFixationDetails: string;
  ankleIrrigationDetails: string;
}

export interface HipHemiarthroplastyInput extends OrthopaedicCommonInput {
  procedureId: "hip-hemiarthroplasty";
  hemiApproach: string;
  hemiApproachAndIncisionDetails: string;
  hemiCapsuleManagement: string;
  hemiFemoralHeadExcision: string;
  hemiNativeHeadSize: string;
  hemiCanalPreparation: string;
  hemiStemFixation: string;
  hemiCementDetails: string;
  hemiTrialAndReduction: string;
  hemiStabilityAssessment: string;
  hemiLegLengthAndOffset: string;
  hemiCapsuleAndAbductorRepair: string;
}

export interface DynamicHipScrewInput extends OrthopaedicCommonInput {
  procedureId: "dynamic-hip-screw";
  dhsFracturePattern: string;
  dhsReductionMethod: string;
  dhsReductionDetails: string;
  dhsApproachAndIncision: string;
  dhsGuidewireAndLagScrewDetails: string;
  dhsPlateFixationDetails: string;
  dhsCompressionApplied: string;
  dhsIrrigationDetails: string;
}

export interface CephalomedullaryNailInput extends OrthopaedicCommonInput {
  procedureId: "cephalomedullary-nail";
  cmnFracturePattern: string;
  cmnReductionMethod: string;
  cmnReductionDetails: string;
  cmnEntryPointAndIncision: string;
  cmnCanalPreparation: string;
  cmnNailInsertionDetails: string;
  cmnProximalFixationDetails: string;
  cmnDistalLockingPerformed: string;
  cmnDistalLockingDetails: string;
  cmnCompressionApplied: string;
  cmnIrrigationDetails: string;
}

export interface DistalRadiusOrifInput extends OrthopaedicCommonInput {
  procedureId: "distal-radius-orif";
  distalRadiusFracturePattern: string;
  distalRadiusApproach: string;
  distalRadiusApproachAndIncision: string;
  distalRadiusReductionDetails: string;
  distalRadiusFixationDetails: string;
  distalRadiusDrujAssessed: string;
  distalRadiusDrujDetails: string;
  distalRadiusTendonAssessment: string;
  distalRadiusIrrigationDetails: string;
}

export type OrthopaedicProcedureInput =
  | AnkleOrifInput
  | HipHemiarthroplastyInput
  | DynamicHipScrewInput
  | CephalomedullaryNailInput
  | DistalRadiusOrifInput;

export type ProcedureInput =
  | AppendicectomyInput
  | LaparoscopicCholecystectomyInput
  | DiagnosticLaparoscopyInput
  | IncisionAndDrainageInput
  | OpenInguinalHerniaRepairInput
  | OpenUmbilicalHerniaRepairInput
  | EmergencyLaparotomyInput
  | OrthopaedicProcedureInput;

export interface ProcedureDefinition {
  id: ProcedureId;
  label: string;
  specialty: SurgicalSpecialty;
  category: string;
  keywords: readonly string[];
  completionProfile: CompletionProfile;
  supportedOutputModes: readonly OutputMode[];
}

export interface FieldValidationError {
  field: "indication" | "findings" | "side" | "implantsUsed";
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: FieldValidationError[];
}
