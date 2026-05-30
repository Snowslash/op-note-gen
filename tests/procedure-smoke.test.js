const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SCRIPT_FILES = [
  "docs/js/core.js",
  "docs/js/note-formatters.js",
  "docs/js/procedures.js",
  "docs/js/app.js",
];

class HTMLElement {}

function createFakeApp({ values = {}, radios = {}, checks = {}, teamMembers = [], storedTheme = null } = {}) {
  const elements = new Map();
  const storedValues = new Map(storedTheme ? [["opNoteTheme", storedTheme]] : []);

  function makeElement(id) {
    return {
      id,
      value: "",
      checked: false,
      hidden: false,
      style: {},
      dataset: {},
      textContent: "",
      innerHTML: "",
      classList: {
        values: new Set(),
        add(className) {
          this.values.add(className);
        },
        remove(className) {
          this.values.delete(className);
        },
        contains(className) {
          return this.values.has(className);
        },
        toggle(className, force) {
          if (force) {
            this.values.add(className);
            return true;
          }
          this.values.delete(className);
          return false;
        },
      },
      setAttribute(name, value) {
        this[name] = value;
      },
      addEventListener() {},
      appendChild() {},
      querySelectorAll(selector) {
        if (id === "teamMembersList" && selector === ".team-member-row") {
          return teamMembers.map((member) => ({
            querySelector(childSelector) {
              if (childSelector === ".team-member-role") {
                return { value: member.role };
              }

              if (childSelector === ".team-member-name") {
                return { value: member.name };
              }

              return null;
            },
          }));
        }

        return [];
      },
      querySelector() {
        return null;
      },
    };
  }

  function el(id) {
    if (!elements.has(id)) {
      elements.set(id, makeElement(id));
    }

    return elements.get(id);
  }

  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) {
    el(id);
  }

  Object.entries(values).forEach(([id, value]) => {
    el(id).value = value;
  });

  Object.entries(checks).forEach(([id, value]) => {
    el(id).checked = value;
  });

  const procedureSections = Array.from(html.matchAll(/data-procedure-section="([^"]+)"/g))
    .map(([, procedureSection]) => ({
      dataset: { procedureSection },
      hidden: false,
    }));
  const procedureChoices = Array.from(html.matchAll(/data-procedure-choice="([^"]+)"/g))
    .map(([, procedureChoice]) => Object.assign(makeElement(`procedure-choice-${procedureChoice}`), {
      dataset: { procedureChoice },
    }));

  const context = {
    console,
    HTMLElement,
    localStorage: {
      getItem(key) {
        return storedValues.has(key) ? storedValues.get(key) : null;
      },
      setItem(key, value) {
        storedValues.set(key, value);
      },
    },
    navigator: {
      clipboard: {
        writeText: async () => {},
      },
    },
    document: {
      documentElement: {
        dataset: {},
      },
      getElementById: el,
      querySelector(selector) {
        const radioMatch = selector.match(/^input\[name="([^"]+)"\]:checked$/);

        if (radioMatch && radios[radioMatch[1]]) {
          return { value: radios[radioMatch[1]] };
        }

        return null;
      },
      querySelectorAll(selector) {
        if (selector === "[data-procedure-section]") {
          return procedureSections;
        }

        if (selector === "[data-procedure-choice]") {
          return procedureChoices;
        }

        return [];
      },
      createElement(tag) {
        return Object.assign(new HTMLElement(), makeElement(tag), { dataset: {} });
      },
    },
  };

  vm.createContext(context);

  SCRIPT_FILES.forEach((scriptPath) => {
    vm.runInContext(
      fs.readFileSync(path.join(ROOT, scriptPath), "utf8"),
      context,
      { filename: scriptPath },
    );
  });

  return context;
}

function generateNote(options) {
  const context = createFakeApp(options);
  return vm.runInContext(
    "APP_STATE.activeProcedureId = DOM.procedureSelect.value; generateNote(collectValues(), getActiveProcedure()).join('\\n\\n')",
    context,
  );
}

