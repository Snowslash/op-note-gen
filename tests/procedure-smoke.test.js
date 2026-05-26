const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SCRIPT_FILES = [
  "docs/js/core.js",
  "docs/js/procedures.js",
  "docs/js/app.js",
];

class HTMLElement {}

function createFakeApp({ values = {}, radios = {}, checks = {}, teamMembers = [] } = {}) {
  const elements = new Map();

  function makeElement(id) {
    return {
      id,
      value: "",
      checked: false,
      hidden: false,
      style: {},
      textContent: "",
      innerHTML: "",
      classList: {
        add() {},
        remove() {},
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

  const html = fs.readFileSync(path.join(ROOT, "docs/index.html"), "utf8");
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

  const context = {
    console,
    HTMLElement,
    navigator: {
      clipboard: {
        writeText: async () => {},
      },
    },
    document: {
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
      skinManagement: "Left open",
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
  assertIncludes(note, "Skin management: Left open");
  assertIncludes(note, "Drain: no drain placed");
  assertIncludes(note, "Complications: No immediate complications.");
}

function testAppendicectomyStillGenerates() {
  const note = generateNote({
    values: {
      procedureSelect: "lapAppendicectomy",
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
  assertIncludes(note, "Stump control: Endoloops");
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
testIncisionAndDrainageGeneratesStructuredNote();
testBlankComplicationsAreNotInvented();
console.log("procedure smoke tests passed");
