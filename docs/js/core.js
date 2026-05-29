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
  operationDateTime: document.getElementById("operationDateTime"),
  themeToggle: document.getElementById("themeToggle"),
  procedureSelect: document.getElementById("procedureSelect"),
  procedureChoices: document.querySelectorAll("[data-procedure-choice]"),
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

const THEME_STORAGE_KEY = "opNoteTheme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Storage may be unavailable for local file usage; theme still applies in-memory.
  }
}

function setTheme(theme) {
  const normalisedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalisedTheme;

  if (DOM.themeToggle) {
    const isDark = normalisedTheme === "dark";
    DOM.themeToggle.setAttribute("aria-pressed", String(isDark));
    DOM.themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    DOM.themeToggle.innerHTML = isDark
      ? '<span aria-hidden="true">☀</span><span>Light</span>'
      : '<span aria-hidden="true">☾</span><span>Dark</span>';
  }

  persistTheme(normalisedTheme);
}

function initialiseTheme() {
  setTheme(getStoredTheme() || "light");
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  setTheme(currentTheme === "dark" ? "light" : "dark");
}

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

function formatInlineValue(value, fallback = "not specified") {
  return value || fallback;
}

function formatDateTimeValue(field) {
  if (!field.trimmed) {
    return "not specified";
  }

  const match = field.raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})$/);
  if (!match) {
    return field.raw.replace("T", " ");
  }

  const [, year, month, day, time] = match;
  return `${day}/${month}/${year}, ${time}`;
}

function getCurrentDateTimeLocalValue(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function autofillOperationDateTime() {
  if (!DOM.operationDateTime.value) {
    DOM.operationDateTime.value = getCurrentDateTimeLocalValue();
  }
}

function formatBlock(label, field, fallback = "not specified") {
  return `${label}:\n${field.trimmed ? field.raw : fallback}`;
}

function runRuleSet(values, rules) {
  return rules
    .map((rule) => rule(values))
    .filter(Boolean);
}

function formatTextOperationValue(field) {
  return field.trimmed ? field.raw : "not specified";
}

function formatSelectOperationValue(field) {
  return field.present ? field.value : "not specified";
}

function formatYesNoOperationValue(value) {
  if (value === "yes") {
    return "yes";
  }

  if (value === "no") {
    return "no";
  }

  return "not specified";
}

function formatAchievedOperationValue(value) {
  if (value === "yes") {
    return "achieved";
  }

  if (value === "no") {
    return "not achieved";
  }

  return "not specified";
}

function formatNoneOrPresentOperationValue(value, detailsField) {
  if (value === "yes") {
    return detailsField && detailsField.trimmed ? detailsField.raw : "present";
  }

  if (value === "no") {
    return "none";
  }

  return "not specified";
}

function formatPerformedOperationValue(value, detailsField) {
  if (value === "yes") {
    return detailsField && detailsField.trimmed ? `performed: ${detailsField.raw}` : "performed";
  }

  if (value === "no") {
    return "not performed";
  }

  return "not specified";
}

function formatDrainOperationValue(values) {
  if (values.drainStatus === "yes") {
    return values.drainLocation.present ? values.drainLocation.value : "placed, location not specified";
  }

  if (values.drainStatus === "no") {
    return "no drain placed";
  }

  return "not specified";
}

function formatConversionOperationValue(values) {
  if (!values.convertedToOpen) {
    return "no";
  }

  return values.conversionReason.trimmed ? values.conversionReason.raw : "yes, reason not specified";
}

function formatAdditionalDetailsOperationLine(values) {
  return values.additionalOperativeDetails.trimmed
    ? `Additional operative details: ${values.additionalOperativeDetails.raw}`
    : "";
}
