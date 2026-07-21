import type { ProcedureId } from "../domain";

export interface VisibilityCondition {
  field: string;
  equals: string | boolean;
}

export interface ClearRule {
  unless: string | boolean;
  fields: string[];
}

interface BaseFieldDefinition {
  field: string;
  label: string;
  wide?: boolean;
  showWhen?: VisibilityCondition;
}

export interface TextFieldDefinition extends BaseFieldDefinition {
  kind: "text" | "textarea";
}

export interface SelectFieldDefinition extends BaseFieldDefinition {
  kind: "select" | "radio";
  options: readonly string[];
  clearRule?: ClearRule;
}

export interface SelectCustomFieldDefinition extends BaseFieldDefinition {
  kind: "select-custom";
  options: readonly string[];
  customLabel: string;
}

export interface CheckboxFieldDefinition extends BaseFieldDefinition {
  kind: "checkbox";
  clearRule?: ClearRule;
}

export type ProcedureFieldDefinition =
  | TextFieldDefinition
  | SelectFieldDefinition
  | SelectCustomFieldDefinition
  | CheckboxFieldDefinition;

export interface ProcedureFormDefinition {
  hint: string;
  fields: readonly ProcedureFieldDefinition[];
}

const YES_NO = ["yes", "no"] as const;
const YES_NO_NOT_APPLICABLE = ["yes", "no", "not applicable"] as const;
const ENTRY_TECHNIQUES = ["Hasson", "Veress", "Optical entry"] as const;