function assertIncludes(haystack, needle) {
  assert.ok(
    haystack.includes(needle),
    `Expected generated note to include:\n${needle}\n\nActual note:\n${haystack}`,
  );
}

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function testIncisionAndDrainageGeneratesStructuredNote() {
  const note = generateNote({
    values: {
      procedureSelect: "incisionAndDrainage",
      surgeon: "Dr A",
      assistant: "Dr B",
      anaesthetic: "GA",
      indication: "Right thigh abscess",
      findings: "Large subcutaneous abscess cavity with purulent fluid",
      specimen: "Pus swab for microbiology",
      incisionSite: "Right medial thigh",
      incisionType: "Cruciate incision",
      abscessContents: "Pus",
      pusSwabSent: "yes",
      portsUsed: "stale laparoscopic port text from previous procedure",
      loculationsBrokenDown: "not applicable",
      cavityIrrigated: "yes",
      packingOrDrain: "Kaltostat packing",
      skinManagement: "stale duplicate wound management from previous version",
      skinClosureMethod: "interrupted nylon",
      bloodLoss: "Minimal",
      complications: "none",
      postOpPlan: "Ward care, regular analgesia, remove packing in 24 hours and review antibiotics when cultures available",
    },
    radios: {
      drainStatus: "no",
      haemostasisConfirmed: "yes",
    },
  });

  assertIncludes(note, "Procedure: Incision and drainage of abscess");
  assertIncludes(note, "Incision site: Right medial thigh");
  assertIncludes(note, "Incision: Cruciate incision");
  assertIncludes(note, "Contents drained: Pus");
  assertIncludes(note, "Microbiology swab: sent");
  assertIncludes(note, "Loculations broken down: not applicable");
  assert.ok(
    !note.includes("Ports:"),
    `Expected I&D note not to include stale laparoscopic ports. Actual note:\n${note}`,
  );
  assertIncludes(note, "Cavity irrigation/washout: yes");
  assertIncludes(note, "Packing/drain: Kaltostat packing");
  assert.ok(
    !note.includes("Skin management:"),
    `Expected I&D note not to include duplicate skin/wound management field. Actual note:\n${note}`,
  );
  assertIncludes(note, "Closure: Skin was closed with interrupted nylon");
  assert.strictEqual(
    countOccurrences(note, "Skin"),
    1,
    `Expected I&D note to mention skin only in closure details. Actual note:\n${note}`,
  );
  assert.strictEqual(
    countOccurrences(note.toLowerCase(), "drain placed"),
    1,
    `Expected I&D note to mention drain placement once. Actual note:\n${note}`,
  );
  assertIncludes(note, "Complications: No immediate complications.");
}

function testIncisionAndDrainageUsesClosureDetailsInsteadOfDuplicateSkinManagement() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const context = createFakeApp();
  const hasSkinManagementField = vm.runInContext(
    "Object.prototype.hasOwnProperty.call(PROCEDURES.incisionAndDrainage.fields, 'skinManagement')",
    context,
  );

  assert.ok(!html.includes('id="skinManagement"'), "Expected duplicate I&D skin/wound management UI field to be removed.");
  assert.ok(!hasSkinManagementField, "Expected duplicate I&D skin/wound management config field to be removed.");
}

