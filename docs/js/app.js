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
    const visibleForProcedures = section.dataset.procedureSection.split(/\s+/);
    section.hidden = !visibleForProcedures.includes(procedure.id);
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
  const procedure = getActiveProcedure();
  APP_STATE.latestNoteText = "";
  DOM.copyButton.disabled = true;
  DOM.copyFeedback.textContent = "";
  syncProcedureUi(procedure);
  syncConditionalFields(procedure);
  renderWarnings(buildWarnings(collectValues(procedure), procedure));
  clearValidation();
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

autofillOperationDateTime();
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