export const PROCEDURE_FORM_DEFINITIONS: Record<ProcedureId, ProcedureFormDefinition> = {
  "lap-appendicectomy": {
    hint: "Appendicectomy-specific operative fields. Unanswered structured fields remain not specified in the draft.",
    fields: [
      { kind: "select-custom", field: "entryTechnique", label: "Laparoscopic entry technique", options: ENTRY_TECHNIQUES, customLabel: "Custom entry technique" },
      { kind: "textarea", field: "portsUsed", label: "Ports used / port configuration", wide: true },
      { kind: "textarea", field: "appendixAppearance", label: "Appendix appearance / operative findings", wide: true },
      { kind: "radio", field: "perforation", label: "Perforation", options: YES_NO },
      { kind: "radio", field: "contaminationPresent", label: "Contamination present", options: YES_NO },
      { kind: "textarea", field: "contaminationDescription", label: "Contamination description", wide: true, showWhen: { field: "contaminationPresent", equals: "yes" } },
      { kind: "select-custom", field: "mesoappendixDivision", label: "Mesoappendix division method", options: ["Electrocautery", "LigaSure", "Harmonic", "Clips and division", "Stapler"], customLabel: "Custom mesoappendix division method" },
      { kind: "select-custom", field: "stumpControl", label: "Stump control method", options: ["Endoloops", "Stapler", "Clips", "Suture ligature"], customLabel: "Custom stump control method" },
      { kind: "radio", field: "specimenRemovedInBag", label: "Specimen removed in bag", options: YES_NO },
      { kind: "radio", field: "washoutPerformed", label: "Washout performed", options: YES_NO },
      { kind: "checkbox", field: "convertedToOpen", label: "Converted to open", clearRule: { unless: true, fields: ["conversionReason"] } },
      { kind: "textarea", field: "conversionReason", label: "Reason for conversion", wide: true, showWhen: { field: "convertedToOpen", equals: true } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "lap-cholecystectomy": {
    hint: "Cholecystectomy-specific steps include critical view, cystic duct and artery control, spillage, cholangiogram, and gallbladder retrieval.",
    fields: [
      { kind: "select-custom", field: "entryTechnique", label: "Laparoscopic entry technique", options: ENTRY_TECHNIQUES, customLabel: "Custom entry technique" },
      { kind: "textarea", field: "portsUsed", label: "Ports used / port configuration", wide: true },
      { kind: "textarea", field: "gallbladderAppearance", label: "Gallbladder appearance / operative findings", wide: true },
      { kind: "radio", field: "criticalViewAchieved", label: "Critical view achieved", options: YES_NO },
      { kind: "select-custom", field: "cysticDuctControl", label: "Cystic duct control", options: ["Clips", "Endoloop", "Stapler", "Suture ligature"], customLabel: "Custom cystic duct control" },
      { kind: "select-custom", field: "cysticArteryControl", label: "Cystic artery control", options: ["Clips", "Diathermy", "LigaSure", "Suture ligature"], customLabel: "Custom cystic artery control" },
      { kind: "radio", field: "gallbladderRemovedInBag", label: "Gallbladder removed in bag", options: YES_NO },
      { kind: "radio", field: "bileSpillage", label: "Bile spillage", options: YES_NO },
      { kind: "textarea", field: "bileSpillageDetails", label: "Bile spillage details", wide: true, showWhen: { field: "bileSpillage", equals: "yes" } },
      { kind: "radio", field: "stoneSpillage", label: "Stone spillage", options: YES_NO },
      { kind: "textarea", field: "stoneSpillageDetails", label: "Stone spillage details", wide: true, showWhen: { field: "stoneSpillage", equals: "yes" } },
      { kind: "radio", field: "cholangiogramPerformed", label: "Intraoperative cholangiogram performed", options: YES_NO },
      { kind: "textarea", field: "cholangiogramFindings", label: "Cholangiogram findings", wide: true, showWhen: { field: "cholangiogramPerformed", equals: "yes" } },
      { kind: "checkbox", field: "convertedToOpen", label: "Converted to open", clearRule: { unless: true, fields: ["conversionReason"] } },
      { kind: "textarea", field: "conversionReason", label: "Reason for conversion", wide: true, showWhen: { field: "convertedToOpen", equals: true } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "diagnostic-laparoscopy": {
    hint: "Diagnostic laparoscopy-specific steps include access, abdominal survey, procedures performed, washout, adhesiolysis, source control, and conversion status.",
    fields: [
      { kind: "select-custom", field: "entryTechnique", label: "Laparoscopic entry technique", options: ENTRY_TECHNIQUES, customLabel: "Custom entry technique" },
      { kind: "textarea", field: "portsUsed", label: "Ports used / port configuration", wide: true },
      { kind: "textarea", field: "abdominalSurvey", label: "Abdominal survey", wide: true },
      { kind: "text", field: "procedurePerformed", label: "Procedure performed" },
      { kind: "text", field: "washoutFluid", label: "Washout fluid" },
      { kind: "textarea", field: "adhesiolysisDetails", label: "Adhesiolysis details", wide: true },
      { kind: "textarea", field: "sourceControl", label: "Source control", wide: true },
      { kind: "checkbox", field: "convertedToOpen", label: "Converted to open", clearRule: { unless: true, fields: ["conversionReason"] } },
      { kind: "textarea", field: "conversionReason", label: "Reason for conversion", wide: true, showWhen: { field: "convertedToOpen", equals: true } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "incision-and-drainage": {
    hint: "Incision and drainage-specific steps include abscess site, incision, contents drained, microbiology, loculations, washout, and packing or drain.",
    fields: [
      { kind: "text", field: "incisionSite", label: "Abscess / incision site" },
      { kind: "select-custom", field: "incisionType", label: "Incision type", options: ["Linear incision", "Cruciate incision", "Elliptical incision", "Wound opened along previous scar"], customLabel: "Custom incision type" },
      { kind: "select-custom", field: "abscessContents", label: "Abscess contents", options: ["Pus", "Seropurulent fluid", "Haematoma", "Necrotic material", "No pus encountered"], customLabel: "Custom abscess contents" },
      { kind: "select", field: "pusSwabSent", label: "Microbiology swab sent", options: YES_NO },
      { kind: "select", field: "loculationsBrokenDown", label: "Loculations broken down", options: ["yes", "no", "not applicable"] },
      { kind: "select", field: "cavityIrrigated", label: "Cavity irrigated", options: YES_NO },
      { kind: "text", field: "packingOrDrain", label: "Packing or drain details" },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "open-inguinal-hernia-repair": {
    hint: "Open inguinal hernia repair-specific steps include side, hernia type, sac management, mesh, cord structures, and ilioinguinal nerve status.",
    fields: [
      { kind: "select", field: "herniaSide", label: "Hernia side", options: ["Right", "Left", "Bilateral"] },
      { kind: "select-custom", field: "herniaType", label: "Hernia type", options: ["Indirect inguinal hernia", "Direct inguinal hernia", "Pantaloon inguinal hernia", "Femoral hernia", "Recurrent inguinal hernia"], customLabel: "Custom hernia type" },
      { kind: "text", field: "herniaContents", label: "Hernia contents" },
      { kind: "textarea", field: "sacManagement", label: "Sac management", wide: true },
      { kind: "select", field: "meshUsed", label: "Mesh used", options: YES_NO, clearRule: { unless: "yes", fields: ["meshType", "meshFixation"] } },
      { kind: "text", field: "meshType", label: "Mesh type", showWhen: { field: "meshUsed", equals: "yes" } },
      { kind: "textarea", field: "meshFixation", label: "Mesh fixation", wide: true, showWhen: { field: "meshUsed", equals: "yes" } },
      { kind: "text", field: "cordStructuresManaged", label: "Cord structures managed" },
      { kind: "select-custom", field: "ilioinguinalNerveStatus", label: "Ilioinguinal nerve status", options: ["Identified and preserved", "Identified and divided", "Not identified"], customLabel: "Custom ilioinguinal nerve status" },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "open-umbilical-hernia-repair": {
    hint: "Open umbilical hernia repair-specific steps include defect size, contents, sac management, repair method, and mesh details.",
    fields: [
      { kind: "text", field: "umbilicalHerniaDefectSize", label: "Hernia defect size" },
      { kind: "text", field: "umbilicalHerniaContents", label: "Hernia contents" },
      { kind: "textarea", field: "umbilicalSacManagement", label: "Sac management", wide: true },
      { kind: "select-custom", field: "umbilicalRepairMethod", label: "Repair method", options: ["Primary suture repair", "Mesh repair", "Mayo repair"], customLabel: "Custom repair method" },
      { kind: "select", field: "umbilicalMeshUsed", label: "Mesh used", options: YES_NO, clearRule: { unless: "yes", fields: ["umbilicalMeshType", "umbilicalMeshFixation"] } },
      { kind: "text", field: "umbilicalMeshType", label: "Mesh type", showWhen: { field: "umbilicalMeshUsed", equals: "yes" } },
      { kind: "select-custom", field: "umbilicalMeshPosition", label: "Mesh position", options: ["Onlay", "Sublay / retromuscular", "Preperitoneal", "Intraperitoneal onlay mesh"], customLabel: "Custom mesh position", showWhen: { field: "umbilicalMeshUsed", equals: "yes" } },
      { kind: "textarea", field: "umbilicalMeshFixation", label: "Mesh fixation", wide: true, showWhen: { field: "umbilicalMeshUsed", equals: "yes" } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "emergency-laparotomy": {
    hint: "Emergency laparotomy-specific steps include incision, pathology, procedure, bowel resection, anastomosis, stoma, washout, and temporary closure.",
    fields: [
      { kind: "text", field: "laparotomyIncision", label: "Laparotomy incision" },
      { kind: "text", field: "laparotomyPathology", label: "Pathology / source" },
      { kind: "textarea", field: "laparotomyProcedurePerformed", label: "Procedure performed", wide: true },
      { kind: "select", field: "laparotomyBowelResectionPerformed", label: "Bowel resection performed", options: YES_NO, clearRule: { unless: "yes", fields: ["laparotomyBowelResectionDetails"] } },
      { kind: "textarea", field: "laparotomyBowelResectionDetails", label: "Bowel resection details", wide: true, showWhen: { field: "laparotomyBowelResectionPerformed", equals: "yes" } },
      { kind: "select", field: "laparotomyAnastomosisPerformed", label: "Anastomosis performed", options: YES_NO, clearRule: { unless: "yes", fields: ["laparotomyAnastomosisDetails"] } },
      { kind: "textarea", field: "laparotomyAnastomosisDetails", label: "Anastomosis details", wide: true, showWhen: { field: "laparotomyAnastomosisPerformed", equals: "yes" } },
      { kind: "select", field: "laparotomyStomaFormed", label: "Stoma formed", options: YES_NO, clearRule: { unless: "yes", fields: ["laparotomyStomaDetails"] } },
      { kind: "textarea", field: "laparotomyStomaDetails", label: "Stoma details", wide: true, showWhen: { field: "laparotomyStomaFormed", equals: "yes" } },
      { kind: "select", field: "laparotomyWashoutPerformed", label: "Washout performed", options: YES_NO, clearRule: { unless: "yes", fields: ["laparotomyWashoutDetails"] } },
      { kind: "textarea", field: "laparotomyWashoutDetails", label: "Washout details", wide: true, showWhen: { field: "laparotomyWashoutPerformed", equals: "yes" } },
      { kind: "select", field: "laparotomyTemporaryClosure", label: "Temporary abdominal closure", options: YES_NO, clearRule: { unless: "yes", fields: ["laparotomyTemporaryClosureDetails"] } },
      { kind: "textarea", field: "laparotomyTemporaryClosureDetails", label: "Temporary closure details", wide: true, showWhen: { field: "laparotomyTemporaryClosure", equals: "yes" } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "ankle-orif": {
    hint: "Record the fracture pattern, reduction, malleolar fixation, syndesmosis assessment, imaging and postoperative restrictions. Blank fields remain not specified.",
    fields: [
      { kind: "select-custom", field: "positionAndTableSetup", label: "Position / table set-up", options: ["Supine", "Lateral decubitus", "Supine on traction table"], customLabel: "Custom position / table set-up" },
      { kind: "radio", field: "tourniquetUsed", label: "Tourniquet used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["tourniquetSite", "tourniquetPressure", "tourniquetDuration"] } },
      { kind: "text", field: "tourniquetSite", label: "Tourniquet site", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetPressure", label: "Tourniquet pressure", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetDuration", label: "Tourniquet duration", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "textarea", field: "ankleFracturePattern", label: "Fracture pattern", wide: true },
      { kind: "textarea", field: "ankleApproachAndIncision", label: "Approach / incision", wide: true },
      { kind: "select-custom", field: "ankleReductionMethod", label: "Reduction method", options: ["Closed reduction", "Open reduction", "Combined closed and open reduction"], customLabel: "Custom reduction method" },
      { kind: "textarea", field: "ankleReductionDetails", label: "Reduction details", wide: true },
      { kind: "radio", field: "fibularFixationPerformed", label: "Fibular fixation performed", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["fibularFixationDetails"] } },
      { kind: "textarea", field: "fibularFixationDetails", label: "Fibular fixation details", wide: true, showWhen: { field: "fibularFixationPerformed", equals: "yes" } },
      { kind: "radio", field: "medialMalleolusFixationPerformed", label: "Medial malleolus fixation performed", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["medialMalleolusFixationDetails"] } },
      { kind: "textarea", field: "medialMalleolusFixationDetails", label: "Medial malleolus fixation details", wide: true, showWhen: { field: "medialMalleolusFixationPerformed", equals: "yes" } },
      { kind: "radio", field: "posteriorMalleolusFixationPerformed", label: "Posterior malleolus fixation performed", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["posteriorMalleolusFixationDetails"] } },
      { kind: "textarea", field: "posteriorMalleolusFixationDetails", label: "Posterior malleolus fixation details", wide: true, showWhen: { field: "posteriorMalleolusFixationPerformed", equals: "yes" } },
      { kind: "radio", field: "syndesmosisAssessed", label: "Syndesmosis assessed", options: YES_NO, clearRule: { unless: "yes", fields: ["syndesmosisAssessmentDetails", "syndesmosisStabilised", "syndesmosisFixationDetails"] } },
      { kind: "textarea", field: "syndesmosisAssessmentDetails", label: "Syndesmosis assessment method and findings", wide: true, showWhen: { field: "syndesmosisAssessed", equals: "yes" } },
      { kind: "radio", field: "syndesmosisStabilised", label: "Syndesmosis stabilised", options: YES_NO, showWhen: { field: "syndesmosisAssessed", equals: "yes" }, clearRule: { unless: "yes", fields: ["syndesmosisFixationDetails"] } },
      { kind: "textarea", field: "syndesmosisFixationDetails", label: "Syndesmosis fixation details", wide: true, showWhen: { field: "syndesmosisStabilised", equals: "yes" } },
      { kind: "textarea", field: "ankleIrrigationDetails", label: "Irrigation details", wide: true },
      { kind: "radio", field: "imageIntensifierUsed", label: "Image intensifier used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["finalImagingFindings"] } },
      { kind: "textarea", field: "finalImagingFindings", label: "Final intraoperative imaging findings", wide: true, showWhen: { field: "imageIntensifierUsed", equals: "yes" } },
      { kind: "radio", field: "additionalProcedurePerformed", label: "Additional procedure performed", options: YES_NO, clearRule: { unless: "yes", fields: ["additionalProcedureDetails", "additionalProcedureReason"] } },
      { kind: "textarea", field: "additionalProcedureDetails", label: "Additional procedure details", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "textarea", field: "additionalProcedureReason", label: "Reason for additional procedure", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "radio", field: "implantsUsed", label: "Implants used", options: YES_NO, clearRule: { unless: "yes", fields: ["implants"] } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "hip-hemiarthroplasty": {
    hint: "Record the approach, femoral-head excision, canal preparation, fixation, implants, reduction, stability and postoperative plan. No implant or weight-bearing detail is assumed.",
    fields: [
      { kind: "select-custom", field: "positionAndTableSetup", label: "Position / table set-up", options: ["Supine", "Lateral decubitus", "Supine on traction table"], customLabel: "Custom position / table set-up" },
      { kind: "radio", field: "tourniquetUsed", label: "Tourniquet used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["tourniquetSite", "tourniquetPressure", "tourniquetDuration"] } },
      { kind: "text", field: "tourniquetSite", label: "Tourniquet site", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetPressure", label: "Tourniquet pressure", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetDuration", label: "Tourniquet duration", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "select-custom", field: "hemiApproach", label: "Surgical approach", options: ["Anterolateral", "Direct lateral", "Posterior"], customLabel: "Custom surgical approach" },
      { kind: "textarea", field: "hemiApproachAndIncisionDetails", label: "Approach / incision details", wide: true },
      { kind: "textarea", field: "hemiCapsuleManagement", label: "Capsule management", wide: true },
      { kind: "textarea", field: "hemiFemoralHeadExcision", label: "Femoral head excision details", wide: true },
      { kind: "text", field: "hemiNativeHeadSize", label: "Native femoral head size" },
      { kind: "textarea", field: "hemiCanalPreparation", label: "Femoral canal preparation", wide: true },
      { kind: "radio", field: "hemiStemFixation", label: "Stem fixation", options: ["Cemented", "Uncemented"], clearRule: { unless: "Cemented", fields: ["hemiCementDetails"] } },
      { kind: "textarea", field: "hemiCementDetails", label: "Cement and cementing details", wide: true, showWhen: { field: "hemiStemFixation", equals: "Cemented" } },
      { kind: "textarea", field: "hemiTrialAndReduction", label: "Trial and reduction details", wide: true },
      { kind: "textarea", field: "hemiStabilityAssessment", label: "Stability assessment", wide: true },
      { kind: "textarea", field: "hemiLegLengthAndOffset", label: "Leg length / offset assessment", wide: true },
      { kind: "textarea", field: "hemiCapsuleAndAbductorRepair", label: "Capsule / abductor repair", wide: true },
      { kind: "radio", field: "imageIntensifierUsed", label: "Image intensifier used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["finalImagingFindings"] } },
      { kind: "textarea", field: "finalImagingFindings", label: "Final intraoperative imaging findings", wide: true, showWhen: { field: "imageIntensifierUsed", equals: "yes" } },
      { kind: "radio", field: "additionalProcedurePerformed", label: "Additional procedure performed", options: YES_NO, clearRule: { unless: "yes", fields: ["additionalProcedureDetails", "additionalProcedureReason"] } },
      { kind: "textarea", field: "additionalProcedureDetails", label: "Additional procedure details", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "textarea", field: "additionalProcedureReason", label: "Reason for additional procedure", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "radio", field: "implantsUsed", label: "Implants used", options: YES_NO, clearRule: { unless: "yes", fields: ["implants"] } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "dynamic-hip-screw": {
    hint: "Record fracture reduction, approach, lag-screw and plate fixation, imaging, implants and the postoperative plan. Blank fields remain not specified.",
    fields: [
      { kind: "select-custom", field: "positionAndTableSetup", label: "Position / table set-up", options: ["Supine", "Lateral decubitus", "Supine on traction table"], customLabel: "Custom position / table set-up" },
      { kind: "radio", field: "tourniquetUsed", label: "Tourniquet used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["tourniquetSite", "tourniquetPressure", "tourniquetDuration"] } },
      { kind: "text", field: "tourniquetSite", label: "Tourniquet site", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetPressure", label: "Tourniquet pressure", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetDuration", label: "Tourniquet duration", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "textarea", field: "dhsFracturePattern", label: "Fracture pattern", wide: true },
      { kind: "select-custom", field: "dhsReductionMethod", label: "Reduction method", options: ["Closed reduction", "Open reduction", "Combined closed and open reduction"], customLabel: "Custom reduction method" },
      { kind: "textarea", field: "dhsReductionDetails", label: "Reduction details", wide: true },
      { kind: "textarea", field: "dhsApproachAndIncision", label: "Approach / incision", wide: true },
      { kind: "textarea", field: "dhsGuidewireAndLagScrewDetails", label: "Guidewire and lag-screw placement", wide: true },
      { kind: "textarea", field: "dhsPlateFixationDetails", label: "Side-plate and screw fixation", wide: true },
      { kind: "radio", field: "dhsCompressionApplied", label: "Compression applied", options: YES_NO_NOT_APPLICABLE },
      { kind: "textarea", field: "dhsIrrigationDetails", label: "Irrigation details", wide: true },
      { kind: "radio", field: "imageIntensifierUsed", label: "Image intensifier used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["finalImagingFindings"] } },
      { kind: "textarea", field: "finalImagingFindings", label: "Final intraoperative imaging findings", wide: true, showWhen: { field: "imageIntensifierUsed", equals: "yes" } },
      { kind: "radio", field: "additionalProcedurePerformed", label: "Additional procedure performed", options: YES_NO, clearRule: { unless: "yes", fields: ["additionalProcedureDetails", "additionalProcedureReason"] } },
      { kind: "textarea", field: "additionalProcedureDetails", label: "Additional procedure details", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "textarea", field: "additionalProcedureReason", label: "Reason for additional procedure", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "radio", field: "implantsUsed", label: "Implants used", options: YES_NO, clearRule: { unless: "yes", fields: ["implants"] } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "cephalomedullary-nail": {
    hint: "Record reduction, entry point, canal preparation, nail and locking details, imaging, implants and postoperative restrictions. Blank fields remain not specified.",
    fields: [
      { kind: "select-custom", field: "positionAndTableSetup", label: "Position / table set-up", options: ["Supine", "Lateral decubitus", "Supine on traction table"], customLabel: "Custom position / table set-up" },
      { kind: "radio", field: "tourniquetUsed", label: "Tourniquet used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["tourniquetSite", "tourniquetPressure", "tourniquetDuration"] } },
      { kind: "text", field: "tourniquetSite", label: "Tourniquet site", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetPressure", label: "Tourniquet pressure", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetDuration", label: "Tourniquet duration", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "textarea", field: "cmnFracturePattern", label: "Fracture pattern", wide: true },
      { kind: "select-custom", field: "cmnReductionMethod", label: "Reduction method", options: ["Closed reduction", "Open reduction", "Combined closed and open reduction"], customLabel: "Custom reduction method" },
      { kind: "textarea", field: "cmnReductionDetails", label: "Reduction details", wide: true },
      { kind: "textarea", field: "cmnEntryPointAndIncision", label: "Entry point / approach / incision", wide: true },
      { kind: "textarea", field: "cmnCanalPreparation", label: "Canal preparation", wide: true },
      { kind: "textarea", field: "cmnNailInsertionDetails", label: "Nail insertion details", wide: true },
      { kind: "textarea", field: "cmnProximalFixationDetails", label: "Proximal fixation details", wide: true },
      { kind: "radio", field: "cmnDistalLockingPerformed", label: "Distal locking performed", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["cmnDistalLockingDetails"] } },
      { kind: "textarea", field: "cmnDistalLockingDetails", label: "Distal locking details", wide: true, showWhen: { field: "cmnDistalLockingPerformed", equals: "yes" } },
      { kind: "radio", field: "cmnCompressionApplied", label: "Compression applied", options: YES_NO_NOT_APPLICABLE },
      { kind: "textarea", field: "cmnIrrigationDetails", label: "Irrigation details", wide: true },
      { kind: "radio", field: "imageIntensifierUsed", label: "Image intensifier used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["finalImagingFindings"] } },
      { kind: "textarea", field: "finalImagingFindings", label: "Final intraoperative imaging findings", wide: true, showWhen: { field: "imageIntensifierUsed", equals: "yes" } },
      { kind: "radio", field: "additionalProcedurePerformed", label: "Additional procedure performed", options: YES_NO, clearRule: { unless: "yes", fields: ["additionalProcedureDetails", "additionalProcedureReason"] } },
      { kind: "textarea", field: "additionalProcedureDetails", label: "Additional procedure details", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "textarea", field: "additionalProcedureReason", label: "Reason for additional procedure", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "radio", field: "implantsUsed", label: "Implants used", options: YES_NO, clearRule: { unless: "yes", fields: ["implants"] } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
  "distal-radius-orif": {
    hint: "Record the fracture, approach, reduction, fixation, DRUJ and tendon assessments, imaging, implants and postoperative restrictions. Blank fields remain not specified.",
    fields: [
      { kind: "select-custom", field: "positionAndTableSetup", label: "Position / table set-up", options: ["Supine", "Lateral decubitus", "Supine on traction table"], customLabel: "Custom position / table set-up" },
      { kind: "radio", field: "tourniquetUsed", label: "Tourniquet used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["tourniquetSite", "tourniquetPressure", "tourniquetDuration"] } },
      { kind: "text", field: "tourniquetSite", label: "Tourniquet site", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetPressure", label: "Tourniquet pressure", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "text", field: "tourniquetDuration", label: "Tourniquet duration", showWhen: { field: "tourniquetUsed", equals: "yes" } },
      { kind: "textarea", field: "distalRadiusFracturePattern", label: "Fracture pattern", wide: true },
      { kind: "select-custom", field: "distalRadiusApproach", label: "Surgical approach", options: ["Volar", "Dorsal", "Combined volar and dorsal"], customLabel: "Custom surgical approach" },
      { kind: "textarea", field: "distalRadiusApproachAndIncision", label: "Approach / incision details", wide: true },
      { kind: "textarea", field: "distalRadiusReductionDetails", label: "Reduction details", wide: true },
      { kind: "textarea", field: "distalRadiusFixationDetails", label: "Plate and screw fixation details", wide: true },
      { kind: "radio", field: "distalRadiusDrujAssessed", label: "Distal radioulnar joint assessed", options: YES_NO, clearRule: { unless: "yes", fields: ["distalRadiusDrujDetails"] } },
      { kind: "textarea", field: "distalRadiusDrujDetails", label: "Distal radioulnar joint assessment findings", wide: true, showWhen: { field: "distalRadiusDrujAssessed", equals: "yes" } },
      { kind: "textarea", field: "distalRadiusTendonAssessment", label: "Tendon assessment", wide: true },
      { kind: "textarea", field: "distalRadiusIrrigationDetails", label: "Irrigation details", wide: true },
      { kind: "radio", field: "imageIntensifierUsed", label: "Image intensifier used", options: YES_NO_NOT_APPLICABLE, clearRule: { unless: "yes", fields: ["finalImagingFindings"] } },
      { kind: "textarea", field: "finalImagingFindings", label: "Final intraoperative imaging findings", wide: true, showWhen: { field: "imageIntensifierUsed", equals: "yes" } },
      { kind: "radio", field: "additionalProcedurePerformed", label: "Additional procedure performed", options: YES_NO, clearRule: { unless: "yes", fields: ["additionalProcedureDetails", "additionalProcedureReason"] } },
      { kind: "textarea", field: "additionalProcedureDetails", label: "Additional procedure details", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "textarea", field: "additionalProcedureReason", label: "Reason for additional procedure", wide: true, showWhen: { field: "additionalProcedurePerformed", equals: "yes" } },
      { kind: "radio", field: "implantsUsed", label: "Implants used", options: YES_NO, clearRule: { unless: "yes", fields: ["implants"] } },
      { kind: "textarea", field: "additionalOperativeDetails", label: "Additional operative details", wide: true },
    ],
  },
};
