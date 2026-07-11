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
};
