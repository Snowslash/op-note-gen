const DOM = {
  form: document.getElementById("note-form"),
  validationMessage: document.getElementById("validationMessage"),
  warningBox: document.getElementById("warningBox"),
  warningList: document.getElementById("warningList"),
  noteOutput: document.getElementById("noteOutput"),
  copyButton: document.getElementById("copyButton"),
  copyFeedback: document.getElementById("copyFeedback"),
  addTeamMemberButton: document.getElementById("addTeamMemberButton"),
  teamMembersList: document.getElementById("teamMembersList"),
  procedureSelect: document.getElementById("procedureSelect"),
  procedureTitle: document.getElementById("procedureTitle"),
  procedureHint: document.getElementById("procedureHint"),
  validationHint: document.getElementById("validationHint"),
  procedureSections: document.querySelectorAll("[data-procedure-section]"),
};

const APP_STATE = {
  activeProcedureId: "lapAppendicectomy",
  latestNoteText: "",
  teamMemberIdCounter: 0,
};

const FIELD_TYPES = {
  TEXT: "text",
  SELECT: "select",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  SELECT_OR_CUSTOM: "selectOrCustom",
  CUSTOM: "custom",
};

function getElement(id) {
  return document.getElementById(id);
}

function getRawValue(id) {
  return getElement(id).value;
}

function getTextData(id) {
  const raw = getRawValue(id);

  return {
    raw,
    trimmed: raw.trim(),
  };
}

function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function getSelectValue(id) {
  return getElement(id).value;
}