function testDiagnosticLaparoscopyGeneratesStructuredNote() {
  const note = generateNote({
    values: {
      procedureSelect: "diagnosticLaparoscopy",
      surgeon: "Dr A",
      assistant: "Dr B",
      anaesthetic: "GA",
      indication: "Generalised abdominal pain with CT concern for intra-abdominal sepsis",
      findings: "Turbid pelvic fluid and fibrinous adhesions in the right iliac fossa",
      portsUsed: "10 mm umbilical port, 5 mm suprapubic port, 5 mm left iliac fossa port",
      abdominalSurvey: "Small bowel run from terminal ileum proximally; no perforation identified",
      procedurePerformed: "Diagnostic laparoscopy, washout and adhesiolysis",
      washoutFluid: "Warm saline until clear",
      adhesiolysisDetails: "Blunt adhesiolysis to free small bowel loops from right iliac fossa",
      sourceControl: "No drainable collection or perforated viscus identified",
      specimen: "Peritoneal fluid for microbiology",
      bloodLoss: "Minimal",
      complications: "none",
      postOpPlan: "Ward care, IV antibiotics and review cultures",
      packingOrDrain: "stale I&D packing text from previous procedure",
      drainLocation: "Pelvis",
    },
    radios: {
      drainStatus: "yes",
      haemostasisConfirmed: "yes",
      fascialClosurePerformed: "yes",
    },
  });

  assertIncludes(note, "Procedure: Diagnostic laparoscopy +/- washout / adhesiolysis");
  assertIncludes(note, "Ports:\n10 mm umbilical port, 5 mm suprapubic port, 5 mm left iliac fossa port");
  assertIncludes(note, "Abdominal survey: Small bowel run from terminal ileum proximally; no perforation identified");
  assertIncludes(note, "Procedure performed: Diagnostic laparoscopy, washout and adhesiolysis");
  assertIncludes(note, "Washout/irrigation: Warm saline until clear");
  assertIncludes(note, "Adhesiolysis: Blunt adhesiolysis to free small bowel loops from right iliac fossa");
  assertIncludes(note, "Source control: No drainable collection or perforated viscus identified");
  assertIncludes(note, "Drain: Pelvis");
  assertIncludes(note, "Complications: No immediate complications.");
  assert.ok(
    !note.includes("Packing/drain"),
    `Expected diagnostic laparoscopy not to include stale I&D packing field. Actual note:\n${note}`,
  );
}

function testEmergencyLaparotomyGeneratesStructuredModularNote() {
  const note = generateNote({
    values: {
      procedureSelect: "emergencyLaparotomy",
      operationDateTime: "2026-05-29T23:10",
      surgeon: "Dr A",
      assistant: "Dr B",
      anaesthetic: "GA",
      indication: "Peritonitis with CT concern for perforated viscus",
      findings: "Purulent four-quadrant contamination with perforated sigmoid diverticular disease",
      laparotomyIncision: "Midline laparotomy",
      laparotomyPathology: "Perforated sigmoid diverticular disease",
      laparotomyProcedurePerformed: "Emergency laparotomy, sigmoid colectomy, end colostomy and washout",
      laparotomyBowelResectionPerformed: "yes",
      laparotomyBowelResectionDetails: "Diseased sigmoid colon resected between healthy proximal descending colon and upper rectum",
      laparotomyAnastomosisPerformed: "no",
      laparotomyStomaFormed: "yes",
      laparotomyStomaDetails: "End colostomy matured in the left iliac fossa",
      laparotomyWashoutPerformed: "yes",
      laparotomyWashoutDetails: "Warm saline washout of all quadrants until clear",
      laparotomyTemporaryClosure: "no",
      portsUsed: "stale laparoscopic ports",
      umbilicalRepairMethod: "stale hernia repair method",
      specimen: "Sigmoid colon",
      bloodLoss: "200 mL",
      complications: "none",
      skinClosureMethod: "skin clips",
      postOpPlan: "HDU, IV antibiotics, VTE prophylaxis, stoma nurse review",
    },
    radios: {
      drainStatus: "yes",
      haemostasisConfirmed: "yes",
      fascialClosurePerformed: "yes",
    },
  });

  assertIncludes(note, "Procedure: Emergency laparotomy");
  assertIncludes(note, "Date/time: 29/05/2026, 23:10");
  assertIncludes(note, "Incision: Midline laparotomy");
  assertIncludes(note, "Pathology/source: Perforated sigmoid diverticular disease");
  assertIncludes(note, "Procedure performed: Emergency laparotomy, sigmoid colectomy, end colostomy and washout");
  assertIncludes(note, "Bowel resection performed: yes");
  assertIncludes(note, "Bowel resection details: Diseased sigmoid colon resected between healthy proximal descending colon and upper rectum");
  assertIncludes(note, "Anastomosis performed: no");
  assertIncludes(note, "Stoma formed: yes");
  assertIncludes(note, "Stoma details: End colostomy matured in the left iliac fossa");
  assertIncludes(note, "Washout performed: yes");
  assertIncludes(note, "Washout details: Warm saline washout of all quadrants until clear");
  assertIncludes(note, "Temporary abdominal closure: no");
  assertIncludes(note, "Haemostasis confirmed: yes");
  assertIncludes(note, "Specimen: Sigmoid colon");
  assertIncludes(note, "Complications: No immediate complications.");
  assert.ok(!note.includes("Ports:"), `Expected emergency laparotomy note not to include stale laparoscopic ports. Actual note:\n${note}`);
  assert.ok(!note.includes("Repair method:"), `Expected emergency laparotomy note not to include stale hernia fields. Actual note:\n${note}`);
}

