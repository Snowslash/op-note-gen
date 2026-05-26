function buildAppendicectomyOperationText(values) {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Appendix appearance: ${formatTextOperationValue(values.appendixAppearance)}`,
    `Perforation: ${formatYesNoOperationValue(values.perforation)}`,
    `Contamination: ${formatNoneOrPresentOperationValue(values.contaminationPresent, values.contaminationDescription)}`,
    `Mesoappendix division: ${formatSelectOperationValue(values.mesoappendixDivision)}`,
    `Stump control: ${formatSelectOperationValue(values.stumpControl)}`,
    `Specimen removed in bag: ${formatYesNoOperationValue(values.specimenRemovedInBag)}`,
    `Washout performed: ${formatYesNoOperationValue(values.washoutPerformed)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Drain: ${formatDrainOperationValue(values)}`,
    `Converted to open: ${formatConversionOperationValue(values)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildCholecystectomyOperationText(values) {
  return [
    `Laparoscopic entry method: ${formatSelectOperationValue(values.entryTechnique)}`,
    `Gallbladder appearance: ${formatTextOperationValue(values.gallbladderAppearance)}`,
    `Critical view of safety: ${formatAchievedOperationValue(values.criticalViewAchieved)}`,
    `Cystic duct control: ${formatSelectOperationValue(values.cysticDuctControl)}`,
    `Cystic artery control: ${formatSelectOperationValue(values.cysticArteryControl)}`,
    `Gallbladder removed in bag: ${formatYesNoOperationValue(values.gallbladderRemovedInBag)}`,
    `Bile spillage: ${formatNoneOrPresentOperationValue(values.bileSpillage, values.bileSpillageDetails)}`,
    `Stone spillage: ${formatNoneOrPresentOperationValue(values.stoneSpillage, values.stoneSpillageDetails)}`,
    `Intraoperative cholangiogram: ${formatPerformedOperationValue(values.cholangiogramPerformed, values.cholangiogramFindings)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Drain: ${formatDrainOperationValue(values)}`,
    `Converted to open: ${formatConversionOperationValue(values)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function formatSentStatus(value) {
  if (value === "yes") {
    return "sent";
  }

  if (value === "no") {
    return "not sent";
  }

  return "not specified";
}

function formatYesNoNotApplicableOperationValue(value) {
  if (value === "not applicable") {
    return "not applicable";
  }

  return formatYesNoOperationValue(value);
}

function buildIncisionAndDrainageOperationText(values) {
  return [
    `Incision site: ${formatTextOperationValue(values.incisionSite)}`,
    `Incision: ${formatSelectOperationValue(values.incisionType)}`,
    `Contents drained: ${formatSelectOperationValue(values.abscessContents)}`,
    `Microbiology swab: ${formatSentStatus(values.pusSwabSent)}`,
    `Loculations broken down: ${formatYesNoNotApplicableOperationValue(values.loculationsBrokenDown)}`,
    `Cavity irrigation/washout: ${formatYesNoOperationValue(values.cavityIrrigated)}`,
    `Packing/drain: ${formatTextOperationValue(values.packingOrDrain)}`,
    `Skin management: ${formatSelectOperationValue(values.skinManagement)}`,
    `Haemostasis confirmed: ${formatYesNoOperationValue(values.haemostasisConfirmed)}`,
    `Drain: ${formatDrainOperationValue(values)}`,
    formatAdditionalDetailsOperationLine(values),
  ].filter(Boolean).join("\n");
}

function buildDrainText(values) {
  if (values.drainStatus === "no") {
    return "No drain placed";
  }

  if (values.drainStatus === "yes") {
    return values.drainLocation.present ? values.drainLocation.value : "not specified";
  }

  return "not specified";
}

function buildComplicationsText(values) {
  const normalisedComplications = values.complications.trimmed
    .toLowerCase()
    .replace(/[.!]+$/, "");

  if (!values.complications.trimmed) {
    return "not specified";
  }

  if (normalisedComplications === "nil" || normalisedComplications === "none") {
    return "No immediate complications.";
  }

  return values.complications.raw;
}

function buildClosureText(values) {
  const sentences = [];

  if (values.fascialClosurePerformed === "yes") {
    if (values.fascialSutureMaterial.trimmed) {
      sentences.push(sentenceWithValue("Fascial closure was performed with ", values.fascialSutureMaterial.raw));
    } else {
      sentences.push("Fascial closure was performed.");
    }
  } else if (values.fascialClosurePerformed === "no") {
    sentences.push("Fascial closure was not performed.");
  }

  if (values.skinClosureMethod.trimmed) {
    sentences.push(sentenceWithValue("Skin was closed with ", values.skinClosureMethod.raw));
  }

  return sentences.length ? sentences.join(" ") : "not specified";
}

function buildPrimaryTeamLine(values) {
  const surgeonValue = values.surgeon.trimmed ? values.surgeon.raw : "not specified";
  const assistantValue = values.assistant.trimmed ? values.assistant.raw : "not specified";
  return `Surgeon / Assistant: Surgeon ${surgeonValue}; Assistant ${assistantValue}`;
}

function buildAdditionalTeamMembersText(values) {
  if (!values.additionalTeamMembers.length) {
    return "";
  }

  return values.additionalTeamMembers
    .map((member) => `${member.role} ${member.name}`)
    .join("; ");
}

function buildAdditionalTeamMembersLine(values) {
  const additionalTeamMembersText = buildAdditionalTeamMembersText(values);
  return additionalTeamMembersText ? `Additional team members: ${additionalTeamMembersText}` : "";
}

function buildSupervisingConsultantLine(values) {
  return values.supervisingConsultant.trimmed
    ? `Supervising consultant: ${values.supervisingConsultant.raw}`
    : "";
}

function buildAnaestheticLine(values) {
  return `Anaesthetic: ${formatInlineValue(values.anaesthetic)}`;
}

function buildAnaesthetistLine(values) {
  return values.anaesthetist.trimmed ? `Anaesthetist: ${values.anaesthetist.raw}` : "";
}

function buildPortsSection(values) {
  return values.portsUsed.trimmed ? formatBlock("Ports", values.portsUsed) : "";
}

function buildOperationLine(values, procedure) {
  return `Operation:\n${procedure.buildOperationText(values)}`;
}

function buildSpecimenLine(values) {
  return `Specimen: ${formatInlineValue(values.specimen.trimmed ? values.specimen.raw : "")}`;
}

function buildDrainLine(values) {
  return `Drain: ${buildDrainText(values)}`;
}

function buildEstimatedBloodLossLine(values) {
  const bloodLossNormalised = values.bloodLoss.trimmed.toLowerCase();

  if (!values.bloodLoss.trimmed || bloodLossNormalised === "not specified") {
    return "";
  }

  return `Estimated blood loss: ${values.bloodLoss.raw}`;
}

function buildComplicationsLine(values) {
  return `Complications: ${buildComplicationsText(values)}`;
}

function buildClosureLine(values) {
  return `Closure: ${buildClosureText(values)}`;
}

function buildStandardOutputSections() {
  return [
    {
      build: (values, procedure) => `Procedure: ${procedure.title}`,
    },
    {
      build: buildPrimaryTeamLine,
    },
    {
      build: buildAdditionalTeamMembersLine,
    },
    {
      build: buildSupervisingConsultantLine,
    },
    {
      build: buildAnaestheticLine,
    },
    {
      build: buildAnaesthetistLine,
    },
    {
      build: (values) => formatBlock("Indication", values.indication),
    },
    {
      build: (values) => formatBlock("Findings", values.findings),
    },
    {
      build: buildPortsSection,
    },
    {
      build: buildOperationLine,
    },
    {
      build: buildSpecimenLine,
    },
    {
      build: buildDrainLine,
    },
    {
      build: buildEstimatedBloodLossLine,
    },
    {
      build: buildComplicationsLine,
    },
    {
      build: buildClosureLine,
    },
    {
      build: (values) => formatBlock("Post-operative plan", values.postOpPlan),
    },
  ];
}

function createTeamMemberRow(role = "Assistant", name = "") {
  const row = document.createElement("div");
  row.className = "team-member-row";
  row.dataset.teamMemberId = String(APP_STATE.teamMemberIdCounter);
  APP_STATE.teamMemberIdCounter += 1;

  row.innerHTML = `
    <label class="field">
      <span>Role</span>
      <select class="team-member-role" aria-label="Team member role">
        <option value="Surgeon"${role === "Surgeon" ? " selected" : ""}>Surgeon</option>
        <option value="Assistant"${role === "Assistant" ? " selected" : ""}>Assistant</option>
      </select>
    </label>
    <label class="field">
      <span>Name</span>
      <input type="text" class="team-member-name" aria-label="Team member name" autocomplete="off" value="${escapeHtml(name)}">
    </label>
    <button type="button" class="danger-button compact-button remove-team-member">Remove</button>
  `;

  return row;
}

function collectAdditionalTeamMembers() {
  return Array.from(DOM.teamMembersList.querySelectorAll(".team-member-row"))
    .map((row) => {
      const role = row.querySelector(".team-member-role").value;
      const nameField = row.querySelector(".team-member-name");
      const raw = nameField.value;

      return {
        role,
        name: raw,
        trimmedName: raw.trim(),
      };
    })
    .filter((member) => member.trimmedName);
}

function buildIncisionAndDrainageOutputSections() {
  return buildStandardOutputSections()
    .filter((section) => section.build !== buildPortsSection);
}

// Procedure configs keep procedure-specific rules in one place so additional
// operations can reuse the same collection, visibility, validation, and output engine.
const PROCEDURES = {
  lapAppendicectomy: {
    id: "lapAppendicectomy",
    title: "Laparoscopic appendicectomy",
    hint: "Appendicectomy-specific steps include perforation, contamination, mesoappendix division, stump control, and washout.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
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
  incisionAndDrainage: {
    id: "incisionAndDrainage",
    title: "Incision and drainage of abscess",
    hint: "Incision and drainage-specific steps include abscess site, incision, contents drained, microbiology swab, loculations, washout, packing or drain, and wound management.",
    validationHint: "Warnings are advisory. Indication and findings are required before generation. Unanswered structured operation fields are shown as not specified.",
    fields: {
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
      skinManagement: {
        type: FIELD_TYPES.SELECT_OR_CUSTOM,
        selectId: "skinManagement",
        customId: "skinManagementCustom",
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
        targetId: "skinManagementCustomField",
        isVisible: (values) => values.skinManagement.selected === "Custom / other",
        clearOnHide: ["skinManagementCustom"],
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
    outputSections: buildIncisionAndDrainageOutputSections(),
    buildOperationText: buildIncisionAndDrainageOperationText,
  },
};