function getCheckboxValue(id) {
  return getElement(id).checked;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveSelectOrCustom(selectId, customId) {
  const selected = getSelectValue(selectId);

  if (!selected) {
    return {
      selected: "",
      value: "",
      present: false,
    };
  }

  if (selected !== "Custom / other") {
    return {
      selected,
      value: selected,
      present: true,
    };
  }

  const custom = getTextData(customId);

  return {
    selected,
    value: custom.trimmed ? custom.raw : "",
    present: Boolean(custom.trimmed),
  };
}

function readFieldValue(definition) {
  if (definition.type === FIELD_TYPES.TEXT) {
    return getTextData(definition.id);
  }

  if (definition.type === FIELD_TYPES.SELECT) {
    return getSelectValue(definition.id);
  }

  if (definition.type === FIELD_TYPES.RADIO) {
    return getRadioValue(definition.name);
  }

  if (definition.type === FIELD_TYPES.CHECKBOX) {
    return getCheckboxValue(definition.id);
  }

  if (definition.type === FIELD_TYPES.SELECT_OR_CUSTOM) {
    return resolveSelectOrCustom(definition.selectId, definition.customId);
  }

  if (definition.type === FIELD_TYPES.CUSTOM) {
    return definition.read();
  }

  return "";
}

function clearControlValue(id) {
  const element = getElement(id);

  if (!element) {
    return;
  }

  if ("checked" in element && (element.type === "checkbox" || element.type === "radio")) {
    element.checked = false;
  }

  if ("value" in element) {
    element.value = "";
  }
}

function setFieldVisibility(id, visible) {
  const element = getElement(id);
  element.hidden = !visible;
  element.style.display = visible ? "" : "none";
}

function applyVisibilityRules(procedure, values) {
  procedure.visibilityRules.forEach((rule) => {
    const visible = rule.isVisible(values);
    setFieldVisibility(rule.targetId, visible);

    if (!visible && rule.clearOnHide) {
      rule.clearOnHide.forEach(clearControlValue);
    }
  });
}

function sentenceWithValue(prefix, value) {
  const suffix = /[.!?]$/.test(value.trim()) ? "" : ".";
  return `${prefix}${value}${suffix}`;
}

function sentenceWithFullStop(prefix, value) {
  const suffix = value.trim().endsWith(".") ? "" : ".";
  return `${prefix}${value}${suffix}`;
}

function formatInlineValue(value, fallback = "not specified") {
  return value || fallback;
}

function formatBlock(label, field, fallback = "not specified") {
  return `${label}:\n${field.trimmed ? field.raw : fallback}`;
}

function runRuleSet(values, rules) {
  return rules
    .map((rule) => rule(values))
    .filter(Boolean);
}

function buildPerforationSentence(values) {
  if (values.perforation === "yes") {
    return "Perforation was present.";
  }

  return "";
}

function buildContaminationSentence(values) {
  if (values.contaminationPresent === "yes") {
    if (values.contaminationDescription.trimmed) {
      return sentenceWithValue("Contamination was noted: ", values.contaminationDescription.raw);
    }

    return "Contamination was present.";
  }

  if (values.contaminationPresent === "no") {
    return "No contamination was noted.";
  }

  return "";
}

function buildSpecimenRemovalSentence(values) {
  if (values.specimenRemovedInBag === "yes") {
    return "The specimen was removed in a bag.";
  }

  if (values.specimenRemovedInBag === "no") {
    return "The specimen was removed without a bag.";
  }

  return "";
}

function buildWashoutSentence(values) {
  if (values.washoutPerformed === "yes") {
    return "Washout was performed.";
  }

  if (values.washoutPerformed === "no") {
    return "Washout was not performed.";
  }

  return "";
}

function buildHaemostasisSentence(values) {
  if (values.haemostasisConfirmed === "yes") {
    return "Haemostasis was confirmed.";
  }

  if (values.haemostasisConfirmed === "no") {
    return "Haemostasis was not confirmed.";
  }

  return "";
}

function buildCriticalViewSentence(values) {
  if (values.criticalViewAchieved === "yes") {
    return "The critical view of safety was achieved.";
  }

  if (values.criticalViewAchieved === "no") {
    return "The critical view of safety was not achieved.";
  }

  return "";
}

function buildDrainSentence(values) {
  if (values.drainStatus === "yes") {
    if (values.drainLocation.present) {
      return sentenceWithValue("Drain was placed in ", values.drainLocation.value);
    }

    return "A drain was placed.";
  }

  if (values.drainStatus === "no") {
    return "No drain was placed.";
  }

  return "";
}

function buildConversionSentence(values) {
  if (!values.convertedToOpen || !values.conversionReason.trimmed) {
    return "";
  }

  return sentenceWithFullStop("The procedure was converted to an open approach due to ", values.conversionReason.raw);
}

function buildAdditionalOperativeDetailsSentence(values) {
  if (!values.additionalOperativeDetails.trimmed) {
    return "";
  }

  return `Additional operative details: ${values.additionalOperativeDetails.raw}`;
}

function buildGallbladderAppearanceSentence(values) {
  if (!values.gallbladderAppearance.trimmed) {
    return "";
  }

  return sentenceWithValue("Gallbladder appearance: ", values.gallbladderAppearance.raw);
}

function buildGallbladderRetrievalSentence(values) {
  if (values.gallbladderRemovedInBag === "yes") {
    return "The gallbladder was removed in a bag.";
  }

  if (values.gallbladderRemovedInBag === "no") {
    return "The gallbladder was removed without a bag.";
  }

  return "";
}

function buildBileSpillageSentence(values) {
  if (values.bileSpillage === "yes") {
    if (values.bileSpillageDetails.trimmed) {
      return sentenceWithValue("Bile spillage occurred: ", values.bileSpillageDetails.raw);
    }

    return "Bile spillage occurred.";
  }

  if (values.bileSpillage === "no") {
    return "No bile spillage occurred.";
  }

  return "";
}

function buildStoneSpillageSentence(values) {
  if (values.stoneSpillage === "yes") {
    if (values.stoneSpillageDetails.trimmed) {
      return sentenceWithValue("Stone spillage occurred: ", values.stoneSpillageDetails.raw);
    }

    return "Stone spillage occurred.";
  }

  if (values.stoneSpillage === "no") {
    return "No stone spillage occurred.";
  }

  return "";
}

function buildCholangiogramSentence(values) {
  if (values.cholangiogramPerformed === "yes") {
    if (values.cholangiogramFindings.trimmed) {
      return sentenceWithValue("Intraoperative cholangiogram was performed: ", values.cholangiogramFindings.raw);
    }

    return "Intraoperative cholangiogram was performed.";
  }

  if (values.cholangiogramPerformed === "no") {
    return "Intraoperative cholangiogram was not performed.";
  }

  return "";
}

function joinOperationSegments(segments) {
  return segments.reduce((output, segment, index) => {
    if (!segment.text) {
      return output;
    }

    if (index === 0) {
      return segment.text;
    }

    const previous = segments[index - 1];
    const separator = segment.block || previous.block ? "\n" : " ";
    return `${output}${separator}${segment.text}`;
  }, "");
}

function buildAppendicectomyOperationText(values) {
  const segments = [];
  const laparoscopicPhase = [];
  const definitivePhase = [];

  if (values.entryTechnique.present) {
    laparoscopicPhase.push({
      text: sentenceWithValue("Laparoscopic entry was obtained using ", values.entryTechnique.value),
      block: false,
    });
  } else {
    laparoscopicPhase.push({
      text: "Laparoscopic entry was obtained.",
      block: false,
    });
  }

  laparoscopicPhase.push({
    text: "The appendix was identified and assessed.",
    block: false,
  });

  const perforationSentence = buildPerforationSentence(values);
  if (perforationSentence) {
    laparoscopicPhase.push({ text: perforationSentence, block: false });
  }

  const contaminationSentence = buildContaminationSentence(values);
  if (contaminationSentence) {
    laparoscopicPhase.push({ text: contaminationSentence, block: false });
  }

  if (values.convertedToOpen) {
    segments.push(...laparoscopicPhase);

    const conversionSentence = buildConversionSentence(values);
    if (conversionSentence) {
      segments.push({ text: conversionSentence, block: false });
    }

    definitivePhase.push({ text: "A laparotomy was performed.", block: false });
  } else {
    definitivePhase.push(...laparoscopicPhase);
  }

  if (values.mesoappendixDivision.present) {
    definitivePhase.push({
      text: sentenceWithValue("The mesoappendix was divided using ", values.mesoappendixDivision.value),
      block: false,
    });
  }

  if (values.stumpControl.present) {
    definitivePhase.push({
      text: sentenceWithValue("The appendiceal stump was controlled with ", values.stumpControl.value),
      block: false,
    });
  }

  const specimenRemovalSentence = buildSpecimenRemovalSentence(values);
  if (specimenRemovalSentence) {
    definitivePhase.push({ text: specimenRemovalSentence, block: false });
  }

  const washoutSentence = buildWashoutSentence(values);
  if (washoutSentence) {
    definitivePhase.push({ text: washoutSentence, block: false });
  }

  const haemostasisSentence = buildHaemostasisSentence(values);
  if (haemostasisSentence) {
    definitivePhase.push({ text: haemostasisSentence, block: false });
  }

  const drainSentence = buildDrainSentence(values);
  if (drainSentence) {
    definitivePhase.push({ text: drainSentence, block: false });
  }

  segments.push(...definitivePhase);

  const additionalDetailsSentence = buildAdditionalOperativeDetailsSentence(values);
  if (additionalDetailsSentence) {
    segments.push({ text: additionalDetailsSentence, block: true });
  }

  return joinOperationSegments(segments);
}

function buildCholecystectomyOperationText(values) {
  const segments = [];

  if (values.entryTechnique.present) {
    segments.push({
      text: sentenceWithValue("Laparoscopic entry was obtained using ", values.entryTechnique.value),
      block: false,
    });
  } else {
    segments.push({ text: "Laparoscopic entry was obtained.", block: false });
  }

  segments.push({ text: "The gallbladder was identified and assessed.", block: false });

  if (values.convertedToOpen) {
    const conversionSentence = buildConversionSentence(values);
    if (conversionSentence) {
      segments.push({ text: conversionSentence, block: false });
    }

    segments.push({ text: "A laparotomy was performed.", block: false });
  }

  const gallbladderAppearanceSentence = buildGallbladderAppearanceSentence(values);
  if (gallbladderAppearanceSentence) {
    segments.push({ text: gallbladderAppearanceSentence, block: false });
  }

  const criticalViewSentence = buildCriticalViewSentence(values);
  if (criticalViewSentence) {
    segments.push({ text: criticalViewSentence, block: false });
  }

  if (values.cysticDuctControl.present) {
    segments.push({
      text: sentenceWithValue("The cystic duct was controlled with ", values.cysticDuctControl.value),
      block: false,
    });
  }

  if (values.cysticArteryControl.present) {
    segments.push({
      text: sentenceWithValue("The cystic artery was controlled with ", values.cysticArteryControl.value),
      block: false,
    });
  }

  segments.push({ text: "The gallbladder was dissected from the liver bed.", block: false });

  const bileSpillageSentence = buildBileSpillageSentence(values);
  if (bileSpillageSentence) {
    segments.push({ text: bileSpillageSentence, block: false });
  }

  const stoneSpillageSentence = buildStoneSpillageSentence(values);
  if (stoneSpillageSentence) {
    segments.push({ text: stoneSpillageSentence, block: false });
  }

  const cholangiogramSentence = buildCholangiogramSentence(values);
  if (cholangiogramSentence) {
    segments.push({ text: cholangiogramSentence, block: false });
  }

  const gallbladderRetrievalSentence = buildGallbladderRetrievalSentence(values);
  if (gallbladderRetrievalSentence) {
    segments.push({ text: gallbladderRetrievalSentence, block: false });
  }

  const haemostasisSentence = buildHaemostasisSentence(values);
  if (haemostasisSentence) {
    segments.push({ text: haemostasisSentence, block: false });
  }

  const drainSentence = buildDrainSentence(values);
  if (drainSentence) {
    segments.push({ text: drainSentence, block: false });
  }

  const additionalDetailsSentence = buildAdditionalOperativeDetailsSentence(values);
  if (additionalDetailsSentence) {
    segments.push({ text: additionalDetailsSentence, block: true });
  }

  return joinOperationSegments(segments);
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

  if (!values.complications.trimmed || normalisedComplications === "nil" || normalisedComplications === "none") {
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
  return `Operation: ${procedure.buildOperationText(values)}`;
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

// Procedure configs keep procedure-specific rules in one place so additional
// operations can reuse the same collection, visibility, validation, and output engine.
const PROCEDURES = {
  lapAppendicectomy: {
    id: "lapAppendicectomy",
    title: "Laparoscopic appendicectomy",
    hint: "Appendicectomy-specific steps include perforation, contamination, mesoappendix division, stump control, and washout.",
    validationHint: "Warnings are advisory. Indication, findings, and stump control method are required before generation. Washout is required when contamination is present, and a reason is required if the procedure is converted to open.",
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
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
      (values) => (!values.stumpControl.present ? "stump control method" : ""),
      (values) => (values.contaminationPresent === "yes" && !values.washoutPerformed ? "washout performed" : ""),
      (values) => (values.convertedToOpen && !values.conversionReason.trimmed ? "reason for conversion" : ""),
    ],
    outputSections: buildStandardOutputSections(),
    buildOperationText: buildAppendicectomyOperationText,
  },
  lapCholecystectomy: {
    id: "lapCholecystectomy",
    title: "Laparoscopic cholecystectomy",
    hint: "Cholecystectomy-specific steps include critical view, cystic duct and artery control, spillage, cholangiogram, and gallbladder retrieval.",
    validationHint: "Warnings are advisory. Indication, findings, cystic duct control, and cystic artery control are required before generation. A reason is required if the procedure is converted to open.",
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
    ],
    validationRules: [
      (values) => (!values.indication.trimmed ? "indication" : ""),
      (values) => (!values.findings.trimmed ? "findings" : ""),
      (values) => (!values.cysticDuctControl.present ? "cystic duct control method" : ""),
      (values) => (!values.cysticArteryControl.present ? "cystic artery control method" : ""),
      (values) => (values.convertedToOpen && !values.conversionReason.trimmed ? "reason for conversion" : ""),
    ],
    outputSections: buildStandardOutputSections(),
    buildOperationText: buildCholecystectomyOperationText,
  },
};

function getActiveProcedure() {
  return PROCEDURES[APP_STATE.activeProcedureId];
}

function collectValues(procedure = getActiveProcedure()) {
  return Object.entries(procedure.fields).reduce((values, [fieldName, definition]) => {
    values[fieldName] = readFieldValue(definition);
    return values;
  }, {});
}

function buildWarnings(values, procedure = getActiveProcedure()) {
  return runRuleSet(values, procedure.warningRules);
}

function validate(values, procedure = getActiveProcedure()) {
  return runRuleSet(values, procedure.validationRules);
}

function buildParagraphs(values, procedure = getActiveProcedure()) {
  return procedure.outputSections
    .map((section) => section.build(values, procedure))
    .filter(Boolean);
}

function renderWarnings(warnings) {
  if (!warnings.length) {
    DOM.warningBox.hidden = true;
    DOM.warningList.innerHTML = "";
    return;
  }

  DOM.warningList.innerHTML = warnings
    .map((warning) => `<li>${escapeHtml(warning)}</li>`)
    .join("");
  DOM.warningBox.hidden = false;
}

function renderNote(paragraphs) {
  DOM.noteOutput.classList.remove("note-output-empty");
  DOM.noteOutput.innerHTML = paragraphs
    .map((paragraph) => `<p class="note-paragraph">${escapeHtml(paragraph)}</p>`)
    .join("");
}

function generateNote(values, procedure = getActiveProcedure()) {
  const paragraphs = buildParagraphs(values, procedure);
  APP_STATE.latestNoteText = paragraphs.join("\n\n");
  return paragraphs;
}

function clearValidation() {
  DOM.validationMessage.hidden = true;
  DOM.validationMessage.textContent = "";
}

function showValidation(missing) {
  DOM.validationMessage.textContent = `Please complete the required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`;
  DOM.validationMessage.hidden = false;
}

function showEmptyNoteState() {
  DOM.noteOutput.classList.add("note-output-empty");
  DOM.noteOutput.innerHTML = "<p>Your operative note will appear here after generation.</p>";
}

function syncProcedureUi(procedure = getActiveProcedure()) {
  DOM.procedureTitle.textContent = procedure.title;
  DOM.procedureHint.textContent = procedure.hint;
  DOM.validationHint.textContent = procedure.validationHint;

  DOM.procedureSections.forEach((section) => {
    section.hidden = section.dataset.procedureSection !== procedure.id;
  });
}

function syncConditionalFields(procedure = getActiveProcedure()) {
  const values = collectValues(procedure);
  applyVisibilityRules(procedure, values);
}

function handleFormState() {
  APP_STATE.activeProcedureId = DOM.procedureSelect.value;
  const procedure = getActiveProcedure();
  syncProcedureUi(procedure);
  syncConditionalFields();

  const values = collectValues(procedure);
  renderWarnings(buildWarnings(values, procedure));

  if (!validate(values, procedure).length) {
    clearValidation();
  }
}

DOM.form.addEventListener("submit", (event) => {
  event.preventDefault();

  DOM.copyFeedback.textContent = "";
  APP_STATE.activeProcedureId = DOM.procedureSelect.value;
  const procedure = getActiveProcedure();
  syncProcedureUi(procedure);
  syncConditionalFields(procedure);

  const values = collectValues(procedure);
  const missing = validate(values, procedure);
  renderWarnings(buildWarnings(values, procedure));

  if (missing.length) {
    APP_STATE.latestNoteText = "";
    DOM.copyButton.disabled = true;
    showValidation(missing);
    showEmptyNoteState();
    return;
  }

  clearValidation();
  renderNote(generateNote(values, procedure));
  DOM.copyButton.disabled = false;
});

DOM.form.addEventListener("input", handleFormState);
DOM.form.addEventListener("change", handleFormState);

DOM.procedureSelect.addEventListener("change", () => {
  APP_STATE.activeProcedureId = DOM.procedureSelect.value;
  APP_STATE.latestNoteText = "";
  DOM.copyButton.disabled = true;
  DOM.copyFeedback.textContent = "";
  showEmptyNoteState();
});

DOM.addTeamMemberButton.addEventListener("click", () => {
  DOM.teamMembersList.appendChild(createTeamMemberRow());
});

DOM.teamMembersList.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  if (!event.target.classList.contains("remove-team-member")) {
    return;
  }

  const row = event.target.closest(".team-member-row");
  if (!row) {
    return;
  }

  row.remove();
});

syncProcedureUi();
syncConditionalFields();
renderWarnings(buildWarnings(collectValues()));

DOM.copyButton.addEventListener("click", async () => {
  if (!APP_STATE.latestNoteText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(APP_STATE.latestNoteText);
    DOM.copyFeedback.textContent = "Operative note copied to clipboard.";
  } catch (error) {
    DOM.copyFeedback.textContent = "Clipboard copy failed. Please copy the note manually.";
  }
});