function testOpenUmbilicalHerniaRepairGeneratesStructuredNote() {
  const note = generateNote({
    values: {
      procedureSelect: "openUmbilicalHerniaRepair",
      operationDateTime: "2026-05-29T11:20",
      surgeon: "Dr A",
      assistant: "Dr B",
      anaesthetic: "GA",
      indication: "Symptomatic umbilical hernia",
      findings: "Umbilical hernia with viable preperitoneal fat",
      umbilicalHerniaDefectSize: "1.5 cm fascial defect",
      umbilicalHerniaContents: "Viable preperitoneal fat",
      umbilicalSacManagement: "Sac dissected and reduced",
      umbilicalRepairMethod: "Primary suture repair",
      umbilicalMeshUsed: "no",
      portsUsed: "stale laparoscopic ports",
      cordStructuresManaged: "stale inguinal cord text",
      specimen: "None",
      bloodLoss: "Minimal",
      complications: "none",
      skinClosureMethod: "subcuticular Monocryl",
      postOpPlan: "Day case discharge if criteria met, routine analgesia, avoid heavy lifting for 4-6 weeks",
    },
    radios: {
      drainStatus: "no",
      haemostasisConfirmed: "yes",
      fascialClosurePerformed: "yes",
    },
  });

  assertIncludes(note, "Procedure: Open umbilical hernia repair");
  assertIncludes(note, "Date/time: 29/05/2026, 11:20");
  assertIncludes(note, "Defect size: 1.5 cm fascial defect");
  assertIncludes(note, "Hernia contents: Viable preperitoneal fat");
  assertIncludes(note, "Sac management: Sac dissected and reduced");
  assertIncludes(note, "Repair method: Primary suture repair");
  assertIncludes(note, "Mesh used: no");
  assertIncludes(note, "Haemostasis confirmed: yes");
  assertIncludes(note, "Complications: No immediate complications.");
  assert.ok(!note.includes("Ports:"), `Expected open umbilical hernia note not to include stale laparoscopic ports. Actual note:\n${note}`);
  assert.ok(!note.includes("Cord structures:"), `Expected open umbilical hernia note not to include stale inguinal fields. Actual note:\n${note}`);
}

