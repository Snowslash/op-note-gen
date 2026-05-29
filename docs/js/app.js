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

function syncProcedureChoiceState(procedure = getActiveProcedure()) {
  DOM.procedureChoices.forEach((choice) => {
    const isActive = choice.dataset.procedureChoice === procedure.id;
    choice.classList.toggle("procedure-choice-active", isActive);
    choice.setAttribute("aria-pressed", String(isActive));
  });
}

function getProcedureChoiceSearchText(choice) {
  const procedure = PROCEDURES[choice.dataset.procedureChoice];
  return [
    procedure ? procedure.title : "",
    procedure ? procedure.hint : "",
    choice.textContent || "",
  ].join(" ").toLowerCase();
}

function filterProcedureChoices() {
  const query = DOM.procedureSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  DOM.procedureChoices.forEach((choice) => {
    const isVisible = !query || getProcedureChoiceSearchText(choice).includes(query);
    choice.hidden = !isVisible;
    if (isVisible) {
      visibleCount += 1;
    }
  });

  DOM.procedureSearchStatus.textContent = `${visibleCount} procedure${visibleCount === 1 ? "" : "s"} shown`;
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
  syncProcedureChoiceState(procedure);

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

function selectProcedure(procedureId) {
  if (!PROCEDURES[procedureId]) {
    return;
  }

  DOM.procedureSelect.value = procedureId;
  APP_STATE.activeProcedureId = procedureId;
  const procedure = getActiveProcedure();
  APP_STATE.latestNoteText = "";
  DOM.copyButton.disabled = true;
  DOM.copyFeedback.textContent = "";
  syncProcedureUi(procedure);
  syncConditionalFields(procedure);
  renderWarnings(buildWarnings(collectValues(procedure), procedure));
  clearValidation();
  showEmptyNoteState();
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
  selectProcedure(DOM.procedureSelect.value);
});

DOM.procedureSearch.addEventListener("input", filterProcedureChoices);

DOM.procedureChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    selectProcedure(choice.dataset.procedureChoice);
  });
});

DOM.themeToggle.addEventListener("click", toggleTheme);

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

initialiseTheme();
autofillOperationDateTime();
syncProcedureUi();
syncConditionalFields();
filterProcedureChoices();
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
