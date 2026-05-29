const PROCEDURES = {
  lapAppendicectomy: {
    id: "lapAppendicectomy",
    title: "Laparoscopic appendicectomy",
    hint: "Appendicectomy-specific steps include perforation, contamination, mesoappendix division, stump control, and washout.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      portsUsed: { type: FIELD_TYPES.TEXT, id: "portsUsed" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      appendixAppearance: { type: FIELD_TYPES.TEXT, id: "appendixAppearance" },
      contaminationDescription: { type: FIELD_TYPES.TEXT, id: "contaminationDescription" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      conversionReason: { type: FIELD_TYPES.TEXT, id: "conversionReason" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      perforation: { type: FIELD_TYPES.RADIO, name: "perforation" },
      contaminationPresent: { type: FIELD_TYPES.RADIO, name: "contaminationPresent" },
      specimenRemovedInBag: { type: FIELD_TYPES.RADIO, name: "specimenRemovedInBag" },
      washoutPerformed: { type: FIELD_TYPES.RADIO, name: "washoutPerformed" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      convertedToOpen: { type: FIELD_TYPES.CHECKBOX, id: "convertedToOpen" },
      entryTechnique: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "entryTechnique",
        customId: "entryTechniqueCustom",
      },
      mesoappendixDivision: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "mesoappendixDivision",
        customId: "mesoappendixDivisionCustom",
      },
      stumpControl: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "stumpControl",
        customId: "stumpControlCustom",
      },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "entryTechniqueCustomField",
        isVisible: (values) => values.entryTechnique.selected === "Custom / other",
        clearOnHide: ["entryTechniqueCustom"],
      },
      {
        targetId: "contaminationDescriptionField",
        isVisible: (values) => values.contaminationPresent === "yes",
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
      {
        targetId: "mesoappendixDivisionCustomField",
        isVisible: (values) => values.mesoappendixDivision.selected === "Custom / other",
        clearOnHide: ["mesoappendixDivisionCustom"],
      },
      {
        targetId: "stumpControlCustomField",
        isVisible: (values) => values.stumpControl.selected === "Custom / other",
        clearOnHide: ["stumpControlCustom"],
      },
      {
        targetId: "conversionReasonField",
        isVisible: (values) => values.convertedToOpen,
        clearOnHide: ["conversionReason"],
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.specimen.trimmed
        ? "No specimen entered. Confirm whether there was no specimen or add details."
        : ""),
      (values) => {
        if (!values.drainStatus) {
          return "No drain status entered. Confirm whether no drain was placed or add details.";
        }

        if (values.drainStatus === "yes" && !values.drainLocation.present) {
          return "Drain marked as yes without a location. Add drain location if available.";
        }

        return "";
      },
      (values) => (values.contaminationPresent === "yes" && !values.washoutPerformed
        ? "Contamination marked as present without washout status. Confirm whether washout was performed."
        : ""),
      (values) => (values.convertedToOpen && !values.conversionReason.trimmed
        ? "Converted to open without a reason. Add the reason if available."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildStandardOutputSections(),
    buildOperationText: buildAppendicectomyOperationText,
  },
  lapCholecystectomy: {
    id: "lapCholecystectomy",
    title: "Laparoscopic cholecystectomy",
    hint: "Cholecystectomy-specific steps include critical view, cystic duct and artery control, spillage, cholangiogram, and gallbladder retrieval.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      portsUsed: { type: FIELD_TYPES.TEXT, id: "portsUsed" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      gallbladderAppearance: { type: FIELD_TYPES.TEXT, id: "gallbladderAppearance" },
      bileSpillageDetails: { type: FIELD_TYPES.TEXT, id: "bileSpillageDetails" },
      stoneSpillageDetails: { type: FIELD_TYPES.TEXT, id: "stoneSpillageDetails" },
      cholangiogramFindings: { type: FIELD_TYPES.TEXT, id: "cholangiogramFindings" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      conversionReason: { type: FIELD_TYPES.TEXT, id: "conversionReason" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      criticalViewAchieved: { type: FIELD_TYPES.RADIO, name: "criticalViewAchieved" },
      gallbladderRemovedInBag: { type: FIELD_TYPES.RADIO, name: "gallbladderRemovedInBag" },
      bileSpillage: { type: FIELD_TYPES.RADIO, name: "bileSpillage" },
      stoneSpillage: { type: FIELD_TYPES.RADIO, name: "stoneSpillage" },
      cholangiogramPerformed: { type: FIELD_TYPES.RADIO, name: "cholangiogramPerformed" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      convertedToOpen: { type: FIELD_TYPES.CHECKBOX, id: "convertedToOpen" },
      entryTechnique: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "entryTechnique",
        customId: "entryTechniqueCustom",
      },
      cysticDuctControl: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "cysticDuctControl",
        customId: "cysticDuctControlCustom",
      },
      cysticArteryControl: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "cysticArteryControl",
        customId: "cysticArteryControlCustom",
      },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "entryTechniqueCustomField",
        isVisible: (values) => values.entryTechnique.selected === "Custom / other",
        clearOnHide: ["entryTechniqueCustom"],
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
      {
        targetId: "cysticDuctControlCustomField",
        isVisible: (values) => values.cysticDuctControl.selected === "Custom / other",
        clearOnHide: ["cysticDuctControlCustom"],
      },
      {
        targetId: "cysticArteryControlCustomField",
        isVisible: (values) => values.cysticArteryControl.selected === "Custom / other",
        clearOnHide: ["cysticArteryControlCustom"],
      },
      {
        targetId: "bileSpillageDetailsField",
        isVisible: (values) => values.bileSpillage === "yes",
      },
      {
        targetId: "stoneSpillageDetailsField",
        isVisible: (values) => values.stoneSpillage === "yes",
      },
      {
        targetId: "cholangiogramFindingsField",
        isVisible: (values) => values.cholangiogramPerformed === "yes",
      },
      {
        targetId: "conversionReasonField",
        isVisible: (values) => values.convertedToOpen,
        clearOnHide: ["conversionReason"],
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.specimen.trimmed
        ? "No specimen entered. Confirm whether there was no specimen or add details."
        : ""),
      (values) => {
        if (!values.drainStatus) {
          return "No drain status entered. Confirm whether no drain was placed or add details.";
        }

        if (values.drainStatus === "yes" && !values.drainLocation.present) {
          return "Drain marked as yes without a location. Add drain location if available.";
        }

        return "";
      },
      (values) => (values.criticalViewAchieved === "no"
        ? "Critical view marked as not achieved. Ensure the operation narrative and plan are clinically reviewed."
        : ""),
      (values) => (values.convertedToOpen && !values.conversionReason.trimmed
        ? "Converted to open without a reason. Add the reason if available."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildStandardOutputSections(),
    buildOperationText: buildCholecystectomyOperationText,
  },
  diagnosticLaparoscopy: {
    id: "diagnosticLaparoscopy",
    title: "Diagnostic laparoscopy +/- washout / adhesiolysis",
    hint: "Diagnostic laparoscopy-specific steps include laparoscopic access, abdominal survey, procedure performed, washout, adhesiolysis, source control, haemostasis, drain, and conversion status.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      portsUsed: { type: FIELD_TYPES.TEXT, id: "portsUsed" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      abdominalSurvey: { type: FIELD_TYPES.TEXT, id: "abdominalSurvey" },
      procedurePerformed: { type: FIELD_TYPES.TEXT, id: "procedurePerformed" },
      washoutFluid: { type: FIELD_TYPES.TEXT, id: "washoutFluid" },
      adhesiolysisDetails: { type: FIELD_TYPES.TEXT, id: "adhesiolysisDetails" },
      sourceControl: { type: FIELD_TYPES.TEXT, id: "sourceControl" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      conversionReason: { type: FIELD_TYPES.TEXT, id: "conversionReason" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      convertedToOpen: { type: FIELD_TYPES.CHECKBOX, id: "convertedToOpen" },
      entryTechnique: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "entryTechnique",
        customId: "entryTechniqueCustom",
      },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "entryTechniqueCustomField",
        isVisible: (values) => values.entryTechnique.selected === "Custom / other",
        clearOnHide: ["entryTechniqueCustom"],
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
      {
        targetId: "conversionReasonField",
        isVisible: (values) => values.convertedToOpen,
        clearOnHide: ["conversionReason"],
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.specimen.trimmed
        ? "No specimen entered. Confirm whether there was no specimen or add details."
        : ""),
      (values) => {
        if (!values.drainStatus) {
          return "No drain status entered. Confirm whether no drain was placed or add details.";
        }

        if (values.drainStatus === "yes" && !values.drainLocation.present) {
          return "Drain marked as yes without a location. Add drain location if available.";
        }

        return "";
      },
      (values) => (values.convertedToOpen && !values.conversionReason.trimmed
        ? "Converted to open without a reason. Add the reason if available."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildStandardOutputSections(),
    buildOperationText: buildDiagnosticLaparoscopyOperationText,
  },
  incisionAndDrainage: {
    id: "incisionAndDrainage",
    title: "Incision and drainage of abscess",
    hint: "Incision and drainage-specific steps include abscess site, incision, contents drained, microbiology swab, loculations, washout, and packing or drain.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      incisionSite: { type: FIELD_TYPES.TEXT, id: "incisionSite" },
      packingOrDrain: { type: FIELD_TYPES.TEXT, id: "packingOrDrain" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      incisionType: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "incisionType",
        customId: "incisionTypeCustom",
      },
      abscessContents: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "abscessContents",
        customId: "abscessContentsCustom",
      },
      pusSwabSent: { type: FIELD_TYPES.SELECT, id: "pusSwabSent" },
      loculationsBrokenDown: { type: FIELD_TYPES.SELECT, id: "loculationsBrokenDown" },
      cavityIrrigated: { type: FIELD_TYPES.SELECT, id: "cavityIrrigated" },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "incisionTypeCustomField",
        isVisible: (values) => values.incisionType.selected === "Custom / other",
        clearOnHide: ["incisionTypeCustom"],
      },
      {
        targetId: "abscessContentsCustomField",
        isVisible: (values) => values.abscessContents.selected === "Custom / other",
        clearOnHide: ["abscessContentsCustom"],
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.specimen.trimmed && values.pusSwabSent !== "yes"
        ? "No specimen or microbiology swab entered. Confirm whether a swab/specimen was sent."
        : ""),
      (values) => (!values.drainStatus && !values.packingOrDrain.trimmed
        ? "No drain status or packing details entered. Confirm whether the cavity was packed, drained, or left without either."
        : ""),
      (values) => (values.pusSwabSent === "yes" && !values.specimen.trimmed
        ? "Microbiology swab marked as sent. Consider documenting the specimen/swab in the specimen field."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildNoPortsOutputSections(),
    buildOperationText: buildIncisionAndDrainageOperationText,
  },
  openInguinalHerniaRepair: {
    id: "openInguinalHerniaRepair",
    title: "Open inguinal hernia repair",
    hint: "Open inguinal hernia repair-specific steps include side, hernia type, sac management, mesh, cord structures, ilioinguinal nerve, and haemostasis.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      herniaSide: { type: FIELD_TYPES.SELECT, id: "herniaSide" },
      herniaContents: { type: FIELD_TYPES.TEXT, id: "herniaContents" },
      sacManagement: { type: FIELD_TYPES.TEXT, id: "sacManagement" },
      meshUsed: { type: FIELD_TYPES.SELECT, id: "meshUsed" },
      meshType: { type: FIELD_TYPES.TEXT, id: "meshType" },
      meshFixation: { type: FIELD_TYPES.TEXT, id: "meshFixation" },
      cordStructuresManaged: { type: FIELD_TYPES.TEXT, id: "cordStructuresManaged" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      herniaType: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "herniaType",
        customId: "herniaTypeCustom",
      },
      ilioinguinalNerveStatus: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "ilioinguinalNerveStatus",
        customId: "ilioinguinalNerveStatusCustom",
      },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "herniaTypeCustomField",
        isVisible: (values) => values.herniaType.selected === "Custom / other",
        clearOnHide: ["herniaTypeCustom"],
      },
      {
        targetId: "meshTypeField",
        isVisible: (values) => values.meshUsed === "yes",
        clearOnHide: ["meshType"],
      },
      {
        targetId: "meshFixationField",
        isVisible: (values) => values.meshUsed === "yes",
        clearOnHide: ["meshFixation"],
      },
      {
        targetId: "ilioinguinalNerveStatusCustomField",
        isVisible: (values) => values.ilioinguinalNerveStatus.selected === "Custom / other",
        clearOnHide: ["ilioinguinalNerveStatusCustom"],
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.drainStatus
        ? "No drain status entered. Confirm whether no drain was placed or add details."
        : ""),
      (values) => (values.drainStatus === "yes" && !values.drainLocation.present
        ? "Drain marked as yes without a location. Add drain location if available."
        : ""),
      (values) => (values.meshUsed === "yes" && !values.meshType.trimmed
        ? "Mesh marked as used without mesh type. Add mesh type if available."
        : ""),
      (values) => (values.meshUsed === "yes" && !values.meshFixation.trimmed
        ? "Mesh marked as used without fixation details. Add mesh fixation if available."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildNoPortsOutputSections(),
    buildOperationText: buildOpenInguinalHerniaRepairOperationText,
  },
  openUmbilicalHerniaRepair: {
    id: "openUmbilicalHerniaRepair",
    title: "Open umbilical hernia repair",
    hint: "Open umbilical hernia repair-specific steps include defect size, contents, sac management, repair method, mesh details, and haemostasis.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      umbilicalHerniaDefectSize: { type: FIELD_TYPES.TEXT, id: "umbilicalHerniaDefectSize" },
      umbilicalHerniaContents: { type: FIELD_TYPES.TEXT, id: "umbilicalHerniaContents" },
      umbilicalSacManagement: { type: FIELD_TYPES.TEXT, id: "umbilicalSacManagement" },
      umbilicalMeshUsed: { type: FIELD_TYPES.SELECT, id: "umbilicalMeshUsed" },
      umbilicalMeshType: { type: FIELD_TYPES.TEXT, id: "umbilicalMeshType" },
      umbilicalMeshFixation: { type: FIELD_TYPES.TEXT, id: "umbilicalMeshFixation" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      umbilicalRepairMethod: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "umbilicalRepairMethod",
        customId: "umbilicalRepairMethodCustom",
      },
      umbilicalMeshPosition: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "umbilicalMeshPosition",
        customId: "umbilicalMeshPositionCustom",
      },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "umbilicalRepairMethodCustomField",
        isVisible: (values) => values.umbilicalRepairMethod.selected === "Custom / other",
        clearOnHide: ["umbilicalRepairMethodCustom"],
      },
      {
        targetId: "umbilicalMeshTypeField",
        isVisible: (values) => values.umbilicalMeshUsed === "yes",
        clearOnHide: ["umbilicalMeshType"],
      },
      {
        targetId: "umbilicalMeshPositionField",
        isVisible: (values) => values.umbilicalMeshUsed === "yes",
      },
      {
        targetId: "umbilicalMeshPositionCustomField",
        isVisible: (values) => values.umbilicalMeshUsed === "yes" && values.umbilicalMeshPosition.selected === "Custom / other",
        clearOnHide: ["umbilicalMeshPositionCustom"],
      },
      {
        targetId: "umbilicalMeshFixationField",
        isVisible: (values) => values.umbilicalMeshUsed === "yes",
        clearOnHide: ["umbilicalMeshFixation"],
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.drainStatus
        ? "No drain status entered. Confirm whether no drain was placed or add details."
        : ""),
      (values) => (values.drainStatus === "yes" && !values.drainLocation.present
        ? "Drain marked as yes without a location. Add drain location if available."
        : ""),
      (values) => (values.umbilicalMeshUsed === "yes" && !values.umbilicalMeshType.trimmed
        ? "Mesh marked as used without mesh type. Add mesh type if available."
        : ""),
      (values) => (values.umbilicalMeshUsed === "yes" && !values.umbilicalMeshPosition.present
        ? "Mesh marked as used without mesh position. Add mesh position if available."
        : ""),
      (values) => (values.umbilicalMeshUsed === "yes" && !values.umbilicalMeshFixation.trimmed
        ? "Mesh marked as used without fixation details. Add mesh fixation if available."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildNoPortsOutputSections(),
    buildOperationText: buildOpenUmbilicalHerniaRepairOperationText,
  },
  emergencyLaparotomy: {
    id: "emergencyLaparotomy",
    title: "Emergency laparotomy",
    hint: "Emergency laparotomy-specific steps include incision, pathology/source, procedure performed, bowel resection, anastomosis, stoma, washout, temporary abdominal closure, drain, and haemostasis.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
      operationDateTime: { type: FIELD_TYPES.TEXT, id: "operationDateTime" },
      surgeon: { type: FIELD_TYPES.TEXT, id: "surgeon" },
      assistant: { type: FIELD_TYPES.TEXT, id: "assistant" },
      supervisingConsultant: { type: FIELD_TYPES.TEXT, id: "supervisingConsultant" },
      anaesthetic: { type: FIELD_TYPES.SELECT, id: "anaesthetic" },
      anaesthetist: { type: FIELD_TYPES.TEXT, id: "anaesthetist" },
      indication: { type: FIELD_TYPES.TEXT, id: "indication" },
      findings: { type: FIELD_TYPES.TEXT, id: "findings" },
      specimen: { type: FIELD_TYPES.TEXT, id: "specimen" },
      bloodLoss: { type: FIELD_TYPES.TEXT, id: "bloodLoss" },
      complications: { type: FIELD_TYPES.TEXT, id: "complications" },
      postOpPlan: { type: FIELD_TYPES.TEXT, id: "postOpPlan" },
      laparotomyIncision: { type: FIELD_TYPES.TEXT, id: "laparotomyIncision" },
      laparotomyPathology: { type: FIELD_TYPES.TEXT, id: "laparotomyPathology" },
      laparotomyProcedurePerformed: { type: FIELD_TYPES.TEXT, id: "laparotomyProcedurePerformed" },
      laparotomyBowelResectionPerformed: { type: FIELD_TYPES.SELECT, id: "laparotomyBowelResectionPerformed" },
      laparotomyBowelResectionDetails: { type: FIELD_TYPES.TEXT, id: "laparotomyBowelResectionDetails" },
      laparotomyAnastomosisPerformed: { type: FIELD_TYPES.SELECT, id: "laparotomyAnastomosisPerformed" },
      laparotomyAnastomosisDetails: { type: FIELD_TYPES.TEXT, id: "laparotomyAnastomosisDetails" },
      laparotomyStomaFormed: { type: FIELD_TYPES.SELECT, id: "laparotomyStomaFormed" },
      laparotomyStomaDetails: { type: FIELD_TYPES.TEXT, id: "laparotomyStomaDetails" },
      laparotomyWashoutPerformed: { type: FIELD_TYPES.SELECT, id: "laparotomyWashoutPerformed" },
      laparotomyWashoutDetails: { type: FIELD_TYPES.TEXT, id: "laparotomyWashoutDetails" },
      laparotomyTemporaryClosure: { type: FIELD_TYPES.SELECT, id: "laparotomyTemporaryClosure" },
      laparotomyTemporaryClosureDetails: { type: FIELD_TYPES.TEXT, id: "laparotomyTemporaryClosureDetails" },
      fascialSutureMaterial: { type: FIELD_TYPES.TEXT, id: "fascialSutureMaterial" },
      skinClosureMethod: { type: FIELD_TYPES.TEXT, id: "skinClosureMethod" },
      additionalOperativeDetails: { type: FIELD_TYPES.TEXT, id: "additionalOperativeDetails" },
      drainStatus: { type: FIELD_TYPES.RADIO, name: "drainStatus" },
      haemostasisConfirmed: { type: FIELD_TYPES.RADIO, name: "haemostasisConfirmed" },
      fascialClosurePerformed: { type: FIELD_TYPES.RADIO, name: "fascialClosurePerformed" },
      drainLocation: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "drainLocation",
        customId: "drainLocationCustom",
      },
      additionalTeamMembers: {
        type: FIELD_TYPES.CUSTOM,
        read: collectAdditionalTeamMembers,
      },
    },
    visibilityRules: [
      {
        targetId: "drainLocationField",
        isVisible: (values) => values.drainStatus === "yes",
      },
      {
        targetId: "drainLocationCustomField",
        isVisible: (values) => values.drainStatus === "yes" && values.drainLocation.selected === "Custom / other",
        clearOnHide: ["drainLocationCustom"],
      },
      {
        targetId: "laparotomyBowelResectionDetailsField",
        isVisible: (values) => values.laparotomyBowelResectionPerformed === "yes",
        clearOnHide: ["laparotomyBowelResectionDetails"],
      },
      {
        targetId: "laparotomyAnastomosisDetailsField",
        isVisible: (values) => values.laparotomyAnastomosisPerformed === "yes",
        clearOnHide: ["laparotomyAnastomosisDetails"],
      },
      {
        targetId: "laparotomyStomaDetailsField",
        isVisible: (values) => values.laparotomyStomaFormed === "yes",
        clearOnHide: ["laparotomyStomaDetails"],
      },
      {
        targetId: "laparotomyWashoutDetailsField",
        isVisible: (values) => values.laparotomyWashoutPerformed === "yes",
        clearOnHide: ["laparotomyWashoutDetails"],
      },
      {
        targetId: "laparotomyTemporaryClosureDetailsField",
        isVisible: (values) => values.laparotomyTemporaryClosure === "yes",
        clearOnHide: ["laparotomyTemporaryClosureDetails"],
      },
      {
        targetId: "fascialSutureField",
        isVisible: (values) => values.fascialClosurePerformed === "yes",
      },
    ],
    warningRules: [
      (values) => (!values.complications.trimmed
        ? "No complications entered. Confirm that there were no immediate complications."
        : ""),
      (values) => (!values.specimen.trimmed
        ? "No specimen entered. Confirm whether there was no specimen or add details."
        : ""),
      (values) => (!values.drainStatus
        ? "No drain status entered. Confirm whether no drain was placed or add details."
        : ""),
      (values) => (values.drainStatus === "yes" && !values.drainLocation.present
        ? "Drain marked as yes without a location. Add drain location if available."
        : ""),
      (values) => (values.laparotomyBowelResectionPerformed === "yes" && !values.laparotomyBowelResectionDetails.trimmed
        ? "Bowel resection marked as performed without details. Add resection details if available."
        : ""),
      (values) => (values.laparotomyAnastomosisPerformed === "yes" && !values.laparotomyAnastomosisDetails.trimmed
        ? "Anastomosis marked as performed without details. Add anastomosis details if available."
        : ""),
      (values) => (values.laparotomyStomaFormed === "yes" && !values.laparotomyStomaDetails.trimmed
        ? "Stoma marked as formed without details. Add stoma details if available."
        : ""),
      (values) => (values.laparotomyTemporaryClosure === "yes" && !values.laparotomyTemporaryClosureDetails.trimmed
        ? "Temporary abdominal closure marked as yes without details. Add closure details if available."
        : ""),
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
    ],
    outputSections: buildNoPortsOutputSections(),
    buildOperationText: buildEmergencyLaparotomyOperationText,
  },
};