function testOpenInguinalHerniaRepairGeneratesStructuredNote() {
  const note = generateNote({
    values: {
      procedureSelect: "openInguinalHerniaRepair",
      operationDateTime: "2026-05-27T16:45",
      surgeon: "Dr A",
      assistant: "Dr B",
      anaesthetic: "GA",
      indication: "Symptomatic right inguinal hernia",
      findings: "Right indirect inguinal hernia with viable reducible contents",
      herniaSide: "Right",
      herniaType: "Indirect inguinal hernia",
      herniaContents: "Viable reducible omentum",
      sacManagement: "Sac dissected, opened, contents reduced, twisted and transfixed",
      meshUsed: "yes",
      meshType: "Lightweight polypropylene mesh",
      meshFixation: "Interrupted 2-0 Prolene to pubic tubercle, inguinal ligament and conjoint tendon",
      cordStructuresManaged: "Cord structures identified and protected throughout",
      ilioinguinalNerveStatus: "Identified and preserved",
      portsUsed: "stale laparoscopic port text from previous procedure",
      specimen: "Hernia sac",
      bloodLoss: "Minimal",
      complications: "none",
      skinClosureMethod: "subcuticular Monocryl and skin glue",
      postOpPlan: "Day case discharge if criteria met, routine analgesia, avoid heavy lifting for 4-6 weeks",
    },
    radios: {
      drainStatus: "no",
      haemostasisConfirmed: "yes",
      fascialClosurePerformed: "yes",
    },
  });

  assertIncludes(note, "Procedure: Open inguinal hernia repair");
  assertIncludes(note, "Date/time: 27/05/2026, 16:45");
  assertIncludes(note, "Side: Right");
  assertIncludes(note, "Hernia type: Indirect inguinal hernia");
  assertIncludes(note, "Hernia contents: Viable reducible omentum");
  assertIncludes(note, "Sac management: Sac dissected, opened, contents reduced, twisted and transfixed");
  assertIncludes(note, "Mesh used: yes");
  assertIncludes(note, "Mesh type: Lightweight polypropylene mesh");
  assertIncludes(note, "Mesh fixation: Interrupted 2-0 Prolene to pubic tubercle, inguinal ligament and conjoint tendon");
  assertIncludes(note, "Cord structures: Cord structures identified and protected throughout");
  assertIncludes(note, "Ilioinguinal nerve: Identified and preserved");
  assertIncludes(note, "Haemostasis confirmed: yes");
  assertIncludes(note, "Specimen: Hernia sac");
  assertIncludes(note, "Complications: No immediate complications.");
  assert.ok(
    !note.includes("Ports:"),
    `Expected open inguinal hernia note not to include stale laparoscopic ports. Actual note:\n${note}`,
  );
}

function testOpenInguinalHerniaRepairIsWiredInUiAndRegistry() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const context = createFakeApp();
  const hasProcedure = vm.runInContext("Boolean(PROCEDURES.openInguinalHerniaRepair)", context);

  assert.ok(html.includes('value="openInguinalHerniaRepair"'), "Expected procedure selector to include open inguinal hernia repair.");
  assert.ok(html.includes('data-procedure-section="openInguinalHerniaRepair"'), "Expected open inguinal hernia repair fields to be present in the UI.");
  assert.ok(hasProcedure, "Expected PROCEDURES.openInguinalHerniaRepair to exist.");
}

function testOpenUmbilicalHerniaRepairIsWiredInUiAndRegistry() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const context = createFakeApp();
  const hasProcedure = vm.runInContext("Boolean(PROCEDURES.openUmbilicalHerniaRepair)", context);

  assert.ok(html.includes('value="openUmbilicalHerniaRepair"'), "Expected procedure selector to include open umbilical hernia repair.");
  assert.ok(html.includes('data-procedure-choice="openUmbilicalHerniaRepair"'), "Expected compact procedure choice for open umbilical hernia repair.");
  assert.ok(html.includes('data-procedure-section="openUmbilicalHerniaRepair"'), "Expected open umbilical hernia repair fields to be present in the UI.");
  assert.ok(hasProcedure, "Expected PROCEDURES.openUmbilicalHerniaRepair to exist.");
}

function testEmergencyLaparotomyIsWiredInUiAndRegistry() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const context = createFakeApp();
  const hasProcedure = vm.runInContext("Boolean(PROCEDURES.emergencyLaparotomy)", context);

  assert.ok(html.includes('value="emergencyLaparotomy"'), "Expected procedure selector to include emergency laparotomy.");
  assert.ok(html.includes('data-procedure-choice="emergencyLaparotomy"'), "Expected compact procedure choice for emergency laparotomy.");
  assert.ok(html.includes('data-procedure-section="emergencyLaparotomy"'), "Expected emergency laparotomy fields to be present in the UI.");
  assert.ok(hasProcedure, "Expected PROCEDURES.emergencyLaparotomy to exist.");
}

