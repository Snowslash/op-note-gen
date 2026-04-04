const form = document.getElementById("note-form");
const validationMessage = document.getElementById("validationMessage");
const warningBox = document.getElementById("warningBox");
const warningList = document.getElementById("warningList");
const noteOutput = document.getElementById("noteOutput");
const copyButton = document.getElementById("copyButton");
const copyFeedback = document.getElementById("copyFeedback");
const addTeamMemberButton = document.getElementById("addTeamMemberButton");
const teamMembersList = document.getElementById("teamMembersList");

let latestNoteText = "";
let teamMemberIdCounter = 0;

function getRawValue(id) {
  return document.getElementById(id).value;
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
  return document.getElementById(id).value;
}

function getCheckboxValue(id) {
  return document.getElementById(id).checked;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setFieldVisibility(id, visible) {
  const element = document.getElementById(id);
  element.hidden = !visible;
  element.style.display = visible ? "" : "none";
}

function setConditionalFieldState(fieldId, visible, inputId) {
  setFieldVisibility(fieldId, visible);

  if (!visible && inputId) {
    document.getElementById(inputId).value = "";
  }
}

function resolveSelectOrCustom(selectId, customId) {
  const selected = getSelectValue(selectId);

  if (!selected) {
    return {
      value: "",
      present: false,
    };
  }

  if (selected !== "Custom / other") {
    return {
      value: selected,
      present: true,
    };
  }

  const custom = getTextData(customId);

  return {
    value: custom.trimmed ? custom.raw : "",
    present: Boolean(custom.trimmed),
  };
}

function syncConditionalFields() {
  const drainEnabled = getRadioValue("drainStatus") === "yes";
  const contaminationEnabled = getRadioValue("contaminationPresent") === "yes";
  const fascialClosureEnabled = getRadioValue("fascialClosurePerformed") === "yes";
  const drainCustomEnabled = drainEnabled && getSelectValue("drainLocation") === "Custom / other";
  const entryTechniqueCustomEnabled = getSelectValue("entryTechnique") === "Custom / other";
  const mesoappendixCustomEnabled = getSelectValue("mesoappendixDivision") === "Custom / other";
  const stumpControlCustomEnabled = getSelectValue("stumpControl") === "Custom / other";
  const conversionEnabled = getCheckboxValue("convertedToOpen");

  setFieldVisibility("drainLocationField", drainEnabled);
  setConditionalFieldState("drainLocationCustomField", drainCustomEnabled, "drainLocationCustom");
  setConditionalFieldState("entryTechniqueCustomField", entryTechniqueCustomEnabled, "entryTechniqueCustom");
  setFieldVisibility("contaminationDescriptionField", contaminationEnabled);
  setFieldVisibility("fascialSutureField", fascialClosureEnabled);
  setConditionalFieldState("mesoappendixDivisionCustomField", mesoappendixCustomEnabled, "mesoappendixDivisionCustom");
  setConditionalFieldState("stumpControlCustomField", stumpControlCustomEnabled, "stumpControlCustom");
  setConditionalFieldState("conversionReasonField", conversionEnabled, "conversionReason");
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

function buildWarnings(values) {
  const warnings = [];

  if (!values.complications.trimmed) {
    warnings.push("No complications entered. Confirm that there were no immediate complications.");
  }

  if (!values.specimen.trimmed) {
    warnings.push("No specimen entered. Confirm whether there was no specimen or add details.");
  }

  if (!values.drainStatus) {
    warnings.push("No drain status entered. Confirm whether no drain was placed or add details.");
  } else if (values.drainStatus === "yes" && !values.drainLocation.present) {
    warnings.push("Drain marked as yes without a location. Add drain location if available.");
  }

  return warnings;
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

function buildOperationParagraph(values) {
  const segments = [];
  const laparoscopicPhase = [];
  const definitivePhase = [];

  if (values.entryTechnique.present) {
    laparoscopicPhase.push({ text: sentenceWithValue("Laparoscopic entry was obtained using ", values.entryTechnique.value), block: false });
  } else {
    laparoscopicPhase.push({ text: "Laparoscopic entry was obtained.", block: false });
  }

  laparoscopicPhase.push({ text: "The appendix was identified and assessed.", block: false });

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
    definitivePhase.push({ text: sentenceWithValue("The mesoappendix was divided using ", values.mesoappendixDivision.value), block: false });
  }

  if (values.stumpControl.present) {
    definitivePhase.push({ text: sentenceWithValue("The appendiceal stump was controlled with ", values.stumpControl.value), block: false });
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
  const normalisedComplications = values.complications.trimmed.toLowerCase().replace(/[.!]+$/, "");

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

function createTeamMemberRow(role = "Assistant", name = "") {
  const row = document.createElement("div");
  row.className = "team-member-row";
  row.dataset.teamMemberId = String(teamMemberIdCounter);
  teamMemberIdCounter += 1;

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
  return Array.from(teamMembersList.querySelectorAll(".team-member-row"))
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

function buildAdditionalTeamMembersText(values) {
  if (!values.additionalTeamMembers.length) {
    return "";
  }

  return values.additionalTeamMembers
    .map((member) => `${member.role} ${member.name}`)
    .join("; ");
}

function collectValues() {
  return {
    surgeon: getTextData("surgeon"),
    assistant: getTextData("assistant"),
    supervisingConsultant: getTextData("supervisingConsultant"),
    anaesthetic: getSelectValue("anaesthetic"),
    anaesthetist: getTextData("anaesthetist"),
    indication: getTextData("indication"),
    findings: getTextData("findings"),
    specimen: getTextData("specimen"),
    drainStatus: getRadioValue("drainStatus"),
    drainLocation: resolveSelectOrCustom("drainLocation", "drainLocationCustom"),
    bloodLoss: getTextData("bloodLoss"),
    complications: getTextData("complications"),
    fascialClosurePerformed: getRadioValue("fascialClosurePerformed"),
    fascialSutureMaterial: getTextData("fascialSutureMaterial"),
    skinClosureMethod: getTextData("skinClosureMethod"),
    postOpPlan: getTextData("postOpPlan"),
    entryTechnique: resolveSelectOrCustom("entryTechnique", "entryTechniqueCustom"),
    portsUsed: getTextData("portsUsed"),
    perforation: getRadioValue("perforation"),
    contaminationPresent: getRadioValue("contaminationPresent"),
    contaminationDescription: getTextData("contaminationDescription"),
    mesoappendixDivision: resolveSelectOrCustom("mesoappendixDivision", "mesoappendixDivisionCustom"),
    stumpControl: resolveSelectOrCustom("stumpControl", "stumpControlCustom"),
    specimenRemovedInBag: getRadioValue("specimenRemovedInBag"),
    washoutPerformed: getRadioValue("washoutPerformed"),
    haemostasisConfirmed: getRadioValue("haemostasisConfirmed"),
    convertedToOpen: getCheckboxValue("convertedToOpen"),
    conversionReason: getTextData("conversionReason"),
    additionalOperativeDetails: getTextData("additionalOperativeDetails"),
    additionalTeamMembers: collectAdditionalTeamMembers(),
  };
}

function renderWarnings(warnings) {
  if (!warnings.length) {
    warningBox.hidden = true;
    warningList.innerHTML = "";
    return;
  }

  warningList.innerHTML = warnings
    .map((warning) => `<li>${escapeHtml(warning)}</li>`)
    .join("");
  warningBox.hidden = false;
}

function renderNote(paragraphs) {
  noteOutput.classList.remove("note-output-empty");
  noteOutput.innerHTML = paragraphs
    .map((paragraph) => `<p class="note-paragraph">${escapeHtml(paragraph)}</p>`)
    .join("");
}

function generateNote(values) {
  const surgeonValue = values.surgeon.trimmed ? values.surgeon.raw : "not specified";
  const assistantValue = values.assistant.trimmed ? values.assistant.raw : "not specified";
  const additionalTeamMembersText = buildAdditionalTeamMembersText(values);
  const bloodLossNormalised = values.bloodLoss.trimmed.toLowerCase();
  const paragraphs = [
    "Procedure: Laparoscopic appendicectomy",
    `Surgeon / Assistant: Surgeon ${surgeonValue}; Assistant ${assistantValue}`,
    additionalTeamMembersText ? `Additional team members: ${additionalTeamMembersText}` : "",
    values.supervisingConsultant.trimmed ? `Supervising consultant: ${values.supervisingConsultant.raw}` : "",
    `Anaesthetic: ${formatInlineValue(values.anaesthetic)}`,
    values.anaesthetist.trimmed ? `Anaesthetist: ${values.anaesthetist.raw}` : "",
    formatBlock("Indication", values.indication),
    formatBlock("Findings", values.findings),
    values.portsUsed.trimmed ? formatBlock("Ports", values.portsUsed) : "",
    `Operation: ${buildOperationParagraph(values)}`,
    `Specimen: ${formatInlineValue(values.specimen.trimmed ? values.specimen.raw : "")}`,
    `Drain: ${buildDrainText(values)}`,
    values.bloodLoss.trimmed && bloodLossNormalised !== "not specified"
      ? `Estimated blood loss: ${values.bloodLoss.raw}`
      : "",
    `Complications: ${buildComplicationsText(values)}`,
    `Closure: ${buildClosureText(values)}`,
    formatBlock("Post-operative plan", values.postOpPlan),
  ].filter(Boolean);

  latestNoteText = paragraphs.join("\n\n");
  return paragraphs;
}

function validate(values) {
  const missing = [];

  if (!values.indication.trimmed) {
    missing.push("indication");
  }

  if (!values.findings.trimmed) {
    missing.push("findings");
  }

  if (!values.stumpControl.present) {
    missing.push("stump control method");
  }

  if (values.contaminationPresent === "yes" && !values.washoutPerformed) {
    missing.push("washout performed");
  }

  if (values.convertedToOpen && !values.conversionReason.trimmed) {
    missing.push("reason for conversion");
  }

  return missing;
}

function clearValidation() {
  validationMessage.hidden = true;
  validationMessage.textContent = "";
}

function showValidation(missing) {
  validationMessage.textContent = `Please complete the required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`;
  validationMessage.hidden = false;
}

function handleFormState() {
  syncConditionalFields();

  const values = collectValues();
  renderWarnings(buildWarnings(values));

  if (!validate(values).length) {
    clearValidation();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  copyFeedback.textContent = "";
  syncConditionalFields();

  const values = collectValues();
  const missing = validate(values);
  renderWarnings(buildWarnings(values));

  if (missing.length) {
    latestNoteText = "";
    copyButton.disabled = true;
    showValidation(missing);
    noteOutput.classList.add("note-output-empty");
    noteOutput.innerHTML = "<p>Your operative note will appear here after generation.</p>";
    return;
  }

  clearValidation();
  renderNote(generateNote(values));
  copyButton.disabled = false;
});

form.addEventListener("input", handleFormState);
form.addEventListener("change", handleFormState);

addTeamMemberButton.addEventListener("click", () => {
  teamMembersList.appendChild(createTeamMemberRow());
});

teamMembersList.addEventListener("click", (event) => {
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

syncConditionalFields();
renderWarnings(buildWarnings(collectValues()));

copyButton.addEventListener("click", async () => {
  if (!latestNoteText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(latestNoteText);
    copyFeedback.textContent = "Operative note copied to clipboard.";
  } catch (error) {
    copyFeedback.textContent = "Clipboard copy failed. Please copy the note manually.";
  }
});
