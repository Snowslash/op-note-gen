const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ROOT, createFakeApp, generateNote } = require("./helpers/v1-browser-harness");

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

function testProcedureChoiceLabelsUseFullOperationNames() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");

  assert.ok(html.includes('<span class="procedure-choice-title">Laparoscopic appendicectomy</span>'), "Expected appendicectomy card heading to avoid abbreviation.");
  assert.ok(html.includes('<span class="procedure-choice-title">Laparoscopic cholecystectomy</span>'), "Expected cholecystectomy card heading to avoid abbreviation.");
  assert.ok(html.includes('<span class="procedure-choice-title">Diagnostic laparoscopy</span>'), "Expected diagnostic laparoscopy card heading to avoid abbreviation.");
  assert.ok(html.includes('<span class="procedure-choice-title">Incision and drainage abscess</span>'), "Expected incision and drainage card heading to avoid abbreviation.");
  assert.ok(html.includes('data-procedure-choice="lapCholecystectomy">\n          <span class="procedure-choice-title">Laparoscopic cholecystectomy</span>\n          <span class="procedure-choice-meta">Emergency general surgery</span>'), "Expected cholecystectomy card subheading to be emergency general surgery.");
  assert.ok(!html.includes('>Lap appendix<'), "Expected no abbreviated appendicectomy card heading.");
  assert.ok(!html.includes('>Lap chole<'), "Expected no abbreviated cholecystectomy card heading.");
  assert.ok(!html.includes('>Diagnostic lap<'), "Expected no abbreviated diagnostic laparoscopy card heading.");
  assert.ok(!html.includes('>I&D abscess<'), "Expected no abbreviated incision and drainage card heading.");
  assert.ok(!html.includes('>Gallbladder<'), "Expected cholecystectomy card not to use gallbladder subheading.");
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
    html.includes('styles.css?v=20260709-burgundy1'),
    "Expected app page to request the current cache-busted stylesheet containing the burgundy visual-language rollout.",
  );
  assert.ok(
    html.includes('<html lang="en" data-theme="light">'),
    "Expected app page to render the light Open Design theme before JavaScript runs.",
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
      antibioticProphylaxis: "Co-amoxiclav given at induction",
      dvtProphylaxis: "TED stockings and LMWH as per local protocol",
      postOpPlan: "Ward care, oral analgesia and discharge when tolerating diet",
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
  assertIncludes(note, "Post-operative plan:\nAntibiotic prophylaxis: Co-amoxiclav given at induction\nDVT prophylaxis: TED stockings and LMWH as per local protocol\nPost-operative care instructions: Ward care, oral analgesia and discharge when tolerating diet");
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


function testOutputModesUseExplicitPlanContentOnly() {
  const context = createFakeApp({
    values: {
      procedureSelect: "lapAppendicectomy",
      indication: "Acute appendicitis",
      findings: "Inflamed appendix",
      anaesthetic: "GA",
      stumpControl: "Endoloops",
      entryTechnique: "Hasson",
      postOpPlan: "Ward care and oral analgesia",
    },
    radios: {
      drainStatus: "no",
      perforation: "no",
      contaminationPresent: "no",
      specimenRemovedInBag: "yes",
      washoutPerformed: "no",
      haemostasisConfirmed: "yes",
    },
  });

  const postOp = vm.runInContext(
    'DOM.outputMode.value = "postOp"; generateNote(collectValues(), getActiveProcedure()).join("\\n\\n")',
    context,
  );

  assertIncludes(postOp, "Procedure: Laparoscopic appendicectomy");
  assertIncludes(postOp, "Care instructions: Ward care and oral analgesia");
  assert.ok(!postOp.includes("Post-operative care instructions:"));
  assert.ok(!postOp.includes("Antibiotic prophylaxis: not specified"));
  assert.ok(!postOp.includes("DVT prophylaxis: not specified"));

  const handover = vm.runInContext(
    'DOM.outputMode.value = "handover"; generateNote(collectValues(), getActiveProcedure()).join("\\n\\n")',
    context,
  );

  assertIncludes(handover, "Findings: Inflamed appendix");
  assertIncludes(handover, "Care instructions: Ward care and oral analgesia");
  assert.ok(!handover.includes("Post-operative care instructions:"));
  assert.ok(!handover.includes("Complications: not specified"));
}

function testStaleDraftAndReviewGateControlCopyState() {
  const context = createFakeApp({
    values: {
      procedureSelect: "lapAppendicectomy",
      indication: "Acute appendicitis",
      findings: "Inflamed appendix",
      anaesthetic: "GA",
      stumpControl: "Endoloops",
      entryTechnique: "Hasson",
    },
    radios: {
      drainStatus: "no",
      perforation: "no",
      contaminationPresent: "no",
      specimenRemovedInBag: "yes",
      washoutPerformed: "no",
      haemostasisConfirmed: "yes",
    },
  });

  vm.runInContext('generateNote(collectValues(), getActiveProcedure())', context);
  assert.strictEqual(vm.runInContext('DOM.copyButton.disabled', context), true);

  vm.runInContext('DOM.reviewBeforeCopy.checked = true; APP_STATE.reviewConfirmed = true; syncCopyState()', context);
  assert.strictEqual(vm.runInContext('DOM.copyButton.disabled', context), false);

  vm.runInContext('DOM.reviewBeforeCopy.checked = false; APP_STATE.reviewConfirmed = false; syncCopyState()', context);
  assert.strictEqual(vm.runInContext('DOM.copyButton.disabled', context), true);

  vm.runInContext('DOM.reviewBeforeCopy.checked = true; APP_STATE.reviewConfirmed = true; syncCopyState(); invalidateGeneratedNote()', context);
  assert.strictEqual(vm.runInContext('APP_STATE.noteFresh', context), false);
  assert.strictEqual(vm.runInContext('DOM.copyButton.disabled', context), true);
  assert.strictEqual(vm.runInContext('DOM.staleOutputMessage.hidden', context), false);
}

function testClearNoteClearsWarningUiButPreservesInputs() {
  const context = createFakeApp({ values: { indication: "Appendicitis" } });

  vm.runInContext('DOM.warningBox.hidden = false; DOM.warningList.innerHTML = "<li>warning</li>"; APP_STATE.latestNoteText = "draft"; resetGeneratedNoteState({ clearWarningsUi: true })', context);

  assert.strictEqual(vm.runInContext('DOM.warningBox.hidden', context), true);
  assert.strictEqual(vm.runInContext('DOM.warningList.innerHTML', context), "");
  assert.strictEqual(vm.runInContext("document.getElementById('indication').value", context), "Appendicitis");
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

function testAppSafetyNoticeAndHeaderDividerArePresent() {
  const html = fs.readFileSync(path.join(ROOT, "docs/app.html"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "docs/styles.css"), "utf8");

  assert.ok(html.includes('class="app-safety-notice"'), "Expected app page to include the top safety notice box.");
  assert.ok(html.includes("Do not enter patient-identifiable information."));
  assert.ok(css.includes(".app-body .app-safety-notice"), "Expected app safety notice styling.");
  assert.ok(css.includes(".app-body .app-safety-notice {\n  width: 100%;"), "Expected app safety notice to span the page content width.");
  assert.ok(css.includes(".app-body .page-header {\n  max-width: none;"), "Expected app header divider to span the page width.");
  assert.ok(css.includes(".section-jump-nav a {\n  display: block;\n  border: 1px solid var(--border);"), "Expected jump links to render as bordered boxes.");
  assert.ok(!css.includes("var(--border-subtle)"), "Jump link borders must not depend on an undefined CSS variable.");
}

testAppendicectomyStillGenerates();
testOperationDateTimeAutofillsOnLoad();
testOpenInguinalHerniaRepairIsWiredInUiAndRegistry();
testOpenUmbilicalHerniaRepairIsWiredInUiAndRegistry();
testEmergencyLaparotomyIsWiredInUiAndRegistry();
testProcedureSelectorUsesCompactChoiceGrid();
testProcedureChoiceLabelsUseFullOperationNames();
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
testOutputModesUseExplicitPlanContentOnly();
testStaleDraftAndReviewGateControlCopyState();
testClearNoteClearsWarningUiButPreservesInputs();
testAppSafetyNoticeAndHeaderDividerArePresent();
console.log("procedure smoke tests passed");