function testProcedureSelectorUsesCompactChoiceGrid() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const context = createFakeApp();
  const procedureChoiceCount = vm.runInContext("DOM.procedureChoices.length", context);

  assert.ok(html.includes('class="procedure-choice-grid"'), "Expected procedure selection to use a compact choice grid.");
  assert.ok(html.includes('data-procedure-choice="lapAppendicectomy"'), "Expected procedure choice button for laparoscopic appendicectomy.");
  assert.ok(html.includes('data-procedure-choice="openUmbilicalHerniaRepair"'), "Expected procedure choice button for open umbilical hernia repair.");
  assert.ok(html.includes('data-procedure-choice="emergencyLaparotomy"'), "Expected procedure choice button for emergency laparotomy.");
  assert.strictEqual(procedureChoiceCount, 7, "Expected one compact procedure choice per supported operation.");
}

function testProcedureSearchFiltersChoiceCards() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const context = createFakeApp();

  assert.ok(html.includes('id="procedureSearch"'), "Expected procedure panel to include a search field.");

  vm.runInContext('DOM.procedureSearch.value = "inguinal"; filterProcedureChoices();', context);
  assert.strictEqual(
    vm.runInContext("JSON.stringify(DOM.procedureChoices.map((choice) => [choice.dataset.procedureChoice, choice.hidden]))", context),
    JSON.stringify([
      ["lapAppendicectomy", true],
      ["lapCholecystectomy", true],
      ["diagnosticLaparoscopy", true],
      ["incisionAndDrainage", true],
      ["openInguinalHerniaRepair", false],
      ["openUmbilicalHerniaRepair", true],
      ["emergencyLaparotomy", true],
    ]),
    "Expected procedure search to hide non-matching cards and keep the matching card visible.",
  );

  vm.runInContext('DOM.procedureSearch.value = "lap"; filterProcedureChoices();', context);
  assert.strictEqual(
    vm.runInContext("DOM.procedureSearchStatus.textContent", context),
    "4 procedures shown",
    "Expected procedure search status to report visible matches.",
  );
}

function testThemeToggleAppliesAndPersistsDarkMode() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "docs/styles.css"), "utf8");
  const context = createFakeApp();

  assert.ok(html.includes('id="themeToggle"'), "Expected a dark mode toggle button in the UI.");
  assert.ok(css.includes('[data-theme="dark"]'), "Expected dark mode CSS variables/rules.");
  assert.ok(
    css.includes('[data-theme="dark"] .app-body'),
    "Expected plain app chrome overrides to include dark-mode app-body variables.",
  );
  assert.ok(
    html.includes('styles.css?v=20260531-appnav1'),
    "Expected app page to request the cache-busted stylesheet containing the app navigation standardisation fix.",
  );
  assert.ok(
    html.includes('<html lang="en" data-theme="dark">'),
    "Expected app page to render dark mode before JavaScript runs.",
  );

  vm.runInContext('setTheme("dark")', context);
  assert.strictEqual(
    vm.runInContext("document.documentElement.dataset.theme", context),
    "dark",
    "Expected setTheme('dark') to apply the dark theme to the document element.",
  );
  assert.strictEqual(
    vm.runInContext('localStorage.getItem("opNoteTheme")', context),
    "dark",
    "Expected selected theme to be persisted.",
  );
}

function testAppendicectomyStillGenerates() {
  const note = generateNote({
    values: {
      procedureSelect: "lapAppendicectomy",
      operationDateTime: "2026-05-27T14:30",
      indication: "Acute appendicitis",
      findings: "Inflamed appendix",
      anaesthetic: "GA",
      stumpControl: "Endoloops",
      entryTechnique: "Hasson",
      specimen: "Appendix",
    },
    radios: {
      drainStatus: "no",
      perforation: "no",
      contaminationPresent: "no",
      specimenRemovedInBag: "yes",
      washoutPerformed: "no",
      haemostasisConfirmed: "yes",
      fascialClosurePerformed: "yes",
    },
  });

  assertIncludes(note, "Procedure: Laparoscopic appendicectomy");
  assertIncludes(note, "Date/time: 27/05/2026, 14:30");
  assertIncludes(note, "Stump control: Endoloops");
  assert.strictEqual(
    countOccurrences(note, "Drain:"),
    1,
    `Expected appendicectomy note to include one drain line. Actual note:\n${note}`,
  );
}

