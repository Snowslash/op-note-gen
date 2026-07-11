import type {
  AppendicectomyInput,
  CommonProcedureInput,
  DiagnosticLaparoscopyInput,
  EmergencyLaparotomyInput,
  IncisionAndDrainageInput,
  LaparoscopicCholecystectomyInput,
  OpenInguinalHerniaRepairInput,
  OpenUmbilicalHerniaRepairInput,
  ProcedureInput,
  TeamMember,
} from "../../src/domain/types";

export interface LegacyFixtureInput {
  values?: Record<string, string>;
  radios?: Record<string, string>;
  checks?: Record<string, boolean>;
  teamMembers?: TeamMember[];
}

const LEGACY_PROCEDURE_IDS = {
  lapAppendicectomy: "lap-appendicectomy",
  lapCholecystectomy: "lap-cholecystectomy",
  diagnosticLaparoscopy: "diagnostic-laparoscopy",
  incisionAndDrainage: "incision-and-drainage",
  openInguinalHerniaRepair: "open-inguinal-hernia-repair",
  openUmbilicalHerniaRepair: "open-umbilical-hernia-repair",
  emergencyLaparotomy: "emergency-laparotomy",
} as const;

function value(input: LegacyFixtureInput, field: string): string {
  return input.values?.[field] ?? input.radios?.[field] ?? "";
}

function selectOrCustom(input: LegacyFixtureInput, field: string): string {
  const selected = value(input, field);

  return selected === "Custom / other" ? value(input, `${field}Custom`) : selected;
}

function common(input: LegacyFixtureInput): CommonProcedureInput {
  return {
    operationDateTime: value(input, "operationDateTime"),
    surgeon: value(input, "surgeon"),
    assistant: value(input, "assistant"),
    supervisingConsultant: value(input, "supervisingConsultant"),
    anaesthetic: value(input, "anaesthetic"),
    anaesthetist: value(input, "anaesthetist"),
    indication: value(input, "indication"),
    findings: value(input, "findings"),
    portsUsed: value(input, "portsUsed"),
    specimen: value(input, "specimen"),
    bloodLoss: value(input, "bloodLoss"),
    complications: value(input, "complications"),
    antibioticProphylaxis: value(input, "antibioticProphylaxis"),
    dvtProphylaxis: value(input, "dvtProphylaxis"),
    postOpPlan: value(input, "postOpPlan"),
    drainStatus: value(input, "drainStatus"),
    drainLocation: selectOrCustom(input, "drainLocation"),
    haemostasisConfirmed: value(input, "haemostasisConfirmed"),
    fascialClosurePerformed: value(input, "fascialClosurePerformed"),
    fascialSutureMaterial: value(input, "fascialSutureMaterial"),
    skinClosureMethod: value(input, "skinClosureMethod"),
    additionalOperativeDetails: value(input, "additionalOperativeDetails"),
    additionalTeamMembers: input.teamMembers ?? [],
  };
}

