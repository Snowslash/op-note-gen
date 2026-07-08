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

function buildParagraphs(values, procedure = getActiveProcedure(), mode = DOM.outputMode.value) {
  return buildOutputParagraphs(values, procedure, mode);
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
  const paragraphs = buildParagraphs(values, procedure, DOM.outputMode.value);
  APP_STATE.latestNoteText = paragraphs.join("\n\n");
  APP_STATE.latestValues = values;
  APP_STATE.noteFresh = true;
  APP_STATE.reviewConfirmed = false;
  DOM.reviewBeforeCopy.checked = false;
  syncCopyState();
  syncStaleOutputMessage();
  return paragraphs;
}

function clearValidation() {
  DOM.validationMessage.hidden = true;
  DOM.validationMessage.textContent = "";
  DOM.form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  });
}

function clearWarnings() {
  DOM.warningBox.hidden = true;
  DOM.warningList.innerHTML = "";
}

function syncCopyState() {
  DOM.copyButton.disabled = !(APP_STATE.latestNoteText && APP_STATE.noteFresh && APP_STATE.reviewConfirmed);
}

function syncStaleOutputMessage() {
  DOM.staleOutputMessage.hidden = !(APP_STATE.latestNoteText && !APP_STATE.noteFresh);
}

function invalidateGeneratedNote(message = "Form details changed after generation. Regenerate before copying.") {
  if (!APP_STATE.latestNoteText) {
    return;
  }

  APP_STATE.noteFresh = false;
  APP_STATE.reviewConfirmed = false;
  DOM.reviewBeforeCopy.checked = false;
  DOM.copyFeedback.textContent = message;
  syncCopyState();
  syncStaleOutputMessage();
}

function resetGeneratedNoteState({ clearWarningsUi = false } = {}) {
  APP_STATE.latestNoteText = "";
  APP_STATE.latestValues = null;
  APP_STATE.noteFresh = false;
  APP_STATE.reviewConfirmed = false;
  DOM.reviewBeforeCopy.checked = false;
  DOM.copyFeedback.textContent = "";
  syncCopyState();
  syncStaleOutputMessage();
  showEmptyNoteState();

  if (clearWarningsUi) {
    clearWarnings();
  }
}

function markMissingFields(missing) {
  clearValidation();
  missing.forEach((label) => {
    const normalisedLabel = label.toLowerCase();
    Array.from(DOM.form.querySelectorAll("input, select, textarea")).some((field) => {
      const wrapper = field.closest ? field.closest(".field") : null;
      if (!wrapper || !wrapper.textContent.toLowerCase().includes(normalisedLabel)) {
        return false;
      }

      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", "validationMessage");
      return true;
    });
  });
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
  markMissingFields(missing);
}

function showEmptyNoteState() {
  DOM.noteOutput.classList.add("note-output-empty");
  DOM.noteOutput.innerHTML = "<p>Your operation note will appear here after generation.</p>";
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

function handleFormState(event) {
  if (event && (event.target === DOM.reviewBeforeCopy || event.target === DOM.outputMode)) {
    return;
  }

  invalidateGeneratedNote();
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
  resetGeneratedNoteState();
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
    resetGeneratedNoteState();
    showValidation(missing);
    return;
  }

  clearValidation();
  renderNote(generateNote(values, procedure));
  DOM.copyFeedback.textContent = "Draft generated. Review it before copying.";
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
  invalidateGeneratedNote();
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
  invalidateGeneratedNote();
});

initialiseTheme();
autofillOperationDateTime();
syncProcedureUi();
syncConditionalFields();
filterProcedureChoices();
renderWarnings(buildWarnings(collectValues()));

DOM.outputMode.addEventListener("change", () => {
  if (!APP_STATE.noteFresh) {
    invalidateGeneratedNote("Output mode changed. Regenerate before copying.");
    return;
  }

  const procedure = getActiveProcedure();
  const values = collectValues(procedure);
  renderNote(generateNote(values, procedure));
  DOM.copyFeedback.textContent = "Output mode changed. Review this draft before copying.";
});

DOM.reviewBeforeCopy.addEventListener("change", () => {
  APP_STATE.reviewConfirmed = DOM.reviewBeforeCopy.checked;
  syncCopyState();
  DOM.copyFeedback.textContent = APP_STATE.reviewConfirmed
    ? "Review confirmed. Copy is now available."
    : "Review confirmation removed. Copy is disabled.";
});

DOM.clearNoteButton.addEventListener("click", () => {
  resetGeneratedNoteState({ clearWarningsUi: true });
  clearValidation();
});

DOM.clearFormButton.addEventListener("click", () => {
  DOM.form.reset();
  DOM.teamMembersList.innerHTML = "";
  APP_STATE.teamMemberIdCounter = 0;
  autofillOperationDateTime();
  APP_STATE.activeProcedureId = DOM.procedureSelect.value;
  syncProcedureUi();
  syncConditionalFields();
  clearValidation();
  clearWarnings();
  resetGeneratedNoteState();
});

DOM.copyButton.addEventListener("click", async () => {
  if (!APP_STATE.latestNoteText || !APP_STATE.noteFresh || !APP_STATE.reviewConfirmed) {
    DOM.copyFeedback.textContent = "Review the current generated draft before copying.";
    syncCopyState();
    return;
  }

  try {
    await navigator.clipboard.writeText(APP_STATE.latestNoteText);
    DOM.copyFeedback.textContent = "Operation note copied to clipboard.";
  } catch (error) {
    DOM.copyFeedback.textContent = "Clipboard copy failed. Please copy the note manually.";
  }
});