function testOperationDateTimeAutofillsOnLoad() {
  const context = createFakeApp();
  const value = vm.runInContext("DOM.operationDateTime.value", context);

  assert.match(
    value,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    `Expected operation date/time to autofill with a datetime-local value. Actual value: ${value}`,
  );
}

function testProcedureFieldDefinitionsMatchHtmlControls() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const ids = new Set(Array.from(html.matchAll(/id="([^"]+)"/g), ([, id]) => id));
  const names = new Set(Array.from(html.matchAll(/name="([^"]+)"/g), ([, name]) => name));
  const context = createFakeApp();
  const procedures = vm.runInContext("PROCEDURES", context);
  const missing = [];

  Object.entries(procedures).forEach(([procedureId, procedure]) => {
    Object.entries(procedure.fields).forEach(([fieldName, definition]) => {
      if (definition.id && !ids.has(definition.id)) {
        missing.push(`${procedureId}.${fieldName}: missing id ${definition.id}`);
      }

      if (definition.selectId && !ids.has(definition.selectId)) {
        missing.push(`${procedureId}.${fieldName}: missing selectId ${definition.selectId}`);
      }

      if (definition.customId && !ids.has(definition.customId)) {
        missing.push(`${procedureId}.${fieldName}: missing customId ${definition.customId}`);
      }

      if (definition.name && !names.has(definition.name)) {
        missing.push(`${procedureId}.${fieldName}: missing name ${definition.name}`);
      }
    });

    procedure.visibilityRules.forEach((rule) => {
      if (rule.targetId && !ids.has(rule.targetId)) {
        missing.push(`${procedureId}.visibility: missing target ${rule.targetId}`);
      }

      (rule.clearOnHide || []).forEach((id) => {
        if (!ids.has(id)) {
          missing.push(`${procedureId}.visibility: missing clearOnHide id ${id}`);
        }
      });
    });
  });

  assert.deepStrictEqual(missing, []);
}

function testBlankComplicationsAreNotInvented() {
  const note = generateNote({
    values: {
      procedureSelect: "incisionAndDrainage",
      indication: "Back abscess",
      findings: "Small abscess cavity",
      incisionSite: "Back",
    },
    radios: {
      drainStatus: "no",
    },
  });

  assertIncludes(note, "Complications: not specified");
  assert.ok(
    !note.includes("Complications: No immediate complications."),
    `Expected blank complications not to assert no immediate complications. Actual note:\n${note}`,
  );
}

testAppendicectomyStillGenerates();
testOperationDateTimeAutofillsOnLoad();
testOpenInguinalHerniaRepairIsWiredInUiAndRegistry();
testOpenUmbilicalHerniaRepairIsWiredInUiAndRegistry();
testEmergencyLaparotomyIsWiredInUiAndRegistry();
testProcedureSelectorUsesCompactChoiceGrid();
testProcedureSearchFiltersChoiceCards();
testThemeToggleAppliesAndPersistsDarkMode();
testEmergencyLaparotomyGeneratesStructuredModularNote();
testOpenUmbilicalHerniaRepairGeneratesStructuredNote();
testOpenInguinalHerniaRepairGeneratesStructuredNote();
testIncisionAndDrainageGeneratesStructuredNote();
testIncisionAndDrainageUsesClosureDetailsInsteadOfDuplicateSkinManagement();
testDiagnosticLaparoscopyGeneratesStructuredNote();
testProcedureFieldDefinitionsMatchHtmlControls();
testBlankComplicationsAreNotInvented();
console.log("procedure smoke tests passed");