export function adaptLegacyFixtureInput(input: LegacyFixtureInput): ProcedureInput {
  const procedureId = input.values?.procedureSelect;
  const shared = common(input);

  switch (procedureId) {
    case "lapAppendicectomy":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.lapAppendicectomy,
        appendixAppearance: value(input, "appendixAppearance"),
        perforation: value(input, "perforation"),
        contaminationPresent: value(input, "contaminationPresent"),
        contaminationDescription: value(input, "contaminationDescription"),
        mesoappendixDivision: selectOrCustom(input, "mesoappendixDivision"),
        stumpControl: selectOrCustom(input, "stumpControl"),
        specimenRemovedInBag: value(input, "specimenRemovedInBag"),
        washoutPerformed: value(input, "washoutPerformed"),
        convertedToOpen: Boolean(input.checks?.convertedToOpen),
        conversionReason: value(input, "conversionReason"),
        entryTechnique: selectOrCustom(input, "entryTechnique"),
      } satisfies AppendicectomyInput;
    case "lapCholecystectomy":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.lapCholecystectomy,
        entryTechnique: selectOrCustom(input, "entryTechnique"),
        gallbladderAppearance: value(input, "gallbladderAppearance"),
        criticalViewAchieved: value(input, "criticalViewAchieved"),
        cysticDuctControl: selectOrCustom(input, "cysticDuctControl"),
        cysticArteryControl: selectOrCustom(input, "cysticArteryControl"),
        gallbladderRemovedInBag: value(input, "gallbladderRemovedInBag"),
        bileSpillage: value(input, "bileSpillage"),
        bileSpillageDetails: value(input, "bileSpillageDetails"),
        stoneSpillage: value(input, "stoneSpillage"),
        stoneSpillageDetails: value(input, "stoneSpillageDetails"),
        cholangiogramPerformed: value(input, "cholangiogramPerformed"),
        cholangiogramFindings: value(input, "cholangiogramFindings"),
        convertedToOpen: Boolean(input.checks?.convertedToOpen),
        conversionReason: value(input, "conversionReason"),
      } satisfies LaparoscopicCholecystectomyInput;
    case "diagnosticLaparoscopy":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.diagnosticLaparoscopy,
        entryTechnique: selectOrCustom(input, "entryTechnique"),
        abdominalSurvey: value(input, "abdominalSurvey"),
        procedurePerformed: value(input, "procedurePerformed"),
        washoutFluid: value(input, "washoutFluid"),
        adhesiolysisDetails: value(input, "adhesiolysisDetails"),
        sourceControl: value(input, "sourceControl"),
        convertedToOpen: Boolean(input.checks?.convertedToOpen),
        conversionReason: value(input, "conversionReason"),
      } satisfies DiagnosticLaparoscopyInput;
    case "incisionAndDrainage":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.incisionAndDrainage,
        incisionSite: value(input, "incisionSite"),
        incisionType: selectOrCustom(input, "incisionType"),
        abscessContents: selectOrCustom(input, "abscessContents"),
        pusSwabSent: value(input, "pusSwabSent"),
        loculationsBrokenDown: value(input, "loculationsBrokenDown"),
        cavityIrrigated: value(input, "cavityIrrigated"),
        packingOrDrain: value(input, "packingOrDrain"),
      } satisfies IncisionAndDrainageInput;
    case "openInguinalHerniaRepair":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.openInguinalHerniaRepair,
        herniaSide: value(input, "herniaSide"),
        herniaType: selectOrCustom(input, "herniaType"),
        herniaContents: value(input, "herniaContents"),
        sacManagement: value(input, "sacManagement"),
        meshUsed: value(input, "meshUsed"),
        meshType: value(input, "meshType"),
        meshFixation: value(input, "meshFixation"),
        cordStructuresManaged: value(input, "cordStructuresManaged"),
        ilioinguinalNerveStatus: selectOrCustom(input, "ilioinguinalNerveStatus"),
      } satisfies OpenInguinalHerniaRepairInput;
    case "openUmbilicalHerniaRepair":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.openUmbilicalHerniaRepair,
        umbilicalHerniaDefectSize: value(input, "umbilicalHerniaDefectSize"),
        umbilicalHerniaContents: value(input, "umbilicalHerniaContents"),
        umbilicalSacManagement: value(input, "umbilicalSacManagement"),
        umbilicalRepairMethod: selectOrCustom(input, "umbilicalRepairMethod"),
        umbilicalMeshUsed: value(input, "umbilicalMeshUsed"),
        umbilicalMeshType: value(input, "umbilicalMeshType"),
        umbilicalMeshPosition: selectOrCustom(input, "umbilicalMeshPosition"),
        umbilicalMeshFixation: value(input, "umbilicalMeshFixation"),
      } satisfies OpenUmbilicalHerniaRepairInput;
    case "emergencyLaparotomy":
      return {
        ...shared,
        procedureId: LEGACY_PROCEDURE_IDS.emergencyLaparotomy,
        laparotomyIncision: value(input, "laparotomyIncision"),
        laparotomyPathology: value(input, "laparotomyPathology"),
        laparotomyProcedurePerformed: value(input, "laparotomyProcedurePerformed"),
        laparotomyBowelResectionPerformed: value(input, "laparotomyBowelResectionPerformed"),
        laparotomyBowelResectionDetails: value(input, "laparotomyBowelResectionDetails"),
        laparotomyAnastomosisPerformed: value(input, "laparotomyAnastomosisPerformed"),
        laparotomyAnastomosisDetails: value(input, "laparotomyAnastomosisDetails"),
        laparotomyStomaFormed: value(input, "laparotomyStomaFormed"),
        laparotomyStomaDetails: value(input, "laparotomyStomaDetails"),
        laparotomyWashoutPerformed: value(input, "laparotomyWashoutPerformed"),
        laparotomyWashoutDetails: value(input, "laparotomyWashoutDetails"),
        laparotomyTemporaryClosure: value(input, "laparotomyTemporaryClosure"),
        laparotomyTemporaryClosureDetails: value(input, "laparotomyTemporaryClosureDetails"),
      } satisfies EmergencyLaparotomyInput;
    default:
      throw new Error(`Unsupported legacy procedure fixture: ${procedureId ?? "not specified"}`);
  }
}
